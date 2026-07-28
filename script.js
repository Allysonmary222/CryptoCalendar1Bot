// Crypto Calendar - Main Application
// Uses CryptoPanic API for real crypto news and events

const API_BASE = 'https://cryptopanic.com/api/v1/posts/';
const API_KEY = 'YOUR_API_KEY'; // Get free key from cryptopanic.com
const CURRENCY = 'BTC,ETH,SOL,ADA,AVAX,DOT,MATIC,ARB,OP,SUI,APT';

let allEvents = [];
let currentFilter = 'all';
let currentDate = '';

// Fetch events from CryptoPanic API
async function fetchEvents() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('eventsGrid');
    const errorEl = document.getElementById('errorMessage');
    
    loadingEl.style.display = 'block';
    gridEl.innerHTML = '';
    errorEl.textContent = '';

    try {
        const url = `${API_BASE}?auth_token=${API_KEY}&currencies=${CURRENCY}&kind=news&public=true&filter=hot`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform API data to our event format
        allEvents = data.results.map(item => ({
            id: item.id,
            date: new Date(item.published_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            name: item.title.substring(0, 60) + (item.title.length > 60 ? '...' : ''),
            type: detectEventType(item.title, item.currencies),
            url: item.url,
            currency: item.currencies?.[0]?.symbol || 'Crypto'
        }));

        // Add some mock event types for demonstration since API doesn't categorize unlocks/upgrades
        // In production, you'd use a dedicated calendar API
        allEvents = allEvents.map(event => ({
            ...event,
            type: getRandomEventType(event.name)
        }));

        loadingEl.style.display = 'none';
        renderEvents(allEvents);

    } catch (error) {
        console.error('Error fetching events:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = '⚠️ Failed to load events. Please try again later. Using fallback data.';
        
        // Fallback mock data for demo
        allEvents = getMockEvents();
        renderEvents(allEvents);
    }
}

// Detect event type from title (simplified)
function detectEventType(title, currencies) {
    const text = title.toLowerCase();
    if (text.includes('unlock') || text.includes('release') || text.includes('vesting')) {
        return 'Unlock';
    } else if (text.includes('upgrade') || text.includes('update') || text.includes('v2') || text.includes('mainnet')) {
        return 'Upgrade';
    } else if (text.includes('launch') || text.includes('listing') || text.includes('partnership')) {
        return 'Event';
    }
    return 'Event';
}

// Get random event type for demo (since CryptoPanic doesn't categorize this way)
function getRandomEventType(title) {
    const types = ['Unlock', 'Upgrade', 'Event'];
    const weights = [0.3, 0.2, 0.5]; // 30% unlock, 20% upgrade, 50% event
    
    // Weighted random based on keywords
    const text = title.toLowerCase();
    if (text.includes('unlock') || text.includes('release') || text.includes('vesting')) return 'Unlock';
    if (text.includes('upgrade') || text.includes('update') || text.includes('v2')) return 'Upgrade';
    if (text.includes('launch') || text.includes('listing') || text.includes('partnership')) return 'Event';
    
    // Random weighted
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < types.length; i++) {
        cumulative += weights[i];
        if (rand <= cumulative) return types[i];
    }
    return 'Event';
}

// Filter events
function filterEvents(events, type, date) {
    return events.filter(event => {
        const typeMatch = type === 'all' || event.type === type;
        const dateMatch = !date || event.date === date;
        return typeMatch && dateMatch;
    });
}

// Render events to grid
function renderEvents(events) {
    const gridEl = document.getElementById('eventsGrid');
    
    if (events.length === 0) {
        gridEl.innerHTML = '<div class="error-message" style="grid-column:1/-1;">No events found for the selected filters</div>';
        return;
    }

    const filtered = filterEvents(events, currentFilter, currentDate);
    
    if (filtered.length === 0) {
        gridEl.innerHTML = '<div class="error-message" style="grid-column:1/-1;">No events match your current filters</div>';
        return;
    }

    gridEl.innerHTML = filtered.map(event => `
        <div class="event-card" onclick="window.open('${event.url}', '_blank')">
            <div class="event-date">📅 ${event.date}</div>
            <div class="event-name">${event.name}</div>
            <div class="event-type ${event.type.toLowerCase()}">${event.type}</div>
            ${event.currency ? `<div style="margin-top:8px;font-size:0.8rem;color:#8899bb;">💎 ${event.currency}</div>` : ''}
        </div>
    `).join('');
}

// Mock events for fallback (demonstration)
function getMockEvents() {
    const today = new Date();
    const formatDate = (days) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return [
        { id: 1, date: formatDate(3), name: 'Avalanche (AVAX) Token Unlock', type: 'Unlock', currency: 'AVAX', url: '#' },
        { id: 2, date: formatDate(5), name: 'Ethereum Shanghai Upgrade', type: 'Upgrade', currency: 'ETH', url: '#' },
        { id: 3, date: formatDate(7), name: 'Solana Breakpoint Conference', type: 'Event', currency: 'SOL', url: '#' },
        { id: 4, date: formatDate(10), name: 'Arbitrum (ARB) Token Release', type: 'Unlock', currency: 'ARB', url: '#' },
        { id: 5, date: formatDate(14), name: 'Cardano Vasil Hard Fork', type: 'Upgrade', currency: 'ADA', url: '#' },
        { id: 6, date: formatDate(18), name: 'Polygon zkEVM Mainnet Launch', type: 'Event', currency: 'MATIC', url: '#' },
    ];
}

// Apply filters
function applyFilters() {
    currentFilter = document.getElementById('typeFilter').value;
    currentDate = document.getElementById('dateFilter').value;
    renderEvents(allEvents);
}

// Refresh data
function refreshData() {
    fetchEvents();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    // Initial load
    fetchEvents();
});

// Auto-refresh every 5 minutes
setInterval(refreshData, 300000);
