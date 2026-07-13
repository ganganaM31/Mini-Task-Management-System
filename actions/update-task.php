<?php
header('Content-Type: application/json');
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Task ID is required']);
        exit;
    }
    
    $id = intval($input['id']);
    
    // If only toggling completion status
    if (isset($input['toggle']) && $input['toggle'] === true) {
        $response = toggleTask($id);
    } else {
        // Full update with title and status
        $title = isset($input['title']) ? $input['title'] : '';
        $completed = isset($input['completed']) ? (bool)$input['completed'] : false;
        $response = updateTask($id, $title, $completed);
    }
    
    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>