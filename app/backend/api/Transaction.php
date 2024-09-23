<?php
// backend/api/Transaction.php
header('Content-Type: application/json');

// Include the database connection
require_once '../db.php';

// Use the global $pdo variable
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getByUser':
        getTransactionsByUser($pdo);
        break;
    case 'borrow':
        borrowBook($pdo);
        break;
    case 'return':
        returnBook($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function getTransactionsByUser($pdo) {
    $userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;

    if (!$userId) {
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }

    $query = "SELECT t.TransactionID, t.BookID, b.Title, t.BorrowDate, t.DueDate, t.ReturnDate, t.LateFees
              FROM `transaction` t
              INNER JOIN book b ON t.BookID = b.BookID
              WHERE t.UserID = :userId";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    $transactions = $stmt->fetchAll();

    echo json_encode(['transactions' => $transactions]);
}

function borrowBook($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = intval($data['userId']);
    $bookId = intval($data['bookId']);

    // Check if the book is available
    $query = "SELECT AvailableCopies FROM book WHERE BookID = :bookId";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':bookId', $bookId);
    $stmt->execute();
    $book = $stmt->fetch();

    if (!$book || $book['AvailableCopies'] <= 0) {
        echo json_encode(['error' => 'Book is not available']);
        exit;
    }

    // Begin transaction
    $pdo->beginTransaction();
    try {
        // Insert into transaction table
        $borrowDate = date('Y-m-d');
        $dueDate = date('Y-m-d', strtotime('+14 days'));

        $insertQuery = "INSERT INTO `transaction` (UserID, BookID, BorrowDate, DueDate)
                        VALUES (:userId, :bookId, :borrowDate, :dueDate)";
        $insertStmt = $pdo->prepare($insertQuery);
        $insertStmt->bindParam(':userId', $userId);
        $insertStmt->bindParam(':bookId', $bookId);
        $insertStmt->bindParam(':borrowDate', $borrowDate);
        $insertStmt->bindParam(':dueDate', $dueDate);
        $insertStmt->execute();

        // Update available copies
        $updateQuery = "UPDATE book SET AvailableCopies = AvailableCopies - 1 WHERE BookID = :bookId";
        $updateStmt = $pdo->prepare($updateQuery);
        $updateStmt->bindParam(':bookId', $bookId);
        $updateStmt->execute();

        $pdo->commit();
        echo json_encode(['message' => 'Book borrowed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Failed to borrow book']);
    }
}

function returnBook($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $transactionId = intval($data['transactionId']);

    // Fetch transaction details
    $query = "SELECT * FROM `transaction` WHERE TransactionID = :transactionId";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':transactionId', $transactionId);
    $stmt->execute();
    $transaction = $stmt->fetch();

    if (!$transaction || $transaction['ReturnDate'] !== null) {
        echo json_encode(['error' => 'Invalid transaction']);
        exit;
    }

    // Begin transaction
    $pdo->beginTransaction();
    try {
        // Update transaction with ReturnDate and LateFees if applicable
        $returnDate = date('Y-m-d');
        $lateFees = 0;
        if (strtotime($returnDate) > strtotime($transaction['DueDate'])) {
            $daysLate = (strtotime($returnDate) - strtotime($transaction['DueDate'])) / (60 * 60 * 24);
            $lateFees = $daysLate * 1.00; // Assuming $1 per day late fee
        }

        $updateTransactionQuery = "UPDATE `transaction`
                                   SET ReturnDate = :returnDate, LateFees = :lateFees
                                   WHERE TransactionID = :transactionId";
        $updateStmt = $pdo->prepare($updateTransactionQuery);
        $updateStmt->bindParam(':returnDate', $returnDate);
        $updateStmt->bindParam(':lateFees', $lateFees);
        $updateStmt->bindParam(':transactionId', $transactionId);
        $updateStmt->execute();

        // Update available copies
        $updateBookQuery = "UPDATE book SET AvailableCopies = AvailableCopies + 1 WHERE BookID = :bookId";
        $updateBookStmt = $pdo->prepare($updateBookQuery);
        $updateBookStmt->bindParam(':bookId', $transaction['BookID']);
        $updateBookStmt->execute();

        $pdo->commit();
        echo json_encode(['message' => 'Book returned successfully', 'lateFees' => $lateFees]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Failed to return book']);
    }
}
?>