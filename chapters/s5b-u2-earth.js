/* ============================================================
   五下 自然（康軒）第 2 單元　大地的奧妙
   課綱 INd-Ⅲ-8「土壤是由岩石風化成的碎屑及生物遺骸所組成。」
        INd-Ⅲ-9「流水、風和波浪對砂石可產生侵蝕、風化、搬運及堆積等作用，
                  河流是改變地表最重要的力量。」
        INc-Ⅲ-11「岩石由礦物組成，岩石和礦物有不同特徵，各有不同用途。」
   教具：河流剖面（上游／中游／下游）看侵蝕搬運堆積；地層層序；岩石辨識。
   ============================================================ */

Kit.register('s5b-u2', {

  intro: '三個模式：跟著河水從<b>上游走到下游</b>看石頭怎麼變、看<b>地層</b>怎麼一層一層疊起來、認識三大類<b>岩石</b>。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 340);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'river', pos = 1, rockKey = 'ig';

    /* ---------- 模式 A：河流 ---------- */
    const RIVER = {
      1: {
        n: '上游（山區）', slope: '陡', speed: '很快', main: '侵蝕',
        stone: '大石頭、稜稜角角', valley: 'V 形谷',
        why: '坡度陡、水流又快又急，力量集中往<b>下</b>切，把河床挖深，形成又深又窄的 <b>V 形谷</b>。' +
          '石頭剛崩落不久，還來不及被磨，所以又<b>大</b>又<b>有稜有角</b>。',
        land: '瀑布、峽谷、V 形谷（例：太魯閣）'
      },
      2: {
        n: '中游（丘陵）', slope: '較緩', speed: '中等', main: '搬運',
        stone: '中等大小、開始變圓', valley: '曲流、河階',
        why: '坡度變緩，水流慢下來，主要工作變成<b>把石頭往下游搬</b>。' +
          '石頭在河床上一路滾、一路互相撞，稜角被磨掉，慢慢<b>變小、變圓</b>。<br>' +
          '河道開始左右擺動，形成<b>曲流</b>——彎道<b>外側</b>水快所以侵蝕，<b>內側</b>水慢所以堆積。',
        land: '曲流、河階地、壺穴'
      },
      3: {
        n: '下游（平原）', slope: '很平緩', speed: '慢', main: '堆積',
        stone: '細砂、泥、小圓石', valley: '寬廣河道',
        why: '坡度幾乎平了，水流很慢，<b>搬不動</b>大顆的東西，只好一路放下來。' +
          '大顆的先沉、細的最後沉，所以下游都是<b>細砂和泥</b>。<br>' +
          '到出海口，泥砂大量堆積形成<b>三角洲</b>；洪水時漫出河道堆成<b>沖積平原</b>。',
        land: '沖積平原、三角洲、沙洲（例：嘉南平原）'
      }
    };

    function drawRiver() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('河流從山上流到海邊。拖曳滑桿，看同一條河在不同位置做的事完全不同', 16, 22);

      // 地形剖面
      const gy = 210;
      ctx.beginPath();
      ctx.moveTo(0, gy - 130);
      ctx.bezierCurveTo(140, gy - 120, 200, gy - 40, 330, gy - 22);
      ctx.bezierCurveTo(440, gy - 10, 520, gy - 6, 620, gy - 4);
      ctx.lineTo(620, 340); ctx.lineTo(0, 340); ctx.closePath();
      ctx.fillStyle = '#3d4a3a'; ctx.fill();
      ctx.strokeStyle = '#6b8f5e'; ctx.lineWidth = 2; ctx.stroke();

      // 海
      ctx.fillStyle = 'rgba(56,189,248,.32)';
      ctx.fillRect(540, gy - 4, 80, 340 - gy + 4);

      // 河水
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(20, gy - 126);
      ctx.bezierCurveTo(150, gy - 116, 210, gy - 36, 335, gy - 18);
      ctx.bezierCurveTo(445, gy - 6, 520, gy - 2, 600, gy);
      ctx.stroke();

      // 三段標記
      const zones = [[20, 200, '上游'], [200, 400, '中游'], [400, 600, '下游']];
      zones.forEach(([x0, x1, n], i) => {
        const on = pos === i + 1;
        ctx.fillStyle = on ? 'rgba(251,191,36,.14)' : 'transparent';
        ctx.fillRect(x0, 40, x1 - x0, 260);
        ctx.strokeStyle = on ? '#fbbf24' : '#2f4468';
        ctx.lineWidth = on ? 2 : 1;
        ctx.strokeRect(x0, 40, x1 - x0, 260);
        ctx.fillStyle = on ? '#fbbf24' : '#5a6b8c';
        ctx.font = (on ? 'bold ' : '') + '14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(n, (x0 + x1) / 2, 46);
      });

      // 石頭：上游大而有稜角，下游小而圓
      const R = RIVER[pos];
      const stoneCfg = { 1: { r: 22, jag: .55, n: 5 }, 2: { r: 13, jag: .25, n: 9 }, 3: { r: 6, jag: .06, n: 18 } }[pos];
      const zx = zones[pos - 1];
      for (let i = 0; i < stoneCfg.n; i++) {
        const px = zx[0] + 24 + (i * 37) % (zx[1] - zx[0] - 48);
        const py = 262 + ((i * 53) % 46);
        ctx.beginPath();
        const sides = 9;
        for (let s = 0; s <= sides; s++) {
          const a = s / sides * Math.PI * 2;
          const rr = stoneCfg.r * (1 - stoneCfg.jag / 2 + ((s * 37 + i * 13) % 10) / 10 * stoneCfg.jag);
          const qx = px + Math.cos(a) * rr, qy = py + Math.sin(a) * rr * .8;
          s ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
        }
        ctx.closePath();
        ctx.fillStyle = '#8d8378'; ctx.fill();
        ctx.strokeStyle = '#5d564e'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('↑ 這一段河床上的石頭長這樣', zx[0] + 12, 312);

      readout.innerHTML =
        '<div class="big">' + R.n + '　主要作用：<b>' + R.main + '</b></div>' +
        '坡度：<b>' + R.slope + '</b>　水流速度：<b>' + R.speed + '</b>　石頭：<b>' + R.stone + '</b><br>' +
        R.why + '<br>' +
        '常見地形：<b>' + R.land + '</b><br>' +
        '<span style="color:var(--muted)">課綱 INd-Ⅲ-9：「流水、風和波浪對砂石可產生<b>侵蝕、風化、搬運及堆積</b>等作用，' +
        '<b>河流是改變地表最重要的力量</b>。」<br>' +
        '四個動作的順序：岩石先被<b>風化</b>（碎掉）→ 被水<b>侵蝕</b>（挖走）→ 被<b>搬運</b>（帶往下游）→ 最後<b>堆積</b>（放下來）。</span>';
    }

    /* ---------- 模式 B：地層 ---------- */
    const LAYERS = [
      { n: '表土層', col: '#4a3b2a', d: '最上面的土壤，含有腐爛的落葉和生物遺骸（<b>腐植質</b>），顏色最深、最肥沃。' },
      { n: '砂層', col: '#c2a878', d: '顆粒較粗的砂，通常代表當時是<b>水流較快</b>的環境（河床、海灘）。' },
      { n: '泥層（頁岩）', col: '#7d7266', d: '顆粒很細的泥，代表當時是<b>水流很慢</b>的環境（湖底、深海）。' },
      { n: '含化石的石灰岩', col: '#b9b3a0', d: '由生物遺骸堆積形成，裡面常有<b>貝殼化石</b>——代表這裡以前是<b>海底</b>。' },
      { n: '礫石層', col: '#8a8378', d: '大顆的圓石，代表當時是<b>水流很急</b>的環境（河流上游或洪水）。' }
    ];

    function drawLayers() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('地層是一層一層堆上去的。點各層看它代表什麼環境', 16, 22);

      const bx = 60, by = 46, bw = 240, lh = 52;
      LAYERS.forEach((L, i) => {
        const y = by + i * lh;
        ctx.fillStyle = L.col;
        ctx.fillRect(bx, y, bw, lh - 2);
        // 顆粒質感
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        const grain = [3, 6, 2, 5, 9][i];
        for (let k = 0; k < 60; k++) {
          const px = bx + ((k * 71) % bw), py = y + ((k * 37) % (lh - 6));
          ctx.beginPath(); ctx.arc(px, py, grain / 2.4, 0, Math.PI * 2); ctx.fill();
        }
        if (i === 3) {   // 化石
          ctx.strokeStyle = '#f5f0e0'; ctx.lineWidth = 2;
          [[bx + 60, y + 24], [bx + 150, y + 30]].forEach(([px, py]) => {
            ctx.beginPath();
            for (let s = 0; s < 5; s++) ctx.arc(px, py, 4 + s * 2.6, Math.PI * .1, Math.PI * .95);
            ctx.stroke();
          });
        }
        ctx.strokeStyle = pos === i + 1 ? '#fbbf24' : '#0b1220';
        ctx.lineWidth = pos === i + 1 ? 3 : 1;
        ctx.strokeRect(bx, y, bw, lh - 2);

        ctx.fillStyle = pos === i + 1 ? '#fbbf24' : '#93a3c4';
        ctx.font = (pos === i + 1 ? 'bold ' : '') + '14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(L.n, bx + bw + 14, y + lh / 2 - 1);
      });

      // 年代箭頭
      ctx.strokeStyle = '#7c5cff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(38, by + 10); ctx.lineTo(38, by + LAYERS.length * lh - 12); ctx.stroke();
      ctx.fillStyle = '#7c5cff';
      ctx.beginPath();
      ctx.moveTo(38, by + LAYERS.length * lh - 4); ctx.lineTo(32, by + LAYERS.length * lh - 18);
      ctx.lineTo(44, by + LAYERS.length * lh - 18); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(20, by + LAYERS.length * lh / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#b3a2ff'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('越下面越老', 0, 0); ctx.restore();

      const L = LAYERS[pos - 1];
      readout.innerHTML =
        '<div class="big">' + L.n + '</div>' + L.d + '<br><br>' +
        '<b>地層的兩個關鍵原則</b>：<br>' +
        '① <b>越下面的越老</b>（先堆的在下面，後堆的蓋在上面）<br>' +
        '② <b>顆粒大小告訴你當時的水流</b>：礫石＝水很急、砂＝水中等、泥＝水很慢<br>' +
        '<span style="color:var(--muted)">所以看到山上的地層裡有<b>貝殼化石</b>，代表那裡以前是<b>海底</b>，' +
        '後來被地殼變動抬升上來——這是課本最愛問的推理題。<br>' +
        '土壤怎麼來的？<b>岩石風化成碎屑 ＋ 生物遺骸</b>混合而成（INd-Ⅲ-8）。</span>';
    }

    /* ---------- 模式 C：岩石三大類 ---------- */
    const ROCKS = {
      ig: {
        n: '火成岩', col: '#5d5148', ex: '花岡岩、安山岩、玄武岩',
        how: '<b>岩漿冷卻凝固</b>而成。',
        feat: '常看得到一顆一顆的<b>結晶礦物</b>（花岡岩上黑白相間的斑點）。' +
          '冷得慢的結晶大（花岡岩），冷得快的結晶小甚至看不到（玄武岩）。',
        use: '花岡岩堅硬美觀，用來做<b>建材、地磚、紀念碑</b>。澎湖的柱狀玄武岩就是有名的地景。'
      },
      sed: {
        n: '沉積岩', col: '#b0a189', ex: '砂岩、頁岩、石灰岩、礫岩',
        how: '碎屑或生物遺骸<b>一層一層堆積、壓實膠結</b>而成。',
        feat: '最大特徵是有<b>層次（層理）</b>，而且是<b>唯一可能含化石</b>的一類。' +
          '顆粒大小可以反推當時的環境。',
        use: '石灰岩燒製<b>水泥</b>；砂岩做建材；台灣西部丘陵大多是沉積岩。野柳女王頭就是砂岩。'
      },
      met: {
        n: '變質岩', col: '#6f7d86', ex: '大理岩、板岩、片岩',
        how: '原本的岩石受到<b>高溫、高壓</b>，性質改變而成（沒有融化成岩漿）。',
        feat: '常有<b>條紋或片狀</b>結構，摸起來比原本的岩石緻密堅硬。' +
          '石灰岩變成<b>大理岩</b>、頁岩變成<b>板岩</b>。',
        use: '大理岩做<b>裝潢石材、雕刻</b>；板岩可以剝成薄片當屋瓦（原住民石板屋）。太魯閣峽谷就是大理岩。'
      }
    };

    function drawRocks() {
      const ctx = cv.ctx;
      const R = ROCKS[rockKey];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('岩石由礦物組成。依照「怎麼形成的」分成三大類', 16, 22);

      // 岩石樣本
      const cx = 170, cy = 160, r = 96;
      ctx.beginPath();
      for (let s = 0; s <= 11; s++) {
        const a = s / 11 * Math.PI * 2;
        const rr = r * (0.86 + ((s * 41) % 7) / 24);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .82;
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = R.col; ctx.fill();
      ctx.strokeStyle = '#2f3a44'; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.clip();

      if (rockKey === 'ig') {           // 結晶斑點
        for (let i = 0; i < 90; i++) {
          const px = cx - r + (i * 47) % (r * 2), py = cy - r + (i * 83) % (r * 2);
          ctx.fillStyle = ['#e8e2d6', '#2b2b2b', '#c9a27a'][i % 3];
          ctx.beginPath();
          ctx.ellipse(px, py, 4 + (i % 3) * 2, 3 + (i % 2) * 2, i, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (rockKey === 'sed') {   // 層理
        for (let i = 0; i < 12; i++) {
          ctx.fillStyle = i % 2 ? 'rgba(90,75,55,.35)' : 'rgba(220,205,180,.30)';
          ctx.fillRect(cx - r, cy - r + i * 16, r * 2, 12);
        }
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;   // 化石
        ctx.beginPath();
        for (let s = 0; s < 5; s++) ctx.arc(cx + 20, cy + 20, 4 + s * 3, Math.PI * .1, Math.PI * .95);
        ctx.stroke();
      } else {                          // 變質：波狀條紋
        for (let i = 0; i < 14; i++) {
          ctx.strokeStyle = i % 2 ? 'rgba(240,240,240,.35)' : 'rgba(50,60,70,.45)';
          ctx.lineWidth = 7;
          ctx.beginPath();
          for (let xx = cx - r; xx <= cx + r; xx += 6) {
            const yy = cy - r + i * 15 + Math.sin((xx - cx) / 26) * 9;
            xx === cx - r ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      // 說明
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 20px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(R.n, 300, 62);
      ctx.fillStyle = '#fbbf24'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
      ctx.fillText('例：' + R.ex, 300, 96);

      readout.innerHTML =
        '<div class="big">' + R.n + '　—　' + R.how + '</div>' +
        '<b>怎麼認</b>：' + R.feat + '<br>' +
        '<b>用途與台灣的例子</b>：' + R.use + '<br>' +
        '<span style="color:var(--muted)">三類的判斷順序：先看有沒有<b>層次</b>（有 → 沉積岩），' +
        '再看有沒有<b>彎曲條紋</b>（有 → 變質岩），都沒有但看得到<b>結晶顆粒</b>（→ 火成岩）。<br>' +
        '⚠️ <b>只有沉積岩可能含化石</b>，因為另外兩類形成時的高溫高壓會把化石破壞掉。</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'river') drawRiver();
      else if (mode === 'layer') drawLayers();
      else drawRocks();
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '河流：上中下游', value: 'river' },
      { label: '地層', value: 'layer' },
      { label: '三大類岩石', value: 'rock' }
    ], function (v) {
      mode = v; pos = 1;
      posCtl.wrap.style.display = v === 'rock' ? 'none' : '';
      posCtl.input.max = v === 'river' ? 3 : 5;
      posCtl.input.value = 1; posCtl.output.textContent = '1';
      rockSeg.wrap.style.display = v === 'rock' ? '' : 'none';
      paint();
    }, mode);

    const posCtl = Kit.slider('位置', {
      min: 1, max: 3, value: 1,
      format: v => mode === 'river' ? ['上游', '中游', '下游'][v - 1] : '第 ' + v + ' 層',
      onChange: v => { pos = v; paint(); }
    });
    const rockSeg = Kit.segmented('岩石類別', Object.keys(ROCKS).map(k => ({ label: ROCKS[k].n, value: k })),
      function (v) { rockKey = v; paint(); }, rockKey);
    rockSeg.wrap.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(posCtl.wrap);
    controls.appendChild(rockSeg.wrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '一句話串起整章：<b>岩石被風化成碎屑 → 河水侵蝕搬運 → 在下游堆積 → 壓實成沉積岩 → 可能再變質</b>。' +
        '地表就是這樣一直在改變。'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '「上游的石頭大又尖，下游的小又圓，為什麼？」', why: '因為一路滾下來互相撞、被磨。這是這一單元最經典的觀察，也最容易在河邊實地驗證。' },
    { ask: '「同一條河，為什麼上游在挖、下游在堆？」', why: '看<b>水流速度</b>。水快就有力氣挖走和搬運；水慢就搬不動，只好放下來。速度是關鍵變數。' },
    { ask: '「山上的岩層裡有貝殼化石，代表什麼？」', why: '那裡以前是<b>海底</b>，後來被地殼變動抬升。台灣到處都有這種地方，是很好的推理題。' },
    { ask: '「地層哪一層最老？」', why: '<b>最下面</b>那層。先堆的在下面。這個原則簡單但很有力，可以推斷事件發生的先後。' },
    { ask: '「土壤是怎麼來的？」', why: '<b>岩石風化的碎屑 ＋ 生物遺骸</b>。土不是本來就有的，是岩石慢慢碎掉再混合腐爛的動植物。' },
    { ask: '出門撿石頭：「這顆是哪一類？有沒有層次？有沒有結晶？」', why: '河邊、海邊撿幾顆回來比對。先看層次（沉積）、再看條紋（變質）、再看結晶（火成）。' }
  ],

  pitfalls: [
    { bad: '把「風化」和「侵蝕」當同一件事。', fix: '<b>風化</b>是岩石在<b>原地</b>碎掉（熱脹冷縮、雨水、植物根）；<b>侵蝕</b>是碎屑被水或風<b>帶走</b>。先風化才有東西可以侵蝕。' },
    { bad: '以為上游只有侵蝕、下游只有堆積。', fix: '三種作用<b>到處都有</b>，只是「哪一種占優勢」不同。洪水時下游也會強烈侵蝕。' },
    { bad: '以為石頭變圓是「被水沖圓的」。', fix: '主要是石頭之間<b>互相碰撞摩擦</b>磨掉稜角，不是水直接把它磨圓。' },
    { bad: '以為三大類岩石都可能有化石。', fix: '<b>只有沉積岩</b>可能有。火成岩是岩漿凝固（高溫燒毀），變質岩經歷高溫高壓（破壞掉）。' },
    { bad: '把大理岩當成沉積岩（因為它來自石灰岩）。', fix: '看<b>現在</b>是什麼，不是看來源。石灰岩是沉積岩，變質之後的<b>大理岩是變質岩</b>。' },
    { bad: '以為地表變化很慢所以看不到。', fix: '颱風、豪雨時的土石流和河岸崩塌是<b>幾小時內</b>就能改變地形的。慢的是平時，快的是災害。' }
  ],

  quiz: function () {
    const type = Kit.pick(['river', 'river', 'layer', 'rock', 'process']);

    if (type === 'river') {
      const items = [
        { q: '河流<b>上游</b>最主要的作用是什麼？', a: '侵蝕', o: ['堆積', '搬運', '蒸發'] },
        { q: '河流<b>下游</b>最主要的作用是什麼？', a: '堆積', o: ['侵蝕', '風化', '搬運'] },
        { q: '上游的石頭通常長什麼樣子？', a: '又大又有稜有角', o: ['又小又圓', '細砂和泥', '一片一片的'] },
        { q: '下游的河床上主要是什麼？', a: '細砂和泥', o: ['大石頭', '有稜角的礫石', '岩壁'] },
        { q: '「V 形谷」是在河流的哪一段形成的？', a: '上游', o: ['中游', '下游', '出海口'] },
        { q: '「三角洲」是在哪裡形成的？', a: '出海口（下游）', o: ['上游', '山頂', '中游的彎道'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '關鍵在<b>水流速度</b>：<br>' +
          '<b>上游</b>坡陡水急 → 力氣大 → 主要<b>侵蝕</b>（挖出 V 形谷），石頭大又有稜角<br>' +
          '<b>中游</b>坡緩 → 主要<b>搬運</b>，石頭一路撞、變小變圓，形成曲流<br>' +
          '<b>下游</b>很平緩水慢 → 搬不動 → 主要<b>堆積</b>，只剩細砂和泥，形成沖積平原、三角洲'
      };
    }

    if (type === 'layer') {
      const items = [
        { q: '地層中，哪一層形成的時間<b>最早</b>？', a: '最下面那一層', o: ['最上面那一層', '中間那一層', '最厚的那一層'] },
        { q: '在山上的地層裡發現<b>貝殼化石</b>，最可能代表什麼？', a: '這裡以前是海底，後來被抬升上來', o: ['以前有人把貝殼埋在這裡', '貝殼被風吹到山上', '這裡以前下過很大的雨'] },
        { q: '地層中<b>顆粒很細的泥層</b>，代表當時是什麼環境？', a: '水流很慢（湖底或深海）', o: ['水流很急（河流上游）', '沙漠', '火山口'] },
        { q: '<b>土壤</b>主要是由什麼組成的？', a: '岩石風化的碎屑加上生物遺骸', o: ['只有岩石碎屑', '只有腐爛的植物', '從地底冒出來的泥漿'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<span style="color:var(--muted)">地層兩大原則：<br>' +
          '① <b>越下面越老</b>——先堆的在下面<br>' +
          '② <b>顆粒大小 = 當時的水流速度</b>——礫石(急) → 砂(中) → 泥(慢)<br>' +
          '課綱 INd-Ⅲ-8：土壤是「岩石風化成的碎屑<b>及生物遺骸</b>」組成的。</span>'
      };
    }

    if (type === 'rock') {
      const items = [
        { q: '<b>大理岩</b>屬於哪一類岩石？', a: '變質岩', o: ['火成岩', '沉積岩', '都不是'] },
        { q: '<b>花岡岩</b>屬於哪一類岩石？', a: '火成岩', o: ['沉積岩', '變質岩', '都不是'] },
        { q: '<b>石灰岩、砂岩</b>屬於哪一類？', a: '沉積岩', o: ['火成岩', '變質岩', '都不是'] },
        { q: '哪一類岩石<b>可能含有化石</b>？', a: '沉積岩', o: ['火成岩', '變質岩', '三類都可能'] },
        { q: '岩石有<b>一層一層的層理</b>，最可能是哪一類？', a: '沉積岩', o: ['火成岩', '變質岩', '無法判斷'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>三大類的分法（看怎麼形成的）</b>：<br>' +
          '<b>火成岩</b>——岩漿冷卻凝固。花岡岩、玄武岩、安山岩。看得到結晶顆粒。<br>' +
          '<b>沉積岩</b>——碎屑一層層堆積壓實。砂岩、頁岩、石灰岩、礫岩。有<b>層理</b>，<b>只有這類可能有化石</b>。<br>' +
          '<b>變質岩</b>——受高溫高壓改變。大理岩（來自石灰岩）、板岩（來自頁岩）。有彎曲條紋。'
      };
    }

    const opts = Kit.shuffle([
      { t: '風化 → 侵蝕 → 搬運 → 堆積', ok: true },
      { t: '侵蝕 → 風化 → 堆積 → 搬運', ok: false },
      { t: '堆積 → 搬運 → 侵蝕 → 風化', ok: false },
      { t: '搬運 → 風化 → 侵蝕 → 堆積', ok: false }
    ]);
    return {
      q: '岩石變成下游泥沙的過程，正確的<b>順序</b>是哪一個？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '<b>風化 → 侵蝕 → 搬運 → 堆積</b><br>' +
        '① <b>風化</b>：岩石在<b>原地</b>被溫差、雨水、植物根弄碎<br>' +
        '② <b>侵蝕</b>：碎屑被流水、風、波浪<b>挖走、帶離原地</b><br>' +
        '③ <b>搬運</b>：一路往下游帶，途中互相碰撞而變小、變圓<br>' +
        '④ <b>堆積</b>：水流變慢搬不動了，就沉下來堆積<br>' +
        '<span style="color:var(--warn)">⚠️ 風化和侵蝕最容易混：風化是<b>在原地碎掉</b>，侵蝕是<b>被帶走</b>。先碎才搬得走。</span>'
    };
  }
});
