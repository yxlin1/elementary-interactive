/* ============================================================
   五下 自然（康軒）第 4 單元　熱的作用與傳播
   課綱 INa-Ⅲ-8「熱由高溫處往低溫處傳播，傳播的方式有傳導、對流和輻射，
                  生活中可運用不同的方法保溫與散熱。」
        INa-Ⅲ-5「不同形式的能量可以相互轉換，但總量不變。」
        INe-Ⅲ-2「物質的形態與性質可因溫度、水分而改變。」（熱脹冷縮）
   教具：三種熱傳播方式的動畫模擬 ＋ 熱脹冷縮示範。
   ============================================================ */

Kit.register('s5b-u4', {

  intro: '熱一定<b>從高溫流向低溫</b>，方式有三種。切換看：金屬棒的<b>傳導</b>、水和空氣的<b>對流</b>、太陽的<b>輻射</b>，還有<b>熱脹冷縮</b>。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 320);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'cond', t = 0, playing = true, material = 'metal', temp = 20;
    let raf = null;

    const MAT = {
      metal: { n: '鐵棒（金屬）', speed: 1.0, col: '#b0bec5', note: '金屬是<b>熱的良導體</b>，熱傳得很快。' },
      wood: { n: '木棒', speed: 0.28, col: '#a1887f', note: '木頭是<b>熱的不良導體</b>，所以鍋鏟的柄常用木頭做。' },
      glass: { n: '玻璃棒', speed: 0.45, col: '#90caf9', note: '玻璃傳熱比金屬慢，比木頭快一點。' }
    };

    /* 溫度 → 顏色 */
    function heatColor(v) {   // v: 0(冷) ~ 1(熱)
      const c = [[70, 110, 190], [120, 180, 190], [250, 200, 90], [240, 120, 60], [230, 60, 50]];
      const p = Math.max(0, Math.min(0.999, v)) * (c.length - 1);
      const i = Math.floor(p), f = p - i;
      const a = c[i], b = c[Math.min(i + 1, c.length - 1)];
      return 'rgb(' + a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(',') + ')';
    }

    /* ---------- 傳導 ---------- */
    function drawCond() {
      const ctx = cv.ctx;
      const M = MAT[material];
      const bx = 130, by = 130, bw = 380, bh = 46;
      const front = t * M.speed;          // 熱前緣位置（0~1 以上）

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('左端用酒精燈加熱。熱沿著棒子一格一格傳過去——這叫「傳導」', 16, 22);

      const N = 38;
      for (let i = 0; i < N; i++) {
        const x = i / N;
        const v = Math.max(0, Math.min(1, (front - x) * 2.2));
        ctx.fillStyle = v > 0.02 ? heatColor(v) : M.col;
        ctx.fillRect(bx + i * bw / N, by, bw / N + 1, bh);
      }
      ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);

      // 蠟燭黏的小珠（依序掉落）
      for (let i = 1; i <= 5; i++) {
        const x = bx + bw * i / 6;
        const v = Math.max(0, Math.min(1, (front - i / 6) * 2.2));
        const fallen = v > 0.55;
        ctx.fillStyle = fallen ? '#5a6b8c' : '#fbbf24';
        const y = fallen ? by + bh + 40 : by + bh + 6;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        if (!fallen) {
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, by + bh); ctx.lineTo(x, by + bh + 6); ctx.stroke();
        }
      }
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('黃珠 = 用蠟黏的小珠，蠟融化就會掉下來（可以看出熱傳到哪裡了）', bx, by + bh + 58);

      // 火焰
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + bh + 34);
      ctx.quadraticCurveTo(bx - 26, by + bh, bx - 6, by + bh - 6);
      ctx.quadraticCurveTo(bx + 14, by + bh, bx - 6, by + bh + 34);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + bh + 26);
      ctx.quadraticCurveTo(bx - 16, by + bh + 4, bx - 6, by + bh - 2);
      ctx.quadraticCurveTo(bx + 4, by + bh + 4, bx - 6, by + bh + 26);
      ctx.fill();

      const dropped = [1, 2, 3, 4, 5].filter(i => (front - i / 6) * 2.2 > 0.55).length;
      readout.innerHTML =
        '<div class="big">傳導　—　' + M.n + '</div>' +
        '<b>傳導</b>：熱在<b>固體</b>裡，一個粒子撞下一個粒子，一路傳過去。物質<b>本身不會移動</b>。<br>' +
        M.note + '<br>' +
        '目前已經掉了 <b>' + dropped + '</b> 顆珠子——掉落順序是<b>從近到遠</b>，證明熱是「一路傳過去」不是「同時變熱」。<br>' +
        '<span style="color:var(--muted)">生活應用：鍋子用金屬（要導熱），鍋柄用木頭或塑膠（不要導熱）。' +
        '同樣是室溫，摸鐵椅比摸木椅冰，就是因為鐵把你手上的熱<b>導走得比較快</b>。</span>';
    }

    /* ---------- 對流 ---------- */
    function drawConv() {
      const ctx = cv.ctx;
      const bx = 130, by = 60, bw = 360, bh = 210;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('燒杯底部加熱。熱水變輕往上跑、冷水下沉補位，繞成一個循環', 16, 22);

      // 水（下熱上冷的漸層）
      const grd = ctx.createLinearGradient(0, by, 0, by + bh);
      grd.addColorStop(0, 'rgba(80,140,220,.55)');
      grd.addColorStop(1, 'rgba(230,90,60,.55)');
      ctx.fillStyle = grd; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
      ctx.stroke();

      // 循環的粒子
      const cxc = bx + bw / 2, cyc = by + bh / 2;
      for (let k = 0; k < 14; k++) {
        const phase = (t * 0.55 + k / 14) % 1;
        // 沿著兩個橢圓迴圈跑（左右各一）
        [-1, 1].forEach(side => {
          const ang = phase * Math.PI * 2 * side - Math.PI / 2;
          const rx = bw * 0.19, ry = bh * 0.33;
          const px = cxc + side * bw * 0.2 + Math.cos(ang) * rx * side;
          const py = cyc + Math.sin(ang) * ry;
          const hot = py > cyc;
          ctx.fillStyle = hot ? '#fb7185' : '#60a5fa';
          ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        });
      }
      // 循環箭頭
      ctx.strokeStyle = 'rgba(232,238,252,.45)'; ctx.lineWidth = 2;
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.ellipse(cxc + side * bw * 0.2, cyc, bw * 0.19, bh * 0.33, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 火
      ctx.fillStyle = '#fb7185';
      for (let i = -1; i <= 1; i++) {
        const fx = cxc + i * 30;
        ctx.beginPath();
        ctx.moveTo(fx, by + bh + 34);
        ctx.quadraticCurveTo(fx - 12, by + bh + 6, fx, by + bh + 2);
        ctx.quadraticCurveTo(fx + 12, by + bh + 6, fx, by + bh + 34);
        ctx.fill();
      }

      ctx.fillStyle = '#fb7185'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('紅 = 熱水（變輕，往上）', bx + bw + 8, by + bh - 30);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('藍 = 冷水（較重，下沉）', bx + bw + 8, by + 30);

      readout.innerHTML =
        '<div class="big">對流　—　液體和氣體才有</div>' +
        '<b>對流</b>：<b>物質本身跟著移動</b>。水（或空氣）受熱後<b>體積變大、變輕</b>就往上跑，' +
        '上面的冷水比較重就沉下來補位，繞成一個循環，整杯水才會都變熱。<br>' +
        '<span style="color:var(--warn)">⚠️ 和傳導最大的差別：傳導時物質<b>不動</b>，對流時物質<b>整團在跑</b>。' +
        '所以<b>固體不會對流</b>。</span><br>' +
        '<span style="color:var(--muted)">生活應用：冷氣裝<b>高</b>處（冷空氣會下沉），暖氣或電暖器放<b>低</b>處（熱空氣會上升）。' +
        '燒開水從<b>底部</b>加熱，就是要讓對流帶動整鍋水。</span>';
    }

    /* ---------- 輻射 ---------- */
    function drawRad() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('太陽和地球之間是真空（沒有空氣），熱還是傳得過來——靠的是輻射', 16, 22);

      const sx = 96, sy = 170;
      // 太陽
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(sx, sy, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,209,102,.18)';
      ctx.beginPath(); ctx.arc(sx, sy, 62, 0, Math.PI * 2); ctx.fill();

      // 輻射波
      for (let k = 0; k < 5; k++) {
        const r = 62 + ((t * 90 + k * 46) % 230);
        ctx.strokeStyle = 'rgba(255,209,102,' + Math.max(0, 0.55 - r / 420) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(sx, sy, r, -0.85, 0.85); ctx.stroke();
      }

      // 兩塊板子：黑 vs 白
      const px = 430;
      [['黑色', '#1c1c1c', 1.0, 96], ['白色/亮面', '#eceff1', 0.35, 200]].forEach(([n, col, absorb, y]) => {
        ctx.fillStyle = col;
        ctx.fillRect(px, y, 60, 76);
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2; ctx.strokeRect(px, y, 60, 76);
        // 溫度條
        const heat = Math.min(1, t * 0.25 * absorb);
        ctx.fillStyle = heatColor(heat);
        ctx.fillRect(px + 68, y + 76 - 76 * heat, 16, 76 * heat);
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 1; ctx.strokeRect(px + 68, y, 16, 76);
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(n, px, y - 18);
        ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.fillText(Math.round(20 + heat * 40) + '°C', px + 90, y + 30);
      });

      readout.innerHTML =
        '<div class="big">輻射　—　不需要任何介質</div>' +
        '<b>輻射</b>：熱直接以「光」的形式射出去，<b>不需要空氣、也不需要接觸</b>。' +
        '所以太陽的熱能穿過真空的太空傳到地球。<br>' +
        '畫面上兩塊板子接收同樣的陽光，但<b>黑色升溫比較快</b>——深色吸熱多、淺色反射多。<br>' +
        '<span style="color:var(--muted)">生活應用：夏天穿淺色衣服比較涼；太陽能熱水器的集熱板是黑的；' +
        '保溫瓶內壁鍍成亮面（把輻射反射回去）。<br>' +
        '烤箱、烤肉架、電暖器的紅光，靠的都是輻射。</span>';
    }

    /* ---------- 熱脹冷縮 ---------- */
    function drawExpand() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('拖曳溫度，看固體、液體、氣體受熱後怎麼變——同樣的東西，體積變了', 16, 22);

      const k = (temp - 0) / 100;      // 0~1

      // 溫度計（液體）
      const tx = 110, ty = 70, th = 180;
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx, ty + th + 18, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(tx, ty + th + 18, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(tx - 5, ty + th - th * k, 10, th * k);
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('液體：溫度計', tx, ty + th + 44);
      ctx.fillText('（水銀/酒精柱上升）', tx, ty + th + 62);

      // 固體（金屬環與球）
      const mx = 300, my = 150;
      const ballR = 30 + k * 8;
      ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = heatColor(k);
      ctx.beginPath(); ctx.arc(mx, my + 100, ballR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0b1220'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = ballR > 40 ? '#fb7185' : '#34d399';
      ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(ballR > 40 ? '球脹大了，穿不過環！' : '球穿得過環', mx, my + 140);
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.fillText('固體：金屬球與環', mx, my - 66);

      // 氣體（瓶口氣球）
      const gx = 480;
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx - 26, my + 130); ctx.lineTo(gx - 26, my + 40);
      ctx.lineTo(gx - 9, my + 16); ctx.lineTo(gx + 9, my + 16);
      ctx.lineTo(gx + 26, my + 40); ctx.lineTo(gx + 26, my + 130);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(159,180,221,.12)'; ctx.fill();
      const br = 10 + k * 30;
      ctx.fillStyle = 'rgba(251,113,133,.7)';
      ctx.beginPath(); ctx.ellipse(gx, my + 12 - br * .6, br * .8, br, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('氣體：瓶口的氣球', gx, my + 140);

      readout.innerHTML =
        '<div class="big">熱脹冷縮　現在 <b>' + temp + '°C</b></div>' +
        '大部分的物體<b>受熱體積變大、遇冷體積變小</b>。三態都會，但<b>氣體最明顯</b>，其次液體，固體最不明顯。<br>' +
        '（注意：變的是<b>體積</b>，不是重量。）<br>' +
        '<span style="color:var(--muted)">生活應用：<br>' +
        '• 鐵軌之間留縫、橋樑有伸縮縫 —— 夏天鐵會脹長<br>' +
        '• 溫度計就是利用液體熱脹冷縮做的<br>' +
        '• 瓶蓋轉不開時泡熱水 —— 金屬蓋脹得比玻璃多<br>' +
        '• 乒乓球凹了泡熱水會鼓回來 —— 裡面的空氣受熱膨脹</span>';
    }

    /* ---------- 保溫與散熱（對應單元活動 03）---------- */
    const KEEP = {
      thermos: {
        n: '保溫瓶', goal: '保溫',
        parts: [
          ['雙層瓶壁中間抽成真空', '傳導', '沒有物質就傳不了熱'],
          ['真空層也沒有空氣可流動', '對流', '空氣跑不動就帶不走熱'],
          ['內壁鍍成亮面（像鏡子）', '輻射', '把熱輻射反射回去'],
          ['瓶蓋用塑膠、不用金屬', '傳導', '塑膠是熱的不良導體']
        ],
        note: '保溫瓶厲害的地方是<b>三條路一次全堵住</b>——這就是為什麼它比一般杯子強那麼多。'
      },
      coat: {
        n: '羽絨衣 / 毛衣', goal: '保溫',
        parts: [
          ['蓬鬆的羽絨鎖住大量空氣', '傳導', '<b>空氣</b>才是主角，它是很差的熱導體'],
          ['空氣被關在小格子裡不能流動', '對流', '不流動就帶不走體溫']
        ],
        note: '真正保暖的<b>不是羽毛，是羽毛之間的空氣</b>。所以羽絨衣壓扁了、濕掉了就不保暖——空氣被擠掉或被水取代了。'
      },
      cup: {
        n: '紙杯套 / 隔熱杯墊', goal: '保溫（也保護手）',
        parts: [
          ['多一層瓦楞紙，中間有空氣', '傳導', '紙和空氣都不導熱，手不會燙'],
        ],
        note: '同一個原理反過來用：不是為了讓飲料保溫，是為了<b>不讓熱傳到你的手</b>。'
      },
      fin: {
        n: '散熱片（電腦、機車引擎）', goal: '散熱',
        parts: [
          ['做成很多薄片', '傳導', '增加<b>表面積</b>，能接觸到更多空氣'],
          ['薄片之間留空隙讓空氣流過', '對流', '把熱空氣帶走，換冷空氣進來'],
          ['材質用鋁或銅', '傳導', '金屬是良導體，熱才傳得出來']
        ],
        note: '散熱和保溫是<b>同一套原理反過來用</b>：保溫要擋住三條路，散熱要把三條路打開。'
      },
      fan: {
        n: '電風扇 / 冷氣', goal: '散熱',
        parts: [
          ['吹動空氣，強迫換氣', '對流', '把貼在皮膚上的熱空氣吹走'],
          ['冷氣裝在高處', '對流', '冷空氣重會下沉，才能循環整個房間']
        ],
        note: '⚠️ 電風扇<b>不會讓房間變涼</b>，它只是加快對流、幫你把熱帶走，所以你覺得涼。溫度計放在風扇前不會降。'
      },
      color: {
        n: '淺色衣服 / 屋頂隔熱漆', goal: '散熱',
        parts: [
          ['淺色、亮面把陽光反射掉', '輻射', '吸收的輻射熱變少']
        ],
        note: '夏天穿淺色比較涼、屋頂刷白色隔熱漆，走的都是<b>輻射</b>這條路。'
      }
    };
    let keepKey = 'thermos';
    const PATH_COLOR = { '傳導': '#fb7185', '對流': '#60a5fa', '輻射': '#fbbf24' };

    function drawKeep() {
      const ctx = cv.ctx;
      const K = KEEP[keepKey];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('熱只有三條路可以走。想保溫就把路堵住，想散熱就把路打開', 16, 22);

      // 左側：三條路的狀態燈
      const blocked = {};
      K.parts.forEach(p => blocked[p[1]] = true);
      ['傳導', '對流', '輻射'].forEach((p, i) => {
        const y = 60 + i * 62;
        const on = !!blocked[p];
        ctx.fillStyle = on ? PATH_COLOR[p] : '#1b2740';
        ctx.globalAlpha = on ? .22 : 1;
        ctx.fillRect(20, y, 150, 50);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = on ? PATH_COLOR[p] : '#26355a';
        ctx.lineWidth = on ? 2.5 : 1;
        ctx.strokeRect(20, y, 150, 50);
        ctx.fillStyle = on ? PATH_COLOR[p] : '#3a4c73';
        ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(p, 34, y + 25);
        ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.fillText(on ? (K.goal === '散熱' ? '↑ 加強' : '✕ 擋住') : '（沒用到）', 86, y + 25);
      });

      // 右側：每個設計對應哪條路
      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 18px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(K.n, 200, 46);
      ctx.fillStyle = K.goal === '散熱' ? '#fb7185' : '#34d399';
      ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.fillText('目的：' + K.goal, 200, 72);

      K.parts.forEach((p, i) => {
        const y = 104 + i * 48;
        ctx.fillStyle = PATH_COLOR[p[1]];
        ctx.beginPath(); ctx.arc(210, y + 10, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8eefc'; ctx.font = '14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(p[0], 226, y);
        ctx.fillStyle = PATH_COLOR[p[1]];
        ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
        ctx.fillText('擋／用的是「' + p[1] + '」', 226, y + 20);
      });

      readout.innerHTML =
        '<div class="big">' + K.n + '　—　目的是<b style="color:' +
        (K.goal === '散熱' ? '#fb7185' : '#34d399') + '">' + K.goal + '</b></div>' +
        K.parts.map(p => '<b style="color:' + PATH_COLOR[p[1]] + '">' + p[1] + '</b>：' +
          p[0] + '　→　' + p[2]).join('<br>') + '<br><br>' + K.note +
        '<br><span style="color:var(--muted)">課綱 INa-Ⅲ-8 的最後一句就是「生活中可運用不同的方法<b>保溫與散熱</b>」。' +
        '看到任何保溫／散熱的設計，就問：<b>它在處理傳導、對流，還是輻射？</b></span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'keep') { drawKeep(); return; }
      if (mode === 'cond') drawCond();
      else if (mode === 'conv') drawConv();
      else if (mode === 'rad') drawRad();
      else drawExpand();
    }

    function loop() {
      // 只有動畫模式需要推進時間；熱脹冷縮與保溫散熱是靜態的
      if (playing && mode !== 'expand' && mode !== 'keep') { t += 0.016; if (t > 8) t = 0; }
      paint();
      raf = requestAnimationFrame(loop);
    }

    // 模式順序對應課本三個活動：① 溫度與體積 ② 熱如何傳播 ③ 保溫與散熱
    const modeSeg = Kit.segmented('模式', [
      { label: '① 熱脹冷縮', value: 'expand' },
      { label: '② 傳導（固體）', value: 'cond' },
      { label: '② 對流（液體、氣體）', value: 'conv' },
      { label: '② 輻射（不需介質）', value: 'rad' },
      { label: '③ 保溫與散熱', value: 'keep' }
    ], function (v) {
      mode = v; t = 0;
      matSeg.wrap.style.display = v === 'cond' ? '' : 'none';
      tempCtl.wrap.style.display = v === 'expand' ? '' : 'none';
      keepSeg.wrap.style.display = v === 'keep' ? '' : 'none';
      resetBtn.style.display = (v === 'expand' || v === 'keep') ? 'none' : '';
      paint();
    }, mode);

    const keepSeg = Kit.segmented('看哪一個', Object.keys(KEEP).map(k => ({ label: KEEP[k].n, value: k })),
      function (v) { keepKey = v; paint(); }, keepKey);
    keepSeg.wrap.style.display = 'none';

    const matSeg = Kit.segmented('材質', Object.keys(MAT).map(k => ({ label: MAT[k].n, value: k })),
      function (v) { material = v; t = 0; }, material);
    const tempCtl = Kit.slider('溫度', { min: 0, max: 100, value: temp, format: v => v + '°C', onChange: v => { temp = v; paint(); } });
    tempCtl.wrap.style.display = 'none';
    const resetBtn = Kit.button('↻ 重新播放', function () { t = 0; }, 'primary');

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(matSeg.wrap);
    controls.appendChild(keepSeg.wrap);
    controls.appendChild(tempCtl.wrap);
    controls.appendChild(resetBtn);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '不管哪一種方式，方向都一樣：<b>熱從高溫處流向低溫處</b>，直到兩邊一樣熱為止。' +
        '沒有「冷跑進來」這回事——是<b>熱跑出去</b>。'
    }));

    loop();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '「熱是從哪裡跑到哪裡？」', why: '永遠是<b>高溫 → 低溫</b>。冰塊讓手變冷，不是「冷跑進手」，是「手的熱跑進冰塊」。這個方向感是整章的地基。' },
    { ask: '傳導模式：「珠子是同時掉還是一顆一顆掉？」', why: '一顆一顆，從近到遠。證明熱是「一路傳過去」的。換成木棒再看一次，速度差很多。' },
    { ask: '「為什麼鍋子是金屬，鍋柄是木頭或塑膠？」', why: '鍋身要<b>導熱</b>（把火的熱傳給食物），鍋柄要<b>不導熱</b>（別燙到手）。一個東西上就有兩種需求。' },
    { ask: '「同樣室溫，為什麼摸鐵比摸木頭冰？」', why: '兩者<b>溫度一樣</b>！只是鐵把你手上的熱導走得快，所以感覺冰。這一題能一次治好「金屬比較冷」的迷思。' },
    { ask: '對流模式：「為什麼冷氣裝在高處，暖爐放在地上？」', why: '冷空氣重會下沉，熱空氣輕會上升。裝反了整個房間都不會均勻。' },
    { ask: '「太陽的熱怎麼穿過太空傳過來？太空沒有空氣啊。」', why: '靠<b>輻射</b>。這是三種方式裡唯一不需要介質的，也是最容易被忽略的一種。' },
    { ask: '「瓶蓋轉不開時，為什麼泡熱水就開得了？」', why: '金屬蓋受熱膨脹得比玻璃瓶口多，就鬆了。這是熱脹冷縮最實用的一招，可以真的試一次。' },
    { ask: '切到「保溫與散熱」，拿家裡的保溫瓶問：「它用了幾種方法擋住熱？」', why: '三條路全堵——真空擋傳導與對流、亮面擋輻射、塑膠蓋擋傳導。這一題把整章串起來。' },
    { ask: '「羽絨衣為什麼保暖？是羽毛在發熱嗎？」', why: '不是。保暖的是<b>羽毛之間的空氣</b>。所以壓扁了、濕掉了就不保暖——空氣被擠掉或被水取代了。' },
    { ask: '「電風扇會讓房間變涼嗎？」', why: '不會。它只是加快對流，把你身上的熱帶走。溫度計放在風扇前不會降——這題很反直覺，值得問。' },
    { ask: '在家找三樣東西：一樣保溫的、一樣散熱的、一樣兩者都不是。', why: '例如保溫瓶／散熱片／木頭湯匙。找的過程就是在複習那三條路。' }
  ],

  pitfalls: [
    { bad: '說「冷氣把冷送進房間」。', fix: '沒有「冷」這種東西會流動，只有<b>熱</b>會流動。冷氣是把房間的熱<b>抽出去</b>。' },
    { bad: '以為金屬本身「比較冷」。', fix: '同一個房間裡所有東西<b>溫度都一樣</b>。金屬摸起來冰，是因為它把手上的熱<b>導走得快</b>。' },
    { bad: '以為固體也會對流。', fix: '對流需要物質<b>整團流動</b>，固體的粒子不能自由移動，所以<b>只有液體和氣體</b>會對流。' },
    { bad: '以為輻射需要空氣才能傳。', fix: '輻射<b>不需要任何介質</b>，真空也傳得過去。太陽的熱就是這樣到地球的。' },
    { bad: '把「熱」和「溫度」當同一件事。', fix: '溫度是「多熱」，熱是「傳遞的能量」。一杯 90°C 的水和一鍋 90°C 的水溫度一樣，但鍋子含的熱多得多。' },
    { bad: '以為熱脹冷縮改變的是重量。', fix: '改變的是<b>體積</b>，重量不變。所以熱空氣變輕是因為「同樣體積裡粒子變少」。' }
  ],

  quiz: function () {
    const type = Kit.pick(['which', 'direction', 'life', 'expand', 'keep', 'keep']);

    if (type === 'keep') {
      const items = [
        { q: '保溫瓶的雙層瓶壁中間<b>抽成真空</b>，主要是為了擋住哪一條路？',
          a: '傳導和對流（沒有物質就傳不了熱、也流不動）', o: ['只有輻射', '只有化學變化', '光線'] },
        { q: '保溫瓶內壁做成<b>亮面像鏡子</b>，是為了擋住哪一條路？',
          a: '輻射（把熱反射回去）', o: ['傳導', '對流', '蒸發'] },
        { q: '<b>羽絨衣</b>真正保暖的東西是什麼？',
          a: '羽毛之間鎖住的空氣（空氣是很差的熱導體）', o: ['羽毛本身會發熱', '羽毛會反射體溫', '羽毛能擋住風就夠了'] },
        { q: '電腦的<b>散熱片</b>做成很多薄片，主要目的是什麼？',
          a: '增加表面積，讓更多空氣帶走熱', o: ['讓它比較好看', '減少重量', '防止灰塵進入'] },
        { q: '<b>電風扇</b>為什麼會讓人覺得涼？',
          a: '加快對流，把貼在皮膚上的熱空氣吹走', o: ['它會製造冷空氣', '它會降低房間溫度', '它會反射熱輻射'] },
        { q: '夏天屋頂刷<b>白色隔熱漆</b>，處理的是哪一條路？',
          a: '輻射（把陽光反射掉）', o: ['傳導', '對流', '蒸發'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<span style="color:var(--muted)">保溫和散熱是<b>同一套原理反過來用</b>：熱只有傳導、對流、輻射三條路，' +
          '想保溫就把路<b>堵住</b>，想散熱就把路<b>打開</b>。<br>' +
          '看到任何相關設計，先問：「它在處理哪一條路？」<br>' +
          '保溫瓶厲害的地方就是<b>三條路一次全堵</b>——真空擋傳導與對流、亮面擋輻射、塑膠蓋擋傳導。</span>'
      };
    }

    if (type === 'which') {
      const items = [
        { s: '用鐵湯匙攪熱湯，湯匙柄慢慢變燙', a: '傳導' },
        { s: '燒開水時整鍋水都變熱', a: '對流' },
        { s: '曬太陽覺得暖和', a: '輻射' },
        { s: '冷氣讓整個房間變涼', a: '對流' },
        { s: '手握住冰塊，手變冷', a: '傳導' },
        { s: '烤肉時離火有一段距離也覺得熱', a: '輻射' },
        { s: '電暖器讓房間空氣循環變暖', a: '對流' },
        { s: '在太空中，太陽的熱傳到地球', a: '輻射' }
      ];
      const it = Kit.pick(items);
      const opts = ['傳導', '對流', '輻射'];
      return {
        q: '「<b>' + it.s + '</b>」主要是哪一種熱的傳播方式？',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '判斷口訣：<br>' +
          '<b>傳導</b>——固體，直接接觸，物質<b>不動</b><br>' +
          '<b>對流</b>——液體或氣體，物質<b>整團在跑</b><br>' +
          '<b>輻射</b>——不用接觸、不用介質，隔空就傳過來'
      };
    }

    if (type === 'direction') {
      const opts = Kit.shuffle([
        { t: '手的熱傳到冰塊', ok: true },
        { t: '冰塊的冷傳到手', ok: false },
        { t: '手和冰塊互相交換冷熱', ok: false },
        { t: '冰塊把手的溫度吸走變成冷', ok: false }
      ]);
      return {
        q: '用手握住冰塊會覺得冷。真正發生的事情是什麼？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
        steps: '<b>熱永遠從高溫流向低溫。</b><br>' +
          '手（約 36°C）比冰塊（0°C）熱，所以是<b>手的熱跑到冰塊裡</b>，手因此失去熱而覺得冷。<br>' +
          '<span style="color:var(--warn)">⚠️ 科學上<b>沒有「冷」在流動</b>這回事，只有熱會流動。' +
          '同理，冷氣不是「送冷進來」，是「把熱抽出去」。</span>'
      };
    }

    if (type === 'life') {
      const items = [
        { q: '為什麼鍋子的柄常用木頭或塑膠做？', a: '木頭和塑膠是熱的不良導體，不容易燙手', o: ['木頭比較便宜', '木頭比較輕', '木頭比較耐用'] },
        { q: '為什麼冷氣機要裝在牆壁的高處？', a: '冷空氣比較重會下沉，裝高處才能讓整個房間循環變涼', o: ['高處比較不占空間', '高處比較安全', '高處風比較大'] },
        { q: '為什麼夏天穿淺色衣服比較涼？', a: '淺色會把輻射熱反射掉，深色吸熱多', o: ['淺色比較薄', '淺色比較透氣', '淺色比較輕'] },
        { q: '為什麼鐵軌之間要留縫隙？', a: '夏天鐵受熱會膨脹變長，沒留縫會擠壞變形', o: ['方便排水', '節省鋼材', '減少噪音'] },
        { q: '為什麼保溫瓶的內壁做成亮面？', a: '亮面能把輻射熱反射回去，減少熱散失', o: ['比較好看', '比較好清洗', '比較堅固'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: '<b>' + it.q + '</b>',
        choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<span style="color:var(--muted)">課綱 INa-Ⅲ-8 最後一句是「生活中可運用不同的方法<b>保溫與散熱</b>」——' +
          '這一章的重點不只是名詞，而是能不能用來解釋身邊的事。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '體積變大，重量不變', ok: true },
      { t: '體積變大，重量也變大', ok: false },
      { t: '體積不變，重量變大', ok: false },
      { t: '體積變小，重量不變', ok: false }
    ]);
    return {
      q: '大部分的物體<b>受熱</b>之後，會發生什麼變化？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '受熱 → <b>體積變大</b>（熱脹），遇冷 → 體積變小（冷縮）。<b>重量不會變</b>。<br>' +
        '明顯程度：<b>氣體 > 液體 > 固體</b>。<br>' +
        '生活例子：鐵軌留縫、橋樑伸縮縫、溫度計、瓶蓋泡熱水就轉得開、凹掉的乒乓球泡熱水會鼓回來。'
    };
  }
});
