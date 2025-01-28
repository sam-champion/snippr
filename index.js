require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const seedData = [
  {
    id: 1,
    language: 'Python',
    iv: 'xUvvVue+EHC3MwoDEa8iNQ==',
    ciphertext: 'M58zjVZrweL5/1qkbH5p7edLjRDok3gj9eP4hRhDhqU='
  },
  {
    id: 2,
    language: 'Python',
    iv: 'L+ja/YxTqmbI9s/GBB5s9Q==',
    ciphertext: 'sJbM4aZXXI42fp1LfcAXVx7OssjW3873fVpfC9O/wU+ayfwhOJOQbGCYtSESkWkx'
  },
  {
    id: 3,
    language: 'JavaScript',
    iv: 'nzQRxqiogcbXyq43vQmqCg==',
    ciphertext: 'd+2kWd7WYxcYPWhX9FlqCEyUeJPgp7d1uZ1yd/1sLGY='
  },
  {
    id: 4,
    language: 'JavaScript',
    iv: 'H8TqqY6hlEkZeN4o/0OFmQ==',
    ciphertext: 'gr+NR01lYbn7f7PkKjLnK1PgrQ2Fqcg91EIqi1rFBN5HCjNzkdzkSkblafR+V4zQGHnjOvVlejU+yVBUJXRWIA=='
  },
  {
    id: 5,
    language: 'Java',
    iv: 'N+PUlMan9IvWR9hNDDo32A==',
    ciphertext: 'q6nNmD4e52Nf87VvmtP7ydg8Tzr6aS0AG3yI5DHrL82kpTJPlqhBQyHf/KIxib8ctgomUXNVEdOrz860iDgv4Zy648KTu3ulcwmLn4nSql7Fmc5yKQSAKob9r29etqr6eS6Hg3b89hWs0x9hVTytby3HdDDQeSL2fPxlaLMblZRnn0XgTG9XYUqUSDTkTfoy'
  },
  {
    id: 6,
    language: 'Java',
    iv: 'HyAOjvXRuOYGoG1LYTxl0A==',
    ciphertext: 'Va70E9sDailfN0zi7p2OTXNKwBamnw2b9IPWTI0p8QDbhmsiRGAUPAk2C2VpYJROMU5uW7w1ikbe0qcIVMvA7yhcw4yac0VIiLPyb1S9+vObguRU0aG8cGRBxbH6G+sGGT4UPLFU4rF41hcUQxSpx0D5xtUpJh1628AfG16YKoJvUT9E12bGP+9JmNH1s5SxiwVz4v9ITw2nS+DygDj2Hr0XGC94dMvWaVlcU9yZP3n3nRHvu8GwEjMbOjwjxftHqMfU5FnC5d+7hFXGTNEvcBXJiD3JFrvYhRKWfjdBcvGhHY8gXi5KHrnZWXUa3Xh67xSHMd37Q1irUP5h5L2wgnq7j04DF7BfinyLixSGD6U='
  },
  {
    id: 7,
    language: "Ruby",
    iv: 'PNyzph/adYA+PW6hDs0oOg==',
    ciphertext: 'NVkCyunRhO7cuXFeBxsc+qu/aC5ec2myFRXKuJgj57s='
  } 
];

const users = [
  {
    username: 'User1',
    password: '$2b$10$7RgVBrcwngsEVpLdQTtJReXGxnedD5wzMeTumTUO2hNXWfa8mBG2u',
    salt: '$2b$10$7RgVBrcwngsEVpLdQTtJRe'
  }
];

encrypt = (key, plaintext) => {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      key,
      iv,
    );
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    return {  iv: iv.toString('base64'), ciphertext  };
  } catch (error) {
    console.error('Error encrypting data:', error);
  }
};

decrypt = (key, iv, ciphertext) => {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      key,
      Buffer.from(iv, 'base64'),
    );
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  } catch (error) {
    console.error('Error decrypting data:', error);
  }
};

authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get('/snippets', authenticateJWT, (req, res) => {
  const key = Buffer.from(process.env.SECRET_KEY, 'base64');
  const language = req.query.lang;

  const decryptedSnippets = seedData.map((snippet) => {
    const plaintext = decrypt(key, snippet.iv, snippet.ciphertext);
    return {
      id: snippet.id,
      language: snippet.language,
      code: plaintext,
    };
  });

  if (language) {
    const filteredSnippets = decryptedSnippets.filter(
      (snippet) => snippet.language === language
    );
    if (filteredSnippets.length === 0) {
      return res.status(404).send({ error: 'No snippets found' });
    }
    return res.status(200).send(filteredSnippets);
  } else {
    return res.status(200).send(decryptedSnippets);
  }
});

app.get('/snippets/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id);
  const snippet = seedData.find((snippet) => snippet.id === id);

  if (snippet) {
    const key = Buffer.from(process.env.SECRET_KEY, 'base64');
    const plaintext = decrypt(key, snippet.iv, snippet.ciphertext);
    res.status(200).send({code: plaintext});
  } else {
    res.status(404).send({ error: 'Snippet not found' });
  }
});

app.post('/snippets', authenticateJWT, (req, res) => {
  const snippet = req.body.code;
  plaintext = JSON.stringify(snippet);
  const key = Buffer.from(process.env.SECRET_KEY, 'base64');
  const {iv, ciphertext} = encrypt(key, plaintext);
  const id = seedData.length + 1;
  const language = req.body.language;
  const newSnippet = {id, language, iv, ciphertext};
  seedData.push(newSnippet);
  res.status(201).send({message: 'Snippet saved successfully'});
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).send({ message: `${user.username} successfully logged in`, accessToken });
    } else {
      res.status(401).send({ message: 'Invalid password' });
    }
  } catch (error) {
    res.status(404).send( {message: 'Error logging user in', error });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    users.push({ username, password: hashedPassword, salt });
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(404).send( {message: 'Error creating user:', error });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
