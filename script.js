const translations = {
    en: {
        // Navigation
        nav_home: "Home",
        nav_features: "Features",
        nav_rules: "Rules",
        nav_download: "Download",
        nav_install: "Install",

        // Hero
        hero_subtitle: "Simple and modern Minecraft Rig for Blender 4.2+",
        pill_version: "Latest Version: ",

        // Features
        features_title: "Features",
        f1_t: "Math-Based Shader",
        f1_p: "Modular face shader built entirely on math nodes, allowing for easy modification.",
        f2_t: "Extension (Addon)",
        f2_p: "The extension allows you to add Just Simple Rig to your scene in a couple of clicks, with all settings in one place.",
        f3_t: "Solid Mode Support",
        f3_p: "The face renders correctly in Solid Mode (Workbench), allowing for lag-free animation without losing convenience.",
        f5_t: "Optimization",
        f5_p: "On r7 5700x: 150-165 fps in Solid Mode, 85-100 fps in Shading Mode.<br>On i5 12400F: 110-125 fps in Solid Mode, 55-75 fps in Shading Mode.",

        // Rules
        rules_title: "Usage Rules",
        license_description: "The rig is licensed under <a href='https://github.com/Aspirata/Just-Simple-Rig/blob/Beta/LICENSE' target='_blank' class='license-link'>CC BY</a>",
        rules_allowed: "Allowed",
        rules_restricted: "Important",
        r1: "Free to use in any animations (including commercial ones).",
        r2: "You are allowed to modify and fork the rig for your specific needs.",
        r3: "When publishing projects using the rig (animations, forks), you must credit the author (Aspirata). Exception: static artworks/renders do not require credit.",

        // Download
        download_title: "Ready to start?",
        download_sub: "Click the button below to download the rig archive.",
        btn_download: "DOWNLOAD JUST SIMPLE RIG",

        // Install
        install_title: "Installation",
        install_step1_desc: "Open Blender 4.2+ and simply drag and drop the file into the 3D Viewport.",
        install_step2_title: "Add Rig",
        install_step2_desc: "Press <b>Shift + A</b>, navigate to <b>Just Simple Rig</b> and add the character.",
        install_step3_title: "Done!",
        install_step3_desc: "Everything is ready! What else is there to say ?",
        
        // Controls / Footer
        btn_prev: "← Back",
        btn_next: "Next →",
        credits_text: "Created by Aspirata with the big help from Gemini 3 Pro <br> <a href='https://github.com/Aspirata/Just-Simple-Rig/tree/Website' target='_blank' class='license-link'>Hosting on GitHub</a>"
    }
};

// Объект для хранения оригинального (русского) текста из HTML
const originalText = {};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Сохраняем исходный текст (RU) из HTML в память
    document.querySelectorAll('[data-key]').forEach(el => {
        originalText[el.getAttribute('data-key')] = el.innerHTML;
    });

    // Сохраняем исходные лейблы навигации
    document.querySelectorAll('.nav-dot').forEach(dot => {
        const section = dot.getAttribute('data-section');
        originalText[`nav_${section}`] = dot.getAttribute('data-label');
    });

    // 2. Инициализация языка
    let savedLang = localStorage.getItem('preferredLang');

    // Если язык не сохранен (первое посещение), определяем по браузеру
    if (!savedLang) {
        const browserLang = navigator.language || navigator.userLanguage;
        // Проверяем, начинается ли язык браузера с 'en' (en, en-US, en-GB и т.д.)
        savedLang = browserLang.toLowerCase().startsWith('en') ? 'en' : 'ru';
        localStorage.setItem('preferredLang', savedLang);
    }

    // Применяем сохраненный или определенный язык
    if (savedLang === 'en') {
        applyLanguage('en');
    }
    // 3. Обработчик переключателя
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        // Синхронизируем визуальное состояние кнопки при загрузке
        if (savedLang === 'en') langSwitch.classList.add('en-mode');

        langSwitch.addEventListener('click', () => {
            const isCurrentlyEn = langSwitch.classList.contains('en-mode');
            applyLanguage(isCurrentlyEn ? 'ru' : 'en');
        });
    }

    // 4. Анимация появления (Scroll Reveal)
    setupScrollReveal();

    // 5. Логика карусели
    setupCarousel();

    // 6. Навигация по точкам
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const id = dot.getAttribute('data-section');
            const section = document.getElementById(id);
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // 7. Получение версии с GitHub
    fetchVersion();
});

// --- Функции ---

function applyLanguage(lang) {
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        langSwitch.classList.toggle('en-mode', lang === 'en');
    }
    
    localStorage.setItem('preferredLang', lang);

    // Выбираем источник: либо английский словарь, либо сохраненный оригинал
    const sourceData = (lang === 'en') ? translations.en : originalText;

    if (!sourceData) return;

    // Обновляем тексты
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (sourceData[key] !== undefined) {
            el.innerHTML = sourceData[key];
        }
    });

    // Обновляем навигацию
    document.querySelectorAll('.nav-dot').forEach(dot => {
        const sec = dot.getAttribute('data-section');
        const navKey = `nav_${sec}`;
        if (sourceData[navKey] !== undefined) {
            dot.setAttribute('data-label', sourceData[navKey]);
        }
    });
    
    // Обновляем текст кнопок слайдера (они динамические, поэтому нужна отдельная проверка)
    updateSliderControlsText(sourceData);
}

function updateSliderControlsText(data) {
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    if (prevBtn && data.btn_prev) prevBtn.innerText = data.btn_prev;
    if (nextBtn && data.btn_next) nextBtn.innerText = data.btn_next;
}

function setupScrollReveal() {
    try {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        if (revealElements.length > 0) {
            revealElements.forEach(el => observer.observe(el));
        } else {
            document.body.classList.add('force-visible');
        }
    } catch (e) {
        console.error("Observer failed, showing all content:", e);
        document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
    }
}

function fetchVersion() {
    const versionEl = document.getElementById('latestVersion');
    if (versionEl) {
        fetch('https://api.github.com/repos/Aspirata/Just-Simple-Rig/releases/latest')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => versionEl.textContent = data.name)
            .catch(() => versionEl.textContent = "Release not found");
    }
}

function setupCarousel() {
    let currentStep = 0;
    const steps = document.querySelectorAll('.install-step');
    const totalSteps = steps.length;
    const track = document.getElementById('installTrack');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const dots = document.querySelectorAll('.step-indicators .dot');

    function updateUI() {
        if (!track) return;
        track.style.transform = `translateX(-${currentStep * 100}%)`;

        steps.forEach((step, index) => {
            const isActive = index === currentStep;
            step.classList.toggle('active-step', isActive);
            const video = step.querySelector('video');
            if (video) isActive ? (video.currentTime = 0, video.play()) : video.pause();
        });

        dots.forEach((dot, index) => dot.classList.toggle('active', index === currentStep));

        if (prevBtn) {
            prevBtn.disabled = currentStep === 0;
            prevBtn.classList.toggle('btn-secondary', currentStep !== totalSteps - 1);
        }
        if (nextBtn) {
            const isLast = currentStep === totalSteps - 1;
            nextBtn.disabled = isLast;
            nextBtn.classList.toggle('btn-primary', !isLast);
            nextBtn.classList.toggle('btn-secondary', isLast);
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; updateUI(); }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) { currentStep++; updateUI(); }
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { currentStep = index; updateUI(); });
    });

    updateUI();
}

// Скролл-спай (подсветка активной точки в навигации)
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            const scrollPos = window.scrollY + (window.innerHeight / 2);
            let currentId = 'home';
            document.querySelectorAll('section').forEach(s => {
                if (scrollPos >= s.offsetTop) currentId = s.getAttribute('id');
            });
            document.querySelectorAll('.nav-dot').forEach(dot => 
                dot.classList.toggle('active', dot.getAttribute('data-section') === currentId)
            );
            isScrolling = false;
        });
        isScrolling = true;
    }
});