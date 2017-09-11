<?php

//header("Location: index.html");
require_once 'databaseCredentials.php';
include 'parseICS.php';

//Grab event names and end times from parseICS.php
$GLOBALS['globalEventTimeAndTitle'] = $eventTimeAndTitle;

// Create connection to database
$conn = new mysqli($servername, $username, $password, $db);
$GLOBALS['conn'] = $conn;

// Check connection with database
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
echo 'Connected successfully' . '<br>';

//Set character set to allow ÅÄÖ
printf("Initial character set: %s\n", mysqli_character_set_name($conn) . '<br>');
if (!mysqli_set_charset($conn, "utf8")) {
    printf("Error loading character set utf8: %s\n", mysqli_error($conn) . '<br>');
    exit();
} else {
    printf("Current character set: %s\n", mysqli_character_set_name($conn) . '<br>');
}

//Get form variables
//Get user set CourseID
$GLOBALS['globalCourseID'] = $_GET['courseID'];

//Add lecture to Lecture table together with user set Course ID.
//Database will assign unique Lecture ID
function addLecture(){
  $lectureName = $GLOBALS['globalLecture'];
  $courseID = $GLOBALS['globalCourseID'];
  //Don't insert into table if an entry with the same LectureName and CourseID already exists
  //Lectures with the same name but another Course ID will still be added
  $sql = "INSERT IGNORE INTO Lectures (CourseID, LectureName)
  VALUES ('$courseID', '$lectureName')";
  $result = $GLOBALS['conn']->query($sql);

  if ($result === TRUE){
    echo 'Record added' . '<br>';
  }
  else {
    echo 'Could not add record:' . ' ' . $GLOBALS['conn']->error . '<br>';
  }
}

//Loop through the whole list of events from parseICS.php
foreach ($GLOBALS['globalEventTimeAndTitle'] as $event) :
  echo 'addEvent' . $event['title'] . '<br>';
  $GLOBALS['globalLecture'] = $event['title'];
  addLecture();
endforeach;


//Close connection
//mysqli_close($conn);

?>
