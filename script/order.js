var selectedForm = null;
var selectedColor = null;

function selectForm(image) {
  if(selectedForm!=null){ 
    selectedForm.classList.remove("selected");
  }
  selectedForm = image;
  selectedForm.classList.add("selected");
}

function selectColor(image) {
  if(selectedColor!=null){ 
    selectedColor.classList.remove("selected");
  }
  selectedColor = image;
  selectedColor.classList.add("selected");
}

function submitOrder() {
  // code to handle order submission goes here
}

async function load_available_colors() {
    // Use the fetch API to get a list of files in the "images/colors" folder
    const response = await fetch('https://api.github.com/repos/issaknot/shop/contents/images/colors');
    const data = await response.json();
    const imageList = data.filter(item => item.endsWith('.png'));

    // Iterate through the list of images and create <img> elements
    for (const image of imageList) {
      const imgElement = document.createElement('img');
      imgElement.src = image.donwload_url;
      imgElement.onclick = selectColor(image);
      document.getElementById('available_colors').appendChild(imgElement);
    }
  }

function selectColor(el) {
// do something with selected image
    console.log(el.src);
}

window.onload = load_available_colors();