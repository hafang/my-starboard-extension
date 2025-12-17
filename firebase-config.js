// Firebase Configuration
// Replace these values with your Firebase project config from:
// Firebase Console > Project Settings > Your Apps > Web App > Config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db;

function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        // Check if already initialized
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Enable offline persistence for Firestore
        db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.log('Firestore persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.log('Firestore persistence not available in this browser');
            }
        });
        
        console.log('Firebase initialized successfully');
        return true;
    }
    console.warn('Firebase SDK not loaded');
    return false;
}

// Auth Service - handles all authentication operations
const AuthService = {
    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Email sign-in error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Sign up with email and password
    async signUpWithEmail(email, password) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Email sign-up error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign-out error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get current user
    getCurrentUser() {
        return auth ? auth.currentUser : null;
    },
    
    // Listen for auth state changes
    onAuthStateChanged(callback) {
        if (auth) {
            return auth.onAuthStateChanged(callback);
        }
        return () => {};
    },
    
    // Convert Firebase error codes to user-friendly messages
    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in was cancelled.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };
        return messages[code] || 'An error occurred. Please try again.';
    }
};

// Sync Service - handles Firestore data synchronization
const SyncService = {
    // Track sync state
    isSyncing: false,
    lastSyncTime: null,
    syncListeners: [],
    
    // Get user document reference
    getUserDocRef(collection) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return null;
        return db.collection('users').doc(user.uid).collection(collection);
    },
    
    // Save notes to Firestore
    async saveNotes(content) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return false;
        
        try {
            await db.collection('users').doc(user.uid).set({
                notes: {
                    content: content,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    },
    
    // Save todos to Firestore
    async saveTodos(todos) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return false;
        
        try {
            await db.collection('users').doc(user.uid).set({
                todos: {
                    items: todos,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving todos:', error);
            return false;
        }
    },
    
    // Save reminders to Firestore
    async saveReminders(reminders) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return false;
        
        try {
            await db.collection('users').doc(user.uid).set({
                reminders: {
                    items: reminders,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving reminders:', error);
            return false;
        }
    },
    
    // Save preferences to Firestore
    async savePreferences(preferences) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return false;
        
        try {
            await db.collection('users').doc(user.uid).set({
                preferences: {
                    ...preferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    },
    
    // Load all user data from Firestore
    async loadUserData() {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return null;
        
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    },
    
    // Sync all local data to cloud
    async syncToCloud(data) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return false;
        
        this.isSyncing = true;
        this.notifySyncListeners('syncing');
        
        try {
            await db.collection('users').doc(user.uid).set({
                notes: {
                    content: data.notes || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                todos: {
                    items: data.todos || [],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                reminders: {
                    items: data.reminders || [],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                preferences: {
                    theme: data.theme,
                    tempUnit: data.tempUnit,
                    clockLocations: data.clockLocations,
                    selectedTagColor: data.selectedTagColor,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            this.lastSyncTime = new Date();
            this.isSyncing = false;
            this.notifySyncListeners('synced');
            return true;
        } catch (error) {
            console.error('Error syncing to cloud:', error);
            this.isSyncing = false;
            this.notifySyncListeners('error');
            return false;
        }
    },
    
    // Setup real-time sync listener
    setupRealtimeSync(onDataChange) {
        const user = AuthService.getCurrentUser();
        if (!user || !db) return () => {};
        
        return db.collection('users').doc(user.uid).onSnapshot((doc) => {
            if (doc.exists && onDataChange) {
                const data = doc.data();
                // Only trigger if this wasn't our own update
                if (!this.isSyncing) {
                    onDataChange(data);
                }
            }
        }, (error) => {
            console.error('Realtime sync error:', error);
        });
    },
    
    // Add sync state listener
    addSyncListener(callback) {
        this.syncListeners.push(callback);
        return () => {
            this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
        };
    },
    
    // Notify all sync listeners
    notifySyncListeners(state) {
        this.syncListeners.forEach(callback => callback(state));
    }
};

// Check if Firebase config is set up
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
}
