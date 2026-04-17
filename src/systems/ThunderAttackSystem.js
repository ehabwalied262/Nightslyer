import * as Phaser from 'phaser'
import { THUNDER } from '../config/gameConfig.js'

export class ThunderAttackSystem {
  constructor(scene) {
    this.scene = scene
    this.isReady = true
    this.lastUsed = 0
  }

  attack(player, enemies) {
    if (!this.isReady) return false

    const now = this.scene.time.now
    if (now - this.lastUsed < THUNDER.cooldown) return false

    this.isReady = false
    this.lastUsed = now

    this.scene.time.delayedCall(THUNDER.cooldown, () => {
      this.isReady = true
    })

    const direction = player.scaleX >= 0 ? 1 : -1
    const strikeX = player.x + direction * 80
    const strikeY = player.y

    this._damageEnemies(strikeX, strikeY, enemies)
    this._createLightningStrike(strikeX, strikeY)
    this.scene.cameras.main.shake(THUNDER.screenShakeDuration, THUNDER.screenShakeIntensity)

    return true
  }

  _createLightningStrike(targetX, targetY) {
    const scene = this.scene
    const boltWidth = 60
    const skyStart = -20
    const groundEnd = targetY + 60

    // ─── MAIN BOLT ──────────────────────────────────────────────────────────
    const mainBolt = scene.add.graphics().setDepth(20)

    // Draw jagged lightning from sky to ground
    const segments = 15
    const segH = (groundEnd - skyStart) / segments
    const boltPoints = []

    boltPoints.push({ x: targetX, y: skyStart })

    for (let i = 1; i < segments; i++) {
      const y = skyStart + i * segH
      const xOff = Phaser.Math.Between(-30, 30)
      boltPoints.push({ x: targetX + xOff, y })
    }
    boltPoints.push({ x: targetX, y: groundEnd })

    // Outer glow (wide, dim)
    mainBolt.lineStyle(24, 0x4466ff, 0.15)
    this._drawBoltPath(mainBolt, boltPoints)

    // Mid glow
    mainBolt.lineStyle(12, 0x6688ff, 0.4)
    this._drawBoltPath(mainBolt, boltPoints)

    // Core bolt (bright white-blue)
    mainBolt.lineStyle(5, 0xeeeeff, 0.9)
    this._drawBoltPath(mainBolt, boltPoints)

    // Inner core (pure white)
    mainBolt.lineStyle(2, 0xffffff, 1)
    this._drawBoltPath(mainBolt, boltPoints)

    // ─── BRANCH BOLTS ──────────────────────────────────────────────────────
    for (let b = 0; b < 4; b++) {
      const branchStart = Phaser.Math.Between(2, 10)
      const branchLen = Phaser.Math.Between(3, 6)
      const dir = Phaser.Math.Between(0, 1) ? 1 : -1
      const branch = scene.add.graphics().setDepth(19)
      branch.lineStyle(2, 0x8899ff, 0.5)

      let bx = boltPoints[branchStart].x
      let by = boltPoints[branchStart].y

      branch.moveTo(bx, by)
      for (let i = 0; i < branchLen; i++) {
        bx += Phaser.Math.Between(15, 40) * dir
        by += segH * Phaser.Math.Between(1, 2)
        branch.lineTo(bx, by)
      }
      branch.strokePath()
    }

    // ─── GROUND IMPACT RING ────────────────────────────────────────────────
    const impactRing = scene.add.circle(targetX, targetY + 40, 5, 0xaaddff, 0)
      .setDepth(18)

    scene.tweens.add({
      targets: impactRing,
      scaleX: 8,
      scaleY: 1.5,
      alpha: 0.6,
      duration: 200,
      ease: 'Power2',
      yoyo: true,
    })

    // ─── ELECTRIC SPARKS ───────────────────────────────────────────────────
    for (let s = 0; s < 12; s++) {
      const spark = scene.add.circle(
        targetX + Phaser.Math.Between(-40, 40),
        targetY + Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(1, 3),
        0xffffff,
        1
      ).setDepth(22)

      scene.tweens.add({
        targets: spark,
        x: targetX + Phaser.Math.Between(-80, 80),
        y: targetY + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: Phaser.Math.Between(200, 500),
        onComplete: () => spark.destroy(),
      })
    }

    // ─── SCREEN FLASH ──────────────────────────────────────────────────────
    const flash1 = scene.add.graphics().setDepth(100)
    flash1.fillStyle(0xffffff, 0.5)
    flash1.fillRect(0, 0, scene.scale.width, scene.scale.height)

    const flash2 = scene.add.graphics().setDepth(100)
    flash2.fillStyle(0x88aaff, 0.3)
    flash2.fillRect(0, 0, scene.scale.width, scene.scale.height)

    scene.tweens.add({
      targets: [flash1, flash2],
      alpha: 0,
      duration: 250,
      onComplete: () => {
        flash1.destroy()
        flash2.destroy()
      },
    })

    // ─── DESTROY BOLT AFTER DELAY ──────────────────────────────────────────
    scene.tweens.add({
      targets: mainBolt,
      alpha: 0,
      duration: 400,
      delay: 150,
      onComplete: () => mainBolt.destroy(),
    })
  }

  _drawBoltPath(graphics, points) {
    graphics.beginPath()
    graphics.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y)
    }
    graphics.strokePath()
  }

  _damageEnemies(strikeX, strikeY, enemies) {
    const halfWidth = THUNDER.width / 2

    for (const enemy of enemies) {
      if (enemy.isDead || !enemy.sprite.body?.enable) continue

      const dist = Phaser.Math.Distance.Between(
        enemy.sprite.x, enemy.sprite.y,
        strikeX, strikeY
      )

      if (dist < halfWidth) {
        enemy.takeDamage(THUNDER.damage)
        enemy.sprite.body.setVelocityX(
          Phaser.Math.Sign(strikeX - enemy.sprite.x) * THUNDER.knockbackX
        )
        enemy.sprite.body.setVelocityY(-THUNDER.knockbackUp)

        // Floating damage number
        this._showDamageNumber(enemy.sprite.x, enemy.sprite.y - 40, THUNDER.damage)

        // Electric flash — apply tint to each limb child
        enemy.sprite.alpha = 0.7
        enemy.sprite.list?.forEach(child => child.setTint?.(0x88aaff))

        this.scene.time.delayedCall(100, () => {
          if (enemy.sprite?.active && !enemy.isDead) {
            enemy.sprite.alpha = 1
            enemy.sprite.list?.forEach(child => child.clearTint?.())
          }
        })
      }
    }
  }

  _showDamageNumber(x, y, damage) {
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

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  destroy() {}
}
