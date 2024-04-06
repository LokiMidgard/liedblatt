<script lang="ts">
	import { browser } from '$app/environment';
	import abcjs from 'abcjs';
	import { onMount } from 'svelte';
	import 'abcjs/abcjs-audio.css';
	import { getAbcFormat, type ScoreData, type ScoreElement } from '$lib/model/booklet';
	import { walkLyrics } from '$lib/model/lyricsWalker';

	let scoreElement = $state(undefined as HTMLElement | undefined);
	let control = $state(undefined as HTMLElement | undefined);

	let { score, showControls }: { score: ScoreElement; showControls: boolean } = $props();

	let subText: [string, number][] = $state([]);

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
			const subTextIndex = score.lyricsDisplay
				.map((x, i) => [x, i] as const)
				.filter((x) => x[0] == 'below')
				.map((x) => x[1]);
			const [abc, lyrics] = getAbcFormat(
				score,
				score.lyricsDisplay
					.map((x, i) => [x, i] as const)
					.filter((x) => x[0] == 'score')
					.map((x) => x[1]),
				subTextIndex,
				score.showTitle,
				score.showSpeed || showControls,
				score.showAuthor
			);

			// const wrap: number[] = [2];
			const tune = abcjs.renderAbc(scoreElement, abc, {
				germanAlphabet: true,
				staffwidth: 400,
				wrap: score.linesettings,
				scale: score.scale,
				oneSvgPerLine: true
			});

			const notesPerLine = tune[0].lines.map(
				(x) => x.staff?.[0].voices?.[0].filter((x) => x.el_type == 'note').length
			);
			console.log('line braks', notesPerLine);
			subText = lyrics.map((l, i) => {
				const text = [...walkLyrics(l)].reduce((p, c, i) => {
					if (notesPerLine.includes(i)) {
						p += '/ ';
					}
					return p + c;
				}, '');
				return [text, subTextIndex[i] + 1];
				// subText.push(text)
			});

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
<ol>
	{#each subText as [t, i]}
		<li value={i}>{t}</li>
	{/each}
</ol>
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
