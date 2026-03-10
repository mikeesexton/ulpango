// Hebrew idioms data for Advanced Conjugation game mode.
// Each entry exposes a normalized shape used by advConj functions in app.js:
//   present_tense  — alias for conjugations.present
//   english_meaning — alias for english
const HEBREW_IDIOMS = (function () {
  const raw = [
  {
    "id": "shaga",
    "level": 1,
    "infinitive": "לשגע מישהו",
    "english": "to drive someone crazy",
    "verb": "לשגע",
    "root": "ש.ג.ע",
    "binyan": "piel",
    "object_type": "direct",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩",
    "example": "אתה משגע אותי",
    "negated": false,
    "literal_sg": "{s} drives {o} crazy",
    "literal_pl": "{s} drive {o} crazy",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "משגע", "fsg": "משגעת", "mpl": "משגעים", "fpl": "משגעות" }
    }
  },
  {
    "id": "itzben",
    "level": 1,
    "infinitive": "לעצבן מישהו",
    "english": "to annoy someone",
    "verb": "לעצבן",
    "root": "ע.צ.ב.נ",
    "binyan": "piel",
    "object_type": "direct",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩",
    "example": "אתה מעצבן אותי",
    "negated": false,
    "literal_sg": "{s} annoys {o}",
    "literal_pl": "{s} annoy {o}",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "מעצבן", "fsg": "מעצבנת", "mpl": "מעצבנים", "fpl": "מעצבנות" }
    }
  },
  {
    "id": "hidlik",
    "level": 1,
    "infinitive": "להדליק מישהו",
    "english": "to excite / turn someone on",
    "verb": "להדליק",
    "root": "ד.ל.ק",
    "binyan": "hifil",
    "object_type": "direct",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩",
    "example": "אתה מדליק אותי",
    "negated": false,
    "literal_sg": "{s} lights {o} up",
    "literal_pl": "{s} light {o} up",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "מדליק", "fsg": "מדליקה", "mpl": "מדליקים", "fpl": "מדליקות" }
    }
  },
  {
    "id": "hitrif",
    "level": 1,
    "infinitive": "להטריף מישהו",
    "english": "to drive someone insane",
    "verb": "להטריף",
    "root": "ט.ר.פ",
    "binyan": "hifil",
    "object_type": "direct",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩",
    "example": "אתה מטריף אותי",
    "negated": false,
    "literal_sg": "{s} drives {o} insane",
    "literal_pl": "{s} drive {o} insane",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "מטריף", "fsg": "מטריפה", "mpl": "מטריפים", "fpl": "מטריפות" }
    }
  },
  {
    "id": "haalat_sif",
    "level": 2,
    "infinitive": "להעלות למישהו את הסעיף",
    "english": "to drive someone up the wall",
    "verb": "להעלות",
    "root": "ע.ל.ה",
    "binyan": "hifil",
    "object_type": "l_dative",
    "fixed_object": "את הסעיף",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את הסעיף",
    "example": "אתה מעלה לי את הסעיף",
    "negated": false,
    "literal_sg": "{s} raises {p} paragraph",
    "literal_pl": "{s} raise {p} paragraph",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "מעלה", "fsg": "מעלה", "mpl": "מעלים", "fpl": "מעלות" }
    }
  },
  {
    "id": "horadat_hesheq",
    "level": 2,
    "infinitive": "להוריד למישהו את החשק",
    "english": "to kill someone's motivation",
    "verb": "להוריד",
    "root": "י.ר.ד",
    "binyan": "hifil",
    "object_type": "l_dative",
    "fixed_object": "את החשק",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את החשק",
    "example": "אתה מוריד לי את החשק",
    "negated": false,
    "literal_sg": "{s} brings down {p} desire",
    "literal_pl": "{s} bring down {p} desire",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "מוריד", "fsg": "מורידה", "mpl": "מורידים", "fpl": "מורידות" }
    }
  },
  {
    "id": "hotzaat_mitz",
    "level": 2,
    "infinitive": "להוציא למישהו את המיץ",
    "english": "to exhaust / wear someone out",
    "verb": "להוציא",
    "root": "י.צ.א",
    "binyan": "hifil",
    "object_type": "l_dative",
    "fixed_object": "את המיץ",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את המיץ",
    "example": "אתה מוציא לי את המיץ",
    "negated": false,
    "literal_sg": "{s} takes out {p} juice",
    "literal_pl": "{s} take out {p} juice",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "מוציא", "fsg": "מוציאה", "mpl": "מוציאים", "fpl": "מוציאות" }
    }
  },
  {
    "id": "shvira_lev",
    "level": 2,
    "infinitive": "לשבור למישהו את הלב",
    "english": "to break someone's heart",
    "verb": "לשבור",
    "root": "ש.ב.ר",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "את הלב",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את הלב",
    "example": "אתה שובר לי את הלב",
    "negated": false,
    "literal_sg": "{s} breaks {p} heart",
    "literal_pl": "{s} break {p} heart",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "שובר", "fsg": "שוברת", "mpl": "שוברים", "fpl": "שוברות" }
    }
  },
  {
    "id": "asiya_hayim",
    "level": 2,
    "infinitive": "לעשות למישהו את החיים קשים",
    "english": "to make someone's life difficult",
    "verb": "לעשות",
    "root": "ע.ש.ה",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "את החיים קשים",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את החיים קשים",
    "example": "אתה עושה לי את החיים קשים",
    "negated": false,
    "literal_sg": "{s} makes {p} life difficult",
    "literal_pl": "{s} make {p} life difficult",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "עושה", "fsg": "עושה", "mpl": "עושים", "fpl": "עושות" }
    }
  },
  {
    "id": "hfalat_asiman",
    "level": 2,
    "infinitive": "להפיל למישהו את האסימון",
    "english": "to make the penny drop for someone",
    "verb": "להפיל",
    "root": "נ.פ.ל",
    "binyan": "hifil",
    "object_type": "l_dative",
    "fixed_object": "את האסימון",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את האסימון",
    "example": "אתה מפיל לי את האסימון",
    "negated": false,
    "literal_sg": "{s} drops {p} token",
    "literal_pl": "{s} drop {p} token",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "מפיל", "fsg": "מפילה", "mpl": "מפילים", "fpl": "מפילות" }
    }
  },
  {
    "id": "ptihat_einayim",
    "level": 2,
    "infinitive": "לפתוח למישהו את העיניים",
    "english": "to open someone's eyes",
    "verb": "לפתוח",
    "root": "פ.ת.ח",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "את העיניים",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את העיניים",
    "example": "אתה פותח לי את העיניים",
    "negated": false,
    "literal_sg": "{s} opens {p} eyes",
    "literal_pl": "{s} open {p} eyes",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "פותח", "fsg": "פותחת", "mpl": "פותחים", "fpl": "פותחות" }
    }
  },
  {
    "id": "yeshiva_neshama",
    "level": 2,
    "infinitive": "לשבת למישהו על הנשמה",
    "english": "to suffocate / pressure someone",
    "verb": "לשבת",
    "root": "י.ש.ב",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "על הנשמה",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ על הנשמה",
    "example": "אתה יושב לי על הנשמה",
    "negated": false,
    "literal_sg": "{s} sits on {p} soul",
    "literal_pl": "{s} sit on {p} soul",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "יושב", "fsg": "יושבת", "mpl": "יושבים", "fpl": "יושבות" }
    }
  },
  {
    "id": "yerida_gav",
    "level": 2,
    "infinitive": "לרדת למישהו מהגב",
    "english": "to get off someone's back",
    "verb": "לרדת",
    "root": "י.ר.ד",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "מהגב",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ מהגב",
    "example": "אתה יורד לי מהגב",
    "negated": false,
    "literal_sg": "{s} gets off {p} back",
    "literal_pl": "{s} get off {p} back",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "יורד", "fsg": "יורדת", "mpl": "יורדים", "fpl": "יורדות" }
    }
  },
  {
    "id": "amida_derekh",
    "level": 2,
    "infinitive": "לעמוד למישהו בדרך",
    "english": "to stand in someone's way",
    "verb": "לעמוד",
    "root": "ע.מ.ד",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "בדרך",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ בדרך",
    "example": "אתה עומד לי בדרך",
    "negated": false,
    "literal_sg": "{s} stands in {p} way",
    "literal_pl": "{s} stand in {p} way",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "עומד", "fsg": "עומדת", "mpl": "עומדים", "fpl": "עומדות" }
    }
  },
  {
    "id": "khnisa_rosh",
    "level": 2,
    "infinitive": "להיכנס למישהו לראש",
    "english": "to get inside someone's head",
    "verb": "להיכנס",
    "root": "כ.נ.ס",
    "binyan": "nifal",
    "object_type": "l_dative",
    "fixed_object": "לראש",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ לראש",
    "example": "אתה נכנס לי לראש",
    "negated": false,
    "literal_sg": "{s} enters {p} head",
    "literal_pl": "{s} enter {p} head",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "נכנס", "fsg": "נכנסת", "mpl": "נכנסים", "fpl": "נכנסות" }
    }
  },
  {
    "id": "lo_yatza_rosh",
    "level": 2,
    "infinitive": "לא לצאת למישהו מהראש",
    "english": "to not leave someone's head",
    "verb": "לצאת",
    "root": "י.צ.א",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "מהראש",
    "template": "לא ⟨VERB⟩ ⟨L_OBJ⟩ מהראש",
    "example": "אתה לא יוצא לי מהראש",
    "negated": true,
    "literal_sg": "{s} doesn't leave {p} head",
    "literal_pl": "{s} don't leave {p} head",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "יוצא", "fsg": "יוצאת", "mpl": "יוצאים", "fpl": "יוצאות" }
    }
  },
  {
    "id": "ntina_barosh",
    "level": 2,
    "infinitive": "לתת למישהו בראש",
    "english": "to tear into / yell at someone",
    "verb": "לתת",
    "root": "נ.ת.נ",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "בראש",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ בראש",
    "example": "אתה נותן לי בראש",
    "negated": false,
    "literal_sg": "{s} gives {o} in the head",
    "literal_pl": "{s} give {o} in the head",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "נותן", "fsg": "נותנת", "mpl": "נותנים", "fpl": "נותנות" }
    }
  },
  {
    "id": "akhila_rosh",
    "level": 2,
    "infinitive": "לאכול למישהו את הראש",
    "english": "to nag / drive someone crazy with talk",
    "verb": "לאכול",
    "root": "א.כ.ל",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "את הראש",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את הראש",
    "example": "אתה אוכל לי את הראש",
    "negated": false,
    "literal_sg": "{s} eats {p} head",
    "literal_pl": "{s} eat {p} head",
    "showMeaning": true,
    "conjugations": {
      "present": { "msg": "אוכל", "fsg": "אוכלת", "mpl": "אוכלים", "fpl": "אוכלות" }
    }
  },
  {
    "id": "gnivat_lev",
    "level": 2,
    "infinitive": "לגנוב למישהו את הלב",
    "english": "to steal someone's heart",
    "verb": "לגנוב",
    "root": "ג.נ.ב",
    "binyan": "qal",
    "object_type": "l_dative",
    "fixed_object": "את הלב",
    "template": "⟨VERB⟩ ⟨L_OBJ⟩ את הלב",
    "example": "אתה גונב לי את הלב",
    "negated": false,
    "literal_sg": "{s} steals {p} heart",
    "literal_pl": "{s} steal {p} heart",
    "showMeaning": false,
    "conjugations": {
      "present": { "msg": "גונב", "fsg": "גונבת", "mpl": "גונבים", "fpl": "גונבות" }
    }
  },
  {
    "id": "hotzaat_midato",
    "level": 3,
    "infinitive": "להוציא מישהו מדעתו",
    "english": "to drive someone out of their mind",
    "verb": "להוציא",
    "root": "י.צ.א",
    "binyan": "hifil",
    "object_type": "possessive_suffix",
    "suffix_noun": "דעת",
    "suffix_preposition": "מ",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩ ⟨SUFFIX_FORM⟩",
    "example": "אתה מוציא אותי מדעתי",
    "negated": false,
    "literal_sg": "{s} takes {o} out of {p} mind",
    "literal_pl": "{s} take {o} out of {p} mind",
    "showMeaning": false,
    "suffix_forms": {
      "1sg": "מדעתי", "2msg": "מדעתך", "2fsg": "מדעתך",
      "3msg": "מדעתו", "3fsg": "מדעתה", "1pl": "מדעתנו",
      "2mpl": "מדעתכם", "2fpl": "מדעתכן", "3mpl": "מדעתם", "3fpl": "מדעתן"
    },
    "conjugations": {
      "present": { "msg": "מוציא", "fsg": "מוציאה", "mpl": "מוציאים", "fpl": "מוציאות" }
    }
  },
  {
    "id": "hotzaat_miklav",
    "level": 3,
    "infinitive": "להוציא מישהו מכליו",
    "english": "to make someone totally lose it",
    "verb": "להוציא",
    "root": "י.צ.א",
    "binyan": "hifil",
    "object_type": "possessive_suffix",
    "suffix_noun": "כלים",
    "suffix_preposition": "מ",
    "template": "⟨VERB⟩ ⟨DIR_OBJ⟩ ⟨SUFFIX_FORM⟩",
    "example": "אתה מוציא אותי מכליי",
    "negated": false,
    "literal_sg": "{s} takes {o} out of {p} vessels",
    "literal_pl": "{s} take {o} out of {p} vessels",
    "showMeaning": true,
    "suffix_forms": {
      "1sg": "מכליי", "2msg": "מכליך", "2fsg": "מכליך",
      "3msg": "מכליו", "3fsg": "מכליה", "1pl": "מכלינו",
      "2mpl": "מכליכם", "2fpl": "מכליכן", "3mpl": "מכליהם", "3fpl": "מכליהן"
    },
    "conjugations": {
      "present": { "msg": "מוציא", "fsg": "מוציאה", "mpl": "מוציאים", "fpl": "מוציאות" }
    }
  }
];

  // Normalize: expose present_tense and english_meaning as aliases.
  return raw.map(function (item) {
    return Object.assign({}, item, {
      present_tense: item.conjugations.present,
      english_meaning: item.english,
    });
  });
})();
