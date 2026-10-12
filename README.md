# RUA ARTES

Dashboard estático para catálogo y consulta de artes de montaje de RUA.

## Archivos
- `index.html`: interfaz y visor.
- `styles.css`: estilos adaptables.
- `app.js`: búsqueda, filtros y controles de visualización.
- `artes.json`: catálogo de archivos que consume el dashboard.

## Desplegar en GitHub Pages
1. Sube todos estos archivos a la raíz de la rama `main` del repositorio `Williweb/rua-artes`.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona `main` y `/ (root)`, y guarda.
5. Espera a que termine el despliegue en **Actions**. GitHub Pages publica archivos estáticos y los cambios pueden tardar unos minutos en aparecer.

## Catálogo
`artes.json` debe contener un arreglo de objetos. Ejemplo:

```json
[
  {
    "name": "Caja muestra 001.pdf",
    "client": "Cliente de ejemplo",
    "code": "ART-001",
    "product": "Caja plegadiza",
    "type": "pdf",
    "url": "https://enlace-publico-directo-al-archivo"
  },
  {
    "name": "Etiqueta muestra.png",
    "client": "Cliente de ejemplo",
    "code": "ART-002",
    "type": "image",
    "url": "https://enlace-publico-directo-a-la-imagen",
    "thumbnail": "https://enlace-publico-directo-a-la-miniatura"
  }
]
```

`url` tiene que ser un enlace directo al contenido que el navegador pueda leer/mostrar, no solamente el enlace de la página de la carpeta. Para imágenes, el navegador debe poder cargar la URL desde otro dominio (CORS cuando aplique).

## Nota importante sobre OneDrive
Este proyecto enlaza la carpeta compartida, pero **no enumera automáticamente los archivos de OneDrive solo a partir de la URL de la carpeta**. Una web estática de GitHub Pages no debe contener secretos ni credenciales de Microsoft. Para sincronizar el listado automáticamente habrá que verificar una interfaz pública compatible o usar un servicio intermedio seguro. No publiques archivos confidenciales en este repositorio.
