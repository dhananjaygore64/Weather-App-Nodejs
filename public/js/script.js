

console.log('This is client side script');

document.querySelector('.search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const searchText = document.querySelector('.search-form input').value;
    const error = document.querySelector('.error-msg');
    const weatherMsg = document.querySelector('.weather-msg');
    const weatherIcon = document.querySelector('.weather-icon');
    const location = document.querySelector('.location p');
    weatherMsg.innerText = 'Loading..........';
    error.innerText = '';
    location.innerText = '';
    weatherIcon.style.display = 'none';
    fetch(`/weather?address=${searchText}`).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                error.innerText = data.error;
                weatherMsg.innerText = '';
            } else {
                weatherMsg.innerText = data.forecast;
                weatherIcon.style.display = 'block';
                weatherIcon.setAttribute('src', data.weatherIcon);
                location.innerText = data.address;
            }
        });
    });
})
