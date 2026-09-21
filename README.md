# Flor de primavera

Escribe un nombre y se genera una flor amarilla única (la misma cada vez para el mismo nombre). HTML + CSS + JS, sin dependencias.

- Link personalizado: `index.html?nombre=Ana`
- Archivos: `index.html`, `style.css`, `flor.js`

## Subirlo a GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `flores`) y sube los tres archivos a la raíz:
   ```bash
   git init
   git add index.html style.css flor.js README.md
   git commit -m "Flor de primavera"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/flores.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment**. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarda.
3. En un minuto tu página estará en `https://TU-USUARIO.github.io/flores/`.
4. Comparte enlaces como `https://TU-USUARIO.github.io/flores/?nombre=Ana`.

Para probar en local basta con abrir `index.html` en el navegador (el botón de copiar link funciona mejor desde https, como en GitHub Pages).
