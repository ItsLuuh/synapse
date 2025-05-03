// Gestione dello stato dei calendari per Synapse

// Memorizza gli stati dei calendari per ID
const calendarStates = {};

// Esponi le funzioni al renderer.js
window.calendarFunctions = window.calendarFunctions || {};

// Funzione per salvare lo stato di un calendario
window.calendarFunctions.saveCalendarState = function(calendarId) {
  console.log(`Saving calendar state for: ${calendarId}`);
  
  // Raccogli i dati del calendario
  const state = {
    currentView: window.currentView || 'month',
    currentDate: window.currentDate ? window.currentDate.toISOString() : new Date().toISOString(),
    events: window.events || [],
    lastUpdated: new Date().toISOString()
  };
  
  // Salva lo stato del calendario
  calendarStates[calendarId] = state;
  
  // Salva anche in localStorage per persistenza
  try {
    localStorage.setItem(`calendar_${calendarId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving calendar state to localStorage:', e);
  }
  
  return state;
};

// Funzione per caricare lo stato di un calendario
window.calendarFunctions.loadCalendarState = function(calendarId) {
  console.log(`Loading calendar state for: ${calendarId}`);
  
  // Prova a caricare lo stato dalla memoria
  let state = calendarStates[calendarId];
  
  // Se non esiste in memoria, prova a caricarlo da localStorage
  if (!state) {
    try {
      const savedState = localStorage.getItem(`calendar_${calendarId}`);
      if (savedState) {
        state = JSON.parse(savedState);
        calendarStates[calendarId] = state;
      }
    } catch (e) {
      console.error('Error loading calendar state from localStorage:', e);
    }
  }
  
  // Se non c'è stato salvato, ritorna
  if (!state) {
    console.log(`No saved state found for calendar: ${calendarId}`);
    return false;
  }
  
  // Applica lo stato al calendario corrente
  if (state.currentView) {
    window.currentView = state.currentView;
  }
  
  if (state.currentDate) {
    window.currentDate = new Date(state.currentDate);
  }
  
  if (state.events && Array.isArray(state.events)) {
    window.events = state.events;
  }
  
  // Renderizza il calendario con i dati caricati
  if (typeof window.renderCalendar === 'function') {
    window.renderCalendar(window.currentView, window.currentDate);
  } else {
    console.warn('renderCalendar function not found in global scope');
  }
  
  console.log(`Loaded calendar state with ${state.events.length} events`);
  return true;
};

// Funzione per ottenere lo stato corrente di un calendario
window.calendarFunctions.getCalendarState = function(calendarId) {
  // Se lo stato è già in memoria, ritornalo
  if (calendarStates[calendarId]) {
    return calendarStates[calendarId];
  }
  
  // Altrimenti, salvalo prima e poi ritornalo
  return window.calendarFunctions.saveCalendarState(calendarId);
};