const STOP_WORDS: Record<string, string[]> = {
  en: ['the', 'is', 'and', 'of', 'to', 'in', 'that', 'it', 'for', 'was', 'with', 'this', 'are'],
  es: ['de', 'la', 'el', 'en', 'que', 'los', 'del', 'las', 'por', 'con', 'una', 'para', 'como'],
  fr: ['de', 'la', 'le', 'et', 'les', 'des', 'en', 'est', 'que', 'une', 'dans', 'pour', 'qui'],
  de: ['der', 'die', 'und', 'den', 'das', 'ist', 'von', 'ein', 'mit', 'auf', 'sich', 'dem', 'nicht'],
  pt: ['de', 'que', 'do', 'da', 'em', 'para', 'com', 'uma', 'os', 'das', 'no', 'mais', 'por'],
};

export function detectLanguage(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};

  for (const [lang, stops] of Object.entries(STOP_WORDS)) {
    scores[lang] = 0;
    for (const word of words) {
      if (stops.includes(word)) {
        scores[lang]++;
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return 'und';
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return 'und';
  return sorted[0][0];
}
