/* ============================================================
   教具 m5a-u5　多邊形與扇形
   南一 115：五上 第 3 單元「多邊形」與五下 第 4 單元「扇形」共用
   課綱 S-5-1「三角形與四邊形的性質：操作活動與簡單推理。
                含三角形三內角和為 180 度。三角形任意兩邊和大於第三邊。
                平行四邊形的對邊相等、對角相等。」
        S-5-3「扇形：扇形的定義。「圓心角」。扇形可視為圓的一部分。
                將扇形與分數結合（幾分之幾圓）。能畫出指定扇形。」
   ============================================================ */

Kit.register('m5a-u5', {

  intro: '三個模式：把多邊形<b>切成三角形</b>算內角和、檢查<b>三角形兩邊和</b>能不能圍起來、拉<b>圓心角</b>看扇形是幾分之幾圓。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 330);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'poly', n = 5, ang = 90, s1 = 5, s2 = 4, s3 = 6;

    /* ---------- 模式 A：多邊形內角和 ---------- */
    function paintPoly() {
      const ctx = cv.ctx, cx = 250, cy = 170, R = 120;
      const pts = Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n;
        return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      });

      // 從第一個頂點拉對角線，把多邊形切成 n-2 個三角形
      const COL = ['rgba(77,163,255,.35)', 'rgba(124,92,255,.35)', 'rgba(52,211,153,.35)',
                   'rgba(251,191,36,.35)', 'rgba(251,113,133,.35)', 'rgba(96,165,250,.35)'];
      for (let i = 1; i < n - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
        ctx.closePath();
        ctx.fillStyle = COL[(i - 1) % COL.length]; ctx.fill();
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 1; ctx.stroke();
        // 三角形編號
        const mx = (pts[0][0] + pts[i][0] + pts[i + 1][0]) / 3;
        const my = (pts[0][1] + pts[i][1] + pts[i + 1][1]) / 3;
        ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(i, mx, my);
      }
      // 外框
      ctx.beginPath();
      pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 3; ctx.stroke();
      pts.forEach(p => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fill();
      });

      // 右側算式
      const tri = n - 2, sum = tri * 180;
      ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('從一個頂點拉對角線', 420, 90);
      ctx.fillText('切出 ' + tri + ' 個三角形', 420, 114);
      ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      ctx.fillText(tri + ' × 180°', 420, 150);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 26px "Microsoft JhengHei", sans-serif';
      ctx.fillText('= ' + sum + '°', 420, 180);

      const names = { 3: '三角形', 4: '四邊形', 5: '五邊形', 6: '六邊形', 7: '七邊形', 8: '八邊形' };
      readout.innerHTML =
        '<div class="big">' + names[n] + '的內角和 ＝ (' + n + ' − 2) × 180° ＝ <b>' + sum + '°</b></div>' +
        '為什麼是 (' + n + ' − 2)？因為從一個頂點往其他頂點拉線，<b>相鄰的兩個頂點拉不出對角線</b>，' +
        '自己也不能拉，所以剛好切出 ' + n + ' − 2 ＝ <b>' + tri + '</b> 個三角形。<br>' +
        '每個三角形的內角和都是 180°，' + tri + ' 個就是 <b>' + sum + '°</b>。<br>' +
        '<span style="color:var(--muted)">正 ' + n + ' 邊形的每一個內角 ＝ ' + sum + ' ÷ ' + n + ' ＝ <b>' +
        (sum / n).toFixed(sum % n ? 1 : 0) + '°</b>（只有<b>正</b>多邊形才能這樣平分）。</span>';
    }

    /* ---------- 模式 B：三角形兩邊和 ---------- */
    function paintTri() {
      const ctx = cv.ctx;
      const U = 26, ox = 120, oy = 250;
      const ok = (s1 + s2 > s3) && (s1 + s3 > s2) && (s2 + s3 > s1);

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('三根棍子長 ' + s1 + '、' + s2 + '、' + s3 + '，能不能圍成三角形？', 16, 22);

      if (ok) {
        // 以 s3 為底，用餘弦定理求頂點
        const cosA = (s3 * s3 + s2 * s2 - s1 * s1) / (2 * s3 * s2);
        const ax = ox + s2 * cosA * U;
        const ay = oy - s2 * Math.sqrt(Math.max(1 - cosA * cosA, 0)) * U;
        const bx = ox, by = oy, ccx = ox + s3 * U;
        ctx.beginPath();
        ctx.moveTo(bx, by); ctx.lineTo(ccx, by); ctx.lineTo(ax, ay); ctx.closePath();
        ctx.fillStyle = 'rgba(52,211,153,.28)'; ctx.fill();
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3; ctx.stroke();
        const lbl = [[(bx + ccx) / 2, by + 20, s3, '#4da3ff'],
                     [(bx + ax) / 2 - 16, (by + ay) / 2, s2, '#7c5cff'],
                     [(ccx + ax) / 2 + 16, (by + ay) / 2, s1, '#fb7185']];
        lbl.forEach(([x, y, v, c]) => {
          ctx.fillStyle = c; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(v, x, y);
        });
      } else {
        // 圍不起來：把兩短邊攤平在長邊上，看差多少
        const sorted = [s1, s2, s3].sort((a, b) => a - b);
        const [p, q, r] = sorted;
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + r * U, oy); ctx.stroke();
        ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(ox, oy - 40); ctx.lineTo(ox + p * U, oy - 40); ctx.stroke();
        ctx.strokeStyle = '#7c5cff';
        ctx.beginPath(); ctx.moveTo(ox + p * U, oy - 40); ctx.lineTo(ox + (p + q) * U, oy - 40); ctx.stroke();
        ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ox + (p + q) * U, oy - 52); ctx.lineTo(ox + (p + q) * U, oy + 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + r * U, oy - 52); ctx.lineTo(ox + r * U, oy + 12); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#fb7185'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('兩根短的接起來 ' + (p + q) + '，還是' + (p + q === r ? '剛好等於' : '短於') + '最長的 ' + r,
          ox + r * U / 2, oy + 24);
      }

      readout.innerHTML =
        '<div class="big">' + (ok
          ? '<span style="color:var(--ok)">✅ 圍得成三角形</span>'
          : '<span style="color:var(--no)">❌ 圍不成三角形</span>') + '</div>' +
        '檢查三次「<b>任意兩邊和 > 第三邊</b>」：<br>' +
        [[s1, s2, s3], [s1, s3, s2], [s2, s3, s1]].map(([x, y, z]) =>
          x + ' ＋ ' + y + ' ＝ ' + (x + y) + (x + y > z ? ' > ' : x + y === z ? ' ＝ ' : ' < ') + z +
          (x + y > z ? ' ✅' : ' ❌')).join('<br>') +
        '<br><span style="color:var(--muted)">只要有<b>一次</b>不成立就圍不起來。' +
        '想像兩根短棍子從長棍子兩端往中間倒——如果加起來不夠長，它們永遠碰不到。' +
        (s1 + s2 === s3 || s1 + s3 === s2 || s2 + s3 === s1
          ? '　剛好相等時會壓成一條直線，沒有面積，不算三角形。' : '') + '</span>';
    }

    /* ---------- 模式 C：扇形 ---------- */
    function paintFan() {
      const ctx = cv.ctx, cx = 230, cy = 175, R = 125;
      // 整圓底色
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = '#16203a'; ctx.fill();
      ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 2; ctx.stroke();
      // 扇形
      const a0 = -Math.PI / 2, a1 = a0 + ang * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath();
      ctx.fillStyle = 'rgba(77,163,255,.55)'; ctx.fill();
      ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 3; ctx.stroke();
      // 圓心角弧
      ctx.beginPath(); ctx.arc(cx, cy, 40, a0, a1);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      const am = (a0 + a1) / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ang + '°', cx + Math.cos(am) * 62, cy + Math.sin(am) * 62);
      // 圓心與半徑
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('圓心', cx + 8, cy + 6);

      // 右側：幾分之幾圓
      const g = Kit.gcd(ang, 360);
      const num = ang / g, den = 360 / g;
      ctx.fillStyle = '#93a3c4'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('圓心角 ' + ang + '° 占整圓 360° 的', 400, 110);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 34px "Microsoft JhengHei", sans-serif';
      ctx.fillText(num + ' / ' + den, 400, 140);
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.fillText('（' + ang + ' ÷ 360 ＝ ' + (ang / 360).toFixed(3).replace(/0+$/, '') + '）', 400, 186);

      readout.innerHTML =
        '<div class="big">圓心角 ' + ang + '° 的扇形 ＝ <b>' + num + '/' + den + ' 圓</b></div>' +
        '<b>扇形</b>＝兩條半徑加上它們之間的一段弧圍成的圖形。夾在中間的角叫做<b>圓心角</b>。<br>' +
        '扇形占整個圓的幾分之幾，就看圓心角占 360° 的幾分之幾：' + ang + ' ÷ 360 ＝ <b>' + num + '/' + den + '</b>。<br>' +
        '<span style="color:var(--muted)">常見的：90° ＝ 1/4 圓、120° ＝ 1/3 圓、180° ＝ 半圓、60° ＝ 1/6 圓。' +
        '圓心角<b>可以大於 180°</b>（課綱明列），拉到 270° 看看——那也是扇形，占 3/4 圓。</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'poly') paintPoly();
      else if (mode === 'tri') paintTri();
      else paintFan();
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '多邊形內角和', value: 'poly' },
      { label: '三角形兩邊和', value: 'tri' },
      { label: '扇形', value: 'fan' }
    ], function (v) {
      mode = v;
      nCtl.wrap.style.display = v === 'poly' ? '' : 'none';
      [c1, c2, c3].forEach(c => c.wrap.style.display = v === 'tri' ? '' : 'none');
      angCtl.wrap.style.display = v === 'fan' ? '' : 'none';
      fanSeg.wrap.style.display = v === 'fan' ? '' : 'none';
      paint();
    }, mode);

    const nCtl = Kit.slider('邊數', { min: 3, max: 8, value: n, format: v => v + ' 邊形', onChange: v => { n = v; paint(); } });
    const c1 = Kit.slider('邊 A', { min: 1, max: 10, value: s1, onChange: v => { s1 = v; paint(); } });
    const c2 = Kit.slider('邊 B', { min: 1, max: 10, value: s2, onChange: v => { s2 = v; paint(); } });
    const c3 = Kit.slider('邊 C', { min: 1, max: 10, value: s3, onChange: v => { s3 = v; paint(); } });
    const angCtl = Kit.slider('圓心角', { min: 10, max: 350, step: 5, value: ang, format: v => v + '°', onChange: v => { ang = v; paint(); } });
    const fanSeg = Kit.segmented('快速選', [
      { label: '90° 1/4圓', value: 90 }, { label: '120° 1/3圓', value: 120 },
      { label: '180° 半圓', value: 180 }, { label: '270° 3/4圓', value: 270 }
    ], function (v) {
      ang = v; angCtl.input.value = v; angCtl.output.textContent = v + '°'; paint();
    }, 90);

    [c1, c2, c3].forEach(c => c.wrap.style.display = 'none');
    angCtl.wrap.style.display = 'none';
    fanSeg.wrap.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(nCtl.wrap);
    [c1, c2, c3].forEach(c => controls.appendChild(c.wrap));
    controls.appendChild(angCtl.wrap);
    controls.appendChild(fanSeg.wrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱在這一階段只做「<b>操作活動與簡單推理</b>」，不做嚴格證明。切三角形、擺棍子、拉圓心角，看得懂就夠了。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '多邊形模式：「五邊形切出幾個三角形？六邊形呢？」', why: '3 個、4 個。讓孩子自己發現「永遠比邊數少 2」，這比背 (n−2)×180 有用得多。' },
    { ask: '「為什麼是少 2 個，不是少 1 個？」', why: '因為從一個頂點出發，左右兩個鄰居和自己都拉不出對角線，所以少 3 個頂點、切出 n−2 個三角形。' },
    { ask: '三角形模式：把三邊設成 2、3、9，問「圍得起來嗎？」', why: '圍不起來。2+3=5 還不到 9。畫面會把兩根短棍攤平給他看差多少——比講「三角不等式」直觀。' },
    { ask: '設成 3、4、7（剛好相等）：「這樣算不算三角形？」', why: '不算。會壓成一條直線，沒有面積。「大於」不能改成「大於等於」。' },
    { ask: '扇形模式：「圓心角 90° 是幾分之幾圓？那 270° 呢？」', why: '1/4、3/4。課綱特別註明扇形<b>包含圓心角大於 180 度</b>的情況，很多人會以為扇形一定小於半圓。' }
  ],

  pitfalls: [
    { bad: '把「內角和」和「一個內角」搞混。', fix: '五邊形內角和是 540°，那是<b>五個角加起來</b>。正五邊形每一個角是 540÷5＝108°。' },
    { bad: '任何多邊形都用「內角和 ÷ 邊數」求單一內角。', fix: '只有<b>正</b>多邊形（每個角都一樣）才能平分。歪掉的五邊形每個角不一樣大。' },
    { bad: '判斷三角形只檢查一組兩邊和。', fix: '要檢查<b>三組</b>都成立。只要有一組不成立就圍不起來。（實務上只要檢查「兩短邊和 > 最長邊」就夠。）' },
    { bad: '以為兩邊和「等於」第三邊也可以圍成三角形。', fix: '不行，會壓成一條直線。課綱寫的是「大於」。' },
    { bad: '以為扇形一定比半圓小。', fix: '圓心角 270° 也是扇形（3/4 圓）。課綱備註明列「扇形含圓心角大於 180 度的情況」。', src: 'S-5-3 備註' },
    { bad: '把「圓心角」和扇形的弧長搞混。', fix: '圓心角是<b>角度</b>（度），弧是<b>一段曲線</b>。扇形占幾分之幾圓，看的是圓心角。' }
  ],

  quiz: function () {
    const type = Kit.pick(['sum', 'each', 'tri', 'fan', 'fan']);

    if (type === 'sum') {
      const k = Kit.randInt(3, 10);
      const names = { 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
      return {
        q: '<b>' + names[k] + '邊形</b>的內角和是幾度？',
        input: 'number', answer: (k - 2) * 180, unit: '度',
        steps: '從一個頂點拉對角線，可以把 ' + k + ' 邊形切成 <b>' + k + ' − 2 ＝ ' + (k - 2) + '</b> 個三角形。<br>' +
          '每個三角形內角和 180°，所以總和 ＝ ' + (k - 2) + ' × 180 ＝ <b>' + (k - 2) * 180 + '</b>°。'
      };
    }

    if (type === 'each') {
      const k = Kit.pick([3, 4, 5, 6, 8, 9, 10, 12]);
      const names = { 3: '三', 4: '四', 5: '五', 6: '六', 8: '八', 9: '九', 10: '十', 12: '十二' };
      const sum = (k - 2) * 180;
      return {
        q: '<b>正' + names[k] + '邊形</b>的<b>每一個</b>內角是幾度？',
        input: 'number', answer: sum / k, tolerance: 0.01, unit: '度',
        steps: '先算內角和：(' + k + ' − 2) × 180 ＝ <b>' + sum + '</b>°<br>' +
          '正多邊形每個角一樣大，平分成 ' + k + ' 份：' + sum + ' ÷ ' + k + ' ＝ <b>' + (sum / k) + '</b>°<br>' +
          '<span style="color:var(--muted)">注意「內角和」問的是全部加起來，「每一個內角」才要再除以邊數。</span>'
      };
    }

    if (type === 'tri') {
      const sets = [[3, 4, 5, true], [2, 3, 9, false], [5, 5, 5, true], [1, 2, 3, false],
                    [6, 8, 10, true], [4, 4, 9, false], [7, 3, 5, true], [2, 2, 5, false]];
      const s = Kit.pick(sets);
      const opts = ['圍得成三角形', '圍不成三角形'];
      const srt = s.slice(0, 3).sort((a, b) => a - b);
      return {
        q: '三根棍子長 <b>' + s[0] + '、' + s[1] + '、' + s[2] + '</b> 公分，能圍成三角形嗎？',
        choices: opts, answer: s[3] ? 0 : 1,
        steps: '判斷法：<b>兩根短的加起來，必須比最長的還長</b>。<br>' +
          '兩短邊：' + srt[0] + ' ＋ ' + srt[1] + ' ＝ <b>' + (srt[0] + srt[1]) + '</b>，最長邊：<b>' + srt[2] + '</b><br>' +
          (s[3]
            ? (srt[0] + srt[1]) + ' > ' + srt[2] + ' ✅ <b>圍得成</b>。'
            : (srt[0] + srt[1]) + (srt[0] + srt[1] === srt[2] ? ' ＝ ' : ' < ') + srt[2] + ' ❌ <b>圍不成</b>' +
              (srt[0] + srt[1] === srt[2] ? '（剛好相等會壓成一直線，沒有面積）' : '（兩根短的碰不到）') + '。')
      };
    }

    const cases = [[90, '1/4'], [180, '1/2'], [120, '1/3'], [60, '1/6'], [270, '3/4'],
                   [45, '1/8'], [240, '2/3'], [30, '1/12'], [135, '3/8']];
    const c = Kit.pick(cases);
    const ask = Math.random() < .5;
    if (ask) {
      const opts = Kit.shuffle(['1/4', '1/2', '1/3', '1/6', '3/4', '1/8', '2/3', '1/12', '3/8']
        .filter(x => x !== c[1]).slice(0, 3).concat([c[1]]));
      return {
        q: '圓心角 <b>' + c[0] + '°</b> 的扇形，是幾分之幾圓？',
        choices: opts, answer: opts.indexOf(c[1]),
        steps: '整個圓是 <b>360°</b>。<br>' + c[0] + ' ÷ 360 ＝ <b>' + c[1] + '</b><br>' +
          '（把 ' + c[0] + '/360 約分：分子分母同除以 ' + Kit.gcd(c[0], 360) + '。）'
      };
    }
    return {
      q: '要畫一個 <b>' + c[1] + ' 圓</b>的扇形，圓心角要畫幾度？',
      input: 'number', answer: c[0], unit: '度',
      steps: '整個圓 360°，取其中 ' + c[1] + '：<br>360 × ' + c[1] + ' ＝ <b>' + c[0] + '</b>°<br>' +
        '<span style="color:var(--muted)">課綱要求「能畫出指定扇形」——給定幾分之幾圓，要算得出圓心角再用量角器畫。</span>'
    };
  }
});
