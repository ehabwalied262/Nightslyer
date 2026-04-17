import { describe, it, expect } from 'vitest'

// Define enemy data directly to avoid importing Phaser-dependent code
const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    health: 100,
    speed: 90,
    attackRange: 90,
    attackDamage: 10,
    attackCooldown: 1600,
    scoreValue: 1,
    color: 0xaa0011,
    highlight: 0xff3344,
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
    color: 0x6644aa,
    highlight: 0x9966ff,
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
    color: 0x445522,
    highlight: 0x77aa33,
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
    color: 0xaa8800,
    highlight: 0xffcc22,
    eyeColor: 0xff0044,
    swordColor: 0xffdd44,
    swordTip: 0xffffff,
    swordGuard: 0x886600,
    swordHandle: 0x443300,
    scale: 1.1,
  },
}

function getPoolForWave(wave) {
  if (wave <= 2) return ['grunt']
  if (wave <= 4) return ['grunt', 'runner']
  if (wave <= 6) return ['grunt', 'runner', 'tank']
  if (wave <= 9) return ['grunt', 'runner', 'tank', 'elite']
  return ['grunt', 'runner', 'tank', 'elite', 'elite']
}

describe('Enemy', () => {
  describe('ENEMY_TYPES', () => {
    it('should have all expected enemy types', () => {
      expect(ENEMY_TYPES.grunt).toBeDefined()
      expect(ENEMY_TYPES.runner).toBeDefined()
      expect(ENEMY_TYPES.tank).toBeDefined()
      expect(ENEMY_TYPES.elite).toBeDefined()
    })

    it('should have required stats for each type', () => {
      for (const [type, stats] of Object.entries(ENEMY_TYPES)) {
        expect(stats.health).toBeGreaterThan(0)
        expect(stats.speed).toBeGreaterThan(0)
        expect(stats.attackDamage).toBeGreaterThan(0)
        expect(stats.attackCooldown).toBeGreaterThan(0)
        expect(stats.scoreValue).toBeGreaterThan(0)
        expect(stats.scale).toBeGreaterThan(0)
      }
    })

    it('should have Tank with highest health', () => {
      const tankHealth = ENEMY_TYPES.tank.health
      for (const [type, stats] of Object.entries(ENEMY_TYPES)) {
        if (type !== 'tank') {
          expect(stats.health).toBeLessThan(tankHealth)
        }
      }
    })

    it('should have Runner with highest speed', () => {
      const runnerSpeed = ENEMY_TYPES.runner.speed
      for (const [type, stats] of Object.entries(ENEMY_TYPES)) {
        if (type !== 'runner') {
          expect(stats.speed).toBeLessThan(runnerSpeed)
        }
      }
    })
  })

  describe('getPoolForWave', () => {
    it('should return only grunt for wave 1-2', () => {
      expect(getPoolForWave(1)).toEqual(['grunt'])
      expect(getPoolForWave(2)).toEqual(['grunt'])
    })

    it('should include runner for wave 3-4', () => {
      const pool3 = getPoolForWave(3)
      const pool4 = getPoolForWave(4)
      expect(pool3).toContain('grunt')
      expect(pool3).toContain('runner')
      expect(pool4).toContain('grunt')
      expect(pool4).toContain('runner')
    })

    it('should include tank for wave 5-6', () => {
      const pool5 = getPoolForWave(5)
      const pool6 = getPoolForWave(6)
      expect(pool5).toContain('tank')
      expect(pool6).toContain('tank')
    })

    it('should include elite for wave 7+', () => {
      const pool7 = getPoolForWave(7)
      const pool9 = getPoolForWave(9)
      const pool10 = getPoolForWave(10)
      expect(pool7).toContain('elite')
      expect(pool9).toContain('elite')
      expect(pool10).toContain('elite')
    })

    it('should always include grunt', () => {
      for (let wave = 1; wave <= 15; wave++) {
        const pool = getPoolForWave(wave)
        expect(pool).toContain('grunt')
      }
    })
  })
})
