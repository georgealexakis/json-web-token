const _ = require('lodash');
const express = require('express')
const app = express();
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const cors = require('cors');
const corsOptions = { origin: '*' };
const bcrypt = require('bcrypt');
// Demo data
const LIST = [
    { 'listid': 1, 'userid': 1, 'name': 'Car', 'completed': false },
    { 'listid': 2, 'userid': 1, 'name': 'PC', 'completed': true },
    { 'listid': 3, 'userid': 2, 'name': 'Robot', 'completed': false },
    { 'listid': 4, 'userid': 3, 'name': 'Angular', 'completed': false }
];
const USERS = [
    { 'userid': 1, 'username': 'george', 'password': '$2b$10$o/AXEfXBO9uh6YxqBXAtwOHv0KigUuoO66T3elIv2bo951xkO55MG' }, // password: 1111
    { 'userid': 2, 'username': 'peter', 'password': '$2b$10$ucaft0YayhwspG1.o6slXOdRMatQiLUHNGVAcUom7oDrNh6dtJa2K' }, // password: 1234
    { 'userid': 3, 'username': 'john', 'password': '$2b$10$OrSFsJFF/XggEeCwOCfX7u6Nk5jsZBjqxU59hCapk55O6T1r3WsXS' }, // password: 4321
];
function getList(userID) {
    const list = _.filter(LIST, ['userid', userID]);
    return list;
}
function getItem(itemID) {
    const item = _.find(LIST, (item) => { return item.id === itemID; })
    return item;
}
function getUsers() {
    return USERS;
}
// API options
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressJwt({ secret: 'soup-app-secret', algorithms: ['HS256'] }).unless({ path: ['/api/auth'] }));
app.use((err, _req, res, _next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({ message: 'Invalid token' });
    }
});
// Routes
app.get('/', (_req, res) => {
    res.json({ message: 'JWT API Server' });
});
app.post('/api/auth', (req, res) => {
    const body = req.body;
    const user = USERS.find(user => user.username === body.username);
    if (!user || !bcrypt.compareSync(body.password, user.password)) return res.sendStatus(401);
    const token = jwt.sign({ userID: user.userid }, 'soup-app-secret', { expiresIn: '2h' });
    res.send({ token });
});
app.get('/api/list', (req, res) => {
    res.type('json');
    res.send(getList(req.user.userID));
});
app.get('/api/list/:id', (req, res) => {
    const itemID = req.params.id;
    res.type('json');
    res.send(getItem(itemID));
});
app.get('/api/users', (_req, res) => {
    res.type('json');
    res.send(getUsers());
});
// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`JWT API Server is running on port ${PORT}`);
});