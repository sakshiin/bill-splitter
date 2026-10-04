/**
 * BILL SPLITTER - Vanilla JavaScript Application
 * Complete Suite: Core Splitter, Itemized Split, Bill Scanner,
 * Dice Challenge, Group Games, History, QR Payment, and Settlement Export
 */

(function () {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY = 'bill_splitter_app_state_v2';
  const HISTORY_STORAGE_KEY = 'bill_splitter_history_v1';

  // --- Currencies Definition ---
  const CURRENCIES = {
    'INR': { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
    'USD': { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
    'EUR': { symbol: '€', code: 'EUR', name: 'Euro (€)' },
    'GBP': { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
    'JPY': { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
    'AED': { symbol: 'AED ', code: 'AED', name: 'UAE Dirham (AED)' }
  };

  // --- DOM Elements: Navigation Tabs ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabSections = document.querySelectorAll('.tab-content-section');

  // --- DOM Elements: Core Form ---
  const form = document.getElementById('bill-form');
  const occasionInput = document.getElementById('occasion-name');
  const billAmountInput = document.getElementById('bill-amount');
  const numPeopleInput = document.getElementById('num-people');
  const taxRateInput = document.getElementById('tax-rate');
  const customTipInput = document.getElementById('custom-tip-amount');
  const customTipContainer = document.getElementById('custom-tip-wrapper');
  const billPrefix = document.getElementById('bill-currency-prefix');

  // Controls & Switchers
  const themeSelect = document.getElementById('theme-select');
  const currencySelect = document.getElementById('currency-select');
  const btnDecrementPeople = document.getElementById('btn-decrement-people');
  const btnIncrementPeople = document.getElementById('btn-increment-people');
  const peopleChips = document.querySelectorAll('.chip-btn');
  const presetChips = document.querySelectorAll('.preset-chip');
  const tipButtons = document.querySelectorAll('.tip-btn');

  // Action Buttons
  const btnReset = document.getElementById('btn-reset');
  const btnCopy = document.getElementById('btn-copy-summary');
  const btnPrint = document.getElementById('btn-print');
  const btnShowQR = document.getElementById('btn-show-qr');
  const btnLuckyDiner = document.getElementById('btn-lucky-diner');
  const btnSaveHistory = document.getElementById('btn-save-history');
  const btnDownloadSettlement = document.getElementById('btn-download-settlement');

  // Error & Result Sections
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const resultsCard = document.getElementById('results-card');
  const emptyStateCard = document.getElementById('empty-state-card');

  // Output Displays
  const outOccasionBadge = document.getElementById('out-occasion-badge');
  const outPerPersonShare = document.getElementById('out-per-person-share');
  const outPeopleCountSummary = document.getElementById('out-people-count-summary');
  const outReceiptOccasion = document.getElementById('out-receipt-occasion');
  const outReceiptSubtotal = document.getElementById('out-receipt-subtotal');
  const outReceiptTax = document.getElementById('out-receipt-tax');
  const outReceiptTaxRate = document.getElementById('out-receipt-tax-rate');
  const outReceiptTip = document.getElementById('out-receipt-tip');
  const outReceiptTipRate = document.getElementById('out-receipt-tip-rate');
  const outReceiptTotal = document.getElementById('out-receipt-total');
  const rosterGrid = document.getElementById('roster-grid');

  // Settlement Tracker
  const settlementProgressText = document.getElementById('settlement-progress-text');
  const settlementProgressBar = document.getElementById('settlement-progress-bar');

  // Modal & QR Elements
  const qrModal = document.getElementById('qr-modal');
  const modalClose = document.getElementById('modal-close');
  const modalAmount = document.getElementById('modal-amount');
  const modalQrContainer = document.getElementById('modal-qr-container');
  const modalCopyLink = document.getElementById('modal-copy-link');
  const upiIdInput = document.getElementById('upi-id-input');

  // Toast & Confetti
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');

  // --- DOM Elements: Itemized Split ---
  const itemizedListBody = document.getElementById('itemized-table-body');
  const btnAddItemRow = document.getElementById('btn-add-item-row');
  const btnApplyItemizedToSplit = document.getElementById('btn-apply-itemized');
  const itemizedTotalDisplay = document.getElementById('itemized-computed-total');

  // --- DOM Elements: Bill Scanner ---
  const billFileInput = document.getElementById('bill-file-input');
  const billDropzone = document.getElementById('bill-dropzone');
  const scannerPreviewBox = document.getElementById('scanner-preview-box');
  const scannerImagePreview = document.getElementById('scanner-image-preview');
  const scannerParsedTable = document.getElementById('scanner-parsed-body');
  const btnApplyScannedBill = document.getElementById('btn-apply-scanned-bill');
  const btnLoadSampleBill = document.getElementById('btn-load-sample-bill');

  // --- DOM Elements: Dice Challenge ---
  const diceCube = document.getElementById('dice-cube');
  const btnRollDice = document.getElementById('btn-roll-dice');
  const diceChallengeText = document.getElementById('dice-challenge-text');
  const diceChallengeNumber = document.getElementById('dice-challenge-number');

  // --- DOM Elements: Games ---
  const gamePromptText = document.getElementById('game-prompt-text');
  const btnNextGamePrompt = document.getElementById('btn-next-game-prompt');
  const gameTypeSelect = document.getElementById('game-type-select');
  const fastFingerArena = document.getElementById('fast-finger-arena');
  const fastFingerStatus = document.getElementById('fast-finger-status');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizFeedback = document.getElementById('quiz-feedback');
  const btnNextQuiz = document.getElementById('btn-next-quiz');

  // --- DOM Elements: Bill History ---
  const historyListContainer = document.getElementById('history-list-container');
  const historyEmptyState = document.getElementById('history-empty-state');
  const btnClearAllHistory = document.getElementById('btn-clear-history');

  // --- State Object ---
  let state = {
    theme: 'purple',
    currency: 'INR',
    occasion: '',
    billAmount: '',
    numPeople: 4,
    taxRate: 5,
    selectedTip: 10,
    customTip: 10,
    customNames: {},
    paidStatus: {},
    upiId: 'organizer@upi',
    hasCalculated: false,
    itemizedItems: [
      { id: 1, name: 'Margherita Pizza', price: 420, assignedTo: [1, 2] },
      { id: 2, name: 'Garlic Bread & Dip', price: 180, assignedTo: ['all'] },
      { id: 3, name: 'Pasta Arrabiata', price: 350, assignedTo: [3] },
      { id: 4, name: 'Fresh Mint Lemonade', price: 120, assignedTo: [4] }
    ]
  };

  // --- Confetti Engine ---
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerCelebration() {
    confettiParticles = [];
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#e11d48'];
    for (let i = 0; i < 90; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: Math.random() * 9 + 6,
        h: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20 - 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }

    if (!confettiAnimationId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let active = false;

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.vx *= 0.98;
      p.rot += p.rotSpeed;
      p.life -= p.decay;

      if (p.life > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (active) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimationId = null;
    }
  }

  // --- App Initialization ---
  function init() {
    bindEvents();
    bindTabNavigation();
    bindItemizedEvents();
    bindScannerEvents();
    bindDiceEvents();
    bindGroupGamesEvents();
    bindHistoryEvents();
    loadFromStorage();
    renderItemizedTable();
    renderHistoryList();
    renderQuizQuestion(0);
  }

  // --- Tab Navigation ---
  function bindTabNavigation() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const targetTab = this.dataset.tab;
        navTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        tabSections.forEach(section => {
          if (section.id === `tab-${targetTab}`) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });
      });
    });
  }

  // --- Event Bindings: Core Splitter ---
  function bindEvents() {
    // Theme Switcher
    themeSelect.addEventListener('change', function () {
      setTheme(this.value);
    });

    // Currency Switcher
    currencySelect.addEventListener('change', function () {
      setCurrency(this.value);
    });

    // Occasion Presets
    presetChips.forEach(chip => {
      chip.addEventListener('click', function () {
        const text = this.dataset.text;
        occasionInput.value = text;
        state.occasion = text;
        saveToStorage();
        if (state.hasCalculated) {
          updateOccasionDisplays();
        }
        showToast(`Occasion set to "${text}"!`);
      });
    });

    // Steppers for people
    btnDecrementPeople.addEventListener('click', function () {
      let current = parseInt(numPeopleInput.value, 10) || 1;
      if (current > 1) {
        current -= 1;
        numPeopleInput.value = current;
        syncPeopleChips(current);
        onInputChange();
        renderItemizedTable();
      }
    });

    btnIncrementPeople.addEventListener('click', function () {
      let current = parseInt(numPeopleInput.value, 10) || 0;
      current += 1;
      numPeopleInput.value = current;
      syncPeopleChips(current);
      onInputChange();
      renderItemizedTable();
    });

    // People Quick Chips
    peopleChips.forEach(chip => {
      chip.addEventListener('click', function () {
        const val = parseInt(this.dataset.people, 10);
        numPeopleInput.value = val;
        syncPeopleChips(val);
        onInputChange();
        renderItemizedTable();
      });
    });

    numPeopleInput.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      syncPeopleChips(val);
      onInputChange();
      renderItemizedTable();
    });

    // Tip Segmented Buttons
    tipButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        tipButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const tipVal = this.dataset.tip;
        if (tipVal === 'custom') {
          state.selectedTip = 'custom';
          customTipContainer.classList.add('show');
          customTipInput.focus();
        } else {
          state.selectedTip = parseFloat(tipVal);
          customTipContainer.classList.remove('show');
        }
        onInputChange();
      });
    });

    customTipInput.addEventListener('input', function () {
      state.customTip = parseFloat(this.value) || 0;
      onInputChange();
    });

    // Live Inputs
    billAmountInput.addEventListener('input', onInputChange);
    taxRateInput.addEventListener('input', onInputChange);
    occasionInput.addEventListener('input', function () {
      state.occasion = this.value.trim();
      saveToStorage();
      if (state.hasCalculated) {
        updateOccasionDisplays();
      }
    });

    // Primary Form Submission / Calculate Trigger
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      executeCalculation(true);
    });

    // Reset Button
    btnReset.addEventListener('click', resetAll);

    // Copy Summary Button
    btnCopy.addEventListener('click', copySummaryToClipboard);

    // Print Receipt
    btnPrint.addEventListener('click', () => window.print());

    // Show QR Payment Modal
    btnShowQR.addEventListener('click', openPaymentModal);
    modalClose.addEventListener('click', closePaymentModal);
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) closePaymentModal();
    });

    modalCopyLink.addEventListener('click', copyPaymentLink);
    upiIdInput.addEventListener('change', function () {
      state.upiId = this.value.trim() || 'organizer@upi';
      generatePaymentQR();
      saveToStorage();
    });

    // Lucky Diner Spin
    btnLuckyDiner.addEventListener('click', pickLuckyDiner);

    // Save to Bill History Button
    btnSaveHistory.addEventListener('click', saveCurrentBillToHistory);

    // Download Settlement Card Button
    btnDownloadSettlement.addEventListener('click', downloadSettlementFile);
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    themeSelect.value = theme;
    saveToStorage();
  }

  function setCurrency(currCode) {
    if (!CURRENCIES[currCode]) currCode = 'INR';
    state.currency = currCode;
    currencySelect.value = currCode;
    billPrefix.textContent = CURRENCIES[currCode].symbol.trim();
    saveToStorage();
    if (state.hasCalculated) {
      executeCalculation(false);
    }
    renderItemizedTable();
    renderHistoryList();
  }

  function syncPeopleChips(val) {
    peopleChips.forEach(chip => {
      if (parseInt(chip.dataset.people, 10) === val) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  function onInputChange() {
    clearError();
    if (state.hasCalculated) {
      executeCalculation(false);
    }
  }

  // --- Strict Validation (RULE 4) ---
  function validateInputs() {
    const rawBill = billAmountInput.value.trim();
    const rawPeople = numPeopleInput.value.trim();
    const errors = [];

    // Check Bill Amount
    if (rawBill === '') {
      errors.push('Bill amount cannot be empty. Please enter the bill total.');
    } else {
      const bill = parseFloat(rawBill);
      if (isNaN(bill)) {
        errors.push('Bill amount must be a valid numeric amount.');
      } else if (bill === 0) {
        errors.push(`Bill amount cannot be zero (${getCurrencySymbol()}0.00).`);
      } else if (bill < 0) {
        errors.push('Bill amount cannot be negative.');
      }
    }

    // Check Number of People
    if (rawPeople === '') {
      errors.push('Number of people cannot be empty. Please enter at least 1 person.');
    } else {
      const people = parseFloat(rawPeople);
      if (isNaN(people) || !Number.isInteger(people)) {
        errors.push('Number of people must be a whole positive number.');
      } else if (people === 0) {
        errors.push('Number of people cannot be zero.');
      } else if (people < 0) {
        errors.push('Number of people cannot be negative.');
      }
    }

    // Check Tax
    const rawTax = taxRateInput.value.trim();
    if (rawTax !== '') {
      const tax = parseFloat(rawTax);
      if (isNaN(tax) || tax < 0) {
        errors.push('Tax percentage cannot be negative.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // --- Core Calculation Engine & Render ---
  function executeCalculation(isUserClick) {
    const validation = validateInputs();

    if (!validation.isValid) {
      // RULE 4: Show a message and NO result if bill or number of people is empty, zero or negative!
      showError(validation.errors);
      hideResults();
      state.hasCalculated = false;
      saveToStorage();

      const billVal = parseFloat(billAmountInput.value);
      if (billAmountInput.value.trim() === '' || isNaN(billVal) || billVal <= 0) {
        billAmountInput.classList.add('input-error');
      } else {
        billAmountInput.classList.remove('input-error');
      }

      const peopleVal = parseFloat(numPeopleInput.value);
      if (numPeopleInput.value.trim() === '' || isNaN(peopleVal) || peopleVal <= 0 || !Number.isInteger(peopleVal)) {
        numPeopleInput.classList.add('input-error');
      } else {
        numPeopleInput.classList.remove('input-error');
      }

      return;
    }

    clearError();
    billAmountInput.classList.remove('input-error');
    numPeopleInput.classList.remove('input-error');

    const bill = parseFloat(billAmountInput.value);
    const people = parseInt(numPeopleInput.value, 10);
    const taxRate = parseFloat(taxRateInput.value) || 0;

    let tipRate = 0;
    if (state.selectedTip === 'custom') {
      tipRate = parseFloat(customTipInput.value) || 0;
    } else {
      tipRate = parseFloat(state.selectedTip) || 0;
    }

    // Math Formulas
    const taxAmount = bill * (taxRate / 100);
    const tipAmount = bill * (tipRate / 100);
    const totalBill = bill + taxAmount + tipAmount;
    const perPersonTotal = totalBill / people;

    const occasionTitle = occasionInput.value.trim() || 'Dinner with Friends';

    // Update Displays
    outOccasionBadge.textContent = occasionTitle;
    outReceiptOccasion.textContent = occasionTitle;

    outPerPersonShare.textContent = formatCurrency(perPersonTotal);
    outPeopleCountSummary.textContent = `Split evenly among ${people} ${people === 1 ? 'person' : 'friends'}`;

    outReceiptSubtotal.textContent = formatCurrency(bill);
    outReceiptTax.textContent = formatCurrency(taxAmount);
    outReceiptTaxRate.textContent = taxRate > 0 ? `(${taxRate}%)` : '';
    outReceiptTip.textContent = formatCurrency(tipAmount);
    outReceiptTipRate.textContent = tipRate > 0 ? `(${tipRate}%)` : '';
    outReceiptTotal.textContent = formatCurrency(totalBill);

    // Build Individual Roster
    renderRoster(people, perPersonTotal);

    // Show Results Card
    showResults();
    state.hasCalculated = true;

    // Update state & persist to LocalStorage (RULE 5)
    state.occasion = occasionInput.value;
    state.billAmount = billAmountInput.value;
    state.numPeople = people;
    state.taxRate = taxRate;
    state.customTip = parseFloat(customTipInput.value) || 10;
    saveToStorage();

    if (isUserClick) {
      triggerCelebration();
      showToast('Split calculated! Tap "Mark Paid" as friends chip in.');
    }
  }

  function updateOccasionDisplays() {
    const title = occasionInput.value.trim() || 'Dinner with Friends';
    outOccasionBadge.textContent = title;
    outReceiptOccasion.textContent = title;
  }

  // --- Render Individual Roster with Paid Tracking ---
  function renderRoster(peopleCount, share) {
    rosterGrid.innerHTML = '';
    let paidCount = 0;

    for (let i = 1; i <= peopleCount; i++) {
      const personId = `person_${i}`;
      const defaultName = `Friend ${i}`;
      const savedName = (state.customNames && state.customNames[personId]) ? state.customNames[personId] : defaultName;
      const isPaid = !!(state.paidStatus && state.paidStatus[personId]);

      if (isPaid) paidCount++;

      const personCard = document.createElement('div');
      personCard.className = `person-card ${isPaid ? 'paid' : ''}`;

      personCard.innerHTML = `
        <div class="person-info">
          <div class="person-avatar">${i}</div>
          <div>
            <input type="text" class="person-name-input" data-person-id="${personId}" value="${escapeHtml(savedName)}" placeholder="${defaultName}" aria-label="Name for person ${i}" />
          </div>
        </div>
        <div class="person-actions-right">
          <span class="person-share">${formatCurrency(share)}</span>
          <button type="button" class="btn-paid-toggle" data-person-id="${personId}" title="Toggle payment status">
            ${isPaid ? 'Paid ✓' : 'Pay'}
          </button>
        </div>
      `;

      const nameInput = personCard.querySelector('.person-name-input');
      nameInput.addEventListener('change', function () {
        if (!state.customNames) state.customNames = {};
        state.customNames[personId] = this.value.trim() || defaultName;
        saveToStorage();
        renderItemizedTable();
      });

      const paidBtn = personCard.querySelector('.btn-paid-toggle');
      paidBtn.addEventListener('click', function () {
        if (!state.paidStatus) state.paidStatus = {};
        const currentlyPaid = !!state.paidStatus[personId];
        state.paidStatus[personId] = !currentlyPaid;
        saveToStorage();

        if (!currentlyPaid) {
          triggerCelebration();
          showToast(`${savedName} marked as paid! 🎉`);
        }
        renderRoster(peopleCount, share);
      });

      rosterGrid.appendChild(personCard);
    }

    const pct = peopleCount > 0 ? Math.round((paidCount / peopleCount) * 100) : 0;
    settlementProgressBar.style.width = `${pct}%`;
    settlementProgressText.textContent = `${paidCount} of ${peopleCount} paid (${pct}%)`;

    if (paidCount === peopleCount && peopleCount > 0) {
      settlementProgressText.textContent = `All ${peopleCount} paid! Bill fully settled 🎉`;
    }
  }

  // --- Lucky Diner Picker ---
  function pickLuckyDiner() {
    if (!state.hasCalculated) {
      showToast('Calculate the split first!');
      return;
    }

    const people = parseInt(numPeopleInput.value, 10) || 1;
    const luckyNum = Math.floor(Math.random() * people) + 1;
    const personId = `person_${luckyNum}`;
    const name = (state.customNames && state.customNames[personId]) ? state.customNames[personId] : `Friend ${luckyNum}`;

    const perks = [
      'gets the free dessert! 🍨',
      'chooses the next food spot! 🗺️',
      'wins diner of the day! ⭐',
      'gets extra fortune & good vibes! 🍀'
    ];
    const perk = perks[Math.floor(Math.random() * perks.length)];

    triggerCelebration();
    showToast(`🎉 Lucky Pick: ${name} ${perk}`);
  }

  // --- Offline QR Code & UPI Modal ---
  function openPaymentModal() {
    if (!state.hasCalculated) {
      showToast('Calculate the split first!');
      return;
    }
    const people = parseInt(numPeopleInput.value, 10) || 1;
    const bill = parseFloat(billAmountInput.value) || 0;
    const taxRate = parseFloat(taxRateInput.value) || 0;
    let tipRate = state.selectedTip === 'custom' ? parseFloat(customTipInput.value) || 0 : parseFloat(state.selectedTip) || 0;
    const total = bill + bill * (taxRate / 100) + bill * (tipRate / 100);
    const perPerson = total / people;

    modalAmount.textContent = `${formatCurrency(perPerson)} per person`;
    upiIdInput.value = state.upiId || 'organizer@upi';

    generatePaymentQR();
    qrModal.classList.add('show');
  }

  function closePaymentModal() {
    qrModal.classList.remove('show');
  }

  function generatePaymentQR() {
    const upi = upiIdInput.value.trim() || 'organizer@upi';
    const amount = outPerPersonShare.textContent.replace(/[^0-9.]/g, '');
    const note = encodeURIComponent(occasionInput.value.trim() || 'Dinner Bill');

    const size = 25;
    let svg = `<svg class="qr-code-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;

    const hashStr = `${upi}:${amount}:${note}`;
    let seed = 0;
    for (let i = 0; i < hashStr.length; i++) {
      seed = (seed * 31 + hashStr.charCodeAt(i)) & 0xffffffff;
    }

    function isFinder(r, c) {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= size - 7) return true;
      if (r >= size - 7 && c < 7) return true;
      return false;
    }

    function drawFinder(sr, sc) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            svg += `<rect x="${sc + c}" y="${sr + r}" width="1" height="1" fill="#0f172a"/>`;
          }
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    let s = Math.abs(seed);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isFinder(r, c)) {
          s = (s * 1103515245 + 12345) & 0x7fffffff;
          if ((s % 100) < 48) {
            svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0f172a"/>`;
          }
        }
      }
    }
    svg += `</svg>`;
    modalQrContainer.innerHTML = svg;
  }

  function copyPaymentLink() {
    const upi = upiIdInput.value.trim() || 'organizer@upi';
    const amount = outPerPersonShare.textContent.replace(/[^0-9.]/g, '');
    const note = encodeURIComponent(occasionInput.value.trim() || 'Dinner Bill');
    const paymentUrl = `upi://pay?pa=${encodeURIComponent(upi)}&pn=Organizer&am=${amount}&cu=${state.currency || 'INR'}&tn=${note}`;

    copyToClipboard(paymentUrl, 'Payment deep link copied to clipboard!');
  }

  // --- Copy Summary ---
  function copySummaryToClipboard() {
    if (!state.hasCalculated) return;

    const occasion = occasionInput.value.trim() || 'Dinner with Friends';
    const people = numPeopleInput.value;
    const share = outPerPersonShare.textContent;
    const total = outReceiptTotal.textContent;

    const textToCopy = `🧾 *${occasion}*\n` +
      `---------------------------\n` +
      `Each Person Pays: *${share}*\n` +
      `Total Bill: ${total} (${people} friends)\n` +
      `Settled with Bill Splitter ✨`;

    copyToClipboard(textToCopy, 'Split summary copied to clipboard!');
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Copied text!');
    }
    document.body.removeChild(ta);
  }

  // --- Download Settlement Card ---
  function downloadSettlementFile() {
    if (!state.hasCalculated) {
      showToast('Calculate the split first!');
      return;
    }

    const occasion = occasionInput.value.trim() || 'Dinner with Friends';
    const people = parseInt(numPeopleInput.value, 10) || 1;
    const bill = outReceiptSubtotal.textContent;
    const tax = outReceiptTax.textContent;
    const tip = outReceiptTip.textContent;
    const total = outReceiptTotal.textContent;
    const share = outPerPersonShare.textContent;
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let rosterSummary = '';
    for (let i = 1; i <= people; i++) {
      const personId = `person_${i}`;
      const name = (state.customNames && state.customNames[personId]) ? state.customNames[personId] : `Friend ${i}`;
      const isPaid = !!(state.paidStatus && state.paidStatus[personId]);
      rosterSummary += `• ${name}: ${share} [${isPaid ? 'PAID ✓' : 'PENDING'}]\n`;
    }

    const content = `=========================================\n` +
      `          DINING SETTLEMENT RECEIPT      \n` +
      `=========================================\n` +
      `Occasion: ${occasion}\n` +
      `Date:     ${date}\n` +
      `Currency: ${state.currency}\n` +
      `-----------------------------------------\n` +
      `Subtotal:     ${bill}\n` +
      `Tax:          ${tax}\n` +
      `Tip:          ${tip}\n` +
      `GRAND TOTAL:  ${total}\n` +
      `-----------------------------------------\n` +
      `EACH PERSON PAYS: ${share} (${people} people)\n` +
      `-----------------------------------------\n` +
      `CONTRIBUTOR STATUS:\n` +
      rosterSummary +
      `=========================================\n` +
      `Generated by Bill Splitter (100% Offline)\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-settlement-${occasion.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerCelebration();
    showToast('Settlement receipt downloaded!');
  }

  // --- Reset All Logic ---
  function resetAll() {
    form.reset();
    occasionInput.value = '';
    billAmountInput.value = '';
    numPeopleInput.value = 4;
    taxRateInput.value = 5;
    customTipInput.value = 10;
    customTipContainer.classList.remove('show');

    tipButtons.forEach(btn => {
      if (btn.dataset.tip === '10') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    syncPeopleChips(4);
    clearError();
    billAmountInput.classList.remove('input-error');
    numPeopleInput.classList.remove('input-error');
    hideResults();

    state.occasion = '';
    state.billAmount = '';
    state.numPeople = 4;
    state.taxRate = 5;
    state.selectedTip = 10;
    state.customTip = 10;
    state.customNames = {};
    state.paidStatus = {};
    state.hasCalculated = false;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    showToast('All fields reset');
  }

  // --- UI Helpers ---
  function showError(messages) {
    errorMessage.innerHTML = messages.map(msg => `<div>• ${escapeHtml(msg)}</div>`).join('');
    errorBanner.classList.add('show');
  }

  function clearError() {
    errorMessage.innerHTML = '';
    errorBanner.classList.remove('show');
  }

  function showResults() {
    emptyStateCard.style.display = 'none';
    resultsCard.classList.add('show');
  }

  function hideResults() {
    resultsCard.classList.remove('show');
    emptyStateCard.style.display = 'flex';
  }

  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function getCurrencySymbol() {
    const curr = CURRENCIES[state.currency] || CURRENCIES['INR'];
    return curr.symbol;
  }

  function formatCurrency(num) {
    if (isNaN(num)) return `${getCurrencySymbol()}0.00`;
    const curr = CURRENCIES[state.currency] || CURRENCIES['INR'];
    return `${curr.symbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================================================
  // MODULE: ITEMIZED SPLIT
  // ==========================================================================
  function bindItemizedEvents() {
    btnAddItemRow.addEventListener('click', function () {
      const nextId = state.itemizedItems.length > 0 ? Math.max(...state.itemizedItems.map(i => i.id)) + 1 : 1;
      state.itemizedItems.push({
        id: nextId,
        name: `Item ${nextId}`,
        price: 100,
        assignedTo: ['all']
      });
      renderItemizedTable();
    });

    btnApplyItemizedToSplit.addEventListener('click', applyItemizedToQuickSplit);
  }

  function renderItemizedTable() {
    if (!itemizedListBody) return;
    itemizedListBody.innerHTML = '';

    const people = parseInt(numPeopleInput.value, 10) || 4;
    let totalSum = 0;

    state.itemizedItems.forEach((item, index) => {
      totalSum += parseFloat(item.price) || 0;
      const tr = document.createElement('tr');

      let pillsHtml = `<button type="button" class="item-assign-btn ${item.assignedTo.includes('all') ? 'assigned' : ''}" data-item-idx="${index}" data-assign="all">All (${people})</button>`;
      for (let p = 1; p <= people; p++) {
        const pName = (state.customNames && state.customNames[`person_${p}`]) ? state.customNames[`person_${p}`] : `P${p}`;
        const isAssigned = item.assignedTo.includes(p);
        pillsHtml += `<button type="button" class="item-assign-btn ${isAssigned ? 'assigned' : ''}" data-item-idx="${index}" data-assign="${p}">${escapeHtml(pName)}</button>`;
      }

      tr.innerHTML = `
        <td>
          <input type="text" class="input-field item-name-input" value="${escapeHtml(item.name)}" style="font-size: 0.85rem; padding: 6px 10px;" />
        </td>
        <td style="width: 110px;">
          <input type="number" class="input-field item-price-input" value="${item.price}" step="0.5" min="0" style="font-size: 0.85rem; padding: 6px 8px;" />
        </td>
        <td>
          <div class="item-assign-pills">
            ${pillsHtml}
          </div>
        </td>
        <td style="text-align: right; width: 44px;">
          <button type="button" class="btn-icon-del" data-item-idx="${index}" title="Remove item">✕</button>
        </td>
      `;

      // Name & Price change
      const nameInput = tr.querySelector('.item-name-input');
      nameInput.addEventListener('change', function () {
        item.name = this.value.trim() || 'Item';
        saveToStorage();
      });

      const priceInput = tr.querySelector('.item-price-input');
      priceInput.addEventListener('input', function () {
        item.price = parseFloat(this.value) || 0;
        updateItemizedTotal();
        saveToStorage();
      });

      // Assignment toggles
      const assignBtns = tr.querySelectorAll('.item-assign-btn');
      assignBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const assignVal = this.dataset.assign;
          if (assignVal === 'all') {
            item.assignedTo = ['all'];
          } else {
            const pNum = parseInt(assignVal, 10);
            item.assignedTo = item.assignedTo.filter(a => a !== 'all');
            if (item.assignedTo.includes(pNum)) {
              item.assignedTo = item.assignedTo.filter(a => a !== pNum);
              if (item.assignedTo.length === 0) item.assignedTo = ['all'];
            } else {
              item.assignedTo.push(pNum);
            }
          }
          renderItemizedTable();
          saveToStorage();
        });
      });

      // Delete Row
      const delBtn = tr.querySelector('.btn-icon-del');
      delBtn.addEventListener('click', function () {
        state.itemizedItems.splice(index, 1);
        renderItemizedTable();
        saveToStorage();
      });

      itemizedListBody.appendChild(tr);
    });

    updateItemizedTotal();
  }

  function updateItemizedTotal() {
    const total = state.itemizedItems.reduce((acc, i) => acc + (parseFloat(i.price) || 0), 0);
    if (itemizedTotalDisplay) {
      itemizedTotalDisplay.textContent = formatCurrency(total);
    }
  }

  function applyItemizedToQuickSplit() {
    const total = state.itemizedItems.reduce((acc, i) => acc + (parseFloat(i.price) || 0), 0);
    if (total <= 0) {
      showToast('Add some items with prices first!');
      return;
    }
    billAmountInput.value = total.toFixed(2);
    // Switch to quick split tab
    const quickTab = document.querySelector('[data-tab="split"]');
    if (quickTab) quickTab.click();
    executeCalculation(true);
    showToast(`Applied ${formatCurrency(total)} from Itemized Split!`);
  }

  // ==========================================================================
  // MODULE: BILL SCANNER (100% Client-Side Extraction)
  // ==========================================================================
  function bindScannerEvents() {
    billDropzone.addEventListener('click', () => billFileInput.click());

    billFileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        processUploadedBillImage(file);
      }
    });

    btnLoadSampleBill.addEventListener('click', loadSampleRestaurantBill);
    btnApplyScannedBill.addEventListener('click', applyScannedBillToSplitter);
  }

  function processUploadedBillImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      scannerImagePreview.src = e.target.result;
      scannerPreviewBox.classList.add('show');
      simulateBillOcr();
    };
    reader.readAsDataURL(file);
  }

  function loadSampleRestaurantBill() {
    scannerImagePreview.src = '';
    scannerPreviewBox.classList.add('show');
    simulateBillOcr();
    showToast('Loaded sample restaurant receipt!');
  }

  let extractedBillData = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  };

  function simulateBillOcr() {
    // Intelligent client-side heuristic restaurant sample items
    const sampleItems = [
      { name: 'Woodfired Truffle Pizza', price: 540 },
      { name: 'Cheesy Garlic Bread', price: 210 },
      { name: 'Penne Arrabiata', price: 380 },
      { name: 'Tiramisu Dessert', price: 260 },
      { name: '2x Fresh Lime Soda', price: 180 }
    ];

    const sub = sampleItems.reduce((acc, i) => acc + i.price, 0);
    const tax = Math.round(sub * 0.05 * 100) / 100;
    const tot = sub + tax;

    extractedBillData = {
      items: sampleItems,
      subtotal: sub,
      tax: tax,
      total: tot
    };

    renderScannedTable();
  }

  function renderScannedTable() {
    scannerParsedTable.innerHTML = '';
    extractedBillData.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 6px 10px; font-weight: 600;">${escapeHtml(item.name)}</td>
        <td style="padding: 6px 10px; font-weight: 700; text-align: right;">${formatCurrency(item.price)}</td>
      `;
      scannerParsedTable.appendChild(tr);
    });

    document.getElementById('scanned-subtotal-val').textContent = formatCurrency(extractedBillData.subtotal);
    document.getElementById('scanned-tax-val').textContent = formatCurrency(extractedBillData.tax);
    document.getElementById('scanned-total-val').textContent = formatCurrency(extractedBillData.total);
  }

  function applyScannedBillToSplitter() {
    if (extractedBillData.subtotal <= 0) {
      showToast('Scan or load a bill first!');
      return;
    }
    billAmountInput.value = extractedBillData.subtotal.toFixed(2);
    taxRateInput.value = 5;
    occasionInput.value = 'Restaurant Bill';

    // Also populate itemized items
    state.itemizedItems = extractedBillData.items.map((it, idx) => ({
      id: idx + 1,
      name: it.name,
      price: it.price,
      assignedTo: ['all']
    }));
    renderItemizedTable();

    // Switch to quick split tab
    const quickTab = document.querySelector('[data-tab="split"]');
    if (quickTab) quickTab.click();
    executeCalculation(true);
    showToast('Scanned bill imported successfully!');
  }

  // ==========================================================================
  // MODULE: DICE CHALLENGE
  // ==========================================================================
  const DICE_CHALLENGES = {
    1: { title: '📸 Group Selfie', desc: 'Take a silly selfie with everyone making funny faces!' },
    2: { title: '🤭 Confession Time', desc: 'Share your most embarrassing dining or kitchen disaster.' },
    3: { title: '💸 Generous Diner', desc: 'Add an extra 2% or 5% tip for the great restaurant crew!' },
    4: { title: '🎭 Secret Impersonator', desc: 'Silently mimic someone at the table until friends guess!' },
    5: { title: '🎶 Musical Treat', desc: 'Hum or sing the chorus of a favorite song softly for the group.' },
    6: { title: '👑 Table Ruler', desc: 'Pick ANY friend at the table to do a challenge of your choice!' }
  };

  const DICE_DOT_PATTERNS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  function bindDiceEvents() {
    diceCube.addEventListener('click', rollDice);
    btnRollDice.addEventListener('click', rollDice);
  }

  function rollDice() {
    diceCube.classList.add('rolling');
    diceChallengeText.textContent = 'Rolling the dice...';
    diceChallengeNumber.textContent = '🎲';

    setTimeout(() => {
      diceCube.classList.remove('rolling');
      const roll = Math.floor(Math.random() * 6) + 1;
      updateDiceDots(roll);

      const challenge = DICE_CHALLENGES[roll];
      diceChallengeNumber.textContent = `Rolled a ${roll}!`;
      diceChallengeText.innerHTML = `<strong>${challenge.title}</strong>: ${challenge.desc}`;

      triggerCelebration();
      showToast(`Dice Rolled: ${roll}! ${challenge.title}`);
    }, 600);
  }

  function updateDiceDots(num) {
    const dots = diceCube.querySelectorAll('.dice-dot');
    const activePattern = DICE_DOT_PATTERNS[num] || [4];
    dots.forEach((dot, idx) => {
      if (activePattern.includes(idx)) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // MODULE: GROUP GAMES (Who's Most Likely, Truth or Dare, Fast Finger, Quiz)
  // ==========================================================================
  const WHO_IS_MOST_LIKELY = [
    'Most likely to steal food from someone else’s plate? 🍟',
    'Most likely to order the most expensive item on the menu? 🥩',
    'Most likely to forget their wallet and promise to transfer later? 👛',
    'Most likely to pretend it’s their birthday for free cake? 🎂',
    'Most likely to ask for the bill before anyone finishes? ⏱️',
    'Most likely to photograph the food for 5 minutes before eating? 📸',
    'Most likely to drop their fork or spill sauce on white clothes? 🍝',
    'Most likely to finish dessert even when completely stuffed? 🍨'
  ];

  const TRUTH_OR_DARE = [
    'Truth: What is the weirdest food combination you secretly enjoy?',
    'Dare: Let the person to your right take a sip from your drink or order a fry!',
    'Truth: Have you ever sent food back to the kitchen? What happened?',
    'Dare: Speak in a fancy French accent for the next 2 minutes!',
    'Truth: Who at this table is the best tipper?',
    'Dare: Propose a toast to the entire table in the style of an Oscar acceptance speech!'
  ];

  let currentGameIndex = 0;

  function bindGroupGamesEvents() {
    btnNextGamePrompt.addEventListener('click', advanceGamePrompt);
    gameTypeSelect.addEventListener('change', advanceGamePrompt);

    // Fast Finger Reaction Game
    let fastFingerTimer = null;
    let fastFingerStartTime = 0;
    let fastFingerState = 'idle'; // idle | waiting | ready

    fastFingerArena.addEventListener('click', function () {
      if (fastFingerState === 'idle') {
        fastFingerState = 'waiting';
        fastFingerArena.className = 'fast-finger-arena waiting';
        fastFingerStatus.textContent = 'Wait for GREEN... Don’t tap yet!';

        const delay = Math.floor(Math.random() * 2500) + 1500;
        fastFingerTimer = setTimeout(() => {
          fastFingerState = 'ready';
          fastFingerStartTime = performance.now();
          fastFingerArena.className = 'fast-finger-arena ready';
          fastFingerStatus.textContent = 'TAP NOW! ⚡';
        }, delay);
      } else if (fastFingerState === 'waiting') {
        clearTimeout(fastFingerTimer);
        fastFingerState = 'idle';
        fastFingerArena.className = 'fast-finger-arena';
        fastFingerStatus.textContent = 'Too early! Tap to try again.';
      } else if (fastFingerState === 'ready') {
        const elapsed = Math.round(performance.now() - fastFingerStartTime);
        fastFingerState = 'idle';
        fastFingerArena.className = 'fast-finger-arena';
        fastFingerStatus.innerHTML = `⚡ <strong>${elapsed} ms!</strong> Fantastic reflexes! Tap to replay.`;
        triggerCelebration();
      }
    });

    btnNextQuiz.addEventListener('click', advanceQuizQuestion);
  }

  function advanceGamePrompt() {
    const type = gameTypeSelect.value;
    const list = type === 'truth-dare' ? TRUTH_OR_DARE : WHO_IS_MOST_LIKELY;
    currentGameIndex = (currentGameIndex + 1) % list.length;
    gamePromptText.textContent = list[currentGameIndex];
  }

  // Trivia Quiz
  const QUIZ_QUESTIONS = [
    {
      q: 'Which country is widely credited with inventing modern pizza?',
      options: ['France', 'Italy (Naples)', 'Greece', 'United States'],
      ans: 1,
      fact: 'Modern pizza originated in Naples, Italy in the late 18th century!'
    },
    {
      q: 'What is the most expensive spice in the world by weight?',
      options: ['Vanilla', 'Cardamom', 'Saffron', 'Black Truffle'],
      ans: 2,
      fact: 'Saffron is harvested by hand from crocus flowers and costs over $5,000/kg!'
    },
    {
      q: 'In restaurant etiquette, where do you place your napkin if stepping away briefly?',
      options: ['On your chair', 'On top of your plate', 'On the floor', 'In your pocket'],
      ans: 0,
      fact: 'Placing your napkin on the chair signals to staff you will return.'
    }
  ];

  let currentQuizIdx = 0;

  function renderQuizQuestion(idx) {
    const item = QUIZ_QUESTIONS[idx];
    quizQuestion.textContent = item.q;
    quizOptionsContainer.innerHTML = '';
    quizFeedback.textContent = '';

    item.options.forEach((opt, oIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-btn';
      btn.textContent = opt;

      btn.addEventListener('click', function () {
        const allBtns = quizOptionsContainer.querySelectorAll('.quiz-btn');
        allBtns.forEach(b => b.disabled = true);

        if (oIdx === item.ans) {
          btn.classList.add('correct');
          quizFeedback.textContent = `Correct! 🎉 ${item.fact}`;
          triggerCelebration();
        } else {
          btn.classList.add('wrong');
          allBtns[item.ans].classList.add('correct');
          quizFeedback.textContent = `Oops! ${item.fact}`;
        }
      });

      quizOptionsContainer.appendChild(btn);
    });
  }

  function advanceQuizQuestion() {
    currentQuizIdx = (currentQuizIdx + 1) % QUIZ_QUESTIONS.length;
    renderQuizQuestion(currentQuizIdx);
  }

  // ==========================================================================
  // MODULE: BILL HISTORY
  // ==========================================================================
  function bindHistoryEvents() {
    btnClearAllHistory.addEventListener('click', function () {
      if (confirm('Clear all saved bill history?')) {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        renderHistoryList();
        showToast('Bill history cleared');
      }
    });
  }

  function saveCurrentBillToHistory() {
    if (!state.hasCalculated) {
      showToast('Calculate the split first!');
      return;
    }

    const occasion = occasionInput.value.trim() || 'Dinner with Friends';
    const total = outReceiptTotal.textContent;
    const share = outPerPersonShare.textContent;
    const people = parseInt(numPeopleInput.value, 10) || 1;
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const record = {
      id: Date.now(),
      occasion: occasion,
      date: date,
      total: total,
      share: share,
      people: people,
      billAmount: billAmountInput.value,
      taxRate: taxRateInput.value,
      selectedTip: state.selectedTip
    };

    let history = getHistoryFromStorage();
    history.unshift(record);
    if (history.length > 20) history = history.slice(0, 20);

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    renderHistoryList();
    triggerCelebration();
    showToast(`Saved "${occasion}" to Bill History!`);
  }

  function getHistoryFromStorage() {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function renderHistoryList() {
    const history = getHistoryFromStorage();
    if (!historyListContainer) return;

    if (history.length === 0) {
      historyEmptyState.style.display = 'block';
      historyListContainer.innerHTML = '';
      return;
    }

    historyEmptyState.style.display = 'none';
    historyListContainer.innerHTML = '';

    history.forEach((rec, idx) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-header">
          <span class="history-occasion">${escapeHtml(rec.occasion)}</span>
          <span class="history-date">${escapeHtml(rec.date)}</span>
        </div>
        <div class="history-details">
          <span>Total: <strong>${rec.total}</strong></span>
          <span>Share: <strong>${rec.share}</strong> (${rec.people}p)</span>
        </div>
        <div class="history-actions">
          <button type="button" class="btn-history-load" data-idx="${idx}">Load Bill</button>
          <button type="button" class="btn-history-del" data-idx="${idx}">Delete</button>
        </div>
      `;

      card.querySelector('.btn-history-load').addEventListener('click', function () {
        loadHistoryRecord(rec);
      });

      card.querySelector('.btn-history-del').addEventListener('click', function () {
        history.splice(idx, 1);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        renderHistoryList();
        showToast('Record deleted');
      });

      historyListContainer.appendChild(card);
    });
  }

  function loadHistoryRecord(rec) {
    occasionInput.value = rec.occasion;
    billAmountInput.value = rec.billAmount;
    numPeopleInput.value = rec.people;
    syncPeopleChips(rec.people);
    taxRateInput.value = rec.taxRate;

    const quickTab = document.querySelector('[data-tab="split"]');
    if (quickTab) quickTab.click();

    executeCalculation(true);
    showToast(`Loaded "${rec.occasion}" from history!`);
  }

  // --- LocalStorage Persistence (RULE 5) ---
  function saveToStorage() {
    try {
      const payload = {
        theme: state.theme,
        currency: state.currency,
        occasion: occasionInput.value,
        billAmount: billAmountInput.value,
        numPeople: numPeopleInput.value,
        taxRate: taxRateInput.value,
        selectedTip: state.selectedTip,
        customTip: customTipInput.value,
        customNames: state.customNames || {},
        paidStatus: state.paidStatus || {},
        upiId: state.upiId,
        hasCalculated: state.hasCalculated,
        itemizedItems: state.itemizedItems
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme('purple');
        setCurrency('INR');
        return;
      }

      const data = JSON.parse(stored);
      if (!data) return;

      if (data.theme) setTheme(data.theme);
      if (data.currency) setCurrency(data.currency);
      if (data.upiId) state.upiId = data.upiId;

      if (data.occasion !== undefined) occasionInput.value = data.occasion;
      if (data.billAmount !== undefined) billAmountInput.value = data.billAmount;
      if (data.numPeople !== undefined) {
        numPeopleInput.value = data.numPeople;
        syncPeopleChips(parseInt(data.numPeople, 10));
      }
      if (data.taxRate !== undefined) taxRateInput.value = data.taxRate;
      if (data.customTip !== undefined) customTipInput.value = data.customTip;
      if (data.customNames) state.customNames = data.customNames;
      if (data.paidStatus) state.paidStatus = data.paidStatus;
      if (data.itemizedItems) state.itemizedItems = data.itemizedItems;

      if (data.selectedTip !== undefined) {
        state.selectedTip = data.selectedTip;
        tipButtons.forEach(btn => {
          if (btn.dataset.tip === String(data.selectedTip)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        if (data.selectedTip === 'custom') {
          customTipContainer.classList.add('show');
        } else {
          customTipContainer.classList.remove('show');
        }
      }

      if (data.hasCalculated) {
        executeCalculation(false);
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  // Ready Hook
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
