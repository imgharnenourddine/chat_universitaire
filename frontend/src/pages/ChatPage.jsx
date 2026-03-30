// pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
  renameConversation,
  getProfile,
  updateProfile,
  changePassword,
  uploadPhoto,
} from '../services/api'
import './style-chat.css'

export default function ChatPage() {

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [conversations, setConversations]               = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [openMenuId, setOpenMenuId]   = useState(null)
  const [renamingId, setRenamingId]   = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen]             = useState(false)
  const [profileData, setProfileData]         = useState(null)
  const [photoPreview, setPhotoPreview]       = useState(null)
  const [nomEdit, setNomEdit]                 = useState('')
  const [prenomEdit, setPrenomEdit]           = useState('')
  const [ancienPassword, setAncienPassword]   = useState('')
  const [nouveauPassword, setNouveauPassword] = useState('')
  const [profileLoading, setProfileLoading]   = useState(false)
  const [profileError, setProfileError]       = useState('')
  const [profileSuccess, setProfileSuccess]   = useState('')

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    chargerConversations()
    chargerProfil()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const chargerConversations = async () => {
    try {
      const response = await getConversations()
      setConversations(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Erreur conversations:', err)
    }
  }

  const chargerProfil = async () => {
    try {
      const response = await getProfile()
      setProfileData(response.data)
    } catch (err) {
      console.error('Erreur profil:', err)
    }
  }

  const ouvrirConversation = async (conversationId) => {
    setActiveConversationId(conversationId)
    try {
      const response = await getMessages(conversationId)
      setMessages(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Erreur messages:', err)
    }
  }

  const nouveauChat = () => {
    setActiveConversationId(null)
    setMessages([])
    setQuestion('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const supprimerConversation = async (e, conversationId) => {
    e.stopPropagation()
    if (!window.confirm('Supprimer cette conversation ?')) return
    try {
      await deleteConversation(conversationId)
      if (activeConversationId === conversationId) nouveauChat()
      setConversations(prev => prev.filter(c => c.id !== conversationId))
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
    setOpenMenuId(null)
  }

  const sauvegarderRenommage = async (conversationId) => {
    if (!renameValue.trim()) { setRenamingId(null); return }
    try {
      await renameConversation(conversationId, renameValue)
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, titre: renameValue } : c)
      )
    } catch (err) {
      console.error('Erreur renommage:', err)
    }
    setRenamingId(null)
    setRenameValue('')
  }

  // ✅ Animation mot par mot
  const afficherMotParMot = (texte) => {
    const mots = texte.split(' ')
    let index = 0
    let texteActuel = ''
    const botMessageId = Date.now() + 1

    setMessages(prev => [...prev, {
      id: botMessageId,
      contenu: '',
      type: 'BOT',
    }])

    const interval = setInterval(() => {
      texteActuel += (index === 0 ? '' : ' ') + mots[index]
      index++

      setMessages(prev => {
        const msgs = [...prev]
        const lastIndex = msgs.findIndex(m => m.id === botMessageId)
        if (lastIndex !== -1) {
          msgs[lastIndex] = { ...msgs[lastIndex], contenu: texteActuel }
        }
        return [...msgs]
      })

      if (index >= mots.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 40)
  }

  const handleSend = async () => {
    if (!question.trim() || isTyping) return
    const questionText = question.trim()
    setQuestion('')
    const userMessage = { id: Date.now(), contenu: questionText, type: 'USER' }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await sendMessage({
        question: questionText,
        conversationId: activeConversationId,
      })
      const data = response.data
      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId)
        chargerConversations()
      }
      // ✅ Animation mot par mot
      afficherMotParMot(data.response)

    } catch (err) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        contenu: "## ⚠️ Erreur\nDésolé, une erreur est survenue. Vérifiez que Qdrant est lancé.",
        type: 'BOT',
        isError: true,
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const ouvrirModal = async () => {
    setProfileDropdownOpen(false)
    setModalOpen(true)
    setProfileError('')
    setProfileSuccess('')
    setPhotoPreview(null)
    try {
      const response = await getProfile()
      setProfileData(response.data)
      setNomEdit(response.data.nom)
      setPrenomEdit(response.data.prenom)
    } catch (err) {
      console.error('Erreur profil:', err)
    }
  }

  const fermerModal = () => {
    setModalOpen(false)
    setPhotoPreview(null)
    setProfileError('')
    setProfileSuccess('')
    setAncienPassword('')
    setNouveauPassword('')
  }

  const sauvegarderProfil = async () => {
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      if (nomEdit !== profileData?.nom || prenomEdit !== profileData?.prenom) {
        await updateProfile({ nom: nomEdit, prenom: prenomEdit })
      }
      if (ancienPassword && nouveauPassword) {
        await changePassword({ ancienPassword, nouveauPassword })
      }
      setProfileSuccess('Modifications enregistrées ✅')
      await chargerProfil()
      setAncienPassword('')
      setNouveauPassword('')
    } catch (err) {
      setProfileError("Erreur lors de la sauvegarde. Vérifiez vos données.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner une image valide")
      return
    }
    const localUrl = URL.createObjectURL(file)
    setPhotoPreview(localUrl)
    try {
      await uploadPhoto(file)
      const response = await getProfile()
      setProfileData(response.data)
    } catch (err) {
      setPhotoPreview(null)
      setProfileError("Erreur lors de l'upload de la photo.")
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const conversationsFiltrees = conversations.filter(c =>
    c.titre?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const initiales = user
    ? `${user.nom?.[0] || ''}${user.prenom?.[0] || ''}`.toUpperCase()
    : '?'

  const avatarSrc = photoPreview ||
    (profileData?.imagePath
      ? `http://localhost:8080/api/profile/photo/${profileData.imagePath}`
      : null)

  return (
    <div
      className="app-layout"
      onClick={() => {
        setOpenMenuId(null)
        setProfileDropdownOpen(false)
      }}
    >

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>

        <div className="sidebar-header">
          <div className="logo-container" title="Ask_N7">
            <img src="/ask-n7.png" alt="Logo" className="logo-img" />
          </div>
          <button
            className="icon-btn"
            onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(!sidebarCollapsed) }}
            title="Réduire/Agrandir"
          >
            <i className="ph-bold ph-sidebar-simple"></i>
          </button>
        </div>

        <button className="btn-new-chat" onClick={nouveauChat} title="Nouveau chat">
          <i className="ph-bold ph-plus"></i>
          <span className="sidebar-text">Nouveau chat</span>
        </button>

        <div className="search-wrapper" title="Rechercher">
          <i className="ph-bold ph-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="sidebar-text search-input"
            placeholder="Rechercher un chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="chat-list-container">
          <h3 className="sidebar-text section-title">Récents</h3>
          <ul className="chat-list">
            {conversationsFiltrees.length === 0 && (
              <li style={{ padding: '8px 10px' }}>
                <span className="sidebar-text" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Aucune conversation
                </span>
              </li>
            )}
            {conversationsFiltrees.map(conv => (
              <li
                key={conv.id}
                title={conv.titre}
                className={activeConversationId === conv.id ? 'active' : ''}
              >
                {renamingId === conv.id ? (
                  <input
                    className="edit-chat-input sidebar-text"
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => sauvegarderRenommage(conv.id)}
                    onKeyPress={(e) => { if (e.key === 'Enter') sauvegarderRenommage(conv.id) }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <a
                    onClick={(e) => { e.stopPropagation(); ouvrirConversation(conv.id) }}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ph-duotone ph-chat-teardrop-text"></i>
                    <span className="sidebar-text chat-title">{conv.titre}</span>
                  </a>
                )}

                <button
                  className="chat-options-btn sidebar-text"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(openMenuId === conv.id ? null : conv.id)
                  }}
                >
                  <i className="ph-bold ph-dots-three-vertical"></i>
                </button>

                <div className={`chat-options-menu ${openMenuId === conv.id ? 'active' : ''}`}>
                  <button onClick={(e) => {
                    e.stopPropagation()
                    setRenamingId(conv.id)
                    setRenameValue(conv.titre)
                    setOpenMenuId(null)
                  }}>
                    <i className="ph-duotone ph-pencil-simple"></i> Renommer
                  </button>
                  <button
                    className="text-danger"
                    onClick={(e) => supprimerConversation(e, conv.id)}
                  >
                    <i className="ph-duotone ph-trash"></i> Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            className="btn-admin"
            onClick={() => navigate('/admin')}
            title="Panneau Admin"
          >
          
           <img src="/user-gear.png" alt="admin-png" />
            <span className="sidebar-text">Administration</span>
          </button>
        )}

        <div className="user-profile-wrapper">
          <div className={`profile-dropdown ${profileDropdownOpen ? 'active' : ''}`}>
            <div className="dropdown-header">
              <div className="avatar-sm">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : initiales}
              </div>
              <div className="dropdown-user-info">
                <span className="dropdown-name">{user?.nom} {user?.prenom}</span>
                <span className="dropdown-email">{user?.email}</span>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <a className="dropdown-item" onClick={(e) => { e.preventDefault(); ouvrirModal() }}>
              <i className="ph-duotone ph-user-circle"></i> Mon profil
            </a>
            <a className="dropdown-item">
              <i className="ph-duotone ph-question"></i> Aide & FAQ
            </a>
            <div className="dropdown-divider"></div>
            <a className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="ph-duotone ph-sign-out"></i> Se déconnecter
            </a>
          </div>

          <button
            className="user-profile-btn"
            onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen) }}
          >
            <div className="profile-info-left">
              <div className="avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : initiales}
              </div>
              <div className="sidebar-text user-details">
                <span className="user-name">{user?.nom} {user?.prenom}</span>
                <span className="user-badge">{user?.role}</span>
              </div>
            </div>
            <i className="ph-bold ph-dots-three sidebar-text"></i>
          </button>
        </div>
      </aside>


      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="main-content">

        {messages.length === 0 && !isTyping && (
          <div className="welcome-screen">
            <div className="welcome-logo">
              <img src="/ask-n7.png" alt="Ask_N7" />
            </div>
            <h1>Bonjour, {user?.prenom} 👋</h1>
            <p>Posez-moi vos questions sur les documents officiels de l'établissement.</p>
          </div>
        )}

        {(messages.length > 0 || isTyping) && (
          <div className="chat-messages-container">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.type === 'USER' ? 'user-wrapper' : 'bot-wrapper'}`}
              >
                {msg.type === 'BOT' && (
                  <div className="bot-avatar-icon">
                    <img src="/ask-n7.png" alt="Bot" />
                  </div>
                )}

                {msg.type === 'USER' ? (
                  // ✅ Message utilisateur — bulle simple
                  <div className="message user-msg">
                    {msg.contenu}
                  </div>
                ) : (
                  // ✅ Message bot — Markdown rendu directement sur la page sans cadre
                  <div className={`bot-response ${msg.isError ? 'bot-error' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.contenu}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.type === 'USER' && (
                  <div className="user-avatar-icon">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="user" />
                    ) : initiales}
                  </div>
                )}
              </div>
            ))}

            {/* ✅ Animation bot réfléchit */}
            {isTyping && (
  <div className="message-wrapper bot-wrapper">
    <div className="bot-avatar-icon">
      <img src="/ask-n7.png" alt="Bot" />
    </div>
    <div className="bot-response">
      <div className="typing-animation">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="typing-label">Ask_N7 réfléchit...</span>
      </div>
    </div>
  </div>
)}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Zone saisie */}
        <div className="input-area">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              id="chat-input"
              placeholder="Comment puis-je vous aider ?"
              autoComplete="off"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button
              className={`btn-send ${question.trim() && !isTyping ? 'active' : ''}`}
              disabled={!question.trim() || isTyping}
              onClick={handleSend}
            >
              {isTyping ? (
                <i className="ph-bold ph-circle-notch" style={{ animation: 'spin 1s linear infinite' }}></i>
              ) : (
                <i className="ph-bold ph-paper-plane-right"></i>
              )}
            </button>
          </div>
          <p className="input-footer">
            Ask_N7 peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>

      </main>


      {/* ═══════════ MODAL PROFIL ═══════════ */}
      <div
        className={`modal-overlay ${modalOpen ? 'active' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) fermerModal() }}
      >
        <div className="profile-modal">
          <div className="modal-header">
            <h2>Profil Utilisateur</h2>
            <button className="icon-btn close-modal" onClick={fermerModal}>
              <i className="ph-bold ph-x"></i>
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-user-info">
              <div className="avatar-wrapper" title="Changer la photo de profil">
                {photoPreview || profileData?.imagePath ? (
                  <img
                    src={photoPreview || `http://localhost:8080/api/profile/photo/${profileData.imagePath}`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <div className="avatar-lg">{initiales}</div>
                )}
                <div className="avatar-edit-overlay">
                  <i className="ph-bold ph-camera"></i>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={handlePhotoUpload}
                />
              </div>
              <div className="modal-user-details">
                <h3>{user?.nom} {user?.prenom}</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            {profileError && (
              <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div style={{ color: '#16a34a', background: '#dcfce7', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {profileSuccess}
              </div>
            )}

            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              <div className="modal-input-row">
                <div className="modal-input-group">
                  <label>Nom</label>
                  <input type="text" value={nomEdit} onChange={(e) => setNomEdit(e.target.value)} />
                </div>
                <div className="modal-input-group">
                  <label>Prénom</label>
                  <input type="text" value={prenomEdit} onChange={(e) => setPrenomEdit(e.target.value)} />
                </div>
              </div>
              <div className="modal-input-row">
                <div className="modal-input-group">
                  <label>Ancien mot de passe</label>
                  <input type="password" placeholder="••••••••" value={ancienPassword} onChange={(e) => setAncienPassword(e.target.value)} />
                </div>
                <div className="modal-input-group">
                  <label>Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" value={nouveauPassword} onChange={(e) => setNouveauPassword(e.target.value)} />
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={fermerModal}>Annuler</button>
            <button className="btn-save" onClick={sauvegarderProfil} disabled={profileLoading}>
              {profileLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ── Layout messages ── */
        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 85%;
          animation: fadeInUp 0.3s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .user-wrapper {
          align-self: flex-end;
          flex-direction: row;
        }

        .bot-wrapper {
          align-self: flex-start;
        }

        /* ── Avatar icônes ── */
        .bot-avatar-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bot-avatar-icon img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .user-avatar-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--primary-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .user-avatar-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── Message user — bulle ── */
        .message.user-msg {
          background: var(--primary-gradient);
          color: white;
          padding: 12px 16px;
          border-radius: 18px 18px 4px 18px;
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 100%;
          word-break: break-word;
        }

        /* ── Réponse bot — directement sur la page ── */
        .bot-response {
          flex: 1;
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-main);
          padding-right: 1rem;
          word-break: break-word;
        }

        .bot-response.bot-error {
          opacity: 0.7;
        }

        /* ── Markdown styles ── */
        .bot-response h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 0.8rem 0;
          padding-bottom: 0.4rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .bot-response h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          margin: 1rem 0 0.5rem 0;
        }

        .bot-response p {
          margin-bottom: 0.6rem;
        }

        .bot-response ul, .bot-response ol {
          padding-left: 1.4rem;
          margin: 0.5rem 0;
        }

        .bot-response li {
          margin-bottom: 0.4rem;
          line-height: 1.6;
        }

        .bot-response strong {
          font-weight: 700;
          color: var(--text-main);
        }

        /* ── Tableaux ── */
        .bot-response table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.8rem 0;
          font-size: 0.88rem;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .bot-response th {
          background: var(--primary);
          color: white;
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .bot-response td {
          padding: 9px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.88rem;
        }

        .bot-response tr:nth-child(even) td {
          background: #f8fafc;
        }

        .bot-response tr:hover td {
          background: #f1f5f9;
        }

        .bot-response hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 0.8rem 0;
        }

        /* ── Animation typing ── */
        .typing-animation {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }

        .typing-label {
          color: var(--text-muted);
          font-size: 0.85rem;
          font-style: italic;
          margin-left: 4px;
        }

        /* ── Conversation active ── */
        .chat-list li.active a {
          background-color: var(--bg-hover);
          font-weight: 600;
        }

        /* ── Bouton Admin ── */
        .btn-admin {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          color: var(--primary);
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(37, 99, 235, 0.2);
          transition: var(--transition);
          margin-bottom: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          font-family: inherit;
        }
        .btn-admin:hover { background: rgba(37, 99, 235, 0.15); }
        .btn-admin i { font-size: 1.2rem; flex-shrink: 0; }
        .sidebar.collapsed .btn-admin {
          justify-content: center;
          padding: 0.8rem 0;
          background: transparent;
          border-color: transparent;
        }
        .sidebar.collapsed .btn-admin:hover { background: var(--bg-hover); }
      `}</style>

    </div>
  )
}