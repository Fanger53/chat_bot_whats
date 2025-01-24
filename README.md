# Base App - Bot de WhatsApp con TypeScript

## Descripción
Esta es una aplicación de bot de WhatsApp construida con TypeScript, utilizando diferentes proveedores y plugins para extensibilidad.

## Requisitos Previos
- Node.js (versión 18 o superior recomendada)
- pnpm
- Cuenta de OpenAI (para funcionalidades de IA)
- Dispositivo con WhatsApp

## Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-de-tu-repositorio>
cd base-app
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
OPENAI_API_KEY=tu_api_key_de_openai
# Agrega otras variables de configuración necesarias
```

## Scripts Disponibles

### Desarrollo
```bash
pnpm dev
```
Inicia la aplicación en modo de desarrollo utilizando `tsx`.

### Pruebas
```bash
pnpm test
```
Actualmente no hay pruebas configuradas.

## Dependencias Principales
- `@bot-whatsapp/bot`: Framework base para el bot de WhatsApp
- `@bot-whatsapp/provider-baileys`: Proveedor de Baileys para WhatsApp
- `@builderbot-plugins/openai-agents`: Plugin de agentes de IA
- `axios`: Cliente HTTP
- `openai`: Biblioteca oficial de OpenAI
- `dotenv`: Manejo de variables de entorno

## Configuración de Desarrollo
- Lenguaje: TypeScript
- Gestor de Paquetes: pnpm
- Entorno de Ejecución: Node.js con TSX

## Estructura del Proyecto
```
base-app/
│
├── src/
│   └── app.ts        # Punto de entrada principal
│
├── package.json      # Configuración de dependencias
└── README.md         # Documentación del proyecto
```

## Contribución
1. Haz un fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/nuevaCaracteristica`)
3. Realiza tus cambios
4. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
5. Sube tus cambios (`git push origin feature/nuevaCaracteristica`)
6. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia ISC.

## Contacto
Para preguntas o soporte, por favor abre un issue en el repositorio.