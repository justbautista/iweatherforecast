const key = "4904d08ec2becaba2697b57fcbdb2fa8";
var units = 'imperial';
var degrees = 'F';
var searchedCity;

window.addEventListener('load', () => {
    createDailys();
    createHourlys();

    const fUnit = document.querySelector('.f');
    fUnit.classList.add('chosenUnit');

    let long, lat;
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            long = position.coords.longitude;
            lat = position.coords.latitude;
            getWeather(`lat=${lat}&lon=${long}`);
        });
    }

    const startingCityArray = ["Amsterdam", "Shanghai", "Moscow", "Toronto", "Melbourne, AU", "Madrid", "Berlin", "Seoul", "Brussels", "Sydney", "Washington D.C.", "Beijing", "Chicago", "Los Angeles", "Singapore", "Hong Kong", "Tokyo", "Paris", "London", "New York"];

    let random = Math.floor(Math.random() * Math.floor(20));
    searchedCity = startingCityArray[random];
    getWeather(`q=${searchedCity}`);
}); 

const searchBox = document.querySelector('.search-box');
searchBox.addEventListener('keypress', (event) => {
    if(event.keyCode == 13) {
        searchedCity = searchBox.value;
        getWeather(`q=${searchedCity}`);
        searchBox.value = '';
    }
});

const unitsF = document.querySelector('.f');
unitsF.addEventListener('click', () => {
    if(units != 'imperial') {
        units = 'imperial';
        getWeather(`q=${searchedCity}`);
        chosenUnit();
    }
});

const unitsC = document.querySelector('.c');
unitsC.addEventListener('click', () => {
    if(units != 'metric') {
        units = 'metric';
        getWeather(`q=${searchedCity}`);
        chosenUnit();
    }
});

function getWeather(loc) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?${loc}&units=${units}&appid=${key}`) 
        .then(response => {
            if(!response.ok) {
                alert("Sorry, it looks like the city your searching for isn't included in our database :(");
            }
            else{
                return response.json();
            }
        })
        .then(results => {
            if(units == 'metric') {
                degrees = 'C';
            }
            else {
                degrees = 'F';
            }

            let location = document.querySelector('.location');
            location.innerHTML = `${results.name}, ${results.sys.country}`;

            let date = document.querySelector('.date');
            date.innerHTML = getCurrentDate();

            let loHi = document.querySelector('.lo-hi');
            let low = Math.round(results.main.temp_min);
            let high = Math.round(results.main.temp_max);
            loHi.innerHTML = `${low}°${degrees} / ${high}°${degrees}`;

            let longitude = results.coord.lon;
            let latitude = results.coord.lat;
            getWeatherInfo(`lat=${latitude}&lon=${longitude}`);
        });
}

function getWeatherInfo(coordinates) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?${coordinates}&units=${units}&appid=${key}`)    
    .then(response => {
        return response.json();
    }) 
    .then(results => {
        let image = document.querySelector('.current-img');
        image.src = `https://openweathermap.org/img/wn/${results.current.weather[0].icon}@2x.png`;

        let temperature = document.querySelector('.temperature');
        let t = Math.round(results.current.temp);
        temperature.innerHTML = `${t}°${degrees}`;
    
        let description = document.querySelector('.description');
        description.innerHTML = descriptionFormatter(results.current.weather[0].description);
        
        for(let i = 0; i < 7; i++) {
            let dDay = document.querySelector(`#daily-box${i} .d-day`);
            let day = unixTimestampConverter(results.daily[i].dt);
            dDay.innerHTML = day[0];

            let dImage = document.querySelector(`#daily-box${i} .d-img`);
            dImage.src = `https://openweathermap.org/img/wn/${results.daily[i].weather[0].icon}@2x.png`;

            let dDescription = document.querySelector(`#daily-box${i} .d-description`);
            dDescription.innerHTML = descriptionFormatter(results.daily[i].weather[0].description);

            let dLoHi = document.querySelector(`#daily-box${i} .d-lo-hi`);
            let dLow = Math.round(results.daily[i].temp.min);
            let dHigh = Math.round(results.daily[i].temp.max);
            dLoHi.innerHTML = `${dLow}°${degrees} / ${dHigh}°${degrees}`;
        }

        var checkerArray = [];

        for(let i = 0; i < 48; i++) {
            let hDate = document.querySelector(`#h-date${i}`);
            let date = unixTimestampConverter(results.hourly[i].dt);
            
            checkerArray.push(date[2]);
            let dateChecker = checkerArray[i-1];

            if(i == 0 || checkerArray[i] != dateChecker) {
                dateChecker = date[0];
                hDate.innerHTML = `${date[0]}, ${date[1]} ${date[2]}`;
                hDate.style.fontSize = '1rem';
                hDate.style.fontWeight = '900';
                hDate.style.paddingTop = '50px';
                hDate.style.paddingBottom = '10px';
            }

            let hTime = document.querySelector(`#hourly-box${i} .hourly-box-left .h-time`);
            hTime.innerHTML = date[3];

            let hTemperature = document.querySelector(`#hourly-box${i} .hourly-box-left .h-temperature`);
            let hTemp = Math.round(results.hourly[i].temp);
            hTemperature.innerHTML = `${hTemp}°${degrees}`;

            let hImage = document.querySelector(`#hourly-box${i} .hourly-box-right .h-img`);
            hImage.src = `https://openweathermap.org/img/wn/${results.hourly[i].weather[0].icon}@2x.png`;

            let hDescription = document.querySelector(`#hourly-box${i} .hourly-box-right .h-description`);
            hDescription.innerHTML = descriptionFormatter(results.hourly[i].weather[0].description);
        }
    }); 
}

function chosenUnit() {
    let fUnit = document.querySelector('.f');
    let cUnit = document.querySelector('.c');

    if(units == 'metric') {
        cUnit.classList.add('chosenUnit');
        fUnit.classList.remove('chosenUnit');
    }
    else {
        fUnit.classList.add('chosenUnit');
        cUnit.classList.remove('chosenUnit');
    }
}

function getCurrentDate() {
    const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let d = new Date();
    let date = `${day[d.getDay()]}, ${month[d.getMonth()]} ${d.getDate()}`

    return date;
}

function descriptionFormatter(description) {
    let descriptionString = description.toString();
    let descriptionArray = descriptionString.split(' ');
    let formattedArray = [];

    descriptionArray.forEach(element => {
        formattedArray.push(element[0].toUpperCase() + element.slice(1));
    });
    
    let final = formattedArray.filter(element => element != 'Intensity');
    let checker = formattedArray.some(element => element == 'Is');
    if(checker == true) {
        final = ['Clear', 'Sky'];
    }

    return final.join(' ');
}

function createDailys() {
    for(let i = 0; i < 7; i++) {
        let dailyBox = document.createElement('div');
        dailyBox.setAttribute('id', `daily-box${i}`);
        dailyBox.classList.add('daily');

        let dDay = document.createElement('div');
        dDay.classList.add('d-day');
        dDay.innerHTML = 'Day';
        dailyBox.appendChild(dDay);

        let dImage = document.createElement('img');
        dImage.classList.add('d-img');
        dailyBox.appendChild(dImage);

        let dDescription = document.createElement('div');
        dDescription.classList.add('d-description');
        dDescription.innerHTML = 'Description';
        dailyBox.appendChild(dDescription);

        let dLoHi = document.createElement('div');
        dLoHi.classList.add('d-lo-hi');
        dLoHi.innerHTML = 'Low / High';
        dailyBox.appendChild(dLoHi);

        let dailyBoxContainer = document.querySelector('.daily-box-container');
        dailyBoxContainer.appendChild(dailyBox);
    }    
}

function createHourlys() {
    for(let i = 0; i < 48; i++) {
        let hourlyBoxContainer = document.querySelector('.hourly-box-container');

        let hourlyDate = document.createElement('div');
        hourlyDate.setAttribute('id', `h-date${i}`);
        hourlyBoxContainer.appendChild(hourlyDate);

        let hourlyBox = document.createElement('div');
        hourlyBox.setAttribute('id', `hourly-box${i}`);
        hourlyBox.classList.add('hourly');

        let hourlyBoxLeft = document.createElement('div');
        hourlyBoxLeft.classList.add('hourly-box-left');
        hourlyBox.appendChild(hourlyBoxLeft);
        
        let hTime = document.createElement('div');
        hTime.classList.add('h-time');
        hTime.innerHTML = 'Time';
        hourlyBoxLeft.appendChild(hTime);

        let hTemperature = document.createElement('div');
        hTemperature.classList.add('h-temperature');
        hTemperature.innerHTML = 'Temperature';
        hourlyBoxLeft.appendChild(hTemperature);

        let hourlyBoxRight = document.createElement('div');
        hourlyBoxRight.classList.add('hourly-box-right');
        hourlyBox.appendChild(hourlyBoxRight);
        
        let hImage = document.createElement('img');
        hImage.classList.add('h-img');
        hourlyBoxRight.appendChild(hImage);

        let hDescription = document.createElement('div');
        hDescription.classList.add('h-description');
        hDescription.innerHTML = 'Description';
        hourlyBoxRight.appendChild(hDescription);

        hourlyBoxContainer.appendChild(hourlyBox);
    }
}

function unixTimestampConverter(unix) {
    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

    let timestamp = new Date(unix * 1000);

    let day = days[timestamp.getDay()];
    let month = months[timestamp.getMonth()];
    let date = timestamp.getDate();
    let time = timestamp.getHours();
   
    let amPm = time >= 12 ? 'PM' : 'AM';
    time = (time % 12) || 12;
    time = `${time} ${amPm}`;

    let timeArray = [day, month, date, time];

    return timeArray;
}



