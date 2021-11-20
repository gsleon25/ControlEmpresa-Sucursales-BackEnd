'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductosucursalSchema = Schema({
    productoSucursal: {type: Schema.Types.ObjectId, ref: 'sucursales' },
    nombre: String,
    stock: Number,
    cantidadVendida: Number,
    imagen: String
    
});

module.exports = mongoose.model('productosucursales', ProductosucursalSchema);