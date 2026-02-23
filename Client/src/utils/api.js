
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
});

// Automatically attach token from localStorage
// api.interceptors.request.use(
//   (config) => {
//     const savedUser = localStorage.getItem("user");
//     if (savedUser) {
//       try {
//         const parsed = JSON.parse(savedUser);
//         if (parsed?.token) {
//           config.headers.Authorization = `Bearer ${parsed.token}`;
//         }
//       } catch (err) {
//         console.warn("Failed to parse user from localStorage:", err);
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default api;


