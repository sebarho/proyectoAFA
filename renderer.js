import { gameData, 
    gameState,
    getVerbConfig,
    globals 
} from "./engine.js";

let imageAssets = {};
let imagesToLoad = 0;
let imagesLoaded = 0;
let allImagesLoadedCallback = null;

//////////////////////////////////////////////////////////////////////////////////////

function loadImage(src, callback) {
    // Intenta cargar una imagen desde la ruta 'src'.
    // Si ya está en caché (imageAssets), la devuelve inmediatamente.
    console.log(`renderer.js: Attempting to load image: ${src}`);
    if (imageAssets[src]) {
        console.log(`renderer.js: Image ${src} already in cache.`);
        callback(imageAssets[src]);
        return;
    }

    const img = new Image(); // Crea un nuevo objeto de imagen
    img.onload = () => {
        // Si la imagen se carga correctamente:
        console.log(`renderer.js: Successfully loaded image: ${src}`);
        imageAssets[src] = img; // Se guarda en caché
        imagesLoaded++; // Se incrementa el contador
        // Si todas las imágenes están listas, se llama al callback global
        if (allImagesLoadedCallback && imagesLoaded === imagesToLoad) {
            allImagesLoadedCallback();
        }
        callback(img); // Se ejecuta el callback individual
    };

    img.onerror = () => {
        // Si la imagen falla al cargar:
        console.error(`renderer.js: Failed to load image: ${src}`);
        imageAssets[src] = null; // Se marca como fallida
        imagesLoaded++;
        if (allImagesLoadedCallback && imagesLoaded === imagesToLoad) {
            allImagesLoadedCallback();
        }
        callback(null); // Se ejecuta el callback individual con null
    };

    img.src = src; // Se inicia la carga
}

//////////////////////////////////////////////////////////////////////////////////////

export function loadAssets(imagePaths, callback) {
    // Guarda la cantidad total de imágenes a cargar
    imagesToLoad = imagePaths.length;
    imagesLoaded = 0;
    allImagesLoadedCallback = callback;

    // Si no hay imágenes, se ejecuta el callback inmediatamente
    if (imagesToLoad === 0) {
        callback();
        return;
    }

    // Se crea un array de promesas, una por cada imagen
    const promises = imagePaths.map(path => {
        return new Promise(resolve => {
            // Se llama a loadImage con un callback que resuelve la promesa
            loadImage(path, img => resolve(img));
        });
    });

    // Espera a que todas las promesas se resuelvan (carga completa o error)
    Promise.all(promises).then(results => {
        // Opcional: detectar imágenes que fallaron
        const fallidas = results.filter(img => img === null);
        if (fallidas.length > 0) {
            console.warn(`renderer.js: ${fallidas.length} imágenes no se pudieron cargar.`);
        }

        // Se ejecuta el callback final solo cuando todas las imágenes fueron procesadas
        console.log('renderer.js: All images preloaded (preloades or failed).');
        callback(); //<- recien aca vuelve a gameInit
    });
}

//////////////////////////////////////////////////////////////////////////////////////

export function drawScene(ui) {
    ///
    console.log('renderer.js: drawScene called.');

    if (!ui.ctx) {
        console.warn('drawScene: ui.ctx is null. Skipping draw.');
        return;
    }


    //const { ctx, scenes, characters, items, objects, gameState } = ui;
    const scene = gameData.scenes[gameState.currentScene];

    ui.ctx.clearRect(0, 0, ui.ctx.canvas.width, ui.ctx.canvas.height);
    if (scene.image === undefined) {
    // Draw background (wall and floor)
    ui.ctx.fillStyle = scene.background.wall;
    ui.ctx.fillRect(0, 0, ui.ctx.canvas.width, 310);

    ui.ctx.fillStyle = scene.background.floor;
    ui.ctx.fillRect(0, 310, ui.ctx.canvas.width, ui.ctx.canvas.height - 310);
    } else {
        const bgImg = imageAssets[scene.image];
        drawBackground(ui.ctx, bgImg);
    }
    // Draw objects, items, and characters in correct order based on Y position
    const drawOrder = [
        ...scene.items.filter(itemKey => !gameData.items[itemKey].isHidden).map(itemKey => ({ key: itemKey, data: gameData.items[itemKey], type: 'item' })),
        ...scene.objects.map(objectKey => ({ key: objectKey, data: gameData.objects[objectKey], type: 'object' })),
        ...scene.characters.map(charKey => ({ key: charKey, data: gameData.characters[charKey], type: 'character' }))
    ].sort((a, b) => (a.y + (a.height || 0)) - (b.y + (b.height || 0)));
    drawOrder.forEach(obj => {
        if (!obj.data) return; // Prevents crash if character data is missing
        const isHovered = gameState.hoverTarget && gameState.hoverTarget.key === obj.key;
        switch (obj.type) {
            case 'character': drawSprite(ui.ctx, obj.data, isHovered); break;
            case 'item': drawItem(ui.ctx, obj.data, isHovered); break;
            case 'object': drawObject(ui.ctx, obj.data, isHovered); break;
        }
    });

    const p = gameData.characters[gameState.currentPlayer];
    if (p) {
        ui.ctx.fillStyle = '#FFFF00';
        ui.ctx.font = "10px 'Press Start 2P'";
        ui.ctx.textAlign = 'center';
        ui.ctx.fillText(p.alias || p.name, p.x + p.width / 2, p.y - 5);
    }

    printDebugInfo(ui);
}

//////////////////////////////////////////////////////////////////////////////////////

function printDebugInfo(ui) {
    if (globals.debugMode) {
        //Print gameState info for debug purposes.
        ui.ctx.fillStyle = '#000000';
        ui.ctx.font = "8px 'Press Start 2P'";
        ui.ctx.textAlign = 'left';
        const sep = 12;
        let line = 1;
        let text = ""; 
        ui.ctx.fillText(globals.engineName+ " - v" + globals.engineVersion, 0, line * sep); line++; 
        ui.ctx.fillText("----------------------------------------", 0, line * sep); line++;
        ui.ctx.fillText("Current scene: ... " + gameState.currentScene, 0, line * sep); line++;
        ui.ctx.fillText("Current Player: .. " + gameState.currentPlayer, 0, line * sep); line++;
        ui.ctx.fillText("Action state verb: " + gameState.actionState.verb, 0, line * sep); line++;
        ui.ctx.fillText("Action state item: " + gameState.actionState.item.key + " [" + gameState.actionState.item.type + "]", 0, line * sep); line++;
        ui.ctx.fillText("Action state targ: " + gameState.actionState.target.key + " [" + gameState.actionState.target.type + "]", 0, line * sep); line++;
        text = (gameState.hoverTarget == null) ? "Null" : gameState.hoverTarget.key + " [" + gameState.hoverTarget.type + "]";
        ui.ctx.fillText("HoverTarget: ..... " + text, 0, line * sep); line++;
        ui.ctx.fillText("Dialogue: ........ " + gameState.dialogue, 0, line * sep); line++;
        if (gameState.dialogue != null) {
            ui.ctx.fillText("     Active: ..... " + gameState.dialogue.active, 0, line * sep); line++;
            ui.ctx.fillText("     Speaker: .... " + gameState.dialogue.speaker, 0, line * sep); line++;
            ui.ctx.fillText("     Listener: ... " + gameState.dialogue.listener, 0, line * sep); line++;
            ui.ctx.fillText("     Conversation: " + gameState.dialogue.conversation, 0, line * sep); line++;
            ui.ctx.fillText("     Cur Node Key: " + gameState.dialogue.currentNodeKey, 0, line * sep); line++;
            ui.ctx.fillText("     Long: ....... " + gameState.dialogue.long, 0, line * sep); line++;
        }
        text = (gameState.activeItem == null) ? "Null" : gameState.activeItem.key + " [" + gameState.activeItem.type + "]";
        ui.ctx.fillText("Active Item: ..... " + text, 0, line * sep); line++;
        text = (gameState.inventories == null) ? "Null" : gameState.inventories;
        ui.ctx.fillText("Inventories: ..... " + gameState.inventories, 0, line * sep); line++;
        ui.ctx.fillText("Last Inter.  Time: " + gameState.lastInteractionTime, 0, line * sep); line++;
        ui.ctx.fillText("VerbConfig: ...... " + getVerbConfig(), 0, line * sep); line++;
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function drawBackground(ctx,image) {
    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

//////////////////////////////////////////////////////////////////////////////////////

function drawSprite(ctx, char, isHovered) {
    if (char.image) {
        const img = imageAssets[char.image];
        if (img) {
            if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, char.x, char.y, char.width, char.height);
            ctx.shadowBlur = 0;
        } else {
            // Fallback to colored rectangle if image not loaded or failed
            drawColoredSprite(ctx, char, isHovered);
        }
    } else {
        drawColoredSprite(ctx, char, isHovered);
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function drawColoredSprite(ctx, char, isHovered) {
    if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }

    const skinColor = char.skinColor || '#FF00FF';
    const shirtColor = char.shirtColor || '#FF00FF';
    const pantsColor = char.pantsColor || '#FF00FF';

    const headSize = char.width * 0.8;
    const headX = char.x + (char.width - headSize) / 2;

    if (char.hairColor) {
        ctx.fillStyle = char.hairColor;
        ctx.fillRect(headX - 2, char.y - 4, headSize + 4, headSize);
    }

    ctx.fillStyle = skinColor;
    ctx.fillRect(headX, char.y, headSize, headSize);

    ctx.fillStyle = shirtColor;
    ctx.fillRect(char.x, char.y + headSize, char.width, char.height * 0.4);

    ctx.fillStyle = pantsColor;
    ctx.fillRect(char.x, char.y + headSize + char.height * 0.4, char.width, char.height * 0.6 - headSize);

    ctx.shadowBlur = 0;
}

//////////////////////////////////////////////////////////////////////////////////////

function drawItem(ctx, item, isHovered) {
    if (item.image) {
        const img = imageAssets[item.image];
        if (img) {
            if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, item.x, item.y, item.width, item.height);
            ctx.shadowBlur = 0;
        } else {
            drawColoredItem(ctx, item, isHovered);
        }
    } else {
        drawColoredItem(ctx, item, isHovered);
    }
}

//////////////////////////////////////////////////////////////////////////////////////

function drawColoredItem(ctx, item, isHovered) {
    if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
    ctx.fillStyle = item.color || '#FF00FF';
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.shadowBlur = 0;
}

//////////////////////////////////////////////////////////////////////////////////////

function drawObject(ctx, obj, isHovered) {
    if (obj.name === 'Parrilla') {
        drawParrilla(ctx, obj, isHovered);
    } else if (obj.name === 'Heladera') {
        const imageName = obj.isOpen ? obj.imageOpen : obj.image;
        const img = imageAssets[imageName];
        if (img) {
            if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
            ctx.shadowBlur = 0;
        } else {
            drawColoredObject(ctx, obj, isHovered);
        }
    } else if (obj.image) {
        const img = imageAssets[obj.image];
        if (img) {
            if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
            ctx.shadowBlur = 0;
        } else {
            drawColoredObject(ctx, obj, isHovered);
        }
    } else {
        drawColoredObject(ctx, obj, isHovered);
    }
}

function drawParrilla(ctx, obj, isHovered) {
    if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }

    // Draw brick base
    const brickWidth = 15;
    const brickHeight = 8;
    const numRows = Math.floor(obj.height / brickHeight);
    const numCols = Math.floor(obj.width / brickWidth);

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            let color = (i + j) % 2 === 0 ? '#8B0000' : '#A52A2A';
            ctx.fillStyle = color;
            ctx.fillRect(obj.x + j * brickWidth, obj.y + i * brickHeight, brickWidth, brickHeight);
        }
    }

    // Draw grill bars
    ctx.fillStyle = '#000';
    for (let i = 0; i < obj.width; i += 5) {
        ctx.fillRect(obj.x + i, obj.y, 2, obj.height);
    }

    if (obj.hasCarbon) {
        ctx.fillStyle = '#000';
        for (let i = 0; i < 20; i++) {
            const x = obj.x + 10 + Math.random() * (obj.width - 20);
            const y = obj.y + 10 + Math.random() * (obj.height - 20);
            ctx.fillRect(x, y, 10, 10);
        }
    }

    if (obj.isLit) {
        const fireColors = ['#FF0000', '#FFA500', '#FFFF00'];
        for (let i = 0; i < 30; i++) {
            const x = obj.x + 10 + Math.random() * (obj.width - 20);
            const y = obj.y + 10 + Math.random() * (obj.height - 20);
            ctx.fillStyle = fireColors[Math.floor(Math.random() * fireColors.length)];
            ctx.fillRect(x, y, 5, 5);
        }
    }

    ctx.shadowBlur = 0;
}

function drawColoredObject(ctx, obj, isHovered) {
    if (isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }

    if (obj.name === 'Heladera') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(obj.x + obj.width / 2 - 1, obj.y, 2, obj.height);
    } else if (obj.name === 'Mesa') {
        ctx.fillStyle = '#654321'; // Dark brown
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.fillStyle = '#D2B48C'; // Light brown
        for (let i = 0; i < obj.width; i += 10) {
            ctx.fillRect(obj.x + i, obj.y, 5, obj.height);
        }
    } else {
        ctx.fillStyle = obj.color || '#36454F';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    ctx.shadowBlur = 0;
}