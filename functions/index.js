const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require("./keys/admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatty-online-app-346ef.firebaseio.com"
});
const firebase = require('firebase');


var config = {
    apiKey: "AIzaSyCXjsaAL2vSkiMc7Vlk2-X_dik6gc9bPyU",
    authDomain: "chatty-online-app-346ef.firebaseapp.com",
    databaseURL: "https://chatty-online-app-346ef.firebaseio.com",
    projectId: "chatty-online-app-346ef",
    storageBucket: "chatty-online-app-346ef.appspot.com",
    messagingSenderId: "551621453325",
    appId: "1:551621453325:web:96fe3b23d9eaa98f4d9744",
    measurementId: "G-Z9G1L88YH5"
  };
  // Initialize Firebase
  firebase.initializeApp(config);
  const db = admin.firestore();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createNotificationOnChat = functions.firestore.document('/messages/{id}').onWrite(event => {
    if(event.data().previous.val()){
        return;
    }

    if(!event.data().exists()){
        return;
    }

    const Notification_Snapshot = event.data();
    const payload = {
        notification: {
            title: `New message from ${Notification_Snapshot.usernameFrom}`,
            body: Notification_Snapshot.content,
            icon: Notification_Snapshot.photoUrl,
        }
    }

    console.info(payload)
})