/* ============================================================
   五上 數學（南一）第 1 單元　折線圖
   課綱 D-5-1「製作折線圖：製作生活中的折線圖。」
        備註：分辨折線圖之使用時機。
   （四年級已學過報讀長條圖與折線圖 D-4-1，這一單元的重點是「自己畫」
     以及「什麼時候該用折線圖、什麼時候該用長條圖」。）
   ============================================================ */

Kit.register('n5a-u1', {

  intro: '同一組資料，用<b>長條圖</b>和<b>折線圖</b>畫出來看看差在哪。切到「自己畫」可以拖曳每個點，體會折線圖是怎麼一點一點連起來的。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 340);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* 兩組資料：一組有序（適合折線），一組分類（不適合折線） */
    const SETS = {
      temp: {
        n: '一天的氣溫', unit: '°C',
        labels: ['6時', '8時', '10時', '12時', '14時', '16時', '18時', '20時'],
        data: [21, 23, 27, 30, 32, 30, 27, 24],
        ordered: true,
        why: '時間是<b>有順序、連續</b>的：8 時到 10 時之間氣溫一直存在，只是我們沒有記錄。' +
          '折線把中間補起來，剛好表達「持續在變」。'
      },
      plant: {
        n: '豆苗每天的高度', unit: '公分',
        labels: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天'],
        data: [0, 1, 3, 6, 10, 13, 15],
        ordered: true,
        why: '生長是<b>連續</b>發生的，用折線圖最能看出「哪幾天長得最快」——就是線最陡的那一段。'
      },
      fruit: {
        n: '全班最喜歡的水果', unit: '人',
        labels: ['蘋果', '香蕉', '西瓜', '葡萄', '芒果'],
        data: [8, 5, 11, 4, 7],
        ordered: false,
        why: '⚠️ 水果之間<b>沒有順序</b>，「蘋果和香蕉中間」不存在任何東西。' +
          '硬把它們連起來，那條斜線<b>沒有任何意義</b>——這種資料只能用長條圖。'
      },
      score: {
        n: '五次小考成績', unit: '分',
        labels: ['第1次', '第2次', '第3次', '第4次', '第5次'],
        data: [72, 78, 75, 85, 92],
        ordered: true,
        why: '考試次序是有順序的，用折線圖可以一眼看出<b>進步的趨勢</b>。'
      }
    };

    let key = 'temp', chart = 'both', custom = null, drag = -1;

    function cur() { return SETS[key]; }
    function values() { return custom || cur().data; }

    /* 座標換算 */
    const PAD_L = 62, PAD_R = 24, PAD_T = 48, PAD_B = 62;
    function plotBox() {
      return { x: PAD_L, y: PAD_T, w: cv.W - PAD_L - PAD_R, h: cv.H - PAD_T - PAD_B };
    }
    function scaleY() {
      const v = values();
      const max = Math.max.apply(null, v);
      const step = max <= 20 ? 5 : max <= 60 ? 10 : 20;
      return { top: Math.ceil((max * 1.15) / step) * step, step: step };
    }
    function px(i) {
      const b = plotBox(), n = values().length;
      return b.x + b.w * (i + 0.5) / n;
    }
    function py(v) {
      const b = plotBox(), s = scaleY();
      return b.y + b.h * (1 - v / s.top);
    }

    function paint() {
      cv.clear('#0e1726');
      const ctx = cv.ctx, S = cur(), v = values(), b = plotBox(), sc = scaleY();

      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(S.n + '（' + S.unit + '）', 16, 26);
      if (!S.ordered) {
        ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.fillText('← 這組是「分類資料」，不適合折線圖', 200, 26);
      }

      // 格線與縱軸刻度
      ctx.strokeStyle = '#1b2740'; ctx.lineWidth = 1;
      for (let t = 0; t <= sc.top; t += sc.step) {
        const y = py(t);
        ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x + b.w, y); ctx.stroke();
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(t, b.x - 8, y);
      }
      // 軸線
      ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.stroke();

      // 長條圖
      if (chart === 'bar' || chart === 'both') {
        const bw = b.w / v.length * 0.5;
        v.forEach((val, i) => {
          ctx.fillStyle = chart === 'both' ? 'rgba(124,92,255,.34)' : 'rgba(124,92,255,.75)';
          ctx.fillRect(px(i) - bw / 2, py(val), bw, b.y + b.h - py(val));
        });
      }
      // 折線圖
      if (chart === 'line' || chart === 'both') {
        ctx.strokeStyle = S.ordered ? '#4da3ff' : '#fb7185';
        ctx.lineWidth = 3;
        ctx.beginPath();
        v.forEach((val, i) => { const x = px(i), y = py(val); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke();
        v.forEach((val, i) => {
          ctx.fillStyle = S.ordered ? '#4da3ff' : '#fb7185';
          ctx.beginPath(); ctx.arc(px(i), py(val), 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ctx.fillText(val, px(i), py(val) - 10);
        });
      }

      // 橫軸標籤
      S.labels.forEach((L, i) => {
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(L, px(i), b.y + b.h + 8);
      });

      if (custom) {
        ctx.fillStyle = '#fbbf24'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText('（可以直接拖曳圓點改變數值）', b.x + b.w, 26);
      }

      // 讀數
      const max = Math.max.apply(null, v), min = Math.min.apply(null, v);
      let big = 0, bigI = 1;
      for (let i = 1; i < v.length; i++) {
        if (Math.abs(v[i] - v[i - 1]) > Math.abs(big)) { big = v[i] - v[i - 1]; bigI = i; }
      }
      readout.innerHTML =
        '<div class="big">' + S.n + '　最高 <b>' + max + '</b>　最低 <b>' + min + '</b>　' +
        '變化最大：' + S.labels[bigI - 1] + '→' + S.labels[bigI] + '（' + (big > 0 ? '+' : '') + big + ' ' + S.unit + '）</div>' +
        S.why + '<br>' +
        '<span style="color:var(--muted)"><b>怎麼選圖表</b>：<br>' +
        '• 橫軸是<b>有順序、會連續變化</b>的（時間、天數、次數）→ 用<b>折線圖</b>，重點看「趨勢」<br>' +
        '• 橫軸是<b>分類</b>的（水果、顏色、班級）→ 用<b>長條圖</b>，重點看「誰多誰少」<br>' +
        '折線的<b>斜度</b>就是變化的快慢：越陡變化越快，水平代表沒變。</span>';
    }

    /* 拖曳改值（自己畫模式） */
    function pointerVal(e) {
      const r = cv.canvas.getBoundingClientRect();
      const sx = (e.clientX - r.left) * cv.W / r.width;
      const sy = (e.clientY - r.top) * cv.H / r.height;
      return { sx: sx, sy: sy };
    }
    cv.canvas.addEventListener('pointerdown', function (e) {
      if (!custom) return;
      const { sx, sy } = pointerVal(e);
      custom.forEach((val, i) => {
        if (Math.abs(sx - px(i)) < 18 && Math.abs(sy - py(val)) < 18) drag = i;
      });
      if (drag >= 0) cv.canvas.setPointerCapture(e.pointerId);
    });
    cv.canvas.addEventListener('pointermove', function (e) {
      if (drag < 0 || !custom) return;
      const { sy } = pointerVal(e), b = plotBox(), sc = scaleY();
      let v = Math.round((1 - (sy - b.y) / b.h) * sc.top);
      custom[drag] = Math.max(0, Math.min(sc.top, v));
      paint();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
      cv.canvas.addEventListener(ev, function () { drag = -1; }));

    const setSeg = Kit.segmented('資料', Object.keys(SETS).map(k => ({ label: SETS[k].n, value: k })),
      function (v) { key = v; custom = null; drawBtn.textContent = '✏️ 自己畫（可拖點）'; paint(); }, key);

    const chartSeg = Kit.segmented('圖表', [
      { label: '兩種一起比', value: 'both' },
      { label: '只看折線圖', value: 'line' },
      { label: '只看長條圖', value: 'bar' }
    ], function (v) { chart = v; paint(); }, chart);

    const drawBtn = Kit.button('✏️ 自己畫（可拖點）', function () {
      if (custom) { custom = null; drawBtn.textContent = '✏️ 自己畫（可拖點）'; }
      else { custom = cur().data.slice(); chart = 'line'; chartSeg.select('line'); drawBtn.textContent = '↩ 回到原始資料'; }
      paint();
    }, 'primary');

    controls.appendChild(setSeg.wrap);
    controls.appendChild(chartSeg.wrap);
    controls.appendChild(drawBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱 D-5-1 的重點是「<b>製作</b>生活中的折線圖」和「<b>分辨折線圖之使用時機</b>」——' +
        '不只是會看，還要知道<b>什麼時候不該用</b>。切到「全班最喜歡的水果」那一組就知道為什麼。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '「這兩種圖，哪一種比較容易看出『氣溫一直在升高』？」', why: '折線圖。長條圖要一根一根比高度，折線圖直接用一條線的走向告訴你趨勢。' },
    { ask: '切到「全班最喜歡的水果」：「這條線代表什麼意思？」', why: '<b>什麼都不代表</b>。蘋果和香蕉「中間」不存在任何東西。這一題就是課綱說的「分辨折線圖之使用時機」。' },
    { ask: '「哪一段長得最快？你怎麼知道？」（用豆苗那組）', why: '線最<b>陡</b>的那一段。學會用斜度讀變化快慢，之後自然科的速度、成長曲線都會用到。' },
    { ask: '按「自己畫」，讓孩子拖出「早上冷、中午熱、晚上again冷」的形狀。', why: '自己動手排一次，比看十張現成的圖有用。畫完問他：「這條線在說什麼故事？」' },
    { ask: '在家實做：記錄一週的氣溫（或身高、存款），週末一起畫成折線圖。', why: '課綱要的是「製作<b>生活中</b>的折線圖」。真的有自己的資料，孩子才會在意那條線。' }
  ],

  pitfalls: [
    { bad: '把<b>分類資料</b>（水果、顏色、交通工具）畫成折線圖。', fix: '分類之間沒有順序，連起來的線沒有意義。這種資料要用<b>長條圖</b>。', src: 'D-5-1 備註「分辨折線圖之使用時機」' },
    { bad: '縱軸不從 0 開始，或刻度間距不一樣大。', fix: '刻度必須<b>等距</b>。不從 0 開始會讓變化看起來比實際誇張——看新聞圖表時也要注意這點。' },
    { bad: '忘了標單位和標題，或橫軸沒寫清楚是什麼。', fix: '一張完整的統計圖要有：<b>標題、橫軸名稱、縱軸名稱與單位</b>。少一樣別人就看不懂。' },
    { bad: '以為折線圖上兩點之間的線代表「真的量過」。', fix: '中間那段是<b>推測</b>的連接。折線圖適合連續變化的量，但線上的位置不等於實際測量值。' },
    { bad: '看到線往下就說「數量變成負的」。', fix: '往下只代表<b>比前一個少</b>，不是負數。要看縱軸的實際刻度。' }
  ],

  quiz: function () {
    const type = Kit.pick(['which', 'which', 'read', 'trend', 'rule']);

    if (type === 'which') {
      const items = [
        { d: '一天中每小時的氣溫變化', a: '折線圖' },
        { d: '全班最喜歡的顏色統計', a: '長條圖' },
        { d: '豆苗連續七天的高度', a: '折線圖' },
        { d: '各班的人數比較', a: '長條圖' },
        { d: '五次段考的成績變化', a: '折線圖' },
        { d: '不同交通工具的使用人數', a: '長條圖' },
        { d: '一週每天的用電量變化', a: '折線圖' },
        { d: '五種寵物各有幾人飼養', a: '長條圖' }
      ];
      const it = Kit.pick(items);
      const opts = ['折線圖', '長條圖'];
      return {
        /* 八個情境是同一種題目樣板，換的是情境；不給 tpl 的話會被算成八種，
           首頁的樣板數會隨機在 11～13 之間跳動。 */
        tpl: 'chartType',
        q: '要呈現「<b>' + it.d + '</b>」，用哪一種圖比較合適？',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '判斷方法：看<b>橫軸</b>是什麼。<br>' +
          '• 橫軸是<b>有順序、連續</b>的（時間、天數、第幾次）→ <b>折線圖</b>，看趨勢<br>' +
          '• 橫軸是<b>分類</b>的（顏色、水果、班級）→ <b>長條圖</b>，比多少<br>' +
          '<span style="color:var(--muted)">分類資料連成折線沒有意義——「紅色和藍色中間」不存在任何東西。</span>'
      };
    }

    if (type === 'read') {
      const base = Kit.randInt(18, 26);
      const arr = [base, base + 2, base + 6, base + 9, base + 7, base + 3];
      const hours = ['6時', '8時', '10時', '12時', '14時', '16時'];
      const i = Kit.randInt(0, 5);
      return {
        q: '某天的氣溫紀錄（°C）：' + hours.map((h, k) => h + ' ' + arr[k]).join('、') +
          '<br>請問 <b>' + hours[i] + '</b> 的氣溫是幾度？',
        input: 'number', answer: arr[i], unit: '°C',
        steps: '在折線圖上找到橫軸的「' + hours[i] + '」，往上看到那個點，再往左讀縱軸刻度。<br>' +
          '答案是 <b>' + arr[i] + '</b> °C。'
      };
    }

    if (type === 'trend') {
      /* 豆苗只會長高或停住，<b>不會變矮</b>，所以每天的變化量不能是負的。
         另外要保證「長最多的那一天」只有一個，否則會出現兩個都對的答案。 */
      const n = 6;
      const step = [];
      for (let i = 0; i < n - 1; i++) step.push(Kit.randInt(0, 4));
      const bi = Kit.randInt(1, n - 1);                       // 第 bi 天到第 bi+1 天長最多
      let other = 0;
      step.forEach(function (d, k) { if (k !== bi - 1 && d > other) other = d; });
      step[bi - 1] = other + Kit.randInt(2, 4);
      const arr = [Kit.randInt(8, 16)];
      for (let i = 0; i < n - 1; i++) arr.push(arr[i] + step[i]);
      const bd = step[bi - 1];
      return {
        q: '豆苗每天的高度（公分）：' + arr.join('、') + '<br>' +
          '第幾天到第幾天<b>長得最多</b>？（填後面那一天的天數，例如第 3 天到第 4 天就填 4）',
        input: 'number', answer: bi + 1, unit: '天',
        steps: '每天的變化量：' + arr.slice(1).map((x, k) => '第' + (k + 1) + '→' + (k + 2) + '天 ' +
          (x - arr[k] > 0 ? '+' : '') + (x - arr[k])).join('、') + '<br>' +
          '最大的是 <b>+' + bd + '</b>，發生在第 ' + bi + ' 天到第 <b>' + (bi + 1) + '</b> 天。<br>' +
          '<span style="color:var(--muted)">在折線圖上，這就是<b>線最陡</b>的那一段。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '刻度必須等距，而且最好從 0 開始', ok: true },
      { t: '刻度可以隨意，讓變化看起來明顯就好', ok: false },
      { t: '縱軸不用寫單位', ok: false },
      { t: '橫軸的順序可以任意調換', ok: false }
    ]);
    return {
      q: '畫折線圖時，關於<b>縱軸刻度</b>，下面哪一個說法是對的？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '縱軸刻度必須<b>等距</b>（每一格代表一樣多），否則圖會騙人。<br>' +
        '不從 0 開始的話，小小的差距看起來會像天差地遠——新聞圖表常用這招誤導，' +
        '學會看刻度就不會被騙。<br>' +
        '另外，完整的統計圖還要有<b>標題、橫軸名稱、縱軸名稱與單位</b>。'
    };
  }
});
