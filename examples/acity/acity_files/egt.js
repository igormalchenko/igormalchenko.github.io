// Implement custom logic here to be executed when the user presses 
// the exit button of the GamePlatform 
function onExitGamePlatformEGT() { 
    console.log("exitGame...");
}
// For all games there is additional button for reloading the game 
// when no connection occurs. You can implement what happens 
// when the user presses the reload button here 
function onReloadGamePlatformEGT() { 
    document.location.reload()
} 

function receiveMessage(event) { 
    if (event.data) { 
        if (event.data.command == 'com.egt-bg.exit') onExitGamePlatformEGT(); 
        else if (event.data.command == 'com.egt-bg.reload') onReloadGamePlatformEGT(); 
    } 
} 

window.addEventListener("message", receiveMessage, false);