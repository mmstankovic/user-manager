const container = document.querySelector('#container')
const btnLoad = document.querySelector('#loadBtn')
const statusMessage = document.querySelector('#status')
const userList = document.querySelector('#userList')
const searchInput = document.querySelector('#search')
const sortContainer = document.querySelector('#sort-container')

let loading = false
let error = null
let users = []
let selectedUser = null
let searchTerm = ''
let selectedSort = ''
let isEditing = false
let selectedUserToEdit = null

async function fetchUsers() {
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
    btnLoad.disabled = loading

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

            if(!selectedUserToEdit || selectedUserToEdit.id !== user.id) {
                const btnEdit = document.createElement('button')
                btnEdit.textContent = 'Edit'
                btnEdit.classList.add('edit-btn')

                div.appendChild(btnEdit)
            }

            li.appendChild(div)

            if(isEditing && selectedUserToEdit?.id === user.id) {
                const form = document.createElement('form')
                form.id = 'edit-form'

                form.addEventListener('submit', function(e) {
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
                btnCancel.classList.add('cancel-btn')

                const btnSave = document.createElement('button')
                btnSave.textContent = 'Save'
                btnSave.type = 'submit'
                btnSave.classList.add('save-btn')

                actionsDiv.appendChild(btnCancel)
                actionsDiv.appendChild(btnSave)

                form.appendChild(input)
                form.appendChild(actionsDiv)

                li.appendChild(form)
            }
        }

        userList.appendChild(li)
    })
}

render()

function updateUserEmail(val) {
    if(val.trim()=== '') return 

    users = users.map((user) => user.id === selectedUserToEdit.id ? {...user, email: val} : user)

    isEditing = false 
    selectedUserToEdit = null 

    render()
}

function cancelUpdateUserEmail() {
    isEditing = false 
    selectedUserToEdit = null

    render()
}

btnLoad.addEventListener('click', function () {
    fetchUsers()
})

userList.addEventListener('click', function (e) {
    const li = e.target.closest('li')

    if(!li) return

    if(e.target.closest('.cancel-btn')) {
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
    if(e.target.closest('#edit-form')) {
        return
    }

    const id = li.dataset.id
    const user = users.find((item) => item.id === Number(id))

    if (!user) return

    selectedUser = selectedUser?.id === user.id ? null : user
    
    render()
})

searchInput.addEventListener('input', function (e) {
    searchTerm = e.target.value

    render()
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