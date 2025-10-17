import {
    gameState,
    getVerbConfig,
    parseAction,
    getGameData,
    getItemData,
    handleClick,
    globals,
    handleVerbClick,
} from "./engine.js";

export const uiOptions = {
    dialogueSpeed: 60 // milliseconds per character
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

let speaking = false;

const dialogueQueue = [];

let dialogueActive = false;

let isDragging = false;
let cursorX = 0;
let cursorY = 0;

export function initUI() {
    console.log("Initializing User Interface...")
    getUIObjects(); // Get the UI objects
    addEventListeners(); //Registra los eventos de mouse en el canvas en el Event Loop
    setupCharacterSwitcher();
    console.log('...Game initialized successfully.');
}


function addEventListeners() {
    ui.document.addEventListener('keydown', handleKeyPress);
    ui.canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    ui.canvas.addEventListener('mousemove', handleCanvasMousemove);
    ui.canvas.addEventListener('click', handleClick); //handleCanvasClick);
    ui.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    ui.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    ui.canvas.addEventListener('touchend', handleTouchEnd);

    document.querySelectorAll('.verb-button').forEach(b => b.addEventListener('click', () => handleVerbClick(b.textContent)));
    console.log(' - Event listeners registered.');
}

function getUIObjects() {
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
    console.log(' - UI objects created.');
}

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    V E R B S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function createVerbButtons() {
    /**
     * Creates the verb buttons according to the data in gameData.verbs[] (defined in data.js)
    */

    const verbConfig = getVerbConfig(); // Store verb configuration globally
    console.log(verbConfig);
    const verbBar = document.getElementById('verb-bar');
    verbBar.innerHTML = ''; // Clear existing buttons

    Object.entries(verbConfig).forEach(([key, config]) => {
        const button = document.createElement('button');
        button.textContent = config.label;
        button.className = 'verb-button';
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

    // Now, creates a button per playable character (actor)
    Object.entries(getGameData().characters).forEach(([key, char]) => {
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
                for (const [sceneKey, scene] of Object.entries(getGameData().scenes)) {
                    if (scene.characters.includes(key)) {
                        gameState.currentScene = sceneKey;
                        break;
                    }
                }
                updateInventoryView(ui);
            });

            if (key === gameState.currentPlayer) avatar.classList.add('active');
            ui.characterSwitcher.appendChild(avatar);
        };
    });
    console.log(' - Character switcher set up.');
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

    itemElement.addEventListener("click", () => {
        handleClick();
    });
}


//////////////////////////////////////////////////////////////////////////////////////

export function updateInventoryView() {
    const list = document.createElement('ul');
    list.id = 'inventory-list';

    const currentPlayer = gameState.currentPlayer;
    const characterData = getGameData().characters[currentPlayer];

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

            const itemData = getItemData(itemName);
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

    let conversation = getGameData().dialogueMatrix[listenerName];

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

    if (Array.isArray(currentNode)) {
        currentNode.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'dialogue-option';
            optionEl.textContent = `> ${option.player}`;
            optionEl.addEventListener('click', () => selectDialogueOption(option));
            ui.dialogueContainer.appendChild(optionEl);
        });
    } else {
        // Handle single response nodes if any
        const optionEl = document.createElement('div');
        optionEl.className = 'dialogue-option';
        optionEl.textContent = `> ${currentNode.player}`;
        optionEl.addEventListener('click', () => selectDialogueOption(currentNode));
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
    console.log("Listener: " + listener + " Speaker: " + speaker);
    // Display NPC response
    //ui.dialogueText.textContent = `${gameData.characters[listener].alias}: ${option.npc}`;  // Shows the selected dialogue
    showDialogueLine(`${getGameData().characters[listener].alias}: ${option.npc}`);  // Shows the selected dialogue
    ui.dialogueContainer.innerHTML = ''; // Clear options

    //TODO: Revisar este sistema de incluir dar un objeto 
    // quizas estaria bueno pensar en invisibilizar opciones del mismo modo
    console.log(gameState.dialogue);
    if (option.givesItem) {
        const itemIndex = getGameData().characters[listener].inventory.indexOf(option.givesItem);
        if (itemIndex > -1) {
            const linv = getGameData().characters[listener].inventory;
            linv.splice(itemIndex, 1);
            const sinv =getGameData().characters[speaker].inventory
            sinv.push(option.givesItem);
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
    gameState.dialogue = null;
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
        if (gameState.dialogue) {
            if (gameState.dialogue.active) {
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
    const verbData = verbKey ? getVerbConfig()[verbKey] : null;

    const getTargetName = () => {
        if (!gameState.hoverTarget) return null;
        const { type, key } = gameState.hoverTarget;
        if (type === 'character') return getGameData().characters[key].alias || getGameData().characters[key].name;
        if (type === 'item') return getGameData().items[key].name;
        if (type === 'object') return getGameData().objects[key].name;
        return null;
    };

    const targetName = getTargetName();

    let finalText = '';

    //  Caso 1: hay verbo seleccionado
    if (verbData) {
        let itemText = '';

        if (gameState.actionState.item.key != null) {
            const itemData = getItemData(gameState.actionState.item.key);
            itemText = itemData ? itemData.name : gameState.actionState.item.key.replace(/_/g, ' ');
        }

        finalText = verbData.display;
        if (itemText) {
            finalText += ` ${itemText}`;
            if (verbData.connector) finalText += ` ${verbData.connector}`;
        } else {
            if (verbData.preposition) finalText += ` ${verbData.preposition}`; //TODO: Configurar bien cuando son items combinables (2 objetos por oracion)
        }
        finalText += ` ${targetName || '...'}`;
    }
    //  Caso 2: no hay verbo, pero hay ítem activo 
    //TODO: El verbo debera comportarse como hoover mas adelante asi que puede que esto deba ser eliminado
    ///else if (gameState.activeItem) {
    ///    const itemData = getItemData(gameState.activeItem);
    ///    finalText = itemData ? itemData.name : gameState.activeItem.replace(/_/g, ' ');
    ///}
    //  Caso 3: no hay verbo ni ítem, pero hay algo hover
    else if (targetName) {
        finalText = targetName;
    }

    if (ui.actionText) {
        ui.actionText.textContent = (finalText == "") ? "" : finalText.trim();
    } else {
        console.warn("⚠️action-text no encontrado al intentar poner: '", finalText, "'");
        //TODO: This line and the IF ELSE structure is to workaround an error I had.. 
        // delete when all is ok, since its not necesary if all is working ok
    }
}

//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
///
///    E V E N T S   H A N D L E R S
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

function handleDefaultClick() {
    console.log("Default click fired");
}

//////////////////////////////////////////////////////////////////////////////////////

function handleCanvasMousemove(event) {
    if (gameState.dialogue && gameState.dialogue.active) return;
    const rect = ui.canvas.getBoundingClientRect();
    gameState.hoverTarget = getTargetAt(event.clientX - rect.left, event.clientY - rect.top);
    updateActionText();//verbConfig);
    //ui.fullRedraw();
}

function handleCanvasMouseLeave(event) {
    gameState.hoverTarget = null;
    updateActionText();
}

//////////////////////////////////////////////////////////////////////////////////////
function getTargetAt(x, y) {
    /**
     * Determina qué elemento del escenario (objeto, item o personaje) está bajo las coordenadas (x, y).
     * Devuelve un objeto con { key, data, type } si encuentra un target, o null si no hay nada en esa posición.
     */

    // Obtiene la escena actual según el estado del juego
    const scene = getGameData().scenes[gameState.currentScene];

    // Crea una lista de todos los posibles targets en la escena:
    // - Objetos del escenario (type: 'object')
    // - Items visibles (type: 'item')
    // - Personajes presentes (type: 'character')
    const allTargets = [
        // Items que no están ocultos
        ...scene.items.filter(itemKey => !getGameData().items[itemKey].isHidden).map(itemKey => ({ key: itemKey, data: getGameData().items[itemKey], type: 'item' })),
        // Objetos del escenario
        ...scene.objects.map(objectKey => ({ key: objectKey, data: getGameData().objects[objectKey], type: 'object' })),
        // Personajes en la escena
        ...scene.characters.map(charKey => ({ key: charKey, data: getGameData().characters[charKey], type: 'character' }))
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

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////
//////////    T O U C H   S C R E E N S
//////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function drawCursor(x, y) {
    /**
     * Draws the "cursor"
     */
    ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    ui.ctx.beginPath();
    ui.ctx.arc(x, y, 5, 0, Math.PI * 2);
    ui.ctx.fillStyle = 'red';
    ui.ctx.fill();
}
//////////////////////////////////////////////////////////////////////////////////////

function getTouchPos(touchEvent) {
    /**
     * Convert touch coordinates to canvas coordinates
     */
    const rect = ui.canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}
//////////////////////////////////////////////////////////////////////////////////////

function isInsideCanvas(x, y) {
    /**
     * Verifica si el punto está dentro del canvas
     */
    return x >= 0 && x <= ui.canvas.width && y >= 0 && y <= ui.canvas.height;
}
//////////////////////////////////////////////////////////////////////////////////////

function handleTouchStart(e) {
    /**
     * Start dragging
     */
    e.preventDefault();
    isDragging = true;
    const rect = ui.canvas.getBoundingClientRect();
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (isInsideCanvas(x, y)) {
        cursorX = x;
        cursorY = y;
    drawCursor(cursorX, cursorY);
  }
}
//////////////////////////////////////////////////////////////////////////////////////

function handleTouchMove(e) {
    /**
     * Handles the finger movement
     */
    if (!isDragging) return;
    e.preventDefault();
    const rect = ui.canvas.getBoundingClientRect();
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (isInsideCanvas(x, y)) {
        cursorX = x;
        cursorY = y;
        drawCursor(cursorX, cursorY);
    }
    // Pass the control to handleMouseMove
    const touch = e.touches[0];
    const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    handleCanvasMousemove(simulatedEvent);
}
//////////////////////////////////////////////////////////////////////////////////////

function handleTouchEnd(e) {
    /**
     * Finishes the dragging
     */
    isDragging = false;
    // Pass control to 'handleClick'
    handleClick();
}
//////////////////////////////////////////////////////////////////////////////////////