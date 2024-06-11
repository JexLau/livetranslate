export interface ConfigProps {
  name: string
  check: boolean
}

export const fileConfig = [
  { name: "Name", check: true },
  { name: "Fulladdress", check: true },
  // { name: "Street", check: true },
  // { name: "Municipality", check: true },
  // { name: "Categories", check: true },
  // { name: "SearchKeyword", check: true },
  // { name: "Amenities", check: true },
  { name: "Phone", check: true },
  // { name: "Phones", check: true },
  // { name: "Claimed", check: true },
  // { name: "Review Count", check: true },
  // { name: "Average Rating", check: true },
  // { name: "Review URL", check: true },
  { name: "Live Translate URL", check: true },
  { name: "Latitude", check: true },
  { name: "Longitude", check: true },
  { name: "Website", check: true },
  { name: "Domain", check: true },
  // { name: "Opening Hours", check: true },
  // { name: "Featured Image", check: true },
  // { name: "Cid", check: true },
  // { name: "Place Id", check: true },
]

export const fileProConfig = [
  // { name: "Kgmid", check: true },
  // { name: "Bing Knowledge URL", check: true },
  { name: "Email", check: true },
  { name: "Social Medias", check: true },
  // { name: "Plus Code", check: true },
  // { name: "Price", check: true },
  // { name: "Note", check: true },
  // { name: "Hotel Class", check: true },
]

export const getConfig = async () => {
  const result = await chrome.storage.sync.get("bingFileConfigV2");
  const config = result["bingFileConfigV2"]
  if (config && Object.keys(config).length > 0) {
    return config
  } else {
    return fileConfig
  }
}

export const getProConfig = async () => {
  const result = await chrome.storage.sync.get("bingFileProConfigV2");
  const config = result["bingFileProConfigV2"]
  if (config && Object.keys(config).length > 0) {
    return config
  } else {
    return fileProConfig
  }
}

export const saveConfig = async (config: ConfigProps[]) => {
  await chrome.storage.sync.set({ fileConfigV2: config })
}

export const saveProConfig = async (config: ConfigProps[]) => {
  await chrome.storage.sync.set({ fileProConfigV2: config })
}

// 价格页(产品页)
export const tiers = [
  {
    name: 'Free',
    id: 'tier-freelancer',
    href: '#',
    priceMonthly: '0',
    subDesc: '',
    description: 'Monthly leads export 1,000\nExport 15 records at a time',
    features: ['Custom export settings', 'Extract basic information', 'Extract phone numbers',
      'Extract reviews per place', 'Extract Website、Cid and Place Id'
    ],
    // test - 839140 / 0
    planId: 0,
    mostPopular: false,
  },
  {
    name: 'Pro(Yearly)',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '$9.9',
    description: 'Monthly leads export 100,000\n Export Unlimited records at a time',
    subDesc: 'Everything in Free plus:',
    features: [
      'Extract emails',
      'Extract social medias',
      'Extract Kgmid, Plus code, etc',
      'Automatic bulk extract (coming soon)',
    ],
    // planId: 839092,
    planId: 863135,
    mostPopular: true,
  },
  {
    name: 'Pro(Monthly)',
    id: 'tier-startup',
    href: '#',
    priceMonthly: '$19.9',
    description: 'Monthly leads export 100,000\n Export Unlimited records at a time',
    subDesc: 'Everything in Free plus:',
    features: [
      'Extract emails',
      'Extract social medias',
      'Extract Kgmid, Plus code, etc',
      'Automatic bulk extract (coming soon)',
    ],
    // planId: 839089,
    planId: 863134,
    mostPopular: false,
  },
]