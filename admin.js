<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meme Coin Admin Panel</title>
    <meta name="description" content="Meme Coin Admin Management System">
    <meta name="keywords" content="admin, management, meme coin, rpc">
    
    <!-- External stylesheet -->
    <link rel="stylesheet" href="admin.css">
    
    <!-- Font Awesome icons -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    
    <!-- Firebase SDK v8 -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
    <script>
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

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        console.log('Firebase initialized for admin panel');

        // Global Countdown Manager
        class GlobalCountdownManager {
            constructor() {
                this.countdownRef = database.ref('countdown');
            }

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
                    console.log('Countdown reset successfully via Firebase:', countdownData);
                    return true;
                } catch (error) {
                    console.error('Failed to reset countdown via Firebase:', error);
                    return false;
                }
            }
        }

        // Global Instance
        window.globalCountdownManager = new GlobalCountdownManager();
        console.log('GlobalCountdownManager initialized');
    </script>
</head>
<body>
    <!-- Background Decoration -->
    <div class="bg-decoration"></div>
    
    <!-- Main Container -->
    <div class="admin-container">
        <!-- Top Navigation -->
        <header class="admin-header">
            <div class="header-content">
                <h1 class="admin-title">
                    <i class="fa fa-cog"></i>
                    Meme Coin Admin Management System
                </h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="saveAllBtn">
                        <i class="fa fa-save"></i>
                        Save All Config
                    </button>
                    <button class="btn btn-secondary" id="refreshBtn">
                        <i class="fa fa-refresh"></i>
                        Refresh Status
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="admin-main">
            <!-- Configuration Panels -->
            <div class="config-panels">
                <!-- RPC Configuration Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-server"></i>
                            QuickNode RPC Configuration
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="rpcStatusDot"></span>
                            <span class="status-text" id="rpcStatusText">Not Connected</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label for="rpcUrl">RPC URL:</label>
                            <input 
                                type="text" 
                                id="rpcUrl" 
                                placeholder="https://your-endpoint.quiknode.pro/your-api-key/"
                                class="form-input"
                            >
                            <div class="input-help">Enter your QuickNode RPC endpoint URL</div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-success" id="testRpcBtn">
                                <i class="fa fa-plug"></i>
                                Test Connection
                            </button>
                            <button class="btn btn-info" id="saveRpcBtn">
                                <i class="fa fa-save"></i>
                                Save RPC Config
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Token Configuration Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-bitcoin"></i>
                            Token Address Configuration
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="tokenStatusDot"></span>
                            <span class="status-text" id="tokenStatusText">Not Set</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label for="tokenAddress">Token Address:</label>
                            <input 
                                type="text" 
                                id="tokenAddress" 
                                placeholder="Enter Solana token address"
                                class="form-input"
                            >
                            <div class="input-help">Enter the Solana token contract address to monitor</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="tokenName">Token Name:</label>
                            <input 
                                type="text" 
                                id="tokenName" 
                                placeholder="Token display name"
                                class="form-input"
                            >
                            <div class="input-help">Token name displayed on the frontend</div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-success" id="validateTokenBtn">
                                <i class="fa fa-check"></i>
                                Validate Address
                            </button>
                            <button class="btn btn-info" id="saveTokenBtn">
                                <i class="fa fa-save"></i>
                                Save Token Config
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Countdown Configuration Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-clock-o"></i>
                            Countdown Configuration
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="countdownStatusDot"></span>
                            <span class="status-text" id="countdownStatusText">Running</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label for="countdownMinutes">Countdown Minutes:</label>
                            <input 
                                type="number" 
                                id="countdownMinutes" 
                                value="5"
                                min="1"
                                max="1440"
                                class="form-input"
                            >
                            <div class="input-help">Set countdown minutes (1-1440 minutes)</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="countdownMessage">Countdown Message:</label>
                            <textarea 
                                id="countdownMessage" 
                                placeholder="Message displayed when countdown ends"
                                class="form-textarea"
                                rows="3"
                            >TO THE MOON!!! 🚀</textarea>
                            <div class="input-help">Message displayed when countdown ends</div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-warning" id="resetCountdownBtn">
                                <i class="fa fa-refresh"></i>
                                Reset Countdown
                            </button>
                            <button class="btn btn-info" id="saveCountdownBtn">
                                <i class="fa fa-save"></i>
                                Save Countdown Config
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Holding Countdown Configuration Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-trophy"></i>
                            Holding Countdown Configuration
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="rewardCountdownStatusDot"></span>
                            <span class="status-text" id="rewardCountdownStatusText">Running</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label for="rewardCountdownMinutes">Holding Countdown Minutes:</label>
                            <input 
                                type="number" 
                                id="rewardCountdownMinutes" 
                                value="20"
                                min="1"
                                max="1440"
                                class="form-input"
                            >
                            <div class="input-help">Set holding reward countdown minutes (1-1440 minutes)</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="rewardCountdownSeconds">Holding Countdown Seconds:</label>
                            <input 
                                type="number" 
                                id="rewardCountdownSeconds" 
                                value="0"
                                min="0"
                                max="59"
                                class="form-input"
                            >
                            <div class="input-help">Set holding reward countdown seconds (0-59 seconds)</div>
                        </div>
                        
                        <div class="form-group">
                            <label>Current Holding Countdown Status:</label>
                            <div class="status-display" id="rewardCountdownStatusDisplay">
                                <span class="status-item">
                                    <i class="fa fa-clock-o"></i>
                                    Remaining Time: <span id="rewardCountdownRemaining">20:00</span>
                                </span>
                                <span class="status-item">
                                    <i class="fa fa-sync"></i>
                                    Last Update: <span id="rewardCountdownLastUpdate">Unknown</span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-warning" id="resetRewardCountdownBtn">
                                <i class="fa fa-refresh"></i>
                                Reset Holding Countdown
                            </button>
                            <button class="btn btn-info" id="saveRewardCountdownBtn">
                                <i class="fa fa-save"></i>
                                Save Holding Countdown Config
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Holdings Snapshot Management Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-database"></i>
                            Holdings Snapshot Management
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="holdersSnapshotStatusDot"></span>
                            <span class="status-text" id="holdersSnapshotStatusText">Not Configured</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Holdings Snapshot Statistics:</label>
                            <div class="status-display" id="holdersSnapshotStatusDisplay">
                                <span class="status-item">
                                    <i class="fa fa-database"></i>
                                    Total Snapshots: <span id="holdersSnapshotCount">0</span>
                                </span>
                                <span class="status-item">
                                    <i class="fa fa-clock-o"></i>
                                    Latest Snapshot: <span id="holdersSnapshotLatest">--</span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-info" id="viewHoldersSnapshotsBtn">
                                <i class="fa fa-eye"></i>
                                View Holdings Snapshots
                            </button>
                            <button class="btn btn-success" id="exportHoldersSnapshotsBtn">
                                <i class="fa fa-download"></i>
                                Export Holdings Snapshots
                            </button>
                            <button class="btn btn-danger" id="clearHoldersSnapshotsBtn">
                                <i class="fa fa-trash"></i>
                                Clear Holdings Snapshots
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Transaction Detection Control Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-search"></i>
                            Transaction Detection Control
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="detectionStatusDot"></span>
                            <span class="status-text" id="detectionStatusText">Not Started</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Detection Status:</label>
                            <div class="status-display" id="detectionStatusDisplay">
                                <span class="status-item">
                                    <i class="fa fa-circle"></i>
                                    RPC Connection: <span id="rpcConnectionStatus">Not Connected</span>
                                </span>
                                <span class="status-item">
                                    <i class="fa fa-circle"></i>
                                    Token Address: <span id="tokenAddressStatus">Not Set</span>
                                </span>
                                <span class="status-item">
                                    <i class="fa fa-circle"></i>
                                    Detection Running: <span id="detectionRunningStatus">Not Started</span>
                                </span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Detection Statistics:</label>
                            <div class="stats-display" id="detectionStats">
                                <div class="stat-item">
                                    <span class="stat-label">Frontend Records:</span>
                                    <span class="stat-value">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Backend Records:</span>
                                    <span class="stat-value">0/100</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Last Update:</span>
                                    <span class="stat-value">Unknown</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Last Upload:</span>
                                    <span class="stat-value">Unknown</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-success" id="startDetectionBtn">
                                <i class="fa fa-play"></i>
                                Start Detection
                            </button>
                            <button class="btn btn-danger" id="stopDetectionBtn" disabled>
                                <i class="fa fa-stop"></i>
                                Stop Detection
                            </button>
                            <button class="btn btn-secondary" id="refreshDetectionBtn">
                                <i class="fa fa-refresh"></i>
                                Refresh Status
                            </button>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-info" id="viewTransactionsBtn">
                                <i class="fa fa-list"></i>
                                View Records
                            </button>
                            <button class="btn btn-warning" id="exportTransactionsBtn">
                                <i class="fa fa-download"></i>
                                Export Records
                            </button>
                            <button class="btn btn-danger" id="clearTransactionsBtn">
                                <i class="fa fa-trash"></i>
                                Clear Records
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Large Transaction Notification Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-exclamation-triangle"></i>
                            Large Transaction Notifications
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="largeTransactionStatusDot"></span>
                            <span class="status-text" id="largeTransactionStatusText">Monitoring</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Large Transaction Threshold:</label>
                            <div class="threshold-display">
                                <span class="threshold-value">1,000,000 Tokens</span>
                                <span class="threshold-info">Transactions exceeding this amount will trigger notifications and add 30 seconds to countdown</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Notification Statistics:</label>
                            <div class="stats-display" id="largeTransactionStats">
                                <div class="stat-item">
                                    <span class="stat-label">Today's Notifications:</span>
                                    <span class="stat-value" id="todayNotifications">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Notifications:</span>
                                    <span class="stat-value" id="totalNotifications">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Last Notification:</span>
                                    <span class="stat-value" id="lastNotificationTime">None</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Countdown Increases:</span>
                                    <span class="stat-value" id="countdownIncreases">0 times</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Recent Large Transactions:</label>
                            <div class="recent-notifications" id="recentLargeTransactions">
                                <div class="no-notifications">No large transaction records</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-info" id="viewLargeTransactionsBtn">
                                <i class="fa fa-list"></i>
                                View All Notifications
                            </button>
                            <button class="btn btn-warning" id="exportLargeTransactionsBtn">
                                <i class="fa fa-download"></i>
                                Export Notification Records
                            </button>
                            <button class="btn btn-danger" id="clearLargeTransactionsBtn">
                                <i class="fa fa-trash"></i>
                                Clear Notification Records
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Successful Address Management Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-trophy"></i>
                            Successful Address Management
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="successAddressStatusDot"></span>
                            <span class="status-text" id="successAddressStatusText">Monitoring</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Successful Address Description:</label>
                            <div class="info-display">
                                <span class="info-text">Large buy transactions (>1,000,000 tokens) addresses will be automatically added to the successful address list</span>
                                <span class="info-detail">Keep up to 5 latest addresses, synchronized display for all users</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Address Statistics:</label>
                            <div class="stats-display" id="successAddressStats">
                                <div class="stat-item">
                                    <span class="stat-label">Current Address Count:</span>
                                    <span class="stat-value" id="currentAddressCount">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Today's New:</span>
                                    <span class="stat-value" id="todayNewAddresses">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Last Update:</span>
                                    <span class="stat-value" id="lastAddressUpdate">None</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Volume:</span>
                                    <span class="stat-value" id="totalAddressVolume">0 Tokens</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Current Successful Addresses:</label>
                            <div class="address-list-container" id="adminSuccessAddresses">
                                <div class="no-addresses">No successful addresses</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-info" id="viewSuccessAddressesBtn">
                                <i class="fa fa-list"></i>
                                View Detailed List
                            </button>
                            <button class="btn btn-warning" id="exportSuccessAddressesBtn">
                                <i class="fa fa-download"></i>
                                Export Address Records
                            </button>
                            <button class="btn btn-danger" id="clearSuccessAddressesBtn">
                                <i class="fa fa-trash"></i>
                                Clear All Addresses
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Reward Data Management Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-gift"></i>
                            Reward Data Management
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="rewardDataStatusDot"></span>
                            <span class="status-text" id="rewardDataStatusText">Monitoring</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Reward Data Description:</label>
                            <div class="info-display">
                                <span class="info-text">Manage main countdown rewards and holding rewards data, including multi-round reward accumulation and claim records</span>
                                <span class="info-detail">Main countdown reward: 10,000 points, Holding reward: 3,000 points</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Reward Statistics:</label>
                            <div class="stats-display" id="rewardDataStats">
                                <div class="stat-item">
                                    <span class="stat-label">Main Countdown Rewards:</span>
                                    <span class="stat-value" id="mainCountdownRewardCount">0 rounds</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Holding Rewards:</span>
                                    <span class="stat-value" id="holdingRewardCount">0 rounds</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Claimed Rewards:</span>
                                    <span class="stat-value" id="claimedRewardCount">0 times</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Points Issued:</span>
                                    <span class="stat-value" id="totalRewardPoints">0 points</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Recent Reward Records:</label>
                            <div class="recent-rewards" id="recentRewards">
                                <div class="no-rewards">No reward records</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-info" id="viewRewardDataBtn">
                                <i class="fa fa-eye"></i>
                                View Reward Data
                            </button>
                            <button class="btn btn-success" id="exportRewardDataBtn">
                                <i class="fa fa-download"></i>
                                Export Reward Data
                            </button>
                            <button class="btn btn-warning" id="viewRewardHistoryBtn">
                                <i class="fa fa-history"></i>
                                View Claim History
                            </button>
                            <button class="btn btn-danger" id="clearRewardDataBtn">
                                <i class="fa fa-trash"></i>
                                Clear Reward Data
                            </button>
                        </div>
                    </div>
                </section>

                <!-- System Status Panel -->
                <section class="config-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">
                            <i class="fa fa-dashboard"></i>
                            System Status
                        </h2>
                        <div class="panel-status">
                            <span class="status-dot" id="systemStatusDot"></span>
                            <span class="status-text" id="systemStatusText">Normal</span>
                        </div>
                    </div>
                    
                    <div class="panel-content">
                        <div class="status-grid">
                            <div class="status-item">
                                <div class="status-label">Frontend Access</div>
                                <div class="status-value">
                                    <a href="index.html" target="_blank" class="status-link">
                                        <i class="fa fa-external-link"></i>
                                        View Frontend
                                    </a>
                                </div>
                            </div>
                            
                            <div class="status-item">
                                <div class="status-label">Last Update</div>
                                <div class="status-value" id="lastUpdateTime">--</div>
                            </div>
                            
                            <div class="status-item">
                                <div class="status-label">Config Version</div>
                                <div class="status-value" id="configVersion">v1.0.0</div>
                            </div>
                            
                            <div class="status-item">
                                <div class="status-label">System Uptime</div>
                                <div class="status-value" id="uptime">--</div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-danger" id="clearCacheBtn">
                                <i class="fa fa-trash"></i>
                                Clear Cache
                            </button>
                            <button class="btn btn-warning" id="exportConfigBtn">
                                <i class="fa fa-download"></i>
                                Export Config
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Log Panel -->
            <section class="log-panel">
                <div class="panel-header">
                    <h2 class="panel-title">
                        <i class="fa fa-list"></i>
                        System Logs
                    </h2>
                    <div class="panel-actions">
                        <button class="btn btn-sm btn-secondary" id="clearLogBtn">
                            <i class="fa fa-trash"></i>
                            Clear Logs
                        </button>
                        <button class="btn btn-sm btn-info" id="exportLogBtn">
                            <i class="fa fa-download"></i>
                            Export Logs
                        </button>
                    </div>
                </div>
                
                <div class="log-content" id="systemLog">
                    <div class="log-entry info">
                        <span class="log-time">[System Start]</span>
                        <span class="log-message">Admin management system started</span>
                    </div>
                </div>
            </section>
        </main>

        <!-- Footer Information -->
        <footer class="admin-footer">
            <div class="footer-content">
                <p>&copy; 2024 Meme Coin Admin Management System</p>
                <p>Version: v1.0.0 | Last Update: <span id="footerUpdateTime">--</span></p>
            </div>
        </footer>
    </div>

    <!-- Configuration Modal -->
    <div class="modal" id="configModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="modalTitle">Configuration Confirmation</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Modal content -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="modalCancel">Cancel</button>
                <button class="btn btn-primary" id="modalConfirm">Confirm</button>
            </div>
        </div>
    </div>

    <!-- Transaction Records Modal -->
    <div class="modal" id="transactionModal">
        <div class="modal-content modal-large">
            <div id="transactionModalContent">
                <!-- Transaction records content -->
            </div>
        </div>
    </div>

    <!-- General Modal -->
    <div class="modal" id="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3 class="modal-title" id="modalTitle">Title</h3>
                <button class="modal-close" onclick="window.adminApp.configManager.closeModal()">&times;</button>
            </div>
            <div class="modal-body" id="modalContent">
                <!-- Modal content -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.adminApp.configManager.closeModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- External Scripts -->
    <script src="admin.js"></script>
</body>
</html> 
