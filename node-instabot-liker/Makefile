.ONESHELL:
deps:
	@ yarn install

.ONESHELL:
test:
	@ export $$(cat .env.test); node src/index.js

.ONESHELL:
run:
	@ node src/index.js

.ONESHELL:
run-watch:
	@ nodemon src/index.js

.ONESHELL:
lint:
	@ ./node_modules/.bin/eslint src/
