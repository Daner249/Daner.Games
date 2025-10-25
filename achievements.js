// Система достижений
const achievements = {
    milestones: [
        {
            id: 'first_credit',
            name: 'Первый шаг',
            description: 'Заработать первый кредит',
            icon: '🪙',
            condition: (game) => game.totalEarned >= 1,
            unlocked: false
        },
        {
            id: 'hundred_credits',
            name: 'Начинающий магнат',
            description: 'Заработать 100 кредитов',
            icon: '💯',
            condition: (game) => game.totalEarned >= 100,
            unlocked: false
        },
        {
            id: 'thousand_credits',
            name: 'Опытный предприниматель',
            description: 'Заработать 1,000 кредитов',
            icon: '💰',
            condition: (game) => game.totalEarned >= 1000,
            unlocked: false
        },
        {
            id: 'million_credits',
            name: 'Космический магнат',
            description: 'Заработать 1,000,000 кредитов',
            icon: '👑',
            condition: (game) => game.totalEarned >= 1000000,
            unlocked: false
        },
        {
            id: 'first_upgrade',
            name: 'Технологический прорыв',
            description: 'Купить первое улучшение',
            icon: '🛠️',
            condition: (game) => game.upgrades.some(u => u.owned > 0),
            unlocked: false
        },
        {
            id: 'ten_upgrades',
            name: 'Индустриализация',
            description: 'Иметь 10 улучшений в сумме',
            icon: '🏭',
            condition: (game) => game.upgrades.reduce((sum, u) => sum + u.owned, 0) >= 10,
            unlocked: false
        },
        {
            id: 'first_planet',
            name: 'Колонизатор',
            description: 'Колонизировать первую планету',
            icon: '🌍',
            condition: (game) => game.planets.some(p => p.owned),
            unlocked: false
        },
        {
            id: 'all_planets',
            name: 'Межгалактическая империя',
            description: 'Колонизировать все планеты',
            icon: '🌌',
            condition: (game) => game.planets.every(p => p.owned),
            unlocked: false
        },
        {
            id: 'click_power_10',
            name: 'Сила клика',
            description: 'Увеличить силу клика до 10',
            icon: '💪',
            condition: (game) => game.clickPower >= 10,
            unlocked: false
        },
        {
            id: 'click_power_100',
            name: 'Неудержимый',
            description: 'Увеличить силу клика до 100',
            icon: '⚡',
            condition: (game) => game.clickPower >= 100,
            unlocked: false
        },
        {
            id: 'passive_1000',
            name: 'Автоматизация',
            description: 'Достичь дохода 1,000 в секунду',
            icon: '🤖',
            condition: (game) => game.passiveIncome >= 1000,
            unlocked: false
        },
        {
            id: 'first_mega',
            name: 'Квантовый скачок',
            description: 'Приобрести первое мега-улучшение',
            icon: '🚀',
            condition: (game) => game.megaUpgrades.some(m => m.owned),
            unlocked: false
        }
    ],

    // Проверка всех достижений
    checkAll: function(gameState) {
        let newUnlocks = 0;
        
        this.milestones.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition(gameState)) {
                achievement.unlocked = true;
                newUnlocks++;
                this.showNotification(achievement);
            }
        });
        
        if (newUnlocks > 0) {
            this.updateDisplay();
        }
        
        return newUnlocks;
    },

    // Показ уведомления о достижении
    showNotification: function(achievement) {
        const eventPanel = document.getElementById('eventMessage');
        if (eventPanel) {
            eventPanel.innerHTML = `
                <div style="color: #ffd700; font-size: 1.1em;">
                    🎉 Достижение разблокировано: <strong>${achievement.name}</strong> 🎉
                </div>
                <div style="font-size: 0.9em; margin-top: 0.5em;">${achievement.description}</div>
            `;
            eventPanel.classList.add('pulse');
            
            // Убираем анимацию через 3 секунды
            setTimeout(() => {
                eventPanel.classList.remove('pulse');
            }, 3000);
        }
    },

    // Обновление отображения достижений
    updateDisplay: function() {
        const container = document.getElementById('achievementsList');
        const countElement = document.getElementById('achievementsCount');
        
        if (!container) return;
        
        const unlockedCount = this.milestones.filter(a => a.unlocked).length;
        const totalCount = this.milestones.length;
        
        if (countElement) {
            countElement.textContent = `${unlockedCount}/${totalCount}`;
        }
        
        container.innerHTML = '';
        
        this.milestones.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            
            // Прогресс для числовых достижений
            let progress = 0;
            if (achievement.condition.toString().includes('totalEarned')) {
                const target = achievement.condition.toString().match(/>= (\d+)/);
                if (target) progress = Math.min(100, (gameState.totalEarned / parseInt(target[1])) * 100);
            } else if (achievement.condition.toString().includes('clickPower')) {
                const target = achievement.condition.toString().match(/>= (\d+)/);
                if (target) progress = Math.min(100, (gameState.clickPower / parseInt(target[1])) * 100);
            } else if (achievement.condition.toString().includes('passiveIncome')) {
                const target = achievement.condition.toString().match(/>= (\d+)/);
                if (target) progress = Math.min(100, (gameState.passiveIncome / parseInt(target[1])) * 100);
            }
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${!achievement.unlocked ? `
                        <div class="achievement-progress">
                            <div class="achievement-progress-bar" style="width: ${progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(achievementElement);
        });
    },

    // Загрузка достижений из сохранения
    load: function(savedAchievements) {
        if (savedAchievements) {
            savedAchievements.forEach(savedAchievement => {
                const achievement = this.milestones.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                }
            });
        }
    },

    // Получение данных для сохранения
    getSaveData: function() {
        return this.milestones.map(a => ({
            id: a.id,
            unlocked: a.unlocked
        }));
    }
};