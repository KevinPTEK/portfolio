import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProjectDetails } from './ProjectDetails.jsx'

// Exemple d'usage : le détail de Nina Carducci (avec site), 3e de 3
const nina = {
  id: 'nina',
  name: 'Nina Carducci',
  title: 'Nina Carducci.',
  accentWord: 'Carducci.',
  summary: "L'optimisation du site d'une photographe.",
  context: 'Une photographe à Bordeaux.',
  challenges: ['Alléger les photos', 'Supprimer les sauts de mise en page'],
  learned: ['Lire un audit Lighthouse', 'Le référencement local'],
  tags: ['Lighthouse', 'SEO'],
  links: {
    site: 'https://kevinptek.github.io/ninacarducci/',
    code: 'https://github.com/KevinPTEK/ninacarducci',
  },
  cover: { src: '/images/nina-cover.webp', alt: "Page d'accueil de Nina" },
}

// Argent Bank : pas de site publié, seulement le code
const argent = {
  ...nina,
  id: 'argent',
  name: 'Argent Bank',
  title: 'Argent Bank.',
  accentWord: 'Bank.',
  links: { code: 'https://github.com/KevinPTEK/ArgentBank' },
}

function renderDetails(props) {
  return render(
    <ProjectDetails
      project={nina}
      index={2}
      total={3}
      titleId="nina-details-title"
      nextName="Argent Bank"
      onNext={() => {}}
      {...props}
    />,
  )
}

describe('ProjectDetails', () => {
  it('titre de niveau 2 avec son id', () => {
    renderDetails()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title).toHaveAttribute('id', 'nina-details-title')
    expect(title.textContent).toBe('Nina Carducci.')
  })

  // deux jeux de valeurs : un calcul faux ne peut pas tomber juste deux fois
  // (avec index 2 sur 3 seulement, « total / total » passerait)
  it.each([
    [0, 3, '01 / 03'],
    [4, 12, '05 / 12'],
  ])('place %i sur %i : affiche « %s »', (index, total, label) => {
    renderDetails({ index, total })
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it.each([
    ['Contexte', ['Une photographe à Bordeaux.']],
    [
      'Problèmes rencontrés',
      ['Alléger les photos', 'Supprimer les sauts de mise en page'],
    ],
    [
      "Ce que j'ai appris",
      ['Lire un audit Lighthouse', 'Le référencement local'],
    ],
    ['Technologies', ['Lighthouse', 'SEO']],
  ])(
    'rubrique « %s » : un titre de niveau 3, puis son contenu',
    (heading, texts) => {
      renderDetails()
      // le contenu est dans la même rubrique que son titre (pas ailleurs dans le détail)
      const part = screen.getByRole('heading', {
        level: 3,
        name: heading,
      }).parentElement
      for (const text of texts) {
        expect(within(part).getByText(text)).toBeInTheDocument()
      }
    },
  )

  it('liste les problèmes et les apprentissages dans leur ordre', () => {
    renderDetails()
    const lists = screen.getAllByRole('list').map((list) =>
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    )
    expect(lists).toContainEqual(nina.challenges)
    expect(lists).toContainEqual(nina.learned)
  })

  it('mène au site et au code, en nouvel onglet, nommés avec le projet', () => {
    renderDetails()
    expect(
      screen.getByRole('link', {
        name: 'Voir le site Nina Carducci (nouvel onglet)',
      }),
    ).toHaveAttribute('href', nina.links.site)
    expect(
      screen.getByRole('link', {
        name: 'Voir le code Nina Carducci (nouvel onglet)',
      }),
    ).toHaveAttribute('href', nina.links.code)
  })

  it("sans site publié, n'affiche que le lien vers le code", () => {
    renderDetails({ project: argent })
    // ni lien, ni bouton : sans adresse, Button rendrait un <button> « Voir le site »
    expect(screen.queryByText(/Voir le site/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Voir le code Argent Bank (nouvel onglet)',
      }),
    ).toHaveAttribute('href', argent.links.code)
  })

  it('« Projet suivant » annonce le projet suivant et le demande', async () => {
    const user = userEvent.setup()
    const handleNext = vi.fn()
    renderDetails({ onNext: handleNext })
    await user.click(
      screen.getByRole('button', { name: 'Projet suivant : Argent Bank' }),
    )
    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('montre la capture avec son texte alternatif', () => {
    renderDetails()
    const cover = screen.getByRole('img', { name: nina.cover.alt })
    expect(cover).toHaveAttribute('src', nina.cover.src)
    // la modale est montée dès le départ : sans lazy, sa capture se chargerait tout de suite
    expect(cover).toHaveAttribute('loading', 'lazy')
  })

  it('transmet titleRef au titre, pour y placer le focus', () => {
    const titleRef = { current: null }
    renderDetails({ titleRef })
    expect(titleRef.current).toBe(screen.getByRole('heading', { level: 2 }))
  })
})
