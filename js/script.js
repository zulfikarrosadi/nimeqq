const searchButton = document.querySelector('.input-button');
const animeSearchKeywords = document.querySelector('.input-value');
const animeContentWrapper = document.querySelector('.anime-wrapper');
const formSearch = document.querySelector('.form');
const scheduledAnimeWrapper = document.querySelector('.schedule-anime-wrapper');
const dayOptions = document.querySelector('#releaseDayOptionValue');
const feedback = document.querySelector('.feedback');
const API_BASE_URL_V4 = 'https://api.jikan.moe/v4/';

searchButton.addEventListener('click', getAnimeData);
formSearch.addEventListener('submit', getAnimeData);

document.addEventListener(
  'load',
  getScheduledAnimeData(getScheduledAnimeURL()),
);

function getOptionValue() {
  return dayOptions.value.toLowerCase();
}

function getScheduledAnimeURL(selectedDay = '', selected = false) {
  // check if there's no selected day on <select> tag
  if (!selected) {
    const date = new Date();
    let todayName = '';

    if (date.getDay() === 0) {
      todayName = 'sunday';
      dayOptions.options[0].setAttribute('selected', 'selected');
    } else if (date.getDay() === 1) {
      todayName = 'monday';
      dayOptions.options[1].setAttribute('selected', 'selected');
    } else if (date.getDay() === 2) {
      todayName = 'tuesday';
      dayOptions.options[2].setAttribute('selected', 'selected');
    } else if (date.getDay() === 3) {
      todayName = 'wednesday';
      dayOptions.options[3].setAttribute('selected', 'selected');
    } else if (date.getDay() === 4) {
      todayName = 'thursday';
      dayOptions.options[4].setAttribute('selected', 'selected');
    } else if (date.getDay() === 5) {
      todayName = 'friday';
      dayOptions.options[5].setAttribute('selected', 'selected');
    } else if (date.getDay() === 6) {
      todayName = 'saturday';
      dayOptions.options[6].setAttribute('selected', 'selected');
    }
    return {
      url: `${API_BASE_URL_V4}schedules?filter=${todayName}`,
      day: todayName,
    };
  }
  // return this data if theres selected day based on selected day on <select> tag
  return {
    url: `${API_BASE_URL_V4}schedules?filter=${selectedDay}`,
    day: selectedDay,
  };
}

// get schedule release anime data
async function getScheduledAnimeData(resource) {
  animeContentWrapper.innerHTML = '';
  animeSearchKeywords.value = '';

  const data = await fetchData(resource.url, 'data');
  showAnimeDataToCards(data, scheduledAnimeWrapper);
}

async function getAnimeData(event) {
  event.preventDefault();
  scheduledAnimeWrapper.innerHTML = '';

  let URL = `${API_BASE_URL_V4}anime?q=${animeSearchKeywords.value}&limit=15`;
  const animeData = await fetchData(URL, 'data');

  showAnimeDataToCards(animeData, animeContentWrapper);
}

function fetchData(URL, key) {
  feedback.textContent = 'Loading';

  return fetch(URL)
    .then((response) => response.json())
    .then((response) => response[key])
    .catch((errorMessage) => console.log(`gagal ${errorMessage}`))
    .finally(() => (feedback.textContent = ''));
}

function showAnimeDataToCards(animeData, wrapper = animeContentWrapper) {
  let animeCards = ``;

  // create html string for every cards
  animeData.forEach((anime) => (animeCards += createAnimeCards(anime)));

  wrapper.innerHTML = animeCards;

  const detailButtons = document.querySelectorAll('.button-modal');
  showAnimeDetails(animeData, detailButtons);
}

function createAnimeCards(anime) {
  return `
		<div class="col-md-4 my-5">
			<div class="card">
				<img src="${anime.images.webp.image_url}" class="card-img-top">
				<div class="card-body">
					<h5 class="card-title">${anime.title}</h5>
					<h6 class="card-subtitle mb-2 text-muted">${anime.score || 'Not rated yet'}</h6>
					<button type="button" class="btn btn-primary button-modal" data-toggle="modal" data-target="#exampleModal" >Show details</button>
				</div>
			</div>
		</div> `;
}

function showAnimeDetails(animes, detailButtons) {
  // showing diffrent anime details on each "detail button"
  detailButtons.forEach((detailButton) => {
    detailButton.addEventListener('click', (e) => {
      const animeTitle =
        e.target.previousElementSibling.previousElementSibling.textContent;

      // return anime detail from filtering data based on anime title
      const selectedAnimeDetail = animes.filter((anime) => {
        return anime.title == animeTitle;
      });
      console.log(selectedAnimeDetail);
      const animeDetailsListWrapper =
        document.querySelector('.list-anime-detail');
      const imageAnimePictureWrapper = document.querySelector('.img-detail');

      // setting the detail image based on filtered anime
      imageAnimePictureWrapper.setAttribute(
        'src',
        selectedAnimeDetail[0].images.webp.image_url,
      );

      // showing another information of the anime details based on filtered anime
      animeDetailsListWrapper.innerHTML = showAnimeDetail(selectedAnimeDetail);
    });
  });
}

function showAnimeDetail(anime) {
  const score = anime[0].score || 'not rated yet';
  return `
		<li class="list-group-item list-title">Title : ${anime[0].title}</h4></li>
		<li class="list-group-item list-airing">Airing : ${
      anime[0].airing ? 'Yes' : 'No'
    }</li>
		<li class="list-group-item list-episode">Episode : ${
      anime[0].episodes || '-'
    }</li>
		<li class="list-group-item list-start-date">Air Date : ${
      anime[0].aired.string
    }</li>
		<li class="list-group-item list-score">Score : ${score}</li>
		<li class="list-group-item list-synopsis">Synopsis : ${
      anime[0].synopsis
    }</li> `;
}
