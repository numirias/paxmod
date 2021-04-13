.PHONY: build

ver_cur != sed -n -E 's/.*"version":\s*"([0-9.]+)".*/\1/p' src/manifest.json
ver_new != awk '{print substr($$2,0,1) ~ /^[\+-]/ ? ($$1 + $$2) : $$2}' <<< "$(ver_cur) $(version)"

version:
ifndef version
	$(error need version (version=...))
endif
	echo "$(ver_cur) -> $(ver_new)"
	shopt -s globstar; for fn in **/*.template; do \
	    sed -E -e 's/\{\{\$$version\}\}/$(ver_new)/g' $$fn > $${fn:0:-9}; \
	done
	git --no-pager diff

build:
	web-ext build --overwrite-dest \
	    --source-dir src --artifacts-dir build --ignore-files "*.template"
	mv build/paxmod-$(ver_cur).zip build/paxmod-${ver_cur}.xpi

release: version build
	git commit -m "Release v$(ver_new)" src/manifest.json updates.json
	git tag v$(ver_new)
	git push --tags
	hub release create v$(ver_new) -a build/paxmod-$(ver_new).xpi -m v$(ver_new)
	git push

clean:
	rm -rf build/
