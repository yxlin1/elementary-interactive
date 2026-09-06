/* ============================================================
   教具 eng5b-u0 Get Ready 世界地標與數字
        eng5b-u1 A Surprise for Jello      eng5b-u2 City Adventure
        eng5b-u3 Clothes Shopping for a Wedding
        eng5b-u4 Whose Backpack Is It?
   康軒 Wonder World 5（115 五下）

   ⚠️ 課本的故事與短文是出版社的著作，這裡<b>一句都不引用</b>。
      字彙與句型取自課程計畫列出的教學重點，例句全部另外寫。
   ⚠️ 這個網站沒有聲音檔（要能離線用）。發音示範靠瀏覽器內建的朗讀
      功能，有就顯示 🔊，沒有就自動隱藏。
      <b>所有練習題都不需要聽聲音就能作答</b>，看拼字規則就答得出來。
   ⚠️ 五下的拼讀教的是<b>子音群</b>（兩個子音黏在一起），
      和五上的長母音不一樣。單字一律取<b>開頭</b>就是那個子音群的，
      混在字中間的不收，孩子才不會被誤導。
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
    const seen = {}; seen[right] = 1;
    const uniq = [];
    shuffle(wrongs).forEach(function (x) { if (!seen[x]) { seen[x] = 1; uniq.push(x); } });
    const all = shuffle([right].concat(uniq.slice(0, 3)));
    return { choices: all, answer: all.indexOf(right) };
  }
  function shuffled(items) {
    const a = shuffle(items);
    return { choices: a.map(function (x) { return x.t; }), answer: a.findIndex(function (x) { return x.ok; }) };
  }

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
  /* 畫單字，開頭的子音群換色 */
  function drawWord(ctx, x, y, word, blend, size, base, hot) {
    ctx.save();
    ctx.font = 'bold ' + size + 'px ' + EN;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let cx = x;
    const n = blend ? blend.length : 0;
    for (let i = 0; i < word.length; i++) {
      ctx.fillStyle = (i < n) ? (hot || C.warn) : (base || C.text);
      ctx.fillText(word.charAt(i), cx, y);
      cx += ctx.measureText(word.charAt(i)).width;
    }
    ctx.restore();
    return cx - x;
  }


  /* ============================================================
     子音群（consonant blends）
     每個單字都是「開頭就是這個子音群」，不收藏在字中間的。
     ============================================================ */
  const BLENDS = [
    {
      unit: 1, family: 'l 家族', say: '子音 ＋ l，兩個音黏在一起唸，中間不要多加母音',
      items: [
        { b: 'pl', words: ['play', 'plane', 'plant', 'please', 'plus'] },
        { b: 'bl', words: ['blue', 'black', 'block', 'blow', 'blanket'] },
        { b: 'gl', words: ['glue', 'glass', 'glad', 'glove', 'glasses'] },
        { b: 'cl', words: ['class', 'clean', 'clock', 'close', 'clothes'] }
      ]
    },
    {
      unit: 2, family: 'r 家族', say: '子音 ＋ r，嘴巴要先做好 r 的形狀再一起發出來',
      items: [
        { b: 'br', words: ['brown', 'bread', 'bring', 'brush', 'brother'] },
        { b: 'pr', words: ['pretty', 'price', 'print', 'prize', 'present'] },
        { b: 'gr', words: ['green', 'grape', 'grass', 'great', 'ground'] },
        { b: 'cr', words: ['cry', 'crab', 'cross', 'crayon', 'cream'] }
      ]
    },
    {
      unit: 3, family: 't／d ＋ r', say: '這兩個唸起來很接近，靠第一個字母分辨',
      items: [
        { b: 'tr', words: ['tree', 'train', 'try', 'truck', 'travel'] },
        { b: 'dr', words: ['dress', 'drink', 'draw', 'dry', 'dream'] }
      ]
    },
    {
      unit: 4, family: 's 家族', say: 's ＋ 子音，s 的氣音要先出來',
      items: [
        { b: 'sp', words: ['spoon', 'sport', 'speak', 'spring', 'spell'] },
        { b: 'st', words: ['stop', 'star', 'study', 'stand', 'store'] },
        { b: 'sk', words: ['sky', 'skirt', 'skate', 'skin', 'skip'] }
      ]
    }
  ];

  const ALL_BLENDS = (function () {
    const a = [];
    BLENDS.forEach(function (g) {
      g.items.forEach(function (it) { a.push({ b: it.b, words: it.words, family: g.family, unit: g.unit }); });
    });
    return a;
  })();


  /* ---------- 各課字彙 ---------- */
  const PLACES = [
    { e: 'bakery', z: '麵包店', w: 1 }, { e: 'bank', z: '銀行', w: 1 },
    { e: 'bookstore', z: '書店', w: 1 }, { e: 'hospital', z: '醫院', w: 1 },
    { e: 'park', z: '公園', w: 1 }, { e: 'post office', z: '郵局', w: 2 },
    { e: 'restaurant', z: '餐廳', w: 1 }, { e: 'supermarket', z: '超級市場', w: 1 }
  ];
  const TRANSPORT = [
    { e: 'bike', z: '腳踏車', cap: false }, { e: 'bus', z: '公車', cap: false },
    { e: 'car', z: '汽車', cap: false }, { e: 'MRT', z: '捷運', cap: true },
    { e: 'plane', z: '飛機', cap: false }, { e: 'scooter', z: '機車', cap: false },
    { e: 'taxi', z: '計程車', cap: false }, { e: 'train', z: '火車', cap: false }
  ];
  /* pl = true 代表這個字<b>只有複數形</b>（一件衣服有兩隻管子那種） */
  const CLOTHES = [
    { e: 'dress', z: '洋裝', pl: false }, { e: 'skirt', z: '裙子', pl: false },
    { e: 'sweater', z: '毛衣', pl: false }, { e: 'T-shirt', z: 'T 恤', pl: false },
    { e: 'pants', z: '長褲', pl: true }, { e: 'shorts', z: '短褲', pl: true },
    { e: 'sneakers', z: '運動鞋', pl: true }, { e: 'socks', z: '襪子', pl: true }
  ];
  const THINGS = [
    { e: 'jacket', z: '外套', pl: false }, { e: 'smartphone', z: '智慧型手機', pl: false },
    { e: 'umbrella', z: '雨傘', pl: false }, { e: 'watch', z: '手錶', pl: false },
    { e: 'water bottle', z: '水壺', pl: false }, { e: 'keys', z: '鑰匙', pl: true },
    { e: 'glasses', z: '眼鏡', pl: true }
  ];
  const LANDMARKS = [
    { e: 'Taipei 101', z: '臺北 101', c: '臺灣' },
    { e: 'the Great Wall', z: '萬里長城', c: '中國' },
    { e: 'the Eiffel Tower', z: '艾菲爾鐵塔', c: '法國' },
    { e: 'the Statue of Liberty', z: '自由女神像', c: '美國' },
    { e: 'Big Ben', z: '大笨鐘', c: '英國' },
    { e: 'the Pyramids', z: '金字塔', c: '埃及' },
    { e: 'the Sydney Opera House', z: '雪梨歌劇院', c: '澳洲' },
    { e: 'Tokyo Tower', z: '東京鐵塔', c: '日本' }
  ];

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  /* 把 0～1000 的數字寫成英文。Unit 3 的價錢會用到 hundred。 */
  function spellNum(n) {
    if (n === 1000) return 'one thousand';
    if (n < 20) return ONES[n];
    if (n < 100) {
      const t = TENS[Math.floor(n / 10)], r = n % 10;
      return r ? t + '-' + ONES[r] : t;
    }
    const h = Math.floor(n / 100), r = n % 100;
    const head = ONES[h] + ' hundred';
    if (!r) return head;
    return head + ' and ' + spellNum(r);
  }


  /* ============================================================
     Get Ready　世界地標與數字
     ============================================================ */
  Kit.register('eng5b-u0', {

    intro: '五下開學先複習兩件事：<b>世界知名地標</b>怎麼用英文說，還有<b>一千以內的數字</b>怎麼唸。數字這一課很重要，因為第三課買衣服會用到幾百塊的價錢。' +
      (CAN_SPEAK ? '按 🔊 可以聽發音。' : '（這台裝置沒有內建朗讀功能，所以沒有聲音；不影響練習。）'),

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'mark', mi = 0, num = 365;

      function paintMark() {
        const ctx = clear(cv);
        const L = LANDMARKS[mi];
        title(ctx, 24, 16, '世界知名地標');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 132, 12); ctx.fill();
        ctx.fillStyle = C.eng; ctx.font = 'bold 32px ' + EN;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(L.e, 310, 100);
        ctx.fillStyle = C.text; ctx.font = '24px ' + FONT;
        ctx.fillText(L.z, 310, 150);
        ctx.restore();

        const w = panel(ctx, 24, 202, 572);
        w('在哪裡：' + L.c, C.warn, 15, 12);
        w('注意 <b>the</b>：像 the Great Wall、the Eiffel Tower 這種前面要加 the；', C.accent, 14, 4);
        w('Taipei 101、Big Ben、Tokyo Tower 這種<b>專有名字</b>就不用。', C.accent, 14, 12);
        w('地標的每個字都要<b>大寫開頭</b>（the 除外），因為它們是專有名詞。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + L.e + '</b>　' + L.z + '（' + L.c + '）　' +
          '<span class="muted">第 ' + (mi + 1) + ' / ' + LANDMARKS.length + '</span>';
      }

      function paintNum() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '一千以內的數字');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 110, 12); ctx.fill();
        ctx.fillStyle = C.warn; ctx.font = 'bold 44px ' + EN;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(num), 310, 88);
        ctx.fillStyle = C.eng; ctx.font = 'bold 22px ' + EN;
        ctx.fillText(spellNum(num), 310, 136);
        ctx.restore();

        /* 拆解 */
        const h = Math.floor(num / 100), r = num % 100;
        const w = panel(ctx, 24, 180, 572);
        if (num >= 100) {
          w('拆開來看：', C.accent, 15, 6);
          w('　' + h + ' 百　→　' + ONES[h] + ' hundred', C.text, 15, 4);
          if (r) w('　剩下 ' + r + '　→　and ' + spellNum(r), C.text, 15, 4);
          w('', C.text, 4, 4);
        }
        w('三個規則：', C.warn, 15, 6);
        w('一、hundred <b>不加 s</b>：three hundred，不是 three hundreds。', C.muted, 13, 2);
        w('二、百位和後面之間要加 <b>and</b>：four hundred and fifty。', C.muted, 13, 2);
        w('三、21 到 99 中間要加<b>連字號</b>：twenty-one、forty-five。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + num + '</b>　=　<b>' + spellNum(num) + '</b>';
      }

      function paint() { if (mode === 'mark') paintMark(); else paintNum(); }

      const seg = Kit.segmented('模式', [
        { label: '世界地標', value: 'mark' }, { label: '數字', value: 'num' }
      ], function (v) { mode = v; sync(); paint(); }, 'mark');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () { mi = (mi - 1 + LANDMARKS.length) % LANDMARKS.length; paint(); });
      const bNext = Kit.button('下一個 ▶', function () { mi = (mi + 1) % LANDMARKS.length; paint(); });
      const bRand = Kit.button('隨機一個數字', function () { num = randInt(1, 999); numCtl.input.value = num; numCtl.output.textContent = num; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bRand);

      const numCtl = Kit.slider('數字', {
        min: 0, max: 1000, value: 365,
        onChange: function (v) { num = v; paint(); }
      });
      const row2 = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row2.appendChild(numCtl.wrap);

      const sb = speakBtn('唸出來', function () {
        return mode === 'mark' ? LANDMARKS[mi].e : spellNum(num);
      });
      if (sb) row.appendChild(sb);

      function sync() {
        bPrev.style.display = bNext.style.display = (mode === 'mark') ? '' : 'none';
        bRand.style.display = row2.style.display = (mode === 'num') ? '' : 'none';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      host.appendChild(row2);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「臺北 101 的英文怎麼說？」', why: 'Taipei 101，直接唸數字。這個最好記，從熟悉的開始。' },
      { ask: '「哪些地標前面要加 the？」', why: 'the Great Wall、the Eiffel Tower 這種「描述性」的要加；Big Ben、Tokyo Tower 這種名字就不用。' },
      { ask: '「365 的英文怎麼唸？」', why: 'three hundred and sixty-five。拉滑桿隨機出一個數字讓他唸，比抄寫有效。' },
      { ask: '「three hundred 要不要加 s？」', why: '不要。這是這一課最常錯的地方，問到會為止。' },
      { ask: '「45 中間要不要加符號？」', why: '要，forty-five 中間有連字號。21 到 99 都一樣。' },
      { ask: '「950 怎麼唸？」', why: 'nine hundred and fifty。第三課買衣服的價錢就長這樣，先練起來。' }
    ],

    pitfalls: [
      { bad: 'three hundreds', fix: 'hundred 前面有數字時<b>不加 s</b>：three <b>hundred</b>。（hundreds of ⋯ 是另一種用法，這一課用不到。）' },
      { bad: 'four hundred fifty', fix: '百位和後面之間要加 <b>and</b>：four hundred <b>and</b> fifty。' },
      { bad: 'twenty one', fix: '21 到 99 中間要加<b>連字號</b>：twenty<b>-</b>one。' },
      { bad: '把 fourteen 和 forty 搞混。', fix: 'four<b>teen</b> 是 14，for<b>ty</b> 是 40。看字尾：-teen 是十幾，-ty 是幾十。' },
      { bad: '地標寫成小寫。', fix: '地標是<b>專有名詞</b>，每個字都要大寫開頭：the <b>G</b>reat <b>W</b>all。只有 the 不用大寫。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['num2en', 'num2en', 'en2num', 'numRule', 'mark', 'markBack', 'markThe']);

      if (type === 'num2en') {
        /* 只出三位數：20、30 這種整十數的誘答去重後只剩兩個選項 */
        const n = randInt(100, 999);
        const right = spellNum(n);
        const wrongs = [
          spellNum(n).replace(' and ', ' '),
          spellNum(n).replace('hundred', 'hundreds'),
          spellNum(n).replace('-', ' '),
          spellNum(n === 999 ? 998 : n + 1)
        ];
        const o = pick4(right, wrongs);
        return {
          tpl: 'num2en',
          q: '數字 <b>' + n + '</b> 的英文寫法是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + n + ' = ' + right + '</b><br>' +
            (n >= 100 ? '百位用 <b>' + ONES[Math.floor(n / 100)] + ' hundred</b>（hundred 不加 s），' +
              (n % 100 ? '後面接 <b>and</b> 再唸剩下的 ' + (n % 100) + '。' : '後面沒有零頭。') : '') + '<br>' +
            '21 到 99 中間要加<b>連字號</b>，例如 forty-five。'
        };
      }

      if (type === 'en2num') {
        const n = randInt(100, 999);
        const pool = [];
        for (let i = 0; i < 8; i++) pool.push(String(randInt(100, 999)));
        pool.push(String(n % 100 ? n - (n % 100) : n + 100));
        const o = pick4(String(n), pool);
        return {
          tpl: 'en2num',
          q: '<b>' + spellNum(n) + '</b> 是哪一個數字？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + spellNum(n) + ' = ' + n + '</b><br>' +
            '拆開聽：<b>' + ONES[Math.floor(n / 100)] + ' hundred</b> 是 ' + (Math.floor(n / 100) * 100) +
            (n % 100 ? '，<b>and ' + spellNum(n % 100) + '</b> 是 ' + (n % 100) + '。' : '。') + '<br>' +
            '聽到 hundred 就先寫百位，聽到 and 後面才是零頭。'
        };
      }

      if (type === 'numRule') {
        const cases = [
          { bad: 'three hundreds', ok: 'three hundred', w: 'hundred 前面有數字時<b>不加 s</b>。' },
          { bad: 'four hundred fifty', ok: 'four hundred and fifty', w: '百位和零頭之間要加 <b>and</b>。' },
          { bad: 'twenty one', ok: 'twenty-one', w: '21 到 99 中間要加<b>連字號</b>。' }
        ];
        const c = pick(cases);
        /* 誘答一定要是「錯誤寫法」。若拿別題的正解當誘答，會出現四個選項三個都對。 */
        const o = pick4(c.ok, cases.map(function (x) { return x.bad; }));
        return {
          tpl: 'numRule',
          q: '下面哪一個寫法是<b>正確</b>的？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + c.ok + '</b><br>' + c.w + '<br>' +
            '三個規則一起記：hundred 不加 s、百位後面加 and、21～99 加連字號。'
        };
      }

      if (type === 'mark') {
        const L = pick(LANDMARKS);
        const o = pick4(L.e, LANDMARKS.filter(function (x) { return x.e !== L.e; }).map(function (x) { return x.e; }));
        return {
          tpl: 'mark',
          q: '「<b>' + L.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + L.z + ' = ' + L.e + '</b>（在' + L.c + '）<br>' +
            '地標是<b>專有名詞</b>，每個字都要大寫開頭。<br>' +
            '注意有些前面要加 the：' + LANDMARKS.filter(function (x) { return x.e.indexOf('the ') === 0; })
              .map(function (x) { return x.e; }).slice(0, 3).join('、') + '。'
        };
      }

      if (type === 'markBack') {
        const L = pick(LANDMARKS);
        const o = pick4(L.c, ['臺灣', '中國', '法國', '美國', '英國', '埃及', '澳洲', '日本']);
        return {
          tpl: 'markBack',
          q: '<b>' + L.e + '</b>（' + L.z + '）在哪一個國家？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + L.e + '</b>（' + L.z + '）在<b>' + L.c + '</b>。<br>' +
            '八個地標：' + LANDMARKS.map(function (x) { return x.z + '（' + x.c + '）'; }).slice(0, 4).join('、') + '⋯⋯<br>' +
            '把地標和國家綁在一起記，兩邊都記得住。'
        };
      }

      // markThe：要不要加 the
      const L = pick(LANDMARKS);
      const hasThe = L.e.indexOf('the ') === 0;
      const o = shuffled([
        { t: hasThe ? '要加 the' : '不用加 the', ok: true },
        { t: hasThe ? '不用加 the' : '要加 the' }
      ]);
      return {
        tpl: 'markThe',
        q: '「' + L.z + '」的英文，前面<b>要不要加 the</b>？',
        choices: o.choices, answer: o.answer,
        steps: '正確寫法是 <b>' + L.e + '</b>，所以<b>' + (hasThe ? '要' : '不用') + '</b>加 the。<br>' +
          '規則：像 the Great Wall、the Eiffel Tower 這種<b>帶有描述</b>的名稱要加 the；<br>' +
          'Taipei 101、Big Ben、Tokyo Tower 這種<b>純粹是名字</b>的就不用。'
      };
    }
  });


  /* ============================================================
     Unit 1　A Surprise for Jello
     字彙：8 個地點　句型：Where are you going? / Are you going to ...?
     拼讀：pl, bl, gl, cl
     ============================================================ */
  Kit.register('eng5b-u1', {

    intro: '問別人要去哪裡。重點是 <b>be going to ＋ 地點</b>，還有 <b>Where</b> 問句和 <b>Are you</b> 問句的回答方式不一樣。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', vi = 0, showZh = false, pi = 0, ask = 'where';

      function paintVocab() {
        const ctx = clear(cv);
        const v = PLACES[vi];
        title(ctx, 24, 16, '地點字彙　' + (vi + 1) + ' / ' + PLACES.length);
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 150, 12); ctx.fill();
        ctx.fillStyle = C.eng; ctx.font = 'bold 40px ' + EN;
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

        const w = panel(ctx, 24, 220, 572);
        w(v.w === 2 ? '這是<b>兩個字</b>，中間要空格：post office。' : '這是<b>一個字</b>，中間不空格。',
          v.w === 2 ? C.no : C.ok, 15, 12);
        w('八個地點只有 <b>post office</b> 是兩個字，其他都是一個字。', C.warn, 14, 8);
        w('bookstore ＝ book ＋ store，supermarket ＝ super ＋ market，拆開來記比較好背。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + v.e + '</b>' + (showZh ? '　' + v.z : '') +
          '　<span class="muted">' + (v.w === 2 ? '兩個字' : '一個字') + '</span>';
      }

      function paintPattern() {
        const ctx = clear(cv);
        const p = PLACES[pi];
        title(ctx, 24, 16, ask === 'where' ? '句型 A：問去哪裡' : '句型 B：確認是不是去某地');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 24px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 42;
        const parts = ask === 'where'
          ? [{ t: 'Where', c: C.warn }, { t: ' are you going?', c: C.text }]
          : [{ t: 'Are', c: C.warn }, { t: ' you going to the ' + p.e + '?', c: C.text }];
        parts.forEach(function (q) { ctx.fillStyle = q.c; ctx.fillText(q.t, x, 84); x += ctx.measureText(q.t).width; });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText(ask === 'where' ? '（你要去哪裡？）' : '（你要去' + p.z + '嗎？）', 42, 116);
        ctx.restore();

        const answers = ask === 'where'
          ? [{ t: "I'm going to the " + p.e + '.', z: '我要去' + p.z + '。', ok: true }]
          : [{ t: 'Yes, I am.', z: '對，我要去。', ok: true },
             { t: "No, I'm not. I'm going to the " + p.e + '.', z: '不是，我要去' + p.z + '。', ok: false }];

        let y = 150;
        answers.forEach(function (a) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 66, 10); ctx.fill();
          ctx.fillStyle = a.ok ? C.ok : C.no; roundRect(ctx, 24, y, 8, 66, 4); ctx.fill();
          ctx.fillStyle = a.ok ? C.ok : C.no; ctx.font = 'bold 19px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(a.t, 48, y + 24);
          ctx.fillStyle = C.muted; ctx.font = '13px ' + FONT;
          ctx.fillText(a.z, 48, y + 50);
          ctx.restore();
          y += 74;
        });

        const w = panel(ctx, 24, y + 8, 572);
        w('句型是 <b>be動詞 ＋ going to ＋ 地點</b>：am going to、are going to。', C.accent, 14, 6);
        w('地點前面通常要加 <b>the</b>：to <b>the</b> park、to <b>the</b> bank。', C.warn, 14, 6);
        w(ask === 'where'
          ? 'Where 問句<b>不能</b>用 Yes／No 回答，要直接說去哪裡。'
          : 'Are you 問句要用 <b>Yes, I am.</b> 或 <b>No, I\'m not.</b> 回答。', C.no, 14, 0);

        readout.innerHTML = ask === 'where'
          ? "<b>Where are you going?</b> → <b>I'm going to the " + p.e + '.</b>'
          : '<b>Are you going to the ' + p.e + '?</b> → <b>Yes, I am.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = BLENDS[0];
        title(ctx, 24, 14, '本課拼讀：' + g.family + '（pl ／ bl ／ gl ／ cl）');
        let y = 44;
        const cols = [C.accent, C.purple, C.ok, C.warn];
        g.items.forEach(function (it, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 74, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 74, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 22px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(it.b, 48, y + 10);
          ctx.restore();
          let px = 100;
          it.words.forEach(function (w) {
            px += drawWord(ctx, px, y + 48, w, it.b, 18, C.text, cols[i]) + 18;
          });
          y += 82;
        });
        const w = panel(ctx, 24, y + 6, 572);
        w(g.say, C.warn, 14, 6);
        w('五下學的是<b>子音群</b>：兩個子音黏在一起，和五上的長母音不一樣。', C.muted, 13, 0);
        readout.innerHTML = '子音群 <b>pl ／ bl ／ gl ／ cl</b>';
      }

      function paint() {
        if (mode === 'vocab') paintVocab();
        else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      const seg = Kit.segmented('模式', [
        { label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }
      ], function (v) { mode = v; sync(); paint(); }, 'vocab');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'vocab') { vi = (vi - 1 + PLACES.length) % PLACES.length; showZh = false; }
        else pi = (pi - 1 + PLACES.length) % PLACES.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'vocab') { vi = (vi + 1) % PLACES.length; showZh = false; }
        else pi = (pi + 1) % PLACES.length;
        paint();
      });
      const bZh = Kit.button('看中文', function () { showZh = !showZh; paint(); });
      const bAsk = Kit.button('換句型 (Where / Are you)', function () { ask = (ask === 'where') ? 'yn' : 'where'; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bZh); row.appendChild(bAsk);
      const sb = speakBtn('唸出來', function () {
        if (mode === 'vocab') return PLACES[vi].e;
        if (mode === 'pat') return ask === 'where'
          ? 'Where are you going? I am going to the ' + PLACES[pi].e + '.'
          : 'Are you going to the ' + PLACES[pi].e + '? Yes, I am.';
        return BLENDS[0].items.map(function (x) { return x.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);
      function sync() {
        bZh.style.display = (mode === 'vocab') ? '' : 'none';
        bAsk.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「Where are you going? 可以用 Yes 回答嗎？」', why: '不行。Where 問的是地點，要直接說去哪裡。這是本課最重要的觀念。' },
      { ask: '「Are you going to the park? 要怎麼回答？」', why: "Yes, I am. / No, I'm not. Yes／No 問句才能用 Yes／No 回答。" },
      { ask: '「to 後面要不要加 the？」', why: '要：to <b>the</b> park。這個小字最常被漏掉。' },
      { ask: '「八個地點裡，哪一個是兩個字？」', why: 'post office。其他都是一個字，記住這一個例外就好。' },
      { ask: '「bookstore 拆開來是哪兩個字？」', why: 'book ＋ store。supermarket 是 super ＋ market。長單字拆開就好記了。' },
      { ask: '「play 和 pay 唸起來差在哪裡？」', why: 'pl 是兩個子音黏在一起，中間<b>不能</b>多出母音。這是子音群最常見的錯誤。' }
    ],

    pitfalls: [
      { bad: 'Where are you going? 回答 Yes, I am.', fix: 'Where 問的是<b>地點</b>，不能用 Yes／No 回答。要說 <b>I\'m going to the park.</b>' },
      { bad: "I'm going to park.", fix: '地點前面要加 <b>the</b>：I\'m going to <b>the</b> park.' },
      { bad: 'I going to the bank.', fix: '少了 be 動詞。要寫 <b>I\'m</b>（I am）going to the bank.' },
      { bad: '把 post office 寫成 postoffice。', fix: '是<b>兩個字</b>，中間要空格：post office。' },
      { bad: '把 pl 唸成兩個音節（像 pe-lay）。', fix: '<b>pl 是黏在一起的</b>，中間不能加母音。play 只有一個音節。' },
      { bad: '把 cl 和 gl 搞混。', fix: '看<b>第一個字母</b>：<b>c</b>lass 是 cl，<b>g</b>lass 是 gl。兩個字只差一個字母，意思完全不同。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'words', 'where', 'yn', 'the', 'blend', 'blend']);

      if (type === 'zh2en') {
        const v = pick(PLACES);
        const o = pick4(v.e, PLACES.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + v.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.z + ' = ' + v.e + '</b><br>' +
            '八個地點：' + PLACES.map(function (x) { return x.e; }).join('、') + '。<br>' +
            '只有 <b>post office</b> 是兩個字，其他都是一個字。'
        };
      }

      if (type === 'en2zh') {
        const v = pick(PLACES);
        const o = pick4(v.z, PLACES.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + v.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.e + ' = ' + v.z + '</b><br>' +
            '拆開來記：bookstore ＝ book ＋ store，supermarket ＝ super ＋ market。<br>' +
            'bakery 是麵包店（bake 是烤），restaurant 是餐廳。'
        };
      }

      if (type === 'words') {
        const v = pick(PLACES);
        const isTwo = v.w === 2;
        const o = shuffled([
          { t: isTwo ? '兩個字，中間要空格' : '一個字，中間不空格', ok: true },
          { t: isTwo ? '一個字，中間不空格' : '兩個字，中間要空格' }
        ]);
        return {
          tpl: 'words',
          q: '「' + v.z + '」的英文是<b>一個字</b>還是<b>兩個字</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + v.e + '</b> 是' + (isTwo ? '<b>兩個字</b>' : '<b>一個字</b>') + '。<br>' +
            '八個地點裡<b>只有 post office 是兩個字</b>，其他七個都是一個字。<br>' +
            'bookstore 和 supermarket 看起來像兩個字，其實是合起來的一個字。'
        };
      }

      if (type === 'where') {
        const v = pick(PLACES);
        const o = shuffled([
          { t: "I'm going to the " + v.e + '.', ok: true },
          { t: 'Yes, I am.' },
          { t: "I'm going to " + v.e + '.' },
          { t: 'I going to the ' + v.e + '.' }
        ]);
        return {
          tpl: 'where',
          q: '<b>Where are you going?</b>（你要去' + v.z + '）<br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: "正確：<b>I'm going to the " + v.e + '.</b><br>' +
            'Where 問的是<b>地點</b>，不能用 Yes／No 回答。<br>' +
            '兩個容易漏掉的地方：<b>I\'m</b>（不能只寫 I）和地點前面的 <b>the</b>。'
        };
      }

      if (type === 'yn') {
        const v = pick(PLACES);
        const yes = Math.random() < 0.5;
        const other = pick(PLACES.filter(function (x) { return x.e !== v.e; }));
        const right = yes ? 'Yes, I am.' : "No, I'm not. I'm going to the " + other.e + '.';
        const o = pick4(right, [
          yes ? "No, I'm not." : 'Yes, I am.',
          'Yes, I do.', "No, I don't.", "I'm going to the " + v.e + '.'
        ]);
        return {
          tpl: 'yn',
          q: '<b>Are you going to the ' + v.e + '?</b><br>' +
            (yes ? '（是的，你要去' + v.z + '）' : '（不是，你要去' + other.z + '）'),
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            '問句用 <b>Are</b>，回答就要用 <b>am</b>／<b>am not</b>，不能換成 do／don\'t。<br>' +
            '否定回答最好<b>補上正確答案</b>，對方才知道你要去哪裡。'
        };
      }

      if (type === 'the') {
        const v = pick(PLACES);
        const o = shuffled([
          { t: "I'm going to the " + v.e + '.', ok: true },
          { t: "I'm going to " + v.e + '.' },
          { t: "I'm going the " + v.e + '.' },
          { t: 'I am going to a ' + v.e + '.' }
        ]);
        return {
          tpl: 'the',
          q: '要說「我要去' + v.z + '」，哪一句<b>完全正確</b>？',
          choices: o.choices, answer: o.answer,
          steps: "正確：<b>I'm going to the " + v.e + '.</b><br>' +
            '句型是 <b>be動詞 ＋ going to ＋ the ＋ 地點</b>。<br>' +
            '三個都不能少：be 動詞（I\'m）、to、the。'
        };
      }

      // blend：本課子音群
      const g = BLENDS[0];
      const it = pick(g.items);
      const w = pick(it.words);
      const wrongs = shuffle(ALL_BLENDS.filter(function (x) { return x.b !== it.b; }))
        .slice(0, 4).map(function (x) { return pick(x.words); });
      const askWhich = Math.random() < 0.5;
      if (askWhich) {
        const o = pick4(it.b, g.items.map(function (x) { return x.b; }).concat(['tr', 'st']));
        return {
          tpl: 'blendWhich',
          q: '單字 <b>' + w + '</b> 是用哪一個<b>子音群</b>開頭的？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
            '同樣 ' + it.b + ' 開頭的字還有：' + it.words.filter(function (x) { return x !== w; }).slice(0, 3).join('、') + '。<br>' +
            '子音群是<b>兩個子音黏在一起</b>，中間不能多出母音。'
        };
      }
      const o = pick4(w, wrongs);
      return {
        tpl: 'blend',
        q: '下面哪一個字，是用 <b>' + it.b + '</b> 開頭的？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
          '本課四個子音群：<b>pl、bl、gl、cl</b>，都是「子音 ＋ l」。<br>' +
          '看單字的<b>前兩個字母</b>就分得出來。'
      };
    }
  });


  /* ============================================================
     Unit 2　City Adventure
     字彙：8 種交通工具　句型：How can we get to ...? / Can we get to ... by ...?
     拼讀：br, pr, gr, cr
     ============================================================ */
  Kit.register('eng5b-u2', {

    intro: '問怎麼去一個地方。重點是 <b>by ＋ 交通工具</b>，而且 <b>by 後面不加 the，也不加 s</b>。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', vi = 0, showZh = false, ti = 0, place = 0, ask = 'how';

      function paintVocab() {
        const ctx = clear(cv);
        title(ctx, 24, 14, '交通工具');
        let y = 44;
        TRANSPORT.forEach(function (t, i) {
          const on = i === vi;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 38, 8); ctx.fill();
          if (t.cap) { ctx.fillStyle = C.warn; roundRect(ctx, 24, y, 6, 38, 3); ctx.fill(); }
          ctx.fillStyle = on ? C.eng : (t.cap ? C.warn : C.text);
          ctx.font = 'bold 19px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(t.e, 48, y + 19);
          ctx.fillStyle = on ? C.text : C.muted; ctx.font = '15px ' + FONT;
          ctx.fillText(t.z, 200, y + 19);
          ctx.fillStyle = C.ok; ctx.font = '13px ' + EN;
          ctx.textAlign = 'right';
          ctx.fillText('by ' + t.e, 578, y + 19);
          ctx.restore();
          y += 42;
        });
        const w = panel(ctx, 24, y + 8, 572);
        w('要說「搭什麼去」，用 <b>by ＋ 交通工具</b>。', C.warn, 15, 6);
        w('by 後面<b>不加 the，也不加 s</b>：by bus（不是 by the bus、by buses）。', C.no, 14, 6);
        w('<b>MRT</b> 是縮寫，三個字母都大寫。', C.accent, 14, 0);
        readout.innerHTML = '<b>' + TRANSPORT[vi].e + '</b>　' + TRANSPORT[vi].z + '　→　<b>by ' + TRANSPORT[vi].e + '</b>';
      }

      function paintPattern() {
        const ctx = clear(cv);
        const t = TRANSPORT[ti], p = PLACES[place];
        title(ctx, 24, 16, ask === 'how' ? '句型 A：問怎麼去' : '句型 B：確認可不可以搭某種工具');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 21px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 40;
        const parts = ask === 'how'
          ? [{ t: 'How', c: C.warn }, { t: ' can we get to the ' + p.e + '?', c: C.text }]
          : [{ t: 'Can', c: C.warn }, { t: ' we get to the ' + p.e + ' ', c: C.text },
             { t: 'by ' + t.e, c: C.ok }, { t: '?', c: C.text }];
        parts.forEach(function (q) { ctx.fillStyle = q.c; ctx.fillText(q.t, x, 84); x += ctx.measureText(q.t).width; });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText(ask === 'how' ? '（我們要怎麼去' + p.z + '？）'
          : '（我們可以搭' + t.z + '去' + p.z + '嗎？）', 40, 116);
        ctx.restore();

        const answers = ask === 'how'
          ? [{ t: 'We can get there by ' + t.e + '.', z: '我們可以搭' + t.z + '去。', ok: true }]
          : [{ t: 'Yes, we can.', z: '可以。', ok: true },
             { t: "No, we can't. We can get there by " + TRANSPORT[(ti + 1) % TRANSPORT.length].e + '.',
               z: '不行，我們可以搭' + TRANSPORT[(ti + 1) % TRANSPORT.length].z + '去。', ok: false }];

        let y = 150;
        answers.forEach(function (a) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 66, 10); ctx.fill();
          ctx.fillStyle = a.ok ? C.ok : C.no; roundRect(ctx, 24, y, 8, 66, 4); ctx.fill();
          ctx.fillStyle = a.ok ? C.ok : C.no; ctx.font = 'bold 17px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(a.t, 48, y + 24);
          ctx.fillStyle = C.muted; ctx.font = '13px ' + FONT;
          ctx.fillText(a.z, 48, y + 50);
          ctx.restore();
          y += 74;
        });

        const w = panel(ctx, 24, y + 8, 572);
        w('<b>get to ＋ 地點</b>＝到達某地；<b>get there</b>＝到那裡（there 前面不加 to）。', C.accent, 14, 6);
        w('<b>by ＋ 交通工具</b>，不加 the 也不加 s。', C.warn, 14, 6);
        w(ask === 'how' ? 'How 問句<b>不能</b>用 Yes／No 回答。' : "Can 問句用 <b>Yes, we can.</b> 或 <b>No, we can't.</b> 回答。", C.no, 14, 0);

        readout.innerHTML = ask === 'how'
          ? '<b>How can we get to the ' + p.e + '?</b> → <b>We can get there by ' + t.e + '.</b>'
          : '<b>Can we get to the ' + p.e + ' by ' + t.e + '?</b> → <b>Yes, we can.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = BLENDS[1];
        title(ctx, 24, 14, '本課拼讀：' + g.family + '（br ／ pr ／ gr ／ cr）');
        let y = 44;
        const cols = [C.accent, C.purple, C.ok, C.warn];
        g.items.forEach(function (it, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 74, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 74, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 22px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(it.b, 48, y + 10);
          ctx.restore();
          let px = 100;
          it.words.forEach(function (w) {
            px += drawWord(ctx, px, y + 48, w, it.b, 18, C.text, cols[i]) + 18;
          });
          y += 82;
        });
        const w = panel(ctx, 24, y + 6, 572);
        w(g.say, C.warn, 14, 6);
        w('和上一課比較：<b>bl</b>（blue）是子音＋l，<b>br</b>（brown）是子音＋r，只差一個字母。', C.muted, 13, 0);
        readout.innerHTML = '子音群 <b>br ／ pr ／ gr ／ cr</b>';
      }

      function paint() {
        if (mode === 'vocab') paintVocab();
        else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      const seg = Kit.segmented('模式', [
        { label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }
      ], function (v) { mode = v; sync(); paint(); }, 'vocab');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'vocab') vi = (vi - 1 + TRANSPORT.length) % TRANSPORT.length;
        else ti = (ti - 1 + TRANSPORT.length) % TRANSPORT.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'vocab') vi = (vi + 1) % TRANSPORT.length;
        else ti = (ti + 1) % TRANSPORT.length;
        paint();
      });
      const bPlace = Kit.button('換地點', function () { place = (place + 1) % PLACES.length; paint(); });
      const bAsk = Kit.button('換句型 (How / Can)', function () { ask = (ask === 'how') ? 'yn' : 'how'; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bPlace); row.appendChild(bAsk);
      const sb = speakBtn('唸出來', function () {
        if (mode === 'vocab') return 'by ' + TRANSPORT[vi].e;
        if (mode === 'pat') return 'How can we get to the ' + PLACES[place].e + '? We can get there by ' + TRANSPORT[ti].e + '.';
        return BLENDS[1].items.map(function (x) { return x.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);
      function sync() {
        bPlace.style.display = bAsk.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「搭公車去，英文怎麼說？」', why: 'by bus。提醒他 by 後面<b>不加 the 也不加 s</b>，這是本課最重要的規則。' },
      { ask: '「捷運的英文要大寫還是小寫？」', why: 'MRT 三個字母都大寫，因為它是縮寫。' },
      { ask: '「How can we get to the park? 可以回答 Yes 嗎？」', why: '不行。How 問的是方法，要說搭什麼去。' },
      { ask: '「Can we get there by bike? 要怎麼回答？」', why: "Yes, we can. / No, we can't. 問句用 Can，回答就用 can。" },
      { ask: '「get there 前面要不要加 to？」', why: '不要。get to <b>the park</b>，但 get <b>there</b>，there 前面不加 to。' },
      { ask: '「brown 和 blown 差在哪個字母？」', why: 'r 和 l。這一課和上一課只差這一個字母，一起比最有效。' }
    ],

    pitfalls: [
      { bad: 'by the bus', fix: 'by 後面<b>不加 the</b>：<b>by bus</b>。' },
      { bad: 'by buses', fix: 'by 後面用<b>單數</b>，不加 s：<b>by bus</b>。' },
      { bad: '把 MRT 寫成 mrt 或 Mrt。', fix: 'MRT 是縮寫，<b>三個字母都大寫</b>。' },
      { bad: 'How can we get to the park? 回答 Yes, we can.', fix: 'How 問的是<b>方法</b>，要說 <b>We can get there by bus.</b>' },
      { bad: 'We can get to there by bus.', fix: 'there 前面<b>不加 to</b>：get <b>there</b>。（地點才要 to：get <b>to</b> the park。）' },
      { bad: '把 gr 和 gl 搞混。', fix: '看<b>第二個字母</b>：<b>gr</b>een 是 r，<b>gl</b>ass 是 l。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'by', 'by', 'how', 'can', 'cap', 'blend', 'blend']);

      if (type === 'zh2en') {
        const t = pick(TRANSPORT);
        const o = pick4(t.e, TRANSPORT.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + t.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.z + ' = ' + t.e + '</b><br>' +
            '八種交通工具：' + TRANSPORT.map(function (x) { return x.e; }).join('、') + '。<br>' +
            '只有 <b>MRT</b> 要全部大寫，因為它是縮寫。'
        };
      }

      if (type === 'en2zh') {
        const t = pick(TRANSPORT);
        const o = pick4(t.z, TRANSPORT.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + t.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.e + ' = ' + t.z + '</b><br>' +
            '容易混的兩個：<b>scooter</b> 是機車，<b>bike</b> 是腳踏車。<br>' +
            '<b>MRT</b> 是捷運（Mass Rapid Transit 的縮寫）。'
        };
      }

      if (type === 'by') {
        const t = pick(TRANSPORT);
        const o = shuffled([
          { t: 'by ' + t.e, ok: true },
          { t: 'by the ' + t.e },
          { t: 'by ' + t.e + 's' },
          { t: 'by a ' + t.e }
        ]);
        return {
          tpl: 'by',
          q: '「搭' + t.z + '」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>by ' + t.e + '</b><br>' +
            'by 後面<b>不加 the、不加 a、也不加 s</b>，直接接交通工具的單數。<br>' +
            '這是這一課最常被扣分的地方。'
        };
      }

      if (type === 'how') {
        const t = pick(TRANSPORT), p = pick(PLACES);
        const o = shuffled([
          { t: 'We can get there by ' + t.e + '.', ok: true },
          { t: 'Yes, we can.' },
          { t: 'We can get to there by ' + t.e + '.' },
          { t: 'We can get there by the ' + t.e + '.' }
        ]);
        return {
          tpl: 'how',
          q: '<b>How can we get to the ' + p.e + '?</b>（搭' + t.z + '去）<br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>We can get there by ' + t.e + '.</b><br>' +
            'How 問的是<b>方法</b>，不能用 Yes／No 回答。<br>' +
            '兩個小地方：<b>there 前面不加 to</b>，<b>by 後面不加 the</b>。'
        };
      }

      if (type === 'can') {
        const t = pick(TRANSPORT), p = pick(PLACES);
        const yes = Math.random() < 0.5;
        const other = pick(TRANSPORT.filter(function (x) { return x.e !== t.e; }));
        const right = yes ? 'Yes, we can.' : "No, we can't. We can get there by " + other.e + '.';
        const o = pick4(right, [
          yes ? "No, we can't." : 'Yes, we can.',
          'Yes, we do.', "No, we aren't.", 'We can get there by ' + t.e + '.'
        ]);
        return {
          tpl: 'can',
          q: '<b>Can we get to the ' + p.e + ' by ' + t.e + '?</b><br>' +
            (yes ? '（可以）' : '（不行，要搭' + other.z + '）'),
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            '問句用 <b>Can</b>，回答就要用 <b>can</b>／<b>can\'t</b>，不能換成 do／are。<br>' +
            '否定回答最好補上可以搭什麼，對方才知道怎麼辦。'
        };
      }

      if (type === 'cap') {
        const o = shuffled([
          { t: 'MRT', ok: true },
          { t: 'mrt' }, { t: 'Mrt' }, { t: 'mRT' }
        ]);
        return {
          tpl: 'cap',
          q: '「捷運」正確的英文寫法是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>MRT</b><br>' +
            'MRT 是 <b>Mass Rapid Transit</b> 的縮寫，縮寫的每個字母都要<b>大寫</b>。<br>' +
            '和五上的 <b>PE</b>（Physical Education）是同一個道理。'
        };
      }

      // blend：本課子音群
      const g = BLENDS[1];
      const it = pick(g.items);
      const w = pick(it.words);
      const askWhich = Math.random() < 0.5;
      if (askWhich) {
        const o = pick4(it.b, g.items.map(function (x) { return x.b; }).concat(['bl', 'gl', 'cl']));
        return {
          tpl: 'blendWhich',
          q: '單字 <b>' + w + '</b> 是用哪一個<b>子音群</b>開頭的？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
            '同樣 ' + it.b + ' 開頭的字還有：' + it.words.filter(function (x) { return x !== w; }).slice(0, 3).join('、') + '。<br>' +
            '和上一課比較：第二個字母是 <b>r</b> 還是 <b>l</b>，就是這兩課的差別。'
        };
      }
      const wrongs = shuffle(ALL_BLENDS.filter(function (x) { return x.b !== it.b; }))
        .slice(0, 4).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'blend',
        q: '下面哪一個字，是用 <b>' + it.b + '</b> 開頭的？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
          '本課四個子音群：<b>br、pr、gr、cr</b>，都是「子音 ＋ r」。<br>' +
          '看單字的<b>前兩個字母</b>就分得出來。'
      };
    }
  });


  /* ============================================================
     Unit 3　Clothes Shopping for a Wedding
     字彙：8 種衣物　句型：How much is / are ...?
     拼讀：tr, dr
     ============================================================ */
  Kit.register('eng5b-u3', {

    intro: '問衣服多少錢。這一課有一個非學不可的規則：<b>長褲、短褲、鞋子、襪子在英文裡永遠是複數</b>，所以要用 <b>are</b> 和 <b>They\'re</b>。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'vocab', vi = 0, price = 450;

      function paintVocab() {
        const ctx = clear(cv);
        title(ctx, 24, 14, '衣物字彙　單數 vs 只有複數');
        let y = 44;
        CLOTHES.forEach(function (c, i) {
          const on = i === vi;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 38, 8); ctx.fill();
          ctx.fillStyle = c.pl ? C.no : C.ok;
          roundRect(ctx, 24, y, 6, 38, 3); ctx.fill();
          ctx.fillStyle = on ? C.eng : C.text; ctx.font = 'bold 19px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(c.e, 48, y + 19);
          ctx.fillStyle = on ? C.text : C.muted; ctx.font = '15px ' + FONT;
          ctx.fillText(c.z, 210, y + 19);
          ctx.fillStyle = c.pl ? C.no : C.ok; ctx.font = 'bold 13px ' + EN;
          ctx.textAlign = 'right';
          ctx.fillText(c.pl ? 'are / They\'re' : 'is / It\'s', 578, y + 19);
          ctx.restore();
          y += 42;
        });
        const w = panel(ctx, 24, y + 8, 572);
        w('紅色的四個是<b>只有複數形</b>的字：pants、shorts、sneakers、socks。', C.no, 15, 6);
        w('為什麼？因為它們都是<b>成雙成對</b>的東西（兩隻褲管、兩隻腳）。', C.text, 14, 6);
        w('所以問價錢時要用 <b>How much are</b>，回答用 <b>They\'re</b>。', C.warn, 14, 0);
        readout.innerHTML = '<b>' + CLOTHES[vi].e + '</b>　' + CLOTHES[vi].z + '　' +
          (CLOTHES[vi].pl ? '<span style="color:var(--no)">只有複數形</span>' : '<span style="color:var(--ok)">單數</span>');
      }

      function paintPattern() {
        const ctx = clear(cv);
        const c = CLOTHES[vi];
        title(ctx, 24, 16, '句型：問價錢');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 24px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 42;
        [{ t: 'How much ', c: C.text }, { t: c.pl ? 'are' : 'is', c: C.warn },
         { t: ' the ' + c.e + '?', c: C.text }].forEach(function (q) {
          ctx.fillStyle = q.c; ctx.fillText(q.t, x, 84); x += ctx.measureText(q.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（這' + c.z + '多少錢？）', 42, 116);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 148, 572, 82, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 24, 148, 8, 82, 4); ctx.fill();
        ctx.font = 'bold 22px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x2 = 48;
        [{ t: c.pl ? "They're " : "It's ", c: C.warn },
         { t: spellNum(price) + ' dollars.', c: C.ok }].forEach(function (q) {
          ctx.fillStyle = q.c; ctx.fillText(q.t, x2, 180); x2 += ctx.measureText(q.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（' + price + ' 元。）', 48, 212);
        ctx.restore();

        const w = panel(ctx, 24, 244, 572);
        w(c.pl
          ? c.e + ' 是<b>只有複數形</b>的字（成雙成對），所以用 <b>are</b> 和 <b>They\'re</b>。'
          : c.e + ' 是<b>單數</b>，所以用 <b>is</b> 和 <b>It\'s</b>。',
          c.pl ? C.no : C.ok, 15, 10);
        w('價錢的唸法：<b>' + spellNum(price) + ' dollars</b>。hundred 不加 s，百位後面加 and。', C.accent, 14, 6);
        w('dollars 要加 s（不只一元的時候）。', C.muted, 13, 0);

        readout.innerHTML = '<b>How much ' + (c.pl ? 'are' : 'is') + ' the ' + c.e + '?</b> → <b>' +
          (c.pl ? "They're " : "It's ") + spellNum(price) + ' dollars.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = BLENDS[2];
        title(ctx, 24, 16, '本課拼讀：' + g.family + '（tr ／ dr）');
        let y = 56;
        const cols = [C.accent, C.purple];
        g.items.forEach(function (it, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 96, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 96, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 26px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(it.b, 48, y + 14);
          ctx.restore();
          let px = 110;
          it.words.forEach(function (w) {
            px += drawWord(ctx, px, y + 60, w, it.b, 20, C.text, cols[i]) + 20;
          });
          y += 106;
        });
        const w = panel(ctx, 24, y + 8, 572);
        w(g.say, C.warn, 15, 8);
        w('<b>tr</b>ee 和 <b>dr</b>ess 唸起來很像，靠<b>第一個字母</b>分辨：t 還是 d。', C.text, 14, 8);
        w('本課字彙 <b>dress</b> 就是 dr 開頭的。', C.accent, 14, 0);
        readout.innerHTML = '子音群 <b>tr ／ dr</b>';
      }

      function paint() {
        if (mode === 'vocab') paintVocab();
        else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      const seg = Kit.segmented('模式', [
        { label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }
      ], function (v) { mode = v; sync(); paint(); }, 'vocab');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () { vi = (vi - 1 + CLOTHES.length) % CLOTHES.length; paint(); });
      const bNext = Kit.button('下一個 ▶', function () { vi = (vi + 1) % CLOTHES.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext);

      const priceCtl = Kit.slider('價錢', {
        min: 50, max: 990, step: 10, value: 450, format: function (v) { return v + ' 元'; },
        onChange: function (v) { price = v; paint(); }
      });
      const row2 = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row2.appendChild(priceCtl.wrap);

      const sb = speakBtn('唸出來', function () {
        const c = CLOTHES[vi];
        if (mode === 'vocab') return c.e;
        if (mode === 'pat') return 'How much ' + (c.pl ? 'are' : 'is') + ' the ' + c.e + '? ' +
          (c.pl ? "They're " : "It's ") + spellNum(price) + ' dollars.';
        return BLENDS[2].items.map(function (x) { return x.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);
      function sync() {
        row2.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      host.appendChild(row2);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「pants 為什麼要用 are？」', why: '因為它是<b>成雙成對</b>的東西，英文裡永遠是複數。四個都是這樣：pants、shorts、sneakers、socks。' },
      { ask: '「哪四個要用 are？哪四個用 is？」', why: '成雙的用 are，單件的用 is。畫面上紅色的就是要用 are 的。' },
      { ask: '「How much are the pants? 要怎麼回答？」', why: "They're ... dollars. 用 They're，不是 It's。" },
      { ask: '「900 塊怎麼唸？」', why: 'nine hundred dollars。hundred 不加 s，dollars 要加 s。' },
      { ask: '「450 呢？」', why: 'four hundred and fifty。中間的 <b>and</b> 不能少。' },
      { ask: '「tree 和 dress 的開頭差在哪？」', why: 't 和 d。這兩個子音群唸起來很像，靠第一個字母分辨。' }
    ],

    pitfalls: [
      { bad: 'How much is the pants?', fix: 'pants 是<b>只有複數形</b>的字，要用 <b>are</b>：How much <b>are</b> the pants?' },
      { bad: "It's four hundred dollars.（問 pants 時）", fix: '主詞是複數，要用 <b>They\'re</b>：They\'re four hundred dollars.' },
      { bad: 'How much are the dress?', fix: 'dress 是<b>單數</b>，要用 <b>is</b>：How much <b>is</b> the dress?' },
      { bad: 'nine hundreds dollars', fix: 'hundred <b>不加 s</b>：nine <b>hundred</b> dollars。' },
      { bad: 'four hundred fifty dollars', fix: '百位和零頭之間要加 <b>and</b>：four hundred <b>and</b> fifty dollars。' },
      { bad: 'It\'s nine hundred dollar.', fix: '不只一元的時候，<b>dollars 要加 s</b>。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'plural', 'isAre', 'isAre', 'answer', 'price', 'blend']);

      if (type === 'zh2en') {
        const c = pick(CLOTHES);
        const o = pick4(c.e, CLOTHES.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + c.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.z + ' = ' + c.e + '</b><br>' +
            '八種衣物：' + CLOTHES.map(function (x) { return x.e; }).join('、') + '。<br>' +
            '其中 <b>pants、shorts、sneakers、socks</b> 這四個永遠是複數形。'
        };
      }

      if (type === 'en2zh') {
        const c = pick(CLOTHES);
        const o = pick4(c.z, CLOTHES.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + c.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.e + ' = ' + c.z + '</b><br>' +
            '容易混的兩個：<b>pants</b> 是長褲，<b>shorts</b> 是短褲（short 是「短」）。<br>' +
            '<b>sneakers</b> 是運動鞋，<b>socks</b> 是襪子。'
        };
      }

      if (type === 'plural') {
        const c = pick(CLOTHES);
        const o = shuffled([
          { t: c.pl ? '永遠是複數形，要用 are' : '是單數，要用 is', ok: true },
          { t: c.pl ? '是單數，要用 is' : '永遠是複數形，要用 are' }
        ]);
        return {
          tpl: 'plural',
          q: '<b>' + c.e + '</b>（' + c.z + '）在英文裡是單數還是複數？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.e + '</b>' + (c.pl ? '永遠是<b>複數形</b>。' : '是<b>單數</b>。') + '<br>' +
            (c.pl
              ? '因為它是<b>成雙成對</b>的東西（兩隻褲管、兩隻腳），所以英文裡沒有單數形。'
              : '它是單獨一件的東西，所以是單數。') + '<br>' +
            '四個複數形：<b>pants、shorts、sneakers、socks</b>。其他四個是單數。'
        };
      }

      if (type === 'isAre') {
        const c = pick(CLOTHES);
        const right = c.pl ? 'are' : 'is';
        const o = pick4(right, ['is', 'are', 'am', 'do']);
        return {
          tpl: 'isAre',
          q: '<b>How much ____ the ' + c.e + '?</b><br>空格要填哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.e + '</b> 是' + (c.pl ? '<b>複數形</b>，所以用 <b>are</b>' : '<b>單數</b>，所以用 <b>is</b>') + '。<br>' +
            '記法：<b>成雙成對</b>的（pants、shorts、sneakers、socks）用 are，其他用 is。<br>' +
            '問價錢用 How much，不能用 How many。'
        };
      }

      if (type === 'answer') {
        const c = pick(CLOTHES);
        const p = randInt(1, 9) * 100 + pick([0, 50]);
        const right = (c.pl ? "They're " : "It's ") + spellNum(p) + ' dollars.';
        const o = pick4(right, [
          (c.pl ? "It's " : "They're ") + spellNum(p) + ' dollars.',
          (c.pl ? "They're " : "It's ") + spellNum(p) + ' dollar.',
          (c.pl ? "They're " : "It's ") + spellNum(p).replace('hundred', 'hundreds') + ' dollars.'
        ]);
        return {
          tpl: 'answer',
          q: '<b>How much ' + (c.pl ? 'are' : 'is') + ' the ' + c.e + '?</b>（' + p + ' 元）<br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            '<b>' + c.e + '</b> 是' + (c.pl ? '複數，用 <b>They\'re</b>' : '單數，用 <b>It\'s</b>') + '。<br>' +
            'hundred <b>不加 s</b>，但 dollars <b>要加 s</b>。這兩個剛好相反，要小心。'
        };
      }

      if (type === 'price') {
        const p = randInt(1, 9) * 100 + pick([0, 20, 50, 90]);
        const right = spellNum(p) + ' dollars';
        const o = pick4(right, [
          spellNum(p).replace(' and ', ' ') + ' dollars',
          spellNum(p).replace('hundred', 'hundreds') + ' dollars',
          spellNum(p) + ' dollar'
        ]);
        return {
          tpl: 'price',
          q: '<b>' + p + ' 元</b>的英文寫法是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            'hundred <b>不加 s</b>；' + (p % 100 ? '百位和零頭之間要加 <b>and</b>；' : '') + 'dollars <b>要加 s</b>。<br>' +
            '拆開唸：' + ONES[Math.floor(p / 100)] + ' hundred' + (p % 100 ? ' and ' + spellNum(p % 100) : '') + '。'
        };
      }

      // blend：tr / dr
      const g = BLENDS[2];
      const it = pick(g.items);
      const w = pick(it.words);
      const other = g.items.filter(function (x) { return x.b !== it.b; })[0];
      const o = pick4(w, other.words.concat(shuffle(ALL_BLENDS.filter(function (x) {
        return x.b !== 'tr' && x.b !== 'dr';
      })).slice(0, 2).map(function (x) { return pick(x.words); })));
      return {
        tpl: 'blend',
        q: '下面哪一個字，是用 <b>' + it.b + '</b> 開頭的？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
          'tr 和 dr 唸起來很像，靠<b>第一個字母</b>分辨：<b>t</b>ree 是 tr，<b>d</b>ress 是 dr。<br>' +
          '本課字彙 <b>dress</b> 就是 dr 開頭的。'
      };
    }
  });


  /* ============================================================
     Unit 4　Whose Backpack Is It?
     字彙：7 樣隨身物品　句型：Whose ... is it? / Whose ... are they?
     拼讀：sp, st, sk
     ============================================================ */
  Kit.register('eng5b-u4', {

    intro: '問東西是誰的。兩個重點：<b>Whose ＋ 名詞</b>，還有<b>人名要加 \'s</b>（Kevin\'s）。眼鏡和鑰匙是複數，要用 are 和 They\'re。切換三個模式：<b>字彙</b>、<b>句型</b>、<b>拼讀</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      const OWNERS = [
        { n: "Kevin's", z: '凱文的' }, { n: "Amy's", z: '艾咪的' },
        { n: 'my', z: '我的' }, { n: 'her', z: '她的' }, { n: 'his', z: '他的' }
      ];
      let mode = 'vocab', vi = 0, oi = 0;

      function paintVocab() {
        const ctx = clear(cv);
        title(ctx, 24, 14, '隨身物品　單數 vs 只有複數');
        let y = 44;
        THINGS.forEach(function (t, i) {
          const on = i === vi;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 42, 8); ctx.fill();
          ctx.fillStyle = t.pl ? C.no : C.ok;
          roundRect(ctx, 24, y, 6, 42, 3); ctx.fill();
          ctx.fillStyle = on ? C.eng : C.text; ctx.font = 'bold 19px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(t.e, 48, y + 21);
          ctx.fillStyle = on ? C.text : C.muted; ctx.font = '15px ' + FONT;
          ctx.fillText(t.z, 250, y + 21);
          ctx.fillStyle = t.pl ? C.no : C.ok; ctx.font = 'bold 13px ' + EN;
          ctx.textAlign = 'right';
          ctx.fillText(t.pl ? 'are they? / They\'re' : "is it? / It's", 578, y + 21);
          ctx.restore();
          y += 46;
        });
        const w = panel(ctx, 24, y + 10, 572);
        w('紅色的兩個是<b>只有複數形</b>：keys、glasses。', C.no, 15, 6);
        w('glasses（眼鏡）有兩片鏡片，keys（鑰匙）通常一串，所以是複數。', C.text, 14, 6);
        w('<b>water bottle</b> 是兩個字，中間要空格；smartphone 是一個字。', C.warn, 14, 0);
        readout.innerHTML = '<b>' + THINGS[vi].e + '</b>　' + THINGS[vi].z + '　' +
          (THINGS[vi].pl ? '<span style="color:var(--no)">複數</span>' : '<span style="color:var(--ok)">單數</span>');
      }

      function paintPattern() {
        const ctx = clear(cv);
        const t = THINGS[vi], o = OWNERS[oi];
        title(ctx, 24, 16, '句型：問東西是誰的');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 82, 10); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 23px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = 42;
        [{ t: 'Whose ', c: C.warn }, { t: t.e, c: C.text },
         { t: t.pl ? ' are they?' : ' is it?', c: C.accent }].forEach(function (q) {
          ctx.fillStyle = q.c; ctx.fillText(q.t, x, 84); x += ctx.measureText(q.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（這' + t.z + '是誰的？）', 42, 116);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 148, 572, 82, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 24, 148, 8, 82, 4); ctx.fill();
        ctx.font = 'bold 23px ' + EN; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x2 = 48;
        [{ t: t.pl ? "They're " : "It's ", c: C.warn },
         { t: o.n + ' ' + t.e + '.', c: C.ok }].forEach(function (q) {
          ctx.fillStyle = q.c; ctx.fillText(q.t, x2, 180); x2 += ctx.measureText(q.t).width;
        });
        ctx.fillStyle = C.muted; ctx.font = '15px ' + FONT;
        ctx.fillText('（是' + o.z + t.z + '。）', 48, 212);
        ctx.restore();

        const w = panel(ctx, 24, 244, 572);
        w('<b>Whose</b> 問「誰的」，後面直接接名詞：Whose ' + t.e + '⋯⋯', C.accent, 14, 8);
        w(t.pl
          ? t.e + ' 是<b>複數</b>，所以用 <b>are they?</b> 和 <b>They\'re</b>。'
          : t.e + ' 是<b>單數</b>，所以用 <b>is it?</b> 和 <b>It\'s</b>。',
          t.pl ? C.no : C.ok, 14, 8);
        w(o.n.indexOf("'s") > 0
          ? '人名要加 <b>\'s</b> 才表示「誰的」：' + o.n + '（' + o.z + '）。'
          : '<b>' + o.n + '</b> 本身就是所有格，後面<b>不加 \'s</b>。', C.warn, 14, 0);

        readout.innerHTML = '<b>Whose ' + t.e + (t.pl ? ' are they?' : ' is it?') + '</b> → <b>' +
          (t.pl ? "They're " : "It's ") + o.n + ' ' + t.e + '.</b>';
      }

      function paintPhonics() {
        const ctx = clear(cv);
        const g = BLENDS[3];
        title(ctx, 24, 14, '本課拼讀：' + g.family + '（sp ／ st ／ sk）');
        let y = 48;
        const cols = [C.accent, C.purple, C.ok];
        g.items.forEach(function (it, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 88, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 24, y, 8, 88, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 24px ' + EN;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(it.b, 48, y + 12);
          ctx.restore();
          let px = 106;
          it.words.forEach(function (w) {
            px += drawWord(ctx, px, y + 56, w, it.b, 19, C.text, cols[i]) + 18;
          });
          y += 96;
        });
        const w = panel(ctx, 24, y + 8, 572);
        w(g.say, C.warn, 14, 6);
        w('本課字彙 <b>smartphone</b> 是 sm 開頭，和 sp／st／sk 是同一個 s 家族。', C.accent, 13, 6);
        w('注意 <b>skirt</b>（裙子，第三課學過）就是 sk 開頭的。', C.muted, 13, 0);
        readout.innerHTML = '子音群 <b>sp ／ st ／ sk</b>';
      }

      function paint() {
        if (mode === 'vocab') paintVocab();
        else if (mode === 'pat') paintPattern();
        else paintPhonics();
      }

      const seg = Kit.segmented('模式', [
        { label: '字彙', value: 'vocab' }, { label: '句型', value: 'pat' }, { label: '拼讀', value: 'ph' }
      ], function (v) { mode = v; sync(); paint(); }, 'vocab');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () { vi = (vi - 1 + THINGS.length) % THINGS.length; paint(); });
      const bNext = Kit.button('下一個 ▶', function () { vi = (vi + 1) % THINGS.length; paint(); });
      const bOwn = Kit.button('換擁有者', function () { oi = (oi + 1) % OWNERS.length; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bOwn);
      const sb = speakBtn('唸出來', function () {
        const t = THINGS[vi];
        if (mode === 'vocab') return t.e;
        if (mode === 'pat') return 'Whose ' + t.e + (t.pl ? ' are they?' : ' is it?');
        return BLENDS[3].items.map(function (x) { return x.words[0]; }).join(', ');
      });
      if (sb) row.appendChild(sb);
      function sync() {
        bOwn.style.display = (mode === 'pat') ? '' : 'none';
        bPrev.style.display = bNext.style.display = (mode === 'ph') ? 'none' : '';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「Whose 是什麼意思？」', why: '「誰的」。和 Who（誰）差一個 se，意思完全不同。' },
      { ask: '「glasses 要用 is 還是 are？」', why: 'are。眼鏡有兩片鏡片，keys 也是複數。其他五個都是單數。' },
      { ask: '「凱文的外套，英文怎麼說？」', why: "Kevin's jacket。人名後面要加 <b>'s</b>。" },
      { ask: '「my 後面要不要加 \'s？」', why: '不用。my、his、her 本身就是所有格了。只有<b>人名</b>要加 \'s。' },
      { ask: '「water bottle 是幾個字？」', why: '兩個字，中間要空格。smartphone 是一個字，剛好相反。' },
      { ask: '「star 和 skirt 的開頭差在哪？」', why: 'st 和 sk。s 家族的字都要先把 s 的氣音送出來。' }
    ],

    pitfalls: [
      { bad: 'Whose glasses is it?', fix: 'glasses 是<b>複數</b>，要用 <b>are they</b>：Whose glasses <b>are they</b>?' },
      { bad: "It's Kevin glasses.", fix: '兩個錯：複數要用 <b>They\'re</b>，人名要加 <b>\'s</b>。正確是 They\'re <b>Kevin\'s</b> glasses.' },
      { bad: "It's my's watch.", fix: 'my 本身就是所有格，<b>不加 \'s</b>：It\'s <b>my</b> watch.' },
      { bad: '把 Whose 寫成 Who。', fix: '<b>Who</b> 問「誰」，<b>Whose</b> 問「誰的」。這一課問的是東西的主人，要用 Whose。' },
      { bad: '把 water bottle 寫成 waterbottle。', fix: '是<b>兩個字</b>，中間要空格：water bottle。' },
      { bad: '把 st 和 sk 搞混。', fix: '看<b>第二個字母</b>：<b>st</b>op 是 t，<b>sk</b>y 是 k。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['zh2en', 'en2zh', 'plural', 'whose', 'whose', 'poss', 'words', 'blend']);

      if (type === 'zh2en') {
        const t = pick(THINGS);
        const o = pick4(t.e, THINGS.map(function (x) { return x.e; }));
        return {
          tpl: 'zh2en',
          q: '「<b>' + t.z + '</b>」的英文是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.z + ' = ' + t.e + '</b><br>' +
            '七樣物品：' + THINGS.map(function (x) { return x.e; }).join('、') + '。<br>' +
            '<b>keys</b> 和 <b>glasses</b> 是複數形，其他五個是單數。'
        };
      }

      if (type === 'en2zh') {
        const t = pick(THINGS);
        const o = pick4(t.z, THINGS.map(function (x) { return x.z; }));
        return {
          tpl: 'en2zh',
          q: '<b>' + t.e + '</b> 的中文意思是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.e + ' = ' + t.z + '</b><br>' +
            'smartphone ＝ smart（聰明的）＋ phone（電話）。<br>' +
            'water bottle 是<b>兩個字</b>，smartphone 是<b>一個字</b>，剛好相反。'
        };
      }

      if (type === 'plural') {
        const t = pick(THINGS);
        const right = t.pl ? 'are they?' : 'is it?';
        const o = pick4(right, ['is it?', 'are they?', 'is they?', 'are it?']);
        return {
          tpl: 'plural',
          q: '<b>Whose ' + t.e + ' ____</b><br>空格要填哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.e + '</b> 是' + (t.pl ? '<b>複數</b>，所以用 <b>are they?</b>' : '<b>單數</b>，所以用 <b>is it?</b>') + '<br>' +
            '複數的只有兩個：<b>keys</b>（一串鑰匙）和 <b>glasses</b>（兩片鏡片）。<br>' +
            '其他五個都是單數，用 is it?'
        };
      }

      if (type === 'whose') {
        const t = pick(THINGS);
        const owner = pick(["Kevin's", "Amy's", 'my', 'her', 'his']);
        const right = (t.pl ? "They're " : "It's ") + owner + ' ' + t.e + '.';
        const o = pick4(right, [
          (t.pl ? "It's " : "They're ") + owner + ' ' + t.e + '.',
          (t.pl ? "They're " : "It's ") + owner.replace("'s", '') + ' ' + t.e + '.',
          (t.pl ? "They're " : "It's ") + owner + "'s " + t.e + '.'
        ]);
        return {
          tpl: 'whose',
          q: '<b>Whose ' + t.e + (t.pl ? ' are they?' : ' is it?') + '</b>（是' +
            (owner.indexOf("'s") > 0 ? owner.replace("'s", '') + ' 的' : { my: '我的', her: '她的', his: '他的' }[owner]) +
            t.z + '）<br>要怎麼回答？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            '<b>' + t.e + '</b> 是' + (t.pl ? '複數，用 <b>They\'re</b>' : '單數，用 <b>It\'s</b>') + '。<br>' +
            (owner.indexOf("'s") > 0
              ? '人名要加 <b>\'s</b> 才表示「誰的」。'
              : '<b>' + owner + '</b> 本身就是所有格，後面<b>不能再加 \'s</b>。')
        };
      }

      if (type === 'poss') {
        const isName = Math.random() < 0.5;
        const word = isName ? pick(['Kevin', 'Amy', 'Tom']) : pick(['my', 'his', 'her']);
        const right = isName ? word + "'s" : word;
        const o = pick4(right, [isName ? word : word + "'s", word + 's', word + "s'"]);
        return {
          tpl: 'poss',
          q: '要表示「<b>' + (isName ? word + ' 的' : { my: '我的', his: '他的', her: '她的' }[word]) + '</b>」，該怎麼寫？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + right + '</b><br>' +
            (isName
              ? '<b>人名</b>要加 <b>\'s</b> 才表示「誰的」：' + word + "'s。"
              : '<b>my、his、her</b> 本身就是所有格，後面<b>不加 \'s</b>。') + '<br>' +
            '規則：人名加 \'s，所有格代名詞不加。'
        };
      }

      if (type === 'words') {
        const t = pick(THINGS);
        const isTwo = t.e.indexOf(' ') >= 0;
        const o = shuffled([
          { t: isTwo ? '兩個字，中間要空格' : '一個字，中間不空格', ok: true },
          { t: isTwo ? '一個字，中間不空格' : '兩個字，中間要空格' }
        ]);
        return {
          tpl: 'words',
          q: '「' + t.z + '」的英文是<b>一個字</b>還是<b>兩個字</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.e + '</b> 是' + (isTwo ? '<b>兩個字</b>' : '<b>一個字</b>') + '。<br>' +
            '七樣物品裡<b>只有 water bottle 是兩個字</b>。<br>' +
            'smartphone 看起來像兩個字，其實是合起來的一個字。'
        };
      }

      // blend：sp / st / sk
      const g = BLENDS[3];
      const it = pick(g.items);
      const w = pick(it.words);
      const askWhich = Math.random() < 0.5;
      if (askWhich) {
        const o = pick4(it.b, g.items.map(function (x) { return x.b; }).concat(['tr', 'dr', 'pl']));
        return {
          tpl: 'blendWhich',
          q: '單字 <b>' + w + '</b> 是用哪一個<b>子音群</b>開頭的？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
            '同樣 ' + it.b + ' 開頭的字還有：' + it.words.filter(function (x) { return x !== w; }).slice(0, 3).join('、') + '。<br>' +
            's 家族看<b>第二個字母</b>：sp 是 p、st 是 t、sk 是 k。'
        };
      }
      const wrongs = shuffle(ALL_BLENDS.filter(function (x) { return x.b !== it.b; }))
        .slice(0, 4).map(function (x) { return pick(x.words); });
      const o = pick4(w, wrongs);
      return {
        tpl: 'blend',
        q: '下面哪一個字，是用 <b>' + it.b + '</b> 開頭的？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + w + '</b> 的開頭是 <b>' + it.b + '</b>。<br>' +
          '本課三個子音群：<b>sp、st、sk</b>，都是「s ＋ 子音」。<br>' +
          '第三課學過的 <b>skirt</b> 也是 sk 開頭。'
      };
    }
  });

})();
