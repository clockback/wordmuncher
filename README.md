
![](prokart/src/static/images/logo-full.svg "Logo")

## About
Prokart is an open-source web-application to help you create and
learn with vocabulary sheets.

### License

Copyright © 2020 Elliot Paton-Simpson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

# Installation

You will need Python3.6 (or a later version), pip and git to run
Prokart.

To install Prokart on Linux, use the following command:
```
$ pip3 install git+https://github.com/clockback/prokart
```

The application can then be run from the terminal like so:
```
$ prokart
```
This will open the web application from your default web browser.

## Documentation

### Create

Once the application has been opened, you will see a toolbar at the top
of the screen with a button labeled "Start!" Click on it to begin
choosing which languages you wish to learn.  Note that you generally use
two languages at any given time while using this application, consisting
of one language that provides you questions, and the language in which
you are expected to answer. You are able to add new languages by typing
in the name of one of these languages, selecting a flag, then clicking
"Add".

Once you have added the two new languages, you can select them using the
drop-downs below. Once you have selected your two languages, you can
click "Save" to load your new selection.

Before you can begin memorizing any vocabulary, you need to create some
vocabulary sheets, and the individual words you want to memorize. From
the home page, click on the "Create" button. This will take you to a
page where you can do both these things.

To create an entry, click on the "Add" button below the "Entries"
heading. You can type a new question and answer. If there is more than
one answer that you are willing to accept, type them below and click on
the arrow (or hit Enter) to add them. Remember, unless during a test,
you answer similarly to one of the other answers, the test shall tell
you to answer with the first answer you provide now.

You can use this tool to add the sheet to one or more sheets straight
away, but you haven't made any yet, so you'll have to simply click
"Save". Once you believe you have made enough entries for now, you
should create a vocabulary sheet. Click on the "Add" button below the
"Sheets" heading and give your new sheet a name. You can also add
various entries to the sheet.

### Test

Once you have made some content and would like to test your vocabulary,
you can go to the home page (use the icon at the top-left of the page)
and click on the "Test" button. You should see all the sheets with
entries listed. To try one, click on the sheet's row and then on the
"Go!" button.

You will find yourself in a page for the test. When the answer pops up
on the screen, type in the answer and hit enter. If you answer
incorrectly, your progress on that word will be lost and you will need
to answer correctly a greater number of times before reaching 100%. If
you have forgotten to include a possible answer and then as a result be
told that the answer you gave was wrong, you can click on the "Add to
answers" button.

Eventually, you will run out of questions for the test, and the program
show you your results. Entries in green are finished, while entries in
yellow are incomplete and entries in red were most recently answered
incorrectly.

Over time, you will accumulate stars if you have finished a question for
a long enough period of time without getting it wrong since. Upon
receiving a star for an entry, you will need to work your way back up to
100% before you can receive another star. Waiting for the next star
shall take a progressively longer period of time. You can earn up to
five stars for any entry.
