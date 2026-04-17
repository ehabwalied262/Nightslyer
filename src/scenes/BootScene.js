import * as Phaser from 'phaser'
import { ENEMY_TYPES } from '../entities/Enemy.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Show loading bar
    const W = this.scale.width, H = this.scale.height
    const barX = W / 2, barY = H / 2 + 40

    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.8)
    bg.fillRect(0, 0, W, H)

    this.add.text(W / 2, H / 2 - 60, 'NIGHTSLAYER', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ffdd44',
      stroke: '#1a0050',
      strokeThickness: 10,
    }).setOrigin(0.5)

    const barWidth = 400, barHeight = 16
    bg.fillStyle(0x222233)
    bg.fillRect(barX - barWidth / 2, barY, barWidth, barHeight)

    this.progressBar = this.add.graphics()
    this.progressText = this.add.text(W / 2, barY + 32, 'Loading...', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aaaacc',
    }).setOrigin(0.5)

    this.load.on('progress', (value) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(0xffdd44)
      this.progressBar.fillRect(barX - barWidth / 2, barY, barWidth * value, barHeight)
      this.progressText.setText(`${Math.floor(value * 100)}%`)
    })

    this.load.on('complete', () => {
      bg.destroy()
      this.progressBar.destroy()
      this.progressText.destroy()
      this.scene.start('UIScene', { mode: 'menu' })
    })

    // ── Generate all procedural assets here ──────────────────────────────
    this._generatePlayerTexture()
    this._generateEnemyTextures()
    this._generateGroundTexture()
    this._generateParticleTexture()

    // Load background music
    this.load.audio('bgMusic', 'Funk Crimnal.mp3')
  }

  create() {
    // Nothing extra needed — UIScene handles menu
  }

  // ── Texture generators ─────────────────────────────────────────────────

  _generatePlayerTexture() {
    if (this.textures.exists('player')) return
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x0077aa)
    g.fillCircle(22, 13, 13)
    g.fillRect(17, 26, 10, 26)
    g.fillRect(6,  30, 12,  5)
    g.fillRect(26, 30, 12,  5)
    g.fillRect(14, 52, 9,  32)
    g.fillRect(23, 52, 9,  32)
    g.fillStyle(0x00d4ff)
    g.fillCircle(21, 12, 11)
    g.fillRect(18, 27, 8,  22)
    g.fillRect(7,  31, 10,  3)
    g.fillRect(27, 31, 10,  3)
    g.fillRect(15, 53, 7,  28)
    g.fillRect(24, 53, 7,  28)
    g.fillStyle(0x003355)
    g.fillCircle(25, 13, 3)
    g.generateTexture('player', 44, 88)
    g.destroy()
  }

  _generateEnemyTextures() {
    for (const [type, stats] of Object.entries(ENEMY_TYPES)) {
      const textureKey = `enemy_${type}`
      if (this.textures.exists(textureKey)) continue

      const scale = stats.scale
      const w = Math.ceil(44 * scale), h = Math.ceil(88 * scale)
      const s = scale
      const g = this.make.graphics({ x: 0, y: 0, add: false })

      g.fillStyle(stats.color)
      g.fillCircle(22 * s, 13 * s, 13 * s)
      g.fillRect(17 * s, 26 * s, 10 * s, 26 * s)
      g.fillRect(6 * s,  30 * s, 12 * s,  5 * s)
      g.fillRect(26 * s, 30 * s, 12 * s,  5 * s)
      g.fillRect(14 * s, 52 * s, 9 * s,  32 * s)
      g.fillRect(23 * s, 52 * s, 9 * s,  32 * s)

      g.fillStyle(stats.highlight)
      g.fillCircle(21 * s, 12 * s, 11 * s)
      g.fillRect(18 * s, 27 * s, 8 * s,  22 * s)
      g.fillRect(7 * s,  31 * s, 10 * s,  3 * s)
      g.fillRect(27 * s, 31 * s, 10 * s,  3 * s)
      g.fillRect(15 * s, 53 * s, 7 * s,  28 * s)
      g.fillRect(24 * s, 53 * s, 7 * s,  28 * s)

      g.fillStyle(stats.eyeColor)
      g.fillCircle(18 * s, 11 * s, 3 * s)
      g.fillCircle(26 * s, 11 * s, 3 * s)
      g.fillStyle(0x000000)
      g.fillCircle(19 * s, 11 * s, 1 * s)
      g.fillCircle(27 * s, 11 * s, 1 * s)

      g.generateTexture(textureKey, w, h)
      g.destroy()
    }
  }

  _generateGroundTexture() {
    if (this.textures.exists('ground')) return
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x3a8020)
    g.fillRect(0, 0, 1280, 6)
    g.fillStyle(0x2a6015)
    g.fillRect(0, 6, 1280, 8)
    g.fillStyle(0x1e1208)
    g.fillRect(0, 14, 1280, 26)
    g.fillStyle(0x2a1a0a)
    g.fillRect(0, 30, 1280, 10)
    g.generateTexture('ground', 1280, 40)
    g.destroy()
  }

  _generateParticleTexture() {
    if (this.textures.exists('particle')) return
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff)
    g.fillCircle(4, 4, 4)
    g.generateTexture('particle', 8, 8)
    g.destroy()
  }
}
