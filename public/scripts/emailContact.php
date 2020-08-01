<?php
    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    $firstName = $_POST["firstName"];
    $lastName = $_POST["lastName"];
    $url = $_POST['formurl'];
    $to = 'tsuik1@mail.gtc.edu';
    $subject = "Contact from website";
    $txt = "First Name:" . test_input() . "\n";
    $txt += "Last Name:" . test_input($_POST["lastName"]) . "\n";
    $txt += "Email:" . test_input($_POST["email"]) . "\n";
    $txt += "Message:" . test_input($_POST["message"]). "\n";

    $mail = mail($to,$subject,$txt);

    echo "<script language=\"javascript\" type=\"text/javascript\">
   alert('Contact sent. Thank you, $firstName $lastName!');
   window.location.href = '$url';
  </script>";
?>