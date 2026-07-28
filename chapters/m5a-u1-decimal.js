/* ============================================================
   五上 數學（康軒）第 1 單元　多位小數與加減
   課綱 N-5-1「十進位的位值系統：「兆位」至「千分位」。整合整數與小數。
                理解基於位值系統可延伸表示更大的數和更小的數。」
   教具：可點擊的位值表。每一位加減、看整體數值怎麼變，
         並示範「小數點對齊」的直式加減。
   ============================================================ */

Kit.register('m5a-u1', {

  intro: '點每一位上方的 ▲▼ 加減，看數字怎麼變。位值表往右延伸出去的就是小數：十分位、百分位、千分位——每往右一格就<b>變成十分之一</b>。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:16px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 250);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* 位值：千、百、十、個 . 十分、百分、千分 */
    const PLACES = [
      { name: '千位', v: 1000 }, { name: '百位', v: 100 }, { name: '十位', v: 10 }, { name: '個位', v: 1 },
      { name: '十分位', v: 0.1 }, { name: '百分位', v: 0.01 }, { name: '千分位', v: 0.001 }
    ];
    const DOT = 4;   // 小數點插在索引 4 之前

    let digitsA = [0, 3, 4, 5, 6, 0, 0];
    let digitsB = [0, 1, 2, 7, 8, 0, 0];
    let mode = 'one', op = '+';

    function valueOf(d) { return d.reduce((s, x, i) => s + x * PLACES[i].v, 0); }
    function fmt(v) { return parseFloat(v.toFixed(3)).toString(); }

    /* 讀法（中文） */
    function readAloud(d) {
      const intPart = d.slice(0, DOT).join('').replace(/^0+/, '') || '0';
      const decPart = d.slice(DOT).join('').replace(/0+$/, '');
      const units = ['千', '百', '十', ''];
      let s = '';
      let started = false;
      for (let i = 0; i < DOT; i++) {
        if (d[i] === 0) { if (started) s += '零'; continue; }
        s += d[i] + units[i]; started = true;
      }
      s = s.replace(/零+/g, '零').replace(/零$/, '');
      if (!started) s = '零';
      if (decPart) s += '點' + decPart.split('').join('');
      return s;
    }

    const cellW = 62, tableX = 78, tableY = 74;

    function drawTable(d, y, color, label) {
      const ctx = cv.ctx;
      ctx.fillStyle = color; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(label, tableX - 12, y + 22);
      PLACES.forEach((p, i) => {
        const x = tableX + i * cellW + (i >= DOT ? 14 : 0);
        ctx.fillStyle = i >= DOT ? '#1c2a44' : '#16203a';
        ctx.fillRect(x, y, cellW - 4, 44);
        ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellW - 4, 44);
        ctx.fillStyle = d[i] ? color : '#3a4c73';
        ctx.font = 'bold 26px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d[i], x + (cellW - 4) / 2, y + 23);
      });
      // 小數點
      const dx = tableX + DOT * cellW + 4;
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(dx, y + 40, 4, 0, Math.PI * 2); ctx.fill();
    }

    function paint() {
      cv.clear('#0e1726');
      const ctx = cv.ctx;

      // 位名列
      PLACES.forEach((p, i) => {
        const x = tableX + i * cellW + (i >= DOT ? 14 : 0);
        ctx.fillStyle = i >= DOT ? '#7c5cff' : '#93a3c4';
        ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(p.name, x + (cellW - 4) / 2, tableY - 22);
        ctx.fillStyle = '#5a6b8c'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.fillText(p.v >= 1 ? p.v : '1/' + Math.round(1 / p.v), x + (cellW - 4) / 2, tableY - 6);
      });

      drawTable(digitsA, tableY, '#4da3ff', '甲');
      if (mode === 'two') {
        ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(op, tableX - 40, tableY + 90);
        drawTable(digitsB, tableY + 68, '#34d399', '乙');
        // 結果
        const r = op === '+' ? valueOf(digitsA) + valueOf(digitsB) : valueOf(digitsA) - valueOf(digitsB);
        ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tableX - 20, tableY + 124); ctx.lineTo(cv.W - 20, tableY + 124); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 30px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(fmt(r), tableX, tableY + 134);
      }

      const v = valueOf(digitsA);
      if (mode === 'one') {
        readout.innerHTML =
          '<div class="big">' + fmt(v) + '　讀作「' + readAloud(digitsA) + '」</div>' +
          PLACES.map((p, i) => d3(digitsA[i], p)).filter(Boolean).join(' ＋ ') + ' ＝ <b>' + fmt(v) + '</b><br>' +
          '<span style="color:var(--muted)">位值系統的核心：每往<b>左</b>一格變 <b>10 倍</b>，每往<b>右</b>一格變 <b>1/10</b>。' +
          '小數點只是「個位在哪裡」的標記，左右兩邊用的是<b>同一套規則</b>。<br>' +
          '所以往右可以一直延伸（千分位、萬分位…），往左也可以一直延伸（萬位、億位、兆位…）。</span>';
      } else {
        const r = op === '+' ? v + valueOf(digitsB) : v - valueOf(digitsB);
        readout.innerHTML =
          '<div class="big">' + fmt(v) + ' ' + op + ' ' + fmt(valueOf(digitsB)) + ' ＝ <b>' + fmt(r) + '</b></div>' +
          '直式計算時，<b>小數點要對齊</b>（畫面上紅點都在同一條垂直線上）。<br>' +
          '對齊小數點＝把相同位值的數字排在一起：十分位加十分位、百分位加百分位。<br>' +
          '<span style="color:var(--muted)">整數加減時我們說「個位對齊」，其實就是同一件事——都是「相同位值才能相加」。</span>';
      }
    }

    function d3(dig, p) {
      if (!dig) return '';
      return dig + ' 個 ' + (p.v >= 1 ? p.v : '0.' + '0'.repeat(Math.round(-Math.log10(p.v)) - 1) + '1');
    }

    /* 點擊位值格加減 */
    cv.canvas.addEventListener('click', function (e) {
      const rect = cv.canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * cv.W / rect.width;
      const sy = (e.clientY - rect.top) * cv.H / rect.height;
      [[digitsA, tableY], [digitsB, tableY + 68]].forEach(([d, y], row) => {
        if (row === 1 && mode !== 'two') return;
        if (sy < y || sy > y + 44) return;
        PLACES.forEach((p, i) => {
          const x = tableX + i * cellW + (i >= DOT ? 14 : 0);
          if (sx >= x && sx <= x + cellW - 4) {
            // 上半格 +1，下半格 −1
            d[i] = (sy < y + 22) ? (d[i] + 1) % 10 : (d[i] + 9) % 10;
            paint();
          }
        });
      });
    });

    const modeSeg = Kit.segmented('模式', [
      { label: '認識位值', value: 'one' },
      { label: '小數加減（對齊小數點）', value: 'two' }
    ], function (v) {
      mode = v;
      opSeg.wrap.style.display = v === 'two' ? '' : 'none';
      paint();
    }, mode);

    const opSeg = Kit.segmented('運算', [{ label: '＋', value: '+' }, { label: '－', value: '-' }],
      function (v) { op = v; paint(); }, op);
    opSeg.wrap.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(opSeg.wrap);
    controls.appendChild(Kit.button('× 10（整排左移）', function () {
      digitsA = digitsA.slice(1).concat([0]);
      digitsB = digitsB.slice(1).concat([0]);
      paint();
    }));
    controls.appendChild(Kit.button('÷ 10（整排右移）', function () {
      digitsA = [0].concat(digitsA.slice(0, -1));
      digitsB = [0].concat(digitsB.slice(0, -1));
      paint();
    }));
    controls.appendChild(Kit.button('清空', function () {
      digitsA = [0, 0, 0, 0, 0, 0, 0]; digitsB = [0, 0, 0, 0, 0, 0, 0]; paint();
    }));

    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '直接<b>點格子上半部 +1、下半部 −1</b>。按「× 10」會看到整排數字往左移一格——這就是乘以 10 的真正意義：' +
        '不是「後面加個 0」，而是<b>每個數字都升了一個位值</b>。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '「十分位的一格，和個位的一格，哪個大？大幾倍？」', why: '個位大 10 倍。位值系統的整個重點就是「相鄰兩位差 10 倍」，這一句話小數和整數共用。' },
    { ask: '按「× 10」，問「數字往哪邊移？小數點有動嗎？」', why: '數字往左移，小數點沒動。很多孩子被教成「小數點右移一位」，兩種說法答案一樣，但「數字升位」才是正確的理解。' },
    { ask: '「0.5 和 0.50 一樣大嗎？」', why: '一樣大。0.50 只是多寫了一個「百分位有 0 個」。可以在畫面上把百分位設成 0 驗證。' },
    { ask: '「0.5 和 0.45 哪個大？」', why: '0.5。很多孩子看「45 比 5 大」就選 0.45。要比就從<b>最高位</b>比起：十分位 5 > 4，勝負已定。' },
    { ask: '加減模式：「為什麼直式要對齊小數點，不是對齊最後一位？」', why: '因為只有相同位值才能相加。3.5 + 0.25 如果對齊尾巴，就變成十分位加百分位了。' }
  ],

  pitfalls: [
    { bad: '比大小時看位數：以為 0.45 > 0.5（因為「45 比 5 大」）。', fix: '從<b>最高位</b>往右比。十分位 5 > 4，所以 0.5 比較大。可以補 0 對齊成 0.50 vs 0.45 再比。' },
    { bad: '直式加減對齊「最後一位」而不是小數點。', fix: '一定要<b>小數點對齊</b>，位數不夠就補 0。3.5 + 0.25 要寫成 3.50 + 0.25。' },
    { bad: '把「乘以 10」講成「後面加個 0」。', fix: '對整數碰巧成立，對小數就錯了（0.5 × 10 不是 0.50）。正確理解是<b>每個數字升一個位值</b>。' },
    { bad: '唸法錯：0.45 唸成「零點四十五」。', fix: '小數點後要<b>一位一位唸</b>：「零點四五」。因為那是「4 個十分位、5 個百分位」，不是「45」。' },
    { bad: '以為小數位越多數字越大。', fix: '0.5 > 0.45 > 0.4999。位數多不代表大，要從最高位比。' }
  ],

  quiz: function () {
    const type = Kit.pick(['place', 'compare', 'times', 'add']);

    if (type === 'place') {
      const names = ['十分位', '百分位', '千分位'];
      const i = Kit.randInt(0, 2);
      const digs = [Kit.randInt(1, 9), Kit.randInt(1, 9), Kit.randInt(1, 9)];
      const num = '0.' + digs.join('');
      return {
        q: '在 <b>' + num + '</b> 這個數裡，<b>' + names[i] + '</b>的數字是多少？',
        input: 'number', answer: digs[i],
        steps: '小數點後由左往右依序是 <b>十分位、百分位、千分位</b>。<br>' +
          num + ' → 十分位 ' + digs[0] + '、百分位 ' + digs[1] + '、千分位 ' + digs[2] + '。<br>' +
          '所以' + names[i] + '是 <b>' + digs[i] + '</b>。'
      };
    }

    if (type === 'compare') {
      const pairs = [['0.5', '0.45'], ['0.7', '0.68'], ['1.2', '1.19'], ['0.09', '0.1'],
                     ['2.30', '2.3'], ['0.406', '0.46'], ['3.5', '3.50']];
      const p = Kit.pick(pairs);
      const v1 = parseFloat(p[0]), v2 = parseFloat(p[1]);
      const opts = [p[0], p[1], '一樣大'];
      return {
        q: '<b>' + p[0] + '</b> 和 <b>' + p[1] + '</b>，哪一個比較大？',
        choices: opts, answer: v1 === v2 ? 2 : (v1 > v2 ? 0 : 1),
        steps: '比小數大小要從<b>最高位</b>往右一位一位比，位數不夠先補 0 對齊。<br>' +
          p[0] + ' → ' + v1 + '　　' + p[1] + ' → ' + v2 + '<br>' +
          (v1 === v2
            ? '兩個<b>一樣大</b>。末尾補 0 不改變大小（2.30 ＝ 2.3）。'
            : '<b>' + (v1 > v2 ? p[0] : p[1]) + '</b> 比較大。<br>⚠️ 不能看「小數點後的數字誰比較大」，那樣會答錯。')
      };
    }

    if (type === 'times') {
      const base = Kit.pick([0.5, 0.07, 1.2, 3.45, 0.006, 25.8]);
      const mul = Kit.pick([10, 100, 0.1, 0.01]);
      const ans = parseFloat((base * mul).toPrecision(12));
      return {
        q: '<b>' + base + ' × ' + mul + '</b> ＝ ?',
        input: 'number', answer: ans, tolerance: 1e-9,
        steps: (mul >= 1
          ? '乘以 ' + mul + '：每個數字往<b>左</b>升 ' + Math.log10(mul) + ' 個位值（數字變大）。'
          : '乘以 ' + mul + '：每個數字往<b>右</b>降 ' + (-Math.log10(mul)) + ' 個位值（數字變小）。') +
          '<br>' + base + ' × ' + mul + ' ＝ <b>' + ans + '</b><br>' +
          '<span style="color:var(--muted)">別記成「加幾個 0」或「小數點移幾位」，記「數字升降幾個位值」才不會錯。</span>'
      };
    }

    const x = Kit.randInt(1, 40) / 10 + Kit.randInt(0, 9) / 100;
    const y = Kit.randInt(1, 30) / 10 + Kit.randInt(0, 9) / 100;
    const a = parseFloat(x.toFixed(2)), b = parseFloat(y.toFixed(2));
    const sum = parseFloat((a + b).toFixed(2));
    return {
      q: '<b>' + a + ' ＋ ' + b + '</b> ＝ ?',
      input: 'number', answer: sum, tolerance: 1e-9,
      steps: '直式時<b>小數點對齊</b>，位數不夠補 0：<br>' +
        '<code>　' + a.toFixed(2) + '<br>＋ ' + b.toFixed(2) + '<br>─────<br>　' + sum.toFixed(2) + '</code><br>' +
        '對齊小數點的意思就是：十分位加十分位、百分位加百分位——<b>相同位值才能相加</b>。'
    };
  }
});
