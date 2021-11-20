'use strict'

var Productosucursal = require("../modelos/productosucursal.modelo");
var Sucursal = require("../modelos/sucursal.modelo")
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../servicios/jwt");

function agregarProducto(req,res){
    //if (req.user.rol === "ROL_ADMIN"){
        var productosucursalModel = new Productosucursal();
        var params = req.body;

        if (req.user.rol != 'ROL_SUCURSAL') {
            return res.status(500).send({ mensaje: 'solo la Empresas pueden agregar Productos' })
          } else {    

    if(params.nombre && params.stock && params.cantidadVendida){

        productosucursalModel.productoSucursal = req.user.sub;
        productosucursalModel.nombre = params.nombre;
        productosucursalModel.stock = params.stock;
        productosucursalModel.cantidadVendida = params.cantidadVendida;
        productosucursalModel.imagen = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Empty_set.svg/480px-Empty_set.svg.png";

        Productosucursal.find({nombre:productosucursalModel.nombre}).exec((err, productosucursalEncontrado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la solicitud producto'});

            if(productosucursalEncontrado && productosucursalEncontrado.length >=1){
                return res.status(200).send({mensaje:'Este producto ya existe'});
            }else{
                productosucursalModel.save((err, productosucursalGuardado)=>{
                    if(err) return res.status(500).send({mensaje: 'Error al guardar'});

                    if (productosucursalGuardado){
                       return res.status(200).send(productosucursalGuardado);
                    }else{
                       return res.status(404).send({ mensaje: 'No se ha podido registrar el producto'});
                    }
                })
            }
        })
    }else{
        return res.status(404).send({ mensaje: 'No ingreso todos los datos'});
    }
    
    //}else{
        //return res.status(404).send({ mensaje: 'No tiene permiso para realizar esta acción'});
   // }
}
    
}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;
  
    if (req.user.rol != 'ROL_SUCURSAL') {
      return res.status(500).send({ mensaje: 'no posee los permisos para editar producto' })
    }
  
    Productosucursal.find({ nombre: params.nombre }).exec((err, productosucursalEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'error en la peticion' })
      if (productosucursalEncontrado && productosucursalEncontrado.length >= 1) {
        return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe' })
  
      } else {
  
            Productosucursal.findOne({ _id: idProducto }).exec((err, productosucursalEncontrado) => {
          if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener producto' });
  
          if (!productosucursalEncontrado) return res.status(500).send({ mensaje: 'Error en la peticion editar o no existen los datos' });
  
          if (productosucursalEncontrado.productoSucursal != req.user.sub) return res.status(500).send({ mensaje: 'no posee los permisos para Editar un producto de una empresa ajena' })
  
          Productosucursal.findByIdAndUpdate(idProducto, params, { new: true }, (err, productosucursalActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
  
            if (!productosucursalActualizado) return res.status(500).send({ mensaje: 'no se ha podido editar el producto' })
  
            if (productosucursalActualizado) {
              return res.status(200).send({ productosucursalActualizado });
            }
          })
        })
      }
    })
  }

function eliminarProducto(req, res) {
    var idSucursal = req.params.id;
    var params = req.body;
  
    if (req.user.rol != 'ROL_SUCURSAL') {
      return res.status(500).send({ mensaje: 'No posee los permisos para eliminar producto' })
    }
  
    Productosucursal.findOne({ _id: idSucursal }).exec((err, productosucursalEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar producto' })
      if (!productosucursalEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });
  
      if (productosucursalEncontrado.productoSucursal != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para eliminar un producto de una empresa ajena' })
  
      Productosucursal.findByIdAndDelete(idSucursal, (err, productosucursalEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosucursalEliminado) return res.status(500).send({ mensaje: 'no se ha podido eliminar el producto' });
  
        if (productosucursalEliminado) {
          return res.status(200).send({ mensaje: 'Se ha eliminado el producto' })
        }
      })
    })
  }

function listarProductos(req, res){
    Productosucursal.find().exec((err, productos)=>{
        if(err) return res.status(500).send({ mensaje:"Error al realizar la solicitud de obtener productos" });
        if(!productos) return res.status(500).send({ mensaje:"No se encontraron productos" });

        return res.status(200).send({ productos });
    })
}

function listarProductosPorEmpresa(req, res) {
    var idProducto = req.user.sub;
  
    if (req.user.rol != 'ROL_SUCURSAL') {
        return res.status(500).send({ mensaje: 'No posee los permisos para listar Productos' });
    }
  
    Productosucursal.find({productoSucursal:idProducto}).exec((err, productosXEmpresa) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Productos' });
        if (!productosXEmpresa) return res.status(500).send({ mensaje: 'Error al lsitar Productos' });
        return res.status(200).send({ productosXEmpresa });
    })
  }

function buscarProductosNom(req, res) {
    var nombre = req.body.nombre;

    Productosucursal.find({"nombre": nombre },(err, productosucursalEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de productos'});
        if(!productosucursalEncontrados) return res.status(500).send({mensaje: 'Error al obtener los productos' });

        return res.status(200).send({ productosucursalEncontrados });
    })

}

function obtenerProductoId(req, res){
    var proID = req.params.id;

    Productosucursal.findById({_id:proID }, (err, producEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Producto' });
        if (!producEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el Producto' });
        return res.status(200).send({ producEncontrado });
    })
}



module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    listarProductos,
    listarProductosPorEmpresa,
    buscarProductosNom,
    obtenerProductoId
}