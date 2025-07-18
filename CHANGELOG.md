# Changelog

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
