// Utility for formatting project names with their full expanded title following the abbreviation
// Example: "LJHP" -> "LJHP — Lower Jhelum Hydroelectric Project"

export const projectFullNameMap: Record<string, string> = {
  "LJHP": "LJHP — Lower Jhelum Hydroelectric Project",
  "LOWER JHELUM": "LJHP — Lower Jhelum Hydroelectric Project",
  "BHEP I": "BHEP-I — Baglihar Hydroelectric Project (Stage I - 450 MW)",
  "BHEP II": "BHEP-II — Baglihar Hydroelectric Project (Stage II - 450 MW)",
  "BHEP": "BHEP — Baglihar Hydroelectric Project (900 MW)",
  "BAGLIHAR I": "BHEP-I — Baglihar Hydroelectric Project (Stage I)",
  "BAGLIHAR II": "BHEP-II — Baglihar Hydroelectric Project (Stage II)",
  "USHP I": "USHP-I — Upper Sindh Hydroelectric Project (Stage I - 22.6 MW)",
  "USHP II": "USHP-II — Upper Sindh Hydroelectric Project (Stage II - 105 MW)",
  "USHP": "USHP — Upper Sindh Hydroelectric Project",
  "CHEP I": "CHEP-I — Chenani Hydroelectric Project (Stage I - 14 MW)",
  "CHEP II": "CHEP-II — Chenani Hydroelectric Project (Stage II - 2 MW)",
  "CHEP III": "CHEP-III — Chenani Hydroelectric Project (Stage III - 7.5 MW)",
  "MHEP PAHALGAM": "MHEP Pahalgam — Pahalgam Mini Hydroelectric Project (4.5 MW)",
  "PAHALGAM": "MHEP Pahalgam — Pahalgam Mini Hydroelectric Project",
  "KARNAH": "Karnah HEP — Karnah Small Hydroelectric Project (2 MW)",
  "GANDERBAL": "Ganderbal HEP — New Ganderbal Hydroelectric Project (93 MW)",
  "BHADERWAH": "Bhaderwah HEP — Bhaderwah Small Hydroelectric Project (1 MW)",
  "SEWA III": "Sewa-III — Sewa Hydroelectric Project (Stage III - 9 MW)",
  "SEWA-III": "Sewa-III — Sewa Hydroelectric Project (Stage III - 9 MW)",
  "PARNAI": "Parnai HEP — Parnai Hydroelectric Project (37.5 MW)",
  "LOWER KALNAI": "Lower Kalnai HEP — Lower Kalnai Hydroelectric Project (48 MW)",
  "KIRTHAI I": "Kirthai-I HEP — Kirthai Hydroelectric Project (Stage I - 390 MW)",
  "KIRTHAI HEP STAGE-1": "Kirthai-I HEP — Kirthai Hydroelectric Project (Stage I - 390 MW)",
  "KIRTHAI-I": "Kirthai-I HEP — Kirthai Hydroelectric Project (Stage I - 390 MW)",
  "KIRTHAI II": "Kirthai-II HEP — Kirthai Hydroelectric Project (Stage II - 930 MW)",
  "KIRTHAI-II": "Kirthai-II HEP — Kirthai Hydroelectric Project (Stage II - 930 MW)",
  "PAKAL DUL": "Pakal Dul HEP — Pakal Dul Hydroelectric Project (1000 MW)",
  "KIRU": "Kiru HEP — Kiru Hydroelectric Project (624 MW)",
  "KWAR": "Kwar HEP — Kwar Hydroelectric Project (540 MW)",
  "RATLE": "Ratle HEP — Ratle Hydroelectric Project (850 MW)",
  "CVPPPL": "CVPPPL — Chenab Valley Power Projects Private Limited",
  "RHPCL": "RHPCL — Ratle Hydroelectric Power Corporation Limited"
};

export function formatProjectName(name?: string): string {
  if (!name) return '';
  const clean = name.trim();
  const upper = clean.toUpperCase();
  
  // Exact match
  if (projectFullNameMap[upper]) {
    return projectFullNameMap[upper];
  }
  
  // Key substring match
  for (const [key, formatted] of Object.entries(projectFullNameMap)) {
    if (upper === key || upper.includes(key)) {
      return formatted;
    }
  }
  
  return clean;
}
