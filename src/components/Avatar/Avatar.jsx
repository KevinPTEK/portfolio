import './Avatar.scss'

/**
 * Portrait rond, à une taille fixe. Avec srcSet, le navigateur choisit
 * le fichier adapté à la taille affichée et à la densité de l'écran.
 *
 * @param {object} props
 * @param {string} props.src - image par défaut
 * @param {string} [props.srcSet] - autres largeurs (« avatar-128.webp 128w, … »)
 * @param {string} props.alt - texte alternatif ; "" si le nom est déjà écrit à côté
 * @param {number} props.size - diamètre affiché, en pixels
 * @param {'lazy' | 'eager'} [props.loading] - "lazy" sous la ligne de flottaison
 * @param {string} [props.className] - mix BEM : la classe du parent qui place le portrait
 * @param {import('react').Ref<HTMLImageElement>} [props.ref] - l'image
 */
export function Avatar({ src, srcSet, alt, size, loading, className, ref }) {
  return (
    <img
      ref={ref}
      className={className ? `avatar ${className}` : 'avatar'}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? `${size}px` : undefined}
      alt={alt}
      width={size}
      height={size}
      loading={loading}
    />
  )
}
