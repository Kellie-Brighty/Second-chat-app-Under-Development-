import firebase from 'firebase';


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

export default firebase;