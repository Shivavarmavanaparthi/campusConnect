import { create } from "zustand";
import {
  getBlogs,
  getResources,
  getProfile,
  logout as apiLogout,
  getMyBlogs,
  getMyResources,
} from "../lib/api";

export const useStore = create((set, get) => ({
  user: null,
  authLoading: true,
  blogs: [],
  resources: [],
  myBlogs: [],
  myResources: [],
  feedFilter: "latest",
  resourceCategory: "all",
  resourceQuery: "",

  setFeedFilter: (feedFilter) => set({ feedFilter }),
  setResourceCategory: (resourceCategory) => set({ resourceCategory }),
  setResourceQuery: (resourceQuery) => set({ resourceQuery }),

  checkAuth: async () => {
    try {
      const res = await getProfile();
      set({ user: res.data.user, authLoading: false });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        set({ user: null, authLoading: false });
      } else {
        set({ authLoading: false });
      }
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } finally {
      set({ user: null });
    }
  },

  loadBlogs: async () => {
    try {
      const res = await getBlogs();
      set({ blogs: res.data.blogs || [] });
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error("Failed to load blogs:", err.message);
        // Only clear data if it's a genuine auth failure
        if (err.response?.status === 401) set({ blogs: [] });
      }
    }
  },

  loadResources: async () => {
    try {
      const res = await getResources();
      set({ resources: res.data.resources || [] });
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error("Failed to load resources:", err.message);
        if (err.response?.status === 401) set({ resources: [] });
      }
    }
  },

  loadMyBlogs: async () => {
    try {
      const res = await getMyBlogs();
      set({ myBlogs: res.data.blogs || [] });
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error("Failed to load my blogs:", err.message);
        if (err.response?.status === 401) set({ myBlogs: [] });
      }
    }
  },

  loadMyResources: async () => {
    try {
      const res = await getMyResources();
      set({ myResources: res.data.resources || [] });
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error("Failed to load my resources:", err.message);
        if (err.response?.status === 401) set({ myResources: [] });
      }
    }
  },

  getFeedBlogs: () => {
    const { blogs, feedFilter } = get();
    const list = [...blogs];

    if (feedFilter === "trending") {
      return list
        .map((b) => {
          const hours =
            (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);

          const score = (b.views || 0) / (hours + 1);

          return { ...b, score };
        })
        .sort((a, b) => b.score - a.score);
    }

    return list.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  getTrendingTopics: () => {
    const { blogs } = get();
    const map = new Map();
    for (const b of blogs) {
      const cat = (b.category || "general").toLowerCase();
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  },

  getStats: () => {
    const { blogs, resources } = get();
    const authorIds = new Set();

    for (const b of blogs) {
      const id = b.author?._id || b.author;
      if (id) authorIds.add(String(id));
    }

    return {
      totalStudents: authorIds.size,
      publishedBlogs: blogs.length,
      sharedResources: resources.length,
    };
  },

  getTopTrendingBlogs: () => {
    const { blogs } = get();

    return [...blogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  },
}));