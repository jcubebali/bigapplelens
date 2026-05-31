import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Packages from './pages/Packages';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import About from './pages/About';
import BookingSuccess from './pages/BookingSuccess';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1C1C1C', color: '#fff' } }} />
    </div>
  );
}
