/* ============================================================
   四上 自然（康軒）第 1 單元　月亮
   課綱 INc-Ⅱ-10「天空中天體有東升西落的現象，月亮有盈虧的變化」
   教具：太空視角看「太陽—地球—月球」的相對位置，
         同時即時畫出「站在地球上會看到的月相」。
   ============================================================ */

Kit.register('s4a-u1', {

  intro: '拖曳「農曆日期」，上面是從太空往下看的太陽、地球、月球，下面是同一天你站在地球上抬頭會看到的月亮。月亮本身不發光，我們看到的只是被太陽照亮的那一半。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, {
      camera: [0, 10, 10], target: [0, 0, 0], height: 380,
      grid: false, bg: 0x05080f,
      lights: false            // 只用太陽光，才看得出地球和月球「一半亮、一半暗」
    });
    S.add(new THREE.AmbientLight(0x2a3550, 0.9));   // 極微弱環境光，讓暗面不是全黑
    S.fit(7.5);   // 以「地球＋月球軌道」為主體框景（太陽在很遠處，允許落在畫面邊緣）

    let day = 15;                 // 農曆日期 1~30
    const ORB = 4.6;              // 月球軌道半徑（示意，非真實比例）
    const SUNX = 15;

    /* --- 星空背景 --- */
    (function stars() {
      const g = new THREE.BufferGeometry();
      const p = [];
      for (let i = 0; i < 420; i++) {
        const r = 40 + Math.random() * 30, a = Math.random() * Math.PI * 2, b = (Math.random() - .5) * Math.PI;
        p.push(r * Math.cos(b) * Math.cos(a), r * Math.sin(b), r * Math.cos(b) * Math.sin(a));
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      S.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb4dd, size: .28 })));
    })();

    /* --- 太陽（在 +X 很遠的地方） --- */
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    sun.position.set(SUNX, 0, 0);
    S.add(sun);
    S.add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: .12 })))
      .position.set(SUNX, 0, 0);

    // 太陽光：從 +X 平行射過來，所以地球和月球都是「朝太陽那一半」被照亮
    const sunLight = new THREE.DirectionalLight(0xfff3d0, 1.5);
    sunLight.position.set(SUNX, 0, 0);
    sunLight.target.position.set(0, 0, 0);
    S.add(sunLight); S.add(sunLight.target);

    /* --- 地球 --- */
    const earth = new THREE.Mesh(new THREE.SphereGeometry(.85, 32, 24),
      new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
    S.add(earth);

    /* --- 月球 --- */
    const moon = new THREE.Mesh(new THREE.SphereGeometry(.55, 32, 24),
      new THREE.MeshLambertMaterial({ color: 0xd8dce6 }));
    S.add(moon);

    /* --- 月球軌道圈 --- */
    S.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, i) => {
        const a = i / 128 * Math.PI * 2;
        return new THREE.Vector3(ORB * Math.cos(a), 0, ORB * Math.sin(a));
      })),
      new THREE.LineBasicMaterial({ color: 0x2f4468 })
    ));

    /* --- 地球到月球的視線 --- */
    const sightGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    S.add(new THREE.Line(sightGeo, new THREE.LineBasicMaterial({ color: 0x34d399 })));

    /* --- 陽光示意：平行光要真的「穿過」整個地月系統，才看得出誰被照到 ---
       避開 z = 0（會從地球正中間穿過去），地球半徑 0.85，取 ±2 以上就不會打到。 */
    [-4.2, -2.0, 2.0, 4.2].forEach(z => {
      S.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(SUNX - 3, 0, z), new THREE.Vector3(-(ORB + 1.8), 0, z)]),
        new THREE.LineBasicMaterial({ color: 0x7a6a3a, transparent: true, opacity: .55 })
      ));
    });

    /* --- 下方：從地球看到的月相 --- */
    const viewWrap = Kit.el('div', { class: 'stage', style: 'margin-top:12px;padding:14px 0;' });
    host.appendChild(viewWrap);
    const cv = Kit.canvas2d(viewWrap, 560, 190);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* 農曆日期 → 相位角（0=新月、180=滿月） */
    function phaseAngle(d) { return ((d - 1) / 29.5) * Math.PI * 2; }

    const NAMES = [
      { max: 1.5,  n: '新月（朔）',  when: '和太陽一起升起、一起落下，整天都<b>看不到</b>' },
      { max: 5.5,  n: '眉月',        when: '傍晚太陽下山後，出現在<b>西方</b>低低的天空' },
      { max: 9.5,  n: '上弦月',      when: '中午升起，<b>傍晚</b>掛在南方天空，半夜落下' },
      { max: 13.5, n: '盈凸月',      when: '下午升起，<b>晚上</b>整片天空都看得到' },
      { max: 16.5, n: '滿月（望）',  when: '太陽下山時從<b>東方</b>升起，<b>整夜</b>都看得到' },
      { max: 20.5, n: '虧凸月',      when: '晚上比較晚才升起，<b>下半夜</b>很亮' },
      { max: 24.5, n: '下弦月',      when: '<b>半夜</b>才升起，<b>清晨</b>掛在南方天空' },
      { max: 28.5, n: '殘月',        when: '天亮前出現在<b>東方</b>低空，太陽一出來就看不見' },
      { max: 99,   n: '新月（朔）',  when: '快要回到看不見的新月了' }
    ];
    function nameOf(d) { for (const x of NAMES) if (d <= x.max) return x; }

    function drawPhase() {
      const th = phaseAngle(day);
      const lit = (1 - Math.cos(th)) / 2;                  // 被照亮的比例 0~1
      const waxing = th < Math.PI;                          // 上半個月＝漸圓
      const a = Math.cos(th);                               // 明暗界線的橫向半徑比例

      cv.clear('#0e1726');
      const ctx = cv.ctx, cx = cv.W / 2, cy = cv.H / 2 + 8, R = 62;

      ctx.save();
      // 夜空
      ctx.fillStyle = '#0e1726'; ctx.fillRect(0, 0, cv.W, cv.H);
      // 月球暗面
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = '#1d2536'; ctx.fill();
      ctx.strokeStyle = '#2f4468'; ctx.lineWidth = 1; ctx.stroke();

      // 月球亮面
      if (lit > 0.004) {
        const N = 72;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {                       // 明暗界線（半橢圓）
          const u = -Math.PI / 2 + i / N * Math.PI;
          const x = a * R * Math.cos(u), y = R * Math.sin(u);
          const px = cx + (waxing ? x : -x), py = cy - y;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        for (let i = N; i >= 0; i--) {                       // 亮側的圓弧
          const u = -Math.PI / 2 + i / N * Math.PI;
          const x = R * Math.cos(u), y = R * Math.sin(u);
          ctx.lineTo(cx + (waxing ? x : -x), cy - y);
        }
        ctx.closePath();
        const grad = ctx.createRadialGradient(cx - (waxing ? -18 : 18), cy - 18, 6, cx, cy, R);
        grad.addColorStop(0, '#fffdf3'); grad.addColorStop(1, '#e2e5ec');
        ctx.fillStyle = grad; ctx.fill();
      }

      // 文字
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('你在地球上抬頭看到的月亮（農曆 ' + day + ' 日）', cx, 24);
      ctx.fillStyle = '#4da3ff'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.fillText(nameOf(day).n + '　亮的部分約 ' + Math.round(lit * 100) + '%', cx, cv.H - 14);

      // 左右方位提示
      ctx.fillStyle = '#5a6b8c'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';  ctx.fillText('← 東', 16, cy + 4);
      ctx.textAlign = 'right'; ctx.fillText('西 →', cv.W - 16, cy + 4);
      ctx.restore();
    }

    function update() {
      const th = phaseAngle(day);
      // 月球位置：農曆初一在太陽那一側（+X），十五在相反側（−X）
      const mx = ORB * Math.cos(th), mz = ORB * Math.sin(th);
      moon.position.set(mx, 0, mz);
      sightGeo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(mx, 0, mz)]);
      sightGeo.attributes.position.needsUpdate = true;

      const info = nameOf(day);
      const lit = (1 - Math.cos(th)) / 2;
      readout.innerHTML =
        '<div class="big">農曆 <b>' + day + '</b> 日 —— <b>' + info.n + '</b></div>' +
        '看得到的時間：' + info.when + '<br>' +
        '被太陽照亮的那一半 <b>永遠朝著太陽</b>；我們看到多少，要看月亮跑到地球的哪一邊。<br>' +
        '這一天我們看得到其中的 <b>' + Math.round(lit * 100) + '%</b>。<br>' +
        '<span style="color:var(--muted)">月亮繞地球一圈大約 29.5 天，所以月相會一個月循環一次。' +
        '不管哪一天，月亮都是<b>東邊升起、西邊落下</b>，只是升起的時間每天晚大約 50 分鐘。</span>';
      drawPhase();
    }

    const daySlider = Kit.slider('農曆日期', {
      min: 1, max: 30, value: day, format: v => '初/廿 ' + v + ' 日',
      onChange: v => { day = v; quickSeg.select(v); update(); }   // 讓下方按鈕的選取狀態同步
    });

    const quickSeg = Kit.segmented('快速跳到', [
      { label: '新月 初一', value: 1 },
      { label: '上弦月 初八', value: 8 },
      { label: '滿月 十五', value: 15 },
      { label: '下弦月 廿三', value: 23 }
    ], function (v) {
      day = v;
      daySlider.input.value = v;
      daySlider.output.textContent = '初/廿 ' + v + ' 日';
      update();
    }, 15);

    let playing = false, timer = null;
    const playBtn = Kit.button('▶ 播放一整個月', function () {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ 暫停' : '▶ 播放一整個月';
      if (playing) {
        timer = setInterval(() => {
          day = day % 30 + 1;
          daySlider.input.value = day;
          daySlider.output.textContent = '初/廿 ' + day + ' 日';
          quickSeg.select(day);
          update();
        }, 260);
      } else clearInterval(timer);
    }, 'primary');

    controls.appendChild(daySlider.wrap);
    controls.appendChild(quickSeg.wrap);
    controls.appendChild(playBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '⚠️ 太陽、地球、月球的<b>大小和距離都不是真實比例</b>（真實比例下月亮會小到看不見）。這張圖只在說明「相對位置」。'
    }));

    update();
    return function () { if (timer) clearInterval(timer); S.dispose(); };
  },

  parentGuide: [
    { ask: '「月亮自己會發光嗎？」', why: '不會。這是整個單元的第一塊基石。月亮只是把太陽的光反射過來，所以「亮的那一半永遠朝著太陽」。' },
    { ask: '「初一為什麼看不到月亮？」', why: '因為月亮跑到太陽和地球中間，亮面整片朝著太陽、背對我們。拖到農曆 1 日讓孩子自己在畫面上找答案。' },
    { ask: '「滿月是月亮變大了嗎？」', why: '不是。月亮一直一樣大，變的是我們「看得到亮面的多少」。可以把滿月和新月來回切換兩次讓他確認球的大小沒變。' },
    { ask: '「上弦月要什麼時候出門才看得到？」', why: '傍晚。很多孩子以為月亮只有晚上有——其實白天也常常看得到月亮，可以約好隔天下午一起去找。' },
    { ask: '「今天農曆幾號？我們今晚出去看看對不對。」', why: '這一章最有效的作業就是真的去看一次。查一下農曆日期，用這個教具先預測，再出門驗證。' }
  ],

  pitfalls: [
    { bad: '以為月相是「地球的影子擋住月亮」造成的。', fix: '那是<b>月食</b>，很少發生。月相天天在變，是因為我們看到亮面的角度不同。可以把月亮拖到地球正後方（滿月位置）問「這樣有被擋住嗎？」', src: 'INc-Ⅱ-10「月亮有盈虧的變化」' },
    { bad: '以為月亮只有晚上才會出現。', fix: '上弦月中午就升起來了，白天抬頭常常找得到。滿月才是「太陽下山才升起、整夜可見」。' },
    { bad: '把「上弦月」和「下弦月」的亮面方向記反。', fix: '上弦月亮<b>右邊</b>（像英文字母 D），下弦月亮<b>左邊</b>（像 C）。口訣：上半月「D」、下半月「C」。' },
    { bad: '看到教具就以為太陽、地球、月球真的差不多大。', fix: '這是示意圖。真實比例下太陽的直徑是地球的 109 倍，月亮到地球的距離是地球直徑的 30 倍。' }
  ],

  quiz: function () {
    const type = Kit.pick(['name', 'when', 'why', 'order']);

    if (type === 'name') {
      const cases = [
        { d: '初一', n: '新月' }, { d: '初八', n: '上弦月' },
        { d: '十五', n: '滿月' }, { d: '廿三', n: '下弦月' }
      ];
      const c = Kit.pick(cases);
      const opts = Kit.shuffle(['新月', '上弦月', '滿月', '下弦月']);
      return {
        q: '農曆 <b>' + c.d + '</b> 前後，我們看到的月相叫什麼？',
        choices: opts, answer: opts.indexOf(c.n),
        steps: '一個月的循環：初一<b>新月</b>（看不到）→ 初八<b>上弦月</b>（亮右半邊）→ 十五<b>滿月</b>（整片亮）→ 廿三<b>下弦月</b>（亮左半邊）→ 回到新月。'
      };
    }

    if (type === 'when') {
      const opts = Kit.shuffle([
        { t: '傍晚太陽下山的時候，從東方升起，整夜都看得到', ok: true },
        { t: '早上和太陽一起升起', ok: false },
        { t: '中午才升起，半夜就落下', ok: false },
        { t: '只有下半夜才看得到', ok: false }
      ]);
      return {
        q: '<b>滿月</b>大約什麼時候看得到？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '滿月時，月亮在太陽的<b>正對面</b>。太陽從西邊落下的同時，月亮就從東邊升起，所以整個晚上都掛在天上。'
      };
    }

    if (type === 'why') {
      const opts = Kit.shuffle([
        { t: '月亮繞地球轉，我們看到被太陽照亮那一面的角度一直在變', ok: true },
        { t: '地球的影子每天擋住月亮不同的部分', ok: false },
        { t: '月亮自己會發光，亮度每天不一樣', ok: false },
        { t: '雲把月亮遮住了一部分', ok: false }
      ]);
      return {
        q: '月亮為什麼會有<b>盈虧變化</b>（有時圓有時缺）？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '月亮不會自己發光，被太陽照亮的永遠是<b>朝向太陽的那一半</b>。月亮繞著地球跑，我們從地球看過去，看到亮面的角度一直在變，所以才有圓缺。<br>（地球影子擋住月亮那是<b>月食</b>，一年只有幾次。）'
      };
    }

    const seq = Kit.shuffle([
      { t: '新月 → 上弦月 → 滿月 → 下弦月', ok: true },
      { t: '新月 → 下弦月 → 滿月 → 上弦月', ok: false },
      { t: '滿月 → 上弦月 → 新月 → 下弦月', ok: false },
      { t: '上弦月 → 新月 → 下弦月 → 滿月', ok: false }
    ]);
    return {
      q: '從農曆初一開始算，月相變化的<b>順序</b>是哪一個？',
      choices: seq.map(o => o.t), answer: seq.findIndex(o => o.ok),
      steps: '初一新月（看不到）→ 慢慢變胖，初八<b>上弦月</b> → 十五<b>滿月</b> → 慢慢變瘦，廿三<b>下弦月</b> → 又回到新月。整個循環大約 <b>29.5 天</b>，這就是農曆一個月的由來。'
    };
  }
});
