const express = require('express');
const lodash_id = require('lodash-id');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const body_parser = require('body-parser');
const cors = require('cors');
const nanoid = require('nanoid');

const archivo = new FileSync("database.json");
const db = lowdb(archivo);

db._.mixin(lodash_id);

const notas = db.defaults({ notas: [] }).get('notas');
const usuarios = db.defaults({ usuarios: [] }).get('usuarios');

const server = express();
server.use(cors());

server.use(body_parser.json());

const PORT = process.env.PORT || 3001;

// ?? GET POST PUT DELETE UPDATE

server.get("/", (request, variable) => {
    variable.status(200).json({ "mensaje": 'Hola mundo en node API REST' });
});

server.get("/notas", (req, res) => {
    res.status(200).json(
        notas.values()
    )
});

server.get("/usuarios", (req, res) => {
    res.status(200).json(
        usuarios.values()
    )
});

server.post("/agregarNota", async (req, res) => {
    if (req.body.titulo_nota === undefined || req.body.mensaje === undefined) {
        res.status(400).json({
            status_code: 400,
            mensaje: "Error, faltan parámetros para realizar la petición",
            parametros_faltantes: {
                titulo_nota: req.body.titulo_nota === undefined ? null : req.body.titulo_nota,
                mensaje: req.body.mensaje === undefined ? null : req.body.mensaje
            }
        });
    } else {
        if (Object.keys(req.body).length > 2) {
            res.status(413).json({
                status_code: 413,
                mensaje: "Demasiados parámetros de los necesarios",
                aceptados: ["titulo_nota", "mensaje"]
            });
        } else {
            notas.insert({
                id: nanoid.nanoid(),
                titulo_nota: req.body.titulo_nota,
                mensaje: req.body.mensaje
            }).write();
            res.status(200).json({
                status_code: 200,
                mensaje: 'Todo ha salido correcto'
            });
        }
    }
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

// process.env.
// console.log(process);
server.listen(PORT, () => console.log(`Server en puerto:${PORT}`));


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
