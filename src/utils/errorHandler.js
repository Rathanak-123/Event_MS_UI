/**
 * Extracts a user-friendly error message from an axios error object.
 * Handles various backend error formats including Django Rest Framework (DRF) 
 * field-specific errors and generic error messages.
 * 
 * @param {Object} error - The error object from axios catch block
 * @returns {string} - A formatted error message
 */
export const extractErrorMessage = (error) => {
  if (!error) return "An unknown error occurred.";

  const data = error.response?.data;

  // 1. If it's a direct string message
  if (typeof data === 'string') return data;

  // 2. If it's a DRF-style object with a 'message' or 'detail' key
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

  // 3. If it's field-specific errors (common in DRF for 400 Bad Request)
  // Example: { "email": ["This field is required."], "password": ["Too short."] }
  if (data && typeof data === 'object') {
    const errorMessages = [];
    
    for (const [field, messages] of Object.entries(data)) {
      // Skip numeric keys if it's an array
      if (!isNaN(field) && Array.isArray(data)) continue;

      if (Array.isArray(messages)) {
        errorMessages.push(`${field}: ${messages.join(' ')}`);
      } else if (typeof messages === 'string') {
        errorMessages.push(`${field}: ${messages}`);
      } else if (typeof messages === 'object') {
        // Recursive handling for nested objects if needed, but keeping it simple for now
        errorMessages.push(`${field}: ${JSON.stringify(messages)}`);
      }
    }

    if (errorMessages.length > 0) {
      return errorMessages.join(' | ');
    }
  }

  // 4. Fallback to axios error message or standard error message
  return error.message || "An unexpected error occurred. Please try again.";
};
