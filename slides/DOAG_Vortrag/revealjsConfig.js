Reveal.initialize({
    width: 1920,
    height: 1080,
    margin: 0.2,
    /*autoSlide: 5000,*/
    autoSlide: 0,
    transition: 'linear',


    controls: true,
    progress: true,
    history: true,
    /*loop: true,*/
    center: true,

    /*// Parallax background image
    parallaxBackgroundImage: "https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg", // e.g. "https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg"

    // Parallax background size
    parallaxBackgroundSize: "3400 1980px" , // CSS syntax, e.g. "2100px 900px" - currently only pixels are supported (don't use % or auto)*/


    /*transition: Reveal.getQueryHash().transition || 'linear', // default/cube/page/concave/zoom/linear/fade/none*/

    // Optional libraries used to extend on reveal.js
    dependencies: [
        { src: 'js/classList.js', condition: function () {
            return !document.body.classList;
        } },
        { src: 'js/markdown/marked.js', condition: function () {
            return !!document.querySelector('[data-markdown]');
        } },
        { src: 'js/markdown/markdown.js', condition: function () {
            return !!document.querySelector('[data-markdown]');
        } },
        { src: 'js/highlight/highlight.js', async: true, callback: function () {
            hljs.initHighlightingOnLoad();
        } },
        { src: 'js/zoom-js/zoom.js', async: true, condition: function () {
            return !!document.body.classList;
        } },
        { src: 'js/notes/notes.js', async: true, condition: function () {
            return !!document.body.classList;
        } }/*,
         { src: 'js/remotes/remotes.js', async: true, condition: function () {
         return !!document.body.classList;
         } }*/,

        //custom rating system for our workshop
        { src: 'js/oc-workshop-logger/slideLogger.js', async: true, condition: function () {
            return !!document.body.classList;
        }}


    ]
});