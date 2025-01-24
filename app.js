let apiKey = '';
let currentData = [];
let editIndex = null;

// Refresh Function
function refreshDisplay() {
    showLoading();
    fetchData();
}

// Login Function
function login() {
    apiKey = document.getElementById('apiKeyInput').value;
    if (apiKey) {
        showLoading();
        fetchData();
    }
}

// Show/Hide Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('stayModal').style.display = 'none';
    document.getElementById('stayForm').reset();
    editIndex = null;
}

function showAddStayModal() {
    document.getElementById('addStayModal').style.display = 'block';
}

function showEditStayModal(index) {
    const stayData = JSON.parse(currentData[index][0]);

    document.getElementById('stayModalTitle').textContent = 'Editar Estadía';
    document.getElementById('cabinSelect').value = stayData.cabin;
    document.getElementById('clientName').value = stayData.clientName;
    document.getElementById('clientPhone').value = stayData.clientPhone || '';
    document.getElementById('startDate').value = stayData.startDate;
    document.getElementById('endDate').value = stayData.endDate;
    document.getElementById('notes').value = stayData.notes || '';

    editIndex = index;
    document.getElementById('stayModal').style.display = 'block';
}

// Loading Functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// API Functions
async function getConfig() {
    try {
        const response = await fetch('config.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
        throw error;
    }
}

// Save Stay Function
async function saveStay() {
    const data = {
        cabin: document.getElementById('cabinSelect').value,
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        notes: document.getElementById('notes').value
    };

    showLoading();

    try {
        const config = await getConfig();
        const requestBody = {
            action: editIndex !== null ? 'update' : 'create',
            data: data
        };

        // Only add originalData for update
        if (editIndex !== null) {
            requestBody.originalData = JSON.parse(currentData[editIndex][0]);
        }

        const response = await fetch(`${config.API_URL}?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        closeModal();
        fetchData();
    } catch (error) {
        console.error('Error:', error);
        alert('Error guardando la estadía');
        hideLoading()
    } finally {
        // hideLoading();
    }
}

// Fetch Data Function
async function fetchData() {
    if (!apiKey) {
        showLoginModal();
        return;
    }

    try {
        const config = await getConfig();
        const response = await fetch(
            `${config.API_URL}?key=${apiKey}&action=read`
        );
        const result = await response.json();

        if (result.error) {
            alert(result.error);
            showLoginModal();
            return;
        }

        currentData = result.data.slice(1); // Skip header row
        displayData();
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading data');
    }
}

// Display Data Function
function displayData() {
    const cabins = {
        'Cabaña 1': document.querySelector('#cabana1'),
        'Cabaña 2': document.querySelector('#cabana2'),
        'Cabaña 3': document.querySelector('#cabana3')
    };

    // Reset cabin headers
    Object.values(cabins).forEach(cabin => {
        const cabinName = cabin.querySelector('h2').textContent;
        cabin.querySelector('h2').innerHTML = `<i class="fas fa-home"></i> ${cabinName}`;
        cabin.querySelector('.current-stay').innerHTML = '';
        cabin.querySelector('.upcoming-stays').innerHTML = '';
    });

    const today = new Date();
    
    currentData.forEach((item, index) => {
        const stayData = JSON.parse(item[0]);
        const startDate = new Date(stayData.startDate);
        const endDate = new Date(stayData.endDate);
        
        const stayBlock = document.createElement('div');
        stayBlock.classList.add('stay-block');
        stayBlock.innerHTML = `
            <div class="stay-details">
                <div><i class="fas fa-user"></i> ${stayData.clientName}</div>
                <div><i class="fas fa-calendar"></i> ${stayData.startDate} al ${stayData.endDate}</div>
                ${stayData.clientPhone ? `<div><i class="fas fa-phone"></i> ${stayData.clientPhone}</div>` : ''}
            </div>
        `;
        stayBlock.onclick = () => showEditStayModal(index);

        const cabinElement = cabins[stayData.cabin];
        if (startDate <= today && endDate >= today) {
            // Change icon to fa-house-user if currently occupied
            cabinElement.querySelector('h2').innerHTML = `<i class="fas fa-house-user"></i> ${stayData.cabin}`;
            cabinElement.querySelector('.current-stay').appendChild(stayBlock);
        } else if (startDate > today) {
            cabinElement.querySelector('.upcoming-stays').appendChild(stayBlock);
        }
    });

    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    hideLoading();
}

// Delete Item Function
async function deleteItem(index) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta estadía?')) return;

    try {
        const config = await getConfig();
        const response = await fetch(`${config.API_URL}?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'delete',
                data: JSON.parse(currentData[index][0])
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        fetchData();
    } catch (error) {
        console.error('Error:', error);
        alert('Error eliminando');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showLoginModal();
});



function showAddStayModal() {
    // Reset add form
    document.getElementById('addCabinSelect').value = 'Cabaña 1';
    document.getElementById('addClientName').value = '';
    document.getElementById('addClientPhone').value = '';
    document.getElementById('addStartDate').value = '';
    document.getElementById('addEndDate').value = '';
    document.getElementById('addNotes').value = '';

    document.getElementById('addStayModal').style.display = 'block';
}

function closeAddStayModal() {
    document.getElementById('addStayModal').style.display = 'none';
}

async function saveNewStay() {
    const data = {
        cabin: document.getElementById('addCabinSelect').value,
        clientName: document.getElementById('addClientName').value,
        clientPhone: document.getElementById('addClientPhone').value,
        startDate: document.getElementById('addStartDate').value,
        endDate: document.getElementById('addEndDate').value,
        notes: document.getElementById('addNotes').value
    };

    showLoading();

    try {
        const config = await getConfig();
        const response = await fetch(`${config.API_URL}?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'create',
                data: data
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        closeAddStayModal();
        fetchData();
    } catch (error) {
        console.error('Error:', error);
        alert('Error guardando la estadía');
        hideLoading()
    } finally {
        // hideLoading();
    }
}

function showEditStayModal(index) {
    const stayData = JSON.parse(currentData[index][0]);

    document.getElementById('editCabinSelect').value = stayData.cabin;
    document.getElementById('editClientName').value = stayData.clientName;
    document.getElementById('editClientPhone').value = stayData.clientPhone || '';
    document.getElementById('editStartDate').value = stayData.startDate;
    document.getElementById('editEndDate').value = stayData.endDate;
    document.getElementById('editNotes').value = stayData.notes || '';

    // Store the index for later use in editing/deleting
    document.getElementById('editStayModal').dataset.index = index;

    document.getElementById('editStayModal').style.display = 'block';
}

function closeEditStayModal() {
    document.getElementById('editStayModal').style.display = 'none';
}

async function saveEditStay() {
    const index = parseInt(document.getElementById('editStayModal').dataset.index);
    const originalData = JSON.parse(currentData[index][0]);

    const data = {
        cabin: document.getElementById('editCabinSelect').value,
        clientName: document.getElementById('editClientName').value,
        clientPhone: document.getElementById('editClientPhone').value,
        startDate: document.getElementById('editStartDate').value,
        endDate: document.getElementById('editEndDate').value,
        notes: document.getElementById('editNotes').value
    };

    showLoading();

    try {
        const config = await getConfig();
        const response = await fetch(`${config.API_URL}?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'update',
                originalData: originalData,
                data: data
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        closeEditStayModal();
        fetchData();
    } catch (error) {
        console.error('Error:', error);
        alert('Error actualizando la estadía');
        hideLoading()
    } finally {
        // hideLoading();
    }
}

function deleteCurrentStay() {
    const index = parseInt(document.getElementById('editStayModal').dataset.index);

    if (!confirm('¿Estás seguro de que quieres eliminar esta estadía?')) return;

    deleteItem(index);
    closeEditStayModal();
}

