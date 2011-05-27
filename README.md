JavaScript ANSI Parser
======================

The source code for the project can be found in the src/ directory. It's written in CoffeeScript.

After installing CoffeeScript, generate the JavaScript version:

        coffee -o js/ src/ansiparser.coffee

There is also a minified version of the code in the js/ directory. The code requires the 8x16 TrueType font located in the font/ directory, which gets included into the html page as shown in css/canvas.css.
