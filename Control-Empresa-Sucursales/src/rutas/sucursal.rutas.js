'use strict'

var express = require("express");
var sucursalControlador = require("../controladores/sucursal.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated");

//RUTAS

var api = express.Router();
api.post('/login', sucursalControlador.login);

api.post('/registrarSucursal',md_autorizacion.ensureAuth, sucursalControlador.agregarSucursal);
api.put('/editarSucursal/:id', md_autorizacion.ensureAuth, sucursalControlador.editarSucursal);
api.delete('/eliminarSucursal/:id',md_autorizacion.ensureAuth, sucursalControlador.eliminarSucursal);
api.get('/obtenerSucursalId/:id', sucursalControlador.obtenerSucursalId);
api.get('/obtenerSucursalNombre', md_autorizacion.ensureAuth, sucursalControlador.obtenerSucursalNombre);
api.get('/obtenerSucursales', sucursalControlador.obtenerSucursales);
api.get('/obtenerSucursal', md_autorizacion.ensureAuth, sucursalControlador.obtenerSucursal)
api.get('/generarPdf',md_autorizacion.ensureAuth, sucursalControlador.generarPdf)

module.exports = api;