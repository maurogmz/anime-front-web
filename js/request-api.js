$(document).ready(function() {
    searchAnime()
    searchManga()
});


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function almacenarId() {
    let search = document.getElementById('search');
    sessionStorage.setItem('id',search.value);
}

async function getIdForDetails(malId, malTitle, malImage, malSynopsis, malScore) {
    var text = '{"mal_id": "'+malId+'", "title": "'+malTitle+'", "image_url": "'+malImage+'", "synopsis": "'+malSynopsis+'", "score": "'+malScore+'"}' 
    //console.log(JSON.parse(text));
    var obj = JSON.parse(text);
    var arrayElems = [malId, malTitle, malImage, malSynopsis, malScore];
    console.log(malId);
    sessionStorage.setItem('malObject', JSON.stringify(obj));
    
}

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
            //let arrayElementsDetail = [{"a":res.mal_id,"b":res.title, "c": res.image_url, "d": res.synopsis, "e": res.score}];
            var datejson = new Date(res.start_date);
            console.log(res.mal_id);
            var options = {year: 'numeric', month: '2-digit', day: '2-digit' };
            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.image_url} />
                <div class="card--description">
                    <h1 class="card--title card-title-anime">${res.title}</h1>
                    <div class="card--enums card-enums-anime">
                        ${res.type} (${res.episodes} eps)
                        <br>
                        Rated: ${res.rated}
                        <br>
                        Date of Issue: ${datejson.toLocaleDateString("es-MX", options)}
                    </div>
                </div>
                <div class="card--right">
                    <div class="card--score card-score-anime">
                        ${res.score}
                    </div>
                    <a class="card--link" role="button" onclick="getIdForDetails('${res.mal_id}','${res.title}','${res.image_url}','${res.synopsis}','${res.score}')" href="#">See More</a>
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
            var datejson = new Date(res.start_date);
            var options = {year: 'numeric', month: '2-digit', day: '2-digit' };
            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.image_url} />
                <div class="card--description">
                    <h1 class="card--title card-title-manga">${res.title}</h1>
                    <div class="card--enums card-enums-manga">
                        ${res.type} (${res.volumes} vols)
                        <br>
                        Chapters: ${res.chapters}
                        <br>
                        Date of Issue: ${datejson.toLocaleDateString("es-MX", options)}
                    </div>
                </div>
                <div class="card--right">
                    <div class="card--score card-score-manga">
                        ${res.score}
                    </div>
                    <a class="btn card--link" href="#" role="button">See More</a>
                </div>  
            </div>
            `
        });
        contenido.innerHTML
    }
    
}


