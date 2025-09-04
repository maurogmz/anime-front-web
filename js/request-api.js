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

    const urlRequest = await fetch('https://api.jikan.moe/v4/anime?q=' + search + '&limit=20');
    const response = await urlRequest.json();
    console.log(response);

    if (search != null) {
        response.data.forEach(res => {
            var datejson = new Date(res.aired?.from);
            var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.images.jpg.image_url} />
                <div class="card--description">
                    <h1 class="card--title card-title-anime">${res.title}</h1>
                    <div class="card--enums card-enums-anime">
                        ${res.type} (${res.episodes ?? "?"} eps)
                        <br>
                        Date of Issue: ${datejson.toLocaleDateString("es-MX", options)}
                    </div>
                </div>
                <div class="card--right">
                    <div class="card--score card-score-anime">
                        ${res.score ?? "N/A"}
                    </div>
                    <a class="card--link" role="button"
                       onclick="getIdForDetails('${res.mal_id}','${res.title}','${res.images.jpg.image_url}','${res.synopsis}','${res.score}')"
                       href="#">See More</a>
                </div>
            </div>
            `
        });
    }
}


async function searchManga() {
    var search = sessionStorage.getItem('id');
    let contenido = document.querySelector('#manga_content');
    $("#manga_content").empty();

    const urlRequest = await fetch('https://api.jikan.moe/v4/manga?q=' + search + '&limit=20');
    const response = await urlRequest.json();
    console.log(response);

    if (search != null) {
        response.data.forEach(res => {
            var datejson = res.published?.from ? new Date(res.published.from) : null;
            var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

            contenido.innerHTML += `
            <div class="card--section">
                <img class="card--avatar" src=${res.images.jpg.image_url} />
                <div class="card--description">
                    <h1 class="card--title card-title-manga">${res.title}</h1>
                    <div class="card--enums card-enums-manga">
                        ${res.type} (${res.volumes ?? "?"} vols)
                        <br>
                        Chapters: ${res.chapters ?? "?"}
                        <br>
                        Date of Issue: ${datejson ? datejson.toLocaleDateString("es-MX", options) : "N/A"}
                    </div>
                </div>
                <div class="card--right">
                    <div class="card--score card-score-manga">
                        ${res.score ?? "N/A"}
                    </div>
                    <a class="btn card--link" href="#" role="button"
                       onclick="getIdForDetails('${res.mal_id}','${res.title}','${res.images.jpg.image_url}','${res.synopsis}','${res.score}')">
                       See More
                    </a>
                </div>  
            </div>
            `
        });
    }
}



