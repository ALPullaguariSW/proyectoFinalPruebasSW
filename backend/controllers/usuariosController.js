const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registroUsuario = async (req, res) => {
  const { nombre, correo, contrasena, confirm_contrasena } = req.body;
  // Validaciones básicas
  if (!nombre || !correo || !contrasena || !confirm_contrasena) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.', claseMensaje: 'error' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
    return res.status(400).json({ mensaje: 'El formato del correo electrónico no es válido.', claseMensaje: 'error' });
  }
  if (contrasena.length < 5) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 5 caracteres.', claseMensaje: 'error' });
  }
  if (!/[a-z]/.test(contrasena)) {
    return res.status(400).json({ mensaje: 'La contraseña debe contener al menos una letra minúscula.', claseMensaje: 'error' });
  }
  if (!/[^A-Za-z0-9]/.test(contrasena)) {
    return res.status(400).json({ mensaje: 'La contraseña debe contener al menos un carácter especial.', claseMensaje: 'error' });
  }
  if (contrasena !== confirm_contrasena) {
    return res.status(400).json({ mensaje: 'Las contraseñas no coinciden.', claseMensaje: 'error' });
  }
  try {
    // Verificar si el correo ya existe
    const { rows } = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (rows.length > 0) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.', claseMensaje: 'error' });
    }
    // Hashear la contraseña
    const contrasena_hashed = await bcrypt.hash(contrasena, 10);
    // Insertar usuario
    await pool.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3)', [nombre, correo, contrasena_hashed]);
    return res.json({ mensaje: '¡Registro exitoso! Ya puedes iniciar sesión.', claseMensaje: 'success' });
  } catch (error) {
     console.error('Error en registroUsuario:', error);
    return res.status(500).json({ mensaje: 'Error del sistema. Intente más tarde.', claseMensaje: 'error' });
  }
};

exports.loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      mensaje: 'Por favor, complete todos los campos.',
      claseMensaje: 'error'
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, contrasena, rol FROM usuarios WHERE correo = $1',
      [correo]
    );
    if (rows.length === 1) {
      const usuario = rows[0];
      const esValida = await bcrypt.compare(contrasena, usuario['contrasena']);

      if (esValida) {
        // Generar token JWT
        const token = jwt.sign(
          { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
          process.env.JWT_SECRET || 'secreto', // Usa una variable de entorno segura
          { expiresIn: '2h' }
        );
        return res.json({
          mensaje: 'Login exitoso',
          claseMensaje: 'success',
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
          },
          token // Devuelve el token
        });
      } else {
        return res.status(401).json({
          mensaje: 'Correo o contraseña incorrecta.',
          claseMensaje: 'error'
        });
      }
    } else {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrecta.',
        claseMensaje: 'error'
      });
    }
  } catch (error) {
    console.error('Error en loginUsuario:', error); // 🔍 Agrega este log para depuración
    return res.status(500).json({
      mensaje: 'Error del sistema. Intente más tarde.',
      claseMensaje: 'error'
    });
  }
};

exports.reservarHabitacion = async (req, res) => {
  const { usuario_id, fecha_inicio, fecha_fin, tipo_habitacion, habitacion_id, accion } = req.body;
  // Validaciones de fechas
  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Las fechas de entrada y salida son requeridas.', claseMensaje: 'error' });
  }
  if (fecha_fin <= fecha_inicio) {
    return res.status(400).json({ mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.', claseMensaje: 'error' });
  }
  // Consultar disponibilidad
  if (accion === 'consultar') {
    try {
             let sql = `SELECT h.id, h.tipo, h.numero, h.capacidad, h.precio,
         NOT EXISTS (
           SELECT 1 FROM reservas r
           WHERE r.habitacion_id = h.id
           AND NOT (r.fecha_fin <= $1 OR r.fecha_inicio >= $2)
         ) AS disponible
         FROM habitaciones h`;
       const params = [fecha_inicio, fecha_fin];
       if (tipo_habitacion) {
         sql += ' WHERE h.tipo = $3';
         params.push(tipo_habitacion);
       }
      sql += ' ORDER BY h.tipo, h.precio, h.numero';
      const { rows: habitaciones } = await pool.query(sql, params);
      return res.json({ habitaciones });
    } catch (error) {
      return res.status(500).json({ mensaje: 'Error al buscar habitaciones. Intente más tarde.', claseMensaje: 'error' });
    }
  }
  // Realizar reserva
  if (accion === 'reservar') {
    if (!habitacion_id) {
      return res.status(400).json({ mensaje: 'Debes seleccionar una habitación disponible para reservar.', claseMensaje: 'error' });
    }
    try {
      // Verificar disponibilidad de la habitación seleccionada
      const { rows: disp } = await pool.query(
        'SELECT id FROM reservas WHERE habitacion_id = $1 AND NOT (fecha_fin <= $2 OR fecha_inicio >= $3)',
        [habitacion_id, fecha_inicio, fecha_fin]
      );
      if (disp.length > 0) {
        return res.status(400).json({ mensaje: 'La habitación seleccionada ya está reservada para esas fechas.', claseMensaje: 'error' });
      }
      // Insertar reserva
      await pool.query(
        'INSERT INTO reservas (usuario_id, habitacion_id, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4)',
        [usuario_id, habitacion_id, fecha_inicio, fecha_fin]
      );
      return res.json({ mensaje: '¡Reserva registrada con éxito!', claseMensaje: 'success' });
    } catch (error) {
      return res.status(500).json({ mensaje: 'Error al registrar la reserva. Por favor, inténtelo de nuevo.', claseMensaje: 'error' });
    }
  }
  // Si no se especifica acción válida
  return res.status(400).json({ mensaje: 'Acción no válida.', claseMensaje: 'error' });
};

exports.cancelarReserva = async (req, res) => {
  const { reserva_id, usuario_id } = req.body;
  if (!reserva_id || !usuario_id) {
    return res.status(400).json({ mensaje: 'Faltan datos para cancelar la reserva.', claseMensaje: 'error' });
  }
  try {
    // Solo permite cancelar si la reserva pertenece al usuario
          const { rowCount } = await pool.query('DELETE FROM reservas WHERE id = $1 AND usuario_id = $2', [reserva_id, usuario_id]);
      if (rowCount > 0) {
      return res.json({ mensaje: 'Reserva cancelada exitosamente.', claseMensaje: 'success' });
    } else {
      return res.status(404).json({ mensaje: 'Reserva no encontrada o no pertenece al usuario.', claseMensaje: 'error' });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al cancelar la reserva. Intente más tarde.', claseMensaje: 'error' });
  }
};

exports.misReservas = async (req, res) => {
  const usuario_id = req.params.usuario_id;
  if (!usuario_id) {
    return res.status(400).json({ mensaje: 'Falta el ID de usuario.', claseMensaje: 'error' });
  }
  try {
          const { rows: reservas } = await pool.query(
        `SELECT r.id, r.fecha_inicio, r.fecha_fin, r.created_at,
          h.tipo AS habitacion_tipo, h.numero AS habitacion_numero, h.precio AS habitacion_precio
        FROM reservas r
        JOIN habitaciones h ON r.habitacion_id = h.id
        WHERE r.usuario_id = $1
        ORDER BY r.fecha_inicio DESC`,
        [usuario_id]
      );
    return res.json({ reservas });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las reservas. Intente más tarde.', claseMensaje: 'error' });
  }
};

exports.obtenerTiposHabitacion = async (req, res) => {
  try {
    const { rows: tipos } = await pool.query('SELECT DISTINCT tipo FROM habitaciones ORDER BY tipo');
    const listaTipos = tipos.map(t => t.tipo);
    res.json(listaTipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tipos de habitación.' });
  }
};

exports.obtenerHabitacionesDisponibles = async (req, res) => {
  const { fecha_inicio, fecha_fin, tipo_habitacion } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Las fechas de entrada y salida son requeridas.', claseMensaje: 'error' });
  }
  if (fecha_fin <= fecha_inicio) {
    return res.status(400).json({ mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.', claseMensaje: 'error' });
  }

  try {
         const sql = `
       SELECT h.id, h.tipo, h.numero, h.capacidad, h.precio,
         NOT EXISTS (
           SELECT 1 FROM reservas r
           WHERE r.habitacion_id = h.id
             AND NOT (r.fecha_fin <= $1 OR r.fecha_inicio >= $2)
         ) AS disponible
       FROM habitaciones h
       WHERE ($3 IS NULL OR h.tipo = $4)
       ORDER BY h.tipo, h.precio, h.numero
     `;

     const params = [fecha_inicio, fecha_fin, tipo_habitacion || null, tipo_habitacion || null];

    const { rows: habitaciones } = await pool.query(sql, params);

    return res.json({ habitaciones });
  } catch (error) {
    console.error('Error en obtenerHabitacionesDisponibles:', error);
    return res.status(500).json({ mensaje: 'Error al buscar habitaciones. Intente más tarde.', claseMensaje: 'error' });
  }
};

