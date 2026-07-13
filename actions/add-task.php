<?php
header('Content-Type: application/json');
require_once '../includes/functions.php';
 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = isset($input['title']) ? $input['title'] : '';
    
    $response = addTask($title);
    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>