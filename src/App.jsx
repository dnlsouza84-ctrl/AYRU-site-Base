import { useState, useEffect, useRef } from 'react'

import mapBg         from '../assets/home-mapa.jpg'
import logo          from '../assets/AYRU_Logo.png'
import ambientAudio  from '../audio/home-ambient.mp3'
import despertalayout  from '../assets/desperta-layout.jpg'
import raizLayout      from '../assets/raiz-layout.jpg'
import mareVivaLayout  from '../assets/mare-viva-layout.jpg'
import acendeLayout    from '../assets/acende-layout.jpg'
import soprLayout      from '../assets/sopro-layout.jpg'

// Spotify links — preencher quando disponível
const TRACKS = [
  { id: 'manifesto',  label: 'Manifesto',        layout: null,           spotify: null },
  { id: 'desperta',   label: '01 · Desperta',     layout: despertalayout, spotify: '#' },
  { id: 'raiz',       label: '02 · Raiz',          layout: raizLayout,     spotify: '#' },
  { id: 'mare-viva',  label: '03 · Maré Viva',    layout: mareVivaLayout, spotify: '#' },
  { id: 'acende',     label: '04 · Acende',        layout: acendeLayout,   spotify: '#' },
  { id: 'sopro',      label: '05 · Sopro',         layout: soprLayout,     spotify: '#' },
  { id: 'elementar',  label: '06 · Elementar',     layout: null,           spotify: null },
  { id: 'guia',       label: '07 · Guia',          layout: null,           spotify: null },
]

// Particles geradas uma vez, estáticas durante a sessão
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x:        Math.random() * 100,
  y:        Math.random() * 100,
  size:     Math.random() * 2.5 + 1,
  duration: Math.random() * 22 + 14,
  delay:   -(Math.random() * 22),
}))

export default function App() {
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [currentPage,  setCurrentPage]  = useState(null)   // null = home | track.id
  const [cursorPos,    setCursorPos]    = useState({ x: -200, y: -200 })
  const [appVisible,   setAppVisible]   = useState(false)

  const audioRef      = useRef(null)
  const interactedRef = useRef(false)

  // Fade-in inicial
  useEffect(() => {
    const t = setTimeout(() => setAppVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Cursor
  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  // Áudio ambiente
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.32
    audio.loop   = true

    const tryPlay = () => {
      if (interactedRef.current) return
      interactedRef.current = true
      audio.play().catch(() => {})
    }

    // Tenta autoplay; navegadores modernos bloqueiam sem interação
    audio.play().catch(() => {
      window.addEventListener('pointerdown', tryPlay, { once: true })
    })

    return () => window.removeEventListener('pointerdown', tryPlay)
  }, [])

  const handleTrackSelect = (track) => {
    if (!track.layout) return
    setMenuOpen(false)
    // Aguarda o menu fechar antes de trocar de página
    setTimeout(() => setCurrentPage(track.id), 480)
  }

  const handleBack = () => setCurrentPage(null)

  const currentTrack = TRACKS.find((t) => t.id === currentPage) ?? null

  return (
    <div
      className={`app${appVisible ? ' visible' : ''}`}
      onPointerDown={() => {
        // Garante início do áudio no primeiro toque/clique
        if (!interactedRef.current) {
          interactedRef.current = true
          audioRef.current?.play().catch(() => {})
        }
      }}
    >
      <audio ref={audioRef} src={ambientAudio} />

      {/* Cursor personalizado */}
      <div
        className="cursor-aura"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div
        className="cursor-dot"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Partículas de energia */}
      <div className="particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left:              `${p.x}%`,
              top:               `${p.y}%`,
              width:             p.size,
              height:            p.size,
              animationDuration: `${p.duration}s`,
              animationDelay:    `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Botão de menu — sempre visível */}
      <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
        <span /><span /><span />
      </button>

      {/* ── Home ── */}
      <div className={`page${currentPage ? ' hidden' : ' shown'}`}>
        <div
          className="home-bg"
          style={{ backgroundImage: `url(${mapBg})` }}
        />
        <div className="home-overlay" />
        <img src={logo} alt="AYRU" className="home-logo" />
      </div>

      {/* ── Página de música ── */}
      <div className={`page music-page${currentPage ? ' shown' : ' hidden'}`}>
        {currentTrack && (
          <>
            <img
              key={currentTrack.id}
              src={currentTrack.layout}
              alt={currentTrack.label}
              className="music-layout"
            />
            {currentTrack.spotify && (
              <a
                href={currentTrack.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn"
              >
                ouça agora
              </a>
            )}
          </>
        )}
        <button className="back-btn" onClick={handleBack}>
          ← voltar
        </button>
      </div>

      {/* ── Menu overlay ── */}
      <div className={`menu-overlay${menuOpen ? ' menu-open' : ''}`}>
        <button
          className="menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        >
          ✕
        </button>
        <nav className="menu-nav" key={menuOpen ? 'open' : 'closed'}>
          {TRACKS.map((track) => (
            <button
              key={track.id}
              className={`menu-item${!track.layout ? ' menu-item--soon' : ''}`}
              onClick={() => handleTrackSelect(track)}
              disabled={!track.layout}
            >
              {!track.layout && <span className="soon-tag">em breve</span>}
              {track.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
