

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


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
const emailInput = document.getElementById('user-email');
const roleInput = document.getElementById('user-role');
const nameInput = document.getElementById('user-name');
const passwordInput = document.getElementById('new-password');
const saveBtn = document.getElementById('save-btn');
const logoutBtn = document.getElementById('logout-btn');
const backBtn = document.getElementById('back-btn');

// 1. KONTROLA PRIHLÁSENIA A NAČÍTANIE DÁT
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Užívateľ je prihlásený
        emailInput.value = user.email;

        // Načítame dáta z databázy (rolu a meno)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            roleInput.value = data.role ? data.role.toUpperCase() : "UNKNOWN";
            nameInput.value = data.name || ""; // Ak má meno, vyplníme ho

            backBtn.href = "index.html";
        } else {
            console.log("No such document!");
        }

    } else {
        // Nie je prihlásený -> preč
        window.location.href = "Login.html";
    }
});

// 2. ULOŽENIE ZMIEN
saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newName = nameInput.value;
    const newPass = passwordInput.value;

    saveBtn.innerText = "SAVING...";

    try {
        const updates = {};
        
        // A. Uloženie mena do databázy
        if (newName) {
            await updateDoc(doc(db, "users", user.uid), {
                name: newName
            });
        }

        // B. Zmena hesla (ak bolo vyplnené)
        if (newPass) {
            await updatePassword(user, newPass);
            alert("Password updated successfully!");
        }

        saveBtn.innerText = "CHANGES SAVED ✅";
        setTimeout(() => saveBtn.innerText = "SAVE CHANGES", 2000);

    } catch (error) {
        console.error("Error updating profile:", error);
        
        // Špeciálna hláška pre heslo (ak sa dlho neprihlásil)
        if (error.code === 'auth/requires-recent-login') {
            alert("Security Alert: To change your password, please Log Out and Log In again, then try immediately.");
        } else {
            alert("Error: " + error.message);
        }
        saveBtn.innerText = "SAVE CHANGES";
    }
});

// 3. ODHLÁSENIE
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html"; 
    }).catch((error) => {
        console.error(error);
    });
});