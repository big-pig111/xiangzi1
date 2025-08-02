# Meme Coin Countdown & Solana Tracker 🚀

A meme coin countdown website integrated with QuickNode RPC functionality, including a backend management system for configuring RPC and token addresses.

## 📁 Project Structure

```
project/
├── index.html          # Main website frontend
├── styles.css          # Frontend stylesheet
├── script.js           # Frontend JavaScript logic
├── admin.html          # Backend management system
├── admin.css           # Backend stylesheet
├── admin.js            # Backend JavaScript logic
└── README.md           # Project documentation
```

## 🔄 Refactoring Content

### 1. Code Separation
- **Frontend Website**: Focuses on user interface and transaction detection display
- **Backend Management System**: Responsible for RPC configuration, token address management, etc.
- **CSS**: Created independent stylesheet files containing all style definitions
- **JavaScript**: Created independent script files, organizing code using object-oriented approach

### 2. Code Organization

#### Frontend Website (`index.html`)
- Uses semantic HTML tags (`<header>`, `<main>`, `<section>`, `<footer>`)
- Added SEO-related meta tags
- Removed RPC configuration interface, replaced with automatic backend configuration loading
- Focuses on countdown and transaction detection display

#### Backend Management System (`admin.html`)
- Professional backend management interface
- RPC configuration and testing functionality
- Token address validation and management
- Countdown parameter configuration
- System status monitoring
- Log management functionality

#### CSS Styles
- **Frontend Styles** (`styles.css`): Focuses on user interface styles
- **Backend Styles** (`admin.css`): Professional backend management interface styles

#### JavaScript Logic
- **Frontend Logic** (`script.js`):
  - **CountdownTimer Class**: Handles countdown logic
  - **QuickNodeRPCManager Class**: Handles QuickNode RPC connection and transaction detection
  - **InteractionEffects Class**: Handles interaction effects
  - **SocialMediaShare Class**: Handles social media sharing
  - **FixedPanelManager Class**: Manages fixed panel functionality
  - **MemeCoinCountdownApp Class**: Main application class

- **Backend Logic** (`admin.js`):
  - **ConfigManager Class**: Configuration management
  - **SystemMonitor Class**: System monitoring
  - **AdminApp Class**: Backend main application class

### 3. Feature Set

#### Frontend Features
- 5-minute countdown
- Real-time transaction detection display
- Fixed panel display
- Social media sharing
- Automatic transaction record upload to backend

#### Backend Management Features
- **RPC Configuration Management**:
  - QuickNode RPC URL configuration
  - RPC connection testing
  - Connection status monitoring

- **Token Configuration Management**:
  - Solana token address configuration
  - Token address validation
  - Token name settings

- **Countdown Configuration**:
  - Countdown time settings
  - Countdown message configuration
  - Countdown reset functionality

- **System Management**:
  - System status monitoring
  - Configuration import/export
  - Log management
  - Cache clearing

- **Transaction Record Management**:
  - View transaction records (maximum 100 entries)
  - Export transaction records as CSV format
  - Clear transaction records
  - Duplicate detection prevention

- **Reward Data Management**:
  - View reward data (main countdown and holding rewards)
  - Export reward data as CSV format
  - View reward claim history
  - Clear reward data

- **Token Exchange Management**:
  - 1:10 ratio points to MEME tokens exchange
  - Firebase cloud function integration
  - Exchange history tracking
  - Real-time balance updates
  - Clear reward data
  - Real-time reward statistics
  - Recent reward display

### 4. Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styles, animations, responsive design
- **JavaScript ES6+**: Object-oriented programming, modular design
- **Solana Web3.js**: Solana blockchain interaction
- **Font Awesome**: Icon library
- **LocalStorage**: Local configuration storage

### 5. Browser Compatibility

- Chrome (Recommended)
- Firefox
- Safari
- Edge

## 🚀 Usage Instructions

### Frontend Website
1. Open `index.html` directly in a browser
2. The website will automatically load RPC and token address configurations from the backend
3. Observe real-time transaction detection results

### Backend Management System
1. Open `admin.html` in a browser
2. Configure QuickNode RPC URL
3. Configure token address and name
4. Set countdown parameters
5. After saving configuration, the frontend will automatically apply the changes

### Feature Testing
1. Open `test.html` in a browser to test transaction record management features
2. Can test transaction record generation, viewing, export, clearing, and other functions
3. Can test duplicate detection prevention and 100-record limit functionality
4. Open `test_reward_data_management.html` to test reward data management features
5. Can test reward data generation, viewing, export, clearing, and statistics functionality
6. Open `test_token_exchange.html` to test token exchange functionality
7. Can test points to tokens exchange, Firebase integration, and exchange history

## 🎨 Customization

### Modify Countdown Time
Modify the countdown minutes in the backend management system.

### Modify QuickNode RPC Configuration
Configure RPC URL and test connection in the backend management system.

### Modify Token Configuration
Configure token address and validation in the backend management system.

### Modify Color Theme
Modify color variables in the corresponding CSS files.

## 📝 Important Notes

- This is a demonstration project and does not include real cryptocurrency functionality
- QuickNode RPC functionality requires a valid QuickNode RPC node URL
- Token addresses must be valid Solana token addresses
- Backend configurations automatically sync to the frontend website
- It's recommended to use minified versions of CSS and JavaScript files in production
- Transaction detection functionality depends on RPC node performance and stability

## 🔧 Development Notes

### Frontend Website Features
- Removed RPC configuration interface for cleaner UI
- Automatic backend configuration loading
- Focus on user experience

### Backend Management System Features
- Professional configuration management interface
- Complete system monitoring functionality
- Configuration import/export functionality
- Detailed log recording

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

---

**Disclaimer**: This is a meme website, not investment advice. Please do not actually invest your life savings. 