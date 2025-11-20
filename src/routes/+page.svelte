<script>
    import ELineChart from "$lib/components/ELineChart.svelte";
    import EGauge from "$lib/components/EGauge.svelte";
    import EBoxplot from "$lib/components/EBoxplot.svelte";
    import ENightingale from "$lib/components/ENightingale.svelte";
    import DSlopeChart from "$lib/components/DSlopeChart.svelte";

    let { data } = $props();

    const monthly = data?.monthly || [];
    const industries = data?.industries || [];
    const occupations = data?.occupations || [];
    const generatedAt = data?.generatedAt;
    const lookbackMonths = data?.lookbackMonths || 0;

    const latest = monthly.length > 0 ? monthly[monthly.length - 1] : {};

    // Track selected metric
    let selectedMetric = $state("unemployment");

    function formatDate(isoString) {
        if (!isoString) return "Loading...";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    // Prepare all data series
    const metrics = {
        unemployment: {
            title: "Unemployment Rate",
            data: monthly.map((d) => ({
                label: `${d.month}/${d.year}`,
                value: d.unemployment_rate,
            })),
            unit: "%",
            max: 10,
            color: "#ee6666", // Red
        },
        minwage: {
            title: "At or Below Minimum Wage",
            data: monthly.map((d) => ({
                label: `${d.month}/${d.year}`,
                value: d.min_wage_pct,
            })),
            unit: "%",
            max: 10,
            color: "#fac858", // Orange/Yellow
        },
        wage: {
            title: "Median Hourly Wage",
            data: monthly.map((d) => ({
                label: `${d.month}/${d.year}`,
                value: d.median_hourly_wage,
            })),
            unit: "$",
            max: 30,
            color: "#91cc75", // Green
        },
        youth: {
            title: "Youth Participation Rate",
            data: monthly.map((d) => ({
                label: `${d.month}/${d.year}`,
                value: d.youth_participation_rate,
            })),
            unit: "%",
            max: 40,
            color: "#5470c6", // Blue
        },
    };

    // Get currently selected metric data
    const selectedData = $derived(metrics[selectedMetric]);

    // Prepare boxplot data using percentiles
    const industryBoxplotData = industries.map((ind) => ({
        name: ind.industry_name,
        min: ind.p10,
        q1: ind.p25,
        q2: ind.p50,
        q3: ind.p75,
        max: ind.p90,
    }));

    const occupationBoxplotData = occupations.map((occ) => ({
        name: occ.occupation_name,
        min: occ.p10,
        q1: occ.p25,
        q2: occ.p50,
        q3: occ.p75,
        max: occ.p90,
    }));

    // Prepare Nightingale chart data for employment
    const industryEmploymentData = industries.map((ind) => ({
        label: ind.industry_name,
        value: ind.avg_monthly_employment,
    }));

    const occupationEmploymentData = occupations.map((occ) => ({
        label: occ.occupation_name,
        value: occ.avg_monthly_employment,
    }));

    // Prepare slope chart data - compare first and last month
    const firstMonth = monthly.length > 0 ? monthly[0] : null;
    const lastMonth = monthly.length > 0 ? monthly[monthly.length - 1] : null;

    const industrySlopeData =
        firstMonth && lastMonth
            ? (firstMonth.unemployment_by_industry || [])
                  .map((startInd) => {
                      const endInd = (
                          lastMonth.unemployment_by_industry || []
                      ).find((i) => i.industry_code === startInd.industry_code);
                      return endInd
                          ? {
                                name: startInd.industry_name,
                                start: startInd.unemployment_rate,
                                end: endInd.unemployment_rate,
                            }
                          : null;
                  })
                  .filter(Boolean)
            : [];

    const occupationSlopeData =
        firstMonth && lastMonth
            ? (firstMonth.unemployment_by_occupation || [])
                  .map((startOcc) => {
                      const endOcc = (
                          lastMonth.unemployment_by_occupation || []
                      ).find(
                          (o) => o.occupation_code === startOcc.occupation_code
                      );
                      return endOcc
                          ? {
                                name: startOcc.occupation_name,
                                start: startOcc.unemployment_rate,
                                end: endOcc.unemployment_rate,
                            }
                          : null;
                  })
                  .filter(Boolean)
            : [];

    const startMonthLabel = firstMonth
        ? `${firstMonth.month}/${firstMonth.year}`
        : "Start";
    const endMonthLabel = lastMonth
        ? `${lastMonth.month}/${lastMonth.year}`
        : "End";
</script>

<svelte:head>
    <title>Labor Market Dashboard</title>
</svelte:head>

<main>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>Labor Market Dashboard</h1>
            <p class="metadata">
                Last updated: {formatDate(generatedAt)} • {lookbackMonths} month
                analysis
            </p>
        </header>

        <!-- Key Metrics Grid - 4 Gauge Charts -->
        <div class="stats-grid">
            <EGauge
                value={latest.unemployment_rate || 0}
                max={metrics.unemployment.max}
                label="Unemployment Rate"
                unit="%"
                color={metrics.unemployment.color}
                isActive={selectedMetric === "unemployment"}
                onclick={() => (selectedMetric = "unemployment")}
            />

            <EGauge
                value={latest.min_wage_pct || 0}
                max={metrics.minwage.max}
                label="At or Below Minimum Wage"
                unit="%"
                color={metrics.minwage.color}
                isActive={selectedMetric === "minwage"}
                onclick={() => (selectedMetric = "minwage")}
            />

            <EGauge
                value={latest.median_hourly_wage || 0}
                max={metrics.wage.max}
                label="Median Hourly Wage"
                unit="$"
                color={metrics.wage.color}
                isActive={selectedMetric === "wage"}
                onclick={() => (selectedMetric = "wage")}
            />

            <EGauge
                value={latest.youth_participation_rate || 0}
                max={metrics.youth.max}
                label="Youth Participation Rate"
                unit="%"
                color={metrics.youth.color}
                isActive={selectedMetric === "youth"}
                onclick={() => (selectedMetric = "youth")}
            />
        </div>

        <!-- Interactive Trend Chart -->
        {#if selectedData && selectedData.data.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <ELineChart
                    data={selectedData.data}
                    title="{selectedData.title} - {lookbackMonths} Month Trend"
                    unit={selectedData.unit}
                    color={selectedData.color}
                />
            </div>
        {/if}

        <!-- Industry Employment -->
        {#if industryEmploymentData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <ENightingale
                    data={industryEmploymentData}
                    title="Employment by Industry"
                />
            </div>
        {/if}

        <!-- Industry Wage Distribution -->
        {#if industryBoxplotData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <EBoxplot
                    data={industryBoxplotData}
                    title="Wage Distribution by Industry"
                />
            </div>
        {/if}

        <!-- Unemployment Change Slope Chart -->
        {#if industrySlopeData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <DSlopeChart
                    data={industrySlopeData}
                    title="Unemployment Rate Change by Industry"
                    startLabel={startMonthLabel}
                    endLabel={endMonthLabel}
                />
            </div>
        {/if}

        <!-- Occupation Employment -->
        {#if occupationEmploymentData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <ENightingale
                    data={occupationEmploymentData}
                    title="Employment by Occupation"
                />
            </div>
        {/if}

        <!-- Occupation Wage Distribution -->
        {#if occupationBoxplotData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <EBoxplot
                    data={occupationBoxplotData}
                    title="Wage Distribution by Occupation"
                />
            </div>
        {/if}

        {#if occupationSlopeData.length > 0}
            <div class="card" style="margin-bottom: 2rem;">
                <DSlopeChart
                    data={occupationSlopeData}
                    title="Unemployment Rate Change by Occupation"
                    startLabel={startMonthLabel}
                    endLabel={endMonthLabel}
                />
            </div>
        {/if}
    </div>
</main>

<style>
    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 4rem 2rem;
    }

    .header {
        text-align: center;
        margin-bottom: 4rem;
    }

    .metadata {
        margin-top: 1rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
