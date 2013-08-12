Capturematic
============

Capturematic lets you post a photo, audio or video to any Salesforce record with a Chatter feed.

Installing
----------

At present, Capturematic is only available as source code.

Clone this repository, build the app in Xcode, and run it on an iPhone. While Capturematic will run in the iOS Simulator, since the simulator does not simulate the device camera or microphone, there isn't much point!

Usage
-----

On starting the app the first time, you will be prompted to login:

![Login Page](http://metadaddy-sfdc.github.com/Capturematic/LoginPage.png)

Enter your username and password, click 'Login', and you will see the Authorization screen to allow the app to access your Salesforce data:

![Auth Page](http://metadaddy-sfdc.github.com/Capturematic/AuthPage.png)

When you click 'Allow', Salesforce sends the app both an OAuth 2.0 'access token' and 'refresh token' ([read more about OAuth 2.0 at Salesforce](http://wiki.developerforce.com/page/Digging_Deeper_into_OAuth_2.0_on_Force.com)). The app stores the refresh token securely in the iOS Keychain, and uses the access token to access the Force.com REST and Chatter APIs. When you subsequently start the app, it retrieves the refresh token, sends it to Salesforce, and, assuming it is valid and has not been revoked, receives a new access token, so no further user login is required.

If you want to use Capturematic with a different Salesforce environment ('org'), go to the iOS Settings app, scroll down and click Capturematic's entry:

and set 'Logout Now' to 'On'. This deletes the refresh token from the iOS Keychain, so, next time you use Capturematic, you will need to login again.

Once you are logged in, you will see a list of all objects in your org with feed tracking enabled:

![Objects Page](http://metadaddy-sfdc.github.com/Capturematic/ObjectsPage.png)

Click an object, and you will see a list of up to 20 records:

![Records Page](http://metadaddy-sfdc.github.com/Capturematic/RecordsPage.png)

If you can't see the record you're looking for, then use the search box to enter some part of its name and click 'Search':

![Filter on Name](http://metadaddy-sfdc.github.com/Capturematic/FilterOnName.png)

Click on a record, and you will see a data entry page:

![Capture Page](http://metadaddy-sfdc.github.com/Capturematic/CapturePage.png)

You can type content for an optional message to accompany your media file, then click the still camera, microphone or video camera icon to capture media. On capturing a photo, audio or video, it is uploaded to Chatter Files, and posted to the Chatter feed for the selected record.