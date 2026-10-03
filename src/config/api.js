export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "https://ecointeractive-hqom.onrender.com";

export default API_BASE_URL;
