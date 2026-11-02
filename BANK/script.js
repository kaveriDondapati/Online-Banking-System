// User database (stored in memory during session)
let currentUser=localStorage.getItem('currentUser')||null;
let authToken= localStorage.getItem('authToken')||null;
let userName= localStorage.getItem('userName')||null;
const API_BASE = 'https://online-banking-system-67bt.onrender.com/api';

// Toggle between Login and Signup forms
function showSignup() {
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('signupSection').classList.add('active');
}

function showLogin() {
    document.getElementById('signupSection').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
}

// Password Strength Validator
function validatePasswordStrength(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    //const initialDeposit = parseFloat(document.getElementById('initialDeposit').value) || 0;

    hideMessage('signupError');
    hideMessage('signupSuccess');

    // Validation
    if (username.length < 3) {
        showMessage('signupError', 'Username must be at least 3 characters long.');
        return;
    }

    if (password.length < 8) {
        showMessage('signupError', 'Password must be at least 8 characters long.');
        return;
    }

    if (!validatePasswordStrength(password)) {
        showMessage('signupError', 'Password must contain: uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*()-_=+[]{};:\'"|,.<>/?\\)');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('signupError', 'Passwords do not match.');
        return;
    }

    const submitBtn = document.querySelector('#signupForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: username,
                password: password,
                //initialDeposit: initialDeposit
                confirmPassword:confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('signupSuccess', 'Account created! Account number: ' + (data.accountNumber || '') + '. Redirecting to login...');
            document.getElementById('signupForm').reset();
            setTimeout(function() {
                showLogin();
                hideMessage('signupSuccess');
            }, 2500);
        } else {
            showMessage('signupError', data.error || 'Registration failed. Please try again.');
        }
    } catch (err) {
        showMessage('signupError', 'Could not reach the server. Please make sure the backend is running.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
});


// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    hideMessage('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userName:username, password:password})
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            authToken = data.token;
            currentUser = data.userName;
            userName = data.userName;
            await showDashboard(data.userName, data.accountNumber);
            //document.getElementById('accountNumber').textContent = accountNumber;
            document.getElementById('loginForm').reset();
        } else {
            showMessage('loginError', data.error || 'Invalid username or password! Please try again.');
        }
    } catch (err) {
        showMessage('loginError', 'Could not reach the server. Please make sure the backend is running.');
    }
});

function pageUrl(page) {
    return window.location.pathname + window.location.search + (page === 'dashboard' ? '#dashboard' : '#login');
}

function showLoginPage() {
    ['depositModal', 'withdrawModal', 'transferModal'].forEach(function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
        }
    });
    document.querySelector('.dashboard').classList.remove('active');
    document.getElementById('signupSection').classList.remove('active');
    document.getElementById('loginSection').classList.add('active');
    document.getElementById('loginForm').reset();
    hideMessage('loginError');
}

function lockBackButtonToLogin() {
    history.replaceState({ page: 'login' }, '', pageUrl('login'));
    history.pushState({ page: 'dashboard' }, '', pageUrl('dashboard'));
}

// Show Dashboard after successful login
async function showDashboard(userName, accountNumber) {
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('signupSection').classList.remove('active');
    document.querySelector('.dashboard').classList.add('active');

    localStorage.setItem('currentUser', userName);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userName', userName);

    document.getElementById('welcomeMessage').textContent = 'Welcome, ' + userName + '! 👋';
    document.getElementById('accountNumber').textContent = accountNumber;

    lockBackButtonToLogin();

    await updateBalance();
    await updateTransactions();
    await updateTransferOptions();
}

// Update Balance Display
async function updateBalance() {
    try {
        const res = await fetch(`${API_BASE}/account`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const data = await res.json();
        const balance = Number(data.balance || 0);
        document.getElementById('balanceAmount').textContent = '₹' + balance.toFixed(2);
        if (data.accountNumber) {
            document.getElementById('accountNumber').textContent = data.accountNumber;
        }
    } catch (err) {
        console.error('Error updating balance:', err);
    }
}

// Update Transaction List
async function updateTransactions() {
    try {
        const res = await fetch(`${API_BASE}/transactions`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const transactions = await res.json();
        const list = document.getElementById('transactionsList');

        if (!Array.isArray(transactions) || transactions.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions yet</p>';
            return;
        }

        list.innerHTML = '';
        transactions.forEach(function(t) {
            const item = document.createElement('div');
            item.className = 'transaction-item';

            const type = (t.type || '').trim();
            const dateValue = t.createdAt || t.date || '';
            const amountValue = Number(t.amount);

            const info = document.createElement('div');
            info.className = 'transaction-info';
            const party = t.counterpartyName && t.counterpartyName !== 'self' ? ' · ' + t.counterpartyName : '';
            info.innerHTML = '<h4>' + type + party + '</h4><p>' + formatDate(dateValue) + '</p>';

            const amount = document.createElement('div');
            const isCredit = type === 'Deposit' || type === 'Received';
            amount.className = 'transaction-amount ' + (isCredit ? 'credit' : 'debit');
            amount.textContent = (isCredit ? '+' : '-') + '₹' + amountValue.toFixed(2);

            item.appendChild(info);
            item.appendChild(amount);
            list.appendChild(item);
        });
    } catch (err) {
        console.error('Error updating transactions:', err);
    }
}

// Update Transfer Recipient Options
async function updateTransferOptions() {
    console.log("updateTransferOptions called");
    try {
        const res = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });

        console.log("Status:",res.status);
        const otherUsers = await res.json();
        const select = document.getElementById('recipientAccount');
        select.innerHTML = '<option value="">Select account</option>';

        if (!Array.isArray(otherUsers)) {
            return;
        }

        otherUsers.forEach(function(u) {
            const option = document.createElement('option');
            option.value = u.accountNumber;
            option.textContent = `${u.userName}(${u.accountNumber})` ;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error updating transfer options:', err);
    }
}

// Deposit Form Handler
document.getElementById('depositForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);

    if (amount <= 0) {
        showMessage('depositError', 'Please enter a valid amount.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
            body: JSON.stringify({ amount })
        });

        if (res.ok) {
            await updateBalance();
            await updateTransactions();
            showMessage('depositSuccess', '₹' + amount.toFixed(2) + ' deposited successfully!');
            document.getElementById('depositForm').reset();
            setTimeout(function() { closeModal('depositModal'); }, 2000);
        } else {
            const data = await res.json();
            showMessage('depositError', data.error || 'Deposit failed. Please try again.');
        }
    } catch (err) {
        showMessage('depositError', 'Error: ' + err.message);
    }
});

// Withdraw Form Handler
document.getElementById('withdrawForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    hideMessage('withdrawError');

    if (amount <= 0) {
        showMessage('withdrawError', 'Please enter a valid amount.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
            body: JSON.stringify({ amount })
        });

        if (res.ok) {
            await updateBalance();
            await updateTransactions();
            showMessage('withdrawSuccess', '₹' + amount.toFixed(2) + ' withdrawn successfully!');
            document.getElementById('withdrawForm').reset();
            setTimeout(function() {
                closeModal('withdrawModal');
            }, 2000);
        } else {
            const data = await res.json();
            showMessage('withdrawError', data.error || 'Withdrawal failed. Please try again.');
        }
    } catch (err) {
        showMessage('withdrawError', 'Could not reach the server. Please try again later.');
    }
});

// Transfer Form Handler
document.getElementById('transferForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const recipientid = document.getElementById('recipientAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    hideMessage('transferError');

    if (!recipientid) {
        showMessage('transferError', 'Please select a recipient account!');
        return;
    }

    if (amount <= 0) {
        showMessage('transferError', 'Please enter a valid amount.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
            body: JSON.stringify({ recipientid: recipientid, amount })
        });

        if (res.ok) {
            await updateBalance();
            await updateTransactions();
            showMessage('transferSuccess', '₹' + amount.toFixed(2) + ' transferred successfully!');
            document.getElementById('transferForm').reset();
            setTimeout(function() {
                closeModal('transferModal');
            }, 2000);
        } else {
            const data = await res.json();
            showMessage('transferError', data.error || 'Transfer failed. Please try again.');
        }
    } catch (err) {
        showMessage('transferError', 'Could not reach the server. Please try again later.');
    }
});

// Open Modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    // Hide all messages when opening modal
    const modal = document.getElementById(modalId);
    const messages = modal.querySelectorAll('.success-msg, .error-msg');
    messages.forEach(function(msg) {
        msg.classList.remove('active');
    });
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Reset forms
    const modal = document.getElementById(modalId);
    const forms = modal.querySelectorAll('form');
    forms.forEach(function(form) {
        form.reset();
    });
    // Hide all messages
    const messages = modal.querySelectorAll('.success-msg, .error-msg');
    messages.forEach(function(msg) {
        msg.classList.remove('active');
    });
}

function formatDate(value) {
    if (!value) {
        return '';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }
    return parsed.toLocaleString();
}

// Show Message
function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Element not found:", elementId);
        return;
    }
    element.textContent = message;
    element.classList.add('active');
}

// Hide Message
function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('active');
    }
}

function logout(options) {
    options = options || {};
    currentUser = null;
    authToken = null;
    userName = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    showLoginPage();
    if (!options.fromHistory) {
        history.replaceState({ page: 'login' }, '', pageUrl('login'));
    }
}

function leaveDashboardForLogin() {
    if (!document.querySelector('.dashboard').classList.contains('active')) {
        return;
    }
    logout({ fromHistory: true });
    history.replaceState({ page: 'login' }, '', pageUrl('login'));
}

window.addEventListener('popstate', function() {
    leaveDashboardForLogin();
});

window.addEventListener('hashchange', function() {
    if (window.location.hash !== '#dashboard') {
        leaveDashboardForLogin();
    }
});

window.addEventListener('DOMContentLoaded', async function() {
    history.replaceState({ page: 'login' }, '', pageUrl('login'));

    if (authToken && currentUser) {
        try {
            const res = await fetch(`${API_BASE}/account`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            if (res.ok) {
                await showDashboard(userName, document.getElementById('accountNumber')?.textContent || '');
            } else {
                logout();
            }
        } catch (err) {
            logout();
        }
    }
});