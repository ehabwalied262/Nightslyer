import * as Phaser from 'phaser'
import { POWERUPS } from '../config/gameConfig.js'

export class PowerUp {
  constructor(scene, x, y, type) {
    this.scene = scene
    this.type = type
    this.config = POWERUPS.types[type]
    this.isCollected = false
    this.isExpiring = false

    // Create visual representation
    this.container = scene.add.container(x, y)
    this.container.setDepth(10)
    this.container.setSize(40, 40)

    // Glow effect (pulsing background circle)
    this.glow = scene.add.graphics()
    this.glow.fillStyle(this.config.glowColor, 0.3)
    this.glow.fillCircle(0, 0, 24)
    this.container.add(this.glow)

    // Main pickup body
    this.body = scene.add.graphics()
    this.body.fillStyle(this.config.color)
    this.body.fillRoundedRect(-16, -16, 32, 32, 6)
    this.body.lineStyle(2, 0xffffff, 0.6)
    this.body.strokeRoundedRect(-16, -16, 32, 32, 6)
    this.container.add(this.body)

    // Icon text
    this.icon = scene.add.text(0, 0, this.config.icon, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    this.container.add(this.icon)

    // Floating animation
    scene.tweens.add({
      targets: this.container,
      y: y - 8,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    // Pulsing glow
    scene.tweens.add({
      targets: this.glow,
      alpha: 0.5,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })

    // Auto-expire timer
    this.expireTimer = scene.time.delayedCall(POWERUPS.lifetime, () => {
      this.startExpiration()
    })
  }

  startExpiration() {
    if (this.isExpiring) return
    this.isExpiring = true

    // Flash and shrink animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    })
  }

  collect(player) {
    if (this.isCollected || this.isExpiring) return
    this.isCollected = true

    // Cancel expiration timer
    if (this.expireTimer) {
      this.expireTimer.remove()
    }

    // Apply effect based on type
    this._applyEffect(player)

    // Collection animation
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    })

    // Show pickup text
    this._showPickupText()
  }

  _applyEffect(player) {
    switch (this.type) {
      case 'health':
        const healAmount = Math.min(this.config.healAmount, player.maxHealth - player.health)
        player.health = Math.min(player.maxHealth, player.health + healAmount)
        break

      case 'fullHeal':
        player.health = player.maxHealth
        break

      case 'shield':
        if (player.activateShield) player.activateShield(this.config.duration)
        break

      case 'damage':
        player.activeEffects = player.activeEffects || []
        player.activeEffects.push({
          type: 'damage',
          multiplier: this.config.damageMultiplier,
          endTime: this.scene.time.now + this.config.duration,
        })
        player.originalDamage = player.originalDamage || player.scene.combat.attackDamage
        player.scene.combat.attackDamage = player.originalDamage * this.config.damageMultiplier
        this.scene.time.delayedCall(this.config.duration, () => {
          if (player.scene?.combat) {
            player.scene.combat.attackDamage = player.originalDamage
          }
        })
        break

      case 'speed':
        player.activeEffects = player.activeEffects || []
        player.activeEffects.push({
          type: 'speed',
          multiplier: this.config.speedMultiplier,
          endTime: this.scene.time.now + this.config.duration,
        })
        player.originalSpeed = player.originalSpeed || player.speed
        player.speed = player.originalSpeed * this.config.speedMultiplier
        this.scene.time.delayedCall(this.config.duration, () => {
          if (player.originalSpeed !== undefined) {
            player.speed = player.originalSpeed
          }
        })
        break
    }
  }

  _showPickupText() {
    const pickupText = this.scene.add.text(
      this.container.x,
      this.container.y - 30,
      this.config.name,
      {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#' + this.config.color.toString(16).padStart(6, '0'),
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(50)

    this.scene.tweens.add({
      targets: pickupText,
      y: pickupText.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => pickupText.destroy(),
    })
  }

  getX() {
    return this.container.x
  }

  getY() {
    return this.container.y
  }

  destroy() {
    if (this.container?.active) this.container.destroy()
    if (this.glow?.active) this.glow.destroy()
    if (this.body?.active) this.body.destroy()
    if (this.icon?.active) this.icon.destroy()
  }
}
