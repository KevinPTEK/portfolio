import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  COVER_ORIGINAL,
  coverVariants,
} from '../components/Cover/coverSrcSet.js'
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

// la largeur et la hauteur, lues dans l'en-tête. Nos WebP (encodés par Chrome :
// bake-covers.mjs) sont tous « étendus » : après « RIFF…WEBP », un bloc VP8X où
// chacune est rangée moins 1, sur 3 octets (aux octets 24 et 27). Un WebP d'un
// autre outil (cwebp : bloc VP8 ou VP8L) les range ailleurs : on le dit
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

// une capture, et ses versions plus petites (Cover, étape 5) : chacune doit
// peser moins que l'originale, sinon elle ne sert à rien ; chacune a la
// largeur que le srcset annonce, au format 4 : 3
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

// le srcset annonce 600w, 900w, 1200w, et width / height réservent du 4 : 3 :
// une version mal fabriquée (la 600 enregistrée sous le nom de la 900)
// mentirait au navigateur sans rien casser — image floue sur un téléphone, ou
// octets en trop (revue de l'étape 5)
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
  // remplacer une capture = changer son nom (§ 5.1) : l'ancienne ne doit pas rester
  // et partir en ligne à chaque déploiement. Les fichiers cachés (.DS_Store du Finder)
  // sont ignorés.
  const cited = images.map(({ src }) => basename(src))
  const orphans = names.filter(
    (name) => !name.startsWith('.') && !cited.includes(name),
  )
  expect(orphans).toEqual([])
})
