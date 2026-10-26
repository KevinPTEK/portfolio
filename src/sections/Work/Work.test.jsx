import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import projects from '../../data/projects.json'
import { preferReducedMotion } from '../../testing/motion.js'
import { Work } from './Work.jsx'

// Les travaux et la modale. happy-dom ne gère ni Échap ni le focus initial
// d'un <dialog> : ceux-là se vérifient dans le navigateur.

function openProject(user, name) {
  return user.click(
    screen.getByRole('button', { name: `Voir le projet ${name}` }),
  )
}

describe('Work', () => {
  it('est la cible #work du menu', () => {
    const { container } = render(<Work />)
    expect(container.querySelector('#work')).not.toBe(null)
  })

  it.each(projects)(
    'donne une pièce à $name, nommée par son titre, à ses couleurs',
    (project) => {
      render(<Work />)
      const room = document.getElementById(project.id)
      expect(room).toHaveAttribute('data-theme', project.theme)
      expect(room).toHaveAttribute('aria-labelledby', `${project.id}-title`)
      // le mix qui porte l'empilement (sans lui, aucun autre test ne casse)
      expect(room).toHaveClass('room', 'work__project')
      expect(within(room).getByRole('heading', { level: 2 }).textContent).toBe(
        project.title,
      )
    },
  )

  it.each(projects)(
    'pose derrière $name sa propre capture floutée',
    (project) => {
      render(<Work />)
      const background = document.getElementById(project.id).firstElementChild
      expect(background).toHaveClass('living-background--cover')
      expect(background.querySelector('img')).toHaveAttribute(
        'src',
        project.cover.blur,
      )
    },
  )

  it("garde les projets dans l'ordre de projects.json, puis les autres réalisations", () => {
    render(<Work />)
    const ids = [...document.querySelectorAll('section')].map((room) => room.id)
    expect(ids).toEqual([
      ...projects.map((project) => project.id),
      'other-work',
    ])
    // dans #work : le menu « Travaux » mène aux projets comme aux autres réalisations
    expect(document.querySelector('#work #other-work')).not.toBe(null)
  })

  it('garde la modale montée, fermée, avant toute ouverture', () => {
    // démontée pendant qu'elle est ouverte, elle ne préviendrait pas le parent
    render(<Work />)
    const dialog = document.querySelector('dialog')
    expect(dialog).not.toBe(null)
    expect(dialog.open).toBe(false)
  })

  it('ouvre le détail du projet choisi, à ses couleurs', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const [, second] = projects
    await openProject(user, second.name)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    const title = within(dialog).getByRole('heading', { level: 2 })
    expect(title.textContent).toBe(second.title)
    // le titre nomme la modale, par un id qui n'existe qu'une fois dans la page
    // (repris de la carte, il pointerait d'abord sur le titre de la carte)
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
    expect(document.querySelectorAll(`[id="${title.id}"]`)).toHaveLength(1)
    // sa place, dans la carte comme dans la modale (le 2e : « 02 », pas « 01 » ni « 03 »)
    const room = document.getElementById(second.id)
    const position = `02 / ${String(projects.length).padStart(2, '0')}`
    expect(within(room).getByText(position)).toBeInTheDocument()
    expect(within(dialog).getByText(position)).toBeInTheDocument()
    // à l'ouverture, le focus est sur « Fermer » (pas sur le titre)
    expect(within(dialog).getByRole('button', { name: 'Fermer' })).toHaveFocus()
  })

  it('« Projet suivant » montre le suivant et place le focus sur son titre', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const [first, second] = projects
    await openProject(user, first.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${second.name}` }),
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    const title = within(dialog).getByRole('heading', { level: 2 })
    expect(title.textContent).toBe(second.title)
    expect(title).toHaveFocus()
  })

  it('après le dernier projet, « Projet suivant » revient au premier', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const first = projects[0]
    const last = projects.at(-1)
    await openProject(user, last.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${first.name}` }),
    )
    expect(
      within(screen.getByRole('dialog')).getByRole('heading', { level: 2 })
        .textContent,
    ).toBe(first.title)
  })

  it('à la fermeture, rend le focus au bouton du projet affiché', async () => {
    // Safari ne donne pas le focus à un bouton cliqué ; après « Projet
    // suivant », c'est le bouton du projet affiché
    const user = userEvent.setup()
    render(<Work />)
    const [first, second] = projects
    await openProject(user, first.name)
    await user.click(
      screen.getByRole('button', { name: `Projet suivant : ${second.name}` }),
    )
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(document.querySelector('dialog').open).toBe(false)
    expect(
      screen.getByRole('button', { name: `Voir le projet ${second.name}` }),
    ).toHaveFocus()
  })

  it('fermée, la modale garde le projet affiché (pas de saut de contenu)', async () => {
    // sinon une sortie animée montrerait le 1er projet en se fermant
    const user = userEvent.setup()
    render(<Work />)
    const [, second] = projects
    await openProject(user, second.name)
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(false)
    expect(dialog).toHaveAttribute('data-theme', second.theme)
    expect(dialog.querySelector('h2').textContent).toBe(second.title)
  })
})

// Le passage entre projets : --arrival sur le projet, --covered sur le
// précédent. happy-dom ne calcule aucune position : on place les repères à la
// main, puis une image de faux requestAnimationFrame
describe('Work — le passage entre projets', () => {
  const HEIGHT = window.innerHeight
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    window.happyDOM.setViewport({ width: 1024, height: 768 })
    Object.defineProperty(window, 'innerHeight', {
      value: HEIGHT,
      configurable: true,
    })
  })

  const markers = () => [...document.querySelectorAll('.work__marker')]
  const rooms = () => projects.map(({ id }) => document.getElementById(id))
  // le haut de chaque repère, puis une image
  const scrollToMarkers = (...tops) => {
    markers().forEach((marker, position) => {
      marker.getBoundingClientRect = () => ({ top: tops[position] })
    })
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
  }
  const value = (room, name) => room.style.getPropertyValue(name)

  it('place un repère sans hauteur juste avant chaque projet', () => {
    render(<Work />)
    expect(markers()).toHaveLength(projects.length)
    markers().forEach((marker, position) => {
      expect(marker).toHaveAttribute('aria-hidden', 'true')
      expect(marker.nextElementSibling).toHaveAttribute(
        'id',
        projects[position].id,
      )
    })
  })

  it('724events arrive à 40 % : Argent Bank recouvert à 40 %, 724events arrivé à 40 %', () => {
    render(<Work />)
    scrollToMarkers(-2000, 600, 1600)
    const [argent, events, nina] = rooms()
    expect(value(argent, '--covered')).toBe('0.4')
    expect(value(events, '--arrival')).toBe('0.4')
    expect(value(events, '--covered')).toBe('0')
    expect(value(nina, '--arrival')).toBe('0')
  })

  it('Nina arrive à 70 % : c’est 724events qui recule, Argent Bank reste couvert', () => {
    render(<Work />)
    scrollToMarkers(-2000, -1000, 300)
    const [argent, events, nina] = rooms()
    expect(value(events, '--covered')).toBe('0.7')
    expect(value(nina, '--arrival')).toBe('0.7')
    expect(value(argent, '--covered')).toBe('1')
    expect(value(events, '--arrival')).toBe('1')
  })

  it('suit la hauteur réelle de l’écran (900 px)', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      configurable: true,
    })
    render(<Work />)
    scrollToMarkers(-2000, 450, 1600)
    const [argent, events] = rooms()
    expect(value(events, '--arrival')).toBe('0.5')
    expect(value(argent, '--covered')).toBe('0.5')
  })

  it.each([
    ['sous « réduire les animations »', () => preferReducedMotion()],
    [
      'sur un écran étroit (pas d’empilement)',
      () => window.happyDOM.setViewport({ width: 375, height: 812 }),
    ],
  ])('n’écrit rien %s : aucune règle n’y lit les variables', (_, setup) => {
    // les écrire recalculerait le style des pièces pour rien
    setup()
    render(<Work />)
    scrollToMarkers(-2000, 600, 1600)
    for (const room of rooms()) {
      expect(value(room, '--arrival')).toBe('')
      expect(value(room, '--covered')).toBe('')
    }
  })

  it("le premier projet n'arrive par-dessus personne : il n'a pas d'arrivée", () => {
    render(<Work />)
    scrollToMarkers(500, 1600, 2600)
    const [argent] = rooms()
    expect(value(argent, '--arrival')).toBe('')
  })

  it('calcule dès le montage (rechargement au milieu des projets)', () => {
    // happy-dom place tout en haut (0) : chaque projet est « arrivé »
    render(<Work />)
    const [argent, events] = rooms()
    expect(value(argent, '--covered')).toBe('1')
    expect(value(events, '--arrival')).toBe('1')
  })

  it('lit toutes les positions avant d’écrire : une seule mise en page par image', () => {
    render(<Work />)
    const order = []
    markers().forEach((marker) => {
      marker.getBoundingClientRect = () => {
        order.push('lecture')
        return { top: 500 }
      }
    })
    rooms().forEach((room) => {
      const set = room.style.setProperty.bind(room.style)
      room.style.setProperty = (...args) => {
        order.push('écriture')
        set(...args)
      }
    })
    fireEvent.scroll(window)
    vi.advanceTimersByTime(16)
    // aucune écriture avant la dernière lecture
    expect(order).toContain('écriture')
    expect(order.indexOf('écriture')).toBeGreaterThan(
      order.lastIndexOf('lecture'),
    )
  })
})
