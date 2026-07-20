/* ===== 설정: 프로필과 카테고리는 여기서 수정하세요 ===== */

const PROFILE = {
  name: '동준 팍',
  bio: '클라우드와 보안을 공부하며, 배운 것을 조용히 기록합니다.',
  photo: 'assets/profile.png', // 이 파일을 assets 폴더에 넣어주세요
  email: 'mailto:your-email@example.com', // 실제 이메일로 교체하세요
  github: 'https://github.com/plyegh',
  instagram: 'https://instagram.com/',
};

const GROUPS = [
  { name: '클라우드', subs: ['클라우드 보안', 'Openstack', 'AWS', 'NCP', 'GCP'] },
  { name: 'AI & Sec', subs: ['LLM 구축', 'OWASP AI'] },
  { name: 'Hacking', subs: ['Web', 'Rev', 'Pwn', 'Misc'] },
];

const PER_PAGE = 5;

/* 관리자 모드: 이 저장소에 글을 커밋합니다 */
const ADMIN = {
  owner: 'plyegh',
  repo: 'plyegh.github.io',
  branch: 'main',
};

/* utterances 댓글 (GitHub Issues 기반)
   사용하려면: 1) enabled를 true로, 2) repo를 본인 저장소로,
   3) https://github.com/apps/utterances 에서 앱을 해당 저장소에 설치 */
const UTTERANCES = {
  enabled: false,
  repo: 'plyegh/plyegh.github.io',
  theme: 'github-dark',
};

/* ===== 글 데이터 =====
   글은 _posts/ 폴더의 마크다운 파일로 관리합니다.
   Jekyll이 빌드할 때 posts.json으로 변환해 주고, 아래에서 불러옵니다. */

let POSTS = [];

/* ===== 상태 ===== */

const state = {
  view: 'home', // 'home' | 'post' | 'about' | 'admin'
  filter: null,
  postId: null,
  page: 1,
  editingPath: null, // 수정 중인 글의 파일 경로 (null이면 새 글)
  editingSha: null,
  adminMsg: '',
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

/* ===== 유틸 ===== */

function esc(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

const ICONS = {
  mail: '<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>',
  github: '<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>',
  insta: '<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>',
  calendar: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>',
};

/* ===== 렌더 ===== */

function render() {
  const app = document.getElementById('app');
  app.innerHTML = renderHeader() + renderLayout() + renderFooter();
  bindEvents();
  if (state.view === 'post') mountComments();
}

function renderHeader() {
  return `
  <header class="site-header">
    <div class="inner wrap" style="padding:20px 32px;">
      <a href="#" class="brand" data-nav="home">나만의 공부 블로그 <em>: My Blog</em></a>
      <nav class="site-nav">
        <a href="#" class="nav-link ${state.view === 'home' || state.view === 'post' ? 'active' : ''}" data-nav="home">Posts</a>
        <a href="#" class="nav-link ${state.view === 'about' ? 'active' : ''}" data-nav="about">About</a>
      </nav>
    </div>
  </header>`;
}

function renderLayout() {
  return `
  <div class="layout wrap">
    ${renderSidebar()}
    <main class="main">
      ${state.view === 'home' ? renderHome() : ''}
      ${state.view === 'post' ? renderPost() : ''}
      ${state.view === 'about' ? renderAbout() : ''}
      ${state.view === 'admin' ? renderAdmin() : ''}
    </main>
  </div>`;
}

function renderSidebar() {
  const counts = {};
  POSTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });

  const groupsHtml = GROUPS.map(g => `
    <div class="group-block">
      <h4>${esc(g.name)}</h4>
      <div class="group-subs">
        ${g.subs.map(s => `
          <button type="button" class="sub-link ${state.filter === s ? 'active' : ''}" data-filter="${esc(s)}">${esc(s)} (${counts[s] || 0})</button>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <aside class="sidebar">
      <img src="${PROFILE.photo}" alt="profile" class="plate" onerror="this.style.display='none'">
      <h3>${esc(PROFILE.name)}</h3>
      <p class="text-muted bio">${esc(PROFILE.bio)}</p>
      <div class="contact-list">
        <a href="${PROFILE.email}">${ICONS.mail}Email</a>
        <a href="${PROFILE.github}" target="_blank" rel="noopener">${ICONS.github}GitHub</a>
        <a href="${PROFILE.instagram}" target="_blank" rel="noopener">${ICONS.insta}Instagram</a>
      </div>
      <hr class="hr" style="margin:20px 0;">
      <p class="text-muted total-count">전체 글 ${POSTS.length} 개</p>
      ${groupsHtml}
    </aside>`;
}

function renderHome() {
  const filtered = state.filter ? POSTS.filter(p => p.cat === state.filter) : POSTS;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(state.page, pageCount);
  const pagePosts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const postsHtml = pagePosts.map(p => `
    <article class="post-item">
      <p class="text-muted post-meta">${ICONS.calendar}${esc(p.date)} · ${esc(p.cat)}</p>
      <h3><a href="#" data-open-post="${p.id}">${esc(p.title)}</a></h3>
      <p class="post-summary">${esc(p.summary)}</p>
      <div class="tag-row">
        ${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
    </article>
  `).join('');

  const pageBtns = Array.from({ length: pageCount }, (_, i) => `
    <button type="button" class="btn page-btn ${page === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
  `).join('');

  return `
    <section>
      <div class="section-title-row">
        <h2>${esc(state.filter || 'Recent Posts')}</h2>
        ${state.filter ? `<button type="button" class="clear-filter" data-action="clear-filter">필터 해제 ×</button>` : ''}
      </div>
      ${postsHtml || `<p class="text-muted" style="padding:24px 0;">이 카테고리에는 아직 글이 없습니다.</p>`}
      <nav class="pagination">
        <button type="button" class="btn btn-ghost" data-action="prev-page">이전</button>
        ${pageBtns}
        <button type="button" class="btn btn-ghost" data-action="next-page">다음</button>
      </nav>
    </section>`;
}

function renderPost() {
  const post = POSTS.find(p => p.id === state.postId) || POSTS[0];
  if (!post) return '';

  return `
    <article>
      <a href="#" class="back-link" data-nav="home">← 목록으로</a>
      <p class="text-muted post-detail-meta">${esc(post.date)} · ${esc(post.cat)}</p>
      <h1 class="post-title">${esc(post.title)}</h1>
      <div class="post-tag-row">
        ${post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
      <div class="post-body">${post.content}</div>
      <hr class="hr" style="margin:40px 0 20px;">
      <a href="#" class="btn-secondary" data-nav="home">← 목록으로 돌아가기</a>
      <div class="comments-box" id="comments"></div>
    </article>`;
}

function renderAbout() {
  return `
    <section>
      <div class="section-title-row" style="border-bottom:1px solid var(--color-text);">
        <h2>About</h2>
      </div>
      <div class="about-body">
        <p class="lead">안녕하세요, <strong>${esc(PROFILE.name)}</strong>입니다. 클라우드 인프라와 보안을 공부하고 있으며, 이 블로그는 매일 배운 것을 정리해 두는 기록장이자 포트폴리오입니다.</p>
        <p>주로 다루는 주제는 세 갈래입니다. 클라우드에서는 AWS·GCP·NCP 같은 퍼블릭 클라우드와 Openstack 기반 프라이빗 클라우드의 구축·보안을, AI &amp; Sec에서는 LLM 인프라 구축과 OWASP 관점의 AI 보안을, Hacking에서는 워게임과 CTF 풀이 과정을 기록합니다.</p>
        <p>짧더라도 그날 이해한 만큼만, 다음에 다시 읽어도 재현할 수 있게 쓰는 것을 원칙으로 합니다.</p>
        <h3>Contact</h3>
        <p>이메일, GitHub, Instagram 링크는 왼쪽 프로필에서 확인하실 수 있습니다. 글에 대한 지적과 제안은 언제나 환영합니다.</p>
      </div>
    </section>`;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <p class="text-muted">© 2026 ${esc(PROFILE.name)} · 나만의 공부 블로그
      <a href="#" class="admin-link" data-nav="admin">관리</a>
    </p>
  </footer>`;
}

/* ===== 관리자 모드 ===== */

function getToken() { return sessionStorage.getItem('gh-token') || ''; }

function renderAdmin() {
  if (!getToken()) {
    return `
    <section>
      <div class="section-title-row"><h2>관리자 로그인</h2></div>
      <div class="admin-panel">
        <p class="text-muted" style="font-size:13.5px;max-width:62ch;line-height:1.7;">
          글 작성/수정/삭제는 GitHub API로 <strong>${esc(ADMIN.owner)}/${esc(ADMIN.repo)}</strong> 저장소에 직접 커밋하는 방식입니다.
          GitHub의 <em>Fine-grained personal access token</em>을 발급해 입력하세요.
          (Settings → Developer settings → Fine-grained tokens / 대상: 이 저장소만 / 권한: Contents — Read and write)
        </p>
        <div class="form-row">
          <input type="password" id="token-input" class="input" placeholder="github_pat_...">
          <button type="button" class="btn btn-ghost" data-action="save-token">로그인</button>
        </div>
        <p class="text-muted" style="font-size:12.5px;">토큰은 서버로 전송되지 않고 이 브라우저 탭의 세션에만 저장되며, 탭을 닫으면 사라집니다.</p>
      </div>
    </section>`;
  }

  const p = state.editingPath ? POSTS.find(x => x.path === state.editingPath) : null;
  const catOptions = GROUPS.flatMap(g => g.subs)
    .map(s => `<option value="${esc(s)}" ${p && p.cat === s ? 'selected' : ''}>${esc(s)}</option>`).join('');

  const listHtml = POSTS.map(post => `
    <div class="admin-row">
      <span class="text-muted" style="font-variant-numeric:tabular-nums;">${esc(post.date)}</span>
      <span class="admin-row-title">${esc(post.title)}</span>
      <button type="button" class="btn btn-ghost" data-edit-post="${esc(post.path)}">수정</button>
      <button type="button" class="btn btn-ghost btn-danger" data-delete-post="${esc(post.path)}">삭제</button>
    </div>
  `).join('');

  return `
    <section>
      <div class="section-title-row">
        <h2>${state.editingPath ? '글 수정' : '새 글 작성'}</h2>
        <button type="button" class="clear-filter" data-action="logout">로그아웃</button>
      </div>
      ${state.adminMsg ? `<p class="admin-msg">${esc(state.adminMsg)}</p>` : ''}
      <div class="admin-panel">
        ${state.editingPath ? `<p class="text-muted" style="font-size:12.5px;">파일: ${esc(state.editingPath)} <button type="button" class="clear-filter" data-action="cancel-edit" style="margin-left:8px;">새 글 쓰기로 전환</button></p>` : ''}
        <div class="form-grid">
          <input type="text" id="f-title" class="input" placeholder="제목" value="${p ? esc(p.title) : ''}">
          <div class="form-row">
            <select id="f-cat" class="input">${catOptions}</select>
            <input type="text" id="f-tags" class="input" placeholder="태그 (쉼표로 구분: AWS, IAM)" value="${p ? esc(p.tags.join(', ')) : ''}">
          </div>
          <input type="text" id="f-summary" class="input" placeholder="목록에 표시될 요약 (한두 문장)" value="${p ? esc(p.summary) : ''}">
          <textarea id="f-body" class="input" rows="16" placeholder="본문 (마크다운)&#10;&#10;## 소제목&#10;&#10;내용...">${p ? esc(p.raw || '') : ''}</textarea>
          <div class="form-row">
            <button type="button" class="btn btn-ghost" data-action="submit-post">${state.editingPath ? '수정 커밋' : '발행 (커밋)'}</button>
          </div>
        </div>
        <p class="text-muted" style="font-size:12.5px;">커밋 후 GitHub Pages가 다시 빌드되기까지 1~2분 걸립니다. 반영 전까지는 목록이 이전 상태로 보일 수 있어요.</p>
      </div>
      <div class="section-title-row" style="margin-top:36px;"><h2 style="font-size:26px;">글 관리</h2></div>
      ${listHtml}
    </section>`;
}

/* ---- GitHub API ---- */

const API = `https://api.github.com/repos/${ADMIN.owner}/${ADMIN.repo}/contents/`;

function ghHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function b64encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function b64decode(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0)));
}

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim().replace(/\s+/g, '-')
    .slice(0, 60) || 'post';
}

function buildMarkdown({ title, cat, tags, summary, body }) {
  const q = s => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return [
    '---',
    `title: ${q(title)}`,
    `cat: ${q(cat)}`,
    `tags: [${tags.join(', ')}]`,
    `summary: ${q(summary)}`,
    '---',
    '',
    body.trim(),
    '',
  ].join('\n');
}

async function fetchFileSha(path) {
  const res = await fetch(API + path + `?ref=${ADMIN.branch}`, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`파일 조회 실패 (${res.status})`);
  return (await res.json()).sha;
}

async function submitPost() {
  const title = document.getElementById('f-title').value.trim();
  const cat = document.getElementById('f-cat').value;
  const tags = document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const summary = document.getElementById('f-summary').value.trim();
  const body = document.getElementById('f-body').value;

  if (!title || !summary || !body.trim()) {
    setState({ adminMsg: '제목, 요약, 본문은 필수입니다.' });
    return;
  }

  const editing = !!state.editingPath;
  let path = state.editingPath;
  if (!editing) {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    path = `_posts/${dateStr}-${slugify(title)}.md`;
  }

  const payload = {
    message: (editing ? 'post: update ' : 'post: add ') + title,
    content: b64encode(buildMarkdown({ title, cat, tags, summary, body })),
    branch: ADMIN.branch,
  };
  if (editing) payload.sha = state.editingSha || await fetchFileSha(path).catch(() => null);

  setState({ adminMsg: '커밋 중...' });
  try {
    const res = await fetch(API + path, {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`커밋 실패 (${res.status}) ${err.message || ''}`);
    }
    setState({
      adminMsg: (editing ? '수정' : '발행') + ' 완료! 1~2분 후 사이트에 반영됩니다.',
      editingPath: null, editingSha: null,
    });
  } catch (e) {
    setState({ adminMsg: '오류: ' + e.message });
  }
}

async function deletePost(path) {
  const post = POSTS.find(p => p.path === path);
  if (!confirm(`"${post ? post.title : path}" 글을 삭제할까요?\n저장소에서 파일이 삭제되는 커밋이 실행됩니다.`)) return;

  setState({ adminMsg: '삭제 중...' });
  try {
    const sha = await fetchFileSha(path);
    const res = await fetch(API + path, {
      method: 'DELETE',
      headers: ghHeaders(),
      body: JSON.stringify({
        message: 'post: delete ' + (post ? post.title : path),
        sha,
        branch: ADMIN.branch,
      }),
    });
    if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
    POSTS = POSTS.filter(p => p.path !== path);
    setState({ adminMsg: '삭제 완료! 1~2분 후 사이트에 반영됩니다.' });
  } catch (e) {
    setState({ adminMsg: '오류: ' + e.message });
  }
}

async function startEdit(path) {
  setState({ adminMsg: '원본 불러오는 중...' });
  try {
    const res = await fetch(API + path + `?ref=${ADMIN.branch}`, { headers: ghHeaders() });
    if (!res.ok) throw new Error(`파일 조회 실패 (${res.status})`);
    const data = await res.json();
    const text = b64decode(data.content);
    const m = text.match(/^---\n[\s\S]*?\n---\n?/);
    const rawBody = m ? text.slice(m[0].length).trim() : text;

    const post = POSTS.find(p => p.path === path);
    if (post) post.raw = rawBody;

    setState({ editingPath: path, editingSha: data.sha, adminMsg: '' });
  } catch (e) {
    setState({ adminMsg: '오류: ' + e.message });
  }
}

/* ===== utterances 댓글 ===== */

function mountComments() {
  if (!UTTERANCES.enabled) return;
  const box = document.getElementById('comments');
  if (!box) return;
  const post = POSTS.find(p => p.id === state.postId);
  if (!post) return;

  const s = document.createElement('script');
  s.src = 'https://utteranc.es/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.setAttribute('repo', UTTERANCES.repo);
  s.setAttribute('issue-term', post.title);
  s.setAttribute('label', 'comment');
  s.setAttribute('theme', UTTERANCES.theme);
  box.appendChild(s);
}

/* ===== 이벤트 바인딩 ===== */

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      setState({ view: el.getAttribute('data-nav'), adminMsg: '' });
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll('[data-filter]').forEach(el => {
    el.addEventListener('click', () => {
      setState({ view: 'home', filter: el.getAttribute('data-filter'), page: 1 });
    });
  });

  const clearBtn = document.querySelector('[data-action="clear-filter"]');
  if (clearBtn) clearBtn.addEventListener('click', () => setState({ filter: null, page: 1 }));

  document.querySelectorAll('[data-open-post]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      setState({ view: 'post', postId: Number(el.getAttribute('data-open-post')) });
      window.scrollTo(0, 0);
    });
  });

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => setState({ page: Number(el.getAttribute('data-page')) }));
  });

  const prevBtn = document.querySelector('[data-action="prev-page"]');
  if (prevBtn) prevBtn.addEventListener('click', () => setState({ page: Math.max(1, state.page - 1) }));

  const nextBtn = document.querySelector('[data-action="next-page"]');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const filtered = state.filter ? POSTS.filter(p => p.cat === state.filter) : POSTS;
    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    setState({ page: Math.min(pageCount, state.page + 1) });
  });

  /* 관리자 */
  const saveTokenBtn = document.querySelector('[data-action="save-token"]');
  if (saveTokenBtn) saveTokenBtn.addEventListener('click', () => {
    const t = document.getElementById('token-input').value.trim();
    if (t) { sessionStorage.setItem('gh-token', t); setState({ adminMsg: '' }); }
  });

  const logoutBtn = document.querySelector('[data-action="logout"]');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('gh-token');
    setState({ editingPath: null, editingSha: null, adminMsg: '' });
  });

  const submitBtn = document.querySelector('[data-action="submit-post"]');
  if (submitBtn) submitBtn.addEventListener('click', submitPost);

  const cancelEditBtn = document.querySelector('[data-action="cancel-edit"]');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => setState({ editingPath: null, editingSha: null }));

  document.querySelectorAll('[data-edit-post]').forEach(el => {
    el.addEventListener('click', () => startEdit(el.getAttribute('data-edit-post')));
  });

  document.querySelectorAll('[data-delete-post]').forEach(el => {
    el.addEventListener('click', () => deletePost(el.getAttribute('data-delete-post')));
  });
}

/* ===== 시작: Jekyll이 생성한 posts.json 로드 ===== */

fetch('posts.json')
  .then(r => {
    if (!r.ok) throw new Error('posts.json 로드 실패');
    return r.json();
  })
  .then(data => {
    POSTS = data;
    render();
  })
  .catch(err => {
    console.error(err);
    document.getElementById('app').innerHTML =
      '<p style="padding:40px 32px;font-family:sans-serif;">글 데이터를 불러오지 못했습니다. ' +
      'Jekyll 빌드가 필요합니다 — 로컬에서는 <code>bundle exec jekyll serve</code>로 실행해주세요. ' +
      '(파일을 직접 더블클릭해서 열면 데이터가 로드되지 않습니다)</p>';
  });
