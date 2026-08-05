# Configuration Générale - IHVERRE-ERP

## 🔧 Variables d'Environnement

### Backend (.NET)

```env
# Environnement
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80

# Base de données
ConnectionStrings__DefaultConnection=Server=sqlserver;Database=IHVerreDB;User Id=sa;Password=IHVerre@2024!;Encrypt=false;

# JWT Authentication
Jwt__SecretKey=YOUR_SECRET_KEY_HERE_MIN_32_CHARACTERS
Jwt__Issuer=IHVERRE-ERP
Jwt__Audience=IHVERRE-ERP-Users
Jwt__ExpiresInMinutes=1440

# Logging
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft=Warning

# CORS
Cors__AllowedOrigins=http://localhost:3000,http://frontend:3000

# Email (optionnel)
Email__SmtpServer=smtp.gmail.com
Email__SmtpPort=587
Email__FromAddress=noreply@ihverre.com
Email__Password=YOUR_PASSWORD
```

### Frontend (React)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=production

# Analytics (optionnel)
REACT_APP_GA_ID=YOUR_GA_ID

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### Base de Données

```env
# SQL Server
SA_PASSWORD=IHVerre@2024!
ACCEPT_EULA=Y
MSSQL_PID=Developer

# Database
DATABASE_NAME=IHVerreDB
```

## 📊 Configuration par Environnement

### Development

```json
{
  "Environment": "Development",
  "Logging": {
    "LogLevel": "Debug"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(local);Database=IHVerreDB;Integrated Security=true;"
  },
  "Jwt": {
    "SecretKey": "dev_key_at_least_32_chars_long!",
    "ExpiresInMinutes": 1440
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5000"]
  }
}
```

### Staging

```json
{
  "Environment": "Staging",
  "Logging": {
    "LogLevel": "Information"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=staging-sqlserver;Database=IHVerreDB_Staging;User Id=sa;Password=PASSWORD;"
  },
  "Jwt": {
    "SecretKey": "staging_key_at_least_32_chars_long!",
    "ExpiresInMinutes": 1440
  },
  "Cors": {
    "AllowedOrigins": ["https://staging.ihverre.com"]
  }
}
```

### Production

```json
{
  "Environment": "Production",
  "Logging": {
    "LogLevel": "Warning"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-sqlserver;Database=IHVerreDB_Prod;User Id=sa;Password=PASSWORD;Encrypt=true;TrustServerCertificate=false;"
  },
  "Jwt": {
    "SecretKey": "prod_key_at_least_32_chars_long!",
    "ExpiresInMinutes": 480
  },
  "Cors": {
    "AllowedOrigins": ["https://ihverre.com"]
  }
}
```

## 🐳 Configuration Docker

### Backend Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "IHVerre.Api.dll"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📋 Fichiers de Configuration Nécessaires

### 1. appsettings.json (Backend)

Location: `backend/IHVerre.Api/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=IHVerreDB;User Id=sa;Password=IHVerre@2024!;Encrypt=false;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-minimum-32-characters-long",
    "Issuer": "IHVERRE-ERP",
    "Audience": "IHVERRE-ERP-Users",
    "ExpiresInMinutes": 1440
  },
  "Cors": {
    "AllowedOrigins": "http://localhost:3000,http://localhost:5000"
  }
}
```

### 2. .env.local (Frontend)

Location: `frontend/React/.env.local`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### 3. nginx.conf (Frontend Nginx)

Location: `frontend/React/nginx.conf`

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://api:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Secrets GitHub

Configurez les secrets suivants dans GitHub:

```
SONAR_TOKEN=<SonarCloud token>
DOCKER_REGISTRY_TOKEN=<GitHub Container Registry token>
PROD_DB_PASSWORD=<Production database password>
PROD_JWT_SECRET=<Production JWT secret>
```

## 📦 Versions Requises

### .NET
- Minimum: .NET 5.0
- Recommandé: .NET 6.0+

### Node.js
- Minimum: 16.x
- Recommandé: 18.x

### SQL Server
- Minimum: 2016
- Recommandé: 2019+

### Docker
- Minimum: 20.10
- Docker Compose: 1.29+

## 🚀 Commandes de Configuration

### Setup Backend

```bash
# Restaurer les dépendances
cd backend/IHVerre.Api
dotnet restore

# Appliquer les migrations
dotnet ef database update

# Exécuter l'API
dotnet run
```

### Setup Frontend

```bash
# Installer les dépendances
cd frontend/React
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Démarrer le serveur de développement
npm start
```

### Setup Docker

```bash
# Build les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Appliquer les migrations
docker-compose exec api dotnet ef database update

# Vérifier le statut
docker-compose ps
```

## 📝 Fichiers de Configuration dans le Projet

```
IHVERRE-ERP/
├── backend/
│   ├── IHVerre.Api/
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── appsettings.Production.json
│   │   └── Dockerfile
│   └── IHVerre.Infrastructure/
│       └── Migrations/
│
├── frontend/
│   └── React/
│       ├── .env
│       ├── .env.local
│       ├── .env.production
│       ├── nginx.conf
│       └── Dockerfile
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── CI_CD_PIPELINE.yml
└── CONFIG.md (ce fichier)
```

---

**Version:** 1.0  
**Dernière mise à jour:** 2024-01-15
