const apiUrl = "https://igcse-past-year-finder.as.r.appspot.com/";
let form: HTMLElement;
let statusText: HTMLElement;
let errorText: HTMLElement;
let clearErrorTextTimeoutId: number;
let searchBar: HTMLElement;

function getApiUrl(paperCode: string, paperType: string) {
    const query = new URLSearchParams();
    query.set("code", paperCode);
    query.set("type", paperType);
    return apiUrl + "?" + query.toString();
}

// show messages
function showStatusMessage(message: string) {
    statusText.textContent = message;
    statusText.hidden = false;
}

function clearStatusMessage() {
    statusText.hidden = true;
}

function showErrorMessage(message: string) {
    errorText.textContent = message;
    errorText.hidden = false;
    clearErrorTextTimeoutId = setTimeout(() => {
        errorText.hidden = true;
    }, 2000);
}

function clearErrorMessage() {
    errorText.hidden = true;
    clearTimeout(clearErrorTextTimeoutId);
}

// on submit
async function onSubmit() {
    clearErrorMessage();

    const paperCode = (document.getElementById("search-bar") as HTMLInputElement).value;

    let paperType;
    if ((document.getElementById("question-paper") as HTMLInputElement).checked) paperType = "qp";
    else if ((document.getElementById("mark-scheme") as HTMLInputElement).checked) paperType = "ms";
    else if ((document.getElementById("insert-paper") as HTMLInputElement).checked) paperType = "in";
    else {
        showErrorMessage("Please select a paper type");
        return;
    }

    const url = getApiUrl(paperCode, paperType);

    const res = await fetch(url);
    const json = await res.json();

    console.log(json);

    if (json.success === 0) {
        showErrorMessage(json.message);
        return;
    }

    window.open(json.url);
}

document.addEventListener("DOMContentLoaded", function (event) {
    form = document.forms.namedItem("search")!;
    statusText = document.getElementById("status-text")!;
    errorText = document.getElementById("error-text")!;
    searchBar = document.getElementById("search-bar")!;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showStatusMessage("Loading...");
        onSubmit().then(clearStatusMessage);
    });
});
