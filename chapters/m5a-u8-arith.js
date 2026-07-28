/* ============================================================
   五上 數學（康軒）第 8 單元　整數四則運算
   課綱 R-5-1「三步驟問題併式：建立將計算步驟併式的習慣，以三步驟為主。
                介紹「平均」。與分配律連結。」
        R-5-2「四則計算規律（II）：乘除混合計算。「乘法對加法或減法的分配律」。
                將計算規律應用於簡化混合計算。熟練整數四則混合計算。」
   ============================================================ */

Kit.register('m5a-u8', {

  intro: '三個模式：<b>計算順序</b>一步一步看誰先算、<b>分配律</b>用長方形面積看為什麼成立、<b>平均</b>把高高低低的長條推平。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 300);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'order', step = 0, exprIdx = 0;
    let a = 6, b = 7, c = 3;                    // 分配律 a×(b+c)
    let bars = [8, 3, 6, 11, 2], avgT = 0;      // 平均

    /* ---------- 模式 A：計算順序 ---------- */
    const EXPRS = [
      { s: '120 − 3 × (8 + 12)', order: ['8 + 12 = 20', '3 × 20 = 60', '120 − 60 = 60'], why: ['括號先算', '再算乘除', '最後加減'] },
      { s: '48 ÷ 6 + 5 × 4', order: ['48 ÷ 6 = 8', '5 × 4 = 20', '8 + 20 = 28'], why: ['先乘除（由左往右先遇到 ÷）', '再算另一個乘除', '最後加減'] },
      { s: '100 − 36 ÷ 4 − 15', order: ['36 ÷ 4 = 9', '100 − 9 = 91', '91 − 15 = 76'], why: ['先乘除', '加減由左往右', '繼續由左往右'] },
      { s: '(25 + 15) ÷ 8 × 3', order: ['25 + 15 = 40', '40 ÷ 8 = 5', '5 × 3 = 15'], why: ['括號先算', '乘除由左往右，先遇到 ÷', '再算 ×'] },
      { s: '7 × 8 − 24 ÷ 3', order: ['7 × 8 = 56', '24 ÷ 3 = 8', '56 − 8 = 48'], why: ['先乘除', '另一個乘除', '最後減'] }
    ];

    function paintOrder() {
      const ctx = cv.ctx;
      const E = EXPRS[exprIdx];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('四則混合計算的約定：① 括號先算　② 先乘除後加減　③ 同級由左往右', 16, 24);

      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 30px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(E.s, cv.W / 2, 76);

      // 步驟卡
      E.order.forEach((o, i) => {
        const y = 116 + i * 56;
        const done = i < step, now = i === step;
        ctx.fillStyle = done ? 'rgba(52,211,153,.16)' : now ? 'rgba(77,163,255,.20)' : '#141d31';
        ctx.fillRect(100, y, 420, 46);
        ctx.strokeStyle = done ? '#34d399' : now ? '#4da3ff' : '#26355a';
        ctx.lineWidth = now ? 3 : 1;
        ctx.strokeRect(100, y, 420, 46);

        ctx.fillStyle = done ? '#34d399' : now ? '#4da3ff' : '#3a4c73';
        ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('第 ' + (i + 1) + ' 步', 116, y + 23);
        ctx.font = 'bold 19px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = (done || now) ? '#e8eefc' : '#3a4c73';
        ctx.fillText(step >= i ? o : '？', 190, y + 23);
        ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = (done || now) ? '#93a3c4' : '#2f4468';
        ctx.textAlign = 'right';
        ctx.fillText(step >= i ? E.why[i] : '', 508, y + 23);
      });

      const finalV = E.order[E.order.length - 1].split('=')[1].trim();
      readout.innerHTML =
        '<div class="big">' + E.s + (step >= E.order.length - 1 ? ' ＝ <b>' + finalV + '</b>' : ' ＝ ?') + '</div>' +
        '算式裡的運算<b>不是由左往右一路算下去</b>，有固定的優先順序：<br>' +
        '① <b>括號</b>先算　② 再算<b>乘、除</b>　③ 最後算<b>加、減</b>　④ 同一級的由<b>左往右</b><br>' +
        '<span style="color:var(--muted)">併式的意義：把「先算什麼、再算什麼」一次寫清楚，' +
        '不用分成好幾個算式。這是國中代數的重要基礎。</span>';
    }

    /* ---------- 模式 B：分配律（長方形面積） ---------- */
    function paintDist() {
      const ctx = cv.ctx;
      const U = Math.min(26, 420 / (b + c), 150 / a);
      const ox = 90, oy = 70;
      const w1 = b * U, w2 = c * U, h = a * U;

      ctx.fillStyle = 'rgba(77,163,255,.5)';
      ctx.fillRect(ox, oy, w1, h);
      ctx.fillStyle = 'rgba(52,211,153,.5)';
      ctx.fillRect(ox + w1, oy, w2, h);
      // 格線
      ctx.strokeStyle = 'rgba(11,18,32,.55)'; ctx.lineWidth = 1;
      for (let i = 1; i < b + c; i++) {
        ctx.beginPath(); ctx.moveTo(ox + i * U, oy); ctx.lineTo(ox + i * U, oy + h); ctx.stroke();
      }
      for (let j = 1; j < a; j++) {
        ctx.beginPath(); ctx.moveTo(ox, oy + j * U); ctx.lineTo(ox + w1 + w2, oy + j * U); ctx.stroke();
      }
      // 中間分隔線
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox + w1, oy - 8); ctx.lineTo(ox + w1, oy + h + 8); ctx.stroke();
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
      ctx.strokeRect(ox, oy, w1 + w2, h);

      // 標註
      ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(b, ox + w1 / 2, oy - 12);
      ctx.fillStyle = '#34d399';
      ctx.fillText(c, ox + w1 + w2 / 2, oy - 12);
      ctx.fillStyle = '#fb7185';
      ctx.save(); ctx.translate(ox - 20, oy + h / 2); ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText(a, 0, 0); ctx.restore();

      // 兩塊的面積
      ctx.fillStyle = '#0b1220'; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(a + '×' + b + '=' + a * b, ox + w1 / 2, oy + h / 2);
      ctx.fillText(a + '×' + c + '=' + a * c, ox + w1 + w2 / 2, oy + h / 2);

      readout.innerHTML =
        '<div class="big">' + a + ' × (' + b + ' ＋ ' + c + ') ＝ ' + a + '×' + b + ' ＋ ' + a + '×' + c +
        '　→　' + a * (b + c) + ' ＝ ' + a * b + ' ＋ ' + a * c + '</div>' +
        '<b>整塊看</b>：長方形的寬是 ' + b + '＋' + c + '＝' + (b + c) + '，高是 ' + a + '，面積 ' +
        a + ' × ' + (b + c) + ' ＝ <b>' + a * (b + c) + '</b>。<br>' +
        '<b>拆兩塊看</b>：藍色 ' + a + '×' + b + '＝' + a * b + '，綠色 ' + a + '×' + c + '＝' + a * c + '，加起來也是 <b>' + (a * b + a * c) + '</b>。<br>' +
        '同一個長方形，兩種數法，答案當然一樣——這就是<b>乘法對加法的分配律</b>。<br>' +
        '<span style="color:var(--muted)">實用價值：' + a + ' × ' + (b + c) + ' 不好心算，但拆成 ' +
        a + '×' + b + ' ＋ ' + a + '×' + c + ' 就容易多了。例如 8×102 ＝ 8×100 ＋ 8×2 ＝ 816。</span>';
    }

    /* ---------- 模式 C：平均 ---------- */
    function paintAvg() {
      const ctx = cv.ctx;
      const sum = bars.reduce((s, x) => s + x, 0);
      const avg = sum / bars.length;
      const U = 18, ox = 120, oy = 250, BW = 54;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('拉「推平進度」：把高的削掉、補給矮的，最後大家一樣高——那個高度就是平均', 16, 22);

      bars.forEach((v, i) => {
        const h = (v + (avg - v) * avgT) * U;
        const x = ox + i * (BW + 12);
        ctx.fillStyle = v > avg ? '#4da3ff' : '#34d399';
        ctx.fillRect(x, oy - h, BW, h);
        ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1;
        for (let j = 1; j < Math.round(v + (avg - v) * avgT); j++) {
          ctx.beginPath(); ctx.moveTo(x, oy - j * U); ctx.lineTo(x + BW, oy - j * U); ctx.stroke();
        }
        ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(parseFloat((v + (avg - v) * avgT).toFixed(1)), x + BW / 2, oy + 6);
      });

      // 平均線
      ctx.save(); ctx.setLineDash([7, 5]);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox - 30, oy - avg * U); ctx.lineTo(ox + bars.length * (BW + 12), oy - avg * U); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('平均 ' + parseFloat(avg.toFixed(2)), ox - 28, oy - avg * U - 6);
      // 地線
      ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox - 30, oy); ctx.lineTo(ox + bars.length * (BW + 12), oy); ctx.stroke();

      readout.innerHTML =
        '<div class="big">平均 ＝ (' + bars.join(' ＋ ') + ') ÷ ' + bars.length + ' ＝ ' + sum + ' ÷ ' + bars.length +
        ' ＝ <b>' + parseFloat(avg.toFixed(2)) + '</b></div>' +
        '平均的意思不是「中間那個數」，而是「<b>如果全部拉成一樣高，會是多高</b>」。<br>' +
        '總量 ' + sum + ' 沒有變，只是重新分配給 ' + bars.length + ' 個人。<br>' +
        '<span style="color:var(--muted)">所以平均一定介於<b>最小值 ' + Math.min.apply(null, bars) +
        '</b> 和<b>最大值 ' + Math.max.apply(null, bars) + '</b> 之間。' +
        '反過來也很有用：知道平均和個數，就能求總量（' + parseFloat(avg.toFixed(2)) + ' × ' + bars.length + ' ＝ ' + sum + '）。</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'order') paintOrder();
      else if (mode === 'dist') paintDist();
      else paintAvg();
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '計算順序', value: 'order' },
      { label: '分配律', value: 'dist' },
      { label: '平均', value: 'avg' }
    ], function (v) {
      mode = v;
      nextBtn.style.display = v === 'order' ? '' : 'none';
      exprSeg.wrap.style.display = v === 'order' ? '' : 'none';
      [aCtl, bCtl, cCtl].forEach(x => x.wrap.style.display = v === 'dist' ? '' : 'none');
      [avgCtl, diceBtn].forEach(x => x.style ? x.style.display = (v === 'avg' ? '' : 'none') : 0);
      avgCtl.wrap.style.display = v === 'avg' ? '' : 'none';
      diceBtn.style.display = v === 'avg' ? '' : 'none';
      step = 0; paint();
    }, mode);

    const exprSeg = Kit.segmented('換一題', EXPRS.map((e, i) => ({ label: '第 ' + (i + 1) + ' 題', value: i })),
      function (v) { exprIdx = v; step = 0; nextBtn.textContent = '下一步 →'; paint(); }, 0);

    const nextBtn = Kit.button('下一步 →', function () {
      const E = EXPRS[exprIdx];
      step = (step + 1) % (E.order.length + 1);
      if (step === 0) nextBtn.textContent = '下一步 →';
      else if (step >= E.order.length) nextBtn.textContent = '↩ 重看';
      paint();
    }, 'primary');

    const aCtl = Kit.slider('高（乘數）', { min: 2, max: 9, value: a, onChange: v => { a = v; paint(); } });
    const bCtl = Kit.slider('寬的第一段', { min: 1, max: 12, value: b, onChange: v => { b = v; paint(); } });
    const cCtl = Kit.slider('寬的第二段', { min: 1, max: 12, value: c, onChange: v => { c = v; paint(); } });
    const avgCtl = Kit.slider('推平進度', {
      min: 0, max: 100, value: 0, format: v => v + '%',
      onChange: v => { avgT = v / 100; paint(); }
    });
    const diceBtn = Kit.button('🎲 換一組數字', function () {
      bars = Array.from({ length: Kit.randInt(4, 6) }, () => Kit.randInt(1, 12));
      avgT = 0; avgCtl.input.value = 0; avgCtl.output.textContent = '0%';
      paint();
    });

    [aCtl, bCtl, cCtl].forEach(x => x.wrap.style.display = 'none');
    avgCtl.wrap.style.display = 'none';
    diceBtn.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(exprSeg.wrap);
    controls.appendChild(nextBtn);
    [aCtl, bCtl, cCtl].forEach(x => controls.appendChild(x.wrap));
    controls.appendChild(avgCtl.wrap);
    controls.appendChild(diceBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱 R-5-2 特別要求：要能<b>把應用問題轉成算式後，再用計算規律調整算式來簡化計算</b>。' +
        '分配律最實用的地方就在這——8×102 硬乘很煩，拆成 8×100＋8×2 心算就有了。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '計算順序模式：先問「你覺得哪個先算？」再按下一步。', why: '先預測再驗證。孩子最常犯的錯是「從左邊一路算下去」，讓他先錯一次印象最深。' },
    { ask: '「為什麼要規定先乘除後加減？不能自己決定嗎？」', why: '因為要讓全世界看到同一個算式時算出同一個答案。這是<b>約定</b>，不是道理——講清楚這點反而好記。' },
    { ask: '分配律模式：「這個長方形，你要一整塊數，還是分兩塊數？」', why: '兩種都對，答案一定一樣。分配律不是公式，是「同一塊面積的兩種數法」。' },
    { ask: '「8 × 102 你要怎麼心算？」', why: '拆成 8×100 ＋ 8×2 ＝ 816。這是分配律最有價值的用途，比證明它更重要。也可以問 6×99（＝6×100−6×1）。' },
    { ask: '平均模式：「平均會不會比最大的還大？會不會比最小的還小？」', why: '都不會。平均一定夾在中間。這是檢查答案的好方法——算出來跑出範圍就一定錯了。' }
  ],

  pitfalls: [
    { bad: '不管符號，一律由左往右算：120 − 3 × 20 算成 (120−3)×20。', fix: '順序是<b>括號 → 乘除 → 加減</b>，同一級才由左往右。' },
    { bad: '以為「先乘後除」——看到 48 ÷ 6 × 2 先算 6×2。', fix: '乘和除<b>同一級</b>，由左往右。48÷6×2 ＝ 8×2 ＝ 16，不是 48÷12 ＝ 4。', src: 'R-5-2「乘除混合計算」' },
    { bad: '分配律用錯地方：以為 (a＋b) ÷ c ＝ a÷c ＋ b÷c 一定成立，a ÷ (b＋c) 也能拆。', fix: '前者成立，<b>後者不成立</b>。a ÷ (b＋c) 不能拆成 a÷b ＋ a÷c。課綱也明訂不做 a ÷ (b ÷ c) 的去括號。', src: 'R-5-2 備註' },
    { bad: '把平均當成「最大和最小的中間值」。', fix: '平均是<b>總量 ÷ 個數</b>。1、1、1、9 的平均是 3，不是 5。' },
    { bad: '求平均時分母用錯（漏算 0 分或缺席的人）。', fix: '先確認「一共有幾個」。考 0 分也是一個人，要算進分母。' }
  ],

  quiz: function () {
    const type = Kit.pick(['order', 'order', 'dist', 'avg', 'avgback']);

    if (type === 'order') {
      const items = [
        { s: '120 − 3 × (8 + 12)', v: 60, st: '括號：8＋12＝20 → 乘：3×20＝60 → 減：120−60＝<b>60</b>' },
        { s: '48 ÷ 6 + 5 × 4', v: 28, st: '先乘除：48÷6＝8、5×4＝20 → 再加：8＋20＝<b>28</b>' },
        { s: '100 − 36 ÷ 4 − 15', v: 76, st: '先除：36÷4＝9 → 加減由左往右：100−9＝91 → 91−15＝<b>76</b>' },
        { s: '(25 + 15) ÷ 8 × 3', v: 15, st: '括號：25＋15＝40 → 乘除由左往右：40÷8＝5 → 5×3＝<b>15</b>' },
        { s: '7 × 8 − 24 ÷ 3', v: 48, st: '先乘除：7×8＝56、24÷3＝8 → 再減：56−8＝<b>48</b>' },
        { s: '72 ÷ 9 × 2', v: 16, st: '乘除<b>同一級，由左往右</b>：72÷9＝8 → 8×2＝<b>16</b><br>⚠️ 不是先算 9×2＝18 再除！' },
        { s: '5 + 4 × (10 − 7)', v: 17, st: '括號：10−7＝3 → 乘：4×3＝12 → 加：5＋12＝<b>17</b>' }
      ];
      const it = Kit.pick(items);
      return {
        q: '<b>' + it.s + '</b> ＝ ?',
        input: 'number', answer: it.v,
        steps: '順序：<b>括號 → 乘除 → 加減</b>，同級由左往右。<br>' + it.st
      };
    }

    if (type === 'dist') {
      const useSub = Math.random() < .4;
      const k = Kit.pick([4, 6, 7, 8, 9, 12, 15, 25]);
      const base = Kit.pick([100, 100, 200, 50, 20]);
      const d = Kit.randInt(1, 9);
      const n = useSub ? base - d : base + d;
      return {
        q: '用<b>分配律</b>心算：<b>' + k + ' × ' + n + '</b> ＝ ?',
        input: 'number', answer: k * n,
        steps: '把 ' + n + ' 拆成 ' + base + (useSub ? ' − ' : ' ＋ ') + d + '：<br>' +
          k + ' × ' + n + ' ＝ ' + k + ' × (' + base + (useSub ? ' − ' : ' ＋ ') + d + ')<br>' +
          '＝ ' + k + '×' + base + (useSub ? ' − ' : ' ＋ ') + k + '×' + d +
          ' ＝ ' + (k * base) + (useSub ? ' − ' : ' ＋ ') + (k * d) + ' ＝ <b>' + k * n + '</b><br>' +
          '<span style="color:var(--muted)">這就是課綱說的「利用計算規律調整算式進行計算解題」。</span>'
      };
    }

    if (type === 'avg') {
      const nums = Array.from({ length: Kit.randInt(4, 5) }, () => Kit.randInt(2, 20));
      const sum = nums.reduce((s, x) => s + x, 0);
      const avg = sum / nums.length;
      return {
        q: '這幾個數的<b>平均</b>是多少？　<b>' + nums.join('、') + '</b>',
        input: 'number', answer: parseFloat(avg.toFixed(4)), tolerance: 0.01,
        steps: '平均 ＝ <b>總和 ÷ 個數</b><br>' +
          '總和：' + nums.join(' ＋ ') + ' ＝ <b>' + sum + '</b><br>' +
          '個數：<b>' + nums.length + '</b><br>' +
          sum + ' ÷ ' + nums.length + ' ＝ <b>' + parseFloat(avg.toFixed(4)) + '</b><br>' +
          '檢查：答案應該介於最小的 ' + Math.min.apply(null, nums) + ' 和最大的 ' + Math.max.apply(null, nums) + ' 之間 ✅'
      };
    }

    const cnt = Kit.randInt(4, 8), avg2 = Kit.randInt(60, 95);
    return {
      q: '<b>' + cnt + '</b> 個人的平均分數是 <b>' + avg2 + '</b> 分。這 ' + cnt + ' 個人的<b>總分</b>是多少？',
      input: 'number', answer: cnt * avg2, unit: '分',
      steps: '平均 ＝ 總和 ÷ 個數，反過來就是 <b>總和 ＝ 平均 × 個數</b>。<br>' +
        avg2 + ' × ' + cnt + ' ＝ <b>' + cnt * avg2 + '</b> 分。<br>' +
        '<span style="color:var(--muted)">「平均」的意思是「如果每個人都一樣，會是幾分」——' +
        cnt + ' 個人每人 ' + avg2 + ' 分，總分當然就是相乘。</span>'
    };
  }
});
