<script lang="ts">
	import type { BookElement, ScoreData, TextElement, ScoreReference } from '$lib/model/booklet';
	import { findScore, getTitle, gotteslob } from '$lib/model/scores';
	import Score from './score.svelte';

	import { definition as alignCenter } from '@fortawesome/free-solid-svg-icons/faAlignCenter';
	import { definition as alignRight } from '@fortawesome/free-solid-svg-icons/faAlignRight';
	import { definition as alignLeft } from '@fortawesome/free-solid-svg-icons/faAlignLeft';
	import { definition as alignJustify } from '@fortawesome/free-solid-svg-icons/faAlignJustify';
	import Icon from './icon.svelte';

	let { element = $bindable() }: { element: TextElement | undefined } = $props();

	let selected: string | undefined = $state();
</script>

{#if element}
	<textarea bind:value={element.text} />
	<form role="group" style="width: min-content; height: min-content;">
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
			<Icon icon={alignJustify} />
			<input
				bind:group={element.alignment}
				type="radio"
				value="justify"
				role="button"
				class="outline"
			/>
		</label>
	</form>
{/if}

<style lang="scss">
	
</style>
