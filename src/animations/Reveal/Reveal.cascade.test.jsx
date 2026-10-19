import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FakeIntersectionObserver,
  useFakeIntersectionObserver,
} from '../../testing/FakeIntersectionObserver.js'
import { MotionProvider } from '../MotionProvider.jsx'
import { DURATION_SLOW, STAGGER } from '../variants.js'
import { Reveal, RevealItem } from './Reveal.jsx'

// La cascade, moteur chargé : chaque carte met DURATION_SLOW (0,9 s) à
// arriver, la suivante part STAGGER (120 ms) plus tard. Dans son propre
// fichier : Motion garde ses observateurs d'un test à l'autre dans un même
// fichier, le faux ne serait pas recréé (Reveal.test.jsx a déjà le sien).
// Revue générale (19 oct.) : la version en vrai temps (un sondage toutes les
// 4 ms) échouait au hasard quand la machine était chargée — les deux cartes
// finissaient dans la même image — et laissait passer 80 comme 200 ms. Motion
// confie le fondu au moteur d'animation du navigateur (element.animate), avec
// un délai et une durée par carte : le test lit ces consignes, sans chronomètre
// (le vrai temps se mesure dans Chrome : check-reveal.mjs)
describe('Reveal stagger, moteur chargé', () => {
  useFakeIntersectionObserver()
  afterEach(() => vi.restoreAllMocks())

  it('ses cartes partent l’une après l’autre, à STAGGER d’écart', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
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
    await waitFor(() => expect(fadeOf(b)).toBeDefined())

    expect(fadeOf(a).delay).toBeCloseTo(0) // Motion écrit -0 : le même zéro
    expect(fadeOf(b).delay - fadeOf(a).delay).toBeCloseTo(STAGGER * 1000)
    for (const item of [a, b]) {
      expect(fadeOf(item).duration).toBeCloseTo(DURATION_SLOW * 1000)
    }
  })
})
