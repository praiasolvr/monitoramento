# Etapa 1: base da imagem com Nginx
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o arquivo de configuração customizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos da pasta dist
COPY dist/ /usr/share/nginx/html

# Expor a porta 80 (será usada externamente com -p)
EXPOSE 80

# Comando padrão para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]