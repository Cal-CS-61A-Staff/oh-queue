$(document).ready(function() {
	var navOffsetTop = $('.column-headings').offset().top;

	function init() {
		$(window).on('scroll', onScroll);
		$(window).on('resize', resize);
	}

	function onScroll() {
		if(navOffsetTop < $(window).scrollTop() && !$('body').hasClass('docked-headings')) {
			$('body').addClass('docked-headings');
			$('.column-headings').find(".container").removeClass('u-full-width');
		}
		if(navOffsetTop > $(window).scrollTop() && $('body').hasClass('docked-headings')) {
			$('body').removeClass('docked-headings');
			$('.column-headings').find(".container").addClass('u-full-width');
		}
	}

	function resize() {
		$('body').removeClass('has-docked-nav');
		navOffsetTop = $('.column-headings').offset().top;
		onScroll();
	}

	init();

});