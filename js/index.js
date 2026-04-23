const btnLoad = document.querySelector('#loadBtn')
const statusMessage = document.querySelector('#status')
const userList = document.querySelector('#userList')

let loading = false
let error = null
let users = []
let selectedUser = null

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

    users.forEach((user) => {
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

            li.appendChild(div)
        }

        userList.appendChild(li)
    })
}

render()

btnLoad.addEventListener('click', function () {
    fetchUsers()
})

userList.addEventListener('click', function (e) {
    const li = e.target.closest('li')

    if (li) {
        const id = li.dataset.id
        const user = users.find((item) => item.id === Number(id))

        if(!user) return

        if (selectedUser?.id === user.id) {
            selectedUser = null
        } else {
            selectedUser = user
        }
        render()
    }
})