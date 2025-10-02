# ---- Fase 1: Build (Construção) ----
# Usamos uma imagem do Node.js v20, conforme especificado no seu package.json.
# 'AS builder' nomeia esta fase para referência futura.
FROM node:20-alpine AS builder

ARG GIT_COMMIT_HASH
ENV VITE_APP_GIT_HASH=$GIT_COMMIT_HASH
# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte da aplicação
COPY . .

# Executa o script de build ('vite build') para gerar os arquivos estáticos
# O Vite, por padrão, cria uma pasta chamada 'dist'.
RUN npm run build

# ---- Fase 2: Produção ----
# Agora, usamos uma imagem super leve do Nginx para servir os arquivos.
FROM nginx:1.25-alpine

# Remove a configuração padrão do Nginx.
RUN rm /etc/nginx/conf.d/default.conf

# Copia nosso arquivo de configuração personalizado (que criaremos a seguir).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos de produção da fase de 'build' para a pasta do Nginx.
# A origem é /app/dist (onde o 'vite build' colocou os arquivos).
# O destino é a pasta que o Nginx usa para servir conteúdo.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que o Nginx escuta por padrão.
EXPOSE 80

# Comando para iniciar o servidor Nginx em primeiro plano quando o container for executado.
CMD ["nginx", "-g", "daemon off;"]