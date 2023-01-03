<?php
if(isset($_POST['submit']) AND $_POST['name']!='' AND $_POST['email'] !='' AND $_POST['phone']!='' AND $_POST['query']!='') { 
$name=$_POST['name'];
$email=$_POST['email'];
$phone=$_POST['phone'];
$query=$_POST['query'];
		 
$message1 = "<strong>You have received a new message</strong>";
$message1 .= "<br>";
$message1 .= "<br>";
$message1 .= "<strong>Name :</strong>  $name";
$message1 .= "<br>";
$message1 .= "<br>";
$message1 .= "<strong>Email :</strong>  $email";
$message1 .= "<br>";
$message1 .= "<br>";
$message1 .= "<strong>Phone No :</strong>  $phone";
$message1 .= "<br>";
$message1 .= "<br>";
$message1 .= "<strong>Message :</strong>  $query";

			
$Subject="Wikreate | Enquiry From VENKATESHWAR HOSPITAL/Afghanistan";
$email1="care@venkateshwarhospitals.com";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=iso-8859-1" . "\r\n";
$headers .= "From: $email'.  \r\n";
$headers .= "BCC: mani.s@wikreatemedia.com, hello@wikreate.in";
$res= mail($email1,$Subject,$message1,$headers);

$url='index.php';
if($res!='')
{
print "<script>";
print "alert('Your request has been received, we will revert you soon !')";
print "</script>";
echo '<script type="text/javascript">';
      echo 'window.location.href="'.$url.'";';
	  echo '</script>';
 
}

else
{
print "<script>";
print "alert('Something wrong with you try again !')";
print "</script>";

echo '<script type="text/javascript">';
      echo 'window.location.href="'.$url.'";';
	  echo '</script>';
       
	  

}
} else {
	$url='index.php';
print "<script>";
print "alert('All the field is maindotary try again !')";
print "</script>";

echo '<script type="text/javascript">';
      echo 'window.location.href="'.$url.'";';
	  echo '</script>';
}
?>

