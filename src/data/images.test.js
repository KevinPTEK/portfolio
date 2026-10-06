import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import projects from './projects.json'
import sites from './sites.json'

// Les données donnent des adresses vers public/images (servi à la racine du site).
// Une image absente ne casse ni le build ni les autres tests : elle laisse un cadre vide.
// Budgets de la spec (§ 11) : capture ≤ 120 Ko, version floutée ≤ 4 Ko.

// 1 Ko = 1 000 octets, comme les « kB » des DevTools et de Lighthouse
const KB = 1000

// le dossier public/images du dépôt (on remonte de src/data à la racine).
// Pas de new URL(…, import.meta.url) : dans les tests, URL est celle de happy-dom,
// qui donne une adresse http://localhost:3000/… que node:fs ne sait pas lire.
const IMAGES_DIR = join(import.meta.dirname, '../../public/images')

// readdirSync rend les noms tels qu'ils sont écrits sur le disque. existsSync, lui,
// répond oui à « Nina-Cover.webp » pour « nina-cover.webp » : le disque du Mac ne
// distingue pas les majuscules, alors que le serveur Linux de Netlify répondrait 404.
const names = readdirSync(IMAGES_DIR)

// un fichier WebP commence par « RIFF », 4 octets de taille, puis « WEBP » :
// un fichier vide, un PNG renommé ou une page d'erreur enregistrée en .webp échouent
const isWebp = (file) => {
  const start = readFileSync(file).subarray(0, 12)
  return (
    start.toString('latin1', 0, 4) === 'RIFF' &&
    start.toString('latin1', 8, 12) === 'WEBP'
  )
}

const images = [
  ...projects.flatMap((project) => [
    { src: project.cover.src, budget: 120 * KB },
    { src: project.cover.blur, budget: 4 * KB },
  ]),
  ...sites.map((site) => ({ src: site.cover.src, budget: 120 * KB })),
]

describe.each(images)('$src', ({ src, budget }) => {
  const name = basename(src)
  const file = join(IMAGES_DIR, name)

  it('existe dans public/images, avec ce nom exact', () => {
    expect(names, `fichier manquant : public${src}`).toContain(name)
  })

  it('est un vrai fichier WebP', () => {
    expect(isWebp(file)).toBe(true)
  })

  it(`pèse au plus ${budget / KB} Ko`, () => {
    expect(statSync(file).size).toBeLessThanOrEqual(budget)
  })
})

it('public/images ne contient aucune image que les données ne citent pas', () => {
  // remplacer une capture = changer son nom (§ 5.1) : l'ancienne ne doit pas rester
  // et partir en ligne à chaque déploiement. Les fichiers cachés (.DS_Store du Finder)
  // sont ignorés.
  const cited = images.map(({ src }) => basename(src))
  const orphans = names.filter(
    (name) => !name.startsWith('.') && !cited.includes(name),
  )
  expect(orphans).toEqual([])
})
