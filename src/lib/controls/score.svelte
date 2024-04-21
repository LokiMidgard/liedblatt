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
				staffwidth: score.width,
				wrap: score.linesettings,
				expandToWidest:true,
				scale: score.scale,
				oneSvgPerLine: true,
				format: {
					vocalfont: `${score.font.voice.name} ${11}pt`,
					titlefont: `${score.font.title.name} ${score.font.title.size}`,
					composerfont: `${score.font.composer.name} ${score.font.composer.size}`
				}
			});

			const notesPerLine = tune[0].lines
				.map((x) => x.staff?.[0].voices?.[0].filter((x) => x.el_type == 'note').length ?? 0)
				.map((x, i, a) => x + a.filter((x, i2) => i2 < i).reduce((p, c) => p + c, 0));

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

<div
	class="contaner"
	style="--font-size-scale: {score.scale}; --font-famaly: {score.font.voice
		.name}; --font-size: {score.font.voice.size}"
	bind:this={scoreElement}
></div>
<ol
	style="--font-size-scale: {score.scale}; --font-famaly: {score.font.voice
		.name}; --font-size: {score.font.voice.size}"
>
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

	.contaner{
		--font-size-scale: 1;
		font-family: var(--font-famaly);
	
		
		
		
		
		
		
		
		
		
		
		
		


		:global(text[data-name='lyric']) {
			--pico-font-size: calc(var(--font-size) * 1pt);
			font-size: calc(var(--pico-font-size) * var(--font-size-scale));
		}
	}

	ol {
		margin-top: 1em;
		--font-size-scale: 1;
		font-family: var(--font-famaly);
		* {
			--pico-font-size: calc(var(--font-size) * 1pt);
			font-size: calc(var(--pico-font-size) * var(--font-size-scale));
			line-height: calc(var(--pico-line-height) * var(--font-size-scale));
		}
	}
</style>
