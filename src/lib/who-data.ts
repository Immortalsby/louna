/**
 * WHO Child Growth Standards - LMS reference data for girls 0-24 months.
 *
 * Sources:
 * - Weight-for-age: WHO Child Growth Standards (2006), Table: wfa_girls_0_5_zscores
 * - Length-for-age: WHO Child Growth Standards (2006), Table: lhfa_girls_0_2_zscores
 * - Head circumference-for-age: WHO Child Growth Standards (2007), Table: hcfa_girls_0_5_zscores
 *
 * L = Box-Cox power, M = Median, S = Coefficient of variation
 */

export type LMSEntry = {
  month: number;
  L: number;
  M: number;
  S: number;
};

// ---------------------------------------------------------------------------
// Weight-for-age girls 0-24 months (WHO 2006)
// ---------------------------------------------------------------------------
export const weightForAge: LMSEntry[] = [
  { month: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { month: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { month: 2, L: 0.0962, M: 5.1282, S: 0.13 },
  { month: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
  { month: 4, L: -0.005, M: 6.4237, S: 0.12402 },
  { month: 5, L: -0.043, M: 6.8985, S: 0.12274 },
  { month: 6, L: -0.0756, M: 7.297, S: 0.12204 },
  { month: 7, L: -0.1039, M: 7.6422, S: 0.12178 },
  { month: 8, L: -0.1288, M: 7.9487, S: 0.12181 },
  { month: 9, L: -0.1507, M: 8.2254, S: 0.12199 },
  { month: 10, L: -0.17, M: 8.48, S: 0.12223 },
  { month: 11, L: -0.1872, M: 8.7192, S: 0.12247 },
  { month: 12, L: -0.2024, M: 8.9481, S: 0.12268 },
  { month: 13, L: -0.2158, M: 9.1699, S: 0.12283 },
  { month: 14, L: -0.2278, M: 9.387, S: 0.12294 },
  { month: 15, L: -0.2384, M: 9.6008, S: 0.12299 },
  { month: 16, L: -0.2478, M: 9.8124, S: 0.12303 },
  { month: 17, L: -0.2562, M: 10.0226, S: 0.12306 },
  { month: 18, L: -0.2637, M: 10.2315, S: 0.12309 },
  { month: 19, L: -0.2703, M: 10.4393, S: 0.12315 },
  { month: 20, L: -0.2762, M: 10.6464, S: 0.12323 },
  { month: 21, L: -0.2815, M: 10.8534, S: 0.12335 },
  { month: 22, L: -0.2862, M: 11.0608, S: 0.1235 },
  { month: 23, L: -0.2903, M: 11.2688, S: 0.12369 },
  { month: 24, L: -0.2941, M: 11.4775, S: 0.1239 },
];

// ---------------------------------------------------------------------------
// Length-for-age girls 0-24 months (WHO 2006)
// ---------------------------------------------------------------------------
export const lengthForAge: LMSEntry[] = [
  { month: 0, L: 1, M: 49.1477, S: 0.0379 },
  { month: 1, L: 1, M: 53.6872, S: 0.03641 },
  { month: 2, L: 1, M: 57.0673, S: 0.03568 },
  { month: 3, L: 1, M: 59.8029, S: 0.0352 },
  { month: 4, L: 1, M: 62.0899, S: 0.03486 },
  { month: 5, L: 1, M: 64.0301, S: 0.03463 },
  { month: 6, L: 1, M: 65.7311, S: 0.03448 },
  { month: 7, L: 1, M: 67.2873, S: 0.03441 },
  { month: 8, L: 1, M: 68.7498, S: 0.0344 },
  { month: 9, L: 1, M: 70.1435, S: 0.03444 },
  { month: 10, L: 1, M: 71.4818, S: 0.03452 },
  { month: 11, L: 1, M: 72.771, S: 0.03464 },
  { month: 12, L: 1, M: 74.015, S: 0.03479 },
  { month: 13, L: 1, M: 75.2176, S: 0.03496 },
  { month: 14, L: 1, M: 76.3817, S: 0.03514 },
  { month: 15, L: 1, M: 77.5099, S: 0.03534 },
  { month: 16, L: 1, M: 78.6055, S: 0.03555 },
  { month: 17, L: 1, M: 79.671, S: 0.03576 },
  { month: 18, L: 1, M: 80.7079, S: 0.03598 },
  { month: 19, L: 1, M: 81.7182, S: 0.0362 },
  { month: 20, L: 1, M: 82.7036, S: 0.03643 },
  { month: 21, L: 1, M: 83.6654, S: 0.03666 },
  { month: 22, L: 1, M: 84.604, S: 0.03688 },
  { month: 23, L: 1, M: 85.5202, S: 0.03711 },
  { month: 24, L: 1, M: 86.4153, S: 0.03734 },
];

// ---------------------------------------------------------------------------
// Head-circumference-for-age girls 0-24 months (WHO 2007)
// ---------------------------------------------------------------------------
export const headCircForAge: LMSEntry[] = [
  { month: 0, L: 1, M: 33.8787, S: 0.03496 },
  { month: 1, L: 1, M: 36.5463, S: 0.03228 },
  { month: 2, L: 1, M: 38.2521, S: 0.03107 },
  { month: 3, L: 1, M: 39.5328, S: 0.03048 },
  { month: 4, L: 1, M: 40.5817, S: 0.03016 },
  { month: 5, L: 1, M: 41.459, S: 0.02997 },
  { month: 6, L: 1, M: 42.1995, S: 0.02983 },
  { month: 7, L: 1, M: 42.829, S: 0.02971 },
  { month: 8, L: 1, M: 43.3671, S: 0.0296 },
  { month: 9, L: 1, M: 43.83, S: 0.02949 },
  { month: 10, L: 1, M: 44.2319, S: 0.02939 },
  { month: 11, L: 1, M: 44.5844, S: 0.0293 },
  { month: 12, L: 1, M: 44.8965, S: 0.02922 },
  { month: 13, L: 1, M: 45.1752, S: 0.02914 },
  { month: 14, L: 1, M: 45.4265, S: 0.02907 },
  { month: 15, L: 1, M: 45.6551, S: 0.029 },
  { month: 16, L: 1, M: 45.865, S: 0.02894 },
  { month: 17, L: 1, M: 46.0598, S: 0.02888 },
  { month: 18, L: 1, M: 46.2424, S: 0.02882 },
  { month: 19, L: 1, M: 46.4152, S: 0.02877 },
  { month: 20, L: 1, M: 46.5801, S: 0.02872 },
  { month: 21, L: 1, M: 46.739, S: 0.02868 },
  { month: 22, L: 1, M: 46.8929, S: 0.02864 },
  { month: 23, L: 1, M: 47.0427, S: 0.0286 },
  { month: 24, L: 1, M: 47.1889, S: 0.02857 },
];

// ---------------------------------------------------------------------------
// WHO Weight-for-age boys 0-24 months (WHO 2006)
// ---------------------------------------------------------------------------
export const weightForAgeBoys: LMSEntry[] = [
  { month: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { month: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { month: 2, L: 0.197, M: 5.5675, S: 0.12385 },
  { month: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { month: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { month: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
  { month: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  { month: 7, L: 0.1134, M: 8.297, S: 0.10902 },
  { month: 8, L: 0.1021, M: 8.6151, S: 0.10882 },
  { month: 9, L: 0.0917, M: 8.9014, S: 0.10881 },
  { month: 10, L: 0.082, M: 9.1649, S: 0.10891 },
  { month: 11, L: 0.073, M: 9.4122, S: 0.10906 },
  { month: 12, L: 0.0644, M: 9.6479, S: 0.10925 },
  { month: 13, L: 0.0563, M: 9.8749, S: 0.10949 },
  { month: 14, L: 0.0487, M: 10.0953, S: 0.10976 },
  { month: 15, L: 0.0413, M: 10.3108, S: 0.11007 },
  { month: 16, L: 0.0343, M: 10.5228, S: 0.11041 },
  { month: 17, L: 0.0275, M: 10.7319, S: 0.11079 },
  { month: 18, L: 0.0211, M: 10.9385, S: 0.11119 },
  { month: 19, L: 0.0148, M: 11.143, S: 0.11164 },
  { month: 20, L: 0.0087, M: 11.3462, S: 0.11211 },
  { month: 21, L: 0.0029, M: 11.5486, S: 0.11261 },
  { month: 22, L: -0.0028, M: 11.7504, S: 0.11314 },
  { month: 23, L: -0.0083, M: 11.9514, S: 0.11369 },
  { month: 24, L: -0.0137, M: 12.1515, S: 0.11426 },
];

// ---------------------------------------------------------------------------
// Length-for-age boys 0-24 months (WHO 2006)
// ---------------------------------------------------------------------------
export const lengthForAgeBoys: LMSEntry[] = [
  { month: 0, L: 1, M: 49.8842, S: 0.03795 },
  { month: 1, L: 1, M: 54.7244, S: 0.03557 },
  { month: 2, L: 1, M: 58.4249, S: 0.03424 },
  { month: 3, L: 1, M: 61.4292, S: 0.03328 },
  { month: 4, L: 1, M: 63.886, S: 0.03257 },
  { month: 5, L: 1, M: 65.9026, S: 0.03204 },
  { month: 6, L: 1, M: 67.6236, S: 0.03165 },
  { month: 7, L: 1, M: 69.1645, S: 0.03139 },
  { month: 8, L: 1, M: 70.5994, S: 0.03124 },
  { month: 9, L: 1, M: 71.9687, S: 0.03117 },
  { month: 10, L: 1, M: 73.2812, S: 0.03118 },
  { month: 11, L: 1, M: 74.5388, S: 0.03125 },
  { month: 12, L: 1, M: 75.7488, S: 0.03137 },
  { month: 13, L: 1, M: 76.9186, S: 0.03154 },
  { month: 14, L: 1, M: 78.0497, S: 0.03174 },
  { month: 15, L: 1, M: 79.1458, S: 0.03197 },
  { month: 16, L: 1, M: 80.2113, S: 0.03222 },
  { month: 17, L: 1, M: 81.2487, S: 0.03248 },
  { month: 18, L: 1, M: 82.2587, S: 0.03275 },
  { month: 19, L: 1, M: 83.2418, S: 0.03303 },
  { month: 20, L: 1, M: 84.1996, S: 0.03331 },
  { month: 21, L: 1, M: 85.1348, S: 0.0336 },
  { month: 22, L: 1, M: 86.0477, S: 0.03388 },
  { month: 23, L: 1, M: 86.941, S: 0.03417 },
  { month: 24, L: 1, M: 87.8161, S: 0.03446 },
];

// ---------------------------------------------------------------------------
// Head-circumference-for-age boys 0-24 months (WHO 2007)
// ---------------------------------------------------------------------------
export const headCircForAgeBoys: LMSEntry[] = [
  { month: 0, L: 1, M: 34.4618, S: 0.03686 },
  { month: 1, L: 1, M: 37.2759, S: 0.03133 },
  { month: 2, L: 1, M: 39.1285, S: 0.02997 },
  { month: 3, L: 1, M: 40.5135, S: 0.02918 },
  { month: 4, L: 1, M: 41.6317, S: 0.02868 },
  { month: 5, L: 1, M: 42.5576, S: 0.02837 },
  { month: 6, L: 1, M: 43.3306, S: 0.02817 },
  { month: 7, L: 1, M: 43.9803, S: 0.02804 },
  { month: 8, L: 1, M: 44.53, S: 0.02796 },
  { month: 9, L: 1, M: 44.9998, S: 0.02792 },
  { month: 10, L: 1, M: 45.4051, S: 0.0279 },
  { month: 11, L: 1, M: 45.757, S: 0.0279 },
  { month: 12, L: 1, M: 46.0661, S: 0.02791 },
  { month: 13, L: 1, M: 46.3395, S: 0.02793 },
  { month: 14, L: 1, M: 46.5844, S: 0.02795 },
  { month: 15, L: 1, M: 46.806, S: 0.02798 },
  { month: 16, L: 1, M: 47.0088, S: 0.02802 },
  { month: 17, L: 1, M: 47.1962, S: 0.02806 },
  { month: 18, L: 1, M: 47.3711, S: 0.0281 },
  { month: 19, L: 1, M: 47.5357, S: 0.02815 },
  { month: 20, L: 1, M: 47.6919, S: 0.0282 },
  { month: 21, L: 1, M: 47.8408, S: 0.02825 },
  { month: 22, L: 1, M: 47.9833, S: 0.0283 },
  { month: 23, L: 1, M: 48.1201, S: 0.02836 },
  { month: 24, L: 1, M: 48.2515, S: 0.02842 },
];

// ---------------------------------------------------------------------------
// Percentile calculation using the LMS method
// ---------------------------------------------------------------------------
type MeasurementType = "weight" | "length" | "head";
type Gender = "girl" | "boy";

/**
 * Standard normal CDF approximation (Abramowitz & Stegun, formula 26.2.17).
 * Accurate to about 1.5e-7.
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Get the LMS dataset for the given type and gender.
 */
function getDataset(type: MeasurementType, gender: Gender): LMSEntry[] {
  if (gender === "girl") {
    switch (type) {
      case "weight":
        return weightForAge;
      case "length":
        return lengthForAge;
      case "head":
        return headCircForAge;
    }
  } else {
    switch (type) {
      case "weight":
        return weightForAgeBoys;
      case "length":
        return lengthForAgeBoys;
      case "head":
        return headCircForAgeBoys;
    }
  }
}

/**
 * Linearly interpolate LMS values for a fractional month.
 */
function interpolateLMS(
  data: LMSEntry[],
  month: number
): { L: number; M: number; S: number } {
  if (month <= data[0].month) return data[0];
  if (month >= data[data.length - 1].month) return data[data.length - 1];

  let lower = data[0];
  let upper = data[data.length - 1];
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].month <= month && data[i + 1].month >= month) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }

  if (lower.month === upper.month) return lower;

  const frac = (month - lower.month) / (upper.month - lower.month);
  return {
    L: lower.L + frac * (upper.L - lower.L),
    M: lower.M + frac * (upper.M - lower.M),
    S: lower.S + frac * (upper.S - lower.S),
  };
}

/**
 * Calculate the percentile for a given measurement using WHO LMS method.
 *
 * @param measurement - The measured value (kg, cm, or cm)
 * @param month - Age in months (can be fractional)
 * @param type - "weight" | "length" | "head"
 * @param gender - "girl" | "boy" (defaults to "girl")
 * @returns Percentile as a number between 0 and 100
 */
export function calculatePercentile(
  measurement: number,
  month: number,
  type: MeasurementType,
  gender: Gender = "girl"
): number {
  const data = getDataset(type, gender);
  const { L, M, S } = interpolateLMS(data, month);

  let zScore: number;
  if (L === 0) {
    zScore = Math.log(measurement / M) / S;
  } else {
    zScore = (Math.pow(measurement / M, L) - 1) / (L * S);
  }

  return Math.round(normalCDF(zScore) * 1000) / 10;
}

/**
 * Z-score to measurement value using LMS.
 */
function zToValue(z: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return M * Math.exp(S * z);
  }
  return M * Math.pow(1 + L * S * z, 1 / L);
}

/**
 * Standard percentile Z-scores.
 */
const PERCENTILE_Z: Record<string, number> = {
  p3: -1.88079,
  p15: -1.03643,
  p50: 0,
  p85: 1.03643,
  p97: 1.88079,
};

export type PercentileCurves = {
  p3: { month: number; value: number }[];
  p15: { month: number; value: number }[];
  p50: { month: number; value: number }[];
  p85: { month: number; value: number }[];
  p97: { month: number; value: number }[];
};

/**
 * Generate percentile curves for charting.
 *
 * @param type - "weight" | "length" | "head"
 * @param gender - "girl" | "boy" (defaults to "girl")
 * @returns Object with p3, p15, p50, p85, p97 arrays
 */
export function getPercentileCurves(
  type: MeasurementType,
  gender: Gender = "girl"
): PercentileCurves {
  const data = getDataset(type, gender);

  const curves: PercentileCurves = {
    p3: [],
    p15: [],
    p50: [],
    p85: [],
    p97: [],
  };

  for (const entry of data) {
    const { L, M, S, month } = entry;
    for (const [key, z] of Object.entries(PERCENTILE_Z)) {
      const value =
        Math.round(zToValue(z, L, M, S) * 100) / 100;
      curves[key as keyof PercentileCurves].push({ month, value });
    }
  }

  return curves;
}
