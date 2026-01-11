/**
 * FlowAI Video Generator - Frontend Logic
 * Main JavaScript file handling UI interactions and API communication
 */

class VideoGenerator {
    constructor() {
        this.uploadedImages = [];
        this.referenceVideo = null;
        this.generationId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateCharCount();
        this.checkAPIStatus();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // File upload elements
        this.imageInput = document.getElementById('imageInput');
        this.videoInput = document.getElementById('videoInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.videoPreview = document.getElementById('videoPreview');
        
        // Text input
        this.promptInput = document.getElementById('promptInput');
        this.charCount = document.querySelector('.char-count');
        
        // Settings
        this.durationSelect = document.getElementById('duration');
        this.aspectRatioSelect = document.getElementById('aspectRatio');
        this.qualitySelect = document.getElementById('quality');
        this.fpsSelect = document.getElementById('fps');
        
        // Buttons
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.promptSuggestBtn = document.getElementById('promptSuggest');
        
        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressSteps = document.querySelectorAll('.step');
        
        // Output elements
        this.outputSection = document.getElementById('outputSection');
        this.videoPlaceholder = document.getElementById('videoPlaceholder');
        this.generatedVideo = document.getElementById('generatedVideo');
        this.videoInfo = document.getElementById('videoInfo');
        this.actionButtons = document.getElementById('actionButtons');
        
        // Detail elements
        this.detailPrompt = document.getElementById('detailPrompt');
        this.detailImages = document.getElementById('detailImages');
        this.detailReference = document.getElementById('detailReference');
        
        // Info elements
        this.infoDuration = document.getElementById('infoDuration');
        this.infoResolution = document.getElementById('infoResolution');
        this.infoFPS = document.getElementById('infoFPS');
        this.infoSize = document.getElementById('infoSize');
        
        // Toast
        this.toast = document.getElementById('toast');
        
        // API status
        this.apiStatus = document.getElementById('apiStatus');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // File upload events
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.videoInput.addEventListener('change', (e) => this.handleVideoUpload(e));
        
        // Drag and drop for images
        const imageZone = document.getElementById('imageUploadZone');
        imageZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageZone.style.borderColor = '#60a5fa';
            imageZone.style.background = 'rgba(15, 23, 42, 0.9)';
        });
        
        imageZone.addEventListener('dragleave', () => {
            imageZone.style.borderColor = '#475569';
            imageZone.style.background = 'rgba(15, 23, 42, 0.6)';
        });
        
        imageZone.addEventListener('drop', (e) => {
            e.preventDefault();
            imageZone.style.borderColor = '#475569';
            imageZone.style.background = 'rgba(15, 23, 42, 0.6)';
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            this.handleImageFiles(files);
        });
        
        // Drag and drop for video
        const videoZone = document.getElementById('videoUploadZone');
        videoZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoZone.style.borderColor = '#60a5fa';
            videoZone.style.background = 'rgba(15, 23, 42, 0.9)';
        });
        
        videoZone.addEventListener('dragleave', () => {
            videoZone.style.borderColor = '#475569';
            videoZone.style.background = 'rgba(15, 23, 42, 0.6)';
        });
        
        videoZone.addEventListener('drop', (e) => {
            e.preventDefault();
            videoZone.style.borderColor = '#475569';
            videoZone.style.background = 'rgba(15, 23, 42, 0.6)';
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('video/')
            );
            if (files.length > 0) {
                this.handleVideoFile(files[0]);
            }
        });
        
        // Prompt events
        this.promptInput.addEventListener('input', () => this.updateCharCount());
        this.promptSuggestBtn.addEventListener('click', () => this.suggestPrompt());
        
        // Button events
        this.generateBtn.addEventListener('click', () => this.generateVideo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.shareBtn.addEventListener('click', () => this.shareVideo());
        this.regenerateBtn.addEventListener('click', () => this.regenerateVideo());
    }

    /**
     * Handle image file upload
     */
    handleImageUpload(event) {
        const files = Array.from(event.target.files);
        this.handleImageFiles(files);
    }

    /**
     * Process image files and create previews
     */
    handleImageFiles(files) {
        if (files.length === 0) return;
        
        // Limit to 10 images
        if (files.length + this.uploadedImages.length > 10) {
            this.showToast('Maximum 10 images allowed. Only first 10 will be used.', 'warning');
            files = files.slice(0, 10 - this.uploadedImages.length);
        }
        
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast(`Image ${file.name} is too large (max 5MB)`, 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    dataUrl: e.target.result,
                    file: file
                };
                
                this.uploadedImages.push(imageData);
                this.createImagePreview(imageData);
                this.updateImageCount();
            };
            reader.readAsDataURL(file);
        });
        
        this.imageInput.value = '';
    }

    /**
     * Create image preview element
     */
    createImagePreview(imageData) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.id = imageData.id;
        
        const img = document.createElement('img');
        img.src = imageData.dataUrl;
        img.alt = imageData.name;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => this.removeImage(imageData.id);
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        this.imagePreview.appendChild(previewItem);
    }

    /**
     * Remove image from uploads
     */
    removeImage(id) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== id);
        const previewItem = this.imagePreview.querySelector(`[data-id="${id}"]`);
        if (previewItem) {
            previewItem.remove();
        }
        this.updateImageCount();
    }

    /**
     * Handle video file upload
     */
    handleVideoUpload(event) {
        if (event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        this.handleVideoFile(file);
    }

    /**
     * Process video file and create preview
     */
    handleVideoFile(file) {
        if (file.size > 50 * 1024 * 1024) {
            this.showToast('Video file is too large (max 50MB)', 'error');
            return;
        }
        
        this.referenceVideo = {
            id: Date.now(),
            name: file.name,
            file: file
        };
        
        this.createVideoPreview();
        this.updateVideoReference();
        
        this.videoInput.value = '';
    }

    /**
     * Create video preview element
     */
    createVideoPreview() {
        this.videoPreview.innerHTML = '';
        
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        const video = document.createElement('video');
        video.src = URL.createObjectURL(this.referenceVideo.file);
        video.controls = true;
        video.style.width = '100%';
        video.style.height = '100%';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => this.removeVideo();
        
        previewItem.appendChild(video);
        previewItem.appendChild(removeBtn);
        this.videoPreview.appendChild(previewItem);
    }

    /**
     * Remove reference video
     */
    removeVideo() {
        this.referenceVideo = null;
        this.videoPreview.innerHTML = '';
        this.updateVideoReference();
    }

    /**
     * Update character count for prompt
     */
    updateCharCount() {
        const length = this.promptInput.value.length;
        this.charCount.textContent = `${length}/500`;
        
        if (length > 500) {
            this.charCount.style.color = '#ef4444';
        } else if (length > 400) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#94a3b8';
        }
    }

    /**
     * Generate prompt suggestions using AI (mocked)
     */
    suggestPrompt() {
        const suggestions = [
            "A cinematic drone shot flying over a misty mountain range at sunrise with golden light breaking through clouds",
            "A slow-motion shot of waves crashing against rocky cliffs with seagulls flying in the foreground",
            "A timelapse of a bustling city street at night with car light trails and neon signs glowing",
            "A macro shot of a dewdrop on a flower petal with sunlight creating rainbow reflections",
            "A tracking shot through a dense forest with sunbeams filtering through the canopy"
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        this.promptInput.value = randomSuggestion;
        this.updateCharCount();
        this.showToast('Prompt suggestion generated!', 'success');
    }

    /**
     * Validate input before generation
     */
    validateInput() {
        if (this.uploadedImages.length === 0) {
            this.showToast('Please upload at least one image', 'error');
            return false;
        }
        
        if (!this.promptInput.value.trim()) {
            this.showToast('Please enter a scene description', 'error');
            return false;
        }
        
        if (this.promptInput.value.length > 500) {
            this.showToast('Prompt must be 500 characters or less', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Generate video using AI
     */
    async generateVideo() {
        if (!this.validateInput()) return;
        
        // Disable generate button
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<
