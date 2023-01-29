let selectedForm = null;
let selectedColor = null;
let accessToken;
let dbclient

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

function add_submit_listener() {
    let form = document.getElementById("order_form");
    form.addEventListener("submit", function (event) {
        let desiredform = document.getElementsByClassName('selected_form')[0].id;
        let desiredcolor = document.getElementsByClassName('selected_color')[0].id;
        let orderDetails = `The visitor selected form = ${desiredform} and color = ${desiredcolor}`;
        document.getElementById("order_message").value = orderDetails;
    });
}

function load_colors_from_dropbox(){
  dbclient.filesListFolder({path: '/colors'}).then(function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processColors(response.entries);
    while(has_more) {
      dbclient.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            processColors(response.entries);
        });
      }
  });
}

function load_forms_from_dropbox(){
  dbclient.filesListFolder({path: '/forms'}).then(function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processForms(response.entries);
    while(has_more) {
      dbclient.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            processForms(response.entries);
        });
      }
  });
}

function processColors(entries) {
  let eleid = "available_colors"
  let images = [];
  let promises = []
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      if (file['.tag'] === 'file') {
        promises.push(dbclient.filesDownload({path: file.path_display}))
      }
  }
  Promise.all(promises)
  .then( function(responses) {
    for (var i = 0; i < responses.length; i++) {
      var data = responses[i].fileBlob;
      var imgUrl = URL.createObjectURL(data);
      var image = document.createElement("img");
      image.classList.add("color_image")
      image.src = imgUrl;
      image.id = responses[i].name
      images.push(image)
    }
    for(var i = 0; i < images.length; i++) {
      images[i].onclick = selectColor.bind(null, images[i]);
      document.getElementById(eleid).appendChild(images[i]);
    }

  })
  .catch(function(error) {
    console.log(error);
  });
}

function processForms(entries) {
  let eleid = "available_forms"
  let images = [];
  let promises = []
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      if (file['.tag'] === 'file') {
        promises.push(dbclient.filesDownload({path: file.path_display}))
      }
  }
  Promise.all(promises)
  .then( function(responses) {
    for (var i = 0; i < responses.length; i++) {
      console.log(responses[i])
      var data = responses[i].fileBlob;
      var imgUrl = URL.createObjectURL(data);
      var image = document.createElement("img");
      image.classList.add("form_image")
      image.src = imgUrl;
      image.id = responses[i].name
      images.push(image)
    }
    for(var i = 0; i < images.length; i++) {
      images[i].onclick = selectForm.bind(null, images[i]);
      document.getElementById(eleid).appendChild(images[i]);
    }
    end_loading_screen();
  })
  .catch(function(error) {
    console.log(error);
  });
}

function refresh_access_token(){
  return new Promise((resolve, reject) => {
    let appkey = "53dorqe8v51i41q"
    let appsecret = "ocy272lq4w0q1k3"
    let refrestoken = "IhUaFM0MkQ4AAAAAAAAAAbPlW8JINEoLeXDl-DE9tT0WeE1iRrhpFdzUAYE1WBmJ"
    fetch('https://api.dropboxapi.com/1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'refresh_token=' + refrestoken 
      + '&grant_type=refresh_token' 
      + '&client_id=' + appkey 
      + '&client_secret=' + appsecret
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      resolve(data.access_token)
    })
    .catch(error => reject(error))
  })
}

function authenticate_dropbox_client(){
  const client = new Dropbox.Dropbox({
   accessToken: accessToken,
   fetch: fetch
 });
 return client
}

async function setup_dropbox_client(){
  try {
    accessToken = await refresh_access_token()
    dbclient = authenticate_dropbox_client()
  } catch (error) {
    console.error(error)
  } 
}

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

  document.querySelector("#link2").addEventListener("click", () => {
    start_loading_screen();
    subsiteContent.innerHTML = order_form_content;
    add_submit_listener();
    load_forms_from_dropbox();
    load_colors_from_dropbox();
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
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

function addZoomLogic(){
  const imgModal = document.createElement("div");
  imgModal.classList.add("img-modal");

  const img = document.createElement("img");
  img.classList.add("img-zoom");

  imgModal.appendChild(img);
  document.querySelector(".subsite_content").appendChild(imgModal);

  const showModal = (src) => {
    img.src = src;
    imgModal.style.display = "flex";
  };

  const hideModal = () => {
    imgModal.style.display = "none";
  };

  imgModal.addEventListener("click", hideModal);

  const images = document.querySelectorAll("img");
  for (const image of images) {
    console.log(image)
    image.addEventListener("click", () => showModal(image.src));
  }   
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

async function setupContent(){
  await setup_dropbox_client();
  add_navbar_listener();
  document.querySelector(".subsite_content").innerHTML = home_content
}

document.addEventListener("DOMContentLoaded", function(){
  setupContent();
});


let order_form_content = `
    <h1>Wähle deine Form</h1>
    <div id="available_forms"></div>
    <h1>Wähle deine Farbe</h1>
    <div id="available_colors"></div>
    <p></p>
    <div class="form-container">
      <form action="https://formspree.io/f/xayznkgq" method="POST" id="order_form">
        <label>Your email:</label>
        <input type="email" name="email" required>
        <input type="hidden" name="message" id="order_message">
        <button type="submit">Send</button>
      </form>
    </div>`;

let home_content = `
<h1>Hoi :)</h1>
<img src="images/me_selfie.png" alt="pic_of_me">`;

let loading = `
<div id="loading-screen">
<div class="loading-spinner"></div>
<p>Loading...</p>
</div>`;