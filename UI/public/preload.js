const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    let domElement = document.getElementById('root');
    if(domElement !== null){
        domElement.addEventListener('change', (e) => {
            //check .innerHTML changed (compared to init value)
            alert('onblur');
        });
        /*domElement.innerHTML.watch('change', elem => {
            let button = document.getElementById('save');
            console.log(button);
        });*/
        /*let observer = new window.MutationObserver((e) => {
            console.log(e);
    
            let button = document.getElementById('save');
            console.log(button);
            if(button !== null){
                button.addEventListener('click', () => {
                    dialog.showOpenDialog();
                    ipcRenderer.send('save', 'save');
                });
            }
    });
    
    observer.observe(domElement, {
        characterData: true,
        subtree: true
    });*/
}
});