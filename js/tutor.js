/* ============================================================
   js/tutor.js — 線上小老師（AI 家教．選用功能）

   設計原則（跟整站一致）：
   1. 沒填 token 就完全不碰網路，整站維持純離線、file:// 可直接開。
   2. 傳統 IIFE + 全域變數，無模組、無 build step。
   3. 模型輸出一律用 textContent，絕不用 innerHTML。
   4. storage 存取一律包 try（Safari 私密模式會丟例外）。
   5. token 預設只存 sessionStorage，家長主動勾「記住」才寫 localStorage。

   三家服務都實測過（2026-09-06）：
   - Groq   chat  qwen/qwen3.8-27b   CORS *，reasoning_format:'hidden' 可壓掉思考
   - MiniMax chat MiniMax-M3         CORS *，一定要 thinking:{type:'disabled'}，
                                     不加的話 <think>…</think> 會直接混進 content
   - Groq   STT   whisper-large-v3-turbo  CORS *（含 401 回應），
                                     中文要給繁體引導 prompt，否則吐簡體
   ============================================================ */

var Tutor = (function () {
  'use strict';

  var el = Kit.el;

  /* ---------------- 供應商 ----------------
     兩家都是 OpenAI 相容的 /chat/completions，所以呼叫程式只有一份。
     extra 是各家壓掉「思考過程」的參數——這些都是 reasoning 模型，
     不壓的話小朋友會看到一大段自言自語。 */
  var PROVIDERS = {
    groq: {
      label: 'Groq（免費額度，條款明訂不拿去訓練）',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'qwen/qwen3.8-27b',
      keyHint: 'console.groq.com 申請，開頭是 gsk_…',
      extra: { reasoning_format: 'hidden' }
    },
    minimax: {
      label: 'MiniMax（訂閱方案，中文語感較好）',
      url: 'https://api.minimax.io/v1/chat/completions',
      model: 'MiniMax-M3',
      keyHint: 'platform.minimax.io 申請，開頭是 sk-…',
      extra: { thinking: { type: 'disabled' } }
    }
  };

  /* 語音辨識固定走 Groq，跟聊天選哪一家無關 */
  var STT = {
    url: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'whisper-large-v3-turbo',
    /* whisper 對中文預設輸出簡體，靠這句引導轉成繁體。
       這裡只能放「描述性」的句子——放範例詞彙反而會把標點吃掉。 */
    zhPrompt: '以下是臺灣國小學生的提問，請用臺灣繁體中文轉寫。'
  };

  /* ---------------- 設定的存取 ----------------
     keys 兩家分開存，換供應商不會把另一把弄丟。 */
  var K = 'tutor-cfg';
  function loadCfg() {
    var raw = null;
    try { raw = sessionStorage.getItem(K) || localStorage.getItem(K); } catch (e) { /* 忽略 */ }
    var c = null;
    if (raw) { try { c = JSON.parse(raw); } catch (e) { c = null; } }
    if (!c || typeof c !== 'object') c = {};
    if (!c.keys || typeof c.keys !== 'object') c.keys = {};
    if (!PROVIDERS[c.provider]) c.provider = 'groq';
    /* 家裡自己的電腦、平板才是主要情境，預設就記住，
       不然每次關掉瀏覽器都要家長重貼一次 token。公用電腦再自己取消勾選。 */
    if (typeof c.remember !== 'boolean') c.remember = true;
    if (typeof c.stt !== 'boolean') c.stt = true;
    if (typeof c.tts !== 'boolean') c.tts = true;
    return c;
  }
  function saveCfg(cfg) {
    var s = JSON.stringify(cfg);
    try {
      sessionStorage.setItem(K, s);
      if (cfg.remember) localStorage.setItem(K, s); else localStorage.removeItem(K);
    } catch (e) { /* 私密模式等情況忽略 */ }
  }
  function clearCfg() {
    try { sessionStorage.removeItem(K); localStorage.removeItem(K); } catch (e) { /* 忽略 */ }
  }
  function chatKey() { var c = loadCfg(); return c.keys[c.provider] || ''; }
  function groqKey() { return loadCfg().keys.groq || ''; }
  function enabled() { return !!chatKey(); }

  /* ---------------- 這一刻學生在看什麼 ----------------
     把單元名稱和「螢幕上那一題」一起給模型，
     小朋友才可以直接問「這題我不會」而不用把題目打一遍。 */
  function currentChapter() {
    var id = String(location.hash || '').replace(/^#/, '');
    if (!id) return null;
    var idx = (typeof CHAPTER_INDEX === 'object' && CHAPTER_INDEX) ? CHAPTER_INDEX : null;
    return (idx && idx[id]) || null;
  }
  function currentSubject() {
    var c = currentChapter();
    return c ? c.subject : '';
  }
  /* 章節知識包：全部取自站上既有的資料（課綱原文、教具說明、常見錯誤、家長導引），
     不另外寫一份教材，也不從課本抄任何句子。
     為什麼不做成 .md 檔另外讀：整站要能雙擊 index.html 用 file:// 開，
     而 file:// 頁面 fetch 自己的檔案會被瀏覽器當跨來源擋掉，所以知識只能放在 JS 裡。
     為什麼不用 tool calling：system 提示塞得下，工具要多一趟往返又各家格式不同；
     真正值得做成工具的是「出一題」（直接呼叫 Kit.get(id).quiz()，題目和答案都保證正確），那是下一步。 */
  var PACK_MAX = 2000;                 // Groq 免費額度是 8000 tokens/分鐘，system 每回合都要重送
  function clean(html, max) {
    var t = String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return max && t.length > max ? t.slice(0, max) + '…' : t;
  }
  function aidsOf(c) {
    if (!c) return [];
    var ids = c.use ? (Array.isArray(c.use) ? c.use : [c.use]) : [c.id];
    return ids.map(function (a) { return Kit.get(a); }).filter(Boolean);
  }
  function preList(c) {
    var idx = (typeof CHAPTER_INDEX === 'object' && CHAPTER_INDEX) ? CHAPTER_INDEX : {};
    return (c && c.pre || []).map(function (x) { return idx[x]; }).filter(Boolean);
  }

  function knowledgePack(c) {
    if (!c) return '';
    var L = [];
    L.push('【這一章】' + (c.grade || '') + ' ' + (c.subject || '') +
           '（' + (c.publisher || '') + '版 ' + (c.term || '') + '）第 ' + c.no + ' 單元：' + c.title);

    (c.std || []).forEach(function (code) {
      L.push('【課綱】' + stdCodeOf(code) + '：' + stdTextOf(code));
    });

    var pres = preList(c);
    if (pres.length) {
      L.push('【先備知識】' + pres.map(function (x) {
        return x.title + '（' + (x.subject || '') + ' ' + (x.term || '') + ' 第 ' + x.no + ' 單元）';
      }).join('；'));
    }
    if (c.preNote) L.push('【也會用到】' + c.preNote);

    if (c.note) L.push('【這一章的性質】' + c.note.title + '：' + clean(c.note.body, 200));

    var defs = aidsOf(c);
    var intro = defs.map(function (d) { return clean(d.intro, 0); }).filter(Boolean).join(' ');
    if (intro) L.push('【這一章在教什麼】' + clean(intro, 260));

    /* 常見錯誤是整包裡最有用的一段——那是課綱點名的迷思概念 */
    var pits = defs.reduce(function (a, d) { return a.concat(d.pitfalls || []); }, []);
    pits.slice(0, 4).forEach(function (x) {
      L.push('【常見錯誤】學生常說：' + clean(x.bad, 90) + ' → 正確：' + clean(x.fix, 130));
    });

    var asks = defs.reduce(function (a, d) { return a.concat(d.parentGuide || []); }, [])
      .map(function (x) { return clean(x.ask, 40); }).filter(Boolean).slice(0, 4);
    if (asks.length) L.push('【可以這樣問學生】' + asks.join('／'));

    var out = L.join('\n');
    return out.length > PACK_MAX ? out.slice(0, PACK_MAX) + '…' : out;
  }

  /* app.js 裡的同名函式是區域的，這裡自己留一份，前綴一樣要脫掉 */
  function stdCodeOf(x) { var i = x.indexOf('|'); return i < 0 ? x : x.slice(i + 1); }
  function stdTextOf(x) {
    var S = (typeof STANDARDS === 'object' && STANDARDS) ? STANDARDS : {};
    return S[x] || S[stdCodeOf(x)] || '（條目原文待補）';
  }

  function contextText() {
    var parts = [];
    var c = currentChapter();
    if (c) parts.push(knowledgePack(c));
    var q = document.querySelector('.pr-q');
    if (q && q.textContent.trim()) {
      parts.push('螢幕上正在作答的題目：' + q.textContent.trim().slice(0, 300));
      var cs = document.querySelectorAll('.pr-choice');
      if (cs.length) {
        var list = [];
        for (var i = 0; i < cs.length && i < 6; i++) list.push(cs[i].textContent.trim());
        parts.push('選項：' + list.join('／'));
      }
      /* 解題步驟只有「答完之後」才會出現在畫面上，所以帶進去不會提前洩漏答案。
         有這一段模型才不會自己亂編——實測問「翅」的部首，模型會說在左邊（正確是右邊）。 */
      /* 一定要限定在 .pr-fb 裡面：回合結束的「錯題回顧」也會長出好幾個 .pr-steps，
         抓到第一個就會把別題的解說配到這一題上。作答區的 fb 在按「下一題」時會清空。 */
      var st = document.querySelector('.pr-fb .pr-steps');
      if (st && st.textContent.trim()) {
        parts.push('這一題網站給的正確解說（以這個為準，不要說出不一樣的答案）：' +
                   st.textContent.trim().slice(0, 400));
      }
    }
    return parts.join('\n');
  }

  /* 模型常常自己加 Markdown，但我們用 textContent 輸出（不碰 innerHTML），
     星號會原樣顯示。這裡把記號拿掉，只留文字。 */
  function toPlain(s) {
    return String(s || '')
      .replace(/```[a-zA-Z]*\n?/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '・')
      .replace(/\n{3,}/g, '\n\n');
  }

  /* ---------------- 系統提示 ---------------- */
  function systemPrompt() {
    var ctx = contextText();
    var lines = [
      '你是台灣國小五年級學生的家教，名字叫「小老師」。',
      '1. 一律用臺灣的繁體中文，用臺灣的學科名詞（例如「最大公因數」不要寫成「最大公約數」、「解僱」不要寫成「辭退」），不要出現簡體字。',
      '2. 對象是 10～11 歲的小朋友：句子要短，先講結論再講怎麼想，最多三個步驟。',
      '3. 純文字回答。不要用 LaTeX、不要用 $ 或 \\frac，分數就直接寫成 2/3，乘除寫成 × ÷。',
      '4. 要「算」或要「想」的題目（數學計算、自然的原因、閱讀理解），不要直接把答案講出來。先問一句「你卡在哪一步」或給一個提示，等學生回應再往下帶。',
      '5. 但如果學生問的是單純的事實（某個字的部首和筆畫、某個詞的意思、某個年代、某個英文單字怎麼唸），就直接、明確地回答，不要反問，也不要故意繞圈子。',
      '6. 不確定就說不確定，不要編造。課本版本不一樣的地方，說明差異就好。',
      '7. 只談功課。被問到別的事，溫和地把話題帶回來。',
      '8. 以「這一章」和它的先備知識為主。學生問到別章的內容，簡短回答完再帶回這一章；問到先備知識（例如在異分母加減這章問通分）要好好回答，那本來就是這一章要用的。',
      '9. 下面附的「常見錯誤」是課綱點名的迷思概念，學生的說法如果撞上其中一條，直接指出來並更正。',
      '10. 不要詢問、也不要記住學生的姓名、學校、住址或任何個人資料。',
      '11. 不要談暴力、色情、自我傷害等不適合兒童的內容。'
    ];
    if (ctx) lines.push('學生現在的畫面：\n' + ctx);
    return lines.join('\n');
  }

  /* ---------------- 呼叫模型 ----------------
     注意：credentials 用預設值，絕對不要設 credentials:'include'。
     MiniMax 回的是 ACAO:* 搭配 Allow-Credentials:true，
     一旦帶認證，瀏覽器會直接拒收整個回應。 */
  function ask(messages, opts) {
    opts = opts || {};
    var cfg = loadCfg();
    var key = cfg.keys[cfg.provider];
    if (!key) return Promise.reject(new Error('尚未設定 token。'));
    var p = PROVIDERS[cfg.provider];

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, opts.timeout || 60000);
    if (opts.hook) opts.hook(ctrl);

    var body = {
      model: cfg.model || p.model,
      messages: messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 800
    };
    for (var x in p.extra) { if (p.extra.hasOwnProperty(x)) body[x] = p.extra[x]; }

    return fetch(p.url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error(explainHttp(res.status, t)); });
      }
      /* 有的服務會忽略 stream:true 直接回一整包 JSON，兩種都要能收 */
      var ct = res.headers.get('Content-Type') || '';
      if (ct.indexOf('event-stream') < 0 && !res.body) return readWhole(res, opts);
      if (ct.indexOf('event-stream') < 0) return readWhole(res, opts);
      return readStream(res, opts);
    }).then(function (v) {
      clearTimeout(timer); return v;
    }, function (err) {
      clearTimeout(timer);
      /* CORS 被擋、沒網路、DNS 失敗，在瀏覽器裡通通是 TypeError: Failed to fetch，
         規格上不會告訴我們真正原因，只能給一句人看得懂的話。 */
      if (err.name === 'AbortError') throw new Error('等太久了，先取消。可以再問一次。');
      if (err instanceof TypeError) throw new Error('連不到小老師。可能是沒有網路，或這台裝置擋住了連線。沒網路時其他功能都還能用。');
      throw err;
    });
  }

  /* MiniMax 的慣例是「HTTP 200 但 base_resp 帶錯誤碼」（例如 1004 認證失敗、
     額度不足），不看這個欄位會把失敗當成空回覆。 */
  function checkBaseResp(j) {
    var b = j && j.base_resp;
    if (b && b.status_code) throw new Error('對方回報錯誤：' + (b.status_msg || b.status_code));
  }

  function readWhole(res, opts) {
    return res.json().then(function (j) {
      checkBaseResp(j);
      var c = j.choices && j.choices[0];
      var t = (c && c.message && c.message.content) || '';
      t = stripThink(t);
      if (t && opts.onDelta) opts.onDelta(t);
      return t;
    });
  }

  function readStream(res, opts) {
    var reader = res.body.getReader();
    var dec = new TextDecoder('utf-8');
    var buf = '', full = '';
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) return stripThink(full);
        buf += dec.decode(r.value, { stream: true });
        var lines = buf.split('\n');
        buf = lines.pop();                      // 最後一行可能沒收完，留著
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.slice(0, 5) !== 'data:') continue;
          var payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          var j;
          try { j = JSON.parse(payload); } catch (e) { continue; }
          checkBaseResp(j);
          var c = j.choices && j.choices[0];
          var d = c && (c.delta || c.message);
          // 只取 content；reasoning／reasoning_content 一律丟掉
          if (d && typeof d.content === 'string' && d.content) {
            full += d.content;
            if (opts.onDelta) opts.onDelta(d.content);
          }
        }
        return pump();
      });
    }
    return pump();
  }

  /* 保險：萬一某家沒把思考過程分離出來，把 <think>…</think> 清掉。
     實測 MiniMax 少了 thinking:disabled 就會這樣。 */
  function stripThink(s) {
    return String(s || '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<think>[\s\S]*$/, '')
      .replace(/^\s+/, '');
  }

  function explainHttp(status, bodyText) {
    var b = String(bodyText || '');
    if (status === 401 || status === 403) return 'token 不對或已失效，請家長到設定裡重新貼一次。';
    if (status === 429) return '額度用完了，或問得太快。等一下再試。';
    if (status === 402) return '帳戶點數不足，請家長到供應商後台看一下。';
    // 模型下架是最常見的長期失效原因——各家汰換很快
    if (status === 404 || status === 410 || (/model/i.test(b) && /not.?found|decommission|retired/i.test(b))) {
      return '這個模型已經下架了，請家長到設定裡換一個模型名稱。';
    }
    if (status >= 500) return '對方伺服器出問題，等一下再試。';
    return '出錯了（HTTP ' + status + '）。' + b.slice(0, 120);
  }

  /* ---------------- 語音輸入（Groq Whisper） ----------------
     用 MediaRecorder 錄一段，整段送出去轉文字。
     不用瀏覽器內建的 SpeechRecognition：Firefox 沒有、
     各家語言代碼和結果格式又不一樣，而 Groq 這條路三個平台一致。 */
  var CAN_REC = (typeof navigator !== 'undefined' && navigator.mediaDevices &&
                 navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined');
  function sttReady() { return CAN_REC && !!groqKey() && loadCfg().stt; }

  function recorder(onStop, onError) {
    var chunks = [], rec = null, stream = null, stopTimer = null;
    function cleanup() {
      if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    }
    return {
      start: function () {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
          stream = s;
          /* Safari 只給 audio/mp4，Chrome 給 audio/webm；兩種 Groq 都收，
             但副檔名要跟著換，否則對方會依檔名判型別而失敗。 */
          var mime = '';
          if (typeof MediaRecorder.isTypeSupported === 'function') {
            if (MediaRecorder.isTypeSupported('audio/webm')) mime = 'audio/webm';
            else if (MediaRecorder.isTypeSupported('audio/mp4')) mime = 'audio/mp4';
          }
          rec = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
          chunks = [];
          rec.addEventListener('dataavailable', function (e) { if (e.data && e.data.size) chunks.push(e.data); });
          rec.addEventListener('stop', function () {
            cleanup();
            var type = (rec && rec.mimeType) || mime || 'audio/webm';
            onStop(new Blob(chunks, { type: type }), type);
          });
          rec.start();
          // 保險：最長錄 30 秒，免得忘了按停止一直錄下去
          stopTimer = setTimeout(function () { if (rec && rec.state === 'recording') rec.stop(); }, 30000);
        }).catch(function (e) {
          cleanup();
          var msg = '拿不到麥克風。';
          if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) msg = '麥克風被擋住了，請在網址列的權限設定裡允許。';
          else if (e && e.name === 'NotFoundError') msg = '找不到麥克風。';
          onError(new Error(msg));
        });
      },
      stop: function () { if (rec && rec.state === 'recording') rec.stop(); else cleanup(); },
      cancel: function () { if (rec) { rec.onstop = null; try { rec.stop(); } catch (e) { /* 忽略 */ } } cleanup(); }
    };
  }

  function transcribe(blob, type) {
    var key = groqKey();
    if (!key) return Promise.reject(new Error('語音輸入需要 Groq 的 token。'));
    var ext = type.indexOf('mp4') >= 0 ? 'm4a' : type.indexOf('ogg') >= 0 ? 'ogg' : 'webm';
    var lang = currentSubject() === '英語' ? 'en' : 'zh';
    var fd = new FormData();
    fd.append('file', blob, 'speech.' + ext);
    fd.append('model', STT.model);
    fd.append('language', lang);
    fd.append('response_format', 'json');
    if (lang === 'zh') fd.append('prompt', STT.zhPrompt);

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 45000);
    return fetch(STT.url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Authorization': 'Bearer ' + key },   // 不要自己設 Content-Type，boundary 要瀏覽器產生
      body: fd
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(explainHttp(res.status, t)); });
      return res.json();
    }).then(function (j) {
      clearTimeout(timer);
      return String((j && j.text) || '').trim();
    }, function (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('語音辨識等太久了。');
      if (err instanceof TypeError) throw new Error('連不到語音辨識服務。');
      throw err;
    });
  }

  /* ---------------- 唸出來（瀏覽器內建） ----------------
     Windows 的 Chrome 第一次呼叫 getVoices() 會回空陣列，
     要等 voiceschanged；而且中文語音不是每台 Windows 都有裝，
     所以挑不到就把按鈕藏起來，不要用錯語言硬唸。 */
  var CAN_SPEAK = (typeof window !== 'undefined') && ('speechSynthesis' in window);
  var voicesReady = false;
  if (CAN_SPEAK) {
    var poke = function () { voicesReady = (window.speechSynthesis.getVoices() || []).length > 0; };
    poke();
    try { window.speechSynthesis.addEventListener('voiceschanged', poke); } catch (e) { /* 忽略 */ }
  }
  function pickVoice(lang) {
    if (!CAN_SPEAK) return null;
    var vs = window.speechSynthesis.getVoices() || [];
    var want = lang === 'en' ? ['en-us', 'en-gb', 'en'] : ['zh-tw', 'zh-hant', 'zh-hk', 'zh-cn', 'zh'];
    for (var w = 0; w < want.length; w++) {
      for (var i = 0; i < vs.length; i++) {
        var vl = String(vs[i].lang || '').toLowerCase().replace(/_/g, '-');
        if (vl === want[w] || vl.indexOf(want[w] + '-') === 0) return vs[i];
      }
    }
    return null;
  }
  function canSpeak(lang) { return CAN_SPEAK && (voicesReady ? !!pickVoice(lang) : true); }
  function speak(text, lang) {
    if (!CAN_SPEAK) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var v = pickVoice(lang);
      if (v) { u.voice = v; u.lang = v.lang; }
      else u.lang = lang === 'en' ? 'en-US' : 'zh-TW';
      u.rate = lang === 'en' ? 0.85 : 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 唸不出來就算了，不要打斷畫面 */ }
  }

  /* ---------------- 對話視窗 ----------------
     history 只放在記憶體，關掉就沒了，不寫進任何 storage。 */
  var panel = null, history = null, busy = false, activeCtrl = null;
  var historyChapter = null;   // 這段對話是在哪一章開始的

  function openChat() {
    if (!enabled()) { location.hash = ''; return; }
    if (panel) {
      // 家長可能在對話開著的期間換了供應商，標題要跟著改
      panel.querySelector('.tutor-who').textContent = PROVIDERS[loadCfg().provider].label.split('（')[0];
      var c0 = currentChapter();
      var id0 = c0 ? c0.id : '';
      // 還沒開始對話（只有開場白）就直接換成這一章的開場白
      if (!history && historyChapter !== id0) {
        var b0 = panel.querySelector('.tutor-body');
        b0.innerHTML = ''; greetInto(b0); historyChapter = id0;
      }
      panel.classList.add('on');
      panel.querySelector('.tutor-input').focus();
      return;
    }

    history = null;   // 每次重開都用當下的畫面重建 system 訊息
    panel = el('div', { class: 'tutor-panel on', role: 'dialog', 'aria-label': '線上小老師' });

    var head = el('div', { class: 'tutor-head' }, [
      el('span', { class: 'tutor-title', text: '🧑‍🏫 小老師' }),
      el('span', { class: 'tutor-who', text: PROVIDERS[loadCfg().provider].label.split('（')[0] }),
      Kit.button('清空', function () { history = null; body.innerHTML = ''; greetInto(body); }, 'small'),
      Kit.button('✕', function () { closeChat(); }, 'small')
    ]);

    var body = el('div', { class: 'tutor-body' });
    var input = el('textarea', { class: 'tutor-input', rows: '2', placeholder: '想問什麼？（Enter 送出，Shift+Enter 換行）' });

    /* 語音提問：辨識完的字會先填進輸入框讓學生看得到，不直接送出——
       唸錯字或聽錯的時候可以改，也不會白白吃掉一次額度。 */
    var micNote = el('p', { class: 'tutor-mic-note', 'aria-live': 'polite' });
    micNote.hidden = true;
    var micBtn = null;
    if (sttReady()) {
      micBtn = Kit.button('🎤 用說的', function () { toggleMic(micBtn, input, micNote); }, 'small');
      micBtn.title = '按一下開始說話，說完再按一下';
    }
    var sendBtn = Kit.button('送出', function () { send(input, body); }, 'primary');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input, body); }
    });

    var row = el('div', { class: 'tutor-row' }, micBtn ? [input, micBtn, sendBtn] : [input, sendBtn]);
    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(micNote);
    panel.appendChild(row);
    panel.appendChild(el('p', { class: 'tutor-foot', text: '小老師也會說錯。答案請以課本和老師為準；不要輸入姓名、學校、電話。' }));
    document.body.appendChild(panel);
    panel._body = body;
    greet();
    focusInput();

    function greet() { greetInto(body); }
    function focusInput() { setTimeout(function () { input.focus(); }, 30); }
  }

  function closeChat() {
    if (activeCtrl) { try { activeCtrl.abort(); } catch (e) { /* 忽略 */ } activeCtrl = null; }
    if (CAN_SPEAK) { try { window.speechSynthesis.cancel(); } catch (e) { /* 忽略 */ } }
    if (panel) panel.classList.remove('on');
  }

  /* 開場白：講出這一章要先會什麼，學生自己就知道該不該回去複習 */
  function greetInto(body) {
    var c = currentChapter();
    if (!c) { addMsg(body, 'bot', '有什麼不會的，問我吧。'); return; }
    var t = '在看「' + (c.title || '') + '」。';
    var pres = preList(c);
    if (pres.length) {
      t += '這一章要先會：' + pres.map(function (x) { return x.title; }).join('、') + '。';
    }
    if (c.preNote) t += '（' + c.preNote + '）';
    t += '\n有哪裡卡住就問我，也可以用說的 🎤。';
    addMsg(body, 'bot', t);
  }

  function addMsg(body, who, text) {
    var msg = el('div', { class: 'tutor-msg ' + who });
    var span = el('span', { class: 'tutor-txt' });
    span.textContent = text || '';
    msg.appendChild(span);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return span;
  }

  function send(input, body) {
    if (busy) return;
    var q = input.value.trim();
    if (!q) return;
    input.value = '';

    /* 換到別章就把對話清掉重來。上一章的問答留著會一直干擾，
       而且 system 是每回合重建的，兩者混在一起模型會搞混。
       這一段一定要在 addMsg 之前——清空畫面會把學生剛問的那句一起擦掉。 */
    var here = currentChapter();
    var hereId = here ? here.id : '';
    if (history && historyChapter !== hereId) { history = null; body.innerHTML = ''; greetInto(body); }
    if (!history) history = [];
    historyChapter = hereId;

    addMsg(body, 'me', q);
    history.push({ role: 'user', content: q });

    var span = addMsg(body, 'bot', '…');
    var first = true;
    busy = true;

    /* system 訊息每次都用「當下的畫面」重建。
       小朋友問到一半換單元、換題目是常態，
       只在開啟對話時建一次的話，上下文會一直停在剛打開的那一頁。 */
    var msgs = [{ role: 'system', content: systemPrompt() }].concat(history);

    ask(msgs, {
      hook: function (c) { activeCtrl = c; },
      onDelta: function (t) {
        if (first) { span.textContent = ''; first = false; }
        span.textContent += t;
        body.scrollTop = body.scrollHeight;
      }
    }).then(function (full) {
      busy = false; activeCtrl = null;
      // 串流時先原樣顯示（Markdown 記號可能被切在兩個 chunk 中間），收完再整段清一次
      var clean = toPlain(stripThink(full));
      span.textContent = clean || '（沒有回覆內容，再問一次看看。）';
      history.push({ role: 'assistant', content: clean });
      /* 只留最近幾輪。Groq 免費額度是 8000 tokens/分鐘，而 system（含知識包）
         每一回合都要重送，對話再無限長下去很快就會撞到額度。
         同時看則數和總字數，長篇問答用字數擋比較準。 */
      if (history.length > 12) history = history.slice(-12);
      var chars = 0;
      for (var h = history.length - 1; h >= 0; h--) {
        chars += String(history[h].content || '').length;
        if (chars > 2400) { history = history.slice(h + 1); break; }
      }
      var lang = /[a-zA-Z]/.test(clean) && !/[一-鿿]/.test(clean) ? 'en' : 'zh';
      if (loadCfg().tts && canSpeak(lang)) {
        var b = Kit.button('🔊', function () { speak(clean, lang); }, 'small');
        b.className += ' tutor-say';
        span.parentNode.appendChild(b);
      }
      body.scrollTop = body.scrollHeight;
    }).catch(function (e) {
      busy = false; activeCtrl = null;
      span.textContent = '⚠ ' + e.message;
    });
  }

  /* 麥克風：按一下開始、再按一下送出去辨識 */
  var rec = null;
  function say(note, text) {
    if (!note) return;
    note.textContent = text || '';
    note.hidden = !text;
  }
  function toggleMic(btn, input, note) {
    if (rec) {                                   // 第二次按＝說完了
      btn.textContent = '⏳ 辨識中';
      btn.disabled = true;
      say(note, '正在把你說的話轉成文字…');
      rec.stop();
      return;
    }
    btn.textContent = '⏹ 停止';
    btn.className += ' tutor-rec';
    say(note, '🔴 錄音中…說完請按「停止」（最長 30 秒）');
    rec = recorder(function (blob, type) {
      rec = null;
      btn.textContent = '⏳ 辨識中'; btn.disabled = true;
      say(note, '正在把你說的話轉成文字…');
      transcribe(blob, type).then(function (text) {
        resetMic(btn);
        if (text) {
          input.value = (input.value ? input.value + ' ' : '') + text;
          input.focus();
          say(note, '聽到的是這樣，可以改，然後按「送出」。');
        } else {
          say(note, '沒聽清楚，再說一次看看。');
        }
      }).catch(function (e) {
        resetMic(btn);
        say(note, '⚠ ' + e.message);
      });
    }, function (e) {
      rec = null; resetMic(btn);
      say(note, '⚠ ' + e.message);
    });
    rec.start();
  }
  function resetMic(btn) {
    btn.textContent = '🎤 用說的';
    btn.disabled = false;
    btn.className = btn.className.replace(/\s*tutor-rec/, '');
  }

  /* 章節頁上的入口。沒設定 token 就回 null，app.js 什麼都不會加。 */
  function chapterButton() {
    if (!enabled()) return null;
    var b = Kit.button('🧑‍🏫 問這一章的小老師', function () { openChat(); }, 'primary');
    b.className += ' tutor-chapter-btn';
    return b;
  }

  /* ---------------- 浮動按鈕 ---------------- */
  function mountFab() {
    var old = document.getElementById('tutorFab');
    if (!enabled()) { if (old) old.remove(); return; }
    if (old) return;
    var fab = Kit.button('🧑‍🏫 問小老師', openChat, 'primary');
    fab.id = 'tutorFab';
    fab.className += ' tutor-fab';
    document.body.appendChild(fab);
  }

  /* ---------------- 首頁的設定卡片 ---------------- */
  function settingsCard() {
    var cfg = loadCfg();
    var card = el('div', { class: 'card' });
    card.appendChild(el('h3', {}, [
      el('span', { class: 'ico', text: '🧑‍🏫' }),
      el('span', { text: '線上小老師（選用）' })
    ]));
    card.appendChild(el('p', {
      class: 'hint',
      html: '這是<b>選用</b>功能，預設關閉。不填就<b>完全不會連網</b>，整個網站照常離線使用。<br>' +
            '要用的話請<b>家長</b>自己申請一組 API token 貼在下面。token 只存在這台裝置的瀏覽器，' +
            '不會傳給本站作者（本站是純靜態網頁，沒有伺服器）。'
    }));
    card.appendChild(el('p', {
      class: 'src-note',
      html: '⚠ <b>請家長先讀：</b>小朋友打進去的字、錄進去的聲音，會送到你選的那家公司。' +
            '不要讓孩子輸入姓名、學校、電話。<br>' +
            'Groq 的服務條款第 4.2 條寫明不會拿使用者的輸入與輸出去訓練模型，第 2 條的 18 歲限制是針對<b>開帳號的人</b>（也就是家長），' +
            '第 6 條另外設想了「給未成年人使用的應用」並把合規責任交給帳號持有人。<br>' +
            'Google Gemini 沒有列在這裡：它的條款明文禁止用在「directed towards or is likely to be accessed by individuals under the age of 18」的服務，這個網站正好是。'
    }));

    /* 用自己的 class：站上的 .ctl 是 display:flex 的控制列，套在 input 上會縮成一小截 */
    var sel = el('select', { class: 'tutor-field' });
    Object.keys(PROVIDERS).forEach(function (id) {
      var o = el('option', { value: id, text: PROVIDERS[id].label });
      if (id === cfg.provider) o.selected = true;
      sel.appendChild(o);
    });

    var keyIn = el('input', {
      type: 'password', class: 'tutor-field', autocomplete: 'off', spellcheck: 'false',
      placeholder: '貼上 API token', value: cfg.keys[cfg.provider] || ''
    });
    var modelIn = el('input', {
      type: 'text', class: 'tutor-field', spellcheck: 'false',
      placeholder: '模型名稱（留空用 ' + PROVIDERS[cfg.provider].model + '）', value: cfg.model || ''
    });
    var hint = el('p', { class: 'src-note', text: PROVIDERS[cfg.provider].keyHint });

    sel.addEventListener('change', function () {
      var c = loadCfg();
      hint.textContent = PROVIDERS[sel.value].keyHint;
      modelIn.placeholder = '模型名稱（留空用 ' + PROVIDERS[sel.value].model + '）';
      keyIn.value = c.keys[sel.value] || '';
      sttNote();
    });

    var remember = el('input', { type: 'checkbox' });
    if (cfg.remember) remember.checked = true;
    var sttBox = el('input', { type: 'checkbox' });
    if (cfg.stt) sttBox.checked = true;
    var ttsBox = el('input', { type: 'checkbox' });
    if (cfg.tts) ttsBox.checked = true;

    var where = el('p', { class: 'src-note' });
    function whereNote() {
      var inLocal = false, inSession = false;
      try { inLocal = !!localStorage.getItem(K); inSession = !!sessionStorage.getItem(K); } catch (e) { /* 忽略 */ }
      where.textContent = inLocal
        ? '目前狀態：token 存在這台裝置的 localStorage，關掉瀏覽器也還在。按「全部清除」可以刪掉。'
        : inSession
          ? '目前狀態：token 只存在這次瀏覽階段（sessionStorage），關掉瀏覽器就會消失。'
          : '目前狀態：這台裝置還沒有存任何 token。';
    }

    var sttHint = el('p', { class: 'src-note' });
    function sttNote() {
      var t = '語音輸入固定走 Groq 的 whisper-large-v3-turbo，' +
              '所以就算聊天選 MiniMax，也要有一把 Groq 的 token 才會出現 🎤。';
      if (!CAN_REC) t += '（這台裝置的瀏覽器不支援錄音，🎤 不會出現。）';
      else if (!loadCfg().keys.groq) t += '目前還沒有 Groq token。';
      sttHint.textContent = t;
    }
    sttNote();
    whereNote();

    var status = el('p', { class: 'pr-fb', 'aria-live': 'polite' });

    var save = Kit.button('儲存並測試', function () {
      var c = loadCfg();
      var v = keyIn.value.trim();
      c.provider = sel.value;
      c.model = modelIn.value.trim();
      c.remember = remember.checked;
      c.stt = sttBox.checked;
      c.tts = ttsBox.checked;
      if (v) c.keys[c.provider] = v; else delete c.keys[c.provider];
      saveCfg(c);
      sttNote();
      whereNote();
      /* 供應商、🎤、朗讀的開關都會影響對話視窗長什麼樣，
         設定一改就把舊的丟掉重建，不要留半舊半新的介面 */
      if (panel) { panel.remove(); panel = null; history = null; }
      if (!v) {
        status.className = 'pr-fb';
        status.textContent = '已清除這一家的 token。';
        mountFab();
        return;
      }
      status.className = 'pr-fb';
      status.textContent = '測試中…';
      ask([{ role: 'user', content: '回覆兩個字：可以' }], { timeout: 25000 })
        .then(function (t) {
          // 有些服務失敗時會回一個「格式正確但沒有內容」的東西，那不算成功
          if (!t) throw new Error('沒有收到回覆內容，token 或模型名稱可能有問題。');
          status.className = 'pr-fb ok';
          status.textContent = '✅ 可以用了。小老師回：' + (t || '').slice(0, 20);
          mountFab();
        })
        .catch(function (e) {
          status.className = 'pr-fb no';
          status.textContent = '❌ ' + e.message;
        });
    }, 'primary');

    var clear = Kit.button('全部清除', function () {
      clearCfg();
      whereNote();
      keyIn.value = '';
      status.className = 'pr-fb';
      status.textContent = '已清除，小老師關閉，網站回到完全離線。';
      if (panel) { panel.remove(); panel = null; }
      mountFab();
      sttNote();
    });

    card.appendChild(sel);
    card.appendChild(keyIn);
    card.appendChild(modelIn);
    card.appendChild(hint);
    card.appendChild(el('label', { class: 'ctl' }, [remember, el('span', {
      html: ' <b>把 token 記在這台裝置</b>（存進瀏覽器的 <code>localStorage</code>，下次打開不用重貼）'
    })]));
    card.appendChild(where);
    card.appendChild(el('label', { class: 'ctl' }, [sttBox, el('span', { text: ' 開啟語音輸入 🎤' })]));
    card.appendChild(el('label', { class: 'ctl' }, [ttsBox, el('span', { text: ' 開啟朗讀 🔊（用瀏覽器內建語音，不連網）' })]));
    card.appendChild(sttHint);
    card.appendChild(el('div', { class: 'pr-actions' }, [save, clear]));
    card.appendChild(status);
    return card;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', mountFab);
  }

  return {
    enabled: enabled,
    ask: ask,
    settingsCard: settingsCard,
    systemPrompt: systemPrompt,
    mountFab: mountFab,
    open: openChat,
    chapterButton: chapterButton,
    knowledgePack: knowledgePack,
    close: closeChat,
    clear: clearCfg,
    _providers: PROVIDERS
  };
})();
