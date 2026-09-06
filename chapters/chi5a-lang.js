/* ============================================================
   教具 chi5a-u1 當我們同在一起　chi5a-u2 生活大小事
        chi5a-u3 自然的樂章　　　chi5a-u4 平凡中的特別
   翰林 115：五上（第九冊）第壹～肆單元，四個統整活動的語文能力

   ⚠️ 課文是出版社的著作，這裡<b>一句都不引用</b>。
      所有例句、短文、練習題都是為了這個教具另外寫的。
      生字與語詞取自教育部教育百科「生字詞彙表」（翰林版五年級上學期），
      只用字和詞本身，不用課文內容。
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

  /* 從候選中挑一個正確答案 + 三個誘答，回傳 {choices, answer} */
  function pick4(right, wrongs) {
    /* 誘答不能等於正解，也不能彼此重複 */
    const seen = {}; seen[right] = 1;
    const uniq = [];
    shuffle(wrongs).forEach(function (x) { if (!seen[x]) { seen[x] = 1; uniq.push(x); } });
    const all = shuffle([right].concat(uniq.slice(0, 3)));
    return { choices: all, answer: all.indexOf(right) };
  }
  /* 給一組 {t, ok} 物件，洗牌後回傳 {choices, answer} */
  function shuffled(items) {
    const a = shuffle(items);
    return { choices: a.map(function (x) { return x.t; }), answer: a.findIndex(function (x) { return x.ok; }) };
  }

  /* ---------- 共用畫布小工具 ---------- */
  function clear(cv) {
    const ctx = cv.ctx;
    cv.clear(C.bg);
    ctx.font = '14px ' + FONT;
    return ctx;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  /* 一個字的方格：田字格 + 字 */
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
  /* 左邊起排版的文字面板；回傳一個 write(text, color, size, gap) */
  function panel(ctx, x, y, w) {
    let cy = y;
    return function (text, color, size, gap) {
      text = String(text).replace(/<[^>]+>/g, '');      // 畫布上不能出現標籤
      size = size || 14;
      ctx.save();
      ctx.fillStyle = color || C.text;
      ctx.font = size + 'px ' + FONT;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      let line = '';
      const push = function () { if (line) { ctx.fillText(line, x, cy); cy += size + 6; line = ''; } };
      for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === '\n') { push(); continue; }
        /* 標點不能落在行首：先試著把它接在目前這行 */
        if (ctx.measureText(line + c).width > w && line) {
          if ('，。、；：？！」）'.indexOf(c) >= 0) { ctx.fillText(line + c, x, cy); cy += size + 6; line = ''; continue; }
          push();
        }
        line += c;
      }
      push();
      cy += (gap || 0);
      ctx.restore();
      return cy;
    };
  }
  function title(ctx, x, y, text, color) {
    ctx.save();
    ctx.fillStyle = color || C.accent;
    ctx.font = 'bold 16px ' + FONT;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
    ctx.restore();
  }


  /* ============================================================
     生字與語詞資料（教育部教育百科「生字詞彙表」翰林版五上）
     ============================================================ */

  /* 部件拆解表。只收「部首明顯、另一半也是常見獨立字」的字，
     避免拆出孩子沒看過的偏旁，也避免部首有爭議的字。
     結構：左右／上下／半包圍 */
  const GLYPHS = [
    { c: '蝟', r: '虫', p: '胃', s: '左右', rn: '虫', rm: '和蟲類、小動物有關', L: 1 },
    { c: '螞', r: '虫', p: '馬', s: '左右', rn: '虫', rm: '和蟲類、小動物有關', L: 11 },
    { c: '笛', r: '竹', p: '由', s: '上下', rn: '竹', rm: '和竹子做的東西有關', L: 2 },
    { c: '簡', r: '竹', p: '間', s: '上下', rn: '竹', rm: '和竹子做的東西有關', L: 2 },
    { c: '筍', r: '竹', p: '旬', s: '上下', rn: '竹', rm: '和竹子做的東西有關', L: 4 },
    { c: '玻', r: '玉', p: '皮', s: '左右', rn: '王（玉）', rm: '和玉石、光滑的石頭有關', L: 9 },
    { c: '諸', r: '言', p: '者', s: '左右', rn: '言', rm: '和說話、語言有關', L: 3 },
    { c: '偉', r: '人', p: '韋', s: '左右', rn: '亻（人）', rm: '和人有關', L: 10 },
    { c: '挺', r: '手', p: '廷', s: '左右', rn: '扌（手）', rm: '和手的動作有關', L: 3 },
    { c: '格', r: '木', p: '各', s: '左右', rn: '木', rm: '和樹木、木頭有關', L: 10 },
    { c: '棲', r: '木', p: '妻', s: '左右', rn: '木', rm: '和樹木、木頭有關', L: 9 },
    { c: '測', r: '水', p: '則', s: '左右', rn: '氵（水）', rm: '和水有關', L: 9 },
    { c: '英', r: '艸', p: '央', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 5 },
    { c: '茂', r: '艸', p: '戊', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 7 },
    { c: '葫', r: '艸', p: '胡', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 8 },
    { c: '蘆', r: '艸', p: '盧', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 8 },
    { c: '蔓', r: '艸', p: '曼', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 8 },
    { c: '蒲', r: '艸', p: '浦', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 11 },
    { c: '蓬', r: '艸', p: '逢', s: '上下', rn: '艹（艸）', rm: '和草本植物有關', L: 11 },
    { c: '銳', r: '金', p: '兌', s: '左右', rn: '釒（金）', rm: '和金屬有關', L: 10 },
    { c: '納', r: '糸', p: '內', s: '左右', rn: '糹（糸）', rm: '和絲線、布有關', L: 10 },
    { c: '砂', r: '石', p: '少', s: '左右', rn: '石', rm: '和石頭有關', L: 11 },
    { c: '裙', r: '衣', p: '君', s: '左右', rn: '衤（衣）', rm: '和衣服有關', L: 12 },
    { c: '嘈', r: '口', p: '曹', s: '左右', rn: '口', rm: '和嘴巴、聲音有關', L: 12 },
    { c: '塑', r: '土', p: '朔', s: '上下', rn: '土', rm: '和泥土有關', L: 6 , rp: '下' },
    { c: '曠', r: '日', p: '廣', s: '左右', rn: '日', rm: '和太陽、光亮有關', L: 7 },
    { c: '髒', r: '骨', p: '葬', s: '左右', rn: '骨', rm: '和骨頭、身體有關', L: 12 },
    { c: '律', r: '彳', p: '聿', s: '左右', rn: '彳', rm: '和行走、路有關', L: 2 },
    { c: '膩', r: '肉', p: '貳', s: '左右', rn: '月（肉）', rm: '和身體、肉有關', L: 10 },
    { c: '返', r: '辵', p: '反', s: '半包圍', rn: '辶（辵）', rm: '和行走、移動有關', L: 7 },
    { c: '逐', r: '辵', p: '豕', s: '半包圍', rn: '辶（辵）', rm: '和行走、移動有關', L: 4 },
    { c: '寂', r: '宀', p: '叔', s: '上下', rn: '宀', rm: '和房屋有關', L: 7 },
    { c: '廳', r: '广', p: '聽', s: '半包圍', rn: '广', rm: '和房屋有關', L: 4 , rp: '左上' },
    { c: '廢', r: '广', p: '發', s: '半包圍', rn: '广', rm: '和房屋有關', L: 6 , rp: '左上' },
    { c: '置', r: '网', p: '直', s: '上下', rn: '罒（网）', rm: '和網子有關', L: 12 },
    { c: '幼', r: '幺', p: '力', s: '左右', rn: '幺', rm: '和細小有關', L: 8 },
    { c: '覓', r: '見', p: '爪', s: '上下', rn: '見', rm: '和看有關', L: 9 , rp: '下' },
    { c: '耐', r: '而', p: '寸', s: '左右', rn: '而', rm: '' , L: 1 },
    { c: '盃', r: '皿', p: '不', s: '上下', rn: '皿', rm: '和器皿、容器有關', L: 6 , rp: '下' }
  ];

  /* 部首在字裡的位置。多數可以從結構推，但有幾個字要個別指定，
     例如「塑」的土在下面、「廳」的广是從左上包住，不能一律說「在上面」。 */
  function radPos(g) {
    const rp = g.rp || (g.s === '上下' ? '上' : g.s === '左右' ? '左' : '左下');
    return { '上': '在上面', '下': '在下面', '左': '在左邊',
             '左上': '在左上角包住', '左下': '在左下角包住' }[rp];
  }

  /* 同部首分組，出「哪個字和它同部首」用 */
  const BY_RADICAL = (function () {
    const m = {};
    GLYPHS.forEach(function (g) { (m[g.r] = m[g.r] || []).push(g); });
    return m;
  })();
  const MULTI_RADICALS = Object.keys(BY_RADICAL).filter(function (k) { return BY_RADICAL[k].length >= 2; });

  /* 相反（相對）語詞。左邊盡量取課本語詞。 */
  /* 相反（相對）語詞。
     g = 語意群組：同一群的詞意思互相牽連，出誘答時整群都要避開，
     否則會出現「兩個選項都對」的題目（例如問「嘈雜」，安靜和吵鬧都算）。
     ex = 例句，手寫的，因為自動套版對名詞類的詞會不通順。 */
  const OPPOSITES = [
    { a: '熟悉', b: '陌生', g: 'familiar', ex: '這條路他原本很陌生，走了一個月之後就熟悉了。' },
    { a: '和諧', b: '衝突', g: 'harmony', ex: '兩個人本來有點衝突，聊開之後又變得和諧。' },
    { a: '融洽', b: '疏遠', g: 'harmony', ex: '剛開學時大家有點疏遠，一起打掃幾次就融洽多了。' },
    { a: '真誠', b: '虛偽', g: 'sincere', ex: '他的道歉聽起來很真誠，不像是虛偽的客套話。' },
    { a: '幽靜', b: '喧鬧', g: 'noise', ex: '白天很喧鬧的巷子，晚上變得相當幽靜。' },
    { a: '嘈雜', b: '安靜', g: 'noise', ex: '下課時走廊很嘈雜，上課鐘一響就安靜下來。' },
    { a: '敏銳', b: '遲鈍', g: 'sharp', ex: '他對聲音很敏銳，一點小動靜都聽得出來。' },
    { a: '細膩', b: '粗糙', g: 'fine', ex: '砂紙摸起來粗糙，磨過的木頭卻變得細膩。' },
    { a: '單純', b: '複雜', g: 'simple', ex: '規則看起來複雜，其實想通了很單純。' },
    { a: '茂密', b: '稀疏', g: 'dense', ex: '春天剛冒芽時葉子還很稀疏，入夏就長得茂密了。' },
    { a: '漆黑', b: '明亮', g: 'light', ex: '房間本來一片漆黑，開了燈才變得明亮。' },
    { a: '尊重', b: '輕視', g: 'respect', ex: '每個人的意見都值得尊重，不應該被輕視。' },
    { a: '羞辱', b: '尊敬', g: 'respect', ex: '他不但沒有羞辱對方，反而更讓人尊敬。' },
    { a: '聰明', b: '愚笨', g: 'smart', ex: '這個辦法看起來愚笨，用起來卻很聰明。' },
    { a: '缺席', b: '出席', g: 'attend', ex: '他上次缺席，這次一定會出席。' },
    { a: '違法', b: '守法', g: 'law', ex: '守法是每個人的責任，違法就要負起後果。' },
    { a: '錯愕', b: '鎮定', g: 'shock', ex: '大家都很錯愕，只有他還很鎮定。' },
    { a: '逐漸', b: '立刻', g: 'speed', ex: '事情不會立刻改變，只會逐漸變好。' },
    { a: '充滿', b: '缺乏', g: 'full', ex: '這間教室缺乏光線，走廊卻充滿陽光。' },
    { a: '凸顯', b: '掩蓋', g: 'show', ex: '他想掩蓋錯誤，反而凸顯了問題。' },
    { a: '悠閒', b: '忙碌', g: 'busy', ex: '平日很忙碌，週末才有悠閒的時間。' }
  ];

  /* 相似語詞（g 沿用上面的群組） */
  const SIMILAR = [
    { a: '熟悉', b: '熟識', g: 'familiar' },
    { a: '嘈雜', b: '喧鬧', g: 'noise' },
    { a: '敏銳', b: '靈敏', g: 'sharp' },
    { a: '茂密', b: '繁茂', g: 'dense' },
    { a: '逐漸', b: '漸漸', g: 'speed' },
    { a: '真誠', b: '誠懇', g: 'sincere' },
    { a: '錯愕', b: '驚訝', g: 'shock' },
    { a: '凸顯', b: '突出', g: 'show' },
    { a: '悠閒', b: '閒適', g: 'busy' },
    { a: '細膩', b: '細緻', g: 'fine' }
  ];

  /* 出誘答用：把不同群組的詞全部攤平 */
  function wordsOutside(group) {
    const out = [];
    OPPOSITES.forEach(function (x) { if (x.g !== group) { out.push(x.a); out.push(x.b); } });
    SIMILAR.forEach(function (x) { if (x.g !== group) { out.push(x.a); out.push(x.b); } });
    return out;
  }


  /* ============================================================
     第壹單元　當我們同在一起
     統整活動一：部件與字形結構、相反（相對）語詞、轉折、敘事文要素
     ============================================================ */
  const NARR = [
    { k: '人', t: '誰？', d: '故事裡有哪些人，主角是誰。', e: '轉學來的同學、班上的我們' },
    { k: '時', t: '什麼時候？', d: '哪一天、哪個季節、事情前後花了多久。', e: '開學第二週的午休' },
    { k: '地', t: '在哪裡？', d: '事情發生的場所。', e: '教室後面的走廊' },
    { k: '起因', t: '為什麼開始？', d: '事情是被什麼引起的。', e: '他一個人站著，沒有人跟他說話' },
    { k: '經過', t: '中間發生什麼？', d: '一步一步怎麼發展，這裡通常最長。', e: '有人先開口問他要不要一起玩' },
    { k: '結果', t: '最後怎麼了？', d: '事情收在哪裡，人有什麼改變。', e: '午休結束時，他已經在笑了' },
    { k: '感受', t: '我想到什麼？', d: '寫出自己的想法，文章才不會只是流水帳。', e: '原來讓人不孤單，只要先開口' }
  ];

  Kit.register('chi5a-u1', {

    intro: '國字不是一筆一畫硬背的，大部分是<b>部件</b>拼出來的。切換三個模式：<b>拆字</b>看部首在哪、代表什麼意思，<b>相反詞</b>練成對出現的語詞，<b>敘事</b>看一件事怎麼說得完整。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'glyph', gi = 0, oi = 0, step = 4;

      function paintGlyph() {
        const ctx = clear(cv);
        const g = GLYPHS[gi];
        title(ctx, 24, 18, '拆字：' + g.c, C.chi);

        /* 上排：整個字 = 部首 + 另一個部件 */
        const S = 96, y = 56;
        glyphBox(ctx, 24, y, S, g.c, C.text, '第 ' + g.L + ' 課生字');
        ctx.save();
        ctx.fillStyle = C.muted; ctx.font = '30px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('=', 24 + S + 26, y + S / 2);
        ctx.fillText('+', 24 + S + 52 + S + 26, y + S / 2);
        ctx.restore();
        glyphBox(ctx, 24 + S + 52, y, S, g.r, C.warn, '部首');
        glyphBox(ctx, 24 + (S + 52) * 2, y, S, g.p, C.accent, '另一個部件');

        /* 結構示意圖 */
        const bx = 24, by = y + S + 46;
        ctx.save();
        ctx.strokeStyle = C.purple; ctx.lineWidth = 2;
        const B = 62;
        if (g.s === '左右') {
          roundRect(ctx, bx, by, B / 2 - 2, B, 4); ctx.stroke();
          roundRect(ctx, bx + B / 2 + 2, by, B / 2 - 2, B, 4); ctx.stroke();
        } else if (g.s === '上下') {
          roundRect(ctx, bx, by, B, B / 2 - 2, 4); ctx.stroke();
          roundRect(ctx, bx, by + B / 2 + 2, B, B / 2 - 2, 4); ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(bx + B, by); ctx.lineTo(bx, by);
          ctx.lineTo(bx, by + B); ctx.lineTo(bx + B, by + B);
          ctx.stroke();
          roundRect(ctx, bx + B * 0.42, by + B * 0.28, B * 0.5, B * 0.5, 4); ctx.stroke();
        }
        ctx.fillStyle = C.purple; ctx.font = 'bold 14px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(g.s, bx + B / 2, by + B + 8);
        ctx.restore();

        const w = panel(ctx, bx + B + 34, by - 4, 380);
        w('部首是「' + g.rn + '」。', C.warn, 15, 4);
        if (g.rm) w(g.rm + '，所以看到部首就先猜得到意思的方向。', C.text, 14, 6);
        else w('這個部首比較少見，記住「' + g.c + '」是它就好。', C.text, 14, 6);
        w('字形結構：' + g.s + '，部首' + radPos(g) + '。查字典時先找部首「' + g.r + '」。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + g.c + '</b>　部首 <b>' + g.rn + '</b>　結構 <b>' + g.s + '</b>　' +
          '<span class="muted">第 ' + g.L + ' 課</span>';
      }

      function paintOpp() {
        const ctx = clear(cv);
        const pr = OPPOSITES[oi];
        title(ctx, 24, 18, '相反（相對）語詞', C.chi);

        const S = 84, y = 76;
        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, y - 14, 572, S + 40, 10); ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = C.ok; ctx.font = 'bold 34px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pr.a, 150, y + S / 2);
        ctx.fillStyle = C.no;
        ctx.fillText(pr.b, 470, y + S / 2);
        ctx.fillStyle = C.muted; ctx.font = '22px ' + FONT;
        ctx.fillText('◀　相反　▶', 310, y + S / 2);
        ctx.restore();

        const w = panel(ctx, 24, y + S + 48, 572);
        w('把相反的兩個詞擺在一起，句子的對比會變得很清楚。', C.text, 15, 8);
        w('例句：' + pr.ex, C.accent, 14, 8);
        w('寫作文想強調變化的時候，這一招很好用：先寫原本的樣子，再寫相反的樣子。', C.muted, 13, 0);

        readout.innerHTML = '<b>' + pr.a + '</b> ↔ <b>' + pr.b + '</b>　' +
          '<span class="muted">第 ' + (oi + 1) + ' 組，共 ' + OPPOSITES.length + ' 組</span>';
      }

      function paintNarr() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '一件事要說得完整，需要這幾樣', C.chi);
        let y = 48;
        for (let i = 0; i < NARR.length; i++) {
          const n = NARR[i], on = i < step;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 42, 8); ctx.fill();
          ctx.fillStyle = on ? (i >= 3 ? C.warn : C.accent) : '#2b3f63';
          ctx.font = 'bold 17px ' + FONT;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(n.k, 60, y + 21);
          ctx.textAlign = 'left';
          ctx.fillStyle = on ? C.text : '#3a4b6b'; ctx.font = '14px ' + FONT;
          ctx.fillText(n.t + '　' + n.d, 96, y + 15);
          ctx.fillStyle = on ? C.muted : '#2b3f63'; ctx.font = '12px ' + FONT;
          ctx.fillText('例：' + n.e, 96, y + 32);
          ctx.restore();
          y += 48;
        }
        readout.innerHTML = '已顯示 <b>' + step + '</b> / ' + NARR.length + ' 項　' +
          '<span class="muted">' + (step < 4 ? '前三項是「背景」' : step < 7 ? '起因、經過、結果是「骨架」' : '最後加上感受，文章才有溫度') + '</span>';
      }

      function paint() {
        if (mode === 'glyph') paintGlyph();
        else if (mode === 'opp') paintOpp();
        else paintNarr();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '拆字', value: 'glyph' }, { label: '相反詞', value: 'opp' }, { label: '敘事', value: 'narr' }], function (v) { mode = v; syncRow(); paint(); }, 'glyph'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'glyph') gi = (gi - 1 + GLYPHS.length) % GLYPHS.length;
        else if (mode === 'opp') oi = (oi - 1 + OPPOSITES.length) % OPPOSITES.length;
        else step = Math.max(1, step - 1);
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'glyph') gi = (gi + 1) % GLYPHS.length;
        else if (mode === 'opp') oi = (oi + 1) % OPPOSITES.length;
        else step = Math.min(NARR.length, step + 1);
        paint();
      });
      const bRand = Kit.button('隨機一個', function () {
        if (mode === 'glyph') gi = randInt(0, GLYPHS.length - 1);
        else if (mode === 'opp') oi = randInt(0, OPPOSITES.length - 1);
        else step = NARR.length;
        paint();
      });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bRand);
      function syncRow() { bRand.style.display = (mode === 'narr') ? 'none' : ''; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「這個字的部首是哪一邊？」', why: '先問部首，再問另一半。查字典、猜字義都靠這個。孩子答不出來時，讓他看畫面上黃色的那一格。' },
      { ask: '「部首是艹的字，通常和什麼有關？」', why: '草本植物。部首會透露意思的方向，這比一個一個死背有效太多。可以連問虫、氵、扌。' },
      { ask: '「這個字是左右還是上下？」', why: '字形結構影響書寫時的比例。左右結構要寫得瘦一點，上下結構要壓扁一點，字才好看。' },
      { ask: '「熟悉的相反是什麼？」', why: '相反詞成對記，一次記兩個。答對了再追問：「你能不能造一個句子，兩個詞都用到？」' },
      { ask: '「你今天在學校發生的事，講給我聽。」', why: '聽完問他：時間、地點、起因說了嗎？用畫面上那七格檢查，比說「你要講清楚一點」具體得多。' },
      { ask: '「這件事最後你有什麼感覺？」', why: '很多孩子的作文只有經過沒有感受。感受那一格是把記敘文從流水帳拉起來的關鍵。' }
    ],

    pitfalls: [
      { bad: '把「部件」和「部首」當成同一件事。', fix: '一個字可以拆成好幾個<b>部件</b>，其中<b>只有一個</b>是查字典用的<b>部首</b>。畫面上黃色那格才是部首。', src: '4-III-2' },
      { bad: '以為部首一定在左邊。', fix: '「笛」的部首竹在<b>上面</b>，「盃」的部首皿在<b>下面</b>，「返」的部首辶從<b>左下角包住</b>，「廳」的部首广從<b>左上角包住</b>。部首的位置要一個字一個字看。' },
      { bad: '看到形聲字就以為右邊的部件會唸什麼，整個字就唸什麼。', fix: '很多時候只是<b>接近</b>，不是完全一樣。「測」右邊是則，但唸ㄘㄜˋ不唸ㄗㄜˊ。聲音只能拿來提示，不能拿來確定。' },
      { bad: '相反詞只想到加「不」。', fix: '「不熟悉」是否定，<b>「陌生」才是相反詞</b>。相反詞是另一個獨立的詞，不是把原來的詞加上否定。' },
      { bad: '寫記敘文只寫「經過」，沒有起因和結果。', fix: '沒有<b>起因</b>，讀的人不知道為什麼要發生；沒有<b>結果</b>，故事像斷掉。七格裡至少要有人、時、地、起因、經過、結果。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['radical', 'radical', 'meaning', 'struct', 'sameRad', 'opp', 'similar', 'turn', 'narr', 'narrOrder']);

      if (type === 'radical') {
        const g = pick(GLYPHS);
        /* 誘答要是「不同的部首」，同一個部首只能出現一次 */
        const seenR = {}; seenR[g.r] = 1;
        const others = [];
        shuffle(GLYPHS).forEach(function (x) { if (!seenR[x.r]) { seenR[x.r] = 1; others.push(x.rn); } });
        const o = pick4(g.rn, others);
        return {
          tpl: 'radical',
          q: '「<b>' + g.c + '</b>」這個字的<b>部首</b>是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '「' + g.c + '」可以拆成「' + g.r + '」和「' + g.p + '」兩個部件。<br>' +
            '查字典用的部首是<b>' + g.rn + '</b>，' + (g.rm ? g.rm + '。' : '這個部首比較少見。') + '<br>' +
            '字形結構是<b>' + g.s + '</b>，部首' + radPos(g) + '。'
        };
      }

      if (type === 'meaning') {
        const g = pick(GLYPHS.filter(function (x) { return x.rm; }));
        const pool = ['和水有關', '和金屬有關', '和說話、語言有關', '和草本植物有關', '和房屋有關',
          '和蟲類、小動物有關', '和手的動作有關', '和樹木、木頭有關', '和衣服有關', '和石頭有關'];
        const o = pick4(g.rm, pool.filter(function (x) { return x !== g.rm; }));
        return {
          tpl: 'meaning',
          q: '「<b>' + g.c + '</b>」的部首是「' + g.rn + '」，這個部首的字通常和什麼有關？',
          choices: o.choices, answer: o.answer,
          steps: '部首會透露一個字<b>意思的方向</b>。<br>' +
            '「' + g.rn + '」部的字' + g.rm + '。<br>' +
            '所以看到不認識的字，先看部首，就能猜個大概；這也是查字典的第一步。'
        };
      }

      if (type === 'struct') {
        const g = pick(GLYPHS);
        const o = pick4(g.s, ['左右', '上下', '半包圍'].filter(function (x) { return x !== g.s; }));
        return {
          tpl: 'struct',
          q: '「<b>' + g.c + '</b>」的<b>字形結構</b>是下面哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '「' + g.c + '」＝「' + g.r + '」＋「' + g.p + '」。<br>' +
            '兩個部件是' + (g.s === '左右' ? '<b>並排在左右兩邊</b>' : g.s === '上下' ? '<b>疊在上下兩層</b>' : '<b>一邊從外面包住另一邊</b>') + '，所以是<b>' + g.s + '</b>結構。<br>' +
            '知道結構，寫字的時候才知道要把哪一邊寫窄一點。'
        };
      }

      if (type === 'sameRad') {
        const r = pick(MULTI_RADICALS);
        const two = shuffle(BY_RADICAL[r]).slice(0, 2);
        const right = two[1].c;
        const others = shuffle(GLYPHS.filter(function (x) { return x.r !== r; })).slice(0, 3);
        const o = pick4(right, others.map(function (x) { return x.c; }));
        return {
          tpl: 'sameRad',
          q: '下面哪一個字，和「<b>' + two[0].c + '</b>」的<b>部首相同</b>？',
          choices: o.choices, answer: o.answer,
          steps: '「' + two[0].c + '」的部首是<b>' + two[0].rn + '</b>。<br>' +
            '「' + right + '」＝「' + two[1].r + '」＋「' + two[1].p + '」，部首也是<b>' + two[1].rn + '</b>，兩個字同部首。<br>' +
            '同部首的字，意思常常在同一個範圍：' + (two[0].rm || '同一類事物') + '。'
        };
      }

      if (type === 'opp') {
        const pr = pick(OPPOSITES);
        const flip = Math.random() < 0.5;
        const ask = flip ? pr.b : pr.a, right = flip ? pr.a : pr.b;
        const o = pick4(right, wordsOutside(pr.g));
        return {
          tpl: 'opp',
          q: '「<b>' + ask + '</b>」的<b>相反詞</b>是哪一個？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + pr.a + ' ↔ ' + pr.b + '</b>。<br>' +
            '相反詞是<b>另一個獨立的詞</b>，不是在原來的詞前面加「不」。<br>' +
            '例句：' + pr.ex + '　兩個詞擺在一起，對比最清楚。'
        };
      }

      if (type === 'similar') {
        const pr = pick(SIMILAR);
        const o = pick4(pr.b, wordsOutside(pr.g));
        return {
          tpl: 'similar',
          q: '「<b>' + pr.a + '</b>」的意思，和下面哪一個詞<b>最接近</b>？',
          choices: o.choices, answer: o.answer,
          steps: '「' + pr.a + '」和「' + pr.b + '」意思接近，是<b>相似詞</b>。<br>' +
            '注意題目問的是<b>接近</b>，不是相反。作答前先看清楚問的是哪一種。<br>' +
            '寫作文時換用相似詞，可以避免同一個詞一直重複。'
        };
      }

      if (type === 'turn') {
        const cases = [
          { s: '練習了整個下午，他的直笛還是吹不順。', ok: '雖然⋯⋯還是／仍然⋯⋯', why: '前面努力、後面沒成功，是<b>轉折</b>。' },
          { s: '天氣很冷，他仍然每天早起去操場跑步。', ok: '雖然⋯⋯還是／仍然⋯⋯', why: '前面是阻礙、後面照樣做，是<b>轉折</b>。' },
          { s: '他以為會被責備，結果老師只是笑了笑。', ok: '本來以為⋯⋯結果⋯⋯', why: '結果和預期相反，是<b>意料之外</b>的轉折。' },
          { s: '走廊本來很嘈雜，鐘聲一響就安靜下來。', ok: '本來⋯⋯一⋯⋯就⋯⋯', why: '前後狀態相反，用<b>對比</b>寫出變化。' }
        ];
        const c = pick(cases);
        const o = pick4(c.ok, cases.filter(function (x) { return x.ok !== c.ok; }).map(function (x) { return x.ok; })
          .concat(['因為⋯⋯所以⋯⋯', '不但⋯⋯而且⋯⋯', '如果⋯⋯就⋯⋯']));
        return {
          tpl: 'turn',
          q: '「' + c.s + '」<br>這個句子用的是哪一種關聯？',
          choices: o.choices, answer: o.answer,
          steps: c.why + '<br>' +
            '「因為⋯⋯所以⋯⋯」是<b>因果</b>，前後方向一致；<br>' +
            '「不但⋯⋯而且⋯⋯」是<b>遞進</b>，後面比前面更進一步。<br>' +
            '判斷訣竅：<b>後半句有沒有推翻前半句的期待</b>？有，就是轉折。'
        };
      }

      if (type === 'narrOrder') {
        const o = shuffled([
          { t: '起因 → 經過 → 結果', ok: true },
          { t: '結果 → 起因 → 經過' },
          { t: '經過 → 起因 → 結果' },
          { t: '結果 → 經過 → 起因' }
        ]);
        return {
          tpl: 'narrOrder',
          q: '寫一件事情的經過，最<b>基本</b>的順序是哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '記敘文的骨架是<b>起因 → 經過 → 結果</b>。<br>' +
            '起因說明「為什麼會發生」，經過是中間一步一步的發展，結果是「最後怎麼了」。<br>' +
            '（進階寫法可以先寫結果再倒回去，叫倒敘；但基本順序要先熟。）'
        };
      }

      // narr：缺了哪一項
      const miss = pick(NARR.slice(0, 6));
      const o = pick4(miss.k, NARR.filter(function (x) { return x.k !== miss.k; }).map(function (x) { return x.k; }));
      return {
        tpl: 'narr',
        q: '記敘文的要素中，「' + miss.t + '」問的是哪一項？',
        choices: o.choices, answer: o.answer,
        steps: '「' + miss.t + '」就是<b>' + miss.k + '</b>：' + miss.d + '<br>' +
          '例如：' + miss.e + '<br>' +
          '寫完一段之後回頭檢查：人、時、地、起因、經過、結果，哪一項漏了。'
      };
    }
  });


  /* ============================================================
     第貳單元　生活大小事
     統整活動二：說明的表述方式（引用、列舉）、意義段、語句重點
     ============================================================ */

  /* 說明方法的例句，全部自己寫，不取課文 */
  const EXPLAIN = [
    { m: '舉例', s: '許多桌遊都需要動腦，像是圍棋、跳棋和撲克牌。', why: '用「像是」帶出幾個實際的例子，讓抽象的說法變具體。' },
    { m: '舉例', s: '有些昆蟲靠顏色保護自己，例如竹節蟲把自己變得像一根樹枝。', why: '用「例如」舉出一個具體對象來說明前面的道理。' },
    { m: '列舉', s: '製作一份桌遊，需要四樣東西：規則、卡牌、棋子和一張底圖。', why: '先說「四樣」，再把項目一項一項排出來，這是<b>列舉</b>。' },
    { m: '列舉', s: '這種鳥的一天分成三段：清晨覓食、中午棲息、傍晚回巢。', why: '把內容切成幾項並列出來，讀的人一眼就數得出有幾件事。' },
    { m: '引用', s: '古人說「一寸光陰一寸金」，時間比金子還難買回來。', why: '把<b>別人說過的話</b>放進文章，用來加強自己的說法。' },
    { m: '引用', s: '氣象報告指出：「今年冬天的雨量比往年少。」', why: '引用別人的原話，通常會用<b>引號</b>把它框起來。' },
    { m: '數據', s: '這座公園裡記錄到的鳥類超過四十種，其中一半是留鳥。', why: '用<b>數字</b>說話，比「很多」更有說服力。' },
    { m: '數據', s: '一個寶特瓶大約要四百年才會分解完。', why: '具體的數字讓讀者感受到事情的規模。' },
    { m: '比較', s: '直笛的聲音清亮，二胡的聲音低沉，兩種樂器給人的感覺完全不同。', why: '把<b>兩樣東西擺在一起</b>對照，特色就浮出來了。' },
    { m: '比較', s: '和塑膠袋比起來，布袋雖然比較重，卻可以用上好幾年。', why: '用「和⋯⋯比起來」做對照，說明其中一方的優點。' },
    { m: '下定義', s: '所謂留鳥，就是一年四季都待在同一個地方、不遷移的鳥。', why: '用「所謂⋯⋯就是⋯⋯」把一個名詞的意思講清楚。' },
    { m: '下定義', s: '桌遊指的是在桌面上進行、需要和別人面對面互動的遊戲。', why: '「指的是」後面接的就是這個詞的<b>定義</b>。' }
  ];
  const EXPLAIN_METHODS = ['舉例', '列舉', '引用', '數據', '比較', '下定義'];

  /* 自己寫的短文：每篇 5 個自然段，標好各段主旨與意義段分組 */
  const PASSAGES = [
    {
      title: '午休的走廊',
      paras: [
        { t: '午休鐘一響，走廊本來安靜得聽得見風扇的聲音。', k: '安靜的走廊', g: 1 },
        { t: '後來有人搬來兩張桌子，開始下棋，圍過來看的人愈來愈多。', k: '人聚過來', g: 2 },
        { t: '棋盤旁邊很快就擠滿了人，說話聲一句蓋過一句。', k: '變得嘈雜', g: 2 },
        { t: '值日生只好貼了一張紙條，提醒大家把音量放小。', k: '想辦法處理', g: 3 },
        { t: '從那天起，走廊多了一個約定：可以下棋，但要小聲。', k: '有了新約定', g: 3 }
      ],
      groups: [
        { n: '第一段', idea: '原本的樣子', paras: '1' },
        { n: '第二段', idea: '情況怎麼改變', paras: '2、3' },
        { n: '第三段', idea: '怎麼解決、結果如何', paras: '4、5' }
      ],
      main: '走廊從安靜變得嘈雜，最後靠一個約定找到平衡。'
    },
    {
      title: '陽台上的葫蘆瓜',
      paras: [
        { t: '春天的時候，我在陽台種下一顆葫蘆瓜的種子。', k: '種下種子', g: 1 },
        { t: '過了兩個星期，幼苗冒出頭，藤蔓開始沿著竹竿往上攀爬。', k: '發芽長高', g: 2 },
        { t: '夏天一到，葉子長得非常茂密，把整面欄杆都遮住了。', k: '長得茂密', g: 2 },
        { t: '有一天早上，我發現葉子底下藏著一顆小小的果實。', k: '結出果實', g: 3 },
        { t: '原來只要每天澆一點水，時間就會把種子變成果實。', k: '得到的體會', g: 4 }
      ],
      groups: [
        { n: '第一段', idea: '事情的開始', paras: '1' },
        { n: '第二段', idea: '生長的過程', paras: '2、3' },
        { n: '第三段', idea: '結果', paras: '4' },
        { n: '第四段', idea: '自己的體會', paras: '5' }
      ],
      main: '從種下種子到結出果實，讓我體會到時間和耐心的力量。'
    }
  ];

  const KEYPOINT = [
    { s: '這種鳥雖然體型很小，飛行的速度卻非常快。', k: '飛得很快', w: '「雖然⋯⋯卻⋯⋯」的重點在<b>後半句</b>，前半句只是襯托。' },
    { s: '除了顏色鮮豔以外，這種花最特別的地方是香味。', k: '香味最特別', w: '「除了⋯⋯以外，最⋯⋯」的重點在<b>「最」的那一項</b>。' },
    { s: '不管天氣多冷，他每天早上都會去操場跑兩圈。', k: '每天都去跑步', w: '「不管⋯⋯都⋯⋯」的重點在<b>「都」後面</b>那件一直在做的事。' },
    { s: '這本書不但內容有趣，而且圖片也畫得很仔細。', k: '內容有趣，圖片也好', w: '「不但⋯⋯而且⋯⋯」是<b>兩件事都重要</b>，後面那件更進一步。' },
    { s: '與其抱怨房間太小，不如先把桌子整理乾淨。', k: '先整理桌子', w: '「與其⋯⋯不如⋯⋯」的重點在<b>「不如」後面</b>，那才是建議做的事。' }
  ];

  Kit.register('chi5a-u2', {

    intro: '說明一件事，可以舉例、可以列舉、可以引用別人的話。切換三個模式：<b>說明方法</b>看每一種怎麼用，<b>意義段</b>看幾個自然段怎麼併成一段大意，<b>找重點</b>練習抓出一句話真正想講什麼。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 420);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'method', mi = 0, pi = 0, showGroups = false;

      function paintMethod() {
        const ctx = clear(cv);
        const e = EXPLAIN[mi];
        title(ctx, 24, 18, '說明的方法：' + e.m, C.chi);

        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, 54, 572, 96, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 42, 72, 536)(e.s, C.text, 17, 0);

        const w = panel(ctx, 24, 172, 572);
        w('為什麼是「' + e.m + '」？', C.warn, 15, 6);
        w(e.why, C.text, 14, 14);
        w('六種常見的說明方法：', C.accent, 15, 6);
        w('舉例　用「像是」「例如」帶出實際的例子', C.muted, 13, 2);
        w('列舉　先說有幾項，再一項一項排出來', C.muted, 13, 2);
        w('引用　把別人說過的話放進來，通常加引號', C.muted, 13, 2);
        w('數據　用數字說明規模或程度', C.muted, 13, 2);
        w('比較　把兩樣東西擺在一起對照', C.muted, 13, 2);
        w('下定義　用「所謂⋯⋯就是⋯⋯」講清楚一個詞的意思', C.muted, 13, 0);

        readout.innerHTML = '第 <b>' + (mi + 1) + '</b> / ' + EXPLAIN.length + ' 句　方法：<b>' + e.m + '</b>';
      }

      function paintPassage() {
        const ctx = clear(cv);
        const p = PASSAGES[pi];
        title(ctx, 24, 16, '短文：' + p.title, C.chi);

        let y = 46;
        const gcolor = [C.accent, C.ok, C.warn, C.purple];
        for (let i = 0; i < p.paras.length; i++) {
          const pa = p.paras[i];
          const col = showGroups ? gcolor[(pa.g - 1) % 4] : C.line;
          ctx.save();
          ctx.fillStyle = C.card;
          roundRect(ctx, 40, y, 556, 52, 8); ctx.fill();
          ctx.fillStyle = col;
          roundRect(ctx, 24, y, 10, 52, 4); ctx.fill();
          ctx.fillStyle = C.muted; ctx.font = '12px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('第 ' + (i + 1) + ' 自然段', 52, y + 6);
          if (showGroups) {
            ctx.fillStyle = col; ctx.font = 'bold 12px ' + FONT;
            ctx.textAlign = 'right';
            ctx.fillText(pa.k, 584, y + 6);
          }
          ctx.restore();
          panel(ctx, 52, y + 24, 528)(pa.t, C.text, 14, 0);
          y += 58;
        }

        if (showGroups) {
          const w = panel(ctx, 24, y + 6, 572);
          w('併成 ' + p.groups.length + ' 個意義段：', C.accent, 15, 6);
          p.groups.forEach(function (g, i) {
            w(g.n + '（自然段 ' + g.paras + '）　' + g.idea, gcolor[i % 4], 13, 2);
          });
          w('全文大意：' + p.main, C.ok, 14, 0);
        } else {
          panel(ctx, 24, y + 10, 572)('按「合併意義段」，看看這 ' + p.paras.length + ' 個自然段可以併成幾大段。', C.muted, 14, 0);
        }

        readout.innerHTML = showGroups
          ? '<b>' + p.paras.length + '</b> 個自然段 → <b>' + p.groups.length + '</b> 個意義段'
          : '共 <b>' + p.paras.length + '</b> 個自然段';
      }

      let ki = 0, showKey = false;

      function paintKey() {
        const ctx = clear(cv);
        const k = KEYPOINT[ki];
        title(ctx, 24, 18, '這句話真正想講什麼？', C.chi);

        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, 56, 572, 88, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 42, 76, 536)(k.s, C.text, 18, 0);

        if (showKey) {
          const w = panel(ctx, 24, 168, 572);
          w('重點是：' + k.k, C.ok, 18, 12);
          w(k.w, C.text, 14, 14);
          w('小訣竅：找到關聯詞，重點通常就在它的其中一邊。', C.warn, 14, 6);
          w('轉折（雖然⋯⋯卻）→ 重點在後　　遞進（不但⋯⋯而且）→ 兩邊都算', C.muted, 13, 2);
          w('條件（不管⋯⋯都）→ 重點在後　　選擇（與其⋯⋯不如）→ 重點在後', C.muted, 13, 0);
        } else {
          panel(ctx, 24, 172, 572)('先自己說說看，再按「看重點」。', C.muted, 14, 0);
        }
        readout.innerHTML = '第 <b>' + (ki + 1) + '</b> / ' + KEYPOINT.length + ' 句' +
          (showKey ? '　重點：<b>' + k.k + '</b>' : '');
      }

      function paint() {
        if (mode === 'method') paintMethod();
        else if (mode === 'para') paintPassage();
        else paintKey();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '說明方法', value: 'method' }, { label: '意義段', value: 'para' }, { label: '找重點', value: 'key' }], function (v) { mode = v; syncRow(); paint(); }, 'method'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'method') mi = (mi - 1 + EXPLAIN.length) % EXPLAIN.length;
        else if (mode === 'para') { pi = (pi - 1 + PASSAGES.length) % PASSAGES.length; showGroups = false; }
        else { ki = (ki - 1 + KEYPOINT.length) % KEYPOINT.length; showKey = false; }
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'method') mi = (mi + 1) % EXPLAIN.length;
        else if (mode === 'para') { pi = (pi + 1) % PASSAGES.length; showGroups = false; }
        else { ki = (ki + 1) % KEYPOINT.length; showKey = false; }
        paint();
      });
      const bGroup = Kit.button('合併意義段', function () { showGroups = !showGroups; paint(); });
      const bKey = Kit.button('看重點', function () { showKey = !showKey; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bGroup); row.appendChild(bKey);
      function syncRow() {
        bGroup.style.display = (mode === 'para') ? '' : 'none';
        bKey.style.display = (mode === 'key') ? '' : 'none';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「這句話用的是哪一種說明方法？」', why: '先讓他找關鍵字：例如、像是、所謂、引號、數字。找到關鍵字，方法就跑出來了。' },
      { ask: '「舉例和列舉差在哪裡？」', why: '列舉會<b>先講有幾項</b>再一項一項排；舉例只是隨手挑一個來說明。這兩個最常混。' },
      { ask: '「這五個自然段，你覺得哪幾段講的是同一件事？」', why: '這就是分意義段。分完再問每一大段在講什麼，大意自然就出來了。' },
      { ask: '「整篇短文，用一句話說完是什麼？」', why: '摘大意的練習。答不出來時，提示他把每個意義段的重點串起來。' },
      { ask: '「這句話重點在前半還是後半？」', why: '找關聯詞。雖然⋯⋯卻、與其⋯⋯不如，重點都在後面。這一招考試很常用到。' },
      { ask: '「你能不能用『所謂⋯⋯就是⋯⋯』解釋一個你熟的東西？」', why: '把說明方法從<b>看得懂</b>推到<b>寫得出</b>，這一步才是統整活動真正的目標。' }
    ],

    pitfalls: [
      { bad: '把「列舉」和「舉例」當成同一種。', fix: '<b>列舉</b>會先說出項目的數量，再一項一項排開；<b>舉例</b>只是挑一兩個實際例子來幫忙說明。看到「三樣」「四種」通常就是列舉。', src: '6-III-6' },
      { bad: '以為「引用」一定要是名人說的話。', fix: '引用的來源可以是<b>俗諺、報告、書上的句子</b>，不一定是名人。重點是那句話<b>不是自己寫的</b>，所以要加引號。' },
      { bad: '把自然段和意義段搞混。', fix: '<b>自然段</b>是課文裡看得到的、空兩格換行的那一段；<b>意義段</b>是我們把幾個自然段<b>依照意思</b>併起來的大段落。一個意義段可以包含好幾個自然段。', src: '5-III-6' },
      { bad: '摘大意時把每一段的句子照抄下來拼在一起。', fix: '大意要<b>用自己的話</b>講，而且要比原文短很多。先寫出每個意義段一句話，再把它們串成一句。' },
      { bad: '看到「雖然」就以為前半句是重點。', fix: '轉折句的重點在<b>後半句</b>。「雖然體型小，飛行速度卻很快」，作者要講的是<b>飛得快</b>。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['method', 'method', 'methodKey', 'para', 'paraCount', 'key', 'main']);

      if (type === 'method') {
        const e = pick(EXPLAIN);
        const o = pick4(e.m, EXPLAIN_METHODS.filter(function (x) { return x !== e.m; }));
        return {
          tpl: 'method',
          q: '「' + e.s + '」<br>這句話用的是哪一種<b>說明方法</b>？',
          choices: o.choices, answer: o.answer,
          steps: e.why + '<br>' +
            '所以這句用的是<b>' + e.m + '</b>。<br>' +
            '判斷訣竅：先找關鍵字（例如、像是、所謂、引號、數字），方法通常就在那裡。'
        };
      }

      if (type === 'methodKey') {
        const map = {
          '舉例': '例如、像是', '列舉': '先說出項目的數量，再一項一項排出來',
          '引用': '把別人說過的話加上引號放進文章', '數據': '用具體的數字',
          '比較': '把兩樣東西擺在一起對照', '下定義': '所謂⋯⋯就是⋯⋯'
        };
        const m = pick(EXPLAIN_METHODS);
        const o = pick4(map[m], EXPLAIN_METHODS.filter(function (x) { return x !== m; }).map(function (x) { return map[x]; }));
        return {
          tpl: 'methodKey',
          q: '要用「<b>' + m + '</b>」的方法說明，通常會怎麼寫？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + m + '</b>的寫法是：' + map[m] + '。<br>' +
            '例句：' + pick(EXPLAIN.filter(function (x) { return x.m === m; })).s + '<br>' +
            '每一種說明方法都有自己的招牌用語，記住用語就好判斷了。'
        };
      }

      if (type === 'paraCount') {
        const p = pick(PASSAGES);
        const right = String(p.groups.length) + ' 個意義段';
        const o = pick4(right, [1, 2, 3, 4, 5].filter(function (n) { return n !== p.groups.length; })
          .map(function (n) { return n + ' 個意義段'; }));
        return {
          tpl: 'paraCount',
          q: '短文〈' + p.title + '〉有 ' + p.paras.length + ' 個自然段，依照意思可以併成<b>幾個意義段</b>？',
          choices: o.choices, answer: o.answer,
          steps: '把講同一件事的自然段併在一起：<br>' +
            p.groups.map(function (g) { return g.n + '（自然段 ' + g.paras + '）' + g.idea; }).join('<br>') + '<br>' +
            '所以是<b>' + p.groups.length + ' 個意義段</b>。自然段是看得到的分段，意義段是依<b>意思</b>分的。'
        };
      }

      if (type === 'para') {
        const p = pick(PASSAGES);
        const i = randInt(0, p.paras.length - 1);
        const pa = p.paras[i];
        const o = pick4(pa.k, p.paras.filter(function (x) { return x.k !== pa.k; }).map(function (x) { return x.k; }));
        return {
          tpl: 'para',
          q: '短文〈' + p.title + '〉第 ' + (i + 1) + ' 自然段：<br>「' + pa.t + '」<br>這一段的<b>重點</b>是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '這一段講的是<b>' + pa.k + '</b>。<br>' +
            '抓段落重點的方法：把這一段用<b>四到六個字</b>說完，說得出來就抓到了。<br>' +
            '每一段都抓一次，再把它們串起來，就是全文大意。'
        };
      }

      if (type === 'main') {
        const p = pick(PASSAGES);
        const other = PASSAGES.filter(function (x) { return x.title !== p.title; })[0];
        const o = pick4(p.main, [
          other ? other.main : '種花需要每天澆水。',
          p.paras[0].t,
          '這篇文章在介紹一種植物的名稱由來。'
        ]);
        return {
          tpl: 'main',
          q: '短文〈' + p.title + '〉的<b>大意</b>是下面哪一句？',
          choices: o.choices, answer: o.answer,
          steps: '大意要<b>涵蓋整篇</b>，而且是<b>自己的話</b>。<br>' +
            '正確答案：' + p.main + '<br>' +
            '只抄第一段的句子不算大意，那只是其中一段；跟文章無關的句子更不行。'
        };
      }

      // key：句子重點
      const k = pick(KEYPOINT);
      const o = pick4(k.k, KEYPOINT.filter(function (x) { return x.k !== k.k; }).map(function (x) { return x.k; }));
      return {
        tpl: 'key',
        q: '「' + k.s + '」<br>這句話想強調的<b>重點</b>是什麼？',
        choices: o.choices, answer: o.answer,
        steps: k.w + '<br>' +
          '所以重點是<b>' + k.k + '</b>。<br>' +
          '看到關聯詞先別急著讀完，想一想作者把力氣放在哪一邊。'
      };
    }
  });


  /* ============================================================
     第參單元　自然的樂章
     統整活動三：古典詩（絕句）、感官摹寫、寫物的技巧
     詩作全部是唐詩，年代久遠，沒有著作權問題。
     ============================================================ */

  /* 韻腳只收「現代國語唸起來韻母相同」的詩，孩子念得出來才算數 */
  const POEMS = [
    {
      t: '鹿柴', a: '王維', n: 5,
      lines: ['空山不見人', '但聞人語響', '返景入深林', '復照青苔上'],
      rhymeAt: [1, 3], rhyme: '響、上', ym: 'ㄤ',
      note: '寫的是山裡沒有人、只聽得到聲音的那種空。'
    },
    {
      t: '鳥鳴澗', a: '王維', n: 5,
      lines: ['人閒桂花落', '夜靜春山空', '月出驚山鳥', '時鳴春澗中'],
      rhymeAt: [1, 3], rhyme: '空、中', ym: 'ㄨㄥ',
      note: '用聲音襯托安靜：因為太靜了，鳥叫才顯得清楚。'
    },
    {
      t: '靜夜思', a: '李白', n: 5,
      lines: ['床前明月光', '疑是地上霜', '舉頭望明月', '低頭思故鄉'],
      rhymeAt: [0, 1, 3], rhyme: '光、霜、鄉', ym: 'ㄤ',
      note: '從看月亮寫到想家，動作只有抬頭和低頭。'
    },
    {
      t: '春曉', a: '孟浩然', n: 5,
      lines: ['春眠不覺曉', '處處聞啼鳥', '夜來風雨聲', '花落知多少'],
      rhymeAt: [0, 1, 3], rhyme: '曉、鳥、少', ym: 'ㄠ',
      note: '整首都在寫「聽到的」，看不到畫面卻感覺得到春天。'
    },
    {
      t: '登鸛雀樓', a: '王之渙', n: 5,
      lines: ['白日依山盡', '黃河入海流', '欲窮千里目', '更上一層樓'],
      rhymeAt: [1, 3], rhyme: '流、樓', ym: 'ㄡ',
      note: '前兩句寫景，後兩句講道理：想看得更遠，就要站得更高。'
    },
    {
      t: '尋隱者不遇', a: '賈島', n: 5,
      lines: ['松下問童子', '言師採藥去', '只在此山中', '雲深不知處'],
      rhymeAt: [1, 3], rhyme: '去、處', ym: 'ㄩ',
      note: '一問一答之間，人始終沒出現，這就是「不遇」。'
    },
    {
      t: '江雪', a: '柳宗元', n: 5,
      lines: ['千山鳥飛絕', '萬徑人蹤滅', '孤舟簑笠翁', '獨釣寒江雪'],
      rhymeAt: [0, 1, 3], rhyme: '絕、滅、雪', ym: 'ㄩㄝ',
      note: '每一句都在減東西：鳥沒了、人沒了，最後只剩一個人。'
    },
    {
      t: '早發白帝城', a: '李白', n: 7,
      lines: ['朝辭白帝彩雲間', '千里江陵一日還', '兩岸猿聲啼不住', '輕舟已過萬重山'],
      rhymeAt: [0, 1, 3], rhyme: '間、還、山', ym: 'ㄢ',
      note: '用「一日還」和「已過」寫出船有多快。'
    },
    {
      t: '楓橋夜泊', a: '張繼', n: 7,
      lines: ['月落烏啼霜滿天', '江楓漁火對愁眠', '姑蘇城外寒山寺', '夜半鐘聲到客船'],
      rhymeAt: [0, 1, 3], rhyme: '天、眠、船', ym: 'ㄢ',
      note: '看到的、聽到的、感覺到的全寫進去，晚上的江邊就立體了。'
    },
    {
      t: '望廬山瀑布', a: '李白', n: 7,
      lines: ['日照香爐生紫煙', '遙看瀑布掛前川', '飛流直下三千尺', '疑是銀河落九天'],
      rhymeAt: [0, 1, 3], rhyme: '煙、川、天', ym: 'ㄢ',
      note: '「疑是銀河落九天」是<b>誇飾</b>，把瀑布說得比實際更驚人。'
    },
    {
      t: '涼州詞', a: '王翰', n: 7,
      lines: ['葡萄美酒夜光杯', '欲飲琵琶馬上催', '醉臥沙場君莫笑', '古來征戰幾人回'],
      rhymeAt: [0, 1, 3], rhyme: '杯、催、回', ym: 'ㄟ',
      note: '前面熱鬧、後面沉重，落差就是這首詩的力量。'
    }
  ];

  /* 詩句要排出正確的句讀：第一、三句後面用逗號，第二、四句後面用句號 */
  function poemText(p) {
    return p.lines.map(function (l, i) { return l + (i % 2 ? '。' : '，'); }).join('');
  }

  /* 五感摹寫，例句自己寫 */
  const SENSES = [
    { k: '視覺', s: '陽光穿過茂密的葉子，在地上灑下一塊一塊的亮斑。', w: '寫<b>看到</b>的顏色、形狀、明暗。' },
    { k: '視覺', s: '天色漆黑，只有遠處一盞路燈還亮著。', w: '寫<b>看到</b>的明暗。' },
    { k: '聽覺', s: '風吹過竹林，發出沙沙沙的聲音。', w: '寫<b>聽到</b>的聲音，常會用到狀聲詞。' },
    { k: '聽覺', s: '樓下的施工聲嘈雜得讓人靜不下來。', w: '寫<b>聽到</b>的聲音給人的感覺。' },
    { k: '嗅覺', s: '一走進廚房，就聞到剛炒好的菜香。', w: '寫<b>聞到</b>的氣味。' },
    { k: '嗅覺', s: '雨後的操場飄著一股泥土的味道。', w: '寫<b>聞到</b>的氣味。' },
    { k: '味覺', s: '這顆芭樂吃起來清脆又帶著一點甜。', w: '寫<b>嚐到</b>的味道和口感。' },
    { k: '味覺', s: '中藥的苦味在舌根停了很久才散掉。', w: '寫<b>嚐到</b>的味道。' },
    { k: '觸覺', s: '砂紙摸起來粗粗的，磨過的地方卻變得細膩。', w: '寫<b>摸到</b>的觸感。' },
    { k: '觸覺', s: '早晨的欄杆冰冰涼涼，手一放上去就想縮回來。', w: '寫<b>摸到</b>的冷熱。' }
  ];
  const SENSE_KINDS = ['視覺', '聽覺', '嗅覺', '味覺', '觸覺'];

  /* 修辭：譬喻、擬人、誇飾、排比、映襯 */
  const RHET = [
    { k: '譬喻', s: '葫蘆瓜的藤蔓像一條條綠色的繩子，牢牢抓住竹竿。', w: '用「像」把<b>藤蔓</b>比成<b>繩子</b>，兩樣東西本來不同，卻有相似的地方。' },
    { k: '譬喻', s: '他的聲音細得像一根線，快要聽不見了。', w: '用「像」做比方，把抽象的「細」變得看得見。' },
    { k: '擬人', s: '路燈站了一整夜，天亮才肯閉上眼睛。', w: '把路燈當成<b>人</b>來寫，會站、會閉眼睛。' },
    { k: '擬人', s: '春天一到，柳樹忙著換上新衣服。', w: '樹不會換衣服，這是把它當人寫。' },
    { k: '誇飾', s: '他等了一輩子那麼久，其實鐘才走了五分鐘。', w: '把時間<b>說得比實際誇張</b>，用來強調感覺。' },
    { k: '誇飾', s: '教室裡安靜得連一根針掉下來都聽得見。', w: '用極端的說法凸顯「非常安靜」。' },
    { k: '排比', s: '風吹過草地，風吹過屋頂，風吹過我剛洗好的頭髮。', w: '<b>三個結構相同</b>的句子連著出現，讀起來有節奏。' },
    { k: '排比', s: '我喜歡清晨的安靜，喜歡午後的陽光，喜歡傍晚的涼風。', w: '同樣的句型重複三次，是<b>排比</b>。' },
    { k: '映襯', s: '整條街都在放鞭炮，只有我們家安靜得像一座島。', w: '把<b>熱鬧</b>和<b>安靜</b>擺在一起對照，兩邊都更明顯。' },
    { k: '摹寫', s: '雨滴打在鐵皮屋頂上，滴滴答答響了一整夜。', w: '直接把<b>聽到的聲音</b>寫出來，用了狀聲詞。' }
  ];
  const RHET_KINDS = ['譬喻', '擬人', '誇飾', '排比', '映襯', '摹寫'];

  Kit.register('chi5a-u3', {

    intro: '古人寫景，二十個字就夠了。切換三個模式：<b>絕句</b>看五言七言怎麼數、韻腳押在哪幾句，<b>五感</b>看同一個場景用不同感官怎麼寫，<b>修辭</b>認出譬喻、擬人和排比。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 420);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'poem', poi = 0, showRhyme = true, si = 0, ri = 0;

      function paintPoem() {
        const ctx = clear(cv);
        const p = POEMS[poi];
        title(ctx, 24, 16, p.t + '　' + p.a + '（唐）', C.chi);
        ctx.save();
        ctx.fillStyle = C.muted; ctx.font = '13px ' + FONT;
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText(p.n === 5 ? '五言絕句　四句，每句 5 字' : '七言絕句　四句，每句 7 字', 596, 20);
        ctx.restore();

        /* 一格一字，最後一字如果是韻腳就標起來 */
        const cell = p.n === 5 ? 52 : 44;
        const startX = 300 - (p.n * cell) / 2;
        let y = 54;
        for (let li = 0; li < 4; li++) {
          const isR = p.rhymeAt.indexOf(li) >= 0;
          for (let ci = 0; ci < p.n; ci++) {
            const ch = p.lines[li].charAt(ci);
            const last = ci === p.n - 1;
            const hot = showRhyme && isR && last;
            ctx.save();
            ctx.strokeStyle = hot ? C.warn : C.line;
            ctx.lineWidth = hot ? 2 : 1;
            if (hot) { ctx.fillStyle = 'rgba(251,191,36,0.15)'; roundRect(ctx, startX + ci * cell, y, cell - 4, cell - 4, 5); ctx.fill(); }
            roundRect(ctx, startX + ci * cell, y, cell - 4, cell - 4, 5); ctx.stroke();
            ctx.fillStyle = hot ? C.warn : C.text;
            ctx.font = Math.round(cell * 0.52) + 'px ' + FONT;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(ch, startX + ci * cell + (cell - 4) / 2, y + (cell - 4) / 2 + 1);
            ctx.restore();
          }
          ctx.save();
          ctx.fillStyle = C.muted; ctx.font = '12px ' + FONT;
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText('第 ' + (li + 1) + ' 句', startX - 10, y + (cell - 4) / 2);
          ctx.restore();
          y += cell + 6;
        }

        const w = panel(ctx, 24, y + 12, 572);
        if (showRhyme) {
          w('韻腳：' + p.rhyme + '（都唸 ' + p.ym + '）', C.warn, 15, 6);
          w('押韻的是第 ' + p.rhymeAt.map(function (i) { return i + 1; }).join('、') + ' 句的<b>最後一個字</b>。', C.text, 14, 8);
        } else {
          w('每句 ' + p.n + ' 字 × 4 句 ＝ ' + (p.n * 4) + ' 字。', C.accent, 15, 8);
        }
        w(p.note, C.muted, 13, 0);

        readout.innerHTML = '<b>' + p.t + '</b>　' + (p.n === 5 ? '五言' : '七言') + '絕句　共 <b>' + (p.n * 4) + '</b> 字　韻腳 <b>' + p.rhyme + '</b>';
      }

      function paintSense() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '五種感官，五種寫法', C.chi);
        const cur = SENSES[si];
        let y = 48;
        for (let i = 0; i < SENSE_KINDS.length; i++) {
          const k = SENSE_KINDS[i], on = k === cur.k;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 46, 8); ctx.fill();
          ctx.fillStyle = on ? C.warn : '#3a4b6b';
          ctx.font = 'bold 15px ' + FONT;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(k, 62, y + 23);
          ctx.restore();
          if (on) panel(ctx, 104, y + 13, 480)(cur.s, C.text, 14, 0);
          else {
            ctx.save();
            ctx.fillStyle = '#2b3f63'; ctx.font = '13px ' + FONT;
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('（按「下一個」看這一類的例句）', 104, y + 23);
            ctx.restore();
          }
          y += 52;
        }
        const w = panel(ctx, 24, y + 12, 572);
        w(cur.w, C.accent, 14, 10);
        w('寫景想寫得立體，就不要只用眼睛。同一個場景，加一句聽到的、一句聞到的，畫面立刻不一樣。', C.muted, 13, 0);
        readout.innerHTML = '<b>' + cur.k + '</b>摹寫　第 ' + (si + 1) + ' / ' + SENSES.length + ' 句';
      }

      function paintRhet() {
        const ctx = clear(cv);
        const r = RHET[ri];
        title(ctx, 24, 18, '修辭：' + r.k, C.chi);
        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, 56, 572, 92, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 42, 74, 536)(r.s, C.text, 17, 0);

        const w = panel(ctx, 24, 170, 572);
        w(r.w, C.text, 14, 14);
        w('六種常考的修辭：', C.accent, 15, 6);
        w('譬喻　用「像、好像、彷彿」把甲比成乙', C.muted, 13, 2);
        w('擬人　把東西當成人，讓它會做人的動作', C.muted, 13, 2);
        w('誇飾　說得比實際誇張，用來強調', C.muted, 13, 2);
        w('排比　三個以上結構相同的句子連著出現', C.muted, 13, 2);
        w('映襯　把相反的兩件事擺在一起對照', C.muted, 13, 2);
        w('摹寫　把看到、聽到、聞到的直接寫出來', C.muted, 13, 0);
        readout.innerHTML = '第 <b>' + (ri + 1) + '</b> / ' + RHET.length + ' 句　修辭：<b>' + r.k + '</b>';
      }

      function paint() {
        if (mode === 'poem') paintPoem();
        else if (mode === 'sense') paintSense();
        else paintRhet();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '絕句', value: 'poem' }, { label: '五感', value: 'sense' }, { label: '修辭', value: 'rhet' }], function (v) { mode = v; syncRow(); paint(); }, 'poem'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(Kit.button('◀ 上一個', function () {
        if (mode === 'poem') poi = (poi - 1 + POEMS.length) % POEMS.length;
        else if (mode === 'sense') si = (si - 1 + SENSES.length) % SENSES.length;
        else ri = (ri - 1 + RHET.length) % RHET.length;
        paint();
      }));
      row.appendChild(Kit.button('下一個 ▶', function () {
        if (mode === 'poem') poi = (poi + 1) % POEMS.length;
        else if (mode === 'sense') si = (si + 1) % SENSES.length;
        else ri = (ri + 1) % RHET.length;
        paint();
      }));
      const bR = Kit.button('韻腳 開／關', function () { showRhyme = !showRhyme; paint(); });
      row.appendChild(bR);
      function syncRow() { bR.style.display = (mode === 'poem') ? '' : 'none'; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「這首是五言還是七言？你數數看。」', why: '直接數格子。五言絕句 20 字、七言絕句 28 字，數過一次就記得了。' },
      { ask: '「押韻的是每一句的第幾個字？」', why: '最後一個字。把「韻腳 開／關」按一下，黃色框就是韻腳，比講解快。' },
      { ask: '「這幾個韻腳唸起來，哪裡一樣？」', why: '讓他自己念出來聽。押韻是<b>聽</b>出來的，不是看出來的。' },
      { ask: '「這句話是用眼睛、耳朵，還是鼻子寫的？」', why: '五感摹寫最快的分辨法。答完再問：「你能不能幫這個畫面加一句聽到的？」' },
      { ask: '「這句有沒有『像』？有的話是把什麼比成什麼？」', why: '譬喻的判斷法。要找出<b>本體</b>和<b>喻體</b>兩樣東西，只說「有用像」不算懂。' },
      { ask: '「路燈會不會閉眼睛？那作者為什麼這樣寫？」', why: '擬人的核心。讓他發現：把東西寫成人，讀的人才會有感覺。' }
    ],

    pitfalls: [
      { bad: '以為「絕句」是指句子很短。', fix: '<b>絕句</b>指的是<b>四句</b>的詩。每句五個字叫五言絕句，七個字叫七言絕句。八句的那種叫律詩。', src: '5-III-1' },
      { bad: '以為每一句都要押韻。', fix: '絕句通常押在<b>第二句和第四句</b>的最後一字，第一句可押可不押。畫面上黃色的格子就是實際押韻的位置。' },
      { bad: '把「有像字」就當成譬喻。', fix: '「他長得像他哥哥」是<b>同類相比</b>，不是譬喻。譬喻要把<b>兩種不同的東西</b>連起來，例如把藤蔓比成繩子。' },
      { bad: '把擬人和譬喻搞混。', fix: '<b>譬喻</b>是「甲像乙」；<b>擬人</b>是把東西<b>直接當成人</b>，讓它做人的動作，句子裡通常沒有「像」。' },
      { bad: '寫景只寫看到的。', fix: '五感裡通常只用了視覺。加一句<b>聽覺</b>或<b>嗅覺</b>，畫面立刻立體。這是統整活動三最想教的事。', src: '6-III-6' },
      { bad: '把誇飾當成說謊。', fix: '誇飾是<b>刻意</b>說得誇張，用來強調感覺，讀的人知道那不是事實。「等了一輩子」大家都懂他只是覺得久。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['form', 'form', 'rhymePos', 'rhymeWord', 'count', 'sense', 'sense', 'rhet', 'rhet']);

      if (type === 'form') {
        const p = pick(POEMS);
        const right = (p.n === 5 ? '五言' : '七言') + '絕句';
        const o = pick4(right, ['五言絕句', '七言絕句', '五言律詩', '七言律詩'].filter(function (x) { return x !== right; }));
        return {
          tpl: 'form',
          q: '〈' + p.t + '〉（' + p.a + '）共四句，每句 ' + p.n + ' 個字。這是哪一種詩？',
          choices: o.choices, answer: o.answer,
          steps: '<b>絕句</b>＝四句的詩；<b>律詩</b>＝八句的詩。<br>' +
            '每句 ' + p.n + ' 字，所以是<b>' + (p.n === 5 ? '五言' : '七言') + '</b>。<br>' +
            '合起來就是<b>' + right + '</b>，全首共 ' + p.n + ' × 4 ＝ ' + (p.n * 4) + ' 字。'
        };
      }

      if (type === 'count') {
        const p = pick(POEMS);
        const total = p.n * 4;
        const o = pick4(String(total) + ' 字', [20, 28, 40, 56].filter(function (x) { return x !== total; }).map(function (x) { return x + ' 字'; }));
        return {
          tpl: 'count',
          q: '〈' + p.t + '〉是' + (p.n === 5 ? '五言' : '七言') + '絕句，整首詩一共有幾個字？',
          choices: o.choices, answer: o.answer,
          steps: '絕句是<b>四句</b>，' + (p.n === 5 ? '五言' : '七言') + '是每句 <b>' + p.n + '</b> 個字。<br>' +
            p.n + ' × 4 ＝ <b>' + total + '</b> 字。<br>' +
            '五言絕句 20 字、七言絕句 28 字，這兩個數字記起來。'
        };
      }

      if (type === 'rhymePos') {
        const o = shuffled([
          { t: '每一句的最後一個字', ok: true },
          { t: '每一句的第一個字' },
          { t: '每一句的中間那個字' },
          { t: '整首詩的第一個字' }
        ]);
        return {
          tpl: 'rhymePos',
          q: '一首詩的<b>韻腳</b>，出現在什麼位置？',
          choices: o.choices, answer: o.answer,
          steps: '韻腳是押韻的字，固定出現在<b>句子的最後一個字</b>。<br>' +
            '絕句通常押在<b>第二句和第四句</b>的最後一字，第一句可押可不押。<br>' +
            '判斷方法：把每句最後一個字念出來，聽聽看哪幾個的韻母一樣。'
        };
      }

      if (type === 'rhymeWord') {
        const p = pick(POEMS);
        const right = p.lines[p.rhymeAt[p.rhymeAt.length - 1]].slice(-1);
        const wrongs = [];
        p.lines.forEach(function (l, i) {
          if (p.rhymeAt.indexOf(i) < 0) wrongs.push(l.slice(-1));
          wrongs.push(l.charAt(0));
        });
        const o = pick4(right, wrongs.filter(function (x) { return x !== right; }));
        return {
          tpl: 'rhymeWord',
          q: '〈' + p.t + '〉：「' + poemText(p) + '」<br>下面哪一個字是這首詩的<b>韻腳</b>？',
          choices: o.choices, answer: o.answer,
          steps: '這首詩的韻腳是<b>' + p.rhyme + '</b>，都唸 <b>' + p.ym + '</b>。<br>' +
            '它們分別在第 ' + p.rhymeAt.map(function (i) { return i + 1; }).join('、') + ' 句的<b>最後一個字</b>。<br>' +
            '韻腳一定在句尾，句子開頭的字不會是韻腳。'
        };
      }

      if (type === 'sense') {
        const s = pick(SENSES);
        const o = pick4(s.k + '摹寫', SENSE_KINDS.filter(function (x) { return x !== s.k; }).map(function (x) { return x + '摹寫'; }));
        return {
          tpl: 'sense',
          q: '「' + s.s + '」<br>這句話主要用了哪一種<b>感官</b>來寫？',
          choices: o.choices, answer: o.answer,
          steps: s.w + '<br>' +
            '所以是<b>' + s.k + '摹寫</b>。<br>' +
            '五感對應：視覺看、聽覺聽、嗅覺聞、味覺嚐、觸覺摸。先問「這是用身體的哪個部位感覺到的」就分得出來。'
        };
      }

      // rhet：修辭
      const r = pick(RHET);
      const o = pick4(r.k, RHET_KINDS.filter(function (x) { return x !== r.k; }));
      return {
        tpl: 'rhet',
        q: '「' + r.s + '」<br>這句話用了哪一種<b>修辭</b>？',
        choices: o.choices, answer: o.answer,
        steps: r.w + '<br>' +
          '所以用的是<b>' + r.k + '</b>。<br>' +
          '快速分辨：有「像」就先想譬喻，東西做人的動作是擬人，三句同樣句型是排比，說得太超過是誇飾。'
      };
    }
  });


  /* ============================================================
     第肆單元　平凡中的特別
     統整活動四：議論文本的特徵、聲音的摹寫、篇章的寓意
     ============================================================ */

  const ARGUE = [
    { k: '論點', d: '作者主張什麼，也就是他想說服你相信的那句話。', e: '每天走路上學是值得的。', pos: 1 },
    { k: '論據', d: '用來支持論點的理由、例子或數據。', e: '走路可以順便觀察街上的變化，也比坐車醒得快。', pos: 2 },
    { k: '結論', d: '收尾，把論點再說一次，或提出建議。', e: '所以能走路的日子，就別急著坐車。', pos: 3 }
  ];

  const ONOM = [
    { w: '沙沙', u: '風吹過樹葉、竹林', s: '風一吹，整片竹林沙沙地響。' },
    { w: '滴滴答答', u: '雨滴打在屋頂或窗戶', s: '雨打在鐵皮屋頂上，滴滴答答響了一整夜。' },
    { w: '吱吱喳喳', u: '小鳥叫', s: '天剛亮，麻雀就在屋簷下吱吱喳喳。' },
    { w: '嘩啦嘩啦', u: '大量的水流動', s: '水龍頭沒關緊，嘩啦嘩啦流了一地。' },
    { w: '轟隆轟隆', u: '打雷、大車經過', s: '遠處傳來轟隆轟隆的雷聲。' },
    { w: '噗通', u: '東西掉進水裡', s: '石頭噗通一聲掉進池塘。' },
    { w: '嘰嘰喳喳', u: '很多人同時說話', s: '下課鐘一響，走廊上就嘰嘰喳喳。' },
    { w: '叮咚', u: '門鈴', s: '叮咚一聲，門鈴響了。' },
    { w: '喀啦', u: '硬的東西斷掉', s: '樹枝喀啦一聲被踩斷。' },
    { w: '咕嚕咕嚕', u: '肚子餓、水滾了', s: '鍋裡的水咕嚕咕嚕滾了起來。' }
  ];

  const FABLES = [
    {
      t: '搬石頭的人',
      s: '有個人每天搬石頭鋪路，別人笑他做白工。幾年後，那條路成了村裡最好走的一段。',
      m: '看起來沒有用的小事，累積久了會變成別人受用的東西。',
      wrong: ['做事要挑輕鬆的做。', '被人笑就應該放棄。', '石頭是很有價值的東西。']
    },
    {
      t: '兩個木匠',
      s: '兩個木匠同時做椅子。一個做得快，一個每一處榫頭都磨到平。半年後，做得快的那張已經搖晃了。',
      m: '花在細節上的時間，會在後面還給你。',
      wrong: ['做事一定要比別人快。', '木頭的品質決定一切。', '椅子做久了都會壞。']
    },
    {
      t: '提燈的孩子',
      s: '一個看不見的孩子夜裡出門總是提著燈。有人問他為什麼，他說：這樣別人才不會撞到我。',
      m: '為別人著想，最後保護到的也包括自己。',
      wrong: ['晚上出門要帶手電筒。', '看不見的人不適合出門。', '燈要提得愈高愈好。']
    }
  ];

  Kit.register('chi5a-u4', {

    intro: '同一件小事，有人寫成故事，有人寫成道理。切換三個模式：<b>議論</b>看一篇說理的文章由哪三塊組成，<b>狀聲詞</b>練習把聲音寫進句子，<b>寓意</b>練習讀出故事背後想講的話。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 400);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'argue', aStep = 1, ni = 0, fi = 0, showMoral = false;

      function paintArgue() {
        const ctx = clear(cv);
        title(ctx, 24, 16, '一篇說理的文章，通常有三塊', C.chi);
        let y = 50;
        const cols = [C.accent, C.warn, C.ok];
        for (let i = 0; i < ARGUE.length; i++) {
          const a = ARGUE[i], on = i < aStep;
          ctx.save();
          ctx.fillStyle = on ? C.card : '#111c2e';
          roundRect(ctx, 24, y, 572, 86, 10); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#2b3f63';
          roundRect(ctx, 24, y, 8, 86, 4); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#3a4b6b';
          ctx.font = 'bold 17px ' + FONT;
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText((i + 1) + '. ' + a.k, 48, y + 12);
          ctx.restore();
          if (on) {
            panel(ctx, 48, y + 36, 528)(a.d, C.text, 13, 0);
            panel(ctx, 48, y + 58, 528)('例：' + a.e, C.muted, 13, 0);
          }
          y += 94;
        }
        const w = panel(ctx, 24, y + 6, 572);
        if (aStep >= 3) w('三塊合起來，就是一篇短短的議論文。論點要清楚，論據要站得住腳。', C.purple, 14, 0);
        else w('按「下一塊」繼續。', C.muted, 14, 0);
        readout.innerHTML = '已顯示 <b>' + aStep + '</b> / 3 塊';
      }

      function paintOnom() {
        const ctx = clear(cv);
        const n = ONOM[ni];
        title(ctx, 24, 18, '狀聲詞：把聲音寫進句子', C.chi);
        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, 56, 572, 74, 10); ctx.fill();
        ctx.fillStyle = C.warn;
        ctx.font = 'bold 38px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(n.w, 310, 93);
        ctx.restore();

        const w = panel(ctx, 24, 148, 572);
        w('用在：' + n.u, C.accent, 15, 10);
        w('例句：' + n.s, C.text, 15, 16);
        w('狀聲詞是<b>聽覺摹寫</b>最直接的寫法。把聲音寫出來，讀的人像是也聽見了。', C.muted, 13, 8);
        w('寫作文時放一個狀聲詞在句子中間，畫面會突然活過來。', C.muted, 13, 0);
        readout.innerHTML = '<b>' + n.w + '</b>　' + n.u + '　<span class="muted">第 ' + (ni + 1) + ' / ' + ONOM.length + '</span>';
      }

      function paintFable() {
        const ctx = clear(cv);
        const f = FABLES[fi];
        title(ctx, 24, 16, '〈' + f.t + '〉', C.chi);
        ctx.save();
        ctx.fillStyle = C.card;
        roundRect(ctx, 24, 50, 572, 110, 10); ctx.fill();
        ctx.restore();
        panel(ctx, 44, 70, 532)(f.s, C.text, 16, 0);

        const w = panel(ctx, 24, 180, 572);
        if (showMoral) {
          w('寓意：' + f.m, C.ok, 17, 14);
          w('怎麼讀出寓意？', C.accent, 14, 6);
          w('一、先看故事裡「誰做了什麼，結果怎樣」。', C.muted, 13, 2);
          w('二、把故事裡的東西換成生活中的事，道理還成不成立。', C.muted, 13, 2);
          w('三、寓意是<b>一句道理</b>，不是把故事再說一次。', C.muted, 13, 0);
        } else {
          w('先自己想想看：這個故事想告訴我們什麼？', C.muted, 15, 10);
          w('想好了再按「看寓意」。', C.muted, 14, 0);
        }
        readout.innerHTML = '第 <b>' + (fi + 1) + '</b> / ' + FABLES.length + ' 則' + (showMoral ? '　已顯示寓意' : '');
      }

      function paint() {
        if (mode === 'argue') paintArgue();
        else if (mode === 'onom') paintOnom();
        else paintFable();
      }

      controls.appendChild(Kit.segmented('模式',
        [{ label: '議論', value: 'argue' }, { label: '狀聲詞', value: 'onom' }, { label: '寓意', value: 'fable' }], function (v) { mode = v; syncRow(); paint(); }, 'argue'
      ).wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'argue') aStep = Math.max(1, aStep - 1);
        else if (mode === 'onom') ni = (ni - 1 + ONOM.length) % ONOM.length;
        else { fi = (fi - 1 + FABLES.length) % FABLES.length; showMoral = false; }
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'argue') aStep = Math.min(3, aStep + 1);
        else if (mode === 'onom') ni = (ni + 1) % ONOM.length;
        else { fi = (fi + 1) % FABLES.length; showMoral = false; }
        paint();
      });
      const bM = Kit.button('看寓意', function () { showMoral = !showMoral; paint(); });
      row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(bM);
      function syncRow() {
        bM.style.display = (mode === 'fable') ? '' : 'none';
        bNext.textContent = (mode === 'argue') ? '下一塊 ▶' : '下一個 ▶';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      syncRow(); paint();
    },

    parentGuide: [
      { ask: '「這篇文章作者想說服你相信什麼？」', why: '那句話就是<b>論點</b>。找不到的話，通常在第一段或最後一段。' },
      { ask: '「他拿什麼理由來說服你？」', why: '那是<b>論據</b>。再追問：「這個理由夠不夠？你會被說服嗎？」這是議論文最重要的思辨練習。' },
      { ask: '「記敘文和議論文差在哪裡？」', why: '記敘文<b>講一件事</b>，議論文<b>講一個道理</b>並且要說服你。分清楚了，寫作方向才不會跑掉。' },
      { ask: '「下雨打在屋頂上，你會怎麼寫那個聲音？」', why: '練狀聲詞。孩子想不出來時，讓他先發出聲音，再想怎麼用字寫下來。' },
      { ask: '「這個故事想告訴我們什麼？」', why: '讀寓意。如果他把故事再講一次，就提醒：<b>寓意要是一句道理</b>，故事以外也用得上。' },
      { ask: '「這個道理，可以用在你身上的哪件事？」', why: '把寓意連到自己的經驗，這是課綱說的「連結相關的知識和經驗，提出自己的觀點」。' }
    ],

    pitfalls: [
      { bad: '把議論文寫成記敘文，只講事情經過。', fix: '議論文一定要有<b>論點</b>（你主張什麼）和<b>論據</b>（為什麼）。只寫發生了什麼事，那是記敘文。', src: '5-III-5' },
      { bad: '論據只寫「因為這樣比較好」。', fix: '那只是把論點換句話說。論據要是<b>具體的理由、例子或數據</b>，讀的人才會被說服。' },
      { bad: '把寓意寫成故事摘要。', fix: '寓意是<b>一句道理</b>，故事以外的場合也用得上。「他鋪了一條路」是摘要，「小事累積久了會有用」才是寓意。' },
      { bad: '狀聲詞用錯場合。', fix: '「滴滴答答」是水滴，「沙沙」是風吹樹葉，「轟隆」是雷或大車。用之前先想：這個聲音是<b>什麼東西發出來的</b>。' },
      { bad: '以為狀聲詞只能放在句子開頭。', fix: '放中間常常更好：「石頭<b>噗通</b>一聲掉進池塘」比「噗通，石頭掉進池塘」更順。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['argue', 'argueOrder', 'genre', 'onom', 'onom', 'moral', 'moralWhat']);

      if (type === 'argue') {
        const a = pick(ARGUE);
        const o = pick4(a.k, ARGUE.filter(function (x) { return x.k !== a.k; }).map(function (x) { return x.k; }).concat(['摘要']));
        return {
          tpl: 'argue',
          q: '議論文裡，「' + a.d + '」指的是哪一部分？',
          choices: o.choices, answer: o.answer,
          steps: '這是<b>' + a.k + '</b>：' + a.d + '<br>' +
            '例如：' + a.e + '<br>' +
            '議論文的三塊是<b>論點 → 論據 → 結論</b>，缺了論據就沒有說服力。'
        };
      }

      if (type === 'argueOrder') {
        const o = shuffled([
          { t: '論點 → 論據 → 結論', ok: true },
          { t: '論據 → 結論 → 論點' },
          { t: '結論 → 論點 → 論據' },
          { t: '論點 → 結論 → 論據' }
        ]);
        return {
          tpl: 'argueOrder',
          q: '一篇議論文最常見的<b>順序</b>是哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '先說出主張（<b>論點</b>），再給理由（<b>論據</b>），最後收尾（<b>結論</b>）。<br>' +
            '這樣寫，讀的人一開始就知道你要講什麼，中間才聽得進理由。<br>' +
            '結論可以把論點換個說法再說一次，或提出具體建議。'
        };
      }

      if (type === 'genre') {
        const cases = [
          { s: '那天下午，我在走廊撿到一支直笛，找了三節課才找到主人。', k: '記敘文', w: '在<b>講一件事</b>的經過，有時間、地點、經過。' },
          { s: '我認為每天走路上學是值得的，因為路上會看見很多平常錯過的東西。', k: '議論文', w: '提出<b>主張</b>並給<b>理由</b>，想說服你。' },
          { s: '直笛是一種吹奏樂器，靠手指按住不同的孔改變音高。', k: '說明文', w: '在<b>介紹一樣東西是什麼、怎麼運作</b>，不帶主張。' },
          { s: '風從窗口溜進來，翻了翻桌上的課本，又悄悄走了。', k: '抒情（描寫）', w: '重點在<b>畫面和感覺</b>，用了擬人。' }
        ];
        const c = pick(cases);
        const o = pick4(c.k, cases.filter(function (x) { return x.k !== c.k; }).map(function (x) { return x.k; }));
        return {
          tpl: 'genre',
          q: '「' + c.s + '」<br>這段文字最接近哪一種<b>文體</b>？',
          choices: o.choices, answer: o.answer,
          steps: c.w + '<br>' +
            '所以是<b>' + c.k + '</b>。<br>' +
            '快速分辨：講事情＝記敘，講道理並說服＝議論，介紹知識＝說明，寫感覺＝抒情。'
        };
      }

      if (type === 'onom') {
        const n = pick(ONOM);
        const o = pick4(n.w, ONOM.filter(function (x) { return x.w !== n.w; }).map(function (x) { return x.w; }));
        return {
          tpl: 'onom',
          q: '要寫「' + n.u + '」的聲音，用哪一個<b>狀聲詞</b>最合適？',
          choices: o.choices, answer: o.answer,
          steps: '「' + n.w + '」用來寫<b>' + n.u + '</b>的聲音。<br>' +
            '例句：' + n.s + '<br>' +
            '狀聲詞屬於<b>聽覺摹寫</b>。用之前先想：這個聲音是什麼東西發出來的。'
        };
      }

      if (type === 'moralWhat') {
        const o = shuffled([
          { t: '故事背後想告訴我們的一句道理', ok: true },
          { t: '故事的主角是誰' },
          { t: '把故事再簡短說一次' },
          { t: '故事發生的時間和地點' }
        ]);
        return {
          tpl: 'moralWhat',
          q: '一篇文章的「<b>寓意</b>」指的是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '寓意是<b>故事以外也用得上的一句道理</b>。<br>' +
            '把故事再說一次是<b>摘要</b>，不是寓意；說出誰做了什麼是<b>情節</b>。<br>' +
            '檢查方法：這句話拿到別的場合還說得通嗎？說得通，才是寓意。'
        };
      }

      // moral：讀出寓意
      const f = pick(FABLES);
      const o = pick4(f.m, f.wrong);
      return {
        tpl: 'moral',
        q: '〈' + f.t + '〉：「' + f.s + '」<br>這個故事的<b>寓意</b>是什麼？',
        choices: o.choices, answer: o.answer,
        steps: '寓意：<b>' + f.m + '</b><br>' +
          '讀寓意的方法：先看「誰做了什麼、結果怎樣」，再把故事裡的東西換成生活中的事，看道理還成不成立。<br>' +
          '注意寓意是<b>一句道理</b>，不是把故事重講一次。'
      };
    }
  });

})();
