export async function fetchSkips(postcode = "NR32", area = "Lowestoft") {
  const url = `https://app.wewantwaste.co.uk/api/skips/by-location?postcode=${postcode}&area=${area}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched skips data:", data);

    // Ensure we always return an array
    const skips = Array.isArray(data) ? data : data?.skips || [];

    // Add fallback data if API returns empty
    if (skips.length === 0) {
      return getFallbackSkips();
    }

    return skips;
  } catch (error) {
    console.error("Failed to fetch skips:", error);
    // Return fallback data on error
    return getFallbackSkips();
  }
}

function getFallbackSkips() {
  return [
    {
      id: 1,
      size: 4,
      hire_period_days: 14,
      price_before_vat: 120,
      vat: 20,
      allowed_on_road: true,
      allows_heavy_waste: false,
    },
    {
      id: 2,
      size: 6,
      hire_period_days: 14,
      price_before_vat: 150,
      vat: 20,
      allowed_on_road: true,
      allows_heavy_waste: false,
    },
    {
      id: 3,
      size: 8,
      hire_period_days: 14,
      price_before_vat: 180,
      vat: 20,
      allowed_on_road: true,
      allows_heavy_waste: true,
    },
  ];
}
