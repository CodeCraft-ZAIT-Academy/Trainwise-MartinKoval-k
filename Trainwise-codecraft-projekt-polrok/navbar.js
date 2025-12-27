// navbar.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- VLOŽ SEM SVOJ FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyD-Ozd5hlChO_gjvhHF4P9UIVyGW03msgI",
    authDomain: "trainwise-webapp.firebaseapp.com",
    projectId: "trainwise-webapp",
    storageBucket: "trainwise-webapp.firebasestorage.app",
    messagingSenderId: "644514176585",
    appId: "1:644514176585:web:75dc6a6a11503ce7eb6998",
    measurementId: "G-W09Q3PGNJ7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementy
const accountBtn = document.querySelector('.login-btn-with-icon');
const dashboardBtn = document.querySelector('a[href="dashboard.html"]'); 
const popup = document.getElementById('coach-popup');
const closePopupBtn = document.querySelector('.close-popup');

// Zatváranie Popupu (X)
if(closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}
// Zatvorenie kliknutím mimo obrázok
if(popup) {
    popup.addEventListener('click', (e) => {
        if(e.target === popup) popup.style.display = 'none';
    });
}

// SPUSTÍ SA PRI NAČÍTANÍ STRÁNKY
onAuthStateChanged(auth, async (user) => {
    
    // --- SCENÁR 1: UŽÍVATEĽ JE PRIHLÁSENÝ ---
    if (user) {
        console.log("Logged in as:", user.email);

        // Account tlačidlo ide do nastavení
        if(accountBtn) accountBtn.href = "account.html";

        // Dashboard tlačidlo - kontrola ROLY
        if(dashboardBtn) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const role = docSnap.data().role;

                if (role === 'coach') {
                    // A) COACH -> Pustíme ho dnu
                    dashboardBtn.href = "dashboard.html";
                    dashboardBtn.onclick = null; // Pre istotu vyčistíme blokovanie
                } 
                else {
                    // B) ATHLETE -> ZABLOKUJEME TO a ukážeme kartičku
                    dashboardBtn.href = "#"; 
                    dashboardBtn.onclick = (e) => {
                        e.preventDefault(); 
                        if(popup) popup.style.display = 'flex';
                    };
                }
            }
        }

    } else {
        // --- SCENÁR 2: UŽÍVATEĽ NIE JE PRIHLÁSENÝ (GUEST) ---
        console.log("User is guest");

        // Account tlačidlo ide na Login
        if(accountBtn) accountBtn.href = "Login.html";

        // Dashboard tlačidlo -> TIEŽ UKÁŽE KARTIČKU (Zmena podľa požiadavky)
        if(dashboardBtn) {
            dashboardBtn.href = "#"; 
            dashboardBtn.onclick = (e) => {
                e.preventDefault();
                if(popup) popup.style.display = 'flex';
            };
        }
    }
});