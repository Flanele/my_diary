const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const sequelize = require('./database');  
const Page = require('./Page');  
const User = require('./User');
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

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error('JWT_SECRET не определён в переменных окружения');
    process.exit(1);
}


sequelize.sync().then(() => console.log('db is ready'));

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Извлекаем токен после слова "Bearer" (до конца не понимаю, что это и зачем)

    if (token == null) return res.sendStatus(401);  // Если токена нет

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);  // Если токен недействителен
        req.user = user;  // Сохраняем пользователя в запросе для использования в других маршрутах
        next();  // Продолжаем выполнение
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        // Генерируем JWT токен
        const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

app.get('/diary', authenticateToken, async (req, res) => {
    try {
        const entries = await Page.findAll({
            where: { user_id: req.user.id } // Показываем только записи текущего пользователя
        });
        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving entries');
    }
});

app.get('/diary/:id', authenticateToken, async (req, res) => {
    const requestedId = parseInt(req.params.id);
    try {
        const entry = await Page.findOne({
            where: { id: requestedId, user_id: req.user.id } // Учитываем только записи текущего пользователя
        });
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

app.post('/diary', authenticateToken, async (req, res) => {
    const { title, text } = req.body;
    const encryptedText = encrypt(text);
    const entryTitle = title || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        // Запись создается от имени аутентифицированного пользователя
        const newEntry = await Page.create({ title: entryTitle, text: encryptedText, user_id: req.user.id });
        res.status(201).json(newEntry);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving entry');
    }
});


app.delete('/diary/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const entry = await Page.findOne({
            where: { id, user_id: req.user.id } // Удаление только своих записей
        });

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        await Page.destroy({ where: { id } });
        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting entry');
    }
});

app.put('/diary/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, text } = req.body;

    try {
        const entry = await Page.findOne({
            where: { id, user_id: req.user.id } // Проверяем, что запись принадлежит текущему пользователю
        });

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        if (title) entry.title = title;
        if (text) entry.text = encrypt(text);

        await entry.save();
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating entry');
    }
});

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalEntries = await Page.count({
            where: { user_id: req.user.id }
        });

        res.json({
            username: user.username,
            totalEntries: totalEntries
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving profile data');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
