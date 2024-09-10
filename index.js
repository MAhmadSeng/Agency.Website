
const express = require ('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require ("bcryptjs")

const app = express();
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 

const uploadFolder = path.join(__dirname, 'uploads'); 
const fileuser = path.join(uploadFolder, 'users.json'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const fileimg = Date.now();
        cb(null, fileimg + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.get('/usersData', (req, res) => {
    fs.readFile(fileuser, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error');
        }
        try {
            const usersData = JSON.parse(data);
            res.json(usersData);

        } catch (error) {
            res.status(500).send('Error');
        }
    });
});
app.post('/users', upload.single('chooseFile'), (req, res) => {
    fs.readFile(fileuser, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }

        let usersData = [];
        try {
            usersData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error parsing users data');
        }

        const matchemail = usersData.find(user => user.email === req.body.email);
        if (matchemail) {
            return res.status(400).send('Email already exists');
        }

        let newId = 1;
        if (usersData.length > 0) {
            newId = Math.max(...usersData.map(user => user.id)) + 1;
        }

        const saltRounds = 10;
        bcrypt.hash(req.body.password, saltRounds, (err, hashPass) => {
            if (err) {
                return res.status(500).send('Error hashing password');
            }

            const newUser = {
                id: newId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashPass,
                chooseFile: req.file ? req.file.filename : null,
                createdAt: new Date(),
            };

            usersData.push(newUser);

            fs.writeFile(fileuser, JSON.stringify(usersData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error writing users file');
                }
                console.log('Added', newUser);
                res.status(201).send('User added successfully');
            });
        });
    });
});
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    fs.readFile(fileuser, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error');
        }
        try {
            let usersData = JSON.parse(data);
            usersData = usersData.filter(user => user.id !== userId);
            fs.writeFile(fileuser, JSON.stringify(usersData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error');
                }
                res.status(200).send('deleted successfully');
            });
        } catch (error) {
            res.status(500).send('Error');
        }
    });
});

app.put('/users/:id', upload.single('chooseFile'), async (req, res) => {
    const userId = parseInt(req.params.id);

    fs.readFile(fileuser, 'utf8', async (err, data) => {
        if (err) {
            return res.status(500).send('Error');
        }
        let usersData;
        try {
            usersData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error');
        }

        const user = usersData.find(user => user.id === userId);
        if (!user) {
            return res.status(404).send('User not found');
        }



        if (req.body.password && req.body.password !== user.password) {
            try {
                user.password = await bcrypt.hash(req.body.password, 10);
            } catch (error) {
                return res.status(500).send('Error in password');
            }
        }

        Object.assign(user, {
            firstName: req.body.firstName || user.firstName,
            lastName: req.body.lastName || user.lastName,
            email: req.body.email || user.email,
            password: user.password,
            chooseFile: req.file ? req.file.filename : user.chooseFile,
            updatedAt: new Date()
        });

        fs.writeFile(fileuser, JSON.stringify(usersData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error');
            }
            res.status(200).send('Updated successfully');
        });
    });
});

app.get('/usersSearch/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    fs.readFile(fileuser, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error');
        }

        let usersData;
        try {
            usersData = JSON.parse(data);
        } catch (error) {
            return res.status(500).send('Error');
        }

        const user = usersData.find(user => user.id === userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User notfound');
        }
    });
});

app.listen(8000, () => {
    console.log(`Running on port 8000`);
});
