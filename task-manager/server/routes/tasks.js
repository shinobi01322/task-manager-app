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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
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
