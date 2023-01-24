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
  
  load_forms_from_dropbox();
  load_colors_from_dropbox();
  add_submit_listener();
}