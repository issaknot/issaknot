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
        let desiredform = document.getElementsByClassName('selected_form')[0].src.split("/").pop();
        let desiredcolor = document.getElementsByClassName('selected_color')[0].src.split("/").pop();
        let orderDetails = `The visitor selected form = ${desiredform} and color = ${desiredcolor}`;
        document.getElementById("order_message").value = orderDetails;
    });
}

function setupContent(){
    add_submit_listener();
    load_forms_from_dropbox();
    load_colors_from_dropbox();
}

function load_colors_from_dropbox(){
  const client = authenticate_dropbox_client();
  
  client.filesListFolder({path: '/colors'}).then(function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processEntries(response.entries, client, "available_colors");
    while(has_more) {
        client.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            processEntries(response.entries, client, "available_colors");
        });
      }
  });
}

function load_forms_from_dropbox(){
  const client = authenticate_dropbox_client();
  
  client.filesListFolder({path: '/forms'}).then(function(response) {
    var cursor = response.cursor;
    var has_more = response.has_more;
    processEntries(response.entries, client, "available_forms");
    while(has_more) {
        client.listFolderContinue({cursor: cursor}).then(function(response) {
            cursor = response.cursor;
            has_more = response.has_more;
            processEntries(response.entries, client, "available_forms");
        });
      }
  });
}

function authenticate_dropbox_client(){
   const client = new Dropbox.Dropbox({
    accessToken: 'sl.BXe9Ehftf5VRp4l8g7DZUQXPsnQkoCQWE9w6oHzj7Li8DCCW10aWYYFEw5Ngq36JG24tzpDE_8c_k1R5nGVsZXnqnkfdZps1DHw7k24aQQSl8V1gUYkzL5IKcHQRu1qr6DLl1hQ',
    fetch: fetch
  });
  return client
}

function processEntries(entries, dbclient, eleid) {
  for (var i = 0; i < entries.length; i++) {
      var file = entries[i];
      if (file['.tag'] === 'file') {
          dbclient.filesDownload({path: file.path_display}).then(function(response) {
              var data = response.fileBlob;
              var imgUrl = URL.createObjectURL(data);
              var image = document.createElement("img");
              image.src = imgUrl;
              image.onclick = selectColor.bind(null, image);
              document.getElementById(eleid).appendChild(image);
          }).catch(function(error) {
              console.log(error);
          });
      }
  }
}


window.onload = setupContent();