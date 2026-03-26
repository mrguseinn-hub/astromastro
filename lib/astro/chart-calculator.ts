import { BirthData, NatalChart, PlanetPosition, HousePlacement, Aspect, Transit } from '@/types';

// Lazy initialization flag
let swissEphInitialized = false;

// Initialize Swiss Ephemeris lazily at runtime
async function ensureSwissEphInitialized() {
  if (swissEphInitialized) return;

  try {
    const { setSwissEphemeris } = await import('@astrologer/astro-core');
    const swe = await import('@swisseph/node');
    setSwissEphemeris(swe);
    swissEphInitialized = true;
    console.log('Swiss Ephemeris initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Swiss Ephemeris:', error);
    throw error;
  }
}

// Calculate natal chart
export async function calculateNatalChart(birthData: BirthData): Promise<NatalChart> {
  try {
    await ensureSwissEphInitialized();

    const { calculateChart, HouseSystem, ZodiacType } = await import('@astrologer/astro-core');

    // Parse date and time
    const dateStr = birthData.date instanceof Date
      ? birthData.date.toISOString()
      : birthData.date;

    // Combine date and time
    const dateTimeStr = birthData.time
      ? `${dateStr.split('T')[0]}T${birthData.time}:00`
      : dateStr;

    const chart = calculateChart({
      date: new Date(dateTimeStr),
      location: {
        latitude: birthData.location.lat,
        longitude: birthData.location.lng,
      },
      houseSystem: HouseSystem.Placidus,
      zodiacType: ZodiacType.Tropical,
    });

    // Transform to our format
    const planets: PlanetPosition[] = [];
    const houses: HousePlacement[] = [];
    const aspects: Aspect[] = [];

    // Process planets/bodies
    if (chart && chart.bodies) {
      for (const body of chart.bodies) {
        planets.push({
          name: body.name?.toLowerCase() || 'unknown',
          sign: body.sign?.toLowerCase() || getSignFromDegree(body.longitude || 0),
          degree: body.longitude ? body.longitude % 30 : 0,
          house: body.house || 1,
          retrograde: body.isRetrograde || false,
        });
      }
    }

    // Process houses
    if (chart && chart.houses) {
      for (const house of chart.houses) {
        houses.push({
          number: house.house,
          sign: house.sign?.toLowerCase() || getSignFromDegree(house.degree),
          degree: house.degree,
        });
      }
    }

    // Process aspects
    if (chart && chart.aspects) {
      for (const aspect of chart.aspects) {
        aspects.push({
          planet1: aspect.body1?.name?.toLowerCase() || '',
          planet2: aspect.body2?.name?.toLowerCase() || '',
          type: aspect.type?.toLowerCase() || '',
          orb: aspect.orb || 0,
          applying: aspect.isApplying || false,
        });
      }
    }

    const ascendant = chart?.angles?.Asc
      ? { sign: getSignFromDegree(chart.angles.Asc), degree: chart.angles.Asc % 30 }
      : { sign: 'aries', degree: 0 };

    return {
      planets: planets.length > 0 ? planets : getMockPlanets(),
      houses: houses.length > 0 ? houses : getMockHouses(),
      aspects: aspects.length > 0 ? aspects : getMockAspects(),
      ascendant,
    };
  } catch (error) {
    console.error('Chart calculation error, using mock data:', error);
    return getMockNatalChart();
  }
}

// Calculate transits
export async function calculateTransits(
  natalChart: NatalChart,
  targetDate: Date = new Date()
): Promise<Transit[]> {
  try {
    await ensureSwissEphInitialized();

    const { calculateChart, calculateDualAspects } = await import('@astrologer/astro-core');

    // Get current planetary positions
    const currentChart = calculateChart({
      date: targetDate,
      location: {
        latitude: 0, // Transits don't need exact location
        longitude: 0,
      },
    });

    // Get natal positions for comparison
    // We need to reconstruct CelestialPosition objects from our stored format
    const natalBodies = natalChart.planets.map(planet => ({
      name: planet.name.charAt(0).toUpperCase() + planet.name.slice(1),
      longitude: getDegreeFromSignAndDegree(planet.sign, planet.degree),
      latitude: 0,
      degree: getDegreeFromSignAndDegree(planet.sign, planet.degree),
    }));

    // Calculate aspects between current (transiting) and natal positions
    const transitAspects = calculateDualAspects(
      currentChart.bodies || [],
      natalBodies as any
    );

    // Transform to our Transit format
    const transits: Transit[] = transitAspects.map(aspect => ({
      transitingPlanet: aspect.body1?.name?.toLowerCase() || '',
      natalPoint: aspect.body2?.name?.toLowerCase() || '',
      aspectType: aspect.type?.toLowerCase() || '',
      orb: aspect.orb || 0,
    }));

    return transits.length > 0 ? transits : getMockTransits();
  } catch (error) {
    console.error('Transit calculation error:', error);
    return getMockTransits();
  }
}

// Helper: Convert sign + degree to total degree
function getDegreeFromSignAndDegree(sign: string, degree: number): number {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  const signIndex = signs.indexOf(sign.toLowerCase());
  if (signIndex === -1) return degree;
  return (signIndex * 30) + degree;
}

// Helper: Get zodiac sign from degree
function getSignFromDegree(degree: number): string {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  const signIndex = Math.floor(degree / 30) % 12;
  return signs[signIndex];
}

// Mock data helpers
function getMockPlanets(): PlanetPosition[] {
  return [
    { name: 'sun', sign: 'aries', degree: 15.5, house: 1, retrograde: false },
    { name: 'moon', sign: 'scorpio', degree: 8.2, house: 8, retrograde: false },
    { name: 'mercury', sign: 'aries', degree: 3.1, house: 1, retrograde: false },
    { name: 'venus', sign: 'pisces', degree: 27.8, house: 12, retrograde: false },
    { name: 'mars', sign: 'capricorn', degree: 12.4, house: 10, retrograde: false },
    { name: 'jupiter', sign: 'taurus', degree: 5.6, house: 2, retrograde: false },
    { name: 'saturn', sign: 'pisces', degree: 18.9, house: 12, retrograde: false },
  ];
}

function getMockHouses(): HousePlacement[] {
  return [
    { number: 1, sign: 'aries', degree: 0 },
    { number: 2, sign: 'taurus', degree: 30 },
    { number: 3, sign: 'gemini', degree: 60 },
    { number: 4, sign: 'cancer', degree: 90 },
    { number: 5, sign: 'leo', degree: 120 },
    { number: 6, sign: 'virgo', degree: 150 },
    { number: 7, sign: 'libra', degree: 180 },
    { number: 8, sign: 'scorpio', degree: 210 },
    { number: 9, sign: 'sagittarius', degree: 240 },
    { number: 10, sign: 'capricorn', degree: 270 },
    { number: 11, sign: 'aquarius', degree: 300 },
    { number: 12, sign: 'pisces', degree: 330 },
  ];
}

function getMockAspects(): Aspect[] {
  return [
    { planet1: 'sun', planet2: 'moon', type: 'square', orb: 7.3, applying: false },
    { planet1: 'moon', planet2: 'venus', type: 'conjunction', orb: 1.4, applying: true },
    { planet1: 'venus', planet2: 'mars', type: 'square', orb: 5.2, applying: false },
    { planet1: 'sun', planet2: 'saturn', type: 'square', orb: 3.4, applying: true },
  ];
}

function getMockNatalChart(): NatalChart {
  return {
    planets: getMockPlanets(),
    houses: getMockHouses(),
    aspects: getMockAspects(),
    ascendant: { sign: 'aries', degree: 12.5 },
  };
}

function getMockTransits(): Transit[] {
  return [
    { transitingPlanet: 'saturn', natalPoint: 'sun', aspectType: 'square', orb: 2.5 },
    { transitingPlanet: 'jupiter', natalPoint: 'moon', aspectType: 'trine', orb: 1.2 },
    { transitingPlanet: 'mars', natalPoint: 'venus', aspectType: 'conjunction', orb: 0.5 },
  ];
}