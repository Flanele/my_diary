async function fetchUserProfile() {
    const token = localStorage.getItem('token');
    const accountGreetings = document.querySelector('.account__greetings');
    const totalEntriesElement = document.querySelector('.account-info__total');

    if (!token) {
        accountGreetings.textContent = 'Please log in to access your account.';
        totalEntriesElement.textContent = '';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Динамически выводим имя пользователя и количество записей
            accountGreetings.textContent = `Hello, ${data.username}!`;
            totalEntriesElement.textContent = `Total diary entries: ${data.totalEntries}`;
        } else {
            // Если токен невалиден, выводим сообщение
            accountGreetings.textContent = 'Please log in to access your account.';
            totalEntriesElement.textContent = '';
            localStorage.removeItem('token'); // Удаляем невалидный токен
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        accountGreetings.textContent = 'Error loading profile. Please try again later.';
    }
}

document.addEventListener('DOMContentLoaded', fetchUserProfile);

const logoutBtn = document.querySelector('.logout');

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    
    window.location.href = 'index.html'; 
});