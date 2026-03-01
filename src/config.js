// Auto-detect environment: Use localhost in local development, and Vercel backend in production
export const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://ballotsbcknd.vercel.app';
