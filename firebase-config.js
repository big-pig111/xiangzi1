// Firebase Configuration - Real-time Data Synchronization
const firebaseConfig = {
    apiKey: "AIzaSyA5Z5ieEbAcfQX0kxGSn9ldGXhzvAwx_8M",
    authDomain: "chat-294cc.firebaseapp.com",
    databaseURL: "https://chat-294cc-default-rtdb.firebaseio.com",
    projectId: "chat-294cc",
    storageBucket: "chat-294cc.firebasestorage.app",
    messagingSenderId: "913615304269",
    appId: "1:913615304269:web:0274ffaccb8e6b678e4e04",
    measurementId: "G-SJR9NDW86B"
};

// Initialize Firebase (v9 modular version)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, onValue, set, push, onDisconnect, remove, update, get, child } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global countdown data management
class GlobalCountdownManager {
    constructor() {
        this.countdownRef = ref(database, 'countdown');
        this.setupRealtimeListener();
    }

    // Set up real-time listener
    setupRealtimeListener() {
        onValue(this.countdownRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Received real-time countdown update:', data);
                this.updateLocalStorage(data);
                this.notifyCountdownUpdate(data);
            }
        });
    }

    // Update local storage
    updateLocalStorage(data) {
        try {
            localStorage.setItem('memeCoinCountdown', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to update localStorage:', error);
        }
    }

    // Notify page update
    notifyCountdownUpdate(data) {
        window.dispatchEvent(new CustomEvent('countdownUpdate', {
            detail: data
        }));
    }

    // Reset countdown (admin function)
    async resetCountdown(minutes) {
        try {
            const now = new Date();
            const newTargetDate = new Date(now.getTime() + minutes * 60 * 1000);
            
            const countdownData = {
                targetDate: newTargetDate.toISOString(),
                lastUpdate: new Date().toISOString(),
                resetBy: 'admin-panel',
                version: '2.0',
                activeUsers: 0
            };

            await set(this.countdownRef, countdownData);
            console.log('Countdown reset successfully:', countdownData);
            return true;
        } catch (error) {
            console.error('Failed to reset countdown:', error);
            return false;
        }
    }

    // Update active user count
    async updateActiveUsers(count) {
        try {
            const activeUsersRef = child(this.countdownRef, 'activeUsers');
            await set(activeUsersRef, count);
        } catch (error) {
            console.error('Failed to update active users:', error);
        }
    }

    // Get current countdown data
    async getCurrentCountdown() {
        try {
            const snapshot = await get(this.countdownRef);
            return snapshot.val();
        } catch (error) {
            console.error('Failed to get countdown data:', error);
            return null;
        }
    }
}

// User connection management
class UserConnectionManager {
    constructor() {
        this.connectionsRef = ref(database, 'connections');
        this.userId = this.generateUserId();
        this.setupConnection();
    }

    // Generate user ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Set up connection
    setupConnection() {
        const userRef = child(this.connectionsRef, this.userId);
        
        // Set user online status
        set(userRef, {
            connected: true,
            lastSeen: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // Monitor connection status
        onDisconnect(userRef).remove();

        // Periodically update last active time
        setInterval(() => {
            update(userRef, {
                lastSeen: new Date().toISOString()
            });
        }, 30000); // Update every 30 seconds
    }

    // Disconnect
    disconnect() {
        const userRef = child(this.connectionsRef, this.userId);
        remove(userRef);
    }
}

// Global instances
window.globalCountdownManager = new GlobalCountdownManager();
window.userConnectionManager = new UserConnectionManager();

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    if (window.userConnectionManager) {
        window.userConnectionManager.disconnect();
    }
});

console.log('Firebase real-time countdown manager initialized'); 
