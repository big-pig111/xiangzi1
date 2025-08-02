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
            // Prioritize loading from global countdown storage
            const globalCountdown = localStorage.getItem('memeCoinCountdown');
            if (globalCountdown) {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
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
            
            // Fallback to backend configuration
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
            // Check if global countdown already exists, if so don't overwrite
            const existingGlobalCountdown = localStorage.getItem('memeCoinCountdown');
            if (existingGlobalCountdown) {
                try {
                    const data = JSON.parse(existingGlobalCountdown);
                    const targetDate = new Date(data.targetDate);
                    const now = new Date();
                    
                    // If global countdown hasn't expired, don't overwrite it
                    if (targetDate > now) {
                        console.log('Global countdown exists and not expired, skipping save');
                        return;
                    }
                } catch (error) {
                    console.error('Failed to parse existing global countdown:', error);
                }
            }
            
            // Save to global countdown storage (primary storage)
            const now = new Date();
            const targetDate = new Date(now.getTime() + (this.minutes * 60 + this.seconds) * 1000);
            
            const countdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
            
            // Also save to backend configuration (backup)
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
        // First check if global countdown has updates
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // If global countdown differs from current display, update display
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Countdown updated from global storage:', this.minutes, this.seconds);
                        return; // Don't execute local countdown logic
                    }
                }
            } catch (error) {
                console.error('Failed to parse global countdown:', error);
            }
        }
        
        // Local countdown logic
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                // Main countdown ended - determine winner and create reward
                this.determineMainCountdownWinner();
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
        // Only save to backend when there's no global countdown update
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

    determineMainCountdownWinner() {
        try {
            console.log('Main countdown ended - determining winner...');
            
            // Get the last large buy transaction
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            if (!notifications) {
                console.log('No large transaction notifications found');
                return;
            }
            
            const notificationList = JSON.parse(notifications);
            const buyTransactions = notificationList.filter(notification => 
                notification.transaction && 
                notification.transaction.type && 
                notification.transaction.type.toLowerCase() === 'buy'
            );
            
            if (buyTransactions.length === 0) {
                console.log('No large buy transactions found');
                return;
            }
            
            // Get the most recent large buy transaction
            const lastBuyTransaction = buyTransactions[0]; // Already sorted by unshift()
            const winner = lastBuyTransaction.transaction.trader;
            const amount = lastBuyTransaction.transaction.amount;
            
            console.log('Main countdown winner determined:', {
                winner: winner,
                amount: amount,
                transaction: lastBuyTransaction
            });
            
            // Create main countdown reward
            this.createMainCountdownReward(winner, amount);
            
        } catch (error) {
            console.error('Failed to determine main countdown winner:', error);
        }
    }

    createMainCountdownReward(winner, amount) {
        try {
            const mainCountdownReward = {
                id: `main_countdown_reward_${Date.now()}`,
                type: 'main-countdown',
                round: this.getNextMainCountdownRewardRound(),
                amount: 10000, // Default main countdown reward amount
                winner: winner,
                transactionAmount: amount,
                timestamp: Date.now(),
                claimed: false,
                createdAt: new Date().toISOString()
            };

            // Get existing main countdown rewards
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            existingRewards.push(mainCountdownReward);
            
            // Keep only last 50 main countdown rewards
            if (existingRewards.length > 50) {
                existingRewards.shift();
            }

            // Save main countdown rewards
            localStorage.setItem('mainCountdownRewards', JSON.stringify(existingRewards));
            
            console.log('Main countdown reward created:', mainCountdownReward.id);
            console.log('Winner:', winner);
            console.log('Main countdown reward data:', mainCountdownReward);
            
            // Show winner notification
            this.showWinnerNotification(winner, amount);
            
            return mainCountdownReward;
        } catch (error) {
            console.error('Failed to create main countdown reward:', error);
            return null;
        }
    }

    getNextMainCountdownRewardRound() {
        try {
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const maxRound = existingRewards.reduce((max, reward) => {
                return Math.max(max, reward.round || 0);
            }, 0);
            return maxRound + 1;
        } catch (error) {
            console.error('Failed to get next main countdown reward round:', error);
            return 1;
        }
    }

    showWinnerNotification(winner, amount) {
        try {
            // Create winner notification
            const winnerNotification = {
                type: 'main_countdown_winner',
                timestamp: new Date().toISOString(),
                winner: winner,
                amount: amount,
                message: `🏆 MAIN COUNTDOWN WINNER! ${winner.slice(0, 6)}...${winner.slice(-4)} won with ${amount} tokens!`
            };

            // Store winner notification
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            let notificationList = notifications ? JSON.parse(notifications) : [];
            notificationList.unshift(winnerNotification);
            
            // Keep only the latest 50 notifications
            if (notificationList.length > 50) {
                notificationList = notificationList.slice(0, 50);
            }
            
            localStorage.setItem('memeCoinLargeTransactionNotifications', JSON.stringify(notificationList));
            
            console.log('Winner notification created:', winnerNotification);
            
        } catch (error) {
            console.error('Failed to show winner notification:', error);
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
        // Get default time from backend configuration
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
        
        // Prioritize reading from global countdown
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
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
                    return; // Don't execute backend configuration update
                }
            } catch (error) {
                console.error('Failed to parse global countdown:', error);
            }
        }
        
        // Only use backend configuration when there's no global countdown
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
            // Prioritize loading from global holding countdown storage
            const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (globalRewardCountdown) {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
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
            
            // Fallback to backend configuration
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
            // Check if global holding countdown already exists, if so don't overwrite
            const existingGlobalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
            if (existingGlobalRewardCountdown) {
                try {
                    const data = JSON.parse(existingGlobalRewardCountdown);
                    const targetDate = new Date(data.targetDate);
                    const now = new Date();
                    
                    // If global holding countdown hasn't expired, don't overwrite it
                    if (targetDate > now) {
                        console.log('Global reward countdown exists and not expired, skipping save');
                        return;
                    }
                } catch (error) {
                    console.error('Failed to parse existing global reward countdown:', error);
                }
            }
            
            // Save to global holding countdown storage (primary storage)
            const now = new Date();
            const targetDate = new Date(now.getTime() + (this.minutes * 60 + this.seconds) * 1000);
            
            const countdownData = {
                targetDate: targetDate.toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(countdownData));
            
            // Also save to backend configuration (backup)
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
        // First check if global holding countdown has updates
        const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
        if (globalRewardCountdown) {
            try {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // If global holding countdown differs from current display, update display
                    if (remainingMinutes !== this.minutes || remainingSeconds !== this.seconds) {
                        this.minutes = remainingMinutes;
                        this.seconds = remainingSeconds;
                        this.updateDisplay();
                        console.log('Reward countdown updated from global storage:', this.minutes, this.seconds);
                        return; // Don't execute local countdown logic
                    }
                }
            } catch (error) {
                console.error('Failed to parse global reward countdown:', error);
            }
        }
        
        // Local countdown logic
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
        // Only save to backend when there's no global holding countdown update
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
        
        // Ensure countdown restarts
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    updateFromBackend(backendConfig) {
        console.log('RewardCountdown updateFromBackend called with:', backendConfig);
        
        // Prioritize reading from global holding countdown
        const globalRewardCountdown = localStorage.getItem('memeCoinRewardCountdown');
        if (globalRewardCountdown) {
            try {
                const data = JSON.parse(globalRewardCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // Calculate remaining time
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
                    return; // Don't execute backend configuration update
                }
            } catch (error) {
                console.error('Failed to parse global reward countdown:', error);
            }
        }
        
        // Only use backend configuration when there's no global holding countdown
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
