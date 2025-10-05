// scripts/pwa.js

// Progressive Web App functionality
class GamePulsePWA {
    constructor() {
        this.isInstalled = false;
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineSupport();
    }

    // Register Service Worker for offline functionality
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Handle install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            console.log('GamePulse installed successfully');
        });
    }

    // Show install button when PWA can be installed
    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('installButton')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'installButton';
            installBtn.className = 'btn primary';
            installBtn.innerHTML = '📱 Install GamePulse';
            installBtn.style.position = 'fixed';
            installBtn.style.bottom = '20px';
            installBtn.style.right = '20px';
            installBtn.style.zIndex = '1000';
            installBtn.onclick = () => this.installApp();
            
            document.body.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('installButton');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // Trigger PWA installation
    installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                this.deferredPrompt = null;
            });
        }
    }

    // Setup offline support
    setupOfflineSupport() {
        // Cache essential game data for offline use
        if ('caches' in window) {
            this.cacheEssentialData();
        }

        // Listen for online/offline status
        window.addEventListener('online', () => {
            this.showMessage('Connection restored', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showMessage('You are offline - using cached data', 'warning');
        });
    }

    // Cache essential data for offline use
    async cacheEssentialData() {
        try {
            const cache = await caches.open('gamepulse-v1');
            const essentialUrls = [
                '/',
                '/index.html',
                '/style.css',
                '/scripts/script.js',
                '/scripts/pwa.js',
                '/dashboard.html',
                '/games.html',
                '/game-details.html'
            ];
            
            await cache.addAll(essentialUrls);
            console.log('Essential data cached for offline use');
        } catch (error) {
            console.log('Cache setup failed:', error);
        }
    }

    // Sync data when coming back online
    syncOfflineData() {
        // In a real app, this would sync with a backend
        console.log('Syncing offline data...');
        // For now, we'll just use localStorage which persists
    }

    // Show status messages
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        const colors = {
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#0088ff'
        };
        
        messageDiv.style.background = colors[type] || colors.info;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Check if app is running as PWA
    isRunningAsPWA() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }

    // Get device capabilities for automatic tracking
    getDeviceCapabilities() {
        return {
            hasGamepad: 'getGamepads' in navigator,
            hasStorage: 'storage' in navigator,
            hasBluetooth: 'bluetooth' in navigator,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isPWA: this.isRunningAsPWA()
        };
    }

    // Request permissions for automatic tracking
    async requestTrackingPermissions() {
        if ('permissions' in navigator) {
            try {
                // Request notification permission
                const notificationPermission = await Notification.requestPermission();
                
                // In a real app, you'd request more permissions here
                console.log('Notification permission:', notificationPermission);
                
                return {
                    notifications: notificationPermission,
                    storage: 'granted', // localStorage is always available
                    // Add more permissions as needed
                };
            } catch (error) {
                console.log('Permission request failed:', error);
                return null;
            }
        }
        return null;
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePulsePWA = new GamePulsePWA();
    
    // Add to global GamePulse object if it exists
    if (window.GamePulse) {
        window.GamePulse.PWA = window.gamePulsePWA;
    }
});

// Service Worker (sw.js) - create this file separately
const CACHE_NAME = 'gamepulse-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/scripts/script.js',
    '/scripts/pwa.js',
    '/dashboard.html',
    '/games.html',
    '/game-details.html',
    '/profile.html',
    '/blogs.html',
    '/create-blog.html',
    '/login.html',
    '/register.html',
    '/admin.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});