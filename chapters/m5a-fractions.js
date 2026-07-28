/* ============================================================
   教具 m5a-u4 擴分、約分和通分　m5a-u6 異分母分數的加減
   南一 115：五上 第 4 單元／第 6 單元（單元名稱相同）
   課綱 N-5-4「異分母分數：用約分、擴分處理等值分數並做比較。
                用通分做異分母分數的加減。養成利用約分化簡分數計算習慣。」
   ------------------------------------------------------------
   課綱對數字範圍有明確限制（備註）：
     通分不鼓勵以分母直接相乘；分母限（1）均為一位數
     （2）一分母為另一分母的倍數且兩數小於 100
     （3）乘以 2、3、4、5 就能找到公倍數（如 12 與 18）
   所以滑桿只開放 2~12，並在畫面上優先示範「找最小公倍數」而非「兩分母相乘」。
   ============================================================ */

(function () {

  /* 共用：畫一條分數條 */
  function bar(ctx, x, y, w, h, num, den, color, sub) {
    sub = sub || 1;
    const n = den * sub, filled = num * sub;
    ctx.fillStyle = '#16203a';
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < Math.min(filled, n); i++) {
      ctx.fillStyle = color;
      ctx.fillRect(x + i * w / n, y, w / n, h);
    }
    ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
    for (let i = 1; i < n; i++) {
      const px = x + i * w / n;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
    }
    if (sub > 1) {   // 原本的分母界線用白粗線標出來
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
      for (let i = 1; i < den; i++) {
        const px = x + i * w / den;
        ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  function tag(ctx, x, y, text, color, align) {
    ctx.fillStyle = color;
    ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = align || 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function lcm(a, b) { return a * b / Kit.gcd(a, b); }

  /* ============================================================
     第 4 單元　擴分、約分和通分
     ============================================================ */
  Kit.register('m5a-u4', {

    intro: '<b>擴分</b>＝每一格再切細，<b>約分</b>＝把小格合併成大格，<b>通分</b>＝把兩個分數切成一樣細。三件事其實是同一件事：塗色的量都沒變。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let a = 2, b = 3, c = 3, d = 4;
      let mode = 'common';        // expand | reduce | common
      let k = 1;                  // 擴分倍數 / 通分進度

      const X = 90, W = 470;

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

        if (mode === 'expand') {
          ctx.fillText('擴分：把每一格再切成 ' + k + ' 小格。格子變多，但塗色的長度完全沒變。', 16, 22);
          bar(ctx, X, 60, W, 60, a, b, '#4da3ff', 1);
          tag(ctx, X - 12, 90, a + '/' + b, '#4da3ff');
          bar(ctx, X, 160, W, 60, a, b, '#7c5cff', k);
          tag(ctx, X - 12, 190, (a * k) + '/' + (b * k), '#7c5cff');
          readout.innerHTML =
            '<div class="big">' + a + '/' + b + ' ＝ ' + (a * k) + '/' + (b * k) + '</div>' +
            '分子分母<b>同時乘以 ' + k + '</b>：' + a + '×' + k + '＝' + (a * k) + '，' + b + '×' + k + '＝' + (b * k) + '。<br>' +
            '兩條的塗色長度一模一樣 → 它們是<b>等值分數</b>。<br>' +
            '<span style="color:var(--muted)">擴分的用途：把分母變成我們想要的數，之後才能和別的分數比較或相加。</span>';

        } else if (mode === 'reduce') {
          const g = Kit.gcd(a, b);
          ctx.fillText('約分：把小格合併成大格。分子分母同時除以公因數。', 16, 22);
          bar(ctx, X, 60, W, 60, a, b, '#4da3ff', 1);
          tag(ctx, X - 12, 90, a + '/' + b, '#4da3ff');
          bar(ctx, X, 160, W, 60, a / g, b / g, '#34d399', 1);
          tag(ctx, X - 12, 190, (a / g) + '/' + (b / g), '#34d399');
          readout.innerHTML =
            '<div class="big">' + a + '/' + b + ' ＝ ' + (a / g) + '/' + (b / g) +
            (g === 1 ? '　<span style="color:var(--muted)">（已經是最簡分數了）</span>' : '') + '</div>' +
            (g > 1
              ? a + ' 和 ' + b + ' 的最大公因數是 <b>' + g + '</b>，分子分母同除以 ' + g + '：' +
                a + '÷' + g + '＝' + (a / g) + '，' + b + '÷' + g + '＝' + (b / g) + '。<br>' +
                '畫面上就是把每 <b>' + g + '</b> 小格併成一大格。'
              : a + ' 和 ' + b + ' 的公因數只有 1，沒得約，這已經是<b>最簡分數</b>。') +
            '<br><span style="color:var(--muted)">約分只是換個說法，大小完全沒變。算完題目養成先約分的習慣，數字會小很多。</span>';

        } else {
          const L = lcm(b, d), k1 = L / b, k2 = L / d;
          const prod = b * d;
          ctx.fillText('通分：把兩個分數切成一樣細（同一個分母），才能比較和加減。', 16, 22);
          bar(ctx, X, 52, W, 46, a, b, '#4da3ff', k > .5 ? k1 : 1);
          tag(ctx, X - 12, 75, k > .5 ? (a * k1) + '/' + L : a + '/' + b, '#4da3ff');
          bar(ctx, X, 118, W, 46, c, d, '#34d399', k > .5 ? k2 : 1);
          tag(ctx, X - 12, 141, k > .5 ? (c * k2) + '/' + L : c + '/' + d, '#34d399');

          // 公分母刻度尺
          ctx.fillStyle = '#fbbf24'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('公分母 ' + L + ' 的刻度', X, 186);
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
          for (let i = 0; i <= L; i++) {
            const px = X + i * W / L;
            ctx.beginPath(); ctx.moveTo(px, 204); ctx.lineTo(px, 216); ctx.stroke();
          }

          const v1 = a / b, v2 = c / d;
          readout.innerHTML =
            '<div class="big">通分到分母 <b>' + L + '</b>：' +
            a + '/' + b + ' → <b>' + (a * k1) + '/' + L + '</b>　　' +
            c + '/' + d + ' → <b>' + (c * k2) + '/' + L + '</b></div>' +
            '公分母要用兩個分母的<b>最小公倍數</b>：' + b + ' 和 ' + d + ' 的最小公倍數是 <b>' + L + '</b>。<br>' +
            a + '/' + b + ' 的分子分母同乘 ' + k1 + '；' + c + '/' + d + ' 的分子分母同乘 ' + k2 + '。<br>' +
            '通分後就能直接比大小：' +
            (Math.abs(v1 - v2) < 1e-9
              ? '<b>兩個一樣大</b>。'
              : '<b>' + (v1 > v2 ? a + '/' + b : c + '/' + d) + ' 比較大</b>（' +
                Math.max(a * k1, c * k2) + '/' + L + ' > ' + Math.min(a * k1, c * k2) + '/' + L + '）。') +
            '<br><span style="color:var(--muted)">' +
            (L === prod
              ? '這一組的最小公倍數剛好等於兩分母相乘（' + b + '×' + d + '＝' + prod + '）。'
              : '⚠️ 直接把兩個分母相乘也可以通分（' + b + '×' + d + '＝' + prod + '），但數字會變大很多。' +
                '課綱不鼓勵這樣做，要練習找<b>最小公倍數 ' + L + '</b>。') +
            '</span>';
        }
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '擴分', value: 'expand' },
        { label: '約分', value: 'reduce' },
        { label: '通分（兩個分數）', value: 'common' }
      ], function (v) {
        mode = v;
        cCtl.wrap.style.display = dCtl.wrap.style.display = (v === 'common') ? '' : 'none';
        kCtl.wrap.style.display = (v === 'expand') ? '' : 'none';
        stepBtn.style.display = (v === 'common') ? '' : 'none';
        k = (v === 'expand') ? 2 : 0;
        if (v === 'expand') { kCtl.input.value = 2; kCtl.output.textContent = '×2'; }
        paint();
      }, mode);

      const aCtl = Kit.slider('分子', { min: 1, max: 11, value: a, onChange: v => { a = v; paint(); } });
      const bCtl = Kit.slider('分母', { min: 2, max: 12, value: b, onChange: v => { b = v; paint(); } });
      const cCtl = Kit.slider('第二個分子', { min: 1, max: 11, value: c, onChange: v => { c = v; paint(); } });
      const dCtl = Kit.slider('第二個分母', { min: 2, max: 12, value: d, onChange: v => { d = v; paint(); } });
      const kCtl = Kit.slider('切成幾倍細', { min: 1, max: 6, value: 2, format: v => '×' + v, onChange: v => { k = v; paint(); } });
      kCtl.wrap.style.display = 'none';

      const stepBtn = Kit.button('▶ 開始通分', function () {
        k = k > .5 ? 0 : 1;
        stepBtn.textContent = k > .5 ? '↩ 還原' : '▶ 開始通分';
        paint();
      }, 'primary');

      controls.appendChild(modeSeg.wrap);
      [aCtl, bCtl, cCtl, dCtl, kCtl].forEach(s => controls.appendChild(s.wrap));
      controls.appendChild(stepBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '課綱限制這一階段的通分數字（N-5-4 備註）：分母都是一位數，或一個分母是另一個的倍數，' +
          '或乘以 2、3、4、5 就找得到公倍數（像 12 和 18）。所以滑桿只開到 12。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '擴分模式：「切細之後，藍色的部分變多了嗎？」', why: '沒有。格子變多、每格變小，塗色總長不變。這一句話就是擴分的全部道理。' },
      { ask: '約分模式，把分數設成 8/12：「幾小格可以併成一大格？」', why: '4 格併 1 格 → 2/3。約分不是「消掉數字」，是「合併格子」。' },
      { ask: '通分模式，設 2/3 和 3/4：「要切多細，兩條才對得齊？」', why: '12。這就是為什麼要找最小公倍數——切到兩邊格線剛好對上。' },
      { ask: '「2/3 和 3/4，用 24 當分母行不行？」', why: '行，但格子多一倍、數字變大、算完還要再約分。課綱要練的是找<b>最小</b>公倍數。' },
      { ask: '設 1/2 和 3/8（一個分母是另一個的倍數）：「這次要通分到多少？」', why: '8，不是 16。很多孩子反射性地兩分母相乘，這一題可以刻意提醒。' }
    ],

    pitfalls: [
      { bad: '擴分只乘分子（1/2 變成 3/2）。', fix: '格子數和塗色數要<b>一起</b>變，分子分母必須乘同一個數。' },
      { bad: '約分時分子分母除以不同的數。', fix: '一定要除以同一個<b>公因數</b>。除完再檢查一次還能不能約。' },
      { bad: '通分一律用「兩分母相乘」。', fix: '算得出答案，但數字會膨脹。課綱明確不鼓勵，要練習找最小公倍數。', src: 'N-5-4 備註「通分不鼓勵以分母直接相乘」' },
      { bad: '算完不約分就交卷。', fix: '課綱要求「養成利用約分化簡分數計算習慣」。算完先看分子分母有沒有公因數。', src: 'N-5-4' },
      { bad: '以為分母越大分數越大。', fix: '分母是「切成幾份」，切越細每份越小。通分後<b>分母一樣時</b>才能只看分子比大小。' }
    ],

    quiz: function () {
      const type = Kit.pick(['reduce', 'lcd', 'compare', 'expand']);

      if (type === 'reduce') {
        const g = Kit.randInt(2, 8), s = Kit.pick([[1, 2], [2, 3], [3, 4], [3, 5], [5, 6], [4, 7], [5, 8]]);
        return {
          q: '把 <b>' + (s[0] * g) + '/' + (s[1] * g) + '</b> 約分成最簡分數，答案的<b>分母</b>是多少？',
          input: 'number', answer: s[1],
          steps: (s[0] * g) + ' 和 ' + (s[1] * g) + ' 的最大公因數是 <b>' + g + '</b>。<br>' +
            '分子分母同除以 ' + g + '：' + (s[0] * g) + '÷' + g + '＝' + s[0] + '，' + (s[1] * g) + '÷' + g + '＝<b>' + s[1] + '</b>。<br>' +
            '最簡分數是 <b>' + s[0] + '/' + s[1] + '</b>。'
        };
      }

      if (type === 'lcd') {
        const pairs = [[3, 4], [2, 3], [4, 6], [6, 9], [8, 12], [2, 8], [3, 12], [6, 8], [5, 6], [4, 10]];
        const p = Kit.pick(pairs), L = lcm(p[0], p[1]);
        return {
          q: '要把 <b>?/' + p[0] + '</b> 和 <b>?/' + p[1] + '</b> 通分，最小的公分母是多少？',
          input: 'number', answer: L,
          steps: p[0] + ' 的倍數：' + [1, 2, 3, 4, 5].map(i => i * p[0]).join('、') + '…<br>' +
            p[1] + ' 的倍數：' + [1, 2, 3, 4, 5].map(i => i * p[1]).join('、') + '…<br>' +
            '第一個共同出現的是 <b>' + L + '</b>。<br>' +
            (L === p[0] * p[1]
              ? '（這一組剛好等於兩分母相乘。）'
              : '（兩分母相乘是 ' + p[0] * p[1] + '，也能用，但<b>不是最小的</b>，數字會白白變大。）')
        };
      }

      if (type === 'compare') {
        // 兩個分數的「寫法」不能一樣，否則兩個選項會長得一模一樣
        let b1, b2, a1, a2;
        do {
          b1 = Kit.pick([3, 4, 5, 6, 8]); b2 = Kit.pick([3, 4, 5, 6, 8]);
          a1 = Kit.randInt(1, b1 - 1); a2 = Kit.randInt(1, b2 - 1);
        } while (a1 === a2 && b1 === b2);
        const L = lcm(b1, b2), n1 = a1 * L / b1, n2 = a2 * L / b2;
        const opts = [a1 + '/' + b1, a2 + '/' + b2, '一樣大'];
        return {
          q: '<b>' + a1 + '/' + b1 + '</b> 和 <b>' + a2 + '/' + b2 + '</b>，哪一個比較大？',
          choices: opts, answer: n1 === n2 ? 2 : (n1 > n2 ? 0 : 1),
          steps: '先通分到公分母 <b>' + L + '</b>：<br>' +
            a1 + '/' + b1 + ' ＝ ' + n1 + '/' + L + '　　' + a2 + '/' + b2 + ' ＝ ' + n2 + '/' + L + '<br>' +
            '分母一樣了，比分子：' +
            (n1 === n2 ? '<b>一樣大</b>。' : '<b>' + Math.max(n1, n2) + ' > ' + Math.min(n1, n2) + '</b>，所以 <b>' +
              (n1 > n2 ? a1 + '/' + b1 : a2 + '/' + b2) + '</b> 比較大。')
        };
      }

      const b0 = Kit.pick([2, 3, 4, 5, 6]), a0 = Kit.randInt(1, b0 - 1), k = Kit.randInt(2, 5);
      return {
        q: '把 <b>' + a0 + '/' + b0 + '</b> 擴分成分母是 <b>' + (b0 * k) + '</b> 的分數，分子要填多少？',
        input: 'number', answer: a0 * k,
        steps: '分母從 ' + b0 + ' 變成 ' + (b0 * k) + '，是乘了 <b>' + k + '</b> 倍。<br>' +
          '分子也要乘同樣的 ' + k + ' 倍：' + a0 + ' × ' + k + ' ＝ <b>' + (a0 * k) + '</b>。<br>' +
          '所以 ' + a0 + '/' + b0 + ' ＝ ' + (a0 * k) + '/' + (b0 * k) + '。'
      };
    }
  });


  /* ============================================================
     第 6 單元　異分母分數的加減
     ============================================================ */
  Kit.register('m5a-u6', {

    intro: '分母不一樣，不能直接加——就像 3 個「三分之一」和 1 個「四分之一」沒辦法直接合併。要先<b>通分</b>切成一樣細，才加得起來。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 330);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let a = 1, b = 2, c = 1, d = 3, op = '+';
      let step = 0;          // 0 原式　1 通分　2 相加減　3 約分

      const X = 90, W = 470;

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const L = lcm(b, d), n1 = a * L / b, n2 = c * L / d;
        const rn = op === '+' ? n1 + n2 : n1 - n2;
        const g = rn === 0 ? 1 : Kit.gcd(Math.abs(rn), L);

        const titles = ['① 原本的兩個分數（格子大小不一樣，不能直接加減）',
          '② 通分：都切成 ' + L + ' 等分',
          '③ 分母一樣了，分子直接' + (op === '+' ? '相加' : '相減'),
          '④ 約分成最簡分數'];
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(titles[step], 16, 22);

        const sub1 = step >= 1 ? L / b : 1, sub2 = step >= 1 ? L / d : 1;
        bar(ctx, X, 46, W, 44, a, b, '#4da3ff', sub1);
        tag(ctx, X - 12, 68, step >= 1 ? n1 + '/' + L : a + '/' + b, '#4da3ff');
        ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(op, X + W / 2, 104);
        bar(ctx, X, 116, W, 44, c, d, '#34d399', sub2);
        tag(ctx, X - 12, 138, step >= 1 ? n2 + '/' + L : c + '/' + d, '#34d399');

        // 結果
        if (step >= 2) {
          ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(X, 178); ctx.lineTo(X + W, 178); ctx.stroke();
          const showN = step >= 3 ? rn / g : rn, showD = step >= 3 ? L / g : L;
          bar(ctx, X, 196, W, 52, Math.max(showN, 0), showD, '#fbbf24', 1);
          tag(ctx, X - 12, 222, showN + '/' + showD, '#fbbf24');
          if (rn > showD) {
            ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('（分子比分母大 → 假分數，超出 1 整個的部分畫不下）', X, 254);
          }
        }

        let msg = '';
        if (step === 0) {
          msg = '<div class="big">' + a + '/' + b + ' ' + op + ' ' + c + '/' + d + ' ＝ ?</div>' +
            '看畫面：上面一格是 1/' + b + '，下面一格是 1/' + d + '，<b>格子大小不一樣</b>。<br>' +
            '就像 3 顆蘋果加 2 顆西瓜不能說成 5 顆水果——單位不同不能直接合併。<br>' +
            '<span style="color:var(--muted)">按「下一步」開始通分。</span>';
        } else if (step === 1) {
          msg = '<div class="big">通分到分母 <b>' + L + '</b></div>' +
            b + ' 和 ' + d + ' 的最小公倍數是 <b>' + L + '</b>。<br>' +
            a + '/' + b + ' 分子分母同乘 ' + (L / b) + ' → <b>' + n1 + '/' + L + '</b><br>' +
            c + '/' + d + ' 分子分母同乘 ' + (L / d) + ' → <b>' + n2 + '/' + L + '</b><br>' +
            '<span style="color:var(--muted)">現在兩條的格子一樣大了。</span>';
        } else if (step === 2) {
          msg = '<div class="big">' + n1 + '/' + L + ' ' + op + ' ' + n2 + '/' + L + ' ＝ <b>' + rn + '/' + L + '</b></div>' +
            '<b>分母不動</b>，只把分子' + (op === '+' ? '相加' : '相減') + '：' + n1 + ' ' + op + ' ' + n2 + ' ＝ ' + rn + '。<br>' +
            '<span style="color:var(--muted)">為什麼分母不加？因為分母只是說「一格有多大」，不是數量。' +
            '3 個十元加 2 個十元是 5 個十元，不會變成 5 個二十元。</span>';
        } else {
          msg = '<div class="big">答案：<b>' + (rn / g) + '/' + (L / g) + '</b>' +
            (rn / g >= (L / g) && L / g > 0
              ? '　＝ ' + Math.floor(rn / g / (L / g)) + ' 又 ' + (rn / g % (L / g)) + '/' + (L / g)
              : '') + '</div>' +
            (g > 1
              ? rn + ' 和 ' + L + ' 的最大公因數是 <b>' + g + '</b>，同除以 ' + g + ' → <b>' + (rn / g) + '/' + (L / g) + '</b>。'
              : rn + ' 和 ' + L + ' 沒有公因數（除了 1），<b>已經是最簡分數</b>。') +
            '<br><span style="color:var(--muted)">課綱要求「養成利用約分化簡分數計算習慣」——算完一定要檢查能不能約。</span>';
        }
        readout.innerHTML = msg;
      }

      const opSeg = Kit.segmented('運算', [{ label: '加法 ＋', value: '+' }, { label: '減法 －', value: '-' }],
        function (v) { op = v; step = 0; nextBtn.textContent = '下一步 →'; paint(); }, op);

      function mk(label, get, set, min, max) {
        return Kit.slider(label, {
          min: min, max: max, value: get(),
          onChange: v => { set(v); step = 0; nextBtn.textContent = '下一步 →'; paint(); }
        });
      }
      const sA = mk('分子甲', () => a, v => a = v, 1, 11);
      const sB = mk('分母甲', () => b, v => b = v, 2, 12);
      const sC = mk('分子乙', () => c, v => c = v, 1, 11);
      const sD = mk('分母乙', () => d, v => d = v, 2, 12);

      const nextBtn = Kit.button('下一步 →', function () {
        step = (step + 1) % 4;
        nextBtn.textContent = step === 3 ? '↩ 從頭再看一次' : '下一步 →';
        paint();
      }, 'primary');

      controls.appendChild(opSeg.wrap);
      [sA, sB, sC, sD].forEach(s => controls.appendChild(s.wrap));
      controls.appendChild(nextBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '減法如果算出負數，代表被減數比較小——這一階段的題目不會這樣出，把分子甲調大一點就好。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '停在第①步問：「這兩條可以直接把分子加起來嗎？為什麼不行？」', why: '因為格子大小不一樣。用「3 顆蘋果 + 2 顆西瓜 ≠ 5 顆水果」比喻，比講「分母不同」好懂。' },
      { ask: '第②步問：「為什麼要切成 12 格，不是 7 格？」', why: '7 不是 3 和 4 的公倍數，切成 7 格兩邊都對不齊。公分母必須是兩個分母的公倍數。' },
      { ask: '第③步問：「分母為什麼不用加？」', why: '分母是「一格有多大」的說明，不是數量。3 個十元 + 2 個十元 = 5 個十元，不會變成 5 個二十元。這個比喻很好用。' },
      { ask: '第④步問：「還能再約嗎？」', why: '養成算完檢查的習慣。課綱明列這是這一單元的要求。' },
      { ask: '把兩個分母設成 2 和 8（一個是另一個的倍數），問「這次要通分到多少？」', why: '8。不用 16。孩子常反射性地兩分母相乘，這一題專治這個。' }
    ],

    pitfalls: [
      { bad: '分子加分子、分母加分母（1/2 + 1/3 = 2/5）。', fix: '這是最常見的錯。看畫面：1/2 已經是一半，加上一點怎麼可能變成比一半還小的 2/5？<b>先估答案再算</b>可以擋掉這種錯。' },
      { bad: '通分後忘了把分子也跟著變。', fix: '分母乘幾倍，分子就要乘幾倍。畫面上白色粗線就是原本的格線，可以對照。' },
      { bad: '通分一律用兩分母相乘。', fix: '2 和 8 通分到 8 就好，通到 16 只是把數字變大。', src: 'N-5-4 備註「通分不鼓勵以分母直接相乘」' },
      { bad: '算完不約分。', fix: '4/12 要寫成 1/3。課綱明訂要養成約分習慣。', src: 'N-5-4' },
      { bad: '帶分數相加時只加分數部分、忘了整數部分。', fix: '整數和整數加、分數和分數加，分數部分超過 1 要進位到整數。' }
    ],

    quiz: function () {
      const type = Kit.pick(['add', 'add', 'sub', 'spot']);

      if (type === 'spot') {
        const opts = Kit.shuffle([
          { t: '5/6', ok: true }, { t: '2/5', ok: false }, { t: '2/6', ok: false }, { t: '1/5', ok: false }
        ]);
        return {
          q: '<b>1/2 ＋ 1/3</b> 等於多少？',
          choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
          steps: '通分到 6：1/2 ＝ <b>3/6</b>，1/3 ＝ <b>2/6</b>。<br>' +
            '3/6 ＋ 2/6 ＝ <b>5/6</b>。<br>' +
            '⚠️ 「2/5」是把分子加分子、分母加分母的<b>典型錯誤</b>。檢查一下：1/2 已經是一半了，加上東西怎麼會變成比一半小的 2/5？'
        };
      }

      // 兩個分數各自產生，減法時把大的排前面（整組交換，不能只換分子）
      let f1 = { n: 0, d: Kit.pick([2, 3, 4, 5, 6, 8]) };
      let f2 = { n: 0, d: Kit.pick([2, 3, 4, 6, 8, 12]) };
      f1.n = Kit.randInt(1, f1.d - 1);
      f2.n = Kit.randInt(1, f2.d - 1);
      if (type === 'sub' && f1.n / f1.d < f2.n / f2.d) { const t = f1; f1 = f2; f2 = t; }

      const L = lcm(f1.d, f2.d);
      const n1 = f1.n * L / f1.d, n2 = f2.n * L / f2.d;
      const rn = type === 'sub' ? n1 - n2 : n1 + n2;
      const g = rn === 0 ? 1 : Kit.gcd(rn, L);
      const opSym = type === 'sub' ? '－' : '＋';

      return {
        q: '<b>' + f1.n + '/' + f1.d + ' ' + opSym + ' ' + f2.n + '/' + f2.d + '</b> ＝ ?　（先算出來，答案的<b>分子</b>填在下面，記得約分）',
        input: 'number', answer: rn / g,
        steps: '① 通分到公分母 <b>' + L + '</b>：' +
          f1.n + '/' + f1.d + ' ＝ ' + n1 + '/' + L + '，' + f2.n + '/' + f2.d + ' ＝ ' + n2 + '/' + L + '<br>' +
          '② 分母不動，分子' + (type === 'sub' ? '相減' : '相加') + '：' + n1 + ' ' + opSym + ' ' + n2 + ' ＝ ' + rn + ' → ' + rn + '/' + L + '<br>' +
          '③ 約分：' + (g > 1
            ? '最大公因數 ' + g + '，同除以 ' + g + ' → <b>' + (rn / g) + '/' + (L / g) + '</b>'
            : '沒有公因數，已是最簡分數 <b>' + rn + '/' + L + '</b>') + '<br>' +
          '所以分子是 <b>' + (rn / g) + '</b>。'
      };
    }
  });

})();
