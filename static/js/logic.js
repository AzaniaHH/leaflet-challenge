// Define the URL for the USGS GeoJSON Feed
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map object
const map = L.map("map").setView([37.7749, -122.4194], 5); // Default center and zoom level

// Add a tile layer (Mapbox Streets is used here)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 4; // Adjust multiplier for better visualization
}

// Function to determine marker color based on depth
function markerColor(depth) {
    return depth > 90 ? "#ff0000" :
           depth > 70 ? "#ff4500" :
           depth > 50 ? "#ff8c00" :
           depth > 30 ? "#ffd700" :
           depth > 10 ? "#9acd32" :
                        "#00ff00";
}

// Fetch the earthquake data
fetch(earthquakeURL)
    .then(response => response.json())
    .then(data => {
        // Function to create features for the map
        function onEachFeature(feature, layer) {
            const { mag, place } = feature.properties;
            const [longitude, latitude, depth] = feature.geometry.coordinates;

            // Create a popup for each marker
            layer.bindPopup(`
                <h3>${place}</h3>
                <p>Magnitude: ${mag}</p>
                <p>Depth: ${depth} km</p>
                <p>Coordinates: [${latitude}, ${longitude}]</p>
            `);
        }

        // Add GeoJSON data to the map
        L.geoJSON(data, {
            // Create circle markers
            pointToLayer: (feature, latlng) => {
                const { mag } = feature.properties;
                const depth = feature.geometry.coordinates[2];
                return L.circleMarker(latlng, {
                    radius: markerSize(mag),
                    fillColor: markerColor(depth),
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Create the legend
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#00ff00", "#9acd32", "#ffd700", "#ff8c00", "#ff4500", "#ff0000"];

    // Loop through depth intervals and generate labels
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML += `
            <i style="background: ${colors[i]}"></i>
            ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>
        `;
    }
    return div;
};

legend.addTo(map);
