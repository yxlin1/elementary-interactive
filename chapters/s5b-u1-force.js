/* ============================================================
   五下 自然（康軒）第 1 單元　力與運動
   課綱 INd-Ⅲ-13「施力可使物體的運動速度改變，物體受力愈大，改變愈快。」
        INc-Ⅲ-5「力的大小可由物體的形變或運動狀態的改變程度來測量。」
        INc-Ⅲ-6「運用時間與距離可描述物體的速度，速度的變化與雙方施力有關。」
   教具：推小車 —— 調施力和摩擦力，看速度怎麼變，同時畫出距離-時間圖。
   ============================================================ */

Kit.register('s5b-u1', {

  intro: '按「開始」推小車。調<b>施力</b>和<b>地面摩擦</b>，看速度怎麼變。下面的<b>距離—時間圖</b>會同步畫出來——線越陡代表跑越快。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 340);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let force = 6, friction = 1, pushing = false, running = false;
    let x = 0, v = 0, time = 0;
    let track = [];      // {t, x}
    let raf = null;
    let mode = 'push';   // push | spring

    const SURF = {
      1: { n: '光滑冰面', k: 0.15 },
      2: { n: '木地板', k: 0.5 },
      3: { n: '柏油路', k: 1.0 },
      4: { n: '草地', k: 1.8 },
      5: { n: '沙地', k: 3.0 }
    };

    function reset() {
      x = 0; v = 0; time = 0; track = []; pushing = false; running = false;
      startBtn.textContent = '▶ 開始推';
    }

    function step(dt) {
      const k = SURF[friction].k;
      const a = (pushing ? force : 0) - k * (v > 0.01 ? 1 : 0) - 0.35 * v;   // 推力 − 摩擦 − 空氣阻力
      v = Math.max(0, v + a * dt);
      x += v * dt;
      time += dt;
      track.push({ t: time, x: x });
      if (track.length > 900) track.shift();
      if (x > 24) { running = false; startBtn.textContent = '▶ 再推一次'; }
    }

    function paint() {
      cv.clear('#0e1726');
      const ctx = cv.ctx;
      const gy = 150, sx = 40, sw = 540;
      const scale = sw / 26;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('地面：' + SURF[friction].n + '　施力：' + force + ' 單位' +
        (pushing ? '（持續推）' : running ? '（已放手，靠慣性滑行）' : ''), 16, 22);

      // 地面
      ctx.strokeStyle = '#3f7d55'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx, gy); ctx.lineTo(sx + sw, gy); ctx.stroke();
      // 距離刻度
      ctx.font = '11px "Microsoft JhengHei", sans-serif';
      for (let m = 0; m <= 24; m += 4) {
        const px = sx + m * scale;
        ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px, gy + 8); ctx.stroke();
        ctx.fillStyle = '#5a6b8c'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(m + ' m', px, gy + 10);
      }

      // 小車
      const cxp = sx + Math.min(x, 24) * scale;
      ctx.fillStyle = '#4da3ff';
      ctx.fillRect(cxp - 22, gy - 30, 44, 22);
      ctx.fillStyle = '#7c5cff';
      ctx.fillRect(cxp - 14, gy - 42, 26, 14);
      ctx.fillStyle = '#1b2740';
      [-12, 12].forEach(dx => {
        ctx.beginPath(); ctx.arc(cxp + dx, gy - 6, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 2; ctx.stroke();
      });

      // 施力箭頭
      if (pushing) {
        const len = 12 + force * 6;
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cxp - 26 - len, gy - 20); ctx.lineTo(cxp - 26, gy - 20); ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(cxp - 24, gy - 20); ctx.lineTo(cxp - 36, gy - 27); ctx.lineTo(cxp - 36, gy - 13);
        ctx.closePath(); ctx.fill();
        ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('施力 ' + force, cxp - 30, gy - 24);
      }
      // 摩擦力箭頭（與運動方向相反）
      if (v > 0.05) {
        const fl = 10 + SURF[friction].k * 14;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cxp + 4, gy - 2); ctx.lineTo(cxp + 4 - fl, gy - 2); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cxp + 4 - fl - 2, gy - 2); ctx.lineTo(cxp + 4 - fl + 8, gy - 8);
        ctx.lineTo(cxp + 4 - fl + 8, gy + 4); ctx.closePath(); ctx.fill();
      }

      // 速度計
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('目前速度', sx, 62);
      ctx.fillStyle = '#16203a'; ctx.fillRect(sx + 68, 52, 260, 20);
      ctx.fillStyle = heat(v / 12);
      ctx.fillRect(sx + 68, 52, Math.min(260, 260 * v / 12), 20);
      ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 1; ctx.strokeRect(sx + 68, 52, 260, 20);
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.fillText(v.toFixed(2) + ' m/s', sx + 340, 62);

      /* --- 距離—時間圖 --- */
      const gx0 = 60, gy0 = 210, gw = 500, gh = 106;
      ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.fillStyle = '#93a3c4'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('距離', gx0 - 6, gy0 + 10);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('時間 →', gx0 + gw - 44, gy0 + gh + 4);
      // 格線
      ctx.strokeStyle = '#1b2740';
      for (let i = 1; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(gx0 + gw * i / 5, gy0); ctx.lineTo(gx0 + gw * i / 5, gy0 + gh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh * i / 5); ctx.lineTo(gx0 + gw, gy0 + gh * i / 5); ctx.stroke();
      }
      if (track.length > 1) {
        const T = Math.max(6, track[track.length - 1].t);
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        track.forEach((p, i) => {
          const px = gx0 + gw * p.t / T, py = gy0 + gh - gh * Math.min(p.x, 24) / 24;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        });
        ctx.stroke();
      }

      // 讀數
      const avg = time > 0 ? x / time : 0;
      readout.innerHTML =
        '<div class="big">速度 <b>' + v.toFixed(2) + '</b> m/s　已跑 <b>' + x.toFixed(1) + '</b> 公尺　用時 <b>' + time.toFixed(1) + '</b> 秒</div>' +
        '<b>速度 ＝ 距離 ÷ 時間</b>：' + x.toFixed(1) + ' ÷ ' + (time || 1).toFixed(1) + ' ＝ <b>' + avg.toFixed(2) + '</b> m/s（平均速度）<br>' +
        '<b style="color:#fb7185">紅箭頭</b>＝你施的力（推車的方向）　<b style="color:#fbbf24">黃箭頭</b>＝摩擦力（永遠<b>和運動方向相反</b>）<br>' +
        (pushing
          ? '正在推 → 施力 <b>大於</b> 摩擦力 → 速度<b>持續變快</b>。'
          : v > 0.05
            ? '已經放手 → 只剩摩擦力 → 速度<b>慢慢變慢</b>，最後會停下來。'
            : '沒有在動。') +
        '<br><span style="color:var(--muted)">看下面的圖：線<b>越陡</b>＝跑越快；線<b>變平</b>＝慢下來；' +
        '線<b>水平</b>＝停住不動。用「圖的斜度」讀速度，是這一單元的重要能力（INc-Ⅲ-6）。</span>';
    }

    function heat(v2) {
      const c = [[77, 163, 255], [52, 211, 153], [251, 191, 36], [251, 113, 133]];
      const p = Math.max(0, Math.min(0.999, v2)) * (c.length - 1);
      const i = Math.floor(p), f = p - i;
      const a = c[i], b = c[Math.min(i + 1, c.length - 1)];
      return 'rgb(' + a.map((z, k) => Math.round(z + (b[k] - z) * f)).join(',') + ')';
    }

    function loop() {
      if (running) step(1 / 60);
      paint();
      raf = requestAnimationFrame(loop);
    }

    const startBtn = Kit.button('▶ 開始推', function () {
      if (!running) { reset(); running = true; pushing = true; startBtn.textContent = '✋ 放手'; }
      else if (pushing) { pushing = false; startBtn.textContent = '↻ 重來'; }
      else { reset(); }
    }, 'primary');

    const fCtl = Kit.slider('施力大小', { min: 1, max: 12, value: force, onChange: v => { force = v; paint(); } });
    const frCtl = Kit.slider('地面', {
      min: 1, max: 5, value: friction,
      format: v => SURF[v].n, onChange: v => { friction = v; paint(); }
    });

    controls.appendChild(startBtn);
    controls.appendChild(fCtl.wrap);
    controls.appendChild(frCtl.wrap);
    controls.appendChild(Kit.button('↻ 重設', reset));
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '玩法建議：① 固定地面，只改<b>施力</b> → 看速度變快的<b>快慢</b>不同（INd-Ⅲ-13）。' +
        '② 固定施力，只改<b>地面</b> → 看放手後停下來的距離差多少。'
    }));

    loop();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '「推得越用力，車子會怎樣？」', why: '速度變快的<b>速率</b>越大。課綱寫的是「物體受力愈大，改變愈快」——不是「跑得比較遠」而已，是「變快得比較快」。' },
    { ask: '「放手之後車子為什麼會停？」', why: '因為<b>摩擦力</b>還在。如果完全沒有摩擦，車子會一直跑下去。把地面調成「光滑冰面」看差別。' },
    { ask: '「同樣的力，在冰面和沙地上推，結果一樣嗎？」', why: '不一樣。沙地摩擦大，同樣的力推起來慢得多，放手也很快停。這示範了「力不只一個，要看合起來的效果」。' },
    { ask: '「怎麼知道有沒有受力？」', why: '看兩件事：<b>形狀變了</b>（壓扁、拉長）或<b>運動狀態變了</b>（變快、變慢、轉彎）。這就是 INc-Ⅲ-5 說的「由形變或運動狀態的改變來測量力」。' },
    { ask: '看下面的圖問：「哪一段跑得最快？你怎麼知道？」', why: '線最陡的那一段。學會從距離—時間圖讀速度，比背公式重要。' },
    { ask: '「腳踏車的速度怎麼算？」', why: '距離 ÷ 時間。可以實測：量一段路，用手機計時，算出 m/s 再換成 km/h（×3.6）。' }
  ],

  pitfalls: [
    { bad: '以為「有力才會動，沒力就馬上停」。', fix: '放手後車子還會滑一段（慣性）。會停下來是因為<b>摩擦力</b>，不是因為「力用完了」。' },
    { bad: '以為摩擦力是壞東西，越小越好。', fix: '沒有摩擦力就<b>走不動、剎不了車</b>。鞋底、輪胎的紋路就是要增加摩擦。摩擦力有時要增加、有時要減少。' },
    { bad: '把「速度快」和「力大」畫上等號。', fix: '力改變的是<b>速度的變化</b>，不是速度本身。等速前進時也可能有力（剛好被摩擦力抵銷）。' },
    { bad: '看距離—時間圖時，把「線往上」當成「往上跑」。', fix: '縱軸是<b>距離</b>不是高度。線往上＝距離增加＝往前跑；線<b>水平</b>＝停住。' },
    { bad: '以為摩擦力和運動方向相同。', fix: '摩擦力<b>永遠和運動方向相反</b>，它的作用就是阻礙運動。' },
    { bad: '算速度時單位混用。', fix: '公尺／秒 和 公里／小時 不一樣。1 m/s ＝ 3.6 km/h。' }
  ],

  quiz: function () {
    const type = Kit.pick(['speed', 'speed', 'force', 'friction', 'graph']);

    if (type === 'speed') {
      const d = Kit.randInt(2, 40) * 5, s = Kit.pick([2, 4, 5, 8, 10, 20, 25]);
      const ask = Math.random() < .5;
      if (ask) {
        return {
          q: '一台車 <b>' + s + '</b> 秒跑了 <b>' + d + '</b> 公尺。它的速度是每秒幾公尺？',
          input: 'number', answer: parseFloat((d / s).toFixed(4)), tolerance: 0.01, unit: 'm/s',
          steps: '<b>速度 ＝ 距離 ÷ 時間</b><br>' + d + ' ÷ ' + s + ' ＝ <b>' + parseFloat((d / s).toFixed(4)) + '</b> 公尺／秒<br>' +
            '<span style="color:var(--muted)">課綱 INc-Ⅲ-6：「運用<b>時間與距離</b>可描述物體的速度」。</span>'
        };
      }
      const vv = Kit.pick([2, 3, 4, 5, 6, 8]);
      return {
        q: '一台車以每秒 <b>' + vv + '</b> 公尺的速度前進 <b>' + s + '</b> 秒，跑了多少公尺？',
        input: 'number', answer: vv * s, unit: '公尺',
        steps: '<b>距離 ＝ 速度 × 時間</b><br>' + vv + ' × ' + s + ' ＝ <b>' + vv * s + '</b> 公尺'
      };
    }

    if (type === 'force') {
      const opts = Kit.shuffle([
        { t: '速度變快的速率也越大（更快加速）', ok: true },
        { t: '速度立刻變成固定的最大值', ok: false },
        { t: '速度不會改變，只是比較費力', ok: false },
        { t: '車子會變重', ok: false }
      ]);
      return {
        q: '用<b>越大的力</b>推同一台車，會發生什麼事？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '課綱 INd-Ⅲ-13：「施力可使物體的運動速度改變，<b>物體受力愈大，改變愈快</b>」。<br>' +
          '力改變的是「<b>速度的變化</b>」，力越大，速度增加得越快。<br>' +
          '<span style="color:var(--muted)">可以在教具上固定地面、只改施力，看速度條漲得多快就知道了。</span>'
      };
    }

    if (type === 'friction') {
      const items = [
        { q: '推車放手後為什麼會慢慢停下來？', a: '因為摩擦力一直在阻礙它前進', o: ['因為推力用完了', '因為車子變重了', '因為空氣把它推回來'] },
        { q: '摩擦力的方向和運動方向是什麼關係？', a: '永遠相反', o: ['永遠相同', '垂直', '不一定'] },
        { q: '鞋底和輪胎為什麼要做紋路？', a: '增加摩擦力，才不會打滑', o: ['減少摩擦力，才跑得快', '比較好看', '比較耐磨而已'] },
        { q: '同樣的力，在沙地和冰面推車，哪個跑得比較遠？', a: '冰面，因為摩擦力小', o: ['沙地，因為比較穩', '一樣遠', '無法判斷'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: '<b>' + it.q + '</b>',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<span style="color:var(--muted)">摩擦力永遠<b>和運動方向相反</b>，作用是阻礙運動。<br>' +
          '但它不是壞東西——沒有摩擦力我們走不動、車子也剎不住。' +
          '有時要<b>增加</b>（鞋底紋路、防滑墊），有時要<b>減少</b>（腳踏車鏈條上油、溜冰）。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '線最陡的那一段', ok: true }, { t: '線最平的那一段', ok: false },
      { t: '線最高的地方', ok: false }, { t: '線最低的地方', ok: false }
    ]);
    return {
      q: '看<b>距離—時間圖</b>，哪一段代表車子跑得<b>最快</b>？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '距離—時間圖上，<b>線的陡度就是速度</b>：<br>' +
        '<b>越陡</b> → 同樣時間跑更遠 → <b>越快</b><br>' +
        '<b>越平</b> → 同樣時間跑很少 → <b>越慢</b><br>' +
        '<b>水平線</b> → 距離沒變 → <b>停住不動</b><br>' +
        '<span style="color:var(--warn)">⚠️ 「線最高」只代表<b>跑得最遠</b>，不代表當下速度最快。</span>'
    };
  }
});
