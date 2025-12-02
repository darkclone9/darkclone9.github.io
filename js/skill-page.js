/**
 * Gary Of Cinema - Skill Page JavaScript
 * Handles skill page animations, progress bars, and navigation
 * @version 2.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    const CONFIG = {
        DEBUG: false,
        ANIMATION_STEP_DURATION: 40,
        ANIMATION_STEPS: 50
    };

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Log message only in debug mode
     * @param {...any} args - Arguments to log
     */
    function debugLog(...args) {
        if (CONFIG.DEBUG) {
            console.log(...args);
        }
    }

    /**
     * Get proficiency level text based on percentage
     * @param {number} level - Proficiency level (0-100)
     * @returns {string} Level description
     */
    function getLevelText(level) {
        if (level >= 90) return 'Expert';
        if (level >= 80) return 'Advanced';
        if (level >= 60) return 'Intermediate';
        if (level >= 40) return 'Beginner';
        return 'Learning';
    }

    // =========================================================================
    // PROGRESS BAR ANIMATIONS
    // =========================================================================

    /**
     * Animate percentage text display
     * @param {number} targetLevel - Target percentage value
     */
    function animatePercentage(targetLevel) {
        const proficiencyText = document.querySelector('.proficiency-text');
        if (!proficiencyText) return;

        let currentLevel = 0;
        const increment = targetLevel / CONFIG.ANIMATION_STEPS;

        const timer = setInterval(() => {
            currentLevel += increment;
            if (currentLevel >= targetLevel) {
                currentLevel = targetLevel;
                clearInterval(timer);
            }

            const levelText = getLevelText(Math.round(currentLevel));
            proficiencyText.textContent = `${levelText} (${Math.round(currentLevel)}%)`;
        }, CONFIG.ANIMATION_STEP_DURATION);
    }

    /**
     * Initialize progress bar animations with intersection observer
     */
    function initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');

        if (progressBars.length === 0) return;

        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const level = progressBar.getAttribute('data-level');

                    if (level) {
                        // Set CSS custom property for animation
                        progressBar.style.setProperty('--progress-width', level + '%');

                        // Add animation class
                        progressBar.classList.add('animate');

                        // Animate the percentage text
                        animatePercentage(parseInt(level, 10));
                    }

                    progressObserver.unobserve(progressBar);
                }
            });
        }, {
            threshold: 0.5
        });

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });
    }

    // =========================================================================
    // SCROLL ANIMATIONS
    // =========================================================================

    /**
     * Add hover effects to interactive elements
     */
    function addHoverEffects() {
        // Application items
        const applicationItems = document.querySelectorAll('.application-item');
        applicationItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Project items
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px)';
                this.style.borderLeftWidth = '6px';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
                this.style.borderLeftWidth = '4px';
            });
        });

        // Integration items
        const integrationItems = document.querySelectorAll('.integration-item');
        integrationItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(5deg)';
                }
            });

            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    /**
     * Initialize scroll-triggered animations
     */
    function initializeAnimations() {
        const animatedElements = document.querySelectorAll('.content-card');

        if (animatedElements.length === 0) return;

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animations
                    setTimeout(() => {
                        entry.target.style.animationDelay = '0s';
                        entry.target.classList.add('animate-in');
                    }, index * 100);

                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });

        // Add hover effects to interactive elements
        addHoverEffects();
    }

    // =========================================================================
    // NAVIGATION ENHANCEMENTS
    // =========================================================================

    /**
     * Highlight current page in navigation
     */
    function highlightActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.skill-nav-link');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
                link.style.background = 'rgba(255, 107, 107, 0.2)';
                link.style.color = 'var(--primary-coral)';
            }
        });
    }

    /**
     * Add keyboard navigation support
     */
    function addKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // ESC key to go back
            if (e.key === 'Escape') {
                const backBtn = document.querySelector('.back-btn');
                if (backBtn) {
                    backBtn.click();
                }
            }

            // Arrow keys for navigation between skill pages
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const navLinks = document.querySelectorAll('.skill-nav-link');
                const currentPage = window.location.pathname.split('/').pop();
                const currentIndex = Array.from(navLinks).findIndex(link =>
                    link.getAttribute('href') === currentPage
                );

                if (currentIndex === -1) return;

                let nextIndex;
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
                } else {
                    nextIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
                }

                if (navLinks[nextIndex]) {
                    window.location.href = navLinks[nextIndex].getAttribute('href');
                }
            }
        });
    }

    /**
     * Initialize navigation enhancements
     */
    function initializeNavigation() {
        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const skillNav = document.querySelector('.skill-nav');
                    const navHeight = skillNav ? skillNav.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        highlightActiveNavigation();
        addKeyboardNavigation();
    }

    // =========================================================================
    // PERFORMANCE OPTIMIZATIONS
    // =========================================================================

    /**
     * Lazy load images with data-src attribute
     */
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if (images.length === 0) return;

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.getAttribute('data-src');
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }

    /**
     * Optimize animations for device capabilities
     */
    function optimizeAnimationsForDevice() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');

            // Inject reduced motion styles
            const styleId = 'reduced-motion-styles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    .reduced-motion * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Check device memory capabilities
        if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
            document.body.classList.add('low-memory-device');

            // Reduce animation complexity
            const contentCards = document.querySelectorAll('.content-card');
            contentCards.forEach(card => {
                card.style.backdropFilter = 'none';
            });
        }
    }

    /**
     * Monitor and log page performance using modern API
     */
    function monitorPagePerformance() {
        if (!('performance' in window) || !performance.getEntriesByType) {
            return;
        }

        window.addEventListener('load', function() {
            setTimeout(() => {
                const navigationEntries = performance.getEntriesByType('navigation');
                const paintEntries = performance.getEntriesByType('paint');

                if (navigationEntries.length > 0) {
                    const navigation = navigationEntries[0];
                    const loadTime = Math.round(navigation.loadEventEnd - navigation.startTime);

                    debugLog(`Skill page loaded in ${loadTime}ms`);
                    debugLog('Performance Metrics:');
                    debugLog(`- DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)}ms`);

                    paintEntries.forEach(entry => {
                        debugLog(`- ${entry.name}: ${Math.round(entry.startTime)}ms`);
                    });
                }
            }, 100);
        });
    }

    /**
     * Initialize all performance optimizations
     */
    function initializePerformanceOptimizations() {
        lazyLoadImages();
        optimizeAnimationsForDevice();
        monitorPagePerformance();
    }

    // =========================================================================
    // MAIN INITIALIZATION
    // =========================================================================

    /**
     * Initialize all skill page functionality
     */
    function initializeSkillPage() {
        // Remove loading state
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        initializeProgressBars();
        initializeAnimations();
        initializeNavigation();
        initializePerformanceOptimizations();

        debugLog('Skill page initialized successfully');
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSkillPage);
    } else {
        initializeSkillPage();
    }

    // =========================================================================
    // ERROR HANDLING
    // =========================================================================

    window.addEventListener('error', function(e) {
        if (CONFIG.DEBUG) {
            console.error('Skill page error:', e.error);
        }
    });

    // =========================================================================
    // PUBLIC API & EXPORTS
    // =========================================================================

    // Expose for testing (CommonJS compatibility)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            initializeSkillPage,
            initializeProgressBars,
            getLevelText
        };
    }

})();
