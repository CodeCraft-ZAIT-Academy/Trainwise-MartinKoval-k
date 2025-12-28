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

// 
const emailInput = document.getElementById('user-email');
const roleInput = document.getElementById('user-role');
const nameInput = document.getElementById('user-name');
const passwordInput = document.getElementById('new-password');
const saveBtn = document.getElementById('save-btn');
const logoutBtn = document.getElementById('logout-btn');
const backBtn = document.getElementById('back-btn');

// 
const currentAvatarImg = document.getElementById('current-avatar-img');
const openAvatarBtn = document.getElementById('open-avatar-btn');
const avatarModal = document.getElementById('avatar-modal');
const closeModal = document.querySelector('.close-modal');
const avatarGrid = document.getElementById('avatar-grid');
const saveAvatarBtn = document.getElementById('save-avatar-btn');
const roleBadge = document.getElementById('role-badge-text');

// Premenné pre logiku avatara
let selectedAvatarFilename = null; 
let currentUserRole = null; 

// 1. KONTROLA PRIHLÁSENIA A NAČÍTANIE DÁT
onAuthStateChanged(auth, async (user) => {
    if (user) {
        
        emailInput.value = user.email;

       
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            
            currentUserRole = data.role; 

            
            roleInput.value = data.role ? data.role.toUpperCase() : "UNKNOWN";
            if(roleBadge) roleBadge.innerText = data.role ? data.role.toUpperCase() : "USER"; 
            nameInput.value = data.name || ""; 

            backBtn.href = "index.html";

            // --- LOGIKA PRE NAČÍTANIE PROFILOVKY ---
            if (data.photoURL) {
                
                currentAvatarImg.src = `images/${data.photoURL}`;
            } else {
                
                if (currentUserRole === 'coach') {
                    currentAvatarImg.src = "images/avatar-20.png";
                } else {
                    currentAvatarImg.src = "images/avatar-19.png";
                }
            }

        } else {
            console.log("No such document!");
        }

    } else {
        // Nie je prihlásený -> preč
        window.location.href = "Login.html";
    }
});




if(openAvatarBtn) {
    openAvatarBtn.addEventListener('click', () => {
        avatarModal.style.display = 'flex';
        generateAvatarGrid(); 
    });
}


if(closeModal) {
    closeModal.addEventListener('click', () => {
        avatarModal.style.display = 'none';
    });
}


window.onclick = function(event) {
    if (event.target == avatarModal) {
        avatarModal.style.display = "none";
    }
}


function generateAvatarGrid() {
    avatarGrid.innerHTML = ""; 
    selectedAvatarFilename = null; 
    saveAvatarBtn.classList.remove('active');
    saveAvatarBtn.disabled = true;

    
    for (let i = 1; i <= 20; i++) {
        
        const num = i < 10 ? `0${i}` : i;
        const filename = `avatar-${num}.png`;

       
        let isLocked = false;
        let isHidden = false;

       
        if ((i >= 16 && i <= 18) && currentUserRole === 'athlete') {
            isLocked = true;
        }

        
        if (i === 19 && currentUserRole === 'coach') {
            isHidden = true;
        }

        
        if (i === 20 && currentUserRole === 'athlete') {
            isHidden = true;
        }

       
        if (isHidden) continue;

        
        const div = document.createElement('div');
        div.classList.add('avatar-option');
        
        if (isLocked) {
           
            div.classList.add('locked');
            div.innerHTML = `
                <img src="images/${filename}">
                <span class="lock-overlay">🔒</span>
            `;
           
            div.addEventListener('click', () => {
                alert("This avatar is exclusive to Coaches!");
            });
        } else {
            
            div.innerHTML = `<img src="images/${filename}">`;
            
            div.addEventListener('click', () => {
                
                document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
               
                div.classList.add('selected');
                
                selectedAvatarFilename = filename;
                saveAvatarBtn.classList.add('active');
                saveAvatarBtn.disabled = false;
            });
        }

       
        avatarGrid.appendChild(div);
    }
}


if(saveAvatarBtn) {
    saveAvatarBtn.addEventListener('click', async () => {
        if (!selectedAvatarFilename) return;

        const user = auth.currentUser;
        if (user) {
            saveAvatarBtn.innerText = "Saving...";
            
            try {
                
                await updateDoc(doc(db, "users", user.uid), {
                    photoURL: selectedAvatarFilename
                });

                 
                currentAvatarImg.src = `images/${selectedAvatarFilename}`;
                
                
                avatarModal.style.display = 'none';
                saveAvatarBtn.innerText = "Select Avatar";

            } catch (error) {
                console.error(error);
                alert("Error saving avatar");
                saveAvatarBtn.innerText = "Select Avatar";
            }
        }
    });
}


// 2. ULOŽENIE OSTATNÝCH ZMIEN (Meno, Heslo) - Toto ostáva rovnaké
saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newName = nameInput.value;
    const newPass = passwordInput.value;

    saveBtn.innerText = "SAVING...";

    try {
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