import { useState } from "react";
import { useStore } from "../state/useStore";
import {
  Filter,
  Calendar,
  Flag,
  Tag,
  List,
  Clock,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from "lucide-react";

export default function TodoFilters() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    search: "",
    sortBy: "dueDate",
    order: "asc"
  });

  const { setTodoFilter } = useStore();

  const statusOptions = [
    { value: "all", label: "All Status", icon: List },
    { value: "Pending", label: "Pending", icon: Clock },
    { value: "In Progress", label: "In Progress", icon: Clock },
    { value: "Completed", label: "Completed", icon: CheckCircle }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Assignment", label: "Assignment" },
    { value: "Project", label: "Project" },
    { value: "Exam", label: "Exam" },
    { value: "Meeting", label: "Meeting" },
    { value: "Personal", label: "Personal" },
    { value: "Other", label: "Other" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "High", label: "High", color: "text-red-600" },
    { value: "Medium", label: "Medium", color: "text-yellow-600" },
    { value: "Low", label: "Low", color: "text-green-600" }
  ];

  const sortByOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "createdAt", label: "Created Date" },
    { value: "title", label: "Title" }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setTodoFilter(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "all",
      category: "all",
      priority: "all",
      search: "",
      sortBy: "dueDate",
      order: "asc"
    };
    setFilters(resetFilters);
    setTodoFilter(resetFilters);
  };

  const hasActiveFilters = filters.status !== "all" || 
                         filters.category !== "all" || 
                         filters.priority !== "all" || 
                         filters.search !== "";

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search tasks, descriptions, or tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sortByOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange("sortBy", option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.sortBy === option.value
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange("order", "asc")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filters.order === "asc"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Ascending
              </button>
              <button
                onClick={() => handleFilterChange("order", "desc")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filters.order === "desc"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Descending
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Active Filters:</span>
            <button
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status !== "all" && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Status: {filters.status}
              </span>
            )}
            {filters.category !== "all" && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Category: {filters.category}
              </span>
            )}
            {filters.priority !== "all" && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Priority: {filters.priority}
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Search: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}