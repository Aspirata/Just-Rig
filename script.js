const translations = {
    en: {
        badge: "RELEASE VERSION",
        hero_subtitle: "Simple and powerful Minecraft rig for Blender 4.2+.<br>Built for those who value speed and ease of setup.",
        pill_blender: "Blender:",
        pill_version: "Version:",
        features_title: "Key Features",
        f1_t: "Math-Based Face Shader",
        f1_p: "Modular and easily modifiable face shader built entirely on math nodes.",
        f2_t: "Instant Rig Import",
        f2_p: "Optional extension allows you to add Just Rig to your scene in two clicks.",
        rules_title: "Usage Rules",
        r1: "Free to use in any animations.",
        r2: "Modification for your specific tasks is allowed.",
        r3: "Attribution to author (Aspirata) is required for animations.",
        download_title: "Ready to start?",
        download_sub: "Click the button below to download the archive. Then we will show you how to install it.",
        btn_download: "DOWNLOAD JUST RIG",
        install_title: "Installation Guide",
        step1_title: "Download File",
        step1_desc: "Make sure you downloaded <b>just_rig.zip</b>. Do not unzip it.",
        step2_title: "Drag & Drop",
        step2_desc: "Open Blender 4.2+ and simply drag and drop the file into the 3D Viewport.",
        step3_title: "Add Rig",
        step3_desc: "Press <b>Shift + A</b>, navigate to <b>Just Rig</b> and add the character.",
        btn_prev: "← Back",
        btn_next: "Next →",
        btn_finish: "Finish!",
        nav: { home: "Home", features: "Features", rules: "Rules", download: "Download", install: "Install" }
    },
    ru: {
        btn_prev: "← Назад",
        btn_next: "Далее →",
        btn_finish: "Готово!",
        nav: { home: "Главная", features: "Особенности", rules: "Правила", download: "Скачать", install: "Установка" }
    }
};

let originalRU = {};
let currentStep = 0;
const totalSteps = 3;

document.querySelectorAll('[data-key]').forEach(el => {
    originalRU[el.getAttribute('data-key')] = el.innerHTML;
});

const savedLang = localStorage.getItem('preferredLang') || 'ru';
applyLanguage(savedLang);

const langSwitch = document.getElementById('langSwitch');
if (langSwitch) {
    langSwitch.addEventListener('click', function() {
        const isEn = this.classList.contains('en-mode');
        applyLanguage(isEn ? 'ru' : 'en');
    });
}

document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        scrollToId(dot.getAttribute('data-section'));
    });
});

document.getElementById('downloadBtn').addEventListener('click', function(e) {
    const installSection = document.getElementById('install');
    
    if (installSection) {
        setTimeout(() => {
            installSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
    }
});

const prevBtn = document.getElementById('prevStepBtn');
const nextBtn = document.getElementById('nextStepBtn');
if (prevBtn) prevBtn.addEventListener('click', () => changeStep(-1));
if (nextBtn) nextBtn.addEventListener('click', () => changeStep(1));

document.querySelectorAll('.step-indicators .dot').forEach((dot, index) => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('click', () => {
        currentStep = index;
        updateSliderUI();
    });
});

updateSliderUI();

const versionEl = document.getElementById('latestVersion');
if (versionEl) {
    fetch(`https://api.github.com/repos/Aspirata/Just-Rig/releases/latest`)
        .then(res => {
            if (!res.ok) throw new Error('Release not found');
            return res.json();
        })
        .then(data => versionEl.textContent = data.tag_name)
        .catch(() => versionEl.textContent = "Beta 1");
}

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

function scrollToId(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        history.pushState(null, null, `#${id}`);
    }
}

function changeStep(direction) {
    const newStep = currentStep + direction;
    if (newStep >= 0 && newStep < totalSteps) {
        currentStep = newStep;
        updateSliderUI();
    }
}

function updateSliderUI() {
    const track = document.getElementById('installTrack');
    const steps = document.querySelectorAll('.install-step');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');

    if (!track) return;

    track.style.transform = `translateX(-${currentStep * 100}%)`;
    steps.forEach((step, index) => step.classList.toggle('active-step', index === currentStep));
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentStep));
    
    const langSwitch = document.getElementById('langSwitch');
    const isEn = langSwitch && langSwitch.classList.contains('en-mode');
    const isLast = (currentStep === totalSteps - 1);
    const isFirst = (currentStep === 0);

    if (prevBtn) {
        prevBtn.disabled = isFirst;
        if (isLast) {
            prevBtn.classList.replace('btn-secondary', 'btn-primary');
        } else {
            prevBtn.classList.replace('btn-primary', 'btn-secondary');
        }
    }

    if (nextBtn) {
        if (isLast) {
            nextBtn.disabled = true; 
            nextBtn.classList.replace('btn-primary', 'btn-secondary');
        } else {
            nextBtn.disabled = false;
            nextBtn.classList.replace('btn-secondary', 'btn-primary');
        }
    }
}

function applyLanguage(lang) {
    const langSwitch = document.getElementById('langSwitch');
    if (!langSwitch) return;

    if (lang === 'en') langSwitch.classList.add('en-mode');
    else langSwitch.classList.remove('en-mode');
    
    localStorage.setItem('preferredLang', lang);

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (lang === 'en') {
            if (translations.en[key]) el.innerHTML = translations.en[key];
        } else {
            if (originalRU[key]) el.innerHTML = originalRU[key];
        }
    });

    document.querySelectorAll('.nav-dot').forEach(dot => {
        const secKey = dot.getAttribute('data-section');
        const labelObj = lang === 'en' ? translations.en.nav : translations.ru.nav;
        if (labelObj && labelObj[secKey]) dot.setAttribute('data-label', labelObj[secKey]);
    });

    updateSliderUI();
}

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentId = '';
    const scrollPos = window.scrollY + (window.innerHeight / 2);

    sections.forEach(s => {
        if (scrollPos >= s.offsetTop && scrollPos < s.offsetTop + s.offsetHeight) {
            currentId = s.getAttribute('id');
        }
    });

    if (window.scrollY < 100) currentId = 'home';
    navDots.forEach(dot => dot.classList.toggle('active', dot.getAttribute('data-section') === currentId));
});