import * as Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { GameScene } from './scenes/GameScene.js'
import { UIScene } from './scenes/UIScene.js'
import { SCREEN } from './config/gameConfig.js'

const config = {
  type: Phaser.AUTO,
  backgroundColor: SCREEN.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: SCREEN.gravity },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: SCREEN.width,
    height: SCREEN.height,
  },
  scene: [BootScene, GameScene, UIScene]
}

new Phaser.Game(config)
