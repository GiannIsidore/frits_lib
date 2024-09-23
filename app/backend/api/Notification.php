<?php
// backend/api/Notification.php
header('Content-Type: application/json');
require_once '../db.php';
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getByUser':
        getNotificationsByUser($pdo);
        break;
    case 'markAsRead':
        markNotificationAsRead($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function getNotificationsByUser($pdo) {
    $userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;

    if (!$userId) {
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }

    $query = "SELECT NotificationID, Message, CreatedDate, Type, Status
              FROM notification
              WHERE UserID = :userId
              ORDER BY CreatedDate DESC";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    $notifications = $stmt->fetchAll();

    echo json_encode(['notifications' => $notifications]);
}

function markNotificationAsRead($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $notificationId = intval($data['notificationId']);

    $updateQuery = "UPDATE notification SET Status = 'Read' WHERE NotificationID = :notificationId";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->bindParam(':notificationId', $notificationId);
    $stmt->execute();

    echo json_encode(['message' => 'Notification marked as read']);
}
?>