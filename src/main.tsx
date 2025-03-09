import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/fonts.css'; // Add this import

createRoot(document.getElementById("root")!).render(<App />);
