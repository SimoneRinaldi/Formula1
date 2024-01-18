window.onload = function () {
    const year = new Date().getFullYear();
    getRaces(year - 1)
    addDropdown()
    addDriverDropdown()
}
  
function removeFixedPosition() {
    if (window.matchMedia('(max-width: 1224px)').matches) {
      document.querySelectorAll('.position-fixed').forEach(function(element) {
        element.classList.remove('position-fixed');
      });
    } else {
      document.querySelectorAll('.card#pos-fixed').forEach(function(element) {
        element.classList.add('position-fixed');
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', removeFixedPosition);
  window.addEventListener('resize', removeFixedPosition);
  


let switchPoints = true;
let selectedYear = 2022

function toggleSwitch() {
    switchPoints = !switchPoints;
    if(switchPoints == true){
        document.getElementById("switchStatus").innerHTML = "Now setted on: Total Points"
    }else{
        document.getElementById("switchStatus").innerHTML = "Now setted on: Race Points"
    }
}

async function getDrivers() {
    const URL = `https://ergast.com/api/f1/${selectedYear}/driverStandings.json`
    let drivers = new Array()

    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.StandingsTable.StandingsLists[0].DriverStandings

        results.forEach((result) => {
            const driverObj = {
                "name": result.Driver.givenName,
                "surname": result.Driver.familyName,
                "id": result.Driver.driverId,
            }
            drivers.push(driverObj)
        });
    } catch (error) {
        console.error(error)
    }
    return drivers
}

async function addDriverDropdown() {
    const drivers = await getDrivers();

    const formGroupEl = document.createElement("div");
    formGroupEl.classList.add("form-group");

    const selectEl = document.createElement("select");
    selectEl.classList.add("form-select");
    selectEl.setAttribute("id", "driverSelect");
    formGroupEl.appendChild(selectEl);

    for (let i = 0; i < drivers.length; i++) {
        const optionEl = document.createElement("option");
        optionEl.setAttribute("value", JSON.stringify({"id": drivers[i].id, "name": drivers[i].name, "surname": drivers[i].surname}));
        optionEl.textContent = drivers[i].name + " " + drivers[i].surname;
        selectEl.appendChild(optionEl);
    }

    containerEl = document.querySelector("#dropdown");
    containerEl.appendChild(formGroupEl);
}

async function getPoints() {
    const driver = JSON.parse(document.getElementById("driverSelect").value)
    const driverId = driver.id

    const URL = `https://ergast.com/api/f1/${selectedYear}/drivers/${driverId}/results.json`

    try {
        const response = await fetch(URL);
        const data = await response.json();

        const results = data.MRData.RaceTable.Races
        
        document.getElementById("chartModalLabel").innerHTML = `${selectedYear} - ${driver.name} ${driver.surname}`

        Allpoints = new Array()

        results.forEach((race) => {
            let points = 0

            if (switchPoints == true) {
                if (Allpoints.length - 1 >= 0) {
                    points = parseInt(Allpoints[Allpoints.length - 1].totalPoints) + parseInt(race.Results[0].points)
                } else {
                    points = parseInt(race.Results[0].points)
                }
            } else {
                points = parseInt(race.Results[0].points)
            }

            let racePoints = {
                "track": race.Circuit.circuitName,
                "points": race.Results[0].points,
                "totalPoints": points,
                "position": race.Results[0].position,
            }
            Allpoints.push(racePoints)
        })


    } catch (error) {
        console.error(error)
    }

    const circuitStyles = Allpoints.map((point) => {
        if (point.position === "1") {
            return { color: "orange", text: "rectRounded" };
        } else {
            return { color: "red", text: "circle" };
        }
    });


    const circuitNames = Allpoints.map((point) => point.track);
    const circuitPoints = Allpoints.map((point) => point.totalPoints);


    const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");

    if (Chart.getChart("myChart")) {
        Chart.getChart("myChart").destroy();
    }

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: circuitNames,
            datasets: [
                {
                    label: "Points",
                    data: circuitPoints,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBorderWidth: 1,
                    pointStyle: circuitStyles.map((style) => style.text),
                    pointBackgroundColor: circuitStyles.map((style) => style.color),
                    pointBorderColor: circuitStyles.map((style) => style.color),

                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        callback: function (value, index, values) {
                            return `R${index + 1}`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = `${context.dataset.label}: `;
                            label += `${Allpoints[context.dataIndex].points} points ( P${Allpoints[context.dataIndex].position} )`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}


function addDropdown() {

    const formGroupEl = document.createElement("div");
    formGroupEl.classList.add("form-group");

    const selectEl = document.createElement("select");
    selectEl.classList.add("form-select");
    selectEl.setAttribute("id", "yearSelect");
    formGroupEl.appendChild(selectEl);

    const startingYear = new Date().getFullYear();
    for (let anno = startingYear - 1; anno >= 1950; anno--) {
        const optionEl = document.createElement("option");
        optionEl.setAttribute("value", anno);
        optionEl.textContent = anno;
        selectEl.appendChild(optionEl);
    }

    selectEl.addEventListener("change", function () {
        document.body.scrollTop = 0; // per Safari
        document.documentElement.scrollTop = 0; // per Chrome, Firefox, IE e Opera

        const selectedValue = this.value;
        selectedYear = selectedValue
        getRaces(parseInt(selectedValue))

        let driver = document.querySelector("#dropdown");
        driver.innerHTML = "";

        addDriverDropdown()
    });

    const containerEl = document.querySelector("#dropdownYear");
    containerEl.appendChild(formGroupEl);
}

async function getRaces(year) {
    let SEASON_RACE = "https://ergast.com/api/f1/" + year + ".json";

    try {
        const response = await fetch(SEASON_RACE);
        const data = await response.json();

        const races = data.MRData.RaceTable.Races

        let raceListHTML = ""
        let raceCount = 1
        races.forEach((race) => {
            linkWiki = race.url
            raceListHTML += `<div class="card race-card ">
                              <div class="card-body">
                              <h5 class="card-title">${raceCount}° Round - <a href="${linkWiki}" target="_blank" class="wikiLink">${race.raceName}</a></h5>
                                <p class="card-text">${race.Circuit.circuitName} ( ${race.Circuit.Location.locality} - ${race.Circuit.Location.country})</p>
                                <p class="card-text">${new Date(race.date).toLocaleDateString()}</p>
                                <p class="card-text">
                                    
                                </p>
                                    <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#resultModal" onclick="showResults(${year},${raceCount})">
                                        See Results
                                    </button>
                                </p>`

            raceListHTML += "</div></div>"
            raceCount++
        });
        document.getElementById("race-list").innerHTML = raceListHTML
    } catch (error) {
        console.error(error)
    }
}



async function showResults(year, raceCount) {
    let URL = "https://ergast.com/api/f1/" + year + "/" + raceCount + "/results.json"
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
            let posGained = result.grid - result.position
            let posSimbol
            if (posGained < 0) {
                posSimbol = `<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg> ${-1 * posGained}`
            } else if (posGained == 0) {
                posSimbol = `<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="bi bi-dash-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
              </svg>`
            } else {
                posSimbol = `<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-chevron-up" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
          </svg> ${posGained}`
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
        showFastestLap(year, raceCount)

    } catch (error) {
        console.error(error)
    }


}



async function showFastestLap(year, raceCount) {
    if (year >= 2004) {
        let URL = "https://ergast.com/api/f1/" + year + "/" + raceCount + "/fastest/1/results.json"
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

    } else {
        document.getElementById("fastestLapLabel").innerHTML = ""
        document.getElementById("fastestLap").innerHTML = ""

    }
}

async function championShow() {
    const year = document.getElementById("yearSelect").value
    const URL = `https://ergast.com/api/f1/${year}/driverStandings.json`

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
    const year = document.getElementById("yearSelect").value
    const URL = `https://ergast.com/api/f1/${year}/constructorStandings.json`

    if (year >= 1958) {
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
    } else {
        document.getElementById("constructorShow").innerHTML = "Constructor Championship wasn't already introducted"
    }


}


document.addEventListener('DOMContentLoaded', function () {
    let backgroundColor = localStorage.getItem('backgroundColor');

    document.body.style.backgroundColor = backgroundColor

});
