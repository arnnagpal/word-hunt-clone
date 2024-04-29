<script lang="ts">
	import { onMount } from 'svelte';
	import { type Position } from 'ambient';

	export let from: HTMLElement | Position;
	export let to: HTMLElement | Position;
	export let color = '#000';
	export let thickness = 5;
	export let opacity = 1;

	let line: HTMLElement;

	let loaded = false;

	onMount(() => {
		if (!from || !to) {
			console.error('From and To elements must be provided');
			return;
		}

		if (from === to) {
			console.error('From and To elements must be different');
			return;
		}

		adjustLine(from, to);
		loaded = true;
	});

	$: {
		if (loaded)
			adjustLine(from, to);
	}

	function getCenter(element: HTMLElement): Position {
		let rect = element.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		} as Position;
	}

	function adjustLineToPosition(from: Position, to: Position) {
		let left;
		let top;

		let yDiff = to.y - from.y;
		let xDiff = to.x - from.x;

		let CA = Math.abs(yDiff);
		let CO = Math.abs(xDiff);
		let H = Math.sqrt(CA * CA + CO * CO);
		let ANG = 180 / Math.PI * Math.acos(CA / H);

		if (to.y > from.y) {
			top = yDiff / 2 + from.y;
		} else {
			top = (from.y - to.y) / 2 + to.y;
		}

		if (to.x > from.x) {
			left = (xDiff) / 2 + from.x;
		} else {
			left = (from.x - to.x) / 2 + to.x;
		}

		if ((from.y < to.y && from.x < to.x) || (to.y < from.y && to.x < from.x) || (from.y > to.y && from.x > to.x) || (to.y > from.y && to.x > from.x)) {
			ANG *= -1;
		}
		top -= H / 2;

		line.style.transform = 'rotate(' + ANG + 'deg)';
		line.style.top = top + 'px';
		line.style.left = left + 'px';
		line.style.height = H + 'px';
		line.style.backgroundColor = color;

		line.style.borderRadius = (thickness/2) + 'px';

		line.style.width = thickness + 'px';
		line.style.opacity = String(opacity);
	}

	function adjustLine(from: HTMLElement | Position, to: HTMLElement | Position) {
		let fromPos = from instanceof HTMLElement ? getCenter(from) : from;
		let toPos = to instanceof HTMLElement ? getCenter(to) : to;

		adjustLineToPosition(fromPos, toPos);
	}


	/*
	function adjustLineToElement(from: HTMLElement, to: HTMLElement) {
			let left;
			let top;

			let fromRect = from.getBoundingClientRect();
			let toRect = to.getBoundingClientRect();


			let fT = fromRect.top + fromRect.height / 2;
			let tT = toRect.top + toRect.height / 2;
			let fL = fromRect.left + fromRect.width / 2;
			let tL = toRect.left + toRect.width / 2;

			let CA = Math.abs(tT - fT);
			let CO = Math.abs(tL - fL);
			let H = Math.sqrt(CA * CA + CO * CO);
			let ANG = 180 / Math.PI * Math.acos(CA / H);

			if (tT > fT) {
					top = (tT - fT) / 2 + fT;
			} else {
					top = (fT - tT) / 2 + tT;
			}
			if (tL > fL) {
					left = (tL - fL) / 2 + fL;
			} else {
					left = (fL - tL) / 2 + tL;
			}

			if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
					ANG *= -1;
			}
			top -= H / 2;

			line.style.transform = 'rotate(' + ANG + 'deg)';
			line.style.top = top + 'px';
			line.style.left = left + 'px';
			line.style.height = H + 'px';
			line.style.backgroundColor = color;
			line.style.width = thickness + 'px';
	}
*/

</script>

<div class="absolute -ml-0.5" bind:this={line}>
</div>