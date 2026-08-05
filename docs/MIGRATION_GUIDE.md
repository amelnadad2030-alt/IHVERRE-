# Guide de Migration - Module de Transformation du Verre

## Vue d'ensemble

Ce guide explique comment appliquer la migration de base de données pour le module de transformation du verre dans IHVERRE-ERP.

## Prérequis

- .NET 5.0 ou supérieur
- SQL Server 2016 ou supérieur
- Entity Framework Core CLI (optionnel mais recommandé)

```bash
dotnet tool install --global dotnet-ef
```

## Méthode 1 : Via Entity Framework Core (Recommandée)

### Étape 1: Depuis le dossier du projet Infrastructure

```bash
cd backend/IHVerre.Infrastructure
```

### Étape 2: Appliquer la migration

```bash
dotnet ef database update --startup-project ../IHVerre.Api
```

Ou, si vous utilisez Visual Studio Package Manager Console:

```powershell
Update-Database
```

### Étape 3: Vérifier le succès

```bash
dotnet ef migrations list
```

## Méthode 2 : Via Script SQL Direct

### Étape 1: Connecter à SQL Server

```bash
sqlcmd -S YourServerName -U sa -P YourPassword
```

### Étape 2: Exécuter le script de migration

```sql
USE YourDatabaseName
GO
:r database/AddGlassTransformationModule.sql
```

## Vérification Post-Migration

### Vérifier les tables créées

```sql
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' 
AND TABLE_NAME LIKE '%GlassTransformation%' 
   OR TABLE_NAME LIKE '%Glass%'
ORDER BY TABLE_NAME;
```

### Résultat attendu

```
GlassTypes
QualityControls
TransformationBatches
TransformationLogs
TransformationProcesses
```

### Vérifier les données seed

```sql
-- Types de verre
SELECT * FROM [dbo].[GlassTypes];

-- Processus
SELECT * FROM [dbo].[TransformationProcesses];

-- Vérifier les relations
SELECT 
    p.Id,
    p.Name,
    gt.Name as GlassTypeName
FROM [dbo].[TransformationProcesses] p
JOIN [dbo].[GlassTypes] gt ON p.GlassTypeId = gt.Id;
```

## Création de la Migration (pour les développeurs)

### Si vous avez modifié les entités, créez une nouvelle migration:

```bash
cd backend/IHVerre.Infrastructure

dotnet ef migrations add YourMigrationName --project . --startup-project ../IHVerre.Api
```

### Exemple:

```bash
dotnet ef migrations add AddGlassTransformationModule --project . --startup-project ../IHVerre.Api
```

## Annuler une Migration

### Si vous devez revenir en arrière:

```bash
# Revenir à la migration précédente
dotnet ef database update PreviousMigrationName --startup-project ../IHVerre.Api

# Ou supprimer la dernière migration (attention!)
dotnet ef migrations remove
```

## Troubleshooting

### Erreur: "No database provider has been configured"

**Solution:** Assurez-vous que le DbContext est configuré dans Startup.cs:

```csharp
services.AddDbContext<IHVerreDbContext>(options =>
    options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
```

### Erreur: "The migration was not found"

**Solution:** Vérifiez que vous êtes dans le bon dossier et que la migration existe:

```bash
dotnet ef migrations list
```

### Erreur: Contraintes de clés étrangères

**Solution:** Vérifiez que les tables dépendantes n'ont pas de données incompatibles.

## Données de Test

Après la migration, des données de seed sont automatiquement insérées:

- 3 types de verre (Blanc, Bleu, Renforcé)
- 3 processus de transformation

Pour ajouter plus de données, utilisez le fichier:
```
database/GLASS_TRANSFORMATION_SEED_DATA.md
```

## Configuration de Production

### Avant le déploiement en production:

1. **Sauvegarder la base de données**
   ```bash
   BACKUP DATABASE YourDB TO DISK='C:\Backups\YourDB.bak'
   ```

2. **Tester la migration en staging**
   ```bash
   dotnet ef database update --environment Staging
   ```

3. **Appliquer la migration en production**
   ```bash
   dotnet ef database update --environment Production
   ```

## Architecture de la Migration

```
IHVerre.Infrastructure/
├── Data/
│   ├── Configuration/
│   │   └── GlassTransformationConfiguration.cs
│   ├── Migrations/
│   │   ├── 20240115000000_AddGlassTransformationModule.cs
│   │   └── 20240115000000_AddGlassTransformationModule.Designer.cs
│   └── IHVerreDbContext.GlassTransformation.cs
```

## Relations de Tables

```
GlassTypes (1) ──→ (*) TransformationProcesses
                           │
                           └──→ (*) TransformationBatches
                                      ├──→ (*) QualityControls
                                      └──→ (*) TransformationLogs
```

## Support

Pour toute question ou problème :
- Consultez la documentation Entity Framework: https://docs.microsoft.com/ef/
- Vérifiez les logs: `backend/IHVerre.Infrastructure/Migrations/`
- Contactez l'équipe de développement

---

**Version:** 1.0  
**Date:** 2024-01-15  
**Auteur:** Équipe IHVERRE Development
