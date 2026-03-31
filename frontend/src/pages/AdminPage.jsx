// pages/AdminPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDocuments, uploadDocument, deleteDocument } from '../services/api'
import './style-admin.css'

export default function AdminPage() {

  const { user } = useAuth()
  const navigate = useNavigate()

  // ─── Documents ───
  const [documents, setDocuments]       = useState([])
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [loading, setLoading]           = useState(true)

  // ─── Modal Upload ───
  const [modalOpen, setModalOpen]       = useState(false)
  const [fichier, setFichier]           = useState(null)
  const [description, setDescription]  = useState('')
  const [categorie, setCategorie]       = useState('')
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState('')
  const [dragOver, setDragOver]         = useState(false)

  const fileInputRef = useRef(null)


  // ════════════════════════════════════════════════
  //   CHARGEMENT
  // ════════════════════════════════════════════════

  useEffect(() => {
    chargerDocuments()
  }, [])

  const chargerDocuments = async () => {
  setLoading(true)
  try {
    const response = await getDocuments()
    console.log('Documents reçus:', response.data) // ← ajoute ça
    setDocuments(Array.isArray(response.data) ? response.data : [])
  } catch (err) {
    console.error('Erreur chargement documents:', err)
  } finally {
    setLoading(false)
  }
}


  // ════════════════════════════════════════════════
  //   UPLOAD
  // ════════════════════════════════════════════════

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!fichier || !description || !categorie) return

    setUploading(true)
    setUploadError('')

    // FormData — format multipart pour envoyer fichier + texte
    const formData = new FormData()
    formData.append('file', fichier)
    formData.append('description', description)
    formData.append('categorie', categorie)

    try {
      await uploadDocument(formData)
      // Ferme le modal et recharge les documents
      fermerModal()
      await chargerDocuments()
    } catch (err) {
      setUploadError("Erreur lors de l'upload. Vérifiez le fichier.")
    } finally {
      setUploading(false)
    }
  }

  const handleFichierChange = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'md'].includes(ext)) {
      setUploadError('Seuls les fichiers PDF et MD sont acceptés.')
      return
    }
    setFichier(file)
    setUploadError('')
  }

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFichierChange(file)
  }


  // ════════════════════════════════════════════════
  //   SUPPRESSION
  // ════════════════════════════════════════════════

  const handleDelete = async (doc) => {
    if (!window.confirm(
      `Supprimer définitivement "${doc.nomFichier}" ?\nIl sera retiré de la base de connaissances et de Qdrant.`
    )) return

    try {
      await deleteDocument(doc.id)
      // Retire le document de la liste localement
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression.')
    }
  }


  // ════════════════════════════════════════════════
  //   MODAL
  // ════════════════════════════════════════════════

  const fermerModal = () => {
    setModalOpen(false)
    setFichier(null)
    setDescription('')
    setCategorie('')
    setUploadError('')
    setDragOver(false)
  }


  // ════════════════════════════════════════════════
  //   FILTRE
  // ════════════════════════════════════════════════

  const documentsFiltres = filtreStatut === 'TOUS'
    ? documents
    : documents.filter(d => d.statut === filtreStatut)


  // ════════════════════════════════════════════════
  //   HELPERS
  // ════════════════════════════════════════════════

  const getStatutClass = (statut) => {
    switch (statut) {
      case 'INDEXE':    return 'status-indexed'
      case 'EN_ATTENTE': return 'status-pending'
      case 'ERREUR':    return 'status-error'
      default:          return ''
    }
  }

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'INDEXE':    return <i className="ph-bold ph-check"></i>
      case 'EN_ATTENTE': return <i className="ph-bold ph-spinner-gap spin-icon"></i>
      case 'ERREUR':    return <i className="ph-bold ph-warning"></i>
      default:          return null
    }
  }

  const getFileIcon = (nomFichier) => {
    const ext = nomFichier?.split('.').pop().toLowerCase()
    if (ext === 'pdf') return <i className="ph-fill ph-file-pdf"></i>
    return <i className="ph-fill ph-file-text"></i>
  }

  const getFormatBadge = (nomFichier) => {
    const ext = nomFichier?.split('.').pop().toUpperCase()
    const cls = ext === 'PDF' ? 'format-pdf' : 'format-md'
    return <span className={`meta-tag ${cls}`}>{ext}</span>
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }


  // ════════════════════════════════════════════════
  //   AFFICHAGE
  // ════════════════════════════════════════════════

  return (
    <div className="admin-page">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="admin-navbar">
        <div className="nav-left">
          <div className="logo-container">
            <img src="/ask-n7.png" alt="Logo Ask_N7" className="logo-img" />
          </div>
          <span className="nav-divider"></span>
          <span className="nav-title">Admin Dashboard</span>
        </div>
        <div className="nav-right">
          <a
            className="link-back"
            onClick={() => navigate('/chat')}
            style={{ cursor: 'pointer' }}
          >
            <i className="ph-bold ph-arrow-left"></i> Retour au Chat
          </a>
        </div>
      </nav>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="admin-main">
        <div className="container">

          {/* Header */}
          <header className="page-header">
            <div className="header-text">
              <h1>Base de connaissances</h1>
              <p>Gérez les documents utilisés par l'IA pour générer les réponses.</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <i className="ph-bold ph-plus"></i> Upload Document
            </button>
          </header>

          {/* Filtres */}
          <div className="filters-group">
            {['TOUS', 'EN_ATTENTE', 'INDEXE', 'ERREUR'].map(statut => (
              <button
                key={statut}
                className={`filter-btn ${filtreStatut === statut ? 'active' : ''}`}
                onClick={() => setFiltreStatut(statut)}
              >
                {statut}
              </button>
            ))}
          </div>

          {/* Liste documents */}
          <div className="document-list">

            {/* Chargement */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <i className="ph-bold ph-spinner-gap spin-icon" style={{ fontSize: '2rem' }}></i>
                <p style={{ marginTop: '1rem' }}>Chargement des documents...</p>
              </div>
            )}

            {/* Aucun document */}
            {!loading && documentsFiltres.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <i className="ph-duotone ph-files" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                <p>Aucun document trouvé.</p>
              </div>
            )}

            {/* Cards documents */}
            {!loading && documentsFiltres.map(doc => (
              <div className="doc-card" key={doc.id}>

                {/* Icône fichier */}
                <div className="doc-icon">
                  {getFileIcon(doc.nomFichier)}
                </div>

                {/* Infos */}
                <div className="doc-info">
                  <div className="doc-title-row">
                    <h3>{doc.nomFichier}</h3>
                    <span className="badge badge-category">{doc.categorie}</span>
                  </div>
                  <p className="doc-desc">{doc.description}</p>
                  <div className="doc-meta">
                    {getFormatBadge(doc.nomFichier)}
                    <span className="meta-dot">•</span>
                    <span>Uploadé le {formatDate(doc.createdAt)}</span>
                    {doc.uploadedBy && (
                      <>
                        <span className="meta-dot">•</span>
                        <span>Par {doc.uploadedBy.nom} {doc.uploadedBy.prenom}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="doc-actions">
                  <div className={`status-badge ${getStatutClass(doc.statut)}`}>
                    {getStatutIcon(doc.statut)} {doc.statut}
                  </div>
                  <button
                    className="action-btn btn-delete"
                    title="Supprimer"
                    onClick={() => handleDelete(doc)}
                  >
                    <i className="ph-bold ph-trash"></i>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>


      {/* ═══════════ MODAL UPLOAD ═══════════ */}
      <div
        className={`upload-overlay ${modalOpen ? 'active' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) fermerModal() }}
      >
        <div className="upload-modal-content">

          <div className="modal-header">
            <h2>Uploader un document</h2>
            <button className="close-modal" onClick={fermerModal}>
              <i className="ph-bold ph-x"></i>
            </button>
          </div>

          <form onSubmit={handleUpload}>
            <div className="modal-body">

              {/* Zone Drag & Drop */}
              <div
                className={`drop-zone ${dragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <i className="ph-duotone ph-upload-simple drop-icon"></i>
                <h4>Glissez votre fichier ici</h4>
                <p>ou cliquez pour parcourir (PDF, MD)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept=".pdf,.md"
                  onChange={(e) => handleFichierChange(e.target.files[0])}
                />
                {fichier ? (
                  <span className="file-name" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    ✅ {fichier.name}
                  </span>
                ) : (
                  <span className="file-name">Aucun fichier sélectionné</span>
                )}
              </div>

              {/* Erreur upload */}
              {uploadError && (
                <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.7rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {uploadError}
                </div>
              )}

              {/* Description */}
              <div className="form-group">
                <label>Description du fichier</label>
                <input
                  type="text"
                  placeholder="Ex: Dates d'examens du semestre 3..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Catégorie */}
              <div className="form-group">
                <label>Catégorie</label>
                <div className="select-wrapper">
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    required
                  >
                    <option value="" disabled>Choisir une catégorie</option>
                    <option value="EMPLOI_DU_TEMPS">Emploi du temps</option>
                    <option value="EXAMEN">Examen</option>
                    <option value="REGLEMENT">Règlement</option>
                    <option value="STAGE">Stage</option>
                  </select>
                  <i className="ph-bold ph-caret-down select-icon"></i>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={fermerModal}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={uploading || !fichier || !description || !categorie}
                style={{ opacity: (uploading || !fichier || !description || !categorie) ? 0.7 : 1 }}
              >
                {uploading ? (
                  <>
                    <i className="ph-bold ph-spinner-gap spin-icon"></i> Indexation en cours...
                  </>
                ) : (
                  <>
                    <i className="ph-bold ph-cloud-arrow-up"></i> Uploader
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Style spin */}
      <style>{`
        .admin-page {
          min-height: 100vh;
          background-color: var(--bg-main);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>

    </div>
  )
}