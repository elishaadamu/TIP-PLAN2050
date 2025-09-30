// A list of potential property keys that we want to use as filters.
const FILTERABLE_KEYS = ["Scope", "County", "project_type", "locality", "Type"];

/**
 * Generates a list of filterable fields from GeoJSON data.
 * @param {object} geoData - The GeoJSON data.
 * @returns {Array<object>} A list of field objects with keys, labels, and options.
 */
export const getFilterableFields = (geoData) => {
  if (!geoData || !geoData.features || geoData.features.length === 0) {
    return [];
  }

  const firstProperties = geoData.features[0].properties;
  const availableKeys = FILTERABLE_KEYS.filter((key) =>
    firstProperties.hasOwnProperty(key)
  );

  return availableKeys.map((key) => {
    const uniqueOptions = [
      ...new Set(geoData.features.map((f) => f.properties[key])),
    ].filter(Boolean);

    return {
      key: key,
      label: key.replace(/_/g, " "), // e.g., project_type -> project type
      options: ["All", ...uniqueOptions.sort()],
    };
  });
};
