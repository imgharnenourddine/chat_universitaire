# 🎓 Ask_ENSET — Chatbot Universitaire Intelligent

> Assistant numérique 24h/24 dédié aux étudiants et au personnel de l'ENSET Mohammedia.

---

## 📌 Table des Matières

- [Contexte](#-contexte)
- [Problématique](#-problématique)
- [Objectifs](#-objectifs)
- [Architecture](#-architecture--rag)
- [Stack Technique](#-stack-technique)
- [Structure du Projet](#-structure-du-projet)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Contributeurs](#-contributeurs)

---

## 🏫 Contexte

L'**ENSET Mohammedia** génère chaque semestre des centaines d'informations critiques : calendriers d'examens, procédures de stage, règlements intérieurs, notes administratives, emplois du temps…

Cependant, l'accès à cette information reste un défi majeur. Les données sont dispersées entre des tableaux d'affichage physiques, des groupes WhatsApp non officiels, et divers sites web départementaux, créant un écosystème fragmenté difficile à naviguer pour les étudiants.

---

## ❗ Problématique

Trois défis majeurs ont été identifiés :

### 1. Les Silos d'Information — *Le "Cimetière des PDF"*
Les informations critiques sont verrouillées dans des fichiers statiques (PDF scannés, images) non consultables par mots-clés. Un étudiant doit parfois ouvrir dix fichiers différents pour trouver une simple date d'examen.

### 2. Le Goulot d'Étranglement Administratif
Le personnel administratif passe un temps précieux à répondre aux mêmes questions répétitives, avec des horaires de travail fixes. Les étudiants se retrouvent sans réponse le soir ou le week-end.

### 3. La Propagation de Rumeurs
En l'absence d'information officielle facilement accessible, la désinformation se propage via les canaux non officiels, causant stress et confusion.

---

## 🎯 Objectifs

**Ask_ENSET** vise à être un hub central pour toutes les connaissances universitaires de l'ENSET, en fournissant :

- ✅ Des réponses **instantanées** et **précises** 24h/24 et 7j/7
- ✅ Des informations basées **uniquement sur des documents officiels vérifiés**
- ✅ Une compréhension du **langage naturel** (pas besoin de mots-clés exacts)
- ✅ Un accès **centralisé** à toute l'information universitaire

---

## 🏗️ Architecture — RAG

Le projet repose sur le principe du **RAG (Retrieval-Augmented Generation)**, qui combine la puissance des modèles de langage avec une base de connaissances propriétaire.

```
┌─────────────────────────────────────────────────────┐
│                   PHASE D'INGESTION                  │
│                                                      │
│  Admin upload PDF → Extraction texte → Découpage    │
│       en chunks → Vectorisation (OpenAI)             │
│              → Stockage dans Qdrant                  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 PHASE D'INTERROGATION                │
│                                                      │
│  Étudiant pose une question                         │
│       → Conversion en vecteur (OpenAI Embedding)    │
│       → Recherche sémantique dans Qdrant            │
│       → Récupération des chunks pertinents          │
│       → Génération de réponse par le LLM (OpenAI)  │
│       → Réponse affichée dans le chat               │
└─────────────────────────────────────────────────────┘
```

### Flux complet

```
Étudiant ──► React (UI) ──► Nginx ──► Spring Boot
                                           │
                              ┌────────────┘
                              │
                         Spring AI + LangChain4j
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Qdrant            OpenAI API
              (Recherche)         (Génération)
                    │                   │
                    └─────────┬─────────┘
                              │
                         Réponse finale
                              │
                         Étudiant ✅
```

---

## 🛠️ Stack Technique

### 🖥️ Frontend
| Outil | Rôle |
|---|---|
| **React 18** | Construction de l'interface du chat (composants, état) |
| **JavaScript** | Logique côté navigateur, communication avec l'API |
| **Vite** | Outil de build ultra-rapide avec Hot Module Replacement |
| **Tailwind CSS** | Stylisation rapide et design responsive |
| **Shadcn UI** | Composants UI prêts à l'emploi (boutons, modales, champs) |

### ⚙️ Backend
| Outil | Rôle |
|---|---|
| **Spring Boot** | Serveur principal, gestion des API REST et de la logique métier |
| **Spring AI** | Intégration native de l'IA dans Spring (embeddings, RAG) |
| **LangChain4j** | Orchestration du pipeline RAG (chunking, retrieval, generation) |
| **OpenAI API** | Moteur IA : vectorisation du texte + génération des réponses |

### 🗄️ Base de Données
| Outil | Rôle |
|---|---|
| **PostgreSQL** | Stockage des utilisateurs et de l'historique des conversations |
| **Qdrant** | Base vectorielle pour la recherche sémantique sur les documents |
| **Redis** | Cache des réponses fréquentes + message broker asynchrone |

### 📦 Stockage
| Outil | Rôle |
|---|---|
| **MinIO** | Stockage des fichiers bruts (PDFs, images) — compatible S3 |

### 🏗️ Infrastructure
| Outil | Rôle |
|---|---|
| **Docker** | Conteneurisation de chaque service pour un déploiement uniforme |
| **Nginx** | Reverse proxy : routage des requêtes + gestion du HTTPS |

---

## 📁 Structure du Projet

```
ask_enset/
│
├── frontend/                        # Interface utilisateur React
│   ├── src/
│   │   ├── components/              # Composants réutilisables
│   │   │   ├── Chat/                # Interface du chat
│   │   │   ├── MessageBubble/       # Bulle de message
│   │   │   └── Sidebar/             # Historique des conversations
│   │   ├── pages/                   # Pages principales
│   │   │   ├── ChatPage.jsx         # Page principale du chat
│   │   │   └── AdminPage.jsx        # Dashboard administrateur
│   │   ├── services/                # Appels API vers le backend
│   │   └── main.jsx                 # Point d'entrée
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── backend/                         # Serveur Spring Boot
│   ├── src/main/java/ma/enset/askenset/
│   │   ├── controller/              # Endpoints REST API
│   │   │   ├── ChatController.java  # /api/chat
│   │   │   └── AdminController.java # /api/admin/upload
│   │   ├── service/                 # Logique métier
│   │   │   ├── ChatService.java     # Orchestration RAG
│   │   │   ├── RagService.java      # Pipeline RAG (LangChain4j)
│   │   │   └── DocumentService.java # Traitement des PDFs
│   │   ├── model/                   # Entités base de données
│   │   │   ├── User.java
│   │   │   └── Conversation.java
│   │   ├── repository/              # Accès PostgreSQL (JPA)
│   │   └── config/                  # Configuration Spring AI, Qdrant
│   └── pom.xml
│
├── docker/                          # Configuration Docker
│   ├── docker-compose.yml           # Orchestration de tous les services
│   ├── nginx/
│   │   └── nginx.conf               # Configuration reverse proxy
│   └── init/
│       └── init.sql                 # Script d'initialisation PostgreSQL
│
└── README.md
```

---

## 🚀 Installation

### Prérequis
- Docker & Docker Compose
- Java 21+
- Node.js 18+
- Clé API OpenAI

### 1. Cloner le projet
```bash
git clone https://github.com/enset/ask_enset.git
cd ask_enset
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Remplir les valeurs dans .env
```

```env
OPENAI_API_KEY=sk-...
POSTGRES_DB=ask_enset
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_password
QDRANT_HOST=qdrant
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 3. Lancer tous les services avec Docker
```bash
docker-compose up -d
```

### 4. Lancer le backend (développement)
```bash
cd backend
./mvnw spring-boot:run
```

### 5. Lancer le frontend (développement)
```bash
cd frontend
npm install
npm run dev
```

---

## 💬 Utilisation

### Pour les étudiants
1. Accéder à `https://ask_enset.com`
2. Faire un login
2. Poser une question en français ou en arabe
3. Recevoir une réponse instantanée basée sur les documents officiels de l'ENSET

### Pour les administrateurs
1. Accéder à `http://ask_enset.com/admin`
2. Uploader un PDF officiel (emploi du temps, règlement, etc.)
3. Le système indexe automatiquement le document
4. Les étudiants peuvent immédiatement poser des questions sur ce document

---

## 👥 Contributeurs

| Nom | Rôle |
|---|---|
| — | Développeur Full Stack |
| — | Développeur Backend / IA |
| — | Développeur Frontend |

---

## 📄 Licence

Projet académique — ENSET Mohammedia © 2026

---

> **Ask_ENSET** — *L'information officielle, disponible quand vous en avez besoin.*
