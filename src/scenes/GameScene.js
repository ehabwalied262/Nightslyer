import * as Phaser from 'phaser'
import { Player } from '../entities/Player.js'
import { Enemy, ENEMY_TYPES, getPoolForWave } from '../entities/Enemy.js'
import { CombatSystem } from '../systems/CombatSystem.js'
import { EffectsSystem } from '../systems/EffectsSystem.js'
import { EnemyPool } from '../systems/EnemyPool.js'
import { PowerUpSystem } from '../systems/PowerUpSystem.js'
import { ThunderAttackSystem } from '../systems/ThunderAttackSystem.js'
import { POWERUPS } from '../config/gameConfig.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  init(data) {
    this.score = data.score || 0
    this.kills = 0
    this._prevHUDState = null
  }

  create() {
    this.wave = 1
    this.spawningNextWave = false
    this.isPaused = false

    this._buildBackground()
    this._buildGround()

    this.player = new Player(this, 200, 520)
    this.combat = new CombatSystem(this)
    this.effects = new EffectsSystem(this)
    this.enemyPool = new EnemyPool(this)
    this.powerUpSystem = new PowerUpSystem(this)
    this.thunderSystem = new ThunderAttackSystem(this)

    // Start background music
    this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.4 })
    this.bgMusic.play()

    this.enemies = this._spawnWave(this.wave)

    this.physics.add.collider(this.player, this.ground)

    // Launch UIScene for HUD overlay and store reference
    this.scene.launch('UIScene', { mode: 'hud', score: this.score, wave: this.wave, gameScene: this.scene.key })
    this.uiScene = this.scene.get('UIScene')

    // Pause keys owned by the scene so they always work regardless of player state
    this._pauseKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this._pauseKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
  }

  // ─── Background ───────────────────────────────────────────────────────────

  _buildBackground() {
    const W = 1280, H = 720
    const bg = this.add.graphics().setDepth(-20)

    // Sky bands — deep purple → dark navy at horizon
    const bands = [
      [0, 0x06031a],
      [100, 0x0a0628],
      [220, 0x0f0a32],
      [340, 0x130d3a],
      [460, 0x180f3e],
      [560, 0x1d1045],
    ]
    bands.forEach(([y, c], i) => {
      const nextY = bands[i + 1] ? bands[i + 1][0] : H
      bg.fillStyle(c)
      bg.fillRect(0, y, W, nextY - y + 1)
    })

    // Moon glow (soft outer ring)
    bg.fillStyle(0x2a1a60, 0.6)
    bg.fillCircle(1090, 110, 72)
    bg.fillStyle(0x3a2878)
    bg.fillCircle(1090, 110, 58)
    // Moon body
    bg.fillStyle(0xfff8e0)
    bg.fillCircle(1090, 110, 46)
    // Craters
    bg.fillStyle(0xe8e0c0)
    bg.fillCircle(1074, 98, 10)
    bg.fillCircle(1102, 118, 7)
    bg.fillCircle(1082, 125, 5)

    // Stars
    const rng = new Phaser.Math.RandomDataGenerator(['nightsky'])
    bg.fillStyle(0xffffff)
    for (let i = 0; i < 120; i++) {
      const sx = rng.integerInRange(0, W)
      const sy = rng.integerInRange(0, 520)
      const r = rng.realInRange(0.5, 1.8)
      bg.fillCircle(sx, sy, r)
    }

    // Twinkling bright stars (larger)
    const bright = [
      [60, 70], [200, 40], [380, 90], [510, 25], [670, 60],
      [820, 35], [940, 80], [1030, 55], [1180, 95], [300, 160],
      [750, 140], [1150, 40], [430, 200], [870, 180]
    ]
    bright.forEach(([x, y]) => {
      bg.fillStyle(0xffffff)
      bg.fillCircle(x, y, 2)
      bg.fillStyle(0xaaaaff, 0.4)
      bg.fillCircle(x, y, 4)
    })

    // Back mountains (darkest silhouette)
    bg.fillStyle(0x0d0928)
    this._triangle(bg, 0, 580, 220, 350, 440, 580)
    this._triangle(bg, 200, 580, 460, 310, 680, 580)
    this._triangle(bg, 500, 580, 730, 265, 960, 580)
    this._triangle(bg, 780, 580, 1020, 300, 1240, 580)
    this._triangle(bg, 1050, 580, 1200, 330, 1280, 580)

    // Mid mountains (slightly lighter)
    bg.fillStyle(0x131042)
    this._triangle(bg, 0, 590, 180, 400, 380, 590)
    this._triangle(bg, 240, 590, 450, 370, 660, 590)
    this._triangle(bg, 500, 590, 720, 355, 940, 590)
    this._triangle(bg, 780, 590, 1000, 375, 1200, 590)
    this._triangle(bg, 1050, 590, 1180, 395, 1280, 590)

    // Ground color under the platform
    bg.fillStyle(0x0a1a06)
    bg.fillRect(0, 628, W, H - 628)
  }

  _triangle(g, x1, y1, mx, my, x2, y2) {
    g.fillTriangle(x1, y1, mx, my, x2, y2)
  }

  // ─── Ground ───────────────────────────────────────────────────────────────

  _buildGround() {
    // Ground center at y=648 → top at y=628
    this.ground = this.physics.add.staticSprite(640, 648, 'ground')
  }

  // ─── Wave spawning ────────────────────────────────────────────────────────

  _spawnWave(wave) {
    const count = wave + 1
    const pool = getPoolForWave(wave)
    const enemies = []
    for (let i = 0; i < count; i++) {
      const x = 750 + i * 210
      const type = Phaser.Utils.Array.GetRandom(pool)
      const e = this.enemyPool.get(type, x, 520)
      enemies.push(e)
    }
    this._showWaveBanner(wave)
    return enemies
  }

  _showWaveBanner(wave) {
    const cx = this.scale.width / 2
    const txt = this.add.text(cx, 320, `⚔  WAVE  ${wave}  ⚔`, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      stroke: '#1a0050',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(30).setAlpha(0)

    this.tweens.add({
      targets: txt,
      alpha: 1,
      y: 300,
      duration: 280,
      ease: 'Back.Out',
      hold: 700,
      yoyo: true,
      onComplete: () => txt.destroy()
    })
  }

  // ─── Update loop ──────────────────────────────────────────────────────────

  _togglePause() {
    this.isPaused = !this.isPaused

    if (this.isPaused) {
      this.physics.world.pause()
      this.tweens.pauseAll()
      this.bgMusic?.pause()
      this.uiScene?.showPause()
    } else {
      this.physics.world.resume()
      this.tweens.resumeAll()
      this.bgMusic?.resume()
      this.uiScene?.hidePause()
    }
  }

  update() {
    // Pause toggle — checked every frame, even while paused
    if (Phaser.Input.Keyboard.JustDown(this._pauseKey1) ||
        Phaser.Input.Keyboard.JustDown(this._pauseKey2)) {
      this._togglePause()
    }

    if (this.isPaused) return

    const activeEnemies = this.enemyPool.getActive()
    this.player.update(this.combat, activeEnemies, this.thunderSystem)
    this.powerUpSystem.update(this.player)
    activeEnemies.forEach(e => e.update(this.player))
    this._checkWave()
    this._checkGameOver()
    this._pushHUDUpdate()
  }

  _pushHUDUpdate() {
    if (!this.uiScene?.updateHUD) return
    const state = {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      wave: this.wave,
      score: this.score,
      lives: this.player.lives,
    }
    if (this._prevHUDState && JSON.stringify(state) === JSON.stringify(this._prevHUDState)) return
    this._prevHUDState = state

    this.uiScene.updateHUD(state.health, state.maxHealth)
    this.uiScene.updateWaveText(state.wave)
    this.uiScene.updateScoreText(state.score)
    this.uiScene.updateLivesText(state.lives)

    // Update thunder cooldown
    if (this.uiScene.updateThunderCooldown && this.thunderSystem) {
      this.uiScene.updateThunderCooldown(this.thunderSystem.isReady)
    }

    // Update active effects display
    if (this.uiScene.updateActiveEffects && this.player.activeEffects) {
      // Clean up expired effects
      this.player.activeEffects = this.player.activeEffects.filter(e => this.time.now < e.endTime)

      const effectsData = this.player.activeEffects.map(e => ({
        type: e.type,
        icon: POWERUPS.types[e.type]?.icon || '?',
        color: POWERUPS.types[e.type]?.color || 0xffffff,
        endTime: e.endTime,
      }))
      this.uiScene.updateActiveEffects(effectsData)
    }
  }

  _triggerGameOver() {
    if (this._gameOverTriggered) return
    this._gameOverTriggered = true
    this.powerUpSystem.clearAll()
    this.bgMusic?.stop()
    this.scene.stop('UIScene')
    this.scene.launch('UIScene', { mode: 'gameover', score: this.score, wave: this.wave, kills: this.kills, lives: this.player.lives })
    this.scene.pause()
  }

  _checkGameOver() {
    // Lives system handles game over in Player.die()
  }

  _checkWave() {
    if (this.spawningNextWave) return

    // Clean up dead enemies and return them to pool
    this.enemyPool.cleanup()

    // Score for newly killed enemies
    const activeEnemies = this.enemyPool.getActive()
    const newKills = this.enemies.filter(e => e.isDead && !e.scored)
    if (newKills.length > 0) {
      newKills.forEach(e => {
        this.score += e.scoreValue * this.wave * 10
        this.kills++
        e.scored = true
      })
      this._pushHUDUpdate()
    }

    if (activeEnemies.length === 0) {
      this.spawningNextWave = true
      this.wave++
      this.time.delayedCall(1600, () => {
        this.enemies = this._spawnWave(this.wave)
        this.spawningNextWave = false
        this._pushHUDUpdate()
      })
    }
  }
}
