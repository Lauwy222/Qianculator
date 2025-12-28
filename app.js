// DOM Elements
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const hourlyRateInput = document.getElementById('hourlyRate');
const bonusSlider = document.getElementById('bonus');
const bonusInput = document.getElementById('bonusInput');
const calculateBtn = document.getElementById('calculateBtn');
const emptyState = document.getElementById('emptyState');
const resultsContainer = document.getElementById('resultsContainer');
const hoursResult = document.getElementById('hoursResult');
const salaryResult = document.getElementById('salaryResult');
const bonusResultCard = document.getElementById('bonusResultCard');
const bonusSalaryResult = document.getElementById('bonusSalaryResult');
const startTimeError = document.getElementById('startTimeError');
const endTimeError = document.getElementById('endTimeError');

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
    
    // Display results
    hoursResult.textContent = `${formatHours(hours)} hours`;
    salaryResult.textContent = formatCurrency(basePay);
    
    // Show bonus result only if bonus is not 100%
    if (bonusPercent !== 100) {
        const bonusMultiplier = bonusPercent / 100;
        const payWithBonus = basePay * bonusMultiplier;
        
        bonusSalaryResult.textContent = formatCurrency(payWithBonus);
        bonusResultCard.style.display = 'block';
    } else {
        bonusResultCard.style.display = 'none';
    }
    
    // Show results panel
    emptyState.style.display = 'none';
    resultsContainer.style.display = 'flex';
}

