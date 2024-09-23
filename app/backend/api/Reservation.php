<?php
// backend/api/Reservation.php
header('Content-Type: application/json');
require_once '../db.php';
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getByUser':
        getReservationsByUser($pdo);
        break;
    case 'reserve':
        reserveBook($pdo);
        break;
    case 'cancel':
        cancelReservation($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}
function getReservationsByUser($db) {
    $userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;

    if (!$userId) {
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }

    $query = "SELECT r.ReservationID, r.BookID, b.Title, r.ReservationDate, r.ExpirationDate, r.Status
              FROM reservation r
              INNER JOIN book b ON r.BookID = b.BookID
              WHERE r.UserID = :userId";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    $reservations = $stmt->fetchAll();

    echo json_encode(['reservations' => $reservations]);
}

function reserveBook($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = intval($data['userId']);
    $bookId = intval($data['bookId']);

    // Check if the user already has an active reservation for this book
    $checkQuery = "SELECT * FROM reservation
                   WHERE UserID = :userId AND BookID = :bookId AND Status = 'Active'";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':userId', $userId);
    $checkStmt->bindParam(':bookId', $bookId);
    $checkStmt->execute();
    $existingReservation = $checkStmt->fetch();

    if ($existingReservation) {
        echo json_encode(['error' => 'You already have an active reservation for this book']);
        exit;
    }

    // Create reservation
    $reservationDate = date('Y-m-d');
    $expirationDate = date('Y-m-d', strtotime('+7 days'));

    $insertQuery = "INSERT INTO reservation (UserID, BookID, ReservationDate, ExpirationDate, Status)
                    VALUES (:userId, :bookId, :reservationDate, :expirationDate, 'Active')";
    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->bindParam(':userId', $userId);
    $insertStmt->bindParam(':bookId', $bookId);
    $insertStmt->bindParam(':reservationDate', $reservationDate);
    $insertStmt->bindParam(':expirationDate', $expirationDate);
    $insertStmt->execute();

    echo json_encode(['message' => 'Book reserved successfully']);
}

function cancelReservation($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $reservationId = intval($data['reservationId']);

    $updateQuery = "UPDATE reservation SET Status = 'Cancelled' WHERE ReservationID = :reservationId";
    $stmt = $db->prepare($updateQuery);
    $stmt->bindParam(':reservationId', $reservationId);
    $stmt->execute();

    echo json_encode(['message' => 'Reservation cancelled']);
}
?>