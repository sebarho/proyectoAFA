import { gameData, 
    storyScripts 
} from "./data.js"

import { updateActionText } from "./ui.js"; //TODO: implementar como evento!


//////////////////////////////////////////////////////////////////////////////////////
///
///    P U B L I C   V A R I  A B L E S 
///
//////////////////////////////////////////////////////////////////////////////////////

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
        console.log('Verbo no configurado:', verb);
        return;
    }
    // Selección del primer argumento (puede ser item, object o character según el verbo)
    if (!gameState.actionState.item.key && !gameState.actionState.target.key) {
        // ¿Qué tipos acepta el verbo como primer argumento?
        let firstExpected = config.expects[0];
        // Si es un array (varios tipos posibles)
        if (Array.isArray(firstExpected)) {
            if (target != null) {
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
                    updateActionText(getVerbConfig());

                    // Si solo requiere un argumento, ejecuta la acción
                    if (config.expects.length === 1 && !config.optional) {
                        console.log('Ejecutando acción con un solo argumento');
                        parseAction();
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
    if (gameState.actionState.item && !gameState.actionState.target) {
        // Si el verbo permite un segundo objeto opcional
        if (config.optional && config.optional.includes(target.type)) {
            console.log('Segundo argumento opcional válido:', target.type, target.key);
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
    let actionResultText = "";
    let dialogueStarted = false;
    console.log('parseAction: Ejecutando acción:', gameState.actionState);


    if (gameState != null) {
        if (gameState.actionState != null) {
            const { verb, item, target } = gameState.actionState;
            console.log(verb, item, target);

            //Generamos el nombre del action-script con ACTOR_VERBO_ITEM|TARGET
            let actionScriptName = gameState.currentPlayer + "_" + `${verb}`;
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
                actionScriptName = gameState.currentPlayer + "_" + `${verb}`;
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
            gameState.actionState = { verb: null, item: { key: null, type: null }, target: { key: null, type: null } };
            updateActionText();

        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////
///
///    P U B L I C   F U N C T I O N S
///
//////////////////////////////////////////////////////////////////////////////////////

export function getGameData() {
    return gameData
}
//////////////////////////////////////////////////////////////////////////////////////

export function runActionScript(name) {
    //Ejecutamos el script que devuelve un texto:
    if (storyScripts[name]) {
        console.log(`game.js: Running action script "${name}"`);
        return storyScripts[name]();
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function configureVerbs (){
     verbConfig = null;
     verbConfig = gameData.verbs;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getVerbConfig(){
    if (verbConfig) {return verbConfig;}
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
    return { name: itemName.replace(/_/g, ' ') };
    // return null
}
//////////////////////////////////////////////////////////////////////////////////////
