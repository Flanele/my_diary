import { openModalAndBlockScroll, closeModal } from './modal.js';
import { login } from './login.js';

// Переменные для управления модальными окнами
const deleteBtn = document.querySelector('.page__delete-btn');
const confirmationDialog = document.querySelector('.page__dialog-confirmation');
const deleteConfirmation = document.querySelector('.page__delete-confirmation-btn');
const backToEntryBtn = document.querySelector('.page__close-modal');

// Переменные для модального окна редактирования
const editBtn = document.querySelector('.page__edit-btn');
const editDialog = document.querySelector('.diary-edit__dialog');
const editCloseBtn = document.querySelector('.diary-edit__close-modal');
const editSaveBtn = document.querySelector('.diary-edit__save-btn');


document.addEventListener('DOMContentLoaded', async () => {

    // Показываем прелоадер перед началом загрузки данных
    const preloader1 = document.getElementById('preloader1');
    preloader1.classList.remove('hidden');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); 

    if (id) {
        try {
            const data = await getDiaryPage(id); 
            document.querySelector('.title').textContent = data.title;
            document.querySelector('.date').textContent = new Date(data.createdAt).toLocaleDateString('ru-RU'); // Формат 20.09.2024
            document.querySelector('.time').textContent = new Date(data.createdAt).toLocaleTimeString('ru-RU');
            document.querySelector('.text').innerHTML = data.text;
            if (data.updatedAt) {
                document.querySelector('.updated').textContent = `Updated: ${new Date(data.updatedAt).toLocaleDateString('ru-RU')}`; // Формат 20.09.2024
            } else {
                document.querySelector('.updated').textContent = '';
            }
        } catch (error) {
            console.error('Error fetching diary page:', error);
        } finally {
            // Скрываем прелоадер после того, как данные загружены и страница обновлена
            preloader1.classList.add('hidden');
        }
    } else {
        console.error('ID parameter not found in URL');
        preloader1.classList.add('hidden');
    }
});

async function getDiaryPage(id) {
    const url = `http://localhost:8000/diary/${id}`;
    const token = localStorage.getItem('token'); // Получаем токен из localStorage
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}` // Добавляем заголовок авторизации
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}


editBtn.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        try {
            const data = await getDiaryPage(id);
            document.querySelector('.diary-edit__title-input').value = data.title;
            tinymce.get('text').setContent(data.text);
            openModalAndBlockScroll(editDialog);
        } catch (error) {
            console.error('Error fetching diary page:', error);
        }
    }
});

editCloseBtn.addEventListener('click', () => closeModal(editDialog));
deleteBtn.addEventListener('click', () => openModalAndBlockScroll(confirmationDialog));
backToEntryBtn.addEventListener('click', () => closeModal(confirmationDialog));

deleteConfirmation.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        console.error('ID parameter is missing!');
        alert('ID parameter is missing!');
        return;
    }

    const url = `http://localhost:8000/diary/${id}`;
    console.log(`Sending DELETE request to URL: ${url}`); // Debugging line

    const token = localStorage.getItem('token'); // Получаем токен из localStorage

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Добавляем заголовок авторизации
            }
        });

        if (response.ok) {
            alert('Entry deleted successfully!');
            window.location.href = 'index.html'; 
        } else {
            throw new Error(`Error deleting entry: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error deleting entry.');
    }
});

editSaveBtn.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const title = document.querySelector('.diary-edit__title-input').value;
    const text = tinymce.get('text').getContent(); 

    if (!id) {
        console.error('ID parameter is missing!');
        alert('ID parameter is missing!');
        return;
    }

    if (!title || !text) {
        alert('Please fill in all fields.');
        return;
    }

    const url = `http://localhost:8000/diary/${id}`;
    const updatedData = {
        title,
        text,
        updatedAt: new Date()
    };

    const token = localStorage.getItem('token'); // Получаем токен из localStorage

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Добавляем заголовок авторизации
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('Entry updated successfully!');
            closeModal(editDialog);
            window.location.reload(); 
        } else {
            throw new Error(`Error updating entry: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error updating entry.');
    }
});
