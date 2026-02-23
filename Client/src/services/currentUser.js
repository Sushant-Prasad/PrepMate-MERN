import api from "../utils/api";

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/profiles/me", {
      withCredentials: true
    });

    const user = res.data.data;

    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (err) {
    console.error("Failed to fetch current user", err);
    localStorage.removeItem("user");
    return null;
  }
};
