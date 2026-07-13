const express = require('express');
const path = require('path');
const app = express();

const { getAllTasks, getTaskById, addTask, updateTask, deleteTask, searchTasks } = require('./db');

app.use(express.json());
// Serve static assets (css, js, images) from the project root
app.use(express.static(path.join(__dirname)));

const createId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'task_management_ui.html'));
});

app.get('/api/tasks', (req, res) => {
  getAllTasks((err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch tasks.' });
    }
    res.json(rows || []);
  });
});

app.get('/api/tasks/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q) {
    return getAllTasks((err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to fetch tasks.' });
      }
      res.json(rows || []);
    });
  }
  searchTasks(q, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to search tasks.' });
    }
    res.json(rows || []);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const normalizedPriority = ['low', 'medium', 'high'].includes((priority || '').toLowerCase())
    ? priority.toLowerCase()
    : 'medium';

  const task = {
    id: createId(),
    title: title.trim(),
    description: (description || '').trim(),
    priority: normalizedPriority,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  addTask(task, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to create task.' });
    }
    res.status(201).json(task);
  });
});

app.put('/api/tasks/:id', (req, res) => {
  getTaskById(req.params.id, (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch task.' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, description, status, priority } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim() || task.title;
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined && ['pending', 'completed'].includes(status)) {
      updates.status = status;
    }
    if (priority !== undefined && ['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      updates.priority = priority.toLowerCase();
    }

    updateTask(req.params.id, updates, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to update task.' });
      }
      const updatedTask = { ...task, ...updates };
      res.json(updatedTask);
    });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  getTaskById(req.params.id, (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch task.' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    deleteTask(req.params.id, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to delete task.' });
      }
      res.status(204).send();
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Task Management System running at http://localhost:${port}`);
});
