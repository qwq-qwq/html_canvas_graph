// Кнопка справки
document.getElementById('info-btn').addEventListener('click', function() {
  showHelp = !showHelp
})

// Обработчик изменения размера окна
window.addEventListener('resize', function(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

// Обработчики событий мыши
canvas.addEventListener('click', function(event){
  mouse.x = event.x
  mouse.y = event.y

  const burstCount = particlesPerClick * 4
  for(let i=0; i < burstCount; i++){
    particleArray.push(new Particle(true))
  }
})

canvas.addEventListener('mousemove', function(event){
  mouse.x = event.x
  mouse.y = event.y

  for(let i=0; i < particlesPerMove; i++){
    particleArray.push(new Particle())
  }
})

// Обработчики для сенсорных устройств
canvas.addEventListener('touchstart', handleStart, false)
canvas.addEventListener('touchend', handleEnd, false)
canvas.addEventListener('touchmove', handleMove, false)

function addTouchParticles(x, y){
  mouse.x = x
  mouse.y = y

  for(let i=0; i < particlesPerMove; i++){
    particleArray.push(new Particle())
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
}

// Управление через клавиатуру
window.addEventListener('keydown', function(event) {
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

  // Показ справки
  if (event.key === 'i') {
    showHelp = !showHelp
  }

  // Изменение скорости затухания
  if (event.key === 'c') {
    fadeAmount = Math.max(0.001, fadeAmount - 0.005)
  }
  if (event.key === 'v') {
    fadeAmount = Math.min(0.1, fadeAmount + 0.005)
  }
})