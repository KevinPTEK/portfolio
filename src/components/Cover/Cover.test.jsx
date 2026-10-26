import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cover } from './Cover.jsx'
import { coverSrcSet } from './coverSrcSet.js'

// Exemple d'usage : la capture d'une carte de projet
const cover = {
  src: '/images/argent-cover.webp',
  alt: 'Page d’accueil d’Argent Bank',
}
const image = () => screen.getByRole('img', { name: cover.alt })

describe('Cover', () => {
  it('affiche la capture, avec son texte alternatif', () => {
    render(
      <Cover cover={cover} sizes="100vw" className="project-card__cover" />,
    )
    expect(image()).toHaveAttribute('src', cover.src)
  })

  // le navigateur choisit la largeur : il mesure lui-même la place
  // (sizes="auto", images différées) ; s'il ne connaît pas encore auto
  // (Safari avant 27, Firefox avant 150), il lit la liste donnée par le
  // parent, qui connaît sa mise en page
  it('propose ses trois largeurs ; la place mesurée, sinon celle du parent', () => {
    render(
      <Cover
        cover={cover}
        sizes="(min-width: 640px) 50vw, 100vw"
        className="project-card__cover"
      />,
    )
    expect(image()).toHaveAttribute('srcset', coverSrcSet(cover.src))
    expect(image()).toHaveAttribute(
      'sizes',
      'auto, (min-width: 640px) 50vw, 100vw',
    )
  })

  // cachée avec sa modale, une image « auto » serait remesurée à 100vw
  it('autoSizes={false} : la liste du parent seule, sans mesure', () => {
    render(
      <Cover
        cover={cover}
        sizes="(min-width: 1024px) 481px, 100vw"
        autoSizes={false}
        className="project-details__cover"
      />,
    )
    expect(image()).toHaveAttribute('sizes', '(min-width: 1024px) 481px, 100vw')
  })

  it('réserve sa place (4 : 3) et se charge en différé', () => {
    render(
      <Cover cover={cover} sizes="100vw" className="project-card__cover" />,
    )
    expect(image()).toHaveAttribute('width', '1200')
    expect(image()).toHaveAttribute('height', '900')
    expect(image()).toHaveAttribute('loading', 'lazy')
  })

  it('reçoit la classe de son parent : le cadre et la place sont à lui', () => {
    render(<Cover cover={cover} sizes="100vw" className="site-card__cover" />)
    expect(image()).toHaveClass('site-card__cover')
  })
})
