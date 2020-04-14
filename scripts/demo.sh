#!/bin/bash

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

WIDTH=800
HEIGHT=150
DISP=:77

info() {
	printf "%s\n" "$@"
}

handle_int() {
	info "caught SIGINT"
	clean_exit 1
}

clean_exit() {
	xpra stop $DISP
	wait
	rm -rf "$TMPDIR"
	[[ -f "$gif_path" ]] || (info "no gif created!"; exit 1)
	info "gif created at: $gif_path"
	exit "$1"
}

keys_setup() {
	xdotool \
		mousemove 500 500 \
		sleep 0.1 \
		key alt+a \
		search --sync github windowsize $WIDTH $((HEIGHT+250)) \
		sleep 0.1 \
		key --delay 50 alt+o ctrl+w ctrl+l \
		c h e s s period c o m Return \
		ctrl+t a m a z o n period c o m Return \
		ctrl+t t w i t t e r period c o m Return \
		ctrl+t i n s t a g r a m period c o m Return \
		ctrl+t a d d o n s period m o z i l l a period o r g Return \
		ctrl+t r e d d i t period c o m Return \
		ctrl+t g i t h u b period c o m slash n u m i r i a s slash p a x m o d Return \
		sleep 3 \
		key Next Next \
		sleep 1
}

keys_demo() {
	xdotool \
		sleep 2 \
		key ctrl+t \
		sleep 0.4 \
		key --delay 80 y o u t u b e period c o m Return \
		sleep 0.4 \
		key ctrl+t \
		sleep 0.4 \
		key --delay 80 i m g u r period c o m Return \
		sleep 0.4 \
		key --delay 250 ctrl+t ctrl+t ctrl+t ctrl+t ctrl+t ctrl+t ctrl+t \
		sleep 2
}

write_userjs() {
	cat > "$1/user.js" <<-EOF
	user_pref("browser.uidensity", 1);
	user_pref("app.normandy.first_run", false);
	user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
	user_pref("xpinstall.signatures.required", false);
	user_pref("extensions.experiments.enabled", true);
	EOF
}

run_browser() {
	$FF_BINARY --no-remote --profile "$TMPDIR" build/paxmod-latest.xpi
}

start_recording() {
	ffmpeg -f x11grab -video_size "${WIDTH}x$HEIGHT" -i $DISP -r 12  -y "$1" &
	ffmpeg_pid=$!
}

stop_recording() {
	kill -INT $ffmpeg_pid
	wait $ffmpeg_pid
}

convert_to_gif() {
	mkdir -p "$(dirname "$2")"
	convert "$1" -layers optimize "$2" || clean_exit 1
}

upload_gif() {
	res=$(curl -X POST https://api.imgur.com/3/upload \
		--header "Authorization: Client-ID $IMGUR_CLIENT_ID" \
		--form "image=@$1")
	code=$?
	if [[ "$code" -ne 0 ]]; then
		info "error: demo upload failed"
		clean_exit 1
	fi
	printf "\nDEMOURL=%s\n" "$(echo "$res" | jq -r ".data.link")"

}

log() {
	"${@:2}" 2>&1 | ts "[%Y-%m-%d %H:%M:%S] $1:"
}

main() {
	export DISPLAY=$DISP
	trap handle_int SIGINT
	FF_BINARY="${1:-firefox}"

	xpra --version || exit 1
	xdotool --version || exit 1
	ffmpeg -version || exit 1
	convert --version || exit 1
	$FF_BINARY --version || exit 1

	TMPDIR=$(mktemp -d --suffix _paxmod-demo)
	video_path="$TMPDIR/demo.mp4"
	gif_path=$(realpath -m "$HERE/../build/demo/output.gif")
	rm -f "$gif_path"

	write_userjs "$TMPDIR"

	log "xpra" xpra start-desktop $DISP --mdns=no --clipboard=no || exit 1

	info "starting browser"
	log "firefox" run_browser &
	sleep 7
	log "xdotool" keys_setup

	info "starting recording"
	start_recording "$video_path"
	log "xdotool" keys_demo
	stop_recording

	log "convert" convert_to_gif "$video_path" "$gif_path"
		if [[ -n "$IMGUR_CLIENT_ID" ]]; then
			upload_gif "$gif_path"
		fi

	info "exiting"
	clean_exit 0
}

main "$@"
