// Global variables
let currentLang = 'en';
let photoCarousel;
let isAutoPlaying = true;
let currentPhotoModalIndex = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    showPreloader();
    
    // Initialize components
    await Promise.all([
        initializeLanguageSystem(),
        initializeNavigation(),
        initializePhotoCarousel(),
        initializeFormHandling(),
        initializeAnimations(),
        initializeAccessibility()
    ]);
    
    hidePreloader();
    startPageAnimations();
}

// Preloader functions
function showPreloader() {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'flex';
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
    }, 1500);
}

// Language System
function initializeLanguageSystem() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.dataset.lang;
            switchLanguage(selectedLang);
            
            // Update active button
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Set default language
    switchLanguage('en');
}
document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('keydown', function(e) {
            // Ensure space key works in the textarea
            if (e.key === ' ' || e.keyCode === 32) {
                e.stopPropagation(); // Stop event from bubbling up
            }
        }, true); // Use capture phase to intercept before other handlers
    }
});
function switchLanguage(lang) {
    currentLang = lang;
    
    // Hide all content
    const contentElements = document.querySelectorAll('.content-lang');
    contentElements.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected language content
    const selectedContent = document.getElementById(`content-${lang}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Update all translatable elements
    updateTranslatableElements(lang);
    
    // Update carousel language if it exists
    if (photoCarousel) {
        photoCarousel.updateCarouselLanguage(lang);
    }
    
    // Update form placeholders
    updateFormPlaceholders(lang);
}

function updateTranslatableElements(lang) {
    const translatableElements = document.querySelectorAll(`[data-${lang}]`);
    
    translatableElements.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (translation) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

function updateFormPlaceholders(lang) {
    const placeholders = {
        'en': 'Share your favorite memory or well wishes...',
        'es': 'Comparte tu recuerdo favorito o buenos deseos...',
        'zh': '分享您最喜歡的回憶或祝福...'
    };
    
    const messageTextarea = document.getElementById('message');
    if (messageTextarea && placeholders[lang]) {
        messageTextarea.placeholder = placeholders[lang];
    }
}

// Navigation System
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll behavior for navbar
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navbar.classList.toggle('nav-open');
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            smoothScrollTo(targetId);
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            // Close mobile menu
            navbar.classList.remove('nav-open');
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Smooth scroll function
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Enhanced Photo Carousel Class
class PhotoCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.track = document.getElementById('carouselTrack');
        this.indicators = document.getElementById('carouselIndicators');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.autoPlayInterval = null;
        this.progressInterval = null;
        this.autoPlayDuration = 5000;
        
        this.init();
    }
    
    async init() {
        await this.loadPhotos();
        this.setupEventListeners();
        this.setupAutoPlay();
        this.updateCounter();
    }
    
    async loadPhotos() {
        // Enhanced photo data with more details
        const photoData = [
            {
                filename: 'career-1.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-2.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-3.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-4.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-5.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-6.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-7.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-8.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-9.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-10.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-11.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            },
            {
                filename: 'career-12.jpeg',
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            }
        ];
        
        // Add more photos (career-13 to career-30)
        for (let i = 13; i <= 30; i++) {
            photoData.push({
                filename: `career-${i}.jpeg`,
                title: 'A Journey Through 45 Years',
                description: 'Memories from an incredible aviation career',
                titleEs: 'Un Viaje a Través de 45 Años',
                descriptionEs: 'Recuerdos de una increíble carrera en aviación',
                titleZh: '45年的旅程',
                descriptionZh: '令人難以置信的航空職業生涯回憶',
                year: 'Memories'
            });
        }
        
        this.slides = photoData;
        this.renderSlides();
        this.renderIndicators();
        this.totalSlidesSpan.textContent = this.slides.length;
    }
    
    renderSlides() {
        this.track.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'carousel-slide';
            slideElement.innerHTML = `
                <img src="fotos/${slide.filename}" alt="${slide.title}" loading="lazy" onerror="this.style.display='none'">
                <div class="carousel-slide-overlay">
                    <div class="slide-year">${slide.year}</div>
                    <div class="carousel-slide-title" 
                         data-en="${slide.title}"
                         data-es="${slide.titleEs}"
                         data-zh="${slide.titleZh}">${slide.title}</div>
                    <div class="carousel-slide-description"
                         data-en="${slide.description}"
                         data-es="${slide.descriptionEs}"
                         data-zh="${slide.descriptionZh}">${slide.description}</div>
                </div>
            `;
            
            // Add click event to open modal
            slideElement.addEventListener('click', () => this.openPhotoModal(index));
            
            this.track.appendChild(slideElement);
        });
        
        this.updateSlidePosition();
    }
    
    renderIndicators() {
        this.indicators.innerHTML = '';
        
        // Show only a subset of indicators for better UX
        const maxIndicators = 10;
        const step = Math.ceil(this.slides.length / maxIndicators);
        
        for (let i = 0; i < this.slides.length; i += step) {
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
            indicator.dataset.slideIndex = i;
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicators.appendChild(indicator);
        }
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoPlay();
            }
        });
        
        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        let startY = 0;
        let endY = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
        
        // Pause autoplay on hover
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            if (isAutoPlaying) {
                this.resumeAutoPlay();
            }
        });
    }
    
    setupAutoPlay() {
        this.startAutoPlay();
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDuration);
        
        this.startProgressBar();
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.pauseProgressBar();
    }
    
    resumeAutoPlay() {
        if (!this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }
    
    toggleAutoPlay() {
        isAutoPlaying = !isAutoPlaying;
        const icon = this.playPauseBtn.querySelector('i');
        
        if (isAutoPlaying) {
            this.resumeAutoPlay();
            icon.className = 'fas fa-pause';
        } else {
            this.pauseAutoPlay();
            icon.className = 'fas fa-play';
        }
    }
    
    startProgressBar() {
        let progress = 0;
        this.progressInterval = setInterval(() => {
            progress += 100 / (this.autoPlayDuration / 100);
            this.progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                progress = 0;
            }
        }, 100);
    }
    
    pauseProgressBar() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    resetProgressBar() {
        this.progressBar.style.width = '0%';
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.startProgressBar();
        }
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlidePosition();
        this.updateIndicators();
        this.updateCounter();
        this.resetProgressBar();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlidePosition();
        this.updateIndicators();
        this.updateCounter();
        this.resetProgressBar();
    }
    
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateSlidePosition();
        this.updateIndicators();
        this.updateCounter();
        this.resetProgressBar();
    }
    
    updateSlidePosition() {
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
    }
    
    updateIndicators() {
        const indicators = this.indicators.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            const slideIndex = parseInt(indicator.dataset.slideIndex);
            indicator.classList.toggle('active', slideIndex === this.currentSlide);
        });
    }
    
    updateCounter() {
        this.currentSlideSpan.textContent = this.currentSlide + 1;
    }
    
     openPhotoModal(index) {
        currentPhotoModalIndex = index;
        const modal = document.getElementById('photoModal');
        const modalPhoto = document.getElementById('modalPhoto');
        const modalCaption = document.getElementById('modalCaption');
        const photoCounter = document.getElementById('photoCounter');
        
        const slide = this.slides[index];
        modalPhoto.src = `fotos/${slide.filename}`;
        modalPhoto.alt = slide.title;
        
        // Set caption based on current language
        let title = slide.title;
        let description = slide.description;
        
        if (currentLang === 'es') {
            title = slide.titleEs;
            description = slide.descriptionEs;
        } else if (currentLang === 'zh') {
            title = slide.titleZh;
            description = slide.descriptionZh;
        }
        
        modalCaption.innerHTML = `
            <div class="modal-year">${slide.year}</div>
            <strong>${title}</strong><br>
            ${description}
        `;
        
        photoCounter.textContent = `${index + 1} / ${this.slides.length}`;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Pause carousel autoplay when modal is open
        this.pauseAutoPlay();
    }
    
    updateCarouselLanguage(lang) {
        const slideOverlays = document.querySelectorAll('.carousel-slide-overlay');
        slideOverlays.forEach(overlay => {
            const title = overlay.querySelector('.carousel-slide-title');
            const description = overlay.querySelector('.carousel-slide-description');
            
            if (title && title.getAttribute(`data-${lang}`)) {
                title.textContent = title.getAttribute(`data-${lang}`);
            }
            if (description && description.getAttribute(`data-${lang}`)) {
                description.textContent = description.getAttribute(`data-${lang}`);
            }
        });
    }
}

// Initialize Photo Carousel
async function initializePhotoCarousel() {
    photoCarousel = new PhotoCarousel();
}

// Photo Modal Functions
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Resume carousel autoplay when modal is closed
    if (photoCarousel && isAutoPlaying) {
        photoCarousel.resumeAutoPlay();
    }
}

function navigatePhoto(direction) {
    const newIndex = currentPhotoModalIndex + direction;
    if (newIndex >= 0 && newIndex < photoCarousel.slides.length) {
        photoCarousel.openPhotoModal(newIndex);
    }
}

// Close photo modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('photoModal');
    if (e.target === modal) {
        closePhotoModal();
    }
});

// Close photo modal with Escape key
document.addEventListener('keydown', function(e) {
    // Skip completely if user is typing in a form field
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        // Only handle Escape key for form fields
        if (e.key === 'Escape') {
            const modal = document.getElementById('photoModal');
            if (modal.style.display === 'block') {
                closePhotoModal();
            }
        }
        return; // Return early for ALL keys when in form fields
    }

    // Only execute these for non-form elements
    if (e.key === 'ArrowLeft') this.prevSlide();
    if (e.key === 'ArrowRight') this.nextSlide();
    if (e.key === ' ') {
        e.preventDefault();  // THIS IS THE PROBLEM!
        this.toggleAutoPlay();
    }
});

// Form Handling
function initializeFormHandling() {
    const rsvpForm = document.getElementById('rsvpForm');
    const successModal = document.getElementById('successModal');
    
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(rsvpForm);
        const rsvpData = {
            name: formData.get('name'),
            email: formData.get('email'),
            attendance: formData.get('attendance'),
            guests: formData.get('guests'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            language: currentLang
        };
        
        // Validate form
        if (validateForm(rsvpData)) {
            submitRSVP(rsvpData);
        }
    });
    
    // Real-time form validation
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateForm(data) {
    let isValid = true;
    
    // Validate required fields
    if (!data.name.trim()) {
        showFieldError(document.getElementById('name'), 'Name is required');
        isValid = false;
    }
    
    if (!data.email.trim()) {
        showFieldError(document.getElementById('email'), 'Email is required');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email');
        isValid = false;
    }
    
    if (!data.attendance) {
        showFieldError(document.querySelector('input[name="attendance"]'), 'Please select your attendance');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearFieldError(e);
    
    if (field.type === 'email' && value) {
        if (!isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
        }
    }
    
    if (field.required && !value) {
        showFieldError(field, 'This field is required');
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Replace your submitRSVP function with this enhanced version
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyC6GwY87GGSGDsaA7AEbhW5DMgooPhQQv6EJx8Af-tTgK8umrSpgbS6hUFH3LulMucmQ/exec'; // ⚠️ PASTE YOUR URL HERE

async function submitRSVP(data) {
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    // Show loading state
    btnText.textContent = getLoadingText();
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Prepare the data
        const formData = {
            name: data.name,
            email: data.email,
            attendance: data.attendance,
            guests: data.guests,
            message: data.message || '',
            language: currentLang || 'en',
            timestamp: new Date().toISOString()
        };
        
        console.log('Submitting to Google Sheets:', formData);
        
        // Submit to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(formData)
        });
        
        // Since we're using no-cors, we can't read the response
        // But if no error was thrown, we assume success
        console.log('RSVP submitted successfully');
        
        // Show success modal
        showModal();
        
        // Reset form
        rsvpForm.reset();
        
        // Show success notification
        showSuccessNotification();
        
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        
        // Show error and provide fallback
        showErrorWithFallback(data);
        
    } finally {
        // Reset button state
        btnText.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Success notification function
function showSuccessNotification() {
    const messages = {
        'en': 'RSVP submitted successfully! Check your email for confirmation.',
        'es': '¡RSVP enviado exitosamente! Revise su correo para la confirmación.',
        'zh': 'RSVP提交成功！請檢查您的電子郵件確認。'
    };
    
    showNotification(messages[currentLang] || messages['en'], 'success');
}

// Error handling with fallback options
function showErrorWithFallback(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '9999';
    
    const errorMessages = {
        'en': 'There was an issue submitting your RSVP. Please try one of these options:',
        'es': 'Hubo un problema al enviar su RSVP. Por favor, pruebe una de estas opciones:',
        'zh': '提交RSVP時出現問題。請嘗試以下選項之一：'
    };
    
    const subject = encodeURIComponent('RSVP - Jorge Evia Retirement');
    const body = encodeURIComponent(`
Name: ${data.name}
Email: ${data.email}
Attendance: ${data.attendance === 'yes' ? 'Yes' : 'No'}
Guests: ${data.guests}
Message: ${data.message || 'None'}
Language: ${data.language || currentLang}
Submitted: ${new Date().toLocaleString()}
    `);
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h4>⚠️ ${currentLang === 'es' ? 'Opciones Alternativas' : currentLang === 'zh' ? '替代選項' : 'Alternative Options'}</h4>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1.5rem;">${errorMessages[currentLang] || errorMessages['en']}</p>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <p style="margin: 0.5rem 0;"><strong>Name:</strong> ${data.name}</p>
                    <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${data.email}</p>
                    <p style="margin: 0.5rem 0;"><strong>Attendance:</strong> ${data.attendance === 'yes' ? '✅ Yes' : '❌ No'}</p>
                    <p style="margin: 0.5rem 0;"><strong>Guests:</strong> ${data.guests}</p>
                    ${data.message ? `<p style="margin: 0.5rem 0;"><strong>Message:</strong> ${data.message}</p>` : ''}
                </div>
                
                <div class="modal-actions" style="display: flex; flex-direction: column; gap: 1rem;">
                    <button onclick="useFormSubmitService(${JSON.stringify(data).replace(/"/g, '&quot;')}); this.closest('.modal').remove();" 
                            class="modal-btn" 
                            style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-paper-plane"></i>
                        ${currentLang === 'es' ? 'Enviar por FormSubmit' : currentLang === 'zh' ? '通過FormSubmit發送' : 'Send via FormSubmit'}
                    </button>
                    
                    <a href="mailto:gmemomt@gmail.com?subject=${subject}&body=${body}" 
                       class="modal-btn" 
                       style="background: #667eea; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-envelope"></i>
                        ${currentLang === 'es' ? 'Enviar por Email' : currentLang === 'zh' ? '通過電子郵件發送' : 'Send via Email'}
                    </a>
                    
                    <button onclick="copyRSVPDetails('${btoa(JSON.stringify(data))}'); this.closest('.modal').remove();" 
                            class="modal-btn" 
                            style="background: #17a2b8; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-copy"></i>
                        ${currentLang === 'es' ? 'Copiar Detalles' : currentLang === 'zh' ? '複製詳情' : 'Copy Details'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// FormSubmit.co integration (backup method)
async function useFormSubmitService(data) {
    try {
        const FORMSUBMIT_EMAIL = 'gmemomt@gmail.com';
        const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`;
        
        const formData = {
            _subject: 'New RSVP - Jorge Evia Retirement Celebration',
            _template: 'table',
            _captcha: false,
            Name: data.name,
            Email: data.email,
            Attendance: data.attendance === 'yes' ? 'Yes, I will attend' : 'No, I cannot attend',
            'Number of Guests': data.guests,
            Message: data.message || 'No message',
            Language: data.language || currentLang,
            'Submitted At': new Date().toLocaleString()
        };
        
        showNotification('Sending via backup method...', 'info');
        
        const response = await fetch(FORMSUBMIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            console.log('RSVP submitted via FormSubmit');
            showModal();
            rsvpForm.reset();
            showNotification(getSuccessMessage());
        } else {
            throw new Error('FormSubmit submission failed');
        }
        
    } catch (error) {
        console.error('FormSubmit error:', error);
        showNotification('Backup method failed. Please use email option.', 'error');
    }
}

// Helper function to copy RSVP details
function copyRSVPDetails(encodedData) {
    try {
        const data = JSON.parse(atob(encodedData));
        const text = `RSVP Details:
Name: ${data.name}
Email: ${data.email}
Attendance: ${data.attendance === 'yes' ? 'Yes, I will attend' : 'No, I cannot attend'}
Number of Guests: ${data.guests}
Message: ${data.message || 'No message'}
Submitted: ${new Date().toLocaleString()}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification(currentLang === 'es' ? '¡Detalles copiados!' : currentLang === 'zh' ? '詳情已複製！' : 'Details copied!');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification(currentLang === 'es' ? '¡Detalles copiados!' : currentLang === 'zh' ? '詳情已複製！' : 'Details copied!');
        }
    } catch (error) {
        console.error('Error copying details:', error);
    }
}

// Enhanced notification function (consolidated version)
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'info': '#17a2b8'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons['info']}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors['info']};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        font-size: 0.95rem;
    `;
    
    // Add CSS animation if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Language-specific helper functions
function getLoadingText() {
    const texts = {
        'en': 'Sending...',
        'es': 'Enviando...',
        'zh': '發送中...'
    };
    return texts[currentLang] || texts['en'];
}

function getSuccessMessage() {
    const messages = {
        'en': 'RSVP submitted successfully!',
        'es': '¡RSVP enviado exitosamente!',
        'zh': 'RSVP提交成功！'
    };
    return messages[currentLang] || messages['en'];
}

function getErrorMessage() {
    const messages = {
        'en': 'There was an error. Please try the alternative options.',
        'es': 'Hubo un error. Por favor, pruebe las opciones alternativas.',
        'zh': '出現錯誤。請嘗試替代選項。'
    };
    return messages[currentLang] || messages['en'];
}

// Modal Functions (keep your existing ones)
function showModal() {
    const successModal = document.getElementById('successModal');
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    createConfetti();
}

function closeModal() {
    const successModal = document.getElementById('successModal');
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Confetti Animation (keep your existing one)
function createConfetti() {
    const confettiContainer = document.querySelector('.success-confetti');
    if (!confettiContainer) return;
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: confetti-fall ${Math.random() * 3 + 2}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}
// Utility Functions
function shareInvitation() {
    const shareData = {
        title: 'Jorge Evia\'s Retirement Celebration',
        text: 'You\'re invited to celebrate Captain Jorge Evia\'s retirement after 45 years of flying!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch((error) => console.log('Error sharing:', error));
    } else {
        copyToClipboard(window.location.href);
        showNotification('Link copied to clipboard!');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function printInvitation() {
    window.print();
}

function addToCalendar() {
    const event = {
        title: 'Jorge Evia\'s Retirement Celebration',
        start: '2024-08-16T11:00:00',
        end: '2024-08-16T15:00:00',
        description: 'Retirement celebration lunch for Captain Jorge Evia after 45 years of flying excellence',
        location: '緣圓餐廳, 3rd Floor, No. 846, Zhongzheng Rd, Taoyuan District, Taoyuan City'
    };
    
    const startDate = event.start.replace(/[-:]/g, '').replace('T', 'T');
    const endDate = event.end.replace(/[-:]/g, '').replace('T', 'T');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
}

// Animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.invitation-card, .rsvp-card, .maps-section, .carousel-container, .section-header');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function startPageAnimations() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 1s ease-out';
    }
    
    // Animate scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.style.animation = 'bounce 2s infinite 1s';
    }
}

// Accessibility
// Accessibility
// Accessibility
function initializeAccessibility() {
    // Add focus management
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    // Add keyboard navigation for carousel
    document.addEventListener('keydown', function(e) {
        // Skip completely if user is typing in a form field
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            // Only handle Escape key for form fields
            if (e.key === 'Escape') {
                const modal = document.getElementById('photoModal');
                if (modal.style.display === 'block') {
                    closePhotoModal();
                }
            }
            return; // Return early for ALL keys when in form fields
        }
        
        // Only execute these for non-form elements
        if (photoCarousel) {  // Check if carousel exists
            if (e.key === 'ArrowLeft') {
                photoCarousel.prevSlide();
            } else if (e.key === 'ArrowRight') {
                photoCarousel.nextSlide();
            } else if (e.key === ' ') {
                e.preventDefault();  // Only prevent default when we're actually handling the space key
                photoCarousel.toggleAutoPlay();
            }
        }
    });
    
    // Add ARIA labels and descriptions
    const carouselButtons = document.querySelectorAll('.carousel-btn');
    carouselButtons.forEach(btn => {
        btn.setAttribute('role', 'button');
    });
    
    // Add live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
}



// Performance optimizations
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Preload critical images
    const criticalImages = ['fotos/main-photo.jpeg'];
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Error handling
function handleImageError(img) {
    img.style.display = 'none';
    const parent = img.closest('.carousel-slide');
    if (parent) {
        parent.style.display = 'none';
    }
}

// Add error handling to all images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => handleImageError(img));
    });
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const langButtons = document.querySelectorAll('.lang-btn');
        const currentLangIndex = Array.from(langButtons).findIndex(btn => btn.classList.contains('active'));
        
        if (diff > 0 && currentLangIndex < langButtons.length - 1) {
            // Swipe left - next language
            langButtons[currentLangIndex + 1].click();
        } else if (diff < 0 && currentLangIndex > 0) {
            // Swipe right - previous language
            langButtons[currentLangIndex - 1].click();
        }
    }
}

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}