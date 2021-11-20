'use strict'

//VARIABLES GLOBALES

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

//IMPORTACION DE RUTAS 
var empresa_rutas = require("./src/rutas/empresa.rutas");
var sucursal_rutas = require("./src/rutas/sucursal.rutas")
var producto_rutas = require("./src/rutas/producto.rutas");
var productosucursal_rutas = require("./src/rutas/productosucursal.rutas")

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CABECERAS
app.use(cors());

//APLICACION DE RUTAS 
app.use('/api', empresa_rutas, sucursal_rutas, producto_rutas, productosucursal_rutas);

//EXPORTACIONES 

module.exports = app;
