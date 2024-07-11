let balance = parseFloat(localStorage.getItem('balance')) || 0;
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateBalanceDisplay();
    populateHistoryTable();
});

function addTransaction() {
    const transactionType = document.getElementById('transactionType').value;
    const transactionAmount = parseFloat(document.getElementById('transactionAmount').value);

    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionType === 'Income / Expenses') {
        alert('Please enter a valid transaction.');
        return;
    }

    const transaction = {
        type: transactionType,
        amount: transactionAmount,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), // Format date
        balance: 0  // Placeholder to be updated later
    };

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
    document.getElementById('transactionType').value = 'Income / Expenses';
    document.getElementById('transactionAmount').value = '';
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('yourBalance');
    balanceElement.innerHTML = `<span>₹ </span> ${balance.toFixed(2)}`;
    balanceElement.className = balance >= 0 ? 'green' : 'red';

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
                <button class="btn btn-primary btn-sm" onclick="editTransaction(${index})">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editTransaction(index) {
    const transaction = transactionHistory[index];
    const newType = prompt("Edit Transaction Type (income/expenses):", transaction.type);
    const newAmount = parseFloat(prompt("Edit Transaction Amount:", transaction.amount));

    if (newType !== 'income' && newType !== 'expenses') {
        alert('Invalid transaction type. Please enter "income" or "expenses".');
        return;
    }

    if (isNaN(newAmount) || newAmount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    // Update the transaction
    transaction.type = newType;
    transaction.amount = newAmount;

    // Recalculate balance
    recalculateBalance();

    // Update local storage
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('balance', balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
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

function showDeletePop() {
    document.getElementById('delete-pop').style.display = 'block';
}

function hideDeletePop() {
    document.getElementById('delete-pop').style.display = 'none';
}

function clearLocalStorage() {
    localStorage.clear();
    balance = 0;
    transactionHistory = [];
    updateBalanceDisplay();
    populateHistoryTable();
    hideDeletePop(); // Hide the pop-up after clearing
}