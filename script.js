let balance = parseFloat(localStorage.getItem('balance')) || 0;
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
let editIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();
});

function addTransaction() {
    const transactionType = document.getElementById('transactionType').value;
    const transactionAmountInput = document.getElementById('transactionAmount');
    const transactionAmount = parseFloat(transactionAmountInput.value);
    const transactionDescription = document.getElementById('transactionDescription').value;

    // Validate input
    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionType === 'Income / Expenses' || transactionDescription.trim() === '') {
        alert('Please enter a valid transaction.');
        return;
    }

    const transaction = {
        type: transactionType,
        amount: transactionAmount,
        description: transactionDescription,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), // Format date
        balance: 0  // Placeholder to be updated later
    };

    // Update balance based on transaction type
    if (transactionType === 'income') {
        balance += transactionAmount;
    } else if (transactionType === 'expenses') {
        balance -= transactionAmount;
    }

    transaction.balance = balance; // Set the running balance at the time of the transaction
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('balance', balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    // Clear input fields after adding transaction
    transactionAmountInput.value = '';
    document.getElementById('transactionType').value = 'Income / Expenses';
    document.getElementById('transactionDescription').value = '';
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('yourBalance');
    balanceElement.innerHTML = `<span>₹ </span> ${balance.toFixed(2)}`;
    
    // Set color based on balance
    if (balance >= 0) {
        balanceElement.style.color = 'green';
    } else {
        balanceElement.style.color = 'red';
    }

    document.getElementById('totalIncome').innerHTML = `<span>₹ </span> ${getTotalAmount('income').toFixed(2)}`;
    document.getElementById('totalExpenses').innerHTML = `<span>₹ </span> ${getTotalAmount('expenses').toFixed(2)}`;
}


function getTotalAmount(type) {
    return transactionHistory
        .filter(transaction => transaction.type === type)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function populateHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';

    transactionHistory.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>₹ ${transaction.amount.toFixed(2)}</td>
            <td>₹ ${transaction.balance.toFixed(2)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openEditTransactionModal(${index})">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function populateDescriptionTable() {
    const descriptionTableBody = document.getElementById('tableDiscrption');
    descriptionTableBody.innerHTML = '';

    transactionHistory.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${transaction.description}</td>
        `;
        descriptionTableBody.appendChild(row);
    });
}

function openEditTransactionModal(index) {
    editIndex = index;
    const transaction = transactionHistory[index];
    document.getElementById('editTransactionType').value = transaction.type;
    document.getElementById('editTransactionAmount').value = transaction.amount;
    document.getElementById('editTransactionDescription').value = transaction.description;
    const editTransactionModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    editTransactionModal.show();
}

function saveEditTransaction() {
    const transactionType = document.getElementById('editTransactionType').value;
    const transactionAmount = parseFloat(document.getElementById('editTransactionAmount').value);
    const transactionDescription = document.getElementById('editTransactionDescription').value;

    // Validate input
    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionType === '' || transactionDescription.trim() === '') {
        alert('Please enter valid transaction details.');
        return;
    }

    const transaction = transactionHistory[editIndex];
    transaction.type = transactionType;
    transaction.amount = transactionAmount;
    transaction.description = transactionDescription;

    // Recalculate balance
    recalculateBalance();

    // Update local storage
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('balance', balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    const editTransactionModal = bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
    editTransactionModal.hide();
}

function recalculateBalance() {
    balance = 0;
    transactionHistory.forEach(transaction => {
        if (transaction.type === 'income') {
            balance += transaction.amount;
        } else if (transaction.type === 'expenses') {
            balance -= transaction.amount;
        }
        transaction.balance = balance; // Update running balance
    });
}

function openClearConfirmationModal() {
    const clearConfirmationModal = new bootstrap.Modal(document.getElementById('clearConfirmationModal'));
    clearConfirmationModal.show();
}

function clearLocalStorage() {
    localStorage.clear();
    balance = 0;
    transactionHistory = [];
    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();
    const clearConfirmationModal = bootstrap.Modal.getInstance(document.getElementById('clearConfirmationModal'));
    clearConfirmationModal.hide();
}
