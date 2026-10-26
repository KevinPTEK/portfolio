/**
 * Un nombre sur deux chiffres au moins : 1 → « 01 ».
 *
 * @param {number} number
 * @returns {string}
 */
export function pad(number) {
  return String(number).padStart(2, '0')
}
