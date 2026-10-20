import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import profile from './data/profile.json'
import socials from './data/socials.json'

// Le index.html écrit à la main : ce que lisent les robots et les aperçus de
// partage, sans exécuter le JavaScript (§ 14). Revue générale (19 oct.) : il
// n'était testé nulle part — des données structurées invalides (une virgule
// en trop), une icône vers un fichier absent, lang="en" ou un profil LinkedIn
// différent de socials.json passaient tous les tests
const ROOT = join(import.meta.dirname, '..')
const page = new DOMParser().parseFromString(
  readFileSync(join(ROOT, 'index.html'), 'utf8'),
  'text/html',
)
const content = (selector) =>
  page.querySelector(selector)?.getAttribute('content')

describe('index.html', () => {
  it('est en français', () => {
    expect(page.documentElement.getAttribute('lang')).toBe('fr')
  })

  it('reprend son titre et sa description pour les aperçus de partage', () => {
    expect(content('meta[property="og:title"]')).toBe(page.title)
    expect(content('meta[property="og:description"]')).toBe(
      content('meta[name="description"]'),
    )
  })

  // au-delà, Google coupe la description dans ses résultats
  it('a une description de 155 caractères au plus', () => {
    const description = content('meta[name="description"]')
    expect(description.length).toBeGreaterThan(50)
    expect(description.length).toBeLessThanOrEqual(155)
  })

  it('a des données structurées valides, sur la personne du site', () => {
    const script = page.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script.textContent) // une virgule en trop : erreur
    expect(data['@type']).toBe('ProfilePage')
    expect(data.mainEntity.name).toBe(profile.name)
    // les mêmes profils que les liens de la page, dans le même ordre
    expect(data.mainEntity.sameAs).toEqual(socials.map(({ href }) => href))
  })

  it('pointe des icônes présentes dans public/, avec ce nom exact', () => {
    const files = readdirSync(join(ROOT, 'public'))
    const icons = [
      ...page.querySelectorAll(
        'link[rel="icon"], link[rel="apple-touch-icon"]',
      ),
    ].map((link) => link.getAttribute('href'))
    expect(icons).toHaveLength(3) // ICO, SVG, écran d'accueil iOS
    for (const href of icons) {
      expect(files, `icône absente : ${href}`).toContain(href.slice(1))
    }
  })
})
