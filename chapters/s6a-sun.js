/* ============================================================
   六上 自然（康軒）第 1 單元　觀測太陽
   課綱 INc-Ⅲ-13「日出日落時間與位置，在不同季節會不同」
        INe-Ⅲ-7「陽光是由不同色光組成」（見家長導引卡）
   教具：站在北緯 23° 的地面上，看太陽一整天怎麼走，
         以及夏至／冬至的路線差多少。同時畫出竹竿的影子。
   ============================================================ */

Kit.register('s6a-sun', {

  intro: '正中央那個<b>小人就是你</b>，四周是東南西北，地平線上是遠處的房子和樹。拖曳「時刻」看太陽一天怎麼走，換「季節」看夏天和冬天的路線差多少；小人和旁邊竿子的影子會跟著變。視角切到<b>「第一人稱」</b>就會變成用小人的眼睛抬頭看。',

  build: function (host) {
    const stage = Kit.el('div', { class: 'stage' });
    host.appendChild(stage);
    const S = Kit.scene3d(stage, {
      // 預設「斜看」：相機放在南邊（+Z）往北看，這樣北會落在畫面上方、東在右邊，
      // 方位和看地圖一致。距離由 S.fit() 依畫面比例自動決定，這裡只是初始值。
      camera: [0, 12, 19], target: [0, 1.2, 0], height: 470, grid: false, bg: 0x0a1020
    });

    const LAT = 23.0;                       // 觀測緯度：北緯 23°，剛好落在北回歸線（23.5°）以南
    const R = 7;                            // 天球半徑
    // 竿高＝小人身高。這是示意用的尺度，不是真實比例：天球半徑 7 代表「整片天空」，
    // 若照真實比例畫，一個人在畫面上只會剩幾個像素，看不出「誰站在中間」。
    const GNOMON = 1.9;
    const D2R = Math.PI / 180, R2D = 180 / Math.PI;

    // 預設刻意不用「夏至正午」——那時高度角 89.6°、方位角 0°，兩個扇形都會塌掉，
    // 是最看不出角度的情況。改用春分上午 9 點：高度角約 41°、方位角約 111°，兩個都清楚。
    let hour = 9, season = 'equinox';
    const DECL = { summer: 23.44, equinox: 0, winter: -23.44 };
    const SEASON_NAME = { summer: '夏至（6/21 前後）', equinox: '春分／秋分（3/21、9/23 前後）', winter: '冬至（12/22 前後）' };

    /* ---------- 幾何計算 ---------- */
    function sunPos(t, dec) {
      const h = (t - 12) * 15 * D2R;        // 時角
      const d = dec * D2R, p = LAT * D2R;
      const sinAlt = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h);
      const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
      let cosA = (Math.sin(d) - Math.sin(p) * Math.sin(alt)) / (Math.cos(p) * Math.cos(alt));
      cosA = Math.max(-1, Math.min(1, cosA));
      let A = Math.acos(cosA);              // 從正北量起
      if (h > 0) A = 2 * Math.PI - A;       // 過中午 → 偏西
      return { alt: alt, az: A };
    }
    /* ---- 座標系（很容易搞錯，改動前請先讀完）----
       three.js 是右手系：X × Y = Z。
       這裡取 +X = 東、+Y = 上，那麼 +Z 在幾何上就等於「東 × 上」。
       真實世界裡 東 × 上 = 南，所以：
           +X = 東　　-X = 西
           +Y = 上
           -Z = 北　　+Z = 南
       如果把 +Z 當成北，整個天空會左右鏡像（面向北方時東會跑到左手邊），
       日出方位、影子方向、太陽路徑全部都會反。                              */
    const NORTH = new THREE.Vector3(0, 0, -1);
    const EAST = new THREE.Vector3(1, 0, 0);

    function toXYZ(alt, az, r) {
      // 方位角 az 從正北量起、往東轉；水平方向 = cos(az)·北 + sin(az)·東
      return new THREE.Vector3(
        r * Math.cos(alt) * Math.sin(az),    // 東分量
        r * Math.sin(alt),                   // 高度
        -r * Math.cos(alt) * Math.cos(az)    // 北分量（北是 -Z）
      );
    }
    function sunriseHour(dec) {
      const c = -Math.tan(LAT * D2R) * Math.tan(dec * D2R);
      if (c <= -1) return 0; if (c >= 1) return 12;
      return 12 - Math.acos(c) * R2D / 15;
    }
    function azName(azDeg) {
      const dirs = ['正北', '東北', '正東', '東南', '正南', '西南', '正西', '西北', '正北'];
      return dirs[Math.round(azDeg / 45)] + '（' + azDeg.toFixed(0) + '°）';
    }
    /* 小數時刻 → 時鐘寫法。「11.25 時」對小學生沒有意義，「11:15」才有 */
    function clock(t) {
      const h = Math.floor(t), m = Math.round((t - h) * 60);
      return h + ':' + (m < 10 ? '0' : '') + m;
    }

    /* ---------- 場景 ---------- */
    // 地面
    const ground = new THREE.Mesh(new THREE.CircleGeometry(R, 64),
      new THREE.MeshLambertMaterial({ color: 0x16311f, side: THREE.DoubleSide }));
    ground.rotation.x = -Math.PI / 2;
    S.add(ground);
    S.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, i) => {
        const a = i / 64 * Math.PI * 2;
        return new THREE.Vector3(R * Math.sin(a), .01, R * Math.cos(a));
      })), new THREE.LineBasicMaterial({ color: 0x3f7d55 })));

    // 天球網格
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x1b3a6b, wireframe: true, transparent: true, opacity: .18 }));
    S.add(dome);

    // 方位文字
    function label(text, pos, color) {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      const x = c.getContext('2d');
      // 加深色描邊，方位字在天空或草地上都看得清楚
      x.font = 'bold 84px "Microsoft JhengHei", sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 10; x.strokeStyle = 'rgba(6,10,18,.9)';
      x.strokeText(text, 64, 66);
      x.fillStyle = color;
      x.fillText(text, 64, 66);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent: true, depthTest: false
      }));
      sp.position.copy(pos); sp.scale.set(1.25, 1.25, 1);
      sp.renderOrder = 9;
      S.add(sp);
      return sp;
    }
    // 往外推到 R+1.7、貼近地面：春分時日出正東、日落正西，那兩個時刻標籤
    // 會剛好落在「東」「西」上，不推開就整團疊在一起。
    const LR = R + 1.7;
    // 高度 .9 而不是貼地：第一人稱時眼睛在 1.7 高，方位標若貼在地面上
    // 會落到畫面下緣外，而方位正是第一人稱最需要的參考。
    label('北', NORTH.clone().multiplyScalar(LR).setY(.9), '#8fd0ff');    // -Z
    label('南', NORTH.clone().multiplyScalar(-LR).setY(.9), '#8fd0ff');   // +Z
    label('東', EAST.clone().multiplyScalar(LR).setY(.9), '#ffd166');     // +X
    label('西', EAST.clone().multiplyScalar(-LR).setY(.9), '#ffd166');    // -X

    /* 地平線上的遠景聚落。沒有它的話，畫面只是一個抽象半球，
       孩子不容易把它跟「我站在院子裡抬頭」連起來。刻意做得矮，
       擋掉的仰角不到 10°，日出日落還看得到。看不順眼可以按鈕關掉。 */
    const town = Kit.scenery(R, { count: 26 });
    S.add(town);

    // 文字牌維持固定的螢幕大小（26 大約是「斜看」時的相機距離）
    Kit.keepSpriteSize(S, 26);

    // 觀測者小人：站在正中央，就是所有角度的頂點，也是第一人稱的視點
    const me = Kit.person(GNOMON);
    S.add(me);
    const EYE = new THREE.Vector3(0, GNOMON * .895, 0);   // 小人的眼睛高度

    // 竿子：量影子的工具。中心留給小人，竿子就插在他旁邊（東南側約一步半的位置）。
    // 再往外挪的話看起來會像跟觀測者無關的另一根柱子，兩條影子也對不起來。
    const POLE_AT = new THREE.Vector3(1.1, 0, 1.1);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, GNOMON, 12),
      new THREE.MeshLambertMaterial({ color: 0xe8eefc }));
    pole.position.set(POLE_AT.x, GNOMON / 2, POLE_AT.z);
    S.add(pole);

    // 影子（竿子的：粗、附端點；小人的：細一點，讓小人不會像浮在空中）
    const shadowGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const shadow = new THREE.Line(shadowGeo, new THREE.LineBasicMaterial({ color: 0x111a2a, linewidth: 3 }));
    S.add(shadow);
    const shadowDot = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0x0b1220 }));
    S.add(shadowDot);
    const meShadowGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const meShadow = new THREE.Line(meShadowGeo,
      new THREE.LineBasicMaterial({ color: 0x1a2438, transparent: true, opacity: .85 }));
    S.add(meShadow);

    // 太陽
    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(.36, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    S.add(sunBall);
    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(.7, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: .18 }));
    S.add(sunGlow);

    /* ---------- 角度的視覺化 ----------
       只畫兩條細弧線的話，看不出「從哪量到哪」。這裡補上一整組輔助線，
       讓兩個角度變成一個看得懂的直角三角形：

         太陽 ●
             ╱|
      視線  ╱ | 鉛直虛線（太陽垂直落到地面）
          ╱  |
    觀測者●———● 落點        ← 地面方向線（紫）
         └ 高度角在這個鉛直面上，從「地面方向線」抬到「視線」
         方位角在地面上，從「正北線」轉到「地面方向線」            */
    const angleGroup = new THREE.Group();
    S.add(angleGroup);

    function clearAngles() {
      while (angleGroup.children.length) {
        const c = angleGroup.children.pop();
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
        angleGroup.remove(c);
      }
    }

    /* 由一串點做成從中心出發的扇形面（三角扇） */
    function wedge(pts, color, opacity) {
      const v = [0, 0, 0];
      for (let i = 0; i < pts.length - 1; i++) {
        v.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z, 0, 0, 0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(v.slice(3), 3));
      return new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide, depthWrite: false
      }));
    }

    function solidLine(a, b, color, width) {
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]),
        new THREE.LineBasicMaterial({ color: color, linewidth: width || 1 }));
    }

    function dashedLine(a, b, color) {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]),
        new THREE.LineDashedMaterial({ color: color, dashSize: .28, gapSize: .18 }));
      l.computeLineDistances();
      return l;
    }

    /* 會跟著鏡頭轉的文字牌（sprite），數字直接標在弧線旁邊 */
    function chip(text, pos, color, bg) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 96;
      const x = c.getContext('2d');
      x.fillStyle = bg || 'rgba(8,12,22,.82)';
      x.beginPath();
      const r = 20, w = 252, h = 76, ox = 2, oy = 10;
      x.moveTo(ox + r, oy); x.lineTo(ox + w - r, oy); x.quadraticCurveTo(ox + w, oy, ox + w, oy + r);
      x.lineTo(ox + w, oy + h - r); x.quadraticCurveTo(ox + w, oy + h, ox + w - r, oy + h);
      x.lineTo(ox + r, oy + h); x.quadraticCurveTo(ox, oy + h, ox, oy + h - r);
      x.lineTo(ox, oy + r); x.quadraticCurveTo(ox, oy, ox + r, oy);
      x.closePath(); x.fill();
      x.strokeStyle = color; x.lineWidth = 3; x.stroke();
      x.fillStyle = color; x.font = 'bold 40px "Microsoft JhengHei", sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, 128, 48);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent: true, depthTest: false
      }));
      sp.position.copy(pos);
      sp.scale.set(2.6, .98, 1);
      sp.renderOrder = 10;
      return sp;
    }

    const C_AZ = 0x7c5cff, C_ALT = 0x34d399, C_SIGHT = 0xffd166, C_NORTH = 0x8fd0ff;

    // 三條季節路徑（同時顯示，方便比較）
    const PATH_COL = { summer: 0xfb7185, equinox: 0xfbbf24, winter: 0x60a5fa };
    const paths = {};
    Object.keys(DECL).forEach(k => {
      const pts = [];
      for (let t = 0; t <= 24; t += .1) {
        const s = sunPos(t, DECL[k]);
        if (s.alt > 0) pts.push(toXYZ(s.alt, s.az, R - .1));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: PATH_COL[k] }));
      paths[k] = line;
      S.add(line);
    });
    let showPaths = true;

    /* 目前這一季路徑上的三個關鍵時刻，直接標在天上 */
    const markGroup = new THREE.Group();
    S.add(markGroup);
    function buildMarkers() {
      while (markGroup.children.length) {
        const c = markGroup.children.pop();
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
        markGroup.remove(c);
      }
      if (!showPaths) return;
      const dec = DECL[season];
      const rise = sunriseHour(dec);
      [[rise + .06, '日出', '#fb7185'], [12, '正午', '#fbbf24'], [24 - rise - .06, '日落', '#fb7185']]
        .forEach(([t, name, col]) => {
          const q = sunPos(t, dec);
          if (q.alt < -0.02) return;
          const pos = toXYZ(Math.max(q.alt, 0.01), q.az, R - .1);
          const dot = new THREE.Mesh(new THREE.SphereGeometry(.15, 12, 10),
            new THREE.MeshBasicMaterial({ color: col }));
          dot.position.copy(pos);
          markGroup.add(dot);
          // 日出／日落貼著地平線，和「東」「西」方位標幾乎同一個位置
          // （春分更是剛好重疊）。低空的標籤多抬高一些，錯開來才讀得到。
          const lift = q.alt < .35 ? 1.7 : .55;
          markGroup.add(chip(name + ' ' + clock(t), pos.clone().multiplyScalar(1.1).setY(pos.y + lift), col));
        });
    }

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    function update() {
      const dec = DECL[season];
      const s = sunPos(hour, dec);
      const altDeg = s.alt * R2D, azDeg = s.az * R2D;
      const up = s.alt > 0;

      // 太陽位置
      const p = toXYZ(Math.max(s.alt, 0.001), s.az, R - .1);
      sunBall.position.copy(p); sunGlow.position.copy(p);
      sunBall.visible = sunGlow.visible = up;

      // 各季節路徑：目前這條亮，其他半透明
      Object.keys(paths).forEach(k => {
        paths[k].visible = showPaths;
        paths[k].material.opacity = (k === season) ? 1 : .28;
        paths[k].material.transparent = true;
      });
      buildMarkers();

      // 小人面向太陽（面向 -Z 是北，轉 -方位角 就朝向太陽的水平方向）
      if (up) me.rotation.y = -s.az;

      // 影子：竿子和小人各一條，方向都是太陽的反方向
      if (up && altDeg > 0.5) {
        const len = GNOMON / Math.tan(s.alt);
        // 太陽水平方向為 (sin az, 0, −cos az)，影子取反向
        const u = new THREE.Vector3(-Math.sin(s.az), 0, Math.cos(s.az));
        // 影子不要畫到地面圓外面。解 |base + u·t| = Rg 取正根，
        // 這樣兩條影子都剛好停在地面邊緣，不會一長一短看起來像算錯。
        const Rg = R - .15;
        function reach(base) {
          const bu = base.dot(u);
          return -bu + Math.sqrt(Math.max(0, bu * bu + Rg * Rg - base.lengthSq()));
        }
        const O0 = new THREE.Vector3(0, .02, 0);
        const pTip = POLE_AT.clone().addScaledVector(u, Math.min(len, reach(POLE_AT))).setY(.02);
        shadowGeo.setFromPoints([POLE_AT.clone().setY(.02), pTip]);
        shadowDot.position.copy(pTip);
        meShadowGeo.setFromPoints([O0, u.clone().multiplyScalar(Math.min(len, Rg)).setY(.02)]);
        shadow.visible = shadowDot.visible = meShadow.visible = true;
        // 「幾倍竿高」是<b>比值</b> = 影長 ÷ 竿高 = 1/tan(高度角)，
        // 和竿子畫多高無關。直接印 len 會多乘一個竿高，是錯的。
        var shadowText = (len / GNOMON).toFixed(2) + ' 倍竿高' +
          (len > Rg ? '（已超出地面，畫面上被截短了）' : '') +
          '，方向朝<b>' + azName((azDeg + 180) % 360) + '</b>' +
          '（小人的影子也朝同一邊——同一時刻，所有直立物體的影子方向都一樣）';
      } else {
        shadow.visible = shadowDot.visible = meShadow.visible = false;
        shadowText = '太陽在地平線下，沒有影子';
      }

      /* ---- 兩個角度的完整圖示 ---- */
      clearAngles();
      if (up) {
        const RAZ = 4.3;              // 地面上方位角扇形的半徑
        const RALT = 2.9;             // 鉛直面上高度角扇形的半徑
        const O = new THREE.Vector3(0, .04, 0);
        const groundDir = new THREE.Vector3(Math.sin(s.az), 0, -Math.cos(s.az));  // 太陽的水平方向
        // 落點必須在太陽的<b>正下方</b>，所以水平距離 = 太陽距離 × cos(高度角)。
        // （寫成 R 就會讓「鉛直」虛線變成斜的，那條線的意義就沒了。）
        const footDist = (R - .1) * Math.cos(s.alt);
        const foot = groundDir.clone().multiplyScalar(footDist).setY(.04);

        /* ① 正北參考線：方位角從這裡開始量 */
        angleGroup.add(solidLine(O, NORTH.clone().multiplyScalar(RAZ + 1).setY(.04), C_NORTH));
        angleGroup.add(chip('0° 從這裡量', NORTH.clone().multiplyScalar(RAZ + 0.4).setY(.55), '#8fd0ff'));

        /* ② 方位角：地面上從正北轉到太陽方向的扇形 */
        const azPts = [];
        for (let i = 0; i <= 72; i++) {
          const a = s.az * i / 72;
          azPts.push(new THREE.Vector3(RAZ * Math.sin(a), .04, -RAZ * Math.cos(a)));
        }
        angleGroup.add(wedge(azPts, C_AZ, .3));
        angleGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(azPts),
          new THREE.LineBasicMaterial({ color: C_AZ })));
        const azMid = s.az / 2;
        angleGroup.add(chip('方位角 ' + azDeg.toFixed(0) + '°',
          new THREE.Vector3((RAZ + 1.2) * Math.sin(azMid), .8, -(RAZ + 1.2) * Math.cos(azMid)), '#b3a2ff'));

        /* ③ 地面方向線：從觀測者指向太陽的「正下方」 */
        angleGroup.add(solidLine(O, foot, C_AZ));
        const footDot = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 10),
          new THREE.MeshBasicMaterial({ color: C_AZ }));
        footDot.position.copy(foot);
        angleGroup.add(footDot);

        /* ④ 鉛直虛線：太陽垂直落到地面（讓「高度」看得見） */
        angleGroup.add(dashedLine(p, foot, 0xcfd9f0));

        /* ⑤ 直角記號：說明鉛直線和地面垂直 */
        const inward = groundDir.clone().multiplyScalar(-0.42);
        const q1 = foot.clone().add(inward);
        const q2 = q1.clone().setY(.46);
        const q3 = foot.clone().setY(.46);
        angleGroup.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([q1, q2, q3]),
          new THREE.LineBasicMaterial({ color: 0xcfd9f0 })));

        /* ⑥ 視線：觀測者直接看向太陽 */
        angleGroup.add(solidLine(O, p, C_SIGHT));

        /* ⑦ 高度角：在鉛直面上，從地面方向線抬到視線的扇形 */
        const altPts = [];
        for (let i = 0; i <= 40; i++) altPts.push(toXYZ(s.alt * i / 40, s.az, RALT));
        angleGroup.add(wedge(altPts, C_ALT, .34));
        angleGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(altPts),
          new THREE.LineBasicMaterial({ color: C_ALT })));
        angleGroup.add(chip('高度角 ' + altDeg.toFixed(0) + '°',
          toXYZ(s.alt / 2, s.az, RALT + 1.15), '#6ee7b7'));
      }

      // 日出日落與正午
      const rise = sunriseHour(dec), set = 24 - rise;
      const riseAz = sunPos(rise + .01, dec).az * R2D;
      const setAz = sunPos(set - .01, dec).az * R2D;
      const noon = sunPos(12, dec);
      const noonAlt = noon.alt * R2D;
      // 北緯 23° 在北回歸線（23.5°N）以南，夏至正午太陽會略微偏「北」，不是永遠在南方
      const noonSide = noonAlt > 89.5 ? '幾乎在正頭頂'
        : (dec > LAT ? '偏<b>北</b>' : '在<b>正南</b>');
      function hm(t) {
        const h = Math.floor(t), m = Math.round((t - h) * 60);
        return h + ' 時 ' + (m < 10 ? '0' : '') + m + ' 分';
      }

      readout.innerHTML =
        '<div class="big">' + SEASON_NAME[season] + '　<b>' + clock(hour) + '</b>' +
        (up ? '' : '　<span style="color:var(--muted)">（太陽還沒升起／已經落下）</span>') + '</div>' +
        (up
          ? '<span style="color:#b3a2ff">🟣 <b>方位角</b>（在地面上，從正北轉過去）</span>：' + azName(azDeg) + '<br>' +
            '<span style="color:#6ee7b7">🟢 <b>高度角</b>（從地面抬頭到太陽）</span>：<b>' + altDeg.toFixed(1) + '°</b><br>' +
            // 太陽接近天頂時，方位角會在短時間內大幅擺動，讀數容易讓人誤解
            (altDeg > 80
              ? '<span style="color:var(--warn)">⚠️ 太陽幾乎在正頭頂，這時候<b>方位角會在很短時間內大幅改變</b>' +
                '（影子也短到快看不見），讀數參考價值不大。想觀察方位變化，把時刻拉到早上或下午。</span><br>'
              : '')
          : '') +
        '竿子的影子：' + shadowText + '<br><br>' +
        '<b>今天的太陽行程</b>　日出 ' + hm(rise) + '（' + azName(riseAz) + '）' +
        '　→　正午最高 <b>' + noonAlt.toFixed(1) + '°</b>（' + noonSide + '）' +
        '　→　日落 ' + hm(set) + '（' + azName(setAz) + '）<br>' +
        '白天長度約 <b>' + (set - rise).toFixed(1) + '</b> 小時' +
        (dec > LAT ? '　<span style="color:var(--warn)">💡 這裡（北緯 23°）在北回歸線（23.5°N）<b>以南</b>，' +
          '所以夏至正午的太陽會稍微偏到<b>北邊</b>，影子往南——一年只有這幾天會這樣。</span>' : '') + '<br>' +
        '<span style="color:var(--muted)">觀測地點：北緯 23°（臺灣中南部，北回歸線以南）。' +
        '紅線＝夏至、黃線＝春秋分、藍線＝冬至的太陽路線，可以直接比較三條線的高低。</span>';
    }

    const hourSlider = Kit.slider('時刻', {
      min: 4, max: 20, step: .25, value: hour,
      format: v => clock(v),
      onChange: v => { hour = v; update(); }
    });

    const seasonSeg = Kit.segmented('季節', [
      { label: '夏至', value: 'summer' },
      { label: '春分／秋分', value: 'equinox' },
      { label: '冬至', value: 'winter' }
    ], function (v) { season = v; update(); }, season);

    /* ---- 視角預設 ----
       自由旋轉很容易轉到看不懂的角度（也是「東怎麼跑到左邊」困惑的來源），
       所以給三個站得住腳的固定視角，隨時可以按回來。 */
    // 天球半徑 7 ＋ 方位標籤 8.7 ＋ 文字牌本身的寬度，取 10 才框得住
    const FIT_R = 10;
    function setView(v) {
      // 第一人稱：相機搬到小人的眼睛，等於「蹲下來用他的眼睛看」。
      // 這時要把小人藏起來——不然滿畫面都是自己的後腦杓。
      me.visible = (v !== 'fp');
      if (v === 'fp') {
        const s = sunPos(hour, DECL[season]);
        Kit.firstPerson(S, {
          eye: EYE,
          az: s.az,
          fov: 66,
          // 取太陽高度的一半、再夾在 8°～28°。直接照太陽的高度抬頭的話，
          // 畫面會只剩天空——地面、房子、方位標全部掉出下緣，就沒有
          // 「我站在地上」的參考了。折一半可以讓地平線和太陽同時在畫面裡。
          pitch: Math.min(Math.max(s.alt * .5, .14), .49)
        });
        return;
      }
      Kit.exitFirstPerson(S);
      // 以下只決定「從哪個方向看」，距離交給 S.fit() 依畫面比例自動算，
      // 手機直式（長寬比 < 1）時天球才不會被左右切掉。
      //
      // 北是 -Z。要讓「北在螢幕上方」，相機必須放在觀測者的<b>南邊（+Z）往北看</b>；
      // 放在北邊（-Z）往南看的話，北會跑到畫面下方。
      if (v === 'map') {                     // 從正上方俯視 → 完全和看地圖一樣
        S.camera.up.set(0, 0, -1);
        S.camera.position.set(0, 23, 0.001);
      } else {
        S.camera.up.set(0, 1, 0);
        if (v === 'south') S.camera.position.set(0, 8, -21.5);     // 站在北邊朝南看（北在畫面下方）
        else S.camera.position.set(0, 12, 19);                     // 斜看：北正上、東右、西左
      }
      S.controls.target.set(0, 1.2, 0);
      S.controls.update();
      S.fit(FIT_R);
    }
    const viewSeg = Kit.segmented('視角', [
      { label: '斜看（立體）', value: 'iso' },
      { label: '第一人稱（小人的眼睛）', value: 'fp' },
      { label: '朝南看', value: 'south' },
      { label: '俯視（像地圖）', value: 'map' }
    ], setView, 'iso');

    const pathBtn = Kit.button('隱藏三季路徑', function () {
      showPaths = !showPaths;
      pathBtn.textContent = showPaths ? '隱藏三季路徑' : '顯示三季路徑';
      update();
    });

    // 房子雖然矮，日出日落剛好在某棟後面時還是會擋到，留一個開關
    const townBtn = Kit.button('隱藏地景', function () {
      town.visible = !town.visible;
      townBtn.textContent = town.visible ? '隱藏地景' : '顯示地景';
    });

    let playing = false, timer = null;
    const playBtn = Kit.button('▶ 播放一整天', function () {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ 暫停' : '▶ 播放一整天';
      if (playing) {
        timer = setInterval(() => {
          hour += .25; if (hour > 20) hour = 4;
          hourSlider.input.value = hour;
          hourSlider.output.textContent = clock(hour);
          update();
        }, 90);
      } else clearInterval(timer);
    }, 'primary');

    controls.appendChild(seasonSeg.wrap);
    controls.appendChild(hourSlider.wrap);
    controls.appendChild(playBtn);
    controls.appendChild(viewSeg.wrap);
    controls.appendChild(pathBtn);
    controls.appendChild(townBtn);
    host.appendChild(controls);
    host.appendChild(readout);

    /* 圖例：畫面上每一種顏色代表什麼，一眼對照 */
    const legend = Kit.el('div', { class: 'readout', style: 'margin-top:10px' });
    legend.innerHTML =
      '<b>畫面上的線各是什麼</b><br>' +
      '<span style="color:#8fd0ff">━ 淺藍</span>　正北方向（方位角<b>從這裡開始量</b>）<br>' +
      '<span style="color:#b3a2ff">━ 紫</span>　太陽的<b>水平方向</b>；紫色扇形就是<b>方位角</b>（趴在地面上）<br>' +
      '<span style="color:#ffd166">━ 黃</span>　你的<b>視線</b>（從你直接看向太陽）<br>' +
      '<span style="color:#cfd9f0">┈ 白虛線</span>　太陽<b>垂直落到地面</b>；落點旁的小方角代表和地面垂直<br>' +
      '<span style="color:#6ee7b7">━ 綠</span>　綠色扇形就是<b>高度角</b>（從地面方向<b>抬頭</b>到視線，站起來的那一片）<br>' +
      '<span style="color:#8b95ab">━ 深色</span>　小人和竿子的<b>影子</b>——兩條永遠<b>平行</b>，方向都和太陽相反<br>' +
      '<span style="color:var(--muted)">三季路徑：<span style="color:#fb7185">紅＝夏至</span>、' +
      '<span style="color:#fbbf24">黃＝春分／秋分</span>、<span style="color:#60a5fa">藍＝冬至</span>' +
      '（覺得太亂可以按「隱藏三季路徑」，只留角度）</span>';
    host.appendChild(legend);

    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '把黃線、紫線、白虛線看成一個<b>直角三角形</b>：躺在地上那條（紫）決定太陽在哪個<b>方向</b>，' +
        '站起來那個角（綠）決定太陽有<b>多高</b>。兩個數字合起來就能唯一指出太陽在天空的位置——' +
        '這就是課本教的「用方位和高度角描述太陽的位置」。' +
        '<br>🧭 四個<b>視角</b>按鈕可以隨時把畫面轉回看得懂的角度：' +
        '<b>「斜看」（預設）和「俯視」都是<u>北在上方、東在右邊</u></b>，方位和看地圖一致；' +
        '「朝南看」則是你在臺灣<b>實際抬頭</b>的樣子——面向南方時北在你背後，' +
        '所以畫面會變成東在左、西在右（太陽從左邊升起、右邊落下）。' +
        '<br>🧍 <b>「第一人稱」</b>把鏡頭放到小人的眼睛高度，直接朝太陽的方向看——' +
        '這是最接近真實抬頭的一種。進去以後<b>拖曳畫面就是轉頭</b>（縮放會關掉，免得穿出頭外）；' +
        '調完時刻想讓鏡頭重新對準太陽，<b>再按一次「第一人稱」</b>就好。' +
        '從第一人稱切回「斜看」，可以看出同一件事的兩種畫法：' +
        '一種是你眼睛看到的，一種是把整個天空攤開來的示意圖。'
    }));

    setView('iso');     // 和「視角」預設鍵的初始選項一致
    update();
    return function () { if (timer) clearInterval(timer); S.dispose(); };
  },

  parentGuide: [
    { ask: '「太陽每天都從正東方升起嗎？」', why: '不是。切到夏至看日出方位（偏東北），再切到冬至（偏東南）。這一題幾乎所有大人也會答錯，很適合一起發現。' },
    { ask: '「中午的影子最短還是最長？為什麼？」', why: '最短，因為太陽最高。把時刻拉到 12 時，再拉到 6 時和 18 時比較影子長度，孩子自己就會歸納出「太陽越高、影子越短」。' },
    { ask: '「夏天為什麼比較熱？是因為地球離太陽比較近嗎？」', why: '不是距離，是<b>太陽高度角</b>。夏至時這裡正午的高度角接近 90°（幾乎正上方），光集中；冬至只有 43° 左右，光斜斜地照，同樣的陽光攤開在更大的地面上。' },
    { ask: '「影子指向哪一邊？」', why: '影子永遠在太陽的<b>反方向</b>。早上太陽在東，影子朝西；中午太陽在南，影子朝北。可以真的拿一支筆在陽光下驗證。' },
    { ask: '切到「第一人稱」，問：「太陽在你的左邊還是右邊？」再切回「斜看」對照。', why: '同一個時刻、同一個太陽，<b>看起來在哪一邊會跟著你面向哪裡而變</b>——這正是「東為什麼有時在左、有時在右」的癥結。先讓孩子在第一人稱裡說出答案，再切回俯視看那條紫色的方位角，兩個畫面對起來就通了。' },
    { ask: '（延伸 INe-Ⅲ-7）「陽光是什麼顏色？」', why: '看起來是白的，其實是<b>各種色光混合</b>的。用三稜鏡或下雨後的彩虹可以把它分開。這一條也是五上「太陽」單元會帶到的內容。' }
  ],

  pitfalls: [
    { bad: '以為太陽一定從「正東」升起、「正西」落下。', fix: '只有<b>春分和秋分</b>那兩天才是正東正西。夏天偏北、冬天偏南。', src: 'INc-Ⅲ-13「日出日落時間與位置，在不同季節會不同」' },
    { bad: '以為夏天熱是因為「地球離太陽近」。', fix: '關鍵是<b>太陽高度角</b>和<b>白天長度</b>，不是距離。（事實上地球在一月時離太陽反而最近。）' },
    { bad: '把「高度角」講成「太陽有多高幾公尺」。', fix: '高度角是<b>角度</b>，從地平線抬頭量到太陽，單位是度，不是長度。' },
    { bad: '直接盯著太陽看來做觀測。', fix: '<b>絕對不可以</b>。課本的觀測方法是量<b>影子</b>，不是看太陽。這一點請務必先跟孩子講清楚。' },
    { bad: '以為「太陽在動」所以位置才變。', fix: '是<b>地球自轉</b>造成太陽東升西落，<b>地軸傾斜＋公轉</b>造成季節路線不同。這一層在國小只要建立現象，不用深入。' },
    { bad: '以為「中午的太陽一定在正南方」。', fix: '在臺灣大部分時間是這樣，<b>但北回歸線（23.5°N）以南的地區不是</b>。夏至前後那一個多月的正午，太陽會跑到<b>北邊</b>，影子朝南。切到「夏至」把時刻拉到 12 時就看得到。' }
  ],

  quiz: function () {
    const type = Kit.pick(['rise', 'shadow', 'season', 'noon']);

    if (type === 'rise') {
      const opts = Kit.shuffle([
        { t: '春分和秋分', ok: true }, { t: '夏至', ok: false },
        { t: '冬至', ok: false }, { t: '每一天都是', ok: false }
      ]);
      return {
        q: '太陽從<b>正東方</b>升起、<b>正西方</b>落下，是在什麼時候？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '只有<b>春分（約 3/21）和秋分（約 9/23）</b>這兩天。<br>夏至日出偏<b>東北</b>、日落偏<b>西北</b>；冬至日出偏<b>東南</b>、日落偏<b>西南</b>。'
      };
    }

    if (type === 'shadow') {
      const t = Kit.pick([
        { h: '早上 7 點', dir: '西' }, { h: '中午 12 點', dir: '北' }, { h: '下午 5 點', dir: '東' }
      ]);
      const opts = Kit.shuffle(['東', '西', '南', '北']);
      return {
        q: '在北緯 23° 的地方，<b>' + t.h + '</b>時，直立竿子的影子朝哪一個方向？',
        choices: opts, answer: opts.indexOf(t.dir),
        steps: '影子永遠在太陽的<b>反方向</b>。<br>早上太陽在<b>東</b>邊 → 影子朝<b>西</b>；中午太陽在<b>南</b>邊 → 影子朝<b>北</b>；下午太陽在<b>西</b>邊 → 影子朝<b>東</b>。<br>' +
          '<span style="color:var(--warn)">補充：北回歸線以南的地區，<b>夏至前後那一個多月</b>的正午，太陽會偏到北邊，影子反而朝南。其他時間都是朝北。</span>'
      };
    }

    if (type === 'season') {
      const opts = Kit.shuffle([
        { t: '因為夏天太陽的高度角比較大，陽光比較直射', ok: true },
        { t: '因為夏天地球離太陽比較近', ok: false },
        { t: '因為夏天太陽比較大顆', ok: false },
        { t: '因為夏天雲比較少', ok: false }
      ]);
      return {
        q: '為什麼<b>夏天比冬天熱</b>？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '夏至時這裡正午的太陽高度角接近 <b>90°</b>（幾乎正上方），陽光直直照下來，能量很集中；<br>冬至只有大約 <b>43°</b>，陽光斜斜照，同樣多的陽光攤在更大的地面上，就比較不熱。<br>再加上夏天白天比較長，累積的熱也比較多。'
      };
    }

    const opts = Kit.shuffle([
      { t: '中午（正午）', ok: true }, { t: '早上剛日出時', ok: false },
      { t: '傍晚快日落時', ok: false }, { t: '一整天都一樣長', ok: false }
    ]);
    return {
      q: '一天當中，竿子的影子什麼時候<b>最短</b>？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '影子長度看<b>太陽高度角</b>：太陽越高，影子越短。<br>太陽在<b>正午</b>時最高（在正南方），所以影子最短。日出、日落時太陽貼近地平線，影子拉得非常長。'
    };
  }
});
