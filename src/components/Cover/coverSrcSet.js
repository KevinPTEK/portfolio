// Les captures de projet (§ 5.1) : l'originale fait 1 200 px de large
// (« argent-cover.webp ») ; à côté d'elle, des versions plus petites nommées
// par leur largeur (« argent-cover-600.webp »), fabriquées par
// docs/outils/bake-covers.mjs. Un ordinateur prend la 600, un téléphone
// (écran ×2) la 900, un téléphone ×3 ou un écran Retina l'originale
export const COVER_WIDTHS = [600, 900]
// les dimensions de l'originale, au format 4 : 3
export const COVER_ORIGINAL = { width: 1200, height: 900 }

/**
 * Les versions plus petites d'une capture, à côté de l'originale.
 *
 * @param {string} src - l'originale (« /images/argent-cover.webp »)
 * @returns {{ src: string, width: number }[]}
 *
 * @example
 * coverVariants('/images/argent-cover.webp') // [{ src: '/images/argent-cover-600.webp', width: 600 }, …]
 */
export function coverVariants(src) {
  const base = src.replace(/\.webp$/, '')
  return COVER_WIDTHS.map((width) => ({ src: `${base}-${width}.webp`, width }))
}

/**
 * Le srcset d'une capture : ses versions plus petites, puis l'originale.
 *
 * @param {string} src - l'originale (« /images/argent-cover.webp »)
 * @returns {string} « …-600.webp 600w, …-900.webp 900w, ….webp 1200w »
 *
 * @example
 * coverSrcSet('/images/argent-cover.webp')
 */
export function coverSrcSet(src) {
  return [...coverVariants(src), { src, width: COVER_ORIGINAL.width }]
    .map((version) => `${version.src} ${version.width}w`)
    .join(', ')
}
