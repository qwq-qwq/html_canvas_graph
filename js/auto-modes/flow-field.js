// Обновленная функция для движения по эллипсу с периодическим изменением параметров
function updateFlowFieldPath() {
  // Увеличиваем время для анимации
  flowField.time += flowField.timeSpeed
  const now = Date.now()

  // Если первый запуск, устанавливаем начальную позицию в центре экрана
  if (autoPaletteX === null || autoPaletteY === null) {
    autoPaletteX = canvas.width / 2
    autoPaletteY = canvas.height / 2
  }

  // Сохраняем исходные значения
  const originalWidth = paletteWidth
  const originalRotation = paletteRotation

  // Проверяем, нужно ли изменить параметры эллипса
  if (now - flowField.ellipseChangeTime > flowField.ellipseChangeDelay) {
    // Обновляем время последнего изменения
    flowField.ellipseChangeTime = now
        
    // Случайно меняем направление движения (с вероятностью 30%)
    if (Math.random() < 0.3) {
      flowField.ellipseDirection *= -1
    }
        
    // Случайно меняем угол наклона эллипса
    flowField.ellipseAngle = Math.random() * 90 // От 0 до 90 градусов
        
    // Случайно меняем центр эллипса в пределах центральной области холста
    const centerVariation = flowField.ellipseVariation || 0.2
    const centerOffsetX = (Math.random() * 2 - 1) * canvas.width * centerVariation
    const centerOffsetY = (Math.random() * 2 - 1) * canvas.height * centerVariation
        
    flowField.ellipseCenterX = canvas.width / 2 + centerOffsetX
    flowField.ellipseCenterY = canvas.height / 2 + centerOffsetY
        
    // Случайно меняем размеры эллипса в пределах от 30% до 70% размера холста
    const minSizePercent = 0.3 // Минимальный размер (30% от размера холста)
    const maxSizePercent = 0.7 // Максимальный размер (70% от размера холста)
        
    const majorAxisPercent = minSizePercent + Math.random() * (maxSizePercent - minSizePercent)
    const minorAxisPercent = minSizePercent + Math.random() * (majorAxisPercent - minSizePercent)
        
    flowField.ellipseMajorAxis = canvas.width * majorAxisPercent / 2
    flowField.ellipseMinorAxis = canvas.height * minorAxisPercent / 2
        
    // Случайно меняем скорость движения
    flowField.ellipseSpeed = 0.003 + Math.random() * 0.007 // От 0.003 до 0.01
  }
    
  // Получаем параметры эллипса
  const centerX = flowField.ellipseCenterX !== null ? flowField.ellipseCenterX : canvas.width / 2
  const centerY = flowField.ellipseCenterY !== null ? flowField.ellipseCenterY : canvas.height / 2
  const majorAxis = flowField.ellipseMajorAxis !== null ? flowField.ellipseMajorAxis : canvas.width * 0.4
  const minorAxis = flowField.ellipseMinorAxis !== null ? flowField.ellipseMinorAxis : canvas.height * 0.3
  const angle = (flowField.ellipseAngle || 45) * Math.PI / 180 // Преобразуем градусы в радианы
  const speed = flowField.ellipseSpeed || 0.005
  const direction = flowField.ellipseDirection || 1
    
  // Обновляем фазу движения по эллипсу
  flowField.ellipsePhase += speed * direction
  if (flowField.ellipsePhase > Math.PI * 2) flowField.ellipsePhase -= Math.PI * 2
  if (flowField.ellipsePhase < 0) flowField.ellipsePhase += Math.PI * 2
    
  // Создаем несколько кистей для более интересного эффекта
  const numBrushes = 5
  for (let i = 0; i < numBrushes; i++) {
    // Вычисляем фазу для текущей кисти с небольшим смещением
    const brushPhase = flowField.ellipsePhase + i * (Math.PI * 2 / numBrushes)
        
    // Вычисляем позицию на эллипсе
    // x = centerX + majorAxis * cos(t) * cos(angle) - minorAxis * sin(t) * sin(angle)
    // y = centerY + majorAxis * cos(t) * sin(angle) + minorAxis * sin(t) * cos(angle)
    const cosT = Math.cos(brushPhase)
    const sinT = Math.sin(brushPhase)
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)
        
    // Добавляем небольшую вариацию для каждой кисти
    const brushVariation = 1 + (i * 0.05) * Math.sin(flowField.time * 0.1 + i)
        
    // Вычисляем позицию на эллипсе с учетом вариации
    const x = centerX + brushVariation * (majorAxis * cosT * cosAngle - minorAxis * sinT * sinAngle)
    const y = centerY + brushVariation * (majorAxis * cosT * sinAngle + minorAxis * sinT * cosAngle)
        
    // Вычисляем направление касательной к эллипсу для ориентации шпателя
    // dx/dt = -majorAxis * sin(t) * cos(angle) - minorAxis * cos(t) * sin(angle)
    // dy/dt = -majorAxis * sin(t) * sin(angle) + minorAxis * cos(t) * cos(angle)
    const dx = -majorAxis * sinT * cosAngle - minorAxis * cosT * sinAngle
    const dy = -majorAxis * sinT * sinAngle + minorAxis * cosT * cosAngle
        
    // Вычисляем угол касательной
    const tangentAngle = 45
        
    // Устанавливаем вращение шпателя по касательной к эллипсу
    // Добавляем 90 градусов, чтобы шпатель был перпендикулярен касательной
    paletteRotation = (tangentAngle * 180 / Math.PI + 90) % 360
        
    // Добавляем небольшую вариацию вращения для более органичного вида
    const rotationVariation = Math.sin(brushPhase * 3 + flowField.time * 0.1) * 15
    paletteRotation = (paletteRotation + rotationVariation) % 360
        
    // Изменяем ширину шпателя для разных кистей
    paletteWidth = originalWidth * (1 - i * 0.15) * (0.8 + Math.sin(brushPhase * 2 + flowField.time * 0.2) * 0.2)
        
    // Обновляем позицию для основной кисти
    if (i === 0) {
      autoPaletteX = x
      autoPaletteY = y
    }
        
    // Рисуем шпатель в новой позиции
    drawSinglePaletteStroke(x, y, paletteShape)
        
    // Восстанавливаем ширину после каждой кисти
    paletteWidth = originalWidth
  }
    
  // Гарантированно восстанавливаем исходные значения
  paletteWidth = originalWidth
  paletteRotation = originalRotation
}