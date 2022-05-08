const switchDarkForMap = () => {
	document.body.classList.toggle("dark")
	document.querySelector(".modal").classList.toggle("modal__dark")
	document.querySelector(".modal-footer").classList.toggle("modal-footer__dark")
}
