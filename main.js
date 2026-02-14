let map = L.map("map", {
  center: [-1.286389, 36.817223], // Nairobi CBD
  zoom: 13,
});

// ---------------------------
// Base Maps (3 tile layers)
// ---------------------------

// 1) OpenStreetMap
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// 2) ESRI World Imagery
let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
  }
);

// 3) CartoDB Positron
let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB",
  }
);

let baseMaps = {
  "OpenStreetMap": osm,
  "ESRI Imagery": esriImagery,
  "Carto Light": cartoLight,
};

// ---------------------------
// Load GeoJSON Layers
// ---------------------------

// Points
fetch("data/points.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup("Point: " + feature.properties.name);
      },
    }).addTo(map);
  });

// Lines
fetch("data/data/lines.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: { color: "green" },
      onEachFeature: (feature, layer) => {
        layer.bindPopup("Line: " + feature.properties.name);
      },
    }).addTo(map);
  });

// Polygons
fetch("data/data/data/polygons.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: { color: "orange" },
      onEachFeature: (feature, layer) => {
        layer.bindPopup("Polygon: " + feature.properties.name);
      },
    }).addTo(map);
  });

// ---------------------------
// Layer Control
// ---------------------------
L.control.layers(baseMaps).addTo(map);

// ---------------------------
// Legend
// ---------------------------
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <h4>Legend</h4>
    <p>🔵 Points</p>
    <p>🟢 Lines</p>
    <p>🟠 Polygons</p>
  `;
  return div;
};

legend.addTo(map);
