import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Packages from './pages/Packages';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import About from './pages/About';
import BookingSuccess from './pages/BookingSuccess';
import Dashboard from './pages/admin/Dashboard';
import CalendarManager from './pages/admin/Calendar';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-white">
      {!isAdmin && <Navbar />}
      <main className={`flex-grow ${isAdmin ? 'pt-0' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/calendar" element={<CalendarManager />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1C1C1C', color: '#fff' } }} />
    </div>
  );
}
