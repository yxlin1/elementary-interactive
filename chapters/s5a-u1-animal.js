/* ============================================================
   五上 自然（康軒）第 1 單元　動物世界
   依大橋國小 115 學年度課程計畫，本單元三個活動：
     活動一 動物如何求生存
       覓食行為、身體構造與食物類型的關係／不同動物調節體溫的方法／
       遷移行為對生存的幫助／保護自己、禦敵或避敵
     活動二 動物具有社會行為嗎
       不同動物傳遞訊息的方法／動物具有分工合作的社會行為
     活動三 動物如何延續生命
       動物的繁殖行為／繁殖方式（卵生、胎生）／
       子代與親代的性狀具有相似性和相異性
   課綱 INb-Ⅲ-6 / INe-Ⅲ-11 / INd-Ⅲ-4
   ============================================================ */

Kit.register('s5a-u1', {

  intro: '三個模式對應課本三個活動。<b>求生存</b>裡再切換嘴巴、牙齒、體溫、禦敵四個主題——每一種構造都在解決一個生存問題。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 330);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'survive', sub = 'beak', pick = 0, t = 0, raf = null;

    /* ---------- 活動一：求生存 ---------- */
    const BEAKS = [
      { n: '尖銳鉤狀', bird: '老鷹', food: '肉（撕開獵物）', col: '#c9a227',
        draw: (x, y, s) => [[0, 0], [1.7, .25], [1.5, .75], [1.15, .62], [0, .55]].map(p => [x + p[0] * s, y + p[1] * s]) },
      { n: '細長尖細', bird: '啄木鳥／白鷺鷥', food: '樹幹裡的蟲、水裡的魚', col: '#8d9db6',
        draw: (x, y, s) => [[0, .18], [2.3, .34], [2.3, .42], [0, .55]].map(p => [x + p[0] * s, y + p[1] * s]) },
      { n: '短而厚', bird: '麻雀', food: '穀物、種子（壓碎）', col: '#a1887f',
        draw: (x, y, s) => [[0, .1], [.95, .38], [0, .62]].map(p => [x + p[0] * s, y + p[1] * s]) },
      { n: '扁平寬闊', bird: '鴨子', food: '水中的小生物（濾食）', col: '#f0a202',
        draw: (x, y, s) => [[0, .12], [1.9, .2], [2, .5], [1.85, .6], [0, .6]].map(p => [x + p[0] * s, y + p[1] * s]) }
    ];
    const TEETH = [
      { n: '肉食性', ex: '老虎、狼', feat: '<b>犬齒</b>特別長而尖（咬住、撕開肉），臼齒像剪刀', col: '#fb7185' },
      { n: '草食性', ex: '牛、羊、兔', feat: '<b>門齒</b>寬扁（切斷草），<b>臼齒</b>寬大平坦（磨碎），幾乎沒有犬齒', col: '#7cb342' },
      { n: '雜食性', ex: '人、熊、豬', feat: '三種牙齒<b>都有</b>，所以什麼都吃得下', col: '#fbbf24' }
    ];
    const TEMP = [
      { n: '恆溫動物', ex: '鳥類、哺乳類（麻雀、狗、人）', col: '#fb7185',
        how: '體溫<b>幾乎固定不變</b>，靠身體自己產熱與散熱：發抖產熱、流汗／喘氣散熱、豎起毛髮保暖。',
        cost: '需要吃很多東西提供能量，但天冷時仍能活動。' },
      { n: '變溫動物', ex: '魚類、兩生類、爬蟲類（青蛙、蜥蜴、蛇）', col: '#60a5fa',
        how: '體溫<b>隨環境改變</b>，靠行為調節：曬太陽升溫、躲陰影或泡水降溫。',
        cost: '吃得少很省能量，但天冷時行動變慢，甚至要冬眠。' }
    ];
    const DEFEND = [
      { n: '保護色', ex: '枯葉蝶、變色龍、比目魚', how: '體色和環境幾乎一樣，讓敵人<b>看不見</b>。' },
      { n: '擬態', ex: '竹節蟲（像樹枝）、食蚜蠅（像蜜蜂）', how: '長得<b>像別的東西</b>——像不能吃的枯枝，或像有毒的動物。' },
      { n: '硬殼與棘刺', ex: '烏龜、穿山甲、刺蝟、海膽', how: '身體外面有<b>硬的保護層</b>，敵人咬不下去。' },
      { n: '斷尾逃生', ex: '壁虎', how: '尾巴斷掉還會扭動<b>吸引敵人注意</b>，本體趁機逃走。' },
      { n: '噴液與臭味', ex: '烏賊噴墨、臭鼬、椿象', how: '噴出讓敵人<b>看不見或受不了</b>的東西再逃。' },
      { n: '裝死', ex: '負鼠、部分甲蟲', how: '很多掠食者<b>只吃活的</b>，裝死就躲過一劫。' },
      { n: '成群結隊', ex: '沙丁魚、斑馬、椋鳥', how: '一大群一起行動，讓敵人<b>難以鎖定</b>單一目標。' }
    ];

    /* ---------- 活動二：社會行為 ---------- */
    const SOCIAL = [
      { n: '蜜蜂的舞蹈', kind: '訊息傳遞', col: '#fbbf24',
        how: '找到蜜源的工蜂回巢跳「<b>8 字舞</b>」。舞蹈的<b>方向</b>告訴同伴蜜源在太陽的哪一邊，' +
          '<b>擺動的時間長短</b>告訴同伴有多遠。',
        pt: '用「動作」傳遞相當精確的位置訊息。' },
      { n: '螞蟻的氣味路徑', kind: '訊息傳遞', col: '#8d6e63',
        how: '找到食物的螞蟻回巢時沿路留下<b>費洛蒙</b>（一種氣味）。其他螞蟻聞到就跟著走，' +
          '走的螞蟻越多、氣味越濃，路線就越明顯。',
        pt: '用「氣味」傳遞，而且會自己越走越清楚。' },
      { n: '鳥類的鳴叫', kind: '訊息傳遞', col: '#4da3ff',
        how: '不同的叫聲代表不同意思：<b>宣告地盤</b>、<b>吸引配偶</b>、<b>警告危險</b>。' +
          '很多鳥看到老鷹會發出特定的警戒聲，整群立刻躲起來。',
        pt: '用「聲音」傳遞，可以傳很遠。' },
      { n: '蜜蜂與螞蟻的分工', kind: '分工合作', col: '#f0a202',
        how: '一個蜂巢或蟻窩就像一座工廠：<b>蜂后／蟻后</b>負責產卵，<b>工蜂／工蟻</b>採蜜、育幼、清潔、守衛，' +
          '各做各的事，整個群體才活得下去。',
        pt: '這叫<b>社會性昆蟲</b>，是分工合作最極端的例子。' },
      { n: '狼群的合作狩獵', kind: '分工合作', col: '#90a4ae',
        how: '狼群圍捕獵物時會分成<b>驅趕</b>和<b>埋伏</b>兩組，靠叫聲和動作配合。' +
          '一隻狼抓不到的大型獵物，一群狼就抓得到。',
        pt: '合作讓牠們吃得到單獨辦不到的食物。' },
      { n: '企鵝的輪流取暖', kind: '分工合作', col: '#b0bec5',
        how: '南極的皇帝企鵝會擠成一大團，<b>外圈的和內圈的定時輪換</b>，讓每一隻都有機會待在溫暖的中心。',
        pt: '不是誰犧牲，是輪流——群體一起活下來。' }
    ];

    /* ---------- 活動三：延續生命 ---------- */
    const REPRO = [
      { n: '卵生', ex: '雞、青蛙、魚、蛇、昆蟲', col: '#fbbf24',
        how: '母親把<b>卵</b>產在體外，小動物在卵裡發育，時間到了破殼（或破膜）而出。',
        num: '通常一次產<b>很多</b>卵——因為在體外容易被吃掉或壞掉，' +
          '存活率低就用數量補（青蛙一次可以產上千顆）。' },
      { n: '胎生', ex: '狗、貓、牛、鯨魚、人', col: '#fb7185',
        how: '小動物在<b>母體內</b>發育，靠母親提供養分，發育得差不多才生出來。',
        num: '通常一次生<b>很少</b>隻，但在母體內比較安全，出生後多半還有親代照顧，存活率高。' }
    ];

    /* ================= 繪圖 ================= */
    function drawBeaks() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('鳥的嘴巴（喙）長什麼樣子，看牠吃什麼就知道——構造和食物是配合的', 16, 22);
      BEAKS.forEach((b, i) => {
        const x = 40 + (i % 2) * 300, y = 62 + Math.floor(i / 2) * 130;
        const on = pick === i;
        ctx.fillStyle = on ? 'rgba(251,191,36,.12)' : '#141d31';
        ctx.fillRect(x - 12, y - 12, 272, 110);
        ctx.strokeStyle = on ? '#fbbf24' : '#26355a'; ctx.lineWidth = on ? 2.5 : 1;
        ctx.strokeRect(x - 12, y - 12, 272, 110);
        // 頭
        ctx.fillStyle = '#5a6b8c';
        ctx.beginPath(); ctx.arc(x + 26, y + 40, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b1220';
        ctx.beginPath(); ctx.arc(x + 34, y + 32, 4, 0, Math.PI * 2); ctx.fill();
        // 喙
        const pts = b.draw(x + 48, y + 22, 38);
        ctx.beginPath();
        pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.closePath();
        ctx.fillStyle = b.col; ctx.fill();
        ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = on ? '#fbbf24' : '#e8eefc';
        ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(b.bird, x + 4, y + 72);
      });
      const b = BEAKS[pick];
      readout.innerHTML =
        '<div class="big">' + b.bird + '　喙型：<b>' + b.n + '</b></div>' +
        '吃什麼：<b>' + b.food + '</b><br>' +
        '<span style="color:var(--muted)">課綱 INb-Ⅲ-6：「動物的形態特徵與行為相關，動物身體的構造不同，有不同的運動方式。」<br>' +
        '看到一種沒見過的鳥，先看牠的嘴：<b>鉤的吃肉、細長的抓蟲抓魚、短厚的壓種子、扁平的濾水中小生物</b>。' +
        '構造不是隨機的，是被牠吃的東西「決定」的。</span>';
    }

    function drawTeeth() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('牙齒也一樣——看牙齒的形狀就知道牠吃肉還是吃草', 16, 22);
      TEETH.forEach((tt, i) => {
        const y = 52 + i * 88, on = pick === i;
        ctx.fillStyle = on ? 'rgba(251,191,36,.10)' : '#141d31';
        ctx.fillRect(30, y, 560, 76);
        ctx.strokeStyle = on ? '#fbbf24' : '#26355a'; ctx.lineWidth = on ? 2.5 : 1;
        ctx.strokeRect(30, y, 560, 76);
        // 畫一排牙
        const bx = 48, by = y + 46;
        for (let k = 0; k < 12; k++) {
          const x = bx + k * 24;
          let w = 12, h = 20;
          if (i === 0) { h = (k === 2 || k === 9) ? 34 : (k < 2 || k > 9 ? 16 : 22); w = (k === 2 || k === 9) ? 10 : 13; }
          if (i === 1) { h = k < 4 || k > 7 ? 22 : 16; w = k < 4 || k > 7 ? 16 : 20; }
          if (i === 2) { h = (k === 2 || k === 9) ? 26 : 20; w = 14; }
          ctx.fillStyle = '#e8eefc';
          ctx.beginPath();
          ctx.moveTo(x, by); ctx.lineTo(x + w, by);
          ctx.lineTo(x + w - 2, by - h); ctx.lineTo(x + 2, by - h);
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = tt.col; ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(tt.n + '　' + tt.ex, 350, y + 14);
      });
      const tt = TEETH[pick];
      readout.innerHTML =
        '<div class="big">' + tt.n + '（' + tt.ex + '）</div>' + tt.feat + '<br>' +
        '<span style="color:var(--muted)">三種牙齒的分工：<b>門齒</b>切斷、<b>犬齒</b>撕咬、<b>臼齒</b>磨碎。' +
        '吃什麼，就長出適合的牙齒組合。</span>';
    }

    function drawTemp() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('環境溫度一整天上上下下，兩類動物的體溫反應完全不同', 16, 22);
      const bx = 60, by = 56, bw = 500, bh = 190;
      ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
      // 環境溫度曲線
      function curve(f, col, w, dash) {
        ctx.save(); if (dash) ctx.setLineDash(dash);
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
        for (let k = 0; k <= 100; k++) {
          const x = bx + bw * k / 100, v = f(k / 100);
          const y = by + bh * (1 - (v - 5) / 40);
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke(); ctx.restore();
      }
      const env = u => 18 + 14 * Math.sin((u - .25) * Math.PI * 2);
      curve(env, '#93a3c4', 2, [5, 4]);
      curve(() => 37, '#fb7185', 3);
      curve(u => env(u) + 1.5, '#60a5fa', 3);
      // 標籤
      ctx.font = '12px "Microsoft JhengHei", sans-serif'; ctx.textAlign = 'left';
      ctx.fillStyle = '#93a3c4'; ctx.textBaseline = 'middle';
      ctx.fillText('環境溫度（虛線）', bx + 8, by + bh * (1 - (32 - 5) / 40) - 14);
      ctx.fillStyle = '#fb7185'; ctx.fillText('恆溫動物 約 37°C 不變', bx + 8, by + bh * (1 - (37 - 5) / 40) - 12);
      ctx.fillStyle = '#60a5fa'; ctx.fillText('變溫動物 跟著環境走', bx + 300, by + bh * (1 - (env(.75) - 5) / 40) + 16);
      ctx.fillStyle = '#5a6b8c'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ['清晨', '中午', '傍晚', '深夜'].forEach((L, k) =>
        ctx.fillText(L, bx + bw * (k + .5) / 4, by + bh + 8));
      TEMP.forEach((T, i) => {
        const on = pick === i;
        ctx.fillStyle = on ? T.col : '#3a4c73';
        ctx.fillRect(bx + i * 250, by + bh + 34, 240, 6);
      });
      const T = TEMP[pick];
      readout.innerHTML =
        '<div class="big">' + T.n + '（' + T.ex + '）</div>' +
        T.how + '<br>代價與好處：' + T.cost + '<br>' +
        '<span style="color:var(--muted)">⚠️ 「變溫」<b>不等於「冷血」</b>——大熱天曬過太陽的蜥蜴，體溫可能比你還高。' +
        '正確的說法是體溫<b>會隨環境改變</b>。</span>';
    }

    function drawDefend() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('動物保護自己的方法，大致分成這幾類（點按鈕切換）', 16, 22);
      DEFEND.forEach((d, i) => {
        const x = 26 + (i % 2) * 292, y = 48 + Math.floor(i / 2) * 68;
        const on = pick === i;
        ctx.fillStyle = on ? 'rgba(52,211,153,.14)' : '#141d31';
        ctx.fillRect(x, y, 276, 58);
        ctx.strokeStyle = on ? '#34d399' : '#26355a'; ctx.lineWidth = on ? 2.5 : 1;
        ctx.strokeRect(x, y, 276, 58);
        ctx.fillStyle = on ? '#34d399' : '#e8eefc';
        ctx.font = 'bold 15px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(d.n, x + 12, y + 9);
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.fillText(d.ex, x + 12, y + 32);
      });
      const d = DEFEND[pick];
      readout.innerHTML = '<div class="big">' + d.n + '　例：' + d.ex + '</div>' + d.how +
        '<br><span style="color:var(--muted)">另外還有<b>遷移</b>：像候鳥飛到溫暖的地方過冬、鮭魚回到出生的河流產卵——' +
        '不是躲敵人，是躲開<b>不適合生存的季節</b>，同樣是求生存的方法。</span>';
    }

    function drawSocial() {
      const ctx = cv.ctx;
      const S = SOCIAL[pick];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('動物之間怎麼「講話」、怎麼分工——這就是社會行為', 16, 22);

      const cx = 300, cy = 165;
      if (pick === 0) {          // 蜜蜂 8 字舞
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k <= 160; k++) {
          const u = k / 160 * Math.PI * 2;
          const x = cx + Math.sin(u) * 70, y = cy + Math.sin(u * 2) * 48;
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        const u = (t * .8) % (Math.PI * 2);
        ctx.fillStyle = '#f0a202';
        ctx.beginPath(); ctx.ellipse(cx + Math.sin(u) * 70, cy + Math.sin(u * 2) * 48, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy + 48); ctx.lineTo(cx, cy - 48); ctx.stroke();
        ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('中間這段的方向 = 蜜源相對太陽的方向', cx + 84, cy - 30);
        ctx.fillText('擺動時間越久 = 距離越遠', cx + 84, cy + 6);
      } else if (pick === 1) {   // 螞蟻費洛蒙
        ctx.strokeStyle = 'rgba(141,110,99,.5)'; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(90, 250);
        ctx.bezierCurveTo(210, 90, 380, 250, 520, 120); ctx.stroke();
        for (let k = 0; k < 12; k++) {
          const u = ((t * .1 + k / 12) % 1);
          const p = bez(u);
          ctx.fillStyle = '#5d4037';
          ctx.beginPath(); ctx.ellipse(p[0], p[1], 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        }
        function bez(u) {
          const p0 = [90, 250], p1 = [210, 90], p2 = [380, 250], p3 = [520, 120], m = 1 - u;
          return [m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0],
                  m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1]];
        }
        ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('蟻窩', 90, 262); ctx.fillText('食物', 520, 132);
        ctx.fillStyle = '#a1887f'; ctx.fillText('棕色路徑 = 費洛蒙氣味，走的螞蟻越多就越濃', 300, 288);
      } else {
        // 其餘：畫同心圓波（聲音）或群體示意
        if (pick === 2) {
          for (let k = 0; k < 4; k++) {
            const r = 30 + ((t * 40 + k * 45) % 180);
            ctx.strokeStyle = 'rgba(77,163,255,' + Math.max(0, .6 - r / 300) + ')';
            ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx - 120, cy, r, -1, 1); ctx.stroke();
          }
          ctx.fillStyle = '#4da3ff';
          ctx.beginPath(); ctx.arc(cx - 120, cy, 16, 0, Math.PI * 2); ctx.fill();
        } else {
          const n = pick === 5 ? 26 : 12;
          for (let k = 0; k < n; k++) {
            const a = k / n * Math.PI * 2, r = pick === 5 ? (k % 2 ? 52 : 88) : 78;
            ctx.fillStyle = S.col;
            ctx.globalAlpha = pick === 5 && k % 2 ? 1 : .75;
            ctx.beginPath();
            ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .7, 13, 17, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.globalAlpha = 1;
          }
          if (pick === 5) {
            ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('內圈溫暖', cx, cy);
          }
        }
      }
      ctx.fillStyle = S.col; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(S.n + '　【' + S.kind + '】', 20, 292);

      readout.innerHTML =
        '<div class="big">' + S.n + '　<span style="color:' + S.col + '">' + S.kind + '</span></div>' +
        S.how + '<br><b>重點</b>：' + S.pt + '<br>' +
        '<span style="color:var(--muted)">課綱 INe-Ⅲ-11：「動物有<b>覓食、生殖、保護、訊息傳遞以及社會性</b>的行為。」<br>' +
        '傳遞訊息的三種主要方式：<b>動作</b>（蜜蜂舞蹈）、<b>氣味</b>（螞蟻費洛蒙）、<b>聲音</b>（鳥鳴、狼嚎）。</span>';
    }

    function drawRepro() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('動物靠繁殖延續下一代。兩種主要方式，各有各的生存策略', 16, 22);
      REPRO.forEach((R, i) => {
        const x = 30 + i * 292, on = pick === i;
        ctx.fillStyle = on ? 'rgba(251,191,36,.10)' : '#141d31';
        ctx.fillRect(x, 44, 268, 210);
        ctx.strokeStyle = on ? R.col : '#26355a'; ctx.lineWidth = on ? 2.5 : 1;
        ctx.strokeRect(x, 44, 268, 210);
        ctx.fillStyle = on ? R.col : '#93a3c4';
        ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(R.n, x + 134, 58);
        if (i === 0) {                       // 一堆蛋
          for (let k = 0; k < 18; k++) {
            const cxk = x + 40 + (k % 6) * 38, cyk = 116 + Math.floor(k / 6) * 44;
            ctx.fillStyle = '#f5e6c8';
            ctx.beginPath(); ctx.ellipse(cxk, cyk, 13, 17, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.fillText('一次很多顆', x + 134, 232);
        } else {                             // 母體內一兩隻
          ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(x + 134, 150, 78, 58, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(251,113,133,.14)'; ctx.fill();
          [[-24, 6], [24, -6]].forEach(([dx, dy]) => {
            ctx.fillStyle = '#f8b4c0';
            ctx.beginPath(); ctx.ellipse(x + 134 + dx, 150 + dy, 20, 24, .3, 0, Math.PI * 2); ctx.fill();
          });
          ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
          ctx.fillText('在母體內發育，一次很少隻', x + 134, 232);
        }
      });
      const R = REPRO[pick];
      readout.innerHTML =
        '<div class="big">' + R.n + '（' + R.ex + '）</div>' + R.how + '<br>' + R.num + '<br>' +
        '<span style="color:var(--muted)">課綱 INd-Ⅲ-4：「生物個體間的性狀具有<b>差異性</b>；' +
        '子代與親代的性狀具有<b>相似性和相異性</b>。」<br>' +
        '小狗長得像爸媽（相似），但每一隻的花色又不完全一樣（相異）——' +
        '同一窩兄弟姊妹彼此也有差別。這種差異讓物種比較能適應環境變化。</span>';
    }

    function paint() {
      // 切換模式／主題時，各清單長度不同。若殘留的索引超出新清單範圍
      // （例如從 7 個禦敵方式切到只有 2 項的繁殖方式），取值會是 undefined。
      // 這裡統一夾限，任何進入點都安全。
      pick = Math.max(0, Math.min(pick, maxPick() - 1));
      cv.clear('#0e1726');
      if (mode === 'survive') {
        if (sub === 'beak') drawBeaks();
        else if (sub === 'teeth') drawTeeth();
        else if (sub === 'temp') drawTemp();
        else drawDefend();
      } else if (mode === 'social') drawSocial();
      else drawRepro();
    }

    function loop() { t += 0.05; if (mode === 'social') paint(); raf = requestAnimationFrame(loop); }

    function maxPick() {
      if (mode === 'survive') return ({ beak: 4, teeth: 3, temp: 2, defend: DEFEND.length })[sub];
      if (mode === 'social') return SOCIAL.length;
      return REPRO.length;
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '① 動物如何求生存', value: 'survive' },
      { label: '② 動物具有社會行為嗎', value: 'social' },
      { label: '③ 動物如何延續生命', value: 'repro' }
    ], function (v) {
      mode = v; pick = 0;
      subSeg.wrap.style.display = v === 'survive' ? '' : 'none';
      rebuildPickSeg(); paint();
    }, mode);

    const subSeg = Kit.segmented('主題', [
      { label: '嘴巴與食物', value: 'beak' },
      { label: '牙齒與食性', value: 'teeth' },
      { label: '體溫調節', value: 'temp' },
      { label: '保護自己', value: 'defend' }
    ], function (v) { sub = v; pick = 0; rebuildPickSeg(); paint(); }, sub);

    const pickWrap = Kit.el('div', { class: 'ctl' });
    function rebuildPickSeg() {
      pickWrap.innerHTML = '';
      let items;
      if (mode === 'survive') {
        items = sub === 'beak' ? BEAKS.map(b => b.bird)
          : sub === 'teeth' ? TEETH.map(x => x.n)
            : sub === 'temp' ? TEMP.map(x => x.n)
              : DEFEND.map(x => x.n);
      } else if (mode === 'social') items = SOCIAL.map(x => x.n);
      else items = REPRO.map(x => x.n);
      const seg = Kit.segmented('選項', items.map((n, i) => ({ label: n, value: i })),
        function (v) { pick = v; paint(); }, 0);
      pickWrap.appendChild(seg.wrap);
    }

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(subSeg.wrap);
    controls.appendChild(pickWrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '整章的核心問題只有一個：<b>「這個構造／行為，在幫牠解決什麼生存問題？」</b>' +
        '看到任何動物的特徵都可以這樣問。'
    }));

    rebuildPickSeg();
    paint();
    loop();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '「老鷹的嘴和鴨子的嘴為什麼差那麼多？」', why: '因為吃的東西不一樣。鉤狀撕肉、扁平濾水。這一題建立整章的核心：<b>構造配合功能</b>。' },
    { ask: '看到任何動物就問：「牠的嘴／牙齒長這樣，你猜牠吃什麼？」', why: '把課本知識變成隨時可以玩的遊戲。動物園、水族館、甚至看影片都能問。' },
    { ask: '「青蛙是冷血動物嗎？」', why: '正確說法是<b>變溫動物</b>——體溫隨環境變。大太陽下的蜥蜴體溫可能比人還高，講「冷血」會誤導。' },
    { ask: '「蜜蜂怎麼告訴同伴蜜源在哪裡？」', why: '跳 8 字舞：方向告訴角度、擺動時間告訴距離。這是動物界最精巧的溝通之一，孩子通常會很驚訝。' },
    { ask: '「為什麼青蛙一次生上千顆卵，狗一次只生幾隻？」', why: '卵生在體外危險、存活率低，所以用<b>數量</b>；胎生在體內安全、又有親代照顧，所以用<b>品質</b>。兩種都是有效的策略。' },
    { ask: '看家裡或鄰居的寵物：「牠哪裡像爸媽？哪裡不一樣？」', why: '直接對應 INd-Ⅲ-4「子代與親代的性狀具有相似性和相異性」。用真實的例子最有感。' }
  ],

  pitfalls: [
    { bad: '說變溫動物是「冷血動物」，以為牠們的身體一定是冷的。', fix: '體溫<b>隨環境改變</b>而已。曬過太陽的蜥蜴體溫可能比你高。' },
    { bad: '以為「保護色」和「擬態」是同一件事。', fix: '<b>保護色</b>是顏色融入環境（枯葉蝶像枯葉的顏色）；<b>擬態</b>是長得像<b>另一種東西</b>（竹節蟲像樹枝、食蚜蠅假裝成蜜蜂）。' },
    { bad: '以為所有哺乳類都是胎生、所有卵生的都不照顧小孩。', fix: '鴨嘴獸是<b>卵生的哺乳類</b>；很多鳥和魚會細心護卵育幼。生物界的例外很多。' },
    { bad: '以為動物的行為是「牠想要」才那樣做。', fix: '這些行為是長期<b>適應環境</b>形成的。國小階段講「這樣做對生存有什麼幫助」就好，不用談意識。' },
    { bad: '把「社會行為」當成只有人類才有。', fix: '蜜蜂、螞蟻、狼群、企鵝都有明確的分工與訊息傳遞，這就是社會行為。', src: 'INe-Ⅲ-11' }
  ],

  quiz: function () {
    const type = Kit.pick(['beak', 'teeth', 'temp', 'defend', 'social', 'repro', 'inherit']);

    if (type === 'beak') {
      const items = [
        { a: '老鷹', f: '尖銳的鉤狀嘴，用來撕開肉' },
        { a: '鴨子', f: '扁平寬闊的嘴，用來濾食水中的小生物' },
        { a: '麻雀', f: '短而厚的嘴，用來壓碎種子' },
        { a: '啄木鳥', f: '細長尖尖的嘴，用來啄開樹幹抓蟲' }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle(items.map(x => x.a));
      return {
        q: '哪一種鳥的嘴是「<b>' + it.f + '</b>」？',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '嘴的形狀對應食物：<br>' + items.map(x => '<b>' + x.a + '</b>　' + x.f).join('<br>') +
          '<br><span style="color:var(--muted)">課綱 INb-Ⅲ-6：構造和牠的行為（覓食方式）是相關的。</span>'
      };
    }

    if (type === 'teeth') {
      const it = Kit.pick([
        { q: '牛和羊的<b>臼齒</b>寬大平坦，主要功能是什麼？', a: '把草磨碎', o: ['撕開肉', '咬住獵物', '啃樹皮打洞'] },
        { q: '老虎的<b>犬齒</b>特別長而尖，主要功能是什麼？', a: '咬住並撕開獵物的肉', o: ['磨碎草', '切斷樹枝', '過濾水'] },
        { q: '人的牙齒三種都有，代表人是什麼食性？', a: '雜食性', o: ['肉食性', '草食性', '濾食性'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>三種牙齒的分工：<br>' +
          '<b>門齒</b>——切斷（草食動物特別發達）<br>' +
          '<b>犬齒</b>——撕咬（肉食動物特別長）<br>' +
          '<b>臼齒</b>——磨碎（草食動物寬大平坦，肉食動物像剪刀）'
      };
    }

    if (type === 'temp') {
      const isConst = Math.random() < .5;
      const animal = isConst ? Kit.pick(['麻雀', '狗', '牛', '人']) : Kit.pick(['青蛙', '蜥蜴', '蛇', '金魚']);
      const opts = ['恆溫動物', '變溫動物'];
      return {
        q: '<b>' + animal + '</b>是恆溫動物還是變溫動物？',
        choices: opts, answer: isConst ? 0 : 1,
        steps: '<b>' + animal + ' 是' + opts[isConst ? 0 : 1] + '</b>。<br>' +
          '<b>恆溫動物</b>：鳥類、哺乳類。體溫幾乎固定，靠身體自己產熱散熱，天冷也能活動，但要吃很多。<br>' +
          '<b>變溫動物</b>：魚類、兩生類、爬蟲類。體溫隨環境變，靠曬太陽或躲陰影調節，吃得少但天冷會變遲鈍。<br>' +
          '<span style="color:var(--warn)">⚠️ 別說「冷血動物」——曬過太陽的蜥蜴體溫可能比人還高。</span>'
      };
    }

    if (type === 'defend') {
      const it = Kit.pick([
        { q: '<b>竹節蟲長得像樹枝</b>，這是哪一種保護方式？', a: '擬態', o: ['保護色', '斷尾逃生', '裝死'] },
        { q: '<b>壁虎的尾巴斷掉還會扭動</b>，作用是什麼？', a: '吸引敵人注意，本體趁機逃走', o: ['讓傷口不流血', '嚇跑敵人', '重新長出新身體'] },
        { q: '<b>枯葉蝶的翅膀顏色像枯葉</b>，這是哪一種保護方式？', a: '保護色', o: ['擬態', '硬殼', '成群結隊'] },
        { q: '<b>沙丁魚成千上萬聚成一大群</b>游動，對牠們有什麼好處？', a: '讓敵人難以鎖定單一目標', o: ['游得比較快', '比較溫暖', '容易找到食物'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '常見的保護方式：<b>保護色</b>（顏色融入環境）、<b>擬態</b>（長得像別的東西）、' +
          '<b>硬殼棘刺</b>、<b>斷尾逃生</b>、<b>噴液臭味</b>、<b>裝死</b>、<b>成群結隊</b>。<br>' +
          '<span style="color:var(--muted)">保護色 vs 擬態：前者是<b>顏色</b>像環境，後者是<b>樣子</b>像另一種東西。</span>'
      };
    }

    if (type === 'social') {
      const it = Kit.pick([
        { q: '蜜蜂跳「8 字舞」是為了告訴同伴什麼？', a: '蜜源的方向和距離', o: ['危險來了', '該回巢了', '蜂后在哪裡'] },
        { q: '螞蟻沿路留下<b>費洛蒙</b>，是用什麼在傳遞訊息？', a: '氣味', o: ['聲音', '動作', '顏色'] },
        { q: '南極的皇帝企鵝擠成一團並且<b>內外圈輪流交換</b>，為什麼？', a: '讓每一隻都有機會待在溫暖的中心', o: ['決定誰當首領', '在找食物', '在保護蛋不被偷'] },
        { q: '狼群分成「驅趕」和「埋伏」兩組獵捕，這叫什麼？', a: '分工合作的社會行為', o: ['保護色', '遷移行為', '變溫行為'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '動物傳遞訊息的三種主要方式：<b>動作</b>（蜜蜂舞蹈）、<b>氣味</b>（螞蟻費洛蒙）、<b>聲音</b>（鳥鳴、狼嚎）。<br>' +
          '分工合作的例子：蜂后與工蜂、蟻后與工蟻、狼群獵捕、企鵝輪流取暖。'
      };
    }

    if (type === 'repro') {
      const isEgg = Math.random() < .5;
      const a = isEgg ? Kit.pick(['青蛙', '雞', '蛇', '金魚', '蝴蝶']) : Kit.pick(['狗', '貓', '牛', '鯨魚', '蝙蝠']);
      const opts = ['卵生', '胎生'];
      return {
        q: '<b>' + a + '</b>的繁殖方式是卵生還是胎生？',
        choices: opts, answer: isEgg ? 0 : 1,
        steps: '<b>' + a + ' 是' + opts[isEgg ? 0 : 1] + '</b>。<br>' +
          '<b>卵生</b>：把卵產在體外（雞、青蛙、魚、蛇、昆蟲）。體外危險、存活率低，所以通常一次產<b>很多</b>。<br>' +
          '<b>胎生</b>：小動物在母體內發育（狗、貓、牛、鯨魚、人）。比較安全又有親代照顧，所以一次生<b>很少</b>。<br>' +
          '<span style="color:var(--muted)">例外：鴨嘴獸是<b>卵生的哺乳類</b>。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '既有相似的地方，也有不一樣的地方', ok: true },
      { t: '完全一模一樣', ok: false },
      { t: '完全不一樣', ok: false },
      { t: '只有公的才會像爸爸', ok: false }
    ]);
    return {
      q: '小狗和牠的爸媽比較，性狀（特徵）會是什麼情形？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '課綱 INd-Ⅲ-4：「生物個體間的性狀具有<b>差異性</b>；子代與親代的性狀具有<b>相似性和相異性</b>。」<br>' +
        '<b>相似</b>——小狗長得像狗，毛色、體型多半像爸媽<br>' +
        '<b>相異</b>——每一隻小狗的花紋、大小又不完全相同，同一窩兄弟姊妹彼此也有差別<br>' +
        '<span style="color:var(--muted)">這種差異很重要：環境改變時，總有一些個體剛好比較適應而活下來。</span>'
    };
  }
});
