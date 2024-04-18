// This event listener triggers when the document has fully loaded. It calls the loadPasswords function to populate the list of passwords.
document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();
});


// Loads passwords from localStorage, sorts them, and displays them in the table on the webpage.
function loadPasswords() {
        // Retrieves the accounts from localStorage or initializes an empty array if none exist.
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Sorts the accounts array first by application name, then by username, both in case-insensitive manner.
    accounts.sort((a, b) => {
        if (a.appname.toLowerCase() === b.appname.toLowerCase()) {
            return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
        }
        return a.appname.toLowerCase().localeCompare(b.appname.toLowerCase());
    });
    
    // Selects the table body in the HTML where account information will be displayed.
    const accountsTable = document.querySelector('#accounts tbody');
    accountsTable.innerHTML = ''; // Clear existing entries

    // Iterates over each account and adds a row to the table for each.
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

// Handles the form submission to save or update a password.

function savePassword(event) {
    event.preventDefault(); // Prevents the default form submission action.
    // Retrieves values from the form.
    const appname = document.getElementById('appname').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Checks if the password is weak. If weak, shows the modal to warn the user; otherwise, updates or adds the password.

    if (isPasswordWeak(password)) {
        showModal({ appname, username, password });
    } else {
        addOrUpdatePassword({ appname, username, password });
    }
}
// Determines if a password is considered weak based on length and character criteria.
function isPasswordWeak(password) {
    return password.length < 8 || !/[A-Z]/.test(password) || !/[^\w]/.test(password);
}

// Adds or updates a password in the localStorage and refreshes the password list.
function addOrUpdatePassword(data) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
     // Finds the index of the account in the array based on the appname and username.
    const index = accounts.findIndex(acc => acc.username === data.username && acc.appname === data.appname);
    if (index !== -1) {
        accounts[index] = data;
    } else {
        accounts.push(data);
    }

    // Updates localStorage and refreshes the displayed password list.
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadPasswords();
    closeModal();
}
// Displays the modal for handling weak passwords.
function showModal(data) {
    const modal = document.getElementById('weakPasswordModal');
    modal.style.display = 'block';
    // Configures buttons within the modal for adding a weak password or generating a secure one
    document.getElementById('addWeakPassword').onclick = () => addOrUpdatePassword(data);
    document.getElementById('generateSecurePassword').onclick = () => {
        data.password = generateStrongPassword();
        addOrUpdatePassword(data);
    };
}
// Generates a strong password using a defined character set.
function generateStrongPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    let result = "";
    for (let i = 0; i < 12; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}
// Closes the currently open modal by setting its display style to 'none'.
function closeModal() {
    document.getElementById('weakPasswordModal').style.display = 'none';
}
// Allows editing of an account directly in the table.
function editAccount(index) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const account = accounts[index];
    const accountsTable = document.querySelector('#accounts tbody');
    const row = accountsTable.rows[index];
    row.innerHTML = `
        <td><input type="text" value="${account.appname}" id="editAppname-${index}"></td>
        <td><input type="text" value="${account.username}" id="editUsername-${index}"></td>
        <td><input type="password" value="${account.password}" id="editPassword-${index}"></td>
        <td>
            <button onclick="updateAccount(${index})">Save</button>
            <button onclick="loadPasswords()">Cancel</button>
        </td>
    `;
}
// Saves changes made to an account in the edit mode and updates the displayed list.
function updateAccount(index) {
    const appname = document.getElementById(`editAppname-${index}`).value;
    const username = document.getElementById(`editUsername-${index}`).value;
    const password = document.getElementById(`editPassword-${index}`).value;

    const accounts = JSON.parse(localStorage.getItem('accounts'));
    accounts[index] = { appname, username, password };
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadPasswords();
}
// Handles the login logic.
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Simple hard-coded check for demonstration purposes.
    if (username === 'Jack' && password === 'admin') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    } else {
        alert('Incorrect username or password!');
    }
}

function exportToJsonFile() {
    // Retrieve the stored accounts from localStorage, or initialize as an empty array if none exist.
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Define a passphrase for AES encryption. This should ideally be retrieved from a secure source.
    const passphrase = 'your secure passphrase';

    // Encrypt the JSON string representation of the accounts array using the AES algorithm.
    // The 'toString' method is used to convert the encrypted object into a string format suitable for storage or transmission.
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(accounts), passphrase).toString();

    // Create a data URI with a JSON content header and the URL-encoded encrypted string.
    // This format is necessary for the browser to interpret the file correctly on download.
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(encrypted);

    // Specify a default name for the downloadable file.
    const exportFileDefaultName = 'encrypted_passwords.json';

    // Create an anchor (<a>) element programmatically to trigger the file download.
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    // Simulate a click on the link to start the download.
    linkElement.click();
}


function importFromJsonFile(event) {
    // Create a FileReader object to read the content of the file selected by the user.
    const fileReader = new FileReader();

    // Define what should happen when the file has been successfully read.
    fileReader.onload = function(event) {
        // Use the same passphrase used for encryption to attempt decryption.
        const passphrase = 'your secure passphrase';

        try {
            // Decrypt the content read from the file. The result needs to be converted from CryptoJS's format using 'toString(CryptoJS.enc.Utf8)'.
            const decrypted = CryptoJS.AES.decrypt(event.target.result, passphrase);
            const accountsStr = decrypted.toString(CryptoJS.enc.Utf8);

            // Attempt to parse the decrypted string back into an array of accounts.
            const accounts = JSON.parse(accountsStr);

            // Check if the decrypted content is an array (as expected).
            if (Array.isArray(accounts)) {
                // Update localStorage with the new accounts and refresh the displayed list.
                localStorage.setItem('accounts', JSON.stringify(accounts));
                loadPasswords();
                alert('Data imported successfully!');
            } else {
                // If the format is not as expected, throw an error.
                throw new Error('Invalid format or decryption key.');
            }
        } catch (error) {
            // Handle errors that may occur during decryption or parsing.
            alert('Error: Imported file is not in the correct format or wrong passphrase.');
        }
    };

    // Define what should happen if there is an error during the file read process.
    fileReader.onerror = function() {
        alert('Error reading file');
    };

    // Initiate reading the file as a text.
    fileReader.readAsText(event.target.files[0]);
}

