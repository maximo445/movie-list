class IdGerator {
    _generateUniqueId() {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 1000); // Adjust the range as needed
        return `${timestamp}-${randomNum}`;
    }
}

class App {

    constructor(){

        this.ui = new UI();
        this.searchUI = new SearchUI();
        
        // check for load and page changes
        window.addEventListener('load', this._route.bind(this));
        window.addEventListener('hashchange', this._route.bind(this));

        //display add form
    }
    
    _route() {
        
        const pathName = window.location.pathname;
        
        switch (pathName) {
            case '/index.html':
                this.ui.displayPopularMovies();
                this.ui.isSelected('movie');          
                break;
            case '/shows.html':
                this.ui.displayPopularShows();
                this.ui.isSelected('tv');
                break;
            case '/list.html':
                this.ui.displayListFilms();
                break;
            case '/search.html':
                this.searchUI.displaySearch();
                this.searchUI.displayBackNaviation();
                break;
            default:
                break;
        }

    }
}

class UI {

    constructor() {
        this._fetcher = new Fetcher();
        this._filmTracker = new FilmsTracker();
        this._listOpened = false;
    }

    _closePopUp() {
        document.querySelector('#add-to-list-popup').style.display = 'none';
    }

    _showCreateList() {        
        document.querySelector('#create-list').style.display = 'block';
    }

    isSelected() {

        const currentURL = window.location.href;

        const urlParams = new URL(currentURL);

        let type = urlParams.searchParams.get('type');

        const movies = document.querySelector('#selection .movies');
        const tv = document.querySelector('#selection .tv');

        if (type === 'movies' || !type) {
            movies.classList.add('isSelected');
            tv.classList.remove('isSelected');
        } else if (type === 'tv') {
            tv.classList.add('isSelected');
            movies.classList.remove('isSelected');
        }

    }

    _addFilm(e) {

        e.preventDefault();

        let name = '';
        let id ='';
        let poster = '';

        if (e.target.classList.contains('fas')) {
            name = e.target.parentElement.getAttribute('data-name');
            id = e.target.parentElement.getAttribute('data-id');            
            poster = e.target.parentElement.getAttribute('data-poster');            
        } else {
            name = e.target.getAttribute('data-name');
            id = e.target.getAttribute('data-id');
            poster = e.target.getAttribute('data-poster');
        }

        const checkedLists = e.target.querySelectorAll('input[type="checkbox"]:checked');

        checkedLists.forEach(selection => {
            this._filmTracker.addTolist(name, id, poster, selection.value);
        });

        if (this._listOpened) {
            this._render('updateListsPU');
        }

        this._filmTracker.compareData();

        this._closePopUp();

    }

    _render(action) {
        switch (action) {
            case 'updateListsPU':
                this._displayListsPopUp(false, true);
                break;        
            default:
                break;
        }
    }

    createTemplateLists() {
        const names = ['worship', 'powerful', 'insipirational']
        names.forEach(name => {
            this._filmTracker.createList(name);
        })
    }

    _createList(e) {

        e.preventDefault();

        const name = e.target.previousElementSibling.previousElementSibling.getAttribute('data-name');
        const id = e.target.previousElementSibling.previousElementSibling.getAttribute('data-id');
        const poster = e.target.previousElementSibling.previousElementSibling.getAttribute('data-poster'); 

        const listName = document.querySelector('#list-name').value;

        const newList = this._filmTracker.createList(listName);

        this._filmTracker.addTolist(name, id, poster, newList.id);

        if (this._listOpened) {
            this._render('updateListsPU');
        }

        this._filmTracker.compareData();

        this._closePopUp();
    }

    _displayListsPopUp (event, dontClose = false) {

        console.log({listOpened: this._listOpened, dontClose});

        const numberOfList = this._filmTracker.lists.length;

        if (numberOfList <= 0) return;

        if (!this._listOpened || dontClose) {

            const popUp = document.querySelector('.toggle-lists .list-container');
            if (popUp) {
                popUp.remove();
            }

            const div = document.createElement('div');
            div.classList.add('list-container');
            div.innerHTML = `
                <ul>
                    ${this._filmTracker.lists.map(list => {
                        return `
                        <li><a id="list-name-films" href="list.html?id=${list.id}"><span>${list.getShortName()}:</span> <span>${list.films.length}</span></a></li>
                        `;
                    }).join('')}
                </ul>
            `;
            document.querySelector('.toggle-lists').appendChild(div);

            this._listOpened = true;

        } else {

            console.log('are we here?');

            document.querySelector('.toggle-lists .list-container').remove();

            this._listOpened = false;

        }
    }

    _displayAddListPopUp(e) {
        
        let name = '';
        let id ='';
        let poster = '';

        if (e.target.classList.contains('fas')) {
            name = e.target.parentElement.getAttribute('data-name');
            id = e.target.parentElement.getAttribute('data-id'); 
            poster = e.target.parentElement.getAttribute('data-poster');           
        } else {
            name = e.target.getAttribute('data-name');
            id = e.target.getAttribute('data-id');
            poster = e.target.getAttribute('data-poster');
        }

        // dinamically create popUp element

        const popUp  = document.querySelector('#add-to-list-popup');

        popUp.innerHTML = ``;
         
        const div = document.createElement('div');
        div.classList.add('container');

        div.innerHTML = `
            <div class="close-container">
                <button class="close-popup">X</button>
            </div>
            <form id="add-to">
                <input type="submit" value="Add">
                <br>
                ${this._filmTracker.lists.map(list => {
                    return `
                        <label>
                            <input type="checkbox" data-it="${list.id}" name="id" value="${list.id}"> ${list.name}
                        </label>                    
                    `;
                }).join('<br>')}
            </form>
            <button id="display-create-list"> + Create List</button>
            <form id="create-list">
                <label for="field1">Name</label>
                <br>
                <input type="text" id="list-name" name="list-name" placeholder="Enter playlist name...">
                <br>
                <input type="submit" value="Create">
            </form>                                              
        `;

        
        popUp.appendChild(div);
        popUp.style.display = 'flex';

        const addToForm = document.querySelector('#add-to');

        addToForm.setAttribute('data-name', name);
        addToForm.setAttribute('data-id', id);
        addToForm.setAttribute('data-poster', poster);

        document.querySelector('.close-popup').addEventListener('click', this._closePopUp.bind(this));
        document.querySelector('#display-create-list').addEventListener('click', this._showCreateList.bind(this));
        document.querySelector('#add-to').addEventListener('submit', this._addFilm.bind(this));
        document.querySelector('#create-list').addEventListener('submit', this._createList.bind(this));
    }

    displayListFilms() {

        const listId = window.location.search;

        const params = new URLSearchParams(listId);

        const param1Value = params.get('id'); 

        const list = this._filmTracker.getList(param1Value);

        document.querySelector('#list-header h1').innerHTML = `${list.name}`.toLocaleUpperCase();

        const listsObject = list.toPlainObject();

        const films = listsObject.films;     

        films.forEach(movie => {
            const div = document.createElement('div');
            div.classList.add('swiper-slide');
            div.innerHTML = `
            <div class="card-item-2">
                <img src="https://image.tmdb.org/t/p/w500${movie.posterPath ? movie.posterPath : '/pD6sL4vntUOXHmuvJPPZAgvyfd9.jpg'}" alt="film-poster">
                <div class="bottom">
                    <h2 class="title">${movie.name}</h2>
                    <p class="rating">rating: 10</p>
                </div>
            </div>    
            `;
            document.querySelector('.swiper-wrapper').appendChild(div);
        });

        const swiper = new Swiper('.swiper', {

            slidesPerView: 1,
            speed: 400,
            spaceBetween: 15,
            // autoplay: {
            //     delay: 4000
            // },
            breakpoints: {
                // when window width is >= 320px
                500: {
                  slidesPerView: 2,
                  spaceBetween: 5
                },
                // when window width is >= 480px
                700: {
                  slidesPerView: 3,
                  spaceBetween: 15
                },
                // when window width is >= 640px
                1200: {
                  slidesPerView: 4,
                  spaceBetween: 20
                }
            },
            // Navigation arrows
            navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            }
          });
    

    }

    async displayPopularMovies(optionalResults = null) {
        
        const {results} = await this._fetcher.getPopularMovies();
        let searchResults = null;
        if (optionalResults) {
            searchResults = optionalResults;
        } else {
            searchResults = results;
        }


        searchResults.forEach(movie => {
            console.log(movie.poster_path);
            const div = document.createElement('div');
            div.classList.add('card-item');
            div.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="film-poster">
                <h2 class="title">${movie.title}</h2>
                <div class="bottom">
                    <p class="rating">rating: ${movie.vote_average}</p>
                    <button data-name="${movie.title}" data-id="${movie.id}" data-poster="${movie.poster_path}" class="display-list-form"><i class="fas fa-plus"></i></button>
                </div>
                `;
                document.querySelector('.film-container').appendChild(div);
        });

        document.querySelector('.toggle-lists .fas').addEventListener('click', this._displayListsPopUp.bind(this));

        const popupButtons =document.querySelectorAll('.display-list-form');

        popupButtons.forEach(button => {
            button.addEventListener('click', this._displayAddListPopUp.bind(this));
        })

    }

    async displayPopularShows(optionalResults = null) {

        const {results} = await this._fetcher.getPopularShows();
        let searchResults = null;
        if (optionalResults) {
            searchResults = optionalResults;
        } else {
            searchResults = results;
        }

        searchResults.forEach(show => {
            console.log(show.poster_path);
            const div = document.createElement('div');
            div.classList.add('card-item');
            div.innerHTML = `
                <img src=${show.poster_path ? `"https://image.tmdb.org/t/p/w500${show.poster_path}"` :`/img/no-image.jpg`} alt="film-poster">
                <h2 class="title">${show.name}</h2>
                <div class="bottom">
                    <p class="rating">rating: ${show.vote_average}</p>
                    <button data-name="${show.name}" data-id="${show.id}" data-poster="${show.poster_path}" class="display-list-form"><i class="fas fa-plus"></i></button>
                </div>
            `;
            document.querySelector('.film-container').appendChild(div);
        });

        document.querySelector('.toggle-lists .fas').addEventListener('click', this._displayListsPopUp.bind(this));

        const popupButtons =document.querySelectorAll('.display-list-form');

        popupButtons.forEach(button => {
            button.addEventListener('click', this._displayAddListPopUp.bind(this));
        }) 
    }

}

class SearchUI extends UI {
    constructor() {
        super();
        this.searching = document.querySelector('#search-form');
        this._hookSearching();
    }

    _hookSearching () {
        if (this.searching) {
            this.searching.addEventListener('submit', this.goToSearchPage.bind(this));
        }
    }

    goToSearchPage(e) {

        e.preventDefault();

        const currentURL = window.location.href;

        const urlParams = new URL(currentURL);

        let type = urlParams.searchParams.get('type');

        if (!type)  {
            type = 'movies';
        }

        const inputString = document.querySelector('#search-form  input');

        if(!inputString.value) return;

        const inputParams = inputString.value.split(' ').join('+');

        inputString.value = '';

        window.location.href =`/search.html?type=${type}&query=${inputParams}`;

    }

    async displaySearch() {

        const currentURL = window.location.href;
        const urlParams = new URL(currentURL);
        const type = urlParams.searchParams.get('type');
        const query = urlParams.searchParams.get('query').split(' ').join('+');
        console.log(query);
        const {results} = type === 'movies' ? await this._fetcher.searchMovies(query) : await this._fetcher.searchShows(query);

        // using display popular movies to search - consider renaming the moethod
        type === 'movies' ? this.displayPopularMovies(results) : this.displayPopularShows(results);        
    
    }

    displayBackNaviation() {

        const currentURL = window.location.href;

        const urlParams = new URL(currentURL);

        let type = urlParams.searchParams.get('type');

        const div = document.createElement('div');
        if (type === 'movies') {
            div.innerHTML = '<a class="isSelected" href="/index.html?type=movies" id="tv">back</a>';
        } else {
            div.innerHTML = '<a class="isSelected" href="/index.html?type=tv" id="tv">back</a>'
        }

        document.querySelector('#selection .container').appendChild(div);
    }

}

// film class
class Film {
    constructor(name, id, posterPath) {
        this.name = name;
        this.id = id;
        this.posterPath = posterPath;
    }

    toPlainObject() {
        return {name: this.name, id: this.id, posterPath: this.posterPath};
    }
}

// list crwd
class List extends IdGerator {
    constructor(name) {
        super();
        this.id = this._generateUniqueId();
        this.name = name;
        this.films = [];
    }

    toPlainObject() {
        const films = this.films.map(film => film.toPlainObject());
        return {id: this.id, name: this.name, films};
    }

    addFilm(film) {
        const exist = this.films.filter(myFilm => myFilm.id === film.id);
        if (exist.length >= 1) return;
        this.films.push(film);
    }

    getShortName() {
        return this.name.length > 9? `${this.name.substring(0, 9)}.. `.toUpperCase() : this.name.toUpperCase(); 
    }
}

// films crwd
class FilmsTracker {
    constructor() {
        this.lists = [];
        this._getLocalStorage();
    }

    compareData() {
        const trackerList = this.lists;
        const storageList = JSON.parse(localStorage.getItem('lists'));
        console.log({trackerList, storageList: storageList.lists});
    }

    createList (name) {
        const exist = this.lists.filter(list => list.name === name);
        if (exist.length >= 1) return;
        const newList = new List(name);
        this.lists.push(newList);
        return newList;
    }

    addTolist (name, id, posterPath, listID) {
        const newFilm = new Film(name, id, posterPath);
        const list = this.lists.filter(list => list.id === listID)[0];
        list.addFilm(newFilm);
        this._setLocalStorage();
    }

    getList (listID) {
        const list = this.lists.filter(list => list.id === listID)[0];
        return list; 
    }

    _setLocalStorage() {
        const lists = this.lists.map(list => list.toPlainObject());
        const listsObject = {lists: lists};
        const jsonString = JSON.stringify(listsObject);
        localStorage.setItem("lists", jsonString);
    }

    _getLocalStorage() {

        const jsonString = localStorage.getItem('lists');
    
        if (jsonString) {

            this.lists = [];

            const listsObject = JSON.parse(jsonString);

            listsObject.lists.forEach(list => {
                //create new list
                const newList = new List(list.name);
                //change the default id 
                newList.id = list.id;

                list.films.forEach(film => {
                    const newFilm = new Film(film.name, film.id, film.posterPath);
                    newList.addFilm(newFilm);
                });

                this.lists.push(newList);
            });
            
        } else {
            console.log('nothing in yet');
        }
    }

}

class Fetcher {

    constructor() {
        
        this._key = '3bf00ace9a6286886a6fd8b94eb32f49';

        this._urls = {
            popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${this._key}`,
            popularTV: `https://api.themoviedb.org/3/tv/popular?api_key=${this._key}`,
            movies: `https://api.themoviedb.org/3/search/movie?query={keywords}&include_adult=false&api_key=${this._key}`,
            shows: `https://api.themoviedb.org/3/search/tv?query={keywords}&include_adult=false&api_key=${this._key}`
        }

    }

    async getPopularMovies() {
        const movies = await this._fetcher(this._urls.popularMovies);
        return movies;
    }

    async getPopularShows() {
        const shows = await this._fetcher(this._urls.popularTV);
        return shows;
    }

    async searchMovies(query) {
        const myURl = this._setUrl('searchMovies', query);
        const movies = await this._fetcher(myURl);
        return movies;

    }
    async searchShows(query) {
        const myURl = this._setUrl('searchShows', query);
        const shows = await this._fetcher(myURl);
        return shows;
    }

    async _fetcher(url) {
        // Basic GET request
        try {
            
            const response = await fetch(url);
            const data = await response.json();
            return data;

        } catch (err) {
            console.log(err);
        }

    }

    _setUrl(type, keywords = '') {

        const formatedKeywords = keywords.split(' ').join(',');

        if (type === 'searchMovies') {
            return this._urls.movies.replace('{keywords}', formatedKeywords);
        };
        if (type === 'searchShows') {
            return this._urls.shows.replace('{keywords}', formatedKeywords);
        };
    }    
}

(async function() {
    const app = new App();
})();


