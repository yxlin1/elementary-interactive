/* ============================================================
   四上 自然（康軒）第 3 單元　奇妙的光
   課綱 INe-Ⅱ-6「光線以直線前進，反射時有一定的方向。」
   教具 A：鏡子反射 —— 轉光源、轉鏡子，看入射角永遠等於反射角。
   教具 B：光的直進 —— 移動光源和物體，看影子怎麼變大變小。
   ============================================================ */

Kit.register('s4a-u3', {

  intro: '兩個模式：「鏡子反射」看光碰到鏡子會往哪裡跑；「光的直進與影子」看為什麼影子會變大變小。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 360);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'mirror';
    let srcAng = 130;      // 光源方向（度，從 +x 逆時針）
    let mirAng = 0;        // 鏡面傾斜（度）
    let lampX = 70, objX = 260, objH = 70;

    const D2R = Math.PI / 180;

    function arrow(ctx, x1, y1, x2, y2, color, w) {
      ctx.strokeStyle = color; ctx.lineWidth = w || 2.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1), s = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - s * Math.cos(a - .4), y2 - s * Math.sin(a - .4));
      ctx.lineTo(x2 - s * Math.cos(a + .4), y2 - s * Math.sin(a + .4));
      ctx.closePath(); ctx.fill();
    }

    /* ---------- 模式 A：鏡子反射 ---------- */
    function drawMirror() {
      const ctx = cv.ctx, cx = cv.W / 2, cy = cv.H / 2 + 40;
      const m = mirAng * D2R;

      const ML = 210;
      const mx = Math.cos(m), my = -Math.sin(m);

      // 法線（垂直鏡面）先算，並翻轉成朝向光源那一側——鏡背斜線要畫在反面，
      // 所以順序不能顛倒（先畫斜線會畫到反射面上）。
      let nx = -my, ny = mx;
      const sdx = Math.cos(srcAng * D2R), sdy = -Math.sin(srcAng * D2R);
      if (nx * sdx + ny * sdy < 0) { nx = -nx; ny = -ny; }

      // 鏡面
      ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - ML * mx, cy - ML * my);
      ctx.lineTo(cx + ML * mx, cy + ML * my);
      ctx.stroke();
      // 鏡背斜線：畫在法線的反方向（＝沒有反射的那一面）
      ctx.strokeStyle = '#3f5f8f'; ctx.lineWidth = 2;
      for (let i = -ML + 10; i < ML; i += 14) {
        const bx = cx + i * mx, by = cy + i * my;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - 12 * nx, by - 12 * ny);
        ctx.stroke();
      }

      ctx.save();
      ctx.setLineDash([6, 5]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - nx * 130, cy - ny * 130);
      ctx.lineTo(cx + nx * 130, cy + ny * 130);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fbbf24'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('法線（和鏡面垂直）', cx + nx * 130 + 6, cy + ny * 130);

      // 入射光：從光源射到鏡面中心
      const L = 200;
      const sx = cx + sdx * L, sy = cy + sdy * L;
      arrow(ctx, sx, sy, cx, cy, '#fb7185', 3);

      // 反射光： r = d - 2(d·n)n ，其中 d 是行進方向
      const dx = -sdx, dy = -sdy;
      const dot = dx * nx + dy * ny;
      const rx = dx - 2 * dot * nx, ry = dy - 2 * dot * ny;
      arrow(ctx, cx, cy, cx + rx * L, cy + ry * L, '#34d399', 3);

      // 角度弧線
      const ai = Math.acos(Math.max(-1, Math.min(1, (-dx) * nx + (-dy) * ny)));
      function arc(from, to, color, r, txt) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        const a1 = Math.atan2(from[1], from[0]), a2 = Math.atan2(to[1], to[0]);
        let d1 = a2 - a1;
        while (d1 > Math.PI) d1 -= 2 * Math.PI;
        while (d1 < -Math.PI) d1 += 2 * Math.PI;
        ctx.arc(cx, cy, r, a1, a1 + d1, d1 < 0);
        ctx.stroke();
        const am = a1 + d1 / 2;
        ctx.fillStyle = color; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, cx + Math.cos(am) * (r + 20), cy + Math.sin(am) * (r + 20));
      }
      const deg = (ai / D2R).toFixed(0);
      arc([sdx, sdy], [nx, ny], '#fb7185', 52, '入射角 ' + deg + '°');
      arc([nx, ny], [rx, ry], '#34d399', 78, '反射角 ' + deg + '°');

      // 光源圖示
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8eefc'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('光源', sx, sy - 14);

      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.fillText('紅＝射過去的光　綠＝反射出去的光　黃虛線＝法線', 16, 24);

      readout.innerHTML =
        '<div class="big">入射角 <b>' + deg + '°</b>　＝　反射角 <b>' + deg + '°</b></div>' +
        '不管你怎麼轉光源、怎麼轉鏡子，這兩個角度<b>永遠一樣</b>。這就是課本說的「反射時有一定的方向」。<br>' +
        '<span style="color:var(--muted)">角度是從<b>法線</b>量起的，不是從鏡面量。法線就是和鏡面垂直的那條線（黃色虛線）。</span>';
    }

    /* ---------- 模式 B：光的直進與影子 ---------- */
    function drawShadow() {
      const ctx = cv.ctx;
      const groundY = 300, screenX = 540, lampY = groundY - 120;

      // 地面
      ctx.strokeStyle = '#3f7d55'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, groundY); ctx.lineTo(cv.W - 20, groundY); ctx.stroke();

      // 屏幕（牆）
      ctx.fillStyle = '#22304d';
      ctx.fillRect(screenX, 40, 22, groundY - 40);
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('牆', screenX + 11, 30);

      // 物體
      const objTop = groundY - objH;
      ctx.fillStyle = '#7c5cff';
      ctx.fillRect(objX - 9, objTop, 18, objH);
      ctx.fillStyle = '#b3a2ff';
      ctx.fillText('物體', objX, objTop - 10);

      // 影子高度（相似三角形）
      const ratio = (screenX - lampX) / (objX - lampX);
      const shadowTop = lampY + (objTop - lampY) * ratio;
      const shadowBot = lampY + (groundY - lampY) * ratio;

      // 陰影區
      ctx.fillStyle = 'rgba(10,14,26,.85)';
      ctx.beginPath();
      ctx.moveTo(objX, objTop); ctx.lineTo(screenX, shadowTop);
      ctx.lineTo(screenX, Math.min(shadowBot, groundY)); ctx.lineTo(objX, groundY);
      ctx.closePath(); ctx.fill();

      // 牆上的影子
      ctx.fillStyle = '#05070d';
      ctx.fillRect(screenX, shadowTop, 22, Math.min(shadowBot, groundY) - shadowTop);

      // 光線（直線前進）
      const rays = [objTop, groundY - objH * .5, groundY];
      rays.forEach((y, i) => {
        const t = (screenX - lampX) / (objX - lampX);
        const yEnd = lampY + (y - lampY) * t;
        arrow(ctx, lampX, lampY, screenX, yEnd, i === 0 ? '#fbbf24' : 'rgba(251,191,36,.45)', i === 0 ? 2.5 : 1.5);
      });
      // 沒被擋住、直接打到牆上的光（只取物體上緣以上，否則會畫出「穿過物體」的假光線）
      [-100, -60, -25].forEach(off => {
        const yEnd = lampY + ((objTop + off) - lampY) * ratio;
        if (yEnd > 46 && yEnd < shadowTop - 6) arrow(ctx, lampX, lampY, screenX, yEnd, 'rgba(251,191,36,.3)', 1.2);
      });

      // 光源
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(lampX, lampY, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0b1220'; ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('燈', lampX, lampY);

      // 影子高度 = 物體高 × ratio（相似三角形）。畫面上會被地面切掉，
      // 但報讀要用「真正的倍數」，不能用切掉後的像素高度。
      const times = ratio;
      const clipped = shadowBot > groundY;
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.fillText('光沿著直線前進，被物體擋住的地方就變成影子', 16, 24);

      readout.innerHTML =
        '<div class="big">影子是物體的 <b>' + times.toFixed(2) + '</b> 倍高' +
        (clipped ? '<span style="font-size:14px;color:var(--muted)">（下半部被地面擋住，畫面上看不完）</span>' : '') + '</div>' +
        '光線是<b>直的</b>，所以被物體擋住的部分，會在牆上留下一塊完全照不到的地方 → 影子。<br>' +
        '把<b>物體移近燈</b>，影子會變<b>大</b>；把物體移近牆，影子會變<b>小</b>，而且邊緣更清楚。<br>' +
        '<span style="color:var(--muted)">為什麼影子的形狀和物體一樣？因為光走直線，不會轉彎繞過去。</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'mirror') drawMirror(); else drawShadow();
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '鏡子反射', value: 'mirror' },
      { label: '光的直進與影子', value: 'shadow' }
    ], function (v) {
      mode = v;
      [srcCtl, mirCtl].forEach(s => s.wrap.style.display = (v === 'mirror') ? '' : 'none');
      [lampCtl, objCtl, hCtl].forEach(s => s.wrap.style.display = (v === 'shadow') ? '' : 'none');
      paint();
    }, mode);

    const srcCtl = Kit.slider('光源方向', { min: 95, max: 175, value: srcAng, format: v => v + '°', onChange: v => { srcAng = v; paint(); } });
    const mirCtl = Kit.slider('鏡子傾斜', { min: -40, max: 40, value: mirAng, format: v => v + '°', onChange: v => { mirAng = v; paint(); } });
    const lampCtl = Kit.slider('燈的位置', { min: 40, max: 180, value: lampX, onChange: v => { lampX = v; paint(); } });
    const objCtl = Kit.slider('物體位置', { min: 200, max: 470, value: objX, onChange: v => { objX = v; paint(); } });
    const hCtl = Kit.slider('物體高度', { min: 30, max: 120, value: objH, onChange: v => { objH = v; paint(); } });
    [lampCtl, objCtl, hCtl].forEach(s => s.wrap.style.display = 'none');

    controls.appendChild(modeSeg.wrap);
    [srcCtl, mirCtl, lampCtl, objCtl, hCtl].forEach(s => controls.appendChild(s.wrap));
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '在家可以驗證：拿手電筒和一面小鏡子，在暗一點的房間對著牆照，轉動鏡子看光點怎麼跑。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '「光是走直線還是會轉彎？你怎麼知道？」', why: '因為有影子。如果光會轉彎繞過物體，就不會有影子了。這是「光直進」最好懂的證據。' },
    { ask: '轉動鏡子，問「反射的光跑去哪裡了？有規則嗎？」', why: '讓孩子先觀察、再說出「兩邊角度一樣」。不要一開始就給「入射角＝反射角」這句話。' },
    { ask: '「角度是從鏡子量還是從那條黃色虛線量？」', why: '從<b>法線</b>（黃虛線）量。這是最常搞錯的地方，講一次不夠，隔幾天再問一次。' },
    { ask: '切到影子模式：「物體往燈靠近，影子會變大還變小？先猜再拉。」', why: '先猜再驗證，比直接看答案記得牢。答案是變大。' },
    { ask: '「太陽下的影子和手電筒的影子，哪個邊緣比較清楚？」', why: '延伸問題。太陽很遠、光線幾乎平行，影子邊緣清楚；燈泡近、光線發散，影子邊緣糊糊的。不用要求答對，能討論就很好。' }
  ],

  pitfalls: [
    { bad: '把入射角、反射角從<b>鏡面</b>量起。', fix: '課本和科學上都是從<b>法線</b>（垂直鏡面的那條線）量起。從鏡面量會得到 90° 減掉的那個角。', src: 'INe-Ⅱ-6「反射時有一定的方向」' },
    { bad: '以為「影子是黑色的東西」，是物體「射」出來的。', fix: '影子不是東西，是<b>光照不到的地方</b>。可以問：「房間全黑的時候還有影子嗎？」（沒有，因為沒有光。）' },
    { bad: '以為物體越大影子一定越大。', fix: '影子大小同時取決於<b>物體大小</b>和<b>離光源的距離</b>。同一個物體靠近燈，影子就會變大。' },
    { bad: '以為光碰到任何東西都會反射成一個亮點。', fix: '光滑的鏡面才會整齊地往一個方向反射；粗糙的表面（牆、紙）會把光往四面八方散開，所以我們才看得見它。' }
  ],

  quiz: function () {
    const type = Kit.pick(['angle', 'normal', 'shadow', 'straight']);

    if (type === 'angle') {
      const a = Kit.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
      return {
        q: '一道光射到平面鏡上，<b>入射角是 ' + a + '°</b>。反射角是幾度？',
        input: 'number', answer: a, unit: '度',
        steps: '光的反射有一個固定規則：<b>入射角 ＝ 反射角</b>。<br>入射角 ' + a + '° → 反射角也是 <b>' + a + '°</b>。'
      };
    }

    if (type === 'normal') {
      const opts = Kit.shuffle([
        { t: '和鏡面垂直的那條線（法線）', ok: true },
        { t: '鏡面本身', ok: false },
        { t: '地面', ok: false },
        { t: '入射光線本身', ok: false }
      ]);
      return {
        q: '入射角和反射角，是從哪裡量起的？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '都是從<b>法線</b>量起。法線是通過入射點、<b>和鏡面垂直</b>的一條線（教具裡的黃色虛線）。<br>如果從鏡面量，得到的角度會是 90° 減掉正確答案。'
      };
    }

    if (type === 'shadow') {
      const opts = Kit.shuffle([
        { t: '變大', v: 'big' }, { t: '變小', v: 'small' },
        { t: '不會變', v: 'same' }, { t: '會消失', v: 'gone' }
      ]);
      const near = Math.random() < .5;
      return {
        q: '手電筒照著一個玩具，在牆上出現影子。如果把玩具<b>往手電筒移近</b>' + (near ? '' : '（遠離牆壁）') + '，牆上的影子會怎樣？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.v === 'big'),
        steps: '光從手電筒<b>發散</b>出去。玩具離手電筒越近，擋住的光束角度越大，投到牆上的影子就<b>越大</b>。<br>反過來把玩具貼到牆上，影子會縮到和玩具差不多大，而且邊緣最清楚。'
      };
    }

    const opts = Kit.shuffle([
      { t: '因為光沿著直線前進，被物體擋住就照不到後面', ok: true },
      { t: '因為物體會放出黑色的光', ok: false },
      { t: '因為光會被物體吸進去再吐出來', ok: false },
      { t: '因為光碰到物體會轉彎', ok: false }
    ]);
    return {
      q: '為什麼物體後面會有<b>影子</b>？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '光是<b>直線前進</b>的，不會轉彎繞到物體後面。被擋住的那一塊地方照不到光，看起來就是暗的，這就是影子。<br>影子不是一個「東西」，而是「光到不了的地方」。'
    };
  }
});
