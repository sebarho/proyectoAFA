import { runScript } from "./api.js";
import {
    storyData,
    storyScripts
} from "./data.js"

import { updateActionText } from "./ui.js"; //TODO: implementar como evento!


//////////////////////////////////////////////////////////////////////////////////////
///
///    P U B L I C   V A R I  A B L E S 
///
//////////////////////////////////////////////////////////////////////////////////////

// copia el contenido de storyData a gameData para que pueda ser modificable.
export const gameData = {
    inits: [],
    verbs: [],
    characters: [],
    objects: [],
    items: [],
    scenes: [],
    dialogueMatrix: []
}

export const gameState = {
    currentPlayer: null,
    currentScene: null,
    actionState: {
        verb: null,
        item: { key: null, type: null },
        target: { key: null, type: null }
    },
    inventories: { null: [] },
    activeItem: null,   //TODO: Ya no se manejará mas asi el inventario
    // Borrar!
    hoverTarget: null,
    dialogue: null,
    lastInteractionTime: Date.now(),
};

export const globals = {
    debugMode: false,
    engineVersion: '0.8.0',
    engineName: "AFAengine",
};

//////////////////////////////////////////////////////////////////////////////////////
///
///    P R I V A T E   V A R I A B L E S
///
//////////////////////////////////////////////////////////////////////////////////////

let verbConfig = null;

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
///
///    P R I V A T E   F U N C T I O N S
///
//////////////////////////////////////////////////////////////////////////////////////

export function handleClick() {
    console.log('----8<-----------------------------8<----')
    gameState.lastInteractionTime = Date.now();
    if (gameState.dialogue && gameState.dialogue.active) return;
    const target = gameState.hoverTarget;
    const verb = gameState.actionState.verb;

    if (!verb) {
        console.log('No hay verbo seleccionado');
        //handleDefaultClick(target, ui);
        return;
    }

    const config = getVerbConfig()[verb];
    if (!config) {
        console.log('--Verbo no configurado:', verb);
        //TODO: Pensar en un 'default' que si no especifica configuracion de una por defecto
        // quizas: [['item','object','character'],null]
        return;
    }
    // Selección del primer argumento (puede ser item, object o character según el verbo)
    if (!gameState.actionState.item.key && !gameState.actionState.target.key) {
        console.log("--no hay ni item ni target");
        // ¿Qué tipos acepta el verbo como primer argumento?
        let firstExpected = config.expects[0];
        // Si es un array (varios tipos posibles)
        if (Array.isArray(firstExpected)) {
            // Es un array
            console.log("---es un array");
            if (target != null) {
                if (firstExpected.includes(target.type)) {
                    console.log('----Primer argumento válido: [' + target.type + '] ' + target.key);
                    // Guarda el argumento en el campo correcto
                    //if (target.type === 'item') {
                    console.log("-----guarda en item");
                    gameState.actionState.item.key = target.key;
                    gameState.actionState.item.type = target.type;
                    //} else {
                    //    console.log("guarda en target");
                    //    gameState.actionState.target.key = target.key;
                    //    gameState.actionState.target.type = target.type;
                    //}
                    updateActionText(getVerbConfig());

                    // Si solo requiere un argumento, ejecuta la acción
                    if (config.expects.length === 1 && !config.optional) {
                        console.log('------Ejecutando acción con un solo argumento');
                        parseAction();
                    }
                    return;
                }
                return
            }
        } else {
            // Solo un tipo permitido
            console.log("---Solo un tipo permitido");
            if (target.type === firstExpected) {
                console.log('----Primer argumento válido:', target.type, target.key);
                //if (target.type === 'item') {
                console.log("-----guarda en item");
                gameState.actionState.item.key = target.key;
                gameState.actionState.item.type = target.type;
                //} else {
                //    gameState.actionState.target.key = target.key;
                //    gameState.actionState.target.type = target.type;
                //}
                updateActionText(getVerbConfig());

                if (config.expects.length === 1 && !config.optional) {
                    console.log('------Ejecutando acción con un solo argumento');
                    parseAction();
                }
                return;
            }
        }
        console.log('---Primer argumento NO válido:', target?.type, target?.key);

    }
    console.log("--ya analizamos el primer argumento (item)");
    // Selección del segundo objeto/target si es necesario u opcional
    if (gameState.actionState.item.key && !gameState.actionState.target.key) {
        console.log("---Analizamos lo seleccionado como 2do objeto");
        // Si el verbo permite un segundo objeto opcional
        if (config.optional && config.optional.includes(target.type)) {
            console.log('----Segundo argumento opcional válido:', target.type, target.key);
            gameState.actionState.target.key = target.key;
            gameState.actionState.target.type = target.type;
            parseAction()
        }
        // Si el verbo requiere un target específico
        if (config.expects[1] && target.type === config.expects[1]) {
            console.log('Segundo argumento requerido válido:', target.type, target.key);
            gameState.actionState.target.key = target.key;
            gameState.actionState.target.type = target.type;
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
    /**
     * Intenta buscar las funciones en el siguiente orden
     *  1 - ACTOR_VERBO_ITEM_TARGET (si existe target)
     *  2 - ACTOR_VERBO_ITEM
     *  3 - ACTOR_VERBO
     *  4 - VERBO_ITEM_TARGET (si existe target)
     *  5 - VERBO_ITEM
     *  6 - 'default'
     * 
     *  The script function names are in lowercase  
     */
    let success =false
    const candidates = [];
    console.log('parseAction: Ejecutando acción:', gameState.actionState);

    // Verify gameState and action state are not 'null'
    if (gameState != null) {
        if (gameState.actionState != null) {
            // Get verb, item and target from the actionState object
            const { verb, item, target } = gameState.actionState;
            console.log(verb, item, target);

            // Case 1: ACTOR_VERBO_ITEM_TARGET(if 'target' exists)
            if (target.key != null) {
                candidates.push((gameState.currentPlayer + "_" + verb + "_" + item.key + "_" + target.key).toLowerCase());
            }
            // Case 2: ACTOR_VERBO_ITEM
            candidates.push((gameState.currentPlayer + "_" + verb + "_" + item.key).toLowerCase());
            // Case 3: ACTOR_VERBO
            candidates.push((gameState.currentPlayer + "_" + verb ).toLowerCase());
            // Case 4: VERBO_ITEM_TARGET(si existe target)
            if (target.key != null) {
                candidates.push((verb + "_" + item.key + "_" + target.key).toLowerCase());
            }                
            // Case 5: VERBO_ITEM
            candidates.push((verb + "_" + item.key).toLowerCase());
            // Case 6: 'default'
            candidates.push("default");

            // Iterate over candidates and execute the first one that exists,
            // and exits the loop
            for (const c of candidates) {
                console.log("Checking script:", c);
                if (storyScripts[c]) {
                    runActionScript(c);
                    success=true;
                    break;
                }
            }
            if (!success) {console.log('No existe ningun script para la acción ejecutada');}
            gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
            updateActionText();
            return;
        } 
    }
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
///
///    P U B L I C   F U N C T I O N S
///
//////////////////////////////////////////////////////////////////////////////////////

export function init() {
    // Copies storyData to gameData
    gameData.inits = storyData.inits;
    gameData.verbs = storyData.verbs;
    gameData.characters = storyData.characters;
    gameData.objects = storyData.objects;
    gameData.items = storyData.items;
    gameData.scenes = storyData.scenes;
    gameData.dialogueMatrix = storyData.dialogueMatrix;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getGameData() {
    return gameData;
}
//////////////////////////////////////////////////////////////////////////////////////

export function runActionScript(name) {
    //Ejecutamos el script que devuelve un texto:
    if (storyScripts[name]) {
        console.log(`Running action script "${name}"`);
        return storyScripts[name]();
        // gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
        // updateActionText();
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function configureVerbs() {
    verbConfig = null;
    verbConfig = gameData.verbs;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getVerbConfig() {
    if (verbConfig) { return verbConfig; }
    console.log("<!> Engine.js: verConfig no inicializado.")
    return null;
}
//////////////////////////////////////////////////////////////////////////////////////

export function handleVerbClick(verb) {
    const newVerb = verb.toUpperCase().replace(' ', '_');
    if (gameState.actionState.verb === newVerb) {
        gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
    } else {
        gameState.actionState = { verb: newVerb, item: { key: null, type: null }, target: { key: null, type: null } };
    }
    updateActionText(getVerbConfig());
}
//////////////////////////////////////////////////////////////////////////////////////

export function getItemData(itemName) {
    /// Helper function to find an item's data
    if (gameData.items[itemName]) {
        return gameData.items[itemName];
    }
    // If not found in any scene, it might be a dynamically added item or an error
    // We can return a default object or null
    // return { name: itemName.replace(/_/g, ' ') };
    return null
}
//////////////////////////////////////////////////////////////////////////////////////
