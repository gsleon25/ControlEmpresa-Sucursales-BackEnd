'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    productoEmpresa: {type: Schema.Types.ObjectId, ref: 'empresas' },
    nombre: String,
    proveedor: String,
    stock: Number,
    imagen: String
    
});

module.exports = mongoose.model('productos', ProductoSchema);
