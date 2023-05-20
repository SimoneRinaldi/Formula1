const dark = { "mode": "Dark", "color": "#151515" };
const light = { "mode": "Light", "color": "#fffefe" };
const ferrari = { "mode": "Ferrari", "color": "#ff0606" };

let dark_switch = false
window.onload = function () {
    lastRace()
    nextRace()
    ButtonLeaveF()
}
let darkmode = "light"

function Darkmode() {
    dark_switch = !dark_switch

    if (dark_switch == true) {
        changeBackground(dark)
    } else {

        changeBackground(light)
    }
}


function changeBackground(mode) {
    document.getElementById("DarkmodeType").innerHTML = mode.mode
    document.body.style.backgroundColor = mode.color
    localStorage.setItem('backgroundColor', mode.color);

}

let ButtonOver = false
function ButtonOverF() {
    ButtonOver = true
}
function ButtonLeaveF() {
    ButtonOver = false
}

document.addEventListener("keydown", function (event) {
    if (event.key === "f" || event.key === "F") {
        if (ButtonOver == true) {

            changeBackground(ferrari)
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    let backgroundColor = localStorage.getItem('backgroundColor');
    let darkModeValue

    document.body.style.backgroundColor = backgroundColor


    if (backgroundColor == dark.color) {
        if (dark_switch == false) {
            dark_switch = true
        }
        darkModeValue = true
        changeBackground(dark)
    } else if (backgroundColor == light.color){
        if (dark_switch == true) {
            dark_switch = false
        }
        darkModeValue = false
        changeBackground(light)
    }else{
        if (dark_switch == true) {
            dark_switch = false
        }
        darkModeValue = false
        changeBackground(light)
        changeBackground(ferrari)
    }

    var darkModeButton = document.getElementById('darkmode-button');
    darkModeButton.checked = darkModeValue;
});


const last_URL = "http://ergast.com/api/f1/current/last.json"
const next_URL = "http://ergast.com/api/f1/current/next.json"

async function lastRace() {
    try {
        const response = await fetch(last_URL);
        const data = await response.json();

        const race = data.MRData.RaceTable.Races[0]

        let raceListHTML = ""
        linkWiki = race.url
        raceListHTML += `<div class="card race-card ">
                              <div class="card-body">
                              <h5 class="card-title">Last Round - <a href="${linkWiki}" target="_blank" class="wikiLink">${race.raceName}</a></h5>
                                <p class="card-text">${race.Circuit.circuitName} ( ${race.Circuit.Location.locality} - ${race.Circuit.Location.country})</p>
                                <p class="card-text">${new Date(race.date + 'T' + race.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                <p class="card-text">
                                    
                                </p>
                                <p class="card-text">
                                    <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#resultModal" onclick="showResults()">
                                        See Results
                                    </button>
                                </p>
                                </div>
                                </div`

        document.getElementById("lastRace").innerHTML = raceListHTML
    } catch (error) {
        console.error(error)
    }
}

async function nextRace() {
    try {
        const response = await fetch(next_URL);
        const data = await response.json();

        const race = data.MRData.RaceTable.Races[0]

        let raceListHTML = ""
        linkWiki = race.url
        raceListHTML += `<div class="card race-card race-cardBottom">
                              <div class="card-body">
                              <h5 class="card-title">Next Round - <a href="${linkWiki}" target="_blank" class="wikiLink">${race.raceName}</a></h5>
                                <p class="card-text">${race.Circuit.circuitName} ( ${race.Circuit.Location.locality} - ${race.Circuit.Location.country})</p>
                                <p class="card-text">${new Date(race.date + 'T' + race.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                <p class="card-text">
                                    
                                </p>
                                <div class="row">
                                <div class="col-6">
                                    <p class="card-text">
                                        <button type="button" class="btn schedule btn-secondary" data-bs-toggle="modal" data-bs-target="#scheduleModal" onclick="showSchedule('${encodeURIComponent(JSON.stringify(race))}')">
                                            See Schedule
                                        </button>
                                    </p>
                                </div>
                                <div class="col-6">
                                    <div class="timer">
                                        <p class="card-text">Remaining time:</p>
                                        <p class="card-text" id="countdown"></p>
                                    </div>
                                </div>
                            </div>`;

        startCountdown(race);

        raceListHTML += "</div></div>"
        document.getElementById("nextRace").innerHTML = raceListHTML
    } catch (error) {
        console.error(error)
    }
}

function startCountdown(race) {
    let countDownDate = new Date(race.date + 'T' + race.time).getTime()

    let x = setInterval(function () {

        let now = new Date().getTime();

        let distance = countDownDate - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("countdown").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

        if (distance < 0) {
            clearInterval(x);
            alert(race.raceName + "HAS STARTED!");
            document.getElementById("countdown" + raceCount + "").innerHTML = "race live!"
        }
    }, 1000);
}

async function showResults() {
    let year = new Date().getFullYear()
    let URL = "https://ergast.com/api/f1/current/last/results.json"
    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.RaceTable.Races[0].Results


        let resultList = `<div class="table-container"><table class="table table-striped text-center">
        <thead>
            <tr>
                <th scope="col">Position</th>
                <th scope="col">Points</th>
                <th scope="col">Driver</th>
                <th scope="col">Number</th>
                <th scope="col">Constructor</th>
                <th scope="col">Laps</th>
                <th scope="col">Time</th>
                <th scope="col">Position Gained/Lost</th>
            </tr>
        </thead>
        <tbody>`
        results.forEach((result) => {
            let posSimbol


            if (result.grid != 0) {
                let posGained = result.grid - result.position

                if (posGained < 0) {
                    posSimbol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg> ${-1 * posGained}`
                } else if (posGained == 0) {
                    posSimbol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-dash-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
              </svg>`
                } else {
                    posSimbol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-chevron-up" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
          </svg> ${posGained}`
                }
            } else {
                posSimbol = `Started from Pitlane`
            }

            resultList += `<tr>
                                <td>${result.positionText}</td>
                                <td>${result.points}</td>
                                <td>${result.Driver.givenName} ${result.Driver.familyName}</td>
                                <td>${result.number}</td>
                                <td>${result.Constructor.name}</td>
                                <td>${result.laps}</td>`
            if (result.hasOwnProperty("Time")) {
                resultList += `<td>${result.Time.time}</td>`
            } else {
                resultList += `<td>${result.status}</td>`
            }

            resultList += `<td>${posSimbol}</td>
                            </tr>`
        })
        resultList += `</tbody>
        </table></div>`
        document.getElementById("result").innerHTML = resultList
        showFastestLap(year)

    } catch (error) {
        console.error(error)
    }

}

async function showFastestLap() {
    let URL = "https://ergast.com/api/f1/current/last/fastest/1/results.json"
    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.RaceTable.Races[0].Results[0]
        let resultList = `<table class="table table-striped text-center">
        <thead>
            <tr>
                <th scope="col">Driver</th>
                <th scope="col">Number</th>
                <th scope="col">Constructor</th>
                <th scope="col">Time</th>
                <th scope="col">Lap</th>
                <th scope="col">Avarage Speed (km/h)</th>
            </tr>
        </thead>
        <tbody>
        <tr>
            <td>${results.Driver.givenName} ${results.Driver.familyName}</td>
            <td>${results.number}</td>
            <td>${results.Constructor.name}</td>
            <td>${results.FastestLap.Time.time}</td>
            <td>${results.FastestLap.lap}</td>
            <td>${results.FastestLap.AverageSpeed.speed}</td>
            <td>
        </tr>
                            </tbody>
        </table>`
        document.getElementById("fastestLapLabel").innerHTML = "Fastest Lap:"
        document.getElementById("fastestLap").innerHTML = resultList

    } catch (error) {
        console.error(error)
    }
}

function showSchedule(race) {
    race = JSON.parse(decodeURIComponent(race))

    let events = []

    if (race.hasOwnProperty('FirstPractice')) {
        events.push({
            type: 'First Practice',
            date: race.FirstPractice.date,
            time: race.FirstPractice.time
        })
    }
    if (race.hasOwnProperty('SecondPractice')) {
        events.push({
            type: 'Second Practice',
            date: race.SecondPractice.date,
            time: race.SecondPractice.time
        })
    }
    if (race.hasOwnProperty('ThirdPractice')) {
        events.push({
            type: 'Third Practice',
            date: race.ThirdPractice.date,
            time: race.ThirdPractice.time
        })
    }

    if (race.hasOwnProperty('Sprint')) {
        events.push({
            type: 'Sprint',
            date: race.Sprint.date,
            time: race.Sprint.time
        })
    }
    if (race.hasOwnProperty('SprintQualyfing')) {
        // NON IMPLEMENTATO NELLE API
        events.push({
            type: 'Sprint Qualyfing',
            date: race.SprintQualyfing.date,
            time: race.SprintQualyfing.time
        })
    }

    if (race.hasOwnProperty('Qualifying')) {
        events.push({
            type: 'Qualifying',
            date: race.Qualifying.date,
            time: race.Qualifying.time
        })
    }

    //race
    events.push({
        type: 'Race',
        date: race.date,
        time: race.time
    })

    events.sort((a, b) => {
        let dateA = new Date(a.date + 'T' + a.time)
        let dateB = new Date(b.date + 'T' + b.time)
        return dateA - dateB
    })

    let scheduleList = `<div class="table-container"><table class="table table-striped text-center">
        <thead>
            <tr>
                <th scope="col">Type:</th>
                <th scope="col">Time:</th>
            </tr>
        </thead>
        <tbody>`

    events.forEach(event => {
        scheduleList += `<tr>
        <th scope="row">${event.type}</th>
        <td>${new Date(event.date + 'T' + event.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td></tr>`
    })

    scheduleList += `</tbody>
        </table></div>`
    document.getElementById("schedule").innerHTML = scheduleList

}


async function championShow() {
    const URL = `http://ergast.com/api/f1/current/driverStandings.json`

    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.StandingsTable.StandingsLists[0].DriverStandings
        const totalRound = data.MRData.StandingsTable.StandingsLists[0].round

        document.getElementById("championModalLabel").innerHTML = `<h4>Total Round: ${totalRound}</h4>`


        let resultList = `<div class="modal-body" style="height: 100%;">
        <table class="table table-striped text-center">
            <thead>
                <tr>
                    <th scope="col">Position</th>
                    <th scope="col">Name</th>
                    <th scope="col">Constructor</th>
                    <th scope="col">Points</th>
                    <th scope="col">Wins</th>
                </tr>
            </thead>
            <tbody>`;

        results.forEach((result) => {

            let constructors = ""
            for (let i = 0; i < result.Constructors.length; i++) {
                constructors += `${result.Constructors[i].name}`
                if (i + 1 != result.Constructors.length) {
                    constructors += ',<br>'
                }
            }

            resultList += `<tr>
                <td>${result.positionText}</td>
                <td>${result.Driver.givenName} ${result.Driver.familyName}</td>
                <td>${constructors}</td>
                <td>${result.points}</td>
                <td>${result.wins}</td>
            </tr>`;
        });

        resultList += `</tbody>
            </table>
        </div>`;

        document.getElementById("championShow").innerHTML = resultList

    } catch (error) {
        console.error(error)
    }
}

async function constructorShow() {
    const URL = `http://ergast.com/api/f1/current/constructorStandings.json`


    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings
        const totalRound = data.MRData.StandingsTable.StandingsLists[0].round

        document.getElementById("constructorModalLabel").innerHTML = `<h4>Total Round: ${totalRound}</h4>`


        let resultList = `<div class="modal-body" style="height: 100%;">
            <table class="table table-striped text-center">
                <thead>
                    <tr>
                        <th scope="col">Position</th>
                        <th scope="col">Constructor</th>
                        <th scope="col">Points</th>
                        <th scope="col">Wins</th>
                    </tr>
                </thead>
                <tbody>`;

        results.forEach((result) => {
            resultList += `<tr>
                <td>${result.positionText}</td>
                <td>${result.Constructor.name}</td>
                <td>${result.points}</td>
                <td>${result.wins}</td>
            </tr>`;
        });

        resultList += `</tbody>
            </table>
        </div>`;

        document.getElementById("constructorShow").innerHTML = resultList

    } catch (error) {
        console.error(error)
    }


}



