import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './index.css'
import App from './App.tsx'
import { decodeJWT } from './utils/jwt'

const token = localStorage.getItem('token');
if (token) {
  const decodedToken = decodeJWT(token);
  console.log('Application starting with token:', {
    exists: !!token,
    decoded: decodedToken,
    role: decodedToken?.Role
  });
} else {
  console.log('Application starting without token');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)