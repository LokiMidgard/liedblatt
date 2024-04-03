<script lang="ts">
	// import '$lib/default.scss';
	import { onMount } from 'svelte';
	import abcjs from 'abcjs';
	const { renderAbc } = abcjs;
	import 'abcjs/abcjs-audio.css';
	import { doPaged } from '$lib/paged';

	onMount(() => {});

	let source: HTMLElement;
	let target: HTMLElement;
	let score: HTMLElement;

	let text = $state(
		`X:1
T: Ausgang und Eingang
C: T u. M: Joachim Schwarz 1962
M: 2/2
L: 1/4
Q: 1/4=120
K: C
"C""^①"C2DE|"F"F2"C"HE2|"^②""C"E2FG|(AE)HG2|
w:Aus-gang und Ein-gang, An-fang und En - de
"^③"c2Bc|B2Hc2|"^④"G5/4A/2FE|D2HC2:|
w:lie-gen bei dir, Herr, füll du uns die Hän-de!
`
	);
	$effect(() => {
		const tune = renderAbc(score, text, {
			germanAlphabet: true,
			// responsive: 'resize',
			// lineBreaks:[2,5],
			scale: 0.8,
			staffwidth: 400,
			wrap: {
				preferredMeasuresPerLine: 5,
				minSpacing: 1,
				maxSpacing: 5,
				minSpacingLimit: 1,
				lastLineLimit: 2
			},
			oneSvgPerLine: true,
			add_classes: true
			//  expandToWidest:true,
			//  print:true
		});

		doPaged(document.getElementById('source')?.innerHTML!, document.getElementById('target')!);
	});
</script>

<div data-theme="light" id="target" />
<div id="source" style="opacity: 0; height: 0; overflow-y: hidden;">
	<div class="score" bind:this={score} />
</div>

<style lang="scss">
	// :global() {
	:global(.missing) {
		color: brown;
	}
	:global(button.missing) {
		background-color: brown;
		color: white;
	}

	@page {
		size: A5;
		margin-top: 15mm;
		margin-right: 15mm;
		margin-bottom: 25mm;
		margin-left: 15mm;
		@top-center {
			content: element(titleRunning);
		}
	}
	.abcjs-inner,
	.score {
		height: unset !important;
		overflow: unset !important;
	}
	:global(.abcjs-inner > div) {
		background-color: red;
		break-inside: avoid-page;
		// break-after: page;
	}
	@media screen {
		// @media screen {

		:global(:root) {
			--screen-pages-spacing: 10rem;
			--color-paper: white;
			--background: lightgray;
			--muted-color: #dfdfdf;
			--background-color: white;
			// --color: black;
		}
		:global(body) {
			background-color: var(--background);
			margin: 0 auto 0 auto;
		}
		:global(.pagedjs_pages) {
			display: flex;
			// max-width: var(--pagedjs-width);
			flex: 0;
			flex-wrap: wrap;
			margin: 0 auto;
			margin-top: var(--screen-pages-spacing);
		}
		:global(.pagedjs_page) {
			background: var(--color-paper);
			box-shadow:
				0 4px 10px rgba(0, 0, 0, 0.6),
				inset 0 0 3px rgba(0, 0, 0, 0.6);
			flex-shrink: 0;
			flex-grow: 0;
			margin: auto auto var(--screen-pages-spacing) auto;
		}
		// }
	}
	:global(nav) {
		display: none;
	}

	:global(.kampf-right > div:only-child) {
		grid-column: 1 / 4 !important;
	}
	// }
	* {
		box-sizing: border-box;
	}

	h6 {
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		margin-bottom: 8px;
		font-weight: lighter;
	}

	.light {
		color: lightslategray;
	}

	.pagebreak {
		break-before: page;
	}
	.header {
		break-before: page;
		position: running(titleRunning);
	}
</style>
