# --- Etapa 1: Build da Aplicação ---
# Usa uma imagem oficial do Node.js para o ambiente de build.
FROM node:18 AS build

# Define o diretório de trabalho no contêiner.
WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker.
COPY package*.json ./

# Instala todas as dependências do projeto.
RUN npm install

# Copia o restante do código da aplicação.
COPY . .

# Roda o comando de build do seu front-end.
# Substitua 'npm run build' se você usar outro comando.
RUN npm run build

# --- Etapa 2: Servidor de Produção ---
# Usa uma imagem leve para servir a aplicação, neste caso, o Nginx.
FROM nginx:alpine

# Copia os arquivos da aplicação compilada da etapa de build.
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta que o Nginx usará.
EXPOSE 80

# Comando padrão para iniciar o Nginx.
CMD ["nginx", "-g", "daemon off;"]