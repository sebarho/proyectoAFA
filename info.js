export function updateInventoryView() {
    const list = document.createElement('ul');
    list.id = 'inventory-list';

    const currentPlayer = gameState.currentPlayer;
    const characterData = gameData.characters[currentPlayer];

    // Validación defensiva
    if (!characterData || !Array.isArray(characterData.inventories)) {
        console.warn(`updateInventoryView: No se encontró inventario para el personaje "${currentPlayer}".`);
        const itemEl = document.createElement('li');
        itemEl.textContent = '(Inventario no disponible)';
        list.appendChild(itemEl);
        ui.inventoryBox.innerHTML = '';
        ui.inventoryBox.appendChild(list);
        return;
    }

    const currentInventory = characterData.inventories;

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
            if (itemName === gameState.activeItem) itemEl.classList.add('active');

            // Al hacer clic, se activa o desactiva el ítem
            itemEl.onclick = () => {
                gameState.activeItem = (gameState.activeItem === itemName) ? null : itemName;
                updateInventoryView();
                updateDialogueView();
                updateActionText();   // ✅ Ahora refresca el texto de acción
            };

            list.appendChild(itemEl);
        });
    }

    // Limpia y actualiza el contenedor del inventario
    ui.inventoryBox.innerHTML = '';
    ui.inventoriesBox.appendChild(list);
}

export function updateActionText() {
    if (gameState.dialogue && gameState.dialogue.active) return;

    const verbKey = gameState.actionState?.verb;
    const verbData = verbKey ? verbCfg[verbKey] : null;

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

    // 🟢 Caso 1: hay verbo seleccionado
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
    // 🟢 Caso 2: no hay verbo, pero hay ítem activo
    else if (gameState.activeItem) {
        const itemData = getItemData(gameState.activeItem, gameData);
        finalText = itemData ? itemData.name : gameState.activeItem.replace(/_/g, ' ');
    }
    // 🟢 Caso 3: no hay verbo ni ítem, pero hay algo hover
    else if (targetName) {
        finalText = targetName;
    }

    ui.actionText.textContent = finalText.trim();
}
