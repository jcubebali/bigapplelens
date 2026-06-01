import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  CreditCard,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const PACKAGES = [
  { id: "express-ts", title: "Express Times Square", price: 249, duration: "30 min" },
  { id: "dumbo-iconic", title: "DUMBO Iconic", price: 399, duration: "60 min" },
  { id: "brooklyn-combo", title: "Brooklyn Combo", price: 549, duration: "90 min" },
  { id: "full-nyc", title: "Full Iconic NYC", price: 799, duration: "2 hours" },
  { id: "engagement", title: "Engagement / Proposal Special", price: 699, duration: "90 min" }
];

interface DateConfig {
  available: boolean;
  slots: string[];
  bookedSlots?: string[];
}

interface AvailabilityData {
  [dateStr: string]: DateConfig;
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const initialPackage = searchParams.get('package') || "dumbo-iconic";

  // Form states
  const [formData, setFormData] = useState({
    packageId: initialPackage,
    people: "1",
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  
  // Selection states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Availability matrices states
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const selectedPkg = PACKAGES.find(p => p.id === formData.packageId) || PACKAGES[1];
  const deposit = selectedPkg.price * 0.5;

  // Retrieve current active availability from node API based on currentMonth range
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsAvailabilityLoading(true);
      try {
        const monthQuery = format(currentMonth, 'yyyy-MM');
        const response = await fetch(`/api/availability?month=${monthQuery}`);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (err) {
        console.error("Failed loading schedule mappings from API", err);
      } finally {
        setIsAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [currentMonth]);

  // Reset selected time when selected date changes
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // If user clicks on a date, we can also fetch/update just for extra safety
    if (date) {
      const formattedMonth = format(date, 'yyyy-MM');
      if (formattedMonth !== format(currentMonth, 'yyyy-MM')) {
        setCurrentMonth(date);
      }
    }
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

      // Save pending booking details to localStorage as fallback UI
      localStorage.setItem('pendingBooking', JSON.stringify({
        sessionId: data.sessionId || "",
        packageName: selectedPkg.title,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        email: formData.email
      }));

      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error: any) {
      toast.error(error.message || 'Failed to process booking', { id: toastId });
      setLoading(false);
    }
  };

  // Determine if a date from react-day-picker is disabled
  const isDateDisabled = (day: Date) => {
    // Disable past dates
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return true;

    const dateStr = format(day, 'yyyy-MM-dd');
    const config = availability[dateStr];
    
    // If there's config for this date, evaluate availability
    if (config) {
      if (!config.available) return true;
      
      const slots = config.slots || [];
      const booked = config.bookedSlots || [];
      
      // If all slots of the day are booked, disable date selection too
      const availableUnbookedCount = slots.filter(s => !booked.includes(s)).length;
      return availableUnbookedCount === 0;
    }
    
    // Fallback default: enable if no mapping found to prevent cold empty screens
    return false;
  };

  // Extract open slots for currently selected date
  const getOpenTimeSlots = () => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const config = availability[dateStr];
    
    if (config) {
      const activeSlots = config.slots || [];
      const booked = config.bookedSlots || [];
      // Tampilkan hanya time slots yang masih tersedia (belum booked)
      return activeSlots.filter(s => !booked.includes(s));
    }

    // Default template slots if no explicit admin configs set
    return ["09:00", "11:00", "14:00", "16:00"];
  };

  const openSlots = getOpenTimeSlots();
  const slotsLeftCount = openSlots.length;

  return (
    <div className="w-full pb-24">
      {/* Header */}
      <div className="bg-[#0A0A0A] py-20 border-b border-[#D4AF37]/20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-5 bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=1200")' }}></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">Secure Your Session</h1>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">Complete the custom scheduling registry below to set your date with BigApple, lock retainer escrow, and claim your NYC shoot.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Step 1: Selection */}
            <section className="bg-[#151515] p-8 border border-white/10 rounded-sm hover:border-[#D4AF37]/30 transition-colors">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3 font-mono">01.</span> Select Your Experience
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Selected Package Type</label>
                  <select 
                    name="packageId"
                    value={formData.packageId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none rounded-sm font-bold text-sm"
                  >
                    {PACKAGES.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#111]">{p.title} (${p.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Number of Guests</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37] w-5 h-5 animate-pulse" />
                    <input 
                      type="number" 
                      name="people"
                      min="1" max="10"
                      value={formData.people}
                      onChange={handleInputChange}
                      required
                      placeholder="Guests count (pax)"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Date & Time with Static Matrix Integrations */}
            <section className="bg-[#151515] p-8 border border-[#D4AF37]/20 rounded-sm">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3 font-mono">02.</span> Availability Calendar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Left pane Calendar picker */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs uppercase tracking-widest text-white/50 font-bold">Select Shoot Date</label>
                    {isAvailabilityLoading && (
                      <span className="flex items-center text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Loading database...
                      </span>
                    )}
                  </div>
                  
                  <style>{`
                    .rdp { --rdp-cell-size: 38px; --rdp-accent-color: #D4AF37; --rdp-background-color: #1A1A1A; margin: 0; }
                    .rdp-day { font-weight: 600; font-size: 13px; }
                    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { color: black !important; background-color: #D4AF37 !important; border-radius: 4px; }
                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #333; }
                    .rdp-day_disabled { text-decoration: line-through; opacity: 0.25; }
                  `}</style>

                  <div className="bg-[#0A0A0A] border border-white/20 p-4 flex justify-center rounded-sm relative">
                    {/* Optional Loading Overlay covering element */}
                    {isAvailabilityLoading && Object.keys(availability).length === 0 && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-2" />
                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-extrabold">Loading Availability Data...</span>
                      </div>
                    )}
                    <DayPicker 
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      onMonthChange={setCurrentMonth}
                      className="bg-transparent"
                    />
                  </div>
                </div>

                {/* Visual Right pane slot selection */}
                <div className="flex flex-col justify-between">
                   <div>
                     <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-4">Available Slots</label>
                     
                     {selectedDate ? (
                       slotsLeftCount === 0 ? (
                         <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-sm text-center">
                           <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                           <p className="text-sm font-bold text-rose-500">Fully booked — choose another date</p>
                           <p className="text-[11px] text-white/50 mt-1 uppercase">All time slots on this day are already reserved.</p>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           {/* Gold Badges indicator of remaining spots */}
                           <div className="flex justify-between items-center bg-[#010101] border border-[#D4AF37]/30 px-3.5 py-2.5 rounded-sm">
                             <span className="text-[11px] font-bold uppercase text-neutral-300">Target Date: {format(selectedDate, 'MMM dd, yyyy')}</span>
                             <span className="text-xs bg-[#D4AF37] text-black font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">{slotsLeftCount} Slots Left</span>
                           </div>

                           <div className="grid grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                             {openSlots.map(time => (
                               <button
                                 key={time}
                                 type="button"
                                 onClick={() => setSelectedTime(time)}
                                 className={`py-3.5 px-2 text-xs font-semibold uppercase tracking-widest border transition-colors rounded-sm ${
                                   selectedTime === time 
                                     ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                                     : 'border-white/20 text-gray-300 hover:border-[#D4AF37] bg-black/40'
                                 }`}
                               >
                                 {time}
                               </button>
                             ))}
                           </div>
                         </div>
                       )
                     ) : (
                       <div className="bg-[#0A0A0A] border border-dashed border-white/10 p-8 rounded-sm text-center h-[200px] flex flex-col items-center justify-center">
                         <Calendar className="w-8 h-8 text-white/20 mb-2 animate-bounce" />
                         <p className="text-xs text-white/40 uppercase tracking-widest font-semibold italic">* Select shoot date to display session slots</p>
                       </div>
                     )}
                   </div>

                   {selectedDate && selectedTime && (
                     <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-between text-xs text-emerald-400">
                       <span className="font-bold uppercase tracking-wider">Scheduled for:</span>
                       <span className="font-black text-white">{selectedTime}</span>
                     </div>
                   )}
                </div>
              </div>
            </section>

            {/* Step 3: Client Info */}
            <section className="bg-[#151515] p-8 border border-white/10 rounded-sm hover:border-[#D4AF37]/30 transition-colors">
              <h2 className="text-2xl font-bold uppercase mb-6 flex items-center">
                <span className="text-[#D4AF37] mr-3 font-mono">03.</span> Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Client Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="jane@example.com"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">WhatsApp or Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Visions, Outfits & Special requests</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-6 text-[#D4AF37] w-5 h-5" />
                    <textarea 
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Share your aesthetic visions, outfit styles, specific locations requested, or details of a surprise proposal proposal setup..."
                      className="w-full bg-[#0A0A0A] border border-white/20 text-white p-4 pl-12 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1C1C1C] border border-[#D4AF37]/50 p-8 sticky top-24 rounded-sm shadow-xl">
              <h3 className="text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/10 pb-4">Invoice Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Selected Tier</span>
                  <span className="font-extrabold text-right max-w-[150px] leading-tight">{selectedPkg.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Duration</span>
                  <span className="font-bold">{selectedPkg.duration}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Date</span>
                    <span className="font-bold text-[#D4AF37]">{format(selectedDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Time Slot</span>
                    <span className="font-bold text-[#D4AF37]">{selectedTime}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Gross Cost</span>
                  <span className="text-lg font-black">${selectedPkg.price}</span>
                </div>
                <div className="flex justify-between items-center text-[#D4AF37] font-black">
                  <span className="text-xs uppercase tracking-widest font-black">Escrow Retainer Due (50%)</span>
                  <span className="text-2xl">${deposit}</span>
                </div>
                <p className="text-[10px] text-white/40 text-right uppercase tracking-widest font-bold">Remaining balance due day of session</p>
              </div>

              <button 
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="w-full bg-[#D4AF37] text-black py-4.5 uppercase font-extrabold tracking-widest hover:bg-[#E8CA6B] transition-transform shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 rounded-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Booking...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Lock Slot via Stripe
                  </>
                )}
              </button>
              
              <p className="flex items-center justify-center text-[10px] text-white/40 mt-5 font-bold uppercase tracking-widest">
                <CreditCard className="w-4 h-4 mr-1.5 text-emerald-400" /> AES-256 Encrypted Gateway
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
