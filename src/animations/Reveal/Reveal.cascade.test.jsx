import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FakeIntersectionObserver,
  useFakeIntersectionObserver,
} from '../../testing/FakeIntersectionObserver.js'
import { MotionProvider } from '../MotionProvider.jsx'
import { DURATION_SLOW, STAGGER } from '../variants.js'
import { Reveal, RevealItem } from './Reveal.jsx'

// La cascade, moteur chargé. Motion confie le fondu au moteur d'animation
// (element.animate), avec un délai et une durée par carte : le test lit ces
// consignes plutôt que de chronométrer. Dans son propre fichier : Motion garde
// ses observateurs d'un test à l'autre.
describe('Reveal stagger, moteur chargé', () => {
  useFakeIntersectionObserver()
  let animate
  afterEach(() => {
    // le test s'arrête en pleine animation : au démontage, happy-dom rejette
    // sa promesse finished sans la marquer traitée (un navigateur le fait)
    animate.mock.results.forEach(({ value }) =>
      value?.finished?.catch(() => {}),
    )
    vi.restoreAllMocks()
  })

  it('ses cartes partent l’une après l’autre, à STAGGER d’écart', async () => {
    animate = vi.spyOn(Element.prototype, 'animate')
    render(
      <MotionProvider>
        <Reveal as="ul" stagger role="list">
          <RevealItem as="li">A</RevealItem>
          <RevealItem as="li">B</RevealItem>
        </Reveal>
      </MotionProvider>,
    )
    await waitFor(() => expect(FakeIntersectionObserver.last).not.toBeNull())
    const list = screen.getByRole('list')
    const [a, b] = screen.getAllByRole('listitem')

    act(() =>
      FakeIntersectionObserver.last.callback([
        { target: list, isIntersecting: true },
      ]),
    )
    // les consignes du fondu d'une carte : { delay, duration… } en ms
    const fadeOf = (item) =>
      animate.mock.calls.find(
        ([keyframes], call) =>
          animate.mock.contexts[call] === item && 'opacity' in keyframes,
      )?.[1]
    await waitFor(() => {
      expect(fadeOf(a)).toBeDefined()
      expect(fadeOf(b)).toBeDefined()
    })

    expect(fadeOf(a).delay).toBeCloseTo(0) // Motion écrit -0 : le même zéro
    expect(fadeOf(b).delay - fadeOf(a).delay).toBeCloseTo(STAGGER * 1000)
    for (const item of [a, b]) {
      expect(fadeOf(item).duration).toBeCloseTo(DURATION_SLOW * 1000)
    }
  })
})
