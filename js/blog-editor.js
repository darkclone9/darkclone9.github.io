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
    this.autosaveInterval = null;
    this.AUTOSAVE_KEY = 'blog-editor-draft';
    this.AUTOSAVE_INTERVAL = 30000; // 30 seconds
    this.DRAFT_EXPIRY_DAYS = 7;

    this.init();
  }

  async init() {
    await this.loadBlogData();
    this.initQuillEditor();
    this.renderPostList();
    this.setupEventListeners();
    this.setDefaultDate();
    this.checkForDraft();
    this.startAutosave();
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

    // Clear the autosaved draft since we just saved
    this.clearDraft();

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

  // Image Upload Methods
  handleImageUpload(file) {
    console.log('handleImageUpload called with file:', file);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showToast('Image must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log('FileReader onload - image loaded successfully');
      this.featuredImageData = e.target.result;
      this.showImagePreview(e.target.result);
      this.showToast('Image uploaded successfully!', 'success');
    };

    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      this.showToast('Error reading image file', 'error');
    };

    reader.readAsDataURL(file);
  }

  showImagePreview(imageUrl) {
    console.log('showImagePreview called with URL:', imageUrl?.substring(0, 50) + '...');

    const uploadArea = document.getElementById('imageUploadArea');
    const uploadContent = uploadArea.querySelector('.upload-content');
    const previewContainer = uploadArea.querySelector('.image-preview') || document.createElement('div');

    // Create preview container if it doesn't exist
    if (!previewContainer.classList.contains('image-preview')) {
      previewContainer.className = 'image-preview';
      uploadArea.appendChild(previewContainer);
    }

    // Hide upload content, show preview
    if (uploadContent) {
      uploadContent.style.display = 'none';
    }

    previewContainer.innerHTML = `
      <img src="${imageUrl}" alt="Featured image preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
      <button type="button" id="removeImageBtn" class="remove-image-btn" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <i class="fas fa-times"></i>
      </button>
    `;
    previewContainer.style.display = 'block';
    previewContainer.style.position = 'relative';

    // Re-attach remove button listener
    const removeBtn = previewContainer.querySelector('#removeImageBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearImagePreview();
      });
    }
  }

  clearImagePreview() {
    console.log('clearImagePreview called');

    const uploadArea = document.getElementById('imageUploadArea');
    const uploadContent = uploadArea.querySelector('.upload-content');
    const previewContainer = uploadArea.querySelector('.image-preview');

    // Show upload content, hide preview
    if (uploadContent) {
      uploadContent.style.display = 'flex';
    }

    if (previewContainer) {
      previewContainer.style.display = 'none';
      previewContainer.innerHTML = '';
    }

    // Clear data
    this.featuredImageData = null;
    document.getElementById('imageUrl').value = '';
    document.getElementById('featuredImage').value = '';
  }

  // Autosave Methods
  startAutosave() {
    console.log('Starting autosave interval...');

    // Clear any existing interval
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }

    // Start autosave interval
    this.autosaveInterval = setInterval(() => {
      this.autosaveDraft();
    }, this.AUTOSAVE_INTERVAL);

    // Also save on form changes
    const form = document.getElementById('postForm');
    if (form) {
      form.addEventListener('input', () => {
        // Debounce autosave on input
        clearTimeout(this.autosaveDebounce);
        this.autosaveDebounce = setTimeout(() => {
          this.autosaveDraft();
        }, 5000); // 5 second debounce
      });
    }
  }

  autosaveDraft() {
    // Get current form data
    const draftData = this.getCurrentFormData();

    // Only save if there's meaningful content
    if (!draftData.title && !draftData.content) {
      return;
    }

    try {
      const draft = {
        data: draftData,
        savedAt: new Date().toISOString(),
        postId: this.currentPostId
      };

      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(draft));

      // Show autosave indicator
      this.showAutosaveIndicator();
      console.log('Draft autosaved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Autosave error:', error);
      // Handle localStorage quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.showToast('Storage full - clearing old drafts', 'warning');
        this.clearOldDrafts();
      }
    }
  }

  getCurrentFormData() {
    return {
      title: document.getElementById('postTitle')?.value || '',
      slug: document.getElementById('postSlug')?.value || '',
      excerpt: document.getElementById('postExcerpt')?.value || '',
      content: this.quill?.root?.innerHTML || '',
      author: document.getElementById('postAuthor')?.value || '',
      date: document.getElementById('postDate')?.value || '',
      category: document.getElementById('postCategory')?.value || '',
      readTime: document.getElementById('postReadTime')?.value || '',
      featured: document.getElementById('postFeatured')?.checked || false,
      imageUrl: document.getElementById('imageUrl')?.value || '',
      featuredImageData: this.featuredImageData,
      tags: this.tags || []
    };
  }

  showAutosaveIndicator() {
    // Remove existing indicator if any
    let indicator = document.querySelector('.autosave-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'autosave-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out forwards;
      `;
      document.body.appendChild(indicator);
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    indicator.innerHTML = `<i class="fas fa-save"></i> Draft saved at ${time}`;

    // Add animation style if not exists
    if (!document.querySelector('#autosave-animation')) {
      const style = document.createElement('style');
      style.id = 'autosave-animation';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove after animation
    setTimeout(() => {
      indicator.remove();
    }, 2000);
  }

  checkForDraft() {
    try {
      const draftJson = localStorage.getItem(this.AUTOSAVE_KEY);
      if (!draftJson) return;

      const draft = JSON.parse(draftJson);

      // Check if draft is expired (older than 7 days)
      const savedDate = new Date(draft.savedAt);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - this.DRAFT_EXPIRY_DAYS);

      if (savedDate < expiryDate) {
        console.log('Draft expired, removing...');
        localStorage.removeItem(this.AUTOSAVE_KEY);
        return;
      }

      // Format time for display
      const timeAgo = this.getTimeAgo(savedDate);

      // Show restore prompt
      this.showDraftRestorePrompt(draft, timeAgo);
    } catch (error) {
      console.error('Error checking for draft:', error);
      localStorage.removeItem(this.AUTOSAVE_KEY);
    }
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  showDraftRestorePrompt(draft, timeAgo) {
    // Create modal for draft restore
    const modal = document.createElement('div');
    modal.className = 'draft-restore-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;

    modal.innerHTML = `
      <div style="
        background: #1a1a2e;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        text-align: center;
      ">
        <i class="fas fa-file-alt" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
        <h3 style="color: white; margin-bottom: 0.5rem;">Unsaved Draft Found</h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1.5rem;">
          You have an unsaved draft from ${timeAgo}.<br>
          ${draft.data.title ? `Title: "${draft.data.title}"` : 'Untitled post'}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="restoreDraftBtn" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          ">Restore Draft</button>
          <button id="discardDraftBtn" style="
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
          ">Discard</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('#restoreDraftBtn').addEventListener('click', () => {
      this.restoreDraft(draft);
      modal.remove();
    });

    modal.querySelector('#discardDraftBtn').addEventListener('click', () => {
      localStorage.removeItem(this.AUTOSAVE_KEY);
      modal.remove();
      this.showToast('Draft discarded', 'info');
    });
  }

  restoreDraft(draft) {
    const data = draft.data;

    // Restore form fields
    if (data.title) document.getElementById('postTitle').value = data.title;
    if (data.slug) document.getElementById('postSlug').value = data.slug;
    if (data.excerpt) document.getElementById('postExcerpt').value = data.excerpt;
    if (data.content) this.quill.root.innerHTML = data.content;
    if (data.author) document.getElementById('postAuthor').value = data.author;
    if (data.date) document.getElementById('postDate').value = data.date;
    if (data.category) document.getElementById('postCategory').value = data.category;
    if (data.readTime) document.getElementById('postReadTime').value = data.readTime;
    if (data.featured) document.getElementById('postFeatured').checked = data.featured;

    // Restore image
    if (data.imageUrl) {
      document.getElementById('imageUrl').value = data.imageUrl;
      this.showImagePreview(data.imageUrl);
    } else if (data.featuredImageData) {
      this.featuredImageData = data.featuredImageData;
      this.showImagePreview(data.featuredImageData);
    }

    // Restore tags
    if (data.tags && data.tags.length > 0) {
      this.tags = data.tags;
      this.renderTags();
    }

    // Restore post ID if editing existing post
    if (draft.postId) {
      this.currentPostId = draft.postId;
    }

    this.showToast('Draft restored successfully!', 'success');
  }

  clearDraft() {
    localStorage.removeItem(this.AUTOSAVE_KEY);
    console.log('Draft cleared');
  }

  clearOldDrafts() {
    // Clear the main draft
    localStorage.removeItem(this.AUTOSAVE_KEY);

    // Clear any other blog-editor related items if storage is full
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('blog-editor-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
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

    // Remove Image Button (may not exist on initial load)
    const removeImageBtn = document.getElementById('removeImageBtn');
    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearImagePreview();
      });
    }

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
