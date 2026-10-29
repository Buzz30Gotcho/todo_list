# Image Nginx légère pour servir le frontend JavaScript sans compilation.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Configure le proxy /api vers le backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers du site dans le dossier servi par Nginx.
COPY public/ /usr/share/nginx/html

# Nginx non-root écoute sur ce port non privilégié.
EXPOSE 8080

USER 101

# Garde Nginx au premier plan pour que Docker puisse suivre le conteneur.
CMD ["nginx", "-g", "daemon off;"]
