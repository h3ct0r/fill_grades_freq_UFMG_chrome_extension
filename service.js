chrome.commands.onCommand.addListener((shortcut) => {
    if (shortcut === 'reload') {
        console.log("reloading extension");
        chrome.runtime.reload();
    }
});