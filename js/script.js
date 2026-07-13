const apiRoot = '/api/tasks';
const taskListEl = document.getElementById('task-list');
const statusMessageEl = document.getElementById('status-message');
const searchInput = document.getElementById('search-text');
let tasksCache = [];

async function loadTasks() {
  setLoading(true);
  try {
    const response = await fetch(apiRoot);
    tasksCache = await response.json();
    renderTasks(tasksCache);
  } catch (e) {
    showMessage('Unable to load tasks.', 'error');
  } finally {
    setLoading(false);
  }
}

function filterTasks(query = '') {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    renderTasks(tasksCache);
    return;
  }

  const filtered = tasksCache.filter((task) => task.title.toLowerCase().includes(normalized));
  renderTasks(filtered);
}

async function addTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const priority = document.getElementById('task-priority').value;

  if (!title) {
    showMessage('Title is required.', 'error');
    return;
  }

  if (title.length < 3) {
    showMessage('Title must be at least 3 characters.', 'error');
    return;
  }

  if (!description) {
    showMessage('Description is required.', 'error');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(apiRoot, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority }),
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.error || 'Unable to add task.', 'error');
      return;
    }

    document.getElementById('task-form').reset();
    showMessage('Task added successfully.', 'success');
    await loadTasks();
  } catch (e) {
    showMessage('Unable to add task.', 'error');
  } finally {
    setLoading(false);
  }
}

async function updateTaskStatus(id, status) {
  const response = await fetch(`${apiRoot}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (response.ok) {
    showMessage('Task status updated.', 'success');
    await loadTasks();
  } else {
    showMessage('Unable to update task status.', 'error');
  }
}

async function deleteTask(id) {
  setLoading(true);
  try {
    const response = await fetch(`${apiRoot}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      showMessage('Task deleted.', 'success');
      await loadTasks();
    } else {
      showMessage('Unable to delete task.', 'error');
    }
  } catch (e) {
    showMessage('Unable to delete task.', 'error');
  } finally {
    setLoading(false);
  }
}

function renderTasks(tasks) {
  if (!tasks.length) {
    taskListEl.innerHTML = '<p>No tasks found. Add a task to get started.</p>';
    return;
  }

  const rows = tasks
    .map((task) => {
      const statusClass = task.status === 'completed' ? 'status-completed' : 'status-pending';
      const toggleText = task.status === 'completed' ? 'Mark Pending' : 'Mark Complete';

      return `
            <tr>
              <td><strong>${escapeHtml(task.title)}</strong><div>${escapeHtml(task.description)}</div></td>
              <td><span class="status-pill ${statusClass}">${task.status}</span></td>
              <td><span class="priority-pill priority-${(task.priority || 'medium')}">${escapeHtml((task.priority || 'medium').toUpperCase())}</span></td>
              <td>${new Date(task.createdAt).toLocaleString()}</td>
              <td>
                <div class="task-actions">
                  <button class="action-button action-button-toggle" onclick="updateTaskStatus('${task.id}', '${task.status === 'completed' ? 'pending' : 'completed'}')">${toggleText}</button>
                  <button class="action-button action-button-delete" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
              </td>
            </tr>
          `;
    })
    .join('');

  taskListEl.innerHTML = `
        <table class="task-table">
          <thead>
            <tr>
              <th>Task</th>
                      <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
}

function showMessage(text, type) {
  statusMessageEl.innerHTML = `<div class="message ${type}">${escapeHtml(text)}</div>`;
  setTimeout(() => {
    statusMessageEl.innerHTML = '';
  }, 2700);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  filterTasks(searchInput.value);
});
searchInput.addEventListener('input', () => filterTasks(searchInput.value));

loadTasks();

function setLoading(active) {
  const loader = document.getElementById('loading-indicator');
  const addBtn = document.getElementById('add-button');
  const search = document.getElementById('search-text');
  if (active) {
    if (loader) loader.style.display = 'inline-flex';
    if (addBtn) addBtn.disabled = true;
    if (search) search.disabled = true;
  } else {
    if (loader) loader.style.display = 'none';
    if (addBtn) addBtn.disabled = false;
    if (search) search.disabled = false;
  }
}
