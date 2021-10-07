# usage example:
#
# $ version=minor make release -s

.PHONY: build

version_old != sed -n -E 's/.*"version":\s*"([0-9.]+)".*/\1/p' src/manifest.json
version ?= $(version_old)
ifeq ($(version), minor)
version != awk -F. -v OFS=. '$$NF++' <<< "$(version_old)"
endif

version:
ifeq ($(version_old), $(version))
	$(error need new version (version=...))
endif
	@echo "$(version_old) -> $(version)"
	git diff-index --quiet HEAD || (echo "dirty git tree"; exit 1)
	shopt -s globstar; for fn in **/*.template; do \
	    sed -E -e 's/\{\{\$$version\}\}/$(version)/g' $$fn > $${fn:0:-9}; \
	done
	git --no-pager diff

build:
	web-ext build --overwrite-dest \
	    --source-dir src --artifacts-dir build --ignore-files "*.template"
	mv build/paxmod-$(version).{zip,xpi}
	ln -sf paxmod-${version}.xpi build/paxmod-latest.xpi

release: version build
	git commit -m "Release v$(version)" src/manifest.json updates.json
	git tag v$(version)
	git push --tags
	hub release create v$(version) -a build/paxmod-$(version).xpi -m v$(version)
	git push

demo:
	DARK=1 FF_BINARY=firefox-developer-edition ./scripts/demo.sh
	FF_BINARY=firefox-nightly ./scripts/demo.sh

clean:
	rm -rf build/
