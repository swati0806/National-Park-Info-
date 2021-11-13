let requestURL = "https://developer.nps.gov/api/v1/parks?";
let apiKey = "api_key=7ZAQhJXxiTqiNKzb61UvxO8aMAnzujFa51BKWBXf";
let filteredData = [];
let currentPage = 0;
let limit = 50;
let totalPages = 1;
let spinner;
window.onload = function(){
    spinner = document.getElementById("parkspinner");
}

$( "#park_form" ).submit(function( event ) {//to prevent form submit
    event.preventDefault();
  });

function processFields() // Ensures at least one search criteria is selected before proceeding
{
    //spinner.setAttribute("style", "display: block");
    let state = document.getElementById("state").value;
    let desig = document.getElementById("desig").value;
    let keyword = document.getElementById("keyword").value;
    if (state == "all" || state == "" && desig == "all" || desig == "" && keyword == "")
    {
        window.alert("Please enter at least one search criteria.")
    }else{
        getData(state, desig, keyword);
        spinner.style.display = "block";
    }
}

function getData(state, desig, keyword) // Initial API Request
{
    let parks = document.getElementById("park_list");
    while (parks.firstChild)
    {
        parks.removeChild(parks.firstChild);
    }
    currentPage = 0; //Reset page numbers
    document.getElementById("back").style.display = "none"; //Hides previous button
    document.getElementById("forward").style.display = "none"; //Hides mext button

    requestURL = "https://developer.nps.gov/api/v1/parks?"; //reset base URL for each new call
    if (state != "all") //Filters by state if a state filter is selected
    {
        requestURL += "stateCode=" + state + "&";
    }
    if (keyword == "" && desig != "all" && desig != "") // Prioritizes keyword over designation for "Term to search" API call
    {
        requestURL += "q=" + desig + "&"; // We use this to decrease the number of results to iterate over for designation filtering
    }
    else if (keyword != "") // Filters by keyword
    {
        requestURL += "q=" + keyword + "&";
    }

    let request = new XMLHttpRequest();
    request.open('GET', requestURL + apiKey);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        console.log("Loaded");
        spinner.style.display = "none";
        let data = request.response;
        totalPages = Math.ceil(request.response['total']/limit); // totalPages is set to the number of requests needed to get all the data
        console.log(totalPages);
        if (desig != "all") // Use iterative designation filtering
        {
            designationFilter(desig, data.data);
        }else{
            if (totalPages == 1)
            {
                document.getElementById("forward").style.display = "none";
            }else{
                document.getElementById("forward").style.display = "inline";
            }
            populateData(data.data) // Sends just the park data
        }
    }
    
}

function designationFilter(desig, data)
{
    console.log("Called designationFilter()");
    for (let entry of data)
    {
        if (entry.designation == desig && entry.description != "")
        {
            filteredData.push(entry);
        }
    }
    currentPage++;
    if (currentPage < totalPages){
        console.log("Making another API call.");
        desigRequest(desig);
    }else{
        currentPage = 0;
        totalPages = 1;
        populateData(filteredData);
    }
}

function desigRequest(desig) //Requests more results for designation filter
{
    let start = currentPage*limit;
    let URLDataBegin = "start=" + start + "&"

    let request = new XMLHttpRequest();
    request.open('GET', requestURL + URLDataBegin + apiKey);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        let data = request.response;
        console.log("desigRequest(): Total Items: " + data.total);
        designationFilter(desig, data.data);
    }
}

function nextPage() //Handles going to the next page of data
{
    currentPage++
    document.getElementById("back").style.display = "inline";
    if(currentPage == totalPages - 1)
    {
        document.getElementById("forward").style.display = "none";
    }else{
        document.getElementById("forward").style.display = "inline";
    }
    changePage();
}

function previousPage() //Handles going to the previous page of data
{
    currentPage--;
    document.getElementById("forward").style.display = "inline";
    if(currentPage == 0)
    {
        document.getElementById("back").style.display = "none";
    }else{
        document.getElementById("back").style.display = "inline";
    }
    changePage();
}

function changePage() //Gets an iteration of the current API request based on the current page number
{
    let start = currentPage*limit;
    let URLDataBegin = "start=" + start + "&"

    let request = new XMLHttpRequest();
    request.open('GET', requestURL + URLDataBegin + apiKey);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        let data = request.response;
        populateData(data.data)
    }
}

function populateData(data) // Displays data from the current API Request
{
    let section = document.getElementById("info");
    //let parks = document.createElement("div");
    //parks.setAttribute("class", "park_list");
    let parks = document.getElementById("park_list");

    let pageNumDiv = document.getElementById("pgCounter");
    let pageNum = document.createElement("p");

    for (let i = 0; i < data.length; i++)
    {
        let entry = data[i];

        if (entry.description != "") // Make sure valid park
        {
            let parkData = document.getElementById("model_node").cloneNode(true);
            // parkData.setAttribute("class", "park_node");
            parkData.setAttribute("style", "");
            // let name = document.createElement("h3");
            parkData.children[0].children[0].appendChild(document.createTextNode(entry.fullName));
            // let states = document.createElement("h6");
            parkData.children[1].children[0].children[0].children[0].appendChild(document.createTextNode(entry.states));
            // let desc = document.createElement("p");
            parkData.children[1].children[1].appendChild(document.createTextNode(entry.description));
            parkData.children[1].children[0].children[1].children[0].appendChild(document.createTextNode(entry.parkCode));
            parkData.children[1].children[2].setAttribute("value", entry.parkCode);
            /** 
            parkData.appendChild(name);
            parkData.appendChild(states);
            parkData.appendChild(desc);*/

            parks.appendChild(parkData);
        }
        
    }
    if (data.length == 0)
    {
        parks.appendChild(document.createTextNode("No data returned."));
    }

    //section.replaceChild(parks, section.children[0]);
    filteredData = [];
}

function getPark(parkNode)
{
    console.log("Clicked!");
    let parkCode = parkNode.getAttribute("value");
    sessionStorage["parkCode"] = parkCode;
    window.location = "park.html";
}
