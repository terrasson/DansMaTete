# 🤖 Configuration de l'IA Gemini

## 📋 Prérequis
1. ✅ Serveur démarré avec `vercel dev --listen 3001`
2. ❌ Clé API Gemini (à obtenir)

## 🔑 Obtenir une clé API Gemini (GRATUIT)

### Étape 1 : Aller sur le site Google AI
1. Ouvrez votre navigateur
2. Allez sur : https://ai.google.dev/
3. Cliquez sur **"Get API key"**

### Étape 2 : Créer un projet
1. Connectez-vous avec votre compte Google
2. Créez un nouveau projet ou sélectionnez un existant
3. Acceptez les conditions d'utilisation

### Étape 3 : Générer la clé
1. Cliquez sur **"Create API Key"**
2. Copiez votre clé API (format : `AIza...`)

## ⚙️ Configuration dans le projet

### Créer le fichier .env
1. Dans le dossier racine du projet, créez un fichier `.env`
2. Ajoutez votre clé :
```
GEMINI_API_KEY=votre_cle_api_ici
```

### ⚠️ IMPORTANT
- Ne partagez JAMAIS votre clé API
- Le fichier `.env` ne sera pas envoyé sur GitHub (protégé)

## 🧪 Tester l'intégration

1. Redémarrez le serveur : `Ctrl+C` puis `vercel dev --listen 3001`
2. Allez sur http://localhost:3001
3. Choisissez **"JE DEVINE"**
4. Cliquez sur **"🤖 Mode Gemini"** (doit devenir vert ✅)
5. Posez une question - vous devriez voir l'icône 🤖 à côté de la réponse

## 🐛 Dépannage

### Erreur "Clé API non configurée"
- Vérifiez que le fichier `.env` existe
- Vérifiez que la clé commence par `AIza`
- Redémarrez le serveur

### Erreur "Méthode non autorisée"
- Vérifiez que le serveur est bien démarré
- Actualisez la page

### Fallback automatique
Si Gemini ne fonctionne pas, l'application utilisera automatiquement l'IA locale.

## 🎮 Utilisation

### Mode Local (par défaut)
- IA programmée avec des règles fixes
- Réponses instantanées
- Fonctionne sans internet

### Mode Gemini
- IA réelle de Google
- Réponses plus naturelles et variées
- Nécessite une connexion internet
- Icône 🤖 dans les réponses