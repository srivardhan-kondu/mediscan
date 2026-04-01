const symptomForm = document.getElementById("symptom-form");
const imageForm = document.getElementById("image-form");
const resultContent = document.getElementById("result-content");
const resultPanel = document.getElementById("result-panel");

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function toPercent(v) {
  return `${(v * 100).toFixed(2)}%`;
}

function showLoading() {
  resultContent.innerHTML = `<div class="loader"><div class="spinner"></div> Analyzing…</div>`;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderResult(payload) {
  if (!payload.ok) {
    resultContent.innerHTML = `<p><strong>Error:</strong> ${esc(payload.error || "Unknown error")}</p>`;
    return;
  }

  const { prediction, confidence, probabilities } = payload.result;
  const guidance = payload.guidance || {};

  const rows = probabilities
    .slice(0, 5)
    .map(
      (item) =>
        `<div class="result-row"><span>${esc(item.disease)}</span><span>${toPercent(item.confidence)}</span></div>`
    )
    .join("");

  resultContent.innerHTML = `
    <p><strong>Top Prediction:</strong> ${esc(prediction)}</p>
    <div class="result-table">${rows}</div>
    <p><strong>Guidance:</strong> ${esc(guidance.general || "Decision-support only.")}</p>
    <p>${esc(guidance.next_step || "Please consult a doctor.")}</p>
  `;
}

symptomForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const symptoms = document.getElementById("symptoms").value.trim();
  if (symptoms.length < 3) {
    renderResult({ ok: false, error: "Please enter at least 3 characters describing your symptoms." });
    return;
  }
  showLoading();
  try {
    const response = await fetch("/api/predict/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    renderResult(await response.json());
  } catch (err) {
    renderResult({ ok: false, error: "Network error. Please try again." });
  }
});

imageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const imageInput = document.getElementById("image");

  if (!imageInput.files || !imageInput.files.length) {
    renderResult({ ok: false, error: "Please upload an image." });
    return;
  }
  showLoading();
  try {
    const formData = new FormData();
    formData.append("image", imageInput.files[0]);

    const response = await fetch("/api/predict/image", {
      method: "POST",
      body: formData,
    });
    renderResult(await response.json());
  } catch (err) {
    renderResult({ ok: false, error: "Network error. Please try again." });
  }
});

const map = L.map("map").setView([17.385, 78.4867], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const fallbackHospitals = [
  { name: "CityCare Hospital", lat: 17.394, lon: 78.49 },
  { name: "Apollo Clinic", lat: 17.402, lon: 78.478 },
  { name: "MediLife Hospital", lat: 17.379, lon: 78.495 },
];

function markHospitals(hospitals) {
  hospitals.forEach((h) => {
    L.marker([h.lat, h.lon]).addTo(map).bindPopup(h.name);
  });
}

markHospitals(fallbackHospitals);

document.getElementById("locate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported in this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    map.setView([latitude, longitude], 14);
    L.marker([latitude, longitude]).addTo(map).bindPopup("You are here");

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:4000,${latitude},${longitude});
      );
      out center 20;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await res.json();
      const hospitals = (data.elements || [])
        .filter((el) => el.lat && el.lon)
        .slice(0, 20)
        .map((el) => ({
          name: el.tags?.name || "Nearby Hospital",
          lat: el.lat,
          lon: el.lon,
        }));

      if (hospitals.length) {
        markHospitals(hospitals);
      }
    } catch (_) {
      // Keep fallback markers if Overpass request fails.
    }
  }, (err) => {
    alert("Could not get your location. Showing default hospital markers.");
  });
});
