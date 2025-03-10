// Основная функция анимации
function animate() {
    try {
    // Применяем разные режимы заполнения экрана
        if (drawMode !== 'auto' && drawMode !== 'waveParticles') {
        if (fillMode === 'clear') {
            // Полная очистка холста
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        } else if (fillMode === 'fade') {
            // Частичное затемнение (эффект исчезающего следа)
            ctx.fillStyle = `rgba(0,0,0,${fadeAmount})`
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        // В режиме 'fill' не очищаем холст вообще
        } else if (drawMode === 'auto') {
        // В авторежиме используем более медленное затухание для создания следов
        ctx.fillStyle = `rgba(0,0,0,${fadeAmount * 0.5})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
        // Режим waveParticles обрабатывает очистку внутри своей функции

    // Обновляем соответствующие элементы в зависимости от режима
    if (drawMode === 'particles') {
        handleParticles()
    } else if (drawMode === 'auto') {
        // Сохраняем базовое значение ширины шпателя перед вызовом авторежимов
        const originalWidth = paletteWidth
        const originalRotation = paletteRotation

        try {
            // Вызываем соответствующую функцию в зависимости от типа пути
            if (autoPathType === 'spiralWave') {
                updateSpiralPath()
            } else if (autoPathType === 'flowField') {
                updateFlowFieldPath()
            } else if (autoPathType === 'ripple') {
                updateRippleEffect()
            } else if (autoPathType === 'terrain') {
                updateTerrainPath()
            }
        } catch (error) {
            console.error("Error in auto path update:", error)
        } finally {
            // Восстанавливаем ширину шпателя после выполнения любого автоматического режима
            paletteWidth = originalWidth
            paletteRotation = originalRotation
        }
    } else if (drawMode === 'waveParticles') {
        // Вызываем функцию отрисовки волновых частиц
        drawWaveParticles()
    }

    // Показываем информационную панель
    displayInfo()

    hue += 1 // Замедлим изменение цвета для более плавных переходов
    } catch (error) {
        console.error("Error in animate function:", error)
    }

    requestAnimationFrame(animate)
}

// Начальные инструкции
function showStartupInstructions() {
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = '20px Arial'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText('Режимы рисования - M/W: Переключение между режимами', canvas.width/2, canvas.height/2 - 180)

    ctx.fillText('Режим ЧАСТИЦЫ:', canvas.width/2, canvas.height/2 - 140)
    ctx.fillText('Двигайте мышкой или касайтесь экрана для создания частиц', canvas.width/2, canvas.height/2 - 110)
    ctx.fillText('Используйте стрелки для изменения размеров', canvas.width/2, canvas.height/2 - 80)

    ctx.fillText('Режим ШПАТЕЛЬ:', canvas.width/2, canvas.height/2 - 40)
    ctx.fillText('Удерживайте кнопку мыши и двигайте для рисования', canvas.width/2, canvas.height/2 - 10)
    ctx.fillText('Используйте A/D для вращения шпателя', canvas.width/2, canvas.height/2 + 20)

    ctx.fillText('Режим АВТОШПАТЕЛЬ:', canvas.width/2, canvas.height/2 + 60)
    ctx.fillText('Кликните для изменения направления движения', canvas.width/2, canvas.height/2 + 90)
    ctx.fillText('P: смена типа пути (Спираль, Поток, Волны, Топография)', canvas.width/2, canvas.height/2 + 120)

    ctx.fillText('Режим ТОПОГРАФИЯ:', canvas.width/2, canvas.height/2 + 160)
    ctx.fillText('Имитация поверхности с изменяющимися высотами', canvas.width/2, canvas.height/2 + 190)
    ctx.fillText('Q: смена цвета, 1/2/3: режимы отображения, N/B: масштаб', canvas.width/2, canvas.height/2 + 220)

    ctx.fillText('Режим ВОЛНОВЫЕ ЛИНИИ (W):', canvas.width/2, canvas.height/2 + 260)
    ctx.fillText('Стрелки: изменение линий и амплитуды', canvas.width/2, canvas.height/2 + 290)
    ctx.fillText('m: режимы (Волны, Спираль, Сетка), 1-4: цветовые режимы', canvas.width/2, canvas.height/2 + 320)
}

// Инициализация и запуск
function init() {
    // Показываем начальные инструкции
    showStartupInstructions()

    // Добавляем обработчик клавиш для режима волновых частиц
    addWaveParticlesKeyHandler()

    // Запускаем анимацию через 3 секунды
    setTimeout(() => {
        // Запускаем анимацию
        animate()
    }, 3000)
}

// Запускаем инициализацию при загрузке страницы
window.onload = init