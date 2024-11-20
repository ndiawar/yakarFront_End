# YakarFront

# 🌱 **Projet Full Stack IoT - YAKAR** 🌱

Ce projet a pour objectif de développer une plateforme de contrôle de la température et de l'humidité d'un magasin de stockage pour la structure de transformation des produits locaux **YAKAR**. Il permet de suivre et de gérer la température et l'humidité via une interface web et un écran LCD, tout en déclenchant des alertes en cas de dépassement de seuils critiques. Le projet repose sur un système IoT qui collecte des données environnementales, les stocke, et les affiche en temps réel sur un tableau de bord.

---

## 📋 **Description du projet**

**YAKAR** a besoin de surveiller et de contrôler la température et l'humidité dans son espace de stockage des produits locaux. Le projet implique la mise en place d'un système de capteurs (température et humidité) qui collecte les données à intervalles réguliers (10h, 14h, 17h). Ces données sont affichées en temps réel via une interface web, un écran LCD, et stockées dans une base de données.

### Fonctionnalités :

- **Utilisateur simple** :
  - Visualisation de la température et de l'humidité en temps réel.
  - Historique des températures et humidité pour chaque heure de collecte.
  - Température et humidité moyenne de la journée.

- **Utilisateur admin** :
  - Contrôle à distance du système de ventilation (allumer/éteindre via l'interface ou une télécommande).
  - Gestion des utilisateurs (création, modification, suppression de comptes).
  - Historique des températures et humidité de la semaine.

### Comportement du système :
- **Température > 27°C** : Déclenchement du buzzer, ventilation allumée, signal rouge.
- **Température ≤ 27°C** : Signal vert allumé, ventilation éteinte.
- **Collecte automatique des données** à 10h, 14h et 17h.

---

## 🛠 **Technologies utilisées**

- **Frontend** : Angular 18.2.12
- **Backend** : Node.js, Express, WebSocket
- **Base de données** : MongoDB
- **IoT** : Microcontrôleur (Arduino ou ESP32), capteurs de température et d'humidité
- **Gestion de projet** : Méthode agile, Trello
- **Outils de collaboration** : Git, GitHub, Visual Studio Code

---

## 🚀 **Installation**

### Prérequis :

- Node.js (version 18 ou supérieure)
- Angular CLI (version 18.2.12)
- MongoDB

### Cloner le projet :

```bash
git clone https://github.com/ton-utilisateur/Yakar-IoT.git
cd Yakar-IoT
Installer les dépendances :
bash
Copier le code
npm install
Lancer le serveur de développement :
bash
Copier le code
ng serve
Naviguer vers http://localhost:4200/ pour voir l'application en action.

📝 Utilisation
Pour l'utilisateur simple :

Accédez à l'interface principale pour voir la température et l'humidité en temps réel.
Consultez l'historique des mesures de température et d'humidité collectées.
Pour l'administrateur :

Accédez au tableau de bord pour gérer les utilisateurs, contrôler le système de ventilation et visualiser les historiques des mesures.
🔧 Fonctionnalités Backend
API pour récupérer les données de température et d'humidité :

Endpoint : /api/temperature
Méthode : GET
Retourne la température actuelle, l'humidité, et les statistiques (moyenne, historique).
Gestion des utilisateurs (admin seulement) :

Créer, modifier, et supprimer des utilisateurs via l'interface admin.
Contrôler les rôles des utilisateurs.
Contrôle de la ventilation :

Allumer ou éteindre le ventilateur à partir de l'interface ou d'une télécommande (via WebSocket).
📐 Architecture du projet
Frontend : Angular gère l'interface utilisateur.
Backend : Node.js avec Express pour gérer les API.
Base de données : MongoDB pour stocker les données de température et d'humidité collectées.
IoT : Un microcontrôleur pour gérer les capteurs de température et d'humidité, et envoyer les données au serveur via WebSocket.
💡 Instructions supplémentaires
Générer un nouveau composant :
bash
Copier le code
ng generate component component-name
Lancer les tests unitaires :
bash
Copier le code
ng test
Lancer les tests end-to-end :
bash
Copier le code
ng e2e
Compiler le projet pour la production :
bash
Copier le code
ng build
Les fichiers compilés seront stockés dans le dossier dist/.

📈 Gestion du projet
Le projet suit une méthode agile avec des itérations courtes et des mises à jour régulières. Le tableau Trello est utilisé pour la gestion des tâches et la coordination de l'équipe. Vous pouvez consulter le tableau Trello ici.

📑 Livrables attendus
Mindmap de l’application
Maquette de l’application
Tableau Trello avec les tâches
Circuit électronique correctement câblé
Code source sur GitHub
Documentation technique
Présentation Powerpoint
🔗 Liens utiles
GitHub - Yakar IoT
Documentation
Trello - Tableau de gestion
👥 Contributeurs
Mouhamadou Moustapha Fa - Développeur
Ndiawar Diop - Développeur
Khalifa Ababacar Gaye - Développeur
Fatou Diéye - Développeur
