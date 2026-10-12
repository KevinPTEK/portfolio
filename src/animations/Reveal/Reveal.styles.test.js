// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks } from '../../testing/css.js'

// Les blocs partent invisibles (Motion écrit opacity: 0 dans l'attribut
// style) : trois cas où ils doivent se voir quand même
const css = compileScss(join(import.meta.dirname, 'Reveal.scss'))
const visible = /\{\s*opacity: 1 !important;\s*transform: none !important;\s*\}/

describe('Reveal.scss', () => {
  it('moteur absent (<html data-motion="off">) : tous les blocs visibles', () => {
    expect(css).toMatch(
      new RegExp(`\\[data-motion=["']?off["']?\\] \\.reveal ${visible.source}`),
    )
  })

  it('à l’impression : tous les blocs visibles', () => {
    const print = mediaBlocks(css).find(({ query }) => query === 'print')
    expect(print.body).toMatch(new RegExp(`\\.reveal ${visible.source}`))
  })

  it('le focus clavier entre dans un bloc encore caché : il apparaît', () => {
    // sinon l'anneau d'un lien atteint par Tab reste invisible le temps que
    // l'observateur réagisse et que le bloc monte (veille : révéler au focus)
    expect(css).toMatch(new RegExp(`\\.reveal:focus-within ${visible.source}`))
  })
})
