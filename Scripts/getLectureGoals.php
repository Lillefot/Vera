<?php

//Get login credentials
require_once 'databaseCredentials.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
//echo 'Connected successfully' . '<br>';

//Set character set to allow ÅÄÖ
//printf("Initial character set: %s\n", mysqli_character_set_name($conn) . '<br>');
if (!mysqli_set_charset($conn, "utf8")) {
    //printf("Error loading character set utf8: %s\n", mysqli_error($conn) . '<br>');
    exit();
} else {
    //printf("Current character set: %s\n", mysqli_character_set_name($conn) . '<br>');
}

if (isset($_GET['lectureChoice'])){
$lectureChoice = $_GET['lectureChoice'];
}
if (isset($_GET['courseChoice'])){
$courseChoice = $_GET['courseChoice'];
}

//Lectures
$sql = "SELECT LectureGoals FROM Lectures WHERE LectureName = '$lectureChoice' AND CourseID = '$courseChoice'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $row = $result->fetch_all();
  $main = array('data'=>$row);
}
else {
  echo 'Error: Select FROM Lectures' . $conn->error;
}

echo json_encode($main);

//Close connection
mysqli_close($conn);

?>
