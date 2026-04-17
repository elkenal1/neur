/**
 * Populate the cities table with ACS 5-Year demographic data for ~300 major US cities.
 *
 * Run with:
 *   npx tsx scripts/populate-cities.ts
 *
 * Requires env vars:
 *   CENSUS_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL  (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// ─── Load env from .env.local ─────────────────────────────────────────────────
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of envFile.split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) {
        process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '')
      }
    }
  } catch { /* .env.local not found, rely on existing env */ }
}

loadEnv()

const CENSUS_BASE = 'https://api.census.gov/data/2022/acs/acs5'
const CENSUS_KEY = process.env.CENSUS_API_KEY!

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── ACS Variables ────────────────────────────────────────────────────────────
const VARIABLES = [
  'B01003_001E', // Total population
  'B19013_001E', // Median household income
  'B01002_001E', // Median age
  'B23025_004E', // Employed civilian
  'B23025_005E', // Unemployed civilian
  'B25058_001E', // Median contract rent
  'B15003_022E', // Bachelor's degree holders
  'B25003_003E', // Renter occupied housing units
  'B25003_001E', // Total housing units
  'B05001_006E', // Not a US citizen (foreign born proxy)
].join(',')

// ─── State FIPS ───────────────────────────────────────────────────────────────
const STATE_FIPS: Record<string, string> = {
  'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05',
  'California': '06', 'Colorado': '08', 'Connecticut': '09', 'Delaware': '10',
  'Florida': '12', 'Georgia': '13', 'Hawaii': '15', 'Idaho': '16',
  'Illinois': '17', 'Indiana': '18', 'Iowa': '19', 'Kansas': '20',
  'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
  'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28',
  'Missouri': '29', 'Montana': '30', 'Nebraska': '31', 'Nevada': '32',
  'New Hampshire': '33', 'New Jersey': '34', 'New Mexico': '35', 'New York': '36',
  'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39', 'Oklahoma': '40',
  'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
  'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49',
  'Vermont': '50', 'Virginia': '51', 'Washington': '53', 'West Virginia': '54',
  'Wisconsin': '55', 'Wyoming': '56',
}

// ─── City list ────────────────────────────────────────────────────────────────
// Top ~300 US cities by population with approximate center coordinates
const CITIES: { city: string; state: string; stateAbbr: string; lat: number; lng: number }[] = [
  // Alabama
  { city: 'Birmingham',     state: 'Alabama',       stateAbbr: 'AL', lat: 33.5186, lng: -86.8104 },
  { city: 'Montgomery',     state: 'Alabama',       stateAbbr: 'AL', lat: 32.3668, lng: -86.3000 },
  { city: 'Huntsville',     state: 'Alabama',       stateAbbr: 'AL', lat: 34.7304, lng: -86.5861 },
  { city: 'Mobile',         state: 'Alabama',       stateAbbr: 'AL', lat: 30.6954, lng: -88.0399 },
  { city: 'Tuscaloosa',     state: 'Alabama',       stateAbbr: 'AL', lat: 33.2098, lng: -87.5692 },
  // Alaska
  { city: 'Anchorage',      state: 'Alaska',        stateAbbr: 'AK', lat: 61.2181, lng: -149.9003 },
  { city: 'Fairbanks',      state: 'Alaska',        stateAbbr: 'AK', lat: 64.8378, lng: -147.7164 },
  // Arizona
  { city: 'Phoenix',        state: 'Arizona',       stateAbbr: 'AZ', lat: 33.4484, lng: -112.0740 },
  { city: 'Tucson',         state: 'Arizona',       stateAbbr: 'AZ', lat: 32.2226, lng: -110.9747 },
  { city: 'Mesa',           state: 'Arizona',       stateAbbr: 'AZ', lat: 33.4152, lng: -111.8315 },
  { city: 'Chandler',       state: 'Arizona',       stateAbbr: 'AZ', lat: 33.3062, lng: -111.8413 },
  { city: 'Scottsdale',     state: 'Arizona',       stateAbbr: 'AZ', lat: 33.4942, lng: -111.9261 },
  { city: 'Glendale',       state: 'Arizona',       stateAbbr: 'AZ', lat: 33.5387, lng: -112.1860 },
  { city: 'Gilbert',        state: 'Arizona',       stateAbbr: 'AZ', lat: 33.3528, lng: -111.7890 },
  { city: 'Tempe',          state: 'Arizona',       stateAbbr: 'AZ', lat: 33.4255, lng: -111.9400 },
  { city: 'Peoria',         state: 'Arizona',       stateAbbr: 'AZ', lat: 33.5806, lng: -112.2374 },
  { city: 'Surprise',       state: 'Arizona',       stateAbbr: 'AZ', lat: 33.6292, lng: -112.3679 },
  // Arkansas
  { city: 'Little Rock',    state: 'Arkansas',      stateAbbr: 'AR', lat: 34.7465, lng: -92.2896 },
  { city: 'Fort Smith',     state: 'Arkansas',      stateAbbr: 'AR', lat: 35.3859, lng: -94.3985 },
  { city: 'Fayetteville',   state: 'Arkansas',      stateAbbr: 'AR', lat: 36.0626, lng: -94.1574 },
  { city: 'Springdale',     state: 'Arkansas',      stateAbbr: 'AR', lat: 36.1867, lng: -94.1288 },
  // California
  { city: 'Los Angeles',    state: 'California',    stateAbbr: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'San Diego',      state: 'California',    stateAbbr: 'CA', lat: 32.7157, lng: -117.1611 },
  { city: 'San Jose',       state: 'California',    stateAbbr: 'CA', lat: 37.3382, lng: -121.8863 },
  { city: 'San Francisco',  state: 'California',    stateAbbr: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Fresno',         state: 'California',    stateAbbr: 'CA', lat: 36.7378, lng: -119.7871 },
  { city: 'Sacramento',     state: 'California',    stateAbbr: 'CA', lat: 38.5816, lng: -121.4944 },
  { city: 'Long Beach',     state: 'California',    stateAbbr: 'CA', lat: 33.7701, lng: -118.1937 },
  { city: 'Oakland',        state: 'California',    stateAbbr: 'CA', lat: 37.8044, lng: -122.2712 },
  { city: 'Bakersfield',    state: 'California',    stateAbbr: 'CA', lat: 35.3733, lng: -119.0187 },
  { city: 'Anaheim',        state: 'California',    stateAbbr: 'CA', lat: 33.8366, lng: -117.9143 },
  { city: 'Santa Ana',      state: 'California',    stateAbbr: 'CA', lat: 33.7455, lng: -117.8677 },
  { city: 'Riverside',      state: 'California',    stateAbbr: 'CA', lat: 33.9806, lng: -117.3755 },
  { city: 'Stockton',       state: 'California',    stateAbbr: 'CA', lat: 37.9577, lng: -121.2908 },
  { city: 'Chula Vista',    state: 'California',    stateAbbr: 'CA', lat: 32.6401, lng: -117.0842 },
  { city: 'Irvine',         state: 'California',    stateAbbr: 'CA', lat: 33.6846, lng: -117.8265 },
  { city: 'Fremont',        state: 'California',    stateAbbr: 'CA', lat: 37.5485, lng: -121.9886 },
  { city: 'San Bernardino', state: 'California',    stateAbbr: 'CA', lat: 34.1083, lng: -117.2898 },
  { city: 'Modesto',        state: 'California',    stateAbbr: 'CA', lat: 37.6391, lng: -120.9969 },
  { city: 'Fontana',        state: 'California',    stateAbbr: 'CA', lat: 34.0922, lng: -117.4350 },
  { city: 'Moreno Valley',  state: 'California',    stateAbbr: 'CA', lat: 33.9425, lng: -117.2297 },
  { city: 'Huntington Beach', state: 'California',  stateAbbr: 'CA', lat: 33.6595, lng: -117.9988 },
  { city: 'Santa Clarita',  state: 'California',    stateAbbr: 'CA', lat: 34.3917, lng: -118.5426 },
  { city: 'Garden Grove',   state: 'California',    stateAbbr: 'CA', lat: 33.7743, lng: -117.9380 },
  { city: 'Oceanside',      state: 'California',    stateAbbr: 'CA', lat: 33.1959, lng: -117.3795 },
  { city: 'Rancho Cucamonga', state: 'California',  stateAbbr: 'CA', lat: 34.1064, lng: -117.5931 },
  { city: 'Santa Rosa',     state: 'California',    stateAbbr: 'CA', lat: 38.4405, lng: -122.7144 },
  { city: 'Ontario',        state: 'California',    stateAbbr: 'CA', lat: 34.0633, lng: -117.6509 },
  { city: 'Elk Grove',      state: 'California',    stateAbbr: 'CA', lat: 38.4088, lng: -121.3716 },
  { city: 'Corona',         state: 'California',    stateAbbr: 'CA', lat: 33.8753, lng: -117.5664 },
  { city: 'Hayward',        state: 'California',    stateAbbr: 'CA', lat: 37.6688, lng: -122.0808 },
  { city: 'Pomona',         state: 'California',    stateAbbr: 'CA', lat: 34.0552, lng: -117.7500 },
  { city: 'Escondido',      state: 'California',    stateAbbr: 'CA', lat: 33.1192, lng: -117.0864 },
  { city: 'Torrance',       state: 'California',    stateAbbr: 'CA', lat: 33.8358, lng: -118.3406 },
  { city: 'Pasadena',       state: 'California',    stateAbbr: 'CA', lat: 34.1478, lng: -118.1445 },
  { city: 'Roseville',      state: 'California',    stateAbbr: 'CA', lat: 38.7521, lng: -121.2880 },
  { city: 'Sunnyvale',      state: 'California',    stateAbbr: 'CA', lat: 37.3688, lng: -122.0363 },
  { city: 'Orange',         state: 'California',    stateAbbr: 'CA', lat: 33.7879, lng: -117.8531 },
  { city: 'Fullerton',      state: 'California',    stateAbbr: 'CA', lat: 33.8704, lng: -117.9242 },
  // Colorado
  { city: 'Denver',         state: 'Colorado',      stateAbbr: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Colorado Springs', state: 'Colorado',    stateAbbr: 'CO', lat: 38.8339, lng: -104.8214 },
  { city: 'Aurora',         state: 'Colorado',      stateAbbr: 'CO', lat: 39.7294, lng: -104.8319 },
  { city: 'Fort Collins',   state: 'Colorado',      stateAbbr: 'CO', lat: 40.5853, lng: -105.0844 },
  { city: 'Lakewood',       state: 'Colorado',      stateAbbr: 'CO', lat: 39.7047, lng: -105.0814 },
  { city: 'Thornton',       state: 'Colorado',      stateAbbr: 'CO', lat: 39.8680, lng: -104.9719 },
  { city: 'Pueblo',         state: 'Colorado',      stateAbbr: 'CO', lat: 38.2544, lng: -104.6091 },
  // Connecticut
  { city: 'Bridgeport',     state: 'Connecticut',   stateAbbr: 'CT', lat: 41.1865, lng: -73.1952 },
  { city: 'New Haven',      state: 'Connecticut',   stateAbbr: 'CT', lat: 41.3083, lng: -72.9279 },
  { city: 'Stamford',       state: 'Connecticut',   stateAbbr: 'CT', lat: 41.0534, lng: -73.5387 },
  { city: 'Hartford',       state: 'Connecticut',   stateAbbr: 'CT', lat: 41.7637, lng: -72.6851 },
  // Florida
  { city: 'Jacksonville',   state: 'Florida',       stateAbbr: 'FL', lat: 30.3322, lng: -81.6557 },
  { city: 'Miami',          state: 'Florida',       stateAbbr: 'FL', lat: 25.7617, lng: -80.1918 },
  { city: 'Tampa',          state: 'Florida',       stateAbbr: 'FL', lat: 27.9506, lng: -82.4572 },
  { city: 'Orlando',        state: 'Florida',       stateAbbr: 'FL', lat: 28.5383, lng: -81.3792 },
  { city: 'St. Petersburg', state: 'Florida',       stateAbbr: 'FL', lat: 27.7731, lng: -82.6400 },
  { city: 'Hialeah',        state: 'Florida',       stateAbbr: 'FL', lat: 25.8576, lng: -80.2781 },
  { city: 'Port St. Lucie', state: 'Florida',       stateAbbr: 'FL', lat: 27.2730, lng: -80.3582 },
  { city: 'Tallahassee',    state: 'Florida',       stateAbbr: 'FL', lat: 30.4383, lng: -84.2807 },
  { city: 'Fort Lauderdale', state: 'Florida',      stateAbbr: 'FL', lat: 26.1224, lng: -80.1373 },
  { city: 'Cape Coral',     state: 'Florida',       stateAbbr: 'FL', lat: 26.5629, lng: -81.9495 },
  { city: 'Pembroke Pines', state: 'Florida',       stateAbbr: 'FL', lat: 26.0025, lng: -80.2962 },
  { city: 'Hollywood',      state: 'Florida',       stateAbbr: 'FL', lat: 26.0112, lng: -80.1495 },
  { city: 'Gainesville',    state: 'Florida',       stateAbbr: 'FL', lat: 29.6516, lng: -82.3248 },
  { city: 'Coral Springs',  state: 'Florida',       stateAbbr: 'FL', lat: 26.2712, lng: -80.2706 },
  { city: 'Palm Bay',       state: 'Florida',       stateAbbr: 'FL', lat: 28.0345, lng: -80.5887 },
  { city: 'West Palm Beach', state: 'Florida',      stateAbbr: 'FL', lat: 26.7153, lng: -80.0534 },
  { city: 'Clearwater',     state: 'Florida',       stateAbbr: 'FL', lat: 27.9659, lng: -82.8001 },
  { city: 'Lakeland',       state: 'Florida',       stateAbbr: 'FL', lat: 28.0395, lng: -81.9498 },
  { city: 'Pompano Beach',  state: 'Florida',       stateAbbr: 'FL', lat: 26.2379, lng: -80.1248 },
  { city: 'Miramar',        state: 'Florida',       stateAbbr: 'FL', lat: 25.9860, lng: -80.2326 },
  // Georgia
  { city: 'Atlanta',        state: 'Georgia',       stateAbbr: 'GA', lat: 33.7490, lng: -84.3880 },
  { city: 'Columbus',       state: 'Georgia',       stateAbbr: 'GA', lat: 32.4610, lng: -84.9877 },
  { city: 'Augusta',        state: 'Georgia',       stateAbbr: 'GA', lat: 33.4735, lng: -82.0105 },
  { city: 'Savannah',       state: 'Georgia',       stateAbbr: 'GA', lat: 32.0835, lng: -81.0998 },
  { city: 'Athens',         state: 'Georgia',       stateAbbr: 'GA', lat: 33.9519, lng: -83.3576 },
  { city: 'Sandy Springs',  state: 'Georgia',       stateAbbr: 'GA', lat: 33.9240, lng: -84.3788 },
  { city: 'Roswell',        state: 'Georgia',       stateAbbr: 'GA', lat: 34.0232, lng: -84.3616 },
  // Hawaii
  { city: 'Honolulu',       state: 'Hawaii',        stateAbbr: 'HI', lat: 21.3069, lng: -157.8583 },
  // Idaho
  { city: 'Boise',          state: 'Idaho',         stateAbbr: 'ID', lat: 43.6150, lng: -116.2023 },
  { city: 'Nampa',          state: 'Idaho',         stateAbbr: 'ID', lat: 43.5407, lng: -116.5635 },
  { city: 'Meridian',       state: 'Idaho',         stateAbbr: 'ID', lat: 43.6121, lng: -116.3915 },
  // Illinois
  { city: 'Chicago',        state: 'Illinois',      stateAbbr: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Aurora',         state: 'Illinois',      stateAbbr: 'IL', lat: 41.7606, lng: -88.3201 },
  { city: 'Joliet',         state: 'Illinois',      stateAbbr: 'IL', lat: 41.5250, lng: -88.0817 },
  { city: 'Naperville',     state: 'Illinois',      stateAbbr: 'IL', lat: 41.7508, lng: -88.1535 },
  { city: 'Rockford',       state: 'Illinois',      stateAbbr: 'IL', lat: 42.2711, lng: -89.0940 },
  { city: 'Springfield',    state: 'Illinois',      stateAbbr: 'IL', lat: 39.7817, lng: -89.6501 },
  { city: 'Peoria',         state: 'Illinois',      stateAbbr: 'IL', lat: 40.6936, lng: -89.5890 },
  // Indiana
  { city: 'Indianapolis',   state: 'Indiana',       stateAbbr: 'IN', lat: 39.7684, lng: -86.1581 },
  { city: 'Fort Wayne',     state: 'Indiana',       stateAbbr: 'IN', lat: 41.0793, lng: -85.1394 },
  { city: 'Evansville',     state: 'Indiana',       stateAbbr: 'IN', lat: 37.9716, lng: -87.5711 },
  { city: 'South Bend',     state: 'Indiana',       stateAbbr: 'IN', lat: 41.6764, lng: -86.2520 },
  { city: 'Carmel',         state: 'Indiana',       stateAbbr: 'IN', lat: 39.9784, lng: -86.1180 },
  { city: 'Fishers',        state: 'Indiana',       stateAbbr: 'IN', lat: 39.9567, lng: -85.9669 },
  // Iowa
  { city: 'Des Moines',     state: 'Iowa',          stateAbbr: 'IA', lat: 41.5868, lng: -93.6250 },
  { city: 'Cedar Rapids',   state: 'Iowa',          stateAbbr: 'IA', lat: 41.9779, lng: -91.6656 },
  { city: 'Davenport',      state: 'Iowa',          stateAbbr: 'IA', lat: 41.5236, lng: -90.5776 },
  { city: 'Sioux City',     state: 'Iowa',          stateAbbr: 'IA', lat: 42.4999, lng: -96.4003 },
  { city: 'Iowa City',      state: 'Iowa',          stateAbbr: 'IA', lat: 41.6611, lng: -91.5302 },
  // Kansas
  { city: 'Wichita',        state: 'Kansas',        stateAbbr: 'KS', lat: 37.6872, lng: -97.3301 },
  { city: 'Overland Park',  state: 'Kansas',        stateAbbr: 'KS', lat: 38.9822, lng: -94.6708 },
  { city: 'Kansas City',    state: 'Kansas',        stateAbbr: 'KS', lat: 39.1141, lng: -94.6275 },
  { city: 'Topeka',         state: 'Kansas',        stateAbbr: 'KS', lat: 39.0473, lng: -95.6752 },
  { city: 'Olathe',         state: 'Kansas',        stateAbbr: 'KS', lat: 38.8814, lng: -94.8191 },
  // Kentucky
  { city: 'Louisville',     state: 'Kentucky',      stateAbbr: 'KY', lat: 38.2527, lng: -85.7585 },
  { city: 'Lexington',      state: 'Kentucky',      stateAbbr: 'KY', lat: 38.0406, lng: -84.5037 },
  { city: 'Bowling Green',  state: 'Kentucky',      stateAbbr: 'KY', lat: 36.9685, lng: -86.4808 },
  // Louisiana
  { city: 'New Orleans',    state: 'Louisiana',     stateAbbr: 'LA', lat: 29.9511, lng: -90.0715 },
  { city: 'Baton Rouge',    state: 'Louisiana',     stateAbbr: 'LA', lat: 30.4515, lng: -91.1871 },
  { city: 'Shreveport',     state: 'Louisiana',     stateAbbr: 'LA', lat: 32.5252, lng: -93.7502 },
  { city: 'Lafayette',      state: 'Louisiana',     stateAbbr: 'LA', lat: 30.2241, lng: -92.0198 },
  // Maine
  { city: 'Portland',       state: 'Maine',         stateAbbr: 'ME', lat: 43.6591, lng: -70.2568 },
  // Maryland
  { city: 'Baltimore',      state: 'Maryland',      stateAbbr: 'MD', lat: 39.2904, lng: -76.6122 },
  { city: 'Frederick',      state: 'Maryland',      stateAbbr: 'MD', lat: 39.4143, lng: -77.4105 },
  { city: 'Rockville',      state: 'Maryland',      stateAbbr: 'MD', lat: 39.0840, lng: -77.1528 },
  { city: 'Gaithersburg',   state: 'Maryland',      stateAbbr: 'MD', lat: 39.1434, lng: -77.2014 },
  // Massachusetts
  { city: 'Boston',         state: 'Massachusetts', stateAbbr: 'MA', lat: 42.3601, lng: -71.0589 },
  { city: 'Worcester',      state: 'Massachusetts', stateAbbr: 'MA', lat: 42.2626, lng: -71.8023 },
  { city: 'Springfield',    state: 'Massachusetts', stateAbbr: 'MA', lat: 42.1015, lng: -72.5898 },
  { city: 'Lowell',         state: 'Massachusetts', stateAbbr: 'MA', lat: 42.6334, lng: -71.3162 },
  { city: 'Cambridge',      state: 'Massachusetts', stateAbbr: 'MA', lat: 42.3736, lng: -71.1097 },
  { city: 'New Bedford',    state: 'Massachusetts', stateAbbr: 'MA', lat: 41.6362, lng: -70.9342 },
  { city: 'Brockton',       state: 'Massachusetts', stateAbbr: 'MA', lat: 42.0834, lng: -71.0184 },
  { city: 'Quincy',         state: 'Massachusetts', stateAbbr: 'MA', lat: 42.2529, lng: -71.0023 },
  // Michigan
  { city: 'Detroit',        state: 'Michigan',      stateAbbr: 'MI', lat: 42.3314, lng: -83.0458 },
  { city: 'Grand Rapids',   state: 'Michigan',      stateAbbr: 'MI', lat: 42.9634, lng: -85.6681 },
  { city: 'Warren',         state: 'Michigan',      stateAbbr: 'MI', lat: 42.5145, lng: -83.0147 },
  { city: 'Sterling Heights', state: 'Michigan',    stateAbbr: 'MI', lat: 42.5803, lng: -83.0302 },
  { city: 'Ann Arbor',      state: 'Michigan',      stateAbbr: 'MI', lat: 42.2808, lng: -83.7430 },
  { city: 'Lansing',        state: 'Michigan',      stateAbbr: 'MI', lat: 42.7325, lng: -84.5555 },
  { city: 'Flint',          state: 'Michigan',      stateAbbr: 'MI', lat: 43.0125, lng: -83.6875 },
  { city: 'Dearborn',       state: 'Michigan',      stateAbbr: 'MI', lat: 42.3223, lng: -83.1763 },
  { city: 'Livonia',        state: 'Michigan',      stateAbbr: 'MI', lat: 42.3684, lng: -83.3527 },
  // Minnesota
  { city: 'Minneapolis',    state: 'Minnesota',     stateAbbr: 'MN', lat: 44.9778, lng: -93.2650 },
  { city: 'St. Paul',       state: 'Minnesota',     stateAbbr: 'MN', lat: 44.9537, lng: -93.0900 },
  { city: 'Rochester',      state: 'Minnesota',     stateAbbr: 'MN', lat: 44.0121, lng: -92.4802 },
  { city: 'Duluth',         state: 'Minnesota',     stateAbbr: 'MN', lat: 46.7867, lng: -92.1005 },
  { city: 'Brooklyn Park',  state: 'Minnesota',     stateAbbr: 'MN', lat: 45.0941, lng: -93.3563 },
  { city: 'Plymouth',       state: 'Minnesota',     stateAbbr: 'MN', lat: 45.0105, lng: -93.4555 },
  { city: 'Bloomington',    state: 'Minnesota',     stateAbbr: 'MN', lat: 44.8408, lng: -93.3777 },
  // Mississippi
  { city: 'Jackson',        state: 'Mississippi',   stateAbbr: 'MS', lat: 32.2988, lng: -90.1848 },
  { city: 'Gulfport',       state: 'Mississippi',   stateAbbr: 'MS', lat: 30.3674, lng: -89.0928 },
  { city: 'Hattiesburg',    state: 'Mississippi',   stateAbbr: 'MS', lat: 31.3271, lng: -89.2903 },
  // Missouri
  { city: 'Kansas City',    state: 'Missouri',      stateAbbr: 'MO', lat: 39.0997, lng: -94.5786 },
  { city: 'St. Louis',      state: 'Missouri',      stateAbbr: 'MO', lat: 38.6270, lng: -90.1994 },
  { city: 'Springfield',    state: 'Missouri',      stateAbbr: 'MO', lat: 37.2090, lng: -93.2923 },
  { city: 'Independence',   state: 'Missouri',      stateAbbr: 'MO', lat: 39.0911, lng: -94.4155 },
  { city: 'Columbia',       state: 'Missouri',      stateAbbr: 'MO', lat: 38.9517, lng: -92.3341 },
  // Montana
  { city: 'Billings',       state: 'Montana',       stateAbbr: 'MT', lat: 45.7833, lng: -108.5007 },
  { city: 'Missoula',       state: 'Montana',       stateAbbr: 'MT', lat: 46.8721, lng: -113.9940 },
  { city: 'Bozeman',        state: 'Montana',       stateAbbr: 'MT', lat: 45.6770, lng: -111.0429 },
  // Nebraska
  { city: 'Omaha',          state: 'Nebraska',      stateAbbr: 'NE', lat: 41.2565, lng: -95.9345 },
  { city: 'Lincoln',        state: 'Nebraska',      stateAbbr: 'NE', lat: 40.8136, lng: -96.7026 },
  { city: 'Bellevue',       state: 'Nebraska',      stateAbbr: 'NE', lat: 41.1538, lng: -95.9145 },
  // Nevada
  { city: 'Las Vegas',      state: 'Nevada',        stateAbbr: 'NV', lat: 36.1699, lng: -115.1398 },
  { city: 'Henderson',      state: 'Nevada',        stateAbbr: 'NV', lat: 36.0395, lng: -114.9817 },
  { city: 'Reno',           state: 'Nevada',        stateAbbr: 'NV', lat: 39.5296, lng: -119.8138 },
  { city: 'North Las Vegas', state: 'Nevada',       stateAbbr: 'NV', lat: 36.1989, lng: -115.1175 },
  { city: 'Sparks',         state: 'Nevada',        stateAbbr: 'NV', lat: 39.5349, lng: -119.7527 },
  // New Hampshire
  { city: 'Manchester',     state: 'New Hampshire', stateAbbr: 'NH', lat: 42.9956, lng: -71.4548 },
  { city: 'Nashua',         state: 'New Hampshire', stateAbbr: 'NH', lat: 42.7654, lng: -71.4676 },
  // New Jersey
  { city: 'Newark',         state: 'New Jersey',    stateAbbr: 'NJ', lat: 40.7357, lng: -74.1724 },
  { city: 'Jersey City',    state: 'New Jersey',    stateAbbr: 'NJ', lat: 40.7282, lng: -74.0776 },
  { city: 'Paterson',       state: 'New Jersey',    stateAbbr: 'NJ', lat: 40.9168, lng: -74.1718 },
  { city: 'Elizabeth',      state: 'New Jersey',    stateAbbr: 'NJ', lat: 40.6640, lng: -74.2107 },
  { city: 'Trenton',        state: 'New Jersey',    stateAbbr: 'NJ', lat: 40.2170, lng: -74.7429 },
  // New Mexico
  { city: 'Albuquerque',    state: 'New Mexico',    stateAbbr: 'NM', lat: 35.0844, lng: -106.6504 },
  { city: 'Las Cruces',     state: 'New Mexico',    stateAbbr: 'NM', lat: 32.3199, lng: -106.7637 },
  { city: 'Rio Rancho',     state: 'New Mexico',    stateAbbr: 'NM', lat: 35.2328, lng: -106.6630 },
  { city: 'Santa Fe',       state: 'New Mexico',    stateAbbr: 'NM', lat: 35.6870, lng: -105.9378 },
  // New York
  { city: 'New York',       state: 'New York',      stateAbbr: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Buffalo',        state: 'New York',      stateAbbr: 'NY', lat: 42.8864, lng: -78.8784 },
  { city: 'Rochester',      state: 'New York',      stateAbbr: 'NY', lat: 43.1566, lng: -77.6088 },
  { city: 'Yonkers',        state: 'New York',      stateAbbr: 'NY', lat: 40.9312, lng: -73.8988 },
  { city: 'Syracuse',       state: 'New York',      stateAbbr: 'NY', lat: 43.0481, lng: -76.1474 },
  { city: 'Albany',         state: 'New York',      stateAbbr: 'NY', lat: 42.6526, lng: -73.7562 },
  // North Carolina
  { city: 'Charlotte',      state: 'North Carolina', stateAbbr: 'NC', lat: 35.2271, lng: -80.8431 },
  { city: 'Raleigh',        state: 'North Carolina', stateAbbr: 'NC', lat: 35.7796, lng: -78.6382 },
  { city: 'Greensboro',     state: 'North Carolina', stateAbbr: 'NC', lat: 36.0726, lng: -79.7920 },
  { city: 'Durham',         state: 'North Carolina', stateAbbr: 'NC', lat: 35.9940, lng: -78.8986 },
  { city: 'Winston-Salem',  state: 'North Carolina', stateAbbr: 'NC', lat: 36.0999, lng: -80.2442 },
  { city: 'Fayetteville',   state: 'North Carolina', stateAbbr: 'NC', lat: 35.0527, lng: -78.8784 },
  { city: 'Cary',           state: 'North Carolina', stateAbbr: 'NC', lat: 35.7915, lng: -78.7811 },
  { city: 'Wilmington',     state: 'North Carolina', stateAbbr: 'NC', lat: 34.2257, lng: -77.9447 },
  { city: 'High Point',     state: 'North Carolina', stateAbbr: 'NC', lat: 35.9557, lng: -80.0053 },
  { city: 'Concord',        state: 'North Carolina', stateAbbr: 'NC', lat: 35.4088, lng: -80.5795 },
  // North Dakota
  { city: 'Fargo',          state: 'North Dakota',  stateAbbr: 'ND', lat: 46.8772, lng: -96.7898 },
  { city: 'Bismarck',       state: 'North Dakota',  stateAbbr: 'ND', lat: 46.8083, lng: -100.7837 },
  // Ohio
  { city: 'Columbus',       state: 'Ohio',          stateAbbr: 'OH', lat: 39.9612, lng: -82.9988 },
  { city: 'Cleveland',      state: 'Ohio',          stateAbbr: 'OH', lat: 41.4993, lng: -81.6944 },
  { city: 'Cincinnati',     state: 'Ohio',          stateAbbr: 'OH', lat: 39.1031, lng: -84.5120 },
  { city: 'Toledo',         state: 'Ohio',          stateAbbr: 'OH', lat: 41.6528, lng: -83.5379 },
  { city: 'Akron',          state: 'Ohio',          stateAbbr: 'OH', lat: 41.0814, lng: -81.5190 },
  { city: 'Dayton',         state: 'Ohio',          stateAbbr: 'OH', lat: 39.7589, lng: -84.1916 },
  // Oklahoma
  { city: 'Oklahoma City',  state: 'Oklahoma',      stateAbbr: 'OK', lat: 35.4676, lng: -97.5164 },
  { city: 'Tulsa',          state: 'Oklahoma',      stateAbbr: 'OK', lat: 36.1540, lng: -95.9928 },
  { city: 'Norman',         state: 'Oklahoma',      stateAbbr: 'OK', lat: 35.2226, lng: -97.4395 },
  { city: 'Broken Arrow',   state: 'Oklahoma',      stateAbbr: 'OK', lat: 36.0609, lng: -95.7975 },
  { city: 'Edmond',         state: 'Oklahoma',      stateAbbr: 'OK', lat: 35.6528, lng: -97.4781 },
  // Oregon
  { city: 'Portland',       state: 'Oregon',        stateAbbr: 'OR', lat: 45.5051, lng: -122.6750 },
  { city: 'Eugene',         state: 'Oregon',        stateAbbr: 'OR', lat: 44.0521, lng: -123.0868 },
  { city: 'Salem',          state: 'Oregon',        stateAbbr: 'OR', lat: 44.9429, lng: -123.0351 },
  { city: 'Gresham',        state: 'Oregon',        stateAbbr: 'OR', lat: 45.5001, lng: -122.4302 },
  { city: 'Hillsboro',      state: 'Oregon',        stateAbbr: 'OR', lat: 45.5229, lng: -122.9898 },
  { city: 'Bend',           state: 'Oregon',        stateAbbr: 'OR', lat: 44.0582, lng: -121.3153 },
  // Pennsylvania
  { city: 'Philadelphia',   state: 'Pennsylvania',  stateAbbr: 'PA', lat: 39.9526, lng: -75.1652 },
  { city: 'Pittsburgh',     state: 'Pennsylvania',  stateAbbr: 'PA', lat: 40.4406, lng: -79.9959 },
  { city: 'Allentown',      state: 'Pennsylvania',  stateAbbr: 'PA', lat: 40.6084, lng: -75.4902 },
  { city: 'Erie',           state: 'Pennsylvania',  stateAbbr: 'PA', lat: 42.1292, lng: -80.0851 },
  { city: 'Reading',        state: 'Pennsylvania',  stateAbbr: 'PA', lat: 40.3356, lng: -75.9269 },
  { city: 'Scranton',       state: 'Pennsylvania',  stateAbbr: 'PA', lat: 41.4090, lng: -75.6624 },
  // Rhode Island
  { city: 'Providence',     state: 'Rhode Island',  stateAbbr: 'RI', lat: 41.8240, lng: -71.4128 },
  { city: 'Warwick',        state: 'Rhode Island',  stateAbbr: 'RI', lat: 41.7001, lng: -71.4162 },
  { city: 'Cranston',       state: 'Rhode Island',  stateAbbr: 'RI', lat: 41.7798, lng: -71.4373 },
  // South Carolina
  { city: 'Columbia',       state: 'South Carolina', stateAbbr: 'SC', lat: 34.0007, lng: -81.0348 },
  { city: 'Charleston',     state: 'South Carolina', stateAbbr: 'SC', lat: 32.7765, lng: -79.9311 },
  { city: 'North Charleston', state: 'South Carolina', stateAbbr: 'SC', lat: 32.8546, lng: -79.9748 },
  { city: 'Mount Pleasant', state: 'South Carolina', stateAbbr: 'SC', lat: 32.8323, lng: -79.8284 },
  { city: 'Rock Hill',      state: 'South Carolina', stateAbbr: 'SC', lat: 34.9249, lng: -81.0251 },
  { city: 'Greenville',     state: 'South Carolina', stateAbbr: 'SC', lat: 34.8526, lng: -82.3940 },
  // South Dakota
  { city: 'Sioux Falls',    state: 'South Dakota',  stateAbbr: 'SD', lat: 43.5460, lng: -96.7313 },
  { city: 'Rapid City',     state: 'South Dakota',  stateAbbr: 'SD', lat: 44.0805, lng: -103.2310 },
  // Tennessee
  { city: 'Memphis',        state: 'Tennessee',     stateAbbr: 'TN', lat: 35.1495, lng: -90.0490 },
  { city: 'Nashville',      state: 'Tennessee',     stateAbbr: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Knoxville',      state: 'Tennessee',     stateAbbr: 'TN', lat: 35.9606, lng: -83.9207 },
  { city: 'Chattanooga',    state: 'Tennessee',     stateAbbr: 'TN', lat: 35.0456, lng: -85.3097 },
  { city: 'Clarksville',    state: 'Tennessee',     stateAbbr: 'TN', lat: 36.5298, lng: -87.3595 },
  { city: 'Murfreesboro',   state: 'Tennessee',     stateAbbr: 'TN', lat: 35.8456, lng: -86.3903 },
  // Texas
  { city: 'Houston',        state: 'Texas',         stateAbbr: 'TX', lat: 29.7604, lng: -95.3698 },
  { city: 'San Antonio',    state: 'Texas',         stateAbbr: 'TX', lat: 29.4241, lng: -98.4936 },
  { city: 'Dallas',         state: 'Texas',         stateAbbr: 'TX', lat: 32.7767, lng: -96.7970 },
  { city: 'Austin',         state: 'Texas',         stateAbbr: 'TX', lat: 30.2672, lng: -97.7431 },
  { city: 'Fort Worth',     state: 'Texas',         stateAbbr: 'TX', lat: 32.7555, lng: -97.3308 },
  { city: 'El Paso',        state: 'Texas',         stateAbbr: 'TX', lat: 31.7619, lng: -106.4850 },
  { city: 'Arlington',      state: 'Texas',         stateAbbr: 'TX', lat: 32.7357, lng: -97.1081 },
  { city: 'Corpus Christi', state: 'Texas',         stateAbbr: 'TX', lat: 27.8006, lng: -97.3964 },
  { city: 'Plano',          state: 'Texas',         stateAbbr: 'TX', lat: 33.0198, lng: -96.6989 },
  { city: 'Laredo',         state: 'Texas',         stateAbbr: 'TX', lat: 27.5306, lng: -99.4803 },
  { city: 'Lubbock',        state: 'Texas',         stateAbbr: 'TX', lat: 33.5779, lng: -101.8552 },
  { city: 'Garland',        state: 'Texas',         stateAbbr: 'TX', lat: 32.9126, lng: -96.6389 },
  { city: 'Irving',         state: 'Texas',         stateAbbr: 'TX', lat: 32.8140, lng: -96.9489 },
  { city: 'Amarillo',       state: 'Texas',         stateAbbr: 'TX', lat: 35.2220, lng: -101.8313 },
  { city: 'Grand Prairie',  state: 'Texas',         stateAbbr: 'TX', lat: 32.7460, lng: -96.9978 },
  { city: 'McKinney',       state: 'Texas',         stateAbbr: 'TX', lat: 33.1972, lng: -96.6397 },
  { city: 'Frisco',         state: 'Texas',         stateAbbr: 'TX', lat: 33.1507, lng: -96.8236 },
  { city: 'Brownsville',    state: 'Texas',         stateAbbr: 'TX', lat: 25.9017, lng: -97.4975 },
  { city: 'Pasadena',       state: 'Texas',         stateAbbr: 'TX', lat: 29.6911, lng: -95.2091 },
  { city: 'Killeen',        state: 'Texas',         stateAbbr: 'TX', lat: 31.1171, lng: -97.7278 },
  { city: 'McAllen',        state: 'Texas',         stateAbbr: 'TX', lat: 26.2034, lng: -98.2300 },
  { city: 'Mesquite',       state: 'Texas',         stateAbbr: 'TX', lat: 32.7668, lng: -96.5992 },
  { city: 'Midland',        state: 'Texas',         stateAbbr: 'TX', lat: 31.9974, lng: -102.0779 },
  { city: 'Waco',           state: 'Texas',         stateAbbr: 'TX', lat: 31.5493, lng: -97.1467 },
  { city: 'Carrollton',     state: 'Texas',         stateAbbr: 'TX', lat: 32.9537, lng: -96.8903 },
  { city: 'Denton',         state: 'Texas',         stateAbbr: 'TX', lat: 33.2148, lng: -97.1331 },
  { city: 'Abilene',        state: 'Texas',         stateAbbr: 'TX', lat: 32.4487, lng: -99.7331 },
  { city: 'Round Rock',     state: 'Texas',         stateAbbr: 'TX', lat: 30.5083, lng: -97.6789 },
  { city: 'Beaumont',       state: 'Texas',         stateAbbr: 'TX', lat: 30.0802, lng: -94.1266 },
  { city: 'Odessa',         state: 'Texas',         stateAbbr: 'TX', lat: 31.8457, lng: -102.3676 },
  { city: 'Richardson',     state: 'Texas',         stateAbbr: 'TX', lat: 32.9483, lng: -96.7299 },
  { city: 'Pearland',       state: 'Texas',         stateAbbr: 'TX', lat: 29.5635, lng: -95.2860 },
  // Utah
  { city: 'Salt Lake City', state: 'Utah',          stateAbbr: 'UT', lat: 40.7608, lng: -111.8910 },
  { city: 'West Valley City', state: 'Utah',        stateAbbr: 'UT', lat: 40.6916, lng: -112.0010 },
  { city: 'Provo',          state: 'Utah',          stateAbbr: 'UT', lat: 40.2338, lng: -111.6585 },
  { city: 'West Jordan',    state: 'Utah',          stateAbbr: 'UT', lat: 40.6097, lng: -111.9391 },
  { city: 'Orem',           state: 'Utah',          stateAbbr: 'UT', lat: 40.2969, lng: -111.6946 },
  { city: 'Sandy',          state: 'Utah',          stateAbbr: 'UT', lat: 40.5649, lng: -111.8389 },
  { city: 'St. George',     state: 'Utah',          stateAbbr: 'UT', lat: 37.1041, lng: -113.5841 },
  { city: 'Ogden',          state: 'Utah',          stateAbbr: 'UT', lat: 41.2230, lng: -111.9738 },
  { city: 'Layton',         state: 'Utah',          stateAbbr: 'UT', lat: 41.0602, lng: -111.9711 },
  // Virginia
  { city: 'Virginia Beach', state: 'Virginia',      stateAbbr: 'VA', lat: 36.8529, lng: -75.9780 },
  { city: 'Norfolk',        state: 'Virginia',      stateAbbr: 'VA', lat: 36.8508, lng: -76.2859 },
  { city: 'Chesapeake',     state: 'Virginia',      stateAbbr: 'VA', lat: 36.7682, lng: -76.2875 },
  { city: 'Richmond',       state: 'Virginia',      stateAbbr: 'VA', lat: 37.5407, lng: -77.4360 },
  { city: 'Newport News',   state: 'Virginia',      stateAbbr: 'VA', lat: 37.0871, lng: -76.4730 },
  { city: 'Alexandria',     state: 'Virginia',      stateAbbr: 'VA', lat: 38.8048, lng: -77.0469 },
  { city: 'Hampton',        state: 'Virginia',      stateAbbr: 'VA', lat: 37.0299, lng: -76.3452 },
  { city: 'Roanoke',        state: 'Virginia',      stateAbbr: 'VA', lat: 37.2710, lng: -79.9414 },
  // Washington
  { city: 'Seattle',        state: 'Washington',    stateAbbr: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Spokane',        state: 'Washington',    stateAbbr: 'WA', lat: 47.6588, lng: -117.4260 },
  { city: 'Tacoma',         state: 'Washington',    stateAbbr: 'WA', lat: 47.2529, lng: -122.4443 },
  { city: 'Vancouver',      state: 'Washington',    stateAbbr: 'WA', lat: 45.6387, lng: -122.6615 },
  { city: 'Bellevue',       state: 'Washington',    stateAbbr: 'WA', lat: 47.6101, lng: -122.2015 },
  { city: 'Kirkland',       state: 'Washington',    stateAbbr: 'WA', lat: 47.6815, lng: -122.2087 },
  { city: 'Renton',         state: 'Washington',    stateAbbr: 'WA', lat: 47.4829, lng: -122.2171 },
  { city: 'Redmond',        state: 'Washington',    stateAbbr: 'WA', lat: 47.6740, lng: -122.1215 },
  { city: 'Everett',        state: 'Washington',    stateAbbr: 'WA', lat: 47.9790, lng: -122.2021 },
  { city: 'Bellingham',     state: 'Washington',    stateAbbr: 'WA', lat: 48.7519, lng: -122.4787 },
  // West Virginia
  { city: 'Charleston',     state: 'West Virginia', stateAbbr: 'WV', lat: 38.3498, lng: -81.6326 },
  { city: 'Huntington',     state: 'West Virginia', stateAbbr: 'WV', lat: 38.4193, lng: -82.4452 },
  { city: 'Morgantown',     state: 'West Virginia', stateAbbr: 'WV', lat: 39.6295, lng: -79.9559 },
  // Wisconsin
  { city: 'Milwaukee',      state: 'Wisconsin',     stateAbbr: 'WI', lat: 43.0389, lng: -87.9065 },
  { city: 'Madison',        state: 'Wisconsin',     stateAbbr: 'WI', lat: 43.0731, lng: -89.4012 },
  { city: 'Green Bay',      state: 'Wisconsin',     stateAbbr: 'WI', lat: 44.5133, lng: -88.0133 },
  { city: 'Kenosha',        state: 'Wisconsin',     stateAbbr: 'WI', lat: 42.5847, lng: -87.8212 },
  { city: 'Racine',         state: 'Wisconsin',     stateAbbr: 'WI', lat: 42.7261, lng: -87.7829 },
  { city: 'Appleton',       state: 'Wisconsin',     stateAbbr: 'WI', lat: 44.2619, lng: -88.4154 },
  // Wyoming
  { city: 'Cheyenne',       state: 'Wyoming',       stateAbbr: 'WY', lat: 41.1400, lng: -104.8202 },
  { city: 'Casper',         state: 'Wyoming',       stateAbbr: 'WY', lat: 42.8501, lng: -106.3252 },
  // DC
  { city: 'Washington',     state: 'District of Columbia', stateAbbr: 'DC', lat: 38.9072, lng: -77.0369 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Group cities by state for efficient API usage (one call per state)
function groupByState(cities: typeof CITIES) {
  const map = new Map<string, typeof CITIES>()
  for (const city of cities) {
    const list = map.get(city.state) || []
    list.push(city)
    map.set(city.state, list)
  }
  return map
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Starting city population — ${CITIES.length} cities across ${new Set(CITIES.map(c => c.state)).size} states\n`)

  const byState = groupByState(CITIES)
  let totalProcessed = 0
  let totalInserted = 0

  for (const [state, stateCities] of byState) {
    const fips = STATE_FIPS[state]
    if (!fips) {
      console.warn(`  Skipping ${state} — no FIPS code`)
      continue
    }

    console.log(`\nFetching ACS data for ${state} (${stateCities.length} cities)...`)

    try {
      // One Census API call per state — fetch all places (retry up to 3x on failure)
      const url = `${CENSUS_BASE}?get=NAME,${VARIABLES}&for=place:*&in=state:${fips}&key=${CENSUS_KEY}`
      let res: Response | null = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          res = await fetch(url)
          if (res.ok) break
          console.warn(`  Attempt ${attempt} failed for ${state}: ${res.status} — waiting ${attempt * 2}s...`)
          await sleep(attempt * 2000)
        } catch (fetchErr) {
          console.warn(`  Attempt ${attempt} fetch error for ${state} — waiting ${attempt * 2}s...`)
          await sleep(attempt * 2000)
        }
      }

      if (!res || !res.ok) {
        console.error(`  Skipping ${state} after 3 failed attempts`)
        await sleep(1000)
        continue
      }

      const raw: string[][] = await res.json()
      const headers = raw[0]

      // Build lookup: city name (lowercase) → data row
      const placeMap = new Map<string, Record<string, string>>()
      for (const row of raw.slice(1)) {
        const data: Record<string, string> = {}
        headers.forEach((h, i) => { data[h] = row[i] })
        // Census NAME format: "Austin city, Texas"
        const namePart = row[0].toLowerCase().split(',')[0] // "austin city"
        // Remove suffix (city, town, village, etc.)
        const cleanName = namePart.replace(/ (city|town|village|borough|municipality|urban district|consolidated government|metropolitan government|charter township|township|census designated place|cdp)$/i, '').trim()
        placeMap.set(cleanName, data)
      }

      // Match each city in our list
      for (const cityEntry of stateCities) {
        totalProcessed++
        const cityKey = cityEntry.city.toLowerCase()

        // Try exact match first, then partial
        const data = placeMap.get(cityKey) || placeMap.get(cityKey.replace(/\bst\.\s/i, 'saint '))

        if (!data) {
          console.log(`  [${totalProcessed}/${CITIES.length}] Not found: ${cityEntry.city}, ${state}`)
          continue
        }

        const population = parseInt(data['B01003_001E']) || null
        const rawIncome = parseInt(data['B19013_001E'])
        // Census uses large negative sentinel values (e.g. -666666666) for missing data
        const income = rawIncome > 0 ? rawIncome : null
        const age = parseFloat(data['B01002_001E']) || null
        const employed = parseInt(data['B23025_004E']) || 0
        const unemployed = parseInt(data['B23025_005E']) || 0
        const laborForce = employed + unemployed
        const unemploymentRate = laborForce > 0 ? parseFloat(((unemployed / laborForce) * 100).toFixed(2)) : null
        const rent = parseInt(data['B25058_001E']) || null
        const bachelors = parseInt(data['B15003_022E']) || 0
        const bachelorPct = population && population > 0 ? parseFloat(((bachelors / population) * 100).toFixed(2)) : null
        const renterOccupied = parseInt(data['B25003_003E']) || 0
        const totalHousing = parseInt(data['B25003_001E']) || 0
        const renterPct = totalHousing > 0 ? parseFloat(((renterOccupied / totalHousing) * 100).toFixed(2)) : null
        const notCitizen = parseInt(data['B05001_006E']) || 0
        const foreignBornPct = population && population > 0 ? parseFloat(((notCitizen / population) * 100).toFixed(2)) : null

        const record = {
          city: cityEntry.city,
          state: cityEntry.state,
          state_abbr: cityEntry.stateAbbr,
          population,
          median_household_income: income,
          median_age: age,
          unemployment_rate: unemploymentRate,
          median_rent: rent,
          bachelor_degree_pct: bachelorPct,
          renter_pct: renterPct,
          foreign_born_pct: foreignBornPct,
          latitude: cityEntry.lat,
          longitude: cityEntry.lng,
          last_updated: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('cities')
          .upsert(record, { onConflict: 'city,state' })

        if (error) {
          console.error(`  Error upserting ${cityEntry.city}: ${error.message}`)
        } else {
          totalInserted++
          console.log(`  [${totalProcessed}/${CITIES.length}] ${cityEntry.city}, ${state} — income: $${income?.toLocaleString()}, age: ${age}, unemployed: ${unemploymentRate}%`)
        }
      }

      // Rate limit between states
      await sleep(200)

    } catch (err) {
      console.error(`  Failed for ${state}:`, err)
      await sleep(500)
    }
  }

  console.log(`\nDone. Processed: ${totalProcessed} | Inserted/Updated: ${totalInserted} | Skipped: ${totalProcessed - totalInserted}`)
}

main().catch(console.error)
