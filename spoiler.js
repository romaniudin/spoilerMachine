const readlineSync = require('readline-sync');
const request = require('request');
const cheerio = require('cheerio')

/*
- @function     timer()
- @description  takes any input (text, positive or negative number) from the user and use it as a Delay in spoiling the plot
- @return       {number} - which will be later converted to milliseconds for setTimeout fn. 
*/

function timer() {
    let sec = Math.abs(process.argv[process.argv.length - 1]) //converts negative to positive & confirm that time is always on the last index
    if (isNaN(sec)) { //asks user to input correct time in case it's missed or it is Not a Number
        sec = Math.abs((readlineSync.question('Set a time in seconds after the spoiler starts: ')))
    }
    return sec
}

/*
- @function     titleCheck()
- @description  in case 1) a title consists of 2 and more words (ex.'My Big Fat Greek Wedding') with no quotes, asks the user to check the                     title and insert it again WITHIN the quotes 2) if the title is missed while process.argv input
- @return       {string} - which will be later used in requests for data in Google & TMDb. 
*/

function titleCheck() {
    let movieName = process.argv[2] //consider that title is always on 3rd place while process.argv
    if (process.argv.length > 4) { //check if the movie title includes 2 or more words and ask user to put the title in quotes  
        console.log('Sorry. You made a mistake with the movie title.')
        movieName = readlineSync.question("Please enter it again into quotes: ")
    } else if (!movieName) { //check if the movie title is missed or not
        movieName = readlineSync.question("Please enter a film title: ")
    }
    return movieName
}

/*
- @function     mainRequests()
- @description  initialize requests to movie database and Google search base and show final spoiler of the movie
*/

function mainRequests() {
    request(databaseUrl, function (error, response, jsonbody) {
        if (error) {
            console.log('Something went wrong with connection: ' + error);
            return
        }
        let obj = JSON.parse(jsonbody); // convert JSON string to JSON Object

        if (obj.total_results !== 0) {
            let spoiler = obj.results[0].overview; //achieve Overview part ot JSON Object
            const delayMilSec = delaySec * 1000; // convert seconds to milliseconds
            console.log(`**** SPOILER WARNING **** We are about to spoil the movie ${filmName} in ${delaySec} seconds.`)

            let googleUrl = `https://www.google.ca/search?q=${filmName}`

            request(googleUrl, function (error, response, body) {
                if (error) {
                    console.log('Couldn’t get page because of Network error: ' + error);
                    return
                }
                let $ = cheerio.load(body); // load the body of the page into Cheerio

                let headers = [];
                $('.r').each(function (i, elem) {
                    headers[i] = $(elem).text()
                });
                console.log(headers)
                setTimeout(function () {
                    console.log(spoiler);
                }, delayMilSec);
            });
        } else console.log("This title does not exist. Check spelling and send your request again.")
    });
}

let filmName = titleCheck()
let delaySec = timer()
let databaseUrl = `https://api.themoviedb.org/3/search/movie?api_key=97317362154c4a4b71100c9fedd957af&language=en-US&query=${filmName}&page=1&include_adult=false`

mainRequests()
