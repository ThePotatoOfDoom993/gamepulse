// scripts/script.js - COMPLETE UPDATED VERSION WITH SERVER SUPPORT

// Main initialization function
function initWebsite() {
    updateNavigation();
    setupSmoothScrolling();
    setupNavbarEffects();
    setupScrollProgress();
    setupAnimations();
    setupButtonEffects();
    setupBlogNavigation();
    setupRoleBasedFeatures();
    initializeGamingSystem();
    initializeServer(); // NEW: Initialize server connection
    
    console.log('🚀 GamePulse website loaded successfully!');
}

// Update navigation based on login status
function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const navMenu = document.querySelector('.nav-menu');
    
    if (navMenu && !window.location.pathname.includes('admin.html') && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        
        if (currentUser) {
            // User is logged in - show profile/logout links
            let roleLinks = '';
            
            if (currentUser.role === 'admin' || currentUser.role === 'owner') {
                roleLinks = '<a href="admin.html" class="nav-link">Admin Panel</a>';
            } else if (['content-creator', 'youth-mentor'].includes(currentUser.role)) {
                roleLinks = '<a href="create-blog.html" class="nav-link">Create Blog</a>';
            }
            
            navMenu.innerHTML = `
                <a href="dashboard.html" class="nav-link ${window.location.pathname.includes('dashboard.html') ? 'active' : ''}">Dashboard</a>
                <a href="games.html" class="nav-link ${window.location.pathname.includes('games.html') ? 'active' : ''}">My Games</a>
                <a href="blogs.html" class="nav-link ${window.location.pathname.includes('blogs.html') ? 'active' : ''}">Blogs</a>
                <a href="profile.html" class="nav-link ${window.location.pathname.includes('profile.html') ? 'active' : ''}">My Profile</a>
                ${roleLinks}
            `;
        } else {
            // User is not logged in - show login/register links
            navMenu.innerHTML = `
                <a href="index.html" class="nav-link ${window.location.pathname.includes('index.html') ? 'active' : ''}">Home</a>
                <a href="blogs.html" class="nav-link ${window.location.pathname.includes('blogs.html') ? 'active' : ''}">Blogs</a>
                <a href="index.html#community" class="nav-link">Community</a>
                <a href="login.html" class="nav-link ${window.location.pathname.includes('login.html') ? 'active' : ''}">Login</a>
                <a href="register.html" class="nav-link ${window.location.pathname.includes('register.html') ? 'active' : ''}">Register</a>
            `;
        }
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navbar background on scroll
function setupNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        });
    }

    // Glitch effect for logo
    const glitchLogo = document.querySelector('.nav-logo');
    if (glitchLogo) {
        glitchLogo.addEventListener('mouseenter', () => {
            glitchLogo.style.textShadow = '2px 2px 0 #ff0080, -2px -2px 0 #00ffff';
            setTimeout(() => {
                glitchLogo.style.textShadow = 'none';
            }, 200);
        });
    }
}

// Scroll progress indicator
function setupScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }
}

// Intersection Observer for animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .pricing-card, .exp-card, .blog-article').forEach(el => {
        if (el) observer.observe(el);
    });
}

// Button click animations and effects
function setupButtonEffects() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Blog navigation for index.html
    const blogsBtn = document.getElementById('blogsBtn');
    const readBlogsBtn = document.getElementById('readBlogsBtn');
    const communityBtn = document.getElementById('communityBtn');

    if (blogsBtn) {
        blogsBtn.addEventListener('click', () => {
            const blogsSection = document.getElementById('blogs');
            if (blogsSection) {
                blogsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (readBlogsBtn) {
        readBlogsBtn.addEventListener('click', () => {
            const blogsSection = document.getElementById('blogs');
            if (blogsSection) {
                blogsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (communityBtn) {
        communityBtn.addEventListener('click', () => {
            const communitySection = document.getElementById('community');
            if (communitySection) {
                communitySection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Blog navigation setup
function setupBlogNavigation() {
    // Blog mini card navigation
    document.querySelectorAll('.blog-mini-card').forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Blog preview card navigation
    document.querySelectorAll('.blog-preview').forEach(card => {
        card.addEventListener('click', function() {
            if (window.location.pathname.includes('blogs.html')) {
                const index = Array.from(this.parentNode.children).indexOf(this);
                const blogIds = ['roblox-good', 'roblox-bad', 'parent-guide'];
                const targetElement = document.getElementById(blogIds[index]);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = 'blogs.html';
            }
        });
    });
}

// Role-based features setup
function setupRoleBasedFeatures() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Add Create Blog button for admins and content creators
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'content-creator' || currentUser.role === 'youth-mentor' || currentUser.role === 'owner')) {
        addCreateBlogButton();
    }
}

// Add Create Blog button to navigation for authorized users
function addCreateBlogButton() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.querySelector('a[href="create-blog.html"]')) {
        const createBlogLink = document.createElement('a');
        createBlogLink.href = 'create-blog.html';
        createBlogLink.className = 'nav-link';
        createBlogLink.textContent = 'Create Blog';
        createBlogLink.style.marginLeft = 'auto';
        navMenu.appendChild(createBlogLink);
    }
}

// GAMING SYSTEM FUNCTIONS

// Initialize gaming system
function initializeGamingSystem() {
    initializeGamingData();
    initializePWA();
}

// PWA initialization
function initializePWA() {
    // Check if we're running as PWA
    if (window.gamePulsePWA && window.gamePulsePWA.isRunningAsPWA()) {
        console.log('Running as PWA - enabling enhanced features');
        enablePWAFeatures();
    }
}

function enablePWAFeatures() {
    // Add PWA-specific features here
    // For now, we'll just log it
    console.log('PWA features enabled');
    
    // You could add automatic tracking capabilities here
    // like background sync, push notifications, etc.
}

// Initialize gaming data
function initializeGamingData() {
    if (!localStorage.getItem('userGames')) {
        localStorage.setItem('userGames', JSON.stringify([]));
    }
    if (!localStorage.getItem('gamingActivity')) {
        localStorage.setItem('gamingActivity', JSON.stringify([]));
    }
    if (!localStorage.getItem('gameLibrary')) {
        // Sample game database
        const sampleGames = [
            { id: 1, title: "The Legend of Zelda: Tears of the Kingdom", platform: "Nintendo Switch", genre: "Adventure", cover: "🗡️" },
            { id: 2, title: "Baldur's Gate 3", platform: "PC", genre: "RPG", cover: "🐉" },
            { id: 3, title: "Cyberpunk 2077", platform: "Multiplatform", genre: "RPG", cover: "🔫" },
            { id: 4, title: "Minecraft", platform: "Multiplatform", genre: "Sandbox", cover: "⛏️" },
            { id: 5, title: "Roblox", platform: "Multiplatform", genre: "Social", cover: "🧱" },
            { id: 6, title: "Fortnite", platform: "Multiplatform", genre: "Battle Royale", cover: "💥" },
            { id: 7, title: "Elden Ring", platform: "Multiplatform", genre: "RPG", cover: "👑" },
            { id: 8, title: "Grand Theft Auto V", platform: "Multiplatform", genre: "Action", cover: "🚗" }
        ];
        localStorage.setItem('gameLibrary', JSON.stringify(sampleGames));
    }
}

// Enhanced gaming statistics
function getGamingStats() {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const gamingActivity = JSON.parse(localStorage.getItem('gamingActivity') || '[]');
    
    const totalPlaytime = userGames.reduce((total, game) => total + (game.playtime || 0), 0);
    const completedGames = userGames.filter(game => game.status === 'completed').length;
    const playingGames = userGames.filter(game => game.status === 'playing').length;
    const backlogGames = userGames.filter(game => game.status === 'backlog').length;
    
    // Calculate favorite genre
    const genreCount = {};
    userGames.forEach(game => {
        genreCount[game.genre] = (genreCount[game.genre] || 0) + 1;
    });
    const favoriteGenre = Object.keys(genreCount).reduce((a, b) => 
        genreCount[a] > genreCount[b] ? a : b, 'None'
    );
    
    return {
        totalPlaytime,
        totalGames: userGames.length,
        completedGames,
        playingGames,
        backlogGames,
        favoriteGenre,
        totalSessions: userGames.reduce((total, game) => 
            total + (game.sessions ? game.sessions.length : 0), 0),
        recentActivity: gamingActivity.slice(0, 10)
    };
}

// Add gaming activity
function addGamingActivity(type, message) {
    const gamingActivity = JSON.parse(localStorage.getItem('gamingActivity') || '[]');
    gamingActivity.unshift({
        type: type,
        message: message,
        timestamp: new Date().toISOString()
    });
    // Keep only last 50 activities
    localStorage.setItem('gamingActivity', JSON.stringify(gamingActivity.slice(0, 50)));
}

// Get user's games with filtering and sorting
function getUserGames(filter = 'all', sortBy = 'recent') {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    
    // Filter games
    let filteredGames = userGames;
    if (filter !== 'all') {
        filteredGames = userGames.filter(game => game.status === filter);
    }
    
    // Sort games
    filteredGames.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'playtime':
                return (b.playtime || 0) - (a.playtime || 0);
            case 'recently-played':
                return new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0);
            case 'recent':
            default:
                return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
        }
    });
    
    return filteredGames;
}

// Add game to user's library
function addGameToLibrary(gameData) {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    
    const newGame = {
        id: Date.now(),
        ...gameData,
        status: 'backlog',
        playtime: 0,
        sessions: [],
        addedDate: new Date().toISOString(),
        lastPlayed: null,
        notes: ''
    };
    
    userGames.push(newGame);
    localStorage.setItem('userGames', JSON.stringify(userGames));
    
    // Add activity
    addGamingActivity('game_added', `Added ${gameData.title} to library`);
    
    return newGame;
}

// Update game status
function updateGameStatus(gameId, newStatus) {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const gameIndex = userGames.findIndex(game => game.id === gameId);
    
    if (gameIndex !== -1) {
        userGames[gameIndex].status = newStatus;
        
        if (newStatus === 'completed' && !userGames[gameIndex].completedDate) {
            userGames[gameIndex].completedDate = new Date().toISOString();
        }
        
        localStorage.setItem('userGames', JSON.stringify(userGames));
        
        // Add activity
        addGamingActivity('game_updated', `Updated ${userGames[gameIndex].title} status to ${newStatus}`);
        
        return userGames[gameIndex];
    }
    return null;
}

// Log playtime for a game
function logGamePlaytime(gameId, hours, sessionDate = new Date().toISOString()) {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const gameIndex = userGames.findIndex(game => game.id === gameId);
    
    if (gameIndex !== -1) {
        // Initialize sessions array if it doesn't exist
        if (!userGames[gameIndex].sessions) {
            userGames[gameIndex].sessions = [];
        }
        
        // Add new session
        const newSession = {
            hours: hours,
            date: sessionDate
        };
        
        userGames[gameIndex].sessions.unshift(newSession);
        userGames[gameIndex].playtime = (userGames[gameIndex].playtime || 0) + hours;
        userGames[gameIndex].lastPlayed = new Date().toISOString();
        
        // Auto-update status to "playing" if it was in backlog
        if (userGames[gameIndex].status === 'backlog') {
            userGames[gameIndex].status = 'playing';
        }
        
        localStorage.setItem('userGames', JSON.stringify(userGames));
        
        // Add activity
        addGamingActivity('playtime_logged', `Logged ${hours}h of ${userGames[gameIndex].title}`);
        
        return userGames[gameIndex];
    }
    return null;
}

// Delete game from library
function deleteGameFromLibrary(gameId) {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const gameIndex = userGames.findIndex(game => game.id === gameId);
    
    if (gameIndex !== -1) {
        const gameTitle = userGames[gameIndex].title;
        userGames.splice(gameIndex, 1);
        localStorage.setItem('userGames', JSON.stringify(userGames));
        
        // Add activity
        addGamingActivity('game_removed', `Removed ${gameTitle} from library`);
        
        return true;
    }
    return false;
}

// Get game suggestions from library
function getGameSuggestions(searchTerm = '') {
    const gameLibrary = JSON.parse(localStorage.getItem('gameLibrary') || '[]');
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const userGameIds = userGames.map(game => game.libraryId).filter(id => id);
    
    // Filter out games already in user's library and apply search filter
    return gameLibrary.filter(game => 
        !userGameIds.includes(game.id) &&
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Roll random game from backlog
function getRandomBacklogGame() {
    const userGames = JSON.parse(localStorage.getItem('userGames') || '[]');
    const backlogGames = userGames.filter(game => game.status === 'backlog');
    
    if (backlogGames.length === 0) {
        return null;
    }
    
    return backlogGames[Math.floor(Math.random() * backlogGames.length)];
}

// ==================== SERVER API INTEGRATION ====================

const API_BASE = window.location.origin + '/api';

// Enhanced functions with server fallback
async function syncWithServer() {
    try {
        // Sync local games to server
        const localGames = JSON.parse(localStorage.getItem('userGames') || '[]');
        for (const game of localGames) {
            await fetch(`${API_BASE}/games`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    title: game.title,
                    platform: game.platform,
                    genre: game.genre,
                    cover: game.cover || '🎮'
                })
            });
        }
        console.log('✅ Data synced with server!');
    } catch (error) {
        console.log('🌐 Server unavailable, using local storage');
    }
}

// Enhanced game adding with server support
async function addGameToServer(gameData) {
    try {
        const response = await fetch(`${API_BASE}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1,
                ...gameData
            })
        });
        
        const serverGame = await response.json();
        
        // Keep local storage as backup
        const localGames = JSON.parse(localStorage.getItem('userGames') || '[]');
        localGames.push({ ...serverGame, localId: Date.now() });
        localStorage.setItem('userGames', JSON.stringify(localGames));
        
        return serverGame;
    } catch (error) {
        // Fallback to local storage
        console.log('📴 Server offline, using local storage');
        return addGameToLibrary(gameData);
    }
}

// Enhanced login with server support
async function loginWithServer(email, password) {
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        // Fallback to local authentication
        console.log('📴 Using local authentication');
        return loginUser(email, password);
    }
}

// Server status check
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Initialize server connection
async function initializeServer() {
    const isOnline = await checkServerStatus();
    
    if (isOnline) {
        console.log('🌐 Connected to GamePulse Server');
        await syncWithServer();
        
        // Show server status indicator
        if (!document.getElementById('serverStatus')) {
            const serverStatus = document.createElement('div');
            serverStatus.id = 'serverStatus';
            serverStatus.innerHTML = '🌐 Online';
            serverStatus.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #00ff88;
                color: #0a0a0a;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
            `;
            document.body.appendChild(serverStatus);
        }
    } else {
        console.log('📴 Running in offline mode');
    }
}

// Update your existing login function to use server
function enhancedLogin(email, password) {
    return loginWithServer(email, password);
}

// Update your existing add game function
function enhancedAddGame(gameData) {
    return addGameToServer(gameData);
}

// UTILITY FUNCTIONS

// Utility function to check if user can create blogs
function canCreateBlogs(user) {
    return user && (user.role === 'admin' || user.role === 'content-creator' || user.role === 'youth-mentor' || user.role === 'owner');
}

// Utility function to get role permissions
function getRolePermissions(role) {
    const permissions = {
        'gamer': ['read_blogs', 'join_community', 'comment', 'like_content'],
        'content-creator': ['read_blogs', 'join_community', 'comment', 'like_content', 'create_blogs', 'edit_own_blogs', 'delete_own_blogs'],
        'youth-mentor': ['read_blogs', 'join_community', 'comment', 'like_content', 'create_blogs', 'edit_own_blogs', 'delete_own_blogs', 'moderate_comments', 'host_workshops', 'mentor_users'],
        'admin': ['all', 'manage_users', 'manage_content', 'manage_roles'],
        'owner': ['all', 'assign_roles', 'manage_owners', 'manage_users', 'manage_content', 'system_control']
    };
    return permissions[role] || permissions['gamer'];
}

// Format role for display
function formatRole(role) {
    const roles = {
        'gamer': 'Gamer',
        'content-creator': 'Content Creator',
        'youth-mentor': 'Youth Mentor',
        'admin': 'Admin',
        'owner': 'Owner'
    };
    return roles[role] || role;
}

// BLOG MANAGEMENT FUNCTIONS

function initializeBlogSystem() {
    // Initialize blog posts if they don't exist
    if (!localStorage.getItem('blogPosts')) {
        const sampleBlogs = [
            {
                id: 1,
                title: "The Bright Side: How Roblox Empowers Young Minds",
                category: "education",
                content: "Roblox isn't just a game - it's a creation platform. With Roblox Studio, kids learn 3D modeling, basic coding with Lua scripting, and game design principles...",
                tags: ["education", "creativity", "coding"],
                authorId: "system",
                authorName: "Alex Chen",
                authorRole: "content-creator",
                status: "approved",
                createdAt: new Date('2024-01-15').toISOString(),
                views: 1250,
                likes: 89,
                comments: []
            },
            {
                id: 2,
                title: "Understanding the Concerns: Roblox Safety Guide",
                category: "safety",
                content: "While Roblox has many benefits, parents should be aware of privacy concerns, screen time management, and the importance of parental controls...",
                tags: ["safety", "parenting", "online-safety"],
                authorId: "system",
                authorName: "Maria Gonzalez",
                authorRole: "content-creator",
                status: "approved",
                createdAt: new Date('2024-01-12').toISOString(),
                views: 980,
                likes: 67,
                comments: []
            },
            {
                id: 3,
                title: "The Ultimate Parent's Guide to Roblox",
                category: "parenting",
                content: "The best approach? Play together! Ask your child to teach you their favorite game, discuss the games they play, and set clear rules together...",
                tags: ["parenting", "guide", "family-gaming"],
                authorId: "system",
                authorName: "Dr. Sarah Johnson",
                authorRole: "youth-mentor",
                status: "approved",
                createdAt: new Date('2024-01-10').toISOString(),
                views: 1560,
                likes: 112,
                comments: []
            }
        ];
        localStorage.setItem('blogPosts', JSON.stringify(sampleBlogs));
    }
}

// Create new blog post
function createBlogPost(blogData) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const newPost = {
        id: Date.now(),
        ...blogData,
        status: 'approved', // Auto-approve for admins and owners
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: []
    };
    
    blogPosts.push(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    return newPost;
}

// Get user's blog posts
function getUserBlogPosts(userId) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    return blogPosts.filter(post => post.authorId === userId);
}

// Get all approved blog posts
function getApprovedBlogPosts() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    return blogPosts.filter(post => post.status === 'approved');
}

// Delete blog post
function deleteBlogPost(postId, userId, userRole) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postIndex = blogPosts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        const post = blogPosts[postIndex];
        
        // Check permissions: admins and owners can delete any post, users can only delete their own
        if (userRole === 'admin' || userRole === 'owner' || post.authorId === userId) {
            blogPosts.splice(postIndex, 1);
            localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
            return true;
        }
    }
    return false;
}

// USER MANAGEMENT FUNCTIONS

function initializeUserSystem() {
    if (!localStorage.getItem('users')) {
        const ownerUser = {
            id: 1,
            name: "Website Owner",
            email: "aterrealms@gmail.com",
            password: "minecraftplayer961400",
            role: "owner",
            joinDate: new Date().toISOString(),
            profile: {
                bio: "Website Owner & Founder",
                gamingInterests: ["All Games"],
                avatar: "",
                status: "active"
            },
            permissions: ['all', 'assign_roles', 'manage_owners', 'manage_users', 'manage_content', 'system_control']
        };
        
        localStorage.setItem('users', JSON.stringify([ownerUser]));
    }
}

// Authentication functions
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check owner credentials first
    if (email === 'aterrealms@gmail.com' && password === 'minecraftplayer961400') {
        const ownerUser = users.find(u => u.email === email) || {
            id: 1,
            name: "Website Owner",
            email: email,
            password: password,
            role: "owner",
            joinDate: new Date().toISOString(),
            profile: {
                bio: "Website Owner & Founder",
                gamingInterests: ["All Games"],
                avatar: "",
                status: "active"
            },
            permissions: ['all', 'assign_roles', 'manage_owners', 'manage_users', 'manage_content', 'system_control']
        };
        
        localStorage.setItem('user', JSON.stringify(ownerUser));
        return ownerUser;
    }
    
    // Check regular users
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }
    
    return null;
}

function logoutUser() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function isLoggedIn() {
    return !!localStorage.getItem('user');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBlogSystem();
    initializeUserSystem();
    initializeGamingSystem();
    initWebsite();
});

// Export functions for use in other files and modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Core functions
        initWebsite,
        updateNavigation,
        
        // Gaming system functions
        initializeGamingSystem,
        getGamingStats,
        addGamingActivity,
        getUserGames,
        addGameToLibrary,
        updateGameStatus,
        logGamePlaytime,
        deleteGameFromLibrary,
        getGameSuggestions,
        getRandomBacklogGame,
        
        // Server functions
        initializeServer,
        enhancedLogin,
        enhancedAddGame,
        
        // Blog functions
        canCreateBlogs,
        getRolePermissions,
        formatRole,
        createBlogPost,
        getUserBlogPosts,
        getApprovedBlogPosts,
        deleteBlogPost,
        
        // User functions
        loginUser,
        logoutUser,
        getCurrentUser,
        isLoggedIn
    };
}

// Global GamePulse object for easy access
window.GamePulse = {
    // Core
    init: initWebsite,
    
    // Gaming
    gaming: {
        getStats: getGamingStats,
        addActivity: addGamingActivity,
        getGames: getUserGames,
        addGame: addGameToLibrary,
        updateStatus: updateGameStatus,
        logPlaytime: logGamePlaytime,
        deleteGame: deleteGameFromLibrary,
        getSuggestions: getGameSuggestions,
        randomBacklog: getRandomBacklogGame
    },
    
    // Server
    server: {
        initialize: initializeServer,
        login: enhancedLogin,
        addGame: enhancedAddGame
    },
    
    // Blogs
    blogs: {
        canCreate: canCreateBlogs,
        create: createBlogPost,
        getUserPosts: getUserBlogPosts,
        getApproved: getApprovedBlogPosts,
        delete: deleteBlogPost
    },
    
    // Users
    users: {
        login: loginUser,
        logout: logoutUser,
        current: getCurrentUser,
        isLoggedIn: isLoggedIn,
        getPermissions: getRolePermissions,
        formatRole: formatRole
    }
};