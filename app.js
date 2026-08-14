const colors = {
  hotel: "#203040",
  1: "#e15b36",
  2: "#0f9a8a",
  3: "#e0a21a",
  4: "#5577d9",
  5: "#8d4a9e",
};

const stops = {
  hotel: {
    name: "Town House Sannomiya East",
    type: "hotel",
    day: "hotel",
    label: "H",
    lat: 34.6961,
    lng: 135.1998,
    desc: "四晚住宿據點，位於三宮東側雲井通。",
  },
  airport: {
    name: "神戶機場",
    type: "airport",
    day: "1",
    label: "1",
    lat: 34.6328,
    lng: 135.2239,
    desc: "9/10 抵達與 9/14 返程機場。",
  },
  harborland: {
    name: "Harborland / umie / MOSAIC",
    type: "spot",
    day: "1",
    label: "1",
    lat: 34.6797,
    lng: 135.1856,
    desc: "抵達日傍晚散步、晚餐、摩天輪與夜景。",
  },
  animalKingdom: {
    name: "神戶動物王國",
    type: "spot",
    day: "2",
    label: "2",
    lat: 34.6547,
    lng: 135.2237,
    desc: "Day 2 上午主景點，搭 Port Liner 到計算科學中心站。",
  },
  nankinmachi: {
    name: "南京町",
    type: "food",
    day: "2",
    label: "2",
    lat: 34.6882,
    lng: 135.1888,
    desc: "Day 2 傍晚邊走邊吃，可順逛元町與舊居留地。",
  },
  motomachi: {
    name: "三宮 / 元町周邊",
    type: "shop",
    day: "2",
    label: "2",
    lat: 34.6913,
    lng: 135.1907,
    desc: "午睡後若想短逛，元町商店街、大丸神戶店都在附近。",
  },
  anpanman: {
    name: "神戶麵包超人兒童博物館",
    type: "spot",
    day: "3",
    label: "3",
    lat: 34.6793,
    lng: 135.1848,
    desc: "Day 3 早場短版，2F 博物館區不可使用嬰兒車。",
  },
  sumaSeaWorld: {
    name: "神戶須磨海洋世界",
    type: "spot",
    day: "3",
    label: "3",
    lat: 34.6452,
    lng: 135.1288,
    desc: "Day 3 下午主景點，JR 須磨海浜公園站步行約 5 分鐘。",
  },
  nijigen: {
    name: "Crayon Shin-chan Adventure Park",
    type: "spot",
    day: "4",
    label: "4",
    lat: 34.5741,
    lng: 135.0103,
    desc: "Day 4 從三宮搭直達巴士，鎖定親子 Pass 幼兒設施與大草坪。",
  },
  airportReturn: {
    name: "神戶機場返台",
    type: "airport",
    day: "5",
    label: "5",
    lat: 34.6328,
    lng: 135.2239,
    desc: "9/14 13:30 起飛，建議 11:00 前抵達機場。",
  },
};

const days = {
  all: Object.keys(stops),
  1: ["airport", "hotel", "harborland"],
  2: ["hotel", "animalKingdom", "nankinmachi", "motomachi"],
  3: ["hotel", "anpanman", "sumaSeaWorld"],
  4: ["hotel", "nijigen"],
  5: ["hotel", "airportReturn"],
};

const routeColors = {
  1: colors[1],
  2: colors[2],
  3: colors[3],
  4: colors[4],
  5: colors[5],
};

const typeNames = {
  hotel: "住宿",
  airport: "機場",
  spot: "景點",
  food: "美食",
  shop: "逛街",
};

const mapTip = document.getElementById("mapTip");
const mapMode = document.getElementById("mapMode");
const tripMap = document.getElementById("tripMap");

const map = L.map(tripMap, {
  zoomControl: false,
  scrollWheelZoom: true,
}).setView([34.68, 135.18], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const markerLayers = {};
const routeLayers = {};
const defaultBounds = L.latLngBounds(Object.values(stops).map((stop) => [stop.lat, stop.lng])).pad(0.18);
let activeDay = "all";

function makeMarker(stop) {
  const markerColor = stop.day === "hotel" ? colors.hotel : colors[stop.day];
  const icon = L.divIcon({
    className: "",
    html: `<div class="map-marker" style="background:${markerColor}">${stop.label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
  });

  const marker = L.marker([stop.lat, stop.lng], { icon });
  marker.bindPopup(`<strong>${stop.name}</strong><br>${typeNames[stop.type]}｜${stop.desc}`);
  marker.on("click", () => {
    mapTip.innerHTML = `<strong>${stop.name}</strong><span>${typeNames[stop.type]}｜${stop.desc}</span>`;
  });
  return marker;
}

Object.entries(stops).forEach(([key, stop]) => {
  markerLayers[key] = makeMarker(stop);
});

Object.entries(routeColors).forEach(([day, color]) => {
  routeLayers[day] = L.polyline(
    days[day].map((key) => [stops[key].lat, stops[key].lng]),
    {
      color,
      weight: 5,
      opacity: 0.82,
      lineCap: "round",
      lineJoin: "round",
    }
  );
});

function setActiveDay(day, shouldScroll = false) {
  activeDay = day;
  Object.values(markerLayers).forEach((layer) => map.removeLayer(layer));
  Object.values(routeLayers).forEach((layer) => map.removeLayer(layer));

  const activeStops = day === "all" ? days.all : days[day];
  activeStops.forEach((key) => markerLayers[key].addTo(map));

  if (day === "all") {
    Object.values(routeLayers).forEach((layer) => layer.addTo(map));
  } else {
    routeLayers[day]?.addTo(map);
  }

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.day === day);
  });

  mapMode.textContent = day === "all" ? "總覽" : `Day ${day}`;
  const firstStop = stops[activeStops[0]];
  mapTip.innerHTML = `<strong>${firstStop.name}</strong><span>${day === "all" ? "目前顯示全部景點與路線。" : "目前只顯示當天景點與住宿。"}</span>`;

  const bounds = L.latLngBounds(activeStops.map((key) => [stops[key].lat, stops[key].lng])).pad(0.22);
  map.fitBounds(bounds, {
    padding: window.innerWidth < 680 ? [18, 18] : [28, 28],
    maxZoom: day === "all" ? 10 : 13,
  });

  setTimeout(() => map.invalidateSize(), 60);

  if (shouldScroll && day !== "all") {
    document.getElementById(`day-${day}`)?.scrollIntoView({ behavior: "smooth" });
  }
}

document.querySelectorAll("[data-map-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.mapAction;
    if (action === "zoom-in") map.zoomIn();
    if (action === "zoom-out") map.zoomOut();
    if (action === "reset") {
      const activeStops = activeDay === "all" ? days.all : days[activeDay];
      map.fitBounds(L.latLngBounds(activeStops.map((key) => [stops[key].lat, stops[key].lng])).pad(0.22), {
        padding: [28, 28],
      });
    }
  });
});

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => setActiveDay(button.dataset.day));
});

document.querySelectorAll("[data-jump-day]").forEach((card) => {
  card.setAttribute("tabindex", "0");
  card.addEventListener("click", () => setActiveDay(card.dataset.jumpDay, true));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveDay(card.dataset.jumpDay, true);
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      const day = visible.target.dataset.sectionDay;
      if (day && day !== activeDay) setActiveDay(day);
    }
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.25, 0.55],
  }
);

document.querySelectorAll("[data-section-day]").forEach((section) => observer.observe(section));

document.querySelectorAll("[data-dialog-open]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.dialogOpen)?.showModal();
  });
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

map.fitBounds(defaultBounds, { padding: [28, 28] });
setActiveDay("all");
setTimeout(() => map.invalidateSize(), 80);
