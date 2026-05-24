// Static seed data for Indian competitive exams.
// In production, this would be replaced with a real API. For now it's a
// curated list of major exams with rough recurring dates.

export type ExamCategory =
  | "engineering"
  | "medical"
  | "civil-services"
  | "banking"
  | "management"
  | "school"
  | "law"
  | "state"
  | "teaching"
  | "defence";

export interface Exam {
  id: string;
  name: string;
  fullForm: string;
  category: ExamCategory;
  level: "school" | "ug" | "pg" | "professional";
  conductingBody: string;
  // for recurring exams we store a typical month/day; UI computes next occurrence
  recurringMonth?: number; // 1-12
  recurringDay?: number;
  registrationMonth?: number; // typical registration opens
  description: string;
  region: "national" | "tamilnadu" | "karnataka" | "maharashtra" | "delhi" | "andhra" | "kerala" | "telangana" | "west-bengal" | "uttar-pradesh";
  websiteHint: string;
  tags: string[];
}

export const EXAMS: Exam[] = [
  // Engineering
  {
    id: "jee-main",
    name: "JEE Main",
    fullForm: "Joint Entrance Examination (Main)",
    category: "engineering",
    level: "ug",
    conductingBody: "NTA",
    recurringMonth: 1,
    recurringDay: 25,
    registrationMonth: 11,
    description: "Entrance test for B.Tech/B.E. admissions to NITs, IIITs and other CFTIs.",
    region: "national",
    websiteHint: "jeemain.nta.nic.in",
    tags: ["Math", "Physics", "Chemistry", "B.Tech"],
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    fullForm: "Joint Entrance Examination (Advanced)",
    category: "engineering",
    level: "ug",
    conductingBody: "IIT (rotating)",
    recurringMonth: 5,
    recurringDay: 26,
    registrationMonth: 4,
    description: "Entrance test for admissions to IITs. Top ~2.5L JEE Main rank holders eligible.",
    region: "national",
    websiteHint: "jeeadv.ac.in",
    tags: ["IIT", "Math", "Physics", "Chemistry"],
  },
  {
    id: "bitsat",
    name: "BITSAT",
    fullForm: "BITS Admission Test",
    category: "engineering",
    level: "ug",
    conductingBody: "BITS Pilani",
    recurringMonth: 5,
    recurringDay: 20,
    registrationMonth: 1,
    description: "Computer-based entrance for BITS Pilani, Goa, Hyderabad campuses.",
    region: "national",
    websiteHint: "bitsadmission.com",
    tags: ["BITS", "B.Tech"],
  },
  {
    id: "viteee",
    name: "VITEEE",
    fullForm: "VIT Engineering Entrance Exam",
    category: "engineering",
    level: "ug",
    conductingBody: "VIT",
    recurringMonth: 4,
    recurringDay: 19,
    description: "Entrance for VIT Vellore, Chennai, Amaravati, Bhopal.",
    region: "tamilnadu",
    websiteHint: "viteee.vit.ac.in",
    tags: ["VIT", "B.Tech"],
  },
  {
    id: "gate",
    name: "GATE",
    fullForm: "Graduate Aptitude Test in Engineering",
    category: "engineering",
    level: "pg",
    conductingBody: "IISc / IITs",
    recurringMonth: 2,
    recurringDay: 3,
    registrationMonth: 8,
    description: "Eligibility test for M.Tech admissions and PSU recruitments.",
    region: "national",
    websiteHint: "gate.iitb.ac.in",
    tags: ["PSU", "M.Tech", "PhD"],
  },

  // Medical
  {
    id: "neet-ug",
    name: "NEET UG",
    fullForm: "National Eligibility cum Entrance Test (Undergrad)",
    category: "medical",
    level: "ug",
    conductingBody: "NTA",
    recurringMonth: 5,
    recurringDay: 5,
    registrationMonth: 2,
    description: "Single entrance for MBBS, BDS, AYUSH and veterinary courses across India.",
    region: "national",
    websiteHint: "neet.nta.nic.in",
    tags: ["MBBS", "Biology", "BDS"],
  },
  {
    id: "neet-pg",
    name: "NEET PG",
    fullForm: "NEET Postgraduate",
    category: "medical",
    level: "pg",
    conductingBody: "NBE",
    recurringMonth: 3,
    recurringDay: 5,
    description: "PG medical entrance for MD/MS admissions.",
    region: "national",
    websiteHint: "natboard.edu.in",
    tags: ["MD", "MS", "PG Medical"],
  },
  {
    id: "inicet",
    name: "INI CET",
    fullForm: "Institute of National Importance Combined Entrance Test",
    category: "medical",
    level: "pg",
    conductingBody: "AIIMS Delhi",
    recurringMonth: 5,
    recurringDay: 11,
    description: "PG entrance for AIIMS, JIPMER, PGIMER, NIMHANS, SCTIMST.",
    region: "national",
    websiteHint: "aiimsexams.ac.in",
    tags: ["AIIMS", "PGIMER", "PG Medical"],
  },

  // Civil services / Govt
  {
    id: "upsc-cse",
    name: "UPSC CSE",
    fullForm: "Civil Services Examination",
    category: "civil-services",
    level: "professional",
    conductingBody: "UPSC",
    recurringMonth: 6,
    recurringDay: 16,
    registrationMonth: 2,
    description: "Three-stage exam for IAS, IPS, IFS and other Group A central services.",
    region: "national",
    websiteHint: "upsc.gov.in",
    tags: ["IAS", "IPS", "IFS"],
  },
  {
    id: "ssc-cgl",
    name: "SSC CGL",
    fullForm: "SSC Combined Graduate Level",
    category: "civil-services",
    level: "professional",
    conductingBody: "SSC",
    recurringMonth: 7,
    recurringDay: 10,
    description: "Group B and C posts in various central government ministries.",
    region: "national",
    websiteHint: "ssc.nic.in",
    tags: ["Govt Jobs", "Inspector", "Auditor"],
  },
  {
    id: "ssc-chsl",
    name: "SSC CHSL",
    fullForm: "Combined Higher Secondary Level",
    category: "civil-services",
    level: "professional",
    conductingBody: "SSC",
    recurringMonth: 6,
    recurringDay: 1,
    description: "Clerical posts open to 12th-pass candidates.",
    region: "national",
    websiteHint: "ssc.nic.in",
    tags: ["Clerk", "DEO", "Postal"],
  },

  // Banking
  {
    id: "ibps-po",
    name: "IBPS PO",
    fullForm: "Institute of Banking Personnel Selection - Probationary Officer",
    category: "banking",
    level: "professional",
    conductingBody: "IBPS",
    recurringMonth: 10,
    recurringDay: 13,
    registrationMonth: 8,
    description: "Recruitment of POs for participating public sector banks.",
    region: "national",
    websiteHint: "ibps.in",
    tags: ["PO", "Bank"],
  },
  {
    id: "sbi-po",
    name: "SBI PO",
    fullForm: "SBI Probationary Officer",
    category: "banking",
    level: "professional",
    conductingBody: "SBI",
    recurringMonth: 11,
    recurringDay: 4,
    description: "PO recruitment for State Bank of India.",
    region: "national",
    websiteHint: "sbi.co.in/careers",
    tags: ["SBI", "PO"],
  },
  {
    id: "rbi-grade-b",
    name: "RBI Grade B",
    fullForm: "RBI Officer Grade B",
    category: "banking",
    level: "professional",
    conductingBody: "RBI",
    recurringMonth: 7,
    recurringDay: 8,
    description: "Officer recruitment at the Reserve Bank of India.",
    region: "national",
    websiteHint: "opportunities.rbi.org.in",
    tags: ["RBI", "Grade B"],
  },

  // Management
  {
    id: "cat",
    name: "CAT",
    fullForm: "Common Admission Test",
    category: "management",
    level: "pg",
    conductingBody: "IIMs",
    recurringMonth: 11,
    recurringDay: 24,
    registrationMonth: 8,
    description: "Admissions to IIMs and major Indian B-schools.",
    region: "national",
    websiteHint: "iimcat.ac.in",
    tags: ["MBA", "IIM"],
  },
  {
    id: "xat",
    name: "XAT",
    fullForm: "Xavier Aptitude Test",
    category: "management",
    level: "pg",
    conductingBody: "XLRI",
    recurringMonth: 1,
    recurringDay: 5,
    description: "Entrance for XLRI and other Xavier-associated B-schools.",
    region: "national",
    websiteHint: "xatonline.in",
    tags: ["MBA", "XLRI"],
  },

  // School (Class 10/12 boards)
  {
    id: "cbse-class-12",
    name: "CBSE Class 12 Boards",
    fullForm: "Class 12 Board Examination",
    category: "school",
    level: "school",
    conductingBody: "CBSE",
    recurringMonth: 2,
    recurringDay: 15,
    description: "Annual board exams for Class 12 students.",
    region: "national",
    websiteHint: "cbse.gov.in",
    tags: ["Boards", "Class 12"],
  },
  {
    id: "cbse-class-10",
    name: "CBSE Class 10 Boards",
    fullForm: "Class 10 Board Examination",
    category: "school",
    level: "school",
    conductingBody: "CBSE",
    recurringMonth: 2,
    recurringDay: 21,
    description: "Annual board exams for Class 10 students.",
    region: "national",
    websiteHint: "cbse.gov.in",
    tags: ["Boards", "Class 10"],
  },

  // Law
  {
    id: "clat",
    name: "CLAT",
    fullForm: "Common Law Admission Test",
    category: "law",
    level: "ug",
    conductingBody: "Consortium of NLUs",
    recurringMonth: 12,
    recurringDay: 1,
    description: "Entrance for 5-year integrated law programmes at NLUs.",
    region: "national",
    websiteHint: "consortiumofnlus.ac.in",
    tags: ["Law", "NLU"],
  },

  // State exams (Tamil Nadu example)
  {
    id: "tnpsc-group-1",
    name: "TNPSC Group 1",
    fullForm: "Tamil Nadu PSC Group 1 Services",
    category: "state",
    level: "professional",
    conductingBody: "TNPSC",
    recurringMonth: 3,
    recurringDay: 16,
    description: "Tamil Nadu government Group I services (Deputy Collector, DSP, AC).",
    region: "tamilnadu",
    websiteHint: "tnpsc.gov.in",
    tags: ["TN Govt", "Group 1"],
  },
  {
    id: "tnpsc-group-2",
    name: "TNPSC Group 2",
    fullForm: "TN PSC Group 2",
    category: "state",
    level: "professional",
    conductingBody: "TNPSC",
    recurringMonth: 6,
    recurringDay: 8,
    description: "Tamil Nadu Group II and IIA services.",
    region: "tamilnadu",
    websiteHint: "tnpsc.gov.in",
    tags: ["TN Govt", "Group 2"],
  },

  // Teaching
  {
    id: "ctet",
    name: "CTET",
    fullForm: "Central Teacher Eligibility Test",
    category: "teaching",
    level: "professional",
    conductingBody: "CBSE",
    recurringMonth: 12,
    recurringDay: 8,
    description: "Eligibility test for teachers in central government schools.",
    region: "national",
    websiteHint: "ctet.nic.in",
    tags: ["Teaching", "CTET"],
  },

  // Defence
  {
    id: "nda",
    name: "NDA",
    fullForm: "National Defence Academy",
    category: "defence",
    level: "ug",
    conductingBody: "UPSC",
    recurringMonth: 4,
    recurringDay: 21,
    description: "Entrance for the Indian armed forces — Army, Navy, Air Force.",
    region: "national",
    websiteHint: "upsc.gov.in",
    tags: ["Defence", "Army", "Navy", "Air Force"],
  },
  {
    id: "cds",
    name: "CDS",
    fullForm: "Combined Defence Services",
    category: "defence",
    level: "ug",
    conductingBody: "UPSC",
    recurringMonth: 9,
    recurringDay: 1,
    description: "Officer entry to IMA, OTA, INA and AFA.",
    region: "national",
    websiteHint: "upsc.gov.in",
    tags: ["Defence", "Officer"],
  },
];

export const REGIONS: { id: Exam["region"]; label: string }[] = [
  { id: "national", label: "All India" },
  { id: "tamilnadu", label: "Tamil Nadu" },
  { id: "karnataka", label: "Karnataka" },
  { id: "maharashtra", label: "Maharashtra" },
  { id: "delhi", label: "Delhi NCR" },
  { id: "andhra", label: "Andhra Pradesh" },
  { id: "kerala", label: "Kerala" },
  { id: "telangana", label: "Telangana" },
  { id: "west-bengal", label: "West Bengal" },
  { id: "uttar-pradesh", label: "Uttar Pradesh" },
];

export const CATEGORIES: { id: ExamCategory; label: string; emoji: string; color: string }[] = [
  { id: "engineering", label: "Engineering", emoji: "⚙️", color: "from-cyan-500 to-blue-600" },
  { id: "medical", label: "Medical", emoji: "🩺", color: "from-pink-500 to-rose-600" },
  { id: "civil-services", label: "Civil Services", emoji: "🏛️", color: "from-amber-500 to-orange-600" },
  { id: "banking", label: "Banking", emoji: "🏦", color: "from-emerald-500 to-green-600" },
  { id: "management", label: "Management", emoji: "📊", color: "from-violet-500 to-fuchsia-600" },
  { id: "school", label: "School Boards", emoji: "🎒", color: "from-yellow-500 to-amber-600" },
  { id: "law", label: "Law", emoji: "⚖️", color: "from-purple-500 to-fuchsia-600" },
  { id: "state", label: "State PSC", emoji: "🗺️", color: "from-orange-500 to-red-600" },
  { id: "teaching", label: "Teaching", emoji: "👨‍🏫", color: "from-rose-500 to-pink-600" },
  { id: "defence", label: "Defence", emoji: "🪖", color: "from-green-500 to-emerald-600" },
];

// Compute next occurrence given today + month/day
export function nextOccurrence(month?: number, day?: number): Date | null {
  if (!month || !day) return null;
  const today = new Date();
  let year = today.getFullYear();
  let target = new Date(year, month - 1, day);
  if (target < today) {
    year += 1;
    target = new Date(year, month - 1, day);
  }
  return target;
}

export function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
