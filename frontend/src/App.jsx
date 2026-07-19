import React, { useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import {
  Mic,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Loader2,
  ImagePlus,
  MessageSquareText,
  Search,
  Sparkles,
  BadgeCheck,
  ChevronDown,
  Plus,
  Minus,
  ShieldCheck,
  Database,
  BrainCircuit,
  SendHorizontal,
  LineChart,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Mail,
  Lock,
  User,
  AtSign,
  Camera,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  FolderKanban,
  LayoutGrid,
  Image as ImageIcon,
  MessagesSquare,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Globe,
} from "lucide-react";

// Points to your backend. Locally this is 127.0.0.1:8000. Once deployed,
// set VITE_API_BASE in Vercel's environment variables to your live
// Render backend URL (e.g. https://fact-ai-backend.onrender.com).
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// ---- Design tokens -------------------------------------------------
const c = {
  bg: "#FFFFFF",
  surface: "#F5F8FF",
  border: "#DCE4F7",
  text: "#0B1220",
  muted: "#5B6472",
  faint: "#9AA3B2",
  brand: "#2554F0",
  brandDark: "#12308F",
  brandSoft: "#EAF0FE",
  true: "#1B8A5A",
  false: "#D64545",
  mislead: "#C98A1E",
  unverified: "#5B6472",
};

const fontSans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const fontMono =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const VERDICT_META = {
  True: { color: c.true, label: "TRUE", Icon: CheckCircle2 },
  False: { color: c.false, label: "FALSE", Icon: XCircle },
  Misleading: { color: c.mislead, label: "MISLEADING", Icon: AlertTriangle },
  Unverified: { color: c.unverified, label: "UNVERIFIED", Icon: HelpCircle },
};

const SECURITY_FAQ = [
  {
    q: "Is Fact AI free to use?",
    a: "Yes. Fact AI provides free access to its core fact-checking capabilities. Additional premium features may be introduced in future releases.",
  },
  {
    q: "Is a subscription required?",
    a: "No. A subscription is not required to access the platform's essential verification features. Optional premium plans may be offered for advanced functionality.",
  },
  {
    q: "Who developed Fact AI?",
    a: "Fact AI was founded by Jebagayathri with the vision of combating misinformation through transparent, evidence-based artificial intelligence.",
  },
  {
    q: "How does Fact AI protect my data?",
    a: "User submissions are processed securely and used solely for verification purposes. Fact AI is designed with a strong commitment to privacy, security, and responsible data handling.",
  },
  {
    q: "Does Fact AI support image verification?",
    a: "Yes. Users can upload screenshots or images, and Fact AI will analyze the extracted content using reliable sources to provide an evidence-based verification.",
  },
];

const COPY = {
  en: {
    tagline: "Cut through the noise.",
    sub: "Paste a claim, rumor, or post — get a verdict backed by real evidence.",
    placeholder: "e.g. Drinking hot water cures COVID-19",
    verify: "Verify",
    verifying: "Verifying",
    evidence: "Evidence",
    viewSource: "View source",
    noClaim: "No claim submitted yet.",
    micUnsupported: "Voice input isn't supported in this browser. Try Chrome.",
    backendDown:
      "Couldn't reach the Fact-AI backend. Make sure the backend server is running.",
    imageFail: "Couldn't read this image. Try a clearer screenshot.",
    howItWorks: "How Fact-AI works",
    steps: [
      {
        title: "Submit a claim",
        desc: "Type it, speak it, or upload a screenshot of the post you're unsure about.",
      },
      {
        title: "It searches real evidence",
        desc: "The AI searches the live web and fact-check databases — it never guesses from memory.",
      },
      {
        title: "It analyzes what it finds",
        desc: "An AI model reads only the retrieved evidence and reasons out whether the claim holds up.",
      },
      {
        title: "You get a grounded verdict",
        desc: "True, False, Misleading, or Unverified — with a confidence score and the exact sources cited.",
      },
    ],
    privacyTitle: "Data & Privacy",
    privacySub: "A plain-language look at what happens to your data.",
    workflowSteps: [
      { title: "Data Collection", desc: "Your typed text, spoken words, or an uploaded image is captured." },
      { title: "Analysis", desc: "The claim is turned into a search query and matched against real web evidence." },
      { title: "Decision", desc: "An AI model reasons over only that evidence to reach a verdict." },
      { title: "Response", desc: "The verdict, confidence score, and sources are shown back to you." },
      { title: "Learning Insights", desc: "Insights are shown to you only — never used to train any AI model." },
    ],
    faq: [
      {
        q: "What data do you send when I check a claim?",
        a: "Only the claim text (or text extracted from an image) is sent to search services and an AI model to gather evidence and generate a verdict. No personal profile or identity data is attached.",
      },
      {
        q: "Do you store my claims permanently?",
        a: "No. This app has no account system or database. Checked claims exist only in your current browser session and disappear when you refresh or close the page, unless you export them yourself below.",
      },
      {
        q: "Is my voice recording stored or sent anywhere?",
        a: "No. Voice input is converted to text directly inside your browser using Chrome's built-in speech recognition. The raw audio never leaves your device or touches our server.",
      },
      {
        q: "Do you use my data to train AI models?",
        a: "No. Your claim is used only to generate your own verdict in that moment. It is never used to train, fine-tune, or improve any AI model.",
      },
      {
        q: "Can I delete my data?",
        a: "Yes — use \"Delete my activity\" below to instantly clear everything stored in this session. Since nothing is saved permanently, this is immediate and irreversible.",
      },
    ],
    myActivity: "My Activity",
    myActivitySub: "Checks made in this browser session only — nothing is saved on a server.",
    viewActivity: "View",
    exportActivity: "Export",
    deleteActivity: "Delete my activity",
    noActivity: "No activity yet in this session.",
    deleteConfirm: "This will permanently clear your session history. Continue?",
    deleted: "Session activity cleared.",
  },
  ta: {
    tagline: "சத்தத்தை கடந்து உண்மையை அறியுங்கள்.",
    sub: "ஒரு தகவலை ஒட்டவும் — உண்மையான ஆதாரத்துடன் முடிவைப் பெறுங்கள்.",
    placeholder: "எ.கா. சூடான தண்ணீர் கோவிட்-19-ஐ குணப்படுத்தும்",
    verify: "சரிபார்",
    verifying: "சரிபார்க்கிறது",
    evidence: "ஆதாரங்கள்",
    viewSource: "மூலத்தைப் பார்",
    noClaim: "இன்னும் எதுவும் சமர்ப்பிக்கப்படவில்லை.",
    micUnsupported: "இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. Chrome பயன்படுத்தவும்.",
    backendDown:
      "Fact-AI பின்தளத்தை அணுக முடியவில்லை. uvicorn இயங்குகிறதா எனச் சரிபார்க்கவும்.",
    imageFail: "இந்தப் படத்தைப் படிக்க முடியவில்லை. தெளிவான ஸ்கிரீன்ஷாட் முயற்சிக்கவும்.",
    howItWorks: "Fact-AI எப்படி செயல்படுகிறது",
    steps: [
      {
        title: "ஒரு தகவலை சமர்ப்பிக்கவும்",
        desc: "தட்டச்சு செய்யவும், பேசவும், அல்லது ஸ்கிரீன்ஷாட்டைப் பதிவேற்றவும்.",
      },
      {
        title: "உண்மையான ஆதாரங்களைத் தேடுகிறது",
        desc: "AI நேரடி இணையத்திலும் உண்மை-சரிபார்ப்பு தரவுத்தளங்களிலும் தேடுகிறது — நினைவிலிருந்து யூகிக்காது.",
      },
      {
        title: "கிடைத்த தகவலை பகுப்பாய்வு செய்கிறது",
        desc: "பெறப்பட்ட ஆதாரத்தை மட்டும் படித்து, தகவல் சரியானதா எனப் பகுத்தறிகிறது.",
      },
      {
        title: "ஆதாரத்துடன் முடிவைப் பெறுங்கள்",
        desc: "உண்மை, பொய், தவறான வழிநடத்தல், அல்லது உறுதிப்படுத்தப்படவில்லை — நம்பிக்கை மதிப்பெண் மற்றும் மூலங்களுடன்.",
      },
    ],
    privacyTitle: "தரவு & தனியுரிமை",
    privacySub: "உங்கள் தரவுக்கு என்ன நடக்கிறது என்பதை எளிய மொழியில்.",
    workflowSteps: [
      { title: "தரவு சேகரிப்பு", desc: "நீங்கள் தட்டச்சு செய்யும், பேசும், அல்லது பதிவேற்றும் தகவல் பெறப்படுகிறது." },
      { title: "பகுப்பாய்வு", desc: "தகவல் தேடல் வினவலாக மாற்றப்பட்டு உண்மையான ஆதாரங்களுடன் ஒப்பிடப்படுகிறது." },
      { title: "முடிவு", desc: "AI பெறப்பட்ட ஆதாரத்தை மட்டும் வைத்து ஒரு முடிவை எடுக்கிறது." },
      { title: "பதில்", desc: "முடிவு, நம்பிக்கை மதிப்பெண், மற்றும் மூலங்கள் உங்களுக்குக் காட்டப்படுகின்றன." },
      { title: "கற்றல் நுண்ணறிவு", desc: "நுண்ணறிவுகள் உங்களுக்கு மட்டுமே காட்டப்படும் — எந்த AI மாடலையும் பயிற்சிக்கப் பயன்படுத்தப்படாது." },
    ],
    faq: [
      {
        q: "ஒரு தகவலை சரிபார்க்கும்போது என்ன தரவு அனுப்பப்படுகிறது?",
        a: "தகவல் உரை (அல்லது படத்திலிருந்து பிரித்தெடுக்கப்பட்ட உரை) மட்டுமே தேடல் சேவைகளுக்கும் AI மாடலுக்கும் அனுப்பப்படுகிறது. உங்கள் அடையாளம் தொடர்பான தரவு எதுவும் இணைக்கப்படாது.",
      },
      {
        q: "எனது தகவல்களை நிரந்தரமாக சேமிக்கிறீர்களா?",
        a: "இல்லை. இந்த ஆப்பில் கணக்கு அமைப்போ தரவுத்தளமோ இல்லை. சரிபார்க்கப்பட்ட தகவல்கள் உங்கள் தற்போதைய உலாவி அமர்வில் மட்டுமே உள்ளன.",
      },
      {
        q: "எனது குரல் பதிவு சேமிக்கப்படுகிறதா?",
        a: "இல்லை. குரல் உள்ளீடு உங்கள் உலாவிக்குள்ளேயே உரையாக மாற்றப்படுகிறது. உண்மையான ஒலிப்பதிவு எங்கள் சேவையகத்திற்கு அனுப்பப்படுவதே இல்லை.",
      },
      {
        q: "எனது தரவை AI மாடல்களைப் பயிற்சிக்கப் பயன்படுத்துகிறீர்களா?",
        a: "இல்லை. உங்கள் தகவல் அந்த நேரத்தில் உங்கள் முடிவை உருவாக்க மட்டுமே பயன்படுத்தப்படுகிறது.",
      },
      {
        q: "எனது தரவை நீக்க முடியுமா?",
        a: "ஆம் — கீழே உள்ள \"எனது செயல்பாட்டை நீக்கு\" பொத்தானைப் பயன்படுத்தவும். எதுவும் நிரந்தரமாக சேமிக்கப்படாததால், இது உடனடியானது.",
      },
    ],
    myActivity: "எனது செயல்பாடு",
    myActivitySub: "இந்த உலாவி அமர்வில் மட்டும் — சேவையகத்தில் எதுவும் சேமிக்கப்படவில்லை.",
    viewActivity: "பார்",
    exportActivity: "ஏற்றுமதி",
    deleteActivity: "எனது செயல்பாட்டை நீக்கு",
    noActivity: "இந்த அமர்வில் இன்னும் செயல்பாடு இல்லை.",
    deleteConfirm: "இது உங்கள் அமர்வு வரலாற்றை நிரந்தரமாக அழிக்கும். தொடரவா?",
    deleted: "அமர்வு செயல்பாடு அழிக்கப்பட்டது.",
  },
};

function RevealText({ text, as: Tag = "span", style = {}, staggerMs = 45 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const words = text.split(" ");

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal-container ${visible ? "is-in-view" : ""}`} style={style}>
      {words.map((word, i) => (
        <span key={i} className="reveal-word-wrap">
          <span
            className="reveal-word"
            style={{ animationDelay: `${i * staggerMs}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}

function FadeInOnView({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`how-card ${visible ? "is-visible" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function BoldText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function Waveform({ active, color }) {
  const bars = 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            height: active ? undefined : 6,
            animation: active
              ? `wave 1.1s ease-in-out ${(i % 8) * 0.07}s infinite`
              : "none",
            opacity: active ? 0.85 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function FactAICore() {
  const [claim, setClaim] = useState("");
  const [lang, setLang] = useState("en"); // "en" | "ta"
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [listening, setListening] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = COPY[lang];

  function recordActivity(claimText, data) {
    setHistory((prev) => [
      {
        id: Date.now(),
        claim: claimText,
        verdict: data.verdict,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function handleExportActivity() {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fact-ai-activity.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteActivity() {
    if (window.confirm(t.deleteConfirm)) {
      setHistory([]);
    }
  }

  async function handleSubmit() {
    const trimmed = claim.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: trimmed, language: lang }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStatus("done");
      recordActivity(trimmed, data);
    } catch (err) {
      setErrorMsg(t.backendDown);
      setStatus("error");
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang === "ta" ? "tam" : "eng");

      const res = await fetch(`${API_BASE}/check-image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setErrorMsg(t.imageFail);
        setStatus("error");
        return;
      }

      setClaim(data.extracted_text || "");
      setResult(data);
      setStatus("done");
      recordActivity(data.extracted_text || "(image)", data);
    } catch (err) {
      setErrorMsg(t.backendDown);
      setStatus("error");
    } finally {
      e.target.value = "";
    }
  }

  function handleMic() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg(t.micUnsupported);
      setStatus("error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ta" ? "ta-IN" : "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setClaim((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  const meta =
    result && VERDICT_META[result.verdict]
      ? VERDICT_META[result.verdict]
      : VERDICT_META.Unverified;
  const evidence = result?.raw_evidence?.web_evidence || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${c.brandSoft} 0%, ${c.bg} 380px)`,
        fontFamily: fontSans,
        color: c.text,
        padding: "40px 20px 64px",
      }}
    >
      <style>{`
        @keyframes wave {
          0%, 100% { height: 6px; }
          50% { height: 26px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
          .reveal-word { opacity: 1 !important; transform: none !important; }
        }
        .fa-input:focus { outline: none; border-color: ${c.brand} !important; box-shadow: 0 0 0 3px ${c.brandSoft}; }
        .fa-btn:hover { opacity: 0.92; }
        .fa-mic:hover, .fa-imgbtn:hover { background: ${c.brandSoft} !important; }
        .fa-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .fa-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(17,19,24,0.06); }
        .fa-lang-btn { transition: all 0.15s ease; }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        @media (max-width: 900px) {
          .how-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (max-width: 640px) {
          .how-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        .how-card {
          min-height: 260px;
          padding: 32px;
          border-radius: 20px;
          border: 1px solid ${c.border};
          background: #fff;
          box-shadow: 0 2px 8px rgba(37,84,240,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          opacity: 0;
          transform: translateY(24px);
        }
        .how-card.is-visible {
          animation: howFadeIn 0.6s ease forwards;
        }
        @keyframes howFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .how-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(37,84,240,0.14);
          border-color: ${c.brand};
        }
        .how-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: ${c.brandSoft};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .fa-shell {
          width: 88%;
          max-width: 1600px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (max-width: 1024px) {
          .fa-shell { width: 94%; }
        }
        @media (max-width: 640px) {
          .fa-shell { width: 100%; padding: 0 16px; }
        }

        .fa-searchbox {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .fa-searchcard {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .fa-searchcard:hover {
          box-shadow: 0 8px 28px rgba(37,84,240,0.12);
          border-color: ${c.brand}55;
        }

        html, body { overflow-x: hidden; }

        .reveal-word-wrap {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          padding-bottom: 0.12em;
          margin-bottom: -0.12em;
        }
        .reveal-word {
          display: inline-block;
          transform: translateY(115%);
          opacity: 0;
          margin-right: 0.28em;
        }
        .reveal-container.is-in-view .reveal-word {
          animation: revealUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes revealUp {
          to { transform: translateY(0); opacity: 1; }
        }

        .fa-wordmark-glow {
          filter: drop-shadow(0 0 14px ${c.brand}55) drop-shadow(0 0 28px ${c.brand}30);
          animation: wordmarkGlow 3.5s ease-in-out infinite;
        }
        @keyframes wordmarkGlow {
          0%, 100% {
            filter: drop-shadow(0 0 12px ${c.brand}45) drop-shadow(0 0 24px ${c.brand}25);
          }
          50% {
            filter: drop-shadow(0 0 18px ${c.brand}70) drop-shadow(0 0 34px ${c.brand}40);
          }
        }
        .fa-logo-glow {
          animation: logoGlow 3.5s ease-in-out infinite;
        }
        @keyframes logoGlow {
          0%, 100% {
            box-shadow: 0 0 0 2px #7CB9FF33, 0 0 14px #7CB9FF55, 0 0 26px #7CB9FF30;
          }
          50% {
            box-shadow: 0 0 0 3px #7CB9FF55, 0 0 22px #7CB9FF90, 0 0 40px #7CB9FF55;
          }
        }
      `}</style>

      <div className="fa-shell">
        <div className="fa-logo-row" style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              className="fa-logo-glow"
              style={{
                width: 66,
                height: 66,
                borderRadius: 17,
                background: `linear-gradient(135deg, ${c.brand}, ${c.brandDark})`,
                border: "2px solid #7CB9FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={34} color="#fff" />
            </div>
            <span style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em" }}>
              <span style={{ color: c.text }}>𝗙𝗮𝗰𝘁</span>{" "}
              <span style={{ color: c.brand }}>𝗔𝗜</span>
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <RevealText
            as="h1"
            text={t.tagline}
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          />
          <p style={{ fontSize: 15.5, color: c.muted, margin: "0 0 14px" }}>{t.sub}</p>

          {/* Language toggle */}
          <div
            style={{
              display: "inline-flex",
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: 999,
              padding: 4,
              gap: 2,
            }}
          >
            {["en", "ta"].map((code) => (
              <button
                key={code}
                className="fa-lang-btn"
                onClick={() => setLang(code)}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: lang === code ? c.brand : "transparent",
                  color: lang === code ? "#fff" : c.muted,
                }}
              >
                {code === "en" ? "English" : "தமிழ்"}
              </button>
            ))}
          </div>
        </div>

        <div
          className="fa-searchbox fa-searchcard"
          style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 20,
            padding: "28px 28px 20px",
            boxShadow: "0 4px 16px rgba(37,84,240,0.06)",
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <textarea
            className="fa-input"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
            style={{
              width: "100%",
              flex: 1,
              resize: "none",
              border: "none",
              borderRadius: 10,
              background: "transparent",
              fontFamily: fontSans,
              fontSize: 16.5,
              color: c.text,
              padding: "4px 2px",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              paddingTop: 14,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <button
              className="fa-imgbtn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload an image"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ImagePlus size={17} />
            </button>
            <button
              className="fa-mic"
              onClick={handleMic}
              title="Speak your claim"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1px solid ${c.border}`,
                background: listening ? c.brandSoft : "transparent",
                color: listening ? c.brand : c.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Mic size={17} />
            </button>
            <button
              className="fa-btn"
              onClick={handleSubmit}
              disabled={status === "loading" || !claim.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: c.brand,
                border: "none",
                borderRadius: 10,
                padding: "11px 20px",
                cursor: status === "loading" || !claim.trim() ? "default" : "pointer",
                opacity: !claim.trim() ? 0.45 : 1,
              }}
            >
              {status === "loading" ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <ArrowRight size={16} />
              )}
              {status === "loading" ? t.verifying : t.verify}
            </button>
          </div>
        </div>

        {status === "loading" && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 8 }}>
            <Waveform active color={c.brand} />
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              background: "#FEF2F2",
              border: `1px solid #FCA5A5`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              animation: "fadeUp 0.25s ease",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#991B1B" }}>{errorMsg}</p>
          </div>
        )}

        {status === "done" && result && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: 16,
                padding: 24,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <meta.Icon size={26} color={meta.color} />
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Waveform active={false} color={meta.color} />
                  <span style={{ fontFamily: fontMono, fontSize: 13, color: c.muted }}>
                    {result.confidence ?? 0}% confidence
                  </span>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: c.text,
                  whiteSpace: "pre-wrap",
                }}
              >
                <BoldText text={result.explanation} />
              </p>

              {result.sources && result.sources.length > 0 && (
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: `1px solid ${c.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {result.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 13,
                        color: c.brand,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        wordBreak: "break-all",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={12} /> {src}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {evidence.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: c.muted,
                    marginBottom: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t.evidence}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 14,
                  }}
                >
                  {evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="fa-card"
                      style={{
                        background: c.surface,
                        border: `1px solid ${c.border}`,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                        {ev.title}
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5, color: c.muted }}>
                        {ev.snippet?.length > 130 ? ev.snippet.slice(0, 130) + "…" : ev.snippet}
                      </p>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 12,
                            color: c.brand,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            textDecoration: "none",
                          }}
                        >
                          <ExternalLink size={11} /> {t.viewSource}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status === "idle" && (
          <div style={{ textAlign: "center", color: c.faint, fontSize: 13 }}>
            {t.noClaim}
          </div>
        )}
      </div>

      {/* How it works — width matches the search box for aligned edges */}
      <div
        className="fa-searchbox"
        style={{
          margin: "64px auto 0",
          background: `radial-gradient(circle at 15% 20%, ${c.brandSoft} 0%, transparent 45%), radial-gradient(circle at 85% 80%, ${c.brandSoft} 0%, transparent 45%)`,
          borderRadius: 32,
          padding: "8px 8px 56px",
        }}
      >
        <RevealText
          as="h2"
          text={t.howItWorks}
          style={{
            fontSize: 32,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
            color: c.text,
            display: "block",
          }}
        />
        <p
          style={{
            textAlign: "center",
            color: c.muted,
            fontSize: 16,
            margin: "0 0 48px",
          }}
        >
          {t.sub}
        </p>

        <div className="how-grid">
          {[MessageSquareText, Search, Sparkles, BadgeCheck].map((StepIcon, i) => (
            <FadeInOnView key={i} delay={i * 100}>
              <div className="how-icon-circle">
                <StepIcon size={34} color={c.brand} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: c.faint,
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                STEP {i + 1}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
                {t.steps[i].title}
              </div>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: c.muted }}>
                {t.steps[i].desc}
              </p>
            </FadeInOnView>
          ))}
        </div>
      </div>

      <div className="fa-searchbox" style={{ margin: "64px auto 0" }}>
        {/* Data & Security — clean premium FAQ */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${c.border}`,
            borderRadius: 28,
            padding: "44px 32px",
            boxShadow: "0 4px 24px rgba(37,84,240,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: c.brandSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={24} color={c.brand} />
            </div>
          </div>
          <RevealText
            as="h2"
            text="Data & Security"
            style={{
              fontSize: 26,
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "-0.01em",
              margin: "0 0 8px",
              color: c.text,
            }}
          />
          <p style={{ textAlign: "center", color: c.muted, fontSize: 14.5, margin: "0 0 36px" }}>
            Everything you need to know, in plain terms.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SECURITY_FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    background: isOpen ? c.brandSoft : "#fff",
                    border: `1px solid ${isOpen ? c.brand + "55" : c.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "16px 20px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: c.text,
                    }}
                  >
                    <span>{item.q}</span>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isOpen ? c.brand : c.brandSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.2s ease",
                      }}
                    >
                      {isOpen ? (
                        <Minus size={14} color="#fff" />
                      ) : (
                        <Plus size={14} color={c.brand} />
                      )}
                    </span>
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.3s cubic-bezier(.4,0,.2,1)",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          margin: 0,
                          padding: "0 20px 18px 20px",
                          fontSize: 14.5,
                          lineHeight: 1.65,
                          color: c.muted,
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Auth + App Shell layer
// =====================================================================

function passwordStrength(pw) {
  if (!pw) return { label: "", pct: 0, color: "#DCE4F7" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Weak", pct: 25, color: "#D64545" },
    { label: "Fair", pct: 50, color: "#C98A1E" },
    { label: "Good", pct: 75, color: "#2554F0" },
    { label: "Strong", pct: 100, color: "#1B8A5A" },
  ];
  return levels[Math.max(0, score - 1)] || levels[0];
}

const authStyles = {
  page: {
    minHeight: "100vh",
    background: "#F5F8FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    border: "1px solid #DCE4F7",
    borderRadius: 18,
    padding: 32,
    boxShadow: "0 10px 30px rgba(11,18,32,0.06)",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #DCE4F7",
    fontSize: 14,
    outline: "none",
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#5B6472",
    marginBottom: 6,
    display: "block",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#2554F0",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 4,
  },
  googleBtn: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #DCE4F7",
    background: "#fff",
    color: "#0B1220",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  link: { color: "#2554F0", fontWeight: 600, cursor: "pointer", fontSize: 13 },
};

function AuthShellWrap({ title, subtitle, children }) {
  return (
    <div style={authStyles.page}>
      <div style={authStyles.card}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "linear-gradient(135deg, #2554F0, #12308F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <ShieldCheck size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#5B6472", margin: 0 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...authStyles.input, paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 12,
          top: 11,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9AA3B2",
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function LoginScreen({ onLogin, goTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function friendlyError(err) {
    const code = err.code || "";
    if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
      return "Incorrect email or password.";
    }
    if (code.includes("invalid-email")) return "That email address doesn't look valid.";
    if (code.includes("too-many-requests")) return "Too many attempts. Try again in a bit.";
    if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before finishing.";
    return "Something went wrong signing in. Please try again.";
  }

  async function handleEmailLogin() {
    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin({
        email: cred.user.email,
        name: cred.user.displayName || "",
        avatar: cred.user.photoURL || null,
        uid: cred.user.uid,
      });
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    if (isMobileDevice()) {
      // Popups are unreliable on mobile browsers - redirect works everywhere.
      signInWithRedirect(auth, googleProvider);
      return;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      onLogin({
        email: cred.user.email,
        name: cred.user.displayName || "",
        avatar: cred.user.photoURL || null,
        uid: cred.user.uid,
      });
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  return (
    <AuthShellWrap title="Welcome back" subtitle="Sign in to continue to Fact–AI">
      <button style={authStyles.googleBtn} onClick={handleGoogleLogin} disabled={loading}>
        <Globe size={16} /> Continue with Google
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: "#9AA3B2", margin: "0 0 14px" }}>
        or sign in with email
      </div>
      <label style={authStyles.label}>Email</label>
      <input
        style={authStyles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <label style={authStyles.label}>Password</label>
      <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px 0 4px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#5B6472" }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        <span style={authStyles.link} onClick={() => goTo("forgot")}>
          Forgot password?
        </span>
      </div>
      {error && <p style={{ color: "#D64545", fontSize: 12.5, margin: "6px 0 0" }}>{error}</p>}
      <button
        style={{ ...authStyles.primaryBtn, opacity: loading ? 0.6 : 1 }}
        onClick={handleEmailLogin}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, marginTop: 18, color: "#5B6472" }}>
        Don't have an account?{" "}
        <span style={authStyles.link} onClick={() => goTo("signup")}>
          Sign up
        </span>
      </p>
      <p style={{ textAlign: "center", fontSize: 12.5, marginTop: 10 }}>
        <span style={authStyles.link} onClick={() => goTo("otpLoginEmail")}>
          Sign in with an email code instead
        </span>
      </p>
    </AuthShellWrap>
  );
}

function SignupScreen({ goTo, onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = passwordStrength(password);

  function friendlyError(err) {
    const code = err.code || "";
    if (code.includes("email-already-in-use")) return "An account with this email already exists.";
    if (code.includes("invalid-email")) return "That email address doesn't look valid.";
    if (code.includes("weak-password")) return "Password should be at least 6 characters.";
    if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before finishing.";
    return "Something went wrong creating your account. Please try again.";
  }

  async function handleEmailSignup() {
    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onSignup({ email: cred.user.email, name, uid: cred.user.uid });
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError("");

    if (isMobileDevice()) {
      signInWithRedirect(auth, googleProvider);
      return;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      onSignup({
        email: cred.user.email,
        name: cred.user.displayName || "",
        avatar: cred.user.photoURL || null,
        uid: cred.user.uid,
      });
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  return (
    <AuthShellWrap title="Create your account" subtitle="Start verifying claims in seconds">
      <button style={authStyles.googleBtn} onClick={handleGoogleSignup} disabled={loading}>
        <Globe size={16} /> Continue with Google
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: "#9AA3B2", margin: "0 0 14px" }}>
        or sign up with email
      </div>
      <label style={authStyles.label}>Full name</label>
      <input style={authStyles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <label style={authStyles.label}>Email</label>
      <input
        style={authStyles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <label style={authStyles.label}>Password</label>
      <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
      {password && (
        <div style={{ marginTop: -8, marginBottom: 14 }}>
          <div style={{ height: 4, borderRadius: 2, background: "#EEF1F9", overflow: "hidden" }}>
            <div
              style={{
                width: `${strength.pct}%`,
                height: "100%",
                background: strength.color,
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
            {strength.label}
          </div>
        </div>
      )}
      {error && <p style={{ color: "#D64545", fontSize: 12.5, margin: "0 0 10px" }}>{error}</p>}
      <button
        style={{ ...authStyles.primaryBtn, opacity: loading ? 0.6 : 1 }}
        onClick={handleEmailSignup}
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, marginTop: 18, color: "#5B6472" }}>
        Already have an account?{" "}
        <span style={authStyles.link} onClick={() => goTo("login")}>
          Sign in
        </span>
      </p>
    </AuthShellWrap>
  );
}

function ForgotPasswordScreen({ goTo }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setSending(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setSent(true);
    } catch (err) {
      const code = err.code || "";
      if (code.includes("user-not-found")) {
        setError("No account found with that email.");
      } else if (code.includes("invalid-email")) {
        setError("That email address doesn't look valid.");
      } else {
        setError("Something went wrong sending the reset email. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <AuthShellWrap title="Check your email" subtitle={`We sent a password reset link to ${email}`}>
        <p style={{ fontSize: 13.5, color: "#5B6472", lineHeight: 1.6, textAlign: "center", marginBottom: 20 }}>
          Click the link in that email to set a new password. It may take a minute to arrive
          — check your spam folder too.
        </p>
        <button style={authStyles.primaryBtn} onClick={() => goTo("login")}>
          Back to sign in
        </button>
      </AuthShellWrap>
    );
  }

  return (
    <AuthShellWrap title="Reset your password" subtitle="We'll email you a secure link to reset it">
      <label style={authStyles.label}>Email</label>
      <input
        style={authStyles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      {error && (
        <p style={{ color: "#D64545", fontSize: 12.5, marginTop: -8, marginBottom: 12 }}>{error}</p>
      )}
      <button style={{ ...authStyles.primaryBtn, opacity: sending ? 0.6 : 1 }} onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send Reset Link"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, marginTop: 18, color: "#5B6472" }}>
        <span style={authStyles.link} onClick={() => goTo("login")}>
          Back to sign in
        </span>
      </p>
    </AuthShellWrap>
  );
}

function OtpLoginEmailScreen({ goTo, onSent }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setSending(false);
        return;
      }
      onSent(trimmed);
    } catch (err) {
      setError("Couldn't reach the backend. Make sure uvicorn is running.");
      setSending(false);
    }
  }

  return (
    <AuthShellWrap title="Sign in with a code" subtitle="We'll email you a 6-digit code, no password needed">
      <label style={authStyles.label}>Email</label>
      <input
        style={authStyles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      {error && (
        <p style={{ color: "#D64545", fontSize: 12.5, marginTop: -8, marginBottom: 12 }}>{error}</p>
      )}
      <button style={{ ...authStyles.primaryBtn, opacity: sending ? 0.6 : 1 }} onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "Send Code"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, marginTop: 18, color: "#5B6472" }}>
        <span style={authStyles.link} onClick={() => goTo("login")}>
          Back to sign in
        </span>
      </p>
    </AuthShellWrap>
  );
}

function OtpScreen({ email, goTo, onVerified }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const refs = useRef([]);

  function handleChange(i, val) {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  }

  const complete = digits.every((d) => d !== "");

  async function handleVerify() {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: digits.join("") }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setVerifying(false);
        return;
      }

      const cred = await signInWithCustomToken(auth, data.token);
      onVerified({
        email: cred.user.email,
        name: cred.user.displayName || "",
        avatar: cred.user.photoURL || null,
        uid: cred.user.uid,
      });
    } catch (err) {
      setError("Couldn't reach the backend. Make sure uvicorn is running.");
      setVerifying(false);
    }
  }

  async function handleResend() {
    try {
      await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err) {
      // silent fail is fine here; user can just try again
    }
  }

  return (
    <AuthShellWrap title="Enter verification code" subtitle={`We sent a 6-digit code to ${email}`}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            maxLength={1}
            style={{
              width: 42,
              height: 48,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 10,
              border: "1px solid #DCE4F7",
              outline: "none",
            }}
          />
        ))}
      </div>
      {error && <p style={{ color: "#D64545", fontSize: 12.5, textAlign: "center", marginBottom: 12 }}>{error}</p>}
      <button
        style={{ ...authStyles.primaryBtn, opacity: complete && !verifying ? 1 : 0.5 }}
        disabled={!complete || verifying}
        onClick={handleVerify}
      >
        {verifying ? "Verifying..." : "Verify"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, marginTop: 18, color: "#5B6472" }}>
        {resent ? "Code resent!" : (
          <>
            Didn't get a code?{" "}
            <span style={authStyles.link} onClick={handleResend}>
              Resend
            </span>
          </>
        )}
      </p>
    </AuthShellWrap>
  );
}

function ProfileSetupScreen({ initial, onDone }) {
  const [name, setName] = useState(initial?.name || "");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef(null);

  function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <AuthShellWrap title="Set up your profile" subtitle="Just a couple of details before you start">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: avatar ? `url(${avatar}) center/cover` : "#EAF0FE",
            border: "2px dashed #DCE4F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {!avatar && <Camera size={22} color="#2554F0" />}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
      </div>
      <label style={authStyles.label}>Name</label>
      <input style={authStyles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <label style={authStyles.label}>Username</label>
      <input
        style={authStyles.input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@username"
      />
      <button
        style={authStyles.primaryBtn}
        onClick={() => onDone({ name: name || "User", username: username || "user", avatar })}
      >
        Finish Setup
      </button>
    </AuthShellWrap>
  );
}

function Sidebar({ open, onClose, user, darkMode, setDarkMode, onLogout }) {
  const items = [
    { icon: Search, label: "Search" },
    { icon: FolderKanban, label: "Library" },
    { icon: LayoutGrid, label: "Projects" },
    { icon: Sparkles, label: "Apps" },
    { icon: ImageIcon, label: "Images" },
    { icon: MessagesSquare, label: "Recent Chats" },
  ];
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,18,32,0.35)",
            zIndex: 40,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: darkMode ? "#0B1220" : "#fff",
          color: darkMode ? "#fff" : "#0B1220",
          borderRight: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#DCE4F7"}`,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Menu</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
            <X size={18} />
          </button>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#2554F0",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "10px 16px",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            marginBottom: 18,
          }}
        >
          <Plus size={16} /> New Chat
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
          {items.map((it, i) => (
            <button
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "inherit",
                fontSize: 13.5,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <it.icon size={16} /> {it.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#DCE4F7"}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "inherit", fontSize: 13.5, cursor: "pointer", textAlign: "left" }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "inherit", fontSize: 13.5, cursor: "pointer", textAlign: "left" }}>
            <Bell size={16} /> Notifications
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "inherit", fontSize: 13.5, cursor: "pointer", textAlign: "left" }}>
            <SettingsIcon size={16} /> Settings
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "inherit", fontSize: 13.5, cursor: "pointer", textAlign: "left" }}>
            <User size={16} /> Profile
          </button>
          <button
            onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#D64545", fontSize: 13.5, cursor: "pointer", textAlign: "left" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

function TopBar({ user, onOpenSidebar, darkMode, setDarkMode, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 20px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #DCE4F7",
      }}
    >
      <button
        onClick={onOpenSidebar}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0B1220" }}
      >
        <Menu size={20} />
      </button>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: user?.avatar ? `url(${user.avatar}) center/cover` : "#2554F0",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {!user?.avatar && (user?.name?.[0]?.toUpperCase() || "U")}
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 44,
              background: "#fff",
              border: "1px solid #DCE4F7",
              borderRadius: 12,
              boxShadow: "0 10px 24px rgba(11,18,32,0.1)",
              width: 200,
              padding: 8,
            }}
          >
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #EEF1F9", marginBottom: 6 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 11.5, color: "#9AA3B2" }}>{user?.email}</div>
            </div>
            {[
              { icon: User, label: "Profile" },
              { icon: Bell, label: "Notifications" },
              { icon: SettingsIcon, label: "Settings" },
            ].map((it, i) => (
              <button
                key={i}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <it.icon size={15} /> {it.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
                color: "#D64545",
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("login"); // login | signup | forgot | otp | profileSetup | app
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // Restore an existing Firebase session on page load, if there is one.
  // Also catches the result of a mobile Google sign-in redirect.
  React.useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // Errors here are rare (e.g. account-exists-with-different-credential);
      // the login/signup screens will simply show the normal login form again.
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || null,
          uid: firebaseUser.uid,
        });
        setView("app");
      }
      setCheckingSession(false);
    });
    return () => unsubscribe();
  }, []);

  function handleLogin(u) {
    setUser(u);
    setView("app");
  }

  function handleSignup(u) {
    setPendingUser(u);
    setView("profileSetup");
  }

  function handleProfileDone(profile) {
    setUser({ ...pendingUser, ...profile });
    setView("app");
  }

  async function handleLogout() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      // even if this fails, still clear local state so the UI doesn't get stuck
    }
    setUser(null);
    setView("login");
  }

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F8FF",
        }}
      >
        <Loader2 size={28} color="#2554F0" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (view === "login") return <LoginScreen onLogin={handleLogin} goTo={setView} />;
  if (view === "signup") return <SignupScreen onSignup={handleSignup} goTo={setView} />;
  if (view === "forgot") return <ForgotPasswordScreen goTo={setView} />;
  if (view === "otpLoginEmail")
    return (
      <OtpLoginEmailScreen
        goTo={setView}
        onSent={(email) => {
          setOtpEmail(email);
          setView("otp");
        }}
      />
    );
  if (view === "otp")
    return <OtpScreen email={otpEmail} goTo={setView} onVerified={handleLogin} />;
  if (view === "profileSetup")
    return <ProfileSetupScreen initial={pendingUser} onDone={handleProfileDone} />;

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#0B1220" : "#fff" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />
      <TopBar
        user={user}
        onOpenSidebar={() => setSidebarOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />
      <FactAICore />
    </div>
  );
}