import { getSceneItems, getSceneObjects } from "./game.js";
import { gameData} from "./data.js";


let imageAssets = {};
let imagesToLoad = 0;
let imagesLoaded = 0;
let allImagesLoadedCallback = null;

function loadImage(src, callback) {
    /// Intenta cargar la imagen indicada (src) en imageAssets{}.
    /// De fallar la marca como 'null' y avanza.
    console.log(`renderer.js: Attempting to load image: ${src}`);
    if (imageAssets[src]) {
        console.log(`renderer.js: Image ${src} already in cache.`);
        callback(imageAssets[src]);
        return;
    }
    const img = new Image();
    img.onload = () => {
        console.log(`renderer.js: Successfully loaded image: ${src}`);
        imageAssets[src] = img;
        imagesLoaded++;
        if (allImagesLoadedCallback && imagesLoaded === imagesToLoad) {
            allImagesLoadedCallback();
        }
        callback(img);
    };
    img.onerror = () => {
        console.error(`renderer.js: Failed to load image: ${src}`);
        imageAssets[src] = null; // Mark as failed to avoid repeated attempts
        imagesLoaded++;
        if (allImagesLoadedCallback && imagesLoaded === imagesToLoad) {
            allImagesLoadedCallback();
        }
        callback(null);
    };
    img.src = src;
}

export function loadAssets(imagePaths, callback) {
    /// Detecta la cantidad de imagenes en el Path indicado y llama a cargarlas
    imagesToLoad = imagePaths.length;
    imagesLoaded = 0;
    allImagesLoadedCallback = callback;

    if (imagesToLoad === 0) {
        callback();
        return;
    }

    imagePaths.forEach(path => loadImage(path, () => {}));
}

export function drawScene(dependencies) {
    ///
    console.log('renderer.js: drawScene called.');
    const { ctx, scenes, characters, items, objects, gameState } = dependencies;
    const scene = scenes[gameState.currentScene];

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw background (wall and floor)
    ctx.fillStyle = scene.background.wall; 
    ctx.fillRect(0, 0, ctx.canvas.width, 310);

    //OLD:
    // if (gameState.currentScene === 'quincho') {
    //     const brickWidth = 40;
    //     const brickHeight = 15;
    //     const wallWidth = ctx.canvas.width;
    //     const wallHeight = 310;
    //     ctx.fillStyle = '#A0522D'; // Dark orange for brick background
    //     ctx.fillRect(0, 0, wallWidth, wallHeight);

    //     ctx.strokeStyle = '#8B4513'; // Dark brown for mortar
    //     ctx.lineWidth = 1;

    //     for (let y = 0; y < wallHeight; y += brickHeight) {
    //         for (let x = 0; x < wallWidth; x += brickWidth) {
    //             let offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
    //             ctx.strokeRect(x - offsetX, y, brickWidth, brickHeight);
    //         }
    //     }
    // }

    ctx.fillStyle = scene.background.floor; 
    ctx.fillRect(0, 310, ctx.canvas.width, ctx.canvas.height - 310);

    //ORIGINAL:
    // const drawOrder = [
    //     ...Object.entries(scene.objects).map(([key, data]) => ({ key, data, type: 'object' })),
    //     ...Object.entries(scene.items).filter(([, data]) => !data.isHidden).map(([key, data]) => ({ key, data, type: 'item' })),
    //     ...scene.characters.map(charKey => ({ key: charKey, data: characters[charKey], type: 'character' }))
    // ].sort((a, b) => (a.data.y + (a.data.height || 0)) - (b.data.y + (b.data.height || 0)));

    const drawOrder = [
        ...scene.items.map(itemKey => ({ key: itemKey, data: items[itemKey], type: 'item' })),
        ...scene.objects.map(objectKey => ({ key: objectKey, data: objects[objectKey], type: 'object' })),
        ...scene.characters.map(charKey => ({ key: charKey, data: characters[charKey], type: 'character' }))
    ].sort((a, b) => (a.y + (a.height || 0)) - (b.y + (b.height || 0)));

    drawOrder.forEach(obj => {
        if (!obj.data) return; // Prevents crash if character data is missing
        const isHovered = gameState.hoverTarget && gameState.hoverTarget.key === obj.key;
        switch(obj.type) {
            case 'character': drawSprite(ctx, obj.data, isHovered); break;
            case 'item':      drawItem(ctx, obj.data, isHovered); break;
            case 'object':    drawObject(ctx, obj.data, isHovered); break;
        }
    });

    const p = characters[gameState.currentPlayer];
    if (p) {
        ctx.fillStyle = '#FFFF00'; 
        ctx.font = "10px 'Press Start 2P'"; 
        ctx.textAlign = 'center';
        ctx.fillText(p.alias || p.name, p.x + p.width / 2, p.y - 5);
    }
}

function drawSprite(ctx, char, isHovered) {
    if (char.image) {
        const img = imageAssets[char.image];
        if (img) {
            if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
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

function drawColoredSprite(ctx, char, isHovered) {
    if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
    
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

function drawItem(ctx, item, isHovered) {
    if (item.image) {
        const img = imageAssets[item.image];
        if (img) {
            if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, item.x, item.y, item.width, item.height);
            ctx.shadowBlur = 0;
        } else {
            drawColoredItem(ctx, item, isHovered);
        }
    } else {
        drawColoredItem(ctx, item, isHovered);
    }
}

function drawColoredItem(ctx, item, isHovered) {
    if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
    ctx.fillStyle = item.color || '#FF00FF';
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.shadowBlur = 0;
}

function drawObject(ctx, obj, isHovered) {
    if (obj.name === 'Parrilla') {
        drawParrilla(ctx, obj, isHovered);
    } else if (obj.name === 'Heladera') {
        const imageName = obj.isOpen ? obj.imageOpen : obj.image;
        const img = imageAssets[imageName];
        if (img) {
            if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
            ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
            ctx.shadowBlur = 0;
        } else {
            drawColoredObject(ctx, obj, isHovered);
        }
    } else if (obj.image) {
        const img = imageAssets[obj.image];
        if (img) {
            if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }
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
    if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }

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
    if(isHovered) { ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10; }

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