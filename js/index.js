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
      filtered.sort((a,b) => {
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

        if (!user) return

        if (selectedUser?.id === user.id) {
            selectedUser = null
        } else {
            selectedUser = user
        }
        render()
    }
})

searchInput.addEventListener('input', function (e) {
    searchTerm = e.target.value

    render()
})

sortContainer.addEventListener('click', function (e) {
    const btn = e.target.closest('button')
    if(!btn) return 

    const id = btn.id
    
    if (id === 'asc') {
        selectedSort = 'asc'
    }
    if (id === 'desc') {
        selectedSort = 'desc'
    }
    render()
})