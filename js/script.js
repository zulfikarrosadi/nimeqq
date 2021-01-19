const searchButton = document.querySelector('.input-button')
const inputValue = document.querySelector('.input-value')
const animeContentWrapper = document.querySelector('.anime-wrapper')
const form = document.querySelector('.form')
const scheduleAnimeWrapper = document.querySelector('.schedule-anime-wrapper')
const day = document.querySelector('#releaseDay')
const feedback = document.querySelector('.feedback')

searchButton.addEventListener('click', getAnimeData)
form.addEventListener('submit', getAnimeData)
document.addEventListener('load', getScheduleAnimeData( getAnimeDataScheduleURL() ))


function getOptionValue() {
	return day.value.toLowerCase()
}

function getAnimeDataScheduleURL(selectedDay = '', selected = false) {

	if (!selected) {
		const date = new Date ()
		let todayName = ''
		
		if (date.getDay() === 0) {
			todayName = 'sunday'
			day.options[0].setAttribute('selected', 'selected')
		} else if (date.getDay() === 1) {
			todayName = 'monday'
			day.options[1].setAttribute('selected', 'selected')
		} else if (date.getDay() === 2) {
			todayName = 'tuesday'
			day.options[2].setAttribute('selected', 'selected')
		} else if (date.getDay() === 3) {
			todayName = 'wednesday'
			day.options[3].setAttribute('selected', 'selected')
		} else if (date.getDay() === 4) {
			todayName = 'thursday'
			day.options[4].setAttribute('selected', 'selected')
		} else if (date.getDay() === 5) {
			todayName = 'friday'
			day.options[5].setAttribute('selected', 'selected')
		} else if (date.getDay() === 6) {
			todayName = 'saturday'
			day.options[6].setAttribute('selected', 'selected')
		}
		return {
			url :`https://api.jikan.moe/v3/schedule/${todayName}`, 
			day : todayName 
		}
	}
	return {
		url : `https://api.jikan.moe/v3/schedule/${selectedDay}`,
		day : selectedDay
	}

}

async function getScheduleAnimeData(urls) {
	
	animeContentWrapper.innerHTML = ''
	inputValue.value = ''
	
	const {url, day} = urls
	const data = await fetchData(url, day)
	showAnimeCards(data, scheduleAnimeWrapper)
}

async function getAnimeData(event) {

	event.preventDefault()

	scheduleAnimeWrapper.innerHTML = ''

	let URL = `https://api.jikan.moe/v3/search/anime?q=${inputValue.value}`
	const animeData = await fetchData(URL, 'results')
	showAnimeCards(animeData, animeContentWrapper)
}

function fetchData(URL, key) {


	feedback.textContent = 'Loading'

	return fetch(URL)
	.finally(() => feedback.textContent = '')
	.then(response =>response.json())
	.then(response => response[key], errorMessage => console.log(`gagal ${errorMessage}`))
}

function showAnimeCards(animeData, wrapper = animeContentWrapper ) {
	
	const animes = animeData
	
	let animeCards = ``
	animes.forEach(anime => animeCards += createAnimeCards(anime))
	wrapper.innerHTML = animeCards
	
	const detailButtons = document.querySelectorAll('.button-modal')
	showAnimeDetails(animes, detailButtons)
}

function createAnimeCards(anime) {

	return `
		<div class="col-md-4 my-5">
			<div class="card">
				<img src="${anime.image_url}" class="card-img-top">
				<div class="card-body">
					<h5 class="card-title">${anime.title}</h5>
					<h6 class="card-subtitle mb-2 text-muted">${anime.score}</h6>
					<button type="button" class="btn btn-primary button-modal" data-toggle="modal" data-target="#exampleModal" >Show details</button>
				</div>
			</div>
		</div> `
}

function showAnimeDetails(animes, detailButtons) {

	detailButtons.forEach(detailButton => {
		detailButton.addEventListener('click', (e) => {

			const animeTitle = e.target.previousElementSibling.previousElementSibling.textContent
			const selectedAnimeDetail = animes.filter(anime => {
				return anime.title == animeTitle
			})

			const listAnimeDetailWrapper = document.querySelector('.list-anime-detail')
			const imageAnimePictureWrapper = document.querySelector('.img-detail')

			imageAnimePictureWrapper.setAttribute('src', selectedAnimeDetail[0].image_url)
			listAnimeDetailWrapper.innerHTML = showAnimeDetail(selectedAnimeDetail)
		})
	})
}


function showAnimeDetail(anime) {

	let airingText = 'Yes'
	let endDate = anime[0].end_date
	let startDate = anime[0].start_date

	if ('airing_start' in anime[0]) {

		airingText = anime[0].airing_start
		if (!endDate) {
			endDate = '-'
			startDate = '-'
		}
	} else {
		if (!anime[0].airing) {
			airingText = 'No'
		} else {
			endDate = '-'
		}
	}

	return `
		<li class="list-group-item list-title">Title : ${anime[0].title}</h4></li>
		<li class="list-group-item list-airing">Airing : ${airingText}</li>
		<li class="list-group-item list-episode">Episode : ${anime[0].episodes}</li>
		<li class="list-group-item list-start-date">Start date : ${startDate}</li>
		<li class="list-group-item list-end-date">End date : ${endDate}</li>
		<li class="list-group-item list-score">Score : ${anime[0].score}</li>
		<li class="list-group-item list-synopsis">Synopsis : ${anime[0].synopsis}</li> `
}