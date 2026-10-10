import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { preferReducedMotion } from '../testing/motion.js'
import { REDUCED_MOTION, useMediaQuery } from './useMediaQuery.js'

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('dit si « réduire les animations » est demandé', () => {
    expect(renderHook(() => useMediaQuery(REDUCED_MOTION)).result.current).toBe(
      false,
    )
    preferReducedMotion()
    expect(renderHook(() => useMediaQuery(REDUCED_MOTION)).result.current).toBe(
      true,
    )
  })

  it('lit la requête qu’on lui donne', () => {
    // happy-dom : une souris (hover: hover), un écran de 1 024 px
    expect(
      renderHook(() => useMediaQuery('(hover: hover)')).result.current,
    ).toBe(true)
    expect(
      renderHook(() => useMediaQuery('(min-width: 2000px)')).result.current,
    ).toBe(false)
  })

  // Un faux matchMedia fidèle au navigateur : un objet neuf à chaque appel,
  // ses propres écouteurs, et seul l'évènement « change » compte (revue)
  function fakeMatchMedia(state) {
    const lists = []
    let added = 0 // écouteurs « change » ajoutés depuis le début
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
      const listeners = new Set()
      const list = {
        listeners,
        query,
        get matches() {
          return state[query]
        },
        addEventListener: (type, listener) => {
          if (type !== 'change') return
          listeners.add(listener)
          added++
        },
        removeEventListener: (type, listener) => {
          if (type === 'change') listeners.delete(listener)
        },
      }
      lists.push(list)
      return list
    })
    // les objets qui ont, en ce moment, au moins un écouteur
    const listened = () => lists.filter(({ listeners }) => listeners.size > 0)
    const change = (query, matches) =>
      act(() => {
        state[query] = matches
        lists
          .filter((list) => list.query === query)
          .forEach(({ listeners }) =>
            listeners.forEach((listener) => listener()),
          )
      })
    return { listened, change, added: () => added }
  }

  it('suit les changements de la requête, puis se désabonne', () => {
    const media = fakeMatchMedia({ '(min-width: 640px)': false })
    const { result, unmount } = renderHook(() =>
      useMediaQuery('(min-width: 640px)'),
    )
    expect(result.current).toBe(false)
    media.change('(min-width: 640px)', true)
    expect(result.current).toBe(true)
    unmount()
    expect(media.listened()).toEqual([])
  })

  it('change de requête : quitte l’ancienne, écoute la nouvelle', () => {
    const media = fakeMatchMedia({
      '(min-width: 640px)': false,
      '(min-width: 1024px)': true,
    })
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: '(min-width: 640px)' },
      },
    )
    rerender({ query: '(min-width: 1024px)' })
    expect(result.current).toBe(true)
    expect(media.listened().map(({ query }) => query)).toEqual([
      '(min-width: 1024px)',
    ])
    media.change('(min-width: 1024px)', false)
    expect(result.current).toBe(false)
  })

  it('un nouveau rendu ne se réabonne pas', () => {
    // se réabonner à chaque rendu laisserait un seul écouteur actif à la
    // fois : on compte donc les ajouts, pas les écouteurs présents
    const media = fakeMatchMedia({ '(min-width: 640px)': false })
    const { rerender } = renderHook(() => useMediaQuery('(min-width: 640px)'))
    expect(media.added()).toBe(1)
    rerender()
    rerender()
    expect(media.added()).toBe(1)
  })
})
