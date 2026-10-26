// Une capture existe en trois largeurs : l'originale (« argent-cover.webp »)
// et ses versions nommées par leur largeur (« argent-cover-600.webp »)
export const COVER_WIDTHS = [600, 900]
export const COVER_ORIGINAL = { width: 1200, height: 900 } // 4 : 3

/**
 * Les versions plus petites d'une capture.
 *
 * @param {string} src - l'originale (« /images/argent-cover.webp »)
 * @returns {{ src: string, width: number }[]}
 */
export function coverVariants(src) {
  const base = src.replace(/\.webp$/, '')
  return COVER_WIDTHS.map((width) => ({ src: `${base}-${width}.webp`, width }))
}

/**
 * Le srcset d'une capture : ses versions plus petites, puis l'originale.
 *
 * @param {string} src - l'originale
 * @returns {string} « …-600.webp 600w, …-900.webp 900w, ….webp 1200w »
 */
export function coverSrcSet(src) {
  return [...coverVariants(src), { src, width: COVER_ORIGINAL.width }]
    .map((version) => `${version.src} ${version.width}w`)
    .join(', ')
}
