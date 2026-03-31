// pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../services/api'
import './style-registre.css'

export default function LoginPage() {

  // ─── Variables qui stockent ce que l'utilisateur tape ───
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // ─── Variables état envoi ───
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')

  // ─── Outils React ───
  const navigate    = useNavigate()
  const { login }   = useAuth()


  // ════════════════════════════════════════════════
  //   HANDLESUBMIT — envoi vers Spring Boot
  // ════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault()
    // ↑ empêche le rechargement de la page

    setLoading(true)
    setApiError('')

    try {
      // 1. Envoie à Spring Boot
      // POST /auth/login { email, password }
      const response = await loginApi({ email, password })

      // 2. Spring Boot répond avec AuthResponse :
      // { token, nom, prenom, email, role, imagePath }
      const data = response.data

      // 3. Sauvegarde dans AuthContext
      login(
        {
          nom:       data.nom,
          prenom:    data.prenom,
          email:     data.email,
          role:      data.role,
          imagePath: data.imagePath,
        },
        data.token
      )

      // 4. Redirige vers le chat
      navigate('/chat')

    } catch (err) {
      // Email ou mot de passe incorrect
      const message = err.response?.data?.message
        || "Email ou mot de passe incorrect."
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  // Bouton actif seulement si les 2 champs sont remplis
  const formulaireValide = email.length > 0 && password.length > 0


  // ════════════════════════════════════════════════
  //   AFFICHAGE
  // ════════════════════════════════════════════════

  return (
    <div className="auth-wrapper">
      <div className="form-card">

        {/* Bouton retour vers HomePage */}
        <Link to="/" className="btn-back" title="Retour à l'accueil">
          <i className="ph-bold ph-arrow-left"></i>
        </Link>

        {/* Logos */}
        <div className="brand-header">
          <img src="/ask-n7.png" alt="Logo Ask_N7" className="logo-img" />
          <span className="logo-divider"></span>
          <img src="/enset.png" alt="Logo ENSET" className="enset-img" />
        </div>

        {/* Erreur venant de Spring Boot */}
        {apiError && (
          <div className="api-error">
            {apiError}
          </div>
        )}

        {/* Formulaire */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Champ Email */}
          <div className="input-group">
            <label htmlFor="email">Email académique</label>
            <input
              type="email"
              id="email"
              placeholder="nom.prenom@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Champ Password */}
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            className="btn-submit"
            disabled={!formulaireValide || loading}
            style={{ opacity: (!formulaireValide || loading) ? 0.6 : 1 }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

        </form>

        {/* Lien vers Register */}
        <div className="form-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="link-login">S'inscrire</Link>
          </p>
        </div>

      </div>
    </div>
  )
}