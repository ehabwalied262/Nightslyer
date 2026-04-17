// src/systems/StateMachine.js

export const STATES = {
    IDLE: 'IDLE',
    WALKING: 'WALKING',
    JUMPING: 'JUMPING',
    FALLING: 'FALLING',
    ATTACKING: 'ATTACKING',
    STUNNED: 'STUNNED'
};

export default class StateMachine {
    constructor(entity) {
        this.entity = entity; // The Player (or Enemy) this machine controls
        this.currentState = STATES.IDLE;
        
        // Cooldowns and timers
        this.attackDuration = 200; // ms
        this.attackTimer = 0;
    }

    setState(newState) {
        // Prevent changing state if we are stunned or already in this state
        if (this.currentState === STATES.STUNNED || this.currentState === newState) {
            return;
        }

        // --- EXIT PREVIOUS STATE LOGIC ---
        if (this.currentState === STATES.WALKING) {
            // Tell the player to stop the leg pendulums if we stop walking
            if (this.entity.playWalkAnimation) {
                this.entity.playWalkAnimation(false);
            }
        }

        this.currentState = newState;

        // --- ENTER NEW STATE LOGIC ---
        switch (this.currentState) {
            case STATES.IDLE:
                if (this.entity.playWalkAnimation) this.entity.playWalkAnimation(false);
                if (this.entity.playIdleAnimation) this.entity.playIdleAnimation();
                break;

            case STATES.FALLING:
                if (this.entity._stopBreathTween) this.entity._stopBreathTween();
                break;

            case STATES.WALKING:
                // Start the leg pendulum tweens
                if (this.entity.playWalkAnimation) this.entity.playWalkAnimation(true);
                break;

            case STATES.JUMPING:
                // Spread legs for the jump
                if (this.entity.playJumpAnimation) this.entity.playJumpAnimation();
                break;

            case STATES.ATTACKING:
                // Trigger the sword swing tween
                if (this.entity.playAttackAnimation) this.entity.playAttackAnimation();
                
                // Lock the player in the attack state for the duration of the swing
                this.attackTimer = this.entity.scene.time.now + this.attackDuration;
                break;
        }
    }

    update(time, cursors, inputHandler) {
        // If we are currently attacking, wait until the animation finishes
        if (this.currentState === STATES.ATTACKING) {
            if (time > this.attackTimer) {
                // Attack finished, go back to idle
                this.setState(STATES.IDLE);
            } else {
                return; // Block other inputs while attacking
            }
        }

        const isGrounded = this.entity.body.touching.down || this.entity.body.blocked.down;
        
        // Handle Jumping State
        if (!isGrounded) {
            if (this.entity.body.velocity.y > 0) {
                this.setState(STATES.FALLING);
            } else {
                this.setState(STATES.JUMPING);
            }
            return; // Skip walking logic while in the air
        }

        // Handle Grounded States (Walking vs Idle)
        if (Math.abs(this.entity.body.velocity.x) > 0) {
            this.setState(STATES.WALKING);
        } else {
            this.setState(STATES.IDLE);
        }
    }

    // Force a state (useful for taking damage / getting stunned)
    forceState(newState) {
        this.currentState = newState;
    }
}