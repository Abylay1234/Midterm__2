const apiKey = 'cdc3abb3b1fc0d31ecbd441c07cd709f';

// Элементы DOM
const searchInput = document.getElementById('searchInput');
const moviesGrid = document.getElementById('moviesGrid');
const movieModal = document.getElementById('movieModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const watchlistModal = document.getElementById('watchlistModal');
const watchlistGrid = document.getElementById('watchlistGrid');
const watchlistButton = document.getElementById('watchlistButton');
const closeWatchlist = document.getElementById('closeWatchlist');
const sortBy = document.getElementById('sortBy');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (query.length > 2) {
    const movies = await fetchMovies(query);
    displayMovies(movies); // Обновление фильмов на странице
  } else {
    displayMovies([]); // Если строка пуста или слишком короткая
  }
});

// Fetch Movies
const fetchMovies = async (query = '', sort = 'popularity.desc') => {
  const url = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`
    : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${sort}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data); // Добавим вывод данных в консоль
    return data.results;
  } catch (error) {
    console.error('Ошибка загрузки фильмов:', error);
    return [];
  }
};
// Функция добавления фильма в список wishlist
const addToWatchlist = (movie) => {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []; // Получаем текущий список из localStorage, если он есть
    watchlist.push(movie); // Добавляем новый фильм в список
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Сохраняем обновленный список обратно в localStorage
  };
  



// Display Movies
const displayMovies = (movies) => {
    moviesGrid.innerHTML = ''; // Очищаем сетку перед добавлением новых карточек
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.classList.add('movie-card');
      card.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${movie.poster_path}')`; // Устанавливаем фоновое изображение
      card.innerHTML = `
            <button class="watch-button" onclick="showMovieDetails(${movie.id})">Смотреть</button>        
      `;
      moviesGrid.appendChild(card);
    });
  };
  
  

// Load Carousel
const loadMainCarousel = (movies) => {
  const carouselMovies = document.getElementById('carouselMovies');
  carouselMovies.innerHTML = movies.map(movie => `
    <div class="carousel-slide">
      <img src="https://image.tmdb.org/t/p/w780${movie.backdrop_path}" alt="${movie.title}">
      <div class="carousel-text">
        <h2>${movie.title}</h2>
        <p>${movie.overview.length > 100 ? movie.overview.substring(0, 100) + '...' : movie.overview}</p>
        <button class="watch-button" onclick="showMovieDetails(${movie.id})">Смотреть</button>
      </div>
    </div>
  `).join('');
};

const loadInterestingCarousel = (movies) => {
    const carouselInteresting = document.getElementById('carouselInteresting');
    
    carouselInteresting.innerHTML = movies.map(movie => `
      <div class="carousel-slide" style="position: relative; background-image: url('https://image.tmdb.org/t/p/w500${movie.poster_path}');  background-size: cover; width: 180px; height: 200px; display: flex; align-items: flex-end; padding: 10px;">
        <div class="carousel-image" style="background-image: url('https://image.tmdb.org/t/p/w500${movie.poster_path}');" onclick="showMovieDetails(${movie.id})"></div>
        <div class="carousel-overlay">
          <p class="movie-title">${movie.title}</p>
          <p class="movie-info">Rating: ${movie.vote_average}</p>
          <p class="movie-info">Release: ${movie.release_date}</p>
          <button class="add-to-watchlist" onclick="toggleWatchlist(${JSON.stringify(movie)})"></button>
        </div>
      </div>
    `).join('');
  };
  

// Функция для получения жанра по id
const getGenreById = (id) => {
  const genres = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  return genres[id] || 'Unknown';
};

// Fetch and Display Movie Details
// Функция отображения модального окна с подробностями фильма
const showMovieDetails = async (id) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`);
      const movie = await response.json();
  
      modalContent.innerHTML = `
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        <p><strong>Runtime:</strong> ${movie.runtime} mins</p>
        <h3>Cast</h3>
        <ul>${movie.credits.cast.slice(0, 5).map(c => `<li>${c.name}</li>`).join('')}</ul>
      `;
    
  
      movieModal.classList.remove('hidden');
      movieModal.classList.add('active');
    } catch (error) {
      console.error('Ошибка загрузки деталей фильма:', error);
    }
  };

document.addEventListener('DOMContentLoaded', () => {
  fetchMovies().then(movies => {
    console.log(movies);  // Печать загруженных фильмов
    displayMovies(movies); // Показываем фильмы в сетке
    loadMainCarousel(movies.slice(0, 10)); // Заполняем основную карусель
    loadInterestingCarousel(movies.slice(10, 20)); // Заполняем карусель "Самое интересное"
  });
});

// Close Movie Modal
closeModal.addEventListener('click', () => {
  movieModal.classList.add('hidden');
  movieModal.classList.remove('active');
});

// Handle Sorting
sortBy.addEventListener('change', () => {
  fetchMovies('', sortBy.value).then(displayMovies);
});

// Функция для переключения фильма в избранное (wishlist)
const toggleWatchlist = (movie) => {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  
    // Если фильм уже есть в избранном, то удаляем его
    if (watchlist.find(m => m.id === movie.id)) {
      watchlist = watchlist.filter(m => m.id !== movie.id);
    } else {
      watchlist.push(movie); // Добавляем фильм в список избранного
    }
  
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Обновляем localStorage
    renderWatchlist(); // Перерисовываем список избранных
  };
  


// Отображение фильмов в списке избранного
// Функция для рендеринга списка фильмов из Wishlist
const renderWatchlist = () => {
    const watchlistGrid = document.getElementById('watchlistGrid');
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || []; // Читаем список фильмов из localStorage
  
    watchlistGrid.innerHTML = ''; // Очищаем перед перерисовкой
  
    // Если список пуст, отображаем сообщение
    if (watchlist.length === 0) {
      watchlistGrid.innerHTML = '<p>No movies in your wishlist.</p>';
      return;
    }
  
    // Перебираем фильмы и создаем карточки
    watchlist.forEach(movie => {
      const card = document.createElement('div');
      card.classList.add('movie-card');
      card.style.backgroundImage = `url('https://image.tmdb.org/t/p/w500${movie.poster_path}')`; // Убедитесь, что у фильма есть поле poster_path
      card.innerHTML = `
        <div class="movie-title">${movie.title}</div>
        <div class="movie-info">Rating: ${movie.vote_average}</div>
        <div class="movie-info">Release: ${movie.release_date}</div>
        <button class="remove-from-watchlist" onclick="removeFromWatchlist(${movie.id})">Remove</button>
      `;
      watchlistGrid.appendChild(card);
    });
  };
  
  
// Функция удаления фильма из watchlist
const removeFromWatchlist = (movieId) => {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId); // Удаляем фильм по id
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Сохраняем обновленный список
    renderWatchlist(); // Перерисовываем список
  };
  
  

// Open and Close Watchlist Modal
watchlistButton.addEventListener('click', () => {
  watchlistModal.classList.remove('hidden');
  watchlistModal.classList.add('active');
  renderWatchlist();
});

closeWatchlist.addEventListener('click', () => {
  watchlistModal.classList.add('hidden');
  watchlistModal.classList.remove('active');
});
