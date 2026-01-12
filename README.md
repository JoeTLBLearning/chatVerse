# 💬 ChatVerse

**ChatVerse** est une application de messagerie instantanée en temps réel (type Discord/Slack) développée avec la stack MERN (MongoDB, Express, React, Node.js) et Socket.io. Elle permet aux utilisateurs de créer des salons, de gérer des canaux, d'ajouter des amis et de discuter en direct.

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Utilisateurs
- Inscription et Connexion sécurisées (JWT & Bcrypt).
- Statut en ligne/hors ligne en temps réel.

### 💬 Messagerie en Temps Réel
- Communication instantanée via **Socket.io**.
- Discussions privées (DM) entre amis.
- Discussions de groupe via des Salons (Rooms) et Canaux (Channels).
- Historique des messages persistant (MongoDB).

### 🏠 Gestion des Salons (Rooms)
- Création de salons multi-canaux.
- **Système d'invitation** : L'admin peut inviter des amis.
- **Demandes d'adhésion** : Notifications en temps réel lors d'une invitation.
- **Gestion des membres** : Le propriétaire peut expulser (Kick) des membres.
- Ajout, renommage et suppression de canaux.

### 👥 Système d'Amis
- Rechercher des utilisateurs par #short_ID.
- Envoyer/Accepter/Refuser des demandes d'amis.
- Notifications en temps réel pour les nouvelles demandes.

---

## 🛠️ Stack Technique

- **Frontend :** React.js (Vite), Axios, React Router DOM, Styled Components / Tailwind CSS.
- **Backend :** Node.js, Express.js.
- **Base de données :** MongoDB Atlas (Cloud).
- **Temps Réel :** Socket.io (Client & Server).
- **Déploiement :** Render (Web Service pour l'API, Static Site pour le Client).

---

## 💻 Installation en Local

Pour lancer le projet sur votre machine, suivez ces étapes :
### 1. Cloner le dépôt
```bash

git clone [https://github.com/JoeTLBLearning/chatVerse.git](https://github.com/JoeTLBLearning/chatVerse.git)
cd chatVerse

```

### 2. Configuration du Backend (Serveur)
Accédez au dossier serveur, installez les dépendances et configurez les variables d'environnement.

```bash

cd server
npm install

```

Créez un fichier .env dans le dossier server/ et ajoutez-y :

PORT=5000
MONGO_URI=votre_lien_de_connexion_mongodb_atlas
JWT_SECRET=votre_clé_secrète_super_longue
FRONTEND_URL=http://localhost:5173

Lancez le serveur :

```bash

npm run dev

```

### 3. Configuration du Frontend (Client)
Dans un nouveau terminal, accédez au dossier client.

```bash

cd client
npm install

```

Note : Assurez-vous que le fichier src/utils/APIRoutes.js pointe bien vers http://localhost:5000 pour le développement local.

Lancez l'application React :


```bash

npm run dev

```

Ouvrez votre navigateur sur http://localhost:5173.


## Bonus : Déploiement (Production sur Render) 🌐
Le projet est configuré pour être déployé sur Render avec deux services distincts.

Backend (Web Service)
Root Directory : server

Build Command : npm install

Start Command : npm start

Variables d'environnement :

MONGO_URI : Lien MongoDB Atlas.

PORT : 10000 (Port par défaut de Render).

FRONTEND_URL : L'URL de votre site frontend déployé (ex: https://chatverse.onrender.com).

Frontend (Static Site)
Root Directory : client

Build Command : npm install && npm run build

Publish Directory : dist

Réglages SPA : Ajouter une règle de réécriture (Rewrite) dans l'onglet "Redirects/Rewrites" :

Source: /* -> Destination: /index.html -> Action: Rewrite.


## Structure du projet : 

chatVerse/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Modals, ChatWindow, Sidebar...
│   │   ├── hooks/       # Hooks personnalisés (useSocket...)
│   │   ├── pages/       # Login, Register, Dashboard
│   │   └── utils/       # Routes API
│   └── ...
├── server/              # Backend (Node + Express)
│   ├── controllers/     # Logique métier
│   ├── models/          # Schémas Mongoose (User, Message, Room...)
│   ├── routes/          # Définitions des routes API
│   └── index.js         # Point d'entrée (Socket.io setup)
└── README.md

# 👤 Auteur
Projet réalisé par Joe_TLB.