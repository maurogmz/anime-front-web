$(document).ready(function() {
    searchAnime();
    searchManga();
});

async function searchAnime() {
    
    var search = sessionStorage.getItem('id');
    let contenido = document.querySelector('#anime_content');
    $("#anime_content").empty();

    const urlRequest = await fetch('https://api.jikan.moe/v3/search/anime?q=' + search + '&page=1&limit=20');
    const response = await urlRequest.json();
    console.log(response);
    console.log(response.results);
    if( search != null) {
        response.results.forEach(res => {
            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.image_url} />
                <div class="card--desription">
                    <h1 class="card--title card-title-anime">${res.title}</h1>
                    <p class="card--synopsis card-synopsis-anime">${res.synopsis}</p>
                </div>   
            </div>
            `
        });
        contenido.innerHTML
    }  

}

async function searchManga() {
    var search = sessionStorage.getItem('id');
    let contenido = document.querySelector('#manga_content');
    $("#manga_content").empty();

    const urlRequest = await fetch('https://api.jikan.moe/v3/search/manga?q=' + search + '&page=1&limit=20');
    const response = await urlRequest.json();
    console.log(response);
    console.log(response.results);
    if( search != null) {
        response.results.forEach(res => {
            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.image_url} />
                <div class="card--desription">
                    <h1 class="card--title card-title-manga">${res.title}</h1>
                    <p class="card--synopsis card-synopsis-manga">${res.synopsis}</p>
                </div>   
            </div>
            `
        });
        contenido.innerHTML
    }
    
}

function almacenarId() {
    let search = document.getElementById('search');
    sessionStorage.setItem('id',search.value);
}
