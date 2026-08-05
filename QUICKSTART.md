# 🚀 IHVERRE-ERP - Guide de Démarrage Rapide (5 minutes)

## ⚡ Démarrage Ultra-Rapide avec Docker

### Option 1: Lancer en 3 Commandes

```bash
# 1. Cloner le repo
git clone https://github.com/amelnadad2030-alt/IHVERRE-.git
cd IHVERRE-

# 2. Démarrer avec Docker Compose
docker-compose up -d

# 3. Accéder à l'application
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Base de Données: localhost:1433 (User: sa, Pass: IHVerre@2024!)
```

✅ C'est tout ! L'application est prête à l'emploi !

---

## 🔧 Démarrage Local (Sans Docker)

### Prérequis
- .NET 5.0+
- Node.js 16+
- SQL Server 2016+

### Étape 1: Backend

```bash
cd backend/IHVerre.Api

# 1.1 Restaurer les dépendances
dotnet restore

# 1.2 Appliquer les migrations
dotnet ef database update --startup-project .

# 1.3 Lancer l'API
dotnet run
```

**API disponible sur:** `http://localhost:5000`

### Étape 2: Frontend

```bash
cd frontend/React

# 2.1 Installer les dépendances
npm install

# 2.2 Démarrer l'application
npm start
```

**Frontend disponible sur:** `http://localhost:3000`

---

## 📊 Fonctionnalités Principales

### 1️⃣ Gestion des Lots
```
POST /api/glassTransformation/batches
{
  "processId": 1,
  "rawMaterialQuantity": 1000,
  "plannedStartDate": "2024-01-15T10:00:00Z",
  "operatorId": "op-001"
}
```

### 2️⃣ Enregistrement de Température
```
POST /api/glassTransformation/batches/1/temperature
{
  "temperature": 750
}
```

### 3️⃣ Contrôle de Qualité
```
POST /api/glassTransformation/batches/1/quality-check
{
  "thickness": 6.0,
  "transmittancePercentage": 92.5,
  "surfaceQualityCheck": true,
  "notes": "OK"
}
```

---

## 📱 Interface Frontend

### Tableau de Bord
- Visualisation temps réel des lots
- Graphiques de température
- Statut des processus
- Historique des qualités

### Formulaire de Création
- Sélection du type de verre
- Configuration du processus
- Assignation d'opérateur
- Validation automatique

---

## 🗂️ Structure du Projet

```
IHVERRE-ERP/
│
├── backend/
│   ├── IHVerre.Api/                 # API REST
│   ├── IHVerre.Application/         # Logique métier
│   ├── IHVerre.Domain/              # Entités
│   ├── IHVerre.Infrastructure/      # Base de données
│   └── IHVerre.Tests/               # Tests
│
├── frontend/
│   └── React/                       # Application React
│
├── database/
│   └── Scripts SQL
│
├── docker-compose.yml               # Orchestration
├── CONFIG.md                        # Configuration
├── README.md                        # Documentation complète
└── PROJECT_SUMMARY.md               # Résumé du projet
```

---

## 🎯 Données Seed Initiales

### Types de Verre Pré-configurés
```
1. Verre Blanc Standard (GLASS-WHITE-STD)
   - Densité: 2.50
   - Point de fusion: 1700°C
   - Processus: 800°C, 480 min

2. Verre Teinté Bleu (GLASS-BLUE-TIN)
   - Densité: 2.55
   - Point de fusion: 1750°C
   - Processus: 850°C, 540 min

3. Verre Renforcé (GLASS-REINFORCED)
   - Densité: 2.48
   - Point de fusion: 1680°C
   - Processus: 900°C, 600 min
```

---

## 🔍 Tester l'API

### Avec cURL

```bash
# Créer un lot
curl -X POST http://localhost:5000/api/glassTransformation/batches \
  -H "Content-Type: application/json" \
  -d '{
    "processId": 1,
    "rawMaterialQuantity": 1000,
    "plannedStartDate": "2024-01-15T10:00:00Z",
    "operatorId": "op-001"
  }'

# Enregistrer une température
curl -X POST http://localhost:5000/api/glassTransformation/batches/1/temperature \
  -H "Content-Type: application/json" \
  -d '{"temperature": 750}'

# Effectuer un contrôle de qualité
curl -X POST http://localhost:5000/api/glassTransformation/batches/1/quality-check \
  -H "Content-Type: application/json" \
  -d '{
    "thickness": 6.0,
    "transmittancePercentage": 92.5,
    "surfaceQualityCheck": true,
    "notes": "Test QC"
  }'
```

### Avec Postman
Importez la collection depuis: (À générer depuis Swagger)

---

## 📦 Commandes Essentielles

```bash
# Docker
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Logs
docker-compose ps                 # Statut

# Backend
dotnet build                       # Build
dotnet test                        # Tests
dotnet run                         # Exécuter
dotnet ef database update          # Migrations

# Frontend
npm install                        # Installer
npm start                          # Développement
npm run build                      # Production
npm test                           # Tests
```

---

## ⚠️ Troubleshooting Rapide

### "Port déjà utilisé"
```bash
# Trouver le processus
lsof -i :5000  # API
lsof -i :3000  # Frontend

# Tuer le processus
kill -9 <PID>
```

### "Erreur de connexion BD"
```bash
# Vérifier que SQL Server est running
docker-compose ps sqlserver

# Vérifier la connexion
docker-compose exec api sqlcmd -S sqlserver -U sa -P IHVerre@2024! -Q "SELECT 1"
```

### "Migration échouée"
```bash
# Vérifier les migrations
dotnet ef migrations list

# Revenir en arrière
dotnet ef database update <migration_precedente>
```

---

## 🔑 Identifiants par Défaut

| Service | URL | User | Password |
|---------|-----|------|----------|
| Frontend | http://localhost:3000 | - | - |
| API | http://localhost:5000 | - | - |
| SQL Server | localhost:1433 | sa | IHVerre@2024! |
| DB | IHVerreDB | - | - |

---

## 📚 Documentation

Pour plus d'informations, consultez:

| Document | Contenu |
|----------|---------|
| [README.md](README.md) | Vue d'ensemble complète |
| [CONFIG.md](CONFIG.md) | Configuration détaillée |
| [INSTALLATION_DEPLOYMENT.md](INSTALLATION_DEPLOYMENT.md) | Installation & déploiement |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Résumé complet du projet |
| [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) | Guide de migration BD |

---

## ✨ Fonctionnalités Clés

### Backend
- ✅ API REST complète
- ✅ Gestion des lots de transformation
- ✅ Suivi de la qualité
- ✅ Historique temps réel
- ✅ Tests unitaires

### Frontend
- ✅ Tableau de bord interactif
- ✅ Graphiques en temps réel
- ✅ Formulaires validés
- ✅ Design responsive
- ✅ TypeScript type-safe

### Infrastructure
- ✅ Docker Compose
- ✅ CI/CD GitHub Actions
- ✅ Migrations automatiques
- ✅ Configuration multi-environnements
- ✅ Documentation complète

---

## 🚀 Déploiement Production

### 1. Préparer les Secrets

```bash
cat > .env.production << EOF
SA_PASSWORD=YourSecurePassword123!
JWT_SECRET=YourJWTSecretKeyAtLeast32CharactersLong
DATABASE_CONNECTION=Server=sqlserver;Database=IHVerreDB_Prod;User Id=sa;Password=YourSecurePassword123!;
EOF
```

### 2. Déployer

```bash
# Avec docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Appliquer les migrations
docker-compose -f docker-compose.prod.yml exec api dotnet ef database update
```

### 3. Configurer HTTPS

Voir: [INSTALLATION_DEPLOYMENT.md](INSTALLATION_DEPLOYMENT.md#étape-4-configuration-https)

---

## 🎓 Exemple Complet

### Créer et Suivre un Lot

```bash
# 1. Créer le lot
BATCH_ID=$(curl -X POST http://localhost:5000/api/glassTransformation/batches \
  -H "Content-Type: application/json" \
  -d '{
    "processId": 1,
    "rawMaterialQuantity": 1000,
    "plannedStartDate": "2024-01-15T10:00:00Z",
    "operatorId": "op-001"
  }' | jq '.id')

# 2. Démarrer le lot
curl -X POST http://localhost:5000/api/glassTransformation/batches/$BATCH_ID/start

# 3. Enregistrer les températures (toutes les minutes)
for i in {1..480}; do
  TEMP=$((200 + (i * 600 / 480)))
  curl -X POST http://localhost:5000/api/glassTransformation/batches/$BATCH_ID/temperature \
    -H "Content-Type: application/json" \
    -d "{\"temperature\": $TEMP}"
  sleep 1
done

# 4. Effectuer le contrôle de qualité
curl -X POST http://localhost:5000/api/glassTransformation/batches/$BATCH_ID/quality-check \
  -H "Content-Type: application/json" \
  -d '{
    "thickness": 6.0,
    "transmittancePercentage": 92.5,
    "surfaceQualityCheck": true,
    "colorConsistency": true,
    "notes": "Excellent batch"
  }'
```

---

## 📊 Dashboard

Accédez au dashboard sur: **http://localhost:3000**

Vous verrez:
- 📈 Graphique de température en temps réel
- 📋 Liste des lots actifs
- ✅ Statut des contrôles qualité
- 📊 Statistiques et KPIs

---

## 🆘 Besoin d'Aide ?

1. **Consultez la documentation:** `/docs`
2. **Vérifiez les logs:** `docker-compose logs -f`
3. **Ouvrez une issue:** GitHub Issues
4. **Contactez l'équipe:** amelnadad2030@gmail.com

---

## 🎉 Prêt à Commencer ?

```bash
# Cloner et lancer en 3 commandes
git clone https://github.com/amelnadad2030-alt/IHVERRE-.git
cd IHVERRE-
docker-compose up -d

# Ouvrir dans le navigateur
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

**Enjoy! 🎊**

---

**Projet:** IHVERRE-ERP  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Date:** 2024-01-15

---

## 📋 Quick Checklist

- [ ] Clone le repo
- [ ] Exécute `docker-compose up -d`
- [ ] Accède à http://localhost:3000
- [ ] Crée un lot de test
- [ ] Enregistre une température
- [ ] Effectue un contrôle qualité
- [ ] Consulte les logs: `docker-compose logs -f`
- [ ] Explore la documentation

**Tout fonctionne? Bravo! 🚀**
