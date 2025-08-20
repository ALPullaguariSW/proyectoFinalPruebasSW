const { toCelsius, toFahrenheit, movingAverage, sum } = require('./utils');

describe('toCelsius', () => {
  test('convierte 32°F a 0.0°C', () => {
    expect(toCelsius(32)).toBe(0.0);
  });

  test('convierte 212°F a 100.0°C', () => {
    expect(toCelsius(212)).toBe(100.0);
  });

  test('convierte -40°F a -40.0°C', () => {
    expect(toCelsius(-40)).toBe(-40.0);
  });

  test('redondea correctamente a 1 decimal', () => {
    expect(toCelsius(100)).toBe(37.8);
  });

  test('lanza TypeError para string', () => {
    expect(() => toCelsius('32')).toThrow(TypeError);
    expect(() => toCelsius('32')).toThrow('El parámetro debe ser un número finito');
  });

  test('lanza TypeError para null', () => {
    expect(() => toCelsius(null)).toThrow(TypeError);
  });

  test('lanza TypeError para undefined', () => {
    expect(() => toCelsius(undefined)).toThrow(TypeError);
  });

  test('lanza TypeError para NaN', () => {
    expect(() => toCelsius(NaN)).toThrow(TypeError);
  });

  test('lanza TypeError para Infinity', () => {
    expect(() => toCelsius(Infinity)).toThrow(TypeError);
  });
});

describe('toFahrenheit', () => {
  test('convierte 0°C a 32.0°F', () => {
    expect(toFahrenheit(0)).toBe(32.0);
  });

  test('convierte 100°C a 212.0°F', () => {
    expect(toFahrenheit(100)).toBe(212.0);
  });

  test('convierte -40°C a -40.0°F', () => {
    expect(toFahrenheit(-40)).toBe(-40.0);
  });

  test('redondea correctamente a 1 decimal', () => {
    expect(toFahrenheit(20)).toBe(68.0);
  });

  test('lanza TypeError para string', () => {
    expect(() => toFahrenheit('0')).toThrow(TypeError);
  });

  test('lanza TypeError para null', () => {
    expect(() => toFahrenheit(null)).toThrow(TypeError);
  });
});

describe('movingAverage', () => {
  test('movingAverage([10,20,30,40], 2) → [15.00, 25.00, 35.00]', () => {
    const result = movingAverage([10, 20, 30, 40], 2);
    expect(result).toEqual([15.00, 25.00, 35.00]);
  });

  test('movingAverage([1,2,3], 3) → [2.00]', () => {
    const result = movingAverage([1, 2, 3], 3);
    expect(result).toEqual([2.00]);
  });

  test('calcula media móvil con ventana 2', () => {
    const result = movingAverage([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([1.50, 2.50, 3.50, 4.50]);
  });

  test('lanza TypeError si series no es un array', () => {
    expect(() => movingAverage('not an array', 2)).toThrow(TypeError);
  });

  test('lanza TypeError si series contiene valores no numéricos', () => {
    expect(() => movingAverage([1, '2', 3], 2)).toThrow(TypeError);
  });

  test('lanza RangeError si window < 2', () => {
    expect(() => movingAverage([1, 2, 3], 1)).toThrow(RangeError);
  });

  test('lanza RangeError si window > series.length', () => {
    expect(() => movingAverage([1, 2, 3], 4)).toThrow(RangeError);
  });

  test('lanza RangeError si window no es entero', () => {
    expect(() => movingAverage([1, 2, 3], 2.5)).toThrow(RangeError);
  });

  test('maneja array con un solo elemento', () => {
    expect(() => movingAverage([1], 2)).toThrow(RangeError);
  });

  test('maneja array vacío', () => {
    expect(() => movingAverage([], 2)).toThrow(RangeError);
  });
});

describe('sum', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('adds negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });

  test('adds zero', () => {
    expect(sum(5, 0)).toBe(5);
  });

  test('lanza TypeError para string', () => {
    expect(() => sum('1', 2)).toThrow(TypeError);
  });

  test('lanza TypeError para null', () => {
    expect(() => sum(null, 2)).toThrow(TypeError);
  });

  test('lanza TypeError para undefined', () => {
    expect(() => sum(undefined, 2)).toThrow(TypeError);
  });
});
