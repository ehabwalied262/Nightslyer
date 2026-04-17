// src/entities/Player.js
import * as Phaser from 'phaser';
import StateMachine, { STATES } from '../systems/StateMachine.js';
import { PLAYER } from '../config/gameConfig.js';

export class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        // 1. Register the container with the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const neonCyan = 0x00cfff;
        const white    = 0xffffff;

        // 2. Glow aura — rendered first so it sits behind everything
        this.glowOuter = scene.add.circle(0, -15, 34, neonCyan, 0.08);
        this.glowInner = scene.add.circle(0, -15, 20, neonCyan, 0.20);

        // 3. Build the Body Parts (white with thinner limbs)
        // Head (Circle)
        this.head = scene.add.circle(0, -35, 10, white);

        // Torso (Rectangle)
        this.torso = scene.add.rectangle(0, -10, 8, 28, white);

        // Arms — thinner, origin at top (shoulder pivot)
        this.leftArm = scene.add.rectangle(-7, -22, 5, 22, white);
        this.leftArm.setOrigin(0.5, 0);

        this.rightArm = scene.add.rectangle(7, -22, 5, 22, white);
        this.rightArm.setOrigin(0.5, 0);

        // Legs — thinner, origin at top (hip pivot)
        this.leftLeg = scene.add.rectangle(-4, 5, 6, 28, white);
        this.leftLeg.setOrigin(0.5, 0);

        this.rightLeg = scene.add.rectangle(4, 5, 6, 28, white);
        this.rightLeg.setOrigin(0.5, 0);

        // 4. Add all parts — glow circles first (behind), then limbs
        this.add([this.glowOuter, this.glowInner, this.leftArm, this.leftLeg, this.torso, this.head, this.rightArm, this.rightLeg]);

        // Shield orb — sits in front of everything, hidden until activated
        this.shieldCircle = scene.add.circle(0, -8, 42, 0x44aaff, 0.15);
        this.shieldCircle.setStrokeStyle(2, 0x88ccff, 0.9);
        this.shieldCircle.setVisible(false);
        this.add(this.shieldCircle);

        // Scale the whole character up
        this.setScale(1.5);

        // 5. Configure Physics Body (sized to match the 1.5x visual scale)
        this.body.setSize(30, 112);
        this.body.setOffset(-15, -67);

        // 5. Stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.lives = 3;
        this.activeEffects = [];
        this.moveSpeed = 220;
        this.jumpVelocity = -480;

        // 6. Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this._attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this._kickKey   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // 7. State machine
        this.stateMachine = new StateMachine(this);

        // 8. Life state
        this.isDead = false;
        this.lastHitTime = -Infinity; // Tracks last damage timestamp for i-frames

        // 9. Shield state
        this.isShielded       = false;
        this._shieldTimer     = null;
        this._shieldPulseTween = null;

        // 10. Animation State Trackers
        this.isWalking = false;
        this.walkTweens = [];
        this.breathTween = null;
        this._punchHand       = 'right'; // alternates each press: right cross → left jab → ...
        this._nextAttackIsKick = false;  // flag set before state machine triggers playAttackAnimation

        // Base local-Y positions used to reset parts after breath tween stops
        this._baseY = {
            head: -35, torso: -10,
            leftArm: -22, rightArm: -22,
            leftLeg: 5,  rightLeg: 5,
            glowOuter: -15, glowInner: -15
        };

        // Start idle breathing immediately
        this.playIdleAnimation();
    }

    takeDamage(amount) {
        if (this.isDead) return;

        // Shield absorbs the hit — flash the orb as feedback
        if (this.isShielded) {
            this.scene.tweens.add({
                targets: this.shieldCircle,
                alpha: 0.7, scaleX: 1.25, scaleY: 1.25,
                duration: 80, ease: 'Power2', yoyo: true,
            });
            return;
        }

        // Invincibility frames — ignore hits that arrive too soon after the last one
        const now = this.scene.time.now;
        if (now - this.lastHitTime < PLAYER.invincibilityTime) return;
        this.lastHitTime = now;

        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) this.die();
    }

    die() {
        if (this.isDead) return;
        this.lives--;
        if (this.lives <= 0) {
            this.isDead = true;
            this.scene._triggerGameOver();
        } else {
            // Respawn with full health + extended invincibility window
            this.health = this.maxHealth;
            this.lastHitTime = this.scene.time.now +
                (PLAYER.respawnInvincibilityTime - PLAYER.invincibilityTime);
            this.setPosition(200, 520);
        }
    }

    update(combat, enemies, thunderSystem) {
        const { cursors, body } = this;
        const time = this.scene.time.now;

        // Horizontal movement
        if (cursors.left.isDown) {
            body.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
        } else if (cursors.right.isDown) {
            body.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
        } else {
            body.setVelocityX(0);
        }

        // Jump — up arrow or Space
        const grounded = body.blocked.down || body.touching.down;
        if ((cursors.up.isDown || cursors.space.isDown) && grounded) {
            body.setVelocityY(this.jumpVelocity);
        }

        // Punch (Z)
        if (Phaser.Input.Keyboard.JustDown(this._attackKey)) {
            this._nextAttackIsKick = false;
            this.stateMachine.attackDuration = 200;
            this.stateMachine.setState(STATES.ATTACKING);
            if (combat) combat.playerAttack(this, enemies);
        }

        // Kick (X)
        if (Phaser.Input.Keyboard.JustDown(this._kickKey)) {
            this._nextAttackIsKick = true;
            this.stateMachine.attackDuration = 300;
            this.stateMachine.setState(STATES.ATTACKING);
            if (combat) combat.playerAttack(this, enemies);
        }

        // Update state machine visuals
        this.stateMachine.update(time, cursors, this.input);
    }

    // --- ANIMATION METHODS ---

    playWalkAnimation(isMoving) {
        if (isMoving && !this.isWalking) {
            this.isWalking = true;
            this._stopBreathTween(); // Pause breathing while moving

            // Legs — opposite phase pendulum
            const leftLegTween = this.scene.tweens.add({
                targets: this.leftLeg,
                angle: { from: -25, to: 25 },
                duration: 250, yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });
            const rightLegTween = this.scene.tweens.add({
                targets: this.rightLeg,
                angle: { from: 25, to: -25 },
                duration: 250, yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Arms — cross-body swing (right arm matches left leg phase, and vice versa)
            const rightArmTween = this.scene.tweens.add({
                targets: this.rightArm,
                angle: { from: -20, to: 20 },
                duration: 250, yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });
            const leftArmTween = this.scene.tweens.add({
                targets: this.leftArm,
                angle: { from: 20, to: -20 },
                duration: 250, yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.walkTweens.push(leftLegTween, rightLegTween, rightArmTween, leftArmTween);

        } else if (!isMoving && this.isWalking) {
            this.isWalking = false;

            this.walkTweens.forEach(tween => tween.stop());
            this.walkTweens = [];

            // Legs snap to neutral
            this.scene.tweens.add({
                targets: [this.leftLeg, this.rightLeg],
                angle: 0,
                duration: 100
            });
            // Arms and torso settle back into guard pose (also reset x in case of interrupted punch)
            this.scene.tweens.add({ targets: this.rightArm, x: 7,  angle: 50, duration: 150, ease: 'Sine.easeOut' });
            this.scene.tweens.add({ targets: this.leftArm,  x: -7, angle: 30, duration: 150, ease: 'Sine.easeOut' });
            this.scene.tweens.add({ targets: this.torso,    angle: 8,  duration: 150, ease: 'Sine.easeOut' });
        }
    }

    playIdleAnimation() {
        this._stopBreathTween();
        const parts = [
            this.head, this.torso,
            this.leftArm, this.rightArm,
            this.leftLeg, this.rightLeg,
            this.glowOuter, this.glowInner
        ];
        this.breathTween = this.scene.tweens.add({
            targets: parts,
            y: '-=2',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _stopBreathTween() {
        if (this.breathTween) {
            this.breathTween.stop();
            this.breathTween = null;
            this._resetPartPositions();
        }
    }

    _resetPartPositions() {
        const b = this._baseY;
        // Y positions
        this.head.y      = b.head;
        this.torso.y     = b.torso;
        this.leftArm.y   = b.leftArm;
        this.rightArm.y  = b.rightArm;
        this.leftLeg.y   = b.leftLeg;
        this.rightLeg.y  = b.rightLeg;
        this.glowOuter.y = b.glowOuter;
        this.glowInner.y = b.glowInner;
        // X positions — reset in case a punch was interrupted mid-extend
        this.rightArm.x  =  7;
        this.leftArm.x   = -7;
        // Guard-stance angles — arms raised forward, torso leaning in
        this.head.angle      = 0;
        this.torso.angle     = 8;   // slight forward lean
        this.rightArm.angle  = 50;  // lead hand — more extended
        this.leftArm.angle   = 30;  // rear hand — closer to body
        this.leftLeg.angle   = 0;
        this.rightLeg.angle  = 0;
    }

    playJumpAnimation() {
        this._stopBreathTween();
        this.playWalkAnimation(false); // Pause walking legs

        // Torso goes upright in the air
        this.scene.tweens.add({ targets: this.torso, angle: 0, duration: 100 });

        // Spread legs slightly
        this.scene.tweens.add({
            targets: this.leftLeg,
            angle: -30,
            duration: 150,
            yoyo: true,
            hold: 250 // Hold the pose at the peak of the jump
        });
        this.scene.tweens.add({
            targets: this.rightLeg,
            angle: 30,
            duration: 150,
            yoyo: true,
            hold: 250
        });
    }

    playAttackAnimation() {
        if (this._nextAttackIsKick) {
            this._nextAttackIsKick = false;
            this._doKick();
        } else {
            this._doPunch();
        }
    }

    _doPunch() {
        const isRight = this._punchHand === 'right';
        this._punchHand = isRight ? 'left' : 'right';

        const arm          = isRight ? this.rightArm  : this.leftArm;
        const counterArm   = isRight ? this.leftArm   : this.rightArm;
        const baseX        = isRight ?  7  : -7;   // shoulder rest position
        const punchX       = isRight ?  19 :  3;   // shoulder slides forward into punch
        const counterBaseX = isRight ? -7  :  7;
        const counterPullX = isRight ? -12 : 12;   // counter-arm tucks back
        const guardAngle   = isRight ? 50 : 30;
        const counterGuard = isRight ? 30 : 50;
        const torsoLean    = isRight ? 20 : -5;

        // Punching arm: shoulder slides forward + arm extends to horizontal
        // This makes the fist travel in a near-straight line (jab, not a swing)
        this.scene.tweens.add({
            targets: arm, x: punchX, angle: 90, duration: 65, ease: 'Power3',
            onComplete: () => {
                this.scene.tweens.add({ targets: arm, x: baseX, angle: guardAngle, duration: 110, ease: 'Sine.easeOut' });
            }
        });

        // Counter-arm pulls back (opposite shoulder recoils — authentic combo feel)
        this.scene.tweens.add({
            targets: counterArm, x: counterPullX, angle: counterGuard - 12, duration: 65, ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({ targets: counterArm, x: counterBaseX, angle: counterGuard, duration: 110, ease: 'Sine.easeOut' });
            }
        });

        // Torso commits into the punch, then recovers
        this.scene.tweens.add({
            targets: this.torso, angle: torsoLean, duration: 65, ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.torso, angle: 8, duration: 110, ease: 'Sine.easeOut' });
            }
        });
    }

    _doKick() {
        // Kick leg drives forward
        this.scene.tweens.add({
            targets: this.rightLeg, angle: 82, duration: 110, ease: 'Power3',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.rightLeg, angle: 0, duration: 200, ease: 'Sine.easeOut' });
            }
        });

        // Plant leg bends back for balance
        this.scene.tweens.add({
            targets: this.leftLeg, angle: -18, duration: 110, ease: 'Sine.easeOut',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.leftLeg, angle: 0, duration: 200, ease: 'Sine.easeOut' });
            }
        });

        // Torso leans back as counterweight, then returns to guard lean
        this.scene.tweens.add({
            targets: this.torso, angle: -6, duration: 110, ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.torso, angle: 8, duration: 200, ease: 'Sine.easeOut' });
            }
        });

        // Arms pull back slightly during kick for realism
        this.scene.tweens.add({ targets: this.rightArm, angle: 65, duration: 110, ease: 'Sine.easeOut',
            onComplete: () => {
                this.scene.tweens.add({ targets: this.rightArm, angle: 50, duration: 200, ease: 'Sine.easeOut' });
            }
        });
    }

    activateShield(duration) {
        this.isShielded = true;

        // Reset orb state in case it's already active (re-pickup extends the timer)
        if (this._shieldTimer) this._shieldTimer.remove();
        if (this._shieldPulseTween) this._shieldPulseTween.stop();
        this.shieldCircle.setVisible(true);
        this.shieldCircle.setAlpha(0.15);
        this.shieldCircle.setScale(1);

        // Slow pulse to show the shield is alive
        this._shieldPulseTween = this.scene.tweens.add({
            targets: this.shieldCircle,
            alpha: 0.05, scaleX: 1.1, scaleY: 1.1,
            duration: 700, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
        });

        this._shieldTimer = this.scene.time.delayedCall(duration, () => this.deactivateShield());
    }

    deactivateShield() {
        this.isShielded = false;
        if (this._shieldPulseTween) { this._shieldPulseTween.stop(); this._shieldPulseTween = null; }
        if (this._shieldTimer)      { this._shieldTimer.remove();    this._shieldTimer      = null; }

        // Flash out on expiry
        this.scene.tweens.add({
            targets: this.shieldCircle,
            alpha: 0, scaleX: 1.4, scaleY: 1.4,
            duration: 350, ease: 'Power2',
            onComplete: () => {
                this.shieldCircle.setVisible(false);
                this.shieldCircle.setAlpha(0.15);
                this.shieldCircle.setScale(1);
            },
        });
    }

    // Helper to flip the whole container when changing direction (preserves current scale)
    setFlipX(isFlipped) {
        this.scaleX = isFlipped ? -this.scaleY : this.scaleY;
    }
}