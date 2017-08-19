<?php

//header("Location: index.html");

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

//Get form variables
$user = sha1($_GET['user']);
$courseID = $_GET['courseID'];
$lectureName = $_GET['lectureName'];
$goodBad = $_GET['goodBad'];
$comment = $_GET['comment'];

$lectureID = null;
$courseTable = null;

//Select and set chosen lecture's lectureID if it matches the courseID set by user
$sql = "SELECT LectureID FROM Lectures WHERE LectureName = '$lectureName' AND CourseID = '$courseID'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()){
    $lectureID = $row['LectureID'];
    echo ' Lecture ID = ' . $lectureID . '<br>';
  }
}
else {
  echo 'Error: Select FROM Lectures' . $conn->error;
}


//Insert form data to table if LectureID doesn't already have an entry from the same user
$courseTable = 'ResultsCourseID' . $courseID;
echo 'CourseTable = ' . $courseTable . '<br>';
$sql = "INSERT INTO $courseTable (CourseID, LectureName, LectureID, GoodBad, Comment, User)
VALUES ('$courseID', '$lectureName', '$lectureID', '$goodBad', '$comment', '$user')";
$result = $conn->query($sql);

if ($result === TRUE){
  echo 'Success! Record added' . '<br>';
}
else {
  echo 'Could not add record:' . ' ' . $conn->error . '<br>';
}

//Close connection
mysqli_close($conn);

?>
