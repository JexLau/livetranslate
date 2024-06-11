type LocationName = string
type PlaceID = string
type Reference = string
type PlaceName = string
type GURL = string
type LocationType = string
type Address = string
type CompleteAddress = string
type OpeningHours = [
  string, // Day of the week, e.g., "Friday"
  string[], // Array of time ranges, e.g., ["10 AM–9 PM"]
  null, // Placeholder for some unspecified data
  null, // Placeholder for some unspecified data
  string, // Date, e.g., "2023-10-27"
  number, // Some numeric value
  number[][][], // Nested array representing time ranges, e.g., [[10, 0, 21, 0]]
  number // Some numeric value
];

export type LocationDetails = [
  LocationName, // Location Name
  [
    null, null, null, null, null, null, null, null,
    PlaceID, // Place ID
    Reference, // Reference
    null, null, null,
    [
      PlaceName, // Place Name
      null, null, null
    ],
    null, null, null, null, null,
    [
      null, null, number, number
    ],
    GURL, // URL
    LocationName, // Location Name
    null,
    [LocationType], // Location Types
    Address, // Address
    null, null, null,
    CompleteAddress, // Complete Address
    null, null, null, null, null,
    [
      [
        [
          [
            [null, null, null, null, null, [null, null, null, 0, 0], [null, null, null, 1, 0]], // Unknown structure
            [null, null, null, null, [null, 0, 10], [null, 0, 20]] // Unknown structure
          ],
          [
            [null, null, null, null, [null, null, null, 1, 0], [null, null, null, 6, 0]], // Unknown structure
            [null, null, null, null, [null, 0, 10], [null, 0, 21]] // Unknown structure
          ],
          [
            [null, null, null, null, [null, null, null, 6, 0], [null, null, null, 7, 0]], // Unknown structure
            [null, null, null, null, [null, 0, 10], [null, 0, 20]] // Unknown structure
          ]
        ]
      ],
      null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
      [
        [
          [1], "Favorites", null, 1, null, null, null, null, null, null, "0ahUKEwimmO_0loeCAxWUbd4KHYUgC-sQwaQDCCAoAA"
        ],
        [
          [2], "Want to go", null, 1, null, null, null, null, null, null, "0ahUKEwimmO_0loeCAxWUbd4KHYUgC-sQwaQDCCEoAQ"
        ],
        [
          [7], "Travel plans", null, 1, null, null, null, null, null, null, "0ahUKEwimmO_0loeCAxWUbd4KHYUgC-sQwaQDCCIoAg"
        ],
        [
          [4], "Starred places", null, 1, null, null, null, null, null, null, "0ahUKEwimmO_0loeCAxWUbd4KHYUgC-sQwaQDCCMoAw"
        ]
      ],
      null, null, "0ahUKEwimmO_0loeCAxWUbd4KHYUgC-sQ0JcGCB8oEg"
    ],
    null,
    string,
    null, null,
    string, // "Asia/Tokyo"
    null, null, null,
    [
      null, OpeningHours[]
    ]
  ]
];


export interface IMapDataWithLocal {}

export interface IMapDataWithFormat {
  Name: string;
  Fulladdress: string;
  Street: string;
  Municipality: string;
  Categories: string;
  Phone: string;
  Phones: string;
  Claimed: boolean;
  "Review Count": string;
  "Review URL": string;
  "Average Rating": string;
  "Live Translate URL": string;
  Latitude: string;
  Longitude: string;
  Website: string;
  Domain: string;
  "Opening Hours": string | string[];
  "Featured Image": string;
  "Cid": string;
  "Place Id": string;
  "Bing Knowledge URL"?: string;
  "Kgmid"?: string;
  "Plus Code"?: string;
  "Email"?: string;
  "Social Medias"?: string;
  // 其他扩展字段，比如从Social Medias拆分出来的字段
  [key: string]: string | string[] | boolean | undefined;
}