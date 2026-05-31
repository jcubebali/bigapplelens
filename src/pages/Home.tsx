import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Clock, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section with Sidebar Packages */}
      <section className="relative min-h-[90vh] flex items-center xl:items-stretch pt-24 pb-12 overflow-hidden">
        {/* Immersive Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-30" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop")' }} />
        <div className="immersive-bg" />
        <div className="manhattan-visual" />
        
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          
          {/* Hero Content */}
          <div className="text-left relative z-10 py-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#D4AF37] uppercase tracking-[4px] text-[14px] font-bold block mb-4">Voted #1 Travel Photographers NYC</span>
              <h1 className="text-6xl md:text-[72px] font-bold tracking-tight mb-5 leading-none">
                Capture Your<br />New York <span className="text-[#D4AF37]">Moment</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[18px] text-white/70 mb-10 max-w-[480px] leading-relaxed font-normal"
            >
              Premium cinematic travel photography in the heart of NYC. Take home memories that look like movie posters.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to="/booking" 
                className="bg-[#E63939] text-white px-10 py-[18px] uppercase font-bold tracking-[1px] hover:-translate-y-0.5 transition-transform shadow-[0_10px_30px_rgba(230,57,57,0.3)] inline-flex items-center gap-3 text-[16px]"
              >
                Book Your Session <span className="text-xl leading-none">&rarr;</span>
              </Link>

              <div className="mt-10 flex gap-[30px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[24px] font-bold leading-none">500+</span>
                  <span className="text-[12px] text-white/50 uppercase tracking-widest">Sessions Completed</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[24px] font-bold leading-none">4.9/5</span>
                  <span className="text-[12px] text-white/50 uppercase tracking-widest">Client Rating</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Packages Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass-panel border-t lg:border-t-0 lg:border-l border-[#D4AF37]/20 p-8 flex flex-col gap-5 h-full relative z-10"
          >
            <div className="mb-2">
              <h3 className="text-[18px] tracking-[1px] uppercase font-bold">Exclusive Packages</h3>
              <p className="text-[12px] text-white/40 mt-1">Transparent pricing. Secure booking.</p>
            </div>

            {/* Package 1 */}
            <Link to="/booking" className="block border border-[#D4AF37]/20 p-5 rounded-sm hover:bg-[#D4AF37]/5 hover:border-[#D4AF37] transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-[16px] text-white group-hover:text-[#D4AF37] transition-colors">Express Times Square</div>
                <div className="text-[#D4AF37] font-bold text-[18px]">$249</div>
              </div>
              <div className="text-[12px] text-white/50 flex gap-[10px] uppercase tracking-wider mb-2">
                <span>30 Min</span><span>•</span><span>15 Edits</span>
              </div>
              <div className="text-[13px] text-white/80 leading-snug">Perfect for quick, iconic neon-lit street style portraits.</div>
            </Link>

            {/* Package 2 */}
            <Link to="/booking" className="block border border-[#D4AF37] bg-[#D4AF37]/10 p-5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-[16px] text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                  DUMBO Iconic 
                  <span className="text-[9px] bg-[#D4AF37] text-black px-1 py-0.5 rounded-sm">POPULAR</span>
                </div>
                <div className="text-[#D4AF37] font-bold text-[18px]">$399</div>
              </div>
              <div className="text-[12px] text-white/50 flex gap-[10px] uppercase tracking-wider mb-2">
                <span>60 Min</span><span>•</span><span>35 Edits</span>
              </div>
              <div className="text-[13px] text-white/80 leading-snug">The Manhattan Bridge view & cobblestone streets of Brooklyn.</div>
            </Link>

            {/* Package 3 */}
            <Link to="/booking" className="block border border-[#D4AF37]/20 p-5 rounded-sm hover:bg-[#D4AF37]/5 hover:border-[#D4AF37] transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-[16px] text-white group-hover:text-[#D4AF37] transition-colors">Brooklyn Bridge Combo</div>
                <div className="text-[#D4AF37] font-bold text-[18px]">$549</div>
              </div>
              <div className="text-[12px] text-white/50 flex gap-[10px] uppercase tracking-wider mb-2">
                <span>90 Min</span><span>•</span><span>50 Edits</span>
              </div>
              <div className="text-[13px] text-white/80 leading-snug">Full scenic walk from the bridge to the waterfront parks.</div>
            </Link>

            <div className="mt-auto p-4 bg-white/5 border border-dashed border-[#D4AF37]/30 rounded-sm text-center text-[11px] text-white/50 uppercase tracking-widest">
              All bookings include high-resolution digital delivery.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4 text-[#D4AF37]">The Luxury Experience</h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">We don't just take photos; we direct your personal NYC movie scene.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Camera, title: "Cinematic Style", desc: "Edited with our signature high-end editorial color grading." },
              { icon: MapPin, title: "Iconic Locations", desc: "We know the best hidden angles in DUMBO, Times Square, and Central Park." },
              { icon: Clock, title: "Fast Delivery", desc: "Get your sneak peeks within 24 hours to share on social media." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center p-8 bg-[#151515] hover:bg-[#1A1A1A] transition-colors border border-white/5"
              >
                <feature.icon className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
                <h3 className="text-xl font-bold uppercase tracking-wide mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Featured Photo Banner */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500916434205-0c77489c6211?q=80&w=2069&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-shadow mb-6">Create Timeless Art</h2>
          <Link to="/gallery" className="bg-white text-black px-8 py-3 uppercase font-bold tracking-widest hover:bg-gray-200 transition">Explore Gallery</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Star className="w-8 h-8 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-2xl font-light italic mb-8 leading-relaxed">
            "The photos came out literally looking like a Vogue editorial. They knew exactly how to pose us and avoided the massive crowds in Times Square. Worth every penny."
          </h2>
          <p className="uppercase tracking-widest font-bold text-sm">— Sarah & Michael, Engagement Shoot</p>
        </div>
      </section>
    </div>
  );
}
