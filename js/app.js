import { demos } from "./demos/index.js";

/**
 * @typedef {"range"|"number"|"select"|"color"|"text"} ControlType
 * @typedef {{
 *   key: string;
 *   label: string;
 *   type: ControlType;
 *   min?: number;
 *   max?: number;
 *   step?: number;
 *   options?: { label: string; value: string }[];
 * }} Control
 *
 * @typedef {{
 *   playback: string[];
 *   type: string[];
 *   related: string[];
 * }} TagGroups
 *
 * @typedef {{
 *   id: string;
 *   title: string;
 *   subtitle: string;
 *   tags: TagGroups;
 *   defaults?: Record<string, any>;
 *   controls?: Control[];
 *   getCode?: (params: Record<string, any>) => string;
 *   mount: (el:HTMLElement, opts?: { reduceMotion?: boolean; mode?: "preview"|"modal"; params?: Record<string, any> })=>()=>void;
 *   code?: string; // 兼容旧字段
 * }} Demo
 */

const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

/** @type {Map<string, () => void>} */
const previewCleanup = new Map();
let modalCleanup = null;

const $grid = /** @type {HTMLElement} */ (document.getElementById("galleryGrid"));
const $modal = /** @type {HTMLElement} */ (document.getElementById("modal"));
const $modalStage = /** @type {HTMLElement} */ (document.getElementById("modalStage"));
const $modalTitle = /** @type {HTMLElement} */ (document.getElementById("modalTitle"));
const $modalSubTitle = /** @type {HTMLElement} */ (document.getElementById("modalSubTitle"));
const $modalCode = /** @type {HTMLElement} */ (document.getElementById("modalCode"));
const $btnCopy = /** @type {HTMLButtonElement} */ (document.getElementById("btnCopy"));
const $modalControls = /** @type {HTMLElement} */ (document.getElementById("modalControls"));
const $btnResetParams = /** @type {HTMLButtonElement} */ (document.getElementById("btnResetParams"));
const $tagFilters = /** @type {HTMLElement} */ (document.getElementById("tagFilters"));
const $searchInput = /** @type {HTMLInputElement} */ (document.getElementById("searchInput"));

/** @type {{ demoId: string|null; params: Record<string, any> }} */
const modalState = { demoId: null, params: {} };

function setRepoVersion() {
  const $ver = document.getElementById("repoVersion");
  if (!$ver) return;
  const fallback = window.__REPO_VERSION__ || "UNVERSIONED";
  $ver.textContent = fallback;

  // 尝试从 .git 读取 commit（本地开发有用；线上通常不会部署 .git）
  try {
    fetch("./.git/HEAD")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((head) => head.trim())
      .then((head) => {
        if (!head) return;
        if (head.startsWith("ref:")) {
          const ref = head.replace(/^ref:\s*/, "").trim();
          return fetch(`./.git/${ref}`).then((r) => (r.ok ? r.text() : Promise.reject()));
        }
        return head;
      })
      .then((hash) => {
        if (!hash) return;
        const short = String(hash).trim().slice(0, 7);
        if (short) $ver.textContent = short;
      })
      .catch(() => {});
  } catch (_) {}
}

function getDemoCode(demo, params) {
  if (typeof demo.getCode === "function") return demo.getCode(params);
  if (typeof demo.code === "string") return demo.code;
  return "";
}

function highlightCodeHtml(code, demo, params) {
  // 先整体转义，再把“可调参数的当前值”高亮
  let html = escapeHtml(code);
  const controls = demo.controls ?? [];
  for (const c of controls) {
    const raw = params?.[c.key];
    if (raw === undefined || raw === null) continue;
    const needle = escapeHtml(String(raw));
    if (!needle) continue;
    html = html.replaceAll(
      needle,
      `<span class="text-primary font-bold underline underline-offset-2">${needle}</span>`
    );
  }
  return html;
}

function updateModalCode(demo) {
  const code = getDemoCode(demo, modalState.params);
  $modalCode.innerHTML = highlightCodeHtml(code, demo, modalState.params);
  $btnCopy.onclick = () => copyText(code);
}

function createCard(demo) {
  const el = document.createElement("div");
  el.className =
    "group flex flex-col h-[480px] border-b-[0.5px] border-r-[0.5px] border-outline-variant relative bg-surface";

  el.innerHTML = `
    <div class="absolute top-4 right-4 flex gap-0 border-[0.5px] border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-surface">
      <button class="w-10 h-10 flex items-center justify-center border-r-[0.5px] border-outline-variant hover:bg-primary hover:text-surface transition-colors" title="复制代码" data-action="copy">
        <span class="material-symbols-outlined text-sm">content_copy</span>
      </button>
      <button class="w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-surface transition-colors" title="展开" data-action="expand">
        <span class="material-symbols-outlined text-sm">open_in_full</span>
      </button>
    </div>

    <div class="flex-1 relative overflow-hidden bg-surface-container-low flex items-center justify-center">
      <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
      <div class="demo-stage" data-preview></div>
    </div>

    <div class="h-20 border-t-[0.5px] border-outline-variant p-4 flex flex-col justify-center bg-surface group-hover:bg-on-surface group-hover:text-surface transition-colors duration-300">
      <h3 class="text-sm font-bold tracking-tight uppercase">${escapeHtml(demo.title)}</h3>
      <p class="text-[10px] text-outline mt-1 font-mono uppercase tracking-widest group-hover:text-surface-variant">${escapeHtml(
        demo.subtitle
      )}</p>
    </div>
  `;

  el.addEventListener("click", (e) => {
    const btn = /** @type {HTMLElement|null} */ (e.target instanceof Element ? e.target.closest("[data-action]") : null);
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "copy") {
      const params = { ...(demo.defaults ?? {}) };
      copyText(getDemoCode(demo, params));
    }
    if (action === "expand") openModal(demo.id);
  });

  return el;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

function renderGallery(list) {
  // cleanup previews
  for (const fn of previewCleanup.values()) fn();
  previewCleanup.clear();

  $grid.innerHTML = "";
  for (const demo of list) {
    const card = createCard(demo);
    $grid.appendChild(card);

    const stage = /** @type {HTMLElement} */ (card.querySelector("[data-preview]"));
    try {
      const cleanup = demo.mount(stage, { reduceMotion, mode: "preview" });
      previewCleanup.set(demo.id, cleanup);
    } catch (err) {
      stage.innerHTML = `<div class="p-4 text-xs text-error font-mono">初始化失败：${escapeHtml(
        err?.message ?? String(err)
      )}</div>`;
    }
  }
}

function getDemoById(id) {
  return demos.find((d) => d.id === id) ?? null;
}

const filterState = {
  playback: new Set(),
  type: new Set(),
  related: new Set(),
  q: ""
};

function normTagGroups(tags) {
  return {
    playback: Array.isArray(tags?.playback) ? tags.playback : [],
    type: Array.isArray(tags?.type) ? tags.type : [],
    related: Array.isArray(tags?.related) ? tags.related : []
  };
}

function collectTagOptions() {
  /** @type {{ playback:Set<string>, type:Set<string>, related:Set<string> }} */
  const opts = { playback: new Set(), type: new Set(), related: new Set() };
  for (const d of demos) {
    const tg = normTagGroups(d.tags);
    tg.playback.forEach((t) => opts.playback.add(t));
    tg.type.forEach((t) => opts.type.add(t));
    tg.related.forEach((t) => opts.related.add(t));
  }
  return opts;
}

function chipClass(active) {
  return [
    "h-7",
    "px-2",
    "border-[0.5px]",
    "border-outline-variant",
    "text-[10px]",
    "font-bold",
    "uppercase",
    "tracking-widest",
    "transition-colors",
    active ? "bg-on-surface text-surface" : "bg-surface text-on-surface hover:bg-surface-container-high"
  ].join(" ");
}

function renderTagFilters() {
  const opts = collectTagOptions();
  $tagFilters.innerHTML = "";

  /** @type {{ key: "playback"|"type"|"related"; label: string; values: string[] }[]} */
  const groups = [
    { key: "playback", label: "播放状态", values: Array.from(opts.playback).sort() },
    { key: "type", label: "动画类型", values: Array.from(opts.type).sort() },
    { key: "related", label: "相关性", values: Array.from(opts.related).sort() }
  ];

  for (const g of groups) {
    const details = document.createElement("details");
    details.className = "relative shrink-0";

    const activeCount = filterState[g.key].size;
    details.innerHTML = `
      <summary class="${chipClass(activeCount > 0)} list-none cursor-pointer select-none flex items-center gap-2">
        <span>${escapeHtml(g.label)}</span>
        <span class="text-[9px] font-mono opacity-70">${activeCount ? `(${activeCount})` : ""}</span>
        <span class="material-symbols-outlined text-sm opacity-70">expand_more</span>
      </summary>
      <div class="absolute left-0 mt-2 w-56 border-[0.5px] border-outline-variant bg-surface shadow-sm z-20">
        <div class="max-h-56 overflow-auto p-2" data-options></div>
        <div class="border-t-[0.5px] border-outline-variant p-2 flex justify-end">
          <button class="h-8 px-3 border-[0.5px] border-outline-variant hover:bg-surface-container-high transition-colors text-[10px] font-bold tracking-widest uppercase" type="button" data-clear>
            CLEAR
          </button>
        </div>
      </div>
    `;

    const optionsHost = /** @type {HTMLElement} */ (details.querySelector("[data-options]"));
    for (const v of g.values) {
      const row = document.createElement("label");
      row.className = "flex items-center gap-2 px-2 py-2 hover:bg-surface-container-high cursor-pointer";
      const checked = filterState[g.key].has(v);
      row.innerHTML = `
        <input type="checkbox" class="accent-primary" ${checked ? "checked" : ""} />
        <span class="text-xs font-mono">${escapeHtml(v)}</span>
      `;
      const cb = /** @type {HTMLInputElement} */ (row.querySelector("input"));
      cb.addEventListener("change", () => {
        const set = filterState[g.key];
        if (cb.checked) set.add(v);
        else set.delete(v);
        renderTagFilters();
        render();
      });
      optionsHost.appendChild(row);
    }

    details.querySelector("[data-clear]")?.addEventListener("click", (e) => {
      e.preventDefault();
      filterState[g.key].clear();
      renderTagFilters();
      render();
      details.removeAttribute("open");
    });

    $tagFilters.appendChild(details);
  }
}

function matchTags(demo) {
  const tg = normTagGroups(demo.tags);
  /** @param {"playback"|"type"|"related"} key */
  const hit = (key) => {
    const selected = filterState[key];
    if (selected.size === 0) return true;
    const own = new Set(tg[key]);
    for (const s of selected) if (own.has(s)) return true;
    return false;
  };
  return hit("playback") && hit("type") && hit("related");
}

function matchSearch(demo) {
  const q = (filterState.q || "").trim().toLowerCase();
  if (!q) return true;
  const hay = `${demo.id} ${demo.title} ${demo.subtitle}`.toLowerCase();
  return hay.includes(q);
}

function render() {
  const list = demos.filter((d) => matchTags(d) && matchSearch(d));
  renderGallery(list);
}

function renderControls(demo) {
  const controls = demo.controls ?? [];
  const hasControls = controls.length > 0;

  $modalControls.innerHTML = "";
  $btnResetParams.disabled = !hasControls;
  $btnResetParams.classList.toggle("opacity-40", !hasControls);
  $btnResetParams.classList.toggle("cursor-not-allowed", !hasControls);

  if (!hasControls) {
    $modalControls.innerHTML =
      '<div class="text-[11px] text-outline font-mono uppercase tracking-widest">NO CONTROLS</div>';
    return;
  }

  for (const c of controls) {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const id = `ctrl_${demo.id}_${c.key}`;
    const val = modalState.params[c.key];

    wrap.innerHTML = `
      <label for="${escapeHtml(id)}" class="text-[10px] font-mono uppercase tracking-widest text-outline flex items-center justify-between">
        <span>${escapeHtml(c.label)}</span>
        <span class="text-on-surface font-bold" data-value>${escapeHtml(val)}</span>
      </label>
      <div data-input></div>
    `;

    const inputHost = /** @type {HTMLElement} */ (wrap.querySelector("[data-input]"));
    const valueEl = /** @type {HTMLElement} */ (wrap.querySelector("[data-value]"));

    /** @type {HTMLElement} */
    let inputEl;
    if (c.type === "select") {
      const select = document.createElement("select");
      select.id = id;
      select.className =
        "h-9 px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono";
      for (const opt of c.options ?? []) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        select.appendChild(o);
      }
      select.value = String(val ?? "");
      inputEl = select;
    } else {
      const input = document.createElement("input");
      input.id = id;
      input.type = c.type === "color" ? "color" : c.type === "text" ? "text" : "range";
      input.className = c.type === "color" ? "h-9 w-full" : c.type === "text" ? "h-9 w-full px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono" : "w-full";
      if (c.type !== "color" && c.type !== "text") {
        input.min = String(c.min ?? 0);
        input.max = String(c.max ?? 1);
        input.step = String(c.step ?? 0.01);
      }
      input.value = String(val ?? "");
      inputEl = input;

      // 额外提供 number 输入，便于精确调参
      if (c.type === "range" || c.type === "number") {
        const row = document.createElement("div");
        row.className = "flex items-center gap-2";
        row.appendChild(input);
        const number = document.createElement("input");
        number.type = "number";
        number.className =
          "h-9 w-24 px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono";
        number.min = String(c.min ?? 0);
        number.max = String(c.max ?? 1);
        number.step = String(c.step ?? 0.01);
        number.value = String(val ?? "");
        row.appendChild(number);
        inputHost.appendChild(row);

        const sync = (v) => {
          input.value = String(v);
          number.value = String(v);
          valueEl.textContent = String(v);
          modalState.params[c.key] = Number(v);
          rerenderModal();
        };
        input.addEventListener("input", () => sync(input.value));
        number.addEventListener("input", () => sync(number.value));
        $modalControls.appendChild(wrap);
        continue;
      }
    }

    inputHost.appendChild(inputEl);
    inputEl.addEventListener("input", () => {
      const v = /** @type {any} */ (inputEl).value;
      valueEl.textContent = String(v);
      modalState.params[c.key] =
        c.type === "color" || c.type === "select" || c.type === "text" ? v : Number(v);
      rerenderModal();
    });

    $modalControls.appendChild(wrap);
  }
}

function rerenderModal() {
  if (!modalState.demoId) return;
  const demo = getDemoById(modalState.demoId);
  if (!demo) return;

  updateModalCode(demo);

  if (modalCleanup) modalCleanup();
  $modalStage.innerHTML = "";
  modalCleanup = demo.mount($modalStage, { reduceMotion, mode: "modal", params: modalState.params });
}

function openModal(id) {
  const demo = getDemoById(id);
  if (!demo) return;

  location.hash = `#${encodeURIComponent(id)}`;
  $modal.classList.remove("hidden");
  $modalTitle.textContent = demo.title;
  $modalSubTitle.textContent = demo.subtitle;
  modalState.demoId = demo.id;
  modalState.params = { ...(demo.defaults ?? {}) };
  updateModalCode(demo);
  renderControls(demo);

  if (modalCleanup) modalCleanup();
  $modalStage.innerHTML = "";
  modalCleanup = demo.mount($modalStage, { reduceMotion, mode: "modal", params: modalState.params });
}

function closeModal() {
  if (modalCleanup) modalCleanup();
  modalCleanup = null;
  $modalStage.innerHTML = "";
  $modal.classList.add("hidden");
  modalState.demoId = null;
  modalState.params = {};
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

function bindModalEvents() {
  $modal.addEventListener("click", (e) => {
    const closeEl = e.target instanceof Element ? e.target.closest("[data-modal-close]") : null;
    if (closeEl) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$modal.classList.contains("hidden")) closeModal();
  });

  $btnResetParams?.addEventListener("click", () => {
    if (!modalState.demoId) return;
    const demo = getDemoById(modalState.demoId);
    if (!demo) return;
    modalState.params = { ...(demo.defaults ?? {}) };
    renderControls(demo);
    rerenderModal();
  });
}

function bindTopbar() {
  document.getElementById("btnReset")?.addEventListener("click", () => {
    filterState.playback.clear();
    filterState.type.clear();
    filterState.related.clear();
    filterState.q = "";
    if ($searchInput) $searchInput.value = "";
    renderTagFilters();
    render();
  });

  let t = 0;
  $searchInput?.addEventListener("input", () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      filterState.q = $searchInput.value || "";
      render();
    }, 60);
  });
}

function handleHashRoute() {
  const id = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
  if (!id) return;
  // hash 变化触发 open
  if (getDemoById(id)) openModal(id);
}

function init() {
  if (!window.gsap) {
    $grid.innerHTML =
      '<div class="p-6 text-sm text-error">GSAP 未加载成功：请确认网络可访问 cdnjs。</div>';
    return;
  }
  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  setRepoVersion();
  bindModalEvents();
  bindTopbar();
  renderTagFilters();
  render();
  handleHashRoute();
  window.addEventListener("hashchange", handleHashRoute);

  // 关闭 tag 下拉（点击空白处）
  document.addEventListener(
    "click",
    (e) => {
      if (!($tagFilters instanceof HTMLElement)) return;
      if (!(e.target instanceof Node)) return;
      const openDetails = $tagFilters.querySelectorAll("details[open]");
      openDetails.forEach((d) => {
        if (!d.contains(e.target)) d.removeAttribute("open");
      });
    },
    { capture: true }
  );
}

init();
