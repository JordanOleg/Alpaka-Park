/* ===================================================================
   НАЛАШТУВАННЯ — усе, що зручно змінювати, зібрано тут.
   (Для WordPress: ці значення можна передати з PHP через
    wp_localize_script('alpaka-main', 'ALPAKA_CONFIG', [...]) — вони
    перекриють значення за замовчуванням.)
   =================================================================== */
const CONFIG = (() => {
    const user = window.ALPAKA_CONFIG || {};
    return {
        // Картинки для вікон «Детальніше» (розділ «Програми»)
        assets: Object.assign({
            family: 'src/family-oriented-formats.jpg',
            social: 'src/social-programs.jpg',
            education: 'src/educational-interaction.jpg'
        }, user.assets),
        // Карусель слайдів презентації
        carousel: Object.assign({
            autoplay: true,      // автогортання увімкнене при завантаженні
            autoplayMs: 5000     // ← ЧАС МІЖ СЛАЙДАМИ, мілісекунди (5000 = 5 секунд)
        }, user.carousel)
    };
})();
const assets = CONFIG.assets;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)]; let returnFocus = null;
function show(id) {
    returnFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    $('#' + id).showModal()
}

$$('[data-close]').forEach(b => b.onclick = () => $('#' + b.dataset.close).close());

$$('dialog').forEach(d => {
    d.addEventListener('close', () => {
        if (!document.querySelector('dialog[open]')) {
            document.body.style.overflow = '';
            returnFocus?.focus({ preventScroll: true })
        } if (d.id === 'request') $('#request-form').reset()
    });
    d.addEventListener('click', e => {
        const r = d.getBoundingClientRect();
        if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close()
    })
});

$('#menu').onclick = () => {
    let open = $('#navigation').classList.toggle('open');
    $('#menu').setAttribute('aria-expanded', open);
    $('#menu').setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню')
};
$$('#navigation a').forEach(a => a.onclick = () => {
    $('#navigation').classList.remove('open');
    $('#menu').setAttribute('aria-expanded', 'false');
    $('#menu').setAttribute('aria-label', 'Відкрити меню')
});
let context = '';

function request(title) {
    context = title;
    $('#request-form').reset();
    $('#form-error').hidden = true;
    $('#request-form').hidden = false;
    $('#success').hidden = true;
    $('#form-heading').hidden = false;
    $('#request-context').textContent = 'Ваш напрям: ' + title + '. Зараз це демонстрація сценарію, без надсилання даних.';
    $('#request-form').querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
    const opts = [...$('#direction').options];
    const match = opts.find(o => title.includes(o.textContent));
    if (match) $('#direction').value = match.value; show('request')
}
$$('[data-request]').forEach(b => b.onclick = () => request(b.dataset.request));
$('#request-form').onsubmit = e => {
    e.preventDefault();
    const form = $('#request-form');
    if (!form.checkValidity()) {
        const bad = [...form.elements].find(x => x.willValidate && !x.validity.valid);
        bad.setAttribute('aria-invalid', 'true');
        $('#form-error').textContent = bad.id === 'name' ? 'Будь ласка, вкажіть ваше ім’я.' : bad.id === 'email' ? 'Вкажіть коректну електронну пошту.' : 'Підтвердьте демонстраційний режим.';
        $('#form-error').hidden = false;
        bad.focus();
        return
    }
    form.hidden = true;
    $('#form-heading').hidden = true;
    $('#success').hidden = false; form.reset();
    $('#success button').focus()
};
$('#request-form').addEventListener('input', e => {
    e.target.removeAttribute('aria-invalid');
    $('#form-error').hidden = true
});
const audiences = [
    ['Спільний час. Нові відкриття.', 'Прогулянки, спостереження за тваринами, сімейні й освітні формати. Простір для спілкування та спільного досвіду дітей і батьків.',
        'Конкретні програми, вікові умови, тривалість і календар погоджуватимуться під час підготовки Центру.', 'Дізнатися про сімейні формати'],
    ['Умови, що допомагають долучитися.', 'Участь у спільному просторі з увагою до фізичних, інформаційних, сенсорних та інших індивідуальних потреб.',
        'Доступність закладається у проєктування. Готових маршрутів і підтверджених умов нового Центру наразі немає.', 'Обговорити умови участі'],
    ['Можливість спілкуватися разом.', 'Соціальні формати для ветеранів та їхніх родин у природному середовищі. Добровільна взаємодія та вибір дистанції.',
        'Центр не замінює психологічну, медичну чи реабілітаційну допомогу. Склад програми й фахівці погоджуються окремо.', 'Дізнатися про соціальний напрям'],
    ['Активність. Спілкування. Турбота.', 'Прогулянки, зустрічі та спостереження — можливості участі людей старшого віку у спільному житті громади.',
        'Умови відпочинку, маршрути та супровід потрібно передбачити у проєкті й уточнити до участі.', 'Уточнити можливі формати'],
    ['Відкрите місце для спільних ідей.', 'Освітні, громадські та партнерські формати з установами й організаціями. Соціальна модель поєднує потребу, аудиторію, формат і ресурси.',
        'Співпрацю, відповідальних, мету й спосіб оцінювання результатів визначаємо до старту програми.', 'Запропонувати співпрацю']];
let audience = 0;
function setAudience(i) {
    audience = i;
    $$('[data-audience]').forEach((b, j) => {
        b.setAttribute('aria-selected', i === j);
        b.tabIndex = i === j ? 0 : -1
    });
    $('#audience-panel').setAttribute('aria-labelledby', 'a' + i);
    $('#audience-title').textContent = audiences[i][0];
    $('#audience-copy').textContent = audiences[i][1];
    $('#audience-note').textContent = audiences[i][2];
    $('#audience-cta').textContent = audiences[i][3] + ' ↗'
}

$$('[data-audience]').forEach(b => b.onclick = () => setAudience(+b.dataset.audience));
$('#audience-cta').onclick = () => request(audiences[audience][3]);
function tabsKeys(selector, fn) {
    const bs = $$(selector);
    bs.forEach((b, i) => b.onkeydown = e => {
        let n; if (e.key === 'ArrowRight') n = (i + 1) % bs.length;
        if (e.key === 'ArrowLeft')
            n = (i + bs.length - 1) % bs.length;
        if (e.key === 'Home')
            n = 0;
        if (e.key === 'End')
            n = bs.length - 1;
        if (n !== undefined) {
            e.preventDefault();
            fn(n);
            bs[n].focus()
        }
    })
}
tabsKeys('[data-audience]', setAudience);
let detailContext = '';
function detail(title, body, label = 'Концепція', cta = true) {
    $('#detail-title').textContent = title;
    $('#detail-label').textContent = label;
    $('#detail-body').innerHTML = body;
    $('#detail-cta').hidden = !cta;
    detailContext = title; show('detail')
}

$('#detail-cta').onclick = () => {
    $('#detail').close();
    request(detailContext)
};
const programs = { family: ['Сімейні формати', 'Діти, батьки та родини', 'Прогулянки, спостереження та добровільна взаємодія. Власний темп і можливість зупинитися.', 'family'], social: ['Соціальні програми', 'Люди й групи, яким потрібні додаткові умови участі', 'Формат визначається відповідно до потреб учасників, умов, ресурсів і залучення профільних фахівців.', 'social'], education: ['Освітня взаємодія', 'Освітні заклади та громадські організації', 'Спостереження, знайомство з поведінкою тварин, природою, екологією та відповідальністю.', 'education'] };
$$('[data-program]').forEach(b => b.onclick = () => {
    const p = programs[b.dataset.program];
    detail(p[0], '<img src="' + assets[p[3]] + '" alt="Ілюстрація формату з презентації"><p>' + p[2] + '</p><ul><li>Для кого: ' + p[1] + '.</li><li>Тривалість, календар і склад програми: уточнюються.</li><li>Участь добровільна, контакт із твариною не обов’язковий.</li><li>Це напрям майбутньої роботи; запис ще не відкрито.</li></ul>', 'Програмний напрям')
});

const zones = [
    ['Вхідна та сервісна зона', 'Орієнтація, правила й початок маршруту. Планування й оснащення визначаються під час проєктування.'],
    ['Безбар’єрні маршрути', 'Прогулянкові маршрути мають враховувати фізичну доступність і можливість обрати комфортну дистанцію.'],
    ['Простір альпак', 'Утримання, спостереження й догляд за тваринами. Благополуччя тварин є умовою взаємодії.'], ['Контрольована взаємодія', 'Добровільний контакт у власному темпі та за правилами; можливість відмовитися від дотику.'],
    ['Освітній і програмний простір', 'Місце для навчальних, сімейних, соціальних і партнерських форматів. Місткість та програми уточнюються.'],
    ['Тиха зона та відпочинок', 'Можливість зробити паузу, відпочити та обрати рівень сенсорного навантаження.'],
    ['Ветеринарна та господарська інфраструктура', 'Догляд, ветеринарний супровід, господарські процеси й безпечна експлуатація простору.']
];
zones.forEach((z, i) => {
    const b = document.createElement('button');
    b.className = 'zone';
    b.dataset.zone = i;
    b.innerHTML = '<span>0' + (i + 1) + '</span><b>' + z[0] + '</b>↗';
    $('#zone-list').append(b)
});

$$('[data-zone]').forEach(b => b.onclick = () => {
    const i = +b.dataset.zone;
    detail(zones[i][0], '<p>' + zones[i][1] + '</p><p>Це функціональна зона з концепції, а не погоджена архітектурна схема. Розміщення й параметри уточнюються після визначення території.</p>', 'Зона 0' + (i + 1))
});

const phases = [
    ['Концепція сформована', 'Визначено соціальну модель та принципи взаємодії. Наступні рішення залежать від території й вихідних даних.'],
    ['Територія та правовий механізм', 'Спільно опрацювати варіанти локації, її придатність та можливий правовий формат використання. Це наступний крок за презентацією.'],
    ['Проєктування й ресурси', 'Архітектура, інженерія, кошторис і джерела фінансування. CAPEX, OPEX та строки формуються після визначення масштабу й території.'],
    ['Реалізація', 'Будівництво, формування команди, обладнання та запуск. Це майбутній етап; дата відкриття не визначена.']
];
$$('[data-phase]').forEach(b => b.onclick = () => {
    const i = +b.dataset.phase; detail(phases[i][0], '<p>' + phases[i][1] + '</p>', 'Етап 0' + (i + 1))
});
const partners = [
    ['Територія. Механізм. Координація.',
        'Пропонуємо місту спільно визначити шлях реалізації Центру. ГО бере на себе розвиток концепції, партнерств і організаційної моделі.',
        ['Опрацювання можливих варіантів території.', 'Визначення правового формату використання.', 'Взаємодія з профільними структурними підрозділами.'],
        'Територія та реалізація'],
    ['Підтримка конкретного напряму.', 'Корпоративні партнерства й CSR можуть допомогти з ресурсами, інфраструктурою та окремими соціальними ініціативами.',
        ['Погоджені цілі та конкретний напрям внеску.', 'Матеріали, обладнання, експертиза або фінансування.', 'Домовленості щодо звітності до старту співпраці.'],
        'Партнерство'],
    ['Цілі, ресурси та звітність.', 'Грантова й благодійна підтримка розглядається як частина моделі стійкості. Проєктне фінансування потребує деталізованого бюджету.',
        ['Соціальні та освітні напрями з конкретними цілями.', 'Бюджет і ресурси відповідно до етапу реалізації.', 'Погодження показників і регулярної звітності.'], 'Підтримка проєкту'], ['Програми у співпраці з фахівцями.', 'Освітні, соціальні та інші профільні організації допомагають формувати зміст програм і потрібні умови участі.',
        ['Потреба → аудиторія → формат → партнер → результат.', 'Чіткі ролі та професійні вимоги.', 'Оцінювання якості досвіду й доступності.'], 'Освітня взаємодія']
];

let partner = 0;
function setPartner(i) {
    partner = i;
    $$('[data-partner]').forEach((b, j) => {
        b.setAttribute('aria-selected', i === j);
        b.tabIndex = i === j ? 0 : -1
    });
    $('#partner-panel').setAttribute('aria-labelledby', 'p' + i);
    $('#partner-title').textContent = partners[i][0];
    $('#partner-copy').textContent = partners[i][1];
    $('#partner-list').replaceChildren();
    partners[i][2].forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        $('#partner-list').append(li)
    })
}
$$('[data-partner]').forEach(b => b.onclick = () => setPartner(+b.dataset.partner));
$('#partner-cta').onclick = () => request(partners[partner][3]);
tabsKeys('[data-partner]', setPartner);
setPartner(0);
const questions = [['Хто ви?', ['Родина', 'Людина з інвалідністю / родина', 'Ветеран / родина', 'Представник установи', 'Партнер / бізнес / фонд']], ['Що вас цікавить?', ['Сімейний досвід', 'Соціальні програми', 'Освітня взаємодія', 'Реалізація або підтримка']], ['З чого хочете почати?', ['Дізнатися про концепцію', 'Уточнити умови участі', 'Запропонувати співпрацю']]];
let step = 0, answers = [null, null, null], path = '';
function quizRoute(a) {
    if (a[1] === 3 || a[0] === 4)
        return 'Партнерство';
    if (a[1] === 2 || a[0] === 3)
        return 'Освітня взаємодія';
    if (a[1] === 1 || a[0] === 1 || a[0] === 2)
        return 'Соціальні програми';
    return 'Сімейні формати'
}
window.alpacaSite = { quizRoute };
function renderQuiz() {
    const done = step === 3;
    $('#quiz-step').textContent = done ? 'ВАШ НАПРЯМ' : `0${step + 1} / 03`;
    $('#progress-bar').style.width = (done ? 100 : (step + 1) / 3 * 100) + '%';
    $('.progress').setAttribute('aria-valuenow', done ? 3 : step + 1);
    $('#quiz-choices').hidden = done;
    $('#quiz-result').hidden = !done;
    $('#quiz-back').disabled = step === 0;
    $('#quiz-next').disabled = !done && answers[step] === null;
    if (done) {
        path = quizRoute(answers);
        $('#quiz-question').textContent = path;
        $('#quiz-result').replaceChildren();
        const p = document.createElement('p');
        p.textContent = answers[2] === 0 ? 'Почніть із презентації: вона допоможе зрозуміти концепцію та поточний етап.' : 'Наступний крок — обговорити ваш запит, потреби й можливості співпраці.';
        $('#quiz-result').append(p);
        const n = document.createElement('p');
        n.textContent = 'Це орієнтир для розмови, а не підтвердження доступності програми.';
        $('#quiz-result').append(n);
        $('#quiz-next').textContent = answers[2] === 0 ? 'Переглянути презентацію ↗' : 'Обговорити напрям ↗';
        $('#quiz-back').textContent = '← Змінити відповіді'
    }
    else {
        $('#quiz-question').textContent = questions[step][0];
        $('#quiz-choices').replaceChildren();
        questions[step][1].forEach((label, i) => {
            const b = document.createElement('button');
            b.className = 'choice';
            b.textContent = label;
            b.setAttribute('aria-pressed', answers[step] === i);
            b.onclick = () => {
                answers[step] = i;
                $$('.choice').forEach((x, j) => x.setAttribute('aria-pressed', j === i));
                $('#quiz-next').disabled = false
            }; $('#quiz-choices').append(b)
        });
        $('#quiz-next').textContent = step === 2 ? 'Мій напрям →' : 'Далі →';
        $('#quiz-back').textContent = '← Назад'
    }
}
$('#quiz-next').onclick = () => {
    if (step === 3) {
        if (answers[2] === 0)
            openSlide(1);
        else request(path);
        return
    }
    if (answers[step] !== null) {
        step++;
        renderQuiz()
    }
};
$('#quiz-back').onclick = () => {
    if (step > 0) {
        step--;
        renderQuiz()
    }
};
renderQuiz();
/* ------------------ Слайди: джерело правди — розмітка (#car-track) ------------------ */
const slideImgs = $$('#car-track img');
const slides = slideImgs.map(im => im.getAttribute('src'));
const slideTitles = slideImgs.map(im => im.alt.replace(/^Слайд \d+:\s*/, ''));
let currentSlide = 0;

/* ------------------------------- Карусель -------------------------------
   ПК:      стрілки ‹ › ; клік по слайду — пауза / відновлення автогортання.
   Мобільний (≤700px): тап по лівій третині — назад, по правій — вперед,
            по центру — пауза / відновлення. Свайп теж працює.
   --------------------------------------------------------------------- */
(function carousel() {
    const root = $('#carousel'), track = $('#car-track'), dotsBox = $('#car-dots'), status = $('#car-status');
    if (!root || !track) return;
    const slidesEls = [...track.children];
    const mobile = matchMedia('(max-width:700px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const attrMs = parseInt(root.dataset.autoplayMs, 10);           // data-autoplay-ms має пріоритет
    const intervalMs = attrMs > 0 ? attrMs : CONFIG.carousel.autoplayMs;
    let autoplay = !!CONFIG.carousel.autoplay && !reduced;          // «зменшити рух» → без автостарту
    let timer = null, inView = true, pending = null, pendingTimer = null, statusTimer = null;

    const behavior = () => reduced ? 'auto' : 'smooth';
    const stepPx = () => slidesEls.length > 1 ? slidesEls[1].offsetLeft - slidesEls[0].offsetLeft : track.clientWidth;
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const lastIndex = () => Math.max(0, Math.ceil(maxScroll() / stepPx() - 0.01));   // крайня позиція (по 1 слайду)

    function currentIndex() {
        if (track.scrollLeft >= maxScroll() - 2) return lastIndex();
        return Math.min(lastIndex(), Math.max(0, Math.round(track.scrollLeft / stepPx())))
    }
    const here = () => pending ?? currentIndex();

    function goIndex(i) {
        i = Math.max(0, Math.min(lastIndex(), i));
        pending = i; clearTimeout(pendingTimer); pendingTimer = setTimeout(() => pending = null, 800);
        track.scrollTo({ left: Math.min(i * stepPx(), maxScroll()), behavior: behavior() });
        updateUi(i);
        schedule()
    }
    function next() { const i = here(); goIndex(i >= lastIndex() ? 0 : i + 1) }
    function prev() { const i = here(); goIndex(i <= 0 ? lastIndex() : i - 1) }

    /* ---- автогортання ---- */
    function schedule() {
        clearTimeout(timer);
        if (autoplay && inView && !document.hidden) timer = setTimeout(next, intervalMs)
    }
    function say(text) {
        status.textContent = text; status.classList.add('show');
        clearTimeout(statusTimer); statusTimer = setTimeout(() => status.classList.remove('show'), 1200)
    }
    function toggleAutoplay() {
        autoplay = !autoplay;
        say(autoplay ? '▶  Автогортання' : '❚❚  Пауза');
        schedule()
    }

    /* ---- крапки: стрічка, активна — по центру, сусідні дрібніші й блідіші ---- */
    let dotEls = [], dotsTrack = null;
    function updateUi(forced) {
        const a = typeof forced === 'number' ? forced : here();
        dotsBox.style.setProperty('--active', a);
        dotEls.forEach((d, i) => {
            d.dataset.d = Math.min(Math.abs(i - a), 6);          // відстань від активної → розмір/прозорість у CSS
            if (i === a) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current')
        })
    }
    function buildDots() {
        dotsBox.replaceChildren();
        dotsTrack = document.createElement('div'); dotsTrack.className = 'car-dots-track';
        const n = lastIndex() + 1;
        dotEls = [];
        for (let i = 0; i < n; i++) {
            const d = document.createElement('button');
            d.type = 'button'; d.className = 'car-dot';
            d.setAttribute('aria-label', 'Слайд ' + (i + 1) + ' з ' + n);
            d.onclick = () => goIndex(i);
            dotEls.push(d); dotsTrack.append(d)
        }
        dotsBox.append(dotsTrack);
        updateUi()
    }

    /* ---- керування ---- */
    $('#car-prev').onclick = prev;
    $('#car-next').onclick = next;
    track.addEventListener('scroll', () => updateUi(), { passive: true });
    track.addEventListener('click', e => {
        const slide = e.target.closest('.car-slide');
        if (!slide) return;
        if (mobile.matches) {                       // мобільний: 3 зони
            const r = slide.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
            if (x < 1 / 3) prev(); else if (x > 2 / 3) next(); else toggleAutoplay()
        } else toggleAutoplay()                      // ПК: клік по слайду — пауза / відновлення
    });
    track.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next() }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAutoplay() }
    });
    // ручне гортання (свайп) перезапускає відлік 5 с
    let swipeT; track.addEventListener('scroll', () => { if (pending !== null) return; clearTimeout(swipeT); swipeT = setTimeout(schedule, 250) }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window)
        new IntersectionObserver(es => { inView = es[0].isIntersecting; schedule() }, { threshold: .3 }).observe(root);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { pending = null; buildDots() }, 150) });

    buildDots();
    schedule()
})();

function slideContent(i) {
    currentSlide = i;
    $('#slide-image').src = slides[i];
    $('#slide-image').alt = 'Слайд ' + (i + 1) + ': ' + slideTitles[i];
    $('#slide-title').textContent = slideTitles[i];
    $('#slide-count').textContent = (i + 1) + ' / ' + slides.length + ' · Оригінал презентації';
    $('#slide-prev').disabled = i === 0;
    $('#slide-next').disabled = i === slides.length - 1
}
function openSlide(i) {
    slideContent(i); show('lightbox')
}
$$('[data-slide]').forEach(b => b.onclick = () => openSlide(+b.dataset.slide));
$('#slide-prev').onclick = () => {
    if (currentSlide > 0) slideContent(currentSlide - 1)
};
$('#slide-next').onclick = () => {
    if (currentSlide < slides.length - 1)
        slideContent(currentSlide + 1)
};
$('#lightbox').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && currentSlide > 0) {
        e.preventDefault();
        slideContent(currentSlide - 1)
    }
    if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        e.preventDefault();
        slideContent(currentSlide + 1)
    }
});

const info = {
    welfare: ['Людина. Тварина. Середовище.', '<p>У концепції безпека й добробут людей і тварин взаємопов’язані.</p><ul><li>Людина: добровільність, вибір дистанції, адаптація формату та підготовлений персонал.</li><li>Тварина: ветеринарний супровід, обмеження тривалості й інтенсивності контакту, зони відпочинку.</li><li>Тварина може відійти або не взаємодіяти.</li></ul><p>Ці принципи потребують конкретних правил, відповідальних фахівців і організації роботи до запуску.</p>', true],
    privacy: ['Приватність у прототипі', '<p>Цей автономний файл не надсилає дані на сервер, не використовує зовнішні шрифти, аналітику чи мережеві фотографії. Дані форми очищуються після демопідтвердження або закриття.</p><p>Для публічного сайту потрібно додати робочі контакти й погоджену політику обробки даних.</p>', false],
    accessibility: ['Доступність сайту', '<p>Передбачено нативні кнопки, видимий фокус, клавіатурні вкладки, labels, перевірку полів, нативні діалоги та текстовий дубль усіх зон. Зменшення руху враховує налаштування користувача.</p><p>Повна відповідність WCAG не сертифікована. Потрібні перевірки на реальних пристроях та зі скринридером. Слайди доступні як оригінальні зображення; основні положення переписані в текстових розділах сайту.</p>', false]
};
$$('[data-detail]').forEach(b => b.onclick = () => {
    const t = info[b.dataset.detail]; detail(t[0], t[1], 'Інформація', t[2])
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('seen');
            observer.unobserve(e.target)
        }
    }),
        { threshold: .08 });
    $$('.head,.intro,.split,.cta').forEach(el => {
        el.classList.add('reveal'); observer.observe(el)
    })
}