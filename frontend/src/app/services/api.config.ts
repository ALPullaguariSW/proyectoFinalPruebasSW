// Configuración de API - Prioridad: runtime-api.js > environment > fallback
export const API_BASE_URL = (() => {
  // 1. Intentar obtener de runtime-api.js
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // 2. Verificar si estamos en producción (GitHub Pages)
  if (typeof window !== 'undefined' && window.location.hostname === 'alpullaguarisw.github.io') {
    return 'https://proyectofinalpruebassw.onrender.com';
  }
  
  // 3. Fallback para desarrollo local
  return 'http://localhost:3000';
})();
