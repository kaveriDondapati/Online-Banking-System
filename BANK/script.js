// User database (stored in memory during session)
let currentUser=localStorage.getItem('currentUser')||null;
let authToken= localStorage.getItem('authToken')||null;
let userName= localStorage.getItem('userName')||null;
const API_BASE = 'https://online-banking-system-gfwy.onrender.com/api';

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
            showMessage('signupSuccess', 'Account created! Account number: ' + data.accountNumber + '. Redirecting to login...');
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
            localStorage.setItem("token",data.token);
            authToken = data.token;
            currentUser = data.userName;
            //userName = data.name;
            await showDashboard(data.userName,data.accountNumber);
            //document.getElementById('accountNumber').textContent = accountNumber;
            document.getElementById('loginForm').reset();
        } else {
            showMessage('loginError', data.error || 'Invalid username or password! Please try again.');
        }
    } catch (err) {
        showMessage('loginError', 'Could not reach the server. Please make sure the backend is running.');
    }
});

// Show Dashboard after successful login
async function showDashboard(userName,accountNumber) {

    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('signupSection').classList.remove('active');
    document.querySelector('.dashboard').classList.add('active');


    localStorage.setItem('currentUser', userName);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userName', userName);

    // Update welcome message with user's name
    document.getElementById('welcomeMessage').textContent = 'Welcome, ' + userName + '! 👋';
    document.getElementById('accountNumber').textContent = accountNumber;

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
        document.getElementById('balanceAmount').textContent = '₹' + data.balance.toFixed(2);
        document.getElementById("accountNumber").textContent =
            data.accountNumber;
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

        if (transactions.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions yet</p>';
            return;
        }

        list.innerHTML = '';
        // Show transactions in reverse order (newest first)
        transactions.slice().reverse().forEach(function(t) {
            const item = document.createElement('div');
            item.className = 'transaction-item';

            const info = document.createElement('div');
            info.className = 'transaction-info';
            info.innerHTML = '<h4>' + t.type + '</h4><p>' + t.date + '</p>';

            const amount = document.createElement('div');
            amount.className = 'transaction-amount ' + (t.type === 'Deposit' || t.type === 'Received' ? 'credit' : 'debit');
            amount.textContent = (t.type === 'Deposit' || t.type === 'Received' ? '+' : '-') + '₹' + t.amount.toFixed(2);

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
        const otherUsers=await res.json();
        console.log("Users:",otherUsers);

        const select = document.getElementById('recipientAccount');
        select.innerHTML = '<option value="">Select account</option>';

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
            const message = await res.text();
            console.log(message);
            showMessage('depositError', message);
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
    element.classList.remove('active');
}

// Logout Function
function logout() {
    currentUser = null;
    authToken = null;
    userName = null;
    localStorage.clear();
    document.querySelector('.dashboard').classList.remove('active');
    document.getElementById('signupSection').classList.add('active');
    document.getElementById('loginSection').classList.add('active');
    document.getElementById('loginForm').reset();
    hideMessage('loginError');
}
// Add at the end of your JavaScript file
window.addEventListener('DOMContentLoaded', async function() {
    if (authToken && currentUser) {
        try {
            const res = await fetch(`${API_BASE}/account`, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            if (res.ok) {
                // Token is still valid, restore dashboard
                await showDashboard(userName, document.getElementById('accountNumber')?.textContent || '');
            } else {
                // Token expired, clear and show login
                logout();
            }
        } catch (err) {
            logout();
        }
    }
});