// Система таблицы лидеров
class Leaderboard {
    constructor() {
        this.currentTab = 'total';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('closeLeaderboard').addEventListener('click', () => this.hide());
        document.getElementById('leaderboardModal').addEventListener('click', (e) => {
            if (e.target.id === 'leaderboardModal') this.hide();
        });

        // Обработчики для вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    show() {
        document.getElementById('leaderboardModal').style.display = 'flex';
        this.updateLeaderboard();
    }

    hide() {
        document.getElementById('leaderboardModal').style.display = 'none';
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Обновляем активные вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const users = authSystem.users;
        const currentUser = authSystem.getCurrentUser();
        const leaderboardList = document.getElementById('leaderboardList');

        let sortedUsers = [];

        switch (this.currentTab) {
            case 'total':
                sortedUsers = Object.values(users).sort((a, b) => b.totalEarned - a.totalEarned);
                break;
            case 'click':
                sortedUsers = Object.values(users).sort((a, b) => b.clickPower - a.clickPower);
                break;
            case 'income':
                sortedUsers = Object.values(users).sort((a, b) => b.passiveIncome - a.passiveIncome);
                break;
        }

        leaderboardList.innerHTML = '';

        if (sortedUsers.length === 0) {
            leaderboardList.innerHTML = `
                <div class="no-players">
                    <div class="no-players-icon">🌌</div>
                    <h3>Пока нет игроков</h3>
                    <p>Будьте первым в рейтинге!</p>
                </div>
            `;
            return;
        }

        sortedUsers.slice(0, 50).forEach((user, index) => {
            const isCurrentUser = currentUser && user.username === currentUser.username;
            const userElement = document.createElement('div');
            userElement.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;

            let value = '';
            switch (this.currentTab) {
                case 'total':
                    value = Math.floor(user.totalEarned).toLocaleString() + ' 🪙';
                    break;
                case 'click':
                    value = user.clickPower + ' 👆';
                    break;
                case 'income':
                    value = Math.floor(user.passiveIncome).toLocaleString() + ' ⚡/сек';
                    break;
            }

            userElement.innerHTML = `
                <div class="leaderboard-rank">
                    <span class="rank-number">${index + 1}</span>
                    ${this.getRankIcon(index + 1)}
                </div>
                <div class="leaderboard-user">
                    <span class="user-avatar">${this.getUserAvatar(user.totalEarned)}</span>
                    <div class="user-info">
                        <span class="username">${user.username}</span>
                        <span class="user-stats">${this.getUserRank(user.totalEarned)}</span>
                    </div>
                </div>
                <div class="leaderboard-value">
                    ${value}
                </div>
            `;

            leaderboardList.appendChild(userElement);
        });
    }

    getRankIcon(rank) {
        if (rank === 1) return '<span class="rank-icon">🥇</span>';
        if (rank === 2) return '<span class="rank-icon">🥈</span>';
        if (rank === 3) return '<span class="rank-icon">🥉</span>';
        return '';
    }

    getUserAvatar(totalEarned) {
        if (totalEarned >= 1000000) return '👑';
        if (totalEarned >= 100000) return '🚀';
        if (totalEarned >= 10000) return '⭐';
        if (totalEarned >= 1000) return '🌍';
        return '👨‍🚀';
    }

    getUserRank(totalEarned) {
        if (totalEarned >= 1000000) return 'Галактический Император';
        if (totalEarned >= 100000) return 'Звездный Магнат';
        if (totalEarned >= 10000) return 'Космический Барон';
        if (totalEarned >= 1000) return 'Планетарный Директор';
        if (totalEarned >= 100) return 'Космический Капитан';
        return 'Космический Новичок';
    }

    updateUserInLeaderboard(userData) {
        if (authSystem.users[userData.username]) {
            Object.assign(authSystem.users[userData.username], userData);
            authSystem.saveUsers();
            this.updateLeaderboard();
        }
    }
}

// Создаем глобальный экземпляр таблицы лидеров
const leaderboard = new Leaderboard();