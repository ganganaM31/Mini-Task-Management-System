<?php
require_once 'db.php';

// Get all tasks
function getAllTasks() {
    global $conn;
    $sql = "SELECT * FROM todos ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $tasks = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
    }
    
    return $tasks;
}

// Get single task by ID
function getTaskById($id) {
    global $conn;
    $id = intval($id);
    $sql = "SELECT * FROM todos WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return null;
}

// Add new task
function addTask($title) {
    global $conn;
    
    // Validate input
    if (empty($title)) {
        return ['success' => false, 'message' => 'Task title cannot be empty'];
    }
    
    // Escape input to prevent SQL injection
    $title = $conn->real_escape_string(trim($title));
    
    $sql = "INSERT INTO todos (title, completed) VALUES ('$title', 0)";
    
    if ($conn->query($sql) === TRUE) {
        return [
            'success' => true,
            'message' => 'Task added successfully',
            'id' => $conn->insert_id
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Error adding task: ' . $conn->error
        ];
    }
}

// Update task
function updateTask($id, $title, $completed) {
    global $conn;
    
    $id = intval($id);
    $title = $conn->real_escape_string(trim($title));
    $completed = $completed ? 1 : 0;
    
    if (empty($title)) {
        return ['success' => false, 'message' => 'Task title cannot be empty'];
    }
    
    $sql = "UPDATE todos SET title = '$title', completed = $completed WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        return [
            'success' => true,
            'message' => 'Task updated successfully'
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Error updating task: ' . $conn->error
        ];
    }
}

// Toggle task completion status
function toggleTask($id) {
    global $conn;
    
    $id = intval($id);
    $task = getTaskById($id);
    
    if (!$task) {
        return ['success' => false, 'message' => 'Task not found'];
    }
    
    $newStatus = $task['completed'] ? 0 : 1;
    $sql = "UPDATE todos SET completed = $newStatus WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        return [
            'success' => true,
            'message' => 'Task status updated',
            'completed' => $newStatus
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Error updating task: ' . $conn->error
        ];
    }
}

// Delete task
function deleteTask($id) {
    global $conn;
    
    $id = intval($id);
    $sql = "DELETE FROM todos WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        return [
            'success' => true,
            'message' => 'Task deleted successfully'
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Error deleting task: ' . $conn->error
        ];
    }
}

// Delete all completed tasks
function deleteCompletedTasks() {
    global $conn;
    
    $sql = "DELETE FROM todos WHERE completed = 1";
    
    if ($conn->query($sql) === TRUE) {
        return [
            'success' => true,
            'message' => 'Completed tasks deleted'
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Error deleting tasks: ' . $conn->error
        ];
    }
}
?>