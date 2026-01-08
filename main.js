// JobFlow Dashboard - Main Application Logic
class JobFlowDashboard {
    constructor() {
        this.jobs = [];
        this.currentMode = 'mode1';
        this.draggedJob = null;
        this.chart = null;
        
        this.init();
    }
    
    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupModeToggle();
        this.setupModal();
        this.setupParticles();
        this.setupChart();
        this.renderAll();
        this.animateHeader();
    }
    
    loadMockData() {
        const mockJobs = [
            {
                id: 'job-001',
                customer: 'Acme Manufacturing',
                partNumber: 'AC-1001',
                jobNumber: 'JOB-2026-001',
                quantity: 150,
                dueDate: '2026-01-10',
                status: 'queued',
                priority: 'high',
                notes: 'Rush order for customer',
                createdAt: '2026-01-05T08:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-002',
                customer: 'TechCorp Industries',
                partNumber: 'TC-2002',
                jobNumber: 'JOB-2026-002',
                quantity: 75,
                dueDate: '2026-01-12',
                status: 'queued',
                priority: 'medium',
                notes: 'Standard production run',
                createdAt: '2026-01-06T09:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-003',
                customer: 'Industrial Solutions',
                partNumber: 'IS-3003',
                jobNumber: 'JOB-2026-003',
                quantity: 200,
                dueDate: '2026-01-08',
                status: 'processing',
                priority: 'high',
                notes: 'Overdue - needs attention',
                createdAt: '2026-01-03T07:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-004',
                customer: 'Precision Works',
                partNumber: 'PW-4004',
                jobNumber: 'JOB-2026-004',
                quantity: 50,
                dueDate: '2026-01-15',
                status: 'processing',
                priority: 'medium',
                notes: 'Quality control inspection required',
                createdAt: '2026-01-04T10:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-005',
                customer: 'Global Manufacturing',
                partNumber: 'GM-5005',
                jobNumber: 'JOB-2026-005',
                quantity: 300,
                dueDate: '2026-01-05',
                status: 'done',
                priority: 'high',
                notes: 'Completed ahead of schedule',
                createdAt: '2026-01-01T08:00:00Z',
                updatedAt: '2026-01-05T16:00:00Z'
            },
            {
                id: 'job-006',
                customer: 'Advanced Systems',
                partNumber: 'AS-6006',
                jobNumber: 'JOB-2026-006',
                quantity: 125,
                dueDate: '2026-01-18',
                status: 'queued',
                priority: 'low',
                notes: 'Standard batch production',
                createdAt: '2026-01-06T11:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-007',
                customer: 'Metro Industries',
                partNumber: 'MI-7007',
                jobNumber: 'JOB-2026-007',
                quantity: 90,
                dueDate: '2026-01-09',
                status: 'processing',
                priority: 'high',
                notes: 'Customer requesting updates',
                createdAt: '2026-01-04T14:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-008',
                customer: 'Quality Components',
                partNumber: 'QC-8008',
                jobNumber: 'JOB-2026-008',
                quantity: 175,
                dueDate: '2026-01-20',
                status: 'queued',
                priority: 'medium',
                notes: 'Special packaging required',
                createdAt: '2026-01-05T16:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-009',
                customer: 'Rapid Production',
                partNumber: 'RP-9009',
                jobNumber: 'JOB-2026-009',
                quantity: 60,
                dueDate: '2026-01-06',
                status: 'done',
                priority: 'high',
                notes: 'Express delivery completed',
                createdAt: '2026-01-02T09:00:00Z',
                updatedAt: '2026-01-06T12:00:00Z'
            },
            {
                id: 'job-010',
                customer: 'Future Manufacturing',
                partNumber: 'FM-1010',
                jobNumber: 'JOB-2026-010',
                quantity: 225,
                dueDate: '2026-01-25',
                status: 'queued',
                priority: 'low',
                notes: 'Scheduled for next week',
                createdAt: '2026-01-06T13:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-011',
                customer: 'Elite Components',
                partNumber: 'EC-1111',
                jobNumber: 'JOB-2026-011',
                quantity: 80,
                dueDate: '2026-01-11',
                status: 'processing',
                priority: 'medium',
                notes: 'Tight tolerance requirements',
                createdAt: '2026-01-05T15:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-012',
                customer: 'Premier Systems',
                partNumber: 'PS-1212',
                jobNumber: 'JOB-2026-012',
                quantity: 140,
                dueDate: '2026-01-14',
                status: 'queued',
                priority: 'medium',
                notes: 'Multi-stage processing required',
                createdAt: '2026-01-06T12:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-013',
                customer: 'Dynamic Industries',
                partNumber: 'DI-1313',
                jobNumber: 'JOB-2026-013',
                quantity: 95,
                dueDate: '2026-01-07',
                status: 'done',
                priority: 'high',
                notes: 'Completed on time',
                createdAt: '2026-01-03T10:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-014',
                customer: 'Superior Manufacturing',
                partNumber: 'SM-1414',
                jobNumber: 'JOB-2026-014',
                quantity: 110,
                dueDate: '2026-01-16',
                status: 'processing',
                priority: 'low',
                notes: 'Standard production cycle',
                createdAt: '2026-01-04T16:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            },
            {
                id: 'job-015',
                customer: 'Ultimate Solutions',
                partNumber: 'US-1515',
                jobNumber: 'JOB-2026-015',
                quantity: 180,
                dueDate: '2026-01-22',
                status: 'queued',
                priority: 'medium',
                notes: 'Custom finishing required',
                createdAt: '2026-01-05T14:00:00Z',
                updatedAt: '2026-01-07T10:00:00Z'
            }
        ];
        
        this.jobs = mockJobs;
        this.saveState();
    }
    
    setupEventListeners() {
        // Mode toggle
        document.getElementById('modeToggle').addEventListener('click', () => {
            this.toggleMode();
        });
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Edit job
        document.getElementById('editJob').addEventListener('click', () => {
            this.editJob();
        });
        
        // Click outside modal to close
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') {
                this.closeModal();
            }
        });
    }
    
    setupDragAndDrop() {
        const columns = document.querySelectorAll('.column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                if (!column.contains(e.relatedTarget)) {
                    column.classList.remove('drag-over');
                }
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                if (this.draggedJob) {
                    const newStatus = column.dataset.status;
                    this.updateJobStatus(this.draggedJob, newStatus);
                    this.draggedJob = null;
                }
            });
        });
    }
    
    setupModeToggle() {
        const savedMode = localStorage.getItem('jobflow-mode');
        if (savedMode) {
            this.currentMode = savedMode;
            this.applyModeStyles();
        }
    }
    
    setupModal() {
        this.currentJob = null;
    }
    
    setupParticles() {
        // Simple particle system for background
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            backgroundAlpha: 0,
            antialias: true
        });
        
        document.getElementById('particle-container').appendChild(app.view);
        
        // Create particles
        const particles = [];
        for (let i = 0; i < 50; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0x3b82f6, 0.3);
            particle.drawCircle(0, 0, Math.random() * 3 + 1);
            particle.endFill();
            
            particle.x = Math.random() * app.screen.width;
            particle.y = Math.random() * app.screen.height;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = (Math.random() - 0.5) * 0.5;
            
            app.stage.addChild(particle);
            particles.push(particle);
        }
        
        // Animate particles
        app.ticker.add(() => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > app.screen.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > app.screen.height) particle.vy *= -1;
            });
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupChart() {
        const chartDom = document.getElementById('jobChart');
        this.chart = echarts.init(chartDom);
        this.updateChart();
    }
    
    updateChart() {
        const statusCounts = {
            queued: this.getJobsByStatus('queued').length,
            processing: this.getJobsByStatus('processing').length,
            done: this.getJobsByStatus('done').length
        };
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: {
                    color: '#fff'
                }
            },
            series: [{
                name: 'Job Status',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                data: [
                    {
                        value: statusCounts.queued,
                        name: 'Queued',
                        itemStyle: { color: '#64748b' }
                    },
                    {
                        value: statusCounts.processing,
                        name: 'Processing',
                        itemStyle: { color: '#f59e0b' }
                    },
                    {
                        value: statusCounts.done,
                        name: 'Done',
                        itemStyle: { color: '#10b981' }
                    }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    color: '#fff',
                    fontSize: 12
                }
            }]
        };
        
        this.chart.setOption(option);
    }
    
    animateHeader() {
        // Animate header text
        Splitting();
        
        anime({
            targets: '[data-splitting] .char',
            translateY: [-100, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: anime.stagger(30)
        });
    }
    
    toggleMode() {
        this.currentMode = this.currentMode === 'mode1' ? 'mode2' : 'mode1';
        this.applyModeStyles();
        this.saveState();
        this.renderAll();
        
        // Animate mode change
        anime({
            targets: '.column',
            scale: [0.95, 1],
            opacity: [0.8, 1],
            duration: 300,
            easing: 'easeOutQuad',
            delay: anime.stagger(100)
        });
    }
    
    applyModeStyles() {
        const toggle = document.getElementById('modeToggle');
        const body = document.body;
        
        if (this.currentMode === 'mode2') {
            toggle.classList.add('mode2');
            body.classList.add('supervisor-mode');
        } else {
            toggle.classList.remove('mode2');
            body.classList.remove('supervisor-mode');
        }
        
        localStorage.setItem('jobflow-mode', this.currentMode);
    }
    
    getJobsByStatus(status) {
        return this.jobs.filter(job => job.status === status);
    }
    
    updateJobStatus(jobId, newStatus) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && job.status !== newStatus) {
            job.status = newStatus;
            job.updatedAt = new Date().toISOString();
            
            // Animate the job card
            const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
            if (jobCard) {
                anime({
                    targets: jobCard,
                    scale: [1, 1.05, 1],
                    duration: 300,
                    easing: 'easeInOutQuad',
                    complete: () => {
                        this.renderAll();
                    }
                });
            } else {
                this.renderAll();
            }
            
            this.saveState();
        }
    }
    
    renderAll() {
        this.renderJobs();
        this.updateStats();
        this.updateChart();
    }
    
    renderJobs() {
        const queuedContainer = document.getElementById('queuedJobs');
        const processingContainer = document.getElementById('processingJobs');
        const doneContainer = document.getElementById('doneJobs');
        
        // Clear containers
        queuedContainer.innerHTML = '';
        processingContainer.innerHTML = '';
        doneContainer.innerHTML = '';
        
        // Render jobs in each status
        this.renderJobCards('queued', queuedContainer);
        this.renderJobCards('processing', processingContainer);
        this.renderJobCards('done', doneContainer);
        
        // Update counts
        document.getElementById('queuedCount').textContent = this.getJobsByStatus('queued').length;
        document.getElementById('processingCount').textContent = this.getJobsByStatus('processing').length;
        document.getElementById('doneCount').textContent = this.getJobsByStatus('done').length;
    }
    
    renderJobCards(status, container) {
        const jobs = this.getJobsByStatus(status);
        
        jobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            container.appendChild(jobCard);
        });
    }
    
    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card bg-white rounded-lg p-4 border-l-4 shadow-sm';
        card.setAttribute('data-job-id', job.id);
        card.draggable = true;
        
        // Set border color based on status
        const statusColors = {
            queued: 'border-blue-500',
            processing: 'border-amber-500',
            done: 'border-green-500'
        };
        card.classList.add(statusColors[job.status]);
        
        // Check if job is overdue
        const isOverdue = new Date(job.dueDate) < new Date() && job.status !== 'done';
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm">${job.customer}</h4>
                    <p class="text-xs text-gray-600">Part: ${job.partNumber}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs font-mono text-gray-500">${job.jobNumber}</span>
                    ${isOverdue ? '<span class="overdue-badge bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">Overdue</span>' : ''}
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-lg font-bold text-gray-900">${job.quantity}</span>
                    <span class="text-xs text-gray-500 ml-1">units</span>
                </div>
                <div class="text-right">
                    <span class="text-xs text-gray-500">Due: ${new Date(job.dueDate).toLocaleDateString()}</span>
                    ${this.currentMode === 'mode2' ? `<span class="block text-xs text-gray-400 mt-1">Priority: ${job.priority}</span>` : ''}
                </div>
            </div>
            
            ${this.currentMode === 'mode2' && job.notes ? `
                <div class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Notes:</strong> ${job.notes}
                </div>
            ` : ''}
        `;
        
        // Add event listeners
        card.addEventListener('dragstart', (e) => {
            this.draggedJob = job.id;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        card.addEventListener('click', () => {
            this.showJobModal(job);
        });
        
        return card;
    }
    
    updateStats() {
        const totalJobs = this.jobs.length;
        const overdueJobs = this.jobs.filter(job => 
            new Date(job.dueDate) < new Date() && job.status !== 'done'
        ).length;
        
        document.getElementById('totalJobs').textContent = totalJobs;
        document.getElementById('overdueJobs').textContent = overdueJobs;
    }
    
    showJobModal(job) {
        this.currentJob = job;
        const modal = document.getElementById('jobModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        modalTitle.textContent = `${job.jobNumber} - ${job.customer}`;
        
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Customer</label>
                        <p class="mt-1 text-sm text-gray-900">${job.customer}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Part Number</label>
                        <p class="mt-1 text-sm text-gray-900">${job.partNumber}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Job Number</label>
                        <p class="mt-1 text-sm text-gray-900">${job.jobNumber}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Quantity</label>
                        <p class="mt-1 text-sm text-gray-900">${job.quantity} units</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Due Date</label>
                        <p class="mt-1 text-sm text-gray-900">${new Date(job.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusBadgeClass(job.status)}">
                            ${job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Priority</label>
                        <p class="mt-1 text-sm text-gray-900">${job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Created</label>
                        <p class="mt-1 text-sm text-gray-900">${new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                
                ${job.notes ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Notes</label>
                        <p class="mt-1 text-sm text-gray-900">${job.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        // Animate modal
        anime({
            targets: '.modal-content',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
    }
    
    closeModal() {
        const modal = document.getElementById('jobModal');
        
        anime({
            targets: '.modal-content',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInBack',
            complete: () => {
                modal.classList.add('hidden');
            }
        });
        
        this.currentJob = null;
    }
    
    editJob() {
        if (this.currentJob) {
            alert('Edit functionality would open a form to modify job details. This is a demo implementation.');
        }
    }
    
    getStatusBadgeClass(status) {
        const classes = {
            queued: 'bg-blue-100 text-blue-800',
            processing: 'bg-amber-100 text-amber-800',
            done: 'bg-green-100 text-green-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    saveState() {
        const state = {
            jobs: this.jobs,
            mode: this.currentMode,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('jobflow-state', JSON.stringify(state));
    }
    
    loadState() {
        const saved = localStorage.getItem('jobflow-state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.jobs = state.jobs || this.jobs;
                this.currentMode = state.mode || 'mode1';
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new JobFlowDashboard();
    
    // Load saved state if available
    dashboard.loadState();
    dashboard.renderAll();
    
    // Make dashboard globally available for debugging
    window.dashboard = dashboard;
});

// Handle window resize for chart
window.addEventListener('resize', () => {
    if (window.dashboard && window.dashboard.chart) {
        window.dashboard.chart.resize();
    }
});