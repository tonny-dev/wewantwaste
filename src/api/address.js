export async function searchAddressesAutocomplete(query) {
  // Parse the query to extract postcode and area if possible
  const { postcode, area } = parseLocationQuery(query);

  // First, try the existing WeWantWaste API with the correct endpoint structure
  try {
    let url;
    if (postcode && area) {
      url = `https://app.wewantwaste.co.uk/api/skips/by-location?postcode=${encodeURIComponent(postcode)}&area=${encodeURIComponent(area)}`;
    } else if (postcode) {
      url = `https://app.wewantwaste.co.uk/api/skips/by-location?postcode=${encodeURIComponent(postcode)}`;
    } else {
      // If no postcode detected, try with area or full query
      url = `https://app.wewantwaste.co.uk/api/skips/by-location?area=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : data?.addresses || [];
    }
  } catch (error) {
    console.log(
      "WeWantWaste API not available for autocomplete, using fallback",
    );
  }

  // Fallback to free UK services
  try {
    // Check if it's a postcode search
    const isPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(
      query.trim(),
    );

    if (isPostcode) {
      // Use postcode lookup
      const cleanPostcode = query.replace(/\s+/g, "").toUpperCase();
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${cleanPostcode}`,
      );

      if (response.ok) {
        const data = await response.json();
        const result = data.result;

        return [
          {
            id: `postcode-${cleanPostcode}`,
            line1: "",
            line2: result.admin_ward,
            line3: result.admin_district,
            city: result.admin_county,
            postcode: result.postcode,
            full_address: `${result.admin_ward}, ${result.admin_district}, ${result.admin_county}, ${result.postcode}`,
            type: "postcode_area",
          },
        ];
      }
    } else {
      // For address searches, create mock suggestions based on common UK addresses
      // In production, you'd use services like getAddress.io or findAddress.io
      const mockAddresses = generateMockAddresses(query);
      return mockAddresses;
    }
  } catch (error) {
    throw new Error("Failed to search addresses");
  }

  return [];
}

// Helper function to parse location query into postcode and area components
function parseLocationQuery(query) {
  const postcodeRegex = /([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2})/i;
  const postcodeMatch = query.match(postcodeRegex);

  if (postcodeMatch) {
    const postcode = postcodeMatch[1].replace(/\s+/g, "").toUpperCase();
    const area = query.replace(postcodeRegex, "").trim().replace(/,$/, "");
    return { postcode, area: area || null };
  }

  // If no postcode found, treat entire query as area
  return { postcode: null, area: query.trim() };
}

// Mock address generator for development (replace with real API in production)
function generateMockAddresses(query) {
  const commonStreets = [
    "High Street",
    "Church Lane",
    "Victoria Road",
    "Kings Road",
    "Queen Street",
  ];
  const commonAreas = [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Liverpool",
  ];
  const postcodes = ["SW1A 1AA", "M1 1AA", "B1 1AA", "LS1 1AA", "L1 1AA"];

  if (query.length < 2) return [];

  return commonStreets
    .filter((street) => street.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((street, index) => ({
      id: `mock-${index}`,
      line1: `${Math.floor(Math.random() * 200) + 1} ${street}`,
      line2: "",
      line3: commonAreas[index % commonAreas.length],
      city: commonAreas[index % commonAreas.length],
      postcode: postcodes[index % postcodes.length],
      full_address: `${Math.floor(Math.random() * 200) + 1} ${street}, ${commonAreas[index % commonAreas.length]}, ${postcodes[index % postcodes.length]}`,
      type: "address",
    }));
}

export async function searchAddresses(postcode, area = null) {
  // Updated to support both postcode and area parameters
  try {
    let url = `https://app.wewantwaste.co.uk/api/skips/by-location?postcode=${encodeURIComponent(postcode)}`;
    if (area) {
      url += `&area=${encodeURIComponent(area)}`;
    }

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : data?.addresses || [];
    }
  } catch (error) {
    console.log("WeWantWaste API not available for addresses, using fallback");
  }

  // Fallback to postcodes.io
  try {
    const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${cleanPostcode}`,
    );
    if (!response.ok) {
      throw new Error("Invalid postcode");
    }

    const data = await response.json();
    const result = data.result;

    return [
      {
        id: 1,
        address_line_1: `${result.admin_ward}`,
        address_line_2: result.admin_district,
        city: result.admin_county,
        postcode: result.postcode,
        full_address: `${result.admin_ward}, ${result.admin_district}, ${result.admin_county}, ${result.postcode}`,
      },
    ];
  } catch (error) {
    throw new Error("Failed to find addresses for this postcode");
  }
}

export async function validatePostcode(postcode) {
  const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;
  return postcodeRegex.test(cleanPostcode);
}
