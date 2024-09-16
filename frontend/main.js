import { openModalAndBlockScroll, closeModal } from './modal.js';

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

document.addEventListener('DOMContentLoaded', () => {
    // Получаем параметр страницы из URL
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page) {
        getDiaryPage(page).then(data => {
            // Обновляем элементы на странице
            document.querySelector('.title').textContent = data.title;
            document.querySelector('.date').textContent = data.date;
            document.querySelector('.time').textContent = data.time;
            document.querySelector('.text').textContent = data.text;
            if (data.updated) {
                document.querySelector('.updated').textContent = `Updated: ${data.updated}`;
            } else {
                document.querySelector('.updated').textContent = '';
            }
        }).catch(error => {
            console.error('Error fetching diary page:', error);
        });
    } else {
        console.error('Page parameter not found in URL');
    }
});


async function getDiaryPage(page) {
    const url = `http://localhost:8000/diary/${page}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}


editBtn.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page) {
        const data = await getDiaryPage(page);
        // Заполняем форму значениями из текущей записи
        document.querySelector('.diary-edit__title-input').value = data.title;
        document.querySelector('.diary-edit__text-input').value = data.text;
        openModalAndBlockScroll(editDialog);
    }
});

editCloseBtn.addEventListener('click', () => closeModal(editDialog));
deleteBtn.addEventListener('click', () => openModalAndBlockScroll(confirmationDialog));
backToEntryBtn.addEventListener('click', () => closeModal(confirmationDialog));

deleteConfirmation.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    if (!page) {
        console.error('Page parameter is missing!');
        alert('Page parameter is missing!');
        return;
    }

    const url = `http://localhost:8000/diary/${page}`;
    console.log(`Sending DELETE request to URL: ${url}`); // Debugging line

    try {
        const response = await fetch(url, {
            method: 'DELETE'
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

// Обработчик для сохранения изменений
editSaveBtn.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const title = document.querySelector('.diary-edit__title-input').value;
    const text = document.querySelector('.diary-edit__text-input').value;

    if (!page) {
        console.error('Page parameter is missing!');
        alert('Page parameter is missing!');
        return;
    }

    if (!title || !text) {
        alert('Please fill in all fields.');
        return;
    }

    const url = `http://localhost:8000/diary/${page}`;
    const updatedData = {
        title,
        text,
        updated: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) // Обновляем дату и время
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('Entry updated successfully!');
            closeModal(editDialog);
            window.location.reload(); // Обновляем страницу для отображения изменений
        } else {
            throw new Error(`Error updating entry: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error updating entry.');
    }
});
