//////////////////////////////////////////////////////////////////////////////////////
///
///    GAME CONTROLLER API FUNCTIONS
///
//////////////////////////////////////////////////////////////////////////////////////

function hideUI() {
    //Hides UI controls
    document.getElementById('verb-bar').style.display = 'none';
    document.getElementById('dialogue-options-container').style.display = 'none';
    document.getElementById('right-panel').style.display = 'none';
    console.log("Hide UI");
};

function showUI() {
    //Shows UI controls
    document.getElementById('verb-bar').style.display = 'flex';
    document.getElementById('dialogue-options-container').style.display = 'flex';
    document.getElementById('right-panel').style.display = 'flex';
    console.log("Show UI");
};

function wait(ms) {
    //waits for given milliseconds

};


function giveItem(item, from, to) {
    //given an item from player to NPC 
};


function getItem(item){
    //pick an item from de scene
};


function dropItem(item){
    ///Drop an item in the current Scene

};