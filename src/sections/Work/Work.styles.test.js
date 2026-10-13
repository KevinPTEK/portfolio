// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, outsideMedia } from '../../testing/css.js'
import { STACK_QUERY } from './useProjectStack.js'

// Le passage entre projets (§ 7.10) : sa forme est dans Work.scss, ses
// valeurs (--covered, --arrival) viennent du défilement
const css = compileScss(join(import.meta.dirname, 'Work.scss'))
const stacked = mediaBlocks(css).filter(({ query }) =>
  query.includes('min-height: 700px'),
)
const withMotion = stacked
  .filter(({ query }) =>
    query.includes('prefers-reduced-motion: no-preference'),
  )
  .map(({ body }) => body)
  .join('\n')

describe('Work.scss — le passage entre projets', () => {
  it('le projet recouvert rétrécit de 7 % et se voile jusqu’à 55 %', () => {
    expect(withMotion).toContain(
      'transform: scale(calc(1 - 0.07 * var(--covered, 0)))',
    )
    expect(withMotion).toContain('opacity: calc(0.55 * var(--covered, 0))')
  })

  it('il recule depuis son haut (il reste collé en haut de l’écran)', () => {
    expect(withMotion).toContain('transform-origin: 50% 0')
  })

  it('le projet qui arrive : coins de 28 px et ombre, effacés à l’arrivée', () => {
    // Sass retire les calc() dans max(), inutiles là ; et écrit rgb() avec
    // des virgules : on lit le sens, pas l'écriture. Les quatre coins : en
    // haut, le plus grand des deux arrondis ; en bas, celui du recul (18 px)
    const arriving = '28px * (1 - var(--arrival, 1))'
    const receding = '18px * var(--covered, 0)'
    expect(withMotion).toContain(
      `border-radius: max(${arriving}, ${receding}) max(${arriving}, ${receding}) calc(${receding}) calc(${receding});`,
    )
    expect(withMotion).toMatch(
      /box-shadow: 0 -18px 40px rgb\(0,? 0,? 0(?:,| \/) ?calc\(0\.55 \* \(1 - var\(--arrival, 1\)\)\)\)/,
    )
  })

  it('le voile : un calque noir, au-dessus du contenu, qui laisse passer les clics', () => {
    const veil = withMotion.match(/\.work__project::after \{([^}]*)\}/)[1]
    for (const declaration of [
      'content: "";',
      'position: absolute;',
      'inset: 0;',
      'z-index: 1;',
      'pointer-events: none;',
      'background-color: #000;',
    ]) {
      expect(veil).toContain(declaration)
    }
  })

  it('les coins arrondis rognent le fond de la pièce (overflow: clip)', () => {
    expect(withMotion).toMatch(/\.work__project \{\s*overflow: clip;/)
  })

  it('autour de la pièce qui recule : du noir, pas le fond du <body>', () => {
    // le <body> prend sans fondu le thème de la pièce courante : ses bords
    // changeaient de couleur en plein passage (revue)
    expect(withMotion).toMatch(/\.work \{\s*background-color: #000;/)
  })

  it('à l’impression : ni recul, ni voile, ni ombre, ni coins', () => {
    const print = mediaBlocks(css)
      .filter(({ query }) => query === 'print')
      .map(({ body }) => body)
      .join('\n')
    expect(print).toMatch(
      /\.work__project \{\s*transform: none;\s*border-radius: 0;\s*box-shadow: none;/,
    )
    expect(print).toMatch(/\.work__project::after \{\s*display: none;/)
  })

  it('le hook n’écrit que là où cet effet existe : la même requête (STACK_QUERY)', () => {
    expect(mediaBlocks(css).some(({ query }) => query === STACK_QUERY)).toBe(
      true,
    )
  })

  it('les variables sont typées (@property) : un nombre, hérité par le voile', () => {
    // un nombre plutôt qu'un texte (recalcul plus rapide sur une pièce seule,
    // mesuré par la revue) ; hérité, sinon ::after ne voit plus --covered
    expect(css).toMatch(
      /@property --covered \{\s*syntax: "<number>";\s*inherits: true;\s*initial-value: 0;/,
    )
    expect(css).toMatch(
      /@property --arrival \{\s*syntax: "<number>";\s*inherits: true;\s*initial-value: 1;/,
    )
  })

  it('rien hors de l’empilement, rien sous « réduire les animations »', () => {
    // (les déclarations @property des deux variables mises à part)
    expect(
      outsideMedia(css).replace(/@property [^{]+\{[^}]*\}/g, ''),
    ).not.toMatch(/--covered|--arrival/)
    const elsewhere = stacked
      .filter(({ query }) => !query.includes('no-preference'))
      .map(({ body }) => body)
      .join('\n')
    expect(elsewhere).not.toMatch(/--covered|--arrival/)
  })

  it('décollée pour le clavier : ni rétrécie ni voilée (WCAG 2.4.11)', () => {
    const all = stacked.map(({ body }) => body).join('\n')
    expect(all).toMatch(
      /\.work__project:has\(:focus-visible\) \{\s*position: relative;\s*transform: none;/,
    )
    expect(all).toMatch(
      /\.work__project:has\(:focus-visible\)::after \{\s*opacity: 0;/,
    )
  })

  it('le repère : sans hauteur, il suit le flux', () => {
    expect(outsideMedia(css)).toMatch(/\.work__marker \{\s*height: 0;/)
  })
})
