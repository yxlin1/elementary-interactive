/* ============================================================
   五下 數學（康軒）第 4 單元　小數的乘法
   五下 數學（康軒）第 5 單元　十進位結構
   五下 數學（康軒）第 6 單元　整數、小數除以整數
   課綱 N-5-8 / N-5-1 / N-5-9・N-5-11
   ============================================================ */

(function () {

  /* ============================================================
     第 4 單元　小數的乘法
     N-5-8「整數乘以小數、小數乘以小數的意義。乘數為小數的直式計算。
            教師用位值的概念說明直式計算的合理性。
            處理乘積一定比被乘數大的錯誤類型。」
     ============================================================ */
  Kit.register('m5b-u4', {

    intro: '用 <b>10 × 10 的方格</b>看小數乘法。整塊是 1，一小格就是 0.01。橫著取一段、直著取一段，重疊的格數就是答案。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 320);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let x = 6, y = 4;      // 0.x × 0.y（以「十分位」為單位）

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const S = 250, ox = 56, oy = 44, C = S / 10;

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('整個大正方形 ＝ 1，切成 100 小格，一小格 ＝ 0.01', 16, 22);

        ctx.fillStyle = '#16203a'; ctx.fillRect(ox, oy, S, S);
        // 橫向 0.x
        ctx.fillStyle = 'rgba(77,163,255,.3)';
        ctx.fillRect(ox, oy, C * x, S);
        // 縱向 0.y
        ctx.fillStyle = 'rgba(52,211,153,.3)';
        ctx.fillRect(ox, oy, S, C * y);
        // 重疊
        ctx.fillStyle = 'rgba(251,191,36,.85)';
        ctx.fillRect(ox, oy, C * x, C * y);
        // 格線
        ctx.strokeStyle = 'rgba(11,18,32,.45)'; ctx.lineWidth = 1;
        for (let i = 1; i < 10; i++) {
          ctx.beginPath(); ctx.moveTo(ox + i * C, oy); ctx.lineTo(ox + i * C, oy + S); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ox, oy + i * C); ctx.lineTo(ox + S, oy + i * C); ctx.stroke();
        }
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, S, S);

        ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('0.' + x, ox + C * x / 2, oy - 8);
        ctx.fillStyle = '#34d399';
        ctx.save(); ctx.translate(ox - 16, oy + C * y / 2); ctx.rotate(-Math.PI / 2);
        ctx.textBaseline = 'middle'; ctx.fillText('0.' + y, 0, 0); ctx.restore();

        const cells = x * y, val = cells / 100;
        ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('黃色格數', 340, 72);
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 22px "Microsoft JhengHei", sans-serif';
        ctx.fillText(x + ' × ' + y + ' ＝ ' + cells + ' 格', 340, 96);
        ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
        ctx.fillText('每格 0.01，所以', 340, 138);
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 30px "Microsoft JhengHei", sans-serif';
        ctx.fillText(cells + ' × 0.01 ＝ ' + val, 340, 164);
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.fillText('小數點後的位數：', 340, 214);
        ctx.fillStyle = '#7c5cff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.fillText('1 位 ＋ 1 位 ＝ 2 位', 340, 236);

        readout.innerHTML =
          '<div class="big">0.' + x + ' × 0.' + y + ' ＝ <b>' + val + '</b></div>' +
          '<b>先當整數算</b>：' + x + ' × ' + y + ' ＝ ' + cells + '。<br>' +
          '<b>再看位數</b>：0.' + x + ' 有 1 位小數，0.' + y + ' 有 1 位小數，答案要有 <b>1＋1＝2</b> 位小數 → <b>' + val.toFixed(2) + '</b>。<br>' +
          '為什麼？因為 0.1 × 0.1 ＝ 0.01（一小格），' + cells + ' 個小格就是 ' + cells + ' × 0.01 ＝ ' + val + '。<br>' +
          '<b style="color:var(--warn)">⚠️ 答案 ' + val + ' 比 0.' + x + ' 小！</b>' +
          '因為乘的是 0.' + y + '（<b>比 1 小</b>）——「取 0.' + x + ' 的 ' + y + ' 成」當然變少。<br>' +
          '<span style="color:var(--muted)">⚠️ 直式乘法<b>不用對齊小數點</b>（那是加減法的規則）。先靠右對齊當整數乘，' +
          '算完再從右邊數位數點上小數點。課綱特別提醒「小數點記法和小數加減時記法不同」。</span>';
      }

      controls.appendChild(Kit.slider('第一個數 0.x', { min: 1, max: 9, value: x, format: v => '0.' + v, onChange: v => { x = v; paint(); } }).wrap);
      controls.appendChild(Kit.slider('第二個數 0.y', { min: 1, max: 9, value: y, format: v => '0.' + v, onChange: v => { y = v; paint(); } }).wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '小數乘法的兩個步驟：① 把小數點<b>忘掉</b>，當整數乘　② 兩個數的小數位數<b>加起來</b>，就是答案要點幾位。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「0.6 × 0.4 的答案，比 0.6 大還是小？先猜。」', why: '小。這是課綱點名要處理的錯誤觀念。乘以比 1 小的數會變小——看圖：取 0.6 的其中四成。' },
      { ask: '「為什麼一小格是 0.01？」', why: '整塊是 1，切成 100 格，每格就是 1/100 ＝ 0.01。這一步想通了，「兩位小數」就不用背。' },
      { ask: '「小數點該點在哪裡？」', why: '兩個數的小數位數<b>加起來</b>。0.6（1 位）× 0.4（1 位）→ 答案 2 位 → 0.24。可以調到 0.5 × 0.2 ＝ 0.10 ＝ 0.1 驗證。' },
      { ask: '「直式乘法要不要對齊小數點？」', why: '<b>不用</b>。加減法才要對齊小數點，乘法是靠右對齊當整數算。這兩個規則很容易搞混，要刻意分開講。' },
      { ask: '生活題：「一公斤 65 元的水果，買 0.8 公斤要多少錢？」', why: '52 元。比 65 少，因為不到一公斤。用生活情境檢驗「乘完變小」很合理。' }
    ],

    pitfalls: [
      { bad: '以為「乘法一定變大」，看到 0.6 × 0.4 ＝ 0.24 覺得算錯。', fix: '乘以<b>小於 1</b> 的數會變小。課綱明列這是要特別處理的錯誤類型。', src: 'N-5-8「處理乘積一定比被乘數大的錯誤類型」' },
      { bad: '直式乘法時對齊小數點。', fix: '乘法<b>靠右對齊</b>當整數算，最後才點小數點。對齊小數點是<b>加減法</b>的規則。', src: 'N-5-8 備註「小數點記法和小數加減時記法不同」' },
      { bad: '小數點位數算錯：0.6 × 0.4 寫成 2.4 或 0.024。', fix: '兩數的小數位數<b>相加</b>：1＋1＝2 位 → 0.24。' },
      { bad: '答案末尾的 0 直接抹掉導致位數錯：0.5 × 0.2 ＝ 10 → 寫成 1。', fix: '先點成 <b>0.10</b>（2 位），再化簡成 0.1。順序不能反。' }
    ],

    quiz: function () {
      const type = Kit.pick(['mul', 'mul', 'bigger', 'place']);

      if (type === 'mul') {
        const forms = [
          () => { const a = Kit.randInt(1, 9) / 10, b = Kit.randInt(1, 9) / 10; return [a, b]; },
          () => { const a = Kit.randInt(11, 99) / 10, b = Kit.randInt(1, 9) / 10; return [a, b]; },
          () => { const a = Kit.randInt(2, 40), b = Kit.randInt(1, 9) / 10; return [a, b]; },
          () => { const a = Kit.randInt(11, 60) / 10, b = Kit.randInt(11, 40) / 100; return [a, b]; }
        ];
        const [a, b] = Kit.pick(forms)();
        const ans = parseFloat((a * b).toPrecision(12));
        const da = (String(a).split('.')[1] || '').length, db = (String(b).split('.')[1] || '').length;
        const ia = Math.round(a * Math.pow(10, da)), ib = Math.round(b * Math.pow(10, db));
        return {
          q: '<b>' + a + ' × ' + b + '</b> ＝ ?',
          input: 'number', answer: ans, tolerance: 1e-9,
          steps: '① 先<b>當整數</b>乘：' + ia + ' × ' + ib + ' ＝ <b>' + ia * ib + '</b><br>' +
            '② 小數位數<b>相加</b>：' + a + ' 有 ' + da + ' 位，' + b + ' 有 ' + db + ' 位 → 答案 <b>' + (da + db) + '</b> 位<br>' +
            '③ 從右邊數 ' + (da + db) + ' 位點小數點 → <b>' + ans + '</b><br>' +
            (b < 1 ? '<span style="color:var(--warn)">注意：乘數 ' + b + ' 小於 1，所以答案比 ' + a + ' <b>小</b>。</span>' : '')
        };
      }

      if (type === 'bigger') {
        const base = Kit.pick([8, 12, 25, 40, 60, 3.5]);
        const mul = Kit.pick([0.3, 0.8, 0.95, 1.2, 2.5, 0.05, 1]);
        const opts = ['比 ' + base + ' 大', '比 ' + base + ' 小', '和 ' + base + ' 一樣大'];
        return {
          q: '<b>' + base + ' × ' + mul + '</b> 的答案，會比 ' + base + ' 大還是小？（用想的，不要算）',
          choices: opts, answer: mul > 1 ? 0 : mul < 1 ? 1 : 2,
          steps: '只要看<b>乘數和 1 比</b>：<br>' +
            '乘數 ' + mul + (mul > 1 ? ' <b>大於 1</b> → 變<b>大</b>' : mul < 1 ? ' <b>小於 1</b> → 變<b>小</b>' : ' <b>等於 1</b> → <b>不變</b>') + '<br>' +
            '（' + base + ' × ' + mul + ' ＝ ' + parseFloat((base * mul).toPrecision(12)) + '）<br>' +
            '⚠️ 「乘法一定變大」只在乘以大於 1 的數時才對。'
        };
      }

      const a2 = Kit.randInt(11, 99) / 100, b2 = Kit.randInt(11, 99) / 10;
      const digits = 2 + 1;
      return {
        q: '<b>' + a2 + ' × ' + parseFloat(b2.toFixed(1)) + '</b>　如果先當整數算出 ' +
          Math.round(a2 * 100) + ' × ' + Math.round(b2 * 10) + ' ＝ ' + Math.round(a2 * 100) * Math.round(b2 * 10) +
          '，那答案的小數點後要有<b>幾位</b>？',
        input: 'number', answer: digits, unit: '位',
        steps: a2 + ' 有 <b>2</b> 位小數，' + parseFloat(b2.toFixed(1)) + ' 有 <b>1</b> 位小數。<br>' +
          '兩者<b>相加</b>：2 ＋ 1 ＝ <b>3</b> 位。<br>' +
          '所以 ' + Math.round(a2 * 100) * Math.round(b2 * 10) + ' 要從右邊數 3 位點小數點 → ' +
          parseFloat((a2 * b2).toPrecision(12)) + '。'
      };
    }
  });


  /* ============================================================
     第 5 單元　十進位結構
     N-5-1「十進位的位值系統：「兆位」至「千分位」。整合整數與小數。
            理解基於位值系統可延伸表示更大的數和更小的數。」
     ============================================================ */
  Kit.register('m5b-u5', {

    intro: '按「放大 10 倍」，數線會不斷往裡面鑽——每放大一次，中間又出現 10 等分。位值系統可以<b>無限往小延伸</b>，往大也一樣。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let zoom = 0;          // 放大次數：0 → 0~1，1 → 0.3~0.4 …
      let path = [];         // 每次選的那一格（0~9）
      let ladder = 0;        // 位值階梯的高亮位置

      const PLACES = ['兆位', '千億位', '百億位', '十億位', '億位', '千萬位', '百萬位', '十萬位',
        '萬位', '千位', '百位', '十位', '個位', '十分位', '百分位', '千分位'];
      const POWERS = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3];

      function rangeOf() {
        let lo = 0, span = 1;
        path.forEach(d => { lo = lo + d * span / 10; span = span / 10; });
        return [lo, lo + span];
      }

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const [lo, hi] = rangeOf();
        const span = hi - lo;
        const PAD = 50, LW = 520, y = 96;

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('放大 ' + zoom + ' 次　目前看的範圍：' + parseFloat(lo.toFixed(6)) + ' ～ ' + parseFloat(hi.toFixed(6)), 16, 24);

        // 主數線
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + LW, y); ctx.stroke();
        for (let i = 0; i <= 10; i++) {
          const x = PAD + LW * i / 10;
          const big = (i === 0 || i === 10);
          ctx.strokeStyle = big ? '#e8eefc' : '#3a4c73'; ctx.lineWidth = big ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(x, y - (big ? 14 : 8)); ctx.lineTo(x, y + (big ? 14 : 8)); ctx.stroke();
          if (big || i % 2 === 0) {
            ctx.fillStyle = big ? '#e8eefc' : '#93a3c4';
            ctx.font = (big ? 'bold ' : '') + '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(parseFloat((lo + span * i / 10).toFixed(7)), x, y + 18);
          }
        }

        // 下一次要放大的那一格（預覽）
        const sel = 3;
        ctx.fillStyle = 'rgba(251,191,36,.22)';
        ctx.fillRect(PAD + LW * sel / 10, y - 28, LW / 10, 56);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.strokeRect(PAD + LW * sel / 10, y - 28, LW / 10, 56);
        ctx.fillStyle = '#fbbf24'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('按「放大」會鑽進這一格', PAD + LW * sel / 10 + LW / 20, y - 34);

        /* --- 位值階梯 --- */
        const bx = 40, by = 190, cw = 34;
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('位值階梯：每往右一格 ÷10，每往左一格 ×10（左右用的是同一套規則）', 16, 176);
        PLACES.forEach((p, i) => {
          const x = bx + i * cw;
          const isDec = POWERS[i] < 0;
          ctx.fillStyle = i === ladder ? '#fbbf24' : (isDec ? '#1c2a44' : '#16203a');
          ctx.fillRect(x, by, cw - 3, 34);
          ctx.strokeStyle = POWERS[i] === 0 ? '#fb7185' : '#2f4468';
          ctx.lineWidth = POWERS[i] === 0 ? 2 : 1;
          ctx.strokeRect(x, by, cw - 3, 34);
          ctx.save();
          ctx.translate(x + (cw - 3) / 2, by + 60);
          ctx.rotate(-Math.PI / 3);
          ctx.fillStyle = i === ladder ? '#fbbf24' : (isDec ? '#b3a2ff' : '#93a3c4');
          ctx.font = '11px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(p, 0, 0);
          ctx.restore();
        });
        // 小數點位置
        const dotX = bx + 13 * cw - 2;
        ctx.fillStyle = '#fb7185';
        ctx.beginPath(); ctx.arc(dotX, by + 34, 4, 0, Math.PI * 2); ctx.fill();

        const p = PLACES[ladder], pw = POWERS[ladder];
        readout.innerHTML =
          '<div class="big">' + (zoom === 0
            ? '從 0 到 1 這一段開始（整段寬 1）'
            : '放大 ' + zoom + ' 次：看的範圍只剩 <b>' + parseFloat(span.toFixed(7)) +
              '</b>（原來的 1/' + Math.pow(10, zoom).toLocaleString('en-US') + '）') + '</div>' +
          '每放大一次，中間<b>又出現 10 等分</b>——0 和 1 之間可以無限切下去：<br>' +
          '十分位 → 百分位 → 千分位 → 萬分位…… <b>沒有盡頭</b>。<br>' +
          '這就是課綱說的「基於位值系統可延伸表示<b>更大的數和更小的數</b>」。<br>' +
          '<span style="color:var(--muted)">目前階梯高亮：<b>' + p + '</b>，代表 ' +
          (pw >= 0 ? '10 的 ' + pw + ' 次方 ＝ ' + Math.pow(10, pw).toLocaleString('en-US')
            : '1 / ' + Math.pow(10, -pw) + ' ＝ ' + Math.pow(10, pw)) + '。' +
          '紅框是<b>個位</b>，紅點是<b>小數點</b>——小數點只是「個位在哪」的標記，不是分界牆。</span>';
      }

      controls.appendChild(Kit.button('🔍 放大 10 倍', function () {
        if (zoom >= 5) return;
        path.push(3); zoom++; paint();
      }, 'primary'));
      controls.appendChild(Kit.button('↩ 縮小回去', function () {
        if (!zoom) return;
        path.pop(); zoom--; paint();
      }));
      controls.appendChild(Kit.button('回到 0～1', function () { path = []; zoom = 0; paint(); }));
      controls.appendChild(Kit.slider('位值階梯', {
        min: 0, max: PLACES.length - 1, value: 12,
        format: v => PLACES[v], onChange: v => { ladder = v; paint(); }
      }).wrap);

      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '課綱要求這一單元要「<b>整合整數與小數</b>」——不要把小數當成另一套東西。' +
          '個位左邊和右邊用的是<b>完全一樣</b>的規則：往左 ×10、往右 ÷10。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「0 和 1 中間有幾個數？」', why: '無限多。按幾次放大讓他看：每放大一次又冒出 10 等分，永遠切不完。這是小數最重要的直覺。' },
      { ask: '「十分位的右邊是什麼？再右邊呢？」', why: '百分位、千分位、萬分位……沒有盡頭。對照左邊的萬位、億位、兆位，兩邊是對稱的。' },
      { ask: '「小數點是把數字切成兩半的牆嗎？」', why: '不是。它只是標記「個位在這裡」。整個位值系統從頭到尾是<b>同一套</b>規則。' },
      { ask: '「1 兆是多少個 1 億？」', why: '10000 個（1 兆 ＝ 10¹²，1 億 ＝ 10⁸，差 10⁴）。用階梯滑桿數格子最快。' },
      { ask: '「0.999 和 1 中間還有數嗎？」', why: '有，例如 0.9995。這題可以讓孩子體會「再小的間隔都還能切」。' }
    ],

    pitfalls: [
      { bad: '把小數點當成「兩個世界的分界」，整數和小數各學一套。', fix: '同一套位值規則：往左 ×10、往右 ÷10。小數點只是標記個位的位置。', src: 'N-5-1「整合整數與小數」' },
      { bad: '以為小數位數有上限（只到百分位或千分位）。', fix: '課本教到千分位，但系統本身<b>可以無限延伸</b>。放大幾次就看得到。' },
      { bad: '大數的位名記混：以為億的上面就是兆。', fix: '億（10⁸）→ 十億 → 百億 → 千億 → 兆（10¹²）。中間<b>還有三階</b>。' },
      { bad: '「×10 就是加個 0」。', fix: '對整數碰巧成立，對小數會錯。正確說法是<b>每個數字往左升一個位值</b>。' }
    ],

    quiz: function () {
      const type = Kit.pick(['name', 'between', 'convert', 'shift']);

      if (type === 'name') {
        const items = [['個位', 1], ['十位', 10], ['百位', 100], ['千位', 1000], ['萬位', 10000],
                       ['十萬位', 100000], ['百萬位', 1000000], ['千萬位', 10000000], ['億位', 100000000]];
        const it = Kit.pick(items);
        return {
          q: '<b>' + it[0] + '</b>的位值是多少？（也就是那一位上的 1 代表多少）',
          input: 'number', answer: it[1],
          steps: '從個位開始，每往左一位就 <b>×10</b>：<br>' +
            '個位 1 → 十位 10 → 百位 100 → 千位 1000 → 萬位 10000 → 十萬位 100000 → 百萬位 1000000 → 千萬位 10000000 → 億位 100000000<br>' +
            '<b>' + it[0] + ' ＝ ' + it[1].toLocaleString('en-US') + '</b>'
        };
      }

      if (type === 'between') {
        const cases = [['0.5', '0.6'], ['0.3', '0.31'], ['1.2', '1.3'], ['0.07', '0.08']];
        const c = Kit.pick(cases);
        const opts = Kit.shuffle([
          { t: '無限多個', ok: true }, { t: '剛好 9 個', ok: false },
          { t: '剛好 10 個', ok: false }, { t: '一個也沒有', ok: false }
        ]);
        return {
          q: '<b>' + c[0] + '</b> 和 <b>' + c[1] + '</b> 之間有幾個小數？',
          choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
          steps: '<b>無限多個。</b><br>' +
            '把 ' + c[0] + ' 到 ' + c[1] + ' 切成 10 等分，就多出 9 個新的數；' +
            '再把其中任一段切成 10 等分，又多出 9 個……<b>永遠切得下去</b>。<br>' +
            '這就是位值系統可以「延伸表示更小的數」的意思。'
        };
      }

      if (type === 'convert') {
        const cases = [['1 萬', '1 千', 10], ['1 億', '1 萬', 10000], ['1 兆', '1 億', 10000],
                       ['1 百萬', '1 萬', 100], ['1 千萬', '1 十萬', 100], ['1 億', '1 百萬', 100]];
        const c = Kit.pick(cases);
        return {
          q: '<b>' + c[0] + '</b> 是多少個 <b>' + c[1] + '</b>？',
          input: 'number', answer: c[2], unit: '個',
          steps: '在位值階梯上數格子，每差一格就是 10 倍。<br>' +
            c[0] + ' ÷ ' + c[1] + ' ＝ <b>' + c[2].toLocaleString('en-US') + '</b><br>' +
            '（萬 ＝ 10⁴、百萬 ＝ 10⁶、千萬 ＝ 10⁷、億 ＝ 10⁸、兆 ＝ 10¹²）'
        };
      }

      const base = Kit.pick([0.4, 0.07, 2.5, 36, 0.008, 1.25]);
      const op = Kit.pick([[10, '×'], [100, '×'], [10, '÷'], [100, '÷'], [1000, '÷']]);
      const ans = parseFloat((op[1] === '×' ? base * op[0] : base / op[0]).toPrecision(12));
      return {
        q: '<b>' + base + ' ' + op[1] + ' ' + op[0] + '</b> ＝ ?',
        input: 'number', answer: ans, tolerance: 1e-12,
        steps: (op[1] === '×'
          ? '乘以 ' + op[0] + '：每個數字往<b>左</b>升 ' + Math.log10(op[0]) + ' 個位值（數字變大）。'
          : '除以 ' + op[0] + '：每個數字往<b>右</b>降 ' + Math.log10(op[0]) + ' 個位值（數字變小）。') +
          '<br>' + base + ' ' + op[1] + ' ' + op[0] + ' ＝ <b>' + ans + '</b><br>' +
          '<span style="color:var(--muted)">別記成「加幾個 0」或「小數點移幾位」——記「數字升降幾個位值」才不會在小數上出錯。</span>'
      };
    }
  });


  /* ============================================================
     第 6 單元　整數、小數除以整數
     N-5-9「整數、小數除以整數（商為小數）⋯能用概數協助處理除不盡的情況。
            熟悉分母為 2、4、5、8 之真分數所對應的小數。」
     N-5-11「解題：對小數取概數。四捨五入法。知道商除不盡的處理。」
     ============================================================ */
  Kit.register('m5b-u6', {

    intro: '除不盡怎麼辦？以前寫「餘幾」，現在可以<b>繼續除下去</b>——在被除數後面補 0，商就變成小數。真的除不完的，用<b>概數</b>處理。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 300);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let A = 7, B = 4, places = 3;

      /* 產生長除法各步驟 */
      function longDivide(a, b, maxPlaces) {
        const rows = [];
        let q = Math.floor(a / b), r = a - q * b;
        rows.push({ digit: String(q), rem: r, place: 0 });
        let i = 0;
        while (r !== 0 && i < maxPlaces) {
          r = r * 10;
          const d = Math.floor(r / b);
          r = r - d * b;
          i++;
          rows.push({ digit: String(d), rem: r, place: i });
        }
        return { rows: rows, exact: r === 0, digits: i };
      }

      function paint() {
        cv.clear('#0e1726');
        const ctx = cv.ctx;
        const res = longDivide(A, B, places);
        const qStr = res.rows[0].digit + (res.rows.length > 1 ? '.' + res.rows.slice(1).map(x => x.digit).join('') : '');

        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(A + ' ÷ ' + B + ' 除不盡的話，在後面補 0 繼續除，商就出現小數', 16, 22);

        // 每一步
        const bx = 40, by = 52, rowH = 40;
        res.rows.forEach((row, i) => {
          const y = by + i * rowH;
          ctx.fillStyle = i === 0 ? '#16203a' : (row.rem === 0 ? 'rgba(52,211,153,.14)' : 'rgba(77,163,255,.10)');
          ctx.fillRect(bx, y, 540, rowH - 6);
          ctx.strokeStyle = '#26355a'; ctx.lineWidth = 1;
          ctx.strokeRect(bx, y, 540, rowH - 6);

          ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          const label = i === 0 ? '整數部分' : ['十分位', '百分位', '千分位', '萬分位'][i - 1];
          ctx.fillText(label, bx + 12, y + 17);

          ctx.fillStyle = '#e8eefc'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
          const prev = i === 0 ? A : res.rows[i - 1].rem * 10;
          ctx.fillText(prev + ' ÷ ' + B + ' ＝ ' + row.digit + ' … 餘 ' + row.rem, bx + 92, y + 17);

          ctx.fillStyle = row.rem === 0 ? '#34d399' : '#fbbf24';
          ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('商 ' + row.digit, bx + 330, y + 17);

          if (row.rem !== 0 && i < res.rows.length - 1) {
            ctx.fillStyle = '#7c5cff'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('餘 ' + row.rem + ' → 後面補 0 變成 ' + row.rem * 10 + '，繼續除', bx + 344, y + 17);
          } else if (row.rem === 0) {
            ctx.fillStyle = '#34d399'; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('✅ 整除，結束', bx + 344, y + 17);
          }
        });

        const rounded = parseFloat((A / B).toFixed(2));
        readout.innerHTML =
          '<div class="big">' + A + ' ÷ ' + B + ' ＝ ' + (res.exact ? '<b>' + qStr + '</b>' : '<b>' + qStr + '…</b>（除不盡）') + '</div>' +
          (res.exact
            ? '除到<b>' + (res.digits === 0 ? '整數就整除' : ['十分位', '百分位', '千分位', '萬分位'][res.digits - 1] + '就整除') + '</b>了。<br>' +
              '<span style="color:var(--muted)">分母是 2、4、5、8 的分數換成小數都會除得盡：' +
              '1/2＝0.5、1/4＝0.25、3/4＝0.75、1/5＝0.2、1/8＝0.125。這幾個課綱要求要<b>熟悉</b>。</span>'
            : '<b>除不盡</b>——餘數一直出現，永遠除不完。<br>' +
              '這時候用<b>概數</b>處理：四捨五入到需要的位數。<br>' +
              '取到<b>小數第二位</b>（百分位）：' + A + ' ÷ ' + B + ' ≈ <b>' + rounded + '</b><br>' +
              '<span style="color:var(--muted)">要看<b>下一位</b>來決定進位或捨去：第三位是 ' +
              Math.floor(A / B * 1000) % 10 + '，' + (Math.floor(A / B * 1000) % 10 >= 5 ? '≥5 → <b>進位</b>' : '<5 → <b>捨去</b>') +
              '。課綱說明時<b>不用出現「誤差」「近似值」這些詞</b>，講「大約」就好。</span>');
      }

      controls.appendChild(Kit.slider('被除數', { min: 1, max: 60, value: A, onChange: v => { A = v; paint(); } }).wrap);
      controls.appendChild(Kit.slider('除數', { min: 2, max: 12, value: B, onChange: v => { B = v; paint(); } }).wrap);
      controls.appendChild(Kit.slider('最多除到', {
        min: 1, max: 4, value: places,
        format: v => ['十分位', '百分位', '千分位', '萬分位'][v - 1], onChange: v => { places = v; paint(); }
      }).wrap);
      controls.appendChild(Kit.segmented('試試看', [
        { label: '7÷4 除得盡', value: '7,4' }, { label: '1÷8 除得盡', value: '1,8' },
        { label: '10÷3 除不盡', value: '10,3' }, { label: '5÷6 除不盡', value: '5,6' }
      ], function (v) {
        const p = v.split(',').map(Number); A = p[0]; B = p[1]; paint();
      }, '7,4').wrap);

      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '課綱：這一階段<b>只處理商到三位小數</b>的情況，而且<b>不教「循環小數」的名稱</b>。' +
          '除不盡就用概數處理，這樣就夠了。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「7 ÷ 4，以前你會怎麼寫？」', why: '「1 餘 3」。現在可以繼續除成 1.75。讓孩子看到「餘數」和「小數」是同一件事的兩種寫法。' },
      { ask: '「為什麼可以在後面補 0？」', why: '因為 7 ＝ 7.0 ＝ 7.00，補 0 不改變大小。餘 3 就是「還剩 3 個 1」，換成「30 個 0.1」繼續分。' },
      { ask: '切到 10÷3：「這樣要除到什麼時候？」', why: '永遠除不完。這時候要停下來取概數。讓孩子親眼看到「3 一直出現」比說明有效。' },
      { ask: '「1/2、1/4、1/5、1/8 是多少？」', why: '0.5、0.25、0.2、0.125。課綱要求<b>熟悉</b>這幾個，因為之後算百分率、比率會一直用到。' },
      { ask: '「四捨五入到百分位，要看第幾位？」', why: '看<b>千分位</b>（下一位）。這是最常錯的地方——很多孩子看錯位數。' }
    ],

    pitfalls: [
      { bad: '除不盡時只會寫「餘幾」，不知道可以繼續除。', fix: '在被除數後面補 0（7 ＝ 7.0），餘數乘 10 繼續除，商就出現小數。' },
      { bad: '商的小數點位置點錯。', fix: '商的小數點要對齊<b>被除數的小數點</b>。整數除法就在個位算完後點下去。' },
      { bad: '四捨五入時看錯位數：要取到百分位卻看百分位本身。', fix: '要看<b>下一位</b>（千分位）。取到第 n 位，就看第 n＋1 位。' },
      { bad: '除不盡就寫「除不盡」交卷。', fix: '要用<b>概數</b>給出答案，例如「約 3.33」。課綱明訂要「知道商除不盡的處理」。', src: 'N-5-11' },
      { bad: '把 10 ÷ 3 寫成 3.33 就當成精確答案。', fix: '要用「約」或「≈」。不過課綱提醒<b>不要出現「誤差」「近似值」這些術語</b>，講「大約」就好。', src: 'N-5-11 備註' }
    ],

    quiz: function () {
      const type = Kit.pick(['exact', 'exact', 'round', 'known']);

      if (type === 'exact') {
        const b = Kit.pick([2, 4, 5, 8, 10, 20, 25]);
        const a = Kit.randInt(1, 12) * (Math.random() < .5 ? 1 : b) + Kit.randInt(0, b - 1);
        const ans = parseFloat((a / b).toPrecision(12));
        if (Math.abs(ans * 1000 - Math.round(ans * 1000)) > 1e-9) {
          return { q: '<b>' + a + ' ÷ ' + b + '</b> ＝ ?（除不盡的話，四捨五入到<b>小數第二位</b>）',
            input: 'number', answer: parseFloat((a / b).toFixed(2)), tolerance: 1e-9,
            steps: a + ' ÷ ' + b + ' ＝ ' + (a / b).toFixed(5) + '…<br>四捨五入到小數第二位 → <b>' + (a / b).toFixed(2) + '</b>' };
        }
        return {
          q: '<b>' + a + ' ÷ ' + b + '</b> ＝ ?',
          input: 'number', answer: ans, tolerance: 1e-9,
          steps: '除不盡時在後面補 0 繼續除：<br>' +
            a + ' ÷ ' + b + ' ＝ <b>' + ans + '</b><br>' +
            '（分母是 ' + b + ' 這類 2、4、5、8、10 的因數組合，一定除得盡。）'
        };
      }

      if (type === 'round') {
        const a = Kit.randInt(5, 60), b = Kit.pick([3, 6, 7, 9, 11]);
        const v = a / b;
        const nd = Kit.pick([1, 2]);
        const ans = parseFloat(v.toFixed(nd));
        const nextDigit = Math.floor(v * Math.pow(10, nd + 1)) % 10;
        return {
          q: '<b>' + a + ' ÷ ' + b + '</b>，四捨五入到<b>小數第 ' + nd + ' 位</b>是多少？',
          input: 'number', answer: ans, tolerance: 1e-9,
          steps: a + ' ÷ ' + b + ' ＝ ' + v.toFixed(nd + 3) + '…（除不盡）<br>' +
            '要取到小數第 ' + nd + ' 位，就看<b>第 ' + (nd + 1) + ' 位</b>：是 <b>' + nextDigit + '</b>，' +
            (nextDigit >= 5 ? '≥5 → <b>進位</b>' : '<5 → <b>捨去</b>') + '<br>' +
            '答案 ≈ <b>' + ans + '</b>'
        };
      }

      const known = [['1/2', 0.5], ['1/4', 0.25], ['3/4', 0.75], ['1/5', 0.2], ['2/5', 0.4],
                     ['3/5', 0.6], ['4/5', 0.8], ['1/8', 0.125], ['3/8', 0.375], ['5/8', 0.625], ['7/8', 0.875]];
      const it = Kit.pick(known);
      return {
        q: '<b>' + it[0] + '</b> 換成小數是多少？',
        input: 'number', answer: it[1], tolerance: 1e-9,
        steps: '分數線就是除號：' + it[0].replace('/', ' ÷ ') + ' ＝ <b>' + it[1] + '</b><br>' +
          '<span style="color:var(--muted)">課綱要求<b>熟悉</b>分母 2、4、5、8 的真分數對應的小數：<br>' +
          '1/2＝0.5　1/4＝0.25　3/4＝0.75<br>1/5＝0.2　2/5＝0.4　3/5＝0.6　4/5＝0.8<br>' +
          '1/8＝0.125　3/8＝0.375　5/8＝0.625　7/8＝0.875</span>'
      };
    }
  });

})();
