import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBOZZl9-k7wUJjaWfHojlgDWs7ljM1WHRk",
  authDomain: "attendenceboard-b0be2.firebaseapp.com",
  projectId: "attendenceboard-b0be2",
  storageBucket: "attendenceboard-b0be2.firebasestorage.app",
  messagingSenderId: "757814632055",
  appId: "1:757814632055:web:2375ac086886487e1eb072",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)