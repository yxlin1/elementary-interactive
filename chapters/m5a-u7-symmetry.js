/* ============================================================
   教具 m5a-u7　線對稱圖形
   南一 115：五上 第 5 單元
   課綱 S-5-4「線對稱：線對稱的意義。「對稱軸」、「對稱點」、「對稱邊」、
                「對稱角」。由操作活動知道特殊平面圖形的線對稱性質。
                利用線對稱做簡單幾何推理。製作或繪製線對稱圖形。」
        備註：在教學呈現時，線對稱軸應為垂直或平行（操作活動不在此限）。
   ============================================================ */

Kit.register('m5a-u7', {

  intro: '兩個模式：<b>自己畫</b>——點左半邊的格子，右半邊會自動鏡射；<b>認識圖形</b>——看常見圖形各有幾條對稱軸。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 340);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'draw', shapeKey = 'square', showAxes = true;

    /* ---------- 模式 A：格點鏡射 ---------- */
    const COLS = 14, ROWS = 10, CELL = 30;
    const GX = (620 - COLS * CELL) / 2, GY = 26;
    const half = COLS / 2;
    let cells = {};   // "c,r" -> true（只存左半邊）

    function paintDraw() {
      const ctx = cv.ctx;
      // 格線
      ctx.strokeStyle = '#1b2740'; ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath(); ctx.moveTo(GX + c * CELL, GY); ctx.lineTo(GX + c * CELL, GY + ROWS * CELL); ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(GX, GY + r * CELL); ctx.lineTo(GX + COLS * CELL, GY + r * CELL); ctx.stroke();
      }
      // 已塗的格子（左半 + 鏡射的右半）
      Object.keys(cells).forEach(k => {
        const [c, r] = k.split(',').map(Number);
        ctx.fillStyle = '#4da3ff';
        ctx.fillRect(GX + c * CELL + 1, GY + r * CELL + 1, CELL - 2, CELL - 2);
        const mc = COLS - 1 - c;      // 鏡射欄位
        ctx.fillStyle = '#7c5cff';
        ctx.fillRect(GX + mc * CELL + 1, GY + r * CELL + 1, CELL - 2, CELL - 2);
      });
      // 對稱軸
      const ax = GX + half * CELL;
      ctx.save(); ctx.setLineDash([8, 5]);
      ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, GY - 10); ctx.lineTo(ax, GY + ROWS * CELL + 10); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fb7185'; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('對稱軸', ax, GY + ROWS * CELL + 14);
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('← 點這邊的格子', GX + 6, GY + ROWS * CELL + 14);
      ctx.textAlign = 'right';
      ctx.fillText('這邊自動出現 →', GX + COLS * CELL - 6, GY + ROWS * CELL + 14);

      const n = Object.keys(cells).length;
      readout.innerHTML =
        '<div class="big">已塗 ' + n + ' 格，鏡射後共 ' + n * 2 + ' 格</div>' +
        '每點一格，<b>對稱軸另一邊的同一列</b>就會出現一格——這一對就叫做<b>對稱點</b>。<br>' +
        '對稱點的特徵：到對稱軸的<b>距離一樣遠</b>，而且連線<b>垂直於對稱軸</b>。<br>' +
        '<span style="color:var(--muted)">把紙沿著對稱軸對摺，兩邊會完全疊在一起——這就是線對稱的定義。' +
        '課綱除了對稱點，還要認識<b>對稱邊</b>（長度相等）和<b>對稱角</b>（角度相等）。</span>';
    }

    /* ---------- 模式 B：常見圖形的對稱軸 ---------- */
    const SHAPES = {
      eqtri:  { n: '正三角形',   axes: 3,  pts: [[0, -1], [0.866, 0.5], [-0.866, 0.5]] },
      isotri: { n: '等腰三角形', axes: 1,  pts: [[0, -1], [0.7, 0.7], [-0.7, 0.7]] },
      scatri: { n: '一般三角形', axes: 0,  pts: [[-0.2, -1], [0.9, 0.6], [-0.9, 0.6]] },
      square: { n: '正方形',     axes: 4,  pts: [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]] },
      rect:   { n: '長方形',     axes: 2,  pts: [[-1, -0.6], [1, -0.6], [1, 0.6], [-1, 0.6]] },
      rhomb:  { n: '菱形',       axes: 2,  pts: [[0, -1], [0.75, 0], [0, 1], [-0.75, 0]] },
      para:   { n: '平行四邊形', axes: 0,  pts: [[-0.6, -0.6], [1, -0.6], [0.6, 0.6], [-1, 0.6]] },
      kite:   { n: '箏形',       axes: 1,  pts: [[0, -1], [0.65, -0.1], [0, 0.95], [-0.65, -0.1]] },
      isotrap:{ n: '等腰梯形',   axes: 1,  pts: [[-0.5, -0.6], [0.5, -0.6], [1, 0.6], [-1, 0.6]] },
      trap:   { n: '一般梯形',   axes: 0,  pts: [[-0.7, -0.6], [0.3, -0.6], [1, 0.6], [-1, 0.6]] },
      pent:   { n: '正五邊形',   axes: 5,  pts: null, reg: 5 },
      hex:    { n: '正六邊形',   axes: 6,  pts: null, reg: 6 },
      circle: { n: '圓',         axes: -1, pts: null }
    };

    function paintShape() {
      const ctx = cv.ctx, cx = 300, cy = 165, R = 118;
      const s = SHAPES[shapeKey];
      let pts = s.pts;
      if (s.reg) {
        pts = Array.from({ length: s.reg }, (_, i) => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / s.reg;
          return [Math.cos(a), Math.sin(a)];
        });
      }

      if (shapeKey === 'circle') {
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(77,163,255,.35)'; ctx.fill();
        ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 3; ctx.stroke();
        if (showAxes) {
          ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.5;
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 12;
            ctx.beginPath();
            ctx.moveTo(cx - Math.cos(a) * (R + 14), cy - Math.sin(a) * (R + 14));
            ctx.lineTo(cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14));
            ctx.stroke();
          }
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        pts.forEach((p, i) => {
          const x = cx + p[0] * R, y = cy + p[1] * R;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(77,163,255,.35)'; ctx.fill();
        ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 3; ctx.stroke();
        pts.forEach(p => {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(cx + p[0] * R, cy + p[1] * R, 4, 0, Math.PI * 2); ctx.fill();
        });

        if (showAxes && s.axes > 0) {
          ctx.save(); ctx.setLineDash([7, 5]); ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2.5;
          axesOf(shapeKey, s, pts).forEach(a => {
            ctx.beginPath();
            ctx.moveTo(cx + a[0] * R * 1.25, cy + a[1] * R * 1.25);
            ctx.lineTo(cx - a[0] * R * 1.25, cy - a[1] * R * 1.25);
            ctx.stroke();
          });
          ctx.restore();
        }
      }

      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(s.n, cx, cy + R + 34);

      readout.innerHTML =
        '<div class="big">' + s.n + ' 有 <b>' +
        (s.axes < 0 ? '無限多' : s.axes) + '</b> 條對稱軸' +
        (s.axes === 0 ? '　<span style="color:var(--no)">（不是線對稱圖形）</span>' : '') + '</div>' +
        explain(shapeKey) +
        '<br><span style="color:var(--muted)">檢查方法：想像沿著紅色虛線對摺，兩邊要完全疊合才算。' +
        '可以真的拿張紙剪一個來對摺看看——課綱要的就是這種<b>操作活動</b>。</span>';
    }

    function axesOf(key, s, pts) {
      // 回傳每條對稱軸的方向向量
      if (s.reg) {
        const k = s.reg, out = [];
        for (let i = 0; i < k; i++) {
          const a = -Math.PI / 2 + i * Math.PI / k;
          out.push([Math.cos(a), Math.sin(a)]);
        }
        return out;
      }
      const V = [0, 1], H = [1, 0];
      const D1 = [0.707, 0.707], D2 = [0.707, -0.707];
      if (key === 'eqtri') return [[0, 1], [0.866, -0.5], [-0.866, -0.5]];
      if (key === 'isotri' || key === 'kite' || key === 'isotrap') return [V];
      if (key === 'square') return [V, H, D1, D2];
      if (key === 'rect' || key === 'rhomb') return [V, H];
      return [];
    }

    function explain(key) {
      const m = {
        eqtri: '三個邊一樣長、三個角一樣大，所以從<b>每個頂點</b>往對邊中點各有一條對稱軸，共 3 條。',
        isotri: '只有兩腰相等，對稱軸從<b>頂角</b>往底邊中點，只有 1 條。',
        scatri: '三邊都不一樣長，怎麼摺都疊不起來。',
        square: '正方形是最「對稱」的四邊形：兩條<b>垂直平分線</b>＋兩條<b>對角線</b>，共 4 條。',
        rect: '只有兩條<b>垂直平分線</b>。⚠️ 長方形的<b>對角線不是</b>對稱軸——沿對角線摺會歪掉，這是最常錯的地方。',
        rhomb: '菱形四邊等長，兩條<b>對角線</b>都是對稱軸，共 2 條。⚠️ 但菱形的垂直平分線<b>不是</b>對稱軸。',
        para: '平行四邊形<b>不是</b>線對稱圖形（除非它剛好是長方形或菱形）。它有的是「旋轉 180° 會重合」，那叫點對稱，不是線對稱。',
        kite: '箏形有兩組相鄰邊等長，只有<b>一條</b>對角線是對稱軸。（課綱說「箏形指圖形，名詞不出現」，知道形狀就好。）',
        isotrap: '等腰梯形的對稱軸是<b>上下底的垂直平分線</b>，1 條。',
        trap: '一般梯形兩腰不等長，不是線對稱圖形。',
        pent: '正五邊形每個頂點對到一條對稱軸，共 5 條。',
        hex: '正六邊形有 3 條「頂點對頂點」＋ 3 條「邊中點對邊中點」，共 6 條。',
        circle: '圓有<b>無限多</b>條對稱軸——任何一條通過圓心的直線都是。'
      };
      return m[key] || '';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'draw') paintDraw(); else paintShape();
    }

    cv.canvas.addEventListener('click', function (e) {
      if (mode !== 'draw') return;
      const rect = cv.canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * cv.W / rect.width;
      const sy = (e.clientY - rect.top) * cv.H / rect.height;
      const c = Math.floor((sx - GX) / CELL), r = Math.floor((sy - GY) / CELL);
      if (c < 0 || c >= half || r < 0 || r >= ROWS) return;   // 只能點左半邊
      const k = c + ',' + r;
      if (cells[k]) delete cells[k]; else cells[k] = true;
      paint();
    });

    const modeSeg = Kit.segmented('模式', [
      { label: '自己畫（點格子）', value: 'draw' },
      { label: '認識圖形的對稱軸', value: 'shape' }
    ], function (v) {
      mode = v;
      shapeSeg.wrap.style.display = v === 'shape' ? '' : 'none';
      axBtn.style.display = v === 'shape' ? '' : 'none';
      clearBtn.style.display = v === 'draw' ? '' : 'none';
      paint();
    }, mode);

    const shapeSeg = Kit.segmented('圖形', Object.keys(SHAPES).map(k => ({ label: SHAPES[k].n, value: k })),
      function (v) { shapeKey = v; paint(); }, shapeKey);
    shapeSeg.wrap.style.display = 'none';

    const axBtn = Kit.button('顯示／隱藏對稱軸', function () { showAxes = !showAxes; paint(); });
    axBtn.style.display = 'none';
    const clearBtn = Kit.button('清空', function () { cells = {}; paint(); });

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(shapeSeg.wrap);
    controls.appendChild(axBtn);
    controls.appendChild(clearBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱備註：教學時對稱軸<b>應呈現為垂直或平行</b>（斜的對稱軸留給操作活動）。' +
        '所以「自己畫」模式的對稱軸固定是垂直的，先把基本概念建立起來。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '自己畫模式：點幾格後問「右邊的格子是怎麼決定的？」', why: '和左邊那格<b>離對稱軸一樣遠</b>、在<b>同一列</b>。這一句就是對稱點的定義，比背定義有效。' },
    { ask: '「長方形沿對角線摺，會疊得起來嗎？」', why: '不會，會歪掉。這是這一單元<b>最常錯</b>的一題。切到「長方形」模式，看對稱軸只有兩條（沒有對角線）。' },
    { ask: '「平行四邊形是線對稱圖形嗎？」', why: '不是。它轉 180° 會重合（點對稱），但怎麼摺都疊不起來。這兩件事很容易混。' },
    { ask: '「正方形和菱形都有對角線對稱軸，差在哪？」', why: '正方形<b>四條</b>都有（兩對角線＋兩垂直平分線），菱形<b>只有對角線兩條</b>。可以來回切換比較。' },
    { ask: '拿紙實作：對摺後剪一刀，打開看是什麼？', why: '課綱要的「操作活動」。剪紙打開一定是線對稱圖形，摺痕就是對稱軸。這個活動五分鐘就能做，效果最好。' }
  ],

  pitfalls: [
    { bad: '以為長方形的<b>對角線</b>是對稱軸。', fix: '不是。沿對角線摺會歪掉。長方形只有 2 條對稱軸（兩組對邊的垂直平分線）。' },
    { bad: '以為平行四邊形是線對稱圖形。', fix: '不是。它是<b>旋轉 180° 會重合</b>（點對稱），不是線對稱。除非它剛好是長方形或菱形。' },
    { bad: '以為菱形的水平／垂直中線是對稱軸。', fix: '菱形的對稱軸是<b>兩條對角線</b>，不是中線。（正方形才兩種都有。）' },
    { bad: '把「對稱軸」數量算錯，正六邊形只數 3 條。', fix: '正 n 邊形有 <b>n</b> 條對稱軸。正六邊形：3 條頂點對頂點 ＋ 3 條邊中點對邊中點 ＝ 6 條。' },
    { bad: '以為對稱點的連線可以斜斜的。', fix: '對稱點的連線一定<b>垂直</b>於對稱軸，而且被對稱軸<b>平分</b>。' }
  ],

  quiz: function () {
    const type = Kit.pick(['count', 'yesno', 'trap', 'reg']);

    if (type === 'count') {
      const items = [['正方形', 4], ['長方形', 2], ['菱形', 2], ['等腰三角形', 1],
                     ['正三角形', 3], ['等腰梯形', 1], ['正五邊形', 5], ['正六邊形', 6], ['正八邊形', 8]];
      const it = Kit.pick(items);
      return {
        q: '<b>' + it[0] + '</b> 有幾條對稱軸？',
        input: 'number', answer: it[1], unit: '條',
        steps: '<b>' + it[0] + '：' + it[1] + ' 條</b><br>' +
          '整理一下常見的：<br>' +
          '正三角形 3、等腰三角形 1、一般三角形 0<br>' +
          '正方形 4、長方形 2、菱形 2、平行四邊形 0<br>' +
          '等腰梯形 1、一般梯形 0、箏形 1<br>' +
          '正 n 邊形 ＝ <b>n</b> 條、圓 ＝ 無限多條'
      };
    }

    if (type === 'yesno') {
      const items = [['平行四邊形（非長方形、非菱形）', false], ['等腰梯形', true],
                     ['一般三角形', false], ['菱形', true], ['圓', true], ['一般梯形', false]];
      const it = Kit.pick(items);
      return {
        q: '<b>' + it[0] + '</b> 是線對稱圖形嗎？',
        choices: ['是線對稱圖形', '不是線對稱圖形'], answer: it[1] ? 0 : 1,
        steps: (it[1] ? '<b>是。</b>' : '<b>不是。</b>') + '判斷法：能不能沿一條直線<b>對摺後完全疊合</b>。<br>' +
          (it[0].indexOf('平行四邊形') === 0
            ? '平行四邊形怎麼摺都疊不起來。它有的是「旋轉 180° 會重合」，那是<b>點對稱</b>，不是線對稱。'
            : it[1] ? '沿著對稱軸摺，兩邊剛好蓋住。' : '各邊長度不同，找不到能疊合的摺線。')
      };
    }

    if (type === 'trap') {
      const opts = Kit.shuffle([
        { t: '2 條（兩組對邊的垂直平分線）', ok: true },
        { t: '4 條（含兩條對角線）', ok: false },
        { t: '1 條', ok: false },
        { t: '0 條', ok: false }
      ]);
      return {
        q: '<b>長方形</b>（不是正方形）有幾條對稱軸？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '長方形只有 <b>2 條</b>：長邊的垂直平分線、短邊的垂直平分線。<br>' +
          '⚠️ <b>對角線不是對稱軸</b>——沿對角線摺，兩個三角形形狀一樣但方向不對，疊不起來。<br>' +
          '只有<b>正方形</b>的對角線才是對稱軸（因為四邊等長）。'
      };
    }

    const k = Kit.pick([5, 6, 7, 8, 9, 10, 12]);
    return {
      q: '<b>正 ' + k + ' 邊形</b>有幾條對稱軸？',
      input: 'number', answer: k, unit: '條',
      steps: '正 n 邊形有 <b>n</b> 條對稱軸，所以正 ' + k + ' 邊形有 <b>' + k + '</b> 條。<br>' +
        (k % 2 === 0
          ? k + ' 是偶數：' + (k / 2) + ' 條「頂點對頂點」＋ ' + (k / 2) + ' 條「邊中點對邊中點」＝ ' + k + ' 條。'
          : k + ' 是奇數：每條都是「一個頂點對到對邊的中點」，' + k + ' 個頂點就 ' + k + ' 條。')
    };
  }
});
