// Firebase 配置 - 实时数据同步 (v8版本)
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

// 初始化 Firebase (v8版本)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 全局倒计时数据管理
class GlobalCountdownManager {
    constructor() {
        this.countdownRef = database.ref('countdown');
        this.setupRealtimeListener();
    }

    // 设置实时监听器
    setupRealtimeListener() {
        this.countdownRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('Received real-time countdown update:', data);
                this.updateLocalStorage(data);
                this.notifyCountdownUpdate(data);
            }
        });
    }

    // 更新本地存储
    updateLocalStorage(data) {
        try {
            localStorage.setItem('memeCoinCountdown', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to update localStorage:', error);
        }
    }

    // 通知页面更新
    notifyCountdownUpdate(data) {
        window.dispatchEvent(new CustomEvent('countdownUpdate', {
            detail: data
        }));
    }

    // 重置倒计时（管理员功能）
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

            await this.countdownRef.set(countdownData);
            console.log('Countdown reset successfully:', countdownData);
            return true;
        } catch (error) {
            console.error('Failed to reset countdown:', error);
            return false;
        }
    }

    // 更新活跃用户数
    async updateActiveUsers(count) {
        try {
            await this.countdownRef.child('activeUsers').set(count);
        } catch (error) {
            console.error('Failed to update active users:', error);
        }
    }

    // 获取当前倒计时数据
    async getCurrentCountdown() {
        try {
            const snapshot = await this.countdownRef.once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Failed to get countdown data:', error);
            return null;
        }
    }
}

// 用户连接管理
class UserConnectionManager {
    constructor() {
        this.connectionsRef = database.ref('connections');
        this.userId = this.generateUserId();
        this.setupConnection();
    }

    // 生成用户ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 设置连接
    setupConnection() {
        const userRef = this.connectionsRef.child(this.userId);
        
        // 设置用户在线状态
        userRef.set({
            connected: true,
            lastSeen: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // 监听连接状态
        userRef.onDisconnect().remove();

        // 定期更新最后活跃时间
        setInterval(() => {
            userRef.update({
                lastSeen: new Date().toISOString()
            });
        }, 30000); // 每30秒更新一次
    }

    // 断开连接
    disconnect() {
        this.connectionsRef.child(this.userId).remove();
    }
}

// 全局实例
window.globalCountdownManager = new GlobalCountdownManager();
window.userConnectionManager = new UserConnectionManager();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.userConnectionManager) {
        window.userConnectionManager.disconnect();
    }
});

console.log('Firebase real-time countdown manager initialized (v8)'); 