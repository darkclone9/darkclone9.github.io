/**
 * Blog Management System
 * Dynamically loads and renders blog posts from data/blogs.json
 */

class BlogManager {
  constructor() {
    this.posts = [];
    this.categories = [];
    this.currentCategory = 'all';
    this.modal = document.getElementById('blog-modal');
    
    this.init();
  }

  async init() {
    await this.loadBlogData();
    this.renderCategories();
    this.renderFeaturedPost();
    this.renderBlogPosts();
    this.setupEventListeners();
  }

  async loadBlogData() {
    try {
      const response = await fetch('data/blogs.json');
      const data = await response.json();
      this.posts = data.posts;
      this.categories = data.categories;
    } catch (error) {
      console.error('Error loading blog data:', error);
      this.posts = [];
      this.categories = [];
    }
  }

  renderCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <button class="category-btn ${cat.id === 'all' ? 'active' : ''}" 
              data-category="${cat.id}">
        ${cat.name} ${cat.count ? `(${cat.count})` : ''}
      </button>
    `).join('');
  }

  renderFeaturedPost() {
    const container = document.getElementById('featured-post');
    if (!container) return;

    const featured = this.posts.find(post => post.featured);
    if (!featured) return;

    container.innerHTML = `
      <img src="${featured.image}" alt="${featured.title}" class="post-image">
      <div class="post-content">
        <div class="post-meta">
          <span class="post-category">${featured.category}</span>
          <span class="post-date">${this.formatDate(featured.date)}</span>
          <span class="post-read-time">${featured.readTime}</span>
        </div>
        <h3 class="post-title">${featured.title}</h3>
        <p class="post-excerpt">${featured.excerpt}</p>
        <a href="#" class="read-more" data-post-id="${featured.id}">
          Read Article <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
  }

  renderBlogPosts() {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    const filteredPosts = this.currentCategory === 'all' 
      ? this.posts 
      : this.posts.filter(post => post.category.toLowerCase() === this.currentCategory);

    container.innerHTML = filteredPosts.map(post => `
      <article class="blog-card" data-post-id="${post.id}">
        <img src="${post.image}" alt="${post.title}" class="card-image">
        <div class="card-content">
          <div class="card-meta">
            <span class="card-category">${post.category}</span>
            <span class="card-date">${this.formatDate(post.date)}</span>
          </div>
          <h3 class="card-title">${post.title}</h3>
          <p class="card-excerpt">${post.excerpt}</p>
          <div class="card-footer">
            <span class="read-time">${post.readTime}</span>
            <span class="read-more-link">
              Read More <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </article>
    `).join('');
  }

  openModal(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const modalContent = document.getElementById('modal-content');
    const modalBody = modalContent.querySelector('.modal-body');

    modalBody.innerHTML = `
      <img src="${post.image}" alt="${post.title}" class="post-image">
      <div class="post-meta">
        <span class="post-category">${post.category}</span>
        <span class="post-date">${this.formatDate(post.date)}</span>
        <span class="post-author">By ${post.author}</span>
        <span class="post-read-time">${post.readTime}</span>
      </div>
      <h1 class="post-title">${post.title}</h1>
      <div class="post-content">${post.content}</div>
      <div class="post-tags">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    `;

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  setupEventListeners() {
    // Category filter clicks
    document.getElementById('category-filters')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.dataset.category;
        this.renderBlogPosts();
      }
    });

    // Featured post read more
    document.getElementById('featured-post')?.addEventListener('click', (e) => {
      const readMore = e.target.closest('.read-more');
      if (readMore) {
        e.preventDefault();
        this.openModal(readMore.dataset.postId);
      }
    });

    // Blog card clicks
    document.getElementById('blog-posts')?.addEventListener('click', (e) => {
      const card = e.target.closest('.blog-card');
      if (card) {
        this.openModal(card.dataset.postId);
      }
    });

    // Modal close
    this.modal?.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close-modal') || e.target.closest('[data-close-modal]')) {
        this.closeModal();
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Newsletter form
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input').value;
      alert(`Thank you for subscribing with ${email}! You'll receive updates soon.`);
      e.target.reset();
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlogManager();
});

