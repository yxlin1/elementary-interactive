/* ============================================================
   五上 數學（康軒）第 10 單元　柱體、錐體和球
   課綱 S-5-7 / S-5-6
   教具：立體 → 展開圖 連續動畫。可拖曳旋轉、可暫停在任何展開角度。
   ============================================================ */

Kit.register('m5a-u10', {

  intro: '拖曳「展開程度」，看柱體和錐體怎麼變成展開圖。用滑鼠拖曳畫面可以轉動立體，滾輪縮放。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, { camera: [8, 7, 10], height: 430, gridSize: 24, gridDiv: 24 });
    S.fit(8);    // 六角柱完全展開後大約撐到半徑 8，宣告後窄螢幕也不會被切掉

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* ---- 立體型錄 ---- */
    const SHAPES = {
      p3:  { kind: 'prism',   n: 3,  name: '三角柱' },
      p4:  { kind: 'prism',   n: 4,  name: '四角柱' },
      p5:  { kind: 'prism',   n: 5,  name: '五角柱' },
      p6:  { kind: 'prism',   n: 6,  name: '六角柱' },
      cyl: { kind: 'prism',   n: 56, name: '圓柱' },
      y3:  { kind: 'pyramid', n: 3,  name: '三角錐' },
      y4:  { kind: 'pyramid', n: 4,  name: '四角錐' },
      y5:  { kind: 'pyramid', n: 5,  name: '五角錐' },
      y6:  { kind: 'pyramid', n: 6,  name: '六角錐' },
      con: { kind: 'pyramid', n: 56, name: '圓錐' },
      sph: { kind: 'sphere',  n: 0,  name: '球' }
    };

    let key = 'p5', t = 0, cut = 0.5;   // cut 要和下方「切一刀的高度」滑桿的預設 50% 一致
    let group = null;
    const faceNodes = [];   // {node, aReal, aFlat}
    let topNode = null, topSign = 1;
    let sphereParts = null;

    const R = 2.2, H = 3.2;
    const matSide  = new THREE.MeshLambertMaterial({ color: 0x4da3ff, side: THREE.DoubleSide, transparent: true, opacity: .82 });
    const matBase  = new THREE.MeshLambertMaterial({ color: 0x7c5cff, side: THREE.DoubleSide, transparent: true, opacity: .9 });
    const matEdge  = new THREE.LineBasicMaterial({ color: 0x0b1220 });

    function polyVerts(n) {
      const v = [];
      // 讓多邊形有一條邊朝向鏡頭前方，展開時看得清楚
      const off = Math.PI / n + Math.PI / 2;
      for (let i = 0; i < n; i++) {
        const a = off + i * 2 * Math.PI / n;
        v.push(new THREE.Vector3(R * Math.cos(a), 0, R * Math.sin(a)));
      }
      return v;
    }

    /* 由 2D 頂點陣列做出一片多邊形（在 local XY 平面） */
    function flatPolygon(pts2, mat) {
      const shape = new THREE.Shape();
      shape.moveTo(pts2[0][0], pts2[0][1]);
      for (let i = 1; i < pts2.length; i++) shape.lineTo(pts2[i][0], pts2[i][1]);
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, mat));
      g.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts2.map(p => new THREE.Vector3(p[0], p[1], 0))),
        matEdge
      ));
      return g;
    }

    function clearShape() {
      if (group) { S.scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
      group = new THREE.Group();
      S.scene.add(group);
      faceNodes.length = 0;
      topNode = null;
      sphereParts = null;
    }

    function buildShape() {
      clearShape();
      const spec = SHAPES[key];

      if (spec.kind === 'sphere') {
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(R, 40, 28),
          new THREE.MeshLambertMaterial({ color: 0x4da3ff, transparent: true, opacity: .35 })
        );
        ball.position.y = R;
        group.add(ball);
        // 注意：THREE 的 add() 回傳「父物件」，不能寫成 group.add(x).position.y = R
        const wire = new THREE.LineSegments(
          new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 16, 10)),
          new THREE.LineBasicMaterial({ color: 0x2f4468 })
        );
        wire.position.y = R;
        group.add(wire);

        // 球心 + 半徑
        const core = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
        core.position.y = R;
        group.add(core);
        const radLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, R, 0), new THREE.Vector3(R, R, 0)]),
          new THREE.LineBasicMaterial({ color: 0xfbbf24 })
        );
        group.add(radLine);

        // 截面（截痕是圓）
        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(1, 48),
          new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: .45, side: THREE.DoubleSide })
        );
        disc.rotation.x = -Math.PI / 2;
        group.add(disc);
        const ring = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(
            Array.from({ length: 49 }, (_, i) => {
              const a = i / 48 * Math.PI * 2;
              return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
            })),
          new THREE.LineBasicMaterial({ color: 0x34d399 })
        );
        group.add(ring);
        sphereParts = { disc: disc, ring: ring };
        applyCut();
        return;
      }

      const n = spec.n;
      const V = polyVerts(n);
      const center = new THREE.Vector3(0, 0, 0);
      const apex = new THREE.Vector3(0, H, 0);

      // 底面（永遠貼在地上）
      group.add((function () {
        const g = flatPolygon(V.map(v => [v.x, v.z]), matBase);
        g.rotation.x = Math.PI / 2;   // 從 XY 平面轉到 XZ 平面
        return g;
      })());

      for (let i = 0; i < n; i++) {
        const A = V[i], B = V[(i + 1) % n];
        const X = new THREE.Vector3().subVectors(B, A).normalize();
        const Y = new THREE.Vector3(0, 1, 0);
        const Z = new THREE.Vector3().crossVectors(X, Y);
        const L = A.distanceTo(B);

        // 判斷 Z 軸朝內或朝外
        const mid = new THREE.Vector3().addVectors(A, B).multiplyScalar(.5);
        const outward = new THREE.Vector3().subVectors(mid, center).setY(0).normalize();
        const sgn = Z.dot(outward) >= 0 ? 1 : -1;

        const basis = new THREE.Matrix4().makeBasis(X, Y, Z);
        const hinge = new THREE.Group();
        hinge.position.copy(A);
        hinge.quaternion.setFromRotationMatrix(basis);
        group.add(hinge);

        const face = new THREE.Group();
        hinge.add(face);

        let aReal;
        if (spec.kind === 'prism') {
          face.add(flatPolygon([[0, 0], [L, 0], [L, H], [0, H]], matSide));
          aReal = 0;
        } else {
          const w = new THREE.Vector3().subVectors(apex, A);
          const ax = w.dot(X);
          const az = w.dot(Z);
          const ha = Math.sqrt(H * H + az * az);      // 側面三角形在自己平面上的高
          face.add(flatPolygon([[0, 0], [L, 0], [ax, ha]], matSide));
          aReal = Math.atan2(az, H);                   // 側面與鉛直面的夾角（往內傾）
        }
        faceNodes.push({ node: face, aReal: aReal, aFlat: sgn * Math.PI / 2 });

        // 柱體：上底面掛在第 0 片側面的上緣
        if (spec.kind === 'prism' && i === 0) {
          topSign = sgn;
          const T = new THREE.Group();
          T.position.set(0, H, 0);
          face.add(T);
          const pts = V.map(v => {
            const w = new THREE.Vector3().subVectors(v, A);
            return [w.dot(X), -w.dot(Z) * sgn];
          });
          T.add(flatPolygon(pts, matBase));
          topNode = T;
        }
      }
      applyFold();
    }

    function applyFold() {
      faceNodes.forEach(f => { f.node.rotation.x = f.aReal + (f.aFlat - f.aReal) * t; });
      if (topNode) topNode.rotation.x = -topSign * (Math.PI / 2) * (1 - t);
    }

    function applyCut() {
      if (!sphereParts) return;
      const y = cut * 2 * R;                       // 0 ~ 2R
      const d = Math.abs(y - R);
      const r = Math.sqrt(Math.max(R * R - d * d, 0.0001));
      sphereParts.disc.position.y = y;
      sphereParts.disc.scale.set(r, r, 1);
      sphereParts.ring.position.y = y;
      sphereParts.ring.scale.set(r, 1, r);
    }

    function paint() {
      const s = SHAPES[key];
      if (s.kind === 'sphere') {
        const y = cut * 2 * R, d = Math.abs(y - R);
        const r = Math.sqrt(Math.max(R * R - d * d, 0));
        readout.innerHTML =
          '<div class="big"><b>球</b>　沒有頂點、沒有邊、只有一個曲面</div>' +
          '黃點是<b>球心</b>，黃線是<b>半徑</b>。<br>' +
          '不管從哪個方向切，<b>截痕都是圓</b>。目前這一刀切出來的圓半徑約 <b>' + r.toFixed(2) + '</b>（球半徑 ' + R.toFixed(1) + '）。<br>' +
          '<span style="color:var(--muted)">切在正中間時圓最大，越靠近上下越小。球不能展開成平面，所以沒有展開圖。</span>';
        return;
      }
      const n = s.n, isPrism = s.kind === 'prism';
      const round = n > 20;
      const F = isPrism ? n + 2 : n + 1;
      const E = isPrism ? 3 * n : 2 * n;
      const Vt = isPrism ? 2 * n : n + 1;

      readout.innerHTML =
        '<div class="big">目前：<b>' + s.name + '</b></div>' +
        (round
          ? (isPrism
            ? '圓柱的側面展開後是一個<b>長方形</b>，長就是底面圓的<b>圓周長</b>；上下兩個底面是<b>圓</b>，而且互相<b>平行</b>。'
            : '圓錐的側面展開後是一個<b>扇形</b>，底面是一個<b>圓</b>。')
          : '面：<b>' + F + '</b> 個　邊：<b>' + E + '</b> 條　頂點：<b>' + Vt + '</b> 個') +
        '<br>' +
        (isPrism
          ? '✅ 兩個底面<b>平行</b>　✅ 側面和底面<b>垂直</b>'
          : '✅ 只有一個底面　❌ 側面和底面<b>不垂直</b>（這是錐體和柱體最大的差別）') +
        '<br><span style="color:var(--muted)">展開程度：' + Math.round(t * 100) + '%</span>';
    }

    /* ---- 控制項 ---- */
    const shapeSeg = Kit.segmented('選立體', Object.keys(SHAPES).map(k => ({ label: SHAPES[k].name, value: k })),
      function (v) {
        key = v;
        const isSphere = SHAPES[v].kind === 'sphere';
        foldCtl.wrap.style.display = isSphere ? 'none' : '';
        cutCtl.wrap.style.display = isSphere ? '' : 'none';
        buildShape(); paint();
      }, key);

    const foldCtl = Kit.slider('展開程度', {
      min: 0, max: 100, value: 0, format: v => v + '%',
      onChange: v => { t = v / 100; applyFold(); paint(); }
    });

    const cutCtl = Kit.slider('切一刀的高度', {
      min: 2, max: 98, value: 50, format: v => v + '%',
      onChange: v => { cut = v / 100; applyCut(); paint(); }
    });
    cutCtl.wrap.style.display = 'none';

    controls.appendChild(shapeSeg.wrap);
    controls.appendChild(foldCtl.wrap);
    controls.appendChild(cutCtl.wrap);
    controls.appendChild(Kit.button('立體 ⇄ 展開圖', function () {
      const target = t > .5 ? 0 : 100;
      const from = t * 100;
      const t0 = performance.now();
      (function step(now) {
        const k = Math.min((now - t0) / 900, 1);
        const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const v = from + (target - from) * e;
        foldCtl.input.value = v;
        foldCtl.output.textContent = Math.round(v) + '%';
        t = v / 100; applyFold(); paint();
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, 'primary'));

    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '課綱要求「檢查柱體兩底面平行；檢查柱體側面和底面垂直，錐體側面和底面不垂直」。' +
        '把「五角柱」和「五角錐」各轉一圈比較看看，孩子會自己講出差別。'
    }));

    buildShape();
    paint();
    return S.dispose;
  },

  parentGuide: [
    { ask: '「這個立體有幾個面？你數數看。」', why: '先讓孩子用「數」的，不要直接給公式。數完再問「那六角柱呢？不用數，用猜的」——這一步就是從具體到規律。' },
    { ask: '「把它展開，哪幾片是一樣大的？」', why: '柱體的側面全等、上下底面全等；錐體的側面是三角形。看得到「一樣大」，之後算表面積才不會亂乘。' },
    { ask: '「側面跟底面是不是直角？用手比比看。」', why: '課綱明講不要用三角板去量（學生容易誤用），改成用眼睛觀察＋轉動立體確認。柱體直、錐體斜，是這一單元的核心判準。' },
    { ask: '「圓柱展開後那個長方形的長，是哪裡的長度？」', why: '答案是底面圓的圓周長。這題答得出來，代表孩子真的懂展開圖不是「拆開來擺一擺」而已。' },
    { ask: '「球可以展開嗎？為什麼？」', why: '不能。順便可以問「球切一刀，切面是什麼形狀？」——永遠是圓。用畫面上的切面滑桿驗證。' }
  ],

  pitfalls: [
    { bad: '把「角柱」的名字數錯：看到五角柱說它是「七面體所以是七角柱」。', fix: '角柱的名字看<b>底面</b>是幾邊形，不是看幾個面。五角柱 = 底面五邊形，總共 7 個面。', src: 'S-5-7「角柱只介紹三角柱、四角柱、五角柱、六角柱」' },
    { bad: '以為錐體的側面也和底面垂直。', fix: '轉動畫面從側邊看：錐體的側面是斜的，只有柱體才垂直。這是課綱指定要檢查的性質。', src: 'S-5-7「檢查柱體側面和底面垂直，錐體側面和底面不垂直」' },
    { bad: '看到展開圖就以為「只要面數對就能摺回去」。', fix: '面數對還不夠，位置也要對。可以問：「如果把這片移到另一邊，還摺得回來嗎？」' },
    { bad: '把圓柱的展開圖畫成「長方形＋兩個圓隨便放」，長方形的長亂畫。', fix: '長方形的長必須等於底面圓的圓周長，否則捲起來會對不齊。', src: 'S-5-7「認識柱體和錐體之構成要素與展開圖」' }
  ],

  quiz: function () {
    const type = Kit.pick(['count', 'flat', 'perp']);
    const n = Kit.randInt(3, 6);
    const cn = ['', '', '', '三', '四', '五', '六'][n];

    if (type === 'count') {
      const isPrism = Math.random() < .5;
      const name = cn + (isPrism ? '角柱' : '角錐');
      const ask = Kit.pick(['面', '邊', '頂點']);
      const ans = ask === '面' ? (isPrism ? n + 2 : n + 1)
        : ask === '邊' ? (isPrism ? 3 * n : 2 * n)
          : (isPrism ? 2 * n : n + 1);
      return {
        q: '一個 <b>' + name + '</b> 有幾個「' + ask + '」？',
        input: 'number', answer: ans, unit: '個',
        steps: isPrism
          ? '角柱：面 = 底面2 + 側面' + n + ' = <b>' + (n + 2) + '</b>；邊 = 上底' + n + ' + 下底' + n + ' + 直立' + n + ' = <b>' + 3 * n + '</b>；頂點 = 上' + n + ' + 下' + n + ' = <b>' + 2 * n + '</b>。'
          : '角錐：面 = 底面1 + 側面' + n + ' = <b>' + (n + 1) + '</b>；邊 = 底面' + n + ' + 連到頂點' + n + ' = <b>' + 2 * n + '</b>；頂點 = 底面' + n + ' + 尖端1 = <b>' + (n + 1) + '</b>。'
      };
    }

    if (type === 'flat') {
      const opts = Kit.shuffle([
        { t: '一個長方形，加上兩個一樣大的圓', ok: true },
        { t: '一個扇形，加上一個圓', ok: false },
        { t: '兩個長方形，加上一個圓', ok: false },
        { t: '一個三角形，加上一個圓', ok: false }
      ]);
      return {
        q: '<b>圓柱</b>的展開圖長什麼樣子？',
        choices: opts.map(o => o.t),
        answer: opts.findIndex(o => o.ok),
        steps: '圓柱＝上下兩個一樣大的圓（底面）＋ 側面捲開後的一個長方形。這個長方形的<b>長</b>剛好等於底面圓的<b>圓周長</b>。（「一個扇形＋一個圓」是<b>圓錐</b>的展開圖。）'
      };
    }

    const isPrism = Math.random() < .5;
    const name = cn + (isPrism ? '角柱' : '角錐');
    const opts = Kit.shuffle([
      { t: '有兩個平行的底面，側面和底面垂直', v: 'prism' },
      { t: '只有一個底面，側面和底面不垂直', v: 'pyramid' },
      { t: '沒有底面，整個是曲面', v: 'sphere' },
      { t: '有兩個底面，但側面和底面不垂直', v: 'none' }
    ]);
    const want = isPrism ? 'prism' : 'pyramid';
    return {
      q: '關於 <b>' + name + '</b>，下面哪一個描述是對的？',
      choices: opts.map(o => o.t),
      answer: opts.findIndex(o => o.v === want),
      steps: isPrism
        ? '<b>柱</b>體：上下兩個底面一樣大而且<b>平行</b>，側面站得直直的，和底面<b>垂直</b>。'
        : '<b>錐</b>體：只有一個底面，上面收成一個尖點，側面是斜的，和底面<b>不垂直</b>。'
    };
  }
});
