# usage example:
#
# $ version=min make version build release -s

.PHONY: build

version_old != sed -n -E 's/.*"version":\s*"([0-9.]+)".*/\1/p' src/manifest.json
version ?= $(version_old)
ifeq ($(version), min)
version != awk -F. -v OFS=. '$$NF++' <<< "$(version_old)"
endif

version:
	@echo "version $(version_old) -> $(version)"
	shopt -s globstar; for fn in **/*.template; do \
	    fn_orig="$${fn:0:-9}"; \
	    sed -E -e 's/\{\{\$$version\}\}/$(version)/g' "$$fn" > "$$fn_orig"; \
	    git add "$$fn_orig"; \
	done
	git commit -m "Release v$(version)"
	git tag v$(version)

build:
	@echo "build $(version)"
	web-ext build --overwrite-dest --source-dir src --artifacts-dir build \
	    --filename paxmod-$(version).xpi --ignore-files "*.template"
	ln -sf paxmod-$(version).xpi build/paxmod-latest.xpi

release:
	@echo "release $(version)"
	git push --follow-tags
	hub release create v$(version) -a build/paxmod-$(version).xpi -m v$(version)

demo:
	DARK=1 FF_BINARY=firefox-developer-edition ./scripts/demo.sh
	FF_BINARY=firefox-nightly ./scripts/demo.sh

clean:
	rm -rf build/
