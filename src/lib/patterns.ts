// cspell:disable

export interface Pattern {
  filename: string;
  name: string;
  description: string;
  source?: "remote" | "manual";
}

export const PATTERNS: Pattern[] = [
  // Spaceships
  {
    filename: "glider.rle",
    name: "Glider",
    description: "Smallest spaceship — moves diagonally, period 4."
  },
  {
    filename: "lwss.rle",
    name: "Lightweight spaceship",
    description: "Period-4 spaceship that moves horizontally (c/2)."
  },
  {
    filename: "mwss.rle",
    name: "Middleweight spaceship",
    description: "Larger period-4 c/2 orthogonal spaceship."
  },
  {
    filename: "hwss.rle",
    name: "Heavyweight spaceship",
    description: "Largest common period-4 c/2 orthogonal spaceship."
  },
  // Small oscillators
  {
    filename: "blinker.rle",
    name: "Blinker",
    description: "The only period-2 oscillator with three cells (a pole)."
  },
  {
    filename: "toad.rle",
    name: "Toad",
    description: "Period-2 oscillator — minimal four-cell flip-flop."
  },
  {
    filename: "beacon.rle",
    name: "Beacon",
    description: "Period-2 oscillator made of two interacting blocks."
  },
  {
    filename: "clock.rle",
    name: "Clock",
    description: "Period-4 oscillator."
  },
  {
    filename: "pinwheel.rle",
    name: "Pinwheel",
    description: "Period-4 oscillator."
  },
  {
    filename: "fumarole.rle",
    name: "Fumarole",
    description: "Period-5 oscillator."
  },
  {
    filename: "unix.rle",
    name: "Unix",
    description: "Period-6 oscillator."
  },
  {
    filename: "pulsar.rle",
    name: "Pulsar",
    description:
      "Period-3 oscillator — the most common naturally occurring oscillator beyond period 2."
  },
  {
    filename: "pentadecathlon.rle",
    name: "Penta-decathlon",
    description:
      "Period-15 oscillator that emerges from a row of ten live cells."
  },
  {
    filename: "koksgalaxy.rle",
    name: "Kok's galaxy",
    description: "Classic period-8 oscillator — dense rotating mass."
  },
  {
    filename: "octagon2.rle",
    name: "Octagon 2",
    description: "Period-5 oscillator with eightfold symmetry."
  },
  {
    filename: "tumbler.rle",
    name: "Tumbler",
    description: "Period-14 oscillator."
  },
  {
    filename: "phoenix1.rle",
    name: "Phoenix 1",
    description: "Oscillator in which every cell dies every period — period 12."
  },
  {
    filename: "jam.rle",
    name: "Jam",
    description: "Period-3 oscillator."
  },
  {
    filename: "caterer.rle",
    name: "Caterer",
    description: "Period-3 oscillator related to the jam."
  },
  {
    filename: "heavyweightvolcano.rle",
    name: "Heavyweight volcano",
    description: "Period-5 oscillator."
  },
  // Still lifes and common objects
  {
    filename: "block.rle",
    name: "Block",
    description: "The only four-cell still life — the commonest ash."
  },
  {
    filename: "beehive.rle",
    name: "Beehive",
    description: "Six-cell still life."
  },
  {
    filename: "loaf.rle",
    name: "Loaf",
    description: "Seven-cell still life."
  },
  {
    filename: "boat.rle",
    name: "Boat",
    description: "Five-cell still life."
  },
  {
    filename: "tub.rle",
    name: "Tub",
    description: "Four-cell still life (with a hole)."
  },
  {
    filename: "pond.rle",
    name: "Pond",
    description: "Eight-cell still life — a hollow square."
  },
  {
    filename: "ship.rle",
    name: "Ship",
    description: "Six-cell still life."
  },
  {
    filename: "aircraftcarrier.rle",
    name: "Aircraft carrier",
    description: "Six-cell still life — two boats joined."
  },
  {
    filename: "snake.rle",
    name: "Snake",
    description: "Six-cell polyplet still life."
  },
  {
    filename: "table.rle",
    name: "Table on table",
    description: "Twelve-cell still life."
  },
  {
    filename: "paperclip.rle",
    name: "Paperclip",
    description: "Fourteen-cell still life."
  },
  {
    filename: "canoe.rle",
    name: "Canoe",
    description: "Ten-cell still life."
  },
  {
    filename: "longboat.rle",
    name: "Long boat",
    description: "Seven-cell still life."
  },
  {
    filename: "mango.rle",
    name: "Mango",
    description: "Eight-cell still life."
  },
  {
    filename: "teardrop.rle",
    name: "Teardrop",
    description: "Seven-cell still life."
  },
  {
    filename: "honeyfarm.rle",
    name: "Honey farm",
    description: "Stable cluster of four beehives."
  },
  {
    filename: "pondonpond.rle",
    name: "Pond on pond",
    description: "Still life formed from two ponds."
  },
  // Small polyominoes (often catalysts or methuselah seeds)
  {
    filename: "piheptomino.rle",
    name: "Pi-heptomino",
    description:
      "Seven cells; common chaotic predecessor that often stabilises with a pi output."
  },
  {
    filename: "bheptomino.rle",
    name: "B-heptomino",
    description:
      "Seven cells; famous predecessor to Herschel tracks and glider synthesis."
  },
  {
    filename: "herschel.rle",
    name: "Herschel",
    description:
      "Seven-cell pattern — core of many stable circuits after 128 ticks."
  },
  {
    filename: "queenbee.rle",
    name: "Queen bee",
    description:
      "Period-30 shuttle component — stabilises when capped by still lifes."
  },
  {
    filename: "eater1.rle",
    name: "Eater 1",
    description:
      "Classic seven-cell still life that destroys gliders and many other sparks."
  },
  {
    filename: "eater2.rle",
    name: "Eater 2",
    description:
      "Alternative eater still life for different collision geometry."
  },
  // Methuselahs
  {
    filename: "rpentomino.rle",
    name: "R-pentomino",
    description:
      "Five cells; chaotic for 1103 generations before stabilising into six gliders and ash."
  },
  {
    filename: "acorn.rle",
    name: "Acorn",
    description:
      "Seven cells; runs 5206 generations before settling into 633 cells and 13 escaping gliders."
  },
  {
    filename: "diehard.rle",
    name: "Diehard",
    description:
      "Seven cells that vanish completely after exactly 130 generations."
  },
  {
    filename: "bunnies.rle",
    name: "Bunnies",
    description: "Nine-cell methuselah with a 17 332-generation lifespan."
  },
  {
    filename: "lidka.rle",
    name: "Lidka",
    description:
      "13-cell methuselah with a 29 055-generation lifespan — among the longest small starters."
  },
  // Guns and shuttles
  {
    filename: "gosperglidergun.rle",
    name: "Gosper glider gun",
    description:
      "First known infinite-growth pattern — fires a glider every 30 generations."
  },
  {
    filename: "p46gun.rle",
    name: "Period-46 glider gun",
    description: "Glider gun based on twin bees / p46 technology."
  },
  {
    filename: "twinbeesshuttle.rle",
    name: "Twin bees shuttle",
    description: "Period-46 oscillator — two queen-bee shuttles between blocks."
  },
  {
    filename: "queenbeeshuttle.rle",
    name: "Queen bee shuttle",
    description:
      "Single queen-bee shuttle between stabilising caps (period 30)."
  },
  // Large engineered patterns
  {
    filename: "simkinsp60.rle",
    name: "Simkin's p60",
    description:
      "Compact period-60 oscillator in the Dean Hickerson / Michael Simkin vein."
  },
  {
    filename: "p44piheptominohassler.rle",
    name: "P44 pi-heptomino hassler",
    description: "Period-44 oscillator involving a pi-heptomino."
  },
  {
    filename: "p24honeyfarmhassler.rle",
    name: "P24 honey farm hassler",
    description: "Period-24 oscillator."
  },
  {
    filename: "p16biblockhassler.rle",
    name: "P16 bi-block hassler",
    description: "Period-16 oscillator."
  },
  {
    filename: "p15bumper.rle",
    name: "P15 bumper",
    description: "Period-15 oscillator — bumper technology."
  },
  {
    filename: "p12honeyfarmhassler.rle",
    name: "P12 honey farm hassler",
    description: "Period-12 oscillator."
  },
  {
    filename: "p9honeyfarmhassler.rle",
    name: "P9 honey farm hassler",
    description: "Period-9 oscillator."
  },
  {
    filename: "p8bumper.rle",
    name: "P8 bumper",
    description: "Period-8 bumper oscillator."
  },
  {
    filename: "p7bumper.rle",
    name: "P7 bumper",
    description: "Period-7 bumper oscillator."
  },
  {
    filename: "p6bumper.rle",
    name: "P6 bumper",
    description: "Period-6 bumper oscillator."
  },
  {
    filename: "p5bumper.rle",
    name: "P5 bumper",
    description: "Period-5 bumper oscillator."
  },
  {
    filename: "p4bumper.rle",
    name: "P4 bumper",
    description: "Period-4 bumper oscillator."
  },
  {
    filename: "p3bumper.rle",
    name: "P3 bumper",
    description: "Period-3 bumper oscillator."
  },
  {
    filename: "blocklayingswitchengine.rle",
    name: "Block-laying switch engine",
    description: "c/12 diagonal puffer (period 288) leaving a trail of blocks."
  },
  {
    filename: "lobster.rle",
    name: "Lobster",
    description: "The first known c/7 diagonal spaceship (2011)."
  },
  {
    filename: "spider.rle",
    name: "Spider",
    description: "Famous c/5 orthogonal spaceship."
  },
  {
    filename: "piorbital.rle",
    name: "Pi orbital",
    description: "Engineered spaceship / puffer family (pi orbital)."
  },
  {
    filename: "piorbital2.rle",
    name: "Pi orbital 2",
    description: "Variant in the pi orbital family."
  },
  {
    filename: "piorbital3.rle",
    name: "Pi orbital 3",
    description: "Variant in the pi orbital family."
  },
  {
    filename: "turingmachine.rle",
    name: "Rendell's Turing machine",
    description:
      "Paul Rendell, 2000 — a finite-tape Turing machine in Life, illustrating computational universality."
  },
  {
    filename: "otcametapixel.rle",
    name: "OTCA metapixel",
    description:
      "Brice Due, 2006 — 2048×2048 unit cell for outer-totalistic CA simulation; one meta period 35 328 generations."
  },
  // Macrocell examples (https://copy.sh/life/examples/) — large patterns; HashLife-friendly
  {
    filename: "hashlife-oddity1.mc",
    name: "HashLife oddity 1",
    description:
      "Forward-firing switch engine meets a dirty Schick engine — stress test for hierarchical caching."
  },
  {
    filename: "hashlife-oddity2.mc",
    name: "HashLife oddity 2",
    description:
      "Variant of hashlife-oddity1 with slightly different switch-engine interaction."
  },
  {
    filename: "broken-lines.mc",
    name: "Broken lines",
    description:
      "Open question pattern — broken LWSS-like lines; long-run behaviour is non-obvious."
  },
  {
    filename: "nick-gotts-1.mc",
    name: "Nick Gotts 1",
    description: "Small engineered interaction (Nick Gotts family)."
  },
  {
    filename: "nick-gotts-2.mc",
    name: "Nick Gotts 2",
    description: "Another compact Nick Gotts rake-style construction."
  },
  {
    filename: "puzzle.mc",
    name: "Gotts puzzle",
    description:
      "Tiny starter with famously late-surprising behaviour (see Gott's puzzle write-ups)."
  },
  {
    filename: "unlimited-novelty.mc",
    name: "Unlimited novelty",
    description:
      "Rake interaction related to Nick-Gotts-type dynamics with rich long-term structure."
  },
  {
    filename: "totalperiodic.mc",
    name: "Total periodic (Gosper)",
    description:
      "Bill Gosper — fully periodic macrocell example from the copy.sh collection."
  },
  {
    filename: "jagged.mc",
    name: "Jagged",
    description:
      "Drifting collision produces jagged diagonal streams of gliders."
  },
  {
    filename: "jagged2.mc",
    name: "Jagged 2",
    description:
      "Variant jagged-line collision — some glider phases differ from jagged.mc."
  },
  {
    filename: "ruler.mc",
    name: "Ruler",
    description:
      "Westbound LWSS groups with structured gap sizes — 'ruler' population encoding."
  },
  {
    filename: "logarithmic-width.mc",
    name: "Logarithmic width",
    description:
      "Pattern family illustrating logarithmic-width growth in the ash frontier."
  },
  {
    filename: "gotts-dots.mc",
    name: "Gotts dots",
    description:
      "Switchengine timing — nth engine sprouts around t ~ 2^(24n−6) (exponential spacing)."
  },
  {
    filename: "catacryst.mc",
    name: "Catacryst",
    description: "58-cell quadratic-growth seed — crystal-like expansion."
  },
  {
    filename: "mosquito5.mc",
    name: "Mosquito 5",
    description: "71-cell quadratic-growth pattern."
  },
  {
    filename: "wedge-grow.mc",
    name: "Wedge grow",
    description:
      "26-cell quadratic growth from a forward glider-producing switch engine."
  },
  {
    filename: "caterpillar.mc",
    name: "Caterpillar",
    description:
      "Famous oblique spaceship — macrocell-sized bounding box (~4k × 330k cells)."
  },
  {
    filename: "centipede.mc",
    name: "Centipede",
    description:
      "Large oblique engineered ship (see LifeWiki) — heavy but classic."
  },
  {
    filename: "demonoid.mc",
    name: "Demonoid",
    description:
      "Self-constructing oblique geminoid family pattern — large sparse macrocell."
  },
  {
    filename: "orthogonoid.mc",
    name: "Orthogonoid",
    description:
      "Orthogonal self-constructing spaceship — very long thin macrocell layout."
  },
  {
    filename: "parallelhbk.mc",
    name: "Parallel half-bakery knightship",
    description:
      "HBK relative at (6,3)c/245912 — parallel variant of the half-bakery knightship theme."
  },
  {
    filename: "shieldbug.mc",
    name: "Shield bug",
    description:
      "Huge engineered spaceship (LifeWiki) — millions of live cells in the macrocell."
  },
  {
    filename: "loafer-gun-p8388608-linear.mc",
    name: "Loafer gun (p 2²³)",
    description:
      "Very slow gun firing c/7 loafers every 2²³ ticks — ~1M×1M bounding region."
  },
  {
    filename: "picalculator.mc",
    name: "Pi calculator",
    description:
      "Spartan-style pattern that computes decimal digits of π — large but bounded."
  },
  {
    filename: "succ.mc",
    name: "Spartan UCC",
    description:
      "Spartan universal computer-constructor — Turing-complete construction toolkit in one file."
  },
  {
    filename: "hexadecimal.mc",
    name: "Hexadecimal display",
    description:
      "Large hexadecimal / display-style macrocell (from HexaDecimal.mc.gz lineage on copy.sh)."
  },
  {
    filename: "metapixel-galaxy.mc",
    name: "Metapixel galaxy (Life-in-Life)",
    description:
      "Kok's galaxy inside a 15×15 OTCA metapixel grid — one meta-tick = 35 328 generations."
  },
  {
    filename: "metapixel-p216-gun.mc",
    name: "Metapixel p216 gun",
    description: "Period-216 glider gun built from OTCA metapixels."
  },
  {
    filename: "metapixel-parity64.mc",
    name: "Metapixel parity-64",
    description:
      "64×64 OTCA grid with XOR / parity rule (B1357/S02468) — Sierpinski-like meta fractal."
  },
  {
    filename: "mmblinker.mc",
    name: "Meta-meta blinker (OTCA level 2)",
    description:
      "Blinker built from OTCA metapixels that are themselves built from OTCA metapixels.",
    source: "manual"
  },
  {
    filename: "TetrisOTCAMP.mc",
    name: "Tetris (OTCA metapixel)",
    description:
      "dim, Code Golf — playable Tetris on an OTCA metapixel processor (outer-totalistic CA simulation in Life)."
  },
  {
    filename: "linear-propagator-p237228340.mc",
    name: "Linear propagator (p 237 228 340)",
    description:
      "Phase-shifted linear replicator — returns after 237 228 340 ticks, copies after 237 228 617; large sparse macrocell (Golly / copy.sh collection)."
  },
  {
    filename: "metacatacryst.mc",
    name: "Metacatacryst",
    description:
      "Nick Gotts, 2000 — 52-cell quadratic-growth seed (classic name; not an OTCA metapixel tiling)."
  }
];

export const DEFAULT_PATTERN = PATTERNS.find(
  p => p.filename === "otcametapixel.rle"
)!;

// cspell:enable
