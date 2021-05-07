const searchButton = document.querySelector('.input-button')
const animeSearchKeywords = document.querySelector('.input-value')
const animeContentWrapper = document.querySelector('.anime-wrapper')
const formSearch = document.querySelector('.form')
const scheduledAnimeWrapper = document.querySelector('.schedule-anime-wrapper')
const dayOptions = document.querySelector('#releaseDayOptionValue')
const feedback = document.querySelector('.feedback')

// get anime data when user click search button
searchButton.addEventListener('click', getAnimeData)
// get anime data when user using form
formSearch.addEventListener('submit', getAnimeData)

// get the on going anime data based on this day when the web is first load
document.addEventListener('load', getScheduledAnimeData( getScheduledAnimeURL() ))

// get the day value from <select> tag
function getOptionValue() {
	return dayOptions.value.toLowerCase()
}

function getScheduledAnimeURL(selectedDay = '', selected = false) {
	// check if there's no selected day on <select> tag
	if (!selected) {
		const date = new Date ()
		let todayName = ''
		
		if (date.getDay() === 0) {
			todayName = 'sunday'
			dayOptions.options[0].setAttribute('selected', 'selected')
		} else if (date.getDay() === 1) {
			todayName = 'monday'
			dayOptions.options[1].setAttribute('selected', 'selected')
		} else if (date.getDay() === 2) {
			todayName = 'tuesday'
			dayOptions.options[2].setAttribute('selected', 'selected')
		} else if (date.getDay() === 3) {
			todayName = 'wednesday'
			dayOptions.options[3].setAttribute('selected', 'selected')
		} else if (date.getDay() === 4) {
			todayName = 'thursday'
			dayOptions.options[4].setAttribute('selected', 'selected')
		} else if (date.getDay() === 5) {
			todayName = 'friday'
			dayOptions.options[5].setAttribute('selected', 'selected')
		} else if (date.getDay() === 6) {
			todayName = 'saturday'
			dayOptions.options[6].setAttribute('selected', 'selected')
		}
		return {
			url :`https://api.jikan.moe/v3/schedule/${todayName}`, 
			day : todayName 
		}
	}
	// return this data if theres selected day based on selected day on <select> tag
	return {
		url : `https://api.jikan.moe/v3/schedule/${selectedDay}`,
		day : selectedDay
	}

}

// get scheduled anime data
async function getScheduledAnimeData(resource) {
	
	animeContentWrapper.innerHTML = ''
	animeSearchKeywords.value = ''

	// fetching anime data from resource and pass it to data variable
	const data = await fetchData(resource.url, resource.day)

	// shwoing the results through cards
	showAnimeDataToCards(data, scheduledAnimeWrapper)
}

async function getAnimeData(event) {

	// preventing the web page when user submit the form
	event.preventDefault()

	// clearing cards anime container
	scheduledAnimeWrapper.innerHTML = ''
	
	// fetching anime data
	let URL = `https://api.jikan.moe/v3/search/anime?q=${animeSearchKeywords.value}&limit=15`
	const animeData = await fetchData(URL, 'results')

	// showing the fetching results through the cards
	showAnimeDataToCards(animeData, animeContentWrapper)
}

// fetch anime data from API
function fetchData(URL, key) {

	feedback.textContent = 'Loading'

	return fetch(URL)
	.finally(() => feedback.textContent = '')
	.then(response =>response.json())
	.then(response => response[key])
	.catch(errorMessage => console.log(`gagal ${errorMessage}`))
}

function showAnimeDataToCards(animeData, wrapper = animeContentWrapper ) {
	
	let animeCards = ``

	// create html string for every cards
	animeData.forEach(anime => animeCards += createAnimeCards(anime))

	// injecting thoose html string through wrapper
	wrapper.innerHTML = animeCards
	
	const detailButtons = document.querySelectorAll('.button-modal')
	showAnimeDetails(animeData, detailButtons)
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

	// showing diffrent anime details on each "detail button"
	detailButtons.forEach(detailButton => {
		detailButton.addEventListener('click', (e) => {

			const animeTitle = e.target.previousElementSibling
								.previousElementSibling.textContent

			// return anime detail from filtering data based on anime title
			const selectedAnimeDetail = animes.filter(anime => {
				return anime.title == animeTitle
			})

			const animeDetailsListWrapper = document.querySelector('.list-anime-detail')
			const imageAnimePictureWrapper = document.querySelector('.img-detail')

			// setting the detail image based on filtered anime
			imageAnimePictureWrapper.setAttribute('src', selectedAnimeDetail[0].image_url)

			// showing another information of the anime details based on filtered anime
			animeDetailsListWrapper.innerHTML = showAnimeDetail(selectedAnimeDetail)
		})
	})
}


function showAnimeDetail(anime) {

	let airingText = 'Yes'
	let endDate = anime[0].end_date
	let startDate = anime[0].start_date

	// check if the anime is airing
	if ('airing_start' in anime[0]) {

		// if yes, set the airing text based on API
		airingText = anime[0].airing_start

		// check if theres no endDate and startDate
		// which is indicate that anime is still on going (airing)
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