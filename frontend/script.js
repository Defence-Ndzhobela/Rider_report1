// Preload reports only if none exist yet
function preloadReports() {
  const existingReports = JSON.parse(localStorage.getItem("reports")) || [];
  if (existingReports.length > 0) return; // Don't reset if reports already exist

  const reports = [
    {
      location: "19 Ameshoff Street, Braamfontein, Johannesburg (GPS: -26.1961, 28.0416)",
      time: "2025-09-05 08:30",
      description: "Pothole causing water accumulation near the intersection.",
      photo: null
    },
    {
      location: "123 Main Road, Cape Town (GPS: -33.9258, 18.4232)",
      time: "2025-09-04 14:15",
      description: "Fallen tree blocking part of the cycle lane.",
      photo: null
    },
    {
      location: "45 Church Street, Durban (GPS: -29.8587, 31.0218)",
      time: "2025-09-03 09:45",
      description: "Construction debris on the road, slippery surface warning.",
      photo: null
    },
    {
      location: "7 Long Street, Cape Town (GPS: -33.9255, 18.4233)",
      time: "2025-09-02 17:20",
      description: "Broken traffic light at intersection, drive cautiously.",
      photo: null
    },
    {
      location: "88 Albert Street, Pretoria (GPS: -25.7479, 28.2293)",
      time: "2025-09-01 12:00",
      description: "Loose manhole cover near pedestrian crossing.",
      photo: null
    }
  ];

  localStorage.setItem("reports", JSON.stringify(reports));
}

// Load latest reports into index.html
function loadLatestReports() {
  preloadReports();

  let reports = JSON.parse(localStorage.getItem("reports")) || [];
  const latestReports = document.getElementById("latestReports");

  if (reports.length === 0) {
    latestReports.innerHTML = "<p>No reports yet.</p>";
    return;
  }

  // Always sort so newest report is first
  reports.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Show only last 5
  const lastFive = reports.slice(0, 5);
  latestReports.innerHTML = lastFive.map(r => `
    <div class="report-card">
      <p><strong>${r.time}</strong> - ${r.description}</p>
      <p>📍 ${r.location}</p>
    </div>
  `).join("");
}
document.getElementById("aiSuggestionBtn").addEventListener("click", async () => {
  const description = document.getElementById("description").value;

  if (!description.trim()) {
    alert("⚠️ Please enter a description first.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/rewrite-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();
    if (data.suggestion) {
      document.getElementById("description").value = data.suggestion;
    } else {
      alert("⚠️ Failed to get AI suggestion.");
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Error connecting to AI service.");
  }
});
