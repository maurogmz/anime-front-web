$(document).ready(function() {
    setTimeout(detailsDocument(), 4000);
});

function detailsDocument() {
    
    //var malDetails = JSON.parse(sessionStorage.getItem('malObject'));
    var malDetails = sessionStorage.getItem('malObject');
    console.log(malDetails);
    /*malDetails.forEach(res => {
    });*/
    let nameTitle = document.querySelector('#name_title');
    $("#name_title").empty();
    nameTitle.innerHTML += `${malDetails[0]}`;


}