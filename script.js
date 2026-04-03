const SERVER_IP = "titaniummc.redstone.tr";

/* ===== DRAG TO SCROLL (PC mouse + mobil dokunmatik) ===== */
(function () {
  let isDragging = false;
  let startY = 0;
  let scrollY = 0;

  function getClientY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  document.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a, input, select, textarea")) return;
    isDragging = true;
    startY = e.clientY;
    scrollY = window.scrollY;
    document.body.classList.add("dragging");
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const dy = e.clientY - startY;
    window.scrollTo({ top: scrollY - dy, behavior: "instant" });
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.classList.remove("dragging");
  });

  document.addEventListener("mouseleave", () => {
    isDragging = false;
    document.body.classList.remove("dragging");
  });
})();

/* ===== TAB SYSTEM ===== */
(function () {
  const btns   = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");
  const navLinks = document.querySelectorAll(".nav-tab");
  const ink    = document.getElementById("tabInk");

  function moveInk(btn) {
    const bar = btn.parentElement;
    const br  = bar.getBoundingClientRect();
    const btnR = btn.getBoundingClientRect();
    ink.style.left  = (btnR.left - br.left) + "px";
    ink.style.width = btnR.width + "px";
  }

  function switchTab(name) {
    btns.forEach(b   => b.classList.toggle("active", b.dataset.tab === name));
    navLinks.forEach(a => a.classList.toggle("active", a.dataset.tab === name));
    panels.forEach(p  => p.classList.toggle("active",  p.id === "tab-" + name));
    const active = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (active) moveInk(active);
  }

  btns.forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  navLinks.forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    switchTab(a.dataset.tab);
    document.getElementById("main").scrollIntoView({ behavior: "smooth" });
  }));

  const first = document.querySelector(".tab-btn.active");
  if (first) requestAnimationFrame(() => moveInk(first));
  window.addEventListener("resize", () => {
    const a = document.querySelector(".tab-btn.active");
    if (a) moveInk(a);
  });
})();

/* ===== SERVER STATUS ===== */
function checkServerStatus() {
  const core = document.getElementById("sorbCore");
  const txt  = document.getElementById("statusText");
  const cnt  = document.getElementById("playerCount");

  fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`)
    .then(r => r.json())
    .then(d => {
      if (d && d.online) {
        core.className = "sorb-core online";
        txt.textContent = "Sunucu Çevrimiçi";
        txt.style.color = "#4ade80";
        cnt.textContent = d.players ? `${d.players.online} / ${d.players.max} oyuncu` : "";
      } else {
        core.className = "sorb-core offline";
        txt.textContent = "Sunucu Çevrimdışı";
        txt.style.color = "#f87171";
        cnt.textContent = "";
      }
    })
    .catch(() => {
      core.className = "sorb-core";
      txt.textContent = "Durum Alınamadı";
      txt.style.color = "#6b7aad";
      cnt.textContent = "";
    });
}

/* ===== COPY IP ===== */
function copyIP() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(SERVER_IP).then(() => showToast("IP Kopyalandı!"));
  } else {
    const el = document.createElement("textarea");
    el.value = SERVER_IP;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("IP Kopyalandı!");
  }
}

/* ===== SCROLL HINT ===== */
function scrollToContent() {
  document.getElementById("main").scrollIntoView({ behavior: "smooth" });
}

/* ===== TOAST ===== */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

/* ===== TAG LABEL MAP ===== */
const TAG_MAP = {
  new:     { cls: "ut-new",     label: "Yeni İçerik" },
  fix:     { cls: "ut-fix",     label: "Bug Fix" },
  improve: { cls: "ut-improve", label: "İyileştirme" }
};

/* ===== RENDER GAMES (data.js → GAMES_DATA) ===== */
function loadGames() {
  const grid = document.getElementById("gamesGrid");
  grid.innerHTML = GAMES_DATA.map((g, i) => `
    <div class="gcard" style="--gi:${i}">
      <div class="gcard-bg"></div>
      <div class="gcard-glow"></div>
      <div class="gcard-icon">${g.icon}</div>
      <div class="gcard-name">${g.name}</div>
      <div class="gcard-desc">${g.desc}</div>
      <span class="gtag ${g.status === "active" ? "gtag-on" : "gtag-soon"}">
        ${g.status === "active" ? "Aktif" : "Yakında"}
      </span>
    </div>
  `).join("");
}

/* ===== RENDER UPDATES (data.js → UPDATES_DATA) ===== */
function loadUpdates() {
  const wrap = document.getElementById("updatesWrap");
  wrap.innerHTML = UPDATES_DATA.map((u, i) => {
    const tags = (u.tags || []).map(t => {
      const m = TAG_MAP[t] || { cls: "ut-improve", label: t };
      return `<span class="ut ${m.cls}">${m.label}</span>`;
    }).join("");
    return `
      <div class="uitem" style="--ui:${i}">
        <div class="uitem-dot"></div>
        <div class="uitem-body">
          <span class="uver">${u.version}</span>
          <div class="udate">${u.date}</div>
          <h3 class="utitle">${u.title}</h3>
          <p class="udesc">${u.desc}</p>
          <div class="utags">${tags}</div>
        </div>
      </div>
    `;
  }).join("");
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  loadGames();
  loadUpdates();
  checkServerStatus();
  setInterval(checkServerStatus, 60000);
});
