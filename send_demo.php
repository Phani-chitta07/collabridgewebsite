<?php
// filepath: smtp_send.php
 
// If using Composer autoload:
require 'vendor/autoload.php';
 
// Alternatively, include manually:
// require 'path/to/PHPMailer/src/Exception.php';
// require 'path/to/PHPMailer/src/PHPMailer.php';
// require 'path/to/PHPMailer/src/SMTP.php';
 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
 
// Create a new instance of PHPMailer
$mail = new PHPMailer(true);
 
try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.email.us-ashburn-1.oci.oraclecloud.com';         // Replace with your SMTP server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'ocid1.user.oc1..aaaaaaaa26rs6lmu6mwpkgiv2mpynim6djvhgiejt7r4msw32e7km4pujrca@ocid1.tenancy.oc1..aaaaaaaadn7fclhuriqtc7awuqvmx3hgic7q5ke4robpsvv2z7zov7sv3gza.1w.com';  // Your SMTP username
    $mail->Password   = 'o>csolR:C;c]SnbsDC1;';                 // Your SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;       // Use 'ssl' or PHPMailer::ENCRYPTION_STARTTLS (for TLS)
    $mail->Port       = 465;                             // 465 for SSL or 587 for TLS
 
    // Recipients
    $mail->setFrom('from@yourdomain.com', 'Collabridge Demo');
    $mail->addAddress('info@collabridge.com');          // Add a recipient
 
    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'New Demo Request';
   
    // Retrieve form data
    $firstName    = $_POST['first_name'] ?? 'No Name';
    $lastName     = $_POST['last_name'] ?? '';
    $emailAddress = $_POST['email'] ?? 'info@collabridge.com';
    $phone        = $_POST['phone'] ?? '';
    $requirements = $_POST['requirements'] ?? '';
   
    $body  = "<h3>New Demo Request</h3>";
    $body .= "<p><strong>Name:</strong> $firstName $lastName</p>";
    $body .= "<p><strong>Email:</strong> $emailAddress</p>";
    $body .= "<p><strong>Phone:</strong> $phone</p>";
    $body .= "<p><strong>Requirements:</strong><br>$requirements</p>";
   
    $mail->Body = $body;
   
    $mail->send();
    echo 'Message has been sent successfully!';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>