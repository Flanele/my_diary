const express = require('express');
const cors = require('cors');
const app = express();
const sequelize = require('./database');  
const Page = require('./Page');  
const PORT = 8000;

require('dotenv').config();
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = 16;

if (ENCRYPTION_KEY.length !== 64) {
    console.error('Ошибка: Ключ шифрования должен быть длиной 64 символа в hex-формате (32 байта)');
    process.exit(1);
}

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);  
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv); 
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');  
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts[0], 'hex');
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
}

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
            const decryptedText = decrypt(entry.text);
            res.status(200).json({ ...entry.toJSON(), text: decryptedText });
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
    const encryptedText = encrypt(text);
    const entryTitle = title || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        const newEntry = await Page.create({ title: entryTitle, text: encryptedText });
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
    if (text) entry.text = encrypt(text);

    await entry.save();
    res.status(200).json(entry);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
