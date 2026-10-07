# Front JavaScript "vanilla" : aucune compilation nécessaire.
# => UN SEUL stage suffit : nginx sert directement les fichiers statiques.
# (Contrairement au front TypeScript qui, lui, exige un build => multi-stage.)
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
