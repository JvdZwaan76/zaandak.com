<?php
/**
 * Contact Form Handler - Zaandak.com
 * Handles contact form submissions with security and validation
 * Version: 2.0
 */

// Start session for CSRF protection (optional but recommended)
session_start();

// Enable error reporting for development (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Set response header
header('Content-Type: application/json');

// Configuration
$to_email = "info@zaandak.nl"; // ✅ VERIFY THIS EMAIL IS CORRECT AND MONITORED
$from_email = "noreply@zaandak.nl"; // Should be from your domain
$subject_prefix = "Nieuwe Offerte Aanvraag - Zaandak.com";

// Rate limiting (simple file-based)
$rate_limit_file = sys_get_temp_dir() . '/contact_rate_limit_' . md5($_SERVER['REMOTE_ADDR']);
$rate_limit_time = 60; // seconds between submissions from same IP
$max_attempts = 3; // max attempts per hour

/**
 * Send JSON response and exit
 */
function sendResponse($success, $message, $errors = []) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'errors' => $errors
    ]);
    exit;
}

/**
 * Sanitize input data
 */
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validate email format
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number (Dutch format)
 */
function isValidPhone($phone) {
    // Remove spaces, dashes, etc.
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    // Must be at least 10 digits
    return strlen($phone) >= 10;
}

/**
 * Check rate limiting
 */
function checkRateLimit() {
    global $rate_limit_file, $rate_limit_time, $max_attempts;
    
    if (file_exists($rate_limit_file)) {
        $data = json_decode(file_get_contents($rate_limit_file), true);
        $last_time = $data['last_time'] ?? 0;
        $attempts = $data['attempts'] ?? 0;
        
        // Check if within rate limit window
        if (time() - $last_time < 3600) { // 1 hour window
            if ($attempts >= $max_attempts) {
                sendResponse(false, 'Te veel aanvragen. Probeer het later opnieuw of bel ons direct.');
            }
            
            // Check if too soon since last attempt
            if (time() - $last_time < $rate_limit_time) {
                sendResponse(false, 'Wacht even voordat u opnieuw verzendt.');
            }
            
            $attempts++;
        } else {
            $attempts = 1;
        }
        
        // Update rate limit file
        file_put_contents($rate_limit_file, json_encode([
            'last_time' => time(),
            'attempts' => $attempts
        ]));
    } else {
        // Create rate limit file
        file_put_contents($rate_limit_file, json_encode([
            'last_time' => time(),
            'attempts' => 1
        ]));
    }
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Ongeldige aanvraag methode.');
}

// Check rate limiting
checkRateLimit();

// CSRF Token validation (optional - uncomment if you add tokens to form)
/*
if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || 
    $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    sendResponse(false, 'Beveiligingsvalidatie mislukt. Vernieuw de pagina en probeer opnieuw.');
}
*/

// Collect and sanitize form data
$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
$service = isset($_POST['service']) ? sanitize($_POST['service']) : 'Niet gespecificeerd';
$message = isset($_POST['message']) ? sanitize($_POST['message']) : '';

// Validation array
$errors = [];

// Validate required fields
if (empty($name)) {
    $errors['name'] = 'Naam is verplicht';
}

if (empty($email)) {
    $errors['email'] = 'Email is verplicht';
} elseif (!isValidEmail($email)) {
    $errors['email'] = 'Ongeldig email adres';
}

if (empty($phone)) {
    $errors['phone'] = 'Telefoonnummer is verplicht';
} elseif (!isValidPhone($phone)) {
    $errors['phone'] = 'Ongeldig telefoonnummer';
}

if (empty($message)) {
    $errors['message'] = 'Bericht is verplicht';
} elseif (strlen($message) < 10) {
    $errors['message'] = 'Bericht moet minimaal 10 karakters bevatten';
}

// Check for validation errors
if (!empty($errors)) {
    sendResponse(false, 'Vul alle verplichte velden correct in.', $errors);
}

// Honeypot check (add a hidden field in HTML named "website" - bots will fill it)
if (!empty($_POST['website'])) {
    // Likely a bot - silently fail
    sendResponse(true, 'Bedankt! Uw bericht is verzonden.');
}

// Service name mapping
$service_names = [
    'bitumen' => 'Bitumen Dakbedekking',
    'dakpannen' => 'Dakpannen Vervangen',
    'zinkwerk' => 'Zinkwerk',
    'loodwerk' => 'Loodwerk',
    'nokvorst' => 'Nokvorst Herstel',
    'dakisolatie' => 'Dakisolatie',
    'inspectie' => 'Dakinspectie',
    'reparatie' => 'Dakreparatie',
    'onderhoud' => 'Dakonderhoud',
    'anders' => 'Anders'
];

$service_display = isset($service_names[$service]) ? $service_names[$service] : $service;

// Build email message
$email_subject = $subject_prefix . " - " . $service_display;

$email_body = "Nieuwe offerte aanvraag via zaandak.com\n\n";
$email_body .= "========================================\n\n";
$email_body .= "KLANTGEGEVENS:\n";
$email_body .= "Naam: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Telefoon: " . $phone . "\n";
$email_body .= "Dienst: " . $service_display . "\n\n";
$email_body .= "========================================\n\n";
$email_body .= "BERICHT:\n";
$email_body .= $message . "\n\n";
$email_body .= "========================================\n\n";
$email_body .= "Verzonden op: " . date('d-m-Y H:i:s') . "\n";
$email_body .= "IP adres: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";

// Email headers
$headers = [];
$headers[] = "From: " . $from_email;
$headers[] = "Reply-To: " . $email;
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// Send email
$mail_sent = mail($to_email, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Success
    sendResponse(true, 'Bedankt voor uw aanvraag! We nemen binnen 24 uur contact met u op.');
} else {
    // Email failed - log error and return generic message
    error_log("Contact form mail() failed for: " . $email);
    sendResponse(false, 'Er is iets misgegaan bij het verzenden. Probeer het later opnieuw of bel ons direct op +31 (06) 23313469.');
}
?>
