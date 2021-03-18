import React, { useState, useRef } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import flame from './images/flame.png';
import send from './images/send.png';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

const [user] = useAuthState(auth)

  return (
    <div className="app">
        <header>
          <div className="app__title">
            <span>Firechat</span>
            <img src={flame} alt="logo"/>
          </div>
          <SignOut/>
        </header>

        <div className="section"> 
          {user ? <ChatRoom/> : <SignIn/>}
        </div>
    </div>
  )
};

function SignIn (){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="signedOut">
       <button className="signing" onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  )
};

function SignOut(){
  return auth.currentUser && (
    <button className="signing" onClick={() => auth.signOut()}>Sign Out</button>
  )
};

function ChatRoom() {
  const dummy = useRef()

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL, displayName} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid, 
      photoURL, 
      displayName
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="main">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>

      </div>

      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message"/>

        <button className="form__button" type="submit">
          <img src={send} alt="arrow"/>
        </button>

      </form>
    </>
  )
};

function ChatMessage(props) {
  const {text, uid, photoURL, displayName} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
     <div className={`message ${messageClass}`}>
        <img src={photoURL} alt="default"/>
        <div className="chat__message">
          <div className="name">{displayName}</div>
          <div>{text}</div>
        </div>
     </div>
  )
}

export default App;
