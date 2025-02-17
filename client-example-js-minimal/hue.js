// global variables:
let address, url, userid, command, data, request;

function setup() {
  // add event listeners to all the fields:
  let fields = document.getElementsByClassName("fields");
  for (let f of fields) {
    f.addEventListener("change", getFieldValues);
  }
  // add event listeners to all the buttons:
  let buttons = document.getElementsByClassName("buttons");
  for (let b of buttons) {
    b.addEventListener("click", sendRequest);
  }
}

// this function makes the actual request using fetch():
function sendRequest(event) {
  // get request method from the button that called sendRequest:
  let requestMethod = event.target.value;

  // set the parameters:
  let params = {
    method: requestMethod, // GET, POST, PUT, DELETE, etc.
    // mode: 'no-cors', // if you need to turn off CORS, use this
    headers: {    // any HTTP headers you want can go here
      'accept': 'application/json'
    }
  }
  // if the request is not a get, 
  // and there's data in the data field to send, add it:
  if (requestMethod !== 'GET') {
    params.body = data;
  }
  // make the request:
  fetch(url, params)
    .then(response => response.json())  // convert response to JSON
    .then(data => getResponse(JSON.stringify(data)))   // get the body of the response
    .catch(error => getResponse(error));// if there is an error
}
// print the response to the page:
function getResponse(response) {
  let responseDiv = document.getElementById("response");
  responseDiv.innerHTML = response;
}

// when any of the fields changer (user hits enter in a field),
// update the request field with the full URL to be called:
function getFieldValues() {
  let addressField = document.getElementById("address");
  address = addressField.value;
  let useridField = document.getElementById("userid");
  userid = useridField.value;
  let commandField = document.getElementById("command");
  command = commandField.value;
  let dataField = document.getElementById("data");
  data = dataField.value;

  url = 'http://' + address + '/api/' + userid + command;
  let requestField = document.getElementById('url');
  requestField.innerHTML = "Request:<br>" + url + "<br><br>Request body:<br>" + data;

}

// listen for the HTML page to load fully:
document.addEventListener('DOMContentLoaded', setup);