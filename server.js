const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const body_parser = require('body-parser');
const cors = require('cors');
const nanoid = require('nanoid');

const archivo = new FileSync("database.json");
const db = lowdb(archivo);

db.defaults({
    usuarios: [],
    notas: []
});

const server = express();
server.use(cors());

server.use(body_parser.json());

// ?? GET POST PUT DELETE UPDATE

server.get("/", (request, variable) => {
    variable.status(200).json({"mensaje": 'Hola mundo en node API REST'});
    // ? 404 
});

server.get("/notas", (req, res) => {
    res.status(200).json(
        db.get("notas").values()
    )
});

server.get("/usuario", (req, res) => {
    res.status(200).json(
        db.get("usuarios").values()
    )
});

server.post("/agregarNota", (req, res) => {
    const tituloNota = req.body.titulo_nota;
    db.set("notas", {
        "titulo_nota": tituloNota,
        "id": nanoid.nanoid(),
    }).write();

    res.status(200).send('Todo ha salido correcto');
});

server.get("/agregarUsuario", (req, res) => {
    const nombre = req.query.nombre;
    const pass = req.query.password;

    db.set("usuarios", {
        "id": nanoid.nanoid(),
        "nombre": nombre,
        "contra": pass
    }).write();

    res.status(200).send('Usuario ha salido correcto');
});

server.listen(3000, () => console.log('Server en localhost:3000'));


// ??
// ?? express
// ?? crear y habilitar un servidor

// ??
// ?? lowdb
// ?? crear una base de datos local en formato .json

// ?? cors
// ?? da acceso a la utilizacion de la API desde
// ?? fuentes o urls externas

// ??
// ?? nodemon
// ?? crear un escuchador de todos los cambios que haga
// ?? en mis archivos .js .html .css
