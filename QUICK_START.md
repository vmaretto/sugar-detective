# 🚀 GUIDA RAPIDA - Sugar Detective

## Setup in 5 Minuti

### 1️⃣ Installa dipendenze

```bash
cd sugar-detective
npm install
```

### 2️⃣ Configura Firebase (IMPORTANTE!)

**Opzione A - Firebase completo (raccomandato):**

1. Vai su https://console.firebase.google.com/
2. Clicca "Aggiungi progetto"
3. Segui la procedura guidata
4. Vai su "Firestore Database" → "Crea database" → Modalità test
5. Vai su "Project Settings" (⚙️) → "Your apps" → Web icon (</>)
6. Registra l'app e copia le credenziali
7. Incolla le credenziali in `src/config/firebase.js`

**Opzione B - Demo locale (per test senza Firebase):**

L'app funziona anche senza Firebase configurato, usando dati mock.
Alcune funzionalità saranno limitate (no salvataggio dati, no real-time).

### 3️⃣ Avvia l'applicazione

```bash
npm start
```

Apri http://localhost:3000

---

## 🎯 Come Usare al Maker Faire

### Setup Stand:

1. **Computer/Tablet principale**: Avvia `/dashboard` per la proiezione
2. **Tablet/iPad per visitatori**: Avvia `/` (homepage)
3. **Genera QR Code**: Usa https://qr-code-generator.com con l'URL della webapp

### Flow Esperienza (5 minuti):

```
Visitatore → QR Code → Webapp
    ↓
Selezione Lingua (IT/EN)
    ↓
Profilo veloce (30 sec)
    ↓
Quiz previsioni ⏱️ (90 sec)
    ↓
Misurazione spettrometro (60 sec)
    ↓
Post-test (45 sec)
    ↓
Risultati + Condivisione! 🎉
```

### Dashboard Live:

Proietta su schermo grande per mostrare:
- 👥 Totale partecipanti
- ⚡ Top 5 velocisti
- 🎯 Top 5 più accurati
- 📊 Grafici percezione vs realtà

---

## 🔧 Comandi Utili

```bash
# Avvia sviluppo
npm start

# Build per produzione
npm run build

# Test
npm test
```

---

## 📱 URL Importanti

- **Homepage**: http://localhost:3000/
- **Dashboard**: http://localhost:3000/dashboard
- **Admin**: http://localhost:3000/admin

---

## 🎨 Gestione Alimenti

Vai su `/admin` per:
- ✅ Aggiungere nuovi frutti/verdure
- ✅ Impostare l'alimento di riferimento (es. mela)
- ✅ Eliminare alimenti
- ✅ Esportare dati CSV

### Alimenti di Default:

Se Firebase non è configurato, l'app usa questi alimenti di default:
- 🍎 Mela (riferimento)
- 🍌 Banana
- 🍉 Anguria
- 🍅 Pomodoro
- 🥕 Carota
- 🫑 Peperone

---

## 💾 Export Dati Ricerca

Vai su `/admin` → "Esporta dati CSV"

Il file CSV include:
- Timestamp
- Lingua
- Età, sesso, professione
- Consumo abituale frutta/verdura
- Tempo di risposta quiz
- Accuratezza previsioni
- Consapevolezza pre/post esperienza
- Tutte le risposte al questionario

---

## 🐛 Problemi Comuni

### Firebase non connesso:
- ✅ L'app funziona lo stesso con dati mock
- ❌ Non salva dati permanenti
- ❌ Dashboard non ha dati real-time

### "Module not found":
```bash
rm -rf node_modules
npm install
```

### Porta 3000 già in uso:
```bash
PORT=3001 npm start
```

---

## 📸 Screenshots

### Mobile Experience:
- Welcome + Language selection
- Profile form
- Quiz con timer
- Misurazione spettrometro
- Risultati con badges

### Dashboard:
- Stats live
- Leaderboards
- Grafici percezione vs realtà

---

## 🎉 Tips per il Maker Faire

1. **Attrattiva visiva**: Proietta la dashboard su uno schermo grande
2. **QR Code ovunque**: Stampa il QR code in formato A4
3. **Cartelloni**: Mostra esempi di risultati sorprendenti
4. **Gadget**: Prepara badge fisici per chi completa l'esperienza
5. **Social**: Incoraggia la condivisione con #SugarDetective #MakerFaire

---

## 📞 Help!

Problemi durante l'evento?
- Check console browser (F12)
- Verifica connessione internet
- Restart dell'app: Ctrl+C → npm start

---

**🎯 Ready to go!**

L'app è pronta per essere usata al Maker Faire.
Buon divertimento! 🚀
