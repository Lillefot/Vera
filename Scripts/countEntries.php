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
$previousSemester = 'VT17';
$courseTable = 'ResultsCourseID' . $courseChoice . $previousSemester;
}

$sql = "SELECT LectureID, LectureName, ChangesVT17 FROM Lectures WHERE CourseID = '$courseChoice'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $row = $result->fetch_all();
  $lectures = $row;
}
else {
  echo 'Error: Select FROM Lectures' . ' ' . $conn->error;
}

$sql = "SELECT LectureID, count(1) FROM $courseTable WHERE GoodBad = 1 GROUP BY LectureID";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $row = $result->fetch_all();
  $countGoodArray = $row;
  //echo $listArray;
  //echo json_encode($countGoodArray);
}
else {
  echo 'Error: Select FROM ' . $courseTable . ' ' . $conn->error;
}

$sql = "SELECT LectureID, count(1) FROM $courseTable GROUP BY LectureID";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $row = $result->fetch_all();
  $countTotalArray = $row;
  //echo $listArray;
  //echo json_encode($countTotalArray);
}
else {
  echo 'Error: Select FROM ' . $courseTable . ' ' . $conn->error;
}

$countGoodTotalArray = [];


// foreach ($countTotalArray as $entry) {
//   foreach ($countGoodArray as $entry) {
//     if ($entry[0] == $entry[0]){
//       $countGoodTotalArray[] = array('lectureID' => $entry[0], 'good' => $entry[1], 'total' => $entry[1]);
//     }
//   }
// }
foreach ($lectures as $lecture) {
  $countGoodTotalArray[] = array('lectureID' => $lecture[0], 'lectureName' => $lecture[1], 'changes' => $lecture[2]);
  $lectureID = array_column($countGoodTotalArray, 'lectureID');
  $lectureIDIndex = array_search($lecture[0], $lectureID);
  foreach ($countTotalArray as $entry) {
    if ($entry[0] == $lecture[0]) {
      $countGoodTotalArray[$lectureIDIndex]['total'] = $entry[1];
      break;
    }
  }
  foreach ($countGoodArray as $entry) {
    if ($entry[0] == $lecture[0]) {
      $countGoodTotalArray[$lectureIDIndex]['good'] = $entry[1];
      break;
    }
  }
  if (!array_key_exists('total', $countGoodTotalArray[$lectureIDIndex])){
    $countGoodTotalArray[$lectureIDIndex]['total'] = '0';
  }
  if (!array_key_exists('good', $countGoodTotalArray[$lectureIDIndex])){
    $countGoodTotalArray[$lectureIDIndex]['good'] = '0';
  }
}

foreach ($countGoodTotalArray as $lecture) {
  if (!array_key_exists('good', $lecture)) {
    $lecture['good'] = 0;
}
};

echo json_encode($countGoodTotalArray);

?>
