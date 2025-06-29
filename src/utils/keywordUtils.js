import { offers } from '../data/offers.js';
import { personas } from '../data/personas.js';

export function generateInitialKeywords(minOccurrences = 3) {
  const allKeywordsFromOffers = new Set(offers.flatMap(o => o.associated_keywords));
  const keywordOfferCount = {};
  
  allKeywordsFromOffers.forEach(kw => {
    if (kw.startsWith('tag_')) return;
    keywordOfferCount[kw] = offers.filter(offer => offer.associated_keywords.includes(kw)).length;
  });
  
  const eligibleKeywords = Object.keys(keywordOfferCount).filter(kw => keywordOfferCount[kw] >= minOccurrences);
  const finalKeywords = new Map();
  const personaOrder = ['cio', 'telecom_manager', 'ciso', 'coo', 'cx_leader', 'data_leader', 'pme_owner'];
  const keywordsPerPersona = 5;
  
  for (const personaKey of personaOrder) {
    const personaTags = personas[personaKey].tags;
    const personaEligibleKeywords = eligibleKeywords
      .filter(kw => personaTags.includes(kw))
      .sort((a, b) => keywordOfferCount[b] - keywordOfferCount[a]);
    
    let count = 0;
    for (const kw of personaEligibleKeywords) {
      if (count >= keywordsPerPersona) break;
      if (!finalKeywords.has(kw)) {
        finalKeywords.set(kw, { keyword: kw, persona: personaKey });
        count++;
      }
    }
  }
  
  const shuffledKeywords = Array.from(finalKeywords.values());
  for (let i = shuffledKeywords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledKeywords[i], shuffledKeywords[j]] = [shuffledKeywords[j], shuffledKeywords[i]];
  }
  
  return shuffledKeywords;
}

export function getAvailableKeywords(selected, offers) {
  const filteredOffers = selected.length > 0 
    ? offers.filter(offer => selected.every(sel => offer.associated_keywords.includes(sel))) 
    : offers;
    
  if (filteredOffers.length === 0) return [];
  
  const keywordCount = {};
  filteredOffers.forEach((offer) => {
    offer.associated_keywords.forEach((kw) => {
      if (!selected.includes(kw) && !kw.startsWith('tag_')) {
        keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      }
    });
  });
  
  return Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw)
    .slice(0, 15);
}