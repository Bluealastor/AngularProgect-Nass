# ── Stage 1: Build Angular ────────────────────────────────────────────────────
# Usa Node per compilare il progetto Angular in file statici ottimizzati.
FROM node:20-alpine AS builder

WORKDIR /app

# Copia prima solo i file delle dipendenze per sfruttare la cache Docker:
# se package.json non cambia, npm ci non viene rieseguito al rebuild.
COPY package.json package-lock.json ./
RUN npm ci

# Copia il resto del sorgente e compila in modalità produzione
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve con nginx ──────────────────────────────────────────────────
# Immagine finale leggera: solo nginx + i file buildati, niente Node.
FROM nginx:1.27-alpine

# Copia la configurazione nginx custom (proxy verso api-gateway + routing Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file statici prodotti dallo Stage 1
COPY --from=builder /app/dist/nas-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
