// Debug utility to test session functionality
export function debugSession() {
  console.log('=== SESSION DEBUG ===');
  
  // Check if localStorage is available
  try {
    const testKey = 'balancify_test';
    localStorage.setItem(testKey, 'test_value');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    console.log('✓ localStorage is working:', testValue === 'test_value');
  } catch (error) {
    console.error('✗ localStorage error:', error);
    return;
  }
  
  // Check current session data
  const sessionData = localStorage.getItem('balancifySession');
  console.log('Current session data:', sessionData);
  
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      console.log('Parsed session:', parsed);
      
      // Check if session is valid (not expired)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const sessionAge = Date.now() - new Date(parsed.startTime).getTime();
      console.log('Session age (hours):', sessionAge / (1000 * 60 * 60));
      console.log('Session is valid:', sessionAge < maxAge);
    } catch (error) {
      console.error('✗ Error parsing session data:', error);
    }
  } else {
    console.log('No session data found');
  }
  
  console.log('=== END DEBUG ===');
}

// Test session creation
export function testSessionCreation(userName: string) {
  const newSession = {
    formData: { name: userName },
    currentStep: 0,
    startTime: new Date(),
    lastUpdated: new Date(),
    userName,
    isCompleted: false,
  };
  
  localStorage.setItem('balancifySession', JSON.stringify(newSession));
  console.log('Test session created for:', userName);
  return newSession;
}