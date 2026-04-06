# Berizz Auto

Site vitrine premium — style Apple product page.

## Setup

```bash
# 1. Créer le projet Next.js
npx create-next-app@latest berizz-auto --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"

# 2. Aller dans le dossier
cd berizz-auto

# 3. Installer framer-motion
npm install framer-motion

# 4. Copier tous les fichiers de ce dossier dans le projet

# 5. Lancer
npm run dev
```

## Structure

```
app/
  page.tsx          ← page principale
  layout.tsx        ← fonts + metadata
  globals.css       ← styles globaux
components/
  sections/
    Hero.tsx        ← Section 1 : hero plein écran
    Profile.tsx     ← Section 2 : voiture + annotations
    Exploded.tsx    ← Section 3 : vue éclatée
    Stats.tsx       ← Section 4 : chiffres fond noir
    Models.tsx      ← Section 5 : liste des modèles
    CTA.tsx         ← Section 6 : configurateur
  ui/
    Navbar.tsx
    Footer.tsx
public/
  images/           ← Mettre ici les images IA générées
```

## Remplacer les emojis par les images IA

Dans chaque composant, cherche le commentaire :
`{/* Remplacer par <Image src="..." /> */}`

Et remplace le bloc emoji par :
```tsx
<Image
  src="/images/nom-image.png"
  alt="Description"
  width={800}
  height={500}
  className="w-full h-auto object-contain"
  priority
/>
```
