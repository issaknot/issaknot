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
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      if (file['.tag'] === 'file') {
        dbclient.filesDownload({path: file.path_display}).then(function(response) {
              var data = response.fileBlob;
              var imgUrl = URL.createObjectURL(data);
              var image = document.createElement("img");
              image.classList.add("color_image")
              image.src = imgUrl;
              image.id = response.name
              image.onclick = selectColor.bind(null, image);
              document.getElementById(eleid).appendChild(image);
          }).catch(function(error) {
              console.log(error);
          });
      }
  }
}

function processForms(entries) {
  let eleid = "available_forms"
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      if (file['.tag'] === 'file') {
        dbclient.filesDownload({path: file.path_display}).then(function(response) {
              var data = response.fileBlob;
              var imgUrl = URL.createObjectURL(data);
              var image = document.createElement("img");
              image.classList.add("form_image")
              image.src = imgUrl;
              image.id = response.name
              image.onclick = selectForm.bind(null, image);
              document.getElementById(eleid).appendChild(image);
          }).catch(function(error) {
              console.log(error);
          });
      }
  }
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

function test(){
  console.log("clicked")
}

function add_navbar_listener(){

  const navMenu = document.querySelector(".nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const navButton = document.querySelector(".nav-btn");

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
    subsiteContent.innerHTML = order_form_content
    add_submit_listener();
    load_forms_from_dropbox();
    load_colors_from_dropbox();
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link3").addEventListener("click", () => {
    subsiteContent.innerHTML = ""
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link4").addEventListener("click", () => {
    subsiteContent.innerHTML = ""
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link5").addEventListener("click", () => {
    window.open("https://www.instagram.com/issaknot/")
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })

  document.querySelector("#link6").addEventListener("click", () => {
    window.open("https://www.depop.com/isabellekoller/")
    navMenu.classList.remove("nav-open");
    navOverlay.classList.remove("nav-overlay-open");
  })
}

window.onload = setupContent();

let accessToken;
let dbclient

async function setupContent(){
  try {
    accessToken = await refresh_access_token()
    dbclient = authenticate_dropbox_client()
  } catch (error) {
    console.error(error)
  } 
  add_navbar_listener();
  document.querySelector(".subsite_content").innerHTML = home_content
}

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