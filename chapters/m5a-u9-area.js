/* ============================================================
   教具 m5a-u9　面積
   南一 115：五上 第 8 單元「平行四邊形、三角形和梯形的面積」
   課綱 S-5-2「三角形與四邊形的面積：操作活動與推理。
                利用切割重組，建立面積公式，並能應用。」
   教具：把平行四邊形／三角形／梯形，用「剪一刀移過去」或
         「複製一份轉 180°」變成長方形或平行四邊形，
         公式就自己跑出來了。
   ============================================================ */

Kit.register('m5a-u9', {

  intro: '拖曳「重組進度」，看圖形怎麼變成已經會算的長方形。公式不是背來的，是這樣「剪下來、搬過去」推出來的。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 340);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let shape = 'para';       // para | tri | trap
    let B = 8, T = 4, Hh = 5, skew = 3;
    let t = 0;                // 重組進度 0~1

    let OX = 46, OY = 290, U = 26;     // 原點與每單位像素（U 依圖形大小自動縮放）
    const P = (x, y) => [OX + x * U, OY - y * U];

    // 重組後的複製件會往右長出一大塊，固定比例會畫到畫布外，所以每次重畫都重算縮放
    function fitScale(maxX, maxY) {
      U = Math.min(30, (cv.W - 76) / (maxX + 1.8), (cv.H - 62) / (maxY + 1.8));
      OY = cv.H - 42;
    }

    function poly(ctx, pts, fill, stroke, dash) {
      ctx.beginPath();
      pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) {
        ctx.save();
        if (dash) ctx.setLineDash(dash);
        ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
    }

    function lerpPts(from, to, k) { return from.map((p, i) => [p[0] + (to[i][0] - p[0]) * k, p[1] + (to[i][1] - p[1]) * k]); }

    function grid(ctx, gx, gy) {
      ctx.strokeStyle = '#1b2740'; ctx.lineWidth = 1;
      for (let x = 0; x <= gx; x++) {
        const a = P(x, 0), b = P(x, gy);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      for (let y = 0; y <= gy; y++) {
        const a = P(0, y), b = P(gx, y);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }

    function dim(ctx, x1, y1, x2, y2, text, color) {
      const a = P(x1, y1), b = P(x2, y2);
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 12);
    }

    function paint() {
      // 先把可調參數夾到合法範圍：傾斜量若超過底邊，剪下來的三角形會比原圖形還大，圖會壞掉
      const s = Math.min(skew, B);                        // 平行四邊形：傾斜量 ≤ 底
      const apex = Math.min(skew, B);                     // 三角形：尖端位置 ≤ 底
      const x1 = Math.min(skew, Math.max(B - T, 0));      // 梯形：上底起點
      // 重組後複製件往右延伸到的最遠處
      const maxX = shape === 'para' ? B + s : shape === 'tri' ? B + apex : B + x1 + T;
      fitScale(maxX, Hh);

      cv.clear('#0e1726');
      const ctx = cv.ctx;
      grid(ctx, Math.ceil(maxX) + 1, Math.ceil(Hh) + 1);

      const BLUE = 'rgba(77,163,255,.55)', PURPLE = 'rgba(124,92,255,.55)';
      let area, formula, story;

      if (shape === 'para') {
        const main = [[s, 0], [B, 0], [B + s, Hh], [s, Hh]];        // 剪掉左三角後剩下的
        const triFrom = [[0, 0], [s, 0], [s, Hh]];
        const triTo = triFrom.map(p => [p[0] + B, p[1]]);
        poly(ctx, main, BLUE, '#4da3ff');
        poly(ctx, lerpPts(triFrom, triTo, t), PURPLE, '#7c5cff');
        if (t > .02) poly(ctx, triFrom, null, '#3a4c73', [4, 4]);   // 原位置虛線
        dim(ctx, s, -0.6, B + s, -0.6, '底 = ' + B, '#4da3ff');
        dim(ctx, s - 0.55, 0, s - 0.55, Hh, '高 = ' + Hh, '#34d399');
        area = B * Hh;
        formula = '平行四邊形面積 = <b>底 × 高</b> = ' + B + ' × ' + Hh + ' = <b>' + area + '</b> 平方公分';
        story = '把左邊那塊三角形<b>剪下來、平移到右邊</b>，就變成一個長 ' + B + '、寬 ' + Hh + ' 的長方形。面積完全沒變，所以平行四邊形的面積就是「底 × 高」。';

      } else if (shape === 'tri') {
        const tri = [[0, 0], [B, 0], [apex, Hh]];
        const M = [(B + apex) / 2, Hh / 2];
        poly(ctx, tri, BLUE, '#4da3ff');
        // 複製一份繞右邊中點轉 180°
        const ang = Math.PI * t;
        const copy = tri.map(p => {
          const dx = p[0] - M[0], dy = p[1] - M[1];
          const c = Math.cos(ang), sn = Math.sin(ang);
          return [M[0] + dx * c - dy * sn, M[1] + dx * sn + dy * c];
        });
        poly(ctx, copy, PURPLE, '#7c5cff');
        ctx.fillStyle = '#fbbf24';
        const mp = P(M[0], M[1]);
        ctx.beginPath(); ctx.arc(mp[0], mp[1], 4, 0, Math.PI * 2); ctx.fill();
        dim(ctx, 0, -0.6, B, -0.6, '底 = ' + B, '#4da3ff');
        dim(ctx, -0.55, 0, -0.55, Hh, '高 = ' + Hh, '#34d399');
        area = B * Hh / 2;
        formula = '三角形面積 = <b>底 × 高 ÷ 2</b> = ' + B + ' × ' + Hh + ' ÷ 2 = <b>' + area + '</b> 平方公分';
        story = '再<b>複製一個一模一樣的三角形</b>，繞著黃點轉 180°，兩個合起來剛好是一個平行四邊形（底 ' + B + '、高 ' + Hh + '）。所以一個三角形是它的一半 → 要「÷ 2」。';

      } else {
        const trap = [[0, 0], [B, 0], [x1 + T, Hh], [x1, Hh]];
        const M = [(B + x1 + T) / 2, Hh / 2];
        poly(ctx, trap, BLUE, '#4da3ff');
        const ang = Math.PI * t;
        const copy = trap.map(p => {
          const dx = p[0] - M[0], dy = p[1] - M[1];
          const c = Math.cos(ang), sn = Math.sin(ang);
          return [M[0] + dx * c - dy * sn, M[1] + dx * sn + dy * c];
        });
        poly(ctx, copy, PURPLE, '#7c5cff');
        ctx.fillStyle = '#fbbf24';
        const mp = P(M[0], M[1]);
        ctx.beginPath(); ctx.arc(mp[0], mp[1], 4, 0, Math.PI * 2); ctx.fill();
        dim(ctx, 0, -0.6, B, -0.6, '下底 = ' + B, '#4da3ff');
        dim(ctx, x1, Hh + 0.55, x1 + T, Hh + 0.55, '上底 = ' + T, '#fb7185');
        dim(ctx, -0.55, 0, -0.55, Hh, '高 = ' + Hh, '#34d399');
        area = (B + T) * Hh / 2;
        formula = '梯形面積 = <b>（上底 ＋ 下底）× 高 ÷ 2</b> = (' + T + ' ＋ ' + B + ') × ' + Hh + ' ÷ 2 = <b>' + area + '</b> 平方公分';
        story = '複製一個梯形轉 180° 拼上去，變成一個平行四邊形，它的底是「上底 ＋ 下底」＝ ' + (T + B) + '，高還是 ' + Hh + '。一個梯形是它的一半 → 「÷ 2」。';
      }

      readout.innerHTML = '<div class="big">' + formula + '</div>' + story +
        '<br><span style="color:var(--muted)">重組進度：' + Math.round(t * 100) + '%　（把滑桿拉到 100% 看完整結果）</span>';
    }

    const shapeSeg = Kit.segmented('圖形', [
      { label: '平行四邊形', value: 'para' },
      { label: '三角形', value: 'tri' },
      { label: '梯形', value: 'trap' }
    ], function (v) {
      shape = v;
      topCtl.wrap.style.display = (v === 'trap') ? '' : 'none';
      skewCtl.wrap.querySelector('.ctl-label').textContent =
        v === 'tri' ? '尖端位置' : v === 'para' ? '傾斜量' : '上底位置';
      t = 0; tCtl.input.value = 0; tCtl.output.textContent = '0%';
      paint();
    }, shape);

    const bCtl = Kit.slider('底（下底）', { min: 3, max: 12, value: B, format: v => v + ' 公分', onChange: v => { B = v; paint(); } });
    const topCtl = Kit.slider('上底', { min: 1, max: 10, value: T, format: v => v + ' 公分', onChange: v => { T = v; paint(); } });
    const hCtl = Kit.slider('高', { min: 2, max: 8, value: Hh, format: v => v + ' 公分', onChange: v => { Hh = v; paint(); } });
    const skewCtl = Kit.slider('傾斜量', { min: 0, max: 6, value: skew, onChange: v => { skew = v; paint(); } });
    const tCtl = Kit.slider('重組進度', {
      min: 0, max: 100, value: 0, format: v => v + '%',
      onChange: v => { t = v / 100; paint(); }
    });
    topCtl.wrap.style.display = 'none';

    const playBtn = Kit.button('▶ 自動重組', function () {
      const t0 = performance.now(), from = t, to = t > .5 ? 0 : 1;
      (function step(now) {
        const k = Math.min((now - t0) / 1100, 1);
        const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        t = from + (to - from) * e;
        tCtl.input.value = t * 100;
        tCtl.output.textContent = Math.round(t * 100) + '%';
        paint();
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, 'primary');

    controls.appendChild(shapeSeg.wrap);
    controls.appendChild(bCtl.wrap);
    controls.appendChild(topCtl.wrap);
    controls.appendChild(hCtl.wrap);
    controls.appendChild(skewCtl.wrap);
    controls.appendChild(tCtl.wrap);
    controls.appendChild(playBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '注意「高」永遠是<b>垂直</b>的那一段（綠色虛線），不是斜邊。把「傾斜量」拉大，斜邊變長但高沒變，面積也沒變——這是最容易錯的地方。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '先玩平行四邊形：「剪下來搬過去，面積有變多嗎？」', why: '沒有。這是整個單元的核心觀念——<b>切割重組不改變面積</b>。孩子接受這一點，後面三個公式都不用背。' },
    { ask: '「為什麼三角形要除以 2？」', why: '按「自動重組」讓他看兩個一樣的三角形拼成平行四邊形。答案是「因為它剛好是平行四邊形的一半」，不是「老師說要除以 2」。' },
    { ask: '把「傾斜量」拉到最大，問「斜邊變長了，面積有變大嗎？」', why: '沒有。這一題可以直接治好「用斜邊當高」的毛病。面積只跟<b>底</b>和<b>垂直的高</b>有關。' },
    { ask: '梯形：「這個平行四邊形的底是多少？」', why: '上底 ＋ 下底。看得到這一步，「(上底＋下底)×高÷2」就變成看圖說故事，不是咒語。' },
    { ask: '「如果上底和下底一樣長，梯形會變成什麼？」', why: '平行四邊形。而且套梯形公式 (a+a)×h÷2 = a×h，和平行四邊形公式一樣。公式之間是相通的，這個發現很有成就感。' }
  ],

  pitfalls: [
    { bad: '算平行四邊形面積時用<b>斜邊</b>當高。', fix: '高一定是<b>垂直</b>於底的那一段。拉「傾斜量」看：斜邊變長，但高和面積都沒變。' },
    { bad: '三角形忘記除以 2。', fix: '兩個一樣的三角形才拼成一個平行四邊形，所以一個只有一半。算完先問自己「有沒有除以 2？」' },
    { bad: '梯形把「上底 ＋ 下底」寫成「上底 × 下底」。', fix: '拼起來的平行四邊形，底是兩個底<b>接在一起</b>，所以是「＋」不是「×」。' },
    { bad: '面積和周長混用，算面積卻把四邊加起來。', fix: '周長＝繞一圈的長度（公分）；面積＝裡面有幾格（平方公分）。先看單位就知道要算哪一個。' },
    { bad: '邊長是小數或分數時直接下手算。', fix: '課綱規定這類題目要<b>先教完分數、小數乘法之後</b>才處理（N-5-5、N-5-8）。如果孩子還沒學到，先用整數邊長練熟。', src: 'S-5-2 備註' }
  ],

  quiz: function () {
    const kind = Kit.pick(['para', 'tri', 'trap', 'why']);
    const b = Kit.randInt(4, 15), h = Kit.randInt(3, 12), tt = Kit.randInt(2, b - 1);

    if (kind === 'para') {
      const slant = h + Kit.randInt(1, 4);
      return {
        q: '一個平行四邊形，底 <b>' + b + '</b> 公分，高 <b>' + h + '</b> 公分，斜邊 ' + slant + ' 公分。面積是多少平方公分？',
        input: 'number', answer: b * h, unit: '平方公分',
        steps: '平行四邊形面積 = 底 × <b>高</b>（不是斜邊！）<br>' + b + ' × ' + h + ' = <b>' + b * h + '</b> 平方公分。<br>' +
          '題目給的斜邊 ' + slant + ' 公分是<b>陷阱</b>，用不到。'
      };
    }

    if (kind === 'tri') {
      return {
        q: '一個三角形，底 <b>' + b + '</b> 公分，高 <b>' + h + '</b> 公分。面積是多少平方公分？',
        input: 'number', answer: b * h / 2, tolerance: 0.001, unit: '平方公分',
        steps: '兩個一樣的三角形可以拼成一個平行四邊形（底 ' + b + '、高 ' + h + '），面積 ' + b * h + '。<br>' +
          '一個三角形是它的一半：' + b + ' × ' + h + ' ÷ 2 = <b>' + (b * h / 2) + '</b> 平方公分。'
      };
    }

    if (kind === 'trap') {
      const ans = (b + tt) * h / 2;
      return {
        q: '一個梯形，上底 <b>' + tt + '</b> 公分，下底 <b>' + b + '</b> 公分，高 <b>' + h + '</b> 公分。面積是多少平方公分？',
        input: 'number', answer: ans, tolerance: 0.001, unit: '平方公分',
        steps: '複製一個梯形轉 180° 拼上去 → 平行四邊形，底 = ' + tt + ' ＋ ' + b + ' = <b>' + (tt + b) + '</b>，高 = ' + h + '。<br>' +
          '平行四邊形面積 = ' + (tt + b) + ' × ' + h + ' = ' + ((tt + b) * h) + '，梯形是一半：<br>' +
          '(' + tt + ' ＋ ' + b + ') × ' + h + ' ÷ 2 = <b>' + ans + '</b> 平方公分。'
      };
    }

    const opts = Kit.shuffle([
      { t: '因為兩個一樣的三角形剛好拼成一個平行四邊形', ok: true },
      { t: '因為三角形只有三個邊，四邊形有四個邊', ok: false },
      { t: '因為公式規定要除以 2', ok: false },
      { t: '因為三角形的高只有一半', ok: false }
    ]);
    return {
      q: '三角形面積為什麼要「<b>÷ 2</b>」？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '把一個三角形<b>複製一份轉 180°</b>拼上去，會得到一個平行四邊形，底和高都跟原來的三角形一樣。<br>' +
        '平行四邊形面積 = 底 × 高，而三角形只是它的<b>一半</b>，所以要再 ÷ 2。'
    };
  }
});
