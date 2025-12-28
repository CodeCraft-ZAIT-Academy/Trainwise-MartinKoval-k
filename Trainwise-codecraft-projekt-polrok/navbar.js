import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURÁCIA ---
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

// --- POMOCNÁ FUNKCIA: ZÍSKANIE UNIKÁTNEHO KĽÚČA KOŠÍKA ---
export function getCartKey() {
    const user = auth.currentUser;
    return user ? `cart_${user.uid}` : 'cart_guest';
}

// --- ELEMENTY Z NAVBARU ---
const accountBtn = document.querySelector('.login-btn-with-icon'); 
const dashboardBtn = document.getElementById('nav-dashboard');       
const trainingAppBtn = document.getElementById('nav-training-app');  
const cartBadge = document.querySelector('.cart-quantity');          

// --- FUNKCIA: UPDATE IKONKY KOŠÍKA ---
export function updateCartBadge() {
    const key = getCartKey();
    const cart = JSON.parse(localStorage.getItem(key)) || [];
    if (cartBadge) {
        cartBadge.innerText = cart.length;
        cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

// --- POPUP REKLAMA ---
const popup = document.getElementById('coach-popup');
const closePopupBtn = document.querySelector('.close-popup');

if(closePopupBtn) closePopupBtn.addEventListener('click', () => popup.style.display = 'none');
if(popup) popup.addEventListener('click', (e) => { if(e.target === popup) popup.style.display = 'none'; });

function openAd(e) {
    e.preventDefault();
    if(popup) popup.style.display = 'flex';
}

// --- HLAVNÁ FUNKCIA (AUTH STATE) ---
onAuthStateChanged(auth, async (user) => {
    
    updateCartBadge();

    if (user) {
        if(accountBtn) accountBtn.href = "account.html";
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const role = docSnap.data().role;
            if (role === 'coach') {
                if(dashboardBtn) { dashboardBtn.href = "dashboard.html"; dashboardBtn.onclick = null; }
                if(trainingAppBtn) { trainingAppBtn.href = "app.html"; trainingAppBtn.onclick = null; }
            } else {
                if(dashboardBtn) { dashboardBtn.href = "app.html"; dashboardBtn.onclick = null; }
                if(trainingAppBtn) { trainingAppBtn.href = "app.html"; trainingAppBtn.onclick = null; }
            }
        }
    } else {
        if(dashboardBtn) { dashboardBtn.innerText = "Dashboard"; dashboardBtn.href = "#"; dashboardBtn.onclick = openAd; }
        if(trainingAppBtn) { trainingAppBtn.innerText = "Training App"; trainingAppBtn.href = "#"; trainingAppBtn.onclick = openAd; }
    }
});