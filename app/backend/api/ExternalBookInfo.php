<?php
// backend/api/ExternalBookInfo.php
header('Content-Type: application/json');
require_once '../db.php';
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getAll':
        getAllExternalBookInfo($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function getAllExternalBookInfo($pdo) {
    $query = "SELECT e.ExternalID, e.BookID, b.Title, e.ExternalSource, e.AdditionalInfo, e.LastUpdated
              FROM externalbookinfo e
              INNER JOIN book b ON e.BookID = b.BookID
              ORDER BY e.LastUpdated DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $externalInfos = $stmt->fetchAll();

    echo json_encode(['externalInfos' => $externalInfos]);
}
?>