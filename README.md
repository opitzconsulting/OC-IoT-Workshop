# IoT Workshop by OC


This repo contains a node.js project which hosts a workshop system to teach about technologies that can be used to create an IoT prototype like infrastructure. 


#### Copyright
All source code can be used however you like. Just give us/me credit.
Content belonging to OPITZ CONSULTING Deutschland GmbH (e.g. our triangle .SVG's , logo etc.) is protected by copyright and shall not be used without us agreeing to it.

#### Install
`npm install`

`node server.js`

#### Structure
Under 	slides/ there are several reveal.js based slides.
The 	tasks/  and hints/ folders contain Markdown documents for well tasks and hints to every chapter. Everything (slides, tasks, hints) is in german though, so thats something to keep in mind.

#### Philips Hue Integration
If you host the application with `node server.js` and set the right IP of a Hue Bridge in the `local_modules/hueControl.js` as well as the right ID for the lamps, the system can control Hue Lamps and their colors based on what the participants vote for. All actions are logged to the log folder. if you open the website which is hosted by the node server and go to the path 

`localhost:8080/static/app/#/logging`

you can look at the contents of what you have logged. There should be two graphs and a table which shows the logfile's content. 

for anyone that is interested about the project send me (https://github.com/pascalwhoop) a message! I'll help you get started.
