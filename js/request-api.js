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
    response.results.forEach(res => {
        contenido.innerHTML += `
        <div class="row row-cols-1 row-cols-md-2">
            <div class="col mb-4">
                <div class="card">
                <img src="${res.image_url}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${res.title}</h5>
                        <p class="card-text">${res.synopsis}</p>
                    </div>
                </div>
            </div>
        </div>
        `
    });
    contenido.innerHTML

}

async function searchManga() {
    var search = sessionStorage.getItem('id');
    let contenido = document.querySelector('#manga_content');
    $("#manga_content").empty();

    const urlRequest = await fetch('https://api.jikan.moe/v3/search/manga?q=' + search + '&page=1&limit=20');
    const response = await urlRequest.json();
    console.log(response);
    console.log(response.results);
    response.results.forEach(res => {
        contenido.innerHTML += `
        <div class="row row-cols-1 row-cols-md-2">
            <div class="col mb-4">
                <div class="card">
                <img src="${res.image_url}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${res.title}</h5>
                        <p class="card-text">${res.synopsis}</p>
                    </div>
                </div>
            </div>
        </div>
        `
    });
    contenido.innerHTML
}

function almacenarId(){
    let search = document.getElementById('search');
    sessionStorage.setItem('id',search.value);
}
