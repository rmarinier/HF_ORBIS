import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup, useAnimation } from 'framer-motion';
import { Sparkles, X, RotateCcw, Send, Mic, Paperclip, CheckCircle, Search, Headset, Phone, MessageSquare, Mail, PhoneForwarded, CalendarClock, ArrowLeft, LifeBuoy, ShoppingCart, PlusCircle, Trash2 } from 'lucide-react';

// Components
import ChatInterface from './components/ChatInterface.jsx';
import { proactiveTriggers } from './data/personas.js';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://www.orange-business.com/be-en/');
  const [cart, setCart] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [flyingOffer, setFlyingOffer] = useState(null);

  const cartRef = useRef(null);
  const chatButtonRef = useRef(null);

  const hasProactiveMessage = !!proactiveTriggers[currentUrl];

  const backgroundImageUrl = useMemo(() => {
    if (currentUrl.includes('workplace-together-webex')) {
      return 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1600';
    }
    return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600';
  }, [currentUrl]);

  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const removeFromCart = (offerId) => {
    setCart(prevCart => prevCart.filter(item => item.offer_id !== offerId));
  };

  return (
    <div 
      className="relative min-h-screen text-white p-8 flex flex-col items-center font-sans transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("${backgroundImageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Flying Offer Animation */}
      <AnimatePresence>
        {flyingOffer && (
          <motion.div
            key={flyingOffer.id}
            className="fixed bg-white border-2 border-orange-400 rounded-lg z-[100] p-3 shadow-2xl overflow-hidden"
            initial={{
              x: flyingOffer.source.x,
              y: flyingOffer.source.y,
              width: flyingOffer.source.width,
              height: flyingOffer.source.height,
              opacity: 1
            }}
            animate={{
              x: flyingOffer.target.x,
              y: flyingOffer.target.y,
              width: 0,
              height: 0,
              scale: 0.2,
              opacity: 0.5
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              mass: 1
            }}
            onAnimationComplete={() => setFlyingOffer(null)}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="relative w-full flex justify-between items-center py-6">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex flex-wrap justify-start gap-4">
              <button
                onClick={() => setCurrentUrl('https://www.orange-business.com/be-en/')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !currentUrl.includes('workplace-together-webex') 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white bg-opacity-20 text-white backdrop-blur-sm'
                }`}
              >
                Page d'accueil
              </button>
              <button
                onClick={() => setCurrentUrl('https://www.orange-business.com/be-en/solutions/collaboration-remote-working/workplace-together-webex')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentUrl.includes('workplace-together-webex') 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white bg-opacity-20 text-white backdrop-blur-sm'
                }`}
              >
                Page Webex
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-end">
            <motion.button
              ref={cartRef}
              onClick={() => setIsCartVisible(!isCartVisible)}
              className="relative p-2 text-gray-200 hover:text-white transition-colors"
              aria-label="Voir le panier"
            >
              <ShoppingCart className="w-7 h-7" />
              {cart.length > 0 && (
                <motion.span
                  layout
                  className="absolute -top-1 -right-1 block h-5 w-5 rounded-full ring-2 ring-gray-100 bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  {cart.length}
                </motion.span>
              )}
            </motion.button>
          </div>
        </header>
      </div>

      {/* Cart Dropdown */}
      <AnimatePresence>
        {isCartVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-24 right-8 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 text-gray-900"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Votre Panier</h3>
              <button
                onClick={() => setIsCartVisible(false)}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Votre panier est vide.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.offer_id} className="flex items-center justify-between text-sm">
                      <span className="flex-1 pr-2">{item.offer_name}</span>
                      <button
                        onClick={() => removeFromCart(item.offer_id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        aria-label="Supprimer l'article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                <button className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                  Passer la commande
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Orange Business</h1>
          <p className="text-xl mb-8">Solutions d'entreprise innovantes</p>
          <button
            onClick={handleOpenChat}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Découvrir nos solutions
          </button>
        </div>
      </div>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <div ref={chatButtonRef} className="relative flex items-center justify-center w-20 h-20">
          {!chatOpen && (
            <div className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-40 animate-ping [animation-duration:2.7s]"></div>
          )}
          <AnimatePresence>
            {hasProactiveMessage && !chatOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"
              />
            )}
          </AnimatePresence>
          <button
            onClick={chatOpen ? handleCloseChat : handleOpenChat}
            className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl transition-all duration-200 ease-in-out transform hover:scale-110"
            aria-label="Toggle GenAI Agent"
          >
            {hasProactiveMessage && !chatOpen && (
              <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-red-500" />
            )}
            {chatOpen ? <X className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
          </button>
        </div>

        {/* Chat Interface */}
        <ChatInterface
          chatOpen={chatOpen}
          onClose={handleCloseChat}
          currentUrl={currentUrl}
          cart={cart}
          setCart={setCart}
          cartRef={cartRef}
          flyingOffer={flyingOffer}
          setFlyingOffer={setFlyingOffer}
        />
      </div>
    </div>
  );
}