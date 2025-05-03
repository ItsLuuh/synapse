// Calendar functionality for Synapse - Google Calendar style

let calendarActive = false;
let currentView = 'month'; // 'month', 'week', 'day', 'agenda'
let currentDate = new Date();
let events = []; // Array to store calendar events
let selectedEvent = null;
let draggedEvent = null;
let resizingEvent = null;
let eventCounter = 0;
let dayStartHour = 8; // Default day starts at 8 AM for day view
let dayEndHour = 20; // Default day ends at 8 PM for day view

// Esponi le funzioni al renderer.js
window.calendarFunctions = window.calendarFunctions || {};

// Esponi la funzione di inizializzazione
window.calendarFunctions.initialize = function() {
  initializeCalendar();
};

// Esponi la funzione renderCalendar globalmente
window.renderCalendar = renderCalendar;

// Esponi le variabili globali
window.currentView = currentView;
window.currentDate = currentDate;
window.events = events;

// Initialize calendar when the feature is selected
function initializeCalendar() {
  console.log('Initializing calendar');
  
  if (calendarActive) return; // Already initialized
  calendarActive = true;
  
  // Create calendar container if it doesn't exist
  let calendarContainer = document.querySelector('.calendar-container');
  if (!calendarContainer) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
      console.error('Cannot find chatMessages element to replace with calendar');
      return;
    }
    
    // Clear chat messages and add calendar container
    chatMessages.innerHTML = '';
    calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';
    chatMessages.appendChild(calendarContainer);
    
    // Ensure the container takes up all available space
    calendarContainer.style.width = '100%';
    calendarContainer.style.height = '100%';
    calendarContainer.style.position = 'absolute';
    calendarContainer.style.top = '0';
    calendarContainer.style.left = '0';
    calendarContainer.style.right = '0';
    calendarContainer.style.bottom = '0';
    calendarContainer.style.display = 'flex';
    calendarContainer.style.flexDirection = 'column';
    
    // Create calendar header
    const calendarHeader = createCalendarHeader();
    calendarContainer.appendChild(calendarHeader);
    
    // Create sidebar similar to Google Calendar
    const sidebar = document.createElement('div');
    sidebar.className = 'calendar-sidebar';
    
    // Create main calendar view area
    const calendarViewArea = document.createElement('div');
    calendarViewArea.className = 'calendar-view-area';
    calendarViewArea.id = 'calendarViewArea';
    
    // Create main flex container for sidebar and calendar
    const mainContainer = document.createElement('div');
    mainContainer.className = 'calendar-main-container';
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(calendarViewArea);
    calendarContainer.appendChild(mainContainer);
    
    // Setup the calendar sidebar
    setupCalendarSidebar(sidebar);
    
    // Load test events for demonstration
    loadDemoEvents();
    
    // Render the calendar with current view and date
    renderCalendar(currentView, currentDate);
    
    // Setup event listeners
    setupCalendarEventListeners();
  }
}

// Create the calendar header with controls
function createCalendarHeader() {
  const header = document.createElement('div');
  header.className = 'calendar-header';
  
  // Create navigation controls (left side)
  const navControls = document.createElement('div');
  navControls.className = 'calendar-nav-controls';
  
  // Today button
  const todayBtn = document.createElement('button');
  todayBtn.className = 'calendar-btn today-btn';
  todayBtn.innerText = 'Oggi';
  todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar(currentView, currentDate);
  });
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'calendar-btn nav-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.addEventListener('click', () => {
    navigateCalendar('prev');
  });
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'calendar-btn nav-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.addEventListener('click', () => {
    navigateCalendar('next');
  });
  
  // Current date/month display
  const dateDisplay = document.createElement('h2');
  dateDisplay.className = 'calendar-date-display';
  dateDisplay.id = 'calendarDateDisplay';
  updateDateDisplay(dateDisplay, currentDate, currentView);
  
  navControls.appendChild(todayBtn);
  navControls.appendChild(prevBtn);
  navControls.appendChild(nextBtn);
  navControls.appendChild(dateDisplay);
  
  // Create view toggle controls (right side)
  const viewControls = document.createElement('div');
  viewControls.className = 'calendar-view-controls';
  
  // View selector dropdown
  const viewSelector = document.createElement('div');
  viewSelector.className = 'calendar-view-selector';
  
  // Create view buttons
  const viewOptions = [
    { id: 'day', text: 'Giorno' },
    { id: 'week', text: 'Settimana' },
    { id: 'month', text: 'Mese' },
    { id: 'agenda', text: 'Agenda' }
  ];
  
  viewOptions.forEach(option => {
    const viewBtn = document.createElement('button');
    viewBtn.className = `calendar-view-btn ${option.id === currentView ? 'active' : ''}`;
    viewBtn.dataset.view = option.id;
    viewBtn.innerText = option.text;
    viewBtn.addEventListener('click', () => {
      // Toggle active class
      document.querySelectorAll('.calendar-view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      viewBtn.classList.add('active');
      
      // Change view
      currentView = option.id;
      renderCalendar(currentView, currentDate);
    });
    viewSelector.appendChild(viewBtn);
  });
  
  // Create "Add Event" button
  const addEventBtn = document.createElement('button');
  addEventBtn.className = 'calendar-btn add-event-btn';
  addEventBtn.innerHTML = '<i class="fas fa-plus"></i> Nuovo Evento';
  addEventBtn.addEventListener('click', () => {
    showAddEventModal();
  });
  
  viewControls.appendChild(viewSelector);
  viewControls.appendChild(addEventBtn);
  
  // Add both control groups to header
  header.appendChild(navControls);
  header.appendChild(viewControls);
  
  return header;
}

// Update the date display in the header
function updateDateDisplay(element, date, view) {
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  
  if (view === 'month') {
    element.innerText = `${months[date.getMonth()]} ${date.getFullYear()}`;
  } else if (view === 'week') {
    // Get start and end of week
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Start on Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Format display
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      element.innerText = `${weekStart.getDate()} - ${weekEnd.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
      element.innerText = `${weekStart.getDate()} ${months[weekStart.getMonth()].substring(0, 3)} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()].substring(0, 3)} ${weekStart.getFullYear()}`;
    } else {
      element.innerText = `${weekStart.getDate()} ${months[weekStart.getMonth()].substring(0, 3)} ${weekStart.getFullYear()} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()].substring(0, 3)} ${weekEnd.getFullYear()}`;
    }
  } else if (view === 'day') {
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    element.innerText = `${dayNames[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } else { // agenda
    element.innerText = `Agenda - ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}

// Navigate the calendar based on the current view
function navigateCalendar(direction) {
  const newDate = new Date(currentDate);
  
  if (currentView === 'month') {
    // Navigate by month
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
  } else if (currentView === 'week') {
    // Navigate by week
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
  } else if (currentView === 'day') {
    // Navigate by day
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
  } else { // agenda
    // Navigate by month for agenda view too
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
  }
  
  currentDate = newDate;
  renderCalendar(currentView, currentDate);
}

// Setup the calendar sidebar with mini calendar and other controls
function setupCalendarSidebar(sidebar) {
  // Create mini calendar section
  const miniCalendar = document.createElement('div');
  miniCalendar.className = 'mini-calendar';
  miniCalendar.id = 'miniCalendar';
  
  // Create "My Calendars" section
  const myCalendarsSection = document.createElement('div');
  myCalendarsSection.className = 'calendar-section';
  
  const myCalendarsHeader = document.createElement('div');
  myCalendarsHeader.className = 'section-header';
  myCalendarsHeader.innerHTML = '<h3>I miei calendari</h3>';
  
  const calendarsList = document.createElement('div');
  calendarsList.className = 'calendars-list';
  
  // Add calendar items
  const calendars = [
    { id: 'primary', name: 'Calendario personale', color: '#5c5cff' },
    { id: 'work', name: 'Lavoro', color: '#e67c73' },
    { id: 'family', name: 'Famiglia', color: '#7986cb' }
  ];
  
  calendars.forEach(cal => {
    const calItem = document.createElement('div');
    calItem.className = 'calendar-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `cal-${cal.id}`;
    checkbox.checked = true;
    
    const colorDot = document.createElement('span');
    colorDot.className = 'color-dot';
    colorDot.style.backgroundColor = cal.color;
    
    const label = document.createElement('label');
    label.htmlFor = `cal-${cal.id}`;
    label.textContent = cal.name;
    
    calItem.appendChild(checkbox);
    calItem.appendChild(colorDot);
    calItem.appendChild(label);
    calendarsList.appendChild(calItem);
  });
  
  myCalendarsSection.appendChild(myCalendarsHeader);
  myCalendarsSection.appendChild(calendarsList);
  
  // Add all elements to sidebar
  sidebar.appendChild(miniCalendar);
  sidebar.appendChild(myCalendarsSection);
  
  // Render mini calendar
  renderMiniCalendar();
}

// Render the mini calendar in the sidebar
function renderMiniCalendar() {
  const miniCalendar = document.getElementById('miniCalendar');
  if (!miniCalendar) return;
  
  const now = new Date();
  const miniDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Create mini calendar header
  const miniHeader = document.createElement('div');
  miniHeader.className = 'mini-calendar-header';
  
  const monthYearDisplay = document.createElement('div');
  monthYearDisplay.className = 'month-year-display';
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  monthYearDisplay.textContent = `${months[miniDate.getMonth()]} ${miniDate.getFullYear()}`;
  
  const miniNavBtns = document.createElement('div');
  miniNavBtns.className = 'mini-nav-buttons';
  
  const prevMonthBtn = document.createElement('button');
  prevMonthBtn.className = 'mini-nav-btn';
  prevMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate = newDate;
    renderCalendar(currentView, currentDate);
    renderMiniCalendar();
  });
  
  const nextMonthBtn = document.createElement('button');
  nextMonthBtn.className = 'mini-nav-btn';
  nextMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextMonthBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate = newDate;
    renderCalendar(currentView, currentDate);
    renderMiniCalendar();
  });
  
  miniNavBtns.appendChild(prevMonthBtn);
  miniNavBtns.appendChild(nextMonthBtn);
  miniHeader.appendChild(monthYearDisplay);
  miniHeader.appendChild(miniNavBtns);
  
  // Create weekdays header
  const weekdaysHeader = document.createElement('div');
  weekdaysHeader.className = 'mini-weekdays';
  const dayNames = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  dayNames.forEach(day => {
    const dayElem = document.createElement('div');
    dayElem.className = 'mini-day-name';
    dayElem.textContent = day;
    weekdaysHeader.appendChild(dayElem);
  });
  
  // Create calendar grid
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'mini-calendar-grid';
  
  // Get first day of month and adjust to start week on Monday
  const firstDay = new Date(miniDate);
  const startDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7
  firstDay.setDate(2 - startDay); // Go back to the Monday before the 1st
  
  // Create 6 weeks (42 days) to ensure we cover the whole month
  for (let i = 0; i < 42; i++) {
    const dayElem = document.createElement('div');
    dayElem.className = 'mini-day';
    
    // Date for this cell
    const cellDate = new Date(firstDay);
    cellDate.setDate(firstDay.getDate() + i);
    
    // Set day number
    dayElem.textContent = cellDate.getDate();
    
    // Mark days from other months
    if (cellDate.getMonth() !== miniDate.getMonth()) {
      dayElem.classList.add('other-month');
    }
    
    // Mark today
    if (cellDate.toDateString() === now.toDateString()) {
      dayElem.classList.add('today');
    }
    
    // Mark selected day
    if (cellDate.toDateString() === currentDate.toDateString()) {
      dayElem.classList.add('selected');
    }
    
    // Add event dot indicator if there are events on this day
    if (hasEventsOnDate(cellDate)) {
      const eventIndicator = document.createElement('div');
      eventIndicator.className = 'event-indicator';
      dayElem.appendChild(eventIndicator);
    }
    
    // Click handler to change date
    dayElem.addEventListener('click', () => {
      currentDate = new Date(cellDate);
      renderCalendar(currentView, currentDate);
      renderMiniCalendar();
    });
    
    calendarGrid.appendChild(dayElem);
  }
  
  // Clear and rebuild mini calendar
  miniCalendar.innerHTML = '';
  miniCalendar.appendChild(miniHeader);
  miniCalendar.appendChild(weekdaysHeader);
  miniCalendar.appendChild(calendarGrid);
}

// Check if there are events on a specific date
function hasEventsOnDate(date) {
  return events.some(event => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === date.toDateString();
  });
}

// Main function to render the calendar based on the selected view
function renderCalendar(view, date) {
  const calendarViewArea = document.getElementById('calendarViewArea');
  if (!calendarViewArea) return;
  
  // Clear the view area
  calendarViewArea.innerHTML = '';
  
  // Update date display in header
  const dateDisplay = document.getElementById('calendarDateDisplay');
  if (dateDisplay) {
    updateDateDisplay(dateDisplay, date, view);
  }
  
  // Render the appropriate view
  switch (view) {
    case 'month':
      renderMonthView(calendarViewArea, date);
      break;
    case 'week':
      renderWeekView(calendarViewArea, date);
      break;
    case 'day':
      renderDayView(calendarViewArea, date);
      break;
    case 'agenda':
      renderAgendaView(calendarViewArea, date);
      break;
    default:
      renderMonthView(calendarViewArea, date);
  }
  
  // Update mini calendar selection
  renderMiniCalendar();
}

// Render the month view
function renderMonthView(container, date) {
  container.className = 'calendar-view-area month-view';
  
  // Create month grid container
  const monthGrid = document.createElement('div');
  monthGrid.className = 'month-grid';
  
  // Create weekday headers
  const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  dayNames.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    monthGrid.appendChild(dayHeader);
  });
  
  // Get current month's first and last day
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  // Get the weekday of the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  let startingDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
  startingDayOfWeek = startingDayOfWeek === 0 ? 7 : startingDayOfWeek; // Convert Sunday (0) to 7
  
  // Create the grid cells
  // Add empty cells for days before the first day of the month
  for (let i = 1; i < startingDayOfWeek; i++) {
    const prevMonthDate = new Date(firstDay);
    prevMonthDate.setDate(prevMonthDate.getDate() - (startingDayOfWeek - i));
    
    const emptyCell = createMonthDayCell(prevMonthDate, true);
    monthGrid.appendChild(emptyCell);
  }
  
  // Add cells for days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
    const dayCell = createMonthDayCell(currentDate);
    monthGrid.appendChild(dayCell);
  }
  
  // Fill in the remaining cells to complete the grid with next month's days
  const daysAdded = startingDayOfWeek - 1 + lastDay.getDate();
  const remainingCells = 7 - (daysAdded % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(lastDay);
      nextMonthDate.setDate(nextMonthDate.getDate() + i);
      
      const emptyCell = createMonthDayCell(nextMonthDate, true);
      monthGrid.appendChild(emptyCell);
    }
  }
  
  container.appendChild(monthGrid);
}

// Create a day cell for the month view
function createMonthDayCell(date, isOtherMonth = false) {
  const cell = document.createElement('div');
  cell.className = 'month-day-cell';
  
  if (isOtherMonth) {
    cell.classList.add('other-month');
  }
  
  // Check if this is today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    cell.classList.add('today');
  }
  
  // Create header with day number
  const dayHeader = document.createElement('div');
  dayHeader.className = 'day-number';
  dayHeader.textContent = date.getDate();
  cell.appendChild(dayHeader);
  
  // Create container for events
  const eventsContainer = document.createElement('div');
  eventsContainer.className = 'day-events-container';
  
  // Add events for this day
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === date.toDateString();
  });
  
  dayEvents.forEach(event => {
    const eventElement = document.createElement('div');
    eventElement.className = 'calendar-event month-event';
    eventElement.style.backgroundColor = event.color || '#5c5cff';
    
    // Format time for display
    const startTime = new Date(event.start);
    let timeStr = startTime.getHours().toString().padStart(2, '0') + ':' + 
                 startTime.getMinutes().toString().padStart(2, '0');
    
    eventElement.innerHTML = `<span class="event-time">${timeStr}</span> ${event.title}`;
    
    // Add click handler to show event details
    eventElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showEventDetails(event);
    });
    
    eventsContainer.appendChild(eventElement);
  });
  
  // Show "more" indicator if there are too many events
  if (dayEvents.length > 3) {
    const visibleEvents = dayEvents.slice(0, 2);
    
    // Clear the container and only show 2 events
    eventsContainer.innerHTML = '';
    
    visibleEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = 'calendar-event month-event';
      eventElement.style.backgroundColor = event.color || '#5c5cff';
      
      // Format time for display
      const startTime = new Date(event.start);
      let timeStr = startTime.getHours().toString().padStart(2, '0') + ':' + 
                   startTime.getMinutes().toString().padStart(2, '0');
      
      eventElement.innerHTML = `<span class="event-time">${timeStr}</span> ${event.title}`;
      
      // Add click handler to show event details
      eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(event);
      });
      
      eventsContainer.appendChild(eventElement);
    });
    
    // Add "more" indicator
    const moreIndicator = document.createElement('div');
    moreIndicator.className = 'more-events';
    moreIndicator.textContent = `+ ${dayEvents.length - 2} altri`;
    
    // Click handler for "more" to show all events
    moreIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      showEventsForDay(date, dayEvents);
    });
    
    eventsContainer.appendChild(moreIndicator);
  }
  
  cell.appendChild(eventsContainer);
  
  // Add click handler to navigate to this day
  cell.addEventListener('click', () => {
    currentDate = new Date(date);
    currentView = 'day';
    renderCalendar(currentView, currentDate);
  });
  
  return cell;
}

// Setup event listeners for calendar functionality
function setupCalendarEventListeners() {
  // Listen for events to create new events by click and drag
  const calendarViewArea = document.getElementById('calendarViewArea');
  if (calendarViewArea) {
    calendarViewArea.addEventListener('mousedown', (e) => {
      // Implementation for click and drag to create events
      // Will be different based on the view (month/week/day)
    });
  }
}

// Load sample events for demonstration
function loadDemoEvents() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Create some sample events
  events = [
    {
      id: 'event1',
      title: 'Riunione di progetto',
      description: 'Discussione sullo stato del progetto Synapse',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      color: '#5c5cff',
      calendar: 'primary',
      notification: true
    },
    {
      id: 'event2',
      title: 'Pranzo con il team',
      description: 'Pranzo con il team di sviluppo',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      color: '#e67c73',
      calendar: 'work',
      notification: true
    },
    {
      id: 'event3',
      title: 'Scadenza progetto',
      description: 'Consegna della prima versione del progetto',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 19, 0),
      color: '#f6bf26',
      calendar: 'work',
      notification: true
    },
    // Add more events as needed
    {
      id: 'event4',
      title: 'Compleanno di Marco',
      description: 'Festa di compleanno',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 20, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 23, 30),
      color: '#7986cb',
      calendar: 'family',
      notification: true
    },
    {
      id: 'event5',
      title: 'Appuntamento dal medico',
      description: 'Visita di controllo',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 30),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 30),
      color: '#33b679',
      calendar: 'primary',
      notification: true
    }
  ];
  
  // Setup notifications for today's events
  events.forEach(event => {
    const eventTime = new Date(event.start);
    if (event.notification && eventTime.toDateString() === today.toDateString() && eventTime > now) {
      scheduleEventNotification(event);
    }
  });
}

// Schedule a desktop notification for an event
function scheduleEventNotification(event) {
  const eventTime = new Date(event.start);
  const now = new Date();
  
  // Calculate time until event starts (in milliseconds)
  const timeUntilEvent = eventTime.getTime() - now.getTime();
  
  // Schedule notification 15 minutes before the event
  const notificationTime = timeUntilEvent - (15 * 60 * 1000);
  
  // Only schedule if the notification time is in the future
  if (notificationTime > 0) {
    setTimeout(() => {
      sendDesktopNotification(event);
    }, notificationTime);
  } else if (timeUntilEvent > 0) {
    // If less than 15 minutes until event, send notification now
    sendDesktopNotification(event);
  }
}

// Send a desktop notification
function sendDesktopNotification(event) {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.warn("Questo browser non supporta le notifiche desktop");
    return;
  }
  
  // Check if notification permission is granted
  if (Notification.permission === "granted") {
    // Format the event time for display
    const start = new Date(event.start);
    const timeStr = start.getHours().toString().padStart(2, '0') + ':' + 
                   start.getMinutes().toString().padStart(2, '0');
    
    // Create and show notification
    const notification = new Notification("Promemoria Evento", {
      body: `${event.title} alle ${timeStr}`,
      icon: "../../icons/project-logo.png" // Adjust path as needed
    });
    
    // Add click event to the notification
    notification.onclick = function() {
      window.focus();
      showEventDetails(event);
    };
  } 
  // If permission is not denied, request it
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        sendDesktopNotification(event);
      }
    });
  }
}

// Show dialog with event details
function showEventDetails(event) {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'calendar-modal event-details-modal';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Format event times
  const start = new Date(event.start);
  const end = new Date(event.end);
  const dateStr = start.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const startTimeStr = start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  
  // Create header with color bar matching event
  const headerBar = document.createElement('div');
  headerBar.className = 'modal-header-bar';
  headerBar.style.backgroundColor = event.color || '#5c5cff';
  
  // Create event title
  const title = document.createElement('h2');
  title.className = 'event-title';
  title.textContent = event.title;
  
  // Create event time and date
  const timeDate = document.createElement('div');
  timeDate.className = 'event-time-date';
  timeDate.innerHTML = `<i class="fas fa-clock"></i> ${startTimeStr} - ${endTimeStr}, ${dateStr}`;
  
  // Create event description if available
  const description = document.createElement('div');
  description.className = 'event-description';
  description.textContent = event.description || 'Nessuna descrizione';
  
  // Create buttons for actions
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'modal-btn edit-btn';
  editBtn.innerHTML = '<i class="fas fa-edit"></i> Modifica';
  editBtn.addEventListener('click', () => {
    modal.remove();
    showEditEventModal(event);
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'modal-btn delete-btn';
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Elimina';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      events = events.filter(e => e.id !== event.id);
      renderCalendar(currentView, currentDate);
      modal.remove();
    }
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn close-btn';
  closeBtn.innerHTML = '<i class="fas fa-times"></i> Chiudi';
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Add elements to modal
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  actions.appendChild(closeBtn);
  
  modalContent.appendChild(headerBar);
  modalContent.appendChild(title);
  modalContent.appendChild(timeDate);
  modalContent.appendChild(description);
  modalContent.appendChild(actions);
  
  modal.appendChild(modalContent);
  
  // Add modal to the document body
  document.body.appendChild(modal);
  
  // Add click event to close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Show modal to create a new event
function showAddEventModal(date = currentDate) {
  // Implementation will be similar to showEventDetails but with editable fields
  // and functionality to create a new event
}

// Show all events for a specific day
function showEventsForDay(date, dayEvents) {
  // Implementation to show a modal with all events for a day
}

// Export calendar functions for use in renderer.js
window.calendarFunctions = {
  initialize: initializeCalendar
};