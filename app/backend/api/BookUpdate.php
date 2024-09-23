<?php
// backend/api/BookUpdate.php
header('Content-Type: application/json');
require_once '../db.php';
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getAll':
        getAllBookUpdates($pdo);
        break;
    case 'updateStatus':
        updateBookUpdateStatus($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function getAllBookUpdates($pdo) {
    $query = "SELECT bu.UpdateID, bu.BookID, b.Title, bu.RequestDate, bu.Status, bu.Description
              FROM bookupdate bu
              INNER JOIN book b ON bu.BookID = b.BookID
              ORDER BY bu.RequestDate DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $bookUpdates = $stmt->fetchAll();

    echo json_encode(['bookUpdates' => $bookUpdates]);
}

function updateBookUpdateStatus($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $updateId = intval($data['updateId']);
    $status = $data['status'];

    $allowedStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!in_array($status, $allowedStatuses)) {
        echo json_encode(['error' => 'Invalid status']);
        exit;
    }

    $updateQuery = "UPDATE bookupdate SET Status = :status WHERE UpdateID = :updateId";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':updateId', $updateId);
    $stmt->execute();

    echo json_encode(['message' => 'Book update status changed']);
}
?>