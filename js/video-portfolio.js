/**
 * Gary Of Cinema - Video Portfolio Functionality
 * Handles video gallery, filtering, and modal features
 * @version 2.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    /** @type {number} Current video index */
    let currentVideoIndex = 0;

    /** @type {HTMLElement[]} All video item elements */
    let videoItems = [];

    /** @type {HTMLElement[]} Currently filtered video items */
    let filteredVideos = [];

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
            info: 'linear-gradient(135deg, #48dbfb, #0abde3)',
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
    // VIDEO GALLERY INITIALIZATION
    // =========================================================================

    /**
     * Initialize video gallery with intersection observer
     */
    function initializeVideoGallery() {
        videoItems = Array.from(document.querySelectorAll('.video-item'));
        filteredVideos = [...videoItems];

        if (videoItems.length === 0) return;

        // Add fade-in animation to video items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.transition = 'all 0.6s ease';

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

        videoItems.forEach(item => {
            observer.observe(item);
        });
    }

    // =========================================================================
    // FILTER FUNCTIONALITY
    // =========================================================================

    /**
     * Initialize video filter buttons
     */
    function initializeVideoFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Get filter value and apply
                const filterValue = this.getAttribute('data-filter');
                filterVideoGallery(filterValue);
            });
        });
    }

    /**
     * Filter video gallery by category
     * @param {string} filter - Category to filter by ('all' for no filter)
     */
    function filterVideoGallery(filter) {
        const videoGallery = document.getElementById('videoGallery');
        if (!videoGallery) return;

        const items = videoGallery.querySelectorAll('.video-item');

        items.forEach(item => {
            const category = item.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });

        // Update filtered videos array
        filteredVideos = Array.from(items).filter(item => {
            const category = item.getAttribute('data-category');
            return filter === 'all' || category === filter;
        });

        // Show filter result notification
        const visibleCount = filteredVideos.filter(item => item.style.display !== 'none').length;
        const categoryLabel = filter === 'all' ? 'videos' : filter + ' videos';
        showNotification(`Showing ${visibleCount} ${categoryLabel}`, 'info');
    }

    // =========================================================================
    // VIDEO MODAL FUNCTIONALITY
    // =========================================================================

    /**
     * Initialize video modal event listeners
     */
    function initializeVideoModal() {
        const videoModal = document.getElementById('videoModal');
        if (!videoModal) return;

        // Close modal when clicking outside content
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                closeVideoModal();
            }
        });
    }

    /**
     * Play video - open modal with video info
     * @param {HTMLElement} button - Button that triggered the play action
     */
    function playVideo(button) {
        const videoItem = button.closest('.video-item');
        if (!videoItem) return;

        const videoInfo = videoItem.querySelector('.video-info');
        const titleEl = videoInfo ? videoInfo.querySelector('h3') : null;
        const title = titleEl ? titleEl.textContent : 'Video';

        // Set modal content
        const videoTitle = document.getElementById('videoTitle');
        if (videoTitle) {
            videoTitle.textContent = title;
        }

        // Show modal
        const videoModal = document.getElementById('videoModal');
        if (!videoModal) return;

        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add entrance animation
        const modalContent = videoModal.querySelector('.video-modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.8)';
            modalContent.style.opacity = '0';

            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            }, 10);
        }

        // Show notification about video source
        setTimeout(() => {
            showNotification('Video files are located in D:\\Belhaven files\\Video Projects', 'info');
        }, 1000);
    }

    /**
     * Close video modal with animation
     */
    function closeVideoModal() {
        const videoModal = document.getElementById('videoModal');
        if (!videoModal) return;

        const modalContent = videoModal.querySelector('.video-modal-content');

        if (modalContent) {
            modalContent.style.transform = 'scale(0.8)';
            modalContent.style.opacity = '0';
        }

        setTimeout(() => {
            videoModal.classList.remove('active');
            document.body.style.overflow = '';
            if (modalContent) {
                modalContent.style.transition = '';
            }
        }, 300);
    }

    // =========================================================================
    // SKILL BARS ANIMATION
    // =========================================================================

    /**
     * Initialize skill bars animation
     */
    function initializeSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');

        if (skillBars.length === 0) return;

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const targetWidth = skillBar.style.width;

                    // Reset width and animate
                    skillBar.style.width = '0%';
                    setTimeout(() => {
                        skillBar.style.width = targetWidth;
                    }, 500);

                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    }

    // =========================================================================
    // LOAD MORE FUNCTIONALITY
    // =========================================================================

    /**
     * Load additional videos into the gallery
     */
    function loadMoreVideos() {
        const videoGallery = document.getElementById('videoGallery');
        const loadMoreBtn = document.querySelector('.load-more-btn');

        if (!videoGallery || !loadMoreBtn) return;

        // Show loading state
        const originalContent = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
        loadMoreBtn.disabled = true;

        // Simulate loading delay (replace with actual API call in production)
        setTimeout(() => {
            const additionalVideos = [
                {
                    category: 'editing',
                    title: 'Advanced Editing Techniques',
                    description: 'Professional editing workflow',
                    duration: '18:45',
                    views: '2.8K',
                    color: '#fd79a8'
                },
                {
                    category: 'motion',
                    title: 'Logo Animation',
                    description: 'Brand identity motion graphics',
                    duration: '4:20',
                    views: '1.9K',
                    color: '#00d2d3'
                },
                {
                    category: 'gaming',
                    title: 'Multiplayer Highlights',
                    description: 'Best gaming moments compilation',
                    duration: '11:15',
                    views: '3.5K',
                    color: '#ff9f43'
                }
            ];

            additionalVideos.forEach((video, index) => {
                const videoItem = createVideoItem(video);
                videoGallery.appendChild(videoItem);

                // Add entrance animation with stagger
                setTimeout(() => {
                    videoItem.style.opacity = '1';
                    videoItem.style.transform = 'translateY(0)';
                }, index * 100);
            });

            // Update video items arrays
            videoItems = Array.from(document.querySelectorAll('.video-item'));
            filteredVideos = [...videoItems];

            // Reset button
            loadMoreBtn.innerHTML = originalContent;
            loadMoreBtn.disabled = false;

            showNotification('More videos loaded successfully!', 'success');
        }, 1500);
    }

    /**
     * Create a video item element
     * @param {Object} video - Video data object
     * @param {string} video.category - Video category
     * @param {string} video.title - Video title
     * @param {string} video.description - Video description
     * @param {string} video.duration - Video duration
     * @param {string} video.views - View count
     * @param {string} video.color - Background color for placeholder
     * @returns {HTMLElement} Video item element
     */
    function createVideoItem(video) {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.setAttribute('data-category', video.category);
        videoItem.style.opacity = '0';
        videoItem.style.transform = 'translateY(30px)';
        videoItem.style.transition = 'all 0.6s ease';

        // Create SVG placeholder image
        const svgContent = `
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="${video.color}"/>
                <text x="200" y="140" font-family="Arial" font-size="18" fill="white" text-anchor="middle">${video.title}</text>
                <text x="200" y="170" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${video.description}</text>
            </svg>
        `;
        const svgImage = `data:image/svg+xml;base64,${btoa(svgContent)}`;

        videoItem.innerHTML = `
            <div class="video-thumbnail">
                <img src="${svgImage}" alt="${video.title}" loading="lazy">
                <div class="video-overlay">
                    <div class="play-button" onclick="GaryVideo.playVideo(this)">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-info">
                        <h3>${video.title}</h3>
                        <p>${video.description}</p>
                        <div class="video-meta">
                            <span><i class="fas fa-clock"></i> ${video.duration}</span>
                            <span><i class="fas fa-eye"></i> ${video.views} views</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return videoItem;
    }

    // =========================================================================
    // CSS ANIMATIONS
    // =========================================================================

    /**
     * Inject required CSS animations
     */
    function injectStyles() {
        const styleId = 'video-portfolio-animations';
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

            .video-item {
                animation-fill-mode: both;
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize all video portfolio functionality
     */
    function init() {
        injectStyles();
        initializeVideoGallery();
        initializeVideoFilters();
        initializeVideoModal();
        initializeSkillBars();
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
    window.GaryVideo = {
        playVideo: playVideo,
        closeVideoModal: closeVideoModal,
        loadMoreVideos: loadMoreVideos
    };

    // Legacy support for existing onclick handlers
    window.playVideo = playVideo;
    window.closeVideoModal = closeVideoModal;
    window.loadMoreVideos = loadMoreVideos;

})();
