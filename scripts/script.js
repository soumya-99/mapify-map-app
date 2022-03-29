// jQueries for MATERIALIZE CSS
$(document).ready(function () {
	// $('.collapsible').collapsible();
	$(".sidenav").sidenav()
	$(".carousel").carousel()
	setInterval(function () {
		$(".carousel").carousel("next")
	}, 2500)
	$(".dropdown-trigger").dropdown()
	// $('.modal').modal();
})
new SmoothScroll('a[href*="#"]')
