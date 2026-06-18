// 70+ languages with native labels, ISO codes, text direction, and script-family hints
// for dynamic font loading. Used by LanguageSelector + TranslationService.

export const LANGUAGES = [
  // RTL Semitic / Indo-Iranian
  { code: "ar",     label: "العربية",       dir: "rtl", script: "arabic" },
  { code: "fa",     label: "فارسی",         dir: "rtl", script: "arabic" },
  { code: "ur",     label: "اردو",          dir: "rtl", script: "arabic" },
  { code: "ku",     label: "Kurdî",         dir: "rtl", script: "arabic" },
  { code: "he",     label: "עברית",         dir: "rtl", script: "hebrew" },

  // LTR Latin / Germanic / Romance
  { code: "en",     label: "English",       dir: "ltr", script: "latin" },
  { code: "fr",     label: "Français",      dir: "ltr", script: "latin" },
  { code: "es",     label: "Español",       dir: "ltr", script: "latin" },
  { code: "pt",     label: "Português",     dir: "ltr", script: "latin" },
  { code: "it",     label: "Italiano",      dir: "ltr", script: "latin" },
  { code: "de",     label: "Deutsch",       dir: "ltr", script: "latin" },
  { code: "nl",     label: "Nederlands",    dir: "ltr", script: "latin" },
  { code: "sv",     label: "Svenska",       dir: "ltr", script: "latin" },
  { code: "no",     label: "Norsk",         dir: "ltr", script: "latin" },
  { code: "da",     label: "Dansk",         dir: "ltr", script: "latin" },
  { code: "fi",     label: "Suomi",         dir: "ltr", script: "latin" },
  { code: "is",     label: "Íslenska",      dir: "ltr", script: "latin" },
  { code: "pl",     label: "Polski",        dir: "ltr", script: "latin" },
  { code: "cs",     label: "Čeština",       dir: "ltr", script: "latin" },
  { code: "sk",     label: "Slovenčina",    dir: "ltr", script: "latin" },
  { code: "hu",     label: "Magyar",        dir: "ltr", script: "latin" },
  { code: "ro",     label: "Română",        dir: "ltr", script: "latin" },
  { code: "hr",     label: "Hrvatski",      dir: "ltr", script: "latin" },
  { code: "sl",     label: "Slovenščina",   dir: "ltr", script: "latin" },
  { code: "sq",     label: "Shqip",         dir: "ltr", script: "latin" },
  { code: "et",     label: "Eesti",         dir: "ltr", script: "latin" },
  { code: "lv",     label: "Latviešu",      dir: "ltr", script: "latin" },
  { code: "lt",     label: "Lietuvių",      dir: "ltr", script: "latin" },
  { code: "tr",     label: "Türkçe",        dir: "ltr", script: "latin" },
  { code: "az",     label: "Azərbaycan",    dir: "ltr", script: "latin" },
  { code: "ca",     label: "Català",        dir: "ltr", script: "latin" },
  { code: "eu",     label: "Euskara",       dir: "ltr", script: "latin" },
  { code: "gl",     label: "Galego",        dir: "ltr", script: "latin" },
  { code: "cy",     label: "Cymraeg",       dir: "ltr", script: "latin" },
  { code: "ga",     label: "Gaeilge",       dir: "ltr", script: "latin" },
  { code: "mt",     label: "Malti",         dir: "ltr", script: "latin" },
  { code: "id",     label: "Bahasa Indonesia", dir: "ltr", script: "latin" },
  { code: "ms",     label: "Bahasa Melayu", dir: "ltr", script: "latin" },
  { code: "tl",     label: "Filipino",      dir: "ltr", script: "latin" },
  { code: "vi",     label: "Tiếng Việt",    dir: "ltr", script: "latin" },
  { code: "sw",     label: "Kiswahili",     dir: "ltr", script: "latin" },
  { code: "ha",     label: "Hausa",         dir: "ltr", script: "latin" },
  { code: "yo",     label: "Yorùbá",        dir: "ltr", script: "latin" },
  { code: "zu",     label: "isiZulu",       dir: "ltr", script: "latin" },
  { code: "af",     label: "Afrikaans",     dir: "ltr", script: "latin" },
  { code: "so",     label: "Soomaali",      dir: "ltr", script: "latin" },
  { code: "eo",     label: "Esperanto",     dir: "ltr", script: "latin" },

  // Cyrillic
  { code: "ru",     label: "Русский",       dir: "ltr", script: "cyrillic" },
  { code: "uk",     label: "Українська",    dir: "ltr", script: "cyrillic" },
  { code: "be",     label: "Беларуская",    dir: "ltr", script: "cyrillic" },
  { code: "bg",     label: "Български",     dir: "ltr", script: "cyrillic" },
  { code: "sr",     label: "Српски",        dir: "ltr", script: "cyrillic" },
  { code: "mk",     label: "Македонски",    dir: "ltr", script: "cyrillic" },
  { code: "mn",     label: "Монгол",        dir: "ltr", script: "cyrillic" },
  { code: "kk",     label: "Қазақша",       dir: "ltr", script: "cyrillic" },
  { code: "ky",     label: "Кыргызча",      dir: "ltr", script: "cyrillic" },
  { code: "uz",     label: "Oʻzbekcha",     dir: "ltr", script: "latin" },

  // Greek / Armenian / Georgian
  { code: "el",     label: "Ελληνικά",      dir: "ltr", script: "greek" },
  { code: "hy",     label: "Հայերեն",       dir: "ltr", script: "armenian" },
  { code: "ka",     label: "ქართული",       dir: "ltr", script: "georgian" },

  // CJK
  { code: "zh-CN",  label: "中文（简体）",   dir: "ltr", script: "cjk-sc" },
  { code: "zh-TW",  label: "中文（繁體）",   dir: "ltr", script: "cjk-tc" },
  { code: "ja",     label: "日本語",         dir: "ltr", script: "cjk-jp" },
  { code: "ko",     label: "한국어",         dir: "ltr", script: "cjk-kr" },

  // South Asian (Devanagari / Bengali / Tamil / Telugu / etc.)
  { code: "hi",     label: "हिन्दी",         dir: "ltr", script: "devanagari" },
  { code: "mr",     label: "मराठी",         dir: "ltr", script: "devanagari" },
  { code: "ne",     label: "नेपाली",         dir: "ltr", script: "devanagari" },
  { code: "bn",     label: "বাংলা",         dir: "ltr", script: "bengali" },
  { code: "pa",     label: "ਪੰਜਾਬੀ",         dir: "ltr", script: "gurmukhi" },
  { code: "gu",     label: "ગુજરાતી",       dir: "ltr", script: "gujarati" },
  { code: "ta",     label: "தமிழ்",          dir: "ltr", script: "tamil" },
  { code: "te",     label: "తెలుగు",        dir: "ltr", script: "telugu" },
  { code: "kn",     label: "ಕನ್ನಡ",         dir: "ltr", script: "kannada" },
  { code: "ml",     label: "മലയാളം",       dir: "ltr", script: "malayalam" },
  { code: "si",     label: "සිංහල",         dir: "ltr", script: "sinhala" },

  // SE Asian
  { code: "th",     label: "ไทย",           dir: "ltr", script: "thai" },
  { code: "lo",     label: "ລາວ",           dir: "ltr", script: "lao" },
  { code: "km",     label: "ខ្មែរ",          dir: "ltr", script: "khmer" },
  { code: "my",     label: "မြန်မာ",        dir: "ltr", script: "myanmar" },

  // African (non-Latin)
  { code: "am",     label: "አማርኛ",         dir: "ltr", script: "ethiopic" },
];

export const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map(l => [l.code, l]));

// Map our internal lang codes → MyMemory API codes
export const MYMEMORY_CODE = {
  "ar": "ar", "fa": "fa", "ur": "ur", "ku": "ku", "he": "he",
  "en": "en", "fr": "fr", "es": "es", "pt": "pt-pt", "it": "it",
  "de": "de", "nl": "nl", "sv": "sv", "no": "no", "da": "da",
  "fi": "fi", "is": "is", "pl": "pl", "cs": "cs", "sk": "sk",
  "hu": "hu", "ro": "ro", "hr": "hr", "sl": "sl", "sq": "sq",
  "et": "et", "lv": "lv", "lt": "lt", "tr": "tr", "az": "az",
  "ca": "ca", "eu": "eu", "gl": "gl", "cy": "cy", "ga": "ga",
  "mt": "mt", "id": "id", "ms": "ms", "tl": "tl", "vi": "vi",
  "sw": "sw", "ha": "ha", "yo": "yo", "zu": "zu", "af": "af",
  "so": "so", "eo": "eo",
  "ru": "ru", "uk": "uk", "be": "be", "bg": "bg", "sr": "sr",
  "mk": "mk", "mn": "mn", "kk": "kk", "ky": "ky", "uz": "uz",
  "el": "el", "hy": "hy", "ka": "ka",
  "zh-CN": "zh-CN", "zh-TW": "zh-TW", "ja": "ja", "ko": "ko",
  "hi": "hi", "mr": "mr", "ne": "ne", "bn": "bn", "pa": "pa",
  "gu": "gu", "ta": "ta", "te": "te", "kn": "kn", "ml": "ml",
  "si": "si", "th": "th", "lo": "lo", "km": "km", "my": "my",
  "am": "am",
};

// Group languages by region for the dropdown
export const LANGUAGE_GROUPS = [
  { label: "Static (instant)", codes: ["ar", "en"] },
  { label: "Suggested",        codes: ["fr", "es", "zh-CN", "ja", "ru", "hi", "ur", "fa", "tr", "de", "pt", "it"] },
  { label: "Middle East",      codes: ["fa", "ur", "ku", "he", "tr"] },
  { label: "Europe",      codes: ["fr", "es", "pt", "it", "de", "nl", "sv", "no", "da", "fi", "is", "pl", "cs", "sk", "hu", "ro", "hr", "sl", "sq", "et", "lv", "lt", "ca", "eu", "gl", "cy", "ga", "mt", "el", "ru", "uk", "be", "bg", "sr", "mk", "hy", "ka", "eo"] },
  { label: "Asia",        codes: ["zh-CN", "zh-TW", "ja", "ko", "hi", "mr", "ne", "bn", "pa", "gu", "ta", "te", "kn", "ml", "si", "th", "lo", "km", "my", "vi", "id", "ms", "tl", "mn", "kk", "ky", "uz", "az"] },
  { label: "Africa",      codes: ["sw", "ha", "yo", "zu", "af", "so", "am"] },
];
