// Расширенное состояние игры
let gameState = {
    credits: 0,
    totalEarned: 0,
    passiveIncome: 0,
    clickPower: 1,
    clickPowerCost: 10,
    lastEventTime: Date.now(),
    eventCooldown: 30000, // 30 секунд между событиями

    upgrades: [
        {
            id: 1,
            name: "Спутник",
            description: "Автоматически собирает кредиты с орбиты",
            baseCost: 15,
            cost: 15,
            income: 2,
            owned: 0,
            image: "images/satellite.png"
        },
        {
            id: 2,
            name: "Лунная База",
            description: "Добыча редких ресурсов на Луне",
            baseCost: 100,
            cost: 100,
            income: 10,
            owned: 0,
            image: "images/moon-base.png"
        },
        {
            id: 3,
            name: "Космическая Станция",
            description: "Научно-исследовательский центр в космосе",
            baseCost: 500,
            cost: 500,
            income: 50,
            owned: 0,
            image: "images/space-station.png"
        },
        {
            id: 4,
            name: "Межзвездный Флот",
            description: "Торговые корабли между системами",
            baseCost: 3000,
            cost: 3000,
            income: 200,
            owned: 0,
            image: "images/fleet.png"
        },
        {
            id: 5,
            name: "Квантовый Компьютер",
            description: "Оптимизация всех космических операций",
            baseCost: 20000,
            cost: 20000,
            income: 1000,
            owned: 0,
            image: "images/quantum-computer.png"
        },
        {
            id: 6,
            name: "Машина Времени",
            description: "Использует временные аномалии для прибыли",
            baseCost: 100000,
            cost: 100000,
            income: 5000,
            owned: 0,
            image: "images/time-machine.png"
        }
    ],

    planets: [
        {
            id: 1,
            name: "Марс",
            description: "Колонизация Красной Планеты",
            baseCost: 1000,
            cost: 1000,
            multiplier: 1.5,
            owned: false,
            image: "images/mars.png"
        },
        {
            id: 2,
            name: "Юпитер",
            description: "Добыча гелия-3 из атмосферы",
            baseCost: 5000,
            cost: 5000,
            multiplier: 2.0,
            owned: false,
            image: "images/jupiter.png"
        },
        {
            id: 3,
            name: "Альфа Центавра",
            description: "Первая межзвездная колония",
            baseCost: 25000,
            cost: 25000,
            multiplier: 3.0,
            owned: false,
            image: "images/alpha-centauri.png"
        },
        {
            id: 4,
            name: "Черная Дыра",
            description: "Использование гравитационной энергии",
            baseCost: 100000,
            cost: 100000,
            multiplier: 5.0,
            owned: false,
            image: "images/black-hole.png"
        }
    ],

    megaUpgrades: [
        {
            id: 1,
            name: "Сфера Дайсона",
            description: "Полное использование энергии звезды",
            baseCost: 500000,
            cost: 500000,
            effect: "Удваивает доход от всех улучшений",
            owned: false,
            image: "images/dyson-sphere.png"
        },
        {
            id: 2,
            name: "Варп-Двигатель",
            description: "Мгновенные перемещения между галактиками",
            baseCost: 2000000,
            cost: 2000000,
            effect: "Увеличивает множитель планет в 2 раза",
            owned: false,
            image: "images/fleet.png"
        }
    ]
};

// Космические события
const spaceEvents = [
    {
        name: "Метеоритный дождь",
        message: "💫 Метеоритный дождь принес редкие минералы! Доход +10% на 30 секунд!",
        effect: (game) => { game.temporaryMultiplier = 1.1; setTimeout(() => { game.temporaryMultiplier = 1; }, 30000); }
    },
    {
        name: "Солнечная вспышка",
        message: "☀️ Солнечная вспышка увеличила эффективность солнечных панелей! Доход +25% на 20 секунд!",
        effect: (game) => { game.temporaryMultiplier = 1.25; setTimeout(() => { game.temporaryMultiplier = 1; }, 20000); }
    },
    {
        name: "Встреча с инопланетянами",
        message: "👽 Инопланетные торговцы предложили выгодную сделку! +500 кредитов!",
        effect: (game) => { game.credits += 500; game.totalEarned += 500; }
    },
    {
        name: "Космическая аномалия",
        message: "🌀 Космическая аномалия временно увеличила силу клика!",
        effect: (game) => { 
            const originalPower = game.clickPower;
            game.clickPower *= 2; 
            setTimeout(() => { game.clickPower = originalPower; }, 15000);
        }
    }
];

// Получаем элементы DOM
const creditsElement = document.getElementById('credits');
const passiveIncomeElement = document.getElementById('passiveIncome');
const totalEarnedElement = document.getElementById('totalEarned');
const clickPowerElement = document.getElementById('clickPower');
const clickPowerCostElement = document.getElementById('clickPowerCost');
const planetButton = document.getElementById('planet');
const planetImage = document.getElementById('planetImage');
const upgradesContainer = document.getElementById('upgradesContainer');
const planetsContainer = document.getElementById('planetsContainer');
const megaUpgradesContainer = document.getElementById('megaUpgradesContainer');
const clickPowerBtn = document.getElementById('clickPowerBtn');
const resetBtn = document.getElementById('resetBtn');

// Временный множитель для событий
gameState.temporaryMultiplier = 1;

// Обновляем состояние игры при изменении
function updateGameState() {
    calculatePassiveIncome();
    updateDisplay();
    
    // Сохраняем прогресс пользователя
    if (authSystem && authSystem.getCurrentUser()) {
        authSystem.updateUserStats({
            totalEarned: gameState.totalEarned,
            clickPower: gameState.clickPower,
            passiveIncome: gameState.passiveIncome
        });
        
        // Обновляем таблицу лидеров
        if (typeof leaderboard !== 'undefined') {
            leaderboard.updateLeaderboard();
        }
    }
}

// Функция для обновления отображения
function updateDisplay() {
    creditsElement.textContent = Math.floor(gameState.credits).toLocaleString();
    passiveIncomeElement.textContent = Math.floor(gameState.passiveIncome).toLocaleString();
    totalEarnedElement.textContent = Math.floor(gameState.totalEarned).toLocaleString();
    clickPowerElement.textContent = gameState.clickPower;
    clickPowerCostElement.textContent = gameState.clickPowerCost;
}

// Функция для расчета пассивного дохода
function calculatePassiveIncome() {
    let baseIncome = gameState.upgrades.reduce((total, upgrade) => {
        return total + (upgrade.owned * upgrade.income);
    }, 0);

    // Применяем множители от планет
    let multiplier = 1;
    gameState.planets.forEach(planet => {
        if (planet.owned) {
            multiplier *= planet.multiplier;
        }
    });

    // Применяем эффекты мега-улучшений
    if (gameState.megaUpgrades[0].owned) { // Сфера Дайсона
        baseIncome *= 2;
    }
    if (gameState.megaUpgrades[1].owned) { // Варп-Двигатель
        multiplier *= 2;
    }

    // Временный множитель от событий
    multiplier *= gameState.temporaryMultiplier;

    gameState.passiveIncome = Math.floor(baseIncome * multiplier);
    return gameState.passiveIncome;
}

// Покупка улучшения
function buyUpgrade(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    
    if (gameState.credits >= upgrade.cost) {
        gameState.credits -= upgrade.cost;
        upgrade.owned += 1;
        upgrade.cost = Math.floor(upgrade.cost * 1.15);
        
        updateGameState();
        renderUpgrades();
        achievements.checkAll(gameState);
    }
}

// Покупка планеты
function buyPlanet(planetId) {
    const planet = gameState.planets.find(p => p.id === planetId);
    
    if (!planet.owned && gameState.credits >= planet.cost) {
        gameState.credits -= planet.cost;
        planet.owned = true;
        // Меняем изображение основной планеты
        if (planetId === 1) planetImage.src = planet.image;
        
        updateGameState();
        renderPlanets();
        achievements.checkAll(gameState);
    }
}

// Покупка мега-улучшения
function buyMegaUpgrade(megaUpgradeId) {
    const megaUpgrade = gameState.megaUpgrades.find(m => m.id === megaUpgradeId);
    
    if (!megaUpgrade.owned && gameState.credits >= megaUpgrade.cost) {
        gameState.credits -= megaUpgrade.cost;
        megaUpgrade.owned = true;
        
        updateGameState();
        renderMegaUpgrades();
        achievements.checkAll(gameState);
    }
}

// Усиление клика
function buyClickPower() {
    if (gameState.credits >= gameState.clickPowerCost) {
        gameState.credits -= gameState.clickPowerCost;
        gameState.clickPower += 1;
        gameState.clickPowerCost = Math.floor(gameState.clickPowerCost * 1.5);
        
        updateGameState();
        achievements.checkAll(gameState);
    }
}

// Отрисовка улучшений
function renderUpgrades() {
    upgradesContainer.innerHTML = '';
    
    gameState.upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-item';
        
        upgradeElement.innerHTML = `
            <img src="${upgrade.image}" alt="${upgrade.name}" onerror="this.style.display='none'">
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name} (${upgrade.owned})</div>
                <div class="upgrade-desc">${upgrade.description}</div>
                <div class="upgrade-stats">Доход: ${upgrade.income}/сек</div>
            </div>
            <button onclick="buyUpgrade(${upgrade.id})" ${gameState.credits < upgrade.cost ? 'disabled' : ''}>
                ${Math.floor(upgrade.cost)} 🪙
            </button>
        `;
        
        upgradesContainer.appendChild(upgradeElement);
    });
}

// Отрисовка планет
function renderPlanets() {
    planetsContainer.innerHTML = '';
    
    gameState.planets.forEach(planet => {
        const planetElement = document.createElement('div');
        planetElement.className = 'planet-item';
        
        if (planet.owned) {
            planetElement.innerHTML = `
                <img src="${planet.image}" alt="${planet.name}" onerror="this.style.display='none'">
                <div class="planet-info">
                    <div class="planet-name">${planet.name} ✅</div>
                    <div class="planet-desc">${planet.description}</div>
                    <div class="planet-stats">Множитель: ×${planet.multiplier}</div>
                </div>
                <button disabled>
                    Колонизирована!
                </button>
            `;
        } else {
            planetElement.innerHTML = `
                <img src="${planet.image}" alt="${planet.name}" onerror="this.style.display='none'">
                <div class="planet-info">
                    <div class="planet-name">${planet.name}</div>
                    <div class="planet-desc">${planet.description}</div>
                    <div class="planet-stats">Множитель: ×${planet.multiplier}</div>
                </div>
                <button onclick="buyPlanet(${planet.id})" ${gameState.credits < planet.cost ? 'disabled' : ''}>
                    ${planet.cost} 🪙
                </button>
            `;
        }
        
        planetsContainer.appendChild(planetElement);
    });
}

// Отрисовка мега-улучшений
function renderMegaUpgrades() {
    megaUpgradesContainer.innerHTML = '';
    
    gameState.megaUpgrades.forEach(megaUpgrade => {
        const megaElement = document.createElement('div');
        megaElement.className = 'mega-upgrade-item';
        
        if (megaUpgrade.owned) {
            megaElement.innerHTML = `
                <img src="${megaUpgrade.image}" alt="${megaUpgrade.name}" onerror="this.style.display='none'">
                <div class="mega-upgrade-info">
                    <div class="mega-upgrade-name">${megaUpgrade.name} ✅</div>
                    <div class="mega-upgrade-desc">${megaUpgrade.description}</div>
                    <div class="mega-upgrade-stats">Эффект: ${megaUpgrade.effect}</div>
                </div>
                <button disabled>
                    Приобретено!
                </button>
            `;
        } else {
            megaElement.innerHTML = `
                <img src="${megaUpgrade.image}" alt="${megaUpgrade.name}" onerror="this.style.display='none'">
                <div class="mega-upgrade-info">
                    <div class="mega-upgrade-name">${megaUpgrade.name}</div>
                    <div class="mega-upgrade-desc">${megaUpgrade.description}</div>
                    <div class="mega-upgrade-stats">Эффект: ${megaUpgrade.effect}</div>
                </div>
                <button onclick="buyMegaUpgrade(${megaUpgrade.id})" ${gameState.credits < megaUpgrade.cost ? 'disabled' : ''}>
                    ${megaUpgrade.cost} 🪙
                </button>
            `;
        }
        
        megaUpgradesContainer.appendChild(megaElement);
    });
}

// Обработчик клика по планете
planetButton.addEventListener('click', () => {
    const earnings = gameState.clickPower;
    gameState.credits += earnings;
    gameState.totalEarned += earnings;
    updateGameState();
    
    // Анимация клика
    planetImage.classList.add('pulse');
    setTimeout(() => planetImage.classList.remove('pulse'), 300);
    
    achievements.checkAll(gameState);
});

// Обработчик для кнопки усиления клика
clickPowerBtn.addEventListener('click', buyClickPower);

// Обработчик для кнопки сброса
resetBtn.addEventListener('click', resetGame);

// Случайные космические события
function triggerRandomEvent() {
    const now = Date.now();
    if (now - gameState.lastEventTime > gameState.eventCooldown) {
        const event = spaceEvents[Math.floor(Math.random() * spaceEvents.length)];
        const eventPanel = document.getElementById('eventMessage');
        
        if (eventPanel) {
            eventPanel.innerHTML = event.message;
            eventPanel.classList.add('bounce');
            
            // Применяем эффект события
            event.effect(gameState);
            updateGameState();
            
            // Убираем анимацию
            setTimeout(() => {
                eventPanel.classList.remove('bounce');
            }, 3000);
            
            gameState.lastEventTime = now;
        }
    }
}

// Игровой цикл
setInterval(() => {
    // Пассивный доход
    const income = gameState.passiveIncome / 10; // Начисляем каждые 0.1 секунды
    gameState.credits += income;
    gameState.totalEarned += income;
    updateGameState();
    
    // Случайные события (шанс 1% каждую секунду)
    if (Math.random() < 0.01) {
        triggerRandomEvent();
    }
    
    // Проверка достижений
    achievements.checkAll(gameState);
}, 100);

// Сброс игры
function resetGame() {
    if (confirm('Вы уверены, что хотите начать заново? Все ваши прогресс будет потерян!')) {
        // Сбрасываем состояние игры
        gameState.credits = 0;
        gameState.totalEarned = 0;
        gameState.passiveIncome = 0;
        gameState.clickPower = 1;
        gameState.clickPowerCost = 10;
        gameState.temporaryMultiplier = 1;
        
        // Сбрасываем улучшения
        gameState.upgrades.forEach(upgrade => {
            upgrade.owned = 0;
            upgrade.cost = upgrade.baseCost;
        });
        
        // Сбрасываем планеты
        gameState.planets.forEach(planet => {
            planet.owned = false;
        });
        
        // Сбрасываем мега-улучшения
        gameState.megaUpgrades.forEach(megaUpgrade => {
            megaUpgrade.owned = false;
        });
        
        // Восстанавливаем изображение Земли
        planetImage.src = 'images/earth.png';
        
        // Обновляем отображение
        updateGameState();
        renderUpgrades();
        renderPlanets();
        renderMegaUpgrades();
        
        // Сохраняем сброшенное состояние
        saveGame();
    }
}

// Инициализация игры
function initGame() {
    updateDisplay();
    renderUpgrades();
    renderPlanets();
    renderMegaUpgrades();
    
    // Загружаем сохранение
    const savedGame = localStorage.getItem('spaceMagnateSave');
    if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        
        // Восстанавливаем основные параметры
        gameState.credits = loadedState.credits || 0;
        gameState.totalEarned = loadedState.totalEarned || 0;
        gameState.clickPower = loadedState.clickPower || 1;
        gameState.clickPowerCost = loadedState.clickPowerCost || 10;
        
        // Восстанавливаем улучшения
        if (loadedState.upgrades) {
            loadedState.upgrades.forEach(loadedUpgrade => {
                const upgrade = gameState.upgrades.find(u => u.id === loadedUpgrade.id);
                if (upgrade) {
                    upgrade.owned = loadedUpgrade.owned || 0;
                    upgrade.cost = loadedUpgrade.cost || upgrade.baseCost;
                }
            });
        }
        
        // Восстанавливаем планеты
        if (loadedState.planets) {
            loadedState.planets.forEach(loadedPlanet => {
                const planet = gameState.planets.find(p => p.id === loadedPlanet.id);
                if (planet) {
                    planet.owned = loadedPlanet.owned || false;
                    // Обновляем изображение если Марс колонизирован
                    if (planet.id === 1 && planet.owned) {
                        planetImage.src = planet.image;
                    }
                }
            });
        }
        
        // Восстанавливаем мега-улучшения
        if (loadedState.megaUpgrades) {
            loadedState.megaUpgrades.forEach(loadedMega => {
                const megaUpgrade = gameState.megaUpgrades.find(m => m.id === loadedMega.id);
                if (megaUpgrade) {
                    megaUpgrade.owned = loadedMega.owned || false;
                }
            });
        }
        
        // Восстанавливаем достижения
        if (loadedState.achievements) {
            achievements.load(loadedState.achievements);
        }
        
        calculatePassiveIncome();
        updateGameState();
        renderUpgrades();
        renderPlanets();
        renderMegaUpgrades();
        achievements.updateDisplay();
    }
    
    // Запускаем проверку достижений
    achievements.checkAll(gameState);
}

// Функция для сохранения игры
function saveGame() {
    const saveData = {
        credits: gameState.credits,
        totalEarned: gameState.totalEarned,
        clickPower: gameState.clickPower,
        clickPowerCost: gameState.clickPowerCost,
        upgrades: gameState.upgrades.map(u => ({
            id: u.id,
            owned: u.owned,
            cost: u.cost
        })),
        planets: gameState.planets.map(p => ({
            id: p.id,
            owned: p.owned
        })),
        megaUpgrades: gameState.megaUpgrades.map(m => ({
            id: m.id,
            owned: m.owned
        })),
        achievements: achievements.getSaveData()
    };
    
    localStorage.setItem('spaceMagnateSave', JSON.stringify(saveData));
}

// Автосохранение каждые 10 секунд
setInterval(saveGame, 10000);

// Инициализируем игру когда страница загрузится
window.addEventListener('load', initGame);

// Сохраняем игру при закрытии страницы
window.addEventListener('beforeunload', saveGame);