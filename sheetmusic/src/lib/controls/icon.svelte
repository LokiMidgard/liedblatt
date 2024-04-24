<script lang="ts">
	import type { IconDefinition, IconPathData } from '@fortawesome/fontawesome-common-types';

	export function joinCss(obj: object, separator = ';') {
		let texts;
		if (Array.isArray(obj)) {
			texts = obj.filter((text) => text);
		} else {
			texts = [];
			for (const prop in obj) {
				if ((obj as any)[prop]) {
					texts.push(`${prop}:${(obj as any)[prop]}`);
				}
			}
		}
		return texts.join(separator);
	}

	type sizeType =
		| 'xs'
		| 'sm'
		| 'lg'
		| '1x'
		| '2x'
		| '3x'
		| '4x'
		| '5x'
		| '6x'
		| '7x'
		| '8x'
		| '9x'
		| '10x'
		| `${number}x`;

	export function getStyles(style: string, size?: sizeType, pull?: 'left' | 'right', fw?: boolean) {
		let float;
		let width;
		const height = '1em';
		let lineHeight;
		let fontSize;
		let textAlign;
		let verticalAlign = '-.125em';
		const overflow = 'visible';

		if (fw) {
			textAlign = 'center';
			width = '1.25em';
		}

		if (pull) {
			float = pull;
		}

		if (size) {
			if (size == 'lg') {
				fontSize = '1.33333em';
				lineHeight = '.75em';
				verticalAlign = '-.225em';
			} else if (size == 'xs') {
				fontSize = '.75em';
			} else if (size == 'sm') {
				fontSize = '.875em';
			} else {
				fontSize = size.replace('x', 'em');
			}
		}

		return joinCss([
			joinCss({
				float,
				width,
				height,
				'line-height': lineHeight,
				'font-size': fontSize,
				'text-align': textAlign,
				'vertical-align': verticalAlign,
				'transform-origin': 'center',
				overflow
			}),
			style
		]);
	}

	export function getTransform(
		scale: number,
		translateX: number,
		translateY: number,
		rotate?: number,
		flip?: 'horizontal' | 'vertical' | 'both',
		translateTimes = 1,
		translateUnit = '',
		rotateUnit = ''
	) {
		let flipX = 1;
		let flipY = 1;

		if (flip) {
			if (flip == 'horizontal') {
				flipX = -1;
			} else if (flip == 'vertical') {
				flipY = -1;
			} else {
				flipX = flipY = -1;
			}
		}

		return joinCss(
			[
				`translate(${translateX * translateTimes}${translateUnit},${translateY * translateTimes}${translateUnit})`,
				`scale(${flipX * scale},${flipY * scale})`,
				rotate && `rotate(${rotate}${rotateUnit})`
			],
			' '
		);
	}

	let clazz = '';
	export { clazz as class };
	export let id = '';
	export let style = '';

	export let icon: IconDefinition;

	export let size: sizeType | undefined = undefined;
	export let color = '';

	export let fw = false;
	export let pull: 'left' | 'right' | undefined = undefined;

	export let scale = 1;
	export let translateX = 0;
	export let translateY = 0;
	export let rotate: number | undefined = undefined;
	export let flip: 'horizontal' | 'vertical' | 'both' | undefined = undefined;

	export let spin = false;
	export let pulse = false;

	// Duotone Icons
	export let primaryColor = '';
	export let secondaryColor = '';
	export let primaryOpacity = 1;
	export let secondaryOpacity = 0.4;
	export let swapOpacity = false;

	let i: [number, number, string[], string, IconPathData];
	let s: string;
	let transform: string;

	$: i = (icon && icon.icon) || [0, 0, [], '', ''];

	$: s = getStyles(style, size, pull, fw);

	$: transform = getTransform(scale, translateX, translateY, rotate, flip, 512);
</script>

{#if i[4]}
	<svg
		id={id || undefined}
		class="svelte-fa {clazz}"
		class:pulse
		class:spin
		style={s}
		viewBox="0 0 {i[0]} {i[1]}"
		aria-hidden="true"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g transform="translate({i[0] / 2} {i[1] / 2})" transform-origin="{i[0] / 4} 0">
			<g {transform}>
				{#if typeof i[4] == 'string'}
					<path
						d={i[4]}
						fill={color || primaryColor || 'currentColor'}
						transform="translate({i[0] / -2} {i[1] / -2})"
					/>
				{:else}
					<!-- Duotone icons -->
					<path
						d={i[4][0]}
						fill={secondaryColor || color || 'currentColor'}
						fill-opacity={swapOpacity != false ? primaryOpacity : secondaryOpacity}
						transform="translate({i[0] / -2} {i[1] / -2})"
					/>
					<path
						d={i[4][1]}
						fill={primaryColor || color || 'currentColor'}
						fill-opacity={swapOpacity != false ? secondaryOpacity : primaryOpacity}
						transform="translate({i[0] / -2} {i[1] / -2})"
					/>
				{/if}
			</g>
		</g>
	</svg>
{/if}

<style>
	.spin {
		animation: spin 2s 0s infinite linear;
	}

	.pulse {
		animation: spin 1s infinite steps(8);
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
