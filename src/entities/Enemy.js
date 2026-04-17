import * as Phaser from 'phaser'

// ─── Enemy type definitions ────────────────────────────────────────────────
export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    health: 100,
    speed: 90,
    attackRange: 90,
    attackDamage: 10,
    attackCooldown: 1600,
    scoreValue: 1,
    eyeColor: 0xff9900,
    swordColor: 0xff4422,
    swordTip: 0xff8866,
    swordGuard: 0x880000,
    swordHandle: 0x330000,
    scale: 1,
  },
  runner: {
    name: 'Runner',
    health: 60,
    speed: 180,
    attackRange: 80,
    attackDamage: 8,
    attackCooldown: 1000,
    scoreValue: 1,
    eyeColor: 0x00ffcc,
    swordColor: 0xaa66ff,
    swordTip: 0xcc99ff,
    swordGuard: 0x442288,
    swordHandle: 0x220044,
    scale: 0.85,
  },
  tank: {
    name: 'Tank',
    health: 250,
    speed: 55,
    attackRange: 100,
    attackDamage: 20,
    attackCooldown: 2200,
    scoreValue: 2,
    eyeColor: 0xff4444,
    swordColor: 0x88aa44,
    swordTip: 0xaacc66,
    swordGuard: 0x334411,
    swordHandle: 0x1a2200,
    scale: 1.3,
  },
  elite: {
    name: 'Elite',
    health: 180,
    speed: 130,
    attackRange: 110,
    attackDamage: 15,
    attackCooldown: 1300,
    scoreValue: 3,
    eyeColor: 0xff0044,
    swordColor: 0xffdd44,
    swordTip: 0xffffff,
    swordGuard: 0x886600,
    swordHandle: 0x443300,
    scale: 1.1,
  },
}

// ─── Pool composition per wave number ──────────────────────────────────────
export function getPoolForWave(wave) {
  if (wave <= 2) return ['grunt']
  if (wave <= 4) return ['grunt', 'runner']
  if (wave <= 6) return ['grunt', 'runner', 'tank']
  if (wave <= 9) return ['grunt', 'runner', 'tank', 'elite']
  return ['grunt', 'runner', 'tank', 'elite', 'elite']
}

export class Enemy {
  constructor(scene, x, y, type) {
    this.scene = scene
    this.type = type || 'grunt'
    const stats = ENEMY_TYPES[this.type]

    this._initStats(stats)

    // this.sprite is the container — named "sprite" so EnemyPool references stay compatible
    this.sprite = this._buildBody(scene, x, y, stats)
    this.sword = this._buildSword(scene)
  }

  // ─── Init / Reset ──────────────────────────────────────────────────────────

  _initStats(stats) {
    this.health = stats.health
    this.maxHealth = stats.health
    this.isDead = false
    this._readyToPool = false
    this.facingRight = false
    this.walkSpeed = stats.speed
    this.attackRange = stats.attackRange
    this.attackDamage = stats.attackDamage
    this.attackCooldown = stats.attackCooldown
    this.lastAttackTime = 0
    this.isSwinging = false
    this.scoreValue = stats.scoreValue
    this.scored = false
  }

  // Called by EnemyPool to reuse a pooled enemy instead of creating a new one
  reset(scene, x, y, type) {
    this.type = type
    const stats = ENEMY_TYPES[type]
    this._initStats(stats)

    // Reposition and re-enable the container
    this.sprite.setPosition(x, y)
    this.sprite.setAlpha(1)
    this.sprite.setVisible(true)
    this.sprite.scaleX = stats.scale
    this.sprite.scaleY = stats.scale
    this.sprite.body.enable = true
    this.sprite.body.reset(x, y)

    // Restore limb poses
    this._head.angle  = 0;  this._head.y  = -35
    this._torso.angle = 0;  this._torso.y = -10
    this._leftArm.angle  = 0;  this._leftArm.y  = -20
    this._rightArm.angle = 0;  this._rightArm.y = -20
    this._leftLeg.angle  = 0;  this._leftLeg.y  = 5
    this._rightLeg.angle = 0;  this._rightLeg.y = 5
    this._eye.fillColor = stats.eyeColor

    // Rebuild or show sword
    if (!this.sword || !this.sword.active) {
      this.sword = this._buildSword(scene)
    } else {
      this._drawSword(this.sword)
      this.sword.setVisible(true)
      this.sword.setAlpha(1)
    }
  }

  // ─── Build ─────────────────────────────────────────────────────────────────

  _buildBody(scene, x, y, stats) {
    const container = scene.add.container(x, y)
    scene.physics.add.existing(container)
    container.body.setCollideWorldBounds(true)
    container.setScale(stats.scale)

    const color = 0x111111

    this._head     = scene.add.circle(0, -35, 10, color)
    this._eye      = scene.add.circle(5, -37, 3, stats.eyeColor)
    this._torso    = scene.add.rectangle(0, -10, 10, 30, color)
    this._leftArm  = scene.add.rectangle(-8, -20, 6, 25, color)
    this._leftArm.setOrigin(0.5, 0)
    this._rightArm = scene.add.rectangle(8, -20, 6, 25, color)
    this._rightArm.setOrigin(0.5, 0)
    this._leftLeg  = scene.add.rectangle(-4, 5, 8, 30, color)
    this._leftLeg.setOrigin(0.5, 0)
    this._rightLeg = scene.add.rectangle(4, 5, 8, 30, color)
    this._rightLeg.setOrigin(0.5, 0)

    container.add([
      this._leftArm, this._leftLeg, this._torso,
      this._head, this._eye, this._rightArm, this._rightLeg,
    ])

    container.body.setSize(20, 75)
    container.body.setOffset(-10, -45)

    return container
  }

  _buildSword(scene) {
    const s = scene.add.graphics()
    s.setDepth(6)
    this._drawSword(s)
    return s
  }

  _drawSword(s) {
    s.clear()
    const stats = ENEMY_TYPES[this.type]
    const sc = stats.scale

    s.fillStyle(stats.swordColor)
    s.fillRect(-3 * sc, -38 * sc, 6 * sc, 38 * sc)
    s.fillStyle(stats.swordTip)
    s.fillTriangle(-3 * sc, -38 * sc, 3 * sc, -38 * sc, 0, -50 * sc)
    s.fillStyle(stats.swordTip)
    s.fillRect(1 * sc, -38 * sc, 2 * sc, 38 * sc)
    s.fillStyle(stats.swordGuard)
    s.fillRect(-8 * sc, 0, 16 * sc, 5 * sc)
    s.fillTriangle(-8 * sc, 0, -12 * sc, -6 * sc, -8 * sc, -6 * sc)
    s.fillTriangle(8 * sc, 0, 12 * sc, -6 * sc, 8 * sc, -6 * sc)
    s.fillStyle(stats.swordHandle)
    s.fillRect(-3 * sc, 5 * sc, 6 * sc, 12 * sc)
    s.fillStyle(stats.swordColor)
    s.fillCircle(0, 17 * sc, 4 * sc)
  }

  // ─── Damage & Death ────────────────────────────────────────────────────────

  takeDamage(amount) {
    if (this.isDead) return
    this.health -= amount
    this._playHitReaction()
    if (this.health <= 0) this.die()
  }

  _playHitReaction() {
    if (!this.sprite?.active) return

    // Head snaps back
    const headRecoil = this.facingRight ? 20 : -20
    this._head.angle = headRecoil
    this.scene.tweens.add({
      targets: this._head,
      angle: 0,
      duration: 220,
      ease: 'Elastic.easeOut',
    })

    // Torso leans back
    const torsoRecoil = this.facingRight ? 14 : -14
    this._torso.angle = torsoRecoil
    this.scene.tweens.add({
      targets: this._torso,
      angle: 0,
      duration: 200,
      ease: 'Back.easeOut',
    })
  }

  die() {
    this.isDead = true
    this._readyToPool = false
    this.sprite.body.setVelocityX(0)
    this.sprite.body.enable = false
    if (this.sword?.active) this.sword.setVisible(false)

    // Each limb collapses with a random rotation and downward shift
    const limbs = [
      this._head, this._torso,
      this._leftArm, this._rightArm,
      this._leftLeg, this._rightLeg,
    ]
    limbs.forEach((limb, i) => {
      this.scene.tweens.add({
        targets: limb,
        angle: Phaser.Math.Between(-85, 85),
        y: limb.y + Phaser.Math.Between(8, 26),
        duration: 380,
        ease: 'Power2',
        delay: i * 25,
      })
    })

    // Whole container fades and drops — signal pool when done
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y + 22,
      duration: 460,
      delay: 90,
      onComplete: () => { this._readyToPool = true },
    })
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update(player) {
    if (this.isDead || !this.sprite.active) return
    if (!player || player.isDead) {
      this.sprite.body.setVelocityX(0)
      this._placeSword()
      return
    }

    const dx = player.x - this.sprite.x
    const dist = Math.abs(dx)
    this.facingRight = dx > 0

    // Flip container by mirroring scaleX
    const sc = ENEMY_TYPES[this.type].scale
    this.sprite.scaleX = this.facingRight ? sc : -sc

    if (dist > this.attackRange) {
      this.sprite.body.setVelocityX(Math.sign(dx) * this.walkSpeed)
    } else {
      this.sprite.body.setVelocityX(0)
      const now = this.scene.time.now
      if (now - this.lastAttackTime > this.attackCooldown) {
        this.lastAttackTime = now
        this._swingSword()
        // Delay damage to the sword's visual midpoint (~75ms into the 150ms swing)
        this.scene.time.delayedCall(75, () => {
          if (!this.isDead && player && !player.isDead && !this.scene.isPaused) {
            player.takeDamage(this.attackDamage)
          }
        })
      }
    }

    this._placeSword()
  }

  _placeSword() {
    if (!this.sword?.active) return
    const stats = ENEMY_TYPES[this.type]
    const f = this.facingRight ? 1 : -1
    const sc = stats.scale
    this.sword.x = this.sprite.x + f * 26 * sc
    this.sword.y = this.sprite.y - 16 * sc
    if (!this.isSwinging) this.sword.angle = 0
  }

  _swingSword() {
    if (this.isSwinging) return
    this.isSwinging = true
    const stats = ENEMY_TYPES[this.type]
    const sc = stats.scale
    const swingAngle = this.facingRight ? 82 * sc : -82 * sc
    this.scene.tweens.add({
      targets: this.sword,
      angle: swingAngle,
      duration: 150,
      ease: 'Power3',
      yoyo: true,
      onComplete: () => { this.isSwinging = false },
    })
  }
}
