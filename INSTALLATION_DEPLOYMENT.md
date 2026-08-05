# Guide d'Installation et de Déploiement - IHVERRE-ERP

## 📦 Installation Locale

### Prérequis

- **OS:** Windows 10+, macOS 10.15+, ou Linux
- **.NET:** 5.0+
- **Node.js:** 16+ et npm 8+
- **SQL Server:** 2016+ (ou Docker)
- **Git:** 2.0+
- **Docker:** 20.10+ (optionnel mais recommandé)

### Étape 1: Cloner le Dépôt

```bash
git clone https://github.com/amelnadad2030-alt/IHVERRE-.git
cd IHVERRE-
```

### Étape 2: Configuration Backend

#### 2.1 Restaurer les Dépendances

```bash
cd backend
dotnet restore
```

#### 2.2 Configurer la Base de Données

Créez un fichier `appsettings.Development.json` :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=IHVerreDB;User Id=sa;Password=IHVerre@2024!;Encrypt=false;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

#### 2.3 Appliquer les Migrations

```bash
cd IHVerre.Infrastructure
dotnet ef database update --startup-project ../IHVerre.Api
```

#### 2.4 Démarrer l'API

```bash
cd ../IHVerre.Api
dotnet run
```

L'API sera accessible sur `http://localhost:5000`

### Étape 3: Configuration Frontend

#### 3.1 Installer les Dépendances

```bash
cd frontend/React
npm install
```

#### 3.2 Configurer les Variables d'Environnement

Créez un fichier `.env.local` :

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

#### 3.3 Démarrer l'Application

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🐳 Installation avec Docker

### Étape 1: Prérequis Docker

Assurez-vous que Docker et Docker Compose sont installés :

```bash
docker --version
docker-compose --version
```

### Étape 2: Build et Démarrage

```bash
# À la racine du projet
docker-compose up -d
```

### Étape 3: Appliquer les Migrations

```bash
docker-compose exec api dotnet ef database update
```

### Étape 4: Vérifier les Services

```bash
docker-compose ps
```

### Services Disponibles

- **API:** http://localhost:5000
- **Frontend:** http://localhost:3000
- **SQL Server:** localhost:1433 (Utilisateur: sa, Mot de passe: IHVerre@2024!)

### Arrêter les Services

```bash
docker-compose down
```

### Supprimer les Volumes de Données

```bash
docker-compose down -v
```

## 🚀 Déploiement en Production

### Architecture Recommandée

```
┌─────────────────┐
│   Load Balancer │
│   (Nginx/HAProxy)
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
┌───▼──┐   ┌──▼───┐
│ API 1 │   │ API 2 │  (Réplicas)
└───┬──┘   └──┬───┘
    │         │
    └────┬────┘
         │
    ┌────▼─────────┐
    │  SQL Server  │
    │  (Cluster)   │
    └──────────────┘
```

### Étape 1: Préparer le Serveur

```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Étape 2: Préparer les Secrets

```bash
# Créer un fichier .env pour les secrets
cat > .env.production << EOF
SA_PASSWORD=YourSecurePassword123!
JWT_SECRET=YourJWTSecretKeyAtLeast32CharactersLong
DATABASE_CONNECTION=Server=sqlserver;Database=IHVerreDB_Prod;User Id=sa;Password=YourSecurePassword123!;
EOF

# Protéger le fichier
chmod 600 .env.production
```

### Étape 3: Déployer avec Docker Compose (Production)

Créez un fichier `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      SA_PASSWORD: ${SA_PASSWORD}
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    restart: unless-stopped
    networks:
      - ihverre_network

  api:
    image: ghcr.io/amelnadad2030-alt/ihverre--api:latest
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: ${DATABASE_CONNECTION}
      Jwt__SecretKey: ${JWT_SECRET}
    ports:
      - "5000:80"
    depends_on:
      - sqlserver
    restart: unless-stopped
    networks:
      - ihverre_network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  frontend:
    image: ghcr.io/amelnadad2030-alt/ihverre--frontend:latest
    environment:
      REACT_APP_API_URL: http://your-domain.com/api
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - ihverre_network

volumes:
  sqlserver_data:

networks:
  ihverre_network:
    driver: bridge
```

Déployez :

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Étape 4: Configuration HTTPS

#### Avec Nginx en reverse proxy :

```nginx
upstream api_backend {
    server api:80;
}

upstream frontend_app {
    server frontend:80;
}

server {
    listen 443 ssl;
    server_name ihverre.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name ihverre.com;
    return 301 https://$server_name$request_uri;
}
```

### Étape 5: Monitoring et Logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f api

# Afficher les statistiques
docker stats

# Vérifier la santé des services
docker-compose ps
```

## 🔄 Mise à Jour et Maintenance

### Mettre à Jour l'Application

```bash
# Arrêter les services
docker-compose down

# Cloner la dernière version
git pull origin main

# Reconstruire les images
docker-compose build

# Redémarrer les services
docker-compose up -d

# Appliquer les migrations si nécessaire
docker-compose exec api dotnet ef database update
```

### Sauvegarde de la Base de Données

```bash
# Sauvegarder SQL Server
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "BACKUP DATABASE [IHVerreDB] TO DISK = '/var/opt/mssql/backup/IHVerreDB.bak'"

# Copier la sauvegarde localement
docker cp ihverre_sqlserver:/var/opt/mssql/backup/IHVerreDB.bak ./backups/
```

### Restaurer à partir d'une Sauvegarde

```bash
# Copier la sauvegarde dans le container
docker cp ./backups/IHVerreDB.bak ihverre_sqlserver:/var/opt/mssql/backup/

# Restaurer la base de données
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "RESTORE DATABASE [IHVerreDB] FROM DISK = '/var/opt/mssql/backup/IHVerreDB.bak'"
```

## 🐛 Troubleshooting

### Erreur de Connexion à la Base de Données

```bash
# Vérifier que SQL Server est en cours d'exécution
docker-compose ps sqlserver

# Vérifier la connectivité
docker-compose exec api sqlcmd -S sqlserver -U sa -P $SA_PASSWORD -Q "SELECT 1"
```

### Erreur de Port Déjà Utilisé

```bash
# Trouver le processus utilisant le port
lsof -i :5000  # Pour API
lsof -i :3000  # Pour Frontend
lsof -i :1433  # Pour SQL Server

# Arrêter le processus
kill -9 <PID>
```

### Erreur de Migration

```bash
# Vérifier le statut des migrations
docker-compose exec api dotnet ef migrations list

# Revenir à la migration précédente
docker-compose exec api dotnet ef database update <previous_migration_name>
```

## 📊 Monitoring en Production

### Avec Prometheus + Grafana

```yaml
# Ajouter à docker-compose.prod.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  depends_on:
    - prometheus
```

## ✅ Checklist Post-Déploiement

- [ ] Vérifier que tous les services sont en cours d'exécution
- [ ] Tester l'API `/health` endpoint
- [ ] Vérifier la base de données
- [ ] Tester l'authentification
- [ ] Vérifier les logs
- [ ] Configurer les backups automatiques
- [ ] Configurer les alertes de monitoring
- [ ] Documenter les accès
- [ ] Tester le failover (si applicable)
- [ ] Tester la restauration à partir d'une sauvegarde

## 📞 Support et Contact

Pour toute question ou problème :
- Consultez la documentation: `/docs`
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Version:** 1.0  
**Dernière mise à jour:** 2024-01-15  
**Auteur:** Équipe IHVERRE Development
