/* ============================================================
   教具 chi5b-u1 旅人筆記　　chi5b-u2 與愛相遇
        chi5b-u3 生活與學習　chi5b-u4 精彩故事集
   翰林 115：五下（第十冊）第壹～肆單元，四個統整活動的語文能力

   ⚠️ 課文是出版社的著作，這裡<b>一句都不引用</b>。
      所有例句、短文、練習題都是為了這個教具另外寫的。
      生字與語詞取自教育部教育百科「生字詞彙表」（翰林版五年級下學期），
      只用字和詞本身，不用課文內容。
      〈草船借箭〉〈三個問題〉的故事本身年代久遠，但課本的<b>文字</b>是
      出版社的，所以下面提到情節時一律用自己的話講，不引用任何句子。
      詩詞一律使用年代久遠、無著作權疑慮的唐詩。
   ============================================================ */

(function () {

  const FONT = '"Microsoft JhengHei", "PingFang TC", sans-serif';
  const C = {
    bg: '#0e1726', card: '#16233a', line: '#2b3f63',
    text: '#e8eefc', muted: '#93a3c4', accent: '#4da3ff', purple: '#7c5cff',
    ok: '#34d399', no: '#fb7185', warn: '#fbbf24', chi: '#f472b6'
  };

  const pick = Kit.pick, shuffle = Kit.shuffle, randInt = Kit.randInt;

  function pick4(right, wrongs) {
    const seen = {}; seen[right] = 1;
    const uniq = [];
    shuffle(wrongs).forEach(function (x) { if (!seen[x]) { seen[x] = 1; uniq.push(x); } });
    const all = shuffle([right].concat(uniq.slice(0, 3)));
    return { choices: all, answer: all.indexOf(right) };
  }
  function shuffled(items) {
    const a = shuffle(items);
    return { choices: a.map(function (x) { return x.t; }), answer: a.findIndex(function (x) { return x.ok; }) };
  }

  function clear(cv) { const ctx = cv.ctx; cv.clear(C.bg); ctx.font = '14px ' + FONT; return ctx; }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function title(ctx, x, y, text, color) {
    ctx.save();
    ctx.fillStyle = color || C.chi; ctx.font = 'bold 16px ' + FONT;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(text, x, y); ctx.restore();
  }
  function panel(ctx, x, y, w) {
    let cy = y;
    return function (text, color, size, gap) {
      text = String(text).replace(/<[^>]+>/g, '');
      size = size || 14;
      ctx.save();
      ctx.fillStyle = color || C.text; ctx.font = size + 'px ' + FONT;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      let line = '';
      const push = function () { if (line) { ctx.fillText(line, x, cy); cy += size + 6; line = ''; } };
      for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === '\n') { push(); continue; }
        if (ctx.measureText(line + c).width > w && line) {
          if ('，。、；：？！」）'.indexOf(c) >= 0) { ctx.fillText(line + c, x, cy); cy += size + 6; line = ''; continue; }
          push();
        }
        line += c;
      }
      push(); cy += (gap || 0); ctx.restore();
      return cy;
    };
  }
  function glyphBox(ctx, x, y, size, ch, color, label) {
    ctx.save();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, size, size, 6); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = '#22304d'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y); ctx.lineTo(x + size / 2, y + size);
    ctx.moveTo(x, y + size / 2); ctx.lineTo(x + size, y + size / 2);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = color || C.text;
    ctx.font = Math.round(size * 0.66) + 'px ' + FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, x + size / 2, y + size / 2 + 2);
    if (label) {
      ctx.fillStyle = C.muted; ctx.font = '12px ' + FONT;
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + size / 2, y + size + 6);
    }
    ctx.restore();
  }


  /* ============================================================
     資料：五下生字的部件（教育部教育百科「生字詞彙表」翰林版五下）
     只收「部首明顯、另一半也是常見獨立字」的字。
     rp 是部首在字裡的位置，多數可由結構推出，少數要個別指定。
     ============================================================ */
  const GLYPHS = [
    { c: '澎', r: '水', p: '彭', s: '左右', rn: '氵（水）', rm: '和水有關', L: 1 },
    { c: '瀏', r: '水', p: '劉', s: '左右', rn: '氵（水）', rm: '和水有關', L: 8 },
    { c: '瀑', r: '水', p: '暴', s: '左右', rn: '氵（水）', rm: '和水有關', L: 10 },
    { c: '澄', r: '水', p: '登', s: '左右', rn: '氵（水）', rm: '和水有關', L: 8 },
    { c: '泛', r: '水', p: '乏', s: '左右', rn: '氵（水）', rm: '和水有關', L: 8 },
    { c: '渾', r: '水', p: '軍', s: '左右', rn: '氵（水）', rm: '和水有關', L: 9 },
    { c: '喧', r: '口', p: '宣', s: '左右', rn: '口', rm: '和嘴巴、聲音有關', L: 2 },
    { c: '呻', r: '口', p: '申', s: '左右', rn: '口', rm: '和嘴巴、聲音有關', L: 12 },
    { c: '吶', r: '口', p: '內', s: '左右', rn: '口', rm: '和嘴巴、聲音有關', L: 11 },
    { c: '喻', r: '口', p: '俞', s: '左右', rn: '口', rm: '和嘴巴、說話有關', L: 1 },
    { c: '咐', r: '口', p: '付', s: '左右', rn: '口', rm: '和嘴巴、說話有關', L: 5 },
    { c: '囑', r: '口', p: '屬', s: '左右', rn: '口', rm: '和嘴巴、說話有關', L: 5 },
    { c: '哲', r: '口', p: '折', s: '上下', rn: '口', rm: '和嘴巴、說話有關', L: 5, rp: '下' },
    { c: '嗅', r: '口', p: '臭', s: '左右', rn: '口', rm: '和嘴巴、鼻子有關', L: 6 },
    { c: '謂', r: '言', p: '胃', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 8 },
    { c: '詳', r: '言', p: '羊', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 8 },
    { c: '詼', r: '言', p: '灰', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 8 },
    { c: '誤', r: '言', p: '吳', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 8 },
    { c: '訓', r: '言', p: '川', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 9 },
    { c: '詐', r: '言', p: '乍', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 11 },
    { c: '諒', r: '言', p: '京', s: '左右', rn: '訁（言）', rm: '和說話有關', L: 12 },
    { c: '誓', r: '言', p: '折', s: '上下', rn: '訁（言）', rm: '和說話有關', L: 12, rp: '下' },
    { c: '掠', r: '手', p: '京', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 2 },
    { c: '撼', r: '手', p: '感', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 4 },
    { c: '拾', r: '手', p: '合', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 3 },
    { c: '拘', r: '手', p: '句', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 3 },
    { c: '擋', r: '手', p: '當', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 11 },
    { c: '悟', r: '心', p: '吾', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 5 },
    { c: '慎', r: '心', p: '真', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 5 },
    { c: '憾', r: '心', p: '感', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 7 },
    { c: '懈', r: '心', p: '解', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 9 },
    { c: '恰', r: '心', p: '合', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 9 },
    { c: '恍', r: '心', p: '光', s: '左右', rn: '忄（心）', rm: '和心情、想法有關', L: 11 },
    { c: '慈', r: '心', p: '茲', s: '上下', rn: '心', rm: '和心情、想法有關', L: 4, rp: '下' },
    { c: '綻', r: '糸', p: '定', s: '左右', rn: '糹（糸）', rm: '和絲線、布有關', L: 2 },
    { c: '縷', r: '糸', p: '婁', s: '左右', rn: '糹（糸）', rm: '和絲線、布有關', L: 7 },
    { c: '編', r: '糸', p: '扁', s: '左右', rn: '糹（糸）', rm: '和絲線、布有關', L: 7 },
    { c: '繪', r: '糸', p: '會', s: '左右', rn: '糹（糸）', rm: '和絲線、布有關', L: 7 },
    { c: '媒', r: '女', p: '某', s: '左右', rn: '女', rm: '和女性、人的關係有關', L: 8 },
    { c: '婉', r: '女', p: '宛', s: '左右', rn: '女', rm: '和女性、人的關係有關', L: 9 },
    { c: '妨', r: '女', p: '方', s: '左右', rn: '女', rm: '和女性、人的關係有關', L: 8 },
    { c: '婦', r: '女', p: '帚', s: '左右', rn: '女', rm: '和女性、人的關係有關', L: 8 },
    { c: '偏', r: '人', p: '扁', s: '左右', rn: '亻（人）', rm: '和人有關', L: 4 },
    { c: '價', r: '人', p: '賈', s: '左右', rn: '亻（人）', rm: '和人有關', L: 8 },
    { c: '仗', r: '人', p: '丈', s: '左右', rn: '亻（人）', rm: '和人有關', L: 9 },
    { c: '侍', r: '人', p: '寺', s: '左右', rn: '亻（人）', rm: '和人有關', L: 11 },
    { c: '佳', r: '人', p: '圭', s: '左右', rn: '亻（人）', rm: '和人有關', L: 12 },
    { c: '仇', r: '人', p: '九', s: '左右', rn: '亻（人）', rm: '和人有關', L: 12 },
    { c: '刪', r: '刀', p: '冊', s: '左右', rn: '刂（刀）', rm: '和刀、切割有關', L: 8 , rp: '右' },
    { c: '劑', r: '刀', p: '齊', s: '左右', rn: '刂（刀）', rm: '和刀、切割有關', L: 10 , rp: '右' },
    { c: '略', r: '田', p: '各', s: '左右', rn: '田', rm: '和田地有關', L: 8 },
    { c: '瞄', r: '目', p: '苗', s: '左右', rn: '目', rm: '和眼睛、看有關', L: 5 },
    { c: '督', r: '目', p: '叔', s: '上下', rn: '目', rm: '和眼睛、看有關', L: 11, rp: '下' },
    { c: '膀', r: '肉', p: '旁', s: '左右', rn: '月（肉）', rm: '和身體有關', L: 2 },
    { c: '股', r: '肉', p: '殳', s: '左右', rn: '月（肉）', rm: '和身體有關', L: 6 },
    { c: '腕', r: '肉', p: '宛', s: '左右', rn: '月（肉）', rm: '和身體有關', L: 10 },
    { c: '宇', r: '宀', p: '于', s: '上下', rn: '宀', rm: '和房屋有關', L: 3 },
    { c: '宙', r: '宀', p: '由', s: '上下', rn: '宀', rm: '和房屋有關', L: 3 },
    { c: '宮', r: '宀', p: '呂', s: '上下', rn: '宀', rm: '和房屋有關', L: 12 },
    { c: '廟', r: '广', p: '朝', s: '半包圍', rn: '广', rm: '和房屋有關', L: 3, rp: '左上' },
    { c: '廓', r: '广', p: '郭', s: '半包圍', rn: '广', rm: '和房屋有關', L: 10, rp: '左上' },
    { c: '庫', r: '广', p: '車', s: '半包圍', rn: '广', rm: '和房屋有關', L: 11, rp: '左上' },
    { c: '避', r: '辵', p: '辟', s: '半包圍', rn: '辶（辵）', rm: '和行走、移動有關', L: 12 },
    { c: '邏', r: '辵', p: '羅', s: '半包圍', rn: '辶（辵）', rm: '和行走、移動有關', L: 10 },
    { c: '震', r: '雨', p: '辰', s: '上下', rn: '雨', rm: '和天氣有關', L: 2 },
    { c: '露', r: '雨', p: '路', s: '上下', rn: '雨', rm: '和天氣有關', L: 10 },
    { c: '椏', r: '木', p: '亞', s: '左右', rn: '木', rm: '和樹木、木頭有關', L: 7 },
    { c: '杜', r: '木', p: '土', s: '左右', rn: '木', rm: '和樹木、木頭有關', L: 3 },
    { c: '檻', r: '木', p: '監', s: '左右', rn: '木', rm: '和樹木、木頭有關', L: 12 },
    { c: '翅', r: '羽', p: '支', s: '左右', rn: '羽', rm: '和翅膀、飛有關', L: 2 , rp: '右' },
    { c: '鏟', r: '金', p: '產', s: '左右', rn: '釒（金）', rm: '和金屬有關', L: 12 },
    { c: '錶', r: '金', p: '表', s: '左右', rn: '釒（金）', rm: '和金屬有關', L: 5 },
    { c: '黝', r: '黑', p: '幼', s: '左右', rn: '黑', rm: '和黑色有關', L: 10 },
    { c: '帳', r: '巾', p: '長', s: '左右', rn: '巾', rm: '和布有關', L: 11 },
    { c: '財', r: '貝', p: '才', s: '左右', rn: '貝', rm: '和錢財有關', L: 12 },
    { c: '酬', r: '酉', p: '州', s: '左右', rn: '酉', rm: '和酒、器皿有關', L: 11 },
    { c: '茅', r: '艸', p: '矛', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 12 },
    { c: '勵', r: '力', p: '厲', s: '左右', rn: '力', rm: '和力氣有關', L: 9, rp: '右' },
    { c: '猛', r: '犬', p: '孟', s: '左右', rn: '犭（犬）', rm: '和動物有關', L: 6 },
    { c: '礙', r: '石', p: '疑', s: '左右', rn: '石', rm: '和石頭有關', L: 5 },
    { c: '裕', r: '衣', p: '谷', s: '左右', rn: '衤（衣）', rm: '和衣服有關', L: 5 },
    { c: '暫', r: '日', p: '斬', s: '上下', rn: '日', rm: '和時間、太陽有關', L: 6, rp: '下' },
    { c: '篇', r: '竹', p: '扁', s: '上下', rn: '竹', rm: '和竹子做的東西有關', L: 8 }
  ];

  function radPos(g) {
    const rp = g.rp || (g.s === '上下' ? '上' : g.s === '左右' ? '左' : '左下');
    return { '上': '在上面', '下': '在下面', '左': '在左邊', '右': '在右邊',
             '左上': '在左上角包住', '左下': '在左下角包住' }[rp];
  }
  const BY_RADICAL = (function () {
    const m = {};
    GLYPHS.forEach(function (g) { (m[g.r] = m[g.r] || []).push(g); });
    return m;
  })();
  const MULTI_RADICALS = Object.keys(BY_RADICAL).filter(function (k) { return BY_RADICAL[k].length >= 2; });


  /* ============================================================
     第壹單元　旅人筆記
     統整活動一：遊記的寫法、物質／社群／精神文化、朗讀
     ============================================================ */

  const TRAVEL_ORDER = [
    {
      n: '時間順序', d: '照著「先發生什麼、再發生什麼」寫下去。',
      w: '適合寫一整天的行程，讀的人跟著你一路走。',
      e: ['天剛亮出發，車窗外還是暗的。', '中午抵達，先找了間店坐下來。', '傍晚回頭看，那條路已經在雲下面了。']
    },
    {
      n: '空間順序', d: '照著「從遠到近、從外到內」或「由上而下」寫。',
      w: '適合寫一個地方的樣子，讀的人像是眼睛在移動。',
      e: ['遠遠望過去，是一整片墨綠色的山。', '走近才看見山腳下有一排矮房子。', '推開門，屋裡只有一張桌子和一盞燈。']
    },
    {
      n: '感受順序', d: '照著「本來以為 → 實際看到 → 後來想到」寫。',
      w: '適合寫心情的轉變，是遊記最容易寫出深度的一種。',
      e: ['出發前我以為只是去看一塊石頭。', '站到底下才發現要抬頭很久才看得到頂。', '回程時我一直在想，它站在那裡多久了。']
    }
  ];

  const CULTURE_LAYERS = [
    { n: '物質文化', d: '看得到、摸得到的東西：食物、衣服、建築、工具。', e: ['廟宇的屋頂', '在地的小吃', '老街的房子'] },
    { n: '社群文化', d: '人和人之間的規矩與組織：家族、節慶、市場、學校。', e: ['廟會的分工', '早市的叫賣', '鄰里的守望相助'] },
    { n: '精神文化', d: '看不見的想法與信仰：宗教、價值觀、故事、歌謠。', e: ['對山的敬畏', '在地的傳說', '祈福的方式'] }
  ];

  Kit.register('chi5b-u1', {

    intro: '出去玩回來要寫遊記，最難的是「從哪裡開始寫」。切換三個模式：<b>遊記</b>看三種安排順序的方法，<b>文化三層</b>練習把看到的東西分層，<b>部件</b>把五下的生字依相同部件歸類。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'travel', ti = 0, li = 0, ri = 0;

      function paintTravel() {
        const ctx = clear(cv);
        const t = TRAVEL_ORDER[ti];
        title(ctx, 24, 16, '遊記的三種寫法：' + t.n);
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 50, 572, 66, 10); ctx.fill();
        ctx.restore();
        const w0 = panel(ctx, 42, 64, 536);
        w0(t.d, C.text, 15, 4);
        w0(t.w, C.muted, 13, 0);

        let y = 132;
        t.e.forEach(function (line, i) {
          ctx.save();
          ctx.fillStyle = C.card; roundRect(ctx, 24, y, 572, 52, 8); ctx.fill();
          ctx.fillStyle = C.warn; roundRect(ctx, 24, y, 7, 52, 3); ctx.fill();
          ctx.fillStyle = C.warn; ctx.font = 'bold 13px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('第 ' + (i + 1) + ' 段', 46, y + 8);
          ctx.restore();
          panel(ctx, 110, y + 16, 470)(line, C.text, 14, 0);
          y += 58;
        });

        panel(ctx, 24, y + 8, 572)(
          '三種順序可以混用，但<b>一篇裡面要有一條主線</b>，讀的人才不會迷路。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + t.n + '</b>　<span class="muted">第 ' + (ti + 1) + ' / ' + TRAVEL_ORDER.length + ' 種</span>';
      }

      function paintLayer() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '到一個地方，可以看的三層東西');
        let y = 52;
        const cols = [C.warn, C.accent, C.purple];
        CULTURE_LAYERS.forEach(function (L, i) {
          const on = i <= li;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 100, 10); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#2b3f63';
          roundRect(ctx, 24, y, 8, 100, 4); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#3a4b6b';
          ctx.font = 'bold 16px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(L.n, 48, y + 12);
          ctx.restore();
          if (on) {
            panel(ctx, 48, y + 40, 520)(L.d, C.text, 13, 0);
            ctx.save();
            ctx.fillStyle = C.muted; ctx.font = '12px ' + FONT;
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('例：' + L.e.join('、'), 48, y + 76);
            ctx.restore();
          }
          y += 108;
        });
        panel(ctx, 24, y + 6, 572)(
          '遊記只寫「好好玩」很空。<b>三層各寫一點</b>，文章立刻有厚度。', C.muted, 13, 0);
        readout.innerHTML = '已顯示 <b>' + (li + 1) + '</b> / 3 層　<b>' + CULTURE_LAYERS[li].n + '</b>';
      }

      function paintRad() {
        const ctx = clear(cv);
        const r = MULTI_RADICALS[ri];
        const list = BY_RADICAL[r];
        title(ctx, 24, 16, '部件歸納：部首「' + list[0].rn + '」的字');

        const S = 62;
        let x = 30, y = 52;
        list.slice(0, 14).forEach(function (g) {
          glyphBox(ctx, x, y, S, g.c, C.text, null);
          ctx.save();
          ctx.fillStyle = C.muted; ctx.font = '11px ' + FONT;
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('第' + g.L + '課', x + S / 2, y + S + 4);
          ctx.restore();
          x += S + 18;
          if (x + S > 600) { x = 30; y += S + 30; }
        });

        const w = panel(ctx, 24, y + S + 34, 572);
        w('這些字都有「' + list[0].r + '」，所以意思都' + (list[0].rm || '在同一個範圍') + '。', C.warn, 15, 8);
        w('把同部件的字擺在一起記，比一個一個背快得多，這就是<b>部件歸納</b>。', C.text, 14, 6);
        w('共 ' + list.length + ' 個字：' + list.map(function (g) { return g.c; }).join('、'), C.muted, 13, 0);

        readout.innerHTML = '部首 <b>' + list[0].rn + '</b>　共 <b>' + list.length + '</b> 個字　' +
          '<span class="muted">第 ' + (ri + 1) + ' / ' + MULTI_RADICALS.length + ' 組</span>';
      }

      function paint() {
        if (mode === 'travel') paintTravel();
        else if (mode === 'layer') paintLayer();
        else paintRad();
      }

      const seg = Kit.segmented('模式', [
        { label: '遊記', value: 'travel' }, { label: '文化三層', value: 'layer' }, { label: '部件', value: 'rad' }
      ], function (v) { mode = v; paint(); }, 'travel');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(Kit.button('◀ 上一個', function () {
        if (mode === 'travel') ti = (ti - 1 + TRAVEL_ORDER.length) % TRAVEL_ORDER.length;
        else if (mode === 'layer') li = (li - 1 + 3) % 3;
        else ri = (ri - 1 + MULTI_RADICALS.length) % MULTI_RADICALS.length;
        paint();
      }));
      row.appendChild(Kit.button('下一個 ▶', function () {
        if (mode === 'travel') ti = (ti + 1) % TRAVEL_ORDER.length;
        else if (mode === 'layer') li = (li + 1) % 3;
        else ri = (ri + 1) % MULTI_RADICALS.length;
        paint();
      }));

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      paint();
    },

    parentGuide: [
      { ask: '「你這篇遊記想照時間寫，還是照位置寫？」', why: '寫之前先決定一條主線。這一問就能解決大部分「不知道怎麼開始」的問題。' },
      { ask: '「你去的那個地方，有什麼是摸得到的？」', why: '物質文化。從具體的東西開始，比叫他「寫感受」容易一百倍。' },
      { ask: '「那裡的人都在做什麼？」', why: '社群文化。看人怎麼組織起來，遊記就不會只有風景。' },
      { ask: '「他們為什麼要這樣做？」', why: '精神文化。問到這一層，文章就有深度了。' },
      { ask: '「本來以為會怎樣？結果呢？」', why: '感受順序的核心。有落差才有內容，這是遊記最好寫又最容易得分的一招。' },
      { ask: '「這幾個字有什麼一樣的地方？」', why: '部件歸納。同部首的字擺一起看，孩子自己就會發現意思在同一個範圍。' }
    ],

    pitfalls: [
      { bad: '遊記寫成流水帳：幾點到幾點做了什麼。', fix: '時間順序是<b>骨架</b>，不是全部。每一段至少要加一句<b>看到的細節</b>或<b>當下的想法</b>。', src: '6-III-3' },
      { bad: '整篇只寫「很好玩」「很漂亮」。', fix: '這些是<b>結論</b>，不是內容。把「漂亮」換成你實際看到的東西：什麼顏色、什麼形狀、旁邊有什麼。' },
      { bad: '一篇裡面時間順序和空間順序跳來跳去。', fix: '可以混用，但要有<b>一條主線</b>。先決定主線是時間還是空間，另一種當補充。' },
      { bad: '把「文化」只想成廟會和表演。', fix: '文化有三層：<b>物質</b>（看得到的）、<b>社群</b>（人怎麼組織）、<b>精神</b>（想法與信仰）。' },
      { bad: '以為同部首的字唸起來會一樣。', fix: '部首管的是<b>意思的方向</b>，不是讀音。「澎」和「瀏」都是水部，唸起來完全不同。', src: '4-III-2' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['order', 'orderEx', 'layer', 'layerEx', 'radical', 'radical', 'sameRad', 'structure']);

      if (type === 'order') {
        const t = pick(TRAVEL_ORDER);
        const o = pick4(t.d, TRAVEL_ORDER.filter(function (x) { return x.n !== t.n; }).map(function (x) { return x.d; }));
        return {
          tpl: 'order',
          q: '寫遊記的「<b>' + t.n + '</b>」是怎麼安排的？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + t.n + '</b>：' + t.d + '<br>' + t.w + '<br>' +
            '三種順序：時間（先後）、空間（遠近上下）、感受（本來以為 → 實際 → 後來想到）。'
        };
      }

      if (type === 'orderEx') {
        const cases = [
          { s: '天剛亮我們就出發，中午抵達，傍晚才慢慢往回走。', k: '時間順序' },
          { s: '遠望是一整片山，走近看見矮房子，推開門只有一張桌子。', k: '空間順序' },
          { s: '本來以為只是塊石頭，站到底下才知道要抬頭很久，回程一直在想它站多久了。', k: '感受順序' }
        ];
        const c = pick(cases);
        const o = pick4(c.k, TRAVEL_ORDER.map(function (x) { return x.n; }));
        return {
          tpl: 'orderEx',
          q: '「' + c.s + '」<br>這一段用的是哪一種順序？',
          choices: o.choices, answer: o.answer,
          steps: '這是<b>' + c.k + '</b>。<br>' +
            '判斷法：看時間詞（早上、中午）＝時間；看位置詞（遠、近、裡面）＝空間；' +
            '看想法的轉變（以為、才發現）＝感受。'
        };
      }

      if (type === 'layerEx') {
        const L = pick(CULTURE_LAYERS);
        const ex = pick(L.e);
        const o = pick4(L.n, CULTURE_LAYERS.map(function (x) { return x.n; }));
        return {
          tpl: 'layerEx',
          q: '「<b>' + ex + '</b>」屬於文化的哪一層？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + L.n + '</b>：' + L.d + '<br>' +
            '判斷順序：摸得到 → 物質；講人的組織與規矩 → 社群；講想法與信仰 → 精神。<br>' +
            '遊記三層各寫一點，文章就有厚度。'
        };
      }

      if (type === 'layer') {
        const L = pick(CULTURE_LAYERS);
        const o = pick4(L.d, CULTURE_LAYERS.filter(function (x) { return x.n !== L.n; }).map(function (x) { return x.d; }));
        return {
          tpl: 'layer',
          q: '文化的「<b>' + L.n + '</b>」指的是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + L.n + '</b>：' + L.d + '<br>' +
            '三層一起看：物質（看得到）→ 社群（人怎麼組織）→ 精神（看不見的想法）。<br>' +
            '寫遊記時，三層各挑一件事寫，就不會只剩「很好玩」。'
        };
      }

      if (type === 'radical') {
        const g = pick(GLYPHS);
        const seenR = {}; seenR[g.r] = 1;
        const others = [];
        shuffle(GLYPHS).forEach(function (x) { if (!seenR[x.r]) { seenR[x.r] = 1; others.push(x.rn); } });
        const o = pick4(g.rn, others);
        return {
          tpl: 'radical',
          q: '「<b>' + g.c + '</b>」這個字的<b>部首</b>是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '「' + g.c + '」可以拆成「' + g.r + '」和「' + g.p + '」兩個部件。<br>' +
            '部首是<b>' + g.rn + '</b>，' + g.rm + '。<br>' +
            '字形結構是<b>' + g.s + '</b>，部首' + radPos(g) + '。'
        };
      }

      if (type === 'structure') {
        const g = pick(GLYPHS);
        const o = pick4(g.s, ['左右', '上下', '半包圍'].filter(function (x) { return x !== g.s; }));
        return {
          tpl: 'structure',
          q: '「<b>' + g.c + '</b>」的<b>字形結構</b>是哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '「' + g.c + '」＝「' + g.r + '」＋「' + g.p + '」。<br>' +
            '兩個部件' + (g.s === '左右' ? '<b>並排在左右</b>' : g.s === '上下' ? '<b>疊在上下</b>' : '<b>一邊從外面包住另一邊</b>') +
            '，所以是<b>' + g.s + '</b>結構。<br>' +
            '部首' + radPos(g) + '。'
        };
      }

      // sameRad
      const r = pick(MULTI_RADICALS);
      const two = shuffle(BY_RADICAL[r]).slice(0, 2);
      const others = shuffle(GLYPHS.filter(function (x) { return x.r !== r; })).slice(0, 6).map(function (x) { return x.c; });
      const o = pick4(two[1].c, others);
      return {
        tpl: 'sameRad',
        q: '下面哪一個字，和「<b>' + two[0].c + '</b>」的<b>部首相同</b>？',
        choices: o.choices, answer: o.answer,
        steps: '「' + two[0].c + '」的部首是<b>' + two[0].rn + '</b>。<br>' +
          '「' + two[1].c + '」＝「' + two[1].r + '」＋「' + two[1].p + '」，部首也是<b>' + two[1].rn + '</b>。<br>' +
          '同部首的字，意思常常在同一個範圍：' + two[0].rm + '。'
      };
    }
  });


  /* ============================================================
     第貳單元　與愛相遇
     統整活動二：採訪的流程、藉由敘述事件間接抒情
     ============================================================ */

  const INTERVIEW = [
    { n: '一、決定主題與對象', d: '先想清楚「我想知道什麼」，再決定要問誰。對象要真的知道這件事。', tip: '主題太大會問不出東西，縮小到一個具體的問題。' },
    { n: '二、事先查資料', d: '先查一下對方做過什麼，才問得出好問題。', tip: '查過資料，才不會問出對方講過一百次的問題。' },
    { n: '三、擬訪問大綱', d: '把問題按順序寫下來，從好回答的開始，重要的放中間。', tip: '第一題不要太尖銳，先讓對方放鬆。' },
    { n: '四、約時間並禮貌說明', d: '事先聯絡，說明目的、大概要多久、會怎麼使用。', tip: '要錄音一定要先問過對方。' },
    { n: '五、訪問時仔細聆聽並記錄', d: '一邊聽一邊記重點，聽到有意思的地方可以追問。', tip: '不用逐字抄，記關鍵詞和數字就好。' },
    { n: '六、整理成文章', d: '把記錄整理成有順序的文章，可以引用對方的話，要加引號。', tip: '引用要忠實，不能改對方的意思。' },
    { n: '七、道謝與確認', d: '訪問後道謝，寫好之後最好讓對方看一次。', tip: '這一步最常被忘記，卻是最基本的禮貌。' }
  ];

  const FEELING = [
    {
      k: '直接抒情', s: '我真的好想念阿嬤。',
      w: '把感情<b>直接說出來</b>：想念、開心、難過。清楚，但用多了會顯得空。'
    },
    {
      k: '藉事抒情', s: '每次經過那間雜貨店，我都會停一下，看看門口那張空著的藤椅。',
      w: '不說「想念」，只寫一件事，讓讀的人<b>自己感覺到</b>。這是統整活動二要練的。'
    },
    {
      k: '直接抒情', s: '收到那封信的時候，我覺得非常感動。',
      w: '直接講出「感動」兩個字。'
    },
    {
      k: '藉事抒情', s: '我把那封信折好，放進鉛筆盒最裡面那一格，一整個學期都沒有拿出來。',
      w: '沒有一個字寫「珍惜」，但讀的人都知道。'
    },
    {
      k: '藉景抒情', s: '走出校門時，天空剛好放晴，連風都變得輕輕的。',
      w: '寫<b>景物</b>來襯托心情，景是亮的，心情就是亮的。'
    },
    {
      k: '藉景抒情', s: '那天的雨一直下，操場積水的地方倒映著灰色的天。',
      w: '用陰暗的景寫低落的心情。'
    }
  ];
  const FEELING_KINDS = ['直接抒情', '藉事抒情', '藉景抒情'];

  const PERSON = [
    { s: '她總是把最後一塊餅乾留給別人，自己說不餓。', k: '為別人著想', how: '用<b>反覆出現的行為</b>寫個性。' },
    { s: '他講話很慢，每個字都想過才說出口。', k: '謹慎', how: '用<b>說話的方式</b>寫個性。' },
    { s: '桌上永遠只有一支筆和一本簿子，其他東西都收在抽屜裡。', k: '有條理', how: '用<b>周圍的東西</b>寫個性，人都還沒出場。' },
    { s: '無論被拒絕幾次，隔天他還是照樣去問。', k: '不放棄', how: '用<b>面對挫折的反應</b>寫個性。' },
    { s: '她笑起來眼睛會瞇成一條線，看得出來是真的高興。', k: '真誠', how: '用<b>表情的細節</b>寫個性。' }
  ];

  Kit.register('chi5b-u2', {

    intro: '把感情直接說出來很容易，難的是<b>不說出來卻讓人感覺到</b>。切換三個模式：<b>採訪</b>看一次訪問要走哪七步，<b>抒情</b>比較直接說和藉事說的差別，<b>寫人</b>練習用行為寫個性。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 410);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'interview', step = 3, fi = 0, pi = 0, showP = false;

      function paintInterview() {
        const ctx = clear(cv);
        title(ctx, 24, 14, '一次採訪要走的七步');
        let y = 44;
        for (let i = 0; i < INTERVIEW.length; i++) {
          const it = INTERVIEW[i], on = i < step;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 46, 8); ctx.fill();
          ctx.fillStyle = on ? (i < 3 ? C.accent : i < 5 ? C.warn : C.ok) : '#2b3f63';
          roundRect(ctx, 24, y, 7, 46, 3); ctx.fill();
          ctx.fillStyle = on ? C.text : '#3a4b6b'; ctx.font = 'bold 13px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(it.n, 46, y + 6);
          ctx.fillStyle = on ? C.muted : '#2b3f63'; ctx.font = '12px ' + FONT;
          ctx.fillText(it.d.slice(0, 32), 46, y + 26);
          ctx.restore();
          y += 52;
        }
        const cur = INTERVIEW[Math.max(0, step - 1)];
        panel(ctx, 24, y + 8, 572)('小提醒：' + cur.tip, C.warn, 13, 0);
        readout.innerHTML = '已顯示 <b>' + step + '</b> / ' + INTERVIEW.length + ' 步　<b>' + cur.n + '</b>';
      }

      function paintFeeling() {
        const ctx = clear(cv);
        const f = FEELING[fi];
        title(ctx, 24, 16, '抒情的方式：' + f.k);
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 96, 10); ctx.fill();
        ctx.fillStyle = f.k === '直接抒情' ? C.no : C.ok;
        roundRect(ctx, 24, 52, 8, 96, 4); ctx.fill();
        ctx.restore();
        panel(ctx, 46, 72, 528)(f.s, C.text, 17, 0);

        const w = panel(ctx, 24, 168, 572);
        w(f.w, C.text, 14, 14);
        w('三種方式：', C.accent, 15, 6);
        w('直接抒情　把感情直接說出來（想念、開心、難過）', C.muted, 13, 2);
        w('藉事抒情　只寫一件事，讓讀的人自己感覺到', C.muted, 13, 2);
        w('藉景抒情　寫景物來襯托心情', C.muted, 13, 10);
        w('作文要拿高分，關鍵是<b>少用直接、多用藉事</b>。', C.warn, 14, 0);

        readout.innerHTML = '<b>' + f.k + '</b>　<span class="muted">第 ' + (fi + 1) + ' / ' + FEELING.length + ' 句</span>';
      }

      function paintPerson() {
        const ctx = clear(cv);
        const p = PERSON[pi];
        title(ctx, 24, 16, '用行為寫個性，不要直接說');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 92, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 46, 72, 528)(p.s, C.text, 17, 0);

        const w = panel(ctx, 24, 164, 572);
        if (showP) {
          w('這寫的是：' + p.k, C.ok, 19, 12);
          w(p.how, C.text, 14, 14);
          w('注意：整句話裡<b>沒有出現「' + p.k + '」三個字</b>，但讀的人都感覺得到。', C.warn, 14, 8);
          w('這就是「寫人」的訣竅：<b>寫他做了什麼，不要寫他是什麼樣的人</b>。', C.muted, 13, 0);
        } else {
          w('先自己說說看：這段話寫的是一個什麼樣的人？', C.muted, 15, 10);
          w('想好了再按「看答案」。', C.muted, 14, 0);
        }
        readout.innerHTML = '第 <b>' + (pi + 1) + '</b> / ' + PERSON.length + ' 句' + (showP ? '　寫的是：<b>' + p.k + '</b>' : '');
      }

      function paint() {
        if (mode === 'interview') paintInterview();
        else if (mode === 'feel') paintFeeling();
        else paintPerson();
      }

      const seg = Kit.segmented('模式', [
        { label: '採訪', value: 'interview' }, { label: '抒情', value: 'feel' }, { label: '寫人', value: 'person' }
      ], function (v) { mode = v; sync(); paint(); }, 'interview');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'interview') step = Math.max(1, step - 1);
        else if (mode === 'feel') fi = (fi - 1 + FEELING.length) % FEELING.length;
        else { pi = (pi - 1 + PERSON.length) % PERSON.length; showP = false; }
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'interview') step = Math.min(INTERVIEW.length, step + 1);
        else if (mode === 'feel') fi = (fi + 1) % FEELING.length;
        else { pi = (pi + 1) % PERSON.length; showP = false; }
        paint();
      });
      const bA = Kit.button('看答案', function () { showP = !showP; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bA);
      function sync() { bA.style.display = (mode === 'person') ? '' : 'none'; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「如果要採訪阿公，你第一個問題會問什麼？」', why: '練擬大綱。提醒他第一題不要太尖銳，先讓對方放鬆。' },
      { ask: '「訪問之前要先做什麼？」', why: '查資料。查過才問得出好問題，這是課本第四課教的重點。' },
      { ask: '「訪問完最後一步是什麼？」', why: '道謝並讓對方確認。這一步最常被忘記，卻最基本。' },
      { ask: '「這句話有沒有直接說出他的心情？」', why: '分辨直接抒情和藉事抒情。答得出來，作文就有救了。' },
      { ask: '「不准用『難過』兩個字，你要怎麼寫難過？」', why: '這是藉事抒情最好的練習題。寫一個動作、一個東西就好。' },
      { ask: '「這段話寫的是什麼樣的人？你怎麼知道的？」', why: '重點在後半句。要他指出是<b>哪個行為</b>讓他這樣判斷。' }
    ],

    pitfalls: [
      { bad: '採訪前不查資料，直接去問。', fix: '沒查資料就只問得出「你為什麼要做這個」這種問題。<b>先查，才問得出好問題</b>。', src: '2-III-2' },
      { bad: '訪問時想把每一句話都抄下來。', fix: '抄逐字會來不及聽。記<b>關鍵詞和數字</b>就好，聽到有意思的地方要追問。', src: '1-III-1' },
      { bad: '整理文章時改掉對方說的話。', fix: '引用要<b>忠實</b>，而且要加<b>引號</b>。改了意思就不是採訪，是編故事。' },
      { bad: '抒情整篇都用「我好開心」「我好難過」。', fix: '這是<b>直接抒情</b>，用多了很空。改成寫<b>一件事</b>或<b>一個景</b>，讓讀的人自己感覺。' },
      { bad: '寫人物直接寫「他是一個善良的人」。', fix: '把「善良」拿掉，改寫<b>他做過的一件事</b>。讀的人自己得出結論，印象才深。', src: '6-III-3' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['step', 'stepOrder', 'feel', 'feel', 'feelWhich', 'person', 'quote']);

      if (type === 'step') {
        const it = pick(INTERVIEW);
        const o = pick4(it.d, INTERVIEW.filter(function (x) { return x.n !== it.n; }).map(function (x) { return x.d; }));
        return {
          tpl: 'step',
          q: '採訪流程的「<b>' + it.n.replace(/^[一二三四五六七]、/, '') + '</b>」要做什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + it.n + '</b>：' + it.d + '<br>' +
            '小提醒：' + it.tip + '<br>' +
            '七步順序：決定主題 → 查資料 → 擬大綱 → 約時間 → 聆聽記錄 → 整理成文 → 道謝確認。'
        };
      }

      if (type === 'stepOrder') {
        const i = randInt(0, INTERVIEW.length - 2);
        const o = shuffled([
          { t: INTERVIEW[i].n.replace(/^[一二三四五六七]、/, ''), ok: true },
          { t: INTERVIEW[i + 1].n.replace(/^[一二三四五六七]、/, '') }
        ]);
        return {
          tpl: 'stepOrder',
          q: '採訪的流程中，哪一件事要<b>先</b>做？',
          choices: o.choices, answer: o.answer,
          steps: '正確順序是：<b>' + INTERVIEW[i].n + '</b> 在 <b>' + INTERVIEW[i + 1].n + '</b> 前面。<br>' +
            '完整七步：決定主題與對象 → 事先查資料 → 擬訪問大綱 → 約時間並說明 → 訪問時聆聽記錄 → 整理成文章 → 道謝與確認。<br>' +
            '記法：<b>準備 → 提問 → 記錄 → 整理</b>，四個階段。'
        };
      }

      if (type === 'feel') {
        const f = pick(FEELING);
        const o = pick4(f.k, FEELING_KINDS);
        return {
          tpl: 'feel',
          q: '「' + f.s + '」<br>這句話用的是哪一種<b>抒情方式</b>？',
          choices: o.choices, answer: o.answer,
          steps: f.w + '<br>' +
            '所以是<b>' + f.k + '</b>。<br>' +
            '快速分辨：句子裡有沒有直接寫出心情的詞？有＝直接；只寫事＝藉事；只寫景＝藉景。'
        };
      }

      if (type === 'feelWhich') {
        const direct = pick(FEELING.filter(function (x) { return x.k === '直接抒情'; }));
        const indirect = pick(FEELING.filter(function (x) { return x.k === '藉事抒情'; }));
        const o = shuffled([
          { t: indirect.s, ok: true },
          { t: direct.s }
        ]);
        return {
          tpl: 'feelWhich',
          q: '下面哪一句是<b>藉事抒情</b>（沒有直接說出心情，卻讓人感覺得到）？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + indirect.s + '</b><br>' +
            indirect.w + '<br>' +
            '另一句直接把心情講出來了，那是<b>直接抒情</b>。作文要拿高分，多用藉事抒情。'
        };
      }

      if (type === 'quote') {
        const o = shuffled([
          { t: '忠實引用，而且要加上引號', ok: true },
          { t: '可以改成自己覺得比較好聽的說法' },
          { t: '不用加引號，反正是自己寫的文章' },
          { t: '把對方的話全部刪掉比較乾淨' }
        ]);
        return {
          tpl: 'quote',
          q: '整理採訪紀錄時，要引用受訪者說的話，該怎麼做？',
          choices: o.choices, answer: o.answer,
          steps: '引用要<b>忠實</b>，而且要加<b>引號</b>。<br>' +
            '改掉對方的意思就不是採訪了。文章寫好之後，最好再讓對方看一次。<br>' +
            '這一點同時是寫作規範，也是基本的禮貌。'
        };
      }

      // person：寫人
      const p = pick(PERSON);
      const o = pick4(p.k, PERSON.filter(function (x) { return x.k !== p.k; }).map(function (x) { return x.k; }));
      return {
        tpl: 'person',
        q: '「' + p.s + '」<br>這段話寫的是一個什麼樣的人？',
        choices: o.choices, answer: o.answer,
        steps: '寫的是<b>' + p.k + '</b>。<br>' +
          p.how + '<br>' +
          '注意整句裡<b>沒有出現「' + p.k + '」這幾個字</b>。寫人的訣竅就是：寫他做了什麼，不要寫他是什麼樣的人。'
      };
    }
  });


  /* ============================================================
     第參單元　生活與學習
     統整活動三：襯托、客觀事實與主觀意見、論點與論據
     ============================================================ */

  const POEMS = [
    {
      t: '鳥鳴澗', a: '王維', n: 5,
      lines: ['人閒桂花落', '夜靜春山空', '月出驚山鳥', '時鳴春澗中'],
      kind: '反襯', why: '用鳥叫聲來寫<b>安靜</b>。因為太靜了，一點聲音才顯得清楚。'
    },
    {
      t: '鹿柴', a: '王維', n: 5,
      lines: ['空山不見人', '但聞人語響', '返景入深林', '復照青苔上'],
      kind: '反襯', why: '用人聲來寫<b>沒有人</b>，用一道光來寫整片林子有多暗。'
    },
    {
      t: '江雪', a: '柳宗元', n: 5,
      lines: ['千山鳥飛絕', '萬徑人蹤滅', '孤舟簑笠翁', '獨釣寒江雪'],
      kind: '正襯', why: '前兩句把一切都寫空了，用<b>空曠</b>襯托最後那個人的<b>孤單</b>，方向一致。'
    },
    {
      t: '登鸛雀樓', a: '王之渙', n: 5,
      lines: ['白日依山盡', '黃河入海流', '欲窮千里目', '更上一層樓'],
      kind: '正襯', why: '用<b>遼闊的景</b>襯托<b>開闊的想法</b>，前後方向一致。'
    }
  ];

  const FACT_OPINION = [
    { s: '這本書一共有兩百四十頁。', k: '客觀事實', w: '頁數可以<b>數出來</b>，任何人查都一樣。' },
    { s: '這本書是今年最好看的一本。', k: '主觀意見', w: '「最好看」是<b>感覺</b>，每個人的答案不一樣。' },
    { s: '這個星期下了四天雨。', k: '客觀事實', w: '天數可以<b>查紀錄</b>核對。' },
    { s: '這種天氣真讓人心情不好。', k: '主觀意見', w: '「心情不好」因人而異。' },
    { s: '學校的操場一圈是兩百公尺。', k: '客觀事實', w: '長度可以<b>量</b>。' },
    { s: '跑步是最適合小學生的運動。', k: '主觀意見', w: '「最適合」是<b>判斷</b>，不同的人會有不同答案。' },
    { s: '這個路口去年發生了十二起事故。', k: '客觀事實', w: '有<b>數據</b>可以查證。' },
    { s: '這個路口實在太危險了。', k: '主觀意見', w: '「太危險」是<b>評價</b>，需要用事實來支持。' },
    { s: '他今天遲到了二十分鐘。', k: '客觀事實', w: '時間可以<b>對錶</b>。' },
    { s: '他一定是故意遲到的。', k: '主觀意見', w: '「故意」是<b>猜測對方的想法</b>，沒辦法直接查證。' }
  ];

  const ARGU = [
    {
      claim: '學校應該把午休時間延長十分鐘。',
      good: '上週班上有九個人在下午第一節打瞌睡，延長午休可以讓大家更專心。',
      bad: '因為我覺得午休太短了。',
      why: '好的論據給的是<b>可以查證的事實</b>；壞的只是把論點換句話說。'
    },
    {
      claim: '書包應該可以放在教室。',
      good: '書包裝滿課本大約四公斤，每天背來背去對還在發育的身體是負擔。',
      bad: '因為背書包很麻煩。',
      why: '好的論據有<b>具體數字</b>和<b>合理的推論</b>；壞的只是抱怨。'
    },
    {
      claim: '走路上學是值得的。',
      good: '路上會看到平常坐車錯過的東西，而且到教室時人比較清醒。',
      bad: '因為走路比較好。',
      why: '好的論據講出<b>具體的好處</b>；壞的等於什麼都沒說。'
    }
  ];

  Kit.register('chi5b-u3', {

    intro: '同樣一句話，有人在講事實，有人在講意見，讀的時候要分得出來。切換三個模式：<b>襯托</b>看古典詩怎麼用相反的東西凸顯重點，<b>事實或意見</b>練習分辨，<b>論點論據</b>看怎麼把話說得有說服力。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 410);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'foil', pi = 0, fi = 0, showF = false, ai = 0;

      function paintFoil() {
        const ctx = clear(cv);
        const p = POEMS[pi];
        title(ctx, 24, 14, p.t + '　' + p.a + '（唐）　── ' + p.kind);

        const cell = 50, startX = 300 - (p.n * cell) / 2;
        let y = 46;
        for (let li = 0; li < 4; li++) {
          for (let ci = 0; ci < p.n; ci++) {
            ctx.save();
            ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            roundRect(ctx, startX + ci * cell, y, cell - 4, cell - 4, 5); ctx.stroke();
            ctx.fillStyle = C.text;
            ctx.font = Math.round(cell * 0.52) + 'px ' + FONT;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(p.lines[li].charAt(ci), startX + ci * cell + (cell - 4) / 2, y + (cell - 4) / 2 + 1);
            ctx.restore();
          }
          y += cell + 4;
        }

        const w = panel(ctx, 24, y + 12, 572);
        w(p.kind === '反襯' ? '反襯：用相反的東西凸顯' : '正襯：用相同方向的東西加強', C.warn, 16, 8);
        w(p.why, C.text, 14, 14);
        w('正襯　用<b>方向一致</b>的東西加強，例如用遼闊的景寫開闊的心。', C.muted, 13, 2);
        w('反襯　用<b>相反</b>的東西凸顯，例如用一點聲音寫整片安靜。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + p.t + '</b>　用的是 <b>' + p.kind + '</b>';
      }

      function paintFact() {
        const ctx = clear(cv);
        const f = FACT_OPINION[fi];
        title(ctx, 24, 16, '這句話是事實，還是意見？');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 54, 572, 88, 10); ctx.fill();
        if (showF) {
          ctx.fillStyle = f.k === '客觀事實' ? C.ok : C.warn;
          roundRect(ctx, 24, 54, 8, 88, 4); ctx.fill();
        }
        ctx.restore();
        panel(ctx, 46, 74, 528)(f.s, C.text, 18, 0);

        const w = panel(ctx, 24, 162, 572);
        if (showF) {
          w('這是：' + f.k, f.k === '客觀事實' ? C.ok : C.warn, 19, 12);
          w(f.w, C.text, 14, 14);
          w('分辨方法：這句話<b>可不可以查證</b>？', C.accent, 15, 6);
          w('可以量、可以數、可以查紀錄　→　客觀事實', C.muted, 13, 2);
          w('用到「最」「應該」「太」「一定」「我覺得」　→　多半是主觀意見', C.muted, 13, 0);
        } else {
          w('先自己判斷，再按「看答案」。', C.muted, 15, 10);
          w('提示：問自己「這句話查得到嗎？」', C.muted, 14, 0);
        }
        readout.innerHTML = '第 <b>' + (fi + 1) + '</b> / ' + FACT_OPINION.length + ' 句' +
          (showF ? '　<b>' + f.k + '</b>' : '');
      }

      function paintArgu() {
        const ctx = clear(cv);
        const a = ARGU[ai];
        title(ctx, 24, 14, '同一個論點，兩種論據');

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 44, 572, 56, 10); ctx.fill();
        ctx.fillStyle = C.accent; roundRect(ctx, 24, 44, 8, 56, 4); ctx.fill();
        ctx.fillStyle = C.accent; ctx.font = 'bold 13px ' + FONT;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('論點', 46, 52);
        ctx.restore();
        panel(ctx, 90, 58, 490)(a.claim, C.text, 15, 0);

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 112, 572, 82, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 24, 112, 8, 82, 4); ctx.fill();
        ctx.fillStyle = C.ok; ctx.font = 'bold 13px ' + FONT;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('好的論據', 46, 120);
        ctx.restore();
        panel(ctx, 46, 142, 528)(a.good, C.text, 14, 0);

        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 206, 572, 66, 10); ctx.fill();
        ctx.fillStyle = C.no; roundRect(ctx, 24, 206, 8, 66, 4); ctx.fill();
        ctx.fillStyle = C.no; ctx.font = 'bold 13px ' + FONT;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('不好的論據', 46, 214);
        ctx.restore();
        panel(ctx, 46, 236, 528)(a.bad, C.text, 14, 0);

        const w = panel(ctx, 24, 288, 572);
        w(a.why, C.warn, 14, 12);
        w('好論據的三種來源：<b>具體事實</b>、<b>數據</b>、<b>親身經驗或例子</b>。', C.accent, 14, 6);
        w('檢查方法：把論據唸一次，如果它只是把論點換句話說，那就不算論據。', C.muted, 13, 0);

        readout.innerHTML = '第 <b>' + (ai + 1) + '</b> / ' + ARGU.length + ' 組';
      }

      function paint() {
        if (mode === 'foil') paintFoil();
        else if (mode === 'fact') paintFact();
        else paintArgu();
      }

      const seg = Kit.segmented('模式', [
        { label: '襯托', value: 'foil' }, { label: '事實或意見', value: 'fact' }, { label: '論點論據', value: 'argu' }
      ], function (v) { mode = v; sync(); paint(); }, 'foil');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'foil') pi = (pi - 1 + POEMS.length) % POEMS.length;
        else if (mode === 'fact') { fi = (fi - 1 + FACT_OPINION.length) % FACT_OPINION.length; showF = false; }
        else ai = (ai - 1 + ARGU.length) % ARGU.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'foil') pi = (pi + 1) % POEMS.length;
        else if (mode === 'fact') { fi = (fi + 1) % FACT_OPINION.length; showF = false; }
        else ai = (ai + 1) % ARGU.length;
        paint();
      });
      const bA = Kit.button('看答案', function () { showF = !showF; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bA);
      function sync() { bA.style.display = (mode === 'fact') ? '' : 'none'; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「這首詩明明有鳥叫聲，為什麼說它在寫安靜？」', why: '反襯的核心。因為太靜了，一點聲音才顯得清楚。想通這一題，襯托就懂了。' },
      { ask: '「正襯和反襯差在哪裡？」', why: '正襯方向一致（用遼闊寫開闊），反襯方向相反（用聲音寫安靜）。' },
      { ask: '「這句話查得到嗎？」', why: '分辨事實和意見最快的一問。查得到＝事實，查不到＝意見。' },
      { ask: '「新聞裡這一句，是記者看到的還是他的想法？」', why: '把課本拉到生活。這是課綱 5-III-4 直接點名的能力。' },
      { ask: '「你說『這樣比較好』，好在哪裡？」', why: '逼出論據。答不出具體理由，就表示他只有論點沒有論據。' },
      { ask: '「這個理由是不是只把你的主張換句話說？」', why: '檢查論據最有效的一招。「因為我覺得太短了」就是典型的假論據。' }
    ],

    pitfalls: [
      { bad: '以為詩裡寫了鳥叫，主題就是熱鬧。', fix: '那是<b>反襯</b>：用一點聲音凸顯整片安靜。看到相反的元素，先想是不是襯托。', src: '5-III-1' },
      { bad: '把正襯和反襯弄反。', fix: '<b>正襯＝方向一致</b>（用遼闊的景寫開闊的心）；<b>反襯＝方向相反</b>（用聲音寫安靜）。' },
      { bad: '看到數字就以為一定是事實。', fix: '要看那個數字<b>能不能查證</b>。「這個路口去年有十二起事故」可以查；「這裡有一百萬個理由」是誇飾。' },
      { bad: '把「應該」「最」開頭的句子當成事實。', fix: '有<b>「最」「應該」「太」「一定」「我覺得」</b>的句子，多半是<b>主觀意見</b>。', src: '5-III-4' },
      { bad: '論據寫成「因為我覺得⋯⋯」。', fix: '那只是把論點換句話說。論據要是<b>具體事實、數據或例子</b>，別人才會被說服。', src: '6-III-5' },
      { bad: '以為意見是不好的、事實才對。', fix: '兩種都需要。<b>意見要用事實支持</b>，這才是議論文在做的事。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['fact', 'fact', 'factWhich', 'foil', 'foilKind', 'argu', 'arguWhich', 'marker']);

      if (type === 'fact') {
        const f = pick(FACT_OPINION);
        const o = shuffled([
          { t: f.k, ok: true },
          { t: f.k === '客觀事實' ? '主觀意見' : '客觀事實' }
        ]);
        return {
          tpl: 'fact',
          q: '「' + f.s + '」<br>這句話是<b>客觀事實</b>還是<b>主觀意見</b>？',
          choices: o.choices, answer: o.answer,
          steps: '這是<b>' + f.k + '</b>。<br>' + f.w + '<br>' +
            '分辨方法：問自己「這句話<b>查得到嗎</b>？」可以量、可以數、可以查紀錄的是事實。'
        };
      }

      if (type === 'factWhich') {
        const fact = pick(FACT_OPINION.filter(function (x) { return x.k === '客觀事實'; }));
        const op = pick(FACT_OPINION.filter(function (x) { return x.k === '主觀意見'; }));
        const askFact = Math.random() < 0.5;
        const o = shuffled([
          { t: (askFact ? fact : op).s, ok: true },
          { t: (askFact ? op : fact).s }
        ]);
        return {
          tpl: 'factWhich',
          q: '下面哪一句是<b>' + (askFact ? '客觀事實' : '主觀意見') + '</b>？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + (askFact ? fact : op).s + '</b><br>' +
            (askFact ? fact : op).w + '<br>' +
            '訣竅：有「最」「應該」「太」「一定」「我覺得」的多半是意見；可以量、可以數的是事實。'
        };
      }

      if (type === 'marker') {
        const words = ['最好看的', '應該', '太危險', '一定是', '我覺得'];
        const o = shuffled([
          { t: '多半代表這是主觀意見', ok: true },
          { t: '多半代表這是客觀事實' },
          { t: '和事實或意見沒有關係' },
          { t: '代表這句話一定是錯的' }
        ]);
        return {
          tpl: 'marker',
          q: '句子裡出現「<b>' + pick(words) + '</b>」這類詞，通常代表什麼？',
          choices: o.choices, answer: o.answer,
          steps: '「最」「應該」「太」「一定」「我覺得」都是在<b>表達判斷或感覺</b>，所以多半是<b>主觀意見</b>。<br>' +
            '但要注意：<b>意見不等於錯</b>。好的意見會用事實來支持。<br>' +
            '最可靠的判斷法還是問：<b>這句話查得到嗎</b>？'
        };
      }

      if (type === 'foil') {
        const p = pick(POEMS);
        const o = shuffled([
          { t: p.kind, ok: true },
          { t: p.kind === '反襯' ? '正襯' : '反襯' }
        ]);
        return {
          tpl: 'foil',
          q: '〈' + p.t + '〉：「' + p.lines.map(function (l, i) { return l + (i % 2 ? '。' : '，'); }).join('') + '」<br>' +
            '這首詩用的是<b>正襯</b>還是<b>反襯</b>？',
          choices: o.choices, answer: o.answer,
          steps: '這是<b>' + p.kind + '</b>。<br>' + p.why + '<br>' +
            '正襯＝用<b>方向一致</b>的東西加強；反襯＝用<b>相反</b>的東西凸顯。'
        };
      }

      if (type === 'foilKind') {
        const isFan = Math.random() < 0.5;
        const right = isFan
          ? '用相反的東西來凸顯，例如用一點聲音寫整片安靜'
          : '用方向一致的東西來加強，例如用遼闊的景寫開闊的心';
        const o = pick4(right, [
          isFan ? '用方向一致的東西來加強，例如用遼闊的景寫開闊的心'
                : '用相反的東西來凸顯，例如用一點聲音寫整片安靜',
          '把兩件事的先後順序排出來',
          '把一句話重複三次加強語氣'
        ]);
        return {
          tpl: 'foilKind',
          q: '寫作技巧中的「<b>' + (isFan ? '反襯' : '正襯') + '</b>」是什麼意思？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + (isFan ? '反襯' : '正襯') + '</b>：' + right + '。<br>' +
            '兩個都是<b>襯托</b>，差別只在方向：一致是正襯，相反是反襯。<br>' +
            '襯托的目的都一樣：讓真正想寫的那個東西更明顯。'
        };
      }

      if (type === 'arguWhich') {
        const a = pick(ARGU);
        const o = shuffled([
          { t: a.good, ok: true },
          { t: a.bad }
        ]);
        return {
          tpl: 'arguWhich',
          q: '論點是「<b>' + a.claim + '</b>」。<br>下面哪一句才算是<b>好的論據</b>？',
          choices: o.choices, answer: o.answer,
          steps: '好的論據：<b>' + a.good + '</b><br>' + a.why + '<br>' +
            '檢查方法：把論據唸一次，如果它只是把論點換句話說，那就不算論據。'
        };
      }

      // argu：論點還是論據
      const a = pick(ARGU);
      const isClaim = Math.random() < 0.5;
      const s = isClaim ? a.claim : a.good;
      const o = shuffled([
        { t: isClaim ? '論點' : '論據', ok: true },
        { t: isClaim ? '論據' : '論點' }
      ]);
      return {
        tpl: 'argu',
        q: '「' + s + '」<br>這句話在議論文裡是<b>論點</b>還是<b>論據</b>？',
        choices: o.choices, answer: o.answer,
        steps: '這是<b>' + (isClaim ? '論點' : '論據') + '</b>。<br>' +
          (isClaim
            ? '<b>論點</b>是作者的主張，也就是他想說服你相信的那句話。'
            : '<b>論據</b>是用來支持論點的事實、數據或例子。') + '<br>' +
          '完整的議論：論點（我主張什麼）→ 論據（為什麼）→ 結論（所以怎麼做）。'
      };
    }
  });


  /* ============================================================
     第肆單元　精彩故事集
     統整活動四：成語、小說人物的特色、讀書報告
     ============================================================ */

  /* 成語全部取自教育部教育百科「生字詞彙表」（翰林版五上、五下）列出的語詞 */
  const IDIOMS = [
    { w: '煞有介事', m: '裝得好像真有那麼一回事', u: '他煞有介事地清了清喉嚨，其實只是要說一句早安。', L: '五下第 6 課' },
    { w: '不置可否', m: '不表示同意，也不表示反對', u: '問他要不要參加，他只是笑笑，不置可否。', L: '五下第 6 課' },
    { w: '無懈可擊', m: '完美得找不到任何破綻', u: '這份報告資料齊全，論點無懈可擊。', L: '五下第 9 課' },
    { w: '單刀直入', m: '說話直接切入重點，不繞圈子', u: '他單刀直入地問：這件事到底是誰決定的？', L: '五下第 9 課' },
    { w: '娓娓道來', m: '從容不迫地把事情說得動聽', u: '阿公把幾十年前的事娓娓道來，我們聽得入神。', L: '五下第 10 課' },
    { w: '恍然大悟', m: '突然完全明白過來', u: '看到答案的那一刻，我才恍然大悟。', L: '五下第 11 課' },
    { w: '完璧歸趙', m: '把東西完整地歸還原主', u: '借來的書我一定完璧歸趙。', L: '五上第 3 課' },
    { w: '肝膽相照', m: '彼此以真心相待', u: '他們兩個從小一起長大，肝膽相照。', L: '五上第 3 課' },
    { w: '雨後春筍', m: '形容事物大量而迅速地出現', u: '這幾年，社區的讀書會像雨後春筍一樣冒出來。', L: '五上第 4 課' },
    { w: '患得患失', m: '沒得到怕得不到，得到了又怕失去', u: '比賽前太患得患失，反而發揮不出來。', L: '五上第 4 課' },
    { w: '寓教於樂', m: '在遊戲或娛樂中學到東西', u: '這款桌遊寓教於樂，玩完還記得住規則背後的道理。', L: '五上第 4 課' },
    { w: '神采飛揚', m: '精神煥發、意氣風發的樣子', u: '拿到獎牌之後，他整個人神采飛揚。', L: '五上第 5 課' },
    { w: '來龍去脈', m: '事情從頭到尾的經過', u: '先把來龍去脈弄清楚，再決定要不要生氣。', L: '五上第 5 課' },
    { w: '念念有詞', m: '嘴裡不停地小聲說著什麼', u: '他一邊走一邊念念有詞，原來是在背課文。', L: '五上第 10 課' },
    { w: '手舞足蹈', m: '高興得手腳都動起來', u: '聽到週末可以去露營，他高興得手舞足蹈。', L: '五上第 12 課' }
  ];

  const CHARACTER = [
    { s: '面對再難的問題，他總是先問一句「有沒有別的可能」。', k: '善於思考', how: '從<b>面對問題時的反應</b>看個性。' },
    { s: '別人講到一半，他從來不打斷，等對方說完才開口。', k: '尊重別人', how: '從<b>與人相處的習慣</b>看個性。' },
    { s: '就算所有人都說做不到，他還是把工具搬出來試了一次。', k: '不輕易放棄', how: '從<b>在壓力下的選擇</b>看個性。' },
    { s: '他答應過的事，再小也一定會做到。', k: '守信', how: '從<b>一貫的行為</b>看個性。' },
    { s: '每次分東西，他都先看看有沒有人拿得比較少。', k: '體貼', how: '從<b>細微的動作</b>看個性。' }
  ];

  const REPORT = [
    { n: '一、書名與作者', d: '寫清楚看的是哪一本、誰寫的。', tip: '這一項最基本，卻常常被漏掉。' },
    { n: '二、內容大意', d: '用自己的話把故事說一次，要短。', tip: '不能整段抄書上的簡介。' },
    { n: '三、印象最深的部分', d: '挑一個段落或一個人物，說清楚為什麼。', tip: '「為什麼」比「哪一段」重要。' },
    { n: '四、心得與想法', d: '寫這本書讓你想到什麼，或改變了什麼想法。', tip: '連到自己的經驗，報告才不會像抄的。' },
    { n: '五、推薦或建議', d: '你會推薦給誰？為什麼？', tip: '要說出理由，不能只寫「很好看」。' }
  ];

  Kit.register('chi5b-u4', {

    intro: '故事讀完之後，能講出「這是個什麼樣的人」和「我從中想到什麼」，才算真的讀懂。切換三個模式：<b>成語</b>看意思和用法，<b>看人物</b>從行為推個性，<b>讀書報告</b>看一份報告該有哪五塊。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'idiom', ii = 0, ci = 0, showC = false, rstep = 2;

      function paintIdiom() {
        const ctx = clear(cv);
        const it = IDIOMS[ii];
        title(ctx, 24, 16, '成語');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 50, 572, 92, 12); ctx.fill();
        ctx.fillStyle = C.chi; ctx.font = 'bold 38px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.w, 310, 96);
        ctx.restore();

        const w = panel(ctx, 24, 160, 572);
        w('意思：' + it.m, C.warn, 17, 14);
        w('例句：' + it.u, C.text, 15, 14);
        w('出處：' + it.L + '的語詞', C.muted, 13, 12);
        w('查成語可以用<b>教育部成語典</b>。查的時候順便看例句，才知道怎麼用。', C.accent, 13, 0);

        readout.innerHTML = '<b>' + it.w + '</b>　' + it.m + '　<span class="muted">第 ' + (ii + 1) + ' / ' + IDIOMS.length + '</span>';
      }

      function paintChar() {
        const ctx = clear(cv);
        const c = CHARACTER[ci];
        title(ctx, 24, 16, '從行為看人物的特色');
        ctx.save();
        ctx.fillStyle = C.card; roundRect(ctx, 24, 52, 572, 92, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 46, 72, 528)(c.s, C.text, 17, 0);

        const w = panel(ctx, 24, 164, 572);
        if (showC) {
          w('這是一個：' + c.k + '的人', C.ok, 19, 12);
          w(c.how, C.text, 14, 14);
          w('小說在寫人物時，很少直接說「他很善良」，', C.muted, 13, 2);
          w('而是<b>讓他做一件事</b>，讓讀者自己判斷。', C.muted, 13, 10);
          w('讀書報告寫人物時，記得<b>引用那個行為當證據</b>。', C.warn, 14, 0);
        } else {
          w('先自己想想看：這是一個什麼樣的人？', C.muted, 15, 10);
          w('想好了再按「看答案」。', C.muted, 14, 0);
        }
        readout.innerHTML = '第 <b>' + (ci + 1) + '</b> / ' + CHARACTER.length + ' 句' + (showC ? '　<b>' + c.k + '</b>' : '');
      }

      function paintReport() {
        const ctx = clear(cv);
        title(ctx, 24, 14, '一份讀書報告的五塊');
        let y = 46;
        const cols = [C.accent, C.warn, C.purple, C.ok, C.chi];
        for (let i = 0; i < REPORT.length; i++) {
          const r = REPORT[i], on = i < rstep;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 62, 8); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#2b3f63';
          roundRect(ctx, 24, y, 7, 62, 3); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#3a4b6b'; ctx.font = 'bold 14px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(r.n, 46, y + 8);
          ctx.fillStyle = on ? C.text : '#2b3f63'; ctx.font = '13px ' + FONT;
          ctx.fillText(r.d, 46, y + 28);
          ctx.fillStyle = on ? C.muted : '#22304d'; ctx.font = '11px ' + FONT;
          ctx.fillText('※ ' + r.tip, 46, y + 46);
          ctx.restore();
          y += 68;
        }
        panel(ctx, 24, y + 6, 572)(
          rstep >= 5 ? '五塊都有，這份報告就完整了。分數的關鍵在第三、四塊：<b>為什麼</b>。'
                     : '按「下一塊」繼續。', C.warn, 13, 0);
        readout.innerHTML = '已顯示 <b>' + rstep + '</b> / ' + REPORT.length + ' 塊';
      }

      function paint() {
        if (mode === 'idiom') paintIdiom();
        else if (mode === 'char') paintChar();
        else paintReport();
      }

      const seg = Kit.segmented('模式', [
        { label: '成語', value: 'idiom' }, { label: '看人物', value: 'char' }, { label: '讀書報告', value: 'report' }
      ], function (v) { mode = v; sync(); paint(); }, 'idiom');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'idiom') ii = (ii - 1 + IDIOMS.length) % IDIOMS.length;
        else if (mode === 'char') { ci = (ci - 1 + CHARACTER.length) % CHARACTER.length; showC = false; }
        else rstep = Math.max(1, rstep - 1);
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'idiom') ii = (ii + 1) % IDIOMS.length;
        else if (mode === 'char') { ci = (ci + 1) % CHARACTER.length; showC = false; }
        else rstep = Math.min(REPORT.length, rstep + 1);
        paint();
      });
      const bA = Kit.button('看答案', function () { showC = !showC; paint(); });
      const bR = Kit.button('隨機一個', function () { ii = randInt(0, IDIOMS.length - 1); paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bA); row.appendChild(bR);
      function sync() {
        bA.style.display = (mode === 'char') ? '' : 'none';
        bR.style.display = (mode === 'idiom') ? '' : 'none';
        bNext.textContent = (mode === 'report') ? '下一塊 ▶' : '下一個 ▶';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「這個成語是什麼意思？造一個句子看看。」', why: '知道意思不等於會用。造得出句子才算真的會。' },
      { ask: '「不置可否是同意還是不同意？」', why: '兩個都不是，是<b>沒有表態</b>。這個成語最常被誤用。' },
      { ask: '「你會怎麼查一個沒看過的成語？」', why: '教育部成語典。課綱 4-III-3 直接寫了「運用字辭典、成語辭典等」。' },
      { ask: '「這個人物是什麼樣的人？書上哪一句讓你這樣覺得？」', why: '重點在後半句。要他<b>指出證據</b>，這是讀書報告拿分的關鍵。' },
      { ask: '「這本書讓你想到自己的什麼事？」', why: '心得那一塊。連到自己的經驗，報告才不會像抄的。' },
      { ask: '「你會推薦這本書給誰？為什麼？」', why: '推薦那一塊。逼他講理由，順便練議論。' }
    ],

    pitfalls: [
      { bad: '把「不置可否」當成「不同意」。', fix: '「不置可否」是<b>兩邊都不表態</b>，既沒說好也沒說不好。' },
      { bad: '把「煞有介事」當成褒義。', fix: '它帶有<b>「其實沒什麼，卻裝得很像一回事」</b>的意味，用在自己身上要小心。' },
      { bad: '成語只背意思，不看例句。', fix: '查成語典時<b>一定要看例句</b>。知道意思卻用錯場合，比不會用更容易被扣分。', src: '4-III-3' },
      { bad: '寫人物直接寫「他是一個很善良的人」。', fix: '要<b>引用書裡的行為當證據</b>。「他每次分東西都先看有沒有人拿得少」比「他很善良」有力得多。' },
      { bad: '讀書報告的大意整段抄書背簡介。', fix: '大意要<b>用自己的話</b>，而且要短。抄的一看就知道。', src: '5-III-6' },
      { bad: '心得只寫「這本書很好看，我很喜歡」。', fix: '要寫<b>讓你想到什麼</b>、<b>改變了什麼想法</b>。分數都在這一塊。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['idiom', 'idiom', 'idiomUse', 'idiomBack', 'char', 'report', 'reportBad']);

      if (type === 'idiom') {
        const it = pick(IDIOMS);
        const o = pick4(it.m, IDIOMS.filter(function (x) { return x.w !== it.w; }).map(function (x) { return x.m; }));
        return {
          tpl: 'idiom',
          q: '成語「<b>' + it.w + '</b>」是什麼意思？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + it.w + '</b>：' + it.m + '<br>' +
            '例句：' + it.u + '<br>' +
            '這個詞出現在' + it.L + '。查成語可以用<b>教育部成語典</b>，記得順便看例句。'
        };
      }

      if (type === 'idiomBack') {
        const it = pick(IDIOMS);
        const o = pick4(it.w, IDIOMS.filter(function (x) { return x.w !== it.w; }).map(function (x) { return x.w; }));
        return {
          tpl: 'idiomBack',
          q: '「' + it.m + '」，用哪一個<b>成語</b>來說最合適？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + it.w + '</b>：' + it.m + '<br>' +
            '例句：' + it.u + '<br>' +
            '從意思找成語，比從成語找意思難。多看例句是最有效的方法。'
        };
      }

      if (type === 'idiomUse') {
        const it = pick(IDIOMS);
        const other = pick(IDIOMS.filter(function (x) { return x.w !== it.w; }));
        const blank = it.u.replace(it.w, '＿＿＿＿');
        const o = pick4(it.w, IDIOMS.filter(function (x) { return x.w !== it.w; }).map(function (x) { return x.w; }));
        return {
          tpl: 'idiomUse',
          q: '「' + blank + '」<br>空格要填哪一個成語？',
          choices: o.choices, answer: o.answer,
          steps: '正確：<b>' + it.w + '</b>（' + it.m + '）<br>' +
            '完整句子：' + it.u + '<br>' +
            '填空的方法：先看句子在講什麼情境，再找意思對得上的成語。'
        };
      }

      if (type === 'char') {
        const c = pick(CHARACTER);
        const o = pick4(c.k, CHARACTER.filter(function (x) { return x.k !== c.k; }).map(function (x) { return x.k; }));
        return {
          tpl: 'char',
          q: '「' + c.s + '」<br>這段話寫的是一個什麼樣的人？',
          choices: o.choices, answer: o.answer,
          steps: '這是一個<b>' + c.k + '</b>的人。<br>' + c.how + '<br>' +
            '小說很少直接說「他很善良」，而是<b>讓他做一件事</b>。' +
            '寫讀書報告時，記得把那個行為<b>當成證據引用出來</b>。'
        };
      }

      if (type === 'reportBad') {
        const o = shuffled([
          { t: '把書背的簡介整段抄下來當大意', ok: true },
          { t: '用自己的話把故事說一次' },
          { t: '挑一個印象最深的段落並說明原因' },
          { t: '寫出這本書讓自己想到的事' }
        ]);
        return {
          tpl: 'reportBad',
          q: '寫讀書報告時，下面哪一種做法<b>不好</b>？',
          choices: o.choices, answer: o.answer,
          steps: '<b>抄書背簡介</b>不行。大意要用<b>自己的話</b>，而且要短。<br>' +
            '讀書報告的五塊：書名與作者 → 內容大意 → 印象最深的部分 → 心得與想法 → 推薦或建議。<br>' +
            '分數的關鍵在第三、四塊的<b>「為什麼」</b>。'
        };
      }

      // report：五塊
      const r = pick(REPORT);
      const o = pick4(r.d, REPORT.filter(function (x) { return x.n !== r.n; }).map(function (x) { return x.d; }));
      return {
        tpl: 'report',
        q: '讀書報告的「<b>' + r.n.replace(/^[一二三四五]、/, '') + '</b>」要寫什麼？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + r.n + '</b>：' + r.d + '<br>' +
          '※ ' + r.tip + '<br>' +
          '五塊順序：書名與作者 → 內容大意 → 印象最深的部分 → 心得與想法 → 推薦或建議。'
      };
    }
  });

})();
