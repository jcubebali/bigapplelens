import { BrowserRouter } from 'react-router-dom';
import App from './App';

export function Application() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
