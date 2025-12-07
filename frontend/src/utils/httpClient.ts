import axios, { AxiosInstance } from "axios";

export const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.API_BASE_URL || "http://localhost:3001",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.message);
      return Promise.reject(error);
    },
  );

  return client;
};

export const httpClient = createHttpClient();
