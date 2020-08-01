const url = 'http://localhost:8900/'

$(document).ready(() => {
    $('#submenu').hide();
    $("#btn-home").click(() => {
        window.location.href = url;
    });
    $("#btn-about").click(() => {
        window.location.href = url + "about";
    });
    $("#btn-contact").click(() => {
        window.location.href = url + "contact";
    });
    $("#btn-portfolio").click(() => {
        window.location.href = url + "portfolio";
    });
    $("#btn-portfolio").mouseover(() => {
        $('#submenu').slideDown("slow");
    });
    $("#submenu").mouseleave(() => {
        $('#submenu').slideUp("slow");
    });
    $("#showbutton").click(() => {
        $("video").show();
        $("audio").show();
    });
    $("#hidebutton").click(() => {
        $("video").hide();
        $("audio").hide();
    });
});