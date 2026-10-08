import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteCard } from './SiteCard.jsx'

// Exemples d'usage : un site au code privé (le cas de Tourn&Marou), puis un
// site au code public — deux jeux de valeurs, pour qu'un texte écrit en dur
// ne puisse pas passer deux fois
const privateSite = {
  id: 'atelier',
  name: 'Atelier Lune',
  summary: "Le site vitrine d'un atelier de céramique.",
  tags: ['HTML', 'Sass', 'JavaScript'],
  links: { site: 'https://atelier-lune.example/' },
  cover: {
    src: '/images/atelier-cover.webp',
    alt: "Page d'accueil du site d'Atelier Lune",
  },
}

const publicSite = {
  id: 'fournee',
  name: 'La Fournée',
  summary: "Le site d'une boulangerie de quartier.",
  tags: ['Astro', 'CSS'],
  links: {
    site: 'https://la-fournee.example/',
    code: 'https://github.com/example/la-fournee',
  },
  cover: {
    src: '/images/fournee-cover.webp',
    alt: "Page d'accueil du site de La Fournée",
  },
}

describe('SiteCard', () => {
  it.each([privateSite, publicSite])(
    'titre de niveau 3 au nom du site : $name',
    (site) => {
      render(<SiteCard site={site} />)
      expect(
        screen.getByRole('heading', { level: 3, name: site.name }),
      ).toBeInTheDocument()
    },
  )

  it('affiche le résumé et les technologies, dans leur ordre', () => {
    render(<SiteCard site={publicSite} />)
    expect(
      screen.getByText("Le site d'une boulangerie de quartier."),
    ).toBeInTheDocument()
    const tags = screen.getAllByRole('listitem').map((item) => item.textContent)
    expect(tags).toEqual(['Astro', 'CSS'])
  })

  it.each([privateSite, publicSite])(
    'mène au site en ligne, nommé avec le site, dans un nouvel onglet : $name',
    (site) => {
      render(<SiteCard site={site} />)
      // entendu hors de la carte (liste des liens), le lien dit encore où il mène
      const link = screen.getByRole('link', {
        name: `Voir le site ${site.name} (nouvel onglet)`,
      })
      expect(link).toHaveAttribute('href', site.links.site)
      expect(link).toHaveAttribute('target', '_blank')
    },
  )

  it("sans code public, n'affiche que le lien vers le site", () => {
    render(<SiteCard site={privateSite} />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByText(/Voir le code/)).toBe(null)
  })

  it('avec un code public, le lien vers le code vient après celui du site', () => {
    render(<SiteCard site={publicSite} />)
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://la-fournee.example/',
      'https://github.com/example/la-fournee',
    ])
    expect(links[1]).toHaveAccessibleName(
      'Voir le code La Fournée (nouvel onglet)',
    )
  })

  it.each([privateSite, publicSite])(
    'montre la capture avec son texte alternatif, chargée en différé : $name',
    (site) => {
      render(<SiteCard site={site} />)
      const cover = screen.getByRole('img', { name: site.cover.alt })
      expect(cover).toHaveAttribute('src', site.cover.src)
      expect(cover).toHaveAttribute('loading', 'lazy')
    },
  )

  it('place le titre avant la capture dans le code', () => {
    // le titre ouvre la carte : un lecteur d'écran qui saute de titre en titre
    // ne rate pas la capture (elle repasse en premier à l'écran, en CSS)
    render(<SiteCard site={privateSite} />)
    const title = screen.getByRole('heading', { level: 3 })
    const cover = screen.getByRole('img')
    // DOCUMENT_POSITION_FOLLOWING : la capture vient après le titre
    expect(
      title.compareDocumentPosition(cover) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
