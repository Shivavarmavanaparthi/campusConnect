import Todo from "../models/todo.model.js";

/* ================= CREATE TODO ================= */
export const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      dueDate,
      estimatedHours,
      tags,
      checklist,
      reminders
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Title and due date are required"
      });
    }

    const todo = new Todo({
      title,
      description,
      category,
      priority,
      dueDate,
      estimatedHours,
      tags,
      checklist,
      reminders,
      author: req.user._id
    });

    await todo.save();
    
    // Populate virtuals by converting to JSON
    const todoJSON = todo.toJSON();
    
    res.status(201).json({
      message: "Todo created successfully",
      todo: todoJSON
    });
  } catch (error) {
    console.error("Create Todo Error:", error);
    res.status(500).json({
      message: error.message || "Failed to create todo"
    });
  }
};

/* ================= GET ALL TODOS ================= */
export const getTodos = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      sortBy = "dueDate",
      order = "asc",
      limit = 50,
      skip = 0
    } = req.query;

    const query = { author: req.user._id };

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const todos = await Todo.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("collaborators", "name email");

    const total = await Todo.countDocuments(query);

    // Convert to JSON to include virtuals
    const todosWithVirtuals = todos.map(todo => todo.toJSON());

    res.status(200).json({
      todos: todosWithVirtuals,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Get Todos Error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch todos"
    });
  }
};

/* ================= GET TODO BY ID ================= */
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      _id: id,
      author: req.user._id
    }).populate("collaborators", "name email");

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json({
      todo: todo.toJSON()
    });
  } catch (error) {
    console.error("Get Todo Error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch todo"
    });
  }
};

/* ================= UPDATE TODO ================= */
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.author;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Handle status change to completed
    if (updates.status === "Completed") {
      updates.completedAt = new Date();
      updates.progress = 100;
    }

    const todo = await Todo.findOneAndUpdate(
      {
        _id: id,
        author: req.user._id
      },
      {
        $set: updates,
        $setOnInsert: { createdAt: new Date() }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("collaborators", "name email");

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json({
      message: "Todo updated successfully",
      todo: todo.toJSON()
    });
  } catch (error) {
    console.error("Update Todo Error:", error);
    res.status(500).json({
      message: error.message || "Failed to update todo"
    });
  }
};

/* ================= DELETE TODO ================= */
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({
      _id: id,
      author: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully"
    });
  } catch (error) {
    console.error("Delete Todo Error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete todo"
    });
  }
};

/* ================= GET STATS ================= */
export const getStats = async (req, res) => {
  try {
    const stats = await Todo.getStats(req.user._id);
    
    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0
    };

    // Get completion percentage
    const completionRate = result.total > 0 
      ? Math.round((result.completed / result.total) * 100) 
      : 0;

    res.status(200).json({
      stats: {
        ...result,
        completionRate
      }
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch stats"
    });
  }
};

/* ================= GET UPCOMING TODOS ================= */
export const getUpcomingTodos = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const todos = await Todo.getUpcomingTasks(req.user._id, days);
    
    res.status(200).json({
      todos: todos.map(todo => todo.toJSON())
    });
  } catch (error) {
    console.error("Get Upcoming Todos Error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch upcoming todos"
    });
  }
};

/* ================= GET OVERDUE TODOS ================= */
export const getOverdueTodos = async (req, res) => {
  try {
    const todos = await Todo.getOverdueTasks(req.user._id);
    
    res.status(200).json({
      todos: todos.map(todo => todo.toJSON())
    });
  } catch (error) {
    console.error("Get Overdue Todos Error:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch overdue todos"
    });
  }
};

/* ================= UPDATE CHECKLIST ITEM ================= */
export const updateChecklistItem = async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { completed } = req.body;

    const todo = await Todo.findOne({
      _id: id,
      author: req.user._id
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    if (!todo.checklist[itemIndex]) {
      return res.status(404).json({
        message: "Checklist item not found"
      });
    }

    todo.checklist[itemIndex].completed = completed;
    todo.checklist[itemIndex].completedAt = completed ? new Date() : null;

    // Update progress based on checklist completion
    const completedItems = todo.checklist.filter(item => item.completed).length;
    const totalItems = todo.checklist.length;
    todo.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    await todo.save();

    res.status(200).json({
      message: "Checklist item updated",
      todo: todo.toJSON()
    });
  } catch (error) {
    console.error("Update Checklist Error:", error);
    res.status(500).json({
      message: error.message || "Failed to update checklist item"
    });
  }
};

/* ================= BULK UPDATE ================= */
export const bulkUpdate = async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Please provide an array of todo IDs"
      });
    }

    const result = await Todo.updateMany(
      {
        _id: { $in: ids },
        author: req.user._id
      },
      { $set: updates }
    );

    res.status(200).json({
      message: `${result.modifiedCount} todos updated successfully`
    });
  } catch (error) {
    console.error("Bulk Update Error:", error);
    res.status(500).json({
      message: error.message || "Failed to bulk update todos"
    });
  }
};

/* ================= DELETE COMPLETED ================= */
export const deleteCompleted = async (req, res) => {
  try {
    const result = await Todo.deleteMany({
      author: req.user._id,
      status: "Completed"
    });

    res.status(200).json({
      message: `${result.deletedCount} completed todos deleted`
    });
  } catch (error) {
    console.error("Delete Completed Error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete completed todos"
    });
  }
};