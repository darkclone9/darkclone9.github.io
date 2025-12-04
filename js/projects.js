/**
 * Projects Gallery System
 * Dynamically loads and renders projects from data/projects.json
 */

class ProjectsManager {
  constructor() {
    this.projects = [];
    this.categories = [];
    this.currentCategory = 'all';
    this.modal = document.getElementById('project-modal');
    
    this.init();
  }

  async init() {
    await this.loadProjectData();
    this.updateStats();
    this.renderFilters();
    this.renderProjects();
    this.setupEventListeners();
  }

  async loadProjectData() {
    try {
      const response = await fetch('data/projects.json');
      const data = await response.json();
      this.projects = data.projects;
      this.categories = data.categories;
    } catch (error) {
      console.error('Error loading project data:', error);
      this.projects = [];
      this.categories = [];
    }
  }

  updateStats() {
    const projectCount = document.getElementById('project-count');
    const categoryCount = document.getElementById('category-count');
    
    if (projectCount) {
      this.animateNumber(projectCount, this.projects.length);
    }
    if (categoryCount) {
      this.animateNumber(categoryCount, this.categories.length - 1); // -1 for 'all'
    }
  }

  animateNumber(element, target) {
    let current = 0;
    const duration = 1000;
    const step = target / (duration / 16);
    
    const animate = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(animate);
      } else {
        element.textContent = target;
      }
    };
    
    animate();
  }

  renderFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" 
              data-category="${cat.id}">
        <i class="${cat.icon}" aria-hidden="true"></i>
        ${cat.name}
      </button>
    `).join('');
  }

  renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filteredProjects = this.currentCategory === 'all' 
      ? this.projects 
      : this.projects.filter(p => p.category === this.currentCategory);

    container.innerHTML = filteredProjects.map(project => `
      <article class="project-card" data-project-id="${project.id}">
        ${project.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
        <div class="card-image-container">
          <img src="${project.thumbnail}" alt="${project.title}" class="card-image" loading="lazy">
          <div class="card-overlay"></div>
        </div>
        <div class="card-content">
          <span class="card-category">${project.category.replace('-', ' ')}</span>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-description">${project.description}</p>
          <div class="card-footer">
            <div class="card-tools">
              ${project.tools.slice(0, 2).map(tool => `
                <span class="tool-tag">${tool}</span>
              `).join('')}
            </div>
            <span class="view-project">
              View Project <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </article>
    `).join('');
  }

  openModal(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const modalBody = this.modal.querySelector('.modal-body');

    modalBody.innerHTML = `
      <div class="modal-header">
        <span class="project-category">${project.category.replace('-', ' ')}</span>
        <h2 class="project-title">${project.title}</h2>
        <p class="project-description">${project.description}</p>
      </div>
      <div class="modal-details">
        <div class="detail-item">
          <div class="detail-label">Client</div>
          <div class="detail-value">${project.details.client}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Duration</div>
          <div class="detail-value">${project.details.duration}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date</div>
          <div class="detail-value">${this.formatDate(project.date)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Tools</div>
          <div class="detail-value">${project.tools.join(', ')}</div>
        </div>
      </div>
      <div class="modal-gallery">
        <h3>Project Gallery</h3>
        <div class="gallery-grid">
          ${project.images.map(img => `
            <div class="gallery-item">
              <img src="${img.src}" alt="${img.alt}" loading="lazy">
            </div>
          `).join('')}
        </div>
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
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  setupEventListeners() {
    // Category filter clicks
    document.getElementById('category-filters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderProjects();
      }
    });

    // Project card clicks
    document.getElementById('projects-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) {
        this.openModal(card.dataset.projectId);
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
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProjectsManager();
});

