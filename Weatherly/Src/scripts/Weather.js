"use strict";

const API_KEY = "6d94a105615083405e9b03d1d6ae8a3e";
let unit = "metric";

function handleEnter(e) {
  if (e.key === "Enter") getWeather();
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
}

function toggleUnit() {
  unit = unit === "metric" ? "imperial" : "metric";
  getWeather();
}

function showLoading(msg) {
  document.getElementById("loading").textContent = msg;
}

function hideLoading() {
  document.getElementById("loading").textContent = "";
}

function showError(msg) {
  document.getElementById("error").textContent = msg;
}

function clearUI() {
  document.getElementById("error").textContent = "";
  document.getElementById("currentWeather").innerHTML = "";
  document.getElementById("forecast").innerHTML = "";
}

function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    showError("Enter a city name");
    return;
  }
  fetchWeather(`q=${city}`);
}

function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    },
    () => showError("Location access denied")
  );
}

function fetchWeather(query) {
  clearUI();
  showLoading("Loading...");

  fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}&units=${unit}`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      renderCurrentWeather(data);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&units=${unit}`);
    })
    .then(res => res.json())
    .then(data => renderForecast(data.list))
    .catch(err => showError(err.message))
    .finally(hideLoading);
}

function renderCurrentWeather(data) {
  const tempUnit = unit === "metric" ? "°C" : "°F";
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  document.getElementById("currentWeather").innerHTML = `
    <h3 class="text-xl font-bold">${data.name}, ${data.sys.country}</h3>
    <img src="${icon}" class="mx-auto">
    <p class="text-4xl font-bold">${data.main.temp}${tempUnit}</p>
    <p class="capitalize text-gray-500">${data.weather[0].description}</p>
  `;
}

/* ✅ Convert 3-hour data → 5 daily cards */
function renderForecast(list) {
  const forecastDiv = document.getElementById("forecast");
  const tempUnit = unit === "metric" ? "°C" : "°F";

  const daily = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date] && item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });

  Object.values(daily).slice(0, 5).forEach(day => {
    const weekday = new Date(day.dt * 1000)
      .toLocaleDateString("en-US", { weekday: "short" });

    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

    const card = document.createElement("div");
    card.className = "min-w-[80px] bg-blue-600 text-white rounded-xl p-3 text-center";

    card.innerHTML = `
      <p class="text-sm">${weekday}</p>
      <img src="${icon}" class="mx-auto">
      <p class="font-bold">${day.main.temp}${tempUnit}</p>
    `;

    forecastDiv.appendChild(card);
  });
}
