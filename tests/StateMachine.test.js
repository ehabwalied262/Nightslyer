import { describe, it, expect } from 'vitest'
import { StateMachine } from '../src/systems/StateMachine.js'

describe('StateMachine', () => {
  it('should initialize with the correct starting state', () => {
    const sm = new StateMachine('IDLE', {
      IDLE: { transitions: ['WALK'] },
      WALK: { transitions: ['IDLE'] },
    })
    expect(sm.getCurrentState()).toBe('IDLE')
  })

  it('should allow valid transitions', () => {
    const sm = new StateMachine('IDLE', {
      IDLE: { transitions: ['WALK', 'JUMP'] },
      WALK: { transitions: ['IDLE'] },
      JUMP: { transitions: ['IDLE'] },
    })
    expect(sm.setState('WALK')).toBe(true)
    expect(sm.getCurrentState()).toBe('WALK')
  })

  it('should block invalid transitions', () => {
    const sm = new StateMachine('IDLE', {
      IDLE: { transitions: ['WALK'] },
      WALK: { transitions: ['IDLE'] },
      JUMP: { transitions: ['IDLE'] },
    })
    // JUMP is not allowed from IDLE
    expect(sm.setState('JUMP')).toBe(false)
    expect(sm.getCurrentState()).toBe('IDLE')
  })

  it('should call enter and exit hooks', () => {
    const calls = []
    const sm = new StateMachine('IDLE', {
      IDLE: {
        transitions: ['WALK'],
        exit: () => calls.push('exit IDLE'),
      },
      WALK: {
        transitions: ['IDLE'],
        enter: () => calls.push('enter WALK'),
      },
    })
    sm.setState('WALK')
    expect(calls).toEqual(['exit IDLE', 'enter WALK'])
  })

  it('should call update on the current state', () => {
    let updateCalled = false
    const sm = new StateMachine('IDLE', {
      IDLE: {
        transitions: ['WALK'],
        update: () => { updateCalled = true },
      },
      WALK: { transitions: ['IDLE'] },
    })
    sm.update(16)
    expect(updateCalled).toBe(true)
  })

  it('should correctly report isInState', () => {
    const sm = new StateMachine('IDLE', {
      IDLE: { transitions: ['WALK'] },
      WALK: { transitions: ['IDLE'] },
    })
    expect(sm.isInState('IDLE')).toBe(true)
    expect(sm.isInState('WALK')).toBe(false)
    sm.setState('WALK')
    expect(sm.isInState('WALK')).toBe(true)
    expect(sm.isInState('IDLE')).toBe(false)
  })

  it('should handle non-existent state gracefully', () => {
    const sm = new StateMachine('IDLE', {
      IDLE: { transitions: ['WALK'] },
      WALK: { transitions: ['IDLE'] },
    })
    // Should not crash and should return false
    expect(sm.setState('NONEXISTENT')).toBe(false)
    // State should remain unchanged
    expect(sm.getCurrentState()).toBe('IDLE')
  })
})
