/* ============================================================
   app.js — 章節樹渲染、路由、章節頁面組裝
   ============================================================ */

(function () {
  const el = Kit.el;
  const treeEl = document.getElementById('tree');
  const contentEl = document.getElementById('content');
  const searchEl = document.getElementById('search');
  let activeCleanup = null;
  let activeId = null;

  /* ---------------- 左側章節樹 ---------------- */
  function buildTree(filter) {
    treeEl.innerHTML = '';
    const q = (filter || '').trim();

    VISIBLE.forEach(g => {
      const gWrap = el('div');
      let gradeHasMatch = false;
      const gTitle = el('div', { class: 'grade-title', text: g.grade });
      gWrap.appendChild(gTitle);

      g.books.forEach(b => {
        const matched = b.chapters.filter(c => {
          if (!q) return true;
          if (c.title.indexOf(q) >= 0) return true;
          if (b.term.indexOf(q) >= 0 || b.subject.indexOf(q) >= 0 || b.publisher.indexOf(q) >= 0) return true;
          return c.std.some(s => s.toUpperCase().indexOf(q.toUpperCase()) >= 0 ||
            (STANDARDS[s] || '').indexOf(q) >= 0);
        });
        if (!matched.length) return;
        gradeHasMatch = true;

        const isMath = b.subject === '數學';
        const list = el('div', { class: 'book-list' });
        matched.forEach(c => {
          const btn = el('button', {
            class: 'ch' + (c.todo ? ' todo' : '') + (c.id === activeId ? ' active' : ''),
            type: 'button', 'data-id': c.id
          }, [
            el('span', { class: 'n', text: c.no + '.' }),
            el('span', { class: 't', text: c.title })
          ]);
          if (c.impl) {
            btn.appendChild(el('span', {
              class: 'badge' + (c.kind === '3d' ? ' d3' : ''),
              text: c.kind === '3d' ? '3D' : '互動'
            }));
          }
          btn.addEventListener('click', () => go(c.id));
          list.appendChild(btn);
        });

        const head = el('button', { class: 'book-head', type: 'button' }, [
          el('span', { class: 'caret', text: '▶' }),
          el('span', { class: 'tag ' + (isMath ? 'math' : 'sci'), text: b.subject }),
          el('span', { text: b.term }),
          el('span', { class: 'pub', text: b.publisher + '版' })
        ]);

        const book = el('div', { class: 'book' }, [head, list]);
        // 搜尋中、或本冊含目前章節時自動展開
        if (q || matched.some(c => c.id === activeId)) book.classList.add('open');
        head.addEventListener('click', () => book.classList.toggle('open'));
        gWrap.appendChild(book);
      });

      if (gradeHasMatch) treeEl.appendChild(gWrap);
    });

    if (!treeEl.children.length) {
      treeEl.appendChild(el('div', { class: 'grade-title', text: '找不到符合「' + q + '」的章節' }));
    }
  }

  /* ---------------- 章節頁面 ---------------- */
  function renderChapter(id) {
    const c = CHAPTER_INDEX[id];
    if (!c) { renderHome(); return; }

    const inner = el('div', { class: 'inner' });

    inner.appendChild(el('div', {
      class: 'crumb',
      text: c.grade + '　›　' + c.subject + '（' + c.publisher + '版 ' + c.term + '）　›　第 ' + c.no + ' 單元'
    }));
    inner.appendChild(el('h2', { class: 'title', text: c.title }));

    /* 課綱條目 */
    if (c.std && c.std.length) {
      const sl = el('div', { class: 'std-list' });
      c.std.forEach(code => {
        sl.appendChild(el('div', { class: 'std' }, [
          el('code', { text: code }),
          el('span', { text: STANDARDS[code] || '（條目原文待補）' })
        ]));
      });
      inner.appendChild(sl);
    }

    if (c.todo) {
      inner.appendChild(el('div', { class: 'notice todo' }, [
        el('h3', { text: '⚠ 單元名稱待確認' }),
        el('p', { text: c.todo }),
        el('p', { text: '確認方式：康軒官方課程計畫下載（國小版 → 01橫式 → 上/下學期 → 自然領域），或直接翻孩子的課本目錄告訴我，我再把名稱與教具補上。' })
      ]));
    }

    /* 一個單元可以掛「別的 id 底下已經做好的教具」，也可以一次掛好幾個。
       不同出版社教的是同一批課綱條目，只是單元編號與拆併方式不同，
       所以用 use 重新對應就好，不需要把教具重寫一遍。 */
    const aidIds = c.use ? (Array.isArray(c.use) ? c.use : [c.use]) : [id];
    const defs = aidIds.map(a => Kit.get(a)).filter(Boolean);

    if (defs.length) {
      const hosts = [];

      /* 1. 互動教具（一個單元若對應多個教具，就依序列出） */
      defs.forEach((def, i) => {
        const stageCard = el('div', { class: 'card' });
        stageCard.appendChild(el('h3', {}, [
          el('span', { class: 'ico', text: c.kind === '3d' ? '🧊' : '🎛' }),
          el('span', { text: defs.length > 1 ? '互動教具 ' + (i + 1) + '／' + defs.length : '互動教具' })
        ]));
        if (def.intro) stageCard.appendChild(el('p', { class: 'hint', html: def.intro }));
        // 只在窄螢幕直式時由 CSS 顯示
        stageCard.appendChild(el('p', {
          class: 'rotate-hint',
          html: '📱 手機請<b>橫著拿</b>，圖會大很多。直式時圖可以用手指左右滑動。'
        }));
        const host = el('div');
        stageCard.appendChild(host);
        inner.appendChild(stageCard);
        hosts.push(host);
      });

      /* 2. 家長導引卡（多個教具就合併） */
      const guides = defs.reduce((a, d) => a.concat(d.parentGuide || []), []);
      if (guides.length) {
        const g = el('div', { class: 'card guide' });
        g.appendChild(el('h3', {}, [el('span', { class: 'ico', text: '👨‍👧' }), el('span', { text: '家長導引卡（照著問就好）' })]));
        const ol = el('ol');
        guides.forEach(item => {
          ol.appendChild(el('li', {}, [
            el('span', { class: 'ask', html: item.ask }),
            el('span', { class: 'why', html: item.why })
          ]));
        });
        g.appendChild(ol);
        inner.appendChild(g);
      }

      /* 3. 常見錯誤 */
      const pits = defs.reduce((a, d) => a.concat(d.pitfalls || []), []);
      if (pits.length) {
        const p = el('div', { class: 'card pit' });
        p.appendChild(el('h3', {}, [el('span', { class: 'ico', text: '🚧' }), el('span', { text: '常見錯誤（課綱點名的迷思）' })]));
        const ul = el('ul');
        pits.forEach(item => {
          const li = el('li', {}, [
            el('span', { class: 'bad', html: item.bad }),
            el('span', { class: 'fix', html: item.fix })
          ]);
          if (item.src) li.appendChild(el('span', { class: 'src', html: '課綱依據：' + item.src }));
          ul.appendChild(li);
        });
        p.appendChild(ul);
        inner.appendChild(p);
      }

      /* 4. 練習題：多個教具時每題隨機從其中一個抽 */
      const quizzes = defs.map(d => d.quiz).filter(Boolean);
      if (quizzes.length) {
        const q = el('div', { class: 'card quiz' });
        q.appendChild(el('h3', {}, [
          el('span', { class: 'ico', text: '✏️' }), el('span', { text: '練習題（即時對錯 + 解題步驟）' }),
          // 進練習區：同一章的題目，但畫面上只剩題目
          el('button', { class: 'btn small h3-act', type: 'button', text: '⛶ 專心練習', title: '進入練習區，只顯示題目', onClick: () => go('practice/' + id) })
        ]));
        const qHost = el('div');
        q.appendChild(qHost);
        inner.appendChild(q);
        const makeQ = quizzes.length === 1 ? quizzes[0]
          : function () { return quizzes[Math.floor(Math.random() * quizzes.length)](); };
        // 教具先掛上再跑練習，確保 DOM 已有寬度
        // key 用來存「本章最佳紀錄」與累計題數，讓孩子看得到自己的進步
        setTimeout(() => Kit.practice(qHost, makeQ, defs[0].quizCount || 5, { key: id }), 0);
      }

      contentEl.innerHTML = '';
      contentEl.appendChild(inner);
      const cleanups = defs.map((d, i) => d.build(hosts[i])).filter(f => typeof f === 'function');
      // 每個教具都補上全螢幕按鈕。這裡統一處理，章節檔完全不用改；
      // 進全螢幕只留下畫布和它自己的控制列，其餘卡片留在頁面上。
      defs.forEach((d, i) => {
        const off = Kit.fullscreen(hosts[i]);
        if (off) cleanups.push(off);
      });
      activeCleanup = cleanups.length ? function () { cleanups.forEach(f => f()); } : null;

    } else {
      inner.appendChild(el('div', { class: 'notice' }, [
        el('h3', { text: '本章互動教具尚未建置' }),
        el('p', { text: '目前這一章只有課綱條目與章節結構。骨架已把 ' + c.grade + c.subject + ' 全部單元列出，教具會分批補上。' }),
        el('p', { text: '側欄有 3D／互動徽章的章節就是已完成的。' })
      ]));
      contentEl.innerHTML = '';
      contentEl.appendChild(inner);
    }

    contentEl.scrollTop = 0;
  }

  /* ---------------- 練習區 ----------------
     #practice            挑單元（每冊一張卡，附「整冊混合」）
     #practice/<章節id>    該章的題目，畫面上只有題目
     #practice/mix-<冊前綴> 整冊所有已建置單元隨機混合（例：mix-n5a）
     進入時 body 掛 practice-mode，側欄與 ☰ 都藏起來，讓孩子專心。 */
  function implChapters(prefix) {
    const out = [];
    VISIBLE.forEach(g => g.books.forEach(b => b.chapters.forEach(c => {
      // CHAPTER_INDEX 裡的物件多了 grade／subject／term，標題要用
      if (c.impl && (!prefix || c.id.indexOf(prefix + '-') === 0)) out.push(CHAPTER_INDEX[c.id] || c);
    })));
    return out;
  }
  function defsFor(chapterIds) {
    return chapterIds.reduce((acc, cid) => {
      const c = CHAPTER_INDEX[cid];
      const aidIds = c.use ? (Array.isArray(c.use) ? c.use : [c.use]) : [cid];
      return acc.concat(aidIds.map(a => Kit.get(a)).filter(Boolean));
    }, []);
  }
  function navBtn(text, target, cls) {
    return el('button', { class: 'btn ' + (cls || ''), type: 'button', text: text, onClick: () => go(target) });
  }

  function renderPractice(arg) {
    const inner = el('div', { class: 'inner practice' });
    const top = el('div', { class: 'practice-top' });
    inner.appendChild(top);

    if (!arg) {
      top.appendChild(navBtn('← 回首頁', ''));
      top.appendChild(el('h2', { text: '✏️ 練習區' }));
      inner.appendChild(el('p', { class: 'lead', text: '挑一個單元，或整冊混合出題。這裡只有題目，沒有教具和說明，適合孩子自己練。' }));
      const stats = Kit.quizStats();
      VISIBLE.forEach(g => g.books.forEach(b => {
        const chs = b.chapters.filter(c => c.impl);
        if (!chs.length) return;
        const prefix = chs[0].id.split('-')[0];
        const card = el('div', { class: 'card' });
        card.appendChild(el('h3', {}, [
          el('span', { class: 'tag ' + (b.subject === '數學' ? 'math' : 'sci'), text: b.subject }),
          el('span', { text: g.grade + ' ' + b.term + '（' + b.publisher + '版）' })
        ]));
        const chips = el('div', { class: 'chips' });
        chs.forEach(c => {
          const st = stats[c.id];
          const chip = el('button', { class: 'chip', type: 'button', onClick: () => go('practice/' + c.id) }, [
            el('span', { class: 'n', text: c.no + '.' }), el('span', { text: c.title })
          ]);
          if (st && st.total) {
            const best = st.best ? Object.keys(st.best).sort((x, y) => x - y).map(k => st.best[k] + '/' + k) : [];
            chip.appendChild(el('span', { class: 'chip-stat', text: '練過 ' + st.total + ' 題' + (best.length ? '　最佳 ' + best.join('、') : '') }));
          }
          chips.appendChild(chip);
        });
        const mixSt = stats['mix-' + prefix];
        const mix = el('button', { class: 'chip mix', type: 'button', onClick: () => go('practice/mix-' + prefix) }, [
          el('span', { text: '🎲 整冊混合出題（' + chs.length + ' 個單元）' })
        ]);
        if (mixSt && mixSt.total) mix.appendChild(el('span', { class: 'chip-stat', text: '練過 ' + mixSt.total + ' 題' }));
        chips.appendChild(mix);
        card.appendChild(chips);
        inner.appendChild(card);
      }));
      inner.appendChild(renderProgressCard());
      contentEl.innerHTML = '';
      contentEl.appendChild(inner);
      contentEl.scrollTop = 0;
      return;
    }

    let title, chapters, backId = '';
    if (arg.indexOf('mix-') === 0) {
      chapters = implChapters(arg.slice(4));
      if (!chapters.length) { go('practice'); return; }
      const c0 = chapters[0];
      title = c0.grade + c0.subject + '（' + c0.term + '）整冊混合';
    } else {
      const c = CHAPTER_INDEX[arg];
      if (!c || !c.impl) { go('practice'); return; }
      chapters = [c];
      title = c.title;
      backId = c.id;
    }
    const quizzes = defsFor(chapters.map(c => c.id)).map(d => d.quiz).filter(Boolean);
    if (!quizzes.length) { go('practice'); return; }

    top.appendChild(navBtn('← 練習區', 'practice'));
    if (backId) top.appendChild(navBtn('🎛 看這一章的教具', backId));
    top.appendChild(navBtn('⌂ 首頁', ''));
    inner.appendChild(el('div', { class: 'crumb', text: '專心練習' }));
    inner.appendChild(el('h2', { class: 'title', text: title }));
    if (chapters.length > 1) {
      inner.appendChild(el('p', { class: 'hint', text: '每一題隨機來自：' + chapters.map(c => c.no + '.' + c.title).join('、') }));
    }
    const q = el('div', { class: 'card quiz focus' });
    const qHost = el('div');
    q.appendChild(qHost);
    inner.appendChild(q);
    const makeQ = quizzes.length === 1 ? quizzes[0]
      : function () { return quizzes[Math.floor(Math.random() * quizzes.length)](); };
    contentEl.innerHTML = '';
    contentEl.appendChild(inner);
    contentEl.scrollTop = 0;
    // 紀錄和章節頁共用同一個 key，兩邊練的成績會合在一起
    Kit.practice(qHost, makeQ, 5, { key: arg, scope: chapters.length > 1 ? '整冊' : '本章' });
  }

  /* 進度備份：成績只存在這台瀏覽器的 localStorage。要換裝置或怕清掉，用進度碼搬過去。 */
  function renderProgressCard() {
    const stats = Kit.quizStats();
    const keys = Object.keys(stats);
    const total = keys.reduce((a, k) => a + (stats[k].total || 0), 0);
    const card = el('div', { class: 'card progress' });
    card.appendChild(el('h3', {}, [el('span', { class: 'ico', text: '📦' }), el('span', { text: '進度備份／搬到另一台裝置' })]));
    card.appendChild(el('p', { class: 'src-note', html:
      '成績只存在<b>這台瀏覽器</b>裡（目前 ' + keys.length + ' 個單元、' + total + ' 題），不會上傳。' +
      '換手機或電腦時，在這裡產生進度碼，貼到另一台的「匯入」就會<b>合併</b>過去（最佳成績取高的、題數相加）。' }));
    const msg = el('div', { class: 'pr-fb' });
    const ta = el('textarea', { class: 'progress-code', rows: '3', placeholder: '按「產生進度碼」後這裡會出現一段文字；或把另一台裝置的進度碼貼到這裡再按「匯入」', spellcheck: 'false' });
    const row = el('div', { class: 'pr-actions' });
    const genBtn = Kit.button('產生進度碼', () => {
      ta.value = Kit.exportProgress();
      ta.focus(); ta.select();
      msg.className = 'pr-fb ok'; msg.textContent = '已產生。全選複製，傳給另一台裝置（LINE、email 都可以）。';
    }, 'primary');
    const copyBtn = Kit.button('複製', () => {
      if (!ta.value) { msg.className = 'pr-fb no'; msg.textContent = '先按「產生進度碼」。'; return; }
      ta.focus(); ta.select();
      const done = () => { msg.className = 'pr-fb ok'; msg.textContent = '已複製到剪貼簿。'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { document.execCommand('copy'); done(); });
      else { document.execCommand('copy'); done(); }
    });
    const impBtn = Kit.button('匯入並合併', () => {
      try {
        const r = Kit.importProgress(ta.value);
        msg.className = 'pr-fb ok';
        msg.textContent = '已合併 ' + r.chapters + ' 個單元、' + r.questions + ' 題的紀錄' + (r.date ? '（' + r.date + ' 匯出）' : '') + '。';
        setTimeout(() => go('practice'), 900);   // 重畫，chips 上的紀錄才會更新
      } catch (e) { msg.className = 'pr-fb no'; msg.textContent = '匯入失敗：' + e.message; }
    });
    const clearBtn = Kit.button('清除這台的紀錄', () => {
      if (!keys.length) { msg.className = 'pr-fb no'; msg.textContent = '這台目前沒有紀錄。'; return; }
      if (!window.confirm('確定要清除這台瀏覽器裡全部 ' + keys.length + ' 個單元的練習紀錄？（建議先產生進度碼備份）')) return;
      Kit.clearProgress();
      go('practice');
    });
    row.appendChild(genBtn); row.appendChild(copyBtn); row.appendChild(impBtn); row.appendChild(clearBtn);
    card.appendChild(ta); card.appendChild(row); card.appendChild(msg);
    return card;
  }

  /* ---------------- 首頁 ---------------- */
  function renderHome() {
    // 統計只算「顯示中」的年級，隱藏的不列入
    let total = 0, done = 0;
    VISIBLE.forEach(g => g.books.forEach(b => b.chapters.forEach(c => {
      total++; if (c.impl) done++;
    })));

    const gradeNames = VISIBLE.map(g => g.grade);
    const title = gradeNames.join('、') + ' 數學・自然 互動教具';

    // 只計算「顯示中的章節實際掛到的」條目數，不要拿字典總數充數
    const usedStd = {};
    VISIBLE.forEach(g => g.books.forEach(b => b.chapters.forEach(c =>
      (c.std || []).forEach(s => usedStd[s] = true))));
    const stdCount = Object.keys(usedStd).length;

    // 版本表依「顯示中的年級」自動產生，隱藏年級不會出現在這裡
    const subjects = ['數學', '自然'];
    const verRows = subjects.map(sub => {
      const cells = VISIBLE.map(g => {
        const bk = g.books.filter(b => b.subject === sub);
        const pubs = Array.from(new Set(bk.map(b => b.publisher)));
        return '<td><b>' + (pubs.join('／') || '—') + '</b></td>';
      }).join('');
      return '<tr><td>' + (sub === '自然' ? '自然與生活科技' : sub) + '</td>' + cells + '</tr>';
    }).join('');

    const inner = el('div', { class: 'inner home' });
    inner.innerHTML =
      '<h2>' + title + '</h2>' +
      '<p class="lead">左側選一個單元就開始。每一章都有：互動教具 → 家長導引卡 → 常見錯誤 → 練習題。</p>' +

      '<div class="stat-row">' +
      '<div class="stat"><div class="n">' + total + '</div><div class="l">總章節數</div></div>' +
      '<div class="stat"><div class="n">' + done + '</div><div class="l">已完成互動教具</div></div>' +
      '<div class="stat"><div class="n">' + stdCount + '</div><div class="l">掛載的課綱條目</div></div>' +
      '</div>' +

      '<div class="card"><h3><span class="ico">📚</span><span>版本依據</span></h3>' +
      '<p class="src-note">章節目錄依學校 <b>115 學年度官方課程計畫</b>建置（2026 年 8 月起適用，上、下學期版本一致）：</p>' +
      '<table><thead><tr><th>科目</th>' + gradeNames.map(n => '<th>' + n + '</th>').join('') +
      '</tr></thead><tbody>' + verRows + '</tbody></table>' +
      '<p class="src-note">數學在 114 學年度為康軒，<b>115 學年度改為南一</b>；自然維持康軒。' +
      '依據是學校上傳到臺南市課程計畫平台 <code>course.tn.edu.tw</code> 的「領域學習課程計畫」，' +
      '表頭載明教材版本，各單元的活動也逐週列出。</p>' +
      '<p class="src-note">💡 台灣的教科書是<b>各校自行選用</b>，同一所學校不同科目、不同學年都可能不一樣。<br>' +
      '版本不同也不必重做——各版<b>單元名稱與順序</b>會有差異，但對應的<b>課綱條目是一樣的</b>，' +
      '可以用上面紫色框的條目代碼對照；<code>js/curriculum.js</code> 裡每個單元可用 <code>use</code> 指向既有教具。</p>' +
      (CURRICULUM.length > VISIBLE.length
        ? '<p class="src-note">目前只顯示 ' + gradeNames.join('、') + '。' +
          CURRICULUM.filter(g => g.hidden).map(g => g.grade).join('、') +
          '的章節與教具都<b>完整保留</b>，只是暫時隱藏——把 <code>js/curriculum.js</code> 裡的 <code>hidden: true</code> 改成 <code>false</code> 就會回來。</p>'
        : '') +
      '</div>' +

      '<div class="card"><h3><span class="ico">📐</span><span>課綱條目來源</span></h3>' +
      '<p class="src-note">每一章掛的條目都是<b>官方課綱原文</b>，不是二手轉述。已從下列 PDF 逐條抽出：</p>' +
      '<p class="src-note">• 數學：十二年國教課綱—數學領域（107.06），國家教育研究院 <code>naer.edu.tw/upload/1/16/doc/815/</code>　→ 五年級 27 條（N-5-x／S-5-x／R-5-x／D-5-1）<br>' +
      '• 自然：十二年國教課綱—自然科學領域（107.11），教育部主管法規共用系統 <code>edu.law.moe.gov.tw</code> GL001823　→ 第三學習階段 72 條（INa-Ⅲ ～ INg-Ⅲ）</p>' +
      '<p class="src-note">⚠ 自然領綱<b>不分年級、只分學習階段</b>（五年級屬第三學習階段 Ⅲ，與六年級共用同一批條目），' +
      '所以自然的「年級章節」一律來自教科書單元，條目只是對應標註。</p>' +
      '</div>' +

      (function () {
        // 只列出「顯示中的章節」裡真的還沒確認名稱的單元
        const todos = [];
        VISIBLE.forEach(g => g.books.forEach(b => b.chapters.forEach(c => {
          if (c.todo) todos.push(g.grade + b.subject + '（' + b.publisher + '版 ' + b.term + '）第 ' + c.no + ' 單元');
        })));
        if (!todos.length) return '';
        return '<div class="card"><h3><span class="ico">🔎</span><span>還沒確認的部分</span></h3>' +
          '<p class="src-note">下列單元的<b>名稱</b>目前公開來源不一致，已先用課綱條目佔位：<br>' +
          todos.map(t => '• ' + t).join('<br>') +
          '<br>拿到課本目錄或康軒官方課程計畫後即可補正，章節樹不會因此重排。</p></div>';
      })();

    contentEl.innerHTML = '';
    contentEl.appendChild(inner);
    contentEl.scrollTop = 0;
  }

  /* ---------------- 路由 ---------------- */
  function go(id) {
    if (activeCleanup) { try { activeCleanup(); } catch (e) { /* 忽略清理錯誤 */ } activeCleanup = null; }
    activeId = id;
    location.hash = id ? '#' + id : '';
    document.body.classList.remove('nav-open');
    const isPractice = !!id && id.indexOf('practice') === 0;
    document.body.classList.toggle('practice-mode', isPractice);
    if (isPractice) renderPractice(id.replace(/^practice\/?/, ''));
    else if (id) renderChapter(id); else renderHome();
    // 更新選取狀態，不重建整棵樹以保留展開狀態（練習某一章時也把那一章亮起來）
    const hl = isPractice ? id.replace(/^practice\/?/, '') : id;
    Array.prototype.forEach.call(treeEl.querySelectorAll('.ch'), n => {
      n.classList.toggle('active', n.getAttribute('data-id') === hl);
    });
    const openBook = treeEl.querySelector('.ch.active');
    if (openBook) {
      const bk = openBook.closest('.book');
      if (bk) bk.classList.add('open');
    }
  }

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id !== activeId) go(id);
  });

  searchEl.addEventListener('input', () => buildTree(searchEl.value));

  /* ---------------- 側欄開關 ----------------
     桌機（>860px）：側欄可以收起來，狀態記在 localStorage，下次開啟沿用。
     手機／平板：維持原本的 ☰ 抽屜，點外面就關。同一顆 ☰ 依畫面寬度決定做哪件事。 */
  const menuToggle = document.getElementById('menuToggle');
  const sidebarEl = document.querySelector('.sidebar');
  const desktopMQ = window.matchMedia('(min-width: 861px)');
  // 3D 畫布只聽 window 的 resize 事件重量寬度；側欄收合並不會觸發它，所以自己補發一次
  function pokeResize() { window.dispatchEvent(new Event('resize')); }
  function setCollapsed(on) {
    document.body.classList.toggle('nav-collapsed', on);
    menuToggle.setAttribute('aria-expanded', String(!on));
    try { localStorage.setItem('nav-collapsed', on ? '1' : '0'); } catch (e) { /* 私密模式等情況忽略 */ }
    // transitionend 是主要訊號；瀏覽器若跳過動畫就不會發，所以另外用計時器墊底
    setTimeout(pokeResize, 280);
  }
  sidebarEl.addEventListener('transitionend', e => { if (e.propertyName === 'margin-left') pokeResize(); });
  menuToggle.setAttribute('aria-expanded', String(!document.body.classList.contains('nav-collapsed')));

  menuToggle.addEventListener('click', () => {
    if (desktopMQ.matches) setCollapsed(!document.body.classList.contains('nav-collapsed'));
    else document.body.classList.toggle('nav-open');
  });
  document.getElementById('sbCollapse').addEventListener('click', () => setCollapsed(true));
  document.getElementById('scrim').addEventListener('click', () => {
    document.body.classList.remove('nav-open');
  });
  document.getElementById('homeLink').addEventListener('click', e => { e.preventDefault(); go(''); });
  document.getElementById('practiceLink').addEventListener('click', () => go('practice'));
  document.getElementById('appVersion').textContent = 'v' + (typeof APP_VERSION === 'string' ? APP_VERSION : '?');

  /* ---------------- 啟動 ---------------- */
  activeId = location.hash.replace('#', '') || null;
  buildTree('');
  if (activeId && (CHAPTER_INDEX[activeId] || activeId.indexOf('practice') === 0)) go(activeId); else renderHome();
})();
