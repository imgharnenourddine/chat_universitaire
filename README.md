# 🎓 Ask_N7 — Chatbot Universitaire Intelligent

> Assistant numérique 24h/24 dédié aux étudiants et au personnel de l'ENSET Mohammedia.  
> Propulsé par **RAG** (Retrieval-Augmented Generation) + **Mistral AI** + **Qdrant**.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-green?style=flat-square&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-red?style=flat-square)
![MinIO](https://img.shields.io/badge/MinIO-Storage-purple?style=flat-square)

---

## 📌 Table des Matières

- [Contexte](#-contexte)
- [Problématique](#-problématique)
- [Objectifs](#-objectifs)
- [Architecture RAG](#-architecture--rag)
- [Stack Technique](#-stack-technique)
- [Structure du Projet](#-structure-du-projet)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Lancement](#-lancement)
- [Utilisation](#-utilisation)
- [Fonctionnalités](#-fonctionnalités)
- [Contributeurs](#-contributeurs)

---

## 🏫 Contexte

L'**ENSET Mohammedia** génère chaque semestre des centaines d'informations critiques : calendriers d'examens, procédures de stage, règlements intérieurs, notes administratives, emplois du temps…

Cependant, l'accès à cette information reste un défi majeur. Les données sont dispersées entre des tableaux d'affichage physiques, des groupes WhatsApp non officiels, et divers sites web départementaux, créant un écosystème fragmenté difficile à naviguer pour les étudiants.

---

## ❗ Problématique

### 1. Les Silos d'Information — *Le "Cimetière des PDF"*
Les informations critiques sont verrouillées dans des fichiers statiques (PDF scannés, images) non consultables par mots-clés. Un étudiant doit parfois ouvrir dix fichiers différents pour trouver une simple date d'examen.

### 2. Le Goulot d'Étranglement Administratif
Le personnel administratif passe un temps précieux à répondre aux mêmes questions répétitives. Les étudiants se retrouvent sans réponse le soir ou le week-end.

### 3. La Propagation de Rumeurs
En l'absence d'information officielle facilement accessible, la désinformation se propage via les canaux non officiels.

---

## 🎯 Objectifs

**Ask_N7** vise à être un hub central pour toutes les connaissances universitaires de l'ENSET :

- ✅ Réponses **instantanées** et **précises** 24h/24 et 7j/7
- ✅ Informations basées **uniquement sur des documents officiels vérifiés**
- ✅ Compréhension du **langage naturel** (français, arabe, anglais)
- ✅ Accès **centralisé** à toute l'information universitaire
- ✅ Interface de chat **moderne** avec historique des conversations
- ✅ Dashboard **admin** pour gérer la base de connaissances

---

## 🏗️ Architecture — RAG

Le projet repose sur le principe du **RAG (Retrieval-Augmented Generation)**.

### Phase d'Ingestion (Admin)
```
Admin upload PDF
      ↓
Spring Boot reçoit le fichier
      ↓
PDFBox extrait le texte
      ↓
LangChain4j découpe en chunks (1000 tokens)
      ↓
Mistral AI Embedding vectorise chaque chunk (1024 dimensions)
      ↓
Qdrant stocke les vecteurs
      ↓
MinIO stocke le fichier brut
      ↓
PostgreSQL : statut → INDEXE ✅
```

### Phase d'Interrogation (Étudiant)
```
Étudiant pose une question
      ↓
React → Spring Boot (POST /api/chat)
      ↓
Mistral AI Embedding vectorise la question
      ↓
Qdrant recherche les 5 chunks les plus similaires
      ↓
Prompt construit : question + contexte trouvé
      ↓
Mistral AI génère une réponse en Markdown
      ↓
Réponse sauvegardée dans PostgreSQL
      ↓
React affiche la réponse mot par mot ✅
```

---

## 🛠️ Stack Technique

### Frontend
| Outil | Version | Rôle |
|---|---|---|
| **React** | 18 | Interface utilisateur SPA |
| **Vite** | 5 | Build tool + Hot Reload |
| **React Router** | 6 | Navigation entre pages |
| **Axios** | latest | Appels API vers Spring Boot |
| **react-markdown** | latest | Rendu Markdown des réponses IA |
| **remark-gfm** | latest | Support tableaux Markdown |
| **Phosphor Icons** | latest | Bibliothèque d'icônes |

### Backend
| Outil | Version | Rôle |
|---|---|---|
| **Spring Boot** | 3.5 | Serveur REST API principal |
| **Spring Security** | 6 | Authentification JWT |
| **Spring Data JPA** | latest | Accès PostgreSQL |
| **LangChain4j** | latest | Pipeline RAG (chunking, embedding, retrieval) |
| **Mistral AI** | latest | Embedding + Génération de réponses |
| **PDFBox** | latest | Extraction de texte depuis les PDFs |
| **MinIO SDK** | latest | Stockage des fichiers |
| **Lombok** | latest | Réduction du code boilerplate |

### Bases de Données & Stockage
| Outil | Rôle |
|---|---|
| **PostgreSQL** | Utilisateurs, conversations, messages, documents |
| **Qdrant** | Base vectorielle pour la recherche sémantique |
| **MinIO** | Stockage des fichiers bruts (PDFs) — compatible S3 |

---

## 📁 Structure du Projet

```
ask_n7/
│
├── frontend/                          # Interface React
│   ├── public/
│   │   ├── ask-n7.png                 # Logo Ask_N7
│   │   └── enset.png                  # Logo ENSET
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Gestion token JWT global
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Landing page
│   │   │   ├── LoginPage.jsx          # Connexion
│   │   │   ├── RegisterPage.jsx       # Inscription
│   │   │   ├── ChatPage.jsx           # Chat principal + profil
│   │   │   └── AdminPage.jsx          # Dashboard admin
│   │   ├── services/
│   │   │   └── api.js                 # Toutes les fonctions API (Axios)
│   │   ├── App.jsx                    # Routes + gardes d'accès
│   │   └── main.jsx                   # Point d'entrée React
│   ├── index.html
│   └── vite.config.js
│
├── backend/ask_enset/                 # Serveur Spring Boot
│   ├── src/main/java/ma/enset/ask_enset/
│   │   ├── config/
│   │   │   ├── LangChain4jConfig.java # Configuration Mistral + Qdrant
│   │   │   └── MinioConfig.java       # Configuration MinIO
│   │   ├── controller/
│   │   │   ├── AuthController.java    # POST /auth/login, /auth/register
│   │   │   ├── ChatController.java    # POST /api/chat, GET conversations
│   │   │   ├── DocumentController.java# POST /api/documents/upload
│   │   │   └── ProfileController.java # GET/PUT /api/profile
│   │   ├── dto/
│   │   │   ├── AuthResponse.java
│   │   │   ├── ChatRequest.java
│   │   │   ├── ChatResponse.java
│   │   │   └── LoginRequest.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Conversation.java
│   │   │   ├── Message.java
│   │   │   └── Document_enset.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ConversationRepository.java
│   │   │   ├── MessageRepository.java
│   │   │   └── DocumentRepository.java
│   │   ├── security/
│   │   │   ├── JwtService.java        # Génération/validation JWT
│   │   │   ├── JwtAuthFilter.java     # Filtre Spring Security
│   │   │   └── SecurityConfig.java    # Configuration CORS + routes
│   │   └── service/
│   │       ├── AuthService.java       # Login + Register
│   │       ├── ChatService.java       # Pipeline RAG complet
│   │       ├── DocumentService.java   # Upload + Indexation PDF
│   │       └── ProfileService.java    # Gestion profil utilisateur
│   ├── src/main/resources/
│   │   └── application.properties    # Configuration DB, MinIO, Mistral
│   └── pom.xml
│
└── README.md
```

---

## 📦 Prérequis

Avant de commencer, assure-toi d'avoir installé :

| Outil | Version minimale |
|---|---|
| **Java JDK** | 17+ |
| **Node.js** | 18+ |
| **Maven** | 3.8+ (inclus via `mvnw`) |
| **Qdrant** | Dernière version |
| **MinIO** | Dernière version |
| **PostgreSQL** | 14+ (ou hébergé sur Aiven) |

---

## ⚙️ Installation

### 1. Cloner le projet
```bash
git clone https://github.com/ton-username/ask-n7.git
cd ask-n7
```

### 2. Configurer le Backend

Ouvre `backend/ask_enset/src/main/resources/application.properties` et remplis :

```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://TON_HOST:PORT/ask_enset?sslmode=require
spring.datasource.username=TON_USERNAME
spring.datasource.password=TON_PASSWORD

# Mistral AI
langchain4j.mistral.api-key=TON_API_KEY_MISTRAL

# MinIO
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket-name=ask-n7-bucket

# Qdrant
qdrant.host=localhost
qdrant.rest-port=6333
qdrant.collection-name=enset-documents

# JWT
jwt.secret=TON_SECRET_JWT_TRES_LONG
jwt.expiration=86400000

# Upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 3. Installer les dépendances Frontend
```bash
cd frontend
npm install
```

---

## 🚀 Lancement

Lance ces 4 terminaux dans l'ordre :

### Terminal 1 — Qdrant
```bash
cd C:\qdrant
.\qdrant.exe
# Disponible sur http://localhost:6333
```

### Terminal 2 — MinIO
```bash
minio server C:\minio\data --console-address ":9001"
# Console disponible sur http://localhost:9001
# Login : minioadmin / minioadmin
```

### Terminal 3 — Spring Boot
```bash
cd backend/ask_enset
.\mvnw spring-boot:run
# API disponible sur http://localhost:8080
```

### Terminal 4 — React
```bash
cd frontend
npm run dev
# Application disponible sur http://localhost:5173
```

> ⚠️ **Important** : Lance Qdrant et MinIO **avant** Spring Boot.

---

## 💬 Utilisation

### Pour les Étudiants

1. Accéder à `http://localhost:5173`
2. Créer un compte via `/register`
3. Se connecter via `/login`
4. Poser des questions sur les documents officiels de l'ENSET
5. Consulter l'historique des conversations dans la sidebar
6. Modifier son profil (photo, nom, mot de passe)

### Pour les Administrateurs

1. Se connecter avec un compte de rôle `ADMIN`
2. Accéder au Dashboard Admin via le bouton dans la sidebar
3. Uploader un PDF avec description et catégorie
4. Le système indexe automatiquement le document dans Qdrant
5. Les étudiants peuvent immédiatement poser des questions sur ce document
6. Supprimer les documents obsolètes

---

## ✨ Fonctionnalités

### Chat
- 💬 Réponses basées sur les documents officiels via RAG
- 📝 Formatage Markdown des réponses (titres, listes, tableaux, emojis)
- ⌨️ Animation mot par mot des réponses (style ChatGPT)
- 💾 Historique des conversations sauvegardé dans PostgreSQL
- 🔍 Recherche dans les conversations
- ✏️ Renommage et suppression des conversations

### Authentification
- 🔐 Inscription avec validation en temps réel
- 🔑 Connexion avec token JWT
- 🛡️ Routes protégées (ProtectedRoute, AdminRoute)
- 🚪 Déconnexion avec nettoyage du localStorage

### Profil
- 👤 Modification du nom et prénom
- 🔒 Changement de mot de passe
- 📷 Upload et affichage de photo de profil (stockée dans MinIO)

### Admin
- 📄 Upload de PDFs avec drag & drop
- 📊 Statut d'indexation en temps réel (EN_ATTENTE → INDEXE)
- 🗑️ Suppression des documents (MinIO + PostgreSQL)
- 🔖 Filtrage par catégorie et statut

---

## 👥 Contributeurs

| Nom | Rôle |
|---|---|
| **Imgharn Noureddine** | Développeur Full Stack |

---

## 📄 Licence

Projet académique — ENSET Mohammedia © 2026

---

> **Ask_N7** — *L'information officielle, disponible quand vous en avez besoin.* 🎓
