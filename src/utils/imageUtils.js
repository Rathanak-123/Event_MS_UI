/**
 * Utility to construct full image URLs from paths provided by the API.
 * 
 * @param {string} path - The image path from the API.
 * @param {string} fallback - A fallback URL if path is missing.
 * @returns {string} - The full URL for the image.
 */
export const getImageUrl = (path, fallback = "") => {
  if (!path) {
    return fallback || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80";
  }

  // If it's already an absolute URL, return as is
  if (path.startsWith("http")) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_UPLOAD_URL || "http://127.0.0.1:8000/uploads/";
  
  // Normalize path by removing leading slash and the 'uploads/' prefix if redundant
  let cleanPath = path;
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
  
  // If baseUrl already ends with 'uploads/', and path starts with 'uploads/', remove it from path
  // to avoid duplication: http://.../uploads/uploads/events/...
  if (baseUrl.toLowerCase().endsWith("/uploads/") && cleanPath.toLowerCase().startsWith("uploads/")) {
    cleanPath = cleanPath.substring(8); // Length of "uploads/"
  }
  
  // Ensure baseURL ends with / and cleanPath doesn't start with /
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
};

/**
 * Utility for customer profile images with UI-Avatars fallback.
 * 
 * @param {string} path - Profile picture path.
 * @param {Object} userData - User object containing first_name and last_name.
 * @returns {string} - The full URL for the avatar.
 */
export const getAvatarUrl = (path, userData = {}) => {
  if (path) {
    return getImageUrl(path);
  }
  
  const firstName = userData.first_name || "";
  const lastName = userData.last_name || "";
  const name = firstName || lastName ? `${firstName}+${lastName}` : "User";
  
  return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=256`;
};
