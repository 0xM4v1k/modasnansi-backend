# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY src/ ./src/

# Construir la aplicación
RUN npm run build

# Etapa de producción  
FROM node:18-alpine

WORKDIR /app

# Instalar cliente MySQL para healthcheck
RUN apk add --no-cache mysql-client

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar solo las dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Configurar variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Exponer el puerto
EXPOSE 3000

# Healthcheck para la aplicación
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]