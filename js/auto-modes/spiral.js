// Обновление пути спирали
function updateSpiralPath() {
    createMultipleSpirals()
}

// Создание нескольких спиралей в разных точках экрана
function createMultipleSpirals() {
    const now = Date.now()

    // Сохраняем исходные значения
    const originalWidth = paletteWidth
    const originalRotation = paletteRotation

    try {
        // Проверяем, нужно ли сменить направление или создать новую спираль
        if (now > spiral.autoChangeTime) {
            // С вероятностью 40% меняем направление спирали
            if (Math.random() < 0.4) {
                spiral.rotationSpeed *= -1
            }

            // С вероятностью 30% меняем центр спирали на случайную точку экрана
            if (Math.random() < 0.3) {
                spiral.centerX = Math.random() * canvas.width
                spiral.centerY = Math.random() * canvas.height
                spiral.angle = 0 // Сбрасываем угол
            }

            // Устанавливаем новое время для изменения
            spiral.autoChangeDelay = 5000 + Math.random() * 10000 // От 5 до 15 секунд
            spiral.autoChangeTime = now + spiral.autoChangeDelay
        }

        // Создаем несколько вложенных спиралей с разными радиусами
        const numSpirals = 3
        for (let i = 0; i < numSpirals; i++) {
            try {
                // Увеличиваем угол с разной скоростью для каждой спирали
                const angleStep = spiral.rotationSpeed * (1 + i * 0.2)
                spiral.angle += angleStep

                // Вычисляем текущий радиус с добавлением волн
                const radiusMultiplier = 1 + i * 0.5 // Увеличиваем радиус для каждой спирали
                const currentRadius = spiral.radius * radiusMultiplier + spiral.angle * spiral.radiusGrowth

                // Добавляем волновое искажение с разной частотой для каждой спирали
                const waveAmplitude = 20 + i * 5 // Амплитуда волны
                const waveFrequency = 10 - i * 2 // Частота волны
                const waveOffset = Math.sin(spiral.angle * waveFrequency) * waveAmplitude

                // Создаем дополнительные модуляции для более сложных форм
                const secondaryWave = Math.cos(spiral.angle * (waveFrequency / 2)) * (waveAmplitude / 2)
                const finalOffset = waveOffset + secondaryWave

                // Вычисляем новую позицию
                const newX = spiral.centerX + Math.cos(spiral.angle) * (currentRadius + finalOffset)
                const newY = spiral.centerY + Math.sin(spiral.angle) * (currentRadius + finalOffset)

                // Обновляем угол вращения шпателя (тангенциально к спирали + небольшое смещение для каждой спирали)
                const rotationOffset = i * 15 // Градусов
                paletteRotation = (spiral.angle * 180 / Math.PI + 90 + rotationOffset) % 360

                paletteWidth = originalWidth

                // Рисуем только одиночный шпатель, не использовать drawPalette
                drawSinglePaletteStroke(newX, newY)

                // Обновляем позицию для проверки коллизий с краями экрана (только для первой спирали)
                if (i === 0) {
                    autoPaletteX = newX
                    autoPaletteY = newY

                    // Если спираль выходит за пределы экрана, сбрасываем её
                    if (newX < 0 || newX > canvas.width || newY < 0 || newY > canvas.height) {
                        // Меняем центр немного в случайном направлении
                        spiral.centerX = canvas.width / 2 + (Math.random() * 200 - 100)
                        spiral.centerY = canvas.height / 2 + (Math.random() * 200 - 100)
                        spiral.angle = 0
                    }
                }
            } catch (error) {
                console.error("Error in spiral iteration:", error)
            } finally {
                // Восстанавливаем ширину после каждой спирали
                paletteWidth = originalWidth
            }
        }
    } catch (error) {
        console.error("Error in createMultipleSpirals:", error)
    } finally {
        // Гарантированно восстанавливаем исходные значения
        paletteWidth = originalWidth
        paletteRotation = originalRotation
    }
}