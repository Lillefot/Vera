
// ***OneSignal Setup***
// Add to index.js or the first page that loads with your app.
// For Intel XDK and please add this to your app.js.

function onLoad() {
  document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady() {
  alert('Device Ready!');

  // ***OneSignal Setup***
  // Enable to debug issues.
  // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

/*  var notificationOpenedCallback = function(jsonData) {
    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
  };

  window.plugins.OneSignal
    .startInit("88aaa3f2-e759-4311-b1fd-d706b1d18335")
    .handleNotificationOpened(notificationOpenedCallback)
    .endInit();

  // Call syncHashedEmail anywhere in your app if you have the user's email.
  // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
  // window.plugins.OneSignal.syncHashedEmail(userEmail);
*/
}

function clicked(){
  console.log('Clicked!');
  alert('Clicked!');
}
