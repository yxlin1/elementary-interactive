/* ============================================================
   五上 自然（康軒）第 3 單元　神祕的天空　活動三　四季的星空有什麼不一樣
   依 115 學年度課程計畫的學習目標：
     1. 天空中的星星大部分和太陽一樣是恆星，亮度有亮有暗
     2. 人們把天上某個區域內相鄰的星星用假想的線條連起來組成圖案並命名，
        稱為星座
     3. 認識光年
     4. 星星的位置會隨著時間有規律的變化
     5. 北極星的位置（幾乎固定不動，可用來辨認方位）
   課綱 INc-Ⅲ-14「四季星空會有所不同。」
   ============================================================ */

Kit.register('sky-stars', {

  intro: '你站在地上抬頭看北方的夜空。拖曳<b>時刻</b>看星星怎麼繞著<b>北極星</b>轉，換<b>季節</b>看看到的星座怎麼換。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, {
      camera: [0, 3, 15], target: [0, 4.5, 0], height: 430,
      grid: false, bg: 0x04060e, lights: false
    });
    S.add(new THREE.AmbientLight(0xffffff, 1));
    S.fit(11);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    const LAT = 23 * Math.PI / 180;          // 北緯 23°
    let hour = 21, season = 'spring', showLine = true, playing = false, timer = null;

    /* ---- 星座（以赤經時角 ra 小時、赤緯 dec 度 表示，數值取概略值）---- */
    const CONST = {
      bigdipper: {
        n: '北斗七星（大熊座）', season: 'spring', col: 0x9fd0ff,
        note: '春天晚上高掛北方天空。<b>斗口的兩顆星（天樞、天璇）連線往外延伸五倍，就找到北極星</b>——這是最實用的找北方法。',
        stars: [[11.06, 61.8], [11.03, 56.4], [11.90, 53.7], [12.26, 57.0], [12.90, 55.9], [13.40, 54.9], [13.79, 49.3]],
        link: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
      },
      scorpius: {
        n: '天蠍座', season: 'summer', col: 0xfb7185,
        note: '夏天南方天空的代表。最亮的<b>心宿二（天蠍座 α）</b>是紅色的，' +
          '中國古代叫「大火」。整個形狀像一隻翹著尾巴的蠍子。',
        stars: [[16.49, -26.4], [16.09, -19.8], [16.00, -22.6], [16.84, -34.3], [17.20, -37.3],
                [17.56, -37.1], [17.62, -39.0], [17.71, -39.5]],
        link: [[1, 2], [2, 0], [0, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
      },
      cygnus: {
        n: '天鵝座（夏季大三角之一）', season: 'summer', col: 0xe8eefc,
        note: '夏秋之際頭頂附近。最亮的<b>天津四</b>和織女星、牛郎星組成<b>夏季大三角</b>。' +
          '形狀像一個大十字，也叫「北十字」。',
        stars: [[20.69, 45.3], [20.37, 40.3], [19.94, 35.1], [20.77, 33.97], [19.51, 27.96], [20.22, 46.74]],
        link: [[0, 1], [1, 2], [1, 3], [1, 4], [0, 5]]
      },
      pegasus: {
        n: '飛馬座（秋季四邊形）', season: 'autumn', col: 0xa5d6a7,
        note: '秋天的代表。四顆亮度接近的星組成一個大<b>四邊形</b>，很好認，' +
          '像天上開了一個大方框。',
        stars: [[0.14, 15.2], [23.06, 15.2], [23.08, 28.1], [0.22, 29.1]],
        link: [[0, 1], [1, 2], [2, 3], [3, 0]]
      },
      orion: {
        n: '獵戶座', season: 'winter', col: 0x8fd3e8,
        note: '冬天最好認的星座。中間<b>三顆排成一直線</b>的是「腰帶」，' +
          '左上紅色的是<b>參宿四</b>、右下藍白色的是<b>參宿七</b>。',
        stars: [[5.92, 7.4], [5.24, -8.2], [5.60, -1.2], [5.68, -1.94], [5.78, -1.94],
                [5.42, 6.35], [5.80, -9.67]],
        link: [[0, 5], [0, 2], [2, 3], [3, 4], [4, 6], [1, 3], [5, 2]]
      }
    };
    const POLARIS = [2.53, 89.26];           // 北極星（勾陳一）

    const SEASON_NAME = { spring: '春季（3～5 月）', summer: '夏季（6～8 月）', autumn: '秋季（9～11 月）', winter: '冬季（12～2 月）' };
    const SEASON_LST = { spring: 11, summer: 17, autumn: 23, winter: 5 };   // 該季晚間 21 時的大致地方恆星時

    /* 赤道座標 → 場景座標（觀測者在原點，北方是 -Z，天頂 +Y）*/
    function toScene(ra, dec, r) {
      const lst = SEASON_LST[season] + (hour - 21);         // 時角隨時刻推移
      const H = (lst - ra) * 15 * Math.PI / 180;            // 時角（弧度）
      const d = dec * Math.PI / 180;
      const sinAlt = Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H);
      const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
      let cosA = (Math.sin(d) - Math.sin(LAT) * Math.sin(alt)) / (Math.cos(LAT) * Math.cos(alt));
      cosA = Math.max(-1, Math.min(1, cosA));
      let A = Math.acos(cosA);
      if (Math.sin(H) > 0) A = 2 * Math.PI - A;
      return {
        v: new THREE.Vector3(r * Math.cos(alt) * Math.sin(A), r * Math.sin(alt), -r * Math.cos(alt) * Math.cos(A)),
        alt: alt
      };
    }

    /* 場景：地面與天球 */
    const ground = new THREE.Mesh(new THREE.CircleGeometry(9.6, 48),
      new THREE.MeshBasicMaterial({ color: 0x10261a, side: THREE.DoubleSide }));
    ground.rotation.x = -Math.PI / 2;
    S.add(ground);
    S.add(new THREE.Mesh(new THREE.SphereGeometry(9.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x15294d, wireframe: true, transparent: true, opacity: .13 })));

    function label(text, pos, color, scale) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 72;
      const x = c.getContext('2d');
      x.font = 'bold 40px "Microsoft JhengHei", sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 8; x.strokeStyle = 'rgba(3,6,14,.9)'; x.strokeText(text, 128, 38);
      x.fillStyle = color; x.fillText(text, 128, 38);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent: true, depthTest: false
      }));
      sp.position.copy(pos); sp.scale.set(scale || 2.6, (scale || 2.6) * 0.28, 1);
      sp.renderOrder = 8;
      return sp;
    }
    // 方位
    [['北', 0, 0, -9.9, '#8fd0ff'], ['南', 0, 0, 9.9, '#8fd0ff'],
     ['東', 9.9, 0, 0, '#ffd166'], ['西', -9.9, 0, 0, '#ffd166']]
      .forEach(([t, x, y, z, c]) => S.add(label(t, new THREE.Vector3(x, .4, z), c, 1.7)));

    /* 背景散星 */
    (function bg() {
      const g = new THREE.BufferGeometry(), p = [];
      for (let i = 0; i < 420; i++) {
        const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI / 2 * .95;
        const r = 9.2;
        p.push(r * Math.cos(b) * Math.sin(a), r * Math.sin(b) + .2, -r * Math.cos(b) * Math.cos(a));
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      S.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8ea6cc, size: .11, transparent: true, opacity: .55 })));
    })();

    /* 動態群組 */
    const dyn = new THREE.Group();
    S.add(dyn);
    function clearDyn() {
      while (dyn.children.length) {
        const c = dyn.children.pop();
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
        dyn.remove(c);
      }
    }

    let trail = true;
    function rebuild() {
      clearDyn();
      const R = 9.1;

      // 北極星
      const pol = toScene(POLARIS[0], POLARIS[1], R);
      const pm = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 12),
        new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
      pm.position.copy(pol.v); dyn.add(pm);
      dyn.add(label('北極星', pol.v.clone().add(new THREE.Vector3(0, .7, 0)), '#fff2b0', 2.4));

      // 星星繞北極星的軌跡（週日運動）
      if (trail) {
        Object.keys(CONST).forEach(k => {
          const C = CONST[k];
          if (C.season !== season) return;
          C.stars.forEach(st => {
            const pts = [];
            for (let hh = 0; hh <= 24; hh += .5) {
              const save = hour; hour = hh;
              const p = toScene(st[0], st[1], R);
              hour = save;
              if (p.alt > 0.02) pts.push(p.v);
            }
            if (pts.length > 2) {
              dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: 0x2f4468, transparent: true, opacity: .55 })));
            }
          });
        });
      }

      // 當季星座
      let visible = 0;
      Object.keys(CONST).forEach(k => {
        const C = CONST[k];
        const onSeason = C.season === season;
        const pos = C.stars.map(st => toScene(st[0], st[1], R));
        const above = pos.filter(p => p.alt > 0).length;
        if (!above) return;
        if (onSeason) visible++;
        const col = onSeason ? C.col : 0x44506b;
        pos.forEach(p => {
          if (p.alt <= 0) return;
          const m = new THREE.Mesh(new THREE.SphereGeometry(onSeason ? .13 : .08, 12, 10),
            new THREE.MeshBasicMaterial({ color: col }));
          m.position.copy(p.v); dyn.add(m);
        });
        if (showLine) {
          C.link.forEach(([a, b]) => {
            if (pos[a].alt <= 0 || pos[b].alt <= 0) return;
            dyn.add(new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([pos[a].v, pos[b].v]),
              new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: onSeason ? .9 : .3 })));
          });
        }
        if (onSeason && above > C.stars.length / 2) {
          const mid = pos.filter(p => p.alt > 0)
            .reduce((a, p) => a.add(p.v), new THREE.Vector3()).multiplyScalar(1 / above);
          dyn.add(label(C.n.split('（')[0], mid.clone().multiplyScalar(1.06).add(new THREE.Vector3(0, .8, 0)),
            '#' + C.col.toString(16).padStart(6, '0'), 3));
        }
      });

      const list = Object.keys(CONST).filter(k => CONST[k].season === season).map(k => CONST[k]);
      readout.innerHTML =
        '<div class="big">' + SEASON_NAME[season] + '　晚上 ' + hour + ' 時的' +
        (season === 'spring' ? '北方' : '') + '星空</div>' +
        list.map(C => '<b style="color:#' + C.col.toString(16).padStart(6, '0') + '">' + C.n + '</b>　' + C.note).join('<br>') +
        '<br><span style="color:var(--muted)">' +
        '<b>星座是什麼？</b>人們把天上某個區域內<b>相鄰的星星，用假想的線連起來</b>組成圖案並命名——' +
        '這些線<b>實際上不存在</b>，同一個星座裡的星星彼此距離也可能差得非常遠。<br>' +
        '<b>星星為什麼會動？</b>拖曳時刻看：所有星星都<b>繞著北極星</b>逆時針轉（灰色線是它們一整晚的軌跡）。' +
        '這是<b>地球自轉</b>造成的，星星本身沒有跑。<br>' +
        '<b>北極星</b>幾乎在自轉軸的正上方，所以<b>整晚、整年都不太動</b>，永遠在正北方——' +
        '古人靠它辨認方向。它的<b>仰角就約等於當地緯度</b>（在台灣約 23 度）。</span>';
    }

    const seasonSeg = Kit.segmented('季節', [
      { label: '春', value: 'spring' }, { label: '夏', value: 'summer' },
      { label: '秋', value: 'autumn' }, { label: '冬', value: 'winter' }
    ], function (v) { season = v; rebuild(); }, season);

    const hourCtl = Kit.slider('時刻', {
      min: 18, max: 30, value: hour,
      format: v => (v > 24 ? v - 24 : v) + ' 時' + (v > 24 ? '（隔天凌晨）' : ''),
      onChange: v => { hour = v; rebuild(); }
    });

    const lineBtn = Kit.button('顯示／隱藏連線', function () { showLine = !showLine; rebuild(); });
    const trailBtn = Kit.button('顯示／隱藏移動軌跡', function () { trail = !trail; rebuild(); });
    const playBtn = Kit.button('▶ 播放一整晚', function () {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ 暫停' : '▶ 播放一整晚';
      if (playing) {
        timer = setInterval(() => {
          hour += 0.5; if (hour > 30) hour = 18;
          hourCtl.input.value = hour;
          hourCtl.output.textContent = (hour > 24 ? hour - 24 : hour) + ' 時' + (hour > 24 ? '（隔天凌晨）' : '');
          rebuild();
        }, 260);
      } else clearInterval(timer);
    }, 'primary');

    controls.appendChild(seasonSeg.wrap);
    controls.appendChild(hourCtl.wrap);
    controls.appendChild(playBtn);
    controls.appendChild(lineBtn);
    controls.appendChild(trailBtn);
    host.appendChild(controls);
    host.appendChild(readout);

    const ly = Kit.el('div', { class: 'readout', style: 'margin-top:10px' });
    ly.innerHTML =
      '<b>光年是什麼？</b>（本活動要認識的單位）<br>' +
      '光年<b>不是時間，是距離</b>——是<b>光走一年</b>的距離，大約 <b>9 兆 5 千億公里</b>。<br>' +
      '星星實在太遠，用公里寫會長到沒辦法讀，所以天文學改用光年。<br>' +
      '<span style="color:var(--muted)">• 光從太陽到地球約 <b>8 分鐘</b>（所以你看到的太陽是 8 分鐘前的）<br>' +
      '• 離太陽最近的恆星約 <b>4.2 光年</b><br>' +
      '• 北極星約 <b>430 光年</b>——你現在看到的光，是明朝時候就出發的<br>' +
      '這也表示：<b>看星星就是在看過去</b>。</span>';
    host.appendChild(ly);

    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '為什麼<b>四季星空不一樣</b>？因為地球<b>繞太陽公轉</b>，不同季節的晚上，地球背對太陽的那一面朝向宇宙的<b>不同方向</b>，' +
        '所以看到的星座就換了一批。（不是星星跑掉了。）'
    }));

    rebuild();
    return function () { if (timer) clearInterval(timer); S.dispose(); };
  },

  parentGuide: [
    { ask: '按「播放一整晚」，問：「哪一顆星幾乎不動？」', why: '<b>北極星</b>。所有星星都繞著它轉，因為它幾乎就在地球自轉軸的正上方。這是整個活動最重要的觀察。' },
    { ask: '「星星真的在天上跑嗎？」', why: '不是。是<b>地球在自轉</b>，我們跟著轉，所以看起來星星在動——和坐車時覺得路樹在後退是同一回事。' },
    { ask: '「星座上的那些線真的存在嗎？」', why: '<b>不存在</b>，是古人想像連起來的。同一個星座裡的星星，實際距離可能差好幾百光年，只是<b>剛好在同一個方向</b>。' },
    { ask: '切換四個季節：「為什麼冬天看得到獵戶座，夏天看不到？」', why: '因為地球<b>繞太陽公轉</b>，不同季節夜晚朝向宇宙的方向不同。不是星星消失了，是白天那一側看不到。' },
    { ask: '「光年是時間還是距離？」', why: '<b>距離</b>。這是最常錯的名詞。光走一年的距離，約 9 兆 5 千億公里。' },
    { ask: '「北極星離我們 430 光年，代表什麼？」', why: '你現在看到的光是 <b>430 年前</b>出發的——看星星就是在看過去。這個想法通常會讓孩子安靜三秒鐘。' },
    { ask: '真的去看一次：找個暗一點的地方，先找北斗七星，再用斗口兩顆星延伸五倍找北極星。', why: '課本教的方法，實際做一次就終生不忘。手機的星空 App 可以輔助對照。' }
  ],

  pitfalls: [
    { bad: '以為「光年」是時間單位。', fix: '光年是<b>距離</b>——光走一年的距離（約 9 兆 5 千億公里）。說「花了 4 光年」是錯的。' },
    { bad: '以為北極星是天空中<b>最亮</b>的星。', fix: '北極星只是中等亮度。它的重要性在於<b>位置幾乎不動</b>，永遠指著正北方。（全天最亮的恆星是天狼星。）' },
    { bad: '以為星座的連線是真的存在，或同一星座的星星彼此很近。', fix: '線是<b>人想像</b>的。同一星座的星星可能差好幾百光年，只是從地球看過去<b>方向相近</b>。' },
    { bad: '以為星星會移動位置。', fix: '看起來會動是因為<b>地球自轉</b>（一晚繞北極星轉）和<b>地球公轉</b>（四季星空不同）。星星本身相對位置幾乎不變。' },
    { bad: '以為夏天看不到冬天的星座，是因為那些星星「跑掉了」。', fix: '它們還在，只是<b>白天在天上</b>，被太陽的光蓋過去看不見。' },
    { bad: '把行星當成恆星。', fix: '夜空中絕大多數是<b>恆星</b>（會眨眼）；金、木、火、土等<b>行星不會眨眼</b>，而且位置會相對於星座慢慢移動。' }
  ],

  quiz: function () {
    const type = Kit.pick(['polaris', 'lightyear', 'constellation', 'move', 'season']);

    if (type === 'polaris') {
      const it = Kit.pick([
        { q: '為什麼<b>北極星</b>幾乎整晚都不會動？', a: '因為它幾乎就在地球自轉軸的正上方', o: ['因為它離地球最近', '因為它是全天最亮的星', '因為它自己不會發光'] },
        { q: '怎麼用<b>北斗七星</b>找到北極星？', a: '把斗口的兩顆星連線往外延伸約五倍', o: ['找斗柄末端那一顆', '找北斗七星正中央', '找最亮的那一顆'] },
        { q: '找到北極星之後，可以知道什麼？', a: '正北方在哪裡', o: ['現在幾點', '明天的天氣', '自己的海拔高度'] },
        { q: '北極星是天空中最亮的星嗎？', a: '不是，只是中等亮度', o: ['是，全天最亮', '是，因為它最近', '它其實不發光'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>北極星</b>幾乎位在地球自轉軸的正上方，所以整晚、整年都停在<b>正北方</b>幾乎不動，' +
          '其他星星則繞著它轉——古人靠它辨認方向。<br>' +
          '<b>找法</b>：北斗七星<b>斗口的兩顆星</b>連線，往外延伸<b>約五倍</b>就到北極星。<br>' +
          '<span style="color:var(--muted)">它只是中等亮度，並不是最亮的星。</span>'
      };
    }

    if (type === 'lightyear') {
      const it = Kit.pick([
        { q: '<b>光年</b>是什麼單位？', a: '距離單位（光走一年的距離）', o: ['時間單位（一年）', '亮度單位', '溫度單位'] },
        { q: '北極星距離地球約 430 光年，代表我們現在看到的光是什麼時候出發的？', a: '大約 430 年前', o: ['430 天前', '現在這一刻', '430 秒前'] },
        { q: '為什麼天文學要用「光年」而不用公里？', a: '因為星星太遠，用公里寫出來的數字太長', o: ['因為公里不夠精確', '因為光年比較好聽', '因為星星會移動'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>光年是距離，不是時間</b>——光走一年的距離，約 <b>9 兆 5 千億公里</b>。<br>' +
          '• 太陽到地球：光走約 <b>8 分鐘</b><br>' +
          '• 最近的恆星：約 <b>4.2 光年</b><br>' +
          '• 北極星：約 <b>430 光年</b>（現在看到的光是 430 年前出發的）<br>' +
          '<span style="color:var(--muted)">所以<b>看星星就是在看過去</b>。</span>'
      };
    }

    if (type === 'constellation') {
      const it = Kit.pick([
        { q: '什麼是<b>星座</b>？', a: '把天上某區域內相鄰的星星用假想的線連起來，組成圖案並命名', o: ['一群互相繞轉的星星', '距離很近所以聚在一起的星星', '會一起移動的行星'] },
        { q: '同一個星座裡的星星，實際上彼此距離如何？', a: '可能差非常遠，只是從地球看方向相近', o: ['一定都很近', '距離完全相同', '一定在同一個平面上'] },
        { q: '天空中的星星，大部分屬於哪一類？', a: '恆星（自己會發光）', o: ['行星', '衛星', '彗星'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>星座</b>是人們把某個區域內<b>相鄰的星星用假想的線</b>連起來組成圖案並命名的結果。' +
          '那些線<b>實際上不存在</b>，同一星座的星星可能相距好幾百光年，只是<b>從地球看過去方向相近</b>。<br>' +
          '夜空中的星星<b>絕大多數是恆星</b>，和太陽一樣自己會發光，亮度有亮有暗。'
      };
    }

    if (type === 'move') {
      const opts = Kit.shuffle([
        { t: '地球自轉，我們跟著轉，所以看起來星星在動', ok: true },
        { t: '星星真的繞著地球跑', ok: false },
        { t: '風把星星吹動了', ok: false },
        { t: '星星每天晚上會換位置重新排列', ok: false }
      ]);
      return {
        q: '一整晚觀察，星星會<b>繞著北極星</b>慢慢移動。真正的原因是什麼？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '是<b>地球自轉</b>造成的。我們站在轉動的地球上，所以看起來整片星空在轉。<br>' +
          '就像坐在車上覺得路樹往後退——動的其實是你。<br>' +
          '<span style="color:var(--muted)">因為地球自轉軸幾乎指著北極星，所以<b>北極星看起來不動</b>，' +
          '其他星星以它為中心逆時針旋轉。</span>'
      };
    }

    const items = [['獵戶座', '冬'], ['天蠍座', '夏'], ['北斗七星', '春'], ['飛馬座（秋季四邊形）', '秋']];
    const it = Kit.pick(items);
    const askSeason = Math.random() < .5;
    if (askSeason) {
      const opts = ['春', '夏', '秋', '冬'];
      return {
        q: '<b>' + it[0] + '</b>是哪一季晚上最容易看到的代表星象？',
        choices: opts, answer: opts.indexOf(it[1]),
        steps: '答案：<b>' + it[1] + '季</b><br>' +
          '四季代表星象：<br><b>春</b>——北斗七星（用來找北極星）<br>' +
          '<b>夏</b>——天蠍座、夏季大三角（天鵝座）<br>' +
          '<b>秋</b>——飛馬座（秋季四邊形）<br><b>冬</b>——獵戶座<br>' +
          '<span style="color:var(--muted)">為什麼四季不一樣？因為地球<b>繞太陽公轉</b>，' +
          '不同季節的夜晚朝向宇宙的方向不同。</span>'
      };
    }
    const opts = Kit.shuffle([
      { t: '地球繞太陽公轉，不同季節夜晚朝向宇宙的方向不同', ok: true },
      { t: '星星在不同季節會飛到別的地方', ok: false },
      { t: '不同季節的空氣讓某些星星看不見', ok: false },
      { t: '地球自轉的方向會隨季節改變', ok: false }
    ]);
    return {
      q: '為什麼<b>四季看到的星空不一樣</b>？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '因為<b>地球繞太陽公轉</b>。夜晚是地球<b>背對太陽</b>的那一面，' +
        '而地球在軌道上不同位置時，背對太陽的方向指向宇宙的<b>不同區域</b>，所以看到的星座就換了一批。<br>' +
        '<span style="color:var(--muted)">冬天看不到天蠍座，不是它跑掉了——它<b>白天在天上</b>，被太陽的光蓋過去而已。</span>'
    };
  }
});
