function start_loading_screen(){ 
    const body = document.querySelector('body');
    const loader = document.createElement('div');
    loader.classList.add('loader');
    body.prepend(loader);
  }
  
function end_loading_screen(){
const loader = document.querySelector(".loader");
    document.body.removeChild(loader)
}

export { start_loading_screen, end_loading_screen}