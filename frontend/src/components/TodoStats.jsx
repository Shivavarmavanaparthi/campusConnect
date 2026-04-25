import { useEffect } from "react";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";

export default function TodoStats({ stats }) {
  const {
    total = 0,
    completed = 0,
    pending = 0,
    inProgress = 0,
    overdue = 0,
    completionRate = 0
  } = stats || {};

  const statsData = [
    {
      title: "Total Tasks",
      value: total,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Overdue",
      value: overdue,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const getProgressColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-yellow-500";
    if (rate >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Completion Progress</h3>
            <p className="text-gray-600">Track your overall task completion rate</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
            <div className="text-sm text-gray-500">completed</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(completionRate)}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{completionRate}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Active Tasks</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{pending + inProgress}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Urgent Tasks</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{overdue}</span>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Average per Day</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(total / 7)} tasks/day
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Productivity Tips */}
      {completionRate < 50 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Productivity Tip</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your completion rate is below 50%. Try breaking larger tasks into smaller steps and focus on completing 2-3 tasks daily.
              </p>
            </div>
          </div>
        </div>
      )}

      {completionRate >= 80 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Great Work!</h3>
              <p className="text-sm text-gray-600 mt-1">
                You're maintaining an excellent completion rate. Keep up the momentum and consider setting more challenging goals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}