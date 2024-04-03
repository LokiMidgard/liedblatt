<script lang="ts">
	import type { BookElement, ScoreData, ScoreElement, ScoreReference } from '$lib/model/booklet';
	import { findScore, getTitle, gotteslob } from '$lib/model/scores';
	import { onMount } from 'svelte';
	import Score from './score.svelte';

	import autocomplete, { type AutocompleteItem } from 'autocompleter';

	let { element = $bindable() }: { element: ScoreElement | undefined } = $props();

	let selected: string | null = $state(null);
	let selectedText: string | undefined = $state();
	let search: HTMLInputElement | undefined = $state();

	function updateText() {
		if (selected) {
			const parsed = JSON.parse(selected) as ScoreReference | undefined;
			const song = findScore(parsed);
			if (song) {
				selectedText = getTitle(song);
			} else {
				selectedText = 'Eigenes Lied';
			}
		} else {
			selectedText = 'Eigenes Lied';
		}
	}

	const items = [
		...gotteslob.map((x) => ({
			value: JSON.stringify(x.reference),
			label: getTitle(x),
			group: 'Gotteslob (2003)'
		})),
		{ value: null, label: 'Eigenes Lied', group: undefined }
	];

	$effect(() => {
		if (search) {
			autocomplete<AutocompleteItem & { value: string | null }>({
				input: search,
				emptyMsg: 'Kein Passendes lied gefunden',
				minLength: 0,
				className: 'scoreSearch',

				// renderGroup:(name, currentValue) =>{
				// 	console.log('group',{name,currentValue})
				// 	return undefined;
				// },
				showOnFocus: true,
				fetch: (text, update) => {
					const filterd = items.filter((x) =>
						x.value?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase())
					);
					console.log('mo', filterd);
					update(
						items.filter((x) => x.label?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase()))
					);
				},
				onSelect: (item) => {
					console.log('select', item);
					selected = item.value;
					updateText();
					if (element && selected !== undefined) {
						const referecne =
							selected === null ? null : (JSON.parse(selected) as ScoreReference | null);
						const source = findScore(referecne);
						element = { ...element, reference: null, ...(source ?? {}) };
					}
				}
			});
		}
	});

	onMount(() => {});
	$effect(() => {
		if (element?.reference) {
			selected = JSON.stringify(element.reference);
		}
		updateText();
		// if (element?.element.type == 'score') selected = element.element ScoreDataent;
	});
</script>

{#if element}
	<header>
		<input class="searchBox" type="search" bind:this={search} bind:value={selectedText} />

		<!-- <select onchange={(e) => change(e)} bind:value={selected} class="js-example-basic-single">
			<optgroup label="Gotteslob">
				{#each gotteslob as entry}
					<option value={JSON.stringify(entry.reference)}>{getTitle(entry)}</option>
				{/each}
			</optgroup>
			<optgroup label="Unterwegs"> </optgroup>
			<option value={null}>Eigenes</option>
		</select> -->
	</header>
	{#if element}
		<Score score={element} showControls={true} />

		<div role="group">
			<span>Skalierung</span><input
				type="number"
				min="0.1"
				max="1.5"
				step="0.05"
				bind:value={element.scale}
			/>
			<input type="range" min="0.1" max="1.5" step="0.05" bind:value={element.scale} />
		</div>
		<div style="display: flex; flex-direction: column;">
			{#each element.lyrics as e, i}
				<div role="group" style="width: min-content;">
					<label aria-disabled="true" style="white-space: nowrap;">
						Strophe {i + 1}
					</label>
					<label>
						Noten
						<input bind:group={element.lyricsDisplay[i]} type="radio" role="button" value="score" />
					</label>
					<label>
						Unter
						<input bind:group={element.lyricsDisplay[i]} type="radio" role="button" value="below" />
					</label>
					<label>
						Ausblenden
						<input
							bind:group={element.lyricsDisplay[i]}
							type="radio"
							role="button"
							value={undefined}
						/>
					</label>
				</div>
			{/each}
		</div>

		<label>
			Titel Anzeigen
			<input type="checkbox" role="switch" bind:checked={element.showTitle} />
		</label>
		<label>
			Author Anzeigen
			<input type="checkbox" role="switch" bind:checked={element.showAuthor} />
		</label>
		<label>
			Geschwindigkeit Anzeigen
			<input type="checkbox" role="switch" bind:checked={element.showSpeed} />
		</label>

		{#if element.reference === null}
			<hr />
			<strong>Eigenes Lied</strong>
			<label>
				Titel
				<input type="text" bind:value={element.title} />
			</label>
			{#if element.author}
				<article>
					<header>
						Autor

						<button
							aria-label="remove"
							style="float: right;"
							onclick={() => {
								if (element) element.author = undefined;
							}}
						></button>
					</header>
					<div role="group">
						<label>
							Musik
							<input type="text" bind:value={element.author.music} />
						</label>
						<label>
							Text
							<input type="text" bind:value={element.author.text} />
						</label>
					</div>
				</article>
			{:else}
				<a
					href="#"
					onclick={() => {
						if (element) element.author = { music: '', text: '' };
					}}>Autor Hinzufügen</a
				>
			{/if}
			<label>
				Basis note der Länge 1 für ABC Notation
				<input style="width: 4em;" type="number" bind:value={element.baseNote[0]} />/
				<input style="width: 4em;" type="number" bind:value={element.baseNote[1]} />
			</label>
			<label>
				Takt
				<input style="width: 4em;" type="number" bind:value={element.timing[0]} />/
				<input style="width: 4em;" type="number" bind:value={element.timing[1]} />
			</label>
			<label>
				Geschwindigkeit
				<input style="width: 4em;" type="number" bind:value={element.speed[0]} />/
				<input style="width: 4em;" type="number" bind:value={element.speed[1]} />=
				<input style="width: 6em;" type="number" bind:value={element.speed[2]} />
			</label>
			<label>
				Tonart
				<select style="width: min-content;" bind:value={element.key}>
					<option>C#</option>
					<option>F#</option>
					<option>B</option>
					<option>E</option>
					<option>A</option>
					<option>D</option>
					<option>G</option>
					<option>C</option>
					<option>F</option>
					<option>Bb</option>
					<option>Eb</option>
					<option>Ab</option>
					<option>Db</option>
					<option>Gb</option>
					<option>Cb</option>
				</select>
			</label>

			<label>
				ABC Notation
				<textarea
					placeholder="Noten in Englischer schreibweise (h=>b, b=>bes). | ist ein Taktstrich"
					bind:value={element.abc}
				/>
			</label>
			<article>
				<header>Lyrics</header>
				{#each element.lyrics as l, i}
					<label>
						Striophe {i + 1}
						<button
							aria-label="remove"
							style="float: right;"
							onclick={() => {
								if (element) {
									element.lyrics.splice(i, 1);
								}
							}}
						></button>
						<textarea
							placeholder="Jedes Wort wird einer Note zugeordnet, Wenn mehre worte einer Note Zugeordente werden sollen so muss ~ anstelle eines Leerzeichens verwendet werden. Soll ein Wort mehre Noten umspannen müssen entsprechend viele - an der Trennstelle eingefügt werden."
							bind:value={element.lyrics[i]}
						/>
					</label>
				{/each}
				<a
					href="#"
					onclick={() => {
						element?.lyrics.push('');
					}}>Strophe Hinzufügen</a
				>
			</article>
		{/if}
		<!-- <input type="range"  min="0.1" max="1.5" step="0.05"   bind:value={element} /> -->
	{/if}
{/if}

<style lang="scss">
	:global(.scoreSearch) {
		background-color: var(--pico-background-color);

		// --pico-background-color: var(--pico-form-element-background-color);
		--pico-border-color: var(--pico-form-element-border-color);
		--pico-color: var(--pico-form-element-color);
		--pico-box-shadow: none;
		border: var(--pico-border-width) solid var(--pico-border-color);
		border-radius: var(--pico-border-radius);
		outline: 0;
		background-color: var(--pico-background-color);
		box-shadow: var(--pico-box-shadow);
		color: var(--pico-color);
		font-weight: var(--pico-font-weight);
		transition:
			background-color var(--pico-transition),
			border-color var(--pico-transition),
			color var(--pico-transition),
			box-shadow var(--pico-transition);

		:global(.group) {
			color: var(--pico-muted-color);
		}
	}
</style>
