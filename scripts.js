var tableData = JSON.parse(localStorage.getItem('tableData')) || [];
var headers = ["Name", "Email", "Age", ""];
var tableHeadersRow = document.getElementById("tableHeaders");
var tableFooterRow = document.getElementById("tableFooter");
var tbody = document.getElementById("tableBody");
var filterData = tableData.filter(row => row.active === true);
var entries = 5;
var currentSortBy = '';
var currentPage = 1;
var totalPages = Math.ceil(filterData.length / entries);
var startIndex, endIndex;
var sortingState = {
    name: "asc",
    email: "asc",
    age: "asc"
};
var editingRowIndex = -1;

var date = new Date().toLocaleDateString();
console.log(date);
headers.forEach(function (header) {
    tableHeadersRow.innerHTML += `<th>${header}</th>`;
    tableFooterRow.innerHTML += `<th>${header}</th>`;
});

function calculateIndexes() {
    startIndex = (currentPage - 1) * entries;
    endIndex = startIndex + entries;
}

function validateInput(fname, femail, fage) {
    var nameError = document.getElementById("nameError");
    var emailError = document.getElementById("emailError");
    if (fname.length <= 3) {
        nameError.textContent = "Name must be longer than 3 characters";
        return false;
    } else {
        nameError.textContent = "";
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(femail)) {
        emailError.textContent = "Invalid email format";
        return false;
    } else {
        emailError.textContent = "";
    }

    return true;
}



function renderTable(data, sortBy) {
    tbody.innerHTML = "";
    calculateIndexes();
    var filteredData = data.slice(startIndex, endIndex);

    if (sortBy) {
        filteredData.sort((a, b) => {
            if (sortingState[sortBy] === "asc") {
                return a[sortBy].localeCompare(b[sortBy]);
            } else {
                return b[sortBy].localeCompare(a[sortBy]);
            }
        });
    }

    filteredData.forEach(function (rowData, rowIndex) {
        var newRowHTML = `
                <tr>
                    <td>${rowData.name}</td>
                    <td>${rowData.email}</td>
                    <td>${rowData.age}</td>
                    <td>
                        <button onclick="editRow(${startIndex + rowIndex})">Edit</button>
                        <button onclick="deleteRow(${startIndex + rowIndex})">Delete</button>
                    </td>
                </tr>
                `;
        tbody.innerHTML += newRowHTML;
    });

    updatePaginationButtons();
}

tableHeadersRow.addEventListener("click", function (event) {
    if (event.target.tagName === "TH") {
        var headerText = event.target.textContent.trim();
        var sortBy = headerText.toLowerCase();

        sortingState[sortBy] = sortingState[sortBy] === "asc" ? "desc" : "asc";
        currentSortBy = sortBy;
        renderTable(filterData, currentSortBy);
    }
});

function showEntries(value) {
    entries = parseInt(value);
    totalPages = Math.ceil(filterData.length / entries);
    currentPage = 1;
    renderTable(filterData, currentSortBy);
}


function mySearch(value) {
    startIndex = (currentPage - 1) * entries;
    endIndex = startIndex + entries;
    var visibleData = filterData.slice(startIndex, endIndex);
    var searchData = visibleData.filter(function (row) {
        return row.name.toLowerCase().includes(value.toLowerCase()) ||
               row.email.toLowerCase().includes(value.toLowerCase()) ||
               row.age.toString().includes(value.toLowerCase());
    });

    if (searchData.length === 0 && value.trim() !== "") {
        tbody.innerHTML = '<tr><td colspan="4">No results found.</td></tr>';
    } else if (value.trim() === "") {
        renderTable(filterData, currentSortBy);
    } else {
        renderTable(searchData, currentSortBy);
    }

    updatePaginationButtons();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable(filterData, currentSortBy);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderTable(filterData, currentSortBy);
    }
}

function updatePaginationButtons() {
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");

    if (currentPage === 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    if (currentPage === totalPages) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function editRow(index) {
    var row = filterData[index];
    document.getElementById("fname").value = row.name;
    document.getElementById("femail").value = row.email;
    document.getElementById("fage").value = row.age;
    editingRowIndex = index;
}

function submitForm() {
    var fname = document.getElementById("fname").value;
    var femail = document.getElementById("femail").value;
    var fage = document.getElementById("fage").value;
    if (!validateInput(fname, femail, fage)) {
        return;
    }
    var nameAlreadyExists = tableData.some(row => row.name === fname);
    if (editingRowIndex !== -1) {
        submitEdit(fname, femail, fage);
    } else if (nameAlreadyExists) {
        document.getElementById("nameError").textContent = "Name already exists in the table";
        return;
    } else {
        addNewEntry(fname, femail, fage);
    }
}

function addNewEntry(fname, femail, fage) {
    tableData.push({
        name: fname,
        email: femail,
        age: fage,
        date: date,
        active: true
    });

    removeFilledData();
    localStorage.setItem('tableData', JSON.stringify(tableData));
    filterData = tableData.filter(row => row.active === true);
    renderTable(filterData, currentSortBy);
    updatePaginationButtons();
}

function submitEdit(fname, femail, fage) {
    var originalIndex = tableData.findIndex(row => row.name === filterData[editingRowIndex].name);
    console.log(originalIndex);
    if (originalIndex !== -1) {
        tableData[originalIndex] = {
            name: fname,
            email: femail,
            age: fage,
            date: filterData[editingRowIndex].date,
            active: true
        };
        removeFilledData();
        localStorage.setItem('tableData', JSON.stringify(tableData));
        filterData = tableData.filter(row => row.active === true);
        renderTable(filterData, currentSortBy);
        editingRowIndex = -1;
    } else {
        console.error("Entry not found in tableData array.");
    }
}


function deleteRow(index) {
    var row = filterData[index];
    row.active = false;
    var originalIndex = tableData.findIndex(row => row.name === filterData[index].name);
    tableData[originalIndex].active = false;
    localStorage.setItem('tableData', JSON.stringify(tableData));
    filterData = tableData.filter(row => row.active === true);
    renderTable(filterData, currentSortBy);
}
function removeFilledData() {
    document.getElementById("fname").value = "";
    document.getElementById("femail").value = "";
    document.getElementById("fage").value = "";
}
renderTable(filterData, currentSortBy);
updatePaginationButtons();