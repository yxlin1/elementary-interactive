// 練習題驗證器：每個教具抽 N 題，檢查格式與數值、純算式題重算答案，並印出每種樣板一題供人工檢視
// 用法（在 repo 根目錄）：node tools/validate-quiz.js [N] [教具id ...]   不給 id 就跑全部，只印錯誤與總表
// 例：node tools/validate-quiz.js 4000 m5a-u6 m5b-u4
const fs = require('fs'), vm = require('vm');
const ctx = { console, Math, Number, Array, Object, JSON, String, parseFloat, parseInt, isNaN, isFinite, performance: { now: () => 0 },
  document: { createElement: () => ({ style: {}, classList: { add() {}, toggle() {} }, setAttribute() {}, appendChild() {}, addEventListener() {} }), getElementById: () => null, querySelector: () => null, addEventListener() {} },
  THREE: new Proxy({}, { get: () => function () { return new Proxy({}, { get: () => () => ({}) }); } }),
  localStorage: { getItem: () => null, setItem() {} }, requestAnimationFrame() {}, setTimeout, clearTimeout };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['js/curriculum.js', 'js/kit.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/src="(chapters\/[^"]+)"/g)].map(m => m[1]);
for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const Kit = vm.runInContext('Kit', ctx);
const regIds = [];
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/Kit\.register\('([^']+)'/g)) regIds.push(m[1]);

const N = parseInt(process.argv[2] || '4000', 10);
const only = process.argv.slice(3);
const strip = s => String(s).replace(/<[^>]+>/g, '');
const pattern = q => strip(q).replace(/[0-9０-９.,\/又]+/g, '#').replace(/\s+/g, ' ').slice(0, 70);
const bad = s => /NaN|undefined|Infinity|null/.test(String(s));
let totalErr = 0, totalQ = 0, recomputed = 0;
const summary = [];
for (const id of regIds) {
  if (only.length && !only.includes(id)) continue;
  const def = Kit.get(id); if (!def || !def.quiz) continue;
  const errs = [], samples = new Map(), patCount = new Map();
  for (let i = 0; i < N; i++) {
    let q;
    try { q = def.quiz(); } catch (e) { errs.push('throw: ' + e.message); continue; }
    totalQ++;
    const where = pattern(q.q);
    patCount.set(where, (patCount.get(where) || 0) + 1);
    if (!samples.has(where)) samples.set(where, q);
    if (!q.q) errs.push('empty q');
    if (bad(q.q)) errs.push('bad token in q: ' + strip(q.q));
    if (!q.steps) errs.push('no steps: ' + strip(q.q));
    else if (bad(q.steps)) errs.push('bad token in steps: ' + strip(q.q) + ' || ' + strip(q.steps));
    if (q.choices) {
      if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push('choices too short: ' + strip(q.q));
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.choices.length) errs.push('answer index out of range: ' + strip(q.q) + ' ans=' + q.answer);
      const seen = new Set();
      q.choices.forEach(c => { const k = strip(c).trim(); if (!k) errs.push('empty choice: ' + strip(q.q)); if (seen.has(k)) errs.push('duplicate choice "' + k + '": ' + strip(q.q)); seen.add(k); if (bad(c)) errs.push('bad token in choice: ' + c); });
    } else {
      if (typeof q.answer !== 'number' || !isFinite(q.answer)) errs.push('numeric answer not finite: ' + strip(q.q) + ' ans=' + q.answer);
      if (q.input !== 'number') errs.push('no choices and input!=number: ' + strip(q.q));
      // 純算式題：從題目文字重算一次，答案要對得上（容許 tolerance）
      const m = strip(q.q).match(/^\s*(\d+(?:\.\d+)?)\s*([×÷＋－+\-*\/])\s*(\d+(?:\.\d+)?)\s*[＝=]\s*\?/);
      if (m) {
        const x = parseFloat(m[1]), y = parseFloat(m[3]), op = m[2];
        const exact = op === '×' || op === '*' ? x * y : op === '÷' || op === '/' ? x / y : op === '＋' || op === '+' ? x + y : x - y;
        const tol = Math.max(q.tolerance || 0, 1e-9);
        // 有「四捨五入到小數第 n 位」的題目，答案本來就是概數，比對時也照那個位數取
        const rd = strip(q.q).match(/小數第\s*([一二三1-3])\s*位/);
        const nd = rd ? ({ '一': 1, '二': 2, '三': 3 }[rd[1]] || parseInt(rd[1], 10)) : null;
        const expect = nd !== null ? Math.round(exact * Math.pow(10, nd)) / Math.pow(10, nd) : exact;
        if (Math.abs(expect - q.answer) > tol + 1e-9) errs.push('RECOMPUTE MISMATCH: ' + strip(q.q) + ' → ' + q.answer + ' (expected ' + expect + ')');
        recomputed++;
      }
    }
  }
  const uniqErrs = [...new Set(errs)];
  totalErr += errs.length;
  summary.push({ id, templates: patCount.size, errors: errs.length });
  if (only.length || uniqErrs.length) {
    console.log('\n################ ' + id + '  樣板 ' + patCount.size + '  錯誤 ' + errs.length + ' ################');
    uniqErrs.slice(0, 15).forEach(e => console.log('  ✗ ' + e));
    if (only.length) {
      [...samples.entries()].sort((a, b) => patCount.get(b[0]) - patCount.get(a[0])).forEach(([pat, q]) => {
        console.log('\n--- (' + patCount.get(pat) + '/' + N + ') ' + strip(q.q));
        if (q.choices) console.log('    選項: ' + q.choices.map((c, i) => (i === q.answer ? '【' : '') + strip(c) + (i === q.answer ? '】' : '')).join(' | '));
        else console.log('    答案: ' + q.answer + (q.unit ? ' ' + q.unit : '') + (q.tolerance ? ' ±' + q.tolerance : ''));
        console.log('    步驟: ' + strip(q.steps).replace(/\s+/g, ' ').slice(0, 400));
      });
    }
  }
}
console.log('\n===== 總結：' + totalQ + ' 題，' + totalErr + ' 個錯誤；其中 ' + recomputed + ' 題純算式已從題目重算比對 =====');
console.log(summary.map(s => s.id.padEnd(13) + ' 樣板 ' + String(s.templates).padStart(3) + (s.errors ? '  ✗' + s.errors : '')).join('\n'));
