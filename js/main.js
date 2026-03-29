// Основная функция анимации
function animate() {
  if (fillMode === 'clear') {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  } else if (fillMode === 'fade') {
    ctx.fillStyle = `rgba(0,0,0,${fadeAmount})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  handleParticles()
  displayInfo()

  hue += 1

  requestAnimationFrame(animate)
}

window.onload = animate