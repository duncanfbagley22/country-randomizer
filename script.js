let countries = [];
let visitedCountries = new Set();

// Load both files
Promise.all([
  fetch('countries.json').then(res => res.json()),
  fetch('dishes.json').then(res => res.json())
])
.then(([countriesData, dishesData]) => {
  countries = countriesData;
  
  // Create a set of countries already visited (from dishes.json)
  dishesData.forEach(dish => {
    if (dish.country) {
      visitedCountries.add(dish.country.trim());
    }
  });

})
.catch(err => console.error('Error loading data:', err));

const countryBox = document.getElementById('countryBox');

function getRandomCountry() {
  // Filter out visited countries
  const availableCountries = countries.filter(country => 
    !visitedCountries.has(country.trim())
  );
  
  if (availableCountries.length === 0) {
    countryBox.textContent = "You've visited all countries! 🎉";
    return;
  }
  
  // Add animation class
  countryBox.classList.add('animate');

  // Wait for animation to complete before updating text
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const randomCountry = availableCountries[randomIndex];
    countryBox.textContent = randomCountry;

    // Remove animation class to allow retriggering
    countryBox.classList.remove('animate');
  }, 400); // Match CSS transition time
}

countryBox.addEventListener('click', () => {
  const countryName = countryBox.textContent.trim();
  
  // Only open Google if it's not the default message
  if (countryName && countryName !== "Click to Go!" && countryName !== "You've visited all countries! 🎉") {
    const query = encodeURIComponent(countryName);
    window.open(`https://www.google.com/search?q=${query} food`, '_blank');
  }
  else {
    getRandomCountry();
  }
});