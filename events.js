// This is a mock function. Replace with actual data fetching logic.
exports.handler = async (event, context) => {
  // In a real app, fetch data from a database or external API here
  const mockEvents = [
    { date: '2026-08-15', name: 'Example Token Unlock', type: 'Unlock' },
    { date: '2026-09-01', name: 'Protocol Upgrade v2', type: 'Upgrade' }
  ];

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockEvents)
  };
};
