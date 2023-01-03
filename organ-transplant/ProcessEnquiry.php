<?php
//echo $_POST["caution"];
if($_POST && isset($_FILES['file']))
{   

     
	
	$recipient_email="care@venkateshwarhospitals.com"; 
	
	$from_email= "care@venkateshwarhospitals.com"; //from email using site domain.
    $subject= "Wikreate | Enquiry From VENKATESHWAR HOSPITAL/Organ Transplant/Afghanistan"; //email subject line
    
   if((strpos($_POST["name"], 'http://') !==false) OR (strpos($_POST["name"], 'https://') !==false) OR (strpos($_POST["name"], 'www.') !==false)    OR (strpos($_POST["name"], '?') !==false)   OR (strpos($_POST["name"], 'Ù') !==false) OR (strpos($_POST["name"], 'Ø') !==false)  OR (strpos($_POST["name"], '‡') !==false)  OR (strpos($_POST["name"], 'ƒ') !==false)) {
echo "<script>alert('Not Allowed.')</script>";
echo "<script>window.location = 'index.php'</script>";
exit; // die well
} else {
$sender_name = filter_var($_POST["name"], FILTER_SANITIZE_STRING); 

} 
    $sender_email = filter_var($_POST["email"], FILTER_SANITIZE_STRING); //capture sender email
	$sender_phone = filter_var($_POST["phone"], FILTER_SANITIZE_STRING);
	$gender = filter_var($_POST["gender"], FILTER_SANITIZE_STRING);
	 
	$age = filter_var($_POST["age"], FILTER_SANITIZE_STRING);
	$phone1 = filter_var($_POST["phone1"], FILTER_SANITIZE_STRING);
	$city = filter_var($_POST["city"], FILTER_SANITIZE_STRING);
	
	$traveller = filter_var($_POST["traveller"], FILTER_SANITIZE_STRING);
	$stay = filter_var($_POST["stay"], FILTER_SANITIZE_STRING);
	 
   if((strpos($_POST['query'], 'http://') !==false) OR (strpos($_POST['query'], 'https://') !==false) OR (strpos($_POST['query'], 'www.') !==false)    OR (strpos($_POST['query'], '?') !==false)   OR (strpos($_POST['query'], 'Ù') !==false) OR (strpos($_POST['query'], 'Ø') !==false)  OR (strpos($_POST['query'], '‡') !==false)  OR (strpos($_POST['query'], 'ƒ') !==false)) {
echo "<script>alert('Not Allowed.')</script>";
echo "<script>window.location = 'index.php'</script>";
exit; // die well
} else {
$msg=filter_var($_POST["query"], FILTER_SANITIZE_STRING); 

} 
 
	$sender_message = "<strong>You have received a new message</strong>";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	$sender_message .= "<strong>Name :</strong>  $sender_name";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	$sender_message .= "<strong>Email :</strong>  $sender_email";
	$sender_message .= "<br>";
	$sender_message .= "<br>";

	$sender_message .= "<strong>Phone No :</strong>  $sender_phone";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	$sender_message .= "<strong>Gender :</strong>  $gender";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	 $sender_message .= "<strong>Age :</strong>  $age";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	$sender_message .= "<strong>Secondary phone:</strong>  $phone1";
	$sender_message .= "<br>";
	$sender_message .= "<br>";
	$sender_message .= "<strong>City:</strong>  $city";
	$sender_message .= "<br>";
	$sender_message .= "<br>"; 
		$sender_message .= "<strong>Traveller:</strong>  $traveller";
	$sender_message .= "<br>";
	$sender_message .= "<br>"; 
		$sender_message .= "<strong>Hotel Stay Required :</strong>  $stay";
	$sender_message .= "<br>";
	$sender_message .= "<br>"; 

	$sender_message .= "<strong>Query :</strong>  $msg";

    $attachments = $_FILES['file'];
    
    //php validation
    if(strlen($sender_name)<4){
	print "<script>";
	print "alert('Name is too short or empty')";
	print "</script>";

	echo '<script type="text/javascript">';
	echo 'window.location.href="index.php";';
	echo '</script>';
        
    }
    if (!filter_var($sender_email, FILTER_VALIDATE_EMAIL)) {
    print "<script>";
	print "alert('Email id can not be empty')";
	print "</script>";

	echo '<script type="text/javascript">';
	echo 'window.location.href="index.php";';
	echo '</script>';
    }
	if (!filter_var($sender_phone)) {
    print "<script>";
	print "alert('Phone no can not be empty')";
	print "</script>";

	echo '<script type="text/javascript">';
	echo 'window.location.href="index.php";';
	echo '</script>';
    }
    if(strlen($sender_message)<4){
        die('Too short message! Please enter something');
    }
    
    $file_count = count($attachments['name']); //count total files attached
    $boundary = md5("sanwebe.com"); 
            
    if($file_count > 0){ //if attachment exists
        //header
        $headers = "MIME-Version: 1.0\r\n"; 
        $headers .= "From:".$from_email."\r\n"; 
        $headers .= "BCC: mani.s@wikreatemedia.com, hello@wikreate.in\r\n"; 
        $headers .= "Reply-To: ".$sender_email."" . "\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary = $boundary\r\n\r\n"; 
        
        //message text
        $body = "--$boundary\r\n";
		$body .= "Content-type:text/html;charset=iso-8859-1" . "\r\n";
       // $body .= "Content-Type: text/plain; charset=ISO-8859-1\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n"; 
        $body .= chunk_split(base64_encode($sender_message)); 

        //attachments
        for ($x = 0; $x < $file_count; $x++){       
            if(!empty($attachments['name'][$x])){
                
                if($attachments['error'][$x]>0) //exit script and output error if we encounter any
                {
                    $mymsg = array( 
                    1=>"The uploaded file exceeds the upload_max_filesize directive in php.ini", 
                    2=>"The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form", 
                    3=>"The uploaded file was only partially uploaded", 
                    4=>"No file was uploaded", 
                    6=>"Missing a temporary folder" ); 
                    die($mymsg[$attachments['error'][$x]]); 
                }
                
                //get file info
                $file_name = $attachments['name'][$x];
                $file_size = $attachments['size'][$x];
                $file_type = $attachments['type'][$x];
                
                //read file 
                $handle = fopen($attachments['tmp_name'][$x], "r");
                $content = fread($handle, $file_size);
                fclose($handle);
                $encoded_content = chunk_split(base64_encode($content)); //split into smaller chunks (RFC 2045)
                
                $body .= "--$boundary\r\n";
                $body .="Content-Type: $file_type; name=" . $file_name ."\r\n";
                $body .="Content-Disposition: attachment; filename=" . $file_name ."\r\n";
                $body .="Content-Transfer-Encoding: base64\r\n";
                $body .="X-Attachment-Id: ".rand(1000,99999)."\r\n\r\n"; 
                $body .= $encoded_content; 
            }
        }

    }else{ //send plain email otherwise
       $headers = "From:".$from_email."\r\n".
        "Reply-To: ".$sender_email. "\n" .
        "X-Mailer: PHP/" . phpversion();
        $body = $sender_message;
    }
        
     $sentMail = mail($recipient_email, $subject, $body, $headers);
    if($sentMail) //output success or failure messages
    {     
    /* print "<script>";
	print "alert('Thank you for your enquiry, we will revert you soon.. !')";
	print "</script>"; */ 
	echo '<script type="text/javascript">';
    echo 'window.location.href="thankyou.php";';
	echo '</script>';
	$authKey = "223656A0D8dwaNDK5b39aaf1";
	$txtphone="$sender_phone";
	$encodedMessage=urlencode("Thank you for choosing Venkateshwar Hospital, India as your preferred healthcare destination. Our Patient Care Team will be responding to your query within 24 hours.");
	$senderId='VNKHTL';
	$api = "https://control.msg91.com/sendhttp.php?authkey=".$authKey."&mobiles=".$txtphone."&message=".$encodedMessage . "&sender=".$senderId."&route=4";
	file($api);  

    $authKey = "223656A0D8dwaNDK5b39aaf1";
	$txtphone='9990300018';
	$encodedMessage=urlencode("Hi VNKHTL, \n Details \n Name-$sender_name \n Email-$sender_email \n Phone-$sender_phone \n Query-$msg");
	$senderId='VNKHTL';
	$api = "https://control.msg91.com/sendhttp.php?authkey=".$authKey."&mobiles=".$txtphone."&message=".$encodedMessage . "&sender=".$senderId."&route=4";
	file($api);
    /* $fileatt = "Brochure.pdf"; // Path to the file
	$fileatt_type = "application/pdf"; // File Type
	$fileatt_name = "http://www.venkateshwarhospitals.ae//Brochure.pdf"; // Filename that will be used for the file as the attachment
    
	$email_from = "Venkateshwar Hospital <care@venkateshwarhospitals.com>";
	$email_subject = "Venkateshwar Hospital | Thank You for your interest"; // The Subject of the email.
	
    $email_message = "Dear Mr./Ms. $sender_name,";
	$email_message .= "<br>";
	$email_message .= "<br>";
	$email_message .= "Thank you for choosing Venkateshwar Hospital, India as your preferred healthcare destination. Our Patient Care Team will be responding to your query within 24 hours.";
	$email_message .= "<br>";
	$email_message .= "In the meanwhile, you can go through attached brochure of Venkateshwar Hospital.";
	$email_message .= "<br>";
	$email_message .= "<br>";
	$email_message .= "Venkateshwar Hospital";
	$email_from='care@venkateshwarhospitals.com';
	$email_to = "$sender_email"; // Who the email is to

	$headers = "From: ".$email_from;

	$file = fopen($fileatt,'rb');
	$data = fread($file,filesize($fileatt));
	fclose($file);

	$semi_rand = md5(time());
	$mime_boundary = "==Multipart_Boundary_x{$semi_rand}x";

	$headers .= "\nMIME-Version: 1.0\n" .
	"Content-Type: multipart/mixed;\n" .
	" boundary=\"{$mime_boundary}\"";

	$email_message .= "This is a multi-part message in MIME format.\n\n" .
	"--{$mime_boundary}\n" .
	"Content-Type:text/html; charset=\"iso-8859-1\"\n" .
	"Content-Transfer-Encoding: 7bit\n\n" .
	$email_message .= "\n\n";

	$data = chunk_split(base64_encode($data));

	$email_message .= "--{$mime_boundary}\n" .
	"Content-Type: {$fileatt_type};\n" .
	" name=\"{$fileatt_name}\"\n" .
	"Content-Disposition: attachment;\n" .
	" filename=\"{$fileatt_name}\"\n" .
	"Content-Transfer-Encoding: base64\n\n" .
	$data .= "\n\n" .
	"--{$mime_boundary}--\n";

	$ok = @mail($email_to, $email_subject, $email_message, $headers);
	*/ 
	$message1 = '<html><body style="background-color:#ffffff; color:#000; border: 2px dashed #FB4314; padding:10px;">';
	$message1 .='Dear Mr./Ms. '.$sender_name.''; 
	$message1 .='<br>';
	$message1 .='<br>';
	$message1 .='<br>';
	$message1 .='Thank you for choosing Venkateshwar Hospital, as your preferred healthcare destination. Our Patient Care Team will be responding to your query within 24 hours.'; 
	$message1 .='<br>';
	$message1 .='<br>';
	//$message1 .='In the meanwhile, you can go through attached International brochure of Yashoda Multi-Super Speciality Hospitals.'; 
	//$message1 .='<br>';
	//$message1 .='<br>';
	$message1 .='<strong>Venkateshwar Hospital</strong>';	
	$message1 .='<br>';
	$message1 .='<br>';
	$message1 .='<br>';
	$message1 .='This e-mail and any attachments thereto, are intended only for use by the addressee(s) named herein and contain confidential information. If you are not the intended recipient of this e-mail, you are hereby notified that any dissemination, distribution or copying which amounts to misappropriation of this e-mail and any attachments thereto, is strictly prohibited. If you have received this e-mail in error, please immediately notify me and permanently delete the original and any copy of any e-mail and any printout thereof.';
	$message1 .= '</body></html>';			
	$Subject="Venkateshwar Hospital | Thank You for your interest";
	$email1="$sender_email";
	$noreplay="Venkateshwar Hospital"; 
	$headers2 = "From: 'Venkateshwar Hospital' <care@venkateshwarhospitals.com> \n";
	$headers2 .= "Reply-To: $noreplay \n";
	$headers2 .= "MIME-Version: 1.0 \n";
	$headers2 .= "Content-Type: text/html; charset=ISO-8859-1 \n";
	$res= mail($email1,$Subject,$message1,$headers2);
	 
	
    }else{
    print "<script>";
	print "alert('Something went wrong, please try again later !')";
	print "</script>";

	echo '<script type="text/javascript">';
	echo 'window.location.href="index.php";';
	echo '</script>';
	exit;
    }
}
?>
 