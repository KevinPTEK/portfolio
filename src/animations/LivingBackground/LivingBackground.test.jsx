import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LivingBackground } from './LivingBackground.jsx'

// Le fond d'une pièce : du papier (pièces personnelles) ou la capture
// floutée d'un projet. Décoratif : rien à lire, rien à annoncer.
// Son rendu (calques, fusions, contraste) se vérifie dans le navigateur (§ 7.8).

function renderBackground(props) {
  const { container } = render(<LivingBackground {...props} />)
  return container.firstElementChild
}

describe('LivingBackground', () => {
  it.each([{}, { variant: 'cover', image: '/images/argent-cover-blur.webp' }])(
    "est caché aux lecteurs d'écran : %o",
    (props) => {
      expect(renderBackground(props)).toHaveAttribute('aria-hidden', 'true')
    },
  )

  it('est du papier kraft par défaut, sans image', () => {
    const background = renderBackground()
    expect(background).toHaveClass(
      'living-background',
      'living-background--paper',
      'living-background--kraft',
    )
    expect(background.querySelector('img')).toBe(null)
  })

  it.each(['kraft', 'cool'])('prend le ton de papier « %s »', (tone) => {
    const background = renderBackground({ tone })
    expect(background).toHaveClass(`living-background--${tone}`)
    // un seul ton à la fois
    const other = tone === 'kraft' ? 'cool' : 'kraft'
    expect(background).not.toHaveClass(`living-background--${other}`)
  })

  // deux images : une adresse écrite en dur ne peut pas passer deux fois
  it.each(['/images/argent-cover-blur.webp', '/images/nina-cover-blur.webp'])(
    'montre la capture floutée %s, décorative et chargée en différé',
    (image) => {
      const background = renderBackground({ variant: 'cover', image })
      expect(background).toHaveClass(
        'living-background',
        'living-background--cover',
      )
      // le ton n'appartient qu'au papier
      expect(background).not.toHaveClass('living-background--kraft')
      const img = background.querySelector('img')
      expect(img).toHaveAttribute('src', image)
      // alt vide : l'image n'apporte rien à lire (W3C, images décoratives)
      expect(img).toHaveAttribute('alt', '')
      expect(img).toHaveAttribute('loading', 'lazy')
    },
  )
})
