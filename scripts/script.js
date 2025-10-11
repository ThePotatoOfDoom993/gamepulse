// scripts/script.js - COMPLETE UPDATED VERSION WITH POSTGRESQL API

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
    
    console.log('🚀 GamePulse website loaded successfully!');
}

// ==================== DATABASE API FUNCTIONS ====================

const API_BASE = '';

// User functions
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }
        
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Game functions
async function getUserGames(userId) {
    try {
        const response = await fetch(`/api/games?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch games');
        return await response.json();
    } catch (error) {
        console.error('Get games error:', error);
        return [];
    }
}

async function addGameToLibrary(gameData) {
    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add game');
        }
        return await response.json();
    } catch (error) {
        console.error('Add game error:', error);
        throw error;
    }
}

async function updateGameStatus(gameId, status) {
    try {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update game');
        }
        return await response.json();
    } catch (error) {
        console.error('Update game error:', error);
        throw error;
    }
}

async function logGamePlaytime(gameId, hours, userId) {
    try {
        const response = await fetch(`/api/games/${gameId}/playtime`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours, user_id: userId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to log playtime');
        }
        return await response.json();
    } catch (error) {
        console.error('Log playtime error:', error);
        throw error;
    }
}

async function deleteGameFromLibrary(gameId) {
    try {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete game');
        }
        return await response.json();
    } catch (error) {
        console.error('Delete game error:', error);
        throw error;
    }
}

// Blog functions
async function getBlogPosts() {
    try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return await response.json();
    } catch (error) {
        console.error('Get blogs error:', error);
        return [];
    }
}

async function createBlogPost(blogData) {
    try {
        const response = await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create blog');
        }
        return await response.json();
    } catch (error) {
        console.error('Create blog error:', error);
        throw error;
    }
}

// Stats functions
async function getUserStats(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Get stats error:', error);
        return {};
    }
}

async function getUserActivity(userId) {
    try {
        const response = await fetch(`/api/activity/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch activity');
        return await response.json();
    } catch (error) {
        console.error('Get activity error:', error);
        return [];
    }
}

// Enhanced gaming statistics
async function getGamingStats(userId) {
    try {
        const stats = await getUserStats(userId);
        const games = await getUserGames(userId);
        
        // Calculate favorite genre
        const genreCount = {};
        games.forEach(game => {
            if (game.genre) {
                genreCount[game.genre] = (genreCount[game.genre] || 0) + 1;
            }
        });
        
        const favoriteGenre = Object.keys(genreCount).reduce((a, b) => 
            genreCount[a] > genreCount[b] ? a : b, 'None'
        );
        
        return {
            totalPlaytime: stats.totalPlaytime || 0,
            totalGames: stats.totalGames || 0,
            completedGames: stats.completedGames || 0,
            playingGames: games.filter(game => game.status === 'playing').length,
            backlogGames: games.filter(game => game.status === 'backlog').length,
            favoriteGenre: favoriteGenre,
            totalSessions: stats.totalSessions || 0
        };
    } catch (error) {
        console.error('Get gaming stats error:', error);
        return {
            totalPlaytime: 0,
            totalGames: 0,
            completedGames: 0,
            playingGames: 0,
            backlogGames: 0,
            favoriteGenre: 'None',
            totalSessions: 0
        };
    }
}

// ==================== EXISTING WEBSITE FUNCTIONS ====================

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

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('user');
}

// Logout user
function logoutUser() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification system - you can enhance this
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (typeof alert !== 'undefined') {
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initWebsite();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Core functions
        initWebsite,
        updateNavigation,
        
        // Database API functions
        loginUser,
        registerUser,
        getUserGames,
        addGameToLibrary,
        updateGameStatus,
        logGamePlaytime,
        deleteGameFromLibrary,
        getBlogPosts,
        createBlogPost,
        getUserStats,
        getGamingStats,
        getUserActivity,
        
        // Utility functions
        canCreateBlogs,
        getRolePermissions,
        formatRole,
        getCurrentUser,
        isLoggedIn,
        logoutUser,
        showNotification
    };
}

// Global GamePulse object for easy access
window.GamePulse = {
    // Core
    init: initWebsite,
    
    // Database API
    api: {
        login: loginUser,
        register: registerUser,
        getGames: getUserGames,
        addGame: addGameToLibrary,
        updateGame: updateGameStatus,
        logPlaytime: logGamePlaytime,
        deleteGame: deleteGameFromLibrary,
        getBlogs: getBlogPosts,
        createBlog: createBlogPost,
        getStats: getUserStats,
        getGamingStats: getGamingStats,
        getActivity: getUserActivity
    },
    
    // Users
    users: {
        current: getCurrentUser,
        isLoggedIn: isLoggedIn,
        logout: logoutUser,
        getPermissions: getRolePermissions,
        formatRole: formatRole,
        canCreateBlogs: canCreateBlogs
    },
    
    // UI
    ui: {
        showNotification: showNotification
    }
};
