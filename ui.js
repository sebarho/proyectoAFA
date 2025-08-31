// --- 5. SISTEMAS DE UI ---

function startDialogue(speakerName, listenerName, dependencies) {
    const { dialogueMatrix, gameState, verbBar, dialogueOptionsContainer, dialogueText } = dependencies;
    
    let conversation = dialogueMatrix[listenerName] || dialogueMatrix.default;

    gameState.dialogue = {
        active: true,
        speaker: speakerName, // The player
        listener: listenerName, // The NPC
        conversation: conversation,
        currentNodeKey: 'start',
        long: 0
    };

    verbBar.style.display = 'none';
    dialogueOptionsContainer.style.display = 'flex';
    updateDialogueView(dependencies);
}

function updateDialogueView(dependencies) {
    const { characters, gameState, dialogueText, dialogueOptionsContainer } = dependencies;
    const { conversation, currentNodeKey, listener } = gameState.dialogue;
    const currentNode = conversation[currentNodeKey];

    if (!currentNode) {
        endDialogue(dependencies);
        return;
    }

    //dialogueText.textContent = `Hablando con ${characters[listener].alias}...`;
    dialogueOptionsContainer.innerHTML = '';

    if (Array.isArray(currentNode)) {
        currentNode.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'dialogue-option';
            optionEl.textContent = `> ${option.player}`;
            optionEl.addEventListener('click', () => selectDialogueOption(option, dependencies));
            dialogueOptionsContainer.appendChild(optionEl);
        });
    } else {
        // Handle single response nodes if any
        const optionEl = document.createElement('div');
        optionEl.className = 'dialogue-option';
        optionEl.textContent = `> ${currentNode.player}`;
        optionEl.addEventListener('click', () => selectDialogueOption(currentNode, dependencies));
        dialogueOptionsContainer.appendChild(optionEl);
    }
}

function selectDialogueOption(option, dependencies) {
    const { gameState, dialogueText, dialogueOptionsContainer, characters } = dependencies;
    const { listener, speaker } = gameState.dialogue;
    const dialogueLong = 0;

    // Display NPC response
    dialogueText.textContent = `${characters[listener].alias}: ${option.npc}`;
    dialogueOptionsContainer.innerHTML = ''; // Clear options

    if (option.setsAfaLocation) {
        gameState.afa.location = option.setsAfaLocation;
    }

    if (option.givesItem) {
        const itemIndex = gameState.inventories[listener].indexOf(option.givesItem);
        if (itemIndex > -1) {
            gameState.inventories[listener].splice(itemIndex, 1);
            gameState.inventories[speaker].push(option.givesItem);
            updateInventoryView(dependencies);
        }
    }

    const nextNodeKey = option.leadsTo;

    if (nextNodeKey && nextNodeKey !== "end" && gameState.dialogue.conversation[nextNodeKey]) {
        // OLD: Create a button to continue the conversation
          //const continueButton = document.createElement('div');
          //continueButton.className = 'dialogue-option';
          //continueButton.textContent = "> (Continuar)";
          //continueButton.addEventListener('click', () => {
         
        gameState.dialogue.currentNodeKey = nextNodeKey;
        updateDialogueView(dependencies);
        //});
        //dialogueOptionsContainer.appendChild(continueButton);
    } else {
        //End of conversation branch
        //const endButton = document.createElement('div');
        //endButton.className = 'dialogue-option';
        //endButton.textContent = "> (Terminar conversación)";
        //endButton.addEventListener('click', () => endDialogue(dependencies));
        //dialogueOptionsContainer.appendChild(endButton);
        endDialogue(dependencies);
    }
}

function endDialogue(dependencies) {
    const { gameState, verbBar, dialogueOptionsContainer, dialogueText } = dependencies;
    if (verbBar) verbBar.style.display = 'grid';
    if (dialogueOptionsContainer) {
        dialogueOptionsContainer.style.display = 'none';
        dialogueOptionsContainer.innerHTML = '';
    }
    if (gameState) {
        gameState.dialogue = null;
    }
    setTimeout(() => { if(dialogueText) dialogueText.textContent = '' }, gameOptions.opTextTimeOut);
}

function getItemData(itemName, gameData) {
    for (const scene of Object.values(gameData.scenes)) {
        if (scene.items[itemName]) {
            return scene.items[itemName];
        }
    }
    return null;
}

function updateInventoryView(dependencies) {
    const { inventoryBox, gameState, gameData, characters } = dependencies;
    inventoryBox.innerHTML = `<h3>Inventario (${characters[gameState.currentPlayer].alias})</h3>`;
    const list = document.createElement('ul');
    list.id = 'inventory-list';
    const currentInventory = gameState.inventories[gameState.currentPlayer];

    if (currentInventory.length === 0) {
        const itemEl = document.createElement('li');
        itemEl.textContent = '(Vacío)';
        list.appendChild(itemEl);
    } else {
        currentInventory.forEach(itemName => {
            const itemEl = document.createElement('li');
            itemEl.className = 'inventory-item';
            const itemData = getItemData(itemName, gameData);

            itemEl.textContent = itemData ? itemData.name : itemName.replace(/_/g, ' ');
            if (itemName === gameState.activeItem) itemEl.classList.add('active');
            
            itemEl.onclick = () => {
                gameState.activeItem = (gameState.activeItem === itemName) ? null : itemName;
                updateInventoryView(dependencies);
                updateDialogueText(dependencies);
            };
            list.appendChild(itemEl);
        });
    }
    inventoryBox.appendChild(list);
}

function updateDialogueText(dependencies) {
    const { dialogueText, gameState, scenes, characters, gameData } = dependencies;
    if (gameState.dialogue && gameState.dialogue.active) return;

    const getTargetName = () => {
        if (!gameState.hoverTarget) return null;
        const { type, key } = gameState.hoverTarget;
        if (type === 'character') return characters[key].alias || characters[key].name;
        if (type === 'item') return scenes[gameState.currentScene].items[key].name;
        if (type === 'object') return scenes[gameState.currentScene].objects[key].name;
        return null;
    };

    const targetName = getTargetName();

    if (gameState.actionState) {
        let verb = gameState.actionState.replace(/_/g, ' ');
        let preposition = '';
        let itemText = '';

        if (gameState.activeItem) {
            const itemData = getItemData(gameState.activeItem, gameData);
            itemText = itemData ? itemData.name : gameState.activeItem.replace(/_/g, ' ');
        }

        switch (gameState.actionState) {
            case 'USAR':
                verb = 'Usar';
                preposition = 'en';
                break;
            case 'DAR':
                verb = 'Dar';
                preposition = 'a';
                break;
            case 'TALK_TO':
                verb = 'Hablar';
                preposition = 'con';
                break;
            case 'LLEVAR':
                verb = 'Llevar';
                preposition = 'a';
                break;
            default:
                verb = verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase();
                break;
        }

        let finalText = verb;
        if (itemText) {
            finalText += ` ${itemText}`;
        }
        if (preposition) {
            finalText += ` ${preposition}`;
        }
        
        finalText += ` ${targetName || '...'}`;
        
        dialogueText.textContent = finalText;

    } else if (targetName) {
        dialogueText.textContent = targetName;
    } else {
        dialogueText.textContent = '';
    }
}

function setupCharacterSwitcher(dependencies) {
    const { characterSwitcher, characters, gameState, fullRedraw } = dependencies;
    characterSwitcher.innerHTML = '<h3>Amigos:</h3>';
    
    Object.entries(characters).forEach(([key, char]) => {
        if (char.x < 0) return;

        const avatar = document.createElement('div');
        avatar.className = 'character-avatar';
        avatar.textContent = char.alias || char.name;
        
        avatar.addEventListener('click', () => { 
            gameState.currentPlayer = key;
            gameState.activeItem = null; // Deselect item on character switch
            document.querySelectorAll('.character-avatar').forEach(a => a.classList.remove('active'));
            avatar.classList.add('active');
            updateInventoryView(dependencies);
            fullRedraw(); 
        });

        if (key === gameState.currentPlayer) avatar.classList.add('active');
        characterSwitcher.appendChild(avatar);
    });
}

// Helper function to find an item's data across all scenes
function getItemData(itemName, gameData) {
    for (const scene of Object.values(gameData.scenes)) {
        if (scene.items[itemName]) {
            return scene.items[itemName];
        }
    }
    // If not found in any scene, it might be a dynamically added item or an error
    // We can return a default object or null
    return { name: itemName.replace(/_/g, ' ') };
}