export const createError = (statusCode, message) => {
  const error = new Error(message); // pass message directly
  error.statusCode = statusCode;
  return error;
};