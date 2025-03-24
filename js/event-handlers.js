// Обработчик изменения размера окна
window.addEventListener('resize', function(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

// Обработчики событий мыши
canvas.addEventListener('click', function(event){
  mouse.x = event.x
  mouse.y = event.y

  if (drawMode === 'particles') {
    for(let i=0; i < particlesPerClick; i++){
      particleArray.push(new Particle())
    }
  } else if (drawMode === 'palette') {
    drawPalette(mouse.x, mouse.y, paletteShape)
  } else if (drawMode === 'auto') {
    // В автоматическом режиме клик меняет центр генерации
    updateAutoCenter(mouse.x, mouse.y)
  }
})

canvas.addEventListener('mousemove', function(event){
  mouse.x = event.x
  mouse.y = event.y

  if (drawMode === 'particles') {
    for(let i=0; i < particlesPerMove; i++){
      particleArray.push(new Particle())
    }
  }
})

// Рисование шпателем при движении мыши с нажатой кнопкой
canvas.addEventListener('mousedown', function(event) {
  if (drawMode === 'palette') {
    canvas.addEventListener('mousemove', drawPaletteOnMove)
  }
})

canvas.addEventListener('mouseup', function() {
  canvas.removeEventListener('mousemove', drawPaletteOnMove)
  // Сбрасываем последнюю позицию шпателя при отпускании кнопки мыши
  lastPaletteX = null
  lastPaletteY = null
})

function drawPaletteOnMove(event) {
  if (drawMode === 'palette') {
    drawPalette(event.x, event.y, paletteShape)
  }
}

// Обработчики для сенсорных устройств
canvas.addEventListener('touchstart', handleStart, false)
canvas.addEventListener('touchend', handleEnd, false)
canvas.addEventListener('touchmove', handleMove, false)

function addTouchParticles(x, y){
  mouse.x = x
  mouse.y = y

  if (drawMode === 'particles') {
    for(let i=0; i < particlesPerMove; i++){
      particleArray.push(new Particle())
    }
  } else if (drawMode === 'palette') {
    drawPalette(mouse.x, mouse.y, paletteShape)
  } else if (drawMode === 'auto') {
    updateAutoCenter(mouse.x, mouse.y, paletteShape)
  }
}

function handleStart(evt) {
  evt.preventDefault()
  const touches = evt.changedTouches
  for (let i = 0; i < touches.length; i++) {
    addTouchParticles(touches[i].pageX, touches[i].pageY)
  }
}

function handleMove(evt) {
  evt.preventDefault()
  const touches = evt.changedTouches
  for (let i = 0; i < touches.length; i++) {
    addTouchParticles(touches[i].pageX, touches[i].pageY)
  }
}

function handleEnd(evt) {
  evt.preventDefault()
  // Сбрасываем последнюю позицию шпателя
  lastPaletteX = null
  lastPaletteY = null
}

// Управление через клавиатуру
window.addEventListener('keydown', function(event) {
  // Переключение режима рисования
  if (event.key === 'm') {
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Циклическое переключение между режимами
    if (drawMode === 'particles') {
      drawMode = 'palette'
    } else if (drawMode === 'palette') {
      drawMode = 'auto'
      initAutoMode() // Инициализация авторежима
    } else {
      drawMode = 'particles'
    }
  }

  if (event.key === 'l') {
    if (paletteShape === 'palette') {
      paletteShape = 'star'
    } else if (paletteShape === 'star') {
      paletteShape = 'palette'
    } else {
      paletteShape = 'palette'
    }
  }

  if (drawMode === 'particles' || drawMode === 'audioParticles') {
    // Управление для режима частиц

    // Изменение размера частиц
    if (event.key === 'ArrowUp') {
      particleSize = Math.min(30, particleSize + 2)
    }
    if (event.key === 'ArrowDown') {
      particleSize = Math.max(5, particleSize - 2)
    }

    // Изменение расстояния соединения
    if (event.key === 'ArrowRight') {
      connectionDistance = Math.min(200, connectionDistance + 10)
    }
    if (event.key === 'ArrowLeft') {
      connectionDistance = Math.max(50, connectionDistance - 10)
    }

    // Изменение количества частиц
    if (event.key === '+') {
      particlesPerClick = Math.min(30, particlesPerClick + 2)
      particlesPerMove = Math.min(15, particlesPerMove + 1)
    }
    if (event.key === '-') {
      particlesPerClick = Math.max(5, particlesPerClick - 2)
      particlesPerMove = Math.max(1, particlesPerMove - 1)
    }

    // Изменение цветового режима
    if (event.key === '1') {
      colorMode = 'rainbow'
    }
    if (event.key === '2') {
      colorMode = 'monochrome'
    }
    if (event.key === '3') {
      colorMode = 'pastel'
    }

    // Изменение базового оттенка для monochrome
    if (event.key === 'q') {
      baseHue = (baseHue + 30) % 360
    }

    // Переключение режима аудио-частиц
    if (event.key === 'a') {
      if (drawMode === 'audioParticles') {
        drawMode = 'particles'
        stopAudio()
      } else {
        drawMode = 'audioParticles'
        initAudio()
      }
    }
  } else if (drawMode === 'palette' || drawMode === 'auto') {
    // Общие настройки для ручного и автоматического режима шпателя

    // Изменение ширины шпателя
    if (event.key === 'ArrowUp') {
      paletteWidth = Math.min(200, paletteWidth + 5)
    }
    if (event.key === 'ArrowDown') {
      paletteWidth = Math.max(10, paletteWidth - 5)
    }

    // Изменение длины шпателя
    if (event.key === 'ArrowRight') {
      paletteLength = Math.min(300, paletteLength + 10)
    }
    if (event.key === 'ArrowLeft') {
      paletteLength = Math.max(50, paletteLength - 10)
    }

    // Изменение вращения шпателя (только в ручном режиме)
    if (drawMode === 'palette') {
      if (event.key === 'a') {
        paletteRotation = (paletteRotation - 15) % 360
      }
      if (event.key === 'd') {
        paletteRotation = (paletteRotation + 15) % 360
      }
    }

    // Изменение прозрачности шпателя
    if (event.key === '+') {
      paletteOpacity = Math.min(1, paletteOpacity + 0.05)
    }
    if (event.key === '-') {
      paletteOpacity = Math.max(0.1, paletteOpacity - 0.05)
    }

    // Переключение режима градиента
    if (event.key === '1') {
      gradientMode = 'hue'
    }
    if (event.key === '2') {
      gradientMode = 'rainbow'
    }
    if (event.key === '3') {
      gradientMode = 'custom'
    }

    // Специфичные настройки для автоматического режима
    if (drawMode === 'auto') {
      // Изменение типа пути
      if (event.key === 'p') {
        // Циклическое переключение между типами
        const currentIndex = autoPathTypes.indexOf(autoPathType)
        const nextIndex = (currentIndex + 1) % autoPathTypes.length
        autoPathType = autoPathTypes[nextIndex]
        initAutoMode() // Переинициализируем автоматический режим
      }

      // Изменение скорости движения
      if (event.key === 's') {
        autoPathSpeed = Math.min(10, autoPathSpeed + 0.5)
        spiral.rotationSpeed = Math.min(0.1, spiral.rotationSpeed + 0.005)
        flowField.timeSpeed = Math.min(0.01, flowField.timeSpeed + 0.001)
        ripple.frequency = Math.min(0.2, ripple.frequency + 0.01)
      }
      if (event.key === 'a') {
        autoPathSpeed = Math.max(0.5, autoPathSpeed - 0.5)
        spiral.rotationSpeed = Math.max(0.01, spiral.rotationSpeed - 0.005)
        flowField.timeSpeed = Math.max(0.001, flowField.timeSpeed - 0.001)
        ripple.frequency = Math.max(0.05, ripple.frequency - 0.01)
      }

      // Изменение радиуса для спирали
      if (event.key === 'r') {
        spiral.radius = Math.min(500, spiral.radius + 20)
      }
      if (event.key === 'e') {
        spiral.radius = Math.max(30, spiral.radius - 20)
      }

      // Изменение скорости вращения шпателя
      if (event.key === 'd') {
        autoRotateSpeed = Math.min(5, autoRotateSpeed + 0.2)
      }
      if (event.key === 'f') {
        autoRotateSpeed = Math.max(0, autoRotateSpeed - 0.2)
      }

      // Увеличение/уменьшение роста спирали
      if (event.key === 'g') {
        spiral.growth = Math.min(5, spiral.growth + 0.2)
      }
      if (event.key === 'h') {
        spiral.growth = Math.max(0.1, spiral.growth - 0.2)
      }

      // Изменение масштаба шума для flow field
      if (event.key === 'n') {
        flowField.noiseScale = Math.min(0.1, flowField.noiseScale + 0.005)
      }
      if (event.key === 'b') {
        flowField.noiseScale = Math.max(0.01, flowField.noiseScale - 0.005)
      }

      // Изменение силы отталкивания от стен
      if (event.key === 'j') {
        flowField.wallRepulsionForce = Math.min(0.1, flowField.wallRepulsionForce + 0.01)
      }
      if (event.key === 'k') {
        flowField.wallRepulsionForce = Math.max(0, flowField.wallRepulsionForce - 0.01)
      }

      // Изменение силы притяжения к центру
      if (event.key === 'u') {
        flowField.centerAttractionForce = Math.min(0.05, flowField.centerAttractionForce + 0.005)
      }
      if (event.key === 'i') {
        flowField.centerAttractionForce = Math.max(0, flowField.centerAttractionForce - 0.005)
      }

      // Изменение частоты и амплитуды для ripple
      if (event.key === 'y') {
        ripple.amplitude = Math.min(100, ripple.amplitude + 5)
      }
      if (event.key === 't') {
        ripple.amplitude = Math.max(10, ripple.amplitude - 5)
      }

      // Параметры для режима топографической поверхности
      if (autoPathType === 'terrain') {
        // Изменение масштаба шума
        if (event.key === 'n') {
          terrain.noiseScale = Math.min(0.02, terrain.noiseScale + 0.001)
        }
        if (event.key === 'b') {
          terrain.noiseScale = Math.max(0.001, terrain.noiseScale - 0.001)
        }

        // Изменение скорости изменения ландшафта
        if (event.key === 't') {
          terrain.timeSpeed = Math.min(0.002, terrain.timeSpeed + 0.0001)
        }
        if (event.key === 'y') {
          terrain.timeSpeed = Math.max(0.0001, terrain.timeSpeed - 0.0001)
        }

        // Изменение множителя высоты
        if (event.key === 'h') {
          terrain.heightMultiplier = Math.min(3, terrain.heightMultiplier + 0.1)
        }
        if (event.key === 'j') {
          terrain.heightMultiplier = Math.max(0.5, terrain.heightMultiplier - 0.1)
        }

        // Изменение количества уровней изолиний
        if (event.key === 'c') {
          terrain.contourLevels = Math.min(20, terrain.contourLevels + 1)
        }
        if (event.key === 'v') {
          terrain.contourLevels = Math.max(3, terrain.contourLevels - 1)
        }

        // Изменение расстояния между точками
        if (event.key === 'g') {
          terrain.pointSpacing = Math.min(50, terrain.pointSpacing + 2)
          initTerrain() // Пересоздаем сетку точек
        }
        if (event.key === 'f') {
          terrain.pointSpacing = Math.max(10, terrain.pointSpacing - 2)
          initTerrain() // Пересоздаем сетку точек
        }

        // Переключение режимов отображения
        if (event.key === '1') {
          terrain.showPoints = !terrain.showPoints
        }
        if (event.key === '2') {
          terrain.showContours = !terrain.showContours
        }
        if (event.key === '3') {
          terrain.showSurface = !terrain.showSurface
        }

        // Переключение цветовых режимов
        if (event.key === 'q') {
          if (terrain.colorMode === 'height') {
            terrain.colorMode = 'gradient'
          } else if (terrain.colorMode === 'gradient') {
            terrain.colorMode = 'terrain'
          } else {
            terrain.colorMode = 'height'
          }
        }

        // Изменение порога соединения точек
        if (event.key === 'z') {
          terrain.connectionThreshold = Math.min(0.3, terrain.connectionThreshold + 0.01)
        }
        if (event.key === 'x') {
          terrain.connectionThreshold = Math.max(0.01, terrain.connectionThreshold - 0.01)
        }

        // Изменение амплитуды волн
        if (event.key === 'r') {
          terrain.waveAmplitude = Math.min(0.5, terrain.waveAmplitude + 0.02)
        }
        if (event.key === 'e') {
          terrain.waveAmplitude = Math.max(0, terrain.waveAmplitude - 0.02)
        }
      }
    }
  }

  // Изменение скорости затухания
  if (event.key === 'c') {
    fadeAmount = Math.max(0.001, fadeAmount - 0.005)
  }
  if (event.key === 'v') {
    fadeAmount = Math.min(0.1, fadeAmount + 0.005)
  }

  // Обработчики для режима волновых частиц
  if (drawMode === 'particles') {
    if (event.key === 'ArrowUp') {
      waveParticles.lineCount = Math.min(50, waveParticles.lineCount + 1)
      initWaveParticles() // Пересчитываем количество точек
    }
    if (event.key === 'ArrowDown') {
      waveParticles.lineCount = Math.max(3, waveParticles.lineCount - 1)
      initWaveParticles() // Пересчитываем количество точек
    }

    // Изменение амплитуды волн
    if (event.key === 'a') {
      waveParticles.amplitude = Math.min(100, waveParticles.amplitude + 5)
    }
    if (event.key === 'z') {
      waveParticles.amplitude = Math.max(5, waveParticles.amplitude - 5)
    }

    // Изменение частоты волн
    if (event.key === 's') {
      waveParticles.frequency = Math.min(0.1, waveParticles.frequency + 0.005)
    }
    if (event.key === 'x') {
      waveParticles.frequency = Math.max(0.01, waveParticles.frequency - 0.005)
    }

    // Изменение ширины линий
    if (event.key === 'd') {
      waveParticles.lineWidth = Math.min(10, waveParticles.lineWidth + 0.5)
    }
    if (event.key === 'c') {
      waveParticles.lineWidth = Math.max(0.5, waveParticles.lineWidth - 0.5)
    }

    // Изменение прозрачности
    if (event.key === 'f') {
      waveParticles.opacity = Math.min(1, waveParticles.opacity + 0.05)
    }
    if (event.key === 'v') {
      waveParticles.opacity = Math.max(0.1, waveParticles.opacity - 0.05)
    }

    // Переключение между режимами отображения
    if (event.key === 'b') {
      if (waveParticles.mode === 'wave') {
        waveParticles.mode = 'spiral'
      } else if (waveParticles.mode === 'spiral') {
        waveParticles.mode = 'grid'
      } else {
        waveParticles.mode = 'wave'
      }
    }

    // Переключение отображения только линий или линий с частицами
    if (event.key === 'l') {
      waveParticles.linesOnly = !waveParticles.linesOnly
    }
        
    // Переключение между режимами градиента
    if (event.key === '1') {
      waveParticles.colorMode = 'hue'
    }
    if (event.key === '2') {
      waveParticles.colorMode = 'rainbow'
    }
    if (event.key === '3') {
      waveParticles.colorMode = 'custom'
    }
    if (event.key === '4') {
      waveParticles.colorMode = 'monochrome'
    }
        
    // Изменение базового оттенка
    if (event.key === 'q') {
      waveParticles.baseHue = (waveParticles.baseHue + 30) % 360
    }
    if (event.key === 'e') {
      waveParticles.baseHue = (waveParticles.baseHue - 30 + 360) % 360
    }
  }
})

// Обработчики для режима волновых частиц
function addWaveParticlesKeyHandler() {
  window.addEventListener('keydown', function(event) {
    if (!waveParticles.enabled) return

    // Изменение количества линий
    if (event.key === 'ArrowUp') {
      waveParticles.lineCount = Math.min(50, waveParticles.lineCount + 1)
      initWaveParticles() // Пересчитываем количество точек
    }
    if (event.key === 'ArrowDown') {
      waveParticles.lineCount = Math.max(3, waveParticles.lineCount - 1)
      initWaveParticles() // Пересчитываем количество точек
    }

    // Изменение амплитуды волн
    if (event.key === 'ArrowLeft') {
      waveParticles.amplitude = Math.min(100, waveParticles.amplitude + 5)
    }
    if (event.key === 'ArrowRight') {
      waveParticles.amplitude = Math.max(5, waveParticles.amplitude - 5)
    }

    // Изменение частоты волн
    if (event.key === 's') {
      waveParticles.frequency = Math.min(0.1, waveParticles.frequency + 0.005)
    }
    if (event.key === 'x') {
      waveParticles.frequency = Math.max(0.01, waveParticles.frequency - 0.005)
    }

    // Изменение ширины линий
    if (event.key === 'd') {
      waveParticles.lineWidth = Math.min(10, waveParticles.lineWidth + 0.5)
    }
    if (event.key === 'c') {
      waveParticles.lineWidth = Math.max(0.5, waveParticles.lineWidth - 0.5)
    }

    // Изменение прозрачности
    if (event.key === 'f') {
      waveParticles.opacity = Math.min(1, waveParticles.opacity + 0.05)
    }
    if (event.key === 'v') {
      waveParticles.opacity = Math.max(0.1, waveParticles.opacity - 0.05)
    }

    // Переключение между режимами отображения
    if (event.key === 'b') {
      if (waveParticles.mode === 'wave') {
        waveParticles.mode = 'spiral'
      } else if (waveParticles.mode === 'spiral') {
        waveParticles.mode = 'grid'
      } else {
        waveParticles.mode = 'wave'
      }
    }

    // Переключение отображения только линий или линий с частицами
    if (event.key === 'l') {
      waveParticles.linesOnly = !waveParticles.linesOnly
    }
        
    // Переключение между режимами градиента
    if (event.key === '1') {
      waveParticles.colorMode = 'hue'
    }
    if (event.key === '2') {
      waveParticles.colorMode = 'rainbow'
    }
    if (event.key === '3') {
      waveParticles.colorMode = 'custom'
    }
    if (event.key === '4') {
      waveParticles.colorMode = 'monochrome'
    }
        
    // Изменение базового оттенка
    if (event.key === 'q') {
      waveParticles.baseHue = (waveParticles.baseHue + 30) % 360
    }
    if (event.key === 'e') {
      waveParticles.baseHue = (waveParticles.baseHue - 30 + 360) % 360
    }
  })
}