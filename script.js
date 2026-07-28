// This fetches data from your serverless function
async function fetchAndDisplayEvents() {
  try {
    const response = await fetch('/.netlify/functions/events');
    const events = await response.json();
    
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = ''; // Clear loading message

    events.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.innerHTML = `<strong>${event.date}</strong> - ${event.name} (${event.type})`;
      eventsContainer.appendChild(eventElement);
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    document.getElementById('events-container').innerHTML = '<p>Failed to load events. Please try again later.</p>';
  }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayEvents);
