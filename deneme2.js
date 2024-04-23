const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

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
            // Giriş başarılı, access token oluştur
            const accessToken = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '3h' });

            // Access token'i local storage'a sakla
            // Örneğin, bir cookie olarak saklayabilirsiniz
            res.cookie('access_token', accessToken, { httpOnly: false, maxAge: 10800000 });


            // Kullanıcı verilerini local_storage_data tablosuna ekleyin
            const insertUserQuery = 'INSERT INTO local_storage_data (user_id, name, email, password, access_token) VALUES ($1, $2, $3, $4, $5)';
            await client.query(insertUserQuery, [user.id, user.name, user.email, user.password, accessToken]);



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

// ... Önceki kodlarınız ...

app.get('/logout', async (req, res) => {
    // Cookie'den JWT token'ını al
    const token = req.cookies['access_token'];
    if (token) {
        try {
            // Token'ı doğrulayarak kullanıcının bilgilerini çıkar
            const decoded = jwt.verify(token, 'secret_key');
            // Kullanıcının çıkış zamanını veritabanında güncelle
            await client.query('UPDATE users SET last_logout = NOW() WHERE email = $1', [decoded.email]);

            // Kullanıcının cookie'sini silerek oturumu sonlandır
            res.cookie('access_token', '', { expires: new Date(0) });

            res.redirect('/login.html');
        } catch (error) {
            // Token doğrulama hatası veya başka bir sunucu hatası olabilir
            console.error('Logout error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // Kullanıcı zaten giriş yapmamış
        res.redirect('/login.html');
    }
});

// ... Diğer route'larınız ve sunucuyu başlatma kodu ...



// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Uygulama ${port} numaralı port üzerinde çalışıyor`);
});
