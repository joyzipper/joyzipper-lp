// ========================================
// JOY ZIPPER Landing Page - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // フォーム切り替え（企業様/インフルエンサー）
    // ========================================
    const formTypeSelector = document.getElementById('form-type-selector');
    const corporateForm = document.getElementById('corporate-form');
    const influencerForm = document.getElementById('influencer-form');
    
    if (formTypeSelector && corporateForm && influencerForm) {
        formTypeSelector.addEventListener('change', function() {
            const selectedType = this.value;
            
            if (selectedType === 'corporate') {
                corporateForm.style.display = 'block';
                influencerForm.style.display = 'none';
                
                // GA4イベント送信
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_type_selected', {
                        'event_category': 'Form',
                        'event_label': '企業様フォーム選択',
                        'value': 1
                    });
                }
            } else if (selectedType === 'influencer') {
                corporateForm.style.display = 'none';
                influencerForm.style.display = 'block';
                
                // GA4イベント送信
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_type_selected', {
                        'event_category': 'Form',
                        'event_label': 'インフルエンサーフォーム選択',
                        'value': 1
                    });
                }
            } else {
                corporateForm.style.display = 'none';
                influencerForm.style.display = 'none';
            }
        });
    }
    
    // ========================================
    // Google Analytics イベントトラッキング
    // ========================================
    
    // 「無料相談する」ボタンのクリック追跡
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_button_click', {
                    'event_category': 'CTA',
                    'event_label': buttonText,
                    'value': 1
                });
            }
        });
    });
    
    // 「インフルエンサー募集中」バナーのクリック追跡
    const influencerBanner = document.querySelector('.influencer-banner');
    if (influencerBanner) {
        influencerBanner.addEventListener('click', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'influencer_banner_click', {
                    'event_category': 'Banner',
                    'event_label': 'インフルエンサー募集中バナー',
                    'value': 1
                });
            }
        });
    }
    
    // フォーム送信イベント（企業様）
    if (corporateForm) {
        corporateForm.addEventListener('submit', function(e) {
            // GA4イベント送信
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'Conversion',
                    'event_label': '企業様フォーム送信',
                    'value': 1
                });
            }
            
            // Meta Pixel Leadイベント送信
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: '企業様問い合わせ',
                    content_category: 'Corporate Inquiry'
                });
            }
        });
    }
    
    // フォーム送信イベント（インフルエンサー）
    if (influencerForm) {
        influencerForm.addEventListener('submit', function(e) {
            // GA4イベント送信
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'Conversion',
                    'event_label': 'インフルエンサーフォーム送信',
                    'value': 1
                });
            }
            
            // Meta Pixel Leadイベント送信
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'インフルエンサー登録',
                    content_category: 'Influencer Registration'
                });
            }
        });
    }
    
    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (targetId === '#') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========================================
    // Fade-in Animation on Scroll
    // ========================================
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements
    const fadeInElements = document.querySelectorAll('.problem-card, .logic-card, .service-card, .comparison-card, .example-item');
    
    fadeInElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        fadeInObserver.observe(el);
    });
    
    // ========================================
    // Hero Parallax Effect
    // ========================================
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (hero && heroBackground) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            
            if (scrollPosition < heroHeight) {
                heroBackground.style.transform = `translateY(${scrollPosition * 0.5}px)`;
                heroBackground.style.opacity = 1 - (scrollPosition / heroHeight);
            }
        });
    }
    
    // ========================================
    // Scroll Progress Indicator (Optional)
    // ========================================
    function createScrollProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #DE80D9, #C855C3);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
    
    createScrollProgressBar();
    
    // ========================================
    // CTA Button Ripple Effect
    // ========================================
    // ctaButtons は既に54行目で宣言済みなので、再度取得は不要
    
    // リップルエフェクトを追加（既存のctaButtonsを使用）
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========================================
    // Card Tilt Effect (3D hover)
    // ========================================
    function addTiltEffect(card) {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    }
    
    // Apply tilt to specific cards
    const tiltCards = document.querySelectorAll('.logic-card, .service-card');
    tiltCards.forEach(card => {
        card.style.transition = 'transform 0.3s ease';
        addTiltEffect(card);
    });
    
    // ========================================
    // Number Counter Animation
    // ========================================
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current.toString().padStart(2, '0');
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Animate logic numbers on scroll
    const logicNumbers = document.querySelectorAll('.logic-number');
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetNumber = parseInt(entry.target.textContent);
                if (!isNaN(targetNumber)) {
                    animateNumber(entry.target, 0, targetNumber, 1000);
                }
                numberObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    logicNumbers.forEach(num => numberObserver.observe(num));
    
    // ========================================
    // Animate Stats Numbers
    // ========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                if (!isNaN(target)) {
                    animateNumber(entry.target, 0, target, 2000);
                }
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(num => statObserver.observe(num));
    
    // ========================================
    // FAQ Accordion
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // ========================================
    // Contact Form Handling
    // ========================================
    // Netlify Formsを使用するため、JavaScript処理は無効化
    // フォームはHTMLのネイティブ送信を使用します
    
    // ========================================
    // Form Field Switching Based on Inquiry Type
    // ========================================
    const inquiryTypeSelect = document.getElementById('inquiry-type');
    const corporateFields = document.getElementById('corporate-fields');
    const influencerFields = document.getElementById('influencer-fields');
    
    if (inquiryTypeSelect && corporateFields && influencerFields) {
        // Initial state: hide both
        corporateFields.style.display = 'none';
        influencerFields.style.display = 'none';
        
        inquiryTypeSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (selectedValue === 'corporate') {
                // Show corporate fields
                corporateFields.style.display = 'block';
                influencerFields.style.display = 'none';
                
                // Enable corporate fields, disable influencer fields
                setCorporateFieldsRequired(true);
                setInfluencerFieldsRequired(false);
                
            } else if (selectedValue === 'influencer') {
                // Show influencer fields
                corporateFields.style.display = 'none';
                influencerFields.style.display = 'block';
                
                // Enable influencer fields, disable corporate fields
                setCorporateFieldsRequired(false);
                setInfluencerFieldsRequired(true);
                
            } else {
                // Hide both if nothing selected
                corporateFields.style.display = 'none';
                influencerFields.style.display = 'none';
                setCorporateFieldsRequired(false);
                setInfluencerFieldsRequired(false);
            }
        });
    }
    
    function setCorporateFieldsRequired(isRequired) {
        const fields = corporateFields.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (isRequired) {
                field.setAttribute('required', 'required');
                field.removeAttribute('disabled');
            } else {
                field.removeAttribute('required');
                field.setAttribute('disabled', 'disabled');
            }
        });
    }
    
    function setInfluencerFieldsRequired(isRequired) {
        const fields = influencerFields.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (isRequired) {
                field.setAttribute('required', 'required');
                field.removeAttribute('disabled');
            } else {
                field.removeAttribute('required');
                field.setAttribute('disabled', 'disabled');
            }
        });
    }
    
    /*
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                company: formData.get('company'),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                budget: formData.get('budget'),
                message: formData.get('message')
            };
            
            // Show loading state
            const submitButton = contactForm.querySelector('.form-submit');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
            submitButton.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            try {
                // TODO: Replace with actual API endpoint
                // const response = await fetch('/api/contact', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify(data)
                // });
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success message
                formMessage.className = 'form-message success';
                formMessage.textContent = 'お問い合わせありがとうございます。担当者より3営業日以内にご連絡いたします。';
                
                // Reset form
                contactForm.reset();
                
                // Log to console for demo
                console.log('Form submitted:', data);
                
            } catch (error) {
                // Error message
                formMessage.className = 'form-message error';
                formMessage.textContent = '送信中にエラーが発生しました。時間をおいて再度お試しください。';
                console.error('Form submission error:', error);
            } finally {
                // Restore button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formMessage.className = 'form-message';
                    formMessage.textContent = '';
                }, 5000);
            }
        });
    }
    */
    
    // ========================================
    // Hide Scroll Indicator on Scroll
    // ========================================
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }
    
    // ========================================
    // Lazy Load Images (if any added later)
    // ========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // ========================================
    // Add Intersection Observer for Section Animations
    // ========================================
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        sectionObserver.observe(section);
    });
    
    // ========================================
    // Console Brand Message
    // ========================================
    console.log('%c JOY ZIPPER ', 'background: linear-gradient(135deg, #DE80D9, #C855C3); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
    console.log('%c ストーリーズ特化型インフルエンサーPR ', 'color: #DE80D9; font-size: 14px; font-weight: bold;');
    console.log('%c Designed with ♥ using Brand Color DIC478 #DE80D9 ', 'color: #999; font-size: 12px;');
    
});

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
