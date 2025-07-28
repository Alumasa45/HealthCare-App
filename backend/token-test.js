const jwt = require('jsonwebtoken');

// Your current token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsIkVtYWlsIjoiYXV0aEBnbWFpbC5jb20iLCJVc2VyX1R5cGUiOiJBZG1pbiIsImlhdCI6MTc1MjE3MzA3OCwiZXhwIjoxNzUyMTc2Njc4fQ._AAAU5ksNIah_TC98juD9ukokLD-6hd-vnungeaRkgo';

// Your JWT secret
const secret = 'your-secret-key';

try {
  // Decode without verification to see contents
  const decoded = jwt.decode(token);
  console.log('Token contents:', decoded);
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  console.log('Current timestamp:', now);
  console.log('Token expires at:', decoded.exp);
  console.log('Token expired?', now > decoded.exp);
  
  // Try to verify with secret
  const verified = jwt.verify(token, secret);
  console.log('Token verified successfully:', verified);
} catch (error) {
  console.log('Token verification failed:', error.message);
}
