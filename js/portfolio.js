/**
 * Gary Of Cinema - Portfolio Page Functionality
 * Handles portfolio animations, card interactions, and sharing features
 * @version 2.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Show notification message to user
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'info', 'error')
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');

        const backgrounds = {
            success: 'linear-gradient(135deg, #26de81, #20bf6b)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)',
            error: 'linear-gradient(135deg, #ee5a24, #ea2027)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${backgrounds[type] || backgrounds.info};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // =========================================================================
    // PORTFOLIO ANIMATIONS
    // =========================================================================

    /**
     * Initialize portfolio page animations
     */
    function initializePortfolioAnimations() {
        // Animate hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(50px)';

            setTimeout(() => {
                heroContent.style.transition = 'all 1s ease';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }

        // Create intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });

        // Observe stats items
        const statsItems = document.querySelectorAll('.stat-item');
        statsItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s ease';
            observer.observe(item);
        });
    }

    // =========================================================================
    // PORTFOLIO CARD INTERACTIONS
    // =========================================================================

    /**
     * Initialize portfolio card interactions
     */
    function initializePortfolioCards() {
        const categoryCards = document.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            // Hover effects
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });

            // Click animation (when not clicking the button)
            card.addEventListener('click', function(e) {
                if (e.target.closest('.card-button')) return;

                const button = this.querySelector('.card-button');
                if (button) {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = 'translateY(-10px) scale(1.02)';
                        window.location.href = button.href;
                    }, 150);
                }
            });

            // Button loading state
            const cardButton = card.querySelector('.card-button');
            if (cardButton) {
                cardButton.addEventListener('click', function(e) {
                    e.preventDefault();

                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
                    this.style.pointerEvents = 'none';

                    setTimeout(() => {
                        window.location.href = this.href;
                    }, 800);
                });
            }
        });
    }

    // =========================================================================
    // PORTFOLIO STATS ANIMATIONS
    // =========================================================================

    /**
     * Animate a number from 0 to target value
     * @param {HTMLElement} element - Element to update
     * @param {number} target - Target number
     * @param {number} duration - Animation duration in ms
     */
    function animateNumber(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Format number with + suffix for larger numbers
            let displayValue = Math.floor(current);
            if (target >= 50) {
                displayValue = displayValue + '+';
            }

            element.textContent = displayValue;
        }, 16);
    }

    /**
     * Initialize portfolio stats animations
     */
    function initializePortfolioStats() {
        const heroStats = document.querySelectorAll('.hero-stats .stat');

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target.querySelector('.stat-number');
                    if (!statNumber) return;

                    const targetText = statNumber.textContent;
                    const targetNumber = parseInt(targetText.replace(/\D/g, ''));

                    if (targetNumber) {
                        statNumber.textContent = '0';
                        setTimeout(() => {
                            animateNumber(statNumber, targetNumber);
                        }, 500);
                    }

                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        heroStats.forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    // =========================================================================
    // SHARE FUNCTIONALITY
    // =========================================================================

    /** @type {HTMLElement|null} Current share modal reference */
    let currentShareModal = null;

    /**
     * Share portfolio using Web Share API or fallback
     */
    function sharePortfolio() {
        if (navigator.share) {
            navigator.share({
                title: "Gary's Creative Portfolio",
                text: "Check out Gary's amazing creative work across design, photography, and development!",
                url: window.location.href
            }).then(() => {
                showNotification('Portfolio shared successfully!', 'success');
            }).catch((error) => {
                // User cancelled or error occurred
                if (error.name !== 'AbortError') {
                    fallbackShare();
                }
            });
        } else {
            fallbackShare();
        }
    }

    /**
     * Fallback share functionality using clipboard
     */
    function fallbackShare() {
        const url = window.location.href;

        // Use modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Portfolio link copied to clipboard!', 'success');
            }).catch(() => {
                showShareModal();
            });
        } else {
            showShareModal();
        }
    }

    /**
     * Show share modal with copy functionality
     */
    function showShareModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        modalContent.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #333;">Share Portfolio</h3>
            <p style="margin-bottom: 20px; color: #666;">Copy the link below to share:</p>
            <input type="text" value="${window.location.href}" readonly style="
                width: 100%;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 14px;
                box-sizing: border-box;
            ">
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="copy-btn" style="
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Copy Link</button>
                <button class="close-btn" style="
                    padding: 10px 20px;
                    background: #ddd;
                    color: #333;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Store modal reference
        currentShareModal = modal;

        // Add event listeners
        const copyBtn = modalContent.querySelector('.copy-btn');
        const closeBtn = modalContent.querySelector('.close-btn');
        const input = modalContent.querySelector('input');

        copyBtn.addEventListener('click', () => {
            copyShareLink(input);
        });

        closeBtn.addEventListener('click', closeShareModal);

        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeShareModal();
            }
        });
    }

    /**
     * Copy share link to clipboard
     * @param {HTMLInputElement} input - Input element containing the URL
     */
    function copyShareLink(input) {
        if (!input) {
            input = currentShareModal?.querySelector('input');
        }

        if (!input) return;

        const url = input.value;

        // Use modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copied to clipboard!', 'success');
                closeShareModal();
            }).catch(() => {
                // Fallback: select and copy
                input.select();
                input.setSelectionRange(0, 99999); // For mobile
                showNotification('Please press Ctrl+C to copy', 'info');
            });
        } else {
            // Legacy fallback
            input.select();
            input.setSelectionRange(0, 99999);
            showNotification('Please press Ctrl+C to copy', 'info');
        }
    }

    /**
     * Close share modal
     */
    function closeShareModal() {
        if (currentShareModal && currentShareModal.parentNode) {
            currentShareModal.parentNode.removeChild(currentShareModal);
            currentShareModal = null;
        }
    }

    // =========================================================================
    // SMOOTH SCROLLING
    // =========================================================================

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // =========================================================================
    // EXTERNAL LINKS
    // =========================================================================

    /**
     * Add loading states for external links
     */
    function initializeExternalLinks() {
        document.querySelectorAll('a[href^="http"], a[href^="mailto"]').forEach(link => {
            link.addEventListener('click', function() {
                const originalText = this.textContent;
                this.textContent = 'Opening...';

                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    }

    // =========================================================================
    // LAZY LOADING
    // =========================================================================

    /**
     * Initialize lazy loading for images
     */
    function initializeLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize all portfolio functionality
     */
    function init() {
        initializePortfolioAnimations();
        initializePortfolioCards();
        initializePortfolioStats();
        initializeSmoothScrolling();
        initializeExternalLinks();
        initializeLazyLoading();
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    // Expose necessary functions globally
    window.GaryPortfolio = {
        sharePortfolio: sharePortfolio,
        closeShareModal: closeShareModal
    };

    // Legacy support for existing onclick handlers
    window.sharePortfolio = sharePortfolio;
    window.copyShareLink = copyShareLink;
    window.closeShareModal = closeShareModal;

})();
