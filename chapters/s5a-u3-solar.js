/* ============================================================
   五上 自然（康軒）第 3 單元　神祕的天空　活動二　太陽系有哪些成員
   依 115 學年度課程計畫的學習目標：
     1. 太陽是自己會發出光和熱的恆星
     2. 太陽系以太陽為中心，八大行星依序繞著太陽運轉
     3. 知道太陽系中八大行星各自具有的特徵
     4. 知道恆星、行星與衛星的區別
   課綱 INc-Ⅲ-15「除了地球外，還有其他行星環繞著太陽運行。」
   ============================================================ */

Kit.register('sky-solar', {

  intro: '太陽系從上往下看的樣子。按「播放」看八大行星依序繞太陽轉——<b>越靠近太陽的轉得越快</b>。點行星按鈕看它的特徵。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, {
      camera: [0, 26, 20], target: [0, 0, 0], height: 420,
      grid: false, bg: 0x05070f, lights: false
    });
    S.add(new THREE.AmbientLight(0x30384f, 1.1));
    const sunLight = new THREE.PointLight(0xfff0c0, 2.2, 200);
    S.add(sunLight);
    S.fit(20);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* 距離與大小都是「示意」，不是真實比例——真實比例下地球會小到看不見 */
    const PLANETS = [
      { n: '水星', r: 0.34, a: 3.2, T: 0.24, col: 0x9e9e9e,
        f: '離太陽<b>最近</b>、體積<b>最小</b>。沒有大氣層，白天極熱、晚上極冷，溫差超過 500°C。' },
      { n: '金星', r: 0.55, a: 4.6, T: 0.62, col: 0xe8c07d,
        f: '大小和地球最接近，被<b>濃厚的二氧化碳</b>包住，是太陽系<b>最熱</b>的行星（約 460°C）。' +
           '黃昏或清晨很亮，俗稱<b>長庚星／啟明星</b>。' },
      { n: '地球', r: 0.58, a: 6.2, T: 1.00, col: 0x3b82f6,
        f: '目前<b>唯一已知有生命</b>的行星。有液態水、適合的溫度、能擋住有害輻射的大氣層。有 1 顆衛星（<b>月球</b>）。' },
      { n: '火星', r: 0.42, a: 7.9, T: 1.88, col: 0xc1440e,
        f: '表面有大量氧化鐵（<b>鐵鏽</b>），所以是紅色的，俗稱<b>紅色星球</b>。有太陽系最高的火山。' },
      { n: '木星', r: 1.55, a: 11.4, T: 11.9, col: 0xd8a06a,
        f: '<b>體積最大</b>的行星，是氣體組成的。表面有著名的<b>大紅斑</b>（一個持續數百年的大風暴）。衛星非常多。' },
      { n: '土星', r: 1.35, a: 14.6, T: 29.5, col: 0xe3d3a3, ring: true,
        f: '有最明顯的<b>環</b>（由無數冰塊和岩石碎片組成）。密度非常小，理論上<b>放進水裡會浮起來</b>。' },
      { n: '天王星', r: 0.92, a: 17.6, T: 84, col: 0x8fd3e8,
        f: '甲烷讓它呈現<b>青藍色</b>。最特別的是它幾乎是<b>躺著自轉</b>的（自轉軸傾斜約 98 度）。' },
      { n: '海王星', r: 0.9, a: 20.2, T: 165, col: 0x3f6fd8,
        f: '離太陽<b>最遠</b>的行星，非常冷（約 −200°C），風速是太陽系最快的。' }
    ];

    /* 太陽 */
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    S.add(sun);
    S.add(new THREE.Mesh(new THREE.SphereGeometry(2.9, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: .14 })));

    /* 星空背景 */
    (function stars() {
      const g = new THREE.BufferGeometry(), p = [];
      for (let i = 0; i < 500; i++) {
        const r = 60 + Math.random() * 40, a = Math.random() * Math.PI * 2, b = (Math.random() - .5) * Math.PI;
        p.push(r * Math.cos(b) * Math.cos(a), r * Math.sin(b), r * Math.cos(b) * Math.sin(a));
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      S.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb4dd, size: .3 })));
    })();

    /* 行星與軌道 */
    const meshes = [];
    PLANETS.forEach((P, i) => {
      S.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, k) => {
          const a = k / 128 * Math.PI * 2;
          return new THREE.Vector3(P.a * Math.cos(a), 0, P.a * Math.sin(a));
        })),
        new THREE.LineBasicMaterial({ color: 0x2b3a5c })));
      const m = new THREE.Mesh(new THREE.SphereGeometry(P.r, 24, 18),
        new THREE.MeshLambertMaterial({ color: P.col }));
      S.add(m);
      if (P.ring) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(P.r * 1.5, P.r * 2.3, 40),
          new THREE.MeshBasicMaterial({ color: 0xd9c9a0, side: THREE.DoubleSide, transparent: true, opacity: .6 }));
        ring.rotation.x = -Math.PI / 2.2;
        m.add(ring);
      }
      // 地球的衛星：月球
      if (P.n === '地球') {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12),
          new THREE.MeshLambertMaterial({ color: 0xd8dce6 }));
        moon.name = 'moon';
        m.add(moon);
      }
      meshes.push(m);
    });

    /* 高亮圈 */
    const halo = new THREE.Mesh(new THREE.RingGeometry(1, 1.18, 32),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
    halo.rotation.x = -Math.PI / 2;
    halo.visible = false;
    S.add(halo);

    let sel = 2, playing = true, time = 0;

    S.onFrame(function () {
      if (playing) time += 0.0035;
      PLANETS.forEach((P, i) => {
        const a = time / P.T * 2 * Math.PI;
        meshes[i].position.set(P.a * Math.cos(a), 0, P.a * Math.sin(a));
        const moon = meshes[i].getObjectByName('moon');
        if (moon) moon.position.set(Math.cos(time * 42) * 1.05, 0, Math.sin(time * 42) * 1.05);
      });
      const m = meshes[sel];
      halo.position.copy(m.position);
      halo.scale.setScalar(PLANETS[sel].r * 2.1);
      halo.visible = true;
    });

    function paint() {
      const P = PLANETS[sel];
      readout.innerHTML =
        '<div class="big">' + (sel + 1) + '. ' + P.n + '　距離太陽第 ' + (sel + 1) + ' 近　公轉一圈約 ' +
        (P.T < 1 ? Math.round(P.T * 365) + ' 天' : P.T + ' 年') + '</div>' +
        P.f + '<br><br>' +
        '<b>八大行星的順序</b>（由近到遠）：<b>水、金、地、火、木、土、天、海</b>' +
        '<span style="color:var(--muted)">（口訣：水金地火木土天海）</span><br>' +
        '<b style="color:var(--warn)">注意：越靠近太陽的行星，繞一圈越快。</b>' +
        '水星只要 88 天，海王星要 165 年——按播放看就很明顯。<br>' +
        '<span style="color:var(--muted)">⚠️ 畫面上的<b>大小和距離都是示意</b>，不是真實比例。' +
        '真實比例下如果太陽像一顆籃球，地球只有原子筆芯那麼大，而且要放在 30 公尺外。</span>';
    }

    const seg = Kit.segmented('看哪一顆', PLANETS.map((p, i) => ({ label: p.n, value: i })),
      function (v) { sel = v; paint(); }, sel);

    const playBtn = Kit.button('⏸ 暫停', function () {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ 暫停' : '▶ 播放';
    }, 'primary');

    const viewSeg = Kit.segmented('視角', [
      { label: '俯視（看軌道）', value: 'top' },
      { label: '斜看（看立體）', value: 'iso' }
    ], function (v) {
      if (v === 'top') S.camera.position.set(0, 30, 0.01);
      else S.camera.position.set(0, 18, 22);
      S.controls.target.set(0, 0, 0); S.controls.update(); S.fit(20);
    }, 'top');

    controls.appendChild(seg.wrap);
    controls.appendChild(playBtn);
    controls.appendChild(viewSeg.wrap);
    host.appendChild(controls);
    host.appendChild(readout);

    /* 恆星 / 行星 / 衛星 的區別 */
    const tri = Kit.el('div', { class: 'readout', style: 'margin-top:10px' });
    tri.innerHTML =
      '<b>恆星、行星、衛星怎麼分？</b>（這是本活動的重點之一）<br>' +
      '<span style="color:#ffd166">☀️ <b>恆星</b></span>　<b>自己會發光發熱</b>。太陽就是一顆恆星；' +
      '晚上看到的星星<b>大部分也都是恆星</b>，只是離我們太遠所以看起來很小。<br>' +
      '<span style="color:#3b82f6">🪐 <b>行星</b></span>　<b>自己不發光</b>，繞著恆星轉，我們看到的是它<b>反射</b>的太陽光。' +
      '太陽系有八顆。<br>' +
      '<span style="color:#d8dce6">🌙 <b>衛星</b></span>　<b>自己不發光</b>，繞著<b>行星</b>轉。月球就是地球的衛星。<br>' +
      '<span style="color:var(--muted)">一句話串起來：<b>衛星繞行星，行星繞恆星</b>。' +
      '畫面上地球旁邊那顆小白點就是月球，注意它是繞著地球、跟著地球一起繞太陽。</span>';
    host.appendChild(tri);

    paint();
    return S.dispose;
  },

  parentGuide: [
    { ask: '「太陽是星星嗎？」', why: '是。太陽就是一顆<b>恆星</b>，只是離我們最近所以看起來又大又亮。這一題能一次打通「星星」的概念。' },
    { ask: '「月亮和金星，哪一個是行星？」', why: '金星是行星（繞太陽），月亮是<b>衛星</b>（繞地球）。口訣：<b>衛星繞行星，行星繞恆星</b>。' },
    { ask: '按播放，問「哪一顆轉最快？為什麼？」', why: '水星。越靠近太陽的行星公轉越快——水星 88 天一圈，海王星要 165 年。看動畫比看數字有感。' },
    { ask: '「八大行星的順序記得起來嗎？」', why: '口訣「<b>水金地火木土天海</b>」。順便問「地球排第幾？」（第三顆）。' },
    { ask: '「為什麼畫面上的行星大小和距離不是真的？」', why: '真實比例下地球會小到看不見。讓孩子知道<b>模型是簡化的</b>，這本身就是重要的科學素養。' },
    { ask: '晚上找金星：日落後西邊天空最亮的那顆（或日出前東邊）。', why: '金星就是<b>長庚星／啟明星</b>。看到真的行星，比課本圖片震撼多了。' }
  ],

  pitfalls: [
    { bad: '以為晚上看到的星星都是行星。', fix: '<b>絕大多數是恆星</b>（自己發光）。肉眼能看到的行星只有金、木、火、土等少數幾顆，而且它們<b>不會眨眼</b>。' },
    { bad: '以為月亮是行星。', fix: '月亮繞<b>地球</b>轉，所以是<b>衛星</b>。行星要繞恆星（太陽）轉。' },
    { bad: '以為冥王星還是九大行星之一。', fix: '2006 年起冥王星被歸類為<b>矮行星</b>，現在是<b>八大</b>行星。' },
    { bad: '以為離太陽最近的水星最熱。', fix: '<b>金星最熱</b>（約 460°C）。因為金星有濃厚的二氧化碳大氣把熱困住，水星沒有大氣層，晚上反而極冷。' },
    { bad: '把模型的大小距離當成真的。', fix: '課本和教具的太陽系圖<b>都是示意圖</b>。真實比例下畫不出來——行星太小、距離太遠。' }
  ],

  quiz: function () {
    const type = Kit.pick(['order', 'kind', 'feature', 'speed']);

    if (type === 'order') {
      const idx = Kit.randInt(1, 8);
      const names = ['水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星'];
      const askByNum = Math.random() < .5;
      if (askByNum) {
        const opts = Kit.shuffle([names[idx - 1]].concat(
          Kit.shuffle(names.filter(n => n !== names[idx - 1])).slice(0, 3)));
        return {
          q: '從太陽數過來<b>第 ' + idx + ' 顆</b>行星是哪一顆？',
          choices: opts, answer: opts.indexOf(names[idx - 1]),
          steps: '八大行星由近到遠：<b>水、金、地、火、木、土、天、海</b><br>' +
            names.map((n, i) => (i + 1) + '. ' + n).join('　') + '<br>' +
            '第 ' + idx + ' 顆是 <b>' + names[idx - 1] + '</b>。'
        };
      }
      return {
        q: '<b>' + names[idx - 1] + '</b>是從太陽數過來第幾顆行星？',
        input: 'number', answer: idx, unit: '顆',
        steps: '八大行星由近到遠：<b>水、金、地、火、木、土、天、海</b><br>' +
          names.map((n, i) => (i + 1) + '. ' + n).join('　') + '<br>' +
          '<b>' + names[idx - 1] + '</b> 排第 <b>' + idx + '</b>。'
      };
    }

    if (type === 'kind') {
      const items = [
        { o: '太陽', a: '恆星' }, { o: '地球', a: '行星' }, { o: '月球', a: '衛星' },
        { o: '木星', a: '行星' }, { o: '金星', a: '行星' }, { o: '北極星', a: '恆星' }
      ];
      const it = Kit.pick(items);
      const opts = ['恆星', '行星', '衛星'];
      return {
        q: '<b>' + it.o + '</b>屬於恆星、行星，還是衛星？',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '<b>' + it.o + ' 是' + it.a + '</b>。<br>' +
          '<b>恆星</b>——<b>自己會發光發熱</b>（太陽、北極星、夜空中絕大多數星星）<br>' +
          '<b>行星</b>——自己不發光，<b>繞恆星</b>轉，反射太陽光（水金地火木土天海）<br>' +
          '<b>衛星</b>——自己不發光，<b>繞行星</b>轉（月球繞地球）<br>' +
          '<span style="color:var(--muted)">一句話：<b>衛星繞行星，行星繞恆星</b>。</span>'
      };
    }

    if (type === 'feature') {
      const it = Kit.pick([
        { q: '太陽系<b>體積最大</b>的行星是哪一顆？', a: '木星', o: ['土星', '地球', '海王星'] },
        { q: '太陽系<b>溫度最高</b>的行星是哪一顆？', a: '金星', o: ['水星', '火星', '木星'] },
        { q: '哪一顆行星有最明顯的<b>環</b>？', a: '土星', o: ['木星', '天王星', '火星'] },
        { q: '哪一顆行星因為表面有<b>氧化鐵（鐵鏽）</b>而呈紅色？', a: '火星', o: ['金星', '水星', '海王星'] },
        { q: '離太陽<b>最遠</b>的行星是哪一顆？', a: '海王星', o: ['天王星', '冥王星', '土星'] },
        { q: '地球有幾顆衛星？', a: '1 顆（月球）', o: ['沒有衛星', '2 顆', '很多顆'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>各行星的特徵</b>：<br>' +
          '水星——最小、最靠近太陽、溫差極大<br>' +
          '金星——<b>最熱</b>（濃厚二氧化碳把熱困住）<br>' +
          '地球——唯一已知有生命，1 顆衛星（月球）<br>' +
          '火星——紅色（氧化鐵）<br>' +
          '木星——<b>最大</b>，有大紅斑<br>' +
          '土星——最明顯的<b>環</b><br>' +
          '天王星——躺著自轉<br>' +
          '海王星——<b>最遠</b>、最冷<br>' +
          '<span style="color:var(--muted)">冥王星從 2006 年起已改列為<b>矮行星</b>，不在八大行星之內。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '越靠近太陽的行星，繞一圈越快', ok: true },
      { t: '越靠近太陽的行星，繞一圈越慢', ok: false },
      { t: '所有行星繞一圈的時間都一樣', ok: false },
      { t: '越大的行星繞一圈越快', ok: false }
    ]);
    return {
      q: '八大行星繞太陽公轉的<b>快慢</b>有什麼規律？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '<b>越靠近太陽的行星，公轉一圈越快。</b><br>' +
        '水星 88 天、金星 225 天、地球 365 天（1 年）、火星約 2 年、木星約 12 年、' +
        '土星約 30 年、天王星約 84 年、海王星約 <b>165 年</b>。<br>' +
        '<span style="color:var(--muted)">海王星從被發現到現在，才剛繞完一圈而已。</span>'
    };
  }
});
