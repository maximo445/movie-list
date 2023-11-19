class App {

    constructor(){
        this.ui = new UI();
        
        // check for load and page changes
        window.addEventListener('hashchange', this._route.bind(this));
        window.addEventListener('load', this._route.bind(this));

        //display add form
    }
    
    _route() {
        
        const pathName = window.location.pathname;
        
        switch (pathName) {
            case '/index.html':
                this.ui.displayPopularMovies();          
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
    }

    _addFilm(e) {

        e.preventDefault();

        let name = '';
        let id ='';

        if (e.target.classList.contains('fas')) {
            name = e.target.parentElement.getAttribute('data-name');
            id = e.target.parentElement.getAttribute('data-id');            
        } else {
            name = e.target.getAttribute('data-name');
            id = e.target.getAttribute('data-id');
        }

        console.log('from form: ', {name, id});

    }

    _closePopUp() {
        document.querySelector('#add-to-list-popup').style.display = 'none';
    }

    _showCreateList() {
        
        document.querySelector('#create-list').style.display = 'block';
    }

    _displayAddListPopUp(e) {
        
        let name = 'none';
        let id ='123456';

        if (e.target.classList.contains('fas')) {
            name = e.target.parentElement.getAttribute('data-name');
            id = e.target.parentElement.getAttribute('data-id');            
        } else {
            name = e.target.getAttribute('data-name');
            id = e.target.getAttribute('data-id');
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
                            <input type="checkbox" data-it="${list.id}" name="${list.name}" value="${list.name}"> Option 1
                        </label>                    
                    `;
                }).join('<br>')}
            </form>
            <button id="display-create-list"> + Create List</button>
            <form id="create-list">
                <label for="field1">Name</label>
                <br>
                <input type="text" id="field1" name="field1" placeholder="Enter playlist name...">
                <br>
                <input type="submit" value="Create">
            </form>                                              
        `;

        
        popUp.appendChild(div);
        popUp.style.display = 'flex';

        const addToForm = document.querySelector('#add-to');

        addToForm.setAttribute('data-name', name);
        addToForm.setAttribute('data-id', id);

        document.querySelector('.close-popup').addEventListener('click', this._closePopUp.bind(this));
        document.querySelector('#display-create-list').addEventListener('click', this._showCreateList.bind(this));
        document.querySelector('#add-to').addEventListener('submit', this._addFilm.bind(this));
    }

    async displayPopularMovies() {

        const {results} = await this._fetcher.getPopularMovies();

        console.log(results);

        results.forEach(movie => {
            const div = document.createElement('div');
            div.classList.add('card-item');
            div.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="film-poster">
                <h2 class="title">${movie.title}</h2>
                <div class="bottom">
                    <p class="rating">rating: ${movie.vote_average}</p>
                    <button data-name="${movie.title}" data-id="${movie.id}" class="display-list-form"><i class="fas fa-plus"></i></button>
                </div>
            `;
            document.querySelector('#popular-movies .film-container').appendChild(div);
        });

        const popupButtons =document.querySelectorAll('.display-list-form');

        popupButtons.forEach(button => {
            button.addEventListener('click', this._displayAddListPopUp.bind(this));
        })

    }

}

// film class
class Film {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

// list crwd
class List {
    constructor(name) {
        this.id = 'produce new id';
        this.name = name;
        this.films = [];
    }

    addFilm(film) {
        this.films.append(film);
    }

    removeFilm(film) {

    }

    getFilmsNames() {
        // returns string html ul of the films with classes added to it
    }
}

// films crwd
class FilmsTracker {
    constructor() {
        this.lists = []
    }

    createList (name) {
        const newList = new List(name);
        this.lists.append(newList);
    }

    modifyList (action, film) {

    }

    displayListFilms () {

    }

    deleteList (id) {

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

    // const fetcher = new Fetcher();
    // const popularMovies = await fetcher.getPopularMovies();
    // const popularShows = await fetcher.getPopularShows();
    // const searchedMovies = await fetcher.searchMovies('rambo');
    // const searchedShows = await fetcher.searchShows('soccer');

    // console.log({popularMovies, popularShows, searchedMovies, searchedShows});

})();


