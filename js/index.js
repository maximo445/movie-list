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
            case '/list.html':
                this.ui.displayListFilms();
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

        const checkedLists = e.target.querySelectorAll('input[type="checkbox"]:checked');

        checkedLists.forEach(selection => {
            this._filmTracker.addTolist(name, id, selection.value);
        })

        if (this._listOpened) {
            this._render('updateListsPU');
        }

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

        const listName = document.querySelector('#list-name').value;

        const newList = this._filmTracker.createList(listName);

        this._filmTracker.addTolist(name, id, newList.id);

        if (this._listOpened) {
            this._render('updateListsPU');
        }

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
                        <li><a id="list-name-films" href="list.html?id=${list.id}"><span>${list.name}:</span> <span>${list.films.length} Films</span></a></li>
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

        document.querySelector('.close-popup').addEventListener('click', this._closePopUp.bind(this));
        document.querySelector('#display-create-list').addEventListener('click', this._showCreateList.bind(this));
        document.querySelector('#add-to').addEventListener('submit', this._addFilm.bind(this));
        document.querySelector('#create-list').addEventListener('submit', this._createList.bind(this));
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

        document.querySelector('.toggle-lists .fas').addEventListener('click', this._displayListsPopUp.bind(this));

        const popupButtons =document.querySelectorAll('.display-list-form');

        popupButtons.forEach(button => {
            button.addEventListener('click', this._displayAddListPopUp.bind(this));
        })

    }

    displayListFilms() {

        const listId = window.location.search;

        const params = new URLSearchParams(listId);

        const param1Value = params.get('id'); 

        const list = this._filmTracker.getList(param1Value);

        console.log(this._filmTracker.lists);

        console.log(list);

        // results.forEach(movie => {
        //     const div = document.createElement('div');
        //     div.classList.add('card-item');
        //     div.innerHTML = `
        //         <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="film-poster">
        //         <h2 class="title">${movie.title}</h2>
        //         <div class="bottom">
        //             <p class="rating">rating: ${movie.vote_average}</p>
        //             <button data-name="${movie.title}" data-id="${movie.id}" class="display-list-form"><i class="fas fa-plus"></i></button>
        //         </div>
        //     `;
        //     document.querySelector('#popular-movies .film-container').appendChild(div);
        // });

        // const popupButtons =document.querySelectorAll('.display-list-form');

        // popupButtons.forEach(button => {
        //     button.addEventListener('click', this._displayAddListPopUp.bind(this));
        // })

        const swiper = new Swiper('.swiper', {
            // Optional parameters
            direction: 'vertical',
            loop: true,
          
            // If we need pagination
            pagination: {
              el: '.swiper-pagination',
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
          
            // And if we need scrollbar
            scrollbar: {
              el: '.swiper-scrollbar',
            },
          });
    

    }

}

// film class
class Film {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }

    toPlainObject() {
        return {name: this.name, id: this.id};
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

    removeFilm(film) {

    }

    getFilmsNames() {
        // returns string html ul of the films with classes added to it
    }
}

// films crwd
class FilmsTracker {
    constructor() {
        this.lists = [];
        this._getLocalStorage();
    }

    createList (name) {
        const exist = this.lists.filter(list => list.name === name);
        if (exist.length >= 1) return;
        const newList = new List(name);
        this.lists.push(newList);
        return newList;
    }

    addTolist (name, id, listID) {
        const newFilm = new Film(name, id);
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

            const listsObject = JSON.parse(jsonString);

            listsObject.lists.forEach(list => {
                //create new list
                const newList = new List(list.name);
                //change the default id 
                newList.id = list.id;

                list.films.forEach(film => {
                    const newFilm = new Film(film.name, film.id);
                    newList.addFilm(newFilm);
                })

                this.lists = [];

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

    app.ui.createTemplateLists();

})();


