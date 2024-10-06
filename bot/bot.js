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

    const bigtexts = {
        'uz': "Арбитраж савдоси шаръий ҳукмига боғлиқ мақолани қўйидаги линк орқали ўқиб чиқинг: \nhttps://telegra.ph/Arbitrage-savdosining-shariy-hukmi-07-29",
        'ru': "Статья - о дозволенности арбитража криптовалют: \nhttps://telegra.ph/Article-on-the-halal-of-arbitrage-07-29",
        'en': "Check out the Sharlife article dedicated to the topic of arbitrage: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
        'sa': "اطلع على مقال شارلايف المخصص لموضوع التحكيم: \nhttps://sharlife.my/article/content/is-arbitrage-trading-halal ",
    }
    const bigtexts2 = {
        'uz': "'Крипто-лойиҳалар орасидаги ҳамкорлик лойиҳанинг шубҳали бўлишига сабаб бўладими' номлик мақолани ўқиб чиқинг: \nhttps://telegra.ph/ArticleSharlifemyuz-09-03",
        'ru': "Ознакомьтесь со статьей о влиянии партнерств между криптопроектами на их соответствие халяльности: \nhttps://telegra.ph/ArticleSharlifemy-09-03",
        'en': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
        'sa': "Read the article about the impact of partnerships between crypto projects on their compliance with halal principles: \nhttps://sharlife.my/article/content/How_Halal_and_Haram_Crypto_Partnerships_Affect_Shariah_Compliance",
    }
    const bigtexts3 = {
        'uz': "'Нима учун фьючерс ва маржа савдолари ҳаром ҳисобланади' номли мақолани қўйидаги линк орқали ўқиб чиқишингиз мумкин: \nhttps://telegra.ph/Article2Sharlifemyuz-09-03",
        'ru': "Почему маржинальная торговля и торговля с использованием кредитного плеча считаются харам? \nhttps://telegra.ph/Article2sharlifemy-09-03",
        'en': "Why is Leverage and Margin Trading Considered Haram? \nhttps://sharlife.my/article/content/why-is-leverage-and-margin-trading-considered-haram",
        'sa': "Why is Leverage and Margin Trading Considered Haram? \nhttps://sharlife.my/article/content/why-is-leverage-and-margin-trading-considered-haram",
    }
    const bigtexts4 = {
        'uz': "Мем-токенларни Сотиб Олишдан Эҳтиёт бўлинг \nhttps://telegra.ph/Avoid-Buying-Meme-Coins---SharLifemy-09-03",
        'ru': "Избегайте Покупки Мем-монет \nhttp://www.telegra.ph/Hukm-mem-koinov-Sharlife-07-08",
        'en': "Avoid Buying Meme Coins \nhttps://sharlife.my/article/content/avoid-buying-meme-coins",
        'sa': "Avoid Buying Meme Coins \nhttps://sharlife.my/article/content/avoid-buying-meme-coins",
    }
    const bigtexts5 = {
        'uz': "Криптовалюта аирдропи ҳалолми? \nhttps://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-08-09",
        'ru': "Является ли раздача криптовалюты халяльной? (Аирдропы) \nhttps://telegra.ph/Is-Cryptocurrency-Airdrop-Halal-07-29",
        'en': "Is Cryptocurrency Airdrop Halal? \nhttps://sharlife.my/article/content/is-cryptocurrency-airdrop-halal",
        'sa': "Is Cryptocurrency Airdrop Halal? \nhttps://sharlife.my/article/content/is-cryptocurrency-airdrop-halal",
    }
    const bigtext = bigtexts[lang];
    const bigtext2 = bigtexts2[lang];
    const bigtext3 = bigtexts3[lang];
    const bigtext4 = bigtexts4[lang];
    const bigtext5 = bigtexts5[lang];

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
        await ctx.replyWithHTML(bigtext2)
        await ctx.replyWithHTML(bigtext3)
        await ctx.replyWithHTML(bigtext4)
        await ctx.replyWithHTML(bigtext5)
    } catch (error) {
        console.log('Error while showing article', error);
    }
}
// Обработчик возврата домой
bot.action('home', async (ctx) => {
    ctx.session.route = 'home';
    await homeMessageBuilder(ctx);
});
// Обработчик сообщений во время исследования
bot.on('text', async (ctx) => {
    let date = new Date()
    const chatId = ctx.chat.id;

    if (ctx.text == '/privacy') {
        await ctx.replyWithHTML('https://telegra.ph/privacy-bot-09-03');    
    }
    if (ctx.session.route === 'research') {
        const lang = ctx.session.lang || 'uz';
        const search = ctx.message.text.toLowerCase();

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
    async function sendMessage(user, botToken, message) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: user.chatId,
            parse_mode: "html",
            text: message,
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
    async function sendMessages(usersJson, messages) {
        const botToken = '7499671537:AAGi8ILE5ywAEIZ_uSLrFBlfPNuF9WRDbdw';
        for (const user of usersJson) {
            if (user.language == 'uz') {
                const messages1 = {
                    'uz': `السلام عليكم ورحمة الله وبركاته 
                            \nBizning bot sizga foyda keltirayotganidan va uni siz kriptotangalarni shar'iy hukmini tekshirish uchun ishlatayotganiningizdan hursadmiz. Alhamdulillah, bizning bot 3 oydan ko'proq ishlab kelmoqda va foydalanuvchilar soni 1000dan oshdi. 
                            \nBiz botni bir-necha marotaba yangiladik va kriptovalyutalarni shar'iy hukmini o'rganish uchun va umumiy tanishish uchun kerakli bo'lgan barcha materiallarni qo'shib kelmoqdamiz. 
                            \nBot ba'zi vaqtda javob yozmay qo'ysa /start tugmasini bosib yuboring yoki botni o'chirib, qaytadan ishga tushiring
                        `,
                    'ru': `السلام عليكم ورحمة الله وبركاته 
                            \nМы рады, что наш бот приносит вам пользу, и вы продолжаете использовать его для проверки шариатского статуса криптомонет. Альхамдулиллях, наш бот работает уже более трёх месяцев, и количество пользователей превысило 1000 человек.
                            \nМы несколько раз обновляли нашего бота и продолжаем добавлять все необходимые материалы для изучения шариатского статуса криптовалют, а также для общего изучения. 
                            \nЕсли бот перестаёт отвечать на ваши запросы, отправьте команду /start или перезапустите бота. Это восстановит его работу.
                        `,
                    'en': ``,
                    'sa': ``
                }[user.language]
                const messages2 = {
                    'uz': ` \nBiz shuningdek ixtilof mavzusida savollar olmoqdamiz — bir kriptovalyuta bo'yicha ulamolar ikki xil hukm chiqargan bo'lsalar, qaysi tarafga ergashishimiz kerak; umuman ushbu turdagi tokenlar bilan savdo qilmaslikmi yoki bir tarafni tanlashimiz kerakmi. 
                            \nBiz bu masalada biroq chuqurlashdik, lekin biz bir tarafni fatvo berishda xatoga yo'l qo'yishi mumkin deb ayta olmaymiz. Bu juda churu mavzu. Bot manbalarida bir ma'muriyat Xalqaro Islomiy akademiya fiqhi (UNA) usulida kriptovalyutalarni tekshirsa, boshqasi esa AAOIFI standartlariga rioya qilgan holda kriptovalyutalarni tekshiruvdan o'tkazadi. 
                            \nAgar siz oldin bir tarafni fatvosiga roiya qilgan bo'lsangiz va siz uchun ushbu ma'muriyat yaqinroq bo'lsa ushbu tarafda qolishingiz mumkin. Misol uchun, Rossiya, Qozoqiston va boshqa MDH davlatlarida AAOIFI fatvolari qo'llanilsa, arab davlatlarida esa Saud. Arabistoni, Aljir, Marokko, Tunisda ko'proq Xalqaro Islomiy Akademiya fiqhi (UNA) standarti/fatvolari tarqalgan 
                            \nSharlife doktori va mutahassislari AAOIFI'ga yaqinroq bo'lsa, CryptoHalal - UNA'ga yaqinroq hisoblanadi. 
                            \nBiz botga yangi kriptovalyuta shar'iy hukmini qo'shishdan oldin barcha manbani tekshirib chiqamiz, va orada birida shubhalik, keyingisida halol bo'lgan loyihalar bo'yicha so'raymiz va ular ma'lum bir standartga ko'ra ushbu fatvoni berishgan bo'lsa biz fatvo asoslari bilan chiqaramiz. Balki kelajakda bir kriptovalyuta avvaliga halol keyin harom bo'lishi mumkin - biz botdagi ma'lumotlarni o'zgartirishga harakat qilamiz, lekin aytganimizdek bir ma'muriyatda halol bo'lib, keyinroq ikkinchisida harom deb chiqsa biz quyidagi turdagi kriptovalyutalarni hukmini o'zgartirmasligimiz mumkin: 
                            \nUshbu ruyxatga birja tokenlari, o'yin tokenlari va ko'chirilgan tokenlar (ya'ni Wrapped BTC va shunga o'xshash). Ushbu turdagi kriptovalyutalar asosiy muammoasi sarmoya kiritishda investorlar uchun risk tug'dirishi mumkin, yana token orqasidagi jamoa tajribasiz bo'lishi sabab token shubhalik deb tan olinishi mumkin. Qolgan kriptovalyutalarda esa biz eng yangi fatvolarni e'tiborga olamiz, sababi kriptovalyuta dunyosida o'zgarishlar juda tez bo'lib turadi va bu loyiha tokenining shar'iy hukmi o'zgarishiga sabab bo'lishi mumkin.
                            \nUmid qilamizki, sizlarning savollaringizga to'g'ri javob bera oldik. 
                            \nAlloh bilguvchiroqdir. 
                            \n© Checking Cryptocurrency (@Hukmcrypto_bot)
                        `,
                    'ru': ` 
                            \nМы также получаем вопросы относительно ихтиляфа — ситуации, когда существуют два разных мнения по поводу одной криптовалюты, и какую позицию выбрать: вообще не торговать монетами, по которым есть ихтиляф, или же выбрать одну сторону. 
                            \nМы провели тщательное исследование по этой теме и не можем однозначно сказать, что одна из сторон допускает ошибки. Это очень глубокая тема. В нашей базе один комитет проверяет криптовалюты по стандартам Международной Исламской академии фикха (UNA), а другой комитет соблюдает стандарты AAOIFI. 
                            \nЕсли вы раньше придерживались фетв одной из сторон и это ближе вам по убеждениям, оставайтесь на этой стороне. Например, в России, Казахстане и других странах больше всего применяют фетвы AAOIFI. В арабских странах, таких как Саудовская Аравия, Алжир, Марокко, Тунис, больше распространены стандарты Международной Исламской академии фикха (UNA). 
                            \nДоктора и специалисты Sharlife ближе к AAOIFI, а CryptoHalal — к UNA. 
                            \nПеред добавлением шариатского статуса монеты мы проверяем все доступные ресурсы и уточняем, насколько некоторые сомнительные услуги проекта могут повлиять на общий хукм монеты. Если они ссылаются на стандарты вышеупомянутых организаций, мы добавляем шариатский статус этой монеты. Возможно, в будущем одна из организаций признает монету "недозволенной", и тогда мы либо изменим её шариатский статус, либо оставим его без изменений, если это связано с причинами, описанными ниже. 
                            \nК таким категориям монет относятся биржевые токены, игровые токены и завёрнутые токены, такие как Wrapped BTC и другие. Эти категории монет связаны с инвестиционными рисками (например, команда проекта может быть недоверенной или не иметь достаточного опыта, что может быть сомнительным с точки зрения Sharlife, в то время как другой комитет может не учитывать данную точку зрения). Мы также учитываем более новые фетвы по монетам, поскольку за 1-2 года проекты и услуги монет могут измениться, что может повлиять на их шариатский статус. 
                            \nНадеюсь, я правильно ответил на ваши вопросы об ихтиляфе.
                            \nА Аллах знает лучше.
                            \n© Checking Cryptocurrency (@Hukmcrypto_bot)
                        `,
                    'en': ``,
                    'sa': ``
                }[user.language]

                await sendMessage(user, botToken, messages1);
                await sendMessage(user, botToken, messages2);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка 1 секунда между запросами
            }
            if (user.language == 'ru') {
                const messages1 = {
                    'uz': `السلام عليكم ورحمة الله وبركاته 
                            \nBizning bot sizga foyda keltirayotganidan va uni siz kriptotangalarni shar'iy hukmini tekshirish uchun ishlatayotganiningizdan hursadmiz. Alhamdulillah, bizning bot 3 oydan ko'proq ishlab kelmoqda va foydalanuvchilar soni 1000dan oshdi. 
                            \nBiz botni bir-necha marotaba yangiladik va kriptovalyutalarni shar'iy hukmini o'rganish uchun va umumiy tanishish uchun kerakli bo'lgan barcha materiallarni qo'shib kelmoqdamiz. 
                            \nBot ba'zi vaqtda javob yozmay qo'ysa /start tugmasini bosib yuboring yoki botni o'chirib, qaytadan ishga tushiring
                        `,
                    'ru': `السلام عليكم ورحمة الله وبركاته 
                            \nМы рады, что наш бот приносит вам пользу, и вы продолжаете использовать его для проверки шариатского статуса криптомонет. Альхамдулиллях, наш бот работает уже более трёх месяцев, и количество пользователей превысило 1000 человек.
                            \nМы несколько раз обновляли нашего бота и продолжаем добавлять все необходимые материалы для изучения шариатского статуса криптовалют, а также для общего изучения. 
                            \nЕсли бот перестаёт отвечать на ваши запросы, отправьте команду /start или перезапустите бота. Это восстановит его работу.
                        `,
                    'en': ``,
                    'sa': ``
                }[user.language]
                const messages2 = {
                    'uz': ` \nBiz shuningdek ixtilof mavzusida savollar olmoqdamiz — bir kriptovalyuta bo'yicha ulamolar ikki xil hukm chiqargan bo'lsalar, qaysi tarafga ergashishimiz kerak; umuman ushbu turdagi tokenlar bilan savdo qilmaslikmi yoki bir tarafni tanlashimiz kerakmi. 
                            \nBiz bu masalada biroq chuqurlashdik, lekin biz bir tarafni fatvo berishda xatoga yo'l qo'yishi mumkin deb ayta olmaymiz. Bu juda churu mavzu. Bot manbalarida bir ma'muriyat Xalqaro Islomiy akademiya fiqhi (UNA) usulida kriptovalyutalarni tekshirsa, boshqasi esa AAOIFI standartlariga rioya qilgan holda kriptovalyutalarni tekshiruvdan o'tkazadi. 
                            \nAgar siz oldin bir tarafni fatvosiga roiya qilgan bo'lsangiz va siz uchun ushbu ma'muriyat yaqinroq bo'lsa ushbu tarafda qolishingiz mumkin. Misol uchun, Rossiya, Qozoqiston va boshqa MDH davlatlarida AAOIFI fatvolari qo'llanilsa, arab davlatlarida esa Saud. Arabistoni, Aljir, Marokko, Tunisda ko'proq Xalqaro Islomiy Akademiya fiqhi (UNA) standarti/fatvolari tarqalgan 
                            \nSharlife doktori va mutahassislari AAOIFI'ga yaqinroq bo'lsa, CryptoHalal - UNA'ga yaqinroq hisoblanadi. 
                            \nBiz botga yangi kriptovalyuta shar'iy hukmini qo'shishdan oldin barcha manbani tekshirib chiqamiz, va orada birida shubhalik, keyingisida halol bo'lgan loyihalar bo'yicha so'raymiz va ular ma'lum bir standartga ko'ra ushbu fatvoni berishgan bo'lsa biz fatvo asoslari bilan chiqaramiz. Balki kelajakda bir kriptovalyuta avvaliga halol keyin harom bo'lishi mumkin - biz botdagi ma'lumotlarni o'zgartirishga harakat qilamiz, lekin aytganimizdek bir ma'muriyatda halol bo'lib, keyinroq ikkinchisida harom deb chiqsa biz quyidagi turdagi kriptovalyutalarni hukmini o'zgartirmasligimiz mumkin: 
                            \nUshbu ruyxatga birja tokenlari, o'yin tokenlari va ko'chirilgan tokenlar (ya'ni Wrapped BTC va shunga o'xshash). Ushbu turdagi kriptovalyutalar asosiy muammoasi sarmoya kiritishda investorlar uchun risk tug'dirishi mumkin, yana token orqasidagi jamoa tajribasiz bo'lishi sabab token shubhalik deb tan olinishi mumkin. Qolgan kriptovalyutalarda esa biz eng yangi fatvolarni e'tiborga olamiz, sababi kriptovalyuta dunyosida o'zgarishlar juda tez bo'lib turadi va bu loyiha tokenining shar'iy hukmi o'zgarishiga sabab bo'lishi mumkin.
                            \nUmid qilamizki, sizlarning savollaringizga to'g'ri javob bera oldik. 
                            \nAlloh bilguvchiroqdir. 
                            \n© Checking Cryptocurrency (@Hukmcrypto_bot)
                        `,
                    'ru': ` 
                            \nМы также получаем вопросы относительно ихтиляфа — ситуации, когда существуют два разных мнения по поводу одной криптовалюты, и какую позицию выбрать: вообще не торговать монетами, по которым есть ихтиляф, или же выбрать одну сторону. 
                            \nМы провели тщательное исследование по этой теме и не можем однозначно сказать, что одна из сторон допускает ошибки. Это очень глубокая тема. В нашей базе один комитет проверяет криптовалюты по стандартам Международной Исламской академии фикха (UNA), а другой комитет соблюдает стандарты AAOIFI. 
                            \nЕсли вы раньше придерживались фетв одной из сторон и это ближе вам по убеждениям, оставайтесь на этой стороне. Например, в России, Казахстане и других странах больше всего применяют фетвы AAOIFI. В арабских странах, таких как Саудовская Аравия, Алжир, Марокко, Тунис, больше распространены стандарты Международной Исламской академии фикха (UNA). 
                            \nДоктора и специалисты Sharlife ближе к AAOIFI, а CryptoHalal — к UNA. 
                            \nПеред добавлением шариатского статуса монеты мы проверяем все доступные ресурсы и уточняем, насколько некоторые сомнительные услуги проекта могут повлиять на общий хукм монеты. Если они ссылаются на стандарты вышеупомянутых организаций, мы добавляем шариатский статус этой монеты. Возможно, в будущем одна из организаций признает монету "недозволенной", и тогда мы либо изменим её шариатский статус, либо оставим его без изменений, если это связано с причинами, описанными ниже. 
                            \nК таким категориям монет относятся биржевые токены, игровые токены и завёрнутые токены, такие как Wrapped BTC и другие. Эти категории монет связаны с инвестиционными рисками (например, команда проекта может быть недоверенной или не иметь достаточного опыта, что может быть сомнительным с точки зрения Sharlife, в то время как другой комитет может не учитывать данную точку зрения). Мы также учитываем более новые фетвы по монетам, поскольку за 1-2 года проекты и услуги монет могут измениться, что может повлиять на их шариатский статус. 
                            \nНадеюсь, я правильно ответил на ваши вопросы об ихтиляфе.
                            \nА Аллах знает лучше.
                            \n© Checking Cryptocurrency (@Hukmcrypto_bot)
                        `,
                    'en': ``,
                    'sa': ``
                }[user.language]

                await sendMessage(user, botToken, messages1);
                await sendMessage(user, botToken, messages2);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Задержка 1 секунда между запросами
            }
        }

        await ctx.replyWithHTML('Barcha foydalanuvchilarga habar yuborildi!');    
    }    
    if (ctx.message.text == 'send' && ctx.session.route != 'research' && chatId == 383213241) {
        await ctx.replyWithHTML(`Quyidagi raqamni kiriting: ${ date.getMinutes()}`);    
    }    
    if (+ctx.message.text == date.getMinutes() && ctx.session.route != 'research' && chatId == 383213241) {
        sendMessages(usersJson);
    }
});

// 5104139343

// 383213241

module.exports = { bot }

// Запуск бота в режиме polling
bot.catch((e, ctx) => {
    console.log(e, ctx);
}).launch();