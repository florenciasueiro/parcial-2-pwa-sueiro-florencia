  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdEh1N-NEO-d0FZm7c2Yik42H5y2btoXI",
    authDomain: "rick-y-morty-app-260db.firebaseapp.com",
    projectId: "rick-y-morty-app-260db",
    storageBucket: "rick-y-morty-app-260db.appspot.com",
    messagingSenderId: "315719299171",
    appId: "1:315719299171:web:8438ce5ee30f093edf0856",
    measurementId: "G-39R3Z687V0"
  };


  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
const auth = getAuth(app);

new Vue({
    el: '#app',
    data: {
        email: "",
        password: "",
    },
    methods: {
        register() {
            createUserWithEmailAndPassword(auth, this.email, this.password)
                .then(userCredential => {
                    alert("Registro exitoso");

                })
                .catch(error => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(errorMessage);
                })
        }
    }
});
