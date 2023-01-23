var selectedForm = null;
var selectedColor = null;

function selectForm(image) {
  if(selectedForm!=null){ 
    selectedForm.classList.remove("selected_form");
  }
  selectedForm = image;
  selectedForm.classList.add("selected_form");
}

function selectColor(image) {
  if(selectedColor!=null){ 
    selectedColor.classList.remove("selected_color");
  }
  selectedColor = image;
  selectedColor.classList.add("selected_color");
}

async function load_available_forms() {
    const response = await fetch('https://api.github.com/repos/issaknot/shop/contents/images/forms');
    const data = await response.json();
    data.forEach(function(file) {
        var img = document.createElement("img");
        img.src = file.download_url;
        img.onclick = selectForm.bind(null, img);
        document.getElementById("available_forms").appendChild(img);
      });
}

async function load_available_colors() {
    const response = await fetch('https://api.github.com/repos/issaknot/shop/contents/images/colors');
    const data = await response.json();
    data.forEach(function(file) {
        var img = document.createElement("img");
        img.src = file.download_url;
        img.onclick = selectColor.bind(null, img);
        document.getElementById("available_colors").appendChild(img);
        });
}

function add_submit_listener() {
    let form = document.getElementById("order_form");
    form.addEventListener("submit", function (event) {
        let desiredform = document.getElementsByClassName('selected_form')[0].src.split("/").pop();
        let desiredcolor = document.getElementsByClassName('selected_color')[0].src.split("/").pop();
        let orderDetails = `The visitor selected form = ${desiredform} and color = ${desiredcolor}`;
        document.getElementById("order_message").value = orderDetails;
    });
}

function setupContent(){
    load_available_colors()
    load_available_forms()
    add_submit_listener();
}

window.onload = setupContent();

var client = new Dropbox.Client({ key: "sl.BXcucg3tq1cM52Tbkv2nLGZ2gecHoiG-Pr3rEQif1cv7jNknYyk_ODErDXLJkMTAOK43QpIyIS6Z33duOcT-9IPHUWsZeQaWanhCHQMvEHg_kyLDnbANe9OJO9N2QFDBW0SOg_g" });






