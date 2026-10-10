import { render, screen, waitFor } from '@testing-library/react'
import { MotionConfigContext, motion } from 'motion/react'
import * as m from 'motion/react-m'
import { useContext } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MotionProvider } from './MotionProvider.jsx'

// Le cadre de toutes les animations (§ 7.1) : retirer un de ses réglages ne
// casserait rien de visible dans les tests des pièces — d'où ces tests-ci
describe('MotionProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('suit le réglage « réduire les animations » du système (reducedMotion="user")', () => {
    function Probe() {
      return <p>{useContext(MotionConfigContext).reducedMotion}</p>
    }
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    )
    expect(screen.getByText('user')).toBeInTheDocument()
  })

  it('charge le moteur, appelé sans argument : un m.div s’anime', async () => {
    render(
      <MotionProvider>
        <m.div
          data-testid="bloc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01 }}
        />
      </MotionProvider>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('bloc').style.opacity).toBe('1'),
    )
  })

  it('strict : refuse motion.div, qui embarquerait tout le moteur', () => {
    // React signale l'erreur dans la console : on la fait taire ici
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <MotionProvider>
          <motion.div />
        </MotionProvider>,
      ),
    ).toThrow()
  })
})
