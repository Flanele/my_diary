const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const PORT = 8000;

app.use(cors());
app.use(express.json());

const defaultDiary = [
    {
        title: 'First Title',
        date: '14.09.2024',
        time: '17:04',
        text: 'This is my first post.',
        page: 1,
        updated: null 
    },
    {
        title: 'Second Title',
        date: '15.09.2024',
        time: '10:30',
        text: 'This is my second post.',
        page: 2,
        updated: null 
    }
];

// Проверяем, существует ли файл
const diaryFile = 'diary.json';
if (!fs.existsSync(diaryFile)) {
    // Если файл не существует, создаем его с дефолтными записями
    fs.writeFileSync(diaryFile, JSON.stringify(defaultDiary, null, 3));
}

const data = fs.readFileSync(diaryFile);
const entries = JSON.parse(data);
console.log(entries);

app.get('/diary', (req, res) => {
    res.status(200).json(entries);
});

app.get('/diary/:page', (req, res) => {
    const page = parseInt(req.params.page);
    const entry = entries.find(diaryEntry => diaryEntry.page === page);
    if (entry) {
        res.status(200).json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

app.post('/diary', (req, res) => {
    const newEntry = req.body;

    // Находим максимальный номер страницы среди всех записей
    const maxPage = entries.reduce((max, entry) => entry.page > max ? entry.page : max, 0);
    
    newEntry.page = maxPage + 1; // Назначаем следующий номер страницы
    newEntry.updated = null;
    entries.push(newEntry);
    fs.writeFileSync(diaryFile, JSON.stringify(entries, null, 3)); 
    res.status(201).json(newEntry);
});


app.delete('/diary/:page', (req, res) => {
    const page = parseInt(req.params.page);
    const index = entries.findIndex(diaryEntry => diaryEntry.page === page);

    if (index !== -1) {
        entries.splice(index, 1); // Удаляет запись из массива
        fs.writeFileSync(diaryFile, JSON.stringify(entries, null, 3)); 
        res.status(200).json({ message: 'Entry deleted successfully' });
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

app.put('/diary/:page', (req, res) => {
    const page = parseInt(req.params.page);
    const { title, text } = req.body;

    const index = entries.findIndex(diaryEntry => diaryEntry.page === page);

    if (index !== -1) {
        const entry = entries[index];
        if (title) entry.title = title;
        if (text) entry.text = text;

        // Обновляем дату и время редактирования
        entry.updated = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });

        fs.writeFileSync(diaryFile, JSON.stringify(entries, null, 3));
        res.status(200).json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
