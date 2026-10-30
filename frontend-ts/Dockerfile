# ---------- Stage 1 : build (compilation TypeScript + bundle Vite) ----------
# Node.js sert à installer les dépendances et compiler le frontend.
FROM node:20-alpine AS build

# Définit le dossier de travail dans le conteneur.
WORKDIR /app

# Copie d'abord les fichiers de dépendances pour les installer.
COPY package*.json ./
RUN npm install

# Copie le code puis génère les fichiers frontend prêts à servir.
COPY . .
RUN npm run build

# ---------- Stage 2 : serveur nginx (image finale légère) ----------
# L'image finale ne contient que Nginx et les fichiers compilés.
FROM nginx:1.27-alpine

# Configure le proxy /api vers le backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie le résultat de compilation depuis le premier stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Garde Nginx au premier plan pour que Docker puisse suivre le conteneur.
CMD ["nginx", "-g", "daemon off;"]
