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

  /* ---------------- 語音提問的三條路 ----------------
     實測（2026-09）：
     - Groq whisper-large-v3-turbo：最準，而且給一句繁體引導 prompt 就會輸出繁體。
     - 瀏覽器內建 SpeechRecognition：不用任何 token、不用上傳，講完馬上出字；
       但 Firefox 沒有，而且 Chrome 會把聲音送到 Google。
     - MiniMax asr-1.0：可以用，CORS 也開，但**只會輸出簡體**——
       language=zh-TW、prompt 這些參數都試過，改不掉。所以排最後。 */
  var STT = {
    url: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'whisper-large-v3-turbo',
    /* 這裡只能放「描述性」的句子——放範例詞彙反而會把標點吃掉 */
    zhPrompt: '以下是臺灣國小學生的提問，請用臺灣繁體中文轉寫。'
  };
  var MM_STT = { url: 'https://api.minimax.io/v1/speech_to_text', model: 'asr-1.0' };
  /* MiniMax 的語音合成。實測四個模型都能用，回應都在 3 秒上下，
     計費看字元數。中文音色全是「標準普通話」，沒有臺灣腔可選。 */
  var MM_TTS = {
    url: 'https://api.minimax.io/v1/t2a_v2',
    listUrl: 'https://api.minimax.io/v1/get_voice',
    model: 'speech-2.5-hd-preview',
    models: ['speech-2.5-hd-preview', 'speech-2.5-turbo-preview', 'speech-02-hd', 'speech-02-turbo'],
    zh: 'Chinese (Mandarin)_Warm_Girl',
    en: 'English_CalmWoman'
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

    /* 問答、語音提問、朗讀三件事各自設定，互不牽連。
       舊版存的是 stt:true/false、tts:true/false，這裡順手升級掉。 */
    if (typeof c.stt === 'boolean') c.stt = c.stt ? 'auto' : 'off';
    if (STT_MODES.indexOf(c.stt) < 0) c.stt = 'auto';

    if (typeof c.tts === 'boolean') c.tts = { engine: c.tts ? 'browser' : 'off' };
    if (!c.tts || typeof c.tts !== 'object') c.tts = {};
    if (TTS_MODES.indexOf(c.tts.engine) < 0) c.tts.engine = 'browser';
    if (typeof c.tts.voice !== 'string') c.tts.voice = '';
    if (typeof c.tts.enVoice !== 'string') c.tts.enVoice = '';
    if (typeof c.tts.auto !== 'boolean') c.tts.auto = false;
    if (!c.tts.model) c.tts.model = MM_TTS.model;
    var sp = parseFloat(c.tts.speed);
    c.tts.speed = (isFinite(sp) && sp >= 0.5 && sp <= 2) ? sp : 1;
    return c;
  }
  var STT_MODES = ['auto', 'groq', 'web', 'minimax', 'off'];
  var TTS_MODES = ['browser', 'minimax', 'off'];
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
  var HAS_SR = (typeof window !== 'undefined') &&
               !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /* 三條路的優先順序：Groq 最準且各家瀏覽器都能用 → 瀏覽器內建不用 token
     也不用上傳 → MiniMax 墊底（只吐簡體，要再過一次 OpenCC）。 */
  function sttEngine() {
    var c = loadCfg();
    if (c.stt === 'off') return null;
    if (c.stt === 'groq') return (CAN_REC && c.keys.groq) ? 'groq' : null;
    if (c.stt === 'web') return HAS_SR ? 'web' : null;
    if (c.stt === 'minimax') return (CAN_REC && c.keys.minimax) ? 'minimax' : null;
    // auto：Groq 最準 → 瀏覽器內建不用 token → MiniMax 墊底（只吐簡體）
    if (CAN_REC && c.keys.groq) return 'groq';
    if (HAS_SR) return 'web';
    if (CAN_REC && c.keys.minimax) return 'minimax';
    return null;
  }
  function sttReady() { return !!sttEngine(); }
  /* 沒有 🎤 的時候要講得出原因，不要只是默默不顯示 */
  function sttWhy() {
    var c = loadCfg();
    if (c.stt === 'off') return '語音提問在設定裡被關掉了。';
    if (c.stt === 'groq' && !c.keys.groq) return '語音提問指定用 Groq，但還沒有 Groq token。';
    if (c.stt === 'minimax' && !c.keys.minimax) return '語音提問指定用 MiniMax，但還沒有 MiniMax token。';
    if (c.stt === 'web' && !HAS_SR) return '這個瀏覽器沒有內建語音辨識（Firefox 就沒有）。';
    if (!CAN_REC && !HAS_SR) return '這台裝置的瀏覽器不支援錄音，所以沒有 🎤。';
    if (!c.keys.groq && !c.keys.minimax && !HAS_SR) return '還沒有任何可用的語音辨識。';
    return '';
  }

  /* ---------------- OpenCC：簡體轉臺灣正體 ----------------
     只有 MiniMax 那條路用得到，而 vendor/opencc-cn2t.js 有 1MB，
     所以不寫進 index.html，真的要用的時候才插一個 <script> 進去。
     file:// 也吃得下這種動態載入（被擋的是 fetch，不是 script src）。 */
  var occ = null, occLoading = null;
  function toTW(text) {
    if (!text) return Promise.resolve(text);
    if (occ) return Promise.resolve(occ(text));
    if (!occLoading) {
      occLoading = new Promise(function (done) {
        var sc = document.createElement('script');
        sc.src = 'vendor/opencc-cn2t.js';
        sc.onload = function () {
          try { occ = window.OpenCC.Converter({ from: 'cn', to: 'twp' }); } catch (e) { occ = null; }
          done();
        };
        sc.onerror = function () { done(); };     // 載不到就原樣顯示，不要整個壞掉
        document.head.appendChild(sc);
      });
    }
    return occLoading.then(function () { return occ ? occ(text) : text; });
  }

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
    var cfg = loadCfg();
    var engine = sttEngine();
    var mm = engine === 'minimax';
    var key = mm ? cfg.keys.minimax : cfg.keys.groq;
    if (!key) return Promise.reject(new Error('語音提問需要一組 token。'));

    var ext = type.indexOf('mp4') >= 0 ? 'm4a' : type.indexOf('ogg') >= 0 ? 'ogg' : 'webm';
    var lang = currentSubject() === '英語' ? 'en' : 'zh';
    var fd = new FormData();
    fd.append('file', blob, 'speech.' + ext);
    if (mm) {
      fd.append('model', MM_STT.model);
    } else {
      fd.append('model', STT.model);
      fd.append('language', lang);
      fd.append('response_format', 'json');
      if (lang === 'zh') fd.append('prompt', STT.zhPrompt);
    }

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 45000);
    return fetch(mm ? MM_STT.url : STT.url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Authorization': 'Bearer ' + key },   // 不要自己設 Content-Type，boundary 要瀏覽器產生
      body: fd
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(explainHttp(res.status, t)); });
      return res.json();
    }).then(function (j) {
      clearTimeout(timer);
      checkBaseResp(j);
      var text = String((j && j.text) || '').trim();
      // MiniMax 一律回簡體，過一次 OpenCC 再給小朋友看
      return (mm && lang === 'zh') ? toTW(text) : text;
    }, function (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('語音辨識等太久了。');
      if (err instanceof TypeError) throw new Error('連不到語音辨識服務。');
      throw err;
    });
  }

  /* 瀏覽器內建的語音辨識：不用 token、不用上傳，講完馬上出字。
     Firefox 沒有這個 API；Chrome 會把聲音送到 Google，Safari 送到 Apple。 */
  function webRecognizer(onText, onError, onEnd) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var r = new SR();
    r.lang = currentSubject() === '英語' ? 'en-US' : 'zh-TW';
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    var finalText = '';
    r.onresult = function (e) {
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      onText(finalText + interim, finalText && !interim);
    };
    r.onerror = function (e) {
      var m = '語音辨識出錯了。';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') m = '麥克風被擋住了，請在網址列的權限設定裡允許。';
      else if (e.error === 'no-speech') m = '沒聽到聲音，再說一次看看。';
      else if (e.error === 'network') m = '連不到語音辨識服務。';
      onError(new Error(m));
    };
    r.onend = function () { onEnd(finalText.trim()); };
    return r;
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
  /* 家長在設定裡指定的瀏覽器音色（存 voiceURI，換裝置找不到就退回自動挑） */
  function chosenVoice(lang) {
    var want = loadCfg().tts[lang === 'en' ? 'enVoice' : 'voice'];
    if (want && CAN_SPEAK) {
      var vs = window.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) if (vs[i].voiceURI === want) return vs[i];
    }
    return pickVoice(lang);
  }
  function browserVoices(lang) {
    if (!CAN_SPEAK) return [];
    var pre = lang === 'en' ? 'en' : 'zh';
    return (window.speechSynthesis.getVoices() || []).filter(function (v) {
      return String(v.lang || '').toLowerCase().replace(/_/g, '-').indexOf(pre) === 0;
    });
  }

  function ttsEngine() {
    var c = loadCfg();
    if (c.tts.engine === 'off') return null;
    if (c.tts.engine === 'minimax') return c.keys.minimax ? 'minimax' : null;
    return CAN_SPEAK ? 'browser' : null;
  }
  function canSpeak(lang) {
    var e = ttsEngine();
    if (e === 'minimax') return true;                 // 雲端合成不挑裝置有沒有語音
    if (e !== 'browser') return false;
    return voicesReady ? !!chosenVoice(lang) : true;  // 語音清單還沒載好就先讓按鈕出現
  }
  function ttsWhy() {
    var c = loadCfg();
    if (c.tts.engine === 'off') return '朗讀在設定裡被關掉了。';
    if (c.tts.engine === 'minimax' && !c.keys.minimax) return '朗讀指定用 MiniMax，但還沒有 MiniMax token。';
    if (c.tts.engine === 'browser' && !CAN_SPEAK) return '這台裝置的瀏覽器沒有內建語音合成。';
    return '';
  }

  /* speak() 兩條路都走得通，回傳 Promise 讓「試聽」可以顯示錯誤。 */
  var mmAudio = null;
  function speak(text, lang, onstart) {
    var e = ttsEngine();
    if (!e || !text) return Promise.resolve();
    if (e === 'minimax') return speakMiniMax(text, lang, onstart);
    return new Promise(function (done) {
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        var v = chosenVoice(lang);
        if (v) { u.voice = v; u.lang = v.lang; }
        else u.lang = lang === 'en' ? 'en-US' : 'zh-TW';
        u.rate = (lang === 'en' ? 0.85 : 0.95) * loadCfg().tts.speed;
        u.onend = function () { done(); };
        u.onerror = function () { done(); };
        if (onstart) onstart();
        window.speechSynthesis.speak(u);
      } catch (err) { done(); }   // 唸不出來就算了，不要打斷畫面
    });
  }

  function stopSpeak() {
    if (CAN_SPEAK) { try { window.speechSynthesis.cancel(); } catch (e) { /* 忽略 */ } }
    if (mmAudio) {
      var a = mmAudio; mmAudio = null;
      try { a.pause(); } catch (e) { /* 忽略 */ }
      // pause() 不會觸發 onended，手動收尾，不然等它的人會一直等下去
      var f = a.onended; a.onended = null; a.onerror = null;
      if (f) f();
    }
  }

  /* MiniMax 回的是十六進位字串包住的 mp3，要自己轉成 Blob 再播。
     播放需要使用者手勢，而 🔊 本身就是點出來的，所以不會被自動播放政策擋。 */
  function speakMiniMax(text, lang, onstart) {
    var cfg = loadCfg();
    var key = cfg.keys.minimax;
    if (!key) return Promise.reject(new Error('朗讀需要 MiniMax token。'));
    stopSpeak();
    var vid = cfg.tts[lang === 'en' ? 'enVoice' : 'voice'] || (lang === 'en' ? MM_TTS.en : MM_TTS.zh);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 45000);
    return fetch(MM_TTS.url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: cfg.tts.model || MM_TTS.model,
        text: String(text).slice(0, 1500),
        stream: false,
        voice_setting: { voice_id: vid, speed: cfg.tts.speed },
        audio_setting: { format: 'mp3', sample_rate: 32000 }
      })
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(explainHttp(res.status, t)); });
      return res.json();
    }).then(function (j) {
      clearTimeout(timer);
      checkBaseResp(j);
      var hex = j && j.data && j.data.audio;
      if (!hex) throw new Error('沒有拿到語音資料。');
      var bytes = new Uint8Array(hex.length / 2);
      for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      var url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
      return new Promise(function (done, fail) {
        mmAudio = new Audio(url);
        mmAudio.onended = function () { URL.revokeObjectURL(url); done(); };
        mmAudio.onerror = function () { URL.revokeObjectURL(url); fail(new Error('這段語音播不出來。')); };
        if (onstart) onstart();
        mmAudio.play().catch(function () { URL.revokeObjectURL(url); fail(new Error('瀏覽器擋住了自動播放。')); });
      });
    }, function (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('語音合成等太久了。');
      if (err instanceof TypeError) throw new Error('連不到語音合成服務。');
      throw err;
    });
  }

  /* MiniMax 的音色清單直接跟 API 要，才不會寫死在程式裡過期。抓一次就記住。 */
  var mmVoices = null, mmVoicesLoading = null;
  function loadMMVoices() {
    if (mmVoices) return Promise.resolve(mmVoices);
    if (mmVoicesLoading) return mmVoicesLoading;
    var key = loadCfg().keys.minimax;
    if (!key) return Promise.reject(new Error('需要 MiniMax token 才能取得音色清單。'));
    mmVoicesLoading = fetch(MM_TTS.listUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ voice_type: 'system' })
    }).then(function (r) { return r.json(); }).then(function (j) {
      checkBaseResp(j);
      mmVoices = (j.system_voice || []).map(function (v) {
        return { id: v.voice_id, name: v.voice_name || v.voice_id,
                 desc: (v.description && v.description[0]) || '' };
      });
      return mmVoices;
    }).catch(function (e) { mmVoicesLoading = null; throw e; });
    return mmVoicesLoading;
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
    } else {
      // 按鈕沒出現一定要講原因，不然使用者只會覺得「功能不見了」
      say(micNote, '（' + (sttWhy() || '這台裝置沒有可用的語音辨識。') + '）');
    }
    var sendBtn = Kit.button('送出', function () { send(input, body); }, 'primary');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input, body); }
    });

    var row = el('div', { class: 'tutor-row' }, micBtn ? [input, micBtn, sendBtn] : [input, sendBtn]);

    /* 勾起來就自動唸出回覆。狀態存進設定，下次打開還在。
       瀏覽器的自動播放政策要有使用者手勢——按「送出」就是手勢，所以這樣是可以的。 */
    var autoBox = el('input', { type: 'checkbox' });
    autoBox.checked = !!loadCfg().tts.auto;
    autoBox.addEventListener('change', function () {
      var c = loadCfg(); c.tts.auto = autoBox.checked; saveCfg(c);
      if (!autoBox.checked) stopSpeak();
    });
    var opts = el('div', { class: 'tutor-opts' }, [
      el('label', {}, [autoBox, el('span', { text: ' 🔊 自動唸出回覆' })])
    ]);
    if (!canSpeak('zh') && !canSpeak('en')) opts.hidden = true;

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(micNote);
    panel.appendChild(opts);
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
    stopSpeak();
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
      if (canSpeak(lang)) {
        /* MiniMax 那條路要連網合成（約 3 秒），按鈕上要看得出正在忙 */
        var playing = false;
        var b = Kit.button('🔊', function () { play(); }, 'small');
        b.className += ' tutor-say';
        span.parentNode.appendChild(b);
        function reset(msg) {
          playing = false; b.disabled = false; b.textContent = '🔊';
          if (msg) b.title = msg;
        }
        function play() {
          if (playing) { stopSpeak(); return; }        // 播放中再按一次＝停下來
          b.disabled = true; b.textContent = '⏳';     // MiniMax 要連網合成，約 3 秒
          speak(clean, lang, function () {
            playing = true; b.disabled = false; b.textContent = '⏹';
          }).then(function () { reset(); }, function (e) { reset(e.message); });
        }
        if (loadCfg().tts.auto) play();
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
    if (sttEngine() === 'web') { webMic(btn, input, note); return; }
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
  /* 瀏覽器內建那條路：邊講邊出字，所以直接把逐字稿寫進輸入框。
     停下來的判斷交給瀏覽器（不講話就自己結束），也可以按「停止」提早收。 */
  function webMic(btn, input, note) {
    var base = input.value ? input.value + ' ' : '';
    var r;
    try { r = webRecognizer(onText, onErr, onEnd); } catch (e) { say(note, '⚠ 這台裝置叫不出語音辨識。'); return; }
    var failed = false;
    function onText(t) { input.value = base + t; }
    function onErr(e) { failed = true; say(note, '⚠ ' + e.message); }
    function onEnd(finalText) {
      rec = null; resetMic(btn);
      if (failed) return;
      if (finalText) { input.value = base + finalText; input.focus(); say(note, '聽到的是這樣，可以改，然後按「送出」。'); }
      else { input.value = base; say(note, '沒聽清楚，再說一次看看。'); }
    }
    rec = { stop: function () { try { r.stop(); } catch (e) { /* 忽略 */ } } };
    btn.textContent = '⏹ 停止';
    btn.className += ' tutor-rec';
    say(note, '🔴 聽你說…講完會自己停，也可以按「停止」。');
    try { r.start(); } catch (e) { rec = null; resetMic(btn); say(note, '⚠ 麥克風叫不起來。'); }
  }

  function resetMic(btn) {
    btn.textContent = '🎤 用說的';
    btn.disabled = false;
    btn.className = btn.className.replace(/\s*tutor-rec/, '');
  }

  /* 章節頁上的入口。沒設定 token 就回 null，app.js 什麼都不會加。 */
  var btnWatch = null;
  function chapterButton() {
    if (!enabled()) return null;
    var b = Kit.button('🧑‍🏫 問這一章的小老師', function () { openChat(); }, 'primary');
    b.className += ' tutor-chapter-btn';

    /* 章節頁上如果連浮動鈕一起顯示，同一個入口會出現兩次。
       但章節很長，這顆按鈕捲上去之後又點不到——所以讓浮動鈕
       只在這顆被捲出畫面之後才現身。 */
    if (btnWatch) { btnWatch.disconnect(); btnWatch = null; }
    if (typeof IntersectionObserver === 'function') {
      btnWatch = new IntersectionObserver(function (es) {
        showFab(!es[0].isIntersecting);
      });
      // 元素還沒進 DOM，等 app.js 掛上去再觀察
      setTimeout(function () { if (btnWatch && b.parentNode) btnWatch.observe(b); }, 0);
      showFab(false);
    } else {
      // 沒有 IntersectionObserver（很舊的瀏覽器）就單純不顯示浮動鈕
      showFab(false);
    }
    return b;
  }

  /* ---------------- 浮動按鈕 ---------------- */
  function showFab(on) {
    var f = document.getElementById('tutorFab');
    if (f) f.hidden = !on;
  }
  function mountFab() {
    var old = document.getElementById('tutorFab');
    if (!enabled()) { if (old) old.remove(); return; }
    if (old) return;
    var fab = Kit.button('🧑‍🏫 問小老師', openChat, 'primary');
    fab.id = 'tutorFab';
    fab.className += ' tutor-fab';
    document.body.appendChild(fab);
  }

  /* 離開章節頁（回首頁、進練習區）時，浮動鈕要自己回來。
     app.js 重畫完才知道有沒有章節按鈕，所以排到這一輪之後再看 DOM。 */
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', function () {
      setTimeout(function () {
        if (!document.querySelector('.tutor-chapter-btn')) {
          if (btnWatch) { btnWatch.disconnect(); btnWatch = null; }
          showFab(true);
        }
      }, 0);
    });
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
            '要用的話請<b>家長</b>自己申請 API token 貼在下面。token 只存在這台裝置的瀏覽器，' +
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

    /* ---------- 金鑰：兩家都列出來 ----------
       問答、語音提問、朗讀可以分別用不同家，所以兩個欄位一起顯示，
       不再跟著問答的下拉選單變。 */
    var groqIn = el('input', {
      type: 'password', class: 'tutor-field', autocomplete: 'off', spellcheck: 'false',
      placeholder: 'Groq token（console.groq.com，gsk_…）', value: cfg.keys.groq || ''
    });
    var mmIn = el('input', {
      type: 'password', class: 'tutor-field', autocomplete: 'off', spellcheck: 'false',
      placeholder: 'MiniMax token（platform.minimax.io，sk-…）', value: cfg.keys.minimax || ''
    });
    card.appendChild(el('h4', { class: 'tutor-sec', text: '① API token（兩家可以只填一家，也可以都填）' }));
    card.appendChild(groqIn);
    card.appendChild(mmIn);

    /* ---------- 問答 ---------- */
    card.appendChild(el('h4', { class: 'tutor-sec', text: '② 問答用哪一家' }));
    var sel = el('select', { class: 'tutor-field' });
    Object.keys(PROVIDERS).forEach(function (id) {
      var o = el('option', { value: id, text: PROVIDERS[id].label });
      if (id === cfg.provider) o.selected = true;
      sel.appendChild(o);
    });
    var modelIn = el('input', {
      type: 'text', class: 'tutor-field', spellcheck: 'false',
      placeholder: '模型名稱（留空用 ' + PROVIDERS[cfg.provider].model + '）', value: cfg.model || ''
    });
    sel.addEventListener('change', function () {
      modelIn.placeholder = '模型名稱（留空用 ' + PROVIDERS[sel.value].model + '）';
    });
    card.appendChild(sel);
    card.appendChild(modelIn);

    /* ---------- 語音提問 ---------- */
    card.appendChild(el('h4', { class: 'tutor-sec', text: '③ 語音提問 🎤' }));
    var sttSel = el('select', { class: 'tutor-field' });
    [['auto', '自動挑一條能用的（建議）'],
     ['groq', 'Groq whisper-large-v3-turbo（最準，直接輸出繁體）'],
     ['web', '瀏覽器內建（不用 token，Firefox 沒有這功能）'],
     ['minimax', 'MiniMax asr-1.0（只輸出簡體，會用 OpenCC 轉繁體）'],
     ['off', '關閉']].forEach(function (o) {
      var op = el('option', { value: o[0], text: o[1] });
      if (cfg.stt === o[0]) op.selected = true;
      sttSel.appendChild(op);
    });
    var sttHint = el('p', { class: 'src-note' });
    card.appendChild(sttSel);
    card.appendChild(sttHint);

    /* ---------- 朗讀 ---------- */
    card.appendChild(el('h4', { class: 'tutor-sec', text: '④ 朗讀 🔊' }));
    var ttsSel = el('select', { class: 'tutor-field' });
    [['browser', '瀏覽器內建（免費、不連網、離線可用）'],
     ['minimax', 'MiniMax T2A（自然很多，但要連網、依字數計費）'],
     ['off', '關閉']].forEach(function (o) {
      var op = el('option', { value: o[0], text: o[1] });
      if (cfg.tts.engine === o[0]) op.selected = true;
      ttsSel.appendChild(op);
    });
    var zhSel = el('select', { class: 'tutor-field' });
    var enSel = el('select', { class: 'tutor-field' });
    var mmModel = el('select', { class: 'tutor-field' });
    MM_TTS.models.forEach(function (m) {
      var op = el('option', { value: m, text: '模型：' + m });
      if (cfg.tts.model === m) op.selected = true;
      mmModel.appendChild(op);
    });
    var speed = Kit.slider('語速', {
      min: 0.5, max: 1.5, step: 0.05, value: cfg.tts.speed,
      format: function (v) { return v.toFixed(2) + '×'; }
    });
    var autoTts = el('input', { type: 'checkbox' });
    if (cfg.tts.auto) autoTts.checked = true;
    var tryBtn = Kit.button('▶ 試聽', function () { preview(); }, 'small');
    var tryEn = Kit.button('▶ 試聽英文', function () { preview('en'); }, 'small');
    var ttsHint = el('p', { class: 'src-note' });
    var ttsRow = el('div', { class: 'pr-actions' }, [tryBtn, tryEn]);
    card.appendChild(ttsSel);
    card.appendChild(zhSel);
    card.appendChild(enSel);
    card.appendChild(mmModel);
    card.appendChild(speed.wrap);
    card.appendChild(el('label', { class: 'ctl' }, [autoTts,
      el('span', { text: ' 小老師回答完就自動唸出來（對話視窗裡也有同一個開關）' })]));
    card.appendChild(ttsRow);
    card.appendChild(ttsHint);

    /* ---------- 記住與狀態 ---------- */
    var remember = el('input', { type: 'checkbox' });
    if (cfg.remember) remember.checked = true;
    var where = el('p', { class: 'src-note' });
    var status = el('p', { class: 'pr-fb', 'aria-live': 'polite' });

    card.appendChild(el('h4', { class: 'tutor-sec', text: '⑤ 儲存' }));
    card.appendChild(el('label', { class: 'ctl' }, [remember, el('span', {
      html: ' <b>把 token 記在這台裝置</b>（存進瀏覽器的 <code>localStorage</code>，下次打開不用重貼）'
    })]));
    card.appendChild(where);

    var save = Kit.button('儲存並測試問答', function () { doSave(true); }, 'primary');
    var clear = Kit.button('全部清除', function () {
      clearCfg();
      groqIn.value = ''; mmIn.value = '';
      status.className = 'pr-fb';
      status.textContent = '已清除，小老師關閉，網站回到完全離線。';
      if (panel) { panel.remove(); panel = null; history = null; }
      mountFab(); refresh();
    });
    card.appendChild(el('div', { class: 'pr-actions' }, [save, clear]));
    card.appendChild(status);

    /* ---------- 這張卡自己的邏輯 ---------- */
    function collect() {
      var c = loadCfg();
      c.keys = c.keys || {};
      if (groqIn.value.trim()) c.keys.groq = groqIn.value.trim(); else delete c.keys.groq;
      if (mmIn.value.trim()) c.keys.minimax = mmIn.value.trim(); else delete c.keys.minimax;
      c.provider = sel.value;
      c.model = modelIn.value.trim();
      c.stt = sttSel.value;
      c.tts = {
        engine: ttsSel.value,
        voice: zhSel.value || '',
        enVoice: enSel.value || '',
        model: mmModel.value,
        speed: parseFloat(speed.input.value),
        auto: autoTts.checked
      };
      c.remember = remember.checked;
      return c;
    }
    function doSave(test) {
      saveCfg(collect());
      refresh();
      if (panel) { panel.remove(); panel = null; history = null; }
      mountFab();
      if (!test) return;
      if (!chatKey()) {
        status.className = 'pr-fb';
        status.textContent = '已儲存。問答那一家還沒有 token，所以小老師不會出現。';
        return;
      }
      status.className = 'pr-fb';
      status.textContent = '測試中…';
      ask([{ role: 'user', content: '回覆兩個字：可以' }], { timeout: 25000 })
        .then(function (t) {
          if (!t) throw new Error('沒有收到回覆內容，token 或模型名稱可能有問題。');
          status.className = 'pr-fb ok';
          status.textContent = '✅ 問答可以用了。小老師回：' + t.slice(0, 20);
        })
        .catch(function (e) {
          status.className = 'pr-fb no';
          status.textContent = '❌ ' + e.message;
        });
    }
    /* 試聽用當下畫面上的設定，不必先按儲存 */
    function preview(lang) {
      saveCfg(collect());   // 試聽用當下的設定，不必先按儲存
      var txt = lang === 'en'
        ? 'How many apples do you have? I have twelve apples.'
        : '通分就是把兩個分數的分母變成一樣，這樣才比較容易加減。';
      ttsHint.textContent = '合成中…';
      speak(txt, lang || 'zh').then(function () {
        ttsNote();
      }, function (e) {
        ttsHint.textContent = '⚠ ' + e.message;
      });
    }

    function fillBrowserVoices() {
      [['zh', zhSel, cfg.tts.voice], ['en', enSel, cfg.tts.enVoice]].forEach(function (x) {
        var lang = x[0], node = x[1], cur = x[2];
        node.innerHTML = '';
        node.appendChild(el('option', { value: '', text: (lang === 'zh' ? '中文' : '英文') + '音色：自動挑' }));
        browserVoices(lang).forEach(function (v) {
          var op = el('option', { value: v.voiceURI, text: (lang === 'zh' ? '中文' : '英文') + '：' + v.name + '（' + v.lang + '）' });
          if (cur === v.voiceURI) op.selected = true;
          node.appendChild(op);
        });
      });
    }
    function fillMMVoices() {
      [['zh', zhSel, cfg.tts.voice, 'Chinese'], ['en', enSel, cfg.tts.enVoice, 'English']].forEach(function (x) {
        var node = x[1];
        node.innerHTML = '';
        node.appendChild(el('option', { value: '', text: '載入音色清單中…' }));
        void x;
      });
      loadMMVoices().then(function (vs) {
        [['zh', zhSel, cfg.tts.voice, 'Chinese', MM_TTS.zh],
         ['en', enSel, cfg.tts.enVoice, 'English', MM_TTS.en]].forEach(function (x) {
          var node = x[1], cur = x[2], pre = x[3], dflt = x[4];
          node.innerHTML = '';
          node.appendChild(el('option', { value: '', text: (pre === 'Chinese' ? '中文' : '英文') + '音色：預設（' + dflt + '）' }));
          vs.filter(function (v) { return v.id.indexOf(pre) === 0; }).forEach(function (v) {
            var op = el('option', { value: v.id, text: (pre === 'Chinese' ? '中文' : '英文') + '：' + v.name + (v.desc ? '　' + v.desc.slice(0, 40) : '') });
            if (cur === v.id) op.selected = true;
            node.appendChild(op);
          });
        });
        ttsNote();
      }, function (e) {
        zhSel.innerHTML = ''; enSel.innerHTML = '';
        zhSel.appendChild(el('option', { value: '', text: '拿不到音色清單：' + e.message }));
        enSel.appendChild(el('option', { value: '', text: '（同上）' }));
      });
    }

    function sttNote() {
      var e = sttEngine();
      sttHint.textContent = '目前實際會用：' + (
        e === 'groq' ? 'Groq Whisper（繁體）。' :
        e === 'web' ? '瀏覽器內建（不用 token；聲音會送到 Chrome→Google／Safari→Apple）。' :
        e === 'minimax' ? 'MiniMax asr-1.0 ＋ OpenCC 轉臺灣正體。' :
        '沒有可用的——' + (sttWhy() || '缺 token') + ' 🎤 不會出現。'
      );
    }
    function ttsNote() {
      var e = ttsEngine();
      var t = '目前實際會用：' + (
        e === 'minimax' ? 'MiniMax T2A（連網合成，約 3 秒；中文音色都是標準普通話，沒有臺灣腔可選）。' :
        e === 'browser' ? '瀏覽器內建（免費、離線）。' :
        '沒有可用的——' + (ttsWhy() || '未知') + ' 🔊 不會出現。'
      );
      if (e === 'browser' && !browserVoices('zh').length) {
        t += '　⚠ 這台裝置沒有裝中文語音，中文可能唸不出來（Windows 要另外裝語言包，Edge 內建線上語音）。';
      }
      ttsHint.textContent = t;
    }
    function whereNote() {
      var inLocal = false, inSession = false;
      try { inLocal = !!localStorage.getItem(K); inSession = !!sessionStorage.getItem(K); } catch (e) { /* 忽略 */ }
      where.textContent = inLocal
        ? '目前狀態：token 存在這台裝置的 localStorage，關掉瀏覽器也還在。按「全部清除」可以刪掉。'
        : inSession
          ? '目前狀態：token 只存在這次瀏覽階段（sessionStorage），關掉瀏覽器就會消失。'
          : '目前狀態：這台裝置還沒有存任何 token。';
    }
    /* 換引擎就換一整組音色選單，並把用不到的欄位收起來 */
    function refresh() {
      var mm = ttsSel.value === 'minimax';
      var off = ttsSel.value === 'off';
      zhSel.hidden = off; enSel.hidden = off;
      mmModel.hidden = !mm;
      speed.wrap.hidden = off;
      ttsRow.hidden = off;
      autoTts.parentNode.hidden = off;
      if (off) { ttsNote(); whereNote(); sttNote(); return; }
      if (mm) fillMMVoices(); else fillBrowserVoices();
      sttNote(); ttsNote(); whereNote();
    }
    sttSel.addEventListener('change', function () { saveCfg(collect()); sttNote(); });
    /* 這幾個沒有專屬的儲存按鈕（「儲存並測試問答」名字上只管問答），
       所以一改就存，不然家長在這裡勾了自動朗讀，對話視窗那邊卻沒勾。 */
    [zhSel, enSel, mmModel, autoTts, speed.input].forEach(function (n) {
      n.addEventListener('change', function () { saveCfg(collect()); });
    });
    ttsSel.addEventListener('change', function () {
      /* 一定要先清空音色選單再 collect()：不然瀏覽器的 voiceURI 會被存成
         MiniMax 的 voice_id，之後按 🔊 會被對方退回。清空後 .value 是 ''，
         等於「用預設音色」，refresh() 再依新引擎重填。 */
      zhSel.innerHTML = ''; enSel.innerHTML = '';
      cfg = loadCfg();
      saveCfg(collect());
      refresh();
    });
    groqIn.addEventListener('change', function () { saveCfg(collect()); sttNote(); ttsNote(); whereNote(); });
    mmIn.addEventListener('change', function () { saveCfg(collect()); sttNote(); ttsNote(); whereNote(); });
    /* Windows 的 Chrome 要等 voiceschanged 才拿得到語音清單 */
    if (CAN_SPEAK) {
      try {
        window.speechSynthesis.addEventListener('voiceschanged', function () {
          if (ttsSel.value === 'browser') { fillBrowserVoices(); ttsNote(); }
        });
      } catch (e) { /* 忽略 */ }
    }
    refresh();
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
