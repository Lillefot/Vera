<?php
include 'iCal/ICal.php';
include 'iCal/Event.php';

//Required to accept AJAX-request
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//Set to match date format required by OneSignal
define('DATE_TIME_FORMAT', 'Y-m-d H:i:s T');

use ICal\ICal;

// TODO: Make it possible to use webcal(in http-format) link to ics file instead of local file
// Setup calendar object from .ics file

//Get courseID to be able to fetch correct .ics-file from server
$courseID = $_GET['courseID'];
$userCalendar = 'ics/VeraCourseID' . $courseID . '.ics';

try {
    $ical = new ICal($userCalendar, array(
        'defaultSpan'           => 2,     // Default value
        'defaultTimeZone'       => 'UTC',
        'defaultWeekStart'      => 'MO',  // Default value
        'skipRecurrence'        => false, // Default value
        'useTimeZoneWithRRules' => false, // Default value
    ));
    //$ical->initFile('ICal.ics');
    //$ical->initUrl('https://raw.githubusercontent.com/u01jmg3/ics-parser/master/examples/ICal.ics');
} catch (\Exception $e) {
    die($e);
}

$forceTimeZone = false;

//All events in file
$events = $ical->events();

//Get all end times and titles
$eventEndTimes = [];
$eventTitles = [];
$eventTimeAndTitle = [];

foreach ($events as $event) :
  $eventEndTimes[] = $ical->iCalDateToDateTime($event->dtend_array[3], $forceTimeZone)->format(DATE_TIME_FORMAT);
  $eventTitles[] = $event->summary;
endforeach;

//Create array where titles and end times are paired together
foreach (array_combine($eventTitles, $eventEndTimes) as $title => $endTime){
  $eventTimeAndTitle[] = array('title' => $title, 'endTime' => $endTime);
}

//Encode to json for javascript to pick up via AJAX-request
echo json_encode($eventTimeAndTitle);


?>
