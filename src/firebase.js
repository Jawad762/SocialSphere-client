import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBSxLimN3aELsGekhVyqrCNQrzmjxAGDPE",
  authDomain: "socialsphere-c4289.firebaseapp.com",
  projectId: "socialsphere-c4289",
  storageBucket: "socialsphere-c4289.appspot.com",
  messagingSenderId: "574430332302",
  appId: "1:574430332302:web:90043bea0a98eb1bdf50df"
};

const app = initializeApp(firebaseConfig);

export default app