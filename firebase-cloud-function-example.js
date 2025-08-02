// Firebase Cloud Function Example: claimToken
// This is an example implementation of the claimToken cloud function
// You need to deploy this to your Firebase project

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function: claimToken
// Handles the exchange of points for MEME tokens at 1:10 ratio
exports.claimToken = functions.https.onCall(async (data, context) => {
    try {
        // Validate input data
        const { walletAddress, pointsAmount, tokenAmount, timestamp } = data;
        
        if (!walletAddress || !pointsAmount || !tokenAmount) {
            throw new Error('Missing required parameters: walletAddress, pointsAmount, tokenAmount');
        }
        
        if (pointsAmount <= 0 || tokenAmount <= 0) {
            throw new Error('Invalid amounts: pointsAmount and tokenAmount must be positive');
        }
        
        // Validate exchange ratio (1:10)
        if (tokenAmount !== pointsAmount * 10) {
            throw new Error('Invalid exchange ratio: tokenAmount must be 10x pointsAmount');
        }
        
        // Get Firestore database reference
        const db = admin.firestore();
        
        // Check if user has enough points
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const availablePoints = userData.points || 0;
        
        if (availablePoints < pointsAmount) {
            throw new Error(`Insufficient points. Available: ${availablePoints}, Requested: ${pointsAmount}`);
        }
        
        // Create transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction) => {
            // Re-read user data in transaction
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data();
            const currentPoints = userData.points || 0;
            
            if (currentPoints < pointsAmount) {
                throw new Error(`Insufficient points. Available: ${currentPoints}, Requested: ${pointsAmount}`);
            }
            
            // Update user points
            const newPoints = currentPoints - pointsAmount;
            transaction.update(userRef, {
                points: newPoints,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Record the exchange transaction
            const exchangeRef = db.collection('exchanges').doc();
            transaction.set(exchangeRef, {
                walletAddress: walletAddress,
                pointsAmount: pointsAmount,
                tokenAmount: tokenAmount,
                exchangeRate: 10, // 1:10 ratio
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'completed',
                transactionId: exchangeRef.id
            });
            
            // Update user's token balance
            const currentTokens = userData.memeTokens || 0;
            const newTokens = currentTokens + tokenAmount;
            transaction.update(userRef, {
                memeTokens: newTokens,
                lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true,
                transactionId: exchangeRef.id,
                newPoints: newPoints,
                newTokens: newTokens,
                exchangeRate: 10
            };
        });
        
        // Log the successful exchange
        console.log(`Exchange completed: ${walletAddress} exchanged ${pointsAmount} points for ${tokenAmount} tokens`);
        
        // Return success response
        return {
            success: true,
            message: 'Exchange completed successfully',
            data: {
                walletAddress: walletAddress,
                pointsExchanged: pointsAmount,
                tokensReceived: tokenAmount,
                newPointsBalance: result.newPoints,
                newTokenBalance: result.newTokens,
                transactionId: result.transactionId,
                timestamp: timestamp
            }
        };
        
    } catch (error) {
        console.error('Exchange error:', error);
        
        // Return error response
        return {
            success: false,
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        };
    }
});

// Optional: Function to get user balance
exports.getUserBalance = functions.https.onCall(async (data, context) => {
    try {
        const { walletAddress } = data;
        
        if (!walletAddress) {
            throw new Error('Missing walletAddress parameter');
        }
        
        const db = admin.firestore();
        const userRef = db.collection('users').doc(walletAddress);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return {
                success: true,
                data: {
                    walletAddress: walletAddress,
                    points: 0,
                    memeTokens: 0
                }
            };
        }
        
        const userData = userDoc.data();
        
        return {
            success: true,
            data: {
                walletAddress: walletAddress,
                points: userData.points || 0,
                memeTokens: userData.memeTokens || 0,
                lastUpdated: userData.lastUpdated,
                lastTokenUpdate: userData.lastTokenUpdate
            }
        };
        
    } catch (error) {
        console.error('Get balance error:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
});

// Optional: Function to add points to user (for testing or admin use)
exports.addPoints = functions.https.onCall(async (data, context) => {
    try {
        const { walletAddress, points, reason } = data;
        
        if (!walletAddress || !points) {
            throw new Error('Missing required parameters: walletAddress, points');
        }
        
        if (points <= 0) {
            throw new Error('Points must be positive');
        }
        
        const db = admin.firestore();
        const userRef = db.collection('users').doc(walletAddress);
        
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                const currentPoints = userData.points || 0;
                const newPoints = currentPoints + points;
                
                transaction.update(userRef, {
                    points: newPoints,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new user
                transaction.set(userRef, {
                    walletAddress: walletAddress,
                    points: points,
                    memeTokens: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Record the points addition
            const pointsRef = db.collection('pointsHistory').doc();
            transaction.set(pointsRef, {
                walletAddress: walletAddress,
                pointsAdded: points,
                reason: reason || 'Manual addition',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        return {
            success: true,
            message: `Added ${points} points to ${walletAddress}`,
            data: {
                walletAddress: walletAddress,
                pointsAdded: points,
                reason: reason
            }
        };
        
    } catch (error) {
        console.error('Add points error:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
});

// Firestore security rules example
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{walletAddress} {
      allow read, write: if request.auth != null && request.auth.uid == walletAddress;
    }
    
    // Exchanges are read-only for users, writable by cloud functions
    match /exchanges/{exchangeId} {
      allow read: if request.auth != null;
      allow write: if false; // Only cloud functions can write
    }
    
    // Points history is read-only for users
    match /pointsHistory/{historyId} {
      allow read: if request.auth != null;
      allow write: if false; // Only cloud functions can write
    }
  }
}
*/

// Deployment instructions:
// 1. Install Firebase CLI: npm install -g firebase-tools
// 2. Login to Firebase: firebase login
// 3. Initialize project: firebase init functions
// 4. Copy this code to functions/index.js
// 5. Install dependencies: cd functions && npm install firebase-admin firebase-functions
// 6. Deploy: firebase deploy --only functions
//
// Don't forget to:
// - Update your Firebase configuration in the frontend
// - Set up Firestore database
// - Configure security rules
// - Set up authentication if needed 