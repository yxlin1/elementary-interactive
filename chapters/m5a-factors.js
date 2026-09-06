/* ============================================================
   教具 m5a-u2 因數與公因數　m5a-u3 倍數與公倍數
   南一 115：兩個一起掛在五上 第 2 單元「因數和倍數」
   課綱 N-5-3「公因數和公倍數：因數、倍數、公因數、公倍數、
                最大公因數、最小公倍數的意義。」
        備註：以概念認識為主，<b>不用短除法</b>。
   ------------------------------------------------------------
   所以這兩章的教具刻意不出現短除法：
     因數 → 用「能不能排成長方形」來看
     倍數 → 用「數線上跳格子」來看
   ============================================================ */

(function () {

  /* ---------- 共用：小工具 ---------- */
  function factorsOf(n) {
    const f = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
    return f;
  }
  function commonFactors(a, b) { return factorsOf(a).filter(x => b % x === 0); }
  function lcm(a, b) { return a * b / Kit.gcd(a, b); }

  /* ============================================================
     第 2 單元　因數與公因數
     ============================================================ */
  Kit.register('m5a-u2', {

    intro: '「因數」就是能把這些方塊<b>剛好排成長方形</b>的邊長。下面把所有排法都畫出來，排得成的就是因數，排不成就不是。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 330);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'one', N = 12, A = 12, B = 18;

      function drawRect(ctx, x, y, cols, rows, cell, color) {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          ctx.fillStyle = color;
          ctx.fillRect(x + c * cell, y + r * cell, cell - 1.5, cell - 1.5);
        }
      }

      function paintOne() {
        const ctx = cv.ctx;
        const fs = factorsOf(N);
        // 只畫「寬 ≥ 高」的排法，避免同一組重複兩次
        const pairs = fs.filter(f => f * f <= N).map(f => [N / f, f]);
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(N + ' 個方塊，總共有 ' + pairs.length + ' 種排成長方形的方法：', 16, 22);

        let x = 20, y = 40, rowH = 0;
        pairs.forEach(([w, h]) => {
          const cell = Math.max(5, Math.min(16, 150 / w, 90 / h));
          const bw = w * cell, bh = h * cell;
          if (x + bw > cv.W - 20) { x = 20; y += rowH + 34; rowH = 0; }
          drawRect(ctx, x, y, w, h, cell, '#4da3ff');
          ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(w + ' × ' + h, x, y + bh + 4);
          rowH = Math.max(rowH, bh);
          x += bw + 26;
        });

        readout.innerHTML =
          '<div class="big">' + N + ' 的因數：<b>' + fs.join('、') + '</b>　（共 ' + fs.length + ' 個）</div>' +
          '每一種長方形排法，就對應一組因數：' +
          pairs.map(p => p[0] + '×' + p[1]).join('、') + ' = ' + N + '。<br>' +
          '因數一定是<b>成雙成對</b>出現的（除非它是正方形排法，像 ' +
          (Number.isInteger(Math.sqrt(N)) ? Math.sqrt(N) + '×' + Math.sqrt(N) : '4×4 那種') + '）。<br>' +
          (fs.length === 2
            ? '<span style="color:var(--ok)">只有 1 和自己兩個因數 → ' + N + ' 是<b>質數</b>，只排得出一長條。</span>'
            : '<span style="color:var(--muted)">1 和 ' + N + ' 本身永遠是因數，所以每個數至少有一種「一長條」的排法。</span>');
      }

      function paintTwo() {
        const ctx = cv.ctx;
        const fa = factorsOf(A), fb = factorsOf(B), cf = commonFactors(A, B);
        const g = Kit.gcd(A, B);
        const all = Array.from(new Set(fa.concat(fb))).sort((p, q) => p - q);

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('把兩個數的因數都列出來，重疊的地方就是公因數（空格 ＝ 不是它的因數）', 16, 22);

        // 兩列因數，重疊者上色
        [[A, fa, 70, '#4da3ff'], [B, fb, 150, '#34d399']].forEach(([n, fs, y, col]) => {
          ctx.fillStyle = col; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(n + ' 的因數', 92, y + 16);
          all.forEach((v, i) => {
            const x = 108 + i * 34;
            if (x > cv.W - 30) return;
            const isF = fs.indexOf(v) >= 0, isC = cf.indexOf(v) >= 0;
            /* 不是因數的格子<b>不寫數字</b>。
               這一列要讀成「31 的因數只有 1 和 31」，但只要把 2、3、6…
               也寫上去（就算是灰的），看起來就像那一列有七個因數，
               正好把要教的事情蓋掉。
               格子本身要留著——兩列的欄位得對齊，才看得出哪幾欄重疊；
               而候選欄位是兩數因數的<b>聯集</b>，所以每一欄至少有一列
               是亮的，欄位代表哪個數字永遠查得到。
               留一條短橫線而不是全空，是為了讓它讀起來像「檢查過，不是」，
               而不是「這裡壞掉沒畫出來」。 */
            ctx.fillStyle = isC ? '#fbbf24' : isF ? col : '#141d2f';
            ctx.fillRect(x, y, 30, 32);
            if (isF) {
              ctx.fillStyle = '#0b1220';
              ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(v, x + 15, y + 17);
            } else {
              ctx.fillStyle = '#2b3a5a';
              ctx.fillRect(x + 10, y + 15, 10, 2);
            }
          });
        });

        /* 公因數列：一定要沿用上面兩列的<b>同一組欄位座標</b>（108 + i*34，寬 30）。
           原本這一列自己重新排（間距 46、寬 40），等於把公因數再列一次，
           跟上面對不起來——可是這張圖要講的就是「這一欄兩列都亮，它才掉下來」，
           欄位不對齊，這件事就看不出來了。 */
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText('公因數', 92, 246);
        let gx = null;                       // 最大公因數那一格的中心，箭頭要指它
        all.forEach((v, i) => {
          const x = 108 + i * 34;
          if (x > cv.W - 30) return;
          if (cf.indexOf(v) < 0) return;     // 不是公因數就整格留白，對齊上面沒同時亮的欄
          ctx.fillStyle = v === g ? '#fb7185' : '#fbbf24';
          ctx.fillRect(x, 230, 30, 32);
          ctx.fillStyle = '#0b1220'; ctx.textAlign = 'center';
          ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
          ctx.fillText(v, x + 15, 247);
          if (v === g) gx = x + 15;
        });
        /* 箭頭要真的落在紅色那一格下面。原本固定寫在最左邊（x=108），
           只有在最大公因數剛好是第一格（互質，g=1）時才碰巧對。 */
        if (gx !== null) {
          ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          const label = '↑ 最大公因數';
          const half = ctx.measureText(label).width / 2;
          // 紅格靠邊時把字夾回畫布內，箭頭仍然指在正確的欄位上
          ctx.fillText(label, Math.max(half + 6, Math.min(cv.W - half - 6, gx)), 268);
        }

        readout.innerHTML =
          '<div class="big">' + A + ' 和 ' + B + ' 的最大公因數是 <b>' + g + '</b></div>' +
          A + ' 的因數：' + fa.join('、') + '<br>' +
          B + ' 的因數：' + fb.join('、') + '<br>' +
          '兩邊都有的（<b>公因數</b>）：<b>' + cf.join('、') + '</b>，其中最大的是 <b>' + g + '</b>。<br>' +
          '<span style="color:var(--muted)">意思是：' + A + ' 個和 ' + B + ' 個東西，最多可以平分成 <b>' + g + '</b> 份，' +
          '每份分別是 ' + (A / g) + ' 個和 ' + (B / g) + ' 個，剛好分完不剩。' +
          (g === 1 ? '（公因數只有 1，這兩個數<b>互質</b>。）' : '') + '</span>';
      }

      function paint() {
        cv.clear('#0e1726');
        if (mode === 'one') paintOne(); else paintTwo();
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '一個數的因數', value: 'one' },
        { label: '兩個數的公因數', value: 'two' }
      ], function (v) {
        mode = v;
        nCtl.wrap.style.display = v === 'one' ? '' : 'none';
        aCtl.wrap.style.display = bCtl.wrap.style.display = v === 'two' ? '' : 'none';
        paint();
      }, mode);

      const nCtl = Kit.slider('數字', { min: 2, max: 48, value: N, onChange: v => { N = v; paint(); } });
      const aCtl = Kit.slider('第一個數', { min: 2, max: 48, value: A, onChange: v => { A = v; paint(); } });
      const bCtl = Kit.slider('第二個數', { min: 2, max: 48, value: B, onChange: v => { B = v; paint(); } });
      aCtl.wrap.style.display = bCtl.wrap.style.display = 'none';

      controls.appendChild(modeSeg.wrap);
      controls.appendChild(nCtl.wrap);
      controls.appendChild(aCtl.wrap);
      controls.appendChild(bCtl.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '⚠️ 課綱在這一單元<b>明確要求不使用短除法</b>（N-5-3 備註）。短除法要到六年級才教。' +
          '這裡用「排長方形」和「列出來找重疊」是刻意的——目的是讓孩子懂<b>因數是什麼意思</b>，不是先學會一套算法。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「12 個方塊，你能排出幾種長方形？」', why: '讓孩子動手（或看畫面）數出 1×12、2×6、3×4 三種。因數不是背出來的清單，是「排得成的邊長」。' },
      { ask: '「為什麼因數都是一對一對出現的？」', why: '因為長方形有長和寬。3×4 一出現，3 和 4 就同時是因數。只有正方形（如 4×4=16）那一組會自己配自己。' },
      { ask: '把數字調到 7、11、13，問「怎麼只有一種排法？」', why: '這就是<b>質數</b>：只排得出一長條。不用先講定義，讓孩子自己發現後再命名。' },
      { ask: '公因數模式：「12 顆糖和 18 顆餅乾，最多能分給幾個人剛好分完？」', why: '答案是 6（最大公因數）。公因數不是抽象概念，就是「同時能整除兩邊的份數」。' },
      { ask: '「為什麼 1 一定是公因數？」', why: '因為 1 能整除任何數。所以任兩個數至少有一個公因數 1；如果只有 1，就叫互質。' }
    ],

    pitfalls: [
      { bad: '把「因數」和「倍數」講反：說「12 是 3 的因數」。', fix: '小的是因數、大的是倍數。3 是 12 的<b>因數</b>，12 是 3 的<b>倍數</b>。可以說「因數比較小、倍數比較大」。' },
      { bad: '找因數時漏掉 1 和自己。', fix: '每個數都排得出「1 × 自己」這種一長條，所以 1 和自己一定是因數。用畫面確認每次都有那一長條。' },
      { bad: '找因數只找一半就停（找到 3×4 就不找了）。', fix: '要一路試到「兩邊快一樣長」為止。試到 √N 附近就可以停，因為再下去只是把同一組反過來。' },
      { bad: '這一單元就急著教短除法。', fix: '課綱<b>明確規定不用短除法</b>，那是六年級（N-6-1、N-6-2）的內容。這裡要先建立「因數／公因數是什麼」的概念。', src: 'N-5-3 備註「以概念認識為主，不用短除法」' }
    ],

    quiz: function () {
      // 題型依均一「五上第二單元 因數和倍數」2-1～2-3：整除／成對的因數／利用乘法找因數／
      // 公因數／最大公因數應用題。課綱 N-5-3 備註不用短除法，所以全部「列出來找」。
      const type = Kit.pick(['list', 'gcd', 'word', 'concept', 'pairFill', 'isFactor', 'commonCount', 'rectWord', 'onlyTwo']);
      function shuffled(items) { const sh = Kit.shuffle(items); return { choices: sh.map(o => o.t), answer: sh.findIndex(o => o.ok) }; }

      if (type === 'pairFill') {
        const n = Kit.pick([18, 24, 28, 30, 32, 36, 40, 42, 45, 48, 54, 56]);
        const fs = factorsOf(n).filter(f => f !== 1 && f !== n);
        const f = Kit.pick(fs);
        return {
          q: '<b>' + n + ' ＝ ' + f + ' × □</b>，□ 是多少？（' + f + ' 和 □ 是 ' + n + ' 的一對因數）',
          input: 'number', answer: n / f,
          steps: '因數是<b>成對</b>出現的：' + f + ' 能整除 ' + n + '，' + n + ' ÷ ' + f + ' ＝ <b>' + (n / f) + '</b>，' + (n / f) + ' 也是 ' + n + ' 的因數。<br>' +
            '排成長方形來想：' + f + ' 排 × ' + (n / f) + ' 個 ＝ ' + n + '。<br>' +
            n + ' 的所有因數：' + factorsOf(n).join('、')
        };
      }

      if (type === 'isFactor') {
        const f = Kit.randInt(2, 12);
        const yes = Math.random() < .5;
        const n = yes ? f * Kit.randInt(3, 9) : f * Kit.randInt(3, 9) + Kit.randInt(1, f - 1);
        return {
          q: '<b>' + f + '</b> 是 <b>' + n + '</b> 的因數嗎？',
          choices: ['是', '不是'], answer: n % f === 0 ? 0 : 1,
          steps: n + ' ÷ ' + f + ' ＝ ' + Math.floor(n / f) + (n % f ? ' 餘 ' + (n % f) : '') + '<br>' +
            (n % f === 0
              ? '<b>整除</b>（沒有餘數）→ ' + f + ' <b>是</b> ' + n + ' 的因數。也可以說 ' + n + ' 是 ' + f + ' 的倍數。'
              : '有餘數 → ' + f + ' <b>不是</b> ' + n + ' 的因數。' + n + ' 個方塊排成每排 ' + f + ' 個，最後一排會不滿。')
        };
      }

      if (type === 'commonCount') {
        const a = Kit.pick([12, 16, 18, 20, 24, 30, 36]), b = Kit.pick([8, 12, 18, 24, 27, 40, 45]);
        const cf = commonFactors(a, b);
        return {
          q: '<b>' + a + '</b> 和 <b>' + b + '</b> 的公因數總共有幾個？',
          input: 'number', answer: cf.length, unit: '個',
          steps: a + ' 的因數：' + factorsOf(a).join('、') + '<br>' + b + ' 的因數：' + factorsOf(b).join('、') + '<br>' +
            '兩邊都出現的：<b>' + cf.join('、') + '</b>，共 <b>' + cf.length + '</b> 個。<br>' +
            '<span style="color:var(--muted)">小訣竅：公因數一定都是最大公因數 ' + Kit.gcd(a, b) + ' 的因數。</span>'
        };
      }

      if (type === 'rectWord') {
        const n = Kit.pick([12, 16, 18, 20, 24, 30, 36, 48]);
        const fs = factorsOf(n);
        const pairs = fs.filter(f => f * f <= n).map(f => f + '×' + (n / f));
        return {
          q: '用 <b>' + n + '</b> 個一樣的小正方形磁磚拼成一個長方形（正方形也算），全部用完不剩，有幾種不同的拼法？（' + '3×4 和 4×3 算同一種）',
          input: 'number', answer: pairs.length, unit: '種',
          steps: '每一種拼法的長和寬就是 ' + n + ' 的一對因數：<b>' + pairs.join('、') + '</b>，共 <b>' + pairs.length + '</b> 種。<br>' +
            n + ' 的因數有 ' + fs.length + ' 個，兩兩配對' + (Math.sqrt(n) % 1 === 0 ? '（' + Math.sqrt(n) + '×' + Math.sqrt(n) + ' 自己配自己）' : '') + '。'
        };
      }

      if (type === 'onlyTwo') {
        const primes = [7, 11, 13, 17, 19, 23, 29, 31];
        const comps = [9, 15, 21, 25, 27, 33, 35, 39, 49];
        const pr = Kit.pick(primes), cs = Kit.shuffle(comps).slice(0, 3);
        const o = shuffled([{ t: String(pr), ok: true }].concat(cs.map(c => ({ t: String(c) }))));
        return {
          q: '下面哪一個數的因數<b>只有 1 和它自己</b>（只排得出「一長條」）？',
          choices: o.choices, answer: o.answer,
          steps: cs.map(c => c + ' ＝ ' + factorsOf(c).filter(f => f !== 1 && f !== c)[0] + ' × ' + (c / factorsOf(c).filter(f => f !== 1 && f !== c)[0]) + '，還有別的排法').join('；') + '。<br>' +
            pr + ' 只能排成 1 × ' + pr + '，因數只有 <b>1 和 ' + pr + '</b> 兩個。<br>' +
            '<span style="color:var(--muted)">這種數以後會學到叫「質數」，現在先會判斷就好。</span>'
        };
      }


      if (type === 'list') {
        const n = Kit.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 45]);
        return {
          q: '<b>' + n + '</b> 總共有幾個因數？',
          input: 'number', answer: factorsOf(n).length, unit: '個',
          steps: n + ' 的因數：<b>' + factorsOf(n).join('、') + '</b>，共 ' + factorsOf(n).length + ' 個。<br>' +
            '找法：從 1 開始一個一個試，看能不能排成長方形（整除）。' +
            '找到一組就同時得到兩個因數，試到兩邊差不多長就可以停。'
        };
      }

      if (type === 'gcd') {
        const a = Kit.pick([12, 16, 18, 24, 30, 36]), b = Kit.pick([8, 20, 27, 32, 42, 48]);
        return {
          q: '<b>' + a + '</b> 和 <b>' + b + '</b> 的最大公因數是多少？',
          input: 'number', answer: Kit.gcd(a, b),
          steps: a + ' 的因數：' + factorsOf(a).join('、') + '<br>' +
            b + ' 的因數：' + factorsOf(b).join('、') + '<br>' +
            '兩邊都有的：<b>' + commonFactors(a, b).join('、') + '</b>，最大的是 <b>' + Kit.gcd(a, b) + '</b>。'
        };
      }

      if (type === 'word') {
        const g = Kit.pick([4, 5, 6, 8]);
        // p、q 必須互質，g 才真的是最大公因數（不能用遞迴重抽，quiz 是被無 this 呼叫的）
        let p, q;
        do { p = Kit.randInt(2, 7); q = Kit.randInt(2, 7); } while (p === q || Kit.gcd(p, q) !== 1);
        const a = g * p, b = g * q;
        return {
          q: '有 <b>' + a + '</b> 顆糖和 <b>' + b + '</b> 塊餅乾，要平分給小朋友，' +
            '每人拿到的糖一樣多、餅乾也一樣多，而且剛好分完。<b>最多</b>可以分給幾個人？',
          input: 'number', answer: g, unit: '人',
          steps: '人數必須同時整除 ' + a + ' 和 ' + b + '，也就是它們的<b>公因數</b>。<br>' +
            '公因數：' + commonFactors(a, b).join('、') + '，最多就是<b>最大公因數 ' + g + '</b>。<br>' +
            '這時每人拿到 ' + p + ' 顆糖、' + q + ' 塊餅乾。'
        };
      }

      const opts = Kit.shuffle([
        { t: '1', ok: true }, { t: '0', ok: false },
        { t: '那兩個數自己', ok: false }, { t: '不一定有', ok: false }
      ]);
      return {
        q: '任何兩個數，一定都有的公因數是哪一個？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '<b>1</b> 可以整除任何數，所以 1 永遠是公因數。<br>' +
          '如果兩個數的公因數<b>只有 1</b>，就說它們<b>互質</b>（例如 8 和 9）。<br>' +
          '（0 不能當因數，因為不能除以 0。）'
      };
    }
  });


  /* ============================================================
     第 3 單元　倍數與公倍數
     ============================================================ */
  Kit.register('m5a-u3', {

    intro: '「倍數」就是在數線上<b>一格一格跳</b>會踩到的數。兩個數一起跳，同時踩到的地方就是公倍數，第一個同時踩到的就是最小公倍數。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let A = 4, B = 6, MAX = 40;
      const PAD = 40, LW = 540;

      function xOf(v) { return PAD + LW * v / MAX; }

      function drawLine(y, step, color, label, hits) {
        const ctx = cv.ctx;
        ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + LW, y); ctx.stroke();
        // 跳躍弧線
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        for (let v = 0; v + step <= MAX; v += step) {
          const x1 = xOf(v), x2 = xOf(v + step);
          ctx.beginPath();
          ctx.arc((x1 + x2) / 2, y, (x2 - x1) / 2, Math.PI, 0);
          ctx.stroke();
        }
        // 落點
        for (let v = step; v <= MAX; v += step) {
          const x = xOf(v);
          const isCommon = hits && hits.indexOf(v) >= 0;
          ctx.fillStyle = isCommon ? '#fbbf24' : color;
          ctx.beginPath(); ctx.arc(x, y, isCommon ? 7 : 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#93a3c4'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(v, x, y + 10);
        }
        ctx.fillStyle = color; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(label, PAD - 8, y);
      }

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const L = lcm(A, B);
        const commons = [];
        for (let v = L; v <= MAX; v += L) commons.push(v);

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('兩隻青蛙從 0 出發，一隻每次跳 ' + A + '，一隻每次跳 ' + B + '。黃點＝兩隻都踩到的地方', 16, 22);

        drawLine(80, A, '#4da3ff', A + ' 的倍數', commons);
        drawLine(180, B, '#34d399', B + ' 的倍數', commons);

        // 公倍數標線
        commons.forEach((v, i) => {
          const x = xOf(v);
          ctx.save();
          ctx.setLineDash([4, 4]); ctx.strokeStyle = i === 0 ? '#fb7185' : '#fbbf24'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 250); ctx.stroke();
          ctx.restore();
          ctx.fillStyle = i === 0 ? '#fb7185' : '#fbbf24';
          ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(i === 0 ? v + '（最小）' : String(v), x, 254);
        });

        readout.innerHTML =
          '<div class="big">' + A + ' 和 ' + B + ' 的最小公倍數是 <b>' + L + '</b></div>' +
          A + ' 的倍數：' + Array.from({ length: Math.floor(MAX / A) }, (_, i) => (i + 1) * A).join('、') + ' …<br>' +
          B + ' 的倍數：' + Array.from({ length: Math.floor(MAX / B) }, (_, i) => (i + 1) * B).join('、') + ' …<br>' +
          '兩邊都有的（<b>公倍數</b>）：' + (commons.length ? commons.join('、') + ' …' : '（超出畫面範圍）') +
          '　最小的是 <b>' + L + '</b>。<br>' +
          '<span style="color:var(--muted)">公倍數有<b>無限多個</b>（' + L + '、' + 2 * L + '、' + 3 * L + '…），' +
          '所以只問「最小」公倍數，不會問「最大」公倍數。' +
          (Kit.gcd(A, B) === 1
            ? '　這兩個數互質，最小公倍數剛好等於兩數相乘 ' + A + '×' + B + '＝' + L + '。'
            : '　注意：' + A + '×' + B + '＝' + (A * B) + ' 也是公倍數，但<b>不是最小的</b>。') + '</span>';
      }

      const aCtl = Kit.slider('第一個數', { min: 2, max: 12, value: A, onChange: v => { A = v; paint(); } });
      const bCtl = Kit.slider('第二個數', { min: 2, max: 12, value: B, onChange: v => { B = v; paint(); } });
      const mCtl = Kit.slider('數線長度', { min: 24, max: 80, step: 4, value: MAX, onChange: v => { MAX = v; paint(); } });

      controls.appendChild(aCtl.wrap);
      controls.appendChild(bCtl.wrap);
      controls.appendChild(mCtl.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '生活情境：兩班學生分別 ' + '每 4 天、每 6 天' + ' 打掃一次，今天同時打掃，下次同時打掃是第幾天？答案就是最小公倍數。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「兩隻青蛙什麼時候會第一次踩在同一格？」', why: '這就是最小公倍數。用「同時踩到」比用「共同的倍數」好懂太多，而且直接對應到日常的「多久碰一次面」。' },
      { ask: '「4 和 6 相乘是 24，24 是公倍數嗎？那 12 呢？」', why: '兩個都是公倍數，但 12 比較小。這一題可以破除「最小公倍數＝兩數相乘」的錯誤直覺。' },
      { ask: '把兩個數調成 5 和 7（互質），問「這次最小公倍數是多少？」', why: '35，剛好等於相乘。讓孩子發現「只有互質時才等於相乘」，比直接告訴他規則有用。' },
      { ask: '「公倍數有幾個？最大的是多少？」', why: '無限多個，沒有最大的。所以只問最小公倍數。反過來，公因數有限個，所以問最大公因數。這組對照很值得講。' },
      { ask: '生活題：「公車 A 每 12 分鐘一班、公車 B 每 18 分鐘一班，剛剛同時發車，下次同時是幾分鐘後？」', why: '36 分鐘。把數字設成 12 和 18 讓他在畫面上驗證。' }
    ],

    pitfalls: [
      { bad: '以為「最小公倍數 = 兩數相乘」。', fix: '只有兩數<b>互質</b>時才成立。4 和 6 相乘是 24，但最小公倍數是 12。' },
      { bad: '問「最大公倍數是多少？」', fix: '沒有最大公倍數，因為公倍數有無限多個。有最大的是<b>公因數</b>，有最小的是<b>公倍數</b>——剛好相反，容易記混。' },
      { bad: '列倍數時從 0 開始，說 0 是最小公倍數。', fix: '0 是任何數的倍數，但談「最小公倍數」時<b>不算 0</b>，要從第一個正的開始。' },
      { bad: '把倍數和因數搞混。', fix: '倍數是「越跳越大」（4、8、12…），因數是「排長方形的邊長」（比原數小或相等）。' }
    ],

    quiz: function () {
      // 題型依均一「五上第二單元」2-4～2-6：倍數／公倍數與最小公倍數／2、5、10 的倍數判別
      const type = Kit.pick(['lcm', 'word', 'concept', 'ismultiple', 'nth', 'countRange', 'feature', 'boxWord', 'commonInRange']);
      function shuffled(items) { const sh = Kit.shuffle(items); return { choices: sh.map(o => o.t), answer: sh.findIndex(o => o.ok) }; }

      if (type === 'nth') {
        const b = Kit.randInt(3, 12), k = Kit.randInt(3, 9);
        return {
          q: '<b>' + b + '</b> 的倍數由小到大排，第 <b>' + k + '</b> 個是多少？',
          input: 'number', answer: b * k,
          steps: b + ' 的倍數：' + Array.from({ length: k }, (_, i) => (i + 1) * b).join('、') + '<br>' +
            '第 ' + k + ' 個就是 ' + b + ' × ' + k + ' ＝ <b>' + b * k + '</b>。<br>' +
            '<span style="color:var(--muted)">第 1 個倍數是它自己（' + b + ' × 1），不是 0。</span>'
        };
      }

      if (type === 'countRange') {
        const b = Kit.randInt(3, 9), N = Kit.pick([30, 40, 50, 60, 80, 100]);
        const cnt = Math.floor(N / b);
        return {
          q: '1 到 <b>' + N + '</b> 之間，<b>' + b + '</b> 的倍數有幾個？',
          input: 'number', answer: cnt, unit: '個',
          steps: N + ' ÷ ' + b + ' ＝ ' + cnt + (N % b ? ' 餘 ' + (N % b) : '') + '，所以有 <b>' + cnt + '</b> 個：' +
            Array.from({ length: Math.min(cnt, 6) }, (_, i) => (i + 1) * b).join('、') + (cnt > 6 ? '…' + cnt * b : '') + '<br>' +
            '<span style="color:var(--muted)">餘數不算——最後那 ' + (N % b) + ' 個數不夠再湊一個 ' + b + '。</span>'
        };
      }

      if (type === 'feature') {
        const target = Kit.pick([2, 5, 10]);
        const isM = n => n % target === 0;
        const nums = [];
        const pool = Kit.shuffle(Array.from({ length: 80 }, (_, i) => i + 20));
        const good = pool.find(isM), bads = pool.filter(n => !isM(n)).slice(0, 3);
        nums.push(good, ...bads);
        const o = shuffled([{ t: String(good), ok: true }].concat(bads.map(n => ({ t: String(n) }))));
        const rule = target === 2 ? '個位是 0、2、4、6、8' : target === 5 ? '個位是 0 或 5' : '個位是 0';
        return {
          q: '下面哪一個數是 <b>' + target + '</b> 的倍數？（不用一個一個除，看<b>個位數字</b>就知道）',
          choices: o.choices, answer: o.answer,
          steps: target + ' 的倍數特徵：<b>' + rule + '</b>。<br>' +
            good + ' 的個位是 ' + (good % 10) + ' → 是 ' + target + ' 的倍數（' + good + ' ÷ ' + target + ' ＝ ' + good / target + '）。<br>' +
            bads.map(n => n + ' 的個位是 ' + (n % 10)).join('，') + ' → 都不是。'
        };
      }

      if (type === 'boxWord') {
        const a = Kit.pick([4, 6, 8, 9]), b = Kit.pick([6, 10, 12, 15]);
        const L = lcm(a, b);
        return {
          q: '一袋糖果，每 <b>' + a + '</b> 顆一包剛好分完，每 <b>' + b + '</b> 顆一包也剛好分完。這袋糖<b>至少</b>有幾顆？',
          input: 'number', answer: L, unit: '顆',
          steps: '顆數要同時是 ' + a + ' 的倍數和 ' + b + ' 的倍數 → <b>公倍數</b>。<br>' +
            a + ' 的倍數：' + [1, 2, 3, 4, 5].map(i => i * a).join('、') + '…<br>' + b + ' 的倍數：' + [1, 2, 3, 4].map(i => i * b).join('、') + '…<br>' +
            '第一個共同的是 <b>' + L + '</b>（最小公倍數）。「至少」就是要最小的。'
        };
      }

      if (type === 'commonInRange') {
        const a2 = Kit.pick([2, 3, 4, 6]), b2 = Kit.pick([3, 4, 5, 6, 8]);
        const L2 = lcm(a2, b2), N2 = Kit.pick([50, 60, 100]);
        const cnt2 = Math.floor(N2 / L2);
        return {
          q: '1 到 <b>' + N2 + '</b> 之間，<b>' + a2 + '</b> 和 <b>' + b2 + '</b> 的公倍數有幾個？',
          input: 'number', answer: cnt2, unit: '個',
          steps: '先找最小公倍數：' + a2 + ' 和 ' + b2 + ' 的最小公倍數是 <b>' + L2 + '</b>。<br>' +
            '所有公倍數都是 ' + L2 + ' 的倍數：' + Array.from({ length: cnt2 }, (_, i) => (i + 1) * L2).join('、') + '<br>' +
            N2 + ' ÷ ' + L2 + ' ＝ ' + cnt2 + (N2 % L2 ? ' 餘 ' + (N2 % L2) : '') + ' → <b>' + cnt2 + '</b> 個'
        };
      }


      if (type === 'lcm') {
        const a = Kit.randInt(2, 12), b = Kit.randInt(2, 12);
        return {
          q: '<b>' + a + '</b> 和 <b>' + b + '</b> 的最小公倍數是多少？',
          input: 'number', answer: lcm(a, b),
          steps: a + ' 的倍數：' + [1, 2, 3, 4, 5, 6].map(i => i * a).join('、') + '…<br>' +
            b + ' 的倍數：' + [1, 2, 3, 4, 5, 6].map(i => i * b).join('、') + '…<br>' +
            '第一個同時出現的是 <b>' + lcm(a, b) + '</b>。<br>' +
            (Kit.gcd(a, b) === 1
              ? '（這兩個數互質，所以剛好等於 ' + a + '×' + b + '＝' + a * b + '。）'
              : '（注意 ' + a + '×' + b + '＝' + a * b + ' 也是公倍數，但<b>不是最小的</b>。）')
        };
      }

      if (type === 'word') {
        const a = Kit.pick([4, 6, 8, 9, 12]), b = Kit.pick([6, 10, 14, 15, 18]);
        return {
          q: '兩路公車同時從站牌發車。A 路每 <b>' + a + '</b> 分鐘一班，B 路每 <b>' + b + '</b> 分鐘一班。' +
            '下一次兩路<b>同時</b>發車是幾分鐘後？',
          input: 'number', answer: lcm(a, b), unit: '分鐘',
          steps: 'A 路發車時刻：' + [1, 2, 3, 4].map(i => i * a).join('、') + '…分<br>' +
            'B 路發車時刻：' + [1, 2, 3, 4].map(i => i * b).join('、') + '…分<br>' +
            '第一個同時出現的時刻＝<b>最小公倍數 ' + lcm(a, b) + '</b> 分鐘後。'
        };
      }

      if (type === 'ismultiple') {
        const b = Kit.pick([3, 4, 6, 9]);
        const yes = Math.random() < .5;
        const n = yes ? b * Kit.randInt(3, 12) : b * Kit.randInt(3, 12) + Kit.randInt(1, b - 1);
        const opts = ['是 ' + b + ' 的倍數', '不是 ' + b + ' 的倍數'];
        return {
          q: '<b>' + n + '</b> 是 <b>' + b + '</b> 的倍數嗎？',
          choices: opts, answer: n % b === 0 ? 0 : 1,
          steps: n + ' ÷ ' + b + ' = ' + Math.floor(n / b) + (n % b ? ' 餘 ' + (n % b) : '') + '<br>' +
            (n % b === 0
              ? '整除，沒有餘數 → <b>是</b> ' + b + ' 的倍數。'
              : '有餘數 ' + (n % b) + ' → <b>不是</b> ' + b + ' 的倍數。') +
            '<br>判斷倍數就是看「除得盡嗎」。'
        };
      }

      const opts = Kit.shuffle([
        { t: '公倍數有無限多個，所以沒有最大的', ok: true },
        { t: '兩數相乘就是最大公倍數', ok: false },
        { t: '最大公倍數就是比較大的那個數', ok: false },
        { t: '最大公倍數等於最小公倍數的兩倍', ok: false }
      ]);
      return {
        q: '為什麼課本只問「最<b>小</b>公倍數」，不問「最大公倍數」？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '公倍數可以一直往上找：最小公倍數的 1 倍、2 倍、3 倍… 全都是公倍數，<b>永遠找不到最大的</b>。<br>' +
          '反過來，公因數不可能比原來的數大，個數有限，所以有<b>最大</b>公因數。<br>' +
          '一句話記住：<b>因數問最大，倍數問最小</b>。'
      };
    }
  });

})();
