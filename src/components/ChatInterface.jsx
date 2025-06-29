import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup, useAnimation } from 'framer-motion';
import { 
  X, RotateCcw, Send, Mic, Paperclip, CheckCircle, Search, 
  Headset, Phone, MessageSquare, Mail, PhoneForwarded, 
  CalendarClock, ArrowLeft, LifeBuoy, ShoppingCart, 
  PlusCircle, Trash2, Sparkles 
} from 'lucide-react';

import LanguageFlag from './LanguageFlag.jsx';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import VoiceSearchSimulation from './VoiceSearchSimulation.jsx';
import { offers, proServicesProduct } from '../data/offers.js';
import { parseFaqCsv, knowledgeBase } from '../data/faq.js';
import { translations } from '../data/translations.js';
import { personas, proactiveTriggers } from '../data/personas.js';
import { generateInitialKeywords, getAvailableKeywords } from '../utils/keywordUtils.js';

// Assistant intelligent interne pour Alex
function generateAlexResponse(userMessage, offer, T) {
  const message = userMessage.toLowerCase();
  
  // Détection d'intention d'achat
  if (message.includes('acheter') || message.includes('commander') || message.includes('panier') || 
      message.includes('buy') || message.includes('purchase') || message.includes('order')) {
    return {
      action: 'add_to_cart',
      response: `Excellente décision ! J'ajoute immédiatement "${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}" à votre panier.`,
      suggested_actions: []
    };
  }
  
  // Détection de demande de contact
  if (message.includes('conseiller') || message.includes('expert') || message.includes('contact') || 
      message.includes('parler') || message.includes('advisor') || message.includes('speak')) {
    return {
      action: 'contact_advisor',
      response: "Bien sûr ! Je vous mets en relation avec un conseiller qui aura tout le contexte pour vous aider au mieux.",
      suggested_actions: []
    };
  }
  
  // Questions sur les prix
  if (message.includes('prix') || message.includes('coût') || message.includes('tarif') || 
      message.includes('price') || message.includes('cost')) {
    return {
      action: 'answer',
      response: `Les tarifs de **${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}** dépendent de vos besoins spécifiques. Nos conseillers peuvent vous proposer un devis personnalisé adapté à votre infrastructure.`,
      suggested_actions: [T.ui_add_to_cart, T.ui_contact_an_expert]
    };
  }
  
  // Questions techniques
  if (message.includes('technique') || message.includes('prérequis') || message.includes('installation') ||
      message.includes('technical') || message.includes('requirements') || message.includes('setup')) {
    return {
      action: 'answer',
      response: `Pour **${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}**, nos équipes techniques s'occupent de l'installation et de la configuration. Nous analysons d'abord votre infrastructure existante pour garantir une intégration optimale.`,
      suggested_actions: [T.ui_add_to_cart, T.ui_contact_an_expert]
    };
  }
  
  // Questions sur les délais
  if (message.includes('délai') || message.includes('temps') || message.includes('rapidement') ||
      message.includes('timeline') || message.includes('quickly') || message.includes('when')) {
    return {
      action: 'answer',
      response: `Le déploiement de **${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}** prend généralement entre 2 à 4 semaines selon la complexité de votre environnement. Nous vous accompagnons à chaque étape.`,
      suggested_actions: [T.ui_add_to_cart, T.ui_contact_an_expert]
    };
  }
  
  // Questions sur les avantages
  if (message.includes('avantage') || message.includes('bénéfice') || message.includes('pourquoi') ||
      message.includes('benefit') || message.includes('advantage') || message.includes('why')) {
    return {
      action: 'answer',
      response: `**${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}** vous apporte :\n\n- **Simplicité** : Gestion centralisée et intuitive\n- **Sécurité** : Protection avancée intégrée\n- **Évolutivité** : S'adapte à la croissance de votre entreprise\n- **Support** : Accompagnement expert Orange Business`,
      suggested_actions: [T.ui_add_to_cart, T.ui_contact_an_expert]
    };
  }
  
  // Réponse générale
  return {
    action: 'answer',
    response: `Je serais ravi de vous aider avec **${(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}**. Cette solution est conçue pour répondre aux besoins des entreprises modernes avec une approche simple et sécurisée.`,
    suggested_actions: [T.ui_add_to_cart, T.ui_contact_an_expert]
  };
}

// Assistant intelligent interne pour FAQ
function generateFaqResponse(userMessage, faqData) {
  const message = userMessage.toLowerCase();
  
  // Recherche dans la base de connaissances
  const relevantFaq = faqData.find(item => {
    const title = item['Titre_Fiche_Question_FAQ']?.toLowerCase() || '';
    const problem = item['Problème_Résolu']?.toLowerCase() || '';
    const solution = item['Solution_Proposée']?.toLowerCase() || '';
    
    // Recherche de mots-clés dans la question
    const keywords = message.split(' ').filter(word => word.length > 3);
    return keywords.some(keyword => 
      title.includes(keyword) || problem.includes(keyword) || solution.includes(keyword)
    );
  });
  
  if (relevantFaq) {
    const title = relevantFaq['Titre_Fiche_Question_FAQ'];
    const solution = relevantFaq['Solution_Proposée'];
    const url = relevantFaq['URL_Directe'];
    
    return `${solution}\n\nPour plus d'informations, consultez : [${title}](${url})`;
  }
  
  // Questions fréquentes par catégorie
  if (message.includes('mot de passe') || message.includes('password')) {
    return "Pour modifier votre mot de passe oublié, vous pouvez utiliser la procédure de réinitialisation par email et SMS depuis la page de connexion.\n\nPour plus d'informations, consultez : [Modifier son mot de passe oublié](https://assistance.orange-business.com/espace-client/modifier-son-mot-de-passe-oublie)";
  }
  
  if (message.includes('compte') || message.includes('utilisateur') || message.includes('account')) {
    return "Pour créer un compte sur l'Espace Client Entreprise, vous devez suivre les étapes complètes de création avec un numéro SIRET valide.\n\nPour plus d'informations, consultez : [Créer son compte sur l'Espace Client Entreprise](https://assistance.orange-business.com/espace-client/creer-son-compte-sur-lespace-client-entreprise)";
  }
  
  if (message.includes('mobile') || message.includes('ligne') || message.includes('sim')) {
    return "Pour suivre la consommation d'une ligne mobile, vous pouvez accéder aux informations via l'espace client dans la section Gestion Lignes Mobiles.\n\nPour plus d'informations, consultez : [Suivre la consommation d'une ligne mobile](https://assistance.orange-business.com/mobile/suivre-la-consommation-dune-ligne-mobile)";
  }
  
  if (message.includes('facture') || message.includes('facturation') || message.includes('bill')) {
    return "Pour obtenir une facture mobile détaillée, vous pouvez la télécharger directement depuis votre espace client dans la section facturation.\n\nPour plus d'informations, consultez : [Obtenir facture mobile détaillée](https://assistance.orange-business.com/mobile/obtenir-facture-mobile-detaillee)";
  }
  
  if (message.includes('dns') || message.includes('domaine') || message.includes('domain')) {
    return "Pour ajouter un enregistrement DNS, vous pouvez utiliser l'interface de gestion DNS disponible dans votre espace client.\n\nPour plus d'informations, consultez : [Ajouter un enregistrement A](https://assistance.orange-business.com/internet-reseau/ajouter-enregistrement-A)";
  }
  
  if (message.includes('sécurité') || message.includes('phishing') || message.includes('security')) {
    return "Le phishing est une technique d'hameçonnage visant à récupérer vos données personnelles. Il est important de vérifier l'expéditeur et les liens avant de cliquer.\n\nPour plus d'informations, consultez : [Qu'est-ce que le phishing ?](https://assistance.orange-business.com/securite/phishing-definition)";
  }
  
  if (message.includes('incident') || message.includes('panne') || message.includes('problème')) {
    return "Pour déclarer un incident, vous pouvez utiliser le lien de déclaration d'incident depuis le menu incident de votre espace client.\n\nPour plus d'informations, consultez : [Saisir un incident Fixe](https://assistance.orange-business.com/internet-reseau/declarer-incident-fixe)";
  }
  
  // Réponse par défaut
  return null;
}

// Génération de questions suggérées pour les offres
function generateSuggestedQuestions(offer) {
  const questions = [
    "Quels sont les prérequis techniques ?",
    "Combien coûte cette solution ?",
    "Quel est le délai de mise en œuvre ?",
    "Quels sont les avantages principaux ?",
    "Comment se déroule l'installation ?",
    "Quel support est inclus ?",
    "Cette solution est-elle évolutive ?",
    "Quelles sont les options de personnalisation ?"
  ];
  
  // Sélection aléatoire de 3 questions
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export default function ChatInterface({ 
  chatOpen, 
  onClose, 
  currentUrl, 
  cart, 
  setCart, 
  cartRef, 
  flyingOffer, 
  setFlyingOffer 
}) {
  const [selected, setSelected] = useState([]);
  const [language, setLanguage] = useState("fr");
  const [initialKeywords, setInitialKeywords] = useState([]);
  const [activePersonaKey, setActivePersonaKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('initial');
  const [hasProactiveMessage, setHasProactiveMessage] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeOfferForChat, setActiveOfferForChat] = useState(null);
  const [offerChatHistory, setOfferChatHistory] = useState([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [proServicesPromptOffer, setProServicesPromptOffer] = useState(null);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [faqChatHistory, setFaqChatHistory] = useState([]);
  const [isFaqAgentTyping, setIsFaqAgentTyping] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faqPrompts, setFaqPrompts] = useState([]);

  const chatButtonRef = useRef(null);
  const cartControls = useAnimation();
  const prevCartLength = useRef(cart.length);

  const allLanguages = ['fr', 'en'];

  useEffect(() => {
    setFaqData(parseFaqCsv(knowledgeBase));
  }, []);

  const refreshFaqPrompts = () => {
    if (faqData.length === 0) return;
    const shuffled = [...faqData].sort(() => 0.5 - Math.random());
    setFaqPrompts(shuffled.slice(0, 4).map(item => item['Titre_Fiche_Question_FAQ']));
  };

  useEffect(() => {
    if (currentView === 'faq' && faqChatHistory.length === 0) {
      refreshFaqPrompts();
    }
  }, [currentView, faqData, faqChatHistory]);

  useEffect(() => {
    if (chatOpen && initialKeywords.length === 0) {
      setInitialKeywords(generateInitialKeywords(3));
    }
  }, [chatOpen, initialKeywords]);

  useEffect(() => {
    setHasProactiveMessage(!!proactiveTriggers[currentUrl]);
  }, [currentUrl]);

  useEffect(() => {
    if (cart.length > prevCartLength.current) {
      cartControls.start({
        scale: [1, 1.3, 1],
        rotate: [0, -10, 10, -10, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
    prevCartLength.current = cart.length;
  }, [cart.length, cartControls]);

  useEffect(() => {
    if (currentView !== 'offer_chat' && currentView !== 'faq') {
      if (selected.length > 0 && currentView === 'initial') {
        setCurrentView('refinement');
      } else if (selected.length === 0 && currentView === 'refinement') {
        setCurrentView('initial');
      }
    }
  }, [selected, currentView]);

  const T = translations[language] || translations.en;
  const filteredOffers = useMemo(() => 
    selected.length ? offers.filter((offer) => 
      selected.every((kw) => offer.associated_keywords.includes(kw))
    ) : [], 
    [selected]
  );
  const availableKeywords = useMemo(() => getAvailableKeywords(selected, offers), [selected]);
  const sortedSelected = useMemo(() => 
    [...selected].sort((a, b) => (T[a] || a).localeCompare(T[b] || b, language)), 
    [selected, language, T]
  );

  const handleVoiceSearchComplete = (keywords, persona) => {
    handleReset();
    setActivePersonaKey(persona);
    setSelected(keywords);
    setIsVoiceSearchActive(false);
  };

  const handleSelectKeyword = (word, personaKey) => {
    if (!selected.includes(word)) {
      if (selected.length === 0 && personaKey) {
        setActivePersonaKey(personaKey);
      }
      setSelected((prev) => [...prev, word]);
    }
  };

  const handleDeselectKeyword = (word) => {
    setSelected((prev) => {
      const newSelected = prev.filter((kw) => kw !== word);
      if (newSelected.length === 0) {
        setActivePersonaKey(null);
      }
      return newSelected;
    });
  };

  const handleReset = () => {
    setSelected([]);
    setActivePersonaKey(null);
    setCurrentView('initial');
    setShowSchedule(false);
    setActiveOfferForChat(null);
    setOfferChatHistory([]);
    setProServicesPromptOffer(null);
    setSuggestedQuestions([]);
    setFaqChatHistory([]);
    refreshFaqPrompts();
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    const prompt = e.target.elements.prompt.value;
    if (!prompt) return;
    
    setIsLoading(true);
    
    // Simulation d'analyse intelligente du prompt
    setTimeout(() => {
      const promptLower = prompt.toLowerCase();
      let extractedKeywords = [];
      
      // Analyse des mots-clés dans le prompt
      const allKeywords = offers.flatMap(o => o.associated_keywords).filter(k => !k.startsWith('tag_'));
      extractedKeywords = allKeywords.filter(keyword => 
        promptLower.includes(keyword.toLowerCase()) || 
        promptLower.includes(keyword.replace('-', ' ').toLowerCase())
      );
      
      // Si aucun mot-clé trouvé, utiliser des mots-clés par défaut selon le contexte
      if (extractedKeywords.length === 0) {
        if (promptLower.includes('réseau') || promptLower.includes('network')) {
          extractedKeywords = ['sd-wan'];
        } else if (promptLower.includes('sécurité') || promptLower.includes('security')) {
          extractedKeywords = ['cybersecurity'];
        } else if (promptLower.includes('collaboration') || promptLower.includes('teams')) {
          extractedKeywords = ['webex'];
        } else if (promptLower.includes('données') || promptLower.includes('data')) {
          extractedKeywords = ['ai'];
        }
      }
      
      handleReset();
      if (extractedKeywords.length > 0) {
        const firstKw = extractedKeywords[0];
        const personaKey = Object.keys(personas).find(p => personas[p].tags.includes(firstKw)) || 'cio';
        setActivePersonaKey(personaKey);
        setSelected(extractedKeywords.slice(0, 3)); // Limiter à 3 mots-clés
      }
      setIsLoading(false);
    }, 1500);
    
    e.target.elements.prompt.value = '';
  };

  const handleContactRequest = () => {
    setCurrentView('contact_confirmation');
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const handleRfpAnalysis = () => {
    setCurrentView('rfp_analyzing');
    setTimeout(() => {
      setCurrentView('rfp_summary');
    }, 2500);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    handleContactRequest();
  };

  const handleStartOfferChat = async (offer) => {
    const offerName = (T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name;
    const welcomeMessage = { 
      role: 'agent', 
      text: T.ui_agent_welcome.replace('{offerName}', offerName) 
    };
    setActiveOfferForChat(offer);
    setOfferChatHistory([welcomeMessage]);
    setCurrentView('offer_chat');
    setSuggestedQuestions([]);
    setIsGeneratingQuestions(true);

    // Génération de questions suggérées
    setTimeout(() => {
      setSuggestedQuestions(generateSuggestedQuestions(offer));
      setIsGeneratingQuestions(false);
    }, 2000);
  };

  const handleOfferChatSubmit = async (e) => {
    e.preventDefault();
    const userMessageText = e.target.elements.prompt.value;
    if (!userMessageText.trim()) return;

    const newHistory = [...offerChatHistory, { role: 'user', text: userMessageText }];
    setOfferChatHistory(newHistory);
    e.target.elements.prompt.value = '';
    setIsAgentTyping(true);
    setSuggestedQuestions([]);
    
    // Simulation de réponse d'Alex
    setTimeout(() => {
      const response = generateAlexResponse(userMessageText, activeOfferForChat, T);
      setOfferChatHistory(prev => [...prev, { 
        role: 'agent', 
        text: response.response, 
        suggestions: response.suggested_actions || [] 
      }]);

      if (response.action === 'add_to_cart') {
        setTimeout(() => {
          const rect = chatButtonRef.current?.getBoundingClientRect();
          executeAddToCart(activeOfferForChat, rect);
        }, 1000);
      } else if (response.action === 'contact_advisor') {
        setTimeout(() => {
          setCurrentView('contact');
        }, 1500);
      }
      
      setIsAgentTyping(false);
    }, 2000);
  };

  const handleAgentSuggestionClick = (suggestion) => {
    setOfferChatHistory(prev => {
      const newHistory = [...prev];
      const lastMsg = newHistory[newHistory.length - 1];
      if (lastMsg.role === 'agent') {
        lastMsg.suggestions = [];
      }
      return newHistory;
    });

    switch (suggestion) {
      case T.ui_add_to_cart:
        executeAddToCart(activeOfferForChat, chatButtonRef.current?.getBoundingClientRect());
        break;
      case T.ui_contact_an_expert:
        setCurrentView('contact');
        break;
      default:
        const fakeEvent = { preventDefault: () => {}, target: { elements: { prompt: { value: suggestion } } } };
        handleOfferChatSubmit(fakeEvent);
        break;
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    const fakeEvent = { preventDefault: () => {}, target: { elements: { prompt: { value: question } } } };
    handleOfferChatSubmit(fakeEvent);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    const userMessageText = e.target.elements.prompt.value;
    if (!userMessageText.trim()) return;

    const newHistory = [...faqChatHistory, { role: 'user', text: userMessageText }];
    setFaqChatHistory(newHistory);
    e.target.elements.prompt.value = '';
    setIsFaqAgentTyping(true);

    // Simulation de réponse FAQ
    setTimeout(() => {
      const response = generateFaqResponse(userMessageText, faqData);
      
      if (response) {
        setFaqChatHistory(prev => [...prev, { role: 'agent', text: response }]);
      } else {
        setFaqChatHistory(prev => [...prev, {
          role: 'agent',
          text: "Je n'ai pas trouvé de réponse précise dans ma base de connaissances. Souhaitez-vous une aide plus personnalisée ?",
          suggestions: [T.ui_contact_an_expert]
        }]);
      }
      
      setIsFaqAgentTyping(false);
    }, 2000);
  };

  const handleFaqSuggestionClick = (suggestion) => {
    setFaqChatHistory(prev => {
      const newHistory = [...prev];
      const lastMsg = newHistory[newHistory.length - 1];
      if (lastMsg.role === 'agent') {
        lastMsg.suggestions = [];
      }
      return newHistory;
    });

    if (suggestion === T.ui_contact_an_expert) {
      setCurrentView('contact');
    }
  };

  const handleFaqPromptClick = (question) => {
    const fakeEvent = { preventDefault: () => {}, target: { elements: { prompt: { value: question } } } };
    handleFaqSubmit(fakeEvent);
  };

  const executeAddToCart = (offer, sourceRect) => {
    if (sourceRect && cartRef.current) {
      const cartIconRect = cartRef.current.getBoundingClientRect();
      setFlyingOffer({
        ...offer,
        id: new Date().getTime() + Math.random(),
        source: {
          x: sourceRect.left,
          y: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height
        },
        target: {
          x: cartIconRect.left + cartIconRect.width / 2,
          y: cartIconRect.top + cartIconRect.height / 2
        }
      });
    }
    
    setCart(prevCart => {
      if (prevCart.find(item => item.offer_id === offer.offer_id)) return prevCart;
      return [...prevCart, offer];
    });
  };

  const addToCart = (offer, e) => {
    const rect = e.currentTarget.closest('.offer-card').getBoundingClientRect();
    if (offer.offer_id === 'O001') {
      setProServicesPromptOffer({ offer: offer, rect: rect });
    } else {
      executeAddToCart(offer, rect);
    }
  };

  const handleConfirmProServices = () => {
    if (!proServicesPromptOffer) return;
    executeAddToCart(proServicesPromptOffer.offer, proServicesPromptOffer.rect);
    executeAddToCart(proServicesProduct, proServicesPromptOffer.rect);
    setProServicesPromptOffer(null);
  };

  const handleDeclineProServices = () => {
    if (!proServicesPromptOffer) return;
    executeAddToCart(proServicesPromptOffer.offer, proServicesPromptOffer.rect);
    setProServicesPromptOffer(null);
  };

  const removeFromCart = (offerId) => {
    setCart(prevCart => prevCart.filter(item => item.offer_id !== offerId));
  };

  const showResultsPanel = selected.length > 0;

  const trigger = proactiveTriggers[currentUrl];
  const shouldShowProactive = trigger && currentView === 'initial' && !selected.length;

  return (
    <>
      <AnimatePresence>
        {proServicesPromptOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <Sparkles className="mx-auto h-12 w-12 text-orange-500" />
              <h3 className="text-xl font-bold mt-4 text-gray-900">{T.ui_pro_services_title}</h3>
              <p className="mt-2 text-gray-600">{T.ui_pro_services_desc}</p>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleDeclineProServices}
                  className="flex-1 py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
                >
                  {T.ui_pro_services_decline}
                </button>
                <button
                  onClick={handleConfirmProServices}
                  className="flex-1 py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg"
                >
                  {T.ui_pro_services_confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ease: "circOut", duration: 0.4 }}
            className="absolute bottom-24 right-0 max-h-[80vh] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <AnimatePresence>
              {isVoiceSearchActive && (
                <VoiceSearchSimulation 
                  active={isVoiceSearchActive} 
                  onComplete={handleVoiceSearchComplete} 
                />
              )}
            </AnimatePresence>

            <LayoutGroup>
              <motion.div
                layout
                className={`flex flex-1 min-h-0 transition-all duration-500 ease-in-out ${
                  (showResultsPanel || currentView === 'offer_chat' || currentView === 'faq') 
                    ? 'w-[48rem]' 
                    : 'w-[36rem]'
                }`}
              >
                <motion.div
                  layout="position"
                  className={`flex-1 flex flex-col min-w-[24rem] ${
                    (currentView === 'offer_chat' || currentView === 'faq') ? '' : 'max-w-lg'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center flex-shrink-0 p-4 border-b border-gray-200">
                    <div className="flex gap-2">
                      {allLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`transition-transform duration-200 ${
                            language === lang 
                              ? 'scale-125' 
                              : 'opacity-50 hover:opacity-100 hover:scale-110'
                          }`}
                          title={lang}
                        >
                          <LanguageFlag lang={lang} />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-orange-600 transition-colors"
                        aria-label="Réinitialiser"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        aria-label="Fermer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-grow">
                    <ChatContent
                      currentView={shouldShowProactive ? 'proactive_message' : currentView}
                      initialKeywords={initialKeywords}
                      selected={selected}
                      sortedSelected={sortedSelected}
                      availableKeywords={availableKeywords}
                      activePersonaKey={activePersonaKey}
                      personas={personas}
                      T={T}
                      onSelectKeyword={handleSelectKeyword}
                      onDeselectKeyword={handleDeselectKeyword}
                      onStartOfferChat={handleStartOfferChat}
                      offerChatHistory={offerChatHistory}
                      isAgentTyping={isAgentTyping}
                      suggestedQuestions={suggestedQuestions}
                      isGeneratingQuestions={isGeneratingQuestions}
                      activeOfferForChat={activeOfferForChat}
                      onViewChange={setCurrentView}
                      showSchedule={showSchedule}
                      setShowSchedule={setShowSchedule}
                      onScheduleSubmit={handleScheduleSubmit}
                      onContactRequest={handleContactRequest}
                      onRfpAnalysis={handleRfpAnalysis}
                      faqChatHistory={faqChatHistory}
                      isFaqAgentTyping={isFaqAgentTyping}
                      faqPrompts={faqPrompts}
                      refreshFaqPrompts={refreshFaqPrompts}
                      trigger={trigger}
                      onOfferChatSubmit={handleOfferChatSubmit}
                      onAgentSuggestionClick={handleAgentSuggestionClick}
                      onSuggestedQuestionClick={handleSuggestedQuestionClick}
                      onFaqSubmit={handleFaqSubmit}
                      onFaqSuggestionClick={handleFaqSuggestionClick}
                      onFaqPromptClick={handleFaqPromptClick}
                      chatButtonRef={chatButtonRef}
                      executeAddToCart={executeAddToCart}
                    />
                  </div>

                  {/* Input */}
                  {currentView !== 'offer_chat' && currentView !== 'faq' && (
                    <div className="p-3 mt-auto border-t">
                      <form onSubmit={handlePromptSubmit} className="relative flex items-center">
                        <input
                          type="text"
                          name="prompt"
                          disabled={isLoading}
                          placeholder={T.ui_prompt_placeholder}
                          className="w-full pl-4 pr-32 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 text-sm"
                        />
                        <div className="absolute right-12 flex items-center">
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setCurrentView('rfp')}
                              className="p-2 text-gray-500 hover:text-orange-600 rounded-full"
                            >
                              <Paperclip className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              {T.ui_upload_title}
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setCurrentView('contact')}
                              className="p-2 text-gray-500 hover:text-orange-600 rounded-full"
                            >
                              <Headset className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              {T.ui_contact_advisor}
                            </div>
                          </div>
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setIsVoiceSearchActive(true)}
                              className="p-2 text-gray-500 hover:text-orange-600 rounded-full"
                            >
                              <Mic className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              {T.ui_voice_search}
                            </div>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
                        >
                          {isLoading ? (
                            <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>

                {/* Results Panel */}
                <AnimatePresence>
                  {showResultsPanel && currentView !== 'offer_chat' && currentView !== 'faq' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex-1 min-w-[22rem] flex flex-col border-l bg-gray-50/50"
                    >
                      <div className="overflow-y-auto p-4 flex-grow">
                        {filteredOffers.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-600">
                              {filteredOffers.length} {filteredOffers.length > 1 ? T.ui_results_for : T.ui_result_for}
                            </p>
                            {filteredOffers.map((offer) => (
                              <motion.div
                                key={offer.offer_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="offer-card bg-white border p-3 rounded-lg hover:shadow-lg hover:border-orange-300 transition-all duration-200 flex flex-col justify-between"
                              >
                                <div>
                                  <a
                                    href={offer.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-orange-600 hover:underline"
                                  >
                                    {(T.offers && T.offers[offer.offer_id]?.name) || offer.offer_name}
                                  </a>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {(T.offers && T.offers[offer.offer_id]?.desc) || offer.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <button
                                    onClick={() => handleStartOfferChat(offer)}
                                    className="flex-1 bg-white border border-orange-500 text-orange-600 font-semibold py-1.5 px-3 rounded-md hover:bg-orange-50 text-sm flex items-center justify-center gap-2"
                                  >
                                    <MessageSquare size={16} /> {T.ui_learn_more}
                                  </button>
                                  <button
                                    onClick={(e) => addToCart(offer, e)}
                                    className="flex-1 bg-orange-100 text-orange-800 font-semibold py-1.5 px-3 rounded-md hover:bg-orange-200 text-sm flex items-center justify-center gap-2"
                                  >
                                    <PlusCircle size={16} /> {T.ui_add_to_cart}
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                            <Search className="w-12 h-12 mb-4 text-gray-400" />
                            <p className="font-semibold">{T.ui_no_match}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Separate component for chat content to keep file size manageable
function ChatContent({ 
  currentView, 
  initialKeywords, 
  selected, 
  sortedSelected, 
  availableKeywords, 
  activePersonaKey, 
  personas, 
  T, 
  onSelectKeyword, 
  onDeselectKeyword, 
  onStartOfferChat, 
  offerChatHistory, 
  isAgentTyping, 
  suggestedQuestions, 
  isGeneratingQuestions, 
  activeOfferForChat, 
  onViewChange, 
  showSchedule, 
  setShowSchedule, 
  onScheduleSubmit, 
  onContactRequest, 
  onRfpAnalysis, 
  faqChatHistory, 
  isFaqAgentTyping, 
  faqPrompts, 
  refreshFaqPrompts, 
  trigger,
  onOfferChatSubmit,
  onAgentSuggestionClick,
  onSuggestedQuestionClick,
  onFaqSubmit,
  onFaqSuggestionClick,
  onFaqPromptClick,
  chatButtonRef,
  executeAddToCart
}) {
  const renderView = () => {
    switch(currentView) {
      case 'initial':
        return (
          <motion.div key="initial" className="p-6">
            <div className="flex flex-wrap justify-center gap-2">
              {initialKeywords.map(({keyword, persona}, index) => (
                <motion.button
                  key={keyword}
                  layoutId={`kw-${keyword}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 + 0.1 } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectKeyword(keyword, persona)}
                  className={`text-sm px-3 py-1.5 rounded-full border-2 font-medium ${personas[persona].color.bg} ${personas[persona].color.text} ${personas[persona].color.border} ${personas[persona].color.hoverBorder} flex items-center gap-2 shadow-sm hover:shadow-md`}
                >
                  {T[keyword] || keyword}
                </motion.button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => { 
                  onViewChange('faq'); 
                  if (faqPrompts.length === 0) refreshFaqPrompts(); 
                }}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <LifeBuoy className="text-orange-500" />
                {T.ui_faq_title}
              </button>
            </div>
          </motion.div>
        );
        
      case 'refinement':
        return (
          <motion.div key="refinement">
            <motion.div layout className="flex flex-wrap gap-2 p-4 border-b min-h-[44px]">
              <AnimatePresence>
                {sortedSelected.map(word => (
                  <motion.button
                    layoutId={`kw-${word}`}
                    key={word}
                    onClick={() => onDeselectKeyword(word)}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full text-white ${personas[activePersonaKey]?.color.selectedBg || 'bg-gray-500'} hover:bg-red-500 shadow-md`}
                  >
                    {T[word] || word} <X className="w-3 h-3" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
            <div className="p-4">
              {availableKeywords.length > 0 && (
                <h3 className="font-semibold text-sm mb-3 text-gray-600">{T.ui_refine_search}</h3>
              )}
              <div className="flex flex-wrap gap-2">
                {availableKeywords.map((word) => (
                  <motion.button
                    layoutId={`kw-${word}`}
                    key={word}
                    onClick={() => onSelectKeyword(word)}
                    className={`text-sm px-3 py-1 rounded-full border ${personas[activePersonaKey]?.color.bg} ${personas[activePersonaKey]?.color.text} ${personas[activePersonaKey]?.color.border} ${personas[activePersonaKey]?.color.hoverBg}`}
                  >
                    {T[word] || word}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
        
      case 'proactive_message':
        return trigger ? (
          <motion.div key="proactive" className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-orange-500" />
            <p className="mt-4 font-semibold">{T[trigger.messageKey]}</p>
            <motion.button
              onClick={() => onViewChange('contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-orange-600"
            >
              {T[trigger.ctaKey]}
            </motion.button>
          </motion.div>
        ) : null;
        
      case 'contact':
        return (
          <motion.div key="contact" className="p-4">
            <button
              onClick={() => onViewChange(selected.length > 0 ? 'refinement' : 'initial')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-md shrink-0">
                <Headset className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">{T.ui_contact_advisor}</h3>
                <p className="text-sm text-gray-500">{T.ui_contact_how_to_contact}</p>
              </div>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={onContactRequest}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
                >
                  <Phone className="text-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium text-left">{T.ui_contact_by_phone}</span>
                </button>
                <button
                  onClick={onContactRequest}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
                >
                  <MessageSquare className="text-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium text-left">{T.ui_contact_by_chat}</span>
                </button>
                <button
                  onClick={onContactRequest}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
                >
                  <Mail className="text-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium text-left">{T.ui_contact_by_email}</span>
                </button>
                <button
                  onClick={onContactRequest}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
                >
                  <PhoneForwarded className="text-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium text-left">{T.ui_contact_callback_now}</span>
                </button>
              </div>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-center gap-3 p-2 rounded-lg bg-gray-100 hover:bg-orange-100 transition-colors"
              >
                <CalendarClock className="text-orange-500 w-5 h-5" />
                <span className="text-sm font-medium">{T.ui_contact_callback_schedule}</span>
              </button>
              <AnimatePresence>
                {showSchedule && (
                  <motion.form
                    onSubmit={onScheduleSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 space-y-2"
                  >
                    <input
                      type="date"
                      required
                      className="w-full p-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="time"
                      required
                      className="w-full p-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      type="submit"
                      className="w-full p-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600"
                    >
                      {T.ui_contact_confirm_callback}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
        
      case 'contact_confirmation':
        return (
          <motion.div key="contact_confirmation" className="p-8 flex flex-col items-center justify-center h-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="mt-4 font-semibold text-lg">{T.ui_contact_request_received}</p>
          </motion.div>
        );
        
      case 'faq':
        return (
          <motion.div key="faq" className="flex flex-col h-full">
            <div className="p-4 border-b text-center relative">
              <button
                onClick={() => onViewChange('initial')}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-lg font-bold">{T.ui_faq_title}</h2>
              <p className="text-sm text-gray-500 mt-1">{T.ui_faq_subtitle}</p>
              <button
                onClick={refreshFaqPrompts}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              {faqChatHistory.length === 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {faqPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onFaqPromptClick(prompt)}
                      className="h-full p-3 text-sm text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {faqChatHistory.map((msg, index) => (
                <React.Fragment key={index}>
                  <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'agent' && (
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <LifeBuoy size={18} />
                      </div>
                    )}
                    <div className={`max-w-md p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 rounded-bl-none'
                    }`}>
                      <MarkdownRenderer text={msg.text} />
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                        U
                      </div>
                    )}
                  </div>
                  {msg.role === 'agent' && msg.suggestions && msg.suggestions.length > 0 && 
                   index === faqChatHistory.length - 1 && !isFaqAgentTyping && (
                    <div className="flex items-start justify-center pt-4">
                      {msg.suggestions.map((suggestion, i) => (
                        <motion.button
                          key={i}
                          onClick={() => onFaqSuggestionClick(suggestion)}
                          className="text-sm font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                        >
                          <Headset size={16} className="mr-2" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {isFaqAgentTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <LifeBuoy size={18} />
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 mt-auto border-t">
              <form onSubmit={onFaqSubmit} className="relative flex items-center">
                <input
                  type="text"
                  name="prompt"
                  disabled={isFaqAgentTyping}
                  placeholder={T.ui_faq_prompt_placeholder}
                  className="w-full pl-4 pr-12 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 text-sm"
                />
                <button
                  type="submit"
                  disabled={isFaqAgentTyping}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        );
        
      case 'offer_chat':
        return (
          <motion.div key="offer_chat" className="flex flex-col h-full">
            <div className="p-4 border-b">
              <button
                onClick={() => onViewChange('refinement')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2"
              >
                <ArrowLeft size={16} /> {T.ui_back_to_offers}
              </button>
              <h3 className="font-bold text-lg text-center text-orange-600">
                {(T.offers && T.offers[activeOfferForChat.offer_id]?.name) || activeOfferForChat.offer_name}
              </h3>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              {offerChatHistory.map((msg, index) => (
                <React.Fragment key={index}>
                  {index === 0 ? (
                    <div className="flex items-start gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                          <Sparkles size={18} />
                        </div>
                        <div className="max-w-md p-3 rounded-2xl bg-gray-200 rounded-bl-none">
                          <MarkdownRenderer text={msg.text} />
                        </div>
                      </div>
                      {index === 0 && !isGeneratingQuestions && suggestedQuestions.length > 0 && (
                        <div className="flex flex-col items-start gap-2 pt-2 flex-shrink-0 w-48">
                          {suggestedQuestions.map((q, i) => (
                            <motion.button
                              key={i}
                              onClick={() => onSuggestedQuestionClick(q)}
                              className="w-full text-sm text-left text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                            >
                              {q}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'agent' && (
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                            <Sparkles size={18} />
                          </div>
                        )}
                        <div className={`max-w-md p-3 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-200 rounded-bl-none'
                        }`}>
                          <MarkdownRenderer text={msg.text} />
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                            U
                          </div>
                        )}
                      </div>
                      {msg.role === 'agent' && msg.suggestions && msg.suggestions.length > 0 && 
                       index === offerChatHistory.length - 1 && !isAgentTyping && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                          {msg.suggestions.map((suggestion, i) => (
                            <motion.button
                              key={i}
                              onClick={() => onAgentSuggestionClick(suggestion)}
                              className="text-sm font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                            >
                              {suggestion === T.ui_add_to_cart && <ShoppingCart size={16} className="mr-2" />}
                              {suggestion === T.ui_contact_an_expert && <Headset size={16} className="mr-2" />}
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
              {isAgentTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              {isGeneratingQuestions && offerChatHistory.length === 1 && (
                <div className="flex items-start gap-3 pl-11">
                  <div className="p-3 rounded-2xl self-start">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 mt-auto border-t">
              <form onSubmit={onOfferChatSubmit} className="relative flex items-center">
                <input
                  type="text"
                  name="prompt"
                  disabled={isAgentTyping}
                  placeholder={T.ui_chat_prompt_placeholder}
                  className="w-full pl-4 pr-32 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 text-sm"
                />
                <div className="absolute right-12 flex items-center">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => executeAddToCart(activeOfferForChat, chatButtonRef.current?.getBoundingClientRect())}
                      className="p-2 text-gray-500 hover:text-orange-600 rounded-full"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {T.ui_add_to_cart}
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => onViewChange('contact')}
                      className="p-2 text-gray-500 hover:text-orange-600 rounded-full"
                    >
                      <Headset className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {T.ui_contact_advisor}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAgentTyping}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        );
        
      case 'rfp':
        return (
          <motion.div key="rfp" className="p-5 text-center">
            <button
              onClick={() => onViewChange('initial')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <h2 className="text-lg font-bold">{T.ui_upload_title}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">{T.ui_upload_subtitle}</p>
            <motion.button
              onClick={onRfpAnalysis}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-orange-600"
            >
              {T.ui_upload_cta}
            </motion.button>
          </motion.div>
        );
        
      case 'rfp_analyzing':
        return (
          <motion.div key="rfp_analyzing" className="p-8 flex flex-col items-center justify-center h-full text-center">
            <motion.div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 font-semibold">{T.ui_upload_analyzing}</p>
          </motion.div>
        );
        
      case 'rfp_summary':
        return (
          <motion.div key="rfp_summary" className="p-5">
            <button
              onClick={() => onViewChange('initial')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <h2 className="text-lg font-bold mt-3">{T.ui_upload_summary_title}</h2>
              <p className="text-sm text-gray-600 mt-2 mb-4">{T.ui_upload_summary_desc}</p>
            </div>
            <form onSubmit={onContactRequest} className="space-y-3">
              <input
                type="text"
                placeholder="Nom complet"
                required
                className="w-full p-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                placeholder="Adresse e-mail"
                required
                className="w-full p-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="w-full p-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600"
              >
                {T.ui_upload_submit}
              </button>
            </form>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
  );
}