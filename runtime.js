export const gameState = {
    currentPlayer: null,
    currentScene: null,
    actionState: {
        verb: null,
        item: {key: null, type: null},
        target: {key: null, type: null}
    },
    activeItem: null,
    inventories: { null: [] }, // Inventario por personaje
    hoverTarget: null,
    dialogue: null,
    lastInteractionTime: Date.now(),
}; 

export function getGameState() {
    console.log("Estado del juego:", gameState.actionState.item);
    return gameState;
}