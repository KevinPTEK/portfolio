import { act } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Pour les tests seulement : happy-dom ne calcule aucune position, ce faux
// IntersectionObserver permet de dire « cette pièce croise la ligne ».
// À installer par useFakeIntersectionObserver(), en tête du describe.
export class FakeIntersectionObserver {
  static last = null

  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.targets = []
    this.disconnected = false
    FakeIntersectionObserver.last = this
  }

  observe(target) {
    this.targets.push(target)
  }

  disconnect() {
    this.disconnected = true
  }
}

// changes : { argent: true, home: false } → une entrée par pièce, dans cet ordre
export function cross(changes) {
  const entries = Object.entries(changes).map(([id, isIntersecting]) => ({
    target: document.getElementById(id),
    isIntersecting,
  }))
  act(() => FakeIntersectionObserver.last.callback(entries))
}

// Installe le faux avant chaque test (remis à zéro : aucun test ne pilote
// l'observateur du précédent) et rend ensuite le vrai et le thème du <body>
export function useFakeIntersectionObserver() {
  beforeEach(() => {
    FakeIntersectionObserver.last = null
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.body.dataset.theme
  })
}
