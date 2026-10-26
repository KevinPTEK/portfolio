// Règles partagées par les tests des données. Jamais de drapeau g ou y : une
// regex partagée avec ces drapeaux garde un état entre deux appels.

// au moins un caractère visible (pas vide, pas que des espaces)
export const FILLED = /\S/
// minuscules, chiffres et tirets : devient un id HTML (« argent-title ») ou un data-theme
export const SLUG = /^[a-z0-9-]+$/
// une adresse web complète et sécurisée : quelque chose après https://, aucune espace
export const HTTPS = /^https:\/\/\S+$/
// une image WebP de public/images, nom en kebab-case
export const IMAGE_PATH = /^\/images\/[a-z0-9-]+\.webp$/
// une espace simple là où le français veut une insécable : avant « : ; ! ? »
// et à l'intérieur des guillemets
export const UNPROTECTED_SPACE = / [:;!?»]|« /

// la même liste sans ses doublons : si elle diffère, le message d'échec montre le doublon
export const withoutDuplicates = (values) => [...new Set(values)]
