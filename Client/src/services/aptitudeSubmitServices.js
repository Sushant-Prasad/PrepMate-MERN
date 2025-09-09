// src/services/aptitudeSubmitServices.js
import axios from "axios";

/**
 * Simple axios instance for API calls.
 * Adjust baseURL if your API runs on a different origin or use environment variables.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true, // send cookies (HttpOnly)
  timeout: 15000,
});

const handleError = (err) => {
  // unwrap axios error to a consistent shape
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Network or server error";
  const status = err?.response?.status || null;
  return { message, status, raw: err };
};

/**
 * Submit an aptitude answer.
 * @param {Object} payload - { questionId, selectedOption, mode = "practice", timeTaken }
 * @returns {Promise<Object>} resolves to response.data or throws an error
 */
export async function submitAptitudeAnswer(payload) {
  try {
    const res = await api.post("/aptitude-submission/", payload);
    // expected: { isCorrect: boolean, message, submission?, streak? }
    return res.data;
  } catch (err) {
    const e = handleError(err);
    // rethrow or return structured error (here we throw so callers can catch)
    throw e;
  }
}

/**
 * Get all submissions for a user (practice + streak)
 * @param {string} userId
 * @returns {Promise<Array>} submissions
 */
export async function getUserSubmissions(userId) {
  try {
    const res = await api.get(`/aptitude/submissions/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    const e = handleError(err);
    throw e;
  }
}

/**
 * Get only streak-mode submissions for a user
 * @param {string} userId
 * @returns {Promise<Array>} submissions
 */
export async function getUserStreakSubmissions(userId) {
  try {
    const res = await api.get(`/aptitude/submissions/streak/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    const e = handleError(err);
    throw e;
  }
}

/**
 * Export default convenience object
 */
export default {
  submitAptitudeAnswer,
  getUserSubmissions,
  getUserStreakSubmissions,
};
