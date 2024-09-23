<?php
// backend/api/User.php

// CORS Headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Start or resume the session
session_start();

require '../db.php';

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Determine the action based on the request
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($method == 'POST' || $method == 'PUT') {
        switch ($action) {
            case 'login':
                login($pdo, $input);
                break;
            case 'register':
                register($pdo, $input);
                break;
            case 'updateProfile':
                updateProfile($pdo, $input);
                break;
            case 'logout':
                logout();
                break;
            default:
                sendErrorResponse('Invalid action', 400);
        }
    } elseif ($method == 'GET') {
        switch ($action) {
            case 'checkAuth':
                checkAuth($pdo);
                break;
            case 'getUser':
                getUser($pdo);
                break;
            default:
                sendErrorResponse('Invalid action', 400);
        }
    } else {
        sendErrorResponse('Invalid request method', 405);
    }
} else {
    sendErrorResponse('Action not specified', 400);
}

// Function definitions

function sendErrorResponse($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

function login($pdo, $data) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendErrorResponse('Email and password are required');
    }

    $stmt = $pdo->prepare('SELECT * FROM User WHERE Email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['Password'])) {
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['UserID'];
        $_SESSION['user_type'] = $user['UserType'];

        // Remove password from the user data before sending it to the frontend
        unset($user['Password']);

        echo json_encode(['status' => 'success', 'user' => $user]);
    } else {
        sendErrorResponse('Invalid credentials');
    }
}

function register($pdo, $data) {
    $name = $data['name'] ?? '';
    $contactInfo = $data['contactInfo'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $userType = 'Registered User';

    if (empty($name) || empty($email) || empty($password)) {
        sendErrorResponse('Name, email, and password are required');
    }

    // Check if email already exists
    $stmt = $pdo->prepare('SELECT * FROM User WHERE Email = :email');
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        sendErrorResponse('Email already exists');
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO User (Name, ContactInfo, UserType, Email, Password) VALUES (:name, :contactInfo, :userType, :email, :password)');
    $stmt->execute([
        'name' => $name,
        'contactInfo' => $contactInfo,
        'userType' => $userType,
        'email' => $email,
        'password' => $hashedPassword,
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Registration successful']);
}

function logout() {
    // Unset all session variables
    $_SESSION = [];

    // Destroy the session
    session_destroy();

    // Destroy the session cookie on the client
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
}

function checkAuth($pdo) {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare('SELECT * FROM User WHERE UserID = :userID');
        $stmt->execute(['userID' => $_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            // Remove password from the user data before sending it to the frontend
            unset($user['Password']);
            echo json_encode(['status' => 'authenticated', 'user' => $user]);
        } else {
            sendErrorResponse('User not found');
        }
    } else {
        echo json_encode(['status' => 'unauthenticated']);
    }
}

function getUser($pdo) {
    if (!isset($_SESSION['user_id'])) {
        sendErrorResponse('Unauthorized', 401);
    }

    $stmt = $pdo->prepare('SELECT * FROM User WHERE UserID = :userID');
    $stmt->execute(['userID' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        // Remove password from the user data before sending it to the frontend
        unset($user['Password']);
        echo json_encode(['status' => 'success', 'user' => $user]);
    } else {
        sendErrorResponse('User not found');
    }
}

function updateProfile($pdo, $data) {
    if (!isset($_SESSION['user_id'])) {
        sendErrorResponse('Unauthorized', 401);
    }

    $userId = $_SESSION['user_id'];
    $name = $data['name'] ?? '';
    $contactInfo = $data['contactInfo'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? ''; // Optional

    // Validate required fields
    if (empty($name) || empty($email)) {
        sendErrorResponse('Name and email are required');
    }

    // Check if email is already used by another user
    $stmt = $pdo->prepare('SELECT UserID FROM User WHERE Email = :email AND UserID != :userID');
    $stmt->execute(['email' => $email, 'userID' => $userId]);
    if ($stmt->fetch()) {
        sendErrorResponse('Email is already in use');
    }

    // Update user information
    $updateQuery = 'UPDATE User SET Name = :name, ContactInfo = :contactInfo, Email = :email';
    $params = [
        'name' => $name,
        'contactInfo' => $contactInfo,
        'email' => $email,
        'userID' => $userId,
    ];

    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $updateQuery .= ', Password = :password';
        $params['password'] = $hashedPassword;
    }

    $updateQuery .= ' WHERE UserID = :userID';
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute($params);

    // Update session email if it has changed
    if ($_SESSION['email'] !== $email) {
        $_SESSION['email'] = $email;
    }

    echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
}
?>