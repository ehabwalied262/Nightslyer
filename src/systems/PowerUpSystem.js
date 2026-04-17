import * as Phaser from 'phaser'
import { PowerUp } from '../entities/PowerUp.js'
import { POWERUPS } from '../config/gameConfig.js'

export class PowerUpSystem {
  constructor(scene) {
    this.scene = scene
    this.activePowerUps = []
    this.spawnTimer = null
    this.isRunning = false

    this._startSpawning()
  }

  _startSpawning() {
    this.isRunning = true
    this._scheduleNextSpawn()
  }

  _scheduleNextSpawn() {
    if (!this.isRunning) return

    const delay = Phaser.Math.Between(POWERUPS.spawnInterval.min, POWERUPS.spawnInterval.max)
    this.spawnTimer = this.scene.time.delayedCall(delay, () => {
      this._spawnPowerUp()
      this._scheduleNextSpawn()
    })
  }

  _spawnPowerUp() {
    if (!this.isRunning) return

    const player = this.scene.player
    const isLowHealth = player && player.health < player.maxHealth * 0.5

    // Build weighted pool from config spawnWeights
    const pool = []
    for (const [type, config] of Object.entries(POWERUPS.types)) {
      const weight = config.spawnWeight ?? 1
      for (let i = 0; i < weight; i++) pool.push(type)
    }

    // When below 50% HP, add extra health/fullHeal entries to bias the roll
    if (isLowHealth) {
      pool.push('health', 'health', 'fullHeal')
    }

    const type = Phaser.Utils.Array.GetRandom(pool)
    const x    = Phaser.Math.Between(POWERUPS.xRange.min, POWERUPS.xRange.max)

    const powerUp = new PowerUp(this.scene, x, POWERUPS.yPosition, type)
    this.activePowerUps.push(powerUp)
  }

  update(player) {
    if (!player || player.isDead) return

    // Clean up collected/destroyed power-ups
    this.activePowerUps = this.activePowerUps.filter(p => p.container?.active)

    // Check collision with player
    for (const powerUp of this.activePowerUps) {
      if (powerUp.isCollected || powerUp.isExpiring) continue

      const dist = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        powerUp.getX(),
        powerUp.getY()
      )

      // Collect when player is close (30px radius)
      if (dist < 50) {
        powerUp.collect(player)
      }
    }
  }

  stop() {
    this.isRunning = false
    if (this.spawnTimer) {
      this.spawnTimer.remove()
    }
  }

  clearAll() {
    this.stop()
    for (const powerUp of this.activePowerUps) {
      powerUp.destroy()
    }
    this.activePowerUps = []
  }
}
