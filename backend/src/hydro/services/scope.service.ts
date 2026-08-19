import { Injectable } from '@nestjs/common';

/**
 * Scope Service — Classifies queries as in-scope, partial, or out-of-scope.
 * Implements prompt injection detection and input sanitization.
 */
@Injectable()
export class ScopeService {
  /** Topics obviously unrelated to a government power corporation website */
  private readonly outOfDomainPatterns = [
    /\b(stock market|crypto|bitcoin|ethereum|forex|nft)\b/i,
    /\b(weather forecast|temperature today|climate today)\b/i,
    /\b(movie|film|actor|actress|bollywood|hollywood|netflix)\b/i,
    /\b(cricket|football|tennis|ipl|world cup|nba|fifa|olympics|sports score)\b/i,
    /\b(recipe|cooking|cook|bake|food|dish|restaurant)\b/i,
    /\b(song|music|lyrics|singer|album|spotify)\b/i,
    /\b(homework|assignment|exam|quiz|test paper)\b/i,
    /\b(horoscope|astrology|zodiac|kundli)\b/i,
    /\b(joke|jokes|riddle|meme|funny)\b/i,
    /\b(gaming|game|pubg|fortnite|minecraft|playstation|xbox)\b/i,
    /\b(write me a|write a program|code in python|javascript code|html css|react app)\b/i,
    /\b(chatgpt|openai|claude|anthropic|siri|alexa)\b/i,
    /\b(dating|relationship|marriage|love)\b/i,
    /\b(travel|flight|hotel|booking|airbnb|tourist)\b/i,
  ];

  /** JKSPDC-domain indicator patterns — if matched, the query is likely in-scope */
  private readonly domainIndicators = [
    /\b(jkspdc|jkspdcl|jkpdc|power development corporation)\b/i,
    /\b(hydro|hydroelectric|hydropower|hep|power station|power plant|dam)\b/i,
    /\b(potential|potentials|hydel potential|power potential|energy potential|generation potential|resources)\b/i,
    /\b(tender|nit|enit|e-nit|bid|bids|procurement|rfp|emd|earnest money)\b/i,
    /\b(baglihar|bhep|chep|ushp|ljhp|kirthai|sewa|ganderbal|karnah|pahalgam|bhaderwah|sanjak|hanu|mohra|ratle|pakal|kiru|kwar|sawalkote)\b/i,
    /\b(megawatt|mw|generation|turbine|penstock|powerhouse|switchyard|grid|transmission)\b/i,
    /\b(tariff|ppa|power purchase|billing|jmr|cerc|serc|jkjerc|kpdcl|jpdcl)\b/i,
    /\b(gst|gstin|cin|pan|tax registration|invoice)\b/i,
    /\b(board of directors|managing director|chairman|governor|chief minister|directors|leadership)\b/i,
    /\b(notification|notice|circular|order|office order|corrigendum)\b/i,
    /\b(rti|right to information|pio|section 4)\b/i,
    /\b(career|recruitment|vacancy|job|employment|advertisement|opening)\b/i,
    /\b(csr|corporate social responsibility|environment|emp|afforestation)\b/i,
    /\b(download|annual report|financial result|balance sheet|audit|accounts)\b/i,
    /\b(contact|phone|email|address|office|srinagar|jammu|headquarters|directory)\b/i,
    /\b(msme|startup|vendor|contractor|pre-qualification)\b/i,
    /\b(project|construction|commissioning|capacity|basin|river|jhelum|chenab|indus|ravi)\b/i,
    /\b(policy|policies|vigilance|ethics|code of conduct|whistleblower)\b/i,
    /\b(press release|gallery|photo|event|award|honour|news)\b/i,
    /\b(website|portal|page|sitemap|navigate|help|links|menu|navigation|search)\b/i,
    /\b(employee|employees|employee corner|employees corner|staff|officers|corner|cornor)\b/i,
    /\b(webmail|web mail|nic-e-file|nicefile|eoffice|e-office|hrms|jkhrms|property return|gad|eetms|bg management|asset management)\b/i,
    /\b(agm|annual general meeting|mou|memorandum|aoa|moa)\b/i,
    /\b(clpm|labor|labour|payment)\b/i,
    /\b(esg|sustainability|brsr)\b/i,
  ];

  /** Prompt injection attack patterns */
  private readonly injectionPatterns = [
    /ignore\s+(your|all|previous|prior|above)\s+(instructions?|rules?|prompt|guidelines?)/i,
    /forget\s+(your|all|previous|prior)\s+(instructions?|rules?|training)/i,
    /you\s+are\s+now\s+(a|an|the)\s+/i,
    /act\s+as\s+(if|a|an|the)\s+/i,
    /pretend\s+(you|to\s+be)/i,
    /new\s+instructions?\s*:/i,
    /system\s*:\s*/i,
    /override\s+(your|all|system)\s+(rules?|instructions?|prompt)/i,
    /reveal\s+(your|the|system)\s+(prompt|instructions?|rules?)/i,
    /show\s+(me\s+)?(your|the|system)\s+(prompt|instructions?|rules?|source)/i,
    /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?|rules?)/i,
    /repeat\s+(your|the|system)\s+(prompt|instructions?|above)/i,
    /print\s+(your|the|system)\s+(prompt|instructions?)/i,
    /disregard\s+(all|your|previous)\s+(instructions?|rules?)/i,
    /jailbreak/i,
    /dan\s+mode/i,
    /developer\s+mode/i,
    /\bdo\s+anything\s+now\b/i,
  ];

  /**
   * Classify a user query's scope.
   */
  classifyScope(query: string): 'in_scope' | 'partial' | 'out_of_scope' {
    const lower = query.toLowerCase().trim();

    const hasDomainMatch = this.domainIndicators.some(p => p.test(lower));
    if (hasDomainMatch) return 'in_scope';

    const hasOutOfDomain = this.outOfDomainPatterns.some(p => p.test(lower));
    if (hasOutOfDomain) return 'out_of_scope';

    return 'partial';
  }

  /**
   * Detect prompt injection attempts.
   */
  detectPromptInjection(query: string): boolean {
    return this.injectionPatterns.some(p => p.test(query));
  }

  /**
   * Sanitize user input — strip potential XSS/injection payloads.
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
      .substring(0, 2000);
  }

  /**
   * Check if a greeting-type message.
   */
  isGreeting(text: string): boolean {
    const lower = text.toLowerCase().trim();
    const greetings = [
      'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
      'good evening', 'namaste', 'namaskar', 'assalamu alaikum', 'salam',
      'salaam', 'who are you', 'what are you', 'what can you do',
      'how can you help', 'help me',
    ];
    return greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ','));
  }

  /** The prompt injection refusal response */
  getInjectionRefusal(): string {
    return `I'm HYDRO, the official website information assistant. I can only assist with information available on this website.\n\nI cannot modify my instructions, reveal system details, or operate outside my designated scope. How can I help you with website-related information?`;
  }
}
