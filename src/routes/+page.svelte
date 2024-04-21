<script lang="ts">
	import '$lib/default.scss';
	import Score from '$lib/controls/score.svelte';
	import Print from '$lib/controls/print.svelte';
	import { inflate } from 'pako';

	import type { Book, BookElement, ScoreData } from '$lib/model/booklet';
	import * as base64 from 'base64-uint8';

	import ScoreEditor from '$lib/controls/scoreEditor.svelte';
	import {
		findScore,
		getTitle,
		gotteslob,
		init,
		newScore,
		storScore
	} from '$lib/model/scores.svelte';
	import { marked } from 'marked';
	import TextEditor from '$lib/controls/textEditor.svelte';
	import Icon from '$lib/controls/icon.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { definition as spaceIcon } from '@fortawesome/free-solid-svg-icons/faUpDown';
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
	import { page } from '$app/stores';
	import { goto, onNavigate } from '$app/navigation';

	let source: HTMLElement | undefined = $state();

	const newBook = () => ({
		id: uuidv4(),
		elements: [],
		title: 'TBD'
	});

	let book: Book = $state(newBook());

	let elements = $derived(book?.elements ?? []);
	let allBooks = $state([] as { id: string; title: string }[]);
	onMount(() => {
		init();
		loadAllBooks();
		loadCurrentId();
		testForScores($page.url);
	});

	function loadAllBooks() {
		const storageLength = window.localStorage.length;
		allBooks = Array.from({ length: storageLength })
			.map((x, i) => window.localStorage.key(i))
			.filter((x): x is string => {
				return x?.startsWith('book-') ?? false;
			})
			.map((x) => {
				const data = JSON.parse(window.localStorage.getItem(x)!) as Book;
				return { title: data?.title, id: data.id };
			})
			.filter((x) => x.id != undefined && x.title != undefined);
	}
	onNavigate(async (e) => {
		if (e.to?.url) {
			testForScores(e.to?.url);
		}
	});

	function testForScores(url: URL) {
		console.log('test for Score');
		const score = url.searchParams.get('score');
		if (score) {
			console.log('loading Score');
			const decodede = decodeURIComponent(score)
			const data = base64.decode(decodede);
			const ziped = inflate(data, { to: 'string' });

			const parsed = JSON.parse(ziped) as ScoreData & Required<Pick<ScoreData, 'id'>>;
			if (parsed.id) {
				const alreadyExists = storScore(parsed, false);
				if (alreadyExists) {
					const currentScore = findScore(parsed.id) as ScoreData & Required<Pick<ScoreData, 'id'>>;
					if (JSON.stringify(currentScore) != JSON.stringify(parsed))
						// if both are equal we do not need to do anythhing.
						override = {
							currentScore,
							newScore: parsed
						};
				}
			}
		}
	}

	let override:
		| undefined
		| {
				currentScore: ScoreData & Required<Pick<ScoreData, 'id'>>;
				newScore: ScoreData & Required<Pick<ScoreData, 'id'>>;
		  };

	function loadCurrentId() {
		const currentId = $page.url.searchParams.get('id');
		console.warn('id', currentId);
		if (currentId) {
			const data = window.localStorage.getItem(`book-${currentId}`);
			if (data) {
				book = JSON.parse(data) ?? { ...newBook(), id: currentId };
			} else {
				book = { ...newBook(), id: currentId };
			}
		} else {
			book =
				(allBooks[0]
					? JSON.parse(window.localStorage.getItem(`book-${allBooks[0].id}`)!)
					: undefined) ?? newBook();
			goto(`?id=${book.id}`);
		}
	}

	$effect(() => {
		if (browser && book) {
			window.localStorage.setItem(`book-${book.id}`, JSON.stringify(book));
			loadAllBooks();
		}
	});
</script>

{#snippet add(i)}
	<div role="group" style="width: min-content;  align-self: flex-end;">
		<button tabindex="-1" class="outline" aria-hidden="true" disabled>Einfügen</button>
		<button
			aria-label="Text Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, {
					type: 'text',
					text: '*Neuer Text*',
					alignment: 'left',
					scale: 100
				});
			}}><Icon icon={textIcon} /></button
		>
		<button
			aria-label="Abstand Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, {
					type: 'space',
					distance: 10
				});
			}}><Icon icon={spaceIcon} /></button
		>
		<button
			aria-label="Lied Einfügen"
			class="outline"
			onclick={() => {
				elements.splice(i + 1, 0, {
					type: 'score',
					lyricsDisplay: ['score'],
					...gotteslob[0],
					showAuthor: false,
					showSpeed: false,
					showTitle: true,
					font: {
						composer: {
							name: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
							size: 9
						},
						voice: {
							name: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
							size: 11
						},
						title: {
							name: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
							size: 21
						}
					}
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

<dialog open={override != undefined}>
	{#if override != undefined}
		{#if override.currentScore.reference && override.currentScore.reference.source == override.newScore.reference?.source && override.currentScore.reference.no == override.newScore.reference?.no && override.currentScore.title == override.newScore.title}
			{getTitle(override.currentScore)}
		{:else}
			{getTitle(override.currentScore)} => {getTitle(override.newScore)}
			<!-- lied hat gleiche Titel-->
		{/if}

		{#if override.currentScore.abc != override.newScore.abc}
			Noten haben sich geändert.
		{:else}
			Noten sind gleichgeblieben.
		{/if}

		{#each Array.from( { length: Math.max(override.currentScore.lyrics.length, override.newScore.lyrics.length) } ) as _, i}
			{#if override.currentScore.lyrics.length < i && override.newScore.lyrics.length < i}
				{#if override.currentScore.lyrics[i] != override.newScore.lyrics[i]}
					Strophe {i + 1} wurde geändert.
				{/if}
			{:else if override.currentScore.lyrics.length < i}
				Strophe {i + 1} wurde gelöscht.
			{:else}
				Strophe {i + 1} wurde hinzugefügt.
			{/if}
		{/each}
		<div role="group">
			<button
				class="outline"
				onclick={()=>{storScore(override!.newScore, true); override==undefined}}
				>Änderungen übernehmen</button
			>
			<button
				class="outline"
				onclick={() => {
					override == undefined;
				}}>Änderungen Verwerfen</button
			>
			<button
				class="outline"
				onclick={() => {storScore({...override!.newScore, id :uuidv4()}, true); override==undefined}}
				>Neue Kopie erstellen</button
			>
		</div>
	{/if}
</dialog>

<main>
	<header>
		<nav>
			<ul>
				<li><strong>Liedblat Generator</strong></li>
			</ul>
			<ul>
				<select
					onchange={async (e) => {
						await goto(`?id=${allBooks[e.currentTarget.selectedIndex]?.id}`);
						loadCurrentId();
					}}
				>
					{#each allBooks as b}
						<option selected={b.id == $page.url.searchParams.get('id')} value={b.id}
							>{b.title}</option
						>
					{/each}
				</select>
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
				<li>
					<a href="export/scores">Lieder Exportieren</a>
				</li>
			</ul>
		</nav>
	</header>
	<div id="edit">
		<input type="text" bind:value={book.title} />
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
			{:else if element.type == 'space'}
				<article>
					<header>
						<button
							aria-label="remove"
							onclick={() => {
								elements.splice(i, 1);
							}}
						></button>
						Abstand
					</header>
					<label role="group">
						<span>Textscalierung</span>
						<input max="200" min="1" type="number" bind:value={element.distance} />
						<span>mm</span>
						<input max="200" min="1" type="range" bind:value={element.distance} />
					</label>
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
			<Print {source} size="A5" />
		{/if}
		<!-- <div  bind:this={source}> -->
		<div style="opacity: 0; height: 0; overflow: hidden;" data-hide-print="true" bind:this={source}>
			<div class="pagebreak" />
			{#each elements as element}
				{#if element.type == 'score'}
					<Score score={element} showControls={false} />
				{:else if element.type == 'space'}
					<div style="height: {element.distance}mm;" />
				{:else if element.type == 'text'}
					<div
						class="markdown"
						style="text-align: {element.alignment}; --font-size-scale: {element.scale};"
					>
						{@html marked.parse(element.text)}
					</div>
				{:else if element.type == 'image'}
					{#if element.float}
						<img
							alt="User defined"
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
								alt="User defined"
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

	@media (max-width: 700px) {
		main {
			grid-template-rows: 100px auto auto;
			grid-template-columns: 100%;
			grid-template-areas:
				'header'
				'edit'
				'view';
			height: unset;
			#view,
			#edit {
				width: calc(100vw - 20px);
				min-width: calc(100vw - 20px);
				max-width: calc(100vw - 20px);
				padding: var(--pico-spacing);
				overflow-y: unset;
				overflow-x: hidden;
			}
			#view {
				overflow-x: auto;
			}
		}
		:root {
			--pico-background-color: red;
		}
	}
</style>
