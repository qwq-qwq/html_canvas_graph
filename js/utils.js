// Функция для получения цвета частиц в зависимости от выбранного режима
function getParticleColor() {
    switch(colorMode) {
        case 'rainbow':
            return 'hsl(' + hue + ', 100%, 50%)'
        case 'monochrome':
            // Вариации оттенка в пределах ±20 от базового
            const hueVariation = baseHue + (Math.random() * 40 - 20)
            return 'hsl(' + hueVariation + ', 100%, 50%)'
        case 'pastel':
            return 'hsl(' + hue + ', 70%, 80%)'
        default:
            return 'hsl(' + hue + ', 100%, 50%)'
    }
}

// Функция обновления центра для авторежимов
function updateAutoCenter(x, y) {
    if (autoPathType === 'spiralWave') {
        spiral.centerX = x
        spiral.centerY = y
        spiral.angle = 0 // Сбрасываем угол
    } else if (autoPathType === 'ripple') {
        ripple.centerX = x
        ripple.centerY = y
        // Добавляем новую волну
        ripple.waves.push({
            radius: 0,
            growth: 2,
            amplitude: 10,
            frequency: 8,
            phase: 0,
            thickness: 1,
            color: hue
        })
    } else if (autoPathType === 'flowField') {
        // Для flow field просто обновляем позицию
        autoPaletteX = x
        autoPaletteY = y
    }
}

// Функция для отображения информации на экране
function displayInfo() {
    ctx.font = '14px Arial'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'left'
    
    // Отображаем информацию в зависимости от режима
    if (drawMode === 'particles') {
        ctx.fillText(`Режим: Частицы | Размер: ${particleSize} | Соединение: ${connectionDistance}px | Цвет: ${colorMode}`, 10, 30)
    } else if (drawMode === 'palette') {
        ctx.fillText(`Режим: Шпатель | Ширина: ${paletteWidth}px | Длина: ${paletteLength}px | Поворот: ${paletteRotation}° | Прозрачность: ${paletteOpacity.toFixed(2)}`, 10, 30)
    } else if (drawMode === 'auto') {
        let modeInfo = `Режим: Авто | Тип: `
        
        if (autoPathType === 'spiralWave') {
            modeInfo += `Спираль | Радиус: ${spiral.radius.toFixed(0)} | Скорость: ${spiral.rotationSpeed.toFixed(3)}`
        } else if (autoPathType === 'flowField') {
            modeInfo += `Поток | Шум: ${flowField.noiseScale.toFixed(3)} | Скорость: ${flowField.timeSpeed.toFixed(3)}`
        } else if (autoPathType === 'ripple') {
            modeInfo += `Волны | Частота: ${ripple.frequency.toFixed(2)} | Волн: ${ripple.waves.length}`
        } else if (autoPathType === 'terrain') {
            modeInfo += `Топография | Шум: ${terrain.noiseScale.toFixed(3)} | Высота: ${terrain.heightMultiplier.toFixed(1)} | Изолинии: ${terrain.contourLevels}`
        }
        
        ctx.fillText(modeInfo, 10, 30)
    } else if (drawMode === 'waveParticles') {
        ctx.fillText(`Режим: Волновые частицы | Линий: ${waveParticles.lineCount} | Амплитуда: ${waveParticles.amplitude} | Режим: ${waveParticles.mode} | Цвет: ${waveParticles.colorMode}`, 10, 30)
    }
    
    // Отображаем подсказки по управлению
    let controlsInfo = 'M: смена режима | '
    
    if (drawMode === 'auto') {
        controlsInfo += 'P: смена типа пути | '
        
        if (autoPathType === 'terrain') {
            controlsInfo += 'Q: смена цвета | 1/2/3: режимы отображения | N/B: масштаб | H/J: высота | C/V: изолинии'
        } else {
            controlsInfo += 'S/A: скорость | '
            
            if (autoPathType === 'spiralWave') {
                controlsInfo += 'R/E: радиус | G/H: рост'
            } else if (autoPathType === 'flowField') {
                controlsInfo += 'N/B: шум | J/K: отталкивание | U/I: притяжение'
            } else if (autoPathType === 'ripple') {
                controlsInfo += 'Y/T: амплитуда | F/G: частота'
            }
        }
    } else if (drawMode === 'particles') {
        controlsInfo += 'Стрелки: размер и соединение | +/-: количество | 1/2/3: цвет'
    } else if (drawMode === 'palette') {
        controlsInfo += 'Стрелки: размер | A/D: поворот | +/-: прозрачность | 1/2/3: градиент'
    } else if (drawMode === 'waveParticles') {
        controlsInfo += 'Стрелки: линии и амплитуда | M: режим | L: линии/частицы | 1-4: цвет'
    }
    
    ctx.fillText(controlsInfo, 10, canvas.height - 10)
}

// Инициализация автоматического режима
function initAutoMode() {
    // Устанавливаем начальную позицию шпателя в центре экрана
    autoPaletteX = canvas.width / 2
    autoPaletteY = canvas.height / 2

    // Инициализация спирали
    spiral.centerX = canvas.width / 2
    spiral.centerY = canvas.height / 2
    spiral.angle = 0
    spiral.autoChangeTime = Date.now() + spiral.autoChangeDelay

    // Инициализация ripple
    ripple.centerX = canvas.width / 2
    ripple.centerY = canvas.height / 2
    ripple.waves = []
    ripple.lastWaveTime = Date.now() - ripple.waveInterval // Гарантируем создание волны сразу
    ripple.maxWaves = 5 // Устанавливаем максимальное количество волн
    ripple.waveInterval = 500 // Начальный интервал между волнами

    // Инициализация flow field
    flowField.time = 0
    
    // Инициализация режима топографической поверхности
    if (autoPathType === 'terrain') {
        initTerrain();
    }
}