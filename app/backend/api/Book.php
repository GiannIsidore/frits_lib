<?php
// backend/api/Book.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

// Start or resume the session
session_start();

require '../db.php';

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['bookID'])) {
            getBookDetails($pdo, $_GET['bookID']);
        } elseif (isset($_GET['search'])) {
            searchBooks($pdo, $_GET['search']);
        } else {
            getBooks($pdo);
        }
        break;
    case 'POST':
        addBook($pdo);
        break;
    case 'PUT':
        updateBook($pdo);
        break;
    case 'DELETE':
        deleteBook($pdo);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

// Function definitions

function getBooks($pdo) {
    $stmt = $pdo->query('SELECT * FROM Book');
    $books = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'books' => $books]);
}

function getBookDetails($pdo, $bookID) {
    $stmt = $pdo->prepare('SELECT * FROM Book WHERE BookID = :bookID');
    $stmt->execute(['bookID' => $bookID]);
    $book = $stmt->fetch();

    if ($book) {
        echo json_encode(['status' => 'success', 'book' => $book]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Book not found']);
    }
}

function searchBooks($pdo, $searchQuery) {
    $query = 'SELECT * FROM Book WHERE Title LIKE :search OR Author LIKE :search OR ISBN LIKE :search';
    $stmt = $pdo->prepare($query);
    $searchTerm = '%' . $searchQuery . '%';
    $stmt->execute(['search' => $searchTerm]);
    $books = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'books' => $books]);

    // Optionally, log the search query
    logSearchQuery($pdo, $searchQuery);
}

function logSearchQuery($pdo, $searchQuery) {
    $userId = $_SESSION['user_id'] ?? null;
    $stmt = $pdo->prepare('INSERT INTO searchlog (UserID, SearchQuery) VALUES (:userID, :searchQuery)');
    $stmt->execute(['userID' => $userId, 'searchQuery' => $searchQuery]);
}

function addBook($pdo) {
    // Only Admins and Librarians can add books
    if (!isset($_SESSION['user_type']) || ($_SESSION['user_type'] !== 'Admin' && $_SESSION['user_type'] !== 'Librarian')) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $title = $data['title'] ?? '';
    $author = $data['author'] ?? '';
    $isbn = $data['isbn'] ?? '';
    $publicationDate = $data['publicationDate'] ?? '';
    $genre = $data['genre'] ?? '';
    $location = $data['location'] ?? '';
    $totalCopies = $data['totalCopies'] ?? 0;
    $providerID = $data['providerID'] ?? null;

    // Validate required fields
    if (empty($title) || empty($author) || empty($totalCopies)) {
        echo json_encode(['status' => 'error', 'message' => 'Title, author, and total copies are required']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO Book (Title, Author, ISBN, PublicationDate, Genre, Location, TotalCopies, AvailableCopies, ProviderID) VALUES (:title, :author, :isbn, :publicationDate, :genre, :location, :totalCopies, :availableCopies, :providerID)');
    $stmt->execute([
        'title' => $title,
        'author' => $author,
        'isbn' => $isbn,
        'publicationDate' => $publicationDate,
        'genre' => $genre,
        'location' => $location,
        'totalCopies' => $totalCopies,
        'availableCopies' => $totalCopies,
        'providerID' => $providerID,
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Book added successfully']);
}

function updateBook($pdo) {
    // Only Admins and Librarians can update books
    if (!isset($_SESSION['user_type']) || ($_SESSION['user_type'] !== 'Admin' && $_SESSION['user_type'] !== 'Librarian')) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    parse_str(file_get_contents('php://input'), $data);

    $bookID = $data['bookID'] ?? null;
    $title = $data['title'] ?? '';
    $author = $data['author'] ?? '';
    $isbn = $data['isbn'] ?? '';
    $publicationDate = $data['publicationDate'] ?? '';
    $genre = $data['genre'] ?? '';
    $location = $data['location'] ?? '';
    $totalCopies = $data['totalCopies'] ?? 0;
    $availableCopies = $data['availableCopies'] ?? 0;
    $providerID = $data['providerID'] ?? null;

    if (!$bookID) {
        echo json_encode(['status' => 'error', 'message' => 'Book ID is required']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE Book SET Title = :title, Author = :author, ISBN = :isbn, PublicationDate = :publicationDate, Genre = :genre, Location = :location, TotalCopies = :totalCopies, AvailableCopies = :availableCopies, ProviderID = :providerID WHERE BookID = :bookID');
    $stmt->execute([
        'title' => $title,
        'author' => $author,
        'isbn' => $isbn,
        'publicationDate' => $publicationDate,
        'genre' => $genre,
        'location' => $location,
        'totalCopies' => $totalCopies,
        'availableCopies' => $availableCopies,
        'providerID' => $providerID,
        'bookID' => $bookID,
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Book updated successfully']);
}

function deleteBook($pdo) {
    // Only Admins can delete books
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'Admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    parse_str(file_get_contents('php://input'), $data);

    $bookID = $data['bookID'] ?? null;

    if (!$bookID) {
        echo json_encode(['status' => 'error', 'message' => 'Book ID is required']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM Book WHERE BookID = :bookID');
    $stmt->execute(['bookID' => $bookID]);

    echo json_encode(['status' => 'success', 'message' => 'Book deleted successfully']);
}
?>