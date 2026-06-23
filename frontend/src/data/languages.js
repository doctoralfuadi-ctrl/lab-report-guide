// 70+ languages with native labels, ISO codes, text direction, and script-family hints
// for dynamic font loading. Used by LanguageSelector + TranslationService.

export const LANGUAGES = [
  // RTL Semitic / Indo-Iranian
  { code: "ar",     label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",       dir: "rtl", script: "arabic" },
  { code: "fa",     label: "\u0641\u0627\u0631\u0633\u06cc",         dir: "rtl", script: "arabic" },
  { code: "ur",     label: "\u0627\u0631\u062f\u0648",          dir: "rtl", script: "arabic" },
  { code: "ku",     label: "Kurd\u00ee",         dir: "rtl", script: "arabic" },
  { code: "he",     label: "\u05e2\u05d1\u05e8\u05d9\u05ea",         dir: "rtl", script: "hebrew" },

  // LTR Latin / Germanic / Romance
  { code: "en",     label: "English",       dir: "ltr", script: "latin" },
  { code: "fr",     label: "Fran\u00e7ais",      dir: "ltr", script: "latin" },
  { code: "es",     label: "Espa\u00f1ol",       dir: "ltr", script: "latin" },
  { code: "pt",     label: "Portugu\u00eas",     dir: "ltr", script: "latin" },
  { code: "it",     label: "Italiano",      dir: "ltr", script: "latin" },
  { code: "de",     label: "Deutsch",       dir: "ltr", script: "latin" },
  { code: "nl",     label: "Nederlands",    dir: "ltr", script: "latin" },
  { code: "sv",     label: "Svenska",       dir: "ltr", script: "latin" },
  { code: "no",     label: "Norsk",         dir: "ltr", script: "latin" },
  { code: "da",     label: "Dansk",         dir: "ltr", script: "latin" },
  { code: "fi",     label: "Suomi",         dir: "ltr", script: "latin" },
  { code: "is",     label: "\u00cdslenska",      dir: "ltr", script: "latin" },
  { code: "pl",     label: "Polski",        dir: "ltr", script: "latin" },
  { code: "cs",     label: "\u010ce\u0161tina",       dir: "ltr", script: "latin" },
  { code: "sk",     label: "Sloven\u010dina",    dir: "ltr", script: "latin" },
  { code: "hu",     label: "Magyar",        dir: "ltr", script: "latin" },
  { code: "ro",     label: "Rom\u00e2n\u0103",        dir: "ltr", script: "latin" },
  { code: "hr",     label: "Hrvatski",      dir: "ltr", script: "latin" },
  { code: "sl",     label: "Sloven\u0161\u010dina",   dir: "ltr", script: "latin" },
  { code: "sq",     label: "Shqip",         dir: "ltr", script: "latin" },
  { code: "et",     label: "Eesti",         dir: "ltr", script: "latin" },
  { code: "lv",     label: "Latvie\u0161u",      dir: "ltr", script: "latin" },
  { code: "lt",     label: "Lietuvi\u0173",      dir: "ltr", script: "latin" },
  { code: "tr",     label: "T\u00fcrk\u00e7e",        dir: "ltr", script: "latin" },
  { code: "az",     label: "Az\u0259rbaycan",    dir: "ltr", script: "latin" },
  { code: "ca",     label: "Catal\u00e0",        dir: "ltr", script: "latin" },
  { code: "eu",     label: "Euskara",       dir: "ltr", script: "latin" },
  { code: "gl",     label: "Galego",        dir: "ltr", script: "latin" },
  { code: "cy",     label: "Cymraeg",       dir: "ltr", script: "latin" },
  { code: "ga",     label: "Gaeilge",       dir: "ltr", script: "latin" },
  { code: "mt",     label: "Malti",         dir: "ltr", script: "latin" },
  { code: "id",     label: "Bahasa Indonesia", dir: "ltr", script: "latin" },
  { code: "ms",     label: "Bahasa Melayu", dir: "ltr", script: "latin" },
  { code: "tl",     label: "Filipino",      dir: "ltr", script: "latin" },
  { code: "vi",     label: "Ti\u1ebfng Vi\u1ec7t",    dir: "ltr", script: "latin" },
  { code: "sw",     label: "Kiswahili",     dir: "ltr", script: "latin" },
  { code: "ha",     label: "Hausa",         dir: "ltr", script: "latin" },
  { code: "yo",     label: "Yor\u00f9b\u00e1",        dir: "ltr", script: "latin" },
  { code: "zu",     label: "isiZulu",       dir: "ltr", script: "latin" },
  { code: "af",     label: "Afrikaans",     dir: "ltr", script: "latin" },
  { code: "so",     label: "Soomaali",      dir: "ltr", script: "latin" },
  { code: "eo",     label: "Esperanto",     dir: "ltr", script: "latin" },

  // Cyrillic
  { code: "ru",     label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",       dir: "ltr", script: "cyrillic" },
  { code: "uk",     label: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430",    dir: "ltr", script: "cyrillic" },
  { code: "be",     label: "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f",    dir: "ltr", script: "cyrillic" },
  { code: "bg",     label: "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438",     dir: "ltr", script: "cyrillic" },
  { code: "sr",     label: "\u0421\u0440\u043f\u0441\u043a\u0438",        dir: "ltr", script: "cyrillic" },
  { code: "mk",     label: "\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438",    dir: "ltr", script: "cyrillic" },
  { code: "mn",     label: "\u041c\u043e\u043d\u0433\u043e\u043b",        dir: "ltr", script: "cyrillic" },
  { code: "kk",     label: "\u049a\u0430\u0437\u0430\u049b\u0448\u0430",       dir: "ltr", script: "cyrillic" },
  { code: "ky",     label: "\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430",      dir: "ltr", script: "cyrillic" },
  { code: "uz",     label: "O\u02bbzbekcha",     dir: "ltr", script: "latin" },

  // Greek / Armenian / Georgian
  { code: "el",     label: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac",      dir: "ltr", script: "greek" },
  { code: "hy",     label: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576",       dir: "ltr", script: "armenian" },
  { code: "ka",     label: "\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8",       dir: "ltr", script: "georgian" },

  // CJK
  { code: "zh-CN",  label: "\u4e2d\u6587\uff08\u7b80\u4f53\uff09",   dir: "ltr", script: "cjk-sc" },
  { code: "zh-TW",  label: "\u4e2d\u6587\uff08\u7e41\u9ad4\uff09",   dir: "ltr", script: "cjk-tc" },
  { code: "ja",     label: "\u65e5\u672c\u8a9e",         dir: "ltr", script: "cjk-jp" },
  { code: "ko",     label: "\ud55c\uad6d\uc5b4",         dir: "ltr", script: "cjk-kr" },

  // South Asian (Devanagari / Bengali / Tamil / Telugu / etc.)
  { code: "hi",     label: "\u0939\u093f\u0928\u094d\u0926\u0940",         dir: "ltr", script: "devanagari" },
  { code: "mr",     label: "\u092e\u0930\u093e\u0920\u0940",         dir: "ltr", script: "devanagari" },
  { code: "ne",     label: "\u0928\u0947\u092a\u093e\u0932\u0940",         dir: "ltr", script: "devanagari" },
  { code: "bn",     label: "\u09ac\u09be\u0982\u09b2\u09be",         dir: "ltr", script: "bengali" },
  { code: "pa",     label: "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40",         dir: "ltr", script: "gurmukhi" },
  { code: "gu",     label: "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0",       dir: "ltr", script: "gujarati" },
  { code: "ta",     label: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd",          dir: "ltr", script: "tamil" },
  { code: "te",     label: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41",        dir: "ltr", script: "telugu" },
  { code: "kn",     label: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1",         dir: "ltr", script: "kannada" },
  { code: "ml",     label: "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02",       dir: "ltr", script: "malayalam" },
  { code: "si",     label: "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd",         dir: "ltr", script: "sinhala" },

  // SE Asian
  { code: "th",     label: "\u0e44\u0e17\u0e22",           dir: "ltr", script: "thai" },
  { code: "lo",     label: "\u0ea5\u0eb2\u0ea7",           dir: "ltr", script: "lao" },
  { code: "km",     label: "\u1781\u17d2\u1798\u17c2\u179a",          dir: "ltr", script: "khmer" },
  { code: "my",     label: "\u1019\u103c\u1014\u103a\u1019\u102c",        dir: "ltr", script: "myanmar" },

  // African (non-Latin)
  { code: "am",     label: "\u12a0\u121b\u122d\u129b",         dir: "ltr", script: "ethiopic" },
];

export const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map(l => [l.code, l]));

// Map our internal lang codes \u2192 MyMemory API codes
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
