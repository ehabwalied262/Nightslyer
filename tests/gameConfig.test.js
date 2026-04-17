import { describe, it, expect } from 'vitest'
import {
  SCREEN, PLAYER, COMBAT, EFFECTS, WAVES, SCORING, CONTROLS, HUD, PAUSE, GAME_FLOW
} from '../src/config/gameConfig.js'

describe('GameConfig', () => {
  it('should have all config objects defined', () => {
    expect(SCREEN).toBeDefined()
    expect(PLAYER).toBeDefined()
    expect(COMBAT).toBeDefined()
    expect(EFFECTS).toBeDefined()
    expect(WAVES).toBeDefined()
    expect(SCORING).toBeDefined()
    expect(CONTROLS).toBeDefined()
    expect(HUD).toBeDefined()
    expect(PAUSE).toBeDefined()
    expect(GAME_FLOW).toBeDefined()
  })

  describe('SCREEN', () => {
    it('should have valid dimensions', () => {
      expect(SCREEN.width).toBe(1280)
      expect(SCREEN.height).toBe(720)
    })
    it('should have positive gravity', () => {
      expect(SCREEN.gravity).toBeGreaterThan(0)
    })
  })

  describe('PLAYER', () => {
    it('should have valid spawn position', () => {
      expect(PLAYER.spawnX).toBe(200)
      expect(PLAYER.spawnY).toBe(520)
    })
    it('should have positive stats', () => {
      expect(PLAYER.speed).toBeGreaterThan(0)
      expect(PLAYER.maxHealth).toBeGreaterThan(0)
      expect(PLAYER.lives).toBeGreaterThan(0)
    })
  })

  describe('CONTROLS', () => {
    it('should have arrays for all actions', () => {
      for (const [action, keys] of Object.entries(CONTROLS)) {
        expect(Array.isArray(keys)).toBe(true)
        expect(keys.length).toBeGreaterThan(0)
      }
    })
    it('should include expected actions', () => {
      expect(CONTROLS.left).toBeDefined()
      expect(CONTROLS.right).toBeDefined()
      expect(CONTROLS.jump).toBeDefined()
      expect(CONTROLS.attack).toBeDefined()
      expect(CONTROLS.pause).toBeDefined()
    })
  })

  describe('COMBAT', () => {
    it('should have positive values', () => {
      expect(COMBAT.attackRange).toBeGreaterThan(0)
      expect(COMBAT.attackDamage).toBeGreaterThan(0)
      expect(COMBAT.knockbackX).toBeGreaterThan(0)
      expect(COMBAT.swingDuration).toBeGreaterThan(0)
    })
  })

  describe('WAVES', () => {
    it('should have positive values', () => {
      expect(WAVES.baseEnemies).toBeGreaterThan(0)
      expect(WAVES.spawnDelay).toBeGreaterThan(0)
    })
  })
})
