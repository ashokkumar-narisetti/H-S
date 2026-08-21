/**
 * Base64 Data URI Passthrough Utility for Database Storage
 * Ensures images (base64 Data URIs or URLs) are stored directly in PostgreSQL database columns.
 */

export const saveBase64Image = (dataUrl) => {
  // Store base64 Data URI directly in the database as requested
  return dataUrl;
};

/**
 * Traverses product payload objects and preserves base64 Data URIs directly for database insertion.
 */
export const deepSanitizeBase64 = (val) => {
  if (!val) return val;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return deepSanitizeBase64(parsed);
      } catch (e) {
        return val;
      }
    }
    return val;
  }

  if (Array.isArray(val)) {
    return val.map(deepSanitizeBase64);
  }

  if (typeof val === 'object' && val !== null) {
    const res = {};
    for (const key of Object.keys(val)) {
      res[key] = deepSanitizeBase64(val[key]);
    }
    return res;
  }

  return val;
};

export const sanitizeProductImageFields = (data) => {
  return deepSanitizeBase64(data);
};
