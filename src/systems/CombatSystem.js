import * as Phaser from 'phaser'
import { COMBAT } from '../config/gameConfig.js'

export class CombatSystem {
  constructor(scene) {
    this.scene = scene
    this.attackRange = COMBAT.attackRange
    this.attackDamage = COMBAT.attackDamage
    this.knockbackX = COMBAT.knockbackX
    this.knockbackY = COMBAT.knockbackY
    this.isHitStopping = false
  }

  hitStop(duration = COMBAT.swordHitstop) {
    if (this.isHitStopping) return
    this.isHitStopping = true

    this.scene.physics.world.pause()
    this.scene.tweens.pauseAll()

    this.scene.time.delayedCall(duration, () => {
      this.scene.physics.world.resume()
      this.scene.tweens.resumeAll()
      this.isHitStopping = false
    })
  }

  playerAttack(player, enemies) {
    let hitAny = false

    enemies.forEach(enemy => {
      if (enemy.isDead) return

      const dist = Phaser.Math.Distance.Between(
        player.x, player.y,
        enemy.sprite.x, enemy.sprite.y
      )

      if (dist < this.attackRange) {
        enemy.takeDamage(this.attackDamage)

        const dir = enemy.sprite.x > player.x ? 1 : -1
        enemy.sprite.body.setVelocityX(this.knockbackX * dir)
        enemy.sprite.body.setVelocityY(this.knockbackY)

        if (this.scene.effects) {
          this.scene.effects.hitEffect(
            (player.x + enemy.sprite.x) / 2,
            player.y - 20,
            dir
          )
        }

        // Floating damage number
        this._showDamageNumber(enemy.sprite.x, enemy.sprite.y - 40, this.attackDamage)

        hitAny = true
      }
    })

    if (hitAny) {
      this.hitStop()
    }
  }

  _showDamageNumber(x, y, damage) {
    // Color by magnitude
    let color, size
    if (damage >= 100) {
      color = '#ff4444'
      size = '24px'
    } else if (damage >= 50) {
      color = '#ffaa22'
      size = '20px'
    } else {
      color = '#ffffff'
      size = '16px'
    }

    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontSize: size,
      fontFamily: 'monospace',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50)

    // Pop in, float up, fade out
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }
}
