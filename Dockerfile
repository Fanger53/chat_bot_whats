# Usa una imagen base oficial de Node.js
FROM node:20

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo package.json y pnpm-lock.yaml al directorio de trabajo
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias del proyecto
RUN npm install -g pnpm
RUN pnpm install

# Copia el resto de los archivos del proyecto al directorio de trabajo
COPY . .

# Expone el puerto en el que la aplicación escuchará
EXPOSE 3008

# Define el comando para ejecutar la aplicación en modo desarrollo
CMD ["pnpm", "run", "dev"]