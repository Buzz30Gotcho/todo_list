# ---------- Stage 1 : build (compilation TypeScript + bundle Vite) ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# "npm run build" lance "vue-tsc --noEmit && vite build" :
# vue-tsc vérifie les types (.vue + .ts), puis Vite compile et bundle en JS
RUN npm run build

# ---------- Stage 2 : serveur nginx (image finale légère) ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
