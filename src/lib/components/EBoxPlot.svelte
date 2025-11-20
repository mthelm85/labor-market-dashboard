<script>
    import { onMount } from "svelte";
    import * as echarts from "echarts";

    let { data = [], title = "" } = $props();

    let chartContainer = $state();
    let chart = $state();

    onMount(() => {
        if (chartContainer) {
            chart = echarts.init(chartContainer, "dark");
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
        // Prepare boxplot data: [min, q1, q2, q3, max]
        const boxplotData = data.map((d) => [d.min, d.q1, d.q2, d.q3, d.max]);
        const categories = data.map((d) => d.name);

        const option = {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    if (params.componentSubType === "boxplot") {
                        return `<strong>${params.name}</strong><br/>
				90th percentile: $${params.data[5]}<br/>
				75th percentile: $${params.data[4]}<br/>
				Median: $${params.data[3]}<br/>
				25th percentile: $${params.data[2]}<br/>
				10th percentile: $${params.data[1]}`;
                    }
                },
            },
            grid: {
                left: "5%",
                right: "5%",
                bottom: "5%",
                top: "5%",
                containLabel: true,
            },
            xAxis: {
                type: "value",
                axisLabel: {
                    formatter: "${value}",
                },
            },
            yAxis: {
                type: "category",
                data: categories,
                axisLabel: {
                    fontSize: 11,
                },
            },
            series: [
                {
                    name: "Wage Distribution",
                    type: "boxplot",
                    data: boxplotData,
                    itemStyle: {
                        color: "rgba(255, 255, 255, 0.15)",
                        borderColor: "#2fc2f7",
                        borderWidth: 1,
                    },
                },
            ],
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
        height: 600px;
    }
</style>
