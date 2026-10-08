import { useCurrentRoom } from './animations/useCurrentRoom.js'
import { SkipLink } from './components/SkipLink/SkipLink.jsx'
import { menuItems } from './data/menuItems.js'
import { Home } from './sections/Home/Home.jsx'
import { Nav } from './sections/Nav/Nav.jsx'
import { Work } from './sections/Work/Work.jsx'
import './App.scss'

// les cibles du menu : la section courante est celle qui contient la pièce
const SECTION_IDS = menuItems.map(({ id }) => id)

// Les pièces du site, dans l'ordre (§ 8) — les suivantes arrivent une à une
export function App() {
  const { room, section } = useCurrentRoom(SECTION_IDS)

  return (
    <>
      <SkipLink href="#main">Aller au contenu</SkipLink>
      {/* cachée au chargement et sur l'accueil : le menu géant y fait office de nav */}
      <Nav
        currentSection={section}
        isHidden={room === null || room === 'home'}
      />
      {/* tabIndex -1 : la cible du lien d'évitement reçoit vraiment le focus */}
      <main className="main" id="main" tabIndex={-1}>
        <Home />
        <Work />
      </main>
    </>
  )
}
