const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const app = express();
const port = 3000;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "diet_website",
    password: "5858",
    port: 5433,
});

client.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa için route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// İletişim sayfası için route
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Galeri sayfası için route
app.get('/gallery.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});

// Tek hizmetler sayfası için route
app.get('/single-services.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'single-services.html'));
});

// Tek standart sayfası için route
app.get('/single-standard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'single-standard.html'));
});

// Tek video sayfası için route
app.get('/single-video.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'single-video.html'));
});

// Başarılı mağazalar sayfası için route
app.get('/sucess-stores.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sucess-stores.html'));
});

// giriş sayfası için route
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// kayıt ol sayfası için route
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});



// Eğer endpoint belirtilmemişse index.html'i gönder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// Kayıt olma işlemi
app.post('/signup', async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;
    if (password !== password_confirmation) {
        return res.send('<script>alert("Passwords do not match"); window.location.href = "/signup.html";</script>');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Kontrol etmek için e-posta adresine sahip kullanıcı var mı?
        const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.send('<script>alert("Email address already exists"); window.location.href = "/signup.html";</script>');
        }

        // Eğer yoksa yeni kullanıcıyı ekle
        await client.query('INSERT INTO users (name, email, password, password_confirmation) VALUES ($1, $2, $3, $4)', [name, email, hashedPassword, password_confirmation]);
        res.send('<script>alert("User created"); window.location.href = "/login.html";</script>');
    } catch (err) {
        res.send('<script>alert("Failed to create user"); window.location.href = "/signup.html";</script>');
    }
});

// Giriş yapma işlemi

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            // Giriş başarılı
            // Pop-up mesajı göster ve ana sayfaya yönlendir
            res.send('<script>alert("Login successful"); window.location.href = "/";</script>');
        } else {
            // Hatalı şifre girişi
            res.send('<script>alert("Incorrect password"); window.location.href = "/login.html";</script>');
        }
    } else {
        // Kullanıcı bulunamadı
        res.send('<script>alert("User not found"); window.location.href = "/login.html";</script>');
    }
});




// Diğer sayfalar için route'lar eklenebilir

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Uygulama ${port} numaralı port üzerinde çalışıyor`);
});
