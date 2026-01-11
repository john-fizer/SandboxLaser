// JobFlow Dashboard - Main Application Logic

class AuthManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.currentUser = null;
        this.isAuthenticated = false;

        this.init();
    }

    init() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Check local storage for session
        const savedUser = localStorage.getItem('jobflow-user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                // Auto-login if session exists
                // this.showDashboard(); 
                // Commented out auto-login for now to demonstrate login screen
            } catch (e) {
                console.error('Invalid session', e);
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const role = document.getElementById('role')?.value;
        const operatorName = document.getElementById('operatorName')?.value;

        if (!operatorName) {
            alert('Please enter your Name or ID.');
            return;
        }

        if (this.validateCredentials(username, password, role)) {
            this.currentUser = {
                id: username.toLowerCase().replace(/\s/g, '_'),
                name: operatorName, // Use the proper name entered
                username: username,
                role: role,
                loginTime: new Date().toISOString()
            };

            this.isAuthenticated = true;
            localStorage.setItem('jobflow-user', JSON.stringify(this.currentUser));

            this.showDashboard();
        } else {
            alert('Invalid credentials! Please check your username, password, and role.');
        }
    }

    validateCredentials(username, password, role) {
        if (!username || !password || !role) return false;

        // Hardcoded passwords for this prototype
        const credentials = {
            'admin': 'admin2026',
            'supervisor': 'manage2026',
            'worker': 'work2026'
        };

        return credentials[role] === password;
    }

    showDashboard() {
        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');

        // Update UI based on role
        if (this.currentUser.role === 'supervisor' || this.currentUser.role === 'admin') {
            document.body.classList.add('supervisor-mode');
            // If toggle exists (checking for backward compatibility during refactor)
            const toggle = document.getElementById('modeToggle');
            if (toggle) toggle.classList.add('mode2');
        } else {
            document.body.classList.remove('supervisor-mode');
            const toggle = document.getElementById('modeToggle');
            if (toggle) toggle.classList.remove('mode2');
        }

        // Animate exit
        if (loginModal && window.anime) {
            anime({
                targets: loginModal,
                opacity: 0,
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => {
                    loginModal.style.display = 'none';
                    if (mainContent) {
                        mainContent.classList.remove('pointer-events-none');
                        anime({
                            targets: mainContent,
                            opacity: 1,
                            duration: 500,
                            easing: 'easeInOutQuad'
                        });
                    }
                }
            });
        }

        // Initialize dashboard data
        this.dashboard.renderAll();
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jobflow-user');
        window.location.reload();
    }
}


class JobFlowDashboard {
    constructor() {
        this.jobs = [];
        this.processes = [
            { id: 'laser', name: 'Laser Queue', color: 'blue' },
            { id: 'laser_unload', name: 'Laser Unload', color: 'indigo' },
            { id: 'press_brake', name: 'Press Brake', color: 'violet' },
            { id: 'welding', name: 'Welding', color: 'orange' },
            { id: 'powder_paint', name: 'Powder Paint', color: 'pink' },
            { id: 'shipping', name: 'Shipping', color: 'cyan' },
            { id: 'shipped', name: 'Shipped', color: 'emerald' }
        ];
        this.currentProcess = 'laser';
        this.draggedJob = null;
        this.chart = null;
        this.auth = new AuthManager(this);

        this.init();
    }

    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupDragAndDrop();
        this.setupModal();
        this.setupParticles();
        this.setupChart();
        // this.renderAll(); // Called by AuthManager
        this.animateHeader();
    }

    setupNavigation() {
        const navContainer = document.getElementById('navTabs');
        navContainer.innerHTML = '';

        this.processes.forEach(process => {
            const btn = document.createElement('button');
            btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${this.currentProcess === process.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`;
            btn.textContent = process.name;
            btn.onclick = () => this.switchProcess(process.id);
            navContainer.appendChild(btn);
        });

        // Show nav if authenticated
        if (this.auth.isAuthenticated) {
            document.getElementById('processNav').classList.remove('hidden', 'opacity-0');
            document.getElementById('processNav').classList.remove('pointer-events-none');
        }
    }

    switchProcess(processId) {
        this.currentProcess = processId;

        // Update UI
        this.setupNavigation(); // Re-render to update active state

        document.getElementById('currentViewTitle').textContent = `${this.getProcessName(processId)} Overview`;
        document.getElementById('currentProcessBadge').textContent = this.getProcessName(processId);

        // Animate transition
        anime({
            targets: '.column',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            duration: 400,
            easing: 'easeOutQuad'
        });

        this.renderAll();
    }

    getProcessName(id) {
        return this.processes.find(p => p.id === id)?.name || id;
    }

    loadMockData() {
        // Expanded mock data with multi-stage tracking
        const baseJobs = [
            {
                id: 'job-001', customer: 'Acme Mfg', part: 'AC-1001', qty: 150, due: '2026-01-10',
                process: 'laser', status: 'received', priority: 'high'
            },
            {
                id: 'job-002', customer: 'TechCorp', part: 'TC-2002', qty: 75, due: '2026-01-12',
                process: 'laser', status: 'started', priority: 'medium'
            },
            {
                id: 'job-003', customer: 'Ind. Sol.', part: 'IS-3003', qty: 200, due: '2026-01-08',
                process: 'laser', status: 'processing', priority: 'high'
            },
            {
                id: 'job-004', customer: 'Precision', part: 'PW-4004', qty: 50, due: '2026-01-15',
                process: 'laser', status: 'finished', priority: 'medium'
            },
            // Laser Unload Jobs
            {
                id: 'job-005', customer: 'Global Mfg', part: 'GM-5005', qty: 300, due: '2026-01-05',
                process: 'laser_unload', status: 'received', priority: 'high'
            },
            // Press Brake Jobs
            {
                id: 'job-006', customer: 'Advanced', part: 'AS-6006', qty: 125, due: '2026-01-18',
                process: 'press_brake', status: 'processing', priority: 'low'
            }
        ];

        this.jobs = baseJobs.map(job => ({
            ...job,
            jobNumber: `JOB-${job.id.split('-')[1]}`,
            createdAt: new Date().toISOString(),
            logs: []
        }));
    }

    setupEventListeners() {
        // Modal & other listeners remain same
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') this.closeModal();
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
        // No-op, handled by AuthManager
    }

    setupModal() {
        this.currentJob = null;
    }

    setupParticles() {
        const container = document.getElementById('particle-container');
        if (!container || !window.PIXI) return;

        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            backgroundAlpha: 0,
            antialias: true,
            resizeTo: window
        });

        container.appendChild(app.view);

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
    }

    setupChart() {
        const chartDom = document.getElementById('jobChart');
        if (chartDom && window.echarts) {
            this.chart = echarts.init(chartDom);
            this.updateChart();
        }
    }

    updateChart() {
        if (!this.chart) return;

        const currentJobs = this.jobs.filter(job => job.process === this.currentProcess);
        const statusCounts = {
            received: currentJobs.filter(j => j.status === 'received').length,
            started: currentJobs.filter(j => j.status === 'started').length,
            processing: currentJobs.filter(j => j.status === 'processing').length,
            finished: currentJobs.filter(j => j.status === 'finished').length
        };

        const option = {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                data: [
                    { value: statusCounts.received, name: 'Received', itemStyle: { color: '#a855f7' } },
                    { value: statusCounts.started, name: 'Started', itemStyle: { color: '#3b82f6' } },
                    { value: statusCounts.processing, name: 'Processing', itemStyle: { color: '#f59e0b' } },
                    { value: statusCounts.finished, name: 'Finished', itemStyle: { color: '#10b981' } }
                ],
                label: { color: '#fff' }
            }]
        };

        this.chart.setOption(option);
    }

    animateHeader() {
        if (window.Splitting) Splitting();
        if (window.anime) {
            anime({
                targets: '[data-splitting] .char',
                translateY: [-20, 0],
                opacity: [0, 1],
                delay: anime.stagger(20)
            });
        }
    }

    getJobsByStatus(status) {
        return this.jobs.filter(job =>
            job.process === this.currentProcess && job.status === status
        );
    }

    updateJobStatus(jobId, newStatus) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        if (job.status !== newStatus) {
            const oldStatus = job.status;
            job.status = newStatus;

            // Log action
            this.logActivity(job, `Status change: ${oldStatus} -> ${newStatus}`);

            this.renderAll();
        }
    }

    moveToNextProcess(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const currentIdx = this.processes.findIndex(p => p.id === job.process);
        if (currentIdx !== -1 && currentIdx < this.processes.length - 1) {
            const nextProcess = this.processes[currentIdx + 1];

            if (confirm(`Move job ${job.jobNumber} to ${nextProcess.name}?`)) {
                const oldProcess = job.process;
                job.process = nextProcess.id;
                job.status = 'received';

                this.logActivity(job, `Moved from ${oldProcess} to ${nextProcess.name}`);

                // Show notification
                // alert(`Job moved to ${nextProcess.name}`); // Annoying, removing

                this.switchProcess(nextProcess.id); // Valid UX: follow the job
            }
        } else {
            alert('This job is already at the final stage or process not found.');
        }
    }

    logActivity(job, action) {
        if (!job.logs) job.logs = [];
        const user = this.auth?.currentUser?.name || 'Unknown';
        job.logs.push({
            timestamp: new Date().toISOString(),
            user: user,
            action: action
        });
        console.log(`[JobLog] ${job.jobNumber}: ${action} by ${user}`);
    }

    renderAll() {
        this.renderJobs();
        this.updateChart();
    }

    renderJobs() {
        const statuses = ['received', 'started', 'processing', 'finished'];

        statuses.forEach(status => {
            const container = document.getElementById(`${status}Jobs`);
            if (container) {
                container.innerHTML = '';
                const jobs = this.getJobsByStatus(status);
                jobs.forEach(job => {
                    container.appendChild(this.createJobCard(job));
                });

                // Update counts
                const counter = document.getElementById(`${status}Count`);
                if (counter) counter.textContent = jobs.length;
            }
        });
    }

    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card bg-white rounded-lg p-4 border-l-4 shadow-sm mb-3'; // mb-3 for spacing
        card.setAttribute('data-job-id', job.id);

        // Disable drag if not allowed? For now allow all.
        card.draggable = true;

        const statusColors = {
            received: 'border-purple-500',
            started: 'border-blue-500',
            processing: 'border-amber-500',
            finished: 'border-green-500'
        };
        card.classList.add(statusColors[job.status] || 'border-gray-500');

        // Move Next Button (only if finished)
        let actionBtn = '';
        if (job.status === 'finished' && job.process !== 'shipped') {
            actionBtn = `
                <button class="w-full mt-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors move-next-btn">
                    Move to Next Stage &rarr;
                </button>
            `;
        }

        card.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm">${job.customer}</h4>
                    <p class="text-xs text-gray-600">${job.part}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs font-mono text-gray-500">${job.jobNumber}</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-lg font-bold text-gray-900">${job.qty}</span>
                    <span class="text-xs text-gray-500 ml-1">units</span>
                </div>
                <div class="text-right">
                    <span class="text-xs text-gray-500">Due: ${new Date(job.due).toLocaleDateString()}</span>
                </div>
            </div>
            
            ${actionBtn}
        `;

        // Events
        card.addEventListener('dragstart', (e) => {
            this.draggedJob = job.id;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        card.addEventListener('click', (e) => {
            // Prevent modal if clicking button
            if (!e.target.closest('.move-next-btn')) {
                this.showJobModal(job);
            }
        });

        const btn = card.querySelector('.move-next-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveToNextProcess(job.id);
            });
        }

        return card;
    }

    showJobModal(job) {
        this.currentJob = job; // Store reference
        const modal = document.getElementById('jobModal');
        const content = document.getElementById('modalContent');
        document.getElementById('modalTitle').textContent = `${job.jobNumber} Details`;

        // Reset to view mode initially
        this.renderJobDetails(job);

        modal.classList.remove('hidden');

        // Setup Edit Button Listener (remove old listeners first to avoid duplicates)
        const editBtn = document.getElementById('editJob');
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);

        newEditBtn.addEventListener('click', () => {
            if (newEditBtn.textContent.trim() === 'Edit Job') {
                this.renderEditForm(job);
                newEditBtn.textContent = 'Save Changes';
                newEditBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                newEditBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            } else {
                this.saveJobDetails();
                newEditBtn.textContent = 'Edit Job';
                newEditBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                newEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            }
        });
    }

    renderJobDetails(job) {
        const content = document.getElementById('modalContent');

        // Claim Logic
        const claimedBy = job.claimedBy;
        const currentUser = this.auth?.currentUser?.name;
        let claimHtml = '';

        if (claimedBy) {
            if (claimedBy === currentUser) {
                claimHtml = `
                    <div class="bg-blue-50 border border-blue-200 rounded p-3 flex justify-between items-center">
                        <span class="text-sm text-blue-800 font-medium">Claimed by YOU</span>
                        <button id="unclaimBtn" class="text-xs bg-white border border-blue-300 px-2 py-1 rounded text-blue-600 hover:bg-blue-50">Release Claim</button>
                    </div>`;
            } else {
                claimHtml = `
                    <div class="bg-amber-50 border border-amber-200 rounded p-3">
                        <span class="text-sm text-amber-800 font-medium">Locked: Claimed by ${claimedBy}</span>
                    </div>`;
            }
        } else {
            claimHtml = `
                <div class="bg-gray-50 border border-gray-200 rounded p-3 flex justify-between items-center">
                    <span class="text-sm text-gray-600">No one is working on this.</span>
                    <button id="claimBtn" class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Claim Job</button>
                </div>`;
        }

        // Ledger Logic
        const logsHtml = (job.logs || []).slice().reverse().map(log => `
            <div class="text-xs border-b border-gray-100 last:border-0 py-1">
                <span class="font-semibold text-slate-700">${log.user}</span>
                <span class="text-slate-500">${log.action}</span>
                <span class="text-gray-400 block text-[10px]">${new Date(log.timestamp).toLocaleString()}</span>
            </div>
        `).join('') || '<p class="text-xs text-gray-400 italic">No history yet.</p>';

        content.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-xs text-gray-500">Customer</label><p class="font-medium">${job.customer}</p></div>
                    <div><label class="text-xs text-gray-500">Part</label><p class="font-medium">${job.part}</p></div>
                    <div><label class="text-xs text-gray-500">Process</label><p class="font-medium capitalize">${job.process.replace('_', ' ')}</p></div>
                    <div><label class="text-xs text-gray-500">Status</label><p class="font-medium capitalize">${job.status}</p></div>
                    <div><label class="text-xs text-gray-500">Quantity</label><p class="font-medium">${job.qty}</p></div>
                    <div><label class="text-xs text-gray-500">Due Date</label><p class="font-medium">${job.due}</p></div>
                </div>

                <!-- Claim Section -->
                ${claimHtml}

                <!-- History Ledger -->
                <div>
                    <h4 class="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">History Ledger</h4>
                    <div class="bg-white border border-slate-200 rounded p-2 max-h-32 overflow-y-auto shadow-inner">
                        ${logsHtml}
                    </div>
                </div>
            </div>
        `;

        // Bind events
        const claimBtn = document.getElementById('claimBtn');
        if (claimBtn) claimBtn.onclick = () => this.claimJob(job);

        const unclaimBtn = document.getElementById('unclaimBtn');
        if (unclaimBtn) unclaimBtn.onclick = () => this.unclaimJob(job);
    }

    claimJob(job) {
        const user = this.auth?.currentUser?.name;
        if (!user) return;

        job.claimedBy = user;
        this.logActivity(job, 'Claimed job');
        this.renderAll();
        this.renderJobDetails(job);
    }

    unclaimJob(job) {
        job.claimedBy = null;
        this.logActivity(job, 'Released claim');
        this.renderAll();
        this.renderJobDetails(job);
    }

    renderEditForm(job) {
        const content = document.getElementById('modalContent');

        const nextProcessIdx = this.processes.findIndex(p => p.id === job.process) + 1;
        const nextProcess = this.processes[nextProcessIdx];
        const moveNextOption = nextProcess ? `<option value="${nextProcess.id}">Move to: ${nextProcess.name}</option>` : '';

        content.innerHTML = `
            <form id="editJobForm" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Customer</label>
                        <input type="text" id="editCustomer" value="${job.customer}" class="w-full text-sm border rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Part</label>
                        <input type="text" id="editPart" value="${job.part}" class="w-full text-sm border rounded px-2 py-1">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Status</label>
                        <select id="editStatus" class="w-full text-sm border rounded px-2 py-1">
                            <option value="received" ${job.status === 'received' ? 'selected' : ''}>Received</option>
                            <option value="started" ${job.status === 'started' ? 'selected' : ''}>Started</option>
                            <option value="processing" ${job.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="finished" ${job.status === 'finished' ? 'selected' : ''}>Finished</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">Process Stage</label>
                        <select id="editProcess" class="w-full text-sm border rounded px-2 py-1 font-semibold text-blue-700 bg-blue-50">
                            <option value="${job.process}">${this.getProcessName(job.process)} (Current)</option>
                            ${moveNextOption}
                        </select>
                    </div>
                </div>
                
                <div class="p-3 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
                    <strong>Note:</strong> Changes will be logged to your ID.
                </div>
            </form>
        `;
    }

    saveJobDetails() {
        if (!this.currentJob) return;

        // Safety Confirm
        if (!confirm("Are you sure you want to save these changes?")) return;

        const newCustomer = document.getElementById('editCustomer').value;
        const newPart = document.getElementById('editPart').value;
        const newStatus = document.getElementById('editStatus').value;
        const newProcess = document.getElementById('editProcess').value;

        let processChanged = false;
        if (newProcess !== this.currentJob.process) {
            this.currentJob.process = newProcess;
            // If moving process, usually reset status to received, unless specified otherwise.
            // But let's keep the user selected status if they changed it, or default to received if they didn't touch it?
            // Safer logic: If process changes, force status to 'received' to fit the flow, OR let them choose.
            // The form lets them choose both. Let's respect the form.
            this.currentJob.status = 'received'; // Auto-reset status on move is standard
            processChanged = true;
            this.switchProcess(newProcess); // Jump to new view
        } else {
            this.currentJob.status = newStatus;
        }

        this.currentJob.customer = newCustomer;
        this.currentJob.part = newPart;

        this.logActivity(this.currentJob, `Updated details. Process: ${processChanged ? 'Moved' : 'Same'}`);
        this.renderAll();

        // Return to view mode
        this.renderJobDetails(this.currentJob);
        // Alert? No, just update UI.
    }

    closeModal() {
        document.getElementById('jobModal').classList.add('hidden');
        // Reset button state
        const editBtn = document.getElementById('editJob');
        editBtn.textContent = 'Edit Job';
        editBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        editBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
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
