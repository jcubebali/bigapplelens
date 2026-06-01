import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, Clock, Package, Mail } from 'lucide-react';

interface PendingBooking {
  sessionId: string;
  packageName: string;
  date: string;
  time: string;
  email: string;
}

export default function BookingSuccess() {
  const [booking, setBooking] = useState<PendingBooking | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pendingBooking');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PendingBooking;
        setBooking(parsed);
      } catch (err) {
        console.error("Failed to parse pending booking info", err);
      } finally {
        // Clear from localStorage once retrieved
        localStorage.removeItem('pendingBooking');
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 text-center bg-[#0F0F0F] text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=1200")' }}></div>

      <div className="w-full max-w-xl bg-[#151515] border border-[#D4AF37]/35 p-8 md:p-10 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider mb-2 text-white"
        >
          Booking Terkonfirmasi!
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-[#D4AF37] uppercase tracking-widest font-extrabold mb-8"
        >
          DEPOSIT SECURELY ESCROWED VIA STRIPE
        </motion.p>
        
        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-sm p-6 mb-8 text-left space-y-4 shadow-inner text-white"
          >
            <h3 className="text-xs uppercase tracking-widest font-bold text-white/40 border-b border-white/5 pb-2">Ringkasan Sesi</h3>
            
            <div className="flex items-center space-x-3">
              <Package className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <div>
                <span className="text-[10px] text-white/50 block uppercase tracking-wider">Paket Pilihan</span>
                <span className="text-sm font-bold text-white">{booking.packageName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div>
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Tanggal Sesi</span>
                  <span className="text-sm font-bold text-white">{booking.date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div>
                  <span className="text-[10px] text-white/50 block uppercase tracking-wider">Waktu Sesi</span>
                  <span className="text-sm font-bold text-white">{booking.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <div>
                <span className="text-[10px] text-white/50 block uppercase tracking-wider">Email Klien</span>
                <span className="text-sm font-semibold text-white/90">{booking.email}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-8"
        >
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            Pembayaran berhasil! Konfirmasi resmi akan dikirim ke <span className="font-semibold text-white">{booking?.email || "email Anda"}</span> dalam beberapa menit.
          </p>
          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-3.5 rounded-sm">
            <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-widest mb-1 text-center sm:text-left">Catatan Penting</span>
            <p className="text-[11px] text-white/60">
              Jika tidak menerima email konfirmasi dalam 10 menit, silakan hubungi tim kami di support@bigapplehq.com atau WhatsApp resmi kami.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link 
            to="/" 
            className="bg-[#D4AF37] text-black px-6 py-3.5 uppercase font-bold tracking-widest text-xs hover:bg-[#E8CA6B] transition-all rounded-sm inline-block text-center border border-[#D4AF37] shadow-lg font-sans"
          >
            Halaman Utama
          </Link>
          <Link 
            to="/booking" 
            className="bg-transparent text-white border border-white/20 px-6 py-3.5 uppercase font-bold tracking-widest text-xs hover:border-white hover:bg-white/5 transition-all rounded-sm inline-block text-center font-sans"
          >
            Buat Sesi Baru
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
