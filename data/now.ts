// Single source of truth for "what I'm doing now" — used by the homepage
// bento block and the /now page. Update lastUpdated whenever you edit this.
export const nowData = {
  lastUpdated: 'September 2026',
  focus: 'Learn fast at my internship. Get consistent at DSA. Ship the next project.',
  currentlyBuilding: [
    'Full-stack products as an intern at Labmentix — SmartERP, PDF Sign, CloudVault and Voxora so far',
    'A self-hosted error monitoring + session replay platform (Sentry-style) — in planning',
    'A daily DSA practice routine — consistent progress over speed',
  ],
  currentlyLearning: [
    'Data Structures & Algorithms — my main focus this semester',
    'Computer Networks, Theory of Computation and Discrete Maths — this semester at VIT Bhopal',
    'System design — building scalable architectures for real-world applications',
  ],
  currentlyReading: [
    'Designing Data-Intensive Applications — Martin Kleppmann',
    'The Pragmatic Programmer — David Thomas & Andrew Hunt',
    'Atomic Habits — James Clear (re-reading)',
  ],
};

// Hindi version for the English/हिन्दी toggle — keep in sync with the above.
export const nowDataHi = {
  lastUpdated: 'सितंबर 2026',
  focus: 'इंटर्नशिप में तेज़ी से सीखना। DSA में नियमित रहना। अगला प्रोजेक्ट शिप करना।',
  currentlyBuilding: [
    'Labmentix में इंटर्न के तौर पर फ़ुल-स्टैक प्रोडक्ट्स — अब तक SmartERP, PDF Sign, CloudVault और Voxora',
    'एक सेल्फ़-होस्टेड एरर मॉनिटरिंग + सेशन रीप्ले प्लैटफ़ॉर्म (Sentry जैसा) — प्लानिंग में',
    'रोज़ की DSA प्रैक्टिस — स्पीड से ज़्यादा नियमितता',
  ],
  currentlyLearning: [
    'डेटा स्ट्रक्चर्स और एल्गोरिदम — इस सेमेस्टर का मुख्य फ़ोकस',
    'कंप्यूटर नेटवर्क्स, थ्योरी ऑफ़ कम्प्यूटेशन और डिस्क्रीट मैथ्स — इस सेमेस्टर VIT भोपाल में',
    'सिस्टम डिज़ाइन — असली दुनिया के लिए स्केलेबल आर्किटेक्चर बनाना',
  ],
  currentlyReading: [
    'Designing Data-Intensive Applications — Martin Kleppmann',
    'The Pragmatic Programmer — David Thomas & Andrew Hunt',
    'Atomic Habits — James Clear (दोबारा पढ़ रहा हूँ)',
  ],
};
