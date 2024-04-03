<script lang="ts">
	import { onMount } from 'svelte';
	import { doPaged } from '$lib/paged';
	import { browser } from '$app/environment';

	let { source }: { source: HTMLElement } = $props();

	const style = `div.printHolder {
  color: black;
  background-color: var(--background);
    margin: 0 auto 0 auto;

}

@page {
  size: A5;
  margin-top: 15mm;
  margin-right: 15mm;
  margin-bottom: 25mm;
  margin-left: 15mm;
  @top-center {
    content: element(titleRunning);
  }
}
.abcjs-inner,
.score {
  height: unset !important;
  overflow: unset !important;
}
.pagebreak {
		break-before: page;
	}
.abcjs-inner > div {
  background-color: red;
//   break-inside: avoid-page;
}

@media screen {
  :root {
    --screen-pages-spacing: 10rem;
    --color-paper: white;
    --background: lightgray;
    --muted-color: #dfdfdf;
    --background-color: white;
  }
  .pagedjs_pages {
    display: flex;
    flex: 0;
    flex-wrap: wrap;
    margin: 0 auto;
    margin-top: var(--screen-pages-spacing);
  }
  .pagedjs_page {
    background: var(--color-paper);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 0 3px rgba(0, 0, 0, 0.6);
    flex-shrink: 0;
    flex-grow: 0;
    margin: auto auto var(--screen-pages-spacing) auto;
  }
}





`;

	let counter = 0;
	let target: HTMLElement[] = [];
	let currntTarget = 0;

	let observer: MutationObserver;
	onMount(() => {
		let lastId: number | undefined;
		observer = new MutationObserver((list, observer) => {
			const current = Math.random();
			lastId = current;
			setTimeout(() => {
				if (current == lastId) updateData();
			}, 200);
		});
	});

	$effect(() => {
		observer.observe(source, {
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true
		});
		updateData();
	});

	async function updateData() {
		if (source?.innerHTML && target && target[0] && target[1] && browser) {
			const nextTarget = (currntTarget + 1) % target.length;
			target[currntTarget].style.height = ``;
			const currentHeight = target[currntTarget].getBoundingClientRect().height;
			// target.forEach((t) => (t.style.height = `${currentHeight}px`));
			target[currntTarget].style.height = `${currentHeight}px`;
			target[currntTarget].style.overflow = 'visible';
			// target[currntTarget].removeAttribute('data-hide-print');

			// target[nextTarget].setAttribute('data-hide-print', 'true');
			target[nextTarget].innerHTML = '';
			target[nextTarget].style.height = '0';
			target[nextTarget].style.overflow = 'hidden';

			document.head.childNodes.forEach((x) => {
				if (x.nodeType == document.ELEMENT_NODE) {
					const element = x as Element;
					const inserted = element.getAttribute('data-pagedjs-inserted-styles');
					if (
						inserted ||
						((element.textContent == null || element.textContent.trim().length == 0) &&
							element.attributes.length == 0)
					) {
						x.parentElement?.removeChild(x);
					}
				}
			});

			try {
				await doPaged(source?.innerHTML!, target[nextTarget], style);
			} catch (error) {
				console.error(error);
				setTimeout(() => {
					updateData();
				}, 200);
			}
			target[nextTarget].style.opacity = '1';
			target[nextTarget].style.height = `${currentHeight}px`;
			target[nextTarget].style.overflow = 'visible';
			// target[nextTarget].removeAttribute('data-hide-print');

			// target[currntTarget].setAttribute('data-hide-print', 'true');
			target[currntTarget].style.opacity = '0';
			target[currntTarget].style.height = '0';
			target[currntTarget].style.overflow = 'hidden';
			// target.forEach((t) => (t.style.height = ``));

			currntTarget = nextTarget;
		}
		counter++;
		if (counter > 10) {
			// return;
		}
		setTimeout(() => {
			// updateData();
		}, 200);
	}
	updateData();
	// $effect(() => {
	// 	setTimeout(() => {
	// 		if (source?.innerHTML && target && browser) {
	// 			console.log('print');
	// 			doPaged(source?.innerHTML!, target,style);
	// 		}
	// 	}, 1000);
	// });
</script>

<div bind:this={target[0]} data-show-print="true" data-theme="light" class="printHolder" />
<div bind:this={target[1]} data-hide-print="true" data-theme="light" class="printHolder" />

<!-- <style lang="scss">
	div.printHolder {
		color: black;
        --background: lightgray;
		background-color: var(--background);
		margin: 0 auto 0 auto;
	}

	@media screen {
		:root {
			--screen-pages-spacing: 10rem;
			--color-paper: white;
			--background: lightgray;
			--muted-color: #dfdfdf;
			--background-color: white;
		}
		.pagedjs_pages {
			display: flex;
			flex: 0;
			flex-wrap: wrap;
			margin: 0 auto;
			margin-top: var(--screen-pages-spacing);
		}
		.pagedjs_page {
			background: var(--color-paper);
			box-shadow:
				0 4px 10px rgba(0, 0, 0, 0.6),
				inset 0 0 3px rgba(0, 0, 0, 0.6);
			flex-shrink: 0;
			flex-grow: 0;
			margin: auto auto var(--screen-pages-spacing) auto;
		}
	}

	@page {
		size: A5;
		margin-top: 15mm;
		margin-right: 15mm;
		margin-bottom: 25mm;
		margin-left: 15mm;
		@top-center {
			content: element(titleRunning);
		}
	}
	:global(.abcjs-inner),
	.score {
		height: unset !important;
		overflow: unset !important;
	}
    :global(.pagebreak) {
		break-before: page;
	}
	:global(.abcjs-inner > div) {
		background-color: red;
		break-inside: avoid-page;
	}
</style> -->

<style lang="scss">
	// :global() {
	div {
		color: black;
		margin: 0 auto 0 auto;
	}

	:global([data-hide-print]) {
		@media print {
			display: none;
		}
	}
	:global([data-show-print]) {
		@media print {
			display: block !important;
			opacity: 1 !important;
			height: unset !important;
		}
	}

	@page {
		size: A5;
		margin-top: 15mm;
		margin-right: 15mm;
		margin-bottom: 25mm;
		margin-left: 15mm;
		@top-center {
			content: element(titleRunning);
		}
	}
	@media print {
		:global(#svelte-announcer) {
			display: none;
		}
	}
	.abcjs-inner,
	.score {
		height: unset !important;
		overflow: unset !important;
	}
	:global(.abcjs-inner > div) {
		break-inside: avoid-page;
	}
	@media screen {
		// @media screen {

		:global(:root) {
			--screen-pages-spacing: 3rem;
			--color-paper: white;
			--background: lightgray;
			--muted-color: #dfdfdf;
			--background-color: white;
			// --color: black;
		}

		:global(.pagedjs_pages) {
			display: flex;
			// max-width: var(--pagedjs-width);
			flex: 0;
			flex-wrap: wrap;
			margin: 0 auto;
			// margin-top: var(--screen-pages-spacing);
		}
		:global(.pagedjs_page) {
			background: var(--color-paper);
			box-shadow:
				0 4px 10px rgba(0, 0, 0, 0.6),
				inset 0 0 3px rgba(0, 0, 0, 0.6);
			flex-shrink: 0;
			flex-grow: 0;
			margin: auto auto var(--screen-pages-spacing) auto;
		}
		// }
	}

	:global(.pagebreak) {
		break-before: always;
	}
</style>
