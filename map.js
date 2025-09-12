const debugEl = document.getElementById("debug");
let dishesData = []; // Store dishes data globally
let isTableView = false;

function log(msg) {
  console.log(msg);
  debugEl.innerHTML += msg + "<br/>";
}

function formatDate(dateString) {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format as "Month DD, YYYY" (e.g., "January 15, 2023")
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateShort(dateString) {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;
  
  // Format as "MMM DD, YYYY" (e.g., "Jan 15, 2023")
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function toggleView() {
  const mapDiv = document.getElementById("map");
  const tableDiv = document.getElementById("table-view");
  const toggleBtn = document.getElementById("toggle-view");
  const debugDiv = document.getElementById("debug");
  
  isTableView = !isTableView;
  
  if (isTableView) {
    mapDiv.style.display = "none";
    tableDiv.style.display = "block";
    debugDiv.style.display = "none";
    toggleBtn.innerHTML = "🗺️ Map View";
    populateTable();
  } else {
    mapDiv.style.display = "block";
    tableDiv.style.display = "none";
    debugDiv.style.display = "block";
    toggleBtn.innerHTML = "📊 Table View";
  }
}

function populateTable() {
  const tbody = document.getElementById("dishes-tbody");
  tbody.innerHTML = ""; // Clear existing rows
  
  dishesData.forEach(dish => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${dish.country}</strong></td>
      <td>${dish.dish}</td>
      <td>${formatDate(dish.date)}</td>
    `;
    tbody.appendChild(row);
  });
}

// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Base layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load data
Promise.all([
  fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(res => res.json()),
  fetch('dishes.json').then(res => res.json())
])
.then(([geoData, dishes]) => {
  dishesData = dishes; // Store globally
  log("Loaded " + geoData.features.length + " countries from GeoJSON.");
  log("Loaded " + dishes.length + " entries from dishes.json.");

  // Build lookup
  const dishLookup = {};
  dishes.forEach(d => {
    const key = d.iso_a3 ? d.iso_a3.trim().toUpperCase() : "";
    dishLookup[key] = d;
    log("Dish loaded for: " + key + " (" + d.country + ")");
  });

  console.log(dishLookup);

  // Style function
  function style(feature) {
    const iso = feature.properties["ISO3166-1-Alpha-3"];
    if (dishLookup[iso]) {
      log("✔ Matched: " + iso + " → " + dishLookup[iso].dish);
      return {
        fillColor: "green",
        color: "#555",
        weight: 1,
        fillOpacity: 1
      };
    } else {
      return {
        fillColor: "lightgrey",
        color: "#555",
        weight: 1,
        fillOpacity: 1
      };
    }
  }

  // Tooltip
  function onEachFeature(feature, layer) {
    const countryName = feature.properties.name || 'Unknown Country';
    const iso = feature.properties["ISO3166-1-Alpha-3"];
    
    if (dishLookup[iso]) {
      const { country, dish, date } = dishLookup[iso];
      layer.bindTooltip(
`<strong>${countryName}</strong><br/>Dish: ${dish}<br/>Date: ${formatDateShort(date)}`,
        { sticky: true }
      );
    } else {
      layer.bindTooltip(countryName, { sticky: true });
    }
  }

  // Add GeoJSON
  L.geoJSON(geoData, {
    style,
    onEachFeature
  }).addTo(map);
})
.catch(err => log("❌ Error loading data: " + err));