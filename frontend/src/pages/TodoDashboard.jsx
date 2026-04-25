import { useState, useEffect } from "react";
import { useStore } from "../state/useStore";
import { 
  Plus, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  List,
  Search,
  Trash2,
  Edit,
  PlusCircle
} from "lucide-react";
import TodoModal from "../components/TodoModal";
import TodoCard from "../components/TodoCard";
import TodoStats from "../components/TodoStats";
import TodoFilters from "../components/TodoFilters";

export default function TodoDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [bulkSelect, setBulkSelect] = useState(new Set());

  const {
    todos,
    todoStats,
    loadTodos,
    loadTodoStats,
    loadUpcomingTodos,
    loadOverdueTodos,
    addTodo,
    editTodo,
    removeTodo,
    setTodoFilter,
    todoFilter
  } = useStore();

  useEffect(() => {
    loadTodos();
    loadTodoStats();
    loadUpcomingTodos();
    loadOverdueTodos();
  }, []);

  useEffect(() => {
    loadTodos();
  }, [todoFilter]);

  const handleCreateTodo = async (data) => {
    await addTodo(data);
    setIsModalOpen(false);
  };

  const handleEditTodo = async (data) => {
    await editTodo(selectedTodo._id, data);
    setSelectedTodo(null);
    setIsModalOpen(false);
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      await removeTodo(id);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkSelect.size === 0) return;
    
    if (window.confirm(`Delete ${bulkSelect.size} selected todos?`)) {
      // For now, delete one by one. In a real app, you'd want a bulk delete endpoint
      for (const id of bulkSelect) {
        await removeTodo(id);
      }
      setBulkSelect(new Set());
    }
  };

  const handleTodoClick = (todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate stats manually if todoStats is not available or incomplete
  const calculateStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.status === 'Completed').length;
    const pending = todos.filter(todo => todo.status === 'Pending').length;
    const inProgress = todos.filter(todo => todo.status === 'In Progress').length;
    const overdue = todos.filter(todo => {
      if (todo.status === 'Completed') return false;
      return new Date() > new Date(todo.dueDate);
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate
    };
  };

  // Use calculated stats as fallback or merge with todoStats
  const stats = todoStats && todoStats.total !== undefined ? todoStats : calculateStats();

  // Handle search input change
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setTodoFilter({ search: searchValue });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-600 mt-1">Organize your assignments, projects, and deadlines</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBulkDelete}
                disabled={bulkSelect.size === 0}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={20} />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTodo(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <PlusCircle size={20} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats */}
          <div className="lg:col-span-3">
            <TodoStats stats={stats} />
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    // Show all tasks sorted by due date (calendar-like view)
                    setTodoFilter({ 
                      status: "all",
                      category: "all",
                      priority: "all",
                      search: "",
                      sortBy: "dueDate",
                      order: "asc"
                    });
                    // Scroll to main content
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Calendar size={20} className="text-blue-600" />
                  <span>View Calendar</span>
                </button>
                <button 
                  onClick={() => {
                    // Show in-progress tasks for analytics
                    setTodoFilter({ 
                      status: "In Progress",
                      category: "all",
                      priority: "all",
                      search: "",
                      sortBy: "priority",
                      order: "desc"
                    });
                    // Scroll to main content
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <TrendingUp size={20} className="text-green-600" />
                  <span>Analytics</span>
                </button>
                <button 
                  onClick={() => {
                    // Show all tasks
                    setTodoFilter({ 
                      status: "all",
                      category: "all",
                      priority: "all",
                      search: "",
                      sortBy: "dueDate",
                      order: "asc"
                    });
                    // Scroll to main content
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <List size={20} className="text-purple-600" />
                  <span>Task List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <TodoFilters />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks, descriptions, or tags..."
                    value={todoFilter.search || ""}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="space-y-4">
              {todos.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
                  <div className="text-gray-400 mb-4">
                    <List size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-6">
                    {todoFilter.search ? "Try adjusting your search or filters" : "Create your first task to get started"}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTodo(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    <span>Add Your First Task</span>
                  </button>
                </div>
              ) : (
                todos.map((todo) => (
                  <TodoCard
                    key={todo._id}
                    todo={todo}
                    isSelected={selectedTodo?._id === todo._id}
                    onSelect={() => handleTodoClick(todo)}
                    onEdit={() => {
                      setSelectedTodo(todo);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDeleteTodo(todo._id)}
                    onToggleComplete={() => {
                      editTodo(todo._id, {
                        ...todo,
                        status: todo.status === 'Completed' ? 'Pending' : 'Completed'
                      });
                    }}
                    onToggleBulkSelect={() => {
                      const newSet = new Set(bulkSelect);
                      if (newSet.has(todo._id)) {
                        newSet.delete(todo._id);
                      } else {
                        newSet.add(todo._id);
                      }
                      setBulkSelect(newSet);
                    }}
                    isBulkSelected={bulkSelect.has(todo._id)}
                    onEditTodo={editTodo}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Todo Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTodo(null);
        }}
        todo={selectedTodo}
        onSave={selectedTodo ? handleEditTodo : handleCreateTodo}
      />
    </div>
  );
}