// script.js

const apiKey = 'b51ea0967d71427995dd1ee11fc96cd1'; // Замените на свой API ключ
const searchInput = document.getElementById('searchInput');
const recipesGrid = document.getElementById('recipesGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const suggestions = document.getElementById('suggestions');
const favoritesDetails = document.getElementById('favoritesDetails');
const favoritesSummary = document.getElementById('favoritesSummary');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Функция для получения рецептов
const fetchRecipes = async (query) => {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.results);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
};

// Функция для отображения рецептов
const displayRecipes = (recipes) => {
  recipesGrid.innerHTML = '';
  recipes.forEach(recipe => {
    const isFavorite = favorites.some(fav => fav.id === recipe.id);
    const heartColor = isFavorite ? 'black' : 'gray';

    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <div class="favorite-icon" onclick="handleHeartClick(event, ${recipe.id}, '${recipe.title}', '${recipe.image}')">
        <i class="fas fa-heart" style="color: ${heartColor};"></i>
      </div>
    `;
    card.addEventListener('click', () => fetchRecipeDetails(recipe.id));
    recipesGrid.appendChild(card);
  });
};

// Функция для получения детальной информации о рецепте
const fetchRecipeDetails = async (id) => {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
    const data = await response.json();
    showRecipeDetails(data);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
  }
};

// Функция для отображения деталей рецепта
const showRecipeDetails = (recipe) => {
  modalContent.innerHTML = `
    <h2>${recipe.title}</h2>
    <p><strong>Ingredients:</strong></p>
    <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
    <p><strong>Instructions:</strong> ${recipe.instructions}</p>
    <p><strong>Nutrition:</strong> ${recipe.nutrition ? recipe.nutrition.nutrients.map(n => `${n.name}: ${n.amount}${n.unit}`).join(', ') : 'No nutrition data available'}</p>
  `;
  modal.style.display = 'block';
};

// Закрытие модального окна
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Дебаунсинг для запроса подсказок
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

// Функция для получения подсказок
const fetchSuggestions = async (query) => {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=5&apiKey=${apiKey}`);
    const data = await response.json();
    displaySuggestions(data);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
};

// Отображение подсказок
const displaySuggestions = (suggestionsData) => {
  suggestions.innerHTML = '';
  if (suggestionsData.length === 0) return;
  
  suggestions.style.display = 'block';
  suggestionsData.forEach(suggestion => {
    const div = document.createElement('div');
    div.textContent = suggestion.title;
    div.addEventListener('click', () => {
      searchInput.value = suggestion.title;
      fetchRecipes(suggestion.title);
      suggestions.style.display = 'none';
    });
    suggestions.appendChild(div);
  });
};

// Обработчик изменения в поле поиска
searchInput.addEventListener('input', debounce((event) => {
  const query = event.target.value;
  if (query) {
    fetchSuggestions(query);
  } else {
    suggestions.style.display = 'none';
  }
}, 300));

// Функция для добавления в избранное
const handleHeartClick = (event, id, title, image) => {
  event.stopPropagation();
  const isFavorite = favorites.some(fav => fav.id === id);
  if (isFavorite) {
    favorites = favorites.filter(fav => fav.id !== id);
  } else {
    favorites.push({ id, title, image });
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavorites();
};

// Функция для отображения избранных рецептов
const renderFavorites = () => {
  favoritesGrid.innerHTML = '';
  if (favorites.length === 0) {
    favoritesGrid.innerHTML = '<p>No favorites yet.</p>';
    return;
  }

  favorites.forEach(fav => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${fav.image}" alt="${fav.title}">
      <h3>${fav.title}</h3>
      <div class="favorite-icon" onclick="handleHeartClick(event, ${fav.id}, '${fav.title}', '${fav.image}')">
        <i class="fas fa-heart" style="color: black;"></i>
      </div>
    `;
    favoritesGrid.appendChild(card);
  });
};

// Рендер избранных рецептов при открытии details
favoritesDetails.addEventListener('toggle', renderFavorites);

// Инициализация рендера избранных рецептов
renderFavorites();
