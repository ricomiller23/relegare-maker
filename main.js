/**
 * Relegare Maker - Main Logic
 */

// State
let selectedReligions = [null, null, null];
let activeSlot = null;

// Mock Database (Story #2 will replace this with a real JSON)
const religions = [
    { id: 'catholicism', name: 'Catholicism', icon: '✝', color: 'blue' },
    { id: 'zoroastrianism', name: 'Zoroastrianism', icon: '🔥', color: 'fire' },
    { id: 'islam', name: 'Islam', icon: '☪', color: 'primary' },
    { id: 'buddhism', name: 'Buddhism', icon: '☸', color: 'gold' },
    { id: 'hinduism', name: 'Hinduism', icon: '🕉', color: 'fire' },
    { id: 'judaism', name: 'Judaism', icon: '✡', color: 'blue' },
    { id: 'shinto', name: 'Shinto', icon: '⛩', color: 'red' },
    { id: 'sikhism', name: 'Sikhism', icon: '☬', color: 'fire' }
];

// DOM Elements
const slots = document.querySelectorAll('.slot-card');
const modal = document.getElementById('picker-modal');
const modalClose = document.querySelector('.modal-close');
const religionList = document.getElementById('modal-religion-list');
const searchInput = document.getElementById('religion-search');
const generateBtn = document.getElementById('generate-btn');

// Initialize
function init() {
    renderReligionList(religions);
    setupEventListeners();
    initStarfield();
}

function setupEventListeners() {
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            activeSlot = parseInt(slot.parentElement.dataset.slot) - 1;
            openModal();
        });
    });

    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = religions.filter(r => r.name.toLowerCase().includes(term));
        renderReligionList(filtered);
    });

    generateBtn.addEventListener('click', () => {
        if (!generateBtn.classList.contains('disabled')) {
            alert('Generation process starting... (Story #4)');
        }
    });
}

function openModal() {
    modal.classList.add('active');
    searchInput.value = '';
    renderReligionList(religions);
    searchInput.focus();
}

function closeModal() {
    modal.classList.remove('active');
    activeSlot = null;
}

function renderReligionList(list) {
    religionList.innerHTML = '';
    list.forEach(rel => {
        const item = document.createElement('div');
        item.className = 'religion-item';
        item.innerHTML = `
            <span class="icon">${rel.icon}</span>
            <span class="name">${rel.name}</span>
        `;
        item.onclick = () => selectReligion(rel);
        religionList.appendChild(item);
    });
}

function selectReligion(religion) {
    selectedReligions[activeSlot] = religion;
    updateSlotUI(activeSlot);
    checkCompletion();
    closeModal();
}

function updateSlotUI(slotIndex) {
    const slot = document.querySelector(`[data-slot="${slotIndex + 1}"] .slot-card`);
    const rel = selectedReligions[slotIndex];
    
    slot.innerHTML = `
        <span class="card-icon" style="font-size: 48px; margin-bottom: 20px;">${rel.icon}</span>
        <div class="card-title" style="font-size: 20px; color: var(--accent-primary);">${rel.name}</div>
        <div class="text-muted" style="font-size: 12px; margin-top: 10px;">Change Religion</div>
    `;
    slot.classList.add('filled');
    slot.classList.remove('empty');
}

function checkCompletion() {
    const isComplete = selectedReligions.every(r => r !== null);
    if (isComplete) {
        generateBtn.classList.remove('disabled');
        generateBtn.disabled = false;
    }
}

// Starfield Logic (ported from original)
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let width, height, stars = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        genStars();
    }

    function genStars() {
        stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                opacity: Math.random(),
                speed: 0.1 + Math.random() * 0.3
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#000';
        stars.forEach(s => {
            ctx.globalAlpha = s.opacity;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            s.y -= s.speed;
            if (s.y < 0) s.y = height;
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

init();
