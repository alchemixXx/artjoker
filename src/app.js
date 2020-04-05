const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');

const { UsersSchema } = require('./models/users.schema');
const { getAllUsers } = require('./utils');


const connectionUrl = process.env.DB_HOST || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || '/artjocker';
const dbPath = connectionUrl + DB_NAME;

mongoose.connect(dbPath, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

const UsersModel = mongoose.model('users', UsersSchema);

const app = express();
const port = process.env.PORT || 3000;

app.use(
  fileUpload({
    createParentPath: true,
  }),
);

// Routes

app.get('/users', (_, res) => {
  UsersModel.find()
    .then((data) => {
      const results = getAllUsers(data);

      res.send({ results });
    })
    .catch((err) => res.send({ err }));
});

app.post('/upload-file', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      let file = req.files.file;
      if (file.mimetype !== 'text/csv') {
        res.send({
          status: false,
          message: 'Wrong type of file',
        });
      }

      // Move file to special folder
      file.mv('./uploads/' + file.name);

      const filePath = path.join('./uploads/', file.name);

      // Parse file in stream
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const { UserName, FirstName, LastName, Age } = data;

          // for every line create Object with required fields
          const newUser = new UsersModel({
            UserName,
            FirstName,
            LastName,
            Age,
          });

          // save Object to db
          newUser
            .save()
            .then((data) => console.dir({ status: 'user saved', data: data }))
            .catch((err) => console.dir({ err: 'Something went wrong', msg: err }));
        })
        .on('end', () => {
          console.log('done');
        });

      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/download', (_, res) => {
  const fileName = path.join(__dirname, './downloads/users.csv');
  // check if file is already exists
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
  }

  // get all reacords from db
  UsersModel.find()
    .then(async (data) => {
      // clean up useles data
      const results = getAllUsers(data);
      const csv = new ObjectsToCsv(results);
      // save cleaned up data to temp file
      await csv.toDisk(fileName);

      // send temp file to the user
      res.sendFile(path.join(__dirname, './downloads/users.csv'));
    })
    .catch((err) => res.send({ err }));
});

app.get('*', (_, res) => {
  res.send({
    title: '404',
    message: 'page not found, sorry',
  });
});

// Run the server
app.listen(port, () => {
  console.log(`Server started at port ${port}.`);
});
