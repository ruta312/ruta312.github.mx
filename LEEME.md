# Ruta Universitaria

Abre `index.html` en un navegador moderno. La aplicación funciona localmente y no requiere cuentas, servicios externos ni servidor.

## Actualizar los cortes UdeG

1. Sustituye el archivo de origen por la nueva versión.
2. Ejecuta `actualizar_datos.py` con la ruta del archivo de Excel y como salida `data/udg-scores.json`.
3. El script crea o actualiza tanto `udg-scores.json` como `udg-scores.js`; el segundo permite que la app también funcione al abrir `index.html` directamente.

La calculadora considera los registros de licenciatura con carrera y puntaje mínimo. Conserva el centro y campus para distinguir sedes.
