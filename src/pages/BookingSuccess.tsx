import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <CheckCircle className="w-24 h-24 text-[#D4AF37] mb-8 mx-auto" />
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4"
      >
        Booking Confirmed
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 max-w-xl mb-12 text-lg font-light leading-relaxed"
      >
        Thank you for choosing BigApple Lens. Your deposit has been received and your date is officially secured. We have sent a confirmation email with a link to your client portal and preparation guide.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
         <Link to="/" className="bg-[#D4AF37] text-black px-8 py-4 uppercase font-bold tracking-widest text-sm hover:bg-[#E8CA6B] transition-colors border border-[#D4AF37]">
            Return Home
         </Link>
      </motion.div>
    </div>
  );
}
