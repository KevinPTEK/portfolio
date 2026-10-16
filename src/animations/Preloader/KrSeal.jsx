import * as m from 'motion/react-m'
import { STROKES, ring, seal, stroke } from './seal.js'
import './KrSeal.scss'

/**
 * Le sceau « KR » de l'intro (§ 7.4) : un cercle et six traits qui se
 * dessinent (pathLength de 0 à 1), puis qui se dissolvent à l'ouverture —
 * ou s'effacent vite si le visiteur a fait un geste.
 *
 * @param {object} props
 * @param {'drawing' | 'opening' | 'ready'} props.phase
 * @param {boolean} props.rushed
 *
 * @example
 * <KrSeal phase="drawing" rushed={false} />
 */
export function KrSeal({ phase, rushed }) {
  let state = 'dissolved'
  if (rushed) state = 'gone'
  else if (phase === 'drawing') state = 'drawn'

  return (
    <m.div className="kr-seal" initial="hidden" animate={state} variants={seal}>
      <svg className="kr-seal__mono" viewBox="0 0 240 240">
        <m.circle
          className="kr-seal__ring"
          cx="120"
          cy="120"
          r="108"
          transform="rotate(-90 120 120)"
          variants={ring}
        />
        <g transform="translate(120 120) scale(0.62) translate(-95 -60)">
          {STROKES.map(({ d, delay, accent }) => (
            <m.path
              key={d}
              d={d}
              custom={delay}
              variants={stroke}
              className={
                accent
                  ? 'kr-seal__stroke kr-seal__stroke--accent'
                  : 'kr-seal__stroke'
              }
            />
          ))}
        </g>
      </svg>
    </m.div>
  )
}
