
# Geolocalización de Tablets



Durante las elecciones generales de Perú en Barcelona se utilzaron tablets para que los electores puedan consultar la mesa de votación. Eran alrededor de 20 tablets distribuídas entre el personal y voluntarios. Cada tablet, además de cumplir su función enviaba datos en tiempo real a Firebase para controlar su geolocalización y solicitar asistencia.

Nota: NO está optimizado para dispositivos móviles o tablets.

## Requerimientos de sistema
1. NodeJS 10.* o superior
2. Npm 7.15.* o superior
3. React-scripts 4.0.* o superior

## Requisitos previos a la primera ejecución

 1. Cambiar nombre a fichero sample.env por .env y añadir parámetros de Firebase.

    

## Instrucciones para ejecutar

Primero instalar todas las dependencias usando

    npm install --use-legacy-peers

Luego se puede ejecutar con npm run start

    npm run start

Para compilar y desplegar:

    npm run build && firebase deploy --only hosting
