/**
 * Gary Of Cinema - Gallery Functionality
 * Handles photo gallery, filtering, and lightbox features
 * @version 2.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    /** @type {number} Current image index in lightbox */
    let currentImageIndex = 0;

    /** @type {HTMLElement[]} All gallery image elements */
    let galleryImages = [];

    /** @type {HTMLElement[]} Currently filtered gallery images */
    let filteredImages = [];

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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // =========================================================================
    // GALLERY INITIALIZATION
    // =========================================================================

    /**
     * Initialize gallery functionality with intersection observer
     */
    function initializeGallery() {
        galleryImages = Array.from(document.querySelectorAll('.gallery-item'));
        filteredImages = [...galleryImages];

        if (galleryImages.length === 0) return;

        // Add fade-in animation to gallery items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'all 0.6s ease';

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        galleryImages.forEach(item => {
            observer.observe(item);
        });
    }

    // =========================================================================
    // FILTER FUNCTIONALITY
    // =========================================================================

    /**
     * Initialize filter button functionality
     */
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Get filter value and apply
                const filterValue = this.getAttribute('data-filter');
                filterGallery(filterValue);
            });
        });
    }

    /**
     * Filter gallery items by category
     * @param {string} filter - Category to filter by ('all' for no filter)
     */
    function filterGallery(filter) {
        const galleryGrid = document.getElementById('photoGallery');
        if (!galleryGrid) return;

        const items = galleryGrid.querySelectorAll('.gallery-item');

        items.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });

        // Update filtered images array for lightbox navigation
        filteredImages = Array.from(items).filter(item => {
            const category = item.getAttribute('data-category');
            return filter === 'all' || category === filter;
        });
    }

    // =========================================================================
    // LIGHTBOX FUNCTIONALITY
    // =========================================================================

    /**
     * Initialize lightbox event listeners
     */
    function initializeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        // Close lightbox when clicking outside content
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        });
    }

    /**
     * Open lightbox with selected image
     * @param {HTMLElement} button - Button that triggered the lightbox
     */
    function openLightbox(button) {
        const galleryItem = button.closest('.gallery-item');
        if (!galleryItem) return;

        const img = galleryItem.querySelector('img');
        const titleEl = galleryItem.querySelector('h3');
        const descEl = galleryItem.querySelector('p');

        if (!img) return;

        const title = titleEl ? titleEl.textContent : '';
        const description = descEl ? descEl.textContent : '';

        // Find current image index in filtered images
        currentImageIndex = filteredImages.indexOf(galleryItem);

        // Set lightbox content
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');

        if (lightboxImage) {
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
        }
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDescription) lightboxDescription.textContent = description;

        // Show lightbox with animation
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add entrance animation
        const lightboxContent = lightbox.querySelector('.lightbox-content');
        if (lightboxContent) {
            lightboxContent.style.transform = 'scale(0.8)';
            lightboxContent.style.opacity = '0';

            setTimeout(() => {
                lightboxContent.style.transition = 'all 0.3s ease';
                lightboxContent.style.transform = 'scale(1)';
                lightboxContent.style.opacity = '1';
            }, 10);
        }
    }

    /**
     * Close the lightbox with animation
     */
    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const lightboxContent = lightbox.querySelector('.lightbox-content');

        if (lightboxContent) {
            lightboxContent.style.transform = 'scale(0.8)';
            lightboxContent.style.opacity = '0';
        }

        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            if (lightboxContent) {
                lightboxContent.style.transition = '';
            }
        }, 300);
    }

    /**
     * Navigate to previous image in lightbox
     */
    function previousImage() {
        if (filteredImages.length === 0) return;

        currentImageIndex = currentImageIndex > 0
            ? currentImageIndex - 1
            : filteredImages.length - 1;

        updateLightboxImage();
    }

    /**
     * Navigate to next image in lightbox
     */
    function nextImage() {
        if (filteredImages.length === 0) return;

        currentImageIndex = currentImageIndex < filteredImages.length - 1
            ? currentImageIndex + 1
            : 0;

        updateLightboxImage();
    }

    /**
     * Update lightbox with current image
     */
    function updateLightboxImage() {
        const currentItem = filteredImages[currentImageIndex];
        if (!currentItem) return;

        const img = currentItem.querySelector('img');
        const titleEl = currentItem.querySelector('h3');
        const descEl = currentItem.querySelector('p');

        if (!img) return;

        const title = titleEl ? titleEl.textContent : '';
        const description = descEl ? descEl.textContent : '';

        // Add transition effect
        const lightboxImage = document.getElementById('lightbox-image');
        if (lightboxImage) {
            lightboxImage.style.opacity = '0';

            setTimeout(() => {
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;

                const lightboxTitle = document.getElementById('lightbox-title');
                const lightboxDescription = document.getElementById('lightbox-description');

                if (lightboxTitle) lightboxTitle.textContent = title;
                if (lightboxDescription) lightboxDescription.textContent = description;

                lightboxImage.style.opacity = '1';
            }, 150);
        }
    }

    // =========================================================================
    // LOAD MORE FUNCTIONALITY
    // =========================================================================

    /**
     * Load additional photos into the gallery
     */
    function loadMorePhotos() {
        const galleryGrid = document.getElementById('photoGallery');
        const loadMoreBtn = document.querySelector('.load-more-btn');

        if (!galleryGrid || !loadMoreBtn) return;

        // Show loading state
        const originalContent = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
        loadMoreBtn.disabled = true;

        // Simulate loading delay (replace with actual API call in production)
        setTimeout(() => {
            const additionalPhotos = [
                {
                    category: 'events',
                    title: 'Conference Event',
                    description: 'Professional conference coverage',
                    color: '#ff9f43'
                },
                {
                    category: 'portraits',
                    title: 'Group Portrait',
                    description: 'Team photography session',
                    color: '#ee5a24'
                },
                {
                    category: 'artistic',
                    title: 'Light Study',
                    description: 'Experimental lighting work',
                    color: '#0abde3'
                }
            ];

            additionalPhotos.forEach((photo, index) => {
                const galleryItem = createGalleryItem(photo);
                galleryGrid.appendChild(galleryItem);

                // Add entrance animation with stagger
                setTimeout(() => {
                    galleryItem.style.opacity = '1';
                    galleryItem.style.transform = 'translateY(0)';
                }, index * 100);
            });

            // Update gallery images arrays
            galleryImages = Array.from(document.querySelectorAll('.gallery-item'));
            filteredImages = [...galleryImages];

            // Reset button
            loadMoreBtn.innerHTML = originalContent;
            loadMoreBtn.disabled = false;

            showNotification('More photos loaded successfully!', 'success');
        }, 1500);
    }

    /**
     * Create a gallery item element
     * @param {Object} photo - Photo data object
     * @param {string} photo.category - Photo category
     * @param {string} photo.title - Photo title
     * @param {string} photo.description - Photo description
     * @param {string} photo.color - Background color for placeholder
     * @returns {HTMLElement} Gallery item element
     */
    function createGalleryItem(photo) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-category', photo.category);
        galleryItem.style.opacity = '0';
        galleryItem.style.transform = 'translateY(30px)';
        galleryItem.style.transition = 'all 0.6s ease';

        // Create SVG placeholder image
        const svgContent = `
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="${photo.color}"/>
                <text x="200" y="150" font-family="Arial" font-size="18" fill="white" text-anchor="middle">${photo.title}</text>
            </svg>
        `;
        const svgImage = `data:image/svg+xml;base64,${btoa(svgContent)}`;

        galleryItem.innerHTML = `
            <div class="gallery-image">
                <img src="${svgImage}" alt="${photo.title}" loading="lazy">
                <div class="gallery-overlay">
                    <div class="overlay-content">
                        <h3>${photo.title}</h3>
                        <p>${photo.description}</p>
                        <button class="view-btn" onclick="GaryGallery.openLightbox(this)">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return galleryItem;
    }

    // =========================================================================
    // CSS ANIMATIONS
    // =========================================================================

    /**
     * Inject required CSS animations
     */
    function injectStyles() {
        const styleId = 'gallery-animations';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize all gallery functionality
     */
    function init() {
        injectStyles();
        initializeGallery();
        initializeFilters();
        initializeLightbox();
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

    // Expose necessary functions globally for onclick handlers
    window.GaryGallery = {
        openLightbox: openLightbox,
        closeLightbox: closeLightbox,
        previousImage: previousImage,
        nextImage: nextImage,
        loadMorePhotos: loadMorePhotos
    };

    // Legacy support for existing onclick handlers
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.previousImage = previousImage;
    window.nextImage = nextImage;
    window.loadMorePhotos = loadMorePhotos;

})();
