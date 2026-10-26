import { FlyingAvatar } from './animations/FlyingAvatar/FlyingAvatar.jsx'
import { Preloader } from './animations/Preloader/Preloader.jsx'
import { usePreloader } from './animations/Preloader/usePreloader.js'
import { useCurrentRoom } from './animations/useCurrentRoom.js'
import { useScrollTo } from './animations/useScrollTo.js'
import { SkipLink } from './components/SkipLink/SkipLink.jsx'
import { menuItems } from './data/menuItems.js'
import { About } from './sections/About/About.jsx'
import { Contact } from './sections/Contact/Contact.jsx'
import { Footer } from './sections/Footer/Footer.jsx'
import { Home } from './sections/Home/Home.jsx'
import { Nav } from './sections/Nav/Nav.jsx'
import { Skills } from './sections/Skills/Skills.jsx'
import { Work } from './sections/Work/Work.jsx'
import './App.scss'

// les cibles du menu : la section courante est celle qui contient la pièce
const SECTION_IDS = menuItems.map(({ id }) => id)

// les pièces du site, dans l'ordre
export function App() {
  const intro = usePreloader()
  // l'accueil et l'avatar volant entrent quand l'intro rend la main
  const entered = intro.phase === 'ready' || intro.phase === 'done'
  const { room, section, arriving } = useCurrentRoom(SECTION_IDS)
  useScrollTo()

  return (
    <>
      <Preloader phase={intro.phase} rushed={intro.rushed} />
      <SkipLink href="#main">Aller au contenu</SkipLink>
      {/* cachée sur l'accueil : le menu géant y fait office de nav */}
      <Nav
        currentSection={section}
        isArriving={arriving}
        isHidden={room === null || room === 'home'}
      />
      <FlyingAvatar entered={entered} />
      {/* tabIndex -1 : la cible du lien d'évitement reçoit le focus */}
      <main className="main" id="main" tabIndex={-1}>
        <Home entered={entered} />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>
      {/* après <main>, hors de toute section : <footer> est le repère contentinfo */}
      <Footer />
    </>
  )
}
