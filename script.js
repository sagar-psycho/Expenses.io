document.addEventListener('DOMContentLoaded', function() {
    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();
});

let balance = parseFloat(localStorage.getItem('balance')) || 0;
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
let editIndex = -1;
let deleteIndex = -1;

function addTransaction() {
    const transactionType = document.getElementById('transactionType').value;
    const transactionAmountInput = document.getElementById('transactionAmount');
    const transactionAmount = parseFloat(transactionAmountInput.value);
    const transactionDescription = document.getElementById('transactionDescription').value;

    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionType === 'Income / Expenses' || transactionDescription.trim() === '') {
        alert('Please enter a valid transaction.');
        return;
    }

    const transaction = {
        type: transactionType,
        amount: transactionAmount,
        description: transactionDescription,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        balance: 0
    };

    if (transactionType === 'income') {
        balance += transactionAmount;
    } else if (transactionType === 'expenses') {
        balance -= transactionAmount;
    }

    transaction.balance = balance;
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('balance', balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    transactionAmountInput.value = '';
    document.getElementById('transactionType').value = 'Income / Expenses';
    document.getElementById('transactionDescription').value = '';
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('yourBalance');
    balanceElement.innerHTML = `<span>₹ </span> ${balance.toFixed(2)}`;

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
        row.style.backgroundColor = transaction.type === 'income' ? 'lightgreen' : 'lightcoral';

        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>₹ ${transaction.amount.toFixed(2)}</td>
            <td>₹ ${transaction.balance.toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditTransactionModal(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${index})">Delete</button>
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

    if (isNaN(transactionAmount) || transactionAmount <= 0 || transactionType === '' || transactionDescription.trim() === '') {
        alert('Please enter valid transaction details.');
        return;
    }

    transactionHistory[editIndex].type = transactionType;
    transactionHistory[editIndex].amount = transactionAmount;
    transactionHistory[editIndex].description = transactionDescription;

    recalculateBalance();

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
        transaction.balance = balance;
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

function deleteTransaction(index) {
    deleteIndex = index;
    const deleteConfirmationModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    deleteConfirmationModal.show();
}

function confirmDeleteTransaction() {
    transactionHistory.splice(deleteIndex, 1);
    recalculateBalance();
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('balance', balance.toFixed(2));

    updateBalanceDisplay();
    populateHistoryTable();
    populateDescriptionTable();

    const deleteConfirmationModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
    deleteConfirmationModal.hide();
}

async function saveAsPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 10; // Starting y position
    doc.setFontSize(12);

    doc.text('Transaction History', 10, y);
    y += 10;

    // Add table headers
    doc.text('No.', 10, y);
    doc.text('Date', 30, y);
    doc.text('Type', 60, y);
    doc.text('Amount', 90, y);
    doc.text('Total Amount', 120, y);
    y += 10;

    // Add transaction history
    transactionHistory.forEach((transaction, index) => {
        doc.text((index + 1).toString(), 10, y);
        doc.text(transaction.date, 30, y);
        doc.text(transaction.type, 60, y);
        doc.text('Rs. ' + transaction.amount.toFixed(2), 90, y);
        doc.text('Rs. ' + transaction.balance.toFixed(2), 120, y);
        y += 10;

        // Check if the y position is beyond the page height, add new page if necessary
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });

    y += 10;

    doc.text('Descriptions', 10, y);
    y += 10;

    // Add transaction descriptions
    transactionHistory.forEach((transaction, index) => {
        doc.text((index + 1).toString(), 10, y);
        doc.text(transaction.description, 30, y);
        y += 10;

        // Check if the y position is beyond the page height, add new page if necessary
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });

    // Get current date
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = currentDate.toLocaleString('default', { month: 'long' });

    // Generate file name with current day and month
    const fileName = `history on ${day}_${month}.pdf`;

    doc.save(fileName);
}



document.addEventListener("contextmenu", function(event){
    alert("NO Inspect allowed");
    event.preventDefault();
})
