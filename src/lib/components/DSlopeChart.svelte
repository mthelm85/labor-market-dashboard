<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	
	let { data = [], title = '', startLabel = 'Start', endLabel = 'End' } = $props();
	
	let container = $state();
	let width = $state(928);
	const height = 600;
	const marginTop = 60;
	const marginRight = 180;
	const marginBottom = 40;
	const marginLeft = 250;
	const padding = 3;
	
	// Tooltip state
	let tooltip = $state({ visible: false, x: 0, y: 0, data: null });
	
	// Scales
	const xScale = $derived(
		d3.scalePoint()
			.domain([0, 1])
			.range([marginLeft, width - marginRight])
			.padding(0.5)
	);
	
	const yScale = $derived(
		d3.scaleLinear()
			.domain(d3.extent(data.flatMap(d => [d.start, d.end])))
			.range([height - marginBottom, marginTop])
	);
	
	const lineGenerator = $derived(
		d3.line()
			.x((d, i) => xScale(i))
			.y(d => yScale(d))
	);
	
	// Dodge function to prevent label overlap
	function dodge(positions, separation = 14, maxiter = 10, maxerror = 0.1) {
		positions = Array.from(positions);
		const n = positions.length;
		if (!positions.every(isFinite)) throw new Error('invalid position');
		if (!(n > 1)) return positions;
		
		const index = d3.range(positions.length);
		for (let iter = 0; iter < maxiter; ++iter) {
			index.sort((i, j) => d3.ascending(positions[i], positions[j]));
			let error = 0;
			for (let i = 1; i < n; ++i) {
				let delta = positions[index[i]] - positions[index[i - 1]];
				if (delta < separation) {
					delta = (separation - delta) / 2;
					error = Math.max(error, delta);
					positions[index[i - 1]] -= delta;
					positions[index[i]] += delta;
				}
			}
			if (error < maxerror) break;
		}
		return positions;
	}
	
	// Create dodged label positions
	const leftLabels = $derived.by(() => {
		const positions = data.map(d => yScale(d.start));
		const dodged = dodge(positions);
		return data.map((d, i) => ({
			...d,
			y: dodged[i],
			text: `${d.name} ${d.start.toFixed(1)}%`
		}));
	});
	
	const rightLabels = $derived.by(() => {
		const positions = data.map(d => yScale(d.end));
		const dodged = dodge(positions);
		return data.map((d, i) => ({
			...d,
			y: dodged[i],
			text: `${d.end.toFixed(1)}%`
		}));
	});
	
	function showTooltip(event, item) {
		const rect = container.getBoundingClientRect();
		tooltip = {
			visible: true,
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
			data: item
		};
	}
	
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}
	
	onMount(() => {
		const resizeObserver = new ResizeObserver(() => {
			if (container) width = container.clientWidth;
		});
		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	});
</script>

<div bind:this={container} class="chart-container">
	{#if title}
		<h3 class="chart-title">{title}</h3>
	{/if}
	
	<svg {width} {height}>
		<!-- Axis labels -->
		<g text-anchor="middle">
			<g transform="translate({xScale(0)},20)">
				<text y="0">{startLabel}</text>
				<line y1="3" y2="9" stroke="currentColor" />
			</g>
			<g transform="translate({xScale(1)},20)">
				<text y="0">{endLabel}</text>
				<line y1="3" y2="9" stroke="currentColor" />
			</g>
		</g>
		
		<!-- Group each industry's line and labels together -->
		{#each data as item, idx}
			{@const change = item.end - item.start}
			{@const color = change > 0 ? '#ee6666' : change < 0 ? '#91cc75' : '#64748b'}
			{@const leftLabel = leftLabels[idx]}
			{@const rightLabel = rightLabels[idx]}
			
			<g 
				class="industry-group" 
				style="--line-color: {color}"
				on:mouseenter={(e) => showTooltip(e, item)}
				on:mousemove={(e) => showTooltip(e, item)}
				on:mouseleave={hideTooltip}
			>
				<!-- Line -->
				<path
					d={lineGenerator([item.start, item.end])}
					fill="none"
					stroke={color}
					stroke-width="1.5"
					class="slope-line"
				/>
				
				<!-- Left label -->
				<text 
					x={xScale(0) - padding}
					y={leftLabel.y}
					dy="0.35em"
					text-anchor="end"
					fill={color}
					class="left-label"
				>
					{leftLabel.text}
				</text>
				
				<!-- Right label -->
				<text 
					x={xScale(1) + padding}
					y={rightLabel.y}
					dy="0.35em"
					text-anchor="start"
					fill={color}
					font-weight="600"
					class="right-label"
				>
					{rightLabel.text}
				</text>
			</g>
		{/each}
	</svg>
	
	<!-- Tooltip -->
	{#if tooltip.visible && tooltip.data}
		{@const change = tooltip.data.end - tooltip.data.start}
		{@const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→'}
		{@const changeText = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1)}
		
		<div 
			class="tooltip"
			style="left: {tooltip.x + 10}px; top: {tooltip.y + 10}px;"
		>
			<strong>{tooltip.data.name}</strong><br/>
			{startLabel}: {tooltip.data.start.toFixed(1)}%<br/>
			{endLabel}: {tooltip.data.end.toFixed(1)}%<br/>
			Change: {arrow} {changeText}%
		</div>
	{/if}
</div>

<style>
	.chart-container {
		width: 100%;
		background: #1a1f2e;
		padding: 1.5rem;
		border-radius: 8px;
		position: relative;
	}
	
	.chart-title {
		margin-bottom: 1.5rem;
		color: #e6edf3;
		text-align: center;
		font-size: 18px;
		font-weight: 600;
	}
	
	svg {
		font-family: 'Inter', sans-serif;
		color: #b9bec2;
	}
	
	svg text {
		fill: #e6edf3;
		font-size: 11px;
	}
	
	/* Axis labels */
	svg > g:first-of-type text {
		font-size: 14px;
		font-weight: 600;
		fill: #e6edf3;
	}
	
	svg > g:first-of-type line {
		stroke: #30363d;
		stroke-width: 2;
	}
	
	/* Industry group hover - applies to all children */
	.industry-group {
		cursor: pointer;
		transition: all 0.15s ease;
	}
	
	.industry-group .slope-line {
		opacity: 0.85;
		transition: stroke-width 0.15s ease, opacity 0.15s ease;
	}
	
	.industry-group:hover .slope-line {
		stroke-width: 3.5;
		opacity: 1;
		/* filter: drop-shadow(0 0 6px var(--line-color)); */
	}
	
	.industry-group text {
		transition: font-weight 0.15s ease, font-size 0.15s ease;
	}
	
	.industry-group:hover text {
		font-weight: 700;
		font-size: 12px;
	}
	
	/* Tooltip - matches ECharts style */
	.tooltip {
		position: absolute;
		background: #1a1f2e;
		border: 1px solid #30363d;
		border-radius: 4px;
		padding: 10px 12px;
		color: #e6edf3;
		font-family: 'Inter', sans-serif;
		font-size: 12px;
		pointer-events: none;
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		line-height: 1.6;
		
		/* Smooth animation */
		animation: tooltipFadeIn 0.2s ease-out;
	}
	
	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-5px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
	
	.tooltip strong {
		color: #e6edf3;
		font-weight: 600;
	}
</style>