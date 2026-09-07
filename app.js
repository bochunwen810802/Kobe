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

const tripWeatherDates = [
  { date: "2026-09-10", label: "9/10 週四", day: 1, weatherLocation: "kobeChuo" },
  { date: "2026-09-11", label: "9/11 週五", day: 2, weatherLocation: "kobeChuo" },
  { date: "2026-09-12", label: "9/12 週六", day: 3, weatherLocation: "kobeSuma", routeLabel: "上午中央區／下午須磨區" },
  { date: "2026-09-13", label: "9/13 週日", day: 4, weatherLocation: "awaji" },
  { date: "2026-09-14", label: "9/14 週一", day: 5, weatherLocation: "kobeChuo" },
];

const weatherLocations = {
  kobeChuo: { label: "兵庫県神戸市中央区", latitude: "34.6901", longitude: "135.1956" },
  kobeSuma: { label: "兵庫県神戸市須磨区", latitude: "34.6452", longitude: "135.1288" },
  awaji: { label: "兵庫県淡路市", latitude: "34.5741", longitude: "135.0103" },
};

function weatherApiUrl(location) {
  const url = new URL("https://api.open-meteo.com/v1/jma");
  url.search = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: "Asia/Tokyo",
    forecast_days: "11",
    current: "temperature_2m,apparent_temperature,precipitation,weather_code",
    hourly: "temperature_2m,precipitation,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours",
  }).toString();
  return url;
}

const weatherRequestOptions = {
  cache: "no-store",
};
/*
 * Daily routes stay in central Kobe except Day 3 (Suma Sea World) and Day 4
 * (Awaji Island), so each card reads the closest useful forecast grid.
 */
const weatherLocationEntries = Object.entries(weatherLocations);
const weatherLocationLabels = Object.fromEntries(weatherLocationEntries.map(([key, value]) => [key, value.label]));
const weatherLocationRequests = weatherLocationEntries.map(([key, location]) => ({ key, url: weatherApiUrl(location) }));

const weatherDaily = document.getElementById("weatherDaily");
const weatherHourly = document.getElementById("weatherHourly");
const weatherHourlyDate = document.getElementById("weatherHourlyDate");
const weatherHourlyTitle = document.getElementById("weatherHourlyTitle");
const weatherHourlyList = document.getElementById("weatherHourlyList");
const weatherStatus = document.getElementById("weatherStatus");
const weatherUpdated = document.getElementById("weatherUpdated");
const weatherRefresh = document.getElementById("weatherRefresh");
const weatherCacheKey = "kobe-trip-weather-v1";
const weatherRefreshInterval = 30 * 60 * 1000;
let weatherLastFetched = 0;
let activeWeatherDate = "";
let latestWeatherData = null;

function weatherDescription(code) {
  if (code === 0) return { short: "晴", label: "晴朗", accent: "#d28b0a" };
  if ([1, 2].includes(code)) return { short: "晴雲", label: "晴時多雲", accent: "#4a8895" };
  if (code === 3) return { short: "雲", label: "陰天", accent: "#647484" };
  if ([45, 48].includes(code)) return { short: "霧", label: "有霧", accent: "#697d7b" };
  if ([51, 53, 55].includes(code)) return { short: "毛雨", label: "短暫毛毛雨", accent: "#397b91" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { short: "雨", label: "有雨", accent: "#4169a1" };
  return { short: "變", label: "天氣多變", accent: "#6a7180" };
}

function clothingAdvice(maxTemp, minTemp, rainSum) {
  const advice = [];
  if (maxTemp >= 30) advice.push("短袖、透氣衣物，備帽子與飲水");
  else if (maxTemp >= 25) advice.push("短袖為主");
  else if (maxTemp >= 20) advice.push("薄長袖或短袖加薄外套");
  else advice.push("長袖與保暖外套");

  if (minTemp <= 22 && maxTemp - minTemp >= 5) advice.push("早晚加薄外套");
  if (rainSum >= 10) advice.push("雨衣、推車雨罩與替換鞋襪");
  else if (rainSum >= 0.3) advice.push("帶折傘與推車雨罩");
  return advice.join("；");
}

function daysFromTodayInJapan(dateString) {
  const japanToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(`${dateString}T00:00:00Z`) - Date.parse(`${japanToday}T00:00:00Z`)) / dayMs);
}

function dailyForecastFor(weatherByLocation, tripDate) {
  const data = weatherByLocation[tripDate.weatherLocation];
  if (!data) return null;
  const index = data.daily?.time?.indexOf(tripDate.date) ?? -1;
  if (index < 0) return null;
  return {
    ...tripDate,
    weatherLabel: weatherLocationLabels[tripDate.weatherLocation],
    code: data.daily.weather_code[index],
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    rain: data.daily.precipitation_sum[index],
    rainHours: data.daily.precipitation_hours[index],
    hasHighResolutionHourly: daysFromTodayInJapan(tripDate.date) >= 0 && daysFromTodayInJapan(tripDate.date) < 4,
  };
}

function hourlyForecastFor(data, dateString) {
  if (!data.hourly?.time) return [];
  return data.hourly.time.reduce((hours, time, index) => {
    const hour = Number(time.slice(11, 13));
    if (time.startsWith(dateString) && hour >= 8 && hour <= 20 && hour % 2 === 0) {
      hours.push({
        time: time.slice(11, 16),
        temperature: data.hourly.temperature_2m[index],
        precipitation: data.hourly.precipitation[index],
        code: data.hourly.weather_code[index],
      });
    }
    return hours;
  }, []);
}

function renderHourly(dateString) {
  const day = tripWeatherDates.find((item) => item.date === dateString);
  const forecast = day ? dailyForecastFor(latestWeatherData, day) : null;
  const hours = day ? hourlyForecastFor(latestWeatherData[day.weatherLocation], dateString) : [];
  if (!day || !forecast?.hasHighResolutionHourly || hours.length === 0) {
    weatherHourly.hidden = true;
    return;
  }

  activeWeatherDate = dateString;
  weatherHourlyDate.textContent = `${day.label}｜${forecast.weatherLabel}｜高解析逐時預報`;
  weatherHourlyTitle.textContent = "白天氣溫與降雨";
  weatherHourlyList.innerHTML = hours.map((hour) => {
    const condition = weatherDescription(hour.code);
    return `<article class="weather-hour">
      <time datetime="${dateString}T${hour.time}">${hour.time}</time>
      <strong>${Math.round(hour.temperature)}°</strong>
      <span>${condition.label}</span>
      <small>雨 ${Number(hour.precipitation).toFixed(1)} mm</small>
    </article>`;
  }).join("");
  weatherHourly.hidden = false;

  document.querySelectorAll(".weather-day[data-weather-date]").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.weatherDate === dateString);
    card.setAttribute("aria-pressed", String(card.dataset.weatherDate === dateString));
  });
}

function renderWeather(data, fetchedAt, isCached = false) {
  latestWeatherData = data;
  const forecasts = tripWeatherDates.map((date) => dailyForecastFor(data, date));
  const available = forecasts.filter(Boolean);

  if (available.length === 0) {
    throw new Error("旅行日期目前不在可預報範圍內");
  }

  weatherDaily.innerHTML = forecasts.map((forecast, index) => {
    if (!forecast) {
      const tripDate = tripWeatherDates[index];
      return `<article class="weather-day" style="--weather-accent: var(--day${tripDate.day})">
        <div class="weather-day__top"><span class="weather-day__date">${tripDate.label}</span><span class="weather-day__mode weather-day__mode--daily">等待預報</span></div>
        <div class="weather-day__condition"><span class="weather-symbol">待</span><strong>尚未進入預報範圍</strong></div>
        <p class="weather-day__advice">預報區域：${weatherLocationLabels[tripDate.weatherLocation]}。接近日期時會自動更新，不需重新發布網頁。</p>
      </article>`;
    }

    const condition = weatherDescription(forecast.code);
    const modeLabel = forecast.hasHighResolutionHourly ? "可看逐時" : "每日預報";
    const modeClass = forecast.hasHighResolutionHourly ? "" : " weather-day__mode--daily";
    const tag = forecast.hasHighResolutionHourly ? "button" : "article";
    const interaction = forecast.hasHighResolutionHourly
      ? ` type="button" data-weather-date="${forecast.date}" aria-pressed="false" aria-label="查看 ${forecast.label} 逐時預報"`
      : "";
    return `<${tag} class="weather-day"${interaction} style="--weather-accent: ${condition.accent}">
      <div class="weather-day__top"><span class="weather-day__date">Day ${forecast.day}｜${forecast.label}</span><span class="weather-day__mode${modeClass}">${modeLabel}</span></div>
      <span class="weather-day__location">${forecast.routeLabel ? `${forecast.routeLabel}｜` : ""}預報：${forecast.weatherLabel}</span>
      <div class="weather-day__condition"><span class="weather-symbol">${condition.short}</span><strong>${condition.label}</strong></div>
      <div class="weather-day__temp"><strong>${Math.round(forecast.max)}°</strong><span>最低 ${Math.round(forecast.min)}°</span></div>
      <div class="weather-day__rain"><span>預估降雨 ${Number(forecast.rain).toFixed(1)} mm</span><span>${Math.round(forecast.rainHours)} 小時</span></div>
      <p class="weather-day__advice"><strong>穿著：</strong>${clothingAdvice(forecast.max, forecast.min, forecast.rain)}</p>
    </${tag}>`;
  }).join("");

  document.querySelectorAll(".weather-day[data-weather-date]").forEach((card) => {
    card.addEventListener("click", () => renderHourly(card.dataset.weatherDate));
  });

  const preferredDate = available.find((forecast) => forecast.date === activeWeatherDate && forecast.hasHighResolutionHourly)
    || available.find((forecast) => forecast.hasHighResolutionHourly);
  if (preferredDate) renderHourly(preferredDate.date);
  else weatherHourly.hidden = true;

  const updated = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(fetchedAt));
  weatherUpdated.textContent = `${isCached ? "上次成功資料" : "最新更新"}：${updated}（日本時間）`;
  weatherStatus.hidden = true;
}

async function loadWeather(force = false) {
  if (!force && Date.now() - weatherLastFetched < weatherRefreshInterval) return;
  weatherRefresh.classList.add("is-loading");
  weatherRefresh.disabled = true;

  if (!latestWeatherData) {
    weatherStatus.hidden = false;
    weatherStatus.classList.remove("is-error");
    weatherStatus.innerHTML = '<span class="weather-status__pulse" aria-hidden="true"></span>正在連線日本氣象廳預報資料…';
  }

  try {
    const responses = await Promise.all(weatherLocationRequests.map(async ({ key, url }) => {
      const response = await fetch(url, weatherRequestOptions);
      if (!response.ok) throw new Error(`Weather API ${response.status}`);
      return [key, await response.json()];
    }));
    const data = Object.fromEntries(responses);
    const fetchedAt = Date.now();
    weatherLastFetched = fetchedAt;
    try {
      localStorage.setItem(weatherCacheKey, JSON.stringify({ fetchedAt, data }));
    } catch (cacheError) {
      console.warn("Unable to cache Kobe weather", cacheError);
    }
    renderWeather(data, fetchedAt);
  } catch (error) {
    let parsedCache = null;
    try {
      const cached = localStorage.getItem(weatherCacheKey);
      parsedCache = cached ? JSON.parse(cached) : null;
    } catch (cacheError) {
      console.warn("Unable to read cached Kobe weather", cacheError);
    }
    if (parsedCache) {
      const parsed = parsedCache;
      renderWeather(parsed.data, parsed.fetchedAt, true);
      weatherStatus.hidden = false;
      weatherStatus.classList.add("is-error");
      weatherStatus.textContent = "目前無法連線更新，先顯示上次成功取得的預報。";
    } else {
      weatherStatus.hidden = false;
      weatherStatus.classList.add("is-error");
      weatherStatus.textContent = "目前無法取得天氣資料，請稍後按「重新整理」再試一次。";
      weatherUpdated.textContent = "尚未取得預報";
    }
    console.error("Unable to load Kobe weather", error);
  } finally {
    weatherRefresh.classList.remove("is-loading");
    weatherRefresh.disabled = false;
  }
}

weatherRefresh.addEventListener("click", () => loadWeather(true));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loadWeather();
});
setInterval(() => loadWeather(true), weatherRefreshInterval);
loadWeather(true);
