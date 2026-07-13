const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'intern_task_system.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database:', DB_PATH);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Tasks table initialized');
    }
  });
}

// Helper functions
function getAllTasks(callback) {
  db.all('SELECT * FROM tasks ORDER BY createdAt DESC', callback);
}

function getTaskById(id, callback) {
  db.get('SELECT * FROM tasks WHERE id = ?', [id], callback);
}

function addTask(task, callback) {
  const { id, title, description, priority, status, createdAt } = task;
  db.run(
    'INSERT INTO tasks (id, title, description, priority, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, description, priority, status, createdAt],
    callback
  );
}

function updateTask(id, updates, callback) {
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length === 0) {
    return callback(null);
  }

  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  db.run(sql, values, callback);
}

function deleteTask(id, callback) {
  db.run('DELETE FROM tasks WHERE id = ?', [id], callback);
}

function searchTasks(query, callback) {
  const searchTerm = `%${query.toLowerCase()}%`;
  db.all(
    'SELECT * FROM tasks WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? ORDER BY createdAt DESC',
    [searchTerm, searchTerm],
    callback
  );
}

module.exports = {
  db,
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  searchTasks,
};
