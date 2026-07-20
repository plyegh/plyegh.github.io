/* 관리자 모드: GitHub API로 _posts/에 글을 커밋합니다 */

const ADMIN = {
  owner: 'plyegh',
  repo: 'plyegh.github.io',
  branch: 'main',
};

const API = `https://api.github.com/repos/${ADMIN.owner}/${ADMIN.repo}/contents/`;
const S = { editingPath: null, editingSha: null, msg: '' };

function getToken() { return sessionStorage.getItem('gh-token') || ''; }
function esc(str) { const d = document.createElement('div'); d.textContent = String(str); return d.innerHTML; }

function ghHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function b64encode(str) { return btoa(String.fromCharCode(...new TextEncoder().encode(str))); }
function b64decode(b64) { return new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0))); }

function slugify(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'post';
}

function buildMarkdown({ title, cat, tags, summary, body }) {
  const q = s => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return ['---', `title: ${q(title)}`, `categories: [${q(cat)}]`, `tags: [${tags.join(', ')}]`,
          `summary: ${q(summary)}`, '---', '', body.trim(), ''].join('\n');
}

function render() {
  document.getElementById('admin-title').textContent =
    !getToken() ? '관리자 로그인' : (S.editingPath ? '글 수정' : '새 글 작성');
  const box = document.getElementById('admin-body');

  if (!getToken()) {
    box.innerHTML = `
      <div class="admin-panel">
        <p class="text-muted" style="font-size:13.5px;max-width:62ch;line-height:1.7;">
          글 작성/수정/삭제는 GitHub API로 <strong>${esc(ADMIN.owner)}/${esc(ADMIN.repo)}</strong> 저장소에 직접 커밋하는 방식입니다.
          Fine-grained personal access token(대상: 이 저장소만 / 권한: Contents — Read and write)을 입력하세요.
        </p>
        <div class="form-row">
          <input type="password" id="token-input" class="input" placeholder="github_pat_...">
          <button type="button" class="btn btn-ghost" id="btn-login">로그인</button>
        </div>
        <p class="text-muted" style="font-size:12.5px;">토큰은 이 브라우저 탭의 세션에만 저장되며, 탭을 닫으면 사라집니다.</p>
      </div>`;
    document.getElementById('btn-login').onclick = () => {
      const t = document.getElementById('token-input').value.trim();
      if (t) { sessionStorage.setItem('gh-token', t); render(); }
    };
    return;
  }

  const p = S.editingPath ? POSTS_META.find(x => x.path === S.editingPath) : null;
  const catOptions = CATEGORIES.map(s =>
    `<option value="${esc(s)}" ${p && p.cat === s ? 'selected' : ''}>${esc(s)}</option>`).join('');
  const listHtml = POSTS_META.map(post => `
    <div class="admin-row">
      <span class="text-muted" style="font-variant-numeric:tabular-nums;">${esc(post.date)}</span>
      <span class="admin-row-title">${esc(post.title)}</span>
      <button type="button" class="btn btn-ghost" data-edit="${esc(post.path)}">수정</button>
      <button type="button" class="btn btn-ghost btn-danger" data-del="${esc(post.path)}">삭제</button>
    </div>`).join('');

  box.innerHTML = `
    ${S.msg ? `<p class="admin-msg">${esc(S.msg)}</p>` : ''}
    <div class="admin-panel">
      <p style="margin:0 0 8px;"><button type="button" class="clear-filter" id="btn-logout">로그아웃</button>
      ${S.editingPath ? `<span class="text-muted" style="font-size:12.5px;margin-left:12px;">파일: ${esc(S.editingPath)}</span>
        <button type="button" class="clear-filter" id="btn-cancel" style="margin-left:8px;">새 글 쓰기로 전환</button>` : ''}</p>
      <div class="form-grid">
        <input type="text" id="f-title" class="input" placeholder="제목" value="${p ? esc(p.title) : ''}">
        <div class="form-row">
          <select id="f-cat" class="input">${catOptions}</select>
          <input type="text" id="f-tags" class="input" placeholder="태그 (쉼표로 구분: AWS, IAM)" value="${p ? esc(p.tags.join(', ')) : ''}">
        </div>
        <input type="text" id="f-summary" class="input" placeholder="목록에 표시될 요약 (한두 문장)" value="${p ? esc(p.summary) : ''}">
        <textarea id="f-body" class="input" rows="16" placeholder="본문 (마크다운)&#10;&#10;## 소제목&#10;&#10;내용... ($수식$, mermaid 코드블록도 지원)">${p && p.raw ? esc(p.raw) : ''}</textarea>
        <div class="form-row">
          <button type="button" class="btn btn-ghost" id="btn-submit">${S.editingPath ? '수정 커밋' : '발행 (커밋)'}</button>
        </div>
      </div>
      <p class="text-muted" style="font-size:12.5px;">커밋 후 GitHub Pages 재빌드까지 1~2분 걸립니다.</p>
    </div>
    <div class="section-title-row" style="margin-top:36px;"><h2 style="font-size:26px;">글 관리</h2></div>
    ${listHtml}`;

  document.getElementById('btn-logout').onclick = () => {
    sessionStorage.removeItem('gh-token'); S.editingPath = S.editingSha = null; S.msg = ''; render();
  };
  const cancel = document.getElementById('btn-cancel');
  if (cancel) cancel.onclick = () => { S.editingPath = S.editingSha = null; render(); };
  document.getElementById('btn-submit').onclick = submitPost;
  box.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => startEdit(el.getAttribute('data-edit')));
  box.querySelectorAll('[data-del]').forEach(el => el.onclick = () => deletePost(el.getAttribute('data-del')));
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
  if (!title || !summary || !body.trim()) { S.msg = '제목, 요약, 본문은 필수입니다.'; render(); return; }

  const editing = !!S.editingPath;
  let path = S.editingPath;
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
  if (editing) payload.sha = S.editingSha || await fetchFileSha(path).catch(() => null);

  S.msg = '커밋 중...'; render();
  try {
    const res = await fetch(API + path, { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(`커밋 실패 (${res.status}) ${err.message || ''}`); }
    S.msg = (editing ? '수정' : '발행') + ' 완료! 1~2분 후 사이트에 반영됩니다.';
    S.editingPath = S.editingSha = null;
  } catch (e) { S.msg = '오류: ' + e.message; }
  render();
}

async function deletePost(path) {
  const post = POSTS_META.find(p => p.path === path);
  if (!confirm(`"${post ? post.title : path}" 글을 삭제할까요?\n저장소에서 파일이 삭제되는 커밋이 실행됩니다.`)) return;
  S.msg = '삭제 중...'; render();
  try {
    const sha = await fetchFileSha(path);
    const res = await fetch(API + path, {
      method: 'DELETE', headers: ghHeaders(),
      body: JSON.stringify({ message: 'post: delete ' + (post ? post.title : path), sha, branch: ADMIN.branch }),
    });
    if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
    const i = POSTS_META.findIndex(p => p.path === path);
    if (i >= 0) POSTS_META.splice(i, 1);
    S.msg = '삭제 완료! 1~2분 후 사이트에 반영됩니다.';
  } catch (e) { S.msg = '오류: ' + e.message; }
  render();
}

async function startEdit(path) {
  S.msg = '원본 불러오는 중...'; render();
  try {
    const res = await fetch(API + path + `?ref=${ADMIN.branch}`, { headers: ghHeaders() });
    if (!res.ok) throw new Error(`파일 조회 실패 (${res.status})`);
    const data = await res.json();
    const text = b64decode(data.content);
    const m = text.match(/^---\n[\s\S]*?\n---\n?/);
    const post = POSTS_META.find(p => p.path === path);
    if (post) post.raw = m ? text.slice(m[0].length).trim() : text;
    S.editingPath = path; S.editingSha = data.sha; S.msg = '';
  } catch (e) { S.msg = '오류: ' + e.message; }
  render();
}

render();
