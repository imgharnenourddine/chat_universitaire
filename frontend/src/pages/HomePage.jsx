// pages/HomePage.jsx
// ✅ Design identique au HTML/CSS fourni
// ✅ Les liens "Se connecter" et "Créer un compte" naviguent vers /login et /register

import { Link } from 'react-router-dom'
import './style-home.css'

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Formes de fond décoratives */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      {/* ───────── NAVBAR ───────── */}
      <header className="glass-nav">
        <div className="nav-container">
          <div className="logo">
            <img src="/ask-n7.png" alt="Logo Ask_N7" className="logo-img-premium" />
          </div>
          <div className="nav-actions">
            {/* ✅ Link remplace <a href="#login"> → navigue vers /login sans recharger la page */}
            <Link to="/login" className="nav-link">Se connecter</Link>
            <Link to="/register" className="btn btn-gradient">Créer un compte</Link>
          </div>
        </div>
      </header>

      {/* ───────── HERO ───────── */}
      <section className="hero-premium">
        <div className="hero-container">
          <div className="hero-content">
            <div className="badge">✨ Nouveau : Ask_N7 v1.0</div>
            <h1>
              L'IA au service de votre{' '}
              <span className="text-gradient">vie universitaire</span>
            </h1>
            <p>
              Oubliez la recherche fastidieuse dans des dizaines de PDF. Posez
              vos questions et obtenez des réponses instantanées, précises et
              sourcées depuis les documents officiels.
            </p>
            <div className="cta-group">
              <Link to="/register" className="btn btn-gradient btn-lg">
                Démarrer gratuitement{' '}
                <i className="ph-bold ph-arrow-right"></i>
              </Link>
              <a href="#demo" className="btn btn-outline btn-lg">
                <i className="ph-bold ph-play-circle"></i> Voir la démo
              </a>
            </div>
          </div>

          {/* Maquette chat animée */}
          <div className="hero-visual">
            <div className="chat-mockup glass-panel">
              <div className="mockup-header">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="mockup-title">Ask_N7 Assistant</div>
              </div>
              <div className="chat-body">
                <div className="message user-msg">
                  Quand ont lieu les examens du semestre 3 ?
                </div>
                <div className="message bot-msg">
                  <div className="bot-avatar">
                    <img
                      src="/ask-n7.png"
                      alt="Bot"
                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                    />
                  </div>
                  <div className="bot-text">
                    D'après le calendrier officiel de l'ENSET, les examens du
                    S3 se dérouleront du <strong>12 au 24 janvier</strong>.{' '}
                    <br />
                    <span className="source-tag">
                      <i className="ph-bold ph-link"></i> Source :
                      Calendrier_Pedagogique.pdf
                    </span>
                  </div>
                </div>
                <div className="message user-msg typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section className="features-section">
        <div className="section-header">
          <h2>Pensé pour l'excellence académique</h2>
          <p>Une infrastructure intelligente conçue pour simplifier votre quotidien.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <i className="ph-duotone ph-lightning"></i>
            </div>
            <h3>Vitesse fulgurante</h3>
            <p>
              Des réponses générées en quelques millisecondes pour ne jamais
              vous ralentir dans vos révisions.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <i className="ph-duotone ph-shield-check"></i>
            </div>
            <h3>100% Sourcé & Fiable</h3>
            <p>
              Aucune hallucination. L'IA s'appuie strictement sur la base de
              connaissances certifiée de l'établissement.
            </p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <i className="ph-duotone ph-translate"></i>
            </div>
            <h3>Multilingue Natif</h3>
            <p>
              Interrogez l'assistant en français, arabe ou anglais. Il
              s'adapte instantanément à votre langue.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── WHY SECTION ───────── */}
      <section className="why-section">
        <div className="zig-zag-row">
          <div className="zz-text">
            <div className="icon-badge">
              <i className="ph-bold ph-file-pdf"></i>
            </div>
            <h2>Fini la chasse aux documents perdus</h2>
            <p>
              Les emplois du temps changent, les règlements sont longs, et
              l'information est dispersée. Ask_N7 ingère tous ces documents et
              les rend interactifs.
            </p>
            <ul className="check-list">
              <li>
                <i className="ph-bold ph-check-circle"></i> Emplois du temps
                et salles
              </li>
              <li>
                <i className="ph-bold ph-check-circle"></i> Procédures
                administratives
              </li>
              <li>
                <i className="ph-bold ph-check-circle"></i> Dates clés et
                événements
              </li>
            </ul>
          </div>
          <div className="zz-visual">
            <div className="image-glass-wrapper glass-panel">
              <img
                src="/ask-n7-dashboard.png"
                alt="Aperçu des fonctionnalités Ask_N7"
                className="feature-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── INSTITUTION BANNER ───────── */}
      <section className="institution-banner">
        <div className="banner-content glass-panel">
          <div className="institution-text">
            <h3>Une initiative exclusive</h3>
            <p>
              Fièrement développé et optimisé pour l'écosystème de l'
              <strong>ENSET Mohammedia</strong>.
            </p>
          </div>
          <div className="institution-logo-placeholder">
            <img src="/enset.png" alt="Logo ENSET" className="enset-logo" />
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="premium-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <img
                src="/ask-n7.png"
                alt="Logo Ask_N7"
                className="logo-img-premium"
              />
            </div>
            <p>L'intelligence artificielle au service de la réussite étudiante.</p>
          </div>
          <div className="footer-links">
            <h4>Produit</h4>
            <a href="#">Fonctionnalités</a>
            <a href="#">Sécurité</a>
            <a href="#">Mises à jour</a>
          </div>
          <div className="footer-links">
            <h4>Établissement</h4>
            <a href="#">Site de l'ENSET</a>
            <a href="#">E-services</a>
            <a href="#">Contact admin</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ask_N7. Projet académique ENSET Mohammedia.</p>
        </div>
      </footer>
    </div>
  )
}