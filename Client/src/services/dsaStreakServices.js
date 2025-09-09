// src/services/dsaStreakServices.js
import axios from "axios";

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Fetch today's Daily DSA  from the backend.
 * Normalizes common response shapes and returns the inner data (or null).
 *
 * Example returned shape (based on your backend):
 * { _id, questionId: { _id, title, description, ... }, date, ... }
 *
 * @param {object} opts Optional { apiBase, timeout }
 * @returns {Promise<object|null>}
 * @throws {Error} on network / server errors
 */
export async function getTodayDailyDSA(opts = {}) {
  const baseURL = opts.apiBase || DEFAULT_API_BASE;
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: opts.timeout ?? 15000,
  });

  try {
    const res = await client.get("/daily-dsa");
    // Normalize typical axios response shapes:
    // - { success: true, data: {...} }
    // - { data: {...} }
    // - {...} (doc directly)
    const payload = res?.data;
    if (!payload) return null;
    if (payload.data !== undefined) return payload.data;
    return payload;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || "Failed to fetch today's daily DSA";
    const e = new Error(message);
    e.original = err;
    throw e;
  }
}

export default getTodayDailyDSA;
