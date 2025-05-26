import 'bootstrap/dist/css/bootstrap.min.css';
import './firebaseConfig';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)

