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
    } catch {
      set({ user: null, authLoading: false });
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
    const res = await getBlogs();
    set({ blogs: res.data.blogs || [] });
  },

  loadResources: async () => {
    const res = await getResources();
    set({ resources: res.data.resources || [] });
  },

  loadMyBlogs: async () => {
    const res = await getMyBlogs();
    set({ myBlogs: res.data.blogs || [] });
  },

  loadMyResources: async () => {
    const res = await getMyResources();
    set({ myResources: res.data.resources || [] });
  },

  getFeedBlogs: () => {
    const { blogs, feedFilter } = get();
    const list = [...blogs];
    if (feedFilter === "trending") {
      return list.sort((a, b) => {
        const sa = (a.title?.length || 0) + (new Date(a.createdAt).getTime() % 9973);
        const sb = (b.title?.length || 0) + (new Date(b.createdAt).getTime() % 9973);
        return sb - sa;
      });
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
    const { blogs } = get();
    const authorIds = new Set();
    for (const b of blogs) {
      const id = b.author?._id || b.author;
      if (id) authorIds.add(String(id));
    }
    const totalStudents = Math.max(2, authorIds.size);
    return {
      totalStudents,
      publishedBlogs: blogs.length,
      sharedResources: get().resources.length,
    };
  },
}));
