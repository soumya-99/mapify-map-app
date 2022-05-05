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
	$(".tooltipped").tooltip()
	$('.fixed-action-btn').floatingActionButton()
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
