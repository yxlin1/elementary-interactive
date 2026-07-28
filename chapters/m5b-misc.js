/* ============================================================
   教具 m5b-u8 比率與百分率　m5b-u9 時間的乘除　m5b-u10 生活中的大單位
   南一 115：五下 第 8／五上 第 9／五下 第 7 單元
   課綱 N-5-10 / N-5-16 / N-5-12・N-5-13
   ============================================================ */

(function () {

  /* ============================================================
     第 8 單元　比率與百分率
     N-5-10「解題：比率與應用。整數相除的應用。含「百分率」、「折」、「成」。」
             備註：本條目限結果不大於 1（100%）的應用情境。
     ============================================================ */
  Kit.register('m5b-u8', {

    intro: '一格代表 1%，整個方陣是 100%。拖曳看「幾分之幾 → 小數 → 百分率 → 幾折 → 幾成」其實是<b>同一件事的五種說法</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let pct = 75, mode = 'grid', price = 800;

      function paintGrid() {
        const ctx = cv.ctx;
        const C = 24, ox = 40, oy = 42;
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('整個方陣 100 格 ＝ 100% ＝ 「1」。塗滿幾格就是百分之幾', 16, 24);

        for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
          const i = r * 10 + c;
          ctx.fillStyle = i < pct ? '#4da3ff' : '#16203a';
          ctx.fillRect(ox + c * C, oy + r * C, C - 2, C - 2);
        }
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
        ctx.strokeRect(ox - 1, oy - 1, 10 * C, 10 * C);

        // 右側五種說法
        const g = Kit.gcd(pct, 100);
        const rows = [
          ['分數', pct + '/100' + (g > 1 ? ' ＝ ' + (pct / g) + '/' + (100 / g) : ''), '#7c5cff'],
          ['小數', String(pct / 100), '#4da3ff'],
          ['百分率', pct + '%', '#fbbf24'],
          ['折扣', pct % 10 === 0 ? (pct / 10) + ' 折' : (pct % 5 === 0 ? (pct / 10) + ' 折' : '（不是整數折）'), '#34d399'],
          ['成數', pct % 10 === 0 ? (pct / 10) + ' 成' : (pct / 10) + ' 成', '#fb7185']
        ];
        rows.forEach((r, i) => {
          const y = 60 + i * 46;
          ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(r[0], 320, y);
          ctx.fillStyle = r[2]; ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
          ctx.fillText(r[1], 390, y);
        });

        readout.innerHTML =
          '<div class="big">' + pct + ' / 100 ＝ ' + (pct / 100) + ' ＝ <b>' + pct + '%</b>' +
          (pct % 10 === 0 ? ' ＝ ' + (pct / 10) + ' 折 ＝ ' + (pct / 10) + ' 成' : '') + '</div>' +
          '「<b>百分率</b>」就是「把整體看成 100 份，佔其中幾份」。所以 % 這個符號本身就代表「/100」。<br>' +
          '<b>幾折</b>＝現在賣原價的幾成。' + (pct % 10 === 0 ? pct / 10 : (pct / 10).toFixed(1)) +
          ' 折 ＝ 原價的 ' + pct + '%，<b>不是</b>便宜 ' + pct + '%。<br>' +
          '<b>幾成</b>＝十分之幾。' + (pct / 10) + ' 成 ＝ ' + (pct / 10) + '/10 ＝ ' + pct + '%。<br>' +
          '<span style="color:var(--muted)">課綱這一階段<b>只處理不超過 100% 的情境</b>（超過 1 的留到六年級）。</span>';
      }

      function paintShop() {
        const ctx = cv.ctx;
        const pay = Math.round(price * pct / 100);
        const save = price - pay;

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('原價 ' + price + ' 元的東西，打 ' + (pct / 10).toFixed(pct % 10 ? 1 : 0) + ' 折', 16, 24);

        const bx = 60, bw = 500, bh = 64;
        // 原價條
        ctx.fillStyle = '#16203a'; ctx.fillRect(bx, 56, bw, bh);
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, 56, bw, bh);
        ctx.fillStyle = '#93a3c4'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('原價 ' + price + ' 元 ＝ 100%', bx + bw / 2, 56 + bh / 2);

        // 折後條
        ctx.fillStyle = '#4da3ff'; ctx.fillRect(bx, 152, bw * pct / 100, bh);
        ctx.fillStyle = 'rgba(251,113,133,.28)'; ctx.fillRect(bx + bw * pct / 100, 152, bw * (100 - pct) / 100, bh);
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, 152, bw, bh);
        ctx.fillStyle = '#0b1220'; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (pct > 18) ctx.fillText('要付 ' + pay + ' 元', bx + bw * pct / 200, 152 + bh / 2);
        ctx.fillStyle = '#fb7185';
        if (100 - pct > 18) ctx.fillText('省下 ' + save + ' 元', bx + bw * pct / 100 + bw * (100 - pct) / 200, 152 + bh / 2);

        ctx.fillStyle = '#4da3ff'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('付 ' + pct + '%', bx, 224);
        ctx.fillStyle = '#fb7185'; ctx.textAlign = 'right';
        ctx.fillText('省 ' + (100 - pct) + '%', bx + bw, 224);

        readout.innerHTML =
          '<div class="big">原價 ' + price + ' 元，打 ' + (pct / 10).toFixed(pct % 10 ? 1 : 0) + ' 折 → 要付 <b>' + pay + '</b> 元（省 ' + save + ' 元）</div>' +
          '<b style="color:var(--warn)">最重要的觀念：「打 ' + (pct / 10).toFixed(pct % 10 ? 1 : 0) + ' 折」是<b>付原價的 ' + pct + '%</b>，不是「便宜 ' + pct + '%」。</b><br>' +
          '算法：' + price + ' × ' + (pct / 100) + ' ＝ <b>' + pay + '</b> 元<br>' +
          '省下的：' + price + ' − ' + pay + ' ＝ ' + save + ' 元，也就是原價的 ' + (100 - pct) + '%。<br>' +
          '<span style="color:var(--muted)">台灣的「8 折」是付 80%；有些國家寫「20% off」才是省 20%。' +
          '兩種說法指的是<b>同一個價錢</b>，只是從不同角度講。</span>';
      }

      function paint() {
        cv.clear('#0e1726');
        if (mode === 'grid') paintGrid(); else paintShop();
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '百分率是什麼', value: 'grid' },
        { label: '打折怎麼算', value: 'shop' }
      ], function (v) { mode = v; priceCtl.wrap.style.display = v === 'shop' ? '' : 'none'; paint(); }, mode);

      const pctCtl = Kit.slider('百分率', { min: 0, max: 100, value: pct, format: v => v + '%', onChange: v => { pct = v; paint(); } });
      const priceCtl = Kit.slider('原價', { min: 50, max: 3000, step: 50, value: price, format: v => v + ' 元', onChange: v => { price = v; paint(); } });
      priceCtl.wrap.style.display = 'none';
      const quick = Kit.segmented('常見', [
        { label: '一半 50%', value: 50 }, { label: '8 折', value: 80 },
        { label: '75%＝3/4', value: 75 }, { label: '2 成 20%', value: 20 }
      ], function (v) { pct = v; pctCtl.input.value = v; pctCtl.output.textContent = v + '%'; paint(); }, 75);

      controls.appendChild(modeSeg.wrap);
      controls.appendChild(pctCtl.wrap);
      controls.appendChild(priceCtl.wrap);
      controls.appendChild(quick.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '一句話記住：<b>% 就是「/100」</b>。75% ＝ 75/100 ＝ 0.75 ＝ 3/4，四種寫法完全一樣。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「50% 是多少？1/2 是多少？0.5 是多少？」', why: '都一樣。先建立「同一件事的四種說法」，之後看到任何一種都能互換。' },
      { ask: '「打 8 折是便宜 80% 還是付 80%？」', why: '<b>付 80%</b>。這是全單元最容易錯、也最實用的一題。切到打折模式讓他看兩段長度。' },
      { ask: '逛街時實測：「這件 1200 元打 7 折，多少錢？」', why: '840。這一章的最大價值就是能用在生活裡。買東西時隨口問，效果比寫十題好。' },
      { ask: '「3 成是多少百分比？」', why: '30%。成 ＝ 十分之幾。台灣新聞常說「業績成長三成」，順便講。' },
      { ask: '「考 20 題對 15 題，答對率多少？」', why: '15 ÷ 20 ＝ 0.75 ＝ 75%。比率的本質就是<b>整數相除</b>，這一點課綱寫得很清楚。' }
    ],

    pitfalls: [
      { bad: '以為「打 8 折」＝ 便宜 80%（只付 20%）。', fix: '台灣的「8 折」是<b>付原價的 80%</b>，省 20%。折數越小才越便宜（3 折比 8 折便宜）。' },
      { bad: '把 % 和小數換算搞錯：75% 寫成 7.5 或 0.075。', fix: '% 就是 ÷100。75% ＝ 75 ÷ 100 ＝ <b>0.75</b>。' },
      { bad: '算比率時分子分母顛倒。', fix: '「A 佔 B 的幾成」＝ <b>A ÷ B</b>。先想清楚誰是「整體」，整體當分母。' },
      { bad: '成和折搞混。', fix: '「幾成」是十分之幾（3 成 ＝ 30%）；「幾折」是付原價的幾成（3 折 ＝ 付 30%）。數字一樣但語境不同。' },
      { bad: '連續打折時把折數相加（先打 8 折再打 9 折 ＝ 打 7 折）。', fix: '要<b>相乘</b>：0.8 × 0.9 ＝ 0.72，等於 7.2 折。（這已超出五年級範圍，但孩子問起可以講。）' }
    ],

    quiz: function () {
      const type = Kit.pick(['conv', 'discount', 'rate', 'discount']);

      if (type === 'conv') {
        const cases = [['1/2', 50], ['1/4', 25], ['3/4', 75], ['1/5', 20], ['2/5', 40],
                       ['3/5', 60], ['1/10', 10], ['7/10', 70], ['1/20', 5], ['9/20', 45]];
        const c = Kit.pick(cases);
        return {
          q: '<b>' + c[0] + '</b> 是百分之幾？',
          input: 'number', answer: c[1], unit: '%',
          steps: '把分母擴分成 100：<br>' + c[0] + ' ＝ ' + c[1] + '/100 ＝ <b>' + c[1] + '%</b><br>' +
            '也可以先換成小數：' + c[0].replace('/', ' ÷ ') + ' ＝ ' + (c[1] / 100) + '，再 × 100 ＝ ' + c[1] + '%。'
        };
      }

      if (type === 'discount') {
        const p = Kit.randInt(2, 40) * 50;
        const d = Kit.pick([5, 6, 7, 75, 8, 85, 9]);
        const pctv = d > 10 ? d : d * 10;
        const pay = Math.round(p * pctv / 100);
        const askPay = Math.random() < .7;
        return {
          q: '原價 <b>' + p + '</b> 元的東西，打 <b>' + (pctv / 10) + ' 折</b>，' + (askPay ? '要付多少錢？' : '<b>省下</b>多少錢？'),
          input: 'number', answer: askPay ? pay : p - pay, unit: '元',
          steps: '⚠️ 打 ' + (pctv / 10) + ' 折 ＝ <b>付原價的 ' + pctv + '%</b>（不是便宜 ' + pctv + '%）。<br>' +
            '要付：' + p + ' × ' + (pctv / 100) + ' ＝ <b>' + pay + '</b> 元<br>' +
            '省下：' + p + ' − ' + pay + ' ＝ <b>' + (p - pay) + '</b> 元（原價的 ' + (100 - pctv) + '%）<br>' +
            '答案是 <b>' + (askPay ? pay : p - pay) + '</b> 元。'
        };
      }

      const total = Kit.pick([20, 25, 40, 50, 80, 200]);
      const got = Kit.randInt(1, total);
      const r = got / total * 100;
      if (Math.abs(r - Math.round(r)) > 1e-9) {
        const got2 = Math.round(total * Kit.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9]));
        return {
          q: '全班 <b>' + total + '</b> 人，其中 <b>' + got2 + '</b> 人戴眼鏡。戴眼鏡的佔全班的百分之幾？',
          input: 'number', answer: parseFloat((got2 / total * 100).toFixed(4)), tolerance: 0.01, unit: '%',
          steps: '比率 ＝ <b>部分 ÷ 整體</b>（整體當分母）<br>' +
            got2 + ' ÷ ' + total + ' ＝ ' + parseFloat((got2 / total).toFixed(6)) + '<br>' +
            '再 × 100 → <b>' + parseFloat((got2 / total * 100).toFixed(4)) + '%</b>'
        };
      }
      return {
        q: '考試 <b>' + total + '</b> 題，答對 <b>' + got + '</b> 題。答對率是百分之幾？',
        input: 'number', answer: Math.round(r), tolerance: 0.01, unit: '%',
        steps: '比率 ＝ <b>部分 ÷ 整體</b>：' + got + ' ÷ ' + total + ' ＝ ' + (got / total) + '<br>' +
          '× 100 → <b>' + Math.round(r) + '%</b><br>' +
          '<span style="color:var(--muted)">課綱：比率的本質就是「整數相除的應用」。</span>'
      };
    }
  });


  /* ============================================================
     第 9 單元　時間的乘除
     N-5-16「解題：時間的乘除問題。在分數和小數學習的範圍內，
             解決與時間相關的乘除問題。」
             備註：含以分數和小數表示的時間量。可含工程問題。
     ============================================================ */
  Kit.register('m5b-u9', {

    intro: '時間不是十進位——1 小時是 <b>60</b> 分，不是 100 分。所以「0.5 小時」是 30 分，「1/4 小時」是 15 分。拖曳指針看對照。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mins = 45;

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const cx = 165, cy = 155, R = 108;

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('一整圈 ＝ 60 分 ＝ 1 小時。塗色的部分是 ' + mins + ' 分', 16, 22);

        // 鐘面
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = '#16203a'; ctx.fill();
        // 扇形
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + mins / 60 * Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(77,163,255,.55)'; ctx.fill();
        // 刻度
        for (let i = 0; i < 60; i++) {
          const a = -Math.PI / 2 + i / 60 * Math.PI * 2;
          const big = i % 5 === 0;
          ctx.strokeStyle = big ? '#e8eefc' : '#3a4c73'; ctx.lineWidth = big ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (R - (big ? 12 : 6)), cy + Math.sin(a) * (R - (big ? 12 : 6)));
          ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          ctx.stroke();
          if (big) {
            ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(i === 0 ? '0' : i, cx + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26));
          }
        }
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        // 指針
        const a2 = -Math.PI / 2 + mins / 60 * Math.PI * 2;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a2) * (R - 14), cy + Math.sin(a2) * (R - 14)); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

        // 右側三種寫法
        const g = Kit.gcd(mins, 60) || 1;
        // 約分後分母若變成 1（60 分、120 分…），要寫成「1 小時」而不是「1/1 小時」
        const fracTxt = mins === 0 ? '0 小時'
          : (60 / g === 1 ? (mins / g) + ' 小時' : (mins / g) + '/' + (60 / g) + ' 小時');
        const rows = [
          ['幾分', mins + ' 分', '#e8eefc'],
          ['分數（小時）', fracTxt, '#7c5cff'],
          ['小數（小時）', parseFloat((mins / 60).toFixed(4)) + ' 小時', '#4da3ff'],
          ['幾時幾分', Math.floor(mins / 60) + ' 時 ' + (mins % 60) + ' 分', '#34d399']
        ];
        rows.forEach((r, i) => {
          const y = 66 + i * 52;
          ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(r[0], 310, y);
          ctx.fillStyle = r[2]; ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
          ctx.fillText(r[1], 310, y + 22);
        });

        readout.innerHTML =
          '<div class="big">' + mins + ' 分 ＝ ' + fracTxt + ' ＝ ' + parseFloat((mins / 60).toFixed(4)) + ' 小時</div>' +
          '換算方法：<b>分 ÷ 60 ＝ 小時</b>，<b>小時 × 60 ＝ 分</b>。<br>' +
          mins + ' ÷ 60 ＝ ' + fracTxt + '（約分後）＝ ' + parseFloat((mins / 60).toFixed(4)) + ' 小時<br>' +
          '<span style="color:var(--muted)">課綱常用的幾個要記熟：' +
          '15 分 ＝ 1/4 時、20 分 ＝ 1/3 時、30 分 ＝ 1/2 時、40 分 ＝ 2/3 時、45 分 ＝ 3/4 時。<br>' +
          '<b>⚠️ 時間不是十進位</b>：0.5 小時是 30 分不是 50 分；1.5 小時是 90 分不是 150 分。</span>';
      }

      const minCtl = Kit.slider('分鐘', { min: 0, max: 120, value: mins, format: v => v + ' 分', onChange: v => { mins = v; paint(); } });
      const quickSeg = Kit.segmented('常見', [
        { label: '15分 1/4時', value: 15 }, { label: '20分 1/3時', value: 20 },
        { label: '30分 1/2時', value: 30 }, { label: '45分 3/4時', value: 45 }
      ], function (v) {
        // 用持有的參照更新滑桿，不要靠 querySelector 去猜 DOM 結構
        mins = v;
        minCtl.input.value = v;
        minCtl.output.textContent = v + ' 分';
        paint();
      }, 45);
      controls.appendChild(minCtl.wrap);
      controls.appendChild(quickSeg.wrap);

      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '課綱備註提到這一單元<b>可含工程問題</b>（例如「一個人 6 小時做完，兩個人一起要多久」）。' +
          '關鍵是先算出「一小時能做多少」。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「0.5 小時是幾分鐘？」', why: '30 分。很多孩子直覺答 50 分，因為習慣了十進位。時間是 <b>60 進位</b>，這一點要一直提醒。' },
      { ask: '「15 分是幾分之幾小時？」', why: '1/4。15/60 約分成 1/4。這幾個常見的（15、20、30、40、45 分）值得記熟。' },
      { ask: '「一集卡通 25 分鐘，看 3 集要多久？」', why: '75 分 ＝ 1 小時 15 分。時間的乘法要記得<b>滿 60 進位</b>，不能寫成 1.15 小時。' },
      { ask: '「走路 1.5 小時是幾分鐘？」', why: '90 分。1.5 × 60。注意不是 150 分。' },
      { ask: '工程問題：「媽媽一個人打掃要 6 小時，爸爸要 3 小時，兩個人一起要多久？」', why: '先算「一小時各做多少」：1/6 ＋ 1/3 ＝ 1/2，所以 2 小時。這題有點難，答不出來沒關係，能理解「先算一小時做多少」就很好。' }
    ],

    pitfalls: [
      { bad: '把時間當十進位：0.5 小時 ＝ 50 分。', fix: '1 小時 ＝ <b>60</b> 分。0.5 × 60 ＝ <b>30</b> 分。' },
      { bad: '75 分寫成 1.75 小時。', fix: '75 分 ＝ 1 小時 15 分 ＝ 1.25 小時（15 ÷ 60 ＝ 0.25）。不能直接把「分」的數字接在小數點後。' },
      { bad: '時間相加不進位：40 分 ＋ 35 分 ＝ 75 分就停住。', fix: '滿 60 要進位成 <b>1 小時 15 分</b>。' },
      { bad: '算「幾點到幾點共多久」時跨午或跨日算錯。', fix: '先換成 24 小時制再相減。跨日要加 24 小時。' },
      { bad: '工程問題直接把兩人的時間相加或平均。', fix: '要算<b>工作速率</b>：一小時各做全部的幾分之幾，加起來後再取倒數。' }
    ],

    quiz: function () {
      const type = Kit.pick(['tofrac', 'tomin', 'multiply', 'work']);

      if (type === 'tofrac') {
        const m = Kit.pick([5, 10, 12, 15, 20, 24, 30, 36, 40, 45, 48, 50]);
        const g = Kit.gcd(m, 60);
        return {
          q: '<b>' + m + ' 分</b>是幾分之幾小時？（填<b>分母</b>，記得約分）',
          input: 'number', answer: 60 / g,
          steps: '1 小時 ＝ 60 分，所以 ' + m + ' 分 ＝ <b>' + m + '/60</b> 小時。<br>' +
            '約分（同除以 ' + g + '）→ <b>' + (m / g) + '/' + (60 / g) + '</b> 小時，分母是 <b>' + (60 / g) + '</b>。'
        };
      }

      if (type === 'tomin') {
        const cases = [[0.5, 30], [0.25, 15], [0.75, 45], [1.5, 90], [2.5, 150],
                       [0.2, 12], [1.25, 75], [0.1, 6], [3.5, 210]];
        const c = Kit.pick(cases);
        return {
          q: '<b>' + c[0] + ' 小時</b>是幾分鐘？',
          input: 'number', answer: c[1], unit: '分',
          steps: '小時換分鐘要 <b>× 60</b>（不是 × 100！）：<br>' +
            c[0] + ' × 60 ＝ <b>' + c[1] + '</b> 分<br>' +
            '<span style="color:var(--muted)">⚠️ 時間是 60 進位，不是十進位。0.5 小時是 30 分，不是 50 分。</span>'
        };
      }

      if (type === 'multiply') {
        const per = Kit.pick([12, 18, 22, 25, 35, 45, 50]);
        const times = Kit.randInt(2, 6);
        const tot = per * times;
        return {
          q: '一集影片 <b>' + per + '</b> 分鐘，連看 <b>' + times + '</b> 集，總共幾分鐘？' +
            '（再換算成幾小時幾分：<b>只填總分鐘數</b>）',
          input: 'number', answer: tot, unit: '分',
          steps: per + ' × ' + times + ' ＝ <b>' + tot + '</b> 分<br>' +
            '換算：' + tot + ' ÷ 60 ＝ <b>' + Math.floor(tot / 60) + ' 小時 ' + (tot % 60) + ' 分</b><br>' +
            '<span style="color:var(--muted)">滿 60 分要進位成 1 小時，不能寫成 ' +
            Math.floor(tot / 60) + '.' + (tot % 60) + ' 小時。</span>'
        };
      }

      const a = Kit.pick([2, 3, 4, 6]), b = Kit.pick([3, 4, 6, 12]);
      const together = 1 / (1 / a + 1 / b);
      return {
        q: '一件工作，哥哥一個人做要 <b>' + a + '</b> 小時，妹妹一個人做要 <b>' + b + '</b> 小時。' +
          '兩人一起做要幾小時？（除不盡就四捨五入到小數第二位）',
        input: 'number', answer: parseFloat(together.toFixed(2)), tolerance: 0.02, unit: '小時',
        steps: '先算<b>一小時各做多少</b>：<br>' +
          '哥哥 1/' + a + '，妹妹 1/' + b + '<br>' +
          '一起一小時做：1/' + a + ' ＋ 1/' + b + ' ＝ ' + parseFloat((1 / a + 1 / b).toFixed(4)) + '（全部的比例）<br>' +
          '做完整件要：1 ÷ ' + parseFloat((1 / a + 1 / b).toFixed(4)) + ' ＝ <b>' + parseFloat(together.toFixed(2)) + '</b> 小時<br>' +
          '<span style="color:var(--muted)">⚠️ 不能把 ' + a + ' 和 ' + b + ' 相加或平均。要先換成「速率」再相加。</span>'
      };
    }
  });


  /* ============================================================
     第 10 單元　生活中的大單位
     N-5-12「面積：「公畝」、「公頃」、「平方公里」。含與「平方公尺」的換算。」
     N-5-13「重量：「公噸」。含與「公斤」的換算與計算。」
     ============================================================ */
  Kit.register('m5b-u10', {

    intro: '大單位最難的不是換算，是<b>量感</b>——「1 公頃到底多大」。這裡用操場、教室、大象來對照，先建立感覺再記數字。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 320);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'area', unit = 'ha';

      const AREA = {
        m2:  { n: '1 平方公尺', side: 1, ref: '大約是一張<b>雙人書桌</b>的桌面，或一個人張開手臂站著的空間。' },
        a:   { n: '1 公畝', side: 10, ref: '邊長 10 公尺的正方形 ＝ <b>100 平方公尺</b>，大約是<b>兩間教室</b>。' },
        ha:  { n: '1 公頃', side: 100, ref: '邊長 100 公尺的正方形 ＝ <b>10000 平方公尺</b>，大約是<b>一個標準足球場</b>，或一個小學的操場加校舍。' },
        km2: { n: '1 平方公里', side: 1000, ref: '邊長 1000 公尺（1 公里）＝ <b>1000000 平方公尺</b> ＝ <b>100 公頃</b>，大約是<b>一個小型市鎮</b>的大小。' }
      };

      function paintArea() {
        const ctx = cv.ctx;
        const U = AREA[unit], side = U.side;
        const box = 220, ox = 60, oy = 56;

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('大正方形 ＝ ' + U.n + '（邊長 ' + side + ' 公尺）', 16, 24);

        ctx.fillStyle = 'rgba(77,163,255,.22)';
        ctx.fillRect(ox, oy, box, box);
        ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, box, box);

        // 內部切成 10×10（若適用）
        if (side >= 10) {
          ctx.strokeStyle = 'rgba(77,163,255,.35)'; ctx.lineWidth = 1;
          for (let i = 1; i < 10; i++) {
            ctx.beginPath(); ctx.moveTo(ox + i * box / 10, oy); ctx.lineTo(ox + i * box / 10, oy + box); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ox, oy + i * box / 10); ctx.lineTo(ox + box, oy + i * box / 10); ctx.stroke();
          }
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(ox, oy + box - box / 10, box / 10, box / 10);
          ctx.fillStyle = '#0b1220'; ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const smallName = side === 10 ? '1 m²' : side === 100 ? '1 公畝' : '1 公頃';
          ctx.fillText('', ox + box / 20, oy + box - box / 20);
          ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('黃色小格 ＝ ' + smallName + '（共 100 格）', ox, oy + box + 10);
        }

        // 邊長標註
        ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(side + ' 公尺', ox + box / 2, oy - 8);

        // 右側：換算階梯
        const rows = [
          ['1 平方公尺', '1 m²', unit === 'm2'],
          ['1 公畝 ＝ 100 平方公尺', '10 m × 10 m', unit === 'a'],
          ['1 公頃 ＝ 100 公畝 ＝ 10000 平方公尺', '100 m × 100 m', unit === 'ha'],
          ['1 平方公里 ＝ 100 公頃 ＝ 1000000 平方公尺', '1000 m × 1000 m', unit === 'km2']
        ];
        rows.forEach((r, i) => {
          const y = 70 + i * 56;
          ctx.fillStyle = r[2] ? 'rgba(251,191,36,.16)' : '#141d31';
          ctx.fillRect(316, y - 18, 280, 44);
          ctx.strokeStyle = r[2] ? '#fbbf24' : '#26355a'; ctx.lineWidth = r[2] ? 2 : 1;
          ctx.strokeRect(316, y - 18, 280, 44);
          ctx.fillStyle = r[2] ? '#fbbf24' : '#93a3c4';
          ctx.font = (r[2] ? 'bold ' : '') + '13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(r[0], 328, y - 4);
          ctx.fillStyle = '#5a6b8c'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.fillText(r[1], 328, y + 14);
        });

        readout.innerHTML =
          '<div class="big">' + U.n + '</div>' + U.ref + '<br><br>' +
          '<b>換算的規律</b>：每往上一級，邊長 ×10，面積就 <b>×100</b>。<br>' +
          '1 平方公尺 → 1 公畝（×100）→ 1 公頃（×100）→ 1 平方公里（×100）<br>' +
          '<span style="color:var(--muted)">為什麼是 ×100 不是 ×10？因為長和寬<b>都</b>變 10 倍，10 × 10 ＝ 100。' +
          '這一點和長度單位（公分→公尺 是 ×100，公尺→公里 是 ×1000）不一樣，很容易混。<br>' +
          '課綱：這一單元的重點是<b>量感</b>，要用學生熟悉的生活示例，不是背零的個數。</span>';
      }

      function paintWeight() {
        const ctx = cv.ctx;
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('1 公噸 ＝ 1000 公斤。用生活中的東西感覺一下有多重', 16, 24);

        const items = [
          { n: '一本課本', kg: 0.5 }, { n: '一袋米', kg: 5 }, { n: '一個五年級學生', kg: 35 },
          { n: '一台機車', kg: 130 }, { n: '一頭牛', kg: 500 }, { n: '一台小轎車', kg: 1300 },
          { n: '一頭大象', kg: 4000 }
        ];
        const maxKg = 4000;
        items.forEach((it, i) => {
          const y = 52 + i * 34;
          const w = Math.max(6, 420 * Math.log10(it.kg * 2 + 1) / Math.log10(maxKg * 2 + 1));
          ctx.fillStyle = it.kg >= 1000 ? '#fb7185' : '#4da3ff';
          ctx.fillRect(140, y, w, 22);
          ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(it.n, 132, y + 11);
          ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(it.kg >= 1000 ? (it.kg / 1000) + ' 公噸' : it.kg + ' 公斤', 148 + w, y + 11);
        });
        // 1 公噸分界
        const x1 = 140 + 420 * Math.log10(1000 * 2 + 1) / Math.log10(maxKg * 2 + 1);
        ctx.save(); ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, 42); ctx.lineTo(x1, 296); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('1 公噸', x1, 300 - 22);

        readout.innerHTML =
          '<div class="big">1 公噸 ＝ <b>1000</b> 公斤</div>' +
          '什麼時候會用到公噸？<b>車子、貨櫃、大型動物、建材、垃圾量</b>——公斤數字太大時就換公噸。<br>' +
          '例：一台小轎車約 1.3 公噸；一頭大象約 4 公噸；一台垃圾車一趟載 5～10 公噸。<br>' +
          '<span style="color:var(--muted)">換算：<b>公斤 ÷ 1000 ＝ 公噸</b>，<b>公噸 × 1000 ＝ 公斤</b>。<br>' +
          '重量的階梯：公克 →（×1000）→ 公斤 →（×1000）→ 公噸。每一級都是 1000，比面積單位好記。</span>';
      }

      function paint() {
        cv.clear('#0e1726');
        if (mode === 'area') paintArea(); else paintWeight();
      }

      const modeSeg = Kit.segmented('類別', [
        { label: '面積大單位', value: 'area' },
        { label: '重量：公噸', value: 'weight' }
      ], function (v) { mode = v; unitSeg.wrap.style.display = v === 'area' ? '' : 'none'; paint(); }, mode);

      const unitSeg = Kit.segmented('看哪一個', [
        { label: '1 平方公尺', value: 'm2' }, { label: '1 公畝', value: 'a' },
        { label: '1 公頃', value: 'ha' }, { label: '1 平方公里', value: 'km2' }
      ], function (v) { unit = v; paint(); }, unit);

      controls.appendChild(modeSeg.wrap);
      controls.appendChild(unitSeg.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '面積單位每一級都是 <b>×100</b>（因為長寬各 ×10），長度單位才是 ×10 或 ×1000。這是最常搞混的地方。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「你覺得我們學校的操場大概幾公頃？」', why: '通常 1～2 公頃。先讓孩子猜，再對照畫面。量感是這一單元的目的，不是換算練習。' },
      { ask: '「1 公頃是幾平方公尺？為什麼是 10000 不是 100？」', why: '因為邊長 100 公尺，100 × 100 ＝ 10000。長和寬<b>都</b>變大，所以面積變 100 倍不是 10 倍。' },
      { ask: '「1 平方公里是幾公頃？」', why: '100 公頃。邊長從 100 公尺變 1000 公尺（×10），面積 ×100。' },
      { ask: '「1 公噸有多重？家裡的車大概幾公噸？」', why: '1000 公斤；小轎車約 1.3 公噸。查一下車門邊的標示，是很好的實地驗證。' },
      { ask: '看新聞時問：「這則說『燒毀 30 公頃森林』，那大概是幾個操場？」', why: '約 20～30 個操場。把新聞裡的大單位換成孩子有感覺的東西，這一章就活起來了。' }
    ],

    pitfalls: [
      { bad: '以為面積單位每級是 ×10（1 公頃 ＝ 100 平方公尺）。', fix: '面積每級是 <b>×100</b>，因為長寬各 ×10。1 公頃 ＝ <b>10000</b> 平方公尺。' },
      { bad: '把公畝和公頃搞反。', fix: '<b>公畝</b>小（10 m × 10 m ＝ 100 m²），<b>公頃</b>大（100 m × 100 m ＝ 10000 m²）。1 公頃 ＝ 100 公畝。' },
      { bad: '死背換算但完全沒有量感。', fix: '課綱明訂要「運用學生熟悉的生活示例，體會各單位的量感」。記住「1 公頃 ≈ 一個足球場」比記 10000 有用。', src: 'N-5-12 備註' },
      { bad: '公噸和公斤搞混，或以為 1 公噸 ＝ 100 公斤。', fix: '<b>1 公噸 ＝ 1000 公斤</b>。重量階梯：公克 → 公斤 → 公噸，每級 ×1000。' },
      { bad: '換算時方向弄反（該乘的時候除）。', fix: '口訣：<b>大單位換小單位用乘，小單位換大單位用除</b>。（公噸→公斤是大換小，×1000。）' }
    ],

    quiz: function () {
      const type = Kit.pick(['area', 'area', 'weight', 'sense']);

      if (type === 'area') {
        const cases = [
          ['1 公頃是多少平方公尺？', 10000, '平方公尺'],
          ['1 公畝是多少平方公尺？', 100, '平方公尺'],
          ['1 平方公里是多少公頃？', 100, '公頃'],
          ['1 公頃是多少公畝？', 100, '公畝'],
          ['3 公頃是多少平方公尺？', 30000, '平方公尺'],
          ['50000 平方公尺是多少公頃？', 5, '公頃'],
          ['2 平方公里是多少公頃？', 200, '公頃'],
          ['1 平方公里是多少平方公尺？', 1000000, '平方公尺']
        ];
        const c = Kit.pick(cases);
        return {
          q: '<b>' + c[0] + '</b>',
          input: 'number', answer: c[1], unit: c[2],
          steps: '面積單位階梯（每級 <b>×100</b>）：<br>' +
            '平方公尺 →（×100）→ 公畝 →（×100）→ 公頃 →（×100）→ 平方公里<br>' +
            '1 公畝 ＝ 100 m²　1 公頃 ＝ 10000 m² ＝ 100 公畝　1 km² ＝ 1000000 m² ＝ 100 公頃<br>' +
            '答案：<b>' + c[1].toLocaleString('en-US') + ' ' + c[2] + '</b>'
        };
      }

      if (type === 'weight') {
        const cases = [['1 公噸是多少公斤？', 1000, '公斤'], ['2.5 公噸是多少公斤？', 2500, '公斤'],
                       ['4500 公斤是多少公噸？', 4.5, '公噸'], ['0.8 公噸是多少公斤？', 800, '公斤'],
                       ['12000 公斤是多少公噸？', 12, '公噸']];
        const c = Kit.pick(cases);
        return {
          q: '<b>' + c[0] + '</b>',
          input: 'number', answer: c[1], tolerance: 1e-9, unit: c[2],
          steps: '<b>1 公噸 ＝ 1000 公斤</b><br>' +
            '公噸 → 公斤：<b>×1000</b>（大換小用乘）<br>' +
            '公斤 → 公噸：<b>÷1000</b>（小換大用除）<br>' +
            '答案：<b>' + c[1] + ' ' + c[2] + '</b>'
        };
      }

      const items = Kit.shuffle([
        { t: '一個標準足球場', v: 'ha' }, { t: '一張雙人書桌的桌面', v: 'm2' },
        { t: '一個小型市鎮', v: 'km2' }, { t: '兩間教室', v: 'a' }
      ]);
      const target = Kit.pick([
        { u: '1 公頃', v: 'ha' }, { u: '1 平方公尺', v: 'm2' },
        { u: '1 平方公里', v: 'km2' }, { u: '1 公畝', v: 'a' }
      ]);
      return {
        q: '<b>' + target.u + '</b> 大約是下面哪一個的大小？',
        choices: items.map(o => o.t), answer: items.findIndex(o => o.v === target.v),
        steps: '<b>量感對照</b>（這比背數字重要）：<br>' +
          '1 平方公尺 ≈ 一張雙人書桌的桌面<br>' +
          '1 公畝（10 m × 10 m）≈ 兩間教室<br>' +
          '1 公頃（100 m × 100 m）≈ 一個標準足球場<br>' +
          '1 平方公里（1000 m × 1000 m）≈ 一個小型市鎮 ＝ 100 公頃'
      };
    }
  });

})();
