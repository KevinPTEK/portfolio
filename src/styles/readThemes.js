import { join } from 'node:path'
import { compile } from 'sass-embedded'

/**
 * Les thèmes tels que le navigateur les reçoit (pour les tests, en Node) : on
 * compile l'entrée main.scss.
 *
 * @returns {{ css: string, themes: { name: string, declarations: Record<string, string> }[] }}
 *   le CSS compilé, et un objet par bloc [data-theme=…] :
 *   son nom et ses déclarations (« --ink-2 » → « #523720 »)
 */
export function readThemes() {
  const { css } = compile(join(import.meta.dirname, 'main.scss'))

  // Sass écrit le nom avec ou sans guillemets (nina, "724events")
  const blocks = css.matchAll(
    /\[data-theme=(["']?)([^\]"']+)\1\]\s*\{([^}]*)\}/g,
  )

  const themes = [...blocks].map(([, , name, block]) => ({
    name,
    // une déclaration par ligne : « --ink-2: #523720; »
    declarations: Object.fromEntries(
      [...block.matchAll(/^\s*([a-z0-9-]+):\s*([^;]+);/gm)].map(
        ([, property, value]) => [property, value.trim()],
      ),
    ),
  }))

  return { css, themes }
}
