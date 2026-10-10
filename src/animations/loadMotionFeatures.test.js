import { domAnimation } from 'motion/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadMotionFeatures } from './loadMotionFeatures.js'

describe('loadMotionFeatures', () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion
  })

  it('donne le moteur domAnimation, sans rien marquer', async () => {
    await expect(loadMotionFeatures()).resolves.toBe(domAnimation)
    expect(document.documentElement.dataset.motion).toBeUndefined()
  })

  it('si le chargement échoue : <html data-motion="off">, et l’erreur reste visible', async () => {
    const error = new Error('fichier introuvable')
    await expect(loadMotionFeatures(() => Promise.reject(error))).rejects.toBe(
      error,
    )
    expect(document.documentElement.dataset.motion).toBe('off')
  })
})
