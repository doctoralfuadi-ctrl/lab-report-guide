// 70+ languages with native labels, ISO codes, text direction, and script-family hints
// for dynamic font loading. Used by LanguageSelector + TranslationService.

export const LANGUAGES = [
  // RTL Semitic / Indo-Iranian
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", dir: "rtl", script: "arabic" },
  { code: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea", dir: "rtl", script: "hebrew" },
  { code: "fa", label: "\u0641\u0627\u0631\u0633\u06cc", dir: "rtl", script: "arabic" },
  { code: "ur", label: "\u0627\u0631\u062f\u0648", dir: "rtl", script: "arabic" },
  { code: "ku", label: "\u06a9\u0648\u0631\u062f\u06cc", dir: "rtl", script: "arabic" },
  { code: "ps", label: "\u067e\u069a\u062a\u0648", dir: "rtl", script: "arabic" },
  // European (Latin script)
  { code: "en", label: "English", dir: "ltr", script: "latin" },
  { code: "es", label: "Espa\u00f1ol", dir: "ltr", script: "latin" },
  { code: "fr", label: "Fran\u00e7ais", dir: "ltr", script: "latin" },
  { code: "de", label: "Deutsch", dir: "ltr", script: "latin" },
  { code: "it", label: "Italiano", dir: "ltr", script: "latin" },
  { code: "pt", label: "Portugu\u00eas", dir: "ltr", script: "latin" },
  { code: "nl", label: "Nederlands", dir: "ltr", script: "latin" },
  { code: "pl", label: "Polski", dir: "ltr", script: "latin" },
  { code: "ro", label: "Rom\u00e2n\u0103", dir: "ltr", script: "latin" },
  { code: "sv", label: "Svenska", dir: "ltr", script: "latin" },
  { code: "da", label: "Dansk", dir: "ltr", script: "latin" },
  { code: "no", label: "Norsk", dir: "ltr", script: "latin" },
  { code: "fi", label: "Suomi", dir: "ltr", script: "latin" },
  { code: "cs", label: "\u010ce\u0161tina", dir: "ltr", script: "latin" },
  { code: "hu", label: "Magyar", dir: "ltr", script: "latin" },
  { code: "el", label: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac", dir: "ltr", script: "greek" },
  { code: "tr", label: "T\u00fcrk\u00e7e", dir: "ltr", script: "latin" },
  { code: "ca", label: "Catal\u00e0", dir: "ltr", script: "latin" },
  { code: "hr", label: "Hrvatski", dir: "ltr", script: "latin" },
  { code: "sk", label: "Sloven\u010dina", dir: "ltr", script: "latin" },
  { code: "bg", label: "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438", dir: "ltr", script: "cyrillic" },
  { code: "uk", label: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430", dir: "ltr", script: "cyrillic" },
  { code: "sr", label: "\u0421\u0440\u043f\u0441\u043a\u0438", dir: "ltr", script: "cyrillic" },
  { code: "lt", label: "Lietuvi\u0173", dir: "ltr", script: "latin" },
  { code: "lv", label: "Latvie\u0161u", dir: "ltr", script: "latin" },
  { code: "et", label: "Eesti", dir: "ltr", script: "latin" },
  { code: "sl", label: "Sloven\u0161\u010dina", dir: "ltr", script: "latin" },
  // Cyrillic
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", dir: "ltr", script: "cyrillic" },
  // CJK
  { code: "zh", label: "\u4e2d\u6587", dir: "ltr", script: "cjk" },
  { code: "ja", label: "\u65e5\u672c\u8a9e", dir: "ltr", script: "cjk" },
  { code: "ko", label: "\ud55c\uad6d\uc5b4", dir: "ltr", script: "cjk" },
  // South Asian
  { code: "hi", label: "\u0939\u093f\u0928\u094d\u0926\u0940", dir: "ltr", script: "devanagari" },
  { code: "bn", label: "\u09ac\u09be\u0982\u09b2\u09be", dir: "ltr", script: "bengali" },
  { code: "ta", label: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", dir: "ltr", script: "tamil" },
  { code: "te", label: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41", dir: "ltr", script: "telugu" },
  { code: "mr", label: "\u092e\u0930\u093e\u0920\u0940", dir: "ltr", script: "devanagari" },
  { code: "gu", label: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0", dir: "ltr", script: "gujarati" },
  { code: "kn", label: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1", dir: "ltr", script: "kannada" },
  { code: "ml", label: "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02", dir: "ltr", script: "malayalam" },
  { code: "pa", label: "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40", dir: "ltr", script: "gurmukhi" },
  { code: "si", label: "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd", dir: "ltr", script: "sinhala" },
  { code: "ne", label: "\u0928\u0947\u092a\u093e\u0932\u0940", dir: "ltr", script: "devanagari" },
  // Southeast Asian
  { code: "th", label: "\u0e44\u0e17\u0e22", dir: "ltr", script: "thai" },
  { code: "vi", label: "Ti\u1ebfng Vi\u1ec7t", dir: "ltr", script: "latin" },
  { code: "id", label: "Bahasa Indonesia", dir: "ltr", script: "latin" },
  { code: "ms", label: "Bahasa Melayu", dir: "ltr", script: "latin" },
  { code: "tl", label: "Filipino", dir: "ltr", script: "latin" },
  { code: "my", label: "\u1019\u103c\u1014\u103a\u1019\u102c", dir: "ltr", script: "myanmar" },
  { code: "km", label: "\u1781\u17d2\u1798\u17c2\u179a", dir: "ltr", script: "khmer" },
  // African
  { code: "sw", label: "Kiswahili", dir: "ltr", script: "latin" },
  { code: "am", label: "\u12a0\u121b\u122d\u129b", dir: "ltr", script: "ethiopic" },
  { code: "ha", label: "Hausa", dir: "ltr", script: "latin" },
  { code: "yo", label: "Yor\u00f9b\u00e1", dir: "ltr", script: "latin" },
  { code: "ig", label: "Igbo", dir: "ltr", script: "latin" },
  { code: "zu", label: "isiZulu", dir: "ltr", script: "latin" },
  // Turkic / Central Asian
  { code: "az", label: "Az\u0259rbaycanca", dir: "ltr", script: "latin" },
  { code: "uz", label: "O\u02bbzbekcha", dir: "ltr", script: "latin" },
  { code: "kk", label: "\u049a\u0430\u0437\u0430\u049b\u0448\u0430", dir: "ltr", script: "cyrillic" },
  // Others
  { code: "ka", label: "\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8", dir: "ltr", script: "georgian" },
  { code: "hy", label: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576", dir: "ltr", script: "armenian" },
  { code: "mn", label: "\u041c\u043e\u043d\u0433\u043e\u043b", dir: "ltr", script: "cyrillic" },
  { code: "sq", label: "Shqip", dir: "ltr", script: "latin" },
  { code: "mk", label: "\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438", dir: "ltr", script: "cyrillic" },
  { code: "bs", label: "Bosanski", dir: "ltr", script: "latin" },
  { code: "mt", label: "Malti", dir: "ltr", script: "latin" },
  { code: "cy", label: "Cymraeg", dir: "ltr", script: "latin" },
  { code: "ga", label: "Gaeilge", dir: "ltr", script: "latin" },
];

// Handy lookup
export const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map(l => [l.code, l]));

// MyMemory API language codes (most match ISO 639-1, a few exceptions)
export const MYMEMORY_CODE = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  sr: "sr-Cyrl",
  // default: same as the code
};

// Grouped for the selector UI
export const LANGUAGE_GROUPS = [
  {
    label: "Suggested",
    codes: ["en", "ar", "fr", "es", "de", "tr", "ru", "zh", "ja", "ko", "hi", "pt"],
  },
  {
    label: "RTL",
    codes: ["ar", "he", "fa", "ur", "ku", "ps"],
  },
  {
    label: "European",
    codes: ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "ro", "sv", "da", "no", "fi", "cs", "hu", "el", "tr", "ca", "hr", "sk", "bg", "uk", "sr", "lt", "lv", "et", "sl", "sq", "mk", "bs", "mt", "cy", "ga"],
  },
  {
    label: "Asian",
    codes: ["zh", "ja", "ko", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "si", "ne", "th", "vi", "id", "ms", "tl", "my", "km"],
  },
  {
    label: "Other",
    codes: ["ru", "ka", "hy", "az", "uz", "kk", "mn", "sw", "am", "ha", "yo", "ig", "zu"],
  },
];
