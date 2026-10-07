import { Home } from './sections/Home/Home.jsx'
import { Work } from './sections/Work/Work.jsx'

// Les pièces du site, dans l'ordre (§ 8) — les suivantes arrivent une à une
export function App() {
  return (
    <main>
      <Home />
      <Work />
    </main>
  )
}
