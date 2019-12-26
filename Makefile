build:
	web-ext build --overwrite-dest --source-dir src --artifacts-dir build
	mv build/paxmod-$(VERSION).zip build/paxmod-${VERSION}.xpi

release:
	[[ -n "$(VERSION)" ]] || (echo "Release version required (\$$VERSION)"; exit 1)
	sed -i -E 's/("version":\s*)"[0-9.]+"/\1"$(VERSION)"/g' src/manifest.json
	sed -i -E 's/("version":\s*)"[0-9.]+"/\1"$(VERSION)"/g' updates.json
	sed -i -E 's/(download\/v)[0-9.]+(\/paxmod-)[0-9.]+[0-9](.*)/\1$(VERSION)\2$(VERSION)\3/g' updates.json
	make build
	git commit -m "Release v$(VERSION)" src/manifest.json updates.json
	git tag v$(VERSION)
	hub release create v$(VERSION) -a build/paxmod-$(VERSION).xpi -m v$(VERSION)
	git push

clean:
	rm -rf build/
