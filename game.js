import {
    drawScene,
    loadAssets
} from './renderer.js';

import {
    updateActionText,
    setupCharacterSwitcher,
    createVerbButtons,
    initUI,
    ui
} from './ui.js';

import { gameState,
    configureVerbs,
    getGameData,
    init as engineInit
} from './engine.js';


//////////////////////////////////////////////////////////////////////////////////////
///
///    SUPPORT FUNCTIONS
///
//////////////////////////////////////////////////////////////////////////////////////

function recolectarRutasDeImagen() {
    /**
     * INICIALIZA EL JUEGO, VARIABLES, OBJETOS, CARGA ASSETS... etc
     */

    // Inicializa un array vacío para almacenar todas las rutas de imágenes encontradas
    const allImagePaths = [];

    // Recorre todos los personajes definidos en gameData.characters
    Object.values(getGameData().characters).forEach(char => {
        // Si el personaje tiene una imagen definida, la agrega al array
        if (char.image) allImagePaths.push(char.image);
    });

    // Recorre todas las escenas definidas en gameData.scenes
    Object.values(getGameData().scenes).forEach(scene => {
        // Si la escena tiene una imagen de fondo definida, la agrega
        if (scene.image !== undefined) allImagePaths.push(scene.image);

        // Dentro de cada escena, recorre los objetos interactivos
        Object.values(scene.objects).forEach(obj => {
            // Si el objeto tiene una imagen principal, la agrega
            if (obj.image) allImagePaths.push(obj.image);
            // Si el objeto tiene una imagen alternativa (por ejemplo, abierta), también la agrega
            if (obj.imageOpen) allImagePaths.push(obj.imageOpen); //TODO: Revisar esta línea y el concepto (4-9-25)
        });

        // Recorre los ítems de la escena (pueden ser recolectables, decorativos, etc.)
        Object.values(scene.items).forEach(item => {
            // Si el ítem tiene una imagen definida, la agrega
            if (item.image) allImagePaths.push(item.image);
        });
    });

    console.log(`game.js: Found ${allImagePaths.length} images to preload.`);
    return allImagePaths;

}


//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME START (ENTRY POINT)
///
//////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Starts the game
     */
    console.log('game.js: DOMContentLoaded event fired. Starting game initialization.');
    gameInit();
});


//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME INIT
///
//////////////////////////////////////////////////////////////////////////////////////

function gameInit() {

    // Inits the engine and the data structure
    engineInit();

    configureVerbs(); //TODO: Puede que esta estructura sea redundante...

    loadAssets(recolectarRutasDeImagen(), () => {
        console.log('game.js: Initializing game after assets loaded...');

        // Crear botones de verbo dinamicamente
        // configureVerbs(vc)
        createVerbButtons();
        console.log('game.js: Verb buttons created.');

        // Get gameData initial state
        gameState.currentPlayer = getGameData().inits.player;
        gameState.currentScene = getGameData().inits.scene;
        console.log(`game.js: Initial state > player=${gameState.currentPlayer}, scene=${gameState.currentScene}`);
        
        //Inits the User Interface
        initUI();

        // Start the game loop after initialization
        console.log(" Starting game loop.");
        requestAnimationFrame(gameLoop); 
    });
};


//////////////////////////////////////////////////////////////////////////////////////
///
///    G A M E    L O O P
///
//////////////////////////////////////////////////////////////////////////////////////

function gameLoop() {
    /**
     * Main game loop, called with requestAnimationFrame
     */

    drawScene(ui); // Draw the current scene
    requestAnimationFrame(gameLoop); // Schedule the next frame
}




