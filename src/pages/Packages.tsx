import { motion } from 'motion/react';
import { Clock, Camera, Check, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Packages() {
  const packages = [
    {
      id: "express-ts",
      title: "Express Times Square",
      price: "$249",
      duration: "30 min",
      photos: "15 High-res Photos",
      locations: ["Times Square only"],
      includes: ["Professional directing", "Basic color grading", "Online gallery", "24h sneak peeks"],
      image: "https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=2074&auto=format&fit=crop",
      popular: false
    },
    {
      id: "dumbo-iconic",
      title: "DUMBO Iconic",
      price: "$399",
      duration: "60 min",
      photos: "30 High-res Photos",
      locations: ["Manhattan Bridge View", "Brooklyn Bridge Park", "Pebble Beach"],
      includes: ["Outfit suggestions", "Premium signature color grading", "Online gallery", "High-res downloads"],
      image: "https://images.unsplash.com/photo-1522083111822-7776b92a433a?q=80&w=2070&auto=format&fit=crop",
      popular: true
    },
    {
      id: "brooklyn-combo",
      title: "Brooklyn Combo",
      price: "$549",
      duration: "90 min",
      photos: "50+ High-res Photos",
      locations: ["Brooklyn Bridge Walkway", "DUMBO Streets", "Jane's Carousel"],
      includes: ["One outfit change allowed", "Premium signature color grading", "Online gallery", "Priority 3-day delivery"],
      image: "https://images.unsplash.com/photo-1510425463958-dcced28da480?q=80&w=2072&auto=format&fit=crop",
      popular: false
    },
    {
      id: "full-nyc",
      title: "Full Iconic NYC",
      price: "$799",
      duration: "2 hours",
      photos: "80+ High-res Photos",
      locations: ["Central Park", "Top of the Rock OR Times Square"],
      includes: ["Up to 2 outfit changes", "Premium signature color grading", "Subway transition shots", "Express 24h full delivery", "Raw files optional"],
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop",
      popular: false
    }
  ];

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] py-20 border-b border-white/10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">Investment</h1>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto">Choose the perfect package for your New York adventure. All bookings require a 50% deposit to secure your date.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {packages.map((pkg, idx) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col md:flex-row bg-[#151515] border ${pkg.popular ? 'border-[#D4AF37]' : 'border-white/10'} overflow-hidden relative`}
            >
              {pkg.popular && (
                <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest px-3 py-1 z-10 shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:hidden to-transparent" />
                <div className="absolute bottom-4 left-4 md:hidden">
                  <h3 className="text-2xl font-bold uppercase">{pkg.title}</h3>
                  <p className="text-[#D4AF37] font-semibold text-xl">{pkg.price}</p>
                </div>
              </div>

              <div className="md:w-3/5 p-8 flex flex-col">
                <div className="hidden md:block mb-4">
                  <h3 className="text-2xl font-bold uppercase mb-1">{pkg.title}</h3>
                  <p className="text-[#D4AF37] font-semibold text-xl">{pkg.price}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-[#D4AF37]" /> {pkg.duration}</span>
                  <span className="flex items-center"><Camera className="w-4 h-4 mr-2 text-[#D4AF37]" /> {pkg.photos}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mb-8 flex-grow">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 font-semibold">Locations</h4>
                    <ul className="space-y-2">
                      {pkg.locations.map((loc, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start">
                          <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{loc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 font-semibold">Includes</h4>
                    <ul className="space-y-2">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start">
                          <Check className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link 
                  to={`/booking?package=${pkg.id}`}
                  className={`w-full text-center py-3 uppercase text-sm font-bold tracking-widest transition-colors ${
                    pkg.popular 
                      ? 'bg-[#D4AF37] text-black hover:bg-[#E8CA6B]' 
                      : 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                  }`}
                >
                  Book This Package
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Engagement Special Banner */}
        <div className="mt-16 bg-[#D4AF37] text-black p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 max-w-2xl">
            <h3 className="text-2xl font-bold uppercase mb-2">Planning a Surprise Proposal?</h3>
            <p className="opacity-90 font-medium">We specialize in hidden proposal photography. Contact us for our specialized "She Said Yes" workflow, including planning maps and hidden angles.</p>
          </div>
          <Link to="/booking?type=proposal" className="bg-black text-white px-8 py-4 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors whitespace-nowrap border border-black hover:border-white">
            Inquire Now
          </Link>
        </div>
      </div>
    </div>
  );
}
