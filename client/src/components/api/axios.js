import axios from "axios";

const API = axios.create({
  baseURL: "https://capstonebackend-ok8or8y36-calryas-projects.vercel.app", // ✅ Use the deployed backend
  withCredentials: true, // 🔹 If using cookies/auth
});

export default API;
