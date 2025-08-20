import { movingAverage } from '../src/utils/index.js';

describe('Función movingAverage', () => {
  describe('Casos de referencia obligatorios', () => {
    test('movingAverage([10,20,30,40], 2) → [15.00, 25.00, 35.00]', () => {
      const result = movingAverage([10, 20, 30, 40], 2);
      expect(result).toEqual([15.00, 25.00, 35.00]);
    });

    test('movingAverage([1,2,3], 3) → [2.00]', () => {
      const result = movingAverage([1, 2, 3], 3);
      expect(result).toEqual([2.00]);
    });
  });

  describe('Casos básicos', () => {
    test('calcula media móvil con ventana 2', () => {
      const result = movingAverage([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([1.50, 2.50, 3.50, 4.50]);
    });

    test('calcula media móvil con ventana 3', () => {
      const result = movingAverage([1, 2, 3, 4, 5], 3);
      expect(result).toEqual([2.00, 3.00, 4.00]);
    });

    test('calcula media móvil con ventana igual a la longitud', () => {
      const result = movingAverage([1, 2, 3], 3);
      expect(result).toEqual([2.00]);
    });

    test('redondea correctamente a 2 decimales', () => {
      const result = movingAverage([1.333, 2.666, 3.999], 2);
      expect(result).toEqual([2.00, 3.33]);
    });
  });

  describe('Validaciones y errores', () => {
    test('lanza TypeError si series no es un array', () => {
      expect(() => movingAverage('not an array', 2)).toThrow(TypeError);
      expect(() => movingAverage('not an array', 2)).toThrow('El primer parámetro debe ser un array');
    });

    test('lanza TypeError si series contiene valores no numéricos', () => {
      expect(() => movingAverage([1, '2', 3], 2)).toThrow(TypeError);
      expect(() => movingAverage([1, '2', 3], 2)).toThrow('Todos los elementos de la serie deben ser números finitos');
    });

    test('lanza TypeError si series contiene null', () => {
      expect(() => movingAverage([1, null, 3], 2)).toThrow(TypeError);
    });

    test('lanza TypeError si series contiene undefined', () => {
      expect(() => movingAverage([1, undefined, 3], 2)).toThrow(TypeError);
    });

    test('lanza TypeError si series contiene NaN', () => {
      expect(() => movingAverage([1, NaN, 3], 2)).toThrow(TypeError);
    });

    test('lanza TypeError si series contiene Infinity', () => {
      expect(() => movingAverage([1, Infinity, 3], 2)).toThrow(TypeError);
    });

    test('lanza RangeError si window < 2', () => {
      expect(() => movingAverage([1, 2, 3], 1)).toThrow(RangeError);
      expect(() => movingAverage([1, 2, 3], 1)).toThrow('La ventana debe ser un entero mayor o igual a 2');
    });

    test('lanza RangeError si window > series.length', () => {
      expect(() => movingAverage([1, 2, 3], 4)).toThrow(RangeError);
      expect(() => movingAverage([1, 2, 3], 4)).toThrow('La ventana no puede ser mayor que la longitud de la serie');
    });

    test('lanza RangeError si window no es entero', () => {
      expect(() => movingAverage([1, 2, 3], 2.5)).toThrow(RangeError);
    });

    test('lanza RangeError si window es 0', () => {
      expect(() => movingAverage([1, 2, 3], 0)).toThrow(RangeError);
    });

    test('lanza RangeError si window es negativo', () => {
      expect(() => movingAverage([1, 2, 3], -1)).toThrow(RangeError);
    });
  });

  describe('Casos edge', () => {
    test('maneja array con un solo elemento', () => {
      expect(() => movingAverage([1], 2)).toThrow(RangeError);
    });

    test('maneja array vacío', () => {
      expect(() => movingAverage([], 2)).toThrow(RangeError);
    });

    test('maneja números decimales', () => {
      const result = movingAverage([1.1, 2.2, 3.3, 4.4], 2);
      expect(result).toEqual([1.65, 2.75, 3.85]);
    });

    test('maneja números negativos', () => {
      const result = movingAverage([-1, -2, -3, -4], 2);
      expect(result).toEqual([-1.50, -2.50, -3.50]);
    });

    test('maneja mezcla de números positivos y negativos', () => {
      const result = movingAverage([-1, 1, -1, 1], 2);
      expect(result).toEqual([0.00, 0.00, 0.00]);
    });
  });

  describe('Cobertura de ramas', () => {
    test('valida que series sea array antes de validar elementos', () => {
      expect(() => movingAverage('string', 2)).toThrow(TypeError);
    });

    test('valida window antes de validar elementos de series', () => {
      expect(() => movingAverage([1, 2, 3], 1)).toThrow(RangeError);
    });

    test('valida elementos de series solo si window es válido', () => {
      expect(() => movingAverage([1, 2, 3], 5)).toThrow(RangeError);
    });
  });
});


