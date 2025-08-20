const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Estadísticas rápidas
router.get('/dashboard/stats', auth, adminController.getStats);
// Próximas reservas
router.get('/dashboard/proximas-reservas', auth, adminController.getProximasReservas);
// Listar todas las reservas
router.get('/reservas', auth, adminController.listarReservas);
// Cancelar reserva (admin)
router.post('/reservas/cancelar', auth, adminController.cancelarReservaAdmin);
// Listar habitaciones
router.get('/habitaciones', auth, adminController.listarHabitaciones);
// Crear habitación
router.post('/habitaciones', auth, adminController.crearHabitacion);
// Editar habitación
router.put('/habitaciones/:id', auth, adminController.editarHabitacion);
// Eliminar habitación
router.delete('/habitaciones/:id', auth, adminController.eliminarHabitacion);
// Consultar disponibilidad de habitaciones
router.get('/disponibilidad', auth, adminController.disponibilidadHabitaciones);

module.exports = router;
