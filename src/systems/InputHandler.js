import * as Phaser from 'phaser'
import { CONTROLS } from '../config/gameConfig.js'

export class InputHandler {
  constructor(scene) {
    this.scene = scene

    // Register all keys directly
    this._keys = {
      LEFT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      RIGHT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      UP: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      DOWN: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      SPACE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      Z: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      X: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      ESC: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      P: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
    }
  }

  _isAnyDown(action) {
    return CONTROLS[action].some(keyName => {
      const key = this._keys[keyName]
      return key && key.isDown
    })
  }

  _isJustDown(action) {
    return CONTROLS[action].some(keyName => {
      const key = this._keys[keyName]
      return key && Phaser.Input.Keyboard.JustDown(key)
    })
  }

  isLeft() {
    return this._isAnyDown('left')
  }

  isRight() {
    return this._isAnyDown('right')
  }

  isJump() {
    return this._isJustDown('jump')
  }

  isAttack() {
    return this._isJustDown('attack')
  }

  isPause() {
    return this._isJustDown('pause')
  }

  isThunder() {
    return this._isJustDown('thunder')
  }
}