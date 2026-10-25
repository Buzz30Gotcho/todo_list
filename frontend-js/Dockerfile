# Image Nginx légère pour servir le frontend JavaScript sans compilation.
FROM nginx:1.27-alpine

# Configure le proxy /api vers le backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers du site dans le dossier servi par Nginx.
COPY public/ /usr/share/nginx/html

# Port HTTP utilisé à l'intérieur du conteneur.
EXPOSE 80

# Garde Nginx au premier plan pour que Docker puisse suivre le conteneur.
CMD ["nginx", "-g", "daemon off;"]
