let balance = parseFloat(localStorage.getItem("balance")) || 0;
let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];
let editIndex = -1;
let deleteIndex = -1;

document.addEventListener("DOMContentLoaded", function () {
    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    // Event listeners for filtering
    document.getElementById("incomeTransactionDisplay").addEventListener("change", filterTransactions);
    document.getElementById("expensesTransactionDisplay").addEventListener("change", filterTransactions);

    // Start logout timer
    startLogoutTimer();

    // Prompt for password change if using default
    if (localStorage.getItem("mustChangePassword") === "true") {
        alert("You are required to change your password before continuing.");
    }
});

function addTransaction() {
    const transactionType = document.getElementById("transactionType").value;
    const amount = parseFloat(document.getElementById("transactionAmount").value);
    const description = document.getElementById("transactionDescription").value;

    if (isNaN(amount) || amount <= 0 || transactionType === 'Income / Expenses' || description.trim() === '') {
        alert("Please enter a valid transaction.");
        return;
    }

    const transaction = {
        type: transactionType,
        amount: amount,
        description: description,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        balance: 0
    };

    balance += (transactionType === 'income' ? amount : -amount);
    transaction.balance = balance;

    transactionHistory.push(transaction);
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
    localStorage.setItem("balance", balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    document.getElementById("transactionAmount").value = '';
    document.getElementById("transactionType").value = 'Income / Expenses';
    document.getElementById("transactionDescription").value = '';
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById("yourBalance");
    balanceElement.innerHTML = `<span>₹ </span>${balance.toFixed(2)}`;
    balanceElement.style.color = balance >= 0 ? 'green' : 'red';

    document.getElementById("totalIncome").innerHTML = `<span>₹ </span>${getTotalAmount('income').toFixed(2)}`;
    document.getElementById("totalExpenses").innerHTML = `<span>₹ </span>${getTotalAmount('expenses').toFixed(2)}`;
}

function getTotalAmount(type) {
    return transactionHistory
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
}

function populateHistoryTable() {
    const tableBody = document.getElementById("historyTableBody");
    tableBody.innerHTML = '';

    const showIncome = document.getElementById("incomeTransactionDisplay").checked;
    const showExpenses = document.getElementById("expensesTransactionDisplay").checked;

    let filtered = transactionHistory.filter(t =>
        (t.type === 'income' && showIncome) ||
        (t.type === 'expenses' && showExpenses)
    );

    filtered.forEach((t, i) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = t.type === "income" ? "lightgreen" : "lightcoral";
        row.innerHTML = `
            <th scope="row">${i + 1}</th>
            <td>${t.date}</td>
            <td>${t.type}</td>
            <td>₹ ${t.amount.toFixed(2)}</td>
            <td>₹ ${t.balance.toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditTransactionModal(${i})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${i})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function populateDescriptionTable() {
    const tableBody = document.getElementById("tableDiscrption");
    tableBody.innerHTML = '';

    transactionHistory.forEach((t, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<th scope="row">${i + 1}</th><td>${t.description}</td>`;
        tableBody.appendChild(row);
    });
}

function filterTransactions() {
    populateHistoryTable();
}

function openEditTransactionModal(index) {
    editIndex = index;
    const t = transactionHistory[index];

    document.getElementById("editTransactionType").value = t.type;
    document.getElementById("editTransactionAmount").value = t.amount;
    document.getElementById("editTransactionDescription").value = t.description;


    new bootstrap.Modal(document.getElementById("editTransactionModal")).show();
}

function saveEditTransaction() {
    const type = document.getElementById("editTransactionType").value;
    const amount = parseFloat(document.getElementById("editTransactionAmount").value);
    const description = document.getElementById("editTransactionDescription").value;

    if (isNaN(amount) || amount <= 0 || description.trim() === '') {
        alert("Invalid transaction details.");
        return;
    }

    transactionHistory[editIndex] = { ...transactionHistory[editIndex], type, amount, description };
    recalculateBalance();

    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
    localStorage.setItem("balance", balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    bootstrap.Modal.getInstance(document.getElementById("editTransactionModal")).hide();
}

function recalculateBalance() {
    balance = 0;
    transactionHistory.forEach(t => {
        balance += t.type === 'income' ? t.amount : -t.amount;
        t.balance = balance;
    });
}

function deleteTransaction(index) {
    deleteIndex = index;
    new bootstrap.Modal(document.getElementById("deleteConfirmationModal")).show();
}

function confirmDeleteTransaction() {
    transactionHistory.splice(deleteIndex, 1);
    recalculateBalance();

    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
    localStorage.setItem("balance", balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    bootstrap.Modal.getInstance(document.getElementById("deleteConfirmationModal")).hide();
}

function openClearConfirmationModal() {
    new bootstrap.Modal(document.getElementById("clearConfirmationModal")).show();
}

function clearLocalStorage() {
    localStorage.clear();
    transactionHistory = [];
    balance = 0;

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    bootstrap.Modal.getInstance(document.getElementById("clearConfirmationModal")).hide();
}

function saveAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(12);
    doc.text("Transaction History", 10, y);
    y += 10;

    doc.text("No.", 10, y);
    doc.text("Date", 30, y);
    doc.text("Type", 60, y);
    doc.text("Amount", 90, y);
    doc.text("Balance", 120, y);
    y += 10;

    transactionHistory.forEach((t, i) => {
        doc.text(`${i + 1}`, 10, y);
        doc.text(t.date, 30, y);
        doc.text(t.type, 60, y);
        doc.text(`₹${t.amount.toFixed(2)}`, 90, y);
        doc.text(`₹${t.balance.toFixed(2)}`, 120, y);
        y += 10;
        if (y > 280) { doc.addPage(); y = 10; }
    });

    y += 10;
    doc.text("Descriptions", 10, y); y += 10;

    transactionHistory.forEach((t, i) => {
        doc.text(`${i + 1}`, 10, y);
        doc.text(t.description, 30, y);
        y += 10;
        if (y > 280) { doc.addPage(); y = 10; }
    });

    const now = new Date();
    const fileName = `history_${now.getDate()}_${now.toLocaleString('default', { month: 'long' })}.pdf`;
    doc.save(fileName);
}

function changePassword() {
    const newPassword = document.getElementById("newPassword").value;
    if (newPassword.trim().length < 4) {
        alert("Password must be at least 4 characters.");
        return;
    }
    localStorage.setItem("userPassword", newPassword);
    localStorage.removeItem("mustChangePassword");
    alert("Password updated successfully.");
}

// -------------------------------------
// Auto Logout Timer Setup
// -------------------------------------

let logoutTimer;
let countdown = document.getElementById("countdown");

function startLogoutTimer() {
    clearInterval(logoutTimer);

    if (localStorage.getItem("disableLogout") === "true") {
        countdown.textContent = "∞";
        return;
    }

    const storedDuration = parseInt(localStorage.getItem("logoutDuration"));
    let timeLeft = isNaN(storedDuration) ? 60 : storedDuration;
    countdown.textContent = timeLeft;

    logoutTimer = setInterval(() => {
        timeLeft--;
        countdown.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(logoutTimer);
            localStorage.removeItem("isLoggedIn");
            alert("Session expired. Logging out.");
            window.location.href = "index.html";
        }
    }, 1000);
}

function updateLogoutTime() {
    const userTime = parseInt(document.getElementById("logoutTime").value);
    if (isNaN(userTime) || userTime < 10) {
        alert("Enter valid time (10+ seconds).");
        return;
    }
    localStorage.setItem("logoutDuration", userTime);
    localStorage.removeItem("disableLogout");
    startLogoutTimer();
}

function disableLogout() {
    clearInterval(logoutTimer);
    localStorage.setItem("disableLogout", "true");
    countdown.textContent = "∞";
    alert("Auto logout disabled.");
}

function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
}
function changeUsername() {
    const newUsername = document.getElementById("newUsername").value.trim();
    if (newUsername.length < 3) {
        alert("Username must be at least 3 characters.");
        return;
    }
    localStorage.setItem("userUsername", newUsername);
    alert("Username updated successfully.");
}

// Disable right-click
document.addEventListener("contextmenu", function (e) {
    alert("NO Inspect allowed");
    e.preventDefault();
});