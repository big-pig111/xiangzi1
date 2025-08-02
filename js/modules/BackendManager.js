/**
 * Backend Manager Module
 * Handles communication with backend system and configuration management
 */

class BackendManager {
    constructor() {
        this.config = null;
        this.syncInterval = null;
        this.init();
    }

    init() {
        this.loadConfig();
        this.startSync();
    }

    // Configuration Management
    loadConfig() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            this.config = adminConfig ? JSON.parse(adminConfig) : this.getDefaultConfig();
        } catch (error) {
            console.error('Failed to load backend config:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            rpc: {
                url: '',
                connected: false,
                lastTest: null
            },
            token: {
                address: '',
                name: '',
                validated: false
            },
            countdown: {
                minutes: 5,
                seconds: 0,
                message: 'TO THE MOON!!! 🚀',
                lastUpdate: new Date().toISOString()
            },
            rewardCountdown: {
                minutes: 20,
                seconds: 0,
                lastUpdate: new Date().toISOString()
            },
            detection: {
                isRunning: false,
                startTime: null,
                lastUpdate: null
            },
            system: {
                lastUpdate: new Date().toISOString(),
                uptime: new Date().toISOString()
            }
        };
    }

    getConfig() {
        return this.config;
    }

    saveConfig() {
        try {
            this.config.system.lastUpdate = new Date().toISOString();
            localStorage.setItem('memeCoinAdminConfig', JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Failed to save backend config:', error);
            return false;
        }
    }

    // Synchronization
    startSync() {
        this.syncInterval = setInterval(() => {
            this.syncWithBackend();
        }, 5000); // Sync every 5 seconds
    }

    syncWithBackend() {
        try {
            const adminConfig = localStorage.getItem('memeCoinAdminConfig');
            if (adminConfig) {
                const backendConfig = JSON.parse(adminConfig);
                
                // Update local config with backend changes
                this.updateConfigFromBackend(backendConfig);
                
                // Save any local changes back to backend
                this.saveConfig();
            }
        } catch (error) {
            console.error('Failed to sync with backend:', error);
        }
    }

    updateConfigFromBackend(backendConfig) {
        // Update RPC configuration
        if (backendConfig.rpc) {
            this.config.rpc = { ...this.config.rpc, ...backendConfig.rpc };
        }

        // Update token configuration
        if (backendConfig.token) {
            this.config.token = { ...this.config.token, ...backendConfig.token };
        }

        // Update countdown configuration
        if (backendConfig.countdown) {
            this.config.countdown = { ...this.config.countdown, ...backendConfig.countdown };
        }

        // Update reward countdown configuration
        if (backendConfig.rewardCountdown) {
            this.config.rewardCountdown = { ...this.config.rewardCountdown, ...backendConfig.rewardCountdown };
        }

        // Update detection configuration
        if (backendConfig.detection) {
            this.config.detection = { ...this.config.detection, ...backendConfig.detection };
        }
    }

    // RPC Management
    updateRPCConfig(url, connected = false) {
        this.config.rpc.url = url;
        this.config.rpc.connected = connected;
        this.config.rpc.lastTest = new Date().toISOString();
        this.saveConfig();
    }

    getRPCConfig() {
        return this.config.rpc;
    }

    // Token Management
    updateTokenConfig(address, name, validated = false) {
        this.config.token.address = address;
        this.config.token.name = name;
        this.config.token.validated = validated;
        this.saveConfig();
    }

    getTokenConfig() {
        return this.config.token;
    }

    // Countdown Management
    updateCountdownConfig(minutes, seconds = 0, message = null) {
        this.config.countdown.minutes = minutes;
        this.config.countdown.seconds = seconds;
        if (message) {
            this.config.countdown.message = message;
        }
        this.config.countdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getCountdownConfig() {
        return this.config.countdown;
    }

    // Reward Countdown Management
    updateRewardCountdownConfig(minutes, seconds = 0) {
        this.config.rewardCountdown.minutes = minutes;
        this.config.rewardCountdown.seconds = seconds;
        this.config.rewardCountdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getRewardCountdownConfig() {
        return this.config.rewardCountdown;
    }

    // Detection Management
    updateDetectionConfig(isRunning, rpcUrl = null, tokenAddress = null) {
        this.config.detection.isRunning = isRunning;
        if (isRunning) {
            this.config.detection.startTime = new Date().toISOString();
        } else {
            this.config.detection.startTime = null;
        }
        this.config.detection.lastUpdate = new Date().toISOString();
        this.saveConfig();

        // Also update detection control
        if (isRunning && rpcUrl && tokenAddress) {
            this.setDetectionControl(isRunning, rpcUrl, tokenAddress);
        } else if (!isRunning) {
            this.clearDetectionControl();
        }
    }

    getDetectionConfig() {
        return this.config.detection;
    }

    // Detection Control
    setDetectionControl(isRunning, rpcUrl, tokenAddress) {
        try {
            const detectionConfig = {
                isRunning: isRunning,
                rpcUrl: rpcUrl,
                tokenAddress: tokenAddress,
                startTime: new Date().toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinDetection', JSON.stringify(detectionConfig));
        } catch (error) {
            console.error('Failed to set detection control:', error);
        }
    }

    clearDetectionControl() {
        try {
            localStorage.removeItem('memeCoinDetection');
        } catch (error) {
            console.error('Failed to clear detection control:', error);
        }
    }

    getDetectionControl() {
        try {
            const detectionConfig = localStorage.getItem('memeCoinDetection');
            return detectionConfig ? JSON.parse(detectionConfig) : null;
        } catch (error) {
            console.error('Failed to get detection control:', error);
            return null;
        }
    }

    // Transaction Management
    getBackendTransactions() {
        try {
            const backendData = localStorage.getItem('memeCoinBackendTransactions');
            if (backendData) {
                const data = JSON.parse(backendData);
                return data.transactions || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to get backend transactions:', error);
            return [];
        }
    }

    addBackendTransaction(transactionData) {
        try {
            const backendData = localStorage.getItem('memeCoinBackendTransactions');
            let data = backendData ? JSON.parse(backendData) : { transactions: [] };
            
            // Check for duplicates
            const isDuplicate = data.transactions.some(tx => tx.signature === transactionData.signature);
            if (isDuplicate) {
                return false;
            }

            data.transactions.unshift(transactionData);
            
            // Keep only the latest 100 transactions
            const maxTransactions = 100;
            if (data.transactions.length > maxTransactions) {
                data.transactions = data.transactions.slice(0, maxTransactions);
            }

            data.lastUpdate = new Date().toISOString();
            localStorage.setItem('memeCoinBackendTransactions', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to add backend transaction:', error);
            return false;
        }
    }

    clearBackendTransactions() {
        try {
            localStorage.removeItem('memeCoinBackendTransactions');
            return true;
        } catch (error) {
            console.error('Failed to clear backend transactions:', error);
            return false;
        }
    }

    // System Status
    updateSystemStatus() {
        this.config.system.lastUpdate = new Date().toISOString();
        this.saveConfig();
    }

    getSystemStatus() {
        return {
            ...this.config.system,
            uptime: this.calculateUptime()
        };
    }

    calculateUptime() {
        try {
            const startTime = new Date(this.config.system.uptime);
            const now = new Date();
            const diff = now - startTime;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            return { days, hours, minutes, seconds };
        } catch (error) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    }

    // Utility Methods
    validateConfig() {
        const errors = [];
        
        if (!this.config.rpc.url) {
            errors.push('RPC URL is required');
        }
        
        if (!this.config.token.address) {
            errors.push('Token address is required');
        }
        
        if (this.config.countdown.minutes < 1 || this.config.countdown.minutes > 1440) {
            errors.push('Countdown minutes must be between 1 and 1440');
        }
        
        if (this.config.rewardCountdown.minutes < 1 || this.config.rewardCountdown.minutes > 1440) {
            errors.push('Reward countdown minutes must be between 1 and 1440');
        }
        
        return errors;
    }

    exportConfig() {
        try {
            const exportData = {
                ...this.config,
                exportTime: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-coin-config-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Failed to export config:', error);
            return false;
        }
    }

    importConfig(configData) {
        try {
            const importedConfig = typeof configData === 'string' ? 
                JSON.parse(configData) : configData;
            
            // Validate imported config
            if (!importedConfig.rpc || !importedConfig.token || !importedConfig.countdown) {
                throw new Error('Invalid config format');
            }
            
            // Update local config
            this.config = { ...this.getDefaultConfig(), ...importedConfig };
            this.saveConfig();
            
            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }

    // Cleanup
    start() {
        // Backend Manager is already started in init()
        console.log('Backend Manager started');
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackendManager };
} 