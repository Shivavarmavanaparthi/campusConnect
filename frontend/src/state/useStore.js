import { create } from "zustand";
import {
  getBlogs,
  getResources,
  getProfile,
  logout as apiLogout,
  getMyBlogs,
  getMyResources,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
  getUpcomingTodos,
  getOverdueTodos,
} from "../lib/api";

export const useStore = create((set, get) => ({
  user: null,
  authLoading: true,
  blogs: [],
  resources: [],
  myBlogs: [],
  myResources: [],
  todos: [],
  todoStats: null,
  upcomingTodos: [],
  overdueTodos: [],
  feedFilter: "latest",
  resourceCategory: "all",
  resourceQuery: "",
  todoFilter: {
    status: "all",
    category: "all",
    priority: "all",
    search: "",
    sortBy: "dueDate",
    order: "asc"
  },

  setFeedFilter: (feedFilter) => set({ feedFilter }),
  setResourceCategory: (resourceCategory) => set({ resourceCategory }),
  setResourceQuery: (resourceQuery) => set({ resourceQuery }),
  setTodoFilter: (filter) => set((state) => ({
    todoFilter: { ...state.todoFilter, ...filter }
  })),

  checkAuth: async () => {
  try {
    const res = await getProfile();

    set({
      user: res.data.user,
      authLoading: false,
    });
  } catch (err) {
    console.log("Auth check failed:", err.message);

    set({
      user: null,
      authLoading: false,
    });
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

  // Todo actions
  loadTodos: async () => {
    try {
      const { todoFilter } = get();
      const params = {};
      
      if (todoFilter.status !== "all") params.status = todoFilter.status;
      if (todoFilter.category !== "all") params.category = todoFilter.category;
      if (todoFilter.priority !== "all") params.priority = todoFilter.priority;
      if (todoFilter.search) params.search = todoFilter.search;
      if (todoFilter.sortBy) params.sortBy = todoFilter.sortBy;
      if (todoFilter.order) params.order = todoFilter.order;

      const res = await getTodos(params);
      set({ todos: res.data.todos || [] });
    } catch (err) {
      if (err.response?.status !== 429) {
        console.error("Failed to load todos:", err.message);
        if (err.response?.status === 401) set({ todos: [] });
      }
    }
  },

  loadTodoStats: async () => {
    try {
      const res = await getTodoStats();
      set({ todoStats: res.data.stats });
    } catch (err) {
      console.error("Failed to load todo stats:", err.message);
    }
  },

  loadUpcomingTodos: async (days = 7) => {
    try {
      const res = await getUpcomingTodos(days);
      set({ upcomingTodos: res.data.todos || [] });
    } catch (err) {
      console.error("Failed to load upcoming todos:", err.message);
    }
  },

  loadOverdueTodos: async () => {
    try {
      const res = await getOverdueTodos();
      set({ overdueTodos: res.data.todos || [] });
    } catch (err) {
      console.error("Failed to load overdue todos:", err.message);
    }
  },

  addTodo: async (data) => {
    try {
      const res = await createTodo(data);
      set((state) => ({ todos: [res.data.todo, ...state.todos] }));
      // Refresh stats
      get().loadTodoStats();
      return res.data;
    } catch (err) {
      console.error("Failed to create todo:", err.message);
      throw err;
    }
  },

  editTodo: async (id, data) => {
    try {
      const res = await updateTodo(id, data);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo._id === id ? res.data.todo : todo
        )
      }));
      // Refresh stats
      get().loadTodoStats();
      return res.data;
    } catch (err) {
      console.error("Failed to update todo:", err.message);
      throw err;
    }
  },

  removeTodo: async (id) => {
    try {
      await deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo._id !== id)
      }));
      // Refresh stats
      get().loadTodoStats();
    } catch (err) {
      console.error("Failed to delete todo:", err.message);
      throw err;
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

  getFilteredTodos: () => {
    const { todos } = get();
    return todos;
  },

  getTodoStats: () => {
    const { todoStats } = get();
    return todoStats || {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      completionRate: 0
    };
  },

  getTopTrendingBlogs: () => {
    const { blogs } = get();

    return [...blogs]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  },
}));