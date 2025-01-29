const { Telegraf, Markup, session } = require('telegraf');
const { default: axios } = require('axios');
const fs = require('fs');

const bot = new Telegraf(process.env.TOKEN, { polling: true });
bot.use(session({
    defaultSession: () => ({
        lang: null,
    }),
}));
bot.telegram.setMyCommands([
    { command: '/start', description: 'Start' },
    { command: '/privacy', description: 'Privacy' },
])


// Загрузка данных о монетах и пользователя
let coins = JSON.parse(fs.readFileSync('tickers.json', 'utf-8'));
let usersJson = JSON.parse(fs.readFileSync('users.json', 'utf-8'))
const date = new Date();

// Начальная команда
bot.start(async (ctx) => {
    const chatId = ctx.chat.id;
    const name = ctx.chat.username ? ctx.chat.username : ctx.chat.first_name
    const createdAt = date
    let checkUser = await usersJson.find(el => el.chatId == chatId)
    
    axios
        .post('https://api.telegram.org/bot5336070499:AAFrn3cc5vInWMLnqbqHB7uC9BZRuxXk7dE/sendMessage', {
            chat_id: -1001792646372,
            parse_mode: "html",
            text: `Username: ⤵️ \n🔸${name} \n\nChat ID: ⤵️ \n🔹${chatId} \n\nDate: ⤵️ \n⏳${createdAt}`,
        })
        .then(() => {
            console.log('Yangi foydalanuvchi');
        }).catch((error) => {
            console.log('Error while sending to TG', error);
        })

    if (checkUser) {
        console.log('Bu user allaqachon bazada bor');
    } else {
        // Чтение существующего файла JSON
        // Новые данные, которые нужно добавить
        const data = {
            "name": ctx.chat.username ? ctx.chat.username : ctx.chat.first_name,
            "chatId": chatId,
            "action": "start",
            "quanttityUsing": "1",
            "language": "",
            "createdAt": date
        }
        // Добавление новых данных
        usersJson.push(data);
        // Запись обновленных данных обратно в файл
        fs.writeFile('users.json', JSON.stringify(usersJson, null, 2), { encoding: 'utf8', flag: 'w' }, (err) => {
            if (err) throw err;
            console.log('Данные успешно добавлены и сохранены.');
        })
    }

    ctx.session = {};
    ctx.session.route = 'lang';
    await ctx.reply(
        'SELECT LANGUAGE',
        Markup.inlineKeyboard([
            [
                Markup.button.callback('🇸🇦 العربية', 'lang:sa'),
                Markup.button.callback('🇬🇧 English', 'lang:en')
            ],
            [
                Markup.button.callback('🇷🇺 Русский', 'lang:ru'),
                Markup.button.callback("🇺🇿 O'zbekcha", 'lang:uz')
            ]
        ])
    );
});
// Обработчик выбора языка
bot.action(/lang:(.+)/, async (ctx) => {
    const chatId = ctx.chat.id;
    let checkUser = await usersJson.find(el => el.chatId == chatId)

    const lang = ctx.match[1];
    ctx.session.lang = lang;

    ctx.session.route = 'home';

    ctx.session.lastMessageId = ctx.update.callback_query.message.message_id;

    if (checkUser.language == '') {
        await usersJson.map(el => {
            if (el.chatId == chatId && el.language == '') {
                el.language = ctx.session.lang
                console.log('Added user language');
            } else {
                return
            }
        })
        fs.writeFile('users.json', JSON.stringify(usersJson, null, 2), { encoding: 'utf8', flag: 'w' }, (err) => {
            if (err) throw err;
            console.log('Данные успешно добавлены и сохранены.');
        })
    }


    await homeMessageBuilder(ctx);
});
// Построитель главного меню
async function homeMessageBuilder(ctx) {
    const lang = ctx.session.lang || 'uz';
    try {
        await ctx.editMessageText(
            {
                'uz': '🏠 Asosiy menu',
                'ru': '🏠 Главное меню',
                'en': '🏠 Main menu',
                'sa': '🏠 القائمة الرئيسية'
            }[lang],
            Markup.inlineKeyboard([
                [Markup.button.callback({
                    'uz': 'Kriptovalyutalar hukmini tekshrish 🔍',
                    'ru': 'Проверка криптомонет 🔍',
                    'en': 'Checking Cryptocurrency 🔍',
                    'sa': 'فحص العملات الرقمية 🔍'
                }[lang], 'research')],
                [Markup.button.callback({
                    'uz': 'Akademiya 📚',
                    'ru': 'Статьи 📚',
                    'en': 'Articles 📚',
                    'sa': 'مقالات 📚'
                }[lang], 'articles')]
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
}
// Обработчик выбора "Исследование"
bot.action('research', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'research';
    ctx.session.lastMessageId = ctx.update.callback_query.message.message_id;

    await researchMessageBuilder(ctx);
});
// Построитель сообщения исследования
async function researchMessageBuilder(ctx) {
    const lang = ctx.session.lang || 'uz';

    const bigtexts = {
        'uz': "Assalomu alaykum, 🔎Checking Cryptocurrency botiga hush kelibsiz! \n\nBiz SharLife, CryptoHalol va CryptoIslam ma'muriyatlari fatvosiga tayanamiz. Ushbu botda kriptovalyutalar bo'yicha ma'lumotlar ham yuqoridagi manbalardan olinadi. Nima uchun biz aynan shu manbalarni tanladik? \n\n<a href='https://telegra.ph/About-us---SharLife-06-22'>📌Ustaz Ahmad Fawwaz</a> \n\nUstoz Ahmad Fawwaz Sharlife Shariat qo'mitasi raisi, u shariat bo'yicha sertifikatlangan maslahatchi va Islom moliya institutlarining buxgalteriya hisobi va audit tashkiloti (AAOIFI) auditoridir. Shariat bo'yicha tajribaga ega Ahmad Fauvaz ustoz Malayziya bo'ylab turli Islom moliya institutlari va davlat diniy idoralari xodimlari uchun treninglar o'tkazadi. Uning ta'siri mahalliy radio va televizion stantsiyalarga taalluqlidir, u yerda u tez-tez fiqh va usulul-fiqh (Islom huquqshunosligi) bo'yicha bilimlarini baham ko'radi. \n\n<a href='https://telegra.ph/DoktorMuhammadAbuJazar-06-23'>📌Doktor Muhammad Abu Jazar qo'mitasi</a> \nCryptoHalal - kriptovalyuta sohasida eng birinchi qo'mita hisoblanadi, u doktor Muhammad Abu Jazar tomonidan asos solingan. \n\n📋SharLife va CryptoHalal \nSharlife va CryptoHalal kriptovalyutalar hukmini tekshirish algoritmi juda o'hshash, lekin orada bir kriptovalyuta bo'yicha birida halol ikkinchisida harom degan fatvoni uchratishimiz mumkin. Oxirgi vaqtlarda G'azoda bo'layotgan hodisalar tufayli CryptoHalal o'z faoliyatini qisman to'htatgan, shuning uchun ba'zi kriptovalyutalar bo'yicha ma'lumotlar yangilanmagan bo'lishi mumkin. Biz ushbu holatda kriptovalyutalar bo'yicha chiqqan eng oxirgi fatvoni olishingizni tavsiya etamiz. \n\n<a href='https://telegra.ph/CryptoIslam-06-23'>📌KriptoIslam haqida bu yerda batafsil ma'lumotga ega bo'ling: telegra.ph</a>",
        'ru': "Ассаляму алейкум, вас приветствует команда проекта 🔎Checking Cryptocurrency. \n\nМы опираемся на фетвы от Шарлайф, Криптохаляль и КриптоИслам. В данном боте информация о монетах также собрана из этих источников. \n\nПочему мы выбрали именно эти источники? \n\n<a href='https://telegra.ph/About-us---SharLife-06-22'>📌Ustaz Ahmad Fawwaz</a> \nПредседатель шариатского комитета Шарлайф, он является сертифицированным консультантом по шариату и аудитором Организации бухгалтерского учета и аудита исламских финансовых институтов (AAOIFI). Устаз Ахмад Фауваз, имеющий опыт работы в области шариата, проводит обучение для сотрудников различных исламских финансовых учреждений и государственных религиозных органов по всей Малайзии. Его влияние распространяется на местные радио- и телевизионные станции, где он часто делится знаниями по фикху и усул фикху (исламской юриспруденции). \n\n<a href='https://telegra.ph/HalalCrypto-06-23'>📌Комитет Доктор Мухаммад Абу Джазара</a> \n\nCryptoHalal — это самый первый комитет в сфере криптовалют, основанный доктором Мухаммадом Абу Джазаром. \n\n📋Шарлайф и CryptoHalal Алгоритмы проверки монет Шарлайф и Криптохаляль схожи, но иногда одна и та же монета может быть признана дозволенной в одном комитете и харамной в другом. Из-за последних событий в Газе Криптохаляль приостановил свою деятельность, поэтому некоторые их данные могут быть не обновлены. Рекомендуем брать более последние фетвы по монетам. \n\n<a href='https://telegra.ph/CryptoIslam-06-23'>📌О КриптоИсламе читайте здесь подробнее: telegra.ph</a>",
        'en': "Assalamu alaikum, you are welcomed by the 🔎Checking Cryptocurrency project team. \n\nWe rely on fatwas from Sharlife, Crypto Halal and CryptoIslam. In this bot, information about coins is also collected from these sources. \n\nWhy did we choose these particular sources? \n\n📌<a href='https://telegra.ph/About-us---SharLife-06-22'>Ustaz Agmad Fawwaz</a> \nThe Chairman of the Sharia Sharia Committee, he is a certified Sharia consultant and auditor of the Organization of Accounting and Auditing of Islamic Financial Institutions (AAOIFI). Ustaz Ahmad Fauwaz, who has experience in the field of Sharia, conducts training for employees of various Islamic financial institutions and state religious bodies throughout Malaysia. His influence extends to local radio and television stations, where he often shares knowledge on Fiqh and usul Fiqh (Islamic jurisprudence). \n📌<a href='https://telegra.ph/Dr-Mohammad-AboDjazar-06-23'>The Committee of Dr. Muhammad Abu Jazar</a> \nCryptoHalal is the very first committee in the field of cryptocurrencies, founded by Dr. Muhammad Abu Jazar. \n\n📋Sharlife and CryptoHalal The algorithms for checking the coins of Sharlife and Cryptohalal are similar, but sometimes the same coin can be recognized as permissible in one committee and illegal in another. Due to the recent events in Gaza, Crypto Halal has suspended its activities, so some of their data may not be updated. We recommend taking more recent fatwas on coins. \n\n<a href='https://telegra.ph/CryptoIslam-06-23-2'>📌Read more about CryptoIslam here: telegra.ph</a>",
        'sa': "السلام عليكم ورحمة الله وبركاته، نرحب بكم في فريق مشروع 🔎 Checking Cryptocurrency.  \n\nنحن نعتمد على فتاوى من Sharlife و Crypto Halal و CryptoIslam. في هذا البوت، يتم أيضًا جمع معلومات حول العملات من هذه المصادر. \n\n لماذا اخترنا هذه المصادر بالتحديد؟ \n\n📌<a href='https://telegra.ph/About-us---SharLife-06-22'>Ustaz Agmad Fawwaz</a> \nرئيس لجنة الشريعة، وهو مستشار شرعي معتمد ومدقق حسابات لدى هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI). الأستاذ أحمد فواز، الذي يتمتع بخبرة في مجال الشريعة، يدير تدريبًا لموظفي المؤسسات المالية الإسلامية المختلفة والهيئات الدينية الحكومية في جميع أنحاء ماليزيا. ويمتد تأثيره إلى محطات الإذاعة والتلفزيون المحلية، حيث يشارك غالبًا المعرفة حول الفقه وأصول الفقه (الفقه الإسلامي). \n📌<a href='https://telegra.ph/Dr-Mohammad-AboDjazar-06-23'>The Committee of Dr. Muhammad Abu Jazar</a> \nكريبتو حلال هي أول لجنة في مجال العملات المشفرة، أسسها الدكتور محمد أبو جزر. \n📋Sharlife وCryptoHalal إن خوارزميات التحقق من عملات Sharlife وCryptoHalal متشابهة، ولكن في بعض الأحيان يمكن اعتبار نفس العملة مسموح بها في لجنة وغير قانونية في لجنة أخرى. وبسبب الأحداث الأخيرة في غزة، أوقفت CryptoHalal أنشطتها، لذا قد لا يتم تحديث بعض بياناتها. نوصي بأخذ فتاوى أحدث بشأن العملات. \n\n<a href='https://telegra.ph/CryptoIslam-06-23-2'>📌Read more about CryptoIslam here: telegra.ph</a>",
    }
    const bigtext = bigtexts[lang];

    // Define the inline keyboard markup based on the language
    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    try {
        await ctx.replyWithHTML(bigtext)
        // Send the message with the inline keyboard
        await ctx.reply(
            {
                'uz': "🤖 Botga siz izlamoqchi bo'lgan token tikerini yozing \n✅ Misol uchun: \n🔸 Bitcoin - tikeri esa: BTC",
                'ru': "🤖 Введите тикер токена, который вы хотите найти в боте. \n✅ Например: \n🔸 Bitcoin - тикер: BTC",
                'en': "🤖 Write the Token ticker you are looking for on the bot. \n✅ For example: \n🔸 Bitcoin - ticker: BTC",
                'sa': "🤖 أدخل شريط الرمز المميز الذي تريد العثور عليه في الروبوت.  \n✅ على سبيل المثال: \n🔸 Bitcoin - بيتكوين شريط: BTC"
            }[lang], Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'home')],
            ])
        );
    } catch (error) {
        console.log('Error while start finding coins', error);
    }
}
// Обработчик выбора "Исследование"
bot.action('articles', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'articles';
    ctx.session.lastMessageId = ctx.update.callback_query.message.message_id;

    await articlesMessageBuilder(ctx);
});
// Построитель сообщения исследования
async function articlesMessageBuilder(ctx) {
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    try {
        await ctx.editMessageText(
            {
                'uz': '🔘 Ўзингизга керакли мақолани ўқиш учун мавзу тугмасига босинг:',
                'ru': '🔘 Чтобы прочитать нужную вам статью, нажмите на кнопку с темой:',
                'en': 'Articles 📚',
                'sa': 'مقالات 📚'
            }[lang],
            Markup.inlineKeyboard([
                [Markup.button.callback({
                    'uz': 'Арбитраж ҳалолми?',
                    'ru': 'Арбитраж халяль?',
                    'en': '',
                    'sa': ''
                }[lang], 'arbitraj')],
                [Markup.button.callback({
                    'uz': 'Ҳамкорлик криптовалюта хукмига таъсир қиладими?',
                    'ru': 'Партнёрства и шариатский статус монет',
                    'en': '',
                    'sa': ''
                }[lang], 'partner')],
                [Markup.button.callback({
                    'uz': 'Маржинал савдо ва фьючерслар ҳалолми?',
                    'ru': 'Маржинальная торговля и фьючерсы халяль?',
                    'en': '',
                    'sa': ''
                }[lang], 'feature')],
                [Markup.button.callback({
                    'uz': 'Мем-токенлардан эҳтиёт бўлинг',
                    'ru': 'Избегайте мем-монет',
                    'en': '',
                    'sa': ''
                }[lang], 'memtokens')],
                [Markup.button.callback({
                    'uz': 'Аирдроп ҳалолми?',
                    'ru': 'Аирдроп халяль?',
                    'en': '',
                    'sa': ''
                }[lang], 'airdrop')],
                [Markup.button.callback({
                    'uz': 'PoS ва бошқа стейкинг турлари',
                    'ru': 'PoS и другие виды стейкинга',
                    'en': '',
                    'sa': ''
                }[lang], 'pos')],
                [Markup.button.callback({
                    'uz': 'Рақамли валюталардаги закот',
                    'ru': 'Закят в цифровом мире',
                    'en': '',
                    'sa': ''
                }[lang], 'zakot')],
                [Markup.button.callback({
                    'uz': 'Олтин — Ислом валютасими?',
                    'ru': 'Золото как валюта Ислама',
                    'en': '',
                    'sa': ''
                }[lang], 'oltin')],
                [Markup.button.callback({
                    'uz': 'T2E ўйинлари ҳукми',
                    'ru': 'T2E-тапалки и шариат',
                    'en': '',
                    'sa': ''
                }[lang], 't2egame')],
                [Markup.button.callback({
                    'uz': 'Бойкот рўйхатидаги криптовалюталар',
                    'ru': 'Криптовалюты в бойкот-листе',
                    'en': '',
                    'sa': ''
                }[lang], 'baykot')],
                [Markup.button.callback({
                    'uz': 'Стейблкоинлар: барчаси ҳалолми?',
                    'ru': 'Стейблкоины: все ли дозволены?',
                    'en': '',
                    'sa': ''
                }[lang], 'stablekoins')],
                [Markup.button.callback({
                    'uz': 'Ҳаром криптовалюталардан сармояни тозалаш',
                    'ru': 'Очищение от харам-инвестиций',
                    'en': '',
                    'sa': ''
                }[lang], 'clearinvest')],
                [Markup.button.callback({
                    'uz': 'Мем-токенлар ҳалолми | Муфтий Фараз Адам',
                    'ru': 'Являются ли мем-токены халяльными | Муфти Фараз Адам',
                    'en': '',
                    'sa': ''
                }[lang], 'muftiyfazar')],
                [Markup.button.callback(buttonText, 'home')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }

    // const bigtexts = {
    //     'uz': "Арбитраж савдоси шаръий ҳукмига боғлиқ мақолани қўйидаги линк орқали ўқиб чиқинг: \nhttps://telegra.ph/Arbitrage-savdosining-shariy-hukmi-07-29",
    //     'ru': "Статья - о дозволенности арбитража криптовалют: \nhttps://telegra.ph/Article-on-the-halal-of-arbitrage-07-29",
    //     'en': "Check out the Sharlife article dedicated to the topic of arbitrage: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
    //     'sa': "اطلع على مقال شارلايف المخصص لموضوع التحكيم: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
    // }
    // const bigtexts2 = {
    //     'uz': "'Крипто-лойиҳалар орасидаги ҳамкорлик лойиҳанинг шубҳали бўлишига сабаб бўладими' номлик мақолани ўқиб чиқинг: \nhttps://telegra.ph/ArticleSharlifemyuz-09-03",
    //     'ru': "Ознакомьтесь со статьей о влиянии партнерств между криптопроектами на их соответствие халяльности: \nhttps://telegra.ph/ArticleSharlifemy-09-03",
    //     'en': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
    //     'sa': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
    // }
    // const bigtexts3 = {
    //     'uz': "'Нима учун фьючерс ва маржа савдолари ҳаром ҳисобланади' номли мақолани қўйидаги линк орқали ўқиб чиқишингиз мумкин: \nhttps://telegra.ph/Article2Sharlifemyuz-09-03",
    //     'ru': "Почему маржинальная торговля и торговля с использованием кредитного плеча считаются харам? \nhttps://telegra.ph/Article2sharlifemy-09-03",
    //     'en': "Why is Leverage and Margin Trading Considered Haram? \nhttps://sharlife.my/article/content/why-is-leverage-and-margin-trading-considered-haram",
    //     'sa': "Why is Leverage and Margin Trading Considered Haram? \nhttps://sharlife.my/article/content/why-is-leverage-and-margin-trading-considered-haram",
    // }
    // const bigtexts4 = {
    //     'uz': "Мем-токенларни Сотиб Олишдан Эҳтиёт бўлинг \nhttps://telegra.ph/Avoid-Buying-Meme-Coins---SharLifemy-09-03",
    //     'ru': "Избегайте Покупки Мем-монет \nhttp://www.telegra.ph/Hukm-mem-koinov-Sharlife-07-08",
    //     'en': "Avoid Buying Meme Coins \nhttps://sharlife.my/article/content/avoid-buying-meme-coins",
    //     'sa': "Avoid Buying Meme Coins \nhttps://sharlife.my/article/content/avoid-buying-meme-coins",
    // }
    // const bigtexts5 = {
    //     'uz': "Криптовалюта аирдропи ҳалолми? \nhttps://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-08-09",
    //     'ru': "Является ли раздача криптовалюты халяльной? (Аирдропы) \nhttps://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-07-29",
    //     'en': "Is Cryptocurrency Airdrop Halal? \nhttps://sharlife.my/article/content/is-cryptocurrency-airdrop-halal",
    //     'sa': "Is Cryptocurrency Airdrop Halal? \nhttps://sharlife.my/article/content/is-cryptocurrency-airdrop-halal",
    // }
    // const bigtext = bigtexts[lang];
    // const bigtext2 = bigtexts2[lang];
    // const bigtext3 = bigtexts3[lang];
    // const bigtext4 = bigtexts4[lang];
    // const bigtext5 = bigtexts5[lang];

    // // Define the inline keyboard markup based on the language
    // const buttonLabels = {
    //     'uz': '🔙 Orqaga',
    //     'ru': '🔙 Назад',
    //     'en': '🔙 Back',
    //     'sa': '🔙 خلف',
    // };
    // const buttonText = buttonLabels[lang];

    // try {
    //     await ctx.replyWithHTML(bigtext)
    //     await ctx.replyWithHTML(bigtext2)
    //     await ctx.replyWithHTML(bigtext3)
    //     await ctx.replyWithHTML(bigtext4)
    //     await ctx.replyWithHTML(bigtext5)
    // } catch (error) {
    //     console.log('Error while showing article', error);
    // }
}
// Секшин по академии
bot.action('arbitraj', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'arbitraj';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];
    
    const bigtexts = {
        'uz': "Арбитраж савдоси шаръий ҳукмига боғлиқ мақолани қўйидаги линк орқали ўқиб чиқинг: \nhttps://telegra.ph/Arbitrage-savdosining-shariy-hukmi-07-29",
        'ru': "Статья - о дозволенности арбитража криптовалют: \nhttps://telegra.ph/Article-on-the-halal-of-arbitrage-07-29",
        'en': "Check out the Sharlife article dedicated to the topic of arbitrage: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
        'sa': "اطلع على مقال شارلايف المخصص لموضوع التحكيم: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
    }
    const bigtext = bigtexts[lang];
    try {
        // await ctx.replyWithHTML(bigtext);   
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
     
})
// Секшин по академии
bot.action('partner', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'partner';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "'Крипто-лойиҳалар орасидаги ҳамкорлик лойиҳанинг шубҳали бўлишига сабаб бўладими' номлик мақолани ўқиб чиқинг: \nhttps://telegra.ph/ArticleSharlifemyuz-09-03",
        'ru': "Ознакомьтесь со статьей о влиянии партнерств между криптопроектами на их соответствие халяльности: \nhttps://telegra.ph/ArticleSharlifemy-09-03",
        'en': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
        'sa': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('feature', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'feature';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://telegra.ph/Article2Sharlifemyuz-09-03",
        'ru': "https://telegra.ph/Article2sharlifemy-09-03",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('memtokens', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'memtokens';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://telegra.ph/Avoid-Buying-Meme-Coins---SharLifemy-09-03",
        'ru': "http://www.telegra.ph/Hukm-mem-koinov-Sharlife-07-08",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('airdrop', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'airdrop';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-08-09",
        'ru': "https://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-07-29",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('pos', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'pos';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/staking-halolmi",
        'ru': "https://teletype.in/@hukmcrypto_bot/SH-ANALYSE-OF-STAKING",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('zakot', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'zakot';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/zakat-on-cryptoassets",
        'ru': "https://teletype.in/@hukmcrypto_bot/zakat-on-cryptoassets",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('oltin', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'oltin';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/zoloto-valyuta-islama",
        'ru': "https://teletype.in/@hukmcrypto_bot/zoloto-valyuta-islama",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('t2egame', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 't2egame';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/sh-tap-to-earn",
        'ru': "https://teletype.in/@hukmcrypto_bot/sh-taptoearn",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('baykot', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'baykot';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/bNMAoIk4kQH",
        'ru': "https://teletype.in/@hukmcrypto_bot/cryptocurrencyisrael-invest-article",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('stablekoins', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'stablekoins';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/stablecoins-sharlife",
        'ru': "https://teletype.in/@hukmcrypto_bot/stablecoins-sharlife",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('clearinvest', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'clearinvest';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/Hbjv9cgzfbM",
        'ru': "https://teletype.in/@hukmcrypto_bot/perevodstatyish",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Секшин по академии
bot.action('muftiyfazar', async (ctx) => {
    const chatId = ctx.chat.id;
    ctx.session.route = 'muftiyfazar';
    const lang = ctx.session.lang || 'uz';

    const buttonLabels = {
        'uz': '🔙 Orqaga',
        'ru': '🔙 Назад',
        'en': '🔙 Back',
        'sa': '🔙 خلف',
    };
    const buttonText = buttonLabels[lang];

    const bigtexts2 = {
        'uz': "https://teletype.in/@hukmcrypto_bot/are-mem-tokens-uz",
        'ru': "https://teletype.in/@hukmcrypto_bot/arememetokens-halal",
        'en': "",
        'sa': "",
    }
    const bigtext = bigtexts2[lang];

    try {
        await ctx.editMessageText(
            bigtext,
            Markup.inlineKeyboard([
                [Markup.button.callback(buttonText, 'articles')],
            ])
        );
    } catch (error) {
        console.log('Error while slecting', error);
    }
})
// Обработчик возврата домой
bot.action('home', async (ctx) => {
    ctx.session.route = 'home';
    await homeMessageBuilder(ctx);
});
// Обработчик сообщений во время исследования
bot.on('text', async (ctx) => {
    let date = new Date()
    const chatId = ctx.chat.id;
    const lang = ctx.session.lang || 'uz';

    if (ctx.text == '/privacy') {
        await ctx.replyWithHTML('https://telegra.ph/privacy-bot-09-03');    
    }
    if (ctx.session.route === 'research') {
        const lang = ctx.session.lang || 'uz';
        const search = ctx.message.text.toLowerCase();
        
        const buttonLabels = {
            'uz': '🔙 Orqaga',
            'ru': '🔙 Назад',
            'en': '🔙 Back',
            'sa': '🔙 خلف',
        };
        const buttonText = buttonLabels[lang];

        // await ctx.deleteMessage();

        let coin = coins.find(c => c.ticker.toLowerCase() === search);

        const statusText = {
            'uz': {
                halal: '<b> HALOL</b> 🟢',
                haram: '<b> HAROM</b> 🔴',
                questionable: '<b> SHUBHALIK</b> 🟠'
            },
            'ru': {
                halal: '<b> ХАЛЯЛЬ</b> 🟢',
                haram: '<b> ХАРАМ</b> 🔴',
                questionable: '<b> СОМНИТЕЛЬНЫЙ</b> 🟠'
            },
            'en': {
                halal: '<b> HALAL</b> 🟢',
                haram: '<b> HARAM</b> 🔴',
                questionable: '<b> QUESTIONABLE</b> 🟠'
            },
            'sa': {
                halal: '<b> حلال </b> 🟢',
                haram: '<b> حرام</b> 🔴',
                questionable: '<b> مشكوك فيه</b> 🟠'
            }
        }[lang];

        // const date = new Date().toLocaleDateString('en-GB');
        const date = new Date().toLocaleDateString();

        const message = coin
            ? {
                'uz': `🌐 ${coin.project_name ? search.toUpperCase() + ' ' + coin.project_name : search.toUpperCase()} ${coin.description ? '\n\n' + coin.description : ''} \n\n${statusText[coin.shariah_status.toLowerCase()] == undefined ? coin.shariah_status : statusText[coin.shariah_status.toLowerCase()]} \n\n${coin.source && !coin.source.includes('t.me/CrypoIslam') && !coin.source.includes('@hukmcrypto_bot') ? 'Manba: ' + coin.source : '@hukmcrypto_bot'}`, 
                'ru': `🌐 ${coin.project_name ? search.toUpperCase() + ' ' + coin.project_name : search.toUpperCase()} ${coin.description ? '\n\n' + coin.description : ''} \n\n${statusText[coin.shariah_status.toLowerCase()] == undefined ? coin.shariah_status : statusText[coin.shariah_status.toLowerCase()]} \n\n${coin.source && !coin.source.includes('t.me/CrypoIslam') && !coin.source.includes('@hukmcrypto_bot') ? 'Источник: ' + coin.source : '@hukmcrypto_bot'}`,
                'en': `🌐 ${coin.project_name ? search.toUpperCase() + ' ' + coin.project_name : search.toUpperCase()} ${coin.description ? '\n\n' + coin.description : ''} \n\n${statusText[coin.shariah_status.toLowerCase()] == undefined ? coin.shariah_status : statusText[coin.shariah_status.toLowerCase()]} \n\n${coin.source && !coin.source.includes('t.me/CrypoIslam') && !coin.source.includes('@hukmcrypto_bot') ? 'Source: ' + coin.source : '@hukmcrypto_bot'}`,
                'sa': `🌐 ${coin.project_name ? search.toUpperCase() + ' ' + coin.project_name : search.toUpperCase()} ${coin.description ? '\n\n' + coin.description : ''} \n\n${statusText[coin.shariah_status.toLowerCase()] == undefined ? coin.shariah_status : statusText[coin.shariah_status.toLowerCase()]} \n\n${coin.source && !coin.source.includes('t.me/CrypoIslam') && !coin.source.includes('@hukmcrypto_bot') ? 'Source: ' + coin.source : '@hukmcrypto_bot'}`,
            }[lang]
            : {
                'uz': "🔘 Ushbu token haqida ma'lumot topilmadi. \nBiroz keyinroq tekshirib ko'ring. \n\n🤖 Botga siz izlamoqchi bo'lgan token tikerini yozing \n✅ Misol uchun: \n🔸 Bitcoin - BTC",
                'ru': "🔘 Информация о данной монете не найдена. \nПроверьте позже. \n\n🤖 Введите тикер токена, который вы хотите найти в боте. \n✅ Например: \n🔸 Bitcoin - BTC",
                'en': "🔘 No information found about this token. \nTry again later. \n\n🤖 Write the Token ticker you are looking for on the bot. \n✅ For example: \n🔸 Bitcoin - BTC",
                'sa': "🔘 لم يتم العثور على معلومات حول هذه العملة \nالتحقق مرة أخرى في وقت لاحق.  \n\n🤖  أرسل شريط الرمز المميز الذي تريد العثور عليه في الروبوت. \n(✅على سبيل المثال: 🔸Bitcoin - BTC )"
            }[lang];

        try {
            await ctx.replyWithHTML(message);
        } catch (error) {
            console.log('Error while getting result', error);
        }
    }

    // Функция для отправки сообщения с задержкой и обработкой ошибок
    async function sendMessage(user, botToken) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: user.chatId,
            parse_mode: "html",
            text: ctx.session.textforuser,
        };

        while (true) {
            try {
                await axios.post(url, payload);
                console.log('Сообщение отправлено:', user);
                break; // Выход из цикла, если запрос успешен
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.warn('Превышен лимит запросов. Ожидание перед повторной попыткой.');
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Ожидание 5 секунд
                } else {
                    console.error('Ошибка при отправке сообщения:', error);
                    break; // Выход из цикла при других ошибках
                }
            }
        }
    }
    // Функция для отправки сообщений с задержкой между запросами
    async function sendMessagesUz(usersJson) {
        const botToken = '7499671537:AAGi8ILE5ywAEIZ_uSLrFBlfPNuF9WRDbdw';
        for (const user of usersJson) {
            if (user.language == 'uz') {
                await sendMessage(user, botToken);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка 1 секунда между запросами
            }
        }
        await ctx.replyWithHTML('Barcha foydalanuvchilarga habar yuborildi!');    
    }    
    async function sendMessagesRu(usersJson) {
        const botToken = '7499671537:AAGi8ILE5ywAEIZ_uSLrFBlfPNuF9WRDbdw';
        for (const user of usersJson) {
            if (user.language == 'ru') {
                await sendMessage(user, botToken);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка 1 секунда между запросами
            }
        }
        await ctx.replyWithHTML('Сообщение отправлено всем пользователям!');    
    }    

    // Функция для отправки количество пользователей
    async function sendUsersCount(botToken, user) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: 5104139343,
            parse_mode: "html",
            text: user,
        };

        while (true) {
            try {
                await axios.post(url, payload);
                break; // Выход из цикла, если запрос успешен
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.warn('Превышен лимит запросов. Ожидание перед повторной попыткой.');
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Ожидание 5 секунд
                } else {
                    console.error('Ошибка при отправке сообщения:', error);
                    break; // Выход из цикла при других ошибках
                }
            }
        }
    }
    async function getUsers(usersJson) {
        const botToken = '7499671537:AAGi8ILE5ywAEIZ_uSLrFBlfPNuF9WRDbdw';
        for (const user of usersJson) {

            // отправит количество пользователя
            await sendUsersCount(botToken, user);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка 1 секунда между запросами

        }

        await ctx.replyWithHTML('Barcha foydalanuvchilarga habar yuborildi!');    
    }    
    // if (ctx.message.text === 'getusers') {
    //     getUsers(usersJson)
    // }
    

    if (!ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343 && ctx.session.statusAdmin == undefined) {
        await ctx.replyWithHTML(`Avval tilni tanlang`);    
    }
    if (ctx.message.text == 'senduz' && ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343 && ctx.session.statusAdmin == undefined) {
        ctx.session.statusAdmin = 'senduz'
        await ctx.replyWithHTML(`Textni kiriting:`);    
    } else if (ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343 && ctx.session.statusAdmin == 'senduz' && ctx.message.text != 'yes' && ctx.message.text != 'no') {
        ctx.session.statusAdmin = 'gettextuz'
        ctx.session.textforuser = ctx.message.text 
        await ctx.replyWithHTML(`Text quyidagi ko'rinishga ega:`);    
        await ctx.replyWithHTML(`${ctx.message.text}`);    
        await ctx.replyWithHTML(`Tasdiqlash uchun "yes" yoki "no" so'zini kiriting`);    
        isSendSmsTest = true
    }   
    if (ctx.message.text == 'sendru' && ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343 && ctx.session.statusAdmin == undefined) {
        ctx.session.statusAdmin = 'sendru'
        await ctx.replyWithHTML(`Введите текст:`);    
    } else if (ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343 && ctx.session.statusAdmin == 'sendru' && ctx.message.text != 'yes' && ctx.message.text != 'no') {
        ctx.session.statusAdmin = 'gettextru'
        ctx.session.textforuser = ctx.message.text 
        await ctx.replyWithHTML(`Текст выглядит так:`);    
        await ctx.replyWithHTML(`${ctx.message.text}`);    
        await ctx.replyWithHTML(`Введите «yes» или «no» для подтверждения`);    
        isSendSmsTest = true
    }   

    if (ctx.message.text == 'yes' && ctx.session.statusAdmin.includes('gettext') && ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343) {
        if (ctx.session.statusAdmin == 'gettextuz') {
            await ctx.replyWithHTML(`Quyidagi ko'rinishda jo'natildi: \n\n`);    
            await ctx.replyWithHTML(ctx.session.textforuser);  
            sendMessagesUz(usersJson)
        }
        if (ctx.session.statusAdmin == 'gettextru') {
            await ctx.replyWithHTML(`Отправлено как показано ниже: \n\n`);    
            await ctx.replyWithHTML(ctx.session.textforuser);  
            sendMessagesRu(usersJson)
        }
        ctx.session.statusAdmin = ''
    }    
    if (ctx.message.text == 'no' && ctx.session.statusAdmin.includes('gettext') && ctx.session.lang && ctx.session.route != 'research' && chatId == 5104139343) {
        ctx.session.statusAdmin = ''
        await ctx.replyWithHTML(`Bekor qilindi.`);    
    }    
    // if (+ctx.message.text == date.getMinutes() && ctx.session.route != 'research' && chatId == 5104139343) {
    //     sendMessages(usersJson);
    // }
});

module.exports = { bot }

// Запуск бота в режиме polling
bot.catch((e, ctx) => {
    console.log(e, ctx);
}).launch();