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
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinCountdown', countdownData);
            } else {
                localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
            }
            
            // Also save to backend configuration (backup)
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            let config = adminConfig ? JSON.parse(adminConfig) : {};
            
            config.countdown = {
                minutes: this.minutes,
                seconds: this.seconds,
                lastUpdate: new Date().toISOString()
            };
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinAdminConfig', config);
            } else {
                localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
            }
            
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
                } else {
                    // Global countdown has ended - determine winner
                    console.log('Global countdown ended - determining winner...');
                    this.determineMainCountdownWinner();
                    this.showLaunchMessage();
                    
                    // Clear the global countdown to prevent repeated execution
                    localStorage.removeItem('memeCoinCountdown');
                    
                    // Restart countdown after delay
                    setTimeout(() => {
                        this.restart();
                    }, 3000);
                    return;
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
            
            // Get countdown end time (current time)
            const countdownEndTime = Date.now();
            console.log('Countdown end time:', new Date(countdownEndTime).toISOString());
            
            // Filter buy transactions that occurred before countdown ended
            const buyTransactions = notificationList.filter(notification => {
                if (!notification.transaction || 
                    !notification.transaction.type || 
                    notification.transaction.type.toLowerCase() !== 'buy') {
                    return false;
                }
                
                // Check if transaction occurred before countdown ended
                const transactionTime = new Date(notification.timestamp).getTime();
                const isBeforeCountdownEnd = transactionTime <= countdownEndTime;
                
                console.log('Transaction time check:', {
                    transactionTime: new Date(transactionTime).toISOString(),
                    countdownEndTime: new Date(countdownEndTime).toISOString(),
                    isBeforeCountdownEnd: isBeforeCountdownEnd,
                    trader: notification.transaction.trader,
                    amount: notification.transaction.amount
                });
                
                return isBeforeCountdownEnd;
            });
            
            if (buyTransactions.length === 0) {
                console.log('No large buy transactions found before countdown end');
                return;
            }
            
            // Get the most recent large buy transaction (before countdown end)
            const lastBuyTransaction = buyTransactions[0]; // Already sorted by unshift()
            const winner = lastBuyTransaction.transaction.trader;
            const amount = lastBuyTransaction.transaction.amount;
            
            console.log('Main countdown winner determined:', {
                winner: winner,
                amount: amount,
                transaction: lastBuyTransaction,
                totalBuyTransactions: buyTransactions.length,
                countdownEndTime: new Date(countdownEndTime).toISOString()
            });
            
            // Check if this winner already has a recent reward (within last 5 minutes)
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const recentReward = existingRewards.find(reward => {
                if (reward.winner === winner) {
                    const rewardTime = new Date(reward.timestamp).getTime();
                    const timeDiff = countdownEndTime - rewardTime;
                    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
                    return timeDiff < fiveMinutes;
                }
                return false;
            });
            
            if (recentReward) {
                console.log('Winner already has a recent reward, skipping duplicate creation:', {
                    winner: winner,
                    existingRewardId: recentReward.id,
                    timeSinceLastReward: (countdownEndTime - new Date(recentReward.timestamp).getTime()) / 1000 + ' seconds'
                });
                return;
            }
            
            // Create main countdown address snapshot for reward evidence
            this.createMainCountdownAddressSnapshot(winner, amount, lastBuyTransaction);
            
            // Create main countdown reward
            this.createMainCountdownReward(winner, amount);
            
        } catch (error) {
            console.error('Failed to determine main countdown winner:', error);
        }
    }

    createMainCountdownAddressSnapshot(winner, amount, transaction) {
        try {
            console.log('Creating main countdown address snapshot for reward evidence...');
            
            // Create address snapshot data with enhanced evidence
            const addressSnapshot = {
                snapshotId: `main_countdown_snapshot_${Date.now()}`,
                type: 'main_countdown_end',
                winner: winner,
                transactionAmount: amount,
                transaction: transaction,
                timestamp: Date.now(),
                createdAt: new Date().toISOString(),
                evidence: {
                    address: winner,
                    transactionSignature: transaction.signature,
                    transactionAmount: amount,
                    transactionType: transaction.type,
                    blockTime: transaction.blockTime,
                    // 增强证据信息，类似持仓奖励的详细记录
                    snapshotDetails: {
                        countdownEndTime: new Date().toISOString(),
                        winnerDeterminationMethod: 'last_large_buy_transaction',
                        transactionHash: transaction.signature,
                        blockNumber: transaction.blockNumber || 'unknown',
                        gasUsed: transaction.gasUsed || 'unknown'
                    }
                },
                // 添加统计信息，类似持仓奖励
                statistics: {
                    totalLargeTransactions: this.getTotalLargeTransactions(),
                    totalBuyTransactions: this.getTotalBuyTransactions(),
                    winnerTransactionRank: this.getWinnerTransactionRank(transaction),
                    countdownDuration: this.getCountdownDuration()
                }
            };

            // 使用保护机制创建快照
            if (window.snapshotProtection) {
                const success = window.snapshotProtection.createSnapshot(addressSnapshot);
                if (success) {
                    console.log('✅ 主倒计时地址快照创建成功 (带保护):', addressSnapshot.snapshotId);
                    return addressSnapshot;
                } else {
                    console.error('❌ 保护机制创建快照失败，使用备用方法');
                }
            }

            // 备用方法：直接保存到 localStorage
            const existingSnapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            existingSnapshots.push(addressSnapshot);
            
            // Keep only last 20 main countdown snapshots
            if (existingSnapshots.length > 20) {
                existingSnapshots.shift();
            }

            // 立即创建备份
            this.createSnapshotBackup(existingSnapshots);

            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('mainCountdownAddressSnapshots', existingSnapshots);
            } else {
                localStorage.setItem('mainCountdownAddressSnapshots', JSON.stringify(existingSnapshots));
            }
            
            console.log('✅ 主倒计时地址快照创建成功 (备用方法):', addressSnapshot.snapshotId);
            console.log('Enhanced snapshot evidence data:', addressSnapshot.evidence);
            console.log('Snapshot statistics:', addressSnapshot.statistics);
            
            return addressSnapshot;
        } catch (error) {
            console.error('❌ Failed to create main countdown address snapshot:', error);
            return null;
        }
    }

    // 创建快照备份
    createSnapshotBackup(snapshots) {
        try {
            localStorage.setItem('mainCountdownAddressSnapshots_backup', JSON.stringify(snapshots));
            localStorage.setItem('lastSnapshotBackupTime', new Date().toISOString());
            console.log('✅ 快照备份创建成功');
        } catch (error) {
            console.error('❌ 快照备份创建失败:', error);
        }
    }

    // 新增：获取大额交易总数
    getTotalLargeTransactions() {
        try {
            const notifications = JSON.parse(localStorage.getItem('memeCoinLargeTransactionNotifications') || '[]');
            return notifications.length;
        } catch (error) {
            console.error('Failed to get total large transactions:', error);
            return 0;
        }
    }

    // 新增：获取买入交易总数
    getTotalBuyTransactions() {
        try {
            const notifications = JSON.parse(localStorage.getItem('memeCoinLargeTransactionNotifications') || '[]');
            return notifications.filter(notification => 
                notification.transaction && 
                notification.transaction.type && 
                notification.transaction.type.toLowerCase() === 'buy'
            ).length;
        } catch (error) {
            console.error('Failed to get total buy transactions:', error);
            return 0;
        }
    }

    // 新增：获取获胜者交易排名
    getWinnerTransactionRank(winnerTransaction) {
        try {
            const notifications = JSON.parse(localStorage.getItem('memeCoinLargeTransactionNotifications') || '[]');
            const buyTransactions = notifications.filter(notification => 
                notification.transaction && 
                notification.transaction.type && 
                notification.transaction.type.toLowerCase() === 'buy'
            );
            
            // 找到获胜者交易在买入交易中的排名（按时间倒序）
            const rank = buyTransactions.findIndex(notification => 
                notification.transaction.signature === winnerTransaction.signature
            );
            
            return rank >= 0 ? rank + 1 : 'unknown';
        } catch (error) {
            console.error('Failed to get winner transaction rank:', error);
            return 'unknown';
        }
    }

    // 新增：获取倒计时持续时间
    getCountdownDuration() {
        try {
            const countdownData = localStorage.getItem('memeCoinCountdown');
            if (countdownData) {
                const data = JSON.parse(countdownData);
                const startTime = new Date(data.startDate || data.targetDate);
                const endTime = new Date(data.targetDate);
                return Math.floor((endTime - startTime) / (1000 * 60)); // 返回分钟数
            }
            return 'unknown';
        } catch (error) {
            console.error('Failed to get countdown duration:', error);
            return 'unknown';
        }
    }

    createMainCountdownReward(winner, amount) {
        try {
            // Get the latest main countdown address snapshot for evidence
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
            
            // 增强主倒计时奖励记录，学习持仓奖励的完整结构
            const mainCountdownReward = {
                id: `main_countdown_reward_${Date.now()}`,
                type: 'main-countdown',
                round: this.getNextMainCountdownRewardRound(),
                amount: 10000, // Default main countdown reward amount
                winner: winner,
                transactionAmount: amount,
                timestamp: Date.now(),
                claimed: false,
                createdAt: new Date().toISOString(),
                snapshotId: latestSnapshot ? latestSnapshot.snapshotId : null,
                evidence: latestSnapshot ? latestSnapshot.evidence : null,
                // 新增：奖励详细信息，类似持仓奖励
                rewardDetails: {
                    rewardType: 'main_countdown_winner',
                    eligibilityCriteria: 'last_large_buy_transaction_at_countdown_end',
                    winnerDeterminationTime: new Date().toISOString(),
                    transactionEvidence: latestSnapshot ? latestSnapshot.evidence : null,
                    statistics: latestSnapshot ? latestSnapshot.statistics : null
                },
                // 新增：奖励状态跟踪
                status: {
                    created: true,
                    claimed: false,
                    claimedAt: null,
                    claimTransactionHash: null
                }
            };

            // Get existing main countdown rewards
            const existingRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            existingRewards.push(mainCountdownReward);
            
            // Keep only last 50 main countdown rewards
            if (existingRewards.length > 50) {
                existingRewards.shift();
            }

            // Save main countdown rewards with enhanced sync
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('mainCountdownRewards', existingRewards);
            } else {
                localStorage.setItem('mainCountdownRewards', JSON.stringify(existingRewards));
            }
            
            console.log('Enhanced main countdown reward created:', mainCountdownReward.id);
            console.log('Winner:', winner);
            console.log('Enhanced main countdown reward data:', mainCountdownReward);
            console.log('Reward details:', mainCountdownReward.rewardDetails);
            
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
        // 显示奖励领取弹窗，不改变倒计时样式
        this.showRewardClaimModal();
        console.log('Main countdown ended - showing reward claim modal');
    }

    showRewardClaimModal() {
        // 创建奖励领取弹窗
        const modal = document.createElement('div');
        modal.id = 'rewardClaimModal';
        modal.className = 'reward-claim-modal';
        modal.innerHTML = `
            <div class="reward-claim-content">
                <div class="reward-claim-header">
                    <h2>🎉 Round Complete!</h2>
                    <button class="reward-claim-close" onclick="this.closest('.reward-claim-modal').remove()">×</button>
                </div>
                <div class="reward-claim-body">
                    <div class="reward-claim-icon">🏆</div>
                    <h3>Congratulations!</h3>
                    <p>This round has ended. Please check if you've won any rewards!</p>
                    <div class="reward-claim-buttons">
                        <button class="reward-claim-btn primary" onclick="this.closest('.reward-claim-modal').remove(); window.open('claim-reward.html', '_blank');">
                            🎁 Claim Rewards
                        </button>
                        <button class="reward-claim-btn secondary" onclick="this.closest('.reward-claim-modal').remove();">
                            Continue Watching
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 自动关闭弹窗（10秒后）
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
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
        
       
      
        console.log('Countdown restarted - keeping existing interface style');
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
            
            // Use BackendManager for sync if available
            if (window.backendManager) {
                window.backendManager.setLocalStorageWithSync('memeCoinAdminConfig', config);
            } else {
                localStorage.setItem('memeCoinAdminConfig', JSON.stringify(config));
            }
            
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

// 主倒计时快照保护机制
class SnapshotProtection {
    constructor() {
        this.backupEnabled = true;
        this.autoBackupInterval = 30000; // 30秒
        this.maxSnapshots = 50;
        this.maxBackups = 10;
    }

    // 创建快照时自动备份
    createSnapshot(snapshotData) {
        try {
            // 1. 保存到主存储
            const existingSnapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            existingSnapshots.push(snapshotData);
            
            // 2. 限制快照数量
            if (existingSnapshots.length > this.maxSnapshots) {
                existingSnapshots.splice(0, existingSnapshots.length - this.maxSnapshots);
            }
            
            localStorage.setItem('mainCountdownAddressSnapshots', JSON.stringify(existingSnapshots));
            
            // 3. 立即备份
            this.createBackup();
            
            // 4. 同步到 Firebase (如果可用)
            if (window.backendManager && window.backendManager.firebaseEnabled) {
                window.backendManager.setLocalStorageWithSync('mainCountdownAddressSnapshots', existingSnapshots);
            }
            
            console.log('✅ 快照创建成功并已备份:', snapshotData.snapshotId);
            return true;
        } catch (error) {
            console.error('❌ 快照创建失败:', error);
            return false;
        }
    }

    // 创建备份
    createBackup() {
        if (!this.backupEnabled) return;
        
        try {
            const snapshots = localStorage.getItem('mainCountdownAddressSnapshots');
            const rewards = localStorage.getItem('mainCountdownRewards');
            
            if (snapshots) {
                localStorage.setItem('mainCountdownAddressSnapshots_backup', snapshots);
            }
            if (rewards) {
                localStorage.setItem('mainCountdownRewards_backup', rewards);
            }
            
            localStorage.setItem('lastBackupTime', new Date().toISOString());
            console.log('✅ 数据备份完成');
        } catch (error) {
            console.error('❌ 备份失败:', error);
        }
    }

    // 从备份恢复
    restoreFromBackup() {
        try {
            const backupSnapshots = localStorage.getItem('mainCountdownAddressSnapshots_backup');
            const backupRewards = localStorage.getItem('mainCountdownRewards_backup');
            
            if (backupSnapshots) {
                localStorage.setItem('mainCountdownAddressSnapshots', backupSnapshots);
                console.log('✅ 快照数据已从备份恢复');
            }
            if (backupRewards) {
                localStorage.setItem('mainCountdownRewards', backupRewards);
                console.log('✅ 奖励数据已从备份恢复');
            }
            
            return true;
        } catch (error) {
            console.error('❌ 恢复失败:', error);
            return false;
        }
    }

    // 验证数据完整性
    validateDataIntegrity() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('mainCountdownAddressSnapshots') || '[]');
            const rewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            
            const snapshotIds = snapshots.map(s => s.snapshotId);
            const rewardSnapshotIds = rewards.filter(r => r.snapshotId).map(r => r.snapshotId);
            
            const missingInSnapshots = rewardSnapshotIds.filter(id => !snapshotIds.includes(id));
            const missingInRewards = snapshotIds.filter(id => !rewardSnapshotIds.includes(id));
            
            return {
                isValid: missingInSnapshots.length === 0 && missingInRewards.length === 0,
                missingInSnapshots,
                missingInRewards
            };
        } catch (error) {
            console.error('❌ 数据完整性检查失败:', error);
            return { isValid: false, error: error.message };
        }
    }

    // 启动自动备份
    startAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
        
        this.backupInterval = setInterval(() => {
            this.createBackup();
        }, this.autoBackupInterval);
        
        console.log('✅ 自动备份已启动');
    }

    // 停止自动备份
    stopAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
            console.log('⏹️ 自动备份已停止');
        }
    }
}

// 全局快照保护实例
window.snapshotProtection = new SnapshotProtection();
window.snapshotProtection.startAutoBackup();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CountdownManager, MainCountdown, RewardCountdown };
} 
