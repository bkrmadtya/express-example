const express = require('express');
const app = express();
const Joi = require('joi');
const bcrypt = require('bcrypt');

const users = [
  {
    id: 1,
    email: 'karki@bikram.com',
    password: 'asdfasdf'
  }
];

const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('----');

  next();
};

app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send(users);
});

app.post('/register', async (req, res) => {
  const body = req.body;
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .required()
  };

  const result = Joi.validate(body, schema);
  if (result.error) {
    const error = result.error.details[0].message;
    return res.status(400).send(error);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const newUser = {
    id: users.length + 1,
    email: body.email,
    password: passwordHash
  };

  users.push(newUser);

  res.send(newUser);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(item => item.email === email);

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    return res.status(401).send({
      error: 'Invalid username or password'
    });
  }

  res.send('This is your token');
});

app.listen(3005, () => {
  console.log('Server running on port 3005');
});
