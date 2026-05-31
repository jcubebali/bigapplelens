import { Camera, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const galleryImages = [
    { title: 'Times Square', img: 'https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=600&auto=format&fit=crop' },
    { title: 'DUMBO', img: 'https://images.unsplash.com/photo-1522083111822-7776b92a433a?q=80&w=600&auto=format&fit=crop' },
    { title: 'Central Park', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=600&auto=format&fit=crop' },
    { title: 'Soho Fashion', img: 'https://images.unsplash.com/photo-1600000000000-000000000000?q=80&w=600&auto=format&fit=crop' },
    { title: 'Brooklyn Bridge', img: 'https://images.unsplash.com/photo-1510425463958-dcced28da480?q=80&w=600&auto=format&fit=crop' },
    { title: 'Skyline Gold', img: 'https://images.unsplash.com/photo-1500916434205-0c77489c6211?q=80&w=600&auto=format&fit=crop' }
  ];

  return (
    <>
    <div className="h-[180px] bg-black/50 border-t border-[#D4AF37]/20 flex gap-2.5 p-2.5 relative z-10 w-full overflow-hidden">
      {galleryImages.map((item, idx) => (
        <div key={idx} className="flex-1 bg-[#222] rounded-sm overflow-hidden relative group">
          <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-[10px] left-[10px] text-[10px] uppercase tracking-[1px] text-[#D4AF37] bg-black/70 px-2 py-1">
            {item.title}
          </div>
        </div>
      ))}
    </div>
    <footer className="bg-[#0A0A0A] border-t border-[#D4AF37]/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Camera className="w-6 h-6 text-[#D4AF37]" />
              <span className="font-bold text-lg tracking-wider uppercase">BigApple Lens</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Capture Your New York Moment. Premium luxury travel photography for engagements, families, and solo travelers exploring the city that never sleeps.
            </p>
          </div>
          
          <div>
            <h4 className="uppercase tracking-widest font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/packages" className="hover:text-[#D4AF37] transition">Packages</Link></li>
              <li><Link to="/gallery" className="hover:text-[#D4AF37] transition">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-[#D4AF37] transition">About Us</Link></li>
              <li><Link to="/booking" className="hover:text-[#D4AF37] transition">Book Session</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="uppercase tracking-widest font-semibold mb-4 text-sm">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition"><Twitter className="w-5 h-5" /></a>
            </div>
            <p className="text-gray-400 text-sm">hello@bigapplelens.com</p>
          </div>
        </div>
        
        <div className="text-center text-gray-600 text-sm pt-8 border-t border-white/5">
          © {new Date().getFullYear()} BigApple Lens Photography. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
}
