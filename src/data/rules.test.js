import { describe, expect, it } from 'vitest'
import {
  FILLED,
  HTTPS,
  IMAGE_PATH,
  SLUG,
  UNPROTECTED_SPACE,
  withoutDuplicates,
} from './rules.js'

// Les règles servent à tous les tests de données : une règle affaiblie par erreur
// (un ^ oublié, withoutDuplicates qui ne retire plus rien…) laisserait passer
// les fautes partout, en silence, puisque les données actuelles sont justes.
// Chaque règle est donc testée avec des exemples qu'elle doit accepter et refuser.

describe.each([
  {
    name: 'FILLED',
    rule: FILLED,
    valid: ['a', ' a '],
    invalid: ['', '   ', '\u00a0'],
  },
  {
    name: 'SLUG',
    rule: SLUG,
    valid: ['nina', 'argent-bank', '724events'],
    invalid: ['', 'Nina', 'argent bank', 'tourn&marou', 'café'],
  },
  {
    name: 'HTTPS',
    rule: HTTPS,
    valid: ['https://a.fr', 'https://a.fr/page?x=1'],
    invalid: [
      'http://a.fr',
      'https://',
      'ftp://a.fr',
      'https://a .fr',
      ' https://a.fr',
      'https://a.fr ',
    ],
  },
  {
    name: 'IMAGE_PATH',
    rule: IMAGE_PATH,
    valid: ['/images/nina-cover.webp', '/images/nina-cover-blur.webp'],
    invalid: [
      '/images/nina-cover.png',
      '/images/.webp',
      'images/nina-cover.webp',
      '/public/images/nina-cover.webp',
      '/images/nina-cover.webp.png',
      '/autre/nina-cover.webp',
      '/images/Nina-cover.webp',
      '/images/nina cover.webp',
      '/images/projets/nina-cover.webp',
    ],
  },
])('$name', ({ rule, valid, invalid }) => {
  it.each(valid)('accepte « %s »', (text) => {
    expect(text).toMatch(rule)
  })

  it.each(invalid)('refuse « %s »', (text) => {
    expect(text).not.toMatch(rule)
  })
})

describe('UNPROTECTED_SPACE', () => {
  // cette règle cherche une faute : elle doit la trouver…
  it.each([
    'Redux : slices',
    'a ; b',
    'Vraiment ?',
    'Oui !',
    'la case « Remember',
    'Remember me » est cochée',
  ])("repère l'espace simple dans « %s »", (text) => {
    expect(text).toMatch(UNPROTECTED_SPACE)
  })

  // … et laisser passer un texte juste
  it.each([
    'Redux\u00a0: slices',
    '«\u00a0Remember me\u00a0»',
    'https://a.fr',
    'Given / When / Then',
  ])('laisse passer « %s »', (text) => {
    expect(text).not.toMatch(UNPROTECTED_SPACE)
  })
})

describe('withoutDuplicates', () => {
  it("retire les doublons et garde l'ordre de première apparition", () => {
    expect(withoutDuplicates(['b', 'a', 'b', 'c', 'a'])).toEqual([
      'b',
      'a',
      'c',
    ])
  })
})
