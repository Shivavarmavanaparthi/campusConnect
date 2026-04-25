import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    category: {
      type: String,
      enum: ["Assignment", "Project", "Exam", "Meeting", "Personal", "Other"],
      default: "Other"
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    estimatedHours: {
      type: Number,
      min: [0, "Estimated hours must be positive"],
      max: [168, "Estimated hours cannot exceed 168 hours (1 week)"]
    },
    actualHours: {
      type: Number,
      min: [0, "Actual hours must be positive"],
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [20, "Tag cannot exceed 20 characters"]
    }],
    attachments: [{
      filename: String,
      url: String,
      type: String
    }],
    reminders: [{
      time: Date,
      type: {
        type: String,
        enum: ["email", "push", "both"],
        default: "push"
      }
    }],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrenceRule: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    progress: {
      type: Number,
      min: [0, "Progress must be between 0 and 100"],
      max: [100, "Progress must be between 0 and 100"],
      default: 0
    },
    checklist: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date,
        default: null
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for days remaining
todoSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for urgency score
todoSchema.virtual('urgencyScore').get(function() {
  const daysRemaining = this.daysRemaining;
  let score = 0;
  
  if (this.priority === 'High') score += 3;
  else if (this.priority === 'Medium') score += 2;
  else score += 1;
  
  if (daysRemaining <= 1) score += 3;
  else if (daysRemaining <= 3) score += 2;
  else if (daysRemaining <= 7) score += 1;
  
  if (this.isOverdue) score += 5;
  
  return score;
});

// Indexes for performance
todoSchema.index({ author: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ status: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ category: 1 });
todoSchema.index({ createdAt: -1 });
todoSchema.index({ author: 1, dueDate: 1 });
todoSchema.index({ author: 1, status: 1 });

// Static methods
todoSchema.statics.getUpcomingTasks = function(userId, days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    author: userId,
    status: { $ne: 'Completed' },
    dueDate: { $gte: now, $lte: futureDate }
  }).sort({ dueDate: 1, priority: -1 });
};

todoSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    author: userId,
    status: { $ne: 'Completed' },
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

todoSchema.statics.getStats = function(userId) {
  return this.aggregate([
    {
      $match: { author: userId }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'Completed'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;