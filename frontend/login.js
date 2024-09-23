import { openModalAndBlockScroll, closeModal } from './modal.js';

const loginBtn = document.querySelector('.header-nav__login-btn');
const loginDialog = document.querySelector('.login__dialog');

loginBtn.addEventListener('click', () => {
    openModalAndBlockScroll(loginDialog);
});

loginDialog.addEventListener('click', (e) => {
    if (e.target === loginDialog) {
        closeModal(loginDialog);
    }
});

// Обработка отправки формы логина
document.getElementById('login__form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    if(!username && !password) {
        username = 'Guest';
        password = '1234';
    }

    const success = await login(username, password);

    if (success) {
        closeModal(loginDialog); 
    } else {
        alert('Login failed. Please check your credentials.');
    }
});

export async function login(username, password) {
    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log('Token:', data.token); // Отладочный вывод
        console.log('Stored Token:', localStorage.getItem('token')); // Проверяем сохранение токена

        location.reload();

        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

