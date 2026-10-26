import uk from './locales/uk';
import ru from './locales/ru';
import { categoryInterpretations as en } from './tarot-categories';

export const LANGS = ['uk', 'ru', 'en'];
// Price in UAH (₴). Discount % is computed from the price of the smallest pack.
export const RUBY_PACKS = [
  { amount: 5, price: 249 },
  { amount: 20, price: 799, badge: 'badgePopular' },
  { amount: 50, price: 1499, badge: 'badgeBest' },
];
export const CURRENCY = '₴';
export function discountPct(pack) {
  const base = RUBY_PACKS[0].price / RUBY_PACKS[0].amount;
  return Math.round((1 - pack.price / pack.amount / base) * 100);
}
export const QUESTION_COST = 1;
export const SPREADS = { 1: { cards: 1, cost: 1 }, 3: { cards: 3, cost: 3 } };

export const DEFAULT_LANG = 'uk';
export const LANG_LABELS = { uk: 'UA', ru: 'RU', en: 'EN' };

const arcanaNames = {
  uk: { Major: 'Старші Аркани', Wands: 'Жезли', Cups: 'Кубки', Swords: 'Мечі', Pentacles: 'Пентаклі' },
  ru: { Major: 'Старшие Арканы', Wands: 'Жезлы', Cups: 'Кубки', Swords: 'Мечи', Pentacles: 'Пентакли' },
  en: { Major: 'Major Arcana', Wands: 'Wands', Cups: 'Cups', Swords: 'Swords', Pentacles: 'Pentacles' },
};

export const STRINGS = {
  uk: {
    pageTitle: 'Tarot Reader',
    pageDesc: 'Витягни карту й отримай своє тлумачення',
    authLogin: 'Увійди в містичний світ',
    authRegister: 'Почни свою подорож',
    signIn: 'Увійти', register: 'Реєстрація',
    username: "Ім'я користувача", password: 'Пароль',
    usernamePh: 'твоє ім’я…',
    enter: 'Увійти', createAccount: 'Створити акаунт',
    errUserShort: "Ім'я користувача має містити щонайменше 2 символи.",
    errPassShort: 'Пароль має містити щонайменше 4 символи.',
    errTaken: "Таке ім'я вже зайняте.",
    errNoUser: 'Користувача не знайдено.',
    errWrongPass: 'Невірний пароль.',
    deckHint: '← наведи курсор на краї, щоб гортати · клікни на карту →',
    newReading: 'Нове розкладання', newQuestion: '+ Нове питання',
    del: 'Видалити',
    title: '✦ Tarot Reader ✦',
    readings: 'розкладів', sessions: 'сесій', signOut: 'Вийти',
    emptyTitle: 'Що приховують для тебе карти?',
    emptySub: 'Запитай про кохання, гроші, здоров’я, роботу чи стосунки',
    inputPh: 'Запитай карти…',
    error: 'Щось пішло не так — карти мовчать.',
    arcana: (a) => a,
    rubies: 'Рубіни', buyRubies: 'Купити рубіни',
    shopTitle: 'Рубіни', shopSub: '1 карта — 1 рубін, розклад на 3 карти — 3 рубіни',
    yourBalance: 'Твій баланс', rubyUnit: ['рубін', 'рубіни', 'рубінів'],
    buy: 'Купити', bought: 'Додано', close: 'Закрити',
    noRubies: 'Рубіни закінчилися — поповни баланс, щоб поставити питання.',
    cost: 'Питання: 1 рубін',
    badgePopular: 'Популярне', badgeBest: 'Найвигідніше', perRuby: 'за рубін',
    deckHintTouch: '← проведи пальцем · торкнись карти →', menu: 'Меню',
    spreadLabel: 'Розклад',
    spread1: '1 карта', spread3: '3 карти',
    spread1Short: 'Швидка відповідь на просте питання',
    spread3Short: 'Минуле → теперішнє → майбутнє',
    spread1Title: 'Одна карта', spread3Title: 'Три карти',
    spread1Desc: 'Коротка пряма відповідь. Обирай, коли питання чітке й просте: «так чи ні?», «що мені робити сьогодні?», «на що звернути увагу зараз?». Швидко і за 1 рубін.',
    spread3Desc: 'Глибший погляд на ситуацію: що було, що є зараз і куди це веде. Обирай, коли питання складне — про стосунки, роботу, вибір чи майбутнє, або коли хочеш зрозуміти причини й наслідки.',
    bestFor: 'Коли обрати',
    pos1: 'Минуле', pos2: 'Теперішнє', pos3: 'Майбутнє',
    pickProgress: (n, m) => `Обрано ${n} з ${m}`,
    notEnough: (n, have, w) => `Для цього розкладу потрібно ${n} ${w}. У тебе: ${have}. Поповни баланс.`,
    language: 'Мова',
  },
  ru: {
    pageTitle: 'Tarot Reader',
    pageDesc: 'Вытяни карту и получи своё толкование',
    authLogin: 'Войди в мистический мир',
    authRegister: 'Начни своё путешествие',
    signIn: 'Войти', register: 'Регистрация',
    username: 'Имя пользователя', password: 'Пароль',
    usernamePh: 'твоё имя…',
    enter: 'Войти', createAccount: 'Создать аккаунт',
    errUserShort: 'Имя пользователя должно содержать не менее 2 символов.',
    errPassShort: 'Пароль должен содержать не менее 4 символов.',
    errTaken: 'Это имя уже занято.',
    errNoUser: 'Пользователь не найден.',
    errWrongPass: 'Неверный пароль.',
    deckHint: '← наведи курсор на края, чтобы листать · кликни на карту →',
    newReading: 'Новый расклад', newQuestion: '+ Новый вопрос',
    del: 'Удалить',
    title: '✦ Tarot Reader ✦',
    readings: 'раскладов', sessions: 'сессий', signOut: 'Выйти',
    emptyTitle: 'Что хранят для тебя карты?',
    emptySub: 'Спроси о любви, деньгах, здоровье, работе или отношениях',
    inputPh: 'Спроси у карт…',
    error: 'Что-то пошло не так — карты молчат.',
    arcana: (a) => a,
    rubies: 'Рубины', buyRubies: 'Купить рубины',
    shopTitle: 'Рубины', shopSub: '1 карта — 1 рубин, расклад на 3 карты — 3 рубина',
    yourBalance: 'Твой баланс', rubyUnit: ['рубин', 'рубина', 'рубинов'],
    buy: 'Купить', bought: 'Добавлено', close: 'Закрыть',
    noRubies: 'Рубины закончились — пополни баланс, чтобы задать вопрос.',
    cost: 'Вопрос: 1 рубин',
    badgePopular: 'Популярное', badgeBest: 'Самое выгодное', perRuby: 'за рубин',
    deckHintTouch: '← проведи пальцем · коснись карты →', menu: 'Меню',
    spreadLabel: 'Расклад',
    spread1: '1 карта', spread3: '3 карты',
    spread1Short: 'Быстрый ответ на простой вопрос',
    spread3Short: 'Прошлое → настоящее → будущее',
    spread1Title: 'Одна карта', spread3Title: 'Три карты',
    spread1Desc: 'Короткий прямой ответ. Выбирай, когда вопрос чёткий и простой: «да или нет?», «что мне делать сегодня?», «на что обратить внимание сейчас?». Быстро и за 1 рубин.',
    spread3Desc: 'Более глубокий взгляд на ситуацию: что было, что есть сейчас и куда это ведёт. Выбирай, когда вопрос сложный — об отношениях, работе, выборе или будущем, или когда хочешь понять причины и последствия.',
    bestFor: 'Когда что выбрать',
    pos1: 'Прошлое', pos2: 'Настоящее', pos3: 'Будущее',
    pickProgress: (n, m) => `Выбрано ${n} из ${m}`,
    notEnough: (n, have, w) => `Для этого расклада нужно ${n} ${w}. У тебя: ${have}. Пополни баланс.`,
    language: 'Язык',
  },
  en: {
    pageTitle: 'Tarot Reader',
    pageDesc: 'Draw a card and receive your reading',
    authLogin: 'Enter the mystical realm',
    authRegister: 'Begin your journey',
    signIn: 'Sign In', register: 'Register',
    username: 'Username', password: 'Password',
    usernamePh: 'your name…',
    enter: 'Enter', createAccount: 'Create Account',
    errUserShort: 'Username must be at least 2 characters.',
    errPassShort: 'Password must be at least 4 characters.',
    errTaken: 'Username already taken.',
    errNoUser: 'User not found.',
    errWrongPass: 'Incorrect password.',
    deckHint: '← hover near the edges to scroll · click a card →',
    newReading: 'New reading', newQuestion: '+ New Question',
    del: 'Delete',
    title: '✦ Tarot Reader ✦',
    readings: 'readings', sessions: 'sessions', signOut: 'Sign Out',
    emptyTitle: 'What do the cards hold for you?',
    emptySub: 'Ask about love, money, health, work or relationships',
    inputPh: 'Ask the cards…',
    error: 'Something went wrong — the cards are silent.',
    arcana: (a) => a,
    rubies: 'Rubies', buyRubies: 'Buy rubies',
    shopTitle: 'Rubies', shopSub: '1 card — 1 ruby, 3-card spread — 3 rubies',
    yourBalance: 'Your balance', rubyUnit: ['ruby', 'rubies', 'rubies'],
    buy: 'Buy', bought: 'Added', close: 'Close',
    noRubies: 'Out of rubies — top up to ask a question.',
    cost: 'Question: 1 ruby',
    badgePopular: 'Popular', badgeBest: 'Best value', perRuby: 'per ruby',
    deckHintTouch: '← swipe · tap a card →', menu: 'Menu',
    spreadLabel: 'Spread',
    spread1: '1 card', spread3: '3 cards',
    spread1Short: 'A quick answer to a simple question',
    spread3Short: 'Past → present → future',
    spread1Title: 'One card', spread3Title: 'Three cards',
    spread1Desc: 'A short, direct answer. Pick it when the question is clear and simple: "yes or no?", "what should I do today?", "what should I pay attention to right now?". Quick and just 1 ruby.',
    spread3Desc: 'A deeper look at the situation: what was, what is, and where it is heading. Pick it when the question is complex — about relationships, work, a choice or the future — or when you want to understand causes and consequences.',
    bestFor: 'When to pick which',
    pos1: 'Past', pos2: 'Present', pos3: 'Future',
    pickProgress: (n, m) => `Picked ${n} of ${m}`,
    notEnough: (n, have, w) => `This spread needs ${n} ${w}. You have ${have}. Top up to continue.`,
    language: 'Language',
  },
};

export const CATEGORY_LABELS = {
  uk: { love: '♥ Кохання', money: '✦ Гроші', health: '✦ Здоров’я', work: '✦ Робота', relations: '✦ Стосунки', future: '✦ Майбутнє', choice: '✦ Вибір', psychology: '✦ Психологія', general: '✦ Загальне' },
  ru: { love: '♥ Любовь', money: '✦ Деньги', health: '✦ Здоровье', work: '✦ Работа', relations: '✦ Отношения', future: '✦ Будущее', choice: '✦ Выбор', psychology: '✦ Психология', general: '✦ Общее' },
  en: { love: '♥ Love', money: '✦ Money', health: '✦ Health', work: '✦ Work', relations: '✦ Relations', future: '✦ Future', choice: '✦ Choice', psychology: '✦ Psychology', general: '✦ General' },
};

export function t(lang, key) { return (STRINGS[lang] || STRINGS[DEFAULT_LANG])[key]; }

export function cardName(lang, name) {
  if (lang === 'uk') return uk[name]?.name || name;
  if (lang === 'ru') return ru[name]?.name || name;
  return name;
}

// "Major" -> "Старші Аркани"; minor suits are shown as "Жезли" etc.
export function arcanaLabel(lang, arcana) {
  return (arcanaNames[lang] || arcanaNames.en)[arcana] || arcana;
}

export function interpretation(lang, name, category) {
  const src = lang === 'uk' ? uk : lang === 'ru' ? ru : en;
  const card = src[name];
  return card ? card[category] || card.general : null;
}

// Plural form of the ruby noun for the language (uk/ru: 1 / 2-4 / 5+, en: 1 / many).
export function rubyWord(lang, n) {
  const forms = t(lang, 'rubyUnit');
  if (lang === 'en') return n === 1 ? forms[0] : forms[1];
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}
