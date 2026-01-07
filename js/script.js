/* ============================================
   ZAANDAK.NL - MAIN JAVASCRIPT
   Professional Roofing Services Website
   Version: 2.0 (Production Ready)
   ============================================ */

'use strict';

/* ============================================
   HERO SLIDER FUNCTIONALITY
   ============================================ */

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
    
    // Preload next slide for better performance
    preloadNextSlide();
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
    if (slides.length === 0) return;
    
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 6000); // Change slide every 6 seconds
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
        const match = nextImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
            img.src = match[1];
        }
    }
}

// Initialize slider if slides exist
if (slides.length > 0) {
    startAutoSlide();
    preloadNextSlide();
}

// Pause slider on hover
if (slides.length > 0) {
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        heroSlider.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */

const header = document.getElementById('header');

if (header) {
    let lastScroll = 0;
    
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, 100));
}

/* ============================================
   MOBILE MENU WITH FULL ACCESSIBILITY
   ============================================ */

let mobileMenuOpen = false;
let focusableElements = [];
let firstFocusableElement;
let lastFocusableElement;

/**
 * Toggle mobile navigation menu with improved accessibility
 */
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-toggle');
    const body = document.body;
    
    if (!nav || !toggle) return;
    
    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        // Open menu
        nav.classList.add('active');
        toggle.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Sluit menu');
        
        // Get all focusable elements in the menu
        focusableElements = Array.from(nav.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        
        if (focusableElements.length > 0) {
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Focus first element after animation
            setTimeout(() => {
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }, 100);
        }
        
        // Add keyboard event listener for focus trap
        document.addEventListener('keydown', handleMenuKeydown);
        
    } else {
        // Close menu
        nav.classList.remove('active');
        toggle.classList.remove('active');
        body.style.overflow = ''; // Restore scrolling
        
        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        
        // Return focus to toggle button
        setTimeout(() => {
            if (toggle) {
                toggle.focus();
            }
        }, 100);
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleMenuKeydown);
    }
}

/**
 * Handle keyboard navigation in mobile menu (focus trap)
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleMenuKeydown(e) {
    // Close menu on Escape key
    if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        toggleMobileMenu();
        return;
    }
    
    // Handle Tab key for focus trap
    if (e.key === 'Tab') {
        // If only one focusable element, prevent default
        if (focusableElements.length === 1) {
            e.preventDefault();
            return;
        }
        
        // Shift + Tab (backwards)
        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                e.preventDefault();
                if (lastFocusableElement) {
                    lastFocusableElement.focus();
                }
            }
        }
        // Tab (forwards)
        else {
            if (document.activeElement === lastFocusableElement) {
                e.preventDefault();
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }
        }
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenuOpen) {
        const nav = document.getElementById('nav');
        const toggle = document.querySelector('.mobile-toggle');
        
        if (nav && toggle && 
            !nav.contains(e.target) && 
            !toggle.contains(e.target)) {
            toggleMobileMenu();
        }
    }
});

// Close mobile menu on window resize (if desktop size)
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 991 && mobileMenuOpen) {
        toggleMobileMenu();
    }
}, 250));

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if href is just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            
            // Calculate offset for fixed header
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (mobileMenuOpen) {
                toggleMobileMenu();
            }
            
            // Focus target for screen readers
            target.setAttribute('tabindex', '-1');
            target.focus();
            
            // Remove tabindex after focus
            setTimeout(() => {
                target.removeAttribute('tabindex');
            }, 1000);
        }
    });
});

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .why-item, .contact-item').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    revealObserver.observe(element);
});

/* ============================================
   LAZY LOAD IMAGES
   ============================================ */

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load image from data-src
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Load background image from data-bg
                if (img.dataset.bg) {
                    img.style.backgroundImage = `url(${img.dataset.bg})`;
                    img.removeAttribute('data-bg');
                }
                
                observer.unobserve(img);
            }
        });
    });

    // Observe all images with data-src or data-bg
    document.querySelectorAll('img[data-src], [data-bg]').forEach(img => {
        imageObserver.observe(img);
    });
}

/* ============================================
   DROPDOWN KEYBOARD NAVIGATION
   ============================================ */

document.querySelectorAll('.dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('a');
    const menu = dropdown.querySelector('.dropdown-content');
    
    if (trigger && menu) {
        // Handle keyboard navigation for dropdown trigger
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                const firstLink = menu.querySelector('a');
                if (firstLink) {
                    // Show dropdown
                    dropdown.classList.add('active');
                    firstLink.focus();
                }
            }
        });
        
        // Close dropdown on Escape from menu items
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    dropdown.classList.remove('active');
                    trigger.focus();
                }
            });
        });
        
        // Close dropdown when focus leaves
        dropdown.addEventListener('focusout', (e) => {
            // Check if new focus is outside dropdown
            setTimeout(() => {
                if (!dropdown.contains(document.activeElement)) {
                    dropdown.classList.remove('active');
                }
            }, 100);
        });
    }
});

/* ============================================
   CONTACT FORM ENHANCEMENTS
   ============================================ */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    // Real-time field validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error on input
            const error = this.parentElement.querySelector('.field-error');
            if (error) {
                error.remove();
                this.style.borderColor = '';
            }
        });
    });
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Focus first invalid field
            const firstError = contactForm.querySelector('.field-error');
            if (firstError) {
                firstError.previousElementSibling.focus();
            }
            return;
        }
        
        // Submit form
        const submitButton = contactForm.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Success
                showFormMessage('success', 'Bedankt! Uw bericht is verzonden. We nemen zo snel mogelijk contact met u op.');
                contactForm.reset();
            } else {
                // Error
                showFormMessage('error', 'Er is iets misgegaan. Probeer het opnieuw of neem telefonisch contact op.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('error', 'Er is iets misgegaan. Probeer het opnieuw of neem telefonisch contact op.');
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });
}

/**
 * Validate individual form field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} - True if valid
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check required fields
    if (field.hasAttribute('required') && value === '') {
        isValid = false;
        errorMessage = 'Dit veld is verplicht';
    }
    
    // Validate email
    else if (field.type === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Voer een geldig e-mailadres in';
        }
    }
    
    // Validate phone
    else if (field.type === 'tel' && value !== '') {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            isValid = false;
            errorMessage = 'Voer een geldig telefoonnummer in (minimaal 10 cijfers)';
        }
    }
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Show error if invalid
    if (!isValid) {
        field.style.borderColor = '#e53e3e';
        const errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        errorSpan.style.color = '#e53e3e';
        errorSpan.style.fontSize = '14px';
        errorSpan.style.marginTop = '5px';
        errorSpan.style.display = 'block';
        errorSpan.textContent = errorMessage;
        errorSpan.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorSpan);
    } else {
        field.style.borderColor = '';
    }
    
    return isValid;
}

/**
 * Show form submission message
 * @param {string} type - 'success' or 'error'
 * @param {string} message - Message to display
 */
function showFormMessage(type, message) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    
    // Style message
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.marginBottom = '20px';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.animation = 'fadeInUp 0.5s ease-out';
    
    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
    
    // Insert message
    if (contactForm) {
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove after 10 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 10000);
    }
}

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
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

/**
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
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

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

// Announce page changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.querySelector('[role="status"]');
    if (announcement) {
        announcement.textContent = message;
        setTimeout(() => {
            announcement.textContent = '';
        }, 1000);
    }
}

// Skip to content when using keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.querySelector('.skip-to-main');
        if (skipLink) {
            skipLink.focus();
        }
    }
});

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Zaandak website loaded successfully!');
    
    // Initialize ARIA attributes for mobile menu toggle
    const toggle = document.querySelector('.mobile-toggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.setAttribute('aria-controls', 'nav');
    }
    
    // Add role to navigation if missing
    const nav = document.getElementById('nav');
    if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Hoofdnavigatie');
    }
    
    // Preload critical images
    const criticalImages = [
        '/images/logo.svg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Initialize tooltips if any
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.setAttribute('title', element.dataset.tooltip);
    });
});

/* ============================================
   ERROR HANDLING
   ============================================ */

// Global error handler
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Don't show errors to users in production
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

/* ============================================
   SERVICE WORKER REGISTRATION
   ============================================ */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

/* ============================================
   END OF SCRIPT
   ============================================ */
