# 🏢 Guide de Déploiement en Production - IHVERRE-ERP

## 🎯 Objectif
Déployer IHVERRE-ERP en environnement production avec haute disponibilité, sécurité maximale et monitoring.

---

## 📋 Checklist Pré-Déploiement

### Infrastructure
- [ ] Serveur Linux (Ubuntu 20.04 LTS recommandé)
- [ ] Docker et Docker Compose installés
- [ ] SQL Server déployé ou cloud (Azure SQL, AWS RDS)
- [ ] Domaine configuré (SSL/TLS)
- [ ] Firewall configuré
- [ ] Backup strategy défini

### Sécurité
- [ ] Secrets Manager configuré
- [ ] JWT secrets générés (32+ caractères)
- [ ] Certificats SSL/TLS installés
- [ ] Authentification BD renforcée
- [ ] CORS configuré
- [ ] Rate limiting activé

### Performance
- [ ] Load balancer configuré
- [ ] CDN pour assets static
- [ ] Caching Redis (optionnel)
- [ ] Monitoring et logging en place
- [ ] Backup automatique configuré

---

## 🔐 Step 1: Générer les Secrets

### Générer des Clés Sécurisées

```bash
# JWT Secret (min 32 caractères)
openssl rand -base64 32
# Exemple de sortie: 7x!A%D*G-KaPdSgUkXp2s5v8y/B?E(H+MbQeThWmZq4t7w9z$C&F-JaNdRgUkXp

# Database Password
openssl rand -base64 20
# Exemple de sortie: X9@pQ#mK$wL7^bN&vZ2*cJ+

# API Key (optionnel)
openssl rand -base64 32
```

### Créer le Fichier .env Production

```bash
# Créer le fichier .env.production
cat > /home/ihverre/.env.production << 'EOF'
# Environment
ASPNETCORE_ENVIRONMENT=Production
NODE_ENV=production

# Database
SA_PASSWORD=$(openssl rand -base64 20)
MSSQL_PID=Enterprise
DATABASE_NAME=IHVerreDB_Prod
DATABASE_USER=sa

# Security
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ISSUER=IHVERRE-ERP-Prod
JWT_AUDIENCE=IHVERRE-Prod-Users
JWT_EXPIRES_MINUTES=480

# API
API_URL=https://api.ihverre.com
API_PORT=80
API_WORKERS=4

# Frontend
FRONTEND_URL=https://ihverre.com
REACT_APP_API_URL=https://api.ihverre.com/api

# Email (pour notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ihverre.com
SMTP_PASSWORD=your_app_password

# Logging
LOG_LEVEL=Information
LOG_FILE=/var/log/ihverre/api.log

# Monitoring
ENABLE_MONITORING=true
ENABLE_LOGGING=true
ENABLE_ANALYTICS=true
EOF

# Protéger le fichier
chmod 600 /home/ihverre/.env.production
```

---

## 🗄️ Step 2: Préparer la Base de Données

### Option A: SQL Server sur le Serveur

```bash
# Créer un dossier pour les données
mkdir -p /var/lib/sqlserver/data
mkdir -p /var/lib/sqlserver/backup
chmod -R 755 /var/lib/sqlserver

# Créer le fichier docker-compose.prod.yml
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    container_name: ihverre_sqlserver_prod
    environment:
      SA_PASSWORD: ${SA_PASSWORD}
      ACCEPT_EULA: "Y"
      MSSQL_PID: ${MSSQL_PID}
    ports:
      - "1433:1433"
    volumes:
      - /var/lib/sqlserver/data:/var/opt/mssql/data
      - /var/lib/sqlserver/backup:/var/opt/mssql/backup
    restart: unless-stopped
    networks:
      - ihverre_prod
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", "${SA_PASSWORD}", "-Q", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: ghcr.io/amelnadad2030-alt/ihverre--api:latest
    container_name: ihverre_api_prod
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: "Server=sqlserver;Database=${DATABASE_NAME};User Id=${DATABASE_USER};Password=${SA_PASSWORD};Encrypt=true;TrustServerCertificate=false;"
      Jwt__SecretKey: ${JWT_SECRET_KEY}
      Jwt__Issuer: ${JWT_ISSUER}
      Jwt__Audience: ${JWT_AUDIENCE}
      Jwt__ExpiresInMinutes: ${JWT_EXPIRES_MINUTES}
      Logging__LogLevel__Default: ${LOG_LEVEL}
    ports:
      - "5000:80"
    depends_on:
      sqlserver:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ihverre_prod
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: ghcr.io/amelnadad2030-alt/ihverre--frontend:latest
    container_name: ihverre_frontend_prod
    environment:
      REACT_APP_API_URL: ${API_URL}/api
      REACT_APP_ENV: production
    ports:
      - "3000:80"
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - ihverre_prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  sqlserver_data:

networks:
  ihverre_prod:
    driver: bridge
EOF
```

### Option B: Azure SQL Database

```bash
# Créer une base de données Azure SQL
az sql server create \
  --name ihverre-server \
  --resource-group ihverre-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!

# Créer la base de données
az sql db create \
  --resource-group ihverre-rg \
  --server ihverre-server \
  --name IHVerreDB_Prod \
  --service-objective S1

# Configurer le firewall
az sql server firewall-rule create \
  --resource-group ihverre-rg \
  --server ihverre-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## 🐳 Step 3: Déployer les Conteneurs

### 3.1 Créer les Répertoires

```bash
# Créer la structure de répertoires
mkdir -p /home/ihverre/ihverre-erp
mkdir -p /var/log/ihverre
mkdir -p /home/ihverre/backups

cd /home/ihverre/ihverre-erp
```

### 3.2 Cloner le Repo

```bash
# Cloner le dépôt en production
git clone --depth 1 https://github.com/amelnadad2030-alt/IHVERRE-.git .

# Vérifier que les fichiers sont présents
ls -la
```

### 3.3 Configurer les Variables d'Environnement

```bash
# Copier le fichier .env depuis le fichier créé plus tôt
cp /home/ihverre/.env.production /home/ihverre/ihverre-erp/.env

# Vérifier les permissions
chmod 600 /home/ihverre/ihverre-erp/.env
```

### 3.4 Démarrer les Services

```bash
# Charger les variables d'environnement
export $(cat .env | xargs)

# Build les images (si nécessaire)
docker-compose -f docker-compose.prod.yml build

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

# Consulter les logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Step 4: Configurer Nginx (Reverse Proxy + HTTPS)

### 4.1 Installer Nginx

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 4.2 Configuration Nginx

```bash
# Créer la configuration
sudo tee /etc/nginx/sites-available/ihverre << 'EOF'
upstream api_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    keepalive 64;
}

upstream frontend_app {
    server 127.0.0.1:3000;
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ihverre.com www.ihverre.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ihverre.com www.ihverre.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/ihverre.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ihverre.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/ihverre_access.log;
    error_log /var/log/nginx/ihverre_error.log;

    # Frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/ihverre /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 4.3 Configurer SSL avec Let's Encrypt

```bash
# Obtenir un certificat SSL
sudo certbot certonly --nginx \
  --non-interactive \
  --agree-tos \
  --email admin@ihverre.com \
  -d ihverre.com \
  -d www.ihverre.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📊 Step 5: Monitoring et Logging

### 5.1 Configurer les Logs

```bash
# Créer un fichier de configuration pour les logs
mkdir -p /etc/docker/logging
cat > /etc/docker/logging/logging.conf << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "10"
  }
}
EOF
```

### 5.2 Configurer Prometheus + Grafana (optionnel)

```bash
# Ajouter à docker-compose.prod.yml
cat >> docker-compose.prod.yml << 'EOF'

  prometheus:
    image: prom/prometheus:latest
    container_name: ihverre_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped
    networks:
      - ihverre_prod

  grafana:
    image: grafana/grafana:latest
    container_name: ihverre_grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - ihverre_prod

volumes:
  prometheus_data:
  grafana_data:
EOF
```

### 5.3 Monitoring des Services

```bash
# Vérifier le statut des services
docker-compose -f docker-compose.prod.yml ps

# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier les ressources utilisés
docker stats

# Health check
curl -f http://localhost:5000/health
curl -f http://localhost:3000/
```

---

## 💾 Step 6: Backup et Restauration

### 6.1 Créer un Script de Backup

```bash
#!/bin/bash
# Fichier: /home/ihverre/backup.sh

BACKUP_DIR="/home/ihverre/backups"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="IHVerreDB_Prod"
SA_PASSWORD=$(grep SA_PASSWORD /home/ihverre/ihverre-erp/.env | cut -d'=' -f2)

# Créer le backup
docker-compose -f /home/ihverre/ihverre-erp/docker-compose.prod.yml exec -T sqlserver \
  /opt/mssql-tools/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "$SA_PASSWORD" \
  -Q "BACKUP DATABASE [$DB_NAME] TO DISK = '/var/opt/mssql/backup/${DB_NAME}_${BACKUP_DATE}.bak'"

# Copier le backup localement
docker cp ihverre_sqlserver_prod:/var/opt/mssql/backup/${DB_NAME}_${BACKUP_DATE}.bak \
  $BACKUP_DIR/

# Nettoyer les anciens backups (garder les 7 derniers)
ls -t $BACKUP_DIR/${DB_NAME}_*.bak | tail -n +8 | xargs rm -f

echo "Backup completed: ${DB_NAME}_${BACKUP_DATE}.bak"
```

### 6.2 Planifier les Backups (Cron)

```bash
# Ajouter à crontab
crontab -e

# Ajouter les lignes suivantes:
# Backup quotidien à 2h du matin
0 2 * * * /home/ihverre/backup.sh >> /var/log/ihverre/backup.log 2>&1

# Backup hebdomadaire (dimanche 3h)
0 3 * * 0 /home/ihverre/backup_weekly.sh >> /var/log/ihverre/backup_weekly.log 2>&1
```

---

## 🔄 Step 7: Mise à Jour Automatique

### 7.1 Script de Déploiement

```bash
#!/bin/bash
# Fichier: /home/ihverre/deploy.sh

set -e

cd /home/ihverre/ihverre-erp

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Loading environment..."
export $(cat .env | xargs)

echo "🏗️ Building new images..."
docker-compose -f docker-compose.prod.yml build

echo "🛑 Stopping services..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "🔄 Applying migrations..."
docker-compose -f docker-compose.prod.yml exec -T api dotnet ef database update

echo "✅ Deployment completed!"
docker-compose -f docker-compose.prod.yml ps
```

### 7.2 Donner les Permissions d'Exécution

```bash
chmod +x /home/ihverre/deploy.sh
chmod +x /home/ihverre/backup.sh
```

---

## 🧪 Step 8: Tests Post-Déploiement

### Checklist de Validation

```bash
#!/bin/bash

echo "🧪 Testing IHVERRE-ERP Production Deployment"
echo "==========================================="

# Test 1: Vérifier que les services sont running
echo "✓ Checking services status..."
docker-compose -f /home/ihverre/ihverre-erp/docker-compose.prod.yml ps

# Test 2: Vérifier l'API
echo "✓ Testing API health..."
curl -f https://ihverre.com/api/health || echo "❌ API health check failed"

# Test 3: Vérifier le Frontend
echo "✓ Testing Frontend..."
curl -f https://ihverre.com/ || echo "❌ Frontend check failed"

# Test 4: Vérifier la base de données
echo "✓ Testing Database connection..."
docker-compose -f /home/ihverre/ihverre-erp/docker-compose.prod.yml exec -T api \
  sqlcmd -S sqlserver -U sa -P $SA_PASSWORD -Q "SELECT 1" || echo "❌ Database connection failed"

# Test 5: Vérifier les logs
echo "✓ Checking logs..."
docker-compose -f /home/ihverre/ihverre-erp/docker-compose.prod.yml logs --tail 50

echo "==========================================="
echo "✅ All tests completed!"
```

---

## 📈 Step 9: Monitoring Continu

### Commandes de Monitoring

```bash
# Voir les ressources en temps réel
watch 'docker stats --no-stream'

# Voir les logs du dernier 1h
docker-compose -f docker-compose.prod.yml logs --since 1h -f

# Vérifier les volumes
docker volume ls
docker volume inspect ihverre_sqlserver_data

# Vérifier le réseau
docker network ls
docker network inspect ihverre_prod
```

---

## 🆘 Troubleshooting Production

### Problème: Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs <service_name>

# Redémarrer le service
docker-compose -f docker-compose.prod.yml restart <service_name>

# Redémarrer complètement
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Problème: Base de données non accessible

```bash
# Vérifier que le conteneur SQL Server est en cours d'exécution
docker ps | grep sqlserver

# Tester la connexion
docker-compose -f docker-compose.prod.yml exec -T sqlserver \
  sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "SELECT @@VERSION"
```

### Problème: Certificat SSL expiré

```bash
# Renouveler le certificat manuellement
sudo certbot renew --force-renewal

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## ✅ Checklist Final Pré-Production

- [ ] Tous les secrets configurés
- [ ] Base de données initialisée
- [ ] Services démarrés et healthy
- [ ] SSL/TLS configuré et actif
- [ ] Domaine pointant vers le serveur
- [ ] Firewall configuré correctement
- [ ] Backups fonctionnels et automatisés
- [ ] Monitoring en place
- [ ] Logs configurés
- [ ] Équipe notifiée et formée
- [ ] Disaster recovery plan documenté
- [ ] Performance tests complétés

---

## 🚀 Commandes Rapides Production

```bash
# Démarrer
cd /home/ihverre/ihverre-erp && docker-compose -f docker-compose.prod.yml up -d

# Arrêter
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup
/home/ihverre/backup.sh

# Déployer nouvelle version
/home/ihverre/deploy.sh

# Status
docker-compose -f docker-compose.prod.yml ps
```

---

**Production Deployment Guide - Version 1.0**  
**Date:** 2024-01-15  
**Status:** ✅ Ready for Production
