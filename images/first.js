// Log a message to confirm the script has started
console.log("Let's start");

let songs;
let currfolder;
// Create a new Audio object to play music
let currentSong = new Audio();

// Get the play button element by its ID
let play = document.getElementById("play");

// Function to convert seconds to mm:ss format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Async function to fetch the list of songs from the given folder
async function getsongs(folder) {
  currfolder = folder;
  let res = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await res.text();
  console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songul.innerHTML = ""; // Clear previous list before adding new songs

  for (const song of songs) {
    songul.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>harry</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
      </li>`;
  }

  // Add click event listeners to each song list item
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      let trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
      console.log(trackName);
      Playmusic(trackName);
    });
  });
}

// Function to play a selected track
const Playmusic = async (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;

  if (!pause) {
    await currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};
async function displayAlbums(){
    let res = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await res.text();
  let div = document.createElement("div");
  let anchors = div.getElementsByTagName("a")
  Array.from(anchors).forEach(e => {
    if(e.href.includes("/songs/")){
      console.log(e.href.split("/").slice(-2)[0])
    }
  });
}


// Main music player logic
async function main() {
  await getsongs("songs/ncs");
  console.log(songs);

  Playmusic(songs[0], true);

  displayAlbums()
  // Play/Pause button event
  play.addEventListener("click", () => {
    if (currentSong.src) {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "pause.svg";
      } else {
        currentSong.pause();
        play.src = "play.svg";
      }
    }
  });

  // Update time and seekbar
  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      document.querySelector(".songtime").innerHTML = `
        ${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
  });

  // Seekbar click
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width);
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentSong.currentTime = percent * currentSong.duration;
  });

  // Sidebar open/close
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button
  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index > 0) {
      Playmusic(songs[index - 1]);
    }
  });

  // Next button
  next.addEventListener("click", () => {
    console.log("Next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index !== -1 && (index + 1) < songs.length) {
      Playmusic(songs[index + 1]);
    }
  });

  // Volume range slider
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/100");
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Card click to load songs from specific folder
  Array.from(document.getElementsByClassName("card")).forEach(item => {
    item.addEventListener("click", async () => {
      console.log(item.dataset);
      await getsongs(`songs/${item.dataset.folder}`);
      Playmusic(songs[0], true);
    });
  });
}

// Run the player
main();


