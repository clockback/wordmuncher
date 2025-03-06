# Word Muncher

## About

Word Muncher is an open-source web-application to help you create and learn with
vocabulary sheets.

## Installation

To set up a Word Muncher instance, you will need to have
[Node Version Manager](https://github.com/nvm-sh/nvm) already installed. You can
then clone the [repository](https://github.com/clockback/wordmuncher/):

```sh
git clone https://github.com/clockback/wordmuncher.git
```

You must know [which version](https://github.com/clockback/wordmuncher/releases)
of Word Muncher you wish to use, and check this out in a detached head state:

```sh
cd wordmuncher
git switch --detach v0.1.0
```

You can then use the correct version of NVM (specified in `.nvmrc`):

```sh
nvm install 18
nvm use 18
```

Run a clean installation and build the application:

```sh
npm ci
npm run build
```

You then need to set up the database.

```sh
NODE_ENV=production npm run migrate
NODE_ENV=production npm run seed
```

Before you run your server, if you want Word Muncher to be accessible to other
computers on your network, you must make the server accessible on port 80 (it is
presently hosted at port 3000). How you do this is up to you, but a simple solution
is to use `iptables`:

```sh
sudo apt-get install iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo sh -c "iptables-save > /etc/iptables/rules.v4"
```

You can then run your server:

```sh
NODE_ENV=production npm run cron & npm run start
```

## Development

To run in development (at port 3000), one run:

```sh
npm run cron & npm run dev
```

Before opening a pull request, ensure your code passes the following quality checks:

```sh
npm run lint
npm run spellcheck
```

And that it is correctly formatted:

```sh
npm run format
```

## License

Copyright The Word Muncher Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with this program. If not, see
<http://www.gnu.org/licenses/>.
