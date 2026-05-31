import { Link, useLocation } from 'react-router-dom';
import { Camera, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      scrolled ? "bg-[#0F0F0F]/85 backdrop-blur-md border-[#D4AF37]/20" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-10 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center text-[#0F0F0F] font-bold text-xl">B</div>
            <span className="font-bold text-[22px] tracking-[-0.5px]">BIGAPPLE <span className="text-[#D4AF37]">LENS</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-9">
            {links.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "uppercase text-[14px] tracking-[1px] transition-colors",
                  location.pathname === link.path ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col text-right ml-4">
              <span className="text-xs text-white/50 tracking-[1px]">CALL US</span>
              <span className="text-white font-bold tracking-[1px]">+1 (212) 555-0198</span>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-[#D4AF37]">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0F0F0F] border-b border-[#D4AF37]/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              {links.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={cn(
                    "block uppercase text-[14px] tracking-[1px] transition-colors",
                    location.pathname === link.path ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/booking"
                className="bg-[#E63939] text-white px-6 py-3 text-center uppercase text-[14px] font-bold tracking-[1px] hover:-translate-y-0.5 transition-transform shadow-[0_10px_30px_rgba(230,57,57,0.3)] mt-4"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
