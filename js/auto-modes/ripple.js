// Обновление волнового эффекта - новая улучшенная версия
function updateRippleEffect() {
    const now = Date.now()

    // Если центр не определен, устанавливаем его по центру экрана
    if (ripple.centerX === 0) {
        ripple.centerX = canvas.width / 2
        ripple.centerY = canvas.height / 2
    }

    // Сохраняем исходные значения
    const originalWidth = paletteWidth
    const originalOpacity = paletteOpacity
    const originalRotation = paletteRotation
    const originalGradientMode = gradientMode
    const originalHue = hue

    // Автоматически создаем новые волны через интервалы
    if (now - ripple.lastWaveTime > ripple.waveInterval) {
        // Создаем новую волну с более интересными характеристиками
        ripple.waves.push({
            radius: 0,
            growth: 0.5 + Math.random() * 1.5, // Более медленный рост для плавности
            amplitude: 5 + Math.random() * 15,  // Амплитуда волнистости
            frequency: 3 + Math.random() * 6,   // Более низкая частота для плавности
            phase: Math.random() * Math.PI * 2, // Фазовый сдвиг
            thickness: 0.5 + Math.random() * 1.0, // Относительная толщина волны
            color: Math.floor(Math.random() * 360), // Базовый цвет
            saturation: 70 + Math.random() * 30,   // Насыщенность цвета (%)
            brightness: 60 + Math.random() * 40,   // Яркость цвета (%)
            rotationSpeed: (Math.random() - 0.5) * 0.01, // Скорость вращения волны
            rotationOffset: Math.random() * Math.PI * 2, // Начальное смещение вращения
            pulseFrequency: 0.5 + Math.random() * 2,     // Частота пульсации
            birthTime: now                               // Время создания для эффектов на основе возраста
        })

        ripple.lastWaveTime = now

        // Случайно меняем интервал между волнами
        ripple.waveInterval = 300 + Math.random() * 700 // Более длинные интервалы для меньшей загруженности
    }

    // Ограничиваем количество активных волн
    if (ripple.waves.length > ripple.maxWaves) {
        ripple.waves.shift() // Удаляем самую старую волну
    }

    // Если нет волн, создаем первую
    if (ripple.waves.length === 0) {
        ripple.waves.push({
            radius: 0,
            growth: 1.2,
            amplitude: 10,
            frequency: 4,
            phase: 0,
            thickness: 0.8,
            color: Math.floor(Math.random() * 360),
            saturation: 80,
            brightness: 70,
            rotationSpeed: 0.005,
            rotationOffset: 0,
            pulseFrequency: 1.0,
            birthTime: now
        });
        ripple.lastWaveTime = now;
    }

    // Создаем эффект смещения центра для более органичного движения
    const centerOffsetX = Math.sin(now * 0.0003) * 50;
    const centerOffsetY = Math.cos(now * 0.0004) * 50;
    const dynamicCenterX = ripple.centerX + centerOffsetX;
    const dynamicCenterY = ripple.centerY + centerOffsetY;

    // Обрабатываем каждую волну
    for (let i = 0; i < ripple.waves.length; i++) {
        const wave = ripple.waves[i]

        // Проверяем и корректируем значения волны для предотвращения ошибок
        if (isNaN(wave.radius) || !isFinite(wave.radius)) wave.radius = 0;
        if (isNaN(wave.growth) || !isFinite(wave.growth)) wave.growth = 1;
        if (isNaN(wave.amplitude) || !isFinite(wave.amplitude)) wave.amplitude = 10;
        if (isNaN(wave.frequency) || !isFinite(wave.frequency)) wave.frequency = 4;
        if (isNaN(wave.thickness) || !isFinite(wave.thickness)) wave.thickness = 0.8;
        
        // Ограничиваем толщину волны безопасным диапазоном
        wave.thickness = Math.max(0.1, Math.min(2.0, wave.thickness));

        // Вычисляем возраст волны для эффектов затухания
        const waveAge = (now - wave.birthTime) / 1000; // в секундах
        
        // Увеличиваем радиус с пульсацией для более органичного эффекта
        const pulseFactor = 1 + Math.sin(waveAge * wave.pulseFrequency) * 0.1;
        wave.radius += wave.growth * pulseFactor;

        // Определяем количество точек в зависимости от радиуса, но с ограничением
        const basePoints = Math.max(12, Math.min(48, Math.floor(wave.radius / 8)));
        // Добавляем вариацию количества точек в зависимости от времени для более органичного эффекта
        const numPoints = basePoints + Math.floor(Math.sin(now * 0.001) * 4);
        const angleStep = (Math.PI * 2) / numPoints;

        // Определяем прозрачность волны в зависимости от её размера и возраста
        const maxRadius = Math.max(canvas.width, canvas.height) * 0.6;
        let opacity = ripple.baseOpacity || 0.8; // Используем базовую прозрачность из конфигурации
        
        // Плавное появление с минимальным уровнем прозрачности
        if (waveAge < 0.5) {
            // Начинаем с минимальной прозрачности и плавно увеличиваем до базовой
            const minOpacity = ripple.minOpacity || 0.2;
            const opacityRange = opacity - minOpacity;
            opacity = minOpacity + (waveAge * 2) * opacityRange;
        }
        
        // Плавное исчезновение при приближении к максимальному радиусу
        // с сохранением минимального уровня прозрачности
        if (wave.radius > maxRadius * 0.7) {
            const minOpacity = ripple.minOpacity || 0.2;
            const fadeOutFactor = Math.max(minOpacity / opacity, 1 - (wave.radius - maxRadius * 0.7) / (maxRadius * 0.3));
            opacity *= fadeOutFactor;
        }
        
        // Гарантируем минимальный уровень прозрачности
        const minOpacity = ripple.minOpacity || 0.2;
        opacity = Math.max(minOpacity, opacity);
        
        // Устанавливаем прозрачность шпателя с минимальным значением
        paletteOpacity = Math.max(minOpacity, originalOpacity * opacity);

        // Вычисляем текущее вращение волны
        const waveRotation = wave.rotationOffset + now * wave.rotationSpeed;

        // Для каждой точки на окружности
        for (let j = 0; j < numPoints; j++) {
            // Базовый угол с добавлением вращения
            const baseAngle = j * angleStep + waveRotation;
            
            // Создаем более сложное и органичное волновое смещение
            // Комбинируем несколько синусоид с разными частотами
            const primaryWave = Math.sin(baseAngle * wave.frequency + wave.phase + waveAge) * wave.amplitude;
            const secondaryWave = Math.cos(baseAngle * (wave.frequency * 0.5) + wave.phase * 1.3) * (wave.amplitude * 0.6);
            const tertiaryWave = Math.sin(baseAngle * (wave.frequency * 0.3) + waveAge * 2) * (wave.amplitude * 0.3);
            const wavyOffset = primaryWave + secondaryWave + tertiaryWave;

            // Добавляем небольшое случайное смещение для более естественного эффекта
            const jitter = (Math.sin(j * 100 + now * 0.01) * 2);
            
            // Вычисляем позицию точки на волне с учетом динамического центра
            const radius = wave.radius + wavyOffset + jitter;
            const x = dynamicCenterX + Math.cos(baseAngle) * radius;
            const y = dynamicCenterY + Math.sin(baseAngle) * radius;

            // Устанавливаем вращение шпателя по касательной к окружности
            // Добавляем небольшие вариации для более органичного вида
            const tangentAngle = baseAngle + Math.PI/2; // Перпендикулярно к радиусу
            const rotationVariation = Math.sin(j * 0.5 + waveAge * 2) * 15; // Вариация ±15 градусов
            paletteRotation = (tangentAngle * 180 / Math.PI + rotationVariation) % 360;

            // Изменяем ширину шпателя в зависимости от положения на волне и возраста
            const widthPulse = 0.8 + Math.sin(baseAngle * 3 + waveAge * wave.pulseFrequency) * 0.2;
            const ageWidthFactor = 1 - Math.min(1, waveAge / 10) * 0.3; // Уменьшаем ширину со временем
            const newWidth = originalWidth * wave.thickness * widthPulse * ageWidthFactor;
            
            // Проверяем на Infinity и NaN, ограничиваем разумным диапазоном
            paletteWidth = isFinite(newWidth) && !isNaN(newWidth) ? 
                          Math.max(5, Math.min(150, newWidth)) : originalWidth;

            // Создаем красивые цветовые переходы
            // Используем HSL для более контролируемых и приятных цветов
            gradientMode = 'hue';
            
            // Базовый цвет волны с вариацией вдоль окружности и со временем
            const hueVariation = Math.sin(baseAngle * 2 + waveAge * 0.5) * 20; // Вариация ±20 градусов
            const timeVariation = Math.sin(waveAge * 0.3) * 15; // Медленное изменение со временем
            hue = (wave.color + j * 3 + hueVariation + timeVariation) % 360;
            
            // Рисуем шпатель в этой точке
            drawSinglePaletteStroke(x, y);
            
            // Восстанавливаем ширину после каждой точки для безопасности
            paletteWidth = originalWidth;
        }

        // Если волна стала слишком большой, удаляем ее
        if (wave.radius > maxRadius) {
            ripple.waves.splice(i, 1);
            i--;
        }
    }

    // Обновляем позицию автоматического шпателя для корректной работы с другими режимами
    if (ripple.waves.length > 0) {
        const firstWave = ripple.waves[0];
        const angle = now * 0.001;
        autoPaletteX = dynamicCenterX + Math.cos(angle) * firstWave.radius;
        autoPaletteY = dynamicCenterY + Math.sin(angle) * firstWave.radius;
    }

    // Периодически меняем центр волн для более интересного эффекта
    // Используем более низкую вероятность для более плавных переходов
    if (ripple.waves.length === 0 || Math.random() < 0.0005) {
        // Перемещаем центр в случайную точку, но не слишком близко к краям
        ripple.centerX = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
        ripple.centerY = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    }
    
    // Гарантированно восстанавливаем исходные значения
    paletteWidth = originalWidth;
    paletteOpacity = originalOpacity;
    paletteRotation = originalRotation;
    gradientMode = originalGradientMode;
    hue = originalHue;
}