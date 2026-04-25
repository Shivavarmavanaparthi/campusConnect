import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  MoreVertical
} from "lucide-react";

export default function TodoCard({
  todo,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleBulkSelect,
  isBulkSelected,
  onEditTodo
}) {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Calculate progress based on checklist or status
  useEffect(() => {
    if (todo.checklist && todo.checklist.length > 0) {
      const completedItems = todo.checklist.filter(item => item.completed).length;
      const totalItems = todo.checklist.length;
      setCurrentProgress(totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);
    } else {
      // No checklist - show 0% for pending/in-progress, 100% for completed
      setCurrentProgress(todo.status === 'Completed' ? 100 : 0);
    }
  }, [todo.checklist, todo.status]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActions) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActions]);

  const getPriorityBadge = (priority) => {
    const colors = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-yellow-100 text-yellow-700",
      Low: "bg-green-100 text-green-700"
    };
    return colors[priority] || colors.Low;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'In Progress':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getDaysRemaining = () => {
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = () => {
    if (todo.status === 'Completed') return false;
    return new Date() > new Date(todo.dueDate);
  };

  const daysRemaining = getDaysRemaining();
  const overdue = isOverdue();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.actions-menu')) {
      return;
    }
    onSelect();
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleMenuItemClick = (e, callback) => {
    e.stopPropagation();
    callback();
    setShowActions(false);
  };

  const handleChecklistChange = (e, index) => {
    e.stopPropagation(); // Prevent card click when checkbox is clicked
    
    if (!todo.checklist || !onEditTodo) return;

    const updatedChecklist = [...todo.checklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed: e.target.checked,
      completedAt: e.target.checked ? new Date().toISOString() : null
    };
    
    const completedItems = updatedChecklist.filter(item => item.completed).length;
    const totalItems = updatedChecklist.length;
    const newProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    onEditTodo(todo._id, {
      ...todo,
      checklist: updatedChecklist,
      progress: newProgress
    });
  };

  const showProgress = todo.checklist && todo.checklist.length > 0 || todo.progress > 0;

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
        ${todo.status === 'Completed' ? 'opacity-75' : ''}
      `}
    >
      {/* Bulk Select Checkbox */}
      <div className="absolute left-4 top-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isBulkSelected}
          onChange={onToggleBulkSelect}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Main Content */}
      <div className="p-4 pl-12">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {todo.status === 'Completed' && (
                  <span className="line-through text-gray-500">{todo.title}</span>
                )}
                {todo.status !== 'Completed' && todo.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(todo.priority)}`}>
                {todo.priority}
              </span>
              <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusIcon(todo.status)} ${
                todo.status === 'Completed' ? 'bg-green-100 text-green-700' :
                todo.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <span>{todo.status}</span>
              </span>
            </div>

            {todo.description && (
              <p className="text-gray-600 text-sm mb-3">{todo.description}</p>
            )}

            {/* Meta Information */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDate(todo.dueDate)}</span>
              </div>

              {todo.estimatedHours && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{todo.estimatedHours}h est.</span>
                </div>
              )}

              {daysRemaining !== undefined && daysRemaining !== null && (
                <span className={`flex items-center space-x-1 ${
                  overdue ? 'text-red-600 font-medium' : 
                  daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {overdue ? (
                    <>
                      <AlertCircle size={14} />
                      <span>Overdue by {Math.abs(daysRemaining)} days</span>
                    </>
                  ) : daysRemaining === 0 ? (
                    <span>Due today</span>
                  ) : daysRemaining === 1 ? (
                    <span>1 day left</span>
                  ) : (
                    <span>{daysRemaining} days left</span>
                  )}
                </span>
              )}

              {todo.tags && todo.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag size={14} />
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{currentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist */}
            {todo.checklist && todo.checklist.length > 0 && expanded && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>Checklist</span>
                  <span className="text-gray-500">
                    {todo.checklist.filter(item => item.completed).length}/{todo.checklist.length}
                  </span>
                </div>
                {todo.checklist.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleChecklistChange(e, index)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative ml-4 actions-menu">
            <button
              onClick={handleMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={(e) => handleMenuItemClick(e, onSelect)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>View Details</span>
                </button>
                <button
                  onClick={(e) => handleMenuItemClick(e, onEdit)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => handleMenuItemClick(e, onToggleComplete)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <CheckCircle size={14} />
                  <span>{todo.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={(e) => handleMenuItemClick(e, onDelete)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expand Button */}
        {todo.checklist && todo.checklist.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="mt-4 flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                <span>Hide checklist</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Show checklist ({todo.checklist.length} items)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}