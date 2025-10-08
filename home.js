const API_BASE_URL = 'https://dummyjson.com';
let allRecipes = [];
let displayedRecipes = [];

function checkAuthentication() {
  const firstName = localStorage.getItem('firstName');
  
  if (!firstName) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

if (!checkAuthentication()) {
  throw new Error('User not authenticated');
}

const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const heroSearchInput = document.querySelector('.hero-search .search-input');
const categoryCards = document.querySelectorAll('.category-card');
let recipeCards = document.querySelectorAll('.recipe-card');
let favoriteButtons = document.querySelectorAll('.btn-favorite');
const tags = document.querySelectorAll('.tag');
const cuisineDropdown = document.querySelector('#cuisine-filter');
const servingsDropdown = document.querySelector('#servings-filter');

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthentication()) {
    return;
  }
  
  initializeUserWelcome();
  
  initializeAnimations();
  setupEventListeners();
  loadRecipes();
});

function initializeUserWelcome() {
  const firstName = localStorage.getItem('firstName');
  if (firstName) {
    console.log(`Welcome back, ${firstName}!`);
    
    const userWelcome = document.getElementById('user-welcome');
    if (userWelcome) {
      userWelcome.textContent = `Welcome, ${firstName}!`;
    }
    
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      profileAvatar.textContent = firstName.charAt(0).toUpperCase();
    }
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.textContent = `Welcome back, ${firstName}! Discover Delicious Recipes`;
    }
  }
}

function handleLogout() {
  localStorage.removeItem('firstName');
  localStorage.removeItem('favorites'); 
  
  showNotification('Logged out successfully!', 'success');
  
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

async function loadRecipes() {
  try {
    showNotification('Loading recipes...', 'info');
    
    const response = await fetch(`${API_BASE_URL}/recipes?limit=100`);
    const data = await response.json();
    
    allRecipes = data.recipes;
    displayedRecipes = allRecipes.slice(0, 8);
    
    renderRecipes(displayedRecipes);
    updateCategoryStats();
    
    showNotification('Recipes loaded successfully!', 'success');
    
    setTimeout(() => {
      recipeCards = document.querySelectorAll('.recipe-card');
      favoriteButtons = document.querySelectorAll('.btn-favorite');
      setupRecipeListeners();
      loadFavorites();
      initializeAnimations();
    }, 100);
    
  } catch (error) {
    console.error('Error loading recipes:', error);
    showNotification('Failed to load recipes. Using fallback data.', 'error');
  }
}

function renderRecipes(recipes) {
  const recipesGrid = document.querySelector('.recipes-grid');
  
  if (!recipesGrid) return;
  
  recipesGrid.innerHTML = '';
  
  recipes.forEach((recipe, index) => {
    const recipeCard = createRecipeCard(recipe, index);
    recipesGrid.appendChild(recipeCard);
  });
}

function createRecipeCard(recipe, index) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.dataset.recipeId = recipe.id;
  
  let badgeHTML = '';
  if (recipe.rating >= 4.8) {
    badgeHTML = '<span class="recipe-badge">Popular</span>';
  } else if (index < 2) {
    badgeHTML = '<span class="recipe-badge badge-new">New</span>';
  } else if (recipe.reviewCount > 50) {
    badgeHTML = '<span class="recipe-badge badge-trending">Trending</span>';
  }
  
  card.innerHTML = `
    <div class="recipe-image">
      <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; height: 100%; object-fit: cover;">
      <button class="btn-favorite">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 17l-6.2-6.2c-1.7-1.7-1.7-4.4 0-6.1 1.7-1.7 4.4-1.7 6.1 0l.1.1.1-.1c1.7-1.7 4.4-1.7 6.1 0 1.7 1.7 1.7 4.4 0 6.1L10 17z" stroke="white" stroke-width="2"/>
        </svg>
      </button>
      ${badgeHTML}
    </div>
    <div class="recipe-content">
      <h3 class="recipe-title">${recipe.name}</h3>
      <p class="recipe-description">${recipe.cuisine} • ${recipe.difficulty}</p>
      <div class="recipe-ingredients">
        <h4 class="ingredients-title">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="vertical-align: middle; margin-right: 4px;">
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 4v6M4 7h6" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Ingredients:
        </h4>
        <ul class="ingredients-list-compact">
          ${recipe.ingredients.slice(0, 3).map(ing => `<li>${ing}</li>`).join('')}
          ${recipe.ingredients.length > 3 ? `<li class="ingredients-more">+${recipe.ingredients.length - 3} more</li>` : ''}
        </ul>
      </div>
      <div class="recipe-meta">
        <span class="meta-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
        </span>
        <span class="meta-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5L8 11l-3.5 2.5 1.5-4.5-3.5-2.5h4.5L8 2z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          ${recipe.rating}
        </span>
        <span class="meta-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          ${recipe.servings} servings
        </span>
      </div>
      <div class="recipe-actions">
        <button type="button" class="btn-view-full">View Full Recipe</button>
      </div>
    </div>
  `;
  
  return card;
}

function updateCategoryStats() {
  const categoryMap = {
    'Breakfast': 0,
    'Lunch': 0,
    'Dinner': 0,
    'Desserts': 0,
    'Vegetarian': 0,
    'Snacks': 0
  };
  
  allRecipes.forEach(recipe => {
    recipe.mealType.forEach(type => {
      if (categoryMap[type] !== undefined) {
        categoryMap[type]++;
      }
    });
    
    if (recipe.tags.some(tag => tag.toLowerCase() === 'dessert')) {
      categoryMap['Desserts']++;
    }
    
    if (recipe.tags.some(tag => tag.toLowerCase() === 'vegetarian')) {
      categoryMap['Vegetarian']++;
    }
    
    if (recipe.mealType.includes('Snack')) {
      categoryMap['Snacks']++;
    }
  });
  
  categoryCards.forEach(card => {
    const categoryName = card.querySelector('.category-name').textContent;
    const countElement = card.querySelector('.category-count');
    
    if (categoryMap[categoryName] !== undefined) {
      countElement.textContent = `${categoryMap[categoryName]} recipes`;
    }
  });
}

function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.recipe-card, .category-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}

function setupEventListeners() {
  // Logout button event listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  searchBtn.addEventListener('click', handleSearch);
  heroSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  categoryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const categoryName = card.querySelector('.category-name').textContent;
      handleCategoryClick(categoryName);
    });
  });

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      const tagText = tag.textContent;
      heroSearchInput.value = tagText;
      handleSearch();
    });
  });

  if (cuisineDropdown) {
    cuisineDropdown.addEventListener('change', (e) => {
      handleCuisineFilter(e.target.value);
    });
  }
  if (servingsDropdown) {
    servingsDropdown.addEventListener('change', (e) => {
      handleServingsFilter(e.target.value);
    });
  }

  document.querySelectorAll('.view-all').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      handleViewAll();
    });
  });

   document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
       
      
       document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      
       link.classList.add('active');
      
      const section = link.dataset.section;
      handleNavigation(section);
    });
  });

   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

   setupMobileMenu();
}

 function handleNavigation(section) {
   document.querySelector('.hero').style.display = 'none';
  document.querySelector('.categories-section').style.display = 'none';
  document.querySelector('.featured-section').style.display = 'none';
  document.querySelector('.favorites-section').style.display = 'none';
  document.querySelector('.all-recipes-section').style.display = 'none';
  
   switch(section) {
    case 'home':
      document.querySelector('.hero').style.display = 'block';
      document.querySelector('.categories-section').style.display = 'block';
      document.querySelector('.featured-section').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
      
    case 'recipes':
      document.querySelector('.all-recipes-section').style.display = 'block';
      loadAllRecipes();
      document.querySelector('#all-recipes').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
      
    case 'categories':
      document.querySelector('.categories-section').style.display = 'block';
      document.querySelector('#categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
      
    case 'favorites':
      document.querySelector('.favorites-section').style.display = 'block';
      displayFavorites();
      document.querySelector('#favorites').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
  }
}

function handleViewAll() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link[data-section="recipes"]').classList.add('active');
  handleNavigation('recipes');
}

function loadAllRecipes() {
  const allRecipesGrid = document.querySelector('.all-recipes-grid');
  const totalRecipesCount = document.querySelector('.total-recipes-count');
  
  if (!allRecipesGrid) return;
  
  if (totalRecipesCount) {
    totalRecipesCount.textContent = `${allRecipes.length} recipes`;
  }
  
  allRecipesGrid.innerHTML = '';
  
  allRecipes.forEach(recipe => {
    const recipeCard = createRecipeCard(recipe);
    allRecipesGrid.appendChild(recipeCard);
  });
  
  setTimeout(() => {
    const newRecipeCards = allRecipesGrid.querySelectorAll('.recipe-card');
    const newFavoriteButtons = allRecipesGrid.querySelectorAll('.btn-favorite');
    
    setupRecipeListenersForGrid(newRecipeCards, newFavoriteButtons);
    updateFavoriteButtons();
    initializeAnimations();
  }, 100);
  
  const allCuisineDropdown = document.querySelector('#all-cuisine-filter');
  const allServingsDropdown = document.querySelector('#all-servings-filter');
  if (allCuisineDropdown) {
    allCuisineDropdown.addEventListener('change', (e) => {
      handleAllRecipesCuisineFilter(e.target.value);
    });
  }
  if (allServingsDropdown) {
    allServingsDropdown.addEventListener('change', (e) => {
      handleAllRecipesServingsFilter(e.target.value);
    });
  }
}

function handleAllRecipesCuisineFilter(cuisineValue) {
  const allRecipesGrid = document.querySelector('.all-recipes-grid');
  const totalRecipesCount = document.querySelector('.total-recipes-count');
  
  if (!allRecipesGrid) return;
  
  let filteredRecipes = [];
  
  if (cuisineValue === 'all') {
    filteredRecipes = allRecipes;
  } else {
    filteredRecipes = allRecipes.filter(recipe => recipe.cuisine === cuisineValue);
  }
  
  if (totalRecipesCount) {
    totalRecipesCount.textContent = `${filteredRecipes.length} recipes`;
  }
  
  allRecipesGrid.innerHTML = '';
  filteredRecipes.forEach(recipe => {
    const recipeCard = createRecipeCard(recipe);
    allRecipesGrid.appendChild(recipeCard);
  });
  
  setTimeout(() => {
    const newRecipeCards = allRecipesGrid.querySelectorAll('.recipe-card');
    const newFavoriteButtons = allRecipesGrid.querySelectorAll('.btn-favorite');
    
    setupRecipeListenersForGrid(newRecipeCards, newFavoriteButtons);
    updateFavoriteButtons();
    initializeAnimations();
  }, 100);
  
  showNotification(`Found ${filteredRecipes.length} ${cuisineValue === 'all' ? '' : cuisineValue} recipes`, 'success');
}

function handleAllRecipesServingsFilter(rangeValue) {
  const allRecipesGrid = document.querySelector('.all-recipes-grid');
  const totalRecipesCount = document.querySelector('.total-recipes-count');
  if (!allRecipesGrid) return;

  let filtered = [];
  if (rangeValue === 'all') {
    filtered = allRecipes;
  } else {
    filtered = allRecipes.filter(r => {
      const s = r.servings;
      if (rangeValue === '1-2') return s >= 1 && s <= 2;
      if (rangeValue === '3-4') return s >= 3 && s <= 4;
      if (rangeValue === '5-6') return s >= 5 && s <= 6;
      if (rangeValue === '7+') return s >= 7;
    });
  }

  if (totalRecipesCount) {
    totalRecipesCount.textContent = `${filtered.length} recipes`;
  }

  allRecipesGrid.innerHTML = '';
  filtered.forEach(recipe => {
    const recipeCard = createRecipeCard(recipe);
    allRecipesGrid.appendChild(recipeCard);
  });

  setTimeout(() => {
    const newRecipeCards = allRecipesGrid.querySelectorAll('.recipe-card');
    const newFavoriteButtons = allRecipesGrid.querySelectorAll('.btn-favorite');
    
    setupRecipeListenersForGrid(newRecipeCards, newFavoriteButtons);
    updateFavoriteButtons();
    initializeAnimations();
  }, 100);

  showNotification(`Found ${filtered.length} recipes for servings ${rangeValue}`, 'success');
}

function setupRecipeListenersForGrid(recipeCards, favoriteButtons) {
  recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-favorite')) {
        const recipeId = card.dataset.recipeId;
        const recipe = allRecipes.find(r => r.id == recipeId);
        if (recipe) {
          handleRecipeClick(recipe);
        }
      }
    });
  });

  favoriteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const recipeCard = button.closest('.recipe-card');
      const recipeId = recipeCard.dataset.recipeId;
      const recipe = allRecipes.find(r => r.id == recipeId);
      if (recipe) {
        handleFavoriteClick(button, recipe);
      }
    });
  });
}

 function displayFavorites() {
  const favorites = getFavorites();
  const favoritesGrid = document.querySelector('.favorites-grid');
  const noFavorites = document.querySelector('.no-favorites');
  const favoritesCount = document.querySelector('.favorites-count');
  
   favoritesCount.textContent = `${favorites.length} recipe${favorites.length !== 1 ? 's' : ''}`;
  
  if (favorites.length === 0) {
    favoritesGrid.innerHTML = '';
    noFavorites.style.display = 'block';
  } else {
    noFavorites.style.display = 'none';
    
     const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));
    
     favoritesGrid.innerHTML = '';
    favoriteRecipes.forEach((recipe, index) => {
      const card = createRecipeCard(recipe, index);
      favoritesGrid.appendChild(card);
    });
    
     setTimeout(() => {
      const favoriteCards = favoritesGrid.querySelectorAll('.recipe-card');
      const favoriteBtns = favoritesGrid.querySelectorAll('.btn-favorite');
      
      favoriteCards.forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-favorite')) return;
          const recipeId = card.dataset.recipeId;
          const recipe = allRecipes.find(r => r.id == recipeId);
          if (recipe) {
            handleRecipeClick(recipe);
          }
        });
      });
      
      favoriteBtns.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const recipeCard = button.closest('.recipe-card');
          const recipeId = recipeCard.dataset.recipeId;
          const recipe = allRecipes.find(r => r.id == recipeId);
          if (recipe) {
            handleFavoriteClick(button, recipe);
             setTimeout(() => displayFavorites(), 300);
          }
        });
      });
      
      loadFavorites();
    }, 100);
  }
}

 function setupRecipeListeners() {
   recipeCards.forEach(card => {
    card.addEventListener('click', (e) => {
       if (e.target.closest('.btn-favorite')) return;
       if (e.target.closest('.btn-view-full')) return; // separate handler below
      const recipeId = card.dataset.recipeId;
      const recipe = allRecipes.find(r => r.id == recipeId);
      if (recipe) {
        handleRecipeClick(recipe);
      }
    });

    const viewBtn = card.querySelector('.btn-view-full');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recipeId = card.dataset.recipeId;
        const recipe = allRecipes.find(r => r.id == recipeId);
        if (recipe) {
          handleRecipeClick(recipe);
        }
      });
    }
  });

   favoriteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const recipeCard = button.closest('.recipe-card');
      const recipeId = recipeCard.dataset.recipeId;
      const recipe = allRecipes.find(r => r.id == recipeId);
      if (recipe) {
        handleFavoriteClick(button, recipe);
      }
    });
  });
}

 function handleSearch() {
  const query = heroSearchInput.value.trim().toLowerCase();
  
  if (query === '') {
    showNotification('Please enter a search query', 'warning');
    displayedRecipes = allRecipes.slice(0, 8);
    renderRecipes(displayedRecipes);
    setupRecipeListeners();
    loadFavorites();
    return;
  }

  console.log('Searching for:', query);
  
   const filteredRecipes = allRecipes.filter(recipe => {
    return recipe.name.toLowerCase().includes(query) ||
           recipe.cuisine.toLowerCase().includes(query) ||
           recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
           recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
  });
  
  displayedRecipes = filteredRecipes;
  renderRecipes(displayedRecipes);
  
   const recipesSection = document.querySelector('.featured-section');
  recipesSection.scrollIntoView({ behavior: 'smooth' });
  
   setTimeout(() => {
    recipeCards = document.querySelectorAll('.recipe-card');
    favoriteButtons = document.querySelectorAll('.btn-favorite');
    setupRecipeListeners();
    loadFavorites();
    initializeAnimations();
  }, 100);
  
  showNotification(`Found ${filteredRecipes.length} recipes for "${query}"`, 'success');
}

 function handleCategoryClick(categoryName) {
  console.log('Category clicked:', categoryName);
  showNotification(`Viewing ${categoryName} recipes`, 'info');
  
   const filteredRecipes = allRecipes.filter(recipe => {
    if (categoryName === 'Desserts') {
      return recipe.tags.some(tag => tag.toLowerCase() === 'dessert') ||
             recipe.mealType.includes('Dessert');
    }
    if (categoryName === 'Vegetarian') {
      return recipe.tags.some(tag => tag.toLowerCase() === 'vegetarian');
    }
    if (categoryName === 'Snacks') {
      return recipe.mealType.includes('Snack');
    }
    return recipe.mealType.includes(categoryName);
  });
  
  displayedRecipes = filteredRecipes;
  renderRecipes(displayedRecipes);
  
   const recipesSection = document.querySelector('.featured-section');
  recipesSection.scrollIntoView({ behavior: 'smooth' });
  
   setTimeout(() => {
    recipeCards = document.querySelectorAll('.recipe-card');
    favoriteButtons = document.querySelectorAll('.btn-favorite');
    setupRecipeListeners();
    loadFavorites();
    initializeAnimations();
  }, 100);
}

function handleCuisineFilter(cuisineValue) {
  console.log('Cuisine filter:', cuisineValue);
  
  let filteredRecipes = [];
  
  if (cuisineValue === 'all') {
    filteredRecipes = allRecipes;
    showNotification('Showing all recipes', 'info');
  } else {
    filteredRecipes = allRecipes.filter(recipe => 
      recipe.cuisine === cuisineValue
    );
    showNotification(`Showing ${cuisineValue} recipes`, 'info');
  }
  
  displayedRecipes = filteredRecipes;
  renderRecipes(displayedRecipes);
  
  const recipesSection = document.querySelector('.featured-section');
  recipesSection.scrollIntoView({ behavior: 'smooth' });
  
  setTimeout(() => {
    recipeCards = document.querySelectorAll('.recipe-card');
    favoriteButtons = document.querySelectorAll('.btn-favorite');
    setupRecipeListeners();
    loadFavorites();
    initializeAnimations();
  }, 100);
  
  showNotification(`Found ${filteredRecipes.length} ${cuisineValue === 'all' ? '' : cuisineValue} recipes`, 'success');
}

function handleServingsFilter(rangeValue) {
  let filtered = [];
  if (rangeValue === 'all') {
    filtered = allRecipes;
  } else {
    filtered = allRecipes.filter(r => {
      const s = r.servings;
      if (rangeValue === '1-2') return s >= 1 && s <= 2;
      if (rangeValue === '3-4') return s >= 3 && s <= 4;
      if (rangeValue === '5-6') return s >= 5 && s <= 6;
      if (rangeValue === '7+') return s >= 7;
    });
  }
  displayedRecipes = filtered;
  renderRecipes(displayedRecipes);
  const recipesSection = document.querySelector('.featured-section');
  recipesSection.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    recipeCards = document.querySelectorAll('.recipe-card');
    favoriteButtons = document.querySelectorAll('.btn-favorite');
    setupRecipeListeners();
    loadFavorites();
    initializeAnimations();
  }, 100);
  showNotification(`Found ${filtered.length} recipes for servings ${rangeValue}`, 'success');
}

   // Modal utilities for Full Recipe (lazy-loaded from card.html)
 let rbModalLoaded = false;
 let rbModal, rbModalTitle, rbModalBody, rbCloseBtn;

 async function ensureRecipeModal() {
  if (rbModalLoaded) return;
  const res = await fetch('card.html');
  const html = await res.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  rbModal = document.getElementById('rbRecipeModal');
  rbModalTitle = document.getElementById('rbModalTitle');
  rbModalBody = document.getElementById('rbModalBody');
  rbCloseBtn = document.getElementById('rbCloseBtn');
  rbCloseBtn.addEventListener('click', closeRecipeModal);
  rbModal.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-rb-close')) closeRecipeModal();
  });
  rbModalLoaded = true;
 }

 function openRecipeModal() {
  rbModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('rb-no-scroll');
 }

 function closeRecipeModal() {
  rbModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('rb-no-scroll');
 }

 //Buat Mas Danar
 async function handleRecipeClick(recipe) {
  await ensureRecipeModal();
  rbModalTitle.textContent = recipe.name;

  const rating = recipe.rating || 4.5;
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < Math.round(rating) ? '★' : '☆';
  }

  let tagsHtml = '';
  const tagsArr = recipe.tags || [];
  for (let i = 0; i < tagsArr.length; i++) {
    tagsHtml += `<span class="rb-tag">${tagsArr[i]}</span>`;
  }

  let ingHtml = '';
  const ings = recipe.ingredients || [];
  for (let i = 0; i < ings.length; i++) {
    ingHtml += `<li>${ings[i]}</li>`;
  }

  let stepHtml = '';
  const steps = recipe.instructions || [];
  for (let i = 0; i < steps.length; i++) {
    stepHtml += `<li>${steps[i]}</li>`;
  }

  rbModalBody.innerHTML = `
    <div class="rb-top">
      <img src="${recipe.image}" alt="${recipe.name}" class="rb-cover" />
      <div>
        <div class="rb-stats">
          <div class="rb-stat"><span>PREP TIME</span><strong>${recipe.prepTimeMinutes} mins</strong></div>
          <div class="rb-stat"><span>COOK TIME</span><strong>${recipe.cookTimeMinutes} mins</strong></div>
          <div class="rb-stat"><span>SERVINGS</span><strong>${recipe.servings}</strong></div>
          <div class="rb-stat"><span>DIFFICULTY</span><strong>${recipe.difficulty}</strong></div>
          <div class="rb-stat"><span>CUISINE</span><strong>${recipe.cuisine}</strong></div>
          <div class="rb-stat"><span>CALORIES</span><strong>${recipe.caloriesPerServing} cal/serving</strong></div>
        </div>
        <div class="rb-rating"><span class="rb-stars">${stars}</span><span> (${rating.toFixed(1)})</span></div>
        <div class="rb-tags">${tagsHtml}</div>
      </div>
    </div>
    <section class="rb-section">
      <h3>Ingredients</h3>
      <ul class="rb-ingredients">${ingHtml}</ul>
    </section>
    <section class="rb-section">
      <h3>Instructions</h3>
      <ol class="rb-instructions">${stepHtml}</ol>
    </section>
  `;
  openRecipeModal();
 }

 function handleFavoriteClick(button, recipe) {
  const heartPath = button.querySelector('svg path');
  
   const isFavorited = heartPath.getAttribute('fill') === '#FF6B6B';
  
  if (isFavorited) {
    heartPath.setAttribute('fill', 'white');
    heartPath.setAttribute('stroke', 'white');
    removeFavorite(recipe.id);
    showNotification(`Removed ${recipe.name} from favorites`, 'info');
  } else {
    heartPath.setAttribute('fill', '#FF6B6B');
    heartPath.setAttribute('stroke', '#FF6B6B');
    addFavorite(recipe.id);
    showNotification(`Added ${recipe.name} to favorites`, 'success');
  }

   button.style.transform = 'scale(1.2)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 200);
}

function setupMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  
  if (window.innerWidth <= 768) {
    console.log('Mobile view detected');
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      navMenu.style.display = 'none';
    } else {
      navMenu.style.display = 'flex';
    }
  });
}

function addFavorite(recipeId) {
  let favorites = getFavorites();
  if (!favorites.includes(recipeId)) {
    favorites.push(recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function removeFavorite(recipeId) {
  let favorites = getFavorites();
  favorites = favorites.filter(fav => fav !== recipeId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getFavorites() {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
}

function loadFavorites() {
  const favorites = getFavorites();
  
  recipeCards.forEach(card => {
    const recipeId = parseInt(card.dataset.recipeId);
    const favoriteBtn = card.querySelector('.btn-favorite');
    if (!favoriteBtn) return;
    
    const heartPath = favoriteBtn.querySelector('svg path');
    
    if (favorites.includes(recipeId)) {
      heartPath.setAttribute('fill', '#FF6B6B');
      heartPath.setAttribute('stroke', '#FF6B6B');
    }
  });
}

function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    zIndex: '10000',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.3s ease',
    maxWidth: '400px'
  });

  const colors = {
    info: '#4A90E2',
    success: '#27AE60',
    warning: '#F5A623',
    error: '#FF6B6B'
  };
  notification.style.backgroundColor = colors[type] || colors.info;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Console welcome message
console.log('%c🍳 Recipe Book Application', 'color: #FF6B6B; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to Recipe Book! Explore delicious recipes from around the world.', 'color: #4A90E2; font-size: 14px;');
console.log('%cFavorites are stored locally and will persist across sessions.', 'color: #27AE60; font-size: 12px;');
