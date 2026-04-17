// ─── Screen & Physics ──────────────────────────────────────────────────────
export const SCREEN = {
  width: 1280,
  height: 720,
  backgroundColor: '#0a0520',
  gravity: 800,
}

// ─── Player ────────────────────────────────────────────────────────────────
export const PLAYER = {
  spawnX: 200,
  spawnY: 520,
  speed: 300,
  jumpForce: -620,
  maxHealth: 100,
  lives: 3,
  invincibilityTime: 500,
  respawnInvincibilityTime: 1500,
  damageTintTime: 220,
  spawnPosition: { x: 200, y: 520 },
}

// ─── Combat ────────────────────────────────────────────────────────────────
export const COMBAT = {
  attackRange: 130,
  attackDamage: 20,
  knockbackX: 420,
  knockbackY: -280,
  swingDuration: 130,
  swingAngle: 82,
  swordHitstop: 60,
}

// ─── Thunder Attack ────────────────────────────────────────────────────────
export const THUNDER = {
  cooldown: 4000,
  range: 350,
  width: 160,
  damage: 150,
  knockbackX: 250,
  knockbackUp: 300,
  screenShakeIntensity: 8,
  screenShakeDuration: 200,
}

// ─── Effects ───────────────────────────────────────────────────────────────
export const EFFECTS = {
  hitParticles: 14,
  hitParticleLifespan: 420,
  hitParticleSpeed: { min: 60, max: 240 },
  hitGravityY: 350,
  slashDuration: 240,
  deathParticles: 24,
  deathParticleLifespan: 700,
  deathParticleSpeed: { min: 80, max: 300 },
  deathGravityY: 500,
  screenShakeDuration: 400,
  screenShakeIntensity: 0.015,
  deathFlashDuration: 800,
  deathSlumpDuration: 800,
  invincibilityFlashRepeat: 7,
  damageFlashRepeat: 2,
  flashDuration: 100,
}

// ─── Waves ─────────────────────────────────────────────────────────────────
export const WAVES = {
  baseEnemies: 1,        // enemies = wave + baseEnemies
  spawnDelay: 1600,      // ms between waves
  waveBannerHold: 700,
  waveBannerDuration: 280,
  waveBannerY: 300,
  waveTextScale: 1.5,
  waveTextScaleDuration: 220,
  waveDelay: 1600,
}

// ─── Scoring ───────────────────────────────────────────────────────────────
export const SCORING = {
  baseMultiplier: 10,    // score = scoreValue × wave × baseMultiplier
}

// ─── Controls ──────────────────────────────────────────────────────────────
export const CONTROLS = {
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
  jump: ['UP', 'W', 'SPACE'],
  attack: ['Z'],
  thunder: ['X'],
  pause: ['ESC', 'P'],
}

// ─── HUD ───────────────────────────────────────────────────────────────────
export const HUD = {
  padding: 22,
  hpBarWidth: 200,
  hpBarHeight: 16,
  hpBarBorder: 4,
  hpColor: { high: 0x22ee44, medium: 0xffcc00, low: 0xff2222 },
  hpHighThreshold: 0.6,
  hpMediumThreshold: 0.3,
}

// ─── Pause ─────────────────────────────────────────────────────────────────
export const PAUSE = {
  overlayAlpha: 0.55,
}

// ─── Game Flow ─────────────────────────────────────────────────────────────
export const GAME_FLOW = {
  gameOverDelay: 1200,
  respawnDelay: 600,
  noLivesDelay: 500,
}

// ─── Power-ups ─────────────────────────────────────────────────────────────
export const POWERUPS = {
  spawnInterval: { min: 5000, max: 10000 }, // Time between spawns
  lifetime: 10000,                            // How long they stay before disappearing
  yPosition: 580,                             // Ground level spawn Y
  xRange: { min: 100, max: 1180 },            // Spawn X range
  types: {
    health: {
      name: 'Health Pack',
      color: 0x22ee44,
      glowColor: 0x44ff66,
      icon: '+',
      healAmount: 30,
      duration: 0, // Instant
      spawnWeight: 3, // spawns more often than combat power-ups
    },
    fullHeal: {
      name: 'Full Restore',
      color: 0xffdd00,
      glowColor: 0xffff66,
      icon: '★',
      duration: 0, // Instant
      spawnWeight: 1,
    },
    shield: {
      name: 'Shield',
      color: 0x4488ff,
      glowColor: 0x66aaff,
      icon: '◎',
      duration: 8000, // 8 seconds of protection
      spawnWeight: 1,
    },
    damage: {
      name: 'Damage Boost',
      color: 0xff4422,
      glowColor: 0xff6644,
      icon: '⚔',
      damageMultiplier: 2.0,
      duration: 8000,
      spawnWeight: 1,
    },
    speed: {
      name: 'Speed Boost',
      color: 0x44aaff,
      glowColor: 0x66ccff,
      icon: '»',
      speedMultiplier: 1.5,
      duration: 6000,
      spawnWeight: 1,
    },
  },
}

// ─── Enemy Type Pool ──────────────────────────────────────────────────────
// Exported from Enemy.js as ENEMY_TYPES + getPoolForWave
