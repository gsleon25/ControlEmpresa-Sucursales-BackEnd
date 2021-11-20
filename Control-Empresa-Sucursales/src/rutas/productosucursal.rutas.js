'use strict'

var express = require("express");
var productosucursalControlador = require("../controladores/productosucursal.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated")

//RUTAS

var api=express.Router();


api.post('/agregarProductosucursal', md_autorizacion.ensureAuth, productosucursalControlador.agregarProducto);
api.put('/editarProductosucursal/:id', md_autorizacion.ensureAuth, productosucursalControlador.editarProducto);
api.delete('/eliminarProductosucursal/:id', md_autorizacion.ensureAuth, productosucursalControlador.eliminarProducto);
api.get('/listarProductosucursales', productosucursalControlador.listarProductos);
api.get('/listarProductosucursalNom', productosucursalControlador.buscarProductosNom);
api.get('/obtenerProductosucursalId/:id', productosucursalControlador.obtenerProductoId);
api.get('/listarProductosucursalesPorEmpresa', md_autorizacion.ensureAuth, productosucursalControlador.listarProductosPorEmpresa);


module.exports = api;