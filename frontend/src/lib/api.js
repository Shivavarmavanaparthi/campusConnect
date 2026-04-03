import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8001/api";

export const API = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise = null;

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original || original._retry) return Promise.reject(error);

    if (error.response?.status === 401 && original.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    const url = original.url || "";
    const isAuthAttempt =
      url.includes("/auth/login") || url.includes("/auth/signup");

    if (error.response?.status === 401 && !isAuthAttempt) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = API.post("/auth/refresh-token").finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return API(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const logout = () => API.post("/auth/logout");
export const getProfile = () => API.get("/auth/profile");

export const getBlogs = () => API.get("/blogs");
export const getBlogById = (id) => API.get(`/blogs/${id}`);
export const getMyBlogs = () => API.get("/blogs/getMyBlogs");
export const createBlog = (data) => API.post("/blogs", data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

export const getResources = () => API.get("/resources");
export const getMyResources = () => API.get("/resources/my");
export const uploadResource = (formData) =>
  API.post("/resources/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteResource = (id) => API.delete(`/resources/${id}`);

export const summarizePDF = (formData) =>
  API.post("/ai/summarize", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const buildResumePDF = (payload) =>
  API.post("/ai/resume/pdf", payload, {
    responseType: "blob",
    headers: { "Content-Type": "application/json" },
  });
