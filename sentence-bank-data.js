(function initIvriQuestSentenceBank(global) {
"use strict";

const SENTENCE_BANK = [
  {
    "id": "colloquial_01",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "מה נסגר איתך? לא שמעתי ממך כל היום.",
    "english": "What's going on with you? I haven't heard from you all day.",
    "hebrew_tokens": [
      "מה",
      "נסגר",
      "איתך",
      "לא",
      "שמעתי",
      "ממך",
      "כל",
      "היום"
    ],
    "english_tokens": [
      "What's going on",
      "with you",
      "I haven't heard",
      "from you",
      "all day"
    ],
    "hebrew_distractors": [
      "נגמר",
      "אליך",
      "שמעת",
      "הלילה",
      "עליך"
    ],
    "english_distractors": [
      "What's new",
      "about him",
      "I just saw",
      "since last night",
      "for a week"
    ],
    "notes": "נסגר is slang — literally 'closed' but means 'going on/happening' in colloquial speech."
  },
  {
    "id": "colloquial_02",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "אין לי כוח לזה עכשיו, נדבר אחר כך.",
    "english": "I don't have energy for this right now, we'll talk later.",
    "hebrew_tokens": [
      "אין",
      "לי",
      "כוח",
      "לזה",
      "עכשיו",
      "נדבר",
      "אחר",
      "כך"
    ],
    "english_tokens": [
      "I",
      "don't",
      "have",
      "energy",
      "for this",
      "right now",
      "we'll",
      "talk",
      "later"
    ],
    "hebrew_distractors": [
      "יש",
      "זמן",
      "מחר",
      "דיברנו",
      "בשביל"
    ],
    "english_distractors": [
      "more time",
      "tomorrow morning",
      "spoke",
      "never",
      "want"
    ],
    "notes": "אין לי כוח is a very common colloquial phrase meaning 'I can't deal' or 'I have no energy for this.'"
  },
  {
    "id": "colloquial_03",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "זה היה ממש מטורף אתמול, לא האמנתי למה שקרה.",
    "english": "That was totally crazy yesterday, I couldn't believe what happened.",
    "hebrew_tokens": [
      "זה",
      "היה",
      "ממש",
      "מטורף",
      "אתמול",
      "לא",
      "האמנתי",
      "למה",
      "שקרה"
    ],
    "english_tokens": [
      "That",
      "was",
      "totally",
      "crazy",
      "yesterday",
      "I",
      "couldn't",
      "believe",
      "what",
      "happened"
    ],
    "hebrew_distractors": [
      "קצת",
      "נורמלי",
      "היום",
      "ראיתי",
      "איפה"
    ],
    "english_distractors": [
      "today",
      "normal",
      "slightly",
      "saw",
      "where"
    ],
    "notes": "מטורף literally means 'insane' but is used casually like 'crazy/wild' in English."
  },
  {
    "id": "colloquial_04",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "חכה שנייה, אני כבר בא למטה.",
    "english": "Wait a second, I'm coming downstairs right now.",
    "hebrew_tokens": [
      "חכה",
      "שנייה",
      "אני",
      "כבר",
      "בא",
      "למטה"
    ],
    "english_tokens": [
      "Wait",
      "a",
      "second",
      "I'm",
      "coming",
      "downstairs",
      "right now"
    ],
    "hebrew_distractors": [
      "דקה",
      "עכשיו",
      "למעלה",
      "הולך",
      "פה"
    ],
    "english_distractors": [
      "one minute",
      "upstairs",
      "going",
      "right here",
      "leaving"
    ],
    "notes": "כבר בא adds urgency — 'already coming' implies 'on my way right now.'"
  },
  {
    "id": "colloquial_05",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "הוא סתם מדבר שטויות, אל תיקח אותו ברצינות.",
    "english": "He's just talking nonsense, don't take him seriously.",
    "hebrew_tokens": [
      "הוא",
      "סתם",
      "מדבר",
      "שטויות",
      "אל",
      "תיקח",
      "אותו",
      "ברצינות"
    ],
    "english_tokens": [
      "He's",
      "just",
      "talking",
      "nonsense",
      "don't",
      "take",
      "him",
      "seriously"
    ],
    "hebrew_distractors": [
      "היא",
      "מדברת",
      "אמת",
      "אותה",
      "תשמע"
    ],
    "english_distractors": [
      "she",
      "truth",
      "her",
      "listen",
      "always"
    ],
    "notes": "Third person gender swap (הוא/היא, מדבר/מדברת, אותו/אותה) is a good distractor set here."
  },
  {
    "id": "colloquial_06",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "בא לי משהו מתוק, אולי נלך לקנות גלידה.",
    "english": "I feel like something sweet, maybe we should go get ice cream.",
    "hebrew_tokens": [
      "בא",
      "לי",
      "משהו",
      "מתוק",
      "אולי",
      "נלך",
      "לקנות",
      "גלידה"
    ],
    "english_tokens": [
      "I",
      "feel",
      "like",
      "something",
      "sweet",
      "maybe",
      "we",
      "should",
      "go",
      "get",
      "ice",
      "cream"
    ],
    "hebrew_distractors": [
      "מלוח",
      "לאכול",
      "בטוח",
      "שוקולד",
      "רוצה"
    ],
    "english_distractors": [
      "salty",
      "eat",
      "definitely",
      "chocolate",
      "want"
    ],
    "notes": "בא לי is a uniquely Israeli expression — literally 'comes to me' but means 'I feel like / I'm craving.'"
  },
  {
    "id": "colloquial_07",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "אתה רציני עכשיו? זה נשמע לי הזוי לגמרי.",
    "english": "Are you serious right now? That sounds completely ridiculous to me.",
    "hebrew_tokens": [
      "אתה",
      "רציני",
      "עכשיו",
      "זה",
      "נשמע",
      "לי",
      "הזוי",
      "לגמרי"
    ],
    "english_tokens": [
      "Are you",
      "serious",
      "right now",
      "That sounds",
      "completely ridiculous",
      "to me"
    ],
    "hebrew_distractors": [
      "נראה",
      "קצת",
      "נורא",
      "באמת",
      "לך"
    ],
    "english_distractors": [
      "You look",
      "slightly weird",
      "totally normal",
      "really serious",
      "for me"
    ],
    "notes": "הזוי literally means 'hallucinatory/delusional' — used colloquially to mean 'ridiculous/unbelievable.'"
  },
  {
    "id": "colloquial_08",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "לא זורם לי הרעיון הזה, בוא נחשוב על משהו אחר.",
    "english": "I'm not into that idea, let's think of something else.",
    "hebrew_tokens": [
      "לא",
      "זורם",
      "לי",
      "הרעיון",
      "הזה",
      "בוא",
      "נחשוב",
      "על",
      "משהו",
      "אחר"
    ],
    "english_tokens": [
      "I'm",
      "not",
      "into",
      "that",
      "idea",
      "let's",
      "think",
      "of",
      "something",
      "else"
    ],
    "hebrew_distractors": [
      "מתאים",
      "הזאת",
      "נעשה",
      "טוב",
      "רוצה"
    ],
    "english_distractors": [
      "plan",
      "do",
      "good",
      "want",
      "same"
    ],
    "notes": "זורם לי literally 'flows for me' — slang for 'I'm into it / it vibes with me.'"
  },
  {
    "id": "colloquial_09",
    "category": "colloquial",
    "style": null,
    "difficulty": 3,
    "hebrew": "היא עשתה לי קטע מסריח, אני לא סומך עליה יותר.",
    "english": "She did something shady to me, I don't trust her anymore.",
    "hebrew_tokens": [
      "היא",
      "עשתה",
      "לי",
      "קטע",
      "מסריח",
      "אני",
      "לא",
      "סומך",
      "עליה",
      "יותר"
    ],
    "english_tokens": [
      "She",
      "did",
      "something",
      "shady",
      "to",
      "me",
      "I",
      "don't",
      "trust",
      "her",
      "anymore"
    ],
    "hebrew_distractors": [
      "הוא",
      "עשה",
      "עליו",
      "סומכת",
      "טוב"
    ],
    "hebrew_alternates": [
      {
        "text": "היא עשתה לי קטע מסריח, אני לא סומכת עליה יותר.",
        "tokens": [
          "היא",
          "עשתה",
          "לי",
          "קטע",
          "מסריח",
          "אני",
          "לא",
          "סומכת",
          "עליה",
          "יותר"
        ]
      }
    ],
    "english_distractors": [
      "he",
      "him",
      "nice",
      "always",
      "still"
    ],
    "notes": "קטע מסריח literally 'a stinky bit/segment' — heavy slang meaning 'a shady/messed up move.' Third-person gender distractors work well here."
  },
  {
    "id": "colloquial_10",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "יאללה, בוא נזוז, נהיה מאוחר.",
    "english": "Come on, let's go, it's getting late.",
    "hebrew_tokens": [
      "יאללה",
      "בוא",
      "נזוז",
      "נהיה",
      "מאוחר"
    ],
    "english_tokens": [
      "Come",
      "on",
      "let's",
      "go",
      "it's",
      "getting",
      "late"
    ],
    "hebrew_distractors": [
      "נלך",
      "מוקדם",
      "עכשיו",
      "כבר",
      "לאן"
    ],
    "english_distractors": [
      "early",
      "now",
      "where",
      "stay",
      "walk"
    ],
    "notes": "יאללה is borrowed from Arabic — one of the most common Israeli slang words, meaning 'come on/let's go.'"
  },
  {
    "id": "colloquial_11",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "איפה שמתי את המפתחות שלי? אני לא מוצא אותם.",
    "english": "Where did I put my keys? I can't find them.",
    "hebrew_tokens": [
      "איפה",
      "שמתי",
      "את",
      "המפתחות",
      "שלי",
      "אני",
      "לא",
      "מוצא",
      "אותם"
    ],
    "english_tokens": [
      "Where",
      "did",
      "I",
      "put",
      "my",
      "keys",
      "I",
      "can't",
      "find",
      "them"
    ],
    "hebrew_distractors": [
      "מתי",
      "הארנק",
      "שלך",
      "אותן",
      "רואה"
    ],
    "english_distractors": [
      "when",
      "wallet",
      "your",
      "see",
      "it"
    ],
    "notes": "אותם vs אותן tests masculine vs feminine pronoun for 'them' — מפתחות is masculine plural."
  },
  {
    "id": "colloquial_12",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "אפשר לפתוח את החלון? חם כאן מאוד.",
    "english": "Can you open the window? It's very hot here.",
    "hebrew_tokens": [
      "אפשר",
      "לפתוח",
      "את",
      "החלון",
      "חם",
      "כאן",
      "מאוד"
    ],
    "english_tokens": [
      "Can",
      "you",
      "open",
      "the",
      "window",
      "It's",
      "very",
      "hot",
      "here"
    ],
    "hebrew_distractors": [
      "לסגור",
      "הדלת",
      "קר",
      "שם",
      "בחוץ"
    ],
    "english_distractors": [
      "close",
      "door",
      "cold",
      "there",
      "outside"
    ],
    "notes": "Semantic opposites make strong distractors: לפתוח/לסגור (open/close), חם/קר (hot/cold)."
  },
  {
    "id": "colloquial_13",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "וואלה, לא ידעתי שזה ככה. תודה שאמרת לי.",
    "english": "Wow, I had no idea it was like that. Thanks for telling me.",
    "hebrew_tokens": [
      "וואלה",
      "לא",
      "ידעתי",
      "שזה",
      "ככה",
      "תודה",
      "שאמרת",
      "לי"
    ],
    "english_tokens": [
      "Wow",
      "I",
      "had",
      "no",
      "idea",
      "it",
      "was",
      "like",
      "that",
      "Thanks",
      "for",
      "telling",
      "me"
    ],
    "hebrew_distractors": [
      "באמת",
      "חשבתי",
      "אחרת",
      "סליחה",
      "ששמעת"
    ],
    "english_distractors": [
      "really",
      "thought",
      "differently",
      "sorry",
      "hearing"
    ],
    "notes": "וואלה (walla) is borrowed from Arabic — expresses surprise, like 'wow/really?!'"
  },
  {
    "id": "colloquial_14",
    "category": "colloquial",
    "style": null,
    "difficulty": 1,
    "hebrew": "הוא בסדר גמור, אחי, אל תגזים בכלל.",
    "english": "He's totally fine, bro, don't exaggerate.",
    "hebrew_tokens": [
      "הוא",
      "בסדר",
      "גמור",
      "אחי",
      "אל",
      "תגזים",
      "בכלל"
    ],
    "english_tokens": [
      "He's",
      "totally",
      "fine",
      "bro",
      "don't",
      "exaggerate"
    ],
    "hebrew_distractors": [
      "היא",
      "לא",
      "תדאג",
      "חבר",
      "קצת"
    ],
    "english_distractors": [
      "she",
      "worry",
      "friend",
      "little",
      "never"
    ],
    "notes": "אחי literally 'my brother' — used like 'bro/dude' in casual speech. Third-person הוא/היא distractor applies."
  },
  {
    "id": "colloquial_15",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "פצצה! לא ציפיתי לזה בכלל, כל הכבוד.",
    "english": "Amazing! I didn't expect that at all, well done.",
    "hebrew_tokens": [
      "פצצה",
      "לא",
      "ציפיתי",
      "לזה",
      "בכלל",
      "כל",
      "הכבוד"
    ],
    "english_tokens": [
      "Amazing",
      "I",
      "didn't",
      "expect",
      "that",
      "at",
      "all",
      "well",
      "done"
    ],
    "hebrew_distractors": [
      "יופי",
      "רציתי",
      "ממש",
      "חבל",
      "תודה"
    ],
    "english_distractors": [
      "great",
      "wanted",
      "really",
      "shame",
      "thanks"
    ],
    "notes": "פצצה literally 'bomb' — slang for 'amazing/incredible.' כל הכבוד literally 'all the honor' means 'well done.'"
  },
  {
    "id": "colloquial_16",
    "category": "colloquial",
    "style": null,
    "difficulty": 2,
    "hebrew": "נו, אתה בא איתנו או לא? תחליט כבר.",
    "english": "Well, are you coming with us or not? Make up your mind already.",
    "hebrew_tokens": [
      "נו",
      "אתה",
      "בא",
      "איתנו",
      "או",
      "לא",
      "תחליט",
      "כבר"
    ],
    "english_tokens": [
      "Well",
      "are",
      "you",
      "coming",
      "with",
      "us",
      "or",
      "not",
      "Make",
      "up",
      "your",
      "mind",
      "already"
    ],
    "hebrew_distractors": [
      "הולך",
      "אליהם",
      "אולי",
      "תגיד",
      "עכשיו"
    ],
    "english_distractors": [
      "going",
      "them",
      "maybe",
      "say",
      "right now"
    ],
    "notes": "נו is borrowed from Yiddish — an impatient 'well?/so?/come on!' Very common in spoken Hebrew. תחליט כבר adds impatience: 'decide already.'"
  },
  {
    "id": "colloquial_17",
    "category": "colloquial",
    "style": "whatsapp",
    "difficulty": 1,
    "hebrew": "נו?? מה קורה, אתה בסדר? ענה לי",
    "english": "Well?? What's going on, are you ok? Answer me",
    "hebrew_tokens": [
      "נו",
      "מה",
      "קורה",
      "אתה",
      "בסדר",
      "ענה",
      "לי"
    ],
    "english_tokens": [
      "Well",
      "What's",
      "going",
      "on",
      "are",
      "you",
      "ok",
      "Answer",
      "me"
    ],
    "hebrew_distractors": [
      "איפה",
      "טוב",
      "תגיד",
      "שלום",
      "כן"
    ],
    "english_distractors": [
      "where",
      "good",
      "tell",
      "hello",
      "yes"
    ],
    "notes": "Typical WhatsApp urgency — short, punchy, with נו for impatience and imperative ענה."
  },
  {
    "id": "colloquial_18",
    "category": "colloquial",
    "style": "whatsapp",
    "difficulty": 1,
    "hebrew": "סבבה, מחר ב-8, אל תאחר",
    "english": "Cool, tomorrow at 8, don't be late",
    "hebrew_tokens": [
      "סבבה",
      "מחר",
      "ב-8",
      "אל",
      "תאחר"
    ],
    "english_tokens": [
      "Cool",
      "tomorrow",
      "at",
      "8",
      "don't",
      "be",
      "late"
    ],
    "hebrew_distractors": [
      "בסדר",
      "היום",
      "ב-9",
      "תבוא",
      "מוקדם"
    ],
    "english_distractors": [
      "ok",
      "today",
      "9",
      "come",
      "early"
    ],
    "notes": "סבבה is slang from Arabic — means 'cool/alright/no problem.'"
  },
  {
    "id": "colloquial_19",
    "category": "colloquial",
    "style": "whatsapp",
    "difficulty": 1,
    "hebrew": "וואלה ראיתי, מגניב. שלח לי את הפרטים",
    "english": "Wow I saw it, cool. Send me the details",
    "hebrew_tokens": [
      "וואלה",
      "ראיתי",
      "מגניב",
      "שלח",
      "לי",
      "את",
      "הפרטים"
    ],
    "english_tokens": [
      "Wow",
      "I",
      "saw",
      "it",
      "cool",
      "Send",
      "me",
      "the",
      "details"
    ],
    "hebrew_distractors": [
      "שמעתי",
      "יפה",
      "תראה",
      "המידע",
      "בבקשה"
    ],
    "english_distractors": [
      "heard",
      "nice",
      "show",
      "info",
      "please"
    ],
    "notes": "מגניב literally 'cooling' — slang for 'cool/awesome.'"
  },
  {
    "id": "colloquial_20",
    "category": "colloquial",
    "style": "whatsapp",
    "difficulty": 1,
    "hebrew": "אחי חכה, אני עונה לך בעוד שנייה",
    "english": "Bro hold on, I'll get back to you in a sec",
    "hebrew_tokens": [
      "אחי",
      "חכה",
      "אני",
      "עונה",
      "לך",
      "בעוד",
      "שנייה"
    ],
    "english_tokens": [
      "Bro",
      "hold on",
      "I'll get back",
      "to you",
      "in a sec"
    ],
    "hebrew_distractors": [
      "חבר",
      "רגע",
      "כותב",
      "עכשיו",
      "דקה"
    ],
    "english_distractors": [
      "my friend",
      "wait up",
      "I'm writing",
      "right now",
      "in a minute"
    ],
    "notes": "עונה here means 'answering/responding' — בעוד שנייה means 'in another second.'"
  },
  {
    "id": "everyday_01",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אני צריך לקנות חלב ולחם, אין כלום בבית.",
    "english": "I need to buy milk and bread, there's nothing at home.",
    "hebrew_tokens": [
      "אני",
      "צריך",
      "לקנות",
      "חלב",
      "ולחם",
      "אין",
      "כלום",
      "בבית"
    ],
    "english_tokens": [
      "I",
      "need",
      "to",
      "buy",
      "milk",
      "and",
      "bread",
      "there's",
      "nothing",
      "at",
      "home"
    ],
    "hebrew_distractors": [
      "למכור",
      "וביצים",
      "הכל",
      "בחנות",
      "רוצה"
    ],
    "english_distractors": [
      "sell",
      "eggs",
      "everything",
      "store",
      "want"
    ],
    "notes": "Basic shopping vocabulary. ולחם combines the conjunction ו (and) with לחם (bread) — common Hebrew pattern."
  },
  {
    "id": "everyday_02",
    "category": "everyday",
    "style": null,
    "difficulty": 2,
    "hebrew": "באיזה שעה אתה חוזר הביתה? אני רוצה לתכנן ארוחת ערב.",
    "english": "What time are you coming home? I want to plan dinner.",
    "hebrew_tokens": [
      "באיזה",
      "שעה",
      "אתה",
      "חוזר",
      "הביתה",
      "אני",
      "רוצה",
      "לתכנן",
      "ארוחת ערב"
    ],
    "english_tokens": [
      "What",
      "time",
      "are",
      "you",
      "coming",
      "home",
      "I",
      "want",
      "to",
      "plan",
      "dinner"
    ],
    "hebrew_distractors": [
      "יוצא",
      "לעבודה",
      "צריך",
      "ארוחת צהריים",
      "ארוחת בוקר"
    ],
    "english_distractors": [
      "leaving",
      "work",
      "need",
      "lunch",
      "breakfast"
    ],
    "notes": "ארוחת ערב (evening meal) contrasts cleanly with ארוחת צהריים (lunch) and ארוחת בוקר (breakfast)."
  },
  {
    "id": "everyday_03",
    "category": "everyday",
    "style": null,
    "difficulty": 2,
    "hebrew": "שכחתי להטעין את הטלפון, הוא עומד להיכבות.",
    "english": "I forgot to charge my phone, it's about to die.",
    "hebrew_tokens": [
      "שכחתי",
      "להטעין",
      "את",
      "הטלפון",
      "הוא",
      "עומד",
      "להיכבות"
    ],
    "english_tokens": [
      "I",
      "forgot",
      "to",
      "charge",
      "my",
      "phone",
      "it's",
      "about",
      "to",
      "die"
    ],
    "hebrew_distractors": [
      "זכרתי",
      "לכבות",
      "המחשב",
      "כבר",
      "נדלק"
    ],
    "english_distractors": [
      "remembered",
      "turn off",
      "computer",
      "already",
      "turned on"
    ],
    "notes": "עומד להיכבות literally 'stands to be extinguished' — about to turn off/die. להטעין (to charge) vs לכבות (to turn off) is a good pair."
  },
  {
    "id": "everyday_04",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "יש לך עט שאני יכול להשתמש בו? אני צריך לכתוב משהו.",
    "english": "Do you have a pen I can use? I need to write something.",
    "hebrew_tokens": [
      "יש",
      "לך",
      "עט",
      "שאני",
      "יכול",
      "להשתמש",
      "בו",
      "אני",
      "צריך",
      "לכתוב",
      "משהו"
    ],
    "english_tokens": [
      "Do you have",
      "a pen",
      "I can use",
      "I need to write",
      "something"
    ],
    "hebrew_distractors": [
      "עיפרון",
      "לקרוא",
      "בה",
      "רוצה",
      "אין"
    ],
    "english_distractors": [
      "a pencil",
      "I can read",
      "I want one",
      "I need to draw",
      "anything"
    ],
    "notes": "בו (in it, masc.) vs בה (in it, fem.) — עט is masculine so בו is correct."
  },
  {
    "id": "everyday_05",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אנחנו נפגשים ליד התחנה, אל תאחר.",
    "english": "We're meeting near the station, don't be late.",
    "hebrew_tokens": [
      "אנחנו",
      "נפגשים",
      "ליד",
      "התחנה",
      "אל",
      "תאחר"
    ],
    "english_tokens": [
      "We're meeting",
      "near the station",
      "don't be late"
    ],
    "hebrew_distractors": [
      "מול",
      "הקניון",
      "תבוא",
      "מוקדם",
      "בתוך"
    ],
    "english_distractors": [
      "across the mall",
      "come early",
      "inside the station",
      "we're leaving",
      "don't come"
    ],
    "notes": "ליד (near/next to) vs מול (across from) vs בתוך (inside) — spatial preposition distractors."
  },
  {
    "id": "everyday_06",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אני מאחר בכמה דקות, כבר יוצא לדרך.",
    "english": "I'm running a few minutes late, I'm already on my way.",
    "hebrew_tokens": [
      "אני",
      "מאחר",
      "בכמה",
      "דקות",
      "כבר",
      "יוצא",
      "לדרך"
    ],
    "english_tokens": [
      "I'm",
      "running",
      "a",
      "few",
      "minutes",
      "late",
      "I'm",
      "already",
      "on",
      "my",
      "way"
    ],
    "hebrew_distractors": [
      "שעות",
      "מגיע",
      "עוד",
      "מוקדם",
      "חוזר"
    ],
    "english_distractors": [
      "hours",
      "arriving",
      "still",
      "early",
      "returning"
    ],
    "notes": "כבר יוצא לדרך adds urgency — the speaker is already on the way. יוצא לדרך literally 'going out to the road' — means 'heading out/on my way.'"
  },
  {
    "id": "everyday_07",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "תזכיר לי לשלוח את המייל, אני תמיד שוכח.",
    "english": "Remind me to send the email, I always forget.",
    "hebrew_tokens": [
      "תזכיר",
      "לי",
      "לשלוח",
      "את",
      "המייל",
      "אני",
      "תמיד",
      "שוכח"
    ],
    "english_tokens": [
      "Remind",
      "me",
      "to",
      "send",
      "the",
      "email",
      "I",
      "always",
      "forget"
    ],
    "hebrew_distractors": [
      "תגיד",
      "לקרוא",
      "ההודעה",
      "לפעמים",
      "זוכר"
    ],
    "english_distractors": [
      "tell",
      "read",
      "message",
      "sometimes",
      "remember"
    ],
    "notes": "תזכיר (remind) vs זוכר (remember) — common confusion for learners."
  },
  {
    "id": "everyday_08",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "זה קרוב מכאן או רחוק? אני לא מכיר את האזור.",
    "english": "Is it near here or far from here? I don't know the area.",
    "hebrew_tokens": [
      "זה",
      "קרוב",
      "מכאן",
      "או",
      "רחוק",
      "אני",
      "לא",
      "מכיר",
      "את",
      "האזור"
    ],
    "english_tokens": [
      "Is",
      "it",
      "near here",
      "or",
      "far from here",
      "I",
      "don't",
      "know",
      "the area"
    ],
    "hebrew_distractors": [
      "משם",
      "גדול",
      "מבין",
      "העיר",
      "קטן"
    ],
    "english_distractors": [
      "from there",
      "very big",
      "understand",
      "the city",
      "too small"
    ],
    "notes": "מכאן literally means 'from here'; in natural English this often comes out as 'near here' or 'far from here.' קרוב/רחוק (close/far) are basic but essential spatial adjectives."
  },
  {
    "id": "everyday_09",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אפשר לקבל את החשבון, בבקשה?",
    "english": "Can I get the bill, please?",
    "hebrew_tokens": [
      "אפשר",
      "לקבל",
      "את",
      "החשבון",
      "בבקשה"
    ],
    "english_tokens": [
      "Can I get",
      "the bill",
      "please"
    ],
    "hebrew_distractors": [
      "לשלם",
      "התפריט",
      "תודה",
      "לראות",
      "הקבלה"
    ],
    "english_distractors": [
      "Can I pay",
      "the menu",
      "thank you",
      "Can I see",
      "the receipt"
    ],
    "notes": "Essential restaurant vocabulary. החשבון (the bill) vs התפריט (the menu) vs הקבלה (the receipt)."
  },
  {
    "id": "everyday_10",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "מה אתה רוצה לאכול הערב? אני לא יודע מה לבשל.",
    "english": "What do you want to eat tonight? I don't know what to cook.",
    "hebrew_tokens": [
      "מה",
      "אתה",
      "רוצה",
      "לאכול",
      "הערב",
      "אני",
      "לא",
      "יודע",
      "מה",
      "לבשל"
    ],
    "english_tokens": [
      "What",
      "do",
      "you",
      "want",
      "to",
      "eat",
      "tonight",
      "I",
      "don't",
      "know",
      "what",
      "to",
      "cook"
    ],
    "hebrew_distractors": [
      "לשתות",
      "הבוקר",
      "יכול",
      "להזמין",
      "אוהב"
    ],
    "english_distractors": [
      "drink",
      "morning",
      "can",
      "order",
      "like"
    ],
    "notes": "לאכול (to eat) vs לבשל (to cook) vs להזמין (to order) — food-related verb distractors."
  },
  {
    "id": "everyday_11",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "הזמנו פיצה, היא אמורה להגיע בעוד עשרים דקות.",
    "english": "We ordered pizza, it should arrive in about twenty minutes.",
    "hebrew_tokens": [
      "הזמנו",
      "פיצה",
      "היא",
      "אמורה",
      "להגיע",
      "בעוד",
      "עשרים",
      "דקות"
    ],
    "english_tokens": [
      "We",
      "ordered",
      "pizza",
      "it",
      "should",
      "arrive",
      "in",
      "about",
      "twenty",
      "minutes"
    ],
    "hebrew_distractors": [
      "בישלנו",
      "סושי",
      "אמור",
      "לצאת",
      "עשר"
    ],
    "english_distractors": [
      "cooked",
      "sushi",
      "leave",
      "ten",
      "hours"
    ],
    "notes": "אמורה (feminine, agreeing with פיצה) vs אמור (masculine) — third-person gender agreement."
  },
  {
    "id": "everyday_12",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "כמה זמן לוקח להגיע לשם באוטובוס?",
    "english": "How long does it take to get there by bus?",
    "hebrew_tokens": [
      "כמה",
      "זמן",
      "לוקח",
      "להגיע",
      "לשם",
      "באוטובוס"
    ],
    "english_tokens": [
      "How long",
      "does it take",
      "to get there",
      "by bus"
    ],
    "hebrew_distractors": [
      "לכאן",
      "ברכבת",
      "עולה",
      "רחוק",
      "במכונית"
    ],
    "english_distractors": [
      "How far",
      "does it cost",
      "to come here",
      "by train",
      "by car"
    ],
    "notes": "Transportation distractors: באוטובוס (by bus) vs ברכבת (by train) vs במכונית (by car)."
  },
  {
    "id": "everyday_13",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אין חניה פה, בוא נחפש קצת יותר רחוק.",
    "english": "There's no parking here, let's look a bit further away.",
    "hebrew_tokens": [
      "אין",
      "חניה",
      "פה",
      "בוא",
      "נחפש",
      "קצת",
      "יותר",
      "רחוק"
    ],
    "english_tokens": [
      "There's",
      "no",
      "parking",
      "here",
      "let's",
      "look",
      "a",
      "bit",
      "further",
      "away"
    ],
    "hebrew_distractors": [
      "יש",
      "מקום",
      "שם",
      "נלך",
      "קרוב"
    ],
    "english_distractors": [
      "there's",
      "space",
      "there",
      "walk",
      "closer"
    ],
    "notes": "אין (there isn't) vs יש (there is) — fundamental pair. קרוב/רחוק (close/far) also tested."
  },
  {
    "id": "everyday_14",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "הרכבת מתעכבת, כדאי לקחת מונית.",
    "english": "The train is delayed, we should take a taxi.",
    "hebrew_tokens": [
      "הרכבת",
      "מתעכבת",
      "כדאי",
      "לקחת",
      "מונית"
    ],
    "english_tokens": [
      "The train",
      "is delayed",
      "we should",
      "take a taxi"
    ],
    "hebrew_distractors": [
      "האוטובוס",
      "מגיעה",
      "אפשר",
      "לחכות",
      "אוטובוס"
    ],
    "english_distractors": [
      "The bus",
      "is arriving",
      "we could",
      "wait outside",
      "take a walk"
    ],
    "notes": "מתעכבת (delayed, fem.) agrees with רכבת (train, fem.). כדאי means 'it's worthwhile/advisable.'"
  },
  {
    "id": "everyday_15",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "הכביסה מוכנה, אפשר להוציא אותה מהמייבש?",
    "english": "The laundry is done, can you take it out of the dryer?",
    "hebrew_tokens": [
      "הכביסה",
      "מוכנה",
      "אפשר",
      "להוציא",
      "אותה",
      "מהמייבש"
    ],
    "english_tokens": [
      "The laundry",
      "is done",
      "can",
      "you",
      "take",
      "it",
      "out of the dryer"
    ],
    "hebrew_distractors": [
      "מוכן",
      "להכניס",
      "אותו",
      "מהמכונה",
      "לקפל"
    ],
    "english_distractors": [
      "all set",
      "put in",
      "him",
      "washing machine",
      "fold"
    ],
    "notes": "מוכנה (fem.) agrees with כביסה (laundry, fem.). להוציא (take out) vs להכניס (put in)."
  },
  {
    "id": "everyday_16",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "מישהו ראה את השלט של הטלוויזיה?",
    "english": "Has anyone seen the TV remote?",
    "hebrew_tokens": [
      "מישהו",
      "ראה",
      "את",
      "השלט",
      "של",
      "הטלוויזיה"
    ],
    "english_tokens": [
      "Has anyone",
      "seen",
      "the TV remote"
    ],
    "hebrew_distractors": [
      "משהו",
      "לקח",
      "המפתחות",
      "הטלפון",
      "שמע"
    ],
    "english_distractors": [
      "someone else",
      "took",
      "the keys",
      "phone charger",
      "heard"
    ],
    "notes": "מישהו (someone/anyone) vs משהו (something) — classic beginner confusion."
  },
  {
    "id": "everyday_17",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "נגמר הסבון, צריך לקנות.",
    "english": "The soap ran out, we need to buy more.",
    "hebrew_tokens": [
      "נגמר",
      "הסבון",
      "צריך",
      "לקנות"
    ],
    "english_tokens": [
      "The soap",
      "ran out",
      "we need",
      "to buy",
      "more"
    ],
    "hebrew_distractors": [
      "נשאר",
      "השמפו",
      "רוצה",
      "להביא",
      "יש"
    ],
    "english_distractors": [
      "hair gel",
      "shampoo bottle",
      "we want",
      "to bring",
      "there's more"
    ],
    "notes": "נגמר (ran out/finished) vs נשאר (remained/left) — opposite pair."
  },
  {
    "id": "everyday_18",
    "category": "everyday",
    "style": null,
    "difficulty": 2,
    "hebrew": "הייתי בתור חצי שעה ועדיין לא הגיע תורי.",
    "english": "I've been in line for half an hour and it's still not my turn.",
    "hebrew_tokens": [
      "הייתי",
      "בתור",
      "חצי",
      "שעה",
      "ועדיין",
      "לא",
      "הגיע",
      "תורי"
    ],
    "english_tokens": [
      "I've",
      "been in line",
      "for half an hour",
      "and it's",
      "still",
      "not",
      "my turn"
    ],
    "hebrew_distractors": [
      "רבע",
      "דקה",
      "כבר",
      "עברתי",
      "תורך"
    ],
    "english_distractors": [
      "a quarter",
      "ten minutes",
      "already done",
      "passed by",
      "your turn"
    ],
    "notes": "תורי (my turn) — the possessive suffix is attached directly. תורך (your turn) is a good distractor."
  },
  {
    "id": "everyday_19",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "תוריד לי את הקול קצת, אני בטלפון.",
    "english": "Turn it down a bit, I'm on the phone.",
    "hebrew_tokens": [
      "תוריד",
      "לי",
      "את",
      "הקול",
      "קצת",
      "אני",
      "בטלפון"
    ],
    "english_tokens": [
      "Turn it down",
      "a bit",
      "I'm on the phone"
    ],
    "hebrew_distractors": [
      "תעלה",
      "המוזיקה",
      "הרבה",
      "במחשב",
      "תכבה"
    ],
    "english_distractors": [
      "Turn it up",
      "a lot",
      "I'm at the computer",
      "the music",
      "for now"
    ],
    "notes": "תוריד (turn down/lower) vs תעלה (turn up/raise) — directional verb pair."
  },
  {
    "id": "everyday_20",
    "category": "everyday",
    "style": null,
    "difficulty": 1,
    "hebrew": "אם אני לא עונה, תשאיר הודעה.",
    "english": "If I don't answer, leave a message.",
    "hebrew_tokens": [
      "אם",
      "אני",
      "לא",
      "עונה",
      "תשאיר",
      "הודעה"
    ],
    "english_tokens": [
      "If",
      "I",
      "don't",
      "answer",
      "leave",
      "a",
      "message"
    ],
    "hebrew_distractors": [
      "כש",
      "תתקשר",
      "מכתב",
      "תשלח",
      "תמיד"
    ],
    "english_distractors": [
      "when",
      "call",
      "letter",
      "send",
      "always"
    ],
    "notes": "אם (if) vs כש (when) — conditional vs temporal conjunction."
  },
  {
    "id": "professional_01",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "אני אעבור על המסמך ואחזור אליך בהקדם.",
    "english": "I'll review the document and get back to you shortly.",
    "hebrew_tokens": [
      "אני",
      "אעבור",
      "על",
      "המסמך",
      "ואחזור",
      "אליך",
      "בהקדם"
    ],
    "english_tokens": [
      "I'll",
      "review",
      "the document",
      "and",
      "get back",
      "to you",
      "shortly"
    ],
    "hebrew_distractors": [
      "אקרא",
      "הדוח",
      "אליו",
      "מאוחר",
      "אשלח"
    ],
    "english_distractors": [
      "read through",
      "the report",
      "to him",
      "later today",
      "send"
    ],
    "notes": "בהקדם means 'as soon as possible/shortly' — very common in professional Hebrew."
  },
  {
    "id": "professional_02",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "נצטרך לתאם פגישה לשבוע הבא, מתי אתה פנוי?",
    "english": "We'll need to schedule a meeting for next week, when are you available?",
    "hebrew_tokens": [
      "נצטרך",
      "לתאם",
      "פגישה",
      "לשבוע",
      "הבא",
      "מתי",
      "אתה",
      "פנוי"
    ],
    "english_tokens": [
      "We'll",
      "need to",
      "schedule",
      "a meeting",
      "for next week",
      "when",
      "are you",
      "available"
    ],
    "hebrew_distractors": [
      "לבטל",
      "שיחה",
      "הזה",
      "עסוק",
      "איפה"
    ],
    "english_distractors": [
      "cancel",
      "team call",
      "this week",
      "too busy",
      "where exactly"
    ],
    "notes": "לתאם (to coordinate/schedule) vs לבטל (to cancel). פנוי (available) vs עסוק (busy)."
  },
  {
    "id": "professional_03",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "זה לא תואם את הדרישות שהוגדרו, נצטרך לעדכן.",
    "english": "This doesn't align with the defined requirements, we'll need to update it.",
    "hebrew_tokens": [
      "זה",
      "לא",
      "תואם",
      "את",
      "הדרישות",
      "שהוגדרו",
      "נצטרך",
      "לעדכן"
    ],
    "english_tokens": [
      "This",
      "doesn't align",
      "with the defined requirements",
      "we'll need to",
      "update it"
    ],
    "hebrew_distractors": [
      "מתאים",
      "הנתונים",
      "שנכתבו",
      "לשנות",
      "אפשר"
    ],
    "english_distractors": [
      "this fits",
      "with the current data",
      "we can leave",
      "change that",
      "already approved"
    ],
    "notes": "תואם (aligns/matches) vs מתאים (suitable/fits) — subtle professional vocabulary distinction."
  },
  {
    "id": "professional_04",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "יש עדכון לגבי הפרויקט? אני רוצה להבין איפה זה עומד.",
    "english": "Is there an update on the project? I want to understand where it stands.",
    "hebrew_tokens": [
      "יש",
      "עדכון",
      "לגבי",
      "הפרויקט",
      "אני",
      "רוצה",
      "להבין",
      "איפה",
      "זה",
      "עומד"
    ],
    "english_tokens": [
      "Is there an update",
      "on the project",
      "I",
      "want",
      "to understand",
      "where it stands"
    ],
    "hebrew_distractors": [
      "שינוי",
      "על",
      "התוכנית",
      "צריך",
      "לדעת"
    ],
    "english_distractors": [
      "latest change",
      "about it",
      "the plan",
      "need to",
      "already know"
    ],
    "notes": "לגבי (regarding/about) is formal/professional. איפה זה עומד ('where it stands') is a common status idiom."
  },
  {
    "id": "professional_05",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "אני ממליץ לבדוק את הנתונים שוב, ייתכן שיש טעות.",
    "english": "I recommend checking the data again, there may be an error.",
    "hebrew_tokens": [
      "אני",
      "ממליץ",
      "לבדוק",
      "את",
      "הנתונים",
      "שוב",
      "ייתכן",
      "שיש",
      "טעות"
    ],
    "english_tokens": [
      "I",
      "recommend",
      "checking",
      "the data",
      "again",
      "there may be an error"
    ],
    "hebrew_distractors": [
      "מציע",
      "לשנות",
      "המסמכים",
      "בטוח",
      "בעיה"
    ],
    "english_distractors": [
      "I suggest",
      "small change",
      "the documents",
      "for sure",
      "a problem"
    ],
    "notes": "ייתכן (it's possible/may be) is a more formal way to express uncertainty. ממליץ (recommend) vs מציע (suggest)."
  },
  {
    "id": "professional_06",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "אנחנו עובדים על זה כרגע, נעדכן כשיהיו תוצאות.",
    "english": "We're working on it right now, we'll update when there are results.",
    "hebrew_tokens": [
      "אנחנו",
      "עובדים",
      "על",
      "זה",
      "כרגע",
      "נעדכן",
      "כשיהיו",
      "תוצאות"
    ],
    "english_tokens": [
      "We're",
      "working on it",
      "right now",
      "we'll",
      "update",
      "when there are",
      "results"
    ],
    "hebrew_distractors": [
      "סיימנו",
      "אחרי",
      "שינויים",
      "נדווח",
      "מחר"
    ],
    "english_distractors": [
      "already finished",
      "after that",
      "big changes",
      "full report",
      "by tomorrow"
    ],
    "notes": "כשיהיו is a contraction of כש+יהיו (when there will be) — tests understanding of Hebrew future tense embedding."
  },
  {
    "id": "professional_07",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "זה דורש אישור מההנהלה, אי אפשר להתקדם בלי זה.",
    "english": "This requires approval from management, we can't proceed without it.",
    "hebrew_tokens": [
      "זה",
      "דורש",
      "אישור",
      "מההנהלה",
      "אי",
      "אפשר",
      "להתקדם",
      "בלי",
      "זה"
    ],
    "english_tokens": [
      "This",
      "requires",
      "approval",
      "from",
      "management",
      "we",
      "can't",
      "proceed",
      "without",
      "it"
    ],
    "hebrew_distractors": [
      "צריך",
      "הסכמה",
      "מהצוות",
      "אפשר",
      "עם"
    ],
    "english_distractors": [
      "needs",
      "agreement",
      "team",
      "possible",
      "with"
    ],
    "notes": "דורש (requires/demands) is more formal than צריך (needs). מההנהלה (from management) vs מהצוות (from the team)."
  },
  {
    "id": "professional_08",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "אפשר לקבל הבהרה בנושא הזה? זה לא לגמרי ברור.",
    "english": "Can we get clarification on this matter? It's not entirely clear.",
    "hebrew_tokens": [
      "אפשר",
      "לקבל",
      "הבהרה",
      "בנושא",
      "הזה",
      "זה",
      "לא",
      "לגמרי",
      "ברור"
    ],
    "english_tokens": [
      "Can we get",
      "clarification",
      "on this matter",
      "It's not",
      "entirely clear"
    ],
    "hebrew_distractors": [
      "הסבר",
      "על",
      "ההוא",
      "בכלל",
      "מובן"
    ],
    "english_distractors": [
      "quick summary",
      "about that",
      "this topic",
      "not at all",
      "fully understood"
    ],
    "notes": "הבהרה (clarification) vs הסבר (explanation) — both professional but different nuances."
  },
  {
    "id": "professional_09",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "נשלח גרסה מעודכנת בהמשך היום, אחרי שנבצע תיקונים.",
    "english": "We'll send an updated version later today, after making revisions.",
    "hebrew_tokens": [
      "נשלח",
      "גרסה",
      "מעודכנת",
      "בהמשך",
      "היום",
      "אחרי",
      "שנבצע",
      "תיקונים"
    ],
    "english_tokens": [
      "We'll",
      "send",
      "an",
      "updated",
      "version",
      "later",
      "today",
      "after",
      "making",
      "revisions"
    ],
    "hebrew_distractors": [
      "נקבל",
      "ישנה",
      "מחר",
      "לפני",
      "שינויים"
    ],
    "english_distractors": [
      "receive",
      "old",
      "tomorrow",
      "before",
      "changes"
    ],
    "notes": "מעודכנת (updated, fem.) agrees with גרסה (version, fem.). נשלח here means 'we'll send' (future first person plural)."
  },
  {
    "id": "professional_10",
    "category": "professional",
    "style": null,
    "difficulty": 2,
    "hebrew": "חשוב לעמוד בלוחות הזמנים, אחרת זה יעכב את כולם.",
    "english": "It's important to meet the deadlines, otherwise it will delay everyone.",
    "hebrew_tokens": [
      "חשוב",
      "לעמוד",
      "בלוחות",
      "הזמנים",
      "אחרת",
      "זה",
      "יעכב",
      "את",
      "כולם"
    ],
    "english_tokens": [
      "It's",
      "important",
      "to",
      "meet",
      "the",
      "deadlines",
      "otherwise",
      "it",
      "will",
      "delay",
      "everyone"
    ],
    "hebrew_distractors": [
      "קשה",
      "לשמור",
      "התקציב",
      "אולי",
      "יעזור"
    ],
    "english_distractors": [
      "difficult",
      "keep",
      "budget",
      "maybe",
      "help"
    ],
    "notes": "לעמוד בלוחות זמנים (to meet deadlines) is a common professional phrase. לעמוד literally means 'to stand.'"
  },
  {
    "id": "formal_01",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "יש לשקול את ההשלכות ארוכות הטווח לפני קבלת החלטה.",
    "english": "One must consider the long-term implications before making a decision.",
    "hebrew_tokens": [
      "יש",
      "לשקול",
      "את",
      "ההשלכות",
      "ארוכות",
      "הטווח",
      "לפני",
      "קבלת",
      "החלטה"
    ],
    "english_tokens": [
      "One",
      "must",
      "consider",
      "the",
      "long-term",
      "implications",
      "before",
      "making",
      "a",
      "decision"
    ],
    "hebrew_distractors": [
      "לחשוב",
      "קצרות",
      "אחרי",
      "ההחלטה",
      "התוצאות"
    ],
    "english_distractors": [
      "short-term",
      "after",
      "results",
      "without",
      "opinion"
    ],
    "notes": "יש לשקול is formal register — colloquial would be צריך לחשוב על. Good test of register awareness."
  },
  {
    "id": "formal_02",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "הנתונים מצביעים על מגמה ברורה, למרות התנודות הקטנות.",
    "english": "The data indicate a clear trend, despite minor fluctuations.",
    "hebrew_tokens": [
      "הנתונים",
      "מצביעים",
      "על",
      "מגמה",
      "ברורה",
      "למרות",
      "התנודות",
      "הקטנות"
    ],
    "english_tokens": [
      "The",
      "data",
      "indicate",
      "a",
      "clear",
      "trend",
      "despite",
      "minor",
      "fluctuations"
    ],
    "hebrew_distractors": [
      "מראים",
      "שינוי",
      "גדולות",
      "בגלל",
      "התוצאות"
    ],
    "english_distractors": [
      "show",
      "change",
      "major",
      "because",
      "results"
    ],
    "notes": "מצביעים (indicate/point to) is more formal than מראים (show). למרות (despite) vs בגלל (because of) — causal logic distractor."
  },
  {
    "id": "formal_03",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "ניתן להסיק מכך כי המודל אינו יציב בתנאים מסוימים.",
    "english": "It can be inferred from this that the model is not stable under certain conditions.",
    "hebrew_tokens": [
      "ניתן",
      "להסיק",
      "מכך",
      "כי",
      "המודל",
      "אינו",
      "יציב",
      "בתנאים",
      "מסוימים"
    ],
    "english_tokens": [
      "It",
      "can",
      "be",
      "inferred",
      "from this",
      "that",
      "the",
      "model",
      "is",
      "not",
      "stable",
      "under",
      "certain",
      "conditions"
    ],
    "hebrew_distractors": [
      "אפשר",
      "לראות",
      "שהוא",
      "מדויק",
      "בכל"
    ],
    "english_distractors": [
      "can see",
      "look at",
      "fully accurate",
      "all",
      "always"
    ],
    "notes": "ניתן להסיק מכך ('it can be inferred from this') is very formal. אינו is the formal negation of הוא — colloquial would use הוא לא."
  },
  {
    "id": "formal_04",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "השאלה המרכזית היא כיצד ליישם זאת בפועל, ולא רק בתיאוריה.",
    "english": "The central question is how to implement this in practice, not just in theory.",
    "hebrew_tokens": [
      "השאלה",
      "המרכזית",
      "היא",
      "כיצד",
      "ליישם",
      "זאת",
      "בפועל",
      "ולא",
      "רק",
      "בתיאוריה"
    ],
    "english_tokens": [
      "The central question",
      "is",
      "how",
      "to implement",
      "this",
      "in practice",
      "not",
      "just",
      "in theory"
    ],
    "hebrew_distractors": [
      "מדוע",
      "לעשות",
      "את",
      "בעיקרון",
      "החשובה"
    ],
    "english_distractors": [
      "to do",
      "in principle",
      "important point",
      "all the time",
      "why exactly"
    ],
    "notes": "כיצד is the formal version of איך (how). ליישם (to implement) is formal; colloquial would be לעשות (to do)."
  },
  {
    "id": "formal_05",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "קיימת שונות משמעותית בין הקבוצות, ויש להסביר אותה.",
    "english": "There is significant variation between the groups, and it must be explained.",
    "hebrew_tokens": [
      "קיימת",
      "שונות",
      "משמעותית",
      "בין",
      "הקבוצות",
      "ויש",
      "להסביר",
      "אותה"
    ],
    "english_tokens": [
      "There is",
      "significant variation",
      "between the groups",
      "and",
      "it must be explained"
    ],
    "hebrew_distractors": [
      "קיים",
      "הבדל",
      "קטנה",
      "בתוך",
      "לבדוק"
    ],
    "english_distractors": [
      "There was",
      "a small difference",
      "within the groups",
      "or",
      "it should be checked"
    ],
    "notes": "קיימת (exists, fem.) agrees with שונות (variation, fem.). קיים (masc.) is the third-person gender distractor."
  },
  {
    "id": "formal_06",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "הניתוח מבוסס על מספר הנחות יסוד, שייתכן שאינן מדויקות.",
    "english": "The analysis is based on several assumptions, which may not be accurate.",
    "hebrew_tokens": [
      "הניתוח",
      "מבוסס",
      "על",
      "מספר",
      "הנחות",
      "יסוד",
      "שייתכן",
      "שאינן",
      "מדויקות"
    ],
    "english_tokens": [
      "The analysis",
      "is based on",
      "several assumptions",
      "which",
      "may not be",
      "accurate"
    ],
    "hebrew_distractors": [
      "המחקר",
      "תלוי",
      "הרבה",
      "שאינם",
      "מוכחות"
    ],
    "english_distractors": [
      "The research",
      "depends on",
      "many assumptions",
      "fully reliable",
      "already proven"
    ],
    "notes": "שאינן (that they [fem.] are not) agrees with הנחות (assumptions, fem.). שאינם (masc.) is the gender distractor."
  },
  {
    "id": "formal_07",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "יש לבחון את האפשרויות השונות לעומק לפני בחירה.",
    "english": "The different options should be examined in depth before choosing.",
    "hebrew_tokens": [
      "יש",
      "לבחון",
      "את",
      "האפשרויות",
      "השונות",
      "לעומק",
      "לפני",
      "בחירה"
    ],
    "english_tokens": [
      "The different options",
      "should be examined",
      "in depth",
      "before choosing"
    ],
    "hebrew_distractors": [
      "לבדוק",
      "הדרכים",
      "במהירות",
      "אחרי",
      "החלטה"
    ],
    "english_distractors": [
      "Other approaches",
      "can be reviewed",
      "very quickly",
      "after deciding",
      "on paper"
    ],
    "notes": "לעומק (in depth) vs במהירות (quickly) — contrasting manner adverbs. יש לבחון is formal impersonal obligation."
  },
  {
    "id": "formal_08",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "הממצאים תומכים בהשערה הראשונית, אך לא באופן מלא.",
    "english": "The findings support the initial hypothesis, but not completely.",
    "hebrew_tokens": [
      "הממצאים",
      "תומכים",
      "בהשערה",
      "הראשונית",
      "אך",
      "לא",
      "באופן",
      "מלא"
    ],
    "english_tokens": [
      "The",
      "findings",
      "support",
      "the",
      "initial",
      "hypothesis",
      "but",
      "not",
      "completely"
    ],
    "hebrew_distractors": [
      "התוצאות",
      "סותרים",
      "הסופית",
      "לכן",
      "חלקי"
    ],
    "english_distractors": [
      "results",
      "contradict",
      "final",
      "partially",
      "therefore"
    ],
    "notes": "אך (but/however) is formal; colloquial uses אבל. תומכים (support) vs סותרים (contradict)."
  },
  {
    "id": "formal_09",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "מדובר בתופעה מורכבת ורב-ממדית, שקשה להגדיר בפשטות.",
    "english": "This is a complex, multi-dimensional phenomenon that is difficult to define simply.",
    "hebrew_tokens": [
      "מדובר",
      "בתופעה",
      "מורכבת",
      "ורב-ממדית",
      "שקשה",
      "להגדיר",
      "בפשטות"
    ],
    "english_tokens": [
      "This is",
      "a complex",
      "multi-dimensional phenomenon",
      "that is difficult",
      "to define simply"
    ],
    "hebrew_distractors": [
      "בבעיה",
      "פשוטה",
      "להסביר",
      "שקל",
      "במדויק"
    ],
    "english_distractors": [
      "the problem",
      "very simple",
      "can be explained",
      "quite easily",
      "in a sentence"
    ],
    "notes": "מדובר ב (it concerns / this is about) is a formal framing device. מורכבת (complex) vs פשוטה (simple)."
  },
  {
    "id": "formal_10",
    "category": "formal",
    "style": null,
    "difficulty": 3,
    "hebrew": "יש להבחין בין סיבה לתוצאה, אחרת נגיע למסקנות שגויות.",
    "english": "One must distinguish between cause and effect, otherwise we'll reach incorrect conclusions.",
    "hebrew_tokens": [
      "יש",
      "להבחין",
      "בין",
      "סיבה",
      "לתוצאה",
      "אחרת",
      "נגיע",
      "למסקנות",
      "שגויות"
    ],
    "english_tokens": [
      "One",
      "must",
      "distinguish",
      "between",
      "cause",
      "and",
      "effect",
      "otherwise",
      "we'll",
      "reach",
      "incorrect",
      "conclusions"
    ],
    "hebrew_distractors": [
      "להפריד",
      "ובין",
      "להנחה",
      "נכונות",
      "נבין"
    ],
    "english_distractors": [
      "separate",
      "assumption",
      "correct",
      "understand",
      "always"
    ],
    "notes": "להבחין (to distinguish) is formal. סיבה (cause) and תוצאה (effect) are key academic vocabulary. שגויות (incorrect) is more formal than לא נכונות."
  }
];

function cloneSentence(item) {
  return {
    ...item,
    english_tokens: Array.isArray(item?.english_tokens) ? [...item.english_tokens] : [],
    hebrew_tokens: Array.isArray(item?.hebrew_tokens) ? [...item.hebrew_tokens] : [],
    english_distractors: Array.isArray(item?.english_distractors) ? [...item.english_distractors] : [],
    hebrew_distractors: Array.isArray(item?.hebrew_distractors) ? [...item.hebrew_distractors] : [],
  };
}

global.IvriQuestSentenceBank = {
  getSentenceBank() {
    return SENTENCE_BANK.map(cloneSentence);
  },
  __build: "20260329e",
};
})(typeof window !== "undefined" ? window : globalThis);
