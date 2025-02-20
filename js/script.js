console.log("Lets write java script");
let currentsong = new Audio();
let songs;
let currFolder;
function convertSecondsToTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Ensure two-digit format using padStart
    let formattedTime = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return formattedTime;
}
async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${currFolder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        let s = song.replaceAll("%20", " ").split(".mp3");
        songUl.innerHTML = songUl.innerHTML + `<li> 
                            <img class="invert" src="music.svg" alt="">
                            <div class="songinfo">
                                <div>${s[0]} </div>
                                <div>${s[1]}</div>
                            </div>
                            <img class="invert" src="images/play.svg" alt="">
        </li>`

    }
    // play the fits song
    // let audio = new Audio(songs[0])
    // audio.play();

    // audio.addEventListener("loadeddata",()=>{
    //     let duration = audio.duration;
    //     console.log(duration)

    // });

    //
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    }
    )
}
const playmusic = (track, pause = false) => {

    // let audio = new Audio("/songs/" +track +".mp3")
    currentsong.src = `/${currFolder}/` + track + ".mp3"
    if (!pause) {
        currentsong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinformation").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // get meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"
                                fill="none" style="color: black;">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    fill="#000" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>

                        <img src="songs/${folder}/cover.jpeg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // add event listner to the card play button
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0].split(".mp3")[0])
        })
    })

}

async function main() {

    // get list of all songs
    await getsongs("songs/ncs");
    playmusic(songs[0].split(".mp3")[0], true);
    // display albums  dynamically
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "images/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "images/play.svg";
        }
    })

    // Time updation of the current song 
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToTime(currentsong.currentTime)}/ ${convertSecondsToTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // adding an event listeer to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentsong.currentTime = ((currentsong.duration) * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100
    })
    //add and event listner to the  hambuger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0 + "%";
    })
    //add and event listner to the  closs
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%";
    })

    // add event listner to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1].split(".mp3")[0])
        }
    })

    // add event listner to next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1].split(".mp3")[0])
        }
    })

    // add event listner to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    // add event listner in volume   button
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
            currentsong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
            currentsong.volume = 0.1;
        }
        document.querySelector(".range").getElementsByTagName("input")[0].value = currentsong.volume * 100;
    })


}
main();