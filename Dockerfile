# --- Etapa 1: Build da Aplicação ---
FROM node:18-alpine AS build

WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker.
COPY package*.json ./

# Instala todas as dependências, incluindo as de desenvolvimento.
RUN npm ci

# Copia o restante do código da aplicação.
COPY . .

# Roda o comando de build do front-end.
RUN npm run build

# --- Etapa 2: Servir a Aplicação ---
# Usa uma imagem Node.js leve, sem dependências de desenvolvimento.
FROM node:18-alpine

WORKDIR /app

# Instala o 'serve' globalmente nesta nova imagem.
RUN npm install -g serve

# Copia a pasta de build da etapa anterior para a nova imagem.
COPY --from=build /app/dist ./build

# Expõe a porta 8080.
EXPOSE 8080

# Comando para iniciar o 'serve'.
CMD ["serve", "-s", "build", "-l", "8080"]