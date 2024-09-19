import { openModalAndBlockScroll, closeModal } from './modal.js';

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
    try {
        preloader2.classList.remove('hidden');
        
        const response = await fetch('http://localhost:8000/diary');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const entries = await response.json();
        generateLinks(entries);

    } catch (error) {
        console.error('Error fetching diary entries:', error);
    } finally {
        preloader2.classList.add('hidden');
    }
}

function generateLinks(entries) {
    const container = document.getElementById('links-container');

    entries.forEach(entry => {
        const row = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.className = 'date'; 
        dateCell.textContent = entry.date; 
        row.appendChild(dateCell);

        const linkCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `page.html?page=${entry.page}`;
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
        const response = await fetch('http://localhost:8000/diary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title, 
                text, 
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            })
        });

        if (response.ok) {
            alert('Entry saved successfully!');
            closeModal(dialog); 
            location.reload(); 
        } else {
            alert('Error saving entry.');
        }
    } else {
        alert('Please fill in the text field.');
    }
});
