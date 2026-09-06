/* ============================================================
   教具 soc5b-u1 日本統治下的臺灣　soc5b-u2 生活中的文化展現
        soc5b-u3 走向民主的中華民國　soc5b-u4 從臺灣探索世界文化
   翰林 115：五下 第 1～4 單元
   課綱 Cb-Ⅲ-1・Cb-Ⅲ-2・Cc-Ⅲ-2 / Bc-Ⅲ-1・Bb-Ⅲ-1 /
        Cd-Ⅲ-1・Cd-Ⅲ-2・Ac-Ⅲ-4 / Aa-Ⅲ-2・Ba-Ⅲ-1

   底圖沿用五上 soc5a 那一張（window.TW_BASEMAP），所以鐵路、港口、
   水圳、族群分布跟五上的位置、季風、開墾畫在同一個臺灣上。
   ⚠️ 底圖是<b>簡化示意圖</b>，只求相對位置正確，不是測量用地圖。

   ⚠️ 年代與名詞集中在下面的 FACTS 一份資料表，時間軸和練習題都從
      這裡取值，兩邊不可能講不一樣的話。用「日治」，不用「日據」。
   ============================================================ */

(function () {

  const TW = (typeof window !== 'undefined' && window.TW_BASEMAP) ? window.TW_BASEMAP : null;
  if (!TW) return;                      // 底圖沒載到就整份跳過，不要畫壞畫面

  const FONT = '13px "Microsoft JhengHei", sans-serif';
  const C = {
    bg: '#0e1726', sea: '#122238', land: '#1e3050', landLine: '#4a6ea8',
    text: '#e8eefc', muted: '#93a3c4', accent: '#4da3ff', purple: '#7c5cff',
    ok: '#34d399', no: '#fb7185', warn: '#fbbf24', soc: '#fb923c'
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

  function base(cv) {
    const ctx = cv.ctx;
    cv.clear(C.bg);
    ctx.fillStyle = C.sea; ctx.fillRect(0, 0, 620, 440);
    TW.island(ctx, C.land, C.landLine);
    ctx.font = FONT;
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


  /* ============================================================
     資料表：所有年代與名詞只寫在這裡
     ============================================================ */

  /* 日治時期（1895–1945）大事。y = 年，k = 類別 */
  const NIHON = [
    { y: 1895, k: '統治', t: '馬關條約，清帝國把臺灣割讓給日本', d: '臺灣進入日治時期，總督府成為最高統治機關。' },
    { y: 1898, k: '統治', t: '保甲制度全面推行', d: '十戶一甲、十甲一保，居民互相監督，配合警察管理地方。' },
    { y: 1908, k: '建設', t: '縱貫鐵路全線通車', d: '基隆到高雄一天就到得了，南北之間第一次連成一條線。' },
    { y: 1919, k: '教育', t: '頒布臺灣教育令', d: '把學校制度定下來：臺灣人讀公學校、日本人讀小學校，兩套系統並不平等。' },
    { y: 1930, k: '建設', t: '嘉南大圳完工', d: '八田與一設計，烏山頭水庫供水，嘉南平原的看天田變成水田。' },
    { y: 1934, k: '建設', t: '日月潭水力發電廠完工', d: '有了穩定的電力，工廠才開得起來。' },
    { y: 1937, k: '同化', t: '皇民化運動開始', d: '推行日語、改日本姓名、參拜神社，要臺灣人變成日本人。' },
    { y: 1945, k: '統治', t: '日本戰敗，日治時期結束', d: '統治臺灣五十年，留下建設，也留下不平等的記憶。' }
  ];

  /* 日治建設在地圖上的位置 */
  const NIHON_MAP = {
    rail: [
      [121.74, 25.13], [121.56, 25.04], [121.30, 24.99], [121.00, 24.80],
      [120.97, 24.80], [120.82, 24.56], [120.69, 24.25], [120.55, 24.08],
      [120.43, 23.83], [120.44, 23.48], [120.30, 23.13], [120.21, 22.99],
      [120.30, 22.75], [120.30, 22.63]
    ],
    ports: [
      { lon: 121.74, lat: 25.13, n: '基隆港', d: '北部門戶，築港後成為對日本的主要港口' },
      { lon: 120.28, lat: 22.61, n: '高雄港', d: '南部門戶，築港後帶動南部的工業與輸出' }
    ],
    canal: [
      { lon: 120.40, lat: 23.20, n: '烏山頭水庫', d: '嘉南大圳的水源，1930 年完工' }
    ]
  };

  /* 米食與建築的族群文化（第 2 單元） */
  const RICE = [
    { g: '閩南', f: '粿', d: '在來米磨漿做成的紅龜粿、菜頭粿，節慶祭祀時用。', r: '在來米' },
    { g: '客家', f: '粄', d: '客家話把粿叫做粄，有粄條、艾粄，做法和閩南相近而名稱不同。', r: '在來米' },
    { g: '原住民族', f: '小米製品', d: '小米酒、小米糕，小米是傳統的主食與祭典作物。', r: '小米' },
    { g: '戰後外省', f: '麵食與米飯併行', d: '把北方的麵食帶進來，和原本的米食一起出現在餐桌上。', r: '蓬萊米' }
  ];
  const RICE_KINDS = [
    { n: '在來米', d: '臺灣原本就有的稻米，煮起來比較鬆散，適合做粿、粄、米粉。' },
    { n: '蓬萊米', d: '日治時期改良出來的品種，比較黏、比較香，是現在餐桌上的白飯。' },
    { n: '小米', d: '不是稻米，是原住民族傳統的主食與祭典作物。' }
  ];

  const HOUSE = [
    { n: '三合院', g: '閩南', d: '正廳在中間，兩側護龍圍成ㄇ字形，屋脊有燕尾或馬背。', e: '燕尾／馬背屋脊' },
    { n: '夥房', g: '客家', d: '格局和三合院相近，強調祖堂與家族共居，門前常有禾埕。', e: '禾埕曬穀' },
    { n: '石板屋', g: '排灣族、魯凱族', d: '用當地的板岩一片片疊起來，冬暖夏涼。', e: '就地取材的板岩' },
    { n: '地下屋', g: '達悟族', d: '房子蓋在地面下，避開蘭嶼強烈的颱風與海風。', e: '半穴居避風' },
    { n: '日式木造宿舍', g: '日治時期', d: '木造、架高地板、有玄關與榻榻米，適合潮溼的氣候。', e: '架高防潮' },
    { n: '巴洛克式街屋', g: '日治時期', d: '街道兩側的立面有繁複裝飾，是當時的商業街景。', e: '華麗立面' }
  ];

  /* 走向民主（第 3 單元）。y = 年 */
  const DEMO = [
    { y: 1947, t: '二二八事件', d: '查緝私菸的衝突擴大成全臺事件，造成許多人傷亡，也影響了後來的族群關係。', k: '事件' },
    { y: 1949, t: '開始實施戒嚴', d: '五月二十日起戒嚴，集會、結社、言論、出版都受到限制。', k: '限制' },
    { y: 1979, t: '美麗島事件', d: '高雄的遊行遭到取締，相關人士被審判，卻讓更多人開始關心民主。', k: '事件' },
    { y: 1986, t: '民主進步黨成立', d: '在戒嚴還沒解除的情況下宣布成立，是第一個具規模的反對黨。', k: '突破' },
    { y: 1987, t: '解除戒嚴', d: '七月十五日解嚴，戒嚴一共持續了三十八年。', k: '突破' },
    { y: 1991, t: '廢止動員戡亂時期臨時條款', d: '國會全面改選的障礙被移除，憲政回到正常運作。', k: '突破' },
    { y: 1992, t: '立法委員全面改選', d: '所有立委由臺灣人民直接選出，國會真正代表現在的選民。', k: '選舉' },
    { y: 1996, t: '第一次總統直接民選', d: '總統由人民一票一票選出，民主化的關鍵一步。', k: '選舉' }
  ];

  /* 世界文化與宗教（第 4 單元） */
  const RELIGION = [
    { n: '佛教', w: '漢人移民從中國大陸帶來', t: '早期', d: '寺院、法會，與民間信仰長期融合。', ex: '龍山寺' },
    { n: '道教與民間信仰', w: '漢人移民從中國大陸帶來', t: '早期', d: '媽祖、關公、土地公，廟宇是地方生活的中心。', ex: '媽祖繞境' },
    { n: '基督宗教（荷西時期）', w: '荷蘭人與西班牙人傳入', t: '1624 起', d: '在南部與北部短暫傳教，隨政權結束而中斷。', ex: '新港文書' },
    { n: '基督長老教會（南部）', w: '馬雅各醫師', t: '1865', d: '一邊行醫一邊傳教，也帶來西式醫療。', ex: '新樓醫院' },
    { n: '基督長老教會（北部）', w: '馬偕牧師', t: '1872', d: '在淡水傳教、行醫、辦學校。', ex: '牛津學堂' },
    { n: '伊斯蘭教', w: '穆斯林移民與移工', t: '近代', d: '人數較少，清真寺是主要的聚會場所。', ex: '清真寺' }
  ];

  /* 文化的三個層面（統整用，也給第 2、4 單元的題目） */
  const CULTURE_LAYERS = [
    { n: '物質文化', d: '看得到、摸得到的東西：食物、衣服、房子、工具。', e: ['粿與粄', '石板屋', '廟宇建築'] },
    { n: '社群文化', d: '人和人之間的規矩與組織：家族、節慶、社會制度。', e: ['廟會的分工', '鄰里的守望相助', '保甲制度'] },
    { n: '精神文化', d: '看不見的想法與信仰：宗教、價值觀、藝術。', e: ['宗教信仰', '尊重多元的觀念', '歌謠'] }
  ];


  /* ============================================================
     第 1 單元　日本統治下的臺灣
     ============================================================ */
  Kit.register('soc5b-u1', {

    intro: '日本統治臺灣五十年，留下鐵路、水圳和發電廠，也留下不平等的制度。切換三個模式：<b>年表</b>拖時間看大事，<b>建設</b>看鐵路與水圳畫在地圖上，<b>兩面</b>比較同一件建設對誰有利。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'time', year = 1895, si = 0;

      function paintTime() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.font = FONT;

        /* 時間軸 */
        const x0 = 60, x1 = 570, y = 70;
        const px = function (yy) { return x0 + (yy - 1895) / 50 * (x1 - x0); };
        ctx.save();
        ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.strokeStyle = C.soc; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(px(year), y); ctx.stroke();
        for (let yy = 1895; yy <= 1945; yy += 10) {
          ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px(yy), y - 6); ctx.lineTo(px(yy), y + 6); ctx.stroke();
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(yy, px(yy), y + 10);
        }
        NIHON.forEach(function (e) {
          const on = e.y <= year;
          ctx.fillStyle = on ? C.warn : '#2b3f63';
          ctx.beginPath(); ctx.arc(px(e.y), y, on ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = C.soc; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(year + ' 年', px(year), y - 14);
        ctx.restore();

        /* 已發生的事件列表 */
        const shown = NIHON.filter(function (e) { return e.y <= year; });
        let ly = 116;
        shown.slice(-6).forEach(function (e) {
          ctx.save();
          ctx.fillStyle = '#16233a'; roundRect(ctx, 30, ly, 560, 48, 8); ctx.fill();
          const col = e.k === '建設' ? C.ok : e.k === '統治' ? C.no : e.k === '教育' ? C.accent : C.purple;
          ctx.fillStyle = col; roundRect(ctx, 30, ly, 7, 48, 3); ctx.fill();
          ctx.fillStyle = col; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(e.y + '　' + e.t, 50, ly + 7);
          ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.fillText(e.d.slice(0, 34), 50, ly + 27);
          ctx.restore();
          ly += 54;
        });

        readout.innerHTML = '<b>' + year + ' 年</b>　已發生 <b>' + shown.length + '</b> / ' + NIHON.length + ' 件　' +
          '<span class="muted">' + (shown.length ? shown[shown.length - 1].t : '') + '</span>';
      }

      function paintMap() {
        const ctx = base(cv);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('日治時期的主要建設', 20, 14);
        ctx.restore();

        /* 縱貫鐵路 */
        ctx.save();
        ctx.strokeStyle = C.warn; ctx.lineWidth = 3;
        ctx.beginPath();
        NIHON_MAP.rail.forEach(function (p, i) {
          const q = TW.xy(p[0], p[1]);
          if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        });
        ctx.stroke();
        ctx.setLineDash([2, 6]); ctx.strokeStyle = '#0e1726'; ctx.lineWidth = 3; ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        NIHON_MAP.ports.forEach(function (p) { TW.dot(ctx, p.lon, p.lat, C.accent, p.n, 'l'); });
        NIHON_MAP.canal.forEach(function (p) { TW.dot(ctx, p.lon, p.lat, C.ok, p.n, 'r'); });

        const w = TW.panel(ctx, 366, 250, 232);
        w('縱貫鐵路（1908 全線通車）', C.warn, 13, 4);
        w('基隆到高雄一天到得了，南北第一次連成一線。', C.muted, 12, 8);
        w('基隆港・高雄港', C.accent, 13, 4);
        w('築港之後成為南北兩個門戶。', C.muted, 12, 8);
        w('嘉南大圳（1930 完工）', C.ok, 13, 4);
        w('烏山頭水庫供水，看天田變水田。', C.muted, 12, 0);

        readout.innerHTML = '鐵路 <b>基隆→高雄</b>　港口 <b>基隆・高雄</b>　水圳 <b>嘉南大圳</b>';
      }

      const SIDES = [
        {
          n: '縱貫鐵路',
          good: '南北往來從好幾天縮短到一天，貨物和人流動變快，帶動沿線城市發展。',
          bad: '路線與班次優先服務日本的軍事需要與資源運輸，不是為了臺灣人方便。'
        },
        {
          n: '嘉南大圳',
          good: '嘉南平原的看天田變成水田，稻米產量大幅增加。',
          bad: '增產的稻米大量輸往日本，種田的農民不一定吃得比較好。'
        },
        {
          n: '公共衛生與醫療',
          good: '自來水、下水道與防疫措施推行，傳染病減少，平均壽命提高。',
          bad: '推行方式常靠警察強制執行，人民沒有選擇的餘地。'
        },
        {
          n: '公學校教育',
          good: '識字率提高，現代學校制度在臺灣建立起來。',
          bad: '臺灣人讀公學校、日本人讀小學校，資源與升學機會並不平等。'
        },
        {
          n: '皇民化運動',
          good: '（這一項沒有對臺灣人有利的一面。）',
          bad: '要求說日語、改日本姓名、參拜神社，目的是讓臺灣人放棄自己的文化。'
        }
      ];

      function paintSide() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        const s = SIDES[si];
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(s.n, 30, 20);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#16233a'; roundRect(ctx, 30, 58, 560, 150, 10); ctx.fill();
        ctx.fillStyle = C.ok; roundRect(ctx, 30, 58, 7, 150, 3); ctx.fill();
        ctx.fillStyle = C.ok; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('帶來的改變', 52, 72);
        ctx.restore();
        TW.panel(ctx, 52, 100, 520)(s.good, C.text, 14, 0);

        ctx.save();
        ctx.fillStyle = '#16233a'; roundRect(ctx, 30, 224, 560, 150, 10); ctx.fill();
        ctx.fillStyle = C.no; roundRect(ctx, 30, 224, 7, 150, 3); ctx.fill();
        ctx.fillStyle = C.no; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('另一面', 52, 238);
        ctx.restore();
        TW.panel(ctx, 52, 266, 520)(s.bad, C.text, 14, 0);

        TW.panel(ctx, 30, 390, 560)(
          '同一件事，站在不同的位置看，結論會不一樣。這就是課綱說的「觀點與感受產生差異」。', C.muted, 12, 0);

        readout.innerHTML = '<b>' + s.n + '</b>　<span class="muted">第 ' + (si + 1) + ' / ' + SIDES.length + '</span>';
      }

      function paint() {
        if (mode === 'time') paintTime();
        else if (mode === 'map') paintMap();
        else paintSide();
      }

      const seg = Kit.segmented('模式', [
        { label: '① 年表', value: 'time' }, { label: '② 建設地圖', value: 'map' }, { label: '③ 兩面', value: 'side' }
      ], function (v) { mode = v; sync(); paint(); }, 'time');
      controls.appendChild(seg.wrap);

      const yearCtl = Kit.slider('年代', {
        min: 1895, max: 1945, value: 1895, format: function (v) { return v + ' 年'; },
        onChange: function (v) { year = v; paint(); }
      });
      const bNext = Kit.button('下一項 ▶', function () { si = (si + 1) % SIDES.length; paint(); });
      const jump = Kit.segmented('跳到', NIHON.map(function (e) {
        return { label: e.y + ' ' + e.t.slice(0, 4), value: e.y };
      }), function (v) { year = v; yearCtl.input.value = v; yearCtl.output.textContent = v + ' 年'; paint(); }, 1895);

      function sync() {
        yearCtl.wrap.style.display = jump.wrap.style.display = (mode === 'time') ? '' : 'none';
        bNext.style.display = (mode === 'side') ? '' : 'none';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(yearCtl.wrap); row.appendChild(bNext);
      host.appendChild(row);
      host.appendChild(jump.wrap);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「日本統治臺灣是哪一年到哪一年？」', why: '1895 到 1945，剛好五十年。把滑桿拉到頭尾各看一次，比背年代有感覺。' },
      { ask: '「為什麼會割讓臺灣？」', why: '甲午戰爭清帝國戰敗，1895 年簽馬關條約。這是五下第一課的起點。' },
      { ask: '「縱貫鐵路通車以後，生活有什麼不一樣？」', why: '南北從走好幾天變成一天。切到建設地圖讓他看線從基隆一路畫到高雄。' },
      { ask: '「嘉南大圳為什麼重要？」', why: '看天田變水田，稻米產量大增。可以順便問：那增產的米最後去了哪裡？' },
      { ask: '「日本人蓋這些建設，是為了臺灣人好嗎？」', why: '這題沒有標準答案，重點是他能講出<b>兩面</b>。切到「兩面」模式一起看。' },
      { ask: '「公學校和小學校差在哪裡？」', why: '臺灣人讀公學校、日本人讀小學校。制度上的不平等，比抽象的「殖民」好懂。' },
      { ask: '「皇民化運動要臺灣人做什麼？」', why: '說日語、改日本姓名、參拜神社。這一項和前面的建設不同，沒有另一面。' }
    ],

    pitfalls: [
      { bad: '寫成「日據時期」或混用。', fix: '課本與課綱用的是<b>日治時期</b>。兩種說法背後有不同的立場，寫作業時跟著課本用「日治」。' },
      { bad: '以為日本一來就開始皇民化。', fix: '皇民化運動是<b>1937 年</b>之後才推行的，那時日治已經過了四十多年。前後階段的政策不一樣。', src: 'Cb-Ⅲ-1' },
      { bad: '把嘉南大圳和日月潭發電廠搞混。', fix: '<b>嘉南大圳（1930）</b>是引水灌溉農田，<b>日月潭水力發電（1934）</b>是發電給工廠用。一個給田，一個給廠。' },
      { bad: '只記得「日本人建設臺灣」，說不出另一面。', fix: '建設是<b>為了讓臺灣的資源更好運回日本</b>，順帶改善了生活。兩件事都是真的，要一起講。', src: 'Ba-Ⅲ-1' },
      { bad: '以為當時臺灣人和日本人受一樣的教育。', fix: '臺灣人讀<b>公學校</b>、日本人讀<b>小學校</b>，資源和升學機會都不同。' },
      { bad: '記不住 1895。', fix: '記一個就好：<b>1895 開始、1945 結束、剛好 50 年</b>。中間的事件用「前期建設、後期皇民化」分成兩段。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['year', 'year', 'event', 'build', 'side', 'order', 'term']);

      if (type === 'year') {
        const e = pick(NIHON);
        const wrongs = NIHON.filter(function (x) { return x.y !== e.y; }).map(function (x) { return x.y + ' 年'; });
        const o = pick4(e.y + ' 年', wrongs);
        return {
          tpl: 'year',
          q: '「<b>' + e.t + '</b>」發生在哪一年？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + e.y + ' 年：' + e.t + '</b><br>' + e.d + '<br>' +
            '日治時期是 <b>1895 到 1945</b>，剛好五十年。把事件放進這條線上比較好記。'
        };
      }

      if (type === 'event') {
        const e = pick(NIHON);
        const o = pick4(e.t, NIHON.filter(function (x) { return x.t !== e.t; }).map(function (x) { return x.t; }));
        return {
          tpl: 'event',
          q: '<b>' + e.y + ' 年</b>的臺灣發生了什麼事？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + e.y + '　' + e.t + '</b><br>' + e.d + '<br>' +
            '前期（1895–1930 年代）以<b>建設</b>為主，後期（1937 起）進入<b>皇民化</b>，兩段的政策方向不同。'
        };
      }

      if (type === 'build') {
        const items = [
          { t: '縱貫鐵路', ok: '讓南北往來從好幾天縮短成一天' },
          { t: '嘉南大圳', ok: '把嘉南平原的看天田變成水田' },
          { t: '日月潭水力發電廠', ok: '提供穩定的電力給工廠使用' },
          { t: '基隆港與高雄港', ok: '成為南北兩個對外的門戶' }
        ];
        const it = pick(items);
        const o = pick4(it.ok, items.filter(function (x) { return x.t !== it.t; }).map(function (x) { return x.ok; }));
        return {
          tpl: 'build',
          q: '日治時期的<b>' + it.t + '</b>，主要帶來什麼改變？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + it.t + '</b>：' + it.ok + '。<br>' +
            '分辨訣竅：鐵路和港口是<b>運輸</b>，大圳是<b>灌溉</b>，發電廠是<b>電力</b>。<br>' +
            '這些建設同時也讓臺灣的資源更容易運回日本，兩面都要記得。'
        };
      }

      if (type === 'side') {
        const o = shuffled([
          { t: '建設改善了生活，但主要目的是讓資源更方便運回日本', ok: true },
          { t: '建設完全是為了臺灣人的福利著想' },
          { t: '建設對臺灣完全沒有任何好處' },
          { t: '日本沒有在臺灣進行任何建設' }
        ]);
        return {
          tpl: 'side',
          q: '關於日治時期的建設，下面哪一個說法比較完整？',
          choices: o.choices, answer: o.answer,
          steps: '鐵路、水圳、發電廠確實改善了生活，這是真的；<br>' +
            '但它們的<b>設計目的</b>是配合日本的軍事與經濟需要，這也是真的。<br>' +
            '只講一面都不完整。課綱 Ba-Ⅲ-1 說的就是「不同的生活背景會使觀點與感受產生差異」。'
        };
      }

      if (type === 'term') {
        const o = shuffled([
          { t: '日治時期', ok: true },
          { t: '日據時期' },
          { t: '日領時期' },
          { t: '日管時期' }
        ]);
        return {
          tpl: 'term',
          q: '課本與課綱稱 1895 到 1945 年這段時間為什麼？',
          choices: o.choices, answer: o.answer,
          steps: '課本與課綱用的是<b>日治時期</b>。<br>' +
            '「日據」是另一種說法，背後帶有不同的立場；寫作業與考試時<b>跟著課本用「日治」</b>。<br>' +
            '這段時間從 1895 年馬關條約開始，到 1945 年日本戰敗結束。'
        };
      }

      // order：先後順序
      const two = shuffle(NIHON).slice(0, 2).sort(function (a, b) { return a.y - b.y; });
      const o = shuffled([
        { t: two[0].t, ok: true },
        { t: two[1].t }
      ]);
      return {
        tpl: 'order',
        q: '「' + two[0].t + '」和「' + two[1].t + '」，哪一件<b>比較早</b>發生？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + two[0].y + '　' + two[0].t + '</b>　比　<b>' + two[1].y + '　' + two[1].t + '</b>　早 ' +
          (two[1].y - two[0].y) + ' 年。<br>' +
          '記法：先有<b>統治制度</b>（1895 割讓、1898 保甲），再有<b>建設</b>（1908 鐵路、1930 大圳、1934 發電），' +
          '最後才是<b>皇民化</b>（1937）。'
      };
    }
  });


  /* ============================================================
     第 2 單元　生活中的文化展現
     ============================================================ */
  Kit.register('soc5b-u2', {

    intro: '同樣是米，閩南人做粿、客家人做粄、原住民族用小米；同樣是房子，平原蓋三合院、山上蓋石板屋、蘭嶼蓋地下屋。切換三個模式：<b>米食</b>、<b>建築</b>、<b>文化三層</b>。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'rice', ri = 0, hi = 0, li = 0;

      function paintRice() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('米食：同一種作物，不同族群做出不同的東西', 26, 16);
        ctx.restore();

        let y = 52;
        RICE.forEach(function (r, i) {
          const on = i === ri;
          ctx.save();
          ctx.fillStyle = on ? '#16233a' : '#111c2e';
          roundRect(ctx, 26, y, 568, on ? 78 : 46, 8); ctx.fill();
          ctx.fillStyle = on ? C.warn : '#3a4b6b';
          roundRect(ctx, 26, y, 7, on ? 78 : 46, 3); ctx.fill();
          ctx.fillStyle = on ? C.warn : '#5a6b8b';
          ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(r.g + '　' + r.f, 48, y + 9);
          ctx.restore();
          if (on) {
            TW.panel(ctx, 48, y + 32, 528)(r.d, C.text, 13, 0);
            ctx.save();
            ctx.fillStyle = C.ok; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'right'; ctx.textBaseline = 'top';
            ctx.fillText('主要用：' + r.r, 578, y + 9);
            ctx.restore();
          }
          y += (on ? 86 : 54);
        });

        const w = TW.panel(ctx, 26, y + 10, 568);
        w('三種原料：', C.accent, 14, 6);
        RICE_KINDS.forEach(function (k) { w('　' + k.n + '　' + k.d, C.muted, 12, 2); });

        readout.innerHTML = '<b>' + RICE[ri].g + '</b>　' + RICE[ri].f + '　<span class="muted">用 ' + RICE[ri].r + '</span>';
      }

      function paintHouse() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        const h = HOUSE[hi];
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('建築：房子怎麼蓋，看的是環境和文化', 26, 16);
        ctx.restore();

        /* 簡單示意圖 */
        const cx = 310, cy = 150;
        ctx.save();
        ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(251,191,36,0.12)';
        if (h.n === '三合院' || h.n === '夥房') {
          ctx.beginPath();
          ctx.rect(cx - 90, cy - 40, 180, 55);           // 正廳
          ctx.rect(cx - 130, cy - 40, 40, 110);          // 左護龍
          ctx.rect(cx + 90, cy - 40, 40, 110);           // 右護龍
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('正廳', cx, cy - 14);
          ctx.fillText(h.n === '夥房' ? '禾埕' : '中庭', cx, cy + 46);
        } else if (h.n === '石板屋') {
          for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
            ctx.beginPath();
            ctx.rect(cx - 105 + c * 30, cy - 40 + r * 22, 28, 20);
            ctx.fill(); ctx.stroke();
          }
        } else if (h.n === '地下屋') {
          ctx.beginPath(); ctx.moveTo(cx - 150, cy - 30); ctx.lineTo(cx + 150, cy - 30); ctx.stroke();
          ctx.beginPath();
          ctx.rect(cx - 80, cy - 20, 160, 70); ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText('地面', cx - 150, cy - 34);
        } else if (h.n === '日式木造宿舍') {
          ctx.beginPath();
          ctx.moveTo(cx - 100, cy - 10); ctx.lineTo(cx, cy - 50); ctx.lineTo(cx + 100, cy - 10);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.rect(cx - 85, cy - 10, 170, 55); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx - 85, cy + 45); ctx.lineTo(cx + 85, cy + 45); ctx.stroke();
          ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('架高的地板', cx, cy + 50);
        } else {
          ctx.beginPath(); ctx.rect(cx - 100, cy - 50, 200, 100); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx - 110, cy - 50); ctx.lineTo(cx + 110, cy - 50); ctx.stroke();
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(cx - 55 + i * 55, cy - 20, 16, Math.PI, 0); ctx.stroke();
          }
          ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('裝飾繁複的立面', cx, cy + 56);
        }
        ctx.restore();

        const w = TW.panel(ctx, 26, 240, 568);
        w(h.n + '　（' + h.g + '）', C.warn, 17, 8);
        w(h.d, C.text, 14, 10);
        w('關鍵特徵：' + h.e, C.ok, 13, 12);
        w('房子的樣子不是隨便決定的：<b>看得到什麼材料、要擋什麼天氣、家族怎麼住在一起</b>，都會寫進建築裡。', C.muted, 12, 0);

        readout.innerHTML = '<b>' + h.n + '</b>　' + h.g + '　<span class="muted">第 ' + (hi + 1) + ' / ' + HOUSE.length + '</span>';
      }

      function paintLayer() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('文化的三個層面', 26, 16);
        ctx.restore();

        let y = 56;
        const cols = [C.warn, C.accent, C.purple];
        CULTURE_LAYERS.forEach(function (L, i) {
          const on = i <= li;
          ctx.save();
          ctx.fillStyle = on ? '#16233a' : '#111c2e';
          roundRect(ctx, 26, y, 568, 112, 10); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#2b3f63';
          roundRect(ctx, 26, y, 8, 112, 4); ctx.fill();
          ctx.fillStyle = on ? cols[i] : '#3a4b6b';
          ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(L.n, 50, y + 12);
          ctx.restore();
          if (on) {
            TW.panel(ctx, 50, y + 40, 520)(L.d, C.text, 13, 0);
            ctx.save();
            ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText('例：' + L.e.join('、'), 50, y + 84);
            ctx.restore();
          }
          y += 120;
        });
        TW.panel(ctx, 26, y + 6, 568)(
          '從<b>看得到的東西</b>往<b>看不見的想法</b>走，這就是讀一個文化的順序。', C.muted, 12, 0);

        readout.innerHTML = '已顯示 <b>' + (li + 1) + '</b> / 3 層　<b>' + CULTURE_LAYERS[li].n + '</b>';
      }

      function paint() {
        if (mode === 'rice') paintRice();
        else if (mode === 'house') paintHouse();
        else paintLayer();
      }

      const seg = Kit.segmented('模式', [
        { label: '① 米食', value: 'rice' }, { label: '② 建築', value: 'house' }, { label: '③ 文化三層', value: 'layer' }
      ], function (v) { mode = v; paint(); }, 'rice');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(Kit.button('◀ 上一個', function () {
        if (mode === 'rice') ri = (ri - 1 + RICE.length) % RICE.length;
        else if (mode === 'house') hi = (hi - 1 + HOUSE.length) % HOUSE.length;
        else li = (li - 1 + 3) % 3;
        paint();
      }));
      row.appendChild(Kit.button('下一個 ▶', function () {
        if (mode === 'rice') ri = (ri + 1) % RICE.length;
        else if (mode === 'house') hi = (hi + 1) % HOUSE.length;
        else li = (li + 1) % 3;
        paint();
      }));

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      paint();
    },

    parentGuide: [
      { ask: '「粿和粄有什麼不一樣？」', why: '做法很像，差在<b>族群的說法不同</b>：閩南叫粿、客家叫粄。這是「同中有異」最好的例子。' },
      { ask: '「在來米和蓬萊米差在哪裡？」', why: '在來米鬆散、適合做粿；蓬萊米黏香、是現在的白飯，日治時期改良出來的。這題連回第一單元。' },
      { ask: '「為什麼蘭嶼的房子要蓋在地面下？」', why: '躲颱風和海風。讓他自己從環境推出來，比背「達悟族地下屋」有用。' },
      { ask: '「石板屋為什麼用石板？」', why: '因為當地就有板岩，<b>就地取材</b>。文化特色常常來自環境給了什麼材料。' },
      { ask: '「我們家附近有沒有三合院或日式老房子？」', why: '把課本拉回生活。看得到實物的話，記憶會完全不一樣。' },
      { ask: '「廟會遶境算哪一層文化？」', why: '同時是社群文化（人怎麼組織起來）和精神文化（信仰）。答案不只一個，能講出理由就好。' }
    ],

    pitfalls: [
      { bad: '以為粿和粄是完全不同的東西。', fix: '做法相近，<b>差在族群的稱呼</b>：閩南叫粿，客家叫粄。這正好說明族群接觸後的融合與轉化。', src: 'Bc-Ⅲ-1' },
      { bad: '把小米當成一種稻米。', fix: '小米<b>不是稻米</b>，是另一種作物，也是原住民族傳統的主食與祭典作物。' },
      { bad: '以為蓬萊米是臺灣自古就有的。', fix: '蓬萊米是<b>日治時期改良</b>出來的品種。臺灣原本的是<b>在來米</b>。' },
      { bad: '把石板屋和地下屋弄反。', fix: '<b>石板屋</b>是排灣族、魯凱族用板岩疊成；<b>地下屋</b>是達悟族在蘭嶼為了避風而蓋在地面下。' },
      { bad: '以為建築樣式只是好不好看的問題。', fix: '建築反映的是<b>環境（有什麼材料、要擋什麼天氣）</b>和<b>生活方式（家族怎麼住）</b>。', src: 'Bb-Ⅲ-1' },
      { bad: '把「文化」只想成節慶和表演。', fix: '文化有三層：<b>物質</b>（吃的用的住的）、<b>社群</b>（人的組織與規矩）、<b>精神</b>（信仰與價值觀）。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['rice', 'rice', 'riceKind', 'house', 'house', 'houseWhy', 'layer', 'layerEx']);

      if (type === 'rice') {
        const r = pick(RICE);
        const o = pick4(r.f, RICE.filter(function (x) { return x.f !== r.f; }).map(function (x) { return x.f; }));
        return {
          tpl: 'rice',
          q: '<b>' + r.g + '</b>的傳統米食，最有代表性的是哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + r.g + '：' + r.f + '</b><br>' + r.d + '<br>' +
            '同樣的作物，不同族群做出不同的東西，這就是文化的多樣性。'
        };
      }

      if (type === 'riceKind') {
        const k = pick(RICE_KINDS);
        const o = pick4(k.n, RICE_KINDS.filter(function (x) { return x.n !== k.n; }).map(function (x) { return x.n; })
          .concat(['糯米']));
        return {
          tpl: 'riceKind',
          q: '「' + k.d + '」講的是哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + k.n + '</b>：' + k.d + '<br>' +
            '在來米鬆散做粿粄，蓬萊米黏香當白飯（日治時期改良），小米則不是稻米。'
        };
      }

      if (type === 'house') {
        const h = pick(HOUSE);
        const o = pick4(h.n, HOUSE.filter(function (x) { return x.n !== h.n; }).map(function (x) { return x.n; }));
        return {
          tpl: 'house',
          q: '「' + h.d + '」<br>這說的是哪一種建築？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + h.n + '</b>（' + h.g + '）：' + h.d + '<br>' +
            '關鍵特徵是<b>' + h.e + '</b>。<br>' +
            '判斷方法：先想這裡有什麼材料、要擋什麼天氣，答案通常就出來了。'
        };
      }

      if (type === 'houseWhy') {
        const cases = [
          { n: '地下屋', ok: '為了避開蘭嶼強烈的颱風與海風' },
          { n: '石板屋', ok: '因為當地就有板岩，就地取材而且冬暖夏涼' },
          { n: '日式木造宿舍', ok: '地板架高可以防潮，適合潮溼的氣候' },
          { n: '三合院', ok: '正廳居中、兩側護龍，方便一個家族住在一起' }
        ];
        const c = pick(cases);
        const o = pick4(c.ok, cases.filter(function (x) { return x.n !== c.n; }).map(function (x) { return x.ok; }));
        return {
          tpl: 'houseWhy',
          q: '<b>' + c.n + '</b>會蓋成那個樣子，主要是為什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.n + '</b>：' + c.ok + '。<br>' +
            '建築反映的是<b>自然環境</b>（材料、天氣）和<b>生活方式</b>（家族怎麼住）。<br>' +
            '這就是課綱 Bb-Ⅲ-1 說的「自然與人文環境的交互影響，造成生活空間型態的差異與多元」。'
        };
      }

      if (type === 'layerEx') {
        const L = pick(CULTURE_LAYERS);
        const ex = pick(L.e);
        const o = pick4(L.n, CULTURE_LAYERS.filter(function (x) { return x.n !== L.n; }).map(function (x) { return x.n; }));
        return {
          tpl: 'layerEx',
          q: '「<b>' + ex + '</b>」屬於文化的哪一個層面？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + L.n + '</b>：' + L.d + '<br>' +
            '「' + ex + '」屬於這一層。<br>' +
            '判斷順序：摸得到 → 物質；講的是人的組織與規矩 → 社群；講的是想法與信仰 → 精神。'
        };
      }

      // layer：定義
      const L = pick(CULTURE_LAYERS);
      const o = pick4(L.d, CULTURE_LAYERS.filter(function (x) { return x.n !== L.n; }).map(function (x) { return x.d; }));
      return {
        tpl: 'layer',
        q: '文化的「<b>' + L.n + '</b>」指的是什麼？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + L.n + '</b>：' + L.d + '<br>' +
          '例如：' + L.e.join('、') + '。<br>' +
          '三層一起看：物質（看得到）→ 社群（人怎麼組織）→ 精神（看不見的想法）。'
      };
    }
  });


  /* ============================================================
     第 3 單元　走向民主的中華民國
     ============================================================ */
  Kit.register('soc5b-u3', {

    intro: '從戒嚴到總統直選，臺灣花了將近五十年。拖動<b>年代滑桿</b>，看限制怎麼一項一項放開，民主怎麼一步一步走出來。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let year = 1947, mode = 'time';

      function paintTime() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.font = FONT;

        const x0 = 56, x1 = 574, y = 76;
        const px = function (yy) { return x0 + (yy - 1945) / 55 * (x1 - x0); };

        /* 戒嚴期間的底色 */
        ctx.save();
        const a = px(1949), b = px(Math.min(year, 1987));
        if (year >= 1949) {
          ctx.fillStyle = 'rgba(251,113,133,0.18)';
          ctx.fillRect(a, y - 26, Math.max(0, b - a), 52);
          ctx.fillStyle = C.no; ctx.font = '11px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText('戒嚴', a + 4, y - 28);
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.strokeStyle = C.soc; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(px(year), y); ctx.stroke();
        for (let yy = 1950; yy <= 2000; yy += 10) {
          ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px(yy), y - 6); ctx.lineTo(px(yy), y + 6); ctx.stroke();
          ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(yy, px(yy), y + 10);
        }
        DEMO.forEach(function (e) {
          const on = e.y <= year;
          ctx.fillStyle = on ? (e.k === '限制' ? C.no : e.k === '事件' ? C.warn : C.ok) : '#2b3f63';
          ctx.beginPath(); ctx.arc(px(e.y), y, on ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = C.soc; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(year + ' 年', px(year), y - 34);
        ctx.restore();

        const shown = DEMO.filter(function (e) { return e.y <= year; });
        let ly = 122;
        shown.slice(-5).forEach(function (e) {
          const col = e.k === '限制' ? C.no : e.k === '事件' ? C.warn : e.k === '選舉' ? C.accent : C.ok;
          ctx.save();
          ctx.fillStyle = '#16233a'; roundRect(ctx, 30, ly, 560, 56, 8); ctx.fill();
          ctx.fillStyle = col; roundRect(ctx, 30, ly, 7, 56, 3); ctx.fill();
          ctx.fillStyle = col; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(e.y + '　' + e.t, 50, ly + 8);
          ctx.restore();
          TW.panel(ctx, 50, ly + 28, 520)(e.d, C.muted, 12, 0);
          ly += 62;
        });

        const inMartial = year >= 1949 && year < 1987;
        ctx.save();
        ctx.fillStyle = inMartial ? C.no : C.ok;
        ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(inMartial ? '此時：戒嚴中，集會結社與言論出版受到限制' :
          (year < 1949 ? '此時：尚未戒嚴' : '此時：已解嚴'), 30, 414);
        ctx.restore();

        readout.innerHTML = '<b>' + year + ' 年</b>　' +
          (inMartial ? '<span style="color:var(--no)">戒嚴中</span>' : year < 1949 ? '尚未戒嚴' : '<span style="color:var(--ok)">已解嚴</span>') +
          '　已發生 <b>' + shown.length + '</b> / ' + DEMO.length + ' 件';
      }

      const FREEDOM = [
        { n: '組政黨', before: '不可以，只有既有政黨', after: '可以自由組黨（1986 民進黨成立、1987 解嚴後開放）' },
        { n: '辦報紙', before: '報紙的家數與張數受限制', after: '解嚴後開放，報紙與媒體大量增加' },
        { n: '集會遊行', before: '集會結社受到嚴格限制', after: '可以依法集會遊行' },
        { n: '選立法委員', before: '國會未全面改選，多數席次不是本地選出', after: '1992 年起全面改選，全部由人民選出' },
        { n: '選總統', before: '由國民大會間接選出', after: '1996 年起由人民直接投票選出' }
      ];

      function paintFree() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('戒嚴時期　vs　解嚴之後', 26, 16);
        ctx.restore();

        let y = 52;
        FREEDOM.forEach(function (f) {
          ctx.save();
          ctx.fillStyle = '#16233a'; roundRect(ctx, 26, y, 568, 68, 8); ctx.fill();
          ctx.fillStyle = C.text; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(f.n, 44, y + 10);
          ctx.fillStyle = C.no; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.fillText('戒嚴時：' + f.before, 130, y + 10);
          ctx.fillStyle = C.ok;
          ctx.fillText('解嚴後：' + f.after, 130, y + 38);
          ctx.restore();
          y += 74;
        });
        TW.panel(ctx, 26, y + 8, 568)(
          '戒嚴一共 38 年（1949–1987）。這些改變不是一次發生的，是一項一項爭取來的。', C.muted, 12, 0);
        readout.innerHTML = '戒嚴 <b>1949–1987</b>　共 <b>38</b> 年';
      }

      function paint() { if (mode === 'time') paintTime(); else paintFree(); }

      const seg = Kit.segmented('模式', [
        { label: '① 民主歷程', value: 'time' }, { label: '② 前後對照', value: 'free' }
      ], function (v) { mode = v; sync(); paint(); }, 'time');
      controls.appendChild(seg.wrap);

      const yearCtl = Kit.slider('年代', {
        min: 1945, max: 2000, value: 1947, format: function (v) { return v + ' 年'; },
        onChange: function (v) { year = v; paint(); }
      });
      const jump = Kit.segmented('跳到', [
        { label: '1947 二二八', value: 1947 }, { label: '1949 戒嚴', value: 1949 },
        { label: '1979 美麗島', value: 1979 }, { label: '1987 解嚴', value: 1987 },
        { label: '1996 總統直選', value: 1996 }
      ], function (v) { year = v; yearCtl.input.value = v; yearCtl.output.textContent = v + ' 年'; paint(); }, 1947);

      function sync() {
        yearCtl.wrap.style.display = jump.wrap.style.display = (mode === 'time') ? '' : 'none';
      }

      host.appendChild(readout);
      host.appendChild(controls);
      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      row.appendChild(yearCtl.wrap);
      host.appendChild(row);
      host.appendChild(jump.wrap);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「戒嚴是什麼意思？」', why: '軍事上的緊急狀態，集會、結社、言論、出版都受到限制。用「前後對照」模式看具體差在哪，比講定義有用。' },
      { ask: '「臺灣戒嚴了幾年？」', why: '1949 到 1987，<b>38 年</b>。這個數字很有感，值得記起來。' },
      { ask: '「解嚴以後，什麼事情變得可以做了？」', why: '組政黨、辦報紙、集會遊行。切到對照模式一項一項看。' },
      { ask: '「總統以前是誰選的？現在呢？」', why: '以前由國民大會間接選，1996 年起由人民直接選。這是民主化最具體的一步。' },
      { ask: '「為什麼民進黨在還沒解嚴時就能成立？」', why: '1986 年在戒嚴下宣布成立，是冒風險的突破。可以聊：有人先跨出去，制度才會跟著改。' },
      { ask: '「這些權利是本來就有的嗎？」', why: '不是，是一項一項爭取來的。這正是課綱 Cd-Ⅲ-1 想讓孩子理解的事。' }
    ],

    pitfalls: [
      { bad: '把二二八事件和美麗島事件搞混。', fix: '<b>二二八是 1947 年</b>（戒嚴之前），<b>美麗島是 1979 年</b>（戒嚴期間）。中間差了三十多年。', src: 'Cb-Ⅲ-1' },
      { bad: '以為解嚴之後馬上就有總統直選。', fix: '<b>1987 解嚴</b>，<b>1992 立委全面改選</b>，<b>1996 才第一次總統直選</b>。是一步一步來的。', src: 'Cd-Ⅲ-1' },
      { bad: '以為戒嚴只是「比較嚴格」。', fix: '戒嚴期間<b>不能自由組黨、辦報受限、集會遊行受限</b>。這不是嚴格程度的差別，是有沒有這個權利的差別。' },
      { bad: '記錯戒嚴的長度。', fix: '1949 到 1987，一共 <b>38 年</b>。用「1949 開始、1987 結束」兩個數字相減就好。' },
      { bad: '以為民主是某一年突然出現的。', fix: '課綱 Cd-Ⅲ-2 說的是<b>人民的政治參與和公民團體的發展</b>累積出來的。時間軸上每一個點都是一步。' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['year', 'year', 'event', 'span', 'order', 'free', 'martial']);

      if (type === 'year') {
        const e = pick(DEMO);
        const o = pick4(e.y + ' 年', DEMO.filter(function (x) { return x.y !== e.y; }).map(function (x) { return x.y + ' 年'; }));
        return {
          tpl: 'year',
          q: '「<b>' + e.t + '</b>」發生在哪一年？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + e.y + ' 年：' + e.t + '</b><br>' + e.d + '<br>' +
            '五個關鍵年份：1947 二二八、1949 戒嚴、1979 美麗島、1987 解嚴、1996 總統直選。'
        };
      }

      if (type === 'event') {
        const e = pick(DEMO);
        const o = pick4(e.t, DEMO.filter(function (x) { return x.t !== e.t; }).map(function (x) { return x.t; }));
        return {
          tpl: 'event',
          q: '<b>' + e.y + ' 年</b>的臺灣發生了什麼事？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + e.y + '　' + e.t + '</b><br>' + e.d + '<br>' +
            '把事件排在時間線上：限制（1949 戒嚴）→ 事件（1979 美麗島）→ 突破（1986、1987、1991）→ 選舉（1992、1996）。'
        };
      }

      if (type === 'span') {
        const o = pick4('38 年', ['28 年', '48 年', '58 年', '18 年']);
        return {
          tpl: 'span',
          q: '臺灣的戒嚴時期一共持續了幾年？',
          choices: o.choices, answer: o.answer,
          steps: '<b>1949 年開始戒嚴，1987 年解除戒嚴。</b><br>' +
            '1987 － 1949 ＝ <b>38 年</b>。<br>' +
            '記法：兩個年份記起來，中間用減的就好，不用另外背 38。'
        };
      }

      if (type === 'martial') {
        const y = pick([1946, 1948, 1955, 1965, 1975, 1985, 1990, 1995, 1999]);
        const inM = y >= 1949 && y < 1987;
        const o = shuffled([
          { t: inM ? '戒嚴中' : (y < 1949 ? '還沒開始戒嚴' : '已經解嚴'), ok: true },
          { t: inM ? '已經解嚴' : '戒嚴中' }
        ]);
        return {
          tpl: 'martial',
          q: '<b>' + y + ' 年</b>的臺灣，處在什麼狀態？',
          choices: o.choices, answer: o.answer,
          steps: '戒嚴期間是 <b>1949 到 1987</b>。<br>' +
            y + ' 年' + (inM ? '在這個區間裡面，所以是<b>戒嚴中</b>。' :
              (y < 1949 ? '比 1949 早，所以<b>還沒開始戒嚴</b>。' : '比 1987 晚，所以<b>已經解嚴</b>。')) + '<br>' +
            '判斷方法：只要記住 1949 和 1987 兩個數字，中間就是戒嚴。'
        };
      }

      if (type === 'free') {
        const items = [
          { n: '自由組成新的政黨', y: '解嚴之後' },
          { n: '人民直接投票選總統', y: '解嚴之後' },
          { n: '集會結社受到嚴格限制', y: '戒嚴時期' },
          { n: '報紙的家數與張數受到限制', y: '戒嚴時期' }
        ];
        const it = pick(items);
        const o = shuffled([
          { t: it.y, ok: true },
          { t: it.y === '戒嚴時期' ? '解嚴之後' : '戒嚴時期' }
        ]);
        return {
          tpl: 'free',
          q: '「<b>' + it.n + '</b>」是<b>戒嚴時期</b>還是<b>解嚴之後</b>的情形？',
          choices: o.choices, answer: o.answer,
          steps: '這是<b>' + it.y + '</b>的情形。<br>' +
            '戒嚴時期：不能自由組黨、辦報受限、集會遊行受限、國會未全面改選。<br>' +
            '解嚴之後：這些限制陸續放開，1992 立委全面改選、1996 總統直選。'
        };
      }

      // order：先後
      const two = shuffle(DEMO).slice(0, 2).sort(function (a, b) { return a.y - b.y; });
      const o = shuffled([{ t: two[0].t, ok: true }, { t: two[1].t }]);
      return {
        tpl: 'order',
        q: '「' + two[0].t + '」和「' + two[1].t + '」，哪一件<b>比較早</b>？',
        choices: o.choices, answer: o.answer,
        steps: '<b>' + two[0].y + '　' + two[0].t + '</b>　比　<b>' + two[1].y + '　' + two[1].t + '</b>　早 ' +
          (two[1].y - two[0].y) + ' 年。<br>' +
          '順序記法：<b>二二八(1947) → 戒嚴(1949) → 美麗島(1979) → 組黨(1986) → 解嚴(1987) → 廢臨時條款(1991) → 立委改選(1992) → 總統直選(1996)</b>。'
      };
    }
  });


  /* ============================================================
     第 4 單元　從臺灣探索世界文化
     ============================================================ */
  const GROUPS = [
    {
      g: '原住民族', env: '山地與海岸', life: '狩獵、山田燒墾、捕魚；蘭嶼以飛魚為中心',
      cul: '小米祭典、石板屋與地下屋、族語與歌謠'
    },
    {
      g: '閩南', env: '西部平原', life: '水稻農業、沿海貿易',
      cul: '三合院、粿、媽祖與王爺信仰、閩南語'
    },
    {
      g: '客家', env: '丘陵與臺地', life: '開墾坡地、種茶與樟腦',
      cul: '夥房與禾埕、粄、義民信仰、客語'
    },
    {
      g: '戰後移入的各省族群', env: '城市與眷村', life: '軍公教與各行各業',
      cul: '眷村飲食（麵食、牛肉麵）、各地方戲曲與語言'
    },
    {
      g: '新住民', env: '各地城鄉', life: '家庭與各行各業',
      cul: '東南亞飲食、節慶與語言，成為臺灣文化新的一部分'
    }
  ];

  Kit.register('soc5b-u4', {

    intro: '臺灣的文化不是憑空長出來的，是不同的人一批一批帶進來，再慢慢混在一起。切換三個模式：<b>宗教</b>看信仰怎麼傳進來，<b>族群</b>看生活方式怎麼變成文化，<b>看世界</b>練習用同一套眼光讀別人的文化。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'rel', rli = 0, gi = 0;

      function paintRel() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('宗教怎麼傳到臺灣', 26, 16);
        ctx.restore();

        let y = 50;
        RELIGION.forEach(function (r, i) {
          const on = i === rli;
          ctx.save();
          ctx.fillStyle = on ? '#16233a' : '#111c2e';
          roundRect(ctx, 26, y, 568, on ? 74 : 44, 8); ctx.fill();
          ctx.fillStyle = on ? C.warn : '#3a4b6b';
          roundRect(ctx, 26, y, 7, on ? 74 : 44, 3); ctx.fill();
          ctx.fillStyle = on ? C.warn : '#5a6b8b';
          ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(r.n, 46, y + 9);
          ctx.fillStyle = on ? C.accent : '#3a4b6b';
          ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(r.t, 578, y + 11);
          ctx.restore();
          if (on) {
            TW.panel(ctx, 46, y + 30, 520)('由' + r.w + '傳入。' + r.d + '（例如：' + r.ex + '）', C.text, 12, 0);
          }
          y += (on ? 80 : 50);
        });

        TW.panel(ctx, 26, y + 8, 568)(
          '同一塊土地上，不同時期來的人帶來不同的信仰，最後一起留了下來。這就是文化的多樣性。', C.muted, 12, 0);

        readout.innerHTML = '<b>' + RELIGION[rli].n + '</b>　' + RELIGION[rli].t + '　' +
          '<span class="muted">' + RELIGION[rli].w + '</span>';
      }

      function paintGroup() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        const g = GROUPS[gi];
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('環境 → 生活方式 → 文化', 26, 16);
        ctx.restore();

        const boxes = [
          { lab: '① 住在什麼環境', v: g.env, c: C.accent },
          { lab: '② 靠什麼生活', v: g.life, c: C.warn },
          { lab: '③ 長出什麼文化', v: g.cul, c: C.ok }
        ];
        let y = 66;
        boxes.forEach(function (b, i) {
          ctx.save();
          ctx.fillStyle = '#16233a'; roundRect(ctx, 26, y, 568, 88, 10); ctx.fill();
          ctx.fillStyle = b.c; roundRect(ctx, 26, y, 8, 88, 4); ctx.fill();
          ctx.fillStyle = b.c; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(b.lab, 50, y + 12);
          ctx.restore();
          TW.panel(ctx, 50, y + 36, 520)(b.v, C.text, 14, 0);
          if (i < 2) {
            ctx.save();
            ctx.fillStyle = C.muted; ctx.font = '18px sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('▼', 310, y + 98);
            ctx.restore();
          }
          y += 108;
        });

        ctx.save();
        ctx.fillStyle = C.purple; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(g.g, 26, 40);
        ctx.restore();

        TW.panel(ctx, 26, 396, 568)(
          '文化不是憑空出現的，是「住在哪裡 → 怎麼生活 → 於是有了什麼」一路長出來的。', C.muted, 12, 0);

        readout.innerHTML = '<b>' + g.g + '</b>　<span class="muted">第 ' + (gi + 1) + ' / ' + GROUPS.length + '</span>';
      }

      function paintWorld() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        ctx.save();
        ctx.fillStyle = C.soc; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('用同一套眼光讀別人的文化', 26, 16);
        ctx.restore();

        const steps = [
          { n: '一、先看環境', d: '那裡是熱是冷、靠海還是內陸、種得出什麼？環境決定了最初的可能。' },
          { n: '二、再看生活方式', d: '他們靠什麼過日子？吃什麼、住什麼、怎麼移動？' },
          { n: '三、然後看信仰與規矩', d: '他們相信什麼、重視什麼、節慶在慶祝什麼？' },
          { n: '四、最後才下判斷', d: '不用「奇怪」「落後」來形容。先問「為什麼會這樣」，通常都找得到理由。' }
        ];
        let y = 56;
        steps.forEach(function (s, i) {
          const cols = [C.accent, C.warn, C.purple, C.ok];
          ctx.save();
          ctx.fillStyle = '#16233a'; roundRect(ctx, 26, y, 568, 78, 10); ctx.fill();
          ctx.fillStyle = cols[i]; roundRect(ctx, 26, y, 8, 78, 4); ctx.fill();
          ctx.fillStyle = cols[i]; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(s.n, 50, y + 12);
          ctx.restore();
          TW.panel(ctx, 50, y + 36, 520)(s.d, C.text, 13, 0);
          y += 86;
        });
        TW.panel(ctx, 26, y + 6, 568)(
          '這四步用在臺灣的族群上，也用在世界其他文化上。方法一樣，才叫「尊重多樣性」。', C.muted, 12, 0);
        readout.innerHTML = '讀文化的<b>四個步驟</b>：環境 → 生活方式 → 信仰與規矩 → 最後才判斷';
      }

      function paint() {
        if (mode === 'rel') paintRel();
        else if (mode === 'group') paintGroup();
        else paintWorld();
      }

      const seg = Kit.segmented('模式', [
        { label: '① 宗教', value: 'rel' }, { label: '② 族群', value: 'group' }, { label: '③ 看世界', value: 'world' }
      ], function (v) { mode = v; sync(); paint(); }, 'rel');
      controls.appendChild(seg.wrap);

      const row = Kit.el('div', { class: 'controls', style: 'margin-top:8px;' });
      const bPrev = Kit.button('◀ 上一個', function () {
        if (mode === 'rel') rli = (rli - 1 + RELIGION.length) % RELIGION.length;
        else if (mode === 'group') gi = (gi - 1 + GROUPS.length) % GROUPS.length;
        paint();
      });
      const bNext = Kit.button('下一個 ▶', function () {
        if (mode === 'rel') rli = (rli + 1) % RELIGION.length;
        else if (mode === 'group') gi = (gi + 1) % GROUPS.length;
        paint();
      });
      row.appendChild(bPrev); row.appendChild(bNext);
      function sync() { bPrev.style.display = bNext.style.display = (mode === 'world') ? 'none' : ''; }

      host.appendChild(readout);
      host.appendChild(controls);
      host.appendChild(row);
      sync(); paint();
    },

    parentGuide: [
      { ask: '「我們家附近的廟拜的是誰？」', why: '從自己住的地方開始最有效。媽祖、關公、土地公都是漢人移民帶來的民間信仰。' },
      { ask: '「馬偕在臺灣做了哪些事？」', why: '傳教、行醫、辦學校，1872 年在淡水。這一課同時是宗教史也是醫療史。' },
      { ask: '「為什麼原住民族有小米祭典，閩南人沒有？」', why: '因為主食不同。回到「環境 → 生活方式 → 文化」那三格，答案自己會浮出來。' },
      { ask: '「客家人為什麼多住在丘陵？」', why: '來得比較晚，平原已經開墾完了，只能往坡地發展，也因此發展出種茶與樟腦。' },
      { ask: '「新住民帶來了什麼？」', why: '飲食、節慶、語言。可以問問他班上有沒有同學家裡是這樣，聊得具體最好。' },
      { ask: '「看到不熟悉的文化，第一句話該問什麼？」', why: '問「為什麼會這樣」，不是說「好奇怪」。切到「看世界」模式，四個步驟一起念一次。' }
    ],

    pitfalls: [
      { bad: '把佛教、道教和民間信仰混為一談。', fix: '三者在臺灣長期<b>互相融合</b>，很多廟同時有不同神明，但它們<b>來源不同</b>。課本會分開介紹。', src: 'Cb-Ⅲ-2' },
      { bad: '以為基督宗教是近代才傳到臺灣的。', fix: '<b>1624 年荷西時期</b>就傳過一次，隨政權結束而中斷；<b>1865 馬雅各（南部）</b>、<b>1872 馬偕（北部）</b>才是延續至今的那一次。' },
      { bad: '把馬偕和馬雅各弄反。', fix: '<b>馬偕在北部（淡水）</b>，<b>馬雅各在南部（臺南）</b>。記法：「偕」在北。' },
      { bad: '以為文化差異是「誰比較好」的問題。', fix: '文化來自<b>不同的環境與生活方式</b>，沒有高下。課綱 Aa-Ⅲ-2 講的是理解與尊重，不是比較。', src: 'Aa-Ⅲ-2' },
      { bad: '以為「臺灣文化」只有一種。', fix: '原住民族、閩南、客家、戰後移入的各省族群、新住民都在其中。<b>多元</b>本身就是臺灣文化的特色。', src: 'Bc-Ⅲ-1' }
    ],

    quizCount: 5,

    quiz: function () {
      const type = pick(['rel', 'rel', 'relWho', 'group', 'groupWhy', 'world', 'respect']);

      if (type === 'rel') {
        const r = pick(RELIGION);
        const o = pick4(r.n, RELIGION.filter(function (x) { return x.n !== r.n; }).map(function (x) { return x.n; }));
        return {
          tpl: 'rel',
          q: '「由' + r.w + '傳入，' + r.d + '」<br>說的是哪一個宗教？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + r.n + '</b>（' + r.t + '）：由' + r.w + '傳入。<br>' + r.d + '　例如：' + r.ex + '。<br>' +
            '記法：<b>漢人移民</b>帶來佛道與民間信仰，<b>西方傳教士</b>帶來基督宗教，時間差了兩百多年。'
        };
      }

      if (type === 'relWho') {
        const items = [
          { n: '馬偕', ok: '在北部的淡水傳教、行醫、辦學校' },
          { n: '馬雅各', ok: '在南部一邊行醫一邊傳教，帶來西式醫療' }
        ];
        const it = pick(items);
        const o = pick4(it.ok, items.filter(function (x) { return x.n !== it.n; }).map(function (x) { return x.ok; })
          .concat(['在臺灣設立總督府進行統治', '設計嘉南大圳與烏山頭水庫']));
        return {
          tpl: 'relWho',
          q: '<b>' + it.n + '</b>在臺灣做了什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + it.n + '</b>：' + it.ok + '。<br>' +
            '兩個人要分清楚：<b>馬偕在北部（1872，淡水）</b>，<b>馬雅各在南部（1865）</b>。<br>' +
            '記法：「偕」在北。兩人都是一邊行醫一邊傳教。'
        };
      }

      if (type === 'group') {
        const g = pick(GROUPS);
        const o = pick4(g.cul, GROUPS.filter(function (x) { return x.g !== g.g; }).map(function (x) { return x.cul; }));
        return {
          tpl: 'group',
          q: '<b>' + g.g + '</b>住在' + g.env + '，靠' + g.life.split('；')[0] + '生活。<br>發展出下面哪一組文化特色？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + g.g + '</b>：' + g.env + ' → ' + g.life + ' → ' + g.cul + '<br>' +
            '順序永遠是<b>環境 → 生活方式 → 文化</b>。<br>' +
            '答不出來時，先想「住在那裡的人每天要做什麼」，文化就是從那裡長出來的。'
        };
      }

      if (type === 'groupWhy') {
        const cases = [
          { q: '原住民族為什麼有小米祭典？', ok: '因為小米是他們的傳統主食與祭典作物' },
          { q: '客家人為什麼多分布在丘陵與臺地？', ok: '因為來得較晚，平原已被開墾，只能往坡地發展' },
          { q: '達悟族為什麼有飛魚文化？', ok: '因為住在四面環海的蘭嶼，飛魚是重要的漁獲' },
          { q: '眷村為什麼有很多麵食？', ok: '因為戰後移入的族群把家鄉的飲食習慣帶了過來' }
        ];
        const c = pick(cases);
        const o = pick4(c.ok, cases.filter(function (x) { return x.q !== c.q; }).map(function (x) { return x.ok; }));
        return {
          tpl: 'groupWhy',
          q: c.q,
          choices: o.choices, answer: o.answer,
          steps: c.ok + '。<br>' +
            '文化特色都有它的<b>背景因素</b>：住在哪裡、靠什麼生活、從哪裡來。<br>' +
            '這就是課綱 Bc-Ⅲ-1 說的「各有其產生的背景因素」。'
        };
      }

      if (type === 'respect') {
        const o = shuffled([
          { t: '先問「為什麼他們會這樣做」，找出背後的環境與生活背景', ok: true },
          { t: '直接說那是奇怪或落後的習慣' },
          { t: '用自己的習慣當標準，不一樣就是錯的' },
          { t: '不用理解，反正跟我沒關係' }
        ]);
        return {
          tpl: 'respect',
          q: '遇到自己不熟悉的文化，比較好的態度是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '先問<b>「為什麼會這樣」</b>，通常都找得到理由：環境、生活方式、歷史。<br>' +
            '文化沒有高下，只有<b>不同的背景</b>。<br>' +
            '這就是課綱 Aa-Ⅲ-2 說的規範與行為要放回它的脈絡來理解。'
        };
      }

      // world：讀文化的步驟
      const steps = ['先看環境', '再看生活方式', '然後看信仰與規矩', '最後才下判斷'];
      const o = shuffled([
        { t: steps.join(' → '), ok: true },
        { t: '先下判斷 → 再看環境 → 然後看生活方式' },
        { t: '先看信仰 → 再下判斷 → 最後看環境' },
        { t: '只看信仰就夠了' }
      ]);
      return {
        tpl: 'world',
        q: '要理解一個陌生的文化，比較好的<b>順序</b>是什麼？',
        choices: o.choices, answer: o.answer,
        steps: '正確順序：<b>' + steps.join(' → ') + '</b>。<br>' +
          '環境決定了最初的可能，生活方式從環境長出來，信仰與規矩又從生活方式長出來。<br>' +
          '先下判斷是最容易出錯的一步，所以要放到最後。'
      };
    }
  });

})();
