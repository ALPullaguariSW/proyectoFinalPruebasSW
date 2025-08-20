const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const auth = require('../middleware/auth'); // Importa el middleware

// Ruta para registro de usuario
router.post('/registro', usuariosController.registroUsuario);

// Ruta para login de usuario
router.post('/login', usuariosController.loginUsuario);

// Ruta para reservar habitación (protegida)
router.post('/reservar', auth, usuariosController.reservarHabitacion);

// Ruta para cancelar reserva (protegida)
router.post('/cancelar-reserva', auth, usuariosController.cancelarReserva);

// Ruta para obtener las reservas del usuario (protegida)
router.get('/mis-reservas/:usuario_id', auth, usuariosController.misReservas);

// Obtener tipos de habitación (puede ser pública)
router.get('/tipos-habitacion', usuariosController.obtenerTiposHabitacion);

// Obtener habitaciones disponibles (puede ser pública)
router.get('/habitaciones-disponibles', usuariosController.obtenerHabitacionesDisponibles);

module.exports = router;
