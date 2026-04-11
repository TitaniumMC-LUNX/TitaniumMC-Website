const SERVER_IP = "titaniummc.redstone.tr";
const DATA_URLS = [
  "https://raw.githubusercontent.com/TitaniumMC-LUNX/TitaniumMC-Website/refs/heads/main/data.js",
  "https://raw.githubusercontent.com/TitaniumMC-LUNX/TitaniumMC-Website/main/data.js"
];

const ISTANBUL = { lat: 41.0082, lon: 28.9784 };

const FALLBACK_GAMES = [
  {
    icon: "⏳",
    name: "Liste yüklenemedi",
    desc: "Şimdilik liste gösterilemiyor. Biraz sonra sayfayı yenilemeyi dene.",
    status: "active"
  }
];
const FALLBACK_UPDATES = [];

function wmoToWeather(code) {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 2 || code === 3) return "cloud";
  return "clear";
}

function clearSnowflakes() {
  const h = document.getElementById("snowHost");
  if (h) h.innerHTML = "";
}

function spawnSnowflakes(count) {
  const h = document.getElementById("snowHost");
  if (!h) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  h.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "snowflake";
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = 9 + Math.random() * 14 + "s";
    s.style.animationDelay = Math.random() * 8 + "s";
    const sz = 2 + Math.random() * 5;
    s.style.width = sz + "px";
    s.style.height = sz + "px";
    frag.appendChild(s);
  }
  h.appendChild(frag);
}

function applyWeather(mode, tempC) {
  document.body.dataset.weather = mode;

  const meta = document.getElementById("metaTheme");
  const hex = {
    clear: "#1a2233",
    cloud: "#161c28",
    rain: "#101820",
    snow: "#141c24",
    fog: "#1a1c22",
    storm: "#0c0e14"
  };
  if (meta) meta.setAttribute("content", hex[mode] || hex.clear);

  const ico = document.getElementById("weatherIco");
  const txt = document.getElementById("weatherTxt");
  const icons = { clear: "☀", cloud: "☁", rain: "🌧", snow: "❄", fog: "🌫", storm: "⛈" };
  const labels = {
    clear: "Açık",
    cloud: "Bulutlu",
    rain: "Yağmurlu",
    snow: "Karlı",
    fog: "Sisli",
    storm: "Fırtına"
  };
  if (ico) ico.textContent = icons[mode] || "☀";
  if (txt) txt.textContent = `${Math.round(tempC)}° · ${labels[mode] || labels.clear}`;

  clearSnowflakes();
  if (mode === "snow") spawnSnowflakes(48);
}

function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  return fetch(url)
    .then(r => r.json())
    .then(d => {
      const cw = d.current_weather;
      if (!cw || cw.weathercode === undefined) throw new Error("weather");
      return { temp: cw.temperature, code: cw.weathercode };
    });
}

function initSky() {
  const finish = (lat, lon) => {
    fetchWeather(lat, lon)
      .then(({ temp, code }) => applyWeather(wmoToWeather(code), temp))
      .catch(() => applyWeather("clear", 20));
  };

  if (!navigator.geolocation) {
    finish(ISTANBUL.lat, ISTANBUL.lon);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    p => finish(p.coords.latitude, p.coords.longitude),
    () => finish(ISTANBUL.lat, ISTANBUL.lon),
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 }
  );
}

(function () {
  let isDragging = false;
  let startY = 0;
  let scrollY = 0;

  document.addEventListener("mousedown", e => {
    if (!document.body.classList.contains("site-revealed")) return;
    if (e.button !== 0) return;
    if (e.target.closest("button, a, input, select, textarea, video")) return;
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

(function () {
  const btns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panels-stack .panel");
  const navLinks = document.querySelectorAll(".nav-tab");
  const navLogo = document.querySelector(".nav-logo");
  const slider = document.getElementById("tabSlider");

  function moveSlider(btn) {
    if (!slider || !btn || !btn.parentElement) return;
    const track = btn.parentElement;
    const tr = track.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    slider.style.width = br.width + "px";
    slider.style.transform = `translateX(${br.left - tr.left}px)`;
  }

  function switchTab(name) {
    btns.forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    navLinks.forEach(a => a.classList.toggle("active", a.dataset.tab === name));

    panels.forEach(p => p.classList.toggle("active", p.id === "tab-" + name));

    const active = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (active) moveSlider(active);
  }

  btns.forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  navLinks.forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      switchTab(a.dataset.tab);
      document.getElementById("main").scrollIntoView({ behavior: "smooth" });
    })
  );

  if (navLogo) {
    navLogo.addEventListener("click", e => {
      e.preventDefault();
      switchTab("status");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const first = document.querySelector(".tab-btn.active");
  if (first) {
    requestAnimationFrame(() => moveSlider(first));
    window.addEventListener("resize", () => {
      const a = document.querySelector(".tab-btn.active");
      if (a) moveSlider(a);
    });
  }
})();

function injectRemoteData(js) {
  const old = document.getElementById("remoteData");
  if (old) old.remove();
  const s = document.createElement("script");
  s.id = "remoteData";
  s.textContent = js;
  document.body.appendChild(s);
}

function loadRemoteData() {
  const tryUrl = index => {
    if (index >= DATA_URLS.length) {
      window.GAMES_DATA = FALLBACK_GAMES;
      window.UPDATES_DATA = FALLBACK_UPDATES;
      return Promise.resolve();
    }
    const url = DATA_URLS[index] + "?t=" + Date.now();
    return fetch(url, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then(js => {
        injectRemoteData(js);
      })
      .catch(() => tryUrl(index + 1));
  };
  return tryUrl(0);
}

function setStatusState(state, text, playerLine) {
  const core = document.getElementById("sorbCore");
  const txt = document.getElementById("statusText");
  const cnt = document.getElementById("playerCount");
  if (!core || !txt) return;
  core.className = "sorb-core";
  txt.className = "status-main-text";
  if (state === "online") {
    core.classList.add("online");
    txt.classList.add("is-online");
  } else if (state === "offline") {
    core.classList.add("offline");
    txt.classList.add("is-offline");
  } else {
    txt.classList.add("is-unknown");
  }
  txt.textContent = text;
  if (cnt) cnt.textContent = playerLine || "";
}

function checkServerStatus() {
  const core = document.getElementById("sorbCore");
  const txt = document.getElementById("statusText");
  if (!core || !txt) return;

  fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`)
    .then(r => r.json())
    .then(d => {
      if (d && d.online) {
        const line = d.players ? `${d.players.online} / ${d.players.max} oyuncu` : "";
        setStatusState("online", "Çevrimiçi", line);
      } else {
        setStatusState("offline", "Çevrimdışı", "");
      }
    })
    .catch(() => {
      setStatusState("unknown", "Durum alınamadı", "");
    });
}

function copyIP() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(SERVER_IP).then(() => showToast("IP kopyalandı"));
  } else {
    const el = document.createElement("textarea");
    el.value = SERVER_IP;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("IP kopyalandı");
  }
}

function scrollToContent() {
  document.getElementById("main").scrollIntoView({ behavior: "smooth" });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

const TAG_MAP = {
  new: { cls: "ut-new", label: "Yeni" },
  fix: { cls: "ut-fix", label: "Düzeltme" },
  improve: { cls: "ut-improve", label: "İyileştirme" }
};

function loadGames() {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;
  const data = typeof GAMES_DATA !== "undefined" ? GAMES_DATA : FALLBACK_GAMES;
  grid.innerHTML = data
    .map(
      (g, i) => `
    <div class="gcard" style="--gi:${i}">
      <div class="gcard-bg"></div>
      <div class="gcard-shine"></div>
      <div class="gcard-icon">${g.icon}</div>
      <div class="gcard-name">${g.name}</div>
      <div class="gcard-desc">${g.desc}</div>
      <span class="gtag ${g.status === "active" ? "gtag-on" : "gtag-soon"}">
        ${g.status === "active" ? "Aktif" : "Yakında"}
      </span>
    </div>
  `
    )
    .join("");
}

function loadUpdates() {
  const wrap = document.getElementById("updatesWrap");
  if (!wrap) return;
  const data = typeof UPDATES_DATA !== "undefined" ? UPDATES_DATA : FALLBACK_UPDATES;
  if (!data.length) {
    wrap.innerHTML = '<p class="updates-empty">Henüz duyuru yok. Yeni haberler burada listelenecek.</p>';
    return;
  }
  wrap.innerHTML = data
    .map((u, i) => {
      const tags = (u.tags || [])
        .map(t => {
          const m = TAG_MAP[t] || { cls: "ut-improve", label: t };
          return `<span class="ut ${m.cls}">${m.label}</span>`;
        })
        .join("");
      return `
      <div class="uitem" style="--ui:${i}">
        <div class="uitem-line"></div>
        <div class="uitem-body">
          <span class="uver">${u.version}</span>
          <div class="udate">${u.date}</div>
          <h3 class="utitle">${u.title}</h3>
          <p class="udesc">${u.desc}</p>
          <div class="utags">${tags}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

function initTitaniumContent() {
  loadGames();
  loadUpdates();
  window.dispatchEvent(new Event("resize"));
}

function waitIntroEnd(dataPromise) {
  const layer = document.getElementById("introLayer");
  const video = document.getElementById("introVideo");
  const siteRoot = document.getElementById("siteRoot");

  if (!layer || !video || !siteRoot) {
    document.body.classList.add("site-revealed");
    document.body.classList.remove("intro-active");
    siteRoot?.setAttribute("aria-hidden", "false");
    dataPromise.then(() => initTitaniumContent());
    return Promise.resolve();
  }

  return new Promise(resolve => {
    let finished = false;

    const reveal = () => {
      if (finished) return;
      finished = true;
      layer.classList.add("intro-out");
      document.body.classList.add("site-revealed");
      document.body.classList.remove("intro-active");
      siteRoot.setAttribute("aria-hidden", "false");
      dataPromise.then(() => initTitaniumContent());
      setTimeout(() => {
        layer.setAttribute("hidden", "");
        resolve();
      }, 900);
    };

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");

    video.addEventListener("ended", reveal);
    document.getElementById("introSkip")?.addEventListener("click", () => {
      video.pause();
      reveal();
    });

    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSky();
  checkServerStatus();
  setInterval(checkServerStatus, 60000);
  const dataPromise = loadRemoteData();
  waitIntroEnd(dataPromise);
});
