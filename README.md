# WebArcSpinner
html/css/javascript to create dynamically sized, rotating html canvas using html, dynamic css, javascript and jquery

To understand all that follows, it is suggessted that you vist the page shown at http://iotlabs.us
While there, mouse over the arc segments and note the behavior (and style of the pop-up panels, etc.).  Also try resizing the web page to see what happens.  If you have access to IE and non-IE, bring up the page and notice the differences. If you do this, the following discussion will make more sense.

I wanted a very "dynamic" web page for a small company I set up.  I had an idea for a multi-segment "arc" of colors and text that when the user mouse-over the arc segments, pop-ups would show various information about my company.  I also wanted this arc to change sizes in real time as the web page window was resized (i.e., not AFTER the page was done being resized).  Primitive attempts at this would be to have a master image that gets "scaled" but this is not the ideal way to produce a stunning, dynamic image.  Also, it's difficult to get good mouse tracking out of an arbitrary circle with N arcs segments.  Thus, the best solution was to use canvas drawing techniques.

I also wanted this web page to be a bit strange.  It would have no menu-bars, hints, etc.  Users would have to sort of poke around to figure out what was going on.  Thus, the only thing that appears is the multi-colored arc with some semi-cryptic text in each arc segment (there is an exception to this "no menu-bar" rule...).  

Part of making this work is to be able to detect mouse position within the arc segments (so that the correct information panel can be displayed).  In a "real" browser, this is done using the isPointInStroke() function.  However, IE does not support this function. To work around this limitation, I decide to cheat and, if the browser is IE, I put up a small menu-bar icon that is clickable and will show the same information panels as the arc mouse-overs do.

As I was developing this, I got all the code to dynamically re-size the arc to work and then had the "great" idea to do a bit more animation.  Thus, I track the mouse's movement over the entire page and as it moves, I dynamically rotate the arc (clockwise or counterclockwise depending on movement direction).  I also had to deal with the dynamic text issues and how to place it on the arc segments.  This lead to research about the subtleties of text on a canvas and alpha channels, etc.  One thing lead to another and I ended up making the text in the center of the circle slowly fade in and out to give sort of a "pulsing" eeriness to the whole thing (done with js timers, etc.).

There are a lot of moving parts (pardon the pun) in this code, and a lot to be learned and/or used in other projects.  This turned out to be a much larger code footprint than I thought it would be, so that javascript is not not up to my standards as far as organization, being hidden in a class, etc.  But, that is all just a mechanical "fix", that, if I have time, I will get to an re-post for your edification.

As an interesting side-note, I posted a Request For Quote (RFQ) on a few of the rent-a-coder type sites and got a few lame responses, most of which showed people did not understand the problem.  So, I had to dig in and figure all this out.

