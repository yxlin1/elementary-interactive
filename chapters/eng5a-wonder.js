/* ============================================================
   教具 eng5a-u0 Get Ready 字母拼讀與數字
        eng5a-u1 The Best Drink        eng5a-u2 Let's Make Fruit Salad
        eng5a-u3 A Fun Day             eng5a-u4 My Favorite Subject
        eng5a-u5 Culture & Festivals（Chinese New Year）
   康軒 Wonder World 5（115 五上）

   ⚠️ 課本的故事與短文是出版社的著作，這裡<b>一句都不引用</b>。
      字彙與句型取自課程計畫列出的教學重點，例句全部另外寫。
   ⚠️ 這個網站沒有聲音檔（要能離線用）。發音示範靠瀏覽器內建的
      朗讀功能，有就顯示 🔊，沒有就自動隱藏。
      <b>所有練習題都不需要聽聲音就能作答</b>，看拼字規則就答得出來。
   ============================================================ */

(function () {

  const FONT = '"Microsoft JhengHei", "PingFang TC", sans-serif';
  const EN = '"Segoe UI", Arial, sans-serif';
  const C = {
    bg: '#0e1726', card: '#16233a', line: '#2b3f63',
    text: '#e8eefc', muted: '#93a3c4', accent: '#4da3ff', purple: '#7c5cff',
    ok: '#34d399', no: '#fb7185', warn: '#fbbf24', eng: '#22d3ee'
  };

  const pick = Kit.pick, shuffle = Kit.shuffle, randInt = Kit.randInt;

  function pick4(right, wrongs) {
    const w = shuffle(wrongs.filter(function (x) { return x !== right; })).slice(0, 3);
    const all = shuffle([right].concat(w));
    return { choices: all, answer: all.indexOf(right) };
  }
  function shuffled(items) {
    const a = shuffle(items);
    return { choices: a.map(function (x) { return x.t; }), answer: a.findIndex(function (x) { return x.ok; }) };
  }

  /* ---------- 朗讀（有就用，沒有就算了；離線也能運作） ---------- */
  const CAN_SPEAK = (typeof window !== 'undefined') && ('speechSynthesis' in window);
  function speak(text) {
    if (!CAN_SPEAK) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 沒有語音就安靜略過 */ }
  }
  function speakBtn(label, getText) {
    if (!CAN_SPEAK) return null;
    return Kit.button('🔊 ' + label, function () { speak(getText()); });
  }

  /* ---------- 畫布小工具 ---------- */
  function clear(cv) { const ctx = cv.ctx; cv.clear(C.bg); return ctx; }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function title(ctx, x, y, text, color) {
    ctx.save();
    ctx.fillStyle = color || C.eng; ctx.font = 'bold 16px ' + FONT;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(text, x, y); ctx.restore();
  }
  function panel(ctx, x, y, w) {
    let cy = y;
    return function (text, color, size, gap) {
      text = String(text).replace(/<[^>]+>/g, '');
      size = size || 14;
      ctx.save();
      ctx.fillStyle = color || C.text; ctx.font = size + 'px ' + FONT;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      let line = '';
      const push = function () { if (line) { ctx.fillText(line, x, cy); cy += size + 6; line = ''; } };
      const words = text.split(' ');
      for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === '\n') { push(); continue; }
        if (ctx.measureText(line + c).width > w && line) {
          if ('，。、；：？！」）'.indexOf(c) >= 0) { ctx.fillText(line + c, x, cy); cy += size + 6; line = ''; continue; }
          push();
        }
        line += c;
      }
      push(); cy += (gap || 0); ctx.restore();
      return cy;
    };
  }
  /* 把單字畫出來，把目標拼字片段換色 */
  function drawWord(ctx, x, y, word, part, size, base, hot) {
    ctx.save();
    ctx.font = 'bold ' + size + 'px ' + EN;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const lower = word.toLowerCase();
    let idx = -1;
    if (part) {
      if (part.indexOf('_') >= 0) {
        /* a_e 這種：找 a?e 的位置 */
        const a = part.charAt(0), b = part.charAt(2);
        for (let i = 0; i < lower.length - 2; i++) {
          if (lower.charAt(i) === a && lower.charAt(i + 2) === b) { idx = i; break; }
        }
      } else idx = lower.indexOf(part);
    }
    let cx = x;
    for (let i = 0; i < word.length; i++) {
      const inPart = part && idx >= 0 &&
        (part.indexOf('_') >= 0
          ? (i === idx || i === idx + 2)
          : (i >= idx && i < idx + part.length));
      ctx.fillStyle = inPart ? (hot || C.warn) : (base || C.text);
      ctx.fillText(word.charAt(i), cx, y);
      cx += ctx.measureText(word.charAt(i)).width;
    }
    ctx.restore();
    return cx - x;
  }


  /* ============================================================
     字母拼讀資料
     只收「乾淨符合規則」的單字：
       ea 只收長音 e（eat/sea），不收 bread 那種；
       ow 只收長音 o（snow/slow），不收 cow/now 那種。
     ============================================================ */
  const PHONICS = [
    {
      set: 'a', unit: 0, long: '長母音 a', say: '唸起來就像字母 A 的名字',
      short: { p: 'a', words: ['cat', 'hat', 'map', 'bag', 'hand'], say: '短母音 a' },
      pats: [
        { p: 'a_e', words: ['cake', 'name', 'game', 'late', 'gate', 'plane', 'grape', 'snake'] },
        { p: 'ai', words: ['rain', 'train', 'paint', 'wait', 'sail', 'mail', 'chain'] },
        { p: 'ay', words: ['day', 'play', 'say', 'way', 'stay', 'gray', 'today'] }
      ]
    },
    {
      set: 'e', unit: 1, long: '長母音 e', say: '唸起來就像字母 E 的名字',
      short: { p: 'e', words: ['bed', 'pen', 'ten', 'red', 'egg'], say: '短母音 e' },
      pats: [
        { p: 'e_e', words: ['these', 'Pete', 'eve', 'complete'] },
        { p: 'ea', words: ['eat', 'sea', 'tea', 'meat', 'leaf', 'clean', 'beach'] },
        { p: 'ee', words: ['see', 'tree', 'three', 'green', 'sleep', 'feet', 'week', 'sweet'] }
      ]
    },
    {
      set: 'i', unit: 2, long: '長母音 i', say: '唸起來就像字母 I 的名字',
      short: { p: 'i', words: ['pig', 'sit', 'big', 'fish', 'milk'], say: '短母音 i' },
      pats: [
        { p: 'i_e', words: ['bike', 'nine', 'kite', 'time', 'ride', 'five', 'smile', 'white'] },
        { p: 'ie', words: ['pie', 'tie', 'lie', 'die'] },
        { p: 'igh', words: ['light', 'night', 'high', 'right', 'bright', 'sight'] }
      ]
    },
    {
      set: 'o', unit: 3, long: '長母音 o', say: '唸起來就像字母 O 的名字',
      short: { p: 'o', words: ['dog', 'box', 'hot', 'top', 'pot'], say: '短母音 o' },
      pats: [
        { p: 'o_e', words: ['nose', 'home', 'bone', 'rose', 'note', 'phone', 'stone'] },
        { p: 'oa', words: ['boat', 'coat', 'road', 'soap', 'goat', 'toast'] },
        { p: 'ow', words: ['snow', 'slow', 'grow', 'know', 'low', 'window', 'yellow'] }
      ]
    },
    {
      set: 'u', unit: 4, long: '長母音 u', say: '有兩種唸法：像字母 U 的名字（cute），或是「ㄨ」的音（June）',
      short: { p: 'u', words: ['bus', 'cup', 'sun', 'run', 'duck'], say: '短母音 u' },
      pats: [
        { p: 'u_e', words: ['cute', 'June', 'tune', 'rude', 'flute', 'use'] },
        { p: 'ue', words: ['blue', 'glue', 'true', 'clue'] },
        { p: 'ui', words: ['fruit', 'juice', 'suit'] }
      ]
    }
  ];

  const ALL_PATS = (function () {
    const a = [];
    PHONICS.forEach(function (g) { g.pats.forEach(function (p) { a.push({ set: g.set, p: p.p, words: p.words }); }); });
    return a;
  })();
  function patOf(word) {
    for (let i = 0; i < ALL_PATS.length; i++) {
      if (ALL_PATS[i].words.indexOf(word) >= 0) return ALL_PATS[i];
    }
    return null;
  }

  /* ---------- 各課字彙 ---------- */
  const DRINKS = [
    { e: 'coffee', z: '咖啡' }, { e: 'cola', z: '可樂' }, { e: 'lemonade', z: '檸檬水' },
    { e: 'tea', z: '茶' }, { e: 'bubble tea', z: '珍珠奶茶' },
    { e: 'hot chocolate', z: '熱巧克力' }, { e: 'soymilk', z: '豆漿' }
  ];
  const FRUITS = [
    { e: 'apple', p: 'apples', z: '蘋果' }, { e: 'banana', p: 'bananas', z: '香蕉' },
    { e: 'grape', p: 'grapes', z: '葡萄' }, { e: 'guava', p: 'guavas', z: '芭樂' },
    { e: 'papaya', p: 'papayas', z: '木瓜' }, { e: 'pineapple', p: 'pineapples', z: '鳳梨' },
    { e: 'orange', p: 'oranges', z: '柳橙' }
  ];
  const DAYS = [
    { e: 'Sunday', z: '星期日', n: 0 }, { e: 'Monday', z: '星期一', n: 1 },
    { e: 'Tuesday', z: '星期二', n: 2 }, { e: 'Wednesday', z: '星期三', n: 3 },
    { e: 'Thursday', z: '星期四', n: 4 }, { e: 'Friday', z: '星期五', n: 5 },
    { e: 'Saturday', z: '星期六', n: 6 }
  ];
  const SUBJECTS = [
    { e: 'art', z: '美術', cap: false }, { e: 'Chinese', z: '國語', cap: true },
    { e: 'English', z: '英語', cap: true }, { e: 'math', z: '數學', cap: false },
    { e: 'music', z: '音樂', cap: false }, { e: 'PE', z: '體育', cap: true },
    { e: 'science', z: '自然', cap: false }, { e: 'social studies', z: '社會', cap: false }
  ];
  const CNY = [
    { e: 'firecrackers', z: '鞭炮' }, { e: 'lion dance', z: '舞獅' },
    { e: 'lucky money', z: '紅包' }, { e: 'rice cake', z: '年糕' },
    { e: 'spring couplet', z: '春聯' }, { e: 'tangerines', z: '橘子' }
  ];
  const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  /* 拼字誘答：換一個字母、少一個字母、字母顛倒 */
  function misspell(word) {
    const w = word.replace(/ /g, '');
    const outs = [];
    if (w.length > 3) {
      outs.push(w.slice(0, 2) + w.charAt(3) + w.charAt(2) + w.slice(4));      // 兩個字母對調
      outs.push(w.slice(0, w.length - 2) + w.slice(w.length - 1));            // 少一個字母
      outs.push(w.replace(/ee/, 'ea').replace(/oa/, 'ao').replace(/ai/, 'ia'));
      const dbl = w.charAt(1);
      outs.push(w.charAt(0) + dbl + w.slice(1));                              // 多一個字母
    }
    return outs.filter(function (x) { return x && x !== w; });
  }


  /* ============================================================
     Get Ready　字母拼讀與數字
     ============================================================ */
  Kit.register('eng5a-u0', {

    intro: '英語的字母拼讀（phonics）就是「看到這樣的拼法，大概就知道怎麼唸」。切換兩個模式：<b>長短母音</b>看同一個母音字母的兩種唸法，<b>拼法對照</b>看同一個音可以用哪幾種拼法寫出來。' +
      (CAN_SPEAK ? '按 🔊 可以聽發音。' : '（這台裝置沒有內建朗讀功能，所以沒有聲音；不影響練習。）'),

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vowel', gi = 0;

      function paintVowel() {
        const ctx = clear(cv);
        const g = PHONICS[gi];
        title(ctx, 24, 16, '母音字母 ' + g.set.toUpperCase() + '　兩種唸法');

        /* 短母音 */
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 48, 572, 92, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = C.no; ctx.font = 'bold 15px ' + FONT;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(g.short.say + '　（' + g.set + '）', 42, 60);
        ctx.restore();
        let x = 42;
        g.short.words.forEach(function (w) {
          x += drawWord(ctx, x, 108, w, g.set, 24, C.text, C.no) + 26;
        });

        /* 長母音 */
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 152, 572, 200, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = C.ok; ctx.font = 'bold 15px ' + FONT;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(g.long + '　' + g.say, 42, 164);
        ctx.restore();

        let y = 202;
        g.pats.forEach(function (p) {
          ctx.save();
          ctx.fillStyle = C.warn; ctx.font = 'bold 20px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(p.p, 42, y);
          ctx.restore();
          let px = 116;
          p.words.slice(0, 5).forEach(function (w) {
            px += drawWord(ctx, px, y, w, p.p, 20, C.text, C.warn) + 20;
          });
          y += 44;
        });

        panel(ctx, 24, 362, 572)('黃色的字母就是造成長音的拼法。同一個長音，可以用不同的拼法寫出來。', C.muted, 13, 0);

        readout.innerHTML = '字母 <b>' + g.set.toUpperCase() + '</b>　短音 ' + g.short.words.length +
          ' 字　長音拼法 <b>' + g.pats.map(function (p) { return p.p; }).join('、') + '</b>';
      }

      function paintCompare() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '同一個長音，三種拼法');
        const g = PHONICS[gi];
        let y = 56;
        const cols = [C.accent, C.purple, C.ok];
        g.pats.forEach(function (p, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 96, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 96, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(p.p, 48, y + 12);
          ctx.restore();
          let px = 48, py = y + 62;
          p.words.forEach(function (w) {
            const wd = ctx.measureText(w).width;
            if (px > 520) return;
            px += drawWord(ctx, px, py, w, p.p, 19, C.text, cols[i]) + 18;
          });
          y += 104;
        });
        panel(ctx, 24, y + 6, 572)(
          '這三種拼法唸起來是<b>同一個音</b>，但寫法不同，所以拼字時要記住是哪一種。', C.muted, 13, 0);
        readout.innerHTML = '長母音 <b>' + g.set.toUpperCase() + '</b>：' +
          g.pats.map(function (p) { return p.p; }).join(' ／ ');
      }

      function paint() { if (mode === 'vowel') paintVowel(); else paintCompare(); }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '長短母音', value: 'vowel' }, { label: '拼法對照', value: 'cmp' }], function (v) { mode = v; paint(); }, 'vowel'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(Kit.button('◀ 上一組', function () { gi = (gi - 1 + PHONICS.length) % PHONICS.length; paint(); }));
      row.appendChild(Kit.button('下一組 ▶', function () { gi = (gi + 1) % PHONICS.length; paint(); }));
      const sb = speakBtn('唸長音例字', function () {
        return PHONICS[gi].pats.map(function (p) { return p.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      paint();
    },

    parentGuide: [
      { ask: '「cat 和 cake 的 a，唸起來一樣嗎？」', why: '短音 a 和長音 a 的差別，是整個 phonics 的起點。讓他自己念出來比較。' },
      { ask: '「cake 的 e 有沒有唸出來？」', why: '沒有。a_e 的 e 不發音，它的作用是<b>讓前面的 a 唸成長音</b>。這個觀念一通，後面 i_e、o_e 都通。' },
      { ask: '「rain 和 day 的 a，唸起來一不一樣？」', why: '一樣，都是長音 a，只是拼法不同。同音不同拼，這是英語拼字最需要多看的地方。' },
      { ask: '「這個字如果用 ai 拼，會拼成什麼樣子？」', why: '讓他發現 ai 通常在字中間、ay 通常在字尾。這是很實用的拼字規則。' },
      { ask: '「June 和 cute 的 u 一樣嗎？」', why: '不一樣。cute 唸起來像字母 U，June 是「ㄨ」的音。u_e 有兩種唸法，這一課特別要提。' },
      { ask: '「你可以再想出一個 -ee 的字嗎？」', why: '從辨認推到產出。想得出來，才是真的記住規則了。' }
    ],

    pitfalls: [
      { bad: '以為 a_e 的 e 要唸出來。', fix: 'a_e 結尾的 e <b>不發音</b>。它像一個開關，把前面的母音從短音變成長音：hat → hate、kit → kite。' },
      { bad: '以為同一個音只能有一種拼法。', fix: '長音 a 可以寫成 <b>a_e、ai、ay</b> 三種。唸起來一樣，拼起來不一樣，只能多看多寫。' },
      { bad: '把 ea 一律唸成長音 e。', fix: 'ea 其實有兩種唸法（eat 和 bread 不一樣）。這裡先學<b>長音那一種</b>，遇到例外再個別記。' },
      { bad: '把 ow 一律唸成長音 o。', fix: 'ow 也有兩種（snow 和 cow 不一樣）。這一課練的是 snow 那一種。' },
      { bad: '用注音硬記英文發音。', fix: '注音只能當提示，不能當標準。拼讀規則要靠<b>看拼字 → 唸出來</b>反覆練，注音幫不上長期的忙。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['whichPat', 'whichPat', 'samePat', 'samePat', 'longShort', 'silentE', 'sameSet', 'number', 'numberBack']);

      if (type === 'whichPat') {
        const p = pick(ALL_PATS);
        const w = pick(p.words);
        const o = pick4(p.p, ALL_PATS.map(function (x) { return x.p; }));
        return {
          tpl: 'whichPat',
          q: '單字 <b>' + w + '</b> 用的是哪一種<b>拼讀規則</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + w + '</b> 裡面的拼法是 <b>' + p.p + '</b>，唸長母音 ' + p.set.toUpperCase() + '。<br>' +
            '同樣是 ' + p.p + ' 的字還有：' + p.words.filter(function (x) { return x !== w; }).slice(0, 4).join('、') + '。<br>' +
            (p.p.indexOf('_') >= 0 ? '注意最後的 e 不發音，它的作用是把前面的母音變成長音。' : '這種拼法是兩個字母合起來發一個音。')
        };
      }

      if (type === 'samePat') {
        const p = pick(ALL_PATS);
        const two = shuffle(p.words).slice(0, 2);
        const wrongs = shuffle(ALL_PATS.filter(function (x) { return x.p !== p.p; }))
          .slice(0, 3).map(function (x) { return pick(x.words); });
        const o = pick4(two[1], wrongs);
        return {
          tpl: 'samePat',
          q: '下面哪一個字，和 <b>' + two[0] + '</b> 用<b>同一種拼讀規則</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + two[0] + '</b> 用的是 <b>' + p.p + '</b>。<br>' +
            '<b>' + two[1] + '</b> 也是 <b>' + p.p + '</b>，兩個字的母音唸法相同。<br>' +
            '作答方法：先找出題目那個字的母音拼法，再去選項裡找一樣的拼法。'
        };
      }

      if (type === 'sameSet') {
        /* u 這一組不能問「唸起來一樣」：u_e 有兩種音（cute 像字母 U、June 唸ㄨ），
           ue／ui 是ㄨ，所以 cute 和 blue 其實不同音。只拿 a／e／i／o 出這種題。 */
        const g = pick(PHONICS.filter(function (x) { return x.set !== 'u'; }));
        const p1 = pick(g.pats), p2 = pick(g.pats.filter(function (x) { return x.p !== p1.p; }));
        const right = pick(p2.words);
        const other = PHONICS.filter(function (x) { return x.set !== g.set && x.set !== 'u'; });
        const wrongs = shuffle(other).slice(0, 3).map(function (x) { return pick(pick(x.pats).words); });
        const o = pick4(right, wrongs);
        return {
          tpl: 'sameSet',
          q: '下面哪一個字，母音<b>唸起來</b>和 <b>' + pick(p1.words) + '</b> 一樣？（拼法可以不同）',
          choices: o.choices, answer: o.answer,
          steps: '題目的字用 <b>' + p1.p + '</b>，是<b>長母音 ' + g.set.toUpperCase() + '</b>。<br>' +
            '<b>' + right + '</b> 用 <b>' + p2.p + '</b>，也是長母音 ' + g.set.toUpperCase() + '。<br>' +
            '同一個長音可以有好幾種拼法：' + g.pats.map(function (x) { return x.p; }).join('、') + '。'
        };
      }

      if (type === 'longShort') {
        const g = pick(PHONICS);
        const isLong = Math.random() < 0.5;
        const w = isLong ? pick(pick(g.pats).words) : pick(g.short.words);
        const o = shuffled([
          { t: isLong ? '長母音' : '短母音', ok: true },
          { t: isLong ? '短母音' : '長母音' }
        ]);
        return {
          tpl: 'longShort',
          q: '單字 <b>' + w + '</b> 裡的母音 ' + g.set + '，是<b>長母音</b>還是<b>短母音</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + w + '</b> 是<b>' + (isLong ? '長' : '短') + '母音 ' + g.set.toUpperCase() + '</b>。<br>' +
            (isLong
              ? '長母音唸起來就像字母本身的名字，拼法是 ' + g.pats.map(function (x) { return x.p; }).join('、') + '。'
              : '短母音的字通常是「子音＋母音＋子音」，後面<b>沒有</b>不發音的 e，例如 ' + g.short.words.slice(0, 3).join('、') + '。') + '<br>' +
            '比較：' + g.short.words[0] + '（短）／ ' + g.pats[0].words[0] + '（長）。'
        };
      }

      if (type === 'silentE') {
        const pairs = [['hat', 'hate'], ['kit', 'kite'], ['not', 'note'], ['cap', 'cape'], ['pin', 'pine'], ['tub', 'tube']];
        const pr = pick(pairs);
        const o = shuffled([
          { t: '把前面的母音變成長音，e 自己不發音', ok: true },
          { t: 'e 要唸出來，變成兩個音節' },
          { t: '讓最後的子音不發音' },
          { t: '沒有作用，只是拼字習慣' }
        ]);
        return {
          tpl: 'silentE',
          q: '<b>' + pr[0] + '</b> 加上一個 e 變成 <b>' + pr[1] + '</b>，這個 e 的作用是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '字尾的 e <b>不發音</b>，但它會把前面的母音從<b>短音變長音</b>。<br>' +
            pr[0] + '（短音）→ ' + pr[1] + '（長音），母音的唸法整個改變了。<br>' +
            '這就是 a_e、i_e、o_e、u_e 這種拼法的道理。'
        };
      }

      if (type === 'number') {
        const n = randInt(1, 20);
        const o = pick4(NUMBERS[n - 1], NUMBERS);
        return {
          tpl: 'number',
          q: '數字 <b>' + n + '</b> 的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + n + ' = ' + NUMBERS[n - 1] + '</b><br>' +
            '13 到 19 都以 <b>-teen</b> 結尾（thirteen、fourteen⋯⋯）。<br>' +
            '要小心拼字特別的幾個：three、eight、nine、twelve。'
        };
      }

      // numberBack：英文 → 數字
      const n2 = randInt(1, 20);
      const right = String(n2);
      const pool = [];
      for (let i = 1; i <= 20; i++) if (i !== n2) pool.push(String(i));
      const o2 = pick4(right, pool);
      return {
        tpl: 'numberBack',
        q: '<b>' + NUMBERS[n2 - 1] + '</b> 是哪一個數字？',
        choices: o2.choices, answer: o2.answer,
        steps: '<b>' + NUMBERS[n2 - 1] + ' = ' + n2 + '</b><br>' +
          (n2 >= 13 && n2 <= 19
            ? '看到 <b>-teen</b> 結尾，就是 13 到 19 之間。'
            : '這是 1 到 12 的基本數字，要能直接反應。') + '<br>' +
          '前後對照：' + (n2 > 1 ? NUMBERS[n2 - 2] + '（' + (n2 - 1) + '）' : '') +
          (n2 > 1 && n2 < 20 ? ' ／ ' : '') + (n2 < 20 ? NUMBERS[n2] + '（' + (n2 + 1) + '）' : '') + '。'
      };
    }
  });


  /* ============================================================
     共用：字彙卡模式 + 句型模式的畫布
     ============================================================ */
  function vocabPainter(cv, list, labelZ) {
    return function (i, showZh) {
      const ctx = clear(cv);
      const v = list[i];
      title(ctx, 24, 16, labelZ + '　' + (i + 1) + ' / ' + list.length);
      ctx.save();
      ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 150, 12); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = C.eng; ctx.font = 'bold 42px ' + EN;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(v.e, 310, 108);
      if (showZh) {
        ctx.fillStyle = C.text; ctx.font = '26px ' + FONT;
        ctx.fillText(v.z, 310, 166);
      } else {
        ctx.fillStyle = C.muted; ctx.font = '16px ' + FONT;
        ctx.fillText('（按「看中文」）', 310, 166);
      }
      ctx.restore();
      return ctx;
    };
  }


  /* ============================================================
     Unit 1　The Best Drink
     字彙：coffee, cola, lemonade, tea, bubble tea, hot chocolate, soymilk
     句型：Do you like ...? / Does he (she) like ...?
     拼讀：e_e, ea, ee
     ============================================================ */
  Kit.register('eng5a-u1', {

    intro: '問別人喜不喜歡一種飲料。重點是<b>問「你」和問「他」用的動詞不一樣</b>：你用 Do，他用 Does。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', vi = 0, showZh = false, subj = 0, di = 0, likes = true;
      /* a 是回答時的主詞。逗號後面除了 I 以外都要小寫：No, she doesn't. */
      const SUBJ = [
        { s: 'you', d: 'Do', v: 'like', a: 'I', av: 'do', neg: "don't", z: '你' },
        { s: 'he', d: 'Does', v: 'like', a: 'he', av: 'does', neg: "doesn't", z: '他' },
        { s: 'she', d: 'Does', v: 'like', a: 'she', av: 'does', neg: "doesn't", z: '她' }
      ];
      const paintVocab = vocabPainter(cv, DRINKS, '飲料字彙');

      function paintPattern() {
        const ctx = clear(cv);
        const S = SUBJ[subj], d = DRINKS[di];
        title(ctx, 24, 16, '句型：問喜好');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 50, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 26px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 44;
        const parts = [
          { t: S.d, c: C.warn }, { t: ' ' + S.s + ' ', c: C.text },
          { t: 'like', c: C.accent }, { t: ' ' + d.e + '?', c: C.text }
        ];
        parts.forEach(function (p) { ctx.fillStyle = p.c; ctx.fillText(p.t, x, 82); x += ctx.measureText(p.t).width; });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + S.z + '喜歡' + d.z + '嗎？）', 44, 116);
        ctx.restore();

        /* 兩種回答 */
        const ansY = 152;
        [{ ok: true }, { ok: false }].forEach(function (o, i) {
          const yy = ansY + i * 68;
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, yy, 572, 58, 10); ctx.fill();
          ctx.fillStyle = o.ok ? C.ok : C.no; roundRect(ctx, 24, yy, 8, 58, 4); ctx.fill();
          ctx.font = 'bold 21px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          const txt = o.ok
            ? 'Yes, ' + S.a + ' ' + S.av + '.'
            : 'No, ' + S.a + ' ' + S.neg + '.';
          ctx.fillStyle = o.ok ? C.ok : C.no;
          ctx.fillText(txt, 48, yy + 29);
          ctx.fillStyle = C.muted; ctx.font = '14px ' + FONT;
          ctx.textAlign = 'right';
          ctx.fillText(o.ok ? '肯定' : '否定', 580, yy + 29);
          ctx.restore();
        });

        const w = panel(ctx, 24, 296, 572);
        w('主詞是 you → 用 <b>Do</b>；主詞是 he / she → 用 <b>Does</b>。', C.warn, 15, 6);
        w('注意：問句已經有 Does 了，後面的 like <b>不能再加 s</b>。', C.no, 14, 6);
        w('（直述句才加 s：He likes tea.）', C.muted, 13, 0);

        readout.innerHTML = '<b>' + S.d + ' ' + S.s + ' like ' + d.e + '?</b>　' +
          '<span class="muted">' + S.z + '／' + d.z + '</span>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = PHONICS[1];   // e
        title(ctx, 24, 16, '本課拼讀：長母音 E（e_e ／ ea ／ ee）');
        let y = 54;
        const cols = [C.accent, C.purple, C.ok];
        g.pats.forEach(function (p, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 92, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 92, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(p.p, 48, y + 12);
          ctx.restore();
          let px = 48;
          p.words.slice(0, 6).forEach(function (w) {
            px += drawWord(ctx, px, y + 62, w, p.p, 19, C.text, cols[i]) + 18;
          });
          y += 100;
        });
        panel(ctx, 24, y + 4, 572)('tea 就是本課的字彙，它用的是 <b>ea</b>。三種拼法唸起來一樣。', C.muted, 13, 0);
        readout.innerHTML = '長母音 E：<b>e_e ／ ea ／ ee</b>';
      }

      function paint() {
        if (mode === 'vocab') {
          paintVocab(vi, showZh);
          readout.innerHTML = '<b>' + DRINKS[vi].e + '</b>' + (showZh ? '　' + DRINKS[vi].z : '') +
            '　<span class="muted">第 ' + (vi + 1) + ' / ' + DRINKS.length + '</span>';
        } else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }], function (v) { mode = v; syncRow(); paint(); }, 'vocab'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'vocab') { vi = (vi - 1 + DRINKS.length) % DRINKS.length; showZh = false; }
        else if (mode === 'pat') di = (di - 1 + DRINKS.length) % DRINKS.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'vocab') { vi = (vi + 1) % DRINKS.length; showZh = false; }
        else if (mode === 'pat') di = (di + 1) % DRINKS.length;
        paint();
      });
      const bZh = Kit.button('看中文', function () { showZh = !showZh; paint(); });
      const bSubj = Kit.button('換主詞 (you / he / she)', function () { subj = (subj + 1) % SUBJ.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bZh); row.appendChild(bSubj);
      const sb = speakBtn('唸出來', function () {
        if (mode === 'vocab') return DRINKS[vi].e;
        if (mode === 'pat') return SUBJ[subj].d + ' ' + SUBJ[subj].s + ' like ' + DRINKS[di].e + '?';
        return PHONICS[1].pats.map(function (p) { return p.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);
      function syncRow() {
        bZh.style.display = (mode === 'vocab') ? '' : 'none';
        bSubj.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「問你自己用 Do 還是 Does？問哥哥呢？」', why: '你＝Do，他／她＝Does。這是本課唯一的文法重點，一定要問到會。' },
      { ask: '「Does he like tea? 這句裡 like 要不要加 s？」', why: '不要。<b>Does 已經扛走了那個 s</b>，後面的動詞回到原形。這是最常錯的地方。' },
      { ask: '「有人問你 Do you like cola? 你要怎麼回答？」', why: 'Yes, I do. / No, I don\'t. 讓他練完整回答，不要只點頭。' },
      { ask: '「Does she like...? 要用什麼回答？」', why: 'Yes, she does. / No, she doesn\'t. 回答的助動詞要跟著問句走。' },
      { ask: '「bubble tea 是幾個字？」', why: '兩個字。hot chocolate 也是。這種<b>兩個字組成的字彙</b>抄寫時常漏掉空格。' },
      { ask: '「tea 的 ea，和 see 的 ee，唸起來一樣嗎？」', why: '一樣。把拼讀和本課字彙連起來，記單字會快很多。' }
    ],

    pitfalls: [
      { bad: 'Does he likes tea?', fix: '問句用了 <b>Does</b>，後面的動詞就要用<b>原形</b>：Does he <b>like</b> tea?　s 只能出現一次。' },
      { bad: 'Do he like cola?', fix: '主詞是 he，要用 <b>Does</b>。you 才用 Do。' },
      { bad: '回答時說 Yes, I like.', fix: '要說 <b>Yes, I do.</b>　用問句裡的助動詞回答，不是重複動詞。' },
      { bad: '把 bubble tea 寫成 bubbletea。', fix: '是<b>兩個字</b>，中間要空格：bubble tea。hot chocolate 也一樣。' },
      { bad: '把 soymilk 拆成兩個字。', fix: 'soymilk 是<b>一個字</b>，不用空格。和 bubble tea 剛好相反，要分開記。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'spell', 'doDoes', 'doDoes', 'answer', 'verbForm', 'phonics']);

      if (type === 'zh2en') {
        const d = pick(DRINKS);
        const o = pick4(d.e, DRINKS.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + d.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + d.z + ' = ' + d.e + '</b><br>' +
            '本課七個飲料字彙：' + DRINKS.map(function (x) { return x.e; }).join('、') + '。<br>' +
            '注意 bubble tea 和 hot chocolate 是<b>兩個字</b>，soymilk 是<b>一個字</b>。'
        };
      }

      if (type === 'en2zh') {
        const d = pick(DRINKS);
        const o = pick4(d.z, DRINKS.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + d.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + d.e + ' = ' + d.z + '</b><br>' +
            '本課字彙都是飲料。看到不確定的字，先想它是不是熱的、甜的、有沒有奶。<br>' +
            '完整清單：' + DRINKS.map(function (x) { return x.e + '（' + x.z + '）'; }).join('、') + '。'
        };
      }

      if (type === 'spell') {
        const d = pick(DRINKS.filter(function (x) { return x.e.indexOf(' ') < 0; }));
        const wrongs = misspell(d.e);
        if (wrongs.length < 3) {
          const o0 = pick4(d.e, DRINKS.map(function (x) { return x.e; }));
          return {
            tpl: 'spell',
            q: '「<b>' + d.z + '</b>」正確的拼法是哪一個？',
            choices: o0.choices, answer: o0.answer,
            steps: '正確拼法是 <b>' + d.e + '</b>（' + d.z + '）。<br>抄寫時一個字母一個字母對過去，不要用猜的。'
          };
        }
        const o = pick4(d.e, wrongs);
        return {
          tpl: 'spell',
          q: '「<b>' + d.z + '</b>」正確的<b>拼法</b>是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確拼法是 <b>' + d.e + '</b>。<br>' +
            '其他選項是常見的拼錯方式：字母順序顛倒、少一個字母、或多一個字母。<br>' +
            '記拼字的方法：先切成音節唸一次，再一個音節一個音節寫下來。'
        };
      }

      if (type === 'doDoes') {
        const subj = pick(['you', 'he', 'she']);
        const right = (subj === 'you') ? 'Do' : 'Does';
        const d = pick(DRINKS);
        const o = pick4(right, ['Do', 'Does', 'Is', 'Are']);
        return {
          tpl: 'doDoes',
          q: '<b>____ ' + subj + ' like ' + d.e + '?</b><br>空格要填哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '主詞是 <b>' + subj + '</b>，所以用 <b>' + right + '</b>。<br>' +
            'you → Do；he / she / it → Does。<br>' +
            'like 是一般動詞，問句要用 Do／Does，不能用 Is／Are。'
        };
      }

      if (type === 'verbForm') {
        const subj = pick(['he', 'she']);
        const d = pick(DRINKS);
        const o = shuffled([
          { t: 'Does ' + subj + ' like ' + d.e + '?', ok: true },
          { t: 'Does ' + subj + ' likes ' + d.e + '?' },
          { t: 'Do ' + subj + ' like ' + d.e + '?' },
          { t: 'Is ' + subj + ' like ' + d.e + '?' }
        ]);
        return {
          tpl: 'verbForm',
          q: '下面哪一句是<b>正確</b>的？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>Does ' + subj + ' like ' + d.e + '?</b><br>' +
            '主詞是 ' + subj + '，要用 <b>Does</b>；Does 後面的動詞用<b>原形 like</b>，不加 s。<br>' +
            '記法：<b>s 只能出現一次</b>。Does 拿走了它，like 就不能再有。'
        };
      }

      if (type === 'answer') {
        /* 逗號後面除了 I 以外都要小寫：No, she doesn't. */
        const S = pick([
          { s: 'you', a: 'I', av: 'do', neg: "don't", d: 'Do' },
          { s: 'he', a: 'he', av: 'does', neg: "doesn't", d: 'Does' },
          { s: 'she', a: 'she', av: 'does', neg: "doesn't", d: 'Does' }
        ]);
        const d = pick(DRINKS);
        const yes = Math.random() < 0.5;
        const right = yes ? 'Yes, ' + S.a + ' ' + S.av + '.' : 'No, ' + S.a + ' ' + S.neg + '.';
        const wrongs = [
          'Yes, ' + S.a + ' like.',
          (S.av === 'do' ? 'Yes, he does.' : 'Yes, I do.'),
          'No, ' + S.a + ' ' + (S.neg === "don't" ? "doesn't" : "don't") + '.',
          'Yes, ' + S.a + ' is.'
        ];
        const o = pick4(right, wrongs);
        return {
          tpl: 'answer',
          q: '<b>' + S.d + ' ' + S.s + ' like ' + d.e + '?</b><br>' + (yes ? '（要回答「喜歡」）' : '（要回答「不喜歡」）'),
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            '回答時用<b>問句裡的助動詞</b>：問句是 ' + S.d + '，回答就用 ' + S.av + ' 或 ' + S.neg + '。<br>' +
            '主詞也要跟著換：問 you 用 I 回答，問 he 用 he 回答（逗號後面只有 I 大寫）。'
        };
      }

      // phonics：本課長音 E
      const g = PHONICS[1];
      const p = pick(g.pats);
      const w = pick(p.words);
      const wrongs = shuffle(ALL_PATS.filter(function (x) { return x.set !== 'e'; }))
        .slice(0, 3).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'phonicsE',
        q: '下面哪一個字，母音唸<b>長母音 E</b>（像字母 E 的名字）？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 用的是 <b>' + p.p + '</b>，唸長母音 E。<br>' +
          '本課的三種拼法：<b>e_e、ea、ee</b>。字彙 <b>tea</b> 就是 ea。<br>' +
          '其他選項的母音是別的音，拼法也不同。'
      };
    }
  });


  /* ============================================================
     Unit 2　Let's Make Fruit Salad
     字彙：apples, bananas, grapes, guavas, papayas, pineapples, oranges
     句型：How many ...s do you need? / does he (she) need?
     拼讀：i_e, ie, igh
     ============================================================ */
  Kit.register('eng5a-u2', {

    intro: '問「要幾個」。重點有兩個：<b>How many 後面的名詞要用複數</b>，還有<b>do 和 does 的差別</b>。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', vi = 0, showZh = false, fi = 0, subj = 0, num = 3;
      const SUBJ = [
        { s: 'you', d: 'do', a: 'I', v: 'need', z: '你' },
        { s: 'he', d: 'does', a: 'He', v: 'needs', z: '他' },
        { s: 'she', d: 'does', a: 'She', v: 'needs', z: '她' }
      ];
      const paintVocab = vocabPainter(cv, FRUITS.map(function (f) { return { e: f.p, z: f.z }; }), '水果字彙（複數）');

      function paintPattern() {
        const ctx = clear(cv);
        const S = SUBJ[subj], f = FRUITS[fi];
        title(ctx, 24, 16, '句型：問數量');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 50, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 23px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 40;
        [{ t: 'How many ', c: C.text }, { t: f.p, c: C.ok }, { t: ' ' + S.d, c: C.warn },
         { t: ' ' + S.s + ' need?', c: C.text }].forEach(function (p) {
          ctx.fillStyle = p.c; ctx.fillText(p.t, x, 80); x += ctx.measureText(p.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + S.z + '需要幾個' + f.z + '？）', 40, 114);
        ctx.restore();

        /* 回答 */
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 148, 572, 78, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 24, 148, 8, 78, 4); ctx.fill();
        ctx.font = 'bold 23px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x2 = 48;
        const noun = num === 1 ? f.e : f.p;
        [{ t: S.a + ' ', c: C.text }, { t: S.v, c: C.warn }, { t: ' ' + NUMBERS[num - 1] + ' ', c: C.accent },
         { t: noun + '.', c: C.ok }].forEach(function (p) {
          ctx.fillStyle = p.c; ctx.fillText(p.t, x2, 180); x2 += ctx.measureText(p.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + S.z + '需要 ' + num + ' 個' + f.z + '。）', 48, 210);
        ctx.restore();

        const w = panel(ctx, 24, 244, 572);
        w('How many 後面的名詞一定用<b>複數</b>：' + f.p + '。', C.ok, 15, 6);
        w('主詞 you → <b>do</b> ／ 主詞 he、she → <b>does</b>。', C.warn, 14, 6);
        w('回答的動詞：I <b>need</b> ／ He <b>needs</b>（第三人稱單數要加 s）。', C.accent, 14, 8);
        if (num === 1) w('數量是 1 的時候，名詞要變回單數：one ' + f.e + '。', C.no, 14, 0);
        else w('數量 2 以上，名詞維持複數：' + NUMBERS[num - 1] + ' ' + f.p + '。', C.muted, 13, 0);

        readout.innerHTML = '<b>How many ' + f.p + ' ' + S.d + ' ' + S.s + ' need?</b>　→　<b>' +
          S.a + ' ' + S.v + ' ' + NUMBERS[num - 1] + ' ' + noun + '.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = PHONICS[2];
        title(ctx, 24, 16, '本課拼讀：長母音 I（i_e ／ ie ／ igh）');
        let y = 54;
        const cols = [C.accent, C.purple, C.ok];
        g.pats.forEach(function (p, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 92, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 92, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(p.p, 48, y + 12);
          ctx.restore();
          let px = 48;
          p.words.slice(0, 6).forEach(function (w) {
            px += drawWord(ctx, px, y + 62, w, p.p, 19, C.text, cols[i]) + 18;
          });
          y += 100;
        });
        panel(ctx, 24, y + 4, 572)('三種拼法唸起來都是長母音 I，就像字母 I 的名字。', C.muted, 13, 0);
        readout.innerHTML = '長母音 I：<b>i_e ／ ie ／ igh</b>';
      }

      function paint() {
        if (mode === 'vocab') {
          paintVocab(vi, showZh);
          readout.innerHTML = '<b>' + FRUITS[vi].p + '</b>（單數 ' + FRUITS[vi].e + '）' +
            (showZh ? '　' + FRUITS[vi].z : '') + '　<span class="muted">第 ' + (vi + 1) + ' / ' + FRUITS.length + '</span>';
        } else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }], function (v) { mode = v; syncRow(); paint(); }, 'vocab'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'vocab') { vi = (vi - 1 + FRUITS.length) % FRUITS.length; showZh = false; }
        else if (mode === 'pat') fi = (fi - 1 + FRUITS.length) % FRUITS.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'vocab') { vi = (vi + 1) % FRUITS.length; showZh = false; }
        else if (mode === 'pat') fi = (fi + 1) % FRUITS.length;
        paint();
      });
      const bZh = Kit.button('看中文', function () { showZh = !showZh; paint(); });
      const bSubj = Kit.button('換主詞 (you / he / she)', function () { subj = (subj + 1) % SUBJ.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bZh); row.appendChild(bSubj);

      const numRow = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const numCtl = Kit.slider('數量', {
        min: 1, max: 10, value: 3, format: function (v) { return v + ' 個'; },
        onChange: function (v) { num = v; paint(); }
      });
      numRow.appendChild(numCtl.wrap);

      const sb = speakBtn('唸出來', function () {
        if (mode === 'vocab') return FRUITS[vi].p;
        if (mode === 'pat') {
          const S = SUBJ[subj], f = FRUITS[fi];
          return 'How many ' + f.p + ' ' + S.d + ' ' + S.s + ' need?';
        }
        return PHONICS[2].pats.map(function (p) { return p.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);

      function syncRow() {
        bZh.style.display = (mode === 'vocab') ? '' : 'none';
        bSubj.style.display = numRow.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      host.appendChild(numRow);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「How many 後面的水果要用單數還是複數？」', why: '複數。問「幾個」本來就預設不只一個，這是本課最重要的規則。' },
      { ask: '「apple 的複數怎麼寫？guava 呢？」', why: '本課七個水果<b>全部都是直接加 s</b>，沒有例外。先建立這個安全感，之後再教不規則的。' },
      { ask: '「問你用 do，問他用什麼？」', why: 'does。和第一課的 Do／Does 是同一條規則，可以一起複習。' },
      { ask: '「I need 還是 I needs？He 呢？」', why: 'I need／He needs。第三人稱單數動詞加 s，這是回答時最常錯的地方。' },
      { ask: '「如果只需要一個，要怎麼說？」', why: 'I need one apple. 數量變 1，名詞要<b>變回單數</b>。把滑桿拉到 1 讓他自己看。' },
      { ask: '「pineapple 裡面藏了哪兩個字？」', why: 'pine（松）＋ apple（蘋果）。拆開來記，長單字就不可怕了。' }
    ],

    pitfalls: [
      { bad: 'How many apple do you need?', fix: 'How many 後面一定接<b>複數</b>：How many <b>apples</b>...？' },
      { bad: 'How many apples does you need?', fix: '主詞是 you，要用 <b>do</b>。does 只給 he／she／it。' },
      { bad: 'He need three apples.', fix: '主詞是 He，動詞要加 s：He <b>needs</b> three apples.' },
      { bad: 'I need three apple.', fix: '數量 2 以上，名詞要<b>複數</b>：three <b>apples</b>。' },
      { bad: 'I need one apples.', fix: '數量是 1 的時候，名詞要<b>單數</b>：one <b>apple</b>。' },
      { bad: '把 guava 的複數寫成 guavaes。', fix: '本課七個水果<b>都只加 s</b>：guava → guavas。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'plural', 'howmany', 'howmany', 'doDoes', 'needs', 'oneVs', 'phonics']);

      if (type === 'zh2en') {
        const f = pick(FRUITS);
        const o = pick4(f.p, FRUITS.map(function (x) { return x.p; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + f.z + '</b>」的英文（複數）是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + f.z + ' = ' + f.e + '</b>，複數是 <b>' + f.p + '</b>。<br>' +
            '本課七個水果的複數都是<b>直接加 s</b>。<br>' +
            '完整清單：' + FRUITS.map(function (x) { return x.p; }).join('、') + '。'
        };
      }

      if (type === 'en2zh') {
        const f = pick(FRUITS);
        const o = pick4(f.z, FRUITS.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + f.p + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + f.p + ' = ' + f.z + '</b>（單數 ' + f.e + '）。<br>' +
            '小提示：pineapple 是 pine（松）＋ apple（蘋果）拼起來的。<br>' +
            'guava（芭樂）和 papaya（木瓜）是臺灣常見的水果，要特別記。'
        };
      }

      if (type === 'plural') {
        const f = pick(FRUITS);
        const o = pick4(f.p, [f.e, f.e + 'es', f.e + "'s", f.e.slice(0, -1) + 'ies']);
        return {
          tpl: 'plural',
          q: '<b>' + f.e + '</b>（' + f.z + '）的<b>複數</b>怎麼寫？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + f.e + ' → ' + f.p + '</b>，直接加 <b>s</b>。<br>' +
            '本課七個水果全部都是加 s，沒有例外。<br>' +
            "注意 's 是「所有格」（誰的），不是複數，兩個不要混。"
        };
      }

      if (type === 'howmany') {
        const f = pick(FRUITS);
        const o = shuffled([
          { t: 'How many ' + f.p + ' do you need?', ok: true },
          { t: 'How many ' + f.e + ' do you need?' },
          { t: 'How many ' + f.p + ' does you need?' },
          { t: 'How much ' + f.p + ' do you need?' }
        ]);
        return {
          tpl: 'howmany',
          q: '要問「你需要幾個' + f.z + '？」，哪一句是<b>正確</b>的？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>How many ' + f.p + ' do you need?</b><br>' +
            'How many 後面接<b>複數</b>（' + f.p + '），主詞 you 用 <b>do</b>。<br>' +
            'How much 是問<b>不可數</b>的東西（水、錢），水果可以一個一個數，要用 How many。'
        };
      }

      if (type === 'doDoes') {
        const subj = pick(['you', 'he', 'she']);
        const right = (subj === 'you') ? 'do' : 'does';
        const f = pick(FRUITS);
        const o = pick4(right, ['do', 'does', 'is', 'are']);
        return {
          tpl: 'doDoes',
          q: '<b>How many ' + f.p + ' ____ ' + subj + ' need?</b><br>空格要填哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '主詞是 <b>' + subj + '</b>，所以用 <b>' + right + '</b>。<br>' +
            'you → do；he / she / it → does。<br>' +
            'need 是一般動詞，問句用 do／does，不用 is／are。'
        };
      }

      if (type === 'needs') {
        const S = pick([{ a: 'I', v: 'need' }, { a: 'He', v: 'needs' }, { a: 'She', v: 'needs' }]);
        const f = pick(FRUITS);
        const n = randInt(2, 9);
        const o = pick4(S.v, ['need', 'needs', 'needing', 'to need']);
        return {
          tpl: 'needs',
          q: '<b>' + S.a + ' ____ ' + NUMBERS[n - 1] + ' ' + f.p + '.</b><br>空格要填哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '主詞是 <b>' + S.a + '</b>，動詞用 <b>' + S.v + '</b>。<br>' +
            (S.v === 'needs'
              ? '第三人稱單數（He／She／It）的動詞要<b>加 s</b>。'
              : 'I 和 you 的動詞用<b>原形</b>，不加 s。') + '<br>' +
            '注意：這是直述句，沒有 do／does，所以 s 要加在動詞上。'
        };
      }

      if (type === 'oneVs') {
        const f = pick(FRUITS);
        const isOne = Math.random() < 0.5;
        const n = isOne ? 1 : randInt(2, 9);
        const right = NUMBERS[n - 1] + ' ' + (isOne ? f.e : f.p);
        const wrong = NUMBERS[n - 1] + ' ' + (isOne ? f.p : f.e);
        const o = pick4(right, [wrong, NUMBERS[n - 1] + ' ' + f.e + 'es', NUMBERS[n - 1] + ' of ' + f.p]);
        return {
          tpl: 'oneVs',
          q: '「' + n + ' 個' + f.z + '」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            (isOne
              ? '數量是 <b>1</b> 的時候，名詞用<b>單數</b>：one ' + f.e + '。'
              : '數量是 <b>2 以上</b>，名詞用<b>複數</b>：' + NUMBERS[n - 1] + ' ' + f.p + '。') + '<br>' +
            '規則很簡單：只有 one 後面用單數，其他都用複數。'
        };
      }

      // phonics：長音 I
      const g = PHONICS[2];
      const p = pick(g.pats);
      const w = pick(p.words);
      const wrongs = shuffle(ALL_PATS.filter(function (x) { return x.set !== 'i'; }))
        .slice(0, 3).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'phonicsI',
        q: '下面哪一個字，母音唸<b>長母音 I</b>（像字母 I 的名字）？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 用的是 <b>' + p.p + '</b>，唸長母音 I。<br>' +
          '本課三種拼法：<b>i_e、ie、igh</b>。<br>' +
          'igh 裡的 gh <b>不發音</b>，只有 i 發長音，例如 light、night。'
      };
    }
  });


  /* ============================================================
     Unit 3　A Fun Day
     字彙：Sunday ～ Saturday
     句型：What day is today? / Is today Monday?
     拼讀：o_e, oa, ow
     ============================================================ */
  Kit.register('eng5a-u3', {

    intro: '講星期幾。英文的星期<b>第一個字母一定大寫</b>，而且一週從 Sunday 開始算。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'week', today = 3, guess = 1;

      function paintWeek() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '一週七天　（英文的一週從 Sunday 開始）');
        const w = 78, x0 = 26;
        DAYS.forEach(function (d, i) {
          const on = i === today;
          const x = x0 + i * w;
          ctx.save();
          ctx.fillStyle = on ? C.eng : C.card;
          roundRect(ctx, x, 52, w - 6, 92, 8); ctx.fill();
          ctx.fillStyle = on ? '#06202b' : C.text;
          ctx.font = 'bold 13px ' + EN;
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(d.e.slice(0, 3), x + (w - 6) / 2, 62);
          ctx.font = '11px ' + EN;
          ctx.fillStyle = on ? '#06202b' : C.muted;
          ctx.fillText(d.e.slice(3), x + (w - 6) / 2, 80);
          ctx.font = '13px ' + FONT;
          ctx.fillStyle = on ? '#06202b' : C.text;
          ctx.fillText(d.z, x + (w - 6) / 2, 104);
          ctx.font = 'bold 11px ' + EN;
          ctx.fillStyle = on ? '#06202b' : C.line;
          ctx.fillText(d.e.charAt(0), x + (w - 6) / 2, 126);
          ctx.restore();
        });

        const d = DAYS[today];
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 162, 572, 72, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 22px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = C.text; ctx.fillText('What day is today?', 44, 186);
        ctx.fillStyle = C.ok; ctx.fillText("It's " + d.e + '.', 44, 216);
        ctx.restore();

        const yes = today === guess;
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 246, 572, 76, 10); ctx.fill();
        ctx.fillStyle = yes ? C.ok : C.no; roundRect(ctx, 24, 246, 8, 76, 4); ctx.fill();
        ctx.font = 'bold 21px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = C.text;
        ctx.fillText('Is today ' + DAYS[guess].e + '?', 48, 270);
        ctx.fillStyle = yes ? C.ok : C.no;
        ctx.fillText(yes ? 'Yes, it is.' : "No, it's " + d.e + '.', 48, 300);
        ctx.restore();

        const p = panel(ctx, 24, 334, 572);
        p('星期的第一個字母<b>一定大寫</b>：' + DAYS.map(function (x) { return x.e.charAt(0); }).join('、') + '。', C.warn, 14, 4);
        p('回答 What day 用 <b>It\'s</b>；回答 Is today...? 用 <b>Yes, it is.</b> 或 <b>No, it\'s ⋯⋯</b>', C.muted, 13, 0);

        readout.innerHTML = '今天：<b>' + d.e + '</b>（' + d.z + '）　問句：Is today ' + DAYS[guess].e + '? → <b>' +
          (yes ? 'Yes, it is.' : "No, it's " + d.e + '.') + '</b>';
      }

      function paintOrder() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '前一天與後一天');
        const d = DAYS[today];
        const prev = DAYS[(today + 6) % 7], next = DAYS[(today + 1) % 7];
        const boxes = [
          { lab: 'yesterday　昨天', d: prev, c: C.muted },
          { lab: 'today　今天', d: d, c: C.eng },
          { lab: 'tomorrow　明天', d: next, c: C.purple }
        ];
        let y = 58;
        boxes.forEach(function (b) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 84, 10); ctx.fill();
          ctx.fillStyle = b.c; roundRect(ctx, 24, y, 8, 84, 4); ctx.fill();
          ctx.fillStyle = b.c; ctx.font = 'bold 14px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(b.lab, 48, y + 12);
          ctx.fillStyle = C.text; ctx.font = 'bold 30px ' + EN;
          ctx.fillText(b.d.e, 48, y + 36);
          ctx.fillStyle = C.muted; ctx.font = '16px ' + FONT;
          ctx.textAlign = 'right';
          ctx.fillText(b.d.z, 572, y + 46);
          ctx.restore();
          y += 92;
        });
        panel(ctx, 24, y + 6, 572)(
          '一週的順序：Sunday → Monday → Tuesday → Wednesday → Thursday → Friday → Saturday，然後回到 Sunday。', C.muted, 13, 0);
        readout.innerHTML = '昨天 <b>' + prev.e + '</b>　今天 <b>' + d.e + '</b>　明天 <b>' + next.e + '</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = PHONICS[3];
        title(ctx, 24, 16, '本課拼讀：長母音 O（o_e ／ oa ／ ow）');
        let y = 54;
        const cols = [C.accent, C.purple, C.ok];
        g.pats.forEach(function (p, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 92, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 92, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(p.p, 48, y + 12);
          ctx.restore();
          let px = 48;
          p.words.slice(0, 6).forEach(function (w) {
            px += drawWord(ctx, px, y + 62, w, p.p, 19, C.text, cols[i]) + 18;
          });
          y += 100;
        });
        panel(ctx, 24, y + 4, 572)('ow 有兩種唸法，這一課練的是 snow 這一種（長音 O）。', C.muted, 13, 0);
        readout.innerHTML = '長母音 O：<b>o_e ／ oa ／ ow</b>';
      }

      function paint() {
        if (mode === 'week') paintWeek();
        else if (mode === 'order') paintOrder();
        else paintPhonics();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '星期與問答', value: 'week' }, { label: '前後天', value: 'order' }, { label: '拼讀', value: 'ph' }], function (v) { mode = v; syncRow(); paint(); }, 'week'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bT = Kit.button('換今天 ▶', function () { today = (today + 1) % 7; paint(); });
      const bG = Kit.button('換問句裡的星期 ▶', function () { guess = (guess + 1) % 7; paint(); });
      row.appendChild(bT); row.appendChild(bG);
      const sb = speakBtn('唸出來', function () {
        if (mode === 'ph') return PHONICS[3].pats.map(function (p) { return p.words[0]; }).join(', ');
        return "What day is today? It's " + DAYS[today].e + '.';
      });
      if (sb) row.appendChild(sb);
      function syncRow() {
        bG.style.display = (mode === 'week') ? '' : 'none';
        bT.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「星期的英文，第一個字母要大寫還是小寫？」', why: '大寫。這是本課最常被扣分的地方，寫的時候一定要檢查。' },
      { ask: '「英文的一週從星期幾開始？」', why: 'Sunday。和中文習慣不同，課本的順序也是從 Sunday 排。' },
      { ask: '「今天是星期三，明天英文怎麼說？」', why: '練順序。可以用畫面上的「前後天」模式，一天一天問過去。' },
      { ask: '「Is today Monday? 如果不是，要怎麼回答？」', why: "No, it's Tuesday. 否定回答時<b>要補上正確答案</b>，不能只說 No。" },
      { ask: '「What day is today? 的回答開頭是什麼？」', why: "It's。用 It's 而不是 Today is，這是課本教的標準說法。" },
      { ask: '「Wednesday 中間那個 d 有沒有唸出來？」', why: '沒有。這個字拼寫和發音落差最大，要特別多寫幾次。' }
    ],

    pitfalls: [
      { bad: '把星期寫成小寫：monday。', fix: '英文的星期是<b>專有名詞</b>，第一個字母一定<b>大寫</b>：<b>M</b>onday。' },
      { bad: '把 Wednesday 拼成 Wensday。', fix: '中間有一個<b>不發音的 d</b>：W-e-d-n-e-s-d-a-y。唸的時候聽不到，寫的時候不能漏。' },
      { bad: '以為一週從 Monday 開始。', fix: '英文的一週從 <b>Sunday</b> 開始，課本的排序也是這樣。' },
      { bad: '回答 Is today Monday? 只說 No.', fix: '要補上正確答案：<b>No, it\'s Tuesday.</b>　只說 No 對方還是不知道今天星期幾。' },
      { bad: '用 Today is Monday. 回答 What day is today?', fix: '課本教的標準回答是 <b>It\'s Monday.</b>　考試時照課本的說法寫比較安全。' },
      { bad: '把 Tuesday 和 Thursday 搞混。', fix: 'T<b>ue</b>sday 是星期二，T<b>hu</b>rsday 是星期四。看第二、三個字母就分得出來。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'cap', 'next', 'prev', 'whatday', 'isToday', 'phonics']);

      if (type === 'zh2en') {
        const d = pick(DAYS);
        const o = pick4(d.e, DAYS.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + d.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + d.z + ' = ' + d.e + '</b><br>' +
            '一週順序：' + DAYS.map(function (x) { return x.e; }).join(' → ') + '。<br>' +
            '第一個字母一定<b>大寫</b>。'
        };
      }

      if (type === 'en2zh') {
        const d = pick(DAYS);
        const o = pick4(d.z, DAYS.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + d.e + '</b> 是星期幾？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + d.e + ' = ' + d.z + '</b><br>' +
            '容易混的兩個：T<b>ue</b>sday（星期二）和 T<b>hu</b>rsday（星期四），看第二三個字母。<br>' +
            '英文一週從 Sunday 開始算。'
        };
      }

      if (type === 'cap') {
        const d = pick(DAYS);
        const o = pick4(d.e, [d.e.toLowerCase(), d.e.toUpperCase(), d.e.slice(0, -3).toLowerCase() + 'DAY']);
        return {
          tpl: 'cap',
          q: '「' + d.z + '」正確的寫法是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + d.e + '</b><br>' +
            '英文的星期是<b>專有名詞</b>，只有<b>第一個字母大寫</b>，其他小寫。<br>' +
            '全部小寫或全部大寫都不對，這是考試最常扣分的地方。'
        };
      }

      if (type === 'next') {
        const d = pick(DAYS);
        const nx = DAYS[(d.n + 1) % 7];
        const o = pick4(nx.e, DAYS.map(function (x) { return x.e; }));
        return {
          tpl: 'next',
          q: 'Today is <b>' + d.e + '</b>. What day is <b>tomorrow</b>?',
          choices: o.choices, answer: o.answer,
          steps: '今天是 ' + d.e + '（' + d.z + '），明天就是 <b>' + nx.e + '</b>（' + nx.z + '）。<br>' +
            '一週順序：' + DAYS.map(function (x) { return x.e; }).join(' → ') + ' → 回到 Sunday。<br>' +
            'tomorrow ＝ 明天，往後數一天。'
        };
      }

      if (type === 'prev') {
        const d = pick(DAYS);
        const pv = DAYS[(d.n + 6) % 7];
        const o = pick4(pv.e, DAYS.map(function (x) { return x.e; }));
        return {
          tpl: 'prev',
          q: 'Today is <b>' + d.e + '</b>. What day was <b>yesterday</b>?',
          choices: o.choices, answer: o.answer,
          steps: '今天是 ' + d.e + '（' + d.z + '），昨天是 <b>' + pv.e + '</b>（' + pv.z + '）。<br>' +
            'yesterday ＝ 昨天，往前數一天。<br>' +
            'Sunday 的前一天是 Saturday，會繞回去。'
        };
      }

      if (type === 'whatday') {
        const d = pick(DAYS);
        const o = shuffled([
          { t: "It's " + d.e + '.', ok: true },
          { t: 'It is ' + d.e.toLowerCase() + '.' },
          { t: "It's " + d.e + '?' },
          { t: 'Today ' + d.e + '.' }
        ]);
        return {
          tpl: 'whatday',
          q: '<b>What day is today?</b>（今天是' + d.z + '）<br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: "正確：<b>It's " + d.e + '.</b><br>' +
            "用 <b>It's</b> 開頭，星期<b>第一個字母大寫</b>，句尾是<b>句點</b>不是問號。<br>" +
            '這是課本教的標準回答方式。'
        };
      }

      if (type === 'isToday') {
        const real = pick(DAYS);
        const yes = Math.random() < 0.5;
        const asked = yes ? real : pick(DAYS.filter(function (x) { return x.e !== real.e; }));
        const right = yes ? 'Yes, it is.' : "No, it's " + real.e + '.';
        const o = pick4(right, [
          yes ? "No, it's " + real.e + '.' : 'Yes, it is.',
          'Yes, it does.', 'No, it not.', "Yes, it's " + asked.e + '?'
        ]);
        return {
          tpl: 'isToday',
          q: '今天是 <b>' + real.e + '</b>。有人問：<b>Is today ' + asked.e + '?</b><br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            (yes
              ? '問的和今天一樣，所以回答 <b>Yes, it is.</b>'
              : "問的和今天不一樣，要說 <b>No</b> 並且<b>補上正確答案</b>：No, it's " + real.e + '.') + '<br>' +
            '問句用 Is，回答就用 is，不能換成 does。'
        };
      }

      // phonics：長音 O
      const g = PHONICS[3];
      const p = pick(g.pats);
      const w = pick(p.words);
      const wrongs = shuffle(ALL_PATS.filter(function (x) { return x.set !== 'o'; }))
        .slice(0, 3).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'phonicsO',
        q: '下面哪一個字，母音唸<b>長母音 O</b>（像字母 O 的名字）？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 用的是 <b>' + p.p + '</b>，唸長母音 O。<br>' +
          '本課三種拼法：<b>o_e、oa、ow</b>。<br>' +
          '注意 ow 有兩種唸法，snow 是長音 O 這一種。'
      };
    }
  });


  /* ============================================================
     Unit 4　My Favorite Subject
     字彙：art, Chinese, English, math, music, PE, science, social studies
     句型：What's your favorite subject? / What's his (her) favorite subject?
     拼讀：u_e, ue, ui
     ============================================================ */
  Kit.register('eng5a-u4', {

    intro: '問最喜歡的科目。這一課有一個容易錯的地方：<b>科目名稱通常小寫，但語言類要大寫</b>（Chinese、English）。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', si = 0, subj = 0;
      const SUBJ = [
        { q: "What's your", a: 'My', z: '你的', poss: 'your' },
        { q: "What's his", a: 'His', z: '他的', poss: 'his' },
        { q: "What's her", a: 'Her', z: '她的', poss: 'her' }
      ];

      function paintVocab() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '科目字彙　大寫與小寫');
        let y = 50;
        SUBJECTS.forEach(function (s, i) {
          const on = i === si;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 38, 8); ctx.fill();
          if (s.cap) { ctx.fillStyle = C.warn; roundRect(ctx, 24, y, 6, 38, 3); ctx.fill(); }
          ctx.fillStyle = on ? C.eng : (s.cap ? C.warn : C.text);
          ctx.font = 'bold 20px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(s.e, 48, y + 19);
          ctx.fillStyle = on ? C.text : C.muted;
          ctx.font = '15px ' + FONT;
          ctx.fillText(s.z, 300, y + 19);
          ctx.fillStyle = s.cap ? C.warn : C.line;
          ctx.font = '12px ' + FONT;
          ctx.textAlign = 'right';
          ctx.fillText(s.cap ? '要大寫' : '小寫就好', 578, y + 19);
          ctx.restore();
          y += 42;
        });
        const w = panel(ctx, 24, y + 8, 572);
        w('為什麼 Chinese、English 要大寫？因為它們同時是<b>語言和國家的名稱</b>。', C.warn, 14, 6);
        w('PE 是 Physical Education 的縮寫，兩個字母<b>都大寫</b>。', C.warn, 14, 6);
        w('其他科目（art、math、music、science、social studies）小寫就好。', C.muted, 13, 0);
        readout.innerHTML = '<b>' + SUBJECTS[si].e + '</b>　' + SUBJECTS[si].z +
          '　<span class="muted">' + (SUBJECTS[si].cap ? '第一個字母要大寫' : '全部小寫') + '</span>';
      }

      function paintPattern() {
        const ctx = clear(cv);
        const S = SUBJ[subj], s = SUBJECTS[si];
        title(ctx, 24, 16, '句型：問最喜歡的科目');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 54, 572, 88, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 24px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 42;
        [{ t: S.q, c: C.warn }, { t: ' favorite subject?', c: C.text }].forEach(function (p) {
          ctx.fillStyle = p.c; ctx.fillText(p.t, x, 88); x += ctx.measureText(p.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + S.z + '最喜歡的科目是什麼？）', 42, 122);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 158, 572, 88, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 24, 158, 8, 88, 4); ctx.fill();
        ctx.font = 'bold 24px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x2 = 48;
        [{ t: S.a + ' favorite subject is ', c: C.text }, { t: s.e + '.', c: C.ok }].forEach(function (p) {
          ctx.fillStyle = p.c; ctx.fillText(p.t, x2, 192); x2 += ctx.measureText(p.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + S.z + '最喜歡的科目是' + s.z + '。）', 48, 226);
        ctx.restore();

        const w = panel(ctx, 24, 262, 572);
        w("What's ＝ What is，是縮寫，中間的<b>撇號不能漏</b>。", C.warn, 15, 6);
        w('問句用 your / his / her，回答就要對應成 My / His / Her。', C.accent, 14, 6);
        w(s.cap
          ? s.e + ' 是' + (s.e === 'PE' ? '縮寫，兩個字母都大寫' : '語言名稱，第一個字母要大寫') + '。'
          : s.e + ' 是一般科目，小寫就好。', s.cap ? C.warn : C.muted, 14, 0);

        readout.innerHTML = '<b>' + S.q + ' favorite subject?</b>　→　<b>' + S.a + ' favorite subject is ' + s.e + '.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = PHONICS[4];
        title(ctx, 24, 16, '本課拼讀：長母音 U（u_e ／ ue ／ ui）');
        let y = 50;
        const cols = [C.accent, C.purple, C.ok];
        g.pats.forEach(function (p, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 88, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 88, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(p.p, 48, y + 12);
          ctx.restore();
          let px = 48;
          p.words.slice(0, 6).forEach(function (w) {
            px += drawWord(ctx, px, y + 60, w, p.p, 19, C.text, cols[i]) + 18;
          });
          y += 96;
        });
        const w = panel(ctx, 24, y + 6, 572);
        w('u_e 有<b>兩種</b>唸法：cute 唸起來像字母 U，June 唸「ㄨ」的音。', C.warn, 14, 4);
        w('ue 和 ui 大多唸「ㄨ」的音：blue、fruit、juice。', C.muted, 13, 0);
        readout.innerHTML = '長母音 U：<b>u_e ／ ue ／ ui</b>';
      }

      function paint() {
        if (mode === 'vocab') paintVocab();
        else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }], function (v) { mode = v; syncRow(); paint(); }, 'vocab'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () { si = (si - 1 + SUBJECTS.length) % SUBJECTS.length; paint(); });
      const bNext = Kit.button('下一個 ▶', function () { si = (si + 1) % SUBJECTS.length; paint(); });
      const bSubj = Kit.button('換人稱 (your / his / her)', function () { subj = (subj + 1) % SUBJ.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bSubj);
      const sb = speakBtn('唸出來', function () {
        if (mode === 'ph') return PHONICS[4].pats.map(function (p) { return p.words[0]; }).join(', ');
        if (mode === 'pat') return SUBJ[subj].q + ' favorite subject?';
        return SUBJECTS[si].e;
      });
      if (sb) row.appendChild(sb);
      function syncRow() {
        bSubj.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「math 要不要大寫？English 呢？」', why: 'math 小寫，English 大寫。<b>語言類要大寫</b>是這一課唯一的規則，問到會為止。' },
      { ask: '「PE 是哪兩個字的縮寫？」', why: 'Physical Education。是縮寫所以兩個字母都大寫，寫成 pe 或 Pe 都不對。' },
      { ask: "「What's 是哪兩個字合起來的？」", why: "What is。撇號代表被省略的 i，漏掉撇號就是拼錯。" },
      { ask: '「問 his，回答要用哪個字？」', why: 'His。問句和回答的所有格要對應：your→My，his→His，her→Her。' },
      { ask: '「social studies 是幾個字？」', why: '兩個字，中間要空格，而且 studies 有 s。這個字彙抄寫最容易錯。' },
      { ask: '「你最喜歡哪一科？用英文說一次完整的句子。」', why: '從認字推到開口。My favorite subject is ⋯⋯，說完整句比說單字有用。' }
    ],

    pitfalls: [
      { bad: '把 English、Chinese 寫成小寫。', fix: '語言（也是國家）的名稱是<b>專有名詞</b>，第一個字母一定<b>大寫</b>：<b>E</b>nglish、<b>C</b>hinese。' },
      { bad: '把 math、science 寫成大寫。', fix: '一般科目<b>小寫就好</b>。只有語言類和縮寫 PE 要大寫。' },
      { bad: '把 PE 寫成 pe 或 Pe。', fix: 'PE 是 Physical Education 的縮寫，<b>兩個字母都大寫</b>。' },
      { bad: "把 What's 寫成 Whats。", fix: "What's ＝ What is，<b>撇號不能漏</b>。撇號代表被省略掉的字母。" },
      { bad: '把 social studies 寫成 social study。', fix: '這個科目名稱固定用<b>複數</b>：social <b>studies</b>，而且是<b>兩個字</b>。' },
      { bad: '問 his，卻用 My 回答。', fix: '所有格要對應：問 <b>his</b> 就回答 <b>His</b> favorite subject is ⋯⋯' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'cap', 'cap', 'poss', 'whats', 'sentence', 'phonics']);

      if (type === 'zh2en') {
        const s = pick(SUBJECTS);
        const o = pick4(s.e, SUBJECTS.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + s.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + s.z + ' = ' + s.e + '</b><br>' +
            '本課八個科目：' + SUBJECTS.map(function (x) { return x.e; }).join('、') + '。<br>' +
            (s.cap ? '注意這個字要<b>大寫</b>開頭。' : '這個字<b>小寫</b>就好。')
        };
      }

      if (type === 'en2zh') {
        const s = pick(SUBJECTS);
        const o = pick4(s.z, SUBJECTS.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + s.e + '</b> 是哪一個科目？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + s.e + ' = ' + s.z + '</b><br>' +
            'PE 是體育（Physical Education 的縮寫），social studies 是社會。<br>' +
            'science 是自然，不要和 social studies 搞混。'
        };
      }

      if (type === 'cap') {
        const s = pick(SUBJECTS);
        const right = s.cap ? '要大寫開頭' : '小寫就好';
        const o = shuffled([
          { t: right, ok: true },
          { t: s.cap ? '小寫就好' : '要大寫開頭' }
        ]);
        return {
          tpl: 'cap',
          q: '科目 <b>' + s.e + '</b>（' + s.z + '）出現在句子中間時，第一個字母要怎麼寫？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + s.e + '</b>：' + right + '。<br>' +
            (s.cap
              ? (s.e === 'PE'
                ? 'PE 是 Physical Education 的<b>縮寫</b>，兩個字母都大寫。'
                : '這是<b>語言（也是國家）的名稱</b>，屬於專有名詞，第一個字母要大寫。')
              : '一般科目名稱不是專有名詞，<b>小寫</b>就好。') + '<br>' +
            '要大寫的只有：Chinese、English、PE。'
        };
      }

      if (type === 'poss') {
        const P = pick([
          { q: 'your', a: 'My', z: '你的' },
          { q: 'his', a: 'His', z: '他的' },
          { q: 'her', a: 'Her', z: '她的' }
        ]);
        const o = pick4(P.a, ['My', 'His', 'Her', 'Your']);
        return {
          tpl: 'poss',
          q: "有人問：<b>What's " + P.q + " favorite subject?</b><br>回答要用哪一個字開頭？",
          choices: o.choices, answer: o.answer,
          steps: '問句用 <b>' + P.q + '</b>，回答就用 <b>' + P.a + '</b>。<br>' +
            '對應關係：your → My，his → His，her → Her。<br>' +
            '完整回答：' + P.a + ' favorite subject is ' + pick(SUBJECTS).e + '.'
        };
      }

      if (type === 'whats') {
        const o = shuffled([
          { t: 'What is', ok: true },
          { t: 'What was' },
          { t: 'What has' },
          { t: 'What does' }
        ]);
        return {
          tpl: 'whats',
          q: "<b>What's</b> favorite subject 裡的 <b>What's</b>，是哪兩個字的縮寫？",
          choices: o.choices, answer: o.answer,
          steps: "<b>What's ＝ What is</b><br>" +
            '撇號（\'）代表被省略掉的字母 <b>i</b>。<br>' +
            "寫成 Whats 就錯了，撇號不能漏。"
        };
      }

      if (type === 'sentence') {
        const s = pick(SUBJECTS);
        const o = shuffled([
          { t: 'My favorite subject is ' + s.e + '.', ok: true },
          { t: 'My favorite subject is ' + (s.cap ? s.e.toLowerCase() : s.e.charAt(0).toUpperCase() + s.e.slice(1)) + '.' },
          { t: 'My favorite subject ' + s.e + '.' },
          { t: 'My favorite is subject ' + s.e + '.' }
        ]);
        return {
          tpl: 'sentence',
          q: '要說「我最喜歡的科目是' + s.z + '」，哪一句<b>完全正確</b>？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>My favorite subject is ' + s.e + '.</b><br>' +
            '句子結構：My favorite subject（主詞）＋ is（動詞）＋ 科目名稱。<br>' +
            (s.cap ? '<b>' + s.e + '</b> 要大寫開頭。' : '<b>' + s.e + '</b> 小寫就好，不要多加大寫。')
        };
      }

      // phonics：長音 U
      const g = PHONICS[4];
      const p = pick(g.pats);
      const w = pick(p.words);
      const wrongs = shuffle(ALL_PATS.filter(function (x) { return x.set !== 'u'; }))
        .slice(0, 3).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'phonicsU',
        q: '下面哪一個字，用的是<b>長母音 U</b> 的拼法（u_e、ue、ui）？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 用的是 <b>' + p.p + '</b>。<br>' +
          '本課三種拼法：<b>u_e、ue、ui</b>。<br>' +
          'u_e 有兩種唸法：cute 像字母 U 的名字，June 是「ㄨ」的音。'
      };
    }
  });


  /* ============================================================
     Culture & Festivals　Chinese New Year
     字彙：firecrackers, lion dance, lucky money, rice cake, spring couplet, tangerines
     ============================================================ */
  const PARTS = {
    'firecrackers': ['fire（火）', 'crackers（爆裂聲）', '一個字，字尾有 s'],
    'lion dance': ['lion（獅子）', 'dance（舞）', '兩個字，中間空格'],
    'lucky money': ['lucky（幸運的）', 'money（錢）', '兩個字，中間空格'],
    'rice cake': ['rice（米）', 'cake（糕）', '兩個字，中間空格'],
    'spring couplet': ['spring（春）', 'couplet（對句）', '兩個字，中間空格'],
    'tangerines': ['tangerine（橘子）', '＋ s', '一個字，複數加 s']
  };
  const SENT = [
    { e: 'We eat rice cake on Chinese New Year.', z: '我們在過年吃年糕。' },
    { e: 'Children get lucky money from their parents.', z: '小孩從父母那裡拿到紅包。' },
    { e: 'We put spring couplets on the door.', z: '我們把春聯貼在門上。' },
    { e: 'I like the lion dance the most.', z: '我最喜歡舞獅。' },
    { e: 'People eat tangerines for good luck.', z: '人們吃橘子求好運。' },
    { e: 'Firecrackers are very loud.', z: '鞭炮非常大聲。' }
  ];

  Kit.register('eng5a-u5', {

    intro: '用英文介紹自己的年節。這一課的字彙都是<b>過年會看到的東西</b>，很多是兩個字組成的。切換兩個模式：<b>字彙</b>看每個詞怎麼拆，<b>介紹</b>看怎麼串成句子。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 380);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', ci = 0;

      function paintVocab() {
        const ctx = clear(cv);
        const v = CNY[ci];
        title(ctx, 24, 16, 'Chinese New Year　過年字彙');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 50, 572, 122, 12); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = C.eng; ctx.font = 'bold 36px ' + EN;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(v.e, 310, 92);
        ctx.fillStyle = C.text; ctx.font = '24px ' + FONT;
        ctx.fillText(v.z, 310, 140);
        ctx.restore();

        const p = PARTS[v.e];
        const w = panel(ctx, 24, 190, 572);
        w('拆開來記：', C.accent, 15, 6);
        w('　' + p[0], C.warn, 15, 2);
        w('　' + p[1], C.warn, 15, 8);
        w(p[2], C.no, 14, 10);
        w('這一課的字彙有一半是<b>兩個字</b>組成的，抄的時候不要把空格漏掉。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + v.e + '</b>　' + v.z + '　<span class="muted">第 ' + (ci + 1) + ' / ' + CNY.length + '</span>';
      }

      function paintSent() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '用英文介紹過年');
        let y = 48;
        SENT.forEach(function (s, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 50, 8); ctx.fill();
          ctx.fillStyle = C.eng; roundRect(ctx, 24, y, 6, 50, 3); ctx.fill();
          ctx.fillStyle = C.text; ctx.font = 'bold 16px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(s.e, 46, y + 8);
          ctx.fillStyle = C.muted; ctx.font = '13px ' + FONT;
          ctx.fillText(s.z, 46, y + 29);
          ctx.restore();
          y += 55;
        });
        panel(ctx, 24, y + 6, 572)('把字彙放進句子裡，就能向外國朋友介紹自己的年節了。', C.muted, 13, 0);
        readout.innerHTML = '共 <b>' + SENT.length + '</b> 個例句';
      }

      function paint() { if (mode === 'vocab') paintVocab(); else paintSent(); }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '字彙', value: 'vocab' }, { label: '介紹', value: 'sent' }], function (v) { mode = v; syncRow(); paint(); }, 'vocab'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () { ci = (ci - 1 + CNY.length) % CNY.length; paint(); });
      const bNext = Kit.button('下一個 ▶', function () { ci = (ci + 1) % CNY.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext);
      const sb = speakBtn('唸出來', function () {
        return mode === 'vocab' ? CNY[ci].e : SENT.map(function (s) { return s.e; }).join(' ');
      });
      if (sb) row.appendChild(sb);
      function syncRow() { bPrev.style.display = bNext.style.display = (mode === 'vocab') ? '' : 'none'; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「紅包的英文是什麼？」', why: 'lucky money。字面上是「幸運錢」，這樣記比死背快。' },
      { ask: '「lion dance 是幾個字？」', why: '兩個字。這一課六個字彙裡有四個是兩個字，中間的空格最常被漏掉。' },
      { ask: '「firecrackers 拆開來是哪兩個字？」', why: 'fire（火）＋ crackers（爆裂聲）。長單字拆成看得懂的部分就好記了。' },
      { ask: '「你可以用英文說一句過年會做的事嗎？」', why: '從單字推到句子。We eat rice cake. 這種簡單句就夠了。' },
      { ask: '「橘子為什麼會出現在過年？」', why: '這是文化題。課本的節慶單元同時教語言和文化，聊一下背後的意思，孩子記得更牢。' }
    ],

    pitfalls: [
      { bad: '把 lucky money 寫成 luckymoney。', fix: '是<b>兩個字</b>，中間要空格：lucky money。lion dance、rice cake、spring couplet 也一樣。' },
      { bad: '把 firecrackers 寫成 fire crackers。', fix: '這個字反而是<b>一個字</b>：firecrackers。和 lucky money 剛好相反，要分開記。' },
      { bad: '忘記 tangerines 的 s。', fix: '講「吃橘子」通常不只一顆，用<b>複數</b>：tangerines。' },
      { bad: '把 spring couplet 的 couplet 拼成 couple。', fix: 'couplet（對句）比 couple（一對）多一個 <b>t</b>。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'words', 'spell']);

      if (type === 'zh2en') {
        const v = pick(CNY);
        const o = pick4(v.e, CNY.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + v.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.z + ' = ' + v.e + '</b><br>' +
            '拆開記：' + PARTS[v.e][0] + ' ＋ ' + PARTS[v.e][1] + '。<br>' +
            PARTS[v.e][2] + '。'
        };
      }

      if (type === 'en2zh') {
        const v = pick(CNY);
        const o = pick4(v.z, CNY.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + v.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.e + ' = ' + v.z + '</b><br>' +
            '拆開來看：' + PARTS[v.e][0] + ' ＋ ' + PARTS[v.e][1] + '，意思就出來了。<br>' +
            '本課字彙都是過年會看到的東西。'
        };
      }

      if (type === 'words') {
        const v = pick(CNY);
        const isTwo = v.e.indexOf(' ') >= 0;
        const o = shuffled([
          { t: isTwo ? '兩個字，中間要空格' : '一個字，中間不空格', ok: true },
          { t: isTwo ? '一個字，中間不空格' : '兩個字，中間要空格' }
        ]);
        return {
          tpl: 'words',
          q: '<b>' + v.z + '</b> 的英文，是<b>一個字</b>還是<b>兩個字</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.e + '</b> 是' + (isTwo ? '<b>兩個字</b>' : '<b>一個字</b>') + '。<br>' +
            '兩個字的：lion dance、lucky money、rice cake、spring couplet。<br>' +
            '一個字的：firecrackers、tangerines。'
        };
      }

      // spell：拼字
      const v = pick(CNY);
      const one = v.e.replace(/ /g, '');
      const wrongs = [
        v.e.indexOf(' ') >= 0 ? one : v.e.slice(0, 4) + ' ' + v.e.slice(4),
        v.e.slice(0, v.e.length - 1),
        v.e.replace(/e/, 'a')
      ];
      const o = pick4(v.e, wrongs);
      return {
        tpl: 'spell',
        q: '「<b>' + v.z + '</b>」正確的<b>寫法</b>是哪一個？',
        choices: o.choices, answer: o.answer,
        steps: '正確：<b>' + v.e + '</b><br>' +
          PARTS[v.e][2] + '。<br>' +
          '常見錯誤：該空格的沒空格、該加 s 的漏掉、字母拼錯。'
      };
    }
  });

})();
