// Словарь только для английского. Русский берется из HTML.
const translations = {
    en: {
        badge: "RELEASE VERSION",
        hero_subtitle: "Simple and powerful Minecraft rig for Blender 4.2+.<br>Built for those who value speed and ease of setup.",
        pill_blender: "Blender:",
        pill_version: "Version:",
        pill_license: "License:",
        features_title: "Features",
        f1_t: "🚀 Optimization",
        f1_p: "Stable 60+ FPS. Perfect for complex scenes.",
        f2_t: "🔧 Flexibility",
        f2_p: "Alex Arms support and full facial shapekeys setup.",
        f3_t: "🧩 Extension",
        f3_p: "Drag-and-Drop installation directly into Blender.",
        rules_title: "Usage Rules",
        r1: "Free to use in any animations.",
        r2: "Modification for your specific tasks is allowed.",
        r3: "Attribution to author (Aspirata) is appreciated.",
        install_title: "Easy Installation",
        step1: "Download <b>just_rig.zip</b>.",
        step2: "Just drag and drop the file into Blender 4.2+.",
        step3: "Press <b>Shift + A</b> → <b>Just Rig</b>.",
        download_title: "Ready to start?",
        btn_download: "DOWNLOAD RIG",
        nav: ["Home", "Features", "Rules", "Install", "Download"]
    },
    ru: {
        nav: ["Главная", "Фичи", "Правила", "Установка", "Скачать"]
    }
};

// Объект для хранения оригинального русского текста
let originalRU = {};

function setLang(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (lang === 'en') {
            el.innerHTML = translations.en[key];
        } else {
            el.innerHTML = originalRU[key];
        }
    });

    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, i) => dot.setAttribute('data-label', translations[lang].nav[i]));
}

// Плавный скролл при клике на точки
document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-section');
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});

window.onload = () => {
    // Сохраняем исходный русский текст из HTML
    document.querySelectorAll('[data-key]').forEach(el => {
        originalRU[el.getAttribute('data-key')] = el.innerHTML;
    });

    const savedLang = localStorage.getItem('preferredLang') || 'ru';
    setLang(savedLang);
};

// Обновление навигации и Хэша в URL
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navDots = document.querySelectorAll('.nav-dot');
    let closestSectionId = "";
    let minDistance = Infinity;
    const viewportCenter = window.scrollY + (window.innerHeight / 2);

    sections.forEach(section => {
        const sectionMidPoint = section.offsetTop + (section.offsetHeight / 2);
        const distance = Math.abs(viewportCenter - sectionMidPoint);
        if (distance < minDistance) {
            minDistance = distance;
            closestSectionId = section.getAttribute('id');
        }
    });

    navDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('data-section') === closestSectionId) {
            dot.classList.add('active');
            // Обновляем URL без перезагрузки и лишних прыжков
            if (window.location.hash !== `#${closestSectionId}`) {
                history.replaceState(null, null, `#${closestSectionId}`);
            }
        }
    });
});