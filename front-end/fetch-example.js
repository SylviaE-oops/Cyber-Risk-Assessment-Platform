// Example: send an assessment to the backend API
async function saveAssessmentExample() {
  const payload = {
    org_name: 'Riverside Nonprofit',
    org_type: 'nonprofit',
    answers: {
      1: 4,
      2: 2,
      3: 4
    },
    score: 68,
    risk_level: 'Medium'
  };

  const response = await fetch('http://localhost:3000/api/assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  console.log('Saved with ID:', data.id);
}
