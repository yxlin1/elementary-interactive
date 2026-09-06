/* ============================================================
   教具 m5b-u3 容積　m5b-u7 表面積
   南一 115：五下 第 9 單元「容積和容量」／五上 第 10 單元「正方體和長方體」
   課綱 N-5-15「解題：容積。容量、容積和體積間的關係。知道液體體積的意義。」
                備註：教學中須包含如何以容積的想法求不規則物體的體積。
        S-5-5「正方體和長方體：計算體積與表面積。」
                備註：能算長方體的表面積，但不記成公式。
   ============================================================ */

(function () {

  /* ============================================================
     第 3 單元　容積
     ============================================================ */
  Kit.register('m5b-u3', {

    intro: '同一個盒子有三個數字：<b>體積</b>（連盒壁一起算）、<b>容積</b>（裡面裝得下多少）、<b>容量</b>（實際裝了多少水）。拖曳厚度看它們怎麼差開。',

    build: function (host) {
      const stage = Kit.el('div', { class: 'stage' });
      host.appendChild(stage);
      const S = Kit.scene3d(stage, { camera: [11, 9, 13], height: 420, gridSize: 30, gridDiv: 30 });
      S.fit(5.5);   // 盒子最大 16cm × 0.32 ≈ 5.1

      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let L = 10, W = 8, H = 8, T = 1, water = 60, mode = 'box';
      let stoneOn = false, stoneVol = 60;

      const root = new THREE.Group();
      S.scene.add(root);

      function clear() {
        while (root.children.length) {
          const c = root.children.pop();
          c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
          root.remove(c);
        }
      }

      function boxWire(w, h, d, color, y) {
        const g = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
          new THREE.LineBasicMaterial({ color: color })
        );
        g.position.y = y;
        return g;
      }

      function build() {
        clear();
        const sc = 0.32;                       // 公分 → 場景單位
        const ow = L * sc, oh = H * sc, od = W * sc;
        const iw = (L - 2 * T) * sc, ih = (H - T) * sc, id = (W - 2 * T) * sc;

        // 外殼（半透明）
        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(ow, oh, od),
          new THREE.MeshLambertMaterial({ color: 0x8fb6ff, transparent: true, opacity: .17 })
        );
        shell.position.y = oh / 2;
        root.add(shell);
        root.add(boxWire(ow, oh, od, 0x4da3ff, oh / 2));

        // 內部空間（虛線框）
        root.add(boxWire(iw, ih, id, 0x7c5cff, T * sc + ih / 2));

        // 水
        const wh = ih * water / 100;
        if (wh > 0.01) {
          const w = new THREE.Mesh(
            new THREE.BoxGeometry(iw, wh, id),
            new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: .55 })
          );
          w.position.y = T * sc + wh / 2;
          root.add(w);
        }

        // 不規則物體（排水法）
        if (mode === 'stone' && stoneOn) {
          const r = Math.pow(stoneVol * 3 / (4 * Math.PI), 1 / 3) * sc;
          const stone = new THREE.Mesh(
            new THREE.DodecahedronGeometry(r, 0),
            new THREE.MeshLambertMaterial({ color: 0x9a8478 })
          );
          stone.position.set(0, T * sc + r, 0);
          stone.rotation.set(.4, .7, .2);
          root.add(stone);
        }
      }

      function paint() {
        build();
        const outer = L * W * H;
        const iL = L - 2 * T, iW = W - 2 * T, iH = H - T;
        const inner = Math.max(iL, 0) * Math.max(iW, 0) * Math.max(iH, 0);
        const waterV = inner * water / 100;

        if (mode === 'box') {
          readout.innerHTML =
            '<div class="big">體積 <b>' + outer + '</b>　容積 <b>' + inner + '</b>　容量 <b>' + Math.round(waterV) + '</b> 立方公分</div>' +
            '<b>體積</b>＝整個盒子佔多大空間（連盒壁）：' + L + ' × ' + W + ' × ' + H + ' ＝ <b>' + outer + '</b> 立方公分<br>' +
            '<b>容積</b>＝裡面最多裝得下多少（要扣掉盒壁）：內部 ' + iL + ' × ' + iW + ' × ' + iH + ' ＝ <b>' + inner + '</b> 立方公分<br>' +
            '<b>容量</b>＝現在實際裝了多少水：<b>' + Math.round(waterV) + '</b> 立方公分 ＝ <b>' + Math.round(waterV) + ' 毫升（mL）</b><br>' +
            '<span style="color:var(--muted)">盒壁厚 ' + T + ' 公分，就吃掉了 ' + (outer - inner) + ' 立方公分。' +
            '厚度拉到 0 的話，體積和容積就一樣了。<br>' +
            '<b>重要換算</b>：1 立方公分 ＝ 1 毫升（mL）；1000 立方公分 ＝ 1 公升（L）。' +
            '所以這杯水是 <b>' + parseFloat((waterV / 1000).toFixed(3)) + ' 公升</b>。</span>';
        } else {
          const before = waterV;
          const after = before + (stoneOn ? stoneVol : 0);
          const riseRatio = inner ? (after / inner) : 0;
          readout.innerHTML =
            '<div class="big">' + (stoneOn
              ? '放入石頭後水位上升 → 上升的水量 ＝ 石頭的體積 <b>' + stoneVol + '</b> 立方公分'
              : '先記錄目前水量：<b>' + Math.round(before) + '</b> 立方公分') + '</div>' +
            '<b>排水法</b>：石頭形狀不規則，沒有公式可以算。但把它<b>整個沉入水中</b>，' +
            '被擠上去的水量，剛好就是石頭佔掉的空間。<br>' +
            '放入前水量 <b>' + Math.round(before) + '</b> → 放入後 <b>' + Math.round(after) + '</b>，' +
            '差 <b>' + (stoneOn ? stoneVol : 0) + '</b> 立方公分 ＝ 石頭的體積。<br>' +
            (riseRatio > 1
              ? '<span style="color:var(--no)">⚠️ 水滿出來了！這樣量不準，要先把水位放低一點。</span>'
              : '<span style="color:var(--muted)">這就是課綱要求的「以容積的想法求<b>不規則物體</b>的體積」。' +
                '在家可以用量杯和小石頭真的做一次。</span>');
        }
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '體積・容積・容量', value: 'box' },
        { label: '排水法量石頭', value: 'stone' }
      ], function (v) {
        mode = v;
        tCtl.wrap.style.display = v === 'box' ? '' : 'none';
        [stoneBtn, svCtl.wrap].forEach(x => x.style.display = v === 'stone' ? '' : 'none');
        if (v === 'stone') { water = 55; wCtl.input.value = 55; wCtl.output.textContent = '55%'; }
        paint();
      }, mode);

      const lCtl = Kit.slider('長', { min: 4, max: 16, value: L, format: v => v + ' cm', onChange: v => { L = v; paint(); } });
      const wwCtl = Kit.slider('寬', { min: 4, max: 16, value: W, format: v => v + ' cm', onChange: v => { W = v; paint(); } });
      const hCtl = Kit.slider('高', { min: 4, max: 16, value: H, format: v => v + ' cm', onChange: v => { H = v; paint(); } });
      const tCtl = Kit.slider('盒壁厚度', { min: 0, max: 3, step: 0.5, value: T, format: v => v + ' cm', onChange: v => { T = v; paint(); } });
      const wCtl = Kit.slider('水位', { min: 0, max: 100, value: water, format: v => v + '%', onChange: v => { water = v; paint(); } });
      const svCtl = Kit.slider('石頭大小', { min: 20, max: 200, step: 10, value: stoneVol, format: v => v + ' cm³', onChange: v => { stoneVol = v; paint(); } });
      const stoneBtn = Kit.button('放入／取出石頭', function () { stoneOn = !stoneOn; paint(); }, 'primary');
      stoneBtn.style.display = 'none';
      svCtl.wrap.style.display = 'none';

      controls.appendChild(modeSeg.wrap);
      [lCtl, wwCtl, hCtl, tCtl, wCtl, svCtl].forEach(x => controls.appendChild(x.wrap));
      controls.appendChild(stoneBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '藍框＝盒子外圍（體積），紫框＝裡面的空間（容積），水藍色＝實際裝的水（容量）。' +
          '<b>1 立方公分 ＝ 1 毫升</b>，這個換算之後量水、量油都會用到。'
      }));

      paint();
      return S.dispose;
    },

    parentGuide: [
      { ask: '「體積和容積差在哪裡？」', why: '體積是「這個東西佔多大空間」，容積是「裡面裝得下多少」。把厚度拉大，兩個數字就明顯分開了。' },
      { ask: '把盒壁厚度拉到 0：「現在體積和容積一樣了，為什麼？」', why: '因為沒有壁佔空間。這一步能讓孩子懂「差別來自盒壁」，不是兩個無關的東西。' },
      { ask: '「1 毫升的水有多大？」', why: '就是 1 立方公分——邊長 1 公分的小方塊。這個連結很重要：家裡的量杯 500 mL ＝ 500 立方公分。' },
      { ask: '排水法：「石頭是彎彎曲曲的，怎麼量體積？」', why: '沒有公式，但可以「用水量」。放進水裡，水上升多少，石頭就是多大。這是課綱明訂要教的方法。' },
      { ask: '在家做一次：量杯裝水記刻度 → 放石頭 → 記新刻度 → 相減。', why: '五分鐘就能做完，比看畫面更有感。記得石頭要<b>完全沉入</b>，而且水不能溢出來。' }
    ],

    pitfalls: [
      { bad: '把體積和容積當成同一個數字。', fix: '有厚度的容器，<b>體積 > 容積</b>。體積算外圍，容積算內部。' },
      { bad: '算容積時只扣一層壁。', fix: '長和寬要<b>各扣兩次</b>（左右兩壁、前後兩壁），高只扣底部一次（上面開口沒有蓋）。' },
      { bad: '搞不清楚 mL 和立方公分。', fix: '<b>1 mL ＝ 1 立方公分</b>，完全一樣大，只是量液體習慣用 mL。1 公升 ＝ 1000 mL ＝ 1000 立方公分。' },
      { bad: '排水法時石頭沒有完全沉入，或水溢出來。', fix: '兩種都會量不準。石頭要整個泡在水裡，而且水位不能滿到溢出。' },
      { bad: '以為容量就是容積。', fix: '容積是「最多裝得下多少」，容量是「現在裝了多少」。杯子容積 300 mL，倒半杯的容量只有 150 mL。' }
    ],

    quiz: function () {
      const type = Kit.pick(['inner', 'unit', 'stone', 'unit']);

      if (type === 'inner') {
        const t = Kit.pick([1, 2]);
        const iL = Kit.randInt(4, 14), iW = Kit.randInt(4, 12), iH = Kit.randInt(4, 12);
        const L = iL + 2 * t, W = iW + 2 * t, H = iH + t;
        return {
          q: '一個無蓋的長方體盒子，<b>外面</b>量起來長 ' + L + '、寬 ' + W + '、高 ' + H + ' 公分，' +
            '盒壁和底都厚 <b>' + t + '</b> 公分。它的<b>容積</b>是多少立方公分？',
          input: 'number', answer: iL * iW * iH, unit: '立方公分',
          steps: '長：左右各有一片壁，扣 2 次 → ' + L + ' − ' + t + ' × 2 ＝ <b>' + iL + '</b><br>' +
            '寬：前後各有一片壁，扣 2 次 → ' + W + ' − ' + t + ' × 2 ＝ <b>' + iW + '</b><br>' +
            '高：只有底部，扣 1 次（上面沒蓋）→ ' + H + ' − ' + t + ' ＝ <b>' + iH + '</b><br>' +
            '容積 ＝ ' + iL + ' × ' + iW + ' × ' + iH + ' ＝ <b>' + iL * iW * iH + '</b> 立方公分'
        };
      }

      if (type === 'stone') {
        const before = Kit.randInt(200, 500), rise = Kit.randInt(20, 150);
        return {
          q: '量杯裡有 <b>' + before + '</b> 毫升的水。把一顆石頭完全放進去後，水位變成 <b>' + (before + rise) +
            '</b> 毫升。這顆石頭的<b>體積</b>是多少立方公分？',
          input: 'number', answer: rise, unit: '立方公分',
          steps: '石頭沉入水中，把水擠上去。<b>上升的水量 ＝ 石頭的體積</b>。<br>' +
            (before + rise) + ' − ' + before + ' ＝ <b>' + rise + '</b> 毫升<br>' +
            '因為 <b>1 毫升 ＝ 1 立方公分</b>，所以石頭是 <b>' + rise + '</b> 立方公分。<br>' +
            '<span style="color:var(--muted)">這叫<b>排水法</b>，專門用來量不規則物體的體積。</span>'
        };
      }

      const cases = [
        ['1 公升是多少毫升？', 1000, '毫升'],
        ['2500 毫升是多少公升？', 2.5, '公升'],
        ['1 公升是多少立方公分？', 1000, '立方公分'],
        ['500 立方公分是多少毫升？', 500, '毫升'],
        ['1500 立方公分是多少公升？', 1.5, '公升'],
        ['0.8 公升是多少毫升？', 800, '毫升']
      ];
      const c = Kit.pick(cases);
      return {
        q: '<b>' + c[0] + '</b>',
        input: 'number', answer: c[1], tolerance: 1e-9, unit: c[2],
        steps: '記住這一組換算：<br>' +
          '<b>1 立方公分 ＝ 1 毫升（mL）</b><br>' +
          '<b>1 公升（L）＝ 1000 毫升 ＝ 1000 立方公分</b><br>' +
          '答案：<b>' + c[1] + ' ' + c[2] + '</b>'
      };
    }
  });


  /* ============================================================
     第 7 單元　表面積
     ============================================================ */
  Kit.register('m5b-u7', {

    intro: '表面積＝<b>外面要貼幾張紙</b>。拖曳「展開程度」，把長方體攤平成六個長方形，兩兩一樣大——不用背公式，數出來就好。',

    build: function (host) {
      const stage = Kit.el('div', { class: 'stage' });
      host.appendChild(stage);
      const S = Kit.scene3d(stage, { camera: [10, 9, 12], height: 420, gridSize: 40, gridDiv: 40 });
      S.fit(11);    // 8×8×8 完全展開時六片攤開會撐得很大

      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let L = 5, W = 3, H = 4, t = 0;
      const root = new THREE.Group();
      S.scene.add(root);
      const faces = [];   // {pivot, aReal, aFlat}

      const COL = { lw: 0x7c5cff, lh: 0x4da3ff, wh: 0x34d399 };

      function clear() {
        while (root.children.length) {
          const c = root.children.pop();
          c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
          root.remove(c);
        }
        faces.length = 0;
      }

      /* 在 XY 平面畫一片長方形（左下角在原點） */
      function plate(w, h, color) {
        const g = new THREE.Group();
        const geo = new THREE.PlaneGeometry(w, h);
        const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
          color: color, side: THREE.DoubleSide, transparent: true, opacity: .85
        }));
        m.position.set(w / 2, h / 2, 0);
        g.add(m);
        const pts = [[0, 0], [w, 0], [w, h], [0, h]].map(p => new THREE.Vector3(p[0], p[1], 0));
        g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: 0x0b1220 })));
        return g;
      }

      function build() {
        clear();
        const sc = 0.6;
        const l = L * sc, w = W * sc, h = H * sc;

        // 底面固定貼地（長 l、寬 w）
        const bottom = plate(l, w, COL.lw);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.set(-l / 2, 0.01, w / 2);
        root.add(bottom);

        /* 四個側面：各自以底面的一條邊為軸往上摺
           hinge 位置在底面邊上，local X 沿著邊、local Y 是「往上長」 */
        function side(px, pz, dirX, dirZ, width, color, outX, outZ) {
          const hinge = new THREE.Group();
          hinge.position.set(px, 0, pz);
          const X = new THREE.Vector3(dirX, 0, dirZ);
          const Y = new THREE.Vector3(0, 1, 0);
          const Z = new THREE.Vector3().crossVectors(X, Y);
          hinge.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
          const out = new THREE.Vector3(outX, 0, outZ);
          const sgn = Z.dot(out) >= 0 ? 1 : -1;
          const node = new THREE.Group();
          node.add(plate(width, h, color));
          hinge.add(node);
          root.add(hinge);
          faces.push({ node: node, aFlat: sgn * Math.PI / 2 });
          return node;
        }

        /* 底面是<b>置中</b>的：x 從 -hl 到 hl、z 從 -hw 到 hw。
           四個轉軸一定要落在這四條邊上，否則側面和頂面會整組偏移半個寬度，
           盒子看起來就像底面滑開了。（之前這裡誤用 0 與 w，也就是「底面
           從 z=0 到 z=w」那一套沒有置中的座標。） */
        const hl = l / 2, hw = w / 2;
        const f1 = side(-hl, hw, 1, 0, l, COL.lh, 0, 1);   // 前緣（z = +hw），往 +z 外
        side(hl, -hw, -1, 0, l, COL.lh, 0, -1);            // 後緣（z = -hw），往 -z 外
        side(-hl, -hw, 0, 1, w, COL.wh, -1, 0);            // 左緣（x = -hl），往 -x 外
        side(hl, hw, 0, -1, w, COL.wh, 1, 0);              // 右緣（x = +hl），往 +x 外

        // 頂面掛在「前」那一片的上緣
        const top = new THREE.Group();
        top.position.set(0, h, 0);
        f1.add(top);
        const topPlate = plate(l, w, COL.lw);
        top.add(topPlate);
        faces.push({ node: top, aFlat: 0, isTop: true });

        applyFold();
      }

      function applyFold() {
        faces.forEach(f => {
          if (f.isTop) f.node.rotation.x = -Math.PI / 2 * (1 - t);
          else f.node.rotation.x = f.aFlat * t;
        });
      }

      function paint() {
        const lw = L * W, lh = L * H, wh = W * H;
        const sa = 2 * (lw + lh + wh);
        readout.innerHTML =
          '<div class="big">表面積 ＝ 2 × (' + L + '×' + W + ' ＋ ' + L + '×' + H + ' ＋ ' + W + '×' + H + ') ＝ <b>' + sa + '</b> 平方公分</div>' +
          '六個面<b>兩兩一樣大</b>：<br>' +
          '<span style="color:#b3a2ff">上下（' + L + '×' + W + '＝' + lw + '）× 2 ＝ ' + 2 * lw + '</span>　' +
          '<span style="color:#4da3ff">前後（' + L + '×' + H + '＝' + lh + '）× 2 ＝ ' + 2 * lh + '</span>　' +
          '<span style="color:#34d399">左右（' + W + '×' + H + '＝' + wh + '）× 2 ＝ ' + 2 * wh + '</span><br>' +
          '加起來 ' + 2 * lw + ' ＋ ' + 2 * lh + ' ＋ ' + 2 * wh + ' ＝ <b>' + sa + '</b> 平方公分。<br>' +
          (L === W && W === H
            ? '<span style="color:var(--ok)">長寬高都一樣 → 正方體，六個面全等：' + L + '×' + L + '×6 ＝ ' + sa + '。</span>'
            : '') +
          '<br><span style="color:var(--muted)">對照一下：<b>體積</b> ＝ ' + L + '×' + W + '×' + H + ' ＝ <b>' + (L * W * H) +
          '</b> 立方公分。體積問「裡面塞得下幾顆」，表面積問「外面要貼幾張紙」，' +
          '單位一個是<b>立方</b>公分、一個是<b>平方</b>公分。<br>' +
          '課綱說明：<b>會算就好，不用背成公式</b>。</span>';
      }

      const lCtl = Kit.slider('長', { min: 1, max: 8, value: L, format: v => v + ' cm', onChange: v => { L = v; build(); paint(); } });
      const wCtl = Kit.slider('寬', { min: 1, max: 8, value: W, format: v => v + ' cm', onChange: v => { W = v; build(); paint(); } });
      const hCtl = Kit.slider('高', { min: 1, max: 8, value: H, format: v => v + ' cm', onChange: v => { H = v; build(); paint(); } });
      const tCtl = Kit.slider('展開程度', {
        min: 0, max: 100, value: 0, format: v => v + '%',
        onChange: v => { t = v / 100; applyFold(); }
      });
      const animBtn = Kit.button('立體 ⇄ 展開圖', function () {
        const from = t, to = t > .5 ? 0 : 1, t0 = performance.now();
        (function step(now) {
          const k = Math.min((now - t0) / 1000, 1);
          const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          t = from + (to - from) * e;
          tCtl.input.value = t * 100; tCtl.output.textContent = Math.round(t * 100) + '%';
          applyFold();
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      }, 'primary');

      [lCtl, wCtl, hCtl, tCtl].forEach(x => controls.appendChild(x.wrap));
      controls.appendChild(animBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '顏色相同的兩片就是<b>一樣大</b>的一對。展開後可以直接看出「為什麼是 2 ×（三種面積相加）」。'
      }));

      build();
      paint();
      return S.dispose;
    },

    parentGuide: [
      { ask: '「表面積是在算什麼？」', why: '外面要貼幾張紙、要漆多少油漆。先講用途，再講算法，孩子才不會和體積搞混。' },
      { ask: '按展開，問「有幾片？哪幾片一樣大？」', why: '6 片，兩兩一組共 3 組。顏色已經分好了。看得到「成對」，才會懂為什麼公式裡有個 ×2。' },
      { ask: '「體積和表面積，單位有什麼不一樣？」', why: '體積是<b>立方</b>公分，表面積是<b>平方</b>公分。貼紙是平的（兩個方向），塞方塊是立體的（三個方向）。' },
      { ask: '把長寬高都設成一樣，問「這時候怎麼算比較快？」', why: '正方體六面全等，邊長×邊長×6。這是特例，不是另一個公式。' },
      { ask: '「體積一樣的兩個盒子，表面積會一樣嗎？」', why: '不會。1×1×8 和 2×2×2 體積都是 8，表面積卻是 34 和 24。可以用滑桿試給他看——這也是為什麼包裝盒喜歡做成接近正方體（省材料）。' }
    ],

    pitfalls: [
      { bad: '把表面積和體積搞混。', fix: '先問自己這題是「<b>貼</b>紙」還是「<b>塞</b>方塊」。貼＝表面積（平方公分），塞＝體積（立方公分）。' },
      { bad: '只算 3 個面就交卷（忘了每種面有兩片）。', fix: '長方體有 <b>6</b> 個面。算完三種面積後<b>要乘 2</b>。展開圖數一次就記住了。' },
      { bad: '死背「表面積 ＝ 2(ab+bc+ca)」但算錯配對。', fix: '課綱說明<b>不要記成公式</b>。實際去想「上下是哪兩個邊相乘」比較不會錯。', src: 'S-5-5 備註「能算長方體的表面積，但不記成公式」' },
      { bad: '無蓋盒子（如魚缸）還是算 6 面。', fix: '沒有蓋子就只有 <b>5</b> 面。題目要看清楚有沒有蓋。' },
      { bad: '單位寫成立方公分。', fix: '表面積是面積，單位是<b>平方公分</b>。' }
    ],

    quiz: function () {
      // 題型依均一「五上第十單元 正方體和長方體」10-1～10-5：構成要素／面與面的平行垂直／
      // 展開圖／用三個不同面的面積求表面積／由表面積反推／邊長總和
      const type = Kit.pick(['sa', 'sa', 'cube', 'open', 'compare', 'elements', 'faces3', 'cubeFromSA', 'edgeSum', 'net', 'relation']);
      function shuffled(items) { const sh = Kit.shuffle(items); return { choices: sh.map(o => o.t), answer: sh.findIndex(o => o.ok) }; }

      if (type === 'elements') {
        const it = Kit.pick([
          { q: '一個長方體有幾個<b>面</b>？', a: 6, why: '上、下、前、後、左、右，共 <b>6</b> 個面，兩兩相對一樣大。' },
          { q: '一個長方體有幾條<b>邊</b>？', a: 12, why: '上面 4 條、下面 4 條、直立的 4 條，共 <b>12</b> 條邊。每 4 條一組一樣長，有 3 組（長、寬、高）。' },
          { q: '一個長方體有幾個<b>頂點</b>？', a: 8, why: '上面 4 個角、下面 4 個角，共 <b>8</b> 個頂點。' },
          { q: '一個正方體有幾條<b>一樣長</b>的邊？', a: 12, why: '正方體 12 條邊<b>全部</b>一樣長（長方體只有每 4 條一組一樣長）。' }
        ]);
        return { q: it.q, input: 'number', answer: it.a, unit: it.a === 12 ? '條' : '個', steps: it.why + '<br><span style="color:var(--muted)">拿一個盒子數一數，或看上面教具的展開圖。</span>' };
      }

      if (type === 'faces3') {
        // 原本的 a、b、c 在後面才宣告，這裡自己抽
        const x = Kit.randInt(2, 12), y = Kit.randInt(2, 12), z = Kit.randInt(2, 12);
        const A = x * y, B = x * z, C = y * z;
        return {
          q: '一個長方體，三個<b>不同的面</b>面積分別是 <b>' + A + '</b>、<b>' + B + '</b>、<b>' + C + '</b> 平方公分。表面積是多少平方公分？',
          input: 'number', answer: 2 * (A + B + C), unit: '平方公分',
          steps: '長方體的 6 個面<b>兩兩一樣大</b>，三個不同的面各有兩片：<br>' +
            '(' + A + ' ＋ ' + B + ' ＋ ' + C + ') × 2 ＝ ' + (A + B + C) + ' × 2 ＝ <b>' + 2 * (A + B + C) + '</b> 平方公分<br>' +
            '<span style="color:var(--muted)">不需要知道長寬高各是多少。</span>'
        };
      }

      if (type === 'cubeFromSA') {
        const s2 = Kit.randInt(2, 10), SA = 6 * s2 * s2;
        if (Math.random() < .5) {
          return {
            q: '一個正方體的表面積是 <b>' + SA + '</b> 平方公分。它<b>一個面</b>的面積是多少平方公分？',
            input: 'number', answer: s2 * s2, unit: '平方公分',
            steps: '正方體 6 個面一樣大 → 一面 ＝ 表面積 ÷ 6 ＝ ' + SA + ' ÷ 6 ＝ <b>' + s2 * s2 + '</b> 平方公分'
          };
        }
        return {
          q: '一個正方體的表面積是 <b>' + SA + '</b> 平方公分。它的<b>邊長</b>是幾公分？',
          input: 'number', answer: s2, unit: '公分',
          steps: '① 一面 ＝ ' + SA + ' ÷ 6 ＝ ' + s2 * s2 + ' 平方公分<br>' +
            '② 哪個數自己乘自己是 ' + s2 * s2 + '？ ' + s2 + ' × ' + s2 + ' ＝ ' + s2 * s2 + ' → 邊長 <b>' + s2 + '</b> 公分'
        };
      }

      if (type === 'edgeSum') {
        const a = Kit.randInt(2, 12), b = Kit.randInt(2, 12), c = Kit.randInt(2, 12);
        if (Math.random() < .5) {
          return {
            q: '一個長方體，長 <b>' + a + '</b>、寬 <b>' + b + '</b>、高 <b>' + c + '</b> 公分。用鐵絲做它的骨架（12 條邊），至少需要幾公分的鐵絲？',
            input: 'number', answer: 4 * (a + b + c), unit: '公分',
            steps: '長、寬、高各有 <b>4</b> 條：<br>(' + a + ' ＋ ' + b + ' ＋ ' + c + ') × 4 ＝ ' + (a + b + c) + ' × 4 ＝ <b>' + 4 * (a + b + c) + '</b> 公分<br>' +
              '<span style="color:var(--muted)">這是「邊長總和」，和表面積、體積是三件不同的事。</span>'
          };
        }
        const s3 = Kit.randInt(2, 12);
        return {
          q: '一個正方體的邊長 <b>' + s3 + '</b> 公分。12 條邊的長度總和是多少？',
          input: 'number', answer: 12 * s3, unit: '公分',
          steps: '12 條邊全部一樣長：' + s3 + ' × 12 ＝ <b>' + 12 * s3 + '</b> 公分'
        };
      }

      if (type === 'net') {
        const it = Kit.pick([
          { q: '正方體的展開圖是由幾個<b>正方形</b>組成的？', a: 6, why: '展開圖就是把 6 個面攤平，所以有 <b>6</b> 個一樣大的正方形。' },
          { q: '長方體的展開圖中，一樣大的面有幾<b>組</b>？', a: 3, why: '上下、前後、左右各一組，共 <b>3</b> 組，每組 2 個。' },
          { q: '把長方體展開圖<b>全部</b>面積加起來，等於這個長方體的什麼？', choices: ['表面積', '體積', '底面積', '邊長總和'], a: 0, why: '展開圖就是 6 個面攤開來，加總就是<b>表面積</b>。體積是裡面裝了多少，展開圖看不出來。' }
        ]);
        if (it.choices) {
          const o = shuffled(it.choices.map((t, i) => ({ t: t, ok: i === it.a })));
          return { q: it.q, choices: o.choices, answer: o.answer, steps: it.why };
        }
        return { q: it.q, input: 'number', answer: it.a, unit: it.a === 3 ? '組' : '個', steps: it.why };
      }

      if (type === 'relation') {
        // 面與面的平行、垂直
        const it2 = Kit.pick([
          { q: '長方體中，和<b>上面</b>平行的面是哪一個？', choices: ['下面', '前面', '左面', '沒有'], a: 0, why: '相對的兩個面互相<b>平行</b>：上↔下、前↔後、左↔右。所以和上面平行的是<b>下面</b>。' },
          { q: '長方體中，和<b>前面</b>垂直的面有幾個？', num: 4, why: '除了它自己和對面（後面）以外，其餘 <b>4</b> 個面（上、下、左、右）都和前面<b>垂直</b>。' },
          { q: '長方體中，和<b>底面</b>平行的面有幾個？', num: 1, why: '只有正對面的<b>上面</b>和底面平行，共 <b>1</b> 個。其他 4 個面都和底面垂直。' }
        ]);
        if (it2.choices) {
          const o = shuffled(it2.choices.map((t, i) => ({ t: t, ok: i === it2.a })));
          return { q: it2.q, choices: o.choices, answer: o.answer, steps: it2.why };
        }
        return { q: it2.q, input: 'number', answer: it2.num, unit: '個', steps: it2.why };
      }

      const a = Kit.randInt(2, 12), b = Kit.randInt(2, 12), c = Kit.randInt(2, 12);

      if (type === 'sa') {
        return {
          q: '一個長方體，長 <b>' + a + '</b>、寬 <b>' + b + '</b>、高 <b>' + c + '</b> 公分。<b>表面積</b>是多少平方公分？',
          input: 'number', answer: 2 * (a * b + a * c + b * c), unit: '平方公分',
          steps: '六個面兩兩一樣大：<br>' +
            '上下：' + a + '×' + b + ' ＝ ' + a * b + '，兩片 ' + 2 * a * b + '<br>' +
            '前後：' + a + '×' + c + ' ＝ ' + a * c + '，兩片 ' + 2 * a * c + '<br>' +
            '左右：' + b + '×' + c + ' ＝ ' + b * c + '，兩片 ' + 2 * b * c + '<br>' +
            '合計 <b>' + 2 * (a * b + a * c + b * c) + '</b> 平方公分'
        };
      }

      if (type === 'cube') {
        const s = Kit.randInt(2, 15);
        return {
          q: '一個<b>正方體</b>的邊長是 <b>' + s + '</b> 公分。表面積是多少平方公分？',
          input: 'number', answer: 6 * s * s, unit: '平方公分',
          steps: '正方體六個面<b>全部一樣大</b>，每面 ' + s + ' × ' + s + ' ＝ ' + s * s + ' 平方公分。<br>' +
            s * s + ' × 6 ＝ <b>' + 6 * s * s + '</b> 平方公分。'
        };
      }

      if (type === 'open') {
        return {
          q: '一個<b>沒有蓋子</b>的長方體盒子（像魚缸），長 <b>' + a + '</b>、寬 <b>' + b + '</b>、高 <b>' + c +
            '</b> 公分。要貼紙包住外面，需要多少平方公分的紙？',
          input: 'number', answer: a * b + 2 * a * c + 2 * b * c, unit: '平方公分',
          steps: '沒有蓋子 → 只有 <b>5</b> 個面：<br>' +
            '底面 1 片：' + a + '×' + b + ' ＝ ' + a * b + '<br>' +
            '前後 2 片：' + a + '×' + c + ' × 2 ＝ ' + 2 * a * c + '<br>' +
            '左右 2 片：' + b + '×' + c + ' × 2 ＝ ' + 2 * b * c + '<br>' +
            '合計 <b>' + (a * b + 2 * a * c + 2 * b * c) + '</b> 平方公分<br>' +
            '<span style="color:var(--muted)">⚠️ 六面全算會多算一個上蓋（' + a * b + ' 平方公分）。</span>'
        };
      }

      const opts = Kit.shuffle([
        { t: '2 × 2 × 2 的表面積比較小', ok: true },
        { t: '1 × 1 × 8 的表面積比較小', ok: false },
        { t: '兩個一樣大', ok: false },
        { t: '體積一樣就無法比較', ok: false }
      ]);
      return {
        q: '兩個長方體的<b>體積都是 8 立方公分</b>：一個是 1×1×8，一個是 2×2×2。哪一個<b>表面積比較小</b>？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '<b>1×1×8</b>：2×(1×1 ＋ 1×8 ＋ 1×8) ＝ 2×(1＋8＋8) ＝ <b>34</b> 平方公分<br>' +
          '<b>2×2×2</b>：每面 4，六面 ＝ <b>24</b> 平方公分<br>' +
          '體積一樣，但<b>越接近正方體，表面積越小</b>。<br>' +
          '<span style="color:var(--muted)">這就是為什麼包裝盒常做成接近正方體——同樣的容量，用的紙板最少。</span>'
      };
    }
  });

})();
