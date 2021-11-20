'use strict'

var jwt = require("jwt-simple");
var moment = require("moment");
var secret = 'clave_secreta';

exports.createToken = function (sucursal) {

    var payload = {
        sub: sucursal._id,
        usuario: sucursal.usuario,
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        rol: sucursal.rol,
        iat: moment().unix(),
        exp: moment().day(10,'days').unix()

    }

    return jwt.encode(payload, secret);

}

