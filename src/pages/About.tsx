import { MapPin, Camera } from 'lucide-react';

export default function About() {
  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] py-20 border-b border-white/10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">About the Lens</h1>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] relative z-10 border border-white/10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1517457210515-586bc1121d10?q=80&w=2070&auto=format&fit=crop" 
                alt="Photographer in NYC" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Design Element */}
            <div className="absolute -bottom-8 -right-8 w-full h-full border-2 border-[#D4AF37] z-0 hidden md:block"></div>
          </div>

          <div>
            <h2 className="text-3xl font-bold uppercase tracking-wide mb-6">Born in the City That <span className="text-[#D4AF37]">Never Sleeps</span></h2>
            
            <div className="space-y-6 text-gray-300 font-light leading-relaxed">
              <p>
                BigApple Lens was founded on a simple principle: your travel memories deserve to look like a cinematic masterpiece, not an awkward selfie. 
              </p>
              <p>
                Based in the heart of Manhattan, we are a collective of luxury lifestyle and editorial photographers who know the streets of New York like the back of our hands. We know what time the light hits the Brooklyn Bridge perfectly, and we know exactly how to avoid the overwhelming crowds in Times Square to make it look like you have the city to yourself.
              </p>
              <p>
                Whether it's a surprise engagement, an anniversary trip, or a solo adventure, we bring high-end fashion magazine quality to everyday travelers. Your New York story is epic—let us capture it that way.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <h4 className="text-4xl font-bold text-[#D4AF37] mb-2">5k+</h4>
                <p className="uppercase text-xs tracking-widest text-gray-400 font-semibold">Sessions Shot</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-[#D4AF37] mb-2">3</h4>
                <p className="uppercase text-xs tracking-widest text-gray-400 font-semibold">Vogue Features</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 bg-[#0F0F0F] py-24 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Camera className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl font-bold uppercase tracking-widest mb-6">Our Gear Philosophy</h2>
          <p className="text-gray-400 leading-relaxed font-light mb-8">
            We shoot exclusively on high-end mirrorless systems with premium G-Master and L-Series prime lenses. What does that mean for you? Glorious bokeh (background blur), tack-sharp focus on your eyes, and stunning low-light performance for those rainy Times Square nights.
          </p>
        </div>
      </div>
    </div>
  );
}
