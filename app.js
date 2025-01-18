document.addEventListener('DOMContentLoaded', function() {
  // Function to fetch data from the backend
  const fetchData = async (url, options = {}) => {
    try {
      // Ensure default headers are set
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorText = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorText = `HTTP error! status: ${response.status}, message: ${error.error || JSON.stringify(error)}`;
        } catch (jsonError) {
          console.error("Non-JSON error response", jsonError);
        }
        throw new Error(errorText);
      }
      
      try {
        return await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON response", jsonError);
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return { error: error.message };
    }
  };

  // Handle Client registration form submission
  const signupForm = document.querySelector('#signup-modal form');
  if (signupForm) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('mt-3', 'text-center');
    signupForm.appendChild(messageDiv);

    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const formData = new FormData(signupForm);
      const signupData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
      };

      // Validate required fields
      if (!signupData.firstName || !signupData.lastName || !signupData.phone || !signupData.email) {
        messageDiv.textContent = 'All fields are required.';
        return;
      }

      const baseURL = 'http://localhost:3000'; // Ensure this points to your backend server
      const url = `${baseURL}/app/clients/register`;
      
      messageDiv.textContent = 'Registering...';
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(signupData)
        });

        const result = await response.json();
        if (response.ok) {
          messageDiv.textContent = 'Registration successful!';
        } else {
          messageDiv.textContent = `Error: ${result.error}`;
        }
      } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
      }
    });
  }

  // Function to fetch and display movies in the carousel
  const fetchAndDisplayMovies = async () => {
    const baseURL = 'http://localhost:3000'; // Ensure this points to your backend server
    const moviesData = await fetchData(`${baseURL}/app/movies`);
    if (moviesData && !moviesData.error) {
      updateCarousel(moviesData, "carouselExampleCaptions");
      updateMoviesByGenre(moviesData);
      console.log("Movies Data", moviesData);
    } else {
      console.error("Failed to fetch movies data:", moviesData.error);
    }
  };

  // Function to update carousel content
  const updateCarousel = (data, carouselId) => {
    const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);
    const carouselIndicators = document.querySelector(`#${carouselId} .carousel-indicators`);
    if (!carouselInner || !carouselIndicators) return;
    
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    if (!data || data.length === 0) {
      carouselInner.innerHTML = `<div class="carousel-item active"><p>No movies available</p></div>`;
      return;
    }

    data.forEach((item, index) => {
      const isActive = index === 0 ? 'active' : '';
      const imageUrl = `img/${encodeURIComponent(item.title.replace(/\s+/g, '_').toLowerCase())}_wposter.jpg`;
      const carouselItem = `
        <div class="carousel-item ${isActive}">
          <img src="${imageUrl}" class="d-block w-100" alt="Movie poster">
          <div class="carousel-caption d-md-block">
            <h5 class="text-uppercase bg_red d-inline-block p-2 text-white">JCC 36TH EDITION</h5>
            <h1>${item.title}</h1>
            <p>${item.director}, ${item.genre}, ${item.year}</p>
            <ul class="mb-0 mt-3">
              <li class="d-inline-block me-2"><a class="button_1" href="book_tickets.html">BOOK NOW <i class="fa fa-long-arrow-right ms-1"></i></a></li>
              <li class="d-inline-block"><a class="button_2" href="movie_detail.html?id=${item.movie_id}">VIEW DETAILS <i class="fa fa-long-arrow-right ms-1"></i></a></li>
            </ul>
          </div>
        </div>`;
      const indicatorItem = `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${isActive}" aria-label="Slide ${index + 1}"></button>`;
      carouselInner.innerHTML += carouselItem;
      carouselIndicators.innerHTML += indicatorItem;
    });
  };

  // Function to update movies by genre
  const updateMoviesByGenre = (data) => {
    const genreTabs = document.getElementById('genre-tabs');
    const genreContent = document.getElementById('genre-content');
    if (!genreTabs || !genreContent) return;

    const genres = [...new Set(data.map(movie => movie.genre))];
    genreTabs.innerHTML = '';
    genreContent.innerHTML = '';

    genres.forEach((genre, index) => {
      const isActive = index === 0 ? 'active' : '';
      const tabItem = `
        <li class="nav-item">
          <a href="#${genre.replace(/\s+/g, '_').toLowerCase()}" data-bs-toggle="tab" aria-expanded="false" class="nav-link ${isActive}">
            <span class="d-md-block">${genre}</span>
          </a>
        </li>`;
      genreTabs.innerHTML += tabItem;

      const genreMovies = data.filter(movie => movie.genre === genre);
      const genreMoviesHtml = genreMovies.map(movie => {
        const imageUrl = `img/${encodeURIComponent(movie.title.replace(/\s+/g, '_').toLowerCase())}_lposter.jpg`;
        return `
          <div class="col-md-3 d-flex align-items-stretch">
            <div class="card mb-4">
              <img src="${imageUrl}" class="card-img-top" alt="${movie.title}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${movie.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${movie.genre}</h6>
                <p class="card-text">${movie.director}, ${movie.year}</p>
                <div class="mt-auto">
                  <span class="col_red">
                    ${'<i class="fa fa-star"></i>'.repeat(movie.rating)}
                    ${'<i class="fa fa-star-o"></i>'.repeat(5 - movie.rating)}
                  </span>
                  <div class="mt-3">
                    <a href="book_tickets.html?id=${movie.movie_id}" class="btn btn-secondary">Book</a>
                    <a href="movie_detail.html?id=${movie.movie_id}" class="btn btn-danger">View Details</a>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }).join('');

      const tabContentItem = `
        <div class="tab-pane ${isActive}" id="${genre.replace(/\s+/g, '_').toLowerCase()}">
          <div class="row">
            ${genreMoviesHtml}
          </div>
        </div>`;
      genreContent.innerHTML += tabContentItem;
    });
  };

  // Function to fetch and display snacks in the "Taste Tunisian Culture" section
  const fetchAndDisplaySnacks = async () => {
    const baseURL = 'http://localhost:3000'; // Ensure this points to your backend server
    const snacksData = await fetchData(`${baseURL}/app/snacks`);
    if (snacksData && !snacksData.error) {
      updateSnacksByType(snacksData);
      console.log("Snacks Data", snacksData);
    } else {
      console.error("Failed to fetch snacks data:", snacksData.error);
    }
  };

  // Function to update snacks by type
  const updateSnacksByType = (data) => {
    const snackTypeTabs = document.getElementById('snack-type-tabs');
    const snackTypeContent = document.getElementById('snack-type-content');
    if (!snackTypeTabs || !snackTypeContent) return;

    const filteredSnacks = data.filter(snack => snack.name.includes('(TN)'));
    const snackTypes = [...new Set(filteredSnacks.map(snack => snack.snack_type))];
    snackTypeTabs.innerHTML = '';
    snackTypeContent.innerHTML = '';

    snackTypes.forEach((type, index) => {
      const isActive = index === 0 ? 'active' : '';
      const tabItem = `
        <li class="nav-item">
          <a href="#${type.replace(/\s+/g, '_').toLowerCase()}" data-bs-toggle="tab" aria-expanded="false" class="nav-link ${isActive}">
            <span class="d-md-block">${type}</span>
          </a>
        </li>`;
      snackTypeTabs.innerHTML += tabItem;

      const typeSnacks = filteredSnacks.filter(snack => snack.snack_type === type);
      const typeSnacksHtml = typeSnacks.map(snack => {
        const imageUrl = `img/${encodeURIComponent(snack.name.replace(/\s+/g, '_').toLowerCase())}.jpg`;
        return `
          <div class="col-md-3 d-flex align-items-stretch">
            <div class="card mb-4">
              <img src="${imageUrl}" class="card-img-top" alt="${snack.name}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${snack.name}</h5>
                <p class="card-text">${snack.description}</p>
                <div class="mt-auto">
                  <a href="#" class="btn btn-danger">Preorder Now</a>
                </div>
              </div>
            </div>
          </div>`;
      }).join('');

      const tabContentItem = `
        <div class="tab-pane ${isActive}" id="${type.replace(/\s+/g, '_').toLowerCase()}">
          <div class="row">
            ${typeSnacksHtml}
          </div>
        </div>`;
      snackTypeContent.innerHTML += tabContentItem;
    });
  };

  // Function to fetch and display footer data
  const fetchAndDisplayFooterData = async () => {
    const baseURL = 'http://localhost:3000'; // Ensure this points to your backend server
    const moviesData = await fetchData(`${baseURL}/app/movies`);
    const snacksData = await fetchData(`${baseURL}/app/snacks`);
    const transportData = await fetchData(`${baseURL}/app/transport`);

    if (moviesData && !moviesData.error) {
      updateFooterGenres(moviesData);
    } else {
      console.error("Failed to fetch movies data:", moviesData.error);
    }

    if (snacksData && !snacksData.error) {
      updateFooterSnacks(snacksData);
    } else {
      console.error("Failed to fetch snacks data:", snacksData.error);
    }

    if (transportData && !transportData.error) {
      updateFooterTransport(transportData);
    } else {
      console.error("Failed to fetch transport data:", transportData.error);
    }
  };

  // Function to update footer genres
  const updateFooterGenres = (data) => {
    const genreContainer = document.querySelector('.footer_1i_small');
    if (!genreContainer) return;

    const genres = [...new Set(data.map(movie => movie.genre))];
    genreContainer.innerHTML = genres.map(genre => `
      <h6 class="col-md-12 col-6"><i class="fa fa-circle me-1 col_red font_10"></i> <a class="text-muted" href="#">${genre}</a></h6>
    `).join('');
  };

  // Function to update footer snacks
  const updateFooterSnacks = (data) => {
    const snackContainer = document.querySelector('.footer_1i ul');
    if (!snackContainer) return;

    const snackTypes = [...new Set(data.map(snack => snack.snack_type))];
    snackContainer.innerHTML = snackTypes.map(type => `
      <li class="d-inline-block"><a class="d-block" href="#">${type}</a></li>
    `).join('');
  };

  // Function to update footer transport
  const updateFooterTransport = (data) => {
    const transportContainer = document.querySelector('.footer_1i_small');
    if (!transportContainer) return;

    const transportTypes = [...new Set(data.map(transport => transport.transport_type))];
    transportContainer.innerHTML = transportTypes.map(type => `
      <h6 class="col-md-12 col-6"><i class="fa fa-circle me-1 col_red font_10"></i> <a class="text-muted" href="#">${type}</a></h6>
    `).join('');
  };

  // Initialize movies on page load
  fetchAndDisplayMovies();

  // Initialize snacks on page load
  fetchAndDisplaySnacks();

  // Initialize footer data on page load
  fetchAndDisplayFooterData();
});

