<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { deflate } from 'pako';
	import * as base64 from 'base64-uint8';

	import '$lib/default.scss';
	import type { ScoreData } from '$lib/model/booklet';
	import { getTitle, gotteslob, init, scores, storScore } from '$lib/model/scores.svelte';
	import { onMount } from 'svelte';
	import Print from '$lib/controls/print.svelte';

	let source: HTMLElement | undefined = $state();

	let size = $state(270);

	onMount(() => {
		init();
		// window.customElements.define('qr-code ', );
	});
	async function renderQr(score: ScoreData, size: number) {
		const QRCodeStyling = await import('qr-code-styling-2');
		const json = JSON.stringify(score);
		const ziped = encodeURIComponent(base64.encode(deflate(json)));

		console.debug({
			id: score.id,
			title: getTitle(score),
			json: json.length,
			ziped: ziped.length
		});
		const url = `${$page.url.protocol}//${$page.url.host}${base}/?score=${json.length < ziped.length ? json : ziped}`;

		const qrCode = new QRCodeStyling.default({
			width: size,
			height: size,
			type: 'svg',
			qrOptions: {
				// mode:'Alphanumeric',
				errorCorrectionLevel: 'L'
			},
			data: url,
			// image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
			dotsOptions: {
				color: '#000',
				type: 'classy'
			},
			backgroundOptions: {
				color: '#FFF'
			},
			cornersSquareOptions: {
				type: 'extra-rounded'
			},
			imageOptions: {
				imageSize: size,
				hideBackgroundDots: true,
				margin: 3
			}
		});

		const b = await qrCode.getRawData('svg');
		const svg = await b?.text();
		// hack fix clipping
		const fixed = svg?.replaceAll(
			/\<rect x="\d+" y="\d+" height="\d+" width="\d+"/g,
			`<rect x="0" y="0" height="${size}" width="${size}"`
		);

		return [url, fixed];
	}
</script>

<div class="outer">


<div id="menue">
	<label>
		QrCode Größe
		<input type="number" bind:value={size} />
	</label>
</div>

<div id="view">
	{#if source}
		<Print {source} size="A4" />
	{/if}
	<!-- <div  bind:this={source}> -->
	<div style="opacity: 0; height: 0; overflow: hidden;" data-hide-print="true" bind:this={source}>
		<div class="root">
			{#each scores.filter(x=>x.id) as score}
				{#await renderQr(score, size) then [url, qr]}
					<a href={url}>
						<figure>
							{@html qr}
							<figcaption>
								{getTitle(score, 'omit Id')}
							</figcaption>
						</figure>
					</a>
				{/await}
			{/each}
		</div>
	</div>
</div>
</div>

<style lang="scss">
	#menue {
		@media print {
			display: none;
		}
		min-height: 3em;
		background-color: var(--pico-background-color);
	}
	.root {
		display: flex;
		justify-content: space-between;
	}
	a {
		display: flex;
		justify-content: center;
		justify-items: center;
		flex-direction: column;
		break-inside: avoid;
		border: var(--pico-primary) 1px solid;
		width: min-content;
		padding: 1rem;
	}
	
	.root {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	 :global(html):has(.outer) {
	 	background-color: lightgray;
	 }
	figure {
		width: min-content;
	}
	figcaption {
		font-size: 11pt;
		
	}
</style>
