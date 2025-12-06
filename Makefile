.PHONY: clean install dev dev-fast lint-typecheck tests test-watch

clean:
	rm -rf node_modules dist .turbo .vite .cache .eslintcache package-lock.json npm-shrinkwrap.json pnpm-lock.yaml

install:
	yarn install

lint-typecheck:
	yarn lint && yarn typecheck

tests:
	yarn test --coverage

test-watch:
	yarn test:watch

test-build:
	yarn lint && yarn typecheck && yarn build

dev: clean install
	yarn dev

dev-fast:
	yarn dev
