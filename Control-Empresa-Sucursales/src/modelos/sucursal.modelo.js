'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SucursalSchema = Schema({
    sucursalEmpresa:{type:Schema.Types.ObjectId, ref:'empresas'},
    nombre: String,
    direccion: String,
    usuario: String,
    password: String,
    rol: String
    
});

module.exports = mongoose.model('sucursales', SucursalSchema);

