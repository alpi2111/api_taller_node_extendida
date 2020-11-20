const express = require('express');
const lodash_id = require('lodash-id');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const body_parser = require('body-parser');
const cors = require('cors');
const nanoid = require('nanoid');
const crypto = require('crypto');
const { assert } = require('console');

const algoritmo = "aes-256-ctr";
const llave = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";

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

server.get("/notas", async (req, res) => {
    if (lenObject(req.query) > 0) {
        if (req.query.id !== undefined) {
            const notaid = notas.getById(req.query.id).value();
            if (notaid === undefined) {
                res.status(404).json({
                    status_code: 404,
                    mensaje: "No existe ninguna nota con ese id en la base de datos"
                });
            } else {
                res.status(200).json({
                    status_code: 200,
                    nota: notaid
                });
            }
        } else if (req.query.texto !== undefined) {
            var notasEnviar = []
            notas.value().forEach(val => {
                var men = val.mensaje.toLowerCase();
                var tit = val.titulo_nota.toLowerCase();
                if (men.includes(req.query.texto.toLowerCase()) || tit.includes(req.query.texto.toLowerCase())) {
                    notasEnviar.push(val);
                }
            });

            if (lenObject(notasEnviar) > 0) {
                res.status(200).json({
                    status_code: 200,
                    notas: notasEnviar
                })
            } else {
                res.status(404).json({
                    status_code: 404,
                    mensaje: "No existe ninguna nota que contenga la palabra que buscas"
                })
            }
        } else {
            res.status(404).json({
                status_code: 404,
                mensaje: "La ruta no acepta el parámetro enviado. Por favor verifica que todo esté correcto. Sólo puedes buscar una nota por su id o por texto que contenga"
            });
        }
    } else {
        res.status(200).json(
            notas.values()
        );
    }
});

server.get("/usuarios", (req, res) => {
    res.status(200).json(
        usuarios.values()
    )
});

server.post("/login", (req, res) => {
    if (req.body.usuario === undefined || req.body.password === undefined) {
        res.status(400).json({
            status_code: 400,
            mensaje: "Error, faltan parámetros para realizar la petición",
            parametros_faltantes: {
                usuario: req.body.usuario === undefined ? null : req.body.usuario,
                password: req.body.password === undefined ? null : req.body.password
            }
        });
    } else {
        let inicioSesion = false;
        const usuarioInicio = usuarios.find({usuario: req.body.usuario}).value();
        const passDb = usuarioInicio.password;
        const descifrar = crypto.createDecipher(algoritmo, llave);
        const descifrado = descifrar.update(passDb, 'hex', 'utf8') + descifrar.final('utf8');
        if (descifrado === req.body.password) {
            inicioSesion = true;
        } else {
            inicioSesion = false;
        }

        res.status(200).json({
            status_code: 200,
            inicio_sesion: inicioSesion
        });
    }
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
        if (lenObject(req.body) > 2) {
            mensajeMuchosParametros(res, ["titulo_nota", "mensaje"]);
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

server.post("/agregarUsuario", (req, res) => {
    if (req.body.nombre === undefined || req.body.usuario === undefined || req.body.password === undefined) {
        res.status(400).json({
            status_code: 400,
            mensaje: "Error, faltan parámetros para realizar la petición",
            parametros_faltantes: {
                nombre: req.body.nombre === undefined ? null : req.body.nombre,
                usuario: req.body.usuario === undefined ? null : req.body.usuario,
                password: req.body.password === undefined ? null : req.body.password
            }
        });
    } else {
        if (lenObject(req.body) > 3) {
            mensajeMuchosParametros(res, ["nombre", "usuario", "password"]);
        } else {
            console.log(iv);
            const cifrado = crypto.createCipher(algoritmo, llave);
            const encriptado = cifrado.update(req.body.password, 'utf8', 'hex') + cifrado.final('hex');
            usuarios.insert({
                id: nanoid.nanoid(),
                usuario: req.body.usuario,
                nombre: req.body.nombre,
                password: encriptado,
                hora_registro: Date.now()
            }).write();

            res.status(200).json({ status_code: 200, mensaje: `El usuario '${req.body.usuario}' ha sido registrado correctamente` });
        }
    }
});

server.listen(PORT, () => console.log(`Server en puerto:${PORT}`));

function lenObject(object) {
    return Object.keys(object).length;
}

function mensajeMuchosParametros(res, aceptados) {
    res.status(413).json({
        status_code: 413,
        mensaje: "Demasiados parámetros de los necesarios",
        aceptados: aceptados
    });
}
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
