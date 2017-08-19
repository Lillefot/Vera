<?PHP
	include 'parseICS.php';
// Grab list of event and their end times from parseICS.php
	$GLOBALS['globalEventTimeAndTitle'] = $eventTimeAndTitle;

// Send notification request to OneSignal
		function sendMessage(){
			print_r($GLOBALS['globalLecture']);
			print_r($GLOBALS['globalEventEndTime']);

			//Set date of delivery for notification to end time of lecture
			$date = $GLOBALS['globalEventEndTime'];
			//TODO: Set to current date/time for developments purposes
			// $scheduledDelivery = $date;
			$scheduledDelivery = date();

			//Set category for use of action buttons connected to said category
	    $category = 'KurtLecture';

			//Set title of notification
	    $title = array(
	      "en" => 'Behandlades målen adekvat?'
	    );

			//Set subtitle of notification to name of lecture
	    $lecture = $GLOBALS['globalLecture'];
	    $subtitle = array(
	      "en" => $lecture
	    );

			//Set content of notification to course goals set by lecturer
	    $courseGoals = '
	    • Förstå hjärtats funktion
	    • Redogöra för hjärtats anatomi
	    • Dricka kaffe
	    • Äta macka
	    • Somna
	    • Kolla Facebook';

	    $content = array(
	      "en" => 'Följande kursmål ska ha tagits upp:' . $courseGoals
	      );

			//Makes sure notifications are only sent to users who have chosen the same course as set when scheduling notifications
			$courseID = $_GET['courseID'];
			$filters = array(
				"field" => "tag",
				"key" => 'courseID',
				"relation" => '=',
				"value" => $courseID
			);

			//Array to be sent to OneSingal
			$fields = array(
				'app_id' => "88aaa3f2-e759-4311-b1fd-d706b1d18335",
				'included_segments' => array('All'),
				'filters' => array($filters),
	      'send_after' => $scheduledDelivery,
				'content_available' => true,
	      //'template_id' => '576a00f4-2d3b-4441-a9fb-3e4dcea9f962'
	      'ios_category' => $category,
	      'ios_badgeType' => 'None',
	      'headings' => $title,
	      'subtitle' => $subtitle,
	      'contents' => $content
			);

			//Send notification request to OneSignal
			$fields = json_encode($fields);
	    print("\nJSON sent:\n");
	    print($fields);

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
													   'Authorization: Basic OTViNGEyM2ItNWRkMC00MmMzLTk2OWMtNzFmZjc1ODgwYmY5')); //Set to App-key from OneSignal
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($ch, CURLOPT_HEADER, FALSE);
			curl_setopt($ch, CURLOPT_POST, TRUE);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

			$response = curl_exec($ch);
			curl_close($ch);

			return $response;

		}

//Create one notification for each event in list generated from parseICS.php
	foreach ($GLOBALS['globalEventTimeAndTitle'] as $event) :
		$GLOBALS['globalLecture'] = $event['title'];
		$GLOBALS['globalEventEndTime'] = $event['endTime'];
		$response = sendMessage();
		$return["allresponses"] = $response;
		$return = json_encode( $return);
	endforeach;
	  print("\n\nJSON received:\n");
		print($return);
	  print("\n");
?>
