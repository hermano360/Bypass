var shortenUrl = function(longURL) {
  var request = gapi.client.urlshortener.url.insert({
    resource: {
      longUrl: longURL
    }
  });
  request.execute(function(response) {
    var shortUrl = response.id;
    console.log('short url:', shortUrl);
  });
};

var googleApiLoaded = function() {
  gapi.client.setApiKey("AIzaSyCIu9Dm-zpNCIo5oaE4N8RHZFovqKSHbWg")
  gapi.client.load("urlshortener", "v1", function(){});
};

window.googleApiLoaded = googleApiLoaded;
$(document.body).append('<script src="https://apis.google.com/js/client.js?onload=googleApiLoaded"></script>');