import {drawScene, 
    loadAssets
} from './renderer.js';

import {
    startDialogue,
    updateInventoryView,
    updateActionText,
    setupCharacterSwitcher,
    createVerbButtons,
    uiOptions,
    showDialogueLine
} from './ui.js';

import { gameState } from './runtime.js';


import { gameData, 
        storyScripts 
} from './data.js';

const verbConfig = {
    'DAR': {        label: 'Dar',
                    display: 'Dar', 
                    preposition: 'a', 
                    expects: ['item', 'character'] 
    },
    'AGARRAR': {    label: 'Agarrar', 
                    display: 'Agarrar', 
                    expects: [['item', 'object']] 
    },
    'USAR': {       label: 'Usar', 
                    display: 'Usar', 
                    preposition: 'con', 
                    expects: [['item', 'object']], 
                    optional: [['item', 'object']] 
    },
    'ABRIR': {      label: 'Abrir', 
                    display: 'Abrir',  
                    expects: [['item', 'object']] 
    },
    'MIRAR': {      label: 'Mirar', 
                    display: 'Mirar', 
                    expects: [['object', 'item', 'character']] 
    },
    'IR': {         label: 'Ir', 
                    display: 'Ir', 
                    preposition: 'a', 
                    expects: [['object', 'character']] 
    },
    'CERRAR': {    label: 'Cerrar', 
                    display: 'Cerrar', 
                    expects: [['object', 'item']] 
    },
    'HABLAR': {    label: 'Hablar', 
                    display: 'Hablar', 
                    preposition: 'con', 
                    expects: ['character'] 
    },
    'TOCAR_BULTO': {     label: 'Tocar bulto', 
                    display: 'Tocarle el bulto',
                    preposition: 'a',
                    expects: ['character'] 
    },
};
/**
// export const gameState = {
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


//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME "LOOP"?
///
//////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    console.log('game.js: DOMContentLoaded event fired.');
    const allImagePaths = [];
    Object.values(gameData.characters).forEach(char => {
        if (char.image) allImagePaths.push(char.image);
    });
    Object.values(gameData.scenes).forEach(scene => {
        Object.values(scene.objects).forEach(obj => {
            if (obj.image) allImagePaths.push(obj.image);
            if (obj.imageOpen) allImagePaths.push(obj.imageOpen);
        });
        Object.values(scene.items).forEach(item => {
            if (item.image) allImagePaths.push(item.image);
        });
    });


    console.log(`game.js: Found ${allImagePaths.length} images to preload.`);
    loadAssets(allImagePaths, () => {
        console.log('game.js: All images preloaded. Initializing game.');
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        let { inits, characters, objects, items, scenes, dialogueMatrix } = JSON.parse(JSON.stringify(gameData));
        let puzzles = gameData.puzzles; // mantiene las funciones


        //////////////////////////////////////////////////////////////////////////////////////
        ///
        ///    GAME INIT STATE
        ///
        //////////////////////////////////////////////////////////////////////////////////////

        // Crear botones de verbo dinamicamente
        createVerbButtons(verbConfig);

        
        console.log(inits.player);
        console.log(inits.scene);
        gameState.currentPlayer = inits.player;
        gameState.currentScene = inits.scene;

        const dependencies = {
            dialogueText: document.getElementById('dialogue-text'),
            actionText: document.getElementById('action-text'),
            verbBar: document.getElementById('verb-bar'),
            dialogueOptionsContainer: document.getElementById('dialogue-options-container'),
            characterSwitcher: document.getElementById('character-switcher'),
            inventoryBox: document.getElementById('inventory-box'),
            ctx,
            gameState,
            characters,
            objects,
            items,
            scenes,
            puzzles,
            dialogueMatrix,
            fullRedraw: () => drawScene(dependencies)
        };

       
        //////////////////////////////////////////////////////////////////////////////////////
        ///
        ///    END GAME HANDLER FUNCTION
        ///
        //////////////////////////////////////////////////////////////////////////////////////

        function endGame(dependencies, message) {
            const { ctx, dialogueText, canvas } = dependencies;
            dialogueText.textContent = message;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFFF00';
            ctx.font = "24px 'Press Start 2P'";
            ctx.textAlign = 'center';
            ctx.fillText("¡GANASTE!", canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = "14px 'Press Start 2P'";
            ctx.fillText("¡El asado está en marcha!", canvas.width / 2, canvas.height / 2 + 20);

            canvas.style.pointerEvents = 'none';
            document.getElementById('verb-bar').style.display = 'none';
            document.getElementById('right-panel').style.display = 'none';
        }

        //////////////////////////////////////////////////////////////////////////////////////
        ///
        ///    CLICK HANDLE FUNCTIONS
        ///
        //////////////////////////////////////////////////////////////////////////////////////

        function handleVerbClick(verb) {
            const newVerb = verb.toUpperCase().replace(' ', '_');
            if (gameState.actionState.verb === newVerb) {
                gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
            } else {
                gameState.actionState = { verb: newVerb, item: { key: null, type: null }, target: { key: null, type: null } };
            }
            updateActionText(dependencies, verbConfig);
        }

        function handleCanvasClick(event) {
            
            console.log('----8<-----------------------------8<----')
            gameState.lastInteractionTime = Date.now();
            if (gameState.dialogue && gameState.dialogue.active) return;
            const target = gameState.hoverTarget;
            const verb = gameState.actionState.verb;

            if (!verb) {
                console.log('No hay verbo seleccionado');
                handleDefaultClick(target, dependencies);
                return;
            }

            const config = verbConfig[verb];
            if (!config) {
                console.log('Verbo no configurado:', verb); 
                return;
            }
            // Selección del primer argumento (puede ser item, object o character según el verbo)
            if (!gameState.actionState.item.key && !gameState.actionState.target.key) {
                // ¿Qué tipos acepta el verbo como primer argumento?
                let firstExpected = config.expects[0];
                // Si es un array (varios tipos posibles)
                if (Array.isArray(firstExpected)) {
                    if (target != null){
                        if (firstExpected.includes(target.type)) {
                            console.log('Primer argumento válido: [' + target.type + '] ' + target.key);
                            // Guarda el argumento en el campo correcto
                            if (target.type === 'item') {
                                gameState.actionState.item.key = target.key;
                                gameState.actionState.item.type = target.type;
                            } else {
                                gameState.actionState.target.key = target.key;
                                gameState.actionState.target.type = target.type;
                            }
                            updateActionText(dependencies, verbConfig);

                            // Si solo requiere un argumento, ejecuta la acción
                            if (config.expects.length === 1 && !config.optional) {
                                console.log('Ejecutando acción con un solo argumento');
                                handleActionClick(dependencies);
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
                            gameState.actionState.item.key = item.key;
                            gameState.actionState.item.type = item.type;
                        } else {
                            gameState.actionState.target.key = target.key;
                            gameState.actionState.target.type = target.type;
                        }
                        updateActionText(dependencies, verbConfig);

                        if (config.expects.length === 1 && !config.optional) {
                            console.log('Ejecutando acción con un solo argumento');
                            handleActionClick(dependencies);
                        }
                        return;
                    }
                }
                console.log('Primer argumento NO válido:', target?.type, target?.key);

            }

            // Selección del segundo objeto/target si es necesario u opcional
            if (gameState.actionState.item && !gameState.actionState.target) {
                // Si el verbo permite un segundo objeto opcional
                if (config.optional && config.optional.includes(target.type)) {
                    console.log('Segundo argumento opcional válido:', target.type, target.key);
                    gameState.actionState.target.key = target.key;
                    gameState.actionState.target.type = target.type;
                    handleActionClick(dependencies);
                    return;
                }
                // Si el verbo requiere un target específico
                if (config.expects[1] && target.type === config.expects[1]) {
                    console.log('Segundo argumento requerido válido:', target.type, target.key);
                    gameState.actionState.target.key = target.key;
                    gameState.actionState.target.type = target.type;
                    handleActionClick(dependencies);
                    return;
                }
                // Si no se requiere segundo objeto, ejecuta la acción
                if (!config.expects[1]) {
                    console.log('Ejecutando acción con un solo argumento (sin segundo requerido)');
                    handleActionClick(dependencies);
                    return;
                }
                console.log('Segundo argumento NO válido:', target?.type, target?.key);
            }
        }
////////////////// LIMPIAR ESTO
        function handleDefaultClick(target, dependencies) {
            if (target != null){
                if (target.type === 'object' && (target.key.startsWith('salida_') || target.key.startsWith('entrada_'))) {
                    const from = gameState.currentScene;
                    const to = target.key.includes('patio') ? 'patio' : (target.key.includes('cocina') ? 'cocina' : 'quincho');
                    scenes[from].characters = scenes[from].characters.filter(c => c !== gameState.currentPlayer);
                    scenes[to].characters.push(gameState.currentPlayer);
                    gameState.currentScene = to;
                    characters[gameState.currentPlayer].x = target.key.startsWith('salida_') ? 50 : 700;
                    dependencies.fullRedraw();
                } else if (target.type === 'character' && target.key !== gameState.currentPlayer) {
                    startDialogue(gameState.currentPlayer, target.key, dependencies);
                } else {
                    dependencies.dialogueText.textContent = target.data.description;
                }
            }
        }
//////////////////////////////////

        function handleActionClick(dependencies) {
            let actionResultText = "";
            let dialogueStarted = false;
            const { gameState, characters, scenes, objects, items, puzzles } = dependencies;

            //TODO: Implementar el control de acciones con scripts.
            // Quizas 
            if (gameState != null) {
                if (gameState.actionState != null) {
                    const { verb, item, target } = gameState.actionState;
                    console.log(verb, item, target);

                    //Generamos el nombre del action-script con VERBO_ITEM_TARGET
                    let actionScriptName = gameState.currentPlayer +"_"+`${verb}`;
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
    /**
 
        // switch (gameState.actionState) {
                        //     case 'TALK_TO': //////////////////////
                        //         if (target.type === 'character' && target.key !== gameState.currentPlayer) {
            //             startDialogue(gameState.currentPlayer, target.key, dependencies);
            //             dialogueStarted = true;
            //         } else {
            //             actionResultText = "No puedes hablar con eso.";
            //         }
            //         break;
            //     case 'IR_A': //////////////////////
            //         characters[gameState.currentPlayer].x = event.offsetX - (characters[gameState.currentPlayer].width / 2);
            //         characters[gameState.currentPlayer].y = event.offsetY - characters[gameState.currentPlayer].height;
            //         break;
            //     case 'AGARRAR': //////////////////////
            //         if (target.type === 'character') {
            //             actionResultText = characters[target.key].onGrab || "No puedes agarrar a una persona.";
            //         } else if (target.type === 'item' && target.data.canBePickedUp) {
            //             gameState.inventories[gameState.currentPlayer].push(target.key);
            //             actionResultText = `Agarraste: ${target.data.name}`;
            //             delete scenes[gameState.currentScene].items[target.key];
            //             updateInventoryView(dependencies);
            //         } else { 
            //             actionResultText = "No puedes agarrar eso."; 
            //         }
            //         break;
            //     case 'DAR': //////////////////////
            //         if (gameState.activeItem && target.type === 'character' && target.key !== gameState.currentPlayer) {
            //             const itemIndex = gameState.inventories[gameState.currentPlayer].indexOf(gameState.activeItem);
            //             if (itemIndex > -1) {
            //                 const itemName = gameState.activeItem;
            //                 gameState.inventories[gameState.currentPlayer].splice(itemIndex, 1);
            //                 gameState.inventories[target.key].push(itemName);
            //                 gameState.activeItem = null;
            //                 actionResultText = `Le diste ${itemName.replace(/_/g, ' ')} a ${target.data.alias}`;
            //                 updateInventoryView(dependencies);
            //             } else {
            //                 actionResultText = "No tienes ese objeto.";
            //             }
            //         } else if (!gameState.activeItem) {
            //             actionResultText = "¿Dar qué?";
            //         } else {
            //             actionResultText = "No puedes darle eso.";
            //         }
            //         break;
            //     case 'USAR': //////////////////////
            //         if (gameState.activeItem && target) {
            //             const puzzleKey = `usar_${gameState.activeItem}_en_${target.key}`;
            //             if (puzzles[puzzleKey]) {
            //                 actionResultText = puzzles[puzzleKey](dependencies);
            //                 updateInventoryView(dependencies);
            //             } else {
            //                 actionResultText = "No tiene sentido usar eso así.";
            //             }
            //         } else {
            //             actionResultText = "¿Usar qué con qué?";
            //         }
            //         break;
            //     case 'ABRIR': //////////////////////
            //         if (target.type === 'object' && target.key === 'heladera') {
            //             const heladera = scenes.cocina.objects.heladera;
            //             if (heladera.isStuck) {
            //                 actionResultText = "La puerta está atascada. No se abre.";
            //             } else if (!heladera.isOpen) {
            //                 heladera.isOpen = true;
            //                 scenes.cocina.items.carne.isHidden = false;
            //                 actionResultText = "Abriste la heladera. ¡Ahí está la carne!";
            //             } else {
            //                 actionResultText = "La heladera ya está abierta.";
            //             }
            //         } else {
            //             actionResultText = "No puedes abrir eso.";
            //         }
            //         break;
            //     case 'PRENDER': //////////////////////
            //          if (target.type === 'object' && target.key === 'parrilla') {
            //             const parrilla = scenes.quincho.objects.parrilla;
            //             if (parrilla.hasCarbon && !parrilla.isLit) {
            //                 if (gameState.inventories[gameState.currentPlayer].includes('encendedor')) {
            //                     parrilla.isLit = true;
            //                     actionResultText = "Usaste el encendedor. ¡El fuego está prendido!";
            //                 } else {
            //                     actionResultText = "Necesitas algo para prender el fuego.";
            //                 }
            //             } else if (!parrilla.hasCarbon) {
            //                 actionResultText = "Primero hay que poner el carbón.";
            //             } else {
            //                 actionResultText = "El fuego ya está prendido.";
            //             }
            //         } else {
            //             actionResultText = "No puedes prender eso.";
            //         }
            //         break;

            //     case 'LLEVAR': //////////////////////
            //          if (gameState.activeItem === 'carne' && target.type === 'object' && target.key === 'parrilla') {
            //             const parrilla = scenes.quincho.objects.parrilla;
            //             if (gameState.currentPlayer === 'Rata') {
            //                 if (parrilla.isLit) {
            //                     const carneIndex = gameState.inventories['Rata'].indexOf('carne');
            //                     if (carneIndex > -1) {
            //                         gameState.inventories['Rata'].splice(carneIndex, 1);
            //                         actionResultText = "¡El Rata tira la carne a la parrilla! ¡En un rato se come! ¡GANASTE!";
            //                         endGame(dependencies, actionResultText);
            //                     } else {
            //                        actionResultText = "El Rata no tiene la carne.";
            //                     }
            //                 } else {
            //                     actionResultText = "El fuego no está prendido todavía.";
            //                 }
            //             } else {
                //                 actionResultText = "Solo el Rata puede encargarse de la parrilla.";
                //             }
            //         } else if (gameState.activeItem === 'bolsa_carbon' && target.key === 'parrilla') {
            //             const parrilla = scenes.quincho.objects.parrilla;
            //             if (!parrilla.hasCarbon) {
            //                 parrilla.hasCarbon = true;
            //                 const carbonIndex = gameState.inventories[gameState.currentPlayer].indexOf('bolsa_carbon');
            //                 if(carbonIndex > -1) gameState.inventories[gameState.currentPlayer].splice(carbonIndex, 1);
            //                 scenes.quincho.objects.parrilla.description = "Parrilla con carbón";
            //                 actionResultText = "Tiraste el carbón en la parrilla. Ya casi estamos.";
            //                 updateInventoryView(dependencies);
            //             } else {
            //                 actionResultText = "Ya tiene carbón.";
            //             }
            //         } else {
            //             actionResultText = "¿Llevar qué y a dónde?";
            //         }
            //         break;

            //     default: //////////////////////
            //          actionResultText = target.data.description;
            //          break;
            // }
*/
        
            
            //if (!dialogueStarted && !(actionResultText.includes("GANASTE"))) { //TODO: Cambiar esto. el fin del juego de hacerse con un script

                const r = runActionScript(actionScriptName);
                    //dependencies.dialogueText.textContent = runActionScript(actionScriptName);
            //}
                    gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };

                    //if (!actionResultText.includes("GANASTE")) { //TODO: El fin del juego debe controlarse con un script
                    //    gameState.actionState = { verb: null, item: null, target: null };
                    //    gameState.activeItem = null;
                    //}
                    //updateDialogueText(dependencies);                   
                    dependencies.fullRedraw();
                }
            }
        }
                
        function handleCanvasMousemove(event) {
            if (gameState.dialogue && gameState.dialogue.active) return;
            const rect = canvas.getBoundingClientRect();
            gameState.hoverTarget = getTargetAt(event.clientX - rect.left, event.clientY - rect.top, dependencies);
            updateActionText(dependencies, verbConfig);
            dependencies.fullRedraw();
        }

        /**
         * Determina qué elemento del escenario (objeto, item o personaje) está bajo las coordenadas (x, y).
         * Devuelve un objeto con { key, data, type } si encuentra un target, o null si no hay nada en esa posición.
         */
        function getTargetAt(x, y, { scenes, characters, objects, items, gameState }) {
            // Obtiene la escena actual según el estado del juego
            const scene = scenes[gameState.currentScene];

            // Crea una lista de todos los posibles targets en la escena:
            // - Objetos del escenario (type: 'object')
            // - Items visibles (type: 'item')
            // - Personajes presentes (type: 'character')
            const allTargets = [
                // Items que no están ocultos
                ...scene.items.filter(itemKey => !items[itemKey].isHidden).map(itemKey => ({ key: itemKey, data: items[itemKey], type: 'item' })),
                // Objetos del escenario
                ...scene.objects.map(objectKey => ({ key: objectKey, data: objects[objectKey], type: 'object' })),
                // Personajes en la escena
                ...scene.characters.map(charKey => ({ key: charKey, data: characters[charKey], type: 'character' }))
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

        canvas.addEventListener('mousemove', handleCanvasMousemove);
        canvas.addEventListener('click', handleCanvasClick);
        document.querySelectorAll('.verb-button').forEach(b => b.addEventListener('click', () => handleVerbClick(b.textContent)));
        
        setupCharacterSwitcher(dependencies);
        updateInventoryView(dependencies);
        dependencies.fullRedraw();
    });
});

//////////////////////////////////////////////////////////////////////////////////////
///
///    API - FUNCTIONS CALLABLE FROM THE STORY'S ACTION SCRIPTS 
///
//////////////////////////////////////////////////////////////////////////////////////

export function runActionScript (name){
    //Ejecutamos el script que devuelve un texto:
    if (storyScripts[name]) {
        console.log("El script existe");
        return storyScripts[name]();
    } else {
        if (storyScripts["default"]) {
            console.log("Corriendo el script 'default'");
            return storyScripts["default"]();
        } else {
            console.log("El script no existe");
            return "";
        }
    }
}

export function say(what) {
    //dialogueText.textContent = what;
    const textLen = what.length;
    const textSpeed = textLen * uiOptions.dialogueSpeed;
    console.log("say: " + what + " (len=" + textLen + ", speed=" + textSpeed + "ms)");
    showDialogueLine(what);
    //setTimeout(() => { if (dialogueText) dialogueText.textContent = '' }, textSpeed);
}

export function actorChangeScene (actor, destination){
    /**
     * Cambia el actor de una escena a otra.
     */
    console.log("Cambiando la escena de '" + actor + "' a:" + destination);
    //console.log(gameData.scenes.includes(destination) + "--" + gameData.characters.includes(actor))
    const {scenes, characters} = gameData;
    const from = gameState.currentScene;
    //if (scenes.includes(destination) && characters.includes(actor)) {
        scenes[from].characters = scenes[from].characters.filter(c => c !== actor);
        scenes[destination].characters.push(actor);
    //}
    //Si el actor es el jugador actual, cambia la escena
    if (actor === gameState.currentPlayer) {
        gameState.currentScene = destination;
    }
}