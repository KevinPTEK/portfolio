import { act, render, screen, waitFor } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  FakeIntersectionObserver,
  useFakeIntersectionObserver,
} from '../../testing/FakeIntersectionObserver.js'
import { MotionProvider } from '../MotionProvider.jsx'
import { Reveal, RevealItem } from './Reveal.jsx'

// L'apparition elle-même se vérifie dans Chrome (check-reveal.mjs : happy-dom
// ne fait pas défiler) ; ici : la bonne balise, les bonnes classes, l'état de
// départ, et ce que Motion demande à l'observateur
describe('Reveal', () => {
  it('rend la balise demandée, sans enveloppe, avec ses props', () => {
    render(
      <Reveal as="a" className="contact__email" href="mailto:a@b.fr">
        a@b.fr
      </Reveal>,
    )
    const link = screen.getByRole('link', { name: 'a@b.fr' })
    expect(link).toHaveAttribute('href', 'mailto:a@b.fr')
    expect(link).toHaveClass('reveal', 'contact__email')
  })

  it('embarque ses filets de sécurité (Reveal.scss importé par le composant)', () => {
    // sans cet import, le build partirait sans les filets de secours
    const sheet = document.head.querySelector(
      'style[data-vite-dev-id$="Reveal.scss"]',
    )
    expect(sheet).not.toBe(null)
    expect(sheet.textContent).toContain('data-motion')
  })

  it('RevealItem : un div par défaut, les autres props passent à l’élément', () => {
    render(<RevealItem id="carte">Carte</RevealItem>)
    const item = screen.getByText('Carte')
    expect(item.tagName).toBe('DIV')
    expect(item).toHaveAttribute('id', 'carte')
    expect(item.className).toBe('reveal')
  })

  it('sans className : la classe reveal seule (le CSS de secours la vise)', () => {
    render(<Reveal>Texte</Reveal>)
    expect(screen.getByText('Texte').className).toBe('reveal')
  })

  it('part caché : 24 px plus bas, transparent (variant rise)', () => {
    render(<Reveal>Texte</Reveal>)
    const block = screen.getByText('Texte')
    expect(block.tagName).toBe('DIV')
    expect(block.style.opacity).toBe('0')
    expect(block.style.transform).toBe('translateY(24px)')
  })

  it('en cascade : le parent ne bouge pas, ses éléments partent cachés', () => {
    render(
      <Reveal as="ul" stagger className="skills__groups" role="list">
        <RevealItem as="li" className="skills__group">
          Front-end
        </RevealItem>
        <RevealItem as="li">Outils</RevealItem>
      </Reveal>,
    )
    const list = screen.getByRole('list')
    expect(list).toHaveClass('reveal', 'skills__groups')
    expect(list.style.opacity).toBe('')
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveClass('reveal', 'skills__group')
    expect(items[1].className).toBe('reveal')
    for (const item of items) {
      expect(item.style.opacity).toBe('0')
      expect(item.style.transform).toBe('translateY(24px)')
    }
  })
})

describe('Reveal, moteur chargé', () => {
  useFakeIntersectionObserver()
  // les animations finissent tout de suite (réglage de Motion pour les tests)
  beforeEach(() => {
    MotionGlobalConfig.skipAnimations = true
  })
  afterEach(() => {
    MotionGlobalConfig.skipAnimations = false
  })

  // Un seul test : Motion garde ses observateurs d'un test à l'autre (un par
  // réglage), le faux ne serait plus recréé
  it('apparaît quand son haut passe 15 % au-dessus du bas de l’écran, une seule fois', async () => {
    render(
      <MotionProvider>
        <Reveal>Texte</Reveal>
      </MotionProvider>,
    )
    const block = screen.getByText('Texte')
    await waitFor(() => expect(FakeIntersectionObserver.last).not.toBeNull())
    const observer = FakeIntersectionObserver.last
    // une marge en hauteur d'écran, pas une part du bloc : un bloc plus haut
    // que 6,7 écrans n'aurait jamais 15 % de lui-même visible (zoom à 400 %)
    expect(observer.options).toMatchObject({
      rootMargin: '0px 0px -15% 0px',
      threshold: 0,
    })
    expect(observer.targets).toContain(block)

    act(() => observer.callback([{ target: block, isIntersecting: true }]))
    await waitFor(() => expect(block.style.opacity).toBe('1'))
    expect(block.style.transform).toBe('none')

    // il ressort de l'écran : il reste visible (once)
    act(() => observer.callback([{ target: block, isIntersecting: false }]))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(block.style.opacity).toBe('1')
  })
})
