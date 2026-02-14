// ---------------------------
// 1) Initialize map
// ---------------------------
let map = L.map("map", {
  center: [-1.286389, 36.817223],
  zoom: 6,
});

// ---------------------------
// 2) Basemaps (3 tile layers)
// ---------------------------
let cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap &copy; Carto" }
).addTo(map);

let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
});

let esriImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

let baseMaps = {
  "Carto Light": cartoLight,
  "OpenStreetMap": osm,
  "ESRI Imagery": esriImagery,
};

// ---------------------------
// 3) Style colors
// ---------------------------
const POINT_FILL = "#22C55E";
const POINT_OUTLINE = "#14532D";
const LINE_COLOR = "#2563EB";
const POLY_FILL = "#A78BFA";
const POLY_OUTLINE = "#7C3AED";

// ---------------------------
// 4) Keep references for layer control + combined bounds
// ---------------------------
let pointsLayer, linesLayer, polygonsLayer;
let allBounds = null;

function extendBounds(layer) {
  const b = layer.getBounds();
  if (!b || !b.isValid()) return;
  if (!allBounds) allBounds = b;
  else allBounds.extend(b);
}

// ---------------------------
// 5) Load POINTS (your confirmed path)
// ---------------------------
fetch("data/points.geojson")
  .then((r) => r.json())
  .then((data) => {
    pointsLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 7,
          fillColor: POINT_FILL,
          fillOpacity: 0.9,
          color: POINT_OUTLINE,
          weight: 2,
        }),
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Point feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(map);

    extendBounds(pointsLayer);
    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    // Update layer control after loading
    updateLayerControl();
  })
  .catch((err) => console.error("Points error:", err));

// ---------------------------
// 6) Load LINES (your confirmed path)
// ---------------------------
fetch("data/data/lines.geojson")
  .then((r) => r.json())
  .then((data) => {
    linesLayer = L.geoJSON(data, {
      style: {
        color: LINE_COLOR,
        weight: 4,
        opacity: 0.9,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Line feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(map);

    extendBounds(linesLayer);
    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    updateLayerControl();
  })
  .catch((err) => console.error("Lines error:", err));

// ---------------------------
// 7) Load POLYGONS (your confirmed path)
// ---------------------------
fetch("data/data/data/polygons.geojson")
  .then((r) => r.json())
  .then((data) => {
    polygonsLayer = L.geoJSON(data, {
      style: {
        color: POLY_OUTLINE,
        weight: 2,
        opacity: 1,
        fillColor: POLY_FILL,
        fillOpacity: 0.45,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || "Polygon feature";
        layer.bindPopup(`<b>${name}</b>`);
      },
    }).addTo(map);

    extendBounds(polygonsLayer);
    if (allBounds) map.fitBounds(allBounds, { padding: [25, 25] });

    updateLayerControl();
  })
  .catch((err) => console.error("Polygons error:", err));

// ---------------------------
// 8) Layer control (create once, update as layers load)
// ---------------------------
let layerControl = L.control.layers(baseMaps, {}).addTo(map);

function updateLayerControl() {
  // Remove and recreate control for simplicity
  map.removeControl(layerControl);

  let overlays = {};
  if (pointsLayer) overlays["Points"] = pointsLayer;
  if (linesLayer) overlays["Lines"] = linesLayer;
  if (polygonsLayer) overlays["Polygons"] = polygonsLayer;

  layerControl = L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);
}

// ---------------------------
// 9) Legend (matches actual colors)
// ---------------------------
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");
  div.className = "legend";
  div.innerHTML = `
    <b>Legend</b><br><br>
    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;
      background:${POINT_FILL};border:2px solid ${POINT_OUTLINE};margin-right:8px;"></span>
    Points<br>
    <span style="display:inline-block;width:18px;height:4px;background:${LINE_COLOR};
      margin-right:8px;vertical-align:middle;"></span>
    Lines<br>
    <span style="display:inline-block;width:14px;height:14px;background:${POLY_FILL};
      border:2px solid ${POLY_OUTLINE};margin-right:8px;vertical-align:middle;"></span>
    Polygons
  `;
  return div;
};

legend.addTo(map);
