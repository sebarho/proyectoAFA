export const state = {
    currentPlayer: null,
    currentScene: null,
    actionState: {
        verb: null,
        item: { key: null, type: null },
        target: { key: null, type: null }
    },
    inventories: { null: [] },
    activeItem: null,
    hoverTarget: null,
    dialogue: null,
    lastInteractionTime: Date.now(),
}; 

export const globals = {
    debugMode: false,
};


export function getGameState() {
    console.log("Estado del juego:", state.actionState.item);
    return state;
}