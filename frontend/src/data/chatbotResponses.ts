export interface ChatResponse {
  keywords: string[];
  response: string;
}

export const chatbotResponses: ChatResponse[] = [
  {
    keywords: ['hello', 'hi', 'namaste', 'नमस्ते', 'हेलो', 'help', 'मदद'],
    response: 'नमस्ते! 🙏 मैं Vijay AI हूँ। मैं आपकी कैसे मदद कर सकता हूँ?\n\nHello! I am Vijay AI. How can I help you today?\n\n• Services के बारे में जानें\n• Payment help\n• Order tracking\n• Contact info'
  },
  {
    keywords: ['service', 'सेवा', 'apply', 'आवेदन', 'form', 'फॉर्म', 'certificate', 'प्रमाण पत्र'],
    response: '📋 सेवा के लिए आवेदन कैसे करें:\n\n1. "Services" tab पर जाएं\n2. अपनी सेवा खोजें\n3. Form भरें (नाम, मोबाइल, पता)\n4. Document upload करें\n5. Submit करें\n\nHow to apply:\n1. Go to Services tab\n2. Search your service\n3. Fill the form\n4. Upload document\n5. Submit'
  },
  {
    keywords: ['payment', 'पेमेंट', 'pay', 'qr', 'upi', 'पैसे', 'भुगतान'],
    response: '💳 Payment कैसे करें:\n\n1. Form submit करने के बाद Payment screen खुलेगी\n2. QR Code scan करें\n3. UPI app से payment करें\n4. Admin payment confirm करेगा\n\nPayment Method:\n• UPI QR Code scan करें\n• PhonePe, GPay, Paytm से pay करें\n• Admin confirmation के बाद status update होगा'
  },
  {
    keywords: ['track', 'tracking', 'status', 'order', 'ऑर्डर', 'स्टेटस', 'my orders', 'मेरे ऑर्डर'],
    response: '📦 Order Tracking:\n\n"My Orders" tab में जाएं और अपना order देखें।\n\nOrder के 4 stages हैं:\n1. ✅ Form Submitted\n2. 💳 Payment Completed\n3. ⚙️ Processing\n4. 🎉 Filling Completed\n\nGo to "My Orders" tab to track your application status.'
  },
  {
    keywords: ['contact', 'संपर्क', 'phone', 'फोन', 'whatsapp', 'call', 'कॉल', 'number', 'नंबर'],
    response: '📞 संपर्क करें / Contact Us:\n\n📱 Phone: +91 81730 64549\n💬 WhatsApp: +91 81730 64549\n\n"Contact" tab में जाएं और directly call या WhatsApp करें।\n\nVisit the Contact tab to call or WhatsApp us directly.'
  },
  {
    keywords: ['pan', 'पैन', 'aadhar', 'आधार', 'voter', 'वोटर', 'ration', 'राशन'],
    response: '🪪 ID Card Services:\n\n• Naya Pan Card - नया पैन कार्ड\n• Pan Card Correction - पैन कार्ड सुधार\n• Aadhar Card Update - आधार अपडेट\n• Voter ID New - नया वोटर आईडी\n• Ration Card Online - राशन कार्ड\n\nServices tab में जाकर apply करें।'
  },
  {
    keywords: ['pension', 'पेंशन', 'vridha', 'वृद्धा', 'vidhwa', 'विधवा', 'divyang', 'दिव्यांग'],
    response: '👴 Pension Services:\n\n• Vridha Pension - वृद्धा पेंशन\n• Vidhwa Pension - विधवा पेंशन\n• Divyang Pension - दिव्यांग पेंशन\n• Pension KYC - पेंशन KYC\n\nServices tab में जाकर apply करें।'
  },
  {
    keywords: ['passport', 'पासपोर्ट', 'driving', 'ड्राइविंग', 'license', 'लाइसेंस'],
    response: '🚗 Travel & License Services:\n\n• Naya Passport - नया पासपोर्ट\n• Driving License - ड्राइविंग लाइसेंस\n• Railway Ticket - रेलवे टिकट\n• Flight Ticket - फ्लाइट टिकट\n\nServices tab में जाकर apply करें।'
  },
  {
    keywords: ['receipt', 'रसीद', 'download', 'print', 'प्रिंट'],
    response: '🧾 Receipt कैसे पाएं:\n\nजब आपका order "Filling Completed" हो जाए, तब:\n1. My Orders tab में जाएं\n2. Completed order पर click करें\n3. "View Receipt" button दबाएं\n4. Print या Download करें\n\nReceipt is auto-generated when your order is completed.'
  },
  {
    keywords: ['register', 'registration', 'signup', 'new user', 'नया', 'account', 'अकाउंट'],
    response: '📝 नया Account बनाएं:\n\n1. Login screen पर "Register" click करें\n2. अपना नाम, मोबाइल नंबर और password डालें\n3. Submit करें\n4. Login करें और services use करें\n\nTo create account:\n1. Click Register on login screen\n2. Enter name, mobile & password\n3. Submit and login'
  },
  {
    keywords: ['document', 'डॉक्यूमेंट', 'upload', 'अपलोड', 'file', 'फाइल', 'pdf', 'image'],
    response: '📎 Document Upload:\n\n• Image files (JPG, PNG) upload कर सकते हैं\n• PDF files भी accept होती हैं\n• Aadhaar card, Biodata, etc.\n• Maximum file size: 10MB\n\nForm में "Upload Document" button पर click करके file select करें।'
  },
];

export function getBotResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  
  for (const item of chatbotResponses) {
    if (item.keywords.some(kw => lowerMsg.includes(kw.toLowerCase()))) {
      return item.response;
    }
  }
  
  return '🤔 मुझे समझ नहीं आया। कृपया दोबारा पूछें।\n\nI didn\'t understand. Please try asking about:\n• Services (सेवाएं)\n• Payment (पेमेंट)\n• Order Tracking (ऑर्डर ट्रैकिंग)\n• Contact (संपर्क)\n• Registration (रजिस्ट्रेशन)';
}
