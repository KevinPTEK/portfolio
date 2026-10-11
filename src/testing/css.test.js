// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { mediaBlocks, outsideMedia } from './css.js'

// L'outil des tests du CSS compilé : une accolade dans une chaîne ou un
// commentaire ne doit ni couper un bloc @media, ni le faire tourner sans fin
describe('mediaBlocks', () => {
  it('découpe les blocs @media, avec leur requête', () => {
    const css =
      '.a { color: red; }\n@media (hover: hover) {\n  .b { color: blue; }\n}\n'
    expect(mediaBlocks(css)).toEqual([
      {
        query: '(hover: hover)',
        body: '\n  .b { color: blue; }\n',
        full: '@media (hover: hover) {\n  .b { color: blue; }\n}',
      },
    ])
    expect(outsideMedia(css)).toBe('.a { color: red; }\n\n')
  })

  it('ignore une accolade dans une chaîne (content: "}")', () => {
    const css =
      '@media print {\n  .a::after { content: "}"; }\n  .b { color: red; }\n}\n.c { color: blue; }'
    const [block] = mediaBlocks(css)
    expect(block.body).toContain('.b { color: red; }')
    expect(outsideMedia(css)).toBe('\n.c { color: blue; }')
  })

  it('ignore une accolade dans une adresse url("…") (l’ancien code tournait sans fin)', () => {
    const css =
      '@media print {\n  .a { background: url("data:image/svg+xml,<svg>{</svg>"); }\n}\n.c { color: blue; }'
    expect(mediaBlocks(css)).toHaveLength(1)
    expect(outsideMedia(css)).toBe('\n.c { color: blue; }')
  })

  it('accolades non équilibrées : une erreur claire, pas une boucle sans fin', () => {
    expect(() => mediaBlocks('@media print {\n  .a { color: red; }\n')).toThrow(
      'accolades non équilibrées',
    )
  })

  it('un guillemet échappé ne ferme pas la chaîne (content: "\\"}")', () => {
    const css =
      '@media print {\n  .a::after { content: "\\"}"; }\n  .b { color: red; }\n}\n.c { color: blue; }'
    expect(mediaBlocks(css)[0].body).toContain('.b { color: red; }')
    expect(outsideMedia(css)).toBe('\n.c { color: blue; }')
  })

  it('ignore une accolade dans un commentaire', () => {
    const css =
      '@media print {\n  /* } */\n  .b { color: red; }\n}\n.c { color: blue; }'
    expect(mediaBlocks(css)[0].body).toContain('.b { color: red; }')
    expect(outsideMedia(css)).toBe('\n.c { color: blue; }')
  })
})
