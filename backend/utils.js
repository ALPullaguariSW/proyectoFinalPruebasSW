function toCelsius(fahrenheit) {
  if (!Number.isFinite(fahrenheit)) {
    throw new TypeError('El parámetro debe ser un número finito');
  }
  const celsius = (fahrenheit - 32) * 5 / 9;
  return Math.round(celsius * 10) / 10;
}

function toFahrenheit(celsius) {
  if (!Number.isFinite(celsius)) {
    throw new TypeError('El parámetro debe ser un número finito');
  }
  const fahrenheit = (celsius * 9 / 5) + 32;
  return Math.round(fahrenheit * 10) / 10;
}

function movingAverage(series, window) {
  if (!Array.isArray(series)) {
    throw new TypeError('El primer parámetro debe ser un array');
  }
  
  if (!Number.isInteger(window) || window < 2) {
    throw new RangeError('La ventana debe ser un entero mayor o igual a 2');
  }
  
  if (window > series.length) {
    throw new RangeError('La ventana no puede ser mayor que la longitud de la serie');
  }
  
  if (!series.every(Number.isFinite)) {
    throw new TypeError('Todos los elementos de la serie deben ser números finitos');
  }
  
  const result = [];
  
  for (let i = 0; i <= series.length - window; i++) {
    const windowValues = series.slice(i, i + window);
    const sum = windowValues.reduce((acc, val) => acc + val, 0);
    const average = sum / window;
    result.push(Math.round(average * 100) / 100);
  }
  
  return result;
}

function sum(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new TypeError('Los parámetros deben ser números finitos');
  }
  return a + b;
}

module.exports = {
  toCelsius,
  toFahrenheit,
  movingAverage,
  sum
};
