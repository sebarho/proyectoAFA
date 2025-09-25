import { state as gameState, state } from "./runtime.js";
import { gameData } from "./data.js";
import {parseAction} from "./game.js";


export const uiOptions = {
    dialogueSpeed: 100 // milliseconds per character
};


export const ui = {
    document: null,
    dialogueText: null,
    actionContainer: null,
    actionBox: null,
    actionText: null,
    verbBar: null,
    dialogueContainer: null,
    characterSwitcher: null,
    inventoryBox: null,
    canvas: null, // EL objeto canvas que se iniciara luego de cargar los assets
    ctx: null    // EL contexto 2D del canvas
};

let verbConfig = [];

let speaking = false;

const dialogueQueue = [];

let dialogueActive = false;

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    S U P P O R T    F U N C T I O N S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function getItemData(itemName, gameData) {
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

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    V E R B S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function configureVerbs (vc){
    verbConfig = null;
    verbConfig = vc;
}

export function getVerbConfig(){
    return verbConfig;
}
export function createVerbButtons(vc) {
    /**
     * Creates the verb buttons according to the data in `vc`
    */

    verbConfig = vc; // Store verb configuration globally

    const verbBar = document.getElementById('verb-bar');
    verbBar.innerHTML = ''; // Clear existing buttons

    Object.entries(verbConfig).forEach(([key, config]) => {
        const button = document.createElement('button');
        button.textContent = config.label;
        button.className = 'verb-button';
        //button.addEventListener('click', () => handleVerbClick(key));
        verbBar.appendChild(button);
    });
}

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    C H A R A C T E R S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function setupCharacterSwitcher() {
    /**
     * Sets up the actor's switcher control, with all the characters defined in gameData
     * where character.playable = true 
    */

    //Cleans the character switcher
    ui.characterSwitcher.innerHTML = ""
    
    // Create a title
    //ui.characterSwitcher.innerHTML = '<h3>Amigos:</h3>';

    // Now, creates a button per playable character (actor)
    Object.entries(gameData.characters).forEach(([key, char]) => {
        if (char.playable) {
            if (char.x < 0) return;

            const avatar = document.createElement('div');
            avatar.className = 'character-avatar';
            avatar.textContent = char.alias || char.name;

            avatar.addEventListener('click', () => {
                gameState.currentPlayer = key;
                gameState.activeItem = null; // Deselect item on character switch
                document.querySelectorAll('.character-avatar').forEach(a => a.classList.remove('active'));
                avatar.classList.add('active');
                // Buscar la escena donde está el personaje
                for (const [sceneKey, scene] of Object.entries(gameData.scenes)) {
                    if (scene.characters.includes(key)) {
                        gameState.currentScene = sceneKey;
                        break;
                    }
                }
                updateInventoryView(ui);
                //fullRedraw(); 
            });

            if (key === gameState.currentPlayer) avatar.classList.add('active');
            ui.characterSwitcher.appendChild(avatar);
        };
    });
}

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    I N V E N T O R Y
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function setupInventoryItemEvents(itemElement, itemData) {
    // Hover -> mostrar nombre
    itemElement.addEventListener("mouseenter", () => {
        ui.actionText.textContent = itemData.name;
    });

    itemElement.addEventListener("mouseleave", () => {
        ui.actionText.textContent = "";
    });

    // Click -> marcar en actionState (pero sin toggle visual permanente)
    itemElement.addEventListener("click", () => {
        // if (actionState.item) {
        //     // Si ya había un item seleccionado, esto actúa como target
        //     actionState.target = itemData;
        //     //TODO: Borrar esta linea? executeAction(window.actionState); // acá iría tu lógica
        //     actionState.item = null;
        //     actionState.target = null;
        // } else {
        //     // Primer click -> definir como "item"
        //     actionState.item = itemData;
        //     //TODO: Borrar esta linea? document.getElementById("action-text").textContent = `${itemData.name} seleccionado`;
        // }
        handleClick();
    });
}


//////////////////////////////////////////////////////////////////////////////////////

export function updateInventoryView() {
    const list = document.createElement('ul');
    list.id = 'inventory-list';

    const currentPlayer = gameState.currentPlayer;
    const characterData = gameData.characters[currentPlayer];

    // Validación defensiva
    if (!characterData || !Array.isArray(characterData.inventory)) {
        console.warn(`updateInventoryView: No se encontró inventario para el personaje "${currentPlayer}".`);
        const itemEl = document.createElement('li');
        itemEl.textContent = '(Inventario no disponible)';
        list.appendChild(itemEl);
        ui.inventoryBox.innerHTML = '';
        ui.inventoryBox.appendChild(list);
        return;
    }

    const currentInventory = characterData.inventory;

    // Si el inventario está vacío
    if (currentInventory.length === 0) {
        const itemEl = document.createElement('li');
        itemEl.textContent = '(Vacío)';
        list.appendChild(itemEl);
    } else {
        // Recorre los ítems del inventario
        currentInventory.forEach(itemName => {
            const itemEl = document.createElement('li');
            itemEl.className = 'inventory-item';

            const itemData = getItemData(itemName, gameData);
            itemEl.textContent = itemData ? itemData.name : itemName.replace(/_/g, ' ');

            // Marca el ítem como activo si corresponde
            // TODO: Tal vez esto no tenga que estar...
            if (itemName === gameState.activeItem) itemEl.classList.add('active');

            // Al hacer clic, se activa o desactiva el ítem
            // TODO: EN vez de activar o desactivar el item, deberia agregarse a 'actionState'
            itemEl.onclick = () => {
                
                //gameState.activeItem = (gameState.activeItem === itemName) ? null : itemName;
                //updateInventoryView();
                if (gameState.dialogue && gameState.dialogue.active) {
                    updateDialogueView(); // solo si hay un dialogo en curso
                } else {
                    handleClick();
                }
                
                updateActionText();   // Ahora refresca el texto de acción
            };

            // TODO: Manejar el hoover
            itemEl.onmouseenter = () => {
                const i = { key: itemName, data: itemData, type: "item" };
                gameState.hoverTarget = i;
                updateActionText();
            };
            itemEl.onmouseleave = () => {
                gameState.hoverTarget = null;
                updateActionText();
            };
            
            list.appendChild(itemEl);
        });
    }

    // Limpia y actualiza el contenedor del inventario
    ui.inventoryBox.innerHTML = '';
    ui.inventoryBox.appendChild(list);
}

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    D I A L O G U E S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function isDialogueActive() {
    return dialogueActive;
}

//////////////////////////////////////////////////////////////////////////////////////


export function startDialogue(speakerName, listenerName, nodeKey) {
    /**
     * Establishes a dialogue session between two characters.
     */

    let conversation = gameData.dialogueMatrix[listenerName];

    gameState.dialogue = {
        active: true,
        speaker: speakerName, // The player
        listener: listenerName, // The NPC
        conversation: conversation,
        currentNodeKey: nodeKey || 'start',
        long: 0
    };

    ui.actionContainer.style.display = 'none';
    ui.verbBar.style.display = 'none';
    ui.actionBox.style.display = 'none';
    ui.characterSwitcher.style.display = 'none';
    ui.inventoryBox.style.display = 'none';
    ui.dialogueContainer.style.display = 'flex';
    updateDialogueView();
}

//////////////////////////////////////////////////////////////////////////////////////

function updateDialogueView() {
    /**
     * Actualiaz los botones con las opciones de dialogo. 
     */
    //const { characters, gameState, dialogueOptionsContainer } = ui;
    const { conversation, currentNodeKey, listener } = gameState.dialogue;
    const currentNode = conversation[currentNodeKey];

    if (!currentNode) {
        endDialogue();
        return;
    }

    //dialogueText.textContent = `Hablando con ${characters[listener].alias}...`;
    //ui.dialogueOptionsContainer.innerHTML = '';

    if (Array.isArray(currentNode)) {
        currentNode.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'dialogue-option';
            optionEl.textContent = `> ${option.player}`;
            optionEl.addEventListener('click', () => selectDialogueOption(option, ui));
            ui.dialogueContainer.appendChild(optionEl);
        });
    } else {
        // Handle single response nodes if any
        const optionEl = document.createElement('div');
        optionEl.className = 'dialogue-option';
        optionEl.textContent = `> ${currentNode.player}`;
        optionEl.addEventListener('click', () => selectDialogueOption(currentNode, ui));
        ui.dialogueContainer.appendChild(optionEl);
    }
    // Aqui no se llama a ninguna funcion y se espera a que el usuario elija una opcion
    console.log("ui: esperando que el jugador elija una linea de dialogo...")
}

//////////////////////////////////////////////////////////////////////////////////////

export function selectDialogueOption(option) {
    /**
     * Esta funcion muestra el dialogo del nodo actual
     * y luego actuliza las opciones de respuesta dependiendo si existen
     */
    const { listener, speaker } = gameState.dialogue;
    const dialogueLong = 0;

    // Display NPC response
    //ui.dialogueText.textContent = `${gameData.characters[listener].alias}: ${option.npc}`;  // Shows the selected dialogue
    showDialogueLine(`${gameData.characters[listener].alias}: ${option.npc}`);  // Shows the selected dialogue
    ui.dialogueContainer.innerHTML = ''; // Clear options

    //TODO: Borrar esto?
    // if (option.setsAfaLocation) {
    //     gameState.afa.location = option.setsAfaLocation;
    // }

    //TODO: Revisar este sistema de incluir dar un objeto 
    // quizas estaria bueno pensar en invisibilizar opciones del mismo modo
    if (option.givesItem) {
        const itemIndex = gameData.characters[listener].inventory.indexOf(option.givesItem);
        if (itemIndex > -1) {
            gameData.characters[listener].inventory.splice(itemIndex, 1);
            gameData.characters[speaker].inventory.push(option.givesItem);
            updateInventoryView();
        }
    }

    const nextNodeKey = option.leadsTo;
    
    // se muestra la respuesta del NPC
    updateDialogueView();
    // vacia las opciones. (al terminar la respuesta del NPC se se volvera a ejecutar nuevas funciones o no, 
    // dependiendo si es ultimo branch del alrbol de díalogos) 
    ui.dialogueContainer.innerHTML = "";

    if (nextNodeKey && nextNodeKey !== "end" && gameState.dialogue.conversation[nextNodeKey]) {
        //Continue conversation branch      
        gameState.dialogue.currentNodeKey = nextNodeKey;
    } else {
        //End of conversation branch
        endDialogue();
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function endDialogue() {
    // termina el dialogo y reestablece los verbos
    console.log("ending dialog");
    ui.actionContainer.style.display = 'flex';
    ui.actionBox.style.display = 'block';
    ui.verbBar.style.display = 'grid';
    ui.characterSwitcher.style.display = 'block';
    ui.inventoryBox.style.display = 'block';
    ui.dialogueContainer.style.display = 'none';
    state.dialogue = null;
}

//////////////////////////////////////////////////////////////////////////////////////

export function showDialogueLine(text) {
    /**
     * Esta funcion ingresa una línea de diálogo en la cola de diálogo.
     * Si la cola estaba vacia, comienza a mostrar el texto.
     */
    console.log("LEN = " + dialogueQueue.length);
    console.log("PUSH: " + text);
    dialogueQueue.push(text);
    console.log("LEN = " + dialogueQueue.length);
    if (dialogueQueue.length === 1 && !speaking) {
        console.log("Start speaking")
        showNextDialogueLine();
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function showNextDialogueLine() {
    /**
     * Esta función muestra la siguiente línea de diálogo en la interfaz de usuario.
     * Luego de un timeout se llama a si misma nuevamente hasta vaciar la cola de dialogo.
     */
    if (dialogueQueue.length > 0 && !speaking) {
        console.log("Show next dialogue line, LEN = " + dialogueQueue.length);
        let nextLine = dialogueQueue.shift();
        console.log("SHIFT and now, LEN = " + dialogueQueue.length);
        speaking = true;
        const time = nextLine.length * uiOptions.dialogueSpeed;
        //ui.dialogueText.textContent = nextLine;
        ui.dialogueText.textContent = nextLine;
        console.log("Showing dialogue line: " + nextLine);
        nextLine = ''
        setTimeout(() => { speaking = false; showNextDialogueLine() }, time);
    } else {
        console.log("No more dialogue lines to show.");
        ui.dialogueText.textContent = '';
        if (state.dialogue) {
            if (state.dialogue.active){
                updateDialogueView(); //Muestra las nuevas opciones de respuesta si hay
            }
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    A C T I O  N   T E X T
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function updateActionText() {
    if (gameState.dialogue && gameState.dialogue.active) return;

    const verbKey = gameState.actionState?.verb;
    const verbData = verbKey ? verbConfig[verbKey] : null;

    const getTargetName = () => {
        if (!gameState.hoverTarget) return null;
        const { type, key } = gameState.hoverTarget;
        if (type === 'character') return gameData.characters[key].alias || gameData.characters[key].name;
        if (type === 'item') return gameData.items[key].name;
        if (type === 'object') return gameData.objects[key].name;
        return null;
    };

    const targetName = getTargetName();

    let finalText = '';

    //  Caso 1: hay verbo seleccionado
    if (verbData) {
        let itemText = '';

        if (gameState.activeItem) {
            const itemData = getItemData(gameState.activeItem, gameData);
            itemText = itemData ? itemData.name : gameState.activeItem.replace(/_/g, ' ');
        }

        finalText = verbData.display;
        if (itemText) finalText += ` ${itemText}`;
        if (verbData.preposition) finalText += ` ${verbData.preposition}`;
        finalText += ` ${targetName || '...'}`;
    }
    //  Caso 2: no hay verbo, pero hay ítem activo 
    //TODO: El verbo debera comportarse como hoover mas adelante asi que puede que esto deba ser eliminado
    else if (gameState.activeItem) {
        const itemData = getItemData(gameState.activeItem, gameData);
        finalText = itemData ? itemData.name : gameState.activeItem.replace(/_/g, ' ');
    }
    //  Caso 3: no hay verbo ni ítem, pero hay algo hover
    else if (targetName) {
        finalText = targetName;
    }
    
    if(ui.actionText){
        ui.actionText.textContent = (finalText=="") ? "" : finalText.trim();
    } else {
        console.warn("⚠️action-text no encontrado al intentar poner: '", finalText,"'"); 
        //TODO: This line and the IF ELSE structure is to workaround an error I had.. 
        // delete when all is ok, since its not necesary if all is working ok
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function handleClick() {
console.log('----8<-----------------------------8<----')
    state.lastInteractionTime = Date.now();
    if (state.dialogue && state.dialogue.active) return;
    const target = state.hoverTarget;
    const verb = state.actionState.verb;

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