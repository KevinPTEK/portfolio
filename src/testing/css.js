// Pour les tests (Node) seulement : le CSS compilé d'un fichier Sass, et ses
// blocs @media — pour vérifier qu'une règle ne vit que là où elle doit
// (« le grossissement seulement si les animations ne sont pas réduites »)
import { compile } from 'sass-embedded'

export function compileScss(path) {
  return compile(path).css
}

// La position juste après l'accolade qui ferme le bloc ouvert avant `from`.
// Les chaînes ("…", '…') et les commentaires (/* … */) sont sautés : une
// accolade dedans ne compte pas (revue : un url("…{…") faisait tourner
// la boucle sans fin)
function closingBrace(css, from) {
  let depth = 1
  for (let i = from; i < css.length; i++) {
    const char = css[i]
    if (char === '"' || char === "'") {
      for (i++; i < css.length && css[i] !== char; i++) {
        if (css[i] === '\\') i++ // un guillemet échappé ne ferme pas la chaîne
      }
    } else if (char === '/' && css[i + 1] === '*') {
      i = css.indexOf('*/', i + 2)
      if (i === -1) break
      i++
    } else if (char === '{') {
      depth++
    } else if (char === '}' && --depth === 0) {
      return i + 1
    }
  }
  throw new Error('mediaBlocks : accolades non équilibrées')
}

/** Un bloc par @media, dans l'ordre : sa requête, son contenu, son texte entier */
export function mediaBlocks(css) {
  const blocks = []
  const opening = /@media ([^{]+)\{/g
  let match
  while ((match = opening.exec(css))) {
    const end = closingBrace(css, opening.lastIndex)
    blocks.push({
      query: match[1].trim(),
      body: css.slice(opening.lastIndex, end - 1),
      full: css.slice(match.index, end),
    })
  }
  return blocks
}

/** Le CSS hors de tout @media */
export function outsideMedia(css) {
  return mediaBlocks(css).reduce(
    (rest, { full }) => rest.replace(full, ''),
    css,
  )
}
