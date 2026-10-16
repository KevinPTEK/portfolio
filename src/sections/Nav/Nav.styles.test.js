// @vitest-environment node
// (Sass tourne dans Node : le DOM simulé n'a rien à faire ici)
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScss, mediaBlocks, outsideMedia } from '../../testing/css.js'

// Le rideau (§ 7.11) et le fondu des couleurs (§ 7.7) se voient dans le
// navigateur, et leur contraste se mesure (measure-theme-fade.mjs) ; ce qui
// casserait sans bruit se vérifie ici
const css = compileScss(join(import.meta.dirname, 'Nav.scss'))
const blocks = mediaBlocks(css)
const plain = outsideMedia(css)
const bodies = (query) =>
  blocks
    .filter((block) => block.query === query)
    .map(({ body }) => body)
    .join('\n')
const allowed = bodies('(prefers-reduced-motion: no-preference)')
const reduced = bodies('(prefers-reduced-motion: reduce)')

// Le contenu de la règle dont le sélecteur est exactement `selector`
// (« .nav » ne prend pas « .nav__link ») ; une règle absente fait échouer
// le test, au lieu de passer sur un texte vide
const rule = (source, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const found = source.match(
    new RegExp(`(?:^|\\n)\\s*${escaped} \\{([^}]*)\\}`),
  )
  expect(found, `règle ${selector}`).not.toBeNull()
  return found[1]
}

// Le fond glisse en S (il traverse vite les teintes moyennes, où aucun
// texte ne contraste : choix du 16 oct.), le texte change d'un coup à mi-chemin
const S = 'cubic-bezier(0.65, 0, 0.35, 1)'
const THEME_FADE = `--bg 0.7s ${S}, --line 0.7s ${S}, --surface 0.7s ${S}, --ink 0s linear 0.35s, --ink-2 0s linear 0.35s, --accent 0s linear 0.35s`

describe('Nav.scss — le rideau', () => {
  it('fermé : invisible (hors de la tabulation), rogné du bas jusqu’en haut', () => {
    const hidden = rule(plain, '.nav--hidden')
    expect(hidden).toContain('visibility: hidden;')
    expect(hidden).toContain('clip-path: inset(0 0 100% 0);')
  })

  it('ouvert, une forme (inset(0)) : depuis none, il sauterait d’un coup', () => {
    expect(rule(plain, '.nav')).toContain('clip-path: inset(0);')
  })

  it('s’ouvre en 0,7 s, et visibility le suit (visible pendant tout le trajet)', () => {
    expect(rule(plain, '.nav')).toContain(
      `transition: ${THEME_FADE}, clip-path 0.7s cubic-bezier(0.7, 0, 0.2, 1), visibility 0.7s;`,
    )
  })

  it('fermé après ouvert dans le fichier : à spécificité égale, la dernière règle gagne', () => {
    // .nav--hidden écrit avant .nav : inset(0) l'emporterait, le rideau ne se
    // fermerait plus (revue) ; et la règle réduite vient après la règle de base
    const at = (selector, from = 0) => css.indexOf(`\n${selector} {`, from)
    expect(at('.nav')).toBeGreaterThanOrEqual(0)
    expect(at('.nav--hidden')).toBeGreaterThan(at('.nav'))
    expect(at('  .nav--hidden', at('.nav--hidden'))).toBeGreaterThan(
      at('.nav--hidden'),
    )
  })
})

describe('Nav.scss — le fondu des couleurs (§ 7.7)', () => {
  it('le fond glisse en ligne droite, le texte change d’un coup à mi-chemin', () => {
    // la même liste dans les deux réglages : avec ou sans « réduire les
    // animations », une couleur n'est pas un mouvement (§ 10)
    expect(rule(plain, '.nav')).toContain(`transition: ${THEME_FADE},`)
    expect(rule(reduced, '.nav')).toContain(`transition: ${THEME_FADE},`)
  })
})

describe('Nav.scss — la cascade', () => {
  it('le contenu monte en 0,5 s, en douceur', () => {
    expect(rule(allowed, '.nav > *')).toContain(
      'transition: opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);',
    )
  })

  it('caché, il attend en bas, transparent', () => {
    expect(rule(allowed, '.nav--hidden > *')).toContain('opacity: 0;')
    expect(rule(allowed, '.nav--hidden > :not(.nav__identity)')).toContain(
      'transform: translateY(10px);',
    )
  })

  it("l'identité ne fait que paraître : l'avatar volant s'y pose (§ 7.9)", () => {
    // un seul déplacement dans tout le fichier, et il épargne l'identité
    // (translateY ou translate(0, …) : la revue a fait passer le second)
    // (?<!-) : text-transform ne compte pas
    expect(css.match(/(?<!-)transform:/g)).toHaveLength(1)
    expect(rule(allowed, '.nav--hidden > :not(.nav__identity)')).toContain(
      'transform:',
    )
  })

  it('dans l’ordre, 70 ms d’écart à partir de 0,25 s (rideau alors ouvert à 19 %)', () => {
    expect(
      [1, 2, 3, 4].map(
        (n) =>
          rule(allowed, `.nav:not(.nav--hidden) > :nth-child(${n})`).match(
            /transition-delay: ([\d.]+s);/,
          )[1],
      ),
    ).toEqual(['0.25s', '0.32s', '0.39s', '0.46s'])
  })

  it('seulement si les animations ne sont pas réduites', () => {
    expect(plain).not.toMatch(/\.nav--hidden > |\.nav > \*|transition-delay/)
    expect(reduced).not.toMatch(/\.nav--hidden > |\.nav > \*|transition-delay/)
  })
})

describe('Nav.scss — le document', () => {
  it('ne fond pas ses couleurs : la règle html de la nav ne pose que la marge de défilement', () => {
    expect(rule(plain, 'html')).not.toContain('transition')
  })
})

// L'arrivée sur la page (rechargement, lien direct vers une pièce sombre) :
// la nav s'ouvrait en kraft puis fondait vers le sombre, en repassant par le
// creux de contraste — à l'arrivée, ses couleurs ne fondent pas (16 oct.) ;
// le rideau, ou le fondu sous « réduire les animations », joue quand même
describe('Nav.scss — l’arrivée', () => {
  it('le rideau, sans fondu des couleurs', () => {
    expect(rule(plain, '.nav--arriving')).toMatch(
      /^\s*transition: clip-path 0\.7s cubic-bezier\(0\.7, 0, 0\.2, 1\), visibility 0\.7s;\s*$/,
    )
  })

  it('sous « réduire les animations » : le fondu de la nav, sans celui des couleurs', () => {
    expect(rule(reduced, '.nav--arriving')).toMatch(
      /^\s*transition: opacity 0\.2s linear, visibility 0\.2s;\s*$/,
    )
  })
})

describe('Nav.scss — sous « réduire les animations »', () => {
  it('un fondu de toute la nav, sans rideau', () => {
    expect(rule(reduced, '.nav')).toContain(
      `transition: ${THEME_FADE}, opacity 0.2s linear, visibility 0.2s;`,
    )
    expect(rule(reduced, '.nav--hidden')).toMatch(
      /^\s*clip-path: none;\s*opacity: 0;\s*$/,
    )
  })
})
