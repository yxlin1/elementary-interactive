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
  */
  function practice(container, makeQuestion, total) {
    total = total || 5;
    let idx = 0, correct = 0, current = null, answered = false;

    const progress = el('div', { class: 'pr-progress' });
    const qBox = el('div', { class: 'pr-q' });
    const ansBox = el('div', { class: 'pr-a' });
    const fb = el('div', { class: 'pr-fb' });
    const nextBtn = button('下一題 →', next, 'primary');
    nextBtn.style.display = 'none';

    container.appendChild(progress);
    container.appendChild(qBox);
    container.appendChild(ansBox);
    container.appendChild(fb);
    container.appendChild(nextBtn);

    function paintProgress() {
      progress.innerHTML = '';
      for (let i = 0; i < total; i++) {
        progress.appendChild(el('span', { class: 'dot' + (i < idx ? ' done' : i === idx ? ' now' : '') }));
      }
      progress.appendChild(el('span', { class: 'pr-count', text: '答對 ' + correct + ' / ' + total }));
    }

    function judge(ok, userText) {
      if (answered) return;
      answered = true;
      if (ok) correct++;
      fb.className = 'pr-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = (ok ? '✅ 答對了！' : '❌ 再看一次：你選的是 ' + userText) +
        (current.steps ? '<div class="pr-steps"><b>怎麼想：</b>' + current.steps + '</div>' : '');
      Array.prototype.forEach.call(ansBox.querySelectorAll('button,input'), n => n.disabled = true);
      nextBtn.style.display = '';
      nextBtn.textContent = (idx + 1 >= total) ? '看結果' : '下一題 →';
      paintProgress();
    }

    function render() {
      answered = false;
      current = makeQuestion();
      qBox.innerHTML = current.q;
      ansBox.innerHTML = '';
      fb.className = 'pr-fb';
      fb.innerHTML = '';
      nextBtn.style.display = 'none';

      if (current.choices) {
        current.choices.forEach((c, i) => {
          const b = el('button', { type: 'button', class: 'pr-choice', html: c });
          b.addEventListener('click', () => {
            b.classList.add(i === current.answer ? 'ok' : 'no');
            if (i !== current.answer) {
              ansBox.children[current.answer].classList.add('ok');
            }
            judge(i === current.answer, c);
          });
          ansBox.appendChild(b);
        });
      } else {
        const inp = el('input', { type: 'number', step: 'any', class: 'pr-input', placeholder: '輸入答案' });
        const go = button('送出', () => {
          const v = parseFloat(inp.value);
          if (isNaN(v)) { fb.className = 'pr-fb no'; fb.textContent = '請先輸入一個數字'; return; }
          judge(Math.abs(v - current.answer) <= (current.tolerance || 0), v);
        }, 'primary');
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
        ansBox.appendChild(inp);
        if (current.unit) ansBox.appendChild(el('span', { class: 'pr-unit', text: current.unit }));
        ansBox.appendChild(go);
      }
      paintProgress();
    }

    function next() {
      idx++;
      if (idx >= total) {
        qBox.innerHTML = '<div class="pr-done">本回合結束：答對 <b>' + correct + '</b> / ' + total + ' 題</div>';
        ansBox.innerHTML = '';
        fb.className = 'pr-fb';
        fb.innerHTML = correct === total ? '太厲害了，全對！' :
          correct >= total * 0.6 ? '不錯，錯的那幾題再回去玩一次上面的教具。' :
            '建議先回到上面的互動教具多操作幾次，再回來練習。';
        nextBtn.textContent = '再來一回合';
        nextBtn.style.display = '';
        nextBtn.onclick = null;
        nextBtn.addEventListener('click', function restart() {
          nextBtn.removeEventListener('click', restart);
          idx = 0; correct = 0;
          nextBtn.addEventListener('click', next);
          render();
        }, { once: true });
        paintProgress();
        return;
      }
      render();
    }

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
      h = calcH(nw);
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

  /* 2D 畫布樣板：回傳 {canvas, ctx, W, H, clear, redraw(fn)} 並處理 devicePixelRatio */
  function canvas2d(host, width, height) {
    const c = el('canvas', { class: 'c2d' });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    c.style.width = '100%';
    c.style.maxWidth = width + 'px';
    // 手機上若讓 620 寬的圖直接縮到 279px（45%），圖上 13px 的字只剩 6px，完全看不清。
    // 設一個最小寬度，容器（.stage）再開水平捲動，寧可左右滑也不要看不見。
    c.style.minWidth = Math.min(width, 470) + 'px';
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
    canvas2d: canvas2d, randInt: randInt, pick: pick, shuffle: shuffle, gcd: gcd
  };
})();
