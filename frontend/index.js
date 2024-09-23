import { openModalAndBlockScroll, closeModal } from './modal.js';
import { login } from './login.js';

const dialog = document.querySelector('.diary__dialog');
const openBtn = document.querySelector('.diary__adding-entry-btn');
const closeBtn = document.querySelector('.diary__close-modal');
const saveBtn = document.querySelector('.diary__save-entry');


document.addEventListener('DOMContentLoaded', () => {
    fetchDiaryEntries();
});

document.querySelector('#title').placeholder = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

async function fetchDiaryEntries() {
    const preloader2 = document.getElementById('preloader2');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');

    if (preloader2) {
        preloader2.classList.remove('hidden');
    }

    try {
        const response = await fetch('http://localhost:8000/diary', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('You need to log in to view the diary entries.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please log in to continue reading.');
            } else {
                throw new Error(`Error fetching entries: ${response.status}`);
            }
        }

        const entries = await response.json();
        generateLinks(entries);

    } catch (error) {
        console.error('Error fetching diary entries:', error);
        // Выводим сообщение об ошибке на страницу
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        if (preloader2) {
            preloader2.classList.add('hidden');
        }
    }
}


function generateLinks(entries) {
    const container = document.getElementById('links-container');

    entries.forEach(entry => {
        const row = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.className = 'date'; 
        dateCell.textContent = new Date(entry.createdAt).toLocaleDateString('ru-RU'); 
        row.appendChild(dateCell);

        const linkCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `page.html?id=${entry.id}`; // Изменено с page на id
        link.textContent = entry.title; 
        link.className = 'diary-link';
        linkCell.appendChild(link);
        row.appendChild(linkCell);

        container.insertBefore(row, container.firstChild);
    });
}

openBtn.addEventListener('click', () => openModalAndBlockScroll(dialog));
closeBtn.addEventListener('click', () => closeModal(dialog));

saveBtn.addEventListener('click', async () => {
    let title = document.querySelector('#title').value;
    const text = tinymce.get('text').getContent();

    if (!title) {
        title = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (text) {
        try {
            const response = await fetch('http://localhost:8000/diary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Добавляем токен
                },
                body: JSON.stringify({
                    title, 
                    text
                })
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('You must be logged in to save entries.');
            }

            if (response.ok) {
                alert('Entry saved successfully!');
                closeModal(dialog);
                location.reload();
            } else {
                throw new Error('Error saving entry.');
            }
        } catch (error) {
            alert(error.message); // Выводим сообщение об ошибке
        }
    } else {
        alert('Please fill in the text field.');
    }
});
