/// <reference path="jquery-3.5.1.min.js" />

$(document).ready(function () {
	$('#ContactForm').show();
	$('#formResult').html("");
	$('#formResult').hide();
	$('#btn-submit').on('click', callServer);
});

function callServer() {
	var firstName = $('input#firstName').val(),
		lastName = $('input#lastName').val(),
		email = $('input#email').val(),
		message = $('textarea#message').val(),
		contactResponse = "<hr><p>Thank you " + firstName + " " + lastName
						+ " for getting in touch!</p>"
						+ "<p>Your email is " + email + "</p>"
						+ "<p>Your message is " + message + "</p>"
						+ "<p>We will get back to you soon!</p>";

	$('#formResult').html(contactResponse);
	$('#formResult').show();
	$('#ContactForm').hide();
}