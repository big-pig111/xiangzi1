/**
 * Countdown Manager Module
 * Handles main countdown and reward countdown functionality
 */

class CountdownManager {
    constructor() {
        this.mainCountdown = null;
        this.rewardCountdown = null;
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.setupMainCountdown();
        this.setupRewardCountdown();
        this.startSyncWithBackend();
    }

    // Main Countdown Management
    setupMainCountdown() {
        this.mainCountdown = new MainCountdown();
        this.mainCountdown.init();
    }

    // Reward Countdown Management
    setupRewardCountdown() {
        this.rewardCountdown = new RewardCountdown();
        this.rewardCountdown.init();
    }

    // Backend Synchronization
    startSyncWithBackend() {
        this.syncInterval = setInterval(() => {
            this.checkBackendUpdates();
        }, 1000); // Check every 1 second for more responsive updates
    }

    checkBackendUpdates() {
        try {
            // Always check for main countdown updates
            if (this.mainCountdown) {
                this.mainCountdown.updateFromBackend({});
            }
            
            // Always check for reward countdown updates
            if (this.rewardCountdown) {
                this.rewardCountdown.updateFromBackend({});
            }
        } catch (error) {
            console.error('Failed to check backend updates:', error);
        }
    }

    start() {
        // Start countdown synchronization
        this.startSyncWithBackend();
    }

    destroy() {
        if (this.mainCountdown) {
            this.mainCountdown.destroy();
        }
        if (this.rewardCountdown) {
            this.rewardCountdown.destroy();
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Main Countdown Class
class MainCountdown {
    constructor() {
        this.minutes = 5;
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        this.lastUpdate = null;
    }

    init() {
        this.loadFromBackend();
        this.start();
    }

    loadFromBackend() {
        try {
            // 优先从全局倒计时存储加载
            const globalCountdown = localStorage.getItem('memeCoinCountdown');
            if (globalCountdown) {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    this.minutes = remainingMinutes;
                    this.seconds = remainingSeconds;
                    this.lastUpdate = data.lastUpdate;
                    console.log('Loaded countdown from global storage:', this.minutes, this.seconds);
                    return;
                }
            }
            
            // 回退到后台配置
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const config = JSON.parse(adminConfig);
                if (config.countdown) {
                    this.minutes = config.countdown.minutes || 5;
                    this.seconds = 0;
                    this.lastUpdate = config.countdown.lastUpdate;
                }
            }
        } catch (error) {
            console.error('Failed to load main countdown from backend:', error);
        }
    }

    saveToBackend() {
        try {
            // 检查是否已经有全局倒计时，如果有则不覆盖
            const existingGlobalCountdown = localStorage.getItem('memeCoinCountdown');
            if (existingGlobalCountdown) {
                try {
                    const data = JSON.parse(existingGlobalCountdown);
                    const targetDate = new Date(data.targetDate);
                    const now = new Date();
                    
                    // 如果全局倒计时还没有过期，不覆盖它
                    if (targetDate > now) {
                        console.log('Global countdown exists and not expired, skipping save');
                        return;
                    }
                } catch (error) {
                    console.error('Failed to parse existing global countdown:', error);
                }
            }
            
            // 保存到全局倒计时存储（主要存储）
            const now = new Date();
            const targetDate = new Date(now.getTime() + (this.minutes * 60 + this.seconds) * 1000);
            
            const countdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
            
            // 同时保存到后台配置（备份）
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            let config = adminConfig ? JSON.parse(adminConfig) : {};
            
            config.countdown = {
                minutes: this.minutes,
                seconds: this.seconds,
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
            
            console.log('Countdown saved to backend:', countdownData);
        } catch (error) {
            console.error('Failed to save main countdown to backend:', error);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.update();
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    update() {
        // 首先检查全局倒计时是否有更新
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // 如果全局倒计时与当前显示不同，更新显示
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Countdown updated from global storage:', this.minutes, this.seconds);
                        return; // 不执行本地倒计时逻辑
                    }
                }
            } catch (error) {
                console.error('Failed to parse global countdown:', error);
            }
        }
        
        // 本地倒计时逻辑
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                this.showLaunchMessage();
                setTimeout(() => {
                    this.restart();
                }, 3000);
                return;
            } else {
                this.minutes--;
                this.seconds = 59;
            }
        } else {
            this.seconds--;
        }

        this.updateDisplay();
        // 只有在没有全局倒计时更新时才保存到后端
        if (!globalCountdown) {
            this.saveToBackend();
        }
    }

    updateDisplay() {
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (minutesElement) {
            minutesElement.textContent = this.minutes.toString().padStart(2, '0');
        }
        if (secondsElement) {
            secondsElement.textContent = this.seconds.toString().padStart(2, '0');
        }
    }

    showLaunchMessage() {
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <div class="launch-message">
                    <h2>🚀 LAUNCHED! 🚀</h2>
                    <p>TO THE MOON!!!</p>
                </div>
            `;
        }
    }

    restart() {
        // 从后台配置获取默认时间
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const config = JSON.parse(adminConfig);
                this.minutes = config.countdown?.minutes || 5;
            } else {
                this.minutes = 5;
            }
        } catch (error) {
            this.minutes = 5;
        }
        
        this.seconds = 0;
        this.saveToBackend();
        this.updateDisplay();
        
        // Restore countdown display
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <h2 class="countdown-title">Time Until Launch</h2>
                <p class="countdown-subtitle">
                    🌐 Global shared countdown - All players synchronized
                    <span class="connection-indicator" id="syncStatus">🟢 Connected</span>
                </p>
                <div id="countdown" class="countdown-grid">
                    <div class="countdown-block purple">
                        <div id="minutes" class="countdown-number">05</div>
                        <div class="countdown-label">MINUTES</div>
                    </div>
                    <div class="countdown-block green">
                        <div id="seconds" class="countdown-number">00</div>
                        <div class="countdown-label">SECONDS</div>
                    </div>
                </div>
            `;
        }
    }

    updateFromBackend(backendConfig) {
        console.log('MainCountdown updateFromBackend called with:', backendConfig);
        
        // 优先从全局倒计时读取
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    console.log('Updating from global countdown:', {
                        targetDate,
                        now,
                        remainingMinutes,
                        remainingSeconds
                    });
                    
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Main countdown updated from global countdown');
                    }
                    return; // 不执行后端配置更新
                }
            } catch (error) {
                console.error('Failed to parse global countdown:', error);
            }
        }
        
        // 只有在没有全局倒计时时才使用后端配置
        if (backendConfig && (backendConfig.minutes !== this.minutes || backendConfig.seconds !== this.seconds)) {
            this.minutes = backendConfig.minutes || 5;
            this.seconds = backendConfig.seconds || 0;
            this.updateDisplay();
            console.log('Main countdown updated from backend config');
        }
    }

    destroy() {
        this.stop();
    }
}

// Reward Countdown Class
class RewardCountdown {
    constructor() {
        this.minutes = 20;
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        this.lastUpdate = null;
    }

    init() {
        this.loadFromBackend();
        this.start();
    }

    loadFromBackend() {
        try {
            // 优先从全局持仓倒计时存储加载
            const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (globalRewardCountdown) {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    this.minutes = remainingMinutes;
                    this.seconds = remainingSeconds;
                    this.lastUpdate = data.lastUpdate;
                    console.log('Loaded reward countdown from global storage:', this.minutes, this.seconds);
                    return;
                }
            }
            
            // 回退到后台配置
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const config = JSON.parse(adminConfig);
                if (config.rewardCountdown) {
                    this.minutes = config.rewardCountdown.minutes || 20;
                    this.seconds = config.rewardCountdown.seconds || 0;
                    this.lastUpdate = config.rewardCountdown.lastUpdate;
                }
            }
        } catch (error) {
            console.error('Failed to load reward countdown from backend:', error);
        }
    }

    saveToBackend() {
        try {
            // 检查是否已经有全局持仓倒计时，如果有则不覆盖
            const existingGlobalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (existingGlobalRewardCountdown) {
                try {
                    const data = JSON.parse(existingGlobalRewardCountdown);
                    const targetDate = new Date(data.targetDate);
                    const now = new Date();
                    
                    // 如果全局持仓倒计时还没有过期，不覆盖它
                    if (targetDate > now) {
                        console.log('Global reward countdown exists and not expired, skipping save');
                        return;
                    }
                } catch (error) {
                    console.error('Failed to parse existing global reward countdown:', error);
                }
            }
            
            // 保存到全局持仓倒计时存储（主要存储）
            const now = new Date();
            const targetDate = new Date(now.getTime() + (this.minutes * 60 + this.seconds) * 1000);
            
            const countdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(countdownData));
            
            // 同时保存到后台配置（备份）
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            let config = adminConfig ? JSON.parse(adminConfig) : {};
            
            config.rewardCountdown = {
                minutes: this.minutes,
                seconds: this.seconds,
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
            
            console.log('Reward countdown saved to backend:', countdownData);
        } catch (error) {
            console.error('Failed to save reward countdown to backend:', error);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.update();
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    update() {
        // 首先检查全局持仓倒计时是否有更新
        const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
        if (globalRewardCountdown) {
            try {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // 如果全局持仓倒计时与当前显示不同，更新显示
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Reward countdown updated from global storage:', this.minutes, this.seconds);
                        return; // 不执行本地倒计时逻辑
                    }
                }
            } catch (error) {
                console.error('Failed to parse global reward countdown:', error);
            }
        }
        
        // 本地倒计时逻辑
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                // Save holders snapshot when reward countdown ends
                this.saveHoldersSnapshotOnRewardEnd();
                this.resetToBackend();
            } else {
                this.minutes--;
                this.seconds = 59;
            }
        } else {
            this.seconds--;
        }

        this.updateDisplay();
        // 只有在没有全局持仓倒计时更新时才保存到后端
        if (!globalRewardCountdown) {
            this.saveToBackend();
        }
    }

    saveHoldersSnapshotOnRewardEnd() {
        try {
            // Get TokenHoldersManager instance and save snapshot
            if (window.memeCoinApp && window.memeCoinApp.getTokenHoldersManager()) {
                const holdersManager = window.memeCoinApp.getTokenHoldersManager();
                if (holdersManager && typeof holdersManager.saveHoldersSnapshotOnRewardEnd === 'function') {
                    const snapshot = holdersManager.saveHoldersSnapshotOnRewardEnd();
                    console.log('Reward countdown ended - saved holders snapshot:', snapshot);
                }
            }
        } catch (error) {
            console.error('Failed to save holders snapshot on reward end:', error);
        }
    }

    updateDisplay() {
        const rewardCountdownElement = document.getElementById('rewardCountdown');
        if (rewardCountdownElement) {
            rewardCountdownElement.textContent = 
                `${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
        }
    }

    resetToBackend() {
        console.log('Reward countdown resetting to backend configuration');
        this.loadFromBackend();
        this.saveToBackend();
        
        // 确保倒计时重新启动
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    updateFromBackend(backendConfig) {
        console.log('RewardCountdown updateFromBackend called with:', backendConfig);
        
        // 优先从全局持仓倒计时读取
        const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
        if (globalRewardCountdown) {
            try {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 计算剩余时间
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    console.log('Updating reward countdown from global storage:', {
                        targetDate,
                        now,
                        remainingMinutes,
                        remainingSeconds
                    });
                    
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Reward countdown updated from global storage');
                    }
                    return; // 不执行后端配置更新
                }
            } catch (error) {
                console.error('Failed to parse global reward countdown:', error);
            }
        }
        
        // 只有在没有全局持仓倒计时时才使用后端配置
        if (backendConfig && (backendConfig.minutes !== this.minutes || backendConfig.seconds !== this.seconds)) {
            this.minutes = backendConfig.minutes || 20;
            this.seconds = backendConfig.seconds || 0;
            this.updateDisplay();
            console.log('Reward countdown updated from backend config');
        }
    }

    destroy() {
        this.stop();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CountdownManager, MainCountdown, RewardCountdown };
} 