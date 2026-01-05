<?php
/**
 * Contact Form Handler for Zaandak.com
 * Sends form submissions to info@zaandak.nl
 */

// Enable error reporting for debugging (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Set response header
header('Content-Type: application/json');

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Check if form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get and sanitize form data
    $name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
    $email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
    $service = isset($_POST['service']) ? sanitize_input($_POST['service']) : 'Niet gespecificeerd';
    $message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';
    
    // Validation
    $errors = [];
    
    if (empty($name)) {
        $errors[] = "Naam is verplicht";
    }
    
    if (empty($email)) {
        $errors[] = "Email is verplicht";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Ongeldig email adres";
    }
    
    if (empty($phone)) {
        $errors[] = "Telefoon is verplicht";
    }
    
    if (empty($message)) {
        $errors[] = "Bericht is verplicht";
    }
    
    // Check for errors
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => 'Validatie fouten',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Email configuration
    $to = "info@zaandak.nl";
    $subject = "Nieuwe offerte aanvraag via zaandak.com";
    
    // Service name mapping
    $service_names = [
        'dakpannen' => 'Dakpannen vervangen',
        'bitumen' => 'Bitumen dakbedekking',
        'loodwerk' => 'Loodwerk',
        'nokvorst' => 'Nokvorst herstel',
        'isolatie' => 'Dakisolatie',
        'zinkwerk' => 'Zinkwerk',
        'anders' => 'Anders'
    ];
    
    $service_display = isset($service_names[$service]) ? $service_names[$service] : $service;
    
    // Email body (HTML)
    $email_body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a2332; color: #fff; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1a2332; margin-bottom: 5px; }
            .value { padding: 10px; background: #fff; border-left: 3px solid #ff6b35; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Nieuwe Offerte Aanvraag</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Naam:</div>
                    <div class='value'>{$name}</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>{$email}</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Telefoon:</div>
                    <div class='value'>{$phone}</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Dienst:</div>
                    <div class='value'>{$service_display}</div>
                </div>
                
                <div class='field'>
                    <div class='label'>Bericht:</div>
                    <div class='value'>{$message}</div>
                </div>
            </div>
            <div class='footer'>
                <p>Deze aanvraag is verstuurd via het contactformulier op zaandak.com</p>
                <p>Reageer binnen 24 uur voor de beste klantenservice</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Plain text version
    $email_body_plain = "
Nieuwe Offerte Aanvraag via zaandak.com
=====================================

Naam: {$name}
Email: {$email}
Telefoon: {$phone}
Dienst: {$service_display}

Bericht:
{$message}

---
Deze aanvraag is verstuurd via het contactformulier op zaandak.com
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Website <noreply@zaandak.nl>\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    
    // Send email
    $mail_sent = mail($to, $subject, $email_body, $headers);
    
    if ($mail_sent) {
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Bedankt! Uw aanvraag is verstuurd. We nemen binnen 24 uur contact met u op.'
        ]);
        
        // Optional: Send auto-reply to customer
        $customer_subject = "Bedankt voor uw aanvraag - Zaandak";
        $customer_body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a2332; color: #fff; padding: 20px; text-align: center; }
                .content { padding: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Bedankt voor uw aanvraag!</h2>
                </div>
                <div class='content'>
                    <p>Beste {$name},</p>
                    
                    <p>Bedankt voor uw interesse in Zaandak. We hebben uw aanvraag ontvangen en nemen binnen 24 uur contact met u op.</p>
                    
                    <p><strong>Uw aanvraag:</strong></p>
                    <p>Dienst: {$service_display}<br>
                    Telefoon: {$phone}<br>
                    Email: {$email}</p>
                    
                    <p>Voor spoedeisende vragen kunt u ons direct bellen op <strong>+31 (06) 23313469</strong>.</p>
                    
                    <p>Met vriendelijke groet,<br>
                    Team Zaandak</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $customer_headers = "MIME-Version: 1.0\r\n";
        $customer_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $customer_headers .= "From: Zaandak <info@zaandak.nl>\r\n";
        $customer_headers .= "Reply-To: info@zaandak.nl\r\n";
        
        mail($email, $customer_subject, $customer_body, $customer_headers);
        
    } else {
        // Error response
        echo json_encode([
            'success' => false,
            'message' => 'Er is iets misgegaan. Probeer het opnieuw of bel ons op +31 (06) 23313469'
        ]);
    }
    
} else {
    // Not a POST request
    echo json_encode([
        'success' => false,
        'message' => 'Ongeldige aanvraag'
    ]);
}
?>
