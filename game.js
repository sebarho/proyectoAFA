import {
    drawScene,
    loadAssets
} from './renderer.js';

import {
    updateActionText,
    setupCharacterSwitcher,
    createVerbButtons,
    ui,
    configureVerbs,
    getVerbConfig
} from './ui.js';

import {
    gameData,
    storyScripts
} from './data.js';

import { state,
    globals
} from './runtime.js';

const vc = {
    'DAR': {
        label: 'Dar',
        display: 'Dar',
        preposition: 'a',
        expects: ['item', 'character']
    },
    'AGARRAR': {
        label: 'Agarrar',
        display: 'Agarrar',
        expects: [['item', 'object']]
    },
    'USAR': {
        label: 'Usar',
        display: 'Usar',
        preposition: 'con',
        expects: [['item', 'object']],
        optional: [['item', 'object']]
    },
    'ABRIR': {
        label: 'Abrir',
        display: 'Abrir',
        expects: [['item', 'object']]
    },
    'MIRAR': {
        label: 'Mirar',
        display: 'Mirar',
        expects: [['object', 'item', 'character']]
    },
    'IR': {
        label: 'Ir',
        display: 'Ir',
        preposition: 'a',
        expects: [['object', 'character']]
    },
    'CERRAR': {
        label: 'Cerrar',
        display: 'Cerrar',
        expects: [['object', 'item']]
    },
    'HABLAR': {
        label: 'Hablar',
        display: 'Hablar',
        preposition: 'con',
        expects: ['character']
    },
    'TOCAR_BULTO': {
        label: 'Tocar bulto',
        display: 'Tocarle el bulto',
        preposition: 'a',
        expects: ['character']
    },
}

/**
// export const state = {
//     currentPlayer: null,
//     currentScene: null,
//     actionState: {
//         verb: null,
//         item: null,
//         target: null
//     },
//     activeItem: null,
//     inventories: {null: []}, // Inventario por personaje
//     hoverTarget: null,
//     dialogue: null,
//     lastInteractionTime: Date.now(),
// };  
*/

// let ui = {
//     dialogueText: null,
//     actionText: null,
//     verbBar: null,
//     dialogueOptionsContainer: null,
//     characterSwitcher: null,
//     inventoryBox: null,
//     canvas: null, // EL objeto canvas que se iniciara luego de cargar los assets
//     ctx: null    // EL contexto 2D del canvas
// };

//////////////////////////////////////////////////////////////////////////////////////
///
///    SUPPORT FUNCTIONS
///
//////////////////////////////////////////////////////////////////////////////////////

function recolectarRutasDeImagen() {
    /**
     * INICIALIZA EL JUEGO, VARIABLES, OBJETOS, CARGA ASSETS... etc
     */

    // Inicializa un array vacío para almacenar todas las rutas de imágenes encontradas
    const allImagePaths = [];

    // Recorre todos los personajes definidos en gameData.characters
    Object.values(gameData.characters).forEach(char => {
        // Si el personaje tiene una imagen definida, la agrega al array
        if (char.image) allImagePaths.push(char.image);
    });

    // Recorre todas las escenas definidas en gameData.scenes
    Object.values(gameData.scenes).forEach(scene => {

        // Dentro de cada escena, recorre los objetos interactivos
        Object.values(scene.objects).forEach(obj => {
            // Si el objeto tiene una imagen principal, la agrega
            if (obj.image) allImagePaths.push(obj.image);
            // Si el objeto tiene una imagen alternativa (por ejemplo, abierta), también la agrega
            if (obj.imageOpen) allImagePaths.push(obj.imageOpen); //TODO: Revisar esta línea y el concepto (4-9-25)
        });

        // Recorre los ítems de la escena (pueden ser recolectables, decorativos, etc.)
        Object.values(scene.items).forEach(item => {
            // Si el ítem tiene una imagen definida, la agrega
            if (item.image) allImagePaths.push(item.image);
        });
    });

    console.log(`game.js: Found ${allImagePaths.length} images to preload.`);
    return allImagePaths;

}

export function runActionScript(name) {
    //Ejecutamos el script que devuelve un texto:
    if (storyScripts[name]) {
        console.log(`game.js: Running action script "${name}"`);
        return storyScripts[name]();
    }
    // } else {
    //     if (storyScripts["default"]) {
    //         console.log("Corriendo el script 'default'");
    //         return storyScripts["default"]();
    //     } else {
    //         console.log("El script no existe");
    //         return "";
    //     }
    // }
}

//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME START (ENTRY POINT)
///
//////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Starts the game
     */
    console.log('game.js: DOMContentLoaded event fired. Starting game initialization.');
    gameInit();
    //gameLoop();

});


//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME INIT
///
//////////////////////////////////////////////////////////////////////////////////////

function gameInit() {

    configureVerbs();

    loadAssets(recolectarRutasDeImagen(), () => {
        console.log('game.js: Initializing game after assets loaded...');

        // Crear botones de verbo dinamicamente
        configureVerbs(vc)
        createVerbButtons(getVerbConfig());
        console.log('game.js: Verb buttons created.');

        // Get gameData initial state
        state.currentPlayer = gameData.inits.player;
        state.currentScene = gameData.inits.scene;
        console.log(`game.js: Initial state > player=${state.currentPlayer}, scene=${state.currentScene}`);

        // Get the UI objects
        ui.document = document;
        ui.actionContainer = document.getElementById('action-container');
        ui.actionBox = document.getElementById('action-box');
        ui.actionText = document.getElementById('action-text');
        ui.verbBar = document.getElementById('verb-bar');
        ui.dialogueText = document.getElementById('dialogue-text');
        ui.dialogueContainer = document.getElementById('dialogue-container');
        ui.characterSwitcher = document.getElementById('character-switcher');
        ui.inventoryBox = document.getElementById('inventory-box');
        ui.canvas = document.getElementById('game-canvas');
        ui.ctx = ui.canvas.getContext('2d');
        console.log('game.js: UI objects created.');

        //Registra los eventos de mouse en el canvas en el Event Loop
        ui.document.addEventListener('keydown', handleKeyPress);
        ui.canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
        ui.canvas.addEventListener('mousemove', handleCanvasMousemove);
        ui.canvas.addEventListener('click', handleCanvasClick);
        document.querySelectorAll('.verb-button').forEach(b => b.addEventListener('click', () => handleVerbClick(b.textContent)));
        console.log('game.js: Event listeners registered.');

        //Carga los controles de personajes e inventario
        setupCharacterSwitcher();
        console.log('game.js: Character switcher set up.');

        //updateInventoryView(ui);
        console.log('game.js: Game initialized successfully. Starting game loop.');
        requestAnimationFrame(gameLoop); // Start the game loop after initialization
    });
};


//////////////////////////////////////////////////////////////////////////////////////
///
///    G A M E    L O O P
///
//////////////////////////////////////////////////////////////////////////////////////

function gameLoop() {
    /**
     * Main game loop, called with requestAnimationFrame
     */

    drawScene(ui); // Draw the current scene
    requestAnimationFrame(gameLoop); // Schedule the next frame
}


//////////////////////////////////////////////////////////////////////////////////////
///
///    KEYBOARD FUNCTIONS
///
//////////////////////////////////////////////////////////////////////////////////////

function handleKeyPress(e) {
    console.log("Key pressed");
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault(); // Evita que el navegador guarde la página
        //SWITCH DEBUG MODE
        if (globals.debugMode) {
            globals.debugMode = false;
        } else {
            globals.debugMode = true;
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////
///
///    CLICK HANDLE FUNCTIONS
///
//////////////////////////////////////////////////////////////////////////////////////

function handleDefaultClick(target) {
    if (target != null) {
        // if (target.type === 'object' && (target.key.startsWith('salida_') || target.key.startsWith('entrada_'))) {
        //     const from = state.currentScene;
        //     const to = target.key.includes('patio') ? 'patio' : (target.key.includes('cocina') ? 'cocina' : 'quincho');
        //     scenes[from].characters = scenes[from].characters.filter(c => c !== state.currentPlayer);
        //     scenes[to].characters.push(state.currentPlayer);
        //     state.currentScene = to;
        //     characters[state.currentPlayer].x = target.key.startsWith('salida_') ? 50 : 700;
        //     dependencies.fullRedraw();
        // } else if (target.type === 'character' && target.key !== state.currentPlayer) {
        //     startDialogue(state.currentPlayer, target.key, dependencies);
        //?????    ui.dialogueText.textContent = target.data.description;
        // }
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function handleVerbClick(verb) {
    const newVerb = verb.toUpperCase().replace(' ', '_');
    if (state.actionState.verb === newVerb) {
        state.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
    } else {
        state.actionState = { verb: newVerb, item: { key: null, type: null }, target: { key: null, type: null } };
    }
    updateActionText(ui, getVerbConfig());
}

//////////////////////////////////////////////////////////////////////////////////////

function handleCanvasClick(event) {

    console.log('----8<-----------------------------8<----')
    state.lastInteractionTime = Date.now();
    if (state.dialogue && state.dialogue.active) return;
    const target = state.hoverTarget;
    const verb = state.actionState.verb;

    if (!verb) {
        console.log('No hay verbo seleccionado');
        handleDefaultClick(target, ui);
        return;
    }

    const config = getVerbConfig()[verb];
    if (!config) {
        console.log('Verbo no configurado:', verb);
        return;
    }
    // Selección del primer argumento (puede ser item, object o character según el verbo)
    if (!state.actionState.item.key && !state.actionState.target.key) {
        // ¿Qué tipos acepta el verbo como primer argumento?
        let firstExpected = config.expects[0];
        // Si es un array (varios tipos posibles)
        if (Array.isArray(firstExpected)) {
            if (target != null) {
                if (firstExpected.includes(target.type)) {
                    console.log('Primer argumento válido: [' + target.type + '] ' + target.key);
                    // Guarda el argumento en el campo correcto
                    if (target.type === 'item') {
                        state.actionState.item.key = target.key;
                        state.actionState.item.type = target.type;
                    } else {
                        state.actionState.target.key = target.key;
                        state.actionState.target.type = target.type;
                    }
                    updateActionText(ui, getVerbConfig());

                    // Si solo requiere un argumento, ejecuta la acción
                    if (config.expects.length === 1 && !config.optional) {
                        console.log('Ejecutando acción con un solo argumento');
                        parseAction(ui);
                    }
                    return;
                }
                return
            }
        } else {
            // Solo un tipo permitido
            if (target.type === firstExpected) {
                console.log('Primer argumento válido:', target.type, target.key);
                if (target.type === 'item') {
                    state.actionState.item.key = item.key;
                    state.actionState.item.type = item.type;
                } else {
                    state.actionState.target.key = target.key;
                    state.actionState.target.type = target.type;
                }
                updateActionText(getVerbConfig());

                if (config.expects.length === 1 && !config.optional) {
                    console.log('Ejecutando acción con un solo argumento');
                    parseAction();
                }
                return;
            }
        }
        console.log('Primer argumento NO válido:', target?.type, target?.key);

    }

    // Selección del segundo objeto/target si es necesario u opcional
    if (state.actionState.item && !state.actionState.target) {
        // Si el verbo permite un segundo objeto opcional
        if (config.optional && config.optional.includes(target.type)) {
            console.log('Segundo argumento opcional válido:', target.type, target.key);
            state.actionState.target.key = target.key;
            state.actionState.target.type = target.type;
            parseAction()
        }
        // Si el verbo requiere un target específico
        if (config.expects[1] && target.type === config.expects[1]) {
            console.log('Segundo argumento requerido válido:', target.type, target.key);
            state.actionState.target.key = target.key;
            state.actionState.target.type = target.type;
            parseAction();
            return;
        }
        // Si no se requiere segundo objeto, ejecuta la acción
        if (!config.expects[1]) {
            console.log('Ejecutando acción con un solo argumento (sin segundo requerido)');
            parseAction();
            return;
        }
        console.log('Segundo argumento NO válido:', target?.type, target?.key);
    }
}


//////////////////////////////////////////////////////////////////////////////////////

export function parseAction() {
    let actionResultText = "";
    let dialogueStarted = false;
    console.log('parseAction: Ejecutando acción:', state.actionState);


    if (state != null) {
        if (state.actionState != null) {
            const { verb, item, target } = state.actionState;
            console.log(verb, item, target);

            //Generamos el nombre del action-script con ACTOR_VERBO_ITEM|TARGET
            let actionScriptName = state.currentPlayer + "_" + `${verb}`;
            if (item.key != null) {
                actionScriptName += `_${item.key}`;
                console.log('Item: ' + item.key);
            }
            if (target.key != null) {
                actionScriptName += `_${target.key}`;
                console.log('Target: ' + target.key);
            }
            actionScriptName = actionScriptName.toLowerCase();
            console.log('Nombre del action-script:', actionScriptName);

            //cheuqeamos si el script existe y lo corremos
            if (storyScripts[actionScriptName]) {
                console.log('Ejecutando script:', actionScriptName);
            } else {
                // Si no existe probamos el action-script con ACTOR_VERBO
                actionScriptName = state.currentPlayer + "_" + `${verb}`;
                actionScriptName = actionScriptName.toLowerCase();
                if (storyScripts[actionScriptName]) {
                    console.log('Ejecutando script alternativo:', actionScriptName);
                } else {
                    // Si no existe probamos el action-script 'default'
                    console.log('No existe el script:', actionScriptName);
                    actionScriptName = "default";
                }
            }
            const r = runActionScript(actionScriptName);
            state.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
            updateActionText();

        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////
function handleCanvasMousemove(event) {
    if (state.dialogue && state.dialogue.active) return;
    const rect = ui.canvas.getBoundingClientRect();
    state.hoverTarget = getTargetAt(event.clientX - rect.left, event.clientY - rect.top);
    updateActionText();//verbConfig);
    //ui.fullRedraw();
}

function handleCanvasMouseLeave(event) {
    state.hoverTarget = null;
    updateActionText();
}

//////////////////////////////////////////////////////////////////////////////////////
function getTargetAt(x, y) {
    /**
     * Determina qué elemento del escenario (objeto, item o personaje) está bajo las coordenadas (x, y).
     * Devuelve un objeto con { key, data, type } si encuentra un target, o null si no hay nada en esa posición.
     */

    // Obtiene la escena actual según el estado del juego
    const scene = gameData.scenes[state.currentScene];

    // Crea una lista de todos los posibles targets en la escena:
    // - Objetos del escenario (type: 'object')
    // - Items visibles (type: 'item')
    // - Personajes presentes (type: 'character')
    const allTargets = [
        // Items que no están ocultos
        ...scene.items.filter(itemKey => !gameData.items[itemKey].isHidden).map(itemKey => ({ key: itemKey, data: gameData.items[itemKey], type: 'item' })),
        // Objetos del escenario
        ...scene.objects.map(objectKey => ({ key: objectKey, data: gameData.objects[objectKey], type: 'object' })),
        // Personajes en la escena
        ...scene.characters.map(charKey => ({ key: charKey, data: gameData.characters[charKey], type: 'character' }))
    ]
        // Ordena los targets por su posición vertical (y + height), para que los que están "más adelante" tengan prioridad
        .sort((a, b) => (a.data.y + (a.data.height || 0)) - (b.data.y + (b.data.height || 0)));

    // Recorre todos los targets y verifica si las coordenadas (x, y) están dentro de su área
    for (const target of allTargets) {
        const d = target.data;
        if (x >= d.x && x <= d.x + d.width && y >= d.y && y <= d.y + d.height) {
            return target; // Devuelve el primer target que contiene el punto (x, y)
        }
    }
    // Si no se encontró ningún target bajo el mouse, devuelve null
    return null;
}


