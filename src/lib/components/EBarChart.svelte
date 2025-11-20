<script>
    import { onMount } from "svelte";
    import * as echarts from "echarts";

    let { data = [], title = "", color = "#06b6d4", unit = "" } = $props();

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
            backgroundColor: "transparent",
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                top: "10%",
                containLabel: true,
            },
            xAxis: {
                type: "value",
                axisLine: {
                    show: false,
                },
                splitLine: {
                    lineStyle: {
                        color: "#30363d",
                        type: "dashed",
                    },
                },
                axisLabel: {
                    color: "#b9bec2",
                    fontSize: 11,
                    fontFamily: "Inter",
                    formatter: function (value) {
                        return unit === "$"
                            ? `${unit}${value}`
                            : `${value}${unit}`;
                    },
                },
            },
            yAxis: {
                type: "category",
                data: data.map((d) => d.label),
                axisLine: {
                    lineStyle: {
                        color: "#30363d",
                    },
                },
                axisLabel: {
                    color: "#b9bec2",
                    fontSize: 11,
                    fontFamily: "Inter",
                },
            },
            series: [
                {
                    data: data.map((d) => d.value),
                    type: "bar",
                    barWidth: "60%",
                    itemStyle: {
                        color: "#2fc2f7",
                        borderRadius: [0, 4, 4, 0],
                    },
                    emphasis: {
                        itemStyle: {
                            color: "#2fc2f7",
                            shadowBlur: 8,
                            shadowColor: "rgba(47, 194, 247, 0.5)",
                        },
                    },
                    label: {
                        show: true,
                        position: "right",
                        color: "#e6edf3",
                        fontFamily: "Inter",
                        fontSize: 11,
                        fontWeight: 500,
                        formatter: function (params) {
                            return unit === "$"
                                ? `${unit}${params.value}`
                                : `${params.value}${unit}`;
                        },
                    },
                },
            ],
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                backgroundColor: "#1a1f2e",
                borderColor: "#30363d",
                borderWidth: 1,
                textStyle: {
                    color: "#e6edf3",
                    fontFamily: "Inter",
                },
                formatter: function (params) {
                    const point = params[0];
                    const formattedValue =
                        unit === "$"
                            ? `${unit}${point.value}`
                            : `${point.value}${unit}`;
                    return `<strong>${point.name}</strong><br/>${formattedValue}`;
                },
            },
            animation: true,
            animationDuration: 800,
            animationEasing: "cubicOut",
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
        height: 400px;
    }
</style>
