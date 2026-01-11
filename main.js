// JobFlow Dashboard - Main Application Logic

class AuthManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.currentUser = null;
        this.isAuthenticated = false;

        // Default Users
        this.defaultUsers = [
            { id: 'admin', name: 'System Admin', username: 'admin', password: 'admin2026', role: 'admin', assignedProcess: null },
            { id: 'supervisor', name: 'Shift Lead', username: 'supervisor', password: 'manage2026', role: 'supervisor', assignedProcess: null },
            // Operators
            { id: 'laser_op', name: 'Laser Operator', username: 'laser', password: 'work2026', role: 'worker', assignedProcess: 'laser' },
            { id: 'brake_op', name: 'Brake Operator', username: 'brake', password: 'work2026', role: 'worker', assignedProcess: 'press_brake' },
            { id: 'weld_op', name: 'Weld Operator', username: 'weld', password: 'work2026', role: 'worker', assignedProcess: 'welding' }
        ];

        this.init();
    }

    init() {
        // Initialize user DB if empty
        if (!localStorage.getItem('jobflow-users')) {
            localStorage.setItem('jobflow-users', JSON.stringify(this.defaultUsers));
        }

        // Initialize station label
        this.updateStationLabel();

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
            } catch (e) {
                console.error('Invalid session', e);
            }
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('jobflow-users') || '[]');
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('jobflow-users', JSON.stringify(users));
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const role = document.getElementById('role')?.value; // Still useful for registration, but for login we lookup

        // For login, we primarily check username/password against our DB
        const user = this.validateCredentials(username, password);

        if (user) {
            // Station Check
            const currentStation = localStorage.getItem('jobflow-station-id');
            if (currentStation) {
                // If station is set, user must be admin, supervisor, or assigned to this process
                if (user.role !== 'admin' && user.role !== 'supervisor' && user.assignedProcess !== currentStation) {
                    alert(`ACCESS DENIED: This terminal is configured as the ${currentStation.toUpperCase()} Station.\nYou are assigned to: ${user.assignedProcess || 'None'}`);
                    return;
                }
            }

            this.currentUser = {
                ...user,
                loginTime: new Date().toISOString()
            };

            this.isAuthenticated = true;
            localStorage.setItem('jobflow-user', JSON.stringify(this.currentUser));
            this.showDashboard();
        } else {
            alert('Invalid credentials! Please check your username and password.');
        }
    }

    // Admin Utility
    setStation(processId) {
        if (!processId) {
            localStorage.removeItem('jobflow-station-id');
            console.log('Station restriction removed.');
            alert('Station restriction removed.');
        } else {
            localStorage.setItem('jobflow-station-id', processId);
            console.log(`Station set to: ${processId}`);
            alert(`This terminal is now locked to: ${processId}`);
        }
        // Update UI label
        this.updateStationLabel();
    }

    updateStationLabel() {
        const stationId = localStorage.getItem('jobflow-station-id');
        const label = document.getElementById('stationLabel');
        if (label) {
            if (stationId) {
                label.textContent = `Terminal: ${stationId.toUpperCase()}`;
                label.classList.remove('hidden');
            } else {
                label.classList.add('hidden');
            }
        }
    }

    validateCredentials(username, password) {
        if (!username || !password) return null;
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password);
    }

    registerUser(name, username, password, role, assignedProcess) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: username.toLowerCase().replace(/\s/g, '_'),
            name,
            username,
            password,
            role, // 'admin', 'supervisor', 'worker'
            assignedProcess // 'laser', 'welding', etc. or null
        };

        this.saveUser(newUser);
        return { success: true, message: 'User registered successfully' };
    }

    showDashboard() {
        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');

        // Body class for styling
        document.body.className = 'hero-bg'; // Reset
        if (this.currentUser.role === 'supervisor' || this.currentUser.role === 'admin') {
            document.body.classList.add('supervisor-mode');
        } else {
            document.body.classList.add('operator-mode');
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

        // Initialize dashboard data with permissions
        this.dashboard.initializeView(this.currentUser);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jobflow-user');
        window.location.reload();
    }
}


class MaintenanceManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.tickets = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('jobflow-maintenance');
        if (saved) this.tickets = JSON.parse(saved);
    }

    createTicket(processId, description, reporter) {
        const ticket = {
            id: 'maint-' + Date.now(),
            processId,
            description,
            reporter,
            status: 'open', // open, resolved
            timestamp: new Date().toISOString()
        };
        this.tickets.push(ticket);
        this.save();
        return ticket;
    }

    resolveTicket(ticketId, resolver) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'resolved';
            ticket.resolvedBy = resolver;
            ticket.resolvedAt = new Date().toISOString();
            this.save();
        }
    }

    save() {
        localStorage.setItem('jobflow-maintenance', JSON.stringify(this.tickets));
        this.dashboard.renderAll(); // Refresh UI to show flags
    }

    getOpenTickets(processId) {
        return this.tickets.filter(t => t.status === 'open' && (!processId || t.processId === processId));
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
        this.charts = {}; // Store multiple charts for supervisor view
        this.auth = new AuthManager(this);
        this.maintenance = new MaintenanceManager(this);

        this.init();
    }

    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupModal();
        this.setupParticles();
        this.setupChart();
        this.animateHeader();
    }

    initializeView(user) {
        // Clear existing UI state
        document.getElementById('navTabs').innerHTML = '';
        document.getElementById('supervisorDashboard')?.classList.add('hidden');
        document.getElementById('processDashboard')?.classList.add('hidden');

        if (user.role === 'admin' || user.role === 'supervisor') {
            this.setupSupervisorNavigation();
            this.switchProcess('overview'); // Default to bird's eye view
        } else {
            // Operator restricted view
            if (user.assignedProcess && this.processes.find(p => p.id === user.assignedProcess)) {
                this.currentProcess = user.assignedProcess;
                this.switchProcess(this.currentProcess);
                // Hide nav for single-process operators
                document.getElementById('processNav').classList.add('hidden');
                document.getElementById('processDashboard').classList.remove('hidden');

                // Show maintenance button for operator
                this.addMaintenanceButton();
            } else {
                alert('Account has no assigned process. Please contact supervisor.');
                this.auth.logout();
            }
        }

        // Show main content container
        document.getElementById('mainContent').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('mainContent').style.opacity = '1';
    }

    setupSupervisorNavigation() {
        const navContainer = document.getElementById('navTabs');
        document.getElementById('processNav').classList.remove('hidden', 'opacity-0', 'pointer-events-none');

        // Add "Overview" tab
        this.addNavTab(navContainer, 'overview', 'Overview');

        this.processes.forEach(process => {
            this.addNavTab(navContainer, process.id, process.name);
        });
    }

    addNavTab(container, id, name) {
        const btn = document.createElement('button');
        btn.dataset.id = id;
        btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${this.currentProcess === id
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`;
        btn.textContent = name;
        btn.onclick = () => this.switchProcess(id);
        container.appendChild(btn);
    }

    addMaintenanceButton() {
        // Check if button already exists
        if (document.getElementById('reportIssueBtn')) return;

        const container = document.querySelector('.hero-bg'); // Append to body/main wrapper or header
        const btn = document.createElement('button');
        btn.id = 'reportIssueBtn';
        btn.className = 'fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105';
        btn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>Report Issue</span>
        `;
        btn.onclick = () => this.showMaintenanceModal();
        document.body.appendChild(btn);
    }

    switchProcess(processId) {
        this.currentProcess = processId;

        // Update Nav UI
        document.querySelectorAll('#navTabs button').forEach(btn => {
            if (btn.dataset.id === processId) {
                btn.className = 'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all bg-blue-600 text-white shadow-lg';
            } else {
                btn.className = 'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white';
            }
        });

        const supervisorDash = document.getElementById('supervisorDashboard');
        const processDash = document.getElementById('processDashboard');

        if (processId === 'overview') {
            supervisorDash.classList.remove('hidden');
            processDash.classList.add('hidden');
            document.getElementById('currentViewTitle').textContent = 'Plant Overview';
            document.getElementById('currentProcessBadge').textContent = 'All Processes';
            this.renderSupervisorDashboard();
        } else {
            supervisorDash.classList.add('hidden');
            processDash.classList.remove('hidden');
            document.getElementById('currentViewTitle').textContent = `${this.getProcessName(processId)} Overview`;
            document.getElementById('currentProcessBadge').textContent = this.getProcessName(processId);

            // Re-setup drag/drop for this view? It's already bound to columns, but we need to refresh data
            this.renderAll();
        }
    }

    getProcessName(id) {
        return this.processes.find(p => p.id === id)?.name || id;
    }

    renderSupervisorDashboard() {
        const container = document.getElementById('supervisorDashboard');
        if (!container) return;

        container.innerHTML = ''; // Clear

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

        this.processes.forEach(process => {
            const jobs = this.jobs.filter(j => j.process === process.id);
            const openTickets = this.maintenance.getOpenTickets(process.id);
            const hasIssues = openTickets.length > 0;

            const card = document.createElement('div');
            card.className = `bg-slate-800/80 backdrop-blur rounded-xl p-4 border ${hasIssues ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700'} hover:border-slate-500 transition-all cursor-pointer relative group`;

            // Click card to enter process view, unless clicking the issue badge
            card.onclick = (e) => {
                if (!e.target.closest('.issue-badge')) {
                    this.switchProcess(process.id);
                }
            };

            // Calculate stats
            const stats = {
                total: jobs.length,
                overdue: jobs.filter(j => new Date(j.due) < new Date()).length
            };

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-white text-lg">${process.name}</h3>
                        <p class="text-xs text-slate-400">${stats.total} Active Jobs</p>
                    </div>
                    ${hasIssues ? `
                        <div class="issue-badge animate-pulse bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center cursor-pointer transition-colors z-10"
                             onclick="window.dashboard.showMaintenanceTickets('${process.id}')">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            ${openTickets.length} Issue(s)
                        </div>` : ''}
                </div>
                
                <!-- Mini Chart Container -->
                <div id="chart-mini-${process.id}" style="height: 120px;" class="mb-2"></div>
                
                <div class="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                    <span>${stats.overdue > 0 ? `<span class="text-red-400">${stats.overdue} Overdue</span>` : 'On Schedule'}</span>
                    <span class="text-blue-400 hover:underline">View Details &rarr;</span>
                </div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);

        // Initialize mini charts after DOM insertion
        requestAnimationFrame(() => {
            this.processes.forEach(process => {
                this.renderMiniChart(process.id);
            });
        });
    }

    showMaintenanceTickets(processId) {
        const tickets = this.maintenance.getOpenTickets(processId);
        if (tickets.length === 0) return;

        // Reuse jobModal for simplicity or create a simpler prompt
        // Let's us a simple confirmation loop for now or a custom alert
        // A simple prompt approach for MVP:

        let msg = `Maintenance Issues for ${this.getProcessName(processId)}:\n\n`;
        tickets.forEach((t, i) => {
            msg += `${i + 1}. [${new Date(t.timestamp).toLocaleTimeString()}] ${t.reporter}: ${t.description}\n`;
        });
        msg += `\nEnter ticket number (1-${tickets.length}) to resolve, or Cancel.`;

        const reply = prompt(msg);
        if (reply) {
            const index = parseInt(reply) - 1;
            if (index >= 0 && index < tickets.length) {
                this.maintenance.resolveTicket(tickets[index].id, this.auth.currentUser.name);
                alert('Ticket resolved.');
                this.renderAll(); // Re-render supervisor view to update badge
            }
        }
    }

    renderMiniChart(processId) {
        const dom = document.getElementById(`chart-mini-${processId}`);
        if (!dom || !window.echarts) return;

        const jobs = this.jobs.filter(j => j.process === processId);
        const counts = {
            received: jobs.filter(j => j.status === 'received').length,
            started: jobs.filter(j => j.status === 'started').length,
            processing: jobs.filter(j => j.status === 'processing').length,
            finished: jobs.filter(j => j.status === 'finished').length
        };

        // Don't init if empty to save resources? No, show empty ring
        const chart = echarts.init(dom);
        const option = {
            color: ['#a855f7', '#3b82f6', '#f59e0b', '#10b981'],
            series: [{
                type: 'pie',
                radius: ['60%', '80%'],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: false } },
                data: [
                    { value: counts.received, name: 'Received' },
                    { value: counts.started, name: 'Started' },
                    { value: counts.processing, name: 'Processing' },
                    { value: counts.finished, name: 'Finished' }
                ]
            }]
        };

        if (jobs.length === 0) {
            option.series[0].data = [{ value: 0, name: 'Empty', itemStyle: { color: '#334155' } }];
        }

        chart.setOption(option);
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
        }));
    }

    setupEventListeners() {
        // Modal & other listeners
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') this.closeModal();
        });

        // Maintenance Form
        const maintForm = document.getElementById('maintenanceForm');
        if (maintForm) {
            maintForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const desc = document.getElementById('maintDescription').value;
                if (!desc) return;

                this.maintenance.createTicket(
                    this.currentProcess,
                    desc,
                    this.auth.currentUser.name
                );

                document.getElementById('maintDescription').value = '';
                document.getElementById('maintenanceModal').classList.add('hidden');
                alert('Report submitted to supervisor.');
            });
        }
    }

    showMaintenanceModal() {
        document.getElementById('maintenanceModal').classList.remove('hidden');
    }

    openAiAssistant() {
        document.getElementById('aiAssistantModal').classList.remove('hidden');
    }

    initializeView(user) {
        // Clear existing UI state
        document.getElementById('navTabs').innerHTML = '';
        document.getElementById('supervisorDashboard')?.classList.add('hidden');
        document.getElementById('processDashboard')?.classList.add('hidden');

        // Cleanup buttons
        document.getElementById('reportIssueBtn')?.remove();
        document.getElementById('addUserBtn')?.remove();

        if (user.role === 'admin' || user.role === 'supervisor') {
            this.setupSupervisorNavigation();
            this.switchProcess('overview'); // Default to bird's eye view

            // Add User Management Button if Admin
            if (user.role === 'admin') {
                this.addManageUsersButton();
            }
        } else {
            // Operator restricted view
            if (user.assignedProcess && this.processes.find(p => p.id === user.assignedProcess)) {
                this.currentProcess = user.assignedProcess;
                this.switchProcess(this.currentProcess);
                // Hide nav for single-process operators
                document.getElementById('processNav').classList.add('hidden');
                document.getElementById('processDashboard').classList.remove('hidden');

                // Show maintenance button for operator
                this.addMaintenanceButton();
            } else {
                alert('Account has no assigned process. Please contact supervisor.');
                this.auth.logout();
            }
        }

        // Show main content container
        document.getElementById('mainContent').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('mainContent').style.opacity = '1';
    }

    addManageUsersButton() {
        const container = document.querySelector('header .flex.items-center.space-x-6');
        if (!container) return;

        const div = document.createElement('div');
        div.id = 'addUserBtn';
        div.innerHTML = `
            <button onclick="window.dashboard.showUserModal()" class="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                + Users
            </button>
         `;
        container.insertBefore(div, container.firstChild);
    }

    showUserModal() {
        const userInput = prompt("Enter new User details in format: Name,Username,Password,Role,Process\nExample: John Doe,john,pass123,worker,laser\nRoles: admin, supervisor, worker\nProcesses: laser, laser_unload, press_brake, welding, powder_paint, shipping");

        if (userInput) {
            const [name, username, password, role, process] = userInput.split(',').map(s => s.trim());
            if (name && username && password && role) {
                const result = this.auth.registerUser(name, username, password, role, process || null);
                alert(result.message);
            } else {
                alert("Invalid format.");
            }
        }
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
    // dashboard.loadState(); // Method removed/integrated into init
    dashboard.renderAll();

    // Make dashboard globally available for debugging
    window.dashboard = dashboard;
});

// Handle window resize for chart
window.addEventListener('resize', () => {
    if (window.dashboard && window.dashboard.chart) {
        window.dashboard.chart.resize();
    }
});        const savedUser = localStorage.getItem('jobflow-user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
            } catch (e) {
                console.error('Invalid session', e);
            }
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('jobflow-users') || '[]');
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('jobflow-users', JSON.stringify(users));
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const role = document.getElementById('role')?.value; // Still useful for registration, but for login we lookup

        // For login, we primarily check username/password against our DB
        const user = this.validateCredentials(username, password);

        if (user) {
            // Station Check
            const currentStation = localStorage.getItem('jobflow-station-id');
            if (currentStation) {
                // If station is set, user must be admin, supervisor, or assigned to this process
                if (user.role !== 'admin' && user.role !== 'supervisor' && user.assignedProcess !== currentStation) {
                    alert(`ACCESS DENIED: This terminal is configured as the ${currentStation.toUpperCase()} Station.\nYou are assigned to: ${user.assignedProcess || 'None'}`);
                    return;
                }
            }

            this.currentUser = {
                ...user,
                loginTime: new Date().toISOString()
            };

            this.isAuthenticated = true;
            localStorage.setItem('jobflow-user', JSON.stringify(this.currentUser));
            this.showDashboard();
        } else {
            alert('Invalid credentials! Please check your username and password.');
        }
    }

    // Admin Utility
    setStation(processId) {
        if (!processId) {
            localStorage.removeItem('jobflow-station-id');
            console.log('Station restriction removed.');
            alert('Station restriction removed.');
        } else {
            localStorage.setItem('jobflow-station-id', processId);
            console.log(`Station set to: ${processId}`);
            alert(`This terminal is now locked to: ${processId}`);
        }
        // Update UI label
        this.updateStationLabel();
    }

    updateStationLabel() {
        const stationId = localStorage.getItem('jobflow-station-id');
        const label = document.getElementById('stationLabel');
        if (label) {
            if (stationId) {
                label.textContent = `Terminal: ${stationId.toUpperCase()}`;
                label.classList.remove('hidden');
            } else {
                label.classList.add('hidden');
            }
        }
    }

    validateCredentials(username, password) {
        if (!username || !password) return null;
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password);
    }

    registerUser(name, username, password, role, assignedProcess) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: username.toLowerCase().replace(/\s/g, '_'),
            name,
            username,
            password,
            role, // 'admin', 'supervisor', 'worker'
            assignedProcess // 'laser', 'welding', etc. or null
        };

        this.saveUser(newUser);
        return { success: true, message: 'User registered successfully' };
    }

    showDashboard() {
        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');

        // Body class for styling
        document.body.className = 'hero-bg'; // Reset
        if (this.currentUser.role === 'supervisor' || this.currentUser.role === 'admin') {
            document.body.classList.add('supervisor-mode');
        } else {
            document.body.classList.add('operator-mode');
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

        // Initialize dashboard data with permissions
        this.dashboard.initializeView(this.currentUser);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jobflow-user');
        window.location.reload();
    }
}


class MaintenanceManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.tickets = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('jobflow-maintenance');
        if (saved) this.tickets = JSON.parse(saved);
    }

    createTicket(processId, description, reporter) {
        const ticket = {
            id: 'maint-' + Date.now(),
            processId,
            description,
            reporter,
            status: 'open', // open, resolved
            timestamp: new Date().toISOString()
        };
        this.tickets.push(ticket);
        this.save();
        return ticket;
    }

    resolveTicket(ticketId, resolver) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'resolved';
            ticket.resolvedBy = resolver;
            ticket.resolvedAt = new Date().toISOString();
            this.save();
        }
    }

    save() {
        localStorage.setItem('jobflow-maintenance', JSON.stringify(this.tickets));
        this.dashboard.renderAll(); // Refresh UI to show flags
    }

    getOpenTickets(processId) {
        return this.tickets.filter(t => t.status === 'open' && (!processId || t.processId === processId));
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
        this.charts = {}; // Store multiple charts for supervisor view
        this.auth = new AuthManager(this);
        this.maintenance = new MaintenanceManager(this);

        this.init();
    }

    initializeView(user) {
        // Clear existing UI state
        document.getElementById('navTabs').innerHTML = '';
        document.getElementById('supervisorDashboard')?.classList.add('hidden');
        document.getElementById('processDashboard')?.classList.add('hidden');

        if (user.role === 'admin' || user.role === 'supervisor') {
            this.setupSupervisorNavigation();
            this.switchProcess('overview'); // Default to bird's eye view
        } else {
            // Operator restricted view
            if (user.assignedProcess && this.processes.find(p => p.id === user.assignedProcess)) {
                this.currentProcess = user.assignedProcess;
                this.switchProcess(this.currentProcess);
                // Hide nav for single-process operators
                document.getElementById('processNav').classList.add('hidden');
                document.getElementById('processDashboard').classList.remove('hidden');

                // Show maintenance button for operator
                this.addMaintenanceButton();
            } else {
                alert('Account has no assigned process. Please contact supervisor.');
                this.auth.logout();
            }
        }

        // Show main content container
        document.getElementById('mainContent').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('mainContent').style.opacity = '1';
    }

    setupSupervisorNavigation() {
        const navContainer = document.getElementById('navTabs');
        document.getElementById('processNav').classList.remove('hidden', 'opacity-0', 'pointer-events-none');

        // Add "Overview" tab
        this.addNavTab(navContainer, 'overview', 'Overview');

        this.processes.forEach(process => {
            this.addNavTab(navContainer, process.id, process.name);
        });
    }

    addNavTab(container, id, name) {
        const btn = document.createElement('button');
        btn.dataset.id = id;
        btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${this.currentProcess === id
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`;
        btn.textContent = name;
        btn.onclick = () => this.switchProcess(id);
        container.appendChild(btn);
    }

    addMaintenanceButton() {
        // Check if button already exists
        if (document.getElementById('reportIssueBtn')) return;

        const container = document.querySelector('.hero-bg'); // Append to body/main wrapper or header
        const btn = document.createElement('button');
        btn.id = 'reportIssueBtn';
        btn.className = 'fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105';
        btn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>Report Issue</span>
        `;
        btn.onclick = () => this.showMaintenanceModal();
        document.body.appendChild(btn);
    }

    switchProcess(processId) {
        this.currentProcess = processId;

        // Update Nav UI
        document.querySelectorAll('#navTabs button').forEach(btn => {
            if (btn.dataset.id === processId) {
                btn.className = 'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all bg-blue-600 text-white shadow-lg';
            } else {
                btn.className = 'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white';
            }
        });

        const supervisorDash = document.getElementById('supervisorDashboard');
        const processDash = document.getElementById('processDashboard');

        if (processId === 'overview') {
            supervisorDash.classList.remove('hidden');
            processDash.classList.add('hidden');
            document.getElementById('currentViewTitle').textContent = 'Plant Overview';
            document.getElementById('currentProcessBadge').textContent = 'All Processes';
            this.renderSupervisorDashboard();
        } else {
            supervisorDash.classList.add('hidden');
            processDash.classList.remove('hidden');
            document.getElementById('currentViewTitle').textContent = `${this.getProcessName(processId)} Overview`;
            document.getElementById('currentProcessBadge').textContent = this.getProcessName(processId);

            // Re-setup drag/drop for this view? It's already bound to columns, but we need to refresh data
            this.renderAll();
        }
    }

    getProcessName(id) {
        return this.processes.find(p => p.id === id)?.name || id;
    }

    renderSupervisorDashboard() {
        const container = document.getElementById('supervisorDashboard');
        if (!container) return;

        container.innerHTML = ''; // Clear

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

        this.processes.forEach(process => {
            const jobs = this.jobs.filter(j => j.process === process.id);
            const openTickets = this.maintenance.getOpenTickets(process.id);
            const hasIssues = openTickets.length > 0;

            const card = document.createElement('div');
            card.className = `bg-slate-800/80 backdrop-blur rounded-xl p-4 border ${hasIssues ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700'} hover:border-slate-500 transition-all cursor-pointer relative group`;

            // Click card to enter process view, unless clicking the issue badge
            card.onclick = (e) => {
                if (!e.target.closest('.issue-badge')) {
                    this.switchProcess(process.id);
                }
            };

            // Calculate stats
            const stats = {
                total: jobs.length,
                overdue: jobs.filter(j => new Date(j.due) < new Date()).length
            };

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-white text-lg">${process.name}</h3>
                        <p class="text-xs text-slate-400">${stats.total} Active Jobs</p>
                    </div>
                    ${hasIssues ? `
                        <div class="issue-badge animate-pulse bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center cursor-pointer transition-colors z-10"
                             onclick="window.dashboard.showMaintenanceTickets('${process.id}')">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            ${openTickets.length} Issue(s)
                        </div>` : ''}
                </div>
                
                <!-- Mini Chart Container -->
                <div id="chart-mini-${process.id}" style="height: 120px;" class="mb-2"></div>
                
                <div class="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                    <span>${stats.overdue > 0 ? `<span class="text-red-400">${stats.overdue} Overdue</span>` : 'On Schedule'}</span>
                    <span class="text-blue-400 hover:underline">View Details &rarr;</span>
                </div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);

        // Initialize mini charts after DOM insertion
        requestAnimationFrame(() => {
            this.processes.forEach(process => {
                this.renderMiniChart(process.id);
            });
        });
    }

    showMaintenanceTickets(processId) {
        const tickets = this.maintenance.getOpenTickets(processId);
        if (tickets.length === 0) return;

        // Reuse jobModal for simplicity or create a simpler prompt
        // Let's us a simple confirmation loop for now or a custom alert
        // A simple prompt approach for MVP:

        let msg = `Maintenance Issues for ${this.getProcessName(processId)}:\n\n`;
        tickets.forEach((t, i) => {
            msg += `${i + 1}. [${new Date(t.timestamp).toLocaleTimeString()}] ${t.reporter}: ${t.description}\n`;
        });
        msg += `\nEnter ticket number (1-${tickets.length}) to resolve, or Cancel.`;

        const reply = prompt(msg);
        if (reply) {
            const index = parseInt(reply) - 1;
            if (index >= 0 && index < tickets.length) {
                this.maintenance.resolveTicket(tickets[index].id, this.auth.currentUser.name);
                alert('Ticket resolved.');
                this.renderAll(); // Re-render supervisor view to update badge
            }
        }
    }

    renderMiniChart(processId) {
        const dom = document.getElementById(`chart-mini-${processId}`);
        if (!dom || !window.echarts) return;

        const jobs = this.jobs.filter(j => j.process === processId);
        const counts = {
            received: jobs.filter(j => j.status === 'received').length,
            started: jobs.filter(j => j.status === 'started').length,
            processing: jobs.filter(j => j.status === 'processing').length,
            finished: jobs.filter(j => j.status === 'finished').length
        };

        // Don't init if empty to save resources? No, show empty ring
        const chart = echarts.init(dom);
        const option = {
            color: ['#a855f7', '#3b82f6', '#f59e0b', '#10b981'],
            series: [{
                type: 'pie',
                radius: ['60%', '80%'],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: false } },
                data: [
                    { value: counts.received, name: 'Received' },
                    { value: counts.started, name: 'Started' },
                    { value: counts.processing, name: 'Processing' },
                    { value: counts.finished, name: 'Finished' }
                ]
            }]
        };

        if (jobs.length === 0) {
            option.series[0].data = [{ value: 0, name: 'Empty', itemStyle: { color: '#334155' } }];
        }

        chart.setOption(option);
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
        }));
    }

    setupEventListeners() {
        // Modal & other listeners
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('jobModal').addEventListener('click', (e) => {
            if (e.target.id === 'jobModal') this.closeModal();
        });

        // Maintenance Form
        const maintForm = document.getElementById('maintenanceForm');
        if (maintForm) {
            maintForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const desc = document.getElementById('maintDescription').value;
                if (!desc) return;

                this.maintenance.createTicket(
                    this.currentProcess,
                    desc,
                    this.auth.currentUser.name
                );

                document.getElementById('maintDescription').value = '';
                document.getElementById('maintenanceModal').classList.add('hidden');
                alert('Report submitted to supervisor.');
            });
        }
    }

    showMaintenanceModal() {
        document.getElementById('maintenanceModal').classList.remove('hidden');
    }

    openAiAssistant() {
        document.getElementById('aiAssistantModal').classList.remove('hidden');
    }

    initializeView(user) {
        // Clear existing UI state
        document.getElementById('navTabs').innerHTML = '';
        document.getElementById('supervisorDashboard')?.classList.add('hidden');
        document.getElementById('processDashboard')?.classList.add('hidden');

        // Cleanup buttons
        document.getElementById('reportIssueBtn')?.remove();
        document.getElementById('addUserBtn')?.remove();

        if (user.role === 'admin' || user.role === 'supervisor') {
            this.setupSupervisorNavigation();
            this.switchProcess('overview'); // Default to bird's eye view

            // Add User Management Button if Admin
            if (user.role === 'admin') {
                this.addManageUsersButton();
            }
        } else {
            // Operator restricted view
            if (user.assignedProcess && this.processes.find(p => p.id === user.assignedProcess)) {
                this.currentProcess = user.assignedProcess;
                this.switchProcess(this.currentProcess);
                // Hide nav for single-process operators
                document.getElementById('processNav').classList.add('hidden');
                document.getElementById('processDashboard').classList.remove('hidden');

                // Show maintenance button for operator
                this.addMaintenanceButton();
            } else {
                alert('Account has no assigned process. Please contact supervisor.');
                this.auth.logout();
            }
        }

        // Show main content container
        document.getElementById('mainContent').classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('mainContent').style.opacity = '1';
    }

    addManageUsersButton() {
        const container = document.querySelector('header .flex.items-center.space-x-6');
        if (!container) return;

        const div = document.createElement('div');
        div.id = 'addUserBtn';
        div.innerHTML = `
            <button onclick="window.dashboard.showUserModal()" class="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                + Users
            </button>
         `;
        container.insertBefore(div, container.firstChild);
    }

    showUserModal() {
        const userInput = prompt("Enter new User details in format: Name,Username,Password,Role,Process\nExample: John Doe,john,pass123,worker,laser\nRoles: admin, supervisor, worker\nProcesses: laser, laser_unload, press_brake, welding, powder_paint, shipping");

        if (userInput) {
            const [name, username, password, role, process] = userInput.split(',').map(s => s.trim());
            if (name && username && password && role) {
                const result = this.auth.registerUser(name, username, password, role, process || null);
                alert(result.message);
            } else {
                alert("Invalid format.");
            }
        }
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
