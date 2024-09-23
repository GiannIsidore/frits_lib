<?php
// backend/api/Report.php
header('Content-Type: application/json');
require_once '../db.php';
global $pdo;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'getAll':
        getAllReports($pdo);
        break;
    case 'generate':
        generateReport($pdo);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

function getAllReports($pdo) {
    $query = "SELECT ReportID, Title, Description, CreatedDate, ReportType FROM report ORDER BY CreatedDate DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $reports = $stmt->fetchAll();

    echo json_encode(['reports' => $reports]);
}

function generateReport($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $reportType = $data['reportType'];
    $title = $data['title'];
    $description = $data['description'];

    $insertQuery = "INSERT INTO report (Title, Description, ReportType)
                    VALUES (:title, :description, :reportType)";
    $stmt = $pdo->prepare($insertQuery);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':reportType', $reportType);
    $stmt->execute();

    echo json_encode(['message' => 'Report generated successfully']);
}
?>