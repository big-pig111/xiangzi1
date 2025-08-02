/**
 * Whitepaper Modal Manager
 * Handles the display and management of the whitepaper modal
 */

class WhitepaperModal {
    constructor() {
        this.isOpen = false;
        this.iframe = null;
        this.overlay = null;
        this.init();
    }

    init() {
        console.log('Initializing WhitepaperModal...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        console.log('Setting up whitepaper event listeners...');
        
        // Whitepaper button
        const whitepaperBtn = document.getElementById('whitepaperBtn');
        if (whitepaperBtn) {
            console.log('Found whitepaper button, adding click listener');
            whitepaperBtn.addEventListener('click', () => {
                console.log('Whitepaper button clicked');
                this.show();
            });
        } else {
            console.error('Whitepaper button not found!');
        }

        // Listen for close messages from whitepaper page
        window.addEventListener('message', (event) => {
            if (event.data.type === 'closeWhitepaper') {
                this.close();
            }
        });

        // Listen for ESC key to close
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    // 显示白皮书
    show() {
        if (this.isOpen) return;

        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'whitepaper-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;

        // 创建iframe容器
        const container = document.createElement('div');
        container.style.cssText = `
            width: 95%;
            height: 95%;
            max-width: 1400px;
            max-height: 900px;
            position: relative;
            border-radius: 12px;
            overflow: visible;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 4px solid #000;
        `;

        // 创建iframe容器（内部容器，用于处理overflow）
        const iframeContainer = document.createElement('div');
        iframeContainer.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 12px;
        `;

        // 创建iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'whitepaper.html';
        this.iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 12px;
            background: white;
        `;

        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '🚀';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF2E63, #9D4EDD);
            color: white;
            border: 4px solid #000;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
            font-family: 'Comic Sans MS', 'Comic Neue', cursive;
            transform: rotate(-5deg);
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #FF2E63, #FFDD00)';
            closeBtn.style.transform = 'rotate(0deg) scale(1.1)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #FF2E63, #9D4EDD)';
            closeBtn.style.transform = 'rotate(-5deg) scale(1)';
        });

        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // 组装DOM
        iframeContainer.appendChild(this.iframe);
        container.appendChild(iframeContainer);
        container.appendChild(closeBtn);
        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);

        // 添加动画效果
        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.overlay.style.transition = 'all 0.3s ease';
            this.overlay.style.opacity = '1';
            this.overlay.style.transform = 'scale(1)';
        }, 10);

        this.isOpen = true;

        // 阻止背景滚动
        document.body.style.overflow = 'hidden';

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });
    }

    // 关闭白皮书
    close() {
        if (!this.isOpen) return;

        // 添加关闭动画
        this.overlay.style.transition = 'all 0.3s ease';
        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'scale(0.9)';

        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.iframe = null;
            this.isOpen = false;

            // 恢复背景滚动
            document.body.style.overflow = '';
        }, 300);
    }

    // 切换显示状态
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.show();
        }
    }
}

// Make WhitepaperModal available globally for script tag usage
window.WhitepaperModal = WhitepaperModal; 