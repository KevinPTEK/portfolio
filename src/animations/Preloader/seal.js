// Le sceau « KR » de l'intro : ses traits et ses mouvements (KrSeal les dessine)
import { EASE_OUT } from '../variants.js'

// les six traits du K et du R, dans l'ordre du tracé ; delay compte à partir
// de 0,7 s, quand le cercle se referme
export const STROKES = [
  { d: 'M22 12 V108', delay: 0 },
  { d: 'M22 64 L74 12', delay: 0.13 },
  { d: 'M22 64 L78 108', delay: 0.26 },
  { d: 'M106 108 V12', delay: 0.46, accent: true },
  { d: 'M106 12 H136 A24 24 0 0 1 136 60 H106', delay: 0.59, accent: true },
  { d: 'M132 60 L168 108', delay: 0.74, accent: true },
]

export const seal = {
  hidden: { opacity: 0, scale: 0.92 },
  drawn: { opacity: 1, scale: 1, transition: { duration: 1, ease: EASE_OUT } },
  // il inspire, puis se dissout en lumière : grandit, s'éclaircit, se floute, s'efface
  dissolved: {
    opacity: [1, 1, 0],
    scale: [1, 1.035, 1.25],
    filter: [
      'blur(0px) brightness(1)',
      'blur(0px) brightness(1.1)',
      'blur(20px) brightness(1.6)',
    ],
    transition: { duration: 1.6, times: [0, 0.2, 1], ease: [0.45, 0, 0.2, 1] },
  },
  // le visiteur a fait un geste : il s'efface vite
  gone: { opacity: 0, transition: { duration: 0.3 } },
}

// le cercle part de midi et se referme
export const ring = {
  hidden: { pathLength: 0 },
  drawn: {
    pathLength: 1,
    transition: { duration: 1.15, delay: 0.1, ease: [0.65, 0, 0.35, 1] },
  },
}

export const stroke = {
  hidden: { pathLength: 0 },
  drawn: (delay) => ({
    pathLength: 1,
    transition: { duration: 0.6, delay: 0.7 + delay, ease: [0.5, 0, 0.2, 1] },
  }),
}
