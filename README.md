# Sugar Detective - Maker Faire Experience

Una webapp interattiva per educare i visitatori sul contenuto zuccherino di frutta e verdura attraverso l'uso di uno spettrometro.

## 🚀 Features

- ✅ **Multilingua** (Italiano/Inglese)
- ✅ **Quiz interattivo** con timer automatico
- ✅ **Input manuale** misurazioni spettrometro
- ✅ **Gamification leggera** con badges e classifiche
- ✅ **Dashboard live** con statistiche real-time
- ✅ **Condivisione social** dei risultati
- ✅ **Admin panel** per gestione alimenti ed export dati
- ✅ **PWA** - installabile come app
- ✅ **Responsive** - ottimizzata per smartphone e tablet

## 📋 Prerequisiti

- Node.js (v14 o superiore)
- npm o yarn
- Account Firebase (per database e hosting)

## 🔧 Setup

### 1. Installa le dipendenze

```bash
cd sugar-detective
npm install
```

### 2. Configura Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuovo progetto
3. Abilita Firestore Database
4. Vai in Project Settings > Your apps > Add app > Web
5. Copia le credenziali Firebase

6. Modifica `src/config/firebase.js` con le tue credenziali:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. Inizializza il database

1. Vai su Firebase Console > Firestore Database
2. Crea due collections:
   - `foods` (per gli alimenti)
   - `participants` (per i dati dei partecipanti)

3. Aggiungi alcuni alimenti di default nella collection `foods`:

```javascript
// Esempio documento nella collection 'foods'
{
  name_it: "Mela",
  name_en: "Apple",
  emoji: "🍎",
  isReference: true
}
```

### 4. Avvia l'applicazione

```bash
npm start
```

L'app sarà disponibile su `http://localhost:3000`

## 📱 Utilizzo

### Per i Visitatori:

1. Scansiona il QR code o visita l'URL
2. Seleziona la lingua (IT/EN)
3. Compila il profilo (30 secondi)
4. Fai le previsioni sul contenuto zuccherino (90 secondi)
5. Misura con lo spettrometro e inserisci i dati
6. Rispondi alle domande post-misurazione
7. Visualizza i risultati e condividi!

### Dashboard Live (da proiettare):

Visita `/dashboard` per visualizzare:
- Numero totale partecipanti
- Top 5 velocisti
- Top 5 più precisi
- Grafici percezione vs realtà
- Insights in tempo reale

### Admin Panel:

Visita `/admin` per:
- Gestire gli alimenti testati
- Visualizzare statistiche
- Esportare dati in CSV
- Reset dati

## 🏗️ Struttura del Progetto

```
sugar-detective/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── config/
│   │   ├── firebase.js      # Configurazione Firebase
│   │   └── i18n.js          # Traduzioni IT/EN
│   ├── screens/
│   │   ├── WelcomeScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── PreTestScreen.js
│   │   ├── AwarenessScreen.js
│   │   ├── MeasurementScreen.js
│   │   ├── PostTestScreen.js
│   │   ├── ResultsScreen.js
│   │   ├── DashboardScreen.js
│   │   └── AdminScreen.js
│   ├── App.js
│   ├── App.css
│   └── index.js
└── package.json
```

## 🎨 Personalizzazione

### Cambiare i colori:

Modifica le variabili CSS in `src/App.css`:

```css
:root {
  --primary-color: #4CAF50;
  --secondary-color: #FF6B6B;
  --accent-color: #FFD93D;
  /* ... */
}
```

### Aggiungere nuovi alimenti:

Usa l'Admin Panel (`/admin`) per aggiungere, modificare o eliminare alimenti.

### Modificare le traduzioni:

Modifica `src/config/i18n.js` per aggiungere o modificare traduzioni.

## 📊 Export Dati

I dati possono essere esportati in formato CSV dall'Admin Panel. Il file include:

- Timestamp
- Lingua
- Dati demografici (età, sesso, professione)
- Tempo di risposta
- Punteggio accuratezza
- Risposte pre/post test
- Misurazioni spettrometro

## 🚀 Deploy

### Opzione 1: Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

### Opzione 2: Netlify/Vercel

1. Connetti il repository GitHub
2. Build command: `npm run build`
3. Publish directory: `build`

## 🔒 Sicurezza e Privacy

- Tutti i dati sono **anonimi**
- Nessun dato personale identificativo viene raccolto
- I dati sono utilizzati solo per ricerca scientifica
- Conforme alle normative GDPR

## 🐛 Troubleshooting

### Firebase non funziona:

- Verifica le credenziali in `firebase.js`
- Controlla le regole di sicurezza Firestore
- Abilita la modalità test per Firestore

### L'app non si carica:

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Errori di build:

```bash
npm run build
```

Controlla la console per eventuali errori.

## 📞 Supporto

Per domande o problemi:
- Apri un issue su GitHub
- Contatta il team al Maker Faire

## 📄 Licenza

Questo progetto è stato creato per il Maker Faire Rome.

## 🙏 Credits

Sviluppato con ❤️ per il Maker Faire Rome
- React
- Firebase
- Recharts
- Lucide Icons
