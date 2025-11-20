<script>
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	
	let { value = 0, max = 100, label = '', unit = '', color = '#2fc2f7', isActive = false, onclick = () => {} } = $props();
	
	let chartContainer = $state();
	let chart = $state();
	
	onMount(() => {
		if (chartContainer) {
			chart = echarts.init(chartContainer);
			updateChart();
			
			const resizeObserver = new ResizeObserver(() => {
				chart?.resize();
			});
			resizeObserver.observe(chartContainer);
			
			return () => {
				resizeObserver.disconnect();
				chart?.dispose();
			};
		}
	});
	
	$effect(() => {
		if (chart) {
			updateChart();
		}
	});
	
	function updateChart() {
		const option = {
			backgroundColor: 'transparent',
			series: [
				{
					type: 'gauge',
					center: ['50%', '70%'],
					startAngle: 180,
					endAngle: 0,
					min: 0,
					max: max,
					radius: '90%',
					splitNumber: 5,
					axisLine: {
						lineStyle: {
							width: 15,
							color: [
								[value/max, color],
								[1, '#30363d']
							]
						}
					},
					pointer: {
						itemStyle: {
							color: color
						},
						width: 4,
						length: '55%'
					},
					axisTick: {
						distance: -15,
						length: 5,
						lineStyle: {
							color: '#8b949e',
							width: 1
						}
					},
					splitLine: {
						distance: -15,
						length: 10,
						lineStyle: {
							color: '#8b949e',
							width: 2
						}
					},
					axisLabel: {
						color: '#b9bec2',
						distance: 25,
						fontSize: 12,
						fontFamily: 'Inter',
						fontWeight: 500
					},
					detail: {
						show: false
					},
					data: [{ value: value }]
				}
			]
		};
		
		chart?.setOption(option);
	}
</script>

<button class="gauge-card" class:active={isActive} {onclick}>
	<div class="gauge-label">{label}</div>
	<div class="gauge-container" bind:this={chartContainer}></div>
	<div class="gauge-value">{unit === '$' ? `${unit}${value}` : `${value}${unit}`}</div>
</button>

<style>
	.gauge-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.5rem;
		position: relative;
		transition: all 0.2s ease;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: inherit;
		width: 100%;
	}
	
	.gauge-card:hover {
		border-color: var(--accent-primary);
	}
	
	.gauge-card.active {
		border-color: var(--accent-primary);
		background: var(--bg-tertiary);
	}
	
	.gauge-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		text-align: center;
		margin-bottom: 0.5rem;
	}
	
	.gauge-container {
		width: 100%;
		height: 160px;
	}
	
	.gauge-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		font-family: 'IBM Plex Sans', sans-serif;
		letter-spacing: -0.025em;
		text-align: center;
	}
</style>