import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, Plus, ChevronRight, CheckCircle2, Upload, Copy, Check, Landmark, QrCode } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Button } from '../components/Button';
import { format, parse } from 'date-fns';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState('TNG');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Fallback data if context is empty (for preview purposes)
  const serviceName = bookingData.serviceName || '1-Hour Jam';
  const price = bookingData.price || 60;
  const date = bookingData.date || new Date();
  const timeSlot = bookingData.timeSlot || '10:00 AM';

  // Calculate end time based on duration (mock logic)
  const duration = bookingData.duration || 1;
  const endTime = timeSlot; // In a real app, parse time and add duration

  const handlePayment = async () => {
    if (!receiptFile) {
      alert('Please upload your payment receipt to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // 1. Upload Receipt first
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      // 2. Perform Atomic Checkout (Booking + Payment)
      const parsedTime = parse(timeSlot, 'h:mm a', date);
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          start_time: parsedTime.toISOString(),
          duration: duration,
          payment_method: paymentMethod,
          receipt_url: uploadData.receiptUrl
        })
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Checkout failed');

      // 3. Redirect to WhatsApp
      const bookingId = checkoutData.booking.id;
      const message = `Hi Underrated! I just paid RM${(price * duration).toFixed(2)} for a ${duration}-hour session on ${format(date, 'MMM d, yyyy')} at ${timeSlot}. Booking ID: #${bookingId}`;
      const waUrl = `https://wa.me/60123456789?text=${encodeURIComponent(message)}`;

      window.location.href = waUrl;

    } catch (err: any) {
      alert(err.message || 'An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg text-slate-900 mr-8">Checkout</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Booking Summary */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Booking Summary</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.ctfassets.net/anpxw7hl9rcg/4Py2k7OORoqkPqz8UeMlR8/8fc2902a026f0d57cce458669cd6812d/DJ_Ornano_1__1_.png"
                  alt="Studio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded mb-1">Studio A</span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{serviceName}</h3>
                <p className="text-xs text-slate-500">Pro Setup with Pioneer XDJ-XZ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{format(date, 'EEE, MMM d')}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                  <Clock size={18} />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{timeSlot} - {parseInt(timeSlot) + duration}:00 {timeSlot.includes('PM') ? 'PM' : 'AM'}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-slate-500">
                  <CreditCard size={18} />
                  <span className="text-sm font-medium">Rate</span>
                </div>
                <span className="text-sm font-bold text-slate-900">${price.toFixed(2)} / hr</span>
              </div>
            </div>

            <div className="mt-4 bg-slate-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Total Price</span>
              <span className="text-xl font-bold text-indigo-600">RM{(price * duration).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
          </div>

          <div className="space-y-3 mb-6">
            <label
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'TNG'
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="TNG"
                checked={paymentMethod === 'TNG'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-slate-200 rounded flex items-center justify-center bg-white p-1 overflow-hidden shadow-sm">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJRv9LWW3Cb1RBT_nFBdZIRTBCsUEnd01H8A&s" alt="TNG" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Touch 'n Go eWallet</p>
                    <p className="text-xs text-slate-500">Fast & Secure</p>
                  </div>
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER'
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 border border-slate-200 rounded flex items-center justify-center text-yellow-600">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Bank Transfer</p>
                    <p className="text-xs text-slate-500">Maybank, CIMB, etc.</p>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
            <h3 className="font-bold text-slate-800 mb-2">Transfer Instructions</h3>
            {paymentMethod === 'TNG' ? (
              <div className="text-sm text-slate-600">
                Please transfer RM{(price * duration).toFixed(2)} to TnG eWallet:
                <div className="mt-3 mb-4 w-48 h-48 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm overflow-hidden mx-auto">
                  {/* Placeholder for actual QR code */}
                  <div className="text-center text-slate-400 flex flex-col items-center">
                    <QrCode size={48} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">QR Code</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 bg-white p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 text-lg tracking-wide">012-3456789</span>
                  <button
                    onClick={() => handleCopy('0129119936', 'tng')}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-indigo-600"
                    title="Copy number"
                  >
                    {copiedField === 'tng' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-center text-xs mt-2 text-slate-500 font-medium">(Dylan Chow)</p>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Please transfer RM{(price * duration).toFixed(2)} to <strong className="text-slate-900">Maybank Bank</strong>:
                <br />
                <div className="flex items-center gap-2 mt-3 bg-white p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 text-lg tracking-wide">88888888</span>
                  <span className="text-slate-500 text-xs">(Dylan Chow Yu Jun)</span>
                  <button
                    onClick={() => handleCopy('88888888', 'bank')}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-indigo-600 ml-auto"
                    title="Copy account number"
                  >
                    {copiedField === 'bank' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-2">Upload Receipt</h3>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center gap-2 text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <Upload size={24} className="text-indigo-500" />
              <span className="font-bold text-sm">
                {receiptFile ? receiptFile.name : 'Tap to upload receipt'}
              </span>
              <p className="text-xs text-indigo-400">Supported formats: JPG, PNG, PDF</p>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto z-20">
        <div className="flex justify-between items-center mb-4 px-1">
          <p className="text-xs text-slate-500">By paying you agree to our <a href="#" className="text-indigo-600 underline">Terms</a></p>
          <div className="flex items-center gap-1 text-slate-400">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Manual Verification</span>
          </div>
        </div>
        <Button
          className="w-full flex justify-between items-center group"
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
        >
          <span>Confirm & Send Proof</span>
          <div className="flex items-center gap-2">
            <span className="opacity-90 font-normal">RM{(price * duration).toFixed(2)}</span>
            <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={16} />
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
