import { render, waitFor } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MotionProvider } from '../MotionProvider.jsx'
import { KrSeal } from './KrSeal.jsx'

// Le sceau et ses trois états (§ 7.4), moteur chargé, animations finies tout
// de suite. Chaque test part du sceau dessiné : son état de départ (opacité
// 0) ressemble à « effacé », un test qui partirait de là ne prouverait rien
// (revue : jamais dissous, jamais effacé au geste, ces mutants passaient)
const seal = () => document.querySelector('.kr-seal')
const sealed = (props) => (
  <MotionProvider>
    <KrSeal {...props} />
  </MotionProvider>
)

describe('KrSeal', () => {
  beforeEach(() => {
    MotionGlobalConfig.skipAnimations = true
  })
  afterEach(() => {
    MotionGlobalConfig.skipAnimations = false
  })

  async function drawn() {
    const view = render(sealed({ phase: 'drawing', rushed: false }))
    await waitFor(() => expect(seal().style.opacity).toBe('1'))
    expect(seal().style.transform).toBe('none') // à sa taille
    return view
  }

  it('pendant le tracé : dessiné, à sa taille', async () => {
    await drawn()
  })

  it('à l’ouverture : il se dissout — grandit (1,25) et s’efface', async () => {
    const { rerender } = await drawn()
    rerender(sealed({ phase: 'opening', rushed: false }))
    await waitFor(() => expect(seal().style.opacity).toBe('0'))
    expect(seal().style.transform).toBe('scale(1.25)')
  })

  // « effacé » ne donne que l'opacité : Motion rend à l'échelle, absente de
  // l'état, sa valeur de départ (0,92) — il rétrécit un peu en s'effaçant,
  // mais ne se dissout pas (pas d'agrandissement)
  it('après un geste : il s’efface vite, sans se dissoudre', async () => {
    const { rerender } = await drawn()
    rerender(sealed({ phase: 'ready', rushed: true }))
    await waitFor(() => expect(seal().style.opacity).toBe('0'))
    expect(seal().style.transform).toBe('scale(0.92)')
  })
})
