/* ============================================================
   五上 自然（康軒）第 4 單元　燃燒與生鏽
   依 115 學年度課程計畫，本單元三個活動：
     活動一 空氣與燃燒有什麼關係
       察覺燃燒需要空氣／認識空氣的組成成分及其特性／
       知道如何製造氧氣／氧氣可以幫助燃燒，並可利用此特性檢驗氧氣
     活動二 燃燒的條件
       燃燒三要素：可燃物、助燃物、溫度達到燃點／預防火災與滅火的方法
     活動三 為何會生鏽與如何防鏽
       推測影響物品生鏽的因素／驗證水和酸性水溶液對鐵生鏽的影響
   課綱 INe-Ⅲ-3 / INa-Ⅲ-4
   ============================================================ */

Kit.register('s5a-u4', {

  intro: '三個模式：<b>空氣與燃燒</b>看蠟燭在密閉杯裡能撐多久、<b>燃燒三要素</b>可以自己抽掉其中一個看火會不會滅、<b>生鏽</b>做四組對照實驗。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 330);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'air', cupSize = 2, running = false, o2 = 100, elapsed = 0;
    let fuel = true, oxy = true, heat = true;           // 燃燒三要素
    let rustDay = 0, raf = null, t = 0;

    /* ---------- 模式 1：空氣與燃燒 ---------- */
    const CUPS = [
      { n: '小杯子', vol: 1, sec: 6 },
      { n: '中杯子', vol: 2, sec: 14 },
      { n: '大杯子', vol: 3, sec: 26 },
      { n: '不蓋杯子', vol: 99, sec: 999 }
    ];

    function drawAir() {
      const ctx = cv.ctx;
      const C = CUPS[cupSize];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('把杯子蓋在燃燒的蠟燭上。按「開始」看火能撐多久——杯子越大，撐越久', 16, 22);

      const cx = 200, base = 250;
      const w = 60 + C.vol * 26, h = 90 + C.vol * 40;
      const alive = !running || elapsed < C.sec;

      // 杯子
      if (C.vol < 99) {
        ctx.fillStyle = 'rgba(159,180,221,.10)';
        ctx.fillRect(cx - w / 2, base - h, w, h);
        ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, base); ctx.lineTo(cx - w / 2, base - h);
        ctx.lineTo(cx + w / 2, base - h); ctx.lineTo(cx + w / 2, base);
        ctx.stroke();
        // 氧氣濃度示意
        const frac = running ? Math.max(0, 1 - elapsed / C.sec) : 1;
        ctx.fillStyle = 'rgba(77,163,255,' + (0.06 + 0.16 * frac) + ')';
        ctx.fillRect(cx - w / 2 + 3, base - h + 3, w - 6, h - 6);
      }

      // 桌面
      ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(40, base); ctx.lineTo(cv.W - 40, base); ctx.stroke();

      // 蠟燭
      ctx.fillStyle = '#f5e6c8'; ctx.fillRect(cx - 13, base - 58, 26, 58);
      ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1; ctx.strokeRect(cx - 13, base - 58, 26, 58);
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, base - 58); ctx.lineTo(cx, base - 66); ctx.stroke();

      // 火焰
      if (alive) {
        const flick = 1 + Math.sin(t * 9) * .10;
        const shrink = running ? Math.max(.35, 1 - elapsed / C.sec * .65) : 1;
        const fh = 34 * flick * shrink;
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(cx, base - 66 - fh);
        ctx.quadraticCurveTo(cx + 15 * shrink, base - 66 - fh / 2, cx, base - 62);
        ctx.quadraticCurveTo(cx - 15 * shrink, base - 66 - fh / 2, cx, base - 66 - fh);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cx, base - 66 - fh * .62);
        ctx.quadraticCurveTo(cx + 8 * shrink, base - 66 - fh / 3, cx, base - 63);
        ctx.quadraticCurveTo(cx - 8 * shrink, base - 66 - fh / 3, cx, base - 66 - fh * .62);
        ctx.fill();
      } else {
        // 熄滅：一縷煙
        ctx.strokeStyle = 'rgba(200,200,210,.55)'; ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k <= 30; k++) {
          const y = base - 66 - k * 2.2;
          const x = cx + Math.sin(k / 4 + t * 2) * 7;
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }

      /* 空氣成分圓餅 */
      const px = 470, py = 130, pr = 66;
      const AIR = [['氮氣', 78, '#5a6b8c'], ['氧氣', 21, '#4da3ff'], ['其他（含二氧化碳）', 1, '#fbbf24']];
      let a0 = -Math.PI / 2;
      AIR.forEach(([n, p, col]) => {
        const a1 = a0 + p / 100 * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, pr, a0, a1); ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1.5; ctx.stroke();
        a0 = a1;
      });
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('空氣的組成', px, py + pr + 10);
      AIR.forEach(([n, p, col], i) => {
        const y = py + pr + 30 + i * 20;
        ctx.fillStyle = col; ctx.fillRect(px - 78, y, 12, 12);
        ctx.fillStyle = '#e8eefc'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(n + ' ' + p + '%', px - 60, y);
      });

      ctx.fillStyle = alive ? '#fbbf24' : '#93a3c4';
      ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(running ? (alive ? '燃燒中… ' + elapsed.toFixed(1) + ' 秒' : '熄滅！撐了 ' + C.sec + ' 秒')
        : C.n + '（按開始）', cx, base + 14);

      readout.innerHTML =
        '<div class="big">' + C.n + '　' +
        (C.vol >= 99 ? '不蓋杯子 → 蠟燭<b>一直燒</b>' : '大約 <b>' + C.sec + '</b> 秒後熄滅') + '</div>' +
        '<b>為什麼會熄滅？</b>杯子裡的<b>氧氣</b>被燒掉了。杯子越大、裡面空氣越多，撐得越久——' +
        '這就證明了<b>燃燒需要空氣（中的氧氣）</b>。<br>' +
        '<b>空氣的組成</b>（課綱 INa-Ⅲ-4）：<span style="color:#5a6b8c">氮氣約 78%</span>、' +
        '<span style="color:#4da3ff">氧氣約 21%</span>、其他約 1%（含二氧化碳）。<br>' +
        '<span style="color:var(--muted)"><b>氧氣</b>：本身<b>不會燃燒</b>，但能<b>幫助燃燒</b>（助燃）。' +
        '檢驗方法——把<b>快熄滅、還有火星的線香</b>伸進去，如果<b>復燃</b>，就是氧氣。<br>' +
        '<b>二氧化碳</b>：<b>不助燃</b>，可以滅火。檢驗方法——通入<b>澄清石灰水</b>會變<b>混濁</b>。<br>' +
        '實驗室製造氧氣：雙氧水加二氧化錳。</span>';
    }

    /* ---------- 模式 2：燃燒三要素 ---------- */
    function drawTriangle() {
      const ctx = cv.ctx;
      const on = fuel && oxy && heat;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('燃燒必須三個條件<b>同時</b>具備。試著關掉其中一個，看火會怎樣', 16, 22);

      const cx = 210, cy = 175, R = 108;
      const items = [
        { k: 'fuel', n: '可燃物', st: fuel, col: '#8d6e63', ex: '紙、木頭、瓦斯、酒精' },
        { k: 'oxy', n: '助燃物', st: oxy, col: '#4da3ff', ex: '空氣中的氧氣' },
        { k: 'heat', n: '達到燃點', st: heat, col: '#fb7185', ex: '足夠高的溫度' }
      ];
      // 三角形三邊
      const pts = items.map((_, i) => {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 3;
        return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
      });
      for (let i = 0; i < 3; i++) {
        const p = pts[i], q = pts[(i + 1) % 3];
        ctx.strokeStyle = items[i].st ? items[i].col : '#2f3a4d';
        ctx.lineWidth = items[i].st ? 8 : 4;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
      items.forEach((it, i) => {
        const p = pts[i], q = pts[(i + 1) % 3];
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
        const ox = (mx - cx) * .48, oy = (my - cy) * .48;
        ctx.fillStyle = it.st ? it.col : '#4b5668';
        ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.n + (it.st ? '' : '（已移除）'), mx + ox, my + oy);
      });
      // 中間火焰
      if (on) {
        const f = 1 + Math.sin(t * 8) * .1;
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 40 * f);
        ctx.quadraticCurveTo(cx + 24, cy + 6, cx, cy + 30);
        ctx.quadraticCurveTo(cx - 24, cy + 6, cx, cy - 40 * f);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * f);
        ctx.quadraticCurveTo(cx + 12, cy + 6, cx, cy + 26);
        ctx.quadraticCurveTo(cx - 12, cy + 6, cx, cy - 22 * f);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 22); ctx.lineTo(cx + 22, cy + 22);
        ctx.moveTo(cx + 22, cy - 22); ctx.lineTo(cx - 22, cy + 22);
        ctx.stroke();
      }

      // 右側滅火方法
      const off = items.filter(i => !i.st);
      const METH = {
        fuel: ['移除可燃物', '關掉瓦斯開關、把周圍可燃物搬開、開闢防火線'],
        oxy: ['隔絕氧氣', '鍋子起火蓋上鍋蓋、用濕布悶熄、二氧化碳滅火器'],
        heat: ['降低溫度', '用水澆熄（水吸熱又變成水蒸氣帶走熱）']
      };
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('滅火 = 破壞其中任一個', 366, 70);
      Object.keys(METH).forEach((k, i) => {
        const y = 100 + i * 62;
        const active = !items.find(x => x.k === k).st;
        ctx.fillStyle = active ? 'rgba(52,211,153,.14)' : '#141d31';
        ctx.fillRect(366, y, 226, 52);
        ctx.strokeStyle = active ? '#34d399' : '#26355a'; ctx.lineWidth = active ? 2.5 : 1;
        ctx.strokeRect(366, y, 226, 52);
        ctx.fillStyle = active ? '#34d399' : '#93a3c4';
        ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.fillText(METH[k][0], 378, y + 8);
        ctx.fillStyle = '#93a3c4'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.fillText(METH[k][1].slice(0, 15), 378, y + 30);
      });

      readout.innerHTML =
        '<div class="big">' + (on
          ? '<span style="color:var(--warn)">🔥 三個條件都在 → 持續燃燒</span>'
          : '<span style="color:var(--ok)">✅ 少了「' + off.map(x => x.n).join('、') + '」→ 火熄滅</span>') + '</div>' +
        '<b>燃燒三要素</b>（課綱 INe-Ⅲ-3）：<br>' +
        '① <span style="color:#8d6e63"><b>可燃物</b></span>——會燒的東西（紙、木頭、瓦斯、酒精）<br>' +
        '② <span style="color:#4da3ff"><b>助燃物</b></span>——通常是空氣中的<b>氧氣</b><br>' +
        '③ <span style="color:#fb7185"><b>溫度達到燃點</b></span>——每種物質有自己的燃點，沒到就燒不起來<br>' +
        '<b>三個缺一不可</b>，所以<b>滅火只要破壞任何一個</b>就成功。<br>' +
        '<span style="color:var(--muted)"><b>預防火災</b>：不玩火、電線不超載、瓦斯用完關閉、裝住宅用火災警報器。<br>' +
        '<span style="color:var(--no)">⚠️ <b>油鍋起火千萬不能用水澆</b>！水會瞬間汽化把熱油炸開，火勢反而更大。' +
        '正確做法是<b>蓋上鍋蓋</b>隔絕氧氣。</span></span>';
    }

    /* ---------- 模式 3：生鏽對照實驗 ---------- */
    const RUST = [
      { n: '① 乾燥空氣中', water: false, air: true, acid: false, rate: 0.06,
        note: '只有空氣、幾乎沒有水 → 生鏽<b>非常慢</b>' },
      { n: '② 水中（煮沸過、密封）', water: true, air: false, acid: false, rate: 0.04,
        note: '有水但幾乎沒有氧氣 → 生鏽<b>非常慢</b>' },
      { n: '③ 一半泡水、一半接觸空氣', water: true, air: true, acid: false, rate: 1.0,
        note: '<b>水和氧氣都有</b> → 生鏽<b>最快</b>' },
      { n: '④ 泡在酸性水溶液中', water: true, air: true, acid: true, rate: 1.7,
        note: '酸會<b>加速</b>生鏽（所以酸雨、汗水都會讓鐵更快生鏽）' }
    ];

    function drawRust() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('四支鐵釘、四種環境，拖曳「經過幾天」看哪一支鏽得最快', 16, 22);

      RUST.forEach((R, i) => {
        const x = 34 + i * 146, y = 54, w = 126, h = 190;
        ctx.fillStyle = '#141d31'; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#26355a'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
        // 液體
        if (R.water) {
          const lvl = i === 2 ? 0.45 : 0.78;
          ctx.fillStyle = R.acid ? 'rgba(251,191,36,.22)' : 'rgba(56,189,248,.22)';
          ctx.fillRect(x + 4, y + h - h * lvl, w - 8, h * lvl - 4);
          ctx.strokeStyle = R.acid ? '#fbbf24' : '#38bdf8'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x + 4, y + h - h * lvl); ctx.lineTo(x + w - 4, y + h - h * lvl); ctx.stroke();
        }
        if (!R.air) {   // 密封
          ctx.fillStyle = '#5a6b8c'; ctx.fillRect(x + 4, y + 4, w - 8, 14);
          ctx.fillStyle = '#0b1220'; ctx.font = '10px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('密封', x + w / 2, y + 11);
        }
        // 鐵釘（依鏽蝕程度變色）
        const r = Math.min(1, rustDay / 20 * R.rate);
        const col = 'rgb(' + Math.round(150 + 90 * r) + ',' + Math.round(155 - 80 * r) + ',' + Math.round(160 - 130 * r) + ')';
        ctx.fillStyle = col;
        ctx.fillRect(x + w / 2 - 7, y + 40, 14, 120);
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 7, y + 160); ctx.lineTo(x + w / 2 + 7, y + 160);
        ctx.lineTo(x + w / 2, y + 178); ctx.closePath(); ctx.fill();
        ctx.fillRect(x + w / 2 - 15, y + 34, 30, 8);
        // 鏽斑
        if (r > .12) {
          ctx.fillStyle = 'rgba(150,60,20,' + Math.min(.85, r) + ')';
          for (let k = 0; k < Math.round(r * 22); k++) {
            const px = x + w / 2 - 6 + ((k * 37) % 12);
            const py = y + 44 + ((k * 53) % 112);
            ctx.beginPath(); ctx.arc(px, py, 1.6 + (k % 3), 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.fillStyle = r > .6 ? '#fb7185' : r > .25 ? '#fbbf24' : '#93a3c4';
        ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('鏽蝕 ' + Math.round(r * 100) + '%', x + w / 2, y + h + 6);
        ctx.fillStyle = '#e8eefc'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.fillText(R.n.slice(0, 2), x + w / 2, y - 16);
      });

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('經過 ' + rustDay + ' 天', cv.W / 2, 296);

      readout.innerHTML =
        '<div class="big">鐵生鏽需要 <b>水</b> ＋ <b>氧氣</b>（兩個都要）</div>' +
        RUST.map(R => '<b>' + R.n + '</b>：' + R.note).join('<br>') + '<br>' +
        '<span style="color:var(--muted)">這組實驗的設計重點：每次<b>只改變一個條件</b>，其他都一樣，' +
        '才能確定是哪個因素造成差別（這就是課綱說的<b>自變項與應變項</b>）。<br>' +
        '<b>防鏽的方法</b>——把水和氧氣隔開就對了：<b>塗油、上漆、電鍍（鍍鋅、鍍鉻）、烤漆、保持乾燥</b>；' +
        '不鏽鋼則是在鋼裡加入鉻，表面會形成一層保護膜。</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'air') drawAir();
      else if (mode === 'tri') drawTriangle();
      else drawRust();
    }
    function loop() {
      t += 0.05;
      if (running && mode === 'air') {
        elapsed += 1 / 60;
        if (elapsed > CUPS[cupSize].sec + 2) running = false;
      }
      if (mode === 'air' || mode === 'tri') paint();
      raf = requestAnimationFrame(loop);
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '① 空氣與燃燒', value: 'air' },
      { label: '② 燃燒三要素', value: 'tri' },
      { label: '③ 為何會生鏽', value: 'rust' }
    ], function (v) {
      mode = v; running = false; elapsed = 0;
      cupSeg.wrap.style.display = v === 'air' ? '' : 'none';
      startBtn.style.display = v === 'air' ? '' : 'none';
      triWrap.style.display = v === 'tri' ? '' : 'none';
      dayCtl.wrap.style.display = v === 'rust' ? '' : 'none';
      paint();
    }, mode);

    const cupSeg = Kit.segmented('杯子大小', CUPS.map((c, i) => ({ label: c.n, value: i })),
      function (v) { cupSize = v; running = false; elapsed = 0; paint(); }, cupSize);
    const startBtn = Kit.button('▶ 蓋上杯子，開始', function () {
      running = true; elapsed = 0;
    }, 'primary');

    const triWrap = Kit.el('div', { class: 'ctl' });
    const triSeg = Kit.segmented('拿掉哪一個', [
      { label: '三個都在（會燒）', value: 'none' },
      { label: '拿掉可燃物', value: 'fuel' },
      { label: '隔絕氧氣', value: 'oxy' },
      { label: '降低溫度', value: 'heat' }
    ], function (v) {
      fuel = v !== 'fuel'; oxy = v !== 'oxy'; heat = v !== 'heat'; paint();
    }, 'none');
    triWrap.appendChild(triSeg.wrap);
    triWrap.style.display = 'none';

    const dayCtl = Kit.slider('經過幾天', { min: 0, max: 20, value: 0, format: v => v + ' 天', onChange: v => { rustDay = v; paint(); } });
    dayCtl.wrap.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(cupSeg.wrap);
    controls.appendChild(startBtn);
    controls.appendChild(triWrap);
    controls.appendChild(dayCtl.wrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '燃燒和生鏽其實是<b>同一件事的快慢版</b>：都是物質<b>和氧結合</b>。' +
        '燃燒又快又放光發熱，生鏽慢到看不出來，但本質相同。'
    }));

    paint(); loop();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '換不同大小的杯子各按一次「開始」：「為什麼大杯子撐比較久？」', why: '因為裡面的<b>氧氣比較多</b>。這一個對照就證明了燃燒需要氧氣，比背定義有力得多。' },
    { ask: '「空氣裡最多的是氧氣嗎？」', why: '不是，<b>氮氣約 78%</b> 才是最多的，氧氣只有約 21%。這題十個大人有八個答錯。' },
    { ask: '「怎麼知道一個瓶子裡裝的是氧氣？」', why: '把<b>快熄滅、只剩火星的線香</b>伸進去，會<b>復燃</b>。氧氣自己不燃燒，但會<b>助燃</b>——這個區別很重要。' },
    { ask: '燃燒三要素模式：「要滅火，最少要破壞幾個條件？」', why: '<b>一個就夠</b>。三個缺一不可，所以拿掉任何一個火就滅。這是滅火的全部原理。' },
    { ask: '「炒菜時油鍋起火，可以用水澆嗎？」', why: '<b>絕對不行！</b>水碰到熱油會瞬間汽化，把燃燒的油炸得到處都是，火勢會爆開。正確做法是<b>蓋上鍋蓋</b>。這是能救命的常識。' },
    { ask: '生鏽模式：「哪一支鏽得最快？它跟別支差在哪裡？」', why: '第③支——<b>水和氧氣都有</b>。這組實驗每次只改一個條件，是很好的「控制變因」示範。' },
    { ask: '在家做：四個杯子放鐵釘（乾的、泡冷開水加油封、半泡水、泡醋），放一週看看。', why: '一週就有明顯差別，材料全在廚房。課綱要求「驗證水和酸性水溶液對鐵生鏽的影響」，這就是那個實驗。' }
  ],

  pitfalls: [
    { bad: '以為空氣中最多的是氧氣。', fix: '<b>氮氣約 78%</b> 最多，氧氣約 21%，其他約 1%（含二氧化碳）。', src: 'INa-Ⅲ-4' },
    { bad: '以為氧氣「會燃燒」。', fix: '氧氣<b>自己不會燒</b>，它是<b>助燃物</b>——幫助別的東西燒。可燃物和助燃物是兩件事。' },
    { bad: '以為滅火一定要用水。', fix: '滅火是<b>破壞燃燒三要素中的任一個</b>。關瓦斯（移除可燃物）、蓋鍋蓋（隔絕氧氣）都是滅火。' },
    { bad: '油鍋起火時用水澆。', fix: '<b>極度危險</b>。水瞬間汽化會把熱油噴濺開，火勢暴增。正確做法是蓋鍋蓋隔絕氧氣。' },
    { bad: '以為鐵只要碰到水就會生鏽。', fix: '<b>水和氧氣兩個都要</b>。煮沸過（趕走氧氣）又密封的水裡，鐵釘幾乎不生鏽。' },
    { bad: '把「生鏽」當成只是變髒、擦掉就好。', fix: '生鏽是<b>化學變化</b>——鐵和氧結合變成了鏽（另一種物質），不是附著在表面的髒污。' },
    { bad: '做對照實驗時一次改好幾個條件。', fix: '每次<b>只改一個</b>，其他保持相同，才知道是哪個因素造成差別。' }
  ],

  quiz: function () {
    const type = Kit.pick(['air', 'gas', 'tri', 'fire', 'rust', 'rust2']);

    if (type === 'air') {
      const it = Kit.pick([
        { q: '空氣中含量<b>最多</b>的氣體是什麼？', a: '氮氣（約 78%）', o: ['氧氣（約 78%）', '二氧化碳（約 78%）', '水蒸氣'] },
        { q: '空氣中<b>氧氣</b>大約占多少？', a: '約 21%', o: ['約 78%', '約 50%', '約 1%'] },
        { q: '把杯子蓋在燃燒的蠟燭上，火會熄滅，這證明了什麼？', a: '燃燒需要空氣中的氧氣', o: ['蠟燭燒完了', '杯子把火壓熄了', '杯子裡太冷了'] },
        { q: '同樣的蠟燭，用<b>大杯子</b>蓋住會比小杯子燒得久，為什麼？', a: '大杯子裡的氧氣比較多', o: ['大杯子比較涼', '大杯子比較重', '大杯子擋風效果差'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>空氣的組成</b>（INa-Ⅲ-4）：氮氣約 <b>78%</b>、氧氣約 <b>21%</b>、其他約 1%（含二氧化碳）。<br>' +
          '蠟燭在密閉杯子裡會熄滅，是因為<b>氧氣被消耗掉</b>。杯子越大、氧氣越多，撐越久。'
      };
    }

    if (type === 'gas') {
      const it = Kit.pick([
        { q: '怎麼檢驗一個瓶子裡是<b>氧氣</b>？', a: '把只剩火星的線香伸進去，會復燃', o: ['通入澄清石灰水會混濁', '會聞到刺鼻的味道', '把水倒進去會冒泡'] },
        { q: '怎麼檢驗一個瓶子裡是<b>二氧化碳</b>？', a: '通入澄清石灰水，石灰水會變混濁', o: ['線香會復燃', '會爆炸', '會變成紅色'] },
        { q: '關於<b>氧氣</b>，下面哪一個說法正確？', a: '自己不會燃燒，但可以幫助燃燒', o: ['自己會劇烈燃燒', '可以用來滅火', '通入石灰水會變混濁'] },
        { q: '<b>二氧化碳</b>可以用來滅火，是因為它有什麼性質？', a: '不助燃', o: ['很冷', '很重會壓住火', '會吸收可燃物'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>氧氣</b>：自己<b>不燃燒</b>，但<b>助燃</b>。檢驗 → 快熄滅的線香伸進去會<b>復燃</b>。<br>' +
          '<b>二氧化碳</b>：<b>不助燃</b>，可滅火。檢驗 → 通入<b>澄清石灰水</b>會<b>混濁</b>。<br>' +
          '<span style="color:var(--muted)">實驗室製造氧氣：雙氧水加二氧化錳。</span>'
      };
    }

    if (type === 'tri') {
      const it = Kit.pick([
        { q: '燃燒的<b>三要素</b>是哪三個？', a: '可燃物、助燃物、溫度達到燃點', o: ['可燃物、水、空氣', '氧氣、二氧化碳、溫度', '火柴、紙、風'] },
        { q: '要讓火熄滅，最少要破壞幾個燃燒要素？', a: '一個就夠了', o: ['一定要三個都破壞', '至少兩個', '完全無法破壞'] },
        { q: '<b>關掉瓦斯開關</b>讓火熄滅，是破壞了哪一個要素？', a: '可燃物', o: ['助燃物', '溫度', '三個同時'] },
        { q: '<b>蓋上鍋蓋</b>讓火熄滅，是破壞了哪一個要素？', a: '助燃物（氧氣）', o: ['可燃物', '溫度', '燃點'] },
        { q: '<b>用水澆熄</b>營火，主要是破壞了哪一個要素？', a: '溫度（降到燃點以下）', o: ['可燃物', '助燃物', '完全沒有破壞'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>燃燒三要素</b>（INe-Ⅲ-3）：<b>可燃物</b>＋<b>助燃物（氧氣）</b>＋<b>溫度達到燃點</b>，' +
          '三者<b>缺一不可</b>。<br>所以<b>滅火只要破壞任何一個</b>：<br>' +
          '移除可燃物（關瓦斯）／隔絕氧氣（蓋鍋蓋、二氧化碳滅火器）／降低溫度（澆水）'
      };
    }

    if (type === 'fire') {
      const opts = Kit.shuffle([
        { t: '蓋上鍋蓋，隔絕氧氣', ok: true },
        { t: '趕快用水澆熄', ok: false },
        { t: '用扇子把火扇小', ok: false },
        { t: '把鍋子端起來拿到外面', ok: false }
      ]);
      return {
        q: '炒菜時<b>油鍋起火</b>，最正確的處理方式是什麼？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '<b>蓋上鍋蓋</b>——隔絕氧氣，火就滅了。<br>' +
          '<span style="color:var(--no)">⚠️ <b>絕對不能用水</b>：水碰到高溫的油會<b>瞬間汽化</b>，' +
          '把燃燒的油炸得到處都是，火勢會突然暴增，非常危險。</span><br>' +
          '<b>扇風</b>會補充氧氣，火更大；<b>端鍋子</b>可能燙傷又把火帶到別處。<br>' +
          '<span style="color:var(--muted)">這是最重要的居家安全常識之一，值得記一輩子。</span>'
      };
    }

    if (type === 'rust') {
      const it = Kit.pick([
        { q: '鐵生鏽需要哪些條件？', a: '水和氧氣，兩個都要', o: ['只要有水就會', '只要有氧氣就會', '只要溫度夠高就會'] },
        { q: '把鐵釘放在<b>煮沸過又密封</b>的水中，結果會如何？', a: '幾乎不生鏽，因為缺少氧氣', o: ['生鏽最快，因為一直泡水', '立刻溶解', '會變成不鏽鋼'] },
        { q: '四支鐵釘中，<b>一半泡水、一半露出空氣</b>的那一支，結果會如何？', a: '生鏽最快，因為水和氧氣都充足', o: ['完全不生鏽', '只有泡水那半會鏽', '生鏽最慢'] },
        { q: '把鐵釘泡在<b>酸性水溶液</b>（如醋）中，對生鏽有什麼影響？', a: '會加速生鏽', o: ['會完全防止生鏽', '沒有任何影響', '會讓鐵變硬'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>鐵生鏽 = 鐵和氧結合</b>，需要<b>水</b>和<b>氧氣</b>兩個條件同時具備。<br>' +
          '缺水（乾燥空氣）或缺氧（煮沸密封的水）都幾乎不生鏽；兩者都有時最快；<b>酸</b>會再加速。<br>' +
          '<span style="color:var(--muted)">所以海邊、酸雨地區的鐵製品特別容易鏽。</span>'
      };
    }

    const it = Kit.pick([
      { q: '下面哪一個<b>不是</b>防鏽的方法？', a: '把鐵器泡在鹽水裡', o: ['表面塗油', '表面上漆', '電鍍（鍍鋅）'] },
      { q: '防鏽方法的共同原理是什麼？', a: '把鐵和水、氧氣隔開', o: ['讓鐵變得更硬', '降低鐵的溫度', '讓鐵吸收更多氧氣'] },
      { q: '生鏽屬於什麼變化？', a: '化學變化（鐵和氧結合成新物質）', o: ['物理變化（只是變髒）', '狀態變化', '沒有任何變化'] }
    ]);
    const opts = Kit.shuffle([it.a].concat(it.o));
    return {
      q: it.q, choices: opts, answer: opts.indexOf(it.a),
      steps: '答案：<b>' + it.a + '</b><br>' +
        '<b>防鏽的原理只有一個</b>：把鐵和<b>水、氧氣</b>隔開。<br>' +
        '方法：塗油、上漆、電鍍（鍍鋅、鍍鉻）、烤漆、保持乾燥；不鏽鋼則是加入鉻形成保護膜。<br>' +
        '<span style="color:var(--muted)">生鏽是<b>化學變化</b>——生成的鏽和原來的鐵是不同的物質，擦不掉也變不回去。' +
        '燃燒和生鏽本質相同（都是和氧結合），差別只在<b>快慢</b>。</span>'
    };
  }
});
