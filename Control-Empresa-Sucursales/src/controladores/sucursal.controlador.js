'use strict'
var Usuario

var Sucursal = require("../modelos/sucursal.modelo");
var Empresa = require("../modelos/empresa.modelo");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const pdf = require('pdfkit')
const fs = require('fs');
const xlsx = require('xlsx')

var Datos
const { relativeTimeRounding } = require("moment");
const { findOne } = require("../modelos/sucursal.modelo");
const { param } = require("../rutas/empresa.rutas");
  

function admin(req, res) {
  var userModel = new Sucursal();

  userModel.nombre = 'Administrador';
  userModel.usuario = 'AdminMc';
  userModel.password = '123456';
  userModel.rol = 'ROL_ADMIN'

  Sucursal.find({

    $or: [
      { usuario: userModel.usuario }
    ]

  }).exec((err, adminEncontrado) => {
    if (err) return console.log('Error al crear el Admin');

    if (adminEncontrado.length >= 1) {

      return console.log("El admin ya se creo")

    } else {
      bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {

        userModel.password = passwordEncriptada;


        userModel.save((err, adminGuardado) => {

          if (err) return console.log('error en la peticion del Admin')

          if (adminGuardado) {
            console.log('Admin Creado ')

          } else {
            console.log('Error al crear el Admin')
          }
        })
      })
    }
  })
}

function login(req, res) {

  var params = req.body;

  Sucursal.findOne({ usuario: params.usuario }, (err, sucursalEncontrada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

      if (sucursalEncontrada) {
          bcrypt.compare(params.password, sucursalEncontrada.password, (err, passVerificada) => {
              if (passVerificada) {
                  if (params.getToken === 'true') {
                      return res.status(200).send({
                          token: jwt.createToken(sucursalEncontrada)
                      })

                  } else {
                      sucursalEncontrada.password = undefined;
                      return res.status(200).send({ sucursalEncontrada });
                  }
              } else {
                  return res.status(500).send({ mensaje: 'Contraseña incorrecta' })
              }

          })
      } else {
          return res.status(500).send({ mensaje: 'Usuario incorrecto' })
      }
  })
}

function agregarSucursal(req, res) {

    var sucursalModel = Sucursal();
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN") {

        return res.status(500).send({ mensaje: 'Solo el Administrador pueden agregar Sucursales' })

    } else {
        if (params.nombre && params.direccion && params.usuario &&params.password) {
            sucursalModel.sucursalEmpresa = req.user.sub;
            sucursalModel.nombre = params.nombre;
            sucursalModel.direccion = params.direccion;
            sucursalModel.usuario = params.usuario
            sucursalModel.password = params.password;
            sucursalModel.rol = 'ROL_SUCURSAL'

            Sucursal.find({

                $or: [
                    { usuario: sucursalModel.usuario }
                ]

            }).exec((err, sucursalEncontrada) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion del la Sucursal' });

                if (sucursalEncontrada && sucursalEncontrada.length >= 1) {

                    return res.status(500).send({ mensaje: 'La sucursal ya existe' })

                } else {

                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                        sucursalModel.password = passwordEncriptada;

                        sucursalModel.save((err, sucursalGuardada) => {

                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardar Sucursal' });

                            if (sucursalGuardada) {

                                res.status(200).send({ sucursalGuardada })

                            } else {
                                res.status(404).send({ mensaje: 'no se ha podido registrar la Sucursal' })
                            }
                        })
                    })
                }
            })

        } else {
            return res.status(500).send({ mensaje: 'Llene todos los datos necesarios' })
        }
    }
}

function editarSucursal(req, res) {
  var idSucursal = req.params.id;
  var params = req.body;

  if (req.user.rol != 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: 'no posee los permisos para editar sucursal' })
  }

  Sucursal.find({ nombre: params.nombre }).exec((err, sucursalEncontrada) => {
    if (err) return res.status(500).send({ mensaje: 'error en la peticion' })
    if (sucursalEncontrada && sucursalEncontrada.length >= 1) {
      return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe' })

    } else {

        Sucursal.findOne({ _id: idSucursal }).exec((err, sucursalEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener sucursal' });

        if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'Error en la peticion editar o no existen los datos' });

        if (sucursalEncontrada.sucursalEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'no posee los permisos para Editar una sucursal de una empresa ajena' })

        Sucursal.findByIdAndUpdate(idSucursal, params, { new: true }, (err, sucursalActualizada) => {
          if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

          if (!sucursalActualizada) return res.status(500).send({ mensaje: 'no se ha podido editar la sucursal' })

          if (sucursalActualizada) {
            return res.status(200).send({ sucursalActualizada });
          }
        })
      })
    }
  })
}

function eliminarSucursal(req, res) {
  var idSucursal = req.params.id;
  var params = req.body;

  if (req.user.rol != 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: 'No posee los permisos para eliminar sucursal' })
  }

  Sucursal.findOne({ _id: idSucursal }).exec((err, sucursalEncontrada) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar sucursal' })
    if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

    if (sucursalEncontrada.sucursalEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para eliminar sucursales de una empresa ajena' })

    Sucursal.findByIdAndDelete(idSucursal, (err, sucursalEliminada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
      if (!sucursalEliminada) return res.status(500).send({ mensaje: 'no se ha podido eliminar la sucursal' });

      if (sucursalEliminada) {
        return res.status(200).send({ mensaje: 'Se ha eliminado la sucursal' })
      }
    })
  })
}

function obtenerSucursalId(req, res) {
  var sucursalId = req.params.id;

  Sucursal.findOne({ _id: sucursalId }).exec((err, sucursalEncontrada) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar sucursal' })
    if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

//  if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados de una empresa ajena' })

    Sucursal.findById(sucursalId, (err, sucursalEncontrada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de sucursal' });
      if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'error al obtener la sucursal' })
      return res.status(200).send({ sucursalEncontrada });
    })
  })
}

function obtenerSucursalNombre(req, res) {

  // var idEmpleado = req.params.id;
  var params = req.body

  if (req.user.rol != 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: 'No tiene los permisos para buscar una sucursal' })
  }

  Sucursal.findOne({ nombre: params.nombre }).exec((err, sucursalEncontrada) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la busqueda de la sucursal' });
    if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'no existen los datos' });
    if (sucursalEncontrada.sucursalEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'La sucursal no existe' })

    return res.status(200).send({ sucursalEncontrada })
  })
}


function obtenerSucursal(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: 'no posee los permisos para buscar sucursales' })
  }

  if (params.nombre === req.user.nombre) {

    Sucursal.find({ sucursalEmpresa: req.user.sub }).exec((err, sucursalEncontrada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'Error en la consulta de sucursales o no tiene datos' })
      return res.status(200).send({ sucursalEncontrada })
    })
  } else {
    return res.status(500).send({ mensaje: 'No pude buscar sucursales de una empresa ajena' })
  }
}

function generarPdf(req, res) {
  var params = req.body;


  if (req.user.rol != 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: 'no posee los permisos para buscar las sucursales' })
  }

  if (params.nombre === req.user.nombre) {

    Sucursal.find({ sucursalEmpresa: req.user.sub }).exec((err, sucursalEncontrada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!sucursalEncontrada) return res.status(500).send({ mensaje: 'Error en la consulta de sucursales o no tiene datos' })

      Datos = sucursalEncontrada

      var doc = new pdf();

      doc.pipe(fs.createWriteStream(`./src/pdf/sucursal ${req.user.nombre}.pdf`));

      doc.text(`Sucursales de la Empresa ${req.user.nombre}`, {
        align: 'center'
      })

      doc.text(Datos, {
        align: 'left'
      })

      doc.end()

    })

    return res.status(500).send({ mensaje: 'PDF generado!!' })

  } else {
    return res.status(500).send({ mensaje: 'No puede generar un pdf de una empresa ajena' })
  }

}

function obtenerSucursales(req, res) {
   
    Sucursal.find().exec((err, sucursales) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Sucursales' });
      if (!sucursales) return res.status(500).send({ mensaje: 'Error en la consutla de Sucursales o no tiene datos' });
      return res.status(200).send({ sucursales });

  })
}


module.exports = {
  admin,
  login,

  agregarSucursal,
  editarSucursal,
  eliminarSucursal,
  obtenerSucursalId,
  obtenerSucursalNombre,
  obtenerSucursal,
  obtenerSucursales,
  generarPdf
}