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
  
function authenticate_dropbox_client(accessToken){
const client = new Dropbox.Dropbox({
    accessToken: accessToken,
    fetch: fetch
});
return client
}


export {refresh_access_token, authenticate_dropbox_client}