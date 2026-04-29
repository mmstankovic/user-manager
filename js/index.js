const backdrop = document.querySelector('#backdrop')
const container = document.querySelector('#container')
const btnLoad = document.querySelector('#loadBtn')
const statusMessage = document.querySelector('#status')
const userList = document.querySelector('#userList')
const searchInput = document.querySelector('#search')
const sortContainer = document.querySelector('#sort-container')
const addUserForm = document.querySelector('#add-user-form')

let loading = false
let error = null
let users = []

try {
    const stored = localStorage.getItem('user-list')
    users = stored ? JSON.parse(stored) : []
} catch (err) {
    console.error('Failed to parse users from localStorage')
    users = []
}
let selectedUser = null
let searchTerm = ''
let selectedSort = ''
let isEditing = false
let selectedUserToEdit = null
let selectedToDelete = null
let toastMessage = ''

async function fetchUsers() {
    if(users.length > 0) return 

    loading = true
    error = null

    render()

    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users')

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Fetching users failed!')
        }

        users = data
        saveUsersToStorage()

    } catch (err) {
        error = err.message
    } finally {
        loading = false
        render()
    }
}

function render() {
    userList.innerHTML = ''
    statusMessage.textContent = ''
    backdrop.innerHTML = ''
    btnLoad.disabled = loading

    btnLoad.style.display = users.length === 0 ? 'block' : 'none'

    if (loading) {
        statusMessage.textContent = 'Loading...'
        return
    }
    if (error) {
        statusMessage.textContent = error
        return
    }

    let filtered = [...users]

    const term = searchTerm.trim().toLowerCase()

    if (term) {
        filtered = filtered.filter((user) => user.name.toLowerCase().includes(term))
    }

    if (selectedSort) {
        filtered.sort((a, b) => {
            return selectedSort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        })
    }

    sortContainer.querySelectorAll('button').forEach((btn) => {
        btn.classList.toggle('active', btn.id === selectedSort)
    })

    if (selectedUser && !filtered.some(u => u.id === selectedUser.id)) {
        selectedUser = null
    }

    filtered.forEach((user) => {
        const li = document.createElement('li')
        li.textContent = `${user.name} - ${user.email}`
        li.dataset.id = user.id

        if (selectedUser?.id === user.id) {
            li.classList.add('selected')

            const div = document.createElement('div')
            const phone = document.createElement('p')
            phone.textContent = user.phone

            const website = document.createElement('p')
            website.textContent = user.website


            div.appendChild(phone)
            div.appendChild(website)

            const divActions = document.createElement('div')
            divActions.classList.add('user-actions')

            if (!selectedUserToEdit || selectedUserToEdit.id !== user.id) {
                const btnEdit = document.createElement('button')
                btnEdit.textContent = 'Edit'
                btnEdit.classList.add('edit-btn')

                divActions.appendChild(btnEdit)
            }

            const btnDelete = document.createElement('button')
            btnDelete.textContent = 'Delete'
            btnDelete.classList.add('delete-btn')

            divActions.appendChild(btnDelete)
            div.appendChild(divActions)

            li.appendChild(div)

            if (isEditing && selectedUserToEdit?.id === user.id) {
                li.appendChild(createEditForm(user))
            }
        }

        userList.appendChild(li)
    })

    if (selectedToDelete) {
        renderDeleteModal()
    }

    document.querySelectorAll('.toast').forEach(t => t.remove())

    if (toastMessage) {
        const toast = document.createElement('div')
        toast.textContent = toastMessage
        toast.classList.add('toast')

        document.body.appendChild(toast)
    }
}

render()

function createEditForm(user) {
    const form = document.createElement('form')
    form.id = 'edit-form'

    form.addEventListener('submit', function (e) {
        e.preventDefault()

        const input = e.target.querySelector('input')

        updateUserEmail(input.value)

        input.value = ''
    })

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Update email'
    input.id = 'update-email'
    input.value = user.email

    const actionsDiv = document.createElement('div')

    const btnCancel = document.createElement('button')
    btnCancel.textContent = 'Cancel'
    btnCancel.type = 'button'
    btnCancel.classList.add('cancel-btn')

    const btnSave = document.createElement('button')
    btnSave.textContent = 'Save'
    btnSave.type = 'submit'
    btnSave.classList.add('save-btn')

    actionsDiv.append(btnCancel, btnSave)
    form.append(input, actionsDiv)

    return form
}

function renderDeleteModal() {
    const modal = document.createElement('div')
    modal.classList.add('modal')

    const title = document.createElement('h3')
    title.textContent = 'Delete user'
    modal.prepend(title)

    const msg = document.createElement('p')
    msg.textContent = 'Are you sure you want to delete this user?'
    modal.appendChild(msg)

    const actions = document.createElement('div')
    actions.classList.add('modal-actions')

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.classList.add('cancel-btn')

    const confirmBtn = document.createElement('button')
    confirmBtn.textContent = 'Ok'
    confirmBtn.classList.add('confirm-btn')

    actions.appendChild(cancelBtn)
    actions.appendChild(confirmBtn)

    modal.appendChild(actions)
    backdrop.appendChild(modal)
}

function saveUsersToStorage() {
    localStorage.setItem('user-list', JSON.stringify(users))
}

function addNewUser(name, email) {
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone: 'N/A',
        website: 'N/A'
    }

    users = [newUser, ...users]
    saveUsersToStorage()

    showToast('✅ User created')
}

function updateUserEmail(val) {
    if (val.trim() === '') return

    users = users.map((user) => user.id === selectedUserToEdit.id ? { ...user, email: val } : user)

    isEditing = false
    selectedUserToEdit = null
    saveUsersToStorage()

    showToast('✏️ User updated')
}

function cancelUpdateUserEmail() {
    isEditing = false
    selectedUserToEdit = null

    render()
}

function deleteUserFromList() {
    users = users.filter((item) => item.id !== selectedToDelete)
    saveUsersToStorage()

    if (selectedUser?.id === selectedToDelete) {
        selectedUser = null
    }

    selectedToDelete = null

    showToast('🗑️ User deleted')
}

function cancelDeleteUser() {
    selectedToDelete = null
    render()
}

let toastTimeout

function showToast(message) {
    toastMessage = message

    clearTimeout(toastTimeout)

    toastTimeout = setTimeout(() => {
        toastMessage = ''

        render()
    }, 3000)

    render()
}

btnLoad.addEventListener('click', function () {
    fetchUsers()
})

userList.addEventListener('click', function (e) {
    const li = e.target.closest('li')

    if (!li) return

    if (e.target.closest('.cancel-btn')) {
        cancelUpdateUserEmail()
        return
    }

    if (e.target.closest('.edit-btn')) {
        const id = li.dataset.id
        const user = users.find((item) => item.id === Number(id))
        isEditing = true
        selectedUserToEdit = user

        render()
        return
    }
    if (e.target.closest('.delete-btn')) {
        const id = li.dataset.id
        const userToDelete = users.find((user) => user.id === Number(id))

        selectedToDelete = userToDelete.id
        render()
    }

    if (e.target.closest('#edit-form')) {
        return
    }

    const id = li.dataset.id
    const user = users.find((item) => item.id === Number(id))

    if (!user) return

    selectedUser = selectedUser?.id === user.id ? null : user

    render()
})

let timeout

searchInput.addEventListener('input', function (e) {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
        searchTerm = e.target.value

        render()
    }, 200)
})

sortContainer.addEventListener('click', function (e) {
    const btn = e.target.closest('button')
    if (!btn) return

    const id = btn.id

    if (id === 'asc') {
        selectedSort = 'asc'
    }
    if (id === 'desc') {
        selectedSort = 'desc'
    }
    render()
})

backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) {
        cancelDeleteUser()
        return
    }
    if (e.target.closest('.confirm-btn')) {
        deleteUserFromList()
        return
    }
    if (e.target.closest('.cancel-btn')) {
        cancelDeleteUser()
    }
})

addUserForm.addEventListener('submit', function (e) {
    e.preventDefault()

    const name = e.target.name.value.trim()
    const email = e.target.email.value.trim()

    if (!name || !email) return

    addNewUser(name, email)

    e.target.reset()
})