/* ============================================================
   五下 自然（康軒）第 3 單元　植物世界的面面觀
   課綱 INb-Ⅲ-7「植物各部位的構造和所具有的功能有關，
                  有些植物產生特化的構造以適應環境。」
   教具：點植物的各部位看構造與功能；切換到「特化」看同一個部位
         在不同環境長成什麼樣子。
   ============================================================ */

Kit.register('s5b-u3', {

  intro: '點下面按鈕或直接<b>點圖上的部位</b>，看每個部位在做什麼工作。再切到「特化構造」，看同一個部位在沙漠、水裡、寄生時會長成什麼樣。',

  build: function (host) {
    const wrap = Kit.el('div', { class: 'stage', style: 'padding:14px 0;' });
    host.appendChild(wrap);
    const cv = Kit.canvas2d(wrap, 620, 360);
    const readout = Kit.el('div', { class: 'readout' });
    const controls = Kit.el('div', { class: 'controls' });

    let part = 'leaf', mode = 'normal', spec = 'cactus';

    const PARTS = {
      root:  { n: '根', col: '#c08552' },
      stem:  { n: '莖', col: '#7cb342' },
      leaf:  { n: '葉', col: '#43a047' },
      flower:{ n: '花', col: '#ec407a' },
      fruit: { n: '果實', col: '#fb8c00' },
      seed:  { n: '種子', col: '#8d6e63' }
    };

    const INFO = {
      root: {
        job: '吸收<b>水分</b>和溶在水裡的<b>養分</b>，並把植物<b>固定</b>在土裡不被風吹倒。',
        detail: '根的表面有很多細細的<b>根毛</b>，把接觸面積變得非常大，吸水才有效率。<br>' +
          '有些根還會<b>儲存養分</b>（例如蘿蔔、地瓜——我們吃的就是根）。',
        test: '把芹菜插進紅色的水裡，過幾小時看莖和葉脈變紅——證明水真的從根往上走。'
      },
      stem: {
        job: '<b>運輸</b>（把根吸的水送到葉子、把葉子做的養分送到全身）＋ <b>支撐</b>整株植物。',
        detail: '莖裡面有管線：<b>木質部</b>由下往上送水，<b>韌皮部</b>把養分送到各處。<br>' +
          '有些莖會儲存養分（馬鈴薯是<b>地下莖</b>，不是根！）。',
        test: '切開芹菜的莖橫斷面，可以看到一點一點的紅色小點，那就是運水的管子。'
      },
      leaf: {
        job: '<b>製造養分</b>（光合作用）＋ <b>蒸散</b>水分 ＋ 進行<b>呼吸</b>與氣體交換。',
        detail: '葉子用<b>陽光 ＋ 二氧化碳 ＋ 水</b> 做出養分，同時放出氧氣——這是植物最重要的工作。<br>' +
          '葉子背面有很多小孔叫<b>氣孔</b>，氣體和水蒸氣從這裡進出。<br>葉脈就是莖裡管線的延伸。',
        test: '用透明塑膠袋套住一片葉子綁緊，過幾小時袋子裡會出現水珠——那就是蒸散作用。'
      },
      flower: {
        job: '<b>繁殖</b>。花是植物的生殖器官，負責讓花粉和胚珠結合。',
        detail: '完整花有四個部分：<b>花萼、花瓣、雄蕊、雌蕊</b>。<br>' +
          '雄蕊產生<b>花粉</b>，雌蕊底部是<b>子房</b>（裡面有胚珠）。<br>' +
          '花瓣鮮豔、有香味，是為了吸引昆蟲來<b>傳粉</b>——不是為了給人看的。',
        test: '拿一朵百合或杜鵑，用鑷子一片片拆開，找出雄蕊（有粉）和雌蕊（頂端黏黏的）。'
      },
      fruit: {
        job: '<b>保護種子</b>，並幫助種子<b>傳播</b>到遠處。',
        detail: '受精之後，<b>子房</b>會發育成果實，裡面的胚珠變成<b>種子</b>。<br>' +
          '傳播方式：好吃的果實靠動物吃了帶走（芭樂）、有翅膀的靠風（楓樹）、' +
          '有鉤刺的黏在動物身上（鬼針草）、輕的浮在水上（椰子）。',
        test: '切開一顆蘋果或芭樂，找出種子在哪裡，數數看有幾顆。'
      },
      seed: {
        job: '長成<b>新的植物</b>。裡面有小小的幼苗和給它的糧食。',
        detail: '種子有三個部分：<b>種皮</b>（保護）、<b>子葉</b>（儲存養分當糧食）、<b>胚</b>（會長成幼苗）。<br>' +
          '發芽需要：<b>水、適當的溫度、空氣</b>。（注意——發芽<b>不一定</b>需要陽光。）',
        test: '把綠豆泡水一天，放在濕棉花上，兩三天就發芽。可以分成有光/無光兩組比較。'
      }
    };

    const SPECIAL = {
      cactus: {
        n: '仙人掌（沙漠）', part: '葉 → 刺',
        why: '沙漠很乾，葉子面積大會蒸散掉太多水。所以<b>葉子退化成刺</b>（順便防止被吃），' +
          '改由肥厚的<b>莖</b>來行光合作用並儲水。',
        col: '#43a047'
      },
      lotus: {
        n: '蓮／睡蓮（水中）', part: '莖、葉',
        why: '水裡缺氧，所以葉柄和莖裡有很多<b>空氣通道</b>幫助浮起來、也把空氣送到水下的部分。' +
          '葉子浮在水面且表面有<b>蠟質</b>，水滴會滾走不會積住。',
        col: '#26a69a'
      },
      sweet: {
        n: '地瓜（儲藏根）', part: '根',
        why: '把光合作用做出來的養分<b>存在根裡</b>，根就變得又肥又大。' +
          '我們吃的地瓜是<b>根</b>；但馬鈴薯是<b>地下莖</b>——這兩個最常搞混。',
        col: '#c08552'
      },
      vine: {
        n: '豌豆／絲瓜（攀緣）', part: '葉或莖 → 捲鬚',
        why: '莖太軟站不直，所以長出<b>捲鬚</b>纏住支撐物往上爬，才搶得到陽光。',
        col: '#7cb342'
      },
      dodder: {
        n: '菟絲子（寄生）', part: '根 → 吸器',
        why: '菟絲子沒有葉綠素、幾乎不行光合作用，<b>根特化成吸器</b>插進別的植物體內吸養分。',
        col: '#fbc02d'
      }
    };

    /* ---------- 繪圖 ---------- */
    function hit(x, y) {
      // 回傳點到的部位
      const zones = [
        ['root', 190, 280, 130, 70], ['stem', 240, 150, 30, 130],
        ['leaf', 130, 170, 100, 50], ['leaf2', 280, 170, 100, 50],
        ['flower', 218, 84, 74, 62], ['fruit', 300, 118, 56, 50], ['seed', 316, 134, 24, 24]
      ];
      for (const z of zones) {
        if (x >= z[1] && x <= z[1] + z[3] && y >= z[2] && y <= z[2] + z[4]) {
          return z[0] === 'leaf2' ? 'leaf' : z[0];
        }
      }
      return null;
    }

    function drawPlant() {
      const ctx = cv.ctx;
      const on = p => part === p;
      const glow = p => on(p) ? 4 : 0;

      // 土
      ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, 280, cv.W, 80);
      ctx.strokeStyle = '#5a4536'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 280); ctx.lineTo(cv.W, 280); ctx.stroke();

      // 根
      ctx.strokeStyle = PARTS.root.col; ctx.lineWidth = 5 + glow('root');
      [[-1, 1], [0, 1.3], [1, 1]].forEach(([dx, len]) => {
        ctx.beginPath();
        ctx.moveTo(255, 282);
        ctx.quadraticCurveTo(255 + dx * 40, 300, 255 + dx * 62, 282 + 52 * len);
        ctx.stroke();
      });
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {   // 根毛
        const t = i / 14, x = 255 + (i % 3 - 1) * 46 * t, y = 292 + 46 * t;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (i % 2 ? 9 : -9), y + 6); ctx.stroke();
      }

      // 莖
      ctx.strokeStyle = PARTS.stem.col; ctx.lineWidth = 11 + glow('stem');
      ctx.beginPath(); ctx.moveTo(255, 282); ctx.lineTo(255, 150); ctx.stroke();

      // 葉（左右各一）
      ctx.fillStyle = PARTS.leaf.col;
      [[-1, 205], [1, 190]].forEach(([s, y]) => {
        ctx.save(); ctx.translate(255, y); ctx.scale(s, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(45, -34, 96, -6);
        ctx.quadraticCurveTo(46, 24, 0, 0);
        ctx.closePath();
        ctx.fill();
        if (on('leaf')) { ctx.strokeStyle = '#d7ffd9'; ctx.lineWidth = 3; ctx.stroke(); }
        // 葉脈
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(4, -1); ctx.lineTo(92, -6); ctx.stroke();
        for (let i = 1; i <= 4; i++) {
          const t = i / 5;
          ctx.beginPath(); ctx.moveTo(4 + 88 * t, -1 - 5 * t);
          ctx.lineTo(4 + 88 * t + 8, -1 - 5 * t - 12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(4 + 88 * t, -1 - 5 * t);
          ctx.lineTo(4 + 88 * t + 8, -1 - 5 * t + 10); ctx.stroke();
        }
        ctx.restore();
      });

      // 花
      ctx.save(); ctx.translate(255, 116);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillStyle = PARTS.flower.col;
        ctx.beginPath(); ctx.ellipse(0, -26, 15, 26, 0, 0, Math.PI * 2); ctx.fill();
        if (on('flower')) { ctx.strokeStyle = '#ffd9e8'; ctx.lineWidth = 2.5; ctx.stroke(); }
      }
      ctx.fillStyle = '#fdd835';
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // 果實（右上）
      ctx.fillStyle = PARTS.fruit.col;
      ctx.beginPath(); ctx.ellipse(328, 143, 28, 25, 0, 0, Math.PI * 2); ctx.fill();
      if (on('fruit')) { ctx.strokeStyle = '#ffe0b2'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.strokeStyle = PARTS.stem.col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(263, 152); ctx.lineTo(310, 143); ctx.stroke();
      // 種子（果實裡）
      ctx.fillStyle = PARTS.seed.col;
      [[-8, -3], [6, 2], [-2, 8]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.ellipse(328 + dx, 143 + dy, 5, 7, .4, 0, Math.PI * 2); ctx.fill();
      });
      if (on('seed')) {
        ctx.strokeStyle = '#ffe0b2'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(328, 143, 16, 0, Math.PI * 2); ctx.stroke();
      }

      // 標籤
      ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      const labels = [['根', 200, 336, 'root'], ['莖', 232, 250, 'stem'], ['葉', 140, 196, 'leaf'],
        ['花', 255, 62, 'flower'], ['果實', 372, 130, 'fruit'], ['種子', 372, 160, 'seed']];
      labels.forEach(([t, x, y, p]) => {
        ctx.fillStyle = on(p) ? '#fbbf24' : '#93a3c4';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(t, x, y);
      });
      ctx.fillStyle = '#5a6b8c'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('（可以直接點圖上的部位）', 16, 22);
    }

    function drawSpecial() {
      const ctx = cv.ctx;
      const S = SPECIAL[spec];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('特化：同一個部位，為了適應不同環境長成不一樣的樣子', 16, 22);

      const cx = 200, cy = 190;
      if (spec === 'cactus') {
        ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, 290, cv.W, 70);
        ctx.fillStyle = '#43a047';
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - 44, cy - 90, 88, 200, 40) : ctx.rect(cx - 44, cy - 90, 88, 200);
        ctx.fill();
        ctx.fillStyle = '#388e3c';
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx + 40, cy - 20, 60, 90, 28) : ctx.rect(cx + 40, cy - 20, 60, 90);
        ctx.fill();
        ctx.strokeStyle = '#e8eefc'; ctx.lineWidth = 1.6;
        for (let r = 0; r < 9; r++) for (let c2 = 0; c2 < 3; c2++) {
          const x = cx - 30 + c2 * 30, y = cy - 74 + r * 21;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y - 6); ctx.stroke();
        }
      } else if (spec === 'lotus') {
        ctx.fillStyle = '#1e4a5f'; ctx.fillRect(0, 180, cv.W, 180);
        ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(cv.W, 180); ctx.stroke();
        ctx.fillStyle = '#26a69a';
        [[150, 176, 66], [270, 172, 52], [90, 170, 40]].forEach(([x, y, r]) => {
          ctx.beginPath(); ctx.ellipse(x, y, r, r * .3, 0, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 7;
        [[150, 176], [270, 172]].forEach(([x, y]) => {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, 330); ctx.stroke();
        });
        // 通氣孔
        ctx.fillStyle = '#0e1726';
        for (let i = 0; i < 10; i++) {
          ctx.beginPath(); ctx.arc(152 + (i % 2 ? 4 : -4), 200 + i * 13, 2.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.fillText('莖裡有通氣道', 176, 262);
      } else if (spec === 'sweet') {
        ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, 160, cv.W, 200);
        ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(cx, 160); ctx.lineTo(cx, 90); ctx.stroke();
        ctx.fillStyle = '#43a047';
        [[-1, 110], [1, 128]].forEach(([s, y]) => {
          ctx.save(); ctx.translate(cx, y); ctx.scale(s, 1);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -28, 80, -4);
          ctx.quadraticCurveTo(40, 20, 0, 0); ctx.fill(); ctx.restore();
        });
        ctx.fillStyle = '#c0552b';
        [[cx - 46, 226, 40, 22], [cx + 34, 250, 46, 25], [cx - 10, 292, 52, 26]].forEach(([x, y, rx, ry]) => {
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, .3, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = '#c08552'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, 162); ctx.lineTo(cx - 40, 220); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 162); ctx.lineTo(cx + 30, 244); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 162); ctx.lineTo(cx - 8, 286); ctx.stroke();
      } else if (spec === 'vine') {
        ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, 320, cv.W, 40);
        ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(340, 60); ctx.lineTo(340, 320); ctx.stroke();
        ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(150, 320);
        ctx.bezierCurveTo(200, 260, 300, 250, 336, 170);
        ctx.stroke();
        // 捲鬚
        ctx.strokeStyle = '#8bc34a'; ctx.lineWidth = 3;
        [[250, 262], [300, 226], [330, 186]].forEach(([x, y]) => {
          ctx.beginPath();
          for (let i = 0; i <= 40; i++) {
            const t = i / 40, ang = t * Math.PI * 4;
            const px = x + Math.cos(ang) * 11 * (1 - t * .3) + t * 22;
            const py = y + Math.sin(ang) * 11 * (1 - t * .3) - t * 10;
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
        });
        ctx.fillStyle = '#43a047';
        [[190, 296], [246, 268], [296, 238]].forEach(([x, y]) => {
          ctx.beginPath(); ctx.ellipse(x, y, 26, 15, -.4, 0, Math.PI * 2); ctx.fill();
        });
      } else {
        ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, 320, cv.W, 40);
        ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(180, 320); ctx.lineTo(180, 90); ctx.stroke();
        ctx.fillStyle = '#43a047';
        [[110, 140], [250, 175], [120, 220]].forEach(([x, y]) => {
          ctx.beginPath(); ctx.ellipse(x, y, 40, 22, .2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = '#fbc02d'; ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const t = i / 200, y = 300 - t * 190;
          const x = 180 + Math.sin(t * Math.PI * 6) * 26;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#f9a825';
        for (let i = 0; i < 5; i++) {
          const t = i / 5 + .1, y = 300 - t * 190;
          ctx.beginPath(); ctx.arc(180 + Math.sin(t * Math.PI * 6) * 26, y, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#93a3c4'; ctx.font = '12px "Microsoft JhengHei", sans-serif';
        ctx.fillText('黃色 = 菟絲子（吸器插進宿主）', 250, 300);
      }

      ctx.fillStyle = '#e8eefc'; ctx.font = 'bold 17px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(S.n, 420, 60);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
      ctx.fillText('特化部位：' + S.part, 420, 92);
    }

    /* ---------- 模式 C：繁殖方式（對應單元活動 02） ---------- */
    const REPRO = {
      seed: {
        n: '種子繁殖', kind: '有性繁殖', part: '花 → 果實 → 種子', col: '#ec407a',
        how: '花授粉受精後，<b>子房</b>發育成果實、<b>胚珠</b>發育成種子。種子傳播出去，長成新的植物。',
        why: '子代同時得到<b>兩個親代</b>的特徵，所以每一顆種子長出來的都<b>略有不同</b>——這是好事，' +
          '環境改變時比較有機會有個體活下來。',
        ex: '稻、玉米、鳳仙花、蘋果、向日葵'
      },
      tuberStem: {
        n: '塊莖（馬鈴薯）', kind: '無性繁殖', part: '莖', col: '#7cb342',
        how: '把有<b>芽眼</b>的馬鈴薯切塊種下去，每個芽眼都會長成一株新的。',
        why: '芽眼就是莖上的<b>芽</b>——這是判斷「它是莖不是根」最可靠的證據。',
        ex: '馬鈴薯、薑、洋芋'
      },
      tuberRoot: {
        n: '塊根（地瓜）', kind: '無性繁殖', part: '根', col: '#c08552',
        how: '地瓜埋在土裡會長出<b>芽和藤</b>，剪下藤蔓插進土裡就能長成新的一株。',
        why: '地瓜是<b>儲藏根</b>，把葉子做的養分存起來，所以又肥又甜。' +
          '⚠️ 常和馬鈴薯搞混——地瓜是<b>根</b>，馬鈴薯是<b>莖</b>。',
        ex: '地瓜（甘藷）'
      },
      runner: {
        n: '走莖（草莓）', kind: '無性繁殖', part: '莖', col: '#8bc34a',
        how: '母株長出貼著地面爬的<b>走莖</b>，走莖碰到土的地方會長根、長葉，變成一株新的。',
        why: '不用種子就能快速擴張地盤，一個夏天可以爬出好幾株。',
        ex: '草莓、酢漿草、蟹爪蘭'
      },
      cutting: {
        n: '扦插', kind: '無性繁殖', part: '莖（人為）', col: '#66bb6a',
        how: '剪一段<b>莖</b>插進土或水裡，斷口會長出新的根。',
        why: '農民和園藝最常用的方法。因為是複製，<b>子代和母株一模一樣</b>——' +
          '想要保留某一株的優良特性（例如特別甜的水果）就用這招。',
        ex: '玫瑰、九重葛、地瓜葉、薄荷、黃金葛'
      },
      leafBud: {
        n: '葉芽（落地生根）', kind: '無性繁殖', part: '葉', col: '#43a047',
        how: '葉子邊緣直接長出<b>小芽</b>，小芽掉到地上就長成一株新的。',
        why: '連葉子都能繁殖，是「植物各部位都可能有繁殖功能」最戲劇化的例子。',
        ex: '落地生根、石蓮花、非洲堇'
      }
    };
    let repro = 'seed';

    function drawRepro() {
      const ctx = cv.ctx;
      const Rp = REPRO[repro];
      ctx.fillStyle = '#93a3c4'; ctx.font = '13px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('植物不是只能用種子繁殖——根、莖、葉都可以長出新的一株', 16, 22);

      // 左：母株 → 中：繁殖構造 → 右：新株
      const y0 = 190;
      ctx.fillStyle = '#3b2f26'; ctx.fillRect(0, y0 + 40, cv.W, cv.H - y0 - 40);
      ctx.strokeStyle = '#5a4536'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, y0 + 40); ctx.lineTo(cv.W, y0 + 40); ctx.stroke();

      function plant(cx, scale, label, dim) {
        ctx.save(); ctx.translate(cx, y0 + 40); ctx.scale(scale, scale);
        ctx.globalAlpha = dim ? .45 : 1;
        ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 7 / scale;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke();
        ctx.fillStyle = '#43a047';
        [[-1, -40], [1, -58]].forEach(([s, yy]) => {
          ctx.save(); ctx.scale(s, 1);
          ctx.beginPath(); ctx.moveTo(0, yy);
          ctx.quadraticCurveTo(34, yy - 22, 66, yy - 3);
          ctx.quadraticCurveTo(34, yy + 16, 0, yy); ctx.fill();
          ctx.restore();
        });
        ctx.strokeStyle = '#c08552'; ctx.lineWidth = 3 / scale;
        [-1, 0, 1].forEach(d => {
          ctx.beginPath(); ctx.moveTo(0, 2);
          ctx.quadraticCurveTo(d * 16, 22, d * 26, 46); ctx.stroke();
        });
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.fillStyle = dim ? '#5a6b8c' : '#e8eefc';
        ctx.font = 'bold 14px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(label, cx, y0 + 96);
      }

      plant(110, 1, '母株', false);
      plant(510, 0.62, '新的一株', false);

      // 中間的繁殖構造
      const mx = 310, my = y0 - 10;
      ctx.fillStyle = Rp.col;
      if (repro === 'seed') {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.ellipse(mx - 26 + i * 26, my, 9, 12, .3, 0, Math.PI * 2); ctx.fill();
        }
      } else if (repro === 'runner') {
        ctx.strokeStyle = Rp.col; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(mx - 80, y0 + 34);
        ctx.quadraticCurveTo(mx, y0 + 6, mx + 80, y0 + 34); ctx.stroke();
      } else if (repro === 'leafBud') {
        ctx.beginPath(); ctx.ellipse(mx, my, 46, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8bc34a';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath(); ctx.arc(mx + i * 18, my + 20, 5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (repro === 'cutting') {
        ctx.strokeStyle = Rp.col; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(mx, my - 26); ctx.lineTo(mx, my + 30); ctx.stroke();
        ctx.strokeStyle = '#c08552'; ctx.lineWidth = 2.5;
        [-1, 0, 1].forEach(d => {
          ctx.beginPath(); ctx.moveTo(mx, my + 28);
          ctx.quadraticCurveTo(mx + d * 12, my + 44, mx + d * 20, my + 58); ctx.stroke();
        });
      } else {
        ctx.beginPath(); ctx.ellipse(mx, my + 6, 44, 30, .2, 0, Math.PI * 2); ctx.fill();
        if (repro === 'tuberStem') {   // 芽眼
          ctx.fillStyle = '#33691e';
          [[-18, -6], [8, -12], [16, 8], [-6, 12]].forEach(([dx, dy]) => {
            ctx.beginPath(); ctx.arc(mx + dx, my + 6 + dy, 4, 0, Math.PI * 2); ctx.fill();
          });
          ctx.fillStyle = '#93a3c4'; ctx.font = '11px "Microsoft JhengHei", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('深色小點 = 芽眼', mx, my + 42);
        }
      }
      // 箭頭
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
      [[180, mx - 70], [mx + 70, 440]].forEach(([x1, x2]) => {
        ctx.beginPath(); ctx.moveTo(x1, my + 4); ctx.lineTo(x2, my + 4); ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.moveTo(x2, my + 4); ctx.lineTo(x2 - 11, my - 2);
        ctx.lineTo(x2 - 11, my + 10); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = Rp.col; ctx.font = 'bold 16px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(Rp.n, mx, my - 44);
    }

    function paint() {
      cv.clear('#0e1726');
      if (mode === 'repro') {
        drawRepro();
        const Rp = REPRO[repro];
        readout.innerHTML =
          '<div class="big">' + Rp.n + '　<span style="color:' + Rp.col + '">' + Rp.kind +
          '</span>　用到的部位：<b>' + Rp.part + '</b></div>' +
          '<b>怎麼繁殖</b>：' + Rp.how + '<br>' +
          '<b>為什麼重要</b>：' + Rp.why + '<br>' +
          '<b>例子</b>：' + Rp.ex + '<br>' +
          '<span style="color:var(--muted)">兩大類的差別：<b>有性繁殖</b>（種子）需要花授粉受精，' +
          '子代和親代<b>不完全一樣</b>；<b>無性繁殖</b>（用根莖葉）不需要花，' +
          '子代等於母株的<b>複製品</b>，長得快但缺乏變化。</span>';
        return;
      }
      if (mode === 'normal') {
        drawPlant();
        const I = INFO[part];
        readout.innerHTML =
          '<div class="big">' + PARTS[part].n + '：' + I.job + '</div>' +
          I.detail + '<br>' +
          '<span style="color:var(--ok)">🔬 在家可以做：' + I.test + '</span>';
      } else {
        drawSpecial();
        const S = SPECIAL[spec];
        readout.innerHTML =
          '<div class="big">' + S.n + '　特化部位：<b>' + S.part + '</b></div>' + S.why + '<br>' +
          '<span style="color:var(--muted)">課綱 INb-Ⅲ-7 說「有些植物產生<b>特化的構造以適應環境</b>」。' +
          '重點不是背名稱，是理解「<b>為什麼</b>長成這樣」——每一種特化都在解決某個生存問題。</span>';
      }
    }

    cv.canvas.addEventListener('click', function (e) {
      if (mode !== 'normal') return;
      const rect = cv.canvas.getBoundingClientRect();
      const p = hit((e.clientX - rect.left) * cv.W / rect.width, (e.clientY - rect.top) * cv.H / rect.height);
      if (p) { part = p; partSeg.select(p); paint(); }
    });

    // 三個模式剛好對應課本這一單元的三個活動
    const modeSeg = Kit.segmented('模式', [
      { label: '① 如何獲取養分（各部位功能）', value: 'normal' },
      { label: '② 有哪些繁殖方式', value: 'repro' },
      { label: '③ 有哪些妙招（特化構造）', value: 'special' }
    ], function (v) {
      mode = v;
      partSeg.wrap.style.display = v === 'normal' ? '' : 'none';
      reproSeg.wrap.style.display = v === 'repro' ? '' : 'none';
      specSeg.wrap.style.display = v === 'special' ? '' : 'none';
      paint();
    }, mode);

    const partSeg = Kit.segmented('部位', Object.keys(PARTS).map(k => ({ label: PARTS[k].n, value: k })),
      function (v) { part = v; paint(); }, part);
    const reproSeg = Kit.segmented('繁殖方式', Object.keys(REPRO).map(k => ({ label: REPRO[k].n, value: k })),
      function (v) { repro = v; paint(); }, repro);
    const specSeg = Kit.segmented('看哪一種', Object.keys(SPECIAL).map(k => ({ label: SPECIAL[k].n, value: k })),
      function (v) { spec = v; paint(); }, spec);
    reproSeg.wrap.style.display = 'none';
    specSeg.wrap.style.display = 'none';

    controls.appendChild(modeSeg.wrap);
    controls.appendChild(partSeg.wrap);
    controls.appendChild(reproSeg.wrap);
    controls.appendChild(specSeg.wrap);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(Kit.el('p', {
      class: 'hint',
      html: '核心觀念：<b>構造和功能是配合的</b>。看到一個奇怪的構造，就問「它在什麼環境？要解決什麼問題？」'
    }));

    paint();
    return null;
  },

  parentGuide: [
    { ask: '「植物哪個部位在做飯？哪個在喝水？」', why: '葉在做飯（光合作用），根在喝水。用擬人化最快建立分工的概念，之後再補正式名詞。' },
    { ask: '「花為什麼要開得漂亮又有香味？」', why: '不是為了給人看，是為了<b>吸引昆蟲傳粉</b>。這一問可以打破「植物為人而存在」的想法。' },
    { ask: '「我們吃的地瓜是根還是莖？馬鈴薯呢？」', why: '地瓜是<b>根</b>，馬鈴薯是<b>地下莖</b>。這是經典考題，也是很好的觀察題——馬鈴薯上有芽眼（芽從莖長出來）。' },
    { ask: '切到繁殖模式：「植物一定要用種子才能生小孩嗎？」', why: '不一定。根（地瓜）、莖（馬鈴薯、草莓走莖、扦插）、葉（落地生根）都可以。這是這一單元最反直覺、也最好玩的一段。' },
    { ask: '「切一塊馬鈴薯種下去會長出馬鈴薯，切一塊地瓜也會——那它們是同一種東西嗎？」', why: '不是。馬鈴薯用的是<b>莖</b>（有芽眼），地瓜用的是<b>根</b>。這一題把「繁殖方式」和「部位辨識」串起來。' },
    { ask: '「用扦插種出來的玫瑰，和用種子種出來的，有什麼不一樣？」', why: '扦插是<b>複製</b>，和母株一模一樣；種子是父母各給一半，每株都略有不同。農民想保留優良品種就用扦插。' },
    { ask: '「仙人掌的刺是什麼變的？為什麼要變成刺？」', why: '是<b>葉</b>變的。沙漠缺水，大葉子會蒸散太多水，變成刺可以省水又能防被吃。' },
    { ask: '實驗：白色花（或芹菜）插進紅墨水，隔幾小時看。', why: '會看到葉脈變紅，直接證明「根吸水、莖運送」。這是這一章最值得做的實驗，材料超市就有。' },
    { ask: '「種子發芽需要什麼？需要陽光嗎？」', why: '需要水、空氣、適當溫度；<b>不一定需要陽光</b>。可以做兩組綠豆（有光/黑暗）對照，結果會讓孩子很驚訝。' }
  ],

  pitfalls: [
    { bad: '以為所有長在地下的都是根。', fix: '馬鈴薯、薑是<b>地下莖</b>（有芽眼、有節），地瓜、蘿蔔才是<b>根</b>。分辨法：莖有節和芽。' },
    { bad: '以為種子發芽一定要陽光。', fix: '發芽只需要<b>水、空氣、適當溫度</b>。（長成幼苗之後才需要陽光行光合作用。）' },
    { bad: '以為植物只行光合作用、不呼吸。', fix: '植物<b>一直都在呼吸</b>，白天光合作用比較旺盛所以整體放出氧氣，晚上只呼吸。' },
    { bad: '把「果實」和「種子」混為一談。', fix: '<b>子房</b>發育成果實，<b>胚珠</b>發育成種子。果實包在外面，種子在裡面。' },
    { bad: '以為特化構造是「植物想要變成那樣」。', fix: '是長期<b>適應環境</b>的結果，不是植物有意識地改變。講因果就好，不用講演化機制。' },
    { bad: '以為植物只能用種子繁殖。', fix: '根、莖、葉都可以。地瓜（根）、馬鈴薯與草莓（莖）、落地生根（葉）都是常見例子。', src: 'INb-Ⅲ-7' },
    { bad: '把「無性繁殖」當成比較低等或比較差的方式。', fix: '各有優缺點：無性繁殖<b>長得快、完全複製</b>（適合保留優良品種）；有性繁殖<b>子代有變化</b>（環境改變時比較有機會存活）。' },
    { bad: '以為扦插的枝條會長出「種子的根」。', fix: '扦插長出來的是<b>不定根</b>——從莖的斷口直接長根，和種子發芽長的根不同來源，但功能一樣。' }
  ],

  quiz: function () {
    const type = Kit.pick(['job', 'special', 'rootstem', 'germ', 'repro', 'repro', 'sexual']);

    if (type === 'repro') {
      const items = [
        { q: '<b>馬鈴薯</b>是用哪個部位繁殖的？', a: '莖', o: ['根', '葉', '種子'] },
        { q: '<b>地瓜</b>是用哪個部位繁殖的？', a: '根', o: ['莖', '葉', '花'] },
        { q: '<b>落地生根</b>是用哪個部位繁殖的？', a: '葉', o: ['根', '莖', '種子'] },
        { q: '<b>草莓</b>靠著貼地爬行的構造繁殖，那個構造叫什麼？', a: '走莖', o: ['走根', '匍匐葉', '氣生根'] },
        { q: '把玫瑰剪一段插進土裡讓它長根，這種方法叫什麼？', a: '扦插', o: ['嫁接', '壓條', '播種'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<b>用種子以外的方式繁殖（無性繁殖）</b>：<br>' +
          '<b>根</b>——地瓜<br>' +
          '<b>莖</b>——馬鈴薯（塊莖，有芽眼）、薑、草莓（走莖）、扦插的玫瑰／地瓜葉<br>' +
          '<b>葉</b>——落地生根、石蓮花<br>' +
          '<span style="color:var(--muted)">判斷「是根還是莖」的關鍵：<b>莖有節和芽</b>（馬鈴薯的芽眼就是芽）。</span>'
      };
    }

    if (type === 'sexual') {
      const askSeed = Math.random() < .5;
      const opts = Kit.shuffle([
        { t: '子代和母株一模一樣（等於複製）', v: 'clone' },
        { t: '子代和親代不完全一樣，每一株都略有差異', v: 'vary' },
        { t: '子代一定比親代高大', v: 'x1' },
        { t: '子代不會開花', v: 'x2' }
      ]);
      return {
        q: '用<b>' + (askSeed ? '種子（有性繁殖）' : '扦插（無性繁殖）') + '</b>繁殖出來的植物，有什麼特點？',
        choices: opts.map(o => o.t), answer: opts.findIndex(o => o.v === (askSeed ? 'vary' : 'clone')),
        steps: '<b>有性繁殖（種子）</b>：需要花授粉受精，子代同時得到兩個親代的特徵，' +
          '所以<b>每一株都略有不同</b>。環境改變時，比較有機會有個體活下來。<br>' +
          '<b>無性繁殖（根莖葉）</b>：不需要花，子代是母株的<b>複製品</b>，長得快，' +
          '而且能完整保留母株的優點——農民想留住特別甜的品種就用扦插。'
      };
    }

    if (type === 'job') {
      const items = [
        { p: '根', j: '吸收水分和養分，並固定植物' },
        { p: '莖', j: '運輸水分和養分，並支撐植物' },
        { p: '葉', j: '行光合作用製造養分' },
        { p: '花', j: '負責繁殖（產生花粉和胚珠）' },
        { p: '果實', j: '保護種子並幫助種子傳播' },
        { p: '種子', j: '長成新的植物' }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.j].concat(
        Kit.shuffle(items.filter(x => x.p !== it.p)).slice(0, 3).map(x => x.j)));
      return {
        q: '植物的「<b>' + it.p + '</b>」主要負責什麼工作？',
        choices: opts, answer: opts.indexOf(it.j),
        steps: '<b>' + it.p + '：' + it.j + '</b><br>整株植物的分工：<br>' +
          items.map(x => '<b>' + x.p + '</b>　' + x.j).join('<br>')
      };
    }

    if (type === 'special') {
      const items = [
        { q: '仙人掌的<b>刺</b>是哪個部位變成的？', a: '葉', o: ['莖', '根', '花'] },
        { q: '豌豆的<b>捲鬚</b>主要功能是什麼？', a: '纏住支撐物往上爬，搶陽光', o: ['吸收水分', '製造養分', '吸引昆蟲'] },
        { q: '仙人掌<b>肥厚的莖</b>有什麼功能？', a: '儲水並代替葉子行光合作用', o: ['吸收土裡的水', '吸引昆蟲', '保護種子'] },
        { q: '睡蓮的<b>葉柄裡有很多空氣通道</b>，是為了什麼？', a: '水裡缺氧，用來輸送空氣並幫助浮起來', o: ['儲存養分', '增加重量沉下去', '吸引魚類'] }
      ];
      const it = Kit.pick(items);
      const opts = Kit.shuffle([it.a].concat(it.o));
      return {
        q: it.q, choices: opts, answer: opts.indexOf(it.a),
        steps: '答案：<b>' + it.a + '</b><br>' +
          '<span style="color:var(--muted)">特化構造的判斷方法：先看它<b>住在什麼環境</b>，再想<b>那個環境有什麼難題</b>。<br>' +
          '沙漠 → 缺水 → 葉變刺省水、莖變肥儲水<br>水中 → 缺氧 → 莖有通氣道<br>' +
          '沒有支撐 → 搶不到陽光 → 長捲鬚往上爬</span>'
      };
    }

    if (type === 'rootstem') {
      const items = [['地瓜', '根'], ['蘿蔔', '根'], ['紅蘿蔔', '根'],
                     ['馬鈴薯', '莖'], ['薑', '莖'], ['蓮藕', '莖'], ['洋蔥', '葉']];
      const it = Kit.pick(items);
      const opts = ['根', '莖', '葉'];
      return {
        q: '我們吃的「<b>' + it[0] + '</b>」，是植物的哪一個部位？',
        choices: opts, answer: opts.indexOf(it[1]),
        steps: '<b>' + it[0] + ' 是「' + it[1] + '」。</b><br>' +
          '分辨法：<b>莖有「節」和「芽」</b>，根沒有。<br>' +
          '根：地瓜、蘿蔔、紅蘿蔔（儲藏根）<br>' +
          '地下莖：馬鈴薯（有芽眼）、薑、蓮藕（有節）<br>' +
          '葉：洋蔥（一層一層的鱗葉）<br>' +
          '<span style="color:var(--muted)">「長在地下就是根」是錯的，這是最常考的陷阱。</span>'
      };
    }

    const opts = Kit.shuffle([
      { t: '水、空氣、適當的溫度', ok: true },
      { t: '水、陽光、土壤', ok: false },
      { t: '陽光、空氣、肥料', ok: false },
      { t: '水、陽光、肥料', ok: false }
    ]);
    return {
      q: '種子<b>發芽</b>需要什麼條件？',
      choices: opts.map(o => o.t), answer: opts.findIndex(o => o.ok),
      steps: '發芽需要：<b>水、空氣、適當的溫度</b>。<br>' +
        '⚠️ <b>不一定需要陽光</b>——種子裡的子葉已經存好糧食了，不用自己製造養分。<br>' +
        '⚠️ 也<b>不一定需要土壤</b>——放在濕棉花上一樣會發芽。<br>' +
        '<span style="color:var(--muted)">陽光和土壤是「長大」之後才需要的，不是「發芽」的條件。' +
        '在家用綠豆做有光／無光兩組對照，一看就懂。</span>'
    };
  }
});
