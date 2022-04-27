// jQueries for MATERIALIZE CSS
$(document).ready(function () {
	// $('.collapsible').collapsible();
	$(".sidenav").sidenav()
	$(".carousel").carousel()
	setInterval(function () {
		$(".carousel").carousel("next")
	}, 2500)
	$(".dropdown-trigger").dropdown()
	$(".modal").modal()
	$("select").formSelect()
})

$(window).on("load", function () {
	setInterval(function () {
		$(".pre-loader").fadeOut("slow")
	}, 2200)
})

const switchDarkForMap = () => {
	document.body.classList.toggle("dark")
	// document.querySelector(".divider").classList.toggle("divider__dark")
	document.querySelector(".modal").classList.toggle("modal__dark")
	document.querySelector(".modal-footer").classList.toggle("modal-footer__dark")
}

const switchDarkForAboutUs = () => {
	document.body.classList.toggle("dark")
	// document.querySelector(".divider").classList.toggle("divider__dark")
	document.getElementById("image-footer").classList.toggle("image-footer__dark")
	document
		.querySelector(".h3__algoTable")
		.classList.toggle("h3__algoTable__dark")
	document.querySelector(".table-algo").classList.toggle("table-algo__dark")
	document
		.querySelector(".h3__atAGlance")
		.classList.toggle("h3__atAGlance__dark")
}
