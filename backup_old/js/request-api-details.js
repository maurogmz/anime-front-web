$(document).ready(function() {
    setTimeout(detailsDocument(), 4000);
});

function detailsDocument() {
    document.getElementById("image_detail").src = "";
    let nameTitle = document.querySelector('#name_title');
    $("#name_title").empty();
    var malDetails = JSON.parse(sessionStorage.getItem('malObject'));
    //var malDetails = sessionStorage.getItem('malObject');
    console.log(malDetails);
    document.getElementById("image_detail").src = malDetails.image_url; 
    nameTitle.innerHTML += `${malDetails.title}`;
}