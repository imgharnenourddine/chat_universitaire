// pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/api'
import './style-registre.css'

export default function RegisterPage() {

  // ─── 1. Variables qui stockent ce que l'utilisateur tape ───
  const [nom, setNom]           = useState('')
  const [prenom, setPrenom]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // ─── 2. Variables qui stockent les erreurs de validation ───
  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
  })

  // ─── 3. Variables pour gérer l'état de l'envoi ───
  const [loading, setLoading] = useState(false)   // bouton "Inscription en cours..."
  const [apiError, setApiError] = useState('')    // erreur venant de Spring Boot

  // ─── 4. Outils React Router et AuthContext ───
  const navigate = useNavigate()   // pour rediriger vers /chat après inscription
  const { login } = useAuth()      // pour sauvegarder token + user


  // ════════════════════════════════════════════════
  //   FONCTIONS DE VALIDATION (vérifient en temps réel)
  // ════════════════════════════════════════════════

  // Valide le nom OU le prénom (même règle pour les deux)
  const validerNomPrenom = (valeur, champ) => {
    const lettresSeulement = /^[a-zA-ZÀ-ÿ\s]+$/

    if (valeur.length === 0) {
      // champ vide → pas d'erreur affichée (l'utilisateur n'a pas encore tapé)
      setErrors(prev => ({ ...prev, [champ]: '' }))
    } else if (!lettresSeulement.test(valeur)) {
      // contient des chiffres ou caractères spéciaux
      setErrors(prev => ({ ...prev, [champ]: 'Lettres seulement, pas de chiffres' }))
    } else {
      // ✅ valide
      setErrors(prev => ({ ...prev, [champ]: '' }))
    }
  }

  // Valide l'email
  const validerEmail = (valeur) => {
    const emailGmail = /^[^\s@]+@gmail\.com$/

    if (valeur.length === 0) {
      setErrors(prev => ({ ...prev, email: '' }))
    } else if (!emailGmail.test(valeur)) {
      setErrors(prev => ({ ...prev, email: "L'email doit finir par @gmail.com" }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  // Valide le mot de passe (4 règles en même temps)
  const validerPassword = (valeur) => {
    if (valeur.length === 0) {
      setErrors(prev => ({ ...prev, password: '' }))
      return
    }

    const regles = []

    if (valeur.length < 8)
      regles.push('Minimum 8 caractères')

    if (!/[A-Z]/.test(valeur))
      regles.push('Au moins une majuscule')

    if (!/[0-9]/.test(valeur))
      regles.push('Au moins un chiffre')

    if (!/[!@#$%^&*]/.test(valeur))
      regles.push('Au moins un caractère spécial (!@#$%^&*)')

    // Si toutes les règles sont respectées → tableau vide → pas d'erreur
    setErrors(prev => ({
      ...prev,
      password: regles.join(' • ')
      // Exemple affiché : "Minimum 8 caractères • Au moins une majuscule"
    }))
  }


  // ════════════════════════════════════════════════
  //   EST-CE QUE TOUT EST VALIDE ? (pour activer le bouton)
  // ════════════════════════════════════════════════

  const toutEstValide =
    nom.length > 0 &&
    prenom.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    errors.nom === '' &&
    errors.prenom === '' &&
    errors.email === '' &&
    errors.password === ''
    // bouton actif seulement si tous les champs sont remplis ET sans erreur


  // ════════════════════════════════════════════════
  //   HANDLESUBMIT — envoi vers Spring Boot
  // ════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault()
    // ↑ empêche le rechargement de la page (comportement HTML par défaut)

    setLoading(true)   // bouton passe à "Inscription en cours..."
    setApiError('')    // réinitialise l'erreur précédente

    try {
      // 1. Envoie les données à Spring Boot
      //    POST /auth/register { nom, prenom, email, password }
      const response = await register({ nom, prenom, email, password })

      // 2. Spring Boot répond avec AuthResponse :
      //    { token, nom, prenom, email, role, imagePath }
      const data = response.data

      // 3. Sauvegarde dans AuthContext (token + infos user)
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

      // 4. Redirige vers la page chat
      navigate('/chat')

    } catch (err) {
      // Spring Boot a retourné une erreur (ex: "Email déjà utilisé !")
      const message = err.response?.data?.message || "Une erreur est survenue"
      setApiError(message)
    } finally {
      setLoading(false)  // bouton redevient normal dans tous les cas
    }
  }


  // ════════════════════════════════════════════════
  //   AFFICHAGE (ton design HTML converti en React)
  // ════════════════════════════════════════════════

  return (
    <div className="auth-wrapper">
      
      <div className="form-card">

        {/* Logos */}
        
        <Link to="/home" className="btn-back" title="Retour à l'accueil">
                <i class="ph-bold ph-arrow-left"></i>
            </Link>
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
          {/* onSubmit remplace action="#" — React intercepte l'envoi */}

          {/* Nom + Prénom côte à côte */}
          <div className="input-row">

            {/* Champ Nom */}
            <div className="input-group">
              <label htmlFor="nom">Nom</label>
              {/* htmlFor remplace for= en React (for est un mot réservé JS) */}
              <input
                type="text"
                id="nom"
                placeholder="Ex: Imgharn"
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value)         // sauvegarde ce qui est tapé
                  validerNomPrenom(e.target.value, 'nom') // vérifie la règle en temps réel
                }}
              />
              {/* Affiche l'erreur sous le champ si elle existe */}
              {errors.nom && <span className="field-error">{errors.nom}</span>}
            </div>

            {/* Champ Prénom */}
            <div className="input-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                placeholder="Ex: Noureddine"
                value={prenom}
                onChange={(e) => {
                  setPrenom(e.target.value)
                  validerNomPrenom(e.target.value, 'prenom')
                }}
              />
              {errors.prenom && <span className="field-error">{errors.prenom}</span>}
            </div>

          </div>

          {/* Champ Email */}
          <div className="input-group">
            <label htmlFor="email">Email académique</label>
            <input
              type="email"
              id="email"
              placeholder="nom.prenom@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                validerEmail(e.target.value)
              }}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Champ Password */}
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                validerPassword(e.target.value)
              }}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Bouton Submit — désactivé si tout n'est pas valide */}
          <button
            type="submit"
            className="btn-submit"
            disabled={!toutEstValide || loading}
            style={{ opacity: (!toutEstValide || loading) ? 0.6 : 1 }}
          >
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>

        </form>

        {/* Lien vers Login */}
        <div className="form-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="link-login">Se connecter</Link>
            {/* Link remplace <a href="#login"> → navigation sans rechargement */}
          </p>
        </div>

      </div>
    </div>
  )
}