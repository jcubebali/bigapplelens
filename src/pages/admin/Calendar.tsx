import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowLeft,
  Settings
} from 'lucide-react';

interface DateConfig {
  available: boolean;
  slots: string[];
  bookedSlots?: string[];
}

interface AvailabilityData {
  [dateStr: string]: DateConfig;
}

const ALL_STANDARD_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function CalendarManager() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // States
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bulkDates, setBulkDates] = useState<Date[]>([]);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [isLoading, setIsLoading] = useState(false);

  // Single edit form states
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Bulk edit form states
  const [bulkAvailable, setBulkAvailable] = useState(true);
  const [bulkSelectedSlots, setBulkSelectedSlots] = useState([...ALL_STANDARD_SLOTS]);

  // Auth check
  useEffect(() => {
    const loggedInPrivist = sessionStorage.getItem('admin_logged_in') === 'true';
    const loggedInIsAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (loggedInPrivist || loggedInIsAdmin) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailability();
    }
  }, [isAuthenticated]);

  // Sync edit form with selected date
  useEffect(() => {
    if (selectedDate && Object.keys(availability).length > 0) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const config = availability[dateStr];
      if (config) {
        setIsAvailable(config.available);
        setSelectedSlots(config.slots || []);
        setBookedSlots(config.bookedSlots || []);
      } else {
        // Default new entry
        setIsAvailable(true);
        setSelectedSlots(["09:00", "11:00", "14:00", "16:00"]);
        setBookedSlots([]);
      }
    }
  }, [selectedDate, availability]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      } else {
        toast.error('Failed to load availability catalog.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection issue with database server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2024') {
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      setIsAuthenticated(true);
      toast.success('Access granted.');
    } else {
      toast.error('Password salah!');
    }
  };

  const handleSingleSave = async () => {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setIsLoading(true);
    const id = toast.loading('Saving date configurations...');

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'admin2024'
        },
        body: JSON.stringify({
          date: dateStr,
          available: isAvailable,
          slots: selectedSlots,
          bookedSlots: bookedSlots // Preserve booked slots
        })
      });

      if (response.ok) {
        toast.success(`Successfully saved configurations for ${dateStr}`, { id });
        // Update local state instantly
        setAvailability(prev => ({
          ...prev,
          [dateStr]: {
            available: isAvailable,
            slots: selectedSlots,
            bookedSlots: bookedSlots
          }
        }));
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to save dates.', { id });
      }
    } catch (err) {
      toast.error('Connection error saving to server.', { id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSave = async () => {
    if (bulkDates.length === 0) {
      toast.error('Select at least one date in multiple mode.');
      return;
    }
    setIsLoading(true);
    const id = toast.loading('Applying bulk adjustments...');
    const formattedDates = bulkDates.map(d => format(d, 'yyyy-MM-dd'));

    try {
      const response = await fetch('/api/admin/availability/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'admin2024'
        },
        body: JSON.stringify({
          dates: formattedDates,
          available: bulkAvailable,
          slots: bulkSelectedSlots
        })
      });

      if (response.ok) {
        const resData = await response.json();
        toast.success(`Successfully updated ${resData.updatedCount} dates!`, { id });
        
        // Refresh catalog to see correct layout
        await fetchAvailability();
        setBulkDates([]);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed bulk application.', { id });
      }
    } catch (err) {
      toast.error('Network error during bulk write.', { id });
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier computations for RDP styling
  const availableDates: Date[] = [];
  const partiallyBookedDates: Date[] = [];
  const fullyBookedDates: Date[] = [];
  const offDates: Date[] = [];

  Object.entries(availability).forEach(([dateStr, config]) => {
    try {
      const date = parseISO(dateStr);
      if (!config.available) {
        offDates.push(date);
      } else {
        const activeSlots = config.slots || [];
        const booked = config.bookedSlots || [];
        const bookedAndActiveCount = activeSlots.filter(s => booked.includes(s)).length;

        if (activeSlots.length === 0) {
          offDates.push(date);
        } else if (bookedAndActiveCount === activeSlots.length) {
          fullyBookedDates.push(date);
        } else if (bookedAndActiveCount > 0) {
          partiallyBookedDates.push(date);
        } else {
          availableDates.push(date);
        }
      }
    } catch (_) {
      // Ignore parse failure
    }
  });

  const modifiers = {
    available: availableDates,
    partiallyBooked: partiallyBookedDates,
    fullyBooked: fullyBookedDates,
    off: offDates
  };

  const handleSlotToggle = (slot: string) => {
    if (bookedSlots.includes(slot)) {
      toast.error('Cannot modify/deselect a slot that has been booked by a client.');
      return;
    }
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setSelectedSlots(prev => [...prev, slot]);
    }
  };

  const handleBulkSlotToggle = (slot: string) => {
    if (bulkSelectedSlots.includes(slot)) {
      setBulkSelectedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setBulkSelectedSlots(prev => [...prev, slot]);
    }
  };

  // Password-gate design rendering if unauthorized
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500916434205-0c77489c6211?q=80&w=1000")' }}></div>
        
        <div className="w-full max-w-md bg-[#151515] border border-[#D4AF37]/30 p-8 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#D4AF37]">Calendar Access</h1>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Provide Admin Verification</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-semibold">Enter Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-white/25 text-white p-4 focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm text-center tracking-widest font-bold"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#D4AF37] text-black py-4 uppercase font-bold tracking-widest hover:bg-[#E8CA6B] transition-colors rounded-sm shadow-md"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col md:flex-row">
      <style>{`
        .rdp { --rdp-cell-size: 44px; --rdp-accent-color: #D4AF37; --rdp-background-color: #222; margin: 0; }
        .rdp-day { font-weight: 600; font-size: 14px; position: relative; }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { color: black !important; background-color: #D4AF37 !important; border-radius: 4px; }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(212,175,55,0.1) !important; color: white; }
        
        /* Custom modifier highlight styles */
        .rdp-day_available {
          box-shadow: inset 0 0 0 2px rgba(212, 175, 55, 0.5) !important;
          color: #D4AF37 !important;
        }
        .rdp-day_partiallyBooked {
          box-shadow: inset 0 0 0 2px #f97316 !important;
          color: #f97316 !important;
        }
        .rdp-day_fullyBooked {
          box-shadow: inset 0 0 0 2px #E63939 !important;
          color: #E63939 !important;
          background-color: rgba(230, 57, 57, 0.15) !important;
        }
        .rdp-day_off {
          opacity: 0.35 !important;
          color: #4b5563 !important;
          text-decoration: line-through !important;
        }
      `}</style>

      {/* Sidebar with HQ branding */}
      <aside className="w-full md:w-64 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-[#D4AF37]/20 flex flex-col justify-between py-6 px-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center text-[#0F0F0F] font-bold text-xl">A</div>
            <div>
              <span className="font-bold text-[18px] tracking-tight block leading-none">BIGAPPLE HQ</span>
              <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-semibold mt-0.5 block">Availability Terminal</span>
            </div>
          </div>

          <nav className="space-y-2">
            <Link 
              to="/admin"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors text-left uppercase text-xs tracking-wider text-white/70 hover:bg-white/5 hover:text-white font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="border-t border-white/5 my-6"></div>

            <div className="px-4 py-2">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">Edit Mode</span>
              <div className="flex bg-[#111] p-1 rounded-sm border border-white/10 gap-1">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`flex-1 py-1.5 text-[10px] uppercase font-semibold text-center rounded-sm transition-colors ${
                    mode === 'single' ? 'bg-[#D4AF37] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  onClick={() => setMode('bulk')}
                  className={`flex-1 py-1.5 text-[10px] uppercase font-semibold text-center rounded-sm transition-colors ${
                    mode === 'bulk' ? 'bg-[#D4AF37] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Bulk Mode
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className="p-4 bg-white/5 rounded-sm border border-dashed border-[#D4AF37]/25 text-center">
          <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold">Active Matrix Mode</span>
          <span className="text-xs uppercase font-extrabold text-[#D4AF37] tracking-widest block mt-1">STATIC JSON DATA</span>
        </div>
      </aside>

      {/* Center workspace */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F]">
        
        {/* Header */}
        <header className="h-20 border-b border-[#D4AF37]/10 flex items-center justify-between px-6 lg:px-8 bg-[#0A0A0A]/50 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">Availability Matrix Calendar</h2>
            <p className="text-[11px] text-[#D4AF37] uppercase tracking-widest mt-0.5">Control live spots reserved by user purchases</p>
          </div>
          <div className="none md:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase text-emerald-400 tracking-widest font-bold">Write Sync Ready</span>
          </div>
        </header>

        {/* Content grid */}
        <div className="flex-grow p-6 lg:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section left: Calendar Selector */}
          <div className="lg:col-span-7 bg-[#151515] border border-white/10 p-6 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[15px] font-bold uppercase tracking-wider">
                    {mode === 'single' ? 'Select Date to Overwrite' : 'Select Multiple Dates to Broadcast'}
                  </h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                    {mode === 'single' 
                      ? 'Click on a day in gold, orange, or red to update parameters' 
                      : 'Multiple dates will be configured inside the companion editor'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-sm flex justify-center shadow-inner overflow-x-auto">
                {mode === 'single' ? (
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    className="max-w-[100%]"
                  />
                ) : (
                  <DayPicker
                    mode="multiple"
                    selected={bulkDates}
                    onSelect={(dates) => setBulkDates(dates || [])}
                    modifiers={modifiers}
                    className="max-w-[100%]"
                  />
                )}
              </div>
            </div>

            {/* Color coding legend */}
            <div className="mt-8 border-t border-white/5 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 bg-[#0A0A0A] p-3 border border-white/5 rounded-sm">
                <span className="w-3.5 h-3.5 border-2 border-[#D4AF37] block bg-transparent rounded-sm shadow-sm shrink-0"></span>
                <div className="grid leading-none">
                  <span className="text-[11px] font-extrabold text-[#D4AF37] tracking-[0.5px]">AVAILABLE</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">Open Dates</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-[#0A0A0A] p-3 border border-white/5 rounded-sm">
                <span className="w-3.5 h-3.5 border-2 border-[#f97316] block bg-transparent rounded-sm shadow-sm shrink-0"></span>
                <div className="grid leading-none">
                  <span className="text-[11px] font-extrabold text-[#f97316] tracking-[0.5px]">PARTIAL</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">Partially Fill</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-[#0A0A0A] p-3 border border-white/5 rounded-sm">
                <span className="w-3.5 h-3.5 bg-rose-500/10 border-2 border-rose-500 block rounded-sm shadow-sm shrink-0"></span>
                <div className="grid leading-none">
                  <span className="text-[11px] font-extrabold text-rose-500 tracking-[0.5px]">FULL BOOKED</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">Fully Booked</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-[#0A0A0A] p-3 border border-white/5 rounded-sm">
                <span className="w-3.5 h-3.5 bg-zinc-800 text-zinc-400 block border border-zinc-700/50 rounded-sm shadow-sm shrink-0"></span>
                <div className="grid leading-none">
                  <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.5px]">CLOSED (OFF)</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">Day Off / Holiday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section right: Companion Panel Editor */}
          <div className="lg:col-span-5 bg-[#151515] border border-[#D4AF37]/35 p-6 rounded-sm flex flex-col justify-between">
            {mode === 'single' ? (
              // Case 1: Single date companion editor
              <div className="space-y-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-extrabold block">SINGLE DAY PANEL DESIGNER</span>
                      <h3 className="text-[20px] font-bold mt-1 text-white uppercase tracking-wider">
                        {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'No Date Selected'}
                      </h3>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-6 mt-6">
                      {/* Sub-feature: Toggle status active or off */}
                      <div className="bg-[#0A0A0A] p-4 border border-white/5 rounded-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">Booking Availability</p>
                          <p className="text-[11px] text-white/40 uppercase mt-0.5">Toggle date lock state completely</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAvailable(!isAvailable)}
                          className="focus:outline-none transition-colors"
                        >
                          {isAvailable ? (
                            <ToggleRight className="w-12 h-12 text-[#D4AF37]" />
                          ) : (
                            <ToggleLeft className="w-12 h-12 text-zinc-600" />
                          )}
                        </button>
                      </div>

                      {/* Display checklist slots */}
                      {isAvailable && (
                        <div>
                          <label className="text-[11px] uppercase tracking-widest text-white/50 block font-bold mb-3">Checklist Slots</label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {ALL_STANDARD_SLOTS.map(slot => {
                              const isChecked = selectedSlots.includes(slot);
                              const isBooked = bookedSlots.includes(slot);

                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => handleSlotToggle(slot)}
                                  className={`p-3 border text-xs font-semibold rounded-sm text-left flex items-center justify-between transition-colors ${
                                    isBooked 
                                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 cursor-not-allowed'
                                      : isChecked
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]'
                                        : 'border-white/10 hover:border-[#D4AF37]/50 text-white/60'
                                  }`}
                                >
                                  <span>{slot}</span>

                                  {isBooked ? (
                                    <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 font-bold uppercase rounded-sm">BOOKED</span>
                                  ) : isChecked ? (
                                    <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 font-bold uppercase rounded-sm">OPEN</span>
                                  ) : (
                                    <span className="text-[9px] bg-zinc-800 text-white/40 px-2 py-0.5 font-bold uppercase rounded-sm">OFF</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedDate && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleSingleSave}
                      className="w-full bg-[#D4AF37] text-black py-4 uppercase font-bold tracking-widest hover:bg-[#E8CA6B] transition-all flex items-center justify-center space-x-2 rounded-sm shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Date Overwrite</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Case 2: Bulk date broadcaster
              <div className="space-y-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-extrabold block">BULK SCHEDULER SYSTEM</span>
                      <h3 className="text-[20px] font-bold mt-1 text-white uppercase tracking-wider">
                        {bulkDates.length} Dates Highlighted
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-6 mt-6">
                    {/* Bulk Selection Details */}
                    <div>
                      <label className="text-[11px] uppercase tracking-widest text-white/50 block font-bold mb-2">Target dates</label>
                      <div className="max-h-[100px] overflow-y-auto bg-[#0A0A0A] p-3 rounded-sm border border-white/10 flex flex-wrap gap-1.5">
                        {bulkDates.length === 0 ? (
                          <span className="text-xs text-white/30 italic">Click dates on the calendar to add them to this broadcast pipeline.</span>
                        ) : (
                          bulkDates.map(d => (
                            <span key={d.toString()} className="text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded-sm uppercase">
                              {format(d, 'MMM dd')}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bulk Toggle Status */}
                    <div className="bg-[#0A0A0A] p-4 border border-white/5 rounded-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Broadcast Availability State</p>
                        <p className="text-[11px] text-white/40 uppercase mt-0.5">Toggle state for all targeted dates</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkAvailable(!bulkAvailable)}
                        className="focus:outline-none transition-colors"
                      >
                        {bulkAvailable ? (
                          <ToggleRight className="w-12 h-12 text-[#D4AF37]" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-zinc-600" />
                        )}
                      </button>
                    </div>

                    {/* Bulk slots selection */}
                    {bulkAvailable && (
                      <div>
                        <label className="text-[11px] uppercase tracking-widest text-white/50 block font-bold mb-3">Copy Slots Template</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {ALL_STANDARD_SLOTS.map(slot => {
                            const isChecked = bulkSelectedSlots.includes(slot);

                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleBulkSlotToggle(slot)}
                                className={`p-3 border text-xs font-semibold rounded-sm text-center transition-all ${
                                  isChecked 
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' 
                                    : 'border-white/10 text-white/50 hover:border-white/30'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={bulkDates.length === 0}
                    className="w-full bg-[#D4AF37] text-black py-4 uppercase font-bold tracking-widest hover:bg-[#E8CA6B] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 rounded-sm shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply Adjustments to Selected</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
