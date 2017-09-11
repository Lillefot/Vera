
// ***OneSignal Setup***
// Add to index.js or the first page that loads with your app.
// For Intel XDK and please add this to your app.js.
$(document).on({
  ajaxSend: function () {
    console.log('ajaxSend');
  },
  ajaxStart: function () {
    console.log('ajaxStart');
    $.mobile.loading( "show" );
  },
  ajaxStop: function () {
    console.log('ajaxStop');
    $.mobile.loading( "hide" );
  },
  ajaxError: function () {
    alert('Något gick fel!');
  }
});


function onLoad() {
  document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
  // alert('Device Ready!');
  goodRadioButton = $('#q1r1');
  badRadioButton = $('#q1r2');
  goodBadRadio = null;
  databasePHP = 'http://script.studieradet.se/vera/database.php';
  device = device.platform;
  console.log("Device = " + device);

  //Statusbar setup
  StatusBar.overlaysWebView(false);
  StatusBar.styleDefault();
  StatusBar.backgroundColorByHexString("#e9e9e9");

  //Get previous course choice and username from localStorage and set them in their respective elements
  setSettingsUser();
  setSettingsCourse();

  //Set on deviceready to prevent loading of iFrame before DOM is finished
  $('#loginiframe').attr('src', 'http://script.studieradet.se/cas/cas2.php');
  // Get userID from cas2.php via iframe login
  window.addEventListener('message',function(e) {
  var key = e.message ? 'message' : 'data';
  var data = e[key];
  window.localStorage.setItem("user", data);
  var user = window.localStorage.getItem("user");
  document.getElementById('user').value = user;
  //Set username to appropriate elements
  if ($('#settingsUser').text().indexOf('Ej inloggad') > -1) {
    setSettingsUser();
  }
  else {
    alert('Kunde inte logga in!');
  }
  console.log('User = ' + document.getElementById('user').value);
  //Return to settings from iFrame
  toSettings();
  },false);

  // ***OneSignal Setup***
  // Enable to debug issues.
  // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
  //Disable notification prompt until user chose a course
  var iosSettings = {};
  iosSettings["kOSSettingsKeyAutoPrompt"] = false;
  window.plugins.OneSignal
    .startInit("26a295d6-af75-4d42-85a0-3c940d64868a")
    .iOSSettings(iosSettings)
    .handleNotificationOpened(notificationOpenedCallback)
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
    .endInit();


  // Call syncHashedEmail anywhere in your app if you have the user's email.
  // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
  // window.plugins.OneSignal.syncHashedEmail(userEmail);

  //Triggers when user selects a course
  $('#courseSelect').change(function(){
    //Store courseID and Name in localStorage
    var courseChosen = $('#courseSelect').val();
    window.localStorage.setItem("course", courseChosen);
    userCourse = window.localStorage.getItem("course");
    console.log('courseSelected = ' + userCourse);
    var userCourseText = $('#courseSelect option[value=' + userCourse + ']').text();
    console.log(userCourseText);
    window.localStorage.setItem("courseText", userCourseText);
    //Set courseID and Name to elements
    $('#courseID').val(userCourse);
    $('.courseText').empty();
    $('.courseText').append(userCourseText);
    $('#courseSelect').selectmenu('disable');
    //Set an OneSignal Tag on the user to get the correct notifications
    window.plugins.OneSignal.deleteTag("courseID");
    window.plugins.OneSignal.sendTag("courseID", userCourse);
    //Ask for permission to send notifications to the user
    window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
    console.log("User accepted notifications: " + accepted);
    });
  })

  $(document).on("tap", "#resultsTable tbody tr", function() {
        event.preventDefault(); //Prevents double tap which causes a tap on elements on the new page
        var lectureName = $(this).children('.nameCell').text();
        console.log(lectureName);
        toForm(lectureName);
  });

  $(document).on("tap", "#changeCourse", function() {
    event.preventDefault();
    if (window.localStorage.getItem("user")){
      changeCourse();
    }
    else {
      notLoggedInDialog("Du är inte inloggad!", "Du måste logga in för att välja kurs. Vill du logga in?");
    }
  });

  $('#lectureName').change(function(){
    //Clear form
    clearForm();
    var chosenLecture = $('#lectureName').val();
    getLectureGoalsFromDB(chosenLecture);
  });
}

//Callback when notification opened
function notificationOpenedCallback(jsonData) {
  console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
  console.log('Action Taken by User: ' + JSON.stringify(jsonData.action));
  if (device === "iOS"){
    if (jsonData.action.type === 1) {
      if (jsonData.action.actionID === "Comment"){
        console.log("Comment-Action-Button pressed, going to form");
        toForm(lectureNameFromLockScreen);
      }
      else {
        console.log("Good/Bad-Action-Button pressed, not going to form");
      }
    }
    else {
      toForm(lectureNameFromLockScreen);
    }

  }
  else if (device === "Android"){
    console.log("Notification Title = " + jsonData.notification.payload.title);
    lectureNameFromLockScreen = jsonData.notification.payload.title;
    if (jsonData.action.type === 0) {
      console.log("Action Type = " + jsonData.action.type);
      toForm(lectureNameFromLockScreen);
    }
    else if (jsonData.action.type === 1){
      if (jsonData.action.actionID === "Comment"){
        console.log("Comment-Action-Button pressed, going to form");
        toForm(lectureNameFromLockScreen);
      }
      else {
        console.log("Action Type if not 0 = " + jsonData.action.actionID);
        submitFormFromLockScreen(jsonData.action.actionID);
      }
    }
  }
};

//Set username to elements
function setSettingsUser() {
  if (window.localStorage.getItem("user")) {
    console.log('localStorage user present');
    $('#settingsUser')
      .empty()
      .append(window.localStorage.getItem("user"));
  }
  else {
    console.log('localStorage user not present');
    notLoggedInDialog("Du är inte inloggad!", "Vill du logga in?");
  }
}

//Confirmation dialog which can take user to login page
function notLoggedInDialog(title, message) {
  navigator.notification.confirm(
      message, // message
      onConfirm,            // callback to invoke with index of button pressed
      title,           // title
      ['Nej','Ja']     // buttonLabels
  );
  function onConfirm(buttonIndex) {
    if (buttonIndex === 2){
      console.log(buttonIndex);
      toLogin();
    }
    else {
      console.log("User tapped: " + buttonIndex);
    }
  }
}

//Confirmation dialog which can take user to settings page to chose a course
function noCourseChosenDialog(title, message) {
  navigator.notification.confirm(
      message, // message
      onConfirm,            // callback to invoke with index of button pressed
      title,           // title
      ['Nej','Ja']     // buttonLabels
  );
  function onConfirm(buttonIndex) {
    if (buttonIndex === 2){
      console.log(buttonIndex);
      toSettings();
    }
    else {
      console.log("User tapped: " + buttonIndex);
    }
  }
}

//Set the courseID and Name to elements
function setSettingsCourse() {
  if (window.localStorage.getItem("course")) {
    console.log('Set course is ' + window.localStorage.getItem("courseText"));
    $('#courseID').val(window.localStorage.getItem("course"));
    $('.courseText').empty();
    $('.courseText').append(window.localStorage.getItem("courseText"));
  }
  else {
    console.log("No course chosen!");
  }
}

//Only for iOS: Set lectureName to subtitle of notification interacted with
function setLectureName(subtitle){
  lectureNameFromLockScreen = subtitle;
  console.log("setLectureName = " + subtitle);
}

//Submit form when app in foreground
function submitForm(type) {
  console.log('Checking form!')

  //Set depending on user choice of radio button
  if (goodRadioButton.is(":checked")) {
    goodBadRadio = 1;
    console.log('goodBadRadio = ' + goodBadRadio);
  }
  else if (badRadioButton.is(":checked")) {
    goodBadRadio = 0;
    console.log('goodBadRadio = ' + goodBadRadio);
  }
  else {
    console.log('No choice made');
  }

  //Set form variables
  var comment = $('#q1comment').val();
  var user = window.localStorage.getItem("user");
  var courseID = $('#courseID').val();
  var lectureName = $('#lectureName').val();

  //Send form to database
  if (type === 'new') {
    console.log('new');
    var url = "http://script.studieradet.se/vera/databaseFromAJAX.php";
  }
  else if (type === 'update'){
    console.log('Update');
    var url = "http://script.studieradet.se/vera/databaseFromAJAXUpdate.php";
  }

  $.ajax({
    url: url,
    data: {comment: comment, goodBad: goodBadRadio, user: user, courseID: courseID, lectureName: lectureName},
    success: function(data){
      if (data.indexOf('Success!') >= 0){
        alert('Tack för ditt svar!');
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else {
        alert('Det gick inte att skicka in ditt svar!');
      }
    }
  });

  }

//Submit form from lockscreen
function submitFormFromLockScreen(choice) {

    //Set depending on user choice of Action Button
    goodBad = null;
    if (choice === 'Good') {
      goodBad = 1;
      console.log('goodBad = ' + goodBad);
    }
    else if (choice === 'Bad') {
      goodBad = 0;
      console.log('goodBad = ' + goodBad);
    }
    else {
      console.log('No choice made');
    }

    //Set form variables
    var comment = ""; //Empty to prevent previous comment to be sent
    var user = window.localStorage.getItem("user");
    var courseID = $('#courseID').val();
    //var lectureName = document.getElementById('lectureName').value;

    //Send form to database
    var xhr = new XMLHttpRequest();
    var url = "http://script.studieradet.se/vera/databaseFromAJAX.php";
    var url = url + "?comment=" + comment + "&goodBad=" + goodBad + "&user=" + user + "&courseID=" + courseID + "&lectureName=" + lectureNameFromLockScreen;
    xhr.onreadystatechange = function () {
        //Run on success
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('Form submitted!');
        }
    };
    //Must be synchronus to keep the app awake long enough for request to finish
    xhr.open("GET", url, false);
    xhr.send(null);
  }

//Clear username from elements and localStorage
function clearUser() {
  if (window.localStorage.getItem("user")){
    localStorage.removeItem('user');
    $('#settingsUser')
      .empty()
      .append('Ej inloggad');
    $('#user').val('');
    //Show/hide login/logout buttons
    $('#logOutButton').closest('.ui-btn').hide();
    $('#logInButton').closest('.ui-btn').show();
    if (window.localStorage.getItem("course") && window.localStorage.getItem("courseText")) {
      localStorage.removeItem('course');
      localStorage.removeItem('courseText');
      $('#courseID').val('');
      $('.courseText')
        .empty()
        .append('');
      $('#courseTextInSettings').append('Ingen kurs vald');
      $('#courseSelect')
        .val('')
        .selectmenu('disable');
      window.plugins.OneSignal.deleteTag("courseID");
    }
    else {
      console.log("No course chosen!");
    }
  }
  else {
    alert('Ingen användare inloggad!');
  }
}

//Change page to form
//Add lectureName to make selector preselect chosen lecture
function toForm(lectureName){
  $.mobile.changePage('#form')
  if (window.localStorage.getItem("course")) {
    $('#submitNewButton').closest('.ui-btn').show();
    $('#submitUpdateButton').closest('.ui-btn').hide();
    //Get lectures depending on course chosen
    lectureSelectFromDB(window.localStorage.getItem("course"), lectureName);
    getLectureGoalsFromDB(lectureName);
  }
  else {
    noCourseChosenDialog("Ingen kurs vald!", "Du måste välja en kurs för att kunna skicka in enkäter. Vill du välja en kurs?");
  }

}

//Change page to settings
function toSettings() {
  $.mobile.changePage('#settings');
  //Fetch courses from database
  courseSelectFromDB();
  //Show/hide login/logout buttons depending on if user is logged in or not
  if (window.localStorage.getItem("user")) {
    $('#logInButton').closest('.ui-btn').hide();
    $('#logOutButton').closest('.ui-btn').show();
  }
  else {
    $('#logOutButton').closest('.ui-btn').hide();
    $('#logInButton').closest('.ui-btn').show();
  }

}

//Change page to results
function toResults() {
  $.mobile.changePage('#results');
  if (window.localStorage.getItem("course")) {
    getCount();
  }
  else {
    $('#resultsTable').empty();
    noCourseChosenDialog("Ingen kurs vald!", "Du måste välja en kurs för att kunna se resultaten. Vill du välja en kurs?");
  }
}

function toLogin() {
  $.mobile.changePage('#login');
}

//Get lectures from database depending on course chosen by user
function lectureSelectFromDB(choice, fromResults) {
  console.log('lectureSelectFromDB');

  $.ajax({
    url: 'http://script.studieradet.se/vera/courseChoice.php',
    data: {courseChoice: choice},
    success: function(data){
      if (data.indexOf('Error') < 0){
        var myarray = JSON.parse(data);
        console.log(myarray);
        //Empty lecture selector
        var defaultOption = "<option> Välj föreläsning! </option>";
        $('#lectureName')
          .empty()
          .append(defaultOption);
        //Add options to lecture selector
        for (i=0;i<myarray.data.length;i++){
          var optn = document.createElement("OPTION");
          optn.text = myarray.data[i][0]; // Use myarray.data[i][1] for lectureID
          optn.value = myarray.data[i][0];  //!!! Is, and should be, set to name of lecture
          document.getElementById('lectureName').options.add(optn);
        }
        if (fromResults) {
          console.log('fromResults = ' + fromResults);
          var value = 'option[value="' + fromResults + '"]';
          $('select[name="lectureName"]').find(value).attr("selected",true).change();
          getPreviousAnswer(fromResults);
        }
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else {
        console.warn(data);
        alert('Gick inte att ladda föreläsningar!');
      }
    }
  });
}

//Get lecture goals from DB
function getLectureGoalsFromDB(lectureName) {
  console.log('getLectureGoalsFromDB');
  var course = window.localStorage.getItem("course");
  $.ajax({
    url: 'http://script.studieradet.se/vera/getLectureGoals.php',
    data: {lectureChoice: lectureName, courseChoice: course},
    success: function(data){
      if (data.indexOf('Error') < 0){
        var goalArray = JSON.parse(data);
        console.log(goalArray);
        for (i=0;i<goalArray.data.length;i++){
          if (goalArray.data[i][0].length > 0){
            console.log("<0");
            $('#lectureGoals')
              .empty()
              .append(goalArray.data[i]);
          }
          else {
            $('#lectureGoals')
              .empty()
              .append("Inga mål inlagda för denna föreläsning");
          }
        }
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else if (($('#lectureName').val()) === "Välj föreläsning!"){
        console.log('No lecture selected!');
      }
      else {
        console.warn(data);
        alert('Gick inte att ladda mål!');
      }
    }
  });
}

//Get user's previous answers and insert them into the form
function getPreviousAnswer(lectureName) {
  var choice = window.localStorage.getItem("course");
  var user = window.localStorage.getItem("user");
  var lecture = lectureName;

  $.ajax({
    url: 'http://script.studieradet.se/vera/previousAnswer.php',
    data: {courseChoice: choice, user: user, lectureName: lecture},
    success: function(data){
      console.warn(data);
      if (data.indexOf('Error') < 0){
        previousAnswer = JSON.parse(data);
        if (previousAnswer[0].comment) {
          $('#q1comment').val(previousAnswer[0].comment).change();
        }
        if (previousAnswer[0].goodBad === '1'){
          goodRadioButton.prop("checked", true).change();
        }
        else if (previousAnswer[0].goodBad === '0'){
          badRadioButton.prop("checked", true).change();
        }
        $("input[type='radio']").checkboxradio("refresh");
        $('#submitNewButton').closest('.ui-btn').hide();
        $('#submitUpdateButton').closest('.ui-btn').show();
        alert('Här kan du se dina tidigare svar och också uppdatera dem!');

    }
    else if (data.indexOf('failed') >= 0){
      console.warn(data);
      alert('Gick inte att få kontakt med databasen!');
    }
    else {
      $('#submitNewButton').closest('.ui-btn').show();
      $('#submitUpdateButton').closest('.ui-btn').hide();
      alert('Du har inte utvärderat denna föreläsning än men du är välkommen att göra det nu!');
    }
    }
  });
}
//Get courses from database
function courseSelectFromDB() {
  console.log("courseSelectFromDB");

  $.ajax({
    url: 'http://script.studieradet.se/vera/courseSelectFromDB.php',
    success: function(data){
        if (data.indexOf('Error') < 0){
          var defaultOption = "<option> Välj din kurs! </option>";
          var courseList = defaultOption.concat(data);
          //Clear selector of previous options and add new ones
          $('#courseSelect')
            .empty()
            .append(courseList);
        }
        else if (data.indexOf('failed') >= 0){
          console.warn(data);
          alert('Gick inte att få kontakt med databasen!');
        }
        else {
          console.warn(data);
          alert('Gick inte att ladda kurser!');
        }
    }
  });
}

//Enable course selector
function changeCourse() {
  $('#courseSelect').selectmenu('enable');
}

//Get number of answers from the last semester for the corresponding courseID
function getCount() {
  var choice = window.localStorage.getItem("course");

  $.ajax({
    url: 'http://script.studieradet.se/vera/countEntries.php',
    data: {courseChoice: choice},
    success: function(data){
      if (data.indexOf('Error') < 0){
        allResultsArray = JSON.parse(data);
        console.warn(data);
        console.log('allResultsArray = ' + allResultsArray);
        listAllResults();
        haveAnswered();
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else {
        console.warn(data);
        alert('Gick inte att ladda föreläsningar!');
      }
    }
  });
}

String.prototype.insertAt=function(index, string) {
  return this.substr(0, index) + string + this.substr(index);
}
//Create table from contents recieved by getCount
function listAllResults() {
    var tableRowTags = "<tr class='clickableRow' id='rowLectureID'></tr>";
    var tableChangesRowTags = "<tr class='changesRow'></tr>";
    var tableCellTags = "<td></td>";
    var tableCellNameTags = "<td class='nameCell'></td>";
    var tableCellResultTags = "<td class='resultCell'>%&#x1F44D</td>";
    var tableCellEntriesTags = "<td class='entriesCell'> &#x1F465</td>";
    var tableCellAnsweredTags = "<td class='answeredCell'>&#x274C</td>";
    var colourGradient = new Rainbow();
    var i = 1;
    var wholeRowBackgroundColour = "#e9e9e9";
    colourGradient.setSpectrum('#ffaaaa', '#fffdaa', '#5bff4c');

    //TODO: Change semester
    $('#resultsTable')
      .empty()
      .append('<thead><tr><th>Föreläsning</th><th>VT17%</th><th>Antal svar VT17</th><th>Mina svar</th></tr></thead>')
      .append('<tbody>');
    _.each(allResultsArray,function(entry){
      var cellLectureName = tableCellNameTags.insertAt(21, entry.lectureName);
      var entryTotalInt = Number(entry.total, 10);
      var entryGoodInt = Number(entry.good, 10);
      var resultPercent = Math.round((entryGoodInt / entryTotalInt) * 100);
      var cellEntries = tableCellEntriesTags.insertAt(24, entryTotalInt);
      var cellResult = tableCellResultTags.insertAt(23, resultPercent);
      var rowContents = cellLectureName + cellResult + cellEntries + tableCellAnsweredTags;

      var newRow = tableRowTags.insertAt(43, rowContents);
      if (entry.changes){
        var cellChanges = tableCellTags.insertAt(4, entry.changes);
        cellChanges = cellChanges.insertAt(3, ' class="changesCell" colspan="2"');
        var info = '• Förändringar till denna termin: ';
        var cellInfo = tableCellTags.insertAt(4,info);
        cellInfo = cellInfo.insertAt(3, ' class="infoCell" colspan="2"');
        var rowChanges = cellInfo + cellChanges;
        console.log(rowChanges);
        newRow = newRow.insertAt(41, entry.lectureID) + tableChangesRowTags.insertAt(23, rowChanges);
      }
      else {
      newRow = newRow.insertAt(41, entry.lectureID);
      }
      $('#resultsTable').append(newRow);

      if (Number.isNaN(resultPercent)) {
        var hexColour = '#F8F8FF';
      }
      else {
        var hexColour = colourGradient.colourAt(resultPercent);
      }
      if (i & 1){
        i++;
      }
      else {
        i++;
        var wholeRowID = "#rowLectureID" + entry.lectureID;
        $(wholeRowID).css('background-color', wholeRowBackgroundColour);
        if (entry.changes){
          $(wholeRowID).next().css('background-color', wholeRowBackgroundColour);
        }
      }
      var rowID = "#rowLectureID" + entry.lectureID + " td:first-child";
      $(rowID).css('background-color', hexColour);

    });
    $('#resultsTable').append('</tbody>');
}

//Get user's answers from current semester
function haveAnswered() {
  var choice = window.localStorage.getItem("course");
  var user = window.localStorage.getItem("user");

  $.ajax({
    url: 'http://script.studieradet.se/vera/haveAnswered.php',
    data: {courseChoice: choice, user: user},
    success: function(data){
      if (data.indexOf('Error') < 0){
        haveAnsweredArray = JSON.parse(data);
        console.warn(data);
        console.log('haveAnswered = ' + haveAnsweredArray);
        markAnswered();
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else {
        console.warn(data);
        alert('Gick inte att ladda hämta tidigare svar!');
      }
    }
  });
}

//Mark resultsTable depending on user's answers for this current semester
function markAnswered() {
  _.each(haveAnsweredArray, function(entry){
    var rowID = "#rowLectureID" + entry.lectureID;
    var thumbs = '';
    if (entry.goodBad === '1'){
      thumbs = '&#x1F44D';
    }
    else if (entry.goodBad === '0'){
      thumbs = '&#x1F44E';
    }
    if (entry.comment) {
      $(rowID).children('.answeredCell')
        .css('background-color', '#5bff4c')
        .empty()
        .append('<p>' + thumbs + '&#x1F4AC</p>');
    }
    else {
      $(rowID).children('.answeredCell')
        .css('background-color', '#fffdaa')
        .empty()
        .append('<p>' + thumbs + '</p>');
    }
  });
}

//DEVELOPER: Schedule notifications to be sent to user
function scheduleNotifications() {
  var courseID = $('#courseID').val();

  $.ajax({
    url: 'http://script.studieradet.se/vera/sendNotification.php',
    data: {courseID: courseID},
    success: function(data){
      if (data.indexOf('Error') < 0){
        console.log('Notification sent!');
      }
      else if (data.indexOf('failed') >= 0){
        console.warn(data);
        alert('Gick inte att få kontakt med databasen!');
      }
      else {
        console.warn(data);
        alert('Gick inte att skicka notiser!');
      }
    }
  });
}

//Clear form
function clearForm(){
  console.log('ClearForm();')
  badRadioButton.prop("checked", false).change();
  goodRadioButton.prop("checked", false).change();
  $('#q1comment').val('').change();
  $("input[type='radio']").checkboxradio("refresh");
  $('#submitNewButton').closest('.ui-btn').show();
  $('#submitUpdateButton').closest('.ui-btn').hide();
}
