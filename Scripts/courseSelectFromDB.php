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

//Set character set to allow ÅÄÖ
//printf("Initial character set: %s\n", mysqli_character_set_name($conn) . '<br>');
if (!mysqli_set_charset($conn, "utf8")) {
    //printf("Error loading character set utf8: %s\n", mysqli_error($conn) . '<br>');
    exit();
} else {
    //printf("Current character set: %s\n", mysqli_character_set_name($conn) . '<br>');
}

//Select and set dropdown menu to values of table

//Courses
$sql = "SELECT CourseID, CourseName FROM Courses ";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()){
    unset($id, $name);
    $id = $row['CourseID'];
    $name = $row['CourseName'];
    echo '<option value="'.$id.'">'.$name.'</option>';
  }
}
else {
  echo 'Error: Select FROM Courses' . $conn->error;
}


//Close connection
mysqli_close($conn);

?>
