/* ============================================================
   四下 數學（翰林）第 8 單元　分數（二）—— 等值分數
   課綱 N-4-6「等值分數：由操作活動中理解等值分數的意義⋯簡單分數與小數的互換」
        N-4-8「數線與分數、小數」
   教具：兩條分數條 + 一條數線，即時比較兩個分數，
         並示範「切細一點」（擴分）與「合併」（約分）。
   ============================================================ */

Kit.register('m4b-u8', {

  intro: '上下兩條是兩個分數。調分子分母，看看哪一個比較大、或是它們其實一樣大。下面的數線會把兩個分數標在同一條線上。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:16px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 330);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let a = 1, b = 2, c = 3, d = 6;     // a/b 與 c/d
    let split = 1;                       // 擴分動畫：把上面那條再切成 split 倍

    const PAD = 40, BW = 540, BH = 54;

    function drawBar(y, num, den, color, label, sub) {
      const ctx = cv.ctx;
      const n = den * sub, filled = num * sub;
      // 底
      ctx.fillStyle = '#16203a';
      ctx.fillRect(PAD, y, BW, BH);
      // 塗色格
      for (let i = 0; i < n; i++) {
        const x = PAD + i * BW / n;
        if (i < filled) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, BW / n, BH);
        }
      }
      // 格線
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = sub > 1 ? 1 : 2;
      for (let i = 1; i < n; i++) {
        const x = PAD + i * BW / n;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + BH); ctx.stroke();
      }
      // 原本的分母格線（擴分時用粗線標出來）
      if (sub > 1) {
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
        for (let i = 1; i < den; i++) {
          const x = PAD + i * BW / den;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + BH); ctx.stroke();
        }
      }
      ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 2;
      ctx.strokeRect(PAD, y, BW, BH);
      // 標籤
      ctx.fillStyle = color; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, 6, y + BH / 2);
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((num * sub) + ' / ' + (den * sub), PAD + BW, y - 8);
    }

    function drawLine(y) {
      const ctx = cv.ctx;
      const v1 = a / b, v2 = c / d;
      const maxV = Math.max(1, Math.ceil(Math.max(v1, v2)));
      ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + BW, y); ctx.stroke();
      // 整數刻度
      ctx.font = '12px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
      for (let i = 0; i <= maxV; i++) {
        const x = PAD + BW * i / maxV;
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
        ctx.fillStyle = '#93a3c4'; ctx.textBaseline = 'top';
        ctx.fillText(i, x, y + 12);
      }
      // 小刻度（用兩個分母的公倍數）。像 11 和 12 的公倍數是 132，再乘上整數範圍
      // 會畫出上千條線，糊成一團又拖慢畫面，所以太密就不畫。
      const lcm = b * d / Kit.gcd(b, d);
      const ticks = lcm * maxV;
      if (ticks <= 60) {
        ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 1;
        for (let i = 1; i < ticks; i++) {
          const x = PAD + BW * i / ticks;
          ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#5a6b8c'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('（刻度太密，僅顯示整數）', PAD + BW, y - 16);
      }
      // 兩個分數的位置
      function mark(v, color, txt, up) {
        const x = PAD + BW * v / maxV;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.textBaseline = up ? 'bottom' : 'top';
        ctx.fillText(txt, x, up ? y - 12 : y + 26);
      }
      mark(v1, '#4da3ff', a + '/' + b, true);
      mark(v2, '#34d399', c + '/' + d, false);
    }

    // 四年級只學到「二位小數」（N-4-7），所以只有能剛好化成二位小數的才顯示。
    // 這樣 1/8 = 0.125（三位）會被排除，不會超出這一階段的教學範圍。
    function toDecimal(n, m) {
      const v = n / m;
      if (Math.abs(v * 100 - Math.round(v * 100)) > 1e-9) return null;
      return String(parseFloat(v.toFixed(2)));
    }

    function paint() {
      cv.clear('#0e1726');
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('把「1 個東西」平分成幾份，塗掉其中幾份', PAD, 22);

      drawBar(40, a, b, '#4da3ff', '甲', split);
      drawBar(130, c, d, '#34d399', '乙', 1);
      drawLine(260);

      const v1 = a / b, v2 = c / d;
      const g1 = Kit.gcd(a, b), g2 = Kit.gcd(c, d);
      const eq = Math.abs(v1 - v2) < 1e-9;

      let msg = '<div class="big">';
      if (eq) msg += '甲 = 乙　<span style="color:var(--ok)">這兩個是<b>等值分數</b>！</span>';
      else msg += '甲 ' + (v1 > v2 ? '>' : '<') + ' 乙';
      msg += '</div>';

      msg += '甲 = ' + a + '/' + b + '（≈ ' + v1.toFixed(3) + '）　乙 = ' + c + '/' + d + '（≈ ' + v2.toFixed(3) + '）<br>';

      if (eq) {
        const k = d / b;
        if (Number.isInteger(k) && k > 1) {
          msg += '把甲的每一格再切成 <b>' + k + '</b> 小格，就變成 ' + (a * k) + '/' + (b * k) + '，和乙一模一樣 →　這叫做<b>擴分</b>：分子分母同乘 ' + k + '。<br>';
        } else if (Number.isInteger(b / d) && b / d > 1) {
          const k2 = b / d;
          msg += '把甲的每 <b>' + k2 + '</b> 小格合併成一大格，就變成 ' + (a / k2) + '/' + (b / k2) + '，和乙一模一樣 →　這叫做<b>約分</b>：分子分母同除 ' + k2 + '。<br>';
        } else {
          msg += '兩邊都可以化成最簡分數 <b>' + (a / g1) + '/' + (b / g1) + '</b>，所以一樣大。<br>';
        }
      }

      if (g1 > 1) msg += '甲可以<b>約分</b>：' + a + '/' + b + ' = ' + (a / g1) + '/' + (b / g1) + '（分子分母同除以 ' + g1 + '）<br>';
      if (g2 > 1) msg += '乙可以<b>約分</b>：' + c + '/' + d + ' = ' + (c / g2) + '/' + (d / g2) + '（分子分母同除以 ' + g2 + '）<br>';

      const dec1 = toDecimal(a, b), dec2 = toDecimal(c, d);
      if (dec1 || dec2) {
        msg += '<span style="color:var(--muted)">分數換小數（課綱限分母 2、5、10、100 這類）：';
        if (dec1) msg += ' 甲 ' + a + '/' + b + ' = <b>' + dec1 + '</b>';
        if (dec2) msg += '　乙 ' + c + '/' + d + ' = <b>' + dec2 + '</b>';
        msg += '</span>';
      }
      readout.innerHTML = msg;
    }

    function mk(label, get, set, max) {
      return Kit.slider(label, {
        min: 1, max: max, value: get(),
        onChange: v => { set(v); split = 1; splitCtl.input.value = 1; splitCtl.output.textContent = '×1'; paint(); }
      });
    }
    const sA = mk('甲 分子', () => a, v => a = v, 12);
    const sB = mk('甲 分母', () => b, v => b = v, 12);
    const sC = mk('乙 分子', () => c, v => c = v, 12);
    const sD = mk('乙 分母', () => d, v => d = v, 12);

    const splitCtl = Kit.slider('把甲再切細', {
      min: 1, max: 6, value: 1, format: v => '×' + v,
      onChange: v => { split = v; paint(); }
    });

    const preset = Kit.segmented('試試看', [
      { label: '1/2 與 3/6', value: [1, 2, 3, 6] },
      { label: '2/3 與 3/4', value: [2, 3, 3, 4] },
      { label: '3/4 與 6/8', value: [3, 4, 6, 8] },
      { label: '1/4 與 25/100', value: [1, 4, 25, 100] }
    ].map(p => ({ label: p.label, value: p.value.join(',') })), function (v) {
      const p = v.split(',').map(Number);
      a = p[0]; b = p[1]; c = p[2]; d = p[3];
      [[sA, a], [sB, b], [sC, c], [sD, d]].forEach(x => {
        x[0].input.max = Math.max(x[0].input.max, x[1]);
        x[0].input.value = x[1]; x[0].output.textContent = x[1];
      });
      split = 1; splitCtl.input.value = 1; splitCtl.output.textContent = '×1';
      paint();
    }, '1,2,3,6');

    controls.appendChild(preset.wrap);
    [sA, sB, sC, sD, splitCtl].forEach(s => controls.appendChild(s.wrap));
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '「把甲再切細」示範的就是<b>擴分</b>：格子變多、每格變小，但<b>塗色的面積完全沒變</b>——這就是等值分數的意義。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '把甲設成 1/2、乙設成 3/6，問「哪一個比較多？」', why: '很多孩子第一眼會說 3/6 比較多（因為數字比較大）。看到色塊一樣長，才會真的相信「一樣多」。' },
    { ask: '拉「把甲再切細」，問「塗色的地方有變多嗎？」', why: '沒有。格子變多、每一格變小，塗色的總量不變。這一句話就是<b>擴分</b>的全部道理，比背「分子分母同乘」有效。' },
    { ask: '「1/2 和 1/3，哪個大？」', why: '1/2。分母越大代表切得越細，每一份反而越小。這是分數最反直覺的地方，值得多問幾次。' },
    { ask: '「25/100 是多少？可以寫成小數嗎？」', why: '0.25。課綱這一階段只要求分母 2、5、10、100 的互換，不用練分母 3、7 這種除不盡的。' },
    { ask: '看數線問：「這兩個分數誰比較靠右邊？」', why: '數線是把分數和整數、小數放在<b>同一條線</b>上的關鍵工具。習慣看數線，五年級學異分母加減會輕鬆很多。' }
  ],

  pitfalls: [
    { bad: '比大小時只看分子（或只看分母）：以為 3/6 > 1/2。', fix: '要看「佔整體的多少」。用色塊比長度，或都化成同分母再比。' },
    { bad: '以為分母越大，分數就越大。', fix: '分母是「切成幾份」，切越多份每份越小。1/8 比 1/4 小。' },
    { bad: '擴分時只乘分子不乘分母（1/2 變成 3/2）。', fix: '擴分是「每一格再切細」，格子總數和塗色格數<b>要一起變</b>，分子分母必須乘同一個數。' },
    { bad: '把 1/4 說成 0.14、把 3/4 說成 0.34。', fix: '分數線是<b>除號</b>：1/4 = 1 ÷ 4 = 0.25。可以先擴分成 25/100 再讀成 0.25。', src: 'N-4-6「與小數互換之簡單分數指分母為 2、5、10、100」' }
  ],

  quiz: function () {
    const type = Kit.pick(['equal', 'compare', 'expand', 'decimal']);

    if (type === 'equal') {
      const b0 = Kit.pick([2, 3, 4, 5]), a0 = Kit.randInt(1, b0 - 1), k = Kit.randInt(2, 4);
      const correct = (a0 * k) + '/' + (b0 * k);
      // 誘答彼此可能撞在一起（a0=1,b0=2,k=2 時會出現兩個 3/4），必須去重
      const wrong = [];
      Kit.shuffle([
        (a0 * k) + '/' + (b0 * k + 1), (a0 * k + 1) + '/' + (b0 * k), (a0 + k) + '/' + (b0 + k),
        (a0 * k) + '/' + (b0 * k + 2), (a0 * k + 2) + '/' + (b0 * k)
      ]).forEach(x => { if (x !== correct && wrong.indexOf(x) < 0 && wrong.length < 3) wrong.push(x); });
      const opts = Kit.shuffle([correct].concat(wrong));
      return {
        q: '下面哪一個和 <b>' + a0 + '/' + b0 + '</b> 一樣大（等值分數）？',
        choices: opts, answer: opts.indexOf(correct),
        steps: '擴分：分子分母要<b>乘同一個數</b>。<br>' + a0 + '/' + b0 + ' 的分子分母都乘 ' + k + ' → <b>' + (a0 * k) + '/' + (b0 * k) + '</b>。<br>' +
          '注意「分子分母同加一個數」（' + (a0 + k) + '/' + (b0 + k) + '）<b>不是</b>等值分數。'
      };
    }

    if (type === 'compare') {
      // 兩個分數的「寫法」必須不同，否則兩個選項會長得一模一樣
      let b1, b2, a1, a2;
      do {
        b1 = Kit.pick([2, 3, 4, 5, 6, 8]); b2 = Kit.pick([2, 3, 4, 5, 6, 8]);
        a1 = Kit.randInt(1, b1 - 1); a2 = Kit.randInt(1, b2 - 1);
      } while (a1 === a2 && b1 === b2);
      const v1 = a1 / b1, v2 = a2 / b2;
      const opts = [a1 + '/' + b1, a2 + '/' + b2, '一樣大'];
      const ans = Math.abs(v1 - v2) < 1e-9 ? 2 : (v1 > v2 ? 0 : 1);
      const L = b1 * b2 / Kit.gcd(b1, b2);
      return {
        q: '<b>' + a1 + '/' + b1 + '</b> 和 <b>' + a2 + '/' + b2 + '</b>，哪一個比較大？',
        choices: opts, answer: ans,
        steps: '通分成同分母 ' + L + ' 再比：<br>' +
          a1 + '/' + b1 + ' = ' + (a1 * L / b1) + '/' + L + '　　' + a2 + '/' + b2 + ' = ' + (a2 * L / b2) + '/' + L + '<br>' +
          '分母一樣時，<b>分子大的就大</b>。'
      };
    }

    if (type === 'expand') {
      const g = Kit.randInt(2, 6), s = Kit.pick([[1, 2], [2, 3], [3, 4], [3, 5], [5, 6]]);
      const n = s[0] * g, m = s[1] * g;
      return {
        q: '把 <b>' + n + '/' + m + '</b> 約分成最簡分數，分子是多少？',
        input: 'number', answer: s[0],
        steps: n + ' 和 ' + m + ' 的最大公因數是 <b>' + g + '</b>。<br>' +
          '分子分母同除以 ' + g + '：' + n + ' ÷ ' + g + ' = <b>' + s[0] + '</b>，' + m + ' ÷ ' + g + ' = ' + s[1] + '。<br>' +
          '所以最簡分數是 <b>' + s[0] + '/' + s[1] + '</b>。'
      };
    }

    const cases = [[1, 2, '0.5'], [1, 4, '0.25'], [3, 4, '0.75'], [1, 5, '0.2'], [3, 5, '0.6'],
                   [7, 10, '0.7'], [9, 100, '0.09'], [25, 100, '0.25'], [1, 10, '0.1']];
    const cs = Kit.pick(cases);
    const correct = cs[2], v = cs[0] / cs[1];
    const fmt = x => String(parseFloat(x.toFixed(4)));
    // 誘答選項對應真實錯誤：小數點位置錯（差 10 倍）、把分子直接當小數、分子分母顛倒除
    const distract = [fmt(v * 10), fmt(v / 10), '0.' + cs[0], fmt(cs[1] / cs[0])]
      .filter(x => x !== correct && /^[0-9]+(\.[0-9]+)?$/.test(x));
    const uniq = [];
    distract.forEach(x => { if (uniq.indexOf(x) < 0) uniq.push(x); });
    const shuffled = Kit.shuffle([correct].concat(uniq.slice(0, 3)));
    return {
      q: '<b>' + cs[0] + '/' + cs[1] + '</b> 換成小數是多少？',
      choices: shuffled, answer: shuffled.indexOf(cs[2]),
      steps: '分數線就是<b>除號</b>：' + cs[0] + '/' + cs[1] + ' = ' + cs[0] + ' ÷ ' + cs[1] + ' = <b>' + cs[2] + '</b>。<br>' +
        '也可以先擴分成分母 10 或 100，再直接讀出小數。'
    };
  }
});
