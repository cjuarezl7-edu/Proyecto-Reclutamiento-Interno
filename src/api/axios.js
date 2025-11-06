import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE;
console.log("🌐 AXIOS baseURL:", baseURL);

const instance = axios.create({
  baseURL,
  withCredentials: false,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const fullUrl = (config.baseURL || "") + (config.url || "");
  console.log(`➡️ REQUEST [${(config.method || "GET").toUpperCase()}] ${fullUrl}`);
  return config;
});

export default instance;
