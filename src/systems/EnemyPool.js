import { Enemy, ENEMY_TYPES } from '../entities/Enemy.js'

export class EnemyPool {
  constructor(scene) {
    this.scene = scene
    this._pool = []    // Inactive, ready-to-reuse enemies
    this._active = [] // Currently active enemies
  }

  get(type, x, y) {
    let enemy = this._pool.pop()

    if (enemy) {
      // Reuse a pooled enemy — reset its state and reposition
      enemy.reset(this.scene, x, y, type)
    } else {
      // Create a brand new enemy and add a ground collider (persists for lifetime)
      enemy = new Enemy(this.scene, x, y, type)
      this.scene.physics.add.collider(enemy.sprite, this.scene.ground)
    }

    this._active.push(enemy)
    return enemy
  }

  release(enemy) {
    const idx = this._active.indexOf(enemy)
    if (idx !== -1) this._active.splice(idx, 1)

    // Hide and disable instead of destroying so the container can be reused
    if (enemy.sword?.active) {
      enemy.sword.setVisible(false)
    }
    if (enemy.sprite?.active) {
      enemy.sprite.setVisible(false)
      enemy.sprite.body.enable = false
    }

    this._pool.push(enemy)
  }

  cleanup() {
    // Only release once the death animation has fully played out
    const ready = this._active.filter(e => e.isDead && e._readyToPool)
    for (const enemy of ready) {
      this.release(enemy)
    }
  }

  getActive() {
    return this._active.filter(e => !e.isDead)
  }

  releaseAll() {
    for (const enemy of [...this._active]) {
      this.release(enemy)
    }
  }

  getStats() {
    return {
      poolSize: this._pool.length,
      activeCount: this._active.length,
      deadCount: this._active.filter(e => e.isDead).length,
    }
  }
}
