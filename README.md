# English by Situations

Learn English through real-life situations: one topic a day (supermarket, hotel, job interview…).
Each topic has **words**, **sentences**, a **story**, **one grammar point** and **practice**.

There is also an **Essentials** section (`/essentials`) for core building blocks (days, numbers, pronouns,
prepositions…), with Learn, Flashcards and Quiz tabs.

Levels follow CEFR: **A1** Beginner, **A2** Elementary, **B1** Intermediate, **B2** Upper-Intermediate,
**C1** Advanced, **C2** Proficient. They are defined in `src/data/levels.js` (names and badge colors).

Frontend only: **React (Vite) + Tailwind CSS**, plain JavaScript. Progress is stored in `localStorage`.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run validate   # check every topic and essentials JSON file
npm test           # run the Vitest test suite (npm run test:watch while developing)
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Folder structure

```
├── scripts/
│   └── validate-topics.js     # topic checker (npm run validate)
├── topics-plan.json           # plan used to generate the 30 topics
├── vite.config.js             # includes the topic "meta" plugin (see Performance)
└── src/
    ├── main.jsx / App.jsx     # entry + routes
    ├── index.css              # Tailwind + brand utilities (glass-card, bg-grid, text-highlight)
    ├── pages/                 # Home, Topics, TopicPage, Essentials, EssentialPage, NotFound
    ├── components/
    │   ├── layout/            # Layout, Navbar, ThemeToggle, BrandBackground, Footer
    │   ├── ui/                # Button, Chip, LevelBadge, LevelChips, Tabs, ProgressBar, CodeWindow, …
    │   ├── home/              # Hero, StatsRow, TodayTopic
    │   ├── topics/            # TopicCard, TopicsGrid, LevelGroupedGrid
    │   ├── topic/             # TopicHeader + tabs/ (Words, Sentences, Story, Grammar, Practice)
    │   ├── essentials/        # LearnTab, EssentialTable, Flashcards, QuizTab
    │   ├── learn/             # WordList, WordCard (shared by topics and essentials)
    │   ├── practice/          # QuizRunner, Mcq / Fill / Order / Listen exercises, ScoreScreen
    │   └── speech/            # SpeechContext, SpeakButton, SpeechNotice
    ├── hooks/                 # useProgress (+ makeProgressHook), useEssentialsProgress, useSavedWords,
    │                          # useStreak, useTheme, useSpeech, useTopic / useEssential, …
    ├── utils/                 # storage, speech, answers, storyText, quiz, date
    └── data/
        ├── levels.js          # A1–C2 names + colors
        ├── registry.js        # shared lazy-loading registry logic
        ├── topics/            # one JSON per topic + index.js (TOPIC_ORDER)
        └── essentials/        # one JSON per category + index.js (ESSENTIALS_ORDER)
```

## Add a new topic

1. **Copy** `src/data/topics/supermarket.json` to `src/data/topics/<slug>.json`.
   The slug is lowercase with dashes (e.g. `post-office`) and **must match the file name**.
2. **Edit** the content (see the format below).
3. **Register** it: add the slug to `TOPIC_ORDER` in `src/data/topics/index.js`.
   Its position in the array is its position in the learning path.
4. **Validate**: `npm run validate`, then fix anything it reports.

No component changes are needed. The topic appears on Home, on `/topics`, and at `/topics/<slug>`.

### Topic format

```jsonc
{
  "slug": "supermarket",                // = file name
  "title": "Supermarket",
  "titleAr": "السوبرماركت",
  "emoji": "🛒",
  "level": "A2",                        // A1 | A2 | B1 (B2, C1, C2 also allowed)
  "description": "Find products, ask about prices…",
  "descriptionAr": "…",
  "words": [                            // exactly 20
    { "en": "cashier", "ar": "كاشير", "phonetic": "/kæˈʃɪr/", "example": "The cashier is very friendly." }
  ],
  "sentences": [                        // exactly 10
    { "en": "Where can I find the milk?", "ar": "أين أجد الحليب؟" }
  ],
  "story": { "title": "…", "text": "…", "translation": "…" },   // text: 120-180 words
  "grammar": {
    "title": "How much vs. How many",
    "explanationAr": "…",
    "rule": "Line one\nLine two",       // \n = new line in the rule box
    "examples": [{ "en": "…", "ar": "…" }]                     // 4-5
  },
  "exercises": [                        // exactly 8
    { "type": "mcq", "question": "___ milk do we need?", "options": ["How many", "How much"], "answer": "How much" },
    { "type": "fill", "sentence": "I need to ___ for my groceries.", "answer": "pay", "hint": "يدفع", "accept": ["other correct answer"] },
    { "type": "order", "words": ["can", "the", "Where", "milk?", "I", "find"], "answer": "Where can I find the milk?" },
    { "type": "listen", "audioText": "Here is your change.", "answer": "Here is your change." }
  ]
}
```

Tips:
- **mcq**: `answer` must match one option exactly. Options are shuffled in the app.
- **fill**: exactly one `___`. `hint` and `accept` are optional.
- **order**: `words` = the answer split on spaces (punctuation stays attached, e.g. `"milk?"`), in any order.
- **listen**: capital letters and punctuation are ignored when checking.
- **Story**: use the topic's words in base form or with simple endings (-s, -ed, -ing) so learners can tap them for their meaning. Multi-word entries like `"wake up"` are matched too.

## Add an Essentials category

1. Copy `src/data/essentials/possessives.json` to `src/data/essentials/<slug>.json`.
2. Edit it, then add the slug to `ESSENTIALS_ORDER` in `src/data/essentials/index.js`.
3. Run `npm run validate`.

```jsonc
{
  "slug": "possessives",
  "title": "Possessives",
  "titleAr": "الملكية",
  "emoji": "🔖",
  "level": "A1",
  "intro": "شرح قصير بالعربي (2-3 سطور)",
  "items": [                            // at least 4 (the quiz needs 3 wrong options)
    { "en": "my", "ar": "ـي / بتاعي", "phonetic": "/maɪ/", "example": "This is my phone.", "exampleAr": "ده تليفوني." }
  ],
  "table": {                            // optional; or an array of rows (first row = header)
    "columns": ["Subject", "Before a noun", "Alone"],
    "rows": [["I", "my", "mine"], ["you", "your", "yours"]]
  },
  "tips": ["نصيحة قصيرة عن غلطة شائعة"]  // optional
}
```

- The **quiz** is generated automatically: English → Arabic, Arabic → English, fill the blank, and two voice
  question types when the browser supports them: **Listen & choose** (hear the word, pick its meaning) and
  **Say it** (see the Arabic meaning, say the English word). The saved-words quiz uses the same generator.
  For fill the blank, the item is removed from its `example`, so each example must **contain the item exactly**
  (the validator warns if it doesn't). `exampleAr` is shown as a hint, so similar items stay unambiguous.
- Give items **different `ar` values**, so a quiz question never has two correct options.
- **Flashcards**: "I know it" marks the item as learned (the same as "Got it" on the Learn tab).

## Validation

`npm run validate` checks every topic file and exits with code **1** on any error:

- required fields exist, and `slug` matches the file name
- exactly 20 words, 10 sentences and 8 exercises; every word has `en`, `ar`, `phonetic` (`/…/`) and `example`
- **mcq**: the answer is one of the options · **fill**: contains `___` and has an answer · **order**: the words form the answer · **listen**: `audioText` and `answer` exist
- no duplicate slugs or words, and no empty or non-Arabic Arabic fields
- every registered slug has a file, and every file is registered (warning)
- **warnings only**: story length outside 120-180 words, grammar examples outside 4-5

For **essentials** it checks: required fields (including `intro`), at least 4 items, each with
`en`, `ar`, `phonetic`, `example` and `exampleAr`, no empty Arabic, no duplicate items, every table row
with the same number of cells as the columns, and Arabic `tips`.

Check only some files with `node scripts/validate-topics.js hotel months`, or check one collection
with `--topics` or `--essentials`.

## How it works

- **Today's Topic** = the first topic in `TOPIC_ORDER` that isn't completed.
- **Completed** = a Practice score of **70% or more**. The best score per topic is saved.
- **Streak** goes up on each day you mark a word with "Got it" or finish a practice.
- **Saved words** = words bookmarked on any word card (topics or essentials). The `/saved` page lists them
  grouped by source, with search, flashcards and a quiz built from your list. Flashcard "I know it" updates the
  progress of the word's own topic or category.
- **Dialogue tab (role-play)**: every topic has an 8–12 line conversation (`dialogue` in the topic JSON:
  `title`, `settingAr`, two `roles`, `learnerRole`, `lines`). Listen to it, then play your role: the other side
  speaks automatically and you say your lines into the microphone (or say them from the Arabic only).
- **Daily review (/review)**: spaced repetition (Leitner boxes: 1, 3, 7, 14, 30 days) over every word you marked
  "Got it" or saved. The **mistakes notebook** collects every wrong quiz answer; answering it correctly removes it.
- **Settings (/settings)**: voice and speed, Arabic shown by default, text size, daily goal, backup / restore,
  and "make all lessons available offline".
- **Installable & offline (PWA)**: `public/manifest.webmanifest` + a hand-written `public/sw.js` (registered in
  production only). Pages and lessons you opened work without internet.
- **Speaking practice (🎤)**: on word cards, on each sentence, and as 2 "Say it" exercises added to every topic's
  Practice. It uses the browser's `SpeechRecognition` (Chrome, Edge, Safari; not Firefox; needs internet and microphone
  permission), then compares what you said with the target word by word: green = heard, red = missed. It checks that
  you are understood; it is not a detailed accent coach. The 🎤 buttons are hidden in browsers without support.
- **Audio** uses the browser's `speechSynthesis`: it picks an en-US voice, waits for voices that load late, falls back to the default voice, and shows a notice when speech isn't supported.
- **Essentials**: a category is completed at **70% or more** in its quiz. Its progress is stored separately
  from topics, and the Home stats show completed categories and learned items.
- **localStorage keys**: `ebs:theme`, `ebs:progress`, `ebs:essentials-progress`, `ebs:saved-words`, `ebs:streak`,
  `ebs:review`, `ebs:mistakes`, `ebs:settings`, `ebs:daily`.
  Every access is wrapped in try/catch.

### Performance

Lists only need a little information per topic, so `vite.config.js` has a small plugin.
Importing `topic.json?meta` returns just the title, emoji, level, counts and a 4-word preview.
`index.js` loads that metadata for every topic, and loads each **full** topic file lazily (its own chunk)
only when you open that topic.
