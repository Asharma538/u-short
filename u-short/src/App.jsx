import { useEffect, useState } from 'react'
import React from 'react'
import './App.css'
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 
import { initializeApp } from 'firebase/app';
import { getFirestore } from "@firebase/firestore";
import BackgroundAnimation from './BackgroundAnimation'

const VITE_FIREBASE_KEY = import.meta.env.VITE_FIREBASE_KEY ? JSON.parse(import.meta.env.VITE_FIREBASE_KEY) : null;


export default function App() {
  const app = VITE_FIREBASE_KEY ? initializeApp(VITE_FIREBASE_KEY) : null;
  const db = app ? getFirestore(app) : null;

  const text = window.location.href.split('/').pop();
  const urls = db ? collection(db,'U-Short') : null;

  const isValidUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const generateLink = async () => {
    if (!urls) {
      alert('Firebase not configured. Please set VITE_FIREBASE_KEY environment variable.');
      return;
    }
    var link = document.getElementById('input-link').value;
    if (link=="") return;

    if (!isValidUrl(link)) {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const encorder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encorder.encode(link));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const linkHash = hashHex.substring(0,8);

    setDoc(doc(urls,linkHash),{
      'to':link
    });

    document.getElementById('output-link').value = window.location.href+linkHash;
  }

  const copyLink = () => {
    navigator.clipboard.writeText(document.getElementById('output-link').value);
    document.getElementById('copy-button').innerHTML = 'Copied';
    setTimeout(() => {
      document.getElementById('copy-button').innerHTML = 'Copy';
    }, 1000);
  }
  
  useEffect(() => {
    async function fetchData() {
      if (!urls) return;
      try {
        console.log(text);
        const urlDocRef = doc(urls,text);
        const docSnap = (await getDoc(urlDocRef)).data();
        window.location.href = docSnap['to'];
      } catch (err) {
        console.log(err);
      }
    }
    if (text!="") fetchData();
  },[]);

  return (
    <div className='main'>
      <BackgroundAnimation />
      <div className='main-body'>
        <div className="welcome-text">
          Heya Anadi here :)
          <br/>
          Welcome...
        </div>
        <br />
        {
          text==""?
          <div></div>
          :
          <div>Going to: {text}</div>
        }

        <br />

        <div className='cntnr'>
          <label>Enter URL to shorten</label>
          <input type="text" id='input-link' placeholder='https://example.com' />
          <button id='generate-link-button' className='action-button' onClick={generateLink}>Generate Link</button>

          <hr />

          <label>Generated short link</label>
          <output id='output-link'></output>
          <button id='copy-button' className='action-button' onClick={copyLink}>Copy Link</button>
        </div>

      </div>
    </div>
  )
}
