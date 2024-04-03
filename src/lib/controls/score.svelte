<script lang="ts">
	import { browser } from '$app/environment';
	import abcjs from 'abcjs';
	import { onMount } from 'svelte';
	import 'abcjs/abcjs-audio.css';
	import { getAbcFormat, type ScoreData, type ScoreElement } from '$lib/model/booklet';

	let scoreElement = $state(undefined as HTMLElement | undefined);
	let control = $state(undefined as HTMLElement | undefined);

	let { score, showControls }: { score: ScoreElement; showControls: boolean } = $props();

	let audioContext = $state(undefined as AudioContext | undefined);

	$effect(() => {
		if (showControls && browser) {
			if (!audioContext) {
				audioContext = new AudioContext();
			}
		} else {
			audioContext = undefined;
		}
	});

	onMount(() => {});

	$effect(() => {
		if (scoreElement && score) {
			const [abc, lyrics] = getAbcFormat(
				score,
				score.lyricsDisplay
					.map((x, i) => [x, i] as const)
					.filter((x) => x[0] == 'score')
					.map((x) => x[1]),
				score.lyricsDisplay
					.map((x, i) => [x, i] as const)
					.filter((x) => x[0] == 'below')
					.map((x) => x[1]),
				score.showTitle,
				score.showSpeed || showControls,
				score.showAuthor
			);
			console.log(abc);
			// const wrap: number[] = [2];
			const tune = abcjs.renderAbc(scoreElement, abc, {
				germanAlphabet: true,
				staffwidth: 400,
				wrap: score.linesettings,
				scale: score.scale,
				oneSvgPerLine: true
			});
			console.log('Wrapping', tune);
			if (showControls && control && audioContext) {
				let synth = new abcjs.synth.CreateSynth();
				synth.init({
					audioContext,
					visualObj: tune[0]
				});
				const synthControl = new abcjs.synth.SynthController();
				synthControl.load(control, undefined, {});
				synthControl.setTune(tune[0], false, undefined);
			}
		}
	});
</script>

<div class="contaner" bind:this={scoreElement}></div>
{#if showControls}
	<div bind:this={control}></div>
{/if}

<style lang="scss">
	.contaner,
	.contaner div {
		height: unset !important;
		overflow: unset !important;
		svg {
			break-inside: avoid-page;
		}
	}
	.abcjs-inner,
	.score {
		height: unset !important;
		overflow: unset !important;
	}
</style>
