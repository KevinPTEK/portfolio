import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  COVER_ORIGINAL,
  coverVariants,
} from '../components/Cover/coverSrcSet.js'
import projects from './projects.json'
import sites from './sites.json'

// Les images de public/images citées par les données : une image absente ne
// casse rien d'autre, elle laisse un cadre vide. Budgets : capture ≤ 120 Ko,
// version floutée ≤ 4 Ko.

// 1 Ko = 1 000 octets, comme les « kB » des DevTools et de Lighthouse
const KB = 1000

// pas de new URL(…, import.meta.url) : sous happy-dom, node:fs ne la lit pas
const IMAGES_DIR = join(import.meta.dirname, '../../public/images')

// readdirSync rend les noms exacts : le disque du Mac ignore les majuscules,
// pas le serveur de Netlify (existsSync dirait oui à tort)
const names = readdirSync(IMAGES_DIR)

// un WebP commence par « RIFF », 4 octets de taille, puis « WEBP »
const isWebp = (file) => {
  const start = readFileSync(file).subarray(0, 12)
  return (
    start.toString('latin1', 0, 4) === 'RIFF' &&
    start.toString('latin1', 8, 12) === 'WEBP'
  )
}

// largeur et hauteur, lues dans le bloc VP8X (celui qu'écrit Chrome) : moins
// 1, sur 3 octets, aux octets 24 et 27 ; un autre bloc est signalé
const webpSize = (file) => {
  const header = readFileSync(file).subarray(0, 30)
  const chunk = header.toString('latin1', 12, 16)
  if (chunk !== 'VP8X') {
    throw new Error(`bloc ${chunk} : lecture des dimensions à ajouter`)
  }
  return {
    width: 1 + header.readUIntLE(24, 3),
    height: 1 + header.readUIntLE(27, 3),
  }
}

// une capture et ses versions plus petites : plus légères que l'originale,
// à la largeur que le srcset annonce, au format 4 : 3
const cover = (src) => [
  { src, budget: 120 * KB, ...COVER_ORIGINAL },
  ...coverVariants(src).map((variant) => ({
    src: variant.src,
    budget: 120 * KB,
    original: src,
    width: variant.width,
    height: (variant.width * COVER_ORIGINAL.height) / COVER_ORIGINAL.width,
  })),
]

const images = [
  ...projects.flatMap((project) => [
    ...cover(project.cover.src),
    { src: project.cover.blur, budget: 4 * KB },
  ]),
  ...sites.flatMap((site) => cover(site.cover.src)),
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

describe.each(images.filter(({ original }) => original))(
  '$src',
  ({ src, original }) => {
    it('pèse moins que l’originale', () => {
      const size = (path) => statSync(join(IMAGES_DIR, basename(path))).size
      expect(size(src)).toBeLessThan(size(original))
    })
  },
)

// une version mal fabriquée mentirait au srcset sans rien casser
describe.each(images.filter(({ width }) => width))(
  '$src',
  ({ src, width, height }) => {
    it(`fait ${width} × ${height} px, comme annoncé`, () => {
      expect(webpSize(join(IMAGES_DIR, basename(src)))).toEqual({
        width,
        height,
      })
    })
  },
)

it('public/images ne contient aucune image que les données ne citent pas', () => {
  // remplacer une capture = changer son nom : l'ancienne ne doit pas rester
  // (fichiers cachés ignorés)
  const cited = images.map(({ src }) => basename(src))
  const orphans = names.filter(
    (name) => !name.startsWith('.') && !cited.includes(name),
  )
  expect(orphans).toEqual([])
})
