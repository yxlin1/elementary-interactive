/* ============================================================
   五上 自然（康軒）第 2 單元　探索聲光世界
   依 115 學年度課程計畫，本單元三個活動：
     活動一 樂音和噪音有什麼不同
     活動二 樂器如何發出不同的聲音
       樂器的構造與發聲方式／振動的部位／影響音量大小與音調高低的因素／
       不同樂器有不同的音色／音箱有擴大聲音的功用
     活動三 光有什麼特性與現象
       生活中光的折射現象／放大鏡能匯聚光線／放大鏡的成像與生活應用／
       陽光是由不同色光組成／生活中的色光現象
   課綱 INe-Ⅲ-6 / INe-Ⅲ-8 / INe-Ⅲ-7
   ============================================================ */

Kit.register('s5a-u2', {

  intro: '聲音看不見，但可以<b>畫出來</b>。前兩個模式用波形看音量、音調、音色的差別；後兩個模式看光的折射、放大鏡和色光。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 320);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let mode = 'wave';
    let amp = 60, freq = 3, timbre = 'sine', noisy = false;   // 聲音
    let inst = 'string', strLen = 60;                          // 樂器
    let medium = 'water', incid = 40;                          // 折射
    let lensD = 100;                                           // 放大鏡
    let t = 0, raf = null;

    const TIMBRE = {
      sine: { n: '單純音（音叉）', f: u => Math.sin(u) },
      tri: { n: '長笛（較柔和）', f: u => Math.asin(Math.sin(u)) * 2 / Math.PI },
      saw: { n: '小提琴（較尖銳）', f: u => 1 - 2 * ((u / (2 * Math.PI)) % 1) },
      sq: { n: '單簧管（較厚實）', f: u => Math.sin(u) >= 0 ? 1 : -1 }
    };

    /* ---------- 模式 1：聲音的三要素 ---------- */
    function drawWave() {
      const ctx = cv.ctx;
      const bx = 40, by = 60, bw = 540, bh = 180, mid = by + bh / 2;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('把聲音畫成波形。上下越高＝越大聲，波越密＝越高音，形狀不同＝音色不同', 16, 22);

      ctx.strokeStyle = '#26355a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, mid); ctx.lineTo(bx + bw, mid); ctx.stroke();
      ctx.strokeStyle = '#3a4c73'; ctx.strokeRect(bx, by, bw, bh);

      ctx.strokeStyle = noisy ? '#fb7185' : '#4da3ff'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= bw; i++) {
        const u = (i / bw) * freq * Math.PI * 2 + t;
        let v = noisy
          ? (Math.sin(u * 1.7) + Math.sin(u * 3.3 + 1) + Math.sin(u * 5.1 + 2)) / 3 * (0.5 + Math.sin(i * 12.9898) % 1)
          : TIMBRE[timbre].f(u);
        const y = mid - v * (amp / 100) * (bh / 2 - 8);
        i ? ctx.lineTo(bx + i, y) : ctx.moveTo(bx + i, y);
      }
      ctx.stroke();

      // 振幅標示
      ctx.save(); ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      const ay = (amp / 100) * (bh / 2 - 8);
      ctx.beginPath(); ctx.moveTo(bx, mid - ay); ctx.lineTo(bx + bw, mid - ay); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('振幅 → 音量', bx + 6, mid - ay - 4);

      // 波長標示
      if (!noisy) {
        const wl = bw / freq;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + 10, by + bh - 14); ctx.lineTo(bx + 10 + wl, by + bh - 14); ctx.stroke();
        [bx + 10, bx + 10 + wl].forEach(x => {
          ctx.beginPath(); ctx.moveTo(x, by + bh - 20); ctx.lineTo(x, by + bh - 8); ctx.stroke();
        });
        ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('一個完整的波 → 越密音越高', bx + 14, by + bh - 18);
      }

      readout.innerHTML =
        '<div class="big">' + (noisy ? '<span style="color:var(--no)">噪音</span>' : '<span style="color:var(--ok)">樂音</span>') +
        '　音量 ' + amp + '％　音調 ' + freq + ' 級　音色：' + TIMBRE[timbre].n + '</div>' +
        '<b>聲音的三要素</b>（課綱 INe-Ⅲ-6：「聲音有大小、高低與音色等不同性質」）：<br>' +
        '<span style="color:#34d399">🟢 <b>音量（大小）</b></span>　由<b>振幅</b>決定。振動幅度越大 → 越大聲。用力敲、用力撥就會變大聲。<br>' +
        '<span style="color:#fbbf24">🟡 <b>音調（高低）</b></span>　由<b>振動快慢（頻率）</b>決定。振動越快、波越密 → 音越高。<br>' +
        '<span style="color:#4da3ff">🔵 <b>音色</b></span>　由<b>波形</b>決定。同樣的音量和音調，長笛和小提琴聽起來不一樣，就是波形不同。<br>' +
        (noisy
          ? '<span style="color:var(--no)"><b>噪音</b>的波形<b>雜亂沒有規律</b>，聽起來刺耳。' +
            '防治方法：從<b>音源</b>減少（機器加消音器）、<b>傳播途中</b>阻隔（隔音牆、氣密窗）、' +
            '<b>接收端</b>保護（耳塞）。</span>'
          : '<span style="color:var(--muted)"><b>樂音</b>的波形<b>規律重複</b>，聽起來悅耳。按「切換成噪音」比較看看。</span>');
    }

    /* ---------- 模式 2：樂器如何發聲 ---------- */
    const INST = {
      string: {
        n: '弦樂器', ex: '吉他、小提琴、古箏、鋼琴',
        part: '<b>弦</b>在振動',
        rules: '弦<b>越短</b>、<b>越細</b>、<b>越緊</b> → 振動越快 → 音越<b>高</b>。' +
          '（吉他按住琴格就是在縮短弦長）',
        box: '琴身（<b>音箱</b>）讓裡面的空氣跟著振動，把聲音<b>放大</b>。沒有音箱的弦，聲音會很小。'
      },
      wind: {
        n: '管樂器', ex: '直笛、長笛、喇叭、陶笛',
        part: '管子裡的<b>空氣柱</b>在振動',
        rules: '空氣柱<b>越短</b> → 振動越快 → 音越<b>高</b>。' +
          '（直笛按住不同的孔，就是在改變空氣柱的長度）',
        box: '管子本身就是共鳴的空間，形狀決定音色。'
      },
      percuss: {
        n: '打擊樂器', ex: '鼓、木琴、三角鐵、鐵琴',
        part: '<b>鼓面</b>或<b>發聲體本身</b>在振動',
        rules: '鼓面<b>越緊</b>、面積<b>越小</b> → 音越<b>高</b>；木琴的板子<b>越短</b> → 音越<b>高</b>。',
        box: '鼓身、共鳴管把聲音放大。'
      }
    };

    function drawInst() {
      const ctx = cv.ctx;
      const I = INST[inst];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('拖曳滑桿改變長度，看波形跟著變——這就是樂器調音調的原理', 16, 22);

      const bx = 60, by = 70, full = 460;
      const L = full * strLen / 100;
      const pitch = Math.round(100 / strLen * 4);   // 越短音越高

      if (inst === 'string') {
        // 弦
        ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(bx - 14, by); ctx.lineTo(bx + full + 14, by); ctx.stroke();
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= L; i++) {
          const y = by + Math.sin(i / L * Math.PI) * Math.sin(t * 6) * 22;
          i ? ctx.lineTo(bx + i, y) : ctx.moveTo(bx + i, y);
        }
        ctx.stroke();
        ctx.strokeStyle = '#5a6b8c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + L, by - 26); ctx.lineTo(bx + L, by + 26); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('按這裡（縮短弦長）', bx + L, by + 30);
        // 音箱
        ctx.fillStyle = 'rgba(161,136,127,.5)';
        ctx.beginPath(); ctx.ellipse(bx + full + 60, by, 46, 56, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#0b1220';
        ctx.beginPath(); ctx.arc(bx + full + 60, by, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a1887f'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('音箱', bx + full + 60, by + 62);
      } else if (inst === 'wind') {
        ctx.fillStyle = 'rgba(159,180,221,.18)';
        ctx.fillRect(bx, by - 26, full, 52);
        ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 3;
        ctx.strokeRect(bx, by - 26, full, 52);
        ctx.fillStyle = 'rgba(77,163,255,.35)';
        ctx.fillRect(bx, by - 24, L, 48);
        for (let k = 1; k <= 6; k++) {
          const x = bx + full * k / 7;
          ctx.fillStyle = x < bx + L ? '#0b1220' : '#4da3ff';
          ctx.beginPath(); ctx.arc(x, by, 8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#4da3ff'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('藍色 = 振動的空氣柱（按孔改變長度）', bx + full / 2, by + 40);
      } else {
        const r = 40 + (100 - strLen) * 0.5;
        ctx.fillStyle = 'rgba(161,136,127,.5)';
        ctx.beginPath(); ctx.ellipse(bx + 220, by + 10, r * 1.5, r * .45, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(bx + 220, by + 10 + Math.sin(t * 8) * 5, r * 1.5, r * .45, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('鼓面越緊、面積越小 → 音越高', bx + 220, by + 70);
      }

      // 波形
      const wy = 240;
      ctx.strokeStyle = '#4da3ff'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 540; i++) {
        const y = wy - Math.sin(i / 540 * pitch * Math.PI * 2 + t * 4) * 26;
        i ? ctx.lineTo(40 + i, y) : ctx.moveTo(40 + i, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('發出來的聲音波形（越密＝越高音）', 40, wy - 32);

      readout.innerHTML =
        '<div class="big">' + I.n + '　（' + I.ex + '）</div>' +
        '<b>哪裡在振動</b>：' + I.part + '　—— 所有聲音都來自<b>物體振動</b>，這是最根本的原理。<br>' +
        '<b>怎麼改變音調</b>：' + I.rules + '<br>' +
        '<b>音箱的作用</b>：' + I.box + '<br>' +
        '<span style="color:var(--muted)">在家可以做：橡皮筋套在紙盒上撥撥看——' +
        '拉緊音變高、放鬆音變低；有紙盒（音箱）比沒有大聲很多。這就是最簡單的自製樂器。</span>';
    }

    /* ---------- 模式 3：光的折射與放大鏡 ---------- */
    function drawRefract() {
      const ctx = cv.ctx;
      const n2 = medium === 'water' ? 1.33 : 1.5;
      const cx = 300, cy = 150;

      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('光從空氣斜射進' + (medium === 'water' ? '水' : '玻璃') + '裡，行進方向會偏折——這叫折射', 16, 22);

      // 介質
      ctx.fillStyle = medium === 'water' ? 'rgba(56,189,248,.22)' : 'rgba(200,220,255,.16)';
      ctx.fillRect(0, cy, cv.W, cv.H - cy);
      ctx.strokeStyle = '#9fb4dd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cv.W, cy); ctx.stroke();
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('空氣', cv.W - 12, cy - 6);
      ctx.textBaseline = 'top';
      ctx.fillText(medium === 'water' ? '水' : '玻璃', cv.W - 12, cy + 6);

      // 法線
      ctx.save(); ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy - 120); ctx.lineTo(cx, cy + 120); ctx.stroke();
      ctx.restore();

      const i = incid * Math.PI / 180;
      const r = Math.asin(Math.sin(i) / n2);
      // 入射
      ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - Math.sin(i) * 150, cy - Math.cos(i) * 150); ctx.lineTo(cx, cy); ctx.stroke();
      // 折射
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(r) * 150, cy + Math.cos(r) * 150); ctx.stroke();
      // 若沒有折射的話（虛線對照）
      ctx.save(); ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(251,113,133,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(i) * 150, cy + Math.cos(i) * 150); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fb7185'; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('入射角 ' + incid + '°', cx - 40, cy - 70);
      ctx.fillStyle = '#34d399'; ctx.textAlign = 'left';
      ctx.fillText('折射角 ' + Math.round(r * 180 / Math.PI) + '°', cx + 40, cy + 70);
      ctx.fillStyle = 'rgba(251,113,133,.7)'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
      ctx.fillText('（沒折射的話會走這裡）', cx + 30, cy + 128);

      readout.innerHTML =
        '<div class="big">入射角 ' + incid + '°　→　折射角 ' + Math.round(r * 180 / Math.PI) + '°</div>' +
        '光從<b>空氣</b>斜斜射進<b>' + (medium === 'water' ? '水' : '玻璃') + '</b>裡時，行進方向會<b>偏折</b>，' +
        '而且會<b>偏向法線</b>（折射角比入射角小）。<br>' +
        '<span style="color:var(--warn)">⚠️ 和<b>反射</b>不一樣：反射是彈回原來的介質（入射角＝反射角）；' +
        '折射是<b>穿過去</b>但轉了個彎。</span><br>' +
        '<span style="color:var(--muted)"><b>生活中看得到的折射</b>：<br>' +
        '• 筷子插進水裡看起來<b>斷掉、彎折</b><br>' +
        '• 水池看起來<b>比實際淺</b>（所以不會游泳千萬別亂下水）<br>' +
        '• 魚在水裡看到的位置和實際位置不同，抓魚要瞄準<b>更下面</b><br>' +
        '• 隔著玻璃杯看東西會變形</span>';
    }

    /* ---------- 模式 4：放大鏡 ---------- */
    function drawLens() {
      const ctx = cv.ctx;
      const lx = 300, cy = 160, f = lensD;      // 焦距
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('放大鏡是<b>凸透鏡</b>：平行光通過後會匯聚到一個點（焦點）', 16, 22);

      // 透鏡
      ctx.fillStyle = 'rgba(159,200,255,.25)';
      ctx.beginPath();
      ctx.moveTo(lx, cy - 78);
      ctx.quadraticCurveTo(lx + 34, cy, lx, cy + 78);
      ctx.quadraticCurveTo(lx - 34, cy, lx, cy - 78);
      ctx.fill();
      ctx.strokeStyle = '#9fc8ff'; ctx.lineWidth = 3; ctx.stroke();
      // 主軸
      ctx.save(); ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#3a4c73'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cv.W, cy); ctx.stroke();
      ctx.restore();
      // 平行光 → 匯聚
      [-58, -30, 0, 30, 58].forEach(dy => {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(30, cy + dy); ctx.lineTo(lx, cy + dy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, cy + dy); ctx.lineTo(lx + f, cy); ctx.stroke();
        if (lx + f + 60 < cv.W) {
          ctx.beginPath(); ctx.moveTo(lx + f, cy);
          ctx.lineTo(lx + f + 60, cy - dy * 0.6); ctx.stroke();
        }
      });
      // 焦點
      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(lx + f, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('焦點', lx + f, cy + 12);
      ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2;
      ctx.save(); ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(lx, cy + 92); ctx.lineTo(lx + f, cy + 92); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fb7185'; ctx.textBaseline = 'top';
      ctx.fillText('焦距 ' + f, lx + f / 2, cy + 96);

      readout.innerHTML =
        '<div class="big">放大鏡（凸透鏡）：把光<b>聚在一起</b></div>' +
        '課綱 INe-Ⅲ-8：「光會有<b>折射</b>現象，<b>放大鏡可聚光和成像</b>。」<br>' +
        '光穿過中間厚、邊緣薄的凸透鏡時，被<b>折射</b>而向內偏折，全部集中到<b>焦點</b>。<br>' +
        '<b>成像</b>：物體放在焦點<b>以內</b>時，看到的是<b>放大、正立</b>的像——這就是我們平常用放大鏡看小字的情形。<br>' +
        '<span style="color:var(--muted)"><b>生活應用</b>：放大鏡看細節、老花眼鏡、相機鏡頭、望遠鏡、顯微鏡。<br>' +
        '<span style="color:var(--no)">⚠️ 安全：用放大鏡聚焦陽光可以點燃紙張，溫度很高。' +
        '<b>絕對不可以拿放大鏡看太陽</b>，會瞬間灼傷眼睛。</span></span>';
    }

    /* ---------- 模式 5：陽光的色光 ---------- */
    function drawPrism() {
      const ctx = cv.ctx;
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('看起來是白色的陽光，用三稜鏡一分開，其實是很多種色光組成的', 16, 22);

      const px = 250, py = 160;
      // 入射白光
      ctx.strokeStyle = '#f5f5f5'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(40, py - 24); ctx.lineTo(px - 34, py - 4); ctx.stroke();
      ctx.fillStyle = '#e8eefc'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('白色的陽光', 44, py - 30);

      // 三稜鏡
      ctx.beginPath();
      ctx.moveTo(px, py - 62); ctx.lineTo(px + 56, py + 46); ctx.lineTo(px - 56, py + 46);
      ctx.closePath();
      ctx.fillStyle = 'rgba(200,225,255,.20)'; ctx.fill();
      ctx.strokeStyle = '#bcd7ff'; ctx.lineWidth = 3; ctx.stroke();

      // 散開的色光
      const COLORS = [['紅', '#e53935'], ['橙', '#fb8c00'], ['黃', '#fdd835'],
                      ['綠', '#43a047'], ['藍', '#1e88e5'], ['靛', '#3949ab'], ['紫', '#8e24aa']];
      COLORS.forEach((c, i) => {
        const a = (i - 3) * 0.055 + 0.10;
        ctx.strokeStyle = c[1]; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(px + 34, py + 6);
        ctx.lineTo(px + 34 + Math.cos(a) * 260, py + 6 + Math.sin(a) * 260);
        ctx.stroke();
        ctx.fillStyle = c[1]; ctx.font = 'bold 13px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(c[0], px + 44 + Math.cos(a) * 268, py + 6 + Math.sin(a) * 268);
      });

      readout.innerHTML =
        '<div class="big">陽光 ＝ <span style="color:#e53935">紅</span>' +
        '<span style="color:#fb8c00">橙</span><span style="color:#fdd835">黃</span>' +
        '<span style="color:#43a047">綠</span><span style="color:#1e88e5">藍</span>' +
        '<span style="color:#3949ab">靛</span><span style="color:#8e24aa">紫</span> 等色光混合而成</div>' +
        '課綱 INe-Ⅲ-7：「<b>陽光是由不同色光組成</b>。」<br>' +
        '不同顏色的光穿過三稜鏡時<b>偏折的程度不一樣</b>（紫光偏折最多、紅光最少），所以會分開成一條彩色帶，' +
        '這叫<b>色散</b>。<br>' +
        '<span style="color:var(--muted)"><b>生活中的色光現象</b>：<br>' +
        '• <b>彩虹</b>——雨後空中的小水滴就像無數個三稜鏡<br>' +
        '• 光碟片、肥皂泡泡的<b>七彩反光</b><br>' +
        '• 噴霧器對著陽光噴水，可以自己做一道小彩虹<br>' +
        '• 把七色轉盤快速旋轉，看起來會接近<b>白色</b>——反過來證明白光是混合的</span>';
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'wave') drawWave();
      else if (mode === 'inst') drawInst();
      else if (mode === 'refract') drawRefract();
      else if (mode === 'lens') drawLens();
      else drawPrism();
    }
    function loop() {
      t += 0.05;
      if (mode === 'wave' || mode === 'inst') paint();
      raf = requestAnimationFrame(loop);
    }

    const modeSeg = Kit.segmented('模式', [
      { label: '① 樂音和噪音', value: 'wave' },
      { label: '② 樂器如何發聲', value: 'inst' },
      { label: '③ 光的折射', value: 'refract' },
      { label: '③ 放大鏡', value: 'lens' },
      { label: '③ 陽光的色光', value: 'prism' }
    ], function (v) {
      mode = v;
      const show = (el, on) => el.style.display = on ? '' : 'none';
      show(ampCtl.wrap, v === 'wave'); show(freqCtl.wrap, v === 'wave');
      show(timbreSeg.wrap, v === 'wave'); show(noiseBtn, v === 'wave');
      show(instSeg.wrap, v === 'inst'); show(lenCtl.wrap, v === 'inst');
      show(medSeg.wrap, v === 'refract'); show(incCtl.wrap, v === 'refract');
      show(lensCtl.wrap, v === 'lens');
      paint();
    }, mode);

    const ampCtl = Kit.slider('音量（振幅）', { min: 10, max: 100, value: amp, format: v => v + '％', onChange: v => { amp = v; paint(); } });
    const freqCtl = Kit.slider('音調（頻率）', { min: 1, max: 10, value: freq, format: v => v + ' 級', onChange: v => { freq = v; paint(); } });
    const timbreSeg = Kit.segmented('音色', Object.keys(TIMBRE).map(k => ({ label: TIMBRE[k].n, value: k })),
      function (v) { timbre = v; noisy = false; noiseBtn.textContent = '切換成噪音'; paint(); }, timbre);
    const noiseBtn = Kit.button('切換成噪音', function () {
      noisy = !noisy; noiseBtn.textContent = noisy ? '切回樂音' : '切換成噪音'; paint();
    });

    const instSeg = Kit.segmented('樂器種類', Object.keys(INST).map(k => ({ label: INST[k].n, value: k })),
      function (v) { inst = v; paint(); }, inst);
    const lenCtl = Kit.slider('長度／鬆緊', { min: 20, max: 100, value: strLen, format: v => v + '％', onChange: v => { strLen = v; paint(); } });

    const medSeg = Kit.segmented('射入什麼', [{ label: '水', value: 'water' }, { label: '玻璃', value: 'glass' }],
      function (v) { medium = v; paint(); }, medium);
    const incCtl = Kit.slider('入射角', { min: 5, max: 80, value: incid, format: v => v + '°', onChange: v => { incid = v; paint(); } });
    const lensCtl = Kit.slider('焦距', { min: 60, max: 200, value: lensD, onChange: v => { lensD = v; paint(); } });

    [instSeg.wrap, lenCtl.wrap, medSeg.wrap, incCtl.wrap, lensCtl.wrap].forEach(x => x.style.display = 'none');

    controls.appendChild(modeSeg.wrap);
    [ampCtl, freqCtl].forEach(x => controls.appendChild(x.wrap));
    controls.appendChild(timbreSeg.wrap);
    controls.appendChild(noiseBtn);
    controls.appendChild(instSeg.wrap);
    controls.appendChild(lenCtl.wrap);
    controls.appendChild(medSeg.wrap);
    controls.appendChild(incCtl.wrap);
    controls.appendChild(lensCtl.wrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '兩個核心：聲音來自<b>物體振動</b>（振幅→音量、頻率→音調、波形→音色）；' +
        '光穿過不同介質會<b>折射</b>（放大鏡聚光、三稜鏡把陽光分成色光）。'
    }));

    paint(); loop();
    return function () { cancelAnimationFrame(raf); };
  },

  parentGuide: [
    { ask: '拉「音量」和「音調」兩個滑桿：「哪一個讓波變高？哪一個讓波變密？」', why: '振幅→音量、頻率→音調。用眼睛看波形，比用耳朵分辨「大聲」和「高音」容易得多——這兩個最常被搞混。' },
    { ask: '按「切換成噪音」：「這兩種波形差在哪裡？」', why: '樂音<b>規律重複</b>，噪音<b>雜亂無章</b>。這就是課綱說的「生活中聲音有樂音與噪音之分」。' },
    { ask: '「我們家附近有什麼噪音？可以怎麼減少？」', why: '三個下手處：<b>音源</b>（機器加消音器）、<b>傳播途中</b>（隔音牆、氣密窗）、<b>接收端</b>（耳塞）。課綱要求「噪音可以防治」。' },
    { ask: '拿橡皮筋套在紙盒上：「拉緊和放鬆，聲音有什麼不一樣？」', why: '拉緊→振動快→音高。再把橡皮筋拿離紙盒撥撥看，會發現小聲很多——那就是<b>音箱</b>的作用。' },
    { ask: '把筷子斜插進水杯：「它看起來怎麼了？真的斷了嗎？」', why: '沒斷，是<b>折射</b>。這是最容易在家示範的折射現象，一個水杯就能做。' },
    { ask: '「水池看起來的深度和實際一樣嗎？」', why: '看起來<b>比實際淺</b>。這不只是知識，是安全常識——不會游泳的人千萬別因為「看起來很淺」就下水。' },
    { ask: '晴天用噴霧器對著陽光噴水，背對太陽看。', why: '會出現小彩虹。直接驗證「陽光是由不同色光組成」，五分鐘就能做。' }
  ],

  pitfalls: [
    { bad: '把「音量大」和「音調高」搞混，以為大聲就是高音。', fix: '<b>音量</b>看振幅（波的高度），<b>音調</b>看頻率（波的疏密）。大聲的低音（大鼓）和小聲的高音（輕輕吹哨）都存在。' },
    { bad: '以為噪音就是「很大聲的聲音」。', fix: '關鍵是<b>波形雜亂沒規律</b>，而且是「讓人不舒服、不想聽」的聲音。很小聲的刮玻璃聲也是噪音。', src: 'INe-Ⅲ-6' },
    { bad: '把<b>折射</b>和<b>反射</b>搞混。', fix: '<b>反射</b>是光<b>彈回來</b>（鏡子，入射角＝反射角）；<b>折射</b>是光<b>穿過去但轉彎</b>（筷子看起來斷掉）。' },
    { bad: '以為放大鏡是「把東西變大」。', fix: '東西沒變大，是光<b>被折射</b>後進入眼睛，讓我們<b>看到放大的像</b>。' },
    { bad: '以為彩虹的顏色是「水滴本身有顏色」。', fix: '水滴沒有顏色。是<b>陽光本來就由不同色光組成</b>，水滴把它們分開了。' },
    { bad: '拿放大鏡對著太陽看。', fix: '<b>絕對禁止</b>。放大鏡會把陽光聚在一點，能點燃紙張，對著眼睛會瞬間造成永久傷害。' }
  ],

  quiz: function () {
    const type = Kit.pick(['sound3', 'noise', 'inst', 'refract', 'lens', 'color']);

    if (type === 'sound3') {
      const it = Kit.pick([
        { q: '聲音的<b>大小（音量）</b>是由什麼決定的？', a: '振幅（振動的幅度）', o: ['頻率（振動的快慢）', '波形', '傳播的介質'] },
        { q: '聲音的<b>高低（音調）</b>是由什麼決定的？', a: '頻率（振動的快慢）', o: ['振幅（振動的幅度）', '波形', '音量'] },
        { q: '同樣的音量和音調，長笛和小提琴聽起來不一樣，這是什麼不同？', a: '音色（波形不同）', o: ['音量不同', '音調不同', '頻率不同'] },
        { q: '所有的聲音都是怎麼產生的？', a: '物體振動', o: ['物體發熱', '空氣流動', '物體反光'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>聲音三要素</b>（INe-Ⅲ-6）：<br>' +
          '<b>音量（大小）</b>← 振幅：波越高越大聲<br>' +
          '<b>音調（高低）</b>← 頻率：波越密音越高<br>' +
          '<b>音色</b>← 波形：分辨是什麼樂器、誰在說話<br>' +
          '而所有聲音的來源都是<b>物體振動</b>。'
      };
    }

    if (type === 'noise') {
      const it = Kit.pick([
        { q: '<b>樂音</b>和<b>噪音</b>最主要的差別是什麼？', a: '樂音的波形規律重複，噪音的波形雜亂無章', o: ['樂音比較小聲', '噪音一定比較大聲', '樂音只有樂器才發得出來'] },
        { q: '在馬路旁蓋<b>隔音牆</b>，是從哪個環節防治噪音？', a: '傳播的途中', o: ['噪音的來源', '接收的耳朵', '完全消除噪音'] },
        { q: '工人戴<b>耳塞</b>，是從哪個環節防治噪音？', a: '接收的一端', o: ['噪音的來源', '傳播的途中', '把噪音變成樂音'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>噪音防治的三個下手處</b>：<br>' +
          '① <b>音源</b>——機器加消音器、禁止按喇叭<br>' +
          '② <b>傳播途中</b>——隔音牆、氣密窗、種樹<br>' +
          '③ <b>接收端</b>——戴耳塞、耳罩<br>' +
          '<span style="color:var(--muted)">噪音的判準是「波形雜亂、讓人不舒服」，不是單看大不大聲。</span>'
      };
    }

    if (type === 'inst') {
      const it = Kit.pick([
        { q: '吉他按住琴格再撥弦，音會怎麼變？為什麼？', a: '變高，因為弦變短、振動變快', o: ['變低，因為弦變短', '變大聲，因為壓得比較用力', '不會變'] },
        { q: '直笛按住不同的孔，改變的是什麼？', a: '管子裡振動的空氣柱長度', o: ['吹氣的力量', '笛子的材質', '手指的溫度'] },
        { q: '吉他的<b>音箱</b>（琴身空腔）有什麼作用？', a: '讓聲音變大', o: ['讓音調變高', '讓音調變低', '讓琴比較好拿'] },
        { q: '鼓面調得越<b>緊</b>，敲出來的聲音會？', a: '音調變高', o: ['音調變低', '音量變小', '完全不變'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>調音調的通則</b>：<b>越短、越細、越緊 → 振動越快 → 音越高</b>。<br>' +
          '弦樂器改變弦長；管樂器改變空氣柱長度；打擊樂器改變鼓面鬆緊或板子長短。<br>' +
          '<b>音箱</b>則是讓空氣一起共鳴，把聲音<b>放大</b>——不影響音調。'
      };
    }

    if (type === 'refract') {
      const it = Kit.pick([
        { q: '筷子斜插進水杯，看起來像斷掉，這是什麼現象？', a: '折射', o: ['反射', '色散', '影子'] },
        { q: '游泳池的水看起來比實際<b>淺</b>，原因是什麼？', a: '光從水中射出時發生折射', o: ['水會放大東西', '水把光吸收了', '池底顏色的錯覺'] },
        { q: '光從空氣<b>斜射進水中</b>，方向會怎麼變？', a: '偏折，而且偏向法線', o: ['完全不變', '原路彈回去', '偏離法線'] },
        { q: '<b>反射</b>和<b>折射</b>最大的差別是什麼？', a: '反射是彈回原介質，折射是穿過去但轉彎', o: ['反射只發生在鏡子上', '折射只發生在水裡', '兩者其實一樣'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>折射</b>：光從一種介質<b>斜射進另一種介質</b>時，行進方向會偏折（課綱 INe-Ⅲ-8）。<br>' +
          '生活例子：筷子看起來斷掉、水池看起來變淺、隔著玻璃杯看東西變形。<br>' +
          '<span style="color:var(--warn)">安全提醒：水看起來比實際淺，不會游泳的人別因此誤判水深。</span>'
      };
    }

    if (type === 'lens') {
      const it = Kit.pick([
        { q: '放大鏡是哪一種透鏡？', a: '凸透鏡（中間厚、邊緣薄）', o: ['凹透鏡（中間薄、邊緣厚）', '平面鏡', '三稜鏡'] },
        { q: '平行光通過放大鏡之後會怎樣？', a: '匯聚到一個點（焦點）', o: ['向四周散開', '原方向直直前進', '原路反射回去'] },
        { q: '用放大鏡把陽光聚在紙上，可能發生什麼事？', a: '紙會被點燃', o: ['紙會變涼', '紙會變色但不會燒', '什麼都不會發生'] }
      ]);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '放大鏡是<b>凸透鏡</b>：中間厚、邊緣薄。光穿過時被<b>折射</b>而向內偏折，' +
          '全部集中到<b>焦點</b>，所以能<b>聚光</b>，也能<b>成像</b>（課綱 INe-Ⅲ-8）。<br>' +
          '<span style="color:var(--no)">⚠️ 聚焦的陽光溫度很高，能點燃紙張。' +
          '<b>絕對不可以拿放大鏡看太陽</b>。</span>'
      };
    }

    const it = Kit.pick([
      { q: '陽光通過三稜鏡後分成七彩，代表什麼？', a: '陽光是由不同色光混合而成的', o: ['三稜鏡本身有顏色', '陽光被染色了', '三稜鏡把光變成別種東西'] },
      { q: '雨後的<b>彩虹</b>是怎麼形成的？', a: '空中的小水滴把陽光分散成不同色光', o: ['雲本身有顏色', '太陽在雨天會變色', '水滴反射了地面的顏色'] },
      { q: '把紅橙黃綠藍靛紫的<b>七色轉盤快速旋轉</b>，看起來會是什麼顏色？', a: '接近白色', o: ['黑色', '彩虹色的圈圈', '紅色'] }
    ]);
    const opts = Kit.shuffle([it.a].concat(it.o));
    return {
      q: it.q, choices: opts, answer: opts.indexOf(it.a),
      steps: '答案：<b>' + it.a + '</b><br>' +
        '課綱 INe-Ⅲ-7：「<b>陽光是由不同色光組成</b>。」<br>' +
        '不同顏色的光穿過三稜鏡時<b>偏折程度不同</b>（紫光最多、紅光最少），所以會分開，這叫<b>色散</b>。<br>' +
        '反過來把七色混合又會變回接近白色——這正好互相印證。<br>' +
        '<span style="color:var(--muted)">生活中：彩虹、光碟片反光、肥皂泡泡的七彩。</span>'
    };
  }
});
