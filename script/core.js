//////////////////////////// IMPORTS ////////////////////////////

import { addZoomLogic } from "./zoom.js";
import { start_loading_screen, end_loading_screen} from "./loading.js";
import { refresh_access_token, authenticate_dropbox_client } from "./dropbox.js";


//////////////////////////// SETUP INSTRUCTIONS ////////////////////////////

async function setup_dropbox_client(){
  try {
    accessToken = await refresh_access_token()
    dbclient = authenticate_dropbox_client(accessToken)
  } catch (error) {
    console.error(error)
  } 
}
// this variables are required for the dropbox API
// the access token must be updated every hour
// since the access is restricted (read only rights) the token is being refreshed frequently
let accessToken;
let dbclient

// wait until domcontent is loaded, then call the initiating fuction
document.addEventListener("DOMContentLoaded", function(){
  setupContent();
});

async function setupContent(){
  await setup_dropbox_client();
  add_navbar_listener();
  document.querySelector(".subsite_content").innerHTML = home_content
}


//////////////////////////// NAVIGATION BAR ////////////////////////////

function add_navbar_listener(){

  const navMenu = document.querySelector(".nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const navButton = document.querySelector(".nav-btn");
  const loadingScreen = document.getElementById('loading-screen'); //TODO

  navButton.addEventListener("click", () => {
      navMenu.classList.add("nav-open");
      navOverlay.classList.add("nav-overlay-open"); 
  });

  navOverlay.addEventListener("click", () => {
      navMenu.classList.remove("nav-open");
      navOverlay.classList.remove("nav-overlay-open");
  });

  const subsiteContent = document.querySelector(".subsite_content")

  document.querySelector("#link1").addEventListener("click", () => {
    subsiteContent.innerHTML = home_content
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link2").addEventListener("click", async () => {
    start_loading_screen();
    subsiteContent.innerHTML = order_form_content;
    add_order_form_listeners();
    const paths = ['/colors', '/forms', '/schemes', '/personalise'];
    const eleids = ['available_colors', 'available_forms','available_schemes','available_personalise'];
    const onClickParaOne = ["selected_color", "selected_form", "selected_scheme", "selected_personalise"]
    const onClickParaTwo = [selectedColor, selectedForm, selectedScheme, selectedPersonalise]
    
    for (let i = 0; i < paths.length; i++) {
      await loadFromDropbox(paths[i], eleids[i], onClickParaOne[i], onClickParaTwo[i]);
    }
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");

    end_loading_screen();

  })

  //STOCK
  document.querySelector("#link3").addEventListener("click", async () => {
    
    subsiteContent.innerHTML = ""
    await setup_stock()

    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  //GALLERY
  document.querySelector("#link4").addEventListener("click", async () => {
    subsiteContent.innerHTML = ""
    await setup_gallery();
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link5").addEventListener("click", () => {
    window.open("https://www.depop.com/isabellekoller/")
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link6").addEventListener("click", () => {
    window.open("https://www.instagram.com/issaknot/")
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })
}


//////////////////////////// ORDER ////////////////////////////

//this variables keep track of the selected images
let selectedForm = null;
let selectedColor = null;
let selectedScheme = null;
let selectedPersonalise = null;

function selectImage(image, className, selectedImage) {
  if (selectedImage != null) {
    selectedImage.classList.remove(className);
  }
  selectedImage = image;
  selectedImage.classList.add(className);
  return selectedImage;
}

function add_order_form_listeners(){
  const openModalBtn = document.getElementById("openModalBtn");
  const modal = document.getElementById("myModal");
  const submitBtn = document.getElementById("submitBtn");
  const emailInput = document.getElementById("email");

  openModalBtn.addEventListener("click", function() {
    modal.style.display = "block";
    let new_element = null;
    const container = document.querySelector(".current_selection")
    const form = document.querySelector(".selected_form")
    const color = document.querySelector(".selected_color")
    const scheme = document.querySelector(".selected_scheme")
    const personalise = document.querySelector(".selected_personalise")
    const selections = [form, color, scheme, personalise];

    selections.forEach(element => {
      if(element){
      new_element = document.createElement("img") 
      new_element.src = element.src
      container.appendChild(new_element)
    }
    })

  });

  window.addEventListener("click", function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  emailInput.addEventListener("input", function() {
    if (emailInput.value) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  });

  let form = document.getElementById("order_form");
  form.addEventListener("submit", function (event) {
      let desiredform = document.getElementsByClassName('selected_form')[0].id;
      let desiredcolor = document.getElementsByClassName('selected_color')[0].id;
      let orderDetails = `The visitor selected form = ${desiredform} and color = ${desiredcolor}`;
      document.getElementById("order_message").value = orderDetails;
  });
}

async function loadFromDropbox(path, eleid, onClickParaOne, onClickParaTwo) {
  await dbclient.filesListFolder({path: path}).then(async function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processData(response.entries, eleid, onClickParaOne, onClickParaTwo);
    while(has_more) {
      await dbclient.listFolderContinue({cursor: cursor}).then(function(response) {
        cursor = response.cursor;
        has_more = response.has_more;
         processData(response.entries, eleid, onClickParaOne, onClickParaTwo);
      });
    }
  });
}

async function processData(entries, eleid, onClickParaOne, onClickParaTwo) {
  let images = [];
  let promises = [];
  for (var i = 0; i < entries.length; i++) {
    var file = entries[i];
    if (file['.tag'] === 'file') {
      promises.push(dbclient.filesDownload({path: file.path_display}));
    }
  }
  await Promise.all(promises)
    .then( function(responses) {
      for (var i = 0; i < responses.length; i++) {
        var data = responses[i].fileBlob;
        var imgUrl = URL.createObjectURL(data);
        var image = document.createElement("img");
        image.classList.add(`${eleid}_image`)
        image.src = imgUrl;
        image.id = responses[i].name;
        images.push(image);
      }
      for(var i = 0; i < images.length; i++) {
        images[i].onclick = selectImage.bind(null, images[i], onClickParaOne, onClickParaTwo);
        document.getElementById(eleid).appendChild(images[i]);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}


//////////////////////////// STOCK ////////////////////////////

async function setup_stock(){
  start_loading_screen();
  await setup_dropbox_client();
  await dbclient.filesListFolder({path: '/stock'}).then(async function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    createProductGallery(response.entries);
    while(has_more) {
      await dbclient.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            createProductGallery(response.entries);
        });
      }
  });
}

async function createProductGallery(images) {
  console.log("images...")
  let promises = []
  for (var i = 0; i < images.length; i++) {
    var file = images[i];
    console.log(file)
    if (file['.tag'] === 'file') {
      promises.push(dbclient.filesDownload({path: file.path_display}))
    }
  }

  await Promise.all(promises)
  .then( function(responses) {
    requestAnimationFrame(() => {
      for (var i = 0; i < responses.length; i++) {
        const productGroups = {};
          for (var i = 0; i < responses.length; i++) {
            const productName = responses[i].name.split(".")[0].split("_")[0];
            if (!productGroups[productName]) {
              productGroups[productName] = [];
            }
            productGroups[productName].push(responses[i]);
          }
          const contentDiv = document.querySelector(".subsite_content");
          for (const productName in productGroups) {
            const productHeader = document.createElement("h3");
            productHeader.innerText = productName;
            contentDiv.appendChild(productHeader);
            const productGallery = document.createElement("div");
            productGallery.classList.add("image-grid")
            for (const productImage of productGroups[productName]) {
                const productImageElement = document.createElement("img");
                const data = productImage.fileBlob;
                const imgUrl = URL.createObjectURL(data);
                productImageElement.src = imgUrl;
                productImageElement.style.height = "100px";
                productImageElement.addEventListener("click", () => showModal(productImageElement.src));
                productGallery.appendChild(productImageElement);
            }
            contentDiv.appendChild(productGallery);
          }
      }
      end_loading_screen();
      addZoomLogic();
    });
  })
  .catch(function(error) {
    console.log(error);
  });

  
}


//////////////////////////// GALLERY ////////////////////////////

async function setup_gallery(){
  start_loading_screen();
  let gallery = document.createElement("div");
  gallery.classList.add("gallery");
  document.querySelector(".subsite_content").appendChild(gallery);
  await setup_dropbox_client();
  await dbclient.filesListFolder({path: '/gallery'}).then(async function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processGalleryImages(response.entries);
    while(has_more) {
      await dbclient.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            processGalleryImages(response.entries);
        });
      }
  });
}

async function processGalleryImages(entries) {
  let images = [];
  let promises = []
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      console.log(file)
      if (file['.tag'] === 'file') {
        promises.push(dbclient.filesDownload({path: file.path_display}))
      }
  }
  await Promise.all(promises)
  .then( function(responses) {
    requestAnimationFrame(() => {
      for (var i = 0; i < responses.length; i++) {
        console.log(responses[i])
        var data = responses[i].fileBlob;
        var imgUrl = URL.createObjectURL(data);
        var figure = document.createElement("figure");
        var image = document.createElement("img");
        var caption = document.createElement("figcaption");
        if(responses[i].name.includes("#")){
          caption.innerHTML = responses[i].name.replace(/.\w+$/, "").replaceAll("#", " #")
        }
        image.classList.add("gallery_image")
        image.src = imgUrl;
        image.id = responses[i].name
        images.push(image)
        figure.appendChild(image);
        figure.appendChild(caption);
        document.querySelector(".gallery").appendChild(figure);
      }
      end_loading_screen();
    });
  })
  .catch(function(error) {
    console.log(error);
  });
}


//////////////////////////// HTML CONTENT ////////////////////////////

let order_form_content = `
  <div class="content__container">
    <p class="content__normal-font">Actually, I crochet almost daily and my biggest problem is that I run out of ideas. So if you have a great idea how your dream crochet bag could look like, I would love to hear about it!</p>
    <div class="content__horizontal-spacer"></div>
    <p class="content__heading">model</p>
    <div id="available_forms"></div>
    <p class="content__heading">colour</p>
    <div id="available_colors"></div>
    <p class="content__heading">colour scheme</p>
    <div id="available_schemes"></div>
    <p class="content__heading">personalise</p>
    <div id="available_personalise"></div>
    <div style="height: 10vh;"></div>
    <button id="openModalBtn">Submit</button>
    <div id="myModal" class="modal">
      <div class="modal-content">
        <label>Your selection:</label>
        <div class="current_selection">
        </div>
        <form action="https://formspree.io/f/xayznkgq" method="POST" id="order_form">
          <label for="comments">Comments:</label>
          <textarea id="comments" type="text" name="comments"></textarea>
          <label for="email">Your email (required):</label>
          <input type="email" id="email" name="email" required>
          <input type="hidden" name="message" id="order_message">
          <button type="submit" id="submitBtn" disabled>Submit</button>
        </form>
      </div>
    </div>
  </div>`;

let home_content = `
<h1>Hoi :)</h1>
<img src="images/me_selfie.png" alt="pic_of_me">`;

let loading = `
<div id="loading-screen">
<div class="loading-spinner"></div>
<p>Loading...</p>
</div>`;