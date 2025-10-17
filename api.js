//////////////////////////////////////////////////////////////////////////////////////
///
///    API - FUNCTIONS CALLABLE FROM THE STORY'S ACTION SCRIPTS 
///
//////////////////////////////////////////////////////////////////////////////////////

//import { runActionScript } from './game.js';
import {
    gameState,
    gameData,
    runActionScript
} from './engine.js';
import { drawScene } from './renderer.js';
import {
    startDialogue as startDial, showDialogueLine, updateInventoryView, uiOptions,
    setupCharacterSwitcher
} from './ui.js';
/////////////////////////////////////////////////////////////////////////////////////

export function getGameData() {
    /**
     * Presented as a function to encapsulate it
     */
    return gameData;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getGameState() {
    /**
     * Presented as a function to encapsulate it
     */
    return gameState;
}
//////////////////////////////////////////////////////////////////////////////////////

export function addPlayer(name) {
    /**
     * Makes a character playable and updates de character switcher
     */
    if (gameData.characters.includes(name)) {
        gameData.characters[name].playable = true;
        setupCharacterSwitcher;
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function removePlayer(name) {
    /**
     * Makes a character unplayable and updates de character switcher
     */
    if (gameData.characters.includes(name)) {
        gameData.characters[name].playable = false;
        setupCharacterSwitcher;
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function runScript(name) {
    //Ejecutamos el script:
    return runActionScript(name);
}
//////////////////////////////////////////////////////////////////////////////////////

export function say(what) {
    //dialogueText.textContent = what;
    console.log(what);
    const textLen = what.length;
    const textSpeed = textLen * uiOptions.dialogueSpeed;
    console.log("say: " + what + " (len=" + textLen + ", speed=" + textSpeed + "ms)");
    showDialogueLine(what);
    //setTimeout(() => { if (dialogueText) dialogueText.textContent = '' }, textSpeed);
}
//////////////////////////////////////////////////////////////////////////////////////

export function actorChangeScene(actor, destination) {
    /**
     * Cambia el actor de una escena a otra.
    */
    console.log("Cambiando la escena de '" + actor + "' a:" + destination);
    //console.log(gameData.scenes.includes(destination) + "--" + gameData.characters.includes(actor))
    const { scenes, characters } = gameData;
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
//////////////////////////////////////////////////////////////////////////////////////

export function addItemToActor(characterName, itemName) {
    const character = gameData.characters[characterName];

    if (!character) {
        console.warn(`addItemToCharacter: El personaje "${characterName}" no existe.`);
        return;
    }

    // Asegura que el inventario esté inicializado como array
    if (!Array.isArray(character.inventory)) {
        character.inventory = [];
    }

    // Evita duplicados (opcional)
    if (!character.inventory.includes(itemName)) {
        character.inventory.push(itemName);
        console.log(`addItemToCharacter: Se agregó "${itemName}" al inventario de "${characterName}".`);
    } else {
        console.log(`addItemToCharacter: El ítem "${itemName}" ya está en el inventario de "${characterName}".`);
    }

    // Si el personaje activo es el que recibe el ítem, actualiza la vista
    if (gameState.currentPlayer === characterName) {
        updateInventoryView();
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function removeItemFromActor(characterName, itemName) {
    const character = gameData.characters[characterName];

    if (!character || !Array.isArray(character.inventory)) return;

    const index = character.inventory.indexOf(itemName);
    if (index !== -1) {
        character.inventory.splice(index, 1);
        console.log(`removeItemFromCharacter: Se quitó "${itemName}" del inventario de "${characterName}".`);
    }

    if (gameState.currentPlayer === characterName) {
        updateInventoryView();
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function startDialogue(listener, nodeID) {
    const speaker = gameState.currentPlayer;

    if (!speaker || !listener) {
        console.warn(`startDialogue: No se pudo iniciar el diálogo.`);
        return;
    }
    console.log(`startDialogue: Iniciando diálogo "${nodeID}" entre "${speaker}" y "${listener}".`);
    startDial(speaker, listener, nodeID);
}
//////////////////////////////////////////////////////////////////////////////////////

export function abortDaialogues() { }
//////////////////////////////////////////////////////////////////////////////////////

export function getActor(characterName) {
    /**
     * Devuelve el objeto personaje por su nombre.
     */
    if (!gameData.characters.includes(characterName)) {
        console.warn(`getActor: El personaje "${characterName}" no existe.`);
        return null;
    }
    return gameData.characters[characterName];
}
//////////////////////////////////////////////////////////////////////////////////////

export function getItemData(itemName) {
    /**
     * Devuelve el objeto ítem por su nombre.
     */
    if (!gameData.items.includes(itemName)) {
        console.warn(`getItemData: El ítem "${itemName}" no existe.`);
        return null;
    }
    return gameData.items[itemName];
}
//////////////////////////////////////////////////////////////////////////////////////

export function getObjectData(objectName) {
    /**
     * Devuelve el objeto por su nombre.
     * Si el objeto no existe, devuelve null y muestra una advertencia en la consola.
     */
    if (!gameData.objects[objectName]) {
        console.warn(`getObjectData: El objeto "${objectName}" no existe.`);
        return null;
    }
    return gameData.objects[objectName];
}
//////////////////////////////////////////////////////////////////////////////////////

export function getSceneData(sceneName) {
    /**
     * Devuelve el objeto escena por su nombre.
     */
    if (!gameData.scenes[sceneName]) {
        console.warn(`getSceneData: La escena "${sceneName}" no existe.`);
        return null;
    }
    return gameData.scenes[sceneName];
}
//////////////////////////////////////////////////////////////////////////////////////

export function moveItemToScene(itemName, sceneName) {
    /**
     * Mueve un ítem a una escena específica.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`moveItemToScene: El ítem "${itemName}" no existe.`);
        return;
    }

    // Remueve el ítem de cualquier escena donde esté actualmente
    Object.values(gameData.scenes).forEach(scene => {
        const index = scene.items.indexOf(itemName);
        if (index !== -1) {
            scene.items.splice(index, 1);
        }
    });

    // Agrega el ítem a la nueva escena
    const targetScene = gameData.scenes[sceneName];
    if (targetScene) {
        targetScene.items.push(itemName);
        console.log(`moveItemToScene: Se movió "${itemName}" a la escena "${sceneName}".`);
    } else {
        console.warn(`moveItemToScene: La escena "${sceneName}" no existe.`);
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function getItem(itemName) {
    /**
     * El jugador actual recoge un ítem del escenario.
     */
    const scene = gameData.scenes[gameState.currentScene];
    const itemIndex = scene.items.indexOf(itemName);
    if (itemIndex === -1) {
        console.warn(`getItem: El ítem "${itemName}" no está en la escena actual.`);
        return;
    }
    scene.items.splice(itemIndex, 1);
    console.log(`getItem: El ítem "${itemName}" ha sido recogido.`);
    addItemToActor(gameState.currentPlayer, itemName);
}
//////////////////////////////////////////////////////////////////////////////////////

export function dropItem(itemName) {
    /**
     * 
     */
    const character = gameData.characters[gameState.currentPlayer];
    if (!character || !Array.isArray(character.inventories)) {
        console.warn(`dropItem: El personaje "${gameState.currentPlayer}" no tiene inventario.`);
        return;
    }
    const itemIndex = character.inventories.indexOf(itemName);
    if (itemIndex === -1) {
        console.warn(`dropItem: El ítem "${itemName}" no está en el inventario de "${gameState.currentPlayer}".`);
        return;
    }
    character.inventories.splice(itemIndex, 1);
    console.log(`dropItem: El ítem "${itemName}" ha sido soltado.`);
    const scene = gameData.scenes[gameState.currentScene];
    scene.items.push(itemName);
}
//////////////////////////////////////////////////////////////////////////////////////

export function removeItemFromInventory(itemName) {
    /**
     * 
     */
    const character = gameData.characters[gameState.currentPlayer];
    if (!character || !Array.isArray(character.inventories)) {
        console.warn(`removeItemFromInventory: El personaje "${gameState.currentPlayer}" no tiene inventario.`);
        return;
    }
    const itemIndex = character.inventories.indexOf(itemName);
    if (itemIndex === -1) {
        console.warn(`removeItemFromInventory: El ítem "${itemName}" no está en el inventario de "${gameState.currentPlayer}".`);
        return;
    }
    character.inventories.splice(itemIndex, 1);
    console.log(`removeItemFromInventory: El ítem "${itemName}" ha sido removido del inventario.`);
}
//////////////////////////////////////////////////////////////////////////////////////

export function showActor(characterName) {
    /**
     * cambia a la escena donde se encuentra un personaje.
    */
    if (!gameData.characters[characterName]) {
        console.warn(`showActor: El personaje "${characterName}" no existe.`);
        return;
    }
    // Busca la escena donde está el personaje
    const sceneName = Object.keys(gameData.scenes).find(sceneKey => gameData.scenes[sceneKey].characters.includes(characterName));
    if (sceneName) {
        state.currentScene = sceneName;
        console.log(`showActor: La escena actual es ahora "${sceneName}" donde está "${characterName}".`);
        drawScene(ui);
    } else {
        console.warn(`showActor: El personaje "${characterName}" no está en ninguna escena.`);
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function setItemFlag(itemName, flag, value) {
    /**
     * Establece una marca (flag) en un ítem.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`setItemFlag: El ítem "${itemName}" no existe.`);
        return;
    }
    item.flags[flag] = value;
    console.log(`setItemFlag: La marca "${flag}" del ítem "${itemName}" ha sido establecida en "${value}".`);
}
//////////////////////////////////////////////////////////////////////////////////////

export function canItemBePickedUp(itemName) {
    /**
     * Verifica si un ítem puede ser recogido.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`canItemBePickedUp: El ítem "${itemName}" no existe.`);
        return false;
    }
    return item.isPickable;
}
//////////////////////////////////////////////////////////////////////////////////////

export function isItemHidden(itemName) {
    /**
     * Verifica si un ítem está oculto.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`isItemHidden: El ítem "${itemName}" no existe.`);
        return false;
    }
    return !!item.isHidden;
}
//////////////////////////////////////////////////////////////////////////////////////

export function isItemFlagSet(itemName, flag) {
    /**
     * Verifica si una marca (flag) en un ítem está establecida.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`isItemFlagSet: El ítem "${itemName}" no existe.`);
        return false;
    }
    if (!item.flags.includes(flag)) {
        console.warn(`isItemFlagSet: La marca "${flag}" del ítem "${itemName}" no está establecida.`);
        return false;
    }
    return !!item.flags[flag];
}
//////////////////////////////////////////////////////////////////////////////////////

export function toggleItemFlag(itemName, flag) {
    /**
     * Alterna el valor de una marca (flag) en un ítem.
     */
    const item = gameData.items[itemName];
    if (!item) {
        console.warn(`toggleItemFlag: El ítem "${itemName}" no existe.`);
        return;
    }
    if (!item.flags.includes(flag)) {
        console.warn(`toggleItemFlag: La marca "${flag}" del ítem "${itemName}" no está establecida.`);
        return;
    }
    item.flags[flag] = !item.flags[flag];
    console.log(`toggleItemFlag: La marca "${flag}" del ítem "${itemName}" ha sido alternada a "${item.flags[flag]}".`);
}
//////////////////////////////////////////////////////////////////////////////////////

export function giveItemTo(itemName, characterName) {
    /**
     * El jugador actual le da un ítem a otro personaje.
     */
    const character = gameData.characters[state.currentPlayer];
    if (!character || !Array.isArray(character.inventories)) {
        console.warn(`giveItemTo: El personaje "${state.currentPlayer}" no tiene inventario.`);
        return;
    }
    const itemIndex = character.inventories.indexOf(itemName);
    if (itemIndex === -1) {
        console.warn(`giveItemTo: El ítem "${itemName}" no está en el inventario de "${state.currentPlayer}".`);
        return;
    }
    character.inventories.splice(itemIndex, 1);
    console.log(`giveItemTo: El ítem "${itemName}" ha sido dado a "${characterName}".`);
    addItemToActor(characterName, itemName);
}
//////////////////////////////////////////////////////////////////////////////////////

export function setObjectState(objectName, state, value) {
    /**
     *  Cambia el estado de un objeto.
     */
    if (!gameData.objects[objectName]) {
        console.warn(`setObjectState: El objeto "${objectName}" no existe en gameData.`);
        return;
    }
    gameData.objects[objectName][state] = value;
    console.log(`setObjectState: El estado "${state}" del objeto "${objectName}" ha sido cambiado a "${value}".`);
    // Si el objeto está en la escena actual, redibuja
    const scene = gameData.scenes[state.currentScene];
    if (scene.objects.includes(objectName)) {
        drawScene(ui);
    }
}
//////////////////////////////////////////////////////////////////////////////////////

export function getObjectState(objectName, state) {
    /**
     * Obtiene el estado de un objeto.
     */
    if (!gameData.objects[objectName]) {
        console.warn(`getObjectState: El objeto "${objectName}" no existe en gameData.`);
        return;
    }
    return gameData.objects[objectName][state];
}
//////////////////////////////////////////////////////////////////////////////////////

export function actorHasItem(characterName, itemName) {
    /**
     * Verifica si un personaje tiene un ítem en su inventario.
     */
    if (!gameData.characters[characterName]) {
        console.warn(`actorHasItem: El personaje "${characterName}" no existe.`);
        return false;
    }
    const character = gameData.characters[characterName];
    if (!character || !Array.isArray(character.inventories)) {
        console.warn(`actorHasItem: El personaje "${characterName}" no tiene inventario.`);
        return false;
    }
    return character.inventories.includes(itemName);
}
//////////////////////////////////////////////////////////////////////////////////////

export function isObjectInState(objectName, state, value) {
    /**
     * Verifica si un objeto está en un estado específico.
     */
    if (!gameData.objects[objectName]) {
        console.warn(`isObjectInState: El objeto "${objectName}" no existe.`);
        return false;
    }
    return gameData.objects[objectName][state] === value;
}
//////////////////////////////////////////////////////////////////////////////////////

export function changeActor(characterName, ui) {
    /**
     * Cambia el personaje jugador actual.
     */
    if (!gameData.characters[characterName]) {
        console.warn(`changePlayer: El personaje "${characterName}" no existe.`);
        return;
    }
    state.currentPlayer = characterName;
    console.log(`changePlayer: El personaje jugador actual es ahora "${characterName}".`);
    updateInventoryView(ui);
    // Si el nuevo jugador no está en la escena actual, lo movemos allí
    showActor(characterName);
}
//////////////////////////////////////////////////////////////////////////////////////

export function changeScene(sceneName) {
    /**
     * Cambia la escena indicada.
     */
    if (!gameData.scenes[sceneName]) {
        console.warn(`changeScene: La escena "${sceneName}" no existe.`);
        return;
    }
    state.currentScene = sceneName;
    console.log(`changeScene: La escena actual es ahora "${sceneName}".`);
    drawScene(ui);
}
//////////////////////////////////////////////////////////////////////////////////////

export function getCurrentPlayer() {
    return state.currentPlayer;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getCurrentScene() {
    return state.currentScene;
}
//////////////////////////////////////////////////////////////////////////////////////

export function getInventory(characterName) {
    /**
     * Devuelve el inventario de un personaje.
     */
    if (!gameData.characters[characterName]) {
        console.warn(`getInventory: El personaje "${characterName}" no existe.`);
        return [];
    }
    return gameData.characters[characterName].inventories || [];
}
//////////////////////////////////////////////////////////////////////////////////////

export function hideUI() {
    /**
     * Oculta la interfaz de usuario.
     */
    ui.verbBar.style.display = 'none';
    ui.inventoryBox.style.display = 'none';
    ui.characterSwitcher.style.display = 'none';
    ui.actionText.style.display = 'none';
    ui.dialogueOptionsContainer.style.display = 'none';
}
//////////////////////////////////////////////////////////////////////////////////////


export function showUI() {
    /**
     * Muestra la interfaz de usuario.
     */
    ui.verbBar.style.display = 'block';
    ui.inventoryBox.style.display = 'block';
    ui.characterSwitcher.style.display = 'block';
    ui.actionText.style.display = 'block';
    ui.dialogueOptionsContainer.style.display = 'block';
}
//////////////////////////////////////////////////////////////////////////////////////

export function wait(frames) {
    /**
     * Pausa la ejecución del script durante un número de frames.
     * Implementa un sistema de espera basado en frames con un contador global de frames 
    */
    let frameCount = 0;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            frameCount++;
            if (frameCount >= frames) {
                clearInterval(interval);//
                resolve();
            }
        }, 1000 / 60);
    });
}
//////////////////////////////////////////////////////////////////////////////////////

export function setTimer(callback, milliseconds) {
    /**
     * Establece un temporizador que ejecuta un callback después de un número de milisegundos.
     */
    return setTimeout(callback, milliseconds);
}
//////////////////////////////////////////////////////////////////////////////////////

export function clearTimer(timerID) {
    /**
     * Cancela un temporizador previamente establecido.
     */
    //TODO: Implementar
}
//////////////////////////////////////////////////////////////////////////////////////
