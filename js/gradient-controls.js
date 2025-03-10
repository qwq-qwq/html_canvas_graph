// Файл для управления настройками градиентов в режиме волновых частиц

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы управления
    const toggleControlsBtn = document.getElementById('toggle-controls');
    const controlsPanel = document.getElementById('controls');
    const colorModeSelect = document.getElementById('color-mode');
    const hueSettings = document.getElementById('hue-settings');
    const rainbowSettings = document.getElementById('rainbow-settings');
    const monochromeSettings = document.getElementById('monochrome-settings');
    const customGradientSettings = document.getElementById('custom-gradient-settings');
    const customGradientContainer = document.getElementById('custom-gradient-container');
    const addColorStopBtn = document.getElementById('add-color-stop');
    const applySettingsBtn = document.getElementById('apply-settings');
    
    // Инициализация пользовательского градиента
    let customGradient = [
        { pos: 0, color: '#ff0000' },
        { pos: 0.5, color: '#00ff00' },
        { pos: 1, color: '#0000ff' }
    ];
    
    // Показать/скрыть панель управления
    toggleControlsBtn.addEventListener('click', function() {
        if (controlsPanel.style.display === 'block') {
            controlsPanel.style.display = 'none';
            toggleControlsBtn.textContent = 'Показать настройки';
        } else {
            controlsPanel.style.display = 'block';
            toggleControlsBtn.textContent = 'Скрыть настройки';
            loadCurrentSettings(); // Загружаем текущие настройки
        }
    });
    
    // Переключение между режимами цвета
    colorModeSelect.addEventListener('change', function() {
        updateSettingsVisibility();
    });
    
    // Функция для обновления видимости настроек в зависимости от выбранного режима
    function updateSettingsVisibility() {
        const selectedMode = colorModeSelect.value;
        
        // Скрываем все настройки
        hueSettings.style.display = 'none';
        rainbowSettings.style.display = 'none';
        monochromeSettings.style.display = 'none';
        customGradientSettings.style.display = 'none';
        
        // Показываем только нужные настройки
        switch (selectedMode) {
            case 'hue':
                hueSettings.style.display = 'block';
                break;
            case 'rainbow':
                rainbowSettings.style.display = 'block';
                break;
            case 'monochrome':
                monochromeSettings.style.display = 'block';
                break;
            case 'custom':
                customGradientSettings.style.display = 'block';
                break;
        }
    }
    
    // Добавление нового цвета в градиент
    addColorStopBtn.addEventListener('click', function() {
        addColorStop();
    });
    
    // Функция для добавления нового цвета в градиент
    function addColorStop(pos = 0.5, color = '#ffffff') {
        const colorStopDiv = document.createElement('div');
        colorStopDiv.className = 'color-stop';
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = color;
        
        const posInput = document.createElement('input');
        posInput.type = 'number';
        posInput.min = 0;
        posInput.max = 1;
        posInput.step = 0.01;
        posInput.value = pos;
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Удалить';
        removeBtn.addEventListener('click', function() {
            colorStopDiv.remove();
        });
        
        colorStopDiv.appendChild(colorInput);
        colorStopDiv.appendChild(posInput);
        colorStopDiv.appendChild(removeBtn);
        
        customGradientContainer.appendChild(colorStopDiv);
    }
    
    // Функция для сбора данных о пользовательском градиенте
    function collectCustomGradient() {
        const colorStops = customGradientContainer.querySelectorAll('.color-stop');
        const gradient = [];
        
        colorStops.forEach(stop => {
            const color = stop.querySelector('input[type="color"]').value;
            const pos = parseFloat(stop.querySelector('input[type="number"]').value);
            
            gradient.push({ pos, color });
        });
        
        // Сортируем по позиции
        gradient.sort((a, b) => a.pos - b.pos);
        
        return gradient;
    }
    
    // Функция для загрузки текущих настроек из конфигурации
    function loadCurrentSettings() {
        // Устанавливаем режим цвета
        colorModeSelect.value = waveParticles.colorMode || 'hue';
        
        // Загружаем настройки оттенка
        document.getElementById('base-hue').value = waveParticles.baseHue || 180;
        document.getElementById('hue-range').value = waveParticles.hueRange || 120;
        
        // Загружаем настройки радуги
        document.getElementById('rainbow-frequency').value = waveParticles.rainbowFrequency || 1;
        
        // Загружаем настройки монохромного режима
        document.getElementById('monochrome-color').value = waveParticles.monochromeColor || 240;
        document.getElementById('monochrome-range').value = waveParticles.monochromeRange || 20;
        
        // Загружаем общие настройки
        document.getElementById('saturation').value = waveParticles.saturation || 100;
        document.getElementById('lightness').value = waveParticles.lightness || 50;
        document.getElementById('gradient-speed').value = waveParticles.gradientSpeed || 0.01;
        document.getElementById('color-cycle-speed').value = waveParticles.colorCycleSpeed || 0.005;
        
        // Загружаем пользовательский градиент
        customGradientContainer.innerHTML = '';
        if (waveParticles.customGradient && waveParticles.customGradient.length > 0) {
            waveParticles.customGradient.forEach(stop => {
                addColorStop(stop.pos, stop.color);
            });
        } else {
            // Добавляем стандартные цвета, если градиент не определен
            addColorStop(0, '#ff0000');
            addColorStop(0.5, '#00ff00');
            addColorStop(1, '#0000ff');
        }
        
        // Обновляем видимость настроек
        updateSettingsVisibility();
    }
    
    // Применение настроек
    applySettingsBtn.addEventListener('click', function() {
        // Получаем значения из элементов управления
        const colorMode = colorModeSelect.value;
        const baseHue = parseInt(document.getElementById('base-hue').value);
        const hueRange = parseInt(document.getElementById('hue-range').value);
        const rainbowFrequency = parseFloat(document.getElementById('rainbow-frequency').value);
        const monochromeColor = parseInt(document.getElementById('monochrome-color').value);
        const monochromeRange = parseInt(document.getElementById('monochrome-range').value);
        const saturation = parseInt(document.getElementById('saturation').value);
        const lightness = parseInt(document.getElementById('lightness').value);
        const gradientSpeed = parseFloat(document.getElementById('gradient-speed').value);
        const colorCycleSpeed = parseFloat(document.getElementById('color-cycle-speed').value);
        
        // Собираем пользовательский градиент
        const customGradient = collectCustomGradient();
        
        // Применяем настройки к конфигурации
        waveParticles.colorMode = colorMode;
        waveParticles.baseHue = baseHue;
        waveParticles.hueRange = hueRange;
        waveParticles.rainbowFrequency = rainbowFrequency;
        waveParticles.monochromeColor = monochromeColor;
        waveParticles.monochromeRange = monochromeRange;
        waveParticles.saturation = saturation;
        waveParticles.lightness = lightness;
        waveParticles.gradientSpeed = gradientSpeed;
        waveParticles.colorCycleSpeed = colorCycleSpeed;
        waveParticles.customGradient = customGradient;
        
        // Уведомление пользователя
        alert('Настройки применены!');
    });
    
    // Добавляем обработчик клавиатуры для показа/скрытия панели управления
    window.addEventListener('keydown', function(event) {
        // Клавиша 'g' для показа/скрытия панели управления
        if (event.key === 'g') {
            toggleControlsBtn.click();
        }
        
        // Клавиша 'w' для переключения в режим волновых частиц
        if (event.key === 'w') {
            toggleWaveParticlesMode();
            // Если включен режим волновых частиц, загружаем настройки
            if (waveParticles.enabled) {
                loadCurrentSettings();
            }
        }
    });
    
    // Инициализация при загрузке
    updateSettingsVisibility();
}); 