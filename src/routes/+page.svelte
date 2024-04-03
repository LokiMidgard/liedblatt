<script lang="ts">
	import '$lib/default.scss';
	import Score from '$lib/controls/score.svelte';
	import Print from '$lib/controls/print.svelte';
	import type { Book, BookElement, ScoreData } from '$lib/model/booklet';
	import ScoreEditor from '$lib/controls/scoreEditor.svelte';
	import { gotteslob } from '$lib/model/scores';
	import { marked } from 'marked';
	import TextEditor from '$lib/controls/textEditor.svelte';
	import Icon from '$lib/controls/icon.svelte';

	import { definition as textIcon } from '@fortawesome/free-solid-svg-icons/faAlignLeft';
	import { definition as imageIcon } from '@fortawesome/free-solid-svg-icons/faImage';
	import { definition as scoreIcon } from '@fortawesome/free-solid-svg-icons/faMusic';
	import { definition as pagebreakIcon } from '@fortawesome/free-solid-svg-icons/faFile';

	import { definition as floatCenter } from '@fortawesome/free-solid-svg-icons/faAlignCenter';
	import { definition as floatRight } from '@fortawesome/free-solid-svg-icons/faAlignRight';
	import { definition as floatLeft } from '@fortawesome/free-solid-svg-icons/faAlignLeft';

	import ImageEditor from '$lib/controls/imageEditor.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let source: HTMLElement | undefined = $state();

	let book: Book = $state({ elements: [], style: {} });

	let elements = $derived(book?.elements ?? []);

	onMount(() => {
		const data = window.localStorage.getItem('book');
		if (data)
			book = JSON.parse(data) ?? {
				elements: [],
				style: {}
			};
		else {
			book = {
				elements: [],
				style: {}
			};
		}
	});

	$effect(() => {
		if (browser && book) window.localStorage.setItem('book', JSON.stringify(book));
	});
</script>

{#snippet add(i)}
	<div role="group" style="width: min-content;  align-self: flex-end;">
		<button tabindex="-1" class="outline" aria-hidden="true" disabled>Einfügen</button>
		<button
			aria-label="Text Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, { type: 'text', text: '*Neuer Text*', alignment: 'left' });
			}}><Icon icon={textIcon} /></button
		>
		<button
			aria-label="Lied Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, {
					type: 'score',
					lyricsDisplay: [],
					...gotteslob[0],
					showAuthor: true,
					showSpeed: true,
					showTitle: true,
					reference: null
				});
			}}><Icon icon={scoreIcon} /></button
		>
		<button
			aria-label="Bild Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, {
					type: 'image',
					url: '',
					alignment: 'center',
					width: 100,
					rounding: 0,
					float: false
				});
			}}><Icon icon={imageIcon} /></button
		>
		<button
			aria-label="Seitenumbruch Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, { type: 'break' });
			}}><Icon icon={pagebreakIcon} /></button
		>
	</div>
{/snippet}

<main>
	<header>
		<nav>
			<ul>
				<li><strong>Liedblat Generator</strong></li>
			</ul>
			<ul>
				<!-- <li><a href="#">About</a></li>
				<li><a href="#">Services</a></li> -->
				<li>
					<a
						href="#"
						onclick={() => {
							print();
						}}>Drucken</a
					>
				</li>
			</ul>
		</nav>
	</header>
	<div id="edit">
		{@render add(-1)}

		{#each elements as element, i}
			{#if elements[i].type == 'score' && element.type == 'score'}
				<article>
					<header>
						<button
							aria-label="remove"
							onclick={() => {
								elements.splice(i, 1);
							}}
						></button>
						Lied
					</header>
					<ScoreEditor bind:element={elements[i]} />
				</article>
			{:else if elements[i].type == 'break'}
				<article>
					<header>
						<button
							aria-label="remove"
							onclick={() => {
								elements.splice(i, 1);
							}}
						></button>
						Seitenumbruch
					</header>
				</article>
			{:else if elements[i].type == 'image'}
				<article>
					<header>
						<button
							aria-label="remove"
							onclick={() => {
								elements.splice(i, 1);
							}}
						></button>
						Bild
					</header>
					<ImageEditor bind:element={elements[i]} />
				</article>
			{:else if elements[i].type == 'text'}
				<article>
					<header>
						<button
							aria-label="remove"
							onclick={() => {
								elements.splice(i, 1);
							}}
						></button>
						Text
					</header>

					<TextEditor bind:element={elements[i]} />
				</article>
			{/if}
			{@render add(i)}
		{/each}
	</div>
	<div id="view">
		{#if source}
			<Print {source} />
		{/if}
		<!-- <div  bind:this={source}> -->
		<div style="opacity: 0; height: 0; overflow: hidden;" data-hide-print="true" bind:this={source}>
			<div class="pagebreak" />
			{#each elements as element}
				{#if element.type == 'score'}
					<Score score={element} showControls={false} />
				{:else if element.type == 'text'}
					<div style="text-align: {element.alignment};">
						{@html marked.parse(element.text)}
					</div>
				{:else if element.type == 'image'}
					{#if element.float}
						<img
							src={element.url}
							style="width: {element.width}%; float: {element.alignment == 'center'
								? 'none'
								: element.alignment};
                                
                                border-radius: {element.rounding ?? 0}mm;
                                "
						/>
					{:else}
						<div style="display: grid; ">
							<img
								src={element.url}
								style="width: {element.width}%; justify-self: {element.alignment == 'center'
									? 'center'
									: element.alignment == 'left'
										? 'start'
										: element.alignment == 'right'
											? 'end'
											: 'unset'};
                                
                                border-radius: {element.rounding ?? 0}mm;
                                "
							/>
						</div>
					{/if}
				{:else if element.type == 'break'}
					<div class="pagebreak" />
				{/if}
			{/each}
		</div>
	</div>
</main>

<style lang="scss">
	:global(body > svg) {
		@media print {
			display: none !important;
			height: 0 !important;
			width: 0 !important;
		}
	}

	// .addButtons {
	// 	width: min-content;
	// 	align-self: flex-end;
	// 	button {
	// 		padding: 4px 8px;
	// 	}
	// }

	main {
		display: grid;

		height: 100vh;
		@media print {
			height: unset;
		}

		grid-template-rows: 100px 1fr;
		grid-template-columns: 50% 50%;
		grid-template-areas:
			'header header'
			'edit view';
		@media print {
			grid-template-columns: 100%;
			grid-template-columns: 100%;
			grid-template-areas: 'view';
		}
		& > header {
			grid-area: header;
			column-span: all;
			padding: var(--pico-spacing);
			@media print {
				display: none;
			}
		}
		#view,
		#edit {
			padding: var(--pico-spacing);
			overflow-y: auto;
		}

		#edit {
			grid-area: edit;
			display: flex;
			flex-direction: column;
			@media print {
				display: none;
			}
		}
		#view {
			grid-area: view;
			@media print {
				background-color: white;
				color: black;
				padding: 0 !important;
				overflow: visible;
				overflow-y: visible;
			}
			background-color: lightgray;
			// --background: lightgray;
			// background-color: var(--background);
		}
	}
</style>
