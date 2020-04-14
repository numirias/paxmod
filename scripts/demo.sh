#!/bin/bash
#
# Generate a demo screenshot (png) + screencap (gif)
#
# usage example:
#
# $ DARK=1 FF_BINARY=firefox-developer-edition ./demo.sh

set -u
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
win_w=798
win_h=149
demo_display=:77
cl_green=$(tput setaf 2)
cl_yellow=$(tput setaf 3)
cl_reset=$(tput sgr0)
declare -A requirements=(
	[xpra]="xpra --version"
	[xdotool]="xdotool --version"
	[ffmpeg]="ffmpeg -version"
)
declare -a tabs_setup=(nodejs.org js.org www.typescriptlang.org aurelia.io
	addons.mozilla.org github.com/numirias/paxmod angular.io reactjs.org vuejs.org)
declare -a tabs_typed=(angular.io reactjs.org vuejs.org)
ffmpeg_pid=-1

log() {
	if [[ $# -ge 2 ]]; then
		"${@:2}" 2>&1
	else
		cat
	fi | ts "${cl_green}[%Y-%m-%d %H:%M:%S] ${cl_yellow}$1${cl_reset}:"
	return "${PIPESTATUS[0]}"
}
info() { log "info" printf "%s\n" "$@"; }
xdo() { log "xdotool" xdotool "$@"; }

handle_int() {
	printf "caught interrupt\n"
	clean_exit 1
}

clean_exit() {
	rec_stop
	info "cleanup"
	log "xpra" xpra stop $demo_display
	wait
	rm -rf "$tmp_dir"
	exit "$1"
}

keys_setup() {
	# move cursor out of view
	xdo mousemove 100 $((win_h+50))
	# confirm extension installation prompt
	xdo sleep 1 key alt+a
	info "wait until extension installed"
	xdo search --sync "github" windowsize $win_w $((win_h+250))
	# close installation complete notification, paxmod tab
	xdo sleep 1 key --delay 100 alt+o ctrl+w
	info "prepare open tabs"
	# open homepage url(s), go to last tab
	xdo sleep 1 key --delay 100 alt+Home alt+9
	# close last three tabs (just needed to preload them)
	xdo sleep 1 key --delay 100 ctrl+w ctrl+w ctrl+w
}

keys_demo() {
	sleep 0.8
	for tab in "${tabs_typed[@]}"; do
		xdo sleep 1.1 key ctrl+t sleep 0.4 type --delay 200 "$tab"
		xdo key Return
	done
	sleep 1.5
	for ((i=0; i<12; i++)); do
		 xdo sleep 0.25 key ctrl+t
	done
	sleep 1.0
}

setup_profile_dir() {
	local profile_dir=$1 dark_theme=$2 ui_state
	read -r -d '' ui_state <<-EOF
	{"placements": {"nav-bar": [
		"back-button", "forward-button", "stop-reload-button", "home-button", "urlbar-container"
	]}, "currentVersion": 17}
	EOF
	cat > "$profile_dir/user.js" <<-EOF
	user_pref("xpinstall.signatures.required", false);
	user_pref("extensions.experiments.enabled", true);

	user_pref("javascript.enabled", true);
	user_pref("app.normandy.first_run", false);
	user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
	user_pref("datareporting.policy.dataSubmissionEnabled", false);
	user_pref("browser.startup.homepage", "$(printf "|%s" "${tabs_setup[@]}" | cut -c2-)");
	user_pref("browser.startup.firstrunSkipsHomepage", false);
	user_pref("browser.uidensity", 1);
	user_pref("browser.toolbars.bookmarks.visibility", "never");
	user_pref("browser.uiCustomization.state", '$ui_state');
	user_pref("ui.systemUsesDarkTheme", $((dark_theme)));
	user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
	EOF

	if ((dark_theme)); then
		mkdir -p "$profile_dir/chrome"
		cat > "$profile_dir/chrome/userChrome.css" <<-EOF
		@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
		.tabbrowser-tab, #urlbar { font: 14px "xos4 Terminus" !important; }
		EOF
	fi
}

run_browser() {
	info "starting browser"
	log "firefox" "$FF_BINARY" --no-remote --profile "$1" "$2"
}

rec_start() {
	local pic_file=$1 vid_file=$2 caption=$3
	info "record start: $pic_file, $vid_file"

	AV_LOG_FORCE_COLOR=1 ffmpeg -y -r 15 -f x11grab -video_size "${win_w}x${win_h}" \
		-i "$DISPLAY" \
		-filter_complex "pad=$((win_w+2)):$((win_h+1)):1:1:333333,\
			drawtext=font='xos4 Terminus':fontsize=14:fontcolor=white:\
				box=1:boxcolor=#111111@0.8:boxborderw=4:\
				x=w-text_w-4:y=h-text_h-4:text='$caption',\
			split[v1][v2]" \
		-map "[v1]" -f image2 -frames:v 1 "$pic_file" \
		-map "[v2]" "$vid_file" &> >(log "ffmpeg") &
	ffmpeg_pid=$!
}

rec_stop() {
	ps -p $ffmpeg_pid &>/dev/null || return
	info "record stop"
	kill -INT $ffmpeg_pid
	wait $ffmpeg_pid
}

make_gif() {
	ffmpeg -y -r 18 -i "$1" -filter_complex "split[v1][v2];\
		[v1]palettegen=reserve_transparent=0[p];\
		[v2][p]paletteuse" "$2"
}

main() {
	trap handle_int SIGINT
	local ff_ver ext_file out_dir ver caption
	export DISPLAY=$demo_display

	if ! command -v "$FF_BINARY" &>/dev/null; then
		info "error: bad binary: FF_BINARY=$FF_BINARY"
		exit 2
	fi
	for key in "${!requirements[@]}"; do
		read -ra args <<< "${requirements[$key]}"
		if ! log "$key" "${args[@]}"; then
			info "requirement failed"
			exit 2
		fi
	done

	ext_file=${EXT_FILE:-$(realpath -m "$here/../build/paxmod-latest.xpi")}
	ff_ver=$($FF_BINARY --version)
	ver=$(unzip -p "$ext_file" manifest.json |
		sed -n -E 's/.*"version":\s*"([0-9.]+)".*/\1/p')
	caption="Firefox $(awk '{print $3}' <<<"$ff_ver") + Paxmod $ver"
	out_dir=$(realpath -m "$here/../build/demo")

	tmp_dir=$(mktemp -d --suffix _paxmod-demo)
	mkdir -p "$out_dir"
	info "tmp dir: $tmp_dir"
	info "extension file: $ext_file"
	setup_profile_dir "$tmp_dir" "${DARK+1}"

	# setup
	log "xpra" xpra start-desktop $demo_display --mdns=no --clipboard=no || exit 1
	run_browser "$tmp_dir" "$ext_file" &
	sleep 4
	keys_setup
	sleep 2

	# record demo
	rec_start "$out_dir/demo.png" "$tmp_dir/demo.mp4" "$caption"
	keys_demo

	# finish up
	rec_stop
	log "ffmpeg (gif)" make_gif "$tmp_dir/demo.mp4" "$out_dir/demo.gif"
	clean_exit 0
}

main "$@"
