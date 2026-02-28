/**
 * Static [longitude, latitude] coordinates for known BTS concert cities.
 * Key format: "City, Country" (must match concert.city + ", " + concert.country exactly).
 *
 * Fallback: COUNTRY_CENTROIDS used when city is unknown.
 * If country is also unknown, the concert is silently skipped on the map.
 */
export const CITY_COORDS: Record<string, [number, number]> = {
  // South Korea
  "Seoul, South Korea": [126.978, 37.566],
  "Busan, South Korea": [129.075, 35.180],

  // Japan
  "Tokyo, Japan": [139.691, 35.690],
  "Osaka, Japan": [135.502, 34.694],
  "Nagoya, Japan": [136.906, 35.181],
  "Fukuoka, Japan": [130.418, 33.590],
  "Saitama, Japan": [139.649, 35.861],

  // United States
  "Los Angeles, United States": [-118.243, 34.052],
  "New York, United States": [-74.006, 40.713],
  "Chicago, United States": [-87.629, 41.878],
  "Newark, United States": [-74.172, 40.736],
  "Dallas, United States": [-96.797, 32.776],
  "Atlanta, United States": [-84.388, 33.749],
  "Fort Worth, United States": [-97.320, 32.725],
  "San Jose, United States": [-121.886, 37.338],
  "San Francisco, United States": [-122.419, 37.775],
  "Seattle, United States": [-122.332, 47.606],
  "Houston, United States": [-95.370, 29.760],
  "Las Vegas, United States": [-115.137, 36.175],
  "Orlando, United States": [-81.380, 28.538],
  "Anaheim, United States": [-117.915, 33.836],
  "Inglewood, United States": [-118.353, 33.962],
  "Nashville, United States": [-86.781, 36.162],
  "Washington, United States": [-77.037, 38.907],
  "Boston, United States": [-71.058, 42.360],
  "Minneapolis, United States": [-93.265, 44.977],
  "Denver, United States": [-104.990, 39.739],
  "Phoenix, United States": [-112.074, 33.448],

  // Canada
  "Toronto, Canada": [-79.383, 43.653],
  "Vancouver, Canada": [-123.121, 49.283],

  // United Kingdom
  "London, United Kingdom": [-0.128, 51.507],
  "London, England": [-0.128, 51.507],

  // France
  "Paris, France": [2.352, 48.857],

  // Germany
  "Berlin, Germany": [13.405, 52.520],

  // Netherlands
  "Amsterdam, Netherlands": [4.905, 52.370],

  // Australia
  "Sydney, Australia": [151.209, -33.868],
  "Melbourne, Australia": [144.946, -37.840],
  "Brisbane, Australia": [153.026, -27.470],
  "Auckland, New Zealand": [174.763, -36.849],

  // Southeast Asia
  "Bangkok, Thailand": [100.501, 13.756],
  "Singapore, Singapore": [103.820, 1.352],
  "Manila, Philippines": [120.984, 14.599],
  "Jakarta, Indonesia": [106.845, -6.211],
  "Kuala Lumpur, Malaysia": [101.687, 3.139],

  // China / HK / Taiwan
  "Beijing, China": [116.407, 39.904],
  "Shanghai, China": [121.474, 31.230],
  "Hong Kong, Hong Kong": [114.177, 22.302],
  "Macau, Macau": [113.543, 22.199],
  "Taipei, Taiwan": [121.565, 25.033],

  // Middle East
  "Riyadh, Saudi Arabia": [46.722, 24.689],
  "Abu Dhabi, United Arab Emirates": [54.367, 24.453],
  "Dubai, United Arab Emirates": [55.296, 25.204],

  // Latin America
  "São Paulo, Brazil": [-46.633, -23.549],
  "Santiago, Chile": [-70.649, -33.459],
  "Buenos Aires, Argentina": [-58.382, -34.604],
  "Mexico City, Mexico": [-99.133, 19.433],
  "Bogotá, Colombia": [-74.072, 4.711],
};

/**
 * Country-level centroid fallback when a city is not found in CITY_COORDS.
 * Key: concert.country string.
 */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  "South Korea": [127.766, 35.907],
  "Japan": [138.252, 36.204],
  "United States": [-95.713, 37.090],
  "Canada": [-96.821, 56.130],
  "United Kingdom": [-3.436, 55.378],
  "England": [-1.174, 52.356],
  "France": [2.214, 46.228],
  "Germany": [10.451, 51.166],
  "Netherlands": [5.291, 52.133],
  "Australia": [133.775, -25.274],
  "New Zealand": [174.886, -40.900],
  "Thailand": [100.993, 15.870],
  "Singapore": [103.820, 1.352],
  "Philippines": [121.774, 12.880],
  "Indonesia": [113.922, -0.790],
  "Malaysia": [109.698, 4.210],
  "China": [104.196, 35.861],
  "Hong Kong": [114.177, 22.302],
  "Macau": [113.543, 22.199],
  "Taiwan": [120.960, 23.698],
  "Saudi Arabia": [45.079, 23.886],
  "United Arab Emirates": [53.848, 23.424],
  "Brazil": [-51.925, -14.235],
  "Chile": [-71.543, -35.675],
  "Argentina": [-63.617, -38.416],
  "Mexico": [-102.553, 23.634],
  "Colombia": [-74.297, 4.571],
};

/**
 * Resolve a concert's coordinates.
 * Returns [lng, lat] or null if neither city nor country is found.
 */
export function resolveCoords(city: string, country: string): [number, number] | null {
  const cityKey = `${city}, ${country}`;
  if (CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
  if (COUNTRY_CENTROIDS[country]) return COUNTRY_CENTROIDS[country];
  return null;
}
