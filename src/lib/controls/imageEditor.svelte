<script lang="ts">
	import type {
		BookElement,
		ScoreData,
		TextElement,
		ScoreReference,
		ImageElement
	} from '$lib/model/booklet';
	import { findScore, getTitle, gotteslob } from '$lib/model/scores.svelte';
	import Score from './score.svelte';

	import { definition as alignCenter } from '@fortawesome/free-solid-svg-icons/faAlignCenter';
	import { definition as alignRight } from '@fortawesome/free-solid-svg-icons/faAlignRight';
	import { definition as alignLeft } from '@fortawesome/free-solid-svg-icons/faAlignLeft';
	import { definition as alignJustify } from '@fortawesome/free-solid-svg-icons/faAlignJustify';
	import Icon from './icon.svelte';

	let { element = $bindable() }: { element: ImageElement | undefined } = $props();
	function handleFileInputChange(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const input = event.currentTarget;
		const file = input.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				if (e.target && e.target.result && element) {
					element.url = e.target.result as string;
				}
			};
			reader.readAsDataURL(file);
		}
	}
</script>

{#if element}
	{#if element.url}
		<img src={element.url} style="max-height: 10rem; margin-bottom: 1rem;" />
		<label role="group">
			<span>Breite</span>
			<input type="number" min="1" max="100" bind:value={element.width} />
			<span>%</span>
			<input type="range" min="1" max="100" bind:value={element.width} />
		</label>
		<label role="group">
			<span>Abgerundete Ecken</span>
			<input type="number" min="1" max="100" bind:value={element.rounding} />
			<span>mm</span>
			<input type="range" min="1" max="100" bind:value={element.rounding} />
		</label>
		<form class="stripe" role="group" style="width: min-content; height: min-content;">
			<label>
				<Icon icon={alignLeft} />
				<input
					bind:group={element.alignment}
					type="radio"
					value="left"
					role="button"
					class="outline"
				/>
			</label>
			<label>
				<Icon icon={alignCenter} />

				<input
					bind:group={element.alignment}
					type="radio"
					value="center"
					role="button"
					class="outline"
				/>
			</label>
			<label>
				<Icon icon={alignRight} />

				<input
					bind:group={element.alignment}
					type="radio"
					value="right"
					role="button"
					class="outline"
				/>
			</label>
			<label>
				Umfließen
				<input
					bind:group={element.float}
					type="checkbox"
					value="right"
					role="button"
					class="outline"
				/>
			</label>
		</form>
	{/if}
	<form role="group">
		<input type="text" placeholder="URL angeben oder Datei Hochladen" bind:value={element.url} />
		<label style="align-content: center;">
			Hochladen
			<input
				role="button"
				onchange={(e) => handleFileInputChange(e)}
				type="file"
				accept="image/png, image/jpeg"
			/>
		</label>
	</form>
{/if}

<style lang="scss">
</style>
