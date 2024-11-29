document.addEventListener('DOMContentLoaded', () => {
    const journalForm = document.getElementById('journal-form');
    const journalText = document.getElementById('journal-text');
    const journalMood = document.getElementById('journal-mood');
    const entriesDiv = document.getElementById('entries');
    const logoutBtn = document.getElementById('logout');

    // Handle Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Authenticate user
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }

    // Fetch user info
    let userEmail = '';
    fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` },
    })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                userEmail = data.user.email;
                loadEntries();
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(() => {
            window.location.href = 'index.html';
        });

    // Load journal entries
    function loadEntries() {
        fetch('/api/journals', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.entries) {
                    entriesDiv.innerHTML = '';
                    data.entries.forEach(entry => {
                        const entryDiv = document.createElement('div');
                        entryDiv.classList.add('p-4', 'bg-white', 'rounded', 'shadow');
                        entryDiv.innerHTML = `
                <p class="text-sm text-gray-500">${new Date(entry.timestamp).toLocaleString()}</p>
                <p class="mt-2">${entry.mood}</p>
                <p class="mt-1">${entry.text}</p>
              `;
                        entriesDiv.appendChild(entryDiv);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching journal entries:', error);
            });
    }

    // Handle journal submission
    journalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = journalText.value.trim();
        const mood = journalMood.value;

        if (text === '' || mood === '') return;

        try {
            const res = await fetch('/api/journals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, mood }),
            });

            const data = await res.json();

            if (res.ok) {
                journalText.value = '';
                journalMood.value = '';
                loadEntries();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error saving journal entry:', error);
        }
    });
});
