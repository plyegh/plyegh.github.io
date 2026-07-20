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
  view: 'home', // 'home' | 'post' | 'about'
  filter: null,
  postId: null,
  page: 1,
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
        <a href="#" class="nav-link ${state.view !== 'about' ? 'active' : ''}" data-nav="home">Posts</a>
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
    <p class="text-muted">© 2026 ${esc(PROFILE.name)} · 나만의 공부 블로그</p>
  </footer>`;
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
      setState({ view: el.getAttribute('data-nav') });
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
