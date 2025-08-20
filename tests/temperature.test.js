import { toCelsius, toFahrenheit } from '../src/utils/index.js';

describe('Función toCelsius', () => {
  test('convierte 32°F a 0.0°C', () => {
    expect(toCelsius(32)).toBe(0.0);
  });

  test('convierte 212°F a 100.0°C', () => {
    expect(toCelsius(212)).toBe(100.0);
  });

  test('convierte -40°F a -40.0°C', () => {
    expect(toCelsius(-40)).toBe(-40.0);
  });

  test('convierte 98.6°F a 37.0°C', () => {
    expect(toCelsius(98.6)).toBe(37.0);
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

  test('lanza TypeError para -Infinity', () => {
    expect(() => toCelsius(-Infinity)).toThrow(TypeError);
  });
});

describe('Función toFahrenheit', () => {
  test('convierte 0°C a 32.0°F', () => {
    expect(toFahrenheit(0)).toBe(32.0);
  });

  test('convierte 100°C a 212.0°F', () => {
    expect(toFahrenheit(100)).toBe(212.0);
  });

  test('convierte -40°C a -40.0°F', () => {
    expect(toFahrenheit(-40)).toBe(-40.0);
  });

  test('convierte 37°C a 98.6°F', () => {
    expect(toFahrenheit(37)).toBe(98.6);
  });

  test('redondea correctamente a 1 decimal', () => {
    expect(toFahrenheit(20)).toBe(68.0);
  });

  test('lanza TypeError para string', () => {
    expect(() => toFahrenheit('0')).toThrow(TypeError);
    expect(() => toFahrenheit('0')).toThrow('El parámetro debe ser un número finito');
  });

  test('lanza TypeError para null', () => {
    expect(() => toFahrenheit(null)).toThrow(TypeError);
  });

  test('lanza TypeError para undefined', () => {
    expect(() => toFahrenheit(undefined)).toThrow(TypeError);
  });

  test('lanza TypeError para NaN', () => {
    expect(() => toFahrenheit(NaN)).toThrow(TypeError);
  });

  test('lanza TypeError para Infinity', () => {
    expect(() => toFahrenheit(Infinity)).toThrow(TypeError);
  });

  test('lanza TypeError para -Infinity', () => {
    expect(() => toFahrenheit(-Infinity)).toThrow(TypeError);
  });
});

describe('Casos de referencia obligatorios', () => {
  test('32°F → 0.0°C', () => {
    expect(toCelsius(32)).toBe(0.0);
  });

  test('0°C → 32.0°F', () => {
    expect(toFahrenheit(0)).toBe(32.0);
  });

  test('100°C → 212.0°F', () => {
    expect(toFahrenheit(100)).toBe(212.0);
  });

  test('−40°C ↔ −40°F (conversión bidireccional)', () => {
    expect(toFahrenheit(-40)).toBe(-40.0);
    expect(toCelsius(-40)).toBe(-40.0);
  });
});


