<script>
    import { onMount } from "svelte";
    import * as echarts from "echarts";

    let { data = [], title = "", color = "#3b82f6", unit = "" } = $props();

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

    // Convert hex to rgba
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

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
            yAxis: {
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
                    formatter: `{value}${unit}`,
                },
            },
            series: [
                {
                    data: data.map((d) => d.value),
                    type: "line",
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 6,
                    lineStyle: {
                        width: 2.5,
                        color: color,
                    },
                    itemStyle: {
                        color: color,
                        borderColor: color,
                        borderWidth: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: hexToRgba(color, 0.3) },
                            { offset: 1, color: hexToRgba(color, 0.05) },
                        ]),
                    },
                    emphasis: {
                        focus: "series",
                        itemStyle: {
                            color: color,
                            borderColor: color,
                            borderWidth: 3,
                            shadowBlur: 8,
                            shadowColor: hexToRgba(color, 0.5),
                        },
                    },
                },
            ],
            tooltip: {
                trigger: "axis",
                backgroundColor: "#1a1f2e",
                borderColor: "#30363d",
                borderWidth: 1,
                textStyle: {
                    color: "#e6edf3",
                    fontFamily: "Inter",
                },
                formatter: function (params) {
                    const point = params[0];
                    return `<strong>${point.name}</strong><br/>${point.value}${unit}`;
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
        height: 350px;
    }
</style>
