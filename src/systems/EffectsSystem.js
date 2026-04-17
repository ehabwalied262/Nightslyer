import * as Phaser from 'phaser'

export class EffectsSystem {
  constructor(scene) {
    this.scene = scene
  }

  hitEffect(x, y, facing) {
    // ── Particle burst ──────────────────────────────────────────────────────
    try {
      const emitter = this.scene.add.particles(x, y, 'particle', {
        speed: { min: 60, max: 240 },
        lifespan: 420,
        scale: { start: 1.3, end: 0 },
        tint: [0xffd700, 0xffffff, 0xff9900, 0xffee44],
        angle: { min: 0, max: 360 },
        gravityY: 350,
        emitting: false,
      })
      emitter.explode(14)
      this.scene.time.delayedCall(750, () => {
        if (emitter?.active) emitter.destroy()
      })
    } catch (_) {
      // Particles not available in this build — skip silently
    }

    // ── Slash mark (X shape) ────────────────────────────────────────────────
    const slash = this.scene.add.graphics()
    slash.setDepth(15)
    const f = facing ?? 1

    slash.lineStyle(4, 0xffffff, 1)
    slash.beginPath()
    slash.moveTo(-22 * f, -18)
    slash.lineTo(22 * f, 18)
    slash.strokePath()

    slash.lineStyle(3, 0xffd700, 0.9)
    slash.beginPath()
    slash.moveTo(-18 * f, 18)
    slash.lineTo(18 * f, -18)
    slash.strokePath()

    slash.x = x
    slash.y = y - 8

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 240,
      ease: 'Power2',
      onComplete: () => slash.destroy()
    })
  }
}
