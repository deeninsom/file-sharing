const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const path = require('path');
const { sequelize } = require("./models");
const db = require("./models");
const PORT = process.env.PORT || 8081;
const LOCAL_IP = '192.168.60.48' || '127.0.0.1';
const fs = require('fs')


// ----- start multer ----------
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });
// ----- start multer ----------

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json());

app.get('/', async function (req, res) {
    const data = await db.files.findAll()
    res.render('page/index', {
        data: data
    });
});

app.post('/upload', upload.single('file'), async function (req, res) {
    const { originalname, path } = req.file;
    await db.files.create({
        origin_name: originalname,
        path: path
    });
    res.redirect('/');
});

app.delete(`/delete-file/:id`, async function (req, res) {
    const findFile = await db.files.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!findFile) {
        return res.status(404).json({ error: 'File not found on database' });
    }

    const filePath = path.join(__dirname, findFile.path);
    fs.unlinkSync(filePath);

    if(!filePath){
        return res.status(404).json({ error: 'File not found on directory' });
    }

    await db.files.destroy({
        where: {
            id: findFile.id
        }
    });

    res.redirect('/');

})

app.use('/downloads', express.static('file_database'))

// (async () => {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//     await sequelize.sync({ force: false });
//     console.log('Migration completed successfully.');
//     // process.exit(0);
//   })();

app.listen(PORT, LOCAL_IP, () => {
    console.log(`⚡️[server]: Server is running at http://${LOCAL_IP}:${PORT}`);
});
