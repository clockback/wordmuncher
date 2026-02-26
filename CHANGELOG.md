# Changelog

## Version 0.4.0

### Features

- Allow user to search within a vocabulary sheet for individual questions.
- Allow user to both export and import individual vocabulary sheets as JSON.
- Allow the user to set their native language.
- Allow the user to add new languages to the application.
- Allow the user to delete existing languages from the application.
- Allow the user to configure the application to ignore or gatekeep diacritics
  during vocabulary tests.
- Allow the user to configure the application to use text-to-speech.

### Bug fixes

- In the version prior, someone could scroll the window's contents. Modified
  so that only the components alone can be scrolled.
- In the version prior, there were numerous text inputs that would disappear
  if the user switched to another window. Changed so that the `onBlur` event
  is ignored if the user triggered it by losing window focus.

### Other changes

- Shrunk the inflection tables to be better able to fit within the window
  without the need for scrolling.
- Preventing E2E tests from running in parallel.
- Ensure each E2E test runs idempotently from one another.

## Version 0.3.0

### Features

- Using the editable header so that the user can modify a vocabulary sheet's
  name.
- Accepting answer submissions with different diacritics. This means that
  stress can be shown on a word, but it is not necessary for someone to type
  unicode markers as a requirement to submit a correct answer.
- Creating checkbox in user interface for when the user creates a new
  vocabulary entry which, when the user saves their new entry, drafts a new
  entry with the question and answer inverted, rather than closing the new
  entry interface.

### Other changes

- Bumping various dependencies.

## Version 0.2.2

### Bug fixes

- In the version prior, if someone attempted to view a two-category inflection
  table where the first category defined in the database was not the primary category,

### Other changes

- Bumping various dependencies.

## Version 0.2.1

### Bug fixes

- In the version prior, if someone completed more than three questions in a test,
  the list of recently completed questions would stop being modified, unexpectedly
  subverting the order of the test.

### Other changes

- Bumping various dependencies.

## Version 0.2.0

### Features

- Adding "Back" buttons to "/vocab", "/tests", "/vocab/add-sheet", and "/vocab/inflections/add".
- Making an editable header lose focus by making the containing document lose focus
  no longer results in the onblur callback being called. This allows users to, for
  example, switch their keyboard's language settings without the callback being triggered.

### Bug fixes

- In the version prior, if someone edited the question text in a question, and
  then tried creating a new question, the question text for the new question was
  already partly filled in with the text from the previous question.

### Other changes

- Using Word Muncher logo in README.md as header.
- Hiding sidebar on smaller screens. This is a small step in the direction of responsive
  design.

## Version 0.1.2

### Bug fixes

- In the version prior, if someone tried creating a new inflection table, or if
  they tried editing an existing unused inflection table, as soon as the proposed
  definition for the table was sufficient to render the table, a rendering issue
  would arise.

### Other changes

- Using markdownlint-cli to lint Markdown files. This is included in GitHub Actions.

## Version 0.1.1

### Bug fixes

- In the version prior, if someone selected a question that had extra answers,
  and then clicked on "Add new question", those extra answers would not have
  been cleared, requiring the user to delete them.
- In the version prior, if someone sent a request to restructure an inflection
  template that was invalid, such that one of the Sequelize write operations
  failed, all operations prior would be committed, leaving the database in an
  inconsistent state.

### Other changes

- Instructing in `README.md` to run the cron job in production mode. Following
  the previously written instructions would have made the cron job target the
  wrong database.
- Including information in `README.md` on how to build application. Following
  the previously written instructions would have resulted in the inability to
  start the server.
- Corrected spelling mistake in word "themselves" in `README.md`.

## Version 0.1.0

- Web server application application allows users to create their own vocabulary
  sheets.
- A user can create flash-card question and answer pairs. They can also create
  inflection tables, which might contain, for example, all the conjugations of
  the infinitive verb "to go".
- A user can test themselves on a vocabulary sheet, while the application uses
  spaced repetition to ensure the user only receives the words most needing attention.
