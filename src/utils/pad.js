/**
 * Écrit un nombre sur deux chiffres au moins, comme la maquette : 1 → « 01 ».
 * Sert aux numéros des pièces (« 01 / 03 », menu « 01 »…).
 *
 * @param {number} number
 * @returns {string}
 *
 * @example
 * pad(3) // « 03 »
 */
export function pad(number) {
  return String(number).padStart(2, '0')
}
