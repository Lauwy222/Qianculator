// DOM Elements
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const hourlyRateInput = document.getElementById('hourlyRate');
const bonusSlider = document.getElementById('bonus');
const bonusInput = document.getElementById('bonusInput');
const calculateBtn = document.getElementById('calculateBtn');
const shareBtn = document.getElementById('shareBtn');
const emptyState = document.getElementById('emptyState');
const resultsContainer = document.getElementById('resultsContainer');
const dateResult = document.getElementById('dateResult');
const startResult = document.getElementById('startResult');
const endResult = document.getElementById('endResult');
const hoursResult = document.getElementById('hoursResult');
const rateResult = document.getElementById('rateResult');
const bonusLabelResult = document.getElementById('bonusLabelResult');
const totalResult = document.getElementById('totalResult');
const startTimeError = document.getElementById('startTimeError');
const endTimeError = document.getElementById('endTimeError');

// Store current calculation data for sharing
let currentCalculationData = null;

// Store original share button HTML
const originalShareBtnHTML = shareBtn.innerHTML;

// Sync bonus slider and input
bonusSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value, 10);
    bonusInput.value = value;
});

bonusInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value, 10);
    const min = parseInt(bonusSlider.min, 10);
    const max = parseInt(bonusSlider.max, 10);
    
    if (isNaN(value)) return;
    value = Math.max(min, Math.min(max, value));
    
    bonusSlider.value = value;
    e.target.value = value;
});

bonusInput.addEventListener('blur', (e) => {
    let value = parseInt(e.target.value, 10);
    const min = parseInt(bonusSlider.min, 10);
    const max = parseInt(bonusSlider.max, 10);
    
    if (isNaN(value) || value < min) value = min;
    else if (value > max) value = max;
    
    bonusSlider.value = value;
    e.target.value = value;
});

// Calculate button handler
calculateBtn.addEventListener('click', handleCalculate);

// Share button handler
shareBtn.addEventListener('click', handleShare);

// Allow Enter key to trigger calculation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleCalculate();
    }
});

function clearErrors() {
    startTimeError.textContent = '';
    endTimeError.textContent = '';
    startTimeInput.style.borderColor = '#ffe0ec';
    endTimeInput.style.borderColor = '#ffe0ec';
}

function showError(inputElement, errorElement, message) {
    errorElement.textContent = message;
    inputElement.style.borderColor = '#ff6b9d';
}

function calculateHours(startTime, endTime) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    let hours = (end - start) / (1000 * 60 * 60);
    
    // If end time is earlier than start time, assume it's the next day
    if (hours < 0) {
        hours += 24;
    }
    
    return hours;
}

function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatHours(hours) {
    return hours.toFixed(2);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

function createShareText(data) {
    let text = `Qianculator Wage Calculation\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Date: ${data.date}\n`;
    text += `Start: ${data.startTime}\n`;
    text += `End: ${data.endTime}\n`;
    text += `Worked Hours: ${data.hours}\n`;
    text += `Hourly Rate: ${data.hourlyRate}\n`;
    text += `Bonus: ${data.bonusLabel}\n`;
    text += `\nTotal Pay Out: ${data.totalPay}\n`;
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━`;
    return text;
}

async function handleShare() {
    if (!currentCalculationData) return;

    const shareText = createShareText(currentCalculationData);

    // Try to use Web Share API if available
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Qianculator - Wage Calculation',
                text: shareText
            });
            // Show feedback
            shareBtn.innerHTML = '<span class="share-icon">✓</span><span class="share-text">Shared!</span>';
            shareBtn.style.background = 'linear-gradient(135deg, #6bff9d 0%, #8fff8f 100%)';
            
            setTimeout(() => {
                shareBtn.innerHTML = originalShareBtnHTML;
                shareBtn.style.background = '';
            }, 2000);
        } catch (err) {
            // User cancelled or error occurred, fall back to clipboard
            copyToClipboard(shareText);
        }
    } else {
        // Fall back to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        shareBtn.innerHTML = '<span class="share-icon">✓</span><span class="share-text">Copied!</span>';
        shareBtn.style.background = 'linear-gradient(135deg, #6bff9d 0%, #8fff8f 100%)';
        
        setTimeout(() => {
            shareBtn.innerHTML = originalShareBtnHTML;
            shareBtn.style.background = '';
        }, 2000);
    }).catch(() => {
        // Fallback: show text in prompt
        prompt('Copy this text to share:', text);
    });
}

function handleCalculate() {
    clearErrors();
    
    // Validate inputs
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    if (!startTime) {
        showError(startTimeInput, startTimeError, 'Please enter a start time');
        return;
    }
    
    if (!endTime) {
        showError(endTimeInput, endTimeError, 'Please enter an end time');
        return;
    }
    
    // Get values
    const hourlyRate = parseFloat(hourlyRateInput.value) || 15;
    const bonusPercent = parseInt(bonusInput.value, 10) || 100;
    
    // Calculate hours
    const hours = calculateHours(startTime, endTime);
    
    // Calculate base salary
    const basePay = hours * hourlyRate;
    
    // Calculate total pay (with bonus if applicable)
    let totalPay = basePay;
    let bonusLabel = 'None';
    
    if (bonusPercent !== 100) {
        const bonusMultiplier = bonusPercent / 100;
        totalPay = basePay * bonusMultiplier;
        bonusLabel = `${bonusPercent}%`;
    }
    
    // Get current date
    const currentDate = new Date();
    
    // Display results
    dateResult.textContent = formatDate(currentDate);
    startResult.textContent = formatTime(startTime);
    endResult.textContent = formatTime(endTime);
    hoursResult.textContent = `${formatHours(hours)} hours`;
    rateResult.textContent = formatCurrency(hourlyRate);
    bonusLabelResult.textContent = bonusLabel;
    totalResult.textContent = formatCurrency(totalPay);
    
    // Store calculation data for sharing
    currentCalculationData = {
        date: formatDate(currentDate),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        hours: `${formatHours(hours)} hours`,
        hourlyRate: formatCurrency(hourlyRate),
        bonusLabel: bonusLabel,
        totalPay: formatCurrency(totalPay)
    };
    
    // Show results panel
    emptyState.style.display = 'none';
    resultsContainer.style.display = 'flex';
}

