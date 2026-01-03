/* ============================================
   ZAANDAK.NL PERFECT CLONE - JAVASCRIPT
   ============================================ */

// ============================================
// HERO SLIDER FUNCTIONALITY
// ============================================

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
let slideInterval;

/**
 * Show specific slide
 * @param {number} n - Slide index
 */
function showSlide(n) {
    // Safety check - return if no slides exist
    if (slides.length === 0) return;
    
    // Remove active class from all slides and dots
    slides.forEach(slide => {
        slide.classList.remove('active');
        const content = slide.querySelector('.slide-content');
        if (content) content.classList.remove('animate');
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Calculate current slide index (with wrapping)
    currentSlide = (n + slides.length) % slides.length;
    
    // Add active class to current slide and dot
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    // Animate slide content
    setTimeout(() => {
        const content = slides[currentSlide].querySelector('.slide-content');
        if (content) content.classList.add('animate');
    }, 100);
}

/**
 * Change slide by direction
 * @param {number} direction - 1 for next, -1 for previous
 */
function changeSlide(direction) {
    showSlide(currentSlide + direction);
    resetSlideInterval();
}

/**
 * Go to specific slide
 * @param {number} n - Slide index
 */
function goToSlide(n) {
    showSlide(n);
    resetSlideInterval();
}

/**
 * Reset the auto-slide interval
 */
function resetSlideInterval() {
    clearInterval(slideInterval);
    startAutoSlide();
}

/**
 * Start automatic slide rotation
 */
function startAutoSlide() {
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 6000); // Change slide every 6 seconds
}

// Initialize slider
if (slides.length > 0) {
    startAutoSlide();
} else {
    console.log('ℹ️ No slider on this page');
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards for animation
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(card);
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-toggle');
    
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
}

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            const nav = document.getElementById('nav');
            if (nav.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

/**
 * Lazy load images (if using data-src attribute)
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Preload next slide image for better performance
 */
function preloadNextSlide() {
    if (slides.length === 0) return;
    
    const nextSlide = (currentSlide + 1) % slides.length;
    const nextImage = slides[nextSlide].style.backgroundImage;
    if (nextImage) {
        const img = new Image();
        img.src = nextImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
    }
}

// Preload first next slide
preloadNextSlide();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
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

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Zaandak website loaded successfully!');
    console.log('✅ Slider initialized');
    console.log('✅ Scroll effects active');
    console.log('✅ Mobile menu ready');
});
