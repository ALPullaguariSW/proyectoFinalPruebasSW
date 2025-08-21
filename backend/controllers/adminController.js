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
      `SELECT r.id, r.fecha_inicio, r.fecha_fin, u.nombre AS usuario, h.numero AS habitacion,
        th.nombre AS tipo_habitacion, th.precio AS precio_habitacion
       FROM reservas r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN habitaciones h ON r.habitacion_id = h.id
       JOIN tipos_habitacion th ON h.tipo_id = th.id
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
        th.nombre AS habitacion_tipo, h.numero AS habitacion_numero, th.precio AS habitacion_precio
       FROM reservas r
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN habitaciones h ON r.habitacion_id = h.id
       JOIN tipos_habitacion th ON h.tipo_id = th.id
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
    const { rows: habitaciones } = await pool.query(
      `SELECT h.id, h.numero, h.estado, h.created_at,
        th.nombre AS tipo, th.descripcion, th.precio, th.capacidad
       FROM habitaciones h
       JOIN tipos_habitacion th ON h.tipo_id = th.id
       ORDER BY h.numero`
    );
    res.json({ habitaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar habitaciones.' });
  }
};

exports.crearHabitacion = async (req, res) => {
  const { numero, tipo_id, estado } = req.body;
  if (!numero || !tipo_id) {
    return res.status(400).json({ mensaje: 'El número y tipo de habitación son obligatorios.' });
  }
  try {
    await pool.query(
      'INSERT INTO habitaciones (numero, tipo_id, estado) VALUES ($1, $2, $3)',
      [numero, tipo_id, estado || 'disponible']
    );
    res.json({ mensaje: 'Habitación creada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la habitación.' });
  }
};

exports.editarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { numero, tipo_id, estado } = req.body;
  if (!numero || !tipo_id) {
    return res.status(400).json({ mensaje: 'El número y tipo de habitación son obligatorios.' });
  }
  try {
    await pool.query(
      'UPDATE habitaciones SET numero=$1, tipo_id=$2, estado=$3 WHERE id=$4',
      [numero, tipo_id, estado || 'disponible', id]
    );
    res.json({ mensaje: 'Habitación actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la habitación.' });
  }
};

exports.eliminarHabitacion = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM habitaciones WHERE id = $1', [id]);
    if (rowCount > 0) {
      res.json({ mensaje: 'Habitación eliminada correctamente.' });
    } else {
      res.status(404).json({ mensaje: 'Habitación no encontrada.' });
    }
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
    const { rows: habitaciones } = await pool.query(
      `SELECT h.id, h.numero, h.estado, h.created_at,
        th.nombre AS tipo, th.descripcion, th.precio, th.capacidad
       FROM habitaciones h
       JOIN tipos_habitacion th ON h.tipo_id = th.id
       WHERE h.id NOT IN (
         SELECT habitacion_id FROM reservas
         WHERE (fecha_inicio < $1 AND fecha_fin > $2)
            OR (fecha_inicio >= $3 AND fecha_inicio < $4)
       )
       ORDER BY h.numero`,
      [fecha_fin, fecha_inicio, fecha_inicio, fecha_fin]
    );
    res.json({ habitaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar disponibilidad.' });
  }
};
