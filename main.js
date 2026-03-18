/**
 * Relegare Maker - Main Logic
 */

import { Generator } from './generator.js';

// State
let selectedReligions = [null, null, null];
let activeSlot = null;
let religions = [];
let masterTemplate = '';

// Fetch real database
async function loadReligions() {
    try {
        const response = await fetch('/religions.json');
        religions = await response.json();
        // Template loading continued

        // Load template
        const tplResponse = await fetch('/master_template.html');
        masterTemplate = await tplResponse.text();
    } catch (err) {
        console.error('Failed to load religions:', err);
    }
}

// DOM Elements
const slots = document.querySelectorAll('.slot-card');
const modal = document.getElementById('picker-modal');
const modalClose = document.querySelector('.modal-close');
const religionList = document.getElementById('modal-religion-list');
const searchInput = document.getElementById('religion-search');
const generateBtn = document.getElementById('generate-btn');

// Initialize
async function init() {
    await loadReligions();
    setupEventListeners();
    initStarfield();
}

function setupEventListeners() {
    slots.forEach(slot => {
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            const slotIdx = parseInt(slot.parentElement.dataset.slot) - 1;
            activeSlot = slotIdx;
            toggleDropdown(slotIdx);
        });
    });

    window.addEventListener('click', () => {
        closeAllDropdowns();
    });

    generateBtn.addEventListener('click', () => {
        if (selectedReligions.includes(null)) return;

        const generator = new Generator(masterTemplate);
        const generatedHtml = generator.generate(selectedReligions);

        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(generatedHtml);
        previewWindow.document.close();
    });
}

function toggleDropdown(slotIdx) {
    const parent = document.querySelector(`[data-slot="${slotIdx + 1}"]`);
    const menu = parent.querySelector('.dropdown-menu');
    const wasActive = menu.classList.contains('active');
    
    closeAllDropdowns();
    
    if (!wasActive) {
        renderDropdownList(menu);
        menu.classList.add('active');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
    });
}

function renderDropdownList(container) {
    container.innerHTML = '';
    religions.forEach(rel => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `
            <span class="icon">${rel.icon}</span>
            <span class="name">${rel.name}</span>
        `;
        item.onclick = (e) => {
            e.stopPropagation();
            selectReligion(rel);
        };
        container.appendChild(item);
    });
}

function selectReligion(religion) {
    selectedReligions[activeSlot] = religion;
    updateSlotUI(activeSlot);
    checkCompletion();
    closeAllDropdowns();
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
        const dBtn = document.getElementById('deploy-btn');
        if (dBtn) {
            dBtn.classList.remove('disabled');
            dBtn.disabled = false;
        }
    }
}

// Deployment Logic
document.addEventListener('DOMContentLoaded', () => {
    const deployBtn = document.getElementById('deploy-btn');
    if (deployBtn) {
        deployBtn.addEventListener('click', async () => {
            if (selectedReligions.includes(null)) {
                alert('Please select all three religions first!');
                return;
            }

            deployBtn.innerHTML = '🚀 DEPLOYING...';
            deployBtn.disabled = true;

            try {
                const generator = new Generator(masterTemplate);
                const html = generator.generate(selectedReligions);
                const projectName = `religare-${Date.now()}`;

                const response = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectName, html })
                });

                const data = await response.json();
                if (data.url) {
                    alert(`SUCCESS! Your app is live at: https://${data.url}`);
                    window.open(`https://${data.url}`, '_blank');
                } else if (data.error === 'CONFIGURATION_REQUIRED') {
                    showSetupModal(data.message);
                } else {
                    throw new Error(data.message || data.error || 'Deployment failed');
                }
            } catch (err) {
                console.error(err);
                alert('Deployment Error: ' + err.message);
            } finally {
                deployBtn.innerHTML = '🚀 DEPLOY TO VERCEL';
                deployBtn.disabled = false;
            }
        });
    }
});

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
