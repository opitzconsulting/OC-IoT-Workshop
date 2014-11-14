/**
 * Created with IntelliJ IDEA.
 * User: pbr
 * Date: 02.09.14
 * Time: 14:37
 * To change this template use File | Settings | File Templates.
 */

var slideLogger = (function () {

    var post = function () {

        var slideData = Reveal.getIndices();

        var sectionNumber = window.location.href;
        var stringMatches = sectionNumber.match(/(?:section)([0-9]{1,2})/);
        if (stringMatches != null) {
            slideData.sectionNumber = stringMatches[1];
        }


        var slideDataToSend = JSON.stringify(slideData);
        var url = "/api/slides/";
        var client = new XMLHttpRequest();

        client.open("PUT", url, false);

        client.setRequestHeader("Content-Type", "application/json");

        client.send(slideDataToSend);

        if (client.status == 200)
            console.log("The request succeeded!\n\nThe response representation was:\n\n" + client.responseText);
        else
            console.log("The request did not succeed!\n\nThe response status was: " + client.status + " " + client.statusText + ".");
    };


    // if ?notes as query parameter
    if (window.location.search.match(/(\?|&)notes/gi) !== null) {
        // Fires when slide is changed
        Reveal.addEventListener('slidechanged', post);
    }
})();

