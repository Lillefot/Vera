<?php

//header("Location: index.html");

//Required to accept AJAX-request
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//Get login credentials
require_once 'databaseCredentials.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

//Set character set to allow ÅÄÖ
//printf("Initial character set: %s\n", mysqli_character_set_name($conn) . '<br>');
if (!mysqli_set_charset($conn, "utf8")) {
    //printf("Error loading character set utf8: %s\n", mysqli_error($conn) . '<br>');
    exit();
} else {
    //printf("Current character set: %s\n", mysqli_character_set_name($conn) . '<br>');
}

if (isset($_GET['courseChoice'])){
$courseChoice = $_GET['courseChoice'];
//echo 'courseChoice = ' . $courseChoice;
$courseTable = 'ResultsCourseID' . $courseChoice;
}
if (isset($_GET['user'])){
$user = $_GET['user'];
$user = sha1($user);
//echo $user;
}

$sql = "SELECT LectureID, Comment, GoodBad FROM $courseTable WHERE User = '$user'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()){
    unset($id, $comment, $goodBad);
    $id = $row['LectureID'];
    $comment = $row['Comment'];
    $goodBad = $row['GoodBad'];
    $list[] = array('lectureID' => $id, 'comment' => $comment, 'goodBad' => $goodBad);
  }
}

else {
  echo 'Error: haveAnswered.php Select FROM ' . $courseTable . ' ' . $conn->error;
}

echo json_encode($list);

?>
