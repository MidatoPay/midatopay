FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["npm", "start"]
