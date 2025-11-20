export const prerender = true;

export async function load({ fetch }) {
	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/mthelm85/labor-market-data/main/data/labor_stats.json'
		);
		
		if (!response.ok) {
			throw new Error('Failed to fetch labor data');
		}
		
		const data = await response.json();
		
		return {
			monthly: data.monthly || [],
			industries: data.industries || [],
			occupations: data.occupations || [],
			generatedAt: data.generated_at,
			lookbackMonths: data.lookback_months
		};
	} catch (error) {
		console.error('Error loading labor data:', error);
		return {
			monthly: [],
			industries: [],
			occupations: [],
			generatedAt: null,
			lookbackMonths: 0,
			error: error.message
		};
	}
}