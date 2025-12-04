/**
 * Blog Post Editor
 * Client-side blog post management system
 */

class BlogEditor {
  constructor() {
    this.posts = [];
    this.categories = [];
    this.currentPostId = null;
    this.tags = [];
    this.quill = null;
    this.featuredImageData = null;

    this.init();
  }

  async init() {
    await this.loadBlogData();
    this.initQuillEditor();
    this.renderPostList();
    this.setupEventListeners();
    this.setDefaultDate();
  }

  async loadBlogData() {
    try {
      const response = await fetch('data/blogs.json');
      const data = await response.json();
      this.posts = data.posts || [];
      this.categories = data.categories || [];
    } catch (error) {
      console.error('Error loading blog data:', error);
      this.posts = [];
      this.categories = [];
    }
  }

  initQuillEditor() {
    this.quill = new Quill('#quillEditor', {
      modules: {
        toolbar: '#quillToolbar'
      },
      placeholder: 'Write your blog post content here...',
      theme: 'snow'
    });

    // Custom image handler for Quill
    this.quill.getModule('toolbar').addHandler('image', () => {
      this.insertImage();
    });

    // Custom video handler
    this.quill.getModule('toolbar').addHandler('video', () => {
      this.insertVideo();
    });
  }

  insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
      const range = this.quill.getSelection(true);
      this.quill.insertEmbed(range.index, 'image', url);
    }
  }

  insertVideo() {
    const url = prompt('Enter video URL (YouTube, Vimeo, or direct link):');
    if (url) {
      let embedUrl = url;
      // Convert YouTube URLs to embed format
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      const range = this.quill.getSelection(true);
      this.quill.insertEmbed(range.index, 'video', embedUrl);
    }
  }

  setDefaultDate() {
    const dateInput = document.getElementById('postDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  renderPostList(searchTerm = '') {
    const postList = document.getElementById('postList');
    let filteredPosts = this.posts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPosts = this.posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term)
      );
    }

    if (filteredPosts.length === 0) {
      postList.innerHTML = `
        <li class="empty-state">
          <i class="fas fa-file-alt"></i>
          <p>${searchTerm ? 'No posts found' : 'No blog posts yet'}</p>
        </li>
      `;
      return;
    }

    postList.innerHTML = filteredPosts.map(post => `
      <li class="post-list-item ${post.id === this.currentPostId ? 'active' : ''}"
          data-post-id="${post.id}">
        <div class="post-info">
          <span class="post-title">
            ${post.title}
            ${post.featured ? '<span class="featured-badge"><i class="fas fa-star"></i></span>' : ''}
          </span>
          <span class="post-meta">${post.category} • ${this.formatDate(post.date)}</span>
        </div>
        <div class="post-actions">
          <button class="action-btn edit" title="Edit" data-action="edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" title="Delete" data-action="delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </li>
    `).join('');
  }

  loadPost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    this.currentPostId = postId;

    // Fill form fields
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postSlug').value = post.slug || post.id;
    document.getElementById('postDate').value = post.date;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postAuthor').value = post.author || 'Gary';
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postReadTime').value = post.readTime || '5 min read';
    document.getElementById('postFeatured').checked = post.featured || false;

    // Load content into Quill
    this.quill.root.innerHTML = post.content || '';

    // Load tags
    this.tags = post.tags || [];
    this.renderTags();

    // Load featured image
    if (post.image) {
      document.getElementById('imageUrl').value = post.image;
      this.showImagePreview(post.image);
    } else {
      this.clearImagePreview();
    }

    // Update post list to show active
    this.renderPostList();

    this.showToast('Post loaded', 'info');
  }

  createNewPost() {
    this.currentPostId = null;
    this.clearForm();
    this.renderPostList();
    this.showToast('New post created', 'info');
  }

  clearForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    this.quill.root.innerHTML = '';
    this.tags = [];
    this.renderTags();
    this.clearImagePreview();
    this.setDefaultDate();
    document.getElementById('postAuthor').value = 'Gary';
    document.getElementById('postReadTime').value = '5 min read';
  }

  savePost() {
    // Get form values
    const title = document.getElementById('postTitle').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const content = this.quill.root.innerHTML;
    const category = document.getElementById('postCategory').value;

    // Validate
    if (!title || !excerpt || !content || !category) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    // Generate slug from title if not provided
    let slug = document.getElementById('postSlug').value.trim();
    if (!slug) {
      slug = this.generateSlug(title);
      document.getElementById('postSlug').value = slug;
    }

    // Get featured image
    let image = document.getElementById('imageUrl').value.trim();
    if (this.featuredImageData) {
      image = this.featuredImageData;
    }

    const postData = {
      id: this.currentPostId || slug,
      title: title,
      slug: slug,
      excerpt: excerpt,
      content: content,
      author: document.getElementById('postAuthor').value || 'Gary',
      date: document.getElementById('postDate').value,
      category: category,
      tags: this.tags,
      featured: document.getElementById('postFeatured').checked,
      image: image,
      readTime: document.getElementById('postReadTime').value || '5 min read'
    };

    if (this.currentPostId) {
      // Update existing post
      const index = this.posts.findIndex(p => p.id === this.currentPostId);
      if (index !== -1) {
        this.posts[index] = postData;
      }
    } else {
      // Check for duplicate ID
      if (this.posts.some(p => p.id === postData.id)) {
        postData.id = postData.id + '-' + Date.now();
        postData.slug = postData.id;
      }
      this.posts.unshift(postData);
      this.currentPostId = postData.id;
    }

    this.renderPostList();
    this.showToast('Post saved successfully!', 'success');

    // Prompt to download
    this.promptDownload();
  }

  deletePost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    document.getElementById('deletePostTitle').textContent = post.title;
    document.getElementById('deleteModal').dataset.postId = postId;
    this.openModal('deleteModal');
  }

  confirmDelete() {
    const postId = document.getElementById('deleteModal').dataset.postId;
    this.posts = this.posts.filter(p => p.id !== postId);

    if (this.currentPostId === postId) {
      this.currentPostId = null;
      this.clearForm();
    }

    this.renderPostList();
    this.closeModal('deleteModal');
    this.showToast('Post deleted', 'success');
    this.promptDownload();
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Tags Management
  addTag(tag) {
    tag = tag.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.renderTags();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.renderTags();
  }

  renderTags() {
    const tagsList = document.getElementById('tagsList');
    tagsList.innerHTML = this.tags.map(tag => `
      <span class="tag-item">
        ${tag}
        <button type="button" data-tag="${tag}"><i class="fas fa-times"></i></button>
      </span>
    `).join('');
  }

  // Preview
  showPreview() {
    const title = document.getElementById('postTitle').value || 'Untitled Post';
    const excerpt = document.getElementById('postExcerpt').value || '';
    const content = this.quill.root.innerHTML;
    const category = document.getElementById('postCategory').value || 'Uncategorized';
    const date = document.getElementById('postDate').value;
    const author = document.getElementById('postAuthor').value || 'Gary';
    const readTime = document.getElementById('postReadTime').value || '5 min read';
    const image = document.getElementById('imageUrl').value || this.featuredImageData;

    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = `
      ${image ? `<img src="${image}" alt="${title}" class="preview-image">` : ''}
      <div class="preview-meta">
        <span class="preview-category">${category}</span>
        <span>${this.formatDate(date)}</span>
        <span>By ${author}</span>
        <span>${readTime}</span>
      </div>
      <h1 class="preview-title">${title}</h1>
      <p class="preview-excerpt">${excerpt}</p>
      <div class="preview-content">${content}</div>
      ${this.tags.length > 0 ? `
        <div class="preview-tags">
          ${this.tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    `;

    this.openModal('previewModal');
  }

  // JSON Export/Import
  downloadJson() {
    const data = {
      posts: this.posts,
      categories: this.categories.length > 0 ? this.categories : [
        { id: 'all', name: 'All Posts', count: this.posts.length },
        { id: 'design', name: 'Design', count: this.posts.filter(p => p.category === 'Design').length },
        { id: 'tutorial', name: 'Tutorial', count: this.posts.filter(p => p.category === 'Tutorial').length },
        { id: 'behind-the-scenes', name: 'Behind the Scenes', count: this.posts.filter(p => p.category === 'Behind the Scenes').length },
        { id: 'inspiration', name: 'Inspiration', count: this.posts.filter(p => p.category === 'Inspiration').length },
        { id: 'news', name: 'News', count: this.posts.filter(p => p.category === 'News').length }
      ]
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blogs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('blogs.json downloaded!', 'success');
  }

  importJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.posts && Array.isArray(data.posts)) {
          this.posts = data.posts;
          this.categories = data.categories || [];
          this.renderPostList();
          this.clearForm();
          this.showToast('Blog data imported successfully!', 'success');
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        this.showToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  promptDownload() {
    const shouldDownload = confirm('Would you like to download the updated blogs.json file now?');
    if (shouldDownload) {
      this.downloadJson();
    }
  }

  // GitHub Integration
  async commitToGitHub() {
    const token = document.getElementById('githubToken').value.trim();
    const message = document.getElementById('commitMessage').value.trim();

    if (!token) {
      this.showToast('Please enter your GitHub Personal Access Token', 'error');
      return;
    }

    const data = {
      posts: this.posts,
      categories: this.categories
    };

    try {
      // Get current file SHA
      const getResponse = await fetch(
        'https://api.github.com/repos/darkclone9/darkclone9.github.io/contents/data/blogs.json',
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const currentFile = await getResponse.json();
      const sha = currentFile.sha;

      // Update file
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

      const updateResponse = await fetch(
        'https://api.github.com/repos/darkclone9/darkclone9.github.io/contents/data/blogs.json',
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message || 'Update blog posts',
            content: content,
            sha: sha
          })
        }
      );

      if (updateResponse.ok) {
        this.closeModal('githubModal');
        this.showToast('Successfully committed to GitHub!', 'success');
        // Save token locally for convenience
        localStorage.setItem('github_token', token);
      } else {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to commit');
      }
    } catch (error) {
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }

  // Modal Handling
  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
  }

  // Toast Notifications
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
      <i class="${icons[type]}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Event Listeners
  setupEventListeners() {
    // New Post Button
    document.getElementById('newPostBtn').addEventListener('click', () => {
      this.createNewPost();
    });

    // Save Button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.savePost();
    });

    // Preview Button
    document.getElementById('previewBtn').addEventListener('click', () => {
      this.showPreview();
    });

    // Post List Click
    document.getElementById('postList').addEventListener('click', (e) => {
      const item = e.target.closest('.post-list-item');
      const action = e.target.closest('[data-action]');

      if (action) {
        const postId = item.dataset.postId;
        if (action.dataset.action === 'edit') {
          this.loadPost(postId);
        } else if (action.dataset.action === 'delete') {
          this.deletePost(postId);
        }
      } else if (item) {
        this.loadPost(item.dataset.postId);
      }
    });

    // Search Posts
    document.getElementById('postSearch').addEventListener('input', (e) => {
      this.renderPostList(e.target.value);
    });

    // Auto-generate slug from title
    document.getElementById('postTitle').addEventListener('blur', (e) => {
      const slugField = document.getElementById('postSlug');
      if (!slugField.value) {
        slugField.value = this.generateSlug(e.target.value);
      }
    });

    // Tags Input
    document.getElementById('tagsInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTag(e.target.value);
        e.target.value = '';
      }
    });

    // Remove Tag
    document.getElementById('tagsList').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) {
        this.removeTag(btn.dataset.tag);
      }
    });

    // Image Upload Area
    const imageUploadArea = document.getElementById('imageUploadArea');
    const featuredImageInput = document.getElementById('featuredImage');

    imageUploadArea.addEventListener('click', () => {
      featuredImageInput.click();
    });

    featuredImageInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.handleImageUpload(e.target.files[0]);
      }
    });

    // Drag and drop
    imageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadArea.classList.add('dragging');
    });

    imageUploadArea.addEventListener('dragleave', () => {
      imageUploadArea.classList.remove('dragging');
    });

    imageUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      imageUploadArea.classList.remove('dragging');
      if (e.dataTransfer.files[0]) {
        this.handleImageUpload(e.dataTransfer.files[0]);
      }
    });

    // Remove Image Button
    document.getElementById('removeImageBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearImagePreview();
    });

    // Image URL Input
    document.getElementById('imageUrl').addEventListener('change', (e) => {
      if (e.target.value) {
        this.showImagePreview(e.target.value);
        this.featuredImageData = null;
      }
    });

    // Download JSON Button
    document.getElementById('downloadJsonBtn').addEventListener('click', () => {
      this.downloadJson();
    });

    // Import JSON Button
    document.getElementById('importJsonBtn').addEventListener('click', () => {
      document.getElementById('jsonFileInput').click();
    });

    document.getElementById('jsonFileInput').addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.importJson(e.target.files[0]);
      }
    });

    // Delete Confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
      this.confirmDelete();
    });

    // GitHub Commit
    document.getElementById('commitToGithubBtn').addEventListener('click', () => {
      this.commitToGitHub();
    });

    // Load saved GitHub token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      document.getElementById('githubToken').value = savedToken;
    }

    // Close Modals
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          this.closeModal(modal.id);
        });
      }
    });

    // Prevent form submission
    document.getElementById('postForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePost();
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlogEditor();
});
