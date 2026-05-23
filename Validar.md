# Plan para validar y sanitizar entradas

## Objetivo

Validar y sanitizar los datos de los campos `#inp-fecha`, `#inp-min` y `#inp-max` antes de guardar o enviar la informacion, evitando datos vacios, formatos invalidos, valores fuera de rango o contenido inesperado.

## Paso a paso

1. Identificar el flujo de guardado/envio
   - Buscar la funcion o evento que actualmente guarda o envia los datos.
   - Centralizar la validacion justo antes de ese punto, para que ningun dato llegue sin verificar.

2. Obtener referencias a los campos
   - Seleccionar los elementos con `document.getElementById("inp-fecha")`, `document.getElementById("inp-min")` y `document.getElementById("inp-max")`.
   - Confirmar que los tres existen antes de usarlos.

3. Sanitizar los valores crudos
   - Aplicar `trim()` a los tres valores para quitar espacios al inicio y al final.
   - Para `inp-min` e `inp-max`, normalizar separadores numericos si la interfaz permite coma decimal, por ejemplo convirtiendo `,` a `.`.
   - Rechazar cualquier valor numerico que contenga caracteres no permitidos.

4. Validar `inp-fecha`
   - Verificar que no este vacio.
   - Confirmar que respete el formato esperado del proyecto, por ejemplo `YYYY-MM-DD` si el campo es `type="date"`.
   - Convertir el valor a una fecha real y comprobar que no genere `Invalid Date`.
   - Aplicar reglas de negocio si existen, como no aceptar fechas futuras o no aceptar fechas anteriores a cierto limite.

5. Validar `inp-min`
   - Verificar que no este vacio.
   - Convertir el valor sanitizado a numero con `Number()`.
   - Comprobar que sea un numero finito con `Number.isFinite()`.
   - Aplicar limites permitidos si existen, por ejemplo valor minimo absoluto, cantidad de decimales o rango operativo.

6. Validar `inp-max`
   - Verificar que no este vacio.
   - Convertir el valor sanitizado a numero con `Number()`.
   - Comprobar que sea un numero finito con `Number.isFinite()`.
   - Aplicar los mismos criterios de rango y precision definidos para `inp-min`.

7. Validar la relacion entre minimo y maximo
   - Comparar los numeros ya convertidos.
   - Rechazar el envio si `min > max`.
   - Definir si `min === max` es valido segun la regla de negocio.

8. Mostrar errores al usuario
   - Preparar mensajes claros para cada campo.
   - Marcar visualmente los campos invalidos.
   - Evitar guardar o enviar mientras exista cualquier error.
   - Limpiar el estado de error cuando el usuario corrija el campo.

9. Construir un objeto limpio para guardar/enviar
   - Usar solo los valores sanitizados y convertidos.
   - Guardar la fecha en el formato final esperado.
   - Guardar `min` y `max` como numeros, no como strings.

10. Integrar la validacion en eventos utiles
    - Ejecutar validacion completa antes de guardar/enviar.
    - Opcionalmente validar cada campo en eventos `input`, `change` o `blur` para dar feedback temprano.

11. Agregar pruebas manuales
    - Fecha vacia.
    - Fecha con formato invalido.
    - Minimo vacio.
    - Maximo vacio.
    - Minimo o maximo con texto.
    - Minimo mayor que maximo.
    - Valores con espacios alrededor.
    - Valores decimales validos.
    - Caso valido completo.

12. Revisar seguridad y consistencia
    - No confiar en validaciones HTML solamente.
    - Mantener la validacion en JavaScript antes del guardado/envio.
    - Si existe backend, repetir la validacion del lado servidor.
    - Evitar insertar valores del usuario en HTML con `innerHTML`; usar `textContent` cuando se muestren mensajes o datos.

## Resultado esperado

El flujo de guardado/envio solo debe continuar cuando `#inp-fecha`, `#inp-min` y `#inp-max` tengan valores validos, sanitizados y coherentes entre si. Ante cualquier error, el usuario debe recibir feedback claro y los datos no deben persistirse ni enviarse.
