import { useEffect, useState } from 'react'
import React from 'react'
import './App.css'
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 
import { initializeApp } from 'firebase/app';
import { getFirestore } from "@firebase/firestore";

const VITE_FIREBASE_KEY = JSON.parse(import.meta.env.VITE_FIREBASE_KEY);


export default function App() {
  const app = initializeApp(VITE_FIREBASE_KEY);
  const db = getFirestore(app);

  const text = window.location.href.split('/').pop();
  const urls = collection(db,'U-Short');

  const generateLink = async () => {
    var link = document.getElementById('input-link').value;
    if (link=="") return;

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
    <div>
      Heya Anadi here :)
      <br />
      {
        text==""?
        <div>Welcome here...</div>
        :
        <div>Going to: {text}</div>
      }

      <br />

      Give input link to be shortened: <input type="text" id='input-link' /> 
      <br />
      <button id='generate-link-button' onClick={generateLink}>Generate Link</button>
      <br />
      <br />

      Generated link: <output id='output-link'></output>
      <br />
      <button id='copy-button' onClick={copyLink}>Copy</button>
    </div>
  )
}