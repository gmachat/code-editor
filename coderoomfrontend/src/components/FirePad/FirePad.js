

import React, { Component, useEffect, useRef, useState } from "react";
import './codemirror.css'
import './codeMirrorThemes/coderoom-dark.css'
import './FirePad.css'; 

const API_KEY_FB = process.env.REACT_APP_FIREBASE_API_KEY
const URL_FB = process.env.REACT_APP_FIREBASE_RTDB_URL

console.log(API_KEY_FB)
console.log(URL_FB)

const FirePad = ({language_name}) => {
const codeMirrorRef= useRef()


  useEffect(() =>{
    //// Initialize Firebase.
    //// TODO: replace with your Firebase project configuration.


    const config = {
      apiKey: API_KEY_FB,
      databaseURL: `${URL_FB}`,
    };
    if(!codeMirrorRef.current){
      let codeMirror
    window.firebase.initializeApp(config);
    //// Get Firebase Database reference.
    let firepadRef = getExampleRef();
    //// Create CodeMirror (with lineWrapping on).
    
    codeMirror = window.CodeMirror(document.getElementById('firepad-container'), { lineNumbers: true,
      mode: language_name,
      theme: 'coderoom-dark'
    });
      codeMirrorRef.current = codeMirror
    //// Create Firepad (with rich text toolbar and shortcuts enabled).
    let firepad = window.Firepad.fromCodeMirror(firepadRef, codeMirror,
        { defaultText: '// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}'});
    //// Initialize contents.
    firepad.on('ready', function() {
      // if (firepad.isHistoryEmpty()) {
      //   firepad.setHtml('<span style="font-size: 24px;">Rich-text editing with <span style="color: red">Firepad!</span></span><br/><br/>Collaborative-editing made easy.\n');
      // }
    });
  }else{
    console.log(codeMirrorRef)
    codeMirrorRef.current.options.mode = language_name
  }
  }, [language_name])

  // Helper to get hash from end of URL or generate a random one.
  const getExampleRef = () => {
    let ref = window.firebase.database().ref();
    let hash = window.location.hash.replace(/#/g, '');
    if (hash) {
      ref = ref.child(hash);
    } else {
      ref = ref.push(); // generate unique location.
      window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
    }
    if (typeof console !== 'undefined') {
      console.log('Firebase data: ', ref.toString());
    }
    return ref;
  }


    return (
        <div>

            <div id="firepad-container"></div>
        </div>
        
    );
  
}
export default FirePad;