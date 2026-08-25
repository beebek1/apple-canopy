// PLACEHOLDER. This is a rough approximation, not Mustang district's real
// administrative boundary. Replace the coordinates below with a real export
// from one of:
//   - Overpass Turbo (overpass-turbo.eu): query
//       relation["name"="Mustang"]["admin_level"="5"]["boundary"="administrative"];
//     then Export > GeoJSON
//   - HDX (data.humdata.org): search "Nepal administrative boundaries"
//   - geoBoundaries.org: Nepal, ADM3 level
//
// GeoJSON coordinates are [longitude, latitude], the opposite order from the
// [lat, lng] used everywhere else in this file for Leaflet markers.
export const MUSTANG_BOUNDARY = {
  type: "Feature",
  properties: { name: "Mustang District" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [83.65, 28.75],
        [83.7, 28.83],
        [83.68, 28.9],
        [83.72, 28.97],
        [83.8, 29.02],
        [83.88, 29.05],
        [83.95, 29.0],
        [83.93, 28.93],
        [83.97, 28.87],
        [83.9, 28.8],
        [83.85, 28.78],
        [83.8, 28.72],
        [83.72, 28.7],
        [83.65, 28.75],
      ],
    ],
  },
};
