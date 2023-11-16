class App {
    constructor(){
        this.ui = new UI();
        window.addEventListener('hashchange', this._route.bind(this));
        window.addEventListener('load', this._route.bind(this))
    }

    _route() {
        const pathName = window.location.pathname;
        console.log(pathName);
        switch (pathName) {
            case '/index.html':
                console.log(this);
                break;
        
            default:
                break;
        }
    }
}

class UI {
    displayPopularMovies() {

    }
}

class Delagator {
    // manages adding to list
}

// list crwd
class List {
    constructor() {
        this.id = 'produce new id';
        this.name = '';
        this.films = [];
    }

    addFilm(film) {

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


