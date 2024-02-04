"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiUrl = "https://igcse-past-year-finder.as.r.appspot.com/";
let form;
let statusText;
let errorText;
let clearErrorTextTimeoutId;
let searchBar;
function getApiUrl(paperCode, paperType) {
    const query = new URLSearchParams();
    query.set("code", paperCode);
    query.set("type", paperType);
    return apiUrl + "?" + query.toString();
}
// show messages
function showStatusMessage(message) {
    statusText.textContent = message;
    statusText.hidden = false;
}
function clearStatusMessage() {
    statusText.hidden = true;
}
function showErrorMessage(message) {
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
function onSubmit() {
    return __awaiter(this, void 0, void 0, function* () {
        clearErrorMessage();
        const paperCode = document.getElementById("search-bar").value;
        const paperType = document.getElementById("question-paper").checked ? "qp" : "ms";
        const url = getApiUrl(paperCode, paperType);
        const res = yield fetch(url);
        const json = yield res.json();
        console.log(json);
        if (json.success === 0) {
            showErrorMessage(json.message);
            return;
        }
        window.open(json.url);
    });
}
document.addEventListener("DOMContentLoaded", function (event) {
    form = document.forms.namedItem("search");
    statusText = document.getElementById("status-text");
    errorText = document.getElementById("error-text");
    searchBar = document.getElementById("search-bar");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showStatusMessage("Loading...");
        onSubmit().then(clearStatusMessage);
    });
});
