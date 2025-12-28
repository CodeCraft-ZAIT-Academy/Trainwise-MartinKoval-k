// 1. IMPORTY Z FIREBASE 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js"; 

// 2. TVOJA KONFIGURÁCIA 
const firebaseConfig = {
  apiKey: "AIzaSyD-Ozd5hlChO_gjvhHF4P9UIVyGW03msgI",
  authDomain: "trainwise-webapp.firebaseapp.com",
  projectId: "trainwise-webapp",
  storageBucket: "trainwise-webapp.firebasestorage.app",
  messagingSenderId: "644514176585",
  appId: "1:644514176585:web:75dc6a6a11503ce7eb6998",
  measurementId: "G-W09Q3PGNJ7"
};

// 3. INICIALIZÁCIA
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

//  PREPÍNANIE SIGNUP / LOGIN 
const signupWrapper = document.getElementById('signup-form-wrapper');
const loginWrapper = document.getElementById('login-form-wrapper');
const showLoginBtn = document.getElementById('show-login');
const showSignupBtn = document.getElementById('show-signup');

if(showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupWrapper.style.display = 'none';
        loginWrapper.style.display = 'block';
    });
}
if(showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginWrapper.style.display = 'none';
        signupWrapper.style.display = 'block';
    });
}

//  4. SIGN UP 
const signupForm = document.getElementById('signup-form');
if(signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const btn = signupForm.querySelector('button');

        try {
            btn.innerText = "Creating account...";
            
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                role: role,
                createdAt: new Date(),
            });

            alert("Account created! Redirecting...");
            
            
            localStorage.removeItem('cart');
            localStorage.removeItem('shoppingCart');
            
            // 4. Presmerovanie
            window.location.href = "index.html"; 

        } catch (error) {
            alert("Error: " + error.message);
            btn.innerText = "Sign Up with Email";
        }
    });
}

//  5. LOGIN 
const loginForm = document.getElementById('login-form');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');

        try {
            btn.innerText = "Logging in...";

            // 1. Prihlásenie
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Zistíme ROLU
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            
            localStorage.removeItem('cart');
            localStorage.removeItem('shoppingCart');

            if (docSnap.exists()) {
                const userData = docSnap.data();
                const role = userData.role;

                // 3. Presmerovanie podľa roly 
                if(role === 'coach') {
                    window.location.href = "dashboard.html";
                } else {
                   
                    window.location.href = "app.html"; 
                }
            } else {
                window.location.href = "dashboard.html"; 
            }

        } catch (error) {
            alert("Login failed: " + error.message);
            btn.innerText = "Login";
        }
    });
}

//  6. GOOGLE LOGIN 
const provider = new GoogleAuthProvider();
const googleLoginBtn = document.getElementById('google-login-btn');

if(googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

           
            localStorage.removeItem('cart');
            localStorage.removeItem('shoppingCart');

            if (docSnap.exists()) {
                const role = docSnap.data().role;
                if(role === 'coach') {
                    window.location.href = "dashboard.html";
                } else {
                    
                    window.location.href = "app.html"; 
                }
            } else {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    role: "athlete",
                    createdAt: new Date()
                });
                
                window.location.href = "app.html"; 
            }

        } catch (error) {
            console.error(error);
            alert("Google login failed");
        }
    });
}