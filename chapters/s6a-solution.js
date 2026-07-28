/* ============================================================
   六上 自然（康軒）第 2 單元　水溶液
   課綱 INe-Ⅲ-5「常用酸鹼物質的特性，並能使用酸鹼指示劑檢測。」
        INa-Ⅲ-3「混合物是由不同的物質所混合，可以利用適當的方法分離。」
        （四上 INe-Ⅱ-4 花卉、菜葉會因加入酸鹼而改變顏色）
   教具：選一種生活中的水溶液，選一種指示劑，滴下去看顏色變化。
   ============================================================ */

Kit.register('s6a-solution', {

  intro: '左邊選一種家裡常見的水溶液，下面選一種指示劑，按「滴入指示劑」看顏色變化。顏色會告訴你它是酸性、中性還是鹼性。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 320);

    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    /* level：1 較強酸　2 弱酸　3 中性　4 弱鹼　5 較強鹼 */
    const LIQUIDS = [
      { k: 'lemon',  n: '檸檬汁',       lv: 1, base: '#f6e27a', note: '含檸檬酸，是生活中很典型的酸性水溶液。' },
      { k: 'vinegar',n: '食用醋',       lv: 1, base: '#e8dcae', note: '含醋酸，聞得到刺鼻的酸味。' },
      { k: 'soda',   n: '汽水',         lv: 2, base: '#d8cfa8', note: '二氧化碳溶在水裡形成碳酸，所以是弱酸性。' },
      { k: 'water',  n: '清水',         lv: 3, base: '#cfe6f5', note: '中性。是判斷其他液體的基準。' },
      { k: 'salt',   n: '食鹽水',       lv: 3, base: '#dcebf3', note: '食鹽溶在水裡，仍然是中性。' },
      { k: 'baking', n: '小蘇打水',     lv: 4, base: '#e4eee4', note: '常拿來清潔和除臭，是弱鹼性。' },
      { k: 'soap',   n: '肥皂水',       lv: 4, base: '#e6ecf0', note: '摸起來滑滑的，這是鹼性溶液的共同特徵。' },
      { k: 'lime',   n: '石灰水',       lv: 5, base: '#eef3ee', note: '澄清石灰水，通入二氧化碳會變混濁，是常用的檢測試劑。' },
      { k: 'clean',  n: '廚房清潔劑',   lv: 5, base: '#dff0e8', note: '鹼性可以分解油汙。⚠️ 有腐蝕性，實驗時務必戴手套。' }
    ];

    const INDICATORS = {
      cabbage: {
        n: '紫甘藍菜汁',
        colors: ['#e0455e', '#e88ab0', '#9b6fd6', '#4fa8c8', '#8dc63f'],
        words: ['紅色', '粉紅色', '紫色', '藍綠色', '黃綠色'],
        how: '把紫甘藍菜（紫高麗菜）切碎泡熱水，紫紅色的汁就是天然指示劑。這是課本最常做的自製指示劑實驗。'
      },
      litmus: {
        n: '石蕊試紙',
        colors: ['#e0455e', '#e0455e', '#b57ad0', '#4a7fd6', '#4a7fd6'],
        words: ['藍色石蕊變紅', '藍色石蕊變紅', '兩種都不變色', '紅色石蕊變藍', '紅色石蕊變藍'],
        how: '口訣：「酸使藍變紅，鹼使紅變藍，中性都不變。」石蕊試紙只能分辨酸鹼，看不出強弱。'
      },
      phenol: {
        n: '酚酞',
        colors: ['#e9eef7', '#e9eef7', '#e9eef7', '#f19bc4', '#e0459a'],
        words: ['無色', '無色', '無色', '粉紅色', '桃紅色'],
        how: '酚酞只對鹼性有反應：遇到鹼變粉紅，遇到酸和中性都是無色。適合專門用來「找出鹼性」。'
      },
      universal: {
        n: '廣用試紙',
        colors: ['#e34a33', '#f3a65a', '#8dc63f', '#3f9ad6', '#5b3fa0'],
        words: ['紅（強酸）', '橘（弱酸）', '綠（中性）', '藍（弱鹼）', '紫（強鹼）'],
        how: '廣用試紙可以看出<b>酸鹼的強弱</b>，顏色從紅→橘→綠→藍→紫。'
      }
    };

    let liq = LIQUIDS[0], ind = 'cabbage', dropped = false, anim = 0;

    function levelName(lv) {
      return ['', '酸性（較強）', '酸性（較弱）', '中性', '鹼性（較弱）', '鹼性（較強）'][lv];
    }

    function mixColor(c1, c2, k) {
      function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
      const a = hex(c1), b = hex(c2);
      const r = a.map((v, i) => Math.round(v + (b[i] - v) * k));
      return 'rgb(' + r.join(',') + ')';
    }

    function paint() {
      cv.clear('#0e1726');
      const ctx = cv.ctx;
      const I = INDICATORS[ind];
      const target = I.colors[liq.lv - 1];
      const shown = dropped ? mixColor(liq.base, target, Math.min(anim, 1)) : liq.base;

      /* --- 燒杯 --- */
      const bx = 90, by = 70, bw = 130, bh = 170;
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
      ctx.stroke();
      // 液體
      const lvTop = by + 48;
      ctx.fillStyle = shown;
      ctx.fillRect(bx + 3, lvTop, bw - 6, by + bh - lvTop - 2);
      ctx.fillStyle = 'rgba(255,255,255,.15)';
      ctx.fillRect(bx + 3, lvTop, bw - 6, 8);
      // 刻度
      ctx.strokeStyle = 'rgba(159,180,221,.5)'; ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = by + bh - i * 40;
        ctx.beginPath(); ctx.moveTo(bx + bw - 26, y); ctx.lineTo(bx + bw - 4, y); ctx.stroke();
      }
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(liq.n, bx + bw / 2, by + bh + 26);

      /* --- 滴管 --- */
      const dx = bx + bw / 2;
      const dyTop = 16, dyBot = dropped ? 52 : 46;
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(dx - 7, dyTop); ctx.lineTo(dx - 7, dyBot);
      ctx.lineTo(dx, dyBot + 10); ctx.lineTo(dx + 7, dyBot); ctx.lineTo(dx + 7, dyTop);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = target; ctx.globalAlpha = .8;
      ctx.fill(); ctx.globalAlpha = 1;
      // 落下的液滴
      if (dropped && anim < 1) {
        const y = dyBot + 14 + (lvTop - dyBot - 14) * Math.min(anim * 2, 1);
        ctx.fillStyle = target;
        ctx.beginPath(); ctx.ellipse(dx, y, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(I.n, dx + 14, 30);

      /* --- 右側：指示劑對照表 --- */
      const tx = 290, ty = 66, cw = 60, ch = 46;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(I.n + '　顏色對照表', tx, ty - 12);
      const heads = ['較強酸', '弱酸', '中性', '弱鹼', '較強鹼'];
      I.colors.forEach((c, i) => {
        const x = tx + i * cw;
        ctx.fillStyle = c;
        ctx.fillRect(x, ty, cw - 5, ch);
        if (i === liq.lv - 1 && dropped) {
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
          ctx.strokeRect(x - 2, ty - 2, cw - 1, ch + 4);
        }
        ctx.fillStyle = '#93a3c4'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(heads[i], x + (cw - 5) / 2, ty + ch + 16);
      });

      /* --- 右側：酸鹼刻度尺 --- */
      const sy = 190;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('這一杯落在哪裡？', tx, sy - 10);
      const sw = 5 * cw - 5;
      const g = ctx.createLinearGradient(tx, 0, tx + sw, 0);
      g.addColorStop(0, '#e34a33'); g.addColorStop(.5, '#8dc63f'); g.addColorStop(1, '#5b3fa0');
      ctx.fillStyle = g; ctx.fillRect(tx, sy, sw, 16);
      ctx.fillStyle = '#e8eefc'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.fillText('酸性', tx, sy + 34);
      ctx.textAlign = 'center'; ctx.fillText('中性', tx + sw / 2, sy + 34);
      ctx.textAlign = 'right'; ctx.fillText('鹼性', tx + sw, sy + 34);
      const px = tx + sw * (liq.lv - 1) / 4;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(px, sy - 4); ctx.lineTo(px - 7, sy - 16); ctx.lineTo(px + 7, sy - 16);
      ctx.closePath(); ctx.fill();

      /* --- 說明 --- */
      readout.innerHTML =
        '<div class="big">' + liq.n + ' ＋ ' + I.n + ' →　<b>' + I.words[liq.lv - 1] + '</b></div>' +
        '<b>' + liq.n + '</b> 是 <b>' + levelName(liq.lv) + '</b>。' + liq.note + '<br>' +
        '<b>' + I.n + '</b>：' + I.how + '<br>' +
        // 試紙類是「把紙浸進去」，液體本身不會變色。畫面用液體顏色示意，這裡要講清楚。
        ((ind === 'litmus' || ind === 'universal')
          ? '<span style="color:var(--warn)">⚠️ 實際操作時是把<b>試紙浸進液體</b>，變色的是<b>試紙</b>，液體本身不會變色。' +
            '上面的杯子用顏色示意，是為了讓你一眼看到結果。（紫甘藍菜汁和酚酞則是直接滴進液體裡，液體真的會變色。）</span><br>'
          : '') +
        '<span style="color:var(--muted)">' +
        (liq.lv <= 2 ? '酸性水溶液的共同特徵：常有酸味（<b>但實驗中絕對不可以試吃</b>）、能使藍色石蕊試紙變紅。'
          : liq.lv === 3 ? '中性水溶液不會讓石蕊試紙變色，紫甘藍汁保持原本的紫色。'
            : '鹼性水溶液的共同特徵：摸起來滑滑的、能使紅色石蕊試紙變藍、常用來去除油汙。') +
        '</span>';
    }

    /* 滴入動畫 */
    let raf = null;
    function drop() {
      dropped = true; anim = 0;
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      (function step(now) {
        anim = Math.min((now - t0) / 900, 1);
        paint();
        if (anim < 1) raf = requestAnimationFrame(step);
      })(t0);
    }

    const liqSeg = Kit.segmented('水溶液', LIQUIDS.map(l => ({ label: l.n, value: l.k })),
      function (v) { liq = LIQUIDS.find(l => l.k === v); dropped = false; anim = 0; paint(); }, liq.k);

    const indSeg = Kit.segmented('指示劑', Object.keys(INDICATORS).map(k => ({ label: INDICATORS[k].n, value: k })),
      function (v) { ind = v; dropped = false; anim = 0; paint(); }, ind);

    controls.appendChild(liqSeg.wrap);
    controls.appendChild(indSeg.wrap);
    controls.appendChild(Kit.button('💧 滴入指示劑', drop, 'primary'));
    controls.appendChild(Kit.button('沖乾淨重來', function () { dropped = false; anim = 0; paint(); }));

    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '⚠️ 在家如果真的要做，只用<b>紫甘藍菜汁</b>配<b>檸檬汁、醋、小蘇打水、肥皂水</b>就好，安全又清楚。' +
        '<b>清潔劑和石灰水有腐蝕性</b>，請大人操作並戴手套；<b>任何實驗液體都不可以試吃或聞太近</b>。'
    }));

    paint();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '先問「你覺得檸檬汁是酸性還是鹼性？為什麼？」再滴。', why: '先猜再驗證。檸檬酸酸的，孩子多半猜得到；接著問「肥皂水呢？」——這個就猜不到了，需要靠指示劑。' },
    { ask: '「為什麼要用指示劑？直接嚐一口不就知道了？」', why: '因為<b>很多液體不能嚐</b>（清潔劑、石灰水會傷人）。科學方法就是要在不冒險的情況下得到答案。這一題很重要，順便建立實驗安全觀念。' },
    { ask: '把指示劑換成「酚酞」，問「檸檬汁和清水看起來一樣，這樣分得出來嗎？」', why: '分不出來。酚酞只對鹼性有反應。讓孩子理解<b>不同指示劑能回答的問題不一樣</b>，這是很棒的科學思考。' },
    { ask: '「哪一種指示劑可以看出酸鹼的<b>強弱</b>？」', why: '廣用試紙。石蕊試紙只能分酸／鹼／中性，紫甘藍汁可以看出大概的強弱，廣用試紙最清楚。' },
    { ask: '週末一起做：切紫甘藍泡熱水，倒進 4 個杯子分別加醋、檸檬汁、小蘇打水、肥皂水。', why: '這是這一單元最值得動手的實驗，材料超市就買得到，顏色變化很戲劇化。做完讓孩子畫下來。' }
  ],

  pitfalls: [
    { bad: '以為「指示劑會把液體變成酸性或鹼性」。', fix: '指示劑只是<b>顯示</b>原本的酸鹼性，不會改變它。就像溫度計不會讓水變熱。' },
    { bad: '記反了：「酸使紅變藍」。', fix: '口訣：<b>酸使藍變紅</b>，鹼使紅變藍。可以連想「酸→ㄙ→藍色石蕊試紙輸了變紅」，或直接多操作幾次教具。', src: 'INe-Ⅲ-5「能使用酸鹼指示劑檢測」' },
    { bad: '認為酸性一定危險、鹼性一定安全（或相反）。', fix: '危不危險看<b>濃度</b>不看酸鹼。檸檬汁是酸的但能喝，廚房清潔劑是鹼的卻會灼傷皮膚。' },
    { bad: '在家實驗時試嚐或直接用鼻子湊近聞。', fix: '一律禁止。要聞氣味的正確做法是<b>用手把氣味搧向鼻子</b>，而且只針對食用等級的液體。' },
    { bad: '把「食鹽水」當成酸性，因為「鹽是從酸來的」。', fix: '食鹽水是<b>中性</b>。溶解不代表會變酸鹼，可以用教具直接驗證。' }
  ],

  quiz: function () {
    const type = Kit.pick(['litmus', 'classify', 'indicator', 'safety']);

    if (type === 'litmus') {
      const acid = Math.random() < .5;
      const opts = Kit.shuffle([
        '藍色石蕊試紙變紅色', '紅色石蕊試紙變藍色', '兩種試紙都不變色', '兩種試紙都變成綠色'
      ]);
      const ans = acid ? '藍色石蕊試紙變紅色' : '紅色石蕊試紙變藍色';
      return {
        q: '把石蕊試紙放進<b>' + (acid ? '檸檬汁（酸性）' : '肥皂水（鹼性）') + '</b>裡，會發生什麼事？',
        choices: opts, answer: opts.indexOf(ans),
        steps: '口訣：<b>酸使藍變紅，鹼使紅變藍，中性都不變。</b><br>' +
          (acid ? '檸檬汁是酸性 → 藍色石蕊試紙變<b>紅</b>色。' : '肥皂水是鹼性 → 紅色石蕊試紙變<b>藍</b>色。')
      };
    }

    if (type === 'classify') {
      const items = [
        { n: '檸檬汁', c: '酸性' }, { n: '食用醋', c: '酸性' }, { n: '汽水', c: '酸性' },
        { n: '清水', c: '中性' }, { n: '食鹽水', c: '中性' },
        { n: '小蘇打水', c: '鹼性' }, { n: '肥皂水', c: '鹼性' }, { n: '石灰水', c: '鹼性' }
      ];
      const it = Kit.pick(items);
      const opts = ['酸性', '中性', '鹼性'];
      return {
        q: '<b>' + it.n + '</b> 是酸性、中性還是鹼性？',
        choices: opts, answer: opts.indexOf(it.c),
        steps: '<b>' + it.n + ' → ' + it.c + '</b><br>' +
          '常見分類：<br>酸性——檸檬汁、醋、汽水<br>中性——清水、食鹽水、糖水<br>鹼性——小蘇打水、肥皂水、石灰水、清潔劑<br>' +
          '（鹼性溶液摸起來<b>滑滑的</b>，這是很好用的判斷線索。）'
      };
    }

    if (type === 'indicator') {
      const opts = Kit.shuffle([
        { t: '廣用試紙', ok: true }, { t: '石蕊試紙', ok: false },
        { t: '酚酞', ok: false }, { t: '清水', ok: false }
      ]);
      return {
        q: '想知道一杯水溶液「有多酸」（酸鹼的<b>強弱</b>），用哪一種最合適？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '<b>廣用試紙</b>的顏色是連續變化的（紅→橘→綠→藍→紫），可以看出強弱。<br>' +
          '石蕊試紙只能回答「是酸還是鹼」；酚酞只能回答「是不是鹼」；清水不是指示劑。'
      };
    }

    const opts = Kit.shuffle([
      { t: '用手搧一點氣味到鼻子附近', ok: true },
      { t: '把鼻子湊到瓶口用力吸', ok: false },
      { t: '倒一點在手上搓一搓再聞', ok: false },
      { t: '用舌頭沾一點嚐嚐看', ok: false }
    ]);
    return {
      q: '做水溶液實驗時，如果需要聞氣味，正確的做法是什麼？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '正確做法是<b>用手把氣味搧向鼻子</b>，而且只在必要時做。<br>' +
        '❌ 直接湊近吸——刺激性氣體會傷害呼吸道<br>' +
        '❌ 倒在手上——鹼性溶液會灼傷皮膚<br>' +
        '❌ 用嚐的——<b>任何實驗藥品都絕對不可以入口</b>'
    };
  }
});
