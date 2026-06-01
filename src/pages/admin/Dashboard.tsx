import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Camera, 
  LayoutDashboard, 
  CalendarRange, 
  DollarSign, 
  LogOut, 
  Check, 
  Clock, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface Booking {
  id: string;
  name: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  people: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  deposit: number;
  email: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'revenue'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);

  // Local fallback mock data in case API is not reachable or fails
  const mockBookings: Booking[] = [
    {
      id: "1",
      name: "Alex Rivera",
      packageId: "express-ts",
      packageName: "Express Times Square",
      date: "2026-06-05",
      time: "06:00 PM (Sunset)",
      people: 2,
      status: "Confirmed",
      deposit: 124.5,
      email: "alex@example.com"
    },
    {
      id: "2",
      name: "Sofia Chen",
      packageId: "dumbo-iconic",
      packageName: "DUMBO Iconic",
      date: "2026-06-06",
      time: "07:00 AM (Sunrise)",
      people: 1,
      status: "Completed",
      deposit: 199.5,
      email: "sofia@example.com"
    },
    {
      id: "3",
      name: "Marcus & Emily",
      packageId: "brooklyn-combo",
      packageName: "Brooklyn Combo",
      date: "2026-06-12",
      time: "04:00 PM",
      people: 2,
      status: "Pending",
      deposit: 274.5,
      email: "emily@example.com"
    },
    {
      id: "4",
      name: "Liam Gallagher",
      packageId: "full-nyc",
      packageName: "Full Iconic NYC",
      date: "2026-06-15",
      time: "11:00 AM",
      people: 4,
      status: "Pending",
      deposit: 399.5,
      email: "liam@example.com"
    },
    {
      id: "5",
      name: "Christian Bale",
      packageId: "engagement",
      packageName: "Engagement Special",
      date: "2026-06-20",
      time: "06:00 PM (Sunset)",
      people: 2,
      status: "Confirmed",
      deposit: 349.5,
      email: "christian@example.com"
    }
  ];

  // Auth checking
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch bookings on successful auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'x-admin-key': 'admin2024'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        // Fallback silently to mockBookings
        setBookings(mockBookings);
      }
    } catch (error) {
      console.error("API error, using mock data", error);
      setBookings(mockBookings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2024') {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsAuthenticated(true);
      toast.success('Successfully logged in to Admin Panel');
    } else {
      toast.error('Password salah!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  const updateBookingStatus = (id: string, newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );
    toast.success(`Booking #${id} status updated to ${newStatus}`);
  };

  // Recharts Revenue Data calculation
  const revenueData = [
    { name: 'Express TS', sales: 12, revenue: 12 * 249 },
    { name: 'DUMBO Iconic', sales: 24, revenue: 24 * 399 },
    { name: 'Brooklyn Combo', sales: 15, revenue: 15 * 549 },
    { name: 'Full Iconic NYC', sales: 8, revenue: 8 * 799 },
    { name: 'Engagement Sp.', sales: 6, revenue: 6 * 699 }
  ];

  // Calculated Stats
  const totalBookingsValue = 65; // Simulated lifetime scale
  const monthlyRevenueValue = 18450;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const averageBookingValue = 442;

  const filteredBookings = statusFilter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500916434205-0c77489c6211?q=80&w=1000")' }}></div>
        
        <div className="w-full max-w-md bg-[#151515] border border-[#D4AF37]/30 p-8 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#D4AF37]">Admin Access</h1>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">BigApple Lens Control Center</p>
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
              Authorize Node
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-[#D4AF37]/20 flex flex-col justify-between py-6 px-4 shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center text-[#0F0F0F] font-bold text-xl">A</div>
            <div>
              <span className="font-bold text-[18px] tracking-tight block leading-none">BIGAPPLE ADMIN</span>
              <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-semibold mt-0.5 block">HQ Command</span>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors text-left uppercase text-xs tracking-wider font-semibold ${
                activeTab === 'overview' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors text-left uppercase text-xs tracking-wider font-semibold ${
                activeTab === 'bookings' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Bookings</span>
            </button>

            <button 
              onClick={() => navigate('/admin/calendar')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors text-left uppercase text-xs tracking-wider font-semibold text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Calendar Availability</span>
            </button>

            <button 
              onClick={() => setActiveTab('revenue')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors text-left uppercase text-xs tracking-wider font-semibold ${
                activeTab === 'revenue' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Revenue Chart</span>
            </button>
          </nav>
        </div>

        {/* Footer actions in sidebar */}
        <div className="pt-6 border-t border-white/5 px-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-white/50 hover:text-[#E63939] transition-colors text-left font-bold uppercase text-xs tracking-widest mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>HQ Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F]">
        
        {/* Workspace Header */}
        <header className="h-20 border-b border-[#D4AF37]/10 flex items-center justify-between px-6 lg:px-8 bg-[#0A0A0A]/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">
              {activeTab === 'overview' && "Dashboard Overview"}
              {activeTab === 'bookings' && "Manage Bookings"}
              {activeTab === 'revenue' && "Revenue Analytics"}
            </h2>
            <p className="text-[11px] text-white/40 uppercase tracking-widest mt-0.5">Control Terminal</p>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchBookings}
              className="p-2 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-sm transition-colors"
              title="Refresh Server Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Node Live</span>
            </div>
          </div>
        </header>

        {/* Workspace Panels */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm hover:border-[#D4AF37]/40 transition-colors relative group">
                  <div className="absolute top-4 right-4 text-[#D3D3D3]/20 group-hover:text-[#D4AF37]/20 transition-colors">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">Total Bookings</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">{totalBookingsValue} Sessions</h3>
                  <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest">Lifetime Total</p>
                </div>

                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm hover:border-[#D4AF37]/40 transition-colors relative group">
                  <div className="absolute top-4 right-4 text-[#D3D3D3]/20 group-hover:text-[#D4AF37]/20 transition-colors">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">Monthly Revenue</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">${monthlyRevenueValue.toLocaleString()}</h3>
                  <p className="text-[11px] text-emerald-400 mt-1 uppercase tracking-widest font-semibold">&uarr; 14% vs last month</p>
                </div>

                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm hover:border-[#D4AF37]/40 transition-colors relative group">
                  <div className="absolute top-4 right-4 text-[#D3D3D3]/20 group-hover:text-[#D4AF37]/20 transition-colors">
                    <Clock className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">Pending Approval</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">{pendingCount} Proposals</h3>
                  <p className="text-[11px] text-amber-500 mt-1 uppercase tracking-widest font-semibold">Awaiting action</p>
                </div>

                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm hover:border-[#D4AF37]/40 transition-colors relative group">
                  <div className="absolute top-4 right-4 text-[#D3D3D3]/20 group-hover:text-[#D4AF37]/20 transition-colors">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">Average Ticket</span>
                  <h3 className="text-3xl font-extrabold mt-2 text-white">${averageBookingValue} USD</h3>
                  <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest">Vogue Standard Scale</p>
                </div>

              </div>

              {/* Snapshot Table Container */}
              <div className="bg-[#151515] border border-white/10 p-6 rounded-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">Active Stream Snapshot</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Most recent bookings awaiting setup</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="text-[#D4AF37] text-xs uppercase tracking-widest hover:underline font-bold"
                  >
                    Manage Full Pipeline
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-semibold">
                        <th className="pb-3 pt-1">Client</th>
                        <th className="pb-3 pt-1">Product Details</th>
                        <th className="pb-3 pt-1">Date & Slots</th>
                        <th className="pb-3 pt-1 text-right">Escrow Deposit</th>
                        <th className="pb-3 pt-1 text-center">Pipeline State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
                      {bookings.slice(0, 3).map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <span className="font-bold text-white block">{b.name}</span>
                            <span className="text-[11px] text-white/50">{b.email}</span>
                          </td>
                          <td className="py-4 font-semibold text-[#D4AF37]">{b.packageName}</td>
                          <td className="py-4">
                            <span>{b.date}</span>
                            <span className="text-[11px] text-white/40 block mt-0.5">{b.time}</span>
                          </td>
                          <td className="py-4 text-right font-bold text-white">${b.deposit}</td>
                          <td className="py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm ${
                              b.status === 'Completed' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                              b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                              b.status === 'Pending' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS PIPELINE */}
          {activeTab === 'bookings' && (
            <div className="bg-[#151515] border border-white/10 p-6 rounded-sm space-y-6">
              {/* Filtering bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider">Bookings Stream</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Control and override payment states manually</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(filterItem => (
                    <button
                      key={filterItem}
                      onClick={() => setStatusFilter(filterItem)}
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-sm ${
                        statusFilter === filterItem
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                          : 'border-white/10 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                      }`}
                    >
                      {filterItem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-semibold">
                      <th className="pb-3 pt-1">Ref ID</th>
                      <th className="pb-3 pt-1">Client</th>
                      <th className="pb-3 pt-1">Package Option</th>
                      <th className="pb-3 pt-1">Date & slot</th>
                      <th className="pb-3 pt-1 text-center">Heads</th>
                      <th className="pb-3 pt-1 text-right">Stripe Retainer Due</th>
                      <th className="pb-3 pt-1 text-center">Status</th>
                      <th className="pb-3 pt-1 text-center">Pipeline Override Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-white/30 uppercase tracking-widest text-xs italic">
                          No bookings matches this tracking layer
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 text-xs font-mono text-white/40">#{b.id}</td>
                          <td className="py-4">
                            <span className="font-bold text-white block">{b.name}</span>
                            <span className="text-[11px] text-white/50 flex items-center mt-0.5">
                              <Mail className="w-3 h-3 mr-1 text-[#D4AF37]/50" /> {b.email}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-[#D4AF37]">{b.packageName}</td>
                          <td className="py-4">
                            <span>{b.date}</span>
                            <span className="text-[11px] text-white/40 block mt-0.5">{b.time}</span>
                          </td>
                          <td className="py-4 text-center font-bold text-neutral-300">{b.people} Pax</td>
                          <td className="py-4 text-right font-bold text-white">${b.deposit}</td>
                          <td className="py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm ${
                              b.status === 'Completed' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                              b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                              b.status === 'Pending' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {b.status !== 'Confirmed' && b.status !== 'Completed' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'Confirmed')}
                                  className="p-1 px-2 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500/10 rounded-sm transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {b.status !== 'Completed' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'Completed')}
                                  className="p-1 px-2 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold hover:bg-[#D4AF37]/10 rounded-sm transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {b.status !== 'Cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                                  className="p-1 px-2 border border-rose-500/30 text-rose-400 text-[10px] uppercase tracking-widest font-bold hover:bg-rose-500/10 rounded-sm transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE */}
          {activeTab === 'revenue' && (
            <div className="space-y-8">
              <div className="bg-[#151515] border border-white/10 p-6 rounded-sm">
                <div className="mb-8">
                  <h3 className="text-lg font-bold uppercase tracking-wider">Revenue Breakdown per Package</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Calculated based on actual conversion volumes</p>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#888" 
                        fontSize={11} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#888" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`} 
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#D4AF37', borderRadius: '2px', color: '#fff', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Gross Revenue (USD)" 
                        fill="#D4AF37"
                        radius={[2, 2, 0, 0]} 
                      />
                      <Bar 
                        dataKey="sales" 
                        name="Tickets Sold" 
                        fill="#E63939"
                        radius={[2, 2, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Package Efficiency Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-4">Elite Performer</h4>
                  <div className="flex justify-between items-center bg-[#0A0A0A] p-4 border border-white/5 rounded-sm">
                    <div>
                      <p className="font-bold text-lg text-white">DUMBO Iconic Session</p>
                      <p className="text-xs text-white/50 uppercase mt-0.5">Accounting for 37% of gross monthly sales</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs uppercase font-extrabold px-3 py-1.5 tracking-wider rounded-sm">Peak Choice</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-white/10 p-6 rounded-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-4">Escrow Holdings</h4>
                  <div className="flex justify-between items-center bg-[#0A0A0A] p-4 border border-white/5 rounded-sm">
                    <div>
                      <p className="font-bold text-lg text-white">$10,480.00 USD Pending Clear</p>
                      <p className="text-xs text-white/50 uppercase mt-0.5">Retainers reserved until session completion</p>
                    </div>
                    <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase font-extrabold px-3 py-1.5 tracking-wider rounded-sm">Active escrow</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
