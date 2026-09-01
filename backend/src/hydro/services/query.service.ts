import { Injectable } from '@nestjs/common';

/**
 * Query Service — Handles language detection, abbreviation expansion, spelling normalization,
 * and contextual query resolution.
 */
@Injectable()
export class QueryService {
  /** Known acronyms & abbreviations in JKSPDC domain */
  private readonly abbreviations: Record<string, string> = {
    'bhep': 'Baglihar Hydroelectric Project BHEP',
    'chep': 'Chenani Hydroelectric Project CHEP',
    'ushp': 'Upper Sindh Hydroelectric Project USHP',
    'ljhp': 'Lower Jhelum Hydroelectric Project LJHP',
    'hep': 'Hydroelectric Project HEP',
    'enit': 'eNIT Electronic Notice Inviting Tender',
    'nit': 'NIT Notice Inviting Tender',
    'emd': 'Earnest Money Deposit EMD',
    'jmr': 'Joint Meter Reading JMR',
    'ppa': 'Power Purchase Agreement PPA',
    'serc': 'State Electricity Regulatory Commission SERC',
    'cerc': 'Central Electricity Regulatory Commission CERC',
    'emp': 'Environment Management Plan EMP',
    'csr': 'Corporate Social Responsibility CSR',
    'rti': 'Right to Information RTI Section 4',
    'pio': 'Public Information Officer PIO',
    'msme': 'Micro Small and Medium Enterprises MSME',
    'clpm': 'Contract Labor Payment Management CLPM',
    'gstin': 'Goods and Services Tax Identification Number GSTIN',
    'cin': 'Corporate Identification Number CIN',
    'moa': 'Memorandum of Association MoA',
    'aoa': 'Articles of Association AoA',
  };

  /**
   * Detects the language family of the user query.
   */
  detectLanguage(text: string): 'en' | 'hi' | 'ur' | 'roman_ur' {
    if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Arabic/Urdu script
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari script

    // Check for common Roman Urdu/Hindi keywords
    const romanUrduWords = /\b(kya|hai|kab|kaise|kahan|yeh|ye|kitna|kitne|mujhe|batao|bataiye|chahiye|hoga|wali|wala|hain|ke|ki|ko|se|par|me|aur)\b/i;
    if (romanUrduWords.test(text)) return 'roman_ur';

    return 'en';
  }

  /**
   * Expands query with domain abbreviations for optimal hybrid retrieval.
   */
  expandQuery(query: string): string {
    let normalized = query
      .replace(/\bcornor\b/gi, 'corner')
      .replace(/\bgist\b/gi, 'gstin gst')
      .replace(/\bpotentials?\b/gi, 'hydro potential capacity power potential generation MW');

    let expanded = normalized;
    const lower = normalized.toLowerCase();

    // Specific domain concept expansions
    if (lower.includes('employee corner') || lower.includes('employee') || lower.includes('links') || lower.includes('ras') || lower.includes('janparichay') || lower.includes('jkhrms') || lower.includes('hrms')) {
      expanded += ' Employees Corner Web Mail Nic-e-File E-Office JKHRMS EETMS BG Management Asset Management JKSPDC RAS JanParichay MeriPehchaan';
    }

    if (lower.includes('potential') || lower.includes('capacity')) {
      expanded += ' Hydroelectric potential 20000 MW 14867 MW 2593 MW 1197.40 MW Baglihar Chenab Jhelum Ravi Indus';
    }

    for (const [abbr, expansion] of Object.entries(this.abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      if (regex.test(lower)) {
        expanded = `${expanded} ${expansion}`;
      }
    }

    return expanded;
  }

  /**
   * Resolves contextual references in follow-up queries using previous user/assistant context.
   * e.g., "What is its capacity?" after asking about "Baglihar" -> "What is Baglihar's capacity?"
   */
  resolveContextualQuery(currentQuery: string, lastTopic?: string): string {
    if (!lastTopic) return currentQuery;

    const lower = currentQuery.toLowerCase();
    const pronouns = /\b(it|this|that|its|their|the project|the tender|the notice|is project|is tender)\b/i;

    if (pronouns.test(lower) && !lower.includes(lastTopic.toLowerCase())) {
      return `${currentQuery} (Context reference: ${lastTopic})`;
    }

    return currentQuery;
  }
}
