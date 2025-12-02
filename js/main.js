/**
 * Gary Of Cinema - Main Site JavaScript
 * Optimized for performance and maintainability
 * @version 2.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    const CONFIG = {
        DEBUG: false, // Set to true for development logging
        ANIMATION_DELAY: 100,
        THROTTLE_DELAY: 16, // ~60fps
        SCROLL_THROTTLE: 100,
        TYPEWRITER_SPEED: 50,
        SLOW_CONNECTION_THRESHOLD: 2000,
        FAST_CONNECTION_THRESHOLD: 1000
    };

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Throttle function execution to limit call frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between calls in ms
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

    /**
     * Debounce function execution to delay until after calls stop
     * @param {Function} func - Function to debounce
     * @param {number} wait - Time to wait after last call in ms
     * @param {boolean} immediate - Execute on leading edge
     * @returns {Function} Debounced function
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Log message only in debug mode
     * @param {...any} args - Arguments to log
     */
    function debugLog(...args) {
        if (CONFIG.DEBUG) {
            console.log(...args);
        }
    }

    // =========================================================================
    // TYPEWRITER EFFECT
    // =========================================================================

    /** @type {number|null} Active typewriter interval ID */
    let typewriterInterval = null;

    /**
     * Add typewriter effect to an element
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to type
     */
    function addTypewriterEffect(element, text) {
        // Clear any existing typewriter interval to prevent memory leaks
        if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }

        element.innerHTML = '';
        element.style.borderRight = '2px solid var(--primary-coral)';
        element.style.animation = 'blinkCursor 1s infinite';

        let i = 0;
        typewriterInterval = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typewriterInterval);
                typewriterInterval = null;
                setTimeout(() => {
                    element.style.borderRight = 'none';
                    element.style.animation = 'none';
                }, 1000);
            }
        }, CONFIG.TYPEWRITER_SPEED);
    }

    // =========================================================================
    // IMMEDIATE VISUAL IMPACT
    // =========================================================================

    /**
     * Initialize animations that should start immediately
     */
    function initializeImmediateAnimations() {
        const heroSection = document.querySelector('.hero-section');
        const taglineText = document.querySelector('.tagline-text');
        const skillBadges = document.querySelectorAll('.skill-badge');

        // Ensure hero section is visible immediately
        if (heroSection) {
            heroSection.style.opacity = '1';
        }

        // Add typewriter effect to tagline
        if (taglineText) {
            addTypewriterEffect(taglineText, 'Creative Graphic Designer & Digital Artist');
        }

        // Stagger skill badge animations
        skillBadges.forEach((badge, index) => {
            badge.style.animationDelay = `${0.8 + (index * 0.1)}s`;
        });
    }

    // =========================================================================
    // NAVIGATION FUNCTIONALITY
    // =========================================================================

    /**
     * Update active state on navigation link
     * @param {HTMLElement} activeLink - Link to mark as active
     */
    function updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    /**
     * Update navigation based on scroll position
     */
    function updateNavigationOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const navHeight = navbar.offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (correspondingNavLink) {
                    updateActiveNavLink(correspondingNavLink);
                }
            }
        });
    }

    /**
     * Initialize navigation functionality
     */
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const navbar = document.querySelector('.navbar');
                    const navHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    updateActiveNavLink(this);
                }
            });
        });

        // Update active navigation on scroll
        window.addEventListener('scroll', throttle(updateNavigationOnScroll, CONFIG.SCROLL_THROTTLE));
    }

    // =========================================================================
    // ANIMATION CONTROLS
    // =========================================================================

    /**
     * Toggle animation play state
     * @param {boolean} pause - Whether to pause animations
     */
    function toggleAnimations(pause) {
        const animatedElements = document.querySelectorAll('.shape, .hero-text-line');

        animatedElements.forEach(element => {
            element.style.animationPlayState = pause ? 'paused' : 'running';
        });
    }

    /**
     * Initialize scroll-triggered animations using IntersectionObserver
     */
    function initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.works-section, .about-section, .blog-section, .contact-section');
        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Initialize animation controls
     */
    function initializeAnimations() {
        const animationControl = document.querySelector('.animation-control');
        let animationsPaused = false;

        if (animationControl) {
            animationControl.addEventListener('click', function() {
                animationsPaused = !animationsPaused;
                toggleAnimations(animationsPaused);

                const icon = this.querySelector('i');
                if (animationsPaused) {
                    icon.className = 'fas fa-play';
                    this.setAttribute('aria-label', 'Resume animations');
                } else {
                    icon.className = 'fas fa-pause';
                    this.setAttribute('aria-label', 'Pause animations');
                }
            });
        }

        initializeScrollAnimations();
    }

    // =========================================================================
    // SCROLL EFFECTS
    // =========================================================================

    /**
     * Update parallax effect on background shapes
     * @param {number} scrollY - Current scroll position
     */
    function updateParallaxEffect(scrollY) {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrollY * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Initialize scroll-based effects
     */
    function initializeScrollEffects() {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', throttle(function() {
            const currentScrollY = window.scrollY;
            const navbar = document.querySelector('.navbar');

            if (navbar) {
                // Hide/show navbar on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }

                // Add background to navbar when scrolled
                if (currentScrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Parallax effect for background shapes
            updateParallaxEffect(currentScrollY);

            lastScrollY = currentScrollY;
        }, CONFIG.THROTTLE_DELAY));
    }

    // =========================================================================
    // MOBILE MENU
    // =========================================================================

    /**
     * Initialize mobile menu functionality
     */
    function initializeMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                this.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('mobile-open');

                // Animate hamburger lines
                const lines = this.querySelectorAll('.hamburger-line');
                lines.forEach(line => {
                    line.classList.toggle('active');
                });
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    navLinks.classList.remove('mobile-open');
                    mobileToggle.setAttribute('aria-expanded', 'false');

                    const lines = mobileToggle.querySelectorAll('.hamburger-line');
                    lines.forEach(line => line.classList.remove('active'));
                });
            });
        }
    }

    // =========================================================================
    // ACCESSIBILITY
    // =========================================================================

    /**
     * Initialize accessibility features
     */
    function initializeAccessibility() {
        // Keyboard navigation detection
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });

        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    // =========================================================================
    // PERFORMANCE OPTIMIZATIONS
    // =========================================================================

    /**
     * Preload critical resources
     */
    function preloadResources() {
        const criticalImages = ['./assets/profile.jpg'];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize lazy loading for non-critical elements
     */
    function initializeLazyLoading() {
        const lazyElements = document.querySelectorAll('[data-lazy]');

        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded');
                        lazyObserver.unobserve(entry.target);
                    }
                });
            });

            lazyElements.forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }

    /**
     * Optimize for slow network connections
     */
    function optimizeForSlowConnection() {
        debugLog('Optimizing for slow connection...');

        // Reduce animation complexity
        const shapes = document.querySelectorAll('.shape, .organic-shape');
        shapes.forEach(shape => {
            shape.style.display = 'none';
        });

        // Simplify hover effects
        document.body.classList.add('reduced-animations');

        // Disable non-critical animations
        toggleAnimations(true);
    }

    /**
     * Enhance experience for fast connections
     */
    function enhanceForFastConnection() {
        debugLog('Enhancing for fast connection...');
        document.body.classList.add('enhanced-animations');
    }

    /**
     * Log performance metrics using modern API
     */
    function logPerformanceMetrics() {
        if (!('performance' in window) || !performance.getEntriesByType) {
            return;
        }

        const navigationEntries = performance.getEntriesByType('navigation');
        const paintEntries = performance.getEntriesByType('paint');

        if (navigationEntries.length > 0) {
            const navigation = navigationEntries[0];

            debugLog('📊 Performance Metrics:');
            debugLog(`- DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
            debugLog(`- Server Response: ${Math.round(navigation.responseEnd - navigation.requestStart)}ms`);
            debugLog(`- DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)}ms`);
            debugLog(`- Load Complete: ${Math.round(navigation.loadEventEnd - navigation.startTime)}ms`);

            paintEntries.forEach(entry => {
                debugLog(`- ${entry.name}: ${Math.round(entry.startTime)}ms`);
            });
        }
    }

    /**
     * Get page load time using modern Performance API
     * @returns {number} Load time in milliseconds
     */
    function getPageLoadTime() {
        if (!('performance' in window) || !performance.getEntriesByType) {
            return 0;
        }

        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
            const navigation = navigationEntries[0];
            return Math.round(navigation.loadEventEnd - navigation.startTime);
        }

        return 0;
    }

    // =========================================================================
    // ENHANCED USER EXPERIENCE
    // =========================================================================

    /**
     * Initialize enhanced UX features
     */
    function initializeEnhancedUX() {
        // Add touch support for mobile
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Add connection awareness
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');
                toggleAnimations(true);
            }
        }
    }

    // =========================================================================
    // SKILL SHOWCASE INTERACTIONS
    // =========================================================================

    /**
     * Show navigation preview for skill badge
     * @param {HTMLElement} badge - Skill badge element
     */
    function showNavigationPreview(badge) {
        const skillName = badge.textContent.trim();
        const href = badge.getAttribute('href');

        const preview = document.createElement('div');
        preview.className = 'skill-preview';
        preview.innerHTML = `
            <div class="preview-content">
                <h4>Exploring ${skillName}</h4>
                <p>Click to view detailed expertise and project examples</p>
                <div class="preview-arrow">→</div>
            </div>
        `;

        preview.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            font-size: 0.9rem;
            max-width: 300px;
            text-align: center;
            z-index: 10000;
            animation: fadeInScale 0.3s ease-out;
            border: 2px solid var(--primary-coral);
        `;

        document.body.appendChild(preview);

        // Auto-remove preview and navigate
        setTimeout(() => {
            preview.style.opacity = '0';
            setTimeout(() => {
                if (preview.parentNode) {
                    preview.parentNode.removeChild(preview);
                }
                if (href) {
                    window.location.href = href;
                }
            }, 200);
        }, 1500);
    }

    /**
     * Initialize skill showcase interactions
     */
    function initializeSkillShowcase() {
        const skillBadges = document.querySelectorAll('.skill-badge');

        skillBadges.forEach(badge => {
            // Add hover effects
            badge.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                this.style.borderColor = 'var(--primary-coral)';
            });

            badge.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                this.style.borderColor = 'transparent';
            });

            // Add click interaction with navigation preview
            badge.addEventListener('click', function(e) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-3px) scale(1.05)';
                }, 100);

                showNavigationPreview(this);
            });
        });
    }

    // =========================================================================
    // FADE-IN ANIMATIONS
    // =========================================================================

    /**
     * Initialize fade-in animations for page elements
     */
    function initializeFadeInAnimations() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            const fadeElements = document.querySelectorAll('.fade-in-element');
            fadeElements.forEach(element => {
                element.classList.add('visible');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const fadeInObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, CONFIG.ANIMATION_DELAY);

                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const fadeElements = document.querySelectorAll('.fade-in-element');
        fadeElements.forEach(element => {
            fadeInObserver.observe(element);
        });

        // Add staggered delays for project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.style.transitionDelay = `${0.2 + (index * 0.1)}s`;
        });
    }

    // =========================================================================
    // DELAYED ANIMATIONS
    // =========================================================================

    /**
     * Initialize animations that should start after page load
     */
    function initializeDelayedAnimations() {
        // Start background shape animations after critical content loads
        const shapes = document.querySelectorAll('.shape, .organic-shape');
        shapes.forEach(shape => {
            shape.style.animationPlayState = 'running';
        });

        // Initialize scroll-triggered animations
        initializeScrollAnimations();

        // Performance monitoring using modern API
        if ('performance' in window && performance.getEntriesByType) {
            // Wait for load event to complete
            setTimeout(() => {
                const loadTime = getPageLoadTime();
                debugLog(`🎨 Gary's Portfolio loaded in ${loadTime}ms`);

                // Performance optimization based on load time
                if (loadTime > CONFIG.SLOW_CONNECTION_THRESHOLD) {
                    document.body.classList.add('slow-connection');
                    optimizeForSlowConnection();
                } else if (loadTime < CONFIG.FAST_CONNECTION_THRESHOLD && loadTime > 0) {
                    document.body.classList.add('fast-connection');
                    enhanceForFastConnection();
                }

                logPerformanceMetrics();
            }, 100);
        }
    }

    // =========================================================================
    // WORKS SECTION FUNCTIONALITY
    // =========================================================================

    /**
     * Expand works section with visual feedback
     */
    function expandWorksSection() {
        const worksSection = document.getElementById('works');
        if (worksSection) {
            worksSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            setTimeout(() => {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #ff6b6b, #feca57);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                `;
                notification.textContent = 'Portfolio expansion coming soon! Check out the Featured Projects above.';

                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.style.transform = 'translateX(0)';
                }, 100);

                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 4000);
            }, 500);
        }
    }

    // =========================================================================
    // MAIN INITIALIZATION
    // =========================================================================

    /**
     * Main application initialization
     */
    function initializeApp() {
        initializeImmediateAnimations();
        initializeNavigation();
        initializeAnimations();
        initializeScrollEffects();
        initializeMobileMenu();
        initializeAccessibility();
        initializeSkillShowcase();
        initializeFadeInAnimations();
        debugLog('Gary Portfolio - Graphic Design Showcase Initialized');
    }

    // =========================================================================
    // EVENT LISTENERS & STARTUP
    // =========================================================================

    // Critical performance optimization - start immediately
    document.body.classList.add('loading');

    // Initialize critical animations as soon as possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    // Ensure smooth loading experience
    window.addEventListener('load', function() {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        // Start non-critical animations after load
        setTimeout(initializeDelayedAnimations, CONFIG.ANIMATION_DELAY);
    });

    // Initialize performance optimizations
    preloadResources();
    initializeLazyLoading();
    initializeEnhancedUX();

    // Error handling
    window.addEventListener('error', function(e) {
        if (CONFIG.DEBUG) {
            console.error('JavaScript error:', e.error);
        }
    });

    // =========================================================================
    // PUBLIC API (Expose necessary functions globally)
    // =========================================================================

    window.expandWorksSection = expandWorksSection;

    // Export for testing (CommonJS compatibility)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            initializeApp,
            throttle,
            debounce
        };
    }

})();
