(function initIvriQuestAbbreviations(global) {
"use strict";

const ACADEMY_DICTIONARY_URL = "https://hebrew-academy.org.il/%D7%9E%D7%99%D7%9C%D7%95%D7%9F-%D7%94%D7%90%D7%A7%D7%93%D7%9E%D7%99%D7%94/";
const ACADEMY_ABBREVIATION_GUIDANCE_URL = "https://hebrew-academy.org.il/2017/01/30/%D7%A8%D7%90%D7%A9%D7%99-%D7%AA%D7%99%D7%91%D7%95%D7%AA-%D7%95%D7%A7%D7%99%D7%A6%D7%95%D7%A8%D7%99%D7%9D-%D7%9B%D7%AA%D7%99%D7%91%D7%94-%D7%94%D7%92%D7%99%D7%99%D7%94-%D7%95%D7%A0%D7%98%D7%99%D7%99/";
const ACADEMY_AFTERNOON_URL = "https://hebrew-academy.org.il/%D7%A6%D7%95%D7%94%D7%A8%D7%99%D7%99%D7%9D-%D7%98%D7%95%D7%91%D7%99%D7%9D/";
const ACADEMY_VAT_URL = "https://terms.hebrew-academy.org.il/munnah/117823_1/%D7%9E%D6%B7%D7%A1%20%D7%A2%D6%B5%D7%A8%D6%B6%D7%9A%D6%B0%20%D7%9E%D7%95%D6%BC%D7%A1%D6%B8%D7%A3";
const ACADEMY_IDENTITY_CARD_URL = "https://terms.hebrew-academy.org.il/munnah/72936_1/%D7%AA%D6%BC%D6%B0%D7%A2%D7%95%D6%BC%D7%93%D6%B7%D7%AA%20%D7%96%D6%B6%D7%94%D7%95%D6%BC%D7%AA";
const ACADEMY_LIMITED_COMPANY_URL = "https://terms.hebrew-academy.org.il/munnah/71783_1/%D7%97%D6%B6%D7%91%D6%B0%D7%A8%D6%B8%D7%94%20%D7%91%D6%BC%D6%B0%D7%A2%D6%B5%D7%A8%D6%B8%D7%91%D7%95%D6%B9%D7%9F%20%D7%9E%D6%BB%D7%92%D6%B0%D7%91%D6%BC%D6%B8%D7%9C";
const ACADEMY_DIRECTOR_GENERAL_URL = "https://terms.hebrew-academy.org.il/munnah/69630_2/director-general";
const ACADEMY_CHAIRPERSON_URL = "https://terms.hebrew-academy.org.il/munnah/70167_2/chairperson";
const ACADEMY_COURT_URL = "https://terms.hebrew-academy.org.il/munnah/60985_1";
const ACADEMY_THE_COURT_URL = "https://terms.hebrew-academy.org.il/munnah/84899_2/contempt%20of%20court";
const ACADEMY_BOND_INDEX_URL = "https://terms.hebrew-academy.org.il/munnah/63963_2/bond%20index";
const ACADEMY_SECURITIES_AUTHORITY_URL = "https://terms.hebrew-academy.org.il/munnah/61658_2/%D7%A2%D6%B8%D7%9E%D6%B4%D7%99%D7%9C%20%D7%A0%D6%B0%D7%99%D6%B8%D7%A8%D7%95%D6%B9%D7%AA%20%D7%A2%D6%B5%D7%A8%D6%B6%D7%9A";
const ACADEMY_REPORT_URL = "https://terms.hebrew-academy.org.il/munnah/6123_1/%D7%93%D6%BC%D6%B4%D7%99%D7%9F%20%D7%95%D6%B0%D7%97%D6%B6%D7%A9%D7%81%D6%B0%D7%91%D6%BC%D7%95%D6%B9%D7%9F";
const ACADEMY_OPINION_URL = "https://terms.hebrew-academy.org.il/munnah/115460_1/%D7%97%D6%B7%D7%95%D6%BC%D6%B7%D7%AA%20%D7%93%D6%BC%D6%B5%D7%A2%D6%B8%D7%94";
const ACADEMY_ATTORNEY_URL = "https://terms.hebrew-academy.org.il/munnah/115993_1/%D7%A2%D7%95%D6%B9%D7%A8%D6%B5%D7%9A%D6%B0%20%D7%93%D6%BC%D6%B4%D7%99%D7%9F";
const ACADEMY_ACCOUNTANT_URL = "https://terms.hebrew-academy.org.il/munnah/28182_1/%D7%A8%D7%95%D6%B9%D7%90%D6%B5%D7%94%20%D7%97%D6%B6%D7%A9%D7%81%D6%B0%D7%91%D6%BC%D7%95%D6%B9%D7%9F";
const ACADEMY_MDA_URL = "https://terms.hebrew-academy.org.il/munnah/120218_1/%D7%9E%D6%B8%D7%92%D6%B5%D7%9F%20%D7%93%D6%BC%D6%B8%D7%95%D6%B4%D7%93%20%D7%90%D6%B8%D7%93%D6%B9%D7%9D";
const GOV_MAMAD_URL = "https://www.gov.il/he/service/request-assistance-financing-protected-area-residential-properties-north";
const MR_MAMAK_URL = "https://mr.gov.il/ilgstorefront/he/p/attachment/C586B16EB7FE1EDE81A4D055FC29C143/%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%20%D7%94%D7%9C%D7%99%D7%9A";
const GOV_MAMAM_URL = "https://www.gov.il/BlobFolder/legalinfo/helters_specifications_regulations/he/sitedocs_shelters_specifications_regulations.pdf";

const ABBREVIATIONS = [
  {
    "id": "abbr-001",
    "abbr": "וכו׳",
    "expansionHe": "וכולי",
    "expansionHeNiqqud": "וְכוּלֵי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "etc. / and so on",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-002",
    "abbr": "וכד׳",
    "expansionHe": "וכדומה",
    "expansionHeNiqqud": "וְכַדּוֹמֶה",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "and the like",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-003",
    "abbr": "וגו׳",
    "expansionHe": "וגומר",
    "expansionHeNiqqud": "וְגוֹמֵר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "and so on (esp. after quote)",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-004",
    "abbr": "לדוג׳",
    "expansionHe": "לדוגמה",
    "expansionHeNiqqud": "לְדוּגְמָה",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "for example",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-005",
    "abbr": "מס׳",
    "expansionHe": "מספר",
    "expansionHeNiqqud": "מִסְפָּר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "number",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-006",
    "abbr": "עמ׳",
    "expansionHe": "עמוד",
    "expansionHeNiqqud": "עַמּוּד",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "page",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-007",
    "abbr": "פר׳",
    "expansionHe": "פרק / פרשה",
    "english": "chapter / weekly Torah portion",
    "bucket": "People, Health & Culture",
    "notes": "ambiguous; “parasha” vibe",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-008",
    "abbr": "ס׳",
    "expansionHe": "סעיף / סימן",
    "english": "section / siman",
    "bucket": "Civics, Law & Work",
    "notes": "ambiguous",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-009",
    "abbr": "סי׳",
    "expansionHe": "סימן",
    "english": "siman/section (rabbinic refs)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-010",
    "abbr": "עי׳",
    "expansionHe": "עיין",
    "expansionHeNiqqud": "עַיֵּן",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "see / refer to",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-011",
    "abbr": "ע״ע",
    "expansionHe": "עיין ערך / עיין עוד",
    "english": "see also",
    "bucket": "Daily Life & Home",
    "notes": "ambiguous",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-012",
    "abbr": "ר׳",
    "expansionHe": "רבי / ראה",
    "english": "Rabbi / see",
    "bucket": "People, Health & Culture",
    "notes": "ambiguous",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-013",
    "abbr": "נ״ל",
    "expansionHe": "נראה לי",
    "expansionHeNiqqud": "נִרְאֶה לִי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "seems to me",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-014",
    "abbr": "כנ״ל",
    "expansionHe": "כנזכר לעיל",
    "expansionHeNiqqud": "כַּנִּזְכָּר לְעֵיל",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "as mentioned above",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-015",
    "abbr": "ז״א",
    "expansionHe": "זאת אומרת",
    "expansionHeNiqqud": "זֹאת אוֹמֶרֶת",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "that is / i.e",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-016",
    "abbr": "אע״פ",
    "expansionHe": "אף על פי",
    "expansionHeNiqqud": "אַף עַל פִּי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "although",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-017",
    "abbr": "אא״כ",
    "expansionHe": "אלא אם כן",
    "expansionHeNiqqud": "אֶלָּא אִם כֵּן",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "unless",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-018",
    "abbr": "ע״י",
    "expansionHe": "על ידי",
    "expansionHeNiqqud": "עַל יְדֵי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "by / via",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-019",
    "abbr": "ע״מ",
    "expansionHe": "על מנת",
    "availability": {
      "abbreviationQuiz": false
    },
    "english": "in order to / provided that",
    "bucket": "Daily Life & Home",
    "notes": "collision with business acronym; hidden from quiz for now",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-020",
    "abbr": "ע״פ",
    "expansionHe": "על פי",
    "availability": {
      "abbreviationQuiz": false
    },
    "english": "according to",
    "bucket": "Civics, Law & Work",
    "notes": "collision with business/legal acronyms; hidden from quiz for now",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-021",
    "abbr": "כיו״ב",
    "expansionHe": "כיוצא בזה",
    "expansionHeNiqqud": "כַּיּוֹצֵא בָּזֶה",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "etc. / and the like",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-022",
    "abbr": "מ״מ",
    "expansionHe": "מכל מקום",
    "availability": {
      "abbreviationQuiz": false
    },
    "english": "in any case",
    "bucket": "Daily Life & Home",
    "notes": "collision with metric unit; hidden from quiz for now",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-023",
    "abbr": "עכ״ל",
    "expansionHe": "עד כאן לשונו",
    "english": "end quote",
    "bucket": "People, Health & Culture",
    "notes": "rabbinic writing",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-024",
    "abbr": "עכ״פ",
    "expansionHe": "על כל פנים",
    "expansionHeNiqqud": "עַל כָּל פָּנִים",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "at any rate",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-025",
    "abbr": "צ״ל",
    "expansionHe": "צריך לומר",
    "expansionHeNiqqud": "צָרִיךְ לוֹמַר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "should read / correction",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-026",
    "abbr": "אח״כ",
    "expansionHe": "אחר כך",
    "expansionHeNiqqud": "אַחַר כָּךְ",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "afterwards",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-027",
    "abbr": "כ״כ",
    "expansionHe": "כל כך",
    "expansionHeNiqqud": "כָּל כָּךְ",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "so / so much",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-028",
    "abbr": "י״ל",
    "expansionHe": "יש לומר",
    "english": "one may say",
    "bucket": "People, Health & Culture",
    "notes": "rabbinic style",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-029",
    "abbr": "י״א",
    "expansionHe": "יש אומרים",
    "english": "some say",
    "bucket": "People, Health & Culture",
    "notes": "also “11”",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-030",
    "abbr": "נ״ב",
    "expansionHe": "נזכרתי בדבר / Nota bene",
    "english": "PS / note",
    "bucket": "Daily Life & Home",
    "notes": "ambiguous",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-031",
    "abbr": "ד״ש",
    "expansionHe": "דרישת שלום",
    "english": "regards / say hi",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-032",
    "abbr": "וכו״ש",
    "expansionHe": "וכולי וכולי / וכו׳ וכו׳",
    "english": "etc. etc.",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-033",
    "abbr": "ת״ל",
    "expansionHe": "תודה לאל",
    "english": "thank God",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-034",
    "abbr": "בע״ה",
    "expansionHe": "בעזרת השם",
    "english": "with God’s help",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-035",
    "abbr": "בעז״ה",
    "expansionHe": "בעזרת ה׳",
    "english": "with God’s help",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-036",
    "abbr": "ב״ה",
    "expansionHe": "ברוך השם",
    "english": "blessed be God / thank God",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-037",
    "abbr": "בס״ד",
    "expansionHe": "בסיעתא דשמיא",
    "english": "with Heavenly assistance",
    "bucket": "People, Health & Culture",
    "notes": "Aramaic",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-038",
    "abbr": "הקב״ה",
    "expansionHe": "הקדוש ברוך הוא",
    "english": "the Holy One, blessed be He",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-039",
    "abbr": "ז״ל",
    "expansionHe": "זכרונו/זכרונה לברכה",
    "english": "of blessed memory",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-040",
    "abbr": "זצ״ל",
    "expansionHe": "זכר צדיק לברכה",
    "english": "of blessed memory (righteous)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-041",
    "abbr": "שליט״א",
    "expansionHe": "שיחיה לאורך ימים טובים אמן",
    "english": "may he live long, amen",
    "bucket": "People, Health & Culture",
    "notes": "honorific",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-042",
    "abbr": "הי״ד",
    "expansionHe": "ה׳ יקום דמו/דמה",
    "english": "may God avenge his/her blood",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-043",
    "abbr": "תנצב״ה",
    "expansionHe": "תהא נשמתו/ה צרורה בצרור החיים",
    "english": "may their soul be bound in the bundle of life",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-044",
    "abbr": "נ״ע",
    "expansionHe": "נשמתו/ה עדן",
    "english": "may their soul be in Eden",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-045",
    "abbr": "אדמו״ר",
    "expansionHe": "אדוננו מורנו ורבנו",
    "english": "our master/teacher/rabbi",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-046",
    "abbr": "ת״ח",
    "expansionHe": "תלמיד חכם",
    "english": "Torah scholar",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-047",
    "abbr": "חז״ל",
    "expansionHe": "חכמינו זכרונם לברכה",
    "english": "our sages of blessed memory",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-048",
    "abbr": "תנ״ך",
    "expansionHe": "תורה נביאים כתובים",
    "english": "Hebrew Bible (Tanakh)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-049",
    "abbr": "תושב״כ",
    "expansionHe": "תורה שבכתב",
    "english": "Written Torah",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-050",
    "abbr": "תושב״ע",
    "expansionHe": "תורה שבעל פה",
    "english": "Oral Torah",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-051",
    "abbr": "גמ׳",
    "expansionHe": "גמרא",
    "english": "Gemara",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-052",
    "abbr": "משנ״ב",
    "expansionHe": "משנה ברורה",
    "english": "Mishnah Berurah",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-053",
    "abbr": "שו״ע",
    "expansionHe": "שולחן ערוך",
    "english": "Shulchan Aruch",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-054",
    "abbr": "שו״ת",
    "expansionHe": "שאלות ותשובות",
    "english": "responsa Q&A",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-055",
    "abbr": "תוס׳",
    "expansionHe": "תוספות",
    "english": "Tosafot",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-056",
    "abbr": "רש״י",
    "expansionHe": "רבי שלמה יצחקי",
    "english": "Rashi",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-057",
    "abbr": "רמב״ם",
    "expansionHe": "רבי משה בן מימון",
    "english": "Maimonides",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-058",
    "abbr": "רמב״ן",
    "expansionHe": "רבי משה בן נחמן",
    "english": "Nahmanides",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-059",
    "abbr": "רשב״א",
    "expansionHe": "רבי שלמה בן אדרת",
    "english": "Rashba",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-060",
    "abbr": "רא״ש",
    "expansionHe": "רבי אשר בן יחיאל",
    "english": "Rosh",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-061",
    "abbr": "רי״ף",
    "expansionHe": "רבי יצחק אלפסי",
    "english": "Rif",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-062",
    "abbr": "רמ״א",
    "expansionHe": "רבי משה איסרליש",
    "english": "Rema",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-063",
    "abbr": "האר״י",
    "expansionHe": "האלוהי רבי יצחק (לוריא)",
    "english": "the Ari (Isaac Luria)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-064",
    "abbr": "חב״ד",
    "expansionHe": "חכמה בינה דעת",
    "english": "Chabad",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-065",
    "abbr": "ר״ח",
    "expansionHe": "ראש חודש",
    "english": "new month",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-066",
    "abbr": "ר״ה",
    "expansionHe": "ראש השנה",
    "english": "Rosh Hashanah",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-067",
    "abbr": "יוה״כ",
    "expansionHe": "יום הכיפורים",
    "english": "Yom Kippur",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-068",
    "abbr": "חוה״מ",
    "expansionHe": "חול המועד",
    "english": "intermediate festival days",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-069",
    "abbr": "ת״ב",
    "expansionHe": "תשעה באב",
    "english": "Tisha B’Av",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-070",
    "abbr": "ע״ה",
    "expansionHe": "עליו/עליה השלום",
    "english": "peace be upon him/her",
    "bucket": "People, Health & Culture",
    "notes": "also used other ways",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-071",
    "abbr": "ביהכ״נ",
    "expansionHe": "בית הכנסת",
    "english": "synagogue",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-072",
    "abbr": "ס״ת",
    "expansionHe": "ספר תורה",
    "english": "Torah scroll",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-073",
    "abbr": "א״י",
    "expansionHe": "ארץ ישראל",
    "english": "Land of Israel",
    "bucket": "People, Health & Culture",
    "notes": "(geo but culturally loaded)",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-074",
    "abbr": "חו״ל",
    "expansionHe": "חוץ לארץ",
    "english": "abroad / outside Israel",
    "bucket": "Daily Life & Home",
    "notes": "common everyday usage",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-075",
    "abbr": "יו״ש",
    "expansionHe": "יהודה ושומרון",
    "english": "Judea & Samaria / West Bank",
    "bucket": "Civics, Law & Work",
    "notes": "politics/administration",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-076",
    "abbr": "ת״א",
    "expansionHe": "תל אביב",
    "english": "Tel Aviv",
    "bucket": "Daily Life & Home",
    "notes": "also used in law (ת״א)",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-077",
    "abbr": "י-ם",
    "expansionHe": "ירושלים",
    "english": "Jerusalem",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-078",
    "abbr": "ב״ש",
    "expansionHe": "באר שבע",
    "english": "Be’er Sheva",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-079",
    "abbr": "אחה״צ",
    "expansionHe": "אחר הצהריים",
    "expansionHeNiqqud": "אַחַר הַצָּהֳרַיִם",
    "expansionHeNiqqudSource": ACADEMY_AFTERNOON_URL,
    "english": "PM",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-080",
    "abbr": "לפנה״צ",
    "expansionHe": "לפני הצהריים",
    "expansionHeNiqqud": "לִפְנֵי הַצָּהֳרַיִם",
    "expansionHeNiqqudSource": ACADEMY_AFTERNOON_URL,
    "english": "AM",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-081",
    "abbr": "לפנה״ס",
    "expansionHe": "לפני הספירה",
    "english": "BCE",
    "bucket": "Ideas, Science & Tech",
    "notes": "date/chronology",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-082",
    "abbr": "לסה״נ",
    "expansionHe": "לספירה הנוצרית",
    "english": "CE",
    "bucket": "Ideas, Science & Tech",
    "notes": "date/chronology",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-083",
    "abbr": "יום א׳",
    "expansionHe": "יום ראשון",
    "expansionHeNiqqud": "יוֹם רִאשׁוֹן",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Sunday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-084",
    "abbr": "יום ב׳",
    "expansionHe": "יום שני",
    "expansionHeNiqqud": "יוֹם שֵׁנִי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Monday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-085",
    "abbr": "יום ג׳",
    "expansionHe": "יום שלישי",
    "expansionHeNiqqud": "יוֹם שְׁלִישִׁי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Tuesday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-086",
    "abbr": "יום ד׳",
    "expansionHe": "יום רביעי",
    "expansionHeNiqqud": "יוֹם רְבִיעִי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Wednesday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-087",
    "abbr": "יום ה׳",
    "expansionHe": "יום חמישי",
    "expansionHeNiqqud": "יוֹם חֲמִישִׁי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Thursday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-088",
    "abbr": "יום ו׳",
    "expansionHe": "יום שישי",
    "expansionHeNiqqud": "יוֹם שִׁשִּׁי",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Friday",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-089",
    "abbr": "גב׳",
    "expansionHe": "גברת",
    "expansionHeNiqqud": "גְּבֶרֶת",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Ms./Mrs.",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-090",
    "abbr": "מר׳",
    "expansionHe": "מר",
    "expansionHeNiqqud": "מַר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Mr.",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-091",
    "abbr": "ד״ר",
    "expansionHe": "דוקטור",
    "expansionHeNiqqud": "דּוֹקְטוֹר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Dr.",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-092",
    "abbr": "פרופ׳",
    "expansionHe": "פרופסור",
    "expansionHeNiqqud": "פְּרוֹפֶסוֹר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Professor",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-093",
    "abbr": "טל׳",
    "expansionHe": "טלפון",
    "expansionHeNiqqud": "טֵלֵפוֹן",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "phone",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-094",
    "abbr": "רח׳",
    "expansionHe": "רחוב",
    "expansionHeNiqqud": "רְחוֹב",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "street",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-095",
    "abbr": "ת״ד",
    "expansionHe": "תיבת דואר",
    "english": "P.O. Box",
    "bucket": "Daily Life & Home",
    "notes": "also “traffic accident”",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-096",
    "abbr": "כת׳",
    "expansionHe": "כתובת",
    "expansionHeNiqqud": "כְּתוֹבֶת",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "address",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-097",
    "abbr": "ק״מ",
    "expansionHe": "קילומטר",
    "expansionHeNiqqud": "קִילוֹמֶטֶר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "kilometer",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-098",
    "abbr": "מ״מ",
    "expansionHe": "מילימטר",
    "availability": {
      "abbreviationQuiz": false
    },
    "english": "millimeter",
    "bucket": "Ideas, Science & Tech",
    "notes": "collision with phrase acronym; hidden from quiz for now",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-099",
    "abbr": "ס״מ",
    "expansionHe": "סנטימטר",
    "expansionHeNiqqud": "סֶנְטִימֶטֶר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "centimeter",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-100",
    "abbr": "מ״ק",
    "expansionHe": "מטר מעוקב",
    "expansionHeNiqqud": "מֶטֶר מְעֻקָּב",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "cubic meter",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-101",
    "abbr": "ק״ג",
    "expansionHe": "קילוגרם",
    "expansionHeNiqqud": "קִילוֹגְרַם",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "kilogram",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-102",
    "abbr": "מ״ג",
    "expansionHe": "מיליגרם",
    "expansionHeNiqqud": "מִילִיגְרַם",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "milligram",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-103",
    "abbr": "מ״ל",
    "expansionHe": "מיליליטר",
    "expansionHeNiqqud": "מִילִילִיטֶר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "milliliter",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-104",
    "abbr": "ל׳",
    "expansionHe": "ליטר",
    "expansionHeNiqqud": "לִיטֶר",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "liter",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-105",
    "abbr": "קמ״ש",
    "expansionHe": "קילומטר לשעה",
    "expansionHeNiqqud": "קִילוֹמֶטֶר לְשָׁעָה",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "km/h",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-106",
    "abbr": "קו״ש",
    "expansionHe": "קילוואט־שעה",
    "english": "kWh",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-107",
    "abbr": "סל״ד",
    "expansionHe": "סיבובים לדקה",
    "english": "RPM",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-108",
    "abbr": "ש״ח",
    "expansionHe": "שקל חדש / שקלים",
    "english": "Israeli shekels (ILS)",
    "bucket": "Civics, Law & Work",
    "notes": "finance",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-109",
    "abbr": "מע״מ",
    "expansionHe": "מס ערך מוסף",
    "expansionHeNiqqud": "מַס עֵרֶךְ מוּסָף",
    "expansionHeNiqqudSource": ACADEMY_VAT_URL,
    "english": "VAT",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-110",
    "abbr": "אג״ח",
    "expansionHe": "אגרות חוב",
    "expansionHeNiqqud": "אִגְּרוֹת חוֹב",
    "expansionHeNiqqudSource": ACADEMY_BOND_INDEX_URL,
    "english": "bonds",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-111",
    "abbr": "ני״ע",
    "expansionHe": "ניירות ערך",
    "expansionHeNiqqud": "נְיָרוֹת עֵרֶךְ",
    "expansionHeNiqqudSource": ACADEMY_SECURITIES_AUTHORITY_URL,
    "english": "stocks / securities",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-112",
    "abbr": "ת״ז",
    "expansionHe": "תעודת זהות",
    "expansionHeNiqqud": "תְּעוּדַת זֶהוּת",
    "expansionHeNiqqudSource": ACADEMY_IDENTITY_CARD_URL,
    "english": "ID card / ID number",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-113",
    "abbr": "דו״ח",
    "expansionHe": "דין וחשבון",
    "expansionHeNiqqud": "דִּין וְחֶשְׁבּוֹן",
    "expansionHeNiqqudSource": ACADEMY_REPORT_URL,
    "english": "report",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-114",
    "abbr": "ח״פ",
    "expansionHe": "חברה פרטית (מספר חברה)",
    "english": "company registration no. (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-115",
    "abbr": "ע״מ",
    "expansionHe": "עוסק מורשה",
    "english": "licensed/VAT-registered business",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-116",
    "abbr": "ע״פ",
    "expansionHe": "עוסק פטור",
    "english": "exempt small business",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-117",
    "abbr": "בע״מ",
    "expansionHe": "בערבון מוגבל",
    "expansionHeNiqqud": "בְּעֵרָבוֹן מֻגְבָּל",
    "expansionHeNiqqudSource": ACADEMY_LIMITED_COMPANY_URL,
    "english": "Ltd. / limited liability",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-118",
    "abbr": "מנכ״ל",
    "expansionHe": "מנהל כללי",
    "expansionHeNiqqud": "מְנַהֵל כְּלָלִי",
    "expansionHeNiqqudSource": ACADEMY_DIRECTOR_GENERAL_URL,
    "english": "Director General / CEO",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-119",
    "abbr": "סמנכ״ל",
    "expansionHe": "סגן מנהל כללי",
    "english": "Deputy DG / VP",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-120",
    "abbr": "יו״ר",
    "expansionHe": "יושב ראש",
    "expansionHeNiqqud": "יוֹשֵׁב רֹאשׁ",
    "expansionHeNiqqudSource": ACADEMY_CHAIRPERSON_URL,
    "english": "chairperson",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-121",
    "abbr": "ח״כ",
    "expansionHe": "חבר כנסת",
    "english": "Member of Knesset (MK)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-122",
    "abbr": "מ״י",
    "expansionHe": "מדינת ישראל",
    "english": "State of Israel",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-123",
    "abbr": "רה״מ",
    "expansionHe": "ראש הממשלה",
    "english": "Prime Minister",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-124",
    "abbr": "יועמ״ש",
    "expansionHe": "היועץ המשפטי (לממשלה/למשרד)",
    "english": "legal adviser / AG",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-125",
    "abbr": "בג״ץ",
    "expansionHe": "בית משפט גבוה לצדק",
    "english": "High Court of Justice",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-126",
    "abbr": "ביהמ״ש",
    "expansionHe": "בית המשפט",
    "expansionHeNiqqud": "בֵּית הַמִּשְׁפָּט",
    "expansionHeNiqqudSource": ACADEMY_THE_COURT_URL,
    "english": "the court",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-127",
    "abbr": "בימ״ש",
    "expansionHe": "בית משפט",
    "expansionHeNiqqud": "בֵּית מִשְׁפָּט",
    "expansionHeNiqqudSource": ACADEMY_COURT_URL,
    "english": "court",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-128",
    "abbr": "ביה״ד",
    "expansionHe": "בית הדין",
    "english": "tribunal/court",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-129",
    "abbr": "פס״ד",
    "expansionHe": "פסק דין",
    "expansionHeNiqqud": "פְּסַק דִּין",
    "expansionHeNiqqudSource": ACADEMY_COURT_URL,
    "english": "judgment / ruling",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-130",
    "abbr": "חו״ד",
    "expansionHe": "חוות דעת",
    "expansionHeNiqqud": "חַוַּת דַּעַת",
    "expansionHeNiqqudSource": ACADEMY_OPINION_URL,
    "english": "expert/legal opinion",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-131",
    "abbr": "עו״ד",
    "expansionHe": "עורך דין",
    "expansionHeNiqqud": "עוֹרֵךְ דִּין",
    "expansionHeNiqqudSource": ACADEMY_ATTORNEY_URL,
    "english": "attorney",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-132",
    "abbr": "רו״ח",
    "expansionHe": "רואה חשבון",
    "expansionHeNiqqud": "רוֹאֵה חֶשְׁבּוֹן",
    "expansionHeNiqqudSource": ACADEMY_ACCOUNTANT_URL,
    "english": "CPA / accountant",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-133",
    "abbr": "בע״ד",
    "expansionHe": "בעלי דין",
    "english": "litigants / parties",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-134",
    "abbr": "ע״א",
    "expansionHe": "ערעור אזרחי",
    "english": "civil appeal",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-135",
    "abbr": "ע״פ",
    "expansionHe": "ערעור פלילי",
    "availability": {
      "abbreviationQuiz": false
    },
    "english": "criminal appeal",
    "bucket": "Civics, Law & Work",
    "notes": "collision with business/legal acronyms; hidden from quiz for now",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-136",
    "abbr": "רע״א",
    "expansionHe": "רשות ערעור אזרחית",
    "english": "leave to appeal (civil)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-137",
    "abbr": "רע״פ",
    "expansionHe": "רשות ערעור פלילית",
    "english": "leave to appeal (criminal)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-138",
    "abbr": "עע״מ",
    "expansionHe": "ערעור על עניינים מנהליים",
    "english": "administrative appeal",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-139",
    "abbr": "עת״מ",
    "expansionHe": "עתירה מנהלית",
    "english": "administrative petition",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-140",
    "abbr": "ת״פ",
    "expansionHe": "תיק פלילי",
    "english": "criminal case file",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-142",
    "abbr": "ת״צ",
    "expansionHe": "תובענה ייצוגית",
    "english": "class action",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-143",
    "abbr": "ת״ק",
    "expansionHe": "תביעה קטנה / תביעות קטנות",
    "english": "small claims",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-144",
    "abbr": "צה״ל",
    "expansionHe": "צבא ההגנה לישראל",
    "english": "IDF",
    "bucket": "Ideas, Science & Tech",
    "notes": "military/security bucketed as “tech-ish”",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-145",
    "abbr": "רמטכ״ל",
    "expansionHe": "ראש המטה הכללי",
    "english": "Chief of General Staff",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-146",
    "abbr": "אמ״ן",
    "expansionHe": "אגף המודיעין",
    "english": "Military Intelligence Directorate",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-147",
    "abbr": "שב״כ",
    "expansionHe": "שירות הביטחון הכללי",
    "english": "Shin Bet / internal security",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-148",
    "abbr": "המפכ״ל",
    "expansionHe": "המפקח הכללי",
    "english": "Police Commissioner (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "policing is civics",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-149",
    "abbr": "שב״ס",
    "expansionHe": "שירות בתי הסוהר",
    "english": "Prison Service (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-150",
    "abbr": "מג״ב",
    "expansionHe": "משמר הגבול",
    "english": "Border Police (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-151",
    "abbr": "מל״ל",
    "expansionHe": "המטה לביטחון לאומי",
    "english": "National Security Council (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-152",
    "abbr": "פצ״ר",
    "expansionHe": "הפרקליט הצבאי הראשי",
    "english": "Military Advocate General",
    "bucket": "Civics, Law & Work",
    "notes": "legal",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-153",
    "abbr": "חה״א",
    "expansionHe": "חיל האוויר",
    "english": "Air Force",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-154",
    "abbr": "חה״י",
    "expansionHe": "חיל הים",
    "english": "Navy",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-155",
    "abbr": "פקע״ר",
    "expansionHe": "פיקוד העורף",
    "english": "Home Front Command",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-156",
    "abbr": "אכ״א",
    "expansionHe": "אגף כוח אדם",
    "english": "Manpower Directorate",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-157",
    "abbr": "אג״ת",
    "expansionHe": "אגף התכנון",
    "english": "Planning Directorate",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-158",
    "abbr": "קמ״ן",
    "expansionHe": "קצין מודיעין",
    "english": "intelligence officer",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-159",
    "abbr": "קמב״ץ",
    "expansionHe": "קצין מבצעים",
    "english": "operations officer",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-160",
    "abbr": "מש״ק",
    "expansionHe": "מפקד שאינו קצין",
    "english": "NCO / non-commissioned officer",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-161",
    "abbr": "מ״פ",
    "expansionHe": "מפקד פלוגה",
    "english": "company commander",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-162",
    "abbr": "סמ״פ",
    "expansionHe": "סגן מפקד פלוגה",
    "english": "deputy company commander",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-163",
    "abbr": "מג״ד",
    "expansionHe": "מפקד גדוד",
    "english": "battalion commander",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-164",
    "abbr": "סמג״ד",
    "expansionHe": "סגן מפקד גדוד",
    "english": "deputy battalion commander",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-165",
    "abbr": "מח״ט",
    "expansionHe": "מפקד חטיבה",
    "english": "brigade commander",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-166",
    "abbr": "מ״צ",
    "expansionHe": "משטרה צבאית",
    "english": "Military Police",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-167",
    "abbr": "אב״כ",
    "expansionHe": "אטומי ביולוגי כימי",
    "english": "NBC (nuclear/biological/chemical)",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-168",
    "abbr": "נב״ק",
    "expansionHe": "נשק בלתי קונבנציונלי",
    "english": "non-conventional weapons",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-169",
    "abbr": "מכ״ם",
    "expansionHe": "מגלה כיוון ומרחק",
    "english": "radar",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-170",
    "abbr": "רק״ם",
    "expansionHe": "רכב קרבי משוריין",
    "english": "armored fighting vehicle",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-171",
    "abbr": "נגמ״ש",
    "expansionHe": "נושא גייסות משוריין",
    "english": "armored personnel carrier",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-172",
    "abbr": "מד״א",
    "expansionHe": "מגן דוד אדום",
    "expansionHeNiqqud": "מָגֵן דָּוִד אָדֹם",
    "expansionHeNiqqudSource": ACADEMY_MDA_URL,
    "english": "Magen David Adom (EMS)",
    "bucket": "People, Health & Culture",
    "notes": "health org",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-173",
    "abbr": "בי״ח",
    "expansionHe": "בית חולים",
    "expansionHeNiqqud": "בֵּית חוֹלִים",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "hospital",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-174",
    "abbr": "קופ״ח",
    "expansionHe": "קופת חולים",
    "expansionHeNiqqud": "קֻפַּת חוֹלִים",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "health fund / HMO",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-175",
    "abbr": "אק״ג",
    "expansionHe": "אלקטרוקרדיוגרם",
    "english": "ECG",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-176",
    "abbr": "ל״ד",
    "expansionHe": "לחץ דם",
    "expansionHeNiqqud": "לַחַץ דָּם",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "blood pressure",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-177",
    "abbr": "הלמ״ס",
    "expansionHe": "הלשכה המרכזית לסטטיסטיקה",
    "english": "CBS (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-178",
    "abbr": "רש״ת",
    "expansionHe": "רשות שדות התעופה",
    "english": "Airports Authority (Israel)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-179",
    "abbr": "רמ״י",
    "expansionHe": "רשות מקרקעי ישראל",
    "english": "Israel Land Authority",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-180",
    "abbr": "חח״י",
    "expansionHe": "חברת החשמל לישראל",
    "english": "Israel Electric Corporation",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-181",
    "abbr": "קק״ל",
    "expansionHe": "קרן קיימת לישראל",
    "english": "Jewish National Fund (JNF)",
    "bucket": "People, Health & Culture",
    "notes": "org/culture",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-182",
    "abbr": "נת״ע",
    "expansionHe": "נתיבי תחבורה עירוניים",
    "english": "NTA (mass transit company)",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-183",
    "abbr": "מע״ץ",
    "expansionHe": "מחלקת עבודות ציבוריות",
    "english": "(Former) Dept. of Public Works / roads authority",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-184",
    "abbr": "ממ״ד",
    "expansionHe": "מרחב מוגן דירתי",
    "expansionHeNiqqud": "מֶרְחָב מוּגָן דִּירָתִי",
    "expansionHeNiqqudSource": GOV_MAMAD_URL,
    "english": "safe room (apartment)",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-185",
    "abbr": "ממ״ק",
    "expansionHe": "מרחב מוגן קומתי",
    "expansionHeNiqqud": "מֶרְחָב מוּגָן קוֹמָתִי",
    "expansionHeNiqqudSource": MR_MAMAK_URL,
    "english": "floor shelter",
    "bucket": "Daily Life & Home",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-186",
    "abbr": "ממ״מ",
    "expansionHe": "מרחב מוגן מוסדי",
    "expansionHeNiqqud": "מֶרְחָב מוּגָן מוֹסָדִי",
    "expansionHeNiqqudSource": GOV_MAMAM_URL,
    "english": "institutional shelter",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-187",
    "abbr": "תמ״א",
    "expansionHe": "תוכנית מתאר ארצית",
    "english": "national outline plan",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-188",
    "abbr": "תב״ע",
    "expansionHe": "תוכנית בניין עיר",
    "english": "zoning/building plan",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-189",
    "abbr": "תת״ל",
    "expansionHe": "תוכנית תשתית לאומית",
    "english": "national infrastructure plan",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-190",
    "abbr": "תמ״ג",
    "expansionHe": "תוצר מקומי גולמי",
    "english": "GDP",
    "bucket": "Civics, Law & Work",
    "notes": "econ statistic",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-191",
    "abbr": "או״ם",
    "expansionHe": "אומות מאוחדות",
    "english": "United Nations",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-192",
    "abbr": "נאט״ו",
    "expansionHe": "ברית נאט״ו",
    "english": "NATO",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-193",
    "abbr": "אונר״א",
    "expansionHe": "סוכנות הסעד והתעסוקה של האו״ם",
    "english": "UNRWA",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-194",
    "abbr": "אונסק״ו",
    "expansionHe": "ארגון החינוך, המדע והתרבות של האו״ם",
    "english": "UNESCO",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-195",
    "abbr": "יוניס״ף",
    "expansionHe": "קרן החירום הבינלאומית של האו״ם לילדים",
    "english": "UNICEF",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-196",
    "abbr": "ארה״ב",
    "expansionHe": "ארצות הברית",
    "english": "United States",
    "bucket": "Civics, Law & Work",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-197",
    "abbr": "בר׳",
    "expansionHe": "בראשית",
    "english": "Genesis (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-198",
    "abbr": "שמ׳",
    "expansionHe": "שמות",
    "english": "Exodus (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-199",
    "abbr": "ויק׳",
    "expansionHe": "ויקרא",
    "english": "Leviticus (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-200",
    "abbr": "במ׳",
    "expansionHe": "במדבר",
    "english": "Numbers (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-201",
    "abbr": "דב׳",
    "expansionHe": "דברים",
    "english": "Deuteronomy (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-202",
    "abbr": "תה׳",
    "expansionHe": "תהילים",
    "english": "Psalms (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-203",
    "abbr": "מש׳",
    "expansionHe": "משלי",
    "english": "Proverbs (citation shorthand)",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-204",
    "abbr": "ב״ק",
    "expansionHe": "בבא קמא",
    "english": "Bava Kamma",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-205",
    "abbr": "ב״מ",
    "expansionHe": "בבא מציעא",
    "english": "Bava Metzia",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-206",
    "abbr": "ב״ב",
    "expansionHe": "בבא בתרא",
    "english": "Bava Batra",
    "bucket": "People, Health & Culture",
    "notes": "",
    "source": "abbreviations-xlsx"
  },
  {
    "id": "abbr-207",
    "abbr": "ר״ת",
    "expansionHe": "ראשי תיבות",
    "expansionHeNiqqud": "רָאשֵׁי תֵּבוֹת",
    "expansionHeNiqqudSource": ACADEMY_ABBREVIATION_GUIDANCE_URL,
    "english": "acronym / abbreviation",
    "bucket": "Ideas, Science & Tech",
    "notes": "",
    "source": "manual"
  },
  {
    "id": "abbr-208",
    "abbr": "מוצ״ש",
    "expansionHe": "מוצאי שבת",
    "expansionHeNiqqud": "מוֹצָאֵי שַׁבָּת",
    "expansionHeNiqqudSource": ACADEMY_DICTIONARY_URL,
    "english": "Saturday night",
    "bucket": "People, Health & Culture",
    "notes": "Common shorthand for Saturday night / right after Shabbat.",
    "source": "manual"
  }
];

function getAbbreviations() {
  return ABBREVIATIONS.map((entry) => ({ ...entry }));
}

global.IvriQuestAbbreviations = {
  getAbbreviations,
};
})(window);
