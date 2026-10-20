// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss } from '../../testing/css.js'

// Les polices de secours ajustées (_fonts.scss) : pendant le chargement
// d'Inter et de Playfair, une police système redimensionnée occupe la même
// place, et le texte ne saute pas à leur arrivée. On compile l'entrée
// main.scss, comme readThemes : revue générale (19 oct.), retirer
// @forward 'fonts' de base/_index.scss laissait tous les tests verts
const css = compileScss(join(import.meta.dirname, '../main.scss'))

describe('_fonts.scss', () => {
  it.each([
    'Inter Fallback Arial',
    'Inter Fallback Roboto',
    'Playfair Fallback Georgia',
    'Playfair Fallback Times',
  ])('déclare la police de secours %s', (name) => {
    expect(css).toMatch(
      new RegExp(`@font-face \\{\\s*font-family: "${name}";[^}]*size-adjust`),
    )
  })

  it('les place juste après Inter, dans la pile du texte', () => {
    expect(css).toContain(
      'font-family: "Inter Variable", "Inter Fallback Arial", "Inter Fallback Roboto"',
    )
  })
})
