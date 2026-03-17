import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, Mic2, Ticket, MapPin, ChevronRight, X, LogOut, KeyRound } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import { Button } from '../components/Button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();
  const [user, setUser] = useState<{ name: string, email: string, bookings?: any[] } | null>(null);

  // Modal States
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [selectedReschedule, setSelectedReschedule] = useState<any | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPastBookingsModalOpen, setIsPastBookingsModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          navigate('/auth');
          return;
        }
        const data = await response.json();

        // Check for changes to trigger Browser Notifications if we already had user data
        if (user && user.bookings) {
          const oldBookings = user.bookings;
          const newBookings = data.user.bookings;

          newBookings.forEach((newBooking: any) => {
            const oldBooking = oldBookings.find((b: any) => b.id === newBooking.id);
            if (oldBooking && oldBooking.status !== newBooking.status) {
              if (newBooking.status === 'CONFIRMED' || newBooking.status === 'CANCELLED') {
                if (Notification.permission === 'granted') {
                  new Notification(`Booking ${newBooking.status}`, {
                    body: `Your booking for ${format(new Date(newBooking.start_time), 'MMM d')} has been ${newBooking.status.toLowerCase()}.`,
                  });
                }
              }
            }
          });
        }

        setUser(data.user);
      } catch (err) {
        // Silently fail polling on network error
      }
    };

    fetchUser();

    // Request permission for Browser Notifications
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Poll every 30 seconds for status updates
    const interval = setInterval(fetchUser, 30000);
    return () => clearInterval(interval);
  }, [navigate]); // Intentionally not including 'user' in dependency array to avoid reset loops, we handle previous state inside fetchUser via functional update or closure if we use a ref. 

  // To fix the closure issue with `user` inside setInterval, let's use a ref.
  const userRef = React.useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Adjust fetchUser definition to use userRef
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();

        const prevUser = userRef.current;
        if (prevUser && prevUser.bookings) {
          data.user.bookings.forEach((newBooking: any) => {
            const oldBooking = prevUser.bookings!.find((b: any) => b.id === newBooking.id);
            if (oldBooking && oldBooking.status !== newBooking.status && (newBooking.status === 'CONFIRMED' || newBooking.status === 'CANCELLED')) {
              if (Notification.permission === 'granted') {
                new Notification(newBooking.status === 'CONFIRMED' ? 'Booking Approved!' : 'Booking Rejected', {
                  body: `Your booking for ${format(new Date(newBooking.start_time), 'MMM d')} has been ${newBooking.status.toLowerCase()}.`,
                  icon: '/favicon.ico'
                });
              }
            }
          });
        }

        setUser(data.user);
      } catch (err) { }
    };

    fetchUser();

    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const interval = setInterval(fetchUser, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  // Return null or loading state while verifying auth
  if (!user) return null;

  const now = new Date();
  const fetchedUpcoming = user.bookings?.filter((b: any) => new Date(b.start_time) >= now) || [];
  const fetchedPast = user.bookings?.filter((b: any) => new Date(b.end_time) < now) || [];

  const mapBooking = (b: any) => ({
    id: b.id.toString(),
    title: b.duration === 1 ? '1-Hour Jam' : '2-Hour Session',
    date: new Date(b.start_time),
    time: `${format(new Date(b.start_time), 'h:mm a')} - ${format(new Date(b.end_time), 'h:mm a')}`,
    location: 'Underrated Studio',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop',
    status: b.status
  });

  const upcomingSessions = fetchedUpcoming.map(mapBooking);
  const pastSessions = fetchedPast.map(mapBooking);

  const totalSessions = user.bookings?.length || 0;
  const totalHours = user.bookings?.reduce((acc: number, b: any) => acc + b.duration, 0) || 0;
  const totalCredits = 0;

  // Calculate exact start of today in Malaysia Time (UTC+8) to filter out old notifications
  const nowMYT = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStartMYT = new Date(Date.UTC(
    nowMYT.getUTCFullYear(),
    nowMYT.getUTCMonth(),
    nowMYT.getUTCDate()
  ));
  todayStartMYT.setUTCHours(-8, 0, 0, 0);

  const recentNotifications = [...upcomingSessions, ...pastSessions]
    .filter((s) => (s.status === 'CONFIRMED' || s.status === 'CANCELLED') && s.date >= todayStartMYT)
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort newest first

  const hasUnreadNotification = recentNotifications.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6 bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer"
            onClick={() => setIsProfileMenuOpen(true)}
          >
            <img src="https://www.freeiconspng.com/thumbs/profile-icon-png/profile-icon-9.png" alt="Profile" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">My Dashboard</h1>
        </div>
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <Bell size={20} className="text-slate-600" />
          {hasUnreadNotification && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Welcome */}
        <div className="p-4 pb-2">
          <p className="text-sm font-medium text-slate-500">Good evening,</p>
          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        </div>

        {/* Stats */}
        <div className="flex gap-3 px-4 pb-6 overflow-x-auto hide-scrollbar">
          <div className="min-w-[100px] flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HOURS</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalHours}</span>
          </div>
          <div className="min-w-[100px] flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Mic2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SESSIONS</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalSessions}</span>
          </div>
          <div className="min-w-[100px] flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Ticket size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CREDITS</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalCredits}</span>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Sessions</h3>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-1/3 h-32 sm:h-auto relative">
                  <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-center shadow-sm">
                    <span className="block text-[10px] font-bold uppercase text-slate-500">{format(session.date, 'MMM')}</span>
                    <span className="block text-lg font-bold text-slate-900 leading-none">{format(session.date, 'd')}</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{session.title}</h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                      <Clock size={14} />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin size={14} />
                      <span>{session.location}</span>
                    </div>
                    <div className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${session.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' :
                      session.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                        'bg-indigo-50 text-indigo-700'
                      }`}>
                      {session.status}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 py-2 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                      onClick={() => setSelectedBookingDetails(session)}
                    >
                      Details
                    </button>
                    <button
                      className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                      onClick={() => setSelectedReschedule(session)}
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Bookings */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Past Bookings</h3>
            {pastSessions.length > 3 && (
              <button
                onClick={() => setIsPastBookingsModalOpen(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                See All
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {pastSessions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No past bookings found.</p>
            ) : pastSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedBookingDetails(session)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 font-bold">
                    <span className="text-[10px] uppercase">{format(session.date, 'MMM')}</span>
                    <span className="text-lg text-slate-700">{format(session.date, 'd')}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{session.title}</h4>
                    <p className="text-xs text-slate-500">{session.time} • {session.location}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {/* Profile Menu Modal */}
      {isProfileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsProfileMenuOpen(false)}>
          <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 shadow-xl transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Profile Settings</h3>
              <button onClick={() => setIsProfileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-indigo-50 text-indigo-700 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <span className="font-bold">Reset Password</span>
                </div>
                <ChevronRight size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <LogOut size={18} />
                  </div>
                  <span className="font-bold">Logout</span>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedBookingDetails(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Booking Details</h3>
              <button onClick={() => setSelectedBookingDetails(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={selectedBookingDetails.image} alt="Studio" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedBookingDetails.title}</h4>
                  <p className="text-xs text-slate-500">{selectedBookingDetails.location}</p>
                </div>
              </div>

              <div className="space-y-3 py-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-slate-900">{format(selectedBookingDetails.date, 'EEEE, MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Time</span>
                  <span className="font-bold text-slate-900">{selectedBookingDetails.time}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs ${selectedBookingDetails.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    selectedBookingDetails.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                    {selectedBookingDetails.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Booking ID</span>
                  <span className="font-mono font-bold text-slate-900">#{selectedBookingDetails.id}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => setSelectedBookingDetails(null)}>Close</Button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedReschedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedReschedule(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Notice</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                To reschedule your {selectedReschedule.title} on {format(selectedReschedule.date, 'MMM d')}, please contact support via WhatsApp. We require 24 hours notice for rescheduling.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedReschedule(null)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => {
                  window.location.href = `https://wa.me/60129119936?text=${encodeURIComponent(`Hi, I would like to reschedule my booking #${selectedReschedule.id}.`)}`;
                }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsNotificationModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
              <button onClick={() => setIsNotificationModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>

            {hasUnreadNotification ? (
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto hide-scrollbar pr-2">
                {recentNotifications.map(notification => (
                  notification.status === 'CONFIRMED' ? (
                    <div key={notification.id} className="bg-green-50 rounded-2xl p-4 border border-green-100 flex gap-4 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 mt-1">
                        <Bell size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Booking Approved!</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Admin has approved your {notification.title} booking on {format(notification.date, 'MMM d')}. See you at the studio!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={notification.id} className="bg-red-50 rounded-2xl p-4 border border-red-100 flex gap-4 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-1">
                        <X size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Booking Rejected</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Unfortunately, your {notification.title} booking on {format(notification.date, 'MMM d')} has been rejected by the admin. Please contact support.
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} />
                </div>
                <p className="text-sm text-slate-500">No new notifications.</p>
              </div>
            )}
            <Button className="w-full mt-6" onClick={() => setIsNotificationModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* All Past Bookings Modal */}
      {isPastBookingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsPastBookingsModalOpen(false)}>
          <div className="bg-white w-full sm:max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-slate-900">All Past Bookings</h3>
              <button onClick={() => setIsPastBookingsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedBookingDetails(session)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 font-bold">
                      <span className="text-[10px] uppercase">{format(session.date, 'MMM')}</span>
                      <span className="text-lg text-slate-700">{format(session.date, 'd')}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{session.title}</h4>
                      <p className="text-xs text-slate-500">{session.time} • {session.location}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
