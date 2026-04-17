import axios from "axios";

/* ================= BASE URL ================= */

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api";

/* ================= AXIOS INSTANCE ================= */

export const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

API.defaults.withCredentials = true;

/* ================= REFRESH CONTROL ================= */

let refreshPromise = null;

/* ================= RESPONSE INTERCEPTOR ================= */

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!original || original._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = original.url || "";


    if (
      status === 401 &&
      (url.includes("/auth/refresh-token") ||
        url.includes("/auth/login") ||
        url.includes("/auth/signup"))
    ) {
      return Promise.reject(error);
    }

    const isAuthRequest =
      url.includes("/auth/login") || url.includes("/auth/signup");

   
    if (status === 401 && !isAuthRequest) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = API.post(
            "/auth/refresh-token",
            {},
            { withCredentials: true } 
          ).finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;

        return API(original); // retry original request
      } catch (err) {
        console.log("Session expired. Please login again.");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/* ================= AUTH API ================= */

export const signup = (data) => API.post("/auth/signup", data);

export const login = (data) => API.post("/auth/login", data);

export const logout = () => API.post("/auth/logout");

export const getProfile = () => API.get("/auth/profile");

/* ================= BLOG API ================= */

export const getBlogs = () => API.get("/blogs");

export const getBlogById = (id) => API.get(`/blogs/${id}`);

export const getMyBlogs = () => API.get("/blogs/getMyBlogs");

export const createBlog = (data) => API.post("/blogs", data);

export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);

export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

/* ================= RESOURCES API ================= */

export const getResources = () => API.get("/resources");

export const getMyResources = () => API.get("/resources/my");

export const uploadResource = (formData) =>
  API.post("/resources/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteResource = (id) =>
  API.delete(`/resources/${id}`);

/* ================= AI ================= */

export const buildResumePDF = (payload) =>
  API.post("/ai/resume/pdf", payload, {
    responseType: "blob",
    headers: { "Content-Type": "application/json" },
  });