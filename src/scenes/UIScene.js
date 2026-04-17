import * as Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene')
  }

  init(data) {
    this.mode = data.mode || 'menu'  // 'menu' | 'gameover' | 'hud'
    this.score = data.score || 0
    this.wave = data.wave || 1
    this.kills = data.kills || 0
    this.lives = data.lives || 0
  }

  create() {
    if (this.mode === 'menu') {
      this._showMenu()
    } else if (this.mode === 'gameover') {
      this._showGameOver()
    } else if (this.mode === 'hud') {
      this._buildHUD()
    }
  }

  // ─── Main Menu ──────────────────────────────────────────────────────────

  _showMenu() {
    const W = this.scale.width, H = this.scale.height

    // Darken background
    this.add.graphics()
      .fillStyle(0x0a0520)
      .fillRect(0, 0, W, H)

    // Title
    this.add.text(W / 2, H / 2 - 140, 'NIGHTSLAYER', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      stroke: '#1a0050',
      strokeThickness: 12,
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(W / 2, H / 2 - 80, '⚔  Survive the endless night  ⚔', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#8888bb',
    }).setOrigin(0.5)

    // Start button
    this._createButton(W / 2, H / 2 + 10, 'START GAME', () => {
      this.scene.start('GameScene', { uiScene: this.scene.key })
    })

    // Controls info
    const controls = [
      'Movement : Arrow Keys / WASD',
      'Jump     : ↑ / W / Space',
      'Attack   : Z',
      'Pause    : ESC / P',
    ]

    controls.forEach((line, i) => {
      this.add.text(W / 2, H / 2 + 80 + i * 30, line, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#666699',
      }).setOrigin(0.5)
    })

    // Version tag
    this.add.text(W - 20, H - 16, 'v0.1.0', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#333355',
    }).setOrigin(1, 0)
  }

  // ─── Game Over ──────────────────────────────────────────────────────────

  _showGameOver() {
    const W = this.scale.width, H = this.scale.height

    // Overlay
    this.add.graphics()
      .fillStyle(0x000000, 0.75)
      .fillRect(0, 0, W, H)

    // Title
    const title = this.kills > 0 || this.wave > 1 ? 'GAME OVER' : 'YOU DIED'
    this.add.text(W / 2, H / 2 - 100, title, {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ff3344',
      stroke: '#1a0050',
      strokeThickness: 10,
    }).setOrigin(0.5)

    // Stats
    this.add.text(W / 2, H / 2 - 30, `Waves Survived: ${this.wave}`, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffdd44',
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 + 10, `Enemies Slain: ${this.kills}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#8888bb',
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 + 40, `Lives Remaining: ${this.lives}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ff4466',
    }).setOrigin(0.5)

    // Retry button
    this._createButton(W / 2, H / 2 + 50, 'TRY AGAIN', () => {
      this.scene.start('GameScene', { uiScene: this.scene.key })
    })

    // Menu button
    this._createButton(W / 2, H / 2 + 110, 'MAIN MENU', () => {
      this.scene.start('BootScene')
    }, 0.7)

    // Space to restart
    this.add.text(W / 2, H / 2 + 160, 'Press  SPACE  to play again', {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: '#555577',
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene')
    })
  }

  // ─── Button Factory ─────────────────────────────────────────────────────

  _createButton(x, y, text, onClick, scale = 1) {
    const fontSize = Math.floor(24 * scale)

    const bg = this.add.graphics()
    const rectW = 280 * scale, rectH = 52 * scale

    // Button bg
    bg.fillStyle(0x2a1a60, 0.9)
    bg.fillRect(x - rectW / 2, y - rectH / 2, rectW, rectH)
    bg.lineStyle(2, 0xffdd44, 0.8)
    bg.strokeRect(x - rectW / 2, y - rectH / 2, rectW, rectH)

    const label = this.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'monospace',
      color: '#ffdd44',
    }).setOrigin(0.5)

    // Hover effect
    const container = this.add.container(x, y, [bg, label])
      .setSize(rectW, rectH)
      .setInteractive()
      .on('pointerover', () => {
        bg.clear()
        bg.fillStyle(0x3a2a80, 0.95)
        bg.fillRect(-rectW / 2, -rectH / 2, rectW, rectH)
        bg.lineStyle(2, 0xffffff, 1)
        bg.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH)
        this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100 })
      })
      .on('pointerout', () => {
        bg.clear()
        bg.fillStyle(0x2a1a60, 0.9)
        bg.fillRect(-rectW / 2, -rectH / 2, rectW, rectH)
        bg.lineStyle(2, 0xffdd44, 0.8)
        bg.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH)
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 })
      })
      .on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scaleX: 0.95, scaleY: 0.95,
          duration: 60, yoyo: true,
          onComplete: onClick
        })
      })
  }

  // ─── Pause Overlay ──────────────────────────────────────────────────────

  _buildPauseOverlay() {
    const W = this.scale.width, H = this.scale.height

    // Dark vignette overlay
    this.pauseOverlay = this.add.graphics()
      .setScrollFactor(0).setDepth(200).setAlpha(0)
    this.pauseOverlay.fillStyle(0x000000, 0.65)
    this.pauseOverlay.fillRect(0, 0, W, H)

    // Glowing panel behind the text
    this.pausePanel = this.add.graphics()
      .setScrollFactor(0).setDepth(201).setAlpha(0)
    this.pausePanel.fillStyle(0x1a0a40, 0.92)
    this.pausePanel.fillRoundedRect(W / 2 - 200, H / 2 - 80, 400, 160, 18)
    this.pausePanel.lineStyle(2, 0x9966ff, 0.9)
    this.pausePanel.strokeRoundedRect(W / 2 - 200, H / 2 - 80, 400, 160, 18)
    // Inner accent line
    this.pausePanel.lineStyle(1, 0xffdd44, 0.25)
    this.pausePanel.strokeRoundedRect(W / 2 - 194, H / 2 - 74, 388, 148, 14)

    // Main "PAUSED" title
    this.pauseTitle = this.add.text(W / 2, H / 2 - 28, 'PAUSED', {
      fontSize: '62px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffdd44',
      stroke: '#3a0080',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#cc88ff', blur: 18, fill: true },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0)

    // Hint line
    this.pauseHint = this.add.text(W / 2, H / 2 + 42, 'Press  ESC  or  P  to continue', {
      fontSize: '17px',
      fontFamily: 'monospace',
      color: '#9988cc',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0)

    this._pauseVisible = false
  }

  showPause() {
    if (this._pauseVisible) return
    this._pauseVisible = true

    // Kill any in-flight hide tweens
    this.tweens.killTweensOf([
      this.pauseOverlay, this.pausePanel, this.pauseTitle, this.pauseHint
    ])

    // Fade in overlay + panel
    this.tweens.add({
      targets: [this.pauseOverlay, this.pausePanel],
      alpha: 1,
      duration: 180,
      ease: 'Power2',
    })

    // Title pops in from slightly above with scale punch
    this.pauseTitle.setAlpha(0).setScale(0.7).setY(this.scale.height / 2 - 38)
    this.tweens.add({
      targets: this.pauseTitle,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: this.scale.height / 2 - 28,
      duration: 220,
      ease: 'Back.Out',
      delay: 60,
    })

    // Hint fades in after title
    this.pauseHint.setAlpha(0)
    this.tweens.add({
      targets: this.pauseHint,
      alpha: 1,
      duration: 200,
      ease: 'Power1',
      delay: 180,
    })
  }

  hidePause() {
    if (!this._pauseVisible) return
    this._pauseVisible = false

    this.tweens.killTweensOf([
      this.pauseOverlay, this.pausePanel, this.pauseTitle, this.pauseHint
    ])

    this.tweens.add({
      targets: [this.pauseOverlay, this.pausePanel, this.pauseTitle, this.pauseHint],
      alpha: 0,
      duration: 160,
      ease: 'Power2',
    })
  }

  // ─── HUD ────────────────────────────────────────────────────────────────

  _buildHUD() {
    const pad = 22, fullW = 200

    // HP label
    this.hpLabel = this.add.text(pad, pad - 17, 'HP', {
      fontSize: '13px', color: '#88aacc', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(100)

    // Lives display
    this.livesText = this.add.text(pad + fullW + 30, pad - 17, '♥ 3', {
      fontSize: '16px', color: '#ff4466', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(100)

    // HP bar backgrounds
    this.hudBg = this.add.graphics().setScrollFactor(0).setDepth(98)
    this.hudBg.fillStyle(0x000000, 0.6)
    this.hudBg.fillRect(pad, pad, fullW + 4, 20)
    this.hudBg.lineStyle(1, 0x4466aa, 0.8)
    this.hudBg.strokeRect(pad, pad, fullW + 4, 20)

    // HP bar fill — use Rectangle (reliable, no clear/redraw needed)
    this.hudRect = this.add.rectangle(
      pad + 2, pad + 2, fullW, 16, 0x22ee44, 1
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(99)

    // Wave counter
    this.waveText = this.add.text(this.scale.width - pad, pad - 17, 'Wave 1', {
      fontSize: '14px', color: '#ffdd44', fontFamily: 'monospace'
    }).setScrollFactor(0).setOrigin(1, 0).setDepth(100)

    // Score
    this.scoreText = this.add.text(this.scale.width / 2, pad - 17, 'Score: 0', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace'
    }).setScrollFactor(0).setOrigin(0.5, 0).setDepth(100)

    // Active power-ups display area
    this.activeEffectsContainer = this.add.container(0, pad + 30).setScrollFactor(0).setDepth(100)
    this.activeEffects = []

    // Thunder attack cooldown indicator
    const thunderX = this.scale.width - pad - 60
    const thunderY = pad + 28
    this.thunderBg = this.add.graphics().setScrollFactor(0).setDepth(98)
    this.thunderBg.fillStyle(0x000000, 0.6)
    this.thunderBg.fillRect(thunderX - 4, thunderY - 4, 48, 48)
    this.thunderBg.lineStyle(2, 0x6688ff, 0.8)
    this.thunderBg.strokeRect(thunderX - 4, thunderY - 4, 48, 48)

    this.thunderIcon = this.add.text(thunderX + 20, thunderY + 18, '⚡', {
      fontSize: '28px',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setOrigin(0.5).setDepth(99)

    this.thunderOverlay = this.add.graphics().setScrollFactor(0).setDepth(100)
    this.thunderOverlay.fillStyle(0x334466, 0.7)
    this.thunderOverlay.fillRect(thunderX, thunderY, 40, 40 * 0.7)

    this.thunderText = this.add.text(thunderX + 20, thunderY + 50, 'X', {
      fontSize: '10px',
      color: '#88aacc',
      fontFamily: 'monospace',
    }).setScrollFactor(0).setOrigin(0.5).setDepth(99)

    // Build the pause overlay on top of the HUD (hidden by default)
    this._buildPauseOverlay()
  }

  updateHUD(health, maxHealth) {
    const ratio = Math.max(0, health / maxHealth)
    const fullW = 200
    const color = ratio > 0.6 ? 0x22ee44 : ratio > 0.3 ? 0xffcc00 : 0xff2222
    this.hudRect.setSize(Math.max(2, fullW * ratio), 16)
    this.hudRect.setFillStyle(color, 1)
  }

  updateWaveText(wave) {
    if (this.waveText) this.waveText.setText(`Wave ${wave}`)
  }

  updateScoreText(score) {
    if (this.scoreText) this.scoreText.setText(`Score: ${score}`)
  }

  updateLivesText(lives) {
    if (this.livesText) this.livesText.setText(`♥ ${lives}`)
  }

  updateActiveEffects(effects) {
    // Clear existing effects
    for (const effect of this.activeEffects) {
      if (effect.container?.active) effect.container.destroy()
    }
    this.activeEffects = []

    if (!effects || effects.length === 0) return
    if (!this.scene.isActive('GameScene')) return

    // Add each effect as a small indicator
    const pad = 22
    effects.forEach((effect, index) => {
      const x = pad + index * 80
      const container = this.add.container(x, 0)

      // Background
      const bg = this.add.graphics()
      bg.fillStyle(effect.color, 0.8)
      bg.fillRoundedRect(-30, -10, 60, 20, 4)
      container.add(bg)

      // Icon
      const icon = this.add.text(0, -5, effect.icon, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff',
      }).setOrigin(0.5)
      container.add(icon)

      // Timer text
      const gameScene = this.scene.get('GameScene')
      const gameTime = gameScene?.time?.now || 0
      const timeLeft = Math.max(0, Math.ceil((effect.endTime - gameTime) / 1000))
      const timer = this.add.text(0, 8, `${timeLeft}s`, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#dddddd',
      }).setOrigin(0.5)
      container.add(timer)

      this.activeEffectsContainer.add(container)
      this.activeEffects.push({ container, bg, icon, timer })
    })
  }

  clearActiveEffects() {
    for (const effect of this.activeEffects) {
      if (effect.container?.active) effect.container.destroy()
    }
    this.activeEffects = []
  }

  updateThunderCooldown(isReady) {
    if (!this.thunderIcon || !this.thunderOverlay) return

    if (isReady) {
      this.thunderIcon.setAlpha(1)
      this.thunderIcon.setTint(0xffffff)
      this.thunderOverlay.clear()
      this.thunderOverlay.fillStyle(0x6688ff, 0.3)
      this.thunderOverlay.fillRect(
        this.scale.width - 22 - 60,
        22 + 28,
        40,
        40
      )
    } else {
      this.thunderIcon.setAlpha(0.4)
      this.thunderIcon.setTint(0x666666)
      this.thunderOverlay.clear()
      this.thunderOverlay.fillStyle(0x334466, 0.8)
      this.thunderOverlay.fillRect(
        this.scale.width - 22 - 60,
        22 + 28,
        40,
        40
      )
    }
  }
}
