document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();
});

function loadPasswords() {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    let accountsList = document.getElementById('accounts');
    accountsList.innerHTML = '';
    accounts.forEach((account, index) => {
        let item = document.createElement('li');
        item.innerHTML = `App: ${account.appname} - Username: ${account.username} - Password: ${account.password}`;
        accountsList.appendChild(item);
    });
}

function savePassword(event) {
    event.preventDefault();
    let index = document.getElementById('index').value;
    let appname = document.getElementById('appname').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    if (index) {
        accounts[index] = { appname, username, password };
    } else {
        accounts.push({ appname, username, password });
    }
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadPasswords();
    event.target.reset();
}

function checkPasswordStrength() {
    let password = document.getElementById('password').value;
    let strength = document.getElementById('password-strength');
    // Simple password strength check (for example only)
    if (password.length > 8) {
        strength.textContent = 'Strong';
        strength.style.color = 'green';
    } else {
        strength.textContent = 'Weak';
        strength.style.color = 'red';
    }
}
function exportToJsonFile() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const dataStr = JSON.stringify(accounts);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'passwords.json';
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const accounts = JSON.parse(event.target.result);
            // Validate format of each account object in the array
            if (Array.isArray(accounts) && accounts.every(account => 
                account.hasOwnProperty('appname') && 
                account.hasOwnProperty('username') && 
                account.hasOwnProperty('password'))) {
                // Save valid data to local storage
                localStorage.setItem('accounts', JSON.stringify(accounts));
                loadPasswords();
                alert('Data imported successfully!');
            } else {
                throw new Error('Invalid format');
            }
        } catch (error) {
            alert('Error: Imported file is not in the correct format.');
        }
    };
    fileReader.onerror = function() {
        alert('Error reading file');
    };
    // Read the text of the file
    fileReader.readAsText(event.target.files[0]);
}
document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();
});

function loadPasswords() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts.sort((a, b) => a.appname.localeCompare(b.appname) || a.username.localeCompare(b.username));
    const accountsTable = document.querySelector('#accounts tbody');
    accountsTable.innerHTML = ''; // Clear existing entries

    accounts.forEach((account, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${account.appname}</td>
            <td>${account.username}</td>
            <td>${account.password}</td>
            <td><button onclick="editAccount(${index})">Edit</button></td>
        `;
        accountsTable.appendChild(row);
    });
}
function editAccount(index) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const account = accounts[index];
    const accountsTable = document.querySelector('#accounts tbody');
    const row = accountsTable.rows[index];
    row.innerHTML = `
        <td><input type="text" value="${account.appname}" id="editAppname"></td>
        <td><input type="text" value="${account.username}" id="editUsername"></td>
        <td><input type="password" value="${account.password}" id="editPassword"></td>
        <td>
            <button onclick="updateAccount(${index})">Save</button>
            <button onclick="loadPasswords()">Cancel</button>
        </td>
    `;
}

function updateAccount(index) {
    const appname = document.getElementById('editAppname').value;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;

    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts[index] = { appname, username, password };
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadPasswords();
}
document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();
});

function savePassword(event) {
    event.preventDefault();
    const appname = document.getElementById('appname').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (checkPasswordStrength(password) === 'Weak') {
        showModal('weakPasswordModal', { appname, username, password });
        return;
    }

    addPassword({ appname, username, password });
    event.target.reset();
}

function addPassword({ appname, username, password }) {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts.push({ appname, username, password });
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadPasswords();
}

function checkPasswordStrength(password) {
    // Simple password strength check (for example only)
    return password.length > 8 ? 'Strong' : 'Weak';
}

function showModal(modalId, data) {
    const modal = document.getElementById(modalId);
    const generateBtn = document.getElementById('generatePassword');
    generateBtn.onclick = () => {
        const strongPassword = generateStrongPassword();
        data.password = strongPassword;
        updateModalForGeneratedPassword(modalId, data);
    };
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function updateModalForGeneratedPassword(modalId, { appname, username, password }) {
    const modal = document.getElementById(modalId);
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Secure Password Generated</h2>
            <p>New Password: ${password}</p>
            <button onclick="addPassword({appname: '${appname}', username: '${username}', password: '${password}'}); closeModal('${modalId}');">Use</button>
            <button onclick="closeModal('${modalId}')">Cancel</button>
        </div>
    `;
}

function generateStrongPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
}