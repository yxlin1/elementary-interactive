/* ============================================================
   教具 m5b-u2　分數的計算
   南一 115：五下 第 1 單元
   課綱 N-5-5「分數的乘法：整數乘以分數、分數乘以分數的意義。知道用約分
                簡化乘法計算。<b>處理乘積一定比被乘數大的錯誤類型</b>。
                透過分數計算的公式，知道乘法交換律在分數也成立。」
        N-5-6「整數相除之分數表示：從分裝（測量）和平分的觀點，
                分別說明整數相除為分數之意義與合理性。」
        N-5-7「分數除以整數：意義。最後將問題轉化為乘以單位分數。」
   ============================================================ */

Kit.register('m5b-u2', {

  intro: '三個模式：<b>分數×分數</b>用正方形的「重疊區」看、<b>整數÷整數</b>用切披薩看為什麼會變成分數、<b>分數÷整數</b>看為什麼可以改成乘以單位分數。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 320);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'mul';
    let a = 2, b = 3, c = 3, d = 4;      // (a/b) × (c/d)
    let P = 3, Q = 4;                    // P ÷ Q
    let fn = 2, fd = 3, k = 4;           // (fn/fd) ÷ k

    /* ---------- 模式 A：分數 × 分數（面積模型） ---------- */
    function paintMul() {
      const ctx = cv.ctx;
      const S = 236, ox = 60, oy = 44;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('一整塊正方形當作「1」。橫著取 ' + a + '/' + b + '，直著取 ' + c + '/' + d + '，重疊的就是答案', 16, 22);

      // 底
      ctx.fillStyle = '#16203a'; ctx.fillRect(ox, oy, S, S);
      // 橫向 a/b（藍）
      ctx.fillStyle = 'rgba(77,163,255,.35)';
      ctx.fillRect(ox, oy, S * a / b, S);
      // 縱向 c/d（綠）
      ctx.fillStyle = 'rgba(52,211,153,.35)';
      ctx.fillRect(ox, oy, S, S * c / d);
      // 重疊（黃）
      ctx.fillStyle = 'rgba(251,191,36,.85)';
      ctx.fillRect(ox, oy, S * a / b, S * c / d);

      // 格線
      ctx.strokeStyle = 'rgba(11,18,32,.5)'; ctx.lineWidth = 1;
      for (let i = 1; i < b; i++) { ctx.beginPath(); ctx.moveTo(ox + S * i / b, oy); ctx.lineTo(ox + S * i / b, oy + S); ctx.stroke(); }
      for (let j = 1; j < d; j++) { ctx.beginPath(); ctx.moveTo(ox, oy + S * j / d); ctx.lineTo(ox + S, oy + S * j / d); ctx.stroke(); }
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, S, S);

      // 標註
      ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(a + '/' + b, ox + S * a / b / 2, oy - 8);
      ctx.fillStyle = '#34d399';
      ctx.save(); ctx.translate(ox - 14, oy + S * c / d / 2); ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle'; ctx.fillText(c + '/' + d, 0, 0); ctx.restore();

      const num = a * c, den = b * d, g = Kit.gcd(num, den);
      // 右側說明
      ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('整塊被切成', 340, 70);
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      ctx.fillText(b + ' × ' + d + ' ＝ ' + den + ' 小格', 340, 94);
      ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
      ctx.fillText('黃色佔了', 340, 132);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      ctx.fillText(a + ' × ' + c + ' ＝ ' + num + ' 小格', 340, 156);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 30px "Microsoft JhengHei", sans-serif';
      ctx.fillText(num + '/' + den, 340, 200);
      if (g > 1) {
        ctx.fillStyle = '#34d399'; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
        ctx.fillText('＝ ' + (num / g) + '/' + (den / g), 340, 240);
      }

      const prod = num / den, base = a / b;
      readout.innerHTML =
        '<div class="big">' + a + '/' + b + ' × ' + c + '/' + d + ' ＝ ' +
        '(' + a + '×' + c + ') / (' + b + '×' + d + ') ＝ ' + num + '/' + den +
        (g > 1 ? ' ＝ <b>' + (num / g) + '/' + (den / g) + '</b>' : ' <b></b>') + '</div>' +
        '分子乘分子、分母乘分母——但這不是規定，是<b>看圖看出來的</b>：整塊被切成 ' + b + '×' + d + '＝' + den +
        ' 小格，黃色佔了 ' + a + '×' + c + '＝' + num + ' 格。<br>' +
        '<b style="color:var(--warn)">⚠️ 重點檢查：' + a + '/' + b + ' × ' + c + '/' + d + ' 的答案比 ' + a + '/' + b + ' 大還是小？</b><br>' +
        (c / d < 1
          ? '<b>變小了</b>（' + parseFloat(prod.toFixed(4)) + ' < ' + parseFloat(base.toFixed(4)) + '）。因為乘的是<b>比 1 小</b>的數 ' + c + '/' + d +
            '——「取其中一部分」當然會變小。<br><span style="color:var(--muted)">「乘法一定變大」只在乘以大於 1 的數時才對，這是這一單元課綱特別點名要處理的錯誤觀念。</span>'
          : '<b>變大了</b>，因為 ' + c + '/' + d + ' 大於 1。') +
        (Kit.gcd(a, d) > 1 || Kit.gcd(c, b) > 1
          ? '<br><span style="color:var(--ok)">💡 可以<b>先約分再乘</b>：' +
            (Kit.gcd(a, d) > 1 ? a + ' 和 ' + d + ' 有公因數 ' + Kit.gcd(a, d) + '；' : '') +
            (Kit.gcd(c, b) > 1 ? c + ' 和 ' + b + ' 有公因數 ' + Kit.gcd(c, b) + '；' : '') +
            '先約掉數字會小很多。</span>'
          : '');
    }

    /* ---------- 模式 B：整數 ÷ 整數 = 分數 ---------- */
    function paintDiv() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(P + ' 個披薩，平分給 ' + Q + ' 個人，每人分到多少？', 16, 22);

      const R = 42, gap = 14;
      const startX = 60;
      // 每個披薩切成 Q 塊
      for (let i = 0; i < P; i++) {
        const cx = startX + i * (R * 2 + gap), cy = 96;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = '#16203a'; ctx.fill();
        for (let s = 0; s < Q; s++) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, R, s * 2 * Math.PI / Q - Math.PI / 2, (s + 1) * 2 * Math.PI / Q - Math.PI / 2);
          ctx.closePath();
          // 第 s 個人拿走每個披薩的第 s 塊 → 用不同顏色標第 0 個人
          ctx.fillStyle = (s === 0) ? 'rgba(251,191,36,.85)' : 'rgba(77,163,255,.28)';
          ctx.fill();
          ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      }

      // 第一個人拿到的
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('黃色 = 第 1 個人拿到的：每個披薩各拿 1/' + Q + ' 塊，共 ' + P + ' 塊', 60, 156);

      // 拼起來
      const bx = 60, by = 196, bw = 460, bh = 46;
      ctx.fillStyle = '#16203a'; ctx.fillRect(bx, by, bw, bh);
      const unit = bw / Q;      // 一整個披薩的寬 = Q 小格中的 Q 格 → 用 1/Q 當格寬
      for (let i = 0; i < P; i++) {
        ctx.fillStyle = 'rgba(251,191,36,.85)';
        ctx.fillRect(bx + i * unit, by, unit, bh);
      }
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
      for (let i = 1; i < Q * 2; i++) {
        if (bx + i * unit > bx + bw) break;
        ctx.beginPath(); ctx.moveTo(bx + i * unit, by); ctx.lineTo(bx + i * unit, by + bh); ctx.stroke();
      }
      // 「1 個披薩」的界線
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx + Q * unit, by - 8); ctx.lineTo(bx + Q * unit, by + bh + 8); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#34d399'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('← 這裡是 1 整個披薩', bx + Q * unit + 6, by + 16);

      const g = Kit.gcd(P, Q);
      readout.innerHTML =
        '<div class="big">' + P + ' ÷ ' + Q + ' ＝ <b>' + P + '/' + Q + '</b>' +
        (g > 1 ? ' ＝ <b>' + (P / g) + '/' + (Q / g) + '</b>' : '') +
        (P >= Q ? '　＝ ' + Math.floor(P / Q) + (P % Q ? ' 又 ' + (P % Q) + '/' + Q : '') + ' 個' : '') + '</div>' +
        '<b>平分的觀點</b>：把每個披薩都切成 ' + Q + ' 塊，每人各拿 1 塊 → 每人拿到 ' + P + ' 個 1/' + Q + '，也就是 <b>' + P + '/' + Q + '</b> 個披薩。<br>' +
        '這就是為什麼「整數 ÷ 整數」可以直接寫成分數：<b>分數線就是除號</b>。<br>' +
        '<span style="color:var(--muted)">' +
        (P < Q
          ? '注意 ' + P + ' ÷ ' + Q + ' 的答案<b>比 1 小</b>——除法不一定要「除得盡」，也不一定要留餘數，寫成分數就剛剛好。'
          : '也可以說成 ' + Math.floor(P / Q) + ' 又 ' + (P % Q) + '/' + Q + ' 個（帶分數）。') +
        '　另一個觀點是<b>分裝</b>：' + P + ' 公升的水，每 ' + Q + ' 公升裝一桶，可以裝 ' + P + '/' + Q + ' 桶。</span>';
    }

    /* ---------- 模式 C：分數 ÷ 整數 ---------- */
    function paintFdiv() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(fn + '/' + fd + ' 的東西，要平分給 ' + k + ' 個人，每人多少？', 16, 22);

      const bx = 60, bw = 500;
      // ① 原本的 fn/fd
      ctx.fillStyle = '#16203a'; ctx.fillRect(bx, 50, bw, 50);
      for (let i = 0; i < fn; i++) {
        ctx.fillStyle = 'rgba(77,163,255,.75)';
        ctx.fillRect(bx + i * bw / fd, 50, bw / fd, 50);
      }
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
      for (let i = 1; i < fd; i++) { ctx.beginPath(); ctx.moveTo(bx + i * bw / fd, 50); ctx.lineTo(bx + i * bw / fd, 100); ctx.stroke(); }
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, 50, bw, 50);
      ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(fn + '/' + fd, bx - 10, 75);

      // ② 每一格再切成 k 份
      const D2 = fd * k;
      ctx.fillStyle = '#16203a'; ctx.fillRect(bx, 140, bw, 50);
      for (let i = 0; i < fn * k; i++) {
        ctx.fillStyle = (i % k === 0) ? 'rgba(251,191,36,.9)' : 'rgba(124,92,255,.45)';
        ctx.fillRect(bx + i * bw / D2, 140, bw / D2, 50);
      }
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
      for (let i = 1; i < D2; i++) { ctx.beginPath(); ctx.moveTo(bx + i * bw / D2, 140); ctx.lineTo(bx + i * bw / D2, 190); ctx.stroke(); }
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, 140, bw, 50);
      ctx.fillStyle = '#7c5cff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText((fn * k) + '/' + D2, bx - 10, 165);

      ctx.fillStyle = '#fbbf24'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('黃色 = 第 1 個人拿到的 ' + fn + ' 小格', bx, 200);

      // ③ 一個人拿到的
      const rn = fn, rd = D2, g = Kit.gcd(rn, rd);
      ctx.fillStyle = '#16203a'; ctx.fillRect(bx, 236, bw, 46);
      for (let i = 0; i < rn; i++) {
        ctx.fillStyle = 'rgba(251,191,36,.9)';
        ctx.fillRect(bx + i * bw / rd, 236, bw / rd, 46);
      }
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
      for (let i = 1; i < rd; i++) { ctx.beginPath(); ctx.moveTo(bx + i * bw / rd, 236); ctx.lineTo(bx + i * bw / rd, 282); ctx.stroke(); }
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, 236, bw, 46);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(rn + '/' + rd, bx - 10, 259);

      readout.innerHTML =
        '<div class="big">' + fn + '/' + fd + ' ÷ ' + k + ' ＝ ' + fn + '/' + (fd * k) +
        (g > 1 ? ' ＝ <b>' + (rn / g) + '/' + (rd / g) + '</b>' : '') + '</div>' +
        '把每一格再切成 <b>' + k + '</b> 小份 → 整塊變成 ' + fd + '×' + k + '＝<b>' + D2 + '</b> 小格，原本的 ' +
        fn + ' 格變成 ' + (fn * k) + ' 小格。<br>' +
        '這 ' + (fn * k) + ' 小格平分給 ' + k + ' 個人，每人拿 <b>' + fn + '</b> 小格 → <b>' + fn + '/' + D2 + '</b>。<br>' +
        '<span style="color:var(--ok)">💡 課綱要求「最後將問題轉化為<b>乘以單位分數</b>」：<br>' +
        fn + '/' + fd + ' ÷ ' + k + ' ＝ ' + fn + '/' + fd + ' × <b>1/' + k + '</b> ＝ ' + fn + '/' + D2 +
        '　（÷ ' + k + ' 就是 × 1/' + k + '）</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'mul') paintMul();
      else if (mode === 'div') paintDiv();
      else paintFdiv();
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '分數 × 分數', value: 'mul' },
      { label: '整數 ÷ 整數 ＝ 分數', value: 'div' },
      { label: '分數 ÷ 整數', value: 'fdiv' }
    ], function (v) {
      mode = v;
      [sa, sb, sc, sd].forEach(x => x.wrap.style.display = v === 'mul' ? '' : 'none');
      [sP, sQ].forEach(x => x.wrap.style.display = v === 'div' ? '' : 'none');
      [sfn, sfd, sk].forEach(x => x.wrap.style.display = v === 'fdiv' ? '' : 'none');
      paint();
    }, mode);

    function mk(lbl, get, set, mn, mx) {
      return Kit.slider(lbl, { min: mn, max: mx, value: get(), onChange: v => { set(v); paint(); } });
    }
    const sa = mk('分子甲', () => a, v => { a = Math.min(v, b); paint(); }, 1, 6);
    const sb = mk('分母甲', () => b, v => { b = v; if (a > b) a = b; sa.input.value = a; sa.output.textContent = a; }, 2, 6);
    const sc = mk('分子乙', () => c, v => { c = Math.min(v, d); }, 1, 6);
    const sd = mk('分母乙', () => d, v => { d = v; if (c > d) c = d; sc.input.value = c; sc.output.textContent = c; }, 2, 6);
    const sP = mk('披薩個數', () => P, v => P = v, 1, 7);
    const sQ = mk('分給幾人', () => Q, v => Q = v, 2, 8);
    const sfn = mk('分子', () => fn, v => { fn = Math.min(v, fd); }, 1, 5);
    const sfd = mk('分母', () => fd, v => { fd = v; if (fn > fd) fn = fd; sfn.input.value = fn; sfn.output.textContent = fn; }, 2, 6);
    const sk = mk('平分給幾人', () => k, v => k = v, 2, 6);

    [sP, sQ, sfn, sfd, sk].forEach(x => x.wrap.style.display = 'none');
    controls.appendChild(modeSeg.wrap);
    [sa, sb, sc, sd, sP, sQ, sfn, sfd, sk].forEach(x => controls.appendChild(x.wrap));
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱在這一單元<b>特別點名</b>要處理「乘積一定比被乘數大」的錯誤觀念（N-5-5）。' +
        '乘以<b>比 1 小</b>的數，答案會<b>變小</b>——把分子乙調小看看就知道了。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '乘法模式：「1/2 × 1/2 的答案，比 1/2 大還是小？」', why: '小。這是這一單元最重要的一題。取一半的一半，當然比一半少。「乘法會變大」只在乘以大於 1 的數時才成立。' },
    { ask: '「為什麼分子乘分子、分母乘分母？」', why: '看圖：整塊被切成 b×d 小格（橫切 b 刀、直切 d 刀），黃色佔了 a×c 格。規則是<b>數出來的</b>，不是背的。' },
    { ask: '「的一半」和「乘以 1/2」是同一件事嗎？', why: '是。課綱要求建立「的 1/2」和「1/2 倍」的關聯。日常說「一半的一半」，數學寫成 1/2 × 1/2。' },
    { ask: '披薩模式：「3 個披薩分 4 個人，每人多少？可以用整數回答嗎？」', why: '不行，要用分數 3/4。這一題讓孩子接受「除法的答案可以是分數」，不必留餘數。' },
    { ask: '「3 ÷ 4 和 3/4 是同一件事嗎？」', why: '是。<b>分數線就是除號</b>。這句話說一百次都不嫌多，六年級的比、七年級的代數全靠它。' },
    { ask: '分數除法模式：「÷ 4 和 × 1/4 為什麼一樣？」', why: '平分成 4 份，就是取其中的 1/4。課綱明訂要把分數除以整數「轉化為乘以單位分數」。' }
  ],

  pitfalls: [
    { bad: '以為「乘法一定變大、除法一定變小」。', fix: '乘以<b>小於 1</b> 的數會變小（1/2 × 1/2 ＝ 1/4），除以小於 1 的數會變大。這是課綱指定要處理的錯誤類型。', src: 'N-5-5「處理乘積一定比被乘數大的錯誤類型」' },
    { bad: '分數乘法時去通分。', fix: '<b>乘法不用通分</b>！通分是加減法才需要的。分數乘法直接分子乘分子、分母乘分母。' },
    { bad: '3 ÷ 4 算成「0 餘 3」或說「不能除」。', fix: '寫成分數 <b>3/4</b> 就好。除法不一定要除得盡，也不一定要留餘數。', src: 'N-5-6' },
    { bad: '分數除以整數時，把<b>分子</b>除以那個整數（2/3 ÷ 4 ＝ 0.5/3）。', fix: '正確是把<b>分母</b>乘上去：2/3 ÷ 4 ＝ 2/12 ＝ 1/6。或者記成「÷4 就是 ×1/4」。' },
    { bad: '算完不約分。', fix: '2/12 要寫成 1/6。而且<b>乘之前先約分</b>數字會小很多，課綱也要求養成這個習慣。', src: 'N-5-5「知道用約分簡化乘法計算」' }
  ],

  quiz: function () {
    // 題型依均一「五下第一單元 分數的計算」1-1～1-5：整數相除結果是帶分數／整數的分數倍／
    // 帶分數乘整數／「的」的應用題／長方形面積／分數除以整數的應用
    const type = Kit.pick(['mul', 'mul', 'bigger', 'intdiv', 'fdiv', 'intMul', 'ofWord', 'mixedMul', 'areaFrac', 'divWord', 'intDivMixed']);
    function fr(n, d) {
      if (n === 0) return '0';
      const g = Kit.gcd(n, d); n /= g; d /= g;
      if (d === 1) return String(n);
      if (n < d) return n + '/' + d;
      const w = Math.floor(n / d), r = n - w * d;
      return r ? w + '又' + r + '/' + d : String(w);
    }
    function opts(items, pad) {
      items.sort((x, y) => (y.ok ? 1 : 0) - (x.ok ? 1 : 0));
      const seen = {}, out = [];
      items.forEach(it => { const k = it.v.toFixed(6); if (!seen[k]) { seen[k] = 1; out.push(it); } });
      for (let i = 1; out.length < 4 && pad && i < 12; i++) { const c = pad(i); if (!c) continue; const k = c.v.toFixed(6); if (!seen[k]) { seen[k] = 1; out.push(c); } }
      const sh = Kit.shuffle(out);
      return { choices: sh.map(o => o.t), answer: sh.findIndex(o => o.ok) };
    }
    const fItem = (n, d, ok) => ({ v: n / d, t: fr(n, d), ok: !!ok });
    function simpleFrac(d) { let n; do { n = Kit.randInt(1, d - 1); } while (Kit.gcd(n, d) !== 1); return { n: n, d: d }; }

    if (type === 'intMul') {
      const f = simpleFrac(Kit.pick([2, 3, 4, 5, 6, 8]));
      const N = f.d * Kit.randInt(2, 6);            // 讓答案是整數
      const ctx = Kit.pick([
        '有 <b>' + N + '</b> 顆糖，拿走其中的 <b>' + fr(f.n, f.d) + '</b>，拿走幾顆？',
        '一條 <b>' + N + '</b> 公尺的繩子，用掉全長的 <b>' + fr(f.n, f.d) + '</b>，用掉幾公尺？',
        '<b>' + N + ' × ' + fr(f.n, f.d) + '</b> ＝ ?'
      ]);
      return {
        q: ctx,
        input: 'number', answer: N * f.n / f.d,
        steps: '「' + N + ' 的 ' + fr(f.n, f.d) + '」就是 <b>' + N + ' × ' + fr(f.n, f.d) + '</b>。<br>' +
          '先把 ' + N + ' 平分成 ' + f.d + ' 份，一份是 ' + N + ' ÷ ' + f.d + ' ＝ ' + N / f.d + '，取 ' + f.n + ' 份：' + N / f.d + ' × ' + f.n + ' ＝ <b>' + N * f.n / f.d + '</b><br>' +
          '<span style="color:var(--muted)">也可以先約分：' + N + ' 和分母 ' + f.d + ' 同除以 ' + f.d + '，再乘分子。</span>'
      };
    }

    if (type === 'ofWord') {
      const A = simpleFrac(Kit.pick([2, 3, 4, 5, 6])), B = simpleFrac(Kit.pick([2, 3, 4, 5]));
      const num = A.n * B.n, den = A.d * B.d;
      const ctx = Kit.pick([
        { q: '一條繩子長 <b>' + fr(A.n, A.d) + '</b> 公尺，用掉它的 <b>' + fr(B.n, B.d) + '</b>。用掉幾公尺？', u: '公尺' },
        { q: '一塊蛋糕剩下 <b>' + fr(A.n, A.d) + '</b> 個，小明吃掉剩下的 <b>' + fr(B.n, B.d) + '</b>。小明吃了幾個蛋糕？', u: '個' },
        { q: '一桶水有 <b>' + fr(A.n, A.d) + '</b> 公升，倒出其中的 <b>' + fr(B.n, B.d) + '</b>。倒出幾公升？', u: '公升' }
      ]);
      const o = opts([
        fItem(num, den, true),
        fItem(A.n * B.d + B.n * A.d, A.d * B.d),    // 誤用加法
        fItem(A.n * B.d, A.d * B.n),                // 除反了
        fItem(num, A.d)                             // 只乘分子
      ], i => fItem(num + i, den));
      return {
        q: ctx.q,
        choices: o.choices, answer: o.answer,
        steps: '「甲的幾分之幾」→ <b>甲 × 幾分之幾</b>：' + fr(A.n, A.d) + ' × ' + fr(B.n, B.d) + '<br>' +
          '分子乘分子、分母乘分母：' + A.n + '×' + B.n + ' / ' + A.d + '×' + B.d + ' ＝ ' + num + '/' + den + (fr(num, den) !== num + '/' + den ? ' ＝ <b>' + fr(num, den) + '</b>' : '') + ' ' + ctx.u + '<br>' +
          '<span style="color:var(--muted)">取一部分的一部分，答案一定比 ' + fr(A.n, A.d) + ' 小。</span>'
      };
    }

    if (type === 'mixedMul') {
      const d = Kit.pick([2, 3, 4, 5]), w = Kit.randInt(1, 3), f = simpleFrac(d);
      const k = d * Kit.randInt(1, 3);                // 整數是分母的倍數 → 答案是整數
      const ans = w * k + f.n * k / d;
      return {
        q: '<b>' + w + '又' + fr(f.n, d) + ' × ' + k + '</b> ＝ ?',
        input: 'number', answer: ans,
        steps: '帶分數乘整數，兩種算法：<br>' +
          '① <b>分開乘</b>（分配律）：整數 ' + w + ' × ' + k + ' ＝ ' + w * k + '；分數 ' + fr(f.n, d) + ' × ' + k + ' ＝ ' + fr(f.n * k, d) + '；合起來 <b>' + ans + '</b><br>' +
          '② <b>先換假分數</b>：' + w + '又' + fr(f.n, d) + ' ＝ ' + (w * d + f.n) + '/' + d + '，' + (w * d + f.n) + '/' + d + ' × ' + k + ' ＝ ' + ((w * d + f.n) * k) + '/' + d + ' ＝ <b>' + ans + '</b><br>' +
          '<span style="color:var(--muted)">⚠️ 常見錯誤：只把整數部分乘 ' + k + '，分數忘了乘。</span>'
      };
    }

    if (type === 'areaFrac') {
      const A = simpleFrac(Kit.pick([2, 3, 4, 5])), B = simpleFrac(Kit.pick([2, 3, 4, 5, 6]));
      const num = A.n * B.n, den = A.d * B.d;
      const o = opts([fItem(num, den, true), fItem(A.n * B.d + B.n * A.d, den), fItem(2 * (A.n * B.d + B.n * A.d), den), fItem(num, A.d)], i => fItem(num + i, den));
      return {
        q: '一張長方形色紙，長 <b>' + fr(A.n, A.d) + '</b> 公尺、寬 <b>' + fr(B.n, B.d) + '</b> 公尺。面積是多少平方公尺？',
        choices: o.choices, answer: o.answer,
        steps: '面積 ＝ 長 × 寬，分數一樣適用：' + fr(A.n, A.d) + ' × ' + fr(B.n, B.d) + ' ＝ ' + num + '/' + den + (fr(num, den) !== num + '/' + den ? ' ＝ <b>' + fr(num, den) + '</b>' : '') + ' 平方公尺<br>' +
          '<span style="color:var(--muted)">想像 1 平方公尺的正方形，橫切 ' + A.d + ' 份取 ' + A.n + '、直切 ' + B.d + ' 份取 ' + B.n + '，重疊的格子就是 ' + num + ' 格（共 ' + den + ' 格）。</span>'
      };
    }

    if (type === 'divWord') {
      const f = simpleFrac(Kit.pick([2, 3, 4, 5, 6])), k = Kit.randInt(2, 5);
      const ctx = Kit.pick([
        { q: '<b>' + fr(f.n, f.d) + '</b> 公升的果汁平分給 <b>' + k + '</b> 個人，每人喝到幾公升？', u: '公升' },
        { q: '一條 <b>' + fr(f.n, f.d) + '</b> 公尺的緞帶剪成 <b>' + k + '</b> 段一樣長，每段幾公尺？', u: '公尺' },
        { q: '<b>' + fr(f.n, f.d) + '</b> 公斤的麵粉平分裝成 <b>' + k + '</b> 袋，每袋幾公斤？', u: '公斤' }
      ]);
      const o = opts([fItem(f.n, f.d * k, true), fItem(f.n * k, f.d), fItem(Math.max(1, f.n - k) || 1, f.d), fItem(f.n, Math.abs(f.d - k) || 1)], i => fItem(f.n + i, f.d * k));
      return {
        q: ctx.q,
        choices: o.choices, answer: o.answer,
        steps: '「平分成 ' + k + ' 份、每份多少」→ <b>÷ ' + k + '</b>，也就是 <b>× 1/' + k + '</b>：<br>' +
          fr(f.n, f.d) + ' ÷ ' + k + ' ＝ ' + fr(f.n, f.d) + ' × 1/' + k + ' ＝ ' + f.n + '/' + (f.d * k) + (fr(f.n, f.d * k) !== f.n + '/' + (f.d * k) ? ' ＝ <b>' + fr(f.n, f.d * k) + '</b>' : '') + ' ' + ctx.u + '<br>' +
          '<span style="color:var(--muted)">分母變大（每份變小），分子不動。</span>'
      };
    }

    if (type === 'intDivMixed') {
      const q0 = Kit.randInt(2, 6), p0 = q0 * Kit.randInt(1, 3) + Kit.randInt(1, q0 - 1);   // 一定除不盡且大於 1
      const o = opts([fItem(p0, q0, true), fItem(q0, p0), fItem(Math.floor(p0 / q0) * q0 + (p0 % q0), q0 * 2), fItem(Math.floor(p0 / q0) * q0, q0)], i => fItem(p0 + i, q0));
      return {
        q: '<b>' + p0 + '</b> 個蛋糕平分給 <b>' + q0 + '</b> 個人，每人分到幾個？（用<b>帶分數</b>表示）',
        choices: o.choices, answer: o.answer,
        steps: p0 + ' ÷ ' + q0 + ' ＝ <b>' + p0 + '/' + q0 + '</b>（分數線就是除號）<br>' +
          '先每人拿 ' + Math.floor(p0 / q0) + ' 個整的，剩 ' + (p0 % q0) + ' 個再各切成 ' + q0 + ' 塊平分，每人再拿 ' + (p0 % q0) + '/' + q0 + '<br>' +
          '合起來 <b>' + fr(p0, q0) + '</b> 個'
      };
    }


    if (type === 'mul') {
      const b1 = Kit.pick([2, 3, 4, 5, 6]), d1 = Kit.pick([2, 3, 4, 5, 6]);
      const a1 = Kit.randInt(1, b1), c1 = Kit.randInt(1, d1);
      const num = a1 * c1, den = b1 * d1, g = Kit.gcd(num, den);
      return {
        q: '<b>' + a1 + '/' + b1 + ' × ' + c1 + '/' + d1 + '</b> ＝ ?　（約分成最簡分數，填<b>分母</b>）',
        input: 'number', answer: den / g,
        steps: '分子乘分子、分母乘分母（<b>不用通分</b>）：<br>' +
          '(' + a1 + '×' + c1 + ') / (' + b1 + '×' + d1 + ') ＝ ' + num + '/' + den + '<br>' +
          (g > 1
            ? '約分：' + num + ' 和 ' + den + ' 的最大公因數是 ' + g + ' → <b>' + (num / g) + '/' + (den / g) + '</b>，分母是 <b>' + (den / g) + '</b>。'
            : '已是最簡分數，分母是 <b>' + den + '</b>。')
      };
    }

    if (type === 'bigger') {
      const b1 = Kit.pick([2, 3, 4, 5]), a1 = Kit.randInt(1, b1 - 1);
      const big = Math.random() < .5;
      const d1 = Kit.pick([2, 3, 4]);
      const c1 = big ? d1 + Kit.randInt(1, 3) : Kit.randInt(1, d1 - 1) || 1;
      const opts = ['比 ' + a1 + '/' + b1 + ' 大', '比 ' + a1 + '/' + b1 + ' 小', '和 ' + a1 + '/' + b1 + ' 一樣'];
      const ans = c1 > d1 ? 0 : c1 < d1 ? 1 : 2;
      return {
        q: '<b>' + a1 + '/' + b1 + ' × ' + c1 + '/' + d1 + '</b> 的答案，會比 ' + a1 + '/' + b1 + ' 大還是小？（先不要算，用想的）',
        choices: opts, answer: ans,
        steps: '關鍵在<b>乘的那個數比 1 大還是小</b>：<br>' +
          c1 + '/' + d1 + ' ' + (c1 > d1 ? '<b>大於 1</b>（分子比分母大）→ 乘完會<b>變大</b>'
            : c1 < d1 ? '<b>小於 1</b>（分子比分母小）→ 乘完會<b>變小</b>'
            : '<b>等於 1</b> → 乘完<b>不變</b>') + '<br>' +
          '⚠️ 「乘法一定變大」是錯的。取一份東西的一部分，當然會變少。'
      };
    }

    if (type === 'intdiv') {
      const p = Kit.randInt(1, 9), q = Kit.randInt(2, 9);
      const g = Kit.gcd(p, q);
      return {
        q: '<b>' + p + '</b> 個蛋糕平分給 <b>' + q + '</b> 個人，每人分到幾分之幾個？（填<b>分子</b>，記得約分）',
        input: 'number', answer: p / g,
        steps: '整數 ÷ 整數可以直接寫成分數，<b>分數線就是除號</b>：<br>' +
          p + ' ÷ ' + q + ' ＝ <b>' + p + '/' + q + '</b>' +
          (g > 1 ? ' ＝ <b>' + (p / g) + '/' + (q / g) + '</b>（同除以 ' + g + '）' : '（已是最簡）') + '<br>' +
          '想法：每個蛋糕都切成 ' + q + ' 塊，每人各拿 1 塊，共拿到 ' + p + ' 個 1/' + q + '。'
      };
    }

    const fd1 = Kit.pick([2, 3, 4, 5, 6]), fn1 = Kit.randInt(1, fd1 - 1) || 1, k1 = Kit.randInt(2, 6);
    const rd = fd1 * k1, g2 = Kit.gcd(fn1, rd);
    return {
      q: '<b>' + fn1 + '/' + fd1 + ' ÷ ' + k1 + '</b> ＝ ?　（填<b>分母</b>，記得約分）',
      input: 'number', answer: rd / g2,
      steps: '÷ ' + k1 + ' 就是 <b>× 1/' + k1 + '</b>：<br>' +
        fn1 + '/' + fd1 + ' × 1/' + k1 + ' ＝ ' + fn1 + '/' + rd + '<br>' +
        (g2 > 1 ? '約分 → <b>' + (fn1 / g2) + '/' + (rd / g2) + '</b>，分母是 <b>' + (rd / g2) + '</b>。'
          : '已是最簡分數，分母是 <b>' + rd + '</b>。') + '<br>' +
        '<span style="color:var(--muted)">⚠️ 常見錯誤：把<b>分子</b>除以 ' + k1 + '。應該是分母乘上去。</span>'
    };
  }
});
