/* ============================================================
   kit.js — 共用工具：章節註冊表、DOM 小工具、練習題引擎、3D 場景樣板
   全部以傳統 script 撰寫（非 ES module），因此直接用瀏覽器開啟
   本機 index.html（file://）即可運作，不需要架伺服器、不需要網路。
   ============================================================ */

const Kit = (function () {
  const registry = {};

  /* ---------- 章節註冊 ---------- */
  function register(id, def) { registry[id] = def; }
  function get(id) { return registry[id]; }

  /* ---------- DOM 小工具 ---------- */
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }

  /* 滑桿 + 即時數值，回傳 {wrap, input} */
  function slider(label, opts) {
    const input = el('input', {
      type: 'range', min: opts.min, max: opts.max,
      step: opts.step || 1, value: opts.value
    });
    const out = el('output', { text: opts.format ? opts.format(opts.value) : opts.value });
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      out.textContent = opts.format ? opts.format(v) : v;
      if (opts.onChange) opts.onChange(v);
    });
    const wrap = el('label', { class: 'ctl ctl-slider' }, [
      el('span', { class: 'ctl-label' }, [label]), input, out
    ]);
    return { wrap: wrap, input: input, output: out };
  }

  /* 一排互斥按鈕，回傳 {wrap, select(value)} */
  function segmented(label, items, onPick, initial) {
    const btns = [];
    const row = el('div', { class: 'seg' });
    items.forEach(it => {
      const b = el('button', { type: 'button', class: 'seg-btn', text: it.label });
      b.addEventListener('click', () => { select(it.value); onPick(it.value); });
      btns.push({ b: b, v: it.value });
      row.appendChild(b);
    });
    function select(v) { btns.forEach(x => x.b.classList.toggle('on', x.v === v)); }
    select(initial !== undefined ? initial : items[0].value);
    return {
      wrap: el('div', { class: 'ctl' }, [el('span', { class: 'ctl-label' }, [label]), row]),
      select: select
    };
  }

  function button(text, onClick, cls) {
    return el('button', { type: 'button', class: 'btn ' + (cls || ''), text: text, onClick: onClick });
  }

  /* ---------- 練習題引擎 ----------
     題目物件格式：
       { q: '題目文字（可含 HTML）',
         choices: ['A','B','C','D'],   // 選擇題
         answer: 1,                    // choices 的索引
         steps: '解題步驟（HTML）' }
     或
       { q: '...', input: 'number', answer: 42, tolerance: 0, unit: '平方公分', steps: '...' }

     opts（可省略）：
       key    章節 id。有給就會在 localStorage 記「本章最佳」與累計題數，
              孩子看得到自己的進步；沒給就只算這一回合。
       scope  紀錄的稱呼，預設「本章」；整冊混合時傳「整冊」。

     設計重點（家長陪讀情境）：
       - 每回合 5／10／20 題可選，同一回合不重複出同一題
       - 答錯一定明白寫出正確答案，不只靠解題步驟裡有沒有提到
       - 回合結束有星等、錯題回顧、本章最佳紀錄；全對放彩帶
       - 答完自動把焦點放到「下一題」，鍵盤 Enter 就能往下走
  */
  const QUIZ_LENGTHS = [5, 10, 20];
  const PRAISE = ['✅ 答對了！', '✅ 沒錯！', '✅ 很好！', '✅ 正確！', '✅ 就是這樣！', '✅ 答對，繼續！'];
  const PERFECT = ['太厲害了，全對！🎉', '滿分！這一章你已經完全掌握了 🎉', '全部答對，超強！🎉'];

  function loadStats() {
    try { return JSON.parse(localStorage.getItem('quiz-stats') || '{}') || {}; } catch (e) { return {}; }
  }
  function saveStats(all) {
    try { localStorage.setItem('quiz-stats', JSON.stringify(all)); } catch (e) { /* 私密模式等情況忽略 */ }
  }
  /* ---- 進度碼：把 localStorage 裡的成績搬到另一台裝置，不需要帳號、不需要網路 ----
     格式：EI1. + base64(JSON)。匯入採「合併」：最佳成績取大、累計相加，不會覆蓋掉本機已有的。 */
  function exportProgress() {
    const payload = { v: 1, t: new Date().toISOString().slice(0, 10), stats: loadStats() };
    return 'EI1.' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  function importProgress(code) {
    code = String(code || '').trim();
    if (code.indexOf('EI1.') !== 0) throw new Error('這不是進度碼（應該以 EI1. 開頭）');
    let payload;
    try { payload = JSON.parse(decodeURIComponent(escape(atob(code.slice(4))))); }
    catch (e) { throw new Error('進度碼不完整或被改過，請重新複製整段'); }
    if (!payload || payload.v !== 1 || typeof payload.stats !== 'object') throw new Error('進度碼版本不對');
    const mine = loadStats();
    let chapters = 0, questions = 0;
    Object.keys(payload.stats).forEach(k => {
      const inc = payload.stats[k] || {};
      const cur = mine[k] || (mine[k] = { best: {}, total: 0, correct: 0, rounds: 0 });
      cur.total = (cur.total || 0) + (inc.total || 0);
      cur.correct = (cur.correct || 0) + (inc.correct || 0);
      cur.rounds = (cur.rounds || 0) + (inc.rounds || 0);
      cur.best = cur.best || {};
      Object.keys(inc.best || {}).forEach(len => {
        if (cur.best[len] === undefined || inc.best[len] > cur.best[len]) cur.best[len] = inc.best[len];
      });
      chapters++; questions += inc.total || 0;
    });
    saveStats(mine);
    return { chapters: chapters, questions: questions, date: payload.t };
  }
  function clearProgress() { try { localStorage.removeItem('quiz-stats'); } catch (e) { /* ignore */ } }

  /* 0.1+0.2 這種浮點尾巴不要原樣印出來 */
  function fmtNum(v) { return Number.isInteger(v) ? String(v) : String(parseFloat(v.toFixed(6))); }

  /* 全對時在練習題卡片上撒一下彩帶，兩秒多就自己收掉。尊重「減少動態效果」設定。 */
  function confetti(host) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = (host.closest && host.closest('.card')) || host;
    const W = card.clientWidth, H = card.clientHeight;
    if (!W || !H) return;
    const cv = el('canvas', { class: 'pr-confetti' });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    card.appendChild(cv);
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    const colors = ['#4da3ff', '#7c5cff', '#34d399', '#fbbf24', '#fb7185', '#e8eefc'];
    const ps = [];
    for (let i = 0; i < 90; i++) {
      ps.push({
        x: Math.random() * W, y: -10 - Math.random() * Math.min(H, 300) * 0.5,
        vx: (Math.random() - 0.5) * 80, vy: 140 + Math.random() * 180,
        s: 5 + Math.random() * 5, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 8,
        c: colors[i % colors.length]
      });
    }
    const t0 = performance.now();
    let last = t0;
    function frame(now) {
      if (!cv.parentNode) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const life = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = life > 1.8 ? Math.max(0, 1 - (life - 1.8) / 0.6) : 1;
      ps.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (life < 2.4) requestAnimationFrame(frame);
      else cv.parentNode.removeChild(cv);
    }
    requestAnimationFrame(frame);
  }

  function practice(container, makeQuestion, total, opts) {
    opts = opts || {};
    const key = opts.key || '';
    const defaultLen = total || 5;
    const lengths = QUIZ_LENGTHS.indexOf(defaultLen) >= 0 ? QUIZ_LENGTHS : [defaultLen].concat(QUIZ_LENGTHS);
    let len = defaultLen;
    try {
      const saved = parseInt(localStorage.getItem('quiz-len'), 10);
      if (lengths.indexOf(saved) >= 0) len = saved;
    } catch (e) { /* ignore */ }
    const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let idx = 0, correct = 0, streak = 0, bestStreak = 0;
    let current = null, answered = false, finished = false, interacted = false;
    let results = [], wrongs = [];
    const recent = [];   // 最近出過的題目文字，用來避免同一回合重複

    /* ---- 元件 ---- */
    const top = el('div', { class: 'pr-top' });
    const best = el('span', { class: 'pr-best' });
    const progress = el('div', { class: 'pr-progress' });
    const qBox = el('div', { class: 'pr-q' });
    const ansBox = el('div', { class: 'pr-a' });
    const fb = el('div', { class: 'pr-fb', 'aria-live': 'polite' });
    const actions = el('div', { class: 'pr-actions' });
    const nextBtn = button('下一題 →', onNext, 'primary');
    const backBtn = button('↑ 回到互動教具', () => {
      const inner = container.closest && container.closest('.inner');
      const first = inner && inner.querySelector('.card');
      (first || container).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nextBtn.style.display = 'none';
    backBtn.style.display = 'none';
    actions.appendChild(nextBtn);
    actions.appendChild(backBtn);

    const seg = segmented('每回合', lengths.map(n => ({ label: n + ' 題', value: n })), v => {
      interacted = true;
      len = v;
      try { localStorage.setItem('quiz-len', String(v)); } catch (e) { /* ignore */ }
      restart();
    }, len);
    top.appendChild(seg.wrap);
    top.appendChild(best);

    container.appendChild(top);
    container.appendChild(progress);
    container.appendChild(qBox);
    container.appendChild(ansBox);
    container.appendChild(fb);
    container.appendChild(actions);

    /* ---- 紀錄（localStorage） ---- */
    function chapterStats(all) {
      return all[key] || (all[key] = { best: {}, total: 0, correct: 0, rounds: 0 });
    }
    function recordAnswer(ok) {
      if (!key) return;
      const all = loadStats(), s = chapterStats(all);
      s.total = (s.total || 0) + 1;
      if (ok) s.correct = (s.correct || 0) + 1;
      saveStats(all);
    }
    /* 回傳是否刷新本章（這個題數）的最佳成績 */
    function recordRound() {
      if (!key) return false;
      const all = loadStats(), s = chapterStats(all);
      s.rounds = (s.rounds || 0) + 1;
      s.best = s.best || {};
      const prev = s.best[len];
      const isNew = prev === undefined || correct > prev;
      if (isNew) s.best[len] = correct;
      saveStats(all);
      return isNew && prev !== undefined;   // 第一次玩不算「刷新」
    }
    function paintBest() {
      if (!key) { best.innerHTML = ''; return; }
      const s = loadStats()[key];
      const b = s && s.best && s.best[len];
      const scope = opts.scope || '本章';
      best.innerHTML = (b !== undefined ? scope + '最佳 <b>' + b + '／' + len + '</b>' : scope + '還沒有紀錄') +
        (s && s.total ? '　累計練了 ' + s.total + ' 題' : '');
    }

    /* ---- 出題：同一回合盡量不重複 ---- */
    function draw() {
      let q = makeQuestion(), tries = 0;
      // 有些題型只有四五種變化，試幾次沒新的就接受重複，不能無限重抽
      while (tries++ < 12 && recent.indexOf(q.q) >= 0) q = makeQuestion();
      recent.push(q.q);
      if (recent.length > 40) recent.shift();
      return q;
    }

    function fmtAnswer(cur) {
      if (cur.choices) return '<b>' + cur.choices[cur.answer] + '</b>';
      let a = cur.answer;
      // 有容許誤差的題目（例如 1800÷7 度）照誤差的精度四捨五入，不要印出 128.571429
      if (cur.tolerance > 0 && !Number.isInteger(a)) {
        const d = Math.min(6, Math.max(0, Math.ceil(-Math.log10(cur.tolerance))));
        a = parseFloat(a.toFixed(d));
      }
      return '<b>' + fmtNum(a) + '</b>' + (cur.unit ? ' ' + cur.unit : '');
    }

    function paintProgress() {
      progress.innerHTML = '';
      progress.classList.toggle('dense', len >= 20);
      for (let i = 0; i < len; i++) {
        let cls = 'dot';
        if (i < idx) cls += ' done' + (results[i] === false ? ' wrong' : '');
        else if (i === idx && !finished) cls += ' now';
        progress.appendChild(el('span', { class: cls }));
      }
      progress.appendChild(el('span', {
        class: 'pr-count',
        text: finished ? '答對 ' + correct + ' / ' + len : '第 ' + (idx + 1) + ' / ' + len + ' 題　答對 ' + correct
      }));
    }

    function judge(ok, userText) {
      if (answered) return;
      answered = true;
      results[idx] = ok;
      if (ok) { correct++; streak++; if (streak > bestStreak) bestStreak = streak; }
      else { streak = 0; wrongs.push({ q: current, user: userText }); }
      recordAnswer(ok);

      fb.className = 'pr-fb ' + (ok ? 'ok' : 'no');
      let head;
      if (ok) {
        head = pick(PRAISE);
        if (streak >= 2) head += '<span class="pr-streak">🔥 連續答對 ' + streak + ' 題</span>';
      } else {
        head = '❌ ' + (current.choices ? '你選的是' : '你填的是') + ' <s>' + userText + '</s>，' +
          '<span class="ans">正確答案是 ' + fmtAnswer(current) + '</span>';
      }
      fb.innerHTML = head + (current.steps ? '<div class="pr-steps"><b>怎麼想：</b>' + current.steps + '</div>' : '');
      Array.prototype.forEach.call(ansBox.querySelectorAll('button,input'), n => n.disabled = true);
      nextBtn.style.display = '';
      nextBtn.textContent = (idx + 1 >= len) ? '看結果' : '下一題 →';
      paintProgress();
      // 焦點放到「下一題」：鍵盤 Enter／空白鍵就能前進（按鈕不會叫出手機鍵盤）。
      // 手機上解題步驟一展開，按鈕常被推到畫面外，順手捲進來。
      nextBtn.focus({ preventScroll: true });
      nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function render() {
      answered = false;
      finished = false;
      current = draw();
      qBox.innerHTML = current.q;
      ansBox.innerHTML = '';
      fb.className = 'pr-fb';
      fb.innerHTML = '';
      nextBtn.style.display = 'none';
      backBtn.style.display = 'none';

      if (current.choices) {
        current.choices.forEach((c, i) => {
          const b = el('button', { type: 'button', class: 'pr-choice', html: c });
          b.addEventListener('click', () => {
            b.classList.add(i === current.answer ? 'ok' : 'no');
            if (i !== current.answer) ansBox.children[current.answer].classList.add('ok');
            judge(i === current.answer, c);
          });
          ansBox.appendChild(b);
        });
      } else {
        const inp = el('input', { type: 'number', step: 'any', class: 'pr-input', placeholder: '輸入答案', inputmode: 'decimal' });
        const go = button('送出', () => {
          const v = parseFloat(inp.value);
          if (isNaN(v)) { fb.className = 'pr-fb no'; fb.textContent = '請先輸入一個數字'; return; }
          judge(Math.abs(v - current.answer) <= (current.tolerance || 0), fmtNum(v));
        }, 'primary');
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
        ansBox.appendChild(inp);
        if (current.unit) ansBox.appendChild(el('span', { class: 'pr-unit', text: current.unit }));
        ansBox.appendChild(go);
        // 桌機上按過「下一題」之後直接把游標放進輸入框。章節剛載入的第一題不做：
        // 練習題在頁面最底，搶焦點會把整頁捲過去，教具就看不到了。
        if (interacted && finePointer) inp.focus({ preventScroll: true });
      }
      paintProgress();
    }

    function finish() {
      finished = true;
      const isNewBest = recordRound();
      const ratio = correct / len;
      const stars = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1;

      qBox.innerHTML =
        '<div class="pr-stars">' + '★'.repeat(stars) + '<span class="off">' + '★'.repeat(3 - stars) + '</span></div>' +
        '<div class="pr-done">本回合：答對 <b>' + correct + '</b> / ' + len + ' 題' +
        (isNewBest ? '　🏆 本章新紀錄！' : '') + '</div>';
      ansBox.innerHTML = '';
      fb.className = 'pr-fb';
      let msg = stars === 3 ? pick(PERFECT) :
        stars === 2 ? '不錯！錯的題目看一下下面的回顧，再回去玩一次上面的教具。' :
          '別急，先回到上面的互動教具多操作幾次，再回來練習。每練一次都會進步！';
      if (bestStreak >= 3 && stars < 3) msg += '<br>這回合最長連續答對 <b>' + bestStreak + '</b> 題，很棒。';
      fb.innerHTML = msg;

      if (wrongs.length) {
        const rv = el('div', { class: 'pr-review' });
        rv.appendChild(el('h4', { text: '錯題回顧（' + wrongs.length + ' 題）——可以照著再問一次孩子' }));
        wrongs.forEach((w, i) => {
          const item = el('div', { class: 'pr-review-item' }, [
            el('div', { class: 'rq', html: (i + 1) + '. ' + w.q.q }),
            el('div', { class: 'ra', html: '孩子的答案：<s>' + w.user + '</s>　正確答案：' + fmtAnswer(w.q) })
          ]);
          if (w.q.steps) item.appendChild(el('div', { class: 'pr-steps', html: '<b>怎麼想：</b>' + w.q.steps }));
          rv.appendChild(item);
        });
        fb.appendChild(rv);
      }

      nextBtn.textContent = '再來一回合';
      nextBtn.style.display = '';
      backBtn.style.display = wrongs.length ? '' : 'none';
      paintProgress();
      paintBest();
      if (stars === 3) confetti(container);
      nextBtn.focus({ preventScroll: true });
    }

    /* 同一顆按鈕，依狀態決定是「下一題」還是「再來一回合」。
       （舊版在結束時另外疊一個 once listener，原本的 next 沒拆掉，
       導致第二回合按第一次「下一題」就整回合被重置。） */
    function onNext() {
      interacted = true;
      if (finished) { restart(); return; }
      idx++;
      if (idx >= len) finish(); else render();
    }
    function restart() {
      idx = 0; correct = 0; streak = 0; bestStreak = 0;
      results = []; wrongs = [];
      paintBest();   // 題數換了，「本章最佳」要換成該題數的紀錄
      render();
    }

    paintBest();
    render();
  }

  /* ---------- 3D 場景樣板 ----------
     回傳 { scene, camera, renderer, controls, add, onFrame, dispose }
     自動處理：燈光、地面格線、OrbitControls、視窗縮放、動畫迴圈、資源釋放
  */
  function scene3d(host, opts) {
    opts = opts || {};
    // 高度要跟著寬度走。手機上若固定 470px，畫布會變成瘦長的直式（長寬比 0.63），
    // 場景左右會被切掉，而且光畫布就吃掉半個螢幕。夾成「不超過寬度的 0.9 倍」。
    function calcH(w) { return Math.round(Math.min(opts.height || 420, Math.max(255, w * 0.9))); }
    const w = host.clientWidth || 640;
    let h = calcH(w);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(opts.bg !== undefined ? opts.bg : 0x0e1726);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    const cp = opts.camera || [7, 6, 9];
    camera.position.set(cp[0], cp[1], cp[2]);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    if (opts.target) controls.target.set(opts.target[0], opts.target[1], opts.target[2]);

    // opts.lights === false：不加預設燈光。用於「光源方向本身就是教學重點」的場景
    // （例如月相：環境光會把月球暗面照亮，就看不出一半亮一半暗了）
    if (opts.lights !== false) {
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 0.85);
      key.position.set(6, 10, 8);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
      fill.position.set(-6, 4, -6);
      scene.add(fill);
    }

    if (opts.grid !== false) {
      const grid = new THREE.GridHelper(opts.gridSize || 20, opts.gridDiv || 20, 0x2f4468, 0x1d2c45);
      grid.position.y = opts.gridY || 0;
      scene.add(grid);
    }

    const frameFns = [];
    let alive = true;
    function loop() {
      if (!alive) return;
      requestAnimationFrame(loop);
      frameFns.forEach(f => f());
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    /* 把相機推到「剛好框得下半徑 r 的球」的距離。
       同時看垂直和水平視角，取比較嚴格的那個——否則手機直式時左右會被切掉。 */
    let fitRadius = 0;
    function applyFit() {
      if (!fitRadius) return;
      const vHalf = camera.fov * Math.PI / 360;
      const dV = fitRadius / Math.sin(vHalf);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const dH = fitRadius / Math.sin(hHalf);
      const dir = camera.position.clone().sub(controls.target);
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      dir.normalize();
      camera.position.copy(controls.target).addScaledVector(dir, Math.max(dV, dH));
      camera.updateProjectionMatrix();
      controls.update();
    }

    function resize() {
      const nw = host.clientWidth || w;
      // 全螢幕時由外面在 .stage 上寫入 data-force-h，指定畫布要吃掉多少高度。
      // 用屬性而不是直接量 host.clientHeight，是因為平常 host 的高度就是
      // 畫布撐出來的——反過來拿它算畫布會變成循環。
      const forced = parseInt(host.getAttribute('data-force-h') || '', 10);
      h = forced > 0 ? forced : calcH(nw);
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
      applyFit();
    }
    window.addEventListener('resize', resize);

    return {
      scene: scene, camera: camera, renderer: renderer, controls: controls,
      add: function (o) { scene.add(o); return o; },
      onFrame: function (f) { frameFns.push(f); },
      /* 章節呼叫 S.fit(r)：宣告「場景大致裝在半徑 r 的球裡」，
         之後不管視窗多寬多窄都會自動保持在畫面內。 */
      fit: function (r) { fitRadius = r; applyFit(); },
      dispose: function () {
        alive = false;
        window.removeEventListener('resize', resize);
        controls.dispose();
        scene.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }

  /* ============================================================
     全螢幕
     ------------------------------------------------------------
     把「畫布（.stage）＋控制列（.controls）」包成一個容器，只讓這兩樣
     進全螢幕；說明、讀數、家長導引卡、練習題都留在頁面上，自然不會出現。
     這是通用的：app.js 對每一個教具都呼叫一次，章節本身完全不用改。

     iOS Safari 不支援對 <video> 以外的元素呼叫 requestFullscreen，
     所以另外準備 position:fixed 的替代版面。兩條路徑共用同一組 CSS
     （.fs-on），行為一致，差別只在瀏覽器自己的工具列會不會收起來。
     ============================================================ */
  function fullscreen(hostEl) {
    const stage = hostEl.querySelector('.stage');
    if (!stage) return null;                       // 沒有畫布的教具（純文字）就不加
    const controls = hostEl.querySelector('.controls');

    const wrap = el('div', { class: 'fs-wrap' });
    stage.parentNode.insertBefore(wrap, stage);
    wrap.appendChild(stage);
    if (controls) wrap.appendChild(controls);

    const btn = el('button', { type: 'button', class: 'fs-btn' });
    stage.appendChild(btn);                        // .stage 是 position:relative，浮在畫布右上角

    let on = false;

    // 3D 場景各自監聽 window resize，發一個事件就能讓它們重新量尺寸，
    // 不必在這裡持有每個場景的參照。busy 旗標是為了讓下面的 onResize
    // 認得「這一發是自己丟的」，不然就會無限遞迴。dispatchEvent 是同步的，
    // 所以用一對賦值把它夾住就夠了。
    let busy = false;
    function reflow() {
      busy = true;
      window.dispatchEvent(new Event('resize'));
      busy = false;
    }

    /* 全部同步做完，不用 requestAnimationFrame。
       rAF 在「分頁不在前景」或「這一章是純 2D、沒有動畫迴圈」時可能遲遲不觸發，
       屬性就會卡在錯誤狀態。改成直接讀 stage.clientHeight——讀取版面屬性會
       強迫瀏覽器立刻把剛加上的 .fs-on 排版算完，量到的就是正確的可用高度。 */
    const flat = stage.querySelector('.c2d');        // 2D 教具的畫布（3D 的是 <canvas> 但沒有這個 class）

    function sizeCanvas() {
      if (!on) {
        stage.removeAttribute('data-force-h');
        stage.style.overflow = '';
        if (flat) { flat.style.width = ''; flat.style.height = ''; }
        reflow();
        return;
      }
      // 先關掉捲軸再量。留著 overflow:auto 會變成迴圈：捲軸吃掉 15px 寬 →
      // 算出來的畫布變小 → 其實不再需要捲軸，但尺寸已經照有捲軸的寬度算好了。
      // 底下確定放不下時才把捲軸打開。
      stage.style.overflow = 'hidden';
      // 要用「內容框」而不是外框：不少 2D 章節會自己在 .stage 上加行內
      // padding（例如 padding:14px 0）。直接拿 getBoundingClientRect 的高度
      // 當可用高度，畫布就會比內容框多出上下的 padding，被裁掉一截。
      // 也不能用 clientWidth/Height——那是四捨五入過的整數，293.6 會回報 294，
      // 多出來的 0.4px 又會擠出一條捲軸。
      const cs = getComputedStyle(stage);
      const px = v => parseFloat(v) || 0;
      const insetX = px(cs.paddingLeft) + px(cs.paddingRight) + px(cs.borderLeftWidth) + px(cs.borderRightWidth);
      const insetY = px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
      const box = stage.getBoundingClientRect();
      const bw = Math.floor(box.width - insetX);
      const bh = Math.max(200, Math.floor(box.height - insetY));
      // 3D：把可用高度寫給 scene3d（它的 resize 會讀這個屬性）
      stage.setAttribute('data-force-h', bh);
      // 2D：直接算出等比例放到最大的尺寸。
      // 純 CSS 做不到「兩個方向都能放大、又保證不變形」——用 width:100% 時，
      // 遇到寬扁的容器 max-height 會把高度夾住、寬度卻不跟著縮，圖就被拉扁了；
      // 用 width:auto 又只會停在點陣原尺寸不放大。所以這裡自己算。
      // （不能用 object-fit：那會讓元素框大於實際畫面，可拖曳的圖表就點不準了。）
      if (flat) {
        const ar = flat.width / flat.height;         // 點陣比例＝邏輯比例（兩邊都乘了 dpr）
        // 平常那個「最小寬度」是為了字級可讀才設的，全螢幕一樣要守住——
        // 否則手機直式全螢幕（螢幕只有 375 寬）反而比不進全螢幕還小。
        // 真的塞不下就讓 .stage 捲動，和平常的行為一致。
        const minW = parseFloat(getComputedStyle(flat).getPropertyValue('--c2d-min-w')) || 0;
        const w2 = Math.floor(Math.max(minW, Math.min(bw, bh * ar)));
        const h2 = Math.floor(w2 / ar);
        // 兩邊都由同一個 w2 推出來，比例最多差一個像素的捨去誤差
        flat.style.width = w2 + 'px';
        flat.style.height = h2 + 'px';
        // 只有最小寬度真的頂出容器時才開捲軸（手機直式）
        if (w2 > bw || h2 > bh) stage.style.overflow = 'auto';
      }
      reflow();
    }

    function paint() {
      btn.textContent = on ? '⤢ 離開全螢幕' : '⛶ 全螢幕';
      btn.setAttribute('aria-label', on ? '離開全螢幕' : '全螢幕');
      wrap.classList.toggle('fs-on', on);
      sizeCanvas();
    }

    function enter() {
      on = true;
      paint();
      const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
      // 失敗（或根本沒有這個 API）也沒關係，.fs-on 的版面已經是全螢幕了
      if (req) { const p = req.call(wrap); if (p && p.catch) p.catch(function () {}); }
    }

    function leave() {
      on = false;
      paint();
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl === wrap) {
        const ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) { const p = ex.call(document); if (p && p.catch) p.catch(function () {}); }
      }
    }

    btn.addEventListener('click', function () { on ? leave() : enter(); });

    // 使用者按 Esc、或用瀏覽器自己的方式離開時，把版面同步回來
    function onFsChange() {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (on && fsEl !== wrap) { on = false; paint(); }
    }
    function onKey(e) { if (on && e.key === 'Escape') leave(); }
    function onResize() { if (on && !busy) sizeCanvas(); }
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('keydown', onKey);
    // 視窗改變大小、手機轉向都要重新算一次。sizeCanvas 自己也會發 resize，
    // 靠上面的 busy 旗標區分，才不會遞迴。
    window.addEventListener('resize', onResize);

    // 初始只設按鈕文字，不走 paint()——那會多發一次 resize，
    // 讓剛建好、還沒定位完相機的場景白跑一次取景。
    btn.textContent = '⛶ 全螢幕';
    btn.setAttribute('aria-label', '全螢幕');

    return function () {                            // 切換章節時要收乾淨
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      if (on) leave();
    };
  }

  /* 產生一顆帶邊框的小方塊（體積、堆疊教學常用） */
  function unitCube(size, color, opacity) {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(size, size, size);
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: color, transparent: opacity !== undefined && opacity < 1, opacity: opacity === undefined ? 1 : opacity
    }));
    g.add(mesh);
    g.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x0b1220 })
    ));
    return g;
  }

  /* ============================================================
     觀測者小人 + 地景 + 第一人稱視角
     ------------------------------------------------------------
     天文類教具（太陽位置、四季星空）都是「站在地面上抬頭看」的場景。
     沒有人形和地面景物時，畫面只剩一個抽象的半球，孩子很難把它
     和「我站在院子裡抬頭」連在一起。這三個工具就是補這一段。
     ============================================================ */

  /* 低面數人形。以「總高 = h、腳底在 y=0、面向 -Z（北）」建構。
     面向別的方位時用 group.rotation.y = -方位角（弧度，從北往東量）。 */
  function person(h, opts) {
    opts = opts || {};
    const C = opts.night
      ? { shirt: 0x3d5a8a, pants: 0x22314a, skin: 0xbfa48a, hair: 0x121a2b }
      : { shirt: 0x4f8ef7, pants: 0x2b3a55, skin: 0xf0c9a0, hair: 0x2a1f1a };
    const g = new THREE.Group();
    const mat = c => new THREE.MeshLambertMaterial({ color: c });
    const mShirt = mat(C.shirt), mPants = mat(C.pants), mSkin = mat(C.skin), mHair = mat(C.hair);
    // 以「總高 1」的比例建，最後整組縮放到 h，改高度不用重算每個部位
    function box(w, hh, d, x, y, z, m) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m);
      b.position.set(x, y, z);
      g.add(b);
      return b;
    }
    box(.11, .42, .13, -.085, .21, 0, mPants);      // 左腿
    box(.11, .42, .13, .085, .21, 0, mPants);       // 右腿
    box(.26, .32, .16, 0, .58, 0, mShirt);          // 軀幹
    box(.075, .30, .10, -.168, .57, 0, mShirt);     // 左臂
    box(.075, .30, .10, .168, .57, 0, mShirt);      // 右臂
    box(.10, .05, .10, 0, .765, 0, mSkin);          // 脖子
    const head = new THREE.Mesh(new THREE.SphereGeometry(.105, 16, 12), mSkin);
    head.position.y = .895;
    g.add(head);
    // 頭髮做成半球殼蓋在後上方，順便當「臉朝哪邊」的視覺線索
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(.112, 16, 10, 0, Math.PI * 2, 0, Math.PI * .5), mHair);
    hair.position.y = .895;
    g.add(hair);
    // 鼻子：小人只有幾十像素大，光靠頭髮還看不出正面，加一個朝 -Z 的小尖角
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.028, .06, 8), mSkin);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, .89, -.105);
    g.add(nose);
    g.scale.setScalar(h);
    return g;
  }

  /* 地平線上的遠景聚落。刻意做得<b>矮</b>——真實世界裡地平線上的房子
     很遠，張角很小；做成寫實比例會擋掉一大片低空（日出日落就看不到了）。
     位置用固定亂數種子產生，每次重新整理都長一樣。 */
  function scenery(R, opts) {
    opts = opts || {};
    const night = opts.night === true;
    const g = new THREE.Group();
    const s = R * (opts.scale || .075);          // 基準尺寸
    const P = night
      ? { wall: [0x2c3550, 0x333d5c, 0x28304a], roof: 0x1d2438, tree: 0x1b3326, trunk: 0x241d18, win: 0xffd98a }
      : { wall: [0xa9b6cc, 0xc4b39a, 0x9fb0a6], roof: 0x8d5b52, tree: 0x3f7d55, trunk: 0x5b4636, win: 0xdfe9ff };
    const mat = c => new THREE.MeshLambertMaterial({ color: c });
    const mRoof = mat(P.roof), mTree = mat(P.tree), mTrunk = mat(P.trunk);
    const mWin = new THREE.MeshBasicMaterial({ color: P.win, transparent: true, opacity: night ? .95 : .5 });
    const mWall = P.wall.map(mat);

    let seed = 20260728;                          // 固定種子 → 每次載入的聚落一模一樣
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

    const N = opts.count || 24;
    for (let i = 0; i < N; i++) {
      const az = (i + rnd() * .7 - .35) / N * Math.PI * 2;
      const rr = R * (0.88 + rnd() * .09);
      const item = new THREE.Group();
      const kind = rnd();
      if (kind < .34) {                           // 樹
        const th = s * (.55 + rnd() * .3);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(s * .08, s * .1, th, 6), mTrunk);
        trunk.position.y = th / 2;
        item.add(trunk);
        const ch = s * (1.0 + rnd() * .6);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(s * (.42 + rnd() * .18), ch, 7), mTree);
        crown.position.y = th + ch / 2;
        item.add(crown);
      } else if (kind < .82) {                    // 平房：方塊 ＋ 四角錐屋頂
        const w = s * (1.3 + rnd() * .9), bh = s * (.55 + rnd() * .35), d = s * (1.0 + rnd() * .6);
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, bh, d), mWall[i % mWall.length]);
        body.position.y = bh / 2;
        item.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * .78, s * .5, 4), mRoof);
        roof.rotation.y = Math.PI / 4;            // 四角錐轉 45° 才對齊方形屋身
        roof.position.y = bh + s * .25;
        item.add(roof);
        const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .5, bh * .38), mWin);
        win.position.set(0, bh * .55, -d / 2 - .002);
        item.add(win);
      } else {                                    // 稍高的樓房
        const w = s * (.75 + rnd() * .35), bh = s * (1.4 + rnd() * .8);
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, bh, w), mWall[(i + 1) % mWall.length]);
        body.position.y = bh / 2;
        item.add(body);
        for (let k = 0; k < 3; k++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .52, bh * .13), mWin);
          win.position.set(0, bh * (.24 + k * .26), -w / 2 - .002);
          item.add(win);
        }
      }
      // 北是 -Z：方位角 az 的位置 = (sin az, 0, −cos az)，並讓正面朝向中心的觀測者
      item.position.set(rr * Math.sin(az), 0, -rr * Math.cos(az));
      item.rotation.y = -az + Math.PI;
      g.add(item);
    }
    return g;
  }

  /* 第一人稱：把相機放到小人的眼睛位置。
     OrbitControls 沒有第一人稱模式，這裡把 target 放在眼睛<b>前方 6 公分</b>——
     繞著一個這麼近的點旋轉，等效於原地轉頭。縮放與平移要關掉，否則一滾輪
     就會穿過 target 跑到腦後；仰角也要夾住，免得越過天頂整個畫面翻過來。 */
  function firstPerson(S, o) {
    o = o || {};
    const eye = o.eye || new THREE.Vector3(0, 1.3, 0);
    const az = o.az || 0, pitch = o.pitch || 0;
    const dir = new THREE.Vector3(
      Math.cos(pitch) * Math.sin(az), Math.sin(pitch), -Math.cos(pitch) * Math.cos(az));
    S.camera.up.set(0, 1, 0);
    S.camera.fov = o.fov || 62;                  // 視野放寬，比較接近肉眼
    S.camera.updateProjectionMatrix();
    S.camera.position.copy(eye);
    S.controls.target.copy(eye).addScaledVector(dir, .06);
    S.controls.enableZoom = false;
    S.controls.enablePan = false;
    S.controls.minPolarAngle = .12;
    S.controls.maxPolarAngle = Math.PI - .12;
    S.fit(0);                                    // 停用自動取景，否則相機會被推回遠處
    S.controls.update();
  }
  /* Sprite 會跟著透視縮放：離相機越近越大。第一人稱時相機就站在場景正中央，
     幾公尺外的文字牌會脹到蓋住整個畫面；同一批牌子在遠處又小到看不清。
     這裡每一格依「離相機多遠」把大小補回來——指數 0.6 而不是 1，
     是刻意留一點遠近差當深度線索，全部一樣大反而看不出誰前誰後。
     第一次看到某個 sprite 時記下它原本的大小當基準，所以建立端完全不用改。 */
  function keepSpriteSize(S, refDist) {
    const ref = refDist || 26;
    const wp = new THREE.Vector3();
    S.onFrame(function () {
      S.scene.traverse(function (o) {
        if (!o.isSprite) return;
        if (!o.userData._baseScale) o.userData._baseScale = { x: o.scale.x, y: o.scale.y };
        const b = o.userData._baseScale;
        o.getWorldPosition(wp);
        let k = Math.min(Math.max(Math.pow(wp.distanceTo(S.camera.position) / ref, .6), .25), 1.4);
        // 第一人稱會把視野從 45° 開到 66°，同樣的張角換算成像素就縮水三分之一。
        // 乘上視野比例，文字牌在兩種視角下才會佔畫面差不多的比例。
        k *= S.camera.fov / 45;
        o.scale.set(b.x * k, b.y * k, 1);
      });
    });
  }

  /* 離開第一人稱：把上面動過的設定還原（呼叫端接著自己設相機位置與 S.fit） */
  function exitFirstPerson(S) {
    S.camera.fov = 45;
    S.camera.updateProjectionMatrix();
    S.controls.enableZoom = true;
    S.controls.enablePan = true;
    S.controls.minPolarAngle = 0;
    S.controls.maxPolarAngle = Math.PI;
  }

  /* 2D 畫布樣板：回傳 {canvas, ctx, W, H, clear, redraw(fn)} 並處理 devicePixelRatio */
  function canvas2d(host, width, height) {
    const c = el('canvas', { class: 'c2d' });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    // 尺寸用 CSS 變數傳給樣式表，不要直接寫 style.width。
    // 行內樣式的優先權高過樣式表，全螢幕時就沒辦法用 CSS 覆寫——
    // 之前 2D 圖在全螢幕被拉成寬 100%、高 100% 而變形，原因就在這裡。
    c.style.setProperty('--c2d-max-w', width + 'px');
    // 手機上若讓 620 寬的圖直接縮到 279px（45%），圖上 13px 的字只剩 6px，完全看不清。
    // 設一個最小寬度，容器（.stage）再開水平捲動，寧可左右滑也不要看不見。
    c.style.setProperty('--c2d-min-w', Math.min(width, 470) + 'px');
    c.style.aspectRatio = width + ' / ' + height;
    host.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    return {
      canvas: c, ctx: ctx, W: width, H: height,
      clear: function (bg) {
        ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height); }
        else ctx.clearRect(0, 0, width, height);
        ctx.restore();
      }
    };
  }

  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  return {
    register: register, get: get, el: el, slider: slider, segmented: segmented,
    button: button, practice: practice, scene3d: scene3d, unitCube: unitCube,
    person: person, scenery: scenery, firstPerson: firstPerson, exitFirstPerson: exitFirstPerson,
    keepSpriteSize: keepSpriteSize, fullscreen: fullscreen,
    canvas2d: canvas2d, randInt: randInt, pick: pick, shuffle: shuffle, gcd: gcd,
    quizStats: loadStats, exportProgress: exportProgress, importProgress: importProgress, clearProgress: clearProgress
  };
})();
