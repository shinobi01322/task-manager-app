const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// Create a task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      deadline,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tasks for logged-in user
// GET /api/tasks - with optional filtering, searching, and sorting
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, sortBy } = req.query;

    // Start with filtering by the user
    let query = { user: req.user.id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Default sorting
    let sortOptions = {};

    if (sortBy === 'deadline') {
      sortOptions.deadline = 1; // Ascending
    } else if (sortBy === 'priority') {
      sortOptions.priority = -1; // Descending (high to low)
    } else {
      sortOptions.createdAt = -1; // Newest first
    }

    const tasks = await Task.find(query).sort(sortOptions);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, deadline, status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🗑 Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
