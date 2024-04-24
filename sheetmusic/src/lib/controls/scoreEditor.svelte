<script lang="ts">
	import type { BookElement, ScoreData, ScoreElement, ScoreReference } from '$lib/model/booklet';
	import { sources } from '$lib/model/booklet';
	import {
		findScore,
		getTitle,
		gotteslob,
		newScore,
		scores,
		storScore
	} from '$lib/model/scores.svelte';
	import { onMount } from 'svelte';
	import Score from './score.svelte';
	import { v4 as uuidv4 } from 'uuid';

	import autocomplete, { type AutocompleteItem } from 'autocompleter';

	let { element = $bindable() }: { element: ScoreElement | undefined } = $props();

	let selected: string | null = $state(null);
	let selectedText: string | undefined = $state();
	let search: HTMLInputElement | undefined = $state();

	function updateText() {
		if (selected) {
			const parsed = JSON.parse(selected) as ScoreReference | string | undefined;
			const song = findScore(parsed);
			if (song) {
				selectedText = getTitle(song);
			} else {
				selectedText = 'Lied nicht gefunden';
			}
		} else {
			selectedText = 'Lied Nicht gefunden';
		}
	}

	const items = $derived(
		scores.map((x) => ({
			value: JSON.stringify(x.reference ?? x.id),
			label: getTitle(x),
			group: x.reference?.source ?? 'Sonstiges'
		}))
	);

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
				render: (item, currentValue, index): HTMLDivElement | undefined => {
					const option = document.createElement('div');
					if (item.group) {
						option.setAttribute('data-group', item.group);
					}
					option.innerText = item.label ?? '';
					option.role = 'option';
					if (currentValue == item.value) {
						option.ariaSelected = 'true';
					}
					return option;
				},
				showOnFocus: true,
				fetch: (text, update) => {
					const filterd = items.filter((x) =>
						x.value?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase())
					);
					console.log('mo', filterd);
					update(
						items
							.filter((x) => x.label?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase()))
							.sort((a, b) => {
								const groupDiff = a.group.localeCompare(b.group);
								if (groupDiff == 0) {
									return a.label.localeCompare(b.label);
								}
								return groupDiff;
							})
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
						if (source) {
							element = { ...element, id: undefined, ...(source ?? {}) };
						}
					}
				}
			});
		}
	});

	onMount(() => {});
	$effect(() => {
		const c = element;
		if (element?.id) {
			selected = JSON.stringify(element.id);
		} else if (element?.reference) {
			selected = JSON.stringify(element.reference);
		}
		updateText();
		if (c?.id != undefined) {
			storScore(c);
		}
		// if (element?.element.type == 'score') selected = element.element ScoreDataent;
	});
</script>

{#if element}
	<header>
		<input
			class="searchBox"
			type="search"
			onclick={(e) => {
				e.currentTarget.select();
			}}
			bind:this={search}
			bind:value={selectedText}
		/>
		<a
			href="#"
			onclick={() => {
				element = newScore(element);
			}}>Neues Lied eingeben</a
		>
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


		<details open>
			<summary>Noten Layout</summary>
			<label>
				Gesammtbreite
				<input type="number" bind:value={element.width} />
			</label>
			<label>
				Bevorzugte Takte pro Zeile
				<input type="number" bind:value={element.linesettings.preferredMeasuresPerLine} />
			</label>
			<!-- <label>
				Bevorzugte Takte pro Zeile Limt?
				<input type="number" bind:value={element.linesettings.lastLineLimit} />
			</label> -->
			<label>
				Minimaler Noten abstand
				<input type="number" step="0.1" bind:value={element.linesettings.minSpacing} />
			</label>
			<label>
				Maximaler Noten abstand
				<input type="number" step="0.1" bind:value={element.linesettings.maxSpacing} />
			</label>
			<!-- <label>
				Minimaler Abstand Limit
				<input type="number" step="0.1" bind:value={element.linesettings.minSpacingLimit} />
			</label> -->
		</details>

		<div role="group">
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
		</div>
		<details>
			<summary> Liedtext Darstellung</summary>
			<div role="group">
				<label>
					Schrift
					<select bind:value={element.font.voice.name}>
						<option value="'Courier New', Courier, monospace">Courier New</option>
						<option value="'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"
							>Franklin Gothic Medium</option
						>
						<option value="'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
							>Gill Sans</option
						>
						<option
							value="'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
							>Lucida Sans</option
						>
						<option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
						<option value="'Times New Roman', Times, serif">Times New Roman</option>
						<option
							value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif"
							>Trebuchet MS</option
						>
						<option value="Arial, Helvetica, sans-serif">Arial</option>
						<option value="Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
							>Cambria, Cochin</option
						>
						<option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
						<option value="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif">Impact</option
						>
						<option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
					</select>
				</label>
				<label>
					Schriftgröße
					<input type="number" bind:value={element.font.voice.size} />
				</label>
			</div>
		</details>
		{#if element.showAuthor}
			<details>
				<summary> Komponist Darstellung</summary>
				<div role="group">
					<label>
						Schrift
						<select bind:value={element.font.composer.name}>
							<option value="'Courier New', Courier, monospace">Courier New</option>
							<option value="'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"
								>Franklin Gothic Medium</option
							>
							<option value="'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
								>Gill Sans</option
							>
							<option
								value="'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
								>Lucida Sans</option
							>
							<option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
							<option value="'Times New Roman', Times, serif">Times New Roman</option>
							<option
								value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif"
								>Trebuchet MS</option
							>
							<option value="Arial, Helvetica, sans-serif">Arial</option>
							<option value="Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
								>Cambria, Cochin</option
							>
							<option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
							<option value="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
								>Impact</option
							>
							<option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
						</select>
					</label>
					<label>
						Schriftgröße
						<input type="number" bind:value={element.font.composer.size} />
					</label>
				</div>
			</details>
		{/if}
		{#if element.showTitle}
			<details>
				<summary> Titel Darstellung </summary>
				<div role="group">
					<label>
						Titel
						<select bind:value={element.font.title.name}>
							<option value="'Courier New', Courier, monospace">Courier New</option>
							<option value="'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"
								>Franklin Gothic Medium</option
							>
							<option value="'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
								>Gill Sans</option
							>
							<option
								value="'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
								>Lucida Sans</option
							>
							<option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
							<option value="'Times New Roman', Times, serif">Times New Roman</option>
							<option
								value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif"
								>Trebuchet MS</option
							>
							<option value="Arial, Helvetica, sans-serif">Arial</option>
							<option value="Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
								>Cambria, Cochin</option
							>
							<option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
							<option value="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
								>Impact</option
							>
							<option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
						</select>
					</label>
					<label>
						Schriftgröße
						<input type="number" bind:value={element.font.title.size} />
					</label>
				</div>
			</details>
		{/if}

		{#if element.id}
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
			{#if element.reference}
				<article>
					<header>
						Referenz

						<button
							aria-label="remove"
							style="float: right;"
							onclick={() => {
								if (element) element.reference = null;
							}}
						></button>
					</header>
					<div role="group">
						<label>
							Musik

							<select bind:value={element.reference.source}>
								{#each sources as s}
									<option value={s}>{s}</option>
								{/each}
							</select>
						</label>
						<label>
							Text
							<input type="number" bind:value={element.reference.no} />
						</label>
					</div>
				</article>
			{:else}
				<a
					href="#"
					onclick={() => {
						if (element) element.reference = { source: 'Unterwegs', no: 0 };
					}}>Referenz Hinzufügen</a
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
		display: flex;
		z-index: 99;
		position: absolute;
		left: 0;
		flex-direction: column;
		width: 100%;
		min-width: -moz-fit-content;
		min-width: fit-content;
		margin: 0;
		margin-top: var(--pico-outline-width);
		padding: 0;
		border: var(--pico-border-width) solid var(--pico-dropdown-border-color);
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-dropdown-background-color);
		box-shadow: var(--pico-dropdown-box-shadow);
		color: var(--pico-dropdown-color);
		white-space: nowrap;
		transition:
			opacity var(--pico-transition),
			transform 0s ease-in-out 1s;

		:global(*) {
			padding-left: 1em;
		}

		:global(.group) {
			color: var(--pico-muted-color);
		}
		:global([role='option']) {
			cursor: pointer;

			// width: 100%;
			// margin-bottom: 0;
			// padding: calc(var(--pico-form-element-spacing-vertical) * 0.5)
			// 	var(--pico-form-element-spacing-horizontal);
			// list-style: none;

			font-weight: normal;
			display: block;
			min-height: 1.2em;
			padding: 0px 1em 1px;
			white-space: nowrap;

			&:first-of-type {
				margin-top: calc(var(--pico-form-element-spacing-vertical) * 0.5);
			}

			&:hover {
				background: var(--pico-form-element-selected-background-color);
				color: var(--pico-form-element-color);
			}
		}
		:global([data-group]) {
			padding-left: 2em;
		}
		&:not(:has([role='option']:hover)) :global(.selected) {
			background: var(--pico-form-element-selected-background-color);
			color: var(--pico-form-element-color);
		}
	}
</style>
