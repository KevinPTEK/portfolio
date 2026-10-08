import { join } from 'node:path'
import { compile } from 'sass-embedded'

/**
 * Les thèmes tels que le navigateur les reçoit, pour les tests (Node
 * seulement : jamais importé par le site). On compile l'entrée main.scss et
 * non base/_themes.scss : un maillon de la chaîne d'imports oublié (§ 4.1)
 * vide la page de ses couleurs, et ce test le verrait.
 *
 * @returns {{ css: string, themes: { name: string, declarations: Record<string, string> }[] }}
 *   le CSS compilé, et un objet par bloc [data-theme=…] :
 *   son nom et ses déclarations (« --ink-2 » → « #523720 »)
 */
export function readThemes() {
  const { css } = compile(join(import.meta.dirname, 'main.scss'))

  // Sass retire les guillemets quand le nom n'en a pas besoin ('nina' → nina)
  // et passe aux guillemets doubles quand il en a besoin ("724events", qui
  // commence par un chiffre) : on accepte les trois écritures
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
