import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MessageCircle, X, Send, Loader2, Trash2, MoreVertical, ChevronDown, Mail, Bot } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useLang } from '@/contexts/LanguageContext';
import { useContent } from '@/contexts/ContentContext';
import { sendToGroq, ChatMessage } from '@/services/aiService';
import { translations } from '@/lib/i18n';

type Lang = 'en' | 'bn'; // Define Lang type

// Context-aware dynamic messages — moved to module scope to avoid re-creating on every render
const contextMessages: Record<string, Array<{ en: string, bn: string }>> = {
  hero: [
    { en: 'Chat with ORBIT!', bn: 'ORBIT-এর সাথে চ্যাট করুন!' },
    { en: 'Ready to launch your project?', bn: 'প্রজেক্ট শুরু করতে প্রস্তুত?' },
    { en: 'Need a custom AI solution?', bn: 'কাস্টম এআই সলিউশন লাগবে?' },
    { en: 'Let’s transform your ideas into reality!', bn: 'আপনার আইডিয়াগুলোকে বাস্তবে রূপ দিই চলুন!' },
    { en: 'Looking for a reliable tech partner?', bn: 'নির্ভরযোগ্য টেক পার্টনার খুঁজছেন?' },
  ],
  services: [
    { en: 'Need help choosing a service?', bn: 'সঠিক সেবা খুঁজতে সাহায্য লাগবে?' },
    { en: 'Want to know more about our services?', bn: 'আমাদের সার্ভিস নিয়ে আরও জানতে চান?' },
    { en: 'We build Web, AI, and Mobile Apps.', bn: 'আমরা ওয়েব, এআই এবং মোবাইল অ্যাপ বানাই।' },
    { en: 'Looking for End-to-End Development?', bn: 'এন্ড-টু-এন্ড ডেভেলপমেন্ট খুঁজছেন?' },
    { en: 'Ask me about our tech expertise!', bn: 'আমাদের টেক এক্সপার্টিজ সম্পর্কে জিজ্ঞেস করুন!' },
  ],
  project: [
    { en: "Like our previous work?", bn: 'আমাদের কাজগুলো ভালো লেগেছে?' },
    { en: "Let's build something like this for you.", bn: 'আপনার জন্যও এমন কিছু বানাতে পারি।' },
    { en: 'Want a completely custom solution?', bn: 'আপনার জন্য সম্পূর্ণ কাস্টম সলিউশন চাই?' },
    { en: 'Check out the details of these projects.', bn: 'এই প্রজেক্টগুলোর বিস্তারিত দেখতে পারেন।' },
    { en: 'Tell me your project requirements!', bn: 'আপনার প্রজেক্টের রিকোয়ারমেন্টগুলো জানান!' },
  ],
  'tech-stack': [
    { en: 'Curious about our technologies?', bn: 'আমাদের প্রযুক্তি সম্পর্কে জানতে চান?' },
    { en: 'Need a specific tech stack?', bn: 'কোনো নির্দিষ্ট প্রযুক্তির কাজ খুঁজছেন?' },
    { en: 'We use modern, scalable tech.', bn: 'আমরা আধুনিক এবং স্কেলেবল প্রযুক্তি ব্যবহার করি।' },
    { en: 'Ask me about any specific tool.', bn: 'কোনো নির্দিষ্ট টুল সম্পর্কে জিজ্ঞেস করতে পারেন।' },
  ],
  'why-us': [
    { en: 'Want to know why clients choose us?', bn: 'ক্লায়েন্টরা কেন আমাদের ভালোবাসে?' },
    { en: 'We guarantee 100% satisfaction.', bn: 'আমরা ১০০% গ্যারান্টি দিয়ে কাজ করি।' },
    { en: 'Ask about our communication process.', bn: 'আমাদের কমিউনিকেশন প্রসেস সম্পর্কে জানুন।' },
    { en: 'We deliver on time, every time.', bn: 'আমরা সবসময় ঠিক সময়ে কাজ ডেলিভারি দিই।' },
  ],
  leadership: [
    { en: 'Want to talk to our leadership team?', bn: 'আমাদের লিডারশিপ টিমের সাথে কথা বলবেন?' },
    { en: 'Any questions for our founders?', bn: 'আমাদের ফাউন্ডারদের জন্য কোনো প্রশ্ন আছে?' },
  ],
  contact: [
    { en: 'Have a specific question?', bn: 'কোনো নির্দিষ্ট প্রশ্ন আছে?' },
    { en: 'Drop me a message here!', bn: 'এখানে আমাকে ম্যাসেজ দিন!' },
    { en: 'Want to book a free consultation?', bn: 'ফ্রি কনসাল্টেশন বুক করতে চান?' },
    { en: 'I can connect you to our team.', bn: 'আমি আপনাকে আমাদের টিমের সাথে কানেক্ট করতে পারি।' },
  ],
  default: [
    { en: 'Chat with ORBIT', bn: 'ORBIT-এর সাথে চ্যাট করুন' },
    { en: 'How can I help you today?', bn: 'কীভাবে সাহায্য করতে পারি?' },
    { en: 'Still here if you need me!', bn: 'আমি এখানেই আছি, কোনো সাহায্য লাগলে বলবেন!' },
    { en: 'Have any questions?', bn: 'আপনার কোনো প্রশ্ন আছে?' },
    { en: 'Let’s discuss your project.', bn: 'চলুন আপনার প্রজেক্ট নিয়ে আলোচনা করি।' },
    { en: 'Need a quick estimate?', bn: 'দ্রুত প্রজেক্টের খরচ জানতে চান?' },
  ]
};

export function Chatbot() {
  const { t, lang: siteLang, toggleLang } = useLang();
  const { content } = useContent(); // Access dynamic content
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLang, setChatLang] = useState<Lang>('en'); // Independent chat language
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ en: 'Chat with ORBIT', bn: 'ORBIT-এর সাথে চ্যাট করুন' });
  const [hasDismissedPopup, setHasDismissedPopup] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidePopupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summarySentRef = useRef(false);


  // Helper to determine the section currently in view
  const getActiveSection = () => {
    const sections = ['hero', 'services', 'tech-stack', 'why-us', 'project', 'reviews', 'leadership', 'contact'];
    let currentSection = 'default';
    let maxVisibleHeight = 0;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Calculate how much of the element is visible in the viewport
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (visibleHeight > maxVisibleHeight && visibleHeight > window.innerHeight * 0.2) {
          maxVisibleHeight = visibleHeight;
          currentSection = id;
        }
      }
    });
    return currentSection;
  };

  // Select a random message for a section, ensuring it's not the exact same as the current
  const getRandomContextMessage = (sectionId: string) => {
    const msgs = contextMessages[sectionId] || contextMessages['default'];
    if (msgs.length === 1) return msgs[0];

    // Try to pick one that is different from the current
    const unused = msgs.filter(m => m.en !== popupMessage.en);
    if (unused.length > 0) {
      return unused[Math.floor(Math.random() * unused.length)];
    }
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  // Listen to external interactions to mute the popup (e.g., CTA dropdown opened)
  useEffect(() => {
    const handleRemoteDismiss = () => setHasDismissedPopup(true);
    window.addEventListener('orbit-cta-open', handleRemoteDismiss);
    return () => window.removeEventListener('orbit-cta-open', handleRemoteDismiss);
  }, []);

  // Auto-hide the welcome popup after 8 seconds if ignored
  useEffect(() => {
    if (showWelcomePopup) {
      const t = setTimeout(() => {
        setShowWelcomePopup(false);
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [showWelcomePopup]);

  // Idle tracking logic
  useEffect(() => {
    if (open || messages.length > 0 || hasDismissedPopup) {
      setShowWelcomePopup(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (hidePopupTimer.current) clearTimeout(hidePopupTimer.current);
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (hidePopupTimer.current) clearTimeout(hidePopupTimer.current);

      idleTimer.current = setTimeout(() => {
        // User has been idle for 10 seconds
        if (!open && messages.length === 0 && !hasDismissedPopup) {
          const activeSec = getActiveSection();
          const newMessage = getRandomContextMessage(activeSec);
          setPopupMessage(newMessage);
          setShowWelcomePopup(true);
        }
      }, 10000); // 10 seconds idle triggers popup
    };

    const hideAndReset = () => {
      // Only hide if the user specifically interacts with the UI in a major way (click/tap), 
      // otherwise natural scrolling shouldn't punish them by hiding the popup instantly.
      setShowWelcomePopup((prev) => {
        if (prev) return false;
        return prev;
      });
      resetIdleTimer();
    };

    // Listeners for user activity
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true }); // Scroll only resets timer, doesn't hide

    // Hard interactions that hide the popup
    window.addEventListener('keydown', hideAndReset, { passive: true });
    window.addEventListener('mousedown', hideAndReset, { passive: true });
    window.addEventListener('touchstart', hideAndReset, { passive: true });

    // Initial trigger
    resetIdleTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (hidePopupTimer.current) clearTimeout(hidePopupTimer.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      window.removeEventListener('keydown', hideAndReset);
      window.removeEventListener('mousedown', hideAndReset);
      window.removeEventListener('touchstart', hideAndReset);
    };
  }, [open, messages.length, hasDismissedPopup, popupMessage.en]);


  // Dynamic chatbot strings with fallbacks to static translations (memoized)
  const chatContentMemo = useMemo(() => ({
    title: (content[chatLang] as any)?.chatbot?.title || translations[chatLang].chatbot.title,
    placeholder: (content[chatLang] as any)?.chatbot?.placeholder || translations[chatLang].chatbot.placeholder,
    greeting: (content[chatLang] as any)?.chatbot?.greeting || translations[chatLang].chatbot.greeting,
    systemPrompt: (content[chatLang] as any)?.chatbot?.systemPrompt || '',
  }), [content, chatLang]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chatbot-menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const scrollYRef = useRef(0);

  useEffect(() => {
    if (open && window.innerWidth < 768) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      // Fully lock the body to prevent any content shifting
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      // Also lock the html element
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      // Restore body position and scroll
      const savedY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      if (savedY) {
        window.scrollTo(0, savedY);
      }
    }
    return () => {
      const savedY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      if (savedY) {
        window.scrollTo(0, savedY);
      }
    };
  }, [open]);

  // Add state to track if email has been provided
  const [hasProvidedEmail, setHasProvidedEmail] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading'>('idle');

  // Load email status on mount
  useEffect(() => {
    const status = localStorage.getItem('orbit_chatbot_email_provided');
    if (status === 'true') {
      setHasProvidedEmail(true);
    }
  }, []);

  // --- INACTIVITY SUMMARY: After 25s of no new messages, generate AI summary and update lead ---
  useEffect(() => {
    // Clear previous timer on every message change
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    // Only trigger if: user has provided email, there are meaningful messages, and summary hasn't been sent for this session
    const userMsgs = messages.filter(m => m.role === 'user');
    const assistantMsgs = messages.filter(m => m.role === 'assistant');
    if (!hasProvidedEmail || userMsgs.length < 1 || assistantMsgs.length < 1) return;

    inactivityTimer.current = setTimeout(async () => {
      if (summarySentRef.current) return;
      summarySentRef.current = true;

      try {
        // Build the raw chat for the AI to summarize
        const rawChat = messages
          .filter(m => m.role !== 'system')
          .map(m => `${m.role === 'user' ? 'User' : 'Orbit AI'}: ${m.content}`)
          .join('\n');

        // Ask the AI to produce a compact 2-4 sentence summary
        const summaryPrompt: ChatMessage[] = [
          {
            role: 'system',
            content: `You are a chat summarizer. Given a conversation between a user and Orbit SaaS AI, produce a compact 2-4 sentence summary. Include: what the user asked about, what services/projects interested them, and any action items. Be concise and factual. Do NOT use markdown. Output ONLY the summary text.`
          },
          { role: 'user', content: rawChat }
        ];

        const aiSummary = await sendToGroq(summaryPrompt);

        // Get the stored email (from lead form or interceptor)
        const storedEmail = leadEmail || localStorage.getItem('orbit_chatbot_email') || '';
        if (!storedEmail) return;

        // Update the lead with the AI-generated summary
        const API_BASE = import.meta.env.VITE_API_URL || '';
        await fetch(`${API_BASE}/api/submit-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: storedEmail,
            source: 'Chatbot Gateway',
            interest: userMsgs[userMsgs.length - 1]?.content || 'General Inquiry',
            chat_summary: `[AI Summary] ${aiSummary}`
          })
        });
      } catch {
        // Fail silently — this is a background enhancement
      }
    }, 45000);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [messages, hasProvidedEmail]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !leadEmail.includes('@')) {
      toast.error(chatLang === 'bn' ? 'দয়া করে সঠিক ইমেইল দিন' : 'Please enter a valid email');
      return;
    }

    setLeadStatus('loading');
    try {
      // Format chat summary to include in the lead
      const chatSummary = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Orbit AI'}: ${m.content}`)
        .join('\n\n');

      // Extract user interest from their messages
      const userMessages = messages.filter(m => m.role === 'user');
      const extractedInterest = userMessages.length > 0
        ? userMessages[userMessages.length - 1].content
        : 'General Inquiry';

      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/submit-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          source: 'Chatbot Gateway',
          interest: extractedInterest,
          chat_summary: chatSummary
        })
      });

      if (res.ok) {
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        localStorage.setItem('orbit_chatbot_email', leadEmail);
        setHasProvidedEmail(true);
        setShowEmailPrompt(false);
        summarySentRef.current = false; // Allow summary to fire for this session
        toast.success(chatLang === 'bn' ? 'ধন্যবাদ! এখন আপনি চ্যাট শুরু করতে পারেন।' : 'Thank you! You can now start chatting.');

        // Auto-reply to the message they already typed
        executeAIResponse(messages);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error(chatLang === 'bn' ? 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন' : 'Something went wrong, please try again');
    } finally {
      setLeadStatus('idle');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: ReturnType<typeof setTimeout>;

    const updateViewport = () => {
      if (window.visualViewport) {
        const isKbOpen = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isKbOpen);

        if (window.innerWidth < 768) {
          if (isKbOpen) {
            // Keyboard is open: use exact visual viewport height, pin to top
            const vvHeight = window.visualViewport.height;
            setViewportStyle({
              height: `${vvHeight}px`,
              top: '0px',
              bottom: 'auto',
              transition: 'height 0.25s cubic-bezier(0.32, 0.72, 0, 1)'
            });
          } else {
            // Keyboard closed: clear inline styles, let CSS h-[100dvh] handle it
            setViewportStyle({});
          }

          // Always prevent scroll when chatbot is open on mobile
          if (open) {
            window.scrollTo(0, 0);
          }
        } else {
          // Desktop: use actual visible height minus bottom padding (toggle button area ~100px)
          const availableHeight = window.visualViewport.height - 100;
          const maxH = Math.min(availableHeight, window.innerHeight * 0.85);
          setViewportStyle({
            maxHeight: `${maxH}px`,
          });
        }
      }
    };

    const debouncedUpdateViewport = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateViewport, 100); // Debounce by 100ms
    };

    updateViewport();
    window.visualViewport?.addEventListener('resize', debouncedUpdateViewport);
    window.visualViewport?.addEventListener('scroll', debouncedUpdateViewport);
    window.addEventListener('resize', debouncedUpdateViewport);

    return () => {
      clearTimeout(resizeTimer);
      window.visualViewport?.removeEventListener('resize', debouncedUpdateViewport);
      window.visualViewport?.removeEventListener('scroll', debouncedUpdateViewport);
      window.removeEventListener('resize', debouncedUpdateViewport);
    };
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const clearChat = () => {
    setMessages([]);
    setSuggestions([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);

    // --- EMAIL INTERCEPTOR ---
    // If the user types an email, capture it silently in the background
    const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      try {
        // Find the user's previous context/interest
        const userMessagesOnly = messages.filter(m => m.role === 'user');
        const extractedInterest = userMessagesOnly.length > 0
          ? userMessagesOnly[userMessagesOnly.length - 1].content
          : 'General Inquiry';

        const chatSummary = messages
          .map(m => `${m.role === 'user' ? 'User' : 'Orbit AI'}: ${m.content}`)
          .join('\n\n');

        const API_BASE = import.meta.env.VITE_API_URL || '';
        fetch(`${API_BASE}/api/submit-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailMatch[0],
            source: 'AI Chatbot Intercept',
            interest: extractedInterest,
            chat_summary: chatSummary
          })
        }).catch(() => { });
        localStorage.setItem('orbit_chatbot_email_provided', 'true');
        localStorage.setItem('orbit_chatbot_email', emailMatch[0]);
        setHasProvidedEmail(true);
        summarySentRef.current = false; // Allow summary to fire
      } catch (e) {
        // Fail silently so chat UX is not interrupted
      }
    }
    // -------------------------

    if (!hasProvidedEmail && !emailMatch) {
      if (messages.filter(m => m.role === 'user').length >= 1) {
        setShowEmailPrompt(true);
        setIsLoading(false);
        return;
      }
    }

    await executeAIResponse(newMessages);
  };

  const executeAIResponse = async (chatHistory: ChatMessage[]) => {
    setIsLoading(true);
    try {
      // 1. Fetch knowledge base from server (reads directly from database)
      const activeT = chatLang === 'bn' ? translations.bn : translations.en;
      const chatContent = activeT.chatbot;
      let knowledgeBase = '';
      let qaContext = '';

      const API_BASE = import.meta.env.VITE_API_URL || '';
      try {
        const ctxRes = await fetch(`${API_BASE}/api/chatbot-context?lang=${chatLang}`);
        if (ctxRes.ok) {
          const ctxData = await ctxRes.json();
          knowledgeBase = ctxData.knowledgeBase || '';
          qaContext = ctxData.qaPairs || '';
        }
      } catch {
        // API failed — fall back to client-side assembly below
      }

      // Fallback: build from client-side content if API didn't return data
      if (!knowledgeBase) {
        const activeContent = content[chatLang] || content['en'];
        knowledgeBase = "ORBIT SaaS - PRIMARY AUTHORITY DATA:\n\n";

        const hero = (activeContent.hero as any);
        if (hero) {
          knowledgeBase += `IDENTITY & MISSION: ${hero.title}. Tagline: "${hero.tagline}". Mission: ${hero.subtitle}\n\n`;
        }

        const siteBaseUrl = 'https://orbitsaas.cloud';
        const projects = (activeContent.projects as any)?.items || [];
        if (projects.length > 0) {
          knowledgeBase += "COMPLETED PORTFOLIO PROJECTS (USE THESE EXACT LINKS):\n";
          projects.forEach((p: any, index: number) => {
            const projectId = p.id || index;
            knowledgeBase += `- ${p.title}: ${p.desc} | URL: ${siteBaseUrl}/project/${projectId}\n`;
          });
          knowledgeBase += "\n";
        }

        const services = (activeContent.services as any)?.items || [];
        if (services.length > 0) {
          knowledgeBase += "CORE AGENCY SERVICES:\n";
          services.forEach((s: any) => { knowledgeBase += `- ${s.title}: ${s.desc}\n`; });
          knowledgeBase += "\n";
        }

        const linksData = (activeContent.links as any)?.items || [];
        if (linksData.length > 0) {
          knowledgeBase += "IMPORTANT LINKS:\n";
          linksData.forEach((l: any) => { knowledgeBase += `- ${l.title}: ${l.link}\n`; });
          knowledgeBase += "\n";
        }

        knowledgeBase += `CORE LINKS: Home: ${siteBaseUrl}, Projects: ${siteBaseUrl}/project, Contact: ${siteBaseUrl}/#contact\n\n`;

        qaContext = (activeT.chatbot.qaPairs || [])
          .map((qa: { question: string; answer: string }) => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join('\n\n');
      }

      // 2. Prepare System Prompt based on chatLang
      const adminPrompt = (chatContent as any)?.systemPrompt;
      const defaultPrompt = (chatLang === 'en'
        ? `You are ORBIT SaaS's official AI rep. Rules:
GREETING: First msg only: "Hello! Welcome to Orbit SaaS." Never re-introduce after.
ABOUT: Bangladesh-based agency offering A-Z custom software globally. Long track record.
PRICING: Based on project weight/complexity. No hourly work. End-to-End only. Process: MVP→customization→milestones(25/50/75/100%)→payment by progress. Initial fund at MVP. Yearly maintenance subscription available.
DELIVERY: ~1 week typical. On 100% completion+payment: source code, env files, video tutorials, docs.
SERVICES: We build ALL types of software.
COMMS: Direct contact with PM via Telegram/WhatsApp. Updates every 10% milestone.
SCOPE: NEVER act as general AI. Redirect off-topic to ORBIT services.
LEADS: If user asks pricing/consultation/project start AND hasn't given email (see EMAIL STATUS), ask for email first. If already given, answer directly.
LINKS: Provide a link ONLY if the user specifically asks to see a project, service, or contact info. Do NOT include links in every message. NEVER use generic labels like "PROJECT SHOWCASE" or "AI SERVICES". Instead, use the actual name of the project or service (e.g., [Project Name](URL)). The UI will convert these into compact buttons. NEVER fabricate URLs. If a specific URL isn't provided, just describe it without a link.
LANG: English only. If user speaks Bangla, prepend "[SUGGEST_SWITCH]".
STYLE: Casual+professional. HARD LIMIT: 50-80 words max. Count your words. Max 3 bullets or 1 short paragraph. NEVER exceed 80 words. If listing items, use very short bullet points (5-8 words each).
FOLLOW-UP: You MUST ALWAYS end EVERY reply with exactly 1 suggested action on its OWN SEPARATE NEW LINE starting with "💬". NEVER embed the follow-up inside your reply paragraph. NEVER use 🟢 or any other emoji for the follow-up — ONLY use 💬. The follow-up line MUST be separated from the main text by a newline. Phrase it AS IF THE USER IS SPEAKING TO YOU. Use "your" (referring to ORBIT), not "our". BAD: "💬 Learn more about our services" or "💬 Would you like to see our projects?" or ending a sentence with 🟢 Tell me about X. GOOD: "💬 Tell me about your pricing" or "💬 Show me your AI projects" or "💬 I want to start a project". NEVER phrase as a bot/company speaking. NEVER use "our". NEVER skip this.`
        : `আপনি ORBIT SaaS-এর অফিসিয়াল AI প্রতিনিধি। নিয়ম:
শুভেচ্ছা: শুধু প্রথম মেসেজে "হ্যালো! Orbit SaaS-এ স্বাগতম।" পরে আর পরিচয়/শুভেচ্ছা নয়।
পরিচিতি: বাংলাদেশভিত্তিক, বিশ্বব্যাপী A-Z কাস্টম সফটওয়্যার। দীর্ঘ অভিজ্ঞতা।
মূল্য: প্রজেক্টের ওজন অনুযায়ী। ঘণ্টাভিত্তিক নয়। End-to-End। ধাপ: MVP→কাস্টমাইজ→২৫/৫০/৭৫/১০০% মাইলস্টোন→প্রগ্রেস পেমেন্ট। MVP-তে প্রাথমিক ফান্ড। বার্ষিক মেইনটেন্যান্স সাবস্ক্রিপশন আছে।
ডেলিভারি: সাধারণত ১ সপ্তাহ। ১০০% শেষে: সোর্স কোড, env ফাইল, ভিডিও টিউটোরিয়াল, ডকুমেন্টেশন।
সেবা: সব ধরনের সফটওয়্যার তৈরি করি।
যোগাযোগ: PM-এর সাথে টেলিগ্রাম/হোয়াটসঅ্যাপে সরাসরি। প্রতি ১০% আপডেট।
সীমা: সাধারণ AI নয়। অপ্রাসঙ্গিক বিষয় ORBIT-এ ফেরান।
লিড: প্রাইসিং/কনসাল্টেশন চাইলে ও ইমেইল না দিলে (EMAIL STATUS দেখুন) আগে ইমেইল চান। দিয়ে থাকলে সরাসরি উত্তর দিন।
লিংক: শুধু knowledge base-এর URL ব্যবহার করুন। বানাবেন না। মার্কডাউন: [Text](URL)। কখনো "আমাদের ওয়েবসাইট দেখুন" বলবেন না — ইউজার এখন ওয়েবসাইটেই আছে।
ভাষা: শুধু বাংলায়। ইংরেজি বললে "[SUGGEST_SWITCH]" দিন।
শৈলী: ক্যাজুয়াল+পেশাদার। কঠিন সীমা: ১৪০-১৬০ শব্দ। শব্দ গুনুন। সর্বোচ্চ ৩ বুলেট বা ১ ছোট প্যারা। কখনো ৬০ শব্দের বেশি নয়।
ফলো-আপ: প্রতিটি উত্তরে অবশ্যই শেষে আলাদা নতুন লাইনে "💬" দিয়ে ১টি পরবর্তী পদক্ষেপ দিন ইউজারের দৃষ্টিকোণ থেকে। কখনো 🟢 বা অন্য ইমোজি ব্যবহার করবেন না — শুধু 💬। প্যারাগ্রাফের ভিতরে ফলো-আপ লিখবেন না, আলাদা লাইনে লিখুন। "তোমাদের" ব্যবহার করুন (ORBIT বোঝাতে), "আমাদের" নয়। খারাপ: "💬 আমাদের সেবা সম্পর্কে জানুন"। ভালো: "💬 তোমাদের প্রাইসিং জানাও" বা "💬 তোমাদের AI প্রজেক্টগুলো দেখাও"। কখনো বটের ভাষায় লিখবেন না।`);
      const systemPrompt = (adminPrompt && adminPrompt.trim()) ? adminPrompt : defaultPrompt;

      // 3. Email status context
      const emailStatus = hasProvidedEmail
        ? 'EMAIL: User already gave email. Do NOT ask again.'
        : 'EMAIL: User has NOT given email. Ask when relevant.';

      // 4. Combine everything (compact — server already sends AI gist)
      const fullSystemMessage = `${systemPrompt}\n\n${emailStatus}\n\n=== KNOWLEDGE BASE ===\n${knowledgeBase}${qaContext ? `\n\n=== Q&A ===\n${qaContext}` : ''}`;

      // 6. Cap conversation history to last 8 messages to limit token growth
      const recentHistory = chatHistory.filter(m => m.role !== 'system').slice(-8);

      const conversationHistory = [
        {
          role: 'system',
          content: fullSystemMessage
        } as ChatMessage,
        ...recentHistory
      ];

      const responseContent = await sendToGroq(conversationHistory);

      // Extract follow-up suggestions with multiple fallback strategies:
      const lines = responseContent.split('\n').filter(l => l.trim());
      const suggestionLines: string[] = [];

      // Common suggestion emoji pattern (AI sometimes uses these instead of 💬)
      const suggestionEmojiPattern = /[💬🟢➡️👉✅🔹🔸💡🎯📌⭐🚀🔵🟡🟠🔴⚡]/;

      // Strategy 1: Lines starting with 💬 or other common suggestion emojis (ideal case)
      const emojiLines = lines.filter(l => suggestionEmojiPattern.test(l.trim().charAt(0)) || l.trim().startsWith('💬'));
      suggestionLines.push(...emojiLines);

      let remainingLines = lines.filter(l => !suggestionEmojiPattern.test(l.trim().charAt(0)) && !l.trim().startsWith('💬'));

      // Strategy 1b: Emoji-prefixed suggestion embedded INLINE at end of a paragraph
      // e.g. "...strategic planning and direction. 🟢 Tell me about your interest in working with him."
      if (suggestionLines.length === 0 && remainingLines.length > 0) {
        const lastLine = remainingLines[remainingLines.length - 1];
        const inlineEmojiMatch = lastLine.match(/(.*?[.!?])\s*([💬🟢➡️👉✅🔹🔸💡🎯📌⭐🚀🔵🟡🟠🔴⚡]\s*.{5,120})$/);
        if (inlineEmojiMatch) {
          const beforeText = inlineEmojiMatch[1].trim();
          const suggestionText = inlineEmojiMatch[2].trim();
          suggestionLines.push(suggestionText);
          remainingLines[remainingLines.length - 1] = beforeText;
          remainingLines = remainingLines.filter(l => l.trim());
        }
      }

      // Strategy 2: Last line ending with ? (standalone follow-up question)
      // ONLY extract if there are at least 2 remaining lines (so message isn't emptied)
      if (suggestionLines.length === 0 && remainingLines.length > 1) {
        const lastLine = remainingLines[remainingLines.length - 1]?.trim() || '';
        if (lastLine.endsWith('?') && !lastLine.startsWith('-') && !lastLine.startsWith('•')) {
          suggestionLines.push(lastLine);
          remainingLines = remainingLines.slice(0, -1);
        }
      }

      // Strategy 3: Extract last sentence ending with ? from a paragraph
      // ONLY if removing it won't leave the message empty
      if (suggestionLines.length === 0 && remainingLines.length > 0) {
        const fullText = remainingLines.join('\n');
        const sentences = fullText.match(/[^.!?\n]*\?/g);
        if (sentences && sentences.length > 0) {
          const lastQuestion = sentences[sentences.length - 1].trim();
          if (lastQuestion.length > 5 && lastQuestion.length < 120) {
            // Only extract if removing it leaves meaningful content
            const idx = fullText.lastIndexOf(lastQuestion);
            const cleaned = (fullText.slice(0, idx) + fullText.slice(idx + lastQuestion.length)).trim();
            if (cleaned.length > 10) {
              suggestionLines.push(lastQuestion);
              remainingLines = cleaned.split('\n').filter(l => l.trim());
            }
          }
        }
      }

      // Strategy 4: Catch trailing imperative sentences embedded inline
      // e.g. "...and direction. Tell me about your interest in working with him."
      if (suggestionLines.length === 0 && remainingLines.length > 0) {
        const lastLine = remainingLines[remainingLines.length - 1];
        const imperativeMatch = lastLine.match(/(.*?[.!?])\s*((?:Tell me|Show me|Ask about|I(?:'d| would) like to|I want to|Help me|Share|Let me know|Inform me)\s.{5,100}[.!?]?)\s*$/);
        if (imperativeMatch) {
          const beforeText = imperativeMatch[1].trim();
          const suggestionText = imperativeMatch[2].trim();
          if (beforeText.length > 10) {
            suggestionLines.push(suggestionText);
            remainingLines[remainingLines.length - 1] = beforeText;
            remainingLines = remainingLines.filter(l => l.trim());
          }
        }
      }


      const cleanedContent = remainingLines.join('\n').trimEnd();
      // Convert bot-perspective suggestions to user-perspective
      const newSuggestions = suggestionLines.map(l => {
        let s = l.replace(/^[\s💬🟢➡️👉✅🔹🔸💡🎯📌⭐🚀🔵🟡🟠🔴⚡]*/, '').trim();
        // Convert "Would you like to know about X?" → "Tell me about X"
        s = s.replace(/^would you like to (know|learn|hear) (about|more about)\s*/i, 'Tell me about ');
        // Convert "Would you like to see X?" → "Show me X"
        s = s.replace(/^would you like to (see|view|check out)\s*/i, 'Show me ');
        // Convert "Would you like to X?" → "I'd like to X"
        s = s.replace(/^would you like to\s*/i, "I'd like to ");
        // Convert "Do you want to X?" → "I want to X"
        s = s.replace(/^do you want to\s*/i, 'I want to ');
        // Convert "Shall I X?" → "Please X"
        s = s.replace(/^shall I\s*/i, 'Please ');
        // Convert "Can I help you with X?" → "Help me with X"
        s = s.replace(/^can I help you with\s*/i, 'Help me with ');
        // Convert "Learn more about our/the X" → "Tell me about your X"
        s = s.replace(/^learn more about (our|the)\s*/i, 'Tell me about your ');
        s = s.replace(/^learn more about\s*/i, 'Tell me about ');
        // Convert "Explore our X" → "Show me your X"
        s = s.replace(/^explore (our|the)\s*/i, 'Show me your ');
        s = s.replace(/^explore\s*/i, 'Show me ');
        // Convert "Check out our X" → "Show me your X"
        s = s.replace(/^check out (our|the)\s*/i, 'Show me your ');
        // Fix any remaining "our" → "your" (bot speaking as company)
        s = s.replace(/\bour\b/gi, 'your');
        // Remove trailing ? since these are now statements
        s = s.replace(/\?$/, '');
        // Capitalize first letter
        s = s.charAt(0).toUpperCase() + s.slice(1);
        return s;
      }).filter(Boolean);

      setSuggestions(newSuggestions);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanedContent }]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic Markdown-to-JSX Formatter (Bold, Links, Bullets)
  const formatMessage = useCallback((content: string) => {
    // 1. Pre-process to fix common AI punctuation spacing issues
    let processed = content
      .replace(/\s+([,.?!])/g, '$1')
      .replace(/(\*\*.*?)(([,.?!])\s*)\*\*/g, '$1**$2');

    // 2. Extract ALL links (markdown and raw)
    const linkPlaceholders: { url: string; text: string }[] = [];

    // First: Markdown links [text](url)
    processed = processed.replace(/\[([^\]]*?)]\(([^)]+)\)/g, (_match, text, url) => {
      const idx = linkPlaceholders.length;
      linkPlaceholders.push({ url, text: text.replace(/\*\*/g, '').trim() });
      return `__LINK_${idx}__`;
    });

    // Second: Raw URLs (that aren't already placeholders)
    processed = processed.replace(/(https?:\/\/[^\s)]+)/g, (url) => {
      // Skip if this URL is already inside a placeholder (though the regex above should have consumed it)
      if (processed.includes(`](${url})`)) return url;
      const idx = linkPlaceholders.length;
      linkPlaceholders.push({ url, text: '' });
      return `__LINK_${idx}__`;
    });

    const lines = processed.split('\n');

    // Helper: render inline content (bold, quoted text, + link placeholders)
    const renderInline = (text: string, keyPrefix: string) => {
      // Split by bold, link placeholders, AND double-quoted text
      const parts = text.split(/(\*\*.*?\*\*|__LINK_\d+__|"[^"]{2,}")/g);
      return parts.map((part, i) => {
        // Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${keyPrefix}-b${i}`} className="font-bold text-primary/90">{part.slice(2, -2)}</strong>;
        }
        // Double-quoted text → render as bold italic (no quotes)
        if (part.startsWith('"') && part.endsWith('"') && part.length > 2) {
          return <strong key={`${keyPrefix}-q${i}`} className="font-bold italic text-primary/90">{part.slice(1, -1)}</strong>;
        }
        // Link placeholder → render as bold "Click Me" button
        const linkMatch = part.match(/^__LINK_(\d+)__$/);
        if (linkMatch) {
          const link = linkPlaceholders[parseInt(linkMatch[1], 10)];
          return (
            <a
              key={`${keyPrefix}-l${i}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-1.5 mb-1 items-center px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-full text-[11px] tracking-normal shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 group animate-in zoom-in-50 duration-300"
            >
              <span className="mr-1">{link.text || 'CLICK HERE'}</span>
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          );
        }
        return part;
      });
    };

    return lines.map((line, lineIndex) => {
      // Handle Bullet Points
      const isBullet = /^\s*[*-]\s+/.test(line);
      let cleanLine = line.replace(/^\s*[*-]\s+/, '');

      if (isBullet) {
        // Auto-bold the main point (text before colon) if not already bolded
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex > 0 && colonIndex < 80 && !cleanLine.includes('**')) {
          cleanLine = `**${cleanLine.substring(0, colonIndex + 1)}**${cleanLine.substring(colonIndex + 1)}`;
        }
      }

      const inlineContent = renderInline(isBullet ? cleanLine : line, `line-${lineIndex}`);

      if (isBullet) {
        return (
          <div key={`line-${lineIndex}`} className="flex gap-2 pl-1 my-0.5 text-xs">
            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
            <span className="flex-1 leading-relaxed">{inlineContent}</span>
          </div>
        );
      }

      return (
        <p key={`line-${lineIndex}`} className={`text-xs leading-relaxed ${line.trim() === '' ? 'h-2' : 'mb-1.5 last:mb-0'}`}>
          {inlineContent}
        </p>
      );
    });
  }, []);

  return (
    <>
      {/* Backdrop for mobile - blur entire background and close on click */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[190] bg-background/80 chatbot-overlay-blur md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chatbot Welcome Popup (Speech Bubble) */}
      <AnimatePresence>
        {!open && showWelcomePopup && !hasDismissedPopup && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.3, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-[18dvh] mb-2 sm:mb-6 md:bottom-24 right-4 sm:right-6 z-[195] flex flex-col items-end pointer-events-none origin-[calc(100%-24px)_calc(100%+24px)]"
          >
            <div className="relative pointer-events-auto cursor-pointer group" onClick={() => setOpen(true)}>
              {/* Main Speech Bubble */}
              <motion.div
                animate={{
                  borderColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(16, 185, 129, 0.8)"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative flex flex-col items-start gap-0.5 bg-[#0a0a0f]/95 backdrop-blur-2xl border-[0.5px] rounded-xl rounded-br-sm px-3.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:-translate-y-1"
              >
                {/* Text Content */}
                <div className="flex flex-col items-start pr-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                    <span className="text-emerald-400">ORBIT </span><span className="text-amber-500">AI</span>
                  </p>
                  <span className="text-[12px] font-medium text-white/90 tracking-wide whitespace-nowrap drop-shadow-md transition-all duration-300">
                    {chatLang === 'bn' ? popupMessage.bn : popupMessage.en}
                  </span>
                </div>
              </motion.div>

              {/* Speech Bubble Tail */}
              <motion.div
                animate={{
                  borderColor: ["rgba(245, 158, 11, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-[5px] right-5 sm:right-7 w-2.5 h-2.5 bg-[#0a0a0f]/95 border-[0.5px] rotate-45 transform shadow-[2px_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(16, 185, 129, 0.8)"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-1 rounded-full shadow-[0_0_3px_rgba(0,0,0,0.4)]"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button - hide on mobile when chat is open since we have a new close button */}
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`fixed bottom-[10dvh] md:bottom-6 right-4 sm:right-6 z-[200] flex items-center justify-center cursor-pointer transition-all duration-300 ${open
          ? 'w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground neon-glow shadow-2xl hidden md:flex'
          : 'w-14 h-14 sm:w-[72px] sm:h-[72px] bg-transparent'
          }`}
        style={{ willChange: 'opacity' }}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="chatbot-float-icon relative w-full h-full flex items-center justify-center">
            <DotLottieReact
              src="/robot.json"
              loop
              autoplay
              className="w-full h-full"
            />
          </div>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            style={{
              ...viewportStyle,
              transformOrigin: 'bottom',
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.15), inset 0 0 10px rgba(124, 58, 237, 0.05)'
            }}
            className={`fixed md:bottom-24 left-0 right-0 md:left-auto md:right-6 z-[200] w-full md:w-[400px] max-w-full md:max-w-[400px] overflow-hidden bg-background md:bg-card/90 backdrop-blur-3xl shadow-2xl flex flex-col h-[100dvh] md:h-auto top-0 md:top-auto premium-card ${isKeyboardOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? 'rounded-none border-t-0' : 'bottom-0 rounded-t-3xl md:rounded-2xl'}`}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-3.5 bg-primary/20 border-b border-border flex items-center justify-between relative">
              <div>
                <h4 className="font-display font-semibold text-foreground text-sm leading-tight">
                  {chatContentMemo.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {chatLang === 'bn' ? 'অনলাইন' : 'Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 chatbot-menu-container">
                {/* Control Pill */}
                <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-full border border-border/50 shadow-sm">
                  {/* Actions Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${showMenu ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background'}`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 mt-3 w-48 rounded-2xl bg-card border border-border shadow-2xl z-[210] py-2 overflow-hidden ring-1 ring-black/5"
                        >
                          {/* Lang Selector inside Menu */}
                          <div className="px-4 py-2 border-b border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                              {chatLang === 'bn' ? 'ভাষা নির্বাচন করুন' : 'Select Language'}
                            </p>
                            <div className="flex bg-secondary p-0.5 rounded-lg border border-border/50">
                              <button
                                onClick={() => { setChatLang('en'); setShowMenu(false); }}
                                className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${chatLang === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                English
                              </button>
                              <button
                                onClick={() => { setChatLang('bn'); setShowMenu(false); }}
                                className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${chatLang === 'bn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                বাংলা
                              </button>
                            </div>
                          </div>

                          {/* Clear Chat inside Menu */}
                          <button
                            onClick={() => { clearChat(); setShowMenu(false); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {chatLang === 'bn' ? 'চ্যাট মুছুন' : 'Clear Conversation'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Minimize Button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-background/40 md:bg-card/40 md:max-h-[500px] relative">
              <div className="space-y-3 transition-all duration-500">
                {/* Initial Selection Flow */}
                {messages.length === 0 && !isLoading && (
                  <div className="space-y-4 py-2">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-[0.5px] border-primary/30 shadow-sm">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="bg-[#0f111a] border-[0.5px] border-primary/40 rounded-xl rounded-tl-none px-3 py-2 text-xs text-[#f8f9fa] max-w-[85%] shadow-lg leading-relaxed">
                        <p className="font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400 uppercase tracking-widest text-[10px]">
                          {chatLang === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
                        </p>
                        {chatLang === 'bn'
                          ? 'শুরু করার জন্য আপনার পছন্দের ভাষাটি নির্বাচন করুন:'
                          : 'Please select your preferred language to begin:'}
                      </div>
                    </div>
                    <div className="flex gap-2 pl-9">
                      <button
                        onClick={() => setChatLang('en')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shadow-sm ${chatLang === 'en' ? 'bg-primary border-primary text-primary-foreground shadow-primary/20' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setChatLang('bn')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shadow-sm ${chatLang === 'bn' ? 'bg-primary border-primary text-primary-foreground shadow-primary/20' : 'bg-background border-border text-muted-foreground hover:border-primary/40'}`}
                      >
                        বাংলা
                      </button>
                    </div>
                  </div>
                )}

                {messages.filter(m => m.role !== 'system').map((msg, i) => {
                  const isAssistant = msg.role === 'assistant';
                  const hasSwitchSuggestion = isAssistant && msg.content.includes('[SUGGEST_SWITCH]');
                  const cleanContent = isAssistant ? msg.content.replace('[SUGGEST_SWITCH]', '').trim() : msg.content;

                  return (
                    <div key={i} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {isAssistant && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-[0.5px] border-primary/30 shadow-sm">
                            <Bot className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                        <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] shadow-lg border-[0.5px] ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground border-primary/40 shadow-emerald-500/10 rounded-tr-none'
                          : 'bg-[#0f111a] border-primary/40 text-[#f8f9fa] rounded-tl-none'
                          }`}>
                          {isAssistant ? formatMessage(cleanContent) : msg.content}
                        </div>
                      </div>
                      {hasSwitchSuggestion && (
                        <div className="flex justify-start ml-9 pb-1">
                          <button
                            onClick={() => setChatLang(chatLang === 'en' ? 'bn' : 'en')}
                            className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-primary/20"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            {chatLang === 'en' ? 'বাংলায় কথা বলুন' : 'Switch to English'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Email Prompt Native Chat Bubble */}
                {showEmailPrompt && !hasProvidedEmail && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-[0.5px] border-primary/30 shadow-sm">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="bg-[#0f111a] rounded-xl rounded-tl-none px-4 py-3 text-sm text-[#f8f9fa] shadow-xl max-w-[90%] border-[0.5px] border-primary/40 bg-gradient-to-br from-[#0f111a] to-emerald-500/5">
                        <p className="mb-3 text-xs leading-relaxed font-medium">
                          {chatLang === 'bn'
                            ? 'অবশ্যই, আমি সাহায্য করতে পারি। তবে আমাদের সংযোগ বিচ্ছিন্ন হয়ে গেলে, আমি কোথায় উত্তর পাঠাবো? আপনার ইমেইলটি দিন:'
                            : 'Definitely I can help with that. In case we get disconnected, what is your email address?'}
                        </p>
                        <form onSubmit={handleLeadSubmit} className="flex flex-col gap-2 relative z-10">
                          <input
                            type="email"
                            required
                            placeholder={chatLang === 'bn' ? 'আপনার ইমেইল...' : 'Your email address...'}
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            disabled={leadStatus === 'loading'}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pointer-events-auto"
                          />
                          <button
                            type="submit"
                            disabled={leadStatus === 'loading' || !leadEmail}
                            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs transition-opacity cursor-pointer pointer-events-auto"
                          >
                            {leadStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {chatLang === 'bn' ? 'উত্তর পান' : 'Send & Continue'}
                          </button>
                          <p className="text-[9px] text-muted-foreground text-center mt-1">
                            {chatLang === 'bn' ? 'আমরা স্প্যাম করি না।' : '100% Secure. No spam.'}
                          </p>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-[0.5px] border-primary/30 shadow-sm">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="bg-[#0f111a] border-[0.5px] border-primary/40 rounded-xl rounded-tl-none px-4 py-3 shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'dotBounce 1.4s ease-in-out infinite' }} />
                      <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'dotBounce 1.4s ease-in-out 0.2s infinite' }} />
                      <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'dotBounce 1.4s ease-in-out 0.4s infinite' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                <div ref={messagesEndRef} />
              </div> {/* End of blurred wrapper */}
            </div>

            {/* Suggestion Chips */}
            {(() => {
              const defaultChips = chatLang === 'bn'
                ? ['তোমাদের সেবাগুলো কি?', 'প্রজেক্টগুলো দেখাও', 'প্রাইসিং কেমন?', 'যোগাযোগ করতে চাই']
                : ['What services do you offer?', 'Show me your projects', 'Tell me about pricing', 'I want to contact you'];
              const activeChips = suggestions.length > 0 ? suggestions : (messages.length <= 1 ? defaultChips : []);
              return activeChips.length > 0 && !isLoading ? (
                <div className={`shrink-0 px-4 pt-2 pb-0 bg-card/80 transition-opacity ${showEmailPrompt ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {activeChips.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSuggestions([]);
                          setInput(s);
                          setTimeout(() => {
                            const userMessage: ChatMessage = { role: 'user', content: s };
                            const newMessages = [...messages, userMessage];
                            setMessages(newMessages);
                            setInput('');
                            setIsLoading(true);

                            // Email gate: same logic as handleSend
                            if (!hasProvidedEmail && messages.filter(m => m.role === 'user').length >= 1) {
                              setShowEmailPrompt(true);
                              setIsLoading(false);
                              return;
                            }

                            executeAIResponse(newMessages);
                          }, 50);
                        }}
                        className="shrink-0 px-4 py-2 rounded-full text-[11px] font-bold bg-primary/10 text-white border-[0.5px] border-primary/40 hover:bg-primary/20 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300 cursor-pointer whitespace-nowrap backdrop-blur-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Input & Mobile Close Button */}
            <div className="shrink-0 relative">
              <div className={`px-4 py-3 pb-6 md:pb-3 ${suggestions.length > 0 && !isLoading ? 'pt-2' : ''} flex gap-2 bg-card/90 backdrop-blur-md transition-opacity ${showEmailPrompt ? 'opacity-40 pointer-events-none' : ''}`}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  onFocus={(e) => {
                    // Prevent the browser from scrolling the page to bring input into view
                    if (window.innerWidth < 768) {
                      e.target.scrollIntoView({ block: 'nearest' });
                      setTimeout(() => window.scrollTo(0, 0), 50);
                      setTimeout(() => window.scrollTo(0, 0), 150);
                      setTimeout(() => window.scrollTo(0, 0), 300);
                    }
                  }}
                  placeholder={chatContentMemo.placeholder}
                  disabled={isLoading}
                  enterKeyHint="send"
                  // Prevent auto-focus on open to stop keyboard jumping
                  autoFocus={false}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-[13px] md:text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="group w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-[1.5px] border-white/40 overflow-hidden relative"
                >
                  <Send className="w-4 h-4 relative z-10 fill-black stroke-black" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
