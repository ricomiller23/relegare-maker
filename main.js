/**
 * Relegare Maker - Main Logic
 */

import { Generator } from './generator.js';

// State
let selectedReligions = [null, null, null];
let activeSlot = null;
let religions = [];
let masterTemplate = '';

// DOM Elements
let slots, modal, modalClose, religionList, searchInput, generateBtn, deployBtn;

// Fetch real database
async function loadReligions() {
    try {
        const response = await fetch('/religions.json');
        religions = await response.json();

        const tplResponse = await fetch('/master_template.html');
        masterTemplate = await tplResponse.text();
    } catch (err) {
        console.error('Failed to load religions:', err);
    }
}

function setupEventListeners() {
    slots = document.querySelectorAll('.slot-card');
    generateBtn = document.getElementById('generate-btn');
    deployBtn = document.getElementById('deploy-btn');

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

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (selectedReligions.includes(null)) return;
            const generator = new Generator(masterTemplate);
            const generatedHtml = generator.generate(selectedReligions);
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(generatedHtml);
            previewWindow.document.close();
        });
    }

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
        item.innerHTML = `<span class="icon">${rel.icon}</span><span class="name">${rel.name}</span>`;
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
        if (generateBtn) {
            generateBtn.classList.remove('disabled');
            generateBtn.disabled = false;
        }
        if (deployBtn) {
            deployBtn.classList.remove('disabled');
            deployBtn.disabled = false;
        }
    }
}

function showSetupModal(message) {
    const modalId = 'setup-recovery-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="text-align: left; max-width: 500px;">
                <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
                <div class="heading-22 text-gold">Final Automation Setup</div>
                <p class="text-muted" style="font-size: 14px; margin-bottom: 20px;">${message}</p>
                <div style="background: rgba(255,184,0,0.1); border: 1px solid var(--text-gold); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-size: 12px; color: var(--text-gold); margin: 0;"><strong>Why is this needed?</strong> To deploy "completely automated" from the cloud, your Vercel server needs a secure connection key (Token).</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 8px; color: var(--text-muted);">ENTER VERCEL API TOKEN (ONCE)</label>
                    <input type="password" id="recovery-token" placeholder="Paste your token here..." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #333; background: #000; color: #fff; box-sizing: border-box;">
                </div>
                <button class="btn-gold" id="save-recovery-btn" style="width: 100%;">FINISH AUTOMATION SETUP</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('save-recovery-btn').addEventListener('click', () => {
            const token = document.getElementById('recovery-token').value;
            if (!token) return alert('Please enter a token.');
            localStorage.setItem('vercel_token', token);
            alert('Token saved locally. Please paste this token into the chat so the Antigravity agent can configure your Vercel Environment permanently!');
            modal.classList.remove('active');
        });
    } else {
        modal.classList.add('active');
    }
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
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
        ctx.fillStyle = '#fff';
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

async function init() {
    await loadReligions();
    setupEventListeners();
    initStarfield();
}

document.addEventListener('DOMContentLoaded', init);
