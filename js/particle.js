// Класс для частиц
class Particle {
  constructor(explode) {
    this.x = mouse.x
    this.y = mouse.y
    this.color = getParticleColor()
    this.gravity = 0.01
    this.friction = 0.99
    this.opacity = 1

    if (explode) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 10 + 3
      this.speedX = Math.cos(angle) * speed
      this.speedY = Math.sin(angle) * speed
      this.size = Math.random() * particleSize * 0.8 + 2
      this.life = 60 + Math.random() * 80
    } else {
      this.speedX = Math.random() * 6 - 3
      this.speedY = Math.random() * 6 - 3
      this.size = Math.random() * particleSize + 1
      this.life = 100 + Math.random() * 100
    }
  }

  update() {
    // Применяем гравитацию и трение
    this.speedY += this.gravity
    this.speedX *= this.friction
    this.speedY *= this.friction

    this.x += this.speedX
    this.y += this.speedY

    // Отражение от краев экрана
    if (this.x <= 0 || this.x >= canvas.width) {
      this.speedX *= -0.7
    }
    if (this.y <= 0 || this.y >= canvas.height) {
      this.speedY *= -0.7
    }

    // Уменьшаем размер медленнее
    if (this.size > 0.2) {
      this.size -= 0.05
    }

    // Уменьшаем время жизни и прозрачность
    this.life--
    if (this.life < 50) {
      this.opacity = this.life / 50
    }
  }

  draw() {
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function handleParticles() {
  for(let i = 0; i < particleArray.length; i++) {
    particleArray[i].update()
    particleArray[i].draw()

    // Соединение линиями
    for (let j = i; j < particleArray.length; j++) {
      const dx = particleArray[i].x - particleArray[j].x
      const dy = particleArray[i].y - particleArray[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        // Устанавливаем прозрачность линии в зависимости от расстояния
        const opacity = 1 - (distance / connectionDistance)

        ctx.beginPath()
        ctx.strokeStyle = particleArray[i].color
        ctx.globalAlpha = opacity * particleArray[i].opacity * particleArray[j].opacity
        ctx.lineWidth = 0.2
        ctx.moveTo(particleArray[i].x, particleArray[i].y)
        ctx.lineTo(particleArray[j].x, particleArray[j].y)
        ctx.stroke()
        ctx.closePath()
        ctx.globalAlpha = 1
      }
    }

    // Удаляем частицы, которые слишком маленькие или время жизни закончилось
    if (particleArray[i].size <= 0.3 || particleArray[i].life <= 0) {
      particleArray.splice(i, 1)
      i--
    }
  }
}