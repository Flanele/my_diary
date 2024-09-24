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

document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();

    // Проверяем сохранённую тему и применяем её
    const savedTheme = localStorage.getItem('theme'); // Получаем значение из localStorage
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme'); // Применяем темную тему
    }

    const settingsButton = document.querySelector('.settings');
    const settingsDropdown = document.querySelector('.settings-dropdown');
    const themeToggleButton = document.querySelector('.theme-toggle');

    settingsButton.addEventListener('click', (event) => {
        event.stopPropagation(); 
        settingsDropdown.classList.toggle('hidden');
    });

    themeToggleButton.addEventListener('click', (event) => {
        event.stopPropagation();  
        const isDarkTheme = document.body.classList.toggle('dark-theme'); // Переключаем класс dark-theme
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');  // Сохраняем текущее состояние темы
        changeThemeOfEditor(isDarkTheme);  
    });

    document.addEventListener('click', (event) => {
        if (!settingsDropdown.contains(event.target) && event.target !== settingsButton) {
            settingsDropdown.classList.add('hidden');  
        }
    });
});

const logoutBtn = document.querySelector('.logout');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html'; 
});
