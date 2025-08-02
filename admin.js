// 后台管理系统配置
const ADMIN_CONFIG = {
    version: 'v1.0.0',
    storageKey: 'memeCoinAdminConfig',
    logMaxEntries: 100
};

// 全局事件监听器绑定函数 - 专门解决Vercel部署问题
function bindEventListenersWithRetry() {
    console.log('Attempting to bind event listeners...');
    
    // 定义所有需要绑定的按钮和事件
    const buttonEvents = [
        { id: 'resetCountdownBtn', event: 'click', handler: 'resetCountdown' },
        { id: 'saveCountdownBtn', event: 'click', handler: 'saveCountdownConfig' },
        { id: 'testRpcBtn', event: 'click', handler: 'testRpcConnection' },
        { id: 'saveRpcBtn', event: 'click', handler: 'saveRpcConfig' },
        { id: 'validateTokenBtn', event: 'click', handler: 'validateTokenAddress' },
        { id: 'saveTokenBtn', event: 'click', handler: 'saveTokenConfig' },
        { id: 'resetRewardCountdownBtn', event: 'click', handler: 'resetRewardCountdown' },
        { id: 'saveRewardCountdownBtn', event: 'click', handler: 'saveRewardCountdownConfig' },
        { id: 'startDetectionBtn', event: 'click', handler: 'startDetection' },
        { id: 'stopDetectionBtn', event: 'click', handler: 'stopDetection' },
        { id: 'refreshDetectionBtn', event: 'click', handler: 'refreshDetectionStatus' },
        { id: 'viewTransactionsBtn', event: 'click', handler: 'viewTransactions' },
        { id: 'clearTransactionsBtn', event: 'click', handler: 'clearTransactions' },
        { id: 'exportTransactionsBtn', event: 'click', handler: 'exportTransactions' },
        { id: 'viewLargeTransactionsBtn', event: 'click', handler: 'viewLargeTransactions' },
        { id: 'clearLargeTransactionsBtn', event: 'click', handler: 'clearLargeTransactions' },
        { id: 'exportLargeTransactionsBtn', event: 'click', handler: 'exportLargeTransactions' },
        { id: 'viewSuccessAddressesBtn', event: 'click', handler: 'viewSuccessAddresses' },
        { id: 'clearSuccessAddressesBtn', event: 'click', handler: 'clearSuccessAddresses' },
        { id: 'exportSuccessAddressesBtn', event: 'click', handler: 'exportSuccessAddresses' },
        { id: 'viewRewardDataBtn', event: 'click', handler: 'viewRewardData' },
        { id: 'exportRewardDataBtn', event: 'click', handler: 'exportRewardData' },
        { id: 'viewRewardHistoryBtn', event: 'click', handler: 'viewRewardHistory' },
        { id: 'clearRewardDataBtn', event: 'click', handler: 'clearRewardData' },
        { id: 'saveAllBtn', event: 'click', handler: 'saveAllConfig' },
        { id: 'refreshBtn', event: 'click', handler: 'refreshStatus' },
        { id: 'clearCacheBtn', event: 'click', handler: 'clearCache' },
        { id: 'exportConfigBtn', event: 'click', handler: 'exportConfig' },
        { id: 'clearLogBtn', event: 'click', handler: 'clearLog' },
        { id: 'exportLogBtn', event: 'click', handler: 'exportLog' },
        { id: 'modalClose', event: 'click', handler: 'closeModal' },
        { id: 'modalCancel', event: 'click', handler: 'closeModal' }
    ];
    
    let boundCount = 0;
    let totalButtons = buttonEvents.length;
    
    buttonEvents.forEach(({ id, event, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            // 移除现有的事件监听器（防止重复绑定）
            element.removeEventListener(event, window.adminApp?.configManager?.[handler]);
            
            // 添加新的事件监听器
            element.addEventListener(event, () => {
                console.log(`Button ${id} clicked, calling ${handler}`);
                if (window.adminApp?.configManager?.[handler]) {
                    window.adminApp.configManager[handler]();
                } else {
                    console.error(`Handler ${handler} not found in configManager`);
                }
            });
            
            boundCount++;
            console.log(`Successfully bound ${event} event to ${id}`);
        } else {
            console.warn(`Button with id '${id}' not found in DOM`);
        }
    });
    
    console.log(`Event binding completed: ${boundCount}/${totalButtons} buttons bound`);
    
    // 特别检查重置倒计时按钮
    const resetBtn = document.getElementById('resetCountdownBtn');
    if (resetBtn) {
        console.log('✅ Reset countdown button found and bound');
        // 添加一个测试点击事件
        resetBtn.addEventListener('click', () => {
            console.log('🎯 Reset countdown button clicked!');
        });
    } else {
        console.error('❌ Reset countdown button NOT found!');
    }
    
    return boundCount;
}

// 配置管理类
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.init();
    }

    // 初始化配置
    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
        this.updateSystemStatus();
        this.updateLargeTransactionStats();
        this.updateSuccessAddressStats();
        this.updateHoldersSnapshotStats();
        this.updateRewardDataStats();
    }

    // 加载配置
    loadConfig() {
        const saved = localStorage.getItem(ADMIN_CONFIG.storageKey);
        return saved ? JSON.parse(saved) : {
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
                message: 'TO THE MOON!!! 🚀'
            },
            rewardCountdown: {
                minutes: 20,
                seconds: 0,
                lastUpdate: new Date().toISOString()
            },
            system: {
                lastUpdate: new Date().toISOString(),
                uptime: new Date().toISOString()
            }
        };
    }

    // 保存配置
    saveConfig() {
        this.config.system.lastUpdate = new Date().toISOString();
        localStorage.setItem(ADMIN_CONFIG.storageKey, JSON.stringify(this.config));
        this.log('配置已保存', 'success');
        this.updateSystemStatus();
    }

    // 设置事件监听器
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // 使用多重保障机制确保事件监听器正确绑定
        const bindEvents = () => {
            console.log('Binding events...');
            const boundCount = bindEventListenersWithRetry();
            
            if (boundCount === 0) {
                console.warn('No events bound, retrying in 1 second...');
                setTimeout(bindEvents, 1000);
            } else {
                console.log(`Successfully bound ${boundCount} events`);
            }
        };
        
        // 立即尝试绑定
        bindEvents();
        
        // 如果DOM还没准备好，等待DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindEvents);
        }
        
        // 额外的保障：页面完全加载后再次尝试
        window.addEventListener('load', bindEvents);
        
        // 定期检查并重新绑定（防止动态内容加载）
        setInterval(() => {
            const resetBtn = document.getElementById('resetCountdownBtn');
            if (resetBtn && !resetBtn.hasAttribute('data-bound')) {
                console.log('Re-binding events due to dynamic content...');
                bindEvents();
            }
        }, 5000);
    }

    // 绑定事件监听器 - 现在使用全局函数
    bindEventListeners() {
        // 这个方法现在被全局的 bindEventListenersWithRetry 函数替代
        console.log('bindEventListeners called - using global function instead');
        return bindEventListenersWithRetry();
    }

    // 加载已保存的配置到界面
    loadSavedConfig() {
        // RPC配置
        const rpcUrlInput = document.getElementById('rpcUrl');
        if (rpcUrlInput) {
            rpcUrlInput.value = this.config.rpc.url;
        }

        // 代币配置
        const tokenAddressInput = document.getElementById('tokenAddress');
        const tokenNameInput = document.getElementById('tokenName');
        if (tokenAddressInput) {
            tokenAddressInput.value = this.config.token.address;
        }
        if (tokenNameInput) {
            tokenNameInput.value = this.config.token.name;
        }

        // 倒计时配置
        const countdownMinutesInput = document.getElementById('countdownMinutes');
        const countdownMessageInput = document.getElementById('countdownMessage');
        if (countdownMinutesInput) {
            countdownMinutesInput.value = this.config.countdown.minutes;
        }
        if (countdownMessageInput) {
            countdownMessageInput.value = this.config.countdown.message;
        }

        // 持仓倒计时配置
        const rewardCountdownMinutesInput = document.getElementById('rewardCountdownMinutes');
        const rewardCountdownSecondsInput = document.getElementById('rewardCountdownSeconds');
        if (rewardCountdownMinutesInput) {
            rewardCountdownMinutesInput.value = this.config.rewardCountdown.minutes;
        }
        if (rewardCountdownSecondsInput) {
            rewardCountdownSecondsInput.value = this.config.rewardCountdown.seconds;
        }

        // 检查是否有全局倒计时在运行
        this.checkGlobalCountdown();

        this.updateStatusIndicators();
        this.updateDetectionStatus();
    }

    // 启动检测
    async startDetection() {
        // 检查RPC和代币配置
        if (!this.config.rpc.url || !this.config.token.address) {
            this.showModal('错误', '请先配置RPC URL和代币地址');
            return;
        }

        if (!this.config.rpc.connected) {
            this.showModal('错误', '请先测试RPC连接');
            return;
        }

        if (!this.config.token.validated) {
            this.showModal('错误', '请先验证代币地址');
            return;
        }

        this.setLoadingState('startDetectionBtn', true);

        try {
            // 保存检测状态到localStorage，前台会自动检测并启动
            const detectionConfig = {
                isRunning: true,
                rpcUrl: this.config.rpc.url,
                tokenAddress: this.config.token.address,
                tokenName: this.config.token.name,
                startTime: new Date().toISOString(),
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('memeCoinDetection', JSON.stringify(detectionConfig));

            this.updateDetectionStatus();
            this.log('检测已启动', 'success');
        } catch (error) {
            this.log(`启动检测失败: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('startDetectionBtn', false);
        }
    }

    // 停止检测
    stopDetection() {
        this.showModal('确认停止', '确定要停止检测吗？', () => {
            try {
                // 清除检测状态
                localStorage.removeItem('memeCoinDetection');
                
                this.updateDetectionStatus();
                this.log('检测已停止', 'warning');
            } catch (error) {
                this.log(`停止检测失败: ${error.message}`, 'error');
            }
        });
    }

    // 刷新检测状态
    refreshDetectionStatus() {
        this.updateDetectionStatus();
        this.log('检测状态已刷新', 'info');
    }

    // 更新检测状态
    updateDetectionStatus() {
        const detectionConfig = localStorage.getItem('memeCoinDetection');
        const startDetectionBtn = document.getElementById('startDetectionBtn');
        const stopDetectionBtn = document.getElementById('stopDetectionBtn');
        const detectionStatusText = document.getElementById('detectionStatusText');
        const detectionStatusDot = document.getElementById('detectionStatusDot');

        if (detectionConfig) {
            try {
                const config = JSON.parse(detectionConfig);
                
                if (config.isRunning) {
                    // 检测正在运行
                    if (startDetectionBtn) startDetectionBtn.disabled = true;
                    if (stopDetectionBtn) stopDetectionBtn.disabled = false;
                    if (detectionStatusText) detectionStatusText.textContent = '运行中';
                    if (detectionStatusDot) {
                        detectionStatusDot.className = 'status-dot connected';
                    }
                } else {
                    // 检测已停止
                    if (startDetectionBtn) startDetectionBtn.disabled = false;
                    if (stopDetectionBtn) stopDetectionBtn.disabled = true;
                    if (detectionStatusText) detectionStatusText.textContent = '已停止';
                    if (detectionStatusDot) {
                        detectionStatusDot.className = 'status-dot disconnected';
                    }
                }

                // 更新状态显示
                this.updateDetectionStatusDisplay(config);
            } catch (error) {
                console.error('解析检测配置失败:', error);
            }
        } else {
            // 没有检测配置
            if (startDetectionBtn) startDetectionBtn.disabled = false;
            if (stopDetectionBtn) stopDetectionBtn.disabled = true;
            if (detectionStatusText) detectionStatusText.textContent = '未启动';
            if (detectionStatusDot) {
                detectionStatusDot.className = 'status-dot disconnected';
            }
            this.updateDetectionStatusDisplay(null);
        }
    }

    // 更新检测状态显示
    updateDetectionStatusDisplay(config) {
        // RPC连接状态
        const rpcConnectionStatus = document.getElementById('rpcConnectionStatus');
        const rpcConnectionIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(1) i');
        
        if (this.config.rpc.connected) {
            if (rpcConnectionStatus) rpcConnectionStatus.textContent = '已连接';
            if (rpcConnectionIcon) rpcConnectionIcon.className = 'fa fa-circle connected';
        } else {
            if (rpcConnectionStatus) rpcConnectionStatus.textContent = '未连接';
            if (rpcConnectionIcon) rpcConnectionIcon.className = 'fa fa-circle disconnected';
        }

        // 代币地址状态
        const tokenAddressStatus = document.getElementById('tokenAddressStatus');
        const tokenAddressIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(2) i');
        
        if (this.config.token.validated) {
            if (tokenAddressStatus) tokenAddressStatus.textContent = '已设置';
            if (tokenAddressIcon) tokenAddressIcon.className = 'fa fa-circle connected';
        } else {
            if (tokenAddressStatus) tokenAddressStatus.textContent = '未设置';
            if (tokenAddressIcon) tokenAddressIcon.className = 'fa fa-circle disconnected';
        }

        // 检测运行状态
        const detectionRunningStatus = document.getElementById('detectionRunningStatus');
        const detectionRunningIcon = document.querySelector('#detectionStatusDisplay .status-item:nth-child(3) i');
        
        if (config && config.isRunning) {
            if (detectionRunningStatus) detectionRunningStatus.textContent = '运行中';
            if (detectionRunningIcon) detectionRunningIcon.className = 'fa fa-circle connected';
        } else {
            if (detectionRunningStatus) detectionRunningStatus.textContent = '未启动';
            if (detectionRunningIcon) detectionRunningIcon.className = 'fa fa-circle disconnected';
        }

        // 更新统计信息
        this.updateDetectionStats(config);
    }

    // 更新检测统计
    updateDetectionStats(config) {
        const statsDisplay = document.getElementById('detectionStats');
        if (!statsDisplay) return;

        // 获取前台和后台的交易数据
        const frontendData = localStorage.getItem('memeCoinTransactions');
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        
        let frontendTransactions = [];
        let backendTransactions = [];
        
        try {
            if (frontendData) {
                const parsed = JSON.parse(frontendData);
                frontendTransactions = parsed.transactions || [];
            }
            if (backendData) {
                const parsed = JSON.parse(backendData);
                backendTransactions = parsed.transactions || [];
            }
        } catch (error) {
            console.error('解析交易数据失败:', error);
        }

        const totalCount = backendTransactions.length;
        const lastUpdate = config?.lastUpdate ? new Date(config.lastUpdate).toLocaleString() : '未知';
        const lastUpload = backendData ? (() => {
            try {
                const parsed = JSON.parse(backendData);
                return parsed.lastUpload ? new Date(parsed.lastUpload).toLocaleString() : '未知';
            } catch {
                return '未知';
            }
        })() : '未知';

        statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">前台记录:</span>
                <span class="stat-value">${frontendTransactions.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">后台记录:</span>
                <span class="stat-value">${backendTransactions.length}/100</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最后更新:</span>
                <span class="stat-value">${lastUpdate}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最后上传:</span>
                <span class="stat-value">${lastUpload}</span>
            </div>
        `;
    }

    // 检查全局倒计时状态
    checkGlobalCountdown() {
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 倒计时还在运行
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    // 更新界面显示剩余时间
                    const countdownMinutesInput = document.getElementById('countdownMinutes');
                    if (countdownMinutesInput) {
                        countdownMinutesInput.value = remainingMinutes;
                    }
                    
                    // 更新后台配置以保持同步
                    this.config.countdown.minutes = remainingMinutes;
                    this.config.countdown.seconds = remainingSeconds;
                    this.config.countdown.lastUpdate = data.lastUpdate;
                    
                    this.log(`检测到全局倒计时运行中，剩余${remainingMinutes}分${remainingSeconds}秒`, 'info');
                } else {
                    // 倒计时已结束
                    this.log('全局倒计时已结束', 'warning');
                }
            } catch (error) {
                console.error('检查全局倒计时失败:', error);
            }
        }
    }

    // 测试RPC连接
    async testRpcConnection() {
        const rpcUrl = document.getElementById('rpcUrl').value.trim();
        if (!rpcUrl) {
            this.showModal('错误', '请输入RPC URL');
            return;
        }

        this.setLoadingState('testRpcBtn', true);
        this.updateRpcStatus('connecting', '连接中...');

        try {
            // 模拟RPC连接测试
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 这里应该实际测试RPC连接
            const isValid = rpcUrl.includes('quiknode.pro');
            
            if (isValid) {
                this.config.rpc.connected = true;
                this.config.rpc.lastTest = new Date().toISOString();
                this.updateRpcStatus('connected', '已连接');
                this.log('RPC连接测试成功', 'success');
            } else {
                throw new Error('无效的RPC URL');
            }
        } catch (error) {
            this.config.rpc.connected = false;
            this.updateRpcStatus('disconnected', '连接失败');
            this.log(`RPC连接测试失败: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('testRpcBtn', false);
        }
    }

    // 保存RPC配置
    saveRpcConfig() {
        const rpcUrl = document.getElementById('rpcUrl').value.trim();
        if (!rpcUrl) {
            this.showModal('错误', '请输入RPC URL');
            return;
        }

        this.config.rpc.url = rpcUrl;
        this.saveConfig();
        this.log('RPC配置已保存', 'success');
    }

    // 验证代币地址
    async validateTokenAddress() {
        const tokenAddress = document.getElementById('tokenAddress').value.trim();
        if (!tokenAddress) {
            this.showModal('错误', '请输入代币地址');
            return;
        }

        this.setLoadingState('validateTokenBtn', true);
        this.updateTokenStatus('validating', '验证中...');

        try {
            // 模拟代币地址验证
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 这里应该实际验证Solana代币地址
            const isValid = tokenAddress.length === 44 && /^[A-Za-z0-9]+$/.test(tokenAddress);
            
            if (isValid) {
                this.config.token.validated = true;
                this.updateTokenStatus('validated', '已验证');
                this.log('代币地址验证成功', 'success');
            } else {
                throw new Error('无效的代币地址格式');
            }
        } catch (error) {
            this.config.token.validated = false;
            this.updateTokenStatus('invalid', '验证失败');
            this.log(`代币地址验证失败: ${error.message}`, 'error');
        } finally {
            this.setLoadingState('validateTokenBtn', false);
        }
    }

    // 保存代币配置
    saveTokenConfig() {
        const tokenAddress = document.getElementById('tokenAddress').value.trim();
        const tokenName = document.getElementById('tokenName').value.trim();
        
        if (!tokenAddress) {
            this.showModal('错误', '请输入代币地址');
            return;
        }

        this.config.token.address = tokenAddress;
        this.config.token.name = tokenName;
        this.saveConfig();
        this.log('代币配置已保存', 'success');
    }

    // 重置倒计时
    resetCountdown() {
        console.log('Reset countdown method called');
        
        try {
            // 检查DOM元素是否存在
            const countdownMinutesInput = document.getElementById('countdownMinutes');
            if (!countdownMinutesInput) {
                console.error('countdownMinutes input not found');
                this.log('错误：找不到倒计时分钟输入框', 'error');
                return;
            }

            this.showModal('确认重置', '确定要重置倒计时吗？这将重新开始全局倒计时，所有在线用户都会同步更新。', () => {
                try {
                    console.log('Reset countdown confirmed');
                    
                    // 创建新的倒计时时间
                    const minutes = parseInt(countdownMinutesInput.value) || 5;
                    
                    // 使用Firebase实时同步（如果可用）
                    if (window.globalCountdownManager) {
                        this.log('使用Firebase实时同步重置倒计时...', 'info');
                        window.globalCountdownManager.resetCountdown(minutes).then((success) => {
                            if (success) {
                                this.log(`倒计时已重置为${minutes}分钟，所有用户已同步`, 'success');
                            } else {
                                this.log('Firebase同步失败，使用本地存储', 'warning');
                                this.resetCountdownLocal(minutes);
                            }
                        });
                    } else {
                        // 回退到本地存储
                        this.log('Firebase不可用，使用本地存储', 'info');
                        this.resetCountdownLocal(minutes);
                    }
                    
                } catch (error) {
                    console.error('Error in reset countdown callback:', error);
                    this.log(`重置倒计时时发生错误: ${error.message}`, 'error');
                }
            });
        } catch (error) {
            console.error('Error in resetCountdown method:', error);
            this.log(`重置倒计时方法错误: ${error.message}`, 'error');
        }
    }

    // 本地存储重置倒计时（回退方案）
    resetCountdownLocal(minutes) {
        try {
            const now = new Date();
            const newTargetDate = new Date(now.getTime() + minutes * 60 * 1000);
            
            console.log('New countdown data:', {
                minutes: minutes,
                targetDate: newTargetDate.toISOString(),
                currentTime: now.toISOString()
            });
            
            // 保存到全局倒计时存储
            const countdownData = {
                targetDate: newTargetDate.toISOString(),
                lastUpdate: new Date().toISOString(),
                resetBy: 'admin-panel-local',
                version: '1.0'
            };
            
            try {
                localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                console.log('Countdown data saved to localStorage');
            } catch (storageError) {
                console.error('Failed to save to localStorage:', storageError);
                this.log('警告：无法保存到本地存储，但倒计时仍会重置', 'warning');
            }
            
            // 更新后台配置
            this.config.countdown.minutes = minutes;
            this.config.countdown.lastUpdate = new Date().toISOString();
            this.saveConfig();
            
            // 验证保存是否成功
            const savedData = localStorage.getItem('memeCoinCountdown');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                console.log('Verified saved data:', parsed);
            }
            
            this.log(`倒计时已重置为${minutes}分钟（本地模式）`, 'success');
            
            // 触发自定义事件，通知前台页面
            window.dispatchEvent(new CustomEvent('countdownReset', {
                detail: countdownData
            }));
            
        } catch (error) {
            console.error('Error in resetCountdownLocal:', error);
            this.log(`本地重置倒计时时发生错误: ${error.message}`, 'error');
        }
    }

    // 保存倒计时配置
    saveCountdownConfig() {
        const minutes = parseInt(document.getElementById('countdownMinutes').value);
        const message = document.getElementById('countdownMessage').value.trim();
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('错误', '倒计时分钟数必须在1-1440之间');
            return;
        }

        this.config.countdown.minutes = minutes;
        this.config.countdown.message = message;
        this.config.countdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
        
        // 如果当前有倒计时在运行，更新它
        const currentCountdown = localStorage.getItem('memeCoinCountdown');
        if (currentCountdown) {
            try {
                const data = JSON.parse(currentCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                // 如果倒计时还没结束，更新剩余时间
                if (targetDate > now) {
                    const remainingTime = targetDate - now;
                    const newTargetDate = new Date(now.getTime() + remainingTime);
                    
                    const countdownData = {
                        targetDate: newTargetDate.toISOString(),
                        lastUpdate: new Date().toISOString()
                    };
                    localStorage.setItem('memeCoinCountdown', JSON.stringify(countdownData));
                }
            } catch (error) {
                console.error('更新倒计时失败:', error);
            }
        }
        
        this.log('倒计时配置已保存', 'success');
    }

    // 重置持仓倒计时
    resetRewardCountdown() {
        const minutes = parseInt(document.getElementById('rewardCountdownMinutes').value);
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('错误', '持仓倒计时分钟数必须在1-1440之间');
            return;
        }

        this.showModal('确认重置', `确定要重置持仓倒计时为${minutes}分钟吗？`, () => {
            // 更新后台配置
                    // 设置全局持仓倒计时存储（主要方式）
        const now = new Date();
        const targetDate = new Date(now.getTime() + (minutes * 60) * 1000);
        
        const rewardCountdownData = {
            targetDate: targetDate.toISOString(),
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(rewardCountdownData));
        
        // 同时更新后台配置（备份）
        this.config.rewardCountdown.minutes = minutes;
        this.config.rewardCountdown.seconds = 0;
        this.config.rewardCountdown.lastUpdate = new Date().toISOString();
            this.saveConfig();
            
            this.log(`持仓倒计时已重置为${minutes}分钟`, 'success');
        });
    }

    // 保存持仓倒计时配置
    saveRewardCountdownConfig() {
        const minutes = parseInt(document.getElementById('rewardCountdownMinutes').value);
        const seconds = parseInt(document.getElementById('rewardCountdownSeconds').value);
        
        if (minutes < 1 || minutes > 1440) {
            this.showModal('错误', '持仓倒计时分钟数必须在1-1440之间');
            return;
        }

        if (seconds < 0 || seconds > 59) {
            this.showModal('错误', '持仓倒计时秒数必须在0-59之间');
            return;
        }

        // 设置全局持仓倒计时存储（主要方式）
        const now = new Date();
        const targetDate = new Date(now.getTime() + (minutes * 60 + seconds) * 1000);
        
        const rewardCountdownData = {
            targetDate: targetDate.toISOString(),
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('memeCoinRewardCountdown', JSON.stringify(rewardCountdownData));
        
        // 同时更新后台配置（备份）
        this.config.rewardCountdown.minutes = minutes;
        this.config.rewardCountdown.seconds = seconds;
        this.config.rewardCountdown.lastUpdate = new Date().toISOString();
        this.saveConfig();
        
        this.log('持仓倒计时配置已保存', 'success');
    }

    // 保存所有配置
    saveAllConfig() {
        this.saveRpcConfig();
        this.saveTokenConfig();
        this.saveCountdownConfig();
        this.saveRewardCountdownConfig();
        this.showModal('成功', '所有配置已保存');
    }

    // 刷新状态
    refreshStatus() {
        this.updateSystemStatus();
        this.log('系统状态已刷新', 'info');
    }

    // 清除缓存
    clearCache() {
        this.showModal('确认清除', '确定要清除所有缓存吗？这将清除所有本地存储的数据。', () => {
            localStorage.clear();
            this.log('缓存已清除', 'warning');
            this.config = this.loadConfig();
            this.loadSavedConfig();
        });
    }

    // 导出配置
    exportConfig() {
        const configData = {
            ...this.config,
            exportTime: new Date().toISOString(),
            version: ADMIN_CONFIG.version
        };
        
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme-coin-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('配置已导出', 'success');
    }

    // 清除日志
    clearLog() {
        const logContent = document.getElementById('systemLog');
        if (logContent) {
            logContent.innerHTML = '<div class="log-entry info"><span class="log-time">[系统]</span><span class="log-message">日志已清除</span></div>';
        }
    }

    // 导出日志
    exportLog() {
        const logContent = document.getElementById('systemLog');
        if (logContent) {
            const logText = logContent.innerText;
            const blob = new Blob([logText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-coin-log-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // 查看交易记录
    viewTransactions() {
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        if (!backendData) {
            this.showModal('提示', '没有交易记录可查看');
            return;
        }

        try {
            const data = JSON.parse(backendData);
            const transactions = data.transactions || [];
            
            if (transactions.length === 0) {
                this.showModal('提示', '没有交易记录');
                return;
            }

            // 创建交易记录显示窗口
            this.showTransactionModal(transactions);
            
        } catch (error) {
            console.error('解析交易记录失败:', error);
            this.showModal('错误', '解析交易记录失败');
        }
    }

    // 显示交易记录模态框
    showTransactionModal(transactions) {
        const modal = document.getElementById('transactionModal');
        const modalContent = document.getElementById('transactionModalContent');
        
        if (!modal || !modalContent) {
            this.showModal('错误', '交易记录显示组件未找到');
            return;
        }

        // 生成交易记录表格
        const tableHTML = this.generateTransactionTable(transactions);
        modalContent.innerHTML = tableHTML;
        
        // 显示模态框
        modal.style.display = 'flex';
        
        // 添加关闭事件
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
    }

    // 生成交易记录表格
    generateTransactionTable(transactions) {
        const tableRows = transactions.map((tx, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${tx.signature.substring(0, 8)}...</td>
                <td>${tx.trader}</td>
                <td>${tx.amount}</td>
                <td>${tx.type}</td>
                <td>${tx.status === 'success' ? '✅' : '❌'}</td>
                <td>${tx.timestamp}</td>
            </tr>
        `).join('');

        return `
            <div class="modal-header">
                <h3>交易记录 (共${transactions.length}条)</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>签名</th>
                            <th>交易者</th>
                            <th>数量</th>
                            <th>类型</th>
                            <th>状态</th>
                            <th>时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 清除交易记录
    clearTransactions() {
        this.showModal('确认', '确定要清除所有交易记录吗？此操作不可恢复。', () => {
            try {
                localStorage.removeItem('memeCoinBackendTransactions');
                localStorage.removeItem('memeCoinTransactions');
                this.log('交易记录已清除', 'warning');
                this.refreshDetectionStatus();
                this.showModal('成功', '交易记录已清除');
            } catch (error) {
                console.error('清除交易记录失败:', error);
                this.showModal('错误', '清除交易记录失败');
            }
        });
    }

    // 导出交易记录
    exportTransactions() {
        const backendData = localStorage.getItem('memeCoinBackendTransactions');
        if (!backendData) {
            this.showModal('提示', '没有交易记录可导出');
            return;
        }

        try {
            const data = JSON.parse(backendData);
            const transactions = data.transactions || [];
            
            if (transactions.length === 0) {
                this.showModal('提示', '没有交易记录');
                return;
            }

            // 生成CSV格式
            const csvContent = this.generateTransactionCSV(transactions);
            const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(filename, csvContent);
            this.log('交易记录已导出', 'success');
            
        } catch (error) {
            console.error('导出交易记录失败:', error);
            this.showModal('错误', '导出交易记录失败');
        }
    }

    // 生成交易记录CSV
    generateTransactionCSV(transactions) {
        const headers = ['序号', '签名', '交易者', '数量', '类型', '状态', '时间', '处理时间'];
        const rows = transactions.map((tx, index) => [
            index + 1,
            tx.signature,
            tx.trader,
            tx.amount,
            tx.type,
            tx.status,
            tx.timestamp,
            tx.processedAt ? new Date(tx.processedAt).toLocaleString() : '未知'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent; // 添加BOM以支持中文
    }

    // 下载文件
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 更新状态指示器
    updateStatusIndicators() {
        // RPC状态
        if (this.config.rpc.connected) {
            this.updateRpcStatus('connected', '已连接');
        } else {
            this.updateRpcStatus('disconnected', '未连接');
        }

        // 代币状态
        if (this.config.token.validated) {
            this.updateTokenStatus('validated', '已验证');
        } else {
            this.updateTokenStatus('invalid', '未验证');
        }

        // 倒计时状态
        this.updateCountdownStatus('running', '运行中');
    }

    // 更新RPC状态
    updateRpcStatus(status, text) {
        const statusDot = document.getElementById('rpcStatusDot');
        const statusText = document.getElementById('rpcStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'connected') statusDot.classList.add('connected');
            else if (status === 'connecting') statusDot.classList.add('warning');
            else statusDot.classList.add('disconnected');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // 更新代币状态
    updateTokenStatus(status, text) {
        const statusDot = document.getElementById('tokenStatusDot');
        const statusText = document.getElementById('tokenStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'validated') statusDot.classList.add('connected');
            else if (status === 'validating') statusDot.classList.add('warning');
            else statusDot.classList.add('disconnected');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // 更新倒计时状态
    updateCountdownStatus(status, text) {
        const statusDot = document.getElementById('countdownStatusDot');
        const statusText = document.getElementById('countdownStatusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'running') statusDot.classList.add('connected');
            else statusDot.classList.add('warning');
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // 更新持仓倒计时状态
    updateRewardCountdownStatus() {
        const statusDot = document.getElementById('rewardCountdownStatusDot');
        const statusText = document.getElementById('rewardCountdownStatusText');
        const remainingTime = document.getElementById('rewardCountdownRemaining');
        const lastUpdate = document.getElementById('rewardCountdownLastUpdate');
        
        if (statusDot) {
            statusDot.className = 'status-dot connected';
        }
        
        if (statusText) {
            statusText.textContent = '运行中';
        }
        
        if (remainingTime) {
            const minutes = this.config.rewardCountdown.minutes;
            const seconds = this.config.rewardCountdown.seconds;
            remainingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (lastUpdate) {
            const updateTime = new Date(this.config.rewardCountdown.lastUpdate);
            lastUpdate.textContent = updateTime.toLocaleString();
        }
    }

    // 更新系统状态
    updateSystemStatus() {
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        const uptime = document.getElementById('uptime');
        const footerUpdateTime = document.getElementById('footerUpdateTime');
        
        if (lastUpdateTime) {
            lastUpdateTime.textContent = new Date(this.config.system.lastUpdate).toLocaleString();
        }
        
        if (uptime) {
            const startTime = new Date(this.config.system.uptime);
            const now = new Date();
            const diff = now - startTime;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            uptime.textContent = `${hours}小时${minutes}分钟`;
        }
        
        if (footerUpdateTime) {
            footerUpdateTime.textContent = new Date().toLocaleString();
        }

        // 更新倒计时状态
        this.updateCountdownStatus();
        
        // 更新持仓倒计时状态
        this.updateRewardCountdownStatus();
    }

    // 更新倒计时状态
    updateCountdownStatus() {
        const globalCountdown = localStorage.getItem('memeCoinCountdown');
        const countdownStatusText = document.getElementById('countdownStatusText');
        const countdownStatusDot = document.getElementById('countdownStatusDot');
        
        if (globalCountdown) {
            try {
                const data = JSON.parse(globalCountdown);
                const targetDate = new Date(data.targetDate);
                const now = new Date();
                
                if (targetDate > now) {
                    // 倒计时还在运行
                    const remainingTime = targetDate - now;
                    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    
                    if (countdownStatusText) {
                        countdownStatusText.textContent = `运行中 (${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')})`;
                    }
                    
                    if (countdownStatusDot) {
                        countdownStatusDot.className = 'status-dot connected';
                    }
                    
                    // 更新配置显示
                    const countdownMinutesInput = document.getElementById('countdownMinutes');
                    if (countdownMinutesInput) {
                        countdownMinutesInput.value = remainingMinutes;
                    }
                } else {
                    // 倒计时已结束
                    if (countdownStatusText) {
                        countdownStatusText.textContent = '已结束';
                    }
                    
                    if (countdownStatusDot) {
                        countdownStatusDot.className = 'status-dot warning';
                    }
                }
            } catch (error) {
                if (countdownStatusText) {
                    countdownStatusText.textContent = '运行中';
                }
            }
        } else {
            if (countdownStatusText) {
                countdownStatusText.textContent = '未启动';
            }
        }
    }

    // 设置加载状态
    setLoadingState(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (loading) {
                button.disabled = true;
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
            }
        }
    }

    // 显示模态框
    showModal(title, message, onConfirm = null) {
        const modal = document.getElementById('configModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalConfirm = document.getElementById('modalConfirm');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.textContent = message;
            modal.classList.add('show');
            
            if (onConfirm) {
                modalConfirm.onclick = () => {
                    onConfirm();
                    this.closeModal();
                };
            } else {
                modalConfirm.onclick = () => this.closeModal();
            }
        }
    }

    // 关闭模态框
    closeModal() {
        // 关闭配置模态框
        const configModal = document.getElementById('configModal');
        if (configModal) {
            configModal.classList.remove('show');
        }
        
        // 关闭通用模态框
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // 关闭交易模态框
        const transactionModal = document.getElementById('transactionModal');
        if (transactionModal) {
            transactionModal.classList.remove('show');
        }
    }

    // 添加日志
    log(message, type = 'info') {
        const logContent = document.getElementById('systemLog');
        if (!logContent) return;

        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-message">${message}</span>
        `;

        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;

        // 限制日志条目数量
        const entries = logContent.querySelectorAll('.log-entry');
        if (entries.length > ADMIN_CONFIG.logMaxEntries) {
            entries[0].remove();
        }
    }

    // 大额交易通知管理方法
    viewLargeTransactions() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            if (notificationList.length === 0) {
                this.showModal('大额交易通知', '暂无大额交易通知记录');
                return;
            }
            
            this.showLargeTransactionModal(notificationList);
        } catch (error) {
            console.error('Failed to view large transactions:', error);
            this.log('查看大额交易通知失败', 'error');
        }
    }

    showLargeTransactionModal(notifications) {
        const modal = document.getElementById('transactionModal');
        const modalContent = document.getElementById('transactionModalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">大额交易通知记录 (${notifications.length})</h3>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.generateLargeTransactionTable(notifications)}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modalCancel">关闭</button>
                </div>
            `;
            
            modal.classList.add('show');
            
            // 重新绑定事件监听器
            document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
            document.getElementById('modalCancel')?.addEventListener('click', () => this.closeModal());
        }
    }

    generateLargeTransactionTable(notifications) {
        if (notifications.length === 0) {
            return '<p>暂无大额交易通知记录</p>';
        }
        
        const tableRows = notifications.map(notification => `
            <tr>
                <td>${new Date(notification.timestamp).toLocaleString()}</td>
                <td><span class="notification-type">${notification.transaction.type}</span></td>
                <td class="notification-amount">${notification.transaction.amount}</td>
                <td class="notification-trader">${notification.transaction.trader}</td>
                <td>${notification.transaction.signature.slice(0, 8)}...</td>
            </tr>
        `).join('');
        
        return `
            <div class="table-container">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>类型</th>
                            <th>数量</th>
                            <th>交易者</th>
                            <th>签名</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    clearLargeTransactions() {
        this.showModal(
            '清除大额交易通知',
            '确定要清除所有大额交易通知记录吗？此操作不可撤销。',
            () => {
                try {
                    localStorage.removeItem('memeCoinLargeTransactionNotifications');
                    this.updateLargeTransactionStats();
                    this.log('大额交易通知记录已清除', 'success');
                } catch (error) {
                    console.error('Failed to clear large transactions:', error);
                    this.log('清除大额交易通知失败', 'error');
                }
            }
        );
    }

    exportLargeTransactions() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            if (notificationList.length === 0) {
                this.showModal('导出大额交易通知', '暂无大额交易通知记录可导出');
                return;
            }
            
            const csvContent = this.generateLargeTransactionCSV(notificationList);
            const filename = `large_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(filename, csvContent);
            this.log(`大额交易通知记录已导出: ${filename}`, 'success');
        } catch (error) {
            console.error('Failed to export large transactions:', error);
            this.log('导出大额交易通知失败', 'error');
        }
    }

    generateLargeTransactionCSV(notifications) {
        const headers = ['时间', '类型', '数量', '交易者', '签名', '消息'];
        const rows = notifications.map(notification => [
            new Date(notification.timestamp).toLocaleString(),
            notification.transaction.type,
            notification.transaction.amount,
            notification.transaction.trader,
            notification.transaction.signature,
            notification.message
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    updateLargeTransactionStats() {
        try {
            const notifications = localStorage.getItem('memeCoinLargeTransactionNotifications');
            const notificationList = notifications ? JSON.parse(notifications) : [];
            
            // 计算今日通知数
            const today = new Date().toDateString();
            const todayNotifications = notificationList.filter(notification => 
                new Date(notification.timestamp).toDateString() === today
            ).length;
            
            // 更新统计显示
            const todayElement = document.getElementById('todayNotifications');
            const totalElement = document.getElementById('totalNotifications');
            const lastTimeElement = document.getElementById('lastNotificationTime');
            const increasesElement = document.getElementById('countdownIncreases');
            
            if (todayElement) todayElement.textContent = todayNotifications;
            if (totalElement) totalElement.textContent = notificationList.length;
            
            if (lastTimeElement) {
                if (notificationList.length > 0) {
                    const lastNotification = notificationList[0];
                    lastTimeElement.textContent = new Date(lastNotification.timestamp).toLocaleString();
                } else {
                    lastTimeElement.textContent = '无';
                }
            }
            
            if (increasesElement) {
                increasesElement.textContent = `${notificationList.length} 次`;
            }
            
            // 更新最近通知显示
            this.updateRecentLargeTransactions(notificationList.slice(0, 5));
            
        } catch (error) {
            console.error('Failed to update large transaction stats:', error);
        }
    }

    updateRecentLargeTransactions(recentNotifications) {
        const container = document.getElementById('recentLargeTransactions');
        if (!container) return;
        
        if (recentNotifications.length === 0) {
            container.innerHTML = '<div class="no-notifications">暂无大额交易记录</div>';
            return;
        }
        
        const notificationItems = recentNotifications.map(notification => `
            <div class="notification-item">
                <div class="notification-header">
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</span>
                    <span class="notification-type">${notification.transaction.type}</span>
                </div>
                <div class="notification-details">
                    <span class="notification-amount">${notification.transaction.amount}</span> 代币
                    <br>by <span class="notification-trader">${notification.transaction.trader}</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = notificationItems;
    }

    // 成功地址管理方法
    viewSuccessAddresses() {
        const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
        const addressList = successAddresses ? JSON.parse(successAddresses) : [];
        
        if (addressList.length === 0) {
            this.showModal('成功地址', '暂无成功地址记录');
            return;
        }
        
        this.showSuccessAddressModal(addressList);
    }

    showSuccessAddressModal(addresses) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = '成功地址列表';
        modalBody.innerHTML = this.generateSuccessAddressTable(addresses);
        
        modal.classList.add('show');
    }

    generateSuccessAddressTable(addresses) {
        return `
            <div class="table-container">
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>地址</th>
                            <th>交易量</th>
                            <th>时间</th>
                            <th>日期</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addresses.map(addr => `
                            <tr>
                                <td style="font-family: 'Courier New', monospace; font-size: 0.8rem;">${addr.address}</td>
                                <td style="color: var(--success-color); font-weight: bold;">${addr.amount} 代币</td>
                                <td>${addr.time}</td>
                                <td>${addr.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    clearSuccessAddresses() {
        this.showModal('确认清除', '确定要清除所有成功地址记录吗？此操作不可恢复。', () => {
            localStorage.removeItem('memeCoinSuccessAddresses');
            this.updateSuccessAddressStats();
            this.log('成功地址记录已清除', 'warning');
        });
    }

    exportSuccessAddresses() {
        const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
        const addressList = successAddresses ? JSON.parse(successAddresses) : [];
        
        if (addressList.length === 0) {
            this.showModal('导出失败', '暂无成功地址记录可导出');
            return;
        }
        
        const csv = this.generateSuccessAddressCSV(addressList);
        const filename = `success_addresses_${new Date().toISOString().split('T')[0]}.csv`;
        this.downloadFile(filename, csv);
        this.log('成功地址记录已导出', 'success');
    }

    generateSuccessAddressCSV(addresses) {
        const headers = ['地址', '交易量', '时间', '日期', '时间戳'];
        const rows = addresses.map(addr => [
            addr.address,
            addr.amount,
            addr.time,
            addr.date,
            addr.timestamp
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    updateSuccessAddressStats() {
        try {
            const successAddresses = localStorage.getItem('memeCoinSuccessAddresses');
            const addressList = successAddresses ? JSON.parse(successAddresses) : [];
            
            // 更新统计信息
            const currentAddressCount = document.getElementById('currentAddressCount');
            const todayNewAddresses = document.getElementById('todayNewAddresses');
            const lastAddressUpdate = document.getElementById('lastAddressUpdate');
            const totalAddressVolume = document.getElementById('totalAddressVolume');
            
            if (currentAddressCount) {
                currentAddressCount.textContent = addressList.length;
            }
            
            if (totalAddressVolume) {
                const totalVolume = addressList.reduce((sum, addr) => sum + parseInt(addr.amount), 0);
                totalAddressVolume.textContent = `${totalVolume.toLocaleString()} 代币`;
            }
            
            if (lastAddressUpdate) {
                if (addressList.length > 0) {
                    const lastUpdate = new Date(addressList[0].timestamp);
                    lastAddressUpdate.textContent = lastUpdate.toLocaleString();
                } else {
                    lastAddressUpdate.textContent = '无';
                }
            }
            
            // 计算今日新增地址数
            if (todayNewAddresses) {
                const today = new Date().toDateString();
                const todayCount = addressList.filter(addr => 
                    new Date(addr.timestamp).toDateString() === today
                ).length;
                todayNewAddresses.textContent = todayCount;
            }
            
            // 更新地址列表显示
            this.updateAdminSuccessAddresses(addressList);
            
        } catch (error) {
            console.error('Failed to update success address stats:', error);
        }
    }

    updateAdminSuccessAddresses(addressList) {
        const container = document.getElementById('adminSuccessAddresses');
        if (!container) return;
        
        if (addressList.length === 0) {
            container.innerHTML = '<div class="no-addresses">暂无成功地址</div>';
            return;
        }
        
        container.innerHTML = addressList.map(addr => `
            <div class="admin-address-item">
                <div class="admin-address-info">
                    <div class="admin-address-text">${addr.address}</div>
                    <div class="admin-address-details">${addr.date} ${addr.time}</div>
                </div>
                <div class="admin-address-amount">${addr.amount} 代币</div>
            </div>
        `).join('');
    }

    // 持仓快照管理方法
    viewHoldersSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            
            if (rewardSnapshots.length === 0) {
                this.showModal('提示', '暂无持仓快照数据');
                return;
            }
            
            this.showHoldersSnapshotModal(rewardSnapshots);
        } catch (error) {
            console.error('Failed to view holders snapshots:', error);
            this.showModal('错误', '查看持仓快照失败');
        }
    }

    showHoldersSnapshotModal(snapshots) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = '持仓快照列表';
            modalContent.innerHTML = this.generateHoldersSnapshotTable(snapshots);
            modal.style.display = 'block';
        }
    }

    generateHoldersSnapshotTable(snapshots) {
        let tableHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>快照ID</th>
                            <th>时间</th>
                            <th>代币地址</th>
                            <th>持仓数量</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        snapshots.forEach((snapshot, index) => {
            const date = new Date(snapshot.timestamp).toLocaleString();
            const holderCount = snapshot.holders ? snapshot.holders.length : 0;
            
            tableHTML += `
                <tr>
                    <td>${snapshot.snapshotId}</td>
                    <td>${date}</td>
                    <td>${snapshot.tokenAddress ? snapshot.tokenAddress.slice(0, 8) + '...' + snapshot.tokenAddress.slice(-8) : '--'}</td>
                    <td>${holderCount}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="window.adminApp.configManager.viewSnapshotDetails('${snapshot.snapshotId}')">
                            查看详情
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }

    viewSnapshotDetails(snapshotId) {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const snapshot = snapshots.find(s => s.snapshotId === snapshotId);
            
            if (!snapshot) {
                this.showModal('错误', '快照不存在');
                return;
            }
            
            this.showSnapshotDetailsModal(snapshot);
        } catch (error) {
            console.error('Failed to view snapshot details:', error);
            this.showModal('错误', '查看快照详情失败');
        }
    }

    showSnapshotDetailsModal(snapshot) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = `持仓快照详情 - ${snapshot.snapshotId}`;
            modalContent.innerHTML = this.generateSnapshotDetailsTable(snapshot);
            modal.style.display = 'block';
        }
    }

    generateSnapshotDetailsTable(snapshot) {
        let tableHTML = `
            <div class="snapshot-info">
                <p><strong>快照时间:</strong> ${new Date(snapshot.timestamp).toLocaleString()}</p>
                <p><strong>代币地址:</strong> ${snapshot.tokenAddress}</p>
                <p><strong>持仓数量:</strong> ${snapshot.holders ? snapshot.holders.length : 0}</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>地址</th>
                            <th>持仓量</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (snapshot.holders && snapshot.holders.length > 0) {
            snapshot.holders.forEach(holder => {
                tableHTML += `
                    <tr>
                        <td>#${holder.rank}</td>
                        <td>${holder.address}</td>
                        <td>${this.formatBalance(holder.balance)}</td>
                    </tr>
                `;
            });
        } else {
            tableHTML += '<tr><td colspan="3">无持仓数据</td></tr>';
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }

    exportHoldersSnapshots() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            
            if (rewardSnapshots.length === 0) {
                this.showModal('提示', '暂无持仓快照数据可导出');
                return;
            }
            
            const csvContent = this.generateHoldersSnapshotCSV(rewardSnapshots);
            const filename = `holders_snapshots_${new Date().toISOString().slice(0, 10)}.csv`;
            this.downloadFile(filename, csvContent);
            
            this.log(`导出持仓快照成功，共 ${rewardSnapshots.length} 个快照`, 'success');
        } catch (error) {
            console.error('Failed to export holders snapshots:', error);
            this.showModal('错误', '导出持仓快照失败');
        }
    }

    generateHoldersSnapshotCSV(snapshots) {
        let csv = '快照ID,时间,代币地址,持仓数量\n';
        
        snapshots.forEach(snapshot => {
            const date = new Date(snapshot.timestamp).toLocaleString();
            const holderCount = snapshot.holders ? snapshot.holders.length : 0;
            const tokenAddress = snapshot.tokenAddress || '';
            
            csv += `"${snapshot.snapshotId}","${date}","${tokenAddress}",${holderCount}\n`;
        });
        
        return csv;
    }

    clearHoldersSnapshots() {
        this.showModal('确认', '确定要清空所有持仓快照数据吗？此操作不可恢复。', () => {
            try {
                localStorage.removeItem('memeCoinHoldersSnapshots');
                this.updateHoldersSnapshotStats();
                this.log('持仓快照数据已清空', 'success');
            } catch (error) {
                console.error('Failed to clear holders snapshots:', error);
                this.showModal('错误', '清空持仓快照失败');
            }
        });
    }

    updateHoldersSnapshotStats() {
        try {
            const snapshots = JSON.parse(localStorage.getItem('memeCoinHoldersSnapshots') || '[]');
            const rewardSnapshots = snapshots.filter(snapshot => snapshot.type === 'reward_end');
            const count = rewardSnapshots.length;
            
            // 更新状态显示
            const statusDot = document.getElementById('holdersSnapshotStatusDot');
            const statusText = document.getElementById('holdersSnapshotStatusText');
            const countElement = document.getElementById('holdersSnapshotCount');
            const latestElement = document.getElementById('holdersSnapshotLatest');
            
            if (statusDot) {
                statusDot.textContent = count > 0 ? '🟢' : '🔴';
            }
            
            if (statusText) {
                statusText.textContent = count > 0 ? `${count} 个快照` : '无快照';
            }
            
            if (countElement) {
                countElement.textContent = count;
            }
            
            if (latestElement && rewardSnapshots.length > 0) {
                const latest = rewardSnapshots[rewardSnapshots.length - 1];
                const date = new Date(latest.timestamp).toLocaleString();
                latestElement.textContent = date;
            }
        } catch (error) {
            console.error('Failed to update holders snapshot stats:', error);
        }
    }

    formatBalance(balance) {
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + 'M';
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + 'K';
        } else {
            return balance.toFixed(2);
        }
    }

    // 奖励数据管理方法
    updateRewardDataStats() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            const rewardHistory = JSON.parse(localStorage.getItem('rewardHistory') || '[]');

            // 更新统计显示
            const mainCountdownCount = document.getElementById('mainCountdownRewardCount');
            const holdingCount = document.getElementById('holdingRewardCount');
            const claimedCount = document.getElementById('claimedRewardCount');
            const totalPoints = document.getElementById('totalRewardPoints');

            if (mainCountdownCount) {
                mainCountdownCount.textContent = `${mainCountdownRewards.length} 轮`;
            }

            if (holdingCount) {
                holdingCount.textContent = `${holdingRewards.length} 轮`;
            }

            if (claimedCount) {
                const claimedRewards = rewardHistory.length;
                claimedCount.textContent = `${claimedRewards} 次`;
            }

            if (totalPoints) {
                const totalMainPoints = mainCountdownRewards.reduce((sum, reward) => sum + (reward.amount || 10000), 0);
                const totalHoldingPoints = holdingRewards.reduce((sum, reward) => sum + (reward.amount || 3000), 0);
                const total = totalMainPoints + totalHoldingPoints;
                totalPoints.textContent = `${total.toLocaleString()} 积分`;
            }

            // 更新最近奖励记录
            this.updateRecentRewards();

            // 更新状态指示器
            const statusDot = document.getElementById('rewardDataStatusDot');
            const statusText = document.getElementById('rewardDataStatusText');
            
            if (statusDot) {
                const totalRewards = mainCountdownRewards.length + holdingRewards.length;
                statusDot.textContent = totalRewards > 0 ? '🟢' : '🔴';
            }
            
            if (statusText) {
                const totalRewards = mainCountdownRewards.length + holdingRewards.length;
                statusText.textContent = totalRewards > 0 ? `${totalRewards} 轮奖励` : '无奖励';
            }
        } catch (error) {
            console.error('Failed to update reward data stats:', error);
        }
    }

    updateRecentRewards() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');
            const recentRewardsContainer = document.getElementById('recentRewards');

            if (!recentRewardsContainer) return;

            // 合并所有奖励并按时间排序
            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // 只显示最近5个奖励
            const recentRewards = allRewards.slice(0, 5);

            if (recentRewards.length === 0) {
                recentRewardsContainer.innerHTML = '<div class="no-rewards">暂无奖励记录</div>';
                return;
            }

            let html = '';
            recentRewards.forEach(reward => {
                const date = new Date(reward.timestamp).toLocaleString();
                const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
                const status = reward.claimed ? 'claimed' : 'unclaimed';
                const statusText = reward.claimed ? '已领取' : '未领取';
                
                let winner = '';
                if (reward.type === 'main-countdown') {
                    winner = reward.winner || '未知';
                } else {
                    winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' 个地址' : '0 个地址';
                }

                html += `
                    <div class="reward-item">
                        <div class="reward-header">
                            <div class="reward-type ${reward.type}">
                                <i class="fa fa-${reward.type === 'main-countdown' ? 'trophy' : 'diamond'}"></i>
                                ${reward.type === 'main-countdown' ? '主倒计时奖励' : '持仓奖励'}
                            </div>
                            <div class="reward-time">${date}</div>
                        </div>
                        <div class="reward-details">
                            <div class="reward-winner">${winner}</div>
                            <div class="reward-amount">${amount.toLocaleString()} 积分</div>
                            <div class="reward-status ${status}">${statusText}</div>
                        </div>
                    </div>
                `;
            });

            recentRewardsContainer.innerHTML = html;
        } catch (error) {
            console.error('Failed to update recent rewards:', error);
        }
    }

    viewRewardData() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');

            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            this.showRewardDataModal(allRewards);
        } catch (error) {
            console.error('Failed to view reward data:', error);
            this.log('查看奖励数据失败', 'error');
        }
    }

    showRewardDataModal(rewards) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '奖励数据详情';
        
        if (rewards.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #9CA3AF;">暂无奖励数据</p>';
        } else {
            let html = `
                <div class="table-container">
                    <table class="reward-history-table">
                        <thead>
                            <tr>
                                <th>类型</th>
                                <th>时间</th>
                                <th>获得者</th>
                                <th>积分</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            rewards.forEach(reward => {
                const date = new Date(reward.timestamp).toLocaleString();
                const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
                const status = reward.claimed ? 'claimed' : 'unclaimed';
                const statusText = reward.claimed ? '已领取' : '未领取';
                
                let winner = '';
                if (reward.type === 'main-countdown') {
                    winner = reward.winner || '未知';
                } else {
                    winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' 个地址' : '0 个地址';
                }

                html += `
                    <tr>
                        <td>
                            <span class="reward-type ${reward.type}">
                                <i class="fa fa-${reward.type === 'main-countdown' ? 'trophy' : 'diamond'}"></i>
                                ${reward.type === 'main-countdown' ? '主倒计时' : '持仓奖励'}
                            </span>
                        </td>
                        <td>${date}</td>
                        <td class="reward-history-address">${winner}</td>
                        <td class="reward-history-amount">${amount.toLocaleString()}</td>
                        <td><span class="reward-history-status ${status}">${statusText}</span></td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            modalContent.innerHTML = html;
        }

        modal.classList.add('show');
    }

    exportRewardData() {
        try {
            const mainCountdownRewards = JSON.parse(localStorage.getItem('mainCountdownRewards') || '[]');
            const holdingRewards = JSON.parse(localStorage.getItem('holdingRewards') || '[]');

            const allRewards = [
                ...mainCountdownRewards.map(reward => ({ ...reward, type: 'main-countdown' })),
                ...holdingRewards.map(reward => ({ ...reward, type: 'holding' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const csv = this.generateRewardDataCSV(allRewards);
            const filename = `reward_data_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(filename, csv);
            this.log('奖励数据导出成功', 'success');
        } catch (error) {
            console.error('Failed to export reward data:', error);
            this.log('奖励数据导出失败', 'error');
        }
    }

    generateRewardDataCSV(rewards) {
        const headers = ['类型', '时间', '获得者', '积分', '状态', '轮次'];
        const rows = rewards.map(reward => {
            const date = new Date(reward.timestamp).toLocaleString();
            const amount = reward.amount || (reward.type === 'main-countdown' ? 10000 : 3000);
            const status = reward.claimed ? '已领取' : '未领取';
            
            let winner = '';
            if (reward.type === 'main-countdown') {
                winner = reward.winner || '未知';
            } else {
                winner = reward.eligibleAddresses ? reward.eligibleAddresses.length + ' 个地址' : '0 个地址';
            }

            return [
                reward.type === 'main-countdown' ? '主倒计时奖励' : '持仓奖励',
                date,
                winner,
                amount,
                status,
                reward.round || '未知'
            ];
        });

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    viewRewardHistory() {
        try {
            const rewardHistory = JSON.parse(localStorage.getItem('rewardHistory') || '[]');
            this.showRewardHistoryModal(rewardHistory);
        } catch (error) {
            console.error('Failed to view reward history:', error);
            this.log('查看奖励历史失败', 'error');
        }
    }

    showRewardHistoryModal(history) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '奖励领取历史';
        
        if (history.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #9CA3AF;">暂无领取历史</p>';
        } else {
            let html = `
                <div class="table-container">
                    <table class="reward-history-table">
                        <thead>
                            <tr>
                                <th>类型</th>
                                <th>时间</th>
                                <th>钱包地址</th>
                                <th>积分</th>
                                <th>轮次</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            history.forEach(record => {
                const date = new Date(record.timestamp).toLocaleString();
                const address = record.address || '未知';

                html += `
                    <tr>
                        <td>${record.type}</td>
                        <td>${date}</td>
                        <td class="reward-history-address">${address}</td>
                        <td class="reward-history-amount">${record.amount.toLocaleString()}</td>
                        <td>${record.rounds || '1'}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            modalContent.innerHTML = html;
        }

        modal.classList.add('show');
    }

    clearRewardData() {
        this.showModal(
            '清除奖励数据',
            '确定要清除所有奖励数据吗？此操作不可恢复！',
            () => {
                try {
                    localStorage.removeItem('mainCountdownRewards');
                    localStorage.removeItem('holdingRewards');
                    localStorage.removeItem('rewardHistory');
                    
                    this.updateRewardDataStats();
                    this.log('奖励数据已清除', 'success');
                } catch (error) {
                    console.error('Failed to clear reward data:', error);
                    this.log('清除奖励数据失败', 'error');
                }
            }
        );
    }
}

// 系统监控类
class SystemMonitor {
    constructor() {
        this.startTime = new Date();
        this.init();
    }

    // 初始化监控
    init() {
        this.startUptimeCounter();
        this.startRefreshCounter();
        this.startCountdownStatusUpdate();
        this.startRewardCountdownStatusUpdate();
        this.startLargeTransactionStatusUpdate();
        this.startSuccessAddressStatusUpdate();
        this.startHoldersSnapshotStatusUpdate();
        this.startRewardDataStatusUpdate();
    }

    // 启动运行时间计数器
    startUptimeCounter() {
        setInterval(() => {
            const uptime = document.getElementById('uptime');
            if (uptime) {
                const now = new Date();
                const diff = now - this.startTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                uptime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    // 启动刷新计数器
    startRefreshCounter() {
        let count = 10;
        setInterval(() => {
            const refreshCount = document.getElementById('refreshCount');
            if (refreshCount) {
                count = count === 0 ? 10 : count - 1;
                refreshCount.textContent = count;
            }
        }, 1000);
    }

    // 启动倒计时状态更新
    startCountdownStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.checkGlobalCountdown();
                window.adminApp.configManager.updateCountdownStatus();
            }
        }, 1000);
    }

    // 启动持仓倒计时状态更新
    startRewardCountdownStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateRewardCountdownStatus();
            }
        }, 1000);
    }

    // 启动大额交易通知状态更新
    startLargeTransactionStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateLargeTransactionStats();
            }
        }, 5000); // 每5秒更新一次
    }

    // 启动成功地址状态更新
    startSuccessAddressStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateSuccessAddressStats();
            }
        }, 5000); // 每5秒更新一次
    }

    // 启动持仓快照状态更新
    startHoldersSnapshotStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateHoldersSnapshotStats();
            }
        }, 5000); // 每5秒更新一次
    }

    // 启动奖励数据状态更新
    startRewardDataStatusUpdate() {
        setInterval(() => {
            if (window.adminApp && window.adminApp.configManager) {
                window.adminApp.configManager.updateRewardDataStats();
            }
        }, 5000); // 每5秒更新一次
    }
}

// 主应用类
class AdminApp {
    constructor() {
        this.configManager = null;
        this.systemMonitor = null;
    }

    // 初始化应用
    init() {
        this.configManager = new ConfigManager();
        this.systemMonitor = new SystemMonitor();
        
        console.log('Meme Coin 后台管理系统已启动');
        this.configManager.log('后台管理系统已启动', 'success');
    }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init();
    
    // 将应用实例挂载到全局，以便调试
    window.adminApp = app;
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.adminApp && window.adminApp.configManager) {
        window.adminApp.configManager.saveConfig();
    }
}); 