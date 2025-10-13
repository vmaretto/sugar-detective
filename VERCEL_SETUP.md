# 🚀 GUIDA SETUP VERCEL

## Perché Vercel?

Vercel è la piattaforma perfetta per deploy React:
- ✅ **Deploy automatico** da Git in secondi
- ✅ **Hosting gratuito** illimitato
- ✅ **Database Postgres gratuito** (fino a 256MB)
- ✅ **SSL automatico** e CDN globale
- ✅ **Zero configurazione** necessaria
- ✅ **Preview deployments** per ogni commit

---

## 🚀 Setup Passo-Passo (5 minuti!)

### 1. Crea Account Vercel

1. Vai su https://vercel.com
2. Click su "Sign Up"
3. Scegli "Continue with GitHub" (consigliato)
4. Autorizza Vercel ad accedere a GitHub

### 2. Carica il Progetto su GitHub

**Opzione A - Da zero:**
```bash
cd sugar-detective
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/sugar-detective.git
git push -u origin main
```

**Opzione B - Usa GitHub Desktop:**
1. Apri GitHub Desktop
2. File → Add Local Repository
3. Seleziona cartella `sugar-detective`
4. Publish repository

### 3. Deploy su Vercel

1. Su https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import il repository `sugar-detective`
4. Vercel auto-detecta che è un Create React App
5. Click "Deploy"

**🎉 In 30 secondi la tua app è online!**

URL tipo: `https://sugar-detective.vercel.app`

---

## 🗄️ Setup Database Postgres

### 1. Crea Database

1. Nel progetto Vercel, vai su tab "Storage"
2. Click "Create Database"
3. Seleziona "Postgres"
4. Nome: `sugar-detective-db`
5. Region: Scegli la più vicina (es. Frankfurt per EU)
6. Click "Create"

### 2. Inizializza Tabelle

1. Nel database, vai su tab "Query"
2. Copia e incolla il contenuto di `schema.sql`
3. Click "Execute"

Vedrai la conferma:
```
✓ Table foods created
✓ Table participants created
✓ Default foods inserted
✓ Indexes created
```

### 3. Le Variabili d'Ambiente Sono Automatiche!

Vercel collega automaticamente il database al progetto.
Non serve configurare nulla! 🎉

---

## ✅ Verifica che Funziona

### Test API Foods

Visita: `https://your-app.vercel.app/api/foods`

Dovresti vedere JSON con i 6 alimenti default:
```json
[
  {
    "id": 1,
    "name_it": "Mela",
    "name_en": "Apple",
    "emoji": "🍎",
    "is_reference": true
  },
  ...
]
```

### Test Esperienza Completa

1. Vai su `https://your-app.vercel.app`
2. Completa un'esperienza
3. Vai su Dashboard: `https://your-app.vercel.app/dashboard`
4. Dovresti vedere i dati!

### Verifica Database

1. Va nel database Vercel → tab "Data"
2. Seleziona tabella `participants`
3. Dovresti vedere il record appena creato!

---

## 🎨 Personalizzazione URL

### Custom Domain Gratuito

1. Nel progetto Vercel → Settings → Domains
2. Add Domain
3. Inserisci il tuo dominio (es. `sugar-detective.it`)
4. Segui le istruzioni per configurare DNS
5. SSL automatico si attiva in pochi minuti

### Subdomain Gratuito Vercel

Di default hai: `sugar-detective.vercel.app`

Puoi anche usare:
- `sugar-detective-makerfaire.vercel.app`
- `zucchero-detective.vercel.app`
- etc.

Basta cambiare il nome progetto in Settings.

---

## 📊 Export Dati

### Via Admin Panel

1. Vai su `/admin`
2. Click "Esporta dati CSV"
3. Scarica file

### Via Database Vercel

1. Database → Data → participants
2. Click "Export" → CSV
3. Tutti i dati in formato raw

### Via SQL Query

Nel Query tab:
```sql
SELECT 
  timestamp,
  language,
  data->>'profile' as profile,
  data->>'part2' as part2,
  data->>'measurements' as measurements
FROM participants
ORDER BY timestamp DESC;
```

---

## 🔄 Updates e Deployments

### Deploy Automatico

Ogni volta che fai push su GitHub:
```bash
git add .
git commit -m "Updated feature"
git push
```

Vercel fa automaticamente:
1. Build del progetto
2. Deploy in produzione
3. Notifica via email quando pronto

**Tempo: ~1 minuto!**

### Preview Deployments

Ogni branch o Pull Request ha il suo URL di preview:
- `https://sugar-detective-git-feature-xyz.vercel.app`

Perfetto per testare prima di andare in produzione!

### Rollback Istantaneo

Se qualcosa va storto:
1. Deployments → Trova deployment precedente
2. Click "..." → "Promote to Production"
3. Rollback istantaneo! (< 10 secondi)

---

## 📈 Monitoring

### Analytics Gratuiti

Nel progetto Vercel → Analytics:
- Visitatori unici
- Page views
- Tempi di caricamento
- Traffico per pagina
- Dispositivi/Browser

### Logs in Real-time

Deployments → Clicca sul deployment → Functions:
- Vedi logs API in tempo reale
- Errori evidenziati
- Request/Response details

---

## 🔐 Sicurezza

### HTTPS Automatico

- SSL gratis e automatico
- Certificate auto-renewing
- HSTS e altre best practices

### Environment Secrets

Per aggiungere segreti (es. API keys):
1. Settings → Environment Variables
2. Add new
3. Nome: `API_SECRET`
4. Valore: `your-secret`
5. Environments: Production, Preview, Development

Accessibili in API routes con:
```javascript
process.env.API_SECRET
```

---

## 🌍 Performance

### CDN Globale

La tua app è servita da 80+ edge locations worldwide:
- USA, Europa, Asia, Australia
- Latenza < 50ms ovunque
- Automatic image optimization

### Caching Intelligente

Vercel cachea automaticamente:
- File statici (24h)
- API responses (opzionale)
- Immagini (immutable)

---

## 💰 Limiti Gratuiti (Hobby Plan)

### Più che Sufficienti per Maker Faire!

- **Bandwidth**: 100 GB/mese
- **Build time**: 6000 minuti/mese
- **Deployments**: Illimitati
- **Domains**: Illimitati
- **Serverless Functions**: 100 GB-hours
- **Database**: 256 MB storage, 60h compute

### Per il Maker Faire

Assumendo 200 partecipanti:
- Bandwidth: ~500 MB (0.5% del limite)
- Database: ~5 MB (2% del limite)
- Functions: ~2h compute (3% del limite)

**Sei ampiamente nei limiti! ✅**

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Localmente, testa il build:
npm run build

# Se funziona local ma non su Vercel:
# - Verifica versione Node (18.x consigliata)
# - Check environment variables
# - Guarda build logs su Vercel
```

### API 500 Errors

1. Vercel → Functions → Logs
2. Trova l'errore
3. Spesso è:
   - Database non connesso
   - Query SQL sbagliata
   - Missing environment variable

### Database Connection Issues

1. Verifica che database sia "Running" (non Paused)
2. Storage → Database → Settings → Check connection string
3. Re-link database:
   - Storage → Click database → Connect Project

---

## 🎯 Checklist Pre-Evento

- [ ] ✅ App deployata su Vercel
- [ ] ✅ Database Postgres creato e inizializzato
- [ ] ✅ Default foods in database (6 alimenti)
- [ ] ✅ Test esperienza completa funziona
- [ ] ✅ Dati salvati correttamente in database
- [ ] ✅ Dashboard mostra dati real-time
- [ ] ✅ Admin panel accessibile
- [ ] ✅ Export CSV testato
- [ ] ✅ URL pubblico funzionante
- [ ] ✅ QR code generato con URL
- [ ] ✅ SSL attivo (https://)
- [ ] ✅ Test da smartphone reale

---

## 📞 Quick Commands

### Deploy Manuale
```bash
npm install -g vercel
vercel
```

### Pull Environment Variables Localmente
```bash
vercel env pull .env.local
```

### Logs in Tempo Reale
```bash
vercel logs
```

### Lista Deployments
```bash
vercel ls
```

---

## 🎓 Risorse

- **Documentazione Vercel**: https://vercel.com/docs
- **Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Community**: https://github.com/vercel/vercel/discussions
- **Examples**: https://vercel.com/templates

---

## 🆚 Vercel vs Firebase

| Feature | Vercel | Firebase |
|---------|--------|----------|
| Setup | 1 click | Config manuale |
| Deploy | Automatico (Git) | Manuale (CLI) |
| Database | Postgres (SQL) | Firestore (NoSQL) |
| Pricing | Gratis 100GB | Gratis 50k reads |
| Learning curve | Facile | Media |
| Best for | React/Next.js | Mobile apps |

**Per questo progetto: Vercel è perfetto! 🎉**

---

## ✨ Pronto!

Setup completato in 5 minuti:
1. ✅ Account Vercel creato
2. ✅ Progetto su GitHub
3. ✅ Deploy automatico attivo
4. ✅ Database Postgres configurato
5. ✅ App online e funzionante!

**URL della tua app**: `https://sugar-detective.vercel.app`

**Buon Maker Faire! 🚀🍎🔬**
