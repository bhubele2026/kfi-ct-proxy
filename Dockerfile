FROM node:20-alpine

WORKDIR /app

# Install deps first for layer caching
COPY package*.json ./
RUN npm install --omit=dev

# App source
COPY index.js ./
COPY public ./public

ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
