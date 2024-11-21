const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Set view engine to EJS
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create 'files' directory if it doesn't exist
const filesDir = './hisaab';
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Route for Home Page (List all files)
app.get('/', (req, res) => {
    fs.readdir(filesDir, (err, files) => {
        if (err) return res.status(500).send(err);
        res.render('index', { files: files });
    });
});

// Route for creating new 'Hisaab'
app.get('/create', (req, res) => {
    res.render('create');
});

// Route for saving new 'Hisaab'
app.post('/create', (req, res) => {
    const { hisaabTitle, hisaabDetails } = req.body;
    const currentDate = new Date();
    const fileNameBase = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    let fileName = `${fileNameBase}.txt`;
    let count = 1;

    // Check if the file exists and update the file name
    while (fs.existsSync(path.join(filesDir, fileName))) {
        fileName = `${fileNameBase}_(${count}).txt`;
        count++;
    }

    // Save data to file
    fs.writeFile(path.join(filesDir, fileName), hisaabDetails, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

// Route for editing a file
app.get('/edit/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    fs.readFile(path.join(filesDir, fileName), 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.render('edit', { fileName, data });
    });
});

// Route for updating the file after editing
app.post('/update/:fileName', (req, res) => {
    const { fileData } = req.body;
    const fileName = req.params.fileName;
    fs.writeFile(path.join(filesDir, fileName), fileData, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

// Route for viewing a file
app.get('/show/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    fs.readFile(path.join(filesDir, fileName), 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.render('show', { fileName, data });
    });
});

// Route for deleting a file
app.get('/delete/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    fs.unlink(path.join(filesDir, fileName), (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
