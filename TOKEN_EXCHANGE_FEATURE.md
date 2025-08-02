# 代币兑换功能文档

## 概述

代币兑换功能允许用户将游戏积分按照1:10的比例兑换为MEME代币，使用Firebase云函数确保安全可靠的兑换过程。

## 功能特性

### 1. 兑换比例
- **1:10兑换比例**: 1个积分 = 10个MEME代币
- **实时计算**: 输入积分数量时实时显示将获得的代币数量
- **比例验证**: 前端和后端都验证兑换比例的正确性

### 2. 兑换流程
- **钱包连接**: 必须连接钱包才能进行兑换
- **积分验证**: 检查用户是否有足够的积分进行兑换
- **Firebase云函数**: 使用`claimToken`云函数处理兑换逻辑
- **实时更新**: 兑换成功后实时更新积分和代币余额

### 3. 用户界面
- **兑换计算器**: 输入积分数量，实时显示代币数量
- **状态指示**: 显示兑换按钮的可用状态和错误信息
- **加载状态**: 兑换过程中显示加载动画
- **成功反馈**: 兑换成功后显示确认信息

### 4. 历史记录
- **兑换历史**: 记录所有兑换交易
- **详细信息**: 包含时间、积分数量、代币数量等
- **本地存储**: 使用localStorage保存兑换历史

## 技术实现

### 前端实现

#### HTML结构
```html
<!-- Token Exchange Section -->
<div class="reward-section">
    <h2>🪙 Token Exchange</h2>
    <div class="exchange-info">
        <div class="exchange-rate">
            <h4>💱 Exchange Rate</h4>
            <div class="rate-display">
                <span class="rate-value">1 Point = 10 MEME Tokens</span>
            </div>
        </div>
        
        <div class="exchange-calculator">
            <h4>🧮 Exchange Calculator</h4>
            <div class="calculator-input">
                <input type="number" id="exchangeAmount" oninput="updateExchangePreview()">
                <div class="exchange-preview" id="exchangePreview">
                    <span>You will receive: <strong id="tokenAmount">0</strong> MEME tokens</span>
                </div>
            </div>
        </div>
        
        <div class="exchange-actions">
            <button id="exchangeBtn" onclick="exchangeTokens()">🪙 Exchange Points for Tokens</button>
            <div class="exchange-status" id="exchangeStatus"></div>
        </div>
    </div>
</div>
```

#### JavaScript功能
```javascript
// 更新兑换预览
function updateExchangePreview() {
    const exchangeAmount = parseInt(document.getElementById('exchangeAmount').value) || 0;
    const tokenAmount = exchangeAmount * 10; // 1:10 ratio
    document.getElementById('tokenAmount').textContent = tokenAmount.toLocaleString();
    updateExchangeButton();
}

// 兑换代币
async function exchangeTokens() {
    // 验证输入
    // 调用Firebase云函数
    // 更新本地存储
    // 更新UI显示
}

// 调用Firebase云函数
async function callFirebaseClaimToken(walletAddress, pointsAmount, tokenAmount) {
    const callable = firebase.functions().httpsCallable('claimToken');
    const result = await callable({
        walletAddress: walletAddress,
        pointsAmount: pointsAmount,
        tokenAmount: tokenAmount,
        timestamp: new Date().toISOString()
    });
    return result;
}
```

### 后端实现 (Firebase云函数)

#### 云函数结构
```javascript
exports.claimToken = functions.https.onCall(async (data, context) => {
    try {
        // 1. 验证输入数据
        const { walletAddress, pointsAmount, tokenAmount, timestamp } = data;
        
        // 2. 验证兑换比例
        if (tokenAmount !== pointsAmount * 10) {
            throw new Error('Invalid exchange ratio');
        }
        
        // 3. 检查用户积分余额
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        const availablePoints = userDoc.data().points || 0;
        
        if (availablePoints < pointsAmount) {
            throw new Error('Insufficient points');
        }
        
        // 4. 执行兑换交易
        const result = await db.runTransaction(async (transaction) => {
            // 更新用户积分
            const newPoints = availablePoints - pointsAmount;
            transaction.update(userRef, { points: newPoints });
            
            // 更新用户代币余额
            const currentTokens = userDoc.data().memeTokens || 0;
            const newTokens = currentTokens + tokenAmount;
            transaction.update(userRef, { memeTokens: newTokens });
            
            // 记录兑换交易
            const exchangeRef = db.collection('exchanges').doc();
            transaction.set(exchangeRef, {
                walletAddress: walletAddress,
                pointsAmount: pointsAmount,
                tokenAmount: tokenAmount,
                exchangeRate: 10,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            });
            
            return { newPoints, newTokens, transactionId: exchangeRef.id };
        });
        
        // 5. 返回成功响应
        return {
            success: true,
            data: {
                walletAddress: walletAddress,
                pointsExchanged: pointsAmount,
                tokensReceived: tokenAmount,
                newPointsBalance: result.newPoints,
                newTokenBalance: result.newTokens,
                transactionId: result.transactionId
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});
```

## 数据库结构

### Firestore集合

#### users集合
```javascript
{
    walletAddress: "用户钱包地址",
    points: 1000,           // 当前积分余额
    memeTokens: 5000,       // 当前代币余额
    createdAt: timestamp,   // 创建时间
    lastUpdated: timestamp, // 最后更新时间
    lastTokenUpdate: timestamp // 最后代币更新时间
}
```

#### exchanges集合
```javascript
{
    walletAddress: "用户钱包地址",
    pointsAmount: 100,      // 兑换的积分数量
    tokenAmount: 1000,      // 获得的代币数量
    exchangeRate: 10,       // 兑换比例
    timestamp: timestamp,   // 兑换时间
    status: "completed",    // 交易状态
    transactionId: "交易ID"
}
```

## 安全措施

### 1. 输入验证
- 验证钱包地址格式
- 验证积分和代币数量为正数
- 验证兑换比例正确性

### 2. 余额检查
- 检查用户是否有足够积分
- 使用数据库事务确保数据一致性
- 防止重复兑换

### 3. 错误处理
- 详细的错误信息返回
- 交易失败时的回滚机制
- 日志记录所有兑换操作

## 部署说明

### 1. Firebase项目设置
```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录Firebase
firebase login

# 初始化项目
firebase init functions

# 安装依赖
cd functions
npm install firebase-admin firebase-functions
```

### 2. 部署云函数
```bash
# 部署所有云函数
firebase deploy --only functions

# 部署特定云函数
firebase deploy --only functions:claimToken
```

### 3. 前端配置
```javascript
// 在claim-reward.html中更新Firebase配置
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## 测试方法

### 1. 使用测试页面
- 打开 `test_token_exchange.html`
- 设置测试钱包和积分
- 测试兑换功能

### 2. 测试步骤
1. 设置测试钱包地址
2. 添加测试积分数据
3. 输入兑换数量
4. 点击兑换按钮
5. 验证兑换结果

### 3. 验证项目
- 检查积分余额是否正确减少
- 检查代币余额是否正确增加
- 检查兑换历史是否正确记录
- 检查Firebase云函数是否正常调用

## 故障排除

### 常见问题

1. **Firebase连接失败**
   - 检查Firebase配置是否正确
   - 确认网络连接正常
   - 检查Firebase项目状态

2. **兑换失败**
   - 检查用户积分是否足够
   - 确认钱包地址格式正确
   - 查看Firebase云函数日志

3. **兑换比例错误**
   - 检查前端计算逻辑
   - 确认云函数验证逻辑
   - 验证数据库存储

### 调试方法

1. **查看浏览器控制台**
   - 检查JavaScript错误
   - 查看网络请求状态
   - 验证数据格式

2. **查看Firebase日志**
   - 在Firebase控制台查看云函数日志
   - 检查数据库操作记录
   - 验证交易状态

3. **使用测试工具**
   - 使用Firebase模拟器进行本地测试
   - 使用测试页面验证功能
   - 检查数据一致性

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现基本的代币兑换功能
- 集成Firebase云函数
- 添加兑换历史记录
- 实现实时余额更新

---

**注意**: 此功能需要Firebase项目支持，请确保正确配置Firebase服务和云函数。 