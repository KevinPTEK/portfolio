// Règles partagées par les tests des fichiers de données (projects.json, sites.json…) :
// une seule définition, pour qu'une règle durcie dans un test le soit dans tous.
// Elles sont elles-mêmes testées dans rules.test.js. Jamais de drapeau g ou y :
// une regex partagée avec ces drapeaux garde un état entre deux appels.

// au moins un caractère visible (pas vide, pas que des espaces)
export const FILLED = /\S/
// minuscules, chiffres et tirets : devient un id HTML (« argent-title ») ou un data-theme
export const SLUG = /^[a-z0-9-]+$/
// une adresse web complète et sécurisée : quelque chose après https://, aucune espace
export const HTTPS = /^https:\/\/\S+$/
// une image WebP de public/images (servie à la racine du site), nom en kebab-case (§ 3.1)
export const IMAGE_PATH = /^\/images\/[a-z0-9-]+\.webp$/
// une espace simple là où le français veut une insécable (\u00a0) :
// avant « : ; ! ? » et à l'intérieur des guillemets — sinon la ligne peut couper juste là
export const UNPROTECTED_SPACE = / [:;!?»]|« /

// la même liste sans ses doublons : si elle diffère, le message d'échec montre le doublon
export const withoutDuplicates = (values) => [...new Set(values)]
