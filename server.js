const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./database');  
const Page = require('./Page');  
const fs = require('fs');
const PORT = 8000;

sequelize.sync().then(() => console.log('db is ready'));

app.use(cors());
app.use(express.json());

app.get('/diary', async (req, res) => {
    try {
        const entries = await Page.findAll();
        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving entries');
    }
});

app.get('/diary/:id', async (req, res) => {
    const requestedId = parseInt(req.params.id);
    try {
        const entry = await Page.findOne({ where: { id: requestedId } });
        if (entry) {
            res.status(200).json(entry);
        } else {
            res.status(404).json({ error: 'Entry not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving entry');
    }
});

app.post('/diary', async (req, res) => {
    const { title, text } = req.body;

    // Если заголовок не указан, используем текущую дату
    const entryTitle = title || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        const newEntry = await Page.create({
            title: entryTitle,
            text
        });
        res.status(201).json(newEntry);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving entry');
    }
});


app.delete('/diary/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const entry = await Page.findOne({ where: { id } });

    if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
    }

    await Page.destroy({ where: { id } });
    res.status(200).json({ message: 'Entry deleted successfully' });
});


app.put('/diary/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, text } = req.body;

    const entry = await Page.findOne({ where: { id } });

    if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
    }

    if (title) entry.title = title;
    if (text) entry.text = text;

    entry.updated = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });

    await entry.save();
    res.status(200).json(entry);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
