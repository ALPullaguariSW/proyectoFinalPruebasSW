const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const { rows: usuarios } = await pool.query('SELECT COUNT(*) AS total_usuarios FROM usuarios');
    const { rows: reservas } = await pool.query('SELECT COUNT(*) AS total_reservas FROM reservas');
    const { rows: habitaciones } = await pool.query('SELECT COUNT(*) AS total_habitaciones FROM habitaciones');
    const total_usuarios = usuarios[0].total_usuarios;
    const total_reservas = reservas[0].total_reservas;
    const total_habitaciones = habitaciones[0].total_habitaciones;
    res.json({ total_usuarios, total_reservas, total_habitaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas.' });
  }
};

exports.getProximasReservas = async (req, res) => {
  try {
    const { rows: reservas } = await pool.query(
      `SELECT r.id, r.fecha_inicio, r.fecha_fin, u.nombre AS usuario, h.numero AS habitacion
       FROM reservas r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN habitaciones h ON r.habitacion_id = h.id
       WHERE r.fecha_inicio >= CURRENT_DATE
       ORDER BY r.fecha_inicio ASC
       LIMIT 5`
    );
    res.json({ reservas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener próximas reservas.' });
  }
};

exports.listarReservas = async (req, res) => {
  try {
    const { rows: reservas } = await pool.query(
      `SELECT r.id, r.fecha_inicio, r.fecha_fin, r.created_at, u.nombre AS usuario, u.correo,
        h.tipo AS habitacion_tipo, h.numero AS habitacion_numero
       FROM reservas r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN habitaciones h ON r.habitacion_id = h.id
       ORDER BY r.fecha_inicio DESC`
    );
    res.json({ reservas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar reservas.' });
  }
};

exports.cancelarReservaAdmin = async (req, res) => {
  const { reserva_id } = req.body;
  if (!reserva_id) {
    return res.status(400).json({ mensaje: 'Falta el ID de la reserva.' });
  }
  try {
    const { rowCount } = await pool.query('DELETE FROM reservas WHERE id = $1', [reserva_id]);
    if (rowCount > 0) {
      res.json({ mensaje: 'Reserva cancelada correctamente.' });
    } else {
      res.status(404).json({ mensaje: 'Reserva no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar la reserva.' });
  }
};

exports.listarHabitaciones = async (req, res) => {
  try {
    const { rows: habitaciones } = await pool.query('SELECT * FROM habitaciones ORDER BY numero');
    res.json({ habitaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar habitaciones.' });
  }
};

exports.crearHabitacion = async (req, res) => {
  const { numero, tipo, descripcion, servicios, imagen, precio } = req.body;
  if (!numero || !tipo || !precio) {
    return res.status(400).json({ mensaje: 'El número, tipo y precio son obligatorios.' });
  }
  try {
    await pool.query(
      'INSERT INTO habitaciones (numero, tipo, descripcion, servicios, imagen, precio) VALUES ($1, $2, $3, $4, $5, $6)',
      [numero, tipo, descripcion, servicios, imagen, precio]
    );
    res.json({ mensaje: 'Habitación creada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la habitación.' });
  }
};

exports.editarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { numero, tipo, descripcion, servicios, imagen, precio } = req.body;
  if (!numero || !tipo || !precio) {
    return res.status(400).json({ mensaje: 'El número, tipo y precio son obligatorios.' });
  }
  try {
    await pool.query(
      'UPDATE habitaciones SET numero=$1, tipo=$2, descripcion=$3, servicios=$4, imagen=$5, precio=$6 WHERE id=$7',
      [numero, tipo, descripcion, servicios, imagen, precio, id]
    );
    res.json({ mensaje: 'Habitación actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la habitación.' });
  }
};

exports.eliminarHabitacion = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM habitaciones WHERE id = ?', [id]);
    res.json({ mensaje: 'Habitación eliminada.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la habitación.' });
  }
};

exports.disponibilidadHabitaciones = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  if (!fecha_inicio || !fecha_fin || fecha_fin <= fecha_inicio) {
    return res.status(400).json({ mensaje: 'Fechas inválidas.' });
  }
  try {
    const [habitaciones] = await db.promise().query(
      `SELECT h.id, h.numero, h.tipo, h.descripcion
       FROM habitaciones h
       WHERE h.id NOT IN (
         SELECT habitacion_id FROM reservas
         WHERE (fecha_inicio < ? AND fecha_fin > ?)
            OR (fecha_inicio >= ? AND fecha_inicio < ?)
       )
       ORDER BY h.numero`,
      [fecha_fin, fecha_inicio, fecha_inicio, fecha_fin]
    );
    res.json({ habitaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar disponibilidad.' });
  }
};
