# 🏎️ Berizz Auto

**Berizz Auto** est une plateforme automobile premium permettant de découvrir, configurer et gérer des véhicules haut de gamme avec une expérience immersive et moderne.

🔗 Live : https://berizz-auto.vercel.app

---

## ✨ Features

- 🔥 UI premium (design noir / rouge cinématique)
- 🚗 Configurateur de véhicule dynamique
- 🧠 Backend avec gestion des modèles, packs et commandes
- 🔐 Authentification utilisateur (Supabase)
- 🛠️ Backoffice admin (CRUD complet)
- 📩 Formulaire de contact + emails automatisés
- ⚡ Performances optimisées (Next.js)

---

## 🧱 Stack Technique

- **Frontend** : Next.js (App Router)
- **Backend** : Supabase (Auth + Database)
- **Styling** : Tailwind CSS
- **Animations** : GSAP + Framer Motion
- **Deployment** : Vercel

---

## 📁 Structure du projet

```

## ⚙️ Installation

```bash
git clone https://github.com/ton-repo/berizz-auto.git
cd berizz-auto
npm install
```

---

## 🔑 Variables d’environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL= (my url)
NEXT_PUBLIC_SUPABASE_ANON_KEY= (my url)
```

---

## 🚀 Lancer le projet

```bash
npm run dev
```

Puis ouvrir :  
👉 http://localhost:3000

---

## 🧠 Fonctionnement

### 🔐 Authentification

- Inscription / Connexion via Supabase
- Gestion des rôles (`user_roles`)

### 🛠️ Backoffice

- Ajout / modification / suppression :
  - modèles
  - packs
  - couleurs
  - commandes

### 🚗 Configurateur

- Sélection dynamique des options
- UI immersive
- Calcul des configurations

---

## 🎨 Design System

- **Couleurs**
  - Noir : `#000000`
  - Rouge : `#E31F2C`
  - Blanc : `#F0F0EB`

- **Typo**
  - Barlow
  - Barlow Condensed

- **Style**
  - Premium
  - Minimaliste
  - Cinématique

---

## 🧪 Améliorations futures

- 🧾 Paiement en ligne
- 📊 Dashboard analytics
- 🌍 Multi-langue
- 📱 PWA / mobile app
- 🤖 IA configurateur

---

## 👨‍💻 Auteur

Projet développé par **Berizz**

---

## ⚠️ Disclaimer

Projet fictif de marque automobile premium.  
Aucune affiliation avec Audi, BMW, Mercedes, etc.
