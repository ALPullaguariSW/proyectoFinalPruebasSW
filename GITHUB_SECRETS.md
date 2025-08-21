# 🔐 GitHub Secrets Requeridos

Para que el CI/CD funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub.

## 📍 Ubicación

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings**
3. En el menú izquierdo, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret**

## 🔑 Secrets Necesarios

### **RENDER_API_KEY**
- **Descripción**: API key de Render para desplegar el backend
- **Cómo obtenerla**:
  1. Ve a [https://dashboard.render.com/account/api-keys](https://dashboard.render.com/account/api-keys)
  2. Haz clic en **New API Key**
  3. Dale un nombre descriptivo (ej: "Plataforma Reservas")
  4. Copia la API key generada
- **Formato**: `rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Ejemplo**: `rnd_RUExip1234567890abcdefghijklmnop`

## ⚙️ Configuración del Secret

### **Nombre del Secret**
```
RENDER_API_KEY
```

### **Valor del Secret**
```
rnd_tu_api_key_aqui
```

## 🔍 Verificación

Para verificar que el secret está configurado correctamente:

1. Ve a la pestaña **Actions** de tu repositorio
2. Haz clic en el workflow **Continuous Deployment**
3. Verifica que no hay errores relacionados con secrets faltantes

## 🚨 Importante

- **Nunca** compartas tu API key públicamente
- **Nunca** la incluyas en el código fuente
- **Nunca** la subas a GitHub
- Si sospechas que tu API key se ha comprometido, revócala inmediatamente en Render

## 🔄 Rotación de Secrets

Es recomendable rotar tu API key periódicamente:

1. Ve a [https://dashboard.render.com/account/api-keys](https://dashboard.render.com/account/api-keys)
2. Encuentra tu API key actual
3. Haz clic en **Revoke** para revocarla
4. Crea una nueva API key
5. Actualiza el secret en GitHub con la nueva key

## 📚 Recursos Adicionales

- [Documentación de Render API](https://render.com/docs/api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Render CLI](https://render.com/docs/cli)
