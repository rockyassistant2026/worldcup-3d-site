/**
 * World Cup team roster with country names, 3-letter codes, and brand color pairs.
 * Used for visual theming in team selection carousel and badge textures.
 * No real player data—just country metadata and colors for rendering.
 */

export interface TeamConfig {
  name: string;
  code: string; // 3-letter ISO country code
  colors: [string, string]; // [primary, secondary] hex colors for brand theming
}

export const TEAMS: TeamConfig[] = [
  {
    name: "Argentina",
    code: "ARG",
    colors: ["#1C4587", "#FFFFFF"],
  },
  {
    name: "Brazil",
    code: "BRA",
    colors: ["#FFD700", "#003893"],
  },
  {
    name: "France",
    code: "FRA",
    colors: ["#002395", "#FFFFFF"],
  },
  {
    name: "Germany",
    code: "DEU",
    colors: ["#000000", "#FFFFFF"],
  },
  {
    name: "Spain",
    code: "ESP",
    colors: ["#C60C30", "#FFC400"],
  },
  {
    name: "Italy",
    code: "ITA",
    colors: ["#009246", "#FFFFFF"],
  },
  {
    name: "Netherlands",
    code: "NLD",
    colors: ["#FF6600", "#FFFFFF"],
  },
  {
    name: "England",
    code: "ENG",
    colors: ["#FFFFFF", "#003399"],
  },
  {
    name: "Portugal",
    code: "PRT",
    colors: ["#CE1126", "#FFFFFF"],
  },
  {
    name: "Japan",
    code: "JPN",
    colors: ["#BC002D", "#FFFFFF"],
  },
  {
    name: "Mexico",
    code: "MEX",
    colors: ["#006847", "#FFFFFF"],
  },
  {
    name: "Australia",
    code: "AUS",
    colors: ["#FFD100", "#003399"],
  },
  {
    name: "South Korea",
    code: "KOR",
    colors: ["#C60C30", "#FFFFFF"],
  },
  {
    name: "Belgium",
    code: "BEL",
    colors: ["xFF0000", "#000000"],
  },
  {
    name: "Uruguay",
    code: "URY",
    colors: ["#001489", "#FFFFFF"],
  },
  {
    name: "Canada",
    code: "CAN",
    colors: ["#FF0000", "#FFFFFF"],
  },
];
