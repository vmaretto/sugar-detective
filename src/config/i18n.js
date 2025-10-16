// src/config/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  it: {
    translation: {
      // Welcome Screen
      "welcome.title": "SUGAR DETECTIVE",
      "welcome.subtitle": "Scopri quanto zucchero si nasconde nella frutta e verdura!",
      "welcome.privacy": "Tutti i dati saranno raccolti in forma anonima e utilizzati esclusivamente per uno studio europeo sulle abitudini alimentari sostenibili, nel rispetto della normativa sulla privacy.",
      "welcome.start": "Inizia l'esperienza",
      
      // Profile Form
      "profile.title": "Parlaci di te",
      "profile.age": "Età",
      "profile.gender": "Sesso",
      "profile.gender.f": "Femmina",
      "profile.gender.m": "Maschio",
      "profile.gender.other": "Altro",
      "profile.sugarHabits": "Abitudini di consumo zucchero",
      "profile.profession": "Professione o formazione principale",
      "profile.profession.select": "Seleziona...",
      "profile.profession.student": "Studente",
      "profile.profession.employee": "Dipendente",
      "profile.profession.consultant": "Consulente",
      "profile.profession.entrepreneur": "Imprenditore",
      "profile.profession.teacher": "Insegnante",
      "profile.profession.retired": "Pensionato",
      "profile.profession.homemaker": "Casalinga/o",
      "profile.profession.healthcare": "Operatore sanitario",
      "profile.profession.researcher": "Ricercatore",
      "profile.profession.other": "Altro",
      "profile.consumption": "Consumi abitualmente frutta e verdura?",
      "profile.consumption.daily": "Sì, ogni giorno",
      "profile.consumption.weekly": "Qualche volta a settimana",
      "profile.consumption.rarely": "Raramente",
      "profile.next": "Avanti",
      
      // Pre-Test Questions
      "pretest.title": "Quanto ne sai?",
      "pretest.instructions": "Per ogni alimento, indica quanto pensi che sia dolce (cioè quanto zucchero naturale contiene) su una scala da 1 a 5",
      "pretest.scale1": "1 = pochissimo zucchero",
      "pretest.scale5": "5 = molto zucchero",
      "pretest.timer": "Tempo",
      "pretest.sweetness": "Quanto è dolce secondo te?",
      "pretest.comparison": "Rispetto alla mela contiene:",
      "pretest.more": "Più zucchero",
      "pretest.equal": "Uguale",
      "pretest.less": "Meno zucchero",
      "pretest.confirm": "Conferma previsioni",
      
      // Awareness Questions
      "awareness.title": "La tua consapevolezza",
      "awareness.surprised": "Ti sorprende sapere che alcune verdure contengono zuccheri naturali?",
      "awareness.influence": "Ritieni che conoscere il contenuto zuccherino possa influenzare le tue scelte alimentari?",
      "awareness.influence.very": "Sì molto",
      "awareness.influence.partly": "In parte",
      "awareness.influence.little": "Poco",
      "awareness.influence.not": "Per niente",
      "awareness.knowledge": "Quanto pensi di conoscere il contenuto zuccherino degli alimenti che consumi?",
      "awareness.knowledge.very": "Molto bene",
      "awareness.knowledge.enough": "Abbastanza",
      "awareness.knowledge.little": "Poco",
      "awareness.knowledge.nothing": "Per niente",
      "awareness.next": "Avanti",
      
      // Measurement Screen
      "measurement.title": "Ora misura!",
      "measurement.instructions": "Usa lo spettrometro per misurare ogni alimento e inserisci i valori rilevati:",
      "measurement.brix": "°Brix",
      "measurement.brixExplanation": "Il Brix è una misura che serve per capire quanto zucchero c'è in un frutto o in una verdura. Più il valore di Brix è alto, più il prodotto è dolce, gustoso e nutriente. In pratica, un frutto con un Brix alto contiene più zuccheri naturali, ma anche più vitamine, minerali e sostanze buone per la salute. Per questo i coltivatori usano il Brix per valutare la qualità e la maturazione dei loro prodotti — un po' come un \"indice di bontà e nutrimento\".",
      "measurement.placeholder.brix": "es. 12.5",
      "measurement.results": "Vedi risultati",
      
      // Post-Test Questions
      "posttest.title": "Dopo la misurazione",
      "posttest.different": "Il risultato è diverso da quello che ti aspettavi?",
      "posttest.awareness": "Ti senti più consapevole di quanto zucchero contengono i diversi alimenti?",
      "posttest.awareness.much": "Molto di più",
      "posttest.awareness.bit": "Un po' di più",
      "posttest.awareness.same": "Uguale a prima",
      "posttest.education": "Ti piacerebbe che strumenti come questo fossero usati per attività educative o nelle scuole?",
      "posttest.education.yes": "Sì",
      "posttest.education.no": "No",
      "posttest.education.dunno": "Non so",
      "posttest.submit": "Vedi i risultati",
      
      // Results Screen
      "results.title": "I tuoi risultati",
      "results.subtitle": "Grazie per aver partecipato!",
      "results.knowledgeScore": "Punteggio Conoscenza",
      "results.awarenessScore": "Punteggio Consapevolezza",
      "results.yourProfile": "Il tuo profilo",
      "results.yourEstimations": "Le tue stime",
      "results.downloading": "Download in corso...",
      "results.downloadError": "Errore durante il download dell'immagine",
      "results.startNew": "Nuova esperienza",
      "results.score": "Il tuo punteggio",
      "results.speed": "Velocità",
      "results.accuracy": "Precisione",
      "results.badge.speed": "Velocista",
      "results.badge.accuracy": "Precisione",
      "results.discoveries": "Le tue scoperte",
      "results.thought": "Pensavi",
      "results.reality": "Realtà",
      "results.sweeter": "più dolce!",
      "results.less.sweet": "meno dolce!",
      "results.surprise": "Sorpresa!",
      "results.share": "Condividi",
      "results.finish": "Fine",
      "results.download": "Scarica immagine",
      
      // Dashboard
      "dashboard.title": "SUGAR DETECTIVE - STATISTICHE LIVE",
      "dashboard.participants": "Partecipanti oggi",
      "dashboard.top.speed": "TOP 5 VELOCISTI",
      "dashboard.top.accuracy": "TOP 5 PRECISION",
      "dashboard.perception": "PERCEZIONE vs REALTÀ",
      "dashboard.thought": "Pensato",
      "dashboard.actual": "Reale",
      "dashboard.underestimated": "sottostimato",
      "dashboard.overestimated": "sovrastimato",
      "dashboard.insight": "dei visitatori sottostima lo zucchero nelle verdure",
      "dashboard.qr": "Scansiona per partecipare",
      
      // Admin Panel
      "admin.title": "Pannello Amministratore",
      "admin.foods": "Gestione Alimenti",
      "admin.add": "Aggiungi Alimento",
      "admin.food.name.it": "Nome (Italiano)",
      "admin.food.name.en": "Nome (Inglese)",
      "admin.food.emoji": "Emoji",
      "admin.food.reference": "Alimento di riferimento",
      "admin.save": "Salva",
      "admin.cancel": "Annulla",
      "admin.delete": "Elimina",
      "admin.export": "Esporta dati CSV",
      "admin.reset": "Reset dati",
      "admin.reset.confirm": "Sei sicuro? Questa azione cancellerà tutti i dati!",
      "admin.stats": "Statistiche",
      "admin.total.participants": "Totale partecipanti",
      "admin.avg.time": "Tempo medio",
      "admin.avg.accuracy": "Precisione media",
      
      // Common
      "common.yes": "Sì",
      "common.no": "No",
      "common.back": "Indietro",
      "common.next": "Avanti",
      "common.loading": "Caricamento...",
      "common.error": "Errore",
      "common.success": "Successo!"
    }
  },
  en: {
    translation: {
      // Welcome Screen
      "welcome.title": "SUGAR DETECTIVE",
      "welcome.subtitle": "Discover how much sugar is hidden in fruits and vegetables!",
      "welcome.privacy": "All data will be collected anonymously and used exclusively for a European study on sustainable eating habits, in compliance with privacy regulations.",
      "welcome.start": "Start the experience",
      
      // Profile Form
      "profile.title": "Tell us about you",
      "profile.age": "Age",
      "profile.gender": "Gender",
      "profile.gender.f": "Female",
      "profile.gender.m": "Male",
      "profile.gender.other": "Other",
      "profile.sugarHabits": "Sugar consumption habits",
      "profile.profession": "Main profession or education",
      "profile.profession.select": "Select...",
      "profile.profession.student": "Student",
      "profile.profession.employee": "Employee",
      "profile.profession.consultant": "Consultant",
      "profile.profession.entrepreneur": "Entrepreneur",
      "profile.profession.teacher": "Teacher",
      "profile.profession.retired": "Retired",
      "profile.profession.homemaker": "Homemaker",
      "profile.profession.healthcare": "Healthcare worker",
      "profile.profession.researcher": "Researcher",
      "profile.profession.other": "Other",
      "profile.consumption": "Do you regularly consume fruits and vegetables?",
      "profile.consumption.daily": "Yes, every day",
      "profile.consumption.weekly": "A few times a week",
      "profile.consumption.rarely": "Rarely",
      "profile.next": "Next",
      
      // Pre-Test Questions
      "pretest.title": "How much do you know?",
      "pretest.instructions": "For each food, indicate how sweet you think it is (i.e., how much natural sugar it contains) on a scale from 1 to 5",
      "pretest.scale1": "1 = very little sugar",
      "pretest.scale5": "5 = a lot of sugar",
      "pretest.timer": "Time",
      "pretest.sweetness": "How sweet do you think it is?",
      "pretest.comparison": "Compared to apple it contains:",
      "pretest.more": "More sugar",
      "pretest.equal": "Equal",
      "pretest.less": "Less sugar",
      "pretest.confirm": "Confirm predictions",
      
      // Awareness Questions
      "awareness.title": "Your awareness",
      "awareness.surprised": "Are you surprised to know that some vegetables contain natural sugars?",
      "awareness.influence": "Do you think knowing the sugar content could influence your food choices?",
      "awareness.influence.very": "Yes very much",
      "awareness.influence.partly": "Partly",
      "awareness.influence.little": "A little",
      "awareness.influence.not": "Not at all",
      "awareness.knowledge": "How much do you think you know about the sugar content of the foods you consume?",
      "awareness.knowledge.very": "Very well",
      "awareness.knowledge.enough": "Enough",
      "awareness.knowledge.little": "A little",
      "awareness.knowledge.nothing": "Not at all",
      "awareness.next": "Next",
      
      // Measurement Screen
      "measurement.title": "Now measure!",
      "measurement.instructions": "Use the spectrometer to measure each food and enter the detected values:",
      "measurement.brix": "°Brix",
      "measurement.brixExplanation": "Brix is a measure used to understand how much sugar is in a fruit or vegetable. The higher the Brix value, the sweeter, tastier, and more nutritious the product is. In practice, a fruit with high Brix contains more natural sugars, but also more vitamins, minerals, and beneficial substances for health. That's why growers use Brix to evaluate the quality and ripeness of their products — a bit like a \"goodness and nutrition index\".",
      "measurement.placeholder.brix": "e.g. 12.5",
      "measurement.results": "See results",
      
      // Post-Test Questions
      "posttest.title": "After the measurement",
      "posttest.different": "Is the result different from what you expected?",
      "posttest.awareness": "Do you feel more aware of how much sugar different foods contain?",
      "posttest.awareness.much": "Much more",
      "posttest.awareness.bit": "A bit more",
      "posttest.awareness.same": "Same as before",
      "posttest.education": "Would you like tools like this to be used for educational activities or in schools?",
      "posttest.education.yes": "Yes",
      "posttest.education.no": "No",
      "posttest.education.dunno": "I don't know",
      "posttest.submit": "See results",
      
      // Results Screen
      "results.title": "Your results",
      "results.subtitle": "Thank you for participating!",
      "results.knowledgeScore": "Knowledge Score",
      "results.awarenessScore": "Awareness Score",
      "results.yourProfile": "Your profile",
      "results.yourEstimations": "Your estimations",
      "results.downloading": "Downloading...",
      "results.downloadError": "Error downloading image",
      "results.startNew": "New experience",
      "results.score": "Your score",
      "results.speed": "Speed",
      "results.accuracy": "Accuracy",
      "results.badge.speed": "Speedster",
      "results.badge.accuracy": "Precision",
      "results.discoveries": "Your discoveries",
      "results.thought": "You thought",
      "results.reality": "Reality",
      "results.sweeter": "sweeter!",
      "results.less.sweet": "less sweet!",
      "results.surprise": "Surprise!",
      "results.share": "Share",
      "results.finish": "Finish",
      "results.download": "Download image",
      
      // Dashboard
      "dashboard.title": "SUGAR DETECTIVE - LIVE STATS",
      "dashboard.participants": "Participants today",
      "dashboard.top.speed": "TOP 5 FASTEST",
      "dashboard.top.accuracy": "TOP 5 PRECISION",
      "dashboard.perception": "PERCEPTION vs REALITY",
      "dashboard.thought": "Thought",
      "dashboard.actual": "Actual",
      "dashboard.underestimated": "underestimated",
      "dashboard.overestimated": "overestimated",
      "dashboard.insight": "of visitors underestimate sugar in vegetables",
      "dashboard.qr": "Scan to participate",
      
      // Admin Panel
      "admin.title": "Admin Panel",
      "admin.foods": "Food Management",
      "admin.add": "Add Food",
      "admin.food.name.it": "Name (Italian)",
      "admin.food.name.en": "Name (English)",
      "admin.food.emoji": "Emoji",
      "admin.food.reference": "Reference food",
      "admin.save": "Save",
      "admin.cancel": "Cancel",
      "admin.delete": "Delete",
      "admin.export": "Export CSV data",
      "admin.reset": "Reset data",
      "admin.reset.confirm": "Are you sure? This action will delete all data!",
      "admin.stats": "Statistics",
      "admin.total.participants": "Total participants",
      "admin.avg.time": "Average time",
      "admin.avg.accuracy": "Average accuracy",
      
      // Common
      "common.yes": "Yes",
      "common.no": "No",
      "common.back": "Back",
      "common.next": "Next",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success!"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it',
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
