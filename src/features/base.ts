import { config } from "@/lib/config";
import { LOCAL_STORAGE_KEY } from "@/lib/constaints";
import axios from "axios";

const agent = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 120000,
  withCredentials: true,
});

agent.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `${localStorage.getItem(LOCAL_STORAGE_KEY.user_id)}`;
    config.headers["X-Custom-Header"] = "v2v";
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

agent.interceptors.response.use(
  (response) => response,
  async (error) => {
    // console.log(`Error ${error.response?.status as string}`);
    // ステータスコードに応じてエラー処理を実装
    switch (error.response?.status) {
      case 400:
        return Promise.reject(error);
      case 401:
      case 403:
        localStorage.setItem(LOCAL_STORAGE_KEY.redirect_to, window.location.href)
        window.location.href = `${config.aiPlatformBaseUrl}/login`;
        return Promise.reject(error);
      case 500:
        return Promise.reject(error);
      case 503:
        return Promise.reject(error);
      default:
        return Promise.reject(error);
    }
  },
);

export default agent;
