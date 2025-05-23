const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const path = require('path');
const { sequelize } = require("./models");
const db = require("./models");
const PORT = process.env.PORT || 8081;
const LOCAL_IP = process.env.LOCAL_IP;
const fs = require('fs')
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const bcrypt = require('bcrypt')

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
    const data = await db.files.findAll({
        order: [['createdAt', 'DESC']]
    })
    res.render('page/index', {
        data: data,
    });
});

app.get('/image/:id', async function (req, res) {
    const token = req.query.token
    const baseUrl = req.url

    if (!token) {
        return res.json('not authorize')
    }

    const tokenMatch = await bcrypt.compareSync(token);

    const today = cekWaktu('2024-02-21T04:44:36.757Z')

    res.json({
        token: token,
        time: time,
        url: req.url,
        baseUrl: baseUrl.split('?')[0]
    })
});

function cekWaktu(waktuAwal) {
    const waktuSekarang = new Date();
    const selisihWaktu = waktuSekarang - waktuAwal;
    const selisihJam = selisihWaktu / (1000 * 60 * 60);

    if (selisihJam > 1) {
        console.log("Unauthorized");
        return false
    }
    return true

}

app.get('/preview/:id', async function (req, res) {
    try {
        const file = await db.files.findOne({
            where: { id: req.params.id }
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const ext = path.extname(file.origin_name).toLowerCase();
        const filePath = path.join(__dirname, file.path);

        // Validasi file ada di sistem
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        // Tentukan content-type berdasarkan ekstensi
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.zip': 'application/zip'
        };

        const contentType = contentTypes[ext];

        if (!contentType) {
            return res.status(400).json({ error: 'Unsupported file type for preview' });
        }

        // Set header dan kirim file
        res.setHeader('Content-Type', contentType);
        res.sendFile(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
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

    if (!filePath) {
        return res.status(404).json({ error: 'File not found on directory' });
    }

    await db.files.destroy({
        where: {
            id: findFile.id
        }
    });

    res.redirect('/');

})

app.use('/downloads', express.static('uploads'))

app.post('/write-txt', async function (req, res) {
    const { text } = req.body
    const word = tokenizer.tokenize(text)
    const fileName = `${word.length > 0 ? word[0] : 'file'}.txt`
    const filePath = path.join(__dirname, 'uploads', `${word.length > 0 ? word[0] : 'file'}.txt`);
    fs.writeFileSync(filePath, text)

    await db.files.create({
        origin_name: fileName,
        path: `uploads/${fileName}`
    })

    res.redirect('/');
})

//  (async () => {
//      await sequelize.authenticate();
//      console.log('Connection has been established successfully.');
//      await sequelize.sync({ force: false });
//      console.log('Migration completed successfully.');
//      process.exit(0);
//    })();


// try {
//      sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//           sequelize.sync({ force: false });
//      console.log('Migration completed successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }

app.listen(PORT, LOCAL_IP, () => {
    console.log(`⚡️[server]: Server is running at http://${LOCAL_IP}:${PORT}`);
});
