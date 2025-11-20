<script>
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	
	let { data = [], title = '' } = $props();
	
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
		if (chart && data.length > 0) {
			updateChart();
		}
	});
	
	function updateChart() {
		const option = {
			backgroundColor: 'transparent',
			tooltip: {
				trigger: 'item',
				backgroundColor: '#1a1f2e',
				borderColor: '#30363d',
				borderWidth: 1,
				textStyle: {
					color: '#b9bec2',
					fontFamily: 'Inter'
				},
				formatter: function(params) {
					return `<strong>${params.name}</strong><br/>Employment: ${params.value.toLocaleString()}`;
				}
			},
			series: [
				{
					type: 'pie',
					radius: [40, 180],
					center: ['50%', '50%'],
					roseType: 'area',
					itemStyle: {
						borderRadius: 4,
						borderColor: '#1a1f2e',
						borderWidth: 2
					},
					label: {
						show: true,
						position: 'outside',
						color: '#b9bec2',
						fontFamily: 'Inter',
						fontSize: 11,
						formatter: '{b}'
					},
					labelLine: {
						show: true
					},
					data: data.map(d => ({
						value: d.value,
						name: d.label
					})),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		};
		
		chart?.setOption(option);
	}
</script>

<div class="chart-wrapper">
	{#if title}
		<h3 class="chart-title">{title}</h3>
	{/if}
	<div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
	.chart-wrapper {
		width: 100%;
	}
	
	.chart-title {
		margin-bottom: 1rem;
		color: var(--text-primary);
	}
	
	.chart-container {
		width: 100%;
		height: 500px;
	}
</style>