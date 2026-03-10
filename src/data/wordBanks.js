export const WORD_BANKS = {
  "\u{1F4D6} Bible Books": {
    icon: "\u{1F4D6}", color: "#B464FF",
    words: {
      easy:   ["RUTH","JOB","ACTS","AMOS","JOEL","JOHN","MARK","LUKE","EZRA","TITUS","JAMES"],
      medium: ["GENESIS","EXODUS","JUDGES","SAMUEL","KINGS","PSALMS","ISAIAH","DANIEL","ROMANS","MATTHEW","REVELATION"],
      hard:   ["LEVITICUS","NUMBERS","DEUTERONOMY","CHRONICLES","NEHEMIAH","PROVERBS","ECCLESIASTES","EZEKIEL","PHILIPPIANS","COLOSSIANS","THESSALONIANS","CORINTHIANS","GALATIANS","EPHESIANS","HABAKKUK","ZEPHANIAH"]
    }
  },
  "\u{1F981} Animals": {
    icon: "\u{1F981}", color: "#FF8C28",
    words: {
      easy:   ["CAT","DOG","FOX","OWL","APE","ELK","GNU","YAK","EMU","COD","RAM"],
      medium: ["ELEPHANT","GIRAFFE","PENGUIN","DOLPHIN","CHEETAH","PANTHER","GORILLA","OCTOPUS","FLAMINGO","PLATYPUS","SCORPION"],
      hard:   ["RHINOCEROS","HIPPOPOTAMUS","CHIMPANZEE","ORANGUTAN","CHAMELEON","CROCODILE","WOLVERINE","PORCUPINE","ARMADILLO","NARWHAL","ALBATROSS","MONGOOSE","PIRANHA"]
    }
  },
  "\u{1F30D} Countries": {
    icon: "\u{1F30D}", color: "#00D4FF",
    words: {
      easy:   ["CHAD","IRAN","IRAQ","CUBA","PERU","TOGO","FIJI","LAOS","MALI","OMAN","NIUE"],
      medium: ["NIGERIA","ETHIOPIA","TANZANIA","ZIMBABWE","CAMEROON","SENEGAL","VIETNAM","THAILAND","INDONESIA","COLOMBIA","PORTUGAL"],
      hard:   ["MOZAMBIQUE","MADAGASCAR","AFGHANISTAN","PHILIPPINES","KAZAKHSTAN","UZBEKISTAN","AZERBAIJAN","GUATEMALA","NICARAGUA","BANGLADESH","BOTSWANA","NAMIBIA"]
    }
  },
  "\u{1F3D9}\uFE0F Capitals": {
    icon: "\u{1F3D9}\uFE0F", color: "#AAFF00",
    words: {
      easy:   ["ROME","LIMA","OSLO","RIGA","BERN","KIEV","DOHA","SUVA"],
      medium: ["LONDON","PARIS","BERLIN","MADRID","NAIROBI","ACCRA","ABUJA","BANGKOK","JAKARTA","MANILA","ANKARA"],
      hard:   ["REYKJAVIK","AMSTERDAM","STOCKHOLM","COPENHAGEN","HELSINKI","ISLAMABAD","ANTANANARIVO","ADDISABABA","OUAGADOUGOU","ULAANBAATAR","BRATISLAVA"]
    }
  },
  "\u{1F34E} Fruits": {
    icon: "\u{1F34E}", color: "#FF4D6D",
    words: {
      easy:   ["FIG","PLUM","LIME","PEAR","KIWI","DATE","GUAVA","MANGO","PEACH","GRAPE","LEMON"],
      medium: ["APRICOT","CHERRY","PAPAYA","LYCHEE","COCONUT","AVOCADO","NECTARINE","PLANTAIN","MULBERRY","STARFRUIT","TAMARIND"],
      hard:   ["STRAWBERRY","BLUEBERRY","RASPBERRY","BLACKBERRY","CRANBERRY","PINEAPPLE","WATERMELON","CANTALOUPE","POMEGRANATE","PERSIMMON","MANGOSTEEN","DRAGONFRUIT","RAMBUTAN","JACKFRUIT","SOURSOP"]
    }
  },
  "\u{1F3AC} Movies": {
    icon: "\u{1F3AC}", color: "#D4AF37",
    words: {
      easy:   ["JAWS","TRON","THOR","COCO","MULAN","AVATAR","LOKI","VENOM","BAMBI"],
      medium: ["INCEPTION","GLADIATOR","BRAVEHEART","TITANIC","AQUAMAN","ENCANTO","MOANA","ALADDIN","HERCULES","BEETLEJUICE","RATATOUILLE"],
      hard:   ["INTERSTELLAR","TERMINATOR","GHOSTBUSTERS","PREDATOR","PINOCCHIO","LABYRINTH","FANTASTIC","WOLVERINE","CINDERELLA","ANASTASIA","FANTASIA"]
    }
  }
};

export const CATEGORIES = Object.keys(WORD_BANKS);

export function getWordPool(category, difficulty = 'mixed') {
  const bank = WORD_BANKS[category];
  if (!bank) return [];
  if (difficulty === 'mixed') return [...bank.words.easy, ...bank.words.medium, ...bank.words.hard];
  return bank.words[difficulty] || bank.words.medium;
}
