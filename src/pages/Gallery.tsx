import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const categories = ['All', 'Times Square', 'DUMBO', 'Brooklyn Bridge', 'Central Park'];

  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop', category: 'Central Park', aspect: 'aspect-[3/4]' },
    { id: 2, url: 'https://images.unsplash.com/photo-1522083111822-7776b92a433a?q=80&w=2070&auto=format&fit=crop', category: 'DUMBO', aspect: 'aspect-square' },
    { id: 3, url: 'https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=2074&auto=format&fit=crop', category: 'Times Square', aspect: 'aspect-[4/3]' },
    { id: 4, url: 'https://images.unsplash.com/photo-1510425463958-dcced28da480?q=80&w=2072&auto=format&fit=crop', category: 'Brooklyn Bridge', aspect: 'aspect-[3/4]' },
    { id: 5, url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6211?q=80&w=2069&auto=format&fit=crop', category: 'Central Park', aspect: 'aspect-video' },
    { id: 6, url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=2070&auto=format&fit=crop', category: 'Times Square', aspect: 'aspect-[3/4]' },
    { id: 7, url: 'https://images.unsplash.com/photo-1600000000000-000000000000?q=80&w=2070&auto=format&fit=crop', category: 'DUMBO', aspect: 'aspect-square' },
    { id: 8, url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop', category: 'Times Square', aspect: 'aspect-[4/3]' },
    { id: 9, url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop', category: 'Central Park', aspect: 'aspect-[3/4]' },
    { id: 10, url: 'https://images.unsplash.com/photo-1502476579549-0fa39da1a302?q=80&w=2040&auto=format&fit=crop', category: 'Brooklyn Bridge', aspect: 'aspect-video' },
    { id: 11, url: 'https://images.unsplash.com/photo-1466044321350-4ed3b134aa6b?q=80&w=2040&auto=format&fit=crop', category: 'DUMBO', aspect: 'aspect-[3/4]' },
    { id: 12, url: 'https://images.unsplash.com/photo-1500445032980-ebd9e334a1ac?q=80&w=2040&auto=format&fit=crop', category: 'Brooklyn Bridge', aspect: 'aspect-square' }
  ];

  const filteredPhotos = filter === 'All' ? photos : photos.filter(p => p.category === filter);

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] py-20 border-b border-white/10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">Portfolio</h1>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto">A curated selection of our finest NYC moments.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 text-sm uppercase tracking-widest font-semibold transition-all border ${
                filter === cat 
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black' 
                  : 'border-white/20 text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Layout via CSS columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filteredPhotos.map(photo => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={photo.id}
                className={`w-full overflow-hidden mb-6 break-inside-avoid shadow-lg relative group cursor-pointer border border-white/10 ${photo.aspect}`}
                onClick={() => setSelectedImg(photo.url)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.category} 
                  loading="lazy" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white uppercase tracking-widest text-sm font-bold border border-white px-6 py-3">View</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImg(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-[#D4AF37] transition"
              onClick={() => setSelectedImg(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImg}
              alt="Fullscreen view"
              className="max-h-[90vh] max-w-full object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
