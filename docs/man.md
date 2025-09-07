
# AFA Script Utility (AFASU)

## Guía para el programador de la “story”

**Archivo principal:** `data.js`  
**Versión:** 1.1  
**Autor:** Seba Rho  
**Última actualización:** 5 de septiembre de 2025  

---

> Este documento describe la arquitectura narrativa del motor de aventura gráfica El AFA desarrollado por Pancho Morell y Seba Rho. Está dirigido al programador responsable de construir la lógica de historia, diálogos y comportamiento de los objetos del mundo.

---


# 📘 Capítulo 1: Introducción General al Sistema Narrativo

Este manual está diseñado para el programador de la “story” en el motor de aventura gráfica. Su propósito es documentar de forma clara, modular y curatorial el entorno narrativo, las estructuras disponibles, las funciones de servicio y las convenciones que rigen la lógica del juego.

El sistema toma inspiración de dos paradigmas históricos del diseño narrativo interactivo:

- **Z-Machine**: motor de ficción interactiva textual desarrollado por Infocom, donde los *story files* contenían toda la lógica narrativa y los datos del mundo.  Como en la Z-Machine, el archivo `gameData` funciona como un *story file*, conteniendo el universo jugable completo. 
- **SCUMM (Script Creation Utility for Maniac Mansion)**: motor gráfico desarrollado por Lucasfilm Games, que separaba la lógica narrativa del motor gráfico y permitía escribir scripts modulares para cada escena, objeto y personaje. Como en SCUMM, los scripts narrativos se disparan por acciones del jugador y operan sobre entidades visuales, con funciones específicas para mover personajes, iniciar diálogos, modificar estados y controlar el flujo narrativo.

---

## Filosofía de diseño

- **Separación total entre lógica y presentación**: el programador de la “story” no necesita preocuparse por el motor gráfico ni por la interfaz.
- **Modularidad narrativa**: cada acción del jugador dispara un script específico, que puede consultar y modificar el estado del mundo.
- **Convención clara de nombres**: los scripts se nombran siguiendo el patrón `<personaje>_<verbo>_<item>_<target>`, lo que permite mapear acciones a lógica sin ambigüedad.
- **Acceso total al universo**: los scripts pueden consultar y modificar `gameState` y `gameData`, permitiendo una narrativa reactiva y dinámica.

---

## Estructura del manual

Este documento se organiza en capítulos temáticos:

1. Introducción general al sistema narrativo  
2. Estructura del universo jugable (`gameData`)  
3. Entorno narrativo y variables de sistema (`gameState`)  
4. Funciones narrativas disponibles (API para scripts)  
5. Convenciones de escritura y buenas prácticas  
6. Glosario técnico-narrativo

> Este manual no es solo técnico: es una guía curatorial para construir mundos interactivos con coherencia, estilo y modularidad.

---

¿Querés que también prepare una sección comparativa entre SCUMM y tu sistema, para que el programador entienda mejor las diferencias y similitudes? Podría ser útil como apéndice.


# 📘 Capítulo 2: Estructura del Universo Jugable (`gameData`)

Este capítulo describe la arquitectura base del archivo `gameData`, que define el universo interactivo del juego. Contiene la configuración inicial, los personajes, objetos, ítems, escenas y diálogos. Todo script narrativo se apoya en esta estructura para operar sobre el mundo del juego.

## 🧭 2.1. Inicialización (`inits`)

```js
inits: {
  player: 'Pancho',
  scene: 'quincho'
}
```

- `player`: ID del personaje controlado por el jugador al iniciar.
- `scene`: ID de la escena inicial.

> Define el punto de entrada narrativo y espacial del juego.

---

## 👥 2.2. Personajes (`characters`)

Cada personaje tiene atributos visuales, narrativos y posicionales.

```js
'Pancho': {
  name: 'Pancho',
  alias: 'Pancho',
  description: "Pancho: El Anfitrión.",
  inventories: [],
  x: 100, y: 150,
  width: 130, height: 220,
  image: 'assets/images/characters/Pancho.png'
}
```

| Campo             | Tipo   | Descripción                      |
|-------------------|--------|----------------------------------|
| `name`            | string | Nombre completo del personaje.   |
| `alias`           | string | Nombre informal o apodo.         |
| `description`     | string | Texto narrativo que lo presenta. |
| `inventories`     | array  | Lista de ítems que posee.        |
| `x`, `y`          | number | Posición en pantalla.            |
| `width`, `height` | number | Dimensiones visuales.            |
| `image`           | string | Ruta al sprite del personaje.    |

---

## 🧱 2.3. Objetos (`objects`)

Elementos fijos o interactivos del entorno.

```js
'parrilla': {
  name: 'Parrilla',
  x: 650, y: 220,
  width: 100, height: 100,
  description: "La parrilla. El altar de El AFA. Todavía está apagada.",
  hasCarbon: false,
  isLit: false
}
```

| Campo                | Tipo    | Descripción                                       |
|----------------------|---------|---------------------------------------------------|
| `name`               | string  | Nombre visible del objeto.                        |
| `x`, `y`             | number  | Posición en pantalla.                             |
| `width`, `height`    | number  | Dimensiones visuales.                             |
| `description`        | string  | Texto descriptivo.                                |
| `exits`              | string  | (Opcional) ID de escena destino si es una salida. |
| Otros flags          | boolean | Estados personalizados (`isLit`, `isOpen`, etc.). |
| `image`, `imageOpen` | string  | (Opcional) Ruta a sprites según estado.           |

---

## 🎒 2.4. Ítems (`items`)

Elementos móviles que pueden ser recogidos.

```js
'vaso_fernet': {
  name: 'Vaso de fernet',
  x: 180, y: 280,
  width: 15, height: 20,
  color: '#2A1A10',
  description: "Un vaso de fernet. Vacío. Un clásico.",
  canBePickedUp: true
}
```

| Campo             | Tipo    | Descripción                  |
|-------------------|---------|------------------------------|
| `name`            | string  | Nombre del ítem.             |
| `x`, `y`          | number  | Posición inicial.            |
| `width`, `height` | number  | Dimensiones visuales.        |
| `color`           | string  | Color de representación.     |
| `description`     | string  | Texto descriptivo.           |
| `canBePickedUp`   | boolean | Si puede ser recogido.       |
| `isHidden`        | boolean | Si está oculto inicialmente. |

---

## 🗺️ 2.5. Escenas (`scenes`)

Cada escena define el entorno visual y los elementos que contiene.

```js
'quincho': {
  name: 'Quincho',
  background: { wall: '#A0522D', floor: '#5C4033' },
  objects: ['parrilla', 'mesa', 'salida_patio', 'salida_cocina'],
  items: ['vaso_fernet', 'botella_fernet', ...],
  characters: ['Pancho', 'Sebastian', ...]
}
```

| Campo        | Tipo   | Descripción                         |
|--------------|--------|-------------------------------------|
| `name`       | string | Nombre de la escena.                |
| `background` | object | Colores de fondo (`wall`, `floor`). |
| `objects`    | array  | IDs de objetos presentes.           |
| `items`      | array  | IDs de ítems presentes.             |
| `characters` | array  | IDs de personajes presentes.        |

---

## 💬 2.6. Diálogos (`dialogueMatrix`)

Sistema de diálogo por personaje, con ramificaciones narrativas.

```js
'Sebastian': {
  start: [
    {
      player: "Che, Seba, ¿todo bien?",
      npc: "Todo tranquilo. Pensando en que estaría bueno escuchar un poco de Christopher Cross.",
      leadsTo: "end"
    },
    ...
  ],
  seba_music_1: [
    {
      player: "¿Y qué me decís de los Beach Boys?",
      npc: "¡Palabras mayores! Brian Wilson es un genio...",
      leadsTo: "end"
    }
  ]
}
```

| Campo     | Tipo   | Descripción                                   |
|-----------|--------|-----------------------------------------------|
| `player`  | string | Línea del jugador.                            |
| `npc`     | string | Respuesta del personaje.                      |
| `leadsTo` | string | ID del siguiente bloque de diálogo o `"end"`. |

> El sistema permite ramificaciones temáticas y respuestas personalizadas por personaje.

---


# 📘 Capítulo 3: Entorno Narrativo y Variables de Sistema

Este capítulo describe el contexto técnico y narrativo en el que se ejecutan los scripts de historia. El programador de la “story” no interactúa directamente con el motor gráfico ni con la interfaz, sino que escribe scripts que responden a acciones del jugador, modifican el estado del mundo, y disparan efectos narrativos. Para ello, dispone de un conjunto de variables de sistema y convenciones que permiten controlar la lógica del juego.

---

## 🧠 3.1. `gameState`: Estado Dinámico del Juego

El objeto `gameState` representa el estado vivo del universo jugable. Es accesible desde los scripts y contiene toda la información relevante para tomar decisiones narrativas.

### 🔧 Estructura principal

```js
gameState = {
  currentPlayer: 'Pancho',
  currentScene: 'quincho',
  actionState: {
    verb: 'USAR',
    item: { key: 'encendedor', type: 'item' },
    target: { key: 'parrilla', type: 'object' }
  },
  activeItem: 'encendedor',
  inventories: {
    Pancho: ['encendedor', 'vaso_fernet']
  },
  hoverTarget: 'parrilla',
  dialogue: {
    active: false,
    currentLine: null
  },
  lastInteractionTime: 1693920000000
}
```

### 📌 Campos clave

| Variable              | Descripción                                         |
|-----------------------|-----------------------------------------------------|
| `currentPlayer`       | ID del personaje que controla el jugador.           |
| `currentScene`        | ID de la escena actual.                             |
| `actionState`         | Verbo y argumentos seleccionados por el jugador.    |
| `activeItem`          | Ítem actualmente seleccionado (si aplica).          |
| `inventories`         | Inventario por personaje.                           |
| `hoverTarget`         | Elemento bajo el cursor (objeto, ítem o personaje). |
| `dialogue`            | Estado del diálogo activo.                          |
| `lastInteractionTime` | Timestamp de la última acción ejecutada.            |

> El script puede consultar estas variables para condicionar su ejecución, validar estados, o modificar el mundo.

---

## 🧩 3.2. Convención de Scripts Narrativos

Previo a la ejecución de una acción el procesador construye el objeto `actionstate` que contiene el `verbo` y, de existir segun la configuracion del tipo de parametros que acepta cada verbo, contiene el objeto `item` y/o el objeto `target`.
Estos pueden ser consultados desde el script mediante:

```js
api.gameState.actioState.verb
api.gameState.actionState.item
api.gameState.actionState.target
```

Tanto `item` como `target` a su vez contienen las propiedades:

| Propiedad  | Descripción                                         |
|------------|-----------------------------------------------------|
|   `key`    | ID del objeto.                                      |
|   `type`   | el tipo que puede ser `item`, `object`, `character` |


Luego, el procesador intenta ejectur el script bajo el nombre:
```
<jugador>_<verbo>_<item>
```
o si 'gameState.item` no esta definido:
```
<jugador>_<verbo>_<target>
```
que se construye actomaticamente con la informacion de `gameState.currentPlayer` y `gameState.actionSate`

De no existir este script intenta ejecutar un script más generico cuyo nombre sigue el formato:
```
<jugador>_<verbo>
```
tambien construido automaticamente como en el caso anterior

Aún asi, de no existir un script con este segundo nombre, entonces el procesador hara un último intento llamando a un script llamado 'default', cuya existencia no es obligatoria, pero se siguiere implementar para manejar casos y acciones genericas

Ejemplo:

```
pancho_usar_encendedor
```

> El programador debe definir un script con ese nombre en el objeto `storyScripts`, que contenga la lógica narrativa correspondiente.

---

## 📦 3.3. Acceso a Datos del Universo (`gameData`)

Los scripts pueden acceder a todo el universo definido en `gameData`, incluyendo:

- `gameData.characters`: información de personajes
- `gameData.objects`: estado y propiedades de objetos
- `gameData.items`: ítems disponibles y sus flags (`canBePickedUp`, `isHidden`, etc.)
- `gameData.scenes`: composición de cada escena
- `gameData.dialogueMatrix`: diálogos por personaje

> Esto permite que los scripts modifiquen estados, agreguen ítems al inventario, cambien de escena, o disparen diálogos.

---

## 🧰 3.4. Funciones de Servicio (API narrativa)

Además de las variables de sistema, el programador de scripts tiene acceso a funciones utilitarias que permiten:

- Mostrar texto narrativo
- Modificar inventarios
- Cambiar estados de objetos
- Iniciar diálogos
- Mover personajes
- Cambiar de escena

Estas funciones serán explicadas en el próximo capítulo.

---

## 🧠 3.5. Filosofía de Diseño y Buenas Prácticas

- Los scripts deben ser **modulares**, **autocontenidos** y **deterministas**.
- No deben depender de efectos secundarios no controlados.
- Deben consultar `gameState` y `gameData` para tomar decisiones.
- Pueden modificar el estado del juego, pero deben hacerlo de forma explícita.

> El motor no impone restricciones narrativas: el programador tiene libertad total para definir comportamientos, siempre que respete la convención de nombres y estructura.

---

# 📘 Capítulo 4: Funciones Narrativas Disponibles (API para Scripts)

Este capítulo presenta el conjunto de funciones que el programador de la “story” puede invocar desde los scripts narrativos. Estas funciones permiten modificar el estado del juego, controlar el flujo narrativo, manipular inventarios, mover personajes, iniciar diálogos, y mucho más.

Todas las funciones están disponibles globalmente dentro del entorno de ejecución de los scripts en el objeto `api`, y se espera que se usen de forma modular, explícita y contextual.

Para poder acceder a ellas en necesario importar la libreria `api.js` de la siguiente manera, en la primer linea de codigo del archivo de `data.js`, donde se define la "story":

```js
import {* as api} from "/.api.js"

```

---


## 🧭 4.1. Categorías Funcionales

### 🎬 Control Narrativo

| Función                  | Propósito                                                   |
|--------------------------|-------------------------------------------------------------|
| `say(text)`              | Muestra una línea de diálogo en pantalla.                   |
| `startDialogue(nodeID)`  | Inicia un diálogo desde un nodo específico. *(placeholder)* |
| `abortDialogues()`       | Finaliza cualquier diálogo activo. *(placeholder)*          |
| `runScript(name)`        | Ejecuta un script narrativo por nombre.                     |
| `wait(frames)`           | Pausa la ejecución por una cantidad de frames.              |
| `setTimer(callback, ms)` | Ejecuta una función luego de un tiempo en milisegundos.     |
| `clearTimer(timerID)`    | Cancela un temporizador activo. *(no implementado aún)*     |

---

### 🧍 Control de Personajes

| Función                          | Propósito                                                   |
|----------------------------------|-------------------------------------------------------------|
| `actorChangeScene(actor, dest)`  | Mueve un personaje a otra escena.                           |
| `changeActor(characterName, ui)` | Cambia el personaje controlado por el jugador.              |
| `getCurrentPlayer()`             | Devuelve el ID del jugador actual.                          |
| `showActor(characterName)`       | Cambia la escena actual a donde está el personaje indicado. |

---

### 🗺️ Control de Escena

| Función                        | Propósito                                |
|--------------------------------|------------------------------------------|
| `changeScene(sceneName)`       | Cambia la escena actual.                 |
| `getCurrentScene()`            | Devuelve el ID de la escena actual.      |
| `moveItemToScene(item, scene)` | Coloca un ítem en una escena específica. |

---

### 🎒 Inventario

| Función                                | Propósito                                      |
|----------------------------------------|------------------------------------------------|
| `addItemToActor(character, item)`      | Agrega un ítem al inventario de un personaje.  |
| `removeItemFromActor(character, item)` | Quita un ítem del inventario.                  |
| `getInventory(character)`              | Devuelve el inventario de un personaje.        |
| `actorHasItem(character, item)`        | Verifica si un personaje tiene un ítem.        |
| `getItem(item)`                        | El jugador recoge un ítem del escenario.       |
| `dropItem(item)`                       | El jugador suelta un ítem en la escena actual. |
| `giveItemTo(item, character)`          | Transfiere un ítem a otro personaje.           |

---

### 🧱 Estado de Objetos e Ítems

| Función                              | Propósito                                     |
|--------------------------------------|-----------------------------------------------|
| `setObjectState(obj, state, value)`  | Modifica un flag de estado de un objeto.      |
| `getObjectState(obj, state)`         | Consulta el estado de un objeto.              |
| `isObjectInState(obj, state, value)` | Verifica si un objeto está en cierto estado.  |
| `setItemFlag(item, flag, value)`     | Establece una marca (flag) en un ítem.        |
| `toggleItemFlag(item, flag)`         | Alterna el valor de una marca en un ítem.     |
| `isItemFlagSet(item, flag)`          | Verifica si una marca está activa en un ítem. |
| `canItemBePickedUp(item)`            | Verifica si un ítem puede ser recogido.       |
| `isItemHidden(item)`                 | Verifica si un ítem está oculto.              |

---

### 🧠 Acceso a Datos del Universo

| Función               | Propósito                                |
|-----------------------|------------------------------------------|
| `gameState()`         | Devuelve el estado dinámico del juego.   |
| `getActor(name)`      | Devuelve el objeto personaje por nombre. |
| `getItemData(name)`   | Devuelve el objeto ítem por nombre.      |
| `getObjectData(name)` | Devuelve el objeto por nombre.           |
| `getSceneData(name)`  | Devuelve la escena por nombre.           |

---

### 🖥️ Interfaz

| Función    | Propósito            |
|------------|----------------------|
| `hideUI()` | Oculta la interfaz.  |
| `showUI()` | Muestra la interfaz. |

---

## 🧠 4.2. Convención de Uso

- Todas las funciones deben usarse dentro de scripts definidos en `storyScripts`.
- Se recomienda validar el estado del juego antes de modificarlo.

El formato de los scripts sera:

```
export const storyScripts = {
    'default': () => {

        aqui va el contenido del script

    },

    'funcion_1': () => {
        
        /// aqui va el contenido del script

    }

}
```

---

## 💬 4.3. Ejemplo de Script Narrativo

```js
storyScripts['pancho_usar_encendedor_parrilla'] = () => {
  if (api.actorHasItem('Pancho', 'encendedor')) {
    api.say("Pancho prende la parrilla con el encendedor.");
    api.setObjectState('parrilla', 'isLit', true);
    api.removeItemFromActor('Pancho', 'encendedor', ui);
  } else {
    api.say("Pancho no tiene el encendedor.");
  }
};
```

> Este script verifica si Pancho tiene el encendedor, modifica el estado de la parrilla, y actualiza el inventario.

---
