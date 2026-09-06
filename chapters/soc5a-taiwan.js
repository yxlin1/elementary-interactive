/* ============================================================
   教具 soc5a-u1 臺灣的位置與先民足跡　soc5a-u2 臺灣登上國際舞臺
        soc5a-u3 成為清帝國的領土　　　soc5a-u4 土地的利用與變遷
   翰林 115：五上 第 1～4 單元
   課綱 Ab-Ⅲ-1・Ab-Ⅲ-3・Cb-Ⅲ-2 / Af-Ⅲ-2・Cb-Ⅲ-1 / Cc-Ⅲ-2 / Ca-Ⅲ-1・Ca-Ⅲ-2・Bc-Ⅲ-1

   四個單元共用同一張臺灣底圖（下面的 TW），所以位置、季風、航線、
   開墾、沿海利用畫出來都對得起來，孩子看到的是同一個臺灣。
   ⚠️ 底圖是<b>簡化示意圖</b>，只求相對位置正確，不是測量用地圖。
   ============================================================ */

(function () {

  const FONT = '13px "Microsoft JhengHei", sans-serif';
  const C = {
    bg: '#0e1726', sea: '#122238', land: '#1e3050', landLine: '#4a6ea8',
    text: '#e8eefc', muted: '#93a3c4', accent: '#4da3ff', purple: '#7c5cff',
    ok: '#34d399', no: '#fb7185', warn: '#fbbf24', soc: '#fb923c'
  };

  /* ---------- 共用：臺灣底圖 ----------
     經緯度 → 畫布座標。緯度 1 度的長度固定，經度 1 度在北緯 23.5 度
     大約只有緯度的 0.92 倍，兩個方向用不同比例，形狀才不會被拉寬。 */
  const TW = (function () {
    const LON0 = 119.35, LAT1 = 25.50;
    const SY = 112, SX = 112 * 0.92;
    const MX = 30, MY = 16;
    function xy(lon, lat) { return [MX + (lon - LON0) * SX, MY + (LAT1 - lat) * SY]; }

    /* 本島輪廓（順時針，自富貴角起）。30 多個點，夠孩子認出形狀。 */
    const OUTLINE = [
      [121.54, 25.30], [121.86, 25.13], [122.00, 25.01], [121.90, 24.70],
      [121.86, 24.60], [121.80, 24.35], [121.63, 24.00], [121.50, 23.60],
      [121.42, 23.35], [121.38, 23.10], [121.20, 22.85], [121.15, 22.75],
      [120.95, 22.30], [120.88, 22.05], [120.85, 21.90], [120.72, 22.00],
      [120.60, 22.35], [120.45, 22.47], [120.27, 22.62], [120.18, 22.85],
      [120.05, 23.15], [120.13, 23.38], [120.15, 23.70], [120.30, 23.90],
      [120.42, 24.05], [120.52, 24.25], [120.68, 24.49], [120.85, 24.68],
      [120.92, 24.83], [121.10, 25.00], [121.24, 25.12], [121.42, 25.18]
    ];
    /* 中央山脈概略稜線，用來畫「山」的位置 */
    const RIDGE = [
      [121.60, 24.90], [121.50, 24.55], [121.30, 24.30], [121.10, 24.00],
      [121.00, 23.60], [120.95, 23.30], [120.90, 23.00], [120.85, 22.70], [120.82, 22.35]
    ];

    function island(ctx, fill, stroke) {
      ctx.beginPath();
      OUTLINE.forEach((p, i) => { const q = xy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    function clipIsland(ctx) {
      ctx.beginPath();
      OUTLINE.forEach((p, i) => { const q = xy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.closePath(); ctx.clip();
    }
    function mountains(ctx, color) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      RIDGE.forEach((p, i) => { const q = xy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.stroke(); ctx.restore();
    }
    function islet(ctx, lon, lat, r, fill, stroke) {
      const q = xy(lon, lat);
      ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    /* side: 'l' 標籤在左、'r' 在右 */
    function dot(ctx, lon, lat, color, label, side, r) {
      const q = xy(lon, lat);
      ctx.beginPath(); ctx.arc(q[0], q[1], r || 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      if (label) {
        ctx.font = FONT; ctx.fillStyle = color;
        ctx.textAlign = side === 'l' ? 'right' : 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, q[0] + (side === 'l' ? -8 : 8), q[1]);
      }
    }
    function label(ctx, lon, lat, text, color, align, font) {
      const q = xy(lon, lat);
      ctx.font = font || FONT; ctx.fillStyle = color;
      ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, q[0], q[1]);
    }
    function arrow(ctx, x1, y1, x2, y2, color, w) {
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w || 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
      ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    /* 右側說明欄：回傳一個會自己往下排的寫字函式 */
    function panel(ctx, x, y, w) {
      let cy = y;
      return function (text, color, size, gap) {
        // 說明文字和 readout 共用同一批字串，那邊要 <b>，畫布上不能出現標籤
        text = String(text).replace(/<[^>]+>/g, '');
        ctx.font = (size || 13) + 'px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = color || C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        const lines = [];
        let cur = '';
        for (const ch of text) {
          if (ch === '\n') { lines.push(cur); cur = ''; continue; }
          if (ctx.measureText(cur + ch).width > w) { lines.push(cur); cur = ch; }
          else cur += ch;
        }
        if (cur) lines.push(cur);
        lines.forEach(l => { ctx.fillText(l, x, cy); cy += (size || 13) + 5; });
        cy += (gap === undefined ? 6 : gap);
        return cy;
      };
    }
    return {
      xy: xy, island: island, clipIsland: clipIsland, mountains: mountains,
      islet: islet, dot: dot, label: label, arrow: arrow, panel: panel,
      OUTLINE: OUTLINE
    };
  })();

  /* 五下的社會教具要畫同一個臺灣（鐵路、港口、水圳、族群分布），
     底圖只做一份，掛到 window 給 soc5b 共用。index.html 的載入順序
     已經是 soc5a 在 soc5b 前面。 */
  if (typeof window !== 'undefined') window.TW_BASEMAP = TW;

  /* 常用地點（經度, 緯度） */
  const P = {
    臺北: [121.56, 25.04], 基隆: [121.74, 25.13], 淡水: [121.44, 25.17],
    新竹: [120.97, 24.80], 臺中: [120.68, 24.15], 嘉義: [120.45, 23.48],
    臺南: [120.16, 23.00], 高雄: [120.30, 22.62], 屏東: [120.49, 22.67],
    花蓮: [121.60, 23.98], 臺東: [121.14, 22.76], 宜蘭: [121.75, 24.75],
    澎湖: [119.57, 23.57], 蘭嶼: [121.53, 22.04], 綠島: [121.49, 22.66],
    七股: [120.05, 23.15], 布袋: [120.13, 23.38], 長濱: [121.45, 23.32],
    圓山: [121.53, 25.07], 十三行: [121.41, 25.17], 麥寮: [120.25, 23.75]
  };
  const pt = (name, ctx, color, label, side, r) => TW.dot(ctx, P[name][0], P[name][1], color, label, side, r);

  /* ---------- 出題小工具 ---------- */
  function shuffled(items) {
    const sh = Kit.shuffle(items);
    return { choices: sh.map(o => o.t), answer: sh.findIndex(o => o.ok) };
  }
  /* 一個正解 + 三個干擾，干擾依字面去重 */
  function pick4(right, wrongs) {
    const seen = { [right]: 1 }, out = [];
    Kit.shuffle(wrongs).forEach(w => { if (!seen[w] && out.length < 3) { seen[w] = 1; out.push(w); } });
    return shuffled([{ t: right, ok: true }].concat(out.map(t => ({ t: t }))));
  }

  /* 畫底圖：海、島、山、離島。各單元都從這裡開始畫。 */
  function base(cv, opts) {
    opts = opts || {};
    const ctx = cv.ctx;
    cv.clear(C.bg);
    ctx.fillStyle = C.sea; ctx.fillRect(0, 0, 320, cv.H);
    TW.island(ctx, opts.land || C.land, '#4a6ea8');
    if (opts.mountains !== false) TW.mountains(ctx, opts.mtColor || '#31507e');
    TW.islet(ctx, P.澎湖[0], P.澎湖[1], 5, opts.land || C.land, '#4a6ea8');
    TW.islet(ctx, P.蘭嶼[0], P.蘭嶼[1], 3.5, opts.land || C.land, '#4a6ea8');
    TW.islet(ctx, P.綠島[0], P.綠島[1], 3, opts.land || C.land, '#4a6ea8');
    return ctx;
  }


  /* ============================================================
     第 1 單元　臺灣的位置與先民足跡
     Ab-Ⅲ-1「臺灣的地理位置、自然環境，與歷史文化的發展有關聯性。」
     Ab-Ⅲ-3「自然環境、自然災害及經濟活動，和生活空間的使用有關聯性。」
     Cb-Ⅲ-2「臺灣史前文化、原住民族文化…都在臺灣留下有形與無形的文化資產。」
     對應課本三課：從地圖探索位置／史前人們如何生活／原住民族與環境
     ============================================================ */
  Kit.register('soc5a-u1', {

    intro: '臺灣在哪裡，決定了這裡會發生什麼事。切換三個模式：<b>位置</b>看經緯度和海陸關係，<b>季風</b>看風向怎麼隨季節換邊，<b>先民</b>看最早的人住在哪裡。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'pos', month = 1, showTropic = true;

      function paintPos() {
        const ctx = base(cv);
        /* 經緯格線 */
        ctx.save(); ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        for (let lat = 22; lat <= 25; lat++) {
          const a = TW.xy(119.35, lat), b = TW.xy(122.2, lat);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          ctx.setLineDash([]); ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText('北緯 ' + lat + '°', 4, a[1] - 2);
          ctx.setLineDash([3, 4]);
        }
        for (let lon = 120; lon <= 122; lon++) {
          const a = TW.xy(lon, 25.5), b = TW.xy(lon, 21.7);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          ctx.setLineDash([]); ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('東經 ' + lon + '°', a[0], 2);
          ctx.setLineDash([3, 4]);
        }
        ctx.restore();

        if (showTropic) {
          const a = TW.xy(119.35, 23.5), b = TW.xy(122.2, 23.5);
          ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          ctx.fillStyle = C.warn; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText('北回歸線 23.5°N', 6, a[1] + 6);
          ctx.restore();
          pt('嘉義', ctx, C.warn, '嘉義', 'l');
          // 標在線真正通過的位置（花蓮縣南段），不要標在花蓮市——那在線的北邊
          TW.dot(ctx, 121.30, 23.50, C.warn, '花蓮', 'r');
          TW.dot(ctx, P.澎湖[0], P.澎湖[1], C.warn, '', 'r', 5);
        }

        /* 海域名稱 */
        TW.label(ctx, 119.92, 24.62, '臺灣海峽', C.accent, 'center');
        TW.label(ctx, 120.95, 21.80, '巴士海峽', C.accent, 'center');
        // 太平洋直排，避開島身
        ctx.font = FONT; ctx.fillStyle = C.accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const tp = TW.xy(121.98, 23.65);
        '太平洋'.split('').forEach(function (ch, i) { ctx.fillText(ch, tp[0], tp[1] + i * 17); });
        const cp = TW.xy(119.55, 22.60);
        ctx.fillStyle = C.muted; ctx.textAlign = 'center';
        ctx.fillText('中國', cp[0], cp[1]); ctx.fillText('大陸', cp[0], cp[1] + 17);

        TW.label(ctx, P.澎湖[0], 23.86, '澎湖', C.text, 'center');
        TW.label(ctx, 121.62, 22.04, '蘭嶼', C.text, 'left');

        const w = TW.panel(ctx, 336, 26, 268);
        let y = w('臺灣的位置', C.soc, 17, 10);
        y = w('經緯度：約東經 120°～122°、北緯 22°～25°。', C.text);
        y = w('北回歸線（北緯 23.5 度）從中間穿過，通過嘉義、花蓮和澎湖。線以南是熱帶，以北是副熱帶——同一個島有兩種氣候。', C.warn);
        y = w('海陸位置：西邊隔臺灣海峽面對中國大陸，東邊直接面向太平洋，北邊接東海、南邊是巴士海峽。', C.text);
        y = w('四面環海，又剛好在東亞南北航線的中間，所以自古就是船隻停靠與交換貨物的地方。', C.accent);
        y = w('👉 位置不只是「在哪裡」，它會決定氣候、決定誰會來、決定做什麼生意。', C.ok);

        readout.innerHTML =
          '<div class="big">臺灣位在<b>北緯 22°～25°</b>、<b>東經 120°～122°</b>，<b>北回歸線</b>從中間通過。</div>' +
          '西邊是<b>臺灣海峽</b>（隔著它是中國大陸），東邊是<b>太平洋</b>，南邊是<b>巴士海峽</b>。<br>' +
          '北回歸線通過<b>嘉義、花蓮、澎湖</b>：線以南屬熱帶，線以北屬副熱帶。<br>' +
          '<span style="color:var(--muted)">因為四面環海又位在東亞航線中段，臺灣很早就被外面的世界注意到——' +
          '這就是第二單元「登上國際舞臺」的起點。</span>';
      }

      function paintWind() {
        const ctx = base(cv);
        const winter = month >= 11 || month <= 3;
        const summer = month >= 5 && month <= 9;
        const name = winter ? '東北季風' : summer ? '西南季風' : '換季（季風轉換期）';
        const col = winter ? C.accent : summer ? C.ok : C.muted;

        /* 風向箭頭 */
        if (winter || summer) {
          for (let i = 0; i < 5; i++) {
            const t = i / 4;
            if (winter) {
              const x1 = 250 + t * 40, y1 = 20 + t * 40;
              TW.arrow(ctx, x1 + 46, y1 - 6, x1 - 34, y1 + 78, col, 2.5);
            } else {
              const x1 = 70 + t * 30, y1 = 400 - t * 40;
              TW.arrow(ctx, x1 - 30, y1 + 50, x1 + 60, y1 - 40, col, 2.5);
            }
          }
        }

        /* 迎風面上色 */
        ctx.save(); TW.clipIsland(ctx);
        ctx.globalAlpha = 0.32; ctx.fillStyle = col;
        if (winter) ctx.fillRect(200, 0, 130, 250);        // 東北部
        else if (summer) ctx.fillRect(60, 200, 140, 240);  // 西南部
        ctx.restore();

        if (winter || summer) {
          const lp = TW.xy(winter ? 121.80 : 120.30, winter ? 24.95 : 22.95);
          ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = C.warn;
          ctx.textAlign = 'center';
          ctx.fillText('迎風面', lp[0], lp[1]); ctx.fillText('雨較多', lp[0], lp[1] + 16);
        }
        pt('基隆', ctx, C.text, '基隆', 'r', 3);
        pt('高雄', ctx, C.text, '高雄', 'l', 3);
        TW.mountains(ctx, '#31507e');

        const w = TW.panel(ctx, 336, 26, 268);
        let y = w((month) + ' 月：' + name, col, 17, 10);
        if (winter) {
          y = w('冬天（約 11 月～隔年 3 月）吹<b>東北季風</b>，風從東北方的海面吹過來。', C.text);
          y = w('迎風面在<b>東北部</b>（基隆、宜蘭），雨特別多，基隆因此被叫做「雨港」。', C.accent);
          y = w('中央山脈把水氣擋住，<b>西南部</b>反而是乾季，很少下雨。', C.muted);
        } else if (summer) {
          y = w('夏天（約 5 月～9 月）吹<b>西南季風</b>，風從西南方的海面吹過來。', C.text);
          y = w('迎風面換到<b>西南部</b>，加上梅雨和颱風，雨量集中在這幾個月。', C.ok);
          y = w('這時東北部反而進入相對少雨的時候。', C.muted);
        } else {
          y = w('4 月和 10 月是<b>季風轉換</b>的時候，風向不穩定。', C.text);
          y = w('把滑桿拉到 1 月看東北季風，拉到 7 月看西南季風。', C.muted);
        }
        y = w('為什麼會換邊？因為<b>中央山脈</b>像一道牆：風先碰到的那一側被迫抬升、變冷、下雨，翻過山之後就變乾了。', C.warn);
        y = w('👉 同一個臺灣，雨季在南部和北部<b>不在同一個季節</b>，農作和曬鹽的時間因此完全不同。', C.ok);

        readout.innerHTML =
          '<div class="big">' + month + ' 月吹<b>' + name + '</b></div>' +
          (winter
            ? '冬季東北季風 → 迎風面是<b>東北部</b>（基隆、宜蘭多雨），西南部乾季。'
            : summer
              ? '夏季西南季風 → 迎風面是<b>西南部</b>（雨量集中），東北部相對少雨。'
              : '4、10 月是季風轉換期，風向不穩定。') + '<br>' +
          '關鍵是<b>中央山脈</b>擋住水氣：迎風面下雨，背風面變乾。<br>' +
          '<span style="color:var(--muted)">記法：季風的名字是<b>風從哪裡來</b>。「東北季風」＝風從東北方來，' +
          '所以東北部先碰到、先下雨。</span>';
      }

      function paintAncient() {
        const ctx = base(cv, { mtColor: '#2b4770' });
        // 圓山和十三行只差十幾公里，標籤要錯開，不然會疊在一起也會壓到右邊說明欄
        TW.dot(ctx, P.十三行[0], P.十三行[1], C.ok, '十三行（金屬器）', 'l');
        TW.dot(ctx, P.圓山[0], P.圓山[1], C.warn, '', 'r');
        TW.label(ctx, P.圓山[0], 24.88, '圓山（新石器）', C.warn, 'center');
        TW.dot(ctx, P.長濱[0], P.長濱[1], C.no, '長濱（舊石器）', 'l');
        TW.dot(ctx, P.蘭嶼[0], P.蘭嶼[1], C.purple, '蘭嶼・達悟族', 'l', 4);
        TW.dot(ctx, 121.45, 23.60, C.accent, '花東・阿美族', 'l', 4);

        const w = TW.panel(ctx, 336, 22, 268);
        let y = w('先民與原住民族', C.soc, 17, 10);
        y = w('史前三個時期，都靠「就地取材」過日子：', C.text, 13, 4);
        y = w('● 舊石器｜長濱文化：打製石器，靠採集和漁獵，住在海邊洞穴。', C.no, 13, 3);
        y = w('● 新石器｜圓山文化：磨製石器、會做陶器，開始種植，留下大量貝殼堆。', C.warn, 13, 3);
        y = w('● 金屬器｜十三行文化：會煉鐵，和外地交換物品。', C.ok);
        y = w('原住民族的生活方式，也跟住的環境緊緊相關：', C.text, 13, 4);
        y = w('● 蘭嶼的達悟族靠海，發展出飛魚文化和拼板舟。', C.purple, 13, 3);
        y = w('● 花東的阿美族住在平原與海邊，兼有農耕和捕魚。', C.accent);
        y = w('👉 同樣是臺灣，住海邊、住山上、住平原，吃的用的就不一樣——這叫「文化與環境的關聯」。', C.ok);

        readout.innerHTML =
          '<div class="big">史前三時期：<b>舊石器</b>（長濱）→ <b>新石器</b>（圓山）→ <b>金屬器</b>（十三行）</div>' +
          '判斷順序的關鍵是<b>工具</b>：打製石器 → 磨製石器加陶器 → 會煉鐵。<br>' +
          '原住民族文化和環境有關：蘭嶼<b>達悟族</b>靠海（飛魚、拼板舟），花東<b>阿美族</b>在平原與沿海（農耕加捕魚）。<br>' +
          '<span style="color:var(--muted)">這些史前文化和原住民族文化，都是課綱說的「留在臺灣的文化資產」。</span>';
      }

      function paint() {
        if (mode === 'pos') paintPos();
        else if (mode === 'wind') paintWind();
        else paintAncient();
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '① 位置', value: 'pos' },
        { label: '② 季風', value: 'wind' },
        { label: '③ 先民與原住民', value: 'anc' }
      ], function (v) {
        mode = v;
        monthCtl.wrap.style.display = v === 'wind' ? '' : 'none';
        tropicBtn.style.display = v === 'pos' ? '' : 'none';
        paint();
      }, mode);

      const monthCtl = Kit.slider('月份', {
        min: 1, max: 12, value: month, format: v => v + ' 月',
        onChange: v => { month = v; paint(); }
      });
      monthCtl.wrap.style.display = 'none';

      const tropicBtn = Kit.button('北回歸線 開／關', function () { showTropic = !showTropic; paint(); });

      controls.appendChild(modeSeg.wrap);
      controls.appendChild(monthCtl.wrap);
      controls.appendChild(tropicBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '地圖是<b>簡化示意圖</b>，只求相對位置正確（哪個在北、哪個在西南），不是測量用地圖。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「北回歸線通過臺灣哪些地方？」', why: '嘉義、花蓮、澎湖。這是課本一定考的，而且它解釋了為什麼南部比北部熱。點開「北回歸線 開／關」讓他自己看線在哪。' },
      { ask: '「臺灣的東邊是什麼海？西邊呢？」', why: '東邊太平洋、西邊臺灣海峽。方向感是社會科的基礎，先把東西南北和海名綁在一起。' },
      { ask: '「冬天吹什麼風？那時候哪裡雨最多？」', why: '東北季風，東北部（基隆、宜蘭）多雨。把滑桿拉到 1 月和 7 月各看一次，比背課文有效。' },
      { ask: '「季風的名字，講的是風吹去哪裡，還是風從哪裡來？」', why: '<b>從哪裡來</b>。這一點講清楚，後面所有季風題都不會錯。' },
      { ask: '「如果臺灣沒有中央山脈，南北的雨量還會差這麼多嗎？」', why: '不會。山脈擋水氣造成迎風面／背風面，是「自然環境影響生活」最好的例子。' },
      { ask: '「史前三個時期怎麼分？」', why: '看工具：打製石器（舊石器）→ 磨製石器＋陶器（新石器）→ 鐵器（金屬器）。不用背年代，記工具就好。' },
      { ask: '「達悟族為什麼有飛魚文化，住在山上的族群就沒有？」', why: '因為住在蘭嶼、四面是海。這題直接對到課綱說的「文化特色各有其產生的背景因素」。' }
    ],

    pitfalls: [
      { bad: '以為北回歸線通過臺北或臺中。', fix: '北回歸線是<b>北緯 23.5 度</b>，通過<b>嘉義、花蓮、澎湖</b>。臺北在北緯 25 度左右，差得很遠。', src: 'Ab-Ⅲ-1' },
      { bad: '把「東北季風」理解成「風往東北方吹」。', fix: '季風以<b>來源方向</b>命名。東北季風是<b>從東北方吹過來</b>，所以東北部先迎到風、雨最多。' },
      { bad: '以為臺灣一年四季雨量平均，或全島同時是雨季。', fix: '冬天東北部多雨、夏天西南部多雨，<b>南北的雨季不在同一季</b>。這也是為什麼曬鹽都在西南部的冬天。', src: 'Ab-Ⅲ-3' },
      { bad: '以為臺灣西邊是太平洋。', fix: '<b>東邊</b>才是太平洋，西邊是<b>臺灣海峽</b>。看地圖時把「東」和「太平洋」一起記。' },
      { bad: '把史前文化和原住民族當成同一件事。', fix: '史前文化是<b>考古挖出來的遺址</b>（長濱、圓山、十三行），原住民族是<b>現在還生活在臺灣的人</b>。兩者都是臺灣的文化資產，但不能畫上等號。', src: 'Cb-Ⅲ-2' },
      { bad: '以為所有原住民族的生活方式都一樣。', fix: '住海邊的（蘭嶼達悟族）以海洋和飛魚為中心，住平原的（阿美族）兼有農耕與捕魚。<b>環境不同，文化就不同。</b>' }
    ],

    quizCount: 5,
    quiz: function () {
      const type = Kit.pick(['tropic', 'sea', 'wind', 'wind', 'windName', 'rain', 'prehistory', 'prehistoryOrder',
        'indigenous', 'latlon', 'mountain', 'position']);

      if (type === 'tropic') {
        const o = pick4('嘉義', ['臺北', '臺中', '高雄', '新竹', '基隆']);
        return {
          q: '<b>北回歸線</b>通過臺灣本島的哪一個地方？',
          choices: o.choices, answer: o.answer,
          steps: '北回歸線是<b>北緯 23.5 度</b>，通過本島的<b>嘉義</b>和<b>花蓮</b>，海上通過<b>澎湖</b>。<br>' +
            '臺北約在北緯 25 度、高雄約在北緯 22.6 度，都不在這條線上。<br>' +
            '看上面「位置」模式，黃色那條線就是北回歸線。'
        };
      }

      if (type === 'sea') {
        const dirs = [
          { d: '東', a: '太平洋', w: ['臺灣海峽', '巴士海峽', '東海'] },
          { d: '西', a: '臺灣海峽', w: ['太平洋', '巴士海峽', '南海'] },
          { d: '南', a: '巴士海峽', w: ['臺灣海峽', '太平洋', '東海'] }
        ];
        const c = Kit.pick(dirs);
        const o = pick4(c.a, c.w);
        return {
          q: '臺灣的<b>' + c.d + '邊</b>是哪一片海？',
          choices: o.choices, answer: o.answer,
          steps: '東邊<b>太平洋</b>、西邊<b>臺灣海峽</b>（隔著它是中國大陸）、南邊<b>巴士海峽</b>（隔著它是菲律賓）。<br>' +
            '所以' + c.d + '邊是<b>' + c.a + '</b>。看上面「位置」模式的海域標示。'
        };
      }

      if (type === 'wind') {
        const winter = Math.random() < .5;
        const m = winter ? Kit.pick([11, 12, 1, 2, 3]) : Kit.pick([5, 6, 7, 8, 9]);
        const o = pick4(winter ? '東北季風' : '西南季風',
          [winter ? '西南季風' : '東北季風', '東南季風', '西北季風']);
        return {
          q: '臺灣在 <b>' + m + ' 月</b>主要吹哪一種季風？',
          choices: o.choices, answer: o.answer,
          steps: (winter ? '冬天（約 11 月～隔年 3 月）吹<b>東北季風</b>。' : '夏天（約 5 月～9 月）吹<b>西南季風</b>。') + '<br>' +
            '把上面「季風」模式的滑桿拉到 ' + m + ' 月就看得到風向箭頭。<br>' +
            '<span style="color:var(--muted)">記法：冬天冷風從東北方的海上來，夏天暖溼空氣從西南方來。</span>'
        };
      }

      if (type === 'windName') {
        const o = shuffled([
          { t: '風從東北方吹過來', ok: true },
          { t: '風往東北方吹過去' },
          { t: '東北部才會吹的風' },
          { t: '只在東北部形成的風' }
        ]);
        return {
          q: '「<b>東北季風</b>」這個名字，指的是什麼意思？',
          choices: o.choices, answer: o.answer,
          steps: '季風用<b>來源方向</b>命名：東北季風就是<b>風從東北方吹過來</b>。<br>' +
            '所以臺灣的<b>東北部</b>（基隆、宜蘭）會先迎到風，雨也最多。<br>' +
            '同理，西南季風是從西南方吹來，迎風面換成西南部。'
        };
      }

      if (type === 'rain') {
        const winter = Math.random() < .5;
        const o = pick4(winter ? '東北部（基隆、宜蘭）' : '西南部',
          [winter ? '西南部' : '東北部（基隆、宜蘭）', '中央山脈以東的花蓮', '全臺灣雨量一樣多']);
        return {
          q: '<b>' + (winter ? '冬天吹東北季風' : '夏天吹西南季風') + '</b>的時候，臺灣哪一區雨量最多？',
          choices: o.choices, answer: o.answer,
          steps: '風先碰到的那一側叫<b>迎風面</b>，水氣被山抬升就會下雨。<br>' +
            (winter
              ? '東北季風從東北來 → 迎風面是<b>東北部</b>，基隆因此有「雨港」之稱；西南部這時是乾季。'
              : '西南季風從西南來 → 迎風面換到<b>西南部</b>，加上梅雨和颱風，雨量集中；東北部相對少雨。') + '<br>' +
            '關鍵是<b>中央山脈</b>擋住水氣，翻過山就變乾。'
        };
      }

      if (type === 'prehistory') {
        const items = [
          { site: '長濱文化', era: '舊石器時代', tool: '打製石器', extra: '靠採集、漁獵維生，住海邊洞穴' },
          { site: '圓山文化', era: '新石器時代', tool: '磨製石器和陶器', extra: '開始種植，留下大量貝殼堆' },
          { site: '十三行文化', era: '金屬器時代', tool: '鐵器', extra: '會煉鐵，和外地交換物品' }
        ];
        const it = Kit.pick(items);
        const ask = Math.random() < .5;
        if (ask) {
          const o = pick4(it.era, items.filter(x => x !== it).map(x => x.era).concat(['日治時代']));
          return {
            q: '<b>' + it.site + '</b>屬於哪一個時期？',
            choices: o.choices, answer: o.answer,
            steps: it.site + ' 屬於<b>' + it.era + '</b>，代表工具是<b>' + it.tool + '</b>（' + it.extra + '）。<br>' +
              '三個時期的順序：舊石器（長濱）→ 新石器（圓山）→ 金屬器（十三行）。'
          };
        }
        const o = pick4(it.tool, items.filter(x => x !== it).map(x => x.tool).concat(['塑膠器具']));
        return {
          q: '<b>' + it.era + '</b>的人，代表性的工具是什麼？',
          choices: o.choices, answer: o.answer,
          steps: it.era + ' 的代表是<b>' + it.tool + '</b>，臺灣的代表遺址是<b>' + it.site + '</b>。<br>' +
            '判斷史前時期最快的方法就是<b>看工具</b>：打製石器 → 磨製石器加陶器 → 鐵器。'
        };
      }

      if (type === 'prehistoryOrder') {
        const o = shuffled([
          { t: '長濱 → 圓山 → 十三行', ok: true },
          { t: '十三行 → 圓山 → 長濱' },
          { t: '圓山 → 長濱 → 十三行' },
          { t: '十三行 → 長濱 → 圓山' }
        ]);
        return {
          q: '把三個史前文化<b>由早到晚</b>排，正確的是？',
          choices: o.choices, answer: o.answer,
          steps: '<b>長濱</b>（舊石器，打製石器）→ <b>圓山</b>（新石器，磨製石器與陶器）→ <b>十三行</b>（金屬器，會煉鐵）。<br>' +
            '工具越做越精細、越來越會用火，就是時間順序。'
        };
      }

      if (type === 'indigenous') {
        const cases = [
          { q: '住在<b>蘭嶼</b>、發展出飛魚文化和拼板舟的是哪一族？', a: '達悟族', w: ['阿美族', '泰雅族', '布農族'],
            why: '蘭嶼四面環海，達悟族的生活以海洋為中心，飛魚季和拼板舟都是從這個環境長出來的文化。' },
          { q: '達悟族的<b>飛魚文化</b>，最主要是受到什麼影響？', a: '住在四面環海的島上', w: ['住在高山上', '住在盆地裡', '受日本人影響'],
            why: '文化特色來自環境。住在海島 → 靠海維生 → 才會有飛魚季與拼板舟。' },
          { q: '課綱說「族群的文化特色各有其產生的背景因素」，下面哪個說法最正確？', a: '住的環境不同，生活方式和文化就不同',
            w: ['所有原住民族的文化都一樣', '文化和住哪裡沒有關係', '只有漢人文化才算文化'],
            why: '靠海的族群發展海洋文化，住平原的以農耕為主，住山區的又不一樣。環境是文化的背景因素。' }
        ];
        const c = Kit.pick(cases);
        const o = pick4(c.a, c.w);
        return { q: c.q, choices: o.choices, answer: o.answer, steps: c.why };
      }

      if (type === 'latlon') {
        const o = pick4('北緯 22°～25°', ['北緯 30°～35°', '南緯 22°～25°', '北緯 10°～15°']);
        return {
          q: '臺灣本島大約位在什麼<b>緯度</b>範圍？',
          choices: o.choices, answer: o.answer,
          steps: '臺灣約在<b>北緯 22 度到 25 度</b>之間，經度約東經 120 度到 122 度。<br>' +
            '北回歸線（北緯 23.5 度）剛好從中間穿過，所以臺灣同時有熱帶和副熱帶。<br>' +
            '在北半球，所以是<b>北</b>緯，不是南緯。'
        };
      }

      if (type === 'mountain') {
        const o = shuffled([
          { t: '山脈擋住水氣，迎風面下雨、背風面變乾', ok: true },
          { t: '山脈把風完全擋掉，兩邊都不會下雨' },
          { t: '山脈讓全島雨量變得一樣多' },
          { t: '山脈和下雨沒有關係' }
        ]);
        return {
          q: '<b>中央山脈</b>對臺灣的降雨有什麼影響？',
          choices: o.choices, answer: o.answer,
          steps: '含水氣的風碰到山會被迫<b>抬升</b>，變冷之後水氣凝結就下雨，這一側叫<b>迎風面</b>。<br>' +
            '翻過山之後空氣已經把水分留在另一邊，所以<b>背風面</b>變乾。<br>' +
            '這就是為什麼冬天基隆一直下雨，同時間高雄卻是乾季。'
        };
      }

      // position：位置帶來的影響
      const o = shuffled([
        { t: '位在東亞南北航線的中間，很早就成為船隻停靠與貿易的地點', ok: true },
        { t: '因為離其他國家都很遠，所以沒有人來過' },
        { t: '因為沒有海岸，船進不來' },
        { t: '因為在南半球，所以季節相反' }
      ]);
      return {
        q: '臺灣的<b>地理位置</b>，對歷史發展造成什麼影響？',
        choices: o.choices, answer: o.answer,
        steps: '臺灣四面環海，又剛好在<b>東亞南北航線的中段</b>，往北到日本、往南到南洋、往西是中國大陸。<br>' +
          '所以大航海時代一到，荷蘭、西班牙都想搶這個位置（第二單元）。<br>' +
          '課綱 Ab-Ⅲ-1 講的就是這件事：<b>地理位置和歷史文化的發展有關聯性</b>。'
      };
    }
  });


  /* ============================================================
     第 2 單元　臺灣登上國際舞臺
     Af-Ⅲ-2「國際間因利益競爭而造成衝突、對立與結盟。」
     Cb-Ⅲ-1「不同時期臺灣、世界的重要事件與人物，影響臺灣的歷史變遷。」
     對應課本兩課：臺灣為什麼在大航海時代崛起／留下哪些影響
     ============================================================ */
  Kit.register('soc5a-u2', {

    intro: '大航海時代，歐洲人到東方做生意，臺灣剛好卡在航線中間。拖動<b>年代滑桿</b>，看荷蘭、西班牙、鄭成功先後在臺灣的哪個位置，以及誰把誰趕走。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let year = 1624, showRoute = true;

      /* 各年代的狀態 */
      function stateOf(y) {
        if (y < 1624) return { du: null, es: null, zh: false, key: '大航海時代開始，歐洲人往東方找香料與絲綢的航線。臺灣還沒有外來政權據點。' };
        if (y < 1626) return { du: '南', es: null, zh: false, key: '1624 年荷蘭人到<b>大員</b>（今臺南安平），建立<b>熱蘭遮城</b>，這是荷蘭統治臺灣的開始。' };
        if (y < 1642) return { du: '南', es: '北', zh: false, key: '1626 年西班牙人占領北部的<b>雞籠</b>（今基隆），1628 年又到<b>淡水</b>。臺灣同時有南北兩個外來政權。' };
        if (y < 1662) return { du: '全', es: null, zh: false, key: '1642 年荷蘭人把西班牙人趕出臺灣，<b>全島由荷蘭控制</b>。' };
        return { du: null, es: null, zh: true, key: '1662 年<b>鄭成功</b>攻下熱蘭遮城，荷蘭人退出臺灣，改由鄭氏統治。' };
      }

      function paint() {
        const st = stateOf(year);
        const ctx = base(cv, { mtColor: '#2b4770' });

        /* 航線 */
        if (showRoute) {
          ctx.save(); ctx.setLineDash([5, 5]); ctx.globalAlpha = 0.85;
          const jp = [305, 30], cn = [24, 150], sea = [120, 425];
          const tw = TW.xy(121.0, 23.6);
          TW.arrow(ctx, cn[0], cn[1], tw[0] - 34, tw[1] - 30, C.muted, 1.8);
          TW.arrow(ctx, tw[0] + 20, tw[1] - 40, jp[0], jp[1], C.muted, 1.8);
          TW.arrow(ctx, sea[0], sea[1], tw[0] - 30, tw[1] + 40, C.muted, 1.8);
          ctx.restore();
          ctx.font = '12px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = C.muted;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText('→ 日本', 262, 24);
          ctx.textAlign = 'left'; ctx.fillText('中國大陸', 6, 150);
          ctx.textAlign = 'center'; ctx.fillText('南洋', 108, 432);
        }

        /* 據點 */
        if (st.du === '南' || st.du === '全') {
          TW.dot(ctx, P.臺南[0], P.臺南[1], C.warn, '荷蘭・大員（熱蘭遮城）', 'l', 6);
        }
        if (st.du === '全') {
          TW.dot(ctx, P.基隆[0], P.基隆[1], C.warn, '荷蘭', 'r', 6);
        }
        if (st.es === '北') {
          TW.dot(ctx, P.基隆[0], P.基隆[1], C.no, '西班牙・雞籠', 'r', 6);
          if (year >= 1628) TW.dot(ctx, P.淡水[0], P.淡水[1], C.no, '西班牙・淡水', 'l', 5);
        }
        if (st.zh) {
          TW.dot(ctx, P.臺南[0], P.臺南[1], C.ok, '鄭氏・承天府', 'l', 6);
        }

        /* 年代軸 */
        const AX = 336, AW = 262, AY = 402;
        ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(AX, AY); ctx.lineTo(AX + AW, AY); ctx.stroke();
        const marks = [[1624, '1624\n荷蘭'], [1626, '1626\n西班牙'], [1642, '1642\n荷逐西'], [1662, '1662\n鄭成功']];
        ctx.font = '11px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
        marks.forEach(m => {
          const x = AX + (m[0] - 1600) / 100 * AW;
          const on = year >= m[0];
          ctx.fillStyle = on ? C.soc : '#3b4d70';
          ctx.beginPath(); ctx.arc(x, AY, 4, 0, Math.PI * 2); ctx.fill();
          ctx.textBaseline = 'top';
          m[1].split('\n').forEach((t, i) => ctx.fillText(t, x, AY + 8 + i * 13));
        });
        const cx = AX + (year - 1600) / 100 * AW;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, AY - 14); ctx.lineTo(cx, AY + 6); ctx.stroke();

        const w = TW.panel(ctx, AX, 22, AW);
        let y = w('西元 ' + year + ' 年', C.soc, 18, 8);
        const plain = st.key.replace(/<\/?b>/g, '');
        y = w(plain, C.text, 13, 10);
        y = w('為什麼大家都想要臺灣？', C.warn, 14, 4);
        y = w('因為臺灣卡在中國大陸、日本、南洋三邊航線的中間，誰拿到臺灣，誰就能控制轉運與貿易。', C.text, 13, 10);
        y = w('荷蘭在臺灣做的事：收稅、種甘蔗製糖、輸出鹿皮到日本，並引進漢人來開墾。', C.muted, 13, 6);
        y = w('👉 國家之間因為<b>利益競爭</b>而衝突、結盟，臺灣正好是那個被爭奪的位置。', C.ok, 13, 0);

        readout.innerHTML =
          '<div class="big">' + year + ' 年：' + st.key + '</div>' +
          '<b>四個關鍵年代</b>：1624 荷蘭到大員（南）／1626 西班牙到雞籠（北）／1642 荷蘭趕走西班牙／1662 鄭成功趕走荷蘭。<br>' +
          '記法：<b>荷蘭在南、西班牙在北</b>，最後荷蘭統一全島，再被鄭成功取代。<br>' +
          '<span style="color:var(--muted)">為什麼搶臺灣？因為它在東亞航線的中間。位置帶來利益，利益帶來競爭——' +
          '這就是課綱 Af-Ⅲ-2 說的「國際間因利益競爭而造成衝突、對立與結盟」。</span>';
      }

      const yearCtl = Kit.slider('年代', {
        min: 1600, max: 1700, value: year, format: v => v + ' 年',
        onChange: v => { year = v; paint(); }
      });
      const jump = Kit.segmented('跳到', [
        { label: '1624 荷蘭', value: 1624 }, { label: '1626 西班牙', value: 1626 },
        { label: '1642 荷逐西', value: 1642 }, { label: '1662 鄭成功', value: 1662 }
      ], function (v) { year = v; yearCtl.input.value = v; yearCtl.output.textContent = v + ' 年'; paint(); }, 1624);
      const routeBtn = Kit.button('航線 開／關', function () { showRoute = !showRoute; paint(); });

      controls.appendChild(yearCtl.wrap);
      controls.appendChild(jump.wrap);
      controls.appendChild(routeBtn);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '記住<b>方位</b>比記年代重要：荷蘭在<b>南</b>（大員／臺南），西班牙在<b>北</b>（雞籠／基隆）。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「荷蘭人先到臺灣的哪一邊？西班牙人呢？」', why: '荷蘭在南（大員／今臺南），西班牙在北（雞籠／今基隆）。南北分清楚，這一單元就過一半了。' },
      { ask: '「為什麼歐洲人千里迢迢跑來搶臺灣？」', why: '因為臺灣在東亞航線中間，是轉運站。把地圖上三條航線指給他看，比背「戰略地位重要」有用。' },
      { ask: '「1642 年發生什麼事？誰趕走誰？」', why: '荷蘭趕走西班牙，全島由荷蘭控制。這是「國際競爭」的直接例子。' },
      { ask: '「鄭成功是哪一年趕走荷蘭人的？」', why: '1662 年。可以順便問他鄭成功從哪裡打進來（大員／熱蘭遮城，就是荷蘭的老巢）。' },
      { ask: '「荷蘭人在臺灣做了哪些事？」', why: '收稅、種甘蔗製糖、輸出鹿皮，並引進漢人開墾。這連到第三單元的移民。' },
      { ask: '「如果臺灣不在航線上，歷史會不會不一樣？」', why: '開放題。目的是讓他把「位置」和「歷史」連起來，而不是當成兩個無關的單元。' }
    ],

    pitfalls: [
      { bad: '把荷蘭和西班牙的位置記反（以為荷蘭在北）。', fix: '<b>荷蘭在南</b>（大員，今臺南安平，熱蘭遮城）、<b>西班牙在北</b>（雞籠，今基隆）。上面地圖橘紅兩點看一次就記住。', src: 'Cb-Ⅲ-1' },
      { bad: '以為荷蘭和西班牙同時統治臺灣直到清朝。', fix: '1642 年<b>荷蘭把西班牙趕走</b>，之後只剩荷蘭；1662 年<b>鄭成功又趕走荷蘭</b>。三個階段要分開。' },
      { bad: '以為歐洲人來臺灣是為了傳教或觀光。', fix: '主因是<b>貿易利益</b>：臺灣是中國大陸、日本、南洋之間的轉運站。傳教是隨之而來的，不是主因。', src: 'Af-Ⅲ-2' },
      { bad: '把「大員」當成現在的臺中或臺東。', fix: '<b>大員</b>是今天的<b>臺南安平</b>一帶，荷蘭人的熱蘭遮城就在那裡。' },
      { bad: '以為鄭成功打敗的是清朝。', fix: '鄭成功 1662 年打敗的是<b>荷蘭人</b>。清帝國要到 1683 年才把臺灣納入版圖（第三單元）。' }
    ],

    quizCount: 5,
    quiz: function () {
      const type = Kit.pick(['who', 'who', 'where', 'year', 'order', 'why', 'expel', 'zheng', 'dutch', 'compete']);

      if (type === 'who') {
        const cases = [
          { p: '南部的大員（今臺南安平）', a: '荷蘭', w: ['西班牙', '葡萄牙', '日本'] },
          { p: '北部的雞籠（今基隆）', a: '西班牙', w: ['荷蘭', '英國', '日本'] }
        ];
        const c = Kit.pick(cases);
        const o = pick4(c.a, c.w);
        return {
          q: '大航海時代，哪一個國家在臺灣<b>' + c.p + '</b>建立據點？',
          choices: o.choices, answer: o.answer,
          steps: '<b>荷蘭在南</b>（1624 年到大員，築熱蘭遮城）、<b>西班牙在北</b>（1626 年占雞籠）。<br>' +
            '所以答案是<b>' + c.a + '</b>。把地圖上南北兩個點記起來，這一單元的題目就都會了。'
        };
      }

      if (type === 'where') {
        const cases = [
          { n: '大員', a: '今天的臺南安平', w: ['今天的基隆', '今天的高雄', '今天的臺中'] },
          { n: '雞籠', a: '今天的基隆', w: ['今天的臺南', '今天的宜蘭', '今天的新竹'] },
          { n: '熱蘭遮城', a: '荷蘭人在大員（臺南）蓋的城堡', w: ['西班牙人在基隆蓋的城堡', '鄭成功蓋的城堡', '清朝蓋的城堡'] }
        ];
        const c = Kit.pick(cases);
        const o = pick4(c.a, c.w);
        return {
          q: '<b>' + c.n + '</b>是指什麼？',
          choices: o.choices, answer: o.answer,
          steps: c.n + ' 就是<b>' + c.a + '</b>。<br>' +
            '大員＝臺南安平（荷蘭），雞籠＝基隆（西班牙），熱蘭遮城是荷蘭人在大員蓋的。'
        };
      }

      if (type === 'year') {
        const cases = [
          { e: '荷蘭人到大員建立據點', a: '1624 年', w: ['1626 年', '1662 年', '1683 年'] },
          { e: '西班牙人占領雞籠', a: '1626 年', w: ['1624 年', '1642 年', '1662 年'] },
          { e: '荷蘭人把西班牙人趕出臺灣', a: '1642 年', w: ['1624 年', '1662 年', '1683 年'] },
          { e: '鄭成功趕走荷蘭人', a: '1662 年', w: ['1642 年', '1624 年', '1683 年'] }
        ];
        const c = Kit.pick(cases);
        const o = pick4(c.a, c.w);
        return {
          q: '<b>' + c.e + '</b>是哪一年？',
          choices: o.choices, answer: o.answer,
          steps: '四個關鍵年代：<b>1624</b> 荷蘭到大員、<b>1626</b> 西班牙到雞籠、<b>1642</b> 荷蘭趕走西班牙、<b>1662</b> 鄭成功趕走荷蘭。<br>' +
            '所以「' + c.e + '」是 <b>' + c.a + '</b>。拖上面的年代滑桿可以一格一格看過去。'
        };
      }

      if (type === 'order') {
        const o = shuffled([
          { t: '荷蘭到大員 → 西班牙到雞籠 → 荷蘭趕走西班牙 → 鄭成功趕走荷蘭', ok: true },
          { t: '西班牙到雞籠 → 荷蘭到大員 → 鄭成功趕走荷蘭 → 荷蘭趕走西班牙' },
          { t: '鄭成功趕走荷蘭 → 荷蘭到大員 → 西班牙到雞籠 → 荷蘭趕走西班牙' },
          { t: '荷蘭到大員 → 鄭成功趕走荷蘭 → 西班牙到雞籠 → 荷蘭趕走西班牙' }
        ]);
        return {
          q: '下面四件事，<b>由早到晚</b>的正確順序是？',
          choices: o.choices, answer: o.answer,
          steps: '1624 荷蘭到大員 → 1626 西班牙到雞籠 → 1642 荷蘭趕走西班牙 → 1662 鄭成功趕走荷蘭。<br>' +
            '記法：<b>荷先到、西後到；荷趕西、鄭趕荷。</b>'
        };
      }

      if (type === 'why') {
        const o = shuffled([
          { t: '臺灣位在中國大陸、日本與南洋之間的航線中段，是貿易的轉運站', ok: true },
          { t: '因為臺灣有很多黃金礦' },
          { t: '因為臺灣離歐洲很近' },
          { t: '因為臺灣當時沒有人住' }
        ]);
        return {
          q: '大航海時代，歐洲國家為什麼想在臺灣建立據點？',
          choices: o.choices, answer: o.answer,
          steps: '臺灣的價值來自<b>位置</b>：往北到日本、往西到中國大陸、往南到南洋，剛好在中間。<br>' +
            '控制臺灣就能控制轉運與貿易，這才是他們千里迢迢過來的原因。<br>' +
            '臺灣當時也有原住民族居住，並不是無人島。'
        };
      }

      if (type === 'expel') {
        const o = pick4('荷蘭人把西班牙人趕走', ['西班牙人把荷蘭人趕走', '鄭成功把西班牙人趕走', '清朝把荷蘭人趕走']);
        return {
          q: '1642 年臺灣發生了什麼事？',
          choices: o.choices, answer: o.answer,
          steps: '1642 年<b>荷蘭人把西班牙人趕出臺灣</b>，北部據點也落入荷蘭手中，全島由荷蘭控制。<br>' +
            '這是「國際間因<b>利益競爭</b>造成衝突」最直接的例子——兩個歐洲國家為了同一條航線打起來。'
        };
      }

      if (type === 'zheng') {
        const o = pick4('荷蘭人', ['西班牙人', '清帝國', '日本人']);
        return {
          q: '1662 年<b>鄭成功</b>打敗並趕出臺灣的是誰？',
          choices: o.choices, answer: o.answer,
          steps: '鄭成功 1662 年攻下<b>熱蘭遮城</b>，趕走的是<b>荷蘭人</b>，臺灣改由鄭氏統治。<br>' +
            '⚠️ 不要和清帝國搞混：清帝國要到 <b>1683 年</b>才把臺灣納入版圖（下一個單元）。'
        };
      }

      if (type === 'dutch') {
        const o = shuffled([
          { t: '收稅、種甘蔗製糖、輸出鹿皮，並引進漢人來開墾', ok: true },
          { t: '建立臺灣第一條鐵路' },
          { t: '把臺灣分成好幾個省' },
          { t: '開放淡水、安平等四個港口通商' }
        ]);
        return {
          q: '<b>荷蘭</b>統治時期在臺灣主要做了哪些事？',
          choices: o.choices, answer: o.answer,
          steps: '荷蘭人在臺灣<b>收稅、種甘蔗製糖、把鹿皮輸出到日本</b>，並且<b>招來漢人開墾</b>。<br>' +
            '鐵路是清末到日治的事；開放四個港口通商是 1860 年代的<b>開港通商</b>（第三單元）。'
        };
      }

      // compete：課綱概念題
      const o = shuffled([
        { t: '國家之間會因為爭奪利益而發生衝突，也可能為了利益而合作', ok: true },
        { t: '國家之間永遠都很和平，不會有衝突' },
        { t: '只要距離遠，國家之間就不會互相影響' },
        { t: '貿易和國家之間的關係沒有影響' }
      ]);
      return {
        q: '從荷蘭、西班牙爭奪臺灣這件事，可以看出什麼道理？',
        choices: o.choices, answer: o.answer,
        steps: '課綱 Af-Ⅲ-2：<b>國際間因利益競爭而造成衝突、對立與結盟。</b><br>' +
          '荷蘭與西班牙都想要臺灣這個轉運位置 → 競爭 → 1642 年荷蘭趕走西班牙。<br>' +
          '這個道理到今天還適用，看新聞時可以帶孩子一起想。'
      };
    }
  });


  /* ============================================================
     第 3 單元　成為清帝國的領土
     Cb-Ⅲ-1「不同時期臺灣、世界的重要事件與人物，影響臺灣的歷史變遷。」
     Cc-Ⅲ-2「族群的遷徙、通婚及交流，與社會變遷互為因果。」
     對應課本兩課：早期移民如何建立家園／開港通商為什麼改變臺灣
     ============================================================ */
  Kit.register('soc5a-u3', {

    intro: '清帝國統治臺灣兩百多年。拖動年代滑桿，看漢人移民怎麼<b>從南往北</b>一路開墾，以及 1860 年代<b>開港通商</b>之後，臺灣的重心怎麼被拉到北部。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let year = 1683;

      /* 開墾大致由南往北推進：以緯度上限表示 */
      function frontier(y) {
        if (y < 1683) return 22.9;
        const t = Math.min(1, (y - 1683) / (1860 - 1683));
        return 22.9 + t * 2.2;     // 22.9（臺南）→ 25.1（臺北）
      }

      function paint() {
        const ctx = base(cv, { mtColor: '#2b4770' });
        const fr = frontier(year);
        const opened = year >= 1860;

        /* 已開墾範圍：西部平原由南往北填色 */
        ctx.save(); TW.clipIsland(ctx);
        ctx.globalAlpha = 0.42; ctx.fillStyle = C.soc;
        const top = TW.xy(119.35, fr)[1], bot = TW.xy(119.35, 21.7)[1];
        ctx.fillRect(0, top, 260, bot - top);
        ctx.restore();
        /* 開墾前線 */
        const fa = TW.xy(119.9, fr), fb = TW.xy(121.3, fr);
        ctx.save(); ctx.strokeStyle = C.soc; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(fa[0], fa[1]); ctx.lineTo(fb[0], fb[1]); ctx.stroke(); ctx.restore();
        ctx.font = '11px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = C.soc;
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('開墾前線', fb[0] + 4, fb[1]);

        /* 移民路線：從西邊渡海 */
        TW.arrow(ctx, 16, 300, TW.xy(120.15, 23.05)[0] - 12, TW.xy(120.15, 23.05)[1], C.muted, 1.8);
        ctx.fillStyle = C.muted; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('渡海而來', 6, 288);

        /* 開港四口 */
        if (opened) {
          [['淡水', P.淡水], ['基隆', P.基隆], ['臺南', P.臺南], ['高雄', P.高雄]].forEach(function (p) {
            const nm = { 淡水: '淡水', 基隆: '雞籠（基隆）', 臺南: '安平（臺南）', 高雄: '打狗（高雄）' }[p[0]];
            const side = (p[0] === '基隆') ? 'r' : 'l';
            TW.dot(ctx, p[1][0], p[1][1], C.ok, nm, side, 6);
          });
        } else {
          TW.dot(ctx, P.臺南[0], P.臺南[1], C.text, '臺灣府（臺南）', 'l', 5);
        }

        /* 年代軸 */
        const AX = 336, AW = 262, AY = 402, Y0 = 1680, Y1 = 1900;
        ctx.strokeStyle = '#2b3f63'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(AX, AY); ctx.lineTo(AX + AW, AY); ctx.stroke();
        const marks = [[1683, '1683\n清領'], [1860, '1860s\n開港'], [1885, '1885\n建省'], [1895, '1895\n割日']];
        ctx.font = '11px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'center';
        marks.forEach(function (m) {
          const x = AX + (m[0] - Y0) / (Y1 - Y0) * AW;
          ctx.fillStyle = year >= m[0] ? C.soc : '#3b4d70';
          ctx.beginPath(); ctx.arc(x, AY, 4, 0, Math.PI * 2); ctx.fill();
          ctx.textBaseline = 'top';
          m[1].split('\n').forEach(function (t, i) { ctx.fillText(t, x, AY + 8 + i * 13); });
        });
        const cx = AX + (year - Y0) / (Y1 - Y0) * AW;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, AY - 14); ctx.lineTo(cx, AY + 6); ctx.stroke();

        const w = TW.panel(ctx, AX, 22, AW);
        let y = w('西元 ' + year + ' 年', C.soc, 18, 8);
        if (year < 1683) {
          y = w('鄭氏統治時期。清帝國尚未取得臺灣。', C.text, 13, 10);
        } else if (!opened) {
          y = w('清帝國統治。漢人移民多半從福建、廣東渡過臺灣海峽而來，先在<b>西部平原</b>落腳，再慢慢往北開墾。', C.text, 13, 8);
          y = w('移民帶來自己的信仰、語言和建築，也和原住民族接觸、通婚，社會慢慢改變。', C.muted, 13, 8);
          y = w('這時的政治與經濟中心在<b>南部（臺南）</b>。', C.warn, 13, 0);
        } else {
          y = w('1860 年代<b>開港通商</b>：開放<b>淡水、雞籠（基隆）、安平、打狗（高雄）</b>四個港口。', C.ok, 13, 8);
          y = w('北部的<b>茶</b>和<b>樟腦</b>大量外銷，南部主要出口<b>糖</b>。', C.text, 13, 8);
          y = w('茶和樟腦賺得多，人口和財富往北移動，臺灣的重心<b>由南往北</b>轉。1885 年臺灣建省。', C.warn, 13, 0);
        }
        y = w('👉 開墾方向：由<b>南</b>往<b>北</b>、由<b>西</b>部平原往內陸。', C.ok, 13, 0);

        readout.innerHTML = opened
          ? '<div class="big">1860 年代<b>開港通商</b>：淡水、雞籠（基隆）、安平（臺南）、打狗（高雄）四口開放</div>' +
            '出口品：北部<b>茶、樟腦</b>，南部<b>糖</b>。因為茶和樟腦利潤高，<b>經濟重心由南往北移</b>。<br>' +
            '1885 年臺灣<b>建省</b>；1895 年割讓給日本，清帝國統治結束。<br>' +
            '<span style="color:var(--muted)">一句話：開港通商把臺灣重新接上世界市場，也把臺灣的中心從臺南換成臺北。</span>'
          : '<div class="big">' + year + ' 年：清帝國統治時期，漢人移民由南往北開墾</div>' +
            '移民多半從<b>福建、廣東</b>渡過臺灣海峽而來，先在<b>西部平原</b>落腳。<br>' +
            '不同族群的遷徙、接觸與通婚，讓臺灣的社會樣貌不斷改變。<br>' +
            '<span style="color:var(--muted)">把滑桿拉過 1860，看開港通商之後發生什麼事。</span>';
      }

      const yearCtl = Kit.slider('年代', {
        min: 1660, max: 1900, value: year, format: v => v + ' 年',
        onChange: v => { year = v; paint(); }
      });
      const jump = Kit.segmented('跳到', [
        { label: '1683 清領', value: 1683 }, { label: '1760 開墾中', value: 1760 },
        { label: '1860 開港', value: 1862 }, { label: '1885 建省', value: 1885 }
      ], function (v) { year = v; yearCtl.input.value = v; yearCtl.output.textContent = v + ' 年'; paint(); }, 1683);

      controls.appendChild(yearCtl.wrap);
      controls.appendChild(jump.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '兩個方向記住就好：開墾是<b>南 → 北</b>，開港之後重心也是<b>南 → 北</b>。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「清帝國哪一年開始統治臺灣？」', why: '1683 年。可以接著問他前一年是誰在統治（鄭氏），把兩個單元接起來。' },
      { ask: '「早期移民從哪裡來？怎麼來的？」', why: '主要從福建、廣東渡過臺灣海峽。渡海很危險，所以才有「唐山過臺灣」的說法。' },
      { ask: '「開墾是從哪裡開始，往哪個方向走？」', why: '從南部（臺南）往北，從西部平原往內陸。拖滑桿看橘色區域怎麼長上去。' },
      { ask: '「開港通商開放了哪四個港口？」', why: '淡水、雞籠（基隆）、安平（臺南）、打狗（高雄）。注意舊名和今名的對應，考試常考。' },
      { ask: '「北部出口什麼？南部出口什麼？」', why: '北部茶和樟腦，南部糖。這是理解「重心為何北移」的關鍵。' },
      { ask: '「為什麼開港之後臺灣的中心從臺南變成臺北？」', why: '因為茶和樟腦產在北部又賺錢，人和錢就往北跑。這題把經濟和地理連起來，是本單元的重點。' },
      { ask: '「不同族群一起生活，會發生什麼事？」', why: '會有合作、通婚、交流，也會有衝突。課綱要的是理解「遷徙與社會變遷互為因果」，不是背名詞。' }
    ],

    pitfalls: [
      { bad: '以為清帝國從鄭成功之後馬上就統治臺灣。', fix: '鄭成功 <b>1662</b> 年趕走荷蘭，鄭氏又統治了二十年，清帝國 <b>1683</b> 年才將臺灣納入版圖。', src: 'Cb-Ⅲ-1' },
      { bad: '以為開墾是從北部開始往南。', fix: '方向<b>相反</b>：移民先在<b>南部（臺南一帶）</b>落腳，再逐漸往北開墾。清代前期的中心一直在南部。' },
      { bad: '把開港通商的四個港口記成現在的名字，對不上舊名。', fix: '四口是<b>淡水、雞籠（今基隆）、安平（今臺南）、打狗（今高雄）</b>。舊名新名要能互相對應。' },
      { bad: '以為開港通商發生在清代初期。', fix: '開港通商是 <b>1860 年代</b>，已經是清帝國統治臺灣的<b>後期</b>，距離 1683 年有一百七十多年。' },
      { bad: '以為南北都出口一樣的東西。', fix: '<b>北部茶、樟腦；南部糖。</b>正因為北部的茶和樟腦利潤高，經濟重心才會北移。' },
      { bad: '以為族群之間只有衝突，沒有交流。', fix: '有衝突，也有<b>通婚、貿易與文化交流</b>。課綱 Cc-Ⅲ-2 說的是「族群的遷徙、通婚及交流，與社會變遷<b>互為因果</b>」。', src: 'Cc-Ⅲ-2' }
    ],

    quizCount: 5,
    quiz: function () {
      const type = Kit.pick(['start', 'direction', 'ports', 'ports', 'portName', 'export', 'shift', 'from', 'when', 'ethnic', 'end']);

      if (type === 'start') {
        const o = pick4('1683 年', ['1662 年', '1624 年', '1895 年']);
        return {
          q: '清帝國從哪一年開始統治臺灣？',
          choices: o.choices, answer: o.answer,
          steps: '<b>1683 年</b>清帝國將臺灣納入版圖，隔年設臺灣府。<br>' +
            '1662 年是鄭成功趕走荷蘭人，中間鄭氏還統治了二十年左右。<br>' +
            '1895 年則是清帝國把臺灣割讓給日本、統治結束的那一年。'
        };
      }

      if (type === 'direction') {
        const o = pick4('由南往北', ['由北往南', '由東往西', '由中央山脈往兩邊']);
        return {
          q: '清代漢人移民開墾臺灣，大致的方向是？',
          choices: o.choices, answer: o.answer,
          steps: '移民從<b>南部（臺南一帶）</b>先落腳，再一路<b>往北</b>開墾，並由<b>西部平原</b>往內陸推進。<br>' +
            '拖上面的年代滑桿，橘色的已開墾區域就是這樣長上去的。'
        };
      }

      if (type === 'ports') {
        const right = ['淡水', '雞籠（基隆）', '安平（臺南）', '打狗（高雄）'];
        const wrong = ['花蓮', '臺東', '蘇澳', '梧棲', '布袋'];
        const inList = Math.random() < .5;
        if (inList) {
          const o = pick4(Kit.pick(right), Kit.shuffle(wrong).slice(0, 3));
          return {
            q: '1860 年代開港通商，下面哪一個是開放的港口？',
            choices: o.choices, answer: o.answer,
            steps: '開放的四個港口是<b>淡水、雞籠（今基隆）、安平（今臺南）、打狗（今高雄）</b>。<br>' +
              '全部都在<b>西部和北部</b>沿海——東部因為海岸陡峭、平地少，一直沒有大港。'
          };
        }
        const o = pick4(Kit.pick(wrong), Kit.shuffle(right).slice(0, 3));
        return {
          q: '下面哪一個<b>不是</b> 1860 年代開港通商開放的港口？',
          choices: o.choices, answer: o.answer,
          steps: '四個開放的港口是<b>淡水、雞籠（基隆）、安平（臺南）、打狗（高雄）</b>，其他都不是。<br>' +
            '記法：<b>北二南二</b>——北部淡水、基隆，南部臺南、高雄。'
        };
      }

      if (type === 'portName') {
        const pairs = [['打狗', '高雄'], ['雞籠', '基隆'], ['安平', '臺南']];
        const c = Kit.pick(pairs);
        const o = pick4(c[1], pairs.filter(p => p !== c).map(p => p[1]).concat(['臺中', '宜蘭']));
        return {
          q: '開港通商的港口「<b>' + c[0] + '</b>」，是今天的哪一個地方？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c[0] + ' ＝ 今天的' + c[1] + '</b>。<br>' +
            '三組舊名新名一起記：打狗＝高雄、雞籠＝基隆、安平＝臺南。'
        };
      }

      if (type === 'export') {
        const north = Math.random() < .5;
        const o = pick4(north ? '茶和樟腦' : '糖', [north ? '糖' : '茶和樟腦', '石油', '鋼鐵']);
        return {
          q: '開港通商之後，臺灣<b>' + (north ? '北部' : '南部') + '</b>主要出口什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>北部出口茶和樟腦，南部出口糖。</b><br>' +
            (north
              ? '茶和樟腦產在北部丘陵與山區，利潤又高，所以北部快速發展。'
              : '南部平原適合種甘蔗，糖是清代以來就有的重要出口品。')
        };
      }

      if (type === 'shift') {
        const o = shuffled([
          { t: '北部的茶和樟腦外銷賺錢，人口和財富往北集中', ok: true },
          { t: '南部發生大地震，人都搬走了' },
          { t: '清朝下令禁止南部通商' },
          { t: '北部比南部早開墾，所以人比較多' }
        ]);
        return {
          q: '開港通商之後，臺灣的經濟重心為什麼<b>從南部移到北部</b>？',
          choices: o.choices, answer: o.answer,
          steps: '開港之後<b>茶和樟腦</b>大量外銷，而這兩樣主要產在<b>北部</b>的丘陵與山區。<br>' +
            '生意在哪裡，人和錢就往哪裡去，北部因此快速發展，1885 年臺灣建省後行政中心也逐漸北移。<br>' +
            '注意：北部其實是<b>比較晚</b>才開墾的，不是比較早。'
        };
      }

      if (type === 'from') {
        const o = pick4('福建、廣東一帶', ['日本', '南洋', '歐洲']);
        return {
          q: '清代來臺灣開墾的漢人移民，主要來自哪裡？',
          choices: o.choices, answer: o.answer,
          steps: '主要來自<b>福建、廣東</b>一帶，坐船渡過<b>臺灣海峽</b>而來。<br>' +
            '渡海風險很高，所以才有「唐山過臺灣」這樣的說法。<br>' +
            '他們帶來自己的語言、信仰和建築，也和原住民族接觸、通婚。'
        };
      }

      if (type === 'when') {
        const o = pick4('清帝國統治臺灣的後期', ['清帝國統治臺灣的初期', '荷蘭統治時期', '日本統治時期']);
        return {
          q: '<b>1860 年代的開港通商</b>發生在什麼時候？',
          choices: o.choices, answer: o.answer,
          steps: '清帝國 <b>1683</b> 年開始統治臺灣，<b>1895</b> 年結束。1860 年代已經是<b>後期</b>了。<br>' +
            '從 1683 到 1860 中間隔了一百七十多年，不是「一開始就開港」。'
        };
      }

      if (type === 'ethnic') {
        const o = shuffled([
          { t: '既有合作、通婚與文化交流，也有因土地或水源產生的衝突', ok: true },
          { t: '完全沒有往來，各過各的' },
          { t: '只有衝突，從來沒有交流' },
          { t: '所有人立刻變成同一種文化' }
        ]);
        return {
          q: '清代不同族群在臺灣一起生活，情況比較接近下面哪一種？',
          choices: o.choices, answer: o.answer,
          steps: '族群之間<b>有交流也有衝突</b>：會通婚、做生意、互相學習，也會為了土地和水源起爭執。<br>' +
            '課綱 Cc-Ⅲ-2 說的是「族群的遷徙、通婚及交流，與社會變遷<b>互為因果</b>」——' +
            '人的移動改變社會，社會的變化又影響人怎麼移動。'
        };
      }

      // end：清帝國統治結束
      const o = pick4('1895 年割讓給日本', ['1885 年臺灣建省', '1860 年開港通商', '1683 年納入版圖']);
      return {
        q: '清帝國對臺灣的統治，是因為什麼事而結束的？',
        choices: o.choices, answer: o.answer,
        steps: '<b>1895 年</b>清帝國把臺灣<b>割讓給日本</b>，統治結束，臺灣進入日治時期（五下第一單元）。<br>' +
          '1885 年臺灣建省、1860 年代開港通商，都發生在這之前。<br>' +
          '整條時間線：1683 清領 → 1860s 開港 → 1885 建省 → 1895 割日。'
      };
    }
  });


  /* ============================================================
     第 4 單元　土地的利用與變遷
     Ab-Ⅲ-3「自然環境、自然災害及經濟活動，和生活空間的使用有關聯性。」
     Bc-Ⅲ-1「族群或地區的文化特色，各有其產生的背景因素…」
     Ca-Ⅲ-1「都市化與工業化會改變環境，也會引發環境問題。」
     Ca-Ⅲ-2「土地利用反映過去和現在的環境變遷，以及對未來的展望。」
     對應課本三課：不同地形創造所需／沿海的利用／開發與保護的抉擇
     ============================================================ */
  Kit.register('soc5a-u4', {

    intro: '地形決定了人在上面做什麼。切到<b>地形剖面</b>看臺灣從西到東是怎麼一路升高再下降，<b>沿海利用</b>看西岸和東岸為什麼差這麼多，<b>開發與保護</b>則是拉一條滑桿，親眼看見「多開發一點」要付出什麼代價。',

    build: function (host) {
      const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
      host.appendChild(wrap);
      const cv = Kit.canvas2d(wrap, 620, 440);
      const readout = Kit.el('div', { class: 'readout' });
      const controls = Kit.el('div', { class: 'controls' });

      let mode = 'profile', devel = 30, band = 2;

      /* 西 → 東 剖面。每段：寬度比例、最高處海拔(公尺)、名稱、用途 */
      const BANDS = [
        { w: 0.22, h: 60, name: '平原', color: '#34d399', use: '地勢平坦、土壤肥沃 → <b>農田、都市、工廠</b>都集中在這裡，人口最多。' },
        { w: 0.10, h: 250, name: '台地', color: '#a3d977', use: '地勢較高而平坦，排水好 → 種<b>茶</b>、鳳梨，也有埤塘。' },
        { w: 0.12, h: 700, name: '丘陵', color: '#fbbf24', use: '坡度和緩的小山 → <b>茶園、果園</b>，早期也採樟腦。' },
        { w: 0.30, h: 3500, name: '山地', color: '#fb923c', use: '又高又陡 → 大多是<b>森林</b>，是水源地，也是林業與國家公園所在。' },
        { w: 0.09, h: 120, name: '縱谷', color: '#4da3ff', use: '兩排山中間的長條平地 → <b>稻田</b>與聚落，花東縱谷就是。' },
        { w: 0.11, h: 900, name: '海岸山脈', color: '#7c5cff', use: '東邊靠海的山 → 森林為主，平地很少。' },
        { w: 0.06, h: 0, name: '太平洋', color: '#4da3ff', use: '東岸陡峭、水深，<b>缺乏大片平地與良港</b>。' }
      ];

      function paintProfile() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        const X0 = 44, X1 = 596, BASE = 300, TOPY = 60;
        const W = X1 - X0;
        const maxH = 3600;
        const hy = h => BASE - (h / maxH) * (BASE - TOPY);

        /* 海（左右兩端） */
        ctx.fillStyle = '#122238';
        ctx.fillRect(0, BASE - 12, X0, 30);
        ctx.fillRect(X1, BASE - 12, 620 - X1, 30);

        /* 地形帶 */
        let x = X0;
        const spans = [];
        BANDS.forEach((b, i) => {
          const bw = b.w * W;
          spans.push({ x0: x, x1: x + bw, i: i });
          x += bw;
        });
        /* 地表曲線 */
        ctx.beginPath();
        ctx.moveTo(X0, BASE);
        spans.forEach((s, i) => {
          const b = BANDS[i];
          const mid = (s.x0 + s.x1) / 2;
          ctx.lineTo(mid, hy(b.h));
          ctx.lineTo(s.x1, hy(b.h * (BANDS[i + 1] ? 0.55 : 0)));
        });
        ctx.lineTo(X1, BASE); ctx.closePath();
        ctx.fillStyle = '#1e3050'; ctx.fill();
        ctx.strokeStyle = '#4a6ea8'; ctx.lineWidth = 1.5; ctx.stroke();

        /* 每一帶著色與標籤 */
        spans.forEach((s, i) => {
          const b = BANDS[i];
          ctx.save();
          ctx.globalAlpha = (i === band) ? 0.55 : 0.2;
          ctx.fillStyle = b.color;
          ctx.fillRect(s.x0, TOPY - 26, s.x1 - s.x0, BASE - TOPY + 26);
          ctx.restore();
          ctx.font = (i === band ? 'bold ' : '') + '12px "Microsoft JhengHei", sans-serif';
          ctx.fillStyle = (i === band) ? b.color : C.muted;
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText(b.name, (s.x0 + s.x1) / 2, TOPY - 22);
          if (b.h) {
            ctx.font = '10px sans-serif'; ctx.fillStyle = C.muted;
            ctx.fillText(b.h >= 1000 ? (b.h / 1000).toFixed(1) + ' 公里' : b.h + ' 公尺', (s.x0 + s.x1) / 2, TOPY - 8);
          }
        });

        /* 方位 */
        ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = C.accent; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('西（臺灣海峽）', 6, BASE + 24);
        ctx.textAlign = 'right'; ctx.fillText('東（太平洋）', 614, BASE + 24);

        /* 面積比例條 */
        const PY = BASE + 56;
        ctx.font = '12px "Microsoft JhengHei", sans-serif'; ctx.fillStyle = C.text;
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('臺灣的地形，大約這樣分：', X0, PY - 6);
        const groups = [
          { n: '山地、丘陵、台地', f: 2 / 3, c: C.soc },
          { n: '平原、盆地', f: 1 / 3, c: C.ok }
        ];
        let gx = X0;
        groups.forEach(g => {
          const gw = g.f * W;
          ctx.fillStyle = g.c; ctx.globalAlpha = 0.75;
          ctx.fillRect(gx, PY, gw, 26); ctx.globalAlpha = 1;
          ctx.fillStyle = '#0b1220'; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(g.n + '　約 ' + (g.f > 0.5 ? '2/3' : '1/3'), gx + gw / 2, PY + 13);
          gx += gw;
        });

        const b = BANDS[band];
        const plainUse = b.use.replace(/<\/?b>/g, '');
        ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = b.color; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('▸ ' + b.name, X0, PY + 40);
        const w2 = TW.panel(ctx, X0 + 70, PY + 40, W - 70);
        w2(plainUse, C.text, 13, 0);

        readout.innerHTML =
          '<div class="big">臺灣的五大地形：<b>山地、丘陵、台地、平原、盆地</b></div>' +
          '從西到東的順序是：<b>平原 → 台地 → 丘陵 → 山地 →（花東）縱谷 → 海岸山脈 → 太平洋</b>。<br>' +
          '<b>山地、丘陵、台地加起來約佔臺灣面積的三分之二</b>，平原和盆地只佔約三分之一——所以人和城市都擠在西部平原。<br>' +
          '目前看的是<b>' + b.name + '</b>：' + b.use + '<br>' +
          '<span style="color:var(--muted)">東岸為什麼沒有大港？因為山直接逼到海邊，缺乏大片平地。</span>';
      }

      function paintCoast() {
        const ctx = base(cv, { mtColor: '#2b4770' });
        /* 西岸沙岸 */
        ctx.save(); ctx.strokeStyle = C.ok; ctx.lineWidth = 5; ctx.globalAlpha = 0.45; ctx.lineCap = 'round';
        ctx.beginPath();
        [[120.15, 23.70], [120.13, 23.38], [120.05, 23.15], [120.18, 22.85], [120.27, 22.62]].forEach((p, i) => {
          const q = TW.xy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
        });
        ctx.stroke(); ctx.restore();
        /* 東岸岩岸 */
        ctx.save(); ctx.strokeStyle = C.purple; ctx.lineWidth = 5; ctx.globalAlpha = 0.5; ctx.lineCap = 'round';
        ctx.beginPath();
        [[121.86, 24.60], [121.80, 24.35], [121.63, 24.00], [121.50, 23.60], [121.38, 23.10]].forEach((p, i) => {
          const q = TW.xy(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
        });
        ctx.stroke(); ctx.restore();

        TW.dot(ctx, P.七股[0], P.七股[1], C.warn, '鹽田・養殖（七股）', 'l', 5);
        TW.dot(ctx, P.布袋[0], P.布袋[1], C.warn, '鹽田（布袋）', 'l', 5);
        TW.dot(ctx, P.麥寮[0], P.麥寮[1], C.no, '沿海工業區', 'l', 5);
        TW.dot(ctx, P.高雄[0], P.高雄[1], C.accent, '港口（高雄）', 'l', 5);
        TW.dot(ctx, P.基隆[0], P.基隆[1], C.accent, '港口（基隆）', 'r', 5);
        TW.dot(ctx, P.花蓮[0], P.花蓮[1], C.purple, '東岸：陡峭少平地', 'r', 5);

        const w = TW.panel(ctx, 336, 22, 268);
        let y = w('海岸怎麼用，看它長什麼樣', C.soc, 16, 10);
        y = w('● 西部｜沙岸', C.ok, 14, 3);
        y = w('海底坡度緩、有沙灘和潟湖 → 適合<b>養殖、曬鹽</b>，也蓋得下大港和沿海工業區。', C.text, 13, 8);
        y = w('● 東部｜岩岸', C.purple, 14, 3);
        y = w('山直接逼到海邊，海岸陡、水深、平地少 → 大港和農地都很難發展，以<b>觀光</b>為主。', C.text, 13, 8);
        y = w('為什麼鹽田在西南部？', C.warn, 14, 3);
        y = w('因為那裡冬天<b>雨少、日照強、風大</b>，海水才蒸發得快。曬鹽要的是好天氣，不是好海。', C.text, 13, 8);
        y = w('👉 同樣是海岸，西邊和東邊做的事完全不同——這就是「自然環境影響生活空間的使用」。', C.ok, 13, 0);

        readout.innerHTML =
          '<div class="big">西岸<b>沙岸</b>（緩、多沙）／東岸<b>岩岸</b>（陡、水深）</div>' +
          '<b>西部沙岸</b>：養殖、曬鹽（七股、布袋）、大港（高雄）、沿海工業區。<br>' +
          '<b>東部岩岸</b>：山逼近海邊，平地和良港都少，以觀光為主。<br>' +
          '<b>鹽田為什麼在西南部？</b>因為那裡冬天雨少、日照強、風大，海水蒸發得快。<br>' +
          '<span style="color:var(--muted)">把這一點和第一單元的季風連起來：冬天吹東北季風，西南部正好是背風面的乾季。</span>';
      }

      function paintDevel() {
        const ctx = cv.ctx;
        cv.clear(C.bg);
        const d = devel / 100;
        /* 三種土地利用的比例隨開發程度變化 */
        const nature = 0.70 - 0.45 * d;      // 森林、濕地
        const farm = 0.25 - 0.05 * d;        // 農地
        const city = 1 - nature - farm;      // 都市與工業
        const rows = [
          { n: '森林、濕地（自然）', f: nature, c: C.ok },
          { n: '農地', f: farm, c: C.warn },
          { n: '都市、工廠', f: city, c: C.no }
        ];
        const X0 = 46, W = 520, Y0 = 56, BH = 46;
        ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = C.soc; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('開發程度 ' + devel + '％ 時，土地大概這樣分', X0, 20);

        rows.forEach((r, i) => {
          const y = Y0 + i * (BH + 22);
          ctx.fillStyle = '#16203a'; ctx.fillRect(X0, y, W, BH);
          ctx.fillStyle = r.c; ctx.globalAlpha = 0.8;
          ctx.fillRect(X0, y, W * r.f, BH); ctx.globalAlpha = 1;
          ctx.font = '13px "Microsoft JhengHei", sans-serif';
          ctx.fillStyle = C.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(r.n, X0 + 8, y + BH / 2);
          ctx.textAlign = 'right'; ctx.fillStyle = r.c;
          ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
          ctx.fillText(Math.round(r.f * 100) + '％', X0 + W - 8, y + BH / 2);
        });

        /* 好處與代價 */
        const gy = Y0 + 3 * (BH + 22) + 8;
        ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.fillStyle = C.ok; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('得到什麼', X0, gy);
        ctx.fillStyle = C.no; ctx.fillText('付出什麼', X0 + 280, gy);
        const wl = TW.panel(ctx, X0, gy + 24, 250);
        const wr = TW.panel(ctx, X0 + 280, gy + 24, 250);
        if (devel < 35) {
          wl('自然環境保留得多，水源乾淨，生物棲地完整。', C.text, 13, 0);
          wr('工作機會與住宅較少，部分居民可能得離開家鄉找工作。', C.text, 13, 0);
        } else if (devel < 70) {
          wl('有工作、有住宅，也還留得住一部分森林與農地。', C.text, 13, 0);
          wr('開始出現空氣與水污染、農地變少的問題，需要規劃與取捨。', C.text, 13, 0);
        } else {
          wl('工作機會多、交通方便、經濟活動熱絡。', C.text, 13, 0);
          wr('森林與濕地大幅減少、污染增加、淹水風險升高，生物棲地被切斷。', C.text, 13, 0);
        }

        readout.innerHTML =
          '<div class="big">開發程度 <b>' + devel + '％</b>：自然 ' + Math.round(nature * 100) +
          '％／農地 ' + Math.round(farm * 100) + '％／都市與工廠 ' + Math.round(city * 100) + '％</div>' +
          '<b>都市化與工業化會改變環境</b>：土地從森林、濕地變成道路、房子和工廠，' +
          '帶來工作和方便，也帶來空氣污染、水污染、淹水風險和棲地消失。<br>' +
          '<b>這題沒有標準答案</b>——完全不開發，人沒有工作和住的地方；開發到底，環境撐不住。' +
          '課本要孩子練習的是<b>權衡</b>：想清楚得到什麼、失去什麼，再決定。<br>' +
          '<span style="color:var(--muted)">土地怎麼用，反映的是我們對未來想要什麼樣的生活（課綱 Ca-Ⅲ-2）。</span>';
      }

      function paint() {
        if (mode === 'profile') paintProfile();
        else if (mode === 'coast') paintCoast();
        else paintDevel();
      }

      const modeSeg = Kit.segmented('模式', [
        { label: '① 地形剖面', value: 'profile' },
        { label: '② 沿海利用', value: 'coast' },
        { label: '③ 開發與保護', value: 'devel' }
      ], function (v) {
        mode = v;
        bandSeg.wrap.style.display = v === 'profile' ? '' : 'none';
        develCtl.wrap.style.display = v === 'devel' ? '' : 'none';
        paint();
      }, mode);

      const bandSeg = Kit.segmented('看哪一帶', [
        { label: '平原', value: 0 }, { label: '台地', value: 1 }, { label: '丘陵', value: 2 },
        { label: '山地', value: 3 }, { label: '縱谷', value: 4 }, { label: '海岸山脈', value: 5 }
      ], function (v) { band = v; paint(); }, band);

      const develCtl = Kit.slider('開發程度', {
        min: 0, max: 100, step: 5, value: devel, format: v => v + '％',
        onChange: v => { devel = v; paint(); }
      });
      develCtl.wrap.style.display = 'none';

      controls.appendChild(modeSeg.wrap);
      controls.appendChild(bandSeg.wrap);
      controls.appendChild(develCtl.wrap);
      host.appendChild(controls);
      host.appendChild(readout);
      host.appendChild(Kit.el('p', {
        class: 'hint',
        html: '剖面圖的高度有<b>刻意放大</b>，不然三千公尺的山在這個寬度上只有幾個像素，看不出來。'
      }));

      paint();
      return null;
    },

    parentGuide: [
      { ask: '「臺灣的五大地形是哪五個？」', why: '山地、丘陵、台地、平原、盆地。切到剖面圖，從西到東指一遍比背順口溜有效。' },
      { ask: '「臺灣是平地多還是山地多？」', why: '山地、丘陵、台地加起來約三分之二。這解釋了為什麼人口都擠在西部平原。' },
      { ask: '「為什麼城市和工廠都在西部？」', why: '因為西部有大片平原，東部山逼到海邊沒有平地。地形決定了人住哪裡。' },
      { ask: '「茶為什麼種在丘陵和台地，不種在平原？」', why: '丘陵台地排水好、坡度和緩，適合茶樹。順便可以連回第三單元「北部出口茶」。' },
      { ask: '「西岸和東岸的海邊，哪裡比較適合蓋大港？」', why: '西岸。東岸雖然水深，但腹地太小、平地太少。' },
      { ask: '「鹽田為什麼在西南部，不在東部？」', why: '因為西南部冬天雨少、日照強、風大，蒸發快。這題把地形、氣候、產業三件事串起來。' },
      { ask: '把開發滑桿拉到 90%，問「這樣好不好？」', why: '沒有標準答案。目的是讓他練習說出「得到什麼、失去什麼」，而不是選邊站。' },
      { ask: '「我們住的地方，五十年前長什麼樣子？」', why: '可以問長輩或找老照片。課綱要的正是「土地利用反映過去和現在的環境變遷」。' }
    ],

    pitfalls: [
      { bad: '以為臺灣平原面積最大。', fix: '正好相反。<b>山地、丘陵、台地加起來約佔三分之二</b>，平原和盆地約三分之一。也因為平地少，才會這麼擁擠。', src: 'Ab-Ⅲ-3' },
      { bad: '以為東部沒有大港是因為「沒有人想蓋」。', fix: '主因是<b>地形</b>：東岸山直接逼到海邊，缺乏大片平地當腹地，不利於大港與城市發展。' },
      { bad: '以為鹽田要靠「海水比較鹹」的地方。', fix: '關鍵是<b>天氣</b>——要雨少、日照強、風大，海水才蒸發得快。所以鹽田集中在<b>西南部沿海</b>（七股、布袋）。' },
      { bad: '把台地和平原當成同一件事。', fix: '<b>台地</b>地勢比平原高、四周有明顯落差，排水好，適合種茶和鳳梨；<b>平原</b>低平，是農田和城市的主要所在。' },
      { bad: '以為「開發」和「保護」一定要選一邊。', fix: '課本要的是<b>權衡</b>：說得出各自的好處與代價，再一起找折衷方案（例如集中開發、保留濕地、做環境影響評估）。', src: 'Ca-Ⅲ-2' },
      { bad: '以為都市化只有好處，沒有代價。', fix: '都市化與工業化會帶來工作和方便，也會造成<b>空氣與水污染、農地與棲地減少、淹水風險升高</b>。', src: 'Ca-Ⅲ-1' }
    ],

    quizCount: 5,
    quiz: function () {
      const type = Kit.pick(['five', 'ratio', 'order', 'use', 'use', 'coast', 'salt', 'port', 'devel', 'urban', 'future', 'westPop']);

      if (type === 'five') {
        const o = pick4('山地、丘陵、台地、平原、盆地',
          ['山地、沙漠、台地、平原、盆地', '高原、丘陵、台地、平原、峽谷', '山地、丘陵、冰原、平原、盆地']);
        return {
          q: '臺灣的<b>五大地形</b>是哪五種？',
          choices: o.choices, answer: o.answer,
          steps: '五大地形是<b>山地、丘陵、台地、平原、盆地</b>。<br>' +
            '臺灣沒有沙漠、冰原這些地形。看上面的剖面圖，從西到東就是平原 → 台地 → 丘陵 → 山地。'
        };
      }

      if (type === 'ratio') {
        const o = pick4('約三分之二', ['約三分之一', '約十分之一', '幾乎沒有']);
        return {
          q: '臺灣的<b>山地、丘陵和台地</b>加起來，大約佔全島面積的多少？',
          choices: o.choices, answer: o.answer,
          steps: '山地、丘陵、台地加起來<b>約佔三分之二</b>，平原和盆地約佔三分之一。<br>' +
            '正因為平地少，人口、城市和工廠才會全部擠在<b>西部平原</b>。'
        };
      }

      if (type === 'order') {
        const o = shuffled([
          { t: '平原 → 台地 → 丘陵 → 山地', ok: true },
          { t: '山地 → 丘陵 → 台地 → 平原' },
          { t: '台地 → 平原 → 山地 → 丘陵' },
          { t: '丘陵 → 山地 → 平原 → 台地' }
        ]);
        return {
          q: '從臺灣<b>西部海邊往內陸（往東）</b>走，地形依序會是？',
          choices: o.choices, answer: o.answer,
          steps: '西邊靠海是<b>平原</b>，往內陸地勢逐漸升高：<b>台地 → 丘陵 → 山地</b>（中央山脈）。<br>' +
            '再往東還有花東<b>縱谷</b>和<b>海岸山脈</b>，然後就是太平洋。<br>' +
            '看上面的剖面圖，就是一路升高再降下去。'
        };
      }

      if (type === 'use') {
        const cases = [
          { l: '平原', a: '農田、都市與工廠', w: ['高山森林', '曬鹽場', '滑雪場'] },
          { l: '丘陵和台地', a: '茶園、果園', w: ['稻田為主', '大型港口', '深海漁場'] },
          { l: '山地', a: '森林，也是重要的水源地', w: ['大型都市', '鹽田', '機場'] },
          { l: '花東縱谷', a: '稻田與聚落', w: ['沙漠', '大型工業區', '滑雪場'] }
        ];
        const c = Kit.pick(cases);
        const o = pick4(c.a, c.w);
        return {
          q: '臺灣的<b>' + c.l + '</b>主要拿來做什麼？',
          choices: o.choices, answer: o.answer,
          steps: '<b>' + c.l + '</b>主要是<b>' + c.a + '</b>。<br>' +
            '平原地平土肥 → 農田與城市；台地丘陵排水好、坡度緩 → 茶和水果；山地又高又陡 → 森林與水源；縱谷是山中的長條平地 → 稻田與聚落。<br>' +
            '看上面「地形剖面」模式，點各地形帶就有說明。'
        };
      }

      if (type === 'coast') {
        const west = Math.random() < .5;
        const o = pick4(west ? '沙岸，坡度緩、有沙灘和潟湖' : '岩岸，海岸陡、水深、平地少',
          [west ? '岩岸，海岸陡、水深、平地少' : '沙岸，坡度緩、有沙灘和潟湖',
            '整年結冰的冰岸', '全部都是懸崖，完全沒有海灘']);
        return {
          q: '臺灣<b>' + (west ? '西部' : '東部') + '</b>的海岸主要是什麼樣子？',
          choices: o.choices, answer: o.answer,
          steps: '<b>西部是沙岸</b>：海底坡度緩、有沙灘和潟湖，適合養殖、曬鹽，也蓋得下大港與沿海工業區。<br>' +
            '<b>東部是岩岸</b>：山直接逼到海邊，海岸陡、水深、平地少，以觀光為主。<br>' +
            '所以' + (west ? '西部' : '東部') + '是' + (west ? '沙岸' : '岩岸') + '。'
        };
      }

      if (type === 'salt') {
        const which = Math.random() < .5;
        if (which) {
          const o = pick4('西南部沿海（如七股、布袋）', ['東部沿海（如花蓮）', '北部沿海（如基隆）', '中央山脈上']);
          return {
            q: '臺灣的<b>鹽田</b>主要分布在哪裡？',
            choices: o.choices, answer: o.answer,
            steps: '鹽田集中在<b>西南部沿海</b>，例如臺南七股、嘉義布袋。<br>' +
              '因為那裡冬天<b>雨少、日照強、風大</b>，海水蒸發得快，才曬得出鹽。<br>' +
              '東部和北部雨多，不適合曬鹽。'
          };
        }
        const o = shuffled([
          { t: '雨少、日照強、風大，海水蒸發快', ok: true },
          { t: '那裡的海水特別鹹' },
          { t: '那裡的海比較深' },
          { t: '那裡冬天會下雪' }
        ]);
        return {
          q: '西南部沿海適合<b>曬鹽</b>，最主要的原因是什麼？',
          choices: o.choices, answer: o.answer,
          steps: '曬鹽靠的是<b>把水蒸發掉</b>，所以要<b>雨少、日照強、風大</b>的天氣。<br>' +
            '西南部冬天吹東北季風時剛好在背風面，是乾季，正合適。<br>' +
            '海水的鹹度全臺灣差不多，不是關鍵。'
        };
      }

      if (type === 'port') {
        const o = shuffled([
          { t: '東岸山逼近海邊，缺乏大片平地當腹地', ok: true },
          { t: '東岸的海水太淺，船進不來' },
          { t: '東岸沒有人居住' },
          { t: '法律規定東岸不能蓋港口' }
        ]);
        return {
          q: '臺灣的大港（基隆、高雄）都在西部和北部，<b>東部</b>為什麼沒有大港？',
          choices: o.choices, answer: o.answer,
          steps: '東岸是<b>岩岸</b>，山直接逼到海邊，水雖然深，但<b>缺乏大片平地</b>當作港口的腹地（倉庫、道路、市區）。<br>' +
            '港口不只要能停船，還要有地方堆貨和運輸，所以平地很關鍵。<br>' +
            '這是「自然環境影響生活空間使用」的典型例子。'
        };
      }

      if (type === 'devel') {
        const o = shuffled([
          { t: '森林和濕地變少，污染和淹水風險增加', ok: true },
          { t: '森林會自動變多' },
          { t: '完全不會影響環境' },
          { t: '空氣會變得更乾淨' }
        ]);
        return {
          q: '一個地方<b>都市化和工業化</b>之後，環境通常會發生什麼變化？',
          choices: o.choices, answer: o.answer,
          steps: '土地從森林、濕地變成道路、房子和工廠，會造成<b>棲地減少、空氣與水污染、淹水風險升高</b>。<br>' +
            '同時也帶來工作機會和生活的方便——所以這是<b>有得有失</b>的事。<br>' +
            '把上面的開發滑桿拉到 90％ 看一次，兩邊的字會一起變。'
        };
      }

      if (type === 'urban') {
        const o = shuffled([
          { t: '兩邊的好處和代價都要想清楚，再一起找折衷的做法', ok: true },
          { t: '一定要全部開發，經濟最重要' },
          { t: '一定要完全不開發，環境最重要' },
          { t: '交給別人決定，跟自己沒關係' }
        ]);
        return {
          q: '遇到「要開發還是要保護」的問題，課本希望我們怎麼想？',
          choices: o.choices, answer: o.answer,
          steps: '這種問題<b>沒有標準答案</b>，重點是<b>權衡</b>：說得出開發會得到什麼（工作、住宅、方便），' +
            '也說得出會失去什麼（森林、濕地、乾淨的水），再一起討論折衷方案。<br>' +
            '例如集中開發、保留濕地、先做環境影響評估，都是折衷的做法。'
        };
      }

      if (type === 'future') {
        const o = shuffled([
          { t: '看一個地方的土地怎麼用，就看得出它過去發生過什麼、未來想變成什麼樣子', ok: true },
          { t: '土地利用從古到今都沒有改變過' },
          { t: '土地利用只跟現在有關，和過去無關' },
          { t: '土地利用是隨機決定的' }
        ]);
        return {
          q: '課綱說「土地利用反映過去和現在的環境變遷，以及對未來的展望」，這句話的意思是？',
          choices: o.choices, answer: o.answer,
          steps: '一塊地現在是農田、工廠還是公園，是<b>過去一連串選擇累積下來的結果</b>，' +
            '而現在怎麼規劃，又會決定未來的樣子。<br>' +
            '可以問問長輩：我們家附近五十年前長什麼樣子？答案往往很驚人。'
        };
      }

      // why西：人口為何集中西部
      const o = shuffled([
        { t: '西部有大片平原，地平、土肥、交通方便', ok: true },
        { t: '西部比較涼快' },
        { t: '東部禁止人居住' },
        { t: '西部離北回歸線比較遠' }
      ]);
      return {
        q: '臺灣的人口和城市為什麼大多集中在<b>西部</b>？',
        choices: o.choices, answer: o.answer,
        steps: '因為<b>西部有大片平原</b>：地勢平坦、土壤肥沃、容易蓋房子和修路。<br>' +
          '東部被中央山脈和海岸山脈夾住，平地非常少，發展空間有限。<br>' +
          '一句話：<b>平地在哪裡，人就在哪裡。</b>'
      };
    }
  });

})();
