const userFormS = document.querySelector('#userform');
const maintable = document.getElementById('userTable');
const hideformSec = document.querySelector('#formSection');
const displaytableSec = document.querySelector('#tableSection');
const newbtnuser = document.querySelector('#showFormButton');
const editfom = document.querySelector('#editForm');
const edituserid = document.querySelector('#editUserId');
const editSec = document.querySelector('#editSection');
const canceleditbtn = document.querySelector('#cancel');
const cancelformsubmit = document.querySelector('.cancelform');
const nextbtn = document.querySelector('#nextButton');
const prevbtn = document.querySelector('#prevButton');
const InPut = document.querySelector('#input-search');
const pageSize = 5;
let curPage = 1;
let sortOrder = {
    id: 'asc',
    createdAt: 'asc',
};
let totalPages = 1; 
let prevvalueform = {};
userFormS.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/users', {
            method: 'POST',
            body: formData
        });
        if (response.status === 400) {
            alert('Email already exists');
        } else if (!response.ok) {
            console.log('Failed to add user');
        } else {
            hideformSec.style.display = 'none';
            displaytableSec.style.display = 'block';
            updateUserTable();
        }
    } catch (error) {
        console.error('Error', error);
    }
});

newbtnuser.addEventListener('click', () => {
    userFormS.reset();
    hideformSec.style.display = 'block';
    displaytableSec.style.display = 'none';
});

editfom.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = edituserid.value;
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) {
            console.log('Failed to update user');
        }
        editSec.style.display = 'none';
        displaytableSec.style.display = 'block';
        updateUserTable();
    } catch (error) {
        console.error('Error', error);
    }
});

canceleditbtn.addEventListener('click', () => {
    editSec.style.display = 'none';
    displaytableSec.style.display = 'block';
});

cancelformsubmit.addEventListener('click', () => {
    hideformSec.style.display = 'none';
    displaytableSec.style.display = 'block';
});
function showEditForm(user) {
    document.querySelector('#editUserId').value = user.id;
    document.querySelector('#editFirstName').value = user.firstName;
    document.querySelector('#editLastName').value = user.lastName;
    document.querySelector('#editEmail').value = user.email;
    document.querySelector('#editPassword').value = "";

    prevvalueform = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
    };

    document.querySelector('#editChooseFile').value = null;

    editSec.style.display = 'block';
    displaytableSec.style.display = 'none';
    valuechange();
}
function valuechange() {
    const curname = document.querySelector('#editFirstName').value;
    const curlastname = document.querySelector('#editLastName').value;
    const curemail = document.querySelector('#editEmail').value;
    const curpassword = document.querySelector('#editPassword').value;
    const fileinput = document.querySelector('#editChooseFile').files.length > 0;

    const updatebtn = document.querySelector('#editForm button[type="submit"]');

    if (curname !== prevvalueform.firstName ||
        curlastname !== prevvalueform.lastName ||
        curemail !== prevvalueform.email ||
        curpassword !== prevvalueform.password ||
        fileinput) {
        updatebtn.style.color = "white";
        updatebtn.disabled = false;
    } else {
        updatebtn.style.color = "rgba(10, 22, 70, .2)";
        updatebtn.disabled = true;
    }
}

document.querySelector('#editFirstName').addEventListener('input', valuechange);
document.querySelector('#editLastName').addEventListener('input', valuechange);
document.querySelector('#editEmail').addEventListener('input', valuechange);
document.querySelector('#editPassword').addEventListener('input', valuechange);
document.querySelector('#editChooseFile').addEventListener('change', valuechange);




async function deleteUser(userId) {

    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            console.log('Failed to delete user');
        }
        updateUserTable();
    } catch (error) {
        console.error('Error', error);
    }
}

let searchTerm = '';
async function updateUserTable(sortColumn) {
    try {
        const response = await fetch('/usersData');
        if (!response.ok) {
            console.log('Failed to fetch user data');
            return;
        }
        let allUsers = await response.json();

        if (searchTerm) {
            allUsers = allUsers.filter(user =>
                user.id.toString().includes(searchTerm) ||
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        totalPages = Math.ceil(allUsers.length / pageSize);
        const start = (curPage - 1) * pageSize;
        const end = curPage * pageSize;
        const pageperUsers = allUsers.slice(start, end);

        if (sortColumn) {
            pageperUsers.sort((a, b) => {
                if (sortOrder[sortColumn] === 'asc') {
                    return a[sortColumn] > b[sortColumn] ? 1 : -1;
                } else {
                    return a[sortColumn] < b[sortColumn] ? 1 : -1;
                }
            });
            sortOrder[sortColumn] = sortOrder[sortColumn] === 'asc' ? 'desc' : 'asc';
        }

        const tbody = document.querySelector('#userTable tbody');
        tbody.innerHTML = '';
        pageperUsers.forEach(user => {
            const row = tbody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.firstName;
            row.insertCell().textContent = user.lastName;
            row.insertCell().textContent = user.email;
            // row.insertCell().textContent = user.password;
            row.insertCell().textContent = new Date(user.createdAt).toLocaleString();
            row.insertCell().textContent = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '';
            const imgCell = row.insertCell();
            if (user.chooseFile) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('img-container');
                const img = document.createElement('img');
                img.src = `/uploads/${user.chooseFile}`;
                img.classList.add('imgg');
                imgContainer.appendChild(img);
                imgCell.appendChild(imgContainer);
            } else {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('img-container');
                const img = document.createElement('img');
                img.src = `/uploads/defaultimage.png`;
                img.classList.add('imgg');
                imgContainer.appendChild(img);
                imgCell.appendChild(imgContainer);
            }
            const updateeditcellcol = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => showEditForm(user);
            updateeditcellcol.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteUser(user.id);
            updateeditcellcol.appendChild(deleteButton);
        });
        updatePageNumbers();
    } catch (error) {
        console.error('Error', error);
    }
}

function updatePageNumbers() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    const range = 2; 
    let startPage, endPage;

    if (totalPages <= 5) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (curPage <= 3) {
            startPage = 1;
            endPage = 5;
        } else if (curPage + 2 >= totalPages) {
            startPage = totalPages - 4;
            endPage = totalPages;
        } else {
            startPage = curPage - 2;
            endPage = curPage + 2;
        }
    }

    let dotadded = false;

    
    if (curPage > 3) {
        const firstPage = document.createElement('button');
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => {
            curPage = 1;
            updateUserTable();
        });
        pageNumbers.appendChild(firstPage);

        
        if (!dotadded) {
            const dotshow = document.createElement('span');
            dotshow.textContent = '...';
            dotshow.style.color = 'white'; 
            dotshow.style.fontWeight = 'bold'; 
            dotshow.style.fontSize = '30px'; 
            dotshow.style.padding = '0px 10px'; 
            pageNumbers.appendChild(dotshow);
            dotadded = true;
        }
    }


    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.textContent = i;
        if (i === curPage) {
            pageNumber.disabled = true; 
            pageNumber.style.fontWeight = 'bold'; 
        }
        pageNumber.addEventListener('click', () => {
            curPage = i;
            updateUserTable();
        });
        pageNumbers.appendChild(pageNumber);
    }


    if (curPage < totalPages - 2) {

        if (!dotadded) {
            const dotshow = document.createElement('span');
            dotshow.textContent = '...';
            dotshow.style.color = 'white'; 
            dotshow.style.fontWeight = 'bold';
            dotshow.style.fontSize = '30px'; 
            dotshow.style.padding = '0px 10px'; 
            pageNumbers.appendChild(dotshow);
            dotadded = true;
        }

        const lastPage = document.createElement('button');
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => {
            curPage = totalPages;
            updateUserTable();
        });
        pageNumbers.appendChild(lastPage);
    }
    document.getElementById('prevButton').disabled = curPage === 1;
    document.getElementById('nextButton').disabled = curPage === totalPages;
}

nextbtn.addEventListener('click', () => {
    if (curPage < totalPages) {
        curPage++;
        updateUserTable();
    }
});

prevbtn.addEventListener('click', () => {
    if (curPage > 1) {
        curPage--;
        updateUserTable();
    }
});

InPut.addEventListener('input', () => {
    searchTerm = InPut.value;
    curPage = 1;
    updateUserTable();
});

function sortTable(column) {
    updateUserTable(column);
}

updateUserTable();
