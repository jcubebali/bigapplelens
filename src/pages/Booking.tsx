import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Calendar, Clock, Users, Mail, Phone, User, FileText, CreditCard } from 'lucide-react';

const PACKAGES = [
  { id: "express-ts", title: "Express Times Square", price: 249, duration: "30 min" },
  { id: "dumbo-iconic", title: "DUMBO Iconic", price: 399, duration: "60 min" },
  { id: "brooklyn-combo", title: "Brooklyn Combo", price: 549, duration: "90 min" },
  { id: "full-nyc", title: "Full Iconic NYC", price: 799, duration: "2 hours" },
  { id: "engagement", title: "Engagement / Proposal Special", price: 699, duration: "90 min" }
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const initialPackage = searchParams.get('package') || "dumbo-iconic";

  const [formData, setFormData] = useState({
    packageId: initialPackage,
    people: "1",
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPkg = PACKAGES.find(p => p.id === formData.packageId) || PACKAGES[1];
  const deposit = selectedPkg.price * 0.5;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Preparing secure checkout...');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          packageName: selectedPkg.title,
          price: selectedPkg.price,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          people: formData.people,
          name: formData.name,
          email: formData.email,
          notes: formData.notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error: any) {
      toast.error(error.message || 'Failed to process booking', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] py-20 border-b border-white/10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">Secure Your Date</h1>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto">Complete the form below to initiate your 50% retainer deposit and lock in our calendar.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Step 1: Selection */}
            <section className="bg-[#151515] p-8 border border-white/10">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3">01.</span> Package Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">Select Package</label>
                  <select 
                    name="packageId"
                    value={formData.packageId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none"
                  >
                    {PACKAGES.map(p => (
                      <option key={p.id} value={p.id}>{p.title} - ${p.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">Number of People</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="number" 
                      name="people"
                      min="1" max="10"
                      value={formData.people}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Date & Time */}
            <section className="bg-[#151515] p-8 border border-white/10">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3">02.</span> Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-4">Select Date</label>
                  <style>{`
                    .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #D4AF37; --rdp-background-color: #1A1A1A; margin: 0; }
                    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { color: black; background-color: #D4AF37; }
                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #333; }
                  `}</style>
                  <div className="bg-[#0A0A0A] border border-white/20 p-4 flex justify-center">
                    <DayPicker 
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date() }}
                      className="bg-transparent"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-4">Select Time</label>
                   <div className="grid grid-cols-2 gap-3">
                     {['07:00 AM (Sunrise)', '09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM (Sunset)'].map(time => (
                       <button
                         key={time}
                         type="button"
                         onClick={() => setSelectedTime(time)}
                         className={`py-3 px-2 text-xs font-semibold uppercase tracking-widest border transition-colors ${
                           selectedTime === time 
                             ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                             : 'border-white/20 text-gray-300 hover:border-[#D4AF37]'
                         }`}
                       >
                         {time}
                       </button>
                     ))}
                   </div>
                   {!selectedDate && <p className="text-sm text-[#D4AF37] mt-4 italic">* Choose a date first</p>}
                </div>
              </div>
            </section>

            {/* Step 3: Client Info */}
            <section className="bg-[#151515] p-8 border border-white/10">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3">03.</span> Client Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="jane@example.com"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">WhatsApp / Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">Vision / Special Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-6 text-gray-500 w-5 h-5" />
                    <textarea 
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about the vibe you want, specific locations, or if this is a surprise proposal..."
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1C1C1C] border border-[#D4AF37]/50 p-8 sticky top-24">
              <h3 className="text-xl font-bold uppercase mb-6 tracking-wide border-b border-white/10 pb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Package</span>
                  <span className="font-semibold text-right max-w-[150px]">{selectedPkg.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Duration</span>
                  <span className="font-semibold">{selectedPkg.duration}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Date</span>
                    <span className="font-semibold">{format(selectedDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Time</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-semibold">Total Price</span>
                  <span className="text-xl">${selectedPkg.price}</span>
                </div>
                <div className="flex justify-between items-center text-[#D4AF37] font-bold">
                  <span>Retainer Due Now (50%)</span>
                  <span className="text-2xl">${deposit}</span>
                </div>
                <p className="text-xs text-gray-500 text-right italic">Balance due day of shoot</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-black py-4 uppercase font-bold tracking-widest hover:bg-[#E8CA6B] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Deposit via Stripe
                  </>
                )}
              </button>
              
              <p className="flex items-center justify-center text-xs text-gray-500 mt-4 font-semibold uppercase tracking-wider">
                <CreditCard className="w-4 h-4 mr-1" /> Secure Payment
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
