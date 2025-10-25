// Система аутентификации и пользователей
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('spaceMagnateUsers')) || {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
        this.updateGlobalStats();
    }

    bindEvents() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
    }

    startGame() {
        const usernameInput = document.getElementById('username');
        const username = usernameInput.value.trim();

        if (!username) {
            this.showError('Введите никнейм для начала игры!');
            return;
        }

        if (username.length < 3) {
            this.showError('Никнейм должен быть не менее 3 символов!');
            return;
        }

        if (username.length > 20) {
            this.showError('Никнейм должен быть не более 20 символов!');
            return;
        }

        this.login(username);
    }

    login(username) {
        const userId = this.generateUserId();
        
        if (!this.users[username]) {
            this.users[username] = {
                id: userId,
                username: username,
                joinDate: new Date().toISOString(),
                totalEarned: 0,
                clickPower: 1,
                passiveIncome: 0,
                achievements: [],
                lastPlayed: new Date().toISOString(),
                playTime: 0
            };
        }

        this.currentUser = this.users[username];
        this.currentUser.lastPlayed = new Date().toISOString();
        
        this.saveUsers();
        this.hideAuthModal();
        this.updateUserDisplay();
        this.updateGlobalStats();

        // Инициализируем игру для пользователя
        if (typeof initGame === 'function') {
            initGame();
        }
    }

    logout() {
        if (this.currentUser) {
            this.saveUserProgress();
            this.currentUser = null;
            this.showAuthModal();
            this.updateUserDisplay();
        }
    }

    saveUserProgress() {
        if (this.currentUser && gameState) {
            this.currentUser.totalEarned = gameState.totalEarned;
            this.currentUser.clickPower = gameState.clickPower;
            this.currentUser.passiveIncome = gameState.passiveIncome;
            this.currentUser.lastPlayed = new Date().toISOString();
            this.saveUsers();
        }
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    checkExistingSession() {
        const lastUser = localStorage.getItem('spaceMagnateLastUser');
        if (lastUser && this.users[lastUser]) {
            this.currentUser = this.users[lastUser];
            this.hideAuthModal();
            this.updateUserDisplay();
            
            if (typeof initGame === 'function') {
                setTimeout(() => initGame(), 100);
            }
        } else {
            this.showAuthModal();
        }
    }

    updateUserDisplay() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userRank = document.getElementById('userRank');

        if (this.currentUser) {
            userName.textContent = this.currentUser.username;
            userRank.textContent = this.getUserRank(this.currentUser.totalEarned);
            userInfo.style.display = 'flex';
        } else {
            userInfo.style.display = 'none';
        }
    }

    getUserRank(totalEarned) {
        if (totalEarned >= 1000000) return 'Ранг: Галактический Император';
        if (totalEarned >= 100000) return 'Ранг: Звездный Магнат';
        if (totalEarned >= 10000) return 'Ранг: Космический Барон';
        if (totalEarned >= 1000) return 'Ранг: Планетарный Директор';
        if (totalEarned >= 100) return 'Ранг: Космический Капитан';
        return 'Ранг: Космический Новичок';
    }

    updateGlobalStats() {
        const onlineCount = document.getElementById('onlineCount');
        const totalPlayers = document.getElementById('totalPlayers');
        const topScore = document.getElementById('topScore');

        const userCount = Object.keys(this.users).length;
        const topUser = Object.values(this.users).sort((a, b) => b.totalEarned - a.totalEarned)[0];

        onlineCount.textContent = this.currentUser ? '1' : '0';
        totalPlayers.textContent = userCount;
        topScore.textContent = topUser ? Math.floor(topUser.totalEarned).toLocaleString() : '0';
    }

    showError(message) {
        const input = document.getElementById('username');
        input.style.borderColor = '#ff6b6b';
        input.style.animation = 'shake 0.5s ease-in-out';

        setTimeout(() => {
            input.style.borderColor = '';
            input.style.animation = '';
        }, 500);

        // Временное сообщение об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    saveUsers() {
        localStorage.setItem('spaceMagnateUsers', JSON.stringify(this.users));
        if (this.currentUser) {
            localStorage.setItem('spaceMagnateLastUser', this.currentUser.username);
        }
    }

    showLeaderboard() {
        if (typeof leaderboard !== 'undefined') {
            leaderboard.show();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUserStats(stats) {
        if (this.currentUser) {
            Object.assign(this.currentUser, stats);
            this.saveUsers();
            this.updateUserDisplay();
            this.updateGlobalStats();
        }
    }
}

// Создаем глобальный экземпляр системы аутентификации
const authSystem = new AuthSystem();

// Анимация для ошибки
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);