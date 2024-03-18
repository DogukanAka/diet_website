const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware ayarları
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa için route
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Hakkında sayfası için route


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




// Diğer sayfalar için route'lar eklenebilir

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Uygulama ${port} numaralı port üzerinde çalışıyor`);
});
