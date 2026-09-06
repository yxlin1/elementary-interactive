/* ============================================================
   教具 m5b-u1　體積
   南一 115：五下 第 5 單元「體積」；也是五上 第 10 單元「正方體和長方體」的教具之一
   課綱 N-5-14 / S-5-5
   教具：用 1 立方公分小方塊堆出長方體。可一層一層堆、可看透視、
         可切換到「1 立方公尺有多大」的實感比較。
   ============================================================ */

Kit.register('m5b-u1', {

  intro: '調長、寬、高，看小方塊怎麼堆成長方體。按「一層一層堆」就會看到為什麼體積是「長 × 寬 × 高」。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, { camera: [9, 8, 11], height: 430, gridSize: 24, gridDiv: 24 });
    S.fit(8);    // 8×8×8 堆疊與 1 立方公尺模式都在半徑 8 內

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let L = 4, W = 3, Hh = 3;
    let mode = 'solid';        // solid | layers | metre
    let layerShown = Hh;
    const root = new THREE.Group();
    S.scene.add(root);

    const COL_IN = 0x4da3ff;   // 內部
    const COL_TOP = 0x7c5cff;  // 最上層（堆疊動畫用）

    function clearRoot() {
      while (root.children.length) {
        const c = root.children.pop();
        c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        root.remove(c);
      }
    }

    function buildStack() {
      clearRoot();
      const size = 1, gap = 0.02;
      const ox = -(L - 1) / 2, oz = -(W - 1) / 2;
      for (let y = 0; y < Hh; y++) {
        if (mode === 'layers' && y >= layerShown) break;
        const isTop = (mode === 'layers' && y === layerShown - 1);
        for (let x = 0; x < L; x++) {
          for (let z = 0; z < W; z++) {
            const c = Kit.unitCube(size - gap, isTop ? COL_TOP : COL_IN, 1);
            c.position.set(ox + x, y + .5, oz + z);
            root.add(c);
          }
        }
      }
    }

    function buildMetre() {
      clearRoot();
      // 1 立方公尺（藍框）與 1 立方公分（黃點）的大小對比，比例縮成 1m = 6 單位
      const m = 6;
      const big = new THREE.Mesh(
        new THREE.BoxGeometry(m, m, m),
        new THREE.MeshLambertMaterial({ color: 0x4da3ff, transparent: true, opacity: .13 })
      );
      big.position.y = m / 2;
      root.add(big);
      // 注意：THREE 的 add() 回傳「父物件」，不能寫成 root.add(x).position.y = ...
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(m, m, m)),
        new THREE.LineBasicMaterial({ color: 0x4da3ff })
      );
      edges.position.y = m / 2;
      root.add(edges);

      const small = Kit.unitCube(m / 100, 0xfbbf24, 1);   // 1cm 相對 1m = 1/100
      small.position.set(-m / 2 + m / 200, m / 200, -m / 2 + m / 200);
      root.add(small);

      // 地面格線每 10 公分一條（不是每 1 公分，否則 100 條會糊成一片）
      const tickMat = new THREE.LineBasicMaterial({ color: 0x2f4468 });
      for (let i = 1; i < 10; i++) {
        const p = -m / 2 + i * m / 10;
        root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(
          [new THREE.Vector3(p, 0.01, -m / 2), new THREE.Vector3(p, 0.01, m / 2)]), tickMat));
        root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(
          [new THREE.Vector3(-m / 2, 0.01, p), new THREE.Vector3(m / 2, 0.01, p)]), tickMat));
      }
    }

    function rebuild() {
      if (mode === 'metre') buildMetre(); else buildStack();
      paint();
    }

    function paint() {
      if (mode === 'metre') {
        readout.innerHTML =
          '<div class="big">1 立方公尺 到底有多大？</div>' +
          '藍色大方塊是邊長 <b>1 公尺</b> 的正方體，左下角那顆黃色小點是邊長 <b>1 公分</b> 的正方體。<br>' +
          '一層可以排 100 × 100 = <b>10000</b> 個，總共可以疊 100 層 →　1 立方公尺 = <b>1000000</b> 立方公分。<br>' +
          '<span style="color:var(--muted)">（地面格線是<b>每 10 公分</b>一條，不是每 1 公分——畫 100 條會糊成一片。）</span><br>' +
          '<span style="color:var(--muted)">課綱提醒：這個換算很龐雜，<b>不需要背、不會考</b>，重點是「感覺得出來 1 立方公尺很大」。' +
          '生活比喻：大約是一台洗衣機再大一點，或一個人蹲進去還有空間。</span>';
        return;
      }
      const v = L * W * Hh;
      const sa = 2 * (L * W + L * Hh + W * Hh);
      const per = L * W;
      readout.innerHTML =
        '<div class="big">體積 = 長 × 寬 × 高 = ' + L + ' × ' + W + ' × ' + Hh + ' = <b>' + v + '</b> 立方公分</div>' +
        '換個方式看：一層有 ' + L + ' × ' + W + ' = <b>' + per + '</b> 個小方塊，疊了 <b>' + Hh + '</b> 層，' +
        per + ' × ' + Hh + ' = <b>' + v + '</b> 個。<br>' +
        '表面積 = 2 ×（' + L + '×' + W + ' ＋ ' + L + '×' + Hh + ' ＋ ' + W + '×' + Hh + '）= <b>' + sa + '</b> 平方公分' +
        (L === W && W === Hh ? '　<span style="color:var(--ok)">（長寬高都一樣 → 這是正方體）</span>' : '') +
        (mode === 'layers' ? '<br><span style="color:var(--muted)">目前堆到第 <b>' + layerShown + '</b> 層，已放 ' + (per * layerShown) + ' 個。</span>' : '');
    }

    const sL = Kit.slider('長', { min: 1, max: 8, value: L, format: v => v + ' 公分', onChange: v => { L = v; rebuild(); } });
    const sW = Kit.slider('寬', { min: 1, max: 8, value: W, format: v => v + ' 公分', onChange: v => { W = v; rebuild(); } });
    const sH = Kit.slider('高', { min: 1, max: 8, value: Hh, format: v => v + ' 公分', onChange: v => { Hh = v; layerShown = v; rebuild(); } });

    const modeSeg = Kit.segmented('模式', [
      { label: '整個長方體', value: 'solid' },
      { label: '一層一層堆', value: 'layers' },
      { label: '1 立方公尺有多大', value: 'metre' }
    ], function (v) {
      mode = v;
      const hide = (v === 'metre');
      [sL, sW, sH].forEach(s => s.wrap.style.display = hide ? 'none' : '');
      stackBtn.style.display = (v === 'layers') ? '' : 'none';
      if (v === 'layers') layerShown = 0;
      rebuild();
      if (v === 'layers') animateStack();
    }, mode);

    let animating = false;
    function animateStack() {
      if (animating) return;
      animating = true;
      layerShown = 0;
      (function step() {
        layerShown++;
        buildStack(); paint();
        if (layerShown < Hh) setTimeout(step, 520);
        else animating = false;
      })();
    }
    const stackBtn = Kit.button('重播堆疊', animateStack, 'primary');
    stackBtn.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(sL.wrap);
    controls.appendChild(sW.wrap);
    controls.appendChild(sH.wrap);
    controls.appendChild(stackBtn);

    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '每一顆小方塊 = <b>1 立方公分</b>。課綱要求體積的認識「基於 1 立方公分之正方體」，所以請讓孩子先用「數幾顆」的方式算，再接受公式。'
    }));

    rebuild();
    return S.dispose;
  },

  parentGuide: [
    { ask: '「一層有幾顆？」→「疊了幾層？」→「所以總共幾顆？」', why: '這三句話就是體積公式的來源。孩子自己說出「一層 12 顆、疊 3 層、所以 36 顆」，比背「長×寬×高」有用十倍。' },
    { ask: '「把長改成 6，體積變多少倍？為什麼不是變 6 倍？」', why: '長從 4 變 6 是 1.5 倍，體積也是 1.5 倍。很多孩子會以為「改一個數字＝整個變那麼多倍」。' },
    { ask: '「長 2 寬 6 高 3，和長 6 寬 2 高 3，體積一樣嗎？」', why: '一樣。這連到五上剛學的「三數相乘，順序改變不影響其積」。可以順便問形狀一不一樣（不一樣，但體積一樣）。' },
    { ask: '「體積一樣，表面積會不會也一樣？」', why: '不會。用滑桿試 1×1×8 和 2×2×2（體積都是 8），表面積分別是 34 和 24。這是很好的思考題，不用要求算出來，看畫面比較就好。' },
    { ask: '切到「1 立方公尺有多大」，問「你覺得我們家客廳大概幾立方公尺？」', why: '課綱要的是<b>量感</b>不是換算。1000000 這個數字不用背，「1 立方公尺大概是一台洗衣機」才要記住。' }
  ],

  pitfalls: [
    { bad: '把體積和表面積搞混，算體積卻去加各面的面積。', fix: '體積問的是「裡面塞得下幾顆小方塊」，表面積問的是「外面要貼幾張紙」。先問孩子這一題是「塞」還是「貼」。', src: 'S-5-5「計算正方體和長方體的體積與表面積」' },
    { bad: '單位寫錯：體積寫成「平方公分」。', fix: '長度＝公分、面積＝平方公分、體積＝立方公分。三個一組一起念一次。' },
    { bad: '硬背「1 立方公尺 = 1000000 立方公分」但完全沒有量感。', fix: '課綱明講這個換算<b>不須評量</b>。重點是體會 1 立方公尺有多大，不是背零的個數。', src: 'N-5-14「1 立方公尺與 1 立方公分的換算較龐雜，不須評量」' },
    { bad: '用複名數計算（例如「2 公尺 30 公分」直接乘）。', fix: '課綱規定這一階段<b>不用複名數計算</b>。先統一成同一個單位再算。', src: 'N-5-14「不用複名數進行計算」' }
  ],

  quiz: function () {
    // 題型依均一「五下第五單元 體積」小節：體積公式／正方體／底面積×高／
    // 立方公尺與換算／邊長有兩種單位／複合形體
    const type = Kit.pick(['v', 'v', 'missing', 'surface', 'cube', 'unit', 'mixedunit', 'composite', 'composite', 'baseArea', 'unitConcept']);
    // 千分位逗號，讓 1000000 讀得出來
    const sep = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (type === 'cube') {
      const s = Kit.randInt(2, 12);
      return {
        q: '一個<b>正方體</b>的邊長是 <b>' + s + '</b> 公分。體積是多少立方公分？',
        input: 'number', answer: s * s * s, unit: '立方公分',
        steps: '正方體的長、寬、高都一樣長：' + s + ' × ' + s + ' × ' + s + '<br>' +
          '一層 ' + s + ' × ' + s + ' ＝ ' + s * s + ' 個，疊 ' + s + ' 層 → ' + s * s + ' × ' + s + ' ＝ <b>' + s * s * s + '</b> 立方公分'
      };
    }

    if (type === 'unit') {
      const toSmall = Math.random() < .5;
      const n = Kit.pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
      const cm3 = Math.round(n * 1000000);
      return toSmall ? {
        q: '<b>' + n + ' 立方公尺</b>等於多少立方公分？',
        input: 'number', answer: cm3, unit: '立方公分',
        steps: '1 公尺 ＝ 100 公分，所以 1 立方公尺 ＝ 100 × 100 × 100 ＝ <b>1,000,000</b> 立方公分（一百萬）。<br>' +
          n + ' × 1,000,000 ＝ <b>' + sep(cm3) + '</b> 立方公分<br>' +
          '<span style="color:var(--muted)">⚠️ 不是 100 倍也不是 10,000 倍——長、寬、高三個方向都要 ×100。</span>'
      } : {
        q: '<b>' + sep(cm3) + ' 立方公分</b>等於多少立方公尺？',
        input: 'number', answer: n, tolerance: 1e-9, unit: '立方公尺',
        steps: '1 立方公尺 ＝ 1,000,000 立方公分。<br>' +
          sep(cm3) + ' ÷ 1,000,000 ＝ <b>' + n + '</b> 立方公尺（小數點向左移 6 位）'
      };
    }

    if (type === 'mixedunit') {
      const m = Kit.randInt(1, 3), w = Kit.randInt(1, 9) * 10, h = Kit.randInt(1, 9) * 10;
      const ans = m * 100 * w * h;
      return {
        q: '一個長方體木箱，長 <b>' + m + ' 公尺</b>、寬 <b>' + w + ' 公分</b>、高 <b>' + h + ' 公分</b>。體積是多少<b>立方公分</b>？',
        input: 'number', answer: ans, unit: '立方公分',
        steps: '單位不一樣<b>不能直接乘</b>，先把公尺換成公分：' + m + ' 公尺 ＝ <b>' + m * 100 + '</b> 公分<br>' +
          m * 100 + ' × ' + w + ' × ' + h + ' ＝ <b>' + sep(ans) + '</b> 立方公分'
      };
    }

    if (type === 'composite') {
      const big = Kit.randInt(6, 12), bw = Kit.randInt(4, 9), bh = Kit.randInt(2, 5);
      if (Math.random() < .5) {
        // L 形：下層 + 上層
        const tl = Kit.randInt(2, big - 2), tw = bw, th = Kit.randInt(2, 5);
        const v1 = big * bw * bh, v2 = tl * tw * th;
        return {
          q: '一個 L 形積木由兩個長方體疊成：下層長 <b>' + big + '</b>、寬 <b>' + bw + '</b>、高 <b>' + bh + '</b> 公分；' +
            '上層長 <b>' + tl + '</b>、寬 <b>' + tw + '</b>、高 <b>' + th + '</b> 公分，疊在下層上面。整塊積木的體積是多少立方公分？',
          input: 'number', answer: v1 + v2, unit: '立方公分',
          steps: '複合形體：<b>切成兩塊分別算，再加起來</b>。<br>' +
            '下層 ' + big + ' × ' + bw + ' × ' + bh + ' ＝ ' + v1 + '<br>' +
            '上層 ' + tl + ' × ' + tw + ' × ' + th + ' ＝ ' + v2 + '<br>' +
            v1 + ' ＋ ' + v2 + ' ＝ <b>' + (v1 + v2) + '</b> 立方公分'
        };
      }
      // 挖洞：大的減小的
      const hl = Kit.randInt(1, big - 2), hw = Kit.randInt(1, bw - 2), hh = bh;
      const v1 = big * bw * bh, v2 = hl * hw * hh;
      return {
        q: '一塊長 <b>' + big + '</b>、寬 <b>' + bw + '</b>、高 <b>' + bh + '</b> 公分的長方體木塊，從上面挖穿一個長 <b>' + hl + '</b>、寬 <b>' + hw +
          '</b> 公分的長方形洞（洞的高和木塊一樣是 ' + hh + ' 公分）。剩下的木塊體積是多少立方公分？',
        input: 'number', answer: v1 - v2, unit: '立方公分',
        steps: '挖掉的形狀也是長方體 → <b>大的減小的</b>。<br>' +
          '原本 ' + big + ' × ' + bw + ' × ' + bh + ' ＝ ' + v1 + '<br>' +
          '挖掉 ' + hl + ' × ' + hw + ' × ' + hh + ' ＝ ' + v2 + '<br>' +
          v1 + ' － ' + v2 + ' ＝ <b>' + (v1 - v2) + '</b> 立方公分'
      };
    }

    if (type === 'baseArea') {
      // 注意：原本的 a、b、c 在後面才宣告，這裡自己抽
      const A = Kit.randInt(2, 9) * Kit.randInt(2, 9), h = Kit.randInt(2, 9);
      if (Math.random() < .5) {
        return {
          q: '一個長方體的<b>底面積</b>是 <b>' + A + '</b> 平方公分，高 <b>' + h + '</b> 公分。體積是多少立方公分？',
          input: 'number', answer: A * h, unit: '立方公分',
          steps: '長 × 寬 就是底面積，所以體積 ＝ <b>底面積 × 高</b>。<br>' + A + ' × ' + h + ' ＝ <b>' + A * h + '</b> 立方公分<br>' +
            '（想成：底面那一層有 ' + A + ' 個小方塊，疊了 ' + h + ' 層。）'
        };
      }
      return {
        q: '一個長方體的體積是 <b>' + A * h + '</b> 立方公分，<b>底面積</b>是 <b>' + A + '</b> 平方公分。高是幾公分？',
        input: 'number', answer: h, unit: '公分',
        steps: '體積 ＝ 底面積 × 高，反過來 <b>高 ＝ 體積 ÷ 底面積</b>。<br>' + A * h + ' ÷ ' + A + ' ＝ <b>' + h + '</b> 公分'
      };
    }

    if (type === 'unitConcept') {
      const which = Kit.pick(['m3', 'which']);
      if (which === 'm3') {
        const o = Kit.shuffle([
          { t: '1,000,000 立方公分', ok: true }, { t: '100 立方公分', ok: false },
          { t: '10,000 立方公分', ok: false }, { t: '1,000 立方公分', ok: false }
        ]);
        return {
          q: '<b>1 立方公尺</b>是多少立方公分？',
          choices: o.map(x => x.t), answer: o.findIndex(x => x.ok),
          steps: '1 立方公尺是邊長 1 公尺（＝100 公分）的正方體。<br>100 × 100 × 100 ＝ <b>1,000,000</b> 立方公分。<br>' +
            '<span style="color:var(--muted)">長度差 100 倍，面積差 100×100 倍，體積差 100×100×100 倍。</span>'
        };
      }
      const o = Kit.shuffle([
        { t: '教室裡的大冰箱', ok: true }, { t: '一個牛奶盒', ok: false },
        { t: '一顆骰子', ok: false }, { t: '一本課本', ok: false }
      ]);
      return {
        q: '下面哪一個東西的體積<b>最接近 1 立方公尺</b>？',
        choices: o.map(x => x.t), answer: o.findIndex(x => x.ok),
        steps: '1 立方公尺 ＝ 邊長 1 公尺的正方體，大約是一台大冰箱、或一張學生課桌底下的空間。<br>' +
          '牛奶盒約 1000 立方公分（1 公升）、骰子約 1～8 立方公分、課本約 500 立方公分——都差非常多。'
      };
    }

    const a = Kit.randInt(2, 9), b = Kit.randInt(2, 9), c = Kit.randInt(2, 9);

    if (type === 'v') {
      return {
        q: '一個長方體，長 <b>' + a + '</b> 公分、寬 <b>' + b + '</b> 公分、高 <b>' + c + '</b> 公分。它的體積是多少立方公分？',
        input: 'number', answer: a * b * c, unit: '立方公分',
        steps: '一層有 ' + a + ' × ' + b + ' = <b>' + a * b + '</b> 個 1 立方公分的小方塊，疊了 ' + c + ' 層。<br>' +
          a * b + ' × ' + c + ' = <b>' + a * b * c + '</b>（立方公分）'
      };
    }

    if (type === 'missing') {
      const v = a * b * c;
      return {
        q: '一個長方體的體積是 <b>' + v + '</b> 立方公分，長 <b>' + a + '</b> 公分、寬 <b>' + b + '</b> 公分。高是幾公分？',
        input: 'number', answer: c, unit: '公分',
        steps: '一層有 ' + a + ' × ' + b + ' = <b>' + a * b + '</b> 個。<br>' +
          '總共 ' + v + ' 個，所以層數 = ' + v + ' ÷ ' + a * b + ' = <b>' + c + '</b>（公分）'
      };
    }

    const sa = 2 * (a * b + a * c + b * c);
    return {
      q: '一個長方體，長 <b>' + a + '</b>、寬 <b>' + b + '</b>、高 <b>' + c + '</b> 公分。它的<b>表面積</b>是多少平方公分？',
      input: 'number', answer: sa, unit: '平方公分',
      steps: '長方體有 6 個面，兩兩一樣大：<br>' +
        '上下：' + a + '×' + b + ' = ' + a * b + '，兩片 ' + 2 * a * b + '<br>' +
        '前後：' + a + '×' + c + ' = ' + a * c + '，兩片 ' + 2 * a * c + '<br>' +
        '左右：' + b + '×' + c + ' = ' + b * c + '，兩片 ' + 2 * b * c + '<br>' +
        '合計 <b>' + sa + '</b> 平方公分。（課綱：會算就好，<b>不用背成公式</b>。）'
    };
  }
});
