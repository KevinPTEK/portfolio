import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  FakeIntersectionObserver as FakeObserver,
  cross,
  useFakeIntersectionObserver,
} from '../testing/FakeIntersectionObserver.js'
import { useCurrentRoom } from './useCurrentRoom.js'

// happy-dom ne calcule aucune position : le faux IntersectionObserver dit
// « cette pièce croise la ligne du milieu ». Le vrai comportement
// (empilement, défilement) se vérifie dans le navigateur (§ 7.7).

const SECTIONS = ['work', 'contact']

function Probe({ sections = SECTIONS }) {
  const { room, section } = useCurrentRoom(sections)
  return <p data-testid="probe">{`${room ?? '—'} | ${section ?? '—'}`}</p>
}

// l'accueil (hors du menu), deux projets dans #work, puis le contact
function renderPage(sections) {
  return render(<Page sections={sections} />)
}

function Page({ sections }) {
  return (
    <>
      <section className="room" id="home" data-theme="paper-light" />
      <div id="work">
        <section className="room" id="argent" data-theme="argent" />
        <section className="room" id="events" data-theme="events" />
      </div>
      <section className="room" id="contact" data-theme="paper-cool" />
      <Probe sections={sections} />
    </>
  )
}

const probe = () => screen.getByTestId('probe').textContent

describe('useCurrentRoom', () => {
  useFakeIntersectionObserver()

  it("observe chaque pièce, sur une ligne au milieu de l'écran", () => {
    renderPage()
    expect(FakeObserver.last.options.rootMargin).toBe('-50% 0px -50% 0px')
    expect(FakeObserver.last.targets.map((room) => room.id)).toEqual([
      'home',
      'argent',
      'events',
      'contact',
    ])
  })

  it('ne choisit rien tant qu’aucune pièce ne croise la ligne', () => {
    renderPage()
    expect(probe()).toBe('— | —')
    expect(document.body.dataset.theme).toBeUndefined()
  })

  it.each([
    ['argent', 'argent | work'],
    ['contact', 'contact | contact'],
  ])(
    'rend courante la pièce %s, avec la section du menu qui la contient',
    (id, expected) => {
      renderPage()
      cross({ [id]: true })
      expect(probe()).toBe(expected)
      // le <body> prend son thème : la nav et le fond du document suivent
      expect(document.body.dataset.theme).toBe(
        document.getElementById(id).dataset.theme,
      )
    },
  )

  it("donne l'accueil sans section : il n'est pas dans le menu", () => {
    renderPage()
    cross({ home: true })
    expect(probe()).toBe('home | —')
  })

  it.each([[{ argent: true, events: true }], [{ events: true, argent: true }]])(
    'choisit la dernière pièce de la page quand deux croisent la ligne : %o',
    (changes) => {
      // empilement : la pièce suivante glisse par-dessus la précédente, collée
      renderPage()
      cross(changes)
      expect(probe()).toBe('events | work')
    },
  )

  it('revient à la pièce de dessous quand la dernière quitte la ligne', () => {
    renderPage()
    cross({ argent: true, events: true })
    cross({ events: false })
    expect(probe()).toBe('argent | work')
    expect(document.body.dataset.theme).toBe('argent')
  })

  it('garde la pièce courante quand plus aucune ne croise la ligne', () => {
    // un interstice entre deux pièces, ou une pièce qui sort avant que la
    // suivante n'entre : on ne retombe pas sur « rien »
    renderPage()
    cross({ argent: true })
    cross({ argent: false })
    expect(probe()).toBe('argent | work')
    expect(document.body.dataset.theme).toBe('argent')
  })

  it("ne recrée pas l'observateur quand la liste des sections change", () => {
    // l'appelant n'a pas à garder un tableau stable
    const { rerender } = renderPage(['work', 'contact'])
    const first = FakeObserver.last
    cross({ argent: true })
    rerender(<Page sections={['work', 'contact']} />)
    expect(FakeObserver.last).toBe(first)
    expect(first.disconnected).toBe(false)
    expect(document.body.dataset.theme).toBe('argent')
  })

  it('cesse d’observer et rend le thème par défaut au démontage', () => {
    const { unmount } = renderPage()
    cross({ argent: true })
    unmount()
    expect(FakeObserver.last.disconnected).toBe(true)
    expect(document.body.dataset.theme).toBeUndefined()
  })
})
