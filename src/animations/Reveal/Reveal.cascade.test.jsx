import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  FakeIntersectionObserver,
  useFakeIntersectionObserver,
} from '../../testing/FakeIntersectionObserver.js'
import { MotionProvider } from '../MotionProvider.jsx'
import { Reveal, RevealItem } from './Reveal.jsx'

// La cascade en vrai temps (≈ 1 s) : les cartes finissent 120 ms l'une après
// l'autre (STAGGER, variants.js). Dans son propre fichier : Motion garde ses
// observateurs d'un test à l'autre dans un même fichier, le faux ne serait
// pas recréé (Reveal.test.jsx a déjà le sien)
describe('Reveal stagger, moteur chargé', () => {
  useFakeIntersectionObserver()

  it('ses cartes arrivent l’une après l’autre, à 120 ms d’écart', async () => {
    render(
      <MotionProvider>
        <Reveal as="ul" stagger role="list">
          <RevealItem as="li">A</RevealItem>
          <RevealItem as="li">B</RevealItem>
        </Reveal>
      </MotionProvider>,
    )
    const list = screen.getByRole('list')
    const [a, b] = screen.getAllByRole('listitem')
    await waitFor(() => expect(FakeIntersectionObserver.last).not.toBeNull())

    act(() =>
      FakeIntersectionObserver.last.callback([
        { target: list, isIntersecting: true },
      ]),
    )
    // le premier instant où chaque carte est entièrement là
    const done = {}
    const start = performance.now()
    while (!(done.a && done.b) && performance.now() - start < 2500) {
      await new Promise((resolve) => setTimeout(resolve, 4))
      for (const [name, item] of [
        ['a', a],
        ['b', b],
      ]) {
        if (!done[name] && item.style.opacity === '1') {
          done[name] = performance.now()
        }
      }
    }
    expect(done.a && done.b, 'les deux cartes sont arrivées').toBeTruthy()
    expect(done.b - done.a).toBeGreaterThanOrEqual(80)
    expect(done.b - done.a).toBeLessThanOrEqual(250)
  })
})
